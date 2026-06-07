-- Projects
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#d4a853',
  status TEXT DEFAULT 'on_track' CHECK (status IN ('on_track', 'slipping', 'blocked', 'complete')),
  progress_pct INTEGER DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  target_date DATE,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Milestones
CREATE TABLE milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Logs
CREATE TABLE daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  project_focus_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  completed_work TEXT,
  in_progress TEXT,
  blocked TEXT,
  blocked_reason TEXT,
  tomorrows_task TEXT,
  deep_work_hours NUMERIC(4,1) DEFAULT 0,
  energy_level INTEGER DEFAULT 3 CHECK (energy_level BETWEEN 1 AND 5),
  personal_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- Weekly Reviews
CREATE TABLE weekly_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  date_start DATE,
  date_end DATE,
  wins TEXT,
  didnt_happen TEXT,
  next_week_goal TEXT,
  project_updates JSONB DEFAULT '[]',
  total_deep_work_hours NUMERIC(5,1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_number, year)
);

-- Tasks
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ideas
CREATE TABLE ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly Planner
CREATE TABLE weekly_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  mon_type TEXT, mon_focus TEXT,
  tue_type TEXT, tue_focus TEXT,
  wed_type TEXT, wed_focus TEXT,
  thu_type TEXT, thu_focus TEXT,
  fri_type TEXT, fri_focus TEXT,
  sat_type TEXT, sat_focus TEXT,
  sun_type TEXT, sun_focus TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_number, year)
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users own their projects" ON projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their milestones" ON milestones FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their logs" ON daily_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their reviews" ON weekly_reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their tasks" ON tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their ideas" ON ideas FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their plans" ON weekly_plans FOR ALL USING (auth.uid() = user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER daily_logs_updated_at BEFORE UPDATE ON daily_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER weekly_reviews_updated_at BEFORE UPDATE ON weekly_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER weekly_plans_updated_at BEFORE UPDATE ON weekly_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
