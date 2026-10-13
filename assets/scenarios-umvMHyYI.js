var e=[{title:{en:`The uplink that learns nothing`,hi:`Uplink jo kuch seekhta nahi`},ticket:{en:`Users behind ACC2 lost their VLANs after a security change. MVRP is enabled and the link is up. Read the access switch.`,hi:`Security change ke baad ACC2 ke peeche ke users ke VLANs chale gaye. MVRP enabled hai aur link up hai. Access switch padho.`},out:`lab@ACC2> show mvrp

MVRP configuration
  MVRP status                 : Enabled
  Dynamic VLAN creation       : Enabled
  Timers (ms)                 : join 200, leave 1000, leaveall 10000

  Interface       Status     Registration   Registered VLANs
  ge-0/0/0.0      Enabled    Forbidden      none

lab@ACC2> show system commit
0   2026-10-01 23:20:24 UTC by root via other
    stop VLAN sprawl`,q:{en:`What is the cause and the fix?`,hi:`Karan aur fix kya hai?`},o:[{en:`The timers are too short; raise the join timer`,hi:`Timers bahut chhote hain; join timer badhao`},{en:`MVRP is disabled; enable it globally`,hi:`MVRP disabled hai; globally enable karo`},{en:`The uplink is in registration forbidden mode; delete the registration statement`,hi:`Uplink registration forbidden mode mein hai; registration statement delete karo`},{en:`Dynamic VLAN creation is off`,hi:`Dynamic VLAN creation off hai`}],a:2,w:{en:`Status is Enabled and dynamic creation is Enabled, but Registration is Forbidden, so no VLAN is registered. The commit comment explains the change. Deleting the registration statement returns the port to Normal.`,hi:`Status Enabled hai aur dynamic creation Enabled hai, par Registration Forbidden hai, isliye koi VLAN register nahi hota. Commit comment badlav samjhata hai. Registration statement delete karne se port Normal par aata hai.`}},{title:{en:`Which port reaches everything?`,hi:`Kaunsa port sab tak pahunchta hai?`},ticket:{en:`An auditor asks which port in the DMZ is allowed to reach every other port.`,hi:`Auditor poochta hai DMZ mein kaunsa port baaki har port tak pahunch sakta hai.`},out:`lab@DMZ1> show vlans extensive
VLAN Name: DMZ                           State: Active
Tag: 100
Private VLAN mode: Primary
  Isolated VLAN: GUEST (101)
  Community VLANs: WEB (102)
Number of interfaces: 4 (Active = 4)
  Tagged interfaces: ge-0/0/10.0* (inter-switch-link)
  Untagged interfaces: ge-0/0/0.0* (promiscuous), ge-0/0/1.0* (isolated), ge-0/0/2.0* (community)`,q:{en:`Which port is it, and why?`,hi:`Woh kaunsa port hai aur kyun?`},o:[{en:`ge-0/0/0.0, the promiscuous port`,hi:`ge-0/0/0.0, promiscuous port`},{en:`ge-0/0/1.0, the isolated port`,hi:`ge-0/0/1.0, isolated port`},{en:`ge-0/0/2.0, the community port`,hi:`ge-0/0/2.0, community port`},{en:`ge-0/0/10.0, the inter-switch link`,hi:`ge-0/0/10.0, inter-switch link`}],a:0,w:{en:`The promiscuous port is a member of the primary VLAN and talks to isolated and community ports. The inter-switch link only carries the VLANs between switches.`,hi:`Promiscuous port primary VLAN ka member hai aur isolated aur community ports se baat karta hai. Inter-switch link sirf switches ke beech VLANs carry karta hai.`}},{title:{en:`What does the core forward on?`,hi:`Core kis par forward karta hai?`},ticket:{en:`A junior asks which tag the provider network uses to separate ACME from BETA, since both use customer VLAN 10.`,hi:`Junior poochta hai provider network ACME aur BETA ko alag karne ke liye kaunsa tag use karta hai, jabki dono customer VLAN 10 use karte hain.`},out:`lab@PE1> show vlans extensive
VLAN Name: SVLAN-ACME                    State: Active
Tag: 100
Q-in-Q service VLAN: customer tags are kept and an S-tag is pushed on the provider side
Number of interfaces: 2 (Active = 2)
  Tagged interfaces: ge-0/0/10.100* (provider (S-tag 100)), ge-0/0/1.100* (customer (C-VLANs 10,20))

VLAN Name: SVLAN-BETA                    State: Active
Tag: 200
Q-in-Q service VLAN: customer tags are kept and an S-tag is pushed on the provider side
Number of interfaces: 2 (Active = 2)
  Tagged interfaces: ge-0/0/10.200* (provider (S-tag 200)), ge-0/0/2.200* (customer (C-VLANs 10))`,q:{en:`What does the provider forward on?`,hi:`Provider kis par forward karta hai?`},o:[{en:`The C-tag only`,hi:`Sirf C-tag`},{en:`The source MAC only`,hi:`Sirf source MAC`},{en:`The physical port number`,hi:`Physical port number`},{en:`The S-tag (100 for ACME, 200 for BETA)`,hi:`S-tag (ACME ke liye 100, BETA ke liye 200)`}],a:3,w:{en:`The S-tag identifies the service, so identical customer VLAN IDs never mix. The C-tags are carried untouched.`,hi:`S-tag service ko pehchanta hai, isliye identical customer VLAN IDs kabhi mix nahi hote. C-tags bina chhue jaate hain.`}},{title:{en:`LLDP across the cloud`,hi:`Cloud ke paar LLDP`},ticket:{en:`After a change on both PEs, the customer switch CE2 can see CE1 although two provider switches sit between them.`,hi:`Dono PEs par change ke baad customer switch CE2 CE1 ko dekh sakta hai jabki unke beech do provider switches hain.`},out:`lab@PE1> show configuration protocols layer2-control
mac-rewrite {
    interface ge-0/0/1 {
        protocol [ stp lldp ];
    }
}
lab@CE2> show lldp neighbors
Local Interface    Parent Interface    Chassis Id          Port info          System Name
ge-0/0/0           -                   52:54:1c:58:b9:00   ge-0/0/0           CE1`,q:{en:`Which feature made this possible?`,hi:`Yeh kis feature se mumkin hua?`},o:[{en:`MVRP dynamic registration`,hi:`MVRP dynamic registration`},{en:`Layer 2 protocol tunnelling (mac-rewrite)`,hi:`Layer 2 protocol tunnelling (mac-rewrite)`},{en:`Private VLAN promiscuous port`,hi:`Private VLAN promiscuous port`},{en:`A filter-based VLAN`,hi:`Filter-based VLAN`}],a:1,w:{en:`mac-rewrite for lldp makes the PEs rewrite and restore the reserved destination address, so the frames cross the S-VLAN.`,hi:`lldp ke liye mac-rewrite PEs se reserved destination address rewrite aur restore karwata hai, isliye frames S-VLAN paar karte hain.`}},{title:{en:`The last term of the filter`,hi:`Filter ka aakhri term`},ticket:{en:`A colleague wants to delete the term others from the printer filter because it looks useless.`,hi:`Ek colleague printer filter se term others hatana chahta hai kyunki woh bekaar lagta hai.`},out:`lab@ACC1> show configuration firewall
family ethernet-switching {
    filter PRN-ASSIGN {
        term printer {
            from {
                source-mac-address 00:50:aa:44:00:31/48;
            }
            then {
                vlan PRINTERS;
            }
        }
        term others {
            then {
                accept;
            }
        }
    }
}`,q:{en:`What would happen if the others term were removed?`,hi:`Agar others term hata diya jaaye to kya hoga?`},o:[{en:`The printer would lose its VLAN`,hi:`Printer apna VLAN kho dega`},{en:`MVRP would stop`,hi:`MVRP ruk jaayega`},{en:`Nothing, filters accept by default`,hi:`Kuch nahi, filters default mein accept karte hain`},{en:`All traffic that does not match the printer term would be discarded`,hi:`Jo traffic printer term se match nahi karta woh sab discard ho jaayega`}],a:3,w:{en:`A filter ends with an implicit discard. The final accept term keeps every other device on that port working.`,hi:`Filter implicit discard par khatam hota hai. Aakhri accept term us port ke baaki sab devices ko chalta rakhta hai.`}},{title:{en:`Dynamic does not mean assigned`,hi:`Dynamic ka matlab assigned nahi`},ticket:{en:`An engineer sees VLAN 30 on ACC2 and expects a user on an ACC2 access port to be in it.`,hi:`Engineer ACC2 par VLAN 30 dekhta hai aur umeed karta hai ki ACC2 access port ka user usme hoga.`},out:`lab@ACC2> show mvrp dynamic-vlan-memberships

VLAN Name             Tag    Origin    Dynamically joined interfaces
__mvrp_10__           10     dynamic   ge-0/0/0.0
LABS                  20     static    ge-0/0/0.0
__mvrp_30__           30     dynamic   ge-0/0/0.0`,q:{en:`What is true here?`,hi:`Yahan kya sahi hai?`},o:[{en:`Access ports are now members of VLAN 30`,hi:`Access ports ab VLAN 30 ke member hain`},{en:`VLAN 30 was configured statically`,hi:`VLAN 30 static configure tha`},{en:`VLAN 30 exists dynamically on the uplink; access ports still need static membership`,hi:`VLAN 30 uplink par dynamically hai; access ports ko phir bhi static membership chahiye`},{en:`MVRP replaced spanning tree`,hi:`MVRP ne spanning tree ki jagah li`}],a:2,w:{en:`MVRP creates the VLAN and joins the trunk to it. Only static configuration, a filter or 802.1X puts an access port in it.`,hi:`MVRP VLAN banata hai aur trunk ko usme jodta hai. Access port ko sirf static configuration, filter ya 802.1X usme daalta hai.`}},{title:{en:`Why GST1 cannot reach GST2`,hi:`GST1 GST2 tak kyun nahi pahunchta`},ticket:{en:`A guest asks why the gateway answers but the other guest on the second switch does not.`,hi:`Guest poochta hai gateway jawab deta hai par doosre switch ka doosra guest kyun nahi.`},out:`lab@GST1> ping 10.60.0.1
84 bytes from 10.60.0.1 icmp_seq=1 ttl=64 time=0.500 ms
84 bytes from 10.60.0.1 icmp_seq=2 ttl=64 time=0.600 ms

lab@GST1> ping 10.60.0.12
host (10.60.0.12) not reachable
host (10.60.0.12) not reachable`,q:{en:`Is this a fault?`,hi:`Kya yeh fault hai?`},o:[{en:`Yes, the inter-switch link is down`,hi:`Haan, inter-switch link down hai`},{en:`No, both guests are in the isolated VLAN and reach only the promiscuous port`,hi:`Nahi, dono guests isolated VLAN mein hain aur sirf promiscuous port tak pahunchte hain`},{en:`Yes, the gateway has a filter`,hi:`Haan, gateway par filter hai`},{en:`No, guests are in a community`,hi:`Nahi, guests community mein hain`}],a:1,w:{en:`This is the intended behaviour: isolated hosts never talk to each other, even across switches, but reach the gateway on the promiscuous port.`,hi:`Yeh intended behaviour hai: isolated hosts kabhi aapas mein baat nahi karte, switches ke paar bhi nahi, par promiscuous port par gateway tak pahunchte hain.`}}];export{e as default};