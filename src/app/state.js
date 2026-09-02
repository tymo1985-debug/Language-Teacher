const listeners=new Set();
const state={
  route:"today",
  online:navigator.onLine,
  settings:{interfaceLanguage:"ru",reduceMotion:false},
  storageReady:false,
  user:null,
  languageProfiles:[],
  activeLanguageId:null,
  onboardingOpen:false,
  learningSummary:{
    learningItems:0,
    mistakes:0,
    sessions:0,
    situations:0,
    reviews:0,
    dueReviews:0,
    progress:null
  },
  reviewQueue:[],
  reviewAnswerVisible:false,
  todaySession:null,
  sessionHistory:[],
  updateNotice:null,
  updateRegistration:null
};

export const getState=()=>structuredClone(state);

export function setState(patch){
  Object.assign(state,patch);
  listeners.forEach(fn=>fn(getState()));
}

export function updateSettings(patch){
  state.settings={...state.settings,...patch};
  listeners.forEach(fn=>fn(getState()));
}

export function subscribe(fn){
  listeners.add(fn);
  return()=>listeners.delete(fn);
}
