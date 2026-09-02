const SKILLS=["speaking","listening","pronunciation","vocabulary","grammar"];

const clamp=value=>Math.max(0,Math.min(1,Number(value)||0));
const average=values=>values.length?values.reduce((a,b)=>a+b,0)/values.length:0;

export function buildProgressSnapshot({
  baselineSkills={},
  learningItems=[],
  reviews=[],
  sessions=[],
  mistakes=[],
  situations=[]
}={}){
  const completedSessions=sessions.filter(session=>session.status==="completed");
  const conversations=completedSessions.filter(session=>session.mode==="conversation");
  const practiceSessions=completedSessions.filter(session=>session.mode!=="conversation");

  const memoryValues=dimension=>
    learningItems
      .map(item=>Number(item.memory?.[dimension]))
      .filter(Number.isFinite)
      .map(clamp);

  const recognition=memoryValues("recognition");
  const production=memoryValues("production");
  const listening=memoryValues("listening");
  const pronunciation=memoryValues("pronunciation");

  const observed={
    speaking:production,
    listening,
    pronunciation,
    vocabulary:[
      ...recognition,
      ...production
    ],
    grammar:[]
  };

  const grammarReviews=reviews
    .filter(review=>review.dimension==="grammar")
    .map(review=>Number(review.after))
    .filter(Number.isFinite)
    .map(clamp);
  observed.grammar.push(...grammarReviews);

  const skills={};
  for(const skill of SKILLS){
    const evidence=observed[skill];
    const baseline=clamp(baselineSkills?.[skill]);
    skills[skill]={
      value:evidence.length?average(evidence):baseline,
      source:evidence.length?"practice":"baseline",
      evidenceCount:evidence.length
    };
  }

  const reviewImprovement=reviews.length
    ? average(reviews.map(review=>clamp(review.after)-clamp(review.before)))
    : 0;

  return {
    skills,
    activity:{
      completedSessions:completedSessions.length,
      practiceSessions:practiceSessions.length,
      conversations:conversations.length,
      reviews:reviews.length,
      activeMistakes:mistakes.filter(mistake=>mistake.status==="active").length,
      situations:situations.filter(situation=>situation.status==="active").length,
      learningItems:learningItems.length
    },
    reviewImprovement,
    capabilities:buildCapabilities({conversations,reviews,situations,learningItems,completedSessions})
  };
}

function buildCapabilities({conversations,reviews,situations,learningItems,completedSessions}){
  const problemConversation=conversations.some(session=>session.scenarioId==="problem");
  const everydayConversation=conversations.some(session=>
    ["everyday","small-talk","cafe"].includes(session.scenarioId)
  );

  return [
    capability(
      "Поддержать короткий разговор",
      conversations.length,
      conversations.length>=3?"good":conversations.length?"developing":"not-practiced",
      conversations.length?`${conversations.length} завершённых разговоров`:"Нужна первая завершённая Conversation"
    ),
    capability(
      "Объяснить реальную проблему",
      Number(problemConversation)+situations.length,
      problemConversation?"good":situations.length?"developing":"not-practiced",
      problemConversation?"Уже практиковалось в диалоге":situations.length?`${situations.length} сохранённых ситуаций`:"Пока нет практики"
    ),
    capability(
      "Вспомнить знакомое без подсказки",
      reviews.length,
      reviews.length>=8?"good":reviews.length?"developing":"not-practiced",
      reviews.length?`${reviews.length} активных повторений`:"Нужны первые Review"
    ),
    capability(
      "Использовать накопленный язык",
      learningItems.length+completedSessions.length,
      learningItems.length>=8?"good":learningItems.length?"developing":"not-practiced",
      learningItems.length?`${learningItems.length} выражений в Learning Library`:"Библиотека ещё формируется"
    )
  ];
}

function capability(title,evidence,status,note){
  return {title,evidence,status,note};
}
