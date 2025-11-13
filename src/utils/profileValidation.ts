// Profile validation utility functions

export interface User {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  joinedDate: string;
}

// Validate Malaysian phone number format
export const validateMalaysianPhone = (phone: string): boolean => {
  // Remove spaces, dashes, and brackets
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Malaysian phone number patterns:
  // Mobile: +60 1X-XXX-XXXX or 01X-XXX-XXXX (10-11 digits)
  // Landline: +60 X-XXX-XXXX or 0X-XXX-XXXX (9-10 digits)
  const patterns = [
    /^\+60[1-9]\d{7,8}$/,     // +60 format
    /^60[1-9]\d{7,8}$/,       // 60 format
    /^0[1-9]\d{7,8}$/,        // 0 format
    /^[1-9]\d{7,8}$/          // Direct format
  ];
  
  return patterns.some(pattern => pattern.test(cleanPhone));
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate postcode format (Malaysia: 5 digits)
export const validatePostcode = (postcode: string): boolean => {
  const postcodeRegex = /^\d{5}$/;
  return postcodeRegex.test(postcode);
};

// Check if profile is complete for checkout
export const isProfileCompleteForCheckout = (user: User | null): { 
  isComplete: boolean; 
  missingFields: string[];
  errors: string[];
} => {
  const missingFields: string[] = [];
  const errors: string[] = [];
  
  if (!user) {
    return {
      isComplete: false,
      missingFields: ['user_account'],
      errors: ['Please login to continue with checkout']
    };
  }
  
  // Check required fields
  if (!user.fullName || user.fullName.trim() === '') {
    missingFields.push('Full Name');
  }
  
  if (!user.email || user.email.trim() === '') {
    missingFields.push('Email Address');
  } else if (!validateEmail(user.email)) {
    errors.push('Please provide a valid email address');
  }
  
  if (!user.phone || user.phone.trim() === '') {
    missingFields.push('Phone Number');
  } else if (!validateMalaysianPhone(user.phone)) {
    errors.push('Please provide a valid Malaysian phone number (e.g., +60123456789 or 0123456789)');
  }
  
  // Check address fields
  if (!user.address) {
    missingFields.push('Complete Address');
  } else {
    if (!user.address.street || user.address.street.trim() === '') {
      missingFields.push('Street Address');
    }
    
    if (!user.address.city || user.address.city.trim() === '') {
      missingFields.push('City');
    }
    
    if (!user.address.state || user.address.state.trim() === '') {
      missingFields.push('State');
    }
    
    if (!user.address.postcode || user.address.postcode.trim() === '') {
      missingFields.push('Postcode');
    } else if (!validatePostcode(user.address.postcode)) {
      errors.push('Please provide a valid 5-digit Malaysian postcode');
    }
  }
  
  return {
    isComplete: missingFields.length === 0 && errors.length === 0,
    missingFields,
    errors
  };
};

// Get profile completion percentage
export const getProfileCompletionPercentage = (user: User | null): number => {
  if (!user) return 0;
  
  const totalFields = 7; // fullName, email, phone, street, city, state, postcode
  let completedFields = 0;
  
  if (user.fullName && user.fullName.trim() !== '') completedFields++;
  if (user.email && user.email.trim() !== '' && validateEmail(user.email)) completedFields++;
  if (user.phone && user.phone.trim() !== '' && validateMalaysianPhone(user.phone)) completedFields++;
  
  if (user.address) {
    if (user.address.street && user.address.street.trim() !== '') completedFields++;
    if (user.address.city && user.address.city.trim() !== '') completedFields++;
    if (user.address.state && user.address.state.trim() !== '') completedFields++;
    if (user.address.postcode && user.address.postcode.trim() !== '' && validatePostcode(user.address.postcode)) completedFields++;
  }
  
  return Math.round((completedFields / totalFields) * 100);
};

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  if (cleanPhone.startsWith('+60')) {
    return cleanPhone.replace('+60', '+60 ').replace(/(\d{1,2})(\d{3})(\d{4})/, '$1-$2-$3');
  } else if (cleanPhone.startsWith('60')) {
    return '+60 ' + cleanPhone.substring(2).replace(/(\d{1,2})(\d{3})(\d{4})/, '$1-$2-$3');
  } else if (cleanPhone.startsWith('0')) {
    return cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  
  return phone;
};