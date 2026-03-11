document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Tabs Logic ---
  const tabButtons = document.querySelectorAll(".bs-tab-btn");
  const tabPanes = document.querySelectorAll(".bs-pane");

  tabButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      // Avoid acting if it's already active to save processing
      if (button.classList.contains("is-active")) return;

      const targetId = button.getAttribute("data-target");

      // Remove active classes
      tabButtons.forEach((btn) => btn.classList.remove("is-active"));
      tabPanes.forEach((pane) => pane.classList.remove("is-active"));

      // Add active classes to targets
      button.classList.add("is-active");
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add("is-active");
      }
    });
  });

  // --- 2. Wishlist Modal Logic ---
  const wishlistButtons = document.querySelectorAll("[data-wishlist-btn]");
  const modal = document.getElementById("bs-wishlist-modal");
  const modalText = document.getElementById("bs-modal-text");
  const closeTriggers = document.querySelectorAll("[data-modal-close]");

  const openModal = (productName) => {
    modalText.innerHTML = `<strong>${productName}</strong> has been added to your wishlist.`;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // Lock scrolling
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = ""; // Unlock scrolling
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

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  // --- 3. Quick Add Logic (Shopify Ajax Cart API) ---
  const quickAddButtons = document.querySelectorAll("[data-quick-add-btn]");

  quickAddButtons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (btn.disabled) return;

      const variantId = btn.getAttribute("data-variant-id");
      const originalContent = btn.innerHTML;

      // Temporary Loading State
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

        // Dispatch a standard custom event that most themes pick up to refresh the cart drawer
        document.dispatchEvent(
          new CustomEvent("cart:updated", { bubbles: true }),
        );
        document.dispatchEvent(
          new CustomEvent("ajaxProduct:added", { detail: { product: data } }),
        );

        // Flash Success State
        btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      } catch (error) {
        console.error("Error adding to cart:", error);
        alert("There was a problem adding the item to your cart.");
      } finally {
        // Revert button state after 2 seconds
        setTimeout(() => {
          btn.innerHTML = originalContent;
          btn.disabled = false;
        }, 2000);
      }
    });
  });
});
