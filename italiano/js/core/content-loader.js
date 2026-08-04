/**
 * VolaLingo Content Loader
 * Loads JSON content files and reconstructs window.APP_DATA for backward compatibility
 */

const ContentLoader = (() => {
  const CONTENT_FILES = [
    'words',
    'sentences',
    'phrases',
    'dialogues',
    'stories',
    'songs',
    'skill-tree',
    'levels',
    'characters',
    'culture',
    'grammar',
    'achievements',
    'exams',
    'news'
  ];

  const KEY_MAP = {
    'words': 'words',
    'sentences': 'sentences',
    'phrases': 'conversationPhrases',
    'dialogues': 'dialogues',
    'stories': 'stories',
    'songs': 'songs',
    'skill-tree': 'skillTree',
    'levels': 'levels',
    'characters': 'characters',
    'culture': 'culture',
    'grammar': 'grammarTips',
    'achievements': 'achievements',
    'exams': 'cilsExams',
    'news': 'newsItems'
  };

  let loadPromise = null;

  async function loadJSON(filename) {
    const response = await fetch(`content/${filename}.json`, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}.json: ${response.status}`);
    }
    return response.json();
  }

  async function init() {
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
      console.log('[ContentLoader] Starting content load...');
      const startTime = performance.now();

      const appData = {};

      try {
        // Load all content files in parallel
        const results = await Promise.all(
          CONTENT_FILES.map(async (file) => {
            const data = await loadJSON(file);
            return { file, data };
          })
        );

        // Rebuild APP_DATA with original keys
        for (const { file, data } of results) {
          const originalKey = KEY_MAP[file];
          if (originalKey) {
            appData[originalKey] = data;
          }
        }

        // Assign to window for backward compatibility
        window.APP_DATA = appData;

        const elapsed = performance.now() - startTime;
        console.log(`[ContentLoader] Content loaded in ${elapsed.toFixed(2)}ms`);
        console.log('[ContentLoader] APP_DATA keys:', Object.keys(appData));

        // Dispatch event for modules that need to wait
        window.dispatchEvent(new CustomEvent('content-ready', { detail: appData }));

        return appData;
      } catch (error) {
        console.error('[ContentLoader] Failed to load content:', error);
        throw error;
      }
    })();

    return loadPromise;
  }

  // Sync version for modules that need immediate access (will be empty until init resolves)
  function getData() {
    return window.APP_DATA || {};
  }

  // Check if content is ready
  function isReady() {
    return window.APP_DATA && Object.keys(window.APP_DATA).length > 0;
  }

  // Wait for content-ready event
  function onReady(callback) {
    if (isReady()) {
      callback(window.APP_DATA);
    } else {
      window.addEventListener('content-ready', (e) => callback(e.detail), { once: true });
    }
  }

  return { init, getData, isReady, onReady };
})();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContentLoader;
}