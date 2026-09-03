import test from 'node:test';
import assert from 'node:assert/strict';
import {BrowserRecorder} from '../src/speech/recorder.js';
import {BrowserSpeechRecognition} from '../src/speech/recognition.js';

test('cancelling while permission is pending stops the eventual microphone stream',async()=>{
  let grant,stopped=false;
  const nav=Object.getOwnPropertyDescriptor(globalThis,'navigator');
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{mediaDevices:{getUserMedia:()=>new Promise(resolve=>grant=resolve)}}});
  globalThis.MediaRecorder=class {};
  try{
    const recorder=new BrowserRecorder();
    const started=recorder.start();recorder.cancel();
    grant({getTracks:()=>[{stop:()=>stopped=true}]});
    await started;
    assert.equal(stopped,true);
    assert.equal(recorder.recorder,null);
  }finally{if(nav)Object.defineProperty(globalThis,'navigator',nav);else delete globalThis.navigator;delete globalThis.MediaRecorder;}
});

test('recorder constructor failure releases the microphone',async()=>{
  let stopped=false;
  const nav=Object.getOwnPropertyDescriptor(globalThis,'navigator');
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{mediaDevices:{getUserMedia:async()=>({getTracks:()=>[{stop:()=>stopped=true}]})}}});
  globalThis.MediaRecorder=class {constructor(){throw new Error('unsupported encoding');}};
  try{
    await assert.rejects(new BrowserRecorder().start(),/unsupported encoding/);
    assert.equal(stopped,true);
  }finally{if(nav)Object.defineProperty(globalThis,'navigator',nav);else delete globalThis.navigator;delete globalThis.MediaRecorder;}
});

test('recognition ending without a result resolves instead of hanging',async()=>{
  globalThis.SpeechRecognition=class extends EventTarget {start(){queueMicrotask(()=>this.dispatchEvent(new Event('end')));}};
  try{assert.deepEqual(await new BrowserSpeechRecognition().recognizeOnce(),{transcript:'',confidence:0});}
  finally{delete globalThis.SpeechRecognition;}
});
