-- ============================================================
-- Fitness Tracker – Neon PostgreSQL Schema
-- Run this in Neon SQL Editor or psql
-- ============================================================

-- Users
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password      VARCHAR(255) NOT NULL,
  profile_picture VARCHAR(255),
  date_of_birth DATE,
  gender        VARCHAR(10) CHECK (gender IN ('male','female','other')),
  height_cm     NUMERIC(5,2),
  weight_kg     NUMERIC(5,2),
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- Workouts
CREATE TABLE IF NOT EXISTS workouts (
  id             SERIAL PRIMARY KEY,
  user_id        INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title          VARCHAR(150) NOT NULL,
  type           VARCHAR(100) NOT NULL,
  duration_mins  INT NOT NULL DEFAULT 0,
  calories_burned INT DEFAULT 0,
  notes          TEXT,
  workout_date   DATE NOT NULL,
  created_at     TIMESTAMP DEFAULT NOW()
);

-- Steps
CREATE TABLE IF NOT EXISTS steps (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step_count INT NOT NULL,
  step_date  DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, step_date)
);

-- Weight Logs
CREATE TABLE IF NOT EXISTS weight_logs (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight_kg  NUMERIC(5,2) NOT NULL,
  log_date   DATE NOT NULL,
  note       VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Goals
CREATE TABLE IF NOT EXISTS goals (
  id            SERIAL PRIMARY KEY,
  user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         VARCHAR(150) NOT NULL,
  category      VARCHAR(20) CHECK (category IN ('steps','weight','workout','calories','custom')) NOT NULL,
  target_value  NUMERIC(10,2) NOT NULL,
  current_value NUMERIC(10,2) DEFAULT 0,
  unit          VARCHAR(50),
  deadline      DATE,
  is_completed  BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- Friends
CREATE TABLE IF NOT EXISTS friends (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status     VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, friend_id)
);

-- Challenges
CREATE TABLE IF NOT EXISTS challenges (
  id           SERIAL PRIMARY KEY,
  creator_id   INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        VARCHAR(200) NOT NULL,
  description  TEXT,
  category     VARCHAR(20) CHECK (category IN ('steps','workout','calories','weight')) NOT NULL,
  target_value NUMERIC(10,2) NOT NULL,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Challenge Participation
CREATE TABLE IF NOT EXISTS challenge_participation (
  id           SERIAL PRIMARY KEY,
  challenge_id INT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  progress     NUMERIC(10,2) DEFAULT 0,
  joined_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE (challenge_id, user_id)
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(150) NOT NULL,
  description TEXT,
  badge_icon  VARCHAR(100) DEFAULT 'trophy',
  earned_at   TIMESTAMP DEFAULT NOW()
);

-- Progress Photos
CREATE TABLE IF NOT EXISTS progress_photos (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  photo_url   VARCHAR(255) NOT NULL,
  caption     VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message    TEXT NOT NULL,
  type       VARCHAR(50) DEFAULT 'general',
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Auto-update updated_at via trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_updated
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE OR REPLACE TRIGGER trg_goals_updated
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
