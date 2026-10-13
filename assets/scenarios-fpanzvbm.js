var e=[{title:{en:`Branch reachable one way only`,hi:`Branch sirf ek taraf se reachable`},ticket:{en:`After a maintenance on R2, branch hosts in 10.1.10.0/24 cannot reach SRV1 (10.3.30.10). R1 has a route to 10.3.30.0/24 and the OSPF and EIGRP neighbours are up. Constraint: no static routes.`,hi:`R2 par maintenance ke baad, 10.1.10.0/24 ke branch hosts SRV1 (10.3.30.10) tak nahi pahunch pa rahe. R1 ke paas 10.3.30.0/24 ka route hai aur OSPF aur EIGRP neighbours up hain. Constraint: static routes nahi.`},out:`R3# show ip route 10.1.10.10
% Subnet not in table

R2# show ip eigrp topology 10.1.10.0/24
%Entry 10.1.10.0/24 not in topology table

R2# show run | section router eigrp
router eigrp 100
 network 10.0.23.0 0.0.0.3
 redistribute ospf 1`,q:{en:`What is the correct fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Add a static route on R3 for 10.1.10.0/24 via 10.0.23.1`,hi:`R3 par 10.0.23.1 ke through 10.1.10.0/24 ka static route jodo`},{en:`Add network 10.1.10.0 0.0.0.255 under router eigrp 100 on R2`,hi:`R2 par router eigrp 100 ke neeche network 10.1.10.0 0.0.0.255 jodo`},{en:`Give the redistributed OSPF routes a seed metric on R2, for example redistribute ospf 1 metric 100000 10 255 1 1500`,hi:`R2 par redistributed OSPF routes ko seed metric do, jaise redistribute ospf 1 metric 100000 10 255 1 1500`},{en:`Clear the EIGRP neighbourship between R2 and R3`,hi:`R2 aur R3 ke beech EIGRP neighbourship clear karo`}],a:2,w:{en:`Classic EIGRP needs a seed metric for routes redistributed from another routing protocol; without one, nothing enters the topology table, which is exactly what R2 shows. A static route violates the constraint, a network statement for a subnet that is not connected to R2 does nothing, and clearing the neighbour does not change the missing metric.`,hi:`Classic EIGRP ko doosre routing protocol se redistribute hue routes ke liye seed metric chahiye; iske bina topology table mein kuch nahi aata, bilkul wahi jo R2 dikhata hai. Static route constraint todta hai, R2 se connected na hone wale subnet ka network statement kuch nahi karta, aur neighbour clear karne se missing metric nahi badalta.`}},{title:{en:`LSA present, route missing`,hi:`LSA maujood, route missing`},ticket:{en:`R1 cannot reach 10.3.30.0/24. The OSPF adjacency to R2 is Full. Another engineer says R2 is not advertising the prefix.`,hi:`R1 10.3.30.0/24 tak nahi pahunch pa raha. R2 ke saath OSPF adjacency Full hai. Doosra engineer kehta hai ki R2 prefix advertise nahi kar raha.`},out:`R1# show ip ospf database external 10.3.30.0 | include Link State ID|Advertising
  Link State ID: 10.3.30.0 (External Network Number )
  Advertising Router: 10.255.0.2

R1# show ip route 10.3.30.10
% Subnet not in table

R1# show ip protocols | include Routing Protocol|filter
Routing Protocol is "ospf 1"
  Outgoing update filter list for all interfaces is not set
  Incoming update filter list for all interfaces is 10

R1# show access-lists 10
Standard IP access list 10
    10 deny   10.3.30.0, wildcard bits 0.0.0.255
    20 permit any`,q:{en:`What is the root cause?`,hi:`Root cause kya hai?`},o:[{en:`An inbound distribute list on R1 using ACL 10 stops the route from entering the routing table`,hi:`R1 par ACL 10 use karti inbound distribute list route ko routing table mein aane se rokti hai`},{en:`R2 is not advertising 10.3.30.0/24`,hi:`R2 10.3.30.0/24 advertise nahi kar raha`},{en:`R1 is in a stub area and drops type 5 LSAs`,hi:`R1 stub area mein hai aur type 5 LSAs drop karta hai`},{en:`The LSA has aged out and must be refreshed`,hi:`LSA age out ho gaya hai aur refresh hona chahiye`}],a:0,w:{en:`The type 5 LSA from 10.255.0.2 is in R1's database, so R2 is advertising it and R1 is not in a stub area (stub areas would not hold the LSA at all). An OSPF distribute-list in filters the RIB, not the LSDB, and ACL 10 denies 10.3.30.0/24.`,hi:`10.255.0.2 ka type 5 LSA R1 ke database mein hai, isliye R2 ise advertise kar raha hai aur R1 stub area mein nahi hai (stub areas mein LSA hota hi nahi). OSPF distribute-list in RIB filter karta hai, LSDB nahi, aur ACL 10 10.3.30.0/24 deny karti hai.`}},{title:{en:`Ping yes, portal no`,hi:`Ping haan, portal nahi`},ticket:{en:`Branch users can ping SRV1 (10.3.30.10) but the HTTPS portal times out. Policy: SRV1 must accept only ICMP, SSH and HTTPS.`,hi:`Branch users SRV1 (10.3.30.10) ko ping kar sakte hain par HTTPS portal time out hota hai. Policy: SRV1 sirf ICMP, SSH aur HTTPS accept kare.`},out:`R3# show ip interface GigabitEthernet0/2 | include access list
  Outgoing access list is SRV-PROTECT
  Inbound  access list is not set

R3# show access-lists SRV-PROTECT
Extended IP access list SRV-PROTECT
    10 permit icmp any any (52 matches)
    20 permit tcp any any eq 22 (8 matches)
    30 deny ip any any log (214 matches)

R3# show logging | include SRV-PROTECT
%SEC-6-IPACCESSLOGP: list SRV-PROTECT denied tcp 10.1.10.10(51544) -> 10.3.30.10(443), 1 packet`,q:{en:`Which change fixes the ticket and respects the policy?`,hi:`Kaunsa change ticket fix karta hai aur policy ka samman karta hai?`},o:[{en:`Remove ip access-group SRV-PROTECT out from Gi0/2`,hi:`Gi0/2 se ip access-group SRV-PROTECT out hatao`},{en:`Apply SRV-PROTECT inbound instead of outbound`,hi:`SRV-PROTECT ko outbound ki jagah inbound lagao`},{en:`Replace line 30 with permit ip any any`,hi:`Line 30 ko permit ip any any se replace karo`},{en:`Add 25 permit tcp any host 10.3.30.10 eq 443 to SRV-PROTECT`,hi:`SRV-PROTECT mein 25 permit tcp any host 10.3.30.10 eq 443 jodo`}],a:3,w:{en:`The log proves the deny on line 30 for TCP 443. Inserting a permit for HTTPS before the deny is the minimal fix that keeps the server protected. Removing the ACL or permitting everything breaks the policy, and applying it inbound on the server-facing interface would filter SRV1's replies instead of the users' requests.`,hi:`Log TCP 443 ke liye line 30 par deny sabit karta hai. Deny se pehle HTTPS ka permit daalna minimal fix hai jo server ko protected rakhta hai. ACL hatana ya sab permit karna policy todta hai, aur server-facing interface par inbound lagane se users ki requests ki jagah SRV1 ke replies filter honge.`}},{title:{en:`The routing table says one thing, traffic does another`,hi:`Routing table kuch kehti hai, traffic kuch aur karta hai`},ticket:{en:`Web traffic from the branch LAN to the data centre leaves R1 over the slow backup DSL link (Gi0/2, next hop 198.51.100.1), although the routing table points to the MPLS link Gi0/0. Other traffic uses Gi0/0.`,hi:`Branch LAN se data centre tak web traffic R1 se slow backup DSL link (Gi0/2, next hop 198.51.100.1) par nikalta hai, jabki routing table MPLS link Gi0/0 ki taraf point karti hai. Baaki traffic Gi0/0 use karta hai.`},out:`R1# show ip route 10.3.30.10 | include via
  Last update from 10.0.12.2 on GigabitEthernet0/0, 00:31:02 ago
  * 10.0.12.2, from 10.255.0.2, 00:31:02 ago, via GigabitEthernet0/0

R1# show ip policy
Interface      Route map
Gi0/1          PBR-WEB

R1# show route-map PBR-WEB
route-map PBR-WEB, permit, sequence 10
  Match clauses:
    ip address (access-lists): WEB-TRAFFIC
  Set clauses:
    ip next-hop 198.51.100.1
  Policy routing matches: 18422 packets, 2201334 bytes`,q:{en:`Why does web traffic use the DSL link?`,hi:`Web traffic DSL link kyun use karta hai?`},o:[{en:`A floating static route for web traffic has a lower AD than OSPF`,hi:`Web traffic ke liye floating static route ka AD OSPF se kam hai`},{en:`PBR on Gi0/1 matches web traffic and sets next hop 198.51.100.1 before the routing table is consulted`,hi:`Gi0/1 par PBR web traffic match karta hai aur routing table dekhne se pehle next hop 198.51.100.1 set karta hai`},{en:`CEF load-shares web flows across both links`,hi:`CEF web flows ko dono links par load-share karta hai`},{en:`The OSPF route is flapping and web traffic follows the backup`,hi:`OSPF route flap ho raha hai aur web traffic backup follow karta hai`}],a:1,w:{en:`The route map is applied to the LAN interface and has thousands of matches with a set ip next-hop to the DSL gateway. PBR is evaluated before the routing table for packets arriving on that interface. There is no static route in the output, the OSPF route is 31 minutes old and stable, and ECMP would need two equal routes.`,hi:`Route map LAN interface par laga hai aur DSL gateway ki taraf set ip next-hop ke saath hazaaron matches hain. Us interface par aane wale packets ke liye PBR routing table se pehle evaluate hota hai. Output mein koi static route nahi, OSPF route 31 minute purana aur stable hai, aur ECMP ke liye do barabar routes chahiye.`}},{title:{en:`The backup that became primary`,hi:`Backup jo primary ban gaya`},ticket:{en:`An engineer added a DSL backup route to the data centre yesterday. Since then all data-centre traffic from R1 uses DSL instead of the OSPF path through R2.`,hi:`Kal ek engineer ne data centre ka DSL backup route joda. Tab se R1 ka saara data-centre traffic R2 ke through OSPF path ki jagah DSL use karta hai.`},out:`R1# show ip route 10.3.30.10
Routing entry for 10.3.0.0/16
  Known via "static", distance 1, metric 0
  Routing Descriptor Blocks:
  * 198.51.100.1
      Route metric is 0, traffic share count is 1

R1# show ip ospf database external 10.3.0.0 | include Link State ID|Advertising
  Link State ID: 10.3.0.0 (External Network Number )
  Advertising Router: 10.255.0.2

R1# show run | include ip route
ip route 10.3.0.0 255.255.0.0 198.51.100.1`,q:{en:`What should be changed?`,hi:`Kya badalna chahiye?`},o:[{en:`Lower the OSPF cost on Gi0/0`,hi:`Gi0/0 par OSPF cost kam karo`},{en:`Change the OSPF distance to 1`,hi:`OSPF distance 1 kar do`},{en:`Give the static route an AD higher than 110, for example ip route 10.3.0.0 255.255.0.0 198.51.100.1 250`,hi:`Static route ko 110 se zyada AD do, jaise ip route 10.3.0.0 255.255.0.0 198.51.100.1 250`},{en:`Summarise 10.3.0.0/16 on R2 into two /17 routes`,hi:`R2 par 10.3.0.0/16 ko do /17 routes mein summarise karo`}],a:2,w:{en:`Both routes are 10.3.0.0/16, so AD decides: static 1 beats OSPF 110 and the backup becomes primary. Raising the static AD above 110 makes it a floating static that appears only if the OSPF route disappears. OSPF cost does not compete with AD, and lowering OSPF's AD to 1 affects every OSPF route.`,hi:`Dono routes 10.3.0.0/16 hain, isliye AD decide karta hai: static 1 OSPF 110 ko haraata hai aur backup primary ban jaata hai. Static AD ko 110 se upar karne se yeh floating static ban jaata hai jo sirf OSPF route gayab hone par aata hai. OSPF cost AD se compete nahi karti, aur OSPF ka AD 1 karna har OSPF route ko affect karta hai.`}},{title:{en:`The empty debug`,hi:`Khaali debug`},ticket:{en:`To prove PC1's traffic reaches R2, an engineer ran a filtered packet debug on R2 and saw no output. He concludes the traffic never arrives and wants to escalate to the branch team.`,hi:`PC1 ka traffic R2 tak pahunchta hai yeh sabit karne ke liye ek engineer ne R2 par filtered packet debug chalaya aur koi output nahi dekha. Woh nateeja nikaalta hai ki traffic kabhi nahi aata aur branch team ko escalate karna chahta hai.`},out:`R2# show ip cef exact-route 10.1.10.10 10.3.30.10
10.1.10.10 -> 10.3.30.10 =>IP adj out of GigabitEthernet0/1, addr 10.0.23.2

R2# debug ip packet 101 detail
IP packet debugging is on (detailed) for access list 101

R2# show logging | include IP:
R2#

R2# show interfaces GigabitEthernet0/1 | include packets output
     184223 packets output, 21044521 bytes, 0 underruns`,q:{en:`Is the engineer's conclusion correct?`,hi:`Kya engineer ka nateeja sahi hai?`},o:[{en:`Yes, an empty debug proves no matching packets arrived`,hi:`Haan, khaali debug sabit karta hai ki koi matching packet nahi aaya`},{en:`Yes, because ACL 101 would show hit counters if traffic arrived`,hi:`Haan, kyunki traffic aata to ACL 101 hit counters dikhati`},{en:`No, the debug output only goes to the console, never to the buffer`,hi:`Nahi, debug output sirf console par jaata hai, kabhi buffer mein nahi`},{en:`No, debug ip packet only shows process-switched packets; CEF-switched transit traffic is not displayed`,hi:`Nahi, debug ip packet sirf process-switched packets dikhata hai; CEF-switched transit traffic display nahi hota`}],a:3,w:{en:`Transit traffic is switched by CEF in the fast path and never reaches the packet debug, so an empty debug proves nothing. Use EPC, NetFlow or ACL counters on an interface ACL to prove arrival. Debug output can be buffered with logging buffered, and an ACL used only to filter a debug does not count hits.`,hi:`Transit traffic fast path mein CEF se switch hota hai aur packet debug tak kabhi nahi pahunchta, isliye khaali debug kuch sabit nahi karta. Aana sabit karne ke liye EPC, NetFlow ya interface ACL par ACL counters use karo. Debug output logging buffered se buffer ho sakta hai, aur sirf debug filter karne wali ACL hits count nahi karti.`}},{title:{en:`Freezes a few times a day`,hi:`Din mein kuch baar freeze`},ticket:{en:`Branch users report the payroll application freezes for a few seconds several times a day. Every manual test passes. An IP SLA probe runs on R1 toward SRV1.`,hi:`Branch users report karte hain ki payroll application din mein kai baar kuch seconds ke liye freeze hoti hai. Har manual test pass hota hai. R1 par SRV1 ki taraf IP SLA probe chal raha hai.`},out:`R1# show ip sla statistics 10 | include Number
Number of successes: 842
Number of failures: 6

R2# show logging | include ADJCHG
Sep 30 09:12:41.118 IST: %OSPF-5-ADJCHG: Process 1, Nbr 10.255.0.1 on GigabitEthernet0/0 from FULL to DOWN, Neighbor Down: Dead timer expired
Sep 30 09:12:49.502 IST: %OSPF-5-ADJCHG: Process 1, Nbr 10.255.0.1 on GigabitEthernet0/0 from LOADING to FULL, Loading Done

R2# show interfaces GigabitEthernet0/0 | include CRC
     2291 input errors, 2291 CRC, 0 frame, 0 overrun, 0 ignored`,q:{en:`What is the most likely cause and the right next step?`,hi:`Sabse likely cause aur sahi agla step kya hai?`},o:[{en:`A physical problem on the R1-R2 link; troubleshoot bottom-up (cable, optic, duplex)`,hi:`R1-R2 link par physical problem; bottom-up troubleshoot karo (cable, optic, duplex)`},{en:`The payroll application has a memory leak; escalate to the server team`,hi:`Payroll application mein memory leak hai; server team ko escalate karo`},{en:`The OSPF hello timer is too long; reduce it to 1 second`,hi:`OSPF hello timer bahut lamba hai; ise 1 second karo`},{en:`The IP SLA probe is overloading the link`,hi:`IP SLA probe link ko overload kar raha hai`}],a:0,w:{en:`Three kinds of evidence agree: IP SLA failures, OSPF dead-timer expiries on Gi0/0 and a large CRC count on the same interface. CRC errors are a physical-layer symptom, so bottom-up on that link is the right approach. Faster hellos would only detect the failure sooner, and a probe every few seconds cannot overload a link.`,hi:`Teen tarah ke saboot sehmat hain: IP SLA failures, Gi0/0 par OSPF dead-timer expiries aur usi interface par bada CRC count. CRC errors physical-layer symptom hain, isliye us link par bottom-up sahi approach hai. Tez hellos sirf failure jaldi detect karte, aur har kuch second ka probe link overload nahi kar sakta.`}},{title:{en:`BGP best path, but not in the routing table`,hi:`BGP best path, par routing table mein nahi`},ticket:{en:`R1 learns 198.51.100.0/24 from its eBGP peer 192.0.2.1, but traffic to that prefix does not follow BGP.`,hi:`R1 apne eBGP peer 192.0.2.1 se 198.51.100.0/24 seekhta hai, par us prefix ka traffic BGP follow nahi karta.`},out:`R1# show ip bgp | begin Network
     Network          Next Hop            Metric LocPrf Weight Path
 r>  198.51.100.0/24  192.0.2.1                0             0 64510 i
 *>  203.0.113.0/24   192.0.2.1                0             0 64510 i

R1# show ip route 198.51.100.0
Routing entry for 198.51.100.0/24
  Known via "static", distance 1, metric 0
  Routing Descriptor Blocks:
  * 10.0.12.2
      Route metric is 0, traffic share count is 1`,q:{en:`What does the r code mean here?`,hi:`Yahan r code ka kya matlab hai?`},o:[{en:`The route was received from a route reflector`,hi:`Route route reflector se receive hua`},{en:`RIB-failure: a static route with a lower AD already owns the prefix, so the BGP route is not installed`,hi:`RIB-failure: kam AD wala static route pehle se prefix ka maalik hai, isliye BGP route install nahi hota`},{en:`The next hop 192.0.2.1 is unreachable`,hi:`Next hop 192.0.2.1 unreachable hai`},{en:`The route is dampened because it flapped`,hi:`Route flap hua isliye dampened hai`}],a:1,w:{en:`r means RIB-failure: BGP chose a best path (>), but the routing table kept a route from a lower-AD source, here the static route with AD 1 versus eBGP 20. An unreachable next hop would stop the path from being best, and dampening shows as d.`,hi:`r matlab RIB-failure: BGP ne best path (>) chuna, par routing table ne kam AD wale source ka route rakha, yahan AD 1 wala static route versus eBGP 20. Unreachable next hop path ko best banne se rokta, aur dampening d ki tarah dikhta hai.`}}];export{e as default};