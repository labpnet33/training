var e=[{title:{en:`The ticker that stays blank`,hi:`Ticker jo khaali rehta hai`},ticket:{en:`Dealers behind R3-BRANCH get nothing from the feed 10.63.10.50 sent to the SSM group 232.63.1.1. IGMP already shows the group. Read the RPF decision.`,hi:`R3-BRANCH ke peeche dealers ko SSM group 232.63.1.1 par bheji feed 10.63.10.50 se kuch nahi milta. IGMP group pehle se dikhata hai. RPF decision padho.`},out:`lab@R3> show multicast rpf 10.63.10.50
Multicast RPF table: inet.0 , 11 entries
10.63.10.0/24
    Protocol: OSPF
    Interface: ge-0/0/2.0
    Neighbor: 10.63.13.1
    Note: PIM is not running on ge-0/0/2.0 - joins toward this source cannot be sent

lab@R3> show pim neighbors
Interface           IP V Mode        Option       Uptime Neighbor addr
ge-0/0/0.0           4 2             HPLGT      00:00:30 10.63.23.1`,q:{en:`What is the best fix that keeps the backup link unicast-only?`,hi:`Backup link ko sirf unicast rakhne wala sabse achha fix kaunsa hai?`},o:[{en:`Configure an RP for 232.63.1.1`,hi:`232.63.1.1 ke liye RP configure karo`},{en:`Add an inet.2 static route toward the feed via ge-0/0/0 and point PIM at it with a rib-group`,hi:`ge-0/0/0 se feed ki taraf inet.2 static route jodo aur rib-group se PIM ko uski taraf point karo`},{en:`Disable IGMP on irb.60`,hi:`irb.60 par IGMP disable karo`},{en:`Change the multicast MAC address`,hi:`Multicast MAC address badlo`}],a:1,w:{en:`RPF uses the OSPF route over ge-0/0/2, where PIM is off, so the join cannot be sent. A dedicated multicast RPF route in inet.2, activated by pim rib-group, steers RPF over the PIM path without changing unicast.`,hi:`RPF ge-0/0/2 ka OSPF route use karta hai, jahan PIM off hai, isliye join nahi ja sakta. inet.2 mein dedicated multicast RPF route, jo pim rib-group se active hota hai, unicast badle bina RPF ko PIM path par le jaata hai.`}},{title:{en:`Group is there, source is lost`,hi:`Group hai, source kho gaya`},ticket:{en:`The dealer PCs send IGMPv3 reports naming source 10.63.10.50, but no (S,G) join is created on R3. Look at what R3 recorded.`,hi:`Dealer PCs source 10.63.10.50 ka naam wale IGMPv3 reports bhejte hain, lekin R3 par koi (S,G) join nahi banta. Dekho R3 ne kya record kiya.`},out:`lab@R3> show igmp group
Interface: irb.60, Groups: 1
    Group: 232.63.1.1
        Group mode: Exclude
        Source: 0.0.0.0
        Last reported by: 10.63.60.21
        Timeout:     230 Type: Dynamic`,q:{en:`What is the cause?`,hi:`Wajah kya hai?`},o:[{en:`The RP is missing`,hi:`RP missing hai`},{en:`The group is not in 232/8`,hi:`Group 232/8 mein nahi hai`},{en:`The querier election failed`,hi:`Querier election fail hui`},{en:`irb.60 runs IGMPv2, which drops the source list`,hi:`irb.60 IGMPv2 par hai, jo source list gira deta hai`}],a:3,w:{en:`Exclude with 0.0.0.0 means only the group was recorded. SSM needs IGMPv3 Include with the source; set protocols igmp interface irb.60 version 3.`,hi:`0.0.0.0 ke saath Exclude ka matlab sirf group record hua. SSM ko source ke saath IGMPv3 Include chahiye; set protocols igmp interface irb.60 version 3.`}},{title:{en:`Which port is the router port?`,hi:`Router port kaunsa hai?`},ticket:{en:`The class video should reach PC1 and PC2 only. Read the snooping table on SW1 and decide where the stream will be sent.`,hi:`Class video sirf PC1 aur PC2 tak pahunchni chahiye. SW1 ka snooping table padho aur tay karo stream kahan bheji jayegi.`},out:`lab@SW1> show igmp snooping membership
Instance: default-switch
Vlan: TRAINING
Learning-Domain: default
Multicast router interfaces: ge-0/0/0.0 (dynamic)
Interface: ge-0/0/1.0, Groups: 1
    Group: 239.61.1.1
        Last reported by: 10.61.40.21
Interface: ge-0/0/2.0, Groups: 1
    Group: 239.61.1.1
        Last reported by: 10.61.40.22`,q:{en:`To which ports will SW1 forward group 239.61.1.1?`,hi:`SW1 group 239.61.1.1 ko kin ports par forward karega?`},o:[{en:`ge-0/0/0.0, ge-0/0/1.0 and ge-0/0/2.0`,hi:`ge-0/0/0.0, ge-0/0/1.0 aur ge-0/0/2.0`},{en:`Only ge-0/0/1.0 and ge-0/0/2.0`,hi:`Sirf ge-0/0/1.0 aur ge-0/0/2.0`},{en:`All ports in the VLAN`,hi:`VLAN ke saare ports`},{en:`Only ge-0/0/0.0`,hi:`Sirf ge-0/0/0.0`}],a:0,w:{en:`A snooping switch sends a group to its member ports plus the multicast-router port. The router port toward R3 must also receive the stream so the router can see sources and other receivers.`,hi:`Snooping switch group ko member ports aur multicast-router port par bhejta hai. R3 ki taraf router port ko bhi stream milni chahiye taaki router sources aur doosre receivers dekh sake.`}},{title:{en:`Two RPs that never talk`,hi:`Do RPs jo kabhi baat nahi karte`},ticket:{en:`PC1 is a member of 239.62.5.5 and SRC is sending, but nothing arrives. Both RPs own 10.62.255.100. Compare the two outputs.`,hi:`PC1 239.62.5.5 ka member hai aur SRC bhej raha hai, lekin kuch nahi pahunchta. Dono RPs ke paas 10.62.255.100 hai. Dono outputs milao.`},out:`lab@RP-A> show pim rps extensive
RP: 10.62.255.100
Register State for RP:
Group           Source          FirstHop        RP Address      State       Timeout
239.62.5.5      10.62.10.50     10.62.10.1      10.62.255.100   Receive     0

lab@RP-B> show pim join
Group: 239.62.5.5
    Source: *
    RP: 10.62.255.100
    Flags: sparse,rptree,wildcard
    Upstream interface: Local`,q:{en:`What is missing?`,hi:`Kya missing hai?`},o:[{en:`A higher DR priority on R1`,hi:`R1 par higher DR priority`},{en:`IGMPv3 on R4`,hi:`R4 par IGMPv3`},{en:`An MSDP mesh group between the unique loopbacks of RP-A and RP-B`,hi:`RP-A aur RP-B ke unique loopbacks ke beech MSDP mesh group`},{en:`A BSR on R1`,hi:`R1 par BSR`}],a:2,w:{en:`The source registered at RP-A and the receivers joined at RP-B. RP-B never learns the source. MSDP (or PIM anycast RP) lets RP-A send a Source-Active message so RP-B can join the source.`,hi:`Source ne RP-A ko register kiya aur receivers ne RP-B ko join kiya. RP-B ko source kabhi pata nahi chalta. MSDP (ya PIM anycast RP) RP-A ko Source-Active message bhejne deta hai taaki RP-B source ko join kar sake.`}},{title:{en:`Reading the SA cache`,hi:`SA cache padhna`},ticket:{en:`After the MSDP mesh group was configured, the stream arrives. Your lead asks which RP received the original Register for 239.62.5.5.`,hi:`MSDP mesh group configure hone ke baad stream aa rahi hai. Lead poochhta hai ki 239.62.5.5 ka original Register kis RP ko mila.`},out:`lab@RP-B> show msdp
Peer address    Local address   State       Last up/down Peer-Group           SA Count
10.62.255.11    10.62.255.12    Established     00:00:20 ANYCAST              1/1

lab@RP-B> show msdp source-active
Group address   Source address  Peer address    Originator      Flags
239.62.5.5      10.62.10.50     10.62.255.11    10.62.255.11    Accept`,q:{en:`Which RP originated the SA and why?`,hi:`Kaunse RP ne SA originate kiya aur kyun?`},o:[{en:`RP-B, because it holds the receivers`,hi:`RP-B, kyunki uske paas receivers hain`},{en:`RP-A (10.62.255.11), because the source registered with it`,hi:`RP-A (10.62.255.11), kyunki source ne use register kiya`},{en:`R1, because it is the first-hop router`,hi:`R1, kyunki woh first-hop router hai`},{en:`Neither, the SA came from OSPF`,hi:`Koi nahi, SA OSPF se aaya`}],a:1,w:{en:`The Originator and Peer columns both show 10.62.255.11, the unique address of RP-A. The RP that receives the Register creates the SA and sends it to its MSDP peers.`,hi:`Originator aur Peer dono columns 10.62.255.11 dikhate hain, jo RP-A ka unique address hai. Jo RP Register receive karta hai woh SA banata hai aur MSDP peers ko bhejta hai.`}},{title:{en:`Maintenance on RP-A`,hi:`RP-A par maintenance`},ticket:{en:`RP-A was taken out of service by disabling its two interfaces. The stream still reaches PC1. Read R1 and explain.`,hi:`RP-A ke do interfaces disable karke use service se hataya gaya. Stream phir bhi PC1 tak pahunchti hai. R1 padho aur samjhao.`},out:`lab@R1> show pim join extensive
Group: 239.62.5.5
    Source: 10.62.10.50
    Flags: sparse,spt
    Upstream interface: ge-0/0/0.0
    Upstream neighbor: Direct
    Upstream state: Local Source
    Downstream neighbors:
        Interface: ge-0/0/2.0
            10.62.2.2 State: Join Flags: S`,q:{en:`What happened?`,hi:`Kya hua?`},o:[{en:`The anycast address now resolves to RP-B, so R1 registers there and the join comes from 10.62.2.2`,hi:`Anycast address ab RP-B par resolve hota hai, isliye R1 wahan register karta hai aur join 10.62.2.2 se aata hai`},{en:`R1 became the RP`,hi:`R1 RP ban gaya`},{en:`MSDP forwards the data packets`,hi:`MSDP data packets forward karta hai`},{en:`PIM switched to dense mode`,hi:`PIM dense mode par chala gaya`}],a:0,w:{en:`OSPF removed the path to RP-A, so the anycast RP address is reached through RP-B. The downstream neighbour on ge-0/0/2 is RP-B and the source tree is built with no change on other routers.`,hi:`OSPF ne RP-A ka path hata diya, isliye anycast RP address RP-B se reach hota hai. ge-0/0/2 ka downstream neighbour RP-B hai aur source tree doosre routers par kuch badle bina ban jaata hai.`}},{title:{en:`Nobody is elected`,hi:`Koi elect nahi hua`},ticket:{en:`A colleague claims the network learns RPs through BSR. You run the check on R2.`,hi:`Ek colleague kehta hai network RPs BSR se seekhta hai. Aap R2 par check chalate ho.`},out:`lab@R2> show pim bootstrap
Instance: PIM.master
BSR                     Pri Local address           Pri State      Timeout
None                      0 10.61.255.2               0 InEligible        0
bsr-candidates: no bootstrap router elected

lab@R2> show pim rps
RP address               Type        Mode   Holdtime Timeout Groups Group prefixes
10.61.255.2              local       sparse        0    None      1 224.0.0.0/4`,q:{en:`What do the outputs prove?`,hi:`Outputs kya saabit karte hain?`},o:[{en:`BSR is working and R2 is the BSR`,hi:`BSR chal raha hai aur R2 BSR hai`},{en:`No BSR is configured or elected; the RP is local configuration, not bootstrap`,hi:`Koi BSR configured ya elected nahi; RP local configuration hai, bootstrap nahi`},{en:`Auto-RP is in use`,hi:`Auto-RP use mein hai`},{en:`The RP is statically configured on R2`,hi:`RP R2 par static configure hai`}],a:1,w:{en:`The bootstrap table has no elected BSR (InEligible, none elected). The RP type is local: R2 owns the address by local configuration, and other routers use static statements.`,hi:`Bootstrap table mein elected BSR nahi hai (InEligible, none elected). RP type local hai: R2 ke paas address local configuration se hai, aur doosre routers static statements use karte hain.`}}];export{e as default};