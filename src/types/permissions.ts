import { z } from "zod";

export const PermissionScopeEnum = z.enum([
  "p2p:read",
  "p2p:write",
  "p2p:admin",
  "sme:read",
  "sme:write",
  "sme:admin",
  "gateway:read",
  "gateway:write",
  "gateway:admin",
  "enterprise:read",
  "enterprise:write",
  "enterprise:admin",
]);

export type PermissionScope = z.infer<typeof PermissionScopeEnum>;

export const PermissionsArraySchema = z.array(PermissionScopeEnum);
