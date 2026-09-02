import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { invoiceService, type InvoiceFilters } from "@/services/financeService";

export function useInvoices(initialFilters: InvoiceFilters = {}) {
  const [filters, setFilters] = useState<InvoiceFilters>({ page: 1, limit: 20, ...initialFilters });

  const query = useQuery({
    queryKey: ["invoices", filters],
    queryFn: () => invoiceService.list(filters),
    staleTime: 60 * 1000,
  });

  const updateFilter = (key: keyof InvoiceFilters, value: string | number | undefined) => {
    setFilters((f) => ({ ...f, [key]: value, page: key === "page" ? (value as number) : 1 }));
  };

  return { ...query, filters, updateFilter };
}

export function useInvoiceStats() {
  return useQuery({
    queryKey: ["invoices", "stats"],
    queryFn: invoiceService.getStats,
    staleTime: 2 * 60 * 1000,
  });
}
