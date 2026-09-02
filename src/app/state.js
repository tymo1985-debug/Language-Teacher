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
    learningItems:0,mistakes:0,sessions:0,situations:0,
    reviews:0,dueReviews:0,progress:null
  },
  reviewQueue:[],
  reviewAnswerVisible:false,
  todaySession:null,
  sessionAdvancing:false,
  sessionHistory:[],
  updateNotice:null,
  speech:{
    capabilities:{recording:false,playback:false,synthesis:false,recognition:false},
    recording:false,recordingUrl:null,recordingDurationMs:0,
    referenceText:"",transcript:"",error:null
  },
  ai:{
    providerId:"local-demo",
    providerLabel:"Local architecture demo",
    remote:false,input:"",loading:false,response:null,error:null,providers:[]
  },
  conversation:{
    session:null,input:"",loading:false,error:null,lastCompleted:null
  },
  realLife:{
    input:"",loading:false,result:null,saved:null,error:null
  },
  operation:{
    message:null,
    kind:"info"
  },
  releaseCheck:null
};

export const getState=()=>structuredClone(state);

function notify(){
  listeners.forEach(fn=>fn(getState()));
}

function isManualDraftInput(fieldId){
  return typeof document!=="undefined"&&document.activeElement?.id===fieldId;
}

export function setState(patch){
  Object.assign(state,patch);
  notify();
}

export function updateSettings(patch){
  state.settings={...state.settings,...patch};
  notify();
}

export function updateSpeech(patch){
  state.speech={...state.speech,...patch};
  if(Object.hasOwn(patch,"referenceText")&&isManualDraftInput("speech-reference-text"))return;
  notify();
}

export function updateAI(patch){
  state.ai={...state.ai,...patch};
  if(Object.hasOwn(patch,"input")&&isManualDraftInput("teacher-input"))return;
  notify();
}

export function updateConversation(patch){
  state.conversation={...state.conversation,...patch};
  if(Object.hasOwn(patch,"input")&&isManualDraftInput("conversation-input"))return;
  notify();
}

export function updateRealLife(patch){
  state.realLife={...state.realLife,...patch};
  if(Object.hasOwn(patch,"input")&&isManualDraftInput("real-life-input"))return;
  notify();
}

export function updateOperation(message,kind="info"){
  state.operation={message,kind};
  notify();
}

export function subscribe(fn){
  listeners.add(fn);
  return()=>listeners.delete(fn);
}
