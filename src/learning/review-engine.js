import {DEFAULT_USER_ID,STORES} from "../storage/schema.js";
import {putRecord} from "../storage/db.js";
import {listLearningItems,saveLearningItem} from "./learning-repository.js";
import {chooseReviewExercise,isDue,scheduleReview} from "./srs-engine.js";

function reviewId(){
  return globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export async function buildReviewQueue(languageId,userId=DEFAULT_USER_ID,now=new Date()){
  if(!languageId)return [];
  const items=await listLearningItems(languageId,userId);

  return items
    .filter(item=>isDue(item,now))
    .sort((a,b)=>{
      const aDue=a.nextReviewAt?new Date(a.nextReviewAt).getTime():0;
      const bDue=b.nextReviewAt?new Date(b.nextReviewAt).getTime():0;
      return aDue-bDue;
    })
    .map(item=>({
      item,
      exercise:chooseReviewExercise(item)
    }));
}

export async function recordReview({item,rating,dimension,userId=DEFAULT_USER_ID}){
  const reviewedAt=new Date();
  const updatedItem=scheduleReview(item,rating,dimension,reviewedAt);
  await saveLearningItem(updatedItem);

  const review={
    id:`review-${reviewId()}`,
    userId,
    languageId:item.languageId,
    learningItemId:item.id,
    dimension,
    rating,
    before:item.memory?.[dimension]??0,
    after:updatedItem.memory?.[dimension]??0,
    reviewedAt:reviewedAt.toISOString(),
    nextReviewAt:updatedItem.nextReviewAt
  };

  await putRecord(STORES.reviews,review);
  return {review,item:updatedItem};
}
