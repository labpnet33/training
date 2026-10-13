var e={id:`build-order`,h:{en:`The build order: layer by layer with a check after each`,hi:`Build order: layer by layer, har layer ke baad check`},body:{en:`
<p>A good mason builds a house from the foundation up and checks the level after every course of bricks. If the first row is crooked, the tenth is a disaster, and by then you cannot see why. Networks work the same way. The capstone build order is <b>Layer 1 and 2 first, then Layer 3, then services, then security</b>, and after each layer you stop and prove it works before you stack the next one on top.</p>

<h3>Why this order, and not "all at once"</h3>
<p>Every layer depends on the one below it. OSPF cannot form over a port that is shut. NAT cannot work with no route. An ACL is meaningless if the traffic never arrives. If you configure everything and then test, a failing ping has twenty possible causes. If you test after each layer, a failure has <b>one</b> possible cause: the thing you just added. Security comes last on purpose: an ACL or port-security rule added too early makes a working build look broken, and you cannot tell your bug from your control.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Build order layers">
<rect x="40" y="170" width="560" height="42" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="320" y="196" text-anchor="middle" class="svg-ink" font-size="13">1. Layer 1 and 2: ports up, VLANs, trunks, STP, EtherChannel</text>
<rect x="80" y="120" width="480" height="42" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">2. Layer 3: IP addresses, gateways, static and OSPF routes</text>
<rect x="120" y="70" width="400" height="42" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="320" y="96" text-anchor="middle" class="svg-ink" font-size="13">3. Services: DHCP, NAT/PAT, HSRP, NTP, syslog</text>
<rect x="160" y="20" width="320" height="42" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">4. Security: ACLs, port security, SSH, hardening</text>
<text x="620" y="196" text-anchor="end" class="svg-muted" font-size="11">verify</text>
<text x="580" y="146" text-anchor="end" class="svg-muted" font-size="11">verify</text>
<text x="540" y="96" text-anchor="end" class="svg-muted" font-size="11">verify</text>
<text x="500" y="46" text-anchor="end" class="svg-muted" font-size="11">verify</text>
</svg><p class="cap">Each layer sits on the one below. You do not start the next layer until the "verify" for this one is green.</p></div>

<h3>Layer 1 and 2: the foundation</h3>
<p>On switches: create VLANs with names, assign access ports, configure trunks (with an allowed-VLAN list and a non-default native VLAN), set STP root where the design says, build EtherChannels. On routers: <code>no shutdown</code> the physical ports. Checks: interfaces up/up, VLANs contain the right ports, trunks show the right allowed list.</p>
<pre class="out">SW1# show vlan brief
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/0, Gi0/4, Gi0/5, Gi0/6
<span class="hl">10   USERS                            active    Gi0/2</span>
<span class="hl">20   VOICE                            active    Gi0/3</span>

SW1# show interfaces trunk
Port        Mode             Encapsulation Status        Native vlan
Gi0/1       on               802.1q        trunking      1

Port        Vlans allowed on trunk
Gi0/1       1-4094</pre>

<h3>Layer 3: addressing and routing</h3>
<p>Add subinterfaces or SVIs, IP addresses and masks from the plan, then routing: static or default routes first, dynamic protocols after. Checks: every interface up/up with the right address, routes appear in the table with the right code, and you can ping each directly connected neighbour and then the far side.</p>
<pre class="out">R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     unassigned      YES unset  up                    up
<span class="hl">GigabitEthernet0/0.10  10.10.10.1      YES manual up                    up</span>
<span class="hl">GigabitEthernet0/0.20  10.10.20.1      YES manual up                    up</span>
GigabitEthernet0/1     198.51.100.2    YES manual up                    up

R1# show ip route
Gateway of last resort is 198.51.100.1 to network 0.0.0.0

<span class="hl">S*       0.0.0.0/0 [1/0] via 198.51.100.1</span>
C        10.10.10.0/24 is directly connected, GigabitEthernet0/0.10
C        10.10.20.0/24 is directly connected, GigabitEthernet0/0.20
C        198.51.100.0/30 is directly connected, GigabitEthernet0/1</pre>

<h3>Services, then security</h3>
<p>Services are what make a network useful: DHCP so hosts get addresses, NAT/PAT so private hosts reach the Internet, HSRP so the gateway survives a failure, NTP and syslog so logs make sense. Verify each from the user's point of view (a PC gets an address, a ping to the Internet works, a translation appears). Only then add security: ACLs, port security, SSH-only access, banners. After each security rule, re-run a positive test (allowed traffic works) and a negative test (blocked traffic is blocked).</p>
<pre class="out">R1# show ip nat translations
Pro  Inside global         Inside local          Outside local         Outside global
<span class="hl">icmp 198.51.100.2:19499    10.10.10.11:19499     192.0.2.1:19499       192.0.2.1:19499</span>
Total number of translations: 1</pre>

<div class="eg"><p><b>Worked example.</b> HQ needs Sales on VLAN 10, Finance on VLAN 20, Internet through PAT. Pass 1: on SW1 create VLANs 10 and 20, put PC ports in them, make the router port a trunk. Verify: <code>show vlan brief</code> and <code>show interfaces trunk</code>. Pass 2: on R1 add Gi0/0.10 and Gi0/0.20 with <code>encapsulation dot1Q</code> and IPs, add the default route. Verify: PC1 pings 10.10.10.1, R1 pings the ISP. Pass 3: add the NAT inside/outside and the overload statement. Verify: a ping from PC1 to the ISP loopback creates a translation. Pass 4: add the ACL that blocks Finance from the Internet. Verify: PC2 is blocked, PC1 still works. Four short passes, each with a clean checkpoint.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Building services before the routing underneath is proven. Adding an ACL "while you are there". Skipping the verification because "it should work". Typing the same fix on two devices at once so you never learn which one mattered. Forgetting <code>copy running-config startup-config</code> at the end of a good layer, then losing the work in a reload.</p></div>

<div class="exam"><p><b>Exam traps.</b> In a configure-and-verify lab you are expected to build everything, but marks are lost for small omissions: a missing <code>no shutdown</code>, a missing <code>ip nat inside</code> on one interface, a trunk without the VLAN allowed. Work layer by layer inside the exam too, and use your layer checks as your safety net. Also check whether a device needs its configuration saved.</p></div>

<div class="scn"><h4>The ACL that arrived too early</h4><p>An engineer building a branch added the Finance ACL together with the routing. Nothing could ping anything. He spent an hour on OSPF before someone noticed the ACL was applied inbound on the wrong subinterface and blocked even the hello traffic to the gateway. When he removed the ACL, everything worked. He then rebuilt in layers, added the ACL last, and it took six minutes.</p><p><b>Lesson:</b> security last. If the network works before the control and breaks after, the control is the suspect.</p></div>

<div class="iv"><p class="q">"In what order do you configure a new site, and why?"</p><p>Strong answer: physical and VLAN layer first, then IP and routing, then services such as DHCP, NAT and HSRP, then security. I verify after each layer with specific show commands, so any failure points to the last thing I added. I save the configuration after each green checkpoint.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: L1/L2, then L3, then services, then security.</li>
<li>Verify after every layer so a failure has exactly one suspect.</li>
<li>Add security last and test both allowed and blocked traffic.</li>
<li>Save the configuration after each green checkpoint.</li>
<li>The same order works as your plan in the exam lab.</li>
</ul></div>
`,hi:`
<p>Achha mason ghar neev se upar ki taraf banata hai aur eent ki har row ke baad level check karta hai. Agar pehli row tedhi hai, to das vi row disaster hai, aur tab tak samajh nahi aata kyun. Networks bhi aise hi kaam karte hain. Capstone build order hai <b>pehle Layer 1 aur 2, phir Layer 3, phir services, phir security</b>, aur har layer ke baad ruk kar prove karte hain ki woh kaam kar rahi hai, tab agli layer upar chadhate hain.</p>

<h3>Yahi order kyun, "sab ek saath" kyun nahi</h3>
<p>Har layer neeche wali layer par depend karti hai. OSPF shut port par form nahi ho sakta. Route na ho to NAT kaam nahi karta. Traffic aaye hi nahi to ACL ka koi matlab nahi. Agar aap sab configure karke baad mein test karte ho, to fail hui ping ke bees possible causes hote hain. Agar har layer ke baad test karte ho, to failure ka <b>ek</b> hi possible cause hota hai: jo aapne abhi add kiya. Security jaanbujh kar aakhir mein aati hai: bahut jaldi lagayi ACL ya port-security rule working build ko bhi broken dikha deta hai, aur aap apna bug aur apna control alag nahi kar paate.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Build order layers">
<rect x="40" y="170" width="560" height="42" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="320" y="196" text-anchor="middle" class="svg-ink" font-size="13">1. Layer 1 aur 2: ports up, VLANs, trunks, STP, EtherChannel</text>
<rect x="80" y="120" width="480" height="42" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">2. Layer 3: IP addresses, gateways, static aur OSPF routes</text>
<rect x="120" y="70" width="400" height="42" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="320" y="96" text-anchor="middle" class="svg-ink" font-size="13">3. Services: DHCP, NAT/PAT, HSRP, NTP, syslog</text>
<rect x="160" y="20" width="320" height="42" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">4. Security: ACLs, port security, SSH, hardening</text>
<text x="620" y="196" text-anchor="end" class="svg-muted" font-size="11">verify</text>
<text x="580" y="146" text-anchor="end" class="svg-muted" font-size="11">verify</text>
<text x="540" y="96" text-anchor="end" class="svg-muted" font-size="11">verify</text>
<text x="500" y="46" text-anchor="end" class="svg-muted" font-size="11">verify</text>
</svg><p class="cap">Har layer neeche wali par tiki hai. Jab tak is layer ka "verify" green na ho, agli layer shuru mat karo.</p></div>

<h3>Layer 1 aur 2: foundation</h3>
<p>Switches par: names ke saath VLANs banao, access ports assign karo, trunks configure karo (allowed-VLAN list aur non-default native VLAN ke saath), design ke hisaab se STP root set karo, EtherChannels banao. Routers par: physical ports ko <code>no shutdown</code> karo. Checks: interfaces up/up, VLANs mein sahi ports, trunks par sahi allowed list.</p>
<pre class="out">SW1# show vlan brief
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/0, Gi0/4, Gi0/5, Gi0/6
<span class="hl">10   USERS                            active    Gi0/2</span>
<span class="hl">20   VOICE                            active    Gi0/3</span>

SW1# show interfaces trunk
Port        Mode             Encapsulation Status        Native vlan
Gi0/1       on               802.1q        trunking      1

Port        Vlans allowed on trunk
Gi0/1       1-4094</pre>

<h3>Layer 3: addressing aur routing</h3>
<p>Subinterfaces ya SVIs, plan ke IP addresses aur masks lagao, phir routing: pehle static ya default routes, dynamic protocols baad mein. Checks: har interface sahi address ke saath up/up, routes sahi code ke saath table mein, aur har directly connected neighbour ko ping, phir far side ko.</p>
<pre class="out">R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     unassigned      YES unset  up                    up
<span class="hl">GigabitEthernet0/0.10  10.10.10.1      YES manual up                    up</span>
<span class="hl">GigabitEthernet0/0.20  10.10.20.1      YES manual up                    up</span>
GigabitEthernet0/1     198.51.100.2    YES manual up                    up

R1# show ip route
Gateway of last resort is 198.51.100.1 to network 0.0.0.0

<span class="hl">S*       0.0.0.0/0 [1/0] via 198.51.100.1</span>
C        10.10.10.0/24 is directly connected, GigabitEthernet0/0.10
C        10.10.20.0/24 is directly connected, GigabitEthernet0/0.20
C        198.51.100.0/30 is directly connected, GigabitEthernet0/1</pre>

<h3>Services, phir security</h3>
<p>Services network ko useful banati hain: DHCP taaki hosts ko address mile, NAT/PAT taaki private hosts Internet tak jayein, HSRP taaki gateway failure survive kare, NTP aur syslog taaki logs ka matlab bane. Har service ko user ke point of view se verify karo (PC ko address mila, Internet ping chala, translation dikhi). Uske baad security lagao: ACLs, port security, SSH-only access, banners. Har security rule ke baad ek positive test (allowed traffic chalta hai) aur ek negative test (blocked traffic block hai) dobara chalao.</p>
<pre class="out">R1# show ip nat translations
Pro  Inside global         Inside local          Outside local         Outside global
<span class="hl">icmp 198.51.100.2:19499    10.10.10.11:19499     192.0.2.1:19499       192.0.2.1:19499</span>
Total number of translations: 1</pre>

<div class="eg"><p><b>Worked example.</b> HQ ko chahiye: Sales VLAN 10 par, Finance VLAN 20 par, PAT ke through Internet. Pass 1: SW1 par VLANs 10 aur 20 banao, PC ports unme daalo, router port ko trunk banao. Verify: <code>show vlan brief</code> aur <code>show interfaces trunk</code>. Pass 2: R1 par Gi0/0.10 aur Gi0/0.20 <code>encapsulation dot1Q</code> aur IPs ke saath lagao, default route add karo. Verify: PC1 se 10.10.10.1 ping, R1 se ISP ping. Pass 3: NAT inside/outside aur overload statement lagao. Verify: PC1 se ISP loopback ping karne par translation bane. Pass 4: Finance ko Internet se rokne wali ACL lagao. Verify: PC2 blocked hai, PC1 abhi bhi chalta hai. Chaar chhote passes, har ek clean checkpoint ke saath.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Neeche ki routing prove hone se pehle services banana. "Jab yahan aaye ho to" kehkar ACL add kar dena. "Chalna to chahiye" soch kar verification skip karna. Ek hi fix do devices par ek saath type karna taaki kabhi pata hi na chale kaunsa kaam aaya. Achhi layer ke aakhir mein <code>copy running-config startup-config</code> bhool jana, aur reload mein kaam kho dena.</p></div>

<div class="exam"><p><b>Exam traps.</b> Configure-and-verify lab mein aapse sab build karne ki umeed hoti hai, lekin chhoti omissions par marks kat'te hain: ek <code>no shutdown</code> missing, ek interface par <code>ip nat inside</code> missing, trunk par VLAN allowed nahi. Exam mein bhi layer by layer chalo, aur apne layer checks ko safety net banao. Yeh bhi dekho ki device ki configuration save karni hai ya nahi.</p></div>

<div class="scn"><h4>ACL jo bahut jaldi aa gayi</h4><p>Ek engineer ne branch banate waqt Finance ACL ko routing ke saath hi add kar diya. Koi kisi ko ping nahi kar pa raha tha. Usne ek ghanta OSPF mein lagaya, tab kisi ne dekha ki ACL galat subinterface par inbound lagi hai aur gateway ke hello traffic ko bhi block kar rahi hai. ACL hatate hi sab chal pada. Phir usne layers mein dobara build kiya, ACL aakhir mein lagayi, aur chhe minute mein ho gaya.</p><p><b>Lesson:</b> security aakhir mein. Agar control se pehle network chalta tha aur baad mein toota, to control suspect hai.</p></div>

<div class="iv"><p class="q">"Naye site ko kis order mein configure karte ho, aur kyun?"</p><p>Strong answer: pehle physical aur VLAN layer, phir IP aur routing, phir DHCP, NAT, HSRP jaisi services, phir security. Har layer ke baad specific show commands se verify karta hoon, taaki koi failure aakhri add ki hui cheez ki taraf ishara kare. Har green checkpoint par configuration save karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: L1/L2, phir L3, phir services, phir security.</li>
<li>Har layer ke baad verify karo taaki failure ka ek hi suspect ho.</li>
<li>Security aakhir mein lagao aur allowed aur blocked dono traffic test karo.</li>
<li>Har green checkpoint ke baad configuration save karo.</li>
<li>Yahi order exam lab mein bhi aapka plan hai.</li>
</ul></div>
`}};export{e as default};