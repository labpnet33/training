var e={id:`onboarding`,h:{en:`Onboarding: identity, certificates, ZTP/PnP and control connections`,hi:`Onboarding: identity, certificates, ZTP/PnP aur control connections`},body:{en:`
<p>Joining an SD-WAN fabric is like a new employee joining a company. Security at reception checks the ID card (certificate) and whether the name is on today's visitor list (authorised serial list). The card must show the right company name (organization name). The employee gets a unique staff number (system-ip) and a desk in a particular office (site-id). Only then may they attend meetings (control connections) and do real work (data plane). If any one item is wrong, they stay in reception.</p>

<h3>The identity every edge carries</h3>
<table class="cmp"><tr><th>Item</th><th>What it is</th><th>Rule</th></tr>
<tr><td><b>system-ip</b></td><td>The device's identity in the overlay, written like an IPv4 address (a loopback-like "system" interface)</td><td>Unique in the whole fabric; used by OMP, TLOCs and BFD. Not a transport address.</td></tr>
<tr><td><b>site-id</b></td><td>Number identifying a physical site</td><td>Two edges in one branch share it; by default no tunnels are built between devices with the same site-id</td></tr>
<tr><td><b>organization-name</b></td><td>Your fabric's name</td><td>Must match the controllers and the certificate exactly, <b>case-sensitive</b></td></tr>
<tr><td><b>Validator address</b></td><td>IP or DNS name of the Validator (<code>vbond</code> in real CLI)</td><td>Must be reachable from at least one transport</td></tr>
<tr><td><b>Certificates</b></td><td>Device certificate plus trusted root chain</td><td>Hardware edges use a built-in chip certificate (SUDI); virtual edges use a one-time token; clocks must be correct</td></tr>
</table>
<p>The <b>authorised device list</b> (the serial or chassis numbers you bought, synced from Cisco's Plug and Play Connect portal or uploaded as a file) lives on the Manager, which shares it with Validators and Controllers. A device not on the list, or marked invalid, is rejected even with a perfect configuration.</p>

<h3>The bring-up sequence</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Onboarding sequence">
<rect x="10" y="90" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="120" text-anchor="middle" class="svg-ink" font-size="14">New edge</text>
<rect x="240" y="10" width="140" height="44" rx="8" fill="#fde68a"/><text x="310" y="37" text-anchor="middle" class="svg-ink" font-size="13">1-2 Validator</text>
<rect x="240" y="93" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="310" y="120" text-anchor="middle" class="svg-ink" font-size="13">3 Manager</text>
<rect x="240" y="176" width="140" height="44" rx="8" fill="#bae6fd"/><text x="310" y="203" text-anchor="middle" class="svg-ink" font-size="13">4 Controllers</text>
<line x1="120" y1="105" x2="240" y2="32" stroke="#64748b"/><line x1="120" y1="115" x2="240" y2="115" stroke="#64748b"/><line x1="120" y1="125" x2="240" y2="198" stroke="#64748b"/>
<text x="400" y="30" class="svg-muted" font-size="12">auth, controller list, NAT seen</text>
<text x="400" y="113" class="svg-muted" font-size="12">NETCONF: full config pushed</text>
<text x="400" y="196" class="svg-muted" font-size="12">OMP up, then BFD to other edges</text>
</svg><p class="cap">Validator first, then Manager, then Controllers. The Validator connection is dropped once the others are up.</p></div>
<ol>
<li>The edge gets an address, a default route and DNS on its transport interface (static or DHCP).</li>
<li>It opens DTLS to the <b>Validator</b>. Both sides check certificates, serial number and organization name. The Validator returns the Controller and Manager addresses and notes the edge's public IP and port.</li>
<li>The edge connects to the <b>Manager</b>, which pushes its full configuration (template or configuration group) via NETCONF.</li>
<li>The edge opens control connections to the <b>Controllers</b> over each transport that can reach them; OMP comes up and routes, TLOCs and policy flow.</li>
<li>BFD and IPsec tunnels form to other edges' TLOCs. The device is now "in the fabric".</li>
</ol>

<h3>Zero-touch: ZTP and PnP</h3>
<p>A factory-fresh Catalyst edge has no configuration. When plugged in, it gets DHCP on a WAN port and contacts Cisco's cloud <b>Plug and Play (PnP) Connect</b> service, which knows (from your order) which organization and Validator the serial number belongs to and redirects it there. Legacy vEdges used a similar cloud <b>ZTP</b> server. Where DHCP or internet is unavailable, the Manager can generate a <b>bootstrap file</b> you copy to the device's flash or USB, or an engineer can type a minimal bootstrap by hand.</p>

<h3>Manual bootstrap on an IOS XE edge</h3>
<pre class="code"><span class="c">! Router# controller-mode enable   (converts an IOS XE router to SD-WAN mode, reloads)</span>
Router# config-transaction
Router(config)# system
Router(config-system)#  system-ip 10.255.0.12
Router(config-system)#  site-id 200
Router(config-system)#  organization-name NK-FABRIC
Router(config-system)#  vbond 203.0.113.2
Router(config)# interface GigabitEthernet0/0
Router(config-if)#  ip address 198.51.100.6 255.255.255.252
Router(config)# ip route 0.0.0.0 0.0.0.0 198.51.100.5
Router(config)# interface Tunnel0
Router(config-if)#  ip unnumbered GigabitEthernet0/0
Router(config-if)#  tunnel source GigabitEthernet0/0
Router(config-if)#  tunnel mode sdwan
Router(config)# sdwan
Router(config-sdwan)#  interface GigabitEthernet0/0
Router(config-interface-GigabitEthernet0/0)#   tunnel-interface
Router(config-tunnel-interface)#    encapsulation ipsec
Router(config-tunnel-interface)#    color biz-internet
Router(config)# commit</pre>
<p>In SD-WAN mode IOS XE uses a transactional configuration: nothing applies until <code>commit</code>. In the lab the simulator accepts plain <code>configure terminal</code>, and the controller address is written <code>controller-address 203.0.113.2</code> (<code>vbond</code> is accepted as an alias).</p>

<h3>Verifying identity and control connections</h3>
<pre class="out">EDGE2# show sdwan control local-properties
personality                       edge
<span class="hl">organization-name                 NK-Fabric</span>
<span class="hl">system-ip                         10.255.0.11</span>
site-id                           200
controller-address                203.0.113.2:12346
number-active-control-connections 0

INTERFACE             IPv4 ADDRESS        COLOR           STATE  ENCAP  CONTROL
GigabitEthernet0/0    198.51.100.6/30     biz-internet    up     ipsec  no
GigabitEthernet0/1    172.16.2.2/30       mpls            up     ipsec  no</pre>
<p>Two problems are visible before you even look at errors: the organization name has the wrong case, and the system-ip is EDGE1's. The error codes in <code>show sdwan control connections</code> and <code>show sdwan control connection-history</code> tell you which check failed:</p>
<table class="cmp"><tr><th>Lab code</th><th>Meaning</th><th>Real-platform equivalent</th></tr>
<tr><td>DCONFAIL</td><td>DTLS failed: controller unreachable on that transport</td><td>DCONFAIL</td></tr>
<tr><td>ORGMISMATCH</td><td>Organization name differs</td><td>CTORGNMMIS (certificate org name mismatch)</td></tr>
<tr><td>SYSIPDUP</td><td>system-ip already in use</td><td>Duplicate system-IP alarm; connection torn down</td></tr>
<tr><td>NOSYSIP / NOSITEID / NOCTRLADDR</td><td>Identity item missing</td><td>Nothing is attempted</td></tr>
<tr><td>—</td><td>Serial not on the authorised list</td><td>BIDNTVRFD (board ID not verified)</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Cloning a working router's configuration to stage a new one (duplicate system-ip, wrong site-id). Typing the organization name with different capitalisation. Forgetting NTP, so certificates look "not yet valid". Forgetting to move the device to <i>valid</i> in the Manager's device list.</p></div>

<div class="exam"><p><b>Exam traps.</b> The system-ip is <b>not</b> required to be routable on the underlay; it is an identifier. Devices at the <b>same site</b> share a site-id. The Validator must be reachable on a public or static-NAT address. The first device an edge talks to is always the Validator.</p></div>

<div class="scn"><h4>Forty stores, one spreadsheet error</h4><p>A retail chain onboarded 40 stores in one night with a bootstrap spreadsheet. Thirty-nine came up. One store's router kept flapping, and so did store 17, which had been fine all week. The dashboard showed both using system-ip 10.255.1.17: someone had copied a row. Whichever device connected last pushed the other out. Correcting the spreadsheet variable and re-pushing the template fixed both.</p><p><b>Lesson:</b> the system-ip is the router's identity in the overlay. Duplicates do not just break the new device; they destabilise the healthy one.</p></div>

<div class="iv"><p class="q">"Walk me through how a new WAN edge joins the fabric."</p><p>Strong answer: transport IP and default route first; DTLS to the Validator with mutual certificate check, serial in the authorised list and matching organization name; the Validator hands out Controller and Manager addresses and handles NAT discovery; the Manager pushes configuration via NETCONF; control connections to the Controllers bring up OMP; then BFD and IPsec to other edges. Mention PnP/ZTP for zero-touch and that system-ip must be unique and the org name case-sensitive.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Identity = unique system-ip, site-id, exact organization-name, Validator address, valid certificate.</li>
<li>Order of contact: Validator, Manager, Controllers, then other edges.</li>
<li>Devices must be on the authorised device list and marked valid.</li>
<li>PnP/ZTP, bootstrap files or a manual CLI bootstrap get a device to the Validator.</li>
<li>Read error codes with <code>show sdwan control connections</code> and <code>connection-history</code>.</li>
</ul></div>
`,hi:`
<p>SD-WAN fabric join karna ek naye employee ke company join karne jaisa hai. Reception par security ID card (certificate) check karti hai aur dekhti hai ki naam aaj ki visitor list (authorised serial list) mein hai ya nahi. Card par sahi company ka naam (organization name) hona chahiye. Employee ko ek unique staff number (system-ip) aur ek particular office mein desk (site-id) milta hai. Tabhi woh meetings (control connections) attend kar sakta hai aur asli kaam (data plane) kar sakta hai. Agar ek bhi cheez galat ho, to woh reception mein hi baitha rehta hai.</p>

<h3>Har edge ki identity</h3>
<table class="cmp"><tr><th>Item</th><th>Yeh kya hai</th><th>Rule</th></tr>
<tr><td><b>system-ip</b></td><td>Overlay mein device ki identity, IPv4 address ki tarah likhi jaati hai (loopback jaisa "system" interface)</td><td>Poore fabric mein unique; OMP, TLOCs aur BFD ise use karte hain. Yeh transport address nahi hai.</td></tr>
<tr><td><b>site-id</b></td><td>Physical site ko pehchanne wala number</td><td>Ek branch ke do edges ise share karte hain; default mein same site-id wale devices ke beech tunnels nahi bante</td></tr>
<tr><td><b>organization-name</b></td><td>Aapke fabric ka naam</td><td>Controllers aur certificate se bilkul match hona chahiye, <b>case-sensitive</b></td></tr>
<tr><td><b>Validator address</b></td><td>Validator ka IP ya DNS naam (real CLI mein <code>vbond</code>)</td><td>Kam se kam ek transport se reachable hona chahiye</td></tr>
<tr><td><b>Certificates</b></td><td>Device certificate aur trusted root chain</td><td>Hardware edges built-in chip certificate (SUDI) use karte hain; virtual edges one-time token; clocks sahi hone chahiye</td></tr>
</table>
<p><b>Authorised device list</b> (aapke khareede gaye serial ya chassis numbers, Cisco ke Plug and Play Connect portal se sync ya file ki tarah upload) Manager par rehti hai, jo ise Validators aur Controllers ke saath share karta hai. Jo device list mein nahi hai, ya invalid mark hai, woh perfect configuration ke saath bhi reject hota hai.</p>

<h3>Bring-up sequence</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Onboarding sequence">
<rect x="10" y="90" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="120" text-anchor="middle" class="svg-ink" font-size="14">Naya edge</text>
<rect x="240" y="10" width="140" height="44" rx="8" fill="#fde68a"/><text x="310" y="37" text-anchor="middle" class="svg-ink" font-size="13">1-2 Validator</text>
<rect x="240" y="93" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="310" y="120" text-anchor="middle" class="svg-ink" font-size="13">3 Manager</text>
<rect x="240" y="176" width="140" height="44" rx="8" fill="#bae6fd"/><text x="310" y="203" text-anchor="middle" class="svg-ink" font-size="13">4 Controllers</text>
<line x1="120" y1="105" x2="240" y2="32" stroke="#64748b"/><line x1="120" y1="115" x2="240" y2="115" stroke="#64748b"/><line x1="120" y1="125" x2="240" y2="198" stroke="#64748b"/>
<text x="400" y="30" class="svg-muted" font-size="12">auth, controller list, NAT dekha</text>
<text x="400" y="113" class="svg-muted" font-size="12">NETCONF: poora config push</text>
<text x="400" y="196" class="svg-muted" font-size="12">OMP up, phir doosre edges tak BFD</text>
</svg><p class="cap">Pehle Validator, phir Manager, phir Controllers. Baaki up hote hi Validator connection chhod diya jaata hai.</p></div>
<ol>
<li>Edge apne transport interface par address, default route aur DNS leta hai (static ya DHCP).</li>
<li>Yeh <b>Validator</b> tak DTLS kholta hai. Dono sides certificates, serial number aur organization name check karti hain. Validator Controller aur Manager ke addresses lautata hai aur edge ka public IP aur port note karta hai.</li>
<li>Edge <b>Manager</b> se connect hota hai, jo NETCONF se uski poori configuration (template ya configuration group) push karta hai.</li>
<li>Edge har us transport par <b>Controllers</b> tak control connections kholta hai jo unhe reach kar sake; OMP up hota hai aur routes, TLOCs aur policy aane lagte hain.</li>
<li>Doosre edges ke TLOCs tak BFD aur IPsec tunnels bante hain. Ab device "fabric mein" hai.</li>
</ol>

<h3>Zero-touch: ZTP aur PnP</h3>
<p>Factory-fresh Catalyst edge par koi configuration nahi hoti. Plug hone par yeh WAN port par DHCP leta hai aur Cisco ki cloud <b>Plug and Play (PnP) Connect</b> service se contact karta hai, jo (aapke order se) jaanti hai ki serial number kis organization aur Validator ka hai aur use wahan redirect karti hai. Purane vEdges isi tarah ka cloud <b>ZTP</b> server use karte the. Jahan DHCP ya internet nahi hai, wahan Manager ek <b>bootstrap file</b> bana sakta hai jise aap device ke flash ya USB par copy karte ho, ya engineer haath se chhota bootstrap type kar sakta hai.</p>

<h3>IOS XE edge par manual bootstrap</h3>
<pre class="code"><span class="c">! Router# controller-mode enable   (IOS XE router ko SD-WAN mode mein badalta hai, reload hota hai)</span>
Router# config-transaction
Router(config)# system
Router(config-system)#  system-ip 10.255.0.12
Router(config-system)#  site-id 200
Router(config-system)#  organization-name NK-FABRIC
Router(config-system)#  vbond 203.0.113.2
Router(config)# interface GigabitEthernet0/0
Router(config-if)#  ip address 198.51.100.6 255.255.255.252
Router(config)# ip route 0.0.0.0 0.0.0.0 198.51.100.5
Router(config)# interface Tunnel0
Router(config-if)#  ip unnumbered GigabitEthernet0/0
Router(config-if)#  tunnel source GigabitEthernet0/0
Router(config-if)#  tunnel mode sdwan
Router(config)# sdwan
Router(config-sdwan)#  interface GigabitEthernet0/0
Router(config-interface-GigabitEthernet0/0)#   tunnel-interface
Router(config-tunnel-interface)#    encapsulation ipsec
Router(config-tunnel-interface)#    color biz-internet
Router(config)# commit</pre>
<p>SD-WAN mode mein IOS XE transactional configuration use karta hai: <code>commit</code> tak kuch apply nahi hota. Lab mein simulator seedha <code>configure terminal</code> accept karta hai, aur controller address <code>controller-address 203.0.113.2</code> likha jaata hai (<code>vbond</code> alias ki tarah accept hota hai).</p>

<h3>Identity aur control connections verify karna</h3>
<pre class="out">EDGE2# show sdwan control local-properties
personality                       edge
<span class="hl">organization-name                 NK-Fabric</span>
<span class="hl">system-ip                         10.255.0.11</span>
site-id                           200
controller-address                203.0.113.2:12346
number-active-control-connections 0

INTERFACE             IPv4 ADDRESS        COLOR           STATE  ENCAP  CONTROL
GigabitEthernet0/0    198.51.100.6/30     biz-internet    up     ipsec  no
GigabitEthernet0/1    172.16.2.2/30       mpls            up     ipsec  no</pre>
<p>Errors dekhne se pehle hi do problems dikh rahi hain: organization name ka case galat hai, aur system-ip EDGE1 ka hai. <code>show sdwan control connections</code> aur <code>show sdwan control connection-history</code> ke error codes batate hain ki kaunsa check fail hua:</p>
<table class="cmp"><tr><th>Lab code</th><th>Matlab</th><th>Real platform mein</th></tr>
<tr><td>DCONFAIL</td><td>DTLS fail: us transport par controller unreachable</td><td>DCONFAIL</td></tr>
<tr><td>ORGMISMATCH</td><td>Organization name alag hai</td><td>CTORGNMMIS (certificate org name mismatch)</td></tr>
<tr><td>SYSIPDUP</td><td>system-ip pehle se use mein hai</td><td>Duplicate system-IP alarm; connection tod diya jaata hai</td></tr>
<tr><td>NOSYSIP / NOSITEID / NOCTRLADDR</td><td>Identity item missing</td><td>Kuch try hi nahi hota</td></tr>
<tr><td>—</td><td>Serial authorised list mein nahi</td><td>BIDNTVRFD (board ID not verified)</td></tr>
</table>

<div class="warn"><p><b>Common galtiyan.</b> Naya router stage karne ke liye chalte router ki configuration clone karna (duplicate system-ip, galat site-id). Organization name alag capitalisation mein type karna. NTP bhoolna, jisse certificates "not yet valid" dikhte hain. Manager ki device list mein device ko <i>valid</i> par le jaana bhoolna.</p></div>

<div class="exam"><p><b>Exam traps.</b> System-ip ka underlay par routable hona <b>zaroori nahi</b>; yeh ek identifier hai. <b>Same site</b> ke devices site-id share karte hain. Validator public ya static-NAT address par reachable hona chahiye. Edge sabse pehle hamesha Validator se baat karta hai.</p></div>

<div class="scn"><h4>Chaalees stores, ek spreadsheet error</h4><p>Ek retail chain ne ek raat mein bootstrap spreadsheet se 40 stores onboard kiye. Unchaalees up aa gaye. Ek store ka router flap karta raha, aur store 17 bhi, jo poore hafte theek tha. Dashboard ne dikhaya ki dono system-ip 10.255.1.17 use kar rahe the: kisi ne row copy kar di thi. Jo device aakhir mein connect hota, woh doosre ko bahar dhakel deta. Spreadsheet variable theek karke template dobara push karne se dono theek ho gaye.</p><p><b>Seekh:</b> system-ip overlay mein router ki identity hai. Duplicates sirf naye device ko nahi todte; healthy wale ko bhi unstable kar dete hain.</p></div>

<div class="iv"><p class="q">"Mujhe batao ki naya WAN edge fabric kaise join karta hai."</p><p>Strong answer: pehle transport IP aur default route; phir Validator tak DTLS, mutual certificate check, authorised list mein serial aur matching organization name; Validator Controller aur Manager ke addresses deta hai aur NAT discovery sambhalta hai; Manager NETCONF se configuration push karta hai; Controllers tak control connections OMP up karte hain; phir doosre edges tak BFD aur IPsec. Zero-touch ke liye PnP/ZTP ka zikr karo aur yeh ki system-ip unique aur org name case-sensitive hona chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Identity = unique system-ip, site-id, exact organization-name, Validator address, valid certificate.</li>
<li>Contact ka order: Validator, Manager, Controllers, phir doosre edges.</li>
<li>Devices authorised device list mein hone chahiye aur valid mark hone chahiye.</li>
<li>PnP/ZTP, bootstrap files ya manual CLI bootstrap device ko Validator tak pahunchate hain.</li>
<li>Error codes <code>show sdwan control connections</code> aur <code>connection-history</code> se padho.</li>
</ul></div>
`}};export{e as default};