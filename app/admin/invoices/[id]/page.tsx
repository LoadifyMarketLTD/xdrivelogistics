'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../components/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import InvoiceTemplate, { InvoiceData } from '../../../components/InvoiceTemplate';
import { SignatureCanvas } from '../../../components/SignatureCanvas';
import { PODPhotoUpload } from '../../../components/PODPhotoUpload';
import { COMPANY_CONFIG } from '../../../config/company';
import { supabase, isSupabaseConfigured } from '../../../../lib/supabaseClient';

function today() {
  return new Date().toISOString().slice(0, 10);
}
function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function calcVat(net: number, rate: number) {
  return Math.round(net * rate) / 100;
}
function nextInvNum(prefix: string) {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

type Tab = 'form' | 'preview';

export default function InvoiceDetailPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const invoiceId = params?.id as string;
  const isNew = invoiceId === 'new';

  const printRef = useRef<HTMLDivElement>(null);

  const defaultDate = today();
  const defaultDue = addDays(defaultDate, 14);

  const [tab, setTab] = useState<Tab>('form');
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  const [form, setForm] = useState<InvoiceData>({
    invoiceNumber: nextInvNum(COMPANY_CONFIG.invoice.invoicePrefix),
    jobRef: `${COMPANY_CONFIG.invoice.jobRefPrefix}-`,
    date: defaultDate,
    dueDate: defaultDue,
    status: 'unpaid',
    clientName: '',
    clientAddress: '',
    clientEmail: '',
    pickupLocation: '',
    pickupDateTime: '',
    deliveryLocation: '',
    deliveryDateTime: '',
    deliveryRecipient: '',
    serviceDescription: 'Courier / transport service',
    amount: 0,
    paymentTerms: '14 days',
    vatRate: 20,
    netAmount: 0,
    vatAmount: 0,
    podPhotos: [],
    signature: '',
    recipientName: '',
  });

  useEffect(() => {
    if (isNew || !isSupabaseConfigured) return;
    supabase.from('invoices').select('*').eq('id', invoiceId).single().then(({ data, error }) => {
      if (error) { setLoadError(error.message); return; }
      if (data) {
        setForm({
          id: data.id,
          invoiceNumber: data.invoice_ref ?? '',
          jobRef: data.job_ref ?? '',
          date: data.invoice_date ?? defaultDate,
          dueDate: data.due_date ?? defaultDue,
          status: data.status ?? 'unpaid',
          clientName: data.customer_name ?? '',
          clientAddress: data.customer_address ?? '',
          clientEmail: data.customer_email ?? '',
          pickupLocation: data.pickup_location ?? '',
          pickupDateTime: data.pickup_datetime ?? '',
          deliveryLocation: data.delivery_location ?? '',
          deliveryDateTime: data.delivery_datetime ?? '',
          deliveryRecipient: data.delivery_recipient ?? '',
          serviceDescription: data.service_description ?? '',
          amount: data.gross_amount ?? 0,
          paymentTerms: data.payment_terms ?? '14 days',
          vatRate: data.vat_rate ?? 20,
          netAmount: data.net_amount ?? 0,
          vatAmount: data.vat_amount ?? 0,
          podPhotos: data.pod_photos ?? [],
          signature: data.signature ?? '',
          recipientName: data.recipient_name ?? '',
        });
      }
    });
  }, [invoiceId, isNew]);

  const set = (field: keyof InvoiceData, value: unknown) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'netAmount' || field === 'vatRate') {
        const net = field === 'netAmount' ? Number(value) : prev.netAmount;
        const rate = field === 'vatRate' ? Number(value) : prev.vatRate;
        next.vatAmount = calcVat(net, rate);
        next.amount = net + next.vatAmount;
      }
      if (field === 'paymentTerms') {
        const days = value === '14 days' ? 14 : value === '30 days' ? 30 : 0;
        next.dueDate = addDays(next.date, days);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true); setSaveMsg('');
    try {
      if (!isSupabaseConfigured) { setSaveMsg('⚠️ Supabase not configured — changes not persisted.'); return; }
      const row = {
        invoice_ref: form.invoiceNumber,
        job_ref: form.jobRef,
        invoice_date: form.date,
        due_date: form.dueDate,
        status: form.status,
        customer_name: form.clientName,
        customer_address: form.clientAddress,
        customer_email: form.clientEmail,
        pickup_location: form.pickupLocation,
        pickup_datetime: form.pickupDateTime,
        delivery_location: form.deliveryLocation,
        delivery_datetime: form.deliveryDateTime,
        delivery_recipient: form.deliveryRecipient,
        service_description: form.serviceDescription,
        net_amount: form.netAmount,
        vat_rate: form.vatRate,
        vat_amount: form.vatAmount,
        gross_amount: form.amount,
        payment_terms: form.paymentTerms,
        pod_photos: form.podPhotos,
        signature: form.signature,
        recipient_name: form.recipientName,
      };
      if (isNew) {
        const { data, error } = await supabase.from('invoices').insert([row]).select().single();
        if (error) throw error;
        setSaveMsg('✓ Invoice created!');
        setTimeout(() => router.replace(`/admin/invoices/${data.id}`), 800);
      } else {
        const { error } = await supabase.from('invoices').update(row).eq('id', invoiceId);
        if (error) throw error;
        setSaveMsg('✓ Saved successfully!');
      }
    } catch (err: unknown) {
      setSaveMsg(`Error: ${err instanceof Error ? err.message : 'Save failed'}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    const el = document.getElementById('invoice-template');
    if (!el) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Invoice</title><style>body{margin:0;padding:0;font-family:Inter,system-ui,sans-serif}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>${el.outerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 300);
  };

  const handleWhatsApp = () => {
    const gross = form.netAmount + form.vatAmount;
    const msg = encodeURIComponent(
      `*Invoice ${form.invoiceNumber}*\nClient: ${form.clientName}\nJob Ref: ${form.jobRef}\nDate: ${form.date}\nDue: ${form.dueDate}\nAmount: £${gross.toFixed(2)}\n\nPlease make payment to:\nAccount: ${COMPANY_CONFIG.payment.bankTransfer.accountName}\nSort: ${COMPANY_CONFIG.payment.bankTransfer.sortCode}\nAcc No: ${COMPANY_CONFIG.payment.bankTransfer.accountNumber}\n\nThank you — ${COMPANY_CONFIG.name}`
    );
    window.open(`https://wa.me/${COMPANY_CONFIG.whatsapp.number}?text=${msg}`, '_blank');
  };

  const inputCls: React.CSSProperties = { width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid #E5E7EB', borderRadius: '7px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };
  const labelCls: React.CSSProperties = { display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', fontWeight: 600, color: '#374151' };
  const sectionHdr: React.CSSProperties = { fontSize: '0.8rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '1.5rem 0 0.75rem' };

  const gross = form.netAmount + form.vatAmount;

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
        {/* Header */}
        <header style={{ backgroundColor: '#0A2239', color: 'white', padding: '0.9rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => router.push('/admin/invoices')} style={{ color: 'rgba(255,255,255,0.75)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>← Invoices</button>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>🧾 {isNew ? 'New Invoice' : `Invoice ${form.invoiceNumber}`}</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button onClick={handleWhatsApp} style={{ backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '6px', padding: '0.45rem 0.9rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>WhatsApp</button>
            <button onClick={handlePrint} style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.45rem 0.9rem', cursor: 'pointer', fontSize: '0.82rem' }}>Print</button>
            <button onClick={handleSave} disabled={saving} style={{ backgroundColor: saving ? '#9CA3AF' : '#1F7A3D', color: 'white', border: 'none', borderRadius: '6px', padding: '0.45rem 0.9rem', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.82rem', fontWeight: 700 }}>{saving ? 'Saving…' : 'Save'}</button>
            <button onClick={logout} style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.45rem 0.8rem', cursor: 'pointer', fontSize: '0.82rem' }}>Logout</button>
          </div>
        </header>

        {saveMsg && <div style={{ padding: '0.6rem 1.5rem', backgroundColor: saveMsg.startsWith('Error') ? '#FEF2F2' : '#F0FDF4', color: saveMsg.startsWith('Error') ? '#DC2626' : '#15803D', fontSize: '0.875rem', borderBottom: '1px solid #E5E7EB' }}>{saveMsg}</div>}
        {loadError && <div style={{ padding: '0.6rem 1.5rem', backgroundColor: '#FEF2F2', color: '#DC2626', fontSize: '0.875rem' }}>Error loading: {loadError}</div>}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid #E5E7EB', backgroundColor: 'white', paddingLeft: '1.5rem' }}>
          {(['form', 'preview'] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '0.75rem 1.25rem', border: 'none', borderBottom: tab === t ? '2px solid #0A2239' : '2px solid transparent', background: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: tab === t ? 700 : 500, color: tab === t ? '#0A2239' : '#6B7280', marginBottom: '-2px', textTransform: 'capitalize' }}>
              {t === 'form' ? '✏️ Edit' : '👁 Preview'}
            </button>
          ))}
        </div>

        <div style={{ maxWidth: '900px', margin: '1.5rem auto', padding: '0 1rem' }}>
          {tab === 'form' ? (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '1.5rem' }}>
              {/* Invoice Meta */}
              <p style={sectionHdr}>Invoice Details</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={labelCls}>Invoice Number</label>
                  <input style={inputCls} value={form.invoiceNumber} onChange={(e) => set('invoiceNumber', e.target.value)} />
                </div>
                <div>
                  <label style={labelCls}>Job Reference</label>
                  <input style={inputCls} value={form.jobRef} onChange={(e) => set('jobRef', e.target.value)} />
                </div>
                <div>
                  <label style={labelCls}>Invoice Date</label>
                  <input type="date" style={inputCls} value={form.date} onChange={(e) => set('date', e.target.value)} />
                </div>
                <div>
                  <label style={labelCls}>Due Date</label>
                  <input type="date" style={inputCls} value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
                </div>
                <div>
                  <label style={labelCls}>Payment Terms</label>
                  <select style={inputCls} value={form.paymentTerms} onChange={(e) => set('paymentTerms', e.target.value)}>
                    {COMPANY_CONFIG.payment.terms.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelCls}>Status</label>
                  <select style={inputCls} value={form.status ?? 'unpaid'} onChange={(e) => set('status', e.target.value)}>
                    {['unpaid', 'paid', 'overdue', 'draft'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Client */}
              <p style={sectionHdr}>Client Information</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={labelCls}>Client Name *</label>
                  <input style={inputCls} value={form.clientName} onChange={(e) => set('clientName', e.target.value)} placeholder="Company or person name" />
                </div>
                <div>
                  <label style={labelCls}>Client Email</label>
                  <input type="email" style={inputCls} value={form.clientEmail ?? ''} onChange={(e) => set('clientEmail', e.target.value)} placeholder="email@example.com" />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelCls}>Client Address</label>
                  <textarea style={{ ...inputCls, minHeight: '70px', resize: 'vertical' }} value={form.clientAddress ?? ''} onChange={(e) => set('clientAddress', e.target.value)} placeholder="Street, City, Postcode" />
                </div>
              </div>

              {/* Job */}
              <p style={sectionHdr}>Job Details</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelCls}>Collection Address</label>
                  <input style={inputCls} value={form.pickupLocation ?? ''} onChange={(e) => set('pickupLocation', e.target.value)} />
                </div>
                <div>
                  <label style={labelCls}>Collection Date/Time</label>
                  <input style={inputCls} value={form.pickupDateTime ?? ''} onChange={(e) => set('pickupDateTime', e.target.value)} placeholder="e.g. 12 Jan 2025 09:00" />
                </div>
                <div>
                  <label style={labelCls}>Delivery Address</label>
                  <input style={inputCls} value={form.deliveryLocation ?? ''} onChange={(e) => set('deliveryLocation', e.target.value)} />
                </div>
                <div>
                  <label style={labelCls}>Delivery Date/Time</label>
                  <input style={inputCls} value={form.deliveryDateTime ?? ''} onChange={(e) => set('deliveryDateTime', e.target.value)} placeholder="e.g. 12 Jan 2025 14:00" />
                </div>
                <div>
                  <label style={labelCls}>Recipient Name</label>
                  <input style={inputCls} value={form.deliveryRecipient ?? ''} onChange={(e) => set('deliveryRecipient', e.target.value)} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelCls}>Service Description</label>
                  <input style={inputCls} value={form.serviceDescription} onChange={(e) => set('serviceDescription', e.target.value)} />
                </div>
              </div>

              {/* Pricing */}
              <p style={sectionHdr}>Pricing</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={labelCls}>Net Amount (£)</label>
                  <input type="number" step="0.01" min="0" style={inputCls} value={form.netAmount || ''} onChange={(e) => set('netAmount', parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <label style={labelCls}>VAT Rate</label>
                  <select style={inputCls} value={form.vatRate} onChange={(e) => set('vatRate', parseInt(e.target.value) as 0 | 5 | 20)}>
                    {COMPANY_CONFIG.vat.rates.map((r) => <option key={r} value={r}>{r}%</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelCls}>VAT Amount (£)</label>
                  <input type="number" step="0.01" readOnly style={{ ...inputCls, backgroundColor: '#F9FAFB', color: '#6B7280' }} value={form.vatAmount.toFixed(2)} />
                </div>
              </div>
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#0A2239', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem' }}>Total Due</span>
                <span style={{ color: 'white', fontWeight: 800, fontSize: '1.4rem' }}>£{gross.toFixed(2)}</span>
              </div>

              {/* POD */}
              <p style={sectionHdr}>Proof of Delivery</p>
              <PODPhotoUpload
                jobId={invoiceId === 'new' ? 'new' : invoiceId}
                existingPhotos={form.podPhotos ?? []}
                onUploadComplete={(url) => set('podPhotos', [...(form.podPhotos ?? []), url])}
              />

              {/* Signature */}
              <p style={sectionHdr}>Delivery Signature</p>
              {form.signature ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={form.signature} alt="Saved signature" style={{ maxHeight: '70px', border: '1px solid #E5E7EB', borderRadius: '4px', padding: '0.25rem', backgroundColor: 'white' }} />
                  <button type="button" onClick={() => { set('signature', ''); set('recipientName', ''); }} style={{ padding: '0.4rem 0.8rem', border: '1.5px solid #E5E7EB', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '0.82rem', color: '#DC2626' }}>Remove</button>
                  {form.recipientName && <span style={{ fontSize: '0.875rem', color: '#374151' }}>Signed by: <strong>{form.recipientName}</strong></span>}
                </div>
              ) : (
                <SignatureCanvas onSave={(url) => set('signature', url)} onClear={() => set('signature', '')} />
              )}
            </div>
          ) : (
            <div ref={printRef}>
              <InvoiceTemplate invoice={form} />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
