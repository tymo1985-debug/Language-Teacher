import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import {LANGUAGE_CATALOG,SELF_ASSESSMENT} from '../src/language/language-catalog.js';
import {createLanguageProfile,removeLanguageProfile,listLanguageProfiles} from '../src/language/profile-engine.js';
import {prepareRealLifeHelp,saveRealLifeMaterial} from '../src/learning/real-life-engine.js';
import {getLearningSummary} from '../src/learning/learning-repository.js';
import {buildReviewQueue,recordReview} from '../src/learning/review-engine.js';
import {setLocale} from '../src/i18n/i18n.js';
import {renderHeader} from '../src/ui/components/app-header.js';
import {renderSettings} from '../src/ui/screens/settings.js';
import {renderTeacher} from '../src/ui/screens/teacher.js';
import {renderConversation} from '../src/ui/screens/conversation.js';
import {renderProgress} from '../src/ui/screens/progress.js';
import {renderWords} from '../src/ui/screens/words.js';
import {renderRealLife} from '../src/ui/screens/real-life.js';
import {renderReview} from '../src/ui/screens/review.js';
import {renderSpeech} from '../src/ui/screens/speech.js';
import {renderToday} from '../src/ui/screens/today.js';
import {renderPractice} from '../src/ui/screens/practice.js';
import {renderSession} from '../src/ui/screens/session.js';

test('all nine languages can save a phrase, review it and recover hidden profiles',async()=>{
  for(const language of LANGUAGE_CATALOG){
    const profile=await createLanguageProfile({languageId:language.id,goals:['travel'],selfAssessment:SELF_ASSESSMENT[0]});
    const result=await prepareRealLifeHelp({languageProfile:profile,description:'Хочу заказать кофе'});
    assert.ok(result.phrase);
    await saveRealLifeMaterial({languageProfile:profile,result});
    const queue=await buildReviewQueue(language.id);assert.equal(queue.length,1);
    await recordReview({item:queue[0].item,dimension:queue[0].exercise.dimension,rating:'good'});
    assert.equal((await buildReviewQueue(language.id)).length,0);
    const summary=await getLearningSummary(language.id);
    assert.equal(summary.learningItems,1);assert.equal(summary.situations,1);assert.equal(summary.reviews,1);
    await removeLanguageProfile(language.id);
    assert.ok(!(await listLanguageProfiles()).some(p=>p.languageId===language.id));
    await createLanguageProfile({languageId:language.id,goals:[],selfAssessment:SELF_ASSESSMENT[0]});
    assert.equal((await getLearningSummary(language.id)).learningItems,1);
  }
});

test('all screens render populated learning data in each supported UI language',async()=>{
  const profiles=await listLanguageProfiles();
  const summary=await getLearningSummary('cs');
  for(const locale of ['ru','en','uk']){
    setLocale(locale);
    const state={settings:{interfaceLanguage:locale},route:'today',online:true,languageProfiles:profiles,activeLanguageId:'cs',learningSummary:summary,ai:{providers:[],remote:false},speech:{capabilities:{}},conversation:{},realLife:{},reviewQueue:[],sessionHistory:[]};
    for(const render of [renderHeader,renderSettings,renderTeacher,renderConversation,renderProgress,renderWords,renderRealLife,renderReview,renderSpeech,renderToday,renderPractice,renderSession]){
      const html=render(state);assert.equal(typeof html,'string');assert.ok(html.length>20);
      assert.ok(!/>undefined</.test(html),`${locale}: ${render.name}`);
    }
  }
});
