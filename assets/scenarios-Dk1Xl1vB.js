var e=[{title:{en:`Session up, six routes received, none accepted`,hi:`Session up, chhe routes received, ek bhi accepted nahi`},ticket:{en:`In pod 50 the BGP session between LEAF1 and the spine is Established, yet SALES hosts on the two leaves cannot reach each other. LEAF2 was changed last night. Read the outputs.`,hi:`Pod 50 mein LEAF1 aur spine ke beech BGP session Established hai, phir bhi dono leaves ke SALES hosts ek doosre tak nahi pahunchte. Kal raat LEAF2 badla gaya tha. Outputs padho.`},out:`lab@LEAF1> show bgp summary
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
10.50.255.1           65050          2          2       0       0        0:08 Establ
  bgp.evpn.0: 0/6/0/0
  default-switch.evpn.0: 0/0/0/0

lab@LEAF1> show configuration switch-options
vtep-source-interface lo0.0;
route-distinguisher 10.50.255.11:1;
vrf-target target:65050:1;

lab@LEAF2> show configuration | compare rollback 1
[edit switch-options]
-   vrf-target target:65050:1;
+   vrf-target target:65050:10;`,q:{en:`What is the cause and fix?`,hi:`Wajah aur fix kya hai?`},o:[{en:`LEAF1 needs a new route-distinguisher; change it to 10.50.255.12:1`,hi:`LEAF1 ko naya route-distinguisher chahiye; use 10.50.255.12:1 karo`},{en:`The OSPF underlay is down; restart OSPF on the spine`,hi:`OSPF underlay down hai; spine par OSPF restart karo`},{en:`LEAF2 now exports target:65050:10 and LEAF1 imports only target:65050:1; restore the original vrf-target on LEAF2`,hi:`LEAF2 ab target:65050:10 export karta hai aur LEAF1 sirf target:65050:1 import karta hai; LEAF2 par original vrf-target wapas karo`},{en:`The spine is not a route reflector; add a cluster id on LEAF1`,hi:`Spine route reflector nahi hai; LEAF1 par cluster id jodo`}],a:2,w:{en:`Received 6 but accepted 0 means the routes arrive and are rejected on import. The compare shows the changed route target. The RD is only for uniqueness and does not decide import.`,hi:`Received 6 par accepted 0 ka matlab routes aa rahe hain aur import par reject ho rahe hain. Compare badla hua route target dikhata hai. RD sirf uniqueness ke liye hai aur import tay nahi karta.`}},{title:{en:`SALES works, OPS does not`,hi:`SALES chalta hai, OPS nahi`},ticket:{en:`After the route target was fixed, SALES pings work but PC3 cannot reach PC4 in the OPS VLAN (VNI 1020). Both leaves have the VLAN defined with the same VNI. Read the LEAF1 outputs.`,hi:`Route target theek hone ke baad SALES ke ping chalte hain par PC3, OPS VLAN (VNI 1020) mein PC4 tak nahi pahunchta. Dono leaves par VLAN same VNI ke saath defined hai. LEAF1 ke outputs padho.`},out:`lab@LEAF1> show configuration protocols evpn
encapsulation vxlan;
extended-vni-list 1010;

lab@LEAF1> show evpn instance extensive
  Number of bridge domains: 1
    VLAN  Domain-ID Intfs/up    IRB-intf  Mode             MAC-sync  IM-label  MAC-label
    10    1010      1  1                  Extended         Enabled   1010
  VNIs not in extended-vni-list (not advertised): 1020
(output trimmed)`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`set protocols evpn extended-vni-list 1020 on LEAF1`,hi:`LEAF1 par set protocols evpn extended-vni-list 1020`},{en:`Change the OPS VLAN id on LEAF2 to 10`,hi:`LEAF2 par OPS VLAN id badal kar 10 karo`},{en:`Enable family inet on the BGP group`,hi:`BGP group par family inet enable karo`},{en:`Increase the underlay MTU`,hi:`Underlay MTU badhao`}],a:0,w:{en:`The instance output names the missing VNI: 1020 is configured on the VLAN but absent from the extended-vni-list, so LEAF1 neither advertises nor imports it. LEAF2 already lists both VNIs.`,hi:`Instance output missing VNI ka naam batata hai: 1020 VLAN par configured hai par extended-vni-list mein nahi, isliye LEAF1 usey na advertise karta hai na import. LEAF2 ki list mein dono VNIs pehle se hain.`}},{title:{en:`A leaf that vanished from the underlay`,hi:`Underlay se gayab hua leaf`},ticket:{en:`After a change on LEAF2, the tunnel to LEAF2 is gone. The loopback ping from LEAF1 fails and LEAF2 shows no OSPF neighbours at all. Read the outputs.`,hi:`LEAF2 par change ke baad LEAF2 ka tunnel gayab hai. LEAF1 se loopback ping fail hota hai aur LEAF2 par koi OSPF neighbour nahi dikhta. Outputs padho.`},out:`lab@LEAF1> ping 10.50.255.12 source 10.50.255.11 count 3
PING 10.50.255.12 (10.50.255.12): 56 data bytes
Request timeout for icmp_seq 0
Request timeout for icmp_seq 1
Request timeout for icmp_seq 2
--- 10.50.255.12 ping statistics ---
3 packets transmitted, 0 packets received, 100% packet loss

lab@LEAF2> show ospf neighbor

lab@LEAF2> show configuration protocols ospf
area 0.0.0.0 {
    interface lo0.0 {
        passive;
    }
}`,q:{en:`Which statement is missing on LEAF2?`,hi:`LEAF2 par kaunsa statement missing hai?`},o:[{en:`set protocols bgp group OVERLAY family evpn signaling`,hi:`set protocols bgp group OVERLAY family evpn signaling`},{en:`set switch-options vrf-target target:65050:1`,hi:`set switch-options vrf-target target:65050:1`},{en:`set protocols evpn extended-vni-list 1010`,hi:`set protocols evpn extended-vni-list 1010`},{en:`set protocols ospf area 0 interface ge-0/0/0.0 interface-type p2p`,hi:`set protocols ospf area 0 interface ge-0/0/0.0 interface-type p2p`}],a:3,w:{en:`Only lo0.0 is in OSPF, so the fabric link has no adjacency and the loopbacks cannot reach each other. Fix the underlay first; EVPN statements cannot help while VTEP-to-VTEP reachability is broken.`,hi:`OSPF mein sirf lo0.0 hai, isliye fabric link par adjacency nahi aur loopbacks ek doosre tak nahi pahunchte. Pehle underlay theek karo; jab tak VTEP-to-VTEP reachability toota hai EVPN statements madad nahi karte.`}},{title:{en:`One peer sends no EVPN routes`,hi:`Ek peer koi EVPN route nahi bhejta`},ticket:{en:`The spine receives six EVPN routes from LEAF1 and nothing from LEAF2, although both sessions are Established. LEAF1 has no remote VTEP. Read the outputs.`,hi:`Spine LEAF1 se chhe EVPN routes receive karta hai aur LEAF2 se kuch nahi, jabki dono sessions Established hain. LEAF1 ke paas koi remote VTEP nahi. Outputs padho.`},out:`lab@SPINE1> show bgp summary
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
10.50.255.11          65050          3          3       0       0        0:53 Establ
  bgp.evpn.0: 6/6/6/0
10.50.255.12          65050          3          3       0       0        0:53 Establ
  bgp.evpn.0: 0/0/0/0

lab@LEAF2> show bgp summary
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
10.50.255.1           65050          3          3       0       0        0:53 Establ
  inet.0: 0/0/0/0`,q:{en:`What is wrong with LEAF2?`,hi:`LEAF2 mein kya galat hai?`},o:[{en:`Its route target differs from LEAF1`,hi:`Uska route target LEAF1 se alag hai`},{en:`The BGP group has no family evpn signaling, so only inet is negotiated`,hi:`BGP group mein family evpn signaling nahi, isliye sirf inet negotiate hota hai`},{en:`Its OSPF adjacency is down`,hi:`Uski OSPF adjacency down hai`},{en:`Its VNI is missing from the extended-vni-list`,hi:`Uska VNI extended-vni-list se gayab hai`}],a:1,w:{en:`The session negotiated only inet.0 and the EVPN table is absent on LEAF2, so no EVPN routes are exchanged. A route target or VNI problem would show routes received but not accepted, not a missing table. The session being Established proves OSPF and reachability work.`,hi:`Session ne sirf inet.0 negotiate kiya aur LEAF2 par EVPN table gayab hai, isliye koi EVPN route exchange nahi hota. Route target ya VNI problem mein routes received par accepted nahi dikhte, table gayab nahi hoti. Session Established hone ka matlab OSPF aur reachability theek hain.`}},{title:{en:`Commit refused on a new leaf`,hi:`Naye leaf par commit refuse`},ticket:{en:`An engineer removed one line from a leaf while cleaning up and the commit now fails. Read the output.`,hi:`Ek engineer ne cleanup mein leaf se ek line hata di aur ab commit fail hota hai. Output padho.`},out:`lab@LEAF1# commit check
[edit]
  'switch-options'
    EVPN with VXLAN encapsulation needs switch-options vtep-source-interface
error: configuration check-out failed`,q:{en:`Which statement was removed?`,hi:`Kaunsa statement hata diya gaya?`},o:[{en:`set switch-options vtep-source-interface lo0.0`,hi:`set switch-options vtep-source-interface lo0.0`},{en:`set protocols evpn extended-vni-list 1010`,hi:`set protocols evpn extended-vni-list 1010`},{en:`set routing-options autonomous-system 65050`,hi:`set routing-options autonomous-system 65050`},{en:`set protocols ospf area 0 interface lo0.0 passive`,hi:`set protocols ospf area 0 interface lo0.0 passive`}],a:0,w:{en:`The message names the missing statement: the VTEP needs a source interface, normally lo0.0, for the outer IP source address. Read commit errors literally; they usually name the fix.`,hi:`Message missing statement ka naam batata hai: VTEP ko outer IP source address ke liye source interface chahiye, aam taur par lo0.0. Commit errors ko literally padho; woh aksar fix ka naam batate hain.`}},{title:{en:`The spine receives everything, leaves receive nothing`,hi:`Spine sab receive karta hai, leaves kuch nahi`},ticket:{en:`After a maintenance change on the spine, both leaves learn no remote hosts. The spine holds the routes of both leaves. Read the outputs.`,hi:`Spine par maintenance change ke baad dono leaves koi remote host nahi seekhte. Spine ke paas dono leaves ke routes hain. Outputs padho.`},out:`lab@SPINE1> show bgp summary
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
10.50.255.11          65050          3          3       0       0        0:53 Establ
  bgp.evpn.0: 6/6/6/0
10.50.255.12          65050          3          3       0       0        0:53 Establ
  bgp.evpn.0: 6/6/6/0

lab@LEAF1> show bgp summary
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
10.50.255.1           65050          3          3       0       0        0:53 Establ
  bgp.evpn.0: 0/0/0/0
  default-switch.evpn.0: 0/0/0/0

lab@SPINE1> show configuration protocols bgp
group OVERLAY {
    type internal;
    local-address 10.50.255.1;
    family evpn {
        signaling;
    }
    neighbor 10.50.255.11;
    neighbor 10.50.255.12;
}`,q:{en:`What was removed from the spine configuration?`,hi:`Spine configuration se kya hata?`},o:[{en:`The OSPF area statement`,hi:`OSPF area statement`},{en:`The route-distinguisher`,hi:`route-distinguisher`},{en:`The extended-vni-list`,hi:`extended-vni-list`},{en:`The cluster statement, so the spine no longer reflects IBGP routes to its clients`,hi:`cluster statement, isliye spine ab IBGP routes apne clients ko reflect nahi karta`}],a:3,w:{en:`IBGP does not re-advertise routes learned from an IBGP peer. The route reflector function (cluster) is what lets the spine pass leaf routes to the other leaf. The spine receives 6 from each leaf but the leaves receive 0.`,hi:`IBGP, IBGP peer se seekhe routes ko re-advertise nahi karta. Route reflector function (cluster) hi spine ko ek leaf ke routes doosre leaf tak pahunchane deta hai. Spine har leaf se 6 receive karta hai par leaves 0.`}},{title:{en:`Where does that MAC live?`,hi:`Woh MAC kahan rehta hai?`},ticket:{en:`The fabric is healthy. A colleague asks where the host with MAC 00:50:7a:06:65:01 in the OPS VLAN is attached, as seen from LEAF1. Read the table.`,hi:`Fabric healthy hai. Ek colleague poochta hai ki OPS VLAN ka MAC 00:50:7a:06:65:01 wala host LEAF1 se dekhne par kahan juda hai. Table padho.`},out:`lab@LEAF1> show ethernet-switching table
(legend trimmed)
Ethernet switching table : 4 entries, 4 learned
Routing instance : default-switch
   Vlan                MAC                 MAC      Logical                SVLBNH/      Active
   name                address             flags    interface              VENH Index   source
   SALES               00:50:7f:06:6d:01   D        ge-0/0/2.0
   SALES               00:50:80:06:6e:01   DR       vtep.32769                          10.50.255.12
   OPS                 00:50:7a:06:65:01   DR       vtep.32769                          10.50.255.12
   OPS                 00:50:81:06:70:01   D        ge-0/0/3.0`,q:{en:`What does the table say?`,hi:`Table kya kehti hai?`},o:[{en:`It is on the local port ge-0/0/3.0`,hi:`Woh local port ge-0/0/3.0 par hai`},{en:`It was learned from EVPN and sits behind the remote VTEP 10.50.255.12 through vtep.32769`,hi:`Woh EVPN se seekha gaya aur remote VTEP 10.50.255.12 ke peeche vtep.32769 se hai`},{en:`It is a static MAC configured on LEAF1`,hi:`Woh LEAF1 par configured static MAC hai`},{en:`It is not learned and traffic to it is flooded`,hi:`Woh learned nahi hai aur uske traffic ko flood kiya jaata hai`}],a:1,w:{en:`The DR flags mean dynamic and remote, and the logical interface vtep.32769 is the tunnel to the remote VTEP shown in the Active source column. Local hosts show a physical port with the D flag.`,hi:`DR flags ka matlab dynamic aur remote hai, aur logical interface vtep.32769 Active source column mein dikhe remote VTEP ka tunnel hai. Local hosts D flag ke saath physical port dikhate hain.`}}];export{e as default};