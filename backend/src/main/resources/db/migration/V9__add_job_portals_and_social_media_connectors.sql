-- V9: Add Job Portals & Social Media Connectors
INSERT INTO integrations (slug, name, category, auth_type, default_scopes, documentation_url)
VALUES
-- Job Portals & Recruiting
('indeed', 'Indeed Jobs', 'RECRUITING', 'OAUTH2', 'jobsearch applications:read vacancies:write', 'https://developer.indeed.com/'),
('glassdoor', 'Glassdoor', 'RECRUITING', 'OAUTH2', 'reviews:read salaries:read jobs:read', 'https://www.glassdoor.com/developer/'),
('greenhouse', 'Greenhouse ATS', 'RECRUITING', 'OAUTH2', 'candidates:read candidates:write jobs:read', 'https://developers.greenhouse.io/'),
('lever', 'Lever Hire', 'RECRUITING', 'OAUTH2', 'candidates:read opportunities:write postings:read', 'https://hire.lever.co/developer/documentation'),
('workday', 'Workday HCM', 'RECRUITING', 'OAUTH2', 'workers:read staffing:read requisitions:read', 'https://community.workday.com/developer'),
('ziprecruiter', 'ZipRecruiter', 'RECRUITING', 'OAUTH2', 'jobs:post candidates:screen applicants:read', 'https://www.ziprecruiter.com/partners'),
('wellfound', 'Wellfound (AngelList)', 'RECRUITING', 'OAUTH2', 'jobs:manage startups:read talent:browse', 'https://wellfound.com/developers'),
('smartrecruiters', 'SmartRecruiters', 'RECRUITING', 'OAUTH2', 'jobs_read candidates_create postings_manage', 'https://developers.smartrecruiters.com/'),
('breezy_hr', 'Breezy HR', 'RECRUITING', 'OAUTH2', 'positions:read candidates:manage', 'https://developer.breezy.hr/'),
('workable', 'Workable', 'RECRUITING', 'OAUTH2', 'recruit:read recruit:write', 'https://workable.readme.io/'),

-- Social Media
('instagram', 'Instagram Graph API', 'SOCIAL_MEDIA', 'OAUTH2', 'instagram_basic instagram_content_publish pages_read_engagement', 'https://developers.facebook.com/docs/instagram-api'),
('facebook', 'Facebook Pages & Groups', 'SOCIAL_MEDIA', 'OAUTH2', 'pages_manage_posts pages_read_engagement groups_access_member_info', 'https://developers.facebook.com/docs/pages-api'),
('youtube', 'YouTube Data API', 'SOCIAL_MEDIA', 'OAUTH2', 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly', 'https://developers.google.com/youtube/v3'),
('tiktok', 'TikTok for Business', 'SOCIAL_MEDIA', 'OAUTH2', 'video.publish user.info.basic creator.marketplace', 'https://developers.tiktok.com/'),
('reddit', 'Reddit API', 'SOCIAL_MEDIA', 'OAUTH2', 'submit read mysubreddits identity', 'https://www.reddit.com/dev/api/'),
('pinterest', 'Pinterest API', 'SOCIAL_MEDIA', 'OAUTH2', 'boards:read boards:write pins:read pins:write', 'https://developers.pinterest.com/'),
('threads', 'Meta Threads', 'SOCIAL_MEDIA', 'OAUTH2', 'threads_basic threads_content_publish', 'https://developers.facebook.com/docs/threads'),
('whatsapp', 'WhatsApp Business Platform', 'SOCIAL_MEDIA', 'OAUTH2', 'whatsapp_business_messaging whatsapp_business_management', 'https://developers.facebook.com/docs/whatsapp'),
('snapchat', 'Snapchat Marketing', 'SOCIAL_MEDIA', 'OAUTH2', 'snapchat-marketing-api snapchat-profile-api', 'https://marketingapi.snapchat.com/'),
('bluesky', 'Bluesky Social', 'SOCIAL_MEDIA', 'OAUTH2', 'atproto com.atproto.repo.createRecord', 'https://docs.bsky.app/')
ON CONFLICT (slug) DO NOTHING;
