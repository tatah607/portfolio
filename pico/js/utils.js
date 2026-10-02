/**
 * General utility helpers.
 */
const Utils = {
  /**
   * Format a CHF price.
   * @param {number} amount - Price value.
   * @returns {string} Formatted price.
   */
  formatPrice(amount) {
    return `CHF ${amount.toFixed(2)}`;
  },

  /**
   * Format date for display (DD.MM.YYYY).
   * @param {string|Date} date - Date value.
   * @returns {string} Formatted date.
   */
  formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  },

  /**
   * Get product image URL with placeholder fallback.
   * @param {Object} product - Product data.
   * @returns {string} Image URL.
   */
  getProductImageUrl(product) {
    if (product.image_url) {
      return product.image_url;
    }
    if (product.image) {
      return `assets/${product.image}`;
    }
    return CONFIG.ASSETS.PLACEHOLDER_IMAGE;
  },

  /**
   * Sanitize user input for display.
   * @param {string} value - Input string.
   * @returns {string} Sanitized string.
   */
  sanitizeInput(value) {
    if (!value) return "";
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
  },

  /**
   * Get the primary display price for a product.
   * @param {Object} product - Product data.
   * @returns {number} Price value.
   */
  getDisplayPrice(product) {
    if (!product) return 0;
    if (product.EP !== undefined && product.EP !== null) {
      return product.EP;
    }
    if (product.ep !== undefined && product.ep !== null) {
      return product.ep;
    }
    return product.evp ?? 0;
  },

  /**
   * Compute cart total from product list and cart map.
   * @param {Array<Object>} products - Product list.
   * @param {Record<string, number>} cart - Cart map.
   * @returns {number} Cart total.
   */
  getCartTotal(products, cart) {
    const productMap = products.reduce((map, product) => {
      map[product.id] = product;
      return map;
    }, {});
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = productMap[productId];
      if (!product) return total;
      return total + this.getDisplayPrice(product) * quantity;
    }, 0);
  },

  /**
   * Attach image fallback handlers within a container.
   * @param {HTMLElement} container - Container element.
   */
  attachImageFallbacks(container) {
    if (!container) return;
    const images = container.querySelectorAll("img");
    images.forEach((img) => {
      if (img.dataset.fallbackAttached) return;
      img.dataset.fallbackAttached = "true";
      img.addEventListener(
        "error",
        () => {
          img.src = CONFIG.ASSETS.PLACEHOLDER_IMAGE;
        },
        { once: true }
      );
    });
  },
};
