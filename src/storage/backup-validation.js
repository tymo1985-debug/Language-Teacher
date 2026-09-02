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
    if(records!==undefined&&!Array.isArray(records)){
      errors.push(`${store} должен быть массивом.`);
      continue;
    }

    for(const [index,record] of (records??[]).entries()){
      if(!record||typeof record!=="object"||Array.isArray(record)||!record.id){
        errors.push(`Некорректная запись ${index+1} в ${store}.`);
      }
    }
  }

  return {valid:errors.length===0,errors};
}
