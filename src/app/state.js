const listeners = new Set();

const state = {
  route: "today",
  online: navigator.onLine,
  settings: {
    interfaceLanguage: "ru",
    reduceMotion: false
  },
  storageReady: false
};

export function getState() {
  return structuredClone(state);
}

export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach((listener) => listener(getState()));
}

export function updateSettings(patch) {
  state.settings = { ...state.settings, ...patch };
  listeners.forEach((listener) => listener(getState()));
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
