/**
 * XDrive Logistics - Main JavaScript
 * Handles navigation, forms, and interactive features
 */

// ============================================
// 1. Mobile Menu Toggle
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });
  }
});

// ============================================
// 2. Sticky Navigation on Scroll
// ============================================
window.addEventListener('scroll', function() {
  const header = document.querySelector('.header');
  if (header) {
    if (window.scrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
});

// ============================================
// 3. Active Navigation Highlighting
// ============================================
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', setActiveNavLink);

// ============================================
// 4. Smooth Scroll to Sections
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ============================================
// 5. Form Validation
// ============================================

// Validation rules
const validationRules = {
  name: {
    required: true,
    minLength: 2,
    errorMessage: 'Name must be at least 2 characters long'
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessage: 'Please enter a valid email address'
  },
  phone: {
    required: true,
    pattern: /^(\+44|0)[0-9]{10}$/,
    errorMessage: 'Please enter a valid UK phone number'
  },
  postcode: {
    required: true,
    pattern: /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i,
    errorMessage: 'Please enter a valid UK postcode'
  },
  message: {
    required: true,
    minLength: 10,
    errorMessage: 'Message must be at least 10 characters long'
  },
  subject: {
    required: true,
    minLength: 3,
    errorMessage: 'Subject must be at least 3 characters long'
  }
};

// Validate single field
function validateField(field) {
  const fieldName = field.name || field.id;
  const value = field.value.trim();
  const rules = validationRules[fieldName];
  
  if (!rules) return true;
  
  const formGroup = field.closest('.form-group');
  const errorElement = formGroup ? formGroup.querySelector('.form-error') : null;
  
  // Required check
  if (rules.required && !value) {
    showError(formGroup, errorElement, 'This field is required');
    return false;
  }
  
  // Min length check
  if (rules.minLength && value.length < rules.minLength) {
    showError(formGroup, errorElement, rules.errorMessage);
    return false;
  }
  
  // Pattern check
  if (rules.pattern && !rules.pattern.test(value)) {
    showError(formGroup, errorElement, rules.errorMessage);
    return false;
  }
  
  // If all checks pass
  hideError(formGroup, errorElement);
  return true;
}

// Show error
function showError(formGroup, errorElement, message) {
  if (formGroup) formGroup.classList.add('error');
  if (errorElement) errorElement.textContent = message;
}

// Hide error
function hideError(formGroup, errorElement) {
  if (formGroup) formGroup.classList.remove('error');
  if (errorElement) errorElement.textContent = '';
}

// Real-time validation
document.addEventListener('DOMContentLoaded', function() {
  const formInputs = document.querySelectorAll('.form-input, .form-textarea, .form-select');
  
  formInputs.forEach(input => {
    input.addEventListener('blur', function() {
      validateField(this);
    });
    
    input.addEventListener('input', function() {
      // Clear error on input if field was invalid
      const formGroup = this.closest('.form-group');
      if (formGroup && formGroup.classList.contains('error')) {
        validateField(this);
      }
    });
  });
});

// ============================================
// 6. Form Submission Handling
// ============================================

// Quote form submission
const quoteForm = document.getElementById('quoteForm');
if (quoteForm) {
  quoteForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate all fields
    const fields = this.querySelectorAll('.form-input, .form-textarea, .form-select');
    let isValid = true;
    
    fields.forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
    });
    
    if (!isValid) {
      return;
    }
    
    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
    // Simulate form submission (replace with actual backend call)
    setTimeout(() => {
      // Show success message
      showSuccessMessage(this, 'Thank you! Your quote request has been received. We\'ll contact you shortly.');
      
      // Reset form
      this.reset();
      
      // Reset button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      
      // Clear any validation errors
      const formGroups = this.querySelectorAll('.form-group');
      formGroups.forEach(group => {
        group.classList.remove('error');
        const errorElement = group.querySelector('.form-error');
        if (errorElement) errorElement.textContent = '';
      });
    }, 1500);
  });
}

// Contact form submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate all fields
    const fields = this.querySelectorAll('.form-input, .form-textarea');
    let isValid = true;
    
    fields.forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
    });
    
    if (!isValid) {
      return;
    }
    
    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
    // Simulate form submission (replace with actual backend call)
    setTimeout(() => {
      // Show success message
      showSuccessMessage(this, 'Thank you for contacting us! We\'ll get back to you as soon as possible.');
      
      // Reset form
      this.reset();
      
      // Reset button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      
      // Clear any validation errors
      const formGroups = this.querySelectorAll('.form-group');
      formGroups.forEach(group => {
        group.classList.remove('error');
        const errorElement = group.querySelector('.form-error');
        if (errorElement) errorElement.textContent = '';
      });
    }, 1500);
  });
}

// Show success message
function showSuccessMessage(form, message) {
  let successDiv = form.querySelector('.form-success');
  
  if (!successDiv) {
    successDiv = document.createElement('div');
    successDiv.className = 'form-success';
    form.insertBefore(successDiv, form.firstChild);
  }
  
  successDiv.textContent = message;
  successDiv.classList.add('show');
  
  // Hide after 5 seconds
  setTimeout(() => {
    successDiv.classList.remove('show');
  }, 5000);
}

// ============================================
// 7. Phone Number Formatting
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  const phoneInputs = document.querySelectorAll('input[type="tel"], input[name="phone"]');
  
  phoneInputs.forEach(input => {
    input.addEventListener('input', function(e) {
      // Remove non-numeric characters except +
      let value = this.value.replace(/[^\d+]/g, '');
      
      // Format UK phone number
      if (value.startsWith('0') && value.length > 5) {
        value = value.slice(0, 5) + ' ' + value.slice(5);
      }
      
      this.value = value;
    });
  });
});

// ============================================
// 8. Date/Time Picker Initialization
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  const dateInputs = document.querySelectorAll('input[type="date"]');
  const timeInputs = document.querySelectorAll('input[type="time"]');
  
  // Set minimum date to today
  dateInputs.forEach(input => {
    const today = new Date().toISOString().split('T')[0];
    input.setAttribute('min', today);
  });
  
  // Set default time to business hours
  timeInputs.forEach(input => {
    if (!input.value) {
      input.value = '09:00';
    }
  });
});

// ============================================
// 9. Scroll Animations (Fade In)
// ============================================
function handleScrollAnimations() {
  const elements = document.querySelectorAll('.card, .fleet-section, .feature-box');
  
  elements.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;
    const elementBottom = element.getBoundingClientRect().bottom;
    const isVisible = (elementTop < window.innerHeight - 100) && (elementBottom > 0);
    
    if (isVisible && !element.classList.contains('fade-in')) {
      element.classList.add('fade-in');
    }
  });
}

// Run on scroll and load
window.addEventListener('scroll', handleScrollAnimations);
window.addEventListener('load', handleScrollAnimations);

// ============================================
// 10. Postcode Formatting
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  const postcodeInputs = document.querySelectorAll('input[name="pickupPostcode"], input[name="deliveryPostcode"]');
  
  postcodeInputs.forEach(input => {
    input.addEventListener('blur', function() {
      // Convert to uppercase and format
      let value = this.value.toUpperCase().replace(/\s/g, '');
      
      // Add space before last 3 characters if postcode is valid length
      if (value.length >= 5) {
        value = value.slice(0, -3) + ' ' + value.slice(-3);
      }
      
      this.value = value;
    });
  });
});

// ============================================
// 11. Console Log - Development Info
// ============================================
console.log('%cXDrive Logistics Website', 'color: #d4934f; font-size: 20px; font-weight: bold;');
console.log('%cVersion 1.0 | Built with HTML, CSS, and JavaScript', 'color: #1a2332; font-size: 12px;');
console.log('For support, contact: [YOUR_EMAIL]');
