// src/utils/validation.js
exports.requireFields = (fields, source = 'body') => (req, res, next) => {
  const data = req[source] || {};
  const missing = fields.filter((f) => data[f] === undefined || data[f] === '');
  if (missing.length) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missing.join(', ')}`,
    });
  }
  next();
};
