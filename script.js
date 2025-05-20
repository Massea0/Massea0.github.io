console.log("script.js: Parsing started");

!function (e, t) {
    "object" == typeof exports && "undefined" != typeof module ? t(exports) : "function" == typeof define && define.amd ? define(["exports"], t) : t((e = e || self).window = e.window || {})
}(this, function (e) {
    "use strict";

    function l() {
        return "undefined" != typeof window
    }

    function m() {
        return t || l() && (t = window.gsap) && t.registerPlugin && t
    }

    function p(e) {
        return Math.round(1e4 * e) / 1e4
    }

    function q(e) {
        return parseFloat(e) || 0
    }

    function r(e, t) {
        var r = q(e);
        return ~e.indexOf("%") ? r / 100 * t : r
    }

    function s(e, t) {
        return q(e.getAttribute(t))
    }

    function u(e, t, r, n, s, i) {
        return D(Math.pow((q(r) - q(e)) * s, 2) + Math.pow((q(n) - q(t)) * i, 2))
    }

    function v(e) {
        return console.warn(e)
    }

    function w(e) {
        return "non-scaling-stroke" === e.getAttribute("vector-effect")
    }

    function z(e) {
        if (!(e = k(e)[0])) return 0;
        var t, r, n, i, o, a, f, h = e.tagName.toLowerCase(), l = e.style, d = 1, c = 1;
        w(e) && (c = e.getScreenCTM(), d = D(c.a * c.a + c.b * c.b), c = D(c.d * c.d + c.c * c.c));
        try {
            r = e.getBBox()
        } catch (e) {
            v("Some browsers won't measure invisible elements (like display:none or masks inside defs).")
        }
        var g = r || {x: 0, y: 0, width: 0, height: 0}, _ = g.x, y = g.y, x = g.width, m = g.height;
        if (r && (x || m) || !M[h] || (x = s(e, M[h][0]), m = s(e, M[h][1]), "rect" !== h && "line" !== h && (x *= 2, m *= 2), "line" === h && (_ = s(e, "x1"), y = s(e, "y1"), x = Math.abs(x - _), m = Math.abs(m - y))), "path" === h) i = l.strokeDasharray, l.strokeDasharray = "none", t = e.getTotalLength() || 0, p(d) !== p(c) && !b && (b = 1) && v("Warning: <path> length cannot be measured when vector-effect is non-scaling-stroke and the element isn't proportionally scaled."), t *= (d + c) / 2, l.strokeDasharray = i; else if ("rect" === h) t = 2 * x * d + 2 * m * c; else if ("line" === h) t = u(_, y, _ + x, y + m, d, c); else if ("polyline" === h || "polygon" === h) for (n = e.getAttribute("points").match(P) || [], "polygon" === h && n.push(n[0], n[1]), t = 0, o = 2; o < n.length; o += 2) t += u(n[o - 2], n[o - 1], n[o], n[o + 1], d, c) || 0; else "circle" !== h && "ellipse" !== h || (a = x / 2 * d, f = m / 2 * c, t = Math.PI * (3 * (a + f) - D((3 * a + f) * (a + 3 * f))));
        return t || 0
    }

    function A(e, t) {
        if (!(e = k(e)[0])) return [0, 0];
        t = t || z(e) + 1;
        var r = f.getComputedStyle(e), n = r.strokeDasharray || "", s = q(r.strokeDashoffset), i = n.indexOf(",");
        return i < 0 && (i = n.indexOf(" ")), t < (n = i < 0 ? t : q(n.substr(0, i))) && (n = t), [-s || 0, n - s || 0]
    }

    function B() {
        l() && (f = window, d = t = m(), k = t.utils.toArray, c = t.core.getStyleSaver, g = t.core.reverting || function () {
        }, h = -1 !== ((f.navigator || {}).userAgent || "").indexOf("Edge"))
    }

    var t, k, f, h, d, b, c, g, P = /[-+=\.]*\d+[\.e\-\+]*\d*[e\-\+]*\d*/gi,
        M = {rect: ["width", "height"], circle: ["r", "r"], ellipse: ["rx", "ry"], line: ["x2", "y2"]}, D = Math.sqrt,
        n = {
            version: "3.13.0", name: "drawSVG", register: function register(e) {
                t = e, B()
            }, init: function init(e, t, n) {
                if (!e.getBBox) return !1;
                d || B();
                var s, i, o, a = z(e);
                return this.styles = c && c(e, "strokeDashoffset,strokeDasharray,strokeMiterlimit"), this.tween = n, this._style = e.style, this._target = e, t + "" == "true" ? t = "0 100%" : t ? -1 === (t + "").indexOf(" ") && (t = "0 " + t) : t = "0 0", i = function _parse(e, t, n) {
                    var s, i, o = e.indexOf(" ");
                    return i = o < 0 ? (s = void 0 !== n ? n + "" : e, e) : (s = e.substr(0, o), e.substr(o + 1)), s = r(s, t), (i = r(i, t)) < s ? [i, s] : [s, i]
                }(t, a, (s = A(e, a))[0]), this._length = p(a), this._dash = p(s[1] - s[0]), this._offset = p(-s[0]), this._dashPT = this.add(this, "_dash", this._dash, p(i[1] - i[0]), 0, 0, 0, 0, 0, 1), this._offsetPT = this.add(this, "_offset", this._offset, p(-i[0]), 0, 0, 0, 0, 0, 1), h && (o = f.getComputedStyle(e)).strokeLinecap !== o.strokeLinejoin && (i = q(o.strokeMiterlimit), this.add(e.style, "strokeMiterlimit", i, i + .01)), this._live = w(e) || ~(t + "").indexOf("live"), this._nowrap = ~(t + "").indexOf("nowrap"), this._props.push("drawSVG"), 1
            }, render: function render(e, t) {
                if (t.tween._time || !g()) {
                    var r, n, s, i, o = t._pt, a = t._style;
                    if (o) {
                        for (t._live && (r = z(t._target)) !== t._length && (n = r / t._length, t._length = r, t._offsetPT && (t._offsetPT.s *= n, t._offsetPT.c *= n), t._dashPT ? (t._dashPT.s *= n, t._dashPT.c *= n) : t._dash *= n); o;) o.r(e, o.d), o = o._next;
                        s = t._dash || e && 1 !== e && 1e-4 || 0, r = t._length - s + .1, i = t._offset, s && i && s + Math.abs(i % t._length) > t._length - .05 && (i += i < 0 ? .005 : -.005) && (r += .005), a.strokeDashoffset = s ? i : i + .001, a.strokeDasharray = r < .1 ? "none" : s ? s + "px," + (t._nowrap ? 999999 : r) + "px" : "0px, 999999px"
                    }
                } else t.styles.revert()
            }, getLength: z, getPosition: A
        };
    m() && t.registerPlugin(n), e.DrawSVGPlugin = n, e.default = n;
    if (typeof (window) === "undefined" || window !== e) {
        Object.defineProperty(e, "__esModule", {value: !0})
    } else {
        delete e.default
    }
});

function isGsapReady() {
    const gsapDefined = typeof gsap !== 'undefined';
    const scrollTriggerGlobalDefined = typeof ScrollTrigger !== 'undefined';
    const motionPathGlobalDefined = typeof MotionPathPlugin !== 'undefined';
    const drawSVGGlobalDefined = typeof DrawSVGPlugin !== 'undefined';
    return gsapDefined && scrollTriggerGlobalDefined && motionPathGlobalDefined && drawSVGGlobalDefined;
}

function initializeHeroAnimation() {
    const heroSection = document.getElementById('hero');
    const svgStageWrapper = document.getElementById('svg-stage-wrapper');
    const svgStage = document.getElementById('svg-stage');
    const plane = heroSection.querySelector(".plane");
    const motionPath = heroSection.querySelector(".mp");
    const heroMainLogo = document.querySelector('.hero-main-logo-container');
    const heroTextContainer = heroSection.querySelector('#hero .container');
    const heroSupertitle = heroTextContainer.querySelector('.section-supertitle');
    const heroTitle = heroTextContainer.querySelector('#hero-title');
    const heroSubtitle = heroTextContainer.querySelector('#hero-subtitle');
    const heroCtas = heroTextContainer.querySelector('#hero-ctas');
    const scrollDownArrow = document.querySelector('.scroll-down-arrow');
    const interactiveBlobs = gsap.utils.toArray('.hero-interactive-blob');

    if (!heroSection || !svgStageWrapper || !svgStage || !plane || !motionPath || !heroTextContainer) {
        console.warn("Hero animation elements missing.");
        document.body.style.overflow = '';
        return null;
    }

    gsap.set(heroSection, {position: 'relative'});
    gsap.set([heroMainLogo, heroTextContainer, scrollDownArrow], {position: 'relative', zIndex: 10});
    gsap.set(svgStageWrapper, {
        position: 'absolute',
        inset: 0,
        zIndex: 45,
        background: 'transparent',
        pointerEvents: 'none',
        left: 0,
        right: 'auto',
        display: 'block',
        top: '33%',
        transform: 'none'
    }); // zIndex increased to 45
    gsap.set(svgStage, {background: 'transparent'});
    gsap.set(interactiveBlobs, {position: 'absolute', zIndex: 0});

    // --- Affiche le texte du hero dès le début, sans animation d'apparition ---
    [heroMainLogo, heroSupertitle, heroTitle, heroSubtitle, heroCtas].forEach(el => {
        if (el) {
            gsap.set(el, {autoAlpha: 1, y: 0, scale: 1});
            if (el === heroCtas && el.children.length > 0) {
                gsap.set(el.children, {autoAlpha: 1, y: 0, scale: 1});
            }
        }
    });
    // ------------------------------------------------------------

    if (scrollDownArrow) gsap.set(scrollDownArrow, {autoAlpha: 0});

    const heroMasterTl = gsap.timeline();
    const animationTotalDuration = 10;

    heroMasterTl.fromTo(svgStage,
        {opacity: 0, scale: 0.8},
        {opacity: 1, scale: 1, duration: animationTotalDuration * 0.15, ease: "power1.out"},
        0
    );

    interactiveBlobs.forEach((blob, i) => {
        gsap.set(blob, {
            xPercent: gsap.utils.random(-40, 40),
            yPercent: gsap.utils.random(-40, 40),
            scale: gsap.utils.random(0.5, 1),
            autoAlpha: 0
        });
        heroMasterTl.to(blob, {
            autoAlpha: gsap.utils.random(0.15, 0.4), scale: `*=${gsap.utils.random(0.8, 1.5)}`,
            xPercent: `+=${gsap.utils.random(-100, 100)}`, yPercent: `+=${gsap.utils.random(-70, 70)}`,
            rotation: gsap.utils.random(-50, 50), duration: animationTotalDuration * 0.9, ease: "sine.inOut",
        }, animationTotalDuration * 0.02 * i);
    });

    heroMasterTl.to(plane, {
        motionPath: {path: motionPath, align: motionPath, alignOrigin: [0.5, 0.5], autoRotate: true},
        ease: "none", duration: animationTotalDuration
    }, 0);

    heroMasterTl.fromTo(motionPath,
        {drawSVG: "0% 0%"},
        {drawSVG: "0% 100%", ease: "none", duration: animationTotalDuration}
        , 0);

    // --- SUPPRIME l'animation d'apparition du texte du hero ---
    // (rien ici)
    // ----------------------------------------------------------

    ScrollTrigger.create({
        animation: heroMasterTl,
        trigger: heroSection,
        pin: false,
        start: "top top",
        end: `+=${window.innerHeight * 3}`,
        scrub: 1.2,
        invalidateOnRefresh: true,
        onUpdate: self => {
            if (scrollDownArrow) {
                if (self.progress > 0.95 && self.direction > 0) gsap.to(scrollDownArrow, {autoAlpha: 1, duration: 0.3});
                else if (self.progress < 0.95 && self.direction < 0) gsap.to(scrollDownArrow, {
                    autoAlpha: 0,
                    duration: 0.1
                });
                else if (self.progress < 0.05) gsap.to(scrollDownArrow, {autoAlpha: 0, duration: 0.1});
            }
        },
        onLeave: () => {
            if (scrollDownArrow) gsap.to(scrollDownArrow, {autoAlpha: 1, duration: 0.3});
        },
        onEnterBack: () => {
            if (scrollDownArrow) gsap.to(scrollDownArrow, {autoAlpha: 0, duration: 0.1});
        }
    });
    console.log("Hero scroll-driven animation with pinning initialized.");
    return heroMasterTl;
}

function initializeGsapAnimations() {
    if (!isGsapReady()) {
        console.error("GSAP or plugins not ready.");
        document.body.style.overflow = '';
        return;
    }
    try {
        gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, DrawSVGPlugin);
    } catch (e) {
        console.error("Error registering GSAP plugins:", e);
        return;
    }

    initializeHeroAnimation();

    const animateInElements = (selector, defaultDelay = 0, customEase = 'expo.out', customDuration = 1.2, staggerAmount = 0) => {
        gsap.utils.toArray(selector).forEach((el, index) => {
            const isInHero = el.closest('#hero');
            const isHeroAnimatedElement = isInHero && (el.classList.contains('hero-main-logo-container') || el.classList.contains('section-supertitle') || el.id === 'hero-title' || el.id === 'hero-subtitle' || el.id === 'hero-ctas' || el.classList.contains('hero-interactive-blob') || el.id === 'svg-stage');
            if (isHeroAnimatedElement) return;

            const delay = parseFloat(el.dataset.delay) || defaultDelay;
            let fromProps = {autoAlpha: 0}; // Use autoAlpha for initial state
            if (el.classList.contains('g-fade-up')) fromProps.y = 60;
            else if (el.classList.contains('g-fade-down')) fromProps.y = -60;
            else if (el.classList.contains('g-fade-left')) fromProps.x = 60;
            else if (el.classList.contains('g-fade-right')) fromProps.x = -60;
            else if (el.classList.contains('g-scale-in')) fromProps.scale = 0.8;
            let toProps = {autoAlpha: 1}; // Use autoAlpha for final state
            if (fromProps.y) toProps.y = 0;
            if (fromProps.x) toProps.x = 0;
            if (fromProps.scale) toProps.scale = 1;
            gsap.fromTo(el, fromProps, {
                ...toProps,
                duration: customDuration,
                ease: customEase,
                delay: delay + (staggerAmount * index),
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none reverse',
                    invalidateOnRefresh: true
                }
            });
        });
    };
    animateInElements('.g-fade-in', 0, 'power2.out', 1);
    animateInElements('.g-fade-up', 0.12);
    animateInElements('.g-fade-left', 0.18);
    animateInElements('.g-fade-right', 0.18);
    animateInElements('.g-scale-in', 0.28, 'elastic.out(1, 0.65)', 1.4);
    const quisommesnousImage = document.querySelector('#quisommesnous .quisommesnous-image');
    if (quisommesnousImage) gsap.to(quisommesnousImage, {
        yPercent: -5,
        ease: "none",
        scrollTrigger: {
            trigger: quisommesnousImage.closest('section'),
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5
        }
    });
    gsap.utils.toArray('#quisommesnous .mission-vision-histoire h3').forEach(h3 => {
        gsap.fromTo(h3, {'--after-width': '0px'}, {
            '--after-width': '50px',
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {trigger: h3, start: 'top 90%', toggleActions: 'play none none reverse'},
            onComplete: () => h3.classList.add('animated-underline')
        });
        gsap.from([h3, h3.nextElementSibling], {
            autoAlpha: 0,
            y: 20,
            stagger: 0.15,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {trigger: h3, start: 'top 90%', toggleActions: 'play none none reverse'}
        });
    });
    gsap.from('#quisommesnous .bg-\\[--arcadis-blue-light\\] > *', {
        autoAlpha: 0,
        y: 30,
        stagger: 0.15,
        duration: 0.7,
        ease: 'expo.out',
        scrollTrigger: {
            trigger: '#quisommesnous .bg-\\[--arcadis-blue-light\\]',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        }
    });
    gsap.utils.toArray('.offre-card').forEach((card) => {
        const listItems = card.querySelectorAll('ul li');
        gsap.fromTo(listItems, {autoAlpha: 0, x: -20}, {
            autoAlpha: 1,
            x: 0,
            stagger: 0.1,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {trigger: card, start: 'top 80%', toggleActions: 'play none none none'}
        });
    });
    gsap.from('.pricing-model-note', {
        autoAlpha: 0,
        scale: 0.9,
        y: 20,
        duration: 0.7,
        ease: 'back.out(1.7)',
        scrollTrigger: {trigger: '.pricing-model-note', start: 'top 90%', toggleActions: 'play none none reverse'}
    });
    gsap.utils.toArray('.expertise-item').forEach((item) => {
        const icon = item.querySelector('.expertise-icon'), title = item.querySelector('h4'),
            paragraph = item.querySelector('p'), tl = gsap.timeline({
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            });
        tl.from(icon, {
            scale: 0.5,
            autoAlpha: 0,
            rotation: -45,
            duration: 0.6,
            ease: 'back.out(2)'
        }).from(title, {autoAlpha: 0, y: 20, duration: 0.5, ease: 'power2.out'}, "-=0.3").from(paragraph, {
            autoAlpha: 0,
            y: 20,
            duration: 0.5,
            ease: 'power2.out'
        }, "-=0.3");
        if (icon) tl.call(() => icon.classList.add('animated-icon'), [], ">");
    });
    gsap.utils.toArray('.team-member-card').forEach(card => {
        const imageWrapper = card.querySelector('.team-member-image'), name = card.querySelector('.member-name'),
            role = card.querySelector('.member-role'), bio = card.querySelector('.member-bio'), tl = gsap.timeline({
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            });
        if (imageWrapper) tl.from(imageWrapper, {scale: 0, autoAlpha: 0, duration: 0.7, ease: 'elastic.out(1, 0.75)'});
        tl.from([name, role, bio], {
            autoAlpha: 0,
            y: 30,
            stagger: 0.15,
            duration: 0.6,
            ease: 'power2.out'
        }, imageWrapper ? "-=0.4" : "+=0");
    });
    gsap.utils.toArray('#pourquoi ul li').forEach((li, index) => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: li,
                start: 'top 90%',
                toggleActions: 'play none none reverse',
                onEnter: () => li.classList.add('is-visible')
            }
        });
        tl.fromTo(li, {autoAlpha: 0, x: -30}, {
            autoAlpha: 1,
            x: 0,
            duration: 0.6,
            ease: 'power2.out',
            delay: index * 0.1
        });
    });
    const contactFormEl = document.querySelector('#contact-form');
    if (contactFormEl) {
        const formElements = contactFormEl.querySelectorAll('input, textarea, button');
        gsap.from(formElements, {
            autoAlpha: 0,
            y: 25,
            stagger: 0.1,
            duration: 0.5,
            ease: 'power1.out',
            scrollTrigger: {trigger: contactFormEl, start: 'top 85%', toggleActions: 'play none none reverse'}
        });
    }
    const contactInfoItems = document.querySelectorAll('#contact .contact-info-item');
    gsap.from(contactInfoItems, {
        autoAlpha: 0,
        x: 25,
        stagger: 0.1,
        duration: 0.5,
        ease: 'power1.out',
        scrollTrigger: {trigger: '.contact-info-wrapper', start: 'top 85%', toggleActions: 'play none none reverse'}
    });
    gsap.utils.toArray('#contact .contact-info-item svg').forEach(svgIcon => {
        gsap.from(svgIcon, {
            scale: 0.5,
            autoAlpha: 0,
            rotation: -30,
            duration: 0.6,
            ease: 'back.out(1.7)',
            scrollTrigger: {
                trigger: svgIcon.closest('.contact-info-item'),
                start: 'top 90%',
                toggleActions: 'play none none reverse'
            }
        });
    });
    const decorativeShapes = gsap.utils.toArray('.decorative-shape');
    decorativeShapes.forEach((shape, i) => {
        if (shape.closest('#hero') && shape.classList.contains('hero-interactive-blob')) return;
        if (shape.closest('#hero') && (shape.classList.contains('shape-1') || shape.classList.contains('shape-2') || shape.classList.contains('shape-3'))) {
            if (!shape.classList.contains('g-fade-in')) { // Check if it already has a generic fade-in class
                gsap.fromTo(shape, {autoAlpha: 0, scale: 0.5}, {
                    autoAlpha: 1,
                    scale: 1,
                    duration: 1.5,
                    delay: 0.3 + i * 0.15,
                    ease: "expo.out",
                    scrollTrigger: {
                        trigger: shape.closest('section'),
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                });
            } // Else, if it has g-fade-in, animateInElements will handle it if not in hero.
        }
        if (!shape.closest('#hero') || !shape.classList.contains('hero-interactive-blob')) { // Continuous animation for non-hero blobs
            gsap.to(shape, {
                x: () => gsap.utils.random(-25, 25, 1),
                y: () => gsap.utils.random(-25, 25, 1),
                rotation: () => gsap.utils.random(-20, 20, 1),
                scale: () => gsap.utils.random(0.9, 1.1, 0.01),
                autoAlpha: () => gsap.utils.random(0.7, 1, 0.05),
                repeat: -1,
                yoyo: true,
                duration: () => gsap.utils.random(8, 16, 1),
                ease: "sine.inOut",
                delay: 1 + i * 0.5
            });
            gsap.to(shape, {
                yPercent: () => gsap.utils.random(-50, 50),
                xPercent: () => gsap.utils.random(-30, 30),
                ease: "none",
                scrollTrigger: {
                    trigger: shape.closest('section') || 'body',
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 2 + Math.random() * 3,
                    invalidateOnRefresh: true
                }
            });
        }
    });
    ScrollTrigger.refresh();
}

// Removed initializeScrollingSolutions function

function attemptGsapInit(maxAttempts = 5, interval = 300) {
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
                document.body.style.overflow = '';
            }
        }
    }

    tryInit();
}

const loadingScreen = document.getElementById('loading-screen');
const progressBar = document.getElementById('progress-bar');
if (loadingScreen && progressBar) {
    let progress = 0;
    const intervalTime = 20, totalDuration = 1200, increment = 100 / (totalDuration / intervalTime);
    const progressInterval = setInterval(() => {
        progress += increment;
        if (progress >= 100) {
            progress = 100;
            progressBar.style.width = `${progress}%`;
            clearInterval(progressInterval);
            setTimeout(() => {
                gsap.to(loadingScreen, {
                    opacity: 0, duration: 0.7, ease: "power2.out", onComplete: () => {
                        loadingScreen.style.display = 'none';
                        attemptGsapInit();
                    }
                });
            }, 300);
        }
        progressBar.style.width = `${progress}%`;
    }, intervalTime);
} else {
    window.addEventListener('load', attemptGsapInit);
}

const menuButton = document.getElementById('mobile-menu-button'), mobileMenu = document.getElementById('mobile-menu'),
    navLinksMobile = document.querySelectorAll('#mobile-menu .nav-link-mobile, #mobile-menu .cta-button');
if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.toggle('hidden');
        menuButton.setAttribute('aria-expanded', String(!isHidden));
        mobileMenu.setAttribute('aria-hidden', String(isHidden));
        menuButton.innerHTML = isHidden ? '&#9776;' : '&times;';
    });
    navLinksMobile.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            menuButton.setAttribute('aria-expanded', 'false');
            mobileMenu.setAttribute('aria-hidden', 'true');
            menuButton.innerHTML = '&#9776;';
        });
    });
}
const navbar = document.getElementById('navbar');
if (navbar) ScrollTrigger.create({
    id: 'navbarScrollEffect',
    start: 'top -80px',
    end: 99999,
    toggleClass: {className: 'scrolled', targets: navbar}
});
const sections = document.querySelectorAll('main section[id]'),
    navLinksDesktop = document.querySelectorAll('#navbar nav a.nav-link');
let currentActiveSection = null;

function changeNavActiveState() {
    let newActiveSectionId = '';
    const navBarHeight = navbar ? navbar.offsetHeight : 70, threshold = window.innerHeight * 0.5;
    sections.forEach(section => {
        const sectionTop = section.offsetTop - navBarHeight, sectionBottom = sectionTop + section.offsetHeight,
            scrollPosition = window.scrollY;
        if (scrollPosition >= sectionTop - threshold && scrollPosition < sectionBottom - threshold) newActiveSectionId = section.getAttribute('id');
    });
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - (navbar?.offsetHeight || 0) - 50) {
        const lastSection = sections[sections.length - 1];
        if (lastSection) newActiveSectionId = lastSection.getAttribute('id');
    } else if (sections.length > 0 && window.scrollY < (sections[0].offsetTop + sections[0].offsetHeight - navBarHeight - threshold)) {
        if (sections.length > 1) {
            if (window.scrollY < (sections[1].offsetTop - navBarHeight - threshold)) newActiveSectionId = sections[0].getAttribute('id');
        } else newActiveSectionId = sections[0].getAttribute('id');
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
    changeNavActiveState();
}
const contactForm = document.getElementById('contact-form'), formStatusEl = document.getElementById('form-status');
if (contactForm && formStatusEl) {
    contactForm.addEventListener('submit', function (event) {
        event.preventDefault();
        formStatusEl.textContent = 'Envoi en cours...';
        formStatusEl.className = 'mt-4 text-sm text-center text-[var(--arcadis-accent)]';
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
            setTimeout(() => {
                formStatusEl.textContent = '';
                formStatusEl.className = 'mt-4 text-sm text-center';
            }, 6000);
        }, 1500);
    });
}
const yearSpan = document.getElementById('current-year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear().toString();
console.log("script.js: Parsing finished.");
