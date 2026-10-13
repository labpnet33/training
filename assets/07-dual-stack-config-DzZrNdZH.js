var e={id:`dual-stack-config`,h:{en:`Configuring dual stack on an office network`,hi:`Office network par dual stack configure karna`},body:{en:`
<p>Think of a city adding a metro line while the buses keep running. Nobody tears up the roads first; the metro is built alongside, people use whichever suits their trip, and one day the buses carry very few passengers. <b>Dual stack</b> is that approach: every router, server and PC runs <b>IPv4 and IPv6 at the same time</b>, on the same interfaces, and each conversation uses whichever protocol both ends support. It is the most common and the recommended way to deploy IPv6.</p>

<h3>The lab network</h3>
<p>The first lab, <b>Dual-stack the office</b>, starts with a working IPv4 network. You add IPv6 to it without touching the IPv4 configuration.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Dual-stack lab topology">
<rect x="10" y="30" width="80" height="36" rx="6" fill="#e2e8f0"/><text x="50" y="53" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="10" y="120" width="80" height="36" rx="6" fill="#e2e8f0"/><text x="50" y="143" text-anchor="middle" class="svg-ink" font-size="13">PC2</text>
<rect x="130" y="75" width="70" height="36" rx="6" fill="#fde68a"/><text x="165" y="98" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="250" y="75" width="80" height="36" rx="6" fill="#bae6fd"/><text x="290" y="98" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="400" y="75" width="80" height="36" rx="6" fill="#bae6fd"/><text x="440" y="98" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="540" y="75" width="80" height="36" rx="6" fill="#bbf7d0"/><text x="580" y="98" text-anchor="middle" class="svg-ink" font-size="13">SRV</text>
<line x1="90" y1="48" x2="130" y2="88" stroke="#64748b"/><line x1="90" y1="138" x2="130" y2="100" stroke="#64748b"/><line x1="200" y1="93" x2="250" y2="93" stroke="#64748b"/><line x1="330" y1="93" x2="400" y2="93" stroke="#64748b"/><line x1="480" y1="93" x2="540" y2="93" stroke="#64748b"/>
<text x="165" y="190" text-anchor="middle" class="svg-muted" font-size="12">10.0.10.0/24</text><text x="165" y="208" text-anchor="middle" class="svg-accent" font-size="12">2001:db8:acad:10::/64</text>
<text x="365" y="190" text-anchor="middle" class="svg-muted" font-size="12">10.0.12.0/30</text><text x="365" y="208" text-anchor="middle" class="svg-accent" font-size="12">2001:db8:acad:12::/64</text>
<text x="545" y="190" text-anchor="middle" class="svg-muted" font-size="12">10.0.20.0/24</text><text x="545" y="208" text-anchor="middle" class="svg-accent" font-size="12">2001:db8:acad:20::/64</text>
<text x="290" y="68" text-anchor="middle" class="svg-muted" font-size="11">G0/0   G0/1</text><text x="440" y="68" text-anchor="middle" class="svg-muted" font-size="11">G0/0   G0/1</text>
</svg><p class="cap">Every link carries an IPv4 subnet (grey) and an IPv6 /64 (blue). The IPv6 subnet ID matches the IPv4 third octet to keep the plan readable.</p></div>

<h3>Step 1: turn on IPv6 routing</h3>
<p>By default a router processes IPv6 for itself but does not <b>forward</b> it and does not send Router Advertisements. One global command changes that:</p>
<pre class="code">R1(config)# ipv6 unicast-routing
R2(config)# ipv6 unicast-routing</pre>

<h3>Step 2: add IPv6 addresses next to the IPv4 ones</h3>
<pre class="code"><span class="c">! R1: office LAN and WAN link. The IPv4 lines stay untouched.</span>
R1(config)# interface g0/0
R1(config-if)# ipv6 address 2001:db8:acad:10::1/64
R1(config-if)# interface g0/1
R1(config-if)# ipv6 address 2001:db8:acad:12::1/64
<span class="c">! R2: WAN link and server LAN</span>
R2(config)# interface g0/0
R2(config-if)# ipv6 address 2001:db8:acad:12::2/64
R2(config-if)# interface g0/1
R2(config-if)# ipv6 address 2001:db8:acad:20::1/64</pre>
<p>Adding an IPv6 address also enables IPv6 on the interface and creates its link-local address automatically. The running configuration now shows both stacks on one interface:</p>
<pre class="out">R1# show running-config interface g0/0
interface GigabitEthernet0/0
 description Office LAN
 <span class="hl">ip address 10.0.10.1 255.255.255.0</span>
 <span class="hl">ipv6 address 2001:DB8:ACAD:10::1/64</span></pre>

<h3>Step 3: let the hosts configure themselves</h3>
<p>Because R1 now sends RAs on the office LAN, the PCs need only one command in the lab shell, <code>ip auto</code>, which sends a Router Solicitation and builds a SLAAC address. Their IPv4 settings are not affected. On a real Windows or Linux host SLAAC is on by default: the address appears as soon as the RA arrives.</p>
<pre class="out">PC1&gt; show ipv6
LINK-LOCAL SCOPE  : FE80::250:7FFF:FE06:6D01/64
GLOBAL SCOPE      : <span class="hl">2001:DB8:ACAD:10:250:7FFF:FE06:6D01/64 (SLAAC)</span>
ROUTER LINK-LAYER : 52:54:0c:04:4b:01
GATEWAY           : <span class="hl">FE80::5054:CFF:FE04:4B01</span></pre>
<p>Notice the gateway: it is R1's <b>link-local</b> address, not <code>2001:db8:acad:10::1</code>. The lab asks you to type exactly this value, to make the point stick.</p>

<h3>Step 4: fixed addresses for servers</h3>
<p>Servers and network devices keep static addresses so DNS records and firewall rules stay valid. In the lab: <code>ip 2001:db8:acad:20::10/64 2001:db8:acad:20::1</code> on SRV. A static host can point at the router's global address as gateway, as here, or at its link-local address.</p>

<h3>Step 5: routes for IPv6</h3>
<p>IPv4 routes do not carry IPv6. The IPv6 table is completely separate, so each router needs IPv6 routes of its own:</p>
<pre class="code">R1(config)# ipv6 route ::/0 2001:db8:acad:12::2
R2(config)# ipv6 route 2001:db8:acad:10::/64 2001:db8:acad:12::1</pre>
<p>Chapter 8 explains these routes in detail.</p>

<h3>Step 6: verify both stacks</h3>
<pre class="out">R1# show ipv6 interface brief
GigabitEthernet0/0     [up/up]
    FE80::5054:CFF:FE04:4B01
    <span class="hl">2001:DB8:ACAD:10::1</span>
GigabitEthernet0/1     [up/up]
    FE80::5054:CFF:FE04:4B02
    <span class="hl">2001:DB8:ACAD:12::1</span>

PC1&gt; ping 2001:db8:acad:20::10
<span class="hl">84 bytes from 2001:DB8:ACAD:20::10 icmp_seq=1 ttl=62 time=0.500 ms</span>
PC1&gt; ping 10.0.20.10
<span class="hl">84 bytes from 10.0.20.10 icmp_seq=1 ttl=62 time=0.500 ms</span></pre>
<p>The IPv6 reply arrives with hop limit 62: SRV sent 64 and two routers each decremented it by one, exactly like TTL in IPv4. On real hosts, use <code>ping -6</code> or <code>ping6</code> on Linux and <code>ping -6</code> on Windows to force IPv6.</p>

<div class="eg"><p><b>Which protocol does an application pick?</b> When a dual-stack PC opens <code>intranet.corp.example</code>, it asks DNS for both an <b>A</b> record (IPv4) and an <b>AAAA</b> record (IPv6). If both exist, modern systems prefer IPv6 but race the two connections a few hundred milliseconds apart (<b>Happy Eyeballs</b>), so a broken IPv6 path costs the user a short delay rather than a failure.</p></div>

<h3>Pros and cons of dual stack</h3>
<ul>
<li><b>Pros:</b> no translation, native performance for both, gradual migration, easy rollback.</li>
<li><b>Cons:</b> two address plans, two routing tables, two sets of firewall rules and ACLs, and it still needs IPv4 addresses, so it does not by itself solve exhaustion.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>ipv6 unicast-routing</code>, so the router has IPv6 addresses but hosts get no RAs and nothing is forwarded. Securing IPv4 with ACLs and leaving IPv6 wide open. Adding a AAAA record in DNS before the server really answers on IPv6.</p></div>

<div class="exam"><p><b>Exam traps.</b> Dual stack means both protocols run <b>natively</b> side by side; it involves no tunnelling and no translation. A AAAA record maps a name to an IPv6 address. Hosts on a dual-stack network normally prefer IPv6 when both work.</p></div>

<div class="scn"><h4>The slow intranet after the IPv6 rollout</h4><p>After adding AAAA records for the intranet, users in one branch complained that pages took several seconds to open, while other branches were fine. The branch had IPv6 addresses via SLAAC but its router had no IPv6 route back to headquarters, so every IPv6 attempt failed and browsers fell back to IPv4 after a delay. <code>ping -6 intranet.corp.example</code> timed out while <code>ping -4</code> worked. Adding the missing IPv6 route removed the delay.</p><p><b>Lesson:</b> in dual stack, a half-working IPv6 path shows up as slowness, not as a clean outage. Test both stacks separately.</p></div>

<div class="iv"><p class="q">"How would you add IPv6 to an existing IPv4 office network?"</p><p>Strong answer: plan the prefix (a /48 or /56, one /64 per VLAN and link), enable IPv6 routing, add IPv6 addresses beside the IPv4 ones on router interfaces, choose SLAAC or DHCPv6 for hosts and give servers static addresses, add IPv6 routes or enable an IPv6 routing protocol, mirror the firewall and ACL policy for IPv6, then add AAAA records last. Verify with show ipv6 interface brief, ping and traceroute over each stack separately.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dual stack runs IPv4 and IPv6 natively on the same devices and interfaces.</li>
<li><code>ipv6 unicast-routing</code> makes a router forward IPv6 and send RAs.</li>
<li>Hosts use SLAAC (gateway = router link-local); servers get static IPv6 addresses.</li>
<li>IPv6 has its own routing table, routes, ACLs and firewall rules.</li>
<li>Applications prefer IPv6 with a fallback race (Happy Eyeballs); broken IPv6 shows up as delay.</li>
</ul></div>
`,hi:`
<p>Socho ek shehar metro line bana raha hai jabki buses chal rahi hain. Koi pehle sadkein nahi todta; metro saath mein banti hai, log apni trip ke hisaab se jo sahi lage use karte hain, aur ek din buses mein bahut kam log hote hain. <b>Dual stack</b> yahi approach hai: har router, server aur PC <b>IPv4 aur IPv6 ek saath</b> chalata hai, same interfaces par, aur har baatcheet woh protocol use karti hai jo dono ends support karte hain. IPv6 deploy karne ka yeh sabse common aur recommended tareeka hai.</p>

<h3>Lab network</h3>
<p>Pehla lab, <b>Dual-stack the office</b>, ek chalte hue IPv4 network se shuru hota hai. Aap IPv4 configuration ko chhue bina usme IPv6 jodte ho.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Dual-stack lab topology">
<rect x="10" y="30" width="80" height="36" rx="6" fill="#e2e8f0"/><text x="50" y="53" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="10" y="120" width="80" height="36" rx="6" fill="#e2e8f0"/><text x="50" y="143" text-anchor="middle" class="svg-ink" font-size="13">PC2</text>
<rect x="130" y="75" width="70" height="36" rx="6" fill="#fde68a"/><text x="165" y="98" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="250" y="75" width="80" height="36" rx="6" fill="#bae6fd"/><text x="290" y="98" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="400" y="75" width="80" height="36" rx="6" fill="#bae6fd"/><text x="440" y="98" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="540" y="75" width="80" height="36" rx="6" fill="#bbf7d0"/><text x="580" y="98" text-anchor="middle" class="svg-ink" font-size="13">SRV</text>
<line x1="90" y1="48" x2="130" y2="88" stroke="#64748b"/><line x1="90" y1="138" x2="130" y2="100" stroke="#64748b"/><line x1="200" y1="93" x2="250" y2="93" stroke="#64748b"/><line x1="330" y1="93" x2="400" y2="93" stroke="#64748b"/><line x1="480" y1="93" x2="540" y2="93" stroke="#64748b"/>
<text x="165" y="190" text-anchor="middle" class="svg-muted" font-size="12">10.0.10.0/24</text><text x="165" y="208" text-anchor="middle" class="svg-accent" font-size="12">2001:db8:acad:10::/64</text>
<text x="365" y="190" text-anchor="middle" class="svg-muted" font-size="12">10.0.12.0/30</text><text x="365" y="208" text-anchor="middle" class="svg-accent" font-size="12">2001:db8:acad:12::/64</text>
<text x="545" y="190" text-anchor="middle" class="svg-muted" font-size="12">10.0.20.0/24</text><text x="545" y="208" text-anchor="middle" class="svg-accent" font-size="12">2001:db8:acad:20::/64</text>
<text x="290" y="68" text-anchor="middle" class="svg-muted" font-size="11">G0/0   G0/1</text><text x="440" y="68" text-anchor="middle" class="svg-muted" font-size="11">G0/0   G0/1</text>
</svg><p class="cap">Har link par ek IPv4 subnet (grey) aur ek IPv6 /64 (blue) hai. Plan padhne mein aasaan rahe isliye IPv6 subnet ID IPv4 ke teesre octet se match karta hai.</p></div>

<h3>Step 1: IPv6 routing on karo</h3>
<p>Default mein router apne liye IPv6 process karta hai lekin use <b>forward</b> nahi karta aur Router Advertisements nahi bhejta. Ek global command yeh badal deti hai:</p>
<pre class="code">R1(config)# ipv6 unicast-routing
R2(config)# ipv6 unicast-routing</pre>

<h3>Step 2: IPv4 walon ke saath IPv6 addresses jodo</h3>
<pre class="code"><span class="c">! R1: office LAN aur WAN link. IPv4 lines ko haath nahi lagta.</span>
R1(config)# interface g0/0
R1(config-if)# ipv6 address 2001:db8:acad:10::1/64
R1(config-if)# interface g0/1
R1(config-if)# ipv6 address 2001:db8:acad:12::1/64
<span class="c">! R2: WAN link aur server LAN</span>
R2(config)# interface g0/0
R2(config-if)# ipv6 address 2001:db8:acad:12::2/64
R2(config-if)# interface g0/1
R2(config-if)# ipv6 address 2001:db8:acad:20::1/64</pre>
<p>IPv6 address jodne se interface par IPv6 enable bhi ho jata hai aur uska link-local address apne aap ban jata hai. Running configuration ab ek interface par dono stacks dikhati hai:</p>
<pre class="out">R1# show running-config interface g0/0
interface GigabitEthernet0/0
 description Office LAN
 <span class="hl">ip address 10.0.10.1 255.255.255.0</span>
 <span class="hl">ipv6 address 2001:DB8:ACAD:10::1/64</span></pre>

<h3>Step 3: hosts ko khud configure hone do</h3>
<p>Kyunki R1 ab office LAN par RAs bhej raha hai, PCs ko lab shell mein sirf ek command chahiye, <code>ip auto</code>, jo Router Solicitation bhejti hai aur SLAAC address banati hai. Unki IPv4 settings par koi asar nahi hota. Asli Windows ya Linux host par SLAAC default mein on hota hai: RA aate hi address aa jata hai.</p>
<pre class="out">PC1&gt; show ipv6
LINK-LOCAL SCOPE  : FE80::250:7FFF:FE06:6D01/64
GLOBAL SCOPE      : <span class="hl">2001:DB8:ACAD:10:250:7FFF:FE06:6D01/64 (SLAAC)</span>
ROUTER LINK-LAYER : 52:54:0c:04:4b:01
GATEWAY           : <span class="hl">FE80::5054:CFF:FE04:4B01</span></pre>
<p>Gateway par dhyan do: yeh R1 ka <b>link-local</b> address hai, <code>2001:db8:acad:10::1</code> nahi. Lab aapse bilkul yahi value type karwata hai, taaki yeh baat dimaag mein baith jaaye.</p>

<h3>Step 4: servers ke liye fixed addresses</h3>
<p>Servers aur network devices static addresses rakhte hain taaki DNS records aur firewall rules valid rahein. Lab mein SRV par: <code>ip 2001:db8:acad:20::10/64 2001:db8:acad:20::1</code>. Static host gateway ke roop mein router ka global address de sakta hai, jaise yahan, ya uska link-local address.</p>

<h3>Step 5: IPv6 ke liye routes</h3>
<p>IPv4 routes IPv6 nahi le jaate. IPv6 table bilkul alag hai, isliye har router ko apne IPv6 routes chahiye:</p>
<pre class="code">R1(config)# ipv6 route ::/0 2001:db8:acad:12::2
R2(config)# ipv6 route 2001:db8:acad:10::/64 2001:db8:acad:12::1</pre>
<p>Chapter 8 in routes ko detail mein samjhata hai.</p>

<h3>Step 6: dono stacks verify karo</h3>
<pre class="out">R1# show ipv6 interface brief
GigabitEthernet0/0     [up/up]
    FE80::5054:CFF:FE04:4B01
    <span class="hl">2001:DB8:ACAD:10::1</span>
GigabitEthernet0/1     [up/up]
    FE80::5054:CFF:FE04:4B02
    <span class="hl">2001:DB8:ACAD:12::1</span>

PC1&gt; ping 2001:db8:acad:20::10
<span class="hl">84 bytes from 2001:DB8:ACAD:20::10 icmp_seq=1 ttl=62 time=0.500 ms</span>
PC1&gt; ping 10.0.20.10
<span class="hl">84 bytes from 10.0.20.10 icmp_seq=1 ttl=62 time=0.500 ms</span></pre>
<p>IPv6 reply hop limit 62 ke saath aata hai: SRV ne 64 bheja aur do routers ne ek ek kam kiya, bilkul IPv4 ke TTL ki tarah. Asli hosts par IPv6 force karne ke liye Linux par <code>ping -6</code> ya <code>ping6</code> aur Windows par <code>ping -6</code> use karo.</p>

<div class="eg"><p><b>Application kaunsa protocol chunti hai?</b> Jab dual-stack PC <code>intranet.corp.example</code> kholta hai, woh DNS se <b>A</b> record (IPv4) aur <b>AAAA</b> record (IPv6) dono maangta hai. Dono hon to modern systems IPv6 prefer karte hain lekin dono connections ko kuch sau milliseconds ke gap se race karwate hain (<b>Happy Eyeballs</b>), taaki toota IPv6 path user ko failure nahi, bas chhota delay de.</p></div>

<h3>Dual stack ke fayde aur nuksaan</h3>
<ul>
<li><b>Fayde:</b> koi translation nahi, dono ki native performance, dheere dheere migration, aasaan rollback.</li>
<li><b>Nuksaan:</b> do address plans, do routing tables, firewall rules aur ACLs ke do sets, aur ab bhi IPv4 addresses chahiye, isliye yeh akele exhaustion solve nahi karta.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> <code>ipv6 unicast-routing</code> bhool jaana, jisse router ke paas IPv6 addresses hote hain lekin hosts ko RAs nahi milte aur kuch forward nahi hota. IPv4 ko ACLs se secure karna aur IPv6 ko poora khula chhod dena. Server ke sach mein IPv6 par jawab dene se pehle DNS mein AAAA record jod dena.</p></div>

<div class="exam"><p><b>Exam traps.</b> Dual stack ka matlab hai dono protocols <b>natively</b> saath saath chalte hain; isme tunnelling ya translation nahi hota. AAAA record naam ko IPv6 address se map karta hai. Dual-stack network ke hosts aam taur par dono chalne par IPv6 prefer karte hain.</p></div>

<div class="scn"><h4>IPv6 rollout ke baad slow intranet</h4><p>Intranet ke AAAA records jodne ke baad ek branch ke users ne shikayat ki ki pages khulne mein kai second lag rahe hain, jabki baaki branches theek thi. Branch ke paas SLAAC se IPv6 addresses the lekin uske router par headquarters tak wapas IPv6 route nahi tha, isliye har IPv6 koshish fail hoti thi aur browsers delay ke baad IPv4 par jaate the. <code>ping -6 intranet.corp.example</code> time out ho raha tha jabki <code>ping -4</code> chal raha tha. Missing IPv6 route jodne se delay khatam ho gaya.</p><p><b>Seekh:</b> dual stack mein aadha chalta IPv6 path slowness ki tarah dikhta hai, saaf outage ki tarah nahi. Dono stacks alag alag test karo.</p></div>

<div class="iv"><p class="q">"Existing IPv4 office network mein IPv6 kaise jodoge?"</p><p>Strong answer: prefix plan karo (/48 ya /56, har VLAN aur link ke liye ek /64), IPv6 routing enable karo, router interfaces par IPv4 ke saath IPv6 addresses jodo, hosts ke liye SLAAC ya DHCPv6 chuno aur servers ko static addresses do, IPv6 routes lagao ya IPv6 routing protocol enable karo, firewall aur ACL policy ko IPv6 ke liye mirror karo, phir sabse aakhir mein AAAA records jodo. show ipv6 interface brief, ping aur traceroute se har stack alag verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dual stack same devices aur interfaces par IPv4 aur IPv6 natively chalata hai.</li>
<li><code>ipv6 unicast-routing</code> router se IPv6 forward karwata hai aur RAs bhejwata hai.</li>
<li>Hosts SLAAC use karte hain (gateway = router link-local); servers ko static IPv6 addresses milte hain.</li>
<li>IPv6 ki apni routing table, routes, ACLs aur firewall rules hain.</li>
<li>Applications fallback race ke saath IPv6 prefer karti hain (Happy Eyeballs); toota IPv6 delay ki tarah dikhta hai.</li>
</ul></div>
`}};export{e as default};