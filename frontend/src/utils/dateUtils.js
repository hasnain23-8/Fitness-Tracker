/**
 * Returns the current local date in YYYY-MM-DD format.
 */
export const getLocalDate = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

/**
 * Formats an ISO string or Date object to a local date string (YYYY-MM-DD).
 */
export const formatToLocalDate = (dateInput) => {
  if (!dateInput) return '';
  if (typeof dateInput === 'string') return dateInput.split('T')[0];
  if (dateInput instanceof Date) {
    const offset = dateInput.getTimezoneOffset();
    const shifted = new Date(dateInput.getTime() - (offset * 60 * 1000));
    return shifted.toISOString().split('T')[0];
  }
  return '';
};
