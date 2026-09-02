import {saveSession,listSessions} from "./learning-repository.js";
import {requestTeacherResponse} from "../ai/teacher-engine.js";
import {recordTeacherCorrections} from "./mistake-engine.js";

function uid(){
  return globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

const SCENARIOS=[
  {
    id:"everyday",
    title:"Повседневный разговор",
    partner:"Знакомый",
    opening:"Представьте, что мы встретились сегодня утром. Поздоровайтесь и коротко расскажите, какие у вас планы.",
    topic:"Everyday conversation"
  },
  {
    id:"cafe",
    title:"В кафе",
    partner:"Официант",
    opening:"Вы вошли в кафе. Я официант. Сделайте заказ естественной фразой.",
    topic:"Cafe roleplay"
  },
  {
    id:"problem",
    title:"Объяснить проблему",
    partner:"Сотрудник сервиса",
    opening:"У вас возникла бытовая проблема. Объясните мне, что случилось и какая помощь вам нужна.",
    topic:"Explain a problem"
  },
  {
    id:"small-talk",
    title:"Small talk",
    partner:"Сосед",
    opening:"Мы встретились у дома. Начните короткий естественный разговор.",
    topic:"Small talk"
  }
];

export function listConversationScenarios(){
  return SCENARIOS;
}

export async function startConversation({languageProfile,scenarioId="everyday"}){
  const scenario=SCENARIOS.find(item=>item.id===scenarioId)??SCENARIOS[0];
  const now=new Date().toISOString();

  const session={
    languageId:languageProfile.languageId,
    topic:scenario.topic,
    targetDuration:10,
    status:"in-progress",
    mode:"conversation",
    scenarioId:scenario.id,
    partner:scenario.partner,
    turns:[
      {
        id:`turn-${uid()}`,
        role:"partner",
        text:scenario.opening,
        createdAt:now
      }
    ],
    blocks:[],
    createdAt:now,
    updatedAt:now,
    completedAt:null
  };

  return saveSession(session);
}

export async function continueConversation({
  conversation,
  languageProfile,
  userText
}){
  const text=String(userText??"").trim();
  if(!text)throw new Error("Введите или произнесите ответ.");

  const userTurn={
    id:`turn-${uid()}`,
    role:"user",
    text,
    createdAt:new Date().toISOString()
  };

  const conversationTurns=[...(conversation.turns??[]),userTurn];

  const teacher=await requestTeacherResponse({
    languageProfile,
    mode:"conversation",
    userInput:text,
    conversationTurns
  });

  const partnerTurn={
    id:`turn-${uid()}`,
    role:"partner",
    text:teacher.response.message,
    corrections:teacher.response.corrections??[],
    createdAt:new Date().toISOString()
  };

  await recordTeacherCorrections(
    languageProfile.languageId,
    teacher.response.corrections??[]
  );

  const updated=await saveSession({
    ...conversation,
    turns:[...conversationTurns,partnerTurn],
    status:"in-progress",
    updatedAt:new Date().toISOString()
  });

  return {
    conversation:updated,
    teacherResponse:teacher.response
  };
}

export async function finishConversation(conversation){
  if(!conversation)return null;

  return saveSession({
    ...conversation,
    status:"completed",
    completedAt:new Date().toISOString(),
    updatedAt:new Date().toISOString()
  });
}

export async function getActiveConversation(languageId){
  const sessions=await listSessions(languageId);
  return [...sessions]
    .reverse()
    .find(session=>session.mode==="conversation"&&session.status==="in-progress")??null;
}
