var e=(e,t)=>({en:e,hi:t}),t=[{title:e(`The DMZ interface in detail`,`DMZ interface detail mein`),ticket:e(`After change CHG-2291 the DMZ server cannot ping its gateway. The admin insists the IP is committed. This is the detail view of the interface.`,`CHG-2291 ke baad DMZ server gateway ko ping nahi kar pa raha. Admin kehta hai IP committed hai. Yeh interface ka detail view hai.`),out:`admin@NK-PUNE-PA> show interface ethernet1/3
Name: ethernet1/3, ID: 16, 802.1q tag: 0
Operation mode: layer3
Virtual router N/A
Interface MTU 1500
Interface IP address: 10.0.2.1/24
Interface management profile: N/A
Zone: N/A, virtual system: vsys1`,q:e(`What is the complete fix?`,`Poora fix kya hai?`),o:[e(`Add the interface to a virtual router and a zone, and attach a profile with ping`,`Interface ko virtual router aur zone mein jodo, aur ping wala profile attach karo`),e(`Change the MTU to 9000`,`MTU 9000 karo`),e(`Add a static route to 10.0.2.0/24`,`10.0.2.0/24 ka static route jodo`),e(`Create a NAT rule for the DMZ`,`DMZ ke liye NAT rule banao`)],a:0,w:e(`Three bindings are missing: virtual router, zone and management profile. One commit fixes all.`,`Teen bindings missing hain: virtual router, zone aur management profile. Ek commit sab fix karta hai.`)},{title:e(`A profile name with a typo`,`Typo wala profile naam`),ticket:e(`An engineer attached a management profile to the LAN interface and committed.`,`Ek engineer ne LAN interface par management profile attach karke commit kiya.`),out:`admin@PA1# set network profiles interface-management-profile lan ping yes
admin@PA1# set network interface ethernet ethernet1/2 layer3 interface-management-profile lanx
admin@PA1# commit

Validation Error:
 network -> interface -> ethernet -> ethernet1/2 -> layer3 interface-management-profile 'lanx' is not a valid reference
Commit failed`,q:e(`What should he do?`,`Use kya karna chahiye?`),o:[e(`Reboot and commit again`,`Reboot karke dobara commit`),e(`Create a security rule for lanx`,`lanx ke liye security rule banao`),e(`Attach the profile name lan, then commit`,`Profile naam lan attach karo, phir commit`),e(`Run revert config on the running configuration`,`Running configuration par revert config chalao`)],a:2,w:e(`The profile is named lan. Correct the reference and commit. The failed commit applied nothing.`,`Profile ka naam lan hai. Reference theek karo aur commit karo. Fail commit ne kuch apply nahi kiya.`)},{title:e(`Pinging the internet from the firewall`,`Firewall se internet ping`),ticket:e(`Interfaces, zones and the management profile are done. The data-plane ping to 8.8.8.8 loses everything.`,`Interfaces, zones aur management profile ho gaye. 8.8.8.8 ka data-plane ping poora loss ho raha hai.`),out:`admin@NK-PUNE-PA> show routing route
VIRTUAL ROUTER: default (id 1)
destination        nexthop        metric flags  interface
10.0.1.0/24        10.0.1.1       0      A C    ethernet1/2
10.0.1.1/32        0.0.0.0        0      A H
203.0.113.0/30     203.0.113.2    0      A C    ethernet1/1
203.0.113.2/32     0.0.0.0        0      A H
total routes shown: 4

admin@NK-PUNE-PA> ping source 203.0.113.2 host 8.8.8.8
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
5 packets transmitted, 0 received, 100% packet loss, time 4003ms`,q:e(`What is missing?`,`Kya missing hai?`),o:[e(`A security rule`,`Security rule`),e(`A NAT rule`,`NAT rule`),e(`A zone for the ISP`,`ISP ke liye zone`),e(`A default route to 203.0.113.1`,`203.0.113.1 ki taraf default route`)],a:3,w:e(`Only connected routes exist. Add 0.0.0.0/0 via 203.0.113.1 on ethernet1/1 and commit.`,`Sirf connected routes hain. ethernet1/1 par 203.0.113.1 ke through 0.0.0.0/0 jodo aur commit karo.`)},{title:e(`Through works, to the box does not`,`Through chalta hai, box tak nahi`),ticket:e(`After adding the zone dmz to ethernet1/3, PC1 reaches the web server, but the server cannot ping its gateway.`,`ethernet1/3 mein zone dmz jodne ke baad PC1 web server tak pahunchta hai, lekin server gateway ko ping nahi kar pa raha.`),out:`PC1> ping 10.0.2.10
84 bytes from 10.0.2.10 icmp_seq=1 ttl=63 time=0.500 ms

WEB> ping 10.0.2.1
10.0.2.1 icmp_seq=1 timeout
10.0.2.1 icmp_seq=2 timeout`,q:e(`Which item explains the failure?`,`Kaunsi cheez failure samjhati hai?`),o:[e(`A missing return route`,`Missing return route`),e(`A missing interface management profile with ping`,`Ping wala interface management profile missing`),e(`A wrong zone type`,`Galat zone type`),e(`A full session table`,`Full session table`)],a:1,w:e(`Through-traffic works because of the zone and rule. Traffic to the firewall address needs a management profile on the interface.`,`Zone aur rule ki wajah se through-traffic chalta hai. Firewall address ke traffic ko interface par management profile chahiye.`)},{title:e(`A zone command in the wrong place`,`Galat jagah zone command`),ticket:e(`An engineer says the zone command was accepted but the interface has no zone. Read his session.`,`Engineer kehta hai zone command accept hua lekin interface ka zone nahi hai. Uska session padho.`),out:`admin@PA1# edit network interface ethernet ethernet1/2
[edit network interface ethernet ethernet1/2]
admin@PA1# set zone trust network layer3 ethernet1/2
 Invalid syntax.

[edit network interface ethernet ethernet1/2]`,q:e(`What went wrong?`,`Kya galat hua?`),o:[e(`Zones cannot contain ethernet interfaces`,`Zones mein ethernet interfaces nahi ho sakte`),e(`He is inside an edit branch, so the command is relative; he should use top first`,`Woh edit branch ke andar hai, isliye command relative hai; pehle top karna chahiye`),e(`He must commit before every set command`,`Har set command se pehle commit karna hoga`),e(`The trust zone is reserved`,`trust zone reserved hai`)],a:1,w:e(`The [edit ...] line shows the current branch. Use top (or a full path) before changing a different branch.`,`[edit ...] line current branch dikhati hai. Doosri branch badalne se pehle top (ya full path) use karo.`)},{title:e(`Allowed but not translated`,`Allowed lekin translate nahi`),ticket:e(`A security rule allows trust to untrust. PC1 still cannot reach 8.8.8.8 and the NAT policy output is empty. Read the session.`,`Security rule trust se untrust allow karta hai. PC1 phir bhi 8.8.8.8 tak nahi pahunch pa raha aur NAT policy output khali hai. Session padho.`),out:`admin@NK-PUNE-PA> show session all
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
Vsys                                           Dst[Dport]/Zone (translated IP[Port])
9361         ping           ACTIVE  FLOW       10.0.1.10[19499]/trust/1  (10.0.1.10[19499])
vsys1                                          8.8.8.8[8]/untrust  (8.8.8.8[8])

admin@NK-PUNE-PA> show running nat-policy
`,q:e(`What is the missing piece?`,`Missing piece kya hai?`),o:[e(`A source NAT rule translating trust to the interface address`,`Trust ko interface address mein translate karne wala source NAT rule`),e(`A deny rule`,`Deny rule`),e(`A second virtual router`,`Doosra virtual router`),e(`A higher rule position`,`Upar ka rule position`)],a:0,w:e(`The session is allowed but the source stays 10.0.1.10, which the internet cannot route back to. A source NAT rule is needed.`,`Session allowed hai lekin source 10.0.1.10 hi rehta hai, jise internet wapas route nahi kar sakta. Source NAT rule chahiye.`)},{title:e(`Which column shows the virtual router?`,`Virtual router kaunse column mein dikhta hai?`),ticket:e(`A trainee is asked which forwarding entry ethernet1/2 shows after the first build.`,`Trainee se poocha gaya ki pehle build ke baad ethernet1/2 kaunsi forwarding entry dikhata hai.`),out:`admin@NK-PUNE-PA> show interface all
name                id    vsys zone             forwarding               tag    address
------------------- ----- ---- ---------------- ------------------------ ------ ------------------
ethernet1/2         16    1    trust            vr:default               0      10.0.1.1/24
ethernet1/1         17    1    untrust          vr:default               0      203.0.113.2/30`,q:e(`What does the forwarding column show for ethernet1/2?`,`ethernet1/2 ke liye forwarding column kya dikhata hai?`),o:[e(`trust`,`trust`),e(`10.0.1.1/24`,`10.0.1.1/24`),e(`vr:default`,`vr:default`),e(`N/A`,`N/A`)],a:2,w:e(`The forwarding column names the virtual router the interface belongs to: vr:default.`,`Forwarding column us virtual router ka naam dikhata hai jisse interface judta hai: vr:default.`)}];export{t as default};