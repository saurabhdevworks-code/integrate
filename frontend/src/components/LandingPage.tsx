import React, { useState } from 'react';
import {
  Sparkles,
  Terminal,
  ArrowRight,
  ShieldCheck,
  Check,
  Copy,
  Lock,
  Cpu,
  Zap,
  Boxes,
  Layers,
  Bot,
  Workflow,
  ExternalLink,
  KeyRound,
  Users,
  CheckCircle2,
  AlertTriangle,
  Play,
  Sun,
  Moon,
  RefreshCw,
  FileCode2,
  Code2,
  SlidersHorizontal,
  ChevronRight,
  Database,
  Radio,
  FileJson,
  Search,
  Activity,
  CheckCheck,
  Globe,
  Sliders,
  Server,
  FolderGit2,
  Send,
  Calendar,
  MessageSquare,
  FileSpreadsheet
} from 'lucide-react';
import { Integration } from '../api/client';

interface LandingPageProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  integrations: Integration[];
}

export function LandingPage({ theme, toggleTheme, onOpenAuth, integrations }: LandingPageProps) {
  const isDark = theme === 'dark';

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'typescript' | 'python' | 'mcp' | 'curl'>('typescript');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Interactive Live Pipeline Simulator
  const [activeScenarioIdx, setActiveScenarioIdx] = useState<number>(0);
  const [simStep, setSimStep] = useState<number>(3);
  const [simApproved, setSimApproved] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Active Flow Architecture Inspector Tab
  const [inspectLayer, setInspectLayer] = useState<'gateway' | 'vault' | 'gates' | 'dispatcher'>('vault');

  const scenarios = [
    {
      id: 0,
      title: 'Slack + GitHub Standup',
      category: 'COMMUNICATION',
      icon: MessageSquare,
      agentPrompt: 'Fetch todays merged pull requests from GitHub, summarize changes, and post to #engineering on Slack.',
      targetTool: 'slack.post_message',
      risk: 'HIGH',
      requiresApproval: true,
      parameters: {
        channel: '#engineering',
        text: 'Production Standup: 4 PRs merged across backend, vault & MCP engines.'
      },
      response: {
        ok: true,
        channel: 'C0489AB7',
        message_id: '1730708942.001900',
        dispatched_at: '2026-11-04T12:00:00Z',
        status: 'DELIVERED'
      }
    },
    {
      id: 1,
      title: 'Google Calendar + Gmail Sync',
      category: 'PRODUCTIVITY',
      icon: Calendar,
      agentPrompt: 'Find unread architecture review meeting requests in Gmail and schedule 30m slot on Google Calendar.',
      targetTool: 'google_calendar.create_event',
      risk: 'MEDIUM',
      requiresApproval: false,
      parameters: {
        summary: 'Architecture Review with AI Engineering Lead',
        start: '2026-11-04T15:00:00Z',
        durationMinutes: 30
      },
      response: {
        id: 'evt_99824f',
        htmlLink: 'https://calendar.google.com/event?eid=99824f',
        status: 'CONFIRMED'
      }
    },
    {
      id: 2,
      title: 'Canva Design + Google Drive Archive',
      category: 'STORAGE',
      icon: FolderGit2,
      agentPrompt: 'Export newly approved social campaign asset from Canva and archive automatically in Google Drive.',
      targetTool: 'google_drive.upload_file',
      risk: 'LOW',
      requiresApproval: false,
      parameters: {
        folderId: 'folder_marketing_assets_q4',
        filename: 'q4_launch_banner.png',
        mimeType: 'image/png'
      },
      response: {
        fileId: '1dr_8xK29f0L',
        webViewLink: 'https://drive.google.com/file/d/1dr_8xK29f0L/view',
        status: 'SYNCED'
      }
    }
  ];

  function runSimulation(index: number) {
    setActiveScenarioIdx(index);
    setSimApproved(false);
    setIsSimulating(true);
    setSimStep(0);

    setTimeout(() => setSimStep(1), 350);
    setTimeout(() => setSimStep(2), 750);
    setTimeout(() => {
      setSimStep(3);
      setIsSimulating(false);
    }, 1200);
  }

  function handleApprove() {
    setSimApproved(true);
    setSimStep(4);
  }

  function handleCopy(text: string, type: 'code' | 'install') {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedInstall(true);
      setTimeout(() => setCopiedInstall(false), 2000);
    }
  }

  const categories = ['ALL', 'COMMUNICATION', 'DEVELOPER_TOOLS', 'PRODUCTIVITY', 'STORAGE', 'DESIGN'];

  const filteredIntegrations = (integrations && integrations.length > 0 ? integrations : []).filter(item => {
    const matchesCat = selectedCategory === 'ALL' || item.category?.toUpperCase() === selectedCategory;
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const codeSnippets = {
    typescript: `import { IntegrateClient } from '@integratelayer/sdk';

// Initialize with your workspace API Key
const client = new IntegrateClient({
  apiKey: process.env.INTEGRATE_API_KEY
});

// Execute any tool seamlessly through AES-256 Vault
const execution = await client.tools.execute({
  toolSlug: 'slack.post_message',
  accountId: 'acc_master_sso',
  parameters: {
    channel: '#deployments',
    text: 'Production release deployed to production via AI Agent'
  }
});

console.log('Execution ID:', execution.executionId);
console.log('Status:', execution.status);`,

    python: `from integratelayer import IntegrateClient
import os

# Initialize Python SDK
client = IntegrateClient(
    api_key=os.environ.get("INTEGRATE_API_KEY")
)

# Call GitHub or Gmail with zero credential leakage
response = client.tools.execute(
    tool_slug="github.create_issue",
    account_id="acc_master_sso",
    parameters={
        "owner": "saurabhdevworks",
        "repo": "integrate",
        "title": "Automated security patch audit"
    }
)

print("Result:", response.data)`,

    mcp: `{
  "mcpServers": {
    "integrate-layer": {
      "command": "npx",
      "args": ["-y", "@integratelayer/mcp-server"],
      "env": {
        "INTEGRATE_API_KEY": "pk_live_your_workspace_key",
        "INTEGRATE_API_URL": "https://api.integratelayer.com"
      }
    }
  }
}`,

    curl: `curl -X POST https://api.integratelayer.com/v1/tools/execute \\
  -H "Authorization: Bearer pk_live_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "toolSlug": "google_calendar.create_event",
    "parameters": {
      "summary": "AI Agent Architecture Sync",
      "start": "2026-11-04T16:00:00Z",
      "durationMinutes": 45
    }
  }'`
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark ? '#080d19' : '#f8fafc',
      color: isDark ? '#f1f5f9' : '#0f172a',
      fontFamily: "'Plus Jakarta Sans', 'Google Sans', -apple-system, sans-serif",
      position: 'relative',
      backgroundImage: isDark
        ? 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)'
        : 'radial-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px)',
      backgroundSize: '28px 28px',
      overflowX: 'hidden'
    }}>
      {/* 1. Header Navigation Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        height: 68,
        background: isDark ? 'rgba(8, 13, 25, 0.88)' : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 36px',
        boxSizing: 'border-box'
      }}>
        {/* Brand Logo & Protocol Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img
            src={isDark ? './logo-white.png' : './logo-dark.png'}
            alt="integrate"
            style={{ height: 26, width: 'auto', objectFit: 'contain' }}
          />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            padding: '3px 9px',
            borderRadius: 9999,
            background: isDark ? 'rgba(74, 222, 128, 0.12)' : 'rgba(0, 112, 7, 0.08)',
            color: isDark ? '#4ade80' : '#007007',
            border: isDark ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid rgba(0, 112, 7, 0.2)'
          }}>
            <Bot size={12} />
            <span>MCP Native</span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 13, fontWeight: 600 }}>
          <a href="#pipeline" style={{ color: isDark ? '#94a3b8' : '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>
            Pipeline
          </a>
          <a href="#simulator" style={{ color: isDark ? '#94a3b8' : '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>
            Live Simulator
          </a>
          <a href="#connectors" style={{ color: isDark ? '#94a3b8' : '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>
            30+ Connectors
          </a>
          <a href="#architecture" style={{ color: isDark ? '#94a3b8' : '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>
            Security Core
          </a>
          <a href="#sdk" style={{ color: isDark ? '#94a3b8' : '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>
            Developer SDK
          </a>
        </nav>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={toggleTheme}
            className="btn-theme-toggle"
            title={isDark ? 'Switch to White Theme' : 'Switch to Dark Theme'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              padding: 0,
              borderRadius: '50%',
              border: isDark ? '1px solid #27364b' : '1px solid #cbd5e1',
              background: isDark ? '#121c2c' : '#ffffff',
              color: isDark ? '#ffffff' : '#000000',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {isDark ? <Sun size={16} style={{ color: '#4ade80' }} /> : <Moon size={16} style={{ color: '#007007' }} />}
          </button>

          <button
            type="button"
            onClick={() => onOpenAuth('login')}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 600,
              background: 'transparent',
              color: isDark ? '#e2e8f0' : '#1e293b',
              border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => onOpenAuth('signup')}
            style={{
              padding: '9px 18px',
              fontSize: 13,
              fontWeight: 700,
              background: '#007007',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(0, 112, 7, 0.35)',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Launch Console</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section style={{
        position: 'relative',
        padding: '88px 24px 64px',
        maxWidth: 1200,
        margin: '0 auto',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}>
        {/* Glow ambient background elements */}
        <div style={{
          position: 'absolute',
          top: -20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 740,
          height: 380,
          background: isDark
            ? 'radial-gradient(circle, rgba(0, 112, 7, 0.28) 0%, rgba(14, 165, 233, 0.12) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(0, 112, 7, 0.12) 0%, rgba(14, 165, 233, 0.08) 50%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        {/* Top Protocol Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 14px',
          borderRadius: 9999,
          background: isDark ? 'rgba(15, 23, 42, 0.85)' : '#ffffff',
          border: isDark ? '1px solid rgba(74, 222, 128, 0.35)' : '1px solid #bbf7d0',
          boxShadow: isDark ? '0 0 24px rgba(0, 112, 7, 0.2)' : '0 2px 8px rgba(0, 112, 7, 0.08)',
          fontSize: 12,
          fontWeight: 600,
          color: isDark ? '#86efac' : '#007007',
          marginBottom: 24,
          position: 'relative',
          zIndex: 1
        }}>
          <Zap size={14} style={{ color: isDark ? '#4ade80' : '#007007' }} />
          <span>Universal Integration Layer for AI Agents, LLMs & Cursor</span>
          <ChevronRight size={13} />
        </div>

        {/* Main Headline */}
        <h1 style={{
          fontSize: 'clamp(42px, 6.5vw, 70px)',
          fontWeight: 800,
          lineHeight: 1.08,
          letterSpacing: '-2px',
          margin: '0 auto 24px',
          maxWidth: 960,
          position: 'relative',
          zIndex: 1
        }}>
          Connect once.{' '}
          <span style={{
            background: isDark
              ? 'linear-gradient(135deg, #4ade80 0%, #38bdf8 50%, #818cf8 100%)'
              : 'linear-gradient(135deg, #007007 0%, #0284c7 60%, #4338ca 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            Empower every AI agent.
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(16px, 2vw, 19px)',
          color: isDark ? '#94a3b8' : '#475569',
          maxWidth: 720,
          margin: '0 auto 36px',
          lineHeight: 1.6,
          fontWeight: 400,
          position: 'relative',
          zIndex: 1
        }}>
          The production-grade execution bridge connecting LLMs, AI agents, and workflows to <strong>30+ SaaS apps</strong>.
          Zero raw tokens exposed, built-in human approval gates, and instant <strong>Model Context Protocol (MCP)</strong> support.
        </p>

        {/* Actions Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 48,
          position: 'relative',
          zIndex: 1
        }}>
          <button
            type="button"
            onClick={() => onOpenAuth('signup')}
            style={{
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 700,
              background: '#007007',
              color: '#ffffff',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 10px 25px -4px rgba(0, 112, 7, 0.45)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span>Launch Developer Console</span>
            <ArrowRight size={17} />
          </button>

          <a
            href="#pipeline"
            style={{
              padding: '14px 24px',
              fontSize: 14,
              fontWeight: 600,
              background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
              color: isDark ? '#ffffff' : '#0f172a',
              border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
              borderRadius: 10,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease'
            }}
          >
            <Activity size={16} style={{ color: isDark ? '#4ade80' : '#007007' }} />
            <span>Interactive Flow Visualizer</span>
          </a>

          {/* Quick npm install copy pill */}
          <div
            onClick={() => handleCopy('npm i @integratelayer/sdk', 'install')}
            title="Click to copy npm command"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 18px',
              background: isDark ? '#0f172a' : '#f1f5f9',
              border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
              borderRadius: 10,
              fontSize: 13,
              fontFamily: 'monospace',
              color: isDark ? '#38bdf8' : '#0369a1',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <Terminal size={14} style={{ color: isDark ? '#94a3b8' : '#64748b' }} />
            <span>npm i @integratelayer/sdk</span>
            {copiedInstall ? <Check size={14} style={{ color: '#4ade80' }} /> : <Copy size={14} style={{ color: isDark ? '#64748b' : '#94a3b8' }} />}
          </div>
        </div>

        {/* Live Metrics Ribbon */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 16,
          maxWidth: 1000,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          {[
            { label: 'Built-in SaaS Connectors', value: '30+', icon: Boxes },
            { label: 'Execution Engine Latency', value: '< 45ms', icon: Zap },
            { label: 'Credential Encryption', value: 'AES-256-GCM', icon: Lock },
            { label: 'Model Context Protocol', value: '100% MCP Native', icon: Bot }
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                style={{
                  padding: '16px 20px',
                  borderRadius: 12,
                  background: isDark ? 'rgba(15, 23, 42, 0.65)' : '#ffffff',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                  boxShadow: isDark ? 'none' : '0 2px 6px rgba(0, 0, 0, 0.04)',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: isDark ? 'rgba(74, 222, 128, 0.1)' : 'rgba(0, 112, 7, 0.08)',
                  display: 'grid',
                  placeItems: 'center',
                  color: isDark ? '#4ade80' : '#007007',
                  flexShrink: 0
                }}>
                  <Icon size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b', fontWeight: 500 }}>{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Interactive Visual Architecture Pipeline (No Emojis, Pure Tech Visuals) */}
      <section id="pipeline" style={{
        padding: '70px 24px',
        maxWidth: 1140,
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            fontWeight: 700,
            color: isDark ? '#4ade80' : '#007007',
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            marginBottom: 8
          }}>
            <Workflow size={14} />
            <span>Real-Time Execution Architecture</span>
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', margin: '0 0 12px' }}>
            How Every Action Travels Securely
          </h2>
          <p style={{ fontSize: 15, color: isDark ? '#94a3b8' : '#64748b', maxWidth: 660, margin: '0 auto' }}>
            Click any node below to inspect how the gateway, credential vault, human approval gates, and provider dispatchers collaborate in under 45ms.
          </p>
        </div>

        {/* Node Architecture Flow Ribbon */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          marginBottom: 24
        }}>
          {[
            {
              id: 'gateway',
              step: '01',
              title: 'API Gateway',
              subtitle: 'Schema validation & rate limits',
              icon: Server,
              color: '#38bdf8'
            },
            {
              id: 'vault',
              step: '02',
              title: 'AES-256 Vault',
              subtitle: 'Hardware envelope decryption',
              icon: Lock,
              color: '#fbbf24'
            },
            {
              id: 'gates',
              step: '03',
              title: 'Approval Gate',
              subtitle: 'Human-in-the-loop protection',
              icon: ShieldCheck,
              color: '#f87171'
            },
            {
              id: 'dispatcher',
              step: '04',
              title: 'Provider Bridge',
              subtitle: '30+ SaaS API dispatch',
              icon: CheckCircle2,
              color: '#4ade80'
            }
          ].map(node => {
            const Icon = node.icon;
            const isSelected = inspectLayer === node.id;
            return (
              <div
                key={node.id}
                onClick={() => setInspectLayer(node.id as any)}
                style={{
                  padding: '18px 20px',
                  borderRadius: 14,
                  background: isSelected
                    ? (isDark ? 'rgba(30, 41, 59, 0.9)' : '#ffffff')
                    : (isDark ? '#0f172a' : '#f8fafc'),
                  border: isSelected
                    ? `2px solid ${node.color}`
                    : (isDark ? '1px solid #1e293b' : '1px solid #e2e8f0'),
                  boxShadow: isSelected ? `0 8px 24px -4px ${node.color}33` : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: `${node.color}18`,
                    color: node.color,
                    display: 'grid',
                    placeItems: 'center'
                  }}>
                    <Icon size={18} />
                  </div>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: isDark ? '#64748b' : '#94a3b8' }}>
                    STEP {node.step}
                  </span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{node.title}</div>
                <div style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b' }}>{node.subtitle}</div>
              </div>
            );
          })}
        </div>

        {/* Selected Layer Inspector Panel */}
        <div style={{
          padding: '24px 28px',
          borderRadius: 16,
          background: isDark ? '#0d1424' : '#ffffff',
          border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
          boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
          alignItems: 'center'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              color: isDark ? '#4ade80' : '#007007',
              marginBottom: 8
            }}>
              <CheckCheck size={14} />
              <span>Inspection Node Active</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 10px' }}>
              {inspectLayer === 'gateway' && 'Input Validation & Rate Control Gateway'}
              {inspectLayer === 'vault' && 'AES-256-GCM Envelope Token Vault'}
              {inspectLayer === 'gates' && 'Human-in-the-Loop Safety Approvals'}
              {inspectLayer === 'dispatcher' && 'Resilient 30+ Provider Webhook Dispatcher'}
            </h3>
            <p style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.6, margin: 0 }}>
              {inspectLayer === 'gateway' && 'Validates incoming JSON payloads against strict OpenAPI specs before execution. Blocks schema injections and enforces sliding-window quotas without touching database locks.'}
              {inspectLayer === 'vault' && 'Master keys stored in HSM/KMS decrypt user access tokens strictly in volatile memory. Tokens are automatically rotated via OAuth 2.0 refresh loops and never logged to disk.'}
              {inspectLayer === 'gates' && 'Actions tagged with medium or high blast radiuses pause execution and notify designated team reviewers via webhooks, Slack alerts, or console UI before write operations dispatch.'}
              {inspectLayer === 'dispatcher' && 'Dispatches payloads across Google, Slack, GitHub, Canva, and Microsoft APIs with exponential backoff retries, SHA-256 webhook signatures, and detailed audit trails.'}
            </p>
          </div>

          <div style={{
            background: isDark ? '#060a12' : '#f1f5f9',
            border: isDark ? '1px solid #1e293b' : '1px solid #cbd5e1',
            borderRadius: 12,
            padding: '16px 20px',
            fontFamily: 'monospace',
            fontSize: 12,
            color: isDark ? '#38bdf8' : '#0369a1',
            lineHeight: 1.6
          }}>
            <div style={{ color: isDark ? '#64748b' : '#64748b', marginBottom: 6 }}>// Operational Telemetry</div>
            {inspectLayer === 'gateway' && (
              <>
                <div>&gt; Schema Validation: PASSED (OpenAPI 3.1)</div>
                <div>&gt; Sliding Rate Limiter: 1/100 RPM Used</div>
                <div>&gt; Cross-Tenant Isolation: VALIDATED</div>
              </>
            )}
            {inspectLayer === 'vault' && (
              <>
                <div>&gt; Algorithm: AES-256-GCM (Cipher: Galois Counter Mode)</div>
                <div>&gt; Master Key: Envelope KMS Verified</div>
                <div>&gt; Plaintext Exfiltration Risk: ZERO_TOLERANCE</div>
              </>
            )}
            {inspectLayer === 'gates' && (
              <>
                <div>&gt; Risk Evaluator: SENSITIVE_WRITE_ACTION</div>
                <div>&gt; Gate Status: PENDING_HUMAN_CONFIRMATION</div>
                <div>&gt; Dispatch Blocked: TRUE (Awaiting signature)</div>
              </>
            )}
            {inspectLayer === 'dispatcher' && (
              <>
                <div>&gt; Destination: api.slack.com/v1/chat.postMessage</div>
                <div>&gt; Latency: 38ms (HTTP 200 OK)</div>
                <div>&gt; Audit Record: WRITTEN (SHA-256 Verified)</div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 4. Interactive Live Terminal & MCP Simulator (NO EMOJIS) */}
      <section id="simulator" style={{
        padding: '70px 24px',
        maxWidth: 1140,
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            fontWeight: 700,
            color: isDark ? '#4ade80' : '#007007',
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            marginBottom: 8
          }}>
            <Terminal size={14} />
            <span>Interactive Simulator</span>
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', margin: '0 0 12px' }}>
            Test the 15-Step Execution Engine Live
          </h2>
          <p style={{ fontSize: 15, color: isDark ? '#94a3b8' : '#64748b', maxWidth: 640, margin: '0 auto' }}>
            Choose an agent workflow scenario to watch validation, vault token decryption, human approval gates, and live execution.
          </p>
        </div>

        {/* Scenario Pills with SVG Icons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 24
        }}>
          {scenarios.map((scen, idx) => {
            const ScenIcon = scen.icon;
            const isSelected = activeScenarioIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => runSimulation(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 9999,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSelected
                    ? (isDark ? '1px solid #4ade80' : '1px solid #007007')
                    : (isDark ? '1px solid #1e293b' : '1px solid #cbd5e1'),
                  background: isSelected
                    ? (isDark ? 'rgba(74, 222, 128, 0.15)' : 'rgba(0, 112, 7, 0.1)')
                    : (isDark ? '#111827' : '#ffffff'),
                  color: isSelected
                    ? (isDark ? '#86efac' : '#007007')
                    : (isDark ? '#94a3b8' : '#64748b'),
                  transition: 'all 0.15s ease'
                }}
              >
                <ScenIcon size={15} />
                <span>{scen.title}</span>
              </button>
            );
          })}
        </div>

        {/* Terminal Window */}
        <div style={{
          borderRadius: 16,
          background: '#070b14',
          border: '1px solid #1a2436',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.65)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            height: 42,
            background: '#0c121e',
            borderBottom: '1px solid #162032',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748b', marginLeft: 8 }}>
                integrate-engine.mcp
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#4ade80', fontFamily: 'monospace' }}>
              <Radio size={12} className="animate-pulse" />
              <span>LIVE REPLAY</span>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '24px 28px', fontFamily: 'Consolas, Monaco, monospace', fontSize: 13, lineHeight: 1.7, color: '#e2e8f0' }}>
            {/* Step 1: Agent Input */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                color: '#38bdf8',
                fontWeight: 700,
                flexShrink: 0
              }}>
                <Bot size={15} />
                <span>[AI_AGENT]</span>
              </div>
              <div style={{ color: '#f8fafc' }}>
                &gt;&gt; "{scenarios[activeScenarioIdx].agentPrompt}"
              </div>
            </div>

            {/* Step 2: Tool Resolution & Schema Validation */}
            {simStep >= 1 && (
              <div style={{ marginBottom: 12, color: '#94a3b8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a855f7', fontWeight: 700 }}>
                  <Cpu size={14} />
                  <span>[ENGINE]</span> Resolved Tool Call: <strong style={{ color: '#fff' }}>{scenarios[activeScenarioIdx].targetTool}</strong>
                </div>
                <div style={{ paddingLeft: 22, color: '#4ade80', fontSize: 12, marginTop: 4 }}>
                  <div>[OK] Steps 01-05: Input schema conformant to OpenAPI 3.1 specification</div>
                  <div>[OK] Steps 06-08: Sliding window rate limits verified (0/100 RPM used)</div>
                </div>
              </div>
            )}

            {/* Step 3: AES-256 Vault */}
            {simStep >= 2 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#fbbf24', fontWeight: 700 }}>
                  <Lock size={14} />
                  <span>[VAULT]</span>
                </div>
                <span style={{ color: '#e2e8f0' }}>
                  Decrypted OAuth token via hardware envelope key{' '}
                  <span style={{ color: '#64748b' }}>(AES-256-GCM / IV: 9a8c... SHA-256 Verified)</span>
                </span>
              </div>
            )}

            {/* Step 4: Approval Gate or Auto Dispatch */}
            {simStep >= 3 && (
              <div style={{
                marginTop: 14,
                padding: '14px 18px',
                borderRadius: 10,
                background: scenarios[activeScenarioIdx].requiresApproval && !simApproved
                  ? 'rgba(234, 179, 8, 0.08)'
                  : 'rgba(16, 185, 129, 0.08)',
                border: scenarios[activeScenarioIdx].requiresApproval && !simApproved
                  ? '1px solid rgba(234, 179, 8, 0.3)'
                  : '1px solid rgba(16, 185, 129, 0.25)'
              }}>
                {scenarios[activeScenarioIdx].requiresApproval && !simApproved ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fbbf24', fontWeight: 700 }}>
                        <AlertTriangle size={16} />
                        <span>HUMAN APPROVAL GATE REQUIRED (Risk Level: {scenarios[activeScenarioIdx].risk})</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                        Sensitive write action paused until confirmed by workspace administrator.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleApprove}
                      style={{
                        padding: '8px 18px',
                        background: '#007007',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 4px 12px rgba(0, 112, 7, 0.4)'
                      }}
                    >
                      <Check size={14} />
                      <span>Approve &amp; Dispatch Tool</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4ade80', fontWeight: 700, marginBottom: 8 }}>
                      <CheckCircle2 size={16} />
                      <span>EXECUTION DISPATCHED &amp; COMPLETED (HTTP 200 OK)</span>
                    </div>
                    <pre style={{ margin: 0, fontSize: 12, color: '#94a3b8', overflowX: 'auto' }}>
                      {JSON.stringify(scenarios[activeScenarioIdx].response, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. 30+ Connectors Interactive Catalog (NO EMOJIS) */}
      <section id="connectors" style={{
        padding: '70px 24px',
        maxWidth: 1200,
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            fontWeight: 700,
            color: isDark ? '#4ade80' : '#007007',
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            marginBottom: 8
          }}>
            <Boxes size={14} />
            <span>Connectors Catalog</span>
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', margin: '0 0 12px' }}>
            30+ Production Connectors Ready to Empower Your Stack
          </h2>
          <p style={{ fontSize: 15, color: isDark ? '#94a3b8' : '#64748b', maxWidth: 640, margin: '0 auto 24px' }}>
            Connect with 1-click Master SSO. Zero developer consoles, custom OAuth redirect URIs, or manual token refresh cron jobs.
          </p>

          {/* Search Bar & Category Filters */}
          <div style={{ maxWidth: 480, margin: '0 auto 20px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: isDark ? '#64748b' : '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search 30+ connectors (e.g. Slack, GitHub, Gmail, Canva)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px 12px 40px',
                borderRadius: 10,
                border: isDark ? '1px solid #1e293b' : '1px solid #cbd5e1',
                background: isDark ? '#0f172a' : '#ffffff',
                color: isDark ? '#ffffff' : '#0f172a',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            {categories.map((cat, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 9999,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: selectedCategory === cat
                    ? (isDark ? '1px solid #4ade80' : '1px solid #007007')
                    : (isDark ? '1px solid #1e293b' : '1px solid #cbd5e1'),
                  background: selectedCategory === cat
                    ? (isDark ? 'rgba(74, 222, 128, 0.15)' : 'rgba(0, 112, 7, 0.1)')
                    : 'transparent',
                  color: selectedCategory === cat
                    ? (isDark ? '#86efac' : '#007007')
                    : (isDark ? '#94a3b8' : '#64748b'),
                  transition: 'all 0.15s ease'
                }}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16
        }}>
          {filteredIntegrations.map((item, idx) => {
            const hasIcon = item.iconUrl && item.iconUrl.length > 0;
            return (
              <div
                key={idx}
                style={{
                  padding: '20px',
                  borderRadius: 14,
                  background: isDark ? '#0f172a' : '#ffffff',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #e2e8f0',
                  boxShadow: isDark ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  transition: 'transform 0.15s, border-color 0.15s',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = isDark ? '#4ade80' : '#007007';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.07)' : '#e2e8f0';
                }}
                onClick={() => onOpenAuth('signup')}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: isDark ? '#1e293b' : '#f1f5f9',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  overflow: 'hidden'
                }}>
                  {hasIcon && item.iconUrl ? (
                    <img src={item.iconUrl} alt={item.name} style={{ width: 26, height: 26, objectFit: 'contain' }} />
                  ) : (
                    <Boxes size={22} style={{ color: isDark ? '#4ade80' : '#007007' }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <strong style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </strong>
                    <span style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: isDark ? '#4ade80' : '#007007',
                      background: isDark ? 'rgba(74, 222, 128, 0.12)' : 'rgba(0, 112, 7, 0.08)',
                      padding: '2px 6px',
                      borderRadius: 4
                    }}>
                      READY
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: isDark ? '#64748b' : '#64748b', textTransform: 'capitalize' }}>
                    {item.category?.toLowerCase().replace('_', ' ') || 'Integration'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button
            type="button"
            onClick={() => onOpenAuth('signup')}
            style={{
              padding: '12px 24px',
              fontSize: 13,
              fontWeight: 700,
              background: isDark ? '#1e293b' : '#f1f5f9',
              color: isDark ? '#ffffff' : '#0f172a',
              border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span>Explore All 30+ Connectors in Console</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* 6. Bento Grid Security & Architecture (NO EMOJIS) */}
      <section id="architecture" style={{
        padding: '70px 24px',
        maxWidth: 1200,
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            fontWeight: 700,
            color: isDark ? '#4ade80' : '#007007',
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            marginBottom: 8
          }}>
            <ShieldCheck size={14} />
            <span>Enterprise Security</span>
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', margin: '0 0 12px' }}>
            Built for High-Stakes Production Environments
          </h2>
          <p style={{ fontSize: 15, color: isDark ? '#94a3b8' : '#64748b', maxWidth: 640, margin: '0 auto' }}>
            Zero credential leakage, tenant data isolation, and human-in-the-loop controls protect your infrastructure at scale.
          </p>
        </div>

        {/* Bento Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 20
        }}>
          {/* Card 1: MCP Server Bridge (8 cols) */}
          <div style={{
            gridColumn: 'span 8',
            padding: '32px',
            borderRadius: 18,
            background: isDark ? '#0f172a' : '#ffffff',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
            boxShadow: isDark ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                display: 'grid',
                placeItems: 'center',
                marginBottom: 18
              }}>
                <Bot size={24} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>
                Model Context Protocol (MCP) Bridge
              </h3>
              <p style={{ fontSize: 14, color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.6, margin: 0 }}>
                Instant compatibility with Cursor, Claude Desktop, Antigravity, and AutoGen. Expose your 30+ connected tools via standardized stdio or SSE endpoints with automatic schema generation.
              </p>
            </div>
            <div style={{
              marginTop: 24,
              padding: '14px 18px',
              borderRadius: 10,
              background: isDark ? '#080d19' : '#f8fafc',
              border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
              fontFamily: 'monospace',
              fontSize: 12,
              color: isDark ? '#38bdf8' : '#0284c7'
            }}>
              npx @integratelayer/mcp-server --sse-port 8080
            </div>
          </div>

          {/* Card 2: AES-256 Vault (4 cols) */}
          <div style={{
            gridColumn: 'span 4',
            padding: '32px',
            borderRadius: 18,
            background: isDark ? '#0f172a' : '#ffffff',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
            boxShadow: isDark ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(234, 179, 8, 0.12)',
              color: '#fbbf24',
              display: 'grid',
              placeItems: 'center',
              marginBottom: 18
            }}>
              <Lock size={24} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>
              AES-256-GCM Vault
            </h3>
            <p style={{ fontSize: 14, color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.6, margin: 0 }}>
              Zero-knowledge envelope encryption. Raw OAuth tokens and refresh tokens are encrypted at rest with hardware keys and never returned to the browser or AI agent prompt.
            </p>
          </div>

          {/* Card 3: Human Approval Gates (4 cols) */}
          <div style={{
            gridColumn: 'span 4',
            padding: '32px',
            borderRadius: 18,
            background: isDark ? '#0f172a' : '#ffffff',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
            boxShadow: isDark ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#f87171',
              display: 'grid',
              placeItems: 'center',
              marginBottom: 18
            }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>
              Human Approval Gates
            </h3>
            <p style={{ fontSize: 14, color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.6, margin: 0 }}>
              Prevent rogue AI agent behavior. Sensitive actions (like repository deletion, transactions, or mass emails) automatically trigger approval gates awaiting 1-click admin sign-off.
            </p>
          </div>

          {/* Card 4: 15-Step Execution Pipeline (8 cols) */}
          <div style={{
            gridColumn: 'span 8',
            padding: '32px',
            borderRadius: 18,
            background: isDark ? '#0f172a' : '#ffffff',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
            boxShadow: isDark ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(74, 222, 128, 0.12)',
              color: '#4ade80',
              display: 'grid',
              placeItems: 'center',
              marginBottom: 18
            }}>
              <Workflow size={24} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>
              15-Step Hardened Execution Pipeline
            </h3>
            <p style={{ fontSize: 14, color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.6, margin: '0 0 16px' }}>
              Every API call runs through automated input schema validation, quota checking, sliding window rate limiters, token rotation, signature verification, and immutable audit logging.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['Schema Validation', 'Sliding Rate Limiter', 'Token Auto-Refresh', 'Audit Trail', 'Webhook Dispatcher'].map((tag, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: isDark ? '#1e293b' : '#f1f5f9',
                    color: isDark ? '#94a3b8' : '#475569'
                  }}
                >
                  <Check size={12} style={{ color: '#4ade80' }} />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Multi-Language Developer SDK */}
      <section id="sdk" style={{
        padding: '70px 24px',
        maxWidth: 1000,
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            fontWeight: 700,
            color: isDark ? '#4ade80' : '#007007',
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            marginBottom: 8
          }}>
            <Code2 size={14} />
            <span>Developer-First SDK</span>
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', margin: '0 0 12px' }}>
            Call Any Tool in 3 Lines of Code
          </h2>
          <p style={{ fontSize: 15, color: isDark ? '#94a3b8' : '#64748b', maxWidth: 600, margin: '0 auto' }}>
            Copy and paste production-ready snippets in your language of choice.
          </p>
        </div>

        {/* Code Box */}
        <div style={{
          borderRadius: 16,
          background: '#070b14',
          border: '1px solid #1a2436',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden'
        }}>
          {/* Tabs bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#0c121e',
            borderBottom: '1px solid #162032',
            padding: '0 16px'
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['typescript', 'python', 'mcp', 'curl'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveCodeTab(tab)}
                  style={{
                    padding: '12px 16px',
                    fontSize: 12,
                    fontWeight: 700,
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeCodeTab === tab ? '2px solid #4ade80' : '2px solid transparent',
                    color: activeCodeTab === tab ? '#4ade80' : '#64748b',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {tab === 'mcp' ? 'mcp.json' : tab}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleCopy(codeSnippets[activeCodeTab], 'code')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                background: '#162032',
                border: '1px solid #27364b',
                color: '#e2e8f0',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {copiedCode ? <Check size={13} style={{ color: '#4ade80' }} /> : <Copy size={13} />}
              <span>{copiedCode ? 'Copied!' : 'Copy Snippet'}</span>
            </button>
          </div>

          {/* Snippet block */}
          <pre style={{
            margin: 0,
            padding: '24px 28px',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: 13,
            lineHeight: 1.65,
            color: '#e2e8f0',
            overflowX: 'auto'
          }}>
            <code>{codeSnippets[activeCodeTab]}</code>
          </pre>
        </div>
      </section>

      {/* 8. Bottom CTA Banner */}
      <section style={{
        padding: '80px 24px',
        maxWidth: 1000,
        margin: '0 auto',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}>
        <div style={{
          padding: '60px 40px',
          borderRadius: 24,
          background: isDark
            ? 'linear-gradient(135deg, rgba(0, 112, 7, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(0, 112, 7, 0.1) 0%, rgba(240, 253, 244, 0.95) 100%)',
          border: isDark ? '1px solid rgba(74, 222, 128, 0.35)' : '1px solid #86efac',
          boxShadow: isDark ? '0 20px 50px rgba(0, 112, 7, 0.2)' : '0 10px 30px rgba(0, 112, 7, 0.08)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-1px' }}>
            Ready to Connect Your AI Agents to the Real World?
          </h2>
          <p style={{ fontSize: 16, color: isDark ? '#cbd5e1' : '#475569', maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Set up your workspace in under 2 minutes. Instant 30+ connectors, zero payment info required, and ready for production.
          </p>
          <button
            type="button"
            onClick={() => onOpenAuth('signup')}
            style={{
              padding: '16px 36px',
              fontSize: 16,
              fontWeight: 700,
              background: '#007007',
              color: '#ffffff',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 10px 25px -4px rgba(0, 112, 7, 0.5)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span>Open Developer Console</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* 9. Minimalist Clean Footer */}
      <footer style={{
        borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
        padding: '36px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        fontSize: 12,
        color: isDark ? '#64748b' : '#64748b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src={isDark ? './logo-white.png' : './logo-dark.png'}
            alt="integrate"
            style={{ height: 20, width: 'auto', objectFit: 'contain' }}
          />
          <span>&copy; {new Date().getFullYear()} integrate. All rights reserved.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontWeight: 600 }}>
          <a href="#pipeline" style={{ color: 'inherit', textDecoration: 'none' }}>Pipeline</a>
          <a href="#simulator" style={{ color: 'inherit', textDecoration: 'none' }}>Simulator</a>
          <a href="#connectors" style={{ color: 'inherit', textDecoration: 'none' }}>Connectors</a>
          <a href="#architecture" style={{ color: 'inherit', textDecoration: 'none' }}>Security</a>
          <button
            type="button"
            onClick={() => onOpenAuth('login')}
            style={{ background: 'none', border: 'none', color: '#007007', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}
          >
            Developer Login →
          </button>
        </div>
      </footer>
    </div>
  );
}
