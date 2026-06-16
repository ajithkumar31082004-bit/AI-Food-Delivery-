function validate(fields) {
  return (req, res, next) => {
    const errors = [];
    for (const [field, rules] of Object.entries(fields)) {
      const value = req.body[field];
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }
      if (value !== undefined && value !== null && value !== '') {
        if (rules.minLength && String(value).length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }
        if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push(`${field} must be a valid email`);
        }
        if (rules.match && value !== req.body[rules.match]) {
          errors.push(`${field} must match ${rules.match}`);
        }
        if (rules.phone && !/^[0-9+\-\s]{10,15}$/.test(value)) {
          errors.push(`${field} must be a valid phone number`);
        }
      }
    }
    if (errors.length) return res.status(400).json({ message: errors.join(', '), errors });
    next();
  };
}

module.exports = { validate };
