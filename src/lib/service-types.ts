export const SERVICE_TYPES = [
  "Desenvolvimento",
  "Design",
  "Redação",
  "Consultoria",
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];
