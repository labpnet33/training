var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with a laptop in a dark room that did not even know its own address. You now know how it shouts for help (Discover), how reception answers (Offer), how it accepts (Request, Ack), how a messenger carries its shout across buildings (relay), and how it finds anything by name (DNS). This chapter packs all of it into a checklist you can revise from the night before the exam or an interview.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module summary: from boot to connection">
<rect x="10" y="50" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="76" text-anchor="middle" class="svg-ink" font-size="13">Boot</text><text x="65" y="96" text-anchor="middle" class="svg-muted" font-size="12">no IP</text>
<rect x="140" y="50" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="195" y="76" text-anchor="middle" class="svg-ink" font-size="13">DORA</text><text x="195" y="96" text-anchor="middle" class="svg-muted" font-size="12">UDP 67/68</text>
<rect x="270" y="50" width="110" height="60" rx="10" fill="#fde68a"/><text x="325" y="76" text-anchor="middle" class="svg-ink" font-size="13">Relay</text><text x="325" y="96" text-anchor="middle" class="svg-muted" font-size="12">helper, giaddr</text>
<rect x="400" y="50" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="455" y="76" text-anchor="middle" class="svg-ink" font-size="13">DNS</text><text x="455" y="96" text-anchor="middle" class="svg-muted" font-size="12">UDP/TCP 53</text>
<rect x="530" y="50" width="100" height="60" rx="10" fill="#fed7aa"/><text x="580" y="76" text-anchor="middle" class="svg-ink" font-size="13">Connect</text><text x="580" y="96" text-anchor="middle" class="svg-muted" font-size="12">by name</text>
<line x1="120" y1="80" x2="140" y2="80" stroke="#64748b" stroke-width="2"/><line x1="250" y1="80" x2="270" y2="80" stroke="#64748b" stroke-width="2"/><line x1="380" y1="80" x2="400" y2="80" stroke="#64748b" stroke-width="2"/><line x1="510" y1="80" x2="530" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="13">Address, mask, gateway, DNS, lease: then names work</text>
</svg><p class="cap">The whole module on one line: get an identity, cross routers if needed, then resolve names.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain why hosts use DHCP and why infrastructure uses static or reserved addresses.</li>
<li>Describe DORA message by message: source and destination IPs, UDP 68/67, broadcast vs unicast, xid, yiaddr, giaddr, option 54.</li>
<li>Name the purpose of options 1, 3, 6, 15, 43, 51, 53, 54, 82 and 150.</li>
<li>Explain the lease lifecycle: T1 (50%, unicast renew), T2 (87.5%, broadcast rebind), expiry; NAK, DECLINE, RELEASE, INFORM.</li>
<li>Recognise 169.254.x.x as "no DHCP server answered".</li>
<li>Configure <code>ip dhcp excluded-address</code> and a pool with <code>network</code>, <code>default-router</code>, <code>dns-server</code>, <code>domain-name</code>, <code>lease</code>.</li>
<li>Configure <code>ip helper-address</code> on the client-facing interface and explain giaddr and the return route.</li>
<li>Make a router a DHCP client with <code>ip address dhcp</code> and explain the AD 254 default route.</li>
<li>Verify with <code>show ip dhcp binding</code>, <code>pool</code>, <code>conflict</code>, <code>server statistics</code>, <code>show ip interface</code>, <code>show dhcp lease</code>.</li>
<li>Read client settings with <code>ipconfig /all</code>, <code>ip addr</code>/<code>ip route</code>/<code>resolvectl</code>, and <code>ipconfig getpacket</code> on macOS.</li>
<li>Explain DNS hierarchy, recursive vs iterative queries, TTL and caching.</li>
<li>Use A, AAAA, CNAME, MX, NS, PTR, TXT and SOA correctly and test them with nslookup and dig.</li>
<li>Configure the IOS DNS client (<code>ip domain-lookup</code>, <code>ip name-server</code>, <code>ip domain-name</code>, <code>ip host</code>) and verify with <code>show hosts</code>.</li>
<li>Run the "no address" and "works by IP only" workflows, including both faults in the troubleshoot lab.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>DORA</dt><dd>Discover, Offer, Request, Ack: the four-message DHCP exchange.</dd>
<dt>Lease</dt><dd>Time-limited loan of an address; IOS default one day.</dd>
<dt>Binding</dt><dd>The server's record of IP to client ID/MAC and expiry.</dd>
<dt>Exclusion</dt><dd>Global range of addresses the server never hands out.</dd>
<dt>Relay agent</dt><dd>A router interface with <code>ip helper-address</code> that forwards DHCP broadcasts as unicast.</dd>
<dt>giaddr</dt><dd>Gateway IP address field set by the relay; used by the server to choose the pool.</dd>
<dt>APIPA</dt><dd>Self-assigned 169.254.0.0/16 address when DHCP fails.</dd>
<dt>Resolver</dt><dd>DNS server that answers clients recursively and caches results.</dd>
<dt>Authoritative server</dt><dd>Server that holds a zone's records.</dd>
<dt>TTL</dt><dd>Seconds an answer may be cached.</dd>
<dt>FQDN</dt><dd>Full name ending at the root, like www.nwk.lab.</dd>
<dt>NXDOMAIN</dt><dd>DNS answer meaning "that name does not exist".</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Ports</td><td>DHCP server UDP 67, client UDP 68; DNS UDP 53 (TCP 53 for zone transfers and large answers)</td></tr>
<tr><td>Discover</td><td>0.0.0.0 to 255.255.255.255, broadcast; Request is also broadcast</td></tr>
<tr><td>Choice</td><td>Client takes the first Offer</td></tr>
<tr><td>Timers</td><td>T1 = 50% unicast renew; T2 = 87.5% broadcast rebind</td></tr>
<tr><td>Exclusions</td><td>Global config, not inside the pool</td></tr>
<tr><td>Relay</td><td>Client-facing interface; giaddr picks the pool; server needs a route back</td></tr>
<tr><td>Relayed binding</td><td>Interface shows Unknown</td></tr>
<tr><td>Router client</td><td><code>ip address dhcp</code>; default route AD 254</td></tr>
<tr><td>IOS DNS</td><td>domain-lookup on by default; no server = broadcast 255.255.255.255</td></tr>
<tr><td>Records</td><td>A IPv4, AAAA IPv6, CNAME alias, MX mail, NS authority, PTR reverse, TXT text</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! DHCP server (R1)</span>
ip dhcp excluded-address 192.168.10.1 192.168.10.20
ip dhcp pool LAN10
 network 192.168.10.0 255.255.255.0
 default-router 192.168.10.1
 dns-server 10.1.100.53
 domain-name nwk.lab
 lease 2 12
<span class="c">! relay (R2, client-facing)</span>
interface GigabitEthernet0/0
 ip helper-address 10.1.12.1
<span class="c">! router as DHCP client</span>
interface GigabitEthernet0/2
 ip address dhcp
<span class="c">! IOS DNS client</span>
ip domain-lookup
ip name-server 10.1.100.53
ip domain-name nwk.lab
ip host SW-CAMPUS 192.168.10.2
<span class="c">! verification</span>
show ip dhcp binding | pool | conflict | server statistics
show ip interface GigabitEthernet0/0
show dhcp lease
show hosts</pre>

<div class="eg"><p><b>Worked example: one-minute self test.</b> A PC in the annex shows 192.168.20.25, gateway 192.168.20.1, DNS 10.1.100.53, DHCP server 10.1.12.1. Say out loud what configuration made each value possible: pool LAN20 on R1 (network, default-router, dns-server), helper 10.1.12.1 on R2 Gi0/0, a route on R1 back to 192.168.20.0/24, and exclusions that stopped .1–.20 from being used. If you can do that without notes, you have this module.</p></div>

<div class="warn"><p><b>Final common mistakes to avoid.</b> Exclusions in the wrong mode or covering the whole subnet; helper on the uplink; forgetting the return route; confusing <code>ip name-server</code> with the pool's <code>dns-server</code>; blaming DNS for a 169.254 address.</p></div>
<div class="exam"><p><b>Exam trap.</b> Many questions show output and ask what is wrong. Train your eye: Excluded = Total in <code>show ip dhcp pool</code>; a helper address that does not belong to the server; Interface Unknown (normal); "Translating ... domain server (255.255.255.255)" (no name server); NXDOMAIN vs timeout.</p></div>

<div class="scn"><h4>The interview that turned into a whiteboard</h4><p>A candidate for a NOC role was asked, "A new floor gets 169.254 addresses; what do you check?" Instead of listing random commands, they drew the path on the whiteboard: PC, access switch, SVI with helper, core, DHCP server, and at each hop named the evidence: <code>ipconfig /all</code>, the port's VLAN and snooping trust, <code>show ip interface</code> for the helper, a ping from the SVI to the server, and the server's statistics and scope. They got the job the same day.</p><p><b>Lesson:</b> structured thinking along the packet path is the skill employers are testing.</p></div>

<div class="iv"><p class="q">"Explain, end to end, what happens from the moment a laptop connects until it opens www.nwk.lab."</p><p>Link up; DORA (broadcast Discover from 0.0.0.0, Offer with address, gateway, DNS, lease; broadcast Request; Ack), relayed via helper and giaddr if the server is remote; optional ARP check; the laptop ARPs for the gateway; it queries the DNS server from option 6 over UDP 53; the resolver answers from cache or iteratively; the laptop then opens a TCP session to the returned address through the gateway. Mention renewal at T1 to show depth.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DHCP gives address, mask, gateway, DNS and lease via DORA on UDP 67/68.</li>
<li>Exclusions are global; pools are matched by interface or giaddr; relays go on client-facing interfaces.</li>
<li>Verify with binding, pool, conflict and statistics on the server, and ipconfig/ip addr on clients.</li>
<li>DNS resolves names through a hierarchy with recursive and iterative queries, cached for the TTL.</li>
<li>Troubleshoot along the path: no address = DHCP path; works by IP only = DNS.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module ek andhere kamre mein pade laptop ke saath shuru kiya tha jise apna address bhi nahi pata tha. Ab aap jaante ho ki woh madad ke liye kaise chillata hai (Discover), reception kaise jawab deta hai (Offer), woh kaise accept karta hai (Request, Ack), messenger uski aawaz buildings ke paar kaise le jaata hai (relay), aur woh kisi bhi cheez ko naam se kaise dhoondhta hai (DNS). Yeh chapter sab kuch ek checklist mein pack karta hai jisse aap exam ya interview se pehli raat revise kar sako.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module summary: boot se connection tak">
<rect x="10" y="50" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="76" text-anchor="middle" class="svg-ink" font-size="13">Boot</text><text x="65" y="96" text-anchor="middle" class="svg-muted" font-size="12">koi IP nahi</text>
<rect x="140" y="50" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="195" y="76" text-anchor="middle" class="svg-ink" font-size="13">DORA</text><text x="195" y="96" text-anchor="middle" class="svg-muted" font-size="12">UDP 67/68</text>
<rect x="270" y="50" width="110" height="60" rx="10" fill="#fde68a"/><text x="325" y="76" text-anchor="middle" class="svg-ink" font-size="13">Relay</text><text x="325" y="96" text-anchor="middle" class="svg-muted" font-size="12">helper, giaddr</text>
<rect x="400" y="50" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="455" y="76" text-anchor="middle" class="svg-ink" font-size="13">DNS</text><text x="455" y="96" text-anchor="middle" class="svg-muted" font-size="12">UDP/TCP 53</text>
<rect x="530" y="50" width="100" height="60" rx="10" fill="#fed7aa"/><text x="580" y="76" text-anchor="middle" class="svg-ink" font-size="13">Connect</text><text x="580" y="96" text-anchor="middle" class="svg-muted" font-size="12">naam se</text>
<line x1="120" y1="80" x2="140" y2="80" stroke="#64748b" stroke-width="2"/><line x1="250" y1="80" x2="270" y2="80" stroke="#64748b" stroke-width="2"/><line x1="380" y1="80" x2="400" y2="80" stroke="#64748b" stroke-width="2"/><line x1="510" y1="80" x2="530" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="13">Address, mask, gateway, DNS, lease: phir names chalte hain</text>
</svg><p class="cap">Poora module ek line mein: pehchaan lo, zaroorat ho to routers paar karo, phir names resolve karo.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao ki hosts DHCP kyun use karte hain aur infrastructure static ya reserved addresses kyun.</li>
<li>DORA message by message batao: source aur destination IPs, UDP 68/67, broadcast vs unicast, xid, yiaddr, giaddr, option 54.</li>
<li>Options 1, 3, 6, 15, 43, 51, 53, 54, 82 aur 150 ka purpose batao.</li>
<li>Lease lifecycle samjhao: T1 (50%, unicast renew), T2 (87.5%, broadcast rebind), expiry; NAK, DECLINE, RELEASE, INFORM.</li>
<li>169.254.x.x ko "kisi DHCP server ne jawab nahi diya" ke roop mein pehchano.</li>
<li><code>ip dhcp excluded-address</code> aur <code>network</code>, <code>default-router</code>, <code>dns-server</code>, <code>domain-name</code>, <code>lease</code> wala pool configure karo.</li>
<li>Client-facing interface par <code>ip helper-address</code> configure karo aur giaddr aur return route samjhao.</li>
<li><code>ip address dhcp</code> se router ko DHCP client banao aur AD 254 default route samjhao.</li>
<li><code>show ip dhcp binding</code>, <code>pool</code>, <code>conflict</code>, <code>server statistics</code>, <code>show ip interface</code>, <code>show dhcp lease</code> se verify karo.</li>
<li><code>ipconfig /all</code>, <code>ip addr</code>/<code>ip route</code>/<code>resolvectl</code>, aur macOS par <code>ipconfig getpacket</code> se client settings padho.</li>
<li>DNS hierarchy, recursive vs iterative queries, TTL aur caching samjhao.</li>
<li>A, AAAA, CNAME, MX, NS, PTR, TXT aur SOA sahi use karo aur nslookup aur dig se test karo.</li>
<li>IOS DNS client (<code>ip domain-lookup</code>, <code>ip name-server</code>, <code>ip domain-name</code>, <code>ip host</code>) configure karo aur <code>show hosts</code> se verify karo.</li>
<li>"Address nahi" aur "sirf IP se chalta hai" workflows chalao, troubleshoot lab ke dono faults samet.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>DORA</dt><dd>Discover, Offer, Request, Ack: chaar messages wala DHCP exchange.</dd>
<dt>Lease</dt><dd>Address ka time-limited loan; IOS default ek din.</dd>
<dt>Binding</dt><dd>Server ka IP se client ID/MAC aur expiry ka record.</dd>
<dt>Exclusion</dt><dd>Addresses ki global range jo server kabhi nahi deta.</dd>
<dt>Relay agent</dt><dd><code>ip helper-address</code> wala router interface jo DHCP broadcasts ko unicast ke roop mein forward karta hai.</dd>
<dt>giaddr</dt><dd>Relay ka set kiya gateway IP address field; server isse pool chunta hai.</dd>
<dt>APIPA</dt><dd>DHCP fail hone par khud ka diya 169.254.0.0/16 address.</dd>
<dt>Resolver</dt><dd>DNS server jo clients ko recursively jawab deta hai aur results cache karta hai.</dd>
<dt>Authoritative server</dt><dd>Woh server jiske paas zone ke records hain.</dd>
<dt>TTL</dt><dd>Kitne seconds tak jawab cache ho sakta hai.</dd>
<dt>FQDN</dt><dd>Root tak khatam hone wala poora naam, jaise www.nwk.lab.</dd>
<dt>NXDOMAIN</dt><dd>DNS jawab jiska matlab hai "yeh naam exist nahi karta".</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Ports</td><td>DHCP server UDP 67, client UDP 68; DNS UDP 53 (zone transfers aur bade jawabon ke liye TCP 53)</td></tr>
<tr><td>Discover</td><td>0.0.0.0 se 255.255.255.255, broadcast; Request bhi broadcast</td></tr>
<tr><td>Choice</td><td>Client pehla Offer leta hai</td></tr>
<tr><td>Timers</td><td>T1 = 50% unicast renew; T2 = 87.5% broadcast rebind</td></tr>
<tr><td>Exclusions</td><td>Global config, pool ke andar nahi</td></tr>
<tr><td>Relay</td><td>Client-facing interface; giaddr pool chunta hai; server ko wapas route chahiye</td></tr>
<tr><td>Relayed binding</td><td>Interface Unknown dikhata hai</td></tr>
<tr><td>Router client</td><td><code>ip address dhcp</code>; default route AD 254</td></tr>
<tr><td>IOS DNS</td><td>domain-lookup default mein on; server nahi = broadcast 255.255.255.255</td></tr>
<tr><td>Records</td><td>A IPv4, AAAA IPv6, CNAME alias, MX mail, NS authority, PTR reverse, TXT text</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! DHCP server (R1)</span>
ip dhcp excluded-address 192.168.10.1 192.168.10.20
ip dhcp pool LAN10
 network 192.168.10.0 255.255.255.0
 default-router 192.168.10.1
 dns-server 10.1.100.53
 domain-name nwk.lab
 lease 2 12
<span class="c">! relay (R2, client-facing)</span>
interface GigabitEthernet0/0
 ip helper-address 10.1.12.1
<span class="c">! router DHCP client ke roop mein</span>
interface GigabitEthernet0/2
 ip address dhcp
<span class="c">! IOS DNS client</span>
ip domain-lookup
ip name-server 10.1.100.53
ip domain-name nwk.lab
ip host SW-CAMPUS 192.168.10.2
<span class="c">! verification</span>
show ip dhcp binding | pool | conflict | server statistics
show ip interface GigabitEthernet0/0
show dhcp lease
show hosts</pre>

<div class="eg"><p><b>Worked example: ek minute ka self test.</b> Annex ka ek PC dikhata hai 192.168.20.25, gateway 192.168.20.1, DNS 10.1.100.53, DHCP server 10.1.12.1. Zor se bolo ki kis configuration ne har value possible banayi: R1 par pool LAN20 (network, default-router, dns-server), R2 Gi0/0 par helper 10.1.12.1, R1 par 192.168.20.0/24 ka wapas route, aur exclusions jinhone .1–.20 ko use hone se roka. Agar yeh bina notes ke kar paao, to yeh module aapka hai.</p></div>

<div class="warn"><p><b>Aakhri common galtiyan jinse bachna hai.</b> Galat mode mein ya poore subnet ko cover karte exclusions; uplink par helper; return route bhoolna; <code>ip name-server</code> ko pool ke <code>dns-server</code> se confuse karna; 169.254 address ke liye DNS ko blame karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Bahut se questions output dikhate hain aur poochte hain kya galat hai. Apni nazar train karo: <code>show ip dhcp pool</code> mein Excluded = Total; aisa helper address jo server ka nahi; Interface Unknown (normal); "Translating ... domain server (255.255.255.255)" (koi name server nahi); NXDOMAIN vs timeout.</p></div>

<div class="scn"><h4>Interview jo whiteboard ban gaya</h4><p>NOC role ke ek candidate se poocha gaya, "Naye floor ko 169.254 addresses mil rahe hain; kya check karoge?" Random commands list karne ki jagah usne whiteboard par path draw kiya: PC, access switch, helper wala SVI, core, DHCP server, aur har hop par saboot ka naam liya: <code>ipconfig /all</code>, port ka VLAN aur snooping trust, helper ke liye <code>show ip interface</code>, SVI se server tak ping, aur server ke statistics aur scope. Use usi din job mil gayi.</p><p><b>Seekh:</b> packet path ke saath structured sochna hi woh skill hai jo employers test karte hain.</p></div>

<div class="iv"><p class="q">"Laptop connect hone ke pal se www.nwk.lab khulne tak, end to end kya hota hai samjhao."</p><p>Link up; DORA (0.0.0.0 se broadcast Discover, address, gateway, DNS, lease ke saath Offer; broadcast Request; Ack), agar server remote hai to helper aur giaddr ke through relay; optional ARP check; laptop gateway ke liye ARP karta hai; option 6 wale DNS server se UDP 53 par query karta hai; resolver cache se ya iteratively jawab deta hai; phir laptop lautaye gaye address se gateway ke through TCP session kholta hai. Depth dikhane ke liye T1 par renewal ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DHCP DORA ke through UDP 67/68 par address, mask, gateway, DNS aur lease deta hai.</li>
<li>Exclusions global hain; pools interface ya giaddr se match hote hain; relays client-facing interfaces par jaate hain.</li>
<li>Server par binding, pool, conflict aur statistics se, aur clients par ipconfig/ip addr se verify karo.</li>
<li>DNS names ko hierarchy ke through recursive aur iterative queries se resolve karta hai, TTL tak cache karke.</li>
<li>Path ke saath troubleshoot karo: address nahi = DHCP path; sirf IP se chalta hai = DNS.</li>
</ul></div>
`}};export{e as default};