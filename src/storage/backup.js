import {DB_VERSION,STORES} from "./schema.js";
import {getAllRecords} from "./db.js";

export const BACKUP_FORMAT="language-teacher-backup";
export const BACKUP_VERSION=1;

const BACKUP_STORES=[
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

export async function createBackup(){
  const data={};

  for(const store of BACKUP_STORES){
    data[store]=await getAllRecords(store);
  }

  return {
    format:BACKUP_FORMAT,
    backupVersion:BACKUP_VERSION,
    schemaVersion:DB_VERSION,
    exportedAt:new Date().toISOString(),
    data
  };
}

export async function downloadBackup(){
  const backup=await createBackup();
  const blob=new Blob(
    [JSON.stringify(backup,null,2)],
    {type:"application/json;charset=utf-8"}
  );
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");
  link.href=url;
  link.download="language-teacher-backup.json";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  return backup;
}
