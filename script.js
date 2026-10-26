// Demo data only. Replace with verified events and listings from your backend.
    const events = [
      { id: 1, race: "Italian Grand Prix", circuit: "Autodromo Internazionale del Mugello", country: "Italy", flag: "🇮🇹", date: "2027-05-30", type: "General Admission", price: 95, round: "Race weekend" },
      { id: 2, race: "Catalan Grand Prix", circuit: "Circuit de Barcelona-Catalunya", country: "Spain", flag: "🇪🇸", date: "2027-06-13", type: "Grandstand", price: 165, round: "Race weekend" },
      { id: 3, race: "Dutch TT", circuit: "TT Circuit Assen", country: "Netherlands", flag: "🇳🇱", date: "2027-06-27", type: "VIP", price: 420, round: "Race weekend" },
      { id: 4, race: "British Grand Prix", circuit: "Silverstone Circuit", country: "United Kingdom", flag: "🇬🇧", date: "2027-08-08", type: "Grandstand", price: 210, round: "Race weekend" },
      { id: 5, race: "San Marino Grand Prix", circuit: "Misano World Circuit", country: "Italy", flag: "🇮🇹", date: "2027-09-12", type: "General Admission", price: 88, round: "Race weekend" },
      { id: 6, race: "Japanese Grand Prix", circuit: "Mobility Resort Motegi", country: "Japan", flag: "🇯🇵", date: "2027-10-03", type: "VIP", price: 375, round: "Race weekend" }
    ];
    let selectedTicket = null;
    const eventGrid = document.getElementById("eventGrid");
    const searchInput = document.getElementById("searchInput");
    const typeFilter = document.getElementById("typeFilter");
    const sortFilter = document.getElementById("sortFilter");
    const emptyState = document.getElementById("emptyState");
    const buyModal = document.getElementById("buyModal");
    const quantity = document.getElementById("quantity");
    const toast = document.getElementById("toast");

    function formatDate(dateString) {
      return new Date(dateString + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    }
    function money(value) {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
    }
    function escapeHTML(value) {
      return String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
    }
    function renderEvents() {
      const term = searchInput.value.trim().toLowerCase();
      let filtered = events.filter(event => {
        const matchesText = [event.race, event.circuit, event.country, event.type].some(value => value.toLowerCase().includes(term));
        const matchesType = typeFilter.value === "all" || event.type === typeFilter.value;
        return matchesText && matchesType;
      });
      if (sortFilter.value === "low") filtered.sort((a,b) => a.price - b.price);
      else if (sortFilter.value === "high") filtered.sort((a,b) => b.price - a.price);
      else filtered.sort((a,b) => a.date.localeCompare(b.date));

      eventGrid.innerHTML = filtered.map(event => `
        <article class="event-card">
          <div class="event-visual"><span class="flag" aria-hidden="true">${event.flag}</span><span class="round">${escapeHTML(event.type)}</span></div>
          <div class="event-body">
            <div class="event-date">${formatDate(event.date)}</div>
            <h3>${escapeHTML(event.race)}</h3>
            <div class="event-location">📍 ${escapeHTML(event.circuit)}, ${escapeHTML(event.country)}</div>
            <div class="event-meta"><div class="price"><small>Sample asking price from</small><strong>${money(event.price)}</strong></div><button class="btn btn-primary buy-button" data-id="${event.id}">View ticket</button></div>
          </div>
        </article>`).join("");
      emptyState.style.display = filtered.length ? "none" : "block";
      document.querySelectorAll(".buy-button").forEach(button => button.addEventListener("click", () => openBuy(Number(button.dataset.id))));
    }
    function openBuy(id) {
      selectedTicket = events.find(event => event.id === id);
      if (!selectedTicket) return;
      document.getElementById("buyTitle").textContent = selectedTicket.race;
      document.getElementById("modalDescription").textContent = `${selectedTicket.type} · ${selectedTicket.circuit} · ${formatDate(selectedTicket.date)}. Sample listing only.`;
      quantity.value = "1";
      updateTotal();
      buyModal.classList.add("show");
      document.body.style.overflow = "hidden";
      document.getElementById("closeModal").focus();
    }
    function closeBuy() {
      buyModal.classList.remove("show");
      document.body.style.overflow = "";
      selectedTicket = null;
    }
    function updateTotal() {
      if (selectedTicket) document.getElementById("modalTotal").textContent = money(selectedTicket.price * Number(quantity.value));
    }
    function showToast(message) {
      toast.textContent = message;
      toast.classList.add("show");
      window.setTimeout(() => toast.classList.remove("show"), 3200);
    }

    searchInput.addEventListener("input", renderEvents);
    typeFilter.addEventListener("change", renderEvents);
    sortFilter.addEventListener("change", renderEvents);
    quantity.addEventListener("change", updateTotal);
    document.getElementById("closeModal").addEventListener("click", closeBuy);
    buyModal.addEventListener("click", event => { if (event.target === buyModal) closeBuy(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape") closeBuy(); });
    document.getElementById("continueButton").addEventListener("click", () => {
      closeBuy();
      showToast("Demo only: connect a verified checkout and payment provider to accept orders.");
    });

    // Populate the sell form from the sample race list.
    const sellerRace = document.getElementById("sellerRace");
    events.forEach(event => {
      const option = document.createElement("option");
      option.value = event.race;
      option.textContent = `${event.race} — ${formatDate(event.date)}`;
      sellerRace.appendChild(option);
    });
    document.getElementById("sellForm").addEventListener("submit", event => {
      event.preventDefault();
      const listing = {
        race: sellerRace.value,
        type: document.getElementById("sellerType").value,
        price: Number(document.getElementById("sellerPrice").value),
        name: document.getElementById("sellerName").value.trim(),
        email: document.getElementById("sellerEmail").value.trim(),
        notes: document.getElementById("sellerNotes").value.trim()
      };
      if (!listing.name || !listing.email || !Number.isFinite(listing.price) || listing.price <= 0) {
        showToast("Please complete the required fields with a valid price.");
        return;
      }
      // A real application should POST this to a secure backend, not store personal data in the browser.
      showToast(`Listing preview created: ${listing.race} · ${listing.type} · ${money(listing.price)}. Not published.`);
      document.getElementById("sellForm").reset();
    });

    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");
    menuToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }));
    renderEvents();
