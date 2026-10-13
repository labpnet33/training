var e=[{title:{en:`The new circuit stuck in EXSTART`,hi:`Naya circuit jo EXSTART mein atka hai`},ticket:{en:`ABR1 was connected to a new area 10 router over a provider handoff. Pings across 10.10.12.0/30 work, but OSPF never comes up. You run this on ABR1.`,hi:`ABR1 ko provider handoff ke through ek naye area 10 router se joda gaya. 10.10.12.0/30 ke paar ping chal raha hai, lekin OSPF kabhi up nahi hota. Aap ABR1 par yeh chalate ho.`},out:`ABR1#show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
1.1.1.1           1   EXSTART/BDR     00:00:34    10.10.12.1      GigabitEthernet0/0

%OSPF-5-ADJCHG: Process 1, Nbr 1.1.1.1 on GigabitEthernet0/0 from EXSTART to DOWN, Neighbor Down: Too many retransmissions

ABR1#show ip interface GigabitEthernet0/0 | include MTU
  MTU is 1400 bytes

R1#show ip interface GigabitEthernet0/0 | include MTU
  MTU is 1500 bytes`,q:{en:`What is the root cause?`,hi:`Root cause kya hai?`},o:[{en:`Hello and Dead timers do not match`,hi:`Hello aur Dead timers match nahi karte`},{en:`The two routers are in different areas`,hi:`Dono routers alag areas mein hain`},{en:`IP MTU mismatch: ABR1 rejects R1's DBDs advertising 1500`,hi:`IP MTU mismatch: ABR1 R1 ke 1500 advertise karne wale DBDs reject karta hai`},{en:`R1 has OSPF priority 0`,hi:`R1 ki OSPF priority 0 hai`}],a:2,w:{en:`Timer, area or priority problems would stop the neighbour before EXSTART. EXSTART with "Too many retransmissions" and MTU 1400 versus 1500 is the DBD MTU check. Set the same IP MTU on both ends; ip ospf mtu-ignore is only a workaround.`,hi:`Timer, area ya priority problems neighbour ko EXSTART se pehle hi rok dete. "Too many retransmissions" ke saath EXSTART aur MTU 1400 vs 1500 DBD MTU check hai. Dono ends par same IP MTU set karo; ip ospf mtu-ignore sirf workaround hai.`}},{title:{en:`FULL neighbour, missing routes`,hi:`FULL neighbour, missing routes`},ticket:{en:`During lab 2, an engineer changed the R1-R2 link to point-to-point on R1 only and went for tea. R1 shows R2 as FULL, but R1 has lost the route to 10.0.23.0/30 and R3's loopback.`,hi:`Lab 2 ke dauraan ek engineer ne R1-R2 link ko sirf R1 par point-to-point kiya aur chai peene chala gaya. R1 R2 ko FULL dikhata hai, lekin R1 ne 10.0.23.0/30 aur R3 ke loopback ka route kho diya hai.`},out:`R1#show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
2.2.2.2           0   FULL/  -        00:00:36    10.0.12.2       GigabitEthernet0/0

R1#show ip ospf interface GigabitEthernet0/0 | include Network Type
  Process ID 1, Router ID 1.1.1.1, Network Type POINT_TO_POINT, Cost: 1

R2#show ip ospf interface GigabitEthernet0/0 | include Network Type|State
  Process ID 1, Router ID 2.2.2.2, Network Type BROADCAST, Cost: 1
  Transmit Delay is 1 sec, State DR, Priority 1

R1#show ip route 10.0.23.0
% Subnet not in table`,q:{en:`What explains a FULL adjacency with missing routes?`,hi:`FULL adjacency ke saath missing routes ko kya explain karta hai?`},o:[{en:`Network type mismatch: the two router LSAs describe the link differently, so SPF's two-way check fails`,hi:`Network type mismatch: dono router LSAs link ko alag tarah describe karte hain, isliye SPF ka two-way check fail hota hai`},{en:`An MTU mismatch between R1 and R2`,hi:`R1 aur R2 ke beech MTU mismatch`},{en:`R2 needs a higher priority to stay DR`,hi:`R2 ko DR rehne ke liye zyada priority chahiye`},{en:`R3 is in a different area`,hi:`R3 alag area mein hai`}],a:0,w:{en:`Broadcast and point-to-point both use 10/40 timers, so the neighbour reaches FULL. R2 describes the link as a transit network with itself as DR; R1 describes a point-to-point link to 2.2.2.2. The graph is inconsistent and SPF drops the link. Configure ip ospf network point-to-point on R2 Gi0/0 as well.`,hi:`Broadcast aur point-to-point dono 10/40 timers use karte hain, isliye neighbour FULL tak pahunchta hai. R2 link ko khud DR wale transit network ki tarah describe karta hai; R1 2.2.2.2 tak point-to-point link describe karta hai. Graph inconsistent hai aur SPF link ko drop kar deta hai. R2 Gi0/0 par bhi ip ospf network point-to-point configure karo.`}},{title:{en:`Area 10 sees nothing outside`,hi:`Area 10 ko bahar kuch nahi dikhta`},ticket:{en:`ABR1 was brought up for lab 1. R1 has a FULL neighbour to ABR1 but no O IA routes at all. You collect this.`,hi:`Lab 1 ke liye ABR1 up kiya gaya. R1 ka ABR1 ke saath FULL neighbour hai lekin koi O IA route nahi. Aap yeh collect karte ho.`},out:`ABR1#show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/1        1     10              10.0.23.1/30       1     DR    0/0
Gi0/0        1     10              10.10.12.2/30      1     BDR   1/1

ABR1#show ip ospf | include border
ABR1#

CORE#show ip ospf neighbor
CORE#`,q:{en:`What is wrong?`,hi:`Kya galat hai?`},o:[{en:`R1 needs ip ospf network point-to-point`,hi:`R1 ko ip ospf network point-to-point chahiye`},{en:`CORE is missing a router-id`,hi:`CORE mein router-id missing hai`},{en:`Area 10 must be configured as a stub area`,hi:`Area 10 ko stub area configure karna hoga`},{en:`ABR1 Gi0/1 is in area 10 instead of area 0, so ABR1 has no backbone interface and is not an ABR`,hi:`ABR1 Gi0/1 area 0 ki jagah area 10 mein hai, isliye ABR1 ka koi backbone interface nahi aur woh ABR nahi hai`}],a:3,w:{en:`Both ABR1 interfaces are in area 10. CORE's Gi0/0 is in area 0, so the areas mismatch, no neighbour forms (Nbrs 0/0), and ABR1 has no area 0 attachment: "It is an area border router" is absent. Put Gi0/1 and Loopback0 in area 0.`,hi:`ABR1 ke dono interfaces area 10 mein hain. CORE ka Gi0/0 area 0 mein hai, isliye areas mismatch hain, koi neighbour nahi banta (Nbrs 0/0), aur ABR1 ka koi area 0 attachment nahi: "It is an area border router" gayab hai. Gi0/1 aur Loopback0 ko area 0 mein daalo.`}},{title:{en:`The summary that did not summarise`,hi:`Summary jo summarise nahi hua`},ticket:{en:`The change request said "summarise Pune into 172.16.0.0/22 on ABR1". The engineer marked it done, but CORE still has four /24s.`,hi:`Change request mein likha tha "ABR1 par Pune ko 172.16.0.0/22 mein summarise karo". Engineer ne done mark kar diya, lekin CORE ke paas ab bhi chaar /24s hain.`},out:`ABR1#show running-config | section router ospf
router ospf 1
 router-id 2.2.2.2
 area 0 range 172.16.0.0 255.255.252.0

ABR1#show ip ospf | include Area|ranges|/22
    Area BACKBONE(0)
        Area has no authentication
        Area ranges are
           172.16.0.0/22 Passive Advertise
    Area 10
        Area has no authentication

CORE#show ip route ospf | include 172.16
      172.16.0.0/24 is subnetted, 4 subnets
O IA     172.16.0.0 [110/3] via 10.0.23.1, 00:21:10, GigabitEthernet0/0
O IA     172.16.1.0 [110/3] via 10.0.23.1, 00:21:10, GigabitEthernet0/0
O IA     172.16.2.0 [110/3] via 10.0.23.1, 00:21:10, GigabitEthernet0/0
O IA     172.16.3.0 [110/3] via 10.0.23.1, 00:21:10, GigabitEthernet0/0`,q:{en:`What should the engineer change?`,hi:`Engineer ko kya badalna chahiye?`},o:[{en:`Use summary-address 172.16.0.0 255.255.252.0 instead`,hi:`Iski jagah summary-address 172.16.0.0 255.255.252.0 use karo`},{en:`Replace it with area 10 range 172.16.0.0 255.255.252.0, naming the area where the components live`,hi:`Ise area 10 range 172.16.0.0 255.255.252.0 se replace karo, us area ka naam lekar jahan components rehte hain`},{en:`Configure the range on CORE`,hi:`Range CORE par configure karo`},{en:`Change the mask to 255.255.255.0`,hi:`Mask 255.255.255.0 kar do`}],a:1,w:{en:`area range must name the area that contains the component networks, here area 10. The range sits under the backbone and is Passive because area 0 has no 172.16 components, while area 10 has no range at all. summary-address is for external routes on an ASBR, and CORE is not an ABR for area 10.`,hi:`area range mein us area ka naam hona chahiye jismein component networks hain, yahan area 10. Range backbone ke neeche baithi hai aur Passive hai kyunki area 0 mein koi 172.16 component nahi, jabki area 10 mein koi range hi nahi. summary-address ASBR par external routes ke liye hai, aur CORE area 10 ka ABR nahi hai.`}},{title:{en:`Tuning timers took the link down`,hi:`Timers tune karne se link down ho gaya`},ticket:{en:`To speed up failure detection, a change set Hello 5 on R1 Gi0/0. Forty seconds later the R1-R2 adjacency dropped and has not come back.`,hi:`Failure detection tez karne ke liye ek change ne R1 Gi0/0 par Hello 5 set kiya. Chaalis second baad R1-R2 adjacency gir gayi aur wapas nahi aayi.`},out:`R1#show ip ospf interface GigabitEthernet0/0 | include Timer
  Timer intervals configured, Hello 5, Dead 20, Wait 20, Retransmit 5

R1#debug ip ospf hello
OSPF-1 HELLO Gi0/0: Rcv hello from 2.2.2.2 area 0 10.0.12.2
OSPF-1 HELLO Gi0/0: Mismatched hello parameters from 10.0.12.2
OSPF-1 HELLO Gi0/0: Dead R 40 C 20, Hello R 10 C 5`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Set ip ospf dead-interval 40 on R1`,hi:`R1 par ip ospf dead-interval 40 set karo`},{en:`Clear the OSPF process on R2`,hi:`R2 par OSPF process clear karo`},{en:`Configure ip ospf hello-interval 5 on R2 Gi0/0 as well`,hi:`R2 Gi0/0 par bhi ip ospf hello-interval 5 configure karo`},{en:`Change the network type to non-broadcast`,hi:`Network type non-broadcast kar do`}],a:2,w:{en:`R (received) shows R2 still uses 10/40, C (configured) shows R1 uses 5/20. Hello and Dead must match on both ends. Setting only the dead interval on R1 would still leave Hello 5 versus 10 mismatched; clearing the process changes nothing.`,hi:`R (received) dikhata hai ki R2 ab bhi 10/40 use karta hai, C (configured) dikhata hai ki R1 5/20 use karta hai. Hello aur Dead dono ends par match hone chahiye. R1 par sirf dead interval set karne se Hello 5 vs 10 mismatch rehega; process clear karne se kuch nahi badalta.`}},{title:{en:`In the database, not in the table`,hi:`Database mein hai, table mein nahi`},ticket:{en:`CORE cannot reach 172.16.3.0/24 in Pune, but ABR2 right next to it can. No neighbour has changed.`,hi:`CORE Pune ke 172.16.3.0/24 tak nahi pahunch pata, lekin uske bagal wala ABR2 pahunch jaata hai. Koi neighbour nahi badla.`},out:`CORE#show ip ospf database summary 172.16.3.0 | include Link State ID|Advertising
  Link State ID: 172.16.3.0 (summary Network Number)
  Advertising Router: 2.2.2.2

CORE#show ip route 172.16.3.0
% Subnet not in table

CORE#show running-config | section router ospf
router ospf 1
 router-id 3.3.3.3
 network 10.0.0.0 0.0.255.255 area 0
 network 3.3.3.3 0.0.0.0 area 0
 distribute-list prefix NO-LAB in

CORE#show ip prefix-list NO-LAB
ip prefix-list NO-LAB: 2 entries
   seq 5 deny 172.16.3.0/24
   seq 10 permit 0.0.0.0/0 le 32`,q:{en:`Why does CORE lack the route while ABR2 has it?`,hi:`CORE ke paas route kyun nahi hai jabki ABR2 ke paas hai?`},o:[{en:`ABR1 is filtering the type 3 LSA with an area filter-list`,hi:`ABR1 area filter-list se type 3 LSA filter kar raha hai`},{en:`An inbound distribute-list on CORE blocks the route from its RIB; the LSA is still in the LSDB and flooded`,hi:`CORE par inbound distribute-list route ko uski RIB se block karti hai; LSA ab bhi LSDB mein hai aur flood hota hai`},{en:`The LSA has reached MaxAge`,hi:`LSA MaxAge tak pahunch gaya hai`},{en:`CORE and ABR2 are in different areas`,hi:`CORE aur ABR2 alag areas mein hain`}],a:1,w:{en:`An area filter-list would remove the LSA from area 0 entirely, so neither CORE nor ABR2 would see it. Here the LSA exists but only CORE's routing table lacks it: that is distribute-list in. Remove it or fix the prefix-list.`,hi:`Area filter-list LSA ko area 0 se poori tarah hata deti, to na CORE use dekhta na ABR2. Yahan LSA hai lekin sirf CORE ki routing table mein nahi: yeh distribute-list in hai. Ise hatao ya prefix-list theek karo.`}},{title:{en:`Area 0 split after a fibre cut`,hi:`Fibre cut ke baad Area 0 split`},ticket:{en:`The CORE-ABR2 fibre was cut. A backup link 10.10.24.0/30 between ABR1 Gi0/2 and ABR2 Gi0/2 sits in area 10. R1 has a route to Chennai but traffic dies at ABR1.`,hi:`CORE-ABR2 fibre kat gaya. ABR1 Gi0/2 aur ABR2 Gi0/2 ke beech backup link 10.10.24.0/30 area 10 mein hai. R1 ke paas Chennai ka route hai lekin traffic ABR1 par mar jaata hai.`},out:`R1#show ip route 192.168.20.0 | include Known|from
  Known via "ospf 1", distance 110, metric 4, type inter area
  * 10.10.12.2, from 4.4.4.4, 00:06:02 ago, via GigabitEthernet0/0

ABR1#show ip ospf border-routers
Internal Router Routing Table
Codes: i - Intra-area route, I - Inter-area route
i 4.4.4.4 [1] via 10.10.24.2, GigabitEthernet0/2, ABR, Area 10, SPF 14

ABR1#show ip ospf database summary 192.168.20.0 | include Area|Advertising
                Summary Net Link States (Area 10)
  Advertising Router: 4.4.4.4

ABR1#show ip route 192.168.20.0
% Network not in table`,q:{en:`What is the fastest correct fix?`,hi:`Sabse tez sahi fix kya hai?`},o:[{en:`Add area 10 range 192.168.20.0 255.255.255.0 on ABR1`,hi:`ABR1 par area 10 range 192.168.20.0 255.255.255.0 jodo`},{en:`Clear the OSPF process on ABR1`,hi:`ABR1 par OSPF process clear karo`},{en:`Make area 10 a stub area`,hi:`Area 10 ko stub area banao`},{en:`Create a virtual link across area 10 between ABR1 (to 4.4.4.4) and ABR2 (to 2.2.2.2)`,hi:`ABR1 (4.4.4.4 ki taraf) aur ABR2 (2.2.2.2 ki taraf) ke beech area 10 ke paar virtual link banao`}],a:3,w:{en:`The backbone is split. ABR1 ignores type 3 LSAs learned in area 10, which is why it has no route while R1 does. A virtual link through area 10 rejoins the backbone; later move the backup link into area 0 and remove the virtual link. A stub area cannot even carry a virtual link.`,hi:`Backbone split hai. ABR1 area 10 mein seekhe type 3 LSAs ignore karta hai, isiliye uske paas route nahi jabki R1 ke paas hai. Area 10 ke through virtual link backbone ko dobara jodta hai; baad mein backup link ko area 0 mein daalo aur virtual link hata do. Stub area virtual link le hi nahi ja sakta.`}},{title:{en:`Chennai vanished after ABR2 came up`,hi:`ABR2 up hone ke baad Chennai gayab`},ticket:{en:`ABR2 was configured with network statements for lab 1. Area 20 routes never reached the backbone, and ABR2 logs a message every 10 seconds.`,hi:`Lab 1 ke liye ABR2 network statements se configure hua. Area 20 ke routes kabhi backbone tak nahi pahunche, aur ABR2 har 10 second mein ek message log karta hai.`},out:`%OSPF-4-ERRRCV: Received invalid packet: mismatched area ID from backbone area from 10.0.34.1, GigabitEthernet0/0

ABR2#show running-config | section router ospf
router ospf 1
 router-id 4.4.4.4
 network 10.0.34.0 0.0.0.3 area 20
 network 4.4.4.4 0.0.0.0 area 0
 network 10.20.45.0 0.0.0.3 area 20

ABR2#show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Lo0          1     0               4.4.4.4/32         1     LOOP  0/0
Gi0/0        1     20              10.0.34.2/30       1     DR    0/0
Gi0/1        1     20              10.20.45.1/30      1     BDR   1/1`,q:{en:`Which change fixes it?`,hi:`Kaunsa change ise fix karta hai?`},o:[{en:`Change the first statement to network 10.0.34.0 0.0.0.3 area 0`,hi:`Pehla statement network 10.0.34.0 0.0.0.3 area 0 kar do`},{en:`Remove Loopback0 from area 0`,hi:`Loopback0 ko area 0 se hata do`},{en:`Set ip ospf network point-to-point on Gi0/0`,hi:`Gi0/0 par ip ospf network point-to-point set karo`},{en:`Change CORE Gi0/1 to area 20`,hi:`CORE Gi0/1 ko area 20 kar do`}],a:0,w:{en:`ABR2's backbone link was placed in area 20, so CORE's area 0 Hellos are rejected. Only the loopback is in area 0, giving ABR2 a one-router backbone island. Put 10.0.34.0/30 in area 0. Moving CORE into area 20 would break the design rule that areas meet only through area 0.`,hi:`ABR2 ka backbone link area 20 mein daal diya gaya, isliye CORE ke area 0 Hellos reject hote hain. Sirf loopback area 0 mein hai, jo ABR2 ko ek-router backbone island deta hai. 10.0.34.0/30 ko area 0 mein daalo. CORE ko area 20 mein le jaana is design rule ko todega ki areas sirf area 0 ke through milte hain.`}}];export{e as default};