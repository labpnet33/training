var e=[{title:{en:`Redistributed, but nothing arrives`,hi:`Redistribute kiya, lekin kuch nahi pahuncha`},ticket:{en:`After the merger change window, Delhi users still cannot reach Bengaluru. The engineer says OSPF is redistributed into EIGRP on BR1 and BR2. You collect this.`,hi:`Merger change window ke baad bhi Delhi users Bengaluru tak nahi pahunch paate. Engineer kehta hai ki BR1 aur BR2 par OSPF ko EIGRP mein redistribute kiya gaya hai. Aap yeh collect karte ho.`},out:`BR1#show running-config | section router eigrp
router eigrp 100
 network 10.1.1.2 0.0.0.0
 redistribute ospf 1
 eigrp router-id 1.1.1.1

BR1#show ip protocols | include Redistributing
  Redistributing: ospf 1

BR1#show ip route 10.200.10.0 | include Known
  Known via "ospf 1", distance 110, metric 2, type intra area

E1#show ip route 10.200.10.0
% Subnet not in table`,q:{en:`What is the root cause?`,hi:`Root cause kya hai?`},o:[{en:`No seed metric: EIGRP treats the OSPF routes as unreachable`,hi:`Seed metric nahi: EIGRP OSPF routes ko unreachable maanta hai`},{en:`The subnets keyword is missing on the redistribute command`,hi:`Redistribute command par subnets keyword missing hai`},{en:`BR1 does not have the Bengaluru route installed from OSPF`,hi:`BR1 par Bengaluru route OSPF se installed nahi hai`},{en:`Split horizon on E1 blocks the route`,hi:`E1 par split horizon route block karta hai`}],a:0,w:{en:`BR1 has the route as OSPF and shows "Redistributing: ospf 1", yet E1 has nothing. Into EIGRP, routes from another routing protocol need a seed metric (metric, default-metric or set metric). The subnets keyword applies to OSPF, not EIGRP. Add metric 100000 100 255 1 1500 on both boundary routers.`,hi:`BR1 ke paas route OSPF ki tarah hai aur "Redistributing: ospf 1" dikhta hai, phir bhi E1 ke paas kuch nahi. EIGRP mein doosre routing protocol ke routes ko seed metric chahiye (metric, default-metric ya set metric). subnets keyword OSPF ke liye hai, EIGRP ke liye nahi. Dono boundary routers par metric 100000 100 255 1 1500 jodo.`}},{title:{en:`The partner network takes the scenic route`,hi:`Partner network ghoom kar jaata hai`},ticket:{en:`Mutual redistribution with tags is running. Users report high latency from services behind BR1 to the Delhi partner network 192.168.50.0/24. On BR1 you see this.`,hi:`Tags ke saath mutual redistribution chal raha hai. Users BR1 ke peeche ki services se Delhi partner network 192.168.50.0/24 tak high latency report karte hain. BR1 par aap yeh dekhte ho.`},out:`BR1#traceroute 192.168.50.1
Tracing the route to 192.168.50.1
  1 10.2.1.1 1 msec 1 msec 1 msec
  2 10.2.2.2 1 msec 2 msec 1 msec
  3 10.1.2.1 2 msec *  2 msec

BR1#show ip route 192.168.50.0
Routing entry for 192.168.50.0/24
  Known via "ospf 1", distance 110, metric 20
  Tag 90, type extern 2, forward metric 2
  Redistributing via eigrp 100
  Routing Descriptor Blocks:
  * 10.2.1.1, from 2.2.2.2, 00:12:40 ago, via GigabitEthernet0/1
      Route metric is 20, traffic share count is 1
      Route tag 90

BR1#show ip eigrp topology 192.168.50.0/24 | include metric|External
      Composite metric is (130816/128256), route is External
        External protocol is Connected, external metric is 0`,q:{en:`What is the correct fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Add route maps that deny tag 90 into EIGRP`,hi:`Tag 90 ko EIGRP mein deny karne wale route maps jodo`},{en:`Lower the EIGRP seed metric on BR2`,hi:`BR2 par EIGRP seed metric kam karo`},{en:`Configure distance ospf external 171 on BR1 and BR2`,hi:`BR1 aur BR2 par distance ospf external 171 configure karo`},{en:`Change the OSPF cost on BR1 GigabitEthernet0/1`,hi:`BR1 GigabitEthernet0/1 par OSPF cost badlo`}],a:2,w:{en:`The EIGRP external copy (AD 170) is still in the topology table, but the O E2 copy from BR2 (AD 110) wins. Tags already exist and only stop feedback. Raising OSPF external AD to 171 on both boundary routers lets D EX win and restores BR1 as a redistribution point.`,hi:`EIGRP external copy (AD 170) topology table mein ab bhi hai, lekin BR2 se aayi O E2 copy (AD 110) jeet jaati hai. Tags pehle se hain aur sirf feedback rokte hain. Dono boundary routers par OSPF external AD 171 karne se D EX jeetta hai aur BR1 phir se redistribution point ban jaata hai.`}},{title:{en:`Only one Bengaluru LAN in Delhi`,hi:`Delhi mein sirf ek Bengaluru LAN`},ticket:{en:`Delhi users can reach 10.200.1.1 but not the Bengaluru users' LAN 10.200.10.0/24 or 10.200.2.0/24. BR1 and BR2 have identical configurations.`,hi:`Delhi users 10.200.1.1 tak pahunch sakte hain lekin Bengaluru users ke LAN 10.200.10.0/24 ya 10.200.2.0/24 tak nahi. BR1 aur BR2 ki configurations identical hain.`},out:`E1#show ip route | include 10.200
D EX     10.200.1.0/24 [170/51456] via 10.1.2.2, 00:14:02, GigabitEthernet0/1
                       [170/51456] via 10.1.1.2, 00:14:02, GigabitEthernet0/0

BR1#show route-map OSPF-TO-EIGRP
route-map OSPF-TO-EIGRP, deny, sequence 10
  Match clauses:
    tag 90
  Set clauses:
  Policy routing matches: 0 packets, 0 bytes
route-map OSPF-TO-EIGRP, permit, sequence 20
  Match clauses:
    ip address prefix-lists: OSPF-LANS
  Set clauses:
    tag 110
  Policy routing matches: 0 packets, 0 bytes

BR1#show ip prefix-list detail OSPF-LANS
ip prefix-list OSPF-LANS:
   count: 1, range entries: 0, sequences: 5 - 5, refcount: 2
   seq 5 permit 10.200.1.0/24 (hit count: 14, refcount: 1)`,q:{en:`Why are the other networks missing?`,hi:`Baaki networks kyun missing hain?`},o:[{en:`The route map does not set a metric for them`,hi:`Route map unke liye metric set nahi karta`},{en:`The prefix list matches only 10.200.1.0/24 exactly, so the rest hit the implicit deny`,hi:`Prefix list sirf 10.200.1.0/24 exact match karti hai, isliye baaki implicit deny par girte hain`},{en:`They carry tag 90 and are denied by sequence 10`,hi:`Unpar tag 90 hai aur sequence 10 unhe deny karta hai`},{en:`The subnets keyword is missing under EIGRP`,hi:`EIGRP ke neeche subnets keyword missing hai`}],a:1,w:{en:`Without ge or le the entry needs an exact prefix and length. Add ip prefix-list OSPF-LANS seq 10 permit 10.200.0.0/16 le 24 on both boundary routers. They are OSPF-born networks, so they have no tag 90, and the seed metric is on the redistribute command.`,hi:`ge ya le ke bina entry ko exact prefix aur length chahiye. Dono boundary routers par ip prefix-list OSPF-LANS seq 10 permit 10.200.0.0/16 le 24 jodo. Yeh OSPF-born networks hain, isliye in par tag 90 nahi hai, aur seed metric redistribute command par hai.`}},{title:{en:`Vendor routes invisible on one core router`,hi:`Ek core router par vendor routes gayab`},ticket:{en:`A new Delhi branch router redistributes static routes to a vendor network 203.0.113.0/24 into EIGRP. BR1 and BR2 learn them, E1 does not. All internal EIGRP routes work.`,hi:`Ek naya Delhi branch router vendor network 203.0.113.0/24 ke static routes EIGRP mein redistribute karta hai. BR1 aur BR2 unhe seekhte hain, E1 nahi. Saare internal EIGRP routes chalte hain.`},out:`BR1#show ip eigrp topology 203.0.113.0/24
EIGRP-IPv4 Topology Entry for AS(100)/ID(1.1.1.1) for 203.0.113.0/24
  State is Passive, Query origin flag is 1, 1 Successor(s), FD is 3072
  Descriptor Blocks:
  10.1.1.1 (GigabitEthernet0/0), from 10.1.1.1, Send flag is 0x0
      Composite metric is (3072/2816), route is External
      Vector metric:
        Minimum bandwidth is 1000000 Kbit
        Total delay is 20 microseconds
        Hop count is 2
        Originating router is 5.5.5.5
      External data:
        External protocol is Static, external metric is 0

E1#show ip protocols | include Router-ID
    Router-ID: 5.5.5.5

E1#show ip route 203.0.113.0
% Network not in table`,q:{en:`What is the most likely cause?`,hi:`Sabse sambhavit wajah kya hai?`},o:[{en:`Split horizon on E1's branch interface`,hi:`E1 ke branch interface par split horizon`},{en:`AD 170 is too high for E1 to install the route`,hi:`AD 170 itna zyada hai ki E1 route install nahi karta`},{en:`The branch router has no seed metric for static routes`,hi:`Branch router ke paas static routes ke liye seed metric nahi hai`},{en:`The branch router uses the same EIGRP router ID as E1, so E1 drops the external route`,hi:`Branch router E1 jaisa hi EIGRP router ID use karta hai, isliye E1 external route drop karta hai`}],a:3,w:{en:`The originating router is 5.5.5.5, E1's own router ID. EIGRP discards external routes that appear to come from itself, a loop guard. Static routes need no seed metric, and other routers already learn the route. Give the branch router a unique router ID.`,hi:`Originating router 5.5.5.5 hai, jo E1 ka apna router ID hai. EIGRP un external routes ko discard karta hai jo khud se aaye lagte hain, yeh loop guard hai. Static routes ko seed metric nahi chahiye, aur doosre routers route pehle se seekh rahe hain. Branch router ko unique router ID do.`}},{title:{en:`Filtered on O1, still used by O2`,hi:`O1 par filter, O2 ab bhi use karta hai`},ticket:{en:`To stop Bengaluru reaching 192.168.50.0/24, an engineer added "distribute-list prefix NO-PARTNER in" under OSPF on O1. A new router O2 behind O1 still sends partner traffic to O1, which drops it.`,hi:`Bengaluru ko 192.168.50.0/24 tak pahunchne se rokne ke liye ek engineer ne O1 par OSPF ke neeche "distribute-list prefix NO-PARTNER in" joda. O1 ke peeche naya router O2 ab bhi partner traffic O1 ko bhejta hai, jo use drop karta hai.`},out:`O1#show ip route 192.168.50.0
% Network not in table

O1#show ip ospf database external 192.168.50.0 | include Link State ID|Advertising|Tag
  Link State ID: 192.168.50.0 (External Network Number )
  Advertising Router: 1.1.1.1
        External Route Tag: 90

O2#show ip route 192.168.50.0 | include Known|via
  Known via "ospf 1", distance 110, metric 20
  * 10.2.9.1, from 1.1.1.1, 00:03:11 ago, via GigabitEthernet0/0`,q:{en:`Why does O2 still have the route?`,hi:`O2 ke paas route ab bhi kyun hai?`},o:[{en:`O2 has a stale route; clear ip ospf process on O2 will remove it`,hi:`O2 ke paas stale route hai; O2 par clear ip ospf process ise hata dega`},{en:`The distribute-list must be configured "out" instead of "in"`,hi:`Distribute-list "in" ki jagah "out" configure honi chahiye`},{en:`An OSPF inbound distribute-list filters only O1's RIB; the LSA is still flooded to O2`,hi:`OSPF inbound distribute-list sirf O1 ka RIB filter karti hai; LSA ab bhi O2 ko flood hota hai`},{en:`O2 is in a different OSPF area from O1`,hi:`O2, O1 se alag OSPF area mein hai`}],a:2,w:{en:`The LSA is still in O1's database and flooded normally, so O2 computes the route through O1, which then has no route: a black hole. Filter where the LSA is born, in route map EIGRP-TO-OSPF on both boundary routers, instead of mid-area.`,hi:`LSA O1 ke database mein ab bhi hai aur normal flood hota hai, isliye O2 O1 ke through route calculate karta hai, jiske paas phir route nahi: black hole. Area ke beech ki jagah wahan filter karo jahan LSA paida hota hai, dono boundary routers par route map EIGRP-TO-OSPF mein.`}},{title:{en:`Only one Delhi network in OSPF`,hi:`OSPF mein sirf ek Delhi network`},ticket:{en:`On an older boundary router running legacy IOS, EIGRP was redistributed into OSPF. Bengaluru sees the partner network but not the Delhi users.`,hi:`Legacy IOS chalane wale ek purane boundary router par EIGRP ko OSPF mein redistribute kiya gaya. Bengaluru ko partner network dikhta hai lekin Delhi users nahi.`},out:`BR3(config)#router ospf 1
BR3(config-router)#redistribute eigrp 100
% Only classful networks will be redistributed

O1#show ip route ospf | include E2
O E2     192.168.50.0/24 [110/20] via 10.2.3.3, 00:00:52, GigabitEthernet0/3`,q:{en:`What fixes it?`,hi:`Ise kya theek karega?`},o:[{en:`redistribute eigrp 100 subnets`,hi:`redistribute eigrp 100 subnets`},{en:`default-metric 20 under OSPF`,hi:`OSPF ke neeche default-metric 20`},{en:`metric-type 1 on the redistribute command`,hi:`Redistribute command par metric-type 1`},{en:`no auto-summary under OSPF`,hi:`OSPF ke neeche no auto-summary`}],a:0,w:{en:`Without subnets, old IOS redistributes only classful networks. 192.168.50.0/24 is a class C network, so it passes; 172.16.10.0/24 is a subnet of class B 172.16.0.0 and is skipped. OSPF has no auto-summary command, and metric settings do not change which routes are taken.`,hi:`subnets ke bina purana IOS sirf classful networks redistribute karta hai. 192.168.50.0/24 class C network hai, isliye pass hota hai; 172.16.10.0/24 class B 172.16.0.0 ka subnet hai aur chhoot jaata hai. OSPF mein auto-summary command nahi hai, aur metric settings yeh nahi badalti ki kaunse routes liye jaayenge.`}},{title:{en:`The loopback is down but the route lives`,hi:`Loopback down hai lekin route zinda hai`},ticket:{en:`E1's Loopback1 (192.168.50.1/24) was shut for maintenance. Monitoring still shows 192.168.50.0/24 in both domains, and pings return TTL exceeded. Redistribution has no route maps yet.`,hi:`E1 ka Loopback1 (192.168.50.1/24) maintenance ke liye shut kiya gaya. Monitoring ab bhi dono domains mein 192.168.50.0/24 dikhati hai, aur pings TTL exceeded laute hain. Redistribution par abhi route maps nahi hain.`},out:`E1#show ip route 192.168.50.0 | include Known|via|tag
  Known via "eigrp 100", distance 170, metric 51456, type external
  * 10.1.1.2, from 10.1.1.2, 00:01:05 ago, via GigabitEthernet0/0

E1#show ip eigrp topology 192.168.50.0/24 | include Originating|External protocol
        Originating router is 1.1.1.1
        External protocol is OSPF, external metric is 20

E1#traceroute 192.168.50.1
  1 10.1.1.2 1 msec 1 msec 1 msec
  2 10.2.1.1 1 msec 1 msec 1 msec
  3 10.2.2.2 2 msec 1 msec 2 msec
  4 10.1.2.1 2 msec 2 msec 2 msec
  5 10.1.1.2 2 msec 3 msec 2 msec
  6 10.2.1.1 3 msec 3 msec 3 msec`,q:{en:`What is happening and what is the durable fix?`,hi:`Kya ho raha hai aur tikau fix kya hai?`},o:[{en:`EIGRP is stuck in active; raise the active timer`,hi:`EIGRP stuck in active hai; active timer badhao`},{en:`AD problem; configure distance ospf external 171`,hi:`AD problem; distance ospf external 171 configure karo`},{en:`Loopback1 is not really down; check the interface`,hi:`Loopback1 sach mein down nahi hai; interface check karo`},{en:`Route feedback between the domains; tag routes on exit and deny the other domain's tag on entry on both boundary routers`,hi:`Domains ke beech route feedback; dono boundary routers par exit par routes tag karo aur entry par doosre domain ka tag deny karo`}],a:3,w:{en:`E1 now learns its own network as an external from OSPF via BR1 (originating router 1.1.1.1), and the traceroute circles E1, BR1, O1, BR2. The route feeds itself between the protocols. Tags with deny entries on every boundary router stop re-redistribution; AD tuning alone does not stop feedback.`,hi:`E1 ab apna hi network BR1 ke through OSPF se external ki tarah seekhta hai (originating router 1.1.1.1), aur traceroute E1, BR1, O1, BR2 ka chakkar lagata hai. Route protocols ke beech khud ko feed kar raha hai. Har boundary router par deny entries ke saath tags re-redistribution rokte hain; sirf AD tuning feedback nahi rokti.`}},{title:{en:`Lab routes keep leaking`,hi:`Lab routes leak hote rehte hain`},ticket:{en:`The route map should stop two things entering EIGRP: routes tagged 90 and anything in the lab range 10.99.0.0/16. Both keep leaking.`,hi:`Route map ko do cheezein EIGRP mein aane se rokni chahiye: tag 90 wale routes aur lab range 10.99.0.0/16 ka kuch bhi. Dono leak hote rehte hain.`},out:`BR2#show route-map OSPF-TO-EIGRP
route-map OSPF-TO-EIGRP, deny, sequence 10
  Match clauses:
    ip address prefix-lists: LAB
    tag 90
  Set clauses:
  Policy routing matches: 0 packets, 0 bytes
route-map OSPF-TO-EIGRP, permit, sequence 20
  Match clauses:
  Set clauses:
    tag 110
  Policy routing matches: 0 packets, 0 bytes

BR2#show ip prefix-list LAB
ip prefix-list LAB: 1 entries
   seq 5 permit 10.99.0.0/16 le 32`,q:{en:`What is wrong?`,hi:`Kya galat hai?`},o:[{en:`The LAB prefix list should use ge 16 instead of le 32`,hi:`LAB prefix list mein le 32 ki jagah ge 16 hona chahiye`},{en:`Two match clauses in one entry are ANDed; only routes that are both tag 90 and in 10.99.0.0/16 are denied`,hi:`Ek entry mein do match clauses AND hote hain; sirf woh routes deny hote hain jo tag 90 bhi hon aur 10.99.0.0/16 mein bhi`},{en:`Deny entries cannot reference prefix lists`,hi:`Deny entries prefix lists reference nahi kar sakti`},{en:`Sequence 20 must also match tag 110`,hi:`Sequence 20 ko bhi tag 110 match karna chahiye`}],a:1,w:{en:`Different match types in one entry must all be true. Put them in separate entries: deny 10 match tag 90, deny 15 match ip address prefix-list LAB, then permit 20. The prefix list itself is correct.`,hi:`Ek entry mein alag match types sab sach hone chahiye. Unhe alag entries mein daalo: deny 10 match tag 90, deny 15 match ip address prefix-list LAB, phir permit 20. Prefix list khud sahi hai.`}}];export{e as default};