/* ═══════════════════════════════════════════════
   VolaLingo — Paywall & Premium System
   Freemium: 50 words free, all words for Premium
   Server-verified for authenticated users
   ═══════════════════════════════════════════════ */

const Paywall = (() => {

const FREE_WORD_LIMIT = 50;
const PREMIUM_PRICE_MONTHLY = 49;
const PREMIUM_PRICE_YEARLY = 199;
const API_BASE = window.location.origin;
const PAYPAL_LINK_MONTHLY = 'https://paypal.me/smartibuy/49';
const PAYPAL_LINK_YEARLY = 'https://paypal.me/smartibuy/199';

// ─── Helpers ───

function getAuthToken() {
  return localStorage.getItem('vl_auth_token');
}

function isLoggedIn() {
  return !!getAuthToken();
}

// ─── Premium Check ───

function isPremium() {
  // 1. Check localStorage flag (anonymous users)
  if (state.isPremium === true) return true;
  // 2. Check session cache
  if (sessionStorage.getItem('vl_premium_verified') === 'true') return true;
  return false;
}

function getAvailableWords() {
  const allWords = (typeof WORDS !== 'undefined') ? WORDS : [];
  if (isPremium()) return allWords;
  return allWords.slice(0, FREE_WORD_LIMIT);
}

function isWordLocked(wordNum) {
  if (isPremium()) return false;
  return wordNum > FREE_WORD_LIMIT;
}

function isNodeAccessible(node) {
  if (isPremium()) return true;
  const words = (typeof APP_DATA !== 'undefined' && APP_DATA.words) ? APP_DATA.words : [];
  const cat = node.category || node.id;
  var nodeWords = words.filter(function(w) { return w.cat === cat; });
  if (nodeWords.length === 0) {
    var heCat = window.CATEGORY_MAP && window.CATEGORY_MAP[cat];
    if (heCat) nodeWords = words.filter(function(w) { return w.cat === heCat; });
  }
  if (nodeWords.length === 0) {
    nodeWords = words.filter(function(w) { return w.catAliases && w.catAliases.indexOf(cat) !== -1; });
  }
  if (nodeWords.length === 0) return true;
  const firstWord = nodeWords[0];
  return firstWord.num <= FREE_WORD_LIMIT;
}

// ─── Server Premium Check ───

async function checkServerPremium() {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const res = await fetch(API_BASE + '/api/premium/status', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    if (data.ok && data.isPremium) {
      // Cache in session storage
      sessionStorage.setItem('vl_premium_verified', 'true');
      state.isPremium = true;
      saveState(state);
      return true;
    }
    return false;
  } catch (e) {
    console.warn('Premium check failed:', e);
    return false;
  }
}

// ─── Show Paywall ───

function showPaywall(feature) {
  const overlay = document.createElement('div');
  overlay.id = 'paywall-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px';
  
  const featureText = feature ? '<div style="background:#fff3cd;color:#856404;padding:8px 12px;border-radius:8px;margin-bottom:16px;font-size:0.9rem">' + feature + '</div>' : '';
  const isAuth = isLoggedIn();
  
  var html = '<div style="background:var(--surface,#fff);border-radius:20px;padding:32px;max-width:420px;width:100%;text-align:center;position:relative;max-height:90vh;overflow-y:auto">' +
    '<button onclick="Paywall.close()" style="position:absolute;top:12px;left:12px;background:none;border:none;font-size:24px;cursor:pointer;color:var(--text3,#999)">&#x2715;</button>' +
    '<div style="font-size:64px;margin-bottom:16px">&#x1F1EE;&#x1F1F9;</div>' +
    '<h2 style="margin:0 0 8px;font-size:1.5rem;color:var(--text,#333)">&#x1F513; &#x05E9;&#x05D7;&#x05E8;&#x05E8; &#x05D0;&#x05EA; Italiano!</h2>' +
    '<p style="color:var(--text3,#999);margin:0 0 24px;font-size:0.95rem">' +
    (feature ? feature : '&#x05D2;&#x05E8;&#x05E1;&#x05D4; &#x05D7;&#x05D9;&#x05E0;&#x05DE;&#x05D9;&#x05EA; &#x05DE;&#x05D5;&#x05D2;&#x05D1;&#x05DC;&#x05EA; &#x05DC;&#x05D0;-50 &#x05DE;&#x05D9;&#x05DC;&#x05D4;') + '</p>' +
    featureText +

    // Monthly plan
    '<div style="background:linear-gradient(135deg,#1cb0f6,#0095ff);color:white;border-radius:16px;padding:20px;margin-bottom:12px;text-align:right">' +
      '<div style="font-size:14px;opacity:0.9;margin-bottom:4px">&#x1F4A0; &#x05D7;&#x05D5;&#x05D3;&#x05E9;&#x05D9; — &#x05D2;&#x05DE;&#x05D9;&#x05E9; &#x05DE;&#x05E7;&#x05E1;&#x05D9;&#x05DE;&#x05DC;&#x05D9;&#x05EA;</div>' +
      '<div style="font-size:36px;font-weight:900">&#x20AA;49<span style="font-size:14px;font-weight:400">/&#x05D7;&#x05D5;&#x05D3;&#x05E9;</span></div>' +
      '<div style="font-size:13px;opacity:0.8;margin-top:2px">&#x05D1;&#x05D9;&#x05D8;&#x05D5;&#x05DC; &#x05D1;&#x05DB;&#x05DC; &#x05E2;&#x05EA;</div>' +
      (isAuth
        ? '<button onclick="Paywall.stripeCheckout(\'monthly\')" style="margin-top:10px;background:white;color:#0095ff;border:none;border-radius:12px;padding:10px 20px;font-weight:800;font-size:0.9rem;cursor:pointer;width:100%">&#x1F4B3; &#x05E9;&#x05DC;&#x05DD; &#x05D1;&#x05DB;&#x05E8;&#x05D8;&#x05D9;&#x05E1; &#x2014; &#x20AA;49/&#x05D7;&#x05D5;&#x05D3;&#x05E9;</button>'
        : '<a href="' + PAYPAL_LINK_MONTHLY + '" target="_blank" style="display:block;margin-top:10px;background:white;color:#0095ff;border-radius:12px;padding:10px 20px;font-weight:800;font-size:0.9rem;text-decoration:none">&#x1F4B3; PayPal &#x2014; &#x20AA;49/&#x05D7;&#x05D5;&#x05D3;&#x05E9;</a>'
      ) +
    '</div>' +

    // Yearly plan (featured)
    '<div style="background:linear-gradient(135deg,#58cc02,#46a302);color:white;border-radius:16px;padding:20px;margin-bottom:20px;text-align:right;border:2px solid #7be825">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">' +
        '<div style="font-size:14px;opacity:0.9">&#x1F525; &#x05E9;&#x05E0;&#x05EA;&#x05D9; — &#x05D7;&#x05D9;&#x05E1;&#x05DB;&#x05D5;&#x05DF; 66%</div>' +
        '<span style="background:#ffc800;color:#1a1a1a;padding:2px 8px;border-radius:8px;font-size:11px;font-weight:800">&#x05D4;&#x05DE;&#x05DC;&#x05E6;&#x05D4;</span>' +
      '</div>' +
      '<div style="font-size:36px;font-weight:900">&#x20AA;199<span style="font-size:14px;font-weight:400">/&#x05E9;&#x05E0;&#x05D4</span></div>' +
      '<div style="font-size:13px;opacity:0.8;margin-top:2px">&#x05E8;&#x05E7; &#x20AA;16/&#x05D7;&#x05D5;&#x05D3;&#x05E9; &#x2014; &#x05D7;&#x05D5;&#x05E1;&#x05DA; &#x20AA;389!</div>' +
      (isAuth
        ? '<button onclick="Paywall.stripeCheckout(\'yearly\')" style="margin-top:10px;background:white;color:#46a302;border:none;border-radius:12px;padding:10px 20px;font-weight:800;font-size:0.9rem;cursor:pointer;width:100%">&#x1F4B3; &#x05E9;&#x05DC;&#x05DD; &#x05D1;&#x05DB;&#x05E8;&#x05D8;&#x05D9;&#x05E1; &#x2014; &#x20AA;199/&#x05E9;&#x05E0;&#x05D4;</button>'
        : '<a href="' + PAYPAL_LINK_YEARLY + '" target="_blank" style="display:block;margin-top:10px;background:white;color:#46a302;border-radius:12px;padding:10px 20px;font-weight:800;font-size:0.9rem;text-decoration:none">&#x1F4B3; PayPal &#x2014; &#x20AA;199/&#x05E9;&#x05E0;&#x05D4;</a>'
      ) +
    '</div>' +

    '<div style="text-align:right;margin-bottom:20px;font-size:13px;color:var(--text2,#666)">' +
      '<div style="margin-bottom:6px">&#x2705; <b>1,064 &#x05DE;&#x05D9;&#x05DC;&#x05D5;&#x05EA;</b> &#x05D0;&#x05D9;&#x05D8;&#x05DC;&#x05E7;&#x05D9;&#x05D5;&#x05EA; (&#x05DE;&#x05DE;&#x05E7;&#x05D5;&#x05DD; 50)</div>' +
      '<div style="margin-bottom:6px">&#x2705; <b>&#x05DE;&#x05E1;&#x05DC;&#x05D5;&#x05DC; A1&#x2192;C1</b> &#x05DE;&#x05DC;&#x05D0;</div>' +
      '<div style="margin-bottom:6px">&#x2705; <b>6 &#x05DE;&#x05E9;&#x05D7;&#x05E7;&#x05D9;&#x05DD;</b> &#x05DC;&#x05E2;&#x05D3;&#x05D9;&#x05DD;</div>' +
      '<div style="margin-bottom:6px">&#x2705; <b>Anki SRS</b> &#x05D7;&#x05DB;&#x05DD;</div>' +
      '<div style="margin-bottom:6px">&#x2705; <b>&#x05EA;&#x05E8;&#x05D7;&#x05D9;&#x05E9;&#x05D9; &#x05E9;&#x05D9;&#x05D7;&#x05D4;</b> per level</div>' +
      '<div style="margin-bottom:6px">&#x2705; <b>&#x05D7;&#x05D3;&#x05E9;&#x05D5;&#x05EA; + &#x05E9;&#x05D9;&#x05E8;&#x05D9;&#x05DD;</b> &#x05D1;&#x05D0;&#x05D9;&#x05D8;&#x05DC;&#x05E7;&#x05D9;&#x05EA;</div>' +
      '<div>&#x2705; <b>&#x05DC;&#x05DC;&#x05D0; &#x05E4;&#x05E8;&#x05E1;&#x05D5;&#x05DE;&#x05D5;&#x05EA;</b></div>' +
    '</div>' +

    '<div style="font-size:11px;color:var(--text3,#999);line-height:1.6">' +
      '&#x1F4B3; &#x05EA;&#x05E9;&#x05DC;&#x05D5;&#x05DD; &#x05DE;&#x05D0;&#x05D5;&#x05D1;&#x05D8;&#x05D7; &middot; &#x05D1;&#x05D9;&#x05D8;&#x05D5;&#x05DC; &#x05D1;&#x05DB;&#x05DC; &#x05E2;&#x05EA; &middot; &#x05D2;&#x05D9;&#x05E9;&#x05D4; &#x05DE;&#x05D9;&#x05D9;&#x05D3;&#x05EA;<br>' +
      (isAuth ? '' : '<a href="#" onclick="Paywall.showLoginPrompt();return false" style="color:#1cb0f6">&#x05D4;&#x05EA;&#x05D7;&#x05D1;&#x05E8; &#x05DC;&#x05D7;&#x05E9;&#x05D1;&#x05D5;&#x05DF;</a> &#x05DC;&#x05EA;&#x05E9;&#x05DC;&#x05D5;&#x05DD; &#x05D1;&#x05DB;&#x05E8;&#x05D8;&#x05D9;&#x05E1;' || '') +
    '</div>' +
  '</div>';

  overlay.innerHTML = html;
  document.body.appendChild(overlay);
}

function showLoginPrompt() {
  close();
  // Try to trigger the login screen if it exists
  var loginBtn = document.getElementById('loginBtn') || document.querySelector('[onclick*="login"], [onclick*="showLogin"]');
  if (loginBtn) {
    loginBtn.click();
  } else if (typeof showLogin === 'function') {
    showLogin();
  } else if (typeof goPage === 'function') {
    goPage('login');
  }
}

// ─── Stripe Checkout ───

async function stripeCheckout(plan) {
  const token = getAuthToken();
  if (!token) {
    showLoginPrompt();
    return;
  }

  try {
    const res = await fetch(API_BASE + '/api/premium/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ plan: plan })
    });
    const data = await res.json();
    if (data.ok && data.url) {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } else {
      alert('Error creating checkout: ' + (data.error || 'Unknown error'));
    }
  } catch (e) {
    alert('Network error: ' + e.message);
  }
}

// ─── Activate Premium (from verification code) ───

async function activatePremiumWithCode(code) {
  try {
    const res = await fetch(API_BASE + '/api/premium/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code })
    });
    const data = await res.json();
    if (data.ok && data.isPremium) {
      state.isPremium = true;
      saveState(state);
      sessionStorage.setItem('vl_premium_verified', 'true');
      close();
      if (typeof toast === 'function') toast('Premium activated!', 'success');
      if (typeof render === 'function') render();
      return true;
    }
    return false;
  } catch (e) {
    console.warn('Code verification failed:', e);
    return false;
  }
}

// Legacy client-side activation (for anonymous users / backward compat)
function activatePremium() {
  state.isPremium = true;
  saveState(state);
  sessionStorage.setItem('vl_premium_verified', 'true');
  close();
  if (typeof toast === 'function') toast('Premium activated!', 'success');
  if (typeof render === 'function') render();
}

function close() {
  const overlay = document.getElementById('paywall-overlay');
  if (overlay) overlay.remove();
}

function lockBadge() {
  return '<span style="background:#ffc800;color:#1a1a1a;padding:2px 8px;border-radius:8px;font-size:11px;font-weight:800;margin-right:6px">PREMIUM</span>';
}

function renderUpgradeBanner() {
  if (isPremium()) return '';
  return '<div style="background:linear-gradient(135deg,#1cb0f6,#0095ff);color:white;border-radius:16px;padding:16px 20px;margin:16px 0;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">' +
    '<div>' +
      '<div style="font-weight:800;font-size:1rem">&#x1F513; &#x05E9;&#x05D3;&#x05E8;&#x05D2; &#x05DC;&#x05E4;&#x05E2;&#x05D9;&#x05DC;&#x05EA; &#x05DE;&#x05DC;&#x05D0;&#x05D4;</div>' +
      '<div style="font-size:0.85rem;opacity:0.9">1,064 &#x05DE;&#x05D9;&#x05DC;&#x05D5;&#x05EA; &middot; 6 &#x05DE;&#x05E9;&#x05D7;&#x05E7;&#x05D9;&#x05DD; &middot; A1&#x2192;C1</div>' +
    '</div>' +
    '<button onclick="Paywall.showPaywall()" ' +
            'style="background:white;color:#0095ff;border:none;border-radius:12px;padding:10px 20px;font-weight:800;font-size:0.9rem;cursor:pointer">' +
      '&#x20AA;49/&#x05D7;&#x05D5;&#x05D3;&#x05E9;' +
    '</button>' +
  '</div>';
}

function renderFreeProgress() {
  if (isPremium()) return '';
  const wordsLearned = (state.wordsLearned || []).length;
  const pct = Math.min(100, Math.round((wordsLearned / FREE_WORD_LIMIT) * 100));
  const remaining = FREE_WORD_LIMIT - wordsLearned;
  
  if (remaining <= 0) {
    return '<div style="background:#fff3cd;border:2px solid #ffc107;border-radius:12px;padding:12px 16px;margin:12px 0;text-align:center">' +
      '<div style="font-weight:700;color:#856404">&#x26A0;&#xFE0F; &#x05D2;&#x05D9;&#x05E2;&#x05EA; &#x05DC;&#x05E2;&#x05E5;&#x05E8; &#x05D4;&#x05D7;&#x05D9;&#x05E0;&#x05DE;&#x05D9;!</div>' +
      '<div style="font-size:0.85rem;color:#856404;margin-top:4px">&#x05DC;&#x05DE;&#x05D3;&#x05EA; ' + FREE_WORD_LIMIT + ' &#x05DE;&#x05D9;&#x05DC;&#x05D5;&#x05EA;. &#x05E9;&#x05D3;&#x05E8;&#x05D2; &#x05DC;&#x05E4;&#x05E2;&#x05D9;&#x05DC;&#x05EA; &#x05DE;&#x05E6;&#x05E2;&#x05D5;&#x05E8;&#x05EA;!</div>' +
      '<button onclick="Paywall.showPaywall()" style="background:#ffc107;color:#1a1a1a;border:none;border-radius:10px;padding:8px 16px;font-weight:700;margin-top:8px;cursor:pointer">&#x05E9;&#x05D3;&#x05E8;&#x05D2; &#x05E2;&#x05DB;&#x05E9;&#x05D9;&#x05E8;</button>' +
    '</div>';
  }
  
  if (wordsLearned >= FREE_WORD_LIMIT * 0.8) {
    return '<div style="background:#e8f4fd;border:2px solid #1cb0f6;border-radius:12px;padding:12px 16px;margin:12px 0">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '<span style="font-weight:700;color:#1cb0f6">&#x1F4CA; &#x05EA;&#x05DB;&#x05E0;&#x05D9;&#x05EA; &#x05D7;&#x05D9;&#x05E0;&#x05DE;&#x05D9;&#x05EA;</span>' +
        '<span style="font-size:0.85rem;color:var(--text3,#999)">' + wordsLearned + '/' + FREE_WORD_LIMIT + ' &#x05DE;&#x05D9;&#x05DC;&#x05D5;&#x05EA;</span>' +
      '</div>' +
      '<div class="duo-progress"><div class="duo-progress-fill" style="width:' + pct + '%">' + pct + '%</div></div>' +
      '<div style="font-size:0.8rem;color:var(--text3,#999);margin-top:4px">&#x05E0;&#x05D5;&#x05EA;&#x05E8;&#x05E8;&#x05D5; ' + remaining + ' &#x05DE;&#x05D9;&#x05DC;&#x05D5;&#x05EA; &#x05D7;&#x05D9;&#x05E0;&#x05DE;&#x05D9;&#x05D5;&#x05EA; &middot; <a href="#" onclick="Paywall.showPaywall();return false" style="color:#1cb0f6">&#x05E9;&#x05D3;&#x05E8;&#x05D2;</a></div>' +
    '</div>';
  }
  
  return '';
}

// ─── Init: Check server premium on load for logged-in users ───

function init() {
  // Check if user is logged in and verify premium status
  if (isLoggedIn()) {
    checkServerPremium();
  }
  
  // Check URL for premium=success param (redirect from Stripe)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('premium') === 'success') {
    // Try to activate via server check
    setTimeout(function() {
      if (isLoggedIn()) {
        checkServerPremium().then(function(isPrem) {
          if (isPrem) {
            if (typeof toast === 'function') toast('&#x1F389; Premium activated! Welcome!', 'success');
            if (typeof render === 'function') render();
          } else {
            // Wait a bit more for webhook to process, then check again
            setTimeout(function() {
              checkServerPremium().then(function(p2) {
                if (p2 && typeof render === 'function') render();
              });
            }, 3000);
          }
        });
      }
    }, 1000);
    
    // Clean URL
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
}

// Auto-init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

return {
  isPremium,
  getAvailableWords,
  isWordLocked,
  isNodeAccessible,
  showPaywall,
  close,
  activatePremium,
  activatePremiumWithCode,
  stripeCheckout,
  lockBadge,
  renderUpgradeBanner,
  renderFreeProgress,
  checkServerPremium,
  FREE_WORD_LIMIT,
  PREMIUM_PRICE_MONTHLY,
  PREMIUM_PRICE_YEARLY
};

})();
