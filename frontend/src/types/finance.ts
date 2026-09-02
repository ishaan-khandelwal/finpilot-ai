export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type: "receivable" | "payable";
  vendor_name: string;
  vendor_gstin: string | null;
  buyer_name: string | null;
  buyer_gstin: string | null;
  invoice_date: string;
  due_date: string | null;
  subtotal: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  tds_amount: number;
  total_amount: number;
  paid_amount: number;
  currency: string;
  status: InvoiceStatus;
  ocr_confidence: number | null;
  notes: string | null;
  created_at: string;
}

export type InvoiceStatus = "unpaid" | "paid" | "partial" | "overdue" | "cancelled";

export interface InvoiceStats {
  total_receivable: number;
  total_payable: number;
  overdue_count: number;
  overdue_amount: number;
  paid_this_month: number;
  pending_count: number;
}

export interface PaginatedInvoices {
  items: Invoice[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Document {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  document_type: string;
  status: "pending" | "processing" | "processed" | "failed";
  error_message: string | null;
  parsed_at: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  transaction_date: string;
  amount: number;
  type: "credit" | "debit";
  description: string;
  reference: string | null;
  category: string | null;
  counterparty: string | null;
  balance: number | null;
  created_at: string;
}

export interface PaginatedTransactions {
  items: Transaction[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
