import {t,getLocale} from "../i18n/i18n.js";
import {startRouter} from "./router.js";
import {
  getState,setState,subscribe,updateSettings,updateSpeech,updateAI,
  updateConversation,updateRealLife,updateOperation
} from "./state.js";
import {ensureLocalUser,getRecord,getSetting,openDatabase,putRecord,setSetting} from "../storage/db.js";
import {DEFAULT_USER_ID,STORES} from "../storage/schema.js";
import {createLanguageProfile,listLanguageProfiles,removeLanguageProfile} from "../language/profile-engine.js";
import {SELF_ASSESSMENT} from "../language/language-catalog.js";
import {ensureProgress,getLearningSummary,listSessions} from "../learning/learning-repository.js";
import {buildReviewQueue,recordReview} from "../learning/review-engine.js";
import {advanceSession,ensureTodaySession} from "../learning/session-engine.js";
import {
  continueConversation,finishConversation,getActiveConversation,startConversation
} from "../learning/conversation-engine.js";
import {prepareRealLifeHelp,saveRealLifeMaterial} from "../learning/real-life-engine.js";
import {downloadBackup} from "../storage/backup.js";
import {readBackupFile,restoreBackup} from "../storage/restore.js";
import {runReleaseCheck} from "./release-check.js";
import {
  applyWaitingUpdate,checkRemoteUpdate,getReleaseNotice,hasWaitingUpdate,
  markCurrentVersionSeen,watchServiceWorker
} from "./update-manager.js";
import {
  cancelVoiceRecording,clearVoiceRecording,getSpeechCapabilities,recognizeOnce,
  speakReference,startVoiceRecording,stopReferenceSpeech,stopVoiceRecording
} from "../speech/speech-manager.js";
import {
  getActiveAIProvider,listAIProviders,requestTeacherResponse,setAIProvider
} from "../ai/teacher-engine.js";
import {renderHeader} from "../ui/components/app-header.js";
import {renderBottomNav} from "../ui/components/bottom-nav.js";
import {renderLanguageOnboarding} from "../ui/components/language-onboarding.js";
import {renderUpdateNotice} from "../ui/components/update-notice.js";
import {renderOperationNotice} from "../ui/components/operation-notice.js";
import {renderToday} from "../ui/screens/today.js";
import {renderPractice} from "../ui/screens/practice.js";
import {renderSession} from "../ui/screens/session.js";
import {renderSpeech} from "../ui/screens/speech.js";
import {renderTeacher} from "../ui/screens/teacher.js";
import {renderConversation} from "../ui/screens/conversation.js";
import {renderRealLife} from "../ui/screens/real-life.js";
import {renderReview} from "../ui/screens/review.js";
import {renderWords} from "../ui/screens/words.js";
import {renderProgress} from "../ui/screens/progress.js";
import {renderSettings} from "../ui/screens/settings.js";

const app=document.querySelector("#app");
const screens={
  today:renderToday,practice:renderPractice,session:renderSession,speech:renderSpeech,
  teacher:renderTeacher,conversation:renderConversation,"real-life":renderRealLife,
  review:renderReview,words:renderWords,progress:renderProgress,settings:renderSettings
};

function render(state){
  const focused=document.activeElement;
  const focusId=focused?.id;
  const selection=typeof focused?.selectionStart==="number"?[focused.selectionStart,focused.selectionEnd]:null;
  const screen=screens[state.route]??renderToday;
  app.innerHTML=`
    ${renderHeader(state)}
    <main class="app-main" id="main-content" tabindex="-1">${screen(state)}</main>
    ${renderBottomNav(state.route)}
    ${renderLanguageOnboarding(state)}
    ${renderUpdateNotice(state)}
    ${renderOperationNotice(state)}
  `;
  bind();
  const nextFocus=focusId?document.getElementById(focusId):null;
  if(nextFocus){
    nextFocus.focus({preventScroll:true});
    if(selection&&nextFocus.setSelectionRange)nextFocus.setSelectionRange(...selection);
  }

  if(state.route==="conversation"){
    requestAnimationFrame(()=>{
      const stream=document.querySelector("#conversation-stream");
      if(stream)stream.scrollTop=stream.scrollHeight;
    });
  }
}

const openModal=()=>setState({onboardingOpen:true});
const closeModal=()=>setState({onboardingOpen:false});

async function refreshSessionData(languageId=getState().activeLanguageId){
  if(!languageId){setState({todaySession:null,sessionHistory:[]});return;}
  const profile=getState().languageProfiles.find(p=>p.languageId===languageId);
  if(!profile)return;

  const todaySession=await ensureTodaySession(profile,10);
  const sessionHistory=(await listSessions(languageId))
    .filter(session=>session.status==="completed")
    .sort((a,b)=>(b.completedAt??"").localeCompare(a.completedAt??""))
    .slice(0,10);

  if(getState().activeLanguageId===languageId)setState({todaySession,sessionHistory});
}

async function refreshConversation(languageId=getState().activeLanguageId){
  if(!languageId){
    updateConversation({session:null,input:"",error:null,loading:false,lastCompleted:null});
    return;
  }
  const session=await getActiveConversation(languageId);
  if(getState().activeLanguageId===languageId)updateConversation({session,input:"",error:null,loading:false});
}

async function refreshReviewQueue(languageId=getState().activeLanguageId){
  const reviewQueue=languageId?await buildReviewQueue(languageId):[];
  if(getState().activeLanguageId===languageId)setState({reviewQueue,reviewAnswerVisible:false});
}

async function refreshLearningData(languageId=getState().activeLanguageId){
  if(!languageId){
    setState({
      learningSummary:{learningItems:0,mistakes:0,sessions:0,situations:0,reviews:0,dueReviews:0,progress:null},
      reviewQueue:[],reviewAnswerVisible:false,todaySession:null,sessionHistory:[]
    });
    updateConversation({session:null,input:""});
    return;
  }

  const profile=getState().languageProfiles.find(p=>p.languageId===languageId);
  await ensureProgress(languageId,profile?.skills??{});

  const [learningSummary,reviewQueue]=await Promise.all([
    getLearningSummary(languageId),
    buildReviewQueue(languageId)
  ]);

  if(getState().activeLanguageId!==languageId)return;
  setState({learningSummary,reviewQueue,reviewAnswerVisible:false});
  await Promise.all([refreshSessionData(languageId),refreshConversation(languageId)]);
}

async function setActiveLanguage(languageId){
  const user=await getRecord(STORES.users,DEFAULT_USER_ID);
  if(!user)return;

  const next={...user,activeLanguageId:languageId,updatedAt:new Date().toISOString()};
  await putRecord(STORES.users,next);
  setState({user:next,activeLanguageId:languageId});

  handleVoiceClear();
  stopReferenceSpeech();
  updateSpeech({referenceText:"",transcript:""});
  updateAI({input:"",response:null,error:null,loading:false});
  updateConversation({session:null,input:"",error:null,loading:false,lastCompleted:null});
  updateRealLife({input:"",result:null,saved:null,error:null,loading:false,saving:false});
  await refreshLearningData(languageId);
}

async function refreshProfiles(preferred=null){
  const profiles=await listLanguageProfiles();
  let active=preferred||getState().activeLanguageId;
  if(!profiles.some(p=>p.languageId===active))active=profiles[0]?.languageId??null;

  setState({languageProfiles:profiles,activeLanguageId:active});

  if(active)await setActiveLanguage(active);
  else{
    const user=await getRecord(STORES.users,DEFAULT_USER_ID);
    if(user?.activeLanguageId){
      const next={...user,activeLanguageId:null,updatedAt:new Date().toISOString()};
      await putRecord(STORES.users,next);
      setState({user:next,activeLanguageId:null});
    }
    await refreshLearningData(null);
  }
}

function dismissUpdateNotice(){
  const notice=getState().updateNotice;
  setState({updateNotice:null});
  if(notice?.kind==="installed"){
    markCurrentVersionSeen().catch(error=>console.debug("Could not persist seen version:",error));
  }
}

function activeSpeechLang(){
  const id=getState().activeLanguageId;
  return ({
    cs:"cs-CZ",en:"en-US",de:"de-DE",pl:"pl-PL",uk:"uk-UA",
    sk:"sk-SK",es:"es-ES",fr:"fr-FR",it:"it-IT"
  })[id]??id??"";
}

async function handleVoiceStart(){
  try{
    clearVoiceRecording();
    updateSpeech({recording:true,recordingUrl:null,recordingDurationMs:0,transcript:"",error:null});
    await startVoiceRecording();
  }catch(error){
    updateSpeech({recording:false,error:error?.message??"Не удалось начать запись."});
  }
}

async function handleVoiceStop(){
  try{
    const result=await stopVoiceRecording();
    updateSpeech({
      recording:false,
      recordingUrl:result?.url??null,
      recordingDurationMs:result?.durationMs??0,
      error:null
    });
  }catch(error){
    updateSpeech({recording:false,error:error?.message??"Не удалось сохранить запись."});
  }
}

function handleVoiceClear(){
  cancelVoiceRecording();
  clearVoiceRecording();
  updateSpeech({
    recording:false,
    recordingUrl:null,
    recordingDurationMs:0,
    transcript:"",
    error:null
  });
}

async function sendConversation(){
  const state=getState();
  const profile=state.languageProfiles.find(p=>p.languageId===state.activeLanguageId);
  const conversation=state.conversation.session;
  const input=state.conversation.input.trim();
  if(!profile||!conversation||!input||state.conversation.loading)return;

  try{
    updateConversation({loading:true,error:null});
    const result=await continueConversation({
      conversation,
      languageProfile:profile,
      userText:input
    });

    if(getState().activeLanguageId!==profile.languageId)return;
    updateConversation({
      session:result.conversation,input:"",loading:false,error:null
    });

    await refreshLearningData(profile.languageId);

    if(getState().activeLanguageId!==profile.languageId)return;
    updateConversation({
      session:result.conversation,input:"",loading:false,error:null
    });
  }catch(error){
    if(getState().activeLanguageId===profile.languageId)updateConversation({loading:false,error:error?.message??"Не удалось продолжить разговор."});
  }
}

async function generateRealLife(){
  const state=getState();
  const profile=state.languageProfiles.find(p=>p.languageId===state.activeLanguageId);
  if(!profile||state.realLife.loading)return;

  try{
    updateRealLife({loading:true,result:null,saved:null,error:null});
    const result=await prepareRealLifeHelp({
      languageProfile:profile,
      description:state.realLife.input
    });
    if(getState().activeLanguageId===profile.languageId)updateRealLife({loading:false,result,saved:null,error:null});
  }catch(error){
    if(getState().activeLanguageId===profile.languageId)updateRealLife({loading:false,error:error?.message??"Не удалось подготовить фразу."});
  }
}

function bind(){
  document.querySelectorAll("[data-route]").forEach(el=>{
    el.onclick=async()=>{
      const route=el.dataset.route;
      location.hash=`#/${route}`;
    };
  });

  ["add-language-top","add-language-hero","add-language-inline","add-language-settings"].forEach(id=>{
    const el=document.querySelector("#"+id);
    if(el)el.onclick=openModal;
  });

  const switcher=document.querySelector("#language-switcher");
  if(switcher)switcher.onclick=()=>{
    const ps=getState().languageProfiles;
    if(ps.length<=1)return openModal();
    const i=ps.findIndex(p=>p.languageId===getState().activeLanguageId);
    setActiveLanguage(ps[(i+1)%ps.length].languageId);
  };

  document.querySelectorAll("[data-language-select]").forEach(el=>
    el.onclick=()=>setActiveLanguage(el.dataset.languageSelect)
  );

  document.querySelectorAll("[data-language-remove]").forEach(el=>{
    el.onclick=async()=>{
      const id=el.dataset.languageRemove;
      const p=getState().languageProfiles.find(x=>x.languageId===id);
      if(confirm(t("remove_profile_confirm",{name:p?.name??id}))){
        await removeLanguageProfile(id);
        await refreshProfiles();
      }
    };
  });

  const close=document.querySelector("#close-language-modal");
  const cancel=document.querySelector("#cancel-language-modal");
  if(close)close.onclick=closeModal;
  if(cancel)cancel.onclick=closeModal;

  const modal=document.querySelector("#language-modal");
  if(modal)modal.onclick=e=>{
    if(e.target.id==="language-modal")closeModal();
  };

  const form=document.querySelector("#language-form");
  if(form)form.onsubmit=async e=>{
    e.preventDefault();
    const fd=new FormData(form);
    const languageId=String(fd.get("languageId")||"");
    if(!languageId)return;

    const goals=fd.getAll("goals").map(String);
    const assessmentId=String(fd.get("assessment")||"starter");
    const sa=SELF_ASSESSMENT.find(x=>x.id===assessmentId)??SELF_ASSESSMENT[0];
    const profile=await createLanguageProfile({languageId,goals,selfAssessment:sa});
    await ensureProgress(languageId,profile.skills);
    closeModal();
    await refreshProfiles(languageId);
  };

  document.querySelectorAll("[data-conversation-scenario]").forEach(el=>{
    el.addEventListener("click",async()=>{
      const profile=getState().languageProfiles.find(p=>p.languageId===getState().activeLanguageId);
      if(!profile||getState().conversation.loading)return;

      try{
        updateConversation({loading:true,error:null});
        const session=await startConversation({
          languageProfile:profile,
          scenarioId:el.dataset.conversationScenario
        });
        if(getState().activeLanguageId!==profile.languageId)return;
        updateConversation({session,input:"",loading:false,error:null});
        await refreshLearningData(profile.languageId);
        if(getState().activeLanguageId!==profile.languageId)return;
        updateConversation({session,input:"",loading:false,error:null});
      }catch(error){
        if(getState().activeLanguageId===profile.languageId)updateConversation({loading:false,error:error?.message??"Не удалось начать разговор."});
      }
    });
  });

  const convoInput=document.querySelector("#conversation-input");
  if(convoInput){
    convoInput.addEventListener("input",e=>updateConversation({input:e.target.value}));
    convoInput.addEventListener("keydown",e=>{
      if(e.key==="Enter"&&!e.shiftKey&&!e.isComposing){
        e.preventDefault();
        sendConversation();
      }
    });
  }

  document.querySelector("#conversation-send")?.addEventListener("click",sendConversation);

  document.querySelector("#conversation-dictate")?.addEventListener("click",async()=>{
    try{
      updateConversation({error:null});
      const result=await recognizeOnce({lang:activeSpeechLang()});
      if(result.transcript)updateConversation({input:result.transcript});
      else updateConversation({error:"Речь не распознана. Можно ответить текстом."});
    }catch(error){
      updateConversation({error:error?.message??"Голосовой ввод недоступен."});
    }
  });

  document.querySelector("#conversation-finish")?.addEventListener("click",async()=>{
    const conversation=getState().conversation.session;
    if(!conversation||getState().conversation.loading)return;

    const completed=await finishConversation(conversation);
    updateConversation({
      session:null,input:"",loading:false,error:null,lastCompleted:completed
    });

    await refreshLearningData(completed.languageId);

    updateConversation({
      session:null,input:"",loading:false,error:null,lastCompleted:completed
    });
  });

  const realLifeInput=document.querySelector("#real-life-input");
  if(realLifeInput){
    realLifeInput.addEventListener("input",e=>{
      updateRealLife({input:e.target.value,result:null,saved:null,error:null});
    });
  }

  document.querySelector("#real-life-generate")?.addEventListener("click",generateRealLife);

  document.querySelector("#real-life-dictate")?.addEventListener("click",async()=>{
    try{
      updateRealLife({error:null});
      const result=await recognizeOnce({lang:({ru:"ru-RU",en:"en-US",uk:"uk-UA"})[getLocale()]});
      if(result.transcript)updateRealLife({input:result.transcript,result:null,saved:null});
      else updateRealLife({error:"Речь не распознана. Опишите ситуацию текстом."});
    }catch(error){
      updateRealLife({error:error?.message??"Голосовой ввод недоступен."});
    }
  });

  document.querySelector("#real-life-save")?.addEventListener("click",async()=>{
    const state=getState();
    const profile=state.languageProfiles.find(p=>p.languageId===state.activeLanguageId);
    if(!profile||!state.realLife.result||state.realLife.saving||state.realLife.saved)return;

    try{
      updateRealLife({saving:true,error:null});
      const saved=await saveRealLifeMaterial({
        languageProfile:profile,
        result:state.realLife.result
      });

      if(getState().activeLanguageId!==profile.languageId)return;
      updateRealLife({saved,saving:false,error:null});
      await refreshLearningData(profile.languageId);
      if(getState().activeLanguageId!==profile.languageId)return;
      updateRealLife({saved,saving:false,error:null});
    }catch(error){
      updateRealLife({saving:false,error:error?.message??"Не удалось сохранить материал."});
    }
  });

  document.querySelector("#session-next")?.addEventListener("click",async()=>{
    const current=getState();
    const session=current.todaySession;
    if(!session||current.sessionAdvancing)return;

    setState({sessionAdvancing:true});
    try{
      const updated=await advanceSession(session);
      handleVoiceClear();

      const [learningSummary,sessions]=await Promise.all([
        getLearningSummary(updated.languageId),
        listSessions(updated.languageId)
      ]);
      const sessionHistory=sessions
        .filter(item=>item.status==="completed")
        .sort((a,b)=>(b.completedAt??"").localeCompare(a.completedAt??""))
        .slice(0,10);

      if(getState().activeLanguageId!==updated.languageId){setState({sessionAdvancing:false});return;}
      setState({
        todaySession:updated,
        learningSummary,
        sessionHistory,
        sessionAdvancing:false
      });
    }catch(error){
      setState({sessionAdvancing:false});
      updateOperation(error?.message??"Не удалось сохранить прогресс занятия.","error");
    }
  });

  document.querySelector("#review-reveal")?.addEventListener("click",()=>
    setState({reviewAnswerVisible:true})
  );

  document.querySelectorAll("[data-review-rating]").forEach(el=>{
    el.onclick=async()=>{
      const state=getState(),current=state.reviewQueue?.[0];
      if(!current||state.reviewSaving)return;
      setState({reviewSaving:true});
      try{
        await recordReview({item:current.item,rating:el.dataset.reviewRating,dimension:current.exercise.dimension});
        await refreshLearningData(current.item.languageId);
      }catch(error){updateOperation(error.message,"error");}
      finally{setState({reviewSaving:false});}
    };
  });

  document.querySelector("#voice-start")?.addEventListener("click",handleVoiceStart);
  document.querySelector("#voice-stop")?.addEventListener("click",handleVoiceStop);
  document.querySelector("#voice-clear")?.addEventListener("click",handleVoiceClear);

  document.querySelectorAll("[data-speak-text]").forEach(el=>{
    el.addEventListener("click",()=>{
      try{
        speakReference(el.dataset.speakText,{lang:activeSpeechLang(),rate:.92});
      }catch(error){
        updateSpeech({error:error?.message??"Не удалось воспроизвести эталон."});
      }
    });
  });

  const referenceInput=document.querySelector("#speech-reference-text");
  if(referenceInput){
    referenceInput.addEventListener("input",e=>
      updateSpeech({referenceText:e.target.value})
    );
  }

  document.querySelector("#speech-speak")?.addEventListener("click",()=>{
    const text=document.querySelector("#speech-reference-text")?.value??"";
    if(!text)return;

    try{
      speakReference(text,{lang:activeSpeechLang(),rate:.92});
    }catch(error){
      updateSpeech({error:error?.message??"Text-to-Speech недоступен."});
    }
  });

  document.querySelector("#speech-recognize")?.addEventListener("click",async()=>{
    try{
      updateSpeech({transcript:"",error:null});
      const result=await recognizeOnce({lang:activeSpeechLang()});
      updateSpeech({transcript:result.transcript||"Ничего не распознано."});
    }catch(error){
      updateSpeech({error:error?.message??"Распознавание речи не удалось."});
    }
  });

  const teacherInput=document.querySelector("#teacher-input");
  if(teacherInput){
    teacherInput.addEventListener("input",e=>updateAI({input:e.target.value}));
  }

  document.querySelector("#teacher-generate")?.addEventListener("click",async()=>{
    const profile=getState().languageProfiles.find(p=>
      p.languageId===getState().activeLanguageId
    );
    if(!profile||getState().ai.loading)return;

    try{
      updateAI({loading:true,response:null,error:null});
      const result=await requestTeacherResponse({
        languageProfile:profile,
        mode:"practice",
        userInput:getState().ai.input
      });

      if(getState().activeLanguageId!==profile.languageId)return;
      updateAI({
        loading:false,
        response:result.response,
        providerId:result.provider.id,
        providerLabel:result.provider.label,
        remote:Boolean(result.provider.capabilities.remote),
        error:null
      });
    }catch(error){
      updateAI({loading:false,error:error?.message??"AI Teacher request failed."});
    }
  });

  document.querySelector("#backup-export")?.addEventListener("click",async()=>{
    try{
      await downloadBackup();
      updateOperation(t("backup_exported"),"success");
    }catch(error){
      updateOperation(error?.message??"Не удалось создать backup.","error");
    }
  });

  document.querySelector("#backup-import")?.addEventListener("change",async event=>{
    const file=event.target.files?.[0];
    if(!file)return;

    try{
      const parsed=await readBackupFile(file);
      const confirmed=confirm(
        t("backup_confirm")
      );
      if(!confirmed){
        event.target.value="";
        return;
      }

      await restoreBackup(parsed);
      updateOperation(t("backup_restored"),"success");
      setTimeout(()=>location.reload(),700);
    }catch(error){
      updateOperation(error?.message??"Не удалось восстановить backup.","error");
      event.target.value="";
    }
  });

  document.querySelector("#release-check-run")?.addEventListener("click",async()=>{
    try{
      setState({releaseCheck:await runReleaseCheck()});
    }catch(error){
      updateOperation(error?.message??"Release Check завершился ошибкой.","error");
    }
  });

  document.querySelector("#operation-dismiss")?.addEventListener("click",()=>{
    updateOperation(null);
  });

  const il=document.querySelector("#interface-language");
  if(il)il.onchange=async e=>{
    const value=e.target.value;
    updateSettings({interfaceLanguage:value});
    await setSetting("interfaceLanguage",value);
    await refreshReviewQueue();
  };

  const rm=document.querySelector("#reduce-motion");
  if(rm)rm.onchange=async e=>{
    updateSettings({reduceMotion:e.target.checked});
    document.documentElement.dataset.reduceMotion=e.target.checked?"true":"false";
    await setSetting("reduceMotion",e.target.checked);
  };

  const aiProvider=document.querySelector("#ai-provider");
  if(aiProvider)aiProvider.onchange=async e=>{
    try{
      setAIProvider(e.target.value);
      const provider=getActiveAIProvider();
      updateAI({
        providerId:provider.id,
        providerLabel:provider.label,
        remote:Boolean(provider.getCapabilities().remote),
        response:null,
        error:null
      });
      await setSetting("aiProviderId",provider.id);
    }catch(error){
      updateOperation(error?.message??"Не удалось выбрать AI provider.","error");
    }
  };

  document.querySelectorAll("[data-update-dismiss]").forEach(el=>
    el.addEventListener("click",dismissUpdateNotice)
  );

  document.querySelector("#update-apply")?.addEventListener("click",()=>
    applyWaitingUpdate()
  );
}

async function initializeUpdates(){
  const installedNotice=await getReleaseNotice();
  if(installedNotice)setState({updateNotice:installedNotice});

  const wasControlled=Boolean(navigator.serviceWorker?.controller);
  await watchServiceWorker(()=>{
    const current=getState().updateNotice;
    setState({
      updateNotice:{
        ...(current??{
          kind:"available",
          title:"Доступно обновление приложения",
          changes:["Новая версия загружена и готова к установке."]
        }),
        serviceWorkerReady:true
      }
    });
  }).catch(error=>console.debug("Service worker update watch unavailable:",error));

  const remoteNotice=await checkRemoteUpdate();
  if(remoteNotice){
    setState({
      updateNotice:{...remoteNotice,serviceWorkerReady:hasWaitingUpdate()}
    });
  }

  if(wasControlled)navigator.serviceWorker?.addEventListener("controllerchange",()=>location.reload());
}

async function bootstrap(){
  try{
    await openDatabase();
    updateSpeech({capabilities:getSpeechCapabilities()});

    const user=await ensureLocalUser();
    const profiles=await listLanguageProfiles();
    const interfaceLanguage=await getSetting("interfaceLanguage");
    const reduceMotion=await getSetting("reduceMotion");
    const savedAIProviderId=await getSetting("aiProviderId");

    try{
      setAIProvider(savedAIProviderId??"local-demo");
    }catch{
      setAIProvider("local-demo");
    }
    const provider=getActiveAIProvider();
    updateAI({
      providerId:provider.id,
      providerLabel:provider.label,
      remote:Boolean(provider.getCapabilities().remote),
      providers:listAIProviders()
    });

    let active=user.activeLanguageId;
    if(!profiles.some(p=>p.languageId===active)){
      active=profiles[0]?.languageId??null;
    }

    const settings={
      ...getState().settings,
      ...(interfaceLanguage?{interfaceLanguage}:{}),
      ...(typeof reduceMotion==="boolean"?{reduceMotion}:{})
    };

    document.documentElement.dataset.reduceMotion=settings.reduceMotion?"true":"false";

    setState({
      settings,
      storageReady:true,
      user,
      languageProfiles:profiles,
      activeLanguageId:active,
      onboardingOpen:profiles.length===0
    });

    if(active){
      const profile=profiles.find(p=>p.languageId===active);
      await ensureProgress(active,profile?.skills??{});
    }

    await refreshLearningData(active);
    await initializeUpdates();
  }catch(error){
    console.error(error);
    setState({storageReady:false});
  }
}

subscribe(render);
render(getState());

startRouter(route=>{
  stopReferenceSpeech();
  if(getState().speech.recording)handleVoiceClear();
  setState({route});
  if(route==="review")refreshReviewQueue();
  if(route==="session")refreshSessionData();
  if(route==="conversation")refreshConversation();
});

addEventListener("online",async()=>{
  setState({online:true});
  const notice=await checkRemoteUpdate();
  if(notice)setState({updateNotice:notice});
});

addEventListener("offline",()=>setState({online:false}));

addEventListener("beforeunload",()=>{
  cancelVoiceRecording();
  clearVoiceRecording();
  stopReferenceSpeech();
});

addEventListener("error",event=>{
  const message=event.error?.message||event.message;
  if(message)updateOperation(`Ошибка приложения: ${message}`,"error");
});

addEventListener("unhandledrejection",event=>{
  const message=event.reason?.message||String(event.reason??"Неизвестная ошибка");
  updateOperation(`Ошибка операции: ${message}`,"error");
});

bootstrap();
