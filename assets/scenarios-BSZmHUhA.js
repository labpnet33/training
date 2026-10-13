var e=[{title:{en:`Zone created, VLAN-to-VLAN broke`,hi:`Zone bana, VLAN-to-VLAN toota`},ticket:{en:`After LAN-ZONE was created with VLAN10 and VLAN20, Staff cannot reach Servers. Internet access still works. Read the evidence.`,hi:`VLAN10 aur VLAN20 ke saath LAN-ZONE banne ke baad Staff Servers tak nahi pahunchta. Internet access abhi bhi chalta hai. Evidence padho.`},out:`PC1> ping 10.10.20.10
10.10.20.10 icmp_seq=1 timeout
10.10.20.10 icmp_seq=2 timeout

NK-PUNE-FGT # diagnose sys session list
total session 0
NK-PUNE-FGT # diagnose firewall iprope lookup 10.10.10.10 0 10.10.20.10 0 icmp VLAN10
... matches policy id: 0
NK-PUNE-FGT # get system zone
== [ LAN-ZONE ]
name: LAN-ZONE   description:    intrazone: deny`,q:{en:`What is the cause?`,hi:`Cause kya hai?`},o:[{en:`The WAN route is missing`,hi:`WAN route missing hai`},{en:`VLAN20 has no IP address`,hi:`VLAN20 par IP address nahi`},{en:`The zone has intrazone deny, which blocks traffic between its members`,hi:`Zone mein intrazone deny hai, jo members ke beech traffic block karta hai`},{en:`The trunk is down`,hi:`Trunk down hai`}],a:2,w:{en:`No session and policy id 0 mean nothing permits the flow, and the zone shows intrazone deny. Set intrazone allow if the VLANs are equally trusted, or separate them with an explicit policy.`,hi:`Session nahi aur policy id 0 matlab koi cheez flow ko permit nahi karti, aur zone intrazone deny dikhata hai. VLANs barabar trusted hon to intrazone allow karo, ya explicit policy se alag karo.`}},{title:{en:`The trunk that lost a VLAN`,hi:`Trunk jisne VLAN kho diya`},ticket:{en:`The Servers VLAN cannot reach its gateway. The firewall shows VLAN20 up with 10.10.20.1. Read the switch output.`,hi:`Servers VLAN apne gateway tak nahi pahunchta. Firewall VLAN20 ko 10.10.20.1 ke saath up dikhata hai. Switch output padho.`},out:`SW1# show interfaces trunk
Port        Mode             Encapsulation Status        Native vlan
Gi0/1       on               802.1q        trunking      1
Port        Vlans allowed on trunk
Gi0/1       10
Port        Vlans allowed and active in management domain
Gi0/1       10

SRV1> ping 10.10.20.1
host (10.10.20.1) not reachable
host (10.10.20.1) not reachable`,q:{en:`What should be fixed?`,hi:`Kya fix karna chahiye?`},o:[{en:`The switch trunk, which allows only VLAN 10`,hi:`Switch trunk, jo sirf VLAN 10 allow karta hai`},{en:`The intrazone value`,hi:`Intrazone value`},{en:`The zone name`,hi:`Zone name`},{en:`The firewall policy for VLAN20`,hi:`VLAN20 ki firewall policy`}],a:0,w:{en:`VLAN 20 never reaches the firewall because the trunk allows only VLAN 10. Add VLAN 20 to the allowed list; the firewall needs no change.`,hi:`VLAN 20 firewall tak kabhi nahi pahunchta kyunki trunk sirf VLAN 10 allow karta hai. VLAN 20 ko allowed list mein jodo; firewall mein koi change nahi chahiye.`}},{title:{en:`Duplicate VLAN ID`,hi:`Duplicate VLAN ID`},ticket:{en:`An engineer tries to give VLAN10 the VLAN ID 20 while VLAN20 exists on the same parent port. Read the reply.`,hi:`Engineer VLAN10 ko VLAN ID 20 dena chahta hai jabki VLAN20 usi parent port par hai. Reply padho.`},out:`NK-PUNE-FGT (VLAN10) # set vlanid 20
NK-PUNE-FGT (VLAN10) # end
VLAN ID 20 is already used by VLAN20 on port2
Command fail. Return code -15`,q:{en:`What does the error mean?`,hi:`Error ka kya matlab hai?`},o:[{en:`VLAN IDs above 10 are reserved`,hi:`10 se upar ke VLAN IDs reserved hain`},{en:`The switch rejected the VLAN`,hi:`Switch ne VLAN reject kiya`},{en:`The zone is full`,hi:`Zone bhara hua hai`},{en:`Two VLAN interfaces on one parent cannot use the same VLAN ID`,hi:`Ek parent par do VLAN interfaces same VLAN ID use nahi kar sakte`}],a:3,w:{en:`A VLAN ID must be unique per parent interface. Choose the correct, unused ID that matches the switch.`,hi:`VLAN ID har parent interface par unique hona chahiye. Switch se match karta sahi, unused ID chuno.`}},{title:{en:`VLAN interface without a parent`,hi:`Parent ke bina VLAN interface`},ticket:{en:`A new VLAN30 interface cannot be saved. Read the reply.`,hi:`Naya VLAN30 interface save nahi hota. Reply padho.`},out:`NK-PUNE-FGT # config system interface
NK-PUNE-FGT (interface) # edit VLAN30
new entry 'VLAN30' added
NK-PUNE-FGT (VLAN30) # set vlanid 30
NK-PUNE-FGT (VLAN30) # next
Attribute 'interface' MUST be set.
Command fail. Return code 1`,q:{en:`What is missing?`,hi:`Kya missing hai?`},o:[{en:`A zone`,hi:`Zone`},{en:`The parent interface, for example set interface port2`,hi:`Parent interface, jaise set interface port2`},{en:`A default route`,hi:`Default route`},{en:`A firewall policy`,hi:`Firewall policy`}],a:1,w:{en:`A VLAN interface must say which physical parent port carries it. Add set interface port2, then save.`,hi:`VLAN interface ko batana padta hai ki kaunsa physical parent port use carry karta hai. set interface port2 jodo, phir save karo.`}},{title:{en:`A member interface that policies cannot see`,hi:`Member interface jo policies ko nahi dikhta`},ticket:{en:`A script adds a policy to VLAN10 and fails, although VLAN10 exists. Read the reply.`,hi:`Script VLAN10 ke liye policy jodti hai aur fail hoti hai, jabki VLAN10 exist karta hai. Reply padho.`},out:`NK-PUNE-FGT # config firewall policy
NK-PUNE-FGT (policy) # edit 3
NK-PUNE-FGT (3) # set srcintf port1
NK-PUNE-FGT (3) # set dstintf VLAN10
entry not found in datasource
value parse error before 'VLAN10'
Command fail. Return code -3`,q:{en:`What should the script use instead?`,hi:`Script ko iske bajay kya use karna chahiye?`},o:[{en:`The VLAN ID 10`,hi:`VLAN ID 10`},{en:`The zone name that contains VLAN10`,hi:`Us zone ka naam jisme VLAN10 hai`},{en:`The alias Staff`,hi:`Alias Staff`},{en:`The parent port2 as srcintf`,hi:`srcintf ke roop mein parent port2`}],a:1,w:{en:`VLAN10 is a member of LAN-ZONE, so policies reference the zone. port1 was accepted because it is not in a zone.`,hi:`VLAN10 LAN-ZONE ka member hai, isliye policies zone refer karti hain. port1 accept hua kyunki woh kisi zone mein nahi hai.`}},{title:{en:`Allowed, yet policy_id is 0`,hi:`Allowed, phir bhi policy_id 0`},ticket:{en:`After intrazone allow, the ping works, but the session shows policy_id=0. A trainee asks if something is wrong.`,hi:`Intrazone allow ke baad ping chalti hai, par session policy_id=0 dikhata hai. Ek trainee poochta hai kuch galat hai kya.`},out:`PC1> ping 10.10.20.10
84 bytes from 10.10.20.10 icmp_seq=1 ttl=63 time=0.500 ms

NK-PUNE-FGT # diagnose sys session list
hook=pre dir=org act=noop 10.10.10.10:19499->10.10.20.10:8(0.0.0.0:0)
misc=0 policy_id=0 pol_uuid_idx=14 auth_info=0 chk_client_info=0 vd=0
total session 1`,q:{en:`What is the right answer?`,hi:`Sahi jawab kya hai?`},o:[{en:`Traffic is dropped`,hi:`Traffic drop ho raha hai`},{en:`NAT is misconfigured`,hi:`NAT galat configure hai`},{en:`A policy with id 0 exists`,hi:`Id 0 wali policy exist karti hai`},{en:`The traffic was allowed by the zone intrazone setting, not by a numbered policy`,hi:`Traffic zone ki intrazone setting se allowed hua, numbered policy se nahi`}],a:3,w:{en:`A session exists, so the flow was permitted. With intrazone allow there is no numbered policy; act=noop shows no NAT between internal VLANs.`,hi:`Session maujood hai, isliye flow permit hua. Intrazone allow ke saath numbered policy nahi hoti; act=noop internal VLANs ke beech NAT na hona dikhata hai.`}},{title:{en:`Explicit policy between the VLANs`,hi:`VLANs ke beech explicit policy`},ticket:{en:`Two lookups for the same packet, before and after a change. What changed?`,hi:`Ek hi packet ke do lookups, change se pehle aur baad. Kya badla?`},out:`NK-PUNE-FGT # diagnose firewall iprope lookup 10.10.10.10 0 10.10.20.10 0 icmp VLAN10
... matches policy id: 0

(a policy VLAN10 to VLAN20, action accept, was added)

NK-PUNE-FGT # diagnose firewall iprope lookup 10.10.10.10 0 10.10.20.10 0 icmp VLAN10
... matches policy id: 2`,q:{en:`What does the second result prove?`,hi:`Doosra result kya saabit karta hai?`},o:[{en:`Policy 2 now permits this flow instead of the implicit deny`,hi:`Policy 2 ab implicit deny ki jagah is flow ko permit karti hai`},{en:`The zone was deleted`,hi:`Zone delete ho gaya`},{en:`The trunk changed`,hi:`Trunk badla`},{en:`The packet was NATed`,hi:`Packet NAT hua`}],a:0,w:{en:`Policy id 0 before means the implicit deny; policy id 2 after means the new accept policy matches. It is the quickest way to test a rule without sending traffic.`,hi:`Pehle policy id 0 matlab implicit deny; baad mein policy id 2 matlab nayi accept policy match karti hai. Traffic bheje bina rule test karne ka sabse tez tareeka.`}}];export{e as default};