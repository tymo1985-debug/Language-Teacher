export function validatePortableBackup(value,{format,version,stores}){
  const errors=[];

  if(!value||typeof value!=="object"||Array.isArray(value)){
    return {valid:false,errors:["Backup должен быть JSON-объектом."]};
  }

  if(value.format!==format)errors.push("Неверный формат backup.");
  if(value.backupVersion!==version){
    errors.push(`Неподдерживаемая версия backup: ${value.backupVersion??"unknown"}.`);
  }

  if(!value.data||typeof value.data!=="object"||Array.isArray(value.data)){
    errors.push("В backup отсутствует раздел data.");
    return {valid:false,errors};
  }

  for(const store of stores){
    const records=value.data[store];
    if(!Array.isArray(records)){
      errors.push(`${store} должен быть массивом.`);
      continue;
    }

    const ids=new Set();
    for(const [index,record] of (records??[]).entries()){
      if(!record||typeof record!=="object"||Array.isArray(record)||typeof record.id!=="string"||!record.id.trim()||ids.has(record.id)){
        errors.push(`Некорректная запись ${index+1} в ${store}.`);
      }else{
        ids.add(record.id);
        const fail=()=>errors.push(`Повреждённые данные записи ${index+1} в ${store}.`);
        if(store==="languageProfiles"&&(
          typeof record.languageId!=="string"||!record.languageId.match(/^[a-z]{2,3}(?:-[A-Za-z]{2,4})?$/)||
          typeof record.userId!=="string"||typeof record.createdAt!=="string"||
          !Array.isArray(record.goals)||!record.goals.every(goal=>typeof goal==="string")
        ))fail();
        if(store==="sessions"&&(!Array.isArray(record.blocks)||record.blocks.some(block=>!block||typeof block!=="object")||
          (record.turns!==undefined&&(!Array.isArray(record.turns)||record.turns.some(turn=>!turn||typeof turn!=="object")))))fail();
        for(const field of ["createdAt","updatedAt","completedAt","nextReviewAt","reviewedAt"]){
          if(record[field]!=null&&(typeof record[field]!=="string"||!Number.isFinite(Date.parse(record[field]))))fail();
        }
      }
    }
  }

  return {valid:errors.length===0,errors};
}
