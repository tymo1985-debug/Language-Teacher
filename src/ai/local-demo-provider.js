import {AIProvider} from "./provider.js";

export class LocalDemoAIProvider extends AIProvider {
  constructor(){
    super({id:"local-demo",label:"Local architecture demo"});
  }

  getCapabilities(){
    return {
      available:true,
      remote:false,
      structuredOutput:true,
      demo:true,
      conversation:true
    };
  }

  async generateTeacherResponse(context){
    if(context.mode==="conversation"){
      return conversationResponse(context);
    }

    const language=context.languageProfile?.name??context.languageId?.toUpperCase()??"target language";
    const recentMistake=context.mistakes?.[0];

    const correction=recentMistake?{
      understood:true,
      original:recentMistake.original,
      corrected:recentMistake.correct,
      natural:recentMistake.correct,
      note:"Это сохранённая ранее ошибка. Local demo provider использует её только для проверки контракта.",
      severity:recentMistake.severity??"medium",
      category:recentMistake.category??"other",
      pattern:recentMistake.pattern??null
    }:null;

    return baseResponse({
      message:`Архитектура AI Teacher готова для ${language}. Это локальный демонстрационный ответ, не облачный AI.`,
      blocks:[{
        type:"RESPOND",
        title:"Короткая реакция",
        prompt:"Сформулируйте одну естественную фразу на изучаемом языке о том, что вам нужно сегодня.",
        hints:[],
        expectedAnswer:null
      }],
      corrections:correction?[correction]:[]
    });
  }
}

function conversationResponse(context){
  const input=String(context.userInput??"").trim();
  const knownMistake=findKnownMistake(context.mistakes??[],input);
  const corrections=[];

  if(knownMistake){
    corrections.push({
      understood:true,
      original:knownMistake.original,
      corrected:knownMistake.correct,
      natural:knownMistake.correct,
      note:"Эта формулировка уже встречалась раньше. Попробуйте использовать исправленный вариант.",
      severity:knownMistake.severity??"medium",
      category:knownMistake.category??"conversation",
      pattern:knownMistake.pattern??null
    });
  }

  const turnCount=(context.conversationTurns??[]).filter(turn=>turn.role==="user").length;
  const replies=[
    "Хорошо. Расскажите чуть подробнее — что для вас сейчас самое важное в этой ситуации?",
    "Понятно. А что бы вы хотели сделать дальше?",
    "Спасибо. Как бы вы объяснили это ещё одной короткой фразой, если собеседник вас не понял?",
    "Хорошо. Представьте, что я задаю уточняющий вопрос: когда именно это произошло?",
    "Понятно. И какой результат разговора вас бы устроил?"
  ];

  return baseResponse({
    message:replies[Math.min(turnCount,replies.length-1)],
    blocks:[{
      type:"ROLEPLAY",
      title:"Продолжение диалога",
      prompt:"Ответьте собеседнику самостоятельно. Подсказка не показывается до вашего ответа.",
      hints:[],
      expectedAnswer:null
    }],
    corrections
  });
}

function findKnownMistake(mistakes,input){
  const normalized=String(input).toLocaleLowerCase();
  return mistakes.find(mistake=>
    mistake.original &&
    normalized.includes(String(mistake.original).toLocaleLowerCase())
  )??null;
}

function baseResponse({message,blocks,corrections=[]}){
  return {
    schemaVersion:1,
    provider:"local-demo",
    kind:"teacher-response",
    message,
    blocks,
    corrections,
    learningSignals:{
      suggestedItems:[],
      mistakePatterns:corrections.map(item=>item.pattern).filter(Boolean)
    },
    metadata:{
      generatedAt:new Date().toISOString(),
      demo:true
    }
  };
}
