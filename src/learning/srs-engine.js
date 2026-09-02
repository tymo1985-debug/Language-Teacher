export const REVIEW_RATINGS=["again","hard","good","easy"];
export const MEMORY_DIMENSIONS=["recognition","production","listening","pronunciation"];

const DAY=24*60*60*1000;

function clamp(value,min=0,max=1){
  return Math.max(min,Math.min(max,Number(value)||0));
}

export function weakestMemoryDimension(item){
  const memory=item?.memory??{};
  return MEMORY_DIMENSIONS
    .map(dimension=>[dimension,clamp(memory[dimension])])
    .sort((a,b)=>a[1]-b[1])[0]?.[0]??"production";
}

export function chooseReviewExercise(item){
  const dimension=weakestMemoryDimension(item);

  if(dimension==="recognition"){
    return {
      dimension,
      kind:"recognition",
      prompt:item.text,
      instruction:"Вспомните значение выражения.",
      answer:item.meaning||"Значение пока не указано."
    };
  }

  if(dimension==="listening"){
    return {
      dimension,
      kind:"listening-recall",
      prompt:item.meaning||item.text,
      instruction:"Произнесите выражение вслух по памяти. Аудио будет подключено в Speech phase.",
      answer:item.text
    };
  }

  if(dimension==="pronunciation"){
    return {
      dimension,
      kind:"pronunciation-recall",
      prompt:item.text,
      instruction:"Произнесите выражение естественно вслух, затем сравните себя с написанием.",
      answer:item.text
    };
  }

  return {
    dimension:"production",
    kind:"production",
    prompt:item.meaning||"Воспроизведите выражение по памяти.",
    instruction:"Скажите или напишите выражение на изучаемом языке.",
    answer:item.text
  };
}

export function updateMemoryValue(current,rating){
  const value=clamp(current);
  const delta={
    again:-0.16,
    hard:0.03,
    good:0.10,
    easy:0.17
  }[rating]??0;
  return Number(clamp(value+delta).toFixed(3));
}

export function nextIntervalDays(item,rating,dimension){
  const strength=clamp(item?.memory?.[dimension]);
  if(rating==="again")return 0;
  if(rating==="hard")return strength>=0.6?2:1;
  if(rating==="easy"){
    if(strength>=0.8)return 30;
    if(strength>=0.6)return 14;
    if(strength>=0.4)return 7;
    return 3;
  }
  if(strength>=0.85)return 21;
  if(strength>=0.7)return 10;
  if(strength>=0.5)return 5;
  if(strength>=0.3)return 3;
  return 1;
}

export function scheduleReview(item,rating,dimension,reviewedAt=new Date()){
  if(!REVIEW_RATINGS.includes(rating)){
    throw new Error(`Unsupported review rating: ${rating}`);
  }

  const previous=item.memory?.[dimension]??0;
  const nextMemory=updateMemoryValue(previous,rating);
  const intervalDays=nextIntervalDays(
    {...item,memory:{...item.memory,[dimension]:nextMemory}},
    rating,
    dimension
  );

  const nextDate=new Date(reviewedAt.getTime()+intervalDays*DAY);
  if(rating==="again"){
    nextDate.setMinutes(nextDate.getMinutes()+10);
  }

  return {
    ...item,
    memory:{...item.memory,[dimension]:nextMemory},
    lastSeenAt:reviewedAt.toISOString(),
    nextReviewAt:nextDate.toISOString(),
    updatedAt:reviewedAt.toISOString()
  };
}

export function isDue(item,now=new Date()){
  if(!item.nextReviewAt)return true;
  return new Date(item.nextReviewAt).getTime()<=now.getTime();
}
