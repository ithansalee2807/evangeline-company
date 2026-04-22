/* E&C.js - JavaScript centralizado para Menú, Scroll, Reveal, Formulario */

/* ---------------------------
   Helpers
----------------------------*/
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------------------------
   MENU LATERAL (toggle)
----------------------------*/
(function menuToggle() {
  const menuBtn = $('.menu-btn');
  const sideMenu = $('.side-menu');
  if (!menuBtn || !sideMenu) return;

  menuBtn.addEventListener('click', () => {
    sideMenu.classList.toggle('active');
    // accesibilidad simple
    menuBtn.setAttribute('aria-expanded', sideMenu.classList.contains('active'));
  });

  // cerrar al click en enlace
  $$('.side-menu a').forEach(a => a.addEventListener('click', () => sideMenu.classList.remove('active')));
})();

/* ---------------------------
   HEADER SHADOW on scroll
----------------------------*/
(function headerScroll() {
  const header = document.querySelector('header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ---------------------------
   SMOOTH SCROLL for internal links
----------------------------*/
(function smoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

/* ---------------------------
   REVEAL on scroll (IntersectionObserver)
----------------------------*/
(function revealOnScroll() {
  const reveals = $$('.reveal');
  if (!('IntersectionObserver' in window) || reveals.length === 0) {
    // fallback: show all
    reveals.forEach(r => r.classList.add('active'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      if (ent.isIntersecting) {
        ent.target.classList.add('active');
        // optional: unobserve to save perf
        obs.unobserve(ent.target);
      }
    });
  }, { threshold: 0.15 });
  reveals.forEach(r => obs.observe(r));
})();

/* ---------------------------
   TYPING EFFECT (if .typing-text exists)
----------------------------*/
(function typingEffect() {
  const el = document.querySelector('.typing-text');
  if (!el) return;
  const text = el.textContent.trim();
  el.textContent = '';
  let i = 0;
  function type() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(type, 60);
    }
  }
  type();
})();

/* ---------------------------
   FORM: validation + FormSubmit UX
   (No backend — FormSubmit used in HTML form action)
----------------------------*/
(function contactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const feedback = document.getElementById('formFeedback');
  const limpiarBtn = document.getElementById('limpiarBtn');

  function showError(field, message) {
    const err = document.querySelector('.error[data-for="' + field + '"]');
    if (err) { err.textContent = message; err.setAttribute('aria-hidden','false'); }
  }
  function clearErrors() {
    $$('.error').forEach(e => { e.textContent = ''; e.setAttribute('aria-hidden','true'); });
  }

  function validate() {
    clearErrors();
    let ok = true;
    const nombre = (form.nombre?.value || '').trim();
    const email = (form.email?.value || '').trim();
    const motivo = (form.motivo?.value || '');
    const mensaje = (form.mensaje?.value || '').trim();

    if (nombre.length < 2) { showError('nombre','Nombre muy corto'); ok = false; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { showError('email','Correo inválido'); ok = false; }
    if (motivo === '') { showError('motivo','Selecciona un motivo'); ok = false; }
    if (mensaje.length < 6) { showError('mensaje','Mensaje muy corto'); ok = false; }

    return ok;
  }

  form.addEventListener('submit', function (e) {
    // Allow native FormSubmit to POST; only block to show validation
    if (!validate()) {
      e.preventDefault();
      feedback.style.color = '#7a2b22ff';
      feedback.textContent = 'Corrige los errores y vuelve a enviar.';
      return;
    }
    // UX: show sending state, but allow the form to actually submit (no AJAX)
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      const original = btn.textContent;
      btn.textContent = 'Enviando...';
      // If the submit actually navigates, this JS will stop running; if FormSubmit returns, re-enable
      setTimeout(() => {
        if (btn) { btn.disabled = false; btn.textContent = original; }
        feedback.style.color = '#104a2a';
        feedback.textContent = '✅ Mensaje enviado. Te contactaremos pronto.';
      }, 1200);
    }
  });

  limpiarBtn?.addEventListener('click', () => {
    form.reset();
    clearErrors();
    feedback.textContent = '';
  });
})();

/* ---------------------------
   Small console message for dev
----------------------------*/
console.log('E&C.js cargado — menú, scroll, reveal y formulario activos.');



document.addEventListener("DOMContentLoaded", () => {

  /* =========================================================
     1. ANIMACIÓN REVEAL (se muestra al hacer scroll)
  ========================================================== */
  const revealElements = document.querySelectorAll(".reveal");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.2 }
  );

  revealElements.forEach((el) => revealObserver.observe(el));



  /* =========================================================
     2. FORMULARIO DE CONTACTO (validaciones + feedback)
  ========================================================== */
  const form = document.getElementById("contactForm");
  const feedback = document.getElementById("formFeedback");
  const limpiarBtn = document.getElementById("limpiarBtn");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    let valido = true;
    const campos = ["nombre", "email", "motivo", "mensaje"];

    campos.forEach((campo) => {
      const input = document.getElementById(campo);
      const error = document.querySelector(`.error[data-for="${campo}"]`);

      if (!input.value.trim()) {
        valido = false;
        error.textContent = "Este campo es obligatorio";
        error.style.display = "block";
      } else {
        error.textContent = "";
        error.style.display = "none";
      }
    });

    if (!valido) return;

    // Éxito visual
    feedback.textContent = "✔ Tu mensaje ha sido enviado correctamente.";
    feedback.classList.add("success");

    // Limpia el formulario después de enviar
    setTimeout(() => {
      form.reset();
      feedback.textContent = "";
      feedback.classList.remove("success");
    }, 2500);
  });

  limpiarBtn.addEventListener("click", () => {
    form.reset();
    feedback.textContent = "";
    document.querySelectorAll(".error").forEach((e) => (e.style.display = "none"));
  });



  /* =========================================================
     3. ANIMACIONES TARJETAS DE PRECIOS
        (Hover + aparición suave)
  ========================================================== */
  const priceCards = document.querySelectorAll(".price-card");

  // Aparecen al hacer scroll
  const priceObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.2 }
  );

  priceCards.forEach((card) => priceObserver.observe(card));

  // Animación hover
  priceCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.classList.add("hovered");
    });
    card.addEventListener("mouseleave", () => {
      card.classList.remove("hovered");
    });
  });

});
