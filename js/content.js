/* ═══════════════════════════════════════════════
   VolaLingo v2 — Content Module
   News (Italian), Songs, Stories, CILS Exam Info
   Uses B.AI API as fallback for translation
   ═══════════════════════════════════════════════ */

const Content = (() => {

const BAI_API = 'https://api.b.ai';
const BAI_KEY = 'sk-dk1eflbtuz623in5dmjcdzjbvn5gbpag';
const BAI_MODEL = 'gpt-4o-mini'; // cheap + fast for translations

let currentTab = 'news';
let newsCache = [];
let newsLoading = false;

// ═══════════════════════════════════════
// RENDER
// ═══════════════════════════════════════
function render() {
  const container = document.getElementById('exploreContent');
  
  container.innerHTML = `
    <h2 class="section-title"><span class="emoji">📰</span> חקור</h2>
    
 <div class="tab-row">
 <div class="tab-btn ${currentTab==='translate'?'active':''}" onclick="Content.switchTab('translate')">⚡ תרגום</div>
 <div class="tab-btn ${currentTab==='careers'?'active':''}" onclick="Content.switchTab('careers')">💼 קריירה</div>
 <div class="tab-btn ${currentTab==='news'?'active':''}" onclick="Content.switchTab('news')">📰 חדשות</div>
 <div class="tab-btn ${currentTab==='songs'?'active':''}" onclick="Content.switchTab('songs')">🎵 שירים</div>
 <div class="tab-btn ${currentTab==='stories'?'active':''}" onclick="Content.switchTab('stories')">📖 סיפורים</div>
 <div class="tab-btn ${currentTab==='culture'?'active':''}" onclick="Content.switchTab('culture')">🏛️ תרבות</div>
 </div>
    
    <div id="contentTabArea"></div>
  `;
  
  renderTab();
}

function switchTab(tab) {
  currentTab = tab;
  render();
}

function renderTab() {
  const area = document.getElementById('contentTabArea');
  if (!area) return;
  
 switch(currentTab) {
 case 'translate': Features.renderTranslate(area); break;
 case 'careers': Features.renderCareers(area); break;
 case 'news': renderNews(area); break;
 case 'songs': renderSongs(area); break;
 case 'stories': renderStories(area); break;
 case 'culture': renderCulture(area); break;
 }
}

// ═══════════════════════════════════════
// NEWS (Italian RSS → translated)
// ═══════════════════════════════════════
function renderNews(area) {
  if (newsCache.length > 0) {
    renderNewsList(area, newsCache);
    return;
  }
  
  area.innerHTML = `
    <div class="card" style="text-align:center;padding:24px">
      <div style="font-size:2rem;margin-bottom:8px">📰</div>
      <div style="font-weight:700">טוען חדשות באיטלקית...</div>
      <div style="font-size:.8rem;color:var(--text3);margin-top:4px">מקור: ANSA.it</div>
    </div>
  `;
  
  fetchNews();
}

async function fetchNews() {
  if (newsLoading) return;
  newsLoading = true;
  
  try {
    // Try RSS2JSON for ANSA
    const rssUrl = 'https://www.ansa.it/sito/notizie/topnews/topnews_rss.xml';
    const resp = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=10`);
    const data = await resp.json();
    
    if (data.items && data.items.length > 0) {
      newsCache = data.items.map(item => ({
        title: item.title,
        link: item.link,
        date: item.pubDate,
        description: item.description || '',
        thumbnail: item.thumbnail || item.enclosure?.link || '',
        translatedTitle: null,
        translatedDesc: null,
      }));
      
      // Translate first 5 titles via B.AI
      await translateNewsItems(newsCache.slice(0, 5));
      
      const area = document.getElementById('contentTabArea');
      if (area && currentTab === 'news') renderNewsList(area, newsCache);
    } else {
      // Fallback: use static news from APP_DATA
      newsCache = (APP_DATA.newsItems || []).map(n => ({...n, translatedTitle: n.titleHe, translatedDesc: n.descHe}));
      const area = document.getElementById('contentTabArea');
      if (area && currentTab === 'news') renderNewsList(area, newsCache);
    }
  } catch (e) {
    console.warn('RSS fetch failed, using static data', e);
    newsCache = (APP_DATA.newsItems || []).map(n => ({...n, translatedTitle: n.titleHe, translatedDesc: n.descHe}));
    const area = document.getElementById('contentTabArea');
    if (area && currentTab === 'news') renderNewsList(area, newsCache);
  }
  
  newsLoading = false;
}

async function translateNewsItems(items) {
  try {
    const titles = items.map(i => i.title).join('\n');
    const descs = items.map(i => i.description?.replace(/<[^>]+>/g,'').trim() || '').join('\n---\n');
    
    const resp = await fetch(`${BAI_API}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${BAI_KEY}` },
      body: JSON.stringify({
        model: BAI_MODEL,
        messages: [
          { role: 'system', content: 'You translate Italian to Hebrew. Return ONLY the translations, one per line, matching the input order. No explanations.' },
          { role: 'user', content: `Translate these Italian news titles to Hebrew (one per line):\n${titles}` }
        ],
        temperature: 0.3,
        max_tokens: 500,
      })
    });
    
    const data = await resp.json();
    const translations = (data.choices?.[0]?.message?.content || '').split('\n').filter(l => l.trim());
    
    items.forEach((item, i) => {
      if (translations[i]) item.translatedTitle = translations[i].trim();
    });
    
    // Translate descriptions
    if (descs.replace(/---/g,'').trim()) {
      const resp2 = await fetch(`${BAI_API}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${BAI_KEY}` },
        body: JSON.stringify({
          model: BAI_MODEL,
          messages: [
            { role: 'system', content: 'You translate Italian to Hebrew. Return ONLY the translations separated by ---. No explanations.' },
            { role: 'user', content: `Translate these Italian news descriptions to Hebrew:\n${descs}` }
          ],
          temperature: 0.3,
          max_tokens: 800,
        })
      });
      
      const data2 = await resp2.json();
      const descTranslations = (data2.choices?.[0]?.message?.content || '').split('---').map(s => s.trim());
      
      items.forEach((item, i) => {
        if (descTranslations[i]) item.translatedDesc = descTranslations[i];
      });
    }
  } catch (e) {
    console.warn('B.AI translation failed', e);
  }
}

function renderNewsList(area, items) {
  area.innerHTML = `
    <div style="margin-bottom:8px;font-size:.75rem;color:var(--text3);text-align:center">
      📰 חדשות מאיטליה — קרא באיטלקית + תרגום לעברית
    </div>
    ${items.map(item => `
      <div class="news-item" onclick="speak('${esc(item.title)}')">
        <div class="news-title">${item.title}</div>
        ${item.translatedTitle ? `<div class="news-translation">🇮🇱 ${item.translatedTitle}</div>` : '<div class="news-translation" style="color:var(--text3)">⏳ מתרגם...</div>'}
        ${item.description ? `<div class="news-translation" style="margin-top:4px">${item.description.replace(/<[^>]+>/g,'').slice(0,150)}...</div>` : ''}
        ${item.translatedDesc ? `<div class="news-translation" style="color:var(--emerald-light)">🇮🇱 ${item.translatedDesc.slice(0,150)}</div>` : ''}
        <div class="news-meta">
          <span>📅 ${new Date(item.date).toLocaleDateString('he-IL')}</span>
          ${item.link ? `<a href="${item.link}" target="_blank" style="color:var(--indigo-light)">קרא עוד →</a>` : ''}
          <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();speak('${esc(item.title)}')">🔊</button>
        </div>
      </div>
    `).join('')}
    <div style="text-align:center;margin:16px 0">
      <button class="btn btn-secondary" onclick="Content.refreshNews()">🔄 רענן</button>
    </div>
  `;
}

function refreshNews() {
  newsCache = [];
  newsLoading = false;
  render();
}

// ═══════════════════════════════════════
// SONGS (Italian with translation)
// ═══════════════════════════════════════
function renderSongs(area) {
  const songs = APP_DATA.songs || [];
  
  if (songs.length === 0) {
    area.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎵</div>
        <div class="empty-text">שירים בקרוב!</div>
        <div class="empty-sub">שירים איטלקיים עם תרגום והקראה</div>
      </div>
    `;
    return;
  }
  
  area.innerHTML = `
    <div style="margin-bottom:8px;font-size:.75rem;color:var(--text3);text-align:center">
      🎵 שירים איטלקיים — למד דרך מוזיקה!
    </div>
    ${songs.map((s, i) => `
      <div class="song-item" onclick="Content.openSong(${i})">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <span style="font-size:2rem">${s.emoji || '🎵'}</span>
          <div>
            <div style="font-weight:700;font-family:var(--font-it)">${s.title}</div>
            <div style="font-size:.8rem;color:var(--text2)">${s.artist}</div>
          </div>
        </div>
        <div style="font-size:.75rem;color:var(--text3)">${s.level || 'A2'} • ${s.year || ''}</div>
      </div>
    `).join('')}
  `;
}

function openSong(idx) {
  const song = APP_DATA.songs[idx];
  if (!song) return;
  
  const area = document.getElementById('exploreContent');
  let html = `
    <button class="back-btn" onclick="Content.switchTab('songs')">← חזרה</button>
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:3rem;margin-bottom:8px">${song.emoji || '🎵'}</div>
      <h2 style="font-family:var(--font-it);font-weight:800">${song.title}</h2>
      <div style="font-size:.85rem;color:var(--text2)">${song.artist} • ${song.year || ''}</div>
    </div>
    
    <div style="margin:16px 0;display:flex;justify-content:center;gap:8px">
      <button class="btn btn-secondary btn-sm" onclick="Content.playSongFull(${idx})">🔊 השמע הכל</button>
      <button class="btn btn-primary btn-sm" onclick="Content.singAlong(${idx})">🎤 שיר איתי</button>
    </div>
    
    <h3 class="section-title"><span class="emoji">📝</span> מילים + תרגום</h3>
  `;
  
  song.lines.forEach((line, li) => {
    html += `
      <div style="padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer" onclick="speak('${esc(line.it)}')">
        <div style="font-family:var(--font-it);font-size:.95rem;font-weight:600">${line.it}</div>
        ${line.he ? `<div style="font-size:.8rem;color:var(--text3);margin-top:2px">${line.he}</div>` : ''}
      </div>
    `;
  });
  
  // Vocabulary from song
  if (song.vocab && song.vocab.length > 0) {
    html += `<h3 class="section-title"><span class="emoji">📚</span> אוצר מילים</h3>`;
    song.vocab.forEach(v => {
      html += `
        <div class="word-item" onclick="speak('${esc(v.it)}')">
          <div class="word-left">
            <div class="word-it">${v.it}</div>
            <div class="word-he">${v.he}</div>
          </div>
          <div class="word-right">
            <button class="speak-btn" onclick="event.stopPropagation();speak('${esc(v.it)}')">🔊</button>
          </div>
        </div>
      `;
    });
  }
  
  area.innerHTML = html;
}

function playSongFull(idx) {
  const song = APP_DATA.songs[idx];
  if (!song) return;
  let i = 0;
  function playNext() {
    if (i >= song.lines.length) return;
    speak(song.lines[i].it, undefined, 0.7);
    i++;
    setTimeout(playNext, song.lines[i-1].it.split(' ').length * 600);
  }
  playNext();
}

function singAlong(idx) {
  const song = APP_DATA.songs[idx];
  if (!song) return;
  
  // Use sentence recording flow for each line
  sentenceQueue = song.lines.map(l => ({ it: l.it, he: l.he || '', cat: 'song' }));
  sentenceIdx = 0;
  goPage('practice');
  // Reuse Practice's sentence rendering
  Practice._singAlong = true;
  Practice.renderSentence();
}

// ═══════════════════════════════════════
// STORIES (interactive reading)
// ═══════════════════════════════════════
function renderStories(area) {
  const stories = APP_DATA.stories || [];
  
  if (stories.length === 0) {
    area.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📖</div>
        <div class="empty-text">סיפורים בקרוב!</div>
        <div class="empty-sub">סיפורים אינטראקטיביים עם שאלות הבנה</div>
      </div>
    `;
    return;
  }
  
  area.innerHTML = `
    <div style="margin-bottom:8px;font-size:.75rem;color:var(--text3);text-align:center">
      📖 סיפורים — קרא, הקשב, ענה על שאלות
    </div>
    ${stories.map((s, i) => `
      <div class="story-card" onclick="Content.openStory(${i})">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:2rem">${s.emoji || '📖'}</span>
          <div>
            <div style="font-weight:700;font-family:var(--font-it)">${s.title}</div>
            <div style="font-size:.8rem;color:var(--text2)">${s.titleHe || ''}</div>
            <div class="story-progress">${s.level || 'A2'} • ${s.paragraphs?.length || 0} פסקאות</div>
          </div>
        </div>
      </div>
    `).join('')}
  `;
}

function openStory(idx) {
  const story = APP_DATA.stories[idx];
  if (!story) return;
  
  const area = document.getElementById('exploreContent');
  let html = `
    <button class="back-btn" onclick="Content.switchTab('stories')">← חזרה</button>
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:3rem;margin-bottom:8px">${story.emoji || '📖'}</div>
      <h2 style="font-family:var(--font-it);font-weight:800">${story.title}</h2>
      <div style="font-size:.85rem;color:var(--text2)">${story.titleHe || ''} • ${story.level || 'A2'}</div>
    </div>
  `;
  
  story.paragraphs.forEach((p, pi) => {
    html += `
      <div class="card" style="cursor:pointer" onclick="speak('${esc(p.it.replace(/'/g,"\\'"))}')">
        <div style="font-family:var(--font-it);font-size:.95rem;line-height:1.8">${p.it}</div>
        <div style="font-size:.85rem;color:var(--text2);margin-top:8px;line-height:1.6">${p.he}</div>
        <button class="btn btn-sm btn-secondary" style="margin-top:8px" onclick="event.stopPropagation();speak('${esc(p.it)}')">🔊</button>
      </div>
    `;
  });
  
  // Comprehension questions
  if (story.questions && story.questions.length > 0) {
    html += `<h3 class="section-title"><span class="emoji">🧠</span> שאלות הבנה</h3>`;
    story.questions.forEach((q, qi) => {
      html += `
        <div class="card" id="storyQ${qi}">
          <div style="font-weight:700;margin-bottom:8px">${q.q}</div>
          ${q.options.map(o => `
            <div class="quiz-option" onclick="Content.answerStory(this,${qi},'${esc(o)}','${esc(q.a)}')">${o}</div>
          `).join('')}
        </div>
      `;
    });
  }
  
  // Story vocabulary
  if (story.vocab && story.vocab.length > 0) {
    html += `<h3 class="section-title"><span class="emoji">📚</span> אוצר מילים</h3>`;
    story.vocab.forEach(v => {
      html += `
        <div class="word-item" onclick="speak('${esc(v.it)}')">
          <div class="word-left">
            <div class="word-it">${v.it}</div>
            <div class="word-he">${v.he}</div>
          </div>
          <div class="word-right">
            <button class="speak-btn" onclick="event.stopPropagation();speak('${esc(v.it)}')">🔊</button>
          </div>
        </div>
      `;
    });
  }
  
  area.innerHTML = html;
}

function answerStory(el, qIdx, chosen, correct) {
  const isCorrect = chosen === correct;
  el.parentElement.querySelectorAll('.quiz-option').forEach(o => {
    o.classList.add('disabled');
    if (o.textContent === correct) o.classList.add('reveal');
  });
  if (isCorrect) {
    el.classList.add('correct');
    addXP(10);
  } else {
    el.classList.add('wrong');
  }
}

// ═══════════════════════════════════════
// CULTURE
// ═══════════════════════════════════════
function renderCulture(area) {
  const culture = APP_DATA.culture || [];
  
  area.innerHTML = `
    <div style="margin-bottom:8px;font-size:.75rem;color:var(--text3);text-align:center">
      🏛️ תרבות איטלקית — לדעת את הארץ זה לדבר את השפה
    </div>
    ${culture.map(c => `
      <div class="card">
        <div class="card-title">${c.icon} ${c.title}</div>
        <div class="card-desc">${c.desc}</div>
        ${c.region ? `<div style="font-size:.7rem;color:var(--indigo-light);margin-top:4px">📍 ${c.region}</div>` : ''}
        ${c.funFact ? `<div style="margin-top:8px;padding:8px;background:var(--surface2);border-radius:6px;font-size:.8rem;color:var(--emerald-light)">💡 ${c.funFact}</div>` : ''}
        ${c.phrase ? `
          <div style="margin-top:8px;padding:8px;background:rgba(99,102,241,.1);border-radius:6px;cursor:pointer" onclick="speak('${esc(c.phrase.it)}')">
            <div style="font-family:var(--font-it);font-weight:600">"${c.phrase.it}"</div>
            <div style="font-size:.8rem;color:var(--text3)">${c.phrase.he}</div>
          </div>
        ` : ''}
      </div>
    `).join('')}
  `;
}

// ── HELPER ──
function esc(s) {
  return String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');
}

// ── EXPOSE ──
return { render, switchTab, refreshNews, openSong, playSongFull, singAlong, openStory, answerStory };

})();
