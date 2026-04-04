// Scroll reveal animation
function reveal() {
    var reveals = document.querySelectorAll(".reveal");
    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 100;

        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        }
    }
}

// ── Scroll Chevron: fade out when user scrolls ──
const chevron = document.getElementById('scroll-chevron');
function updateChevron() {
    if (window.scrollY > 60) {
        chevron.classList.add('hidden');
    } else {
        chevron.classList.remove('hidden');
    }
}

// ── Sticky Nav: active section highlight ──
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');
function updateActiveNav() {
    let current = '';
    sections.forEach(sec => {
        const sectionTop = sec.offsetTop - 90;
        if (window.scrollY >= sectionTop) {
            current = sec.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === current) {
            link.classList.add('active');
        }
    });
}

// ── Back to Top Button ──
const backToTopBtn = document.getElementById('back-to-top');
function updateBackToTop() {
    if (window.scrollY > 500) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
}

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener("scroll", () => {
    reveal();
    updateChevron();
    updateActiveNav();
    updateBackToTop();
});

// Trigger once on load
reveal();
updateChevron();
updateActiveNav();
updateBackToTop();

// Interactive mouse glow effect for glass cards
document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// ── Hero Floaters: 3D Parallax via RAF + Lerp ──
// Root cause of "sudden shift" bug: CSS `transition: translate 0.4s` was
// fighting the keyframe `transform` mid-animation, producing a visible jump.
// Fix: no CSS transition on translate — instead lerp toward target every frame.
const heroSection = document.querySelector('.hero');
const floaters    = document.querySelectorAll('.floater');

// Depth per floater (higher = moves more = feels closer).
// Order: king, chip, code, rocket, euler, planet
const floaterDepths = [0.030, 0.050, 0.025, 0.042, 0.035, 0.018];

const cur = Array.from({ length: floaters.length }, () => ({ x: 0, y: 0 }));
const tgt = Array.from({ length: floaters.length }, () => ({ x: 0, y: 0 }));
const EASE = 0.07; // lerp factor — lower = smoother / more cinematic

if (heroSection && floaters.length) {
    heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const dx = e.clientX - rect.left  - rect.width  / 2;
        const dy = e.clientY - rect.top   - rect.height / 2;
        floaters.forEach((_, i) => {
            const d = floaterDepths[i] ?? 0.03;
            tgt[i].x = dx * d * -1;
            tgt[i].y = dy * d * -1;
        });
    });

    heroSection.addEventListener('mouseleave', () => {
        floaters.forEach((_, i) => { tgt[i].x = 0; tgt[i].y = 0; });
    });

    // 60 fps lerp loop — no CSS transition needed
    (function animateParallax() {
        floaters.forEach((floater, i) => {
            cur[i].x += (tgt[i].x - cur[i].x) * EASE;
            cur[i].y += (tgt[i].y - cur[i].y) * EASE;
            floater.style.setProperty('--px', `${cur[i].x.toFixed(3)}px`);
            floater.style.setProperty('--py', `${cur[i].y.toFixed(3)}px`);
        });
        requestAnimationFrame(animateParallax);
    })();
}

// Modal functionality
function openModal(imageSrc, title) {
    const modal = document.getElementById('certModal');
    const wrapper = document.querySelector('.modal-image-wrapper');
    const img = document.getElementById('modalImage');
    const placeholder = document.getElementById('modalPlaceholder');
    const modalTitle = document.getElementById('modalTitle');

    modalTitle.innerText = title;

    // Clean up any extra images from previous modal opens
    wrapper.querySelectorAll('img.extra-cert-img').forEach(el => el.remove());

    let images = [];
    if (Array.isArray(imageSrc)) {
        images = imageSrc;
    } else if (imageSrc) {
        images = [imageSrc];
    }

    if (images.length > 0) {
        img.src = images[0];
        img.style.display = 'block';
        img.style.marginBottom = images.length > 1 ? '1.5rem' : '0';

        for (let i = 1; i < images.length; i++) {
            const extraImg = document.createElement('img');
            extraImg.src = images[i];
            extraImg.classList.add('extra-cert-img');
            extraImg.alt = "Certificate Closeup";
            extraImg.style.marginBottom = i < images.length - 1 ? '1.5rem' : '0';
            wrapper.insertBefore(extraImg, placeholder);
        }

        wrapper.style.flexDirection = 'column';
        wrapper.style.justifyContent = images.length > 1 ? 'flex-start' : 'center';
        placeholder.style.display = 'none';
    } else {
        img.style.display = 'none';
        wrapper.style.flexDirection = 'column';
        wrapper.style.justifyContent = 'center';
        placeholder.style.display = 'flex';
    }

    modal.style.display = 'flex';
    // Slight delay to allow display flex to apply before opacity transition
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);

    // Prevent scrolling on body while modal is open
    document.body.style.overflow = 'hidden';
}

function closeModal(event, force = false) {
    const modal = document.getElementById('certModal');
    const modalContent = document.querySelector('.modal-content');

    // Close if clicking outside the modal content or if force closing (X button)
    if (force || (event && event.target === modal && event.target !== modalContent)) {
        modal.classList.remove('active');

        // Wait for transition to finish
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        }, 300);
    }
}
