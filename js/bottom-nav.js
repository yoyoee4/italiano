/* ═══════════════════════════════════════════════
   VolaLingo — Bottom Navigation Animations & UX
   Smooth scroll, touch gestures, ripple, active states
   ═══════════════════════════════════════════════ */

(function() {
  'use strict';

  const nav = document.querySelector('.bottom-nav');
  if (!nav) return;

  // ── CONFIG ──
  const CONFIG = {
    scrollEasing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    scrollDuration: 300,
    rippleDuration: 400,
    activeScale: 1.08,
    inactiveScale: 1,
    touchThreshold: 10,
    edgeFadeWidth: 30,
  };

  // ── STATE ──
  let isScrolling = false;
  let startX = 0;
  let scrollLeft = 0;
  let isDragging = false;
  let rafId = null;

  // ── ELEMENTS ──
  const items = nav.querySelectorAll('.nav-item');
  const firstItem = items[0];
  const lastItem = items[items.length - 1];

  // ── HELPERS ──
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateScroll(targetX) {
    if (prefersReducedMotion) {
      nav.scrollLeft = targetX;
      return;
    }

    const start = nav.scrollLeft;
    const change = targetX - start;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / CONFIG.scrollDuration, 1);
      const eased = easeOutCubic(progress);
      nav.scrollLeft = start + change * eased;

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        rafId = null;
        isScrolling = false;
        updateEdgeFade();
      }
    }

    isScrolling = true;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(step);
  }

  // ── EDGE FADE EFFECT ──
  function createEdgeFade() {
    if (nav.querySelector('.nav-edge-fade')) return;

    const fadeLeft = document.createElement('div');
    fadeLeft.className = 'nav-edge-fade nav-edge-fade-left';
    Object.assign(fadeLeft.style, {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: `${CONFIG.edgeFadeWidth}px`,
      background: 'linear-gradient(to right, var(--surface), transparent)',
      pointerEvents: 'none',
      opacity: '0',
      transition: 'opacity 0.3s ease',
      zIndex: 10,
    });

    const fadeRight = document.createElement('div');
    fadeRight.className = 'nav-edge-fade nav-edge-fade-right';
    Object.assign(fadeRight.style, {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: `${CONFIG.edgeFadeWidth}px`,
      background: 'linear-gradient(to left, var(--surface), transparent)',
      pointerEvents: 'none',
      opacity: '0',
      transition: 'opacity 0.3s ease',
      zIndex: 10,
    });

    // Nav already has position:fixed;bottom:0 from CSS — don't override
    nav.appendChild(fadeLeft);
    nav.appendChild(fadeRight);

    return { left: fadeLeft, right: fadeRight };
  }

  const edgeFades = createEdgeFade();

  function updateEdgeFade() {
    if (!edgeFades) return;
    const { scrollLeft, scrollWidth, clientWidth } = nav;
    const atStart = scrollLeft <= 2;
    const atEnd = scrollLeft + clientWidth >= scrollWidth - 2;

    edgeFades.left.style.opacity = atStart ? '0' : '1';
    edgeFades.right.style.opacity = atEnd ? '0' : '1';
  }

  // ── RIPPLE EFFECT ──
  function createRipple(element, x, y) {
    if (prefersReducedMotion) return;

    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.5;
    const ripple = document.createElement('span');
    ripple.className = 'nav-ripple';

    Object.assign(ripple.style, {
      position: 'absolute',
      left: `${x - rect.left - size / 2}px`,
      top: `${y - rect.top - size / 2}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: 'rgba(88, 204, 2, 0.25)',
      transform: 'scale(0)',
      animation: `ripple-anim ${CONFIG.rippleDuration}ms ease-out forwards`,
      pointerEvents: 'none',
      zIndex: 1,
    });

    // Add keyframe if not exists
    if (!document.getElementById('ripple-keyframes')) {
      const style = document.createElement('style');
      style.id = 'ripple-keyframes';
      style.textContent = `
        @keyframes ripple-anim {
          to { transform: scale(1); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    // Nav already has position:fixed;bottom:0 from CSS - don't override
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    setTimeout(() => ripple.remove(), CONFIG.rippleDuration);
  }

  // ── ACTIVE ITEM ANIMATION ──
  function animateActiveItem(activeItem) {
    if (prefersReducedMotion) return;

    items.forEach(item => {
      if (item === activeItem) {
        item.style.transform = `scale(${CONFIG.activeScale})`;
        item.style.zIndex = '5';
      } else {
        item.style.transform = `scale(${CONFIG.inactiveScale})`;
        item.style.zIndex = '1';
      }
    });

    // Scroll active item into view smoothly
    if (activeItem) {
      const navRect = nav.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      const isHiddenLeft = itemRect.left < navRect.left;
      const isHiddenRight = itemRect.right > navRect.right;

      if (isHiddenLeft || isHiddenRight) {
        const targetScroll = nav.scrollLeft + (itemRect.left - navRect.left) - (navRect.width - itemRect.width) / 2;
        animateScroll(targetScroll);
      }
    }
  }

  // ── TOUCH HANDLING ──
  function onTouchStart(e) {
    if (e.touches.length > 1) return;
    isDragging = true;
    startX = e.touches[0].clientX;
    scrollLeft = nav.scrollLeft;
    nav.style.scrollBehavior = 'auto';
    nav.style.cursor = 'grabbing';
  }

  function onTouchMove(e) {
    if (!isDragging) return;
    const x = e.touches[0].clientX;
    const walk = (startX - x) * 1.5; // Scroll faster than finger
    nav.scrollLeft = scrollLeft + walk;
    updateEdgeFade();
  }

  function onTouchEnd(e) {
    isDragging = false;
    nav.style.cursor = 'grab';
    nav.style.scrollBehavior = 'smooth';

    // Snap to nearest item if close
    snapToNearestItem();
  }

  function onMouseDown(e) {
    if (e.button !== 0) return;
    isDragging = true;
    startX = e.clientX;
    scrollLeft = nav.scrollLeft;
    nav.style.cursor = 'grabbing';
    e.preventDefault();
  }

  function onMouseMove(e) {
    if (!isDragging) return;
    const walk = (startX - e.clientX) * 1.5;
    nav.scrollLeft = scrollLeft + walk;
    updateEdgeFade();
  }

  function onMouseUp() {
    isDragging = false;
    nav.style.cursor = 'grab';
    snapToNearestItem();
  }

  function snapToNearestItem() {
    const centerX = nav.scrollLeft + nav.clientWidth / 2;
    let closestItem = null;
    let minDist = Infinity;

    items.forEach(item => {
      const itemCenter = item.offsetLeft + item.offsetWidth / 2;
      const dist = Math.abs(itemCenter - centerX);
      if (dist < minDist) {
        minDist = dist;
        closestItem = item;
      }
    });

    if (closestItem) {
      const targetScroll = closestItem.offsetLeft - (nav.clientWidth - closestItem.offsetWidth) / 2;
      animateScroll(Math.max(0, targetScroll));
    }
  }

  // ── CLICK HANDLING ──
  function onItemClick(e) {
    const item = e.currentTarget;
    const page = item.dataset.page;
    if (!page) return;

    // Ripple at click position
    createRipple(item, e.clientX, e.clientY);

    // Immediate visual feedback
    item.style.transform = 'scale(0.95)';
    setTimeout(() => {
      item.style.transform = '';
      animateActiveItem(item);
    }, 100);

    // Trigger navigation — inline onclick already handles this, prevent double call
    // (do nothing here — goPage is called from the HTML onclick attribute)
  }

  // ── KEYBOARD NAVIGATION ──
  function onKeyDown(e) {
    const activeItem = nav.querySelector('.nav-item.active') || items[0];
    const activeIndex = Array.from(items).indexOf(activeItem);

    let targetIndex = activeIndex;
    if (e.key === 'ArrowLeft' || (e.key === 'ArrowRight' && dir === 'rtl')) {
      targetIndex = Math.max(0, activeIndex - 1);
      e.preventDefault();
    } else if (e.key === 'ArrowRight' || (e.key === 'ArrowLeft' && dir === 'rtl')) {
      targetIndex = Math.min(items.length - 1, activeIndex + 1);
      e.preventDefault();
    } else if (e.key === 'Home') {
      targetIndex = 0;
      e.preventDefault();
    } else if (e.key === 'End') {
      targetIndex = items.length - 1;
      e.preventDefault();
    } else if (e.key === 'Enter' || e.key === ' ') {
      activeItem.click();
      e.preventDefault();
    }

    if (targetIndex !== activeIndex) {
      const targetItem = items[targetIndex];
      targetItem.focus();
      targetItem.click();
    }
  }

  // ── INTERSECTION OBSERVER FOR EDGE FADE ──
  function setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;

    const sentinelLeft = document.createElement('div');
    sentinelLeft.style.cssText = 'width: 1px; height: 100%; position: absolute; left: 0;';
    nav.insertBefore(sentinelLeft, nav.firstChild);

    const sentinelRight = document.createElement('div');
    sentinelRight.style.cssText = 'width: 1px; height: 100%; position: absolute; right: 0;';
    nav.appendChild(sentinelRight);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target === sentinelLeft) {
          edgeFades.left.style.opacity = entry.isIntersecting ? '0' : '1';
        } else if (entry.target === sentinelRight) {
          edgeFades.right.style.opacity = entry.isIntersecting ? '0' : '1';
        }
      });
    }, { root: nav, threshold: 0 });

    observer.observe(sentinelLeft);
    observer.observe(sentinelRight);
  }

  // ── INITIALIZATION ──
  function init() {
    // Add required styles
    nav.style.scrollBehavior = 'smooth';
    nav.style.cursor = 'grab';
    nav.style.userSelect = 'none';
    nav.style.touchAction = 'pan-x';

    // Make items focusable and add click handlers
    items.forEach((item, index) => {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', item.textContent.trim());

      // Click handler
      item.addEventListener('click', onItemClick);

      // Keyboard
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          item.click();
        }
      });

      // Touch ripple on touchstart
      item.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          createRipple(item, e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });
    });

    // Touch events for horizontal scroll
    nav.addEventListener('touchstart', onTouchStart, { passive: true });
    nav.addEventListener('touchmove', onTouchMove, { passive: true });
    nav.addEventListener('touchend', onTouchEnd, { passive: true });
    nav.addEventListener('touchcancel', onTouchEnd, { passive: true });

    // Mouse drag for desktop
    nav.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Keyboard navigation on the nav container
    nav.addEventListener('keydown', onKeyDown);

    // Scroll event for edge fade
    nav.addEventListener('scroll', () => {
      if (!isDragging && !isScrolling) {
        updateEdgeFade();
      }
    }, { passive: true });

    // Initial edge fade state
    updateEdgeFade();

    // Observe active item changes
    const observer = new MutationObserver(() => {
      const activeItem = nav.querySelector('.nav-item.active');
      if (activeItem) animateActiveItem(activeItem);
    });
    observer.observe(nav, { attributes: true, attributeFilter: ['class'], subtree: true });

    // Initial active item animation
    const initialActive = nav.querySelector('.nav-item.active');
    if (initialActive) animateActiveItem(initialActive);

    // Setup intersection observer for better edge fade
    setupIntersectionObserver();

    // Expose API
    window.BottomNav = {
      scrollToItem: (page) => {
        const item = nav.querySelector(`.nav-item[data-page="${page}"]`);
        if (item) {
          animateActiveItem(item);
        }
      },
      getActivePage: () => {
        const active = nav.querySelector('.nav-item.active');
        return active ? active.dataset.page : null;
      },
      items: Array.from(items).map(i => i.dataset.page),
    };

    console.log('✅ BottomNav initialized with animations');
  }

  // Auto-init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();