

/**
 * checkQuery:
 * checking query string properties, if present, and saving the values in an array
 */

function checkQuery() {
  // key error if one missing?

  const values = [];

  if (req.query.maxEmployees) {
    values.push(`numEmployees <= ${req.query.maxEmployees}`);
  }

  if (req.query.minEmployees) {
    values.push(`numEmployees >= ${req.query.minEmployees}`);
  }

  if (req.query.nameLike) {
    values.push(`WHERE name ILIKE %${req.query.nameLike}%`);
  }

  const where = values.length > 0 ? `WHERE ${values.join(', OR ')}` : '';
  return where;
}