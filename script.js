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
