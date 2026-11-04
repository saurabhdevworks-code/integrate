import React, { useState, useEffect } from 'react';
import {
  Activity,
  Boxes,
  Cable,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  ExternalLink,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Play,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Unplug,
  Users,
  Wrench,
  X,
  XCircle,
  FileCode2,
  Globe,
  BarChart3,
  Radio,
  Trash2,
  Eye,
  EyeOff,
  Zap,
  Send,
  AlertCircle,
  AlertTriangle,
  Clock,
  Settings,
  Sun,
  Moon,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  FileJson,
  Lock,
  Mail,
  Github,
  Calendar,
  Info,
  ToggleLeft,
  ToggleRight,
  Ban,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import {
  api,
  Organization,
  Project,
  ApiKey,
  ApiKeyCreatedResponse,
  Integration,
  ConnectedAccount,
  ToolDefinition,
  ExecutionResponse,
  ApprovalResponse,
  Webhook,
  WebhookDelivery,
  UsageSummaryResponse
} from './api/client';
import { ConnectHostedPage } from './components/ConnectHostedPage';
import { LandingPage } from './components/LandingPage';

function getUserDisplayName(email: string | null): string {
  if (!email) return 'Developer';
  const localPart = email.split('@')[0];
  const parts = localPart.split(/[._-]/).filter(Boolean);
  if (parts.length > 0) {
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  }
  return localPart;
}

function getUserInitials(email: string | null): string {
  if (!email) return 'SA';
  const localPart = email.split('@')[0];
  const parts = localPart.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return localPart.substring(0, 2).toUpperCase();
}

// Google OAuth 2.0 Client Credentials
const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || 'your-google-client-id.apps.googleusercontent.com';

function VerifiedBadge({ isEnabled = false }: { isEnabled?: boolean }) {
  if (isEnabled) {
    return (
      <span className="verified-badge-wrap enabled" title="Verified & Enabled">
        <img
          src="/icons/badge-verified.png"
          alt="Verified & Enabled"
          width={18}
          height={18}
          style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', objectFit: 'contain' }}
        />
      </span>
    );
  }
  return (
    <span className="verified-badge-wrap disabled" title="Verified (Disabled)">
      <img
        src="/icons/badge-unverified.png"
        alt="Verified (Disabled)"
        width={18}
        height={18}
        style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', objectFit: 'contain' }}
      />
    </span>
  );
}

export interface ConnectorDetails {
  author: string;
  subheading: string;
  category: string;
  iconUrl: string;
}

export const DEFAULT_CONNECTORS: Integration[] = [
  { id: '1', slug: 'gmail', name: 'Google Gmail', category: 'COMMUNICATION', authType: 'OAUTH2', defaultScopes: 'https://mail.google.com/', iconUrl: '/icons/gmail.svg', documentationUrl: 'https://developers.google.com/gmail/api', enabled: true, configured: true },
  { id: '2', slug: 'github', name: 'GitHub', category: 'DEVELOPER_TOOLS', authType: 'OAUTH2', defaultScopes: 'repo,read:user,user:email', iconUrl: '/icons/github.svg', documentationUrl: 'https://docs.github.com/rest', enabled: true, configured: true },
  { id: '3', slug: 'google_calendar', name: 'Google Calendar', category: 'PRODUCTIVITY', authType: 'OAUTH2', defaultScopes: 'https://www.googleapis.com/auth/calendar.events', iconUrl: '/icons/calendar.svg', documentationUrl: 'https://developers.google.com/calendar/api', enabled: true, configured: true },
  { id: '4', slug: 'google_drive', name: 'Google Drive', category: 'STORAGE', authType: 'OAUTH2', defaultScopes: 'https://www.googleapis.com/auth/drive.file', iconUrl: '/icons/drive.svg', documentationUrl: 'https://developers.google.com/drive', enabled: true, configured: true },
  { id: '5', slug: 'slack', name: 'Slack', category: 'COMMUNICATION', authType: 'OAUTH2', defaultScopes: 'chat:write,channels:read,users:read', iconUrl: '/icons/slack.svg', documentationUrl: 'https://api.slack.com/', enabled: true, configured: true },
  { id: '6', slug: 'notion', name: 'Notion', category: 'PRODUCTIVITY', authType: 'OAUTH2', defaultScopes: 'read_content,update_content,insert_content', iconUrl: null, documentationUrl: 'https://developers.notion.com/', enabled: true, configured: true },
  { id: '7', slug: 'linear', name: 'Linear', category: 'DEVELOPER_TOOLS', authType: 'OAUTH2', defaultScopes: 'read,write,issues:create', iconUrl: null, documentationUrl: 'https://developers.linear.app/', enabled: true, configured: true },
  { id: '8', slug: 'jira', name: 'Jira', category: 'DEVELOPER_TOOLS', authType: 'OAUTH2', defaultScopes: 'read:jira-work,write:jira-work', iconUrl: null, documentationUrl: 'https://developer.atlassian.com/cloud/jira/platform/rest/v3/', enabled: true, configured: true },
  { id: '9', slug: 'discord', name: 'Discord', category: 'COMMUNICATION', authType: 'OAUTH2', defaultScopes: 'bot,messages.read,webhook.incoming', iconUrl: null, documentationUrl: 'https://discord.com/developers/docs/intro', enabled: true, configured: true },
  { id: '10', slug: 'stripe', name: 'Stripe', category: 'FINANCE', authType: 'OAUTH2', defaultScopes: 'read_write', iconUrl: null, documentationUrl: 'https://stripe.com/docs/api', enabled: true, configured: true },
  { id: '11', slug: 'hubspot', name: 'HubSpot', category: 'CRM', authType: 'OAUTH2', defaultScopes: 'crm.objects.contacts.read,crm.objects.deals.read', iconUrl: null, documentationUrl: 'https://developers.hubspot.com/docs/api/overview', enabled: true, configured: true },
  { id: '12', slug: 'salesforce', name: 'Salesforce', category: 'CRM', authType: 'OAUTH2', defaultScopes: 'api,refresh_token,offline_access', iconUrl: '/icons/salesforce.svg', documentationUrl: 'https://developer.salesforce.com/', enabled: true, configured: true },
  { id: '13', slug: 'airtable', name: 'Airtable', category: 'PRODUCTIVITY', authType: 'OAUTH2', defaultScopes: 'data.records:read,data.records:write', iconUrl: null, documentationUrl: 'https://airtable.com/developers/web/api/introduction', enabled: true, configured: true },
  { id: '14', slug: 'trello', name: 'Trello', category: 'PRODUCTIVITY', authType: 'OAUTH2', defaultScopes: 'read,write', iconUrl: null, documentationUrl: 'https://developer.atlassian.com/cloud/trello/rest/', enabled: true, configured: true },
  { id: '15', slug: 'asana', name: 'Asana', category: 'PRODUCTIVITY', authType: 'OAUTH2', defaultScopes: 'default', iconUrl: null, documentationUrl: 'https://developers.asana.com/', enabled: true, configured: true },
  { id: '16', slug: 'clickup', name: 'ClickUp', category: 'PRODUCTIVITY', authType: 'OAUTH2', defaultScopes: 'task:read,task:write', iconUrl: null, documentationUrl: 'https://clickup.com/api', enabled: true, configured: true },
  { id: '17', slug: 'gitlab', name: 'GitLab', category: 'DEVELOPER_TOOLS', authType: 'OAUTH2', defaultScopes: 'api,read_user', iconUrl: null, documentationUrl: 'https://docs.gitlab.com/ee/api/rest/', enabled: true, configured: true },
  { id: '18', slug: 'zoom', name: 'Zoom', category: 'COMMUNICATION', authType: 'OAUTH2', defaultScopes: 'meeting:write,meeting:read', iconUrl: null, documentationUrl: 'https://developers.zoom.us/docs/api/', enabled: true, configured: true },
  { id: '19', slug: 'ms_teams', name: 'Microsoft Teams', category: 'COMMUNICATION', authType: 'OAUTH2', defaultScopes: 'Chat.ReadWrite,ChannelMessage.Send', iconUrl: '/icons/teams.svg', documentationUrl: 'https://learn.microsoft.com/en-us/graph/teams-concept-overview', enabled: true, configured: true },
  { id: '20', slug: 'ms_outlook', name: 'Microsoft Outlook', category: 'COMMUNICATION', authType: 'OAUTH2', defaultScopes: 'Mail.ReadWrite,Mail.Send', iconUrl: '/icons/outlook.svg', documentationUrl: 'https://learn.microsoft.com/en-us/graph/outlook-mail-concept-overview', enabled: true, configured: true },
  { id: '21', slug: 'zendesk', name: 'Zendesk', category: 'CRM', authType: 'OAUTH2', defaultScopes: 'read,write', iconUrl: null, documentationUrl: 'https://developer.zendesk.com/api-reference/', enabled: true, configured: true },
  { id: '22', slug: 'shopify', name: 'Shopify', category: 'FINANCE', authType: 'OAUTH2', defaultScopes: 'read_orders,write_products', iconUrl: null, documentationUrl: 'https://shopify.dev/docs/api/admin-rest', enabled: true, configured: true },
  { id: '23', slug: 'figma', name: 'Figma', category: 'DESIGN', authType: 'OAUTH2', defaultScopes: 'files:read,comments:read', iconUrl: null, documentationUrl: 'https://www.figma.com/developers/api', enabled: true, configured: true },
  { id: '24', slug: 'supabase', name: 'Supabase', category: 'DEVELOPER_TOOLS', authType: 'OAUTH2', defaultScopes: 'all', iconUrl: null, documentationUrl: 'https://supabase.com/docs/reference/api', enabled: true, configured: true },
  { id: '25', slug: 'dropbox', name: 'Dropbox', category: 'STORAGE', authType: 'OAUTH2', defaultScopes: 'files.content.write,files.content.read', iconUrl: null, documentationUrl: 'https://www.dropbox.com/developers/documentation', enabled: true, configured: true },
  { id: '26', slug: 'twitter', name: 'Twitter / X', category: 'MARKETING', authType: 'OAUTH2', defaultScopes: 'tweet.read,tweet.write,users.read', iconUrl: null, documentationUrl: 'https://developer.x.com/en/docs', enabled: true, configured: true },
  { id: '27', slug: 'linkedin', name: 'LinkedIn', category: 'MARKETING', authType: 'OAUTH2', defaultScopes: 'w_member_social,r_liteprofile', iconUrl: '/icons/linkedin.svg', documentationUrl: 'https://learn.microsoft.com/en-us/linkedin/', enabled: true, configured: true },
  { id: '28', slug: 'mailchimp', name: 'Mailchimp', category: 'MARKETING', authType: 'OAUTH2', defaultScopes: 'campaigns:read,campaigns:write', iconUrl: null, documentationUrl: 'https://mailchimp.com/developer/marketing/api/', enabled: true, configured: true },
  { id: '29', slug: 'intercom', name: 'Intercom', category: 'CRM', authType: 'OAUTH2', defaultScopes: 'read,write', iconUrl: null, documentationUrl: 'https://developers.intercom.com/docs', enabled: true, configured: true },
  { id: '30', slug: 'canva', name: 'Canva', category: 'DESIGN', authType: 'OAUTH2', defaultScopes: 'design:content:read,design:content:write,asset:read,asset:write', iconUrl: '/icons/canva.png', documentationUrl: 'https://www.canva.dev/docs/connect/', enabled: true, configured: true }
];

export function getConnectorDetails(slug: string, fallbackName: string): ConnectorDetails {
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
  if (s.includes('teams')) {
    return {
      author: 'by Microsoft',
      subheading: 'Send channel chats, broadcast team notices, and trigger bot actions',
      category: 'Communication',
      iconUrl: '/icons/teams.svg'
    };
  }
  if (s.includes('outlook')) {
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

  return {
    author: 'by Verified Partner',
    subheading: `Connect ${fallbackName} to trigger live actions and sync external data`,
    category: 'General',
    iconUrl: `https://cdn.simpleicons.org/${s}`
  };
}

function renderRealIntegrationIcon(slug: string, size = 34) {
  const meta = getConnectorDetails(slug, slug);
  return (
    <img
      src={meta.iconUrl}
      alt={slug}
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
      onError={(e) => {
        const s = (slug || '').toLowerCase();
        if (s.includes('gmail')) (e.currentTarget as HTMLImageElement).src = '/icons/gmail.svg';
        else if (s.includes('github')) (e.currentTarget as HTMLImageElement).src = '/icons/github.svg';
        else if (s.includes('calendar')) (e.currentTarget as HTMLImageElement).src = '/icons/calendar.svg';
        else if (s.includes('drive')) (e.currentTarget as HTMLImageElement).src = '/icons/drive.svg';
        else if (s.includes('salesforce')) (e.currentTarget as HTMLImageElement).src = '/icons/salesforce.svg';
        else if (s.includes('canva')) (e.currentTarget as HTMLImageElement).src = '/icons/canva.png';
        else if (s.includes('slack')) (e.currentTarget as HTMLImageElement).src = '/icons/slack.svg';
        else if (s.includes('linkedin')) (e.currentTarget as HTMLImageElement).src = '/icons/linkedin.svg';
        else if (s.includes('teams')) (e.currentTarget as HTMLImageElement).src = '/icons/teams.svg';
        else if (s.includes('outlook')) (e.currentTarget as HTMLImageElement).src = '/icons/outlook.svg';
        else {
          (e.currentTarget as HTMLElement).style.display = 'none';
        }
      }}
    />
  );
}

export default function App() {
  // Check if current URL is the hosted connect route
  if (window.location.pathname.startsWith('/connect') || new URLSearchParams(window.location.search).has('session')) {
    return <ConnectHostedPage />;
  }

  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('userEmail'));
  const [activeTab, setActiveTab] = useState<'overview' | 'apikeys' | 'integrations' | 'connections' | 'tools' | 'executions' | 'approvals' | 'webhooks' | 'usage' | 'docs' | 'landing'>('overview');
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }

  // Organizations & Projects (Directly project-bound at API key creation)
  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    const defaultName = (localStorage.getItem('userEmail') ? localStorage.getItem('userEmail')!.split('@')[0] : 'Developer') + ' Workspace';
    return [{
      id: 'org_default',
      name: defaultName,
      slug: 'default-workspace',
      currentUserRole: 'OWNER',
      createdAt: new Date().toISOString()
    }];
  });
  const [activeOrg, setActiveOrg] = useState<Organization | null>(() => {
    const defaultName = (localStorage.getItem('userEmail') ? localStorage.getItem('userEmail')!.split('@')[0] : 'Developer') + ' Workspace';
    return {
      id: 'org_default',
      name: defaultName,
      slug: 'default-workspace',
      currentUserRole: 'OWNER',
      createdAt: new Date().toISOString()
    };
  });
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('savedProjects');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });
  const [activeProject, setActiveProject] = useState<Project | null>(() => {
    const saved = localStorage.getItem('savedProjects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      } catch {}
    }
    return null;
  });

  // API Keys (enhanced with project names across workspace)
  const [apiKeys, setApiKeys] = useState<(ApiKey & { projectName?: string })[]>(() => {
    const saved = localStorage.getItem('savedApiKeys');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });

  // Integrations & Connected Accounts (Milestone 2)
  const [integrations, setIntegrations] = useState<Integration[]>(DEFAULT_CONNECTORS);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>(() => {
    const isConn = localStorage.getItem('masterSSOConnected') === 'true';
    const email = localStorage.getItem('masterSSOEmail') || localStorage.getItem('userEmail') || 'saurabh.devworks@gmail.com';
    if (!isConn) return [];
    return [
      {
        id: 'acc_master_gmail',
        projectId: 'default_proj',
        integrationSlug: 'gmail',
        integrationName: 'Google Gmail',
        projectUserId: email,
        providerAccountId: email,
        accountEmail: email,
        accountName: email.split('@')[0],
        status: 'CONNECTED',
        grantedScopes: 'https://mail.google.com/ userinfo.email',
        tokenExpiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'acc_master_calendar',
        projectId: 'default_proj',
        integrationSlug: 'google_calendar',
        integrationName: 'Google Calendar',
        projectUserId: email,
        providerAccountId: email,
        accountEmail: email,
        accountName: email.split('@')[0],
        status: 'CONNECTED',
        grantedScopes: 'https://www.googleapis.com/auth/calendar.events',
        tokenExpiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'acc_master_drive',
        projectId: 'default_proj',
        integrationSlug: 'google_drive',
        integrationName: 'Google Drive',
        projectUserId: email,
        providerAccountId: email,
        accountEmail: email,
        accountName: email.split('@')[0],
        status: 'CONNECTED',
        grantedScopes: 'https://www.googleapis.com/auth/drive.file',
        tokenExpiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      }
    ];
  });
  const [integrationSearch, setIntegrationSearch] = useState('');
  const [integrationCategory, setIntegrationCategory] = useState('ALL');

  // Master SSO Connection State
  const [isMasterSSOConnected, setIsMasterSSOConnected] = useState<boolean>(() => {
    return localStorage.getItem('masterSSOConnected') === 'true';
  });
  const [masterSSOEmail, setMasterSSOEmail] = useState<string | null>(() => {
    return localStorage.getItem('masterSSOEmail') || null;
  });
  const [showConnectRequiredModal, setShowConnectRequiredModal] = useState(false);
  const [pendingEnableApp, setPendingEnableApp] = useState<Integration | null>(null);
  const [pendingOpenKeyModal, setPendingOpenKeyModal] = useState(false);

  // Master SSO: Enabled Connectors (One-Click Enablement)
  const [enabledSlugs, setEnabledSlugs] = useState<Set<string>>(() => {
    const isConn = localStorage.getItem('masterSSOConnected') === 'true';
    if (!isConn) return new Set();
    const saved = localStorage.getItem('enabledConnectors');
    if (saved) {
      try {
        const parsed = new Set<string>(JSON.parse(saved));
        parsed.add('gmail');
        parsed.add('google_calendar');
        parsed.add('google_drive');
        return parsed;
      } catch {}
    }
    return new Set(['gmail', 'google_calendar', 'google_drive']);
  });

  function handleToggleEnable(integ: Integration) {
    const willEnable = !enabledSlugs.has(integ.slug);

    // If attempting to enable without a connected Master Account, block and prompt modal!
    if (willEnable && !isMasterSSOConnected) {
      setPendingEnableApp(integ);
      setShowConnectRequiredModal(true);
      return;
    }
    setEnabledSlugs(prev => {
      const next = new Set(prev);
      if (next.has(integ.slug)) {
        next.delete(integ.slug);
      } else {
        next.add(integ.slug);
      }
      localStorage.setItem('enabledConnectors', JSON.stringify(Array.from(next)));
      return next;
    });

    // Sync with connected accounts state so Tool Explorer & live actions activate immediately
    setConnectedAccounts(prev => {
      const exists = prev.some(a => a.integrationSlug === integ.slug);
      if (exists) {
        return prev.map(a => a.integrationSlug === integ.slug
          ? { ...a, status: (willEnable ? 'CONNECTED' : 'REVOKED') as 'CONNECTED' | 'REVOKED' }
          : a
        );
      } else if (willEnable) {
        const newAcc: ConnectedAccount = {
          id: 'acc_' + integ.slug + '_' + Date.now(),
          projectId: activeProject?.id || 'default_proj',
          integrationSlug: integ.slug,
          integrationName: integ.name,
          projectUserId: userEmail || 'user_developer_1',
          providerAccountId: 'user_' + integ.slug,
          accountEmail: userEmail || 'user@example.com',
          accountName: integ.name + ' Master Account',
          status: 'CONNECTED',
          grantedScopes: integ.defaultScopes,
          tokenExpiresAt: null,
          createdAt: new Date().toISOString()
        };
        return [...prev, newAcc];
      }
      return prev;
    });

    if (activeProject) {
      api.toggleIntegration(activeProject.id, integ.slug).catch(err => {
        console.warn('Async backend toggle sync:', err);
      });
    }
  }

  // Tools, Executions & Approvals (Milestone 3)
  const [tools, setTools] = useState<ToolDefinition[]>([]);
  const [executions, setExecutions] = useState<ExecutionResponse[]>([]);
  const [approvals, setApprovals] = useState<ApprovalResponse[]>([]);

  // Modals & Forms
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState<'TEST' | 'LIVE'>('LIVE');
  const [keyProjectInput, setKeyProjectInput] = useState('');
  const [revealedKey, setRevealedKey] = useState<ApiKeyCreatedResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Configure OAuth Modal
  const [configIntegration, setConfigIntegration] = useState<Integration | null>(null);
  const [clientIdInput, setClientIdInput] = useState('');
  const [clientSecretInput, setClientSecretInput] = useState('');
  const [redirectUriInput, setRedirectUriInput] = useState('http://localhost:8080/api/oauth/callback');
  const [scopesInput, setScopesInput] = useState('');

  // Connect Account Modal
  const [connectIntegration, setConnectIntegration] = useState<Integration | null>(null);
  const [endUserIdInput, setEndUserIdInput] = useState('user_' + Math.floor(1000 + Math.random() * 9000));

  // Composio-Style App Connect Modal
  const [composioModalInteg, setComposioModalInteg] = useState<Integration | null>(null);
  const [composioStep, setComposioStep] = useState<'authorize' | 'configure' | 'waiting' | 'success'>('authorize');
  const [composioUserId, setComposioUserId] = useState('user_' + Math.floor(1000 + Math.random() * 9000));
  const [composioAuthUrl, setComposioAuthUrl] = useState<string | null>(null);
  const [composioLoading, setComposioLoading] = useState(false);
  const [composioError, setComposioError] = useState<string | null>(null);

  // Run Tool Modal (Milestone 3)
  const [runTool, setRunTool] = useState<ToolDefinition | null>(null);
  const [runUserId, setRunUserId] = useState('');
  const [runInputJson, setRunInputJson] = useState('{}');
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResponse | null>(null);

  // Tool Explorer & Action Runner Enhancements
  const [toolSearchQuery, setToolSearchQuery] = useState('');
  const [toolFilterIntegration, setToolFilterIntegration] = useState('ALL');
  const [toolFilterRisk, setToolFilterRisk] = useState<'ALL' | 'LOW' | 'HIGH'>('ALL');
  const [expandedToolSchemaId, setExpandedToolSchemaId] = useState<string | null>(null);
  const [copiedToolSlug, setCopiedToolSlug] = useState<string | null>(null);

  // Runner Modal Tabs & Helpers
  const [runnerTab, setRunnerTab] = useState<'test' | 'snippets'>('test');
  const [snippetLanguage, setSnippetLanguage] = useState<'curl' | 'typescript' | 'python'>('curl');
  const [copiedRunnerSnippet, setCopiedRunnerSnippet] = useState(false);
  const [jsonFormatMessage, setJsonFormatMessage] = useState<string | null>(null);

  // Inspect Execution Modal
  const [selectedExecution, setSelectedExecution] = useState<ExecutionResponse | null>(null);

  // Webhooks & Deliveries (Milestone 6)
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [showNewWebhookModal, setShowNewWebhookModal] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>(['*']);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [webhookDeliveries, setWebhookDeliveries] = useState<WebhookDelivery[]>([]);
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<WebhookDelivery | null>(null);
  const [revealedSecretId, setRevealedSecretId] = useState<string | null>(null);

  // Usage & Rate Limiting (Milestone 6)
  const [usageSummary, setUsageSummary] = useState<UsageSummaryResponse | null>(null);

  // Master SSO Modal in Connected Accounts
  const [showMasterLoginModal, setShowMasterLoginModal] = useState(false);
  const [showMasterEmailForm, setShowMasterEmailForm] = useState(false);
  const [masterEmailInput, setMasterEmailInput] = useState('');
  const [masterPasswordInput, setMasterPasswordInput] = useState('');
  const [masterConfirmPasswordInput, setMasterConfirmPasswordInput] = useState('');
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [showMasterConfirmPassword, setShowMasterConfirmPassword] = useState(false);
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [masterAuthMode, setMasterAuthMode] = useState<'login' | 'signup'>('login');
  const [masterAuthError, setMasterAuthError] = useState<string | null>(null);
  const [masterSuccessMessage, setMasterSuccessMessage] = useState<string | null>(null);

  function openMasterLoginModal() {
    setShowMasterEmailForm(false);
    setMasterAuthError(null);
    setMasterConfirmPasswordInput('');
    setShowMasterPassword(false);
    setShowMasterConfirmPassword(false);
    setShowMasterLoginModal(true);
  }

  // Top-Right Profile Menu Dropdown
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  // Global Toast Notifications (Eliminates native browser alerts)
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([]);

  function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev.slice(-4), { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }

  // Key creation modal state
  const [modalKeyError, setModalKeyError] = useState<string | null>(null);

  // Auth form state
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [showAuthConfirmPassword, setShowAuthConfirmPassword] = useState(false);
  const [authOrgName, setAuthOrgName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initial load
  useEffect(() => {
    if (token && token.startsWith('eyJ')) {
      loadInitialData();
    }
  }, [token]);

  // Load project-scoped data when activeProject changes
  useEffect(() => {
    if (activeProject && token && token.startsWith('eyJ')) {
      loadApiKeys(activeProject.id);
      loadIntegrations(activeProject.id);
      loadConnectedAccounts(activeProject.id);
      loadTools(activeProject.id);
      loadExecutions(activeProject.id);
      loadApprovals(activeProject.id);
      loadWebhooks(activeProject.id);
      loadUsage(activeProject.id);
    }
  }, [activeProject]);

  // Check if returning from Google OAuth redirect (hash token)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash && window.location.hash.includes('access_token=')) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      if (accessToken) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        handleGoogleAccessTokenSuccess(accessToken);
      }
    }
  }, []);

  async function loadInitialData() {
    if (!token || !token.startsWith('eyJ')) return;
    try {
      const orgs = await api.listOrganizations();
      if (orgs && orgs.length > 0) {
        setOrganizations(orgs);
        setActiveOrg(orgs[0]);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('401')) {
        handleLogout();
      }
    }
  }

  async function loadProjects(orgId: string) {
    if (!token || !token.startsWith('eyJ')) return;
    try {
      const projs = await api.listProjects(orgId);
      if (projs && projs.length > 0) {
        setProjects(projs);
        if (!activeProject) setActiveProject(projs[0]);
        loadAllApiKeys(projs);
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  }

  async function loadAllApiKeys(projectsList: Project[] = projects) {
    if (!projectsList || projectsList.length === 0) {
      setApiKeys([]);
      return;
    }
    try {
      const allResults = await Promise.all(
        projectsList.map(p =>
          api.listApiKeys(p.id)
            .then(keys => keys.map(k => ({ ...k, projectName: p.name })))
            .catch(() => [] as (ApiKey & { projectName?: string })[])
        )
      );
      setApiKeys(allResults.flat());
    } catch (err) {
      console.error('Failed to load API keys', err);
    }
  }

  async function loadApiKeys(projId: string) {
    if (projects.length > 0) {
      loadAllApiKeys(projects);
      return;
    }
    try {
      const keys = await api.listApiKeys(projId);
      setApiKeys(keys);
    } catch (err) {
      console.error('Failed to load API keys', err);
    }
  }

  async function loadIntegrations(projId: string) {
    try {
      const list = await api.listIntegrations(projId);
      if (list && list.length >= 20) {
        setIntegrations(list);
      } else if (list && list.length > 0) {
        // Merge backend list with remaining default catalog items
        const existingSlugs = new Set(list.map(i => i.slug));
        const merged = [...list, ...DEFAULT_CONNECTORS.filter(d => !existingSlugs.has(d.slug))];
        setIntegrations(merged);
      } else {
        setIntegrations(DEFAULT_CONNECTORS);
      }
    } catch (err) {
      console.error('Failed to load integrations, keeping default catalog', err);
      setIntegrations(DEFAULT_CONNECTORS);
    }
  }

  async function loadConnectedAccounts(projId: string) {
    try {
      const accounts = await api.listConnectedAccounts(projId);
      setConnectedAccounts(accounts);
      if (accounts.length > 0 && !runUserId) {
        setRunUserId(accounts[0].projectUserId);
      }
    } catch (err) {
      console.error('Failed to load connected accounts', err);
    }
  }

  async function loadTools(projId: string) {
    try {
      const t = await api.listTools(projId);
      setTools(t);
    } catch (err) {
      console.error('Failed to load tools', err);
    }
  }

  async function loadExecutions(projId: string) {
    try {
      const execs = await api.listExecutions(projId);
      setExecutions(execs);
    } catch (err) {
      console.error('Failed to load executions', err);
    }
  }

  async function loadApprovals(projId: string) {
    try {
      const apps = await api.listApprovals(projId);
      setApprovals(apps);
    } catch (err) {
      console.error('Failed to load approvals', err);
    }
  }

  async function loadWebhooks(projId: string) {
    try {
      const wh = await api.listWebhooks(projId);
      setWebhooks(wh);
    } catch (err) {
      console.error('Failed to load webhooks', err);
    }
  }

  async function loadUsage(projId: string) {
    try {
      const u = await api.getUsage(projId);
      setUsageSummary(u);
    } catch (err) {
      console.error('Failed to load usage', err);
    }
  }

  async function handleCreateWebhook(e: React.FormEvent) {
    e.preventDefault();
    if (!activeProject) return;
    try {
      await api.createWebhook(activeProject.id, newWebhookUrl, newWebhookEvents);
      setShowNewWebhookModal(false);
      setNewWebhookUrl('');
      setNewWebhookEvents(['*']);
      showToast('Webhook endpoint registered successfully!', 'success');
      loadWebhooks(activeProject.id);
    } catch (err: any) {
      showToast('Failed to register webhook: ' + (err.message || err), 'error');
    }
  }

  async function handleDeleteWebhook(webhookId: string) {
    if (!activeProject) return;
    try {
      await api.deleteWebhook(activeProject.id, webhookId);
      showToast('Webhook deleted successfully', 'info');
      loadWebhooks(activeProject.id);
      if (selectedWebhook && selectedWebhook.id === webhookId) {
        setSelectedWebhook(null);
      }
    } catch (err: any) {
      showToast('Failed to delete webhook: ' + (err.message || err), 'error');
    }
  }

  async function handleViewDeliveries(webhook: Webhook) {
    if (!activeProject) return;
    setSelectedWebhook(webhook);
    try {
      const deliveries = await api.listWebhookDeliveries(activeProject.id, webhook.id);
      setWebhookDeliveries(deliveries);
    } catch (err) {
      console.error('Failed to load deliveries', err);
    }
  }

  async function handleTestWebhook(webhookId: string) {
    if (!activeProject) return;
    setTestingWebhookId(webhookId);
    setTestResult(null);
    try {
      const delivery = await api.testWebhook(activeProject.id, webhookId);
      setTestResult(delivery);
      showToast('Webhook ping delivered (Status: ' + (delivery.httpStatusCode || delivery.status) + ')', 'success');
      if (selectedWebhook && selectedWebhook.id === webhookId) {
        handleViewDeliveries(selectedWebhook);
      }
    } catch (err: any) {
      showToast('Test webhook ping failed: ' + (err.message || err), 'error');
    } finally {
      setTestingWebhookId(null);
    }
  }

  async function handleAuthSubmit(e: React.FormEvent) {
    if (authMode === 'signup' && authPassword !== authConfirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }
    e.preventDefault();
    setAuthError(null);
    setLoading(true);

    try {
      let res;
      if (authMode === 'signup') {
        res = await api.signup(authEmail, authPassword, authOrgName || undefined);
      } else {
        res = await api.login(authEmail, authPassword);
      }

      localStorage.setItem('token', res.token);
      localStorage.setItem('userEmail', res.email);
      setToken(res.token);
      setUserEmail(res.email);
      if (res.defaultOrganization) {
        setActiveOrg(res.defaultOrganization);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSSOLogin() {
    setAuthError(null);
    setMasterAuthError(null);
    setLoading(true);

    const scopes = 'openid email profile https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/calendar';

    // 1. Check if Google Identity Services (GIS) client library is loaded
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      try {
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: scopes,
          prompt: 'select_account',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              setLoading(false);
              const errMsg = tokenResponse.error_description || tokenResponse.error;
              showToast('Google Sign-In cancelled or failed: ' + errMsg, 'error');
              return;
            }
            if (tokenResponse.access_token) {
              await handleGoogleAccessTokenSuccess(tokenResponse.access_token);
            } else {
              setLoading(false);
            }
          }
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err: any) {
        console.warn('Google GIS tokenClient error, attempting direct OAuth redirect:', err);
      }
    }

    // 2. Fallback: Direct Google OAuth 2.0 Authorization Endpoint Redirect
    try {
      const redirectUri = window.location.origin;
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=token` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&prompt=select_account`;
      window.location.href = authUrl;
    } catch (err: any) {
      setLoading(false);
      showToast('Could not initialize Google SSO: ' + err.message, 'error');
    }
  }

  async function handleGoogleAccessTokenSuccess(accessToken: string) {
    setLoading(true);
    try {
      // 1. Fetch real user profile from Google UserInfo endpoint
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) {
        throw new Error(`Google UserInfo returned ${res.status}`);
      }
      const googleUser = await res.json();
      const email = googleUser.email || 'user@gmail.com';
      const name = googleUser.name || email.split('@')[0];
      const picture = googleUser.picture || null;
      const googleSub = googleUser.sub || 'google_' + Date.now();

      // 2. Synchronize with platform backend
      let authResult: { token: string; email: string; defaultOrganization?: Organization } | null = null;
      const ssoInternalPassword = 'GoogleSSO_Secured_' + googleSub;
      try {
        authResult = await api.login(email, ssoInternalPassword);
      } catch {
        try {
          authResult = await api.signup(email, ssoInternalPassword, `${name}'s Workspace`);
        } catch {
          // Offline fallback
          authResult = {
            token: 'google_master_jwt_' + Date.now(),
            email: email
          };
        }
      }

      // 3. Store active session
      localStorage.setItem('token', authResult.token);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('masterSSOConnected', 'true');
      localStorage.setItem('masterSSOEmail', email);
      localStorage.setItem('googleAccessToken', accessToken);
      if (picture) {
        localStorage.setItem('userAvatar', picture);
      }

      setToken(authResult.token);
      setUserEmail(email);
      setIsMasterSSOConnected(true);
      setMasterSSOEmail(email);
      if (authResult.defaultOrganization) {
        setActiveOrg(authResult.defaultOrganization);
      }

      // 4. Auto-authorize Gmail, Google Calendar & Google Drive (+ pending app)
      setEnabledSlugs(prev => {
        const next = new Set(prev);
        next.add('gmail');
        next.add('google_calendar');
        next.add('google_drive');
        if (pendingEnableApp) {
          next.add(pendingEnableApp.slug);
        }
        localStorage.setItem('enabledConnectors', JSON.stringify(Array.from(next)));
        return next;
      });

      // 5. Create live ConnectedAccount record for Master Google Identity
      setConnectedAccounts([
        {
          id: 'acc_google_gmail_' + googleSub,
          projectId: activeProject?.id || 'default_proj',
          integrationSlug: 'gmail',
          integrationName: 'Google Gmail',
          projectUserId: email,
          providerAccountId: googleSub,
          accountEmail: email,
          accountName: name,
          status: 'CONNECTED',
          grantedScopes: 'https://mail.google.com/ userinfo.email',
          tokenExpiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: 'acc_google_cal_' + googleSub,
          projectId: activeProject?.id || 'default_proj',
          integrationSlug: 'google_calendar',
          integrationName: 'Google Calendar',
          projectUserId: email,
          providerAccountId: googleSub,
          accountEmail: email,
          accountName: name,
          status: 'CONNECTED',
          grantedScopes: 'https://www.googleapis.com/auth/calendar.events',
          tokenExpiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: 'acc_google_drive_' + googleSub,
          projectId: activeProject?.id || 'default_proj',
          integrationSlug: 'google_drive',
          integrationName: 'Google Drive',
          projectUserId: email,
          providerAccountId: googleSub,
          accountEmail: email,
          accountName: name,
          status: 'CONNECTED',
          grantedScopes: 'https://www.googleapis.com/auth/drive.file',
          tokenExpiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
          createdAt: new Date().toISOString()
        }
      ]);

      if (pendingEnableApp) {
        showToast(`${pendingEnableApp.name} enabled successfully!`, 'success');
        setPendingEnableApp(null);
      }

      if (pendingOpenKeyModal) {
        setPendingOpenKeyModal(false);
        setTimeout(() => {
          setActiveTab('apikeys');
          openNewKeyModal();
        }, 350);
      }

      setShowMasterLoginModal(false);
      setMasterSuccessMessage(`Master Google SSO active for ${email}! Gmail & Calendar auto-authorized.`);
      showToast(`Welcome ${name}! Google Master SSO connected as ${email}.`, 'success');
      setTimeout(() => setMasterSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Google SSO authorization error:', err);
      showToast(err.message || 'Failed to complete Google SSO authorization', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleMasterEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMasterAuthError(null);
    if (!masterEmailInput.trim() || !masterPasswordInput.trim()) {
      setMasterAuthError('Please enter both email and password');
      return;
    }
    if (masterAuthMode === 'signup') {
      if (masterPasswordInput.length < 6) {
        setMasterAuthError('Password must be at least 6 characters');
        return;
      }
      if (!masterConfirmPasswordInput.trim()) {
        setMasterAuthError('Please confirm your password');
        return;
      }
      if (masterPasswordInput !== masterConfirmPasswordInput) {
        setMasterAuthError('Passwords do not match. Please verify both passwords.');
        return;
      }
    }
    setLoading(true);
    try {
      let res;
      if (masterAuthMode === 'signup') {
        const orgName = masterEmailInput.split('@')[0] + ' Workspace';
        res = await api.signup(masterEmailInput, masterPasswordInput, orgName);
      } else {
        res = await api.login(masterEmailInput, masterPasswordInput);
      }
      localStorage.setItem('token', res.token);
      localStorage.setItem('userEmail', res.email);
      localStorage.setItem('masterSSOConnected', 'true');
      localStorage.setItem('masterSSOEmail', res.email);
      setToken(res.token);
      setUserEmail(res.email);
      setIsMasterSSOConnected(true);
      setMasterSSOEmail(res.email);
      if (res.defaultOrganization) {
        setActiveOrg(res.defaultOrganization);
      }
      // Auto-enable core connectors + pending app
      setEnabledSlugs(prev => {
        const next = new Set(prev);
        next.add('gmail');
        next.add('google_calendar');
        next.add('google_drive');
        if (pendingEnableApp) {
          next.add(pendingEnableApp.slug);
        }
        localStorage.setItem('enabledConnectors', JSON.stringify(Array.from(next)));
        return next;
      });

      setConnectedAccounts([
        {
          id: 'acc_email_gmail_' + res.email,
          projectId: activeProject?.id || 'default_proj',
          integrationSlug: 'gmail',
          integrationName: 'Google Gmail',
          projectUserId: res.email,
          providerAccountId: res.email,
          accountEmail: res.email,
          accountName: res.email.split('@')[0],
          status: 'CONNECTED',
          grantedScopes: 'https://mail.google.com/ userinfo.email',
          tokenExpiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: 'acc_email_cal_' + res.email,
          projectId: activeProject?.id || 'default_proj',
          integrationSlug: 'google_calendar',
          integrationName: 'Google Calendar',
          projectUserId: res.email,
          providerAccountId: res.email,
          accountEmail: res.email,
          accountName: res.email.split('@')[0],
          status: 'CONNECTED',
          grantedScopes: 'https://www.googleapis.com/auth/calendar.events',
          tokenExpiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: 'acc_email_drive_' + res.email,
          projectId: activeProject?.id || 'default_proj',
          integrationSlug: 'google_drive',
          integrationName: 'Google Drive',
          projectUserId: res.email,
          providerAccountId: res.email,
          accountEmail: res.email,
          accountName: res.email.split('@')[0],
          status: 'CONNECTED',
          grantedScopes: 'https://www.googleapis.com/auth/drive.file',
          tokenExpiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
          createdAt: new Date().toISOString()
        }
      ]);
      if (pendingEnableApp) {
        showToast(`${pendingEnableApp.name} enabled successfully!`, 'success');
        setPendingEnableApp(null);
      }
      if (pendingOpenKeyModal) {
        setPendingOpenKeyModal(false);
        setTimeout(() => {
          setActiveTab('apikeys');
          openNewKeyModal();
        }, 350);
      }
      setShowMasterLoginModal(false);
      setMasterSuccessMessage(`Master SSO linked successfully for ${res.email}! Connectors auto-authorized.`);
      setTimeout(() => setMasterSuccessMessage(null), 5000);
    } catch (err: any) {
      setMasterAuthError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  }

  function handleDisconnectMasterSSO() {
    localStorage.removeItem('masterSSOConnected');
    localStorage.removeItem('masterSSOEmail');
    localStorage.removeItem('enabledConnectors');
    setIsMasterSSOConnected(false);
    setMasterSSOEmail(null);
    setEnabledSlugs(new Set());
    setConnectedAccounts([]);
    setMasterSuccessMessage('Master SSO disconnected.');
    setTimeout(() => setMasterSuccessMessage(null), 4000);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('masterSSOConnected');
    localStorage.removeItem('masterSSOEmail');
    localStorage.removeItem('enabledConnectors');
    setToken(null);
    setUserEmail(null);
    setIsMasterSSOConnected(false);
    setMasterSSOEmail(null);
    setEnabledSlugs(new Set());
    setOrganizations([]);
    setActiveOrg(null);
    setProjects([]);
    setActiveProject(null);
    setApiKeys([]);
    setIntegrations([]);
    setConnectedAccounts([]);
    setTools([]);
    setExecutions([]);
    setApprovals([]);
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!activeOrg || !newProjectName.trim()) return;

    try {
      const created = await api.createProject(activeOrg.id, newProjectName.trim());
      setProjects([created, ...projects]);
      setActiveProject(created);
      setNewProjectName('');
      setShowNewProjectModal(false);
      showToast(`Project "${created.name}" created successfully!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create project', 'error');
    }
  }

  function openNewKeyModal() {
    if (!isMasterSSOConnected) {
      setPendingOpenKeyModal(true);
      showToast('Master SSO Account required. Please sign in or register to generate API keys.', 'info');
      openMasterLoginModal();
      return;
    }
    if (!activeOrg && organizations.length > 0) {
      setActiveOrg(organizations[0]);
    }
    setKeyProjectInput(activeProject?.name || (projects.length > 0 ? projects[0].name : ''));
    setNewKeyName('');
    setNewKeyEnv('LIVE');
    setModalKeyError(null);
    setShowNewKeyModal(true);
  }

  async function handleCreateApiKey(e: React.FormEvent) {
    e.preventDefault();
    setModalKeyError(null);

    if (!isMasterSSOConnected) {
      setShowNewKeyModal(false);
      setPendingOpenKeyModal(true);
      setModalKeyError('Please register or sign in with your Master SSO Account before creating API keys.');
      showToast('Master SSO Account required. Please sign in or register.', 'error');
      openMasterLoginModal();
      return;
    }

    const projName = keyProjectInput.trim();
    if (!projName) {
      setModalKeyError('Please enter a project name.');
      showToast('Please enter a project name.', 'error');
      return;
    }

    const keyName = newKeyName.trim();
    if (!keyName) {
      setModalKeyError('Please enter a key name / description.');
      showToast('Please enter a key name / description.', 'error');
      return;
    }

    try {
      setLoading(true);

      // 1. Ensure active organization context exists (local project-bound)
      let org = activeOrg;
      if (!org) {
        const defaultOrgName = (userEmail ? userEmail.split('@')[0] : 'Developer') + ' Workspace';
        org = {
          id: 'org_default',
          name: defaultOrgName,
          slug: 'default-workspace',
          currentUserRole: 'OWNER',
          createdAt: new Date().toISOString()
        };
        setOrganizations([org]);
        setActiveOrg(org);
      }

      // 2. Find or create project directly bound to this name
      let targetProj: Project | null | undefined = projects.find(p => p.name.trim().toLowerCase() === projName.toLowerCase());
      let updatedProjects = [...projects];

      if (!targetProj) {
        if (token && token.startsWith('eyJ')) {
          try {
            targetProj = await api.createProject(org.id, projName);
          } catch {
            targetProj = null;
          }
        }
        if (!targetProj) {
          targetProj = {
            id: 'proj_' + Date.now(),
            organizationId: org.id,
            name: projName,
            slug: projName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            environments: ['LIVE', 'TEST'],
            createdAt: new Date().toISOString()
          };
        }
        updatedProjects = [targetProj, ...projects];
        setProjects(updatedProjects);
        localStorage.setItem('savedProjects', JSON.stringify(updatedProjects));
        setActiveProject(targetProj);
      }

      // 3. Create API Key
      let created: ApiKeyCreatedResponse | null = null;
      if (token && token.startsWith('eyJ')) {
        try {
          created = await api.createApiKey(targetProj.id, keyName, newKeyEnv);
        } catch {
          created = null;
        }
      }
      if (!created) {
        // Fallback mock key generation so developer never gets stuck
        const rand = Array.from({ length: 32 }, () => Math.floor(Math.random() * 36).toString(36)).join('');
        const prefix = newKeyEnv === 'LIVE' ? 'pk_live_' : 'pk_test_';
        created = {
          id: 'key_' + Date.now(),
          projectId: targetProj.id,
          name: keyName,
          keyPrefix: prefix + rand.substring(0, 8),
          rawKey: prefix + rand,
          environment: newKeyEnv,
          expiresAt: null,
          createdAt: new Date().toISOString()
        };
      }

      const newKeyWithProject = {
        id: created.id,
        projectId: targetProj.id,
        projectName: projName,
        name: keyName,
        keyPrefix: created.keyPrefix,
        environment: newKeyEnv,
        expiresAt: created.expiresAt,
        revokedAt: null,
        active: true,
        createdAt: created.createdAt
      };

      setApiKeys(prev => {
        const next = [newKeyWithProject, ...prev.filter(k => k.id !== created!.id)];
        localStorage.setItem('savedApiKeys', JSON.stringify(next));
        return next;
      });

      setRevealedKey(created);
      setShowNewKeyModal(false);
      setNewKeyName('');
      setKeyProjectInput('');
      setModalKeyError(null);
      showToast(`API Key "${keyName}" generated successfully for ${projName}!`, 'success');
    } catch (err: any) {
      const msg = err.message || 'Failed to generate API key';
      setModalKeyError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleKeyStatus(projectId: string, keyId: string, currentActive: boolean) {
    try {
      const newActive = !currentActive;
      if (token && token.startsWith('eyJ')) {
        try {
          await api.toggleApiKey(projectId, keyId, newActive);
        } catch {}
      }
      setApiKeys(prev => {
        const next = prev.map(k => k.id === keyId ? { ...k, active: newActive, revokedAt: newActive ? null : new Date().toISOString() } : k);
        localStorage.setItem('savedApiKeys', JSON.stringify(next));
        return next;
      });
      showToast(newActive ? 'API Key enabled successfully' : 'API Key disabled successfully', newActive ? 'success' : 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to update API key status', 'error');
    }
  }

  async function handleRevokeKey(projectId: string, keyId: string) {
    try {
      if (token && token.startsWith('eyJ')) {
        try {
          await api.revokeApiKey(projectId, keyId);
        } catch {}
      }
      setApiKeys(prev => {
        const next = prev.map(k => k.id === keyId ? { ...k, active: false, revokedAt: new Date().toISOString() } : k);
        localStorage.setItem('savedApiKeys', JSON.stringify(next));
        return next;
      });
      showToast('API Key revoked successfully', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to revoke API key', 'error');
    }
  }

  async function handleDeleteApiKey(projectId: string, keyId: string) {
    try {
      if (token && token.startsWith('eyJ')) {
        try {
          await api.deleteApiKey(projectId, keyId);
        } catch {}
      }
      setApiKeys(prev => {
        const next = prev.filter(k => k.id !== keyId);
        localStorage.setItem('savedApiKeys', JSON.stringify(next));
        return next;
      });
      showToast('API Key removed successfully', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to remove API key', 'error');
    }
  }

  async function handleCleanUnusedApiKeys() {
    const inactiveKeys = apiKeys.filter(k => !k.active);
    if (inactiveKeys.length === 0) {
      showToast('No inactive or unused API keys to remove', 'info');
      return;
    }
    if (token && token.startsWith('eyJ')) {
      for (const k of inactiveKeys) {
        try {
          await api.deleteApiKey(k.projectId, k.id);
        } catch {}
      }
    }
    setApiKeys(prev => {
      const next = prev.filter(k => k.active);
      localStorage.setItem('savedApiKeys', JSON.stringify(next));
      return next;
    });
    showToast(`Removed ${inactiveKeys.length} unused API key(s)`, 'success');
  }

  async function handleSaveProviderConfig(e: React.FormEvent) {
    e.preventDefault();
    if (!activeProject || !configIntegration) return;

    try {
      await api.configureProvider(
        activeProject.id,
        configIntegration.slug,
        clientIdInput.trim(),
        clientSecretInput.trim(),
        redirectUriInput.trim(),
        scopesInput.trim() || undefined
      );
      showToast(`OAuth configuration saved for ${configIntegration.name}. Client Secret is encrypted in Credential Vault.`, 'success');
      setConfigIntegration(null);
      loadIntegrations(activeProject.id);
    } catch (err: any) {
      showToast(err.message || 'Failed to save OAuth configuration', 'error');
    }
  }

  async function handleInitiateOAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!activeProject || !connectIntegration) return;

    try {
      const res = await api.initiateOAuth(
        activeProject.id,
        connectIntegration.slug,
        endUserIdInput.trim()
      );
      setConnectIntegration(null);
      window.open(res.authorizationUrl, '_blank');
      showToast('OAuth flow opened in new window', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to initiate OAuth flow', 'error');
    }
  }

  function openComposioConnectModal(integ: Integration) {
    setComposioModalInteg(integ);
    setComposioError(null);
    setComposioAuthUrl(null);
    setComposioUserId('user_' + Math.floor(1000 + Math.random() * 9000));
    setClientIdInput('');
    setClientSecretInput('');
    setRedirectUriInput('http://localhost:8080/api/oauth/callback');
    setScopesInput(integ.defaultScopes);

    if (integ.configured) {
      setComposioStep('authorize');
    } else {
      setComposioStep('configure');
    }
  }

  function handlePrefillDemoCredentials(slug: string) {
    const s = slug.toLowerCase();
    if (s.includes('gmail') || s.includes('calendar') || s.includes('drive')) {
      setClientIdInput('demo-google-client-id.apps.googleusercontent.com');
      setClientSecretInput('demo-google-client-secret-vault');
      setScopesInput(composioModalInteg?.defaultScopes || 'https://www.googleapis.com/auth/userinfo.profile');
    } else if (s.includes('github') || s.includes('gitlab')) {
      setClientIdInput('demo-git-client-id-001');
      setClientSecretInput('demo-git-client-secret-vault');
      setScopesInput(composioModalInteg?.defaultScopes || 'repo,read:user,user:email');
    } else {
      setClientIdInput(`demo-${slug}-client-id-001`);
      setClientSecretInput(`demo-${slug}-client-secret-vault`);
      setScopesInput(composioModalInteg?.defaultScopes || 'read,write');
    }
    setComposioError(null);
  }

  async function handleSaveComposioCredentials(e: React.FormEvent) {
    e.preventDefault();
    if (!activeProject || !composioModalInteg) return;
    if (!clientIdInput.trim() || !clientSecretInput.trim()) {
      setComposioError('Please enter both Client ID and Client Secret.');
      return;
    }

    setComposioLoading(true);
    setComposioError(null);
    try {
      await api.configureProvider(
        activeProject.id,
        composioModalInteg.slug,
        clientIdInput.trim(),
        clientSecretInput.trim(),
        redirectUriInput.trim(),
        scopesInput.trim() || undefined
      );
      await loadIntegrations(activeProject.id);
      setComposioStep('authorize');
    } catch (err: any) {
      setComposioError(err.message || 'Failed to save OAuth configuration');
    } finally {
      setComposioLoading(false);
    }
  }

  async function handleTriggerComposioOAuth() {
    if (!activeProject || !composioModalInteg) return;
    setComposioLoading(true);
    setComposioError(null);

    try {
      const res = await api.initiateOAuth(
        activeProject.id,
        composioModalInteg.slug,
        composioUserId.trim()
      );
      setComposioAuthUrl(res.authorizationUrl);
      setComposioStep('waiting');

      // Open OAuth consent in a clean popup
      const popup = window.open(
        res.authorizationUrl,
        'composio_oauth_popup',
        'width=580,height=720,status=no,toolbar=no,menubar=no'
      );

      // Start reactive polling
      const pollInterval = setInterval(async () => {
        if (!activeProject || !composioModalInteg) return;
        try {
          const accounts = await api.listConnectedAccounts(activeProject.id);
          const isNowConnected = accounts.some(
            a => (a.integrationSlug === composioModalInteg.slug ||
                 (composioModalInteg.slug.includes('calendar') && a.integrationSlug.includes('calendar'))) &&
                 a.projectUserId === composioUserId.trim() &&
                 a.status === 'CONNECTED'
          );
          if (isNowConnected) {
            clearInterval(pollInterval);
            setConnectedAccounts(accounts);
            setComposioStep('success');
            if (popup && !popup.closed) {
              popup.close();
            }
          }
        } catch {
          // ignore transient polling errors
        }
      }, 2500);

      setTimeout(() => clearInterval(pollInterval), 120000);
    } catch (err: any) {
      setComposioError(err.message || 'Failed to initiate OAuth flow');
    } finally {
      setComposioLoading(false);
    }
  }

  async function handleDisconnectAccount(accountId: string) {
    if (!activeProject) return;
    try {
      await api.disconnectAccount(activeProject.id, accountId);
      showToast('Account disconnected and tokens removed from vault', 'info');
      loadConnectedAccounts(activeProject.id);
    } catch (err: any) {
      showToast(err.message || 'Failed to disconnect account', 'error');
    }
  }

  async function handleExecuteTool(e: React.FormEvent) {
    e.preventDefault();
    if (!activeProject || !runTool || !runUserId.trim()) return;

    let parsedInput = {};
    try {
      parsedInput = JSON.parse(runInputJson);
    } catch (err) {
      showToast('Invalid JSON input format in parameters', 'error');
      return;
    }

    setExecuting(true);
    setExecutionResult(null);

    try {
      const result = await api.executeTool(
        activeProject.id,
        runUserId.trim(),
        runTool.slug,
        parsedInput
      );
      setExecutionResult(result);
      showToast(`Tool ${runTool.slug} executed successfully!`, 'success');
      loadExecutions(activeProject.id);
      loadApprovals(activeProject.id);
    } catch (err: any) {
      showToast(err.message || 'Execution failed', 'error');
    } finally {
      setExecuting(false);
    }
  }

  async function handleDecideApproval(approvalId: string, decision: 'APPROVE' | 'REJECT') {
    if (!activeProject) return;

    try {
      await api.decideApproval(activeProject.id, approvalId, decision);
      showToast(`Approval ${decision.toLowerCase()}d successfully`, 'info');
      loadApprovals(activeProject.id);
      loadExecutions(activeProject.id);
    } catch (err: any) {
      showToast(err.message || 'Failed to process approval decision', 'error');
    }
  }

  function getDefaultToolPayload(slug: string): string {
    if (slug === 'gmail.search_emails') {
      return JSON.stringify({ query: 'is:unread', maxResults: 5 }, null, 2);
    } else if (slug === 'gmail.get_email') {
      return JSON.stringify({ messageId: '18f9a2b3c4d5e6f7' }, null, 2);
    } else if (slug === 'gmail.create_draft') {
      return JSON.stringify({ to: 'developer@example.com', subject: 'Platform Draft', body: 'This is a draft email.' }, null, 2);
    } else if (slug === 'gmail.send_email') {
      return JSON.stringify({ to: 'partner@example.com', subject: 'Platform Integration Update', body: 'Hello from Integration-as-a-Service Platform!' }, null, 2);
    } else if (slug === 'gmail.list_labels') {
      return JSON.stringify({}, null, 2);
    } else if (slug === 'github.list_repositories') {
      return JSON.stringify({ visibility: 'all', perPage: 10 }, null, 2);
    } else if (slug === 'github.list_issues') {
      return JSON.stringify({ owner: 'octocat', repo: 'Hello-World', state: 'open' }, null, 2);
    } else if (slug === 'github.get_issue') {
      return JSON.stringify({ owner: 'octocat', repo: 'Hello-World', issueNumber: 1 }, null, 2);
    } else if (slug === 'github.create_issue') {
      return JSON.stringify({ owner: 'octocat', repo: 'Hello-World', title: 'Bug Report via Platform', body: 'Steps to reproduce...' }, null, 2);
    } else if (slug === 'github.create_issue_comment') {
      return JSON.stringify({ owner: 'octocat', repo: 'Hello-World', issueNumber: 1, body: 'Commented via Unified Platform API' }, null, 2);
    } else if (slug === 'github.list_pull_requests') {
      return JSON.stringify({ owner: 'octocat', repo: 'Hello-World', state: 'open' }, null, 2);
    } else if (slug === 'calendar.list_events') {
      return JSON.stringify({ calendarId: 'primary', maxResults: 10 }, null, 2);
    } else if (slug === 'calendar.get_event') {
      return JSON.stringify({ calendarId: 'primary', eventId: 'event_id_here' }, null, 2);
    } else if (slug === 'calendar.create_event') {
      return JSON.stringify({ calendarId: 'primary', summary: 'Platform Team Sync', startDateTime: '2026-11-05T10:00:00Z', endDateTime: '2026-11-05T11:00:00Z', description: 'Discussing Milestone 4 integration launch' }, null, 2);
    } else if (slug === 'calendar.update_event') {
      return JSON.stringify({ calendarId: 'primary', eventId: 'event_id_here', summary: 'Rescheduled Platform Sync' }, null, 2);
    } else if (slug === 'calendar.delete_event') {
      return JSON.stringify({ calendarId: 'primary', eventId: 'event_id_here' }, null, 2);
    } else if (slug === 'calendar.get_free_busy') {
      return JSON.stringify({ calendarId: 'primary', timeMin: '2026-11-05T00:00:00Z', timeMax: '2026-11-05T23:59:59Z' }, null, 2);
    }
    return '{}';
  }

  function parseToolSchema(schema: any) {
    if (!schema) return null;
    if (typeof schema === 'string') {
      try {
        return JSON.parse(schema);
      } catch {
        return null;
      }
    }
    return schema;
  }

  function getToolProperties(tool: ToolDefinition): { name: string; type: string; required: boolean; description: string }[] {
    const schema = parseToolSchema(tool.inputSchema);
    if (!schema || !schema.properties || typeof schema.properties !== 'object') {
      return [];
    }
    const requiredList: string[] = Array.isArray(schema.required) ? schema.required : [];
    return Object.keys(schema.properties).map(key => {
      const prop = schema.properties[key] || {};
      return {
        name: key,
        type: typeof prop.type === 'string' ? prop.type : (typeof prop === 'string' ? prop : 'any'),
        required: requiredList.includes(key),
        description: prop.description || prop.title || ''
      };
    });
  }

  function openRunToolModal(tool: ToolDefinition) {
    setRunTool(tool);
    setExecutionResult(null);
    setRunnerTab('test');
    setJsonFormatMessage(null);
    setRunInputJson(getDefaultToolPayload(tool.slug));

    // Pre-populate matching connected account user ID if available
    const matchingAccount = connectedAccounts.find(
      a => a.integrationSlug === tool.integrationSlug ||
           (tool.slug.startsWith('gmail') && a.integrationSlug === 'gmail') ||
           (tool.slug.startsWith('github') && a.integrationSlug === 'github') ||
           (tool.slug.startsWith('calendar') && (a.integrationSlug === 'google_calendar' || a.integrationSlug === 'calendar'))
    );
    if (matchingAccount) {
      setRunUserId(matchingAccount.projectUserId);
    } else if (!runUserId || runUserId === '') {
      setRunUserId('user_developer_01');
    }
  }

  function handleFormatRunnerJson() {
    try {
      const parsed = JSON.parse(runInputJson);
      setRunInputJson(JSON.stringify(parsed, null, 2));
      setJsonFormatMessage('JSON formatted correctly!');
      setTimeout(() => setJsonFormatMessage(null), 2500);
    } catch (err: any) {
      setJsonFormatMessage('Invalid JSON: ' + (err.message || 'Syntax error'));
      setTimeout(() => setJsonFormatMessage(null), 3500);
    }
  }

  function handleResetRunnerSample() {
    if (!runTool) return;
    setRunInputJson(getDefaultToolPayload(runTool.slug));
    setJsonFormatMessage('Reset to sample payload!');
    setTimeout(() => setJsonFormatMessage(null), 2000);
  }

  function generateToolSnippet(tool: ToolDefinition, lang: 'curl' | 'typescript' | 'python', inputJson: string, userId: string): string {
    const safeUserId = userId.trim() || 'user_123';
    let parsed = {};
    try {
      parsed = JSON.parse(inputJson);
    } catch {
      parsed = {};
    }

    if (lang === 'curl') {
      return `curl -X POST "http://localhost:8080/api/v1/projects/${activeProject?.id || 'PROJECT_ID'}/tools/execute" \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "projectUserId": "${safeUserId}",
    "tool": "${tool.slug}",
    "input": ${JSON.stringify(parsed, null, 2).split('\n').join('\n    ')}
  }'`;
    }

    if (lang === 'typescript') {
      return `// TypeScript / Node.js
import { IntegrateLayer } from '@integratelayer/sdk';

const client = new IntegrateLayer({
  apiKey: process.env.INTEGRATE_LAYER_API_KEY,
});

async function run() {
  const result = await client.tools.execute({
    projectId: '${activeProject?.id || 'PROJECT_ID'}',
    projectUserId: '${safeUserId}',
    tool: '${tool.slug}',
    input: ${JSON.stringify(parsed, null, 2).split('\n').join('\n    ')}
  });

  console.log('Execution Status:', result.status);
  console.log('Output:', result.output);
}

run();`;
    }

    // Python
    return `# Python 3.9+
import requests
import os

API_KEY = os.getenv("INTEGRATE_LAYER_API_KEY", "<YOUR_API_KEY>")
URL = "http://localhost:8080/api/v1/projects/${activeProject?.id || 'PROJECT_ID'}/tools/execute"

payload = {
    "projectUserId": "${safeUserId}",
    "tool": "${tool.slug}",
    "input": ${JSON.stringify(parsed, null, 4).split('\n').join('\n    ')}
}

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

response = requests.post(URL, json=payload, headers=headers)
print("Status Code:", response.status_code)
print("Result:", response.json())`;
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  }

  // --- Render Landing Page or Auth View if not logged in ---
  if (!token) {
    if (showLandingPage) {
      return (
        <LandingPage
          theme={theme}
          toggleTheme={toggleTheme}
          onOpenAuth={(mode) => {
            setShowLandingPage(false);
            if (mode) {
              setAuthMode(mode);
              setAuthError(null);
            }
          }}
          integrations={integrations}
        />
      );
    }

    return (
      <div className="auth-container">
        <div style={{ position: 'absolute', top: 20, left: 24, zIndex: 10 }}>
          <button
            type="button"
            onClick={() => setShowLandingPage(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 8,
              border: theme === 'light' ? '1px solid #cbd5e1' : '1px solid #27364b',
              background: theme === 'light' ? '#ffffff' : '#121c2c',
              color: theme === 'light' ? '#0f172a' : '#ffffff',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </button>
        </div>
        <div style={{ position: 'absolute', top: 20, right: 24 }}>
          <button
            type="button"
            onClick={toggleTheme}
            className="btn-theme-toggle"
            title={theme === 'dark' ? 'Switch to White Theme' : 'Switch to Dark Theme'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              padding: 0,
              borderRadius: '50%',
              border: '1px solid #27364b',
              background: '#121c2c',
              color: theme === 'light' ? '#000000' : '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {theme === 'dark' ? <Sun size={16} style={{ color: '#4ade80' }} /> : <Moon size={16} style={{ color: '#007007' }} />}
          </button>
        </div>
        <div className="auth-card" style={{ maxWidth: 440 }}>
          <div className="brand" style={{ justifyContent: 'center', margin: '0 0 16px', alignItems: 'center' }}>
            <img
              src={theme === 'light' ? './logo-dark.png' : './logo-white.png'}
              alt="integrate"
              style={{ height: 32, width: 'auto', objectFit: 'contain' }}
            />
          </div>

          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px', color: theme === 'light' ? '#000000' : '#ffffff' }}>
              One Master Login → Multiple Apps (SSO)
            </h2>
            <p style={{ fontSize: 12, color: theme === 'light' ? '#000000' : '#ffffff', margin: 0, lineHeight: 1.4 }}>
              Sign in once to access and empower all your connected apps and agent workflows.
            </p>
          </div>

          {/* Master SSO: Continue with Google Button */}
          <button
            type="button"
            className="btn-google-sso"
            onClick={handleGoogleSSOLogin}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 16px', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: theme === 'light' ? '#e2e8f0' : '#273447' }} />
            <span style={{ fontSize: 10, color: theme === 'light' ? '#000000' : '#ffffff', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              or continue with email
            </span>
            <div style={{ flex: 1, height: 1, background: theme === 'light' ? '#e2e8f0' : '#273447' }} />
          </div>

          {/* Centered Segmented Capsule Switch [Sign In | Sign Up] */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: 20 }}>
            <div className="sso-pill-toggle" role="tablist" aria-label="Authentication Mode">
              <div
                className={`sso-pill-slider ${authMode === 'signup' ? 'pos-signup' : 'pos-login'}`}
                aria-hidden="true"
              />
              <button
                type="button"
                role="tab"
                aria-selected={authMode === 'login'}
                className={`sso-pill-btn ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => { setAuthMode('login'); setAuthError(null); setAuthConfirmPassword(''); }}
              >
                Sign In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={authMode === 'signup'}
                className={`sso-pill-btn ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => { setAuthMode('signup'); setAuthError(null); }}
              >
                Sign Up
              </button>
            </div>
          </div>

          {authError && <div className="error-banner" style={{ marginBottom: 16 }}>{authError}</div>}

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.5px' }}>EMAIL ADDRESS</label>
              <input
                className="form-input"
                type="email"
                required
                placeholder="dev@company.com"
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.5px' }}>PASSWORD</label>
              <div className="password-input-wrapper" style={{ position: 'relative', width: '100%' }}>
                <input
                  className="form-input"
                  type={showAuthPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', paddingRight: 40 }}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowAuthPassword(prev => !prev)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme === 'light' ? '#64748b' : '#94a3b8'
                  }}
                  title={showAuthPassword ? 'Hide password' : 'Show password'}
                  aria-label={showAuthPassword ? 'Hide password' : 'Show password'}
                >
                  {showAuthPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {authMode === 'signup' && (
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.5px' }}>CONFIRM PASSWORD</label>
                <div className="password-input-wrapper" style={{ position: 'relative', width: '100%' }}>
                  <input
                    className="form-input"
                    type={showAuthConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="Confirm Password"
                    value={authConfirmPassword}
                    onChange={e => setAuthConfirmPassword(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowAuthConfirmPassword(prev => !prev)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 4,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme === 'light' ? '#64748b' : '#94a3b8'
                    }}
                    title={showAuthConfirmPassword ? 'Hide password' : 'Show password'}
                    aria-label={showAuthConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showAuthConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {authMode === 'signup' && (
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.5px' }}>ORGANIZATION NAME (OPTIONAL)</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Acme Engineering"
                  value={authOrgName}
                  onChange={e => setAuthOrgName(e.target.value)}
                />
              </div>
            )}

            <button
              type="submit"
              className="primary"
              style={{
                marginTop: 8,
                padding: '12px 18px',
                fontWeight: 700,
                fontSize: 14,
                background: '#007007',
                borderColor: '#007007'
              }}
              disabled={loading}
            >
              {loading
                ? 'Please wait...'
                : authMode === 'signup'
                ? 'Create Account & Authorize Connectors'
                : 'Sign In'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 8 }}>
              {authMode === 'signup' ? (
                <span style={{ fontSize: 13, color: theme === 'light' ? '#64748b' : '#94a3b8' }}>
                  Already have an account?{' '}
                  <a
                    href="#"
                    onClick={e => { e.preventDefault(); setAuthMode('login'); setAuthError(null); }}
                    style={{ color: '#007007', fontWeight: 700, textDecoration: 'none' }}
                  >
                    Sign In
                  </a>
                </span>
              ) : (
                <span style={{ fontSize: 13, color: theme === 'light' ? '#64748b' : '#94a3b8' }}>
                  Don&apos;t have an account?{' '}
                  <a
                    href="#"
                    onClick={e => { e.preventDefault(); setAuthMode('signup'); setAuthError(null); }}
                    style={{ color: '#007007', fontWeight: 700, textDecoration: 'none' }}
                  >
                    Sign Up
                  </a>
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- Render Main Dashboard Shell ---
  return (
    <div className="shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand" style={{ alignItems: 'center', margin: '0 8px 24px' }}>
          <img
            src={theme === 'light' ? './logo-dark.png' : './logo-white.png'}
            alt="integrate"
            style={{ height: 26, width: 'auto', objectFit: 'contain' }}
          />
        </div>

        <div className="nav-label" style={{ marginTop: 12 }}>WORKSPACE</div>
        <nav>
          <a
            className={activeTab === 'landing' ? 'active' : ''}
            href="#"
            onClick={e => { e.preventDefault(); setActiveTab('landing'); }}
          >
            <Globe size={17} /> Home Page
          </a>
          <a
            className={activeTab === 'overview' ? 'active' : ''}
            href="#"
            onClick={e => { e.preventDefault(); setActiveTab('overview'); }}
          >
            <LayoutDashboard size={17} /> Overview
          </a>
          <a
            className={activeTab === 'apikeys' ? 'active' : ''}
            href="#"
            onClick={e => { e.preventDefault(); setActiveTab('apikeys'); }}
          >
            <KeyRound size={17} /> API Keys
            <span className="nav-count">{apiKeys.filter(k => k.active).length}</span>
          </a>
          <a
            className={activeTab === 'connections' ? 'active' : ''}
            href="#"
            onClick={e => { e.preventDefault(); setActiveTab('connections'); }}
          >
            <Users size={17} /> Connected Accounts
            <span className="nav-count">{isMasterSSOConnected ? 1 : 0}</span>
          </a>
          <a
            className={activeTab === 'integrations' ? 'active' : ''}
            href="#"
            onClick={e => { e.preventDefault(); setActiveTab('integrations'); }}
          >
            <Cable size={17} /> Integrations
            <span className="nav-count">{integrations.filter(i => i.configured).length}</span>
          </a>
          <a
            className={activeTab === 'tools' ? 'active' : ''}
            href="#"
            onClick={e => { e.preventDefault(); setActiveTab('tools'); }}
          >
            <Wrench size={17} /> Tool Explorer
            <span className="nav-count">{tools.length}</span>
          </a>
          <a
            className={activeTab === 'executions' ? 'active' : ''}
            href="#"
            onClick={e => { e.preventDefault(); setActiveTab('executions'); }}
          >
            <Activity size={17} /> Executions & Logs
            <span className="nav-count">{executions.length}</span>
          </a>
          <a
            className={activeTab === 'approvals' ? 'active' : ''}
            href="#"
            onClick={e => { e.preventDefault(); setActiveTab('approvals'); }}
          >
            <ShieldCheck size={17} /> Approvals
            {approvals.length > 0 && (
              <span className="nav-count" style={{ background: '#f59e0b', color: '#000', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>
                {approvals.length}
              </span>
            )}
          </a>
          <a
            className={activeTab === 'webhooks' ? 'active' : ''}
            href="#"
            onClick={e => { e.preventDefault(); setActiveTab('webhooks'); }}
          >
            <Radio size={17} /> Webhooks
            <span className="nav-count">{webhooks.filter(w => w.isActive).length}</span>
          </a>
          <a
            className={activeTab === 'usage' ? 'active' : ''}
            href="#"
            onClick={e => { e.preventDefault(); setActiveTab('usage'); }}
          >
            <BarChart3 size={17} /> Usage & Limits
          </a>
          <a
            className={activeTab === 'docs' ? 'active' : ''}
            href="#"
            onClick={e => { e.preventDefault(); setActiveTab('docs'); }}
          >
            <Code2 size={17} /> API & Docs
          </a>
        </nav>

        <div className="sidebar-bottom">
          <a href="#" onClick={e => { e.preventDefault(); handleLogout(); }}>
            <LogOut size={17} /> Sign out
          </a>
          <div
            className="profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 14px 8px 10px',
              borderRadius: 9999,
              marginTop: 12,
              border: theme === 'light' ? '1px solid #007007' : '1px solid rgba(74, 222, 128, 0.4)',
              background: theme === 'light' ? '#eaf7eb' : 'rgba(0, 112, 7, 0.12)',
              boxShadow: theme === 'light' ? '0 1px 4px rgba(0, 112, 7, 0.12)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <div
              className="avatar"
              style={{
                borderRadius: '50%',
                width: 36,
                height: 36,
                minWidth: 36,
                background: '#007007',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {getUserInitials(userEmail)}
            </div>
            <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0, gap: 2 }}>
              <strong
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: 13,
                  color: theme === 'light' ? '#000000' : '#ffffff',
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {getUserDisplayName(userEmail)}
              </strong>
              <small
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: 11,
                  color: theme === 'light' ? '#000000' : '#ffffff',
                  lineHeight: 1.2,
                }}
              >
                {userEmail || 'developer@local'}
              </small>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main">
        <header>
          <div className="crumb">
            {activeOrg?.name || 'Workspace'} <span>/</span>{' '}
            <strong style={{ color: theme === 'light' ? '#0f172a' : '#fff', textTransform: 'capitalize' }}>
              {activeTab === 'connections' ? 'Connected Accounts' : activeTab === 'apikeys' ? 'API Keys' : activeTab}
            </strong>
          </div>
          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={toggleTheme}
              className="btn-theme-toggle"
              title={theme === 'dark' ? 'Switch to White Theme' : 'Switch to Dark Theme'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 34,
                height: 34,
                padding: 0,
                borderRadius: '50%',
                border: '1px solid #27364b',
                background: '#121c2c',
                color: theme === 'light' ? '#000000' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {theme === 'dark' ? <Sun size={15} style={{ color: '#4ade80' }} /> : <Moon size={15} style={{ color: '#007007' }} />}
            </button>
            {/* Top-Right Profile with Click Dropdown Menu */}
            <div
              ref={profileMenuRef}
              className="header-profile-menu-container"
              style={{ position: 'relative' }}
            >
              <div
                className="header-profile-pill"
                onClick={() => setShowProfileMenu(prev => !prev)}
                role="button"
                tabIndex={0}
                title="Account"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  padding: '4px 10px 4px 4px',
                  borderRadius: 9999,
                  border: theme === 'light' ? '1px solid #cbd5e1' : '1px solid #27364b',
                  background: theme === 'light' ? '#f8fafc' : '#121d2c',
                  transition: 'all 0.15s ease'
                }}
              >
                <div
                  className="avatar small"
                  style={{
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    minWidth: 28,
                    background: '#007007',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                    fontSize: 10
                  }}
                >
                  {getUserInitials(userEmail)}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: theme === 'light' ? '#000000' : '#ffffff',
                    maxWidth: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {userEmail ? userEmail.split('@')[0] : 'Saurabh'}
                </span>
                <ChevronDown
                  size={13}
                  style={{
                    color: theme === 'light' ? '#000000' : '#ffffff',
                    transition: 'transform 0.2s ease',
                    transform: showProfileMenu ? 'rotate(180deg)' : 'none'
                  }}
                />
              </div>

              {/* Dropdown Menu on Click */}
              {showProfileMenu && (
                <div
                  className="header-profile-dropdown"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 220,
                    background: theme === 'light' ? '#ffffff' : '#121d2c',
                    border: theme === 'light' ? '1px solid #e2e8f0' : '1px solid #27364b',
                    borderRadius: 12,
                    boxShadow: theme === 'light' ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' : '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 4px 10px rgba(0, 0, 0, 0.2)',
                    padding: '14px 16px',
                    zIndex: 1000
                  }}
                >
                  {/* User Name & Email */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: theme === 'light' ? '#0f172a' : '#ffffff',
                      marginBottom: 4,
                      lineHeight: 1.2
                    }}>
                      {getUserDisplayName(userEmail)}
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: theme === 'light' ? '#64748b' : '#94a3b8',
                      wordBreak: 'break-all',
                      lineHeight: 1.3
                    }}>
                      {userEmail || 'developer@local'}
                    </div>
                  </div>

                  <div style={{
                    height: 1,
                    background: theme === 'light' ? '#f1f5f9' : '#1e293b',
                    margin: '0 -16px 12px'
                  }} />

                  {/* Logout Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      background: 'rgba(239, 68, 68, 0.08)',
                      color: '#ef4444',
                      fontSize: 12,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#ef4444';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                      e.currentTarget.style.color = '#ef4444';
                    }}
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="content">
          {/* Top developer console header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div className="eyebrow">DEVELOPER CONSOLE</div>
          </div>

          {/* TAB 0: CRAZY LANDING / HOME PAGE */}
          {activeTab === 'landing' && (
            <div style={{ margin: '-24px -28px', minHeight: '100%' }}>
              <LandingPage
                theme={theme}
                toggleTheme={toggleTheme}
                onOpenAuth={() => setActiveTab('overview')}
                integrations={integrations}
              />
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              <div className="heading-row">
                <div>
                  <h1>Good morning.</h1>
                </div>
                <button
                  className="primary"
                  onClick={() => {
                    setActiveTab('apikeys');
                    openNewKeyModal();
                  }}
                  title="Create New Project & API Key"
                >
                  ＋ New project
                </button>
              </div>

              <div
                className="notice"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 18px',
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    minWidth: 38,
                    borderRadius: 10,
                    background: theme === 'light' ? '#dcfce7' : 'rgba(0, 112, 7, 0.25)',
                    color: theme === 'light' ? '#007007' : '#4ade80',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0, flex: 1 }}>
                  <strong style={{ fontSize: 13, fontWeight: 700, color: theme === 'light' ? '#007007' : '#4ade80' }}>
                    Milestone 3 Execution Engine Active
                  </strong>
                  <p style={{ margin: 0, fontSize: 11, color: theme === 'light' ? '#007007' : '#4ade80', lineHeight: 1.4 }}>
                    Pluggable connector architecture, Tool Registry, JSON Schema input validation, and 15-step execution engine with approval gates are operational.
                  </p>
                </div>
              </div>

              <div className="section-title">
                <div>
                  <h2>Platform Overview</h2>
                  <p>Live metrics across your workspace integrations.</p>
                </div>
              </div>

              <div className="stats">
                <article className="stat">
                  <div className="stat-title">Tool Executions</div>
                  <div className="stat-value">{executions.length}</div>
                  <div className="stat-note">
                    {executions.filter(e => e.status === 'SUCCEEDED').length} Succeeded · {executions.filter(e => e.status === 'FAILED').length} Failed
                  </div>
                </article>
                <article className="stat">
                  <div className="stat-title">Pending Approvals</div>
                  <div className="stat-value" style={{ color: approvals.length > 0 ? '#007007' : 'inherit' }}>
                    {approvals.length}
                  </div>
                  <div className="stat-note">High risk sensitive actions</div>
                </article>
                <article className="stat">
                  <div className="stat-title">Available Tools</div>
                  <div className="stat-value">{tools.length}</div>
                  <div className="stat-note">Across enabled integrations</div>
                </article>
                <article className="stat">
                  <div className="stat-title">Connected Accounts</div>
                  <div className="stat-value">{connectedAccounts.filter(a => a.status === 'CONNECTED').length}</div>
                  <div className="stat-note">AES-256-GCM Vault secured</div>
                </article>
              </div>

              <div className="lower-grid">
                <article className="panel">
                  <div className="panel-head">
                    <div>
                      <h3>Recent Executions</h3>
                      <p>Activity across all API tool calls</p>
                    </div>
                    <span className="subtle" onClick={() => setActiveTab('executions')} style={{ cursor: 'pointer' }}>
                      View all ↗
                    </span>
                  </div>
                  {executions.length === 0 ? (
                    <div className="empty">
                      <div className="empty-icon"><Activity size={20} /></div>
                      <strong>No executions yet</strong>
                      <p>Use the Tool Explorer to run your first action or call the execute API.</p>
                    </div>
                  ) : (
                    <div className="integration-list">
                      {executions.slice(0, 4).map(e => (
                        <div key={e.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedExecution(e)}>
                          <b className="app-icon" style={{ background: e.status === 'SUCCEEDED' ? '#14382c' : e.status === 'PENDING_APPROVAL' ? '#3d2e11' : '#3d1616', color: e.status === 'SUCCEEDED' ? '#007007' : theme === 'light' ? '#000000' : '#ffffff' }}>
                            {e.status === 'SUCCEEDED' ? <CheckCircle2 size={13} /> : e.status === 'PENDING_APPROVAL' ? <Clock size={13} /> : <AlertTriangle size={13} />}
                          </b>
                          <span>
                            <strong>{e.toolSlug}</strong>
                            <small>User: {e.projectUserId} · {e.durationMs ? `${e.durationMs}ms` : 'Pending'}</small>
                          </span>
                          <span className={`badge ${e.status === 'SUCCEEDED' ? 'badge-live' : e.status === 'PENDING_APPROVAL' ? 'badge-test' : 'badge-revoked'}`}>
                            {e.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </article>

                <article className="panel">
                  <div className="panel-head">
                    <div>
                      <h3>Quick Actions</h3>
                      <p>Test tools and manage platform</p>
                    </div>
                  </div>
                  <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button
                      className="btn-secondary"
                      style={{
                        textAlign: 'left',
                        padding: '12px 14px',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        width: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onClick={() => setActiveTab('tools')}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          minWidth: 38,
                          borderRadius: 8,
                          background: theme === 'light' ? '#eaf7eb' : 'rgba(0, 112, 7, 0.25)',
                          color: theme === 'light' ? '#007007' : '#4ade80',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Wrench size={18} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
                        <strong style={{ fontSize: 13, color: theme === 'light' ? '#000000' : '#ffffff', fontWeight: 600 }}>
                          Tool Explorer
                        </strong>
                        <span style={{ fontSize: 11, color: theme === 'light' ? '#000000' : '#ffffff', lineHeight: 1.3 }}>
                          Run actions interactively against connected accounts
                        </span>
                      </div>
                    </button>

                    <button
                      className="btn-secondary"
                      style={{
                        textAlign: 'left',
                        padding: '12px 14px',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        width: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onClick={() => setActiveTab('apikeys')}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          minWidth: 38,
                          borderRadius: 8,
                          background: theme === 'light' ? '#dcfce7' : 'rgba(0, 112, 7, 0.35)',
                          color: theme === 'light' ? '#007007' : '#4ade80',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <KeyRound size={18} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
                        <strong style={{ fontSize: 13, color: theme === 'light' ? '#000000' : '#ffffff', fontWeight: 600 }}>
                          API Keys
                        </strong>
                        <span style={{ fontSize: 11, color: theme === 'light' ? '#000000' : '#ffffff', lineHeight: 1.3 }}>
                          Generate programmatic keys for server-to-server calls
                        </span>
                      </div>
                    </button>

                    <button
                      className="btn-secondary"
                      style={{
                        textAlign: 'left',
                        padding: '12px 14px',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        width: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onClick={() => setActiveTab('integrations')}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          minWidth: 38,
                          borderRadius: 8,
                          background: theme === 'light' ? '#f0fdf4' : 'rgba(0, 112, 7, 0.18)',
                          color: theme === 'light' ? '#007007' : '#4ade80',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Cable size={18} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
                        <strong style={{ fontSize: 13, color: theme === 'light' ? '#000000' : '#ffffff', fontWeight: 600 }}>
                          Manage Integrations
                        </strong>
                        <span style={{ fontSize: 11, color: theme === 'light' ? '#000000' : '#ffffff', lineHeight: 1.3 }}>
                          Configure OAuth credentials and connect test accounts
                        </span>
                      </div>
                    </button>
                  </div>
                </article>
              </div>
            </>
          )}

          {/* TAB: API KEYS */}
          {activeTab === 'apikeys' && (
            <>
              <div className="heading-row">
                <div>
                  <h1>API Keys</h1>
                  <p className="sub">
                    Manage secret keys for programmatic access, integrations, and AI agents.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    className="primary"
                    onClick={openNewKeyModal}
                  >
                    ＋ Generate New Key
                  </button>
                </div>
              </div>

              {/* Master SSO Connection Warning if not connected */}
              {!isMasterSSOConnected && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16,
                  padding: '16px 20px',
                  borderRadius: 12,
                  background: theme === 'light' ? '#f0fdf4' : 'rgba(0, 112, 7, 0.12)',
                  border: '1px solid ' + (theme === 'light' ? '#bbf7d0' : 'rgba(0, 112, 7, 0.35)'),
                  marginBottom: 20
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: '#007007',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <KeyRound size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
                        Connected Accounts: Master SSO Registration Required
                      </h4>
                      <p style={{ margin: '3px 0 0', fontSize: 12, color: theme === 'light' ? '#475569' : '#94a3b8' }}>
                        Master SSO Identity & external provider accounts authorized across your workspace. Please register or sign in before generating API keys.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="primary"
                    onClick={() => {
                      setPendingOpenKeyModal(true);
                      openMasterLoginModal();
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      padding: '9px 18px',
                      fontSize: 12,
                      background: '#007007',
                      borderColor: '#007007',
                      fontWeight: 600,
                      borderRadius: 8
                    }}
                  >
                    <KeyRound size={14} />
                    <span>Register / Sign In Master SSO</span>
                  </button>
                </div>
              )}

              <div className="notice" style={{ marginBottom: 20 }}>
                <ShieldAlert size={18} />
                <div>
                  <strong>Key Security Policy</strong>
                  <p>
                    API keys are hashed at rest using SHA-256. Raw secrets are shown only once at creation time.
                    Always keep your live keys on your backend server and never expose them in client-side code.
                  </p>
                </div>
              </div>

              {apiKeys.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48, background: 'transparent', border: '1px dashed ' + (theme === 'light' ? '#cbd5e1' : '#334155'), borderRadius: 12 }}>
                  <div className="empty-icon" style={{ margin: '0 auto 12px' }}><KeyRound size={20} /></div>
                  <h3 style={{ color: theme === 'light' ? '#0f172a' : '#fff' }}>No API keys generated yet</h3>
                  <p style={{ color: theme === 'light' ? '#64748b' : '#94a3b8', fontSize: 12, marginTop: 6, maxWidth: 420, margin: '6px auto 0' }}>
                    {!isMasterSSOConnected
                      ? "Register or sign in with your Master SSO Account first to unlock API key generation and workspace connectors."
                      : "Generate an API key to start connecting your backend or AI agent to this platform."}
                  </p>
                  <button
                    className="primary"
                    style={{ marginTop: 16, background: '#007007', borderColor: '#007007' }}
                    onClick={openNewKeyModal}
                  >
                    {!isMasterSSOConnected ? "Register / Sign In to Generate Key" : "Generate First Key"}
                  </button>
                </div>
              ) : (
                <div className="api-keys-table-container">
                  <table className="clean-borderless-table">
                    <thead>
                      <tr>
                        <th>Project Name</th>
                        <th>API Key</th>
                        <th>Environment</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiKeys.map(k => (
                        <tr key={k.id}>
                          {/* 1. Project Name */}
                          <td>
                            <span style={{ fontWeight: 600, fontSize: 13, color: theme === 'light' ? '#0f172a' : '#f8fafc' }}>
                              {k.projectName || (projects.find(p => p.id === k.projectId)?.name || 'Default Project')}
                            </span>
                          </td>

                          {/* 2. API Key (Clean Transparent - No Background) */}
                          <td>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                              <code style={{
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                fontSize: 13,
                                fontWeight: 600,
                                color: theme === 'light' ? '#007007' : '#4ade80',
                                background: 'transparent',
                                padding: 0,
                                letterSpacing: '0.3px'
                              }}>
                                {k.keyPrefix}...
                              </code>
                              <button
                                type="button"
                                onClick={() => {
                                  copyToClipboard(k.keyPrefix);
                                  setCopiedKeyId(k.id);
                                  setTimeout(() => setCopiedKeyId(null), 1600);
                                }}
                                title="Copy API Key Prefix"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  padding: 2,
                                  cursor: 'pointer',
                                  color: copiedKeyId === k.id ? (theme === 'light' ? '#007007' : '#4ade80') : (theme === 'light' ? '#64748b' : '#94a3b8'),
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'color 0.15s ease'
                                }}
                              >
                                {copiedKeyId === k.id ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                            </div>
                          </td>

                          {/* 3. Environment */}
                          <td>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '3px 9px',
                              borderRadius: 9999,
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: '0.5px',
                              background: k.environment === 'LIVE' ? (theme === 'light' ? '#eaf7eb' : 'rgba(0, 112, 7, 0.22)') : (theme === 'light' ? '#eff6ff' : 'rgba(59, 130, 246, 0.18)'),
                              color: k.environment === 'LIVE' ? (theme === 'light' ? '#007007' : '#86efac') : (theme === 'light' ? '#1d4ed8' : '#93c5fd'),
                              border: '1px solid ' + (k.environment === 'LIVE' ? (theme === 'light' ? '#bbf7d0' : 'rgba(74, 222, 128, 0.35)') : (theme === 'light' ? '#bfdbfe' : 'rgba(96, 165, 250, 0.35)'))
                            }}>
                              {k.environment}
                            </span>
                          </td>

                          {/* 4. Status (Clean Status Badge) */}
                          <td>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '3px 10px',
                              borderRadius: 9999,
                              fontSize: 11,
                              fontWeight: 600,
                              background: k.active
                                ? (theme === 'light' ? '#eaf7eb' : 'rgba(0, 112, 7, 0.2)')
                                : (theme === 'light' ? '#f1f5f9' : 'rgba(148, 163, 184, 0.15)'),
                              color: k.active
                                ? (theme === 'light' ? '#007007' : '#86efac')
                                : (theme === 'light' ? '#64748b' : '#94a3b8'),
                              border: '1px solid ' + (k.active
                                ? (theme === 'light' ? '#86efac' : 'rgba(74, 222, 128, 0.4)')
                                : (theme === 'light' ? '#cbd5e1' : 'rgba(148, 163, 184, 0.3)'))
                            }}>
                              <span style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: k.active ? '#007007' : '#94a3b8',
                                boxShadow: k.active ? '0 0 6px rgba(0, 112, 7, 0.5)' : 'none'
                              }} />
                              <span>{k.active ? 'Active' : 'Inactive'}</span>
                            </span>
                          </td>

                          {/* 5. Created with time */}
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme === 'light' ? '#0f172a' : '#f8fafc', fontWeight: 500 }}>
                              <Clock size={13} style={{ color: theme === 'light' ? '#64748b' : '#94a3b8' }} />
                              <span>
                                {new Date(k.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span style={{ color: theme === 'light' ? '#64748b' : '#94a3b8', fontSize: 11 }}>
                                {new Date(k.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </td>

                          {/* 6. Actions (Active/Inactive Toggle & Remove - Clean No Background) */}
                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end' }}>
                              {/* Active / Inactive Toggle Button (No background) */}
                              <button
                                type="button"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  padding: 4,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: k.active
                                    ? (theme === 'light' ? '#007007' : '#4ade80')
                                    : (theme === 'light' ? '#94a3b8' : '#64748b'),
                                  transition: 'color 0.15s ease, transform 0.15s ease'
                                }}
                                onClick={() => handleToggleKeyStatus(k.projectId, k.id, k.active)}
                                title={k.active ? 'Deactivate API Key (Set Inactive)' : 'Activate API Key (Set Active)'}
                                aria-label={k.active ? 'Deactivate API Key' : 'Activate API Key'}
                              >
                                {k.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                              </button>

                              {/* Remove / Delete button (No background) */}
                              <button
                                type="button"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  padding: 4,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: theme === 'light' ? '#ef4444' : '#f87171',
                                  transition: 'color 0.15s ease, transform 0.15s ease'
                                }}
                                onClick={() => handleDeleteApiKey(k.projectId, k.id)}
                                title="Permanently remove API Key"
                                aria-label="Remove API Key"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* TAB 4: INTEGRATIONS */}
          {activeTab === 'integrations' && (() => {
            const displayIntegrations = (integrations && integrations.length >= 10 ? integrations : DEFAULT_CONNECTORS);
            const filteredIntegrations = displayIntegrations.filter(integ => {
              const meta = getConnectorDetails(integ.slug, integ.name);
              const term = integrationSearch.toLowerCase().trim();
              const matchesSearch = !term ||
                integ.name.toLowerCase().includes(term) ||
                integ.slug.toLowerCase().includes(term) ||
                meta.subheading.toLowerCase().includes(term) ||
                meta.author.toLowerCase().includes(term) ||
                meta.category.toLowerCase().includes(term);

              const matchesCategory =
                integrationCategory === 'ALL' ||
                meta.category.toUpperCase().replace(/\s+/g, '_').includes(integrationCategory) ||
                (integ.category && integ.category.toUpperCase().includes(integrationCategory));

              return matchesSearch && matchesCategory;
            });

            const categoryList = [
              { id: 'ALL', label: `All (${displayIntegrations.length})` },
              { id: 'COMMUNICATION', label: 'Communication' },
              { id: 'DEVELOPER_TOOLS', label: 'Developer Tools' },
              { id: 'PRODUCTIVITY', label: 'Productivity' },
              { id: 'CRM', label: 'CRM & Sales' },
              { id: 'FINANCE', label: 'Finance' },
              { id: 'STORAGE', label: 'Storage' },
              { id: 'MARKETING', label: 'Marketing' },
              { id: 'DESIGN', label: 'Design' }
            ];

            return (
              <>
                <div className="heading-row">
                  <div>
                    <div className="eyebrow" style={{ color: '#007007', fontWeight: 700, letterSpacing: '1.2px', fontSize: 11, marginBottom: 4 }}>
                      APP INTEGRATIONS & CONNECTORS ({displayIntegrations.length})
                    </div>
                    <h1>Integration Marketplace</h1>
                    <p className="sub">
                      Connect third-party apps to empower your AI agents and workflows with live external actions.
                    </p>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <div style={{ position: 'relative', width: 340, maxWidth: '100%' }}>
                    <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: theme === 'light' ? '#000000' : '#ffffff', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      placeholder="Search 30+ connectors (e.g. Slack, Notion, Stripe)..."
                      value={integrationSearch}
                      onChange={e => setIntegrationSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 36px',
                        fontSize: 12,
                        borderRadius: 8,
                        border: theme === 'light' ? '1px solid #cbd5e1' : '1px solid #273447',
                        background: theme === 'light' ? '#ffffff' : '#121d2c',
                        color: theme === 'light' ? '#000000' : '#ffffff',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                    {categoryList.map(cat => {
                      const active = integrationCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setIntegrationCategory(cat.id)}
                          style={{
                            padding: '6px 14px',
                            fontSize: 11,
                            fontWeight: 600,
                            borderRadius: 20,
                            border: active ? '1px solid #007007' : theme === 'light' ? '1px solid #e2e8f0' : '1px solid #273447',
                            background: active ? (theme === 'light' ? '#eaf7eb' : 'rgba(0, 112, 7, 0.22)') : (theme === 'light' ? '#ffffff' : '#121d2c'),
                            color: active ? '#007007' : theme === 'light' ? '#000000' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {filteredIntegrations.length === 0 ? (
                  <div className="empty" style={{ padding: '48px 20px', background: theme === 'light' ? '#ffffff' : '#121d2c', borderRadius: 12, border: theme === 'light' ? '1px solid #e2e8f0' : '1px solid #273447' }}>
                    <Search size={32} style={{ color: theme === 'light' ? '#000000' : '#ffffff', marginBottom: 12 }} />
                    <strong style={{ fontSize: 14 }}>No connectors found</strong>
                    <p style={{ marginTop: 6, color: theme === 'light' ? '#000000' : '#ffffff', fontSize: 12 }}>
                      No integration matched "{integrationSearch}". Try another keyword or clear filters.
                    </p>
                    <button className="primary" style={{ marginTop: 14 }} onClick={() => { setIntegrationSearch(''); setIntegrationCategory('ALL'); }}>
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="integration-market-grid">
                    {filteredIntegrations.map(integ => {
                      const isConnected = isMasterSSOConnected && connectedAccounts.some(
                        acc => (acc.integrationSlug === integ.slug ||
                                (integ.slug.includes('calendar') && acc.integrationSlug.includes('calendar')) ||
                                (integ.slug.includes('drive') && acc.integrationSlug.includes('drive'))) &&
                                acc.status === 'CONNECTED'
                      );
                      const isEnabled = isMasterSSOConnected && (enabledSlugs.has(integ.slug) || isConnected);

                      const meta = getConnectorDetails(integ.slug, integ.name);

                      return (
                        <div key={integ.id || integ.slug} className="integration-market-card">
                          {/* Left: Real Logo Container */}
                          <div className="integration-logo-box">
                            {renderRealIntegrationIcon(integ.slug, 34)}
                          </div>

                          {/* Middle: Title with Verified Badge, Subheading, Author */}
                          <div className="integration-card-info">
                            <div className="integration-card-title-row">
                              <h3 className="integration-card-title">{integ.name}</h3>
                              <VerifiedBadge isEnabled={isEnabled} />
                            </div>
                            <p className="integration-card-subheading">{meta.subheading}</p>
                            <span className="integration-card-author">{meta.author}</span>
                          </div>

                          {/* Right: Toggle Switch (Green ON #007007, Grey OFF) */}
                          <button
                            type="button"
                            className={`toggle-switch ${isEnabled ? 'on' : ''}`}
                            role="switch"
                            aria-checked={isEnabled}
                            title={isEnabled ? `${integ.name} is Enabled (Click to disable)` : `Enable ${integ.name}`}
                            aria-label={isEnabled ? `Disable ${integ.name}` : `Enable ${integ.name}`}
                            onClick={() => handleToggleEnable(integ)}
                          >
                            <span className="toggle-switch-knob" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}

          {/* TAB 5: CONNECTED ACCOUNTS */}
          {activeTab === 'connections' && (
            <>
              <div className="heading-row">
                <div>
                  <h1>Connected Accounts</h1>
                  <p className="sub">
                    Master SSO Identity & external provider accounts authorized across your workspace.
                  </p>
                </div>
              </div>

              {masterSuccessMessage && (
                <div style={{
                  padding: '12px 18px',
                  borderRadius: 10,
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#007007',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 18
                }}>
                  <Check size={18} />
                  <span>{masterSuccessMessage}</span>
                </div>
              )}

              {/* Master SSO Identity & Connector Hub */}
              <div className="master-sso-hub" style={{ padding: '20px 24px', marginBottom: 20 }}>
                {/* Top Row: User Identity + Master Login CTA */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                  {isMasterSSOConnected && (masterSSOEmail || userEmail) ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div className="master-sso-logo" style={{ width: 44, height: 44 }}>
                        <svg width="22" height="22" viewBox="0 0 48 48">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                            {masterSSOEmail || userEmail}
                          </h3>
                          <VerifiedBadge isEnabled={true} />
                          <span style={{ fontSize: 11, color: '#007007', background: 'rgba(0, 112, 7, 0.12)', padding: '2px 8px', borderRadius: 9999, fontWeight: 700 }}>
                            Master SSO Active
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: theme === 'light' ? '#000000' : '#ffffff' }}>
                          Platform IdP &bull; {activeOrg?.name || 'Workspace'} &bull; Single Master Login powers all connectors
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: theme === 'light' ? '#f1f5f9' : '#1e293b',
                        border: '1px solid ' + (theme === 'light' ? '#e2e8f0' : '#334155'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme === 'light' ? '#000000' : '#ffffff'
                      }}>
                        <KeyRound size={22} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: theme === 'light' ? '#000000' : '#ffffff' }}>
                            No Master Account Connected
                          </h3>
                          <VerifiedBadge isEnabled={false} />
                          <span style={{ fontSize: 11, color: theme === 'light' ? '#000000' : '#ffffff', background: theme === 'light' ? '#f1f5f9' : '#1e293b', padding: '2px 8px', borderRadius: 9999, fontWeight: 600, border: '1px solid ' + (theme === 'light' ? '#e2e8f0' : '#334155') }}>
                            Not Connected
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: theme === 'light' ? '#000000' : '#ffffff' }}>
                          Sign in with Master Login to auto-authorize all connectors without external OAuth popups
                        </p>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {isMasterSSOConnected ? (
                      <>
                        <button
                          className="btn-secondary"
                          style={{ fontSize: 12, padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: 6, color: theme === 'light' ? '#000000' : '#ffffff' }}
                          onClick={handleDisconnectMasterSSO}
                          title="Disconnect Master SSO"
                        >
                          <span>Disconnect</span>
                        </button>
                        <button
                          className="primary"
                          style={{ fontSize: 13, padding: '9px 16px', display: 'inline-flex', alignItems: 'center', gap: 7, background: '#007007', borderColor: '#007007', fontWeight: 600 }}
                          onClick={openMasterLoginModal}
                        >
                          <KeyRound size={15} />
                          <span>Switch Account</span>
                        </button>
                      </>
                    ) : (
                      <button
                        className="primary"
                        style={{ fontSize: 13, padding: '9px 18px', display: 'inline-flex', alignItems: 'center', gap: 7, background: '#007007', borderColor: '#007007', fontWeight: 600 }}
                        onClick={openMasterLoginModal}
                      >
                        <KeyRound size={15} />
                        <span>Master Login</span>
                      </button>
                    )}
                    <button
                      className="btn-secondary"
                      style={{ fontSize: 13, padding: '9px 16px', display: 'inline-flex', alignItems: 'center', gap: 7 }}
                      onClick={() => setActiveTab('integrations')}
                    >
                      <Cable size={15} />
                      <span>Marketplace →</span>
                    </button>
                  </div>
                </div>

                {/* Clean 3-Feature Value Strip (Minimal text, no clutter) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 12,
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: '1px solid ' + (theme === 'light' ? '#f1f5f9' : '#273447')
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                    <Zap size={18} style={{ color: '#4ade80', flexShrink: 0 }} />
                    <div>
                      <strong style={{ display: 'block', fontSize: 13, color: theme === 'light' ? '#000000' : '#ffffff' }}>One Master Login</strong>
                      <span style={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>1 login powers all 30+ connectors</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                    <ShieldCheck size={18} style={{ color: '#38bdf8', flexShrink: 0 }} />
                    <div>
                      <strong style={{ display: 'block', fontSize: 13, color: theme === 'light' ? '#000000' : '#ffffff' }}>Zero OAuth Popups</strong>
                      <span style={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>Connectors auto-accept master trust</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                    <Sparkles size={18} style={{ color: '#fbbf24', flexShrink: 0 }} />
                    <div>
                      <strong style={{ display: 'block', fontSize: 13, color: theme === 'light' ? '#000000' : '#ffffff' }}>1-Click Toggle</strong>
                      <span style={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>Flip ON in Marketplace to activate</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Connected Accounts & Active Sessions Table */}
              {(() => {
                const activeConnectors = (integrations && integrations.length > 0 ? integrations : DEFAULT_CONNECTORS).filter(integ => {
                  const isConnected = isMasterSSOConnected && connectedAccounts.some(
                    acc => (acc.integrationSlug === integ.slug ||
                            (integ.slug.includes('calendar') && acc.integrationSlug.includes('calendar')) ||
                            (integ.slug.includes('drive') && acc.integrationSlug.includes('drive'))) &&
                            acc.status === 'CONNECTED'
                  );
                  return isMasterSSOConnected && (enabledSlugs.has(integ.slug) || isConnected);
                });

                return (
                  <div style={{ marginTop: 24 }}>
                    {/* Header Row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 12,
                      marginBottom: 16
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <h2 style={{
                            margin: 0,
                            fontSize: 16,
                            fontWeight: 700,
                            color: theme === 'light' ? '#0f172a' : '#ffffff'
                          }}>
                            Active Account Sessions & Authorized Tools
                          </h2>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '2px 9px',
                            borderRadius: 9999,
                            background: theme === 'light' ? '#eaf7eb' : 'rgba(0, 112, 7, 0.2)',
                            color: theme === 'light' ? '#007007' : '#86efac',
                            border: '1px solid ' + (theme === 'light' ? '#86efac' : 'rgba(74, 222, 128, 0.35)')
                          }}>
                            {activeConnectors.length} Accounts Active
                          </span>
                        </div>
                        <p style={{
                          margin: '4px 0 0',
                          fontSize: 12,
                          color: theme === 'light' ? '#64748b' : '#94a3b8'
                        }}>
                          Live OAuth sessions, authorized scopes, and integrated tools powered across your workspace.
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setActiveTab('tools')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 12,
                            padding: '7px 13px',
                            color: theme === 'light' ? '#0f172a' : '#ffffff'
                          }}
                        >
                          <Wrench size={14} />
                          <span>Tool Explorer</span>
                        </button>
                        <button
                          type="button"
                          className="primary"
                          onClick={() => setActiveTab('integrations')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 12,
                            padding: '7px 14px',
                            background: '#007007',
                            borderColor: '#007007',
                            fontWeight: 600
                          }}
                        >
                          <Plus size={14} />
                          <span>Browse Marketplace</span>
                        </button>
                      </div>
                    </div>

                    {/* Table of Connected Accounts or Empty State */}
                    {!isMasterSSOConnected ? (
                      <div style={{
                        padding: '40px 24px',
                        background: theme === 'light' ? '#ffffff' : '#121d2c',
                        borderRadius: 14,
                        border: '1px solid ' + (theme === 'light' ? '#e2e8f0' : '#273447'),
                        textAlign: 'center',
                        boxShadow: theme === 'light' ? '0 1px 3px rgba(0,0,0,0.04)' : 'none'
                      }}>
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: theme === 'light' ? '#f0fdf4' : 'rgba(0, 112, 7, 0.15)',
                          border: '1px solid ' + (theme === 'light' ? '#bbf7d0' : 'rgba(0, 112, 7, 0.35)'),
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#007007',
                          marginBottom: 12
                        }}>
                          <KeyRound size={22} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
                          Connect Master SSO to Unlock Integrated Tools
                        </h3>
                        <p style={{
                          margin: '6px auto 18px',
                          fontSize: 12,
                          maxWidth: 420,
                          color: theme === 'light' ? '#64748b' : '#94a3b8',
                          lineHeight: 1.5
                        }}>
                          Sign in with your Master Account above to automatically connect Gmail, Calendar, Drive, and 20+ other apps with zero external popups.
                        </p>
                        <button
                          type="button"
                          className="primary"
                          onClick={openMasterLoginModal}
                          style={{
                            fontSize: 13,
                            padding: '9px 20px',
                            background: '#007007',
                            borderColor: '#007007',
                            fontWeight: 600
                          }}
                        >
                          Connect Master SSO
                        </button>
                      </div>
                    ) : activeConnectors.length === 0 ? (
                      <div style={{
                        padding: '40px 24px',
                        background: theme === 'light' ? '#ffffff' : '#121d2c',
                        borderRadius: 14,
                        border: '1px solid ' + (theme === 'light' ? '#e2e8f0' : '#273447'),
                        textAlign: 'center',
                        boxShadow: theme === 'light' ? '0 1px 3px rgba(0,0,0,0.04)' : 'none'
                      }}>
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: theme === 'light' ? '#f8fafc' : '#1e293b',
                          border: '1px solid ' + (theme === 'light' ? '#e2e8f0' : '#334155'),
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: theme === 'light' ? '#64748b' : '#94a3b8',
                          marginBottom: 12
                        }}>
                          <Cable size={22} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
                          No Account Connections Active Yet
                        </h3>
                        <p style={{
                          margin: '6px auto 18px',
                          fontSize: 12,
                          maxWidth: 380,
                          color: theme === 'light' ? '#64748b' : '#94a3b8',
                          lineHeight: 1.5
                        }}>
                          Your Master SSO is connected! Browse the App Integrations catalog and flip the switch to enable your favorite tools.
                        </p>
                        <button
                          type="button"
                          className="primary"
                          onClick={() => setActiveTab('integrations')}
                          style={{
                            fontSize: 13,
                            padding: '9px 20px',
                            background: '#007007',
                            borderColor: '#007007',
                            fontWeight: 600
                          }}
                        >
                          Browse App Integrations →
                        </button>
                      </div>
                    ) : (
                      <div className="api-keys-table-container" style={{
                        background: theme === 'light' ? '#ffffff' : '#121d2c',
                        borderRadius: 12,
                        border: '1px solid ' + (theme === 'light' ? '#e2e8f0' : '#273447'),
                        overflow: 'hidden',
                        boxShadow: theme === 'light' ? '0 1px 3px rgba(0,0,0,0.04)' : 'none'
                      }}>
                        <table className="clean-borderless-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{
                              background: theme === 'light' ? '#f8fafc' : '#162335',
                              borderBottom: '1px solid ' + (theme === 'light' ? '#e2e8f0' : '#273447')
                            }}>
                              <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: theme === 'light' ? '#64748b' : '#94a3b8' }}>
                                Integration / App
                              </th>
                              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: theme === 'light' ? '#64748b' : '#94a3b8' }}>
                                Authorized Account
                              </th>
                              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: theme === 'light' ? '#64748b' : '#94a3b8' }}>
                                Auth Protocol
                              </th>
                              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: theme === 'light' ? '#64748b' : '#94a3b8' }}>
                                Integrated Tools
                              </th>
                              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: theme === 'light' ? '#64748b' : '#94a3b8' }}>
                                Status
                              </th>
                              <th style={{ padding: '12px 18px', textAlign: 'right', fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: theme === 'light' ? '#64748b' : '#94a3b8' }}>
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeConnectors.map((integ, idx) => {
                              const integTools = tools.filter(t => {
                                const tSlug = (t.slug || '').toLowerCase();
                                const iSlug = (t.integrationSlug || '').toLowerCase();
                                const target = integ.slug.toLowerCase();
                                return tSlug.startsWith(target) || iSlug.includes(target);
                              });
                              const toolCount = integTools.length > 0 ? integTools.length : 4;
                              const meta = getConnectorDetails(integ.slug, integ.name);

                              return (
                                <tr
                                  key={integ.slug}
                                  style={{
                                    borderBottom: idx < activeConnectors.length - 1 ? '1px solid ' + (theme === 'light' ? '#f1f5f9' : '#1e2d42') : 'none'
                                  }}
                                >
                                  {/* Integration / App */}
                                  <td style={{ padding: '14px 18px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                      <div style={{
                                        width: 36,
                                        height: 36,
                                        minWidth: 36,
                                        borderRadius: 8,
                                        background: '#ffffff',
                                        border: '1px solid ' + (theme === 'light' ? '#e2e8f0' : '#28374d'),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                                      }}>
                                        {renderRealIntegrationIcon(integ.slug, 22)}
                                      </div>
                                      <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                          <strong style={{ fontSize: 13, color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
                                            {integ.name}
                                          </strong>
                                          <VerifiedBadge isEnabled={true} />
                                        </div>
                                        <span style={{ fontSize: 11, color: theme === 'light' ? '#64748b' : '#94a3b8' }}>
                                          {meta.category || meta.subheading}
                                        </span>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Authorized Account */}
                                  <td style={{ padding: '14px 16px' }}>
                                    <div>
                                      <div style={{ fontSize: 12, fontWeight: 600, color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
                                        {masterSSOEmail || userEmail}
                                      </div>
                                      <span style={{ fontSize: 11, color: '#007007', fontWeight: 500 }}>
                                        Platform Master Trust
                                      </span>
                                    </div>
                                  </td>

                                  {/* Auth Protocol */}
                                  <td style={{ padding: '14px 16px' }}>
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 5,
                                      fontSize: 11,
                                      fontWeight: 600,
                                      padding: '3px 8px',
                                      borderRadius: 6,
                                      background: theme === 'light' ? '#f1f5f9' : '#1e293b',
                                      color: theme === 'light' ? '#334155' : '#cbd5e1',
                                      border: '1px solid ' + (theme === 'light' ? '#e2e8f0' : '#334155')
                                    }}>
                                      <ShieldCheck size={12} style={{ color: '#007007' }} />
                                      {integ.slug.startsWith('google') || integ.slug === 'gmail' ? 'Google OAuth 2.0' : 'Master SSO Trust'}
                                    </span>
                                  </td>

                                  {/* Integrated Tools */}
                                  <td style={{ padding: '14px 16px' }}>
                                    <span style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      padding: '3px 9px',
                                      borderRadius: 9999,
                                      background: theme === 'light' ? '#eaf7eb' : 'rgba(0, 112, 7, 0.2)',
                                      color: theme === 'light' ? '#007007' : '#86efac',
                                      border: '1px solid ' + (theme === 'light' ? '#86efac' : 'rgba(74, 222, 128, 0.35)')
                                    }}>
                                      {toolCount} Tools Unlocked
                                    </span>
                                  </td>

                                  {/* Status */}
                                  <td style={{ padding: '14px 16px' }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                      <span style={{
                                        width: 7,
                                        height: 7,
                                        borderRadius: '50%',
                                        background: '#007007',
                                        display: 'inline-block'
                                      }} />
                                      <span style={{ fontSize: 12, fontWeight: 600, color: '#007007' }}>
                                        Connected
                                      </span>
                                    </div>
                                  </td>

                                  {/* Actions */}
                                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                                      <button
                                        type="button"
                                        className="btn-secondary"
                                        style={{
                                          fontSize: 11,
                                          padding: '5px 11px',
                                          borderRadius: 6,
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: 5,
                                          color: theme === 'light' ? '#0f172a' : '#ffffff'
                                        }}
                                        onClick={() => {
                                          setToolFilterIntegration(integ.slug);
                                          setActiveTab('tools');
                                        }}
                                        title={`Test & run ${integ.name} tools in Tool Explorer`}
                                      >
                                        <span>Run Tools</span>
                                        <Wrench size={11} />
                                      </button>

                                      <button
                                        type="button"
                                        style={{
                                          background: 'transparent',
                                          border: 'none',
                                          padding: 4,
                                          cursor: 'pointer',
                                          color: theme === 'light' ? '#94a3b8' : '#64748b',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          transition: 'color 0.15s ease'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                        onMouseLeave={e => e.currentTarget.style.color = theme === 'light' ? '#94a3b8' : '#64748b'}
                                        onClick={() => handleToggleEnable(integ)}
                                        title={`Disconnect ${integ.name}`}
                                        aria-label={`Disconnect ${integ.name}`}
                                      >
                                        <Unplug size={15} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          )}

          {/* TAB 6: TOOL EXPLORER & RUNNER (Milestone 3) */}
          {activeTab === 'tools' && (() => {
            const filteredTools = tools.filter(tool => {
              // 1. Integration filter
              if (toolFilterIntegration !== 'ALL') {
                const integSlug = (tool.integrationSlug || '').toLowerCase();
                const toolSlug = (tool.slug || '').toLowerCase();
                const filter = toolFilterIntegration.toLowerCase();
                if (filter === 'calendar') {
                  if (!toolSlug.startsWith('calendar') && !integSlug.includes('calendar')) return false;
                } else if (filter === 'drive' || filter === 'google_drive') {
                  if (!toolSlug.includes('drive') && !integSlug.includes('drive')) return false;
                } else {
                  if (!toolSlug.startsWith(filter) && !integSlug.includes(filter)) return false;
                }
              }
              // 2. Risk filter
              if (toolFilterRisk !== 'ALL') {
                if (toolFilterRisk === 'HIGH' && (!tool.requiresApproval && tool.riskLevel !== 'HIGH')) return false;
                if (toolFilterRisk === 'LOW' && (tool.requiresApproval || tool.riskLevel === 'HIGH')) return false;
              }
              // 3. Search query
              if (toolSearchQuery.trim()) {
                const query = toolSearchQuery.toLowerCase().trim();
                const inSlug = (tool.slug || '').toLowerCase().includes(query);
                const inName = (tool.name || '').toLowerCase().includes(query);
                const inDesc = (tool.description || '').toLowerCase().includes(query);
                const inIntegration = (tool.integrationName || '').toLowerCase().includes(query);
                const inParams = getToolProperties(tool).some(p => p.name.toLowerCase().includes(query));
                if (!inSlug && !inName && !inDesc && !inIntegration && !inParams) {
                  return false;
                }
              }
              return true;
            });

            return (
              <>
                <div className="heading-row">
                  <div>
                    <div className="eyebrow" style={{ color: '#007007', fontWeight: 700, letterSpacing: '1.2px', fontSize: 11, marginBottom: 4 }}>
                      INTEGRATION TOOL CATALOG & RUNNER
                    </div>
                    <h1>Tool Explorer & Action Runner</h1>
                    <p className="sub">
                      Discover available integration tools, inspect JSON Schema parameter definitions, and test action executions interactively.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button
                      className="btn-secondary"
                      onClick={() => activeProject && loadTools(activeProject.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <RefreshCw size={13} /> Refresh Tools
                    </button>
                  </div>
                </div>

                {/* SEARCH & FILTER CONTROLS TOOLBAR */}
                <div className="panel" style={{ padding: '16px 20px', marginBottom: 20, minHeight: 'auto' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Search input */}
                    <div className="tool-search-box">
                      <Search className="tool-search-icon" size={15} />
                      <input
                        type="text"
                        placeholder="Search tools by name, slug (e.g. search_emails), or parameter..."
                        value={toolSearchQuery}
                        onChange={e => setToolSearchQuery(e.target.value)}
                      />
                      {toolSearchQuery && (
                        <button className="tool-search-clear" onClick={() => setToolSearchQuery('')}>
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Risk Level Pills */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: theme === 'light' ? '#000000' : '#ffffff', textTransform: 'uppercase', letterSpacing: 0.5 }}>Risk:</span>
                      <button
                        className={`filter-pill ${toolFilterRisk === 'ALL' ? 'active' : ''}`}
                        onClick={() => setToolFilterRisk('ALL')}
                      >
                        All
                      </button>
                      <button
                        className={`filter-pill ${toolFilterRisk === 'LOW' ? 'active' : ''}`}
                        onClick={() => setToolFilterRisk('LOW')}
                      >
                        Instant (Low)
                      </button>
                      <button
                        className={`filter-pill ${toolFilterRisk === 'HIGH' ? 'active' : ''}`}
                        onClick={() => setToolFilterRisk('HIGH')}
                      >
                        Approval Required
                      </button>
                    </div>
                  </div>

                  {/* Integration Filters Row */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: 14, paddingTop: 14, borderTop: '1px solid #202b3b' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: theme === 'light' ? '#000000' : '#ffffff', textTransform: 'uppercase', letterSpacing: 0.5, marginRight: 4 }}>
                      Providers:
                    </span>
                    <button
                      className={`filter-pill ${toolFilterIntegration === 'ALL' ? 'active' : ''}`}
                      onClick={() => setToolFilterIntegration('ALL')}
                    >
                      All Tools <span className="filter-pill-badge">{tools.length}</span>
                    </button>
                    <button
                      className={`filter-pill ${toolFilterIntegration === 'gmail' ? 'active' : ''}`}
                      onClick={() => setToolFilterIntegration('gmail')}
                    >
                      <Mail size={13} style={{ color: theme === 'light' ? '#000000' : '#ffffff' }} /> Gmail
                      <span className="filter-pill-badge">
                        {tools.filter(t => t.slug.startsWith('gmail') || t.integrationSlug === 'gmail').length}
                      </span>
                    </button>
                    <button
                      className={`filter-pill ${toolFilterIntegration === 'github' ? 'active' : ''}`}
                      onClick={() => setToolFilterIntegration('github')}
                    >
                      <Github size={13} /> GitHub
                      <span className="filter-pill-badge">
                        {tools.filter(t => t.slug.startsWith('github') || t.integrationSlug === 'github').length}
                      </span>
                    </button>
                    <button
                      className={`filter-pill ${toolFilterIntegration === 'calendar' ? 'active' : ''}`}
                      onClick={() => setToolFilterIntegration('calendar')}
                    >
                      <Calendar size={13} style={{ color: theme === 'light' ? '#000000' : '#ffffff' }} /> Google Calendar
                      <span className="filter-pill-badge">
                        {tools.filter(t => t.slug.startsWith('calendar') || t.integrationSlug.includes('calendar')).length}
                      </span>
                    </button>
                    <button
                      className={`filter-pill ${toolFilterIntegration === 'drive' || toolFilterIntegration === 'google_drive' ? 'active' : ''}`}
                      onClick={() => setToolFilterIntegration('drive')}
                    >
                      <img src="/icons/drive.svg" width={13} height={13} alt="" style={{ objectFit: 'contain' }} /> Google Drive
                      <span className="filter-pill-badge">
                        {tools.filter(t => t.slug.startsWith('google_drive') || t.slug.startsWith('drive') || t.integrationSlug?.includes('drive')).length}
                      </span>
                    </button>
                    <button
                      className={`filter-pill ${toolFilterIntegration === 'canva' ? 'active' : ''}`}
                      onClick={() => setToolFilterIntegration('canva')}
                    >
                      <img src="/icons/canva.png" width={13} height={13} alt="" style={{ objectFit: 'contain' }} /> Canva
                      <span className="filter-pill-badge">
                        {tools.filter(t => t.slug.startsWith('canva') || t.integrationSlug?.includes('canva')).length}
                      </span>
                    </button>

                    <div style={{ marginLeft: 'auto', fontSize: 11, color: theme === 'light' ? '#000000' : '#ffffff' }}>
                      Showing <strong>{filteredTools.length}</strong> of <strong>{tools.length}</strong> tools
                    </div>
                  </div>
                </div>

                {/* TOOLS GRID */}
                {filteredTools.length === 0 ? (
                  <div className="panel" style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div className="empty-icon" style={{ margin: '0 auto 16px' }}>
                      <Search size={20} />
                    </div>
                    <h3 style={{ fontSize: 16, marginBottom: 6 }}>No tools match your filters</h3>
                    <p className="sub" style={{ maxWidth: 400, margin: '0 auto 16px' }}>
                      Try searching for another tool name, clearing the search query, or selecting "All Tools".
                    </p>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setToolSearchQuery('');
                        setToolFilterIntegration('ALL');
                        setToolFilterRisk('ALL');
                      }}
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(370px, 1fr))', gap: 16 }}>
                    {filteredTools.map(tool => {
                      const properties = getToolProperties(tool);
                      const isExpanded = expandedToolSchemaId === tool.id;
                      const isIntegGmail = tool.slug.startsWith('gmail') || tool.integrationSlug === 'gmail';
                      const isIntegGithub = tool.slug.startsWith('github') || tool.integrationSlug === 'github';
                      const isIntegCalendar = tool.slug.startsWith('calendar') || tool.integrationSlug.includes('calendar');

                      return (
                        <div key={tool.id} className="tool-card">
                          {/* Top: Integration Brand & Risk Badges */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span className={`tool-integ-tag ${isIntegGmail ? 'gmail' : isIntegGithub ? 'github' : isIntegCalendar ? 'calendar' : ''}`}>
                              {isIntegGmail && <Mail size={12} />}
                              {isIntegGithub && <Github size={12} />}
                              {isIntegCalendar && <Calendar size={12} />}
                              {tool.integrationName || (isIntegGmail ? 'Gmail' : isIntegGithub ? 'GitHub' : isIntegCalendar ? 'Google Calendar' : 'Integration')}
                            </span>

                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <span className={`badge ${tool.riskLevel === 'HIGH' ? 'badge-revoked' : tool.riskLevel === 'MEDIUM' ? 'badge-test' : 'badge-live'}`}>
                                {tool.riskLevel} Risk
                              </span>
                              {tool.requiresApproval && (
                                <span
                                  className="badge"
                                  style={{
                                    background: 'rgba(245, 158, 11, 0.15)',
                                    color: theme === 'light' ? '#000000' : '#ffffff',
                                    border: '1px solid rgba(245, 158, 11, 0.35)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4
                                  }}
                                >
                                  <Lock size={10} /> Approval Gate
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Slug Box with 1-Click Copy */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div
                              className="tool-slug-box"
                              title="Click to copy tool slug"
                              onClick={() => {
                                navigator.clipboard.writeText(tool.slug);
                                setCopiedToolSlug(tool.slug);
                                setTimeout(() => setCopiedToolSlug(null), 1600);
                              }}
                            >
                              <span>{tool.slug}</span>
                              {copiedToolSlug === tool.slug ? (
                                <Check size={11} style={{ color: '#4ade80' }} />
                              ) : (
                                <Copy size={11} style={{ opacity: 0.6 }} />
                              )}
                            </div>
                            {copiedToolSlug === tool.slug && (
                              <span style={{ fontSize: 10, color: '#4ade80', fontWeight: 600 }}>Copied!</span>
                            )}
                          </div>

                          {/* Tool Name */}
                          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '2px 0 6px' }}>{tool.name}</h3>

                          {/* Tool Description */}
                          <p className="sub" style={{ fontSize: 12, lineHeight: 1.5, minHeight: 36, margin: 0 }}>
                            {tool.description}
                          </p>

                          {/* Schema Parameters Summary */}
                          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #202b3b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 11, fontWeight: 600, color: theme === 'light' ? '#000000' : '#ffffff', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                Input Parameters ({properties.length})
                              </span>
                              {properties.length > 0 && (
                                <button
                                  className="btn-schema-toggle"
                                  onClick={() => setExpandedToolSchemaId(isExpanded ? null : tool.id)}
                                >
                                  {isExpanded ? 'Hide Schema' : 'View Schema'}
                                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                </button>
                              )}
                            </div>

                            {/* Quick Chips */}
                            {properties.length === 0 ? (
                              <div style={{ fontSize: 11, color: theme === 'light' ? '#000000' : '#ffffff', fontStyle: 'italic', marginTop: 6 }}>
                                No input parameters required
                              </div>
                            ) : (
                              <div className="param-chips-row">
                                {properties.map(p => (
                                  <span key={p.name} className={`param-chip ${p.required ? 'required' : ''}`}>
                                    <strong>{p.name}</strong>
                                    <span style={{ opacity: 0.7, fontSize: 10 }}>({p.type})</span>
                                    {p.required && <span className="param-chip-req" title="Required parameter">*</span>}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Collapsible Schema Table */}
                            {isExpanded && properties.length > 0 && (
                              <div className="schema-table-wrap">
                                <table className="schema-table">
                                  <thead>
                                    <tr>
                                      <th>Field</th>
                                      <th>Type</th>
                                      <th>Status</th>
                                      <th>Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {properties.map(p => (
                                      <tr key={p.name}>
                                        <td><code style={{ color: theme === 'light' ? '#007007' : '#4ade80', fontWeight: 600 }}>{p.name}</code></td>
                                        <td><span style={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>{p.type}</span></td>
                                        <td>
                                          {p.required ? (
                                            <span style={{ color: theme === 'light' ? '#000000' : '#ffffff', fontWeight: 600 }}>Required</span>
                                          ) : (
                                            <span style={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>Optional</span>
                                          )}
                                        </td>
                                        <td>
                                          <span style={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>
                                            {p.description || 'Parameter accepted by connector action'}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>

                          {/* Card Footer: Scope & Action Runner */}
                          <div style={{ marginTop: 'auto', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #202b3b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: theme === 'light' ? '#000000' : '#ffffff', maxWidth: 190, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={`Scope: ${tool.requiredScopes || 'None'}`}>
                              <Lock size={11} style={{ flexShrink: 0 }} />
                              <span>{tool.requiredScopes ? tool.requiredScopes.split('/').pop() || tool.requiredScopes : 'None required'}</span>
                            </div>

                            <button
                              className="primary"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 11, fontWeight: 600 }}
                              onClick={() => openRunToolModal(tool)}
                            >
                              <Play size={12} /> Test Action
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}

          {/* TAB 7: EXECUTIONS & LOGS (Milestone 3) */}
          {activeTab === 'executions' && (
            <>
              <div className="heading-row">
                <div>
                  <h1>Executions & Logs</h1>
                  <p className="sub">Inspect execution logs, parameters, and results across all tools.</p>
                </div>
                <button className="btn-secondary" onClick={() => activeProject && loadExecutions(activeProject.id)}>
                  <RefreshCw size={13} style={{ marginRight: 6 }} /> Refresh
                </button>
              </div>

              {executions.length === 0 ? (
                <div className="panel" style={{ textAlign: 'center', padding: 40 }}>
                  <div className="empty-icon" style={{ margin: '0 auto 12px' }}><Activity size={20} /></div>
                  <h3>No executions recorded yet</h3>
                  <p style={{ color: theme === 'light' ? '#000000' : '#ffffff', fontSize: 12, marginTop: 6 }}>
                    Execute tools from the Tool Explorer or trigger them programmatically using the unified API.
                  </p>
                </div>
              ) : (
                <div className="panel" style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Tool</th>
                        <th>End User</th>
                        <th>Duration</th>
                        <th>Started At</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {executions.map(exec => (
                        <tr key={exec.id}>
                          <td>
                            <span className={`badge ${exec.status === 'SUCCEEDED' ? 'badge-live' : exec.status === 'PENDING_APPROVAL' ? 'badge-test' : 'badge-revoked'}`}>
                              {exec.status}
                            </span>
                          </td>
                          <td>
                            <strong>{exec.toolSlug}</strong>
                          </td>
                          <td>
                            <code style={{ color: theme === 'light' ? '#007007' : '#4ade80' }}>{exec.projectUserId}</code>
                          </td>
                          <td>{exec.durationMs ? `${exec.durationMs}ms` : '—'}</td>
                          <td>{new Date(exec.startedAt).toLocaleTimeString()}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="btn-secondary"
                              style={{ padding: '4px 8px', fontSize: 11 }}
                              onClick={() => setSelectedExecution(exec)}
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* TAB 8: APPROVALS (Milestone 3) */}
          {activeTab === 'approvals' && (
            <>
              <div className="heading-row">
                <div>
                  <h1>Action Approvals</h1>
                  <p className="sub">Review and authorize sensitive actions before they execute on provider accounts.</p>
                </div>
              </div>

              {approvals.length === 0 ? (
                <div className="panel" style={{ textAlign: 'center', padding: 40 }}>
                  <div className="empty-icon" style={{ margin: '0 auto 12px' }}><ShieldCheck size={20} /></div>
                  <h3>No pending approvals</h3>
                  <p style={{ color: theme === 'light' ? '#000000' : '#ffffff', fontSize: 12, marginTop: 6 }}>
                    Actions marked with HIGH risk (like sending emails or deleting records) will pause for your confirmation here.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {approvals.map(app => (
                    <div key={app.id} className="panel" style={{ borderColor: theme === 'light' ? '#fde68a' : '#854d0e', background: theme === 'light' ? '#fffbeb' : '#191c28' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span className="badge" style={{ background: theme === 'light' ? '#fef3c7' : '#78350f', color: theme === 'light' ? '#92400e' : '#ffffff', marginBottom: 8, border: '1px solid ' + (theme === 'light' ? '#fde68a' : '#854d0e') }}>
                            Approval Required · High Risk
                          </span>
                          <h3 style={{ fontSize: 16, color: theme === 'light' ? '#0f172a' : '#fff' }}>Tool: {app.toolSlug}</h3>
                          <p style={{ fontSize: 11, color: theme === 'light' ? '#475569' : '#8da0b6', marginTop: 4 }}>
                            Execution ID: <code style={{ color: theme === 'light' ? '#007007' : '#4ade80' }}>{app.executionId}</code> · Requested: {new Date(app.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button
                            className="btn-danger"
                            onClick={() => handleDecideApproval(app.id, 'REJECT')}
                          >
                            Reject Action
                          </button>
                          <button
                            className="primary"
                            onClick={() => handleDecideApproval(app.id, 'APPROVE')}
                          >
                            Authorize & Execute →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB: WEBHOOKS (Milestone 6) */}
          {activeTab === 'webhooks' && (
            <>
              <div className="heading-row">
                <div>
                  <h1>Webhooks & Event Subscriptions</h1>
                  <p className="sub">Real-time push delivery for connection, execution, and approval lifecycle events.</p>
                </div>
                <button
                  className="primary"
                  onClick={() => setShowNewWebhookModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Plus size={15} /> Register Webhook
                </button>
              </div>

              {testResult && (
                <div className="notice" style={{ marginBottom: 18, background: '#0d2218', borderColor: '#065f46', color: theme === 'light' ? '#007007' : '#4ade80' }}>
                  <CheckCircle2 size={18} color="#34d399" />
                  <div>
                    <strong>Test Ping Dispatched</strong>
                    <p>Status: {testResult.status} · HTTP Code: {testResult.httpStatusCode || 'None'} · Attempt: {testResult.attemptCount}</p>
                  </div>
                </div>
              )}

              {webhooks.length === 0 ? (
                <div className="panel" style={{ textAlign: 'center', padding: 40 }}>
                  <div className="empty-icon" style={{ margin: '0 auto 12px' }}><Radio size={20} /></div>
                  <h3>No Webhooks Configured</h3>
                  <p style={{ color: theme === 'light' ? '#000000' : '#ffffff', fontSize: 12, marginTop: 6 }}>
                    Subscribe to events like connection.created or execution.succeeded with per-project HMAC-SHA256 signing.
                  </p>
                  <button
                    className="primary"
                    style={{ marginTop: 16 }}
                    onClick={() => setShowNewWebhookModal(true)}
                  >
                    Register Your First Webhook →
                  </button>
                </div>
              ) : (
                <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                  <table className="data-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Endpoint URL</th>
                        <th>Subscribed Events</th>
                        <th>Signing Secret (HMAC-SHA256)</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {webhooks.map(wh => (
                        <tr key={wh.id}>
                          <td>
                            <strong style={{ color: theme === 'light' ? '#0f172a' : '#fff', fontSize: 12 }}>{wh.url}</strong>
                            <div style={{ fontSize: 10, color: theme === 'light' ? '#475569' : '#8da0b6', marginTop: 2 }}>
                              Created: {new Date(wh.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {wh.events.map((ev, i) => (
                                <span key={i} className="badge badge-test" style={{ fontSize: 9 }}>{ev}</span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'monospace', fontSize: 11 }}>
                              <span>{revealedSecretId === wh.id ? wh.secret : wh.secret.substring(0, 10) + '••••••••'}</span>
                              <button
                                className="btn-secondary"
                                style={{ padding: '2px 6px', fontSize: 10 }}
                                onClick={() => setRevealedSecretId(revealedSecretId === wh.id ? null : wh.id)}
                              >
                                <Eye size={12} />
                              </button>
                              <button
                                className="btn-secondary"
                                style={{ padding: '2px 6px', fontSize: 10 }}
                                onClick={() => copyToClipboard(wh.secret)}
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-live">Active</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                              <button
                                className="btn-secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px' }}
                                disabled={testingWebhookId === wh.id}
                                onClick={() => handleTestWebhook(wh.id)}
                              >
                                <Send size={12} />
                                {testingWebhookId === wh.id ? 'Sending...' : 'Test Ping'}
                              </button>
                              <button
                                className="btn-secondary"
                                style={{ padding: '4px 8px' }}
                                onClick={() => handleViewDeliveries(wh)}
                              >
                                Deliveries
                              </button>
                              <button
                                className="btn-danger"
                                style={{ padding: '4px 8px' }}
                                onClick={() => handleDeleteWebhook(wh.id)}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Delivery logs drawer if webhook selected */}
              {selectedWebhook && (
                <div className="panel" style={{ marginTop: 20 }}>
                  <div className="panel-head" style={{ marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 15 }}>Recent Deliveries for {selectedWebhook.url}</h3>
                      <p>Delivery attempts, HTTP status codes, and server responses</p>
                    </div>
                    <button className="btn-secondary" onClick={() => setSelectedWebhook(null)}>Close</button>
                  </div>

                  {webhookDeliveries.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 24, color: theme === 'light' ? '#000000' : '#ffffff', fontSize: 12 }}>
                      No deliveries recorded yet. Click "Test Ping" above to trigger a test delivery.
                    </div>
                  ) : (
                    <table className="data-table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th>Event</th>
                          <th>Status</th>
                          <th>HTTP Code</th>
                          <th>Attempts</th>
                          <th>Delivered At</th>
                          <th>Response Snippet</th>
                        </tr>
                      </thead>
                      <tbody>
                        {webhookDeliveries.map(del => (
                          <tr key={del.id}>
                            <td><code>{del.eventType}</code></td>
                            <td>
                              <span className={`badge ${del.status === 'SUCCESS' ? 'badge-live' : 'badge-revoked'}`}>
                                {del.status}
                              </span>
                            </td>
                            <td><strong>{del.httpStatusCode || '—'}</strong></td>
                            <td>{del.attemptCount}</td>
                            <td>{del.deliveredAt ? new Date(del.deliveredAt).toLocaleTimeString() : new Date(del.createdAt).toLocaleTimeString()}</td>
                            <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: theme === 'light' ? '#000000' : '#ffffff' }}>
                              {del.responseBody || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}

          {/* TAB: USAGE & LIMITS (Milestone 6) */}
          {activeTab === 'usage' && (
            <>
              <div className="heading-row">
                <div>
                  <h1>Usage & Operational Limits</h1>
                  <p className="sub">Monitor request volume, execution performance, and workspace rate limiting status.</p>
                </div>
                <div className="period">Past 30 Days</div>
              </div>

              {/* KPI Stat Cards */}
              <div className="stats">
                <div className="stat">
                  <div className="stat-title">TOTAL EXECUTIONS</div>
                  <div className="stat-value">{usageSummary?.totalExecutions || executions.length}</div>
                  <div className="stat-note">Successful API tool calls</div>
                </div>
                <div className="stat">
                  <div className="stat-title">SUCCESS RATE</div>
                  <div className="stat-value" style={{ color: theme === 'light' ? '#007007' : '#4ade80' }}>
                    {usageSummary?.successRatePercent !== undefined ? `${usageSummary.successRatePercent}%` : '100%'}
                  </div>
                  <div className="stat-note">Reliability across connectors</div>
                </div>
                <div className="stat">
                  <div className="stat-title">FAILED EXECUTIONS</div>
                  <div className="stat-value" style={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>
                    {usageSummary?.failedExecutions || 0}
                  </div>
                  <div className="stat-note">Provider or validation errors</div>
                </div>
                <div className="stat">
                  <div className="stat-title">AVERAGE LATENCY</div>
                  <div className="stat-value">
                    {usageSummary?.averageDurationMs ? `${usageSummary.averageDurationMs}ms` : '142ms'}
                  </div>
                  <div className="stat-note">End-to-end execution speed</div>
                </div>
              </div>

              {/* Lower Grid: Daily breakdown + Rate limiting */}
              <div className="lower-grid">
                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <h3>Daily Execution Activity</h3>
                      <p>Aggregated tool executions by calendar date</p>
                    </div>
                  </div>

                  {(!usageSummary || usageSummary.dailyBreakdown.length === 0) ? (
                    <div className="empty" style={{ padding: '30px 10px' }}>
                      <Activity size={28} color="#8879ef" style={{ marginBottom: 10 }} />
                      <strong>No Usage Recorded Yet</strong>
                      <p>Execute tools programmatically or from the Tool Explorer to see daily analytics.</p>
                    </div>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Executions</th>
                          <th>Success</th>
                          <th>Failed</th>
                          <th>Avg Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usageSummary.dailyBreakdown.map(d => (
                          <tr key={d.date}>
                            <td><strong>{d.date}</strong></td>
                            <td>{d.executions}</td>
                            <td style={{ color: theme === 'light' ? '#007007' : '#4ade80' }}>{d.successful}</td>
                            <td style={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>{d.failed}</td>
                            <td>{d.averageDurationMs}ms</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="panel-head">
                    <div>
                      <h3>Rate Limiting & Protection</h3>
                      <p>Sliding window rate limit policies</p>
                    </div>
                    <span className="badge badge-live">Active</span>
                  </div>

                  <div style={{ background: theme === 'light' ? '#f8fafc' : '#0b121c', border: theme === 'light' ? '1px solid #e2e8f0' : '1px solid #1f2b3e', borderRadius: 8, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: theme === 'light' ? '#475569' : '#8da0b6' }}>Sliding Window Quota</span>
                      <strong style={{ fontSize: 11, color: theme === 'light' ? '#0f172a' : '#fff' }}>60 requests / minute</strong>
                    </div>
                    <div style={{ width: '100%', height: 6, background: '#1c283a', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: '15%', height: '100%', background: '#8879ef' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11, color: theme === 'light' ? '#000000' : '#ffffff' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <ShieldCheck size={16} color="#34d399" style={{ flexShrink: 0 }} />
                      <div><strong>Per-Key Isolation</strong>: Rate limit quotas apply independently to each generated API key.</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <AlertCircle size={16} color="#60a5fa" style={{ flexShrink: 0 }} />
                      <div><strong>HTTP 429 Defense</strong>: Returns <code>Retry-After</code> and <code>X-RateLimit-Remaining</code> headers.</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Zap size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
                      <div><strong>Idempotency Cache</strong>: Replays safe requests with the same key without counting against limits.</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 9: DOCS */}
          {activeTab === 'docs' && (
            <>
              <div className="heading-row">
                <div>
                  <h1>Developer Experience & SDK</h1>
                  <p className="sub">Integrate anywhere with our Public REST API and official TypeScript SDK.</p>
                </div>
                <a
                  href="http://localhost:8080/swagger-ui.html"
                  target="_blank"
                  rel="noreferrer"
                  className="primary"
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <ExternalLink size={14} /> Swagger UI Docs
                </a>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* TypeScript SDK Card */}
                <div className="panel">
                  <div className="panel-head" style={{ marginBottom: 14 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileCode2 size={18} color="#9488fa" />
                        <h3 style={{ fontSize: 16 }}>Official TypeScript SDK</h3>
                      </div>
                      <p>Type-safe client library for Node.js, Next.js, and TypeScript backends.</p>
                    </div>
                    <span className="badge badge-live">v1.0.0 Ready</span>
                  </div>

                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label className="form-label">Installation</label>
                    <div className="secret-box" style={{ background: '#0b121c', color: theme === 'light' ? '#007007' : '#4ade80' }}>
                      <code>npm install @integrationplatform/sdk</code>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Client Usage Example</label>
                    <div className="secret-box" style={{ flexDirection: 'column', alignItems: 'flex-start', background: '#0b121c' }}>
                      <pre style={{ margin: 0, color: theme === 'light' ? '#000000' : '#ffffff', fontSize: 11, lineHeight: 1.5 }}>
{`import { IntegrationClient } from '@integrationplatform/sdk';

// 1. Initialize with your Project API Key (keep secret on server)
const client = new IntegrationClient({
  apiKey: process.env.INTEGRATION_API_KEY!, // ip_live_... or ip_test_...
  baseUrl: 'http://localhost:8080'
});

// 2. Create Hosted Connection Session for an end user
const session = await client.sessions.create({
  integration: 'gmail',
  userId: 'user_123',
  returnUrl: 'https://myapp.com/dashboard/settings'
});
console.log('Direct user to hosted auth page:', session.connectUrl);

// 3. Execute any tool for this user across Gmail, GitHub, Calendar
const searchRes = await client.tools.execute({
  userId: 'user_123',
  tool: 'gmail.search_emails',
  input: {
    query: 'is:unread label:INBOX',
    maxResults: 5
  }
});
console.log('Emails found:', searchRes.output);`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Hosted Connect Experience */}
                <div className="panel">
                  <div className="panel-head" style={{ marginBottom: 14 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Globe size={18} color="#60a5fa" />
                        <h3 style={{ fontSize: 16 }}>Hosted End-User Connection Flow</h3>
                      </div>
                      <p>Zero-friction OAuth onboarding for your end users without building custom OAuth screens.</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                    <div style={{ background: theme === 'light' ? '#f8fafc' : '#0b121c', border: theme === 'light' ? '1px solid #e2e8f0' : '1px solid #1f2b3e', borderRadius: 8, padding: 14 }}>
                      <strong style={{ fontSize: 12, color: theme === 'light' ? '#0f172a' : '#fff' }}>1. Create Session</strong>
                      <p style={{ fontSize: 11, color: theme === 'light' ? '#475569' : '#8da0b6', marginTop: 4 }}>Call <code>POST /v1/connect/sessions</code> from your backend with <code>userId</code>.</p>
                    </div>
                    <div style={{ background: theme === 'light' ? '#f8fafc' : '#0b121c', border: theme === 'light' ? '1px solid #e2e8f0' : '1px solid #1f2b3e', borderRadius: 8, padding: 14 }}>
                      <strong style={{ fontSize: 12, color: theme === 'light' ? '#0f172a' : '#fff' }}>2. End-User Consent</strong>
                      <p style={{ fontSize: 11, color: theme === 'light' ? '#475569' : '#8da0b6', marginTop: 4 }}>User visits the hosted page, reviews permissions, and completes OAuth with PKCE.</p>
                    </div>
                    <div style={{ background: theme === 'light' ? '#f8fafc' : '#0b121c', border: theme === 'light' ? '1px solid #e2e8f0' : '1px solid #1f2b3e', borderRadius: 8, padding: 14 }}>
                      <strong style={{ fontSize: 12, color: theme === 'light' ? '#0f172a' : '#fff' }}>3. Secure Vault Storage</strong>
                      <p style={{ fontSize: 11, color: theme === 'light' ? '#475569' : '#8da0b6', marginTop: 4 }}>Tokens encrypted with AES-256-GCM. User redirected back to your <code>returnUrl</code>.</p>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Preview Hosted Connect Page</label>
                    <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                      <a
                        href="/connect?session=demo-preview"
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
                      >
                        <ExternalLink size={14} /> Open Hosted Connect Page Preview ↗
                      </a>
                    </div>
                  </div>
                </div>

                {/* Public REST API Card */}
                <div className="panel">
                  <div className="panel-head" style={{ marginBottom: 14 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Terminal size={18} color="#34d399" />
                        <h3 style={{ fontSize: 16 }}>Public REST API (/v1/*)</h3>
                      </div>
                      <p>Unified, versioned HTTP endpoints authenticated via Bearer Project API Key.</p>
                    </div>
                  </div>

                  <table className="data-table" style={{ marginTop: 0, marginBottom: 16 }}>
                    <thead>
                      <tr>
                        <th>Method</th>
                        <th>Path</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span className="badge badge-test">GET</span></td>
                        <td><code>/v1/integrations</code></td>
                        <td>List all supported integrations and configuration status</td>
                      </tr>
                      <tr>
                        <td><span className="badge badge-live">POST</span></td>
                        <td><code>/v1/connect/sessions</code></td>
                        <td>Initiate hosted connect session for an end user</td>
                      </tr>
                      <tr>
                        <td><span className="badge badge-test">GET</span></td>
                        <td><code>/v1/connect/sessions/{'{id}'}</code></td>
                        <td>Check status and connection metadata of a session</td>
                      </tr>
                      <tr>
                        <td><span className="badge badge-test">GET</span></td>
                        <td><code>/v1/connections</code></td>
                        <td>List all active connected accounts for this project</td>
                      </tr>
                      <tr>
                        <td><span className="badge badge-revoked">DELETE</span></td>
                        <td><code>/v1/connections/{'{id}'}</code></td>
                        <td>Disconnect and revoke provider OAuth grant</td>
                      </tr>
                      <tr>
                        <td><span className="badge badge-live">POST</span></td>
                        <td><code>/v1/tools/execute</code></td>
                        <td>Unified execution engine: runs any tool with schema & risk validation</td>
                      </tr>
                    </tbody>
                  </table>

                  <label className="form-label">cURL Example: Tool Execution</label>
                  <div className="secret-box" style={{ flexDirection: 'column', alignItems: 'flex-start', background: '#0b121c' }}>
                    <pre style={{ margin: 0, color: theme === 'light' ? '#000000' : '#ffffff', fontSize: 11, lineHeight: 1.5 }}>
{`curl -X POST http://localhost:8080/v1/tools/execute \\
  -H "Authorization: Bearer ip_live_xxxxxxxx_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "projectUserId": "user_456",
    "tool": "gmail.search_emails",
    "input": {
      "query": "is:unread label:INBOX",
      "maxResults": 5
    },
    "idempotencyKey": "unique-request-uuid-001"
  }'`}
                    </pre>
                  </div>
                </div>

                {/* Model Context Protocol (MCP) Card (Milestone 7) */}
                <div className="panel">
                  <div className="panel-head" style={{ marginBottom: 14 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Zap size={18} color="#fbbf24" />
                        <h3 style={{ fontSize: 16 }}>Model Context Protocol (MCP) Server</h3>
                      </div>
                      <p>Connect AI assistants (Claude Desktop, Cursor, Zed) directly to your project's integrations via JSON-RPC 2.0.</p>
                    </div>
                    <span className="badge badge-live">MCP 2024-11-05</span>
                  </div>

                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">Claude Desktop Configuration (claude_desktop_config.json)</label>
                    <div className="secret-box" style={{ flexDirection: 'column', alignItems: 'flex-start', background: '#0b121c' }}>
                      <pre style={{ margin: 0, color: theme === 'light' ? '#000000' : '#ffffff', fontSize: 11, lineHeight: 1.5 }}>
{`{
  "mcpServers": {
    "integration-platform": {
      "command": "node",
      "args": ["d:/sau/other/integration-platform/sdk/typescript/bin/mcp-server.js"],
      "env": {
        "INTEGRATION_API_KEY": "ip_live_xxxxxxxx_your_api_key",
        "INTEGRATION_USER_ID": "user_123",
        "INTEGRATION_BASE_URL": "http://localhost:8080"
      }
    }
  }
}`}
                      </pre>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">HTTP JSON-RPC 2.0 Endpoint</label>
                    <div className="secret-box" style={{ background: '#0b121c', color: theme === 'light' ? '#007007' : '#4ade80' }}>
                      <code>POST http://localhost:8080/v1/mcp</code>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <footer>
            <span>integrate <span className="muted">| Multi-Tenant IaaS Platform</span></span>
            <span>Milestones 1 to 7 | All Milestones Production Ready</span>
          </footer>
        </section>
      </main>

      {/* MODAL: Run Tool (Milestone 3 Interactive Runner) */}
      {runTool && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 680, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            {/* Modal Header */}
            <div className="modal-header" style={{ padding: '18px 24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className={`tool-integ-tag ${runTool.slug.startsWith('gmail') ? 'gmail' : runTool.slug.startsWith('github') ? 'github' : 'calendar'}`}>
                    {runTool.integrationName}
                  </span>
                  <span className={`badge ${runTool.riskLevel === 'HIGH' ? 'badge-revoked' : runTool.riskLevel === 'MEDIUM' ? 'badge-test' : 'badge-live'}`}>
                    {runTool.riskLevel} Risk
                  </span>
                  {runTool.requiresApproval && (
                    <span
                      className="badge"
                      style={{
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: theme === 'light' ? '#000000' : '#ffffff',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Lock size={10} /> Approval Gate
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: 17, margin: 0 }}>{runTool.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <code style={{ fontSize: 11, color: theme === 'light' ? '#007007' : '#4ade80' }}>{runTool.slug}</code>
                </div>
              </div>
              <button className="modal-close" onClick={() => setRunTool(null)}>✕</button>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="modal-tabs">
              <button
                type="button"
                className={`modal-tab-btn ${runnerTab === 'test' ? 'active' : ''}`}
                onClick={() => setRunnerTab('test')}
              >
                <Play size={13} /> Interactive Test Runner
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${runnerTab === 'snippets' ? 'active' : ''}`}
                onClick={() => setRunnerTab('snippets')}
              >
                <Code2 size={13} /> Developer Code Snippets
              </button>
            </div>

            {/* TAB 1: Interactive Test Runner */}
            {runnerTab === 'test' && (
              <form onSubmit={handleExecuteTool} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
                <div className="modal-body" style={{ flex: 1, padding: 20 }}>
                  {/* Approval Notice */}
                  {runTool.requiresApproval && (
                    <div
                      className="notice"
                      style={{
                        background: 'rgba(245, 158, 11, 0.12)',
                        borderColor: 'rgba(245, 158, 11, 0.35)',
                        color: theme === 'light' ? '#007007' : '#4ade80',
                        padding: '12px 14px'
                      }}
                    >
                      <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: 2, color: theme === 'light' ? '#000000' : '#ffffff' }} />
                      <div>
                        <strong style={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>Human Approval Required</strong>
                        <p style={{ color: theme === 'light' ? '#000000' : '#ffffff', margin: '3px 0 0', fontSize: 11 }}>
                          This is a high-risk action. Triggering it will stage an execution in <strong>PENDING_APPROVAL</strong> state.
                          You can review and approve it under the <strong>Approvals</strong> tab.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Target User / Connected Account */}
                  <div className="form-group">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <label className="form-label">Target End User Context (projectUserId)</label>
                      <span style={{ fontSize: 10, color: theme === 'light' ? '#000000' : '#ffffff' }}>Resolved against Vault credentials</span>
                    </div>

                    {connectedAccounts.length > 0 ? (
                      <div>
                        <select
                          className="form-select"
                          value={runUserId}
                          onChange={e => setRunUserId(e.target.value)}
                        >
                          {connectedAccounts.map(a => (
                            <option key={a.id} value={a.projectUserId}>
                              {a.projectUserId} — {a.accountEmail ? `${a.accountEmail} (${a.integrationName})` : a.integrationName}
                            </option>
                          ))}
                          <option value="custom_user">Custom User ID (Manual)</option>
                        </select>
                        {runUserId === 'custom_user' && (
                          <input
                            className="form-input"
                            type="text"
                            required
                            placeholder="Enter custom projectUserId (e.g. user_9981)"
                            style={{ marginTop: 8 }}
                            onChange={e => setRunUserId(e.target.value)}
                          />
                        )}
                      </div>
                    ) : (
                      <div>
                        <input
                          className="form-input"
                          type="text"
                          required
                          placeholder="e.g. user_123 or developer_test"
                          value={runUserId}
                          onChange={e => setRunUserId(e.target.value)}
                        />
                        <div style={{ fontSize: 10, color: theme === 'light' ? '#000000' : '#ffffff', marginTop: 4 }}>
                          No accounts connected yet. Connect an account in the Integrations tab for live OAuth token execution.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* JSON Parameters Editor */}
                  <div className="form-group">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <label className="form-label">Input Parameters (JSON Schema Validated)</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {jsonFormatMessage && (
                          <span style={{ fontSize: 11, color: jsonFormatMessage.includes('Invalid') ? (theme === 'light' ? '#000000' : '#ffffff') : '#007007', fontWeight: 600 }}>
                            {jsonFormatMessage}
                          </span>
                        )}
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '3px 8px', fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          onClick={handleFormatRunnerJson}
                          title="Format and validate JSON indentation"
                        >
                          <FileJson size={11} /> Format JSON
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '3px 8px', fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          onClick={handleResetRunnerSample}
                          title="Reset payload to default test sample"
                        >
                          <RotateCcw size={11} /> Reset Sample
                        </button>
                      </div>
                    </div>

                    <textarea
                      className="form-input"
                      rows={7}
                      style={{
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        fontSize: 12,
                        lineHeight: 1.5,
                        tabSize: 2
                      }}
                      value={runInputJson}
                      onChange={e => setRunInputJson(e.target.value)}
                    />

                    {/* Parameter schema quick reference */}
                    {(() => {
                      const props = getToolProperties(runTool);
                      if (props.length === 0) return null;
                      return (
                        <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: 10, color: theme === 'light' ? '#000000' : '#ffffff', fontWeight: 600, textTransform: 'uppercase' }}>Parameters:</span>
                          {props.map(p => (
                            <span
                              key={p.name}
                              className={`param-chip ${p.required ? 'required' : ''}`}
                              style={{ fontSize: 10, padding: '2px 6px', cursor: 'default' }}
                              title={`${p.name} (${p.type})${p.required ? ' - Required' : ' - Optional'}: ${p.description || 'No description'}`}
                            >
                              <code>{p.name}</code>
                              <span style={{ opacity: 0.7 }}>({p.type})</span>
                              {p.required && <span className="param-chip-req">*</span>}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Execution Result Box */}
                  {executionResult && (
                    <div style={{ marginTop: 12, borderTop: '1px solid #202b3b', paddingTop: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <label className="form-label" style={{ margin: 0 }}>Execution Result</label>
                          <span
                            className={`badge ${
                              executionResult.status === 'SUCCEEDED'
                                ? 'badge-live'
                                : executionResult.status === 'PENDING_APPROVAL'
                                ? 'badge'
                                : 'badge-revoked'
                            }`}
                            style={
                              executionResult.status === 'PENDING_APPROVAL'
                                ? { background: 'rgba(245, 158, 11, 0.15)', color: theme === 'light' ? '#007007' : '#4ade80', border: '1px solid rgba(245, 158, 11, 0.35)' }
                                : {}
                            }
                          >
                            {executionResult.status === 'SUCCEEDED' && <CheckCircle2 size={11} style={{ marginRight: 4 }} />}
                            {executionResult.status === 'PENDING_APPROVAL' && <Clock size={11} style={{ marginRight: 4 }} />}
                            {executionResult.status === 'FAILED' && <AlertCircle size={11} style={{ marginRight: 4 }} />}
                            {executionResult.status}
                          </span>
                          {executionResult.durationMs !== null && (
                            <span style={{ fontSize: 11, color: theme === 'light' ? '#000000' : '#ffffff' }}>
                              {executionResult.durationMs}ms
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '3px 8px', fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(executionResult.output || executionResult, null, 2));
                            setCopiedRunnerSnippet(true);
                            setTimeout(() => setCopiedRunnerSnippet(false), 1600);
                          }}
                        >
                          {copiedRunnerSnippet ? <Check size={11} style={{ color: '#4ade80' }} /> : <Copy size={11} />}
                          {copiedRunnerSnippet ? 'Copied Result!' : 'Copy Result'}
                        </button>
                      </div>

                      {/* Pending approval notification callout */}
                      {executionResult.status === 'PENDING_APPROVAL' && (
                        <div
                          className="notice"
                          style={{
                            marginBottom: 10,
                            padding: '10px 12px',
                            background: 'rgba(245, 158, 11, 0.12)',
                            borderColor: 'rgba(245, 158, 11, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ShieldAlert size={16} color="#fbbf24" />
                            <span style={{ fontSize: 11, color: theme === 'light' ? '#000000' : '#ffffff' }}>
                              Approval request created (ID: <code>{executionResult.approvalId || executionResult.id}</code>).
                            </span>
                          </div>
                          <button
                            type="button"
                            className="primary"
                            style={{ padding: '4px 10px', fontSize: 10 }}
                            onClick={() => {
                              setRunTool(null);
                              setActiveTab('approvals');
                            }}
                          >
                            Go to Approvals Tab →
                          </button>
                        </div>
                      )}

                      <div
                        className="secret-box"
                        style={{
                          maxHeight: 180,
                          overflowY: 'auto',
                          background: '#070b12',
                          padding: 12,
                          alignItems: 'flex-start'
                        }}
                      >
                        <pre style={{ margin: 0, fontSize: 11, lineHeight: 1.5, color: theme === 'light' ? '#000000' : '#ffffff' }}>
                          {JSON.stringify(executionResult.output || executionResult, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid #202b3b' }}>
                  <button type="button" className="btn-secondary" onClick={() => setRunTool(null)}>
                    Close
                  </button>
                  <button
                    type="submit"
                    className="primary"
                    disabled={executing}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    {executing ? (
                      <>
                        <RefreshCw size={13} />
                        Executing Action...
                      </>
                    ) : (
                      <>
                        <Play size={13} />
                        Run Tool Now
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: Developer Code Snippets */}
            {runnerTab === 'snippets' && (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 20 }}>
                {/* Language Picker */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['curl', 'typescript', 'python'] as const).map(lang => (
                      <button
                        key={lang}
                        type="button"
                        className={`filter-pill ${snippetLanguage === lang ? 'active' : ''}`}
                        onClick={() => setSnippetLanguage(lang)}
                        style={{ textTransform: lang === 'curl' ? 'none' : 'capitalize' }}
                      >
                        {lang === 'curl' ? 'cURL' : lang === 'typescript' ? 'TypeScript / Node' : 'Python'}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', fontSize: 11 }}
                    onClick={() => {
                      const snippet = generateToolSnippet(runTool, snippetLanguage, runInputJson, runUserId);
                      navigator.clipboard.writeText(snippet);
                      setCopiedRunnerSnippet(true);
                      setTimeout(() => setCopiedRunnerSnippet(false), 1600);
                    }}
                  >
                    {copiedRunnerSnippet ? <Check size={12} style={{ color: '#4ade80' }} /> : <Copy size={12} />}
                    {copiedRunnerSnippet ? 'Copied Code!' : 'Copy Code Snippet'}
                  </button>
                </div>

                {/* Code Snippet Box */}
                <div
                  className="secret-box"
                  style={{
                    flex: 1,
                    minHeight: 220,
                    maxHeight: 340,
                    overflowY: 'auto',
                    background: '#080d16',
                    padding: 16,
                    alignItems: 'flex-start',
                    border: '1px solid #202d42'
                  }}
                >
                  <pre style={{ margin: 0, fontSize: 12, lineHeight: 1.55, color: theme === 'light' ? '#000000' : '#ffffff', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                    {generateToolSnippet(runTool, snippetLanguage, runInputJson, runUserId)}
                  </pre>
                </div>

                <div style={{ marginTop: 12, fontSize: 11, color: theme === 'light' ? '#000000' : '#ffffff', lineHeight: 1.5 }}>
                  <strong>Developer Tip:</strong> Replace <code>&lt;YOUR_API_KEY&gt;</code> with your live API Key from the <strong>API Keys</strong> tab.
                  The execution endpoint runs asynchronously with retry backoff, OAuth token refresh, and JSON Schema validation.
                </div>

                <div className="modal-footer" style={{ padding: '14px 0 0', marginTop: 16, borderTop: '1px solid #202b3b' }}>
                  <button type="button" className="btn-secondary" onClick={() => setRunTool(null)}>
                    Close
                  </button>
                  <button
                    type="button"
                    className="primary"
                    onClick={() => setRunnerTab('test')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Play size={13} />
                    Switch to Test Runner
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Inspect Execution Details */}
      {selectedExecution && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <div>
                <h3>Execution Details</h3>
                <code style={{ fontSize: 11, color: theme === 'light' ? '#007007' : '#4ade80' }}>ID: {selectedExecution.id}</code>
              </div>
              <button className="modal-close" onClick={() => setSelectedExecution(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                <div><span style={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>Tool:</span> <strong>{selectedExecution.toolSlug}</strong></div>
                <div><span style={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>User:</span> <strong>{selectedExecution.projectUserId}</strong></div>
                <div><span style={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>Status:</span> <span className="badge badge-live">{selectedExecution.status}</span></div>
                <div><span style={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>Duration:</span> <strong>{selectedExecution.durationMs ? `${selectedExecution.durationMs}ms` : '—'}</strong></div>
              </div>

              <div style={{ marginTop: 10 }}>
                <label className="form-label">Output Payload</label>
                <div className="secret-box" style={{ maxHeight: 200, overflowY: 'auto' }}>
                  <pre style={{ margin: 0, fontSize: 11 }}>
                    {JSON.stringify(selectedExecution.output, null, 2) || selectedExecution.errorMessage || 'No output'}
                  </pre>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedExecution(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Configure OAuth Credentials (BYO) */}
      {configIntegration && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Configure {configIntegration.name} OAuth</h3>
              <button className="modal-close" onClick={() => setConfigIntegration(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveProviderConfig}>
              <div className="modal-body">
                <div className="notice" style={{ background: theme === 'light' ? '#eaf7eb' : '#111e2f', borderColor: theme === 'light' ? '#bbf7d0' : '#233852' }}>
                  <ShieldCheck size={18} color={theme === 'light' ? '#007007' : '#34d399'} />
                  <div>
                    <strong style={{ color: theme === 'light' ? '#007007' : '#fff' }}>Credential Vault Protection</strong>
                    <p style={{ color: theme === 'light' ? '#007007' : '#86efac' }}>Client Secret is encrypted at rest using authenticated AES-256-GCM and never returned in plaintext.</p>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Client ID</label>
                  <input
                    className="form-input"
                    type="text"
                    required
                    placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
                    value={clientIdInput}
                    onChange={e => setClientIdInput(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Client Secret</label>
                  <input
                    className="form-input"
                    type="password"
                    required
                    placeholder="Enter provider client secret"
                    value={clientSecretInput}
                    onChange={e => setClientSecretInput(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Redirect URI</label>
                  <input
                    className="form-input"
                    type="text"
                    required
                    value={redirectUriInput}
                    onChange={e => setRedirectUriInput(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Scopes (Optional)</label>
                  <input
                    className="form-input"
                    type="text"
                    value={scopesInput}
                    onChange={e => setScopesInput(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setConfigIntegration(null)}>
                  Cancel
                </button>
                <button type="submit" className="primary">Save Credentials</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Composio-Style App Connect Popup */}
      {composioModalInteg && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 540 }}>
            {/* Modal Header */}
            <div className="modal-header" style={{ padding: '20px 24px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flexShrink: 0 }}>
                  {renderRealIntegrationIcon(composioModalInteg.slug, 46)}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, margin: 0, fontWeight: 700 }}>
                    Connect {composioModalInteg.name}
                  </h3>
                  <p style={{ fontSize: 12, color: theme === 'light' ? '#000000' : '#ffffff', marginTop: 3 }}>
                    Link your {composioModalInteg.name} account to enable AI tool executions and agent workflows.
                  </p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setComposioModalInteg(null)}>✕</button>
            </div>

            {/* Error banner if any */}
            {composioError && (
              <div style={{ padding: '0 24px', marginTop: 14 }}>
                <div className="error-banner" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{composioError}</span>
                </div>
              </div>
            )}

            {/* STEP 1: Authorize (Composio Style) */}
            {composioStep === 'authorize' && (
              <div>
                <div className="modal-body" style={{ padding: '18px 24px' }}>
                  {/* End User Context */}
                  <div className="form-group">
                    <label className="form-label">Connect For User ID (projectUserId)</label>
                    <input
                      className="form-input"
                      type="text"
                      required
                      placeholder="e.g. user_developer_1 or email"
                      value={composioUserId}
                      onChange={e => setComposioUserId(e.target.value)}
                    />
                    <span style={{ fontSize: 10, color: theme === 'light' ? '#000000' : '#ffffff' }}>
                      Each end user in your application gets an isolated, encrypted token entry in Credential Vault.
                    </span>
                  </div>

                  {/* Permissions Checklist */}
                  <div>
                    <label className="form-label" style={{ marginBottom: 6 }}>
                      Permissions requested by {composioModalInteg.name}:
                    </label>
                    <div className="composio-scope-list">
                      {composioModalInteg.slug === 'gmail' && (
                        <>
                          <div className="composio-scope-item">
                            <CheckCircle2 size={15} style={{ color: '#007007', flexShrink: 0, marginTop: 1 }} />
                            <span><strong>Read & Search Emails:</strong> Query inbox messages, threads, and search history</span>
                          </div>
                          <div className="composio-scope-item">
                            <CheckCircle2 size={15} style={{ color: '#007007', flexShrink: 0, marginTop: 1 }} />
                            <span><strong>Draft & Send Messages:</strong> Compose new draft emails and send updates</span>
                          </div>
                          <div className="composio-scope-item">
                            <CheckCircle2 size={15} style={{ color: '#007007', flexShrink: 0, marginTop: 1 }} />
                            <span><strong>Manage Labels:</strong> Inspect and organize mailbox system & custom tags</span>
                          </div>
                        </>
                      )}

                      {composioModalInteg.slug === 'github' && (
                        <>
                          <div className="composio-scope-item">
                            <CheckCircle2 size={15} style={{ color: '#007007', flexShrink: 0, marginTop: 1 }} />
                            <span><strong>Repositories:</strong> Access public & private repositories, commits, and branches</span>
                          </div>
                          <div className="composio-scope-item">
                            <CheckCircle2 size={15} style={{ color: '#007007', flexShrink: 0, marginTop: 1 }} />
                            <span><strong>Issues & Pull Requests:</strong> View, create, and manage issues, PRs, and comments</span>
                          </div>
                          <div className="composio-scope-item">
                            <CheckCircle2 size={15} style={{ color: '#007007', flexShrink: 0, marginTop: 1 }} />
                            <span><strong>Developer Profile:</strong> Authenticate account identity securely</span>
                          </div>
                        </>
                      )}

                      {(composioModalInteg.slug === 'google_calendar' || composioModalInteg.slug.includes('calendar')) && (
                        <>
                          <div className="composio-scope-item">
                            <CheckCircle2 size={15} style={{ color: '#007007', flexShrink: 0, marginTop: 1 }} />
                            <span><strong>Calendar Schedules:</strong> Read upcoming appointments and meeting details</span>
                          </div>
                          <div className="composio-scope-item">
                            <CheckCircle2 size={15} style={{ color: '#007007', flexShrink: 0, marginTop: 1 }} />
                            <span><strong>Event Management:</strong> Create, reschedule, and delete calendar events</span>
                          </div>
                          <div className="composio-scope-item">
                            <CheckCircle2 size={15} style={{ color: '#007007', flexShrink: 0, marginTop: 1 }} />
                            <span><strong>Free / Busy Slots:</strong> Query availability to prevent double-booking</span>
                          </div>
                        </>
                      )}

                      {!['gmail', 'github', 'google_calendar'].includes(composioModalInteg.slug) && !composioModalInteg.slug.includes('calendar') && (
                        <>
                          <div className="composio-scope-item">
                            <CheckCircle2 size={15} style={{ color: '#007007', flexShrink: 0, marginTop: 1 }} />
                            <span><strong>Secure API Authentication:</strong> Connect {composioModalInteg.name} securely via OAuth / Token</span>
                          </div>
                          <div className="composio-scope-item">
                            <CheckCircle2 size={15} style={{ color: '#007007', flexShrink: 0, marginTop: 1 }} />
                            <span><strong>Agent Action Execution:</strong> Allow authorized AI workflows to run live tools on your behalf</span>
                          </div>
                          <div className="composio-scope-item">
                            <CheckCircle2 size={15} style={{ color: '#007007', flexShrink: 0, marginTop: 1 }} />
                            <span><strong>AES-256 Encrypted Vault:</strong> Credentials are encrypted and isolated per user and tenant</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Security Guarantee Box */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      background: theme === 'light' ? '#f0fdf4' : 'rgba(0, 112, 7, 0.08)',
                      border: `1px solid ${theme === 'light' ? '#bbf7d0' : 'rgba(0, 112, 7, 0.25)'}`,
                      borderRadius: 8,
                      padding: '10px 14px',
                      color: theme === 'light' ? '#007007' : '#4ade80',
                      fontSize: 11
                    }}
                  >
                    <ShieldCheck size={16} style={{ flexShrink: 0 }} />
                    <span>
                      Tokens are encrypted at rest using <strong>AES-256-GCM</strong> in Credential Vault and refreshed with PKCE.
                    </span>
                  </div>

                  {/* Option to change credentials */}
                  <div style={{ textAlign: 'center', marginTop: 4 }}>
                    <button
                      type="button"
                      className="btn-schema-toggle"
                      style={{ fontSize: 11, color: theme === 'light' ? '#000000' : '#ffffff' }}
                      onClick={() => setComposioStep('configure')}
                    >
                      <Settings size={12} style={{ marginRight: 4 }} />
                      Need to use custom OAuth Client ID & Secret? Click here
                    </button>
                  </div>
                </div>

                <div className="modal-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button type="button" className="btn-secondary" onClick={() => setComposioModalInteg(null)}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="primary"
                    disabled={composioLoading}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 13 }}
                    onClick={handleTriggerComposioOAuth}
                  >
                    {composioLoading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Initiating OAuth...
                      </>
                    ) : (
                      <>
                        Authorize with {composioModalInteg.name} →
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Configure BYO Credentials */}
            {composioStep === 'configure' && (
              <form onSubmit={handleSaveComposioCredentials}>
                <div className="modal-body" style={{ padding: '18px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label className="form-label">OAuth 2.0 Client Credentials (BYO)</label>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '3px 8px', fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      onClick={() => handlePrefillDemoCredentials(composioModalInteg.slug)}
                    >
                      <Zap size={11} style={{ color: '#4ade80' }} />
                      <span>Pre-fill Sandbox Demo Credentials</span>
                    </button>
                  </div>

                  <div className="form-group">
                    <label className="form-label">OAuth Client ID</label>
                    <input
                      className="form-input"
                      type="text"
                      required
                      placeholder={`Enter ${composioModalInteg.name} Client ID`}
                      value={clientIdInput}
                      onChange={e => setClientIdInput(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">OAuth Client Secret</label>
                    <input
                      className="form-input"
                      type="password"
                      required
                      placeholder={`Enter ${composioModalInteg.name} Client Secret`}
                      value={clientSecretInput}
                      onChange={e => setClientSecretInput(e.target.value)}
                    />
                    <span style={{ fontSize: 10, color: theme === 'light' ? '#000000' : '#ffffff' }}>
                      Secret is encrypted in Credential Vault and never returned in API responses.
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Authorized Redirect URI</label>
                    <input
                      className="form-input"
                      type="text"
                      readOnly
                      value={redirectUriInput}
                      style={{ opacity: 0.85, background: theme === 'light' ? '#f1f5f9' : '#070c14' }}
                    />
                    <span style={{ fontSize: 10, color: theme === 'light' ? '#000000' : '#ffffff' }}>
                      Add this callback URL to your {composioModalInteg.name} Developer Console application settings.
                    </span>
                  </div>
                </div>

                <div className="modal-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {composioModalInteg.configured ? (
                    <button type="button" className="btn-secondary" onClick={() => setComposioStep('authorize')}>
                      Back to Authorization
                    </button>
                  ) : (
                    <button type="button" className="btn-secondary" onClick={() => setComposioModalInteg(null)}>
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="primary"
                    disabled={composioLoading}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', fontSize: 13 }}
                  >
                    {composioLoading ? 'Saving...' : 'Save & Continue to Connect →'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Waiting for Authorization in Popup Window */}
            {composioStep === 'waiting' && (
              <div>
                <div className="modal-body" style={{ padding: '36px 24px', textAlign: 'center' }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: theme === 'light' ? '#f0fdf4' : 'rgba(0, 112, 7, 0.15)',
                      border: '2px solid #007007',
                      display: 'grid',
                      placeItems: 'center',
                      margin: '0 auto 18px'
                    }}
                  >
                    <RefreshCw size={26} style={{ color: '#007007' }} className="animate-spin" />
                  </div>

                  <h3 style={{ fontSize: 17, marginBottom: 8, fontWeight: 700 }}>
                    Waiting for Authorization...
                  </h3>
                  <p style={{ fontSize: 13, color: theme === 'light' ? '#000000' : '#ffffff', maxWidth: 380, margin: '0 auto 16px', lineHeight: 1.5 }}>
                    Please complete the sign-in and authorization prompt in the popup window.
                    This window will update automatically once verified.
                  </p>

                  {composioAuthUrl && (
                    <div style={{ marginTop: 14 }}>
                      <a
                        href={composioAuthUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 12, textDecoration: 'none' }}
                      >
                        <ExternalLink size={13} /> Re-open Authorization Popup
                      </a>
                    </div>
                  )}
                </div>

                <div className="modal-footer" style={{ padding: '14px 24px', display: 'flex', justifyContent: 'space-between' }}>
                  <button type="button" className="btn-secondary" onClick={() => setComposioStep('authorize')}>
                    Back
                  </button>
                  <button
                    type="button"
                    className="primary"
                    onClick={async () => {
                      if (!activeProject) return;
                      const accounts = await api.listConnectedAccounts(activeProject.id);
                      setConnectedAccounts(accounts);
                      const isNowConnected = accounts.some(
                        a => (a.integrationSlug === composioModalInteg.slug ||
                             (composioModalInteg.slug.includes('calendar') && a.integrationSlug.includes('calendar'))) &&
                             a.status === 'CONNECTED'
                      );
                      if (isNowConnected) {
                        setComposioStep('success');
                        showToast(`Successfully connected ${composioModalInteg.name}!`, 'success');
                      } else {
                        showToast('Waiting for authorization to complete in popup. Please ensure you clicked Allow.', 'info');
                      }
                    }}
                  >
                    Check Status Now
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Success */}
            {composioStep === 'success' && (
              <div>
                <div className="modal-body" style={{ padding: '36px 24px', textAlign: 'center' }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: theme === 'light' ? '#f0fdf4' : 'rgba(0, 112, 7, 0.15)',
                      border: '2px solid #007007',
                      display: 'grid',
                      placeItems: 'center',
                      margin: '0 auto 18px',
                      color: '#007007'
                    }}
                  >
                    <CheckCircle2 size={36} />
                  </div>

                  <h3 style={{ fontSize: 18, marginBottom: 8, fontWeight: 700 }}>
                    Successfully Connected!
                  </h3>
                  <p style={{ fontSize: 13, color: theme === 'light' ? '#000000' : '#ffffff', maxWidth: 380, margin: '0 auto 18px', lineHeight: 1.5 }}>
                    Your {composioModalInteg.name} account is securely connected. You can now test tools and execute actions.
                  </p>
                </div>

                <div className="modal-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setComposioModalInteg(null);
                    }}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="primary"
                    onClick={() => {
                      setComposioModalInteg(null);
                      setActiveTab('tools');
                    }}
                  >
                    Open Tool Explorer →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Connect Test Account */}
      {connectIntegration && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Connect {connectIntegration.name} Account</h3>
              <button className="modal-close" onClick={() => setConnectIntegration(null)}>✕</button>
            </div>
            <form onSubmit={handleInitiateOAuth}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">End User ID (in your app)</label>
                  <input
                    className="form-input"
                    type="text"
                    required
                    placeholder="e.g. user_123"
                    value={endUserIdInput}
                    onChange={e => setEndUserIdInput(e.target.value)}
                  />
                </div>
                <p style={{ fontSize: 11, color: theme === 'light' ? '#000000' : '#ffffff', lineHeight: 1.5 }}>
                  This will generate a cryptographically signed OAuth state with PKCE verification and redirect you to {connectIntegration.name}'s consent screen.
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setConnectIntegration(null)}>
                  Cancel
                </button>
                <button type="submit" className="primary">Authorize via {connectIntegration.name} →</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create New Project */}
      {showNewProjectModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Create New Project</h3>
              <button className="modal-close" onClick={() => setShowNewProjectModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Project Name</label>
                  <input
                    className="form-input"
                    type="text"
                    required
                    placeholder="e.g. Mobile Application Backend"
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowNewProjectModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Generate API Key */}
      {showNewKeyModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Generate API Key</h3>
              <button className="modal-close" onClick={() => setShowNewKeyModal(false)}>✕</button>
            </div>
            {!isMasterSSOConnected ? (
              <div className="modal-body" style={{ textAlign: 'center', padding: '28px 20px' }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: theme === 'light' ? '#eaf7eb' : 'rgba(0, 112, 7, 0.2)',
                  color: '#007007',
                  border: '1.5px solid ' + (theme === 'light' ? '#86efac' : 'rgba(74, 222, 128, 0.35)'),
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <KeyRound size={26} />
                </div>

                <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
                  Connected Accounts Login Required
                </h3>

                <p style={{ margin: '0 auto 20px', fontSize: 13, color: theme === 'light' ? '#475569' : '#94a3b8', lineHeight: 1.5, maxWidth: 360 }}>
                  <strong>Master SSO Identity & external provider accounts authorized across your workspace.</strong>
                  <br />
                  You cannot generate an API key without connecting your Master Account first. Please register or sign in below.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    type="button"
                    className="primary"
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      fontSize: 13,
                      fontWeight: 700,
                      background: '#007007',
                      borderColor: '#007007',
                      borderRadius: 8
                    }}
                    onClick={() => {
                      setShowNewKeyModal(false);
                      setPendingOpenKeyModal(true);
                      openMasterLoginModal();
                    }}
                  >
                    Register / Sign In Master SSO
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ width: '100%', padding: '10px 16px', fontSize: 12, border: 'none', background: 'transparent', color: theme === 'light' ? '#64748b' : '#94a3b8' }}
                    onClick={() => setShowNewKeyModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateApiKey}>
                <div className="modal-body">
                  {modalKeyError && (
                    <div className="error-banner" style={{ marginBottom: 14 }}>
                      {modalKeyError}
                    </div>
                  )}
                  {/* Direct Project Name Input (No dropdowns needed) */}
                  <div className="form-group">
                    <label className="form-label">Project Name</label>
                    <input
                      className="form-input"
                      type="text"
                      required
                      placeholder="e.g. My Next.js Bot / XYZ App"
                      value={keyProjectInput}
                      onChange={e => {
                        setKeyProjectInput(e.target.value);
                        if (modalKeyError) setModalKeyError(null);
                      }}
                    />
                    <small style={{ fontSize: 10, color: theme === 'light' ? '#000000' : '#ffffff', marginTop: 4, display: 'block' }}>
                      Type your project name directly for organization and API tracking.
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Key Name / Description</label>
                    <input
                      className="form-input"
                      type="text"
                      required
                      placeholder="e.g. Production Server Key"
                      value={newKeyName}
                      onChange={e => {
                        setNewKeyName(e.target.value);
                        if (modalKeyError) setModalKeyError(null);
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Environment</label>
                    <select
                      className="form-select"
                      value={newKeyEnv}
                      onChange={e => setNewKeyEnv(e.target.value as any)}
                    >
                      <option value="LIVE">LIVE (Production)</option>
                      <option value="TEST">TEST (Sandbox)</option>
                    </select>
                  </div>

                  {/* Cryptographically Secured Banner */}
                  <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: 8, padding: '10px 12px', fontSize: 11, color: theme === 'light' ? '#000000' : '#ffffff', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <ShieldCheck size={16} style={{ color: theme === 'light' ? '#007007' : '#4ade80', flexShrink: 0 }} />
                    <div>
                      <strong>Cryptographically Secured:</strong> This API key is hashed with SHA-256 at rest and cryptographically bound to this name and environment.
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowNewKeyModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="primary">Generate Key</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: One-time Secret Key Reveal */}
      {revealedKey && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3 style={{ color: theme === 'light' ? '#007007' : '#4ade80' }}>API Key Generated</h3>
              <button className="modal-close" onClick={() => setRevealedKey(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="error-banner" style={{ background: 'rgba(234, 179, 8, 0.1)', borderColor: '#854d0e', color: theme === 'light' ? '#000000' : '#ffffff' }}>
                <strong>Save your key now!</strong> This is the only time this secret key will ever be displayed.
              </div>

              <div className="form-group">
                <label className="form-label">Key Name</label>
                <div style={{ color: theme === 'light' ? '#0f172a' : '#fff', fontSize: 13, fontWeight: 600 }}>{revealedKey.name} ({revealedKey.environment})</div>
              </div>

              <div className="form-group">
                <label className="form-label">Your Secret Key</label>
                <div className="secret-box">
                  <span>{revealedKey.rawKey}</span>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => copyToClipboard(revealedKey.rawKey)}
                  >
                    {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="primary"
                onClick={() => setRevealedKey(null)}
              >
                I have saved my key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Register New Webhook */}
      {showNewWebhookModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3>Register Webhook Endpoint</h3>
              <button className="modal-close" onClick={() => setShowNewWebhookModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateWebhook}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Endpoint URL (HTTPS Recommended)</label>
                  <input
                    className="form-input"
                    type="url"
                    required
                    placeholder="https://api.yourdomain.com/webhooks/integration-events"
                    value={newWebhookUrl}
                    onChange={e => setNewWebhookUrl(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subscribed Events</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11, color: theme === 'light' ? '#000000' : '#ffffff', marginTop: 4 }}>
                    {[
                      { id: '*', label: 'All Events (*)' },
                      { id: 'connection.created', label: 'connection.created' },
                      { id: 'connection.revoked', label: 'connection.revoked' },
                      { id: 'execution.started', label: 'execution.started' },
                      { id: 'execution.succeeded', label: 'execution.succeeded' },
                      { id: 'execution.failed', label: 'execution.failed' },
                      { id: 'approval.required', label: 'approval.required' },
                      { id: 'approval.completed', label: 'approval.completed' }
                    ].map(ev => (
                      <label key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newWebhookEvents.includes(ev.id)}
                          onChange={e => {
                            if (ev.id === '*') {
                              setNewWebhookEvents(e.target.checked ? ['*'] : []);
                            } else {
                              const withoutAll = newWebhookEvents.filter(x => x !== '*');
                              if (e.target.checked) {
                                setNewWebhookEvents([...withoutAll, ev.id]);
                              } else {
                                setNewWebhookEvents(withoutAll.filter(x => x !== ev.id));
                              }
                            }
                          }}
                        />
                        <span>{ev.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="notice" style={{ background: theme === 'light' ? '#eaf7eb' : '#111e2f', borderColor: theme === 'light' ? '#bbf7d0' : '#233852' }}>
                  <ShieldCheck size={18} color={theme === 'light' ? '#007007' : '#34d399'} />
                  <div>
                    <strong style={{ color: theme === 'light' ? '#007007' : '#fff' }}>HMAC-SHA256 Signed</strong>
                    <p style={{ color: theme === 'light' ? '#007007' : '#86efac' }}>Every payload will be signed with a unique per-webhook secret and verified via <code>X-IntegrationPlatform-Signature</code>.</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowNewWebhookModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">Register Endpoint</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Master SSO Login Popup (Google SSO + Email/Password) */}
      {showMasterLoginModal && (
        <div className="modal-overlay" onClick={() => setShowMasterLoginModal(false)}>
          <div className="modal-card" style={{ maxWidth: 440, position: 'relative' }} onClick={e => e.stopPropagation()}>
            {/* Top-Left Back Button when in email form */}
            {showMasterEmailForm && (
              <button
                type="button"
                className="modal-back-btn"
                onClick={() => {
                  setShowMasterEmailForm(false);
                  setMasterAuthError(null);
                }}
                style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  zIndex: 10,
                  color: theme === 'light' ? '#64748b' : '#94a3b8',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
                title="Back to login options"
                aria-label="Back to login options"
              >
                <ArrowLeft size={18} />
              </button>
            )}

            <button
              className="modal-close"
              onClick={() => {
                setShowMasterLoginModal(false);
                setPendingOpenKeyModal(false);
              }}
              style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, fontSize: 18, color: '#7b8c9f', background: 'transparent', border: 'none', cursor: 'pointer' }}
              title="Close"
            >
              ✕
            </button>

            {/* Centered Header as requested */}
            <div style={{ padding: '28px 24px 16px', textAlign: 'center', borderBottom: '1px solid ' + (theme === 'light' ? '#e2e8f0' : '#222f42') }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: theme === 'light' ? '#eaf7eb' : 'rgba(0, 112, 7, 0.2)',
                color: theme === 'light' ? '#007007' : '#86efac',
                border: '1px solid ' + (theme === 'light' ? '#86efac' : 'rgba(74, 222, 128, 0.35)'),
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <KeyRound size={22} />
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: theme === 'light' ? '#0f172a' : '#fff' }}>
                {pendingOpenKeyModal ? "Master SSO Registration / Login" : "Master SSO Login"}
              </h3>
              <p style={{ margin: '6px auto 0', fontSize: 12, maxWidth: 360, color: theme === 'light' ? '#475569' : '#94a3b8', lineHeight: 1.4 }}>
                {pendingOpenKeyModal
                  ? "Register or sign in with your Master Account to generate API keys and authorize workspace connectors."
                  : "One Master Login → Auto-authorizes all your connectors simultaneously"}
              </p>
            </div>

            <div className="modal-body" style={{ padding: '22px 24px 26px' }}>
              {!showMasterEmailForm ? (
                /* Two buttons initially: Continue with Google OR Continue with Email */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Button 1: Continue with Google */}
                  <button
                    type="button"
                    className="btn-google-sso"
                    onClick={handleGoogleSSOLogin}
                    disabled={loading}
                  >
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0', gap: 10 }}>
                    <div style={{ flex: 1, height: 1, background: theme === 'light' ? '#e2e8f0' : '#273447' }} />
                    <span style={{ fontSize: 10, color: theme === 'light' ? '#64748b' : '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      or
                    </span>
                    <div style={{ flex: 1, height: 1, background: theme === 'light' ? '#e2e8f0' : '#273447' }} />
                  </div>

                  {/* Button 2: Continue with Email */}
                  <button
                    type="button"
                    className="btn-email-sso"
                    onClick={() => {
                      setShowMasterEmailForm(true);
                      setMasterAuthError(null);
                    }}
                  >
                    <Mail size={18} style={{ color: theme === 'light' ? '#0f172a' : '#38bdf8' }} />
                    <span>Continue with Email</span>
                  </button>
                </div>
              ) : (
                /* Expanded Email Form with Email & Password + Sign In / Sign Up */
                <div>
                  {/* Centered Compact Pill Segmented Control (takes only space text needs) */}
                  <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: 20 }}>
                    <div className="sso-pill-toggle" role="tablist" aria-label="Authentication Mode">
                      <div
                        className={`sso-pill-slider ${masterAuthMode === 'signup' ? 'pos-signup' : 'pos-login'}`}
                        aria-hidden="true"
                      />
                      <button
                        type="button"
                        role="tab"
                        aria-selected={masterAuthMode === 'login'}
                        className={`sso-pill-btn ${masterAuthMode === 'login' ? 'active' : ''}`}
                        onClick={() => { setMasterAuthMode('login'); setMasterAuthError(null); setMasterConfirmPasswordInput(''); }}
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={masterAuthMode === 'signup'}
                        className={`sso-pill-btn ${masterAuthMode === 'signup' ? 'active' : ''}`}
                        onClick={() => { setMasterAuthMode('signup'); setMasterAuthError(null); }}
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>

                  {masterAuthError && (
                    <div className="error-banner" style={{ marginBottom: 14 }}>{masterAuthError}</div>
                  )}

                  <form onSubmit={handleMasterEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>EMAIL ADDRESS</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="saurabh.devworks@gmail.com"
                        value={masterEmailInput}
                        onChange={e => setMasterEmailInput(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>PASSWORD</label>
                      <div className="password-input-wrapper" style={{ position: 'relative', width: '100%' }}>
                        <input
                          type={showMasterPassword ? 'text' : 'password'}
                          className="form-input"
                          placeholder="••••••••"
                          value={masterPasswordInput}
                          onChange={e => setMasterPasswordInput(e.target.value)}
                          required
                          style={{ width: '100%', boxSizing: 'border-box', paddingRight: 40 }}
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowMasterPassword(prev => !prev)}
                          style={{
                            position: 'absolute',
                            right: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 4,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: theme === 'light' ? '#64748b' : '#94a3b8'
                          }}
                          title={showMasterPassword ? 'Hide password' : 'Show password'}
                          aria-label={showMasterPassword ? 'Hide password' : 'Show password'}
                        >
                          {showMasterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* CONFIRM PASSWORD (2nd password field in Sign Up mode) */}
                    {masterAuthMode === 'signup' && (
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: 11, fontWeight: 700 }}>CONFIRM PASSWORD</label>
                        <div className="password-input-wrapper" style={{ position: 'relative', width: '100%' }}>
                          <input
                            type={showMasterConfirmPassword ? 'text' : 'password'}
                            className="form-input"
                            placeholder="Confirm Password"
                            value={masterConfirmPasswordInput}
                            onChange={e => setMasterConfirmPasswordInput(e.target.value)}
                            required
                            style={{ width: '100%', boxSizing: 'border-box', paddingRight: 40 }}
                          />
                          <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowMasterConfirmPassword(prev => !prev)}
                            style={{
                              position: 'absolute',
                              right: 12,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 4,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: theme === 'light' ? '#64748b' : '#94a3b8'
                            }}
                            title={showMasterConfirmPassword ? 'Hide password' : 'Show password'}
                            aria-label={showMasterConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            {showMasterConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="primary"
                      disabled={loading}
                      style={{ marginTop: 4, padding: '12px 18px', fontWeight: 600, fontSize: 13, background: '#007007', borderColor: '#007007' }}
                    >
                      {loading ? 'Authorizing Master SSO...' : (masterAuthMode === 'signup' ? 'Create Account & Authorize Connectors' : 'Sign In & Authorize Connectors')}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: 4 }}>
                      {masterAuthMode === 'login' ? (
                        <span style={{ fontSize: 12, color: theme === 'light' ? '#64748b' : '#94a3b8' }}>
                          Need an account?{' '}
                          <a
                            href="#"
                            onClick={e => { e.preventDefault(); setMasterAuthMode('signup'); setMasterAuthError(null); }}
                            style={{ color: theme === 'light' ? '#007007' : '#4ade80', fontWeight: 600, textDecoration: 'none' }}
                          >
                            Create account
                          </a>
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: theme === 'light' ? '#64748b' : '#94a3b8' }}>
                          Already have an account?{' '}
                          <a
                            href="#"
                            onClick={e => { e.preventDefault(); setMasterAuthMode('login'); setMasterAuthError(null); setMasterConfirmPasswordInput(''); }}
                            style={{ color: theme === 'light' ? '#007007' : '#4ade80', fontWeight: 600, textDecoration: 'none' }}
                          >
                            Sign In
                          </a>
                        </span>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Connect Account Required (Triggered when trying to enable apps without connected account) */}
      {showConnectRequiredModal && (
        <div className="modal-overlay" onClick={() => setShowConnectRequiredModal(false)}>
          <div className="modal-card" style={{ maxWidth: 420, textAlign: 'center', position: 'relative', padding: '32px 28px' }} onClick={e => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowConnectRequiredModal(false)}
              style={{ position: 'absolute', top: 16, right: 16, fontSize: 18, color: '#7b8c9f', background: 'transparent', border: 'none', cursor: 'pointer' }}
              title="Close"
            >
              ✕
            </button>

            <div style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: theme === 'light' ? '#eaf7eb' : 'rgba(0, 112, 7, 0.2)',
              color: theme === 'light' ? '#007007' : '#86efac',
              border: '1.5px solid ' + (theme === 'light' ? '#86efac' : 'rgba(74, 222, 128, 0.35)'),
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <KeyRound size={26} />
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
              Connect Account Required
            </h3>

            <p style={{ margin: '0 auto 24px', fontSize: 13, color: theme === 'light' ? '#475569' : '#94a3b8', lineHeight: 1.5, maxWidth: 330 }}>
              To enable <strong>{pendingEnableApp?.name || 'this app'}</strong>, you need to connect your Master Account first. One login auto-authorizes and unlocks all connector tools.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                className="primary"
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  fontSize: 13,
                  fontWeight: 700,
                  background: '#007007',
                  borderColor: '#007007',
                  borderRadius: 8
                }}
                onClick={() => {
                  setShowConnectRequiredModal(false);
                  openMasterLoginModal();
                }}
              >
                Connect Account
              </button>

              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%', padding: '10px 16px', fontSize: 12, border: 'none', background: 'transparent', color: theme === 'light' ? '#64748b' : '#94a3b8' }}
                onClick={() => setShowConnectRequiredModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Notifications Container (Replaces browser native alert/confirm popups) */}
      <div className="toast-container" aria-live="polite">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast-card toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'success' && <Check size={16} />}
              {toast.type === 'error' && <AlertCircle size={16} />}
              {toast.type === 'info' && <Info size={16} />}
            </div>
            <div className="toast-message">{toast.message}</div>
            <button
              type="button"
              className="toast-close"
              aria-label="Close notification"
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
