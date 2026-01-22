// Enum-like constants for database fields

export const FrequencyType = {
  QUARTERLY: "QUARTERLY",
  SEMIANNUAL: "SEMIANNUAL",
  CUSTOM: "CUSTOM",
} as const;
export type FrequencyType = (typeof FrequencyType)[keyof typeof FrequencyType];

export const JobStatus = {
  SCHEDULED: "SCHEDULED",
  COMPLETED: "COMPLETED",
  INVOICED: "INVOICED",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
} as const;
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

export const PaymentMethod = {
  CASH: "CASH",
  CHECK: "CHECK",
  ZELLE: "ZELLE",
  ACH: "ACH",
  CARD: "CARD",
  OTHER: "OTHER",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const AttachmentType = {
  BEFORE_PHOTO: "BEFORE_PHOTO",
  AFTER_PHOTO: "AFTER_PHOTO",
  INVOICE_PDF: "INVOICE_PDF",
  SERVICE_REPORT_PDF: "SERVICE_REPORT_PDF",
  OTHER: "OTHER",
} as const;
export type AttachmentType = (typeof AttachmentType)[keyof typeof AttachmentType];

// Job status colors for calendar
export const JobStatusColors: Record<JobStatus, string> = {
  SCHEDULED: "#6b7280", // gray
  COMPLETED: "#22c55e", // green
  INVOICED: "#3b82f6", // blue
  PAID: "#10b981", // emerald
  CANCELLED: "#ef4444", // red
};

// Revenue split percentages
export const REVENUE_SPLIT = {
  OPERATOR: 0.8,
  ADMIN: 0.1,
  SALES: 0.1,
} as const;

// Default names
export const DEFAULTS = {
  OPERATOR_NAME: "Baha",
  SALES_NAME: "Eren",
  ADMIN_NAME: "Kazim",
  DEFAULT_PRICE: 500,
} as const;

// Calculate job shares
export function calculateShares(price: number) {
  return {
    operatorShare: price * REVENUE_SPLIT.OPERATOR,
    adminShare: price * REVENUE_SPLIT.ADMIN,
    salesShare: price * REVENUE_SPLIT.SALES,
  };
}
