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
      actual:b
    };
  }

  return {
    comparable:true,
    exact:a===b,
    expected:a,
    actual:b
  };
}

// Deliberately no pronunciation score in Phase 6.
// Browser transcription is not a reliable phoneme-level pronunciation assessor.
