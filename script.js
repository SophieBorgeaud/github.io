/* ═══════════════════════════════════════════════════
   SOPHIE BORGEAUD · PORTFOLIO script.js v3
   ═══════════════════════════════════════════════════ */

'use strict';

/* ── HELPERS ── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ══════════════════════════════════════
   1. NAVIGATION
══════════════════════════════════════ */
(function initNav() {
    const nav       = $('#nav');
    const burger    = $('#burger');
    const mobileMenu = $('#mobileMenu');
    const sections  = $$('section[id]');
    const navLinks  = $$('[data-section]');

    /* Scroll → opaque + active link */
    function onScroll() {
        nav.classList.toggle('is-scrolled', window.scrollY > 50);

        let current = '';
        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 160) current = sec.id;
        });
        navLinks.forEach(a => a.classList.toggle('is-active', a.dataset.section === current));
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Burger */
    function closeMobile() {
        burger.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('is-open');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    burger.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', String(isOpen));
        mobileMenu.setAttribute('aria-hidden', String(!isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobile));

    /* Smooth scroll (fallback) */
    $$('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = $(a.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            closeMobile();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
})();


/* ══════════════════════════════════════
   2. TYPEWRITER
══════════════════════════════════════ */
(function initTypewriter() {
    const el = $('#typewriter');
    if (!el) return;

    const phrases = [
        'Développement web & applications',
        'Bases de données & modélisation',
        'Administration systèmes',
        'En recherche de stage — 2025',
    ];

    if (prefersReducedMotion) {
        el.textContent = phrases[0];
        return;
    }

    let pi = 0, ci = 0, deleting = false;
    const SPEED_TYPE = 52, SPEED_DEL = 26, PAUSE = 2400, PAUSE_START = 350;

    function tick() {
        const phrase = phrases[pi];
        if (deleting) {
            ci--;
            el.textContent = phrase.slice(0, ci);
            if (ci === 0) {
                deleting = false;
                pi = (pi + 1) % phrases.length;
                setTimeout(tick, PAUSE_START);
                return;
            }
            setTimeout(tick, SPEED_DEL);
        } else {
            ci++;
            el.textContent = phrase.slice(0, ci);
            if (ci === phrase.length) {
                deleting = true;
                setTimeout(tick, PAUSE);
                return;
            }
            setTimeout(tick, SPEED_TYPE);
        }
    }

    setTimeout(tick, 900);
})();


/* ══════════════════════════════════════
   3. SCROLL REVEAL
══════════════════════════════════════ */
(function initReveal() {
    const reveals = $$('.reveal');

    if (prefersReducedMotion) {
        reveals.forEach(el => el.classList.add('is-visible'));
        return;
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            // Stagger dans le même parent
            const siblings = $$('.reveal', entry.target.parentElement);
            const idx = siblings.indexOf(entry.target);
            setTimeout(() => {
                entry.target.classList.add('is-visible');
            }, Math.min(idx * 70, 280));
            io.unobserve(entry.target);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    reveals.forEach(el => io.observe(el));
})();


/* ══════════════════════════════════════
   4. CAROUSEL PROJETS
══════════════════════════════════════ */
(function initCarousel() {
    const track   = $('#carouselTrack');
    if (!track) return;

    const cards   = $$('.pcard', track);
    const prevBtn = $('#prevBtn');
    const nextBtn = $('#nextBtn');
    const dotsEl  = $('#carouselDots');

    if (!cards.length) return;

    let current = 0;

    /* Crée un wrapper pour la hauteur */
    const wrap = document.createElement('div');
    wrap.className = 'carousel__track-wrap';
    track.parentNode.insertBefore(wrap, track);
    wrap.appendChild(track);

    /* Position absolue pour toutes les cartes */
    cards.forEach((c, i) => {
        c.style.position = i === 0 ? 'relative' : 'absolute';
        c.style.inset = '0';
        if (i === 0) c.classList.add('is-active');
    });

    /* Dots */
    cards.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel__dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', `Projet ${i + 1}`);
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        dot.addEventListener('click', () => goTo(i));
        dotsEl.appendChild(dot);
    });

    function goTo(idx) {
        if (idx === current || idx < 0 || idx >= cards.length) return;

        const prev = current;
        current = idx;

        // Leaving
        cards[prev].classList.remove('is-active');
        cards[prev].classList.add('is-leaving');
        cards[prev].style.position = 'absolute';

        // Entering
        cards[current].style.position = 'relative';
        cards[current].classList.add('is-active');

        setTimeout(() => {
            cards[prev].classList.remove('is-leaving');
        }, 500);

        // Update dots
        $$('.carousel__dot', dotsEl).forEach((d, i) => {
            d.classList.toggle('is-active', i === current);
            d.setAttribute('aria-selected', i === current ? 'true' : 'false');
        });

        // Update buttons
        prevBtn.disabled = current === 0;
        nextBtn.disabled = current === cards.length - 1;
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    /* Swipe tactile */
    let touchStartX = 0;
    wrap.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    wrap.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) goTo(dx < 0 ? current + 1 : current - 1);
    }, { passive: true });

    /* Flèches clavier */
    document.addEventListener('keydown', e => {
        const active = document.getElementById('projects');
        if (!active) return;
        const rect = active.getBoundingClientRect();
        if (rect.top > window.innerHeight || rect.bottom < 0) return;
        if (e.key === 'ArrowLeft')  goTo(current - 1);
        if (e.key === 'ArrowRight') goTo(current + 1);
    });

    prevBtn.disabled = true;
})();


/* ══════════════════════════════════════
   5. FORMULAIRE CONTACT (Formspree)
══════════════════════════════════════ */
(function initForm() {
    const form   = $('#contactForm');
    const status = $('#formStatus');
    const btn    = $('#submitBtn');
    const label  = $('#submitLabel');
    if (!form || !status) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        /* Validation légère */
        const name    = $('#name', form).value.trim();
        const email   = $('#email', form).value.trim();
        const message = $('#message', form).value.trim();

        if (!name || !email || !message) {
            setStatus('Merci de remplir tous les champs.', 'err');
            return;
        }

        /* État chargement */
        btn.disabled = true;
        label.textContent = 'Envoi…';
        status.className = 'form__status';
        status.textContent = '';

        try {
            const res = await fetch(form.action, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: new FormData(form),
            });

            if (res.ok) {
                setStatus('Message envoyé — merci !', 'ok');
                form.reset();
            } else {
                const data = await res.json();
                setStatus(data?.errors?.[0]?.message || 'Une erreur est survenue.', 'err');
            }
        } catch {
            setStatus('Problème de connexion. Réessaie ou envoie un email directement.', 'err');
        } finally {
            btn.disabled = false;
            label.textContent = 'Envoyer le message';
        }
    });

    function setStatus(msg, type) {
        status.textContent = msg;
        status.className = `form__status form__status--${type}`;
    }
})();


/* ══════════════════════════════════════
   6. PARALLAX ORBS (souris)
══════════════════════════════════════ */
(function initParallax() {
    if (prefersReducedMotion) return;

    const orbA = $('.ambient-orb--a');
    const orbB = $('.ambient-orb--b');
    if (!orbA || !orbB) return;

    let raf = false;

    document.addEventListener('mousemove', e => {
        if (raf) return;
        raf = true;
        requestAnimationFrame(() => {
            const cx = window.innerWidth  / 2;
            const cy = window.innerHeight / 2;
            const dx = (e.clientX - cx) / cx;
            const dy = (e.clientY - cy) / cy;
            orbA.style.transform = `translate(${dx * 25}px, ${dy * 25}px)`;
            orbB.style.transform = `translate(${-dx * 18}px, ${-dy * 18}px)`;
            raf = false;
        });
    });
})();