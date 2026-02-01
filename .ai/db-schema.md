# Database Schema - Supabase Setup

## Quick Start

Run this SQL in Supabase SQL Editor to set up all tables:

```sql
-- ================================
-- HABITS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) DEFAULT '✅',
  color VARCHAR(20) DEFAULT '#22c55e',
  target_days INTEGER[] DEFAULT '{1,2,3,4,5,6,7}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- HABIT LOGS (daily completions)
-- ================================
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  completed_at DATE NOT NULL,
  UNIQUE(habit_id, completed_at)
);

-- ================================
-- BOOKS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(100),
  total_pages INTEGER,
  current_page INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'want_to_read',
  started_at DATE,
  finished_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- WEEKLY DIGESTS (AI summaries)
-- ================================
CREATE TABLE IF NOT EXISTS weekly_digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- ROW LEVEL SECURITY (RLS)
-- ================================
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_digests ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY "Users own habits" ON habits 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users log own habits" ON habit_logs 
  FOR ALL USING (habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid()));

CREATE POLICY "Users own books" ON books 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own digests" ON weekly_digests 
  FOR ALL USING (auth.uid() = user_id);

-- ================================
-- INDEXES (performance)
-- ================================
CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(completed_at);
CREATE INDEX IF NOT EXISTS idx_books_user ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
```

## Table Descriptions

### habits
Stores user-defined habits with customizable icons and colors.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner (FK to auth.users) |
| name | VARCHAR(100) | Habit name |
| icon | VARCHAR(50) | Emoji icon |
| color | VARCHAR(20) | Hex color |
| target_days | INTEGER[] | Days of week (1-7) |
| created_at | TIMESTAMPTZ | Creation timestamp |

### habit_logs
Records daily habit completions for streak calculation.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| habit_id | UUID | FK to habits |
| completed_at | DATE | Completion date |

### books
Tracks reading list with progress.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner |
| title | VARCHAR(200) | Book title |
| author | VARCHAR(100) | Author name |
| total_pages | INTEGER | Total pages |
| current_page | INTEGER | Current progress |
| status | VARCHAR(20) | reading/completed/want_to_read/paused |
| started_at | DATE | Start date |
| finished_at | DATE | Completion date |

### weekly_digests
Stores AI-generated weekly summaries.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner |
| week_start | DATE | Week start date |
| content | TEXT | AI-generated summary |
