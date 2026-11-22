/* Portfolio interactions. Each feature lives in its own function. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  /* ---------- Mobile menu ---------- */
  function initMenu() {
    const burger = $('#burger');
    const menu = $('#menu');
    const setOpen = (open) => {
      menu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    };
    burger.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
    $$('a', menu).forEach((link) => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 768) setOpen(false); });
  }

  /* ---------- Typing effect ---------- */
  function initTyping() {
    const target = $('#typed');
    const phrases = ['Aspiring Full Stack Developer', 'CSE Student', 'Technology Enthusiast'];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) { target.textContent = phrases[0]; return; }

    let phraseIndex = 0, charIndex = 0, deleting = false;
    (function tick() {
      const phrase = phrases[phraseIndex];
      charIndex += deleting ? -1 : 1;
      target.textContent = phrase.slice(0, charIndex);

      let delay = deleting ? 40 : 80;
      if (!deleting && charIndex === phrase.length) { deleting = true; delay = 1500; }
      else if (deleting && charIndex === 0) { deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; delay = 400; }
      setTimeout(tick, delay);
    })();
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('visible')); return; }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    items.forEach((el) => observer.observe(el));
  }

  /* ---------- Active nav link + nav shadow + back-to-top ---------- */
  function initScrollState() {
    const nav = $('#nav');
    const toTop = $('#toTop');
    const links = $$('#menu a');
    const sections = links.map((a) => $(a.getAttribute('href')));

    const update = () => {
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 10);
      toTop.classList.toggle('show', y > 500);

      // The current section is the last one whose top has passed the nav bar.
      let current = sections[0].id;
      sections.forEach((section) => { if (section.offsetTop - 120 <= y) current = section.id; });
      if (window.innerHeight + y >= document.body.offsetHeight - 4) current = sections[sections.length - 1].id;
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
    };
    window.addEventListener('scroll', update, { passive: true });
    update();

    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- Contact form validation ---------- */
  function initContactForm() {
    const form = $('#contactForm');
    const status = $('#formStatus');
    const button = $('#submitBtn');
    const endpoint = form.dataset.endpoint.trim(); // e.g. https://formspree.io/f/yourFormId
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    let submitting = false;

    const rules = {
      name: (v) => (v.length < 2 ? 'Enter your name (at least 2 characters).' : ''),
      email: (v) => (!v ? 'Enter your email address.' : !emailPattern.test(v) ? 'Enter a valid email, like name@example.com.' : ''),
      subject: (v) => (v.length < 3 ? 'Enter a subject (at least 3 characters).' : ''),
      message: (v) => (v.length < 10 ? 'Write a message of at least 10 characters.' : '')
    };

    function validateField(field) {
      const message = rules[field.name](field.value.trim());
      field.classList.toggle('invalid', Boolean(message));
      field.setAttribute('aria-invalid', String(Boolean(message)));
      field.parentElement.querySelector('.err').textContent = message;
      return !message;
    }

    const fields = $$('input, textarea', form);
    fields.forEach((field) => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => { if (field.classList.contains('invalid')) validateField(field); });
    });

    function setStatus(text, type) { status.textContent = text; status.className = 'status ' + type; }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (submitting) return; // blocks double submits

      const results = fields.map(validateField); // validate every field so all errors show
      if (results.includes(false)) {
        setStatus('Please fix the highlighted fields.', 'bad');
        fields[results.indexOf(false)].focus();
        return;
      }

      submitting = true;
      button.disabled = true;
      button.textContent = 'Sending...';

      try {
        if (endpoint) {
          const response = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
          if (!response.ok) throw new Error('Request failed');
          setStatus('Thank you! Your message has been sent.', 'ok');
        } else {
          // Demo mode: no backend is configured, so nothing is delivered.
          await new Promise((resolve) => setTimeout(resolve, 600));
          setStatus('Form is valid. This is demo mode, so the message was not delivered. Add a Formspree URL to enable sending.', 'warn');
        }
        form.reset();
        fields.forEach((f) => f.setAttribute('aria-invalid', 'false'));
      } catch (error) {
        setStatus('Something went wrong. Please try again or email me directly.', 'bad');
      } finally {
        submitting = false;
        button.disabled = false;
        button.textContent = 'Send message';
      }
    });
  }

  /* ---------- Boot ---------- */
  $('#year').textContent = new Date().getFullYear();
  initMenu();
  initTyping();
  initReveal();
  initScrollState();
  initContactForm();
})();
