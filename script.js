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








// Membership selector: user must manually select a plan
(() => {
  const section = document.querySelector(".membership-selector");
  if (!section || section.dataset.selectorManualReady === "true") return;
  section.dataset.selectorManualReady = "true";

  const tabs = section.querySelectorAll(".selector-tab");
  const panels = section.querySelectorAll(".selector-panel");

  const clearPanel = (panel) => {
    panel.querySelectorAll(".selector-card").forEach((card) => {
      card.classList.remove("is-selected");
      const btn = card.querySelector(".selector-btn");
      if (btn) btn.textContent = "Paketi seç →";
    });

    const detail = panel.querySelector(".selector-detail");
    if (detail) {
      detail.classList.remove("is-visible");
      detail.innerHTML = "";
    }
  };

  const renderDetail = (panel, card) => {
    const detail = panel.querySelector(".selector-detail");
    if (!detail || !card) return;

    const name = card.dataset.planName || "";
    const tag = card.dataset.planTag || "";
    const price = card.dataset.planPrice || "";
    const subtitle = card.dataset.planSubtitle || "";
    const items = (card.dataset.planDetails || "")
      .split("|")
      .filter(Boolean)
      .map((item) => `<li>${item}</li>`)
      .join("");

    detail.innerHTML = `
      <div class="selector-detail-head">
        <div>
          <span class="selector-detail-kicker">${tag}</span>
          <h3>${name}</h3>
          <p>${subtitle}</p>
        </div>
        <div class="selector-detail-price">${price}</div>
      </div>
      <ul class="selector-detail-list">${items}</ul>
    `;
    detail.classList.add("is-visible");
  };

  const selectCard = (card) => {
    const panel = card.closest(".selector-panel");
    if (!panel) return;

    panel.querySelectorAll(".selector-card").forEach((c) => {
      c.classList.toggle("is-selected", c === card);
      const btn = c.querySelector(".selector-btn");
      if (btn) btn.textContent = c === card ? "Seçildi ✓" : "Paketi seç →";
    });

    renderDetail(panel, card);
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const key = tab.dataset.selectorTab;

      tabs.forEach((t) => t.classList.toggle("active", t === tab));
      panels.forEach((panel) => {
        const isActive = panel.dataset.selectorPanel === key;
        panel.classList.toggle("active", isActive);
        clearPanel(panel);
      });
    });
  });

  section.querySelectorAll(".selector-card").forEach((card) => {
    card.addEventListener("click", (event) => {
      event.preventDefault();
      selectCard(card);
    });
  });

  // Important: no automatic default selection.
  panels.forEach(clearPanel);
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
