/**
 * SANKALP AI - Offline Storage Engine (IndexedDB)
 * 1. Stores full conversational history segregated per subject.
 * 2. Stores BYOK AI API credentials (Groq Key, Model) securely in IndexedDB
 *    with localStorage fallback so students never lose their API connection.
 */

const DB_NAME = 'SankalpMentorDB';
const DB_VERSION = 3;
const STORE_NAME = 'subject_chats';
const SETTINGS_STORE_NAME = 'app_settings';
const CACHE_STORE_NAME = 'response_cache';

function isIndexedDBAvailable() {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

/**
 * Open or initialize the IndexedDB connection
 */
export function openDB() {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Subject chat store
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'subject_id' });
        store.createIndex('updated_at', 'updated_at', { unique: false });
        store.createIndex('subject_code', 'subject_code', { unique: false });
      }

      // Settings and API credentials store
      if (!db.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
        db.createObjectStore(SETTINGS_STORE_NAME, { keyPath: 'key' });
      }

      // AI Response cache store for instant zero-token responses
      if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
        const cacheStore = db.createObjectStore(CACHE_STORE_NAME, { keyPath: 'cache_key' });
        cacheStore.createIndex('subject_id', 'subject_id', { unique: false });
        cacheStore.createIndex('created_at', 'created_at', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieve chat history for a specific subject
 * @param {string} subjectId
 * @returns {Promise<Array|null>} Array of messages or null
 */
export async function getSubjectChat(subjectId) {
  if (!subjectId) return null;

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(String(subjectId));

      req.onsuccess = () => {
        const record = req.result;
        resolve(record ? record.messages : null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB read failed, falling back to localStorage:', err);
    try {
      const saved = localStorage.getItem(`sankalp_chat_${subjectId}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }
}

/**
 * Save chat messages for a specific subject
 * @param {string} subjectId
 * @param {Object} subjectInfo { name, code, course_id, semester_id }
 * @param {Array} messages
 */
export async function saveSubjectChat(subjectId, subjectInfo, messages) {
  if (!subjectId || !Array.isArray(messages)) return;

  const record = {
    subject_id: String(subjectId),
    subject_name: subjectInfo?.name || 'General Subject',
    subject_code: subjectInfo?.code || 'N/A',
    course_id: subjectInfo?.course_id || null,
    semester_id: subjectInfo?.semester_id || null,
    messages,
    message_count: messages.length,
    updated_at: new Date().toISOString(),
  };

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB write failed, falling back to localStorage:', err);
    try {
      localStorage.setItem(`sankalp_chat_${subjectId}`, JSON.stringify(messages));
    } catch (e) {
      console.error('LocalStorage write failed:', e);
    }
  }
}

/**
 * Clear/Delete chat history for a specific subject
 * @param {string} subjectId
 */
export async function clearSubjectChat(subjectId) {
  if (!subjectId) return;

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(String(subjectId));

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete failed, clearing localStorage:', err);
    try {
      localStorage.removeItem(`sankalp_chat_${subjectId}`);
    } catch {}
  }
}

/**
 * Get summaries of all subjects that have chats stored in IndexedDB
 * @returns {Promise<Array>} Array of { subject_id, subject_name, subject_code, message_count, updated_at }
 */
export async function getAllSubjectChats() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const records = req.result || [];
        resolve(
          records.map((r) => ({
            subject_id: r.subject_id,
            subject_name: r.subject_name,
            subject_code: r.subject_code,
            message_count: r.message_count || r.messages?.length || 0,
            updated_at: r.updated_at,
          }))
        );
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to get all subject chats from IndexedDB:', err);
    return [];
  }
}

/**
 * Export chat transcript to Markdown file for student revision
 * @param {string} subjectName
 * @param {string} subjectCode
 * @param {Array} messages
 */
export function exportChatToMarkdown(subjectName, subjectCode, messages) {
  if (!messages || messages.length === 0) return;

  let md = `# SANKALP AI — Examination Mentorship Transcript\n`;
  md += `**Subject:** ${subjectName || 'General'} (${subjectCode || 'N/A'})\n`;
  md += `**Date:** ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
  md += `**Total Messages:** ${messages.length}\n\n`;
  md += `---\n\n`;

  messages.forEach((msg, idx) => {
    const role = msg.role === 'user' ? 'Student' : 'SANKALP AI Mentor';
    const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '';
    md += `### ${role} ${time ? `(${time})` : ''}\n\n`;
    md += `${msg.content}\n\n`;
    md += `---\n\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (subjectCode || subjectName || 'Subject').replace(/[^a-zA-Z0-9_\-]/g, '_');
  a.href = url;
  a.download = `Sankalp_Mentor_Chat_${safeName}_${new Date().toISOString().split('T')[0]}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==========================================
// IndexedDB Settings & AI API Key Management
// ==========================================

function getLocalStorageFallback(key) {
  try {
    const raw = localStorage.getItem(`sankalp_setting_${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Retrieve a setting from IndexedDB (with localStorage fallback)
 * @param {string} key
 * @returns {Promise<any>}
 */
export async function getSetting(key) {
  if (!key) return null;

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      try {
        if (!db.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
          resolve(getLocalStorageFallback(key));
          return;
        }
        const tx = db.transaction(SETTINGS_STORE_NAME, 'readonly');
        const store = tx.objectStore(SETTINGS_STORE_NAME);
        const req = store.get(String(key));

        req.onsuccess = () => {
          if (req.result && req.result.value !== undefined) {
            resolve(req.result.value);
          } else {
            resolve(getLocalStorageFallback(key));
          }
        };
        req.onerror = () => resolve(getLocalStorageFallback(key));
      } catch {
        resolve(getLocalStorageFallback(key));
      }
    });
  } catch {
    return getLocalStorageFallback(key);
  }
}

/**
 * Save a setting to IndexedDB (and sync to localStorage as resilient fallback)
 * @param {string} key
 * @param {any} value
 * @returns {Promise<boolean>}
 */
export async function saveSetting(key, value) {
  if (!key) return false;

  // Mirror to localStorage for instant synchronous recovery
  try {
    localStorage.setItem(`sankalp_setting_${key}`, JSON.stringify(value));
  } catch {}

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      try {
        if (!db.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
          resolve(true);
          return;
        }
        const tx = db.transaction(SETTINGS_STORE_NAME, 'readwrite');
        const store = tx.objectStore(SETTINGS_STORE_NAME);
        const req = store.put({
          key: String(key),
          value,
          updated_at: new Date().toISOString(),
        });
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(true);
      } catch {
        resolve(true);
      }
    });
  } catch {
    return true;
  }
}

/**
 * Remove a setting from IndexedDB and localStorage
 * @param {string} key
 * @returns {Promise<boolean>}
 */
export async function removeSetting(key) {
  if (!key) return false;

  try {
    localStorage.removeItem(`sankalp_setting_${key}`);
  } catch {}

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      try {
        if (!db.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
          resolve(true);
          return;
        }
        const tx = db.transaction(SETTINGS_STORE_NAME, 'readwrite');
        const store = tx.objectStore(SETTINGS_STORE_NAME);
        const req = store.delete(String(key));
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(true);
      } catch {
        resolve(true);
      }
    });
  } catch {
    return true;
  }
}

// Convenience helpers for AI API Key & Model
export const saveAiApiKey = (key) => saveSetting('groq_api_key', key);
export const getAiApiKey = () => getSetting('groq_api_key');
export const removeAiApiKey = () => removeSetting('groq_api_key');

export const saveAiModel = (model) => saveSetting('groq_model', model);
export const getAiModel = () => getSetting('groq_model');
export const removeAiModel = () => removeSetting('groq_model');

// ==========================================
// AI Response Local Caching (IndexedDB)
// ==========================================

/**
 * Build a deterministic, normalized cache key for any AI request
 */
export function buildResponseCacheKey({
  subjectId = 'general',
  prompt = '',
  marksFormat = 10,
  answerStyle = 'exam',
  language = 'english',
  learnByBook = false,
  bookId = null,
  unitNumber = null,
}) {
  const normPrompt = (prompt || '').trim().toLowerCase().replace(/\s+/g, ' ');
  return [
    subjectId || 'general',
    unitNumber !== null ? `u${unitNumber}` : 'all-units',
    marksFormat ? `${marksFormat}m` : 'def-m',
    answerStyle || 'exam',
    language || 'english',
    learnByBook ? (bookId || 'book') : 'standard',
    normPrompt,
  ].join(':::');
}

/**
 * Retrieve a cached AI response from IndexedDB (0ms, 0 tokens)
 * @param {string} cacheKey
 * @returns {Promise<any|null>}
 */
export async function getCachedResponse(cacheKey) {
  if (!cacheKey) return null;
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      try {
        if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
          return resolve(null);
        }
        const tx = db.transaction(CACHE_STORE_NAME, 'readonly');
        const store = tx.objectStore(CACHE_STORE_NAME);
        const req = store.get(String(cacheKey));
        req.onsuccess = () => {
          if (req.result && req.result.data) {
            resolve(req.result.data);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  } catch {
    return null;
  }
}

/**
 * Save an AI response into IndexedDB cache
 * @param {string} cacheKey
 * @param {any} responseData
 * @param {string} subjectId
 * @returns {Promise<boolean>}
 */
export async function saveCachedResponse(cacheKey, responseData, subjectId = 'general') {
  if (!cacheKey || !responseData) return false;
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      try {
        if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
          return resolve(false);
        }
        const tx = db.transaction(CACHE_STORE_NAME, 'readwrite');
        const store = tx.objectStore(CACHE_STORE_NAME);
        const req = store.put({
          cache_key: String(cacheKey),
          subject_id: String(subjectId),
          data: responseData,
          created_at: new Date().toISOString(),
        });
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  } catch {
    return false;
  }
}

/**
 * Retrieve all cached entries for a given subject (or all cached entries if subjectId is null)
 * @param {string|null} subjectId
 * @returns {Promise<Array>}
 */
export async function getSubjectCachedEntries(subjectId = null) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      try {
        if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) return resolve([]);
        const tx = db.transaction(CACHE_STORE_NAME, 'readonly');
        const store = tx.objectStore(CACHE_STORE_NAME);

        if (subjectId) {
          const index = store.index('subject_id');
          const req = index.getAll(String(subjectId));
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        } else {
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        }
      } catch {
        resolve([]);
      }
    });
  } catch {
    return [];
  }
}

/**
 * Clear cached responses (all or for a specific subject)
 * @param {string|null} subjectId
 * @returns {Promise<boolean>}
 */
export async function clearResponseCache(subjectId = null) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      try {
        if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) return resolve(true);
        const tx = db.transaction(CACHE_STORE_NAME, 'readwrite');
        const store = tx.objectStore(CACHE_STORE_NAME);

        if (subjectId) {
          const index = store.index('subject_id');
          const req = index.openCursor(IDBKeyRange.only(String(subjectId)));
          req.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
              cursor.delete();
              cursor.continue();
            } else {
              resolve(true);
            }
          };
          req.onerror = () => resolve(false);
        } else {
          const req = store.clear();
          req.onsuccess = () => resolve(true);
          req.onerror = () => resolve(false);
        }
      } catch {
        resolve(false);
      }
    });
  } catch {
    return false;
  }
}


