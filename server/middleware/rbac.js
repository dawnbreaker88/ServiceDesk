export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  TECHNICIAN: 'TECHNICIAN',
  EMPLOYEE: 'EMPLOYEE',
  ASSET_MANAGER: 'ASSET_MANAGER',
};

/**
 * Middleware to restrict access based on user role(s)
 * @param  {...string} roles Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }

    next();
  };
};

/**
 * Checks if the user is an admin or manager
 */
export const isAdminOrManager = (req, res, next) => {
  if (req.user && (req.user.role === ROLES.ADMIN || req.user.role === ROLES.MANAGER)) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied: Requires Admin or Manager privileges.',
  });
};

/**
 * Checks if the user is an IT staff member (Admin, Manager, or Technician)
 */
export const isItStaff = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === ROLES.ADMIN ||
      req.user.role === ROLES.MANAGER ||
      req.user.role === ROLES.TECHNICIAN)
  ) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied: Requires IT Staff privileges.',
  });
};

/**
 * Checks if the user is authorized to manage assets (Admin, Manager, or Asset Manager)
 */
export const isAssetStaff = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === ROLES.ADMIN ||
      req.user.role === ROLES.MANAGER ||
      req.user.role === ROLES.ASSET_MANAGER)
  ) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied: Requires IT Manager, Asset Manager, or Admin privileges.',
  });
};
