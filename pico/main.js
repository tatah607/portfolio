const categoryFiltersEl = document.querySelector("#category-filters");
const productGridEl = document.querySelector("#product-grid");
const cartButtonEl = document.querySelector(".cart-button");
const searchInputEl = document.querySelector("#product-search");
const searchClearEl = document.querySelector(".search-clear");
const sortSelectEl = document.querySelector("#sort-select");
const noResultsEl = document.querySelector("#no-results");
const clearCategoriesEl = document.querySelector("#clear-categories");

let productData = null;
let activeSearch = "";
let activeCategories = new Set(["Alle Produkte"]);
let activeSort = "name-asc";

/**
 * Build product counts per category.
 * @param {Array<Object>} products - Product list.
 * @returns {Record<string, number>} Category counts.
 */
const buildCategoryCounts = (products) =>
  products.reduce((counts, product) => {
    const current = counts[product.category] || 0;
    counts[product.category] = current + 1;
    return counts;
  }, {});

/**
 * Render category filters.
 * @param {string[]} categories - Category list.
 * @param {Array<Object>} products - Product list.
 */
const renderCategories = (categories, products) => {
  if (!categoryFiltersEl) return;
  const counts = buildCategoryCounts(products);
  const filtered = categories.filter((category) => {
    if (category === "Alle Produkte") return true;
    return (counts[category] || 0) > 0;
  });
  const selected = filtered.filter(
    (category) =>
      category !== "Alle Produkte" && activeCategories.has(category)
  );
  const unselected = filtered.filter(
    (category) =>
      category !== "Alle Produkte" && !activeCategories.has(category)
  );
  const ordered = [
    "Alle Produkte",
    ...selected.filter((category) => category !== "Alle Produkte"),
    ...unselected,
  ].filter((category) => filtered.includes(category));

  categoryFiltersEl.innerHTML = ordered
    .map((category) => {
      const count =
        category === "Alle Produkte"
          ? products.length
          : counts[category] || 0;
      const checked = activeCategories.has(category) ? "checked" : "";
      return `
        <label class="category-item">
          <input type="checkbox" value="${category}" ${checked} />
          <span>${category}</span>
          <span class="category-count">(${count})</span>
        </label>
      `;
    })
    .join("");
};

/**
 * Render product cards.
 * @param {Array<Object>} products - Product list.
 * @param {Record<string, number>} cart - Cart map.
 */
const renderProducts = (products, cart) => {
  if (!productGridEl) return;
  productGridEl.innerHTML = products
    .map((product) => {
      const imageSrc = Utils.getProductImageUrl(product);
      const quantity = cart[product.id] || 0;
      const primaryPrice = Utils.getDisplayPrice(product);
      const hasEpPrice =
        (product.EP !== undefined && product.EP !== null) ||
        (product.ep !== undefined && product.ep !== null);
      const secondaryMarkup = hasEpPrice
        ? `<div class="price-secondary">EVP ${Utils.formatPrice(
            product.evp
          )}</div>`
        : "";
      const safeName = Utils.sanitizeInput(product.name);
      const safeProducer = Utils.sanitizeInput(product.producer);
      const safeComment = Utils.sanitizeInput(product.comment);
      const safeUnit = Utils.sanitizeInput(product.unit_type);
      const safeCountry = Utils.sanitizeInput(product.country);
      const safeQuality = Utils.sanitizeInput(product.quality);
      const safeArtNr = Utils.sanitizeInput(product.art_nr);
      const actionMarkup =
        quantity > 0
          ? `
            <div class="quantity-controls">
              <button class="btn-quantity" type="button" data-action="decrease">
                -
              </button>
              <input
                class="product-qty-input"
                type="number"
                min="0"
                value="${quantity}"
              />
              <button class="btn-quantity" type="button" data-action="increase">
                +
              </button>
            </div>
          `
          : `
            <button class="btn-primary" type="button" data-action="add">
              In den Warenkorb
            </button>
          `;
      return `
        <article class="product-card" data-product-id="${product.id}">
          <img class="product-image" src="${imageSrc}" alt="${safeName}" />
          <h3 class="product-name">${safeName}</h3>
          <div class="product-producer">${safeProducer}</div>
          <div class="product-comment">${safeComment}</div>
          <div class="price">EP ${Utils.formatPrice(primaryPrice)}</div>
          ${secondaryMarkup}
          <div class="meta-line">
            <span class="meta-badge">${safeUnit}</span>
            <span class="meta-badge">${safeCountry}</span>
            <span class="meta-badge">${safeQuality}</span>
          </div>
          <div class="article-number">Art. ${safeArtNr}</div>
          <div class="card-actions">${actionMarkup}</div>
        </article>
      `;
    })
    .join("");
  Utils.attachImageFallbacks(productGridEl);
};

/**
 * Normalize text for search matching.
 * @param {string} value - Input text.
 * @returns {string} Normalized value.
 */
const normalizeText = (value) => value.toLowerCase();

/**
 * Determine if product matches current search text.
 * @param {Object} product - Product item.
 * @param {string} searchValue - Search input.
 * @returns {boolean} Whether the product matches.
 */
const matchesSearch = (product, searchValue) => {
  if (!searchValue) return true;
  const needle = normalizeText(searchValue.trim());
  const haystack = [
    product.name,
    product.producer,
    product.category,
    product.art_nr,
  ]
    .filter(Boolean)
    .map(normalizeText)
    .join(" ");
  return haystack.includes(needle);
};

/**
 * Determine if product matches selected categories.
 * @param {Object} product - Product item.
 * @returns {boolean} Whether the product matches.
 */
const matchesCategory = (product) => {
  if (activeCategories.has("Alle Produkte")) return true;
  return activeCategories.has(product.category);
};

/**
 * Sort products by current selection.
 * @param {Array<Object>} products - Product list.
 * @returns {Array<Object>} Sorted list.
 */
const sortProducts = (products) => {
  const sorted = [...products];
  sorted.sort((a, b) => {
    switch (activeSort) {
      case "name-desc":
        return b.name.localeCompare(a.name, "de");
      case "price-asc":
        return Utils.getDisplayPrice(a) - Utils.getDisplayPrice(b);
      case "price-desc":
        return Utils.getDisplayPrice(b) - Utils.getDisplayPrice(a);
      case "name-asc":
      default:
        return a.name.localeCompare(b.name, "de");
    }
  });
  return sorted;
};

/**
 * Apply all active filters and render results.
 */
const applyFilters = () => {
  if (!productData) return;
  const cart = cartService.getCart();
  const filtered = productData.products.filter(
    (product) => matchesSearch(product, activeSearch) && matchesCategory(product)
  );
  const sorted = sortProducts(filtered);
  renderProducts(sorted, cart);
  if (noResultsEl) {
    noResultsEl.hidden = sorted.length > 0;
  }
};

const debouncedApplyFilters = UI.debounce(() => applyFilters());

/**
 * Update the search clear button state.
 */
const updateSearchClear = () => {
  if (!searchClearEl) return;
  const hasValue = activeSearch.trim().length > 0;
  searchClearEl.disabled = !hasValue;
  searchClearEl.classList.toggle("is-active", hasValue);
};

/**
 * Update cart quantities for a product and re-render.
 * @param {string} productId - Product ID.
 * @param {number} delta - Quantity change.
 */
const updateCartForProduct = (productId, delta) => {
  const cart = cartService.adjustQuantity(productId, delta);
  const total = Utils.getCartTotal(productData?.products || [], cart);
  UI.updateCartButton(cartService.getCartCount(cart), total);
  if (productData) {
    applyFilters();
  }
};

/**
 * Set cart quantity for a product and re-render.
 * @param {string} productId - Product ID.
 * @param {number} nextQty - New quantity.
 */
const setCartForProduct = (productId, nextQty) => {
  const cart = cartService.setQuantity(productId, nextQty);
  const total = Utils.getCartTotal(productData?.products || [], cart);
  UI.updateCartButton(cartService.getCartCount(cart), total);
  if (productData) {
    applyFilters();
  }
};

/**
 * Handle click events on product grid actions.
 * @param {MouseEvent} event - Click event.
 */
const handleGridClick = (event) => {
  const action = event.target.dataset.action;
  if (!action) return;
  const card = event.target.closest(".product-card");
  if (!card) return;
  const productId = card.dataset.productId;
  if (!productId) return;
  if (action === "add") {
    updateCartForProduct(productId, 1);
  } else if (action === "increase") {
    updateCartForProduct(productId, 1);
  } else if (action === "decrease") {
    updateCartForProduct(productId, -1);
  }
};

/**
 * Handle blur events for product quantity input.
 * @param {FocusEvent} event - Blur event.
 */
const handleQtyBlur = (event) => {
  if (!event.target.classList.contains("product-qty-input")) return;
  const card = event.target.closest(".product-card");
  if (!card) return;
  const productId = card.dataset.productId;
  if (!productId) return;
  const nextQty = Number.parseInt(event.target.value, 10);
  if (Number.isNaN(nextQty) || nextQty < 1) {
    setCartForProduct(productId, 0);
  } else {
    setCartForProduct(productId, nextQty);
  }
};

/**
 * Handle Enter key for product quantity input.
 * @param {KeyboardEvent} event - Keydown event.
 */
const handleQtyKeydown = (event) => {
  if (!event.target.classList.contains("product-qty-input")) return;
  if (event.key === "Enter") {
    event.preventDefault();
    event.target.blur();
  }
};

/**
 * Load products from JSON and initialize UI.
 */
const loadProducts = async () => {
  UI.showLoading("Produkte werden geladen...");
  try {
    const data = await dataService.getProducts();
    productData = data;
    const cart = cartService.getCart();
    const total = Utils.getCartTotal(productData.products, cart);
    UI.updateCartButton(cartService.getCartCount(cart), total);
    renderCategories(data.categories, data.products);
    renderProducts(data.products, cart);
    applyFilters();
  } catch (error) {
    UI.showError(
      "Produkte konnten nicht geladen werden. Bitte laden Sie die Seite neu."
    );
  } finally {
    UI.hideLoading();
  }
};

if (productGridEl) {
  productGridEl.addEventListener("click", handleGridClick);
  productGridEl.addEventListener("blur", handleQtyBlur, true);
  productGridEl.addEventListener("keydown", handleQtyKeydown, true);
}

if (categoryFiltersEl) {
  categoryFiltersEl.addEventListener("change", (event) => {
    const checkbox = event.target;
    if (checkbox.type !== "checkbox") return;
    const value = checkbox.value;
    if (value === "Alle Produkte") {
      if (checkbox.checked) {
        activeCategories = new Set(["Alle Produkte"]);
        categoryFiltersEl
          .querySelectorAll("input[type='checkbox']")
          .forEach((input) => {
            if (input.value !== "Alle Produkte") {
              input.checked = false;
            }
          });
      } else {
        checkbox.checked = true;
      }
    } else {
      const allCheckbox = categoryFiltersEl.querySelector(
        "input[value='Alle Produkte']"
      );
      if (checkbox.checked) {
        activeCategories.add(value);
        activeCategories.delete("Alle Produkte");
        if (allCheckbox) allCheckbox.checked = false;
      } else {
        activeCategories.delete(value);
        if (activeCategories.size === 0 && allCheckbox) {
          allCheckbox.checked = true;
          activeCategories.add("Alle Produkte");
        }
      }
    }
    renderCategories(productData.categories, productData.products);
    applyFilters();
  });
}

if (searchInputEl) {
  searchInputEl.addEventListener("input", (event) => {
    activeSearch = event.target.value;
    updateSearchClear();
    const trimmed = activeSearch.trim();
    if (trimmed.length === 0) {
      applyFilters();
      return;
    }
    if (trimmed.length < 2) return;
    debouncedApplyFilters();
  });
}

if (searchClearEl) {
  searchClearEl.addEventListener("click", () => {
    if (searchClearEl.disabled) return;
    activeSearch = "";
    if (searchInputEl) searchInputEl.value = "";
    updateSearchClear();
    applyFilters();
  });
}

if (sortSelectEl) {
  sortSelectEl.addEventListener("change", (event) => {
    activeSort = event.target.value;
    applyFilters();
  });
}

if (cartButtonEl) {
  cartButtonEl.addEventListener("click", () => {
    if (!cartButtonEl.disabled) {
      window.location.href = "cart.html";
    }
  });
}

loadProducts();

if (clearCategoriesEl) {
  clearCategoriesEl.addEventListener("click", () => {
    activeCategories = new Set(["Alle Produkte"]);
    if (productData) {
      renderCategories(productData.categories, productData.products);
      applyFilters();
    }
  });
}

