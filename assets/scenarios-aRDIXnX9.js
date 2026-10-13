var e=(e,t)=>({en:e,hi:t}),t=[{title:e(`Black screen in the lecture hall`,`Lecture hall mein black screen`),ticket:e(`Sahyadri University: the Pune hall (joined to 239.50.1.1) lost the live lecture after last night's maintenance. R3 is the hall router and R2 (2.2.2.2) is the RP.`,`Sahyadri University: Pune hall (239.50.1.1 joined) ne kal raat ki maintenance ke baad live lecture kho di. R3 hall router hai aur R2 (2.2.2.2) RP hai.`),out:`R3# show ip mroute 239.50.1.1
(*, 239.50.1.1), 00:00:24/00:02:36, RP 2.2.2.2, flags: SC
  Incoming interface: Null, RPF nbr 0.0.0.0
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:00:24/00:02:36

R3# show ip rpf 2.2.2.2
RPF information for ? (2.2.2.2)
  RPF interface: GigabitEthernet0/1
  RPF neighbor: ? (10.0.13.1)
  RPF route/mask: 2.2.2.2/32
  RPF type: unicast (ospf)
  Note: PIM is not enabled on the RPF interface - RPF check will fail`,q:e(`What is the cause and the right repair?`,`Karan kya hai aur sahi repair kya?`),o:[e(`IGMP is broken on the hall LAN; reinstall the receiver`,`Hall LAN par IGMP toota hai; receiver dobara install karo`),e(`Unicast prefers a backup link without PIM; add ip mroute for the RP toward the PIM neighbour`,`Unicast PIM-rahit backup link ko prefer karta hai; RP ke liye PIM neighbour ki taraf ip mroute jodo`),e(`The RP address is wrong; change it to 10.0.13.1`,`RP address galat hai; use 10.0.13.1 karo`),e(`The TTL is 1; raise it on the encoder`,`TTL 1 hai; encoder par badhao`)],a:1,w:e(`C shows the receiver is present, the RP address is right, but the RPF interface is the backup link where PIM is off. An ip mroute toward the PIM neighbour fixes RPF without touching unicast.`,`C dikhata hai receiver hai, RP address sahi hai, par RPF interface backup link hai jahan PIM off hai. PIM neighbour ki taraf ip mroute unicast chhue bina RPF theek karta hai.`)},{title:e(`Delhi has no picture, Pune is fine`,`Delhi mein picture nahi, Pune theek`),ticket:e(`Deccan Broadcast: channel 239.77.1.1 reaches Pune but not Delhi. The RP is 10.1.255.1. The Internet VPN between Pune and Delhi is unicast only.`,`Deccan Broadcast: channel 239.77.1.1 Pune pahunchta hai par Delhi nahi. RP 10.1.255.1 hai. Pune aur Delhi ke beech Internet VPN sirf unicast hai.`),out:`R-DEL# show ip pim neighbor
Neighbor          Interface                Uptime/Expires    Ver   DR
Address                                                            Prio/Mode
10.0.2.1          GigabitEthernet0/2       00:04:15/00:01:30 v2    1 / S P G

R-DEL# show ip rpf 10.1.255.1
RPF information for ? (10.1.255.1)
  RPF interface: GigabitEthernet0/3
  RPF neighbor: ? (10.0.3.1)
  RPF type: unicast (ospf)
  Note: PIM is not enabled on the RPF interface - RPF check will fail`,q:e(`Which is the correct reading and fix?`,`Sahi reading aur fix kaunsa hai?`),o:[e(`Enable PIM on GigabitEthernet0/3 toward Pune`,`GigabitEthernet0/3 par Pune ki taraf PIM on karo`),e(`Replace the RP with a loopback on R-DEL`,`RP ko R-DEL ke loopback se badlo`),e(`Set ip igmp version 3 on the Delhi LAN`,`Delhi LAN par ip igmp version 3 lagao`),e(`The PIM neighbour is up, but RPF points at the Internet VPN; add ip mroute for the RP and the source network via 10.0.2.1`,`PIM neighbour up hai, par RPF Internet VPN ki taraf hai; RP aur source network ke liye 10.0.2.1 ke through ip mroute jodo`)],a:3,w:e(`The adjacency on the MPLS circuit is healthy. RPF toward the RP uses the VPN because of unicast cost. The VPN cannot carry PIM, so pin RPF to the MPLS neighbour for both the RP and the encoder LAN.`,`MPLS circuit par adjacency theek hai. RP ki taraf RPF unicast cost ki wajah se VPN use karta hai. VPN PIM nahi le jaa sakta, isliye RP aur encoder LAN dono ke liye RPF MPLS neighbour par pin karo.`)},{title:e(`Pune receiver LAN is silent`,`Pune receiver LAN chup hai`),ticket:e(`Capstone, Pune: the receiver PC joined 239.88.1.1 but never gets the stream. The WAN neighbour to the MPLS PE is up.`,`Capstone, Pune: receiver PC ne 239.88.1.1 join kiya par stream kabhi nahi mili. MPLS PE ka WAN neighbour up hai.`),out:`R-PUN# show ip pim interface

Address          Interface                Ver/   Nbr    Query  DR         DR
                                          Mode   Count  Intvl  Prior
10.0.2.2         GigabitEthernet0/1       v2/S   1      30     1          10.0.2.2

R-PUN# show ip igmp groups
Group Address    Interface                Uptime    Expires   Last Reporter`,q:e(`What is missing?`,`Kya missing hai?`),o:[e(`ip pim sparse-mode on the receiver LAN interface GigabitEthernet0/0`,`Receiver LAN interface GigabitEthernet0/0 par ip pim sparse-mode`),e(`A static RP on the PE`,`PE par static RP`),e(`ip mroute toward the PE`,`PE ki taraf ip mroute`),e(`A higher OSPF cost on the WAN link`,`WAN link par zyada OSPF cost`)],a:0,w:e(`The LAN interface is absent from the PIM interface list and the IGMP table is empty: IGMP starts only where PIM sparse mode is enabled. Layer 2 fails, so layer 1 cannot work.`,`LAN interface PIM interface list mein nahi hai aur IGMP table khaali hai: IGMP wahin shuru hota hai jahan PIM sparse mode enabled hai. Layer 2 fail hai, isliye layer 1 chal nahi sakti.`)},{title:e(`Delhi joins toward a ghost RP`,`Delhi bhoot RP ki taraf join karta hai`),ticket:e(`Capstone, Delhi: the PIM neighbour is up and the receiver joined, but the (*,G) has an RP that nobody else uses. Mumbai's RP is Loopback0 10.1.255.1.`,`Capstone, Delhi: PIM neighbour up hai aur receiver ne join kiya, par (*,G) ka RP aisa hai jo koi aur use nahi karta. Mumbai ka RP Loopback0 10.1.255.1 hai.`),out:`R-DEL# show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s): 224.0.0.0/4, Static
    RP: 10.1.255.9 (?)`,q:e(`What do you change?`,`Aap kya badalte ho?`),o:[e(`Add ip mroute 10.1.255.9 toward the PE`,`10.1.255.9 ke liye PE ki taraf ip mroute jodo`),e(`Remove the wrong static RP and configure ip pim rp-address 10.1.255.1`,`Galat static RP hatao aur ip pim rp-address 10.1.255.1 configure karo`),e(`Enable PIM dense mode on the LAN`,`LAN par PIM dense mode on karo`),e(`Lower the PIM hello interval`,`PIM hello interval kam karo`)],a:1,w:e(`One wrong digit in the RP is enough. Compare the mapping with the other routers and correct it. A static mroute changes RPF, not which RP the router uses.`,`RP mein ek galat digit kaafi hai. Mapping ko baaki routers se compare karo aur theek karo. Static mroute RPF badalta hai, yeh nahi ki router kaunsa RP use kare.`)},{title:e(`Chennai prefers the Internet`,`Chennai Internet ko prefer karta hai`),ticket:e(`Capstone, Chennai: the MPLS circuit has a leftover OSPF cost of 100. The news channel is dark in Chennai only.`,`Capstone, Chennai: MPLS circuit par bachi hui OSPF cost 100 hai. News channel sirf Chennai mein band hai.`),out:`R-CHE# show ip rpf 10.1.255.1
RPF information for ? (10.1.255.1)
  RPF interface: GigabitEthernet0/3
  RPF neighbor: ? (10.0.6.1)
  RPF route/mask: 10.1.255.1/32
  RPF type: unicast (ospf)
  Note: PIM is not enabled on the RPF interface - RPF check will fail

R-CHE# show ip pim neighbor
Neighbor          Interface                Uptime/Expires    Ver   DR
10.0.4.1          GigabitEthernet0/1       00:01:24/00:01:21 v2    1 / S P G`,q:e(`Which repair respects the rule "no PIM on the Internet, no OSPF change"?`,`Kaunsa repair "Internet par PIM nahi, OSPF mein badlav nahi" niyam ka palan karta hai?`),o:[e(`ip route 10.1.255.1 255.255.255.255 10.0.4.1`,`ip route 10.1.255.1 255.255.255.255 10.0.4.1`),e(`ip pim sparse-mode on GigabitEthernet0/3`,`GigabitEthernet0/3 par ip pim sparse-mode`),e(`no ip ospf cost on GigabitEthernet0/1`,`GigabitEthernet0/1 par no ip ospf cost`),e(`ip mroute 10.1.255.1 255.255.255.255 10.0.4.1 and ip mroute 10.1.0.0 255.255.255.0 10.0.4.1`,`ip mroute 10.1.255.1 255.255.255.255 10.0.4.1 aur ip mroute 10.1.0.0 255.255.255.0 10.0.4.1`)],a:3,w:e(`The static multicast routes pin RPF for the RP and the encoder LAN to the PIM neighbour on MPLS. ip route would also move unicast; the other two break the customer rules.`,`Static multicast routes RP aur encoder LAN ke liye RPF ko MPLS ke PIM neighbour par pin karte hain. ip route unicast bhi hilata; baaki do customer ke niyam todte hain.`)},{title:e(`Two warehouses, one wrong digit, one carrier cable`,`Do warehouses, ek galat digit, ek carrier cable`),ticket:e(`Zenith Logistics: neither warehouse sees the briefing. R3 (warehouse A) and R4 (warehouse B) both show an empty incoming interface. The correct RP is 2.2.2.2.`,`Zenith Logistics: kisi warehouse ko briefing nahi dikhti. R3 (warehouse A) aur R4 (warehouse B) dono ka incoming interface khaali hai. Sahi RP 2.2.2.2 hai.`),out:`R3# show ip pim rp mapping
Group(s): 224.0.0.0/4, Static
    RP: 2.2.2.22 (?)

R4# show ip rpf 2.2.2.2
  RPF interface: GigabitEthernet0/1
  RPF neighbor: ? (10.0.34.3)
  RPF type: unicast (ospf)
  Note: PIM is not enabled on the RPF interface - RPF check will fail`,q:e(`How many independent faults are there, and what are they?`,`Kitne independent faults hain, aur kaunse?`),o:[e(`One: the RP is wrong everywhere`,`Ek: RP har jagah galat hai`),e(`Two: R3 has a wrong RP address, R4 has an RPF through a cable without PIM`,`Do: R3 ka RP address galat hai, R4 ka RPF PIM-rahit cable se hai`),e(`Two: both routers need PIM dense mode`,`Do: dono routers ko PIM dense mode chahiye`),e(`Three: IGMP, TTL and the RP`,`Teen: IGMP, TTL aur RP`)],a:1,w:e(`R3 uses 2.2.2.22, a typo. R4 has the right RP but unicast prefers the carrier cable where PIM is off. Each needs its own fix, and both receivers must be re-tested.`,`R3 2.2.2.22 use karta hai, typo. R4 ka RP sahi hai par unicast carrier cable ko prefer karta hai jahan PIM off hai. Har ek ko apna fix chahiye, aur dono receivers re-test karne hain.`)},{title:e(`Works in Mumbai, nowhere else`,`Mumbai mein chalta hai, kahin aur nahi`),ticket:e(`A new encoder in Mumbai streams 239.88.2.2. Receivers in the Mumbai LAN see it, branch receivers do not. All PIM neighbours are up and the RPF is correct everywhere.`,`Mumbai ka naya encoder 239.88.2.2 stream karta hai. Mumbai LAN ke receivers dekhte hain, branch receivers nahi. Sab PIM neighbours up hain aur RPF har jagah sahi hai.`),out:`R-MUM# show ip mroute 239.88.2.2
(10.1.0.30, 239.88.2.2), 00:00:40/00:02:20, flags: T
  Incoming interface: GigabitEthernet0/0, RPF nbr 0.0.0.0
  Outgoing interface list: Null

PC-NEWENC# mcast 239.88.2.2 10 ttl 1
Sending 10 UDP datagrams to 239.88.2.2:5000 (TTL 1) from 10.1.0.30... done`,q:e(`What is the most likely cause?`,`Sabse sambhavit karan kya hai?`),o:[e(`The RPF toward the RP is wrong`,`RP ki taraf RPF galat hai`),e(`The branch routers have no ip multicast-routing`,`Branch routers par ip multicast-routing nahi`),e(`The application sends with TTL 1, so the stream never leaves the source LAN`,`Application TTL 1 se bhejti hai, isliye stream source LAN se bahar nahi jaati`),e(`The group is in the SSM range`,`Group SSM range mein hai`)],a:2,w:e(`The host sent with TTL 1; the first router decrements it to 0 and drops it, so the OIL stays empty. RPF and PIM are not the issue. Raise the TTL (the default of the host shell is 32).`,`Host ne TTL 1 se bheja; pehla router ise 0 kar deta hai aur drop kar deta hai, isliye OIL khaali rehti hai. RPF aur PIM issue nahi. TTL badhao (host shell ka default 32 hai).`)}];export{t as default};