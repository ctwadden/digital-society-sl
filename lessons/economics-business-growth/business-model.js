// All quantities are authored teaching assumptions in fictional dollars per round.
export const strategies={
 core:{label:'Stay with the core shop',demand:100,goods:10,delivery:2,hours:20,capacity:100,fixed:100,setup:0,note:'Sell notebooks through the existing shop.'},
 horizontal:{label:'Horizontal · add pens',demand:120,goods:10,delivery:2,hours:20,capacity:100,fixed:120,setup:300,note:'A complementary product attracts more orders; the same packing team remains the bottleneck.'},
 vertical:{label:'Vertical · own delivery',demand:100,goods:10,delivery:.8,hours:28,capacity:120,fixed:180,setup:1200,note:'Delivery cost per order falls; paid hours and fixed commitments rise. Drivers are included in paid hours.'},
 concentric:{label:'Concentric · school kits',demand:110,goods:9,delivery:2,hours:24,capacity:110,fixed:130,setup:500,note:'Use existing stationery expertise to serve school bulk buyers; these assumed orders have simpler goods costs.'},
 conglomerate:{label:'Conglomerate · repair bikes',demand:100,goods:10,delivery:2,hours:28,capacity:100,fixed:160,setup:900,note:'Retain the shop and open an unrelated repair service: 5 repairs, $30 each, $12 parts each, 8 paid hours included.'}
};
export function businessResult(strategy='core',policy='standard',event='normal'){
 if(!strategies[strategy]||!['standard','pay','pace'].includes(policy)||!['normal','supplier','demand'].includes(event))throw Error('Unknown model choice');
 const s=strategies[strategy],wage=policy==='pay'?24:20,capacity=Math.floor(s.capacity*(policy==='pace'?.9:1)),demand=s.demand+(event==='demand'?30:0),supply=event==='supplier'?70:200,orders=Math.min(demand,capacity,supply),repairs=strategy==='conglomerate'?5:0;
 const revenue=orders*20+repairs*30,goods=orders*s.goods+repairs*12,delivery=orders*s.delivery,payroll=s.hours*wage,surplus=revenue-goods-delivery-payroll-s.fixed;
 return {strategy,policy,event,orders,unfilled:demand-orders,capacity,supply,revenue,goods,delivery,payroll,hours:s.hours,wage,fixed:s.fixed,surplus,setup:s.setup,firstRoundCash:surplus-s.setup,repairs};
}
