export const COMPANY_CONFIG = {
  name: 'Danny Courier',
  legalName: 'XDrive Logistics Ltd',
  tagline: 'Professional Transport Services',
  companyNumber: '13171804',
  address: {
    street: '101 Cornelian Street',
    city: 'Blackburn',
    postcode: 'BB1 9QL',
    country: 'United Kingdom',
    full: '101 Cornelian Street, Blackburn, BB1 9QL, United Kingdom',
  },
  email: 'dannycourierltd@gmail.com',
  phone: '+447377694228',
  phoneDisplay: '07377 694 228',
  whatsapp: {
    number: '447377694228',
    defaultMessage: "Hello, I'd like to inquire about your transport services",
  },
  payment: {
    bankTransfer: { accountName: 'XDrive Logistics Ltd', sortCode: '04-00-04', accountNumber: '12345678' },
    paypal: { email: 'dannycourierltd@gmail.com' },
    terms: ['Pay now', '14 days', '30 days'] as const,
    lateFeeNote: 'Late payments may incur administrative charges.',
    lateFeeAmount: 'A late payment charge of £25 per full week may apply after the due date.',
  },
  vat: { rates: [0, 5, 20] as const, defaultRate: 20 },
  invoice: { jobRefPrefix: 'DC', invoicePrefix: 'INV' },
  social: { facebook: '#', instagram: '#', tiktok: '#', linkedin: '#' },
};

export const JOB_STATUS = {
  RECEIVED: 'Received',
  POSTED: 'Posted',
  ALLOCATED: 'Allocated',
  DELIVERED: 'Delivered',
} as const;

export const DELAY_OPTIONS = [15, 30, 45, 60] as const;

export type JobStatus = typeof JOB_STATUS[keyof typeof JOB_STATUS];
export type DelayOption = typeof DELAY_OPTIONS[number];
export type PaymentTerm = typeof COMPANY_CONFIG.payment.terms[number];
export type VATRate = typeof COMPANY_CONFIG.vat.rates[number];
