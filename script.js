console.log("script.js: Parsing started");

const loadingScreen = document.getElementById('loading-screen');
const themeToggleButton = document.getElementById('theme-toggle-button');
const bodyElement = document.body;

function applyTheme(theme) {
    if (theme === 'light') {
        bodyElement.classList.add('light-mode');
        if (themeToggleButton) themeToggleButton.setAttribute('aria-pressed', 'true');
    } else {
        bodyElement.classList.remove('light-mode');
        if (themeToggleButton) themeToggleButton.setAttribute('aria-pressed', 'false');
    }
}

function toggleTheme() {
    const currentThemeIsLight = bodyElement.classList.contains('light-mode');
    const newTheme = currentThemeIsLight ? 'dark' : 'light';

    const themeToggleIconTimeline = gsap.timeline();
    const moonIcon = themeToggleButton.querySelector('.moon-icon');
    const sunIcon = themeToggleButton.querySelector('.sun-icon');

    if (newTheme === 'dark') { // Transitioning to Dark
        themeToggleIconTimeline
            .to(moonIcon, { opacity: 0, y: '100%', rotation: 90, scale: 0.5, duration: 0.25, ease: 'power2.in' })
            .set(moonIcon, { display: 'none' })
            .set(sunIcon, { display: 'block', y: '-100%', rotation: -90, scale: 0.5 })
            .to(sunIcon, { opacity: 1, y: '0%', rotation: 0, scale: 1, duration: 0.25, ease: 'power2.out' });
    } else { // Transitioning to Light
        themeToggleIconTimeline
            .to(sunIcon, { opacity: 0, y: '100%', rotation: 90, scale: 0.5, duration: 0.25, ease: 'power2.in' })
            .set(sunIcon, { display: 'none' })
            .set(moonIcon, { display: 'block', y: '-100%', rotation: -90, scale: 0.5 })
            .to(moonIcon, { opacity: 1, y: '0%', rotation: 0, scale: 1, duration: 0.25, ease: 'power2.out' });
    }

    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    let initialTheme = 'light'; // Default to light

    if (savedTheme) {
        initialTheme = savedTheme;
    } else if (prefersDark) {
        initialTheme = 'dark';
    }
    applyTheme(initialTheme);

    // Set initial icon state without animation
    const moonIcon = themeToggleButton.querySelector('.moon-icon');
    const sunIcon = themeToggleButton.querySelector('.sun-icon');
    if (initialTheme === 'light') {
        if(moonIcon) moonIcon.style.cssText = 'display: block; opacity: 1; transform: translateY(0) rotate(0) scale(1);';
        if(sunIcon) sunIcon.style.cssText = 'display: none; opacity: 0; transform: translateY(100%) rotate(-90deg) scale(0.5);';
    } else {
        if(moonIcon) moonIcon.style.cssText = 'display: none; opacity: 0; transform: translateY(-100%) rotate(90deg) scale(0.5);';
        if(sunIcon) sunIcon.style.cssText = 'display: block; opacity: 1; transform: translateY(0) rotate(0) scale(1);';
    }
}

if (themeToggleButton) {
    themeToggleButton.addEventListener('click', toggleTheme);
}

function isGsapReady() {
    const gsapDefined = typeof gsap !== 'undefined';
    const scrollTriggerGlobalDefined = typeof ScrollTrigger !== 'undefined';
    return gsapDefined && scrollTriggerGlobalDefined;
}

function initializeHeroAnimation() {
    const heroSection = document.getElementById('hero');
    const heroMainLogo = document.querySelector('.hero-main-logo-container');
    const heroTextContainer = heroSection.querySelector('#hero .container');
    const heroTitle = document.getElementById('hero-title');
    const heroTitleChars = heroTitle.querySelectorAll('.char-title');
    const heroSupertitle = heroTextContainer.querySelector('.section-supertitle');
    const interactiveBlobs = gsap.utils.toArray('.hero-interactive-blob');

    if (!heroSection || !heroTextContainer || !heroTitle || heroTitleChars.length === 0 || !heroSupertitle || !loadingScreen) {
        console.warn("Hero animation elements or loading screen missing.");
        if (loadingScreen && loadingScreen.style.opacity !== "0") {
            gsap.to(loadingScreen, { opacity: 0, duration: 0.3, delay: 0.1, onComplete: () => { loadingScreen.style.display = 'none'; document.body.style.overflow = ''; } });
        } else if (!loadingScreen) {
            document.body.style.overflow = '';
        }
        return null;
    }

    gsap.set(heroSection, { position: 'relative' });
    gsap.set([heroMainLogo, heroTextContainer, heroSection.querySelector('.scroll-down-arrow')], { position: 'relative', zIndex: 10 });
    gsap.set(interactiveBlobs, { position: 'absolute', zIndex: 0 });
    gsap.set(heroTitleChars, { opacity: 0, y: 20, rotationX: -80, transformOrigin: "center center -20px" });
    gsap.set(heroSection.querySelector('.scroll-down-arrow'), { autoAlpha: 0 });

    const masterIntroTl = gsap.timeline({
        delay: 0.1,
        onComplete: () => {
            if (loadingScreen) {
                gsap.to(loadingScreen, {
                    opacity: 0, duration: 0.5, ease: "power1.out", onComplete: () => {
                        loadingScreen.style.display = 'none';
                        document.body.style.overflow = '';
                    }
                });
            } else {
                document.body.style.overflow = '';
            }
            console.log("Hero intro complete. Loading screen hidden.");
        }
    });

    masterIntroTl.to(heroTitleChars, {
        opacity: 1, y: 0, rotationX: 0, stagger: 0.035, duration: 0.55, ease: "back.out(1.1)"
    }, 0.05);

    const heroScrollTl = gsap.timeline();
    const scrollAnimationDuration = 2.5;

    interactiveBlobs.forEach((blob, i) => {
        gsap.set(blob, { xPercent: gsap.utils.random(-40, 40), yPercent: gsap.utils.random(-40, 40), scale: gsap.utils.random(0.3, 0.7), autoAlpha: 0 });
        masterIntroTl.to(blob, { autoAlpha: gsap.utils.random(0.05, 0.2), scale: 1, duration: 0.7, ease: "power1.out" }, 0.3 + i * 0.08);
        heroScrollTl.to(blob, {
            xPercent: `+=${gsap.utils.random(-80, 80)}`,
            yPercent: `+=${gsap.utils.random(-70, 70)}`,
            rotation: gsap.utils.random(-40, 40),
            scale: `*=${gsap.utils.random(0.7, 1.4)}`,
            duration: scrollAnimationDuration,
            ease: "sine.inOut",
        }, 0);
    });

    gsap.to(heroSection.querySelector('.scroll-down-arrow'), { autoAlpha: 1, delay: masterIntroTl.duration() + 0.5, duration: 0.5 });

    console.log("Hero intro animations setup.");
    return { heroScrollTimeline: heroScrollTl, heroSectionElement: heroSection };
}

function initializeGsapAnimations() {
    loadThemePreference();
    if (!isGsapReady()) {
        console.error("GSAP or plugins not ready.");
        if (loadingScreen && loadingScreen.style.opacity !== "0") {
            loadingScreen.style.opacity = "0";
            setTimeout(() => { loadingScreen.style.display = 'none'; document.body.style.overflow = ''; }, 300);
        } else if (!loadingScreen) {
            document.body.style.overflow = '';
        }
        return;
    }
    try {
        gsap.registerPlugin(ScrollTrigger);
    } catch (e) {
        console.error("Error registering GSAP plugins:", e);
        return;
    }

    const heroData = initializeHeroAnimation();

    if (heroData && heroData.heroScrollTimeline && heroData.heroSectionElement) {
        ScrollTrigger.create({
            animation: heroData.heroScrollTimeline,
            trigger: heroData.heroSectionElement,
            start: "top top",
            end: `+=${window.innerHeight * 0.6}`,
            scrub: 1.3,
        });
        console.log("ScrollTrigger for hero blobs initialized.");
    }

    const animateInElements = (selector, defaultDelay = 0, customEase = 'expo.out', customDuration = 1, staggerAmount = 0) => {
        gsap.utils.toArray(selector).forEach((el, index) => {
            const isInHero = el.closest('#hero');
            const isSpecialHeroElement = isInHero && (
                el.classList.contains('hero-main-logo-container') ||
                el.classList.contains('section-supertitle') ||
                el.id === 'hero-title' ||
                el.id === 'hero-subtitle' ||
                el.id === 'hero-ctas' ||
                el.classList.contains('hero-interactive-blob') ||
                el.classList.contains('scroll-down-arrow')
            );
            if (isSpecialHeroElement) return;

            const delay = parseFloat(el.dataset.delay) || defaultDelay;
            let fromProps = {autoAlpha: 0};
            if (el.classList.contains('g-fade-up')) fromProps.y = 40;
            else if (el.classList.contains('g-fade-down')) fromProps.y = -40;
            else if (el.classList.contains('g-fade-left')) fromProps.x = 40;
            else if (el.classList.contains('g-fade-right')) fromProps.x = -40;
            else if (el.classList.contains('g-scale-in')) fromProps.scale = 0.9;

            let toProps = {autoAlpha: 1, y: 0, x: 0, scale: 1};
            gsap.fromTo(el, fromProps, {
                ...toProps,
                duration: customDuration,
                ease: customEase,
                delay: delay + (staggerAmount * index),
                scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse', invalidateOnRefresh: true }
            });
        });
    };

    animateInElements('.g-fade-in', 0, 'power2.out', 0.8);
    animateInElements('.g-fade-up', 0.1);
    animateInElements('.g-fade-left', 0.15);
    animateInElements('.g-fade-right', 0.15);
    animateInElements('.g-scale-in', 0.25, 'elastic.out(1, 0.6)', 1.2);

    const quisommesnousImage = document.querySelector('#quisommesnous .quisommesnous-image');
    if (quisommesnousImage) gsap.to(quisommesnousImage, {
        yPercent: -4, ease: "none",
        scrollTrigger: { trigger: quisommesnousImage.closest('section'), start: "top bottom", end: "bottom top", scrub: 1.3 }
    });

    gsap.utils.toArray('#quisommesnous .mission-vision-histoire h3').forEach(h3 => {
        gsap.fromTo(h3, {'--after-width': '0px'}, {
            '--after-width': '40px', duration: 0.6, ease: 'power2.out',
            scrollTrigger: {trigger: h3, start: 'top 88%', toggleActions: 'play none none reverse'},
            onComplete: () => h3.classList.add('animated-underline')
        });
        gsap.from([h3, h3.nextElementSibling], {
            autoAlpha: 0, y: 15, stagger: 0.12, duration: 0.5, ease: 'power2.out',
            scrollTrigger: {trigger: h3, start: 'top 88%', toggleActions: 'play none none reverse'}
        });
    });
    gsap.from('#quisommesnous .bg-\\[--arcadis-blue-light\\] > *', {
        autoAlpha: 0, y: 25, stagger: 0.12, duration: 0.6, ease: 'expo.out',
        scrollTrigger: { trigger: '#quisommesnous .bg-\\[--arcadis-blue-light\\]', start: 'top 85%', toggleActions: 'play none none reverse' }
    });

    gsap.utils.toArray('.offre-card').forEach((card) => {
        const listItems = card.querySelectorAll('ul li');
        gsap.fromTo(listItems, {autoAlpha: 0, x: -15}, {
            autoAlpha: 1, x: 0, stagger: 0.08, duration: 0.4, ease: 'power2.out',
            scrollTrigger: {trigger: card, start: 'top 80%', toggleActions: 'play none none none'}
        });
    });
    gsap.from('.pricing-model-note', {
        autoAlpha: 0, scale: 0.95, y: 15, duration: 0.6, ease: 'back.out(1.5)',
        scrollTrigger: {trigger: '.pricing-model-note', start: 'top 90%', toggleActions: 'play none none reverse'}
    });

    gsap.utils.toArray('.expertise-item').forEach((item) => {
        const icon = item.querySelector('.expertise-icon'), title = item.querySelector('h4'), paragraph = item.querySelector('p');
        const tl = gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 85%', toggleActions: 'play none none reverse' } });
        tl.from(icon, { scale: 0.6, autoAlpha: 0, rotation: -30, duration: 0.5, ease: 'back.out(1.8)' })
            .from(title, {autoAlpha: 0, y: 15, duration: 0.4, ease: 'power2.out'}, "-=0.25")
            .from(paragraph, { autoAlpha: 0, y: 15, duration: 0.4, ease: 'power2.out' }, "-=0.25");
        if (icon) tl.call(() => icon.classList.add('animated-icon'), [], ">");
    });

    gsap.utils.toArray('#pourquoi ul li').forEach((li, index) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 88%', toggleActions: 'play none none reverse', onEnter: () => li.classList.add('is-visible') } });
        tl.fromTo(li, {autoAlpha: 0, x: -25}, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power2.out', delay: index * 0.08 });
    });

    const contactFormEl = document.querySelector('#contact-form');
    if (contactFormEl) {
        const formElements = contactFormEl.querySelectorAll('input, textarea, button');
        gsap.from(formElements, {
            autoAlpha: 0, y: 20, stagger: 0.08, duration: 0.4, ease: 'power1.out',
            scrollTrigger: {trigger: contactFormEl, start: 'top 85%', toggleActions: 'play none none reverse'}
        });
    }
    const contactInfoItems = document.querySelectorAll('#contact .contact-info-item');
    gsap.from(contactInfoItems, {
        autoAlpha: 0, x: 20, stagger: 0.08, duration: 0.4, ease: 'power1.out',
        scrollTrigger: {trigger: '.contact-info-wrapper', start: 'top 85%', toggleActions: 'play none none reverse'}
    });
    gsap.utils.toArray('#contact .contact-info-item svg').forEach(svgIcon => {
        gsap.from(svgIcon, {
            scale: 0.6, autoAlpha: 0, rotation: -25, duration: 0.5, ease: 'back.out(1.6)',
            scrollTrigger: { trigger: svgIcon.closest('.contact-info-item'), start: 'top 88%', toggleActions: 'play none none reverse' }
        });
    });

    const decorativeShapes = gsap.utils.toArray('.decorative-shape');
    decorativeShapes.forEach((shape, i) => {
        if (shape.closest('#hero') && shape.classList.contains('hero-interactive-blob')) return;
        if (shape.closest('#hero') && (shape.classList.contains('shape-1') || shape.classList.contains('shape-2') || shape.classList.contains('shape-3'))) {
            if (!shape.classList.contains('g-fade-in')) {
                gsap.fromTo(shape, {autoAlpha: 0, scale: 0.6}, {
                    autoAlpha: 1, scale: 1, duration: 1.2, delay: 0.2 + i * 0.12, ease: "expo.out",
                    scrollTrigger: { trigger: shape.closest('section'), start: 'top 80%', toggleActions: 'play none none none'}
                });
            }
        }
        if (!shape.closest('#hero') || !shape.classList.contains('hero-interactive-blob')) {
            gsap.to(shape, {
                x: () => gsap.utils.random(-20, 20, 1), y: () => gsap.utils.random(-20, 20, 1),
                rotation: () => gsap.utils.random(-15, 15, 1), scale: () => gsap.utils.random(0.95, 1.05, 0.01),
                autoAlpha: () => gsap.utils.random(0.6, 0.9, 0.05),
                repeat: -1, yoyo: true, duration: () => gsap.utils.random(7, 14, 1), ease: "sine.inOut", delay: 0.8 + i * 0.4
            });
            gsap.to(shape, {
                yPercent: () => gsap.utils.random(-40, 40), xPercent: () => gsap.utils.random(-25, 25),
                ease: "none",
                scrollTrigger: { trigger: shape.closest('section') || 'body', start: "top bottom", end: "bottom top", scrub: 1.8 + Math.random() * 2.5, invalidateOnRefresh: true }
            });
        }
    });
    ScrollTrigger.refresh();
}

function attemptGsapInit(maxAttempts = 5, interval = 250) {
    let attempts = 0;
    function tryInit() {
        if (isGsapReady()) {
            if (document.readyState === "loading") document.addEventListener('DOMContentLoaded', initializeGsapAnimations);
            else initializeGsapAnimations();
        } else {
            attempts++;
            if (attempts < maxAttempts) setTimeout(tryInit, interval);
            else {
                console.error(`GSAP not loaded after ${maxAttempts} attempts.`);
                if (loadingScreen && loadingScreen.style.opacity !== "0") {
                    loadingScreen.style.opacity = "0";
                    setTimeout(() => { loadingScreen.style.display = 'none'; document.body.style.overflow = ''; }, 300);
                } else if (!loadingScreen) {
                    document.body.style.overflow = '';
                }
            }
        }
    }
    tryInit();
}

const progressBar = document.getElementById('progress-bar');
if (loadingScreen && progressBar) {
    let progress = 0;
    const intervalTime = 18, totalDuration = 700; // Faster progress bar
    const increment = 100 / (totalDuration / intervalTime);
    const progressInterval = setInterval(() => {
        progress += increment;
        if (progress >= 100) {
            progress = 100;
            progressBar.style.width = `${progress}%`;
            clearInterval(progressInterval);
            setTimeout(() => { attemptGsapInit(); }, 100); // Shorter delay
        }
        progressBar.style.width = `${progress}%`;
    }, intervalTime);
} else {
    console.warn("Loading screen or progress bar not found. Skipping loading animation.");
    window.addEventListener('load', attemptGsapInit);
}

const menuButton = document.getElementById('mobile-menu-button'), mobileMenu = document.getElementById('mobile-menu'),
    navLinksMobile = document.querySelectorAll('#mobile-menu .nav-link-mobile, #mobile-menu .cta-button');
if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.toggle('hidden');
        menuButton.setAttribute('aria-expanded', String(!isHidden));
        mobileMenu.setAttribute('aria-hidden', String(isHidden));
        menuButton.innerHTML = isHidden ? '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>' : '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
    });
    navLinksMobile.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            menuButton.setAttribute('aria-expanded', 'false');
            mobileMenu.setAttribute('aria-hidden', 'true');
            menuButton.innerHTML = '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>';
        });
    });
}

const navbar = document.getElementById('navbar');
if (navbar) ScrollTrigger.create({
    id: 'navbarScrollEffect', start: 'top -70px', end: 99999,
    toggleClass: {className: 'scrolled', targets: navbar}
});

const sections = document.querySelectorAll('main section[id]'),
    navLinksDesktop = document.querySelectorAll('#navbar nav a.nav-link');
let currentActiveSection = null;

function changeNavActiveState() {
    let newActiveSectionId = '';
    const navBarHeight = navbar ? navbar.offsetHeight : 60;
    const threshold = window.innerHeight * 0.4;
    sections.forEach(section => {
        const sectionTop = section.offsetTop - navBarHeight;
        const sectionBottom = sectionTop + section.offsetHeight;
        const scrollPosition = window.scrollY;
        if (scrollPosition >= sectionTop - threshold && scrollPosition < sectionBottom - threshold) {
            newActiveSectionId = section.getAttribute('id');
        }
    });

    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - (navbar?.offsetHeight || 0) - 30) {
        const lastSection = sections[sections.length - 1];
        if (lastSection) newActiveSectionId = lastSection.getAttribute('id');
    } else if (window.scrollY < (sections[0].offsetTop + sections[0].offsetHeight - navBarHeight - threshold) && sections.length > 0) {
        if (sections.length > 1 && window.scrollY < (sections[1].offsetTop - navBarHeight - threshold * 0.5 )) {
            newActiveSectionId = sections[0].getAttribute('id');
        } else if (sections.length === 1) {
            newActiveSectionId = sections[0].getAttribute('id');
        }
    }

    if (newActiveSectionId !== currentActiveSection) {
        currentActiveSection = newActiveSectionId;
        navLinksDesktop.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentActiveSection}`) link.classList.add('active');
        });
    }
}

if (sections.length > 0 && navLinksDesktop.length > 0) {
    window.addEventListener('scroll', changeNavActiveState, {passive: true});
    changeNavActiveState(); // Initial check
}

const contactForm = document.getElementById('contact-form'), formStatusEl = document.getElementById('form-status');
if (contactForm && formStatusEl) {
    contactForm.addEventListener('submit', function (event) {
        event.preventDefault();
        formStatusEl.textContent = 'Envoi en cours...';
        formStatusEl.className = 'mt-3 text-sm text-center text-[var(--accent-primary)]';
        const submitButton = contactForm.querySelector('button[type="submit"]');
        if (submitButton) submitButton.disabled = true;
        setTimeout(() => {
            const isSuccess = Math.random() > 0.1;
            if (isSuccess) {
                formStatusEl.textContent = 'Message envoyé avec succès ! Nous vous répondrons bientôt.';
                formStatusEl.className = 'success';
                contactForm.reset();
            } else {
                formStatusEl.textContent = 'Erreur lors de l\'envoi. Veuillez réessayer plus tard ou nous contacter directement.';
                formStatusEl.className = 'error';
            }
            if (submitButton) submitButton.disabled = false;
            setTimeout(() => { formStatusEl.textContent = ''; formStatusEl.className = 'mt-3 text-sm text-center'; }, 5000);
        }, 1200);
    });
}
const yearSpan = document.getElementById('current-year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear().toString();
console.log("script.js: Parsing finished.");