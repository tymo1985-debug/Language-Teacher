import {
  saveLearningItem,
  savePersonalSituation
} from "./learning-repository.js";
import {createLearningItem,createPersonalSituation} from "./models.js";
import {requestTeacherResponse} from "../ai/teacher-engine.js";

function titleFromDescription(description){
  const clean=String(description??"").trim().replace(/\s+/g," ");
  if(!clean)return "Real Life situation";
  return clean.length>58?`${clean.slice(0,55)}…`:clean;
}

export async function prepareRealLifeHelp({
  languageProfile,
  description
}){
  const text=String(description??"").trim();
  if(!languageProfile?.languageId){
    throw new Error("Сначала выберите изучаемый язык.");
  }
  if(!text){
    throw new Error("Опишите ситуацию, в которой вам нужна фраза.");
  }

  const teacher=await requestTeacherResponse({
    languageProfile,
    mode:"real-life",
    userInput:text
  });

  const phraseBlock=teacher.response.blocks.find(block=>
    block.type==="PHRASE"||block.type==="RESPOND"||block.type==="ROLEPLAY"
  )??teacher.response.blocks[0]??null;

  return {
    description:text,
    title:titleFromDescription(text),
    phrase:phraseBlock?.expectedAnswer??"",
    instruction:phraseBlock?.prompt??teacher.response.message,
    teacherMessage:teacher.response.message,
    miniDialog:buildMiniDialog(teacher.response.blocks),
    provider:teacher.provider
  };
}

export async function saveRealLifeMaterial({
  languageProfile,
  result
}){
  if(!languageProfile?.languageId||!result?.description){
    throw new Error("Real Life result is incomplete.");
  }

  const situation=await savePersonalSituation(createPersonalSituation({
    languageId:languageProfile.languageId,
    title:result.title||titleFromDescription(result.description),
    description:result.description,
    status:"active"
  }));

  let learningItem=null;

  if(result.phrase){
    learningItem=await saveLearningItem(createLearningItem({
      languageId:languageProfile.languageId,
      type:"situation-expression",
      text:result.phrase,
      meaning:result.description,
      register:"neutral",
      contexts:["real-life",situation.id],
      tags:["real-life"],
      skills:["speaking","listening"],
      memory:{
        recognition:0.20,
        production:0.10,
        listening:0.10,
        pronunciation:0.10
      },
      nextReviewAt:new Date().toISOString()
    }));
  }

  return {situation,learningItem};
}

function buildMiniDialog(blocks=[]){
  return blocks
    .filter(block=>block.type==="ROLEPLAY"||block.type==="RESPOND")
    .slice(0,2)
    .map(block=>({
      prompt:block.prompt,
      answer:block.expectedAnswer??null
    }));
}
