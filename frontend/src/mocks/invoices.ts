// src/mocks/mockData/invoices.ts
import { Invoice } from '../../types/invoice.types';

export const mockInvoices: Invoice[] = [
  {
    invoice_id: 1,
    user_id: 1,
    file_name: 'amazon-invoice-123456.pdf',
    merchant_name: 'Amazon',
    order_number: 'A123456789',
    purchase_date: '2023-02-15',
    payment_method: 'Credit Card',
    grand_total: 129.99,
    shipping_handling: 5.99,
    estimated_tax: 10.40,
    total_before_tax: 119.59,
    status: 'Paid',
    notes: 'Monthly office supplies',
    categories: ['Office Supplies', 'Electronics'],
    tags: ['tax-deductible', 'reimbursable'],
    items: [
      {
        item_id: 1,
        invoice_id: 1,
        product_name: 'Wireless Mouse',
        quantity: 2,
        unit_price: 24.99,
        product_link: 'https://www.amazon.com/wireless-mouse',
        condition: 'New'
      },
      {
        item_id: 2,
        invoice_id: 1,
        product_name: 'USB-C Hub',
        quantity: 1,
        unit_price: 69.61,
        product_link: 'https://www.amazon.com/usb-c-hub',
        condition: 'New'
      }
    ],
    created_at: '2023-02-15T14:30:00Z',
    updated_at: '2023-02-15T14:30:00Z'
  },
  {
    invoice_id: 2,
    user_id: 1,
    file_name: 'adobe-invoice-january.pdf',
    merchant_name: 'Adobe',
    order_number: 'INV123456',
    purchase_date: '2023-01-01',
    payment_method: 'Credit Card',
    grand_total: 52.99,
    status: 'Paid',
    categories: ['Software', 'Subscriptions'],
    tags: ['monthly', 'tax-deductible'],
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    invoice_id: 3,
    user_id: 1,
    file_name: 'webhosting-invoice-q1.pdf',
    merchant_name: 'Web Hosting Company',
    order_number: 'WHC789012',
    purchase_date: '2023-01-15',
    payment_method: 'PayPal',
    grand_total: 120.00,
    status: 'Open',
    notes: 'Quarterly payment for web hosting',
    categories: ['Hosting', 'Business Expenses'],
    tags: ['quarterly', 'tax-deductible'],
    created_at: '2023-01-15T10:45:00Z',
    updated_at: '2023-01-15T10:45:00Z'
  },
  {
    invoice_id: 4,
    user_id: 1,
    file_name: 'office-supplies-feb.pdf',
    merchant_name: 'Staples',
    order_number: 'ST456789',
    purchase_date: '2023-02-22',
    payment_method: 'Credit Card',
    grand_total: 87.65,
    shipping_handling: 9.99,
    estimated_tax: 7.01,
    total_before_tax: 80.64,
    status: 'Paid',
    categories: ['Office Supplies'],
    tags: ['tax-deductible'],
    items: [
      {
        item_id: 3,
        invoice_id: 4,
        product_name: 'Printer Paper',
        quantity: 2,
        unit_price: 19.99,
        condition: 'New'
      },
      {
        item_id: 4,
        invoice_id: 4,
        product_name: 'Pens (Box of 12)',
        quantity: 3,
        unit_price: 8.99,
        condition: 'New'
      },
      {
        item_id: 5,
        invoice_id: 4,
        product_name: 'Notebooks',
        quantity: 4,
        unit_price: 4.99,
        condition: 'New'
      }
    ],
    created_at: '2023-02-22T16:20:00Z',
    updated_at: '2023-02-22T16:20:00Z'
  },
  {
    invoice_id: 5,
    user_id: 1,
    file_name: 'aws-march-invoice.pdf',
    merchant_name: 'Amazon Web Services',
    order_number: 'AWS123456',
    purchase_date: '2023-03-01',
    payment_method: 'Credit Card',
    grand_total: 234.56,
    status: 'Open',
    notes: 'Monthly AWS services',
    categories: ['Cloud Services', 'Business Expenses'],
    tags: ['monthly', 'tax-deductible'],
    created_at: '2023-03-01T00:10:00Z',
    updated_at: '2023-03-01T00:10:00Z'
  },
  {
    invoice_id: 6,
    user_id: 1,
    file_name: 'hardware-purchase-march.pdf',
    merchant_name: 'Best Buy',
    order_number: 'BB78901234',
    purchase_date: '2023-03-15',
    payment_method: 'Credit Card',
    grand_total: 1299.99,
    shipping_handling: 0,
    estimated_tax: 104.00,
    total_before_tax: 1195.99,
    status: 'Paid',
    notes: 'New developer laptop',
    categories: ['Hardware', 'Capital Expenses'],
    tags: ['tax-deductible', 'asset'],
    items: [
      {
        item_id: 6,
        invoice_id: 6,
        product_name: 'Developer Laptop',
        quantity: 1,
        unit_price: 1199.99,
        product_link: 'https://www.bestbuy.com/laptop',
        condition: 'New'
      },
      {
        item_id: 7,
        invoice_id: 6,
        product_name: 'Laptop Sleeve',
        quantity: 1,
        unit_price: 49.99,
        product_link: 'https://www.bestbuy.com/laptop-sleeve',
        condition: 'New'
      },
      {
        item_id: 8,
        invoice_id: 6,
        product_name: 'Screen Cleaner',
        quantity: 1,
        unit_price: 9.99,
        product_link: 'https://www.bestbuy.com/screen-cleaner',
        condition: 'New'
      }
    ],
    created_at: '2023-03-15T09:45:00Z',
    updated_at: '2023-03-15T09:45:00Z'
  },
  {
    invoice_id: 7,
    user_id: 1,
    file_name: 'phone-bill-march.pdf',
    merchant_name: 'Verizon',
    order_number: 'VZ123456789',
    purchase_date: '2023-03-20',
    payment_method: 'Bank Transfer',
    grand_total: 89.99,
    status: 'Open',
    notes: 'Monthly phone bill',
    categories: ['Utilities', 'Business Expenses'],
    tags: ['monthly', 'tax-deductible'],
    created_at: '2023-03-20T14:30:00Z',
    updated_at: '2023-03-20T14:30:00Z'
  },
  {
    invoice_id: 8,
    user_id: 1,
    file_name: 'consulting-services-q1.pdf',
    merchant_name: 'Acme Consulting',
    order_number: 'AC2023-001',
    purchase_date: '2023-03-25',
    payment_method: 'Bank Transfer',
    grand_total: 2500.00,
    status: 'Needs Attention',
    notes: 'Q1 consulting services',
    categories: ['Consulting', 'Professional Services'],
    tags: ['quarterly', 'tax-deductible'],
    created_at: '2023-03-25T11:15:00Z',
    updated_at: '2023-03-25T11:15:00Z'
  }
];