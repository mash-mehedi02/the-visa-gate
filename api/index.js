if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

const appModule = require('../apps/api/dist/app');
const app = appModule.default || appModule;
const { store } = require('../apps/api/dist/data/store');

let ready = false;
let initPromise = null;

async function ensureInitialized() {
  if (ready) return;
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await store.ensureReady();
        ready = true;
      } catch (err) {
        console.error('[Vercel API] Store initialization warning:', err);
        initPromise = null;
      }
    })();
  }
  return initPromise;
}

module.exports = async (req, res) => {
  await ensureInitialized();
  return app(req, res);
};
