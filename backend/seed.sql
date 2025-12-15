-- Christmas Puzzle - Sample Data
USE christmas_grad_db;

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE users;
TRUNCATE TABLE game_sessions;
TRUNCATE TABLE friends;
TRUNCATE TABLE achievements;
TRUNCATE TABLE challenges;
TRUNCATE TABLE story_progress;
TRUNCATE TABLE analytics;
TRUNCATE TABLE daily_challenges;
TRUNCATE TABLE daily_challenge_participants;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert sample users (password is 'password123' hashed)
INSERT INTO users (username, email, password_hash, xp_points, mana, current_chapter) VALUES
('Santa_Claus', 'santa@northpole.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 5000, 100, 5),
('Rudolph', 'rudolph@reindeer.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 3200, 95, 3),
('Elf_Master', 'elf@workshop.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 4500, 87, 4),
('Snow_Queen', 'queen@icepalace.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 2800, 100, 2),
('Frosty', 'frosty@snowman.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 1900, 65, 1);

-- Insert sample game sessions
INSERT INTO game_sessions (user_id, version, difficulty, moves, time_seconds, outcome, board_size) VALUES
(1, 'santa', 2.5, 45, 62, 'win', 4),
(1, 'reindeer', 3.0, 38, 55, 'win', 4),
(1, 'elf', 3.5, 52, 78, 'win', 4),
(2, 'santa', 2.0, 60, 90, 'loss', 4),
(2, 'reindeer', 2.5, 42, 58, 'win', 4);

-- Insert sample friends
INSERT INTO friends (user_id, friend_id, status) VALUES
(1, 2, 'accepted'),
(1, 3, 'accepted'),
(1, 4, 'accepted'),
(2, 3, 'accepted'),
(3, 4, 'accepted');

-- Insert sample achievements
INSERT INTO achievements (user_id, title, description) VALUES
(1, 'Puzzle Master', 'Solved 50 puzzles'),
(1, 'Speed Demon', 'Completed puzzle in under 30 seconds'),
(2, 'First Victory', 'Won your first puzzle'),
(3, 'Elf Expert', 'Mastered elf workshop puzzles'),
(4, 'Snow Queen', 'Completed all winter challenges');

-- Insert today's daily challenge
INSERT INTO daily_challenges (date, puzzle_config, difficulty, reward_xp, participants_count) VALUES
(CURDATE(), '{"size":5,"difficulty":4}', 4.0, 250, 1247);

-- Insert daily challenge participants
INSERT INTO daily_challenge_participants (challenge_date, user_id, completion_time, moves, rank) VALUES
(CURDATE(), 1, 142, 48, 1),
(CURDATE(), 3, 156, 52, 2),
(CURDATE(), 2, 168, 55, 3);

SELECT '✅ Sample data inserted successfully!' as message;