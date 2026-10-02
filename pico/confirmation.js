const orderNumberEl = document.querySelector("#order-number");
const orderDetailsEl = document.querySelector("#order-details");
const orderItemsEl = document.querySelector("#order-items");
const orderTotalEl = document.querySelector("#order-total-amount");

/**
 * Render order header details.
 * @param {Object} order - Order data.
 */
const renderOrderDetails = (order) => {
  if (!orderDetailsEl) return;
  const lines = [
    `Kunden-ID: ${Utils.sanitizeInput(order.customerId)}`,
    `Firma: ${Utils.sanitizeInput(order.companyName)}`,
    `E-Mail: ${Utils.sanitizeInput(order.email)}`,
  ];
  if (order.notes) {
    lines.push(`Bemerkungen: ${Utils.sanitizeInput(order.notes)}`);
  }
  orderDetailsEl.innerHTML = lines.map((line) => `<div>${line}</div>`).join("");
};

/**
 * Render order items and totals.
 * @param {Array<Object>} products - Product list.
 * @param {Object} order - Order data.
 */
const renderOrderItems = (products, order) => {
  if (!orderItemsEl || !orderTotalEl) return;
  const productMap = products.reduce((map, product) => {
    map[product.id] = product;
    return map;
  }, {});

  let total = 0;
  const itemsMarkup = Object.entries(order.items || {})
    .map(([productId, quantity]) => {
      const product = productMap[productId];
      if (!product) return "";
      const lineTotal = Utils.getDisplayPrice(product) * quantity;
      total += lineTotal;
      const safeName = Utils.sanitizeInput(product.name);
      const safeArtNr = Utils.sanitizeInput(product.art_nr);
      return `
        <div class="order-line">
          <div>${safeName}</div>
          <div>
            Art. ${safeArtNr} • ${quantity}× ${Utils.formatPrice(
              Utils.getDisplayPrice(product)
            )} =
            ${Utils.formatPrice(lineTotal)}
          </div>
        </div>
      `;
    })
    .join("");

  orderItemsEl.innerHTML = itemsMarkup;
  orderTotalEl.textContent = Utils.formatPrice(total);
};

/**
 * Render order number.
 * @param {Object} order - Order data.
 */
const renderOrderNumber = (order) => {
  if (!orderNumberEl) return;
  orderNumberEl.textContent = `Bestellnummer: #${order.order_id}`;
};

/**
 * Load confirmation data and render UI.
 */
const loadConfirmation = async () => {
  const order = dataService.getLastOrder();
  if (!order) {
    UI.showError("Bestellung konnte nicht gefunden werden.");
    if (orderNumberEl) {
      orderNumberEl.textContent = "Bestellnummer: #—";
    }
    return;
  }

  renderOrderNumber(order);
  renderOrderDetails(order);

  UI.showLoading("Bestellung wird geladen...");
  try {
    const data = await dataService.getProducts();
    renderOrderItems(data.products, order);
  } catch (error) {
    UI.showError(
      "Produktdaten konnten nicht geladen werden. Bitte laden Sie die Seite neu."
    );
  } finally {
    UI.hideLoading();
  }
};

if (orderNumberEl) {
  orderNumberEl.addEventListener("click", async () => {
    const text = orderNumberEl.textContent || "";
    const orderNumber = text.replace("Bestellnummer: ", "");
    try {
      await navigator.clipboard.writeText(orderNumber);
      orderNumberEl.textContent = "Bestellnummer kopiert";
      setTimeout(() => {
        orderNumberEl.textContent = text;
      }, 1500);
    } catch (error) {
      UI.showError("Bestellnummer konnte nicht kopiert werden.");
    }
  });
}

loadConfirmation();
