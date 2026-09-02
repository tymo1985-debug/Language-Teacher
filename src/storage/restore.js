import {BACKUP_FORMAT,BACKUP_VERSION} from "./backup.js";
import {STORES} from "./schema.js";
import {clearStore,putRecord} from "./db.js";

const RESTORE_STORES=[
  STORES.users,
  STORES.settings,
  STORES.languageProfiles,
  STORES.learningItems,
  STORES.mistakes,
  STORES.sessions,
  STORES.reviews,
  STORES.progress,
  STORES.situations,
  STORES.sources
];

export function validateBackup(value){
  const errors=[];

  if(!value||typeof value!=="object"||Array.isArray(value)){
    return {valid:false,errors:["Backup должен быть JSON-объектом."]};
  }

  if(value.format!==BACKUP_FORMAT){
    errors.push("Неверный формат backup.");
  }

  if(value.backupVersion!==BACKUP_VERSION){
    errors.push(`Неподдерживаемая версия backup: ${value.backupVersion??"unknown"}.`);
  }

  if(!value.data||typeof value.data!=="object"){
    errors.push("В backup отсутствует раздел data.");
  }else{
    for(const store of RESTORE_STORES){
      if(value.data[store]!==undefined&&!Array.isArray(value.data[store])){
        errors.push(`${store} должен быть массивом.`);
      }
    }
  }

  return {valid:errors.length===0,errors};
}

export async function restoreBackup(value){
  const validation=validateBackup(value);
  if(!validation.valid){
    const error=new Error(validation.errors.join(" "));
    error.validationErrors=validation.errors;
    throw error;
  }

  // Clear only stores that belong to the portable backup contract.
  for(const store of RESTORE_STORES){
    await clearStore(store);
  }

  for(const store of RESTORE_STORES){
    const records=value.data?.[store]??[];
    for(const record of records){
      if(!record||typeof record!=="object"||!record.id){
        throw new Error(`Некорректная запись в ${store}.`);
      }
      await putRecord(store,record);
    }
  }

  return {
    restoredAt:new Date().toISOString(),
    stores:RESTORE_STORES.length
  };
}

export async function readBackupFile(file){
  if(!file)throw new Error("Файл не выбран.");
  if(file.size>20*1024*1024){
    throw new Error("Backup слишком большой для MVP restore (максимум 20 MB).");
  }

  const text=await file.text();
  let parsed;
  try{
    parsed=JSON.parse(text);
  }catch{
    throw new Error("Файл не является корректным JSON.");
  }

  const validation=validateBackup(parsed);
  if(!validation.valid){
    throw new Error(validation.errors.join(" "));
  }

  return parsed;
}
