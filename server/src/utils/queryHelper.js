/**
 * Query Sanitization and Optimization Helpers
 */

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 10;

/**
 * Escapes special characters for safe regular expression matching
 * Prevents ReDoS and syntax errors from characters like: . * + ? ^ $ { } ( ) | [ ] \
 * @param {string} string Raw user input string
 * @returns {string} Sanitized string safe for new RegExp() or MongoDB $regex
 */
const escapeRegex = (string) => {
  if (typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim();
};

/**
 * Validates, bounds and standardizes pagination parameters
 * @param {number|string} page Requested page number
 * @param {number|string} limit Requested limit
 * @param {number} [maxLimit=MAX_PAGE_SIZE] Max permissible page size
 * @returns {{ page: number, limit: number, skip: number }}
 */
const sanitizePagination = (page, limit, maxLimit = MAX_PAGE_SIZE) => {
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  const cleanPage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const cleanLimit = Number.isInteger(parsedLimit) && parsedLimit > 0
    ? Math.min(parsedLimit, maxLimit)
    : DEFAULT_PAGE_SIZE;

  const skip = (cleanPage - 1) * cleanLimit;

  return {
    page: cleanPage,
    limit: cleanLimit,
    skip
  };
};

module.exports = {
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  escapeRegex,
  sanitizePagination
};
