import {AIProvider} from "./provider.js";

const PHRASES={
  cs:{
    help:"Můžete mi prosím pomoct?",
    problem:"Mám problém a potřebuji pomoc.",
    leak:"Pod dřezem teče voda. Můžete se na to prosím podívat?",
    pharmacy:"Potřebuji něco z lékárny. Můžete mi prosím poradit?",
    directions:"Promiňte, můžete mi prosím říct, jak se tam dostanu?",
    coffee:"Dám si jednu kávu, prosím."
  },
  en:{
    help:"Could you help me, please?",
    problem:"I have a problem and I need some help.",
    leak:"There is water leaking under the sink. Could you take a look, please?",
    pharmacy:"I need something from the pharmacy. Could you advise me, please?",
    directions:"Excuse me, could you tell me how to get there?",
    coffee:"I'd like a coffee, please."
  },
  de:{
    help:"Könnten Sie mir bitte helfen?",
    problem:"Ich habe ein Problem und brauche Hilfe.",
    leak:"Unter der Spüle läuft Wasser aus. Könnten Sie sich das bitte ansehen?",
    pharmacy:"Ich brauche etwas aus der Apotheke. Könnten Sie mich bitte beraten?",
    directions:"Entschuldigung, könnten Sie mir bitte sagen, wie ich dorthin komme?",
    coffee:"Ich hätte gern einen Kaffee, bitte."
  },
  pl:{
    help:"Czy może mi pan/pani pomóc?",
    problem:"Mam problem i potrzebuję pomocy.",
    leak:"Spod zlewu cieknie woda. Czy może pan/pani to sprawdzić?",
    pharmacy:"Potrzebuję czegoś z apteki. Czy może mi pan/pani doradzić?",
    directions:"Przepraszam, czy może mi pan/pani powiedzieć, jak tam dojść?",
    coffee:"Poproszę kawę."
  },
  uk:{
    help:"Чи можете ви мені допомогти?",
    problem:"У мене проблема, і мені потрібна допомога.",
    leak:"Під раковиною тече вода. Чи можете ви, будь ласка, подивитися?",
    pharmacy:"Мені потрібно дещо з аптеки. Чи можете ви порадити?",
    directions:"Перепрошую, чи можете ви сказати, як туди дістатися?",
    coffee:"Мені, будь ласка, одну каву."
  },
  sk:{
    help:"Môžete mi, prosím, pomôcť?",
    problem:"Mám problém a potrebujem pomoc.",
    leak:"Pod drezom tečie voda. Môžete sa na to, prosím, pozrieť?",
    pharmacy:"Potrebujem niečo z lekárne. Môžete mi, prosím, poradiť?",
    directions:"Prepáčte, môžete mi, prosím, povedať, ako sa tam dostanem?",
    coffee:"Dám si jednu kávu, prosím."
  },
  es:{
    help:"¿Podría ayudarme, por favor?",
    problem:"Tengo un problema y necesito ayuda.",
    leak:"Hay una fuga de agua debajo del fregadero. ¿Podría echarle un vistazo, por favor?",
    pharmacy:"Necesito algo de la farmacia. ¿Podría aconsejarme, por favor?",
    directions:"Disculpe, ¿podría decirme cómo llegar allí?",
    coffee:"Quisiera un café, por favor."
  },
  fr:{
    help:"Pourriez-vous m'aider, s'il vous plaît ?",
    problem:"J'ai un problème et j'ai besoin d'aide.",
    leak:"Il y a une fuite d'eau sous l'évier. Pourriez-vous regarder, s'il vous plaît ?",
    pharmacy:"J'ai besoin de quelque chose à la pharmacie. Pourriez-vous me conseiller ?",
    directions:"Excusez-moi, pourriez-vous me dire comment y aller ?",
    coffee:"Je voudrais un café, s'il vous plaît."
  },
  it:{
    help:"Potrebbe aiutarmi, per favore?",
    problem:"Ho un problema e ho bisogno di aiuto.",
    leak:"C'è una perdita d'acqua sotto il lavandino. Potrebbe dare un'occhiata, per favore?",
    pharmacy:"Ho bisogno di qualcosa in farmacia. Potrebbe consigliarmi?",
    directions:"Mi scusi, potrebbe dirmi come arrivarci?",
    coffee:"Vorrei un caffè, per favore."
  }
};

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
      conversation:true,
      realLife:true
    };
  }

  async generateTeacherResponse(context){
    if(context.mode==="conversation"){
      return conversationResponse(context);
    }

    if(context.mode==="real-life"){
      return realLifeResponse(context);
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

function realLifeResponse(context){
  const languageId=context.languageId;
  const table=PHRASES[languageId]??PHRASES.en;
  const input=String(context.userInput??"").toLocaleLowerCase();
  const intent=detectIntent(input);
  const phrase=table[intent]??table.help;

  return baseResponse({
    message:"Вот короткая практичная фраза, которую можно использовать прямо сейчас.",
    blocks:[
      {
        type:"PHRASE",
        title:"Скажите это",
        prompt:"Сначала прочитайте фразу, затем произнесите её вслух.",
        hints:[],
        expectedAnswer:phrase
      },
      {
        type:"ROLEPLAY",
        title:"Мини-диалог",
        prompt:"Представьте, что собеседник отвечает: «Конечно. Расскажите подробнее». Объясните ситуацию ещё одной короткой фразой.",
        hints:[],
        expectedAnswer:null
      }
    ],
    corrections:[]
  });
}

function detectIntent(input){
  if(/sink|leak|water|теч|вода|раков|dřez|voda|spül|wasser|zlew|wod|fuite|évier|lavandino|acqua/.test(input))return "leak";
  if(/pharmacy|аптек|lékár|apothek|apte|farmac/.test(input))return "pharmacy";
  if(/direction|дорог|как доб|dostat|weg|dojść|arriv|llegar/.test(input))return "directions";
  if(/coffee|кофе|кава|káv|kaffee|kawa|café|caffè/.test(input))return "coffee";
  if(/problem|проблем|problém|problem|problema/.test(input))return "problem";
  return "help";
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
