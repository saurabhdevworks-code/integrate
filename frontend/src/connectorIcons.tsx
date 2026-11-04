import React from 'react';
import { Integration, ToolDefinition } from './api/client';

export interface ConnectorDetails {
  author: string;
  subheading: string;
  category: string;
  iconUrl: string;
}

export const CONNECTOR_DOMAINS: Record<string, string> = {
  gmail: 'mail.google.com',
  github: 'github.com',
  google_calendar: 'calendar.google.com',
  calendar: 'calendar.google.com',
  google_drive: 'drive.google.com',
  drive: 'drive.google.com',
  slack: 'slack.com',
  notion: 'notion.so',
  linear: 'linear.app',
  jira: 'atlassian.com',
  discord: 'discord.com',
  stripe: 'stripe.com',
  hubspot: 'hubspot.com',
  salesforce: 'salesforce.com',
  airtable: 'airtable.com',
  trello: 'trello.com',
  asana: 'asana.com',
  clickup: 'clickup.com',
  gitlab: 'gitlab.com',
  zoom: 'zoom.us',
  ms_teams: 'teams.microsoft.com',
  teams: 'teams.microsoft.com',
  ms_outlook: 'outlook.live.com',
  outlook: 'outlook.live.com',
  zendesk: 'zendesk.com',
  shopify: 'shopify.com',
  figma: 'figma.com',
  supabase: 'supabase.com',
  dropbox: 'dropbox.com',
  twitter: 'x.com',
  linkedin: 'linkedin.com',
  mailchimp: 'mailchimp.com',
  intercom: 'intercom.com',
  canva: 'canva.com',
  indeed: 'indeed.com',
  glassdoor: 'glassdoor.com',
  greenhouse: 'greenhouse.io',
  lever: 'lever.co',
  workday: 'workday.com',
  ziprecruiter: 'ziprecruiter.com',
  wellfound: 'wellfound.com',
  smartrecruiters: 'smartrecruiters.com',
  breezy_hr: 'breezy.hr',
  breezy: 'breezy.hr',
  workable: 'workable.com',
  instagram: 'instagram.com',
  facebook: 'facebook.com',
  youtube: 'youtube.com',
  tiktok: 'tiktok.com',
  reddit: 'reddit.com',
  pinterest: 'pinterest.com',
  threads: 'threads.net',
  whatsapp: 'whatsapp.com',
  snapchat: 'snapchat.com',
  bluesky: 'bsky.app'
};

export function getConnectorDetails(slug: string, fallbackName = ''): ConnectorDetails {
  const s = (slug || '').toLowerCase().replace('-', '_');

  if (s.includes('gmail')) {
    return {
      author: 'by Google',
      subheading: 'Search, read, compose drafts, and send emails via Gmail API',
      category: 'Communication',
      iconUrl: '/icons/gmail.svg'
    };
  }
  if (s.includes('github')) {
    return {
      author: 'by GitHub',
      subheading: 'Manage repositories, track issues, comment, and review pull requests',
      category: 'Developer Tools',
      iconUrl: '/icons/github.svg'
    };
  }
  if (s.includes('calendar')) {
    return {
      author: 'by Google',
      subheading: 'Sync meetings, check free/busy slots, and schedule calendar events',
      category: 'Productivity',
      iconUrl: '/icons/calendar.svg'
    };
  }
  if (s.includes('drive')) {
    return {
      author: 'by Google',
      subheading: 'Search, upload, read, and manage Google Drive files & folders',
      category: 'Storage',
      iconUrl: '/icons/drive.svg'
    };
  }
  if (s.includes('slack')) {
    return {
      author: 'by Slack',
      subheading: 'Post messages, broadcast alerts, manage channels, and search chats',
      category: 'Communication',
      iconUrl: '/icons/slack.svg'
    };
  }
  if (s.includes('notion')) {
    return {
      author: 'by Notion',
      subheading: 'Query databases, create pages, append blocks, and sync knowledge bases',
      category: 'Productivity',
      iconUrl: 'https://cdn.simpleicons.org/notion'
    };
  }
  if (s.includes('linear')) {
    return {
      author: 'by Linear',
      subheading: 'Create issues, automate sprint tracking, and manage product roadmaps',
      category: 'Developer Tools',
      iconUrl: 'https://cdn.simpleicons.org/linear'
    };
  }
  if (s.includes('jira')) {
    return {
      author: 'by Atlassian',
      subheading: 'Track enterprise epics, update sprint tickets, and log work hours',
      category: 'Developer Tools',
      iconUrl: 'https://cdn.simpleicons.org/jira'
    };
  }
  if (s.includes('discord')) {
    return {
      author: 'by Discord',
      subheading: 'Trigger bot messages, monitor guild channels, and manage webhooks',
      category: 'Communication',
      iconUrl: 'https://cdn.simpleicons.org/discord'
    };
  }
  if (s.includes('stripe')) {
    return {
      author: 'by Stripe',
      subheading: 'Process payments, create invoices, check subscriptions, and view payouts',
      category: 'Finance',
      iconUrl: 'https://cdn.simpleicons.org/stripe'
    };
  }
  if (s.includes('hubspot')) {
    return {
      author: 'by HubSpot',
      subheading: 'Manage CRM contacts, sync sales deals, and automate lead pipelines',
      category: 'CRM & Sales',
      iconUrl: 'https://cdn.simpleicons.org/hubspot'
    };
  }
  if (s.includes('salesforce')) {
    return {
      author: 'by Salesforce',
      subheading: 'Sync leads, query enterprise SOQL records, and close opportunities',
      category: 'CRM & Sales',
      iconUrl: '/icons/salesforce.svg'
    };
  }
  if (s.includes('canva')) {
    return {
      author: 'by Canva',
      subheading: 'Create designs, export presentations, and automate visual assets',
      category: 'Design',
      iconUrl: '/icons/canva.png'
    };
  }
  if (s.includes('airtable')) {
    return {
      author: 'by Airtable',
      subheading: 'Read relational bases, insert records, and build low-code data workflows',
      category: 'Productivity',
      iconUrl: 'https://cdn.simpleicons.org/airtable'
    };
  }
  if (s.includes('trello')) {
    return {
      author: 'by Atlassian',
      subheading: 'Organize Kanban boards, create task cards, and assign team checklists',
      category: 'Productivity',
      iconUrl: 'https://cdn.simpleicons.org/trello'
    };
  }
  if (s.includes('asana')) {
    return {
      author: 'by Asana',
      subheading: 'Coordinate cross-team projects, update tasks, and track milestone deadlines',
      category: 'Productivity',
      iconUrl: 'https://cdn.simpleicons.org/asana'
    };
  }
  if (s.includes('clickup')) {
    return {
      author: 'by ClickUp',
      subheading: 'Manage tasks, track sprint goals, and automate project workflows',
      category: 'Productivity',
      iconUrl: 'https://cdn.simpleicons.org/clickup'
    };
  }
  if (s.includes('gitlab')) {
    return {
      author: 'by GitLab',
      subheading: 'Manage merge requests, trigger CI/CD pipelines, and inspect repos',
      category: 'Developer Tools',
      iconUrl: 'https://cdn.simpleicons.org/gitlab'
    };
  }
  if (s.includes('zoom')) {
    return {
      author: 'by Zoom',
      subheading: 'Schedule video conferences, generate meeting links, and fetch transcripts',
      category: 'Communication',
      iconUrl: 'https://cdn.simpleicons.org/zoom'
    };
  }
  if (s.includes('teams') || s.includes('ms_teams')) {
    return {
      author: 'by Microsoft',
      subheading: 'Send channel chats, broadcast team notices, and trigger bot actions',
      category: 'Communication',
      iconUrl: '/icons/teams.svg'
    };
  }
  if (s.includes('outlook') || s.includes('ms_outlook')) {
    return {
      author: 'by Microsoft',
      subheading: 'Send emails, manage Office 365 inbox, and organize calendar invites',
      category: 'Communication',
      iconUrl: '/icons/outlook.svg'
    };
  }
  if (s.includes('zendesk')) {
    return {
      author: 'by Zendesk',
      subheading: 'Manage customer support tickets, escalate inquiries, and reply to users',
      category: 'CRM & Sales',
      iconUrl: 'https://cdn.simpleicons.org/zendesk'
    };
  }
  if (s.includes('shopify')) {
    return {
      author: 'by Shopify',
      subheading: 'Inspect store orders, manage product inventory, and fulfill purchases',
      category: 'Finance',
      iconUrl: 'https://cdn.simpleicons.org/shopify'
    };
  }
  if (s.includes('figma')) {
    return {
      author: 'by Figma',
      subheading: 'Extract design tokens, inspect UI frames, and post design comments',
      category: 'Design',
      iconUrl: 'https://cdn.simpleicons.org/figma'
    };
  }
  if (s.includes('supabase')) {
    return {
      author: 'by Supabase',
      subheading: 'Query Postgres tables, trigger edge functions, and manage Auth users',
      category: 'Developer Tools',
      iconUrl: 'https://cdn.simpleicons.org/supabase'
    };
  }
  if (s.includes('dropbox')) {
    return {
      author: 'by Dropbox',
      subheading: 'Upload assets, create shared download links, and sync team folders',
      category: 'Storage',
      iconUrl: 'https://cdn.simpleicons.org/dropbox'
    };
  }
  if (s.includes('twitter') || s === 'x') {
    return {
      author: 'by X Corp',
      subheading: 'Publish tweets, search posts, track trending tags, and fetch user metrics',
      category: 'Marketing',
      iconUrl: 'https://cdn.simpleicons.org/x'
    };
  }
  if (s.includes('linkedin')) {
    return {
      author: 'by LinkedIn',
      subheading: 'Publish company updates, share articles, and retrieve engagement stats',
      category: 'Marketing',
      iconUrl: '/icons/linkedin.svg'
    };
  }
  if (s.includes('mailchimp')) {
    return {
      author: 'by Intuit',
      subheading: 'Send email campaigns, manage subscriber lists, and track open rates',
      category: 'Marketing',
      iconUrl: 'https://cdn.simpleicons.org/mailchimp'
    };
  }
  if (s.includes('intercom')) {
    return {
      author: 'by Intercom',
      subheading: 'Engage active website leads, send conversational messages, and track users',
      category: 'CRM & Sales',
      iconUrl: 'https://cdn.simpleicons.org/intercom'
    };
  }

  // Job Portals & Recruiting
  if (s.includes('indeed')) {
    return {
      author: 'by Indeed',
      subheading: 'Search job postings, post open vacancies, and retrieve candidate applications via Indeed API',
      category: 'Recruiting',
      iconUrl: 'https://cdn.simpleicons.org/indeed'
    };
  }
  if (s.includes('glassdoor')) {
    return {
      author: 'by Glassdoor',
      subheading: 'Access company reviews, salary benchmarks, and live job listing insights',
      category: 'Recruiting',
      iconUrl: 'https://cdn.simpleicons.org/glassdoor'
    };
  }
  if (s.includes('greenhouse')) {
    return {
      author: 'by Greenhouse Software',
      subheading: 'Automate candidate pipelines, interview scorecards, and hiring workflows',
      category: 'Recruiting',
      iconUrl: 'https://cdn.simpleicons.org/greenhouse'
    };
  }
  if (s.includes('lever')) {
    return {
      author: 'by Employ / Lever',
      subheading: 'Sync candidate requisitions, track talent stages, and post job openings',
      category: 'Recruiting',
      iconUrl: 'https://cdn.simpleicons.org/lever'
    };
  }
  if (s.includes('workday')) {
    return {
      author: 'by Workday',
      subheading: 'Enterprise HCM worker records, job requisitions, and organizational hierarchy',
      category: 'Recruiting',
      iconUrl: 'https://cdn.simpleicons.org/workday'
    };
  }
  if (s.includes('ziprecruiter')) {
    return {
      author: 'by ZipRecruiter',
      subheading: 'Distribute job postings, screen candidate resumes, and sync applicants',
      category: 'Recruiting',
      iconUrl: 'https://cdn.simpleicons.org/ziprecruiter'
    };
  }
  if (s.includes('wellfound')) {
    return {
      author: 'by Wellfound',
      subheading: 'Startup job postings, founder connections, and candidate screening',
      category: 'Recruiting',
      iconUrl: 'https://cdn.simpleicons.org/wellfound'
    };
  }
  if (s.includes('smartrecruiters')) {
    return {
      author: 'by SmartRecruiters',
      subheading: 'Enterprise talent acquisition, job requisition publishing, and applicant tracking',
      category: 'Recruiting',
      iconUrl: 'https://cdn.simpleicons.org/smartrecruiters'
    };
  }
  if (s.includes('breezy')) {
    return {
      author: 'by Breezy HR',
      subheading: 'Modern applicant tracking, interview scheduling, and pipeline management',
      category: 'Recruiting',
      iconUrl: 'https://cdn.simpleicons.org/breezyhr'
    };
  }
  if (s.includes('workable')) {
    return {
      author: 'by Workable',
      subheading: 'Post jobs across boards, evaluate candidates, and manage hiring teams',
      category: 'Recruiting',
      iconUrl: 'https://cdn.simpleicons.org/workable'
    };
  }

  // Social Media
  if (s.includes('instagram')) {
    return {
      author: 'by Meta',
      subheading: 'Publish reels, photos, schedule carousel posts, and read media insights',
      category: 'Social Media',
      iconUrl: 'https://cdn.simpleicons.org/instagram'
    };
  }
  if (s.includes('facebook')) {
    return {
      author: 'by Meta',
      subheading: 'Manage business pages, publish updates, and track audience engagement',
      category: 'Social Media',
      iconUrl: 'https://cdn.simpleicons.org/facebook'
    };
  }
  if (s.includes('youtube')) {
    return {
      author: 'by Google',
      subheading: 'Upload videos, manage playlists, fetch analytics, and moderate comments',
      category: 'Social Media',
      iconUrl: 'https://cdn.simpleicons.org/youtube'
    };
  }
  if (s.includes('tiktok')) {
    return {
      author: 'by ByteDance',
      subheading: 'Publish video content, access creator marketplace, and retrieve metrics',
      category: 'Social Media',
      iconUrl: 'https://cdn.simpleicons.org/tiktok'
    };
  }
  if (s.includes('reddit')) {
    return {
      author: 'by Reddit',
      subheading: 'Monitor subreddit discussions, submit posts, and moderate community threads',
      category: 'Social Media',
      iconUrl: 'https://cdn.simpleicons.org/reddit'
    };
  }
  if (s.includes('pinterest')) {
    return {
      author: 'by Pinterest',
      subheading: 'Create pins, organize visual boards, and track discovery analytics',
      category: 'Social Media',
      iconUrl: 'https://cdn.simpleicons.org/pinterest'
    };
  }
  if (s.includes('threads')) {
    return {
      author: 'by Meta',
      subheading: 'Publish text threads, quote replies, and track conversation analytics',
      category: 'Social Media',
      iconUrl: 'https://cdn.simpleicons.org/threads'
    };
  }
  if (s.includes('whatsapp')) {
    return {
      author: 'by Meta',
      subheading: 'Send automated transactional messages, support chats, and template updates',
      category: 'Social Media',
      iconUrl: 'https://cdn.simpleicons.org/whatsapp'
    };
  }
  if (s.includes('snapchat')) {
    return {
      author: 'by Snap Inc',
      subheading: 'Manage ad campaigns, audience filters, and creative brand spotlight',
      category: 'Social Media',
      iconUrl: 'https://cdn.simpleicons.org/snapchat'
    };
  }
  if (s.includes('bluesky')) {
    return {
      author: 'by Bluesky PBLLC',
      subheading: 'Decentralized AT Protocol posts, notifications, and social feeds',
      category: 'Social Media',
      iconUrl: 'https://cdn.simpleicons.org/bluesky'
    };
  }

  const fallbackDomain = `${s.replace(/[^a-z0-9]/g, '')}.com`;
  return {
    author: 'by Verified Partner',
    subheading: `Connect ${fallbackName || slug} to trigger live actions and sync external data`,
    category: 'General',
    iconUrl: `https://www.google.com/s2/favicons?domain=${fallbackDomain}&sz=128`
  };
}

export function renderRealIntegrationIcon(slug: string, size = 34) {
  const meta = getConnectorDetails(slug, slug);
  const s = (slug || '').toLowerCase();
  const domain = CONNECTOR_DOMAINS[slug] || `${s.replace(/[^a-z0-9]/g, '')}.com`;
  const fallbackFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  return (
    <img
      src={meta.iconUrl}
      alt={slug}
      width={size}
      height={size}
      loading="lazy"
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'block'
      }}
      onError={(e) => {
        const target = e.currentTarget as HTMLImageElement;
        if (s.includes('gmail')) target.src = '/icons/gmail.svg';
        else if (s.includes('github')) target.src = '/icons/github.svg';
        else if (s.includes('calendar')) target.src = '/icons/calendar.svg';
        else if (s.includes('drive')) target.src = '/icons/drive.svg';
        else if (s.includes('salesforce')) target.src = '/icons/salesforce.svg';
        else if (s.includes('canva')) target.src = '/icons/canva.png';
        else if (s.includes('slack')) target.src = '/icons/slack.svg';
        else if (s.includes('linkedin')) target.src = '/icons/linkedin.svg';
        else if (s.includes('teams')) target.src = '/icons/teams.svg';
        else if (s.includes('outlook')) target.src = '/icons/outlook.svg';
        else if (target.src !== fallbackFaviconUrl) {
          target.src = fallbackFaviconUrl;
        }
      }}
    />
  );
}

export function getDefaultToolsForApp(integ: Integration): ToolDefinition[] {
  const s = (integ.slug || '').toLowerCase();
  const name = integ.name;

  if (s.includes('whatsapp')) {
    return [
      {
        id: 'wa-1',
        slug: 'whatsapp.send_template_message',
        name: 'Send Template Message',
        description: 'Send pre-approved WhatsApp Business template notification to recipient phone number',
        inputSchema: '{"type":"object","properties":{"to":{"type":"string","description":"Recipient phone number with country code"},"templateName":{"type":"string","description":"Approved template name"},"languageCode":{"type":"string","default":"en_US"}},"required":["to","templateName"]}',
        requiredScopes: 'whatsapp_business_messaging',
        riskLevel: 'LOW',
        requiresApproval: false,
        version: '1.0.0',
        integrationSlug: 'whatsapp',
        integrationName: name
      },
      {
        id: 'wa-2',
        slug: 'whatsapp.send_text_message',
        name: 'Send Text Message',
        description: 'Send conversational direct message to active WhatsApp chat thread',
        inputSchema: '{"type":"object","properties":{"to":{"type":"string","description":"Recipient phone number"},"text":{"type":"string","description":"Message content"}},"required":["to","text"]}',
        requiredScopes: 'whatsapp_business_messaging',
        riskLevel: 'LOW',
        requiresApproval: false,
        version: '1.0.0',
        integrationSlug: 'whatsapp',
        integrationName: name
      },
      {
        id: 'wa-3',
        slug: 'whatsapp.upload_media',
        name: 'Upload & Send Media',
        description: 'Dispatch image, invoice PDF, or audio file directly to customer WhatsApp',
        inputSchema: '{"type":"object","properties":{"to":{"type":"string","description":"Recipient phone number"},"mediaUrl":{"type":"string","description":"Public CDN media URL"},"caption":{"type":"string","description":"Media caption"}},"required":["to","mediaUrl"]}',
        requiredScopes: 'whatsapp_business_messaging',
        riskLevel: 'MEDIUM',
        requiresApproval: false,
        version: '1.0.0',
        integrationSlug: 'whatsapp',
        integrationName: name
      },
      {
        id: 'wa-4',
        slug: 'whatsapp.get_message_status',
        name: 'Get Delivery Status',
        description: 'Check whether message was sent, delivered, or read by recipient',
        inputSchema: '{"type":"object","properties":{"messageId":{"type":"string","description":"WhatsApp message ID"}},"required":["messageId"]}',
        requiredScopes: 'whatsapp_business_management',
        riskLevel: 'LOW',
        requiresApproval: false,
        version: '1.0.0',
        integrationSlug: 'whatsapp',
        integrationName: name
      }
    ];
  }

  if (s.includes('instagram')) {
    return [
      {
        id: 'ig-1',
        slug: 'instagram.publish_photo',
        name: 'Publish Feed Photo',
        description: 'Post image asset with markdown caption and hashtags to Instagram business profile',
        inputSchema: '{"type":"object","properties":{"imageUrl":{"type":"string","description":"Direct public image URL"},"caption":{"type":"string","description":"Post caption text"}},"required":["imageUrl","caption"]}',
        requiredScopes: 'instagram_content_publish',
        riskLevel: 'MEDIUM',
        requiresApproval: false,
        version: '1.0.0',
        integrationSlug: 'instagram',
        integrationName: name
      },
      {
        id: 'ig-2',
        slug: 'instagram.publish_reel',
        name: 'Publish Video Reel',
        description: 'Upload MP4 video and publish to Instagram Reels feed with cover thumbnail',
        inputSchema: '{"type":"object","properties":{"videoUrl":{"type":"string","description":"Video URL"},"caption":{"type":"string","description":"Reel caption"}},"required":["videoUrl"]}',
        requiredScopes: 'instagram_content_publish',
        riskLevel: 'MEDIUM',
        requiresApproval: false,
        version: '1.0.0',
        integrationSlug: 'instagram',
        integrationName: name
      },
      {
        id: 'ig-3',
        slug: 'instagram.get_media_insights',
        name: 'Get Media Insights',
        description: 'Retrieve views, impressions, reach, likes, comments, and saves for media ID',
        inputSchema: '{"type":"object","properties":{"mediaId":{"type":"string","description":"Instagram media ID"}},"required":["mediaId"]}',
        requiredScopes: 'instagram_basic',
        riskLevel: 'LOW',
        requiresApproval: false,
        version: '1.0.0',
        integrationSlug: 'instagram',
        integrationName: name
      },
      {
        id: 'ig-4',
        slug: 'instagram.reply_comment',
        name: 'Reply to Comment',
        description: 'Respond to user comment under an Instagram post',
        inputSchema: '{"type":"object","properties":{"commentId":{"type":"string","description":"Target comment ID"},"message":{"type":"string","description":"Response message"}},"required":["commentId","message"]}',
        requiredScopes: 'instagram_manage_comments',
        riskLevel: 'LOW',
        requiresApproval: false,
        version: '1.0.0',
        integrationSlug: 'instagram',
        integrationName: name
      }
    ];
  }

  if (s.includes('slack')) {
    return [
      {
        id: 'slack-1',
        slug: 'slack.send_message',
        name: 'Send Channel Message',
        description: 'Broadcast markdown message or bot alert into a public/private Slack channel',
        inputSchema: '{"type":"object","properties":{"channel":{"type":"string","description":"Channel name or ID"},"text":{"type":"string","description":"Message text"}},"required":["channel","text"]}',
        requiredScopes: 'chat:write',
        riskLevel: 'LOW',
        requiresApproval: false,
        version: '1.0.0',
        integrationSlug: 'slack',
        integrationName: name
      },
      {
        id: 'slack-2',
        slug: 'slack.search_messages',
        name: 'Search Workspace Messages',
        description: 'Search communication history across channels using query filters',
        inputSchema: '{"type":"object","properties":{"query":{"type":"string","description":"Search term"},"count":{"type":"integer","default":20}},"required":["query"]}',
        requiredScopes: 'channels:read',
        riskLevel: 'LOW',
        requiresApproval: false,
        version: '1.0.0',
        integrationSlug: 'slack',
        integrationName: name
      },
      {
        id: 'slack-3',
        slug: 'slack.upload_file',
        name: 'Upload File to Channel',
        description: 'Upload logs, snippets, or documents to team discussion thread',
        inputSchema: '{"type":"object","properties":{"channels":{"type":"string","description":"Target channels comma separated"},"content":{"type":"string","description":"File content"},"title":{"type":"string","description":"File title"}},"required":["channels","content"]}',
        requiredScopes: 'files:write',
        riskLevel: 'MEDIUM',
        requiresApproval: false,
        version: '1.0.0',
        integrationSlug: 'slack',
        integrationName: name
      },
      {
        id: 'slack-4',
        slug: 'slack.create_channel',
        name: 'Create Channel',
        description: 'Create a new project channel in the workspace',
        inputSchema: '{"type":"object","properties":{"name":{"type":"string","description":"Channel name"},"isPrivate":{"type":"boolean","default":false}},"required":["name"]}',
        requiredScopes: 'channels:manage',
        riskLevel: 'MEDIUM',
        requiresApproval: false,
        version: '1.0.0',
        integrationSlug: 'slack',
        integrationName: name
      }
    ];
  }

  if (s.includes('notion')) {
    return [
      {
        id: 'notion-1',
        slug: 'notion.query_database',
        name: 'Query Database',
        description: 'Filter and sort records in a Notion database',
        inputSchema: '{"type":"object","properties":{"databaseId":{"type":"string","description":"Notion database UUID"},"pageSize":{"type":"integer","default":25}},"required":["databaseId"]}',
        requiredScopes: 'read_content',
        riskLevel: 'LOW',
        requiresApproval: false,
        version: '1.0.0',
        integrationSlug: 'notion',
        integrationName: name
      },
      {
        id: 'notion-2',
        slug: 'notion.create_page',
        name: 'Create Page / Entry',
        description: 'Add a new document or database item to Notion workspace',
        inputSchema: '{"type":"object","properties":{"parentPageId":{"type":"string","description":"Parent page UUID"},"title":{"type":"string","description":"Page title"},"contentMarkdown":{"type":"string","description":"Page body"}},"required":["parentPageId","title"]}',
        requiredScopes: 'insert_content',
        riskLevel: 'LOW',
        requiresApproval: false,
        version: '1.0.0',
        integrationSlug: 'notion',
        integrationName: name
      },
      {
        id: 'notion-3',
        slug: 'notion.append_block_children',
        name: 'Append Content Blocks',
        description: 'Append checklist, code block, or paragraph to an existing Notion page',
        inputSchema: '{"type":"object","properties":{"pageId":{"type":"string","description":"Page UUID"},"markdownText":{"type":"string","description":"Text content to append"}},"required":["pageId","markdownText"]}',
        requiredScopes: 'update_content',
        riskLevel: 'LOW',
        requiresApproval: false,
        version: '1.0.0',
        integrationSlug: 'notion',
        integrationName: name
      }
    ];
  }

  if (s.includes('stripe')) {
    return [
      {
        id: 'stripe-1',
        slug: 'stripe.create_customer',
        name: 'Create Customer Profile',
        description: 'Create new billing customer record with email and billing address in Stripe',
        inputSchema: '{"type":"object","properties":{"email":{"type":"string","description":"Customer email"},"name":{"type":"string","description":"Customer name"}},"required":["email"]}',
        requiredScopes: 'read_write',
        riskLevel: 'LOW',
        requiresApproval: false,
        version: '1.0.0',
        integrationSlug: 'stripe',
        integrationName: name
      },
      {
        id: 'stripe-2',
        slug: 'stripe.create_payment_intent',
        name: 'Create Payment Intent',
        description: 'Initiate a secure checkout payment intent with specified currency and amount',
        inputSchema: '{"type":"object","properties":{"amount":{"type":"integer","description":"Amount in cents/smallest currency unit"},"currency":{"type":"string","default":"usd"},"customerId":{"type":"string","description":"Optional customer ID"}},"required":["amount"]}',
        requiredScopes: 'read_write',
        riskLevel: 'HIGH',
        requiresApproval: false,
        version: '1.0.0',
        integrationSlug: 'stripe',
        integrationName: name
      },
      {
        id: 'stripe-3',
        slug: 'stripe.list_invoices',
        name: 'List Customer Invoices',
        description: 'Fetch paid and unpaid customer invoices and payment statuses',
        inputSchema: '{"type":"object","properties":{"limit":{"type":"integer","default":10}},"required":[]}',
        requiredScopes: 'read_write',
        riskLevel: 'LOW',
        requiresApproval: false,
        version: '1.0.0',
        integrationSlug: 'stripe',
        integrationName: name
      }
    ];
  }

  if (s.includes('indeed')) {
    return [
      {
        id: 'ind-1',
        slug: 'indeed.search_jobs',
        name: 'Search Job Postings',
        description: 'Query live vacancy listings by keywords, remote status, and geographical radius',
        inputSchema: '{"type":"object","properties":{"query":{"type":"string","description":"Job title or skill (e.g. AI Engineer)"},"location":{"type":"string","default":"Remote"},"limit":{"type":"integer","default":20}},"required":["query"]}',
        requiredScopes: 'jobsearch',
        riskLevel: 'LOW',
        requiresApproval: false,
        version: '1.0.0',
        integrationSlug: 'indeed',
        integrationName: name
      },
      {
        id: 'ind-2',
        slug: 'indeed.get_job_details',
        name: 'Get Job Details',
        description: 'Fetch complete job description, compensation breakdown, and requirements',
        inputSchema: '{"type":"object","properties":{"jobKey":{"type":"string","description":"Indeed job key"}},"required":["jobKey"]}',
        requiredScopes: 'jobsearch',
        riskLevel: 'LOW',
        requiresApproval: false,
        version: '1.0.0',
        integrationSlug: 'indeed',
        integrationName: name
      },
      {
        id: 'ind-3',
        slug: 'indeed.post_vacancy',
        name: 'Post Job Vacancy',
        description: 'Publish a new hiring opening to Indeed candidate search pool',
        inputSchema: '{"type":"object","properties":{"title":{"type":"string","description":"Job title"},"description":{"type":"string","description":"Full job description"},"salaryMin":{"type":"integer","description":"Minimum annual salary"}},"required":["title","description"]}',
        requiredScopes: 'vacancies:write',
        riskLevel: 'HIGH',
        requiresApproval: false,
        version: '1.0.0',
        integrationSlug: 'indeed',
        integrationName: name
      }
    ];
  }

  // Generic 3-action default for all other catalog connectors
  return [
    {
      id: `${s}-1`,
      slug: `${s}.search_records`,
      name: `Search ${name} Records`,
      description: `Query and retrieve data items, entities, and feeds from ${name}`,
      inputSchema: '{"type":"object","properties":{"query":{"type":"string","description":"Search term or query filter"},"limit":{"type":"integer","default":20}},"required":["query"]}',
      requiredScopes: 'default',
      riskLevel: 'LOW',
      requiresApproval: false,
        version: '1.0.0',
      integrationSlug: s,
      integrationName: name
    },
    {
      id: `${s}-2`,
      slug: `${s}.create_entry`,
      name: `Create ${name} Entry`,
      description: `Create a new entry, post, or transactional item in ${name}`,
      inputSchema: '{"type":"object","properties":{"title":{"type":"string","description":"Item title or summary"},"payload":{"type":"string","description":"JSON or text payload"}},"required":["title"]}',
      requiredScopes: 'default',
      riskLevel: 'MEDIUM',
      requiresApproval: false,
        version: '1.0.0',
      integrationSlug: s,
      integrationName: name
    },
    {
      id: `${s}-3`,
      slug: `${s}.get_entity_details`,
      name: `Get Entity Details`,
      description: `Fetch complete entity metadata, audit timestamps, and relations by ID`,
      inputSchema: '{"type":"object","properties":{"id":{"type":"string","description":"Entity ID or primary key"}},"required":["id"]}',
      requiredScopes: 'default',
      riskLevel: 'LOW',
      requiresApproval: false,
        version: '1.0.0',
      integrationSlug: s,
      integrationName: name
    }
  ];
}

export function getAppTools(integ: Integration, allLoadedTools: ToolDefinition[]): ToolDefinition[] {
  const s = (integ.slug || '').toLowerCase();
  const matching = (allLoadedTools || []).filter(t => {
    const tInteg = (t.integrationSlug || '').toLowerCase();
    const tSlug = (t.slug || '').toLowerCase();
    if (s === 'calendar' || s === 'google_calendar') {
      return tSlug.startsWith('calendar') || tInteg.includes('calendar');
    }
    if (s === 'drive' || s === 'google_drive') {
      return tSlug.includes('drive') || tInteg.includes('drive');
    }
    return tSlug.startsWith(s) || tInteg.includes(s);
  });

  if (matching.length > 0) return matching;

  return getDefaultToolsForApp(integ);
}
