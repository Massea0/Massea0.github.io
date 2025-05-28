// /Users/a00/arcadis-new-website/script.js

function isGsapReady() {
    const gsapDefined = typeof gsap !== 'undefined';
    const scrollTriggerDefined = typeof ScrollTrigger !== 'undefined';
    const observerDefined = typeof Observer !== 'undefined'; // Keep for potential future use or other features
    const scrollToPluginDefined = typeof ScrollToPlugin !== 'undefined';

    if (!gsapDefined) console.warn("GSAP n'est pas défini. Vérifiez le CDN.");
    if (!scrollTriggerDefined) console.warn("ScrollTrigger n'est pas défini. Vérifiez le CDN.");
    if (!observerDefined) console.warn("Observer n'est pas défini. Vérifiez le CDN.");
    if (!scrollToPluginDefined) console.warn("ScrollToPlugin n'est pas défini. Vérifiez le CDN.");

    return gsapDefined && scrollTriggerDefined && scrollToPluginDefined; // Observer not strictly needed for this version
}

if (isGsapReady()) {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Observer); // Register Observer just in case, but it won't be used for page scroll
} else {
    console.error("GSAP ou un de ses plugins n'a pas pu être chargé. La page pourrait ne pas fonctionner correctement.");
}

// --- DOM Element Declarations ---
const loadingScreen = document.getElementById('loading-screen');
const progressBar = document.getElementById('progress-bar');
const progressPercentage = document.getElementById('progress-percentage');
const themeToggleButton = document.getElementById('theme-toggle-button');
const bodyElement = document.body;
const navbar = document.getElementById('navbar');
const pageContainer = document.getElementById('page-container'); // This is <main id="page-container">
const menuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

const chatbotToggleButton = document.getElementById('chatbot-toggle-button');
const chatbotWindow = document.getElementById('chatbot-window');
const chatbotCloseButton = document.getElementById('chatbot-close-button');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotForm = document.getElementById('chatbot-form');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotSendButton = document.getElementById('chatbot-send-button');

const geminiModal = document.getElementById('gemini-modal');
const geminiModalContent = document.getElementById('gemini-modal-content');
const geminiModalTitle = document.getElementById('gemini-modal-title');
const geminiModalCloseButton = document.getElementById('gemini-modal-close');
const sectorInput = document.getElementById('sector-input');
const generateIdeasButton = document.getElementById('generate-ideas-button');
const geminiResultsContainer = document.getElementById('gemini-results-container');

const contactForm = document.getElementById('contact-form');
const formStatusEl = document.getElementById('form-status');

const mainFooter = document.getElementById('main-footer');
const footerHotzone = document.getElementById('footer-hotzone');
const footerTrigger = document.getElementById('footer-trigger');
// const bottomFooterIndicator = document.getElementById('bottom-footer-indicator'); // REMOVED

let sections = [];
let navLinksArray = [];
const BACKEND_BASE_URL = 'https://arcadis-backend-service-678602035388.europe-west1.run.app';

let currentSectionId = 'hero'; // Track by ID for natural scroll
let isAnimatingScroll = false; // For GSAP ScrollTo animations
let navBarHeight = 76;
let windowLoaded = false;
let assetsLoaded = 0;
const totalAssetsToTrack = 5;
let chatbotHistory = [];
let isChatbotOpen = false;
let currentOfferName = '';
let currentOfferServices = '';
// let observerInstance = null; // Not used for page scroll in this version
// let allowObserverScroll = false; // Not used for page scroll in this version
let heroIntroAnimationComplete = false;
let progressBarFullAnimationComplete = false;

let IS_DESKTOP = window.innerWidth >= 768;

console.log("Script start. Sections array will be populated after DOM load.");
if (navbar) console.log("Navbar element found."); else console.error("Navbar element NOT found!");
if (pageContainer) console.log("Page container (main) element found."); else console.error("Page container (main) element NOT found!");

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function updateDeviceMode() {
    IS_DESKTOP = window.innerWidth >= 768;
    bodyElement.classList.toggle('desktop-layout-active', IS_DESKTOP); // A general class for desktop specific CSS if needed

    // Ensure body can scroll for natural flow
    gsap.set(bodyElement, { overflowY: 'auto', overflowX: 'hidden' });
    gsap.set(pageContainer, { paddingTop: `${navbar ? navbar.offsetHeight : 76}px` });


    // Re-initialize scroll-dependent features
    setupNavLinkScrolling(); // Handles nav link clicks
    setupSectionContentAnimationsWithScrollTrigger(); // Handles content fade-ins
    setupNavbarScrollAnimation(); // Handles navbar visual changes on scroll
    setupFloatingFooterInteraction(); // Handles desktop floating footer

    // Update active nav link based on current scroll or hash
    const hash = window.location.hash.substring(1);
    let sectionToActivate = hash || (sections.length > 0 ? sections[0].id : 'hero');
    if (sections.length > 0) {
        const foundSection = sections.find(s => s.id === sectionToActivate);
        if (!foundSection) sectionToActivate = sections[0].id; // Default to first if hash is invalid
    }
    updateNavigationActiveState(sectionToActivate);


    console.log(`Device mode updated. IS_DESKTOP: ${IS_DESKTOP}. Sections count: ${sections.length}`);
}


window.addEventListener('resize', debounce(updateDeviceMode, 250));


function updateLoadingProgress(increment) {
    if (!progressBar) return;
    let currentProgress = parseFloat(progressBar.style.width) || 0;
    currentProgress = Math.min(currentProgress + increment, 90);
    progressBar.style.width = `${currentProgress}%`;
    if (progressPercentage) progressPercentage.textContent = `${Math.round(currentProgress)}%`;
}

for (let i = 0; i < totalAssetsToTrack; i++) {
    setTimeout(() => {
        assetsLoaded++;
        updateLoadingProgress(90 / totalAssetsToTrack);
    }, i * 200 + Math.random() * 150);
}

function startCustomLoadingAnimation() {
    if (!isGsapReady() || !document.getElementById('mainSVG')) {
        console.warn("GSAP not ready or mainSVG missing for custom loading animation.");
        return;
    }
    gsap.set('#mainSVG', { visibility: 'visible' });
    gsap.set('.dot', { transformOrigin: '50% 50%', attr:{ cx:'random(350, 450)', cy: 440, r: 'random(4, 20)' } });
    gsap.set('.outsideDot', { transformOrigin: '50% 50%', attr:{ cx:'random(370, 420)', cy: 420, r: 'random(3, 19)' } });
    gsap.timeline().to('.dots1 .dot', { duration: 'random(2,8)', attr:{ cy: 'random(-220, -320)' }, stagger: { each: 0.16, repeat: -1, repeatRefresh: false }, ease: 'linear' }).seek(100);
    gsap.timeline().to('.dots2 .dot', { duration: 'random(2,5)', attr:{ cy: 'random(-220, -320)' }, stagger: { each: 0.16, repeat: -1, repeatRefresh: false }, ease: 'sine.in' }).seek(100);
    gsap.timeline().to('.dots3 .dot', { duration: 'random(6,12)', attr:{ cy: 'random(-220, -320)' }, stagger: { each: 0.16, repeat: -1, repeatRefresh: false }, ease: 'sine.in' }).seek(100);
    gsap.timeline().to('.dots4 .dot', { duration: 'random(3,9)', attr:{ cy: 'random(-220, -320)' }, stagger: { each: 0.16, repeat: -1, repeatRefresh: false }, ease: 'sine.in' }).seek(100);
    gsap.timeline().to('.dots5 .outsideDot', { duration: 'random(3,9)', attr:{ cy: 'random(-220, -320)', r: 0 }, stagger: { each: 0.16, repeat: -1, repeatRefresh: false }, ease: 'power2.in' }).seek(100);
    gsap.to('.outline', { duration: gsap.utils.wrap([7, 6.1, 5.2]), svgOrigin: '400 300', rotation: gsap.utils.wrap([-360, -360]), ease: 'linear', stagger: { each: 1, repeat: -1 } }).seek(200);
}

function applyTheme(theme) {
    bodyElement.classList.toggle('light-mode', theme === 'light');
    if (themeToggleButton) themeToggleButton.setAttribute('aria-pressed', String(theme === 'light'));
}
function toggleTheme() {
    const newTheme = bodyElement.classList.contains('light-mode') ? 'dark' : 'light';
    const moonIcon = themeToggleButton?.querySelector('.moon-icon');
    const sunIcon = themeToggleButton?.querySelector('.sun-icon');

    if (moonIcon && sunIcon) {
        const tl = gsap.timeline();
        if (newTheme === 'dark') {
            tl.to(moonIcon, { opacity: 0, y: '100%', rotation: 90, scale: 0.5, duration: 0.25, ease: 'power2.in' })
                .set(moonIcon, { display: 'none' })
                .set(sunIcon, { display: 'block', y: '-100%', rotation: -90, scale: 0.5 })
                .to(sunIcon, { opacity: 1, y: '0%', rotation: 0, scale: 1, duration: 0.25, ease: 'power2.out' });
        } else {
            tl.to(sunIcon, { opacity: 0, y: '100%', rotation: 90, scale: 0.5, duration: 0.25, ease: 'power2.in' })
                .set(sunIcon, { display: 'none' })
                .set(moonIcon, { display: 'block', y: '-100%', rotation: -90, scale: 0.5 })
                .to(moonIcon, { opacity: 1, y: '0%', rotation: 0, scale: 1, duration: 0.25, ease: 'power2.out' });
        }
    }
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
}
function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    let initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    applyTheme(initialTheme);

    const moonIcon = themeToggleButton?.querySelector('.moon-icon');
    const sunIcon = themeToggleButton?.querySelector('.sun-icon');
    if (moonIcon && sunIcon) {
        if (initialTheme === 'light') {
            moonIcon.style.cssText = 'display: block; opacity: 1; transform: translateY(0) rotate(0) scale(1);';
            sunIcon.style.cssText = 'display: none; opacity: 0; transform: translateY(100%) rotate(-90deg) scale(0.5);';
        } else {
            moonIcon.style.cssText = 'display: none; opacity: 0; transform: translateY(-100%) rotate(90deg) scale(0.5);';
            sunIcon.style.cssText = 'display: block; opacity: 1; transform: translateY(0) rotate(0) scale(1);';
        }
    }
}
if (themeToggleButton) themeToggleButton.addEventListener('click', toggleTheme);


function tryProceedToContentDisplay() {
    console.log(`Trying to proceed: HeroIntro: ${heroIntroAnimationComplete}, ProgressBarFull: ${progressBarFullAnimationComplete}`);
    if (heroIntroAnimationComplete && progressBarFullAnimationComplete) {
        console.log("All conditions met. Hiding loading screen.");
        if (loadingScreen && loadingScreen.style.display !== 'none') {
            gsap.to(loadingScreen, {
                opacity: 0,
                duration: 0.5,
                ease: "power1.out",
                onComplete: () => {
                    if (loadingScreen) loadingScreen.style.display = 'none';
                    console.log("Loading screen hidden.");
                    // Content animations are now handled by ScrollTrigger in setupSectionContentAnimationsWithScrollTrigger
                    // For the very first section (hero), it should trigger as it's already in view.
                }
            });
        } else {
            console.log("Loading screen already hidden or not found.");
        }
    } else {
        console.log("Conditions not yet met to hide loading screen.");
    }
}

function initializeHeroAnimation() {
    console.log("Initializing Hero Animation...");
    if (!isGsapReady()) {
        heroIntroAnimationComplete = true;
        progressBarFullAnimationComplete = true;
        tryProceedToContentDisplay();
        return null;
    }
    const heroSection = document.getElementById('hero');
    if (!heroSection) {
        console.warn("Section Hero non trouvée pour initializeHeroAnimation");
        heroIntroAnimationComplete = true;
        progressBarFullAnimationComplete = true;
        tryProceedToContentDisplay();
        return null;
    }

    const heroMainLogo = heroSection.querySelector('.hero-main-logo-container');
    const heroSupertitle = heroSection.querySelector('#hero-supertitle');
    const heroTitle = heroSection.querySelector('#hero-title');
    const heroTitleChars = heroTitle ? Array.from(heroTitle.querySelectorAll('.char-title')) : [];
    const heroSubtitle = heroSection.querySelector('#hero-subtitle');
    const heroCtas = heroSection.querySelectorAll('#hero-ctas a');
    const scrollDownArrowContainer = heroSection.querySelector('.scroll-down-arrow-container');

    gsap.set([heroMainLogo, heroSupertitle, heroSubtitle, heroCtas, scrollDownArrowContainer].filter(el => el), {autoAlpha: 0, y: 20, scale: 0.95});
    if (heroTitleChars.length > 0) gsap.set(heroTitleChars, {opacity: 0, y: 20, rotationX: -80, transformOrigin: "center center -20px"});

    const masterIntroTl = gsap.timeline({
        delay: 0.3,
        onComplete: () => {
            console.log("Master Intro TL complete.");
            heroIntroAnimationComplete = true;
            tryProceedToContentDisplay();
        }
    });

    if(heroMainLogo) masterIntroTl.to(heroMainLogo, {autoAlpha: 1, y:0, scale:1, duration: 0.7, ease: 'elastic.out(1, 0.7)'}, 0);
    if(heroSupertitle) masterIntroTl.to(heroSupertitle, {autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.1);
    if (heroTitleChars.length > 0) {
        masterIntroTl.to(heroTitleChars, { opacity: 1, y: 0, rotationX: 0, stagger: 0.035, duration: 0.55, ease: "back.out(1.1)" }, ">-0.3" );
    }
    if(heroSubtitle) masterIntroTl.to(heroSubtitle, {autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, ">-0.4");
    if(heroCtas.length > 0) masterIntroTl.to(heroCtas, {autoAlpha: 1, y:0, scale:1, duration: 0.6, stagger: 0.1, ease: 'elastic.out(1, 0.7)' }, ">-0.3");
    if(scrollDownArrowContainer) masterIntroTl.to(scrollDownArrowContainer, { autoAlpha: 1, duration: 0.5 }, ">-0.2");

    console.log("Hero animation timeline created.");
    return masterIntroTl;
}

function initializeSectionContentAnimations(sectionElement) {
    if (!sectionElement || !isGsapReady()) {
        console.warn("initializeSectionContentAnimations: Section or GSAP not ready for", sectionElement ? sectionElement.id : 'undefined section');
        return;
    }

    if (sectionElement.dataset.contentAnimated === 'true') {
        console.log(`Content for section ${sectionElement.id} already animated. Skipping.`);
        return;
    }
    console.log("Initializing content animations for section:", sectionElement.id);

    const animationConfigs = [
        { selector: ".section-supertitle, .section-title, .section-subtitle", initial: { autoAlpha: 0, y: 20 }, final: { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, cleanupClass: "g-fade-up" },
        { selector: ".g-fade-up", initial: { autoAlpha: 0, y: 20 }, final: { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, cleanupClass: "g-fade-up" },
        { selector: ".g-fade-in", initial: { autoAlpha: 0 }, final: { autoAlpha: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, cleanupClass: "g-fade-in" },
        { selector: ".g-scale-in:not(.hero-main-logo-container):not(#hero-ctas a)", initial: { autoAlpha: 0, scale: 0.92 }, final: { autoAlpha: 1, scale: 1, duration: 0.7, stagger: 0.1, ease: 'elastic.out(1, 0.6)' }, cleanupClass: "g-scale-in" },
        { selector: ".g-fade-left", initial: { autoAlpha: 0, x: 20 }, final: { autoAlpha: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, cleanupClass: "g-fade-left" },
        { selector: ".g-fade-right", initial: { autoAlpha: 0, x: -20 }, final: { autoAlpha: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, cleanupClass: "g-fade-right" },
        { selector: ".offre-card, .expertise-item", initial: { autoAlpha: 0, y: 20 }, final: { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'expo.out' } },
        { selector: "#pourquoi ul li", initial: { autoAlpha: 0, x: -20 }, final: { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.07, ease: 'power2.out' } },
        { selector: "#contact-form > div, #contact-form button, .contact-info-item", initial: { autoAlpha: 0, y: 20 }, final: { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power2.out' } }
    ];

    const tl = gsap.timeline({
        onComplete: () => {
            sectionElement.dataset.contentAnimated = 'true';
            console.log(`Content animation complete for ${sectionElement.id}. Marked as animated and cleaning up classes.`);
            animationConfigs.forEach(config => {
                if (config.cleanupClass) {
                    const elements = sectionElement.querySelectorAll(config.selector);
                    if (elements.length > 0) {
                        elements.forEach(el => el.classList.remove(config.cleanupClass));
                    }
                }
            });
        }
    });

    animationConfigs.forEach(config => {
        const elements = sectionElement.querySelectorAll(config.selector);
        if (elements.length > 0) {
            gsap.set(elements, config.initial);
            tl.to(elements, { ...config.final, overwrite: 'auto' }, config.timelinePos || ">-0.4");
        }
    });

    if (sectionElement.id === 'hero') {
        const heroTitleChars = sectionElement.querySelectorAll('#hero-title .char-title');
        if (heroTitleChars.length > 0) {
            gsap.set(heroTitleChars, {opacity: 0, y: 20, rotationX: -80, transformOrigin: "center center -20px"});
            tl.to(heroTitleChars, { opacity: 1, y: 0, rotationX: 0, stagger: 0.035, duration: 0.55, ease: "back.out(1.1)", overwrite: 'auto' }, 0.1);
        }
    }
}

// REMOVED updateBottomFooterIndicator as it's no longer used

function updateNavigationActiveState(sectionId) {
    if (!sectionId && sections.length > 0) {
        sectionId = sections[0].id; // Default to first section if none provided
    } else if (!sectionId) {
        sectionId = 'hero'; // Absolute default
    }

    currentSectionId = sectionId; // Update global tracker
    console.log("Updating active state to section ID:", sectionId);

    navLinksArray.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        // Href can be "/", "/section", "#section"
        let idFromLink = '';
        if (linkHref === '/' || linkHref === '#hero') {
            idFromLink = 'hero';
        } else if (linkHref.startsWith('#')) {
            idFromLink = linkHref.substring(1);
        } else if (linkHref.startsWith('/')) {
            idFromLink = linkHref.substring(1);
        }

        if (idFromLink === sectionId) {
            link.classList.add('active');
        }
    });

    // Update URL path without adding to history for scroll-triggered updates
    // For direct clicks, history is handled in handleNavLinkClick
    const path = sectionId === 'hero' ? '/' : `/${sectionId}`;
    if (window.location.pathname !== path && window.location.hash !== `#${sectionId}`) {
        // Only pushState if it's a significant change, not just a hash update from scroll
        // For natural scroll, we might prefer to only update on explicit nav clicks
        // For now, let's keep it simple and update path for desktop-like feel
        // history.replaceState({ sectionId: sectionId }, '', path);
    }
}


function setupNavLinkScrolling() {
    navLinksArray.forEach(link => {
        link.removeEventListener('click', handleNavLinkClick); // Prevent duplicates
        link.addEventListener('click', handleNavLinkClick);
    });
}

function handleNavLinkClick(e) {
    e.preventDefault();
    if (isAnimatingScroll) return;

    const targetHref = this.getAttribute('href');
    let targetId = '';

    if (targetHref === '/' || targetHref === '#hero') {
        targetId = 'hero';
    } else if (targetHref.startsWith('#')) {
        targetId = targetHref.substring(1);
    } else if (targetHref.startsWith('/')) {
        targetId = targetId.substring(1); // Corrected: Should be targetHref.substring(1)
    }

    const targetElement = document.getElementById(targetId);

    if (targetElement) {
        isAnimatingScroll = true;
        gsap.to(window, {
            duration: 0.8,
            scrollTo: { y: targetElement, offsetY: navbar ? navbar.offsetHeight : 0 },
            ease: "power2.inOut",
            onComplete: () => {
                isAnimatingScroll = false;
                updateNavigationActiveState(targetId); // Update nav and URL
                // Update URL path after scroll for cleaner address bar
                const path = targetId === 'hero' ? '/' : `/${targetId}`;
                history.pushState({ sectionId: targetId }, '', path);
            }
        });

        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
            if(menuButton) {
                menuButton.setAttribute('aria-expanded', 'false');
                menuButton.innerHTML = '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>';
                mobileMenu.setAttribute('aria-hidden', 'true');
            }
        }
    } else {
        console.warn(`Navigation target element not found for ID: ${targetId}`);
    }
}

function setupSectionContentAnimationsWithScrollTrigger() {
    if (!isGsapReady() || sections.length === 0) return;

    sections.forEach((section) => {
        // Animate general content elements
        const contentElements = section.querySelectorAll(".g-fade-up, .g-fade-in, .g-scale-in, .g-fade-left, .g-fade-right, .offre-card, .expertise-item, #pourquoi ul li, #contact-form > div, #contact-form button, .contact-info-item, .section-supertitle, .section-title, .section-subtitle");
        if (contentElements.length > 0) {
            ScrollTrigger.create({
                trigger: section,
                start: "top 80%", // When 80% of the section is visible from the top
                onEnter: () => initializeSectionContentAnimations(section),
                once: true // Ensures the animation only runs once per section
            });
        }

        // Specific animation for hero title characters if it's the hero section
        if (section.id === 'hero') {
            const heroTitleChars = section.querySelectorAll('#hero-title .char-title');
            if (heroTitleChars.length > 0 && !section.dataset.heroTitleAnimated) {
                ScrollTrigger.create({
                    trigger: section,
                    start: "top 80%",
                    onEnter: () => {
                        if (!section.dataset.heroTitleAnimated) {
                            gsap.fromTo(heroTitleChars,
                                {opacity: 0, y: 20, rotationX: -80, transformOrigin: "center center -20px"},
                                { opacity: 1, y: 0, rotationX: 0, stagger: 0.035, duration: 0.55, ease: "back.out(1.1)"}
                            );
                            section.dataset.heroTitleAnimated = 'true';
                        }
                    },
                    once: true
                });
            }
        }
    });
}


function setupNavbarScrollAnimation() { // Renamed from setupNavbarAnimation for clarity
    if (!navbar || !isGsapReady()) {
        console.warn("Navbar or GSAP not ready for navbar scroll animation setup.");
        return;
    }
    ScrollTrigger.getById('navbar-scroll-visual-trigger')?.kill(); // Kill previous if any
    ScrollTrigger.create({
        id: 'navbar-scroll-visual-trigger',
        start: "top top-=" + ((navbar ? navbar.offsetHeight : 76) - 10), // Trigger just after navbar height
        end: 99999,
        toggleClass: { targets: navbar, className: "scrolled" }, // Add 'scrolled' class
        onUpdate: self => {
            // Animate based on the 'scrolled' class or directly
            if (self.isActive) {
                gsap.to(navbar, {
                    paddingTop: '0.4rem', paddingBottom: '0.4rem',
                    backgroundColor: bodyElement.classList.contains('light-mode') ? 'rgba(255, 255, 255, 0.9)' : 'rgba(5, 22, 32, 0.85)',
                    boxShadow: bodyElement.classList.contains('light-mode') ? '0 2px 10px var(--shadow-color-light)' : '0 4px 15px var(--shadow-color-medium)',
                    backdropFilter: 'blur(10px)', webkitBackdropFilter: 'blur(10px)',
                    duration: 0.3, ease: 'power2.out', overwrite: 'auto'
                });
            } else {
                gsap.to(navbar, {
                    paddingTop: '0.75rem', paddingBottom: '0.75rem',
                    backgroundColor: 'transparent', boxShadow: 'none',
                    backdropFilter: 'none', webkitBackdropFilter: 'none',
                    duration: 0.3, ease: 'power2.out', overwrite: 'auto'
                });
            }
        }
    });
    console.log("Navbar scroll animation setup complete.");
}


function handlePopState() {
    // For natural scroll, the browser handles scrolling to the hash.
    // We just need to update the active nav link.
    const hash = window.location.hash.substring(1);
    let sectionIdToActivate = hash || (sections.length > 0 ? sections[0].id : 'hero');
    if (sections.length > 0) {
        const foundSection = sections.find(s => s.id === sectionIdToActivate);
        if (!foundSection) sectionIdToActivate = sections[0].id;
    }
    updateNavigationActiveState(sectionIdToActivate);

    // Smoothly scroll to the section if it's not already in view (e.g., after manual URL change + refresh)
    const targetElement = document.getElementById(sectionIdToActivate);
    if (targetElement) {
        gsap.to(window, {
            duration: 0.5, // Shorter duration for popstate adjustment
            scrollTo: { y: targetElement, offsetY: navbar ? navbar.offsetHeight : 0 },
            ease: "power2.out"
        });
    }
    console.log("Popstate handled, scrolled to:", sectionIdToActivate);
}


function setupFloatingFooterInteraction() {
    if (!mainFooter || !footerHotzone || !footerTrigger ) { // Removed bottomFooterIndicator
        console.warn("Floating footer elements missing.");
        if (mainFooter) {
            mainFooter.style.pointerEvents = 'auto';
            gsap.set(mainFooter, { x: "0%", y: "0%", autoAlpha: 1, scale: 1, position: 'relative' });
        }
        return;
    }

    if (IS_DESKTOP) {
        console.log("Setting up Desktop footer interaction.");
        if(footerHotzone) footerHotzone.style.display = 'block';
        if(footerTrigger) footerTrigger.style.display = 'flex';
        // if(bottomFooterIndicator) bottomFooterIndicator.style.display = 'flex'; // REMOVED

        gsap.set(mainFooter, { x: "-100%", autoAlpha: 0, scale: 0.95, pointerEvents: 'none', position: 'fixed', bottom: 'auto', top: '50%', left: '1rem', y: '-50%' });
        gsap.set(footerTrigger, { x: "0%" });
        let hoverTimeout;
        const showFooter = () => {
            clearTimeout(hoverTimeout);
            gsap.to(mainFooter, { x: "0%", autoAlpha: 1, scale: 1, duration: 0.3, ease: "power2.out", overwrite: 'auto', onStart: () => {if(mainFooter) mainFooter.style.pointerEvents = 'auto'} });
            gsap.to(footerTrigger, { x: "0%", duration: 0.2, ease: "power2.out", overwrite: 'auto' });
        };
        const startHideFooterTimer = () => {
            clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                gsap.to(mainFooter, { x: "-100%", autoAlpha: 0, scale: 0.95, duration: 0.3, ease: "power2.in", overwrite: 'auto', onComplete: () => {if(mainFooter) mainFooter.style.pointerEvents = 'none'} });
                gsap.to(footerTrigger, { x: "0%", duration: 0.2, ease: "power2.in", overwrite: 'auto' });
            }, 250);
        };
        footerHotzone.addEventListener('mouseenter', showFooter);
        mainFooter.addEventListener('mouseenter', showFooter);
        footerTrigger.addEventListener('mouseenter', showFooter);
        footerHotzone.addEventListener('mouseleave', startHideFooterTimer);
        mainFooter.addEventListener('mouseleave', startHideFooterTimer);
        footerTrigger.addEventListener('mouseleave', startHideFooterTimer);
        const footerNavLinks = mainFooter.querySelectorAll('a.nav-trigger');
        footerNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                clearTimeout(hoverTimeout);
                gsap.to(mainFooter, { x: "-100%", autoAlpha: 0, scale: 0.95, duration: 0.3, ease: "power2.in", overwrite: 'auto', onComplete: () => {if(mainFooter) mainFooter.style.pointerEvents = 'none'} });
                gsap.to(footerTrigger, { x: "0%", duration: 0.2, ease: "power2.in", overwrite: 'auto' });
            });
        });
    } else {
        console.log("Setting up Mobile footer behavior.");
        if(mainFooter) {
            mainFooter.style.pointerEvents = 'auto';
            gsap.set(mainFooter, { x: "0%", y: "0%", autoAlpha: 1, scale: 1, position: 'relative', clearProps: "top,left,bottom,transform" });
        }
        if(footerHotzone) footerHotzone.style.display = 'none';
        if(footerTrigger) footerTrigger.style.display = 'none';
        // if(bottomFooterIndicator) bottomFooterIndicator.style.display = 'none'; // REMOVED
    }
}

function initializeCoreApp() {
    console.log("Core App Initialization Started.");
    sections = gsap.utils.toArray("main#page-container > section.page-section");
    navLinksArray = gsap.utils.toArray("#navbar a.nav-trigger, #mobile-menu a.nav-trigger, footer a.nav-trigger");
    console.log("Sections populated in initializeCoreApp. Count:", sections.length);

    if (sections.length === 0) {
        console.error("CRITICAL: No sections found in initializeCoreApp! Page will not function correctly.");
        return;
    }

    if (navbar) navBarHeight = navbar.offsetHeight;

    updateDeviceMode(); // Sets up layout and desktop/mobile specific logic
    initializeHeroAnimation();
    loadThemePreference();
    // setupNavLinkScrolling, setupSectionContentAnimationsWithScrollTrigger, etc. are called within updateDeviceMode

    window.addEventListener('popstate', handlePopState); // Listen for browser back/forward

    console.log("Core App Initialization Finished.");
}


function attemptGsapInit(maxAttempts = 5, interval = 250) {
    let attempts = 0;
    function tryInit() {
        console.log(`Attempting GSAP Init (Attempt: ${attempts + 1})`);
        if (isGsapReady() && windowLoaded) {
            console.log("GSAP ready and window loaded. Running core app initialization...");
            initializeCoreApp();
        } else {
            attempts++;
            if (attempts < maxAttempts) {
                console.log(`GSAP or window not ready. Retrying in ${interval}ms...`);
                setTimeout(tryInit, interval);
            } else {
                console.error("GSAP init failed after multiple attempts.");
                heroIntroAnimationComplete = true;
                progressBarFullAnimationComplete = true;
                tryProceedToContentDisplay();
                updateDeviceMode(); // Attempt to set basic layout
                setupFloatingFooterInteraction();
                if (navbar) {
                    navbar.style.cssText = "background-color: transparent; box-shadow: none; padding-top: 0.75rem; padding-bottom: 0.75rem;";
                }
            }
        }
    }
    tryInit();
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded fired.");
    if (isGsapReady() && document.getElementById('mainSVG')) {
        startCustomLoadingAnimation();
    }
});

window.addEventListener('load', () => {
    console.log("Window load event fired.");
    windowLoaded = true;
    if (progressBar) {
        gsap.to(progressBar, {
            width: "100%", duration: 0.4, ease: "power1.out",
            onUpdate: function() {
                if (progressPercentage) progressPercentage.textContent = `${Math.round(this.progress() * 100)}%`;
            },
            onComplete: () => {
                console.log("Progress bar reached 100%.");
                progressBarFullAnimationComplete = true;
                if (progressPercentage) gsap.to(progressPercentage, {opacity: 0, duration: 0.3, delay: 0.1});
                tryProceedToContentDisplay();
            }
        });
    } else {
        progressBarFullAnimationComplete = true;
        tryProceedToContentDisplay();
    }
    attemptGsapInit();
});

// Mobile Menu Toggle
if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.toggle('hidden');
        menuButton.setAttribute('aria-expanded', String(!isHidden));
        mobileMenu.setAttribute('aria-hidden', String(isHidden));
        menuButton.innerHTML = isHidden ? '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>' : '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
    });
}

// --- Chatbot Logic ---
function toggleChatbot() {
    isChatbotOpen = !isChatbotOpen;
    if(chatbotWindow) chatbotWindow.classList.toggle('active', isChatbotOpen);
    if(chatbotToggleButton) chatbotToggleButton.classList.toggle('active', isChatbotOpen);
    if (isChatbotOpen) {
        if(chatbotWindow) {
            chatbotWindow.style.pointerEvents = 'auto';
            gsap.to(chatbotWindow, { y: window.innerWidth < 768 ? '0%' : '0%', opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' });
        }
        if(chatbotInput) chatbotInput.focus();
    } else {
        if(chatbotWindow) {
            gsap.to(chatbotWindow, { y: window.innerWidth < 768 ? '100%' : '0%', opacity: window.innerWidth < 768 ? 1: 0, scale: window.innerWidth < 768 ? 1: 0.90, duration: 0.25, ease: 'power2.in', onComplete: () => {
                    if(chatbotWindow) chatbotWindow.style.pointerEvents = 'none';
                }});
        }
    }
}
function addMessageToChat(message, sender, isThinking = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chatbot-message', sender === 'user' ? 'user-message' : 'bot-message');
    if (isThinking) messageDiv.classList.add('thinking');
    const p = document.createElement('p');
    let formattedMessage = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
    const lines = formattedMessage.split('\n');
    let listOpen = false; let htmlContent = '';
    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
            if (!listOpen) { htmlContent += '<ul>'; listOpen = true; }
            htmlContent += `<li>${trimmedLine.substring(2)}</li>`;
        } else {
            if (listOpen) { htmlContent += '</ul>'; listOpen = false; }
            htmlContent += (htmlContent.endsWith('</ul>') || htmlContent === '' ? '' : '<br>') + line;
        }
    });
    if (listOpen) htmlContent += '</ul>';
    p.innerHTML = htmlContent;
    messageDiv.appendChild(p);
    if(chatbotMessages) { chatbotMessages.appendChild(messageDiv); chatbotMessages.scrollTop = chatbotMessages.scrollHeight; }
    return messageDiv;
}
async function handleChatbotSubmit(event) {
    event.preventDefault();
    if (!chatbotInput || !chatbotSendButton) return;
    const userInput = chatbotInput.value.trim();
    if (!userInput) return;
    addMessageToChat(userInput, 'user');
    chatbotHistory.push({ role: "user", parts: [{ text: userInput }] });
    chatbotInput.value = ''; chatbotSendButton.disabled = true; chatbotInput.disabled = true;
    const thinkingMessageDiv = addMessageToChat("Arcadis réfléchit...", 'bot', true);
    try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json', }, body: JSON.stringify({ history: chatbotHistory }), });
        if(thinkingMessageDiv) thinkingMessageDiv.remove();
        if (!response.ok) { const errorData = await response.json().catch(() => ({ error: "Erreur de communication avec le serveur."})); addMessageToChat(`Désolé, une erreur est survenue : ${errorData.error || response.statusText}`, 'bot'); return; }
        const data = await response.json();
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
            const botResponse = data.candidates[0].content.parts[0].text;
            addMessageToChat(botResponse, 'bot');
            chatbotHistory.push({ role: "model", parts: [{ text: botResponse }] });
        } else { addMessageToChat("Je n'ai pas de réponse pour le moment. Essayez de reformuler.", 'bot'); chatbotHistory.push({ role: "model", parts: [{ text: "Je n'ai pas de réponse pour le moment. Essayez de reformuler." }] });}
    } catch (error) { console.error('Erreur chatbot:', error); if(thinkingMessageDiv) thinkingMessageDiv.remove(); addMessageToChat("Désolé, une erreur de connexion est survenue. Veuillez réessayer.", 'bot');
    } finally { if(chatbotSendButton) chatbotSendButton.disabled = false; if(chatbotInput) { chatbotInput.disabled = false; chatbotInput.focus(); } }
}

if (chatbotToggleButton && chatbotWindow && chatbotCloseButton && chatbotForm) {
    chatbotToggleButton.addEventListener('click', toggleChatbot);
    chatbotCloseButton.addEventListener('click', toggleChatbot);
    chatbotForm.addEventListener('submit', handleChatbotSubmit);
    if(chatbotWindow) chatbotWindow.style.pointerEvents = 'none';
}


// --- Formulaire de Contact Logic ---
if (contactForm && formStatusEl) {
    contactForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const name = contactForm.elements['name'].value.trim();
        const email = contactForm.elements['email'].value.trim();
        const subject = contactForm.elements['subject'].value.trim();
        const message = contactForm.elements['message'].value.trim();
        const submitButton = contactForm.querySelector('button[type="submit"]');
        if (!name || !email || !subject || !message) { if(formStatusEl) { formStatusEl.textContent = 'Veuillez remplir tous les champs requis.'; formStatusEl.className = 'error'; setTimeout(() => { if(formStatusEl) { formStatusEl.textContent = ''; formStatusEl.className = 'mt-4 text-sm text-center text-[var(--text-secondary)]';} }, 3000); } return; }
        if(formStatusEl) { formStatusEl.textContent = 'Préparation de votre message...'; formStatusEl.className = 'mt-4 text-sm text-center text-[var(--accent-primary)]'; }
        if (submitButton) submitButton.disabled = true;
        const mailtoEmail = 'dcamara@arcadis.tech';
        const mailtoSubject = encodeURIComponent(`Message de ${name} - ${subject}`);
        const mailtoBody = encodeURIComponent( `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}` );
        window.location.href = `mailto:${mailtoEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;
        setTimeout(() => {
            if(formStatusEl) { formStatusEl.textContent = 'Si votre client de messagerie ne s\'ouvre pas, veuillez nous contacter directement.'; formStatusEl.className = 'success'; }
            if(contactForm) contactForm.reset();
            if (submitButton) submitButton.disabled = false;
            setTimeout(() => { if(formStatusEl) { formStatusEl.textContent = ''; formStatusEl.className = 'mt-4 text-sm text-center text-[var(--text-secondary)]'; } }, 7000);
        }, 1500);
    });
}

const yearSpan = document.getElementById('current-year');
if (yearSpan) { yearSpan.textContent = new Date().getFullYear().toString(); }

// --- Gemini Idea Generator Modal Logic ---
function openGeminiModal(offerName, offerServices) {
    currentOfferName = offerName; currentOfferServices = offerServices;
    if(geminiModalTitle) geminiModalTitle.textContent = `Idées de projets pour ${offerName} dans votre secteur`;
    if(sectorInput) sectorInput.value = '';
    if(geminiResultsContainer) geminiResultsContainer.innerHTML = '<p class="text-center italic">Entrez votre secteur et cliquez sur "Générer".</p>';
    if (geminiModal && geminiModalContent) {
        geminiModal.classList.remove('hidden');
        gsap.to(geminiModal, { opacity: 1, duration: 0.3 });
        gsap.to(geminiModalContent, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
    }
}
function closeGeminiModal() {
    if (geminiModal && geminiModalContent) {
        gsap.to(geminiModalContent, { scale: 0.95, opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => {
                gsap.to(geminiModal, { opacity: 0, duration: 0.25, onComplete: () => { if (geminiModal) geminiModal.classList.add('hidden'); } });
            }});
    }
}
async function fetchGeminiIdeas() {
    if (!sectorInput || !geminiResultsContainer || !generateIdeasButton) return;
    const sector = sectorInput.value.trim();
    if (!sector) { if(geminiResultsContainer) geminiResultsContainer.innerHTML = '<p class="text-red-500 text-center">Veuillez entrer un secteur.</p>'; return; }
    if(geminiResultsContainer) geminiResultsContainer.innerHTML = '<div class="loader"></div><p class="text-center">Génération...</p>';
    if(generateIdeasButton) generateIdeasButton.disabled = true;
    try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/generate-ideas`, { method: 'POST', headers: { 'Content-Type': 'application/json', }, body: JSON.stringify({ offerName: currentOfferName, offerServices: currentOfferServices, sector: sector }), });
        if (!response.ok) { let errorMsg = `Erreur serveur: ${response.statusText}`; try { const errorData = await response.json(); errorMsg = errorData.error || errorData.details || errorMsg; } catch (e) {} throw new Error(errorMsg); }
        const data = await response.json();
        if (data.candidates && data.candidates.length > 0 && data.candidates[0]?.content?.parts[0]?.text) {
            let rawIdeasText = data.candidates[0].content.parts[0].text;
            const lines = rawIdeasText.split(/\r\n|\n|\r/); let htmlList = '';
            lines.forEach(line => { const trimmedLine = line.trim(); if (trimmedLine.match(/^[\*-]\s+/)) { const listItemText = trimmedLine.substring(trimmedLine.indexOf(' ') + 1).trim(); if (listItemText) htmlList += `<li class="mt-1">${listItemText}</li>`; } else if (trimmedLine && !trimmedLine.match(/^[\*-]$/)) { htmlList += `<li class="mt-1">${trimmedLine}</li>`; } });
            if (htmlList) { if(geminiResultsContainer) geminiResultsContainer.innerHTML = `<ul class="list-disc pl-5 space-y-1">${htmlList}</ul>`; const listItems = geminiResultsContainer?.querySelectorAll('li'); if (listItems?.length > 0) { gsap.fromTo(listItems, { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.15, duration: 0.4, ease: 'power2.out' }); }
            } else { if(geminiResultsContainer) geminiResultsContainer.innerHTML = '<p class="text-center">Aucune idée exploitable.</p>'; }
        } else if (data.error) { if(geminiResultsContainer) geminiResultsContainer.innerHTML = `<p class="text-red-500 text-center">${data.error}${data.details ? ': ' + data.details : ''}</p>`;
        } else { if(geminiResultsContainer) geminiResultsContainer.innerHTML = '<p class="text-center">Réponse inattendue.</p>'; }
    } catch (error) { console.error('Erreur idées Gemini:', error); if(geminiResultsContainer) geminiResultsContainer.innerHTML = `<p class="text-red-500 text-center">Erreur: ${error.message}.</p>`;
    } finally { if(generateIdeasButton) generateIdeasButton.disabled = false; }
}

if(geminiModalCloseButton) geminiModalCloseButton.addEventListener('click', closeGeminiModal);
if(generateIdeasButton) generateIdeasButton.addEventListener('click', fetchGeminiIdeas);
if(geminiModal) { geminiModal.addEventListener('click', (event) => { if (event.target === geminiModal) closeGeminiModal(); }); }

document.querySelectorAll('.offre-card .gemini-idea-button').forEach(button => {
    const card = button.closest('.offre-card');
    if (card) {
        const offerName = card.dataset.offreNom;
        const offerServices = card.dataset.offreServices;
        if (offerName && offerServices) {
            button.addEventListener('click', () => openGeminiModal(offerName, offerServices));
        }
    }
});