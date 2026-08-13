export const ADMIN_EMAILS = new Set([
  'pranaybayana31@gmail.com',
  'pranaybayana9@gmail.com',
]);

export const isAdminEmail = (email) => ADMIN_EMAILS.has(String(email || '').trim().toLowerCase());
