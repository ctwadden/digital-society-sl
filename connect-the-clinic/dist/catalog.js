/** Original teaching catalog. Specifications are scenario capabilities, not commercial products. */
export const BUILD_VERSION = '0.6.0';
export const SCHEMA_VERSION = 1;
export const SERVICES = ['service.bookings','service.workspace','service.marker-intake'];
export const ROLE_IDS = ['role.reception','role.nurse','role.monitor','role.records','infra.switch','infra.ap'];
export const ROLES = {
 'role.reception':{label:'Reception',location:'location.reception',description:'Bookings at a fixed desk',choices:['desktop','laptop','tablet']},
 'role.nurse':{label:'Mobile nurse',location:'location.exam-a',description:'Use the workspace in both clinic rooms',choices:['tablet','laptop','desktop']},
 'role.monitor':{label:'Home monitor',location:'location.home',description:'Collect and store seven day markers at home',choices:['wearable','tablet']},
 'role.records':{label:'Central records',location:'location.equipment',description:'Provide shared services to other computers',choices:['server','desktop','laptop']},
 'infra.switch':{label:'Network switch',location:'location.equipment',description:'Join the wired network',choices:['switch4','switch8']},
 'infra.ap':{label:'Wireless access point',location:'location.equipment',description:'Bridge the nurse’s Wi-Fi into the wired LAN',choices:['access-point']}
};
export const LOCATIONS = [
 {id:'location.reception',label:'Reception'},{id:'location.exam-a',label:'Exam room A'},
 {id:'location.exam-b',label:'Exam room B'},{id:'location.equipment',label:'Equipment room'},
 {id:'location.home',label:'At home (outside clinic coverage)'}
];
export const CATALOG = {
 desktop:{id:'desktop',label:'Desktop computer',description:'A fixed workstation with a full keyboard, screen and Ethernet.',capabilities:['text-input','screen','booking-ui','workspace-ui','server-host','ethernet','usb-host'],ethernet:1,wifi:false,portable:false,assetId:'asset.device.desktop',ipos:{input:'Keyboard and mouse',process:'Processor follows software instructions',store:'Local storage retains software and files',output:'Screen displays the result'},tradeoff:'Comfortable for a fixed desk; inconvenient to carry between rooms.'},
 laptop:{id:'laptop',label:'Laptop computer',description:'Portable keyboard and screen; Wi-Fi built in. Wired Ethernet needs an adapter.',capabilities:['text-input','screen','booking-ui','workspace-ui','server-host','wifi','portable','usb-host','sensor-companion'],ethernet:0,wifi:true,portable:true,assetId:'asset.device.laptop',ipos:{input:'Keyboard, touchpad and connected devices',process:'Processor runs applications',store:'Local storage',output:'Screen and sound'},tradeoff:'Useful for detailed typing on the move; bulkier than a tablet.'},
 tablet:{id:'tablet',label:'Tablet computer',description:'Light portable touchscreen with Wi-Fi; supports a compatible sensor dock.',capabilities:['text-input','screen','booking-ui','workspace-ui','wifi','portable','usb-host','sensor-companion'],ethernet:0,wifi:true,portable:true,assetId:'asset.device.tablet',ipos:{input:'Touchscreen and connected devices',process:'Processor runs applications',store:'Local flash storage',output:'Touchscreen display'},tradeoff:'Easy to carry; extended typing can be less convenient.'},
 wearable:{id:'wearable',label:'Wearable computer',description:'Collects and stores synthetic day markers offline; transfers through a sensor dock.',capabilities:['wearable','collect-test-markers','store-offline','sensor-transfer'],ethernet:0,wifi:false,portable:true,assetId:'asset.device.wearable',ipos:{input:'Simulated sensor input',process:'Processor organizes day markers',store:'Seven nonclinical markers stored locally',output:'Status display and dock transfer'},tradeoff:'Fits a small collection task; it cannot replace a general workstation.'},
 server:{id:'server',label:'Small server',description:'A dedicated host for shared booking, workspace and marker-intake services.',capabilities:['server-host','ethernet','usb-host'],ethernet:1,wifi:false,portable:false,assetId:'asset.device.server',ipos:{input:'Requests arriving through the network',process:'Service software processes requests',store:'Shared application storage',output:'Responses to authorized clients'},tradeoff:'Dedicated support for shared services; needs maintenance and a suitable location.'},
 switch4:{id:'switch4',label:'4-port switch',description:'Four usable Ethernet ports bridge local devices.',capabilities:['bridge','ethernet'],ethernet:4,wifi:false,portable:false,assetId:'asset.device.switch4',tradeoff:'Enough for this clinic with one spare port; limited expansion.'},
 switch8:{id:'switch8',label:'8-port switch',description:'Eight usable Ethernet ports bridge local devices.',capabilities:['bridge','ethernet'],ethernet:8,wifi:false,portable:false,assetId:'asset.device.switch8',tradeoff:'More expansion capacity; extra equipment capacity may be unnecessary.'},
 'access-point':{id:'access-point',label:'Wireless access point',description:'One Ethernet uplink and a radio covering exam rooms A and B.',capabilities:['bridge','ethernet','wifi-ap'],ethernet:1,wifi:true,portable:false,assetId:'asset.device.access-point',tradeoff:'Supports movement inside the modelled clinic; it does not provide home connectivity.'}
};
export const ATTACHMENTS = {
 'ethernet-adapter':{id:'ethernet-adapter',label:'Ethernet adapter',description:'Adds one host-controlled Ethernet port to a compatible laptop or tablet.'},
 'sensor-dock':{id:'sensor-dock',label:'Sensor transfer dock',description:'Transfers returned wearable markers to the nurse companion. It is not an Ethernet adapter.'}
};
export const POLICIES = {
 'policy.roles-separated':{id:'policy.roles-separated',label:'Separate responsibilities',description:'Reception books; nurses use the clinical workspace.',matrix:{'role.reception':['service.bookings'],'role.nurse':['service.workspace'],'role.monitor-transfer':['service.marker-intake'],'role.outsider':[]}},
 'policy.nurse-also-books':{id:'policy.nurse-also-books',label:'Nurse also books',description:'Nurses may arrange follow-ups as well as use the workspace.',matrix:{'role.reception':['service.bookings'],'role.nurse':['service.bookings','service.workspace'],'role.monitor-transfer':['service.marker-intake'],'role.outsider':[]}},
 'policy.broad-access':{id:'policy.broad-access',label:'Open access (explore consequences)',description:'All simulated roles can use every service.',matrix:Object.fromEntries(['role.reception','role.nurse','role.monitor-transfer','role.outsider'].map(r=>[r,[...SERVICES]]))},
 'policy.deny-all':{id:'policy.deny-all',label:'Block every role (explore consequences)',description:'No simulated role can use a service.',matrix:Object.fromEntries(['role.reception','role.nurse','role.monitor-transfer','role.outsider'].map(r=>[r,[]]))}
};
export const GUIDE_SECTIONS = [
 {id:'guide.devices-paths',label:'Devices and paths',articles:['guide.equipment','guide.connections']},
 {id:'guide.addressing-diagnosis',label:'Addressing and diagnosis',articles:['guide.addressing','guide.diagnostics']},
 {id:'guide.access-handover',label:'Access and handover',articles:['guide.access','guide.transfer-handover']}
];
export const STATIONS = [
 {id:'bootcamp.station.equipment-connections',title:'Equipment and connections',goal:'Choose a reception computer, connect it and the server to the switch, and test bookings.'},
 {id:'bootcamp.station.address-diagnosis',title:'Addresses and diagnosis',goal:'Test the nurse connection, inspect its address, change the setting and retest.'},
 {id:'bootcamp.station.access-handover',title:'Access, people and handover',goal:'Choose a responsible access policy, complete the wearable journey, test access and explain the decision.'}
];
export const EXPLANATION_KEYS = ['equipment','repair','privacy','limitations'];
