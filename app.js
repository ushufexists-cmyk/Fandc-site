// app.js
// F&A collection single-page logic
(() => {
  // Replace this phone number if needed:
  const SELLER_PHONE = "919798303821";

  // Products: 3 wrist watches, 1 stopwatch, 1 alarm clock
  // image paths are placeholders (images/wrist1.png etc). Replace later.
  const products = [
    {
      id: "w1",
      name: "Aurora Classic",
      category: "Wrist Watch",
      price: 3499,
      image: "images/wrist1.png",
      desc: "A minimal wrist watch with refined silhouette. (placeholder desc.)"
    },
    {
      id: "w2",
      name: "Nocturne Slim",
      category: "Wrist Watch",
      price: 4299,
      image: "images/wrist2.png",
      desc: "Sleek case and understated dial — modern vintage vibes."
    },
    {
      id: "w3",
      name: "Citrine Sport",
      category: "Wrist Watch",
      price: 2899,
      image: "images/wrist3.png",
      desc: "Sporty build, water resistant-ish (portfolio-only)."
    },
    {
      id: "s1",
      name: "Tempo Pro Stopwatch",
      category: "Stopwatch",
      price: 999,
      image: "images/stopwatch1.png",
      desc: "Precision timing for the track or the kitchen."
    },
    {
      id: "a1",
      name: "Morning Bell Alarm",
      category: "Alarm Clock",
      price: 1499,
      image: "images/alarm1.png",
      desc: "Retro alarm clock with a gentle chime."
    }
  ];

  // Simple cart stored in localStorage as array of {id, qty}
  const CART_KEY = "fa_portfolio_cart_v1";

  function readCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function writeCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  }

  function addToCart(productId, qty = 1) {
    const cart = readCart();
    const existing = cart.find(i => i.id === productId);
    if (existing) existing.qty += qty;
    else cart.push({ id: productId, qty });
    writeCart(cart);
  }

  function removeFromCart(productId) {
    let cart = readCart();
    cart = cart.filter(i => i.id !== productId);
    writeCart(cart);
  }

  function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartCount();
  }

  function updateCartCount() {
    const cart = readCart();
    const count = cart.reduce((s, i) => s + i.qty, 0);
    document.getElementById("cart-count").textContent = count;
  }

  // Helpers
  function getProductById(id) {
    return products.find(p => p.id === id);
  }

  function formatPrice(n) {
    return `₹${n.toLocaleString("en-IN")}`;
  }

  // DOM elements
  const categoriesEl = document.getElementById("categories");
  const productsEl = document.getElementById("products");
  const backToCats = document.getElementById("back-to-cats");
  const showCatsBtn = document.getElementById("show-categories");

  const productModal = document.getElementById("product-modal");
  const modalImage = document.getElementById("modal-image");
  const modalName = document.getElementById("modal-name");
  const modalDesc = document.getElementById("modal-desc");
  const modalPrice = document.getElementById("modal-price");
  const addToCartBtn = document.getElementById("add-to-cart");
  const buyNowWhatsapp = document.getElementById("buy-now-whatsapp");
  const closeModalBtn = document.getElementById("close-modal");

  const cartModal = document.getElementById("cart-modal");
  const openCartBtn = document.getElementById("open-cart");
  const closeCartBtn = document.getElementById("close-cart");
  const cartItemsEl = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");
  const clearCartBtn = document.getElementById("clear-cart");
  const buyCartWhatsapp = document.getElementById("buy-cart-whatsapp");

  // Render functions
  function renderProductsForCategory(category) {
    productsEl.innerHTML = "";
    const filtered = products.filter(p => p.category === category);
    if (filtered.length === 0) {
      productsEl.innerHTML = `<p style="color:var(--muted);">No products in "${category}" yet.</p>`;
      return;
    }
    filtered.forEach(p => {
      const card = document.createElement("article");
      card.className = "product";
      card.innerHTML = `
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
        <h4>${p.name}</h4>
        <p class="desc">${p.desc}</p>
        <div style="display:flex;gap:.5rem;width:100%;align-items:center;justify-content:space-between;">
          <div class="price">${formatPrice(p.price)}</div>
          <div class="product-actions">
            <button class="cta-button view-btn" data-id="${p.id}">View</button>
            <button class="cta-button" data-id="${p.id}" data-action="add">Add</button>
          </div>
        </div>
      `;
      productsEl.appendChild(card);
    });

    // wire up view and add buttons
    productsEl.querySelectorAll(".view-btn").forEach(b => {
      b.addEventListener("click", e => openProductModal(e.target.dataset.id));
    });
    productsEl.querySelectorAll("button[data-action='add']").forEach(b => {
      b.addEventListener("click", e => {
        addToCart(e.target.dataset.id, 1);
        flashText("Added to cart");
      });
    });
  }

  function openProductModal(productId) {
    const p = getProductById(productId);
    if (!p) return;
    modalImage.src = p.image;
    modalImage.alt = p.name;
    modalName.textContent = p.name;
    modalDesc.textContent = p.desc;
    modalPrice.textContent = formatPrice(p.price);

    addToCartBtn.dataset.id = p.id;
    buyNowWhatsapp.href = makeWhatsappLinkForItem(p);

    productModal.setAttribute("aria-hidden", "false");
  }
  function closeProductModal() {
    productModal.setAttribute("aria-hidden", "true");
  }

  function openCartModal() {
    renderCartContents();
    cartModal.setAttribute("aria-hidden", "false");
  }
  function closeCartModal() {
    cartModal.setAttribute("aria-hidden", "true");
  }

  function renderCartContents() {
    const cart = readCart();
    cartItemsEl.innerHTML = "";
    if (cart.length === 0) {
      cartItemsEl.innerHTML = `<p style="color:var(--muted)">Your cart is empty.</p>`;
      cartTotalEl.textContent = formatPrice(0);
      buyCartWhatsapp.href = makeWhatsappLinkForCart([]);
      return;
    }
    let total = 0;
    cart.forEach(item => {
      const p = getProductById(item.id);
      if (!p) return;
      const subtotal = p.price * item.qty;
      total += subtotal;
      const el = document.createElement("div");
      el.className = "cart-item";
      el.innerHTML = `
        <img src="${p.image}" alt="${p.name}" />
        <div class="meta">
          <h4>${p.name}</h4>
          <p>${item.qty} × ${formatPrice(p.price)} = <strong>${formatPrice(subtotal)}</strong></p>
        </div>
        <div style="display:flex;flex-direction:column; gap:4px; align-items:flex-end;">
          <button class="cta-button" data-id="${p.id}" data-action="buy">Buy</button>
          <button class="remove" data-id="${p.id}" title="Remove">Remove</button>
        </div>
      `;
      cartItemsEl.appendChild(el);
    });

    cartTotalEl.textContent = formatPrice(total);

    // wire up buy and remove buttons
    cartItemsEl.querySelectorAll("button[data-action='buy']").forEach(b => {
      b.addEventListener("click", e => {
        const id = e.target.dataset.id;
        const p = getProductById(id);
        window.open(makeWhatsappLinkForItem(p), "_blank");
      });
    });
    cartItemsEl.querySelectorAll("button.remove").forEach(b => {
      b.addEventListener("click", e => {
        removeFromCart(e.target.dataset.id);
        renderCartContents();
        flashText("Removed");
      });
    });

    buyCartWhatsapp.href = makeWhatsappLinkForCart(cart);
  }

  // WhatsApp message helpers
  function makeWhatsappLinkForItem(product) {
    // include product name, price, and image url in message
    const msg = `Hello, I want to buy *${product.name}*.\nPrice: ${formatPrice(product.price)}\nImage: ${location.origin + "/" + product.image}\nPlease assist.`;
    return `https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(msg)}`;
  }

  function makeWhatsappLinkForCart(cart) {
    if (!cart || cart.length === 0) {
      const msgEmpty = `Hello, I'm interested in your collection. Please share details.`;
      return `https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(msgEmpty)}`;
    }
    let lines = [`Hello, I'd like to order the following from F&A portfolio:`];
    let total = 0;
    cart.forEach(item => {
      const p = getProductById(item.id);
      if (!p) return;
      lines.push(`${item.qty} × ${p.name} — ${formatPrice(p.price)} (img: ${location.origin + "/" + p.image})`);
      total += p.price * item.qty;
    });
    lines.push(`Total: ${formatPrice(total)}`);
    lines.push(`Please confirm the order and payment method.`);
    const full = lines.join("\n");
    return `https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(full)}`;
  }

  // Small UI helpers
  function flashText(text) {
    const el = document.createElement("div");
    el.style.position = "fixed";
    el.style.bottom = "18px";
    el.style.left = "50%";
    el.style.transform = "translateX(-50%)";
    el.style.background = "var(--green)";
    el.style.color = "#fff";
    el.style.padding = "0.6rem 1rem";
    el.style.borderRadius = "999px";
    el.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
    el.style.zIndex = 2000;
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.style.opacity = "0", 1200);
    setTimeout(() => el.remove(), 1600);
  }

  // Events
  // Categories clickable
  categoriesEl.querySelectorAll(".category-card").forEach(card => {
    card.addEventListener("click", () => {
      const cat = card.dataset.category;
      categoriesEl.style.display = "none";
      renderProductsForCategory(cat);
      backToCats.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  showCatsBtn.addEventListener("click", () => {
    categoriesEl.style.display = "";
    productsEl.innerHTML = "";
    backToCats.style.display = "none";
  });

  // Modal controls
  closeModalBtn.addEventListener("click", closeProductModal);
  productModal.addEventListener("click", (e) => {
    if (e.target === productModal) closeProductModal();
  });

  addToCartBtn.addEventListener("click", (e) => {
    const id = e.target.dataset.id;
    if (!id) return;
    addToCart(id, 1);
    flashText("Added to cart");
    closeProductModal();
  });

  // Cart controls
  openCartBtn.addEventListener("click", openCartModal);
  closeCartBtn.addEventListener("click", closeCartModal);
  cartModal.addEventListener("click", (e) => {
    if (e.target === cartModal) closeCartModal();
  });
  clearCartBtn.addEventListener("click", () => {
    clearCart();
    renderCartContents();
  });
  buyCartWhatsapp.addEventListener("click", () => {
    // link already set; nothing else required
    // close cart to not block
    setTimeout(() => closeCartModal(), 600);
  });

  // initial render
  updateCartCount();

  // Optional: show all categories by default (no products)
  // If you want to auto-open first category uncomment this:
  // renderProductsForCategory("Wrist Watch");

  // Accessibility: close modals with Esc
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeProductModal();
      closeCartModal();
    }
  });

})();