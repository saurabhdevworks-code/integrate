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
  FileJson
} from 'lucide-react';
import { Integration } from '../api/client';

interface LandingPageProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onOpenAuth: () => void;
  integrations: Integration[];
}

export function LandingPage({ theme, toggleTheme, onOpenAuth, integrations }: LandingPageProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'typescript' | 'python' | 'mcp' | 'curl'>('typescript');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Interactive Simulator State
  const [activeScenario, setActiveScenario] = useState<number>(0);
  const [simStep, setSimStep] = useState<number>(3); // 0 to 4
  const [simApproved, setSimApproved] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const scenarios = [
    {
      id: 0,
      title: 'GitHub + Slack Standup',
      agentPrompt: 'Fetch todays merged PRs from GitHub, generate a standup summary, and post to #engineering on Slack.',
      targetTool: 'slack.post_message',
      risk: 'HIGH',
      requiresApproval: true,
      params: { channel: '#engineering', text: 'Daily Standup Summary: 4 PRs merged across backend & frontend.' },
      response: { ok: true, channel: 'C0489AB7', message_id: '1730708942.001900', status: 'DISPATCHED' }
    },
    {
      id: 1,
      title: 'Google Calendar + Gmail Sync',
      agentPrompt: 'Find unread meeting requests in Gmail and schedule 30m architecture review on Google Calendar.',
      targetTool: 'calendar.create_event',
      risk: 'MEDIUM',
      requiresApproval: false,
      params: { summary: 'Architecture Review with AI Lead', start: '2026-11-04T15:00:00Z', durationMinutes: 30 },
      response: { id: 'evt_99824f', htmlLink: 'https://calendar.google.com/event?eid=99824f', status: 'CONFIRMED' }
    },
    {
      id: 2,
      title: 'Canva Design + Google Drive Export',
      agentPrompt: 'Create marketing social banner on Canva and automatically archive asset in team Google Drive.',
      targetTool: 'google_drive.upload_file',
      risk: 'LOW',
      requiresApproval: false,
      params: { folderId: 'folder_marketing_assets', filename: 'q4_launch_banner.png', sizeKb: 2048 },
      response: { fileId: '1dr_8xK29f0L', webViewLink: 'https://drive.google.com/file/d/1dr_8xK29f0L/view', status: 'UPLOADED' }
    }
  ];

  function runSimulation(index: number) {
    setActiveScenario(index);
    setSimApproved(false);
    setIsSimulating(true);
    setSimStep(0);

    setTimeout(() => setSimStep(1), 400);
    setTimeout(() => setSimStep(2), 900);
    setTimeout(() => {
      setSimStep(3);
      setIsSimulating(false);
    }, 1500);
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

  // Categories for filter
  const categories = ['ALL', 'COMMUNICATION', 'DEVELOPER_TOOLS', 'PRODUCTIVITY', 'STORAGE', 'DESIGN'];

  const filteredIntegrations = (integrations && integrations.length > 0 ? integrations : []).filter(item => {
    if (selectedCategory === 'ALL') return true;
    return item.category?.toUpperCase() === selectedCategory;
  }).slice(0, 12);

  const codeSnippets = {
    typescript: `import { IntegrateClient } from '@integratelayer/sdk';

// Initialize with your workspace API Key
const integrate = new IntegrateClient({
  apiKey: process.env.INTEGRATE_API_KEY
});

// Execute any tool seamlessly through AES-256 Vault
const result = await integrate.tools.execute({
  toolSlug: 'slack.post_message',
  accountId: 'acc_master_sso',
  parameters: {
    channel: '#deployments',
    text: '🚀 v2.4 Release deployed to production via AI Agent'
  }
});

console.log('Execution ID:', result.executionId);
console.log('Status:', result.status);`,

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
      "summary": "AI Agent Sync",
      "start": "2026-11-04T16:00:00Z",
      "durationMinutes": 45
    }
  }'`
  };

  const isDark = theme === 'dark';

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark ? '#0a0f1d' : '#f8fafc',
      color: isDark ? '#ffffff' : '#0f172a',
      fontFamily: "'Plus Jakarta Sans', 'Google Sans', -apple-system, sans-serif",
      overflowX: 'hidden'
    }}>
      {/* 1. Glassmorphism Top Navigation Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        height: 70,
        background: isDark ? 'rgba(10, 15, 29, 0.85)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        boxSizing: 'border-box'
      }}>
        {/* Brand Logo & Version Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img
            src={isDark ? './logo-white.png' : './logo-dark.png'}
            alt="integrate"
            style={{ height: 28, width: 'auto', objectFit: 'contain' }}
          />
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            padding: '3px 8px',
            borderRadius: 9999,
            background: isDark ? 'rgba(74, 222, 128, 0.12)' : 'rgba(0, 112, 7, 0.08)',
            color: isDark ? '#4ade80' : '#007007',
            border: isDark ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid rgba(0, 112, 7, 0.2)'
          }}>
            MCP Native
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 13, fontWeight: 600 }}>
          <a href="#simulator" style={{ color: isDark ? '#94a3b8' : '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>
            Live Simulator
          </a>
          <a href="#connectors" style={{ color: isDark ? '#94a3b8' : '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>
            30+ Connectors
          </a>
          <a href="#architecture" style={{ color: isDark ? '#94a3b8' : '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>
            Security & Architecture
          </a>
          <a href="#sdk" style={{ color: isDark ? '#94a3b8' : '#475569', textDecoration: 'none', transition: 'color 0.15s' }}>
            Code SDK
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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
            onClick={onOpenAuth}
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
            onClick={onOpenAuth}
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

      {/* 2. Hero Section with Glow Atmosphere */}
      <section style={{
        position: 'relative',
        padding: '90px 24px 60px',
        maxWidth: 1200,
        margin: '0 auto',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}>
        {/* Glow ambient radial backgrounds */}
        <div style={{
          position: 'absolute',
          top: -40,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 700,
          height: 380,
          background: isDark
            ? 'radial-gradient(circle, rgba(0, 112, 7, 0.28) 0%, rgba(14, 165, 233, 0.12) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(0, 112, 7, 0.12) 0%, rgba(14, 165, 233, 0.08) 50%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        {/* Announcement Capsule */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 14px',
          borderRadius: 9999,
          background: isDark ? 'rgba(15, 23, 42, 0.8)' : '#ffffff',
          border: isDark ? '1px solid rgba(74, 222, 128, 0.35)' : '1px solid #bbf7d0',
          boxShadow: isDark ? '0 0 20px rgba(0, 112, 7, 0.2)' : '0 2px 8px rgba(0, 112, 7, 0.08)',
          fontSize: 12,
          fontWeight: 600,
          color: isDark ? '#86efac' : '#007007',
          marginBottom: 24,
          position: 'relative',
          zIndex: 1
        }}>
          <Sparkles size={14} style={{ color: isDark ? '#4ade80' : '#007007' }} />
          <span>Universal Integration Layer for AI Agents, LLMs & Cursor</span>
          <ChevronRight size={13} />
        </div>

        {/* Main Catchy Headline */}
        <h1 style={{
          fontSize: 'clamp(40px, 6vw, 68px)',
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

        {/* Primary Action Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 44,
          position: 'relative',
          zIndex: 1
        }}>
          <button
            type="button"
            onClick={onOpenAuth}
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
            href="#simulator"
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
            <Play size={15} style={{ color: isDark ? '#4ade80' : '#007007' }} />
            <span>Interactive Simulator</span>
          </a>

          {/* Quick npm install pill */}
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

        {/* Live Metrics Proof Ribbon */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          maxWidth: 960,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          {[
            { label: 'Built-in SaaS Connectors', value: '30+', icon: Boxes },
            { label: 'Execution Engine Latency', value: '< 45ms', icon: Zap },
            { label: 'Credential Encryption', value: 'AES-256-GCM', icon: Lock },
            { label: 'Model Context Protocol', value: '100% MCP', icon: Bot }
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                style={{
                  padding: '16px 20px',
                  borderRadius: 12,
                  background: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0',
                  boxShadow: isDark ? 'none' : '0 2px 6px rgba(0, 0, 0, 0.04)',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14
                }}
              >
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: isDark ? 'rgba(74, 222, 128, 0.1)' : 'rgba(0, 112, 7, 0.08)',
                  display: 'grid',
                  placeItems: 'center',
                  color: isDark ? '#4ade80' : '#007007',
                  flexShrink: 0
                }}>
                  <Icon size={19} />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: isDark ? '#64748b' : '#64748b', fontWeight: 500 }}>{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. The Showstopper: Interactive AI Agent Live Terminal & MCP Simulator */}
      <section id="simulator" style={{
        padding: '80px 24px',
        maxWidth: 1100,
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: isDark ? '#4ade80' : '#007007',
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            marginBottom: 8
          }}>
            Interactive Playground
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', margin: '0 0 12px' }}>
            Experience the 15-Step Execution Engine in Action
          </h2>
          <p style={{ fontSize: 15, color: isDark ? '#94a3b8' : '#64748b', maxWidth: 640, margin: '0 auto' }}>
            Choose an agent scenario below and watch how integrate validates schemas, decrypts vault tokens, enforces human approval gates, and dispatches actions in real time.
          </p>
        </div>

        {/* Scenario Selector Pills */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 24
        }}>
          {scenarios.map((scen, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => runSimulation(idx)}
              style={{
                padding: '10px 18px',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                border: activeScenario === idx
                  ? (isDark ? '1px solid #4ade80' : '1px solid #007007')
                  : (isDark ? '1px solid #1e293b' : '1px solid #cbd5e1'),
                background: activeScenario === idx
                  ? (isDark ? 'rgba(74, 222, 128, 0.15)' : 'rgba(0, 112, 7, 0.1)')
                  : (isDark ? '#111827' : '#ffffff'),
                color: activeScenario === idx
                  ? (isDark ? '#86efac' : '#007007')
                  : (isDark ? '#94a3b8' : '#64748b'),
                transition: 'all 0.15s ease'
              }}
            >
              {scen.title}
            </button>
          ))}
        </div>

        {/* Terminal Window Mockup */}
        <div style={{
          borderRadius: 16,
          background: '#090d16',
          border: '1px solid #1e293b',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden'
        }}>
          {/* Terminal Window Header */}
          <div style={{
            height: 42,
            background: '#0d1320',
            borderBottom: '1px solid #1a2333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748b', marginLeft: 8 }}>
                integrate-execution-engine.mcp
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#4ade80', fontFamily: 'monospace' }}>
              <Radio size={12} className="animate-pulse" />
              <span>LIVE REPLAY</span>
            </div>
          </div>

          {/* Terminal Content Body */}
          <div style={{ padding: '24px 28px', fontFamily: 'Consolas, Monaco, monospace', fontSize: 13, lineHeight: 1.7, color: '#e2e8f0' }}>
            {/* Step 1: Agent Input */}
            <div style={{ marginBottom: 14 }}>
              <span style={{ color: '#38bdf8' }}>🤖 [AI_AGENT]</span>{' '}
              <span style={{ color: '#94a3b8' }}>&gt;&gt;</span>{' '}
              <span style={{ color: '#f8fafc' }}>"{scenarios[activeScenario].agentPrompt}"</span>
            </div>

            {/* Step 2: Routing & Validation */}
            {simStep >= 1 && (
              <div style={{ marginBottom: 10, color: '#94a3b8' }}>
                <span style={{ color: '#a855f7' }}>⚡ [ENGINE]</span> Resolved Tool Call: <strong style={{ color: '#fff' }}>{scenarios[activeScenario].targetTool}</strong>
                <div style={{ paddingLeft: 20, color: '#4ade80', fontSize: 12 }}>
                  ✓ Step 01-05: JSON Schema validated against OpenAPI spec (Parameters conformant)<br />
                  ✓ Step 06-08: Sliding window rate limits verified (0/100 RPM used)
                </div>
              </div>
            )}

            {/* Step 3: AES-256 Vault */}
            {simStep >= 2 && (
              <div style={{ marginBottom: 10 }}>
                <span style={{ color: '#f59e0b' }}>🔒 [VAULT]</span> Decrypted OAuth token with envelope master key{' '}
                <span style={{ color: '#64748b' }}>(AES-256-GCM / IV: 9a8c... SHA-256 Verified)</span>
              </div>
            )}

            {/* Step 4: Approval Gate or Auto Dispatch */}
            {simStep >= 3 && (
              <div style={{
                marginTop: 14,
                padding: '14px 18px',
                borderRadius: 10,
                background: scenarios[activeScenario].requiresApproval && !simApproved
                  ? 'rgba(234, 179, 8, 0.08)'
                  : 'rgba(16, 185, 129, 0.08)',
                border: scenarios[activeScenario].requiresApproval && !simApproved
                  ? '1px solid rgba(234, 179, 8, 0.3)'
                  : '1px solid rgba(16, 185, 129, 0.25)'
              }}>
                {scenarios[activeScenario].requiresApproval && !simApproved ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fbbf24', fontWeight: 700 }}>
                        <AlertTriangle size={16} />
                        <span>HUMAN APPROVAL GATE REQUIRED (Risk Level: {scenarios[activeScenario].risk})</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                        Sensitive write action paused until confirmed by workspace admin.
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
                        gap: 6
                      }}
                    >
                      <Check size={14} />
                      <span>Approve & Dispatch Tool</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ color: '#4ade80', fontWeight: 700, marginBottom: 6 }}>
                      ✓ EXECUTION DISPATCHED &amp; COMPLETED (HTTP 200 OK)
                    </div>
                    <pre style={{ margin: 0, fontSize: 12, color: '#94a3b8', overflowX: 'auto' }}>
                      {JSON.stringify(scenarios[activeScenario].response, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Connected App Constellation (30+ Real Apps) */}
      <section id="connectors" style={{
        padding: '70px 24px',
        maxWidth: 1200,
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: isDark ? '#4ade80' : '#007007',
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            marginBottom: 8
          }}>
            Massive Pre-built Catalog
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', margin: '0 0 12px' }}>
            30+ Production Connectors Ready to Empower Your Stack
          </h2>
          <p style={{ fontSize: 15, color: isDark ? '#94a3b8' : '#64748b', maxWidth: 600, margin: '0 auto 24px' }}>
            Connect with 1-click Master SSO. No complicated developer consoles, custom OAuth redirect URIs, or token refresh cron jobs.
          </p>

          {/* Category Filter Pills */}
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

        {/* Connectors Grid */}
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
                onClick={onOpenAuth}
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

        {/* Explore All CTA */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button
            type="button"
            onClick={onOpenAuth}
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

      {/* 5. Bento Grid Architecture & Enterprise Security */}
      <section id="architecture" style={{
        padding: '80px 24px',
        maxWidth: 1200,
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: isDark ? '#4ade80' : '#007007',
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            marginBottom: 8
          }}>
            Engineered for Modern AI
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', margin: '0 0 12px' }}>
            Enterprise Security Built Into Every Layer
          </h2>
          <p style={{ fontSize: 15, color: isDark ? '#94a3b8' : '#64748b', maxWidth: 640, margin: '0 auto' }}>
            Built from day one to protect your credentials, isolate tenant environments, and give your engineering team full control over AI tool actions.
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
              background: isDark ? '#090d16' : '#f8fafc',
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
              Prevent rogue AI agent behavior. Sensitive actions (like repo deletion, payments, or mass emails) automatically trigger approval gates awaiting 1-click admin sign-off.
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
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: isDark ? '#1e293b' : '#f1f5f9',
                    color: isDark ? '#94a3b8' : '#475569'
                  }}
                >
                  ✓ {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Multi-Language SDK Code Tabs */}
      <section id="sdk" style={{
        padding: '80px 24px',
        maxWidth: 1000,
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: isDark ? '#4ade80' : '#007007',
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            marginBottom: 8
          }}>
            Developer-First SDK
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', margin: '0 0 12px' }}>
            Call Any Tool in 3 Lines of Code
          </h2>
          <p style={{ fontSize: 15, color: isDark ? '#94a3b8' : '#64748b', maxWidth: 600, margin: '0 auto' }}>
            Copy and paste production-ready snippets in your language of choice.
          </p>
        </div>

        {/* Code Box with Tabs */}
        <div style={{
          borderRadius: 16,
          background: '#090d16',
          border: '1px solid #1e293b',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden'
        }}>
          {/* Tabs bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#0d1320',
            borderBottom: '1px solid #1a2333',
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
                background: '#1a2333',
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

          {/* Snippet Code block */}
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

      {/* 7. Bottom Call-To-Action Banner */}
      <section style={{
        padding: '90px 24px',
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
            onClick={onOpenAuth}
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

      {/* 8. Minimalist Footer */}
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
          <a href="#simulator" style={{ color: 'inherit', textDecoration: 'none' }}>Simulator</a>
          <a href="#connectors" style={{ color: 'inherit', textDecoration: 'none' }}>Connectors</a>
          <a href="#architecture" style={{ color: 'inherit', textDecoration: 'none' }}>Security</a>
          <button
            type="button"
            onClick={onOpenAuth}
            style={{ background: 'none', border: 'none', color: '#007007', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}
          >
            Developer Login →
          </button>
        </div>
      </footer>
    </div>
  );
}
