const text=(value,max=1200)=>String(value??"").slice(0,max);
const list=(value,max)=>Array.isArray(value)?value.slice(0,max):[];

export function sanitizeTeacherContext(context){
  if(!context||typeof context!=="object"||Array.isArray(context)){
    throw new Error("Teacher context must be an object.");
  }

  const profile=context.languageProfile??{};
  return {
    contextVersion:Number(context.contextVersion)||1,
    languageId:text(context.languageId,20),
    interfaceLanguage:["ru","en","uk"].includes(context.interfaceLanguage)?context.interfaceLanguage:"ru",
    languageProfile:{
      name:text(profile.name,80),
      goals:list(profile.goals,8).map(value=>text(value,160)),
      skills:profile.skills&&typeof profile.skills==="object"?profile.skills:{}
    },
    mode:text(context.mode,40),
    userInput:text(context.userInput,2000),
    conversationTurns:list(context.conversationTurns,12).map(turn=>({
      role:turn?.role==="user"?"user":"partner",
      text:text(turn?.text,1500)
    })),
    weakItems:list(context.weakItems,8).map(item=>({
      type:text(item?.type,80),text:text(item?.text,500),
      meaning:text(item?.meaning,500),weakestDimension:text(item?.weakestDimension,40)
    })),
    mistakes:list(context.mistakes,8).map(item=>({
      original:text(item?.original,500),correct:text(item?.correct,500),
      category:text(item?.category,80),pattern:text(item?.pattern,300),
      severity:text(item?.severity,20),count:Math.max(1,Number(item?.count)||1)
    })),
    situations:list(context.situations,5).map(item=>({
      title:text(item?.title,160),description:text(item?.description,800)
    })),
    recentSessions:list(context.recentSessions,5).map(item=>({
      topic:text(item?.topic,160),status:text(item?.status,40),mode:text(item?.mode,40)
    })),
    recentItems:list(context.recentItems,10).map(item=>({
      type:text(item?.type,80),text:text(item?.text,500),meaning:text(item?.meaning,500),
      contexts:list(item?.contexts,4).map(value=>text(value,300))
    }))
  };
}
