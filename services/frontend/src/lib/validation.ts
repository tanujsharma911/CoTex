// Email validation regex
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Name validation - at least 2 characters, letters and spaces only
export const NAME_REGEX = /^[a-zA-Z\s]{2,}$/;

export const validateEmail = (
  email: string,
): { isValid: boolean; error?: string } => {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed) {
    return { isValid: false, error: "Email is required." };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid email address." };
  }

  return { isValid: true };
};

export const validatePassword = (
  password: string,
): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: "Password is required." };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      error: "Password must be at least 8 characters long.",
    };
  }

  return { isValid: true };
};

export const validateName = (
  name: string,
): { isValid: boolean; error?: string } => {
  const trimmed = name.trim();

  if (!trimmed) {
    return { isValid: false, error: "Full name is required." };
  }

  if (!NAME_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error:
        "Full name must contain only letters and spaces, minimum 2 characters.",
    };
  }

  return { isValid: true };
};

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string,
): { isValid: boolean; error?: string } => {
  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match." };
  }

  return { isValid: true };
};
