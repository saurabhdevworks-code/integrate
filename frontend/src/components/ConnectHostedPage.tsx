import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock, ExternalLink, CheckCircle, AlertTriangle, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';

interface PublicSessionData {
  id: string;
  integrationSlug: string;
  projectUserId: string;
  connectUrl: string | null;
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED';
  returnUrl?: string | null;
  expiresAt: string;
}

export const ConnectHostedPage: React.FC = () => {
  const [session, setSession] = useState<PublicSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = new URLSearchParams(window.location.search);
  const sessionId = searchParams.get('session');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID specified. Pass ?session=<id> in the URL.');
      setLoading(false);
      return;
    }

    // Support demo/preview mode directly
    if (sessionId.startsWith('demo')) {
      setSession({
        id: sessionId,
        integrationSlug: 'gmail',
        projectUserId: 'user_dev_preview',
        connectUrl: '#demo-preview-authorized',
        status: 'PENDING',
        returnUrl: 'http://localhost:5173',
        expiresAt: new Date(Date.now() + 1800000).toISOString()
      });
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/v1/connect/sessions/${sessionId}/public`);
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error('Backend server is not reachable on port 8080. Please ensure Spring Boot is running.');
        }
        if (!res.ok) {
          throw new Error(res.status === 404 ? 'Connection session not found or invalid' : 'Failed to load connection session');
        }
        const data: PublicSessionData = await res.json();
        setSession(data);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  const getIntegrationDetails = (slug: string) => {
    switch (slug.toLowerCase()) {
      case 'gmail':
        return {
          name: 'Google Gmail',
          color: '#ea4335',
          scopes: ['Read and search emails', 'Draft and compose messages', 'Organize labels']
        };
      case 'github':
        return {
          name: 'GitHub',
          color: '#f0f6fc',
          scopes: ['Access repositories and issues', 'Create pull requests and comments', 'Read developer profile']
        };
      case 'google_calendar':
      case 'calendar':
        return {
          name: 'Google Calendar',
          color: '#4285f4',
          scopes: ['View scheduled events', 'Create and modify calendar events', 'Check availability and free/busy time']
        };
      default:
        return {
          name: slug.toUpperCase(),
          color: '#8879ef',
          scopes: ['Standard OAuth authorization scopes']
        };
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 10%, #1e293b 0%, #0d1421 80%)',
      padding: 24,
      fontFamily: "'Plus Jakarta Sans', 'Google Sans', sans-serif",
      color: '#e2e8f0'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 460,
        background: '#131d2e',
        border: '1px solid #27364b',
        borderRadius: 16,
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
        overflow: 'hidden'
      }}>
        {/* Brand bar */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #202d40',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0f1726'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src="./logo-white.png"
              alt="integrate"
              className="brand-logo-animated"
              style={{ height: 26, width: 'auto', objectFit: 'contain' }}
            />
            <div style={{ borderLeft: '1px solid #29384e', paddingLeft: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', letterSpacing: '-0.3px' }}>
                Secure Connect
              </div>
              <div style={{ fontSize: 10, color: '#7a8ba3' }}>Powered by integrate</div>
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(52, 211, 153, 0.1)',
            border: '1px solid rgba(52, 211, 153, 0.25)',
            color: '#34d399',
            padding: '4px 8px',
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 600
          }}>
            <Lock size={12} />
            <span>AES-256-GCM Vault</span>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '28px 24px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <RefreshCw size={28} className="spin" style={{ color: '#8879ef', margin: '0 auto 14px' }} />
              <h3 style={{ fontSize: 16, color: '#fff' }}>Loading connection details...</h3>
              <p style={{ fontSize: 12, color: '#7b8c9f', marginTop: 6 }}>Verifying session cryptographic token</p>
            </div>
          )}

          {error && !loading && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #7f1d1d',
                color: '#f87171',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px'
              }}>
                <AlertTriangle size={24} />
              </div>
              <h3 style={{ fontSize: 17, color: '#fff' }}>Connection Link Unavailable</h3>
              <p style={{ fontSize: 12, color: '#9ba8bb', marginTop: 8, lineHeight: 1.5 }}>
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary"
                style={{ marginTop: 20 }}
              >
                Try Again
              </button>
            </div>
          )}

          {session && !loading && (
            <>
              {session.status === 'COMPLETED' ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: 'rgba(52, 211, 153, 0.15)',
                    border: '1px solid rgba(52, 211, 153, 0.4)',
                    color: '#34d399',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <CheckCircle size={28} />
                  </div>
                  <h3 style={{ fontSize: 18, color: '#fff', fontWeight: 700 }}>Account Successfully Connected!</h3>
                  <p style={{ fontSize: 12, color: '#8fa0b5', marginTop: 8, lineHeight: 1.6 }}>
                    Your {getIntegrationDetails(session.integrationSlug).name} account has been securely authorized.
                  </p>
                  {session.returnUrl ? (
                    <a
                      href={session.returnUrl}
                      className="primary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 24,
                        textDecoration: 'none',
                        padding: '10px 20px',
                        borderRadius: 8
                      }}
                    >
                      Return to Application <ArrowRight size={14} />
                    </a>
                  ) : (
                    <p style={{ fontSize: 11, color: '#68778d', marginTop: 16 }}>
                      You may now safely close this window.
                    </p>
                  )}
                </div>
              ) : session.status === 'EXPIRED' ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'rgba(234, 179, 8, 0.15)',
                    border: '1px solid #854d0e',
                    color: '#facc15',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <AlertTriangle size={24} />
                  </div>
                  <h3 style={{ fontSize: 18, color: '#fff', fontWeight: 700 }}>Connection Session Expired</h3>
                  <p style={{ fontSize: 12, color: '#8fa0b5', marginTop: 8, lineHeight: 1.5 }}>
                    For security reasons, connection requests expire after 30 minutes. Please return to your app to request a new link.
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background: '#192436',
                      border: '1px solid #2b394e',
                      display: 'grid',
                      placeItems: 'center',
                      margin: '0 auto 14px',
                      fontSize: 24
                    }}>
                      {session.integrationSlug === 'gmail' ? '✉️' : session.integrationSlug === 'github' ? '🐙' : '📅'}
                    </div>
                    <h2 style={{ fontSize: 19, fontWeight: 700, color: '#fff', letterSpacing: '-0.4px' }}>
                      Connect {getIntegrationDetails(session.integrationSlug).name}
                    </h2>
                    <p style={{ fontSize: 12, color: '#8899af', marginTop: 6 }}>
                      User ID: <code style={{ color: '#a5f3fc' }}>{session.projectUserId}</code>
                    </p>
                  </div>

                  <div style={{
                    background: '#0d1522',
                    border: '1px solid #1f2c3f',
                    borderRadius: 10,
                    padding: '16px 18px',
                    marginBottom: 22
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                      Requested Permissions:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#c7d3e6', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {getIntegrationDetails(session.integrationSlug).scopes.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: 12,
                    background: 'rgba(136, 121, 239, 0.08)',
                    border: '1px solid rgba(136, 121, 239, 0.2)',
                    borderRadius: 8,
                    marginBottom: 24
                  }}>
                    <ShieldCheck size={18} color="#9488fa" style={{ flexShrink: 0, marginTop: 1 }} />
                    <div style={{ fontSize: 11, color: '#b9b3ff', lineHeight: 1.5 }}>
                      <strong>Zero Secret Exposure</strong>: Credentials are encrypted using authenticated AES-256-GCM. We never share your account passwords.
                    </div>
                  </div>

                  {session.connectUrl ? (
                    session.connectUrl.startsWith('#') ? (
                      <button
                        type="button"
                        className="primary"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 10,
                          width: '100%',
                          padding: '12px 18px',
                          borderRadius: 9,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setSession({
                            ...session,
                            status: 'COMPLETED'
                          });
                        }}
                      >
                        Authorize via {getIntegrationDetails(session.integrationSlug).name} (Simulate Connect) <ExternalLink size={15} />
                      </button>
                    ) : (
                      <a
                        href={session.connectUrl}
                        className="primary"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 10,
                          width: '100%',
                          padding: '12px 18px',
                          borderRadius: 9,
                          fontSize: 13,
                          fontWeight: 600,
                          textDecoration: 'none',
                          boxSizing: 'border-box'
                        }}
                      >
                        Authorize via {getIntegrationDetails(session.integrationSlug).name} <ExternalLink size={15} />
                      </a>
                    )
                  ) : (
                    <button
                      disabled
                      className="primary"
                      style={{ width: '100%', padding: '12px 18px', borderRadius: 9 }}
                    >
                      Integration Not Fully Configured
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
