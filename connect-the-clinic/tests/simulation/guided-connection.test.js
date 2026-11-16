import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,dispatch,derive,validateSave,createEvidence} from '../../dist/engine.js';

const copy=x=>JSON.parse(JSON.stringify(x));
function session(options={guidedIntro:true}){
 let game=createGame({campaignId:'guided-model-test',...options});
 return {
  get game(){return game;},get view(){return derive(game);},
  send(action){const result=dispatch(game,action);assert.equal(result.accepted,true,`${action.type}: ${result.code} — ${result.message}`);game=result.state;return result;},
  reject(action,code){const prior=JSON.stringify(game),r=dispatch(game,action);assert.equal(r.accepted,false);assert.equal(r.code,code);assert.equal(JSON.stringify(game),prior);return r;},
  restore(){const result=validateSave(JSON.stringify(game));assert.equal(result.valid,true,result.error);game=result.state;},
  device(roleId){return derive(game).devices.find(d=>d.roleId===roleId);},
  connect(fromRole='role.reception',toRole='infra.switch',toPort=2){const f=this.device(fromRole),t=this.device(toRole);return this.send({type:'CONNECT_PORTS',fromDeviceId:f.id,fromPortId:f.ports.find(p=>p.medium==='ethernet').id,toDeviceId:t.id,toPortId:t.ports.filter(p=>p.medium==='ethernet')[toPort-1].id});},
  test(){this.send({type:'RUN_PROBE',testId:'reception'});return this.view.guidedConnection.currentObservation;},
  explain(text='The cable removal interrupted the path. Reconnecting and testing showed service was restored.',oral=false){this.send({type:'SAVE_EXPLANATION',key:'repair',text,oral});},
  firstPass(){this.connect();assert.equal(this.test().pass,true);},
  experiment(){const id=this.view.guidedConnection.suggestedDisconnectCableId;assert.ok(id);this.send({type:'DISCONNECT_CABLE',cableId:id});return this.test();},
  complete(){this.firstPass();assert.equal(this.experiment().code,'PORT_DISCONNECTED');this.connect('role.reception','infra.switch',3);assert.equal(this.test().pass,true);this.explain();assert.equal(this.view.guidedConnection.canFinish,true);}
 };
}

test('GC01: guided fresh setup is powered, prepared, and distinct from default independent bootcamp',()=>{
 const h=session(),v=h.view;
 assert.equal(v.training.kind,'guided-connection');assert.equal(v.guidedConnection.phase,'connect');
 assert.equal(v.devices.length,3);assert.ok(v.devices.every(d=>d.powered));assert.equal(v.serverEnabled,true);assert.equal(v.cables.length,1);
 assert.deepEqual(v.attempt.training.practiceActions,[]);assert.ok(v.history.slice(0,8).every(e=>e.origin==='mission-setup'));
 assert.equal(h.test().code,'PORT_DISCONNECTED');assert.equal(h.view.guidedConnection.firstPass,null);
 assert.equal(h.view.economy.gross,0);assert.equal(h.game.wallet,0);h.restore();
 const ordinary=session({});assert.equal(ordinary.view.training.kind,'bootcamp');assert.equal(ordinary.view.guidedConnection,null);assert.equal(ordinary.device('role.reception'),undefined);
});

test('GC02: invalid ports reject atomically and a cable alone cannot finish or advance independent training',()=>{
 const h=session(),r=h.device('role.reception'),sw=h.device('infra.switch');
 h.reject({type:'CONNECT_PORTS',fromDeviceId:r.id,fromPortId:r.ports[0].id,toDeviceId:sw.id,toPortId:sw.ports[0].id},'PORT_OCCUPIED');
 h.reject({type:'FINISH_GUIDED_CONNECTION'},'GUIDED_INCOMPLETE');h.reject({type:'TRAINING_NEXT'},'TRAINING_ONLY');h.reject({type:'TRAINING_DEMO'},'TRAINING_ONLY');
 const result=h.connect();assert.match(result.message,/Reception.*Ethernet.*Network switch.*Ethernet 2/);
 assert.equal(h.view.guidedConnection.phase,'test');assert.equal(h.view.guidedConnection.currentObservation,null);assert.equal(h.view.guidedConnection.firstPass,null);
 h.explain('I clicked connect.');h.reject({type:'FINISH_GUIDED_CONNECTION'},'GUIDED_INCOMPLETE');
 assert.equal(h.test().code,'SERVICE_AVAILABLE');assert.equal(h.view.guidedConnection.phase,'experiment');
});

test('GC03: wrong address, unplugged link, stale observation and repaired service retain distinct causes',()=>{
 const h=session();h.connect();const r=h.device('role.reception');
 h.send({type:'SET_STATIC_ADDRESS',deviceId:r.id,address:'192.168.60.20',mask:'255.255.255.0'});assert.equal(h.test().code,'ADDRESS_WRONG_SUBNET');assert.equal(h.view.guidedConnection.firstPass,null);
 h.send({type:'SET_STATIC_ADDRESS',deviceId:r.id,address:h.view.network.receptionAddress,mask:h.view.network.mask});assert.equal(h.view.guidedConnection.currentObservation,null);assert.equal(h.test().pass,true);
 const first=h.view.guidedConnection.firstPass.id;h.send({type:'DISCONNECT_CABLE',cableId:h.view.guidedConnection.suggestedDisconnectCableId});
 assert.equal(h.view.guidedConnection.phase,'test-disconnected');assert.equal(h.view.guidedConnection.currentObservation,null);assert.equal(h.view.diagnostics.find(o=>o.id===first).stale,true);
 assert.equal(h.test().code,'PORT_DISCONNECTED');h.connect('role.reception','infra.switch',4);assert.equal(h.view.guidedConnection.canFinish,false);assert.equal(h.test().pass,true);h.explain();assert.equal(h.view.guidedConnection.canFinish,true);h.restore();
});

test('GC04: guided completion preserves actual explanation and starts independent work without checkpoint or money rewards',()=>{
 const h=session();h.complete();const guidedId=h.game.activeAttemptId,text=h.view.guidedConnection.explanation.text;
 const evidence=createEvidence(h.game);assert.match(evidence.text,/GUIDED CONNECTION EVIDENCE/);assert.match(evidence.text,/Trainer supplied/);assert.equal(evidence.json.readyForTeacherReview,true);
 assert.equal(evidence.json.guidedConnection.explanation.text,text);assert.equal(evidence.json.guidedConnection.independentMastery,false);
 h.send({type:'FINISH_GUIDED_CONNECTION'});assert.equal(h.view.training.kind,'bootcamp');assert.equal(h.view.training.stationIndex,0);assert.equal(h.device('role.reception'),undefined);assert.deepEqual(h.game.training.completed,[]);assert.deepEqual(h.game.training.history,[]);assert.equal(h.game.wallet,0);
 assert.equal(h.view.guidedConnectionCompleted,true);assert.equal(h.view.attempt.training.provenance.route,'after-guided-connection');
 const later=createEvidence(h.game);assert.equal(later.json.guidedConnectionHistory[0].attemptId,guidedId);assert.equal(later.json.guidedConnectionHistory[0].explanation.text,text);h.restore();
});

test('GC03 alternate: an existing wireless route honestly stays working after the tested Ethernet cable is removed',()=>{
 const h=session();h.send({type:'CHOOSE_DEVICE',roleId:'role.reception',kind:'laptop'});let r=h.device('role.reception');
 h.send({type:'POWER_DEVICE',deviceId:r.id,on:true});h.send({type:'ATTACH_ADAPTER',deviceId:r.id,kind:'ethernet-adapter'});h.send({type:'PLACE_DEVICE',deviceId:r.id,locationId:'location.exam-a'});
 h.send({type:'CHOOSE_DEVICE',roleId:'infra.ap',kind:'access-point'});const ap=h.device('infra.ap');h.send({type:'POWER_DEVICE',deviceId:ap.id,on:true});h.connect('infra.ap','infra.switch',3);
 h.send({type:'ASSOCIATE_WIFI',deviceId:r.id,apDeviceId:ap.id});h.connect();assert.equal(h.test().pass,true);
 assert.equal(h.experiment().pass,true);assert.equal(h.view.guidedConnection.experimentOutcome,'alternate-path');assert.equal(h.view.guidedConnection.phase,'reflect');assert.equal(h.view.guidedConnection.reconnection,null);
 h.explain('The laptop still had its Wi-Fi route through the access point. The fresh test showed that route.');assert.equal(h.view.guidedConnection.canFinish,true);
 assert.match(createEvidence(h.game).text,/No repair claimed: another actual path remained working/);h.restore();h.send({type:'FINISH_GUIDED_CONNECTION'});h.restore();
});

test('GC03 alternate: direct host connection and reversed free endpoints remain valid',()=>{
 const h=session();h.send({type:'DISCONNECT_CABLE',cableId:h.view.cables[0].id});h.connect('role.records','role.reception',1);assert.equal(h.test().pass,true);
 assert.equal(h.experiment().code,'PORT_DISCONNECTED');h.connect('role.reception','role.records',1);assert.equal(h.test().pass,true);h.explain('',true);assert.equal(h.view.guidedConnection.canFinish,true);h.restore();
 assert.match(createEvidence(h.game).text,/Oral explanation PENDING/);
});

test('GC04: repairing before the experiment probe cannot fabricate a missing-link observation; repeating the experiment recovers',()=>{
 const h=session();h.firstPass();h.send({type:'DISCONNECT_CABLE',cableId:h.view.guidedConnection.suggestedDisconnectCableId});h.connect('role.reception','infra.switch',3);assert.equal(h.test().pass,true);
 assert.equal(h.view.guidedConnection.experimentObservation,null);assert.equal(h.view.guidedConnection.phase,'experiment');h.explain('Repaired before testing.');h.reject({type:'FINISH_GUIDED_CONNECTION'},'GUIDED_INCOMPLETE');
 assert.equal(h.experiment().code,'PORT_DISCONNECTED');h.connect();h.test();h.explain();assert.equal(h.view.guidedConnection.canFinish,true);h.restore();
});

test('GC01/06: optional guided help, retry and return preserve a paid client attempt and its explanations byte-for-byte',()=>{
 const h=session({});h.send({type:'START_CLIENT_ATTEMPT',priorLearning:true});h.explain('Client repair explanation remains my own.');
 const q=h.view.guideQuotes[0];h.send({type:'GUIDE_CONSULT',sectionId:q.sectionId,quoteToken:q.quoteToken});
 const source=h.game.activeAttemptId,attempt=JSON.stringify(h.game.attempts[source]),contract=JSON.stringify(h.game.contract);
 h.send({type:'START_GUIDED_CONNECTION'});assert.equal(h.view.guidedConnection.returnAttemptId,source);assert.equal(h.view.economy.reserved,0);
 h.connect();h.send({type:'TRAINING_RETRY'});assert.equal(h.view.guidedConnection.returnAttemptId,source);assert.equal(h.view.cables.length,1);
 h.send({type:'RESTART_ACTIVE_ATTEMPT'});assert.equal(h.view.training.kind,'guided-connection');assert.equal(h.view.guidedConnection.returnAttemptId,source);
 h.restore();h.send({type:'RETURN_FROM_GUIDED_CONNECTION'});assert.equal(h.game.activeAttemptId,source);assert.equal(JSON.stringify(h.game.attempts[source]),attempt);assert.equal(JSON.stringify(h.game.contract),contract);assert.equal(h.view.economy.reserved,5);
 h.send({type:'START_GUIDED_CONNECTION'});h.complete();h.send({type:'FINISH_GUIDED_CONNECTION'});assert.equal(h.game.activeAttemptId,source);assert.equal(JSON.stringify(h.game.attempts[source]),attempt);assert.equal(JSON.stringify(h.game.contract),contract);h.restore();
});

test('GC07: explicit beginner bypass grants no guided or bootcamp completion',()=>{
 const h=session();h.send({type:'RETURN_FROM_GUIDED_CONNECTION'});assert.equal(h.view.training.kind,'bootcamp');assert.equal(h.view.attempt.training.provenance.route,'guided-connection-skipped');assert.equal(h.view.guidedConnectionCompleted,false);assert.equal(h.game.guidedConnectionHistory,undefined);assert.deepEqual(h.game.training.completed,[]);h.restore();
});

test('GC04/06: damaged milestone witnesses, false provenance, return targets and completion cannot be imported',()=>{
 const h=session();h.complete();const clean=copy(h.game),id=clean.activeAttemptId;
 const damages=[
  g=>{g.attempts[id].guidedConnection.firstPassId='attempt.0001.observation.9999';},
  g=>{g.attempts[id].guidedConnection.firstPassWitness.serverEnabled=false;},
  g=>{g.attempts[id].events.find(e=>e.id===g.attempts[id].guidedConnection.firstConnection.eventId).origin='mission-setup';},
  g=>{g.attempts[id].guidedConnection.experimentWitness.cables=[];},
  g=>{g.attempts[id].guidedConnection.disconnection.technicalRevision++;},
  g=>{g.attempts[id].guidedConnection.returnAttemptId='attempt.9999';},
  g=>{g.attempts[id].guidedConnection.setup.devices[g.attempts[id].guidedConnection.firstConnection.fromDeviceId].powered=false;},
  g=>{g.attempts[id].guidedConnection.finishedEventId=g.attempts[id].guidedConnection.startEventId;},
  g=>{g.guidedConnectionHistory=[id];}
 ];
 for(const damage of damages){const g=copy(clean);damage(g);assert.equal(validateSave(g).valid,false,'Damaged guided save must fail');}
 assert.deepEqual(h.game,clean);h.restore();
});

test('GC04: repeated unchanged tests preserve explanation, while real configuration changes require current explanation context',()=>{
 const h=session();h.complete();h.test();assert.equal(h.view.guidedConnection.canFinish,true);h.restore();
 const r=h.device('role.reception');h.send({type:'POWER_DEVICE',deviceId:r.id,on:false});assert.equal(h.view.guidedConnection.canFinish,false);h.send({type:'POWER_DEVICE',deviceId:r.id,on:true});h.test();assert.equal(h.view.guidedConnection.canFinish,false);h.explain();assert.equal(h.view.guidedConnection.canFinish,true);h.restore();
});

test('GC04: compacted events, long later practice and bounded completed history retain honest guided evidence',()=>{
 const h=session();h.complete();const originalId=h.game.activeAttemptId;
 for(let i=0;i<430;i++)h.send({type:'REVEAL_HINT',sectionId:'guide.devices-paths',tier:1});
 for(let i=0;i<185;i++)h.test();
 assert.equal(h.view.guidedConnection.canFinish,true);h.restore();h.send({type:'FINISH_GUIDED_CONNECTION'});
 for(let i=0;i<20;i++)h.send({type:'TRAINING_RETRY'});
 assert.ok(h.game.attempts[originalId]);assert.equal(createEvidence(h.game).json.guidedConnectionHistory[0].attemptId,originalId);h.restore();
 for(let i=0;i<4;i++){h.send({type:'START_GUIDED_CONNECTION'});h.complete();h.send({type:'FINISH_GUIDED_CONNECTION'});}
 assert.equal(h.game.guidedConnectionHistory.length,4);assert.ok(!h.game.guidedConnectionHistory.includes(originalId));h.restore();
});
