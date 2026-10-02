const cartButtonEl = document.querySelector(".cart-button");
const formEl = document.querySelector("#checkout-form");
const submitButtonEl = document.querySelector("#submit-order");
const summaryCountEl = document.querySelector("#summary-count");
const summaryItemsEl = document.querySelector("#summary-items");
const summaryTotalEl = document.querySelector("#summary-total-amount");

/**
 * Render the order summary panel.
 * @param {Array<Object>} products - Product list.
 */
const renderSummary = (products) => {
  const cart = cartService.getCart();
  UI.updateCartButton(cartService.getCartCount(cart));

  const productMap = products.reduce((map, product) => {
    map[product.id] = product;
    return map;
  }, {});

  let total = 0;
  let itemCount = 0;
  const itemsMarkup = Object.entries(cart)
    .map(([productId, quantity]) => {
      const product = productMap[productId];
      if (!product) return "";
      itemCount += quantity;
      total += Utils.getDisplayPrice(product) * quantity;
      const safeName = Utils.sanitizeInput(product.name);
      return `<div>${safeName} ×${quantity}</div>`;
    })
    .join("");

  if (summaryCountEl) {
    summaryCountEl.textContent = `${itemCount} Artikel`;
  }
  if (summaryItemsEl) {
    summaryItemsEl.innerHTML = itemsMarkup;
  }
  if (summaryTotalEl) {
    summaryTotalEl.textContent = Utils.formatPrice(total);
  }
  UI.updateCartButton(cartService.getCartCount(cart), total);
};

/**
 * Collect form values from the checkout form.
 * @returns {Object} Form values.
 */
const getFormValues = () => {
  const formData = new FormData(formEl);
  return {
    customerId: formData.get("customerId")?.trim() || "",
    companyName: formData.get("companyName")?.trim() || "",
    email: formData.get("email")?.trim() || "",
    notes: formData.get("notes")?.trim() || "",
  };
};

/**
 * Apply validation errors to the form.
 * @param {Object} errors - Error map.
 */
const applyValidationErrors = (errors) => {
  Object.entries(errors).forEach(([name, message]) => {
    const field = formEl.elements[name];
    if (field) {
      UI.showFieldError(field, message);
    }
  });
};

/**
 * Toggle submit button loading state.
 * @param {boolean} isSubmitting - Whether submission is in progress.
 */
const setSubmitState = (isSubmitting) => {
  if (!submitButtonEl) return;
  submitButtonEl.disabled = isSubmitting;
  submitButtonEl.textContent = isSubmitting
    ? "Bestellung wird gesendet..."
    : "Bestellung senden";
};

/**
 * Validate the form and update the submit state.
 * @returns {boolean} Whether the form is valid.
 */
const validateForm = () => {
  const formValues = getFormValues();
  const result = Validation.validateCheckoutForm(formValues);
  if (!result.isValid) {
    applyValidationErrors(result.errors);
  }
  if (submitButtonEl) {
    submitButtonEl.disabled = !result.isValid;
  }
  return result.isValid;
};

/**
 * Handle blur validation on fields.
 * @param {FocusEvent} event - Blur event.
 */
const handleBlur = (event) => {
  const field = event.target;
  if (!field.name) return;
  UI.clearFieldError(field);
  validateForm();
};

/**
 * Handle input changes.
 */
const handleInput = () => {
  UI.clearAllFieldErrors(formEl);
  validateForm();
};

/**
 * Handle checkout form submission.
 * @param {Event} event - Submit event.
 */
const handleSubmit = async (event) => {
  event.preventDefault();
  UI.clearAllFieldErrors(formEl);
  const isValid = validateForm();
  if (!isValid) return;

  setSubmitState(true);
  UI.showLoading("Bestellung wird gesendet...");

  try {
    const cart = cartService.getCart();
    const formValues = getFormValues();
    const orderData = {
      customerId: formValues.customerId,
      companyName: formValues.companyName,
      email: formValues.email,
      notes: formValues.notes,
      items: cart,
      createdAt: new Date().toISOString(),
    };
    await dataService.submitOrder(orderData);
    cartService.clearCart();
    window.location.href = "confirmation.html";
  } catch (error) {
    UI.showError(
      "Bestellung konnte nicht gesendet werden. Bitte versuchen Sie es erneut."
    );
    setSubmitState(false);
  } finally {
    UI.hideLoading();
  }
};

/**
 * Load checkout summary data.
 */
const loadCheckout = async () => {
  UI.showLoading("Bestellübersicht wird geladen...");
  try {
    const data = await dataService.getProducts();
    renderSummary(data.products);
  } catch (error) {
    UI.showError(
      "Produktdaten konnten nicht geladen werden. Bitte laden Sie die Seite neu."
    );
  } finally {
    UI.hideLoading();
  }
};

if (formEl) {
  formEl.addEventListener("blur", handleBlur, true);
  formEl.addEventListener("input", handleInput);
  formEl.addEventListener("submit", handleSubmit);
}

if (cartButtonEl) {
  cartButtonEl.addEventListener("click", () => {
    if (!cartButtonEl.disabled) {
      window.location.href = "cart.html";
    }
  });
}

loadCheckout();
