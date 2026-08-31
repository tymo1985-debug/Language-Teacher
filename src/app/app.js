import { startRouter } from "./router.js";
import { getState, setState, subscribe, updateSettings } from "./state.js";
import { openDatabase, getSetting, setSetting } from "../storage/db.js";
import { renderHeader } from "../ui/components/app-header.js";
import { renderBottomNav } from "../ui/components/bottom-nav.js";
import { renderToday } from "../ui/screens/today.js";
import { renderPractice } from "../ui/screens/practice.js";
import { renderWords } from "../ui/screens/words.js";
import { renderProgress } from "../ui/screens/progress.js";
import { renderSettings } from "../ui/screens/settings.js";

const app = document.querySelector("#app");

const screens = {
  today: renderToday,
  practice: renderPractice,
  words: renderWords,
  progress: renderProgress,
  settings: renderSettings
};

function render(state) {
  const screen = screens[state.route] ?? renderToday;

  app.innerHTML = `
    ${renderHeader(state)}
    <main class="app-main" id="main-content">
      ${screen(state)}
    </main>
    ${renderBottomNav(state.route)}
  `;

  bindUi();
}

function bindUi() {
  document.querySelectorAll("[data-route]").forEach((element) => {
    element.addEventListener("click", () => {
      const route = element.dataset.route;
      window.location.hash = `#/${route}`;
    });
  });

  const languageSelect = document.querySelector("#interface-language");
  if (languageSelect) {
    languageSelect.addEventListener("change", async (event) => {
      const interfaceLanguage = event.target.value;
      updateSettings({ interfaceLanguage });
      await setSetting("interfaceLanguage", interfaceLanguage);
    });
  }

  const reduceMotion = document.querySelector("#reduce-motion");
  if (reduceMotion) {
    reduceMotion.addEventListener("change", async (event) => {
      const value = event.target.checked;
      updateSettings({ reduceMotion: value });
      document.documentElement.dataset.reduceMotion = value ? "true" : "false";
      await setSetting("reduceMotion", value);
    });
  }
}

async function bootstrapStorage() {
  try {
    await openDatabase();
    const interfaceLanguage = await getSetting("interfaceLanguage");
    const reduceMotion = await getSetting("reduceMotion");

    const settings = {
      ...getState().settings,
      ...(interfaceLanguage ? { interfaceLanguage } : {}),
      ...(typeof reduceMotion === "boolean" ? { reduceMotion } : {})
    };

    document.documentElement.dataset.reduceMotion = settings.reduceMotion ? "true" : "false";
    setState({ settings, storageReady: true });
  } catch (error) {
    console.error("IndexedDB initialization failed:", error);
    setState({ storageReady: false });
  }
}

function bindConnectivity() {
  window.addEventListener("online", () => setState({ online: true }));
  window.addEventListener("offline", () => setState({ online: false }));
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("./sw.js");
  } catch (error) {
    console.error("Service worker registration failed:", error);
  }
}

subscribe(render);
render(getState());

startRouter((route) => setState({ route }));
bindConnectivity();
bootstrapStorage();
registerServiceWorker();
