/**
 * UI helper utilities for loading and errors.
 */
const UI = {
  /**
   * Show loading overlay.
   * @param {string} message - Loading message.
   * @param {HTMLElement} container - Target container.
   */
  showLoading(message = "Lädt...", container = document.body) {
    this.hideLoading(container);
    const overlay = document.createElement("div");
    overlay.className = "loading-overlay";
    const spinnerWrapper = document.createElement("div");
    spinnerWrapper.className = "loading-spinner";
    const spinnerEl = document.createElement("div");
    spinnerEl.className = "spinner";
    const messageEl = document.createElement("p");
    messageEl.textContent = message;
    spinnerWrapper.appendChild(spinnerEl);
    spinnerWrapper.appendChild(messageEl);
    overlay.appendChild(spinnerWrapper);
    container.appendChild(overlay);
  },

  /**
   * Hide loading overlay.
   * @param {HTMLElement} container - Target container.
   */
  hideLoading(container = document.body) {
    const overlay = container.querySelector(".loading-overlay");
    if (overlay) {
      overlay.remove();
    }
  },

  /**
   * Show error message.
   * @param {string} message - Error message.
   * @param {HTMLElement} container - Target container.
   */
  showError(message, container = document.body) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    const content = document.createElement("div");
    content.className = "error-content";
    const icon = document.createElement("span");
    icon.className = "error-icon";
    icon.textContent = "⚠️";
    const text = document.createElement("span");
    text.className = "error-text";
    text.textContent = message;
    const closeButton = document.createElement("button");
    closeButton.className = "error-close";
    closeButton.type = "button";
    closeButton.textContent = "×";
    closeButton.addEventListener("click", () => errorDiv.remove());
    content.appendChild(icon);
    content.appendChild(text);
    content.appendChild(closeButton);
    errorDiv.appendChild(content);
    container.insertBefore(errorDiv, container.firstChild);
    setTimeout(() => {
      if (errorDiv.parentElement) {
        errorDiv.remove();
      }
    }, 5000);
  },

  /**
   * Show success message.
   * @param {string} message - Success message.
   */
  showSuccess(message) {
    const successDiv = document.createElement("div");
    successDiv.className = "success-message";
    const content = document.createElement("div");
    content.className = "success-content";
    const icon = document.createElement("span");
    icon.className = "success-icon";
    icon.textContent = "✓";
    const text = document.createElement("span");
    text.className = "success-text";
    text.textContent = message;
    content.appendChild(icon);
    content.appendChild(text);
    successDiv.appendChild(content);
    document.body.insertBefore(successDiv, document.body.firstChild);
    setTimeout(() => {
      if (successDiv.parentElement) {
        successDiv.remove();
      }
    }, 3000);
  },

  /**
   * Show validation error under a field.
   * @param {HTMLElement} field - Field element.
   * @param {string} message - Error message.
   */
  showFieldError(field, message) {
    this.clearFieldError(field);
    field.classList.add("error");
    if (field.name) {
      const existing = document.querySelector(
        `[data-error-for="${field.name}"]`
      );
      if (existing) {
        existing.textContent = message;
        return;
      }
    }
    const errorSpan = document.createElement("span");
    errorSpan.className = "field-error";
    errorSpan.textContent = message;
    field.parentNode.insertBefore(errorSpan, field.nextSibling);
  },

  /**
   * Clear validation error from a field.
   * @param {HTMLElement} field - Field element.
   */
  clearFieldError(field) {
    field.classList.remove("error");
    if (field.name) {
      const existing = document.querySelector(
        `[data-error-for="${field.name}"]`
      );
      if (existing) {
        existing.textContent = "";
      }
    }
    const errorSpan = field.parentNode.querySelector(".field-error");
    if (errorSpan) {
      errorSpan.remove();
    }
  },

  /**
   * Clear all field errors in a form.
   * @param {HTMLFormElement} form - Form element.
   */
  clearAllFieldErrors(form) {
    const fields = form.querySelectorAll(".error");
    fields.forEach((field) => this.clearFieldError(field));
  },

  /**
   * Update cart button state.
   * @param {number} count - Item count.
   * @param {number} total - Cart total.
   */
  updateCartButton(count, total = 0) {
    const cartButton = document.querySelector(".cart-button");
    if (!cartButton) return;
    const totalText =
      count > 0 ? ` • ${Utils.formatPrice(total)}` : "";
    cartButton.textContent = `🛒 Warenkorb (${count})${totalText}`;
    if (count > 0) {
      cartButton.disabled = false;
      cartButton.classList.add("is-active");
    } else {
      cartButton.disabled = true;
      cartButton.classList.remove("is-active");
    }
  },

  /**
   * Debounce helper.
   * @param {Function} func - Function to debounce.
   * @param {number} wait - Wait time.
   * @returns {Function} Debounced function.
   */
  debounce(func, wait = CONFIG.UI.DEBOUNCE_SEARCH_MS) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },
};
