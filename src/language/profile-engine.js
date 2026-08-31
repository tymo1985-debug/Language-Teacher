import {DEFAULT_USER_ID,STORES} from "../storage/schema.js";
import {deleteRecord,getAllRecords,getRecord,putRecord} from "../storage/db.js";
import {getLanguageMeta} from "./language-catalog.js";
const skills=v=>({speaking:v,listening:v,pronunciation:v,grammar:v,vocabulary:v});
export async function listLanguageProfiles(){
  return (await getAllRecords(STORES.languageProfiles)).filter(x=>x.userId===DEFAULT_USER_ID).sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
}
export async function createLanguageProfile({languageId,goals,selfAssessment}){
  const id=`${DEFAULT_USER_ID}:${languageId}`;
  const existing=await getRecord(STORES.languageProfiles,id);
  if(existing)return existing;
  const meta=getLanguageMeta(languageId),now=new Date().toISOString(),base=Number(selfAssessment?.value??.10);
  const profile={id,userId:DEFAULT_USER_ID,languageId,name:meta.name,label:meta.label,flag:meta.flag,status:"active",goals:Array.isArray(goals)?goals:[],selfAssessmentId:selfAssessment?.id??"starter",skills:skills(base),createdAt:now,updatedAt:now};
  await putRecord(STORES.languageProfiles,profile);
  return profile;
}
export async function removeLanguageProfile(languageId){return deleteRecord(STORES.languageProfiles,`${DEFAULT_USER_ID}:${languageId}`);}
