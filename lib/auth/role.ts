export const canEditUsers = (role: string) =>
  role === 'ADMIN';

export const canCreateUsers = (role: string) =>
  role === 'ADMIN' || role === 'CLASS_REP';

export const canAssignDepartments = (role: string) =>
  role === 'ADMIN';
