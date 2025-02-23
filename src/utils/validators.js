const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
};

const validateStringLength = (str, field, min, max) => {
  if (str && (str.length < min || str.length > max)) {
    throw new Error(`${field} length must be between ${min} and ${max} characters`);
  }
};

module.exports = {
  validateEmail,
  validateStringLength
};