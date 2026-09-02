import api from "@/lib/api";
import { API_ROUTES } from "@/constants/routes";
import type { Invoice, InvoiceStats, PaginatedInvoices } from "@/types/finance";

export interface InvoiceFilters {
  page?: number;
  limit?: number;
  status?: string;
  invoice_type?: string;
  search?: string;
}

export const invoiceService = {
  async list(filters: InvoiceFilters = {}): Promise<PaginatedInvoices> {
    const { data } = await api.get<PaginatedInvoices>(API_ROUTES.INVOICES.BASE, { params: filters });
    return data;
  },

  async getStats(): Promise<InvoiceStats> {
    const { data } = await api.get<InvoiceStats>(API_ROUTES.INVOICES.STATS);
    return data;
  },

  async get(id: string): Promise<Invoice> {
    const { data } = await api.get<Invoice>(`${API_ROUTES.INVOICES.BASE}/${id}`);
    return data;
  },

  async uploadDocument(file: File, documentType: string): Promise<{ document_id: string; task_id: string }> {
    const form = new FormData();
    form.append("file", file);
    form.append("document_type", documentType);
    const { data } = await api.post(API_ROUTES.DOCUMENTS.UPLOAD, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};

export const transactionService = {
  async list(params: { page?: number; limit?: number; type?: string } = {}) {
    const { data } = await api.get(API_ROUTES.TRANSACTIONS.BASE, { params });
    return data;
  },

  async getStats() {
    const { data } = await api.get(API_ROUTES.TRANSACTIONS.STATS);
    return data;
  },
};
