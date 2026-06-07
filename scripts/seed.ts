/**
 * Seed script — populates Akademi with sample data so the dashboard looks complete on first launch.
 * Run: npx tsx scripts/seed.ts
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { subDays, format, addDays } from 'date-fns'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function today(offset = 0) {
  return format(offset < 0 ? subDays(new Date(), -offset) : addDays(new Date(), offset), 'yyyy-MM-dd')
}

async function main() {
  // Get the first user
  const { data: { users } } = await supabase.auth.admin.listUsers()
  if (!users || users.length === 0) {
    console.error('No users found. Create an account first, then run this script.')
    process.exit(1)
  }

  const userId = users[0].id
  console.log(`Seeding for user: ${users[0].email}`)

  // Projects
  const { data: projects } = await supabase.from('projects').insert([
    {
      user_id: userId,
      title: 'Dissertation Chapter 2',
      description: 'Literature review and theoretical framework for the main dissertation.',
      color: '#d4a853',
      status: 'on_track',
      progress_pct: 45,
      target_date: today(60),
      sort_order: 0,
    },
    {
      user_id: userId,
      title: 'Conference Paper — ICLS 2025',
      description: 'Empirical study on collaborative knowledge building in online communities.',
      color: '#4a9eed',
      status: 'slipping',
      progress_pct: 25,
      target_date: today(30),
      sort_order: 1,
    },
    {
      user_id: userId,
      title: 'Grant Proposal — SSHRC',
      description: 'Postdoctoral fellowship application for 2025-2027.',
      color: '#3d9970',
      status: 'on_track',
      progress_pct: 70,
      target_date: today(14),
      sort_order: 2,
    },
  ]).select()

  if (!projects) { console.error('Failed to insert projects'); process.exit(1) }
  console.log('✓ Projects created')

  const [p1, p2, p3] = projects

  // Milestones
  await supabase.from('milestones').insert([
    { project_id: p1.id, user_id: userId, title: 'Complete literature search', due_date: today(7) },
    { project_id: p1.id, user_id: userId, title: 'Draft theoretical framework', due_date: today(21) },
    { project_id: p2.id, user_id: userId, title: 'Finish data analysis', due_date: today(5), completed: false },
    { project_id: p2.id, user_id: userId, title: 'Submit to conference portal', due_date: today(29) },
    { project_id: p3.id, user_id: userId, title: 'Budget justification complete', due_date: today(3), completed: true, completed_at: new Date().toISOString() },
  ])
  console.log('✓ Milestones created')

  // Daily logs (last 7 days)
  const energyLevels = [3, 4, 2, 5, 4, 3, 4]
  const focusProjects = [p1.id, p1.id, p2.id, p3.id, p1.id, p3.id, p2.id]
  const workNotes = [
    'Reviewed 8 papers on social learning theory. Took detailed notes on Vygotsky\'s ZPD application.',
    'Drafted section 2.1 of literature review. About 800 words written.',
    'Ran initial coding pass on interview transcripts. Identified 4 major themes.',
    'Finished budget section of grant. Wrote 600 words on methodology.',
    'Read 5 more papers. Starting to see convergence in the literature.',
    'Revised research objectives based on supervisor feedback. Much clearer now.',
    'Analysed quantitative data. Found significant correlation (p < .05).',
  ]

  await supabase.from('daily_logs').insert(
    Array.from({ length: 7 }, (_, i) => ({
      user_id: userId,
      log_date: today(-(6 - i)),
      project_focus_id: focusProjects[i],
      completed_work: workNotes[i],
      in_progress: 'Continuing literature synthesis',
      tomorrows_task: workNotes[(i + 1) % 7].split('.')[0],
      deep_work_hours: 2 + (i % 3),
      energy_level: energyLevels[i],
    }))
  )
  console.log('✓ Daily logs created')

  // Tasks
  await supabase.from('tasks').insert([
    { user_id: userId, project_id: p1.id, title: 'Email Prof. Chen about chapter feedback', priority: 'high', due_date: today(1) },
    { user_id: userId, project_id: p2.id, title: 'Finish coding second interview batch', priority: 'high', due_date: today(3) },
    { user_id: userId, project_id: p3.id, title: 'Get supervisor to sign grant forms', priority: 'high', due_date: today(2) },
    { user_id: userId, project_id: p1.id, title: 'Read Johnson (2019) paper', priority: 'medium' },
    { user_id: userId, project_id: null, title: 'Book thesis committee meeting for March', priority: 'medium', due_date: today(7) },
    { user_id: userId, project_id: p2.id, title: 'Update conference paper abstract', priority: 'medium', due_date: today(5) },
    { user_id: userId, project_id: null, title: 'Renew library access card', priority: 'low' },
    { user_id: userId, project_id: p1.id, title: 'Review annotated bibliography', priority: 'low', completed: true, completed_at: new Date().toISOString() },
  ])
  console.log('✓ Tasks created')

  // Ideas
  await supabase.from('ideas').insert([
    { user_id: userId, project_id: p1.id, content: 'Could frame the theoretical chapter around three tensions rather than a linear progression — might make the argument more dynamic.', pinned: true },
    { user_id: userId, project_id: p2.id, content: 'Use epistemic network analysis to visualize discourse patterns — would make a stronger methodology contribution.' },
    { user_id: userId, project_id: null, content: 'Write a blog post about balancing PhD with parenting — could be therapeutic and might help others.' },
    { user_id: userId, project_id: p3.id, content: 'Apply Sfard\'s acquisition vs participation metaphors as a framing device in the grant proposal.' },
  ])
  console.log('✓ Ideas created')

  console.log('\n✅ Seed complete! Open the app to see your data.')
}

main().catch(err => { console.error(err); process.exit(1) })
