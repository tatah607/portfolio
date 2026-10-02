/**
 * Cart Service - manages cart state in localStorage.
 */
class CartService {
  constructor() {
    this.storageKey = CONFIG.STORAGE.CART;
  }

  /**
   * Get cart map from storage.
   * @returns {Record<string, number>} Cart map.
   */
  getCart() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("Pico Bio Katalog: Warenkorb konnte nicht gelesen werden.");
      return {};
    }
  }

  /**
   * Persist cart map to storage.
   * @param {Record<string, number>} cart - Cart map.
   */
  setCart(cart) {
    localStorage.setItem(this.storageKey, JSON.stringify(cart));
  }

  /**
   * Get total quantity for cart.
   * @param {Record<string, number>} cart - Cart map.
   * @returns {number} Total quantity.
   */
  getCartCount(cart) {
    return Object.values(cart).reduce((total, qty) => total + qty, 0);
  }

  /**
   * Set quantity for a product.
   * @param {string} productId - Product ID.
   * @param {number} nextQty - Quantity value.
   * @returns {Record<string, number>} Updated cart map.
   */
  setQuantity(productId, nextQty) {
    const cart = this.getCart();
    if (nextQty <= 0) {
      delete cart[productId];
    } else {
      cart[productId] = nextQty;
    }
    this.setCart(cart);
    return cart;
  }

  /**
   * Adjust quantity by delta.
   * @param {string} productId - Product ID.
   * @param {number} delta - Quantity change.
   * @returns {Record<string, number>} Updated cart map.
   */
  adjustQuantity(productId, delta) {
    const cart = this.getCart();
    const current = cart[productId] || 0;
    const next = current + delta;
    if (next <= 0) {
      delete cart[productId];
    } else {
      cart[productId] = next;
    }
    this.setCart(cart);
    return cart;
  }

  /**
   * Clear entire cart.
   * @returns {Record<string, number>} Empty cart map.
   */
  clearCart() {
    const cart = {};
    this.setCart(cart);
    return cart;
  }
}

const cartService = new CartService();
