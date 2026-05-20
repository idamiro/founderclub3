const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");
if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    menuBtn.textContent = navLinks.classList.contains("open") ? "×" : "☰";
  });
}

document.querySelectorAll("[data-tab]").forEach(button => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab;
    document.querySelectorAll("[data-tab]").forEach(b => b.classList.remove("active"));
    document.querySelectorAll("[data-panel]").forEach(p => p.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`[data-panel="${tab}"]`)?.classList.add("active");
  });
});

document.querySelectorAll("form").forEach(form => {
  form.addEventListener("submit", e => {
    e.preventDefault();
    alert("Müraciətiniz qeydə alındı. Komandamız sizinlə ən qısa zamanda əlaqə saxlayacaq.");
    form.reset();
  });
});

// FINAL FIX: expandable membership details, only clicked card opens.
document.querySelectorAll("#plans .details-toggle").forEach(button => {
  if(button.dataset.boundFinal === "true") return;
  button.dataset.boundFinal = "true";
  button.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();

    const card = button.closest(".plan");
    if(!card) return;

    const shouldOpen = !card.classList.contains("open");

    document.querySelectorAll("#plans .plan.open").forEach(openCard => {
      if(openCard !== card){
        openCard.classList.remove("open");
        const otherButton = openCard.querySelector(".details-toggle");
        if(otherButton) otherButton.textContent = "Daha Ətraflı ↓";
      }
    });

    card.classList.toggle("open", shouldOpen);
    button.textContent = shouldOpen ? "Bağla ↑" : "Daha Ətraflı ↓";
  });
});

// FINAL FIX: animated counters.
function runCountersFinal(){
  document.querySelectorAll("[data-count]").forEach(el => {
    if(el.dataset.done === "true") return;
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "+";
    const duration = 1300;
    const start = performance.now();

    function update(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(target * eased) + suffix;
      if(progress < 1) requestAnimationFrame(update);
      else {
        el.textContent = target + suffix;
        el.dataset.done = "true";
      }
    }
    requestAnimationFrame(update);
  });
}
const counterObserverFinal = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting) runCountersFinal();
  });
},{threshold:.35});
document.querySelectorAll("[data-count]").forEach(el => counterObserverFinal.observe(el));


// FAQ accordion
document.querySelectorAll(".faq-question").forEach((button) => {
  if (button.dataset.faqBound === "true") return;
  button.dataset.faqBound = "true";
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    if (!item) return;
    const shouldOpen = !item.classList.contains("active");
    document.querySelectorAll(".faq-item.active").forEach((openItem) => {
      if (openItem !== item) openItem.classList.remove("active");
    });
    item.classList.toggle("active", shouldOpen);
  });
});


// Global smooth reveal + premium header motion
(() => {
  const revealTargets = document.querySelectorAll(
    ".reveal, .stagger, .plans, .steps, .features, .events-grid, .faq-list"
  );

  revealTargets.forEach((el) => {
    if (!el.classList.contains("reveal") && !el.classList.contains("stagger")) {
      el.classList.add("stagger");
    }
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px"
    });

    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("in-view"));
  }

  const header = document.querySelector(".header");
  const syncHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  };
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
})();








// Membership selector: premium in-card details, only one card open.
(() => {
  const section = document.querySelector(".membership-selector");
  if (!section || section.dataset.selectorPremiumReady === "true") return;
  section.dataset.selectorPremiumReady = "true";

  const tabs = section.querySelectorAll(".selector-tab");
  const panels = section.querySelectorAll(".selector-panel");

  const closeCard = (card) => {
    if (!card) return;

    card.classList.remove("is-selected");

    const btn = card.querySelector(".selector-btn");
    if (btn) btn.textContent = "Paketi seç";

    const detail = card.querySelector(".selector-card-detail");
    if (detail) detail.remove();
  };

  const closePanelCards = (panel) => {
    panel.querySelectorAll(".selector-card").forEach(closeCard);

    // Old bottom detail box is disabled permanently.
    const bottomDetail = panel.querySelector(".selector-detail");
    if (bottomDetail) {
      bottomDetail.classList.remove("is-visible");
      bottomDetail.innerHTML = "";
      bottomDetail.style.display = "none";
    }
  };

  const buildDetail = (card) => {
    const name = card.dataset.planName || "";
    const price = card.dataset.planPrice || "";
    const subtitle = card.dataset.planSubtitle || "";
    const rawItems = (card.dataset.planDetails || "").split("|").filter(Boolean);

    const highlightedItems = rawItems.slice(0, 4);
    const restItems = rawItems.slice(4);

    const highlights = highlightedItems
      .map((item) => `<li>${item}</li>`)
      .join("");

    const rest = restItems.length
      ? `<div class="selector-extra-list">
          ${restItems.map((item) => `<span>${item}</span>`).join("")}
        </div>`
      : "";

    const detail = document.createElement("div");
    detail.className = "selector-card-detail";
    detail.innerHTML = `
      <div class="selector-card-detail-top">
        <div>
          <span class="selector-card-badge">Seçilmiş paket</span>
          <h4>${name}</h4>
          <p>${subtitle}</p>
        </div>
        <strong>${price}</strong>
      </div>

      <div class="selector-premium-note">
        <b>Niyə bu paket?</b>
        <span>Bu paket şirkətinizin Founder Club ekosistemində daha görünən, daha güclü və daha prestijli təmsil olunması üçün hazırlanıb.</span>
      </div>

      <ul class="selector-highlight-list">${highlights}</ul>
      ${rest}

      <button type="button" class="selector-close-btn">Bağla</button>
    `;

    detail.querySelector(".selector-close-btn")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeCard(card);
    });

    return detail;
  };

  const openCard = (card) => {
    const panel = card.closest(".selector-panel");
    if (!panel) return;

    // Close every card in every panel to prevent multiple long cards opening.
    panels.forEach(closePanelCards);

    card.classList.add("is-selected");

    const btn = card.querySelector(".selector-btn");
    if (btn) btn.textContent = "Bağla";

    card.appendChild(buildDetail(card));
  };

  const toggleCard = (card) => {
    if (card.classList.contains("is-selected")) {
      closeCard(card);
    } else {
      openCard(card);
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const key = tab.dataset.selectorTab;

      tabs.forEach((t) => t.classList.toggle("active", t === tab));
      panels.forEach((panel) => {
        const active = panel.dataset.selectorPanel === key;
        panel.classList.toggle("active", active);
        closePanelCards(panel);
      });
    });
  });

  section.querySelectorAll(".selector-card").forEach((card) => {
    const btn = card.querySelector(".selector-btn");

    // Only the button opens the detail. This prevents accidental card-wide opening.
    btn?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleCard(card);
    });

    card.addEventListener("click", (event) => {
      if (event.target.closest(".selector-card-detail")) return;
      if (event.target.closest(".selector-btn")) return;
    });
  });

  panels.forEach(closePanelCards);
})();


// Advisory board horizontal carousel arrows
(() => {
  const carousel = document.querySelector('#advisoryCarousel');
  if (!carousel) return;
  const wrap = carousel.closest('.testimonial-carousel-wrap');
  const prev = wrap?.querySelector('.testimonial-prev');
  const next = wrap?.querySelector('.testimonial-next');
  const move = (dir) => {
    const card = carousel.querySelector('.testimonial');
    const amount = card ? card.getBoundingClientRect().width + 26 : carousel.clientWidth * 0.8;
    carousel.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };
  prev?.addEventListener('click', () => move(-1));
  next?.addEventListener('click', () => move(1));
})();


// Global fix: make Səfirliklərlə Görüşlər reachable from header/footer on every page.
(() => {
  const targetText = 'Səfirliklərlə Görüşlər';
  document.querySelectorAll('a').forEach((a) => {
    if ((a.textContent || '').trim() === targetText) {
      a.setAttribute('href', 'sefirlikler.html');
    }
  });
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if ((node.nodeValue || '').trim() === targetText && node.parentElement?.tagName !== 'A') nodes.push(node);
  }
  nodes.forEach((node) => {
    const a = document.createElement('a');
    a.href = 'sefirlikler.html';
    a.textContent = targetText;
    node.parentNode.replaceChild(a, node);
  });
})();
