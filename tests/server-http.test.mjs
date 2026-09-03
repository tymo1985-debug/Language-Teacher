import test from 'node:test';
import assert from 'node:assert/strict';
import {createLanguageTeacherServer} from '../server/server.mjs';

test('HTTP server handles malformed paths, protected files, CORS and missing AI configuration',async()=>{
  const server=createLanguageTeacherServer();
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const base=`http://127.0.0.1:${server.address().port}`;
  try{
    assert.equal((await fetch(`${base}/%ZZ`)).status,400);
    for(const file of ['.env','src/.secret','server/server.mjs','tests/persistence.test.mjs','package.json']){
      assert.equal((await fetch(`${base}/${file}`)).status,404,file);
    }
    assert.equal((await fetch(base)).status,200);
    assert.equal((await fetch(`${base}/api/health`)).status,200);
    const denied=await fetch(`${base}/api/teacher`,{method:'POST',headers:{Origin:'https://untrusted.example','Content-Type':'application/json'},body:'{"context":{}}'});
    assert.equal(denied.status,403);
    const malformed=await fetch(`${base}/api/teacher`,{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'{'});
    assert.equal(malformed.status,400);
    const response=await fetch(`${base}/api/teacher`,{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'{"context":{}}'});
    assert.equal(response.status,503);
  }finally{await new Promise(resolve=>server.close(resolve));}
});
