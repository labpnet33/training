var e=[{title:{en:`Two peers, two states`,hi:`Do peers, do states`},ticket:{en:`R1 has two neighbours configured, and neither is Established. Read the summary.`,hi:`R1 par do neighbours configured hain, aur koi Established nahi. Summary padho.`},out:`lab@NGP-R1> show bgp summary
Groups: 2 Peers: 2 Down peers: 2
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
100.65.1.1            64501          0          2       0       0           0 Idle
100.65.1.5            64500          0          0       0       0           0 Active`,q:{en:`The real ISP is 100.65.1.1 in AS 64500. What is the right fix?`,hi:`Asli ISP 100.65.1.1 hai AS 64500 mein. Sahi fix kya hai?`},o:[{en:`Set peer-as 64500 for 100.65.1.1 and remove the neighbour 100.65.1.5 that does not exist`,hi:`100.65.1.1 ke liye peer-as 64500 karo aur maujood na hone wala neighbour 100.65.1.5 hata do`},{en:`Raise the local preference`,hi:`Local preference badhao`},{en:`Configure next-hop self`,hi:`Next-hop self configure karo`},{en:`Add a full mesh of IBGP sessions`,hi:`IBGP sessions ka full mesh jodo`}],a:0,w:{en:`The wrong remote AS (64501) makes the OPEN fail, which the simulator shows as Idle. The address 100.65.1.5 is not on the link, so TCP never connects and the peer stays Active.`,hi:`Galat remote AS (64501) OPEN ko fail karta hai, jise simulator Idle dikhata hai. Address 100.65.1.5 link par nahi hai, isliye TCP kabhi connect nahi hota aur peer Active rehta hai.`}},{title:{en:`Established, but nothing arrives`,hi:`Established, par kuch nahi aata`},ticket:{en:`IBGP between R1 and R2 is up. R2 has the warehouse LAN 10.20.2.0/24 as a connected network, but R1 never learns it. Read R1.`,hi:`R1 aur R2 ke beech IBGP up hai. R2 par warehouse LAN 10.20.2.0/24 connected network hai, par R1 use kabhi nahi seekhta. R1 padho.`},out:`lab@NGP-R1> show bgp summary
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
10.20.255.2           65010          2          3       0       0        0:25 Establ
  inet.0: 0/0/0/0
100.65.1.1            64500          4          3       0       0        0:55 Establ
  inet.0: 2/2/2/0`,q:{en:`Where is the problem and what is the fix?`,hi:`Problem kahan hai aur fix kya hai?`},o:[{en:`On R1: set the overload bit`,hi:`R1 par: overload bit set karo`},{en:`On R2: an export policy for the direct route is missing`,hi:`R2 par: direct route ki export policy missing hai`},{en:`On R1: the peer-as is wrong`,hi:`R1 par: peer-as galat hai`},{en:`On the ISP: raise the hold time`,hi:`ISP par: hold time badhao`}],a:1,w:{en:`R1 received 0 routes from R2, so the sender is the problem. The default BGP export advertises only active BGP routes, never direct ones. A policy with from protocol direct and a route-filter, applied as export to the IBGP group, fixes it.`,hi:`R1 ne R2 se 0 routes received kiye, isliye sender mein problem hai. Default BGP export sirf active BGP routes advertise karta hai, direct kabhi nahi. from protocol direct aur route-filter wali policy, IBGP group par export lagakar, fix karti hai.`}},{title:{en:`Received but not active`,hi:`Received par active nahi`},ticket:{en:`The branch behind R3 lost the Internet after the ISP link was removed from OSPF. Every session is Established. Read R3.`,hi:`ISP link OSPF se hatane ke baad R3 ke peeche branch ka Internet chala gaya. Har session Established hai. R3 padho.`},out:`lab@IDR-R3> show bgp summary
10.30.255.1           65020          5          5       0       0        1:05 Establ
  inet.0: 0/2/2/0
lab@IDR-R3> show route 203.0.113.0/24
inet.0: 13 destinations, 13 routes (11 active, 0 holddown, 2 hidden)

lab@IDR-R3> show route hidden detail
203.0.113.0/24 (1 entry, 0 announced)
         BGP    Preference: 170/-101
                Next hop type: Unusable
                Protocol next hop: 100.66.1.1 (unresolved)
                State: Hidden Int Ext
                Inactive reason: Unusable path`,q:{en:`What is the cause?`,hi:`Karan kya hai?`},o:[{en:`The MED is too high`,hi:`MED bahut zyada hai`},{en:`The keepalive timer expired`,hi:`Keepalive timer expire ho gaya`},{en:`The protocol next hop 100.66.1.1 cannot be resolved on R3`,hi:`R3 par protocol next hop 100.66.1.1 resolve nahi ho sakta`},{en:`The AS path contains the local AS`,hi:`AS path mein local AS hai`}],a:2,w:{en:`IBGP keeps the ISP address as next hop. R3 has no route to it because the link is out of OSPF, so the route is hidden with the state Hidden and the reason Unusable path.`,hi:`IBGP ISP address ko next hop rakhta hai. R3 ke paas uska route nahi kyunki link OSPF se bahar hai, isliye route Hidden state aur Unusable path karan ke saath hidden hai.`}},{title:{en:`The fix that respects security`,hi:`Fix jo security ka samman kare`},ticket:{en:`The security team insists that the ISP link stays out of OSPF. After you applied a policy on R1, the output below appeared and R3 has active routes.`,hi:`Security team kehti hai ISP link OSPF se bahar rahe. R1 par policy lagane ke baad neeche ka output aaya aur R3 ke paas active routes hain.`},out:`lab@IDR-R1> show route advertising-protocol bgp 10.30.255.3
  Prefix                  Nexthop              MED     Lclpref    AS path
* 198.51.100.0/24         Self                         100        64510 I
* 203.0.113.0/24          Self                         100        64510 I

lab@IDR-R3> show route 203.0.113.0/24 detail
        *BGP    Preference: 170/-101
                Next hop: 10.30.13.1 via ge-0/0/2.0, selected
                Protocol next hop: 10.30.255.1
                State: Active Int Ext`,q:{en:`What was configured on R1?`,hi:`R1 par kya configure kiya gaya?`},o:[{en:`An import policy with local-preference 200`,hi:`Local-preference 200 wali import policy`},{en:`A static route to the ISP link on R3`,hi:`R3 par ISP link ka static route`},{en:`as-path-prepend on the ISP session`,hi:`ISP session par as-path-prepend`},{en:`An export policy to the IBGP group with then next-hop self`,hi:`IBGP group par export policy jisme then next-hop self`}],a:3,w:{en:`With next-hop self the advertised next hop is R1 loopback 10.30.255.1, which OSPF reaches. The policy is an export toward IBGP on the edge router.`,hi:`Next-hop self ke saath advertise hua next hop R1 ka loopback 10.30.255.1 hai, jise OSPF pahunchata hai. Policy edge router par IBGP ki taraf export hai.`}},{title:{en:`Why is the IBGP path inactive?`,hi:`IBGP path inactive kyun hai?`},ticket:{en:`R2 (AS 65030) has two paths to 192.0.2.0/24 with the same local preference and AS path length. Read the inactive reason.`,hi:`R2 (AS 65030) ke paas 192.0.2.0/24 ke do paths hain, local preference aur AS path length barabar. Inactive reason padho.`},out:`lab@SRT-R2> show route 192.0.2.0/24 detail
        *BGP    Preference: 170/-101
                Source: 100.68.2.1
                State: Active Ext
                AS path: 64502 I
                Localpref: 100
         BGP    Preference: 170/-101
                Source: 10.40.255.1
                State: Int Ext
                Inactive reason: Interior > Exterior > Exterior via Interior
                AS path: 64501 I
                Localpref: 100`,q:{en:`Which rule decided?`,hi:`Kaun sa rule decide kiya?`},o:[{en:`EBGP is preferred over IBGP`,hi:`EBGP IBGP se behtar hai`},{en:`Lowest router ID`,hi:`Sabse kam router ID`},{en:`Highest MED`,hi:`Sabse zyada MED`},{en:`Longest AS path`,hi:`Sabse lamba AS path`}],a:0,w:{en:`Local preference, AS path length and origin tie. Before the IGP metric rule, Junos prefers the path learned from an external peer. The long phrase names that rule.`,hi:`Local preference, AS path length aur origin barabar hain. IGP metric rule se pehle Junos external peer se seekhe path ko prefer karta hai. Lamba phrase usi rule ka naam hai.`}},{title:{en:`Steering the exit`,hi:`Exit steer karna`},ticket:{en:`After a policy on R1 (ISP-A import), R2 now exits through R1. Read the detail on R2.`,hi:`R1 par policy (ISP-A import) ke baad R2 ab R1 se nikalta hai. R2 par detail padho.`},out:`lab@SRT-R2> show route 192.0.2.0/24 detail
        *BGP    Preference: 170/-201
                Source: 10.40.255.1
                AS path: 64501 I
                Localpref: 200
         BGP    Preference: 170/-101
                Source: 100.68.2.1
                Inactive reason: Local Preference
                AS path: 64502 I
                Localpref: 100`,q:{en:`Which setting made the path through R1 win?`,hi:`Kaun si setting ne R1 wale path ko jitaya?`},o:[{en:`A longer AS path`,hi:`Lamba AS path`},{en:`Local preference 200 set by an import policy on R1`,hi:`R1 par import policy se local preference 200`},{en:`A lower MED`,hi:`Kam MED`},{en:`The EBGP-over-IBGP rule`,hi:`EBGP-over-IBGP rule`}],a:1,w:{en:`Local preference is rule 3 and is checked long before the EBGP-over-IBGP rule. IBGP carries it to R2, so a single import policy changes the exit for the whole AS.`,hi:`Local preference rule 3 hai aur EBGP-over-IBGP rule se bahut pehle check hoti hai. IBGP use R2 tak pahunchata hai, isliye ek import policy poore AS ka exit badal deti hai.`}},{title:{en:`Making the backup look longer`,hi:`Backup ko lamba dikhana`},ticket:{en:`AS 65030 wants ISP-B to reach 10.40.0.0/16 through ISP-A. R2 now exports a prepending policy. Read both outputs.`,hi:`AS 65030 chahta hai ISP-B 10.40.0.0/16 tak ISP-A ke through pahunche. R2 ab prepending policy export karta hai. Dono outputs padho.`},out:`lab@SRT-R2> show route advertising-protocol bgp 100.68.2.1
* 10.40.0.0/16            Self                                    [65030] 65030 65030 I

lab@ISP-B> show route 10.40.0.0/16 detail
                Source: 100.68.2.2
                Inactive reason: AS path
                AS path: 65030 65030 65030 I`,q:{en:`Why did ISP-B stop using the direct path from R2?`,hi:`ISP-B ne R2 ka seedha path kyun chhod diya?`},o:[{en:`The community is missing`,hi:`Community missing hai`},{en:`The session is Idle`,hi:`Session Idle hai`},{en:`The path has length 3 and the path through ISP-A (64501 65030) has length 2`,hi:`Path ki length 3 hai aur ISP-A wale path (64501 65030) ki length 2 hai`},{en:`The next hop is unresolved`,hi:`Next hop unresolved hai`}],a:2,w:{en:`Junos adds the local AS once on EBGP export and the policy adds two more copies. ISP-B compares AS path length (rule 4) and prefers the shorter path. Inbound steering by prepending is advisory: it worked because ISP-B has no higher local preference for either path.`,hi:`Junos EBGP export par local AS ek baar jodta hai aur policy do copies aur jodti hai. ISP-B AS path length (rule 4) compare karta hai aur chhota path prefer karta hai. Prepending se inbound steering salaah hai: ye isliye chala kyunki ISP-B ke paas kisi path ki zyada local preference nahi thi.`}}];export{e as default};