/**
 * Form validation utilities.
 */
const Validation = {
  /**
   * Validate customer ID.
   * @param {string} value - Input value.
   * @returns {{isValid: boolean, error: string}} Result.
   */
  validateCustomerId(value) {
    if (!value || value.trim() === "") {
      return { isValid: false, error: "Kunden-ID ist erforderlich" };
    }
    const trimmed = value.trim();
    const allowed = CONFIG.VALIDATION.ALLOWED_CUSTOMER_IDS || [];
    if (allowed.length > 0 && !allowed.includes(trimmed)) {
      return { isValid: false, error: "Kunden-ID ist ungültig" };
    }
    return { isValid: true, error: "" };
  },

  /**
   * Validate company name.
   * @param {string} value - Input value.
   * @returns {{isValid: boolean, error: string}} Result.
   */
  validateCompanyName(value) {
    if (!value || value.trim() === "") {
      return { isValid: false, error: "Firmenname ist erforderlich" };
    }
    if (value.trim().length < CONFIG.VALIDATION.MIN_COMPANY_NAME_LENGTH) {
      return {
        isValid: false,
        error: "Firmenname muss mindestens 2 Zeichen lang sein",
      };
    }
    return { isValid: true, error: "" };
  },

  /**
   * Validate email address.
   * @param {string} value - Input value.
   * @returns {{isValid: boolean, error: string}} Result.
   */
  validateEmail(value) {
    if (!value || value.trim() === "") {
      return { isValid: false, error: "E-Mail ist erforderlich" };
    }
    if (!CONFIG.VALIDATION.EMAIL_REGEX.test(value.trim())) {
      return {
        isValid: false,
        error: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
      };
    }
    return { isValid: true, error: "" };
  },

  /**
   * Validate notes (optional).
   * @param {string} value - Input value.
   * @returns {{isValid: boolean, error: string}} Result.
   */
  validateNotes(value) {
    if (!value) {
      return { isValid: true, error: "" };
    }
    if (value.length > CONFIG.VALIDATION.MAX_NOTES_LENGTH) {
      return {
        isValid: false,
        error: "Bemerkungen dürfen maximal 500 Zeichen lang sein",
      };
    }
    return { isValid: true, error: "" };
  },

  /**
   * Validate checkout form.
   * @param {Object} formData - Form values.
   * @returns {{isValid: boolean, errors: Object}} Result.
   */
  validateCheckoutForm(formData) {
    const errors = {};
    let isValid = true;

    const customer = this.validateCustomerId(formData.customerId);
    if (!customer.isValid) {
      errors.customerId = customer.error;
      isValid = false;
    }

    const company = this.validateCompanyName(formData.companyName);
    if (!company.isValid) {
      errors.companyName = company.error;
      isValid = false;
    }

    const email = this.validateEmail(formData.email);
    if (!email.isValid) {
      errors.email = email.error;
      isValid = false;
    }

    const notes = this.validateNotes(formData.notes);
    if (!notes.isValid) {
      errors.notes = notes.error;
      isValid = false;
    }

    return { isValid, errors };
  },
};
