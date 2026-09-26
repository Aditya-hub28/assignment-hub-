/**
 * System User Roles
 */
const ROLES = Object.freeze({
  STUDENT: 'student',
  ADMIN: 'admin'
});

module.exports = {
  ROLES,
  ALLOWED_ROLES: Object.values(ROLES)
};
