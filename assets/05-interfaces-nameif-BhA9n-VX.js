var e={id:`interfaces`,h:{en:`Interfaces: nameif, IP addressing, subinterfaces and verification`,hi:`Interfaces: nameif, IP addressing, subinterfaces aur verification`},body:{en:`
<p>On a router, a port with an IP address and <code>no shutdown</code> is ready. On an ASA it is not. The ASA wants to know <b>what the port is for</b> before it lets anything through. Think of doors in an office: a door with a lock and a number is not enough; the guard also needs a sign saying "Staff entrance" or "Delivery bay", because the rules depend on which door it is. That sign is the <b>nameif</b>.</p>

<h3>The four lines every data interface needs</h3>
<pre class="code">interface GigabitEthernet0/0
 nameif outside                     <span class="c">! the logical name</span>
 security-level 0                   <span class="c">! set automatically for any name except "inside"</span>
 ip address 203.0.113.2 255.255.255.248
 no shutdown
interface GigabitEthernet0/1
 nameif inside                      <span class="c">! gets security-level 100 automatically</span>
 ip address 10.0.1.1 255.255.255.0
 no shutdown</pre>
<pre class="out">NK-ASA(config)# interface GigabitEthernet0/1
NK-ASA(config-if)# nameif inside
<span class="hl">INFO: Security level for "inside" set to 100 by default.</span></pre>
<ul>
<li><b>nameif</b>: the logical name. Every other feature (routes, NAT, SSH, ACLs, inspection) points to it. Names are case-sensitive and must be unique.</li>
<li><b>security-level</b>: 0 to 100. The name <code>inside</code> gets 100, any other name gets 0, and you can override either.</li>
<li><b>ip address</b>: with a subnet mask, as on IOS. The ASA can also use <code>ip address dhcp setroute</code> on the outside when the ISP gives addresses by DHCP.</li>
<li><b>no shutdown</b>: ASA data interfaces are administratively down until you enable them.</li>
</ul>
<p>An interface with an IP address but <b>no nameif</b> passes no traffic at all and cannot be used by any route or policy. This is the single most common "it is up/up but nothing works" cause on a new ASA.</p>

<h3>Interface names you will see</h3>
<p>On ASAv and 5500-X: <code>GigabitEthernet0/0</code>, <code>GigabitEthernet0/1</code> and so on, plus <code>Management0/0</code>. On Secure Firewall hardware: <code>Ethernet1/1</code>, <code>Ethernet1/2</code>, and <code>Management1/1</code>. The management port can be restricted with <code>management-only</code>, which makes the ASA accept traffic to itself on it but never route transit traffic through it.</p>

<h3>Subinterfaces: one cable, many zones</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Subinterfaces on a trunk">
<rect x="30" y="70" width="120" height="60" rx="10" fill="#fed7aa"/><text x="90" y="98" text-anchor="middle" class="svg-ink" font-size="14">ASA</text><text x="90" y="118" text-anchor="middle" class="svg-muted" font-size="12">Gi0/3 (trunk)</text>
<line x1="150" y1="100" x2="280" y2="100" stroke="#64748b" stroke-width="3"/>
<rect x="280" y="70" width="110" height="60" rx="10" fill="#e2e8f0"/><text x="335" y="104" text-anchor="middle" class="svg-ink" font-size="13">Switch</text>
<rect x="450" y="20" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="12">VLAN 20 guest (10)</text>
<rect x="450" y="80" width="170" height="40" rx="8" fill="#bae6fd"/><text x="535" y="105" text-anchor="middle" class="svg-ink" font-size="12">VLAN 30 voice (80)</text>
<rect x="450" y="140" width="170" height="40" rx="8" fill="#ddd6fe"/><text x="535" y="165" text-anchor="middle" class="svg-ink" font-size="12">VLAN 40 cameras (60)</text>
<line x1="390" y1="100" x2="450" y2="40" stroke="#64748b"/><line x1="390" y1="100" x2="450" y2="100" stroke="#64748b"/><line x1="390" y1="100" x2="450" y2="160" stroke="#64748b"/>
<text x="215" y="90" text-anchor="middle" class="svg-muted" font-size="12">802.1Q</text>
</svg><p class="cap">Each subinterface carries one VLAN, has its own nameif and security level, and is a separate zone.</p></div>
<pre class="code"><span class="c">! the parent carries tagged frames only: no name, no address</span>
interface GigabitEthernet0/3
 no nameif
 no security-level
 no ip address
 no shutdown
<span class="c">! one subinterface per VLAN</span>
interface GigabitEthernet0/3.20
 vlan 20
 nameif guest
 security-level 10
 ip address 10.0.20.1 255.255.255.0</pre>
<p>The <code>vlan</code> command is mandatory: without it the subinterface does not know which 802.1Q tag it owns and stays down. The parent must be <code>no shutdown</code>; if the parent is down, every subinterface is down too. The switch port facing the ASA must be a trunk that allows those VLANs.</p>

<h3>Verification</h3>
<pre class="out">NK-ASA# show nameif
Interface                Name                     Security
<span class="hl">GigabitEthernet0/0       outside                    0</span>
<span class="hl">GigabitEthernet0/1       inside                   100</span>
NK-ASA# show interface ip brief
Interface                  IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0         203.0.113.2     YES manual up                    up
GigabitEthernet0/1         10.0.1.1        YES manual up                    up
GigabitEthernet0/2         unassigned      YES unset  administratively down down
Management0/0              unassigned      YES unset  administratively down down
NK-ASA# show interface GigabitEthernet0/1
<span class="hl">Interface GigabitEthernet0/1 "inside", is up, line protocol is up</span>
        MAC address 0050.56a1.0b11, MTU 1500
        IP address 10.0.1.1, subnet mask 255.255.255.0
...(trimmed)</pre>
<p><code>show nameif</code> is the fastest check of names and levels. <code>show interface ip brief</code> shows addresses and status but <b>not</b> the name. <code>show interface</code> shows the name in quotes on the first line; an empty pair of quotes means no nameif.</p>

<div class="eg"><p><b>Worked example (lab task 1).</b> On ASA1 you configure Gi0/0 as outside 203.0.113.2/29 and Gi0/1 as inside 10.0.1.1/24, both <code>no shutdown</code>. A /29 mask is 255.255.255.248: usable hosts .1 to .6, so the ISP is .1 and the ASA is .2. PC1 (10.0.1.10, gateway 10.0.1.1) now pings 10.0.1.1, and the ISP pings 203.0.113.2. Both tests are to the interface facing the pinging host, which the ASA answers by default.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>nameif</code> and chasing routing for an hour. Naming the outside "Outside" and then typing <code>route outside ...</code>: names are case-sensitive. Putting an IP address on the parent of a trunk. Expecting PC1 to ping the <b>outside</b> address 203.0.113.2: the ASA does not answer pings to an interface other than the one the packet arrived on.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Inside" gets level 100 automatically only when the name is exactly <code>inside</code>. A name like <code>lan</code> or <code>INSIDE</code> gets 0 unless you set the level yourself, and suddenly your users cannot reach the internet because inside and outside are both 0.</p></div>

<div class="scn"><h4>The interface that passes nothing</h4><p>A new interface Gi0/3 to a lab network was up/up and had address 10.9.9.1/24, but hosts behind it could not reach anything and a static route toward the lab was rejected. <code>show nameif</code> listed only outside and inside. <code>show running-config interface GigabitEthernet0/3</code> showed <code>no nameif</code> and <code>no security-level</code>. Adding <code>nameif lab</code> and <code>security-level 50</code> brought the interface into the policy, and the route could then be entered with the name <code>lab</code>.</p><p><b>Lesson:</b> on an ASA, no name means no traffic. Check <code>show nameif</code> first.</p></div>

<div class="iv"><p class="q">"What is nameif and why does the ASA need it?"</p><p>Strong answer: nameif gives the interface a logical name that every feature references: routes, NAT rules, access-groups, management allow-lists and inspection. Without it the interface is not part of the security policy and forwards nothing. Mention that <code>inside</code> gets level 100 automatically and other names get 0, that names are case-sensitive, and that you verify with <code>show nameif</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A data interface needs nameif, a security level, an IP address and <code>no shutdown</code>.</li>
<li>No nameif = no traffic, even when the interface is up/up.</li>
<li>Subinterfaces need the <code>vlan</code> command; the parent has no name or address and must be up.</li>
<li><code>management-only</code> blocks transit traffic on a management port.</li>
<li>Verify with <code>show nameif</code>, <code>show interface ip brief</code> and <code>show interface</code>.</li>
</ul></div>
`,hi:`
<p>Router par, IP address aur <code>no shutdown</code> wala port ready hota hai. ASA par nahi. ASA kuch bhi pass karne se pehle jaanna chahta hai ki <b>port kis kaam ka hai</b>. Office ke darwazon ke baare mein socho: lock aur number wala darwaza kaafi nahi hai; guard ko ek board bhi chahiye jo bataye "Staff entrance" ya "Delivery bay", kyunki rules is par depend karte hain ki kaunsa darwaza hai. Woh board hi <b>nameif</b> hai.</p>

<h3>Woh chaar lines jo har data interface ko chahiye</h3>
<pre class="code">interface GigabitEthernet0/0
 nameif outside                     <span class="c">! logical naam</span>
 security-level 0                   <span class="c">! "inside" ke alawa kisi bhi naam ke liye apne aap set</span>
 ip address 203.0.113.2 255.255.255.248
 no shutdown
interface GigabitEthernet0/1
 nameif inside                      <span class="c">! apne aap security-level 100 milta hai</span>
 ip address 10.0.1.1 255.255.255.0
 no shutdown</pre>
<pre class="out">NK-ASA(config)# interface GigabitEthernet0/1
NK-ASA(config-if)# nameif inside
<span class="hl">INFO: Security level for "inside" set to 100 by default.</span></pre>
<ul>
<li><b>nameif</b>: logical naam. Har doosra feature (routes, NAT, SSH, ACLs, inspection) isi ko point karta hai. Naam case-sensitive hote hain aur unique hone chahiye.</li>
<li><b>security-level</b>: 0 se 100. Naam <code>inside</code> ko 100 milta hai, kisi aur naam ko 0, aur aap dono ko override kar sakte ho.</li>
<li><b>ip address</b>: subnet mask ke saath, IOS ki tarah. Jab ISP DHCP se address deta hai to ASA outside par <code>ip address dhcp setroute</code> bhi use kar sakta hai.</li>
<li><b>no shutdown</b>: ASA data interfaces tab tak administratively down rehte hain jab tak aap enable na karo.</li>
</ul>
<p>Jis interface par IP address hai lekin <b>nameif nahi</b>, woh bilkul koi traffic pass nahi karta aur kisi route ya policy mein use nahi ho sakta. Naye ASA par "up/up hai lekin kuch kaam nahi karta" ki yeh sabse common wajah hai.</p>

<h3>Interface names jo aap dekhoge</h3>
<p>ASAv aur 5500-X par: <code>GigabitEthernet0/0</code>, <code>GigabitEthernet0/1</code> wagairah, plus <code>Management0/0</code>. Secure Firewall hardware par: <code>Ethernet1/1</code>, <code>Ethernet1/2</code>, aur <code>Management1/1</code>. Management port ko <code>management-only</code> se restrict kiya ja sakta hai, jisse ASA us par apne liye traffic accept karta hai lekin kabhi transit traffic uske through route nahi karta.</p>

<h3>Subinterfaces: ek cable, kai zones</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Trunk par subinterfaces">
<rect x="30" y="70" width="120" height="60" rx="10" fill="#fed7aa"/><text x="90" y="98" text-anchor="middle" class="svg-ink" font-size="14">ASA</text><text x="90" y="118" text-anchor="middle" class="svg-muted" font-size="12">Gi0/3 (trunk)</text>
<line x1="150" y1="100" x2="280" y2="100" stroke="#64748b" stroke-width="3"/>
<rect x="280" y="70" width="110" height="60" rx="10" fill="#e2e8f0"/><text x="335" y="104" text-anchor="middle" class="svg-ink" font-size="13">Switch</text>
<rect x="450" y="20" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="12">VLAN 20 guest (10)</text>
<rect x="450" y="80" width="170" height="40" rx="8" fill="#bae6fd"/><text x="535" y="105" text-anchor="middle" class="svg-ink" font-size="12">VLAN 30 voice (80)</text>
<rect x="450" y="140" width="170" height="40" rx="8" fill="#ddd6fe"/><text x="535" y="165" text-anchor="middle" class="svg-ink" font-size="12">VLAN 40 cameras (60)</text>
<line x1="390" y1="100" x2="450" y2="40" stroke="#64748b"/><line x1="390" y1="100" x2="450" y2="100" stroke="#64748b"/><line x1="390" y1="100" x2="450" y2="160" stroke="#64748b"/>
<text x="215" y="90" text-anchor="middle" class="svg-muted" font-size="12">802.1Q</text>
</svg><p class="cap">Har subinterface ek VLAN carry karta hai, uska apna nameif aur security level hota hai, aur woh alag zone hai.</p></div>
<pre class="code"><span class="c">! parent sirf tagged frames carry karta hai: koi naam nahi, koi address nahi</span>
interface GigabitEthernet0/3
 no nameif
 no security-level
 no ip address
 no shutdown
<span class="c">! har VLAN ke liye ek subinterface</span>
interface GigabitEthernet0/3.20
 vlan 20
 nameif guest
 security-level 10
 ip address 10.0.20.1 255.255.255.0</pre>
<p><code>vlan</code> command zaroori hai: iske bina subinterface ko pata nahi hota ki kaunsa 802.1Q tag uska hai aur woh down rehta hai. Parent <code>no shutdown</code> hona chahiye; agar parent down hai to har subinterface bhi down hai. ASA ki taraf wala switch port trunk hona chahiye jo un VLANs ko allow kare.</p>

<h3>Verification</h3>
<pre class="out">NK-ASA# show nameif
Interface                Name                     Security
<span class="hl">GigabitEthernet0/0       outside                    0</span>
<span class="hl">GigabitEthernet0/1       inside                   100</span>
NK-ASA# show interface ip brief
Interface                  IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0         203.0.113.2     YES manual up                    up
GigabitEthernet0/1         10.0.1.1        YES manual up                    up
GigabitEthernet0/2         unassigned      YES unset  administratively down down
Management0/0              unassigned      YES unset  administratively down down
NK-ASA# show interface GigabitEthernet0/1
<span class="hl">Interface GigabitEthernet0/1 "inside", is up, line protocol is up</span>
        MAC address 0050.56a1.0b11, MTU 1500
        IP address 10.0.1.1, subnet mask 255.255.255.0
...(trimmed)</pre>
<p><code>show nameif</code> names aur levels ka sabse tez check hai. <code>show interface ip brief</code> addresses aur status dikhata hai lekin naam <b>nahi</b>. <code>show interface</code> pehli line par naam quotes mein dikhata hai; khaali quotes ka matlab hai koi nameif nahi.</p>

<div class="eg"><p><b>Worked example (lab task 1).</b> ASA1 par aap Gi0/0 ko outside 203.0.113.2/29 aur Gi0/1 ko inside 10.0.1.1/24 configure karte ho, dono <code>no shutdown</code>. /29 mask 255.255.255.248 hai: usable hosts .1 se .6, isliye ISP .1 hai aur ASA .2. PC1 (10.0.1.10, gateway 10.0.1.1) ab 10.0.1.1 ping karta hai, aur ISP 203.0.113.2 ping karta hai. Dono tests ping karne wale host ki taraf wale interface ko hain, jiska ASA default se jawab deta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>nameif</code> bhool jaana aur ek ghante tak routing ke peeche bhaagna. Outside ka naam "Outside" rakhna aur phir <code>route outside ...</code> type karna: naam case-sensitive hain. Trunk ke parent par IP address daalna. PC1 se <b>outside</b> address 203.0.113.2 ping hone ki umeed karna: ASA us interface ke alawa kisi aur interface ke pings ka jawab nahi deta jis par packet aaya.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Inside" ko level 100 apne aap tabhi milta hai jab naam exactly <code>inside</code> ho. <code>lan</code> ya <code>INSIDE</code> jaise naam ko 0 milta hai jab tak aap khud level set na karo, aur achanak aapke users internet tak nahi pahunch paate kyunki inside aur outside dono 0 hain.</p></div>

<div class="scn"><h4>Woh interface jo kuch pass nahi karta</h4><p>Lab network ki taraf naya interface Gi0/3 up/up tha aur uska address 10.9.9.1/24 tha, lekin uske peeche ke hosts kahin nahi pahunch pa rahe the aur lab ki taraf static route reject ho raha tha. <code>show nameif</code> mein sirf outside aur inside the. <code>show running-config interface GigabitEthernet0/3</code> ne <code>no nameif</code> aur <code>no security-level</code> dikhaya. <code>nameif lab</code> aur <code>security-level 50</code> jodne se interface policy mein aa gaya, aur phir route naam <code>lab</code> ke saath enter ho gaya.</p><p><b>Seekh:</b> ASA par naam nahi to traffic nahi. Pehle <code>show nameif</code> check karo.</p></div>

<div class="iv"><p class="q">"nameif kya hai aur ASA ko iski zaroorat kyun hai?"</p><p>Strong answer: nameif interface ko ek logical naam deta hai jise har feature refer karta hai: routes, NAT rules, access-groups, management allow-lists aur inspection. Iske bina interface security policy ka hissa nahi hota aur kuch forward nahi karta. Batao ki <code>inside</code> ko apne aap level 100 milta hai aur doosre naamon ko 0, naam case-sensitive hain, aur aap <code>show nameif</code> se verify karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Data interface ko nameif, security level, IP address aur <code>no shutdown</code> chahiye.</li>
<li>Nameif nahi = traffic nahi, chahe interface up/up ho.</li>
<li>Subinterfaces ko <code>vlan</code> command chahiye; parent ka koi naam ya address nahi hota aur woh up hona chahiye.</li>
<li><code>management-only</code> management port par transit traffic block karta hai.</li>
<li><code>show nameif</code>, <code>show interface ip brief</code> aur <code>show interface</code> se verify karo.</li>
</ul></div>
`}};export{e as default};