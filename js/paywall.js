/* ═══════════════════════════════════════════════
   VolaLingo — Paywall & Premium System
   Freemium: 50 words free, 1064 for NIS 29/month
   ═══════════════════════════════════════════════ */

const Paywall = (() => {

const FREE_WORD_LIMIT = 50;
const PREMIUM_PRICE = 29;
const PAYPAL_LINK = 'https://paypal.me/smartibuy/29';

function isPremium() {
  return state.isPremium === true;
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
  const words = (typeof WORDS !== 'undefined') ? WORDS : [];
  const nodeWords = words.filter(w => w.cat === (node.category || node.id));
  if (nodeWords.length === 0) return true;
  const firstWord = nodeWords[0];
  return firstWord.num <= FREE_WORD_LIMIT;
}

function showPaywall(feature) {
  const overlay = document.createElement('div');
  overlay.id = 'paywall-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px';
  
  const featureText = feature ? '<div style="background:#fff3cd;color:#856404;padding:8px 12px;border-radius:8px;margin-bottom:16px;font-size:0.9rem">' + feature + '</div>' : '';
  
  overlay.innerHTML = '<div style="background:var(--surface,#fff);border-radius:20px;padding:32px;max-width:420px;width:100%;text-align:center;position:relative">' +
    '<button onclick="Paywall.close()" style="position:absolute;top:12px;left:12px;background:none;border:none;font-size:24px;cursor:pointer;color:var(--text3,#999)">&#x2715;</button>' +
    '<div style="font-size:64px;margin-bottom:16px">&#x1F1EE;&#x1F1F9;</div>' +
    '<h2 style="margin:0 0 8px;font-size:1.5rem;color:var(--text,#333)">&#x1F513; &#x05E9;&#x05D7;&#x05E8;&#x05E8; &#x05D0;&#x05EA; Italiano!</h2>' +
    '<p style="color:var(--text3,#999);margin:0 0 24px;font-size:0.95rem">' +
    (feature ? feature : '&#x05D2;&#x05E8;&#x05E1;&#x05D4; &#x05D7;&#x05D9;&#x05E0;&#x05DE;&#x05D9;&#x05EA; &#x05DE;&#x05D5;&#x05D2;&#x05D1;&#x05DC;&#x05EA; &#x05DC;&#x05D0;-50 &#x05DE;&#x05D9;&#x05DC;&#x05D4;') + '</p>' +
    featureText +
    '<div style="background:linear-gradient(135deg,#1cb0f6,#0095ff);color:white;border-radius:16px;padding:24px;margin-bottom:20px">' +
      '<div style="font-size:14px;opacity:0.9;margin-bottom:4px">Premium Membership</div>' +
      '<div style="font-size:42px;font-weight:900">&#x20AA;29<span style="font-size:16px;font-weight:400">/&#x05D7;&#x05D5;&#x05D3;&#x05E9;</span></div>' +
      '<div style="font-size:13px;opacity:0.8;margin-top:4px">&#x05D1;&#x05D9;&#x05D8;&#x05D5;&#x05DC; &#x05D1;&#x05DB;&#x05DC; &#x05E2;&#x05EA;</div>' +
    '</div>' +
    '<div style="text-align:right;margin-bottom:24px;font-size:14px;color:var(--text2,#666)">' +
      '<div style="margin-bottom:8px">&#x2705; <b>1,064 &#x05DE;&#x05D9;&#x05DC;&#x05D5;&#x05EA;</b> &#x05D0;&#x05D9;&#x05D8;&#x05DC;&#x05E7;&#x05D9;&#x05D5;&#x05EA; (&#x05DE;&#x05DE;&#x05E7;&#x05D5;&#x05DD; 50)</div>' +
      '<div style="margin-bottom:8px">&#x2705; <b>&#x05DE;&#x05E1;&#x05DC;&#x05D5;&#x05DC; A1&#x2192;C1</b> &#x05DE;&#x05DC;&#x05D0;</div>' +
      '<div style="margin-bottom:8px">&#x2705; <b>6 &#x05DE;&#x05E9;&#x05D7;&#x05E7;&#x05D9;&#x05DD;</b> &#x05DC;&#x05E2;&#x05D3;&#x05D9;&#x05DD;</div>' +
      '<div style="margin-bottom:8px">&#x2705; <b>Anki SRS</b> &#x05D7;&#x05DB;&#x05DD;</div>' +
      '<div style="margin-bottom:8px">&#x2705; <b>&#x05EA;&#x05E8;&#x05D7;&#x05D9;&#x05E9;&#x05D9; &#x05E9;&#x05D9;&#x05D7;&#x05D4;</b> per level</div>' +
      '<div style="margin-bottom:8px">&#x2705; <b>&#x05D7;&#x05D3;&#x05E9;&#x05D5;&#x05EA; + &#x05E9;&#x05D9;&#x05E8;&#x05D9;&#x05DD;</b> &#x05D1;&#x05D0;&#x05D9;&#x05D8;&#x05DC;&#x05E7;&#x05D9;&#x05EA;</div>' +
      '<div>&#x2705; <b>&#x05DC;&#x05DC;&#x05D0; &#x05E4;&#x05E8;&#x05E1;&#x05D5;&#x05DE;&#x05D5;&#x05EA;</b></div>' +
    '</div>' +
    '<a href="' + PAYPAL_LINK + '" target="_blank" ' +
      'style="display:block;background:linear-gradient(135deg,#58cc02,#46a302);color:white;border:none;border-bottom:4px solid #38a002;border-radius:16px;padding:16px;font-size:18px;font-weight:800;text-decoration:none;cursor:pointer;text-align:center;margin-bottom:12px">' +
      '&#x1F680; &#x05E9;&#x05D3;&#x05E8;&#x05D2; &#x05E2;&#x05DB;&#x05E9;&#x05D9;&#x05E8; &#x2014; &#x20AA;29/&#x05D7;&#x05D5;&#x05D3;&#x05E9;' +
    '</a>' +
    '<div style="font-size:12px;color:var(--text3,#999)">' +
      '&#x1F4B3; PayPal &#x05DE;&#x05D0;&#x05D5;&#x05D1;&#x05D8;&#x05D7; &middot; &#x05D1;&#x05D9;&#x05D8;&#x05D5;&#x05DC; &#x05D1;&#x05DB;&#x05DC; &#x05E2;&#x05EA; &middot; &#x05D2;&#x05D9;&#x05E9;&#x05D4; &#x05DE;&#x05D9;&#x05D9;&#x05D3;&#x05EA;' +
    '</div>' +
  '</div>';
  
  document.body.appendChild(overlay);
}

function close() {
  const overlay = document.getElementById('paywall-overlay');
  if (overlay) overlay.remove();
}

function activatePremium() {
  state.isPremium = true;
  saveState(state);
  close();
  if (typeof toast === 'function') toast('Premium activated!', 'success');
  if (typeof render === 'function') render();
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
      '&#x20AA;29/&#x05D7;&#x05D5;&#x05D3;&#x05E9;' +
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

return {
  isPremium,
  getAvailableWords,
  isWordLocked,
  isNodeAccessible,
  showPaywall,
  close,
  activatePremium,
  lockBadge,
  renderUpgradeBanner,
  renderFreeProgress,
  FREE_WORD_LIMIT,
  PREMIUM_PRICE
};

})();
