-- Seed data for testing the Multi-Platform Social Media Downloader

-- 1. Insert a mock user (Password is 'Password123' hashed with bcrypt)
INSERT INTO users (id, email, password_hash, created_at)
VALUES (
    'a2b9b5f5-4673-45bb-b3b4-4b533e4f71a0',
    'academic.tester@example.com',
    '$2b$10$tMh4zHl0GvHw3lFfC4Rz.e8w93W2uXq1e0U2q4Q8gKkK6yV6lW5Wq',
    timezone('utc'::text, now() - INTERVAL '5 days')
)
ON CONFLICT (email) DO NOTHING;

-- 2. Insert mock download requests
INSERT INTO download_requests (id, user_id, source_url, platform, status, created_at, completed_at, error_message)
VALUES 
(
    'c2c8f8b8-89bd-4911-8cba-6d6efbf8e601',
    'a2b9b5f5-4673-45bb-b3b4-4b533e4f71a0',
    'https://www.instagram.com/p/C_abc123XYZ/',
    'instagram',
    'completed',
    timezone('utc'::text, now() - INTERVAL '2 hours'),
    timezone('utc'::text, now() - INTERVAL '2 hours' + INTERVAL '4 seconds'),
    NULL
),
(
    'c2c8f8b8-89bd-4911-8cba-6d6efbf8e602',
    'a2b9b5f5-4673-45bb-b3b4-4b533e4f71a0',
    'https://www.tiktok.com/@creator/video/9876543210123456789',
    'tiktok',
    'completed',
    timezone('utc'::text, now() - INTERVAL '1 hours'),
    timezone('utc'::text, now() - INTERVAL '1 hours' + INTERVAL '3 seconds'),
    NULL
),
(
    'c2c8f8b8-89bd-4911-8cba-6d6efbf8e603',
    'a2b9b5f5-4673-45bb-b3b4-4b533e4f71a0',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'youtube',
    'failed',
    timezone('utc'::text, now() - INTERVAL '30 minutes'),
    timezone('utc'::text, now() - INTERVAL '29 minutes'),
    'Content is age-restricted and requires user authentication.'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert mock download history
INSERT INTO download_history (id, user_id, request_id, platform, file_name, created_at)
VALUES 
(
    'd3d9c9a9-78cd-4712-8eab-7e7fedf9f701',
    'a2b9b5f5-4673-45bb-b3b4-4b533e4f71a0',
    'c2c8f8b8-89bd-4911-8cba-6d6efbf8e601',
    'instagram',
    'instagram_C_abc123XYZ.mp4',
    timezone('utc'::text, now() - INTERVAL '2 hours')
),
(
    'd3d9c9a9-78cd-4712-8eab-7e7fedf9f702',
    'a2b9b5f5-4673-45bb-b3b4-4b533e4f71a0',
    'c2c8f8b8-89bd-4911-8cba-6d6efbf8e602',
    'tiktok',
    'tiktok_creator_video_987654.mp4',
    timezone('utc'::text, now() - INTERVAL '1 hours')
)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert mock system logs
INSERT INTO system_logs (level, message, context, created_at)
VALUES 
('info', 'System initialized successfully in development mode.', '{}', timezone('utc'::text, now() - INTERVAL '5 days')),
('info', 'Database schema migration and seed run finished.', '{"module": "seeding"}', timezone('utc'::text, now() - INTERVAL '5 days')),
('warn', 'Failed download request logged due to platform restrictions.', '{"request_id": "c2c8f8b8-89bd-4911-8cba-6d6efbf8e603"}', timezone('utc'::text, now() - INTERVAL '30 minutes'));
