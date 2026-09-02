import {BACKUP_FORMAT,BACKUP_VERSION} from "./backup.js";
import {STORES} from "./schema.js";
import {clearStore,putRecord} from "./db.js";
import {validatePortableBackup} from "./backup-validation.js";

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
  return validatePortableBackup(value,{
    format:BACKUP_FORMAT,
    version:BACKUP_VERSION,
    stores:RESTORE_STORES
  });
}

export async function restoreBackup(value){
  const validation=validateBackup(value);
  if(!validation.valid){
    const error=new Error(validation.errors.join(" "));
    error.validationErrors=validation.errors;
    throw error;
  }

  // Validation is complete before the first destructive write.
  // A malformed record can no longer wipe the current local data midway through restore.
  for(const store of RESTORE_STORES){
    await clearStore(store);
  }

  for(const store of RESTORE_STORES){
    const records=value.data?.[store]??[];
    for(const record of records){
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
