export const sameCategory = (left, right) => (
  String(left || '').trim().toLowerCase() === String(right || '').trim().toLowerCase()
);

export const categoryLabel = (value) => String(value || '').trim();

