'use client';
import { COMPANY_CONFIG } from '../config/company';

export interface InvoiceData {
  id?: string;
  invoiceNumber: string;
  jobRef: string;
  date: string;
  dueDate: string;
  status?: string;
  clientName: string;
  clientAddress?: string;
  clientEmail?: string;
  pickupLocation?: string;
  pickupDateTime?: string;
  deliveryLocation?: string;
  deliveryDateTime?: string;
  deliveryRecipient?: string;
  serviceDescription: string;
  amount: number;
  paymentTerms: string;
  lateFee?: string;
  vatRate: 0 | 5 | 20;
  netAmount: number;
  vatAmount: number;
  podPhotos?: string[];
  signature?: string;
  recipientName?: string;
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n);
}

const label: React.CSSProperties = { fontSize: '0.72rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem', fontWeight: 600 };
const val: React.CSSProperties = { fontSize: '0.9rem', color: '#111827', fontWeight: 500, margin: 0 };

export default function InvoiceTemplate({ invoice }: { invoice: InvoiceData }) {
  const gross = invoice.netAmount + invoice.vatAmount;

  return (
    <div id="invoice-template" style={{ fontFamily: 'Inter, system-ui, sans-serif', maxWidth: '794px', margin: '0 auto', backgroundColor: 'white', padding: '2.5rem', color: '#111827' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '3px solid #0A2239' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0A2239', margin: 0 }}>{COMPANY_CONFIG.name}</h1>
          <p style={{ color: '#5B6B85', margin: '0.2rem 0 0', fontSize: '0.85rem' }}>{COMPANY_CONFIG.legalName} · Co. No. {COMPANY_CONFIG.companyNumber}</p>
          <p style={{ color: '#5B6B85', margin: '0.15rem 0 0', fontSize: '0.82rem' }}>{COMPANY_CONFIG.address.full}</p>
          <p style={{ color: '#5B6B85', margin: '0.15rem 0 0', fontSize: '0.82rem' }}>{COMPANY_CONFIG.email} · {COMPANY_CONFIG.phoneDisplay}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0A2239', margin: 0, letterSpacing: '-0.03em' }}>INVOICE</h2>
          <p style={{ ...val, margin: '0.3rem 0 0', fontSize: '1rem', color: '#1E4E8C' }}>{invoice.invoiceNumber}</p>
          {invoice.status && (
            <span style={{ display: 'inline-block', marginTop: '0.4rem', padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: invoice.status === 'paid' ? '#D1FAE5' : invoice.status === 'overdue' ? '#FEE2E2' : '#FEF3C7', color: invoice.status === 'paid' ? '#065F46' : invoice.status === 'overdue' ? '#991B1B' : '#92400E', textTransform: 'uppercase' }}>
              {invoice.status}
            </span>
          )}
        </div>
      </div>

      {/* Bill From / Bill To */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.75rem' }}>
        <div>
          <p style={label}>From</p>
          <p style={{ ...val, fontWeight: 700 }}>{COMPANY_CONFIG.legalName}</p>
          <p style={{ color: '#6B7280', fontSize: '0.82rem', margin: '0.2rem 0 0', lineHeight: 1.7 }}>
            {COMPANY_CONFIG.address.street}<br />{COMPANY_CONFIG.address.city}, {COMPANY_CONFIG.address.postcode}<br />{COMPANY_CONFIG.email}
          </p>
        </div>
        <div>
          <p style={label}>Bill To</p>
          <p style={{ ...val, fontWeight: 700 }}>{invoice.clientName}</p>
          {invoice.clientAddress && <p style={{ color: '#6B7280', fontSize: '0.82rem', margin: '0.2rem 0 0', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{invoice.clientAddress}</p>}
          {invoice.clientEmail && <p style={{ color: '#6B7280', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>{invoice.clientEmail}</p>}
        </div>
      </div>

      {/* Meta row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
        <div><p style={label}>Invoice Date</p><p style={val}>{invoice.date}</p></div>
        <div><p style={label}>Due Date</p><p style={val}>{invoice.dueDate}</p></div>
        <div><p style={label}>Job Reference</p><p style={val}>{invoice.jobRef}</p></div>
        <div><p style={label}>Payment Terms</p><p style={val}>{invoice.paymentTerms}</p></div>
      </div>

      {/* Job Details */}
      {(invoice.pickupLocation || invoice.deliveryLocation) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.75rem', padding: '1rem', backgroundColor: '#F0F9FF', borderRadius: '8px', border: '1px solid #BAE6FD' }}>
          {invoice.pickupLocation && (
            <div>
              <p style={{ ...label, color: '#0369A1' }}>Collection</p>
              <p style={val}>{invoice.pickupLocation}</p>
              {invoice.pickupDateTime && <p style={{ color: '#6B7280', fontSize: '0.82rem', margin: '0.15rem 0 0' }}>{invoice.pickupDateTime}</p>}
            </div>
          )}
          {invoice.deliveryLocation && (
            <div>
              <p style={{ ...label, color: '#0369A1' }}>Delivery</p>
              <p style={val}>{invoice.deliveryLocation}</p>
              {invoice.deliveryDateTime && <p style={{ color: '#6B7280', fontSize: '0.82rem', margin: '0.15rem 0 0' }}>{invoice.deliveryDateTime}</p>}
              {invoice.deliveryRecipient && <p style={{ color: '#6B7280', fontSize: '0.82rem', margin: '0.1rem 0 0' }}>Recipient: {invoice.deliveryRecipient}</p>}
            </div>
          )}
        </div>
      )}

      {/* Line Item Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#0A2239', color: 'white' }}>
            <th style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.82rem', fontWeight: 600 }}>Description</th>
            <th style={{ padding: '0.7rem 1rem', textAlign: 'right', fontSize: '0.82rem', fontWeight: 600 }}>Net</th>
            <th style={{ padding: '0.7rem 1rem', textAlign: 'right', fontSize: '0.82rem', fontWeight: 600 }}>VAT %</th>
            <th style={{ padding: '0.7rem 1rem', textAlign: 'right', fontSize: '0.82rem', fontWeight: 600 }}>VAT</th>
            <th style={{ padding: '0.7rem 1rem', textAlign: 'right', fontSize: '0.82rem', fontWeight: 600 }}>Gross</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
            <td style={{ padding: '0.85rem 1rem', fontSize: '0.9rem' }}>{invoice.serviceDescription}</td>
            <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontSize: '0.9rem' }}>{fmt(invoice.netAmount)}</td>
            <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontSize: '0.9rem' }}>{invoice.vatRate}%</td>
            <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontSize: '0.9rem' }}>{fmt(invoice.vatAmount)}</td>
            <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontSize: '0.9rem', fontWeight: 600 }}>{fmt(gross)}</td>
          </tr>
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
        <div style={{ width: '280px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid #E5E7EB' }}>
            <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>Net Amount</span>
            <span style={{ fontWeight: 500 }}>{fmt(invoice.netAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid #E5E7EB' }}>
            <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>VAT ({invoice.vatRate}%)</span>
            <span style={{ fontWeight: 500 }}>{fmt(invoice.vatAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: '#0A2239', color: 'white', borderRadius: '6px', marginTop: '0.5rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total Due</span>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>{fmt(gross)}</span>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <p style={{ fontWeight: 700, color: '#0369A1', marginBottom: '0.75rem', fontSize: '0.9rem', margin: '0 0 0.75rem' }}>Payment Details</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem', fontSize: '0.85rem' }}>
          <div><span style={{ color: '#6B7280' }}>Account Name: </span><span style={{ fontWeight: 600 }}>{COMPANY_CONFIG.payment.bankTransfer.accountName}</span></div>
          <div><span style={{ color: '#6B7280' }}>Sort Code: </span><span style={{ fontWeight: 600 }}>{COMPANY_CONFIG.payment.bankTransfer.sortCode}</span></div>
          <div><span style={{ color: '#6B7280' }}>Account No: </span><span style={{ fontWeight: 600 }}>{COMPANY_CONFIG.payment.bankTransfer.accountNumber}</span></div>
          <div><span style={{ color: '#6B7280' }}>PayPal: </span><span style={{ fontWeight: 600 }}>{COMPANY_CONFIG.payment.paypal.email}</span></div>
        </div>
        <p style={{ color: '#6B7280', fontSize: '0.78rem', marginTop: '0.75rem', marginBottom: 0 }}>
          {invoice.lateFee ?? COMPANY_CONFIG.payment.lateFeeAmount}
        </p>
      </div>

      {/* POD Photos */}
      {invoice.podPhotos && invoice.podPhotos.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ ...label, marginBottom: '0.75rem' }}>Proof of Delivery Photos</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {invoice.podPhotos.map((url, i) => (
              <img key={i} src={url} alt={`POD ${i + 1}`} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E5E7EB' }} />
            ))}
          </div>
        </div>
      )}

      {/* Signature */}
      {invoice.signature && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
          <p style={{ ...label, marginBottom: '0.5rem' }}>Delivery Confirmation</p>
          <img src={invoice.signature} alt="Signature" style={{ maxHeight: '80px', border: '1px solid #E5E7EB', borderRadius: '4px', backgroundColor: 'white', padding: '0.25rem' }} />
          {invoice.recipientName && <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#374151' }}>Signed by: <strong>{invoice.recipientName}</strong></p>}
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '0.75rem', borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
        <p style={{ margin: 0 }}>{COMPANY_CONFIG.legalName} · {COMPANY_CONFIG.address.full}</p>
        <p style={{ margin: '0.2rem 0 0' }}>{COMPANY_CONFIG.email} · {COMPANY_CONFIG.phoneDisplay}</p>
      </div>
    </div>
  );
}
