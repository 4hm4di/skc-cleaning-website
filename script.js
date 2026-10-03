// ==========================================================================
// SITE ROOT + LOCAL-FILE NAVIGATION
// SKC_ROOT lets runtime-built links (chat assistant) work from any page and any
// hosting path. When the site is opened straight from disk (file://), folder links
// such as "about/" have no server to serve their index.html, so we add it.
// ==========================================================================
(function () {
    var cs = document.currentScript;
    window.SKC_ROOT = (cs && cs.src) ? cs.src.replace(/script\.js(\?.*)?$/, '') : '/';

    if (window.location.protocol === 'file:') {
        document.addEventListener('click', function (e) {
            var a = e.target.closest ? e.target.closest('a[href]') : null;
            if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
            var u;
            try { u = new URL(a.href); } catch (err) { return; }
            if (u.protocol !== 'file:' || !/\/$/.test(u.pathname)) return;
            e.preventDefault();
            u.pathname += 'index.html';
            window.location.href = u.href;
        }, true);
    }
})();

// ==========================================================================
// BUBBLE CURSOR EFFECT CLASS & CLASS PARTICLES
// ==========================================================================
class Particle {
    constructor(x, y) {
        this.initialLifeSpan = Math.floor(Math.random() * 60 + 60);
        this.lifeSpan = this.initialLifeSpan;
        this.velocity = {
            x: (Math.random() < 0.5 ? -1 : 1) * (Math.random() / 10),
            y: -0.4 + Math.random() * -1,
        };
        this.position = { x, y };
        this.baseDimension = 4;
    }
    update(context) {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.velocity.x += ((Math.random() < 0.5 ? -1 : 1) * 2) / 75;
        this.velocity.y -= Math.random() / 600;
        this.lifeSpan--;
        const scale = 0.2 + (this.initialLifeSpan - this.lifeSpan) / this.initialLifeSpan;
        context.fillStyle = 'rgba(235, 247, 243, 0.45)'; // Soft Light Teal
        context.strokeStyle = 'rgba(29, 158, 117, 0.4)';  // Soft Accent Teal bubble outline
        context.beginPath();
        context.arc(
            this.position.x - (this.baseDimension / 2) * scale,
            this.position.y - this.baseDimension / 2,
            this.baseDimension * scale,
            0,
            2 * Math.PI
        );
        context.stroke();
        context.fill();
        context.closePath();
    }
}

// ----------------------------------------------------
// BUBBLE CURSOR INITIALIZER (VANILLA PORT)
// ----------------------------------------------------
const initBubbleCursor = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.style.position = 'fixed';
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999'; // Float above all page elements
    document.body.appendChild(canvas);

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles = [];

    const onWindowResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };

    const onMouseMove = (e) => {
        addParticle(e.clientX, e.clientY);
    };

    const onTouchMove = (e) => {
        if (e.touches.length > 0) {
            for (let i = 0; i < e.touches.length; i++) {
                addParticle(e.touches[i].clientX, e.touches[i].clientY);
            }
        }
    };

    const addParticle = (x, y) => {
        particles.push(new Particle(x, y));
    };

    const updateParticles = () => {
        if (particles.length === 0) return;
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update(context);
        }
        
        for (let i = particles.length - 1; i >= 0; i--) {
            if (particles[i].lifeSpan < 0) {
                particles.splice(i, 1);
            }
        }
    };

    let animationFrameId;
    const loop = () => {
        updateParticles();
        animationFrameId = requestAnimationFrame(loop);
    };

    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchstart', onTouchMove, { passive: true });

    loop();
};

// ----------------------------------------------------
// BLURRY TYPED REVEAL TEXT SPLITTER INITIALIZER
// ----------------------------------------------------
const initBlurryReveal = () => {
    const targets = document.querySelectorAll('.blurry-typed-reveal');
    
    targets.forEach(target => {
        let wordIndex = 0;
        
        const processNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                const words = text.split(/(\s+)/);
                const fragment = document.createDocumentFragment();
                
                words.forEach(word => {
                    if (/\s+/.test(word)) {
                        fragment.appendChild(document.createTextNode(word));
                    } else if (word.length > 0) {
                        const span = document.createElement('span');
                        span.textContent = word;
                        span.style.display = 'inline-block';
                        span.style.opacity = '0';
                        span.style.filter = 'blur(10px)';
                        span.style.transform = 'translateY(12px)';
                        span.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                        span.style.transitionDelay = `${wordIndex * 0.07}s`;
                        fragment.appendChild(span);
                        wordIndex++;
                        
                        requestAnimationFrame(() => {
                            setTimeout(() => {
                                span.style.opacity = '1';
                                span.style.filter = 'blur(0px)';
                                span.style.transform = 'translateY(0px)';
                            }, 100);
                        });
                    }
                });
                return fragment;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const childNodes = Array.from(node.childNodes);
                childNodes.forEach(child => {
                    const replacement = processNode(child);
                    if (replacement) {
                        node.replaceChild(replacement, child);
                    }
                });
                return null;
            }
        };
        
        processNode(target);
    });
};

// ----------------------------------------------------
// DOM WORKER
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Run Bubble Cursor & Blurry typed reveal animations
    initBubbleCursor();
    initBlurryReveal();

    // ----------------------------------------------------
    // 1. STICKY NAV ON SCROLL
    // ----------------------------------------------------
    const headerWrapper = document.getElementById('headerWrapper');
    
    const handleScroll = () => {
        if (window.scrollY > 30) {
            headerWrapper.classList.add('scrolled');
        } else {
            headerWrapper.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    // Initial check on load
    handleScroll();

    // ----------------------------------------------------
    // 2. MOBILE MENU DRAWER
    // ----------------------------------------------------
    const hamburger = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');
    const body = document.body;
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            const isActive = hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
            
            // Prevent scrolling on body when mobile menu is active
            if (isActive) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        });

        // Close menu when clicking a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                body.style.overflow = '';
            });
        });
    }

    // ----------------------------------------------------
    // 3. ACTIVE NAV LINK HIGHLIGHT
    // ----------------------------------------------------
    // Normalise a path so "/about", "/about/" and "/about/index.html" all compare equal
    const normPath = (p) => p.replace(/index\.html$/, '').replace(/\/+$/, '') || '/';
    const currentPath = normPath(window.location.pathname);
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        let isActive = false;
        if (href && href !== '#' && !/^(mailto:|tel:|javascript:)/i.test(href)) {
            try {
                isActive = normPath(new URL(href, window.location.href).pathname) === currentPath;
            } catch (err) { isActive = false; }
        }
        link.classList.toggle('active', isActive);
    });

    // ----------------------------------------------------
    // 4. DYNAMIC SERVICE SELECTION IN CONTACT FORM
    // ----------------------------------------------------
    const selectServiceDropdown = document.getElementById('enquiryService');
    
    if (selectServiceDropdown) {
        // Parse URL search parameters
        const urlParams = new URLSearchParams(window.location.search);
        const serviceParam = urlParams.get('service');
        
        if (serviceParam) {
            // Find standard slugs or names matching service dropdown option values
            const formattedParam = serviceParam.toLowerCase().replace(/[^a-z0-9]/g, '');
            
            // Skip the blank placeholder option (an empty string would match everything)
            for (let i = 0; i < selectServiceDropdown.options.length; i++) {
                const option = selectServiceDropdown.options[i];
                const formattedOptionValue = option.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (!formattedOptionValue) continue;

                if (formattedOptionValue === formattedParam) {
                    selectServiceDropdown.selectedIndex = i;
                    break;
                }
            }
        }
    }

    // ----------------------------------------------------
    // 5. INTERACTIVE ENQUIRY FORM SUBMISSION
    // ----------------------------------------------------
    const contactForm = document.getElementById('enquiryForm');
    const successMessage = document.getElementById('formSuccess');
    
    if (contactForm && successMessage) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('enquiryEmail');
            const submitBtn  = contactForm.querySelector('button[type="submit"]');
            const replyTo    = document.getElementById('replyToField');
            if (replyTo && emailInput) replyTo.value = emailInput.value;

            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#fff" style="animation: spin 1s linear infinite;">
                    <g fill="none" fill-rule="evenodd">
                        <g transform="translate(1 1)" stroke-width="3">
                            <circle stroke-opacity=".25" cx="18" cy="18" r="18"/>
                            <path d="M36 18c0-9.94-8.06-18-18-18"/>
                        </g>
                    </g>
                </svg>
                Sending Enquiry...`;

            if (!document.getElementById('spinAnimation')) {
                const s = document.createElement('style');
                s.id = 'spinAnimation';
                s.innerHTML = '@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}';
                document.head.appendChild(s);
            }

            try {
                const res = await fetch('https://formspree.io/f/mbglvjlr', {
                    method: 'POST',
                    body: new FormData(contactForm),
                    headers: { 'Accept': 'application/json' }
                });
                if (res.ok) {
                    contactForm.style.transition = 'opacity 0.3s ease';
                    contactForm.style.opacity = '0';
                    setTimeout(() => {
                        contactForm.style.display = 'none';
                        successMessage.style.display = 'flex';
                        successMessage.style.opacity = '0';
                        successMessage.style.transition = 'opacity 0.4s ease';
                        successMessage.offsetHeight;
                        successMessage.style.opacity = '1';
                    }, 300);
                } else {
                    throw new Error('failed');
                }
            } catch {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                alert('Something went wrong. Please call us on +44 7886 097616 or WhatsApp us directly.');
            }
        });
    }

    // ----------------------------------------------------
    // 6. NEWSLETTER EMAIL SIGNUP WITH SIMPLE CONFIRMATION
    // ----------------------------------------------------
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const submitBtn  = newsletterForm.querySelector('button[type="submit"]');
            if (!emailInput || !emailInput.value.trim()) return;
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Subscribing...';
            try {
                const fd = new FormData();
                fd.append('email', emailInput.value.trim());
                fd.append('subscribed_at', new Date().toLocaleString('en-GB'));
                fd.append('_subject', 'New Newsletter Subscriber — SKC Cleaning Services');
                const res = await fetch('https://formspree.io/f/myezqyzp', {
                    method: 'POST', body: fd,
                    headers: { 'Accept': 'application/json' }
                });
                if (res.ok) {
                    submitBtn.textContent = 'Thank you for subscribing! ✓';
                    submitBtn.style.backgroundColor = '#157F5E';
                    emailInput.value = '';
                    setTimeout(() => {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                        submitBtn.style.backgroundColor = '';
                    }, 5000);
                } else { throw new Error('failed'); }
            } catch {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                alert('Subscription failed. Please try again.');
            }
        });
    }

    // ----------------------------------------------------
    // 7. HIGH-PERFORMANCE SCROLL REVEAL (IntersectionObserver)
    // ----------------------------------------------------
    const revealElements = document.querySelectorAll('.reveal');
    
    if ('IntersectionObserver' in window && revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Animates once on first scroll-in
                }
            });
        }, {
            threshold: 0.08, // Trigger when 8% visible
            rootMargin: '0px 0px -45px 0px' // Offset triggers slightly before entering viewport
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    } else {
        // Fallback: Instantly show elements on browsers without IntersectionObserver
        revealElements.forEach(element => {
            element.classList.add('active');
        });
    }

    // ----------------------------------------------------
    // 8. PAGE HERO PARALLAX SCROLL EFFECT
    // ----------------------------------------------------
    const heroImages = document.querySelectorAll('.page-hero img');
    
    if (heroImages.length > 0) {
        const isMobile = () => window.innerWidth <= 768;
        let isListenerActive = false;
        
        const applyParallax = () => {
            const scrollY = window.scrollY;
            const viewportHeight = window.innerHeight;
            heroImages.forEach(img => {
                const parentHero = img.closest('.page-hero');
                if (!parentHero) return;
                
                const rect = parentHero.getBoundingClientRect();
                // Check if the hero section is in the visible viewport
                if (rect.bottom > 0 && rect.top < viewportHeight) {
                    // Parallax factor: 0.3 (moves at 30% of scroll speed)
                    img.style.transform = `translate3d(0, ${scrollY * 0.3}px, 0)`;
                }
            });
        };
        
        const checkParallaxState = () => {
            if (isMobile()) {
                if (isListenerActive) {
                    window.removeEventListener('scroll', applyParallax);
                    isListenerActive = false;
                }
                heroImages.forEach(img => {
                    img.style.transform = 'none';
                });
            } else {
                if (!isListenerActive) {
                    window.addEventListener('scroll', applyParallax, { passive: true });
                    isListenerActive = true;
                }
                applyParallax();
            }
        };
        
        window.addEventListener('resize', checkParallaxState, { passive: true });
        checkParallaxState(); // Run once to initial state
    }
});

// Cursor follow radial glow effect for the CTA Banner
const initCtaBannerCursor = () => {
    const banner = document.querySelector('.cta-banner-container');
    if (!banner) return;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) return;

    banner.addEventListener('mousemove', (e) => {
        const rect = banner.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        banner.style.setProperty('--mouse-x', `${x}px`);
        banner.style.setProperty('--mouse-y', `${y}px`);
    });
};

// DOM Content Loaded Initializations
document.addEventListener('DOMContentLoaded', () => {
    initCtaBannerCursor();


    // ----------------------------------------------------
    // STATS COUNT-UP ANIMATION (IntersectionObserver)
    // ----------------------------------------------------
    const counters = document.querySelectorAll('.stat-number');
    
    if (counters.length > 0) {
        const easeOut = t => 1 - Math.pow(1 - t, 3);
        
        const animateCounter = (el) => {
            const target = parseInt(el.getAttribute('data-target'), 10);
            const suffix = el.getAttribute('data-suffix') || '';
            const duration = 2000;
            const start = performance.now();
            
            function step(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = easeOut(progress);
                
                const currentVal = Math.round(eased * target);
                // Format the count with commas if it is 1,000+
                if (currentVal >= 1000) {
                    el.textContent = currentVal.toLocaleString() + suffix;
                } else {
                    el.textContent = currentVal + suffix;
                }
                
                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            }
            requestAnimationFrame(step);
        };
        
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    statsObserver.unobserve(entry.target); // Animates once
                }
            });
        }, { threshold: 0.3 });
        
        counters.forEach(el => statsObserver.observe(el));
    }
});

// ==========================================================================
// HERO SECTION — Mouse Parallax + Custom Cursor
// Runs only on desktop (no touch, width > 768px). Lerp-smoothed RAF loop.
// ==========================================================================
(function () {
    const hero    = document.querySelector('.hero-section');
    const vidWrap = document.getElementById('heroVideoWrap');
    const cursor  = document.getElementById('heroCursor');
    if (!hero || !vidWrap) return;

    // Disable entirely on touch / mobile
    if ('ontouchstart' in window || window.innerWidth <= 768) return;

    const STRENGTH = 14;  // max px shift per axis — raise to 22 for more drama
    const EASE     = 0.07; // lerp smoothing — lower = more cinematic lag

    let targetX = 0, targetY = 0;
    let curX    = 0, curY    = 0;
    let rafId   = null;
    let running = false;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function tick() {
        curX = lerp(curX, targetX, EASE);
        curY = lerp(curY, targetY, EASE);
        vidWrap.style.transform = `translate(${curX}px, ${curY}px)`;
        rafId = requestAnimationFrame(tick);
    }

    hero.addEventListener('mouseenter', () => {
        if (cursor) cursor.classList.add('visible');
        if (!running) {
            running = true;
            rafId = requestAnimationFrame(tick);
        }
    });

    hero.addEventListener('mouseleave', () => {
        if (cursor) cursor.classList.remove('visible');
        cancelAnimationFrame(rafId);
        running = false;
        // Smoothly ease video back to centre on exit
        vidWrap.style.transition = 'transform 0.6s ease';
        vidWrap.style.transform  = 'translate(0px, 0px)';
        targetX = 0; targetY = 0; curX = 0; curY = 0;
        setTimeout(() => { vidWrap.style.transition = ''; }, 650);
    });

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        // Normalise mouse to -1 → +1 relative to hero centre
        const nx = (e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2);
        const ny = (e.clientY - rect.top   - rect.height / 2) / (rect.height / 2);
        // Video moves opposite to cursor for a natural depth / parallax feel
        targetX = -nx * STRENGTH;
        targetY = -ny * STRENGTH;
        // Reposition custom cursor element
        if (cursor) {
            cursor.style.left = (e.clientX - rect.left) + 'px';
            cursor.style.top  = (e.clientY - rect.top)  + 'px';
        }
    });

    // Re-disable if user resizes down to mobile
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            cancelAnimationFrame(rafId);
            running = false;
            vidWrap.style.transform = 'translate(0,0)';
        }
    });
})();

// ==========================================================================
// SERVICES PAGE BOTTOM CTA — FLOATING SPARKLE GENERATOR
// ==========================================================================
(function () {
    const field = document.getElementById('sparkleField');
    if (!field) return;

    const COLOURS  = ['#1D9E75', '#ffffff', '#a8e6cf', '#7ECAC9'];
    const COUNT    = 18; // number of sparkles — increase for more density
    const SIZES    = [10, 14, 18, 10, 12]; // px — varied for natural feel

    // 4-pointed star SVG path (beautiful mathematical astroid curve)
    function starPath(size, colour) {
        const s = size / 2;
        return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M${s} 0Q${s} ${s} 0 ${s}Q${s} ${s} ${s} ${size}Q${s} ${s} ${size} ${s}Q${s} ${s} ${s} 0Z" fill="${colour}"/>
        </svg>`;
    }

    for (let i = 0; i < COUNT; i++) {
        const el       = document.createElement('div');
        const size     = SIZES[Math.floor(Math.random() * SIZES.length)];
        const colour   = COLOURS[Math.floor(Math.random() * COLOURS.length)];
        const left     = Math.random() * 100;       // % across width
        const bottom   = Math.random() * 80 + 5;    // % up from bottom
        const dur      = (Math.random() * 3 + 3).toFixed(2); // 3–6s
        const delay    = (Math.random() * 4).toFixed(2);     // 0–4s stagger

        el.className   = 'sparkle';
        el.innerHTML   = starPath(size, colour);
        el.style.cssText = `
            left: ${left}%;
            bottom: ${bottom}%;
            --dur: ${dur}s;
            --delay: ${delay}s;
        `;
        field.appendChild(el);
    }
})();

