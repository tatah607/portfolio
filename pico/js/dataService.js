/**
 * Data Service - handles product loading and order submission.
 * Switches between local and API mode based on CONFIG.MODE.
 */
class DataService {
  constructor() {
    this.mode = CONFIG.MODE;
  }

  /**
   * Get all products.
   * @returns {Promise<Object>} Product payload.
   * @throws {Error} When products cannot be loaded.
   */
  async getProducts() {
    try {
      if (this.mode === "local") {
        return await this._getProductsLocal();
      }
      return await this._getProductsAPI();
    } catch (error) {
      console.error("Pico Bio Katalog: Fehler beim Laden der Produkte.", error);
      throw new Error("Produkte konnten nicht geladen werden.");
    }
  }

  /**
   * Submit an order.
   * @param {Object} orderData - Order payload.
   * @returns {Promise<Object>} Order result.
   * @throws {Error} When submission fails.
   */
  async submitOrder(orderData) {
    try {
      if (this.mode === "local") {
        return await this._submitOrderLocal(orderData);
      }
      return await this._submitOrderAPI(orderData);
    } catch (error) {
      console.error("Pico Bio Katalog: Fehler beim Senden der Bestellung.", error);
      throw new Error("Bestellung konnte nicht gesendet werden.");
    }
  }

  /**
   * Get last stored order (local mode only).
   * @returns {Object|null} Order data.
   */
  getLastOrder() {
    try {
      const stored = localStorage.getItem(CONFIG.STORAGE.ORDER);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Pico Bio Katalog: Bestellung konnte nicht gelesen werden.");
      return null;
    }
  }

  /**
   * Load products from local JSON.
   * @private
   * @returns {Promise<Object>} Product payload.
   */
  async _getProductsLocal() {
    const response = await fetch(CONFIG.DATA.PRODUCTS_JSON);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.products || !Array.isArray(data.products)) {
      throw new Error("Ungültige Produktdatenstruktur.");
    }
    return data;
  }

  /**
   * Load products from API (future integration).
   * @private
   * @returns {Promise<Object>} Product payload.
   */
  async _getProductsAPI() {
    const url = `${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.PRODUCTS}`;
    const response = await fetch(url, {
      method: "GET",
      headers: this._getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  }

  /**
   * Submit order locally (mock persistence).
   * @private
   * @param {Object} orderData - Order payload.
   * @returns {Promise<Object>} Order result.
   */
  async _submitOrderLocal(orderData) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const orderId = this._generateOrderId();
    const order = {
      ...orderData,
      order_id: orderId,
      status: "received",
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(CONFIG.STORAGE.ORDER, JSON.stringify(order));
    return { order_id: orderId, status: "received" };
  }

  /**
   * Submit order to API (future integration).
   * @private
   * @param {Object} orderData - Order payload.
   * @returns {Promise<Object>} Order result.
   */
  async _submitOrderAPI(orderData) {
    const url = `${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.ORDERS}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this._getAuthHeaders(),
      },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  }

  /**
   * Get auth headers for API calls.
   * No token is set here — authentication is handled by the backend proxy.
   * @private
   * @returns {Object} Headers object.
   */
  _getAuthHeaders() {
    return {};
  }

  /**
   * Generate order ID in format YYYYMMDD-XXXX.
   * @private
   * @returns {string} Order ID.
   */
  _generateOrderId() {
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");
    const storedCounter = localStorage.getItem(CONFIG.STORAGE.ORDER_COUNTER);
    let counter = 1;
    if (storedCounter) {
      const [storedDate, storedValue] = storedCounter.split(":");
      if (storedDate === datePart) {
        counter = Number.parseInt(storedValue, 10) + 1;
      }
    }
    const padded = String(counter).padStart(4, "0");
    localStorage.setItem(CONFIG.STORAGE.ORDER_COUNTER, `${datePart}:${counter}`);
    return `${datePart}-${padded}`;
  }
}

const dataService = new DataService();
