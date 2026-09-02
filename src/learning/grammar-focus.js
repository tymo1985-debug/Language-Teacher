export function buildGrammarFocus(learningSummary={}){
  const mistakes=learningSummary?.library?.mistakes??[];

  if(!mistakes.length){
    return {
      available:false,
      title:"Грамматический фокус появится из вашей практики",
      summary:"Language Teacher не создаёт случайный учебник грамматики. Сначала нужна реальная ошибка или повторяющийся паттерн из Conversation, Session или Review.",
      mistake:null,
      prompt:"Хочу потренировать одну полезную грамматическую конструкцию для реального разговора."
    };
  }

  const ranked=[...mistakes].sort((a,b)=>{
    const severityWeight={high:3,medium:2,low:1};
    const aScore=(severityWeight[a.severity]??1)*10+(Number(a.count)||1);
    const bScore=(severityWeight[b.severity]??1)*10+(Number(b.count)||1);
    return bScore-aScore;
  });

  const mistake=ranked[0];
  const topic=mistake.pattern||mistake.category||"повторяющаяся конструкция";

  return {
    available:true,
    title:`Фокус: ${topic}`,
    summary:mistake.count>1
      ?`Эта ошибка уже встречалась ${mistake.count} раз. Лучше разобрать один паттерн и сразу использовать его в новой фразе.`
      :"Эта ошибка уже появилась в вашей практике. Разберём только тот паттерн, который нужен для реального употребления.",
    mistake,
    prompt:buildTeacherPrompt(mistake,topic)
  };
}

function buildTeacherPrompt(mistake,topic){
  const original=String(mistake.original??"").trim();
  const correct=String(mistake.correct??"").trim();
  return [
    `Хочу коротко потренировать грамматический паттерн: ${topic}.`,
    original?`Моя ошибка: ${original}.`:"",
    correct?`Правильный вариант: ${correct}.`:"",
    "Дай очень короткое объяснение и затем 2–3 задания на активное использование в реальной речи."
  ].filter(Boolean).join(" ");
}
