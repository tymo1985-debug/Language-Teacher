export function normalizeSpeechText(value,locale=""){
  return String(value??"")
    .toLocaleLowerCase(locale||undefined)
    .normalize("NFKC")
    .replace(/[.,!?;:()[\]{}"“”„'’—–-]/g," ")
    .replace(/\s+/g," ")
    .trim();
}

export function compareTranscript(expected,actual,locale=""){
  const a=normalizeSpeechText(expected,locale);
  const b=normalizeSpeechText(actual,locale);

  if(!a||!b){
    return {
      comparable:false,
      exact:false,
      expected:a,
      actual:b,
      overlap:0,
      feedback:"Недостаточно данных для сравнения."
    };
  }

  const expectedWords=a.split(" ");
  const actualWords=b.split(" ");
  const matched=countOrderedMatches(expectedWords,actualWords);
  const overlap=expectedWords.length?matched/expectedWords.length:0;
  const exact=a===b;

  return {
    comparable:true,
    exact,
    expected:a,
    actual:b,
    overlap,
    feedback:exact
      ?"Распознанный текст совпал с эталонной фразой."
      :overlap>=.75
        ?"Распознавание уловило большую часть фразы. Прослушайте запись и повторите ещё раз."
        :overlap>=.4
          ?"Распознана только часть фразы. Сравните ритм и отдельные слова с эталоном."
          :"Распознавание сильно отличается. Это не оценка произношения — попробуйте медленнее и короче."
  };
}

function countOrderedMatches(expected,actual){
  let matched=0;
  let cursor=0;
  for(const word of expected){
    const index=actual.indexOf(word,cursor);
    if(index===-1)continue;
    matched+=1;
    cursor=index+1;
  }
  return matched;
}

export function buildPronunciationGuidance(reference,comparison){
  const text=String(reference??"").trim();
  if(!text){
    return {
      title:"Добавьте короткую эталонную фразу",
      steps:[
        "Прослушайте системный эталонный голос.",
        "Запишите себя без спешки.",
        "Прослушайте запись и повторите ещё раз."
      ]
    };
  }

  return {
    title:comparison?.exact?"Фраза распознана полностью":"Работайте циклом «слушаю → говорю → слушаю себя»",
    steps:[
      "Сначала прослушайте эталон целиком, не повторяя одновременно.",
      "Скажите фразу естественно одним выдохом или короткими смысловыми группами.",
      "Прослушайте свою запись и сравните ритм, ударение и окончания.",
      "Если доступно распознавание, используйте его только как проверку понятности слов, не как pronunciation score."
    ]
  };
}
