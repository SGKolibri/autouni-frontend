// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (Brazilian format)
export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
};

// CPF validation (Brazilian ID)
export const isValidCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(10, 11))) return false;
  
  return true;
};

// Password strength validation
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
} => {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  
  if (password.length < 8) {
    errors.push('Senha deve ter no mínimo 8 caracteres');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter letras minúsculas');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter letras maiúsculas');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Senha deve conter números');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Senha deve conter caracteres especiais');
  }
  
  const criteriasMet = 5 - errors.length;
  
  if (criteriasMet >= 4) strength = 'strong';
  else if (criteriasMet >= 2) strength = 'medium';
  
  return {
    isValid: errors.length === 0,
    strength,
    errors,
  };
};

// URL validation
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// IP Address validation
export const isValidIP = (ip: string): boolean => {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
};

// Port validation
export const isValidPort = (port: number | string): boolean => {
  const portNum = typeof port === 'string' ? parseInt(port, 10) : port;
  return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
};

// MQTT Topic validation
export const isValidMQTTTopic = (topic: string): boolean => {
  if (!topic || topic.length === 0) return false;
  if (topic.includes('#') && topic.indexOf('#') !== topic.length - 1) return false;
  if (topic.includes('+') && !/^\+$|\/\+\/|\/\+$|^\+\//.test(topic)) return false;
  return true;
};

// File size validation
export const isValidFileSize = (file: File, maxSizeBytes: number): boolean => {
  return file.size <= maxSizeBytes;
};

// File type validation
export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

// Date range validation
export const isValidDateRange = (startDate: Date, endDate: Date): boolean => {
  return startDate <= endDate;
};

// Number range validation
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

// Required field validation
export const isRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

// Array not empty validation
export const isArrayNotEmpty = (arr: any[]): boolean => {
  return Array.isArray(arr) && arr.length > 0;
};

// Alphanumeric validation
export const isAlphanumeric = (value: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(value);
};

// Energy value validation (must be positive)
export const isValidEnergyValue = (value: number): boolean => {
  return !isNaN(value) && value >= 0;
};

// Temperature validation (for AC control)
export const isValidTemperature = (value: number): boolean => {
  return !isNaN(value) && value >= 16 && value <= 30;
};

// Intensity validation (0-100 for dimmers)
export const isValidIntensity = (value: number): boolean => {
  return !isNaN(value) && value >= 0 && value <= 100;
};