(() => {
  const modal = document.getElementById("waitlist-modal");
  if (!modal) return;

  const openSelector = '[data-open-waitlist="true"]';
  const closeSelector = '[data-close-waitlist="true"]';
  const emailInput = modal.querySelector("#waitlist-email");
  const form = modal.querySelector("form");
  const messageEl = modal.querySelector(".waitlist-modal__message");
  const submitBtn = modal.querySelector(".waitlist-modal__submit");
  let lastFocusedElement = null;
  let submitLabel = submitBtn ? submitBtn.textContent : "";

  const openModal = (trigger) => {
    lastFocusedElement = trigger;
    modal.classList.add("is-open");
    document.body.classList.add("waitlist-modal-open");
    if (emailInput) {
      emailInput.focus();
    }
  };

  const clearMessage = () => {
    if (!messageEl) return;
    messageEl.textContent = "";
    messageEl.classList.remove("is-success", "is-error");
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    document.body.classList.remove("waitlist-modal-open");
    clearMessage();
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  };

  document.addEventListener(
    "click",
    (event) => {
      const trigger = event.target.closest(openSelector);
      if (!trigger) return;
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") {
        event.stopImmediatePropagation();
      }
      openModal(trigger);
    },
    true
  );

  const closeBtn = modal.querySelector(closeSelector);
  if (closeBtn) {
    closeBtn.addEventListener("click", (event) => {
      event.preventDefault();
      closeModal();
    });
  }

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  if (form && submitBtn) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearMessage();

      submitBtn.setAttribute("aria-busy", "true");
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: {
            Accept: "application/json",
          },
        });

        if (response.ok) {
          form.reset();
          if (messageEl) {
            messageEl.textContent = "Thanks! You're on the waitlist.";
            messageEl.classList.add("is-success");
          }
        } else {
          let errorMessage =
            "Sorry, something went wrong. Please try again.";
          try {
            const data = await response.json();
            if (data && Array.isArray(data.errors) && data.errors.length > 0) {
              errorMessage = data.errors
                .map((error) => error.message)
                .join(" ");
            }
          } catch (error) {
            errorMessage =
              "Sorry, something went wrong. Please try again.";
          }
          if (messageEl) {
            messageEl.textContent = errorMessage;
            messageEl.classList.add("is-error");
          }
        }
      } catch (error) {
        if (messageEl) {
          messageEl.textContent =
            "Network error. Please check your connection and try again.";
          messageEl.classList.add("is-error");
        }
      } finally {
        submitBtn.removeAttribute("aria-busy");
        submitBtn.disabled = false;
        submitBtn.textContent = submitLabel;
      }
    });
  }
})();
