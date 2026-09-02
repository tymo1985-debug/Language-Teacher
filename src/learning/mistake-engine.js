import {listMistakes,saveMistake} from "./learning-repository.js";
import {createMistake} from "./models.js";

function normalized(value){
  return String(value??"").trim().toLocaleLowerCase();
}

function sameMistake(a,b){
  return normalized(a.original)===normalized(b.original) &&
    normalized(a.correct)===normalized(b.correct) &&
    (a.pattern??"")===(b.pattern??"");
}

export async function recordConversationCorrection({
  languageId,
  original,
  corrected,
  category="conversation",
  pattern=null,
  severity="medium"
}){
  if(!languageId||!original||!corrected||normalized(original)===normalized(corrected)){
    return null;
  }

  const mistakes=await listMistakes(languageId);
  const candidate={
    original,
    correct:corrected,
    category,
    pattern,
    severity
  };

  const existing=mistakes.find(mistake=>sameMistake(mistake,candidate));
  const now=new Date().toISOString();

  if(existing){
    return saveMistake({
      ...existing,
      count:(Number(existing.count)||1)+1,
      lastSeenAt:now,
      status:"active",
      severity:promoteSeverity(existing.severity,severity),
      updatedAt:now
    });
  }

  return saveMistake(createMistake({
    languageId,
    original,
    correct:corrected,
    category,
    pattern,
    severity,
    count:1
  }));
}

export async function recordTeacherCorrections(languageId,corrections=[]){
  const saved=[];

  for(const correction of corrections){
    if(!correction?.original||!correction?.corrected)continue;

    const mistake=await recordConversationCorrection({
      languageId,
      original:correction.original,
      corrected:correction.corrected,
      category:correction.category??"conversation",
      pattern:correction.pattern??null,
      severity:correction.severity??"medium"
    });

    if(mistake)saved.push(mistake);
  }

  return saved;
}

function promoteSeverity(current,next){
  const rank={low:1,medium:2,high:3};
  return (rank[next]??2)>(rank[current]??2)?next:(current??next??"medium");
}
