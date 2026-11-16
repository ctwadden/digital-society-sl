import {createGame,dispatch,derive} from '../../dist/engine.js';
export function act(g,type,rest={}){const r=dispatch(g,{type,...rest});if(!r.accepted)throw new Error(`${type}: ${r.code} ${r.message}`);return r.state;}
export const device=(g,roleId)=>derive(g).devices.find(d=>d.roleId===roleId);
export function connect(g,roleId,switchPort){const d=device(g,roleId),sw=device(g,'infra.switch');return act(g,'CONNECT_PORTS',{fromDeviceId:d.id,fromPortId:d.ports.find(p=>p.medium==='ethernet').id,toDeviceId:sw.id,toPortId:sw.ports.filter(p=>p.medium==='ethernet')[switchPort-1].id});}
export function provision(g,roleId,kind){g=act(g,'CHOOSE_DEVICE',{roleId,kind});return act(g,'POWER_DEVICE',{deviceId:device(g,roleId).id,on:true});}
export function client(options={}){return equipClinic(act(createGame({campaignId:'campaign.fixture'}),'START_CLIENT_ATTEMPT',{priorLearning:true}),options);}
export function clinicPractice(options={}){return equipClinic(act(createGame({campaignId:'campaign.practice.fixture'}),'START_CLINIC_PRACTICE'),options);}
export function equipClinic(g,{route='A',repair=true,policy='policy.roles-separated',markers=true,explanations=true,tests=true}={}){
 const pairs=[['role.reception',route==='A'?'desktop':'laptop'],['role.nurse',route==='A'?'tablet':'laptop'],['role.monitor','wearable'],['role.records',route==='A'?'server':'desktop'],['infra.switch',route==='A'?'switch4':'switch8'],['infra.ap','access-point']];
 for(const [r,k]of pairs)g=provision(g,r,k);
 if(route==='B')g=act(g,'ATTACH_ADAPTER',{deviceId:device(g,'role.reception').id,kind:'ethernet-adapter'});
 for(const [r,p]of [['role.records',1],['role.reception',2],['infra.ap',3]])g=connect(g,r,p);
 g=act(g,'ASSOCIATE_WIFI',{deviceId:device(g,'role.nurse').id,apDeviceId:device(g,'infra.ap').id});g=act(g,'SET_SERVICE_STATE',{enabled:true});
 if(repair)g=act(g,'SET_STATIC_ADDRESS',{deviceId:device(g,'role.nurse').id,address:'10.40.10.31',mask:'255.255.255.0'});
 g=act(g,'SET_PERMISSIONS',{policyId:policy});
 if(markers){g=act(g,'RUN_COLLECTION_CHECK');g=act(g,'RETURN_WEARABLE');g=act(g,'ATTACH_ADAPTER',{deviceId:device(g,'role.nurse').id,kind:'sensor-dock'});g=act(g,'HANDOFF_MARKERS');if(repair&&['policy.roles-separated','policy.nurse-also-books'].includes(policy))g=act(g,'UPLOAD_MARKERS');}
 if(explanations)for(const key of ['equipment','repair','privacy','limitations'])g=act(g,'SAVE_EXPLANATION',{key,text:`Student explanation of ${key}.`,oral:false});
 if(tests)g=act(g,'RUN_PROBE',{testId:'all'});return g;
}
export function completeTrainingStage(g){
 const t=derive(g).training;
 if(t.stationIndex===0){g=provision(g,'role.reception',t.phase==='transfer'?'laptop':'desktop');if(t.phase==='transfer')g=act(g,'ATTACH_ADAPTER',{deviceId:device(g,'role.reception').id,kind:'ethernet-adapter'});g=connect(g,'role.records',1);g=connect(g,'role.reception',2);g=act(g,'RUN_PROBE',{testId:'reception'});}
 if(t.stationIndex===1){g=act(g,'RUN_PROBE',{testId:'nurse'});if(t.transferKind==='physical-uplink')g=connect(g,'infra.ap',3);else g=act(g,'SET_STATIC_ADDRESS',{deviceId:device(g,'role.nurse').id,address:derive(g).network.base+'.31',mask:'255.255.255.0'});g=act(g,'RUN_PROBE',{testId:'nurse'});if(t.transferKind==='physical-uplink')g=act(g,'SAVE_EXPLANATION',{key:'repair',text:'The address identifies the nurse on this subnet. It cannot replace the unplugged physical path, so I reconnected the access point and then retested.',oral:false});}
 if(t.stationIndex===2){g=act(g,'SET_PERMISSIONS',{policyId:t.phase==='transfer'?'policy.nurse-also-books':'policy.roles-separated'});g=act(g,'RUN_COLLECTION_CHECK');g=act(g,'RETURN_WEARABLE');g=act(g,'ATTACH_ADAPTER',{deviceId:device(g,'role.nurse').id,kind:'sensor-dock'});g=act(g,'HANDOFF_MARKERS');g=act(g,'UPLOAD_MARKERS');g=act(g,'RUN_PROBE',{testId:'access'});g=act(g,'SAVE_EXPLANATION',{key:'privacy',text:'My chosen policy changes who can do bookings. I would review staffing needs with reception and the nurse.',oral:false});}
 return g;
}
