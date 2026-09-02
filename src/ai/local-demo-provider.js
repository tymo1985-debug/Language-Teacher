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
      demo:true
    };
  }

  async generateTeacherResponse(context){
    const language=context.languageProfile?.name??context.languageId?.toUpperCase()??"target language";
    const recentMistake=context.mistakes?.[0];

    const correction=recentMistake?{
      understood:true,
      original:recentMistake.original,
      corrected:recentMistake.correct,
      natural:recentMistake.correct,
      note:"Это сохранённая ранее ошибка. Local demo provider использует её только для проверки контракта.",
      severity:recentMistake.severity??"medium"
    }:null;

    return {
      schemaVersion:1,
      provider:"local-demo",
      kind:"teacher-response",
      message:`Архитектура AI Teacher готова для ${language}. Это локальный демонстрационный ответ, не облачный AI.`,
      blocks:[
        {
          type:"RESPOND",
          title:"Короткая реакция",
          prompt:"Сформулируйте одну естественную фразу на изучаемом языке о том, что вам нужно сегодня.",
          hints:[],
          expectedAnswer:null
        }
      ],
      corrections:correction?[correction]:[],
      learningSignals:{
        suggestedItems:[],
        mistakePatterns:recentMistake?.pattern?[recentMistake.pattern]:[]
      },
      metadata:{
        generatedAt:new Date().toISOString(),
        demo:true
      }
    };
  }
}
