const cartItemsEl = document.querySelector("#cart-items");
const cartTotalEl = document.querySelector("#cart-total-amount");
const cartTotalBottomEl = document.querySelector("#cart-total-amount-bottom");
const cartButtonEl = document.querySelector(".cart-button");
const checkoutButtonEls = document.querySelectorAll(".cart-summary .btn-primary");

let cartProducts = [];

/**
 * Render all cart items and totals.
 * @param {Array<Object>} products - Product list.
 */
const renderCart = (products) => {
  const cart = cartService.getCart();

  const productMap = products.reduce((map, product) => {
    map[product.id] = product;
    return map;
  }, {});

  let total = 0;
  const itemMarkup = Object.entries(cart)
    .map(([productId, quantity]) => {
      const product = productMap[productId];
      if (!product) return "";
      const lineTotal = Utils.getDisplayPrice(product) * quantity;
      total += lineTotal;
      const imageSrc = Utils.getProductImageUrl(product);
      const safeName = Utils.sanitizeInput(product.name);
      const safeProducer = Utils.sanitizeInput(product.producer);
      const safeComment = Utils.sanitizeInput(product.comment);
      return `
        <article class="cart-item" data-product-id="${productId}">
          <img
            class="cart-thumb"
            src="${imageSrc}"
            alt="${safeName}"
          />
          <div class="cart-details">
            <div class="cart-name">${safeName}</div>
            <div class="cart-meta">${safeProducer}</div>
            <div class="cart-meta">${safeComment}</div>
            <div class="cart-controls">
              <button
                class="btn-quantity"
                type="button"
                data-action="decrease"
              >
                -
              </button>
              <input
                class="cart-qty-input"
                type="number"
                min="0"
                value="${quantity}"
              />
              <button
                class="btn-quantity"
                type="button"
                data-action="increase"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <button class="cart-remove" type="button" data-action="remove">
              ×
            </button>
            <div class="cart-line-total">${Utils.formatPrice(lineTotal)}</div>
          </div>
        </article>
      `;
    })
    .join("");

  if (cartItemsEl) {
    cartItemsEl.innerHTML = itemMarkup;
    Utils.attachImageFallbacks(cartItemsEl);
  }
  if (cartTotalEl) {
    cartTotalEl.textContent = Utils.formatPrice(total);
  }
  if (cartTotalBottomEl) {
    cartTotalBottomEl.textContent = Utils.formatPrice(total);
  }
  UI.updateCartButton(cartService.getCartCount(cart), total);
};

/**
 * Load product data and render cart page.
 */
const loadCartPage = async () => {
  UI.showLoading("Warenkorb wird geladen...");
  try {
    const data = await dataService.getProducts();
    cartProducts = data.products;
    renderCart(cartProducts);
  } catch (error) {
    UI.showError(
      "Produktdaten konnten nicht geladen werden. Bitte laden Sie die Seite neu."
    );
  } finally {
    UI.hideLoading();
  }
};

/**
 * Update cart quantity for a given product.
 * @param {string} productId - Product ID.
 * @param {number} nextQty - New quantity.
 */
const updateCartForProduct = (productId, nextQty) => {
  const cart = cartService.setQuantity(productId, nextQty);
  const total = Utils.getCartTotal(cartProducts, cart);
  UI.updateCartButton(cartService.getCartCount(cart), total);
};

/**
 * Handle click actions in the cart list.
 * @param {MouseEvent} event - Click event.
 */
const handleCartClick = (event) => {
  const action = event.target.dataset.action;
  if (!action) return;
  if (!["decrease", "increase", "remove"].includes(action)) return;
  const item = event.target.closest(".cart-item");
  if (!item) return;
  const productId = item.dataset.productId;
  if (!productId) return;
  const cart = cartService.getCart();
  const currentQty = cart[productId] || 0;
  if (action === "decrease") {
    updateCartForProduct(productId, currentQty - 1);
  } else if (action === "increase") {
    updateCartForProduct(productId, currentQty + 1);
  } else if (action === "remove") {
    updateCartForProduct(productId, 0);
  }
  renderCart(cartProducts);
};

/**
 * Handle blur events for quantity input.
 * @param {FocusEvent} event - Blur event.
 */
const handleQtyBlur = (event) => {
  if (!event.target.classList.contains("cart-qty-input")) return;
  const item = event.target.closest(".cart-item");
  if (!item) return;
  const productId = item.dataset.productId;
  if (!productId) return;
  const nextQty = Number.parseInt(event.target.value, 10);
  if (Number.isNaN(nextQty) || nextQty < 1) {
    updateCartForProduct(productId, 0);
  } else {
    updateCartForProduct(productId, nextQty);
  }
  renderCart(cartProducts);
};

/**
 * Handle Enter key for quantity input.
 * @param {KeyboardEvent} event - Keydown event.
 */
const handleQtyKeydown = (event) => {
  if (!event.target.classList.contains("cart-qty-input")) return;
  if (event.key === "Enter") {
    event.preventDefault();
    event.target.blur();
  }
};

if (checkoutButtonEls.length > 0) {
  checkoutButtonEls.forEach((button) => {
    button.addEventListener("click", () => {
      window.location.href = "checkout.html";
    });
  });
}

if (cartItemsEl) {
  cartItemsEl.addEventListener("click", handleCartClick);
  cartItemsEl.addEventListener("blur", handleQtyBlur, true);
  cartItemsEl.addEventListener("keydown", handleQtyKeydown, true);
}

loadCartPage();

