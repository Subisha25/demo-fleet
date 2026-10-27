import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContextData {
  tenantId: string;
  tenantCode: string;
  selectedTenantId?: string; // Explicitly set when SuperAdmin selects a specific fleet, or 'all'/undefined when All Fleets
  userId?: string;
  role?: string;
  companyId?: string;
  email?: string;
  isPlatformSuperAdmin?: boolean;
  isInspectionMode?: boolean;
}

export const ROOT_TENANT_ID = 'e7b8a1c0-0000-0000-0000-000000000001';
export const ROOT_TENANT_CODE = 'GC';

export const tenantStorage = new AsyncLocalStorage<TenantContextData>();

export class TenantContextMissingError extends Error {
  constructor(modelName?: string) {
    const details = modelName ? ` for model '${modelName}'` : '';
    super(`Security Violation: Operation${details} executed without active TenantContext. Operation failed closed.`);
    this.name = 'TenantContextMissingError';
  }
}

/**
 * Returns active tenant context if available.
 */
export const getTenantContext = (): TenantContextData | undefined => {
  return tenantStorage.getStore();
};

/**
 * Requires tenant context to be present and fail-closed if missing.
 */
export const requireTenantContext = (modelName?: string): TenantContextData => {
  const ctx = tenantStorage.getStore();
  if (!ctx || !ctx.tenantId) {
    throw new TenantContextMissingError(modelName);
  }
  return ctx;
};

/**
 * Executes a function within the specified tenant context.
 */
export const runWithTenantContext = <T>(
  context: TenantContextData,
  fn: () => Promise<T> | T
): Promise<T> | T => {
  return tenantStorage.run(context, fn);
};
