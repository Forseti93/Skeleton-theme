document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Tabs Logic ---
  const tabButtons = document.querySelectorAll(".bs-tab-btn");
  const tabPanes = document.querySelectorAll(".bs-pane");

  tabButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      if (button.classList.contains("is-active")) return;

      const targetId = button.getAttribute("data-target");

      tabButtons.forEach((btn) => btn.classList.remove("is-active"));
      tabPanes.forEach((pane) => pane.classList.remove("is-active"));

      button.classList.add("is-active");
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add("is-active");
      }
    });
  });

  // --- 2. Wishlist Modal Logic (Dynamic Scroll Spacer) ---
  const wishlistButtons = document.querySelectorAll("[data-wishlist-btn]");
  const modal = document.getElementById("bs-wishlist-modal");
  const modalText = document.getElementById("bs-modal-text");
  const closeTriggers = document.querySelectorAll("[data-modal-close]");

  const getScrollbarWidth = () => {
    // Check if the page is actually tall enough to have a scrollbar
    const isScrollable =
      document.documentElement.scrollHeight > window.innerHeight;
    if (!isScrollable) return 0;

    // Physically measure scrollbar width (returns 0 on mobile/macOS overlay scrollbars)
    const outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.overflow = "scroll";
    document.body.appendChild(outer);

    const inner = document.createElement("div");
    outer.appendChild(inner);

    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    outer.parentNode.removeChild(outer);

    return scrollbarWidth;
  };

  const openModal = (productName) => {
    modalText.innerHTML = `<strong>${productName}</strong> has been added to your wishlist.`;

    const scrollbarWidth = getScrollbarWidth();

    // Only add the spacer if there is actually a visible physical scrollbar
    if (scrollbarWidth > 0) {
      // Create and inject the spacer div to fill the gap on the right
      const spacer = document.createElement("div");
      spacer.id = "bs-scroll-spacer";
      spacer.style.width = `${scrollbarWidth}px`;
      spacer.style.height = "100vh";
      spacer.style.position = "fixed";
      spacer.style.top = "0";
      spacer.style.right = "0";
      spacer.style.zIndex = "99999";
      document.body.appendChild(spacer);

      // Add right padding to the body so the main centered content doesn't jump
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.documentElement.classList.add("bs-scroll-lock");
    document.body.classList.add("bs-scroll-lock");

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");

    // Release scrollbar lock and remove injected div/padding after transition
    setTimeout(() => {
      document.documentElement.classList.remove("bs-scroll-lock");
      document.body.classList.remove("bs-scroll-lock");

      document.body.style.paddingRight = "";
      const spacer = document.getElementById("bs-scroll-spacer");
      if (spacer) {
        spacer.remove();
      }
    }, 300);
  };

  wishlistButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const productName = btn.getAttribute("data-product-name");
      openModal(productName);
    });
  });

  closeTriggers.forEach((trigger) => {
    trigger.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.classList.contains("is-open")) {
      closeModal();
    }
  });

  // --- 3. Quick Add Logic ---
  const quickAddButtons = document.querySelectorAll("[data-quick-add-btn]");

  quickAddButtons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (btn.disabled) return;

      const variantId = btn.getAttribute("data-variant-id");
      const originalContent = btn.innerHTML;

      btn.innerHTML = `<span style="font-size: 12px; font-weight: bold;">...</span>`;
      btn.disabled = true;

      try {
        const formData = {
          items: [
            {
              id: parseInt(variantId),
              quantity: 1,
            },
          ],
        };

        const response = await fetch(
          `${window.Shopify?.routes?.root || "/"}cart/add.js`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          },
        );

        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();

        // Dispatch events for drawer updates
        document.dispatchEvent(
          new CustomEvent("cart:updated", { bubbles: true }),
        );
        document.dispatchEvent(
          new CustomEvent("ajaxProduct:added", { detail: { product: data } }),
        );

        btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      } catch (error) {
        console.error("Error adding to cart:", error);
        alert("There was a problem adding the item to your cart.");
      } finally {
        setTimeout(() => {
          btn.innerHTML = originalContent;
          btn.disabled = false;
        }, 2000);
      }
    });
  });
});
