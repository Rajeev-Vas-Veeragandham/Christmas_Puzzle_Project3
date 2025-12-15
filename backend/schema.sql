-- Christmas Puzzle Graduate Edition - Complete Database Schema
CREATE DATABASE IF NOT EXISTS `christmas_grad_db`;
USE `christmas_grad_db`;

-- Users table
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) UNIQUE NOT NULL,
    `email` VARCHAR(100) UNIQUE NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `xp_points` INT DEFAULT 100,
    `mana` INT DEFAULT 100,
    `current_chapter` INT DEFAULT 1,
    `profile_picture` VARCHAR(255) DEFAULT 'default.jpg',
    `streak_days` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Game sessions table
CREATE TABLE `game_sessions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `version` VARCHAR(20) NOT NULL,
    `difficulty` DECIMAL(3,1) DEFAULT 1.0,
    `moves` INT DEFAULT 0,
    `time_seconds` INT DEFAULT 0,
    `outcome` VARCHAR(20) DEFAULT 'loss',
    `tiles_state` JSON,
    `board_size` INT DEFAULT 4,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Friends table
CREATE TABLE `friends` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `friend_id` INT NOT NULL,
    `status` VARCHAR(20) DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`friend_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_friendship` (`user_id`, `friend_id`)
);

-- Achievements table
CREATE TABLE `achievements` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `icon_url` VARCHAR(255),
    `unlocked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Challenges table
CREATE TABLE `challenges` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `challenger_id` INT NOT NULL,
    `opponent_id` INT NOT NULL,
    `puzzle_config` JSON NOT NULL,
    `status` VARCHAR(20) DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`challenger_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`opponent_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Story progress table
CREATE TABLE `story_progress` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `chapter_id` INT NOT NULL,
    `completed` BOOLEAN DEFAULT FALSE,
    `completion_time` INT NULL,
    `choices_made` JSON,
    `unlocked_at` TIMESTAMP NULL,
    `completed_at` TIMESTAMP NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_user_chapter` (`user_id`, `chapter_id`)
);

-- Analytics table
CREATE TABLE `analytics` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `event_type` VARCHAR(50) NOT NULL,
    `event_data` JSON NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Daily challenges table
CREATE TABLE `daily_challenges` (
    `date` DATE PRIMARY KEY,
    `puzzle_config` JSON NOT NULL,
    `difficulty` DECIMAL(3,1) NOT NULL,
    `reward_xp` INT DEFAULT 100,
    `participants_count` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily challenge participants table
CREATE TABLE `daily_challenge_participants` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `challenge_date` DATE NOT NULL,
    `user_id` INT NOT NULL,
    `completion_time` INT NULL,
    `moves` INT NULL,
    `rank` INT NULL,
    `reward_claimed` BOOLEAN DEFAULT FALSE,
    `participated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`challenge_date`) REFERENCES `daily_challenges`(`date`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_daily_participant` (`challenge_date`, `user_id`)
);

-- Add this to schema.sql after the other tables
CREATE TABLE `powerups` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL,
    `description` TEXT NOT NULL,
    `mana_cost` INT NOT NULL,
    `effect_type` VARCHAR(50) NOT NULL,
    `icon_url` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default power-ups
INSERT INTO powerups (name, description, mana_cost, effect_type) VALUES
('Elf''s Wisdom', 'Highlights the optimal next move', 25, 'hint'),
('Frozen Moment', 'Freezes the timer for 10 seconds', 40, 'time_freeze'),
('Reindeer Shuffle', 'Reshuffles the puzzle', 30, 'shuffle'),
('Santa''s Magic', 'Solves one misplaced tile', 50, 'solve_piece'),
('Crystal Ball', 'Shows correct positions', 35, 'vision');

-- Indexes for performance
CREATE INDEX idx_users_xp ON users(xp_points DESC);
CREATE INDEX idx_sessions_user ON game_sessions(user_id);
CREATE INDEX idx_sessions_outcome ON game_sessions(outcome);
CREATE INDEX idx_friends_status ON friends(status);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_story_completed ON story_progress(completed);
CREATE INDEX idx_analytics_event ON analytics(event_type);
CREATE INDEX idx_daily_rank ON daily_challenge_participants(challenge_date, rank);

-- Sample views
CREATE VIEW global_leaderboard AS
SELECT 
    u.username,
    u.xp_points,
    COUNT(DISTINCT g.id) as games_played,
    SUM(CASE WHEN g.outcome = 'win' THEN 1 ELSE 0 END) as wins,
    MIN(CASE WHEN g.outcome = 'win' THEN g.time_seconds END) as best_time
FROM users u
LEFT JOIN game_sessions g ON u.id = g.user_id
GROUP BY u.id, u.username, u.xp_points
ORDER BY u.xp_points DESC;

-- Insert default power-ups
INSERT INTO powerups (name, description, mana_cost, effect_type) VALUES
('Elf''s Wisdom', 'Highlights the optimal next move', 25, 'hint'),
('Frozen Moment', 'Freezes the timer for 10 seconds', 40, 'time_freeze'),
('Reindeer Shuffle', 'Reshuffles the puzzle', 30, 'shuffle'),
('Santa''s Magic', 'Solves one misplaced tile', 50, 'solve_piece'),
('Crystal Ball', 'Shows correct positions', 35, 'vision');

SELECT '✅ Database schema created successfully!' as message;