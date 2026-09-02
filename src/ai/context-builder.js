import {
  listLearningItems,
  listMistakes,
  listPersonalSituations,
  listSessions
} from "../learning/learning-repository.js";
import {buildReviewQueue} from "../learning/review-engine.js";

function newest(items,count){
  return [...items]
    .sort((a,b)=>(b.updatedAt??b.createdAt??"").localeCompare(a.updatedAt??a.createdAt??""))
    .slice(0,count);
}

export async function buildTeacherContext({
  languageProfile,
  mode="practice",
  userInput="",
  conversationTurns=[]
}){
  if(!languageProfile?.languageId){
    throw new Error("languageProfile is required for AI Teacher context.");
  }

  const languageId=languageProfile.languageId;

  const [items,mistakes,situations,sessions,dueReviews]=await Promise.all([
    listLearningItems(languageId),
    listMistakes(languageId),
    listPersonalSituations(languageId),
    listSessions(languageId),
    buildReviewQueue(languageId)
  ]);

  return {
    contextVersion:2,
    userId:languageProfile.userId,
    languageId,
    languageProfile:{
      id:languageProfile.id,
      languageId,
      name:languageProfile.name,
      goals:languageProfile.goals??[],
      skills:languageProfile.skills??{}
    },
    mode,
    userInput:String(userInput??"").slice(0,2000),
    conversationTurns:Array.isArray(conversationTurns)
      ?conversationTurns.slice(-12).map(turn=>({
        role:turn.role,
        text:String(turn.text??"").slice(0,1500)
      }))
      :[],
    weakItems:dueReviews.slice(0,8).map(entry=>({
      id:entry.item.id,
      type:entry.item.type,
      text:entry.item.text,
      meaning:entry.item.meaning,
      weakestDimension:entry.exercise.dimension
    })),
    mistakes:newest(mistakes.filter(x=>x.status==="active"),8).map(mistake=>({
      id:mistake.id,
      original:mistake.original,
      correct:mistake.correct,
      category:mistake.category,
      pattern:mistake.pattern,
      severity:mistake.severity,
      count:mistake.count
    })),
    situations:newest(situations.filter(x=>x.status==="active"),5).map(situation=>({
      id:situation.id,
      title:situation.title,
      description:situation.description
    })),
    recentSessions:newest(sessions,5).map(session=>({
      id:session.id,
      topic:session.topic,
      status:session.status,
      mode:session.mode??"session",
      completedAt:session.completedAt
    })),
    recentItems:newest(items,10).map(item=>({
      id:item.id,
      type:item.type,
      text:item.text,
      meaning:item.meaning,
      contexts:item.contexts
    }))
  };
}
