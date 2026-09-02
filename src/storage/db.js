import {DB_NAME,DB_VERSION,STORES,DEFAULT_USER_ID} from "./schema.js";
import {applyMigrations} from "./migrations.js";
let dbPromise=null;
export function openDatabase(){if(dbPromise)return dbPromise;dbPromise=new Promise((resolve,reject)=>{const request=indexedDB.open(DB_NAME,DB_VERSION);request.onupgradeneeded=e=>applyMigrations(request.result,e.oldVersion);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>console.warn("IndexedDB upgrade blocked.");});return dbPromise;}
async function tx(storeName,mode,action){const db=await openDatabase();return new Promise((resolve,reject)=>{const transaction=db.transaction(storeName,mode);const request=action(transaction.objectStore(storeName));request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);transaction.onerror=()=>reject(transaction.error);});}
function check(name){if(!Object.values(STORES).includes(name))throw new Error(`Unknown store: ${name}`);}
export async function getSetting(key){const r=await tx(STORES.settings,"readonly",s=>s.get(key));return r?.value;}
export async function setSetting(key,value){return tx(STORES.settings,"readwrite",s=>s.put({id:key,value,updatedAt:new Date().toISOString()}));}
export async function putRecord(name,record){check(name);return tx(name,"readwrite",s=>s.put(record));}
export async function getRecord(name,id){check(name);return tx(name,"readonly",s=>s.get(id));}
export async function getAllRecords(name){check(name);return tx(name,"readonly",s=>s.getAll());}
export async function deleteRecord(name,id){check(name);return tx(name,"readwrite",s=>s.delete(id));}
export async function listRecords(name,predicate=()=>true){return (await getAllRecords(name)).filter(predicate);}
export async function countRecords(name,predicate=()=>true){return (await listRecords(name,predicate)).length;}
export async function ensureLocalUser(){const current=await getRecord(STORES.users,DEFAULT_USER_ID);if(current)return current;const now=new Date().toISOString();const user={id:DEFAULT_USER_ID,displayName:"",interfaceLanguage:"ru",activeLanguageId:null,createdAt:now,updatedAt:now};await putRecord(STORES.users,user);return user;}
