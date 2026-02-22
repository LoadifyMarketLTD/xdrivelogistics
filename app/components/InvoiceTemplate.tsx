'use client';
import { COMPANY_CONFIG } from '../config/company';

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
}

interface InvoiceData {
  invoiceNumber: string;
  jobRef: string;
  date: string;
  dueDate: string;
  customerName: string;
  customerAddress?: string;
  customerEmail?: string;
  items: InvoiceLineItem[];
  notes?: string;
  paymentTerm: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
}

export function InvoiceTemplate({ invoice }: { invoice: InvoiceData }) {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const vatAmount = invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.vatRate) / 100, 0);
  const total = subtotal + vatAmount;

  const labelStyle = { fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.25rem' };
  const valueStyle = { fontSize: '0.95rem', color: '#111827', fontWeight: '500' };

  return (
    <div id="invoice-template" style={{ fontFamily: 'Inter, system-ui, sans-serif', maxWidth: '794px', margin: '0 auto', backgroundColor: 'white', padding: '2.5rem', color: '#111827' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '2px solid #0A2239' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0A2239', margin: 0 }}>{COMPANY_CONFIG.name}</h1>
          <p style={{ color: '#5B6B85', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>{COMPANY_CONFIG.legalName}</p>
          <p style={{ color: '#5B6B85', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Company No: {COMPANY_CONFIG.companyNumber}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0A2239', margin: 0 }}>INVOICE</h2>
          <p style={{ ...valueStyle, margin: '0.25rem 0 0' }}>{invoice.invoiceNumber}</p>
        </div>
      </div>

      {/* Company & Customer Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <p style={labelStyle}>From</p>
          <p style={{ ...valueStyle, marginBottom: '0.25rem' }}>{COMPANY_CONFIG.legalName}</p>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0, lineHeight: 1.6 }}>
            {COMPANY_CONFIG.address.street}<br />
            {COMPANY_CONFIG.address.city}, {COMPANY_CONFIG.address.postcode}<br />
            {COMPANY_CONFIG.email}
          </p>
        </div>
        <div>
          <p style={labelStyle}>Bill To</p>
          <p style={{ ...valueStyle, marginBottom: '0.25rem' }}>{invoice.customerName}</p>
          {invoice.customerAddress && <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{invoice.customerAddress}</p>}
          {invoice.customerEmail && <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>{invoice.customerEmail}</p>}
        </div>
      </div>

      {/* Invoice Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem', padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
        <div><p style={labelStyle}>Invoice Date</p><p style={valueStyle}>{invoice.date}</p></div>
        <div><p style={labelStyle}>Due Date</p><p style={valueStyle}>{invoice.dueDate}</p></div>
        <div><p style={labelStyle}>Job Reference</p><p style={valueStyle}>{invoice.jobRef}</p></div>
      </div>

      {/* Line Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#0A2239', color: 'white' }}>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600' }}>Description</th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.85rem', fontWeight: '600' }}>Qty</th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.85rem', fontWeight: '600' }}>Unit Price</th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.85rem', fontWeight: '600' }}>VAT %</th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.85rem', fontWeight: '600' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: i % 2 === 0 ? 'white' : '#F9FAFB' }}>
              <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}>{item.description}</td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.9rem' }}>{item.quantity}</td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.9rem' }}>{formatCurrency(item.unitPrice)}</td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.9rem' }}>{item.vatRate}%</td>
              <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.9rem', fontWeight: '500' }}>{formatCurrency(item.quantity * item.unitPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
        <div style={{ width: '260px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #E5E7EB' }}>
            <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>Subtotal</span>
            <span style={{ fontWeight: '500' }}>{formatCurrency(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #E5E7EB' }}>
            <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>VAT</span>
            <span style={{ fontWeight: '500' }}>{formatCurrency(vatAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', backgroundColor: '#0A2239', color: 'white', borderRadius: '6px', marginTop: '0.5rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
            <span style={{ fontWeight: '700', fontSize: '1rem' }}>Total</span>
            <span style={{ fontWeight: '700', fontSize: '1rem' }}>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <p style={{ fontWeight: '700', color: '#0369A1', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Payment Details</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.875rem' }}>
          <div><span style={{ color: '#6B7280' }}>Account Name: </span><span style={{ fontWeight: '500' }}>{COMPANY_CONFIG.payment.bankTransfer.accountName}</span></div>
          <div><span style={{ color: '#6B7280' }}>Sort Code: </span><span style={{ fontWeight: '500' }}>{COMPANY_CONFIG.payment.bankTransfer.sortCode}</span></div>
          <div><span style={{ color: '#6B7280' }}>Account: </span><span style={{ fontWeight: '500' }}>{COMPANY_CONFIG.payment.bankTransfer.accountNumber}</span></div>
          <div><span style={{ color: '#6B7280' }}>PayPal: </span><span style={{ fontWeight: '500' }}>{COMPANY_CONFIG.payment.paypal.email}</span></div>
        </div>
        <p style={{ color: '#6B7280', fontSize: '0.8rem', marginTop: '0.75rem', marginBottom: 0 }}>Payment Terms: {invoice.paymentTerm} — {COMPANY_CONFIG.payment.lateFeeAmount}</p>
      </div>

      {invoice.notes && (
        <div style={{ padding: '1rem', backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#92400E', fontSize: '0.9rem' }}>Notes</p>
          <p style={{ color: '#78350F', fontSize: '0.875rem', margin: 0 }}>{invoice.notes}</p>
        </div>
      )}

      <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '0.8rem', borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
        <p style={{ margin: 0 }}>{COMPANY_CONFIG.legalName} · {COMPANY_CONFIG.address.full} · {COMPANY_CONFIG.email}</p>
      </div>
    </div>
  );
}
