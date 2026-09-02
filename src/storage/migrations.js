import {STORES} from "./schema.js";
function ensureStore(db,name){if(!db.objectStoreNames.contains(name))db.createObjectStore(name,{keyPath:"id"});}
export function applyMigrations(db,oldVersion){
  if(oldVersion<1)Object.values(STORES).forEach(name=>ensureStore(db,name));
  if(oldVersion<2)ensureStore(db,STORES.languageProfiles);
  if(oldVersion<3)[STORES.learningItems,STORES.mistakes,STORES.sessions,STORES.progress,STORES.situations].forEach(name=>ensureStore(db,name));
  Object.values(STORES).forEach(name=>ensureStore(db,name));
}
