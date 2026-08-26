// Multi-Tenant Isolation Middleware
export const tenantMiddleware = (req, res, next) => {
  const tenantId = req.headers['x-tenant-id'] || 'tenant-megastore';
  req.tenantId = tenantId.toLowerCase().trim();
  next();
};
