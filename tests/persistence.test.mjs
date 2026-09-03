import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import {ensureTodaySession,advanceSession} from '../src/learning/session-engine.js';
import {startConversation,continueConversation,getActiveConversation,finishConversation} from '../src/learning/conversation-engine.js';
import {listSessions} from '../src/learning/learning-repository.js';
import {getAllRecords,putRecord} from '../src/storage/db.js';
import {createBackup} from '../src/storage/backup.js';
import {restoreBackup,validateBackup} from '../src/storage/restore.js';
const profile={languageId:'cs',name:'Čeština',goals:[],skills:{}};

test('daily session survives reopening, advancing and completing',async()=>{
  const first=await ensureTodaySession(profile);
  assert.match(first.dayKey,/^\d{4}-\d{2}-\d{2}$/);
  assert.equal((await ensureTodaySession(profile)).id,first.id);
  let current=await advanceSession(first);
  assert.equal((await ensureTodaySession(profile)).blocks[0].status,'completed');
  while(current.status!=='completed')current=await advanceSession(current);
  const reopened=await ensureTodaySession(profile);
  assert.equal(reopened.id,first.id);
  assert.equal(reopened.status,'completed');
});

test('concurrent daily session requests create only one session',async()=>{
  const p={...profile,languageId:'fr'};
  const sessions=await Promise.all([ensureTodaySession(p),ensureTodaySession(p),ensureTodaySession(p)]);
  assert.equal(new Set(sessions.map(s=>s.id)).size,1);
  assert.equal((await listSessions('fr')).length,1);
});

test('conversation starts, replies, resumes and finishes in the real store',async()=>{
  const first=await startConversation({languageProfile:profile,scenarioId:'cafe'});
  assert.ok(first.id);
  assert.equal(first.userId,'local-user');
  assert.equal(first.mode,'conversation');
  assert.equal(first.turns.length,1);
  const {conversation}=await continueConversation({conversation:first,languageProfile:profile,userText:'Dám si kávu, prosím.'});
  assert.equal(conversation.turns.length,3);
  assert.equal((await getActiveConversation('cs')).id,first.id);
  await finishConversation(conversation);
  assert.equal(await getActiveConversation('cs'),null);
});

test('backup round trip preserves learning records',async()=>{
  const backup=await createBackup();
  assert.equal(validateBackup(backup).valid,true);
  await restoreBackup(backup);
  assert.deepEqual(await getAllRecords('sessions'),backup.data.sessions);
});

test('partial and invalid-key backups are rejected without deleting existing data',async()=>{
  await putRecord('settings',{id:'preserved',value:'yes'});
  const backup=await createBackup();
  const partial=structuredClone(backup); delete partial.data.sessions;
  await assert.rejects(restoreBackup(partial));
  const bad=structuredClone(backup); bad.data.settings.push({id:true});
  await assert.rejects(restoreBackup(bad));
  assert.deepEqual(await getAllRecords('settings'),backup.data.settings);
});

test('failed restore rolls back every store including earlier writes',async()=>{
  const backup=await createBackup();
  const bad=structuredClone(backup);
  bad.data.settings=[{id:'uncloneable',value:()=>{}}];
  await assert.rejects(restoreBackup(bad));
  assert.deepEqual(await getAllRecords('sessions'),backup.data.sessions);
  assert.deepEqual(await getAllRecords('settings'),backup.data.settings);
});
