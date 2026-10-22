import { getTenantContext, ROOT_TENANT_ID, TenantContextMissingError } from '../context/tenantContext';

export class CrossTenantAccessError extends Error {
  public statusCode: number = 403;
  constructor(message: string = 'Forbidden: Cross-tenant data access blocked.') {
    super(message);
    this.name = 'CrossTenantAccessError';
  }
}

export const isTenantError = (err: any): boolean => {
  return (
    err?.name === 'CrossTenantAccessError' ||
    err?.name === 'TenantContextMissingError' ||
    err?.statusCode === 403 ||
    (typeof err?.message === 'string' && err.message.startsWith('Access Denied'))
  );
};

/**
 * Asserts that the entity belongs to the active tenant or caller is Platform SuperAdmin.
 */
export const assertTenantOwnership = (
  entity: { tenantId?: string; companyId?: string } | null | undefined,
  entityName: string = 'Resource'
): void => {
  const ctx = getTenantContext();

  // If no entity found, caller will handle 404
  if (!entity) return;

  // Platform SuperAdmin has audited administrative access
  if (ctx?.isPlatformSuperAdmin) return;

  const currentTenantId = ctx?.tenantId;
  if (!currentTenantId) {
    throw new TenantContextMissingError(entityName);
  }

  // Treat missing/null entity tenantId as legacy ROOT_TENANT_ID (Grace Cabs)
  const entityTenantId = entity.tenantId || ROOT_TENANT_ID;

  if (entityTenantId !== currentTenantId) {
    throw new CrossTenantAccessError(
      `Access Denied: ${entityName} belongs to tenant '${entityTenantId}', caller is '${currentTenantId}'.`
    );
  }
};

/**
 * Enriches a Sequelize where condition with the active tenant filter.
 */
export const withTenant = (whereClause: Record<string, any> = {}): Record<string, any> => {
  const ctx = getTenantContext();

  if (ctx?.isPlatformSuperAdmin) {
    return { ...whereClause };
  }

  const tenantId = ctx?.tenantId;
  if (!tenantId) {
    throw new TenantContextMissingError('Query');
  }

  return {
    ...whereClause,
    tenantId,
  };
};
