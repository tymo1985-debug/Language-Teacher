import {DEFAULT_USER_ID,STORES} from "../storage/schema.js";
import {getRecord,listRecords,putRecord} from "../storage/db.js";
import {
  createLearningItem,
  createMistake,
  createSession,
  createPersonalSituation,
  createProgressRecord
} from "./models.js";
import {isDue} from "./srs-engine.js";

const belongsTo=(languageId,userId=DEFAULT_USER_ID)=>record=>
  record.userId===userId&&record.languageId===languageId;

export async function saveLearningItem(input){
  const item=input.createdAt?{...input,updatedAt:new Date().toISOString()}:createLearningItem(input);
  await putRecord(STORES.learningItems,item);
  return item;
}

export async function listLearningItems(languageId,userId=DEFAULT_USER_ID){
  return listRecords(STORES.learningItems,belongsTo(languageId,userId));
}

export async function saveMistake(input){
  const mistake=input.createdAt?{...input,updatedAt:new Date().toISOString()}:createMistake(input);
  await putRecord(STORES.mistakes,mistake);
  return mistake;
}

export async function listMistakes(languageId,userId=DEFAULT_USER_ID){
  return listRecords(STORES.mistakes,belongsTo(languageId,userId));
}

export async function saveSession(input){
  const session=input.createdAt?{...input,updatedAt:new Date().toISOString()}:createSession(input);
  await putRecord(STORES.sessions,session);
  return session;
}

export async function listSessions(languageId,userId=DEFAULT_USER_ID){
  return listRecords(STORES.sessions,belongsTo(languageId,userId));
}

export async function savePersonalSituation(input){
  const situation=input.createdAt?{...input,updatedAt:new Date().toISOString()}:createPersonalSituation(input);
  await putRecord(STORES.situations,situation);
  return situation;
}

export async function listPersonalSituations(languageId,userId=DEFAULT_USER_ID){
  return listRecords(STORES.situations,belongsTo(languageId,userId));
}

export async function listReviews(languageId,userId=DEFAULT_USER_ID){
  return listRecords(STORES.reviews,belongsTo(languageId,userId));
}

export async function getProgress(languageId,userId=DEFAULT_USER_ID){
  return getRecord(STORES.progress,`${userId}:${languageId}`);
}

export async function ensureProgress(languageId,skills={},userId=DEFAULT_USER_ID){
  const current=await getProgress(languageId,userId);
  if(current)return current;
  const progress=createProgressRecord({userId,languageId,skills});
  await putRecord(STORES.progress,progress);
  return progress;
}

export async function saveProgress(progress){
  const next={...progress,updatedAt:new Date().toISOString()};
  await putRecord(STORES.progress,next);
  return next;
}

export async function getLearningSummary(languageId,userId=DEFAULT_USER_ID){
  if(!languageId){
    return {
      learningItems:0,
      mistakes:0,
      sessions:0,
      situations:0,
      reviews:0,
      dueReviews:0,
      progress:null
    };
  }

  const [learningItems,mistakes,sessions,situations,reviews,progress]=await Promise.all([
    listLearningItems(languageId,userId),
    listMistakes(languageId,userId),
    listSessions(languageId,userId),
    listPersonalSituations(languageId,userId),
    listReviews(languageId,userId),
    getProgress(languageId,userId)
  ]);

  return {
    learningItems:learningItems.length,
    mistakes:mistakes.filter(x=>x.status==="active").length,
    sessions:sessions.length,
    situations:situations.filter(x=>x.status==="active").length,
    reviews:reviews.length,
    dueReviews:learningItems.filter(item=>isDue(item)).length,
    progress
  };
}
