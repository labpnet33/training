var e=[{title:{en:`Indore branch: neighbour gone after the stub change`,hi:`Indore branch: stub change ke baad neighbour gayab`},ticket:{en:`During the change window an engineer configured area 51 as stub on the ABR and then got pulled into another call. The Indore branch router BR has lost every OSPF route. You run this on the ABR.`,hi:`Change window ke dauraan ek engineer ne ABR par area 51 ko stub configure kiya aur phir doosri call mein chala gaya. Indore branch router BR ne har OSPF route kho diya hai. Aap ABR par yeh chalate ho.`},out:`ABR#show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
3.3.3.3           1   FULL/DR         00:00:36    10.0.23.2       GigabitEthernet0/1

ABR#debug ip ospf hello
OSPF-1 HELLO Gi0/0: Rcv hello from 1.1.1.1 area 51 10.51.12.1
OSPF-1 HELLO Gi0/0: Hello from 1.1.1.1 with mismatched Stub/Transit area option bit

ABR#show ip ospf | include stub
        It is a stub area`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Configure area 51 stub on BR as well`,hi:`BR par bhi area 51 stub configure karo`},{en:`Remove the passive-interface on BR`,hi:`BR par passive-interface hatao`},{en:`Add area 51 default-cost 1 on the ABR`,hi:`ABR par area 51 default-cost 1 jodo`},{en:`Change the router ID of BR`,hi:`BR ka router ID badlo`}],a:0,w:{en:`The stub flag (E-bit) is carried in every Hello and must match. Only the ABR has it, so the ABR rejects BR's Hellos. Configure area 51 stub on BR and the adjacency returns, now with an O*IA default.`,hi:`Stub flag (E-bit) har Hello mein jaata hai aur match hona chahiye. Sirf ABR ke paas hai, isliye ABR BR ke Hellos reject karta hai. BR par area 51 stub configure karo aur adjacency wapas aati hai, ab O*IA default ke saath.`}},{title:{en:`Kochi: totally stubby that is not`,hi:`Kochi: totally stubby jo hai hi nahi`},ticket:{en:`The design says area 52 must be totally stubby. A junior engineer made the change and reports it done, but BR still has inter-area routes.`,hi:`Design kehta hai area 52 totally stubby hona chahiye. Ek junior engineer ne change kiya aur done report kiya, lekin BR ke paas ab bhi inter-area routes hain.`},out:`BR#show running-config | section router ospf
router ospf 1
 router-id 1.1.1.1
 area 52 stub no-summary
 passive-interface GigabitEthernet0/1
 network 1.1.1.1 0.0.0.0 area 52
 network 10.52.12.0 0.0.0.3 area 52
 network 192.168.52.0 0.0.0.255 area 52

ABR#show running-config | section router ospf
router ospf 1
 router-id 2.2.2.2
 area 52 stub
 network 2.2.2.2 0.0.0.0 area 0
 network 10.0.23.0 0.0.0.3 area 0
 network 10.52.12.0 0.0.0.3 area 52

BR#show ip route ospf | include IA
O*IA  0.0.0.0/0 [110/2] via 10.52.12.2, 00:04:10, GigabitEthernet0/0
O IA     2.2.2.2 [110/2] via 10.52.12.2, 00:04:10, GigabitEthernet0/0
O IA     3.3.3.3 [110/3] via 10.52.12.2, 00:04:10, GigabitEthernet0/0
O IA     10.0.23.0/30 [110/2] via 10.52.12.2, 00:04:10, GigabitEthernet0/0`,q:{en:`Why are the O IA routes still present?`,hi:`O IA routes ab bhi kyun maujood hain?`},o:[{en:`Totally stubby areas cannot have a passive interface`,hi:`Totally stubby areas mein passive interface nahi ho sakta`},{en:`The ABR must also be configured with area 52 nssa`,hi:`ABR par area 52 nssa bhi configure hona chahiye`},{en:`no-summary was put on BR; only the ABR creates type-3 LSAs, so it must be on the ABR`,hi:`no-summary BR par lagaya gaya; type-3 LSAs sirf ABR banata hai, isliye yeh ABR par hona chahiye`},{en:`BR needs clear ip ospf process to apply no-summary`,hi:`no-summary apply karne ke liye BR ko clear ip ospf process chahiye`}],a:2,w:{en:`no-summary only has an effect on the router that originates type-3 LSAs. Move it to the ABR (area 52 stub no-summary). BR's extra keyword is harmless but useless.`,hi:`no-summary ka asar sirf us router par hota hai jo type-3 LSAs originate karta hai. Ise ABR par le jao (area 52 stub no-summary). BR ka extra keyword harmless hai lekin bekaar.`}},{title:{en:`Nagpur: partner reachable, internet not`,hi:`Nagpur: partner reachable, internet nahi`},ticket:{en:`Area 30 was converted to NSSA so the partner network 172.31.0.0/24 could be advertised. The core now reaches the partner, but branch users cannot reach 203.0.113.0/24.`,hi:`Area 30 ko NSSA mein convert kiya gaya taaki partner network 172.31.0.0/24 advertise ho sake. Core ab partner tak pahunchta hai, lekin branch users 203.0.113.0/24 tak nahi pahunch paate.`},out:`BR#show ip route ospf
      2.0.0.0/32 is subnetted, 1 subnets
O IA     2.2.2.2 [110/2] via 10.30.12.2, 00:02:11, GigabitEthernet0/0
      3.0.0.0/32 is subnetted, 1 subnets
O IA     3.3.3.3 [110/3] via 10.30.12.2, 00:02:11, GigabitEthernet0/0
      10.0.0.0/8 is variably subnetted, 3 subnets, 2 masks
O IA     10.0.23.0/30 [110/2] via 10.30.12.2, 00:02:11, GigabitEthernet0/0

BR#show ip route 0.0.0.0
% Network not in table

ABR#show ip ospf | section Area 30
    Area 30
        Number of interfaces in this area is 1
        It is a NSSA area
        Perform type-7/type-5 LSA translation`,q:{en:`What should you configure?`,hi:`Aapko kya configure karna chahiye?`},o:[{en:`default-information originate always on BR`,hi:`BR par default-information originate always`},{en:`area 30 nssa default-information-originate on the ABR`,hi:`ABR par area 30 nssa default-information-originate`},{en:`area 30 stub on both routers`,hi:`Dono routers par area 30 stub`},{en:`redistribute static subnets on the ABR`,hi:`ABR par redistribute static subnets`}],a:1,w:{en:`A plain NSSA gets no automatic default. The ABR command sends a type-7 default, seen as O*N2 on BR. Converting back to stub would forbid the partner redistribution, and originating a default on BR would point traffic the wrong way.`,hi:`Plain NSSA ko automatic default nahi milta. ABR command ek type-7 default bhejti hai, jo BR par O*N2 dikhta hai. Wapas stub karne se partner redistribution mana ho jaayega, aur BR par default originate karna traffic ko galat taraf bhejega.`}},{title:{en:`New plant isolated after the security change`,hi:`Security change ke baad naya plant isolated`},ticket:{en:`Yesterday the plant in area 2 was connected with a virtual link through area 1. Today security enabled area 0 MD5 on R1 and R2 and R3 with key 1. Every physical neighbour is FULL, but R4 in area 2 has lost all routes to head office.`,hi:`Kal area 2 ke plant ko area 1 ke through virtual link se joda gaya tha. Aaj security ne R1, R2 aur R3 par key 1 ke saath area 0 MD5 enable kiya. Har physical neighbour FULL hai, lekin area 2 mein R4 ne head office ke saare routes kho diye hain.`},out:`R2#show running-config | section router ospf
router ospf 1
 router-id 2.2.2.2
 area 0 authentication message-digest
 area 1 virtual-link 3.3.3.3
 network 10.0.12.0 0.0.0.3 area 0
 network 2.2.2.2 0.0.0.0 area 0
 network 10.1.23.0 0.0.0.3 area 1

R2#show ip ospf virtual-links
Virtual Link OSPF_VL0 to router 3.3.3.3 is up
  Run as demand circuit
  DoNotAge LSA allowed.
  Transit area 1, via interface GigabitEthernet0/1
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5
    Hello due in 00:00:06
    Adjacency State DOWN
  Message digest authentication enabled
    No key configured, using default key id 0`,q:{en:`What is the root cause?`,hi:`Root cause kya hai?`},o:[{en:`Area 1 must also use MD5 for a virtual link to work`,hi:`Virtual link chalne ke liye area 1 mein bhi MD5 hona chahiye`},{en:`Virtual links do not support MD5 authentication`,hi:`Virtual links MD5 authentication support nahi karte`},{en:`The virtual link must point to 10.1.23.2, not 3.3.3.3`,hi:`Virtual link 10.1.23.2 ko point kare, 3.3.3.3 ko nahi`},{en:`The virtual link is an area 0 interface and now needs its own MD5 key`,hi:`Virtual link area 0 interface hai aur ab use apni MD5 key chahiye`}],a:3,w:{en:`area 0 authentication message-digest applies to OSPF_VL0 too, but no key exists for it ("No key configured"). Add area 1 virtual-link 3.3.3.3 message-digest-key 1 md5 with the area 0 key on R2, and the mirror command on R3.`,hi:`area 0 authentication message-digest OSPF_VL0 par bhi lagta hai, lekin uske liye koi key nahi ("No key configured"). R2 par area 0 key ke saath area 1 virtual-link 3.3.3.3 message-digest-key 1 md5 jodo, aur R3 par mirror command.`}},{title:{en:`SEC-12: one link still down`,hi:`SEC-12: ek link ab bhi down`},ticket:{en:`R1 has been fixed and is FULL with R2. The R2 to R3 link in area 1 is still down. Both sides show interface-level MD5 with key 1.`,hi:`R1 theek ho gaya aur R2 ke saath FULL hai. Area 1 mein R2 se R3 link ab bhi down hai. Dono sides interface-level MD5 key 1 ke saath dikhati hain.`},out:`R2#debug ip ospf adj
OSPF-1 ADJ   Gi0/1: Rcv pkt from 10.1.23.2 : Mismatched Authentication Key - Message Digest Key 1

R2#show running-config interface GigabitEthernet0/1 | include ospf
 ip ospf authentication message-digest
 ip ospf message-digest-key 1 md5 Br@nch23

R3#show running-config interface GigabitEthernet0/0 | include ospf
 ip ospf authentication message-digest
 ip ospf message-digest-key 1 md5 br@nch23`,q:{en:`What is wrong?`,hi:`Kya galat hai?`},o:[{en:`The keys differ in case; OSPF keys are case-sensitive`,hi:`Keys ka case alag hai; OSPF keys case-sensitive hoti hain`},{en:`Area 1 needs area 1 authentication message-digest`,hi:`Area 1 ko area 1 authentication message-digest chahiye`},{en:`Key IDs must be different on each end`,hi:`Har end par key IDs alag honi chahiye`},{en:`MD5 keys longer than 8 characters are truncated`,hi:`8 characters se lambi MD5 keys truncate ho jaati hain`}],a:0,w:{en:`"Mismatched Authentication Key" means type and key ID agree but the digest does not. Br@nch23 and br@nch23 are different keys. Remove key 1 on R3 and re-add it with the correct case. The 8-character limit applies to plain-text keys, not MD5.`,hi:`"Mismatched Authentication Key" ka matlab type aur key ID agree karte hain lekin digest nahi. Br@nch23 aur br@nch23 alag keys hain. R3 par key 1 hatao aur sahi case ke saath dobara jodo. 8-character limit plain-text keys par lagti hai, MD5 par nahi.`}},{title:{en:`DCI down after the key rollover`,hi:`Key rollover ke baad DCI down`},ticket:{en:`Key 2 was added to key chain OSPF-SHA on DC1 and DC2 during tonight's rollover. Forty seconds later the DCI adjacency dropped and has not returned.`,hi:`Aaj raat ke rollover mein DC1 aur DC2 par key chain OSPF-SHA mein key 2 joda gaya. Chaalees seconds baad DCI adjacency drop hui aur wapas nahi aayi.`},out:`DC1#show key chain OSPF-SHA
Key-chain OSPF-SHA:
    key 1 -- text "Nk-Sha256-Key"
        cryptographic-algorithm: hmac-sha-256
    key 2 -- text "Nk-Sha512-Key"
        cryptographic-algorithm: hmac-sha-512

DC2#show key chain OSPF-SHA
Key-chain OSPF-SHA:
    key 1 -- text "Nk-Sha256-Key"
        cryptographic-algorithm: hmac-sha-256
    key 2 -- text "Nk-Sha512-Key"
        cryptographic-algorithm: hmac-sha-384

DC1#show ip ospf interface GigabitEthernet0/0 | include SA
    Sending SA: Key 2, Algorithm HMAC-SHA-512 - key chain OSPF-SHA`,q:{en:`Why did the adjacency fail?`,hi:`Adjacency kyun fail hui?`},o:[{en:`Only one key is allowed per key chain`,hi:`Ek key chain mein sirf ek key allowed hai`},{en:`The key chain names must differ on each router`,hi:`Har router par key chain naam alag hone chahiye`},{en:`Key 2 uses different algorithms on the two routers, so the digests never match`,hi:`Key 2 dono routers par alag algorithms use karti hai, isliye digests kabhi match nahi karte`},{en:`HMAC-SHA-512 is not supported for OSPF`,hi:`OSPF ke liye HMAC-SHA-512 supported nahi hai`}],a:2,w:{en:`Both routers send with key 2, the newest key. Key ID and string match, but DC1 uses hmac-sha-512 and DC2 hmac-sha-384, so each side rejects the other's packets. Set the same algorithm on key 2 on both routers.`,hi:`Dono routers key 2, sabse nayi key, se bhejte hain. Key ID aur string match karte hain, lekin DC1 hmac-sha-512 aur DC2 hmac-sha-384 use karta hai, isliye har side doosre ke packets reject karti hai. Dono routers par key 2 ka same algorithm set karo.`}},{title:{en:`Store-to-store routes broken after hub reload`,hi:`Hub reload ke baad store-to-store routes toote`},ticket:{en:`The hub of an NBMA hub-and-spoke network reloaded for an upgrade. Stores can still reach head office, but store-to-store traffic fails.`,hi:`NBMA hub-and-spoke network ka hub upgrade ke liye reload hua. Stores ab bhi head office tak pahunchte hain, lekin store-to-store traffic fail hota hai.`},out:`HUB#show ip ospf interface GigabitEthernet0/2 | include Type|State|Designated
  Process ID 1, Router ID 10.0.0.1, Network Type NON_BROADCAST, Cost: 1
  Transmit Delay is 1 sec, State DROTHER, Priority 1
  Designated Router (ID) 10.0.0.3, Interface address 10.10.0.3
  Backup Designated router (ID) 10.0.0.2, Interface address 10.10.0.2

HUB#show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
10.0.0.2          1   FULL/BDR        00:01:48    10.10.0.2       GigabitEthernet0/2
10.0.0.3          1   FULL/DR         00:01:52    10.10.0.3       GigabitEthernet0/2`,q:{en:`What is the permanent fix?`,hi:`Permanent fix kya hai?`},o:[{en:`Change the hub to network type broadcast`,hi:`Hub ko network type broadcast karo`},{en:`Set ip ospf priority 0 on every spoke so only the hub can be DR`,hi:`Har spoke par ip ospf priority 0 set karo taaki sirf hub DR ban sake`},{en:`Remove the neighbor statements from the hub`,hi:`Hub se neighbor statements hatao`},{en:`Lower the hello timer on the hub to 10 seconds`,hi:`Hub par hello timer 10 seconds karo`}],a:1,w:{en:`A spoke won the DR election while the hub was down, and DR election is not pre-emptive. Spokes cannot reach each other directly, so a spoke DR breaks the design. Priority 0 on spokes (then a controlled reset) guarantees the hub is DR. Changing type or timers alone would break the adjacencies.`,hi:`Hub down tha tab ek spoke ne DR election jeet liya, aur DR election pre-emptive nahi hai. Spokes ek doosre tak seedhe nahi pahunch sakte, isliye spoke DR design tod deta hai. Spokes par priority 0 (phir controlled reset) guarantee karta hai ki hub DR ho. Sirf type ya timers badalne se adjacencies toot jaayengi.`}},{title:{en:`All internet traffic on the backup circuit`,hi:`Saara internet traffic backup circuit par`},ticket:{en:`The company has a primary internet ASBR (EDGE1, 3.3.3.3) and a backup (EDGE2, 5.5.5.5). After a template cleanup, every router sends internet traffic to EDGE2, which is much further away and has a small circuit.`,hi:`Company ke paas ek primary internet ASBR (EDGE1, 3.3.3.3) aur ek backup (EDGE2, 5.5.5.5) hai. Template cleanup ke baad har router internet traffic EDGE2 ko bhejta hai, jo kaafi door hai aur uska circuit chhota hai.`},out:`EDGE1#show running-config | include default-information
 default-information originate always metric 1

EDGE2#show running-config | include default-information
 default-information originate always metric 100 metric-type 1

CORE#show ip ospf database external 0.0.0.0 | include Advertising|Metric
  Advertising Router: 3.3.3.3
        Metric Type: 2 (Larger than any link state path)
        Metric: 1
  Advertising Router: 5.5.5.5
        Metric Type: 1 (Comparable directly to link state metric)
        Metric: 100

CORE#show ip route 0.0.0.0 | include Known
  Known via "ospf 1", distance 110, metric 104, candidate default path, type extern 1`,q:{en:`Why does CORE prefer EDGE2?`,hi:`CORE EDGE2 ko kyun prefer karta hai?`},o:[{en:`EDGE2 has a higher router ID`,hi:`EDGE2 ka router ID zyada hai`},{en:`A metric of 104 is lower than the E2 forward metric`,hi:`104 ka metric E2 forward metric se kam hai`},{en:`The always keyword on EDGE1 is ignored`,hi:`EDGE1 par always keyword ignore hota hai`},{en:`An E1 route is always preferred to an E2 route, whatever the metrics`,hi:`E1 route hamesha E2 route se prefer hota hai, metrics chahe jo hon`}],a:3,w:{en:`OSPF compares route types before metrics: O, O IA, E1/N1, E2/N2. EDGE2's default is E1, EDGE1's is E2, so E2 can never win. Put EDGE2 back to metric-type 2 (or make both E1 with sensible metrics).`,hi:`OSPF metrics se pehle route types compare karta hai: O, O IA, E1/N1, E2/N2. EDGE2 ka default E1 hai, EDGE1 ka E2, isliye E2 kabhi nahi jeet sakta. EDGE2 ko wapas metric-type 2 par karo (ya dono ko sahi metrics ke saath E1 banao).`}}];export{e as default};