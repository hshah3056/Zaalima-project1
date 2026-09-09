// Role-Based Access Control (RBAC) & Permission Middleware

/**
 * Authorize Roles Middleware
 * Usage: authorizeRoles('superadmin', 'admin')
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, message: 'Unauthorized. User profile not found.' });
    }

    // Super Admin has master access to all routes
    if (req.user.role === 'superadmin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]. Your role is '${req.user.role}'.`
      });
    }

    next();
  };
};

/**
 * Check Permission Middleware (Managed by Super Admin for Admin users)
 * Usage: checkPermission('manage_products')
 */
export const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized. User token missing.' });
    }

    // Super Admin has master access to all permissions
    if (req.user.role === 'superadmin') {
      return next();
    }

    const userPermissions = req.user.permissions || [];
    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: Missing required permission '${requiredPermission}'. Contact Super Admin to request route access.`
      });
    }

    next();
  };
};
