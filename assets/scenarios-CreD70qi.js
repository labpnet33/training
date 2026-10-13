var e=[{title:{en:`The new uplink that stays silent`,hi:`Naya uplink jo chup hai`},ticket:{en:`A new branch router R1 was cabled to the ABR R2 this morning. The link is up, both ends can ping each other, but R1 learns no routes. You run these commands on R1.`,hi:`Naya branch router R1 aaj subah ABR R2 se cable kiya gaya. Link up hai, dono ends ek-dusre ko ping kar sakte hain, lekin R1 koi route nahi seekhta. Aap R1 par yeh commands chalate ho.`},out:`R1#show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface

R1#show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/0        1     2               10.0.12.1/30       1     DR    0/0
Lo0          1     1               1.1.1.1/32         1     LOOP  0/0
Lo1          1     1               172.16.1.1/24      1     LOOP  0/0

R2#show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/0        1     1               10.0.12.2/30       1     DR    0/0
Gi0/1        1     0               10.0.23.1/30       1     BDR   1/1`,q:{en:`What is the cause, and what is the fix?`,hi:`Wajah kya hai, aur fix kya hai?`},o:[{en:`Hello timers differ; align them on both interfaces`,hi:`Hello timers alag hain; dono interfaces par barabar karo`},{en:`The area differs: R1 Gi0/0 is in area 2 while R2 Gi0/0 is in area 1; correct the area on R1`,hi:`Area alag hai: R1 ka Gi0/0 area 2 mein aur R2 ka Gi0/0 area 1 mein; R1 par area theek karo`},{en:`R1 needs a router ID before it can form neighbours`,hi:`R1 ko neighbours banane se pehle router ID chahiye`},{en:`R2 must be moved to area 0 on Gi0/0`,hi:`R2 ke Gi0/0 ko area 0 mein karna hai`}],a:1,w:{en:`The Area column differs on the two ends of the link (2 and 1). Hellos carry the area ID and a mismatch means no neighbour (0/0). Fix the network statement on R1 so that 10.0.12.0 is in area 1. Moving R2 to area 0 would break its ABR role.`,hi:`Link ke dono ends par Area column alag hai (2 aur 1). Hellos mein area ID jaati hai aur mismatch matlab koi neighbour nahi (0/0). R1 par network statement theek karo taaki 10.0.12.0 area 1 mein ho. R2 ko area 0 mein karne se uska ABR role toot jaata.`}},{title:{en:`Border router with no border`,hi:`Border router jiske paas border nahi`},ticket:{en:`After a change, R1 in area 1 can ping R2 but nothing in the backbone or the internet, and R3 shows no OSPF neighbours at all. R2 is supposed to be the ABR between area 1 and area 0. You check R2 and R3.`,hi:`Change ke baad area 1 ka R1 R2 ko ping kar sakta hai lekin backbone ya internet mein kuch nahi, aur R3 ke koi OSPF neighbours hi nahi dikhte. R2 ko area 1 aur area 0 ke beech ABR hona chahiye. Aap R2 aur R3 check karte ho.`},out:`R2#show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/0        1     1               10.0.12.2/30       1     DR    1/1
Gi0/1        1     1               10.0.23.1/30       1     DR    0/0
Lo0          1     0               2.2.2.2/32         1     LOOP  0/0

R3#show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface`,q:{en:`What is the correct fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Place R2 Gi0/1 in area 0 with ip ospf 1 area 0`,hi:`R2 ke Gi0/1 ko ip ospf 1 area 0 se area 0 mein daalo`},{en:`Place R3 Gi0/0 in area 1 so both ends agree`,hi:`R3 ke Gi0/0 ko area 1 mein daalo taaki dono ends match karein`},{en:`Create a virtual link between R2 and R3`,hi:`R2 aur R3 ke beech virtual link banao`},{en:`Change the OSPF process ID on R3`,hi:`R3 par OSPF process ID badlo`}],a:0,w:{en:`R2's only area 0 interface is a loopback, so it has no backbone link. Gi0/1 sits in area 1 and R3 is in area 0, hence the mismatch and no neighbour. Moving R3 into area 1 would remove the backbone altogether. A virtual link is a CCNP repair for a broken design, not the answer to a typo. Process IDs are local.`,hi:`R2 ka area 0 mein sirf loopback hai, to backbone link nahi hai. Gi0/1 area 1 mein hai aur R3 area 0 mein, isliye mismatch aur koi neighbour nahi. R3 ko area 1 mein daalne se backbone hi khatam ho jaata. Virtual link toote design ka CCNP repair hai, typo ka jawab nahi. Process IDs local hain.`}},{title:{en:`Two LANs yes, one LAN no`,hi:`Do LANs haan, ek LAN nahi`},ticket:{en:`From HQ (R3) users can reach 172.16.1.0/24 and 172.16.2.0/24 in Pune, but 172.16.3.0/24 does not respond. The Pune router R1 shows the LAN interface up. You run these commands.`,hi:`HQ (R3) se users Pune ke 172.16.1.0/24 aur 172.16.2.0/24 tak pahunch jaate hain, lekin 172.16.3.0/24 jawab nahi deta. Pune router R1 par LAN interface up dikhta hai. Aap yeh commands chalate ho.`},out:`R3#show ip route ospf
      172.16.0.0/24 is subnetted, 2 subnets
O IA     172.16.1.0 [110/3] via 10.0.23.1, 00:00:10, GigabitEthernet0/0
O IA     172.16.2.0 [110/3] via 10.0.23.1, 00:00:10, GigabitEthernet0/0

R1#show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/0        1     1               10.0.12.1/30       1     BDR   1/1
Lo0          1     1               1.1.1.1/32         1     LOOP  0/0
Lo1          1     1               172.16.1.1/24      1     LOOP  0/0
Lo2          1     1               172.16.2.1/24      1     LOOP  0/0`,q:{en:`Why is 172.16.3.0/24 missing at HQ?`,hi:`HQ par 172.16.3.0/24 kyun missing hai?`},o:[{en:`The ABR summarises it into the other two prefixes`,hi:`ABR use baaki do prefixes mein summarise kar deta hai`},{en:`Loopback3 is not running OSPF on R1: no network statement covers 172.16.3.0`,hi:`R1 par Loopback3 OSPF nahi chala raha: koi network statement 172.16.3.0 cover nahi karta`},{en:`HQ prefers O IA routes over connected ones`,hi:`HQ O IA routes ko connected routes par prefer karta hai`},{en:`The area 0 backbone has failed`,hi:`Area 0 backbone fail ho gaya hai`}],a:1,w:{en:`The interface table on R1 lists only Lo1 and Lo2, so the third LAN's interface is not in OSPF and no LSA describes it. Add network 172.16.3.0 0.0.0.255 area 1 on R1. The backbone is healthy because the other two prefixes arrive; and the ABR has no range configured here.`,hi:`R1 ki interface table mein sirf Lo1 aur Lo2 hain, yaani teesre LAN ka interface OSPF mein nahi aur koi LSA use describe nahi karta. R1 par network 172.16.3.0 0.0.0.255 area 1 jodo. Backbone theek hai kyunki baaki do prefixes aa rahe hain; aur yahan ABR par koi range configured nahi.`}},{title:{en:`The lab LAN that went to production`,hi:`Lab LAN jo production mein chala gaya`},ticket:{en:`The same symptom as before: HQ cannot reach 172.16.3.0/24, but this time R1 shows the LAN in OSPF area 1 and the routers in Pune can reach it. You inspect the ABR R2.`,hi:`Wahi symptom: HQ 172.16.3.0/24 tak nahi pahunch pata, lekin is baar R1 par LAN OSPF area 1 mein dikhta hai aur Pune ke routers use reach kar lete hain. Aap ABR R2 inspect karte ho.`},out:`R2#show ip ospf | include Area 1|ranges|172.16
        Area ranges are
    Area 1
        Area ranges are
           172.16.3.0/24 Active(1) DoNotAdvertise

R2#show run | section ospf
router ospf 1
 router-id 2.2.2.2
 area 1 range 172.16.3.0 255.255.255.0 not-advertise
 network 10.0.12.0 0.0.0.3 area 1
 network 10.0.23.0 0.0.0.3 area 0
 network 2.2.2.2 0.0.0.0 area 0`,q:{en:`What do you change?`,hi:`Kya badloge?`},o:[{en:`Add a network statement for 172.16.3.0 on R2`,hi:`R2 par 172.16.3.0 ka network statement jodo`},{en:`Replace not-advertise by a /22 range under area 0`,hi:`not-advertise ko area 0 ke neeche /22 range se badlo`},{en:`Remove the area 1 range 172.16.3.0 255.255.255.0 not-advertise line on R2`,hi:`R2 par area 1 range 172.16.3.0 255.255.255.0 not-advertise line hatao`},{en:`Clear the OSPF process on R1`,hi:`R1 par OSPF process clear karo`}],a:2,w:{en:`Active(1) shows the prefix exists in area 1, and DoNotAdvertise shows that the ABR is suppressing it. Removing the not-advertise range makes R2 originate the type 3 again. A new network statement on R2 is irrelevant, and clearing R1 does not touch the ABR's range.`,hi:`Active(1) batata hai ki prefix area 1 mein maujood hai, aur DoNotAdvertise batata hai ki ABR use roak raha hai. not-advertise range hatane se R2 type 3 phir se originate karta hai. R2 par naya network statement irrelevant hai, aur R1 clear karne se ABR ki range nahi chhooti.`}},{title:{en:`The summary that never formed`,hi:`Summary jo kabhi bani hi nahi`},ticket:{en:`Last night an engineer added a /22 summary for the Pune LANs on R2 to reduce the routing table at HQ. This morning HQ still has three separate /24 routes. You look at the ABR.`,hi:`Kal raat ek engineer ne HQ ki routing table chhoti karne ke liye R2 par Pune LANs ki /22 summary lagayi. Aaj subah HQ ke paas ab bhi teen alag /24 routes hain. Aap ABR dekhte ho.`},out:`R2#show ip ospf | include Area B|Area 1|ranges|172.16
 It is an area border router
    Area BACKBONE(0)
        Area ranges are
           172.16.0.0/22 Passive Advertise
    Area 1
        Area ranges are

R2#show run | section ospf
router ospf 1
 router-id 2.2.2.2
 area 0 range 172.16.0.0 255.255.252.0
 network 10.0.12.0 0.0.0.3 area 1
 network 10.0.23.0 0.0.0.3 area 0
 network 2.2.2.2 0.0.0.0 area 0`,q:{en:`What is wrong with the range?`,hi:`Range mein kya galat hai?`},o:[{en:`The mask 255.255.252.0 is invalid for OSPF`,hi:`Mask 255.255.252.0 OSPF ke liye invalid hai`},{en:`It is under area 0, but the routes live in area 1`,hi:`Woh area 0 ke neeche hai, jabki routes area 1 mein rehte hain`},{en:`Ranges can only be configured on an ASBR`,hi:`Ranges sirf ASBR par configure ho sakti hain`},{en:`R2 is not an ABR`,hi:`R2 ABR nahi hai`}],a:1,w:{en:`The N in area N range is the area that owns the specific routes. Under area 0 there are no components, so the range shows as Passive and summarises nothing. R2 is an ABR (the output says so). Fix: no area 0 range 172.16.0.0 255.255.252.0, then area 1 range 172.16.0.0 255.255.252.0.`,hi:`area N range mein N woh area hai jo specific routes ka maalik hai. Area 0 ke neeche koi components nahi, isliye range Passive dikhti hai aur kuch summarise nahi karti. R2 ABR hai (output yahi kehta hai). Fix: no area 0 range 172.16.0.0 255.255.252.0, phir area 1 range 172.16.0.0 255.255.252.0.`}},{title:{en:`Default route gone after the ISP change`,hi:`ISP change ke baad default route gaya`},ticket:{en:`After the ISP link was re-provisioned, no branch has a default route. R3 is the edge router and shows the OSPF configuration below. A branch router prints nothing for the default.`,hi:`ISP link dobara provision hone ke baad kisi branch ke paas default route nahi. R3 edge router hai aur neeche wali OSPF configuration dikhata hai. Branch router default ke liye kuch nahi dikhata.`},out:`R3#show ip route 0.0.0.0
% Network not in table

R3#show run | section ospf
router ospf 1
 router-id 3.3.3.3
 network 10.0.23.0 0.0.0.3 area 0
 network 3.3.3.3 0.0.0.0 area 0
 default-information originate

R1#show ip route 0.0.0.0
% Network not in table`,q:{en:`Which statement explains it?`,hi:`Kaunsa statement ise explain karta hai?`},o:[{en:`The default-information originate command needs the always keyword to work at all`,hi:`default-information originate ko kaam karne ke liye always keyword chahiye hi chahiye`},{en:`The default route is E2, so branches reject it`,hi:`Default route E2 hai, isliye branches reject karte hain`},{en:`The ABR is blocking type 5 LSAs`,hi:`ABR type 5 LSAs ko block kar raha hai`},{en:`R3 has no default route of its own, so the plain command has nothing to advertise: restore the static route to the ISP`,hi:`R3 ke paas apna default route nahi, isliye plain command ke paas advertise karne ko kuch nahi: ISP ki taraf static route wapas lagao`}],a:3,w:{en:`The plain form is conditional. R3's own table has no 0.0.0.0/0 (static route lost in the re-provisioning), so it originates nothing. Restoring ip route 0.0.0.0 0.0.0.0 with the new next hop fixes it. Always would also work but would advertise a default even when the exit fails.`,hi:`Plain form conditional hai. R3 ki apni table mein 0.0.0.0/0 nahi (re-provisioning mein static route gaya), isliye woh kuch originate nahi karta. Naye next hop ke saath ip route 0.0.0.0 0.0.0.0 wapas lagane se fix hota hai. Always bhi chalta par exit fail hone par bhi default advertise karta.`}},{title:{en:`Metric 22 from a router that said 20`,hi:`20 bolne wale router se metric 22`},ticket:{en:`A junior engineer set the default on R3 to metric 20 and sees 22 on Pune router R1. He thinks something added 2 by mistake. R2 and R3 are one link each apart. You compare.`,hi:`Ek junior engineer ne R3 par default ka metric 20 set kiya aur Pune router R1 par 22 dikhta hai. Use lagta hai kisi ne galti se 2 jod diya. R2 aur R3 mein har ek ke beech ek link hai. Aap compare karte ho.`},out:`R3#show ip ospf database external

  LS Type: AS External Link
  Link State ID: 0.0.0.0 (External Network Number )
  Advertising Router: 3.3.3.3
  Network Mask: /0
        Metric Type: 1 (Comparable directly to link state metric)
        Metric: 20

R1#show ip route 0.0.0.0
Routing entry for 0.0.0.0/0
  Known via "ospf 1", distance 110, metric 22, type extern 1
  Routing Descriptor Blocks:
  * 10.0.12.2, via GigabitEthernet0/0`,q:{en:`What explains the value 22?`,hi:`22 ki value kya explain karta hai?`},o:[{en:`A misconfigured reference bandwidth`,hi:`Galat reference bandwidth`},{en:`The ABR adds 2 to every external route`,hi:`ABR har external route mein 2 jodta hai`},{en:`Metric type 1: R1 adds its internal cost to the ASBR (1 + 1) to the external metric 20`,hi:`Metric type 1: R1 ASBR tak apni internal cost (1 + 1) external metric 20 mein jodta hai`},{en:`A duplicate type 5 LSA from another ASBR`,hi:`Dusre ASBR ka duplicate type 5 LSA`}],a:2,w:{en:`Metric Type 1 means E1: every router adds the cost to reach the ASBR. R1 to R2 is 1 and R2 to R3 is 1, so 20 + 2 = 22. With the default type 2 (E2), R1 would show 20. Nothing is misconfigured.`,hi:`Metric Type 1 matlab E1: har router ASBR tak pahunchne ki cost jodta hai. R1 se R2 1 aur R2 se R3 1, to 20 + 2 = 22. Default type 2 (E2) mein R1 20 dikhata. Kuch misconfigured nahi hai.`}},{title:{en:`The summary cost nobody expected`,hi:`Summary ki cost jo kisi ne socha nahi tha`},ticket:{en:`The network team set a cost on the Pune summary so that traffic prefers this ABR. An auditor asks why HQ now shows 51 for 172.16.0.0/22 when the LAN is only two links away.`,hi:`Network team ne Pune summary par cost set ki taaki traffic is ABR ko prefer kare. Auditor poochta hai ki HQ ab 172.16.0.0/22 ke liye 51 kyun dikhata hai jabki LAN sirf do links door hai.`},out:`R2#show run | section ospf
router ospf 1
 router-id 2.2.2.2
 area 1 range 172.16.0.0 255.255.252.0 cost 50
 network 10.0.12.0 0.0.0.3 area 1
 network 10.0.23.0 0.0.0.3 area 0
 network 2.2.2.2 0.0.0.0 area 0

R3#show ip route ospf
      172.16.0.0/22 is subnetted, 1 subnets
O IA     172.16.0.0 [110/51] via 10.0.23.1, 00:00:10, GigabitEthernet0/0`,q:{en:`How is 51 produced?`,hi:`51 kaise bana?`},o:[{en:`50 is the cost keyword on the range; R3 adds 1 for its link to the ABR`,hi:`50 range ka cost keyword hai; R3 ABR tak apne link ka 1 jodta hai`},{en:`50 is the E2 metric and 1 is the AD`,hi:`50 E2 metric hai aur 1 AD hai`},{en:`The /22 range adds 50 for every summarised /24`,hi:`/22 range har summarised /24 ke liye 50 jodti hai`},{en:`HQ divides the reference bandwidth by 51`,hi:`HQ reference bandwidth ko 51 se divide karta hai`}],a:0,w:{en:`A type 3 LSA carries the ABR's cost; with the cost keyword the ABR advertises 50 for the summary. R3 adds its own cost to reach R2 (1), giving 51. Without the keyword, the summary would use the highest component cost, giving [110/3] as before.`,hi:`Type 3 LSA ABR ki cost le jaata hai; cost keyword ke saath ABR summary ke liye 50 advertise karta hai. R3 R2 tak apni cost (1) jodta hai, jisse 51 banta hai. Keyword ke bina summary sabse zyada component cost leti, aur pehle jaisa [110/3] aata.`}}];export{e as default};