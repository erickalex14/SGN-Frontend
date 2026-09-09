// Etiquetas y clases compartidas para estados/prioridad de órdenes V2.
// Estados: NuevoSgn.Api/Modules/Operations/Orders/Domain/OrderStatus.cs

export const statusOrder = [
  "Pending", "DocumentaryReview", "TechnicalQueue", "WarrantyReview", "WarrantyRejectedByDate", "WarrantyApproved",
  "WarrantyRejected", "DirectRepairRejected", "QuotePending", "AwaitingParts", "LocalPurchase", "ImportPending", "InRepair",
  "AwaitingDelivery", "NotRepaired", "CreditNotePending", "Closed",
] as const;

export const statusLabels: Record<string, string> = {
  Pending: "Pendiente", DocumentaryReview: "Autorización documental", TechnicalQueue: "En cola técnica", WarrantyReview: "Revisión de garantía",
  WarrantyRejectedByDate: "Garantía negada por fecha", WarrantyApproved: "Garantía aprobada", WarrantyRejected: "Garantía negada",
  DirectRepairRejected: "Reparación negada", QuotePending: "Cotización pendiente", AwaitingParts: "Espera de repuestos",
  LocalPurchase: "Compra local", ImportPending: "Importación", InRepair: "En reparación", AwaitingDelivery: "Listo para entrega",
  NotRepaired: "No reparado", CreditNotePending: "NC pendiente", Closed: "Cerrada",
};

export const statusClass: Record<string, string> = {
  Pending: "st-pendiente", DocumentaryReview: "st-pendiente", QuotePending: "st-pendiente",
  TechnicalQueue: "st-proceso", WarrantyReview: "st-proceso", WarrantyApproved: "st-proceso", AwaitingParts: "st-proceso",
  LocalPurchase: "st-proceso", ImportPending: "st-proceso", InRepair: "st-proceso",
  AwaitingDelivery: "st-finalizada", Closed: "st-entregada",
  WarrantyRejectedByDate: "st-nc", WarrantyRejected: "st-nc", DirectRepairRejected: "st-nc", NotRepaired: "st-nc", CreditNotePending: "st-nc",
};

export const priorityLabels: Record<string, string> = { FinalCustomer: "Cliente final", Wholesale: "Mayorista", ExternalCustomer: "Cliente externo", Stock: "Stock", SelfConsumption: "Autoconsumo" };
export const priorityClass: Record<string, string> = { FinalCustomer: "final", Wholesale: "wholesale", ExternalCustomer: "external", Stock: "stock", SelfConsumption: "self" };

// Agrupación estilo legacy mis_ordenes: 5 buckets clicables + total.
export const statusBuckets: Record<string, string[]> = {
  pendiente: ["Pending", "DocumentaryReview", "TechnicalQueue", "WarrantyReview", "WarrantyApproved"],
  proceso: ["AwaitingParts", "LocalPurchase", "ImportPending", "InRepair", "QuotePending"],
  entrega: ["AwaitingDelivery"],
  nc: ["CreditNotePending", "NotRepaired", "WarrantyRejected", "WarrantyRejectedByDate", "DirectRepairRejected"],
  cerrada: ["Closed"],
};
export const bucketLabels: Record<string, string> = { pendiente: "Pendiente", proceso: "En proceso", entrega: "Listo entrega", nc: "Nota de crédito", cerrada: "Cerrada" };
