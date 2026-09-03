import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../sw.js',import.meta.url),'utf8');
function worker(overrides={}){
  const handlers={};
  const self={registration:{scope:'https://example.com/Language-Teacher/'},clients:{claim:async()=>{}},addEventListener:(name,fn)=>handlers[name]=fn};
  vm.runInNewContext(source,{self,URL,Response,fetch:async()=>{throw new TypeError('Offline');},...overrides});
  return handlers;
}

test('activation removes only previous Language Teacher caches',async()=>{
  const removed=[];const h=worker({caches:{keys:async()=>['other-app-cache','language-teacher-shell-v28','language-teacher-shell-v29'],delete:async key=>removed.push(key)}});
  let done;h.activate({waitUntil:p=>done=p});await done;
  assert.deepEqual(removed,['language-teacher-shell-v28']);
});

test('offline navigation and update query use the installed cached shell',async()=>{
  const h=worker({caches:{open:async()=>({match:async key=>new Response(key)})}});
  async function request(url,mode){let result;h.fetch({request:{method:'GET',url,mode},respondWith:p=>result=p});return result&&(await (await result).text());}
  assert.equal(await request('https://example.com/Language-Teacher/?check-update=1','navigate'),'./index.html');
  assert.equal(await request('https://example.com/Language-Teacher/update.json?ts=123','cors'),'./update.json');
  assert.equal(await request('https://example.com/Language-Teacher/api/health','cors'),undefined);
  assert.equal(await request('https://other.example/data','cors'),undefined);
});
