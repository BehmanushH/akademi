import { createClient } from '@/lib/supabase/server'
import { getISOWeekYear, getWeekRange, formatDate } from '@/lib/date-utils'
import WeeklyReviewForm from '@/components/WeeklyReviewForm'
import type { WeeklyReview, Project, DailyLog } from '@/types'

export default async function WeeklyReviewPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { week, year } = getISOWeekYear()
  const { start, end } = getWeekRange(week, year)

  const startStr = formatDate(start, 'yyyy-MM-dd')
  const endStr = formatDate(end, 'yyyy-MM-dd')

  const [
    { data: currentReview },
    { data: allReviews },
    { data: projects },
    { data: thisWeekLogs },
  ] = await Promise.all([
    supabase.from('weekly_reviews').select('*').eq('user_id', user!.id).eq('week_number', week).eq('year', year).single(),
    supabase.from('weekly_reviews').select('*').eq('user_id', user!.id).order('year', { ascending: false }).order('week_number', { ascending: false }).limit(20),
    supabase.from('projects').select('id, title, color, status').eq('user_id', user!.id).neq('status', 'complete').order('sort_order'),
    supabase.from('daily_logs').select('*').eq('user_id', user!.id).gte('log_date', startStr).lte('log_date', endStr),
  ])

  const totalDeepWork = (thisWeekLogs ?? []).reduce((sum: number, l: any) => sum + (l.deep_work_hours ?? 0), 0)

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-title">Weekly Review</h1>
        <p className="text-text-muted text-sm">Week {week}, {year} · {formatDate(start, 'MMM d')} – {formatDate(end, 'MMM d')}</p>
      </div>

      <WeeklyReviewForm
        existingReview={currentReview as WeeklyReview | null}
        projects={(projects ?? []) as any[]}
        userId={user!.id}
        week={week}
        year={year}
        dateStart={startStr}
        dateEnd={endStr}
        totalDeepWork={totalDeepWork}
        weekLogs={(thisWeekLogs ?? []) as DailyLog[]}
      />

      {allReviews && allReviews.filter((r: any) => !(r.week_number === week && r.year === year)).length > 0 && (
        <section>
          <h2 className="section-title mb-3">Past Reviews</h2>
          <div className="space-y-3">
            {(allReviews as WeeklyReview[])
              .filter(r => !(r.week_number === week && r.year === year))
              .map(r => (
                <ReviewCard key={r.id} review={r} />
              ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ReviewCard({ review }: { review: WeeklyReview }) {
  return (
    <details className="card group">
      <summary className="flex items-center justify-between cursor-pointer list-none">
        <div>
          <p className="text-sm font-medium text-text-primary">
            Week {review.week_number}, {review.year}
            {review.date_start && review.date_end && (
              <span className="text-text-muted font-normal ml-2">
                {formatDate(review.date_start, 'MMM d')} – {formatDate(review.date_end, 'MMM d')}
              </span>
            )}
          </p>
          {review.next_week_goal && (
            <p className="text-xs text-text-muted mt-0.5">Goal: {review.next_week_goal}</p>
          )}
        </div>
        <span className="text-text-muted text-sm group-open:rotate-180 transition-transform">▾</span>
      </summary>
      <div className="mt-4 pt-4 border-t border-border space-y-3 text-sm">
        {review.wins && (
          <div>
            <p className="text-xs text-success uppercase tracking-wider mb-1">Wins</p>
            <p className="text-text-primary">{review.wins}</p>
          </div>
        )}
        {review.didnt_happen && (
          <div>
            <p className="text-xs text-warning uppercase tracking-wider mb-1">Didn&apos;t happen</p>
            <p className="text-text-primary">{review.didnt_happen}</p>
          </div>
        )}
        {review.total_deep_work_hours && (
          <p className="text-xs text-text-muted">Total deep work: {review.total_deep_work_hours}h</p>
        )}
      </div>
    </details>
  )
}
