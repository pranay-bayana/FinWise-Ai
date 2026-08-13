export const ADMIN_EMAILS = [
  'pranaybayana31@gmail.com',
  'pranaybayana9@gmail.com',
];

export const isAdminUser = (user) => ADMIN_EMAILS.includes(String(user?.email || '').trim().toLowerCase());
