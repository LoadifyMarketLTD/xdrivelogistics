'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import { COMPANY_CONFIG } from '../../config/company';

type Tab = 'company' | 'account' | 'notifications' | 'system';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('company');
  const [saved, setSaved] = useState(false);

  /* Company Info state (sourced from config, editable in-session) */
  const [company, setCompany] = useState({
    name: COMPANY_CONFIG.name,
    legalName: COMPANY_CONFIG.legalName,
    companyNumber: COMPANY_CONFIG.companyNumber,
    email: COMPANY_CONFIG.email,
    phone: COMPANY_CONFIG.phoneDisplay,
    street: COMPANY_CONFIG.address.street,
    city: COMPANY_CONFIG.address.city,
    postcode: COMPANY_CONFIG.address.postcode,
    jobRefPrefix: COMPANY_CONFIG.invoice.jobRefPrefix,
    invoicePrefix: COMPANY_CONFIG.invoice.invoicePrefix,
  });

  /* Notifications state */
  const [notif, setNotif] = useState({
    newJob: true,
    jobDelivered: true,
    invoicePaid: true,
    quoteReceived: false,
    emailAlerts: true,
    whatsappAlerts: false,
  });

  /* System state */
  const [sys, setSys] = useState({
    defaultVatRate: String(COMPANY_CONFIG.vat.defaultRate),
    defaultPaymentTerms: COMPANY_CONFIG.payment.terms[1],
    bankAccountName: COMPANY_CONFIG.payment.bankTransfer.accountName,
    bankSortCode: COMPANY_CONFIG.payment.bankTransfer.sortCode,
    bankAccountNumber: COMPANY_CONFIG.payment.bankTransfer.accountNumber,
    paypalEmail: COMPANY_CONFIG.payment.paypal.email,
    lateFeeNote: COMPANY_CONFIG.payment.lateFeeAmount,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.65rem 0.85rem', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' };
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem', fontWeight: 600, color: '#374151' };
  const sectionHdr: React.CSSProperties = { fontSize: '0.8rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '1.5rem 0 0.85rem', paddingBottom: '0.4rem', borderBottom: '1px solid #F3F4F6' };

  const TABS: { id: Tab; label: string; emoji: string }[] = [
    { id: 'company', label: 'Company Info', emoji: '🏢' },
    { id: 'account', label: 'Account', emoji: '👤' },
    { id: 'notifications', label: 'Notifications', emoji: '🔔' },
    { id: 'system', label: 'System', emoji: '⚙️' },
  ];

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
        <header style={{ backgroundColor: '#0A2239', color: 'white', padding: '0.9rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => router.push('/admin')} style={{ color: 'rgba(255,255,255,0.75)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>← Back</button>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>⚙️ Settings</h1>
          </div>
          <button onClick={logout} style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.45rem 0.8rem', cursor: 'pointer', fontSize: '0.82rem' }}>Logout</button>
        </header>

        <div style={{ maxWidth: '860px', margin: '1.5rem auto', padding: '0 1rem', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.25rem', alignItems: 'start' }}>
          {/* Sidebar */}
          <nav style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', padding: '0.85rem 1rem', border: 'none', borderLeft: activeTab === t.id ? '3px solid #0A2239' : '3px solid transparent', backgroundColor: activeTab === t.id ? '#F0F4F9' : 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: activeTab === t.id ? 700 : 500, color: activeTab === t.id ? '#0A2239' : '#374151', textAlign: 'left', transition: 'all 0.15s' }}>
                <span>{t.emoji}</span>{t.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '1.5rem' }}>
            {saved && (
              <div style={{ padding: '0.65rem 0.9rem', marginBottom: '1rem', backgroundColor: '#F0FDF4', color: '#15803D', borderRadius: '7px', fontSize: '0.875rem', border: '1px solid #BBF7D0' }}>
                ✓ Settings saved successfully (in-session only — edit config/company.ts to persist)
              </div>
            )}

            {/* Company Info Tab */}
            {activeTab === 'company' && (
              <div>
                <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: 700, color: '#0A2239' }}>Company Information</h2>
                <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: '#6B7280' }}>View and edit your company details used on invoices and documents.</p>

                <p style={sectionHdr}>Business Identity</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Trading Name</label>
                    <input style={inputStyle} value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Legal Name</label>
                    <input style={inputStyle} value={company.legalName} onChange={(e) => setCompany({ ...company, legalName: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Company Number</label>
                    <input style={inputStyle} value={company.companyNumber} onChange={(e) => setCompany({ ...company, companyNumber: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input type="email" style={inputStyle} value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input type="tel" style={inputStyle} value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} />
                  </div>
                </div>

                <p style={sectionHdr}>Address</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Street Address</label>
                    <input style={inputStyle} value={company.street} onChange={(e) => setCompany({ ...company, street: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>City</label>
                    <input style={inputStyle} value={company.city} onChange={(e) => setCompany({ ...company, city: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Postcode</label>
                    <input style={inputStyle} value={company.postcode} onChange={(e) => setCompany({ ...company, postcode: e.target.value })} />
                  </div>
                </div>

                <p style={sectionHdr}>Reference Prefixes</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Job Ref Prefix</label>
                    <input style={inputStyle} value={company.jobRefPrefix} onChange={(e) => setCompany({ ...company, jobRefPrefix: e.target.value })} placeholder="e.g. DC" />
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#9CA3AF' }}>Preview: {company.jobRefPrefix}-001234</p>
                  </div>
                  <div>
                    <label style={labelStyle}>Invoice Prefix</label>
                    <input style={inputStyle} value={company.invoicePrefix} onChange={(e) => setCompany({ ...company, invoicePrefix: e.target.value })} placeholder="e.g. INV" />
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#9CA3AF' }}>Preview: {company.invoicePrefix}-001234</p>
                  </div>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div>
                <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: 700, color: '#0A2239' }}>Account</h2>
                <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: '#6B7280' }}>Your login and session information.</p>
                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#0A2239', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700 }}>
                      {user?.email?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: '#0A2239' }}>{user?.email}</p>
                      <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', color: '#6B7280' }}>Administrator · {COMPANY_CONFIG.name}</p>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#92400E' }}>🔐 To change your password or email, use Supabase Auth settings or contact your system administrator.</p>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: 700, color: '#0A2239' }}>Notifications</h2>
                <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: '#6B7280' }}>Choose which events trigger notifications.</p>

                <p style={sectionHdr}>Events</p>
                {([
                  { key: 'newJob', label: 'New job created', desc: 'Alert when a new job is added' },
                  { key: 'jobDelivered', label: 'Job delivered', desc: 'Alert when a job is marked delivered' },
                  { key: 'invoicePaid', label: 'Invoice paid', desc: 'Alert when an invoice is marked paid' },
                  { key: 'quoteReceived', label: 'Quote request received', desc: 'Alert on new customer quote requests' },
                ] as const).map((item) => (
                  <label key={item.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={notif[item.key]} onChange={(e) => setNotif({ ...notif, [item.key]: e.target.checked })} style={{ marginTop: '0.2rem', width: '16px', height: '16px', cursor: 'pointer', accentColor: '#0A2239' }} />
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>{item.label}</p>
                      <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: '#9CA3AF' }}>{item.desc}</p>
                    </div>
                  </label>
                ))}

                <p style={sectionHdr}>Channels</p>
                {([
                  { key: 'emailAlerts', label: 'Email notifications', desc: `Send to ${COMPANY_CONFIG.email}` },
                  { key: 'whatsappAlerts', label: 'WhatsApp notifications', desc: `Send to ${COMPANY_CONFIG.phoneDisplay}` },
                ] as const).map((item) => (
                  <label key={item.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={notif[item.key]} onChange={(e) => setNotif({ ...notif, [item.key]: e.target.checked })} style={{ marginTop: '0.2rem', width: '16px', height: '16px', cursor: 'pointer', accentColor: '#0A2239' }} />
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>{item.label}</p>
                      <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: '#9CA3AF' }}>{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
              <div>
                <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: 700, color: '#0A2239' }}>System Settings</h2>
                <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: '#6B7280' }}>Configure VAT, payment terms, and bank details used on invoices.</p>

                <p style={sectionHdr}>Tax & Payment Defaults</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Default VAT Rate</label>
                    <select style={inputStyle} value={sys.defaultVatRate} onChange={(e) => setSys({ ...sys, defaultVatRate: e.target.value })}>
                      {COMPANY_CONFIG.vat.rates.map((r) => <option key={r} value={r}>{r}%</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Default Payment Terms</label>
                    <select style={inputStyle} value={sys.defaultPaymentTerms} onChange={(e) => setSys({ ...sys, defaultPaymentTerms: e.target.value })}>
                      {COMPANY_CONFIG.payment.terms.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Late Fee Note</label>
                    <input style={inputStyle} value={sys.lateFeeNote} onChange={(e) => setSys({ ...sys, lateFeeNote: e.target.value })} />
                  </div>
                </div>

                <p style={sectionHdr}>Bank Transfer Details</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Account Name</label>
                    <input style={inputStyle} value={sys.bankAccountName} onChange={(e) => setSys({ ...sys, bankAccountName: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Sort Code</label>
                    <input style={inputStyle} value={sys.bankSortCode} onChange={(e) => setSys({ ...sys, bankSortCode: e.target.value })} placeholder="XX-XX-XX" />
                  </div>
                  <div>
                    <label style={labelStyle}>Account Number</label>
                    <input style={inputStyle} value={sys.bankAccountNumber} onChange={(e) => setSys({ ...sys, bankAccountNumber: e.target.value })} placeholder="12345678" />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>PayPal Email</label>
                    <input type="email" style={inputStyle} value={sys.paypalEmail} onChange={(e) => setSys({ ...sys, paypalEmail: e.target.value })} />
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem', padding: '0.9rem', backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#0369A1' }}>ℹ️ These values are stored in session only. To persist changes, update <code style={{ backgroundColor: '#DBEAFE', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>app/config/company.ts</code> in the codebase.</p>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #F3F4F6' }}>
              <button onClick={handleSave} style={{ padding: '0.7rem 1.75rem', backgroundColor: '#0A2239', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, transition: 'background-color 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1E4E8C')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0A2239')}>
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
