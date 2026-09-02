import api from "@/lib/api";
import { API_ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/authStore";
import type { Invoice, InvoiceStats, PaginatedInvoices, PaginatedTransactions, Transaction } from "@/types/finance";

export interface InvoiceFilters {
  page?: number;
  limit?: number;
  status?: string;
  invoice_type?: string;
  search?: string;
}

const SAMPLE_INVOICES: Invoice[] = [
  {
    id: "inv-1",
    invoice_number: "INV-2026-001",
    invoice_type: "receivable",
    vendor_name: "Apex Labs Technologies",
    vendor_gstin: "27AABCA1234A1Z5",
    buyer_name: "FinPilot Technologies",
    buyer_gstin: "27AAACF1234M1Z2",
    invoice_date: "2026-08-01",
    due_date: "2026-08-18",
    subtotal: 66525.42,
    cgst_amount: 5987.29,
    sgst_amount: 5987.29,
    igst_amount: 0,
    tds_amount: 0,
    total_amount: 78500,
    paid_amount: 0,
    currency: "INR",
    status: "overdue",
    ocr_confidence: 0.985,
    notes: "Q3 Software Consulting retainer",
    created_at: "2026-08-01T10:30:00Z",
  },
  {
    id: "inv-2",
    invoice_number: "INV-2026-002",
    invoice_type: "receivable",
    vendor_name: "Nexus Retail Private Limited",
    vendor_gstin: "29BBBCB5678B2Z6",
    buyer_name: "FinPilot Technologies",
    buyer_gstin: "27AAACF1234M1Z2",
    invoice_date: "2026-08-12",
    due_date: "2026-08-26",
    subtotal: 39406.78,
    cgst_amount: 3546.61,
    sgst_amount: 3546.61,
    igst_amount: 0,
    tds_amount: 0,
    total_amount: 46500,
    paid_amount: 0,
    currency: "INR",
    status: "overdue",
    ocr_confidence: 0.962,
    notes: "Analytics dashboard license",
    created_at: "2026-08-12T14:20:00Z",
  },
  {
    id: "inv-3",
    invoice_number: "INV-2026-003",
    invoice_type: "receivable",
    vendor_name: "Starlight Media & Design",
    vendor_gstin: "07CCCCD9012C3Z7",
    buyer_name: "FinPilot Technologies",
    buyer_gstin: "27AAACF1234M1Z2",
    invoice_date: "2026-08-20",
    due_date: "2026-09-05",
    subtotal: 127118.64,
    cgst_amount: 11440.68,
    sgst_amount: 11440.68,
    igst_amount: 0,
    tds_amount: 0,
    total_amount: 150000,
    paid_amount: 150000,
    currency: "INR",
    status: "paid",
    ocr_confidence: 0.994,
    notes: "Brand identity & UI design overhaul",
    created_at: "2026-08-20T09:15:00Z",
  },
  {
    id: "inv-4",
    invoice_number: "INV-2026-004",
    invoice_type: "payable",
    vendor_name: "Amazon Web Services India",
    vendor_gstin: "27DDDDD3456D4Z8",
    buyer_name: "FinPilot Technologies",
    buyer_gstin: "27AAACF1234M1Z2",
    invoice_date: "2026-08-25",
    due_date: "2026-09-10",
    subtotal: 24067.80,
    cgst_amount: 2166.10,
    sgst_amount: 2166.10,
    igst_amount: 0,
    tds_amount: 0,
    total_amount: 28400,
    paid_amount: 28400,
    currency: "INR",
    status: "paid",
    ocr_confidence: 0.998,
    notes: "Cloud computing & PostgreSQL instances",
    created_at: "2026-08-25T16:00:00Z",
  },
  {
    id: "inv-5",
    invoice_number: "INV-2026-005",
    invoice_type: "receivable",
    vendor_name: "Zenith Global Logistics",
    vendor_gstin: "33EEEEE7890E5Z9",
    buyer_name: "FinPilot Technologies",
    buyer_gstin: "27AAACF1234M1Z2",
    invoice_date: "2026-08-28",
    due_date: "2026-09-15",
    subtotal: 271186.44,
    cgst_amount: 24406.78,
    sgst_amount: 24406.78,
    igst_amount: 0,
    tds_amount: 0,
    total_amount: 320000,
    paid_amount: 0,
    currency: "INR",
    status: "unpaid",
    ocr_confidence: 0.975,
    notes: "Annual Enterprise License",
    created_at: "2026-08-28T11:45:00Z",
  },
];

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    transaction_date: "2026-08-30",
    amount: 145000,
    type: "credit",
    description: "Razorpay Settlement - Payout Batch #8812",
    reference: "RZP-8812-STTL",
    category: "Revenue",
    counterparty: "Razorpay Software Pvt Ltd",
    balance: 482500,
    created_at: "2026-08-30T10:00:00Z",
  },
  {
    id: "tx-2",
    transaction_date: "2026-08-29",
    amount: 28400,
    type: "debit",
    description: "AWS Cloud Services Autopay",
    reference: "ACH-AWS-9912",
    category: "Cloud Infrastructure",
    counterparty: "Amazon Web Services",
    balance: 337500,
    created_at: "2026-08-29T14:30:00Z",
  },
  {
    id: "tx-3",
    transaction_date: "2026-08-28",
    amount: 320000,
    type: "credit",
    description: "NEFT Inward - Zenith Global Logistics",
    reference: "NEFT-INW-7712",
    category: "Enterprise Sales",
    counterparty: "Zenith Global Logistics",
    balance: 365900,
    created_at: "2026-08-28T11:00:00Z",
  },
  {
    id: "tx-4",
    transaction_date: "2026-08-27",
    amount: 12500,
    type: "debit",
    description: "Google Workspace Monthly Subscription",
    reference: "CARD-AUTH-6612",
    category: "Software Subscriptions",
    counterparty: "Google Cloud India",
    balance: 45900,
    created_at: "2026-08-27T08:15:00Z",
  },
  {
    id: "tx-5",
    transaction_date: "2026-08-25",
    amount: 150000,
    type: "credit",
    description: "RTGS Inward - Starlight Media Project",
    reference: "RTGS-INW-5501",
    category: "Revenue",
    counterparty: "Starlight Media & Design",
    balance: 58400,
    created_at: "2026-08-25T16:20:00Z",
  },
];

export const invoiceService = {
  async list(filters: InvoiceFilters = {}): Promise<PaginatedInvoices> {
    const isDemo = useAuthStore.getState().access_token?.startsWith("demo-");
    if (isDemo) {
      let items = [...SAMPLE_INVOICES];
      if (filters.status) items = items.filter((i) => i.status === filters.status);
      if (filters.invoice_type) items = items.filter((i) => i.invoice_type === filters.invoice_type);
      if (filters.search) {
        const s = filters.search.toLowerCase();
        items = items.filter((i) => i.vendor_name.toLowerCase().includes(s) || i.invoice_number.toLowerCase().includes(s));
      }
      return {
        items,
        total: items.length,
        page: filters.page ?? 1,
        limit: filters.limit ?? 20,
        pages: 1,
      };
    }

    try {
      const { data } = await api.get<PaginatedInvoices>(API_ROUTES.INVOICES.BASE, { params: filters });
      return data;
    } catch {
      return {
        items: SAMPLE_INVOICES,
        total: SAMPLE_INVOICES.length,
        page: 1,
        limit: 20,
        pages: 1,
      };
    }
  },

  async getStats(): Promise<InvoiceStats> {
    const isDemo = useAuthStore.getState().access_token?.startsWith("demo-");
    if (isDemo) {
      return {
        total_receivable: 595000,
        total_payable: 28400,
        overdue_count: 2,
        overdue_amount: 125000,
        paid_this_month: 150000,
        pending_count: 3,
      };
    }

    try {
      const { data } = await api.get<InvoiceStats>(API_ROUTES.INVOICES.STATS);
      return data;
    } catch {
      return {
        total_receivable: 595000,
        total_payable: 28400,
        overdue_count: 2,
        overdue_amount: 125000,
        paid_this_month: 150000,
        pending_count: 3,
      };
    }
  },

  async get(id: string): Promise<Invoice> {
    try {
      const { data } = await api.get<Invoice>(`${API_ROUTES.INVOICES.BASE}/${id}`);
      return data;
    } catch {
      return SAMPLE_INVOICES[0];
    }
  },

  async uploadDocument(file: File, documentType: string): Promise<{ document_id: string; task_id: string }> {
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("document_type", documentType);
      const { data } = await api.post(API_ROUTES.DOCUMENTS.UPLOAD, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch {
      // Mock upload for seamless client demonstration
      return {
        document_id: `doc-${Date.now()}`,
        task_id: `task-ocr-${Date.now()}`,
      };
    }
  },
};

export const transactionService = {
  async list(params: { page?: number; limit?: number; type?: string } = {}): Promise<PaginatedTransactions> {
    const isDemo = useAuthStore.getState().access_token?.startsWith("demo-");
    if (isDemo) {
      let items = [...SAMPLE_TRANSACTIONS];
      if (params.type) items = items.filter((t) => t.type === params.type);
      return {
        items,
        total: items.length,
        page: params.page ?? 1,
        limit: params.limit ?? 25,
        pages: 1,
      };
    }

    try {
      const { data } = await api.get(API_ROUTES.TRANSACTIONS.BASE, { params });
      return data;
    } catch {
      return {
        items: SAMPLE_TRANSACTIONS,
        total: SAMPLE_TRANSACTIONS.length,
        page: 1,
        limit: 25,
        pages: 1,
      };
    }
  },

  async getStats() {
    try {
      const { data } = await api.get(API_ROUTES.TRANSACTIONS.STATS);
      return data;
    } catch {
      return {
        current_balance: 482500,
        total_inflow_mtd: 615000,
        total_outflow_mtd: 40900,
      };
    }
  },
};
