// src/mocks/handlers.ts
import { rest } from 'msw';
import { mockInvoices } from './mockData/invoices';
import { mockCategories } from './mockData/categories';
import { mockTags } from './mockData/tags';
import { mockUser } from './mockData/user';

// Define the base URL for API calls
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const handlers = [
  // Auth endpoints
  rest.post(`${API_URL}/auth/login`, (req, res, ctx) => {
    const { email, password } = req.body as { email: string; password: string };
    
    if (email === 'user@example.com' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({
          user: mockUser,
          tokens: {
            accessToken: 'mock-token-12345',
            tokenType: 'Bearer',
            expiresIn: 3600,
          },
        }),
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ message: 'Invalid email or password' }),
    );
  }),
  
  rest.get(`${API_URL}/auth/me`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({ message: 'Unauthorized' }),
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json(mockUser),
    );
  }),
  
  // Invoice endpoints
  rest.get(`${API_URL}/invoices`, (req, res, ctx) => {
    const limit = Number(req.url.searchParams.get('limit')) || 100;
    const skip = Number(req.url.searchParams.get('skip')) || 0;
    const status = req.url.searchParams.get('status');
    const category = req.url.searchParams.get('category');
    
    let filteredInvoices = [...mockInvoices];
    
    // Apply filters if provided
    if (status && status !== 'All') {
      filteredInvoices = filteredInvoices.filter(inv => inv.status === status);
    }
    
    if (category && category !== 'All') {
      filteredInvoices = filteredInvoices.filter(inv => 
        inv.categories && inv.categories.includes(category)
      );
    }
    
    // Apply pagination
    const paginatedInvoices = filteredInvoices.slice(skip, skip + limit);
    
    return res(
      ctx.status(200),
      ctx.json({
        invoices: paginatedInvoices,
        total: filteredInvoices.length,
        page: Math.floor(skip / limit) + 1,
        limit,
      }),
    );
  }),
  
  rest.get(`${API_URL}/invoice/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const invoice = mockInvoices.find(inv => inv.invoice_id === Number(id));
    
    if (!invoice) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Invoice not found' }),
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json(invoice),
    );
  }),
  
  rest.post(`${API_URL}/add-entry`, (req, res, ctx) => {
    const invoiceData = req.body as Record<string, any>;
    
    const newInvoice = {
      invoice_id: mockInvoices.length + 1,
      ...invoiceData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    return res(
      ctx.status(201),
      ctx.json({
        invoice_id: newInvoice.invoice_id,
        message: 'Invoice created successfully',
        success: true,
      }),
    );
  }),
  
  rest.put(`${API_URL}/update/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const invoiceData = req.body as Record<string, any>;
    
    const invoiceIndex = mockInvoices.findIndex(inv => inv.invoice_id === Number(id));
    
    if (invoiceIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Invoice not found' }),
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        invoice_id: Number(id),
        message: 'Invoice updated successfully',
        success: true,
      }),
    );
  }),
  
  rest.delete(`${API_URL}/delete/:id`, (req, res, ctx) => {
    const { id } = req.params;
    
    const invoiceIndex = mockInvoices.findIndex(inv => inv.invoice_id === Number(id));
    
    if (invoiceIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Invoice not found' }),
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        invoice_id: Number(id),
        message: 'Invoice deleted successfully',
        success: true,
      }),
    );
  }),
  
  // Categories endpoint
  rest.get(`${API_URL}/categories`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(mockCategories),
    );
  }),
  
  // Tags endpoint
  rest.get(`${API_URL}/tags`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(mockTags),
    );
  }),
  
  // Upload endpoint
  rest.post(`${API_URL}/upload`, async (req, res, ctx) => {
    // Mock file upload
    return res(
      ctx.status(201),
      ctx.json({
        invoice_id: mockInvoices.length + 1,
        message: 'File uploaded and processed successfully',
        success: true,
      }),
    );
  }),
  
  // Analytics endpoints
  rest.get(`${API_URL}/analytics/totals-by-category`, (req, res, ctx) => {
    // Create mock data for category totals
    const categoryTotals = mockCategories.reduce((acc, category) => {
      acc[category] = Math.round(Math.random() * 1000 * 100) / 100;
      return acc;
    }, {} as Record<string, number>);
    
    return res(
      ctx.status(200),
      ctx.json(categoryTotals),
    );
  }),
  
  rest.get(`${API_URL}/analytics/totals-by-month`, (req, res, ctx) => {
    const year = req.url.searchParams.get('year') || new Date().getFullYear().toString();
    
    // Create mock data for monthly totals
    const monthlyTotals: Record<string, number> = {};
    
    for (let month = 1; month <= 12; month++) {
      const monthStr = month.toString().padStart(2, '0');
      monthlyTotals[`${year}-${monthStr}`] = Math.round(Math.random() * 2000 * 100) / 100;
    }
    
    return res(
      ctx.status(200),
      ctx.json(monthlyTotals),
    );
  }),
];