import {t,translateGoal} from "../i18n/i18n.js";
import {listLearningItems,listMistakes,listPersonalSituations,listSessions,saveSession} from "./learning-repository.js";
import {buildReviewQueue} from "./review-engine.js";

const pendingSessions=new Map();

export function todayKey(date=new Date()){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

function newest(items,count){
  return [...items]
    .sort((a,b)=>(b.updatedAt??b.createdAt??"").localeCompare(a.updatedAt??a.createdAt??""))
    .slice(0,count);
}

function makeBlock(type,title,prompt,data={}){
  return {
    id:`block-${globalThis.crypto?.randomUUID?.()??Math.random().toString(36).slice(2)}`,
    type,
    title,
    prompt,
    status:"pending",
    ...data
  };
}

export async function buildLocalSession({
  languageProfile,
  targetDuration=10,
  now=new Date()
}){
  if(!languageProfile?.languageId){
    throw new Error("languageProfile is required");
  }

  const languageId=languageProfile.languageId;
  const [items,mistakes,situations,dueReviews]=await Promise.all([
    listLearningItems(languageId),
    listMistakes(languageId),
    listPersonalSituations(languageId),
    buildReviewQueue(languageId,undefined,now)
  ]);

  const blocks=[];
  const goals=languageProfile.goals??[];

  blocks.push(makeBlock(
    "CONTEXT",
    t("session_goal"),
    goals.length
      ? t("session_goal_text",{goal:translateGoal(goals[0])})
      : t("session_general"),
    {estimatedMinutes:1}
  ));

  dueReviews.slice(0,3).forEach(({item,exercise})=>{
    blocks.push(makeBlock(
      "RECALL",
      "Повторение",
      exercise.instruction,
      {
        learningItemId:item.id,
        dimension:exercise.dimension,
        cue:exercise.prompt,
        expectedAnswer:exercise.answer,
        estimatedMinutes:1
      }
    ));
  });

  newest(mistakes.filter(x=>x.status==="active"),2).forEach(mistake=>{
    blocks.push(makeBlock(
      "CORRECTION",
      "Известная ошибка",
      `Вспомните правильный вариант вместо: “${mistake.original}”`,
      {
        mistakeId:mistake.id,
        expectedAnswer:mistake.correct,
        estimatedMinutes:1
      }
    ));
  });

  newest(situations.filter(x=>x.status==="active"),1).forEach(situation=>{
    blocks.push(makeBlock(
      "RESPOND",
      situation.title,
      situation.description||"Представьте ситуацию и сформулируйте естественный ответ.",
      {
        situationId:situation.id,
        estimatedMinutes:2
      }
    ));
  });

  newest(items,2).forEach(item=>{
    if(blocks.some(block=>block.learningItemId===item.id))return;
    blocks.push(makeBlock(
      "SPEAK",
      "Активное воспроизведение",
      item.meaning
        ? `Скажите на изучаемом языке: “${item.meaning}”`
        : `Используйте выражение “${item.text}” в короткой фразе.`,
      {
        learningItemId:item.id,
        expectedAnswer:item.text,
        estimatedMinutes:1
      }
    ));
  });

  if(blocks.length===1){
    blocks.push(makeBlock(
      "RESPOND",
      t("session_free"),
      t("session_free_text"),
      {estimatedMinutes:2,starterBlock:true}
    ));
  }

  return {
    languageId,
    topic:"Today practice",
    targetDuration,
    status:"planned",
    source:"local-session-engine",
    dayKey:todayKey(now),
    blocks
  };
}

export async function ensureTodaySession(languageProfile,targetDuration=10){
  if(!languageProfile?.languageId)return null;
  const key=`${languageProfile.languageId}:${todayKey()}`;
  if(!pendingSessions.has(key)){
    pendingSessions.set(key,loadTodaySession(languageProfile,targetDuration).finally(()=>pendingSessions.delete(key)));
  }
  return pendingSessions.get(key);
}

async function loadTodaySession(languageProfile,targetDuration){
  if(!languageProfile?.languageId)return null;
  const sessions=await listSessions(languageProfile.languageId);
  const key=todayKey();
  const todaySessions=sessions
    .filter(session=>(session.dayKey??todayKey(new Date(session.createdAt)))===key&&session.mode!=="conversation")
    .sort((a,b)=>(b.updatedAt??b.createdAt??"").localeCompare(a.updatedAt??a.createdAt??""));
  const existing=todaySessions.find(session=>session.status==="completed")??todaySessions[0];

  if(existing)return existing;

  const draft=await buildLocalSession({languageProfile,targetDuration});
  return saveSession(draft);
}

export function completeCurrentSessionBlock(session,completedAt=new Date().toISOString()){
  const index=session.blocks.findIndex(block=>block.status!=="completed");
  if(index<0)return session;

  const blocks=session.blocks.map((block,i)=>
    i===index?{...block,status:"completed",completedAt}:block
  );

  const completed=blocks.every(block=>block.status==="completed");
  return {
    ...session,
    blocks,
    status:completed?"completed":"in-progress",
    completedAt:completed?completedAt:null
  };
}

export async function advanceSession(session){
  return saveSession(completeCurrentSessionBlock(session));
}

export function currentSessionBlock(session){
  return session?.blocks?.find(block=>block.status!=="completed")??null;
}

export function sessionProgress(session){
  const total=session?.blocks?.length??0;
  const completed=session?.blocks?.filter(block=>block.status==="completed").length??0;
  return {
    total,
    completed,
    percent:total?Math.round(completed/total*100):0
  };
}
