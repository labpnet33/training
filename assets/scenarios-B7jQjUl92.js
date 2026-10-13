var e=[{title:{en:`Auto-RP learns up to R3 and stops`,hi:`Auto-RP R3 tak seekhta hai aur ruk jaata hai`},ticket:{en:`Sahyadri University: classroom PCs behind R5 get no live class. The chain is R1-R2-R3-R4-R5, R2 is the candidate RP, R3 the mapping agent. Output from R3 and R4 below.`,hi:`Sahyadri University: R5 ke peeche classroom PCs ko live class nahi milti. Chain R1-R2-R3-R4-R5 hai, R2 candidate RP hai, R3 mapping agent. R3 aur R4 ka output neeche.`},out:`R3#show ip pim rp mapping
PIM Group-to-RP Mappings
This system is an RP-mapping agent (Loopback0)

Group(s) 224.0.0.0/4
  RP 2.2.2.2 (?), v2v1
    Info source: 3.3.3.3 (?), elected via Auto-RP
         Uptime: 00:04:12, expires: 00:02:30

R3#show running-config | include pim
 ip pim sparse-mode
 ip pim sparse-mode
 ip pim sparse-mode
ip pim autorp listener
ip pim send-rp-discovery Loopback0 scope 8

R4#show ip pim rp mapping
PIM Group-to-RP Mappings

R4#show running-config | include pim
 ip pim sparse-mode
 ip pim sparse-mode
 ip pim sparse-mode`,q:{en:`What is the most likely cause?`,hi:`Sabse likely kaaran kya hai?`},o:[{en:`The mapping agent scope is too small`,hi:`Mapping agent ka scope bahut chhota hai`},{en:`R2 announces the wrong group range`,hi:`R2 galat group range announce karta hai`},{en:`R4 has no ip pim autorp listener, so it does not forward 224.0.1.40`,hi:`R4 par ip pim autorp listener nahi hai, isliye woh 224.0.1.40 forward nahi karta`},{en:`R5 needs a static RP`,hi:`R5 ko static RP chahiye`}],a:2,w:{en:`The agent has the mapping and its scope is 8, so the discovery message is sent. R4 lacks the listener command that R3 has, so it neither learns nor forwards the dense Auto-RP groups; R5 behind it learns nothing either.`,hi:`Agent ke paas mapping hai aur scope 8 hai, isliye discovery message jaata hai. R4 ke paas woh listener command nahi jo R3 ke paas hai, isliye woh dense Auto-RP groups na seekhta hai na forward karta hai; uske peeche R5 bhi kuch nahi seekhta.`}},{title:{en:`RP is known but nobody can reach it`,hi:`RP pata hai par koi uske paas nahi pahunch sakta`},ticket:{en:`Bharat Retail: the Bengaluru router shows the RP in its mapping but the receiver gets nothing and the (*,G) entry is missing.`,hi:`Bharat Retail: Bengaluru router mapping mein RP dikhata hai par receiver ko kuch nahi milta aur (*,G) entry missing hai.`},out:`R5#show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s) 224.0.0.0/4
  RP 2.2.2.2 (?), v2v1
    Info source: 3.3.3.3 (?), elected via Auto-RP
         Uptime: 00:02:05, expires: 00:02:55

R5#show ip route 2.2.2.2
% Network not in table

R2#show running-config | section router ospf
router ospf 1
 network 10.0.0.0 0.255.255.255 area 0`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Advertise the RP loopback 2.2.2.2 in OSPF on R2`,hi:`R2 par RP loopback 2.2.2.2 ko OSPF mein advertise karo`},{en:`Add ip pim autorp listener on R5`,hi:`R5 par ip pim autorp listener jodo`},{en:`Change the priority of the candidate RP`,hi:`Candidate RP ki priority badlo`},{en:`Enable IGMP version 3 on R5`,hi:`R5 par IGMP version 3 enable karo`}],a:0,w:{en:`The mapping is fine, the unicast route to the RP is missing. The OSPF network statement covers 10.0.0.0/8 but not the 2.2.2.2 loopback, so joins and registers cannot reach the RP.`,hi:`Mapping theek hai, RP ka unicast route missing hai. OSPF network statement 10.0.0.0/8 cover karta hai par 2.2.2.2 loopback nahi, isliye joins aur registers RP tak nahi pahunch sakte.`}},{title:{en:`Two sites elect two different BSRs`,hi:`Do sites do alag BSRs elect karte hain`},ticket:{en:`Zenith Logistics: after a change window Chennai cannot receive a channel that Mumbai receives. A new core link was added between R3 and R4.`,hi:`Zenith Logistics: change window ke baad Chennai woh channel receive nahi kar pa raha jo Mumbai kar raha hai. R3 aur R4 ke beech naya core link jodha gaya.`},out:`Mumbai-R1#show ip pim bsr-router
PIMv2 Bootstrap information
  This system is the Bootstrap Router (BSR)
  BSR address: 1.1.1.1 (?)
  Uptime:      01:10:03, BSR Priority: 10, Hash mask length: 24

Chennai-R5#show ip pim bsr-router
PIMv2 Bootstrap information
  BSR address: 2.2.2.2 (?)
  Uptime:      00:12:40, BSR Priority: 0, Hash mask length: 0

R3#show ip pim interface
Address          Interface                Ver/   Nbr    Query  DR     DR
                                          Mode   Count  Intvl  Prior
10.0.2.1         GigabitEthernet0/0       v2/S   1      30     1      10.0.2.2
10.0.4.1         GigabitEthernet0/2       v2/S   0      30     1      10.0.4.1`,q:{en:`Which finding explains the split?`,hi:`Kaunsi finding split ko explain karti hai?`},o:[{en:`R1 has a hash mask of 24`,hi:`R1 ka hash mask 24 hai`},{en:`R5 is a candidate RP`,hi:`R5 candidate RP hai`},{en:`The BSR priority of R2 is 0`,hi:`R2 ki BSR priority 0 hai`},{en:`The new link Gi0/2 has no PIM neighbour, so the Bootstrap flood cannot cross it`,hi:`Naye link Gi0/2 par koi PIM neighbour nahi, isliye Bootstrap flood use cross nahi kar sakta`}],a:3,w:{en:`Bootstrap messages travel hop by hop over PIM. Gi0/2 shows zero PIM neighbours, so the flood from R1 never reaches Chennai, and Chennai elected the best candidate it can see. Enable PIM on the far side as well.`,hi:`Bootstrap messages PIM par hop by hop chalte hain. Gi0/2 zero PIM neighbours dikhata hai, isliye R1 ka flood Chennai tak nahi pahunchta, aur Chennai ne jo best candidate dikha use elect kar liya. Door wali side par bhi PIM enable karo.`}},{title:{en:`One router uses a different RP`,hi:`Ek router alag RP use karta hai`},ticket:{en:`Bharat Retail: only the Hyderabad router has no IPTV. BSR is healthy, the RP is 3.3.3.3 on every other router.`,hi:`Bharat Retail: sirf Hyderabad router par IPTV nahi. BSR theek hai, baaki har router par RP 3.3.3.3 hai.`},out:`HYD#show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s) 224.0.0.0/4
  RP 3.3.3.3 (?), v2
    Info source: 1.1.1.1 (?), via bootstrap, priority 5, holdtime 150
         Uptime: 00:10:02, expires: 00:01:58

Group(s): 224.0.0.0/4, Static-Override
    RP: 7.7.7.7 (?)

HYD#show ip mroute 239.10.1.1
(*, 239.10.1.1), 00:03:11/stopped, RP 7.7.7.7, flags: SJC
  Incoming interface: GigabitEthernet0/1, RPF nbr 10.0.7.1`,q:{en:`Why is HYD different from the other routers?`,hi:`HYD baaki routers se alag kyun hai?`},o:[{en:`The BSR chose 7.7.7.7 for HYD only`,hi:`BSR ne sirf HYD ke liye 7.7.7.7 chuna`},{en:`A static ip pim rp-address 7.7.7.7 override on HYD beats the learned RP`,hi:`HYD par static ip pim rp-address 7.7.7.7 override learned RP ko haraata hai`},{en:`The hash mask length differs`,hi:`Hash mask length alag hai`},{en:`HYD is the mapping agent`,hi:`HYD mapping agent hai`}],a:1,w:{en:`The Static-Override block is the clue, and the mroute shows RP 7.7.7.7. Override makes the static RP beat learned mappings on that router only. Remove the line.`,hi:`Static-Override block clue hai, aur mroute RP 7.7.7.7 dikhata hai. Override static RP ko us router par hi learned mappings se jitwa deta hai. Line hata do.`}},{title:{en:`Anycast RP: Delhi gets nothing from Mumbai`,hi:`Anycast RP: Delhi ko Mumbai se kuch nahi milta`},ticket:{en:`Deccan Broadcast: two anycast RPs share 10.255.255.100. The Mumbai studio registers on R2; the Delhi viewer joined at R4. Nothing arrives.`,hi:`Deccan Broadcast: do anycast RPs 10.255.255.100 share karte hain. Mumbai studio R2 par register karta hai; Delhi viewer ne R4 par join kiya. Kuch nahi aata.`},out:`R2#show running-config | include msdp
ip msdp peer 4.4.4.4 connect-source Loopback1

R2#show ip msdp summary
MSDP Peer Status Summary
Peer Address     AS    State    Uptime/  Reset SA    Peer Name
                                Downtime Count Count
4.4.4.4          ?     Down     00:07:40 3     0     ?

R4#show ip msdp sa-cache
MSDP Source-Active Cache - 0 entries`,q:{en:`What should you change?`,hi:`Kya badalna chahiye?`},o:[{en:`Change the RP address to 2.2.2.2 on all routers`,hi:`Saare routers par RP address 2.2.2.2 kar do`},{en:`Add a second MSDP peer to R3`,hi:`R3 ko doosra MSDP peer jodo`},{en:`Source the MSDP session from the unique Loopback0 instead of the anycast Loopback1`,hi:`MSDP session ko anycast Loopback1 ki jagah unique Loopback0 se source karo`},{en:`Shut Loopback1 on R4`,hi:`R4 par Loopback1 shut karo`}],a:2,w:{en:`Loopback1 carries the shared anycast address, which exists on both RPs, so the TCP session cannot be built between the two routers. Use each RP unique loopback (2.2.2.2 and 4.4.4.4) as connect source. The SA cache stays empty until the peering is up.`,hi:`Loopback1 par shared anycast address hai, jo dono RPs par hai, isliye dono routers ke beech TCP session nahi ban sakta. Har RP ka unique loopback (2.2.2.2 aur 4.4.4.4) connect source ki tarah use karo. Peering up hone tak SA cache khaali rehta hai.`}},{title:{en:`The exam stream has no RP`,hi:`Exam stream ka koi RP nahi`},ticket:{en:`Sahyadri University added exam streams on 239.30.0.0/16. Live classes (239.20.0.0/16) work. The new stream shows RP 0.0.0.0 on every router. The only candidate RP is R2 with Auto-RP.`,hi:`Sahyadri University ne 239.30.0.0/16 par exam streams jodi. Live classes (239.20.0.0/16) kaam karti hain. Nayi stream har router par RP 0.0.0.0 dikhati hai. Akela candidate RP R2 hai Auto-RP ke saath.`},out:`R2#show running-config | include send-rp|access-list
access-list 10 permit 239.20.0.0 0.0.255.255
ip pim send-rp-announce Loopback0 scope 8 group-list 10

R4#show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s) 239.20.0.0/16
  RP 2.2.2.2 (?), v2v1
    Info source: 3.3.3.3 (?), elected via Auto-RP

R4#show ip mroute 239.30.1.1
(*, 239.30.1.1), 00:00:44/stopped, RP 0.0.0.0, flags: SPF`,q:{en:`What is the smallest correct change?`,hi:`Sabse chhota sahi change kya hai?`},o:[{en:`Add permit 239.30.0.0 0.0.255.255 to access-list 10 on R2`,hi:`R2 par access-list 10 mein permit 239.30.0.0 0.0.255.255 jodo`},{en:`Increase the discovery scope to 16`,hi:`Discovery scope 16 kar do`},{en:`Add ip pim autorp listener on all routers`,hi:`Saare routers par ip pim autorp listener jodo`},{en:`Configure a second mapping agent`,hi:`Doosra mapping agent configure karo`}],a:0,w:{en:`The mapping already works, but only for 239.20.0.0/16 because of the group-list ACL. The exam range is not in the ACL, so no RP is announced for it. Add the range to the ACL on the candidate RP.`,hi:`Mapping pehle se kaam karti hai, lekin group-list ACL ki wajah se sirf 239.20.0.0/16 ke liye. Exam range ACL mein nahi hai, isliye uske liye koi RP announce nahi hota. Candidate RP par range ko ACL mein jodo.`}},{title:{en:`Which candidate RP wins in the BSR set?`,hi:`BSR set mein kaunsa candidate RP jeetta hai?`},ticket:{en:`Zenith Logistics asks which RP the network uses for 239.5.5.5 and which for 239.50.1.1. Output of the RP-set below. Neither group is in the SSM range.`,hi:`Zenith Logistics poochta hai ki network 239.5.5.5 ke liye kaunsa RP use karta hai aur 239.50.1.1 ke liye kaunsa. RP-set ka output neeche. Koi group SSM range mein nahi.`},out:`R4#show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s) 224.0.0.0/4
  RP 3.3.3.3 (?), v2
    Info source: 1.1.1.1 (?), via bootstrap, priority 10, holdtime 150
  RP 5.5.5.5 (?), v2
    Info source: 1.1.1.1 (?), via bootstrap, priority 5, holdtime 150
Group(s) 239.50.0.0/16
  RP 3.3.3.3 (?), v2
    Info source: 1.1.1.1 (?), via bootstrap, priority 200, holdtime 150`,q:{en:`What are the RPs for 239.5.5.5 and 239.50.1.1?`,hi:`239.5.5.5 aur 239.50.1.1 ke RPs kya hain?`},o:[{en:`3.3.3.3 for both`,hi:`Dono ke liye 3.3.3.3`},{en:`5.5.5.5 for both`,hi:`Dono ke liye 5.5.5.5`},{en:`3.3.3.3 for 239.5.5.5 and 5.5.5.5 for 239.50.1.1`,hi:`239.5.5.5 ke liye 3.3.3.3 aur 239.50.1.1 ke liye 5.5.5.5`},{en:`5.5.5.5 for 239.5.5.5 and 3.3.3.3 for 239.50.1.1`,hi:`239.5.5.5 ke liye 5.5.5.5 aur 239.50.1.1 ke liye 3.3.3.3`}],a:3,w:{en:`For 239.5.5.5 only the /4 range matches; the lower priority value (5) wins, so 5.5.5.5. For 239.50.1.1 the /16 is the longest match, so 3.3.3.3 wins whatever its priority (200).`,hi:`239.5.5.5 ke liye sirf /4 range match karti hai; kam priority value (5) jeetti hai, isliye 5.5.5.5. 239.50.1.1 ke liye /16 longest match hai, isliye 3.3.3.3 jeetta hai chahe uski priority (200) ho.`}},{title:{en:`Far routers have no Auto-RP mapping`,hi:`Door ke routers ke paas Auto-RP mapping nahi`},ticket:{en:`Deccan Broadcast has five routers in a line. R2, R3 and R4 know the RP, R1 and R5 do not. R3 is the mapping agent and R2 the candidate RP. All routers have the listener.`,hi:`Deccan Broadcast ke paas ek line mein paanch routers hain. R2, R3 aur R4 RP jaante hain, R1 aur R5 nahi. R3 mapping agent hai aur R2 candidate RP. Saare routers par listener hai.`},out:`R3#show running-config | include send-rp|listener
ip pim autorp listener
ip pim send-rp-discovery Loopback0 scope 1

R4#show ip pim rp mapping
Group(s) 224.0.0.0/4
  RP 2.2.2.2 (?), v2v1
    Info source: 3.3.3.3 (?), elected via Auto-RP

R5#show ip pim rp mapping
PIM Group-to-RP Mappings`,q:{en:`What do you change?`,hi:`Kya badalte ho?`},o:[{en:`Change the candidate RP to R4`,hi:`Candidate RP ko R4 kar do`},{en:`Raise the mapping agent scope to 2 or more`,hi:`Mapping agent ka scope 2 ya zyada karo`},{en:`Remove the listener from R3`,hi:`R3 se listener hata do`},{en:`Add a static RP on R1 and R5 only`,hi:`Sirf R1 aur R5 par static RP jodo`}],a:1,w:{en:`Scope 1 lets the discovery messages travel one hop only: R2 and R4 (neighbours of R3) learn them, but R1 and R5 are two hops away. A scope of 2 or more reaches the ends. A static RP on two routers would hide the problem and risk inconsistency.`,hi:`Scope 1 discovery messages ko sirf ek hop jaane deta hai: R2 aur R4 (R3 ke padosi) seekhte hain, lekin R1 aur R5 do hop door hain. Scope 2 ya zyada ends tak pahunchta hai. Sirf do routers par static RP problem chhupa dega aur inconsistency ka risk hai.`}}];export{e as default};