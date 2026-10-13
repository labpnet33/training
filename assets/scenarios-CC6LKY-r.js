var e=(e,t)=>({en:e,hi:t}),t=[{title:e(`No Label toward the preferred path`,`Preferred path ki taraf No Label`),ticket:e(`VPN traffic dies when it goes via P1, while IP is fine. Read PE1.`,`Jab VPN traffic P1 se jaata hai to mar jaata hai, jabki IP theek hai. PE1 padho.`),out:`PE1# show mpls ldp discovery
 Local LDP Identifier:
    10.0.255.1:0
    Discovery Sources:
    Interfaces:
        GigabitEthernet0/0 (ldp): xmit/recv
            LDP Id: 7.7.7.7:0; no route
        GigabitEthernet0/1 (ldp): xmit/recv
            LDP Id: 10.0.255.3:0

PE1# show mpls forwarding-table
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
17         No Label   10.0.255.2/32    0             Gi0/0      10.0.12.2
20         No Label   10.0.255.4/32    0             Gi0/0      10.0.12.2`,q:e(`What is the root cause?`,`Root cause kya hai?`),o:[e(`MTU is too small on Gi0/0`,`Gi0/0 par MTU bahut chhota hai`),e(`IS-IS has no adjacency with P1`,`IS-IS ki P1 ke saath adjacency nahi`),e(`P1 uses an LDP router ID (7.7.7.7) that IS-IS does not advertise`,`P1 aisa LDP router ID (7.7.7.7) use karta hai jise IS-IS advertise nahi karta`),e(`The label protocol is RSVP`,`Label protocol RSVP hai`)],a:2,w:e(`"no route" for LDP Id 7.7.7.7 means the transport address is unreachable, so no session forms and the LFIB shows No Label on the IGP path via P1. The fix is mpls ldp router-id Loopback0 force on P1.`,`LDP Id 7.7.7.7 ke liye "no route" matlab transport address unreachable hai, isliye session nahi bana aur P1 wale IGP path par LFIB No Label dikhati hai. Fix P1 par mpls ldp router-id Loopback0 force hai.`)},{title:e(`LDP configured but nothing happens`,`LDP configure par kuch nahi hota`),ticket:e(`An engineer typed two commands on PE1 and says LDP is not coming up. Read the output.`,`Engineer ne PE1 par do commands type kiye aur kehta hai LDP up nahi ho raha. Output padho.`),out:`PE1# show running-config | section mpls
mpls label protocol ldp
mpls ldp router-id Loopback0 force

PE1# show mpls interfaces
Interface              IP            Tunnel   BGP Static Operational

PE1# show mpls ldp neighbor
PE1#`,q:e(`What is missing?`,`Kya missing hai?`),o:[e(`mpls ldp autoconfig under router isis (or mpls ip on the interfaces)`,`router isis ke neeche mpls ldp autoconfig (ya interfaces par mpls ip)`),e(`A second router ID`,`Doosra router ID`),e(`A BGP session`,`BGP session`),e(`A higher IS-IS metric`,`Zyada IS-IS metric`)],a:0,w:e(`The router ID and label protocol do not enable any interface. show mpls interfaces is empty. Add mpls ldp autoconfig under router isis.`,`Router ID aur label protocol koi interface enable nahi karte. show mpls interfaces khaali hai. router isis ke neeche mpls ldp autoconfig lagao.`)},{title:e(`A link at the maximum metric`,`Maximum metric par link`),ticket:e(`After a reload a link is advertised with a huge metric and traffic moved to a longer path. Read PE1's LSP.`,`Reload ke baad link bahut bade metric ke saath advertise ho raha hai aur traffic lambe path par chala gaya. PE1 ka LSP padho.`),out:`PE1# show isis database detail
PE1.00-00           * 0x00000002   0x3545        1200/*                 0/0/0
  Hostname: PE1
  Metric: 16777214  IS-Extended P1
  Metric: 20        IS-Extended P2
  Metric: 16777214  IP 10.0.12.0/24
  Metric: 20        IP 10.0.13.0/24

PE1# show ip route 10.0.255.4
  Known via "isis", distance 115, metric 40
  * 10.0.13.3, via GigabitEthernet0/1`,q:e(`What explains the metric 16777214 toward P1?`,`P1 ki taraf metric 16777214 kaise explain hota hai?`),o:[e(`An administrator set it by hand`,`Administrator ne haath se set kiya`),e(`LDP-IGP sync: LDP is not Oper on that link yet`,`LDP-IGP sync: us link par LDP abhi Oper nahi hai`),e(`A BGP route-map`,`BGP route-map`),e(`The link is shut down`,`Link shut hai`)],a:1,w:e(`With mpls ldp sync, IS-IS advertises the maximum wide metric until the LDP session on the interface is operational. The link stays in the topology, so LDP can form; traffic uses the P2 path (metric 40) meanwhile.`,`mpls ldp sync ke saath IS-IS interface par LDP session operational hone tak maximum wide metric advertise karta hai. Link topology mein rehta hai, isliye LDP ban sakta hai; tab tak traffic P2 path (metric 40) use karta hai.`)},{title:e(`Where is the label removed?`,`Label kahan hat-ta hai?`),ticket:e(`A junior asks which router removes the label for traffic to PC2. Read the traceroute and the table.`,`Junior poochta hai PC2 ke traffic ka label kaunsa router hataata hai. Traceroute aur table padho.`),out:`PE1# traceroute 192.168.2.10
  1 10.0.12.2 [MPLS: Label 21 Exp 0] 1 msec 2 msec 1 msec
  2 10.0.23.3 [MPLS: Label 19 Exp 0] 2 msec 3 msec 2 msec
  3 10.0.34.4 3 msec 4 msec 3 msec
  4 192.168.2.10 4 msec 5 msec 4 msec

P2# show mpls forwarding-table
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
19         Pop Label  192.168.2.0/24   820           Gi0/3      10.0.34.4`,q:e(`Which router pops the label?`,`Label kaunsa router pop karta hai?`),o:[e(`PE1`,`PE1`),e(`P1`,`P1`),e(`PE2`,`PE2`),e(`P2 (the penultimate hop)`,`P2 (penultimate hop)`)],a:3,w:e(`P2 receives label 19 and has Pop Label toward PE2, so PE2 gets plain IP (hop 3 has no label). That is penultimate hop popping.`,`P2 ko label 19 milta hai aur PE2 ki taraf Pop Label hai, isliye PE2 ko plain IP milta hai (hop 3 par label nahi). Yahi penultimate hop popping hai.`)},{title:e(`Who opened the TCP session?`,`TCP session kisne kholi?`),ticket:e(`A learner reads the neighbour output on PE1 (LDP ID 10.0.255.1) and asks who started the session.`,`Learner PE1 (LDP ID 10.0.255.1) ka neighbour output padhta hai aur poochta hai session kisne shuru kiya.`),out:`PE1# show mpls ldp neighbor
    Peer LDP Ident: 10.0.255.2:0; Local LDP Ident 10.0.255.1:0
        TCP connection: 10.0.255.2.19395 - 10.0.255.1.646
        State: Oper; Msgs sent/rcvd: 8/8; Downstream
        Up time: 00:00:28
        LDP discovery sources:
          GigabitEthernet0/1, Src IP addr: 10.0.12.2`,q:e(`Which statement is right?`,`Kaunsa statement sahi hai?`),o:[e(`PE1 opened it because it is the local router`,`PE1 ne kholi kyunki woh local router hai`),e(`P1 (higher address 10.0.255.2) opened the TCP connection to port 646 on PE1`,`P1 (higher address 10.0.255.2) ne PE1 ke port 646 par TCP connection kholi`),e(`The session uses UDP 646`,`Session UDP 646 use karta hai`),e(`The connection was opened by the IGP`,`Connection IGP ne kholi`)],a:1,w:e(`The router with the higher transport address is the active opener. The line shows source 10.0.255.2 with a high port toward 10.0.255.1 port 646. Discovery hellos use UDP; the session is TCP.`,`Higher transport address wala router active opener hai. Line source 10.0.255.2 high port ke saath 10.0.255.1 port 646 ki taraf dikhati hai. Discovery hellos UDP use karte hain; session TCP hai.`)},{title:e(`Pop Label for a neighbour loopback`,`Neighbour loopback ke liye Pop Label`),ticket:e(`PE1 shows Pop Label for P1's loopback and a swap for PE2's. A colleague thinks it is an error.`,`PE1 P1 ke loopback ke liye Pop Label aur PE2 ke liye swap dikhata hai. Colleague ise error samajhta hai.`),out:`PE1# show mpls forwarding-table
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
17         Pop Label  10.0.255.2/32    0             Gi0/1      10.0.12.2
21         18         10.0.255.4/32    0             Gi0/1      10.0.12.2

PE1# show mpls ldp bindings
  lib entry: 10.0.255.2/32, rev 10
        local binding:  label: 17
        remote binding: lsr: 10.0.255.2:0, label: imp-null`,q:e(`Why is there a Pop Label for 10.0.255.2/32?`,`10.0.255.2/32 ke liye Pop Label kyun hai?`),o:[e(`The prefix is filtered`,`Prefix filtered hai`),e(`P1 has no LDP session`,`P1 ka LDP session nahi`),e(`The label stack is full`,`Label stack full hai`),e(`P1 advertised implicit-null for its own loopback, so PE1 pops (PHP)`,`P1 ne apne loopback ke liye implicit-null advertise kiya, isliye PE1 pop karta hai (PHP)`)],a:3,w:e(`The remote binding is imp-null: P1 is the egress for its loopback and asks its neighbour to pop. PE1 is the penultimate hop for that FEC.`,`Remote binding imp-null hai: P1 apne loopback ka egress hai aur neighbour se pop karne ko kehta hai. PE1 us FEC ke liye penultimate hop hai.`)},{title:e(`Only one interface is MPLS enabled`,`Sirf ek interface MPLS enabled hai`),ticket:e(`After autoconfig, PE1 shows LDP on only one interface. The customer asks if that is a fault.`,`Autoconfig ke baad PE1 sirf ek interface par LDP dikhata hai. Customer poochta hai kya yeh fault hai.`),out:`PE1# show mpls interfaces
Interface              IP            Tunnel   BGP Static Operational
GigabitEthernet0/1     Yes (ldp)     No       No  No     Yes

PE1# show running-config interface GigabitEthernet0/1
interface GigabitEthernet0/1
 ip address 10.0.12.1 255.255.255.0
 ip router isis
 isis network point-to-point`,q:e(`Is Gi0/0 (customer LAN) missing LDP by mistake?`,`Kya Gi0/0 (customer LAN) par galti se LDP missing hai?`),o:[e(`No: it does not run IS-IS, so autoconfig correctly leaves it unlabelled`,`Nahi: us par IS-IS nahi, isliye autoconfig use sahi tareeke se unlabelled chhodta hai`),e(`Yes: enable mpls ip on the customer interface`,`Haan: customer interface par mpls ip lagao`),e(`Yes: the router ID is wrong`,`Haan: router ID galat hai`),e(`Yes: IS-IS must be passive`,`Haan: IS-IS passive hona chahiye`)],a:0,w:e(`Autoconfig enables LDP only on interfaces with ip router isis. Customer-facing interfaces should not run LDP, so this is correct.`,`Autoconfig sirf ip router isis wale interfaces par LDP on karta hai. Customer-facing interfaces par LDP nahi chalna chahiye, isliye yeh sahi hai.`)}];export{t as default};