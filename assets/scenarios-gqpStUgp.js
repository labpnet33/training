var e=[{title:{en:`Rogue default route on the user LAN`,hi:`User LAN par rogue default route`},ticket:{en:`Bengaluru R&D: "Since this morning half the lab cannot reach the internet over IPv6." R1 connects the user switch SW-USERS on Gi0/2. The design standard says user LANs must be passive.`,hi:`Bengaluru R&D: "Aaj subah se aadha lab IPv6 par internet tak nahi pahunch pa raha." R1 Gi0/2 par user switch SW-USERS jodta hai. Design standard kehta hai user LANs passive hone chahiye.`},out:`R1# show ipv6 ospf neighbor

            OSPFv3 Router with ID (1.1.1.1) (Process ID 1)

Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
2.2.2.2           0   FULL/  -        00:00:34    3               GigabitEthernet0/0
10.99.99.1        1   FULL/BDR        00:00:31    2               GigabitEthernet0/2

R1# show ipv6 route ::/0
Routing entry for ::/0
  Known via "ospf 1", distance 110, metric 1, type extern 2
    FE80::A8BB:CCFF:FE00:6400, GigabitEthernet0/2`,q:{en:`What is the correct fix on R1?`,hi:`R1 par sahi fix kya hai?`},o:[{en:`shutdown on GigabitEthernet0/2`,hi:`GigabitEthernet0/2 par shutdown`},{en:`no ipv6 ospf 1 area 0 on GigabitEthernet0/2`,hi:`GigabitEthernet0/2 par no ipv6 ospf 1 area 0`},{en:`passive-interface GigabitEthernet0/2 under ipv6 router ospf 1`,hi:`ipv6 router ospf 1 ke neeche passive-interface GigabitEthernet0/2`},{en:`ipv6 ospf priority 0 on GigabitEthernet0/2`,hi:`GigabitEthernet0/2 par ipv6 ospf priority 0`}],a:2,w:{en:`A host on the user VLAN became an OSPFv3 neighbour and injected an OE2 default. Passive stops Hellos and ignores received OSPFv3 packets while still advertising 2001:DB8:ACAD:100::/64. Shutdown kills the LAN, removing OSPFv3 withdraws the prefix, and priority 0 only affects the DR election.`,hi:`User VLAN ka ek host OSPFv3 neighbour ban gaya aur OE2 default inject kiya. Passive Hellos rokta hai aur received OSPFv3 packets ignore karta hai jabki 2001:DB8:ACAD:100::/64 advertise hota rehta hai. Shutdown LAN khatam karta hai, OSPFv3 hatana prefix withdraw karta hai, aur priority 0 sirf DR election ko prabhavit karta hai.`}},{title:{en:`FULL, but the lab prefixes vanished`,hi:`FULL, lekin lab prefixes gayab`},ticket:{en:`CR-4471 "make transit links point-to-point" was applied on R2 last night. Today R1 has no routes to the R3 lab loopbacks, yet every neighbour is FULL.`,hi:`CR-4471 "transit links point-to-point banao" kal raat R2 par apply hua. Aaj R1 ke paas R3 lab loopbacks ke routes nahi hain, phir bhi har neighbour FULL hai.`},out:`R2# show ipv6 ospf neighbor
Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
1.1.1.1           0   FULL/  -        00:00:35    3               GigabitEthernet0/0
3.3.3.3           0   FULL/  -        00:00:37    3               GigabitEthernet0/1

R2# show ipv6 ospf interface Gi0/1 | include Network Type
  Network Type POINT_TO_POINT, Cost: 1
R3# show ipv6 ospf interface Gi0/0 | include Network Type|State
  Network Type BROADCAST, Cost: 1
  Transmit Delay is 1 sec, State DR, Priority 1`,q:{en:`What resolves the problem?`,hi:`Problem kya solve karega?`},o:[{en:`ipv6 ospf network point-to-point on R3 Gi0/0`,hi:`R3 Gi0/0 par ipv6 ospf network point-to-point`},{en:`ipv6 ospf priority 0 on R3 Gi0/0`,hi:`R3 Gi0/0 par ipv6 ospf priority 0`},{en:`clear ipv6 ospf process on R1`,hi:`R1 par clear ipv6 ospf process`},{en:`area 1 range 2001:DB8:ACAD:10::/62 on R3`,hi:`R3 par area 1 range 2001:DB8:ACAD:10::/62`}],a:0,w:{en:`Point-to-point and broadcast both use 10/40 timers, so the adjacency reaches FULL, but R2 describes a p2p link while R3 describes a transit network. SPF's two-way check fails and routes over the link are dropped. Both ends must use the same network type.`,hi:`Point-to-point aur broadcast dono 10/40 timers use karte hain, isliye adjacency FULL tak pahunchti hai, lekin R2 p2p link describe karta hai jabki R3 transit network. SPF ka two-way check fail hota hai aur link ke paar routes drop hote hain. Dono ends par same network type hona chahiye.`}},{title:{en:`The summary that did nothing`,hi:`Summary jisne kuch nahi kiya`},ticket:{en:`A junior engineer "summarised the lab on R2", but R1 still shows four separate lab routes.`,hi:`Ek junior engineer ne "R2 par lab summarise kiya", lekin R1 abhi bhi chaar alag lab routes dikhata hai.`},out:`R2# show running-config | section ipv6 router ospf
ipv6 router ospf 1
 router-id 2.2.2.2
 area 0 range 2001:DB8:ACAD:10::/62

R1# show ipv6 route ospf | include ACAD:1
OI  2001:DB8:ACAD:10::1/128 [110/2]
OI  2001:DB8:ACAD:11::1/128 [110/2]
OI  2001:DB8:ACAD:12::1/128 [110/2]
OI  2001:DB8:ACAD:13::1/128 [110/2]`,q:{en:`Why is the summary not working?`,hi:`Summary kaam kyun nahi kar raha?`},o:[{en:`The prefix length should be /60`,hi:`Prefix length /60 honi chahiye`},{en:`Loopbacks cannot be summarised in OSPFv3`,hi:`OSPFv3 mein loopbacks summarise nahi ho sakte`},{en:`The range must be configured on R3`,hi:`Range R3 par configure honi chahiye`},{en:`The range names area 0, but the prefixes live in area 1`,hi:`Range area 0 ka naam leti hai, lekin prefixes area 1 mein hain`}],a:3,w:{en:`area X range summarises the prefixes of area X. The loopbacks are in area 1, so the command must be area 1 range 2001:DB8:ACAD:10::/62 on the ABR R2. /62 is the correct length, /128 loopbacks can be summarised, and R3 is not an ABR.`,hi:`area X range area X ke prefixes summarise karta hai. Loopbacks area 1 mein hain, isliye ABR R2 par command area 1 range 2001:DB8:ACAD:10::/62 honi chahiye. /62 sahi length hai, /128 loopbacks summarise ho sakte hain, aur R3 ABR nahi hai.`}},{title:{en:`Rebuilt router, no Hellos`,hi:`Rebuild hua router, Hellos nahi`},ticket:{en:`R3 was rebuilt from an IPv6-only template. R2 shows no neighbour on Gi0/1. Interfaces are up/up.`,hi:`R3 IPv6-only template se rebuild hua. R2 Gi0/1 par koi neighbour nahi dikhata. Interfaces up/up hain.`},out:`R3# show ipv6 protocols | section ospf
IPv6 Routing Protocol is "ospf 1"
  Router ID 0.0.0.0
  Number of areas: 0 normal, 0 stub, 0 nssa
R3# show logging | include OSPFv3
%OSPFv3-4-NORTRID: OSPFv3 process 1 could not pick a router-id,
R3# show ipv6 interface brief | include Gig|FE80
GigabitEthernet0/0     [up/up]
    FE80::5200:FF:FE03:0`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Add ipv6 enable on Gi0/0`,hi:`Gi0/0 par ipv6 enable jodo`},{en:`Configure router-id 3.3.3.3 under ipv6 router ospf 1`,hi:`ipv6 router ospf 1 ke neeche router-id 3.3.3.3 configure karo`},{en:`Change the process number to match R2`,hi:`Process number ko R2 se match karo`},{en:`Set ipv6 ospf network point-to-point on Gi0/0`,hi:`Gi0/0 par ipv6 ospf network point-to-point set karo`}],a:1,w:{en:`With no IPv4 address anywhere, OSPFv3 cannot derive a 32-bit router ID, so the process never starts. The link-local address is present, process IDs are locally significant, and the network type is irrelevant until the process runs.`,hi:`Kahin bhi IPv4 address na hone par OSPFv3 32-bit router ID nahi bana sakta, isliye process kabhi start nahi hota. Link-local address maujood hai, process IDs locally significant hain, aur process chalne tak network type irrelevant hai.`}},{title:{en:`Everything matches, still no neighbour`,hi:`Sab match hai, phir bhi neighbour nahi`},ticket:{en:`After an automation run, R2 and R3 lost their OSPFv3 adjacency. Areas, timers and network types were compared and match. No log messages appear.`,hi:`Ek automation run ke baad R2 aur R3 ki OSPFv3 adjacency chali gayi. Areas, timers aur network types compare kiye gaye aur match karte hain. Koi log message nahi dikhta.`},out:`R2# show ipv6 ospf interface Gi0/1
GigabitEthernet0/1 is up, line protocol is up
  Link Local Address FE80::5200:FF:FE02:1, Interface ID 4
  Area 1, Process ID 1, Instance ID 0, Router ID 2.2.2.2
  Network Type POINT_TO_POINT, Cost: 1
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5
R3# show ipv6 ospf interface Gi0/0
GigabitEthernet0/0 is up, line protocol is up
  Link Local Address FE80::5200:FF:FE03:0, Interface ID 3
  Area 1, Process ID 1, Instance ID 4, Router ID 3.3.3.3
  Network Type POINT_TO_POINT, Cost: 1
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5`,q:{en:`What is wrong?`,hi:`Kya galat hai?`},o:[{en:`The interface IDs differ (4 and 3)`,hi:`Interface IDs alag hain (4 aur 3)`},{en:`The link-local addresses are in different subnets`,hi:`Link-local addresses alag subnets mein hain`},{en:`The instance IDs differ (0 and 4)`,hi:`Instance IDs alag hain (0 aur 4)`},{en:`Router IDs must be in the same subnet`,hi:`Router IDs same subnet mein hone chahiye`}],a:2,w:{en:`The instance ID in the OSPFv3 header must match on a link; otherwise packets are silently ignored. Interface IDs are local and normally differ, link-local addresses are all FE80::/10, and router IDs have no subnet relationship. Fix: remove "instance 4" from R3's ipv6 ospf 1 area 1 line.`,hi:`OSPFv3 header ka instance ID link par match hona chahiye; warna packets chupchaap ignore hote hain. Interface IDs local hain aur normally alag hote hain, link-local addresses sab FE80::/10 hain, aur router IDs ka koi subnet relationship nahi. Fix: R3 ki ipv6 ospf 1 area 1 line se "instance 4" hatao.`}},{title:{en:`IPv4 disappeared after the migration`,hi:`Migration ke baad IPv4 gayab`},ticket:{en:`The Chennai branch moved from OSPFv2 to OSPFv3 with both address families. IPv6 works; IPv4 routes to the branch are gone.`,hi:`Chennai branch dono address families ke saath OSPFv2 se OSPFv3 par gaya. IPv6 chal raha hai; branch tak IPv4 routes gayab hain.`},out:`HUB# show ospfv3 neighbor

          OSPFv3 1 address-family ipv6 (router-id 10.0.0.1)

Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
10.0.0.44         0   FULL/  -        00:00:33    6               GigabitEthernet0/3

HUB# show running-config interface GigabitEthernet0/3
interface GigabitEthernet0/3
 ip address 10.44.0.1 255.255.255.252
 ipv6 address 2001:DB8:44::1/64
 ospfv3 network point-to-point
 ospfv3 1 ipv6 area 0`,q:{en:`What should be added on the hub?`,hi:`Hub par kya jodna chahiye?`},o:[{en:`ipv6 enable on GigabitEthernet0/3`,hi:`GigabitEthernet0/3 par ipv6 enable`},{en:`ospfv3 1 ipv4 area 0 on GigabitEthernet0/3 (with the IPv4 AF under router ospfv3 1)`,hi:`GigabitEthernet0/3 par ospfv3 1 ipv4 area 0 (router ospfv3 1 ke neeche IPv4 AF ke saath)`},{en:`network 10.44.0.0 0.0.0.3 area 0 under router ospfv3 1`,hi:`router ospfv3 1 ke neeche network 10.44.0.0 0.0.0.3 area 0`},{en:`router ospf 1 with the same router ID`,hi:`Same router ID ke saath router ospf 1`}],a:1,w:{en:`Only the ipv6 AF section exists, so the IPv4 AF (instance 64) is not running on the hub interface. IPv6 is already enabled, OSPFv3 has no network command, and adding OSPFv2 defeats the migration.`,hi:`Sirf ipv6 AF section hai, isliye hub interface par IPv4 AF (instance 64) nahi chal raha. IPv6 pehle se enabled hai, OSPFv3 mein network command nahi hota, aur OSPFv2 jodna migration ka maqsad khatam karta hai.`}},{title:{en:`Stuck after the new WAN circuit`,hi:`Naye WAN circuit ke baad atka`},ticket:{en:`A carrier handed over a new circuit between R2 and R3. The adjacency never reaches FULL.`,hi:`Carrier ne R2 aur R3 ke beech naya circuit diya. Adjacency kabhi FULL tak nahi pahunchti.`},out:`R2# show ipv6 ospf neighbor
Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
3.3.3.3           0   EXSTART/  -     00:00:37    3               GigabitEthernet0/1

R2# show ipv6 interface Gi0/1 | include MTU
  MTU is 1500 bytes
R3# show ipv6 interface Gi0/0 | include MTU
  MTU is 1400 bytes`,q:{en:`What is the best fix?`,hi:`Best fix kya hai?`},o:[{en:`Change both ends to broadcast`,hi:`Dono ends ko broadcast banao`},{en:`Configure the same instance ID`,hi:`Same instance ID configure karo`},{en:`Add passive-interface on R3 Gi0/0`,hi:`R3 Gi0/0 par passive-interface jodo`},{en:`Make the IPv6 MTU match on both ends`,hi:`Dono ends par IPv6 MTU match karo`}],a:3,w:{en:`EXSTART/EXCHANGE that never completes points to an MTU mismatch: R3 rejects DBDs advertising 1500. Match the MTU (mtu-ignore is only a workaround). Instance ID problems prevent the neighbour from appearing at all, and passive would remove it.`,hi:`Kabhi poora na hone wala EXSTART/EXCHANGE MTU mismatch ki taraf ishara karta hai: R3 1500 advertise karne wale DBDs reject karta hai. MTU match karo (mtu-ignore sirf workaround hai). Instance ID problems neighbour ko dikhne hi nahi dete, aur passive use hata dega.`}},{title:{en:`Neighbour lost after a security change`,hi:`Security change ke baad neighbour lost`},ticket:{en:`Security enabled OSPFv3 IPsec on the R1 to R2 link during a change window. About 40 seconds later the adjacency dropped and has not returned.`,hi:`Security ne change window mein R1 se R2 link par OSPFv3 IPsec enable kiya. Lagbhag 40 seconds baad adjacency drop hui aur wapas nahi aayi.`},out:`R1# show ipv6 ospf interface Gi0/0 | include SPI
  SHA-1 authentication SPI 256, secure socket UP (errors: 0)
R2# show ipv6 ospf interface Gi0/0 | include SPI
  SHA-1 authentication SPI 265, secure socket UP (errors: 0)
R2# show ipv6 ospf neighbor
R2#`,q:{en:`What is the most likely cause?`,hi:`Sabse likely cause kya hai?`},o:[{en:`The SPIs differ, so each side cannot process the other's packets`,hi:`SPIs alag hain, isliye har side doosre ke packets process nahi kar sakti`},{en:`SHA-1 is not supported for OSPFv3`,hi:`OSPFv3 ke liye SHA-1 supported nahi hai`},{en:`IPsec requires the network type to be broadcast`,hi:`IPsec ko network type broadcast chahiye`},{en:`The router IDs must be added to the IPsec policy`,hi:`Router IDs ko IPsec policy mein jodna padta hai`}],a:0,w:{en:`OSPFv3 IPsec uses manual security associations: SPI, algorithm and key must be identical on both ends of the link. SPI 256 and 265 do not match, so the Hellos fail authentication and the neighbour times out after the dead interval. SHA-1 is supported, and IPsec does not depend on network type or router IDs.`,hi:`OSPFv3 IPsec manual security associations use karta hai: link ke dono ends par SPI, algorithm aur key identical hone chahiye. SPI 256 aur 265 match nahi karte, isliye Hellos authentication fail karte hain aur dead interval ke baad neighbour time out hota hai. SHA-1 supported hai, aur IPsec network type ya router IDs par depend nahi karta.`}}];export{e as default};