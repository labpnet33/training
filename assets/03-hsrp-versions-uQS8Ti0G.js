var e={id:`hsrp-versions`,h:{en:`HSRP version 1 and version 2: groups, multicast and MAC formats`,hi:`HSRP version 1 aur version 2: groups, multicast aur MAC formats`},body:{en:`
<p>Two generations of the same walkie-talkie can look identical but use different channels. Radio operators with the old model and the new model standing side by side will never hear each other, even though both are switched on and both say "over". HSRP version 1 and version 2 are like that: same idea, same commands, different channel. Mixing them on one LAN is one of the classic failures you will troubleshoot later.</p>

<h3>HSRP in one breath</h3>
<p><b>HSRP</b> (Hot Standby Router Protocol) is Cisco's FHRP. Routers in the same <b>group</b> exchange small UDP messages on port <b>1985</b>. There are three message types you should know:</p>
<ul>
<li><b>Hello</b>: "I am here, this is my priority and my state." Sent every hello interval (3 s by default) by the Active and Standby routers, and by routers in the Speak state.</li>
<li><b>Coup</b>: sent by a router that wants to take over the Active role because it has a higher priority and preempt is on.</li>
<li><b>Resign</b>: sent by the Active router when it is about to stop, for example when its interface is shut or a better router performs a coup. The Standby takes over at once instead of waiting for the hold time.</li>
</ul>

<h3>Version 1 versus version 2</h3>
<table class="cmp"><tr><th>Feature</th><th>HSRP version 1</th><th>HSRP version 2</th></tr>
<tr><td>Default on IOS</td><td>Yes</td><td>No, enable with <code>standby version 2</code></td></tr>
<tr><td>Group numbers</td><td>0 to 255</td><td>0 to 4095</td></tr>
<tr><td>Hello destination</td><td>224.0.0.2 (all routers)</td><td>224.0.0.102 (HSRP-specific)</td></tr>
<tr><td>Transport</td><td>UDP 1985</td><td>UDP 1985 (IPv4), UDP 2029 for IPv6</td></tr>
<tr><td>Virtual MAC</td><td>0000.0c07.acXX (XX = group, 2 hex digits)</td><td>0000.0c9f.fXXX (XXX = group, 3 hex digits)</td></tr>
<tr><td>IPv6 support</td><td>No</td><td>Yes (FF02::66, VMAC 0005.73a0.0XXX)</td></tr>
<tr><td>Packet format</td><td>Fixed fields</td><td>TLV format with a 6-byte sender identifier</td></tr></table>

<p>Why did Cisco create version 2? Three reasons. First, <b>224.0.0.2</b> is the "all routers" group, so every router on the segment has to look at HSRP v1 hellos, even routers that do not run HSRP. A dedicated address, <b>224.0.0.102</b>, avoids that. Second, large campuses have more than 256 VLANs, and the common practice is <b>group number = VLAN number</b>; version 1 simply cannot number group 300. Third, IPv6 gateways need an FHRP too, and only version 2 carries IPv6.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="HSRP v1 and v2 do not hear each other">
<rect x="30" y="30" width="200" height="60" rx="8" fill="#bae6fd"/><text x="130" y="55" text-anchor="middle" class="svg-ink" font-size="14">R1 HSRP v1</text><text x="130" y="75" text-anchor="middle" class="svg-muted" font-size="12">hellos to 224.0.0.2</text>
<rect x="410" y="30" width="200" height="60" rx="8" fill="#ddd6fe"/><text x="510" y="55" text-anchor="middle" class="svg-ink" font-size="14">R2 HSRP v2</text><text x="510" y="75" text-anchor="middle" class="svg-muted" font-size="12">hellos to 224.0.0.102</text>
<line x1="230" y1="60" x2="410" y2="60" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/>
<text x="320" y="50" text-anchor="middle" class="svg-accent" font-size="13">no common hellos</text>
<rect x="30" y="140" width="200" height="60" rx="8" fill="#fed7aa"/><text x="130" y="165" text-anchor="middle" class="svg-ink" font-size="13">State: Active</text><text x="130" y="185" text-anchor="middle" class="svg-muted" font-size="12">VMAC 0000.0c07.ac0a</text>
<rect x="410" y="140" width="200" height="60" rx="8" fill="#fed7aa"/><text x="510" y="165" text-anchor="middle" class="svg-ink" font-size="13">State: Active</text><text x="510" y="185" text-anchor="middle" class="svg-muted" font-size="12">VMAC 0000.0c9f.f00a</text>
<text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">two Active routers</text>
</svg><p class="cap">A version mismatch splits one group into two lonely routers. Both go Active for the same VIP.</p></div>

<h3>Building the virtual MAC</h3>
<div class="eg"><p><b>Worked example.</b> Convert the group number to hexadecimal and drop it into the template.</p>
<ul>
<li>Group 10, version 1: 10 = 0x0a, VMAC <code>0000.0c07.ac0a</code>. This is the address you type in the first lab.</li>
<li>Group 10, version 2: 10 = 0x00a, VMAC <code>0000.0c9f.f00a</code>.</li>
<li>Group 300, version 2: 300 = 0x12c, VMAC <code>0000.0c9f.f12c</code>. Version 1 rejects group 300 because the range stops at 255.</li>
<li>Group 255, version 1: 0xff, VMAC <code>0000.0c07.acff</code>.</li>
</ul></div>

<h3>Configuring the version</h3>
<pre class="code"><span class="c">! version is set per interface, on every router in the group</span>
R1(config)# interface GigabitEthernet0/0
R1(config-if)# standby version 2
R1(config-if)# standby 10 ip 192.168.10.1
<span class="c">! optional: MD5 authentication, the key must match on all members</span>
R1(config-if)# standby 10 authentication md5 key-string NK-Hsrp-Key</pre>
<p>If you omit the group number (<code>standby ip 192.168.10.1</code>), IOS uses <b>group 0</b>. Changing the version on a working interface restarts its HSRP groups, so do it in a change window and on both routers.</p>

<pre class="out">R1# show standby GigabitEthernet0/0
<span class="hl">GigabitEthernet0/0 - Group 10 (version 2)</span>
  State is Active
    2 state changes, last state change 00:01:12
  Virtual IP address is 192.168.10.1
  Active virtual MAC address is 0000.0c9f.f00a (MAC In Use)
<span class="hl">    Local virtual MAC address is 0000.0c9f.f00a (v2 default)</span>
  Hello time 3 sec, hold time 10 sec</pre>

<div class="warn"><p><b>Common mistake.</b> Upgrading one router to <code>standby version 2</code> "to test it" in production. The two routers stop hearing each other, both become Active, and hosts see duplicate-address warnings and flapping ARP. Change the version on both peers in the same window. The same symptom appears with an <b>authentication mismatch</b>: a router ignores hellos whose key does not match.</p></div>

<div class="exam"><p><b>Exam trap.</b> Learn the three MAC prefixes cold: HSRP v1 <code>0000.0c07.acXX</code>, HSRP v2 <code>0000.0c9f.fXXX</code>, VRRP <code>0000.5e00.01XX</code>. Also: HSRP v1 hellos go to <b>224.0.0.2</b>, v2 to <b>224.0.0.102</b>, both on <b>UDP 1985</b>. VRRP is not UDP at all (IP protocol 112).</p></div>

<div class="scn"><h4>Group 312 that would not save</h4><p>A hospital network engineer in Kochi tried to add HSRP for the new VLAN 312 with <code>standby 312 ip 10.31.2.1</code>. IOS rejected the group number. The existing groups were all version 1. She scheduled a short window, added <code>standby version 2</code> on both distribution routers for every VLAN interface, and then created group 312. The only visible effect was a few seconds of re-election per VLAN inside the window.</p><p><b>Lesson:</b> if your group number follows the VLAN number, plan for version 2 before you pass VLAN 255.</p></div>

<div class="iv"><p class="q">"What are the differences between HSRP version 1 and version 2?"</p><p>Strong answer: version 2 expands groups from 0-255 to 0-4095, uses the dedicated multicast 224.0.0.102 instead of the all-routers 224.0.0.2, changes the virtual MAC range from 0000.0c07.acXX to 0000.0c9f.fXXX, adds IPv6 support, and uses a TLV packet format. The two versions do not interoperate, so both peers must match. Bonus: mention the UDP port 1985 and that v1 is the default.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HSRP uses UDP 1985 with Hello, Coup and Resign messages.</li>
<li>v1: groups 0-255, 224.0.0.2, VMAC 0000.0c07.acXX; it is the IOS default.</li>
<li>v2: groups 0-4095, 224.0.0.102, VMAC 0000.0c9f.fXXX, IPv6 capable.</li>
<li>v1 and v2 do not talk to each other; a mismatch gives two Active routers.</li>
<li>Omitting the group number means group 0.</li>
</ul></div>
`,hi:`
<p>Ek hi walkie-talkie ki do generations dikhne mein same ho sakti hain lekin alag channels use karti hain. Purane model aur naye model wale radio operators paas-paas khade hon, phir bhi ek dusre ko kabhi nahi sunenge, chahe dono on hon aur dono "over" bolein. HSRP version 1 aur version 2 aise hi hain: same idea, same commands, alag channel. Ek LAN par dono ko mix karna un classic failures mein se ek hai jo aap baad mein troubleshoot karoge.</p>

<h3>HSRP ek saans mein</h3>
<p><b>HSRP</b> (Hot Standby Router Protocol) Cisco ka FHRP hai. Same <b>group</b> ke routers port <b>1985</b> par chhote UDP messages exchange karte hain. Teen message types aapko pata hone chahiye:</p>
<ul>
<li><b>Hello</b>: "Main yahan hoon, yeh meri priority aur meri state hai." Active aur Standby routers, aur Speak state wale routers, har hello interval (default 3 s) par bhejte hain.</li>
<li><b>Coup</b>: woh router bhejta hai jo Active role lena chahta hai kyunki uski priority zyada hai aur preempt on hai.</li>
<li><b>Resign</b>: Active router bhejta hai jab woh rukne wala hota hai, jaise jab uska interface shut ho ya koi better router coup kare. Standby hold time ka wait kiye bina turant kaam sambhal leta hai.</li>
</ul>

<h3>Version 1 banaam version 2</h3>
<table class="cmp"><tr><th>Feature</th><th>HSRP version 1</th><th>HSRP version 2</th></tr>
<tr><td>IOS par default</td><td>Haan</td><td>Nahi, <code>standby version 2</code> se enable karo</td></tr>
<tr><td>Group numbers</td><td>0 se 255</td><td>0 se 4095</td></tr>
<tr><td>Hello destination</td><td>224.0.0.2 (all routers)</td><td>224.0.0.102 (HSRP-specific)</td></tr>
<tr><td>Transport</td><td>UDP 1985</td><td>UDP 1985 (IPv4), IPv6 ke liye UDP 2029</td></tr>
<tr><td>Virtual MAC</td><td>0000.0c07.acXX (XX = group, 2 hex digits)</td><td>0000.0c9f.fXXX (XXX = group, 3 hex digits)</td></tr>
<tr><td>IPv6 support</td><td>Nahi</td><td>Haan (FF02::66, VMAC 0005.73a0.0XXX)</td></tr>
<tr><td>Packet format</td><td>Fixed fields</td><td>TLV format, 6-byte sender identifier ke saath</td></tr></table>

<p>Cisco ne version 2 kyun banaya? Teen wajahein. Pehli, <b>224.0.0.2</b> "all routers" group hai, isliye segment ke har router ko HSRP v1 hellos dekhne padte hain, un routers ko bhi jo HSRP nahi chalate. Ek dedicated address, <b>224.0.0.102</b>, isse bachata hai. Doosri, bade campuses mein 256 se zyada VLANs hote hain, aur common practice hai <b>group number = VLAN number</b>; version 1 group 300 ko number hi nahi de sakta. Teesri, IPv6 gateways ko bhi FHRP chahiye, aur sirf version 2 IPv6 carry karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="HSRP v1 aur v2 ek dusre ko nahi sunte">
<rect x="30" y="30" width="200" height="60" rx="8" fill="#bae6fd"/><text x="130" y="55" text-anchor="middle" class="svg-ink" font-size="14">R1 HSRP v1</text><text x="130" y="75" text-anchor="middle" class="svg-muted" font-size="12">hellos 224.0.0.2 par</text>
<rect x="410" y="30" width="200" height="60" rx="8" fill="#ddd6fe"/><text x="510" y="55" text-anchor="middle" class="svg-ink" font-size="14">R2 HSRP v2</text><text x="510" y="75" text-anchor="middle" class="svg-muted" font-size="12">hellos 224.0.0.102 par</text>
<line x1="230" y1="60" x2="410" y2="60" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/>
<text x="320" y="50" text-anchor="middle" class="svg-accent" font-size="13">koi common hello nahi</text>
<rect x="30" y="140" width="200" height="60" rx="8" fill="#fed7aa"/><text x="130" y="165" text-anchor="middle" class="svg-ink" font-size="13">State: Active</text><text x="130" y="185" text-anchor="middle" class="svg-muted" font-size="12">VMAC 0000.0c07.ac0a</text>
<rect x="410" y="140" width="200" height="60" rx="8" fill="#fed7aa"/><text x="510" y="165" text-anchor="middle" class="svg-ink" font-size="13">State: Active</text><text x="510" y="185" text-anchor="middle" class="svg-muted" font-size="12">VMAC 0000.0c9f.f00a</text>
<text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">do Active routers</text>
</svg><p class="cap">Version mismatch ek group ko do akele routers mein tod deta hai. Dono same VIP ke liye Active ho jaate hain.</p></div>

<h3>Virtual MAC banana</h3>
<div class="eg"><p><b>Worked example.</b> Group number ko hexadecimal mein badlo aur template mein daal do.</p>
<ul>
<li>Group 10, version 1: 10 = 0x0a, VMAC <code>0000.0c07.ac0a</code>. Yahi address aap pehle lab mein type karte ho.</li>
<li>Group 10, version 2: 10 = 0x00a, VMAC <code>0000.0c9f.f00a</code>.</li>
<li>Group 300, version 2: 300 = 0x12c, VMAC <code>0000.0c9f.f12c</code>. Version 1 group 300 reject karta hai kyunki range 255 par ruk jaati hai.</li>
<li>Group 255, version 1: 0xff, VMAC <code>0000.0c07.acff</code>.</li>
</ul></div>

<h3>Version configure karna</h3>
<pre class="code"><span class="c">! version per interface set hota hai, group ke har router par</span>
R1(config)# interface GigabitEthernet0/0
R1(config-if)# standby version 2
R1(config-if)# standby 10 ip 192.168.10.1
<span class="c">! optional: MD5 authentication, key saare members par match honi chahiye</span>
R1(config-if)# standby 10 authentication md5 key-string NK-Hsrp-Key</pre>
<p>Agar aap group number chhod do (<code>standby ip 192.168.10.1</code>), to IOS <b>group 0</b> use karta hai. Chalte interface par version badalne se uske HSRP groups restart hote hain, isliye yeh change window mein aur dono routers par karo.</p>

<pre class="out">R1# show standby GigabitEthernet0/0
<span class="hl">GigabitEthernet0/0 - Group 10 (version 2)</span>
  State is Active
    2 state changes, last state change 00:01:12
  Virtual IP address is 192.168.10.1
  Active virtual MAC address is 0000.0c9f.f00a (MAC In Use)
<span class="hl">    Local virtual MAC address is 0000.0c9f.f00a (v2 default)</span>
  Hello time 3 sec, hold time 10 sec</pre>

<div class="warn"><p><b>Common galti.</b> Production mein ek router ko "test karne ke liye" <code>standby version 2</code> par upgrade karna. Dono routers ek dusre ko sunna band kar dete hain, dono Active ban jaate hain, aur hosts ko duplicate-address warnings aur flap karta ARP dikhta hai. Version dono peers par same window mein badlo. Yahi symptom <b>authentication mismatch</b> par bhi aata hai: router un hellos ko ignore karta hai jinki key match nahi karti.</p></div>

<div class="exam"><p><b>Exam trap.</b> Teeno MAC prefixes pakke yaad karo: HSRP v1 <code>0000.0c07.acXX</code>, HSRP v2 <code>0000.0c9f.fXXX</code>, VRRP <code>0000.5e00.01XX</code>. Aur: HSRP v1 hellos <b>224.0.0.2</b> par jaate hain, v2 <b>224.0.0.102</b> par, dono <b>UDP 1985</b> par. VRRP UDP hai hi nahi (IP protocol 112).</p></div>

<div class="scn"><h4>Group 312 jo save hi nahi hua</h4><p>Kochi ke ek hospital network ki engineer ne naye VLAN 312 ke liye <code>standby 312 ip 10.31.2.1</code> se HSRP add karne ki koshish ki. IOS ne group number reject kar diya. Existing saare groups version 1 the. Usne ek chhota window schedule kiya, dono distribution routers par har VLAN interface ke liye <code>standby version 2</code> add kiya, aur phir group 312 banaya. Window ke andar har VLAN par kuch seconds ka re-election hi ek dikhne wala asar tha.</p><p><b>Seekh:</b> agar aapka group number VLAN number follow karta hai, to VLAN 255 paar karne se pehle version 2 plan karo.</p></div>

<div class="iv"><p class="q">"HSRP version 1 aur version 2 mein kya differences hain?"</p><p>Strong answer: version 2 groups ko 0-255 se 0-4095 tak badhata hai, all-routers 224.0.0.2 ki jagah dedicated multicast 224.0.0.102 use karta hai, virtual MAC range ko 0000.0c07.acXX se 0000.0c9f.fXXX karta hai, IPv6 support jodta hai, aur TLV packet format use karta hai. Dono versions interoperate nahi karte, isliye dono peers match hone chahiye. Bonus: UDP port 1985 batao aur yeh ki v1 default hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HSRP UDP 1985 use karta hai, Hello, Coup aur Resign messages ke saath.</li>
<li>v1: groups 0-255, 224.0.0.2, VMAC 0000.0c07.acXX; yeh IOS default hai.</li>
<li>v2: groups 0-4095, 224.0.0.102, VMAC 0000.0c9f.fXXX, IPv6 capable.</li>
<li>v1 aur v2 ek dusre se baat nahi karte; mismatch se do Active routers bante hain.</li>
<li>Group number chhodne ka matlab group 0.</li>
</ul></div>
`}};export{e as default};