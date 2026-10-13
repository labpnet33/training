var e={id:`headend-networking`,h:{en:`Headend networking: interfaces, DMZ, firewall rules and addresses`,hi:`Headend networking: interfaces, DMZ, firewall rules aur addresses`},body:{en:`
<p>A headend is like a <b>bank's head office</b>: customers (branches) come in through a public lobby, staff work in a secure back office, and a guard decides who may walk from the lobby to which room. Designing the headend network means deciding what is in the lobby (reachable from outside), what is in the back office (management), and what rules the guard enforces.</p>

<h3>Interfaces on headend nodes</h3>
<dl class="terms">
<dt>Management (northbound) interface</dt><dd>Used by administrators and APIs to reach Director GUI and CLI, and Analytics. It stays on the internal management network, not on the Internet.</dd>
<dt>Southbound / control interface</dt><dd>Used by the Director to talk to Controllers and devices, and by the Controller to talk to branches over WAN transports. Controllers need addresses reachable from the branches' underlay.</dd>
<dt>HA / synchronisation interface</dt><dd>Used between the two Directors (or Analytics nodes) of a pair for database sync and heartbeat. Isolated.</dd>
</dl>
<p>Real Director nodes typically have separate northbound and southbound interfaces so that the management plane for users never shares a network with devices that sit on the far side of the Internet. The course lab simplifies this: all three nodes sit in the Mumbai headend LAN <code>198.51.100.0/24</code> behind router DCR (<code>.1</code>), with the Controller having two addresses.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Headend network">
<rect x="20" y="20" width="330" height="260" rx="12" fill="#e2e8f0"/><text x="35" y="42" class="svg-accent" font-size="13">Mumbai headend LAN 198.51.100.0/24</text>
<rect x="40" y="60" width="130" height="44" rx="8" fill="#ddd6fe"/><text x="105" y="80" text-anchor="middle" class="svg-ink" font-size="12">Director-1</text><text x="105" y="96" text-anchor="middle" class="svg-muted" font-size="12">.10  vni-0/0</text>
<rect x="190" y="60" width="140" height="44" rx="8" fill="#fde68a"/><text x="260" y="80" text-anchor="middle" class="svg-ink" font-size="12">Analytics-1</text><text x="260" y="96" text-anchor="middle" class="svg-muted" font-size="12">.30  vni-0/0</text>
<rect x="40" y="150" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="125" y="172" text-anchor="middle" class="svg-ink" font-size="12">Controller-1</text><text x="125" y="188" text-anchor="middle" class="svg-muted" font-size="12">.20 vni-0/0 (Internet)</text><text x="125" y="202" text-anchor="middle" class="svg-muted" font-size="12">172.31.100.2 vni-0/1 (MPLS)</text>
<rect x="230" y="150" width="100" height="40" rx="8" fill="#fed7aa"/><text x="280" y="175" text-anchor="middle" class="svg-ink" font-size="12">DCSW</text>
<rect x="400" y="60" width="100" height="44" rx="8" fill="#fed7aa"/><text x="450" y="86" text-anchor="middle" class="svg-ink" font-size="12">DCR  .1</text>
<rect x="540" y="30" width="80" height="44" rx="22" fill="#bae6fd"/><text x="580" y="57" text-anchor="middle" class="svg-ink" font-size="12">INET</text>
<rect x="540" y="180" width="80" height="44" rx="22" fill="#bae6fd"/><text x="580" y="207" text-anchor="middle" class="svg-ink" font-size="12">MPLS</text>
<line x1="350" y1="85" x2="400" y2="85" stroke="#64748b" stroke-width="2.5"/><line x1="500" y1="75" x2="540" y2="55" stroke="#64748b" stroke-width="2.5"/>
<line x1="210" y1="190" x2="540" y2="202" stroke="#64748b" stroke-width="2.5"/><text x="450" y="230" class="svg-muted" font-size="12">172.31.100.0/30</text>
<text x="450" y="130" class="svg-muted" font-size="12">DCR to INET 203.0.113.0/30</text>
</svg><p class="cap">The lab headend. The Controller attaches directly to the MPLS provider with its own /30.</p></div>

<h3>Why the Controller has Internet and MPLS addresses</h3>
<p>A branch builds a tunnel to an <b>IP address</b>. A circuit can only carry packets to addresses reachable through that provider. An Internet circuit reaches the Controller's public-side address <code>198.51.100.20</code> (via DCR and the Internet). An MPLS circuit is a private WAN: the branch's MPLS-Transport-VR route <code>172.31.0.0/16</code> leads to the PE, and the Controller sits on <code>172.31.100.0/30</code> with address <code>172.31.100.2</code>. In real Versa a Controller has one interface per transport domain for exactly this reason. LTE has no own Controller interface: LTE reaches the Internet address.</p>

<h3>DMZ and firewall rules</h3>
<p>The Controller faces untrusted networks, so in real networks it sits in a <b>DMZ</b> behind a firewall. Typical rules (always verify against the current product documentation for your release):</p>
<table class="cmp"><tr><th>Flow</th><th>From to</th><th>Typical ports</th></tr>
<tr><td>IKE negotiation and IPsec NAT-traversal</td><td>Branches to Controller</td><td>UDP 500, UDP 4500, IP protocol ESP (50)</td></tr>
<tr><td>Management of devices</td><td>Director to Controller and branches</td><td>SSH and NETCONF</td></tr>
<tr><td>Admin and API access</td><td>Operators and Concerto to Director</td><td>HTTPS (443) and the API port</td></tr>
<tr><td>Log export</td><td>Branches to Analytics</td><td>Collector port (lab 1234)</td></tr>
<tr><td>Everything else from Internet</td><td>to headend</td><td>Deny</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Delhi's Internet interface is <code>203.0.113.6</code>, its tunnel destination is <code>198.51.100.20</code>. At DCR the packet arrives from INET <code>203.0.113.0/30</code> side and must be forwarded to the headend LAN. If a firewall in front of Controller-1 allows only UDP 500 but not UDP 4500, NAT'ed branches fail while public-addressed branches succeed. That symptom pattern points to the firewall.</p></div>

<h3>Verify headend addressing</h3>
<pre class="out">admin@Controller-1-cli&gt; show interfaces brief
Interface   Admin   Oper    Address
vni-0/0     up      up      <span class="hl">198.51.100.20/24</span>
vni-0/1     up      up      <span class="hl">172.31.100.2/30</span>

admin@Controller-1-cli&gt; ping 198.51.100.10
!!!!!
5 packets transmitted, 5 received</pre>

<div class="note"><p><b>Course model.</b> The firewall rules and the separate interfaces are explained for real designs; the lab has no DMZ firewall and one management network. The lab command to prove management reachability is <code>ping</code> and the Director status commands.</p></div>

<div class="warn"><p><b>Common mistake.</b> Exposing the Director GUI to the Internet. The Controller needs to be reachable by branches; the Director does not. Keep management private or behind a VPN.</p></div>

<div class="exam"><p><b>Exam trap.</b> Controller addresses are what branches use as their "controller" setting. If you hand branches a management address that sits behind a private network, no tunnel can form.</p></div>

<div class="scn"><h4>Branches behind NAT cannot join</h4><p>After a new data-centre firewall went live, branches with public addresses joined, while branches behind carrier NAT stayed Idle. Packet captures at the firewall showed IKE on UDP 500 only. UDP 4500 was blocked, so NAT-traversal failed. Opening UDP 4500 (and allowing ESP where relevant) fixed it.</p><p><b>Lesson:</b> the pattern "some branches yes, some no" suggests a path property such as NAT or a port, not a bad template.</p></div>

<div class="iv"><p class="q">"Why does the Versa Controller usually have a presence in each transport?"</p><p>Each branch tunnel needs a destination reachable through that transport: Internet addresses for Internet circuits, a private address on the MPLS side for MPLS. Therefore one WAN interface (and transport domain) per transport. Mention DMZ placement and the ports to open.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Separate management, southbound/control and HA interfaces in real designs.</li>
<li>The Controller needs an address on every transport it serves; LTE uses the Internet address.</li>
<li>Controller sits in a DMZ; open IKE (UDP 500/4500) and ESP; keep Director private.</li>
<li>Lab headend: Director .10, Controller .20 and 172.31.100.2, Analytics .30.</li>
</ul></div>
`,hi:`
<p>Headend ek <b>bank ke head office</b> jaisa hai: customers (branches) public lobby se aate hain, staff secure back office mein kaam karta hai, aur ek guard tay karta hai ki lobby se kaun kis kamre mein ja sakta hai. Headend network design karne ka matlab hai tay karna ki lobby mein kya hoga (bahar se reachable), back office mein kya (management), aur guard kaunse rules lagayega.</p>

<h3>Headend nodes ke interfaces</h3>
<dl class="terms">
<dt>Management (northbound) interface</dt><dd>Administrators aur APIs Director GUI aur CLI, aur Analytics tak pahunchne ke liye use karte hain. Yeh internal management network par rehta hai, Internet par nahi.</dd>
<dt>Southbound / control interface</dt><dd>Director Controllers aur devices se baat karne ke liye, aur Controller WAN transports ke through branches se baat karne ke liye use karta hai. Controllers ko aise addresses chahiye jo branches ke underlay se reachable hon.</dd>
<dt>HA / synchronisation interface</dt><dd>Do Directors (ya Analytics nodes) ke pair ke beech database sync aur heartbeat ke liye. Isolated.</dd>
</dl>
<p>Real Director nodes mein aam taur par alag northbound aur southbound interfaces hote hain, taaki users ka management plane kabhi us network se share na ho jahan Internet ke doosri taraf ke devices baithe hain. Course lab ise simple karta hai: teeno nodes Mumbai headend LAN <code>198.51.100.0/24</code> mein router DCR (<code>.1</code>) ke peeche hain, aur Controller ke paas do addresses hain.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Headend network">
<rect x="20" y="20" width="330" height="260" rx="12" fill="#e2e8f0"/><text x="35" y="42" class="svg-accent" font-size="13">Mumbai headend LAN 198.51.100.0/24</text>
<rect x="40" y="60" width="130" height="44" rx="8" fill="#ddd6fe"/><text x="105" y="80" text-anchor="middle" class="svg-ink" font-size="12">Director-1</text><text x="105" y="96" text-anchor="middle" class="svg-muted" font-size="12">.10  vni-0/0</text>
<rect x="190" y="60" width="140" height="44" rx="8" fill="#fde68a"/><text x="260" y="80" text-anchor="middle" class="svg-ink" font-size="12">Analytics-1</text><text x="260" y="96" text-anchor="middle" class="svg-muted" font-size="12">.30  vni-0/0</text>
<rect x="40" y="150" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="125" y="172" text-anchor="middle" class="svg-ink" font-size="12">Controller-1</text><text x="125" y="188" text-anchor="middle" class="svg-muted" font-size="12">.20 vni-0/0 (Internet)</text><text x="125" y="202" text-anchor="middle" class="svg-muted" font-size="12">172.31.100.2 vni-0/1 (MPLS)</text>
<rect x="230" y="150" width="100" height="40" rx="8" fill="#fed7aa"/><text x="280" y="175" text-anchor="middle" class="svg-ink" font-size="12">DCSW</text>
<rect x="400" y="60" width="100" height="44" rx="8" fill="#fed7aa"/><text x="450" y="86" text-anchor="middle" class="svg-ink" font-size="12">DCR  .1</text>
<rect x="540" y="30" width="80" height="44" rx="22" fill="#bae6fd"/><text x="580" y="57" text-anchor="middle" class="svg-ink" font-size="12">INET</text>
<rect x="540" y="180" width="80" height="44" rx="22" fill="#bae6fd"/><text x="580" y="207" text-anchor="middle" class="svg-ink" font-size="12">MPLS</text>
<line x1="350" y1="85" x2="400" y2="85" stroke="#64748b" stroke-width="2.5"/><line x1="500" y1="75" x2="540" y2="55" stroke="#64748b" stroke-width="2.5"/>
<line x1="210" y1="190" x2="540" y2="202" stroke="#64748b" stroke-width="2.5"/><text x="450" y="230" class="svg-muted" font-size="12">172.31.100.0/30</text>
<text x="450" y="130" class="svg-muted" font-size="12">DCR se INET 203.0.113.0/30</text>
</svg><p class="cap">Lab headend. Controller MPLS provider se apne /30 ke saath seedha attached hai.</p></div>

<h3>Controller ke paas Internet aur MPLS addresses kyun hain</h3>
<p>Branch ek <b>IP address</b> tak tunnel banata hai. Circuit sirf un addresses tak packets le ja sakta hai jo us provider ke through reachable hain. Internet circuit Controller ke public-side address <code>198.51.100.20</code> tak pahunchta hai (DCR aur Internet se). MPLS circuit private WAN hai: branch ke MPLS-Transport-VR ka route <code>172.31.0.0/16</code> PE ki taraf jaata hai, aur Controller <code>172.31.100.0/30</code> par address <code>172.31.100.2</code> ke saath baitha hai. Real Versa mein Controller ke paas har transport domain ke liye ek interface hota hai, isi wajah se. LTE ka apna Controller interface nahi hota: LTE Internet address tak pahunchta hai.</p>

<h3>DMZ aur firewall rules</h3>
<p>Controller untrusted networks ka samna karta hai, isliye real networks mein woh firewall ke peeche <b>DMZ</b> mein hota hai. Typical rules (apne release ke product documentation se hamesha verify karo):</p>
<table class="cmp"><tr><th>Flow</th><th>Kahan se kahan</th><th>Typical ports</th></tr>
<tr><td>IKE negotiation aur IPsec NAT-traversal</td><td>Branches se Controller</td><td>UDP 500, UDP 4500, IP protocol ESP (50)</td></tr>
<tr><td>Devices ka management</td><td>Director se Controller aur branches</td><td>SSH aur NETCONF</td></tr>
<tr><td>Admin aur API access</td><td>Operators aur Concerto se Director</td><td>HTTPS (443) aur API port</td></tr>
<tr><td>Log export</td><td>Branches se Analytics</td><td>Collector port (lab 1234)</td></tr>
<tr><td>Internet se baaki sab</td><td>headend ko</td><td>Deny</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Delhi ka Internet interface <code>203.0.113.6</code> hai, uska tunnel destination <code>198.51.100.20</code> hai. DCR par packet INET <code>203.0.113.0/30</code> side se aata hai aur headend LAN ko forward hona chahiye. Agar Controller-1 ke aage firewall sirf UDP 500 allow kare lekin UDP 4500 nahi, to NAT wali branches fail hongi jabki public-address wali succeed. Yeh symptom pattern firewall ki taraf ishara karta hai.</p></div>

<h3>Headend addressing verify karo</h3>
<pre class="out">admin@Controller-1-cli&gt; show interfaces brief
Interface   Admin   Oper    Address
vni-0/0     up      up      <span class="hl">198.51.100.20/24</span>
vni-0/1     up      up      <span class="hl">172.31.100.2/30</span>

admin@Controller-1-cli&gt; ping 198.51.100.10
!!!!!
5 packets transmitted, 5 received</pre>

<div class="note"><p><b>Course model.</b> Firewall rules aur alag interfaces real designs ke liye samjhaye gaye hain; lab mein DMZ firewall nahi hai aur ek hi management network hai. Management reachability prove karne ka lab command <code>ping</code> aur Director status commands hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Director GUI ko Internet par expose karna. Controller ko branches se reachable hona chahiye; Director ko nahi. Management ko private rakho ya VPN ke peeche.</p></div>

<div class="exam"><p><b>Exam trap.</b> Controller addresses wahi hain jo branches apne "controller" setting mein use karte hain. Agar branches ko aisa management address do jo private network ke peeche hai, to koi tunnel nahi ban sakta.</p></div>

<div class="scn"><h4>NAT ke peeche wali branches join nahi kar paati</h4><p>Naya data-centre firewall live hone ke baad public addresses wali branches join ho gayi, jabki carrier NAT ke peeche wali Idle rahi. Firewall par packet capture mein sirf UDP 500 par IKE dikha. UDP 4500 blocked tha, isliye NAT-traversal fail hua. UDP 4500 kholne (aur jahan zaroori ho ESP allow karne) se fix ho gaya.</p><p><b>Lesson:</b> "kuch branches haan, kuch nahi" wala pattern path property jaise NAT ya port ki taraf ishara karta hai, kharab template ki taraf nahi.</p></div>

<div class="iv"><p class="q">"Versa Controller ki har transport mein presence kyun hoti hai?"</p><p>Har branch tunnel ko aisi destination chahiye jo us transport se reachable ho: Internet circuits ke liye Internet addresses, MPLS ke liye MPLS side par private address. Isliye har transport ke liye ek WAN interface (aur transport domain). DMZ placement aur kholne wale ports ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Real designs mein management, southbound/control aur HA interfaces alag hote hain.</li>
<li>Controller ko har transport par address chahiye jo woh serve karta hai; LTE Internet address use karta hai.</li>
<li>Controller DMZ mein; IKE (UDP 500/4500) aur ESP kholo; Director private rakho.</li>
<li>Lab headend: Director .10, Controller .20 aur 172.31.100.2, Analytics .30.</li>
</ul></div>
`}};export{e as default};