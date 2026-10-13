var e={id:`ip-source-guard`,h:{en:`IP spoofing and IP Source Guard`,hi:`IP spoofing aur IP Source Guard`},body:{en:`
<p>A courier counter normally accepts any parcel, whatever sender address is written on it. That lets a prankster send parcels "from" his neighbour. A stricter counter checks the sender's ID card against the address on the parcel and refuses anything that does not match. <b>IP Source Guard (IPSG)</b> turns a switch port into that strict counter: every IP packet entering an access port must carry the source address that port is known to own.</p>

<h3>IP spoofing at recognition level</h3>
<p><b>IP spoofing</b> means sending packets with a forged source IP address. On a LAN, attackers use it to impersonate a trusted host that an ACL or a server allows by IP address, to hide where traffic comes from, or to aim reflected replies at a victim. Nothing in IP itself checks the source, and a normal switch forwards frames on MAC addresses without looking at IP at all.</p>
<p><b>What the defender sees:</b> packets from an IP that was never leased on that port, "duplicate address" warnings on the gateway, and ACL hits from a trusted IP at odd times.</p>
<pre class="out"><span class="hl">%IP-4-DUPADDR: Duplicate address 10.0.10.5 on Vlan10, sourced by 00de.ad00.00d4</span></pre>

<h3>How IP Source Guard works</h3>
<p>IPSG is enabled per interface on untrusted access ports with <code>ip verify source</code>. The switch builds a <b>per-port filter</b> from the DHCP snooping binding table (and static <code>ip source binding</code> entries):</p>
<ul>
<li>Before a host has a binding, the port permits only DHCP, so the host can still obtain its lease; all other IP is dropped.</li>
<li>When snooping records a lease, the filter automatically permits that source IP on that port; when the lease ends, the permit is removed.</li>
<li>Packets with any other source IP are silently dropped in hardware.</li>
</ul>
<p>Two filter types exist. <code>ip verify source</code> checks the <b>source IP</b> only. <code>ip verify source port-security</code> checks <b>source IP and source MAC</b>, and requires port security on the port (some newer platforms call the MAC check <code>mac-check</code>). IPSG therefore depends on DHCP snooping running in the VLAN, exactly like DAI.</p>

<table class="cmp"><tr><th></th><th>DAI</th><th>IP Source Guard</th></tr>
<tr><td>Inspects</td><td>ARP packets</td><td>IP packets (source IP, optionally MAC)</td></tr>
<tr><td>Stops</td><td>ARP poisoning, MITM</td><td>IP spoofing</td></tr>
<tr><td>Enabled</td><td>Per VLAN, trust per port</td><td>Per interface</td></tr>
<tr><td>Data source</td><td>ARP ACLs, snooping bindings</td><td>Snooping bindings, static bindings</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IP Source Guard per-port filter">
<rect x="230" y="20" width="180" height="60" rx="8" fill="#bae6fd"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="14">ACC3 binding table</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1 = 10.0.10.10</text>
<rect x="40" y="150" width="200" height="54" rx="8" fill="#bbf7d0"/><text x="140" y="172" text-anchor="middle" class="svg-ink" font-size="13">PC1 src 10.0.10.10</text><text x="140" y="190" text-anchor="middle" class="svg-muted" font-size="12">matches: forwarded</text>
<rect x="400" y="150" width="200" height="54" rx="8" fill="#fed7aa"/><text x="500" y="172" text-anchor="middle" class="svg-ink" font-size="13">ATK src 10.0.10.5</text><text x="500" y="190" text-anchor="middle" class="svg-accent" font-size="12">no binding: dropped</text>
<line x1="280" y1="80" x2="160" y2="150" stroke="#64748b" stroke-width="2"/><line x1="360" y1="80" x2="480" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
</svg><p class="cap">Each port only accepts the source IPs that the binding table says it owns.</p></div>

<h3>Lab 4 walkthrough, parts 2 and 3</h3>
<p>ACC3 already runs DHCP snooping with GW trusted on Gi0/24. First let PC1 obtain its lease, then enable IPSG on both edge ports:</p>
<pre class="code"><span class="c">! task 2 (after PC1> ip dhcp)</span>
interface range g0/1 - 2
 ip verify source
 exit</pre>
<pre class="out">ACC3# show ip verify source
Interface  Filter-type  Filter-mode  IP-address       Mac-address        Vlan
---------  -----------  -----------  ---------------  -----------------  ----
<span class="hl">Gi0/1      ip           active       10.0.10.10                          10</span>
<span class="hl">Gi0/2      ip           active       deny-all                            10</span>

ACC3# show ip source binding
MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface
------------------  ---------------  ----------  -------------  ----  --------------------
00:50:79:00:0D:11   10.0.10.10       86277       dhcp-snooping   10    GigabitEthernet0/1
Total number of bindings: 1</pre>
<p>PC1 still reaches the gateway 10.0.10.1, because its source matches its binding. Gi0/2 shows <b>deny-all</b>: ATK uses a static 10.0.10.77 with no binding, so none of its IP traffic is allowed. Task 3: run <code>attack ip-spoof 10.0.10.5 10.0.10.1</code> and <code>attack broadcast-storm</code> on ATK. The spoofed packets are dropped by IPSG and the storm err-disables Gi0/2 with reason storm-control (chapter 9).</p>

<div class="eg"><p><b>Worked example: a lease changes.</b> PC1 holds 10.0.10.10. Over the weekend its lease expires and on Monday it receives 10.0.10.14. Snooping removes the old binding and adds the new one; IPSG updates the Gi0/1 filter to permit 10.0.10.14 and no longer 10.0.10.10. No administrator action is needed. A host that manually sets 10.0.10.10 on Monday is now spoofing and is dropped.</p></div>

<h3>Static hosts and Layer 3 anti-spoofing</h3>
<p>Servers, printers and cameras with static IPs need a static binding: <code>ip source binding 0050.5555.5050 vlan 10 10.0.10.50 interface g0/2</code>. The same binding also satisfies DAI. At the routed edge, the equivalent Layer 3 control is <b>unicast Reverse Path Forwarding (uRPF)</b>, for example <code>ip verify unicast source reachable-via rx</code> on a router interface, which drops packets whose source would not be routed back out of the interface they arrived on.</p>

<div class="warn"><p><b>Common mistake.</b> Enabling <code>ip verify source</code> on a port with a static-IP device and no static binding. The device goes silent immediately, and because IPSG drops silently, the only clue is <code>deny-all</code> in <code>show ip verify source</code>. Lab 5 is exactly this problem.</p></div>

<div class="exam"><p><b>Exam trap.</b> IPSG filters on <b>source IP</b> (and with the port-security option, source MAC too), is configured <b>per interface</b> and uses the <b>DHCP snooping binding table</b>. DHCP itself is always allowed so clients can get a lease. It does not inspect ARP; that is DAI.</p></div>

<div class="scn"><h4>The payroll ACL that trusted an address</h4><p>A payroll server only accepted connections from the HR workstation, 10.0.10.5, enforced by an ACL on the server VLAN's SVI. An internal audit showed connection attempts from 10.0.10.5 at 2 a.m. while the HR PC was switched off. The gateway had logged a duplicate-address warning with a MAC from a meeting-room port. Someone had configured the HR PC's address on another machine. After IPSG with the port-security option was deployed on user ports, packets sourced from 10.0.10.5 were only accepted from the HR port with the HR PC's MAC; the ACL had become meaningful again.</p><p><b>Lesson:</b> an ACL that trusts a source IP is only as strong as the anti-spoofing at the edge.</p></div>

<div class="iv"><p class="q">"What is the difference between DAI and IP Source Guard?"</p><p>Strong answer: both rely on the DHCP snooping binding table, but they inspect different traffic. DAI is enabled per VLAN and validates ARP packets on untrusted ports, stopping ARP poisoning and man-in-the-middle. IP Source Guard is enabled per interface and filters every IP packet by source IP, optionally source MAC, stopping IP spoofing. Static hosts need static bindings for both. I would add uRPF as the equivalent at the routed edge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IP spoofing forges the source IP to impersonate trusted hosts or hide origin.</li>
<li><code>ip verify source</code> builds a per-port filter from snooping bindings; <code>ip verify source port-security</code> checks IP and MAC.</li>
<li>Before a binding exists only DHCP is allowed; unbound ports show deny-all.</li>
<li>Static hosts need <code>ip source binding</code>; the same entry satisfies DAI.</li>
<li>uRPF is the Layer 3 anti-spoofing equivalent at the routed edge.</li>
</ul></div>
`,hi:`
<p>Courier counter normally koi bhi parcel le leta hai, us par jo bhi sender address likha ho. Isse ek prankster apne padosi ke "naam se" parcels bhej sakta hai. Ek strict counter sender ka ID card parcel ke address se match karta hai aur jo match na ho use mana kar deta hai. <b>IP Source Guard (IPSG)</b> switch port ko wahi strict counter bana deta hai: access port mein aane wale har IP packet par wahi source address hona chahiye jo us port ka jaana-maana hai.</p>

<h3>IP spoofing recognition level par</h3>
<p><b>IP spoofing</b> ka matlab hai nakli source IP address ke saath packets bhejna. LAN par attackers iska use kisi aise trusted host ki nakal karne ke liye karte hain jise ACL ya server IP address se allow karta hai, traffic kahan se aa raha hai use chhupaane ke liye, ya reflected replies ko kisi victim par nishana banane ke liye. IP khud source check nahi karta, aur normal switch MAC addresses par frames forward karta hai, IP ko dekhta hi nahi.</p>
<p><b>Defender ko kya dikhta hai:</b> aise IP se packets jo us port par kabhi lease nahi hua, gateway par "duplicate address" warnings, aur ajeeb samay par ek trusted IP se ACL hits.</p>
<pre class="out"><span class="hl">%IP-4-DUPADDR: Duplicate address 10.0.10.5 on Vlan10, sourced by 00de.ad00.00d4</span></pre>

<h3>IP Source Guard kaise kaam karta hai</h3>
<p>IPSG untrusted access ports par per interface <code>ip verify source</code> se enable hota hai. Switch DHCP snooping binding table (aur static <code>ip source binding</code> entries) se ek <b>per-port filter</b> banata hai:</p>
<ul>
<li>Host ki binding banne se pehle port sirf DHCP permit karta hai, taaki host apni lease le sake; baaki saara IP drop hota hai.</li>
<li>Jab snooping lease record karta hai, filter automatically us port par woh source IP permit karta hai; lease khatam hone par permit hat jaata hai.</li>
<li>Kisi bhi aur source IP wale packets hardware mein chup-chaap drop hote hain.</li>
</ul>
<p>Do filter types hain. <code>ip verify source</code> sirf <b>source IP</b> check karta hai. <code>ip verify source port-security</code> <b>source IP aur source MAC</b> dono check karta hai, aur port par port security chahiye (kuch naye platforms MAC check ko <code>mac-check</code> kehte hain). Isliye IPSG, DAI ki tarah hi, VLAN mein chal rahe DHCP snooping par depend karta hai.</p>

<table class="cmp"><tr><th></th><th>DAI</th><th>IP Source Guard</th></tr>
<tr><td>Inspect karta hai</td><td>ARP packets</td><td>IP packets (source IP, optionally MAC)</td></tr>
<tr><td>Rokta hai</td><td>ARP poisoning, MITM</td><td>IP spoofing</td></tr>
<tr><td>Enable</td><td>Per VLAN, trust per port</td><td>Per interface</td></tr>
<tr><td>Data source</td><td>ARP ACLs, snooping bindings</td><td>Snooping bindings, static bindings</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IP Source Guard per-port filter">
<rect x="230" y="20" width="180" height="60" rx="8" fill="#bae6fd"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="14">ACC3 binding table</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1 = 10.0.10.10</text>
<rect x="40" y="150" width="200" height="54" rx="8" fill="#bbf7d0"/><text x="140" y="172" text-anchor="middle" class="svg-ink" font-size="13">PC1 src 10.0.10.10</text><text x="140" y="190" text-anchor="middle" class="svg-muted" font-size="12">match: forward</text>
<rect x="400" y="150" width="200" height="54" rx="8" fill="#fed7aa"/><text x="500" y="172" text-anchor="middle" class="svg-ink" font-size="13">ATK src 10.0.10.5</text><text x="500" y="190" text-anchor="middle" class="svg-accent" font-size="12">binding nahi: drop</text>
<line x1="280" y1="80" x2="160" y2="150" stroke="#64748b" stroke-width="2"/><line x1="360" y1="80" x2="480" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
</svg><p class="cap">Har port sirf wahi source IPs accept karta hai jo binding table ke hisaab se uske hain.</p></div>

<h3>Lab 4 walkthrough, parts 2 aur 3</h3>
<p>ACC3 par pehle se DHCP snooping chal raha hai aur GW Gi0/24 par trusted hai. Pehle PC1 ko apni lease lene do, phir dono edge ports par IPSG enable karo:</p>
<pre class="code"><span class="c">! task 2 (PC1> ip dhcp ke baad)</span>
interface range g0/1 - 2
 ip verify source
 exit</pre>
<pre class="out">ACC3# show ip verify source
Interface  Filter-type  Filter-mode  IP-address       Mac-address        Vlan
---------  -----------  -----------  ---------------  -----------------  ----
<span class="hl">Gi0/1      ip           active       10.0.10.10                          10</span>
<span class="hl">Gi0/2      ip           active       deny-all                            10</span>

ACC3# show ip source binding
MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface
------------------  ---------------  ----------  -------------  ----  --------------------
00:50:79:00:0D:11   10.0.10.10       86277       dhcp-snooping   10    GigabitEthernet0/1
Total number of bindings: 1</pre>
<p>PC1 ab bhi gateway 10.0.10.1 tak pahunchta hai, kyunki uska source uski binding se match karta hai. Gi0/2 <b>deny-all</b> dikhata hai: ATK bina binding ke static 10.0.10.77 use karta hai, isliye uska koi IP traffic allowed nahi. Task 3: ATK par <code>attack ip-spoof 10.0.10.5 10.0.10.1</code> aur <code>attack broadcast-storm</code> chalao. Spoofed packets IPSG se drop hote hain aur storm Gi0/2 ko storm-control reason ke saath err-disable karta hai (chapter 9).</p>

<div class="eg"><p><b>Worked example: lease badal jaati hai.</b> PC1 ke paas 10.0.10.10 hai. Weekend mein uski lease expire hoti hai aur Monday ko use 10.0.10.14 milta hai. Snooping purani binding hatata hai aur nayi jodta hai; IPSG Gi0/1 filter ko update karke 10.0.10.14 permit karta hai aur 10.0.10.10 ab nahi. Administrator ko kuch nahi karna padta. Jo host Monday ko manually 10.0.10.10 set kare woh ab spoofing kar raha hai aur drop hota hai.</p></div>

<h3>Static hosts aur Layer 3 anti-spoofing</h3>
<p>Static IPs wale servers, printers aur cameras ko static binding chahiye: <code>ip source binding 0050.5555.5050 vlan 10 10.0.10.50 interface g0/2</code>. Wahi binding DAI ko bhi santusht karti hai. Routed edge par iska Layer 3 equivalent <b>unicast Reverse Path Forwarding (uRPF)</b> hai, jaise router interface par <code>ip verify unicast source reachable-via rx</code>, jo un packets ko drop karta hai jinka source us interface se wapas route nahi hota jis par woh aaye.</p>

<div class="warn"><p><b>Common galti.</b> Static-IP device wale port par bina static binding ke <code>ip verify source</code> enable karna. Device turant chup ho jaata hai, aur kyunki IPSG chup-chaap drop karta hai, ekmaatra suraag <code>show ip verify source</code> mein <code>deny-all</code> hai. Lab 5 bilkul yahi problem hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> IPSG <b>source IP</b> par filter karta hai (port-security option ke saath source MAC par bhi), <b>per interface</b> configure hota hai aur <b>DHCP snooping binding table</b> use karta hai. DHCP khud hamesha allowed hai taaki clients lease le sakein. Yeh ARP inspect nahi karta; woh DAI hai.</p></div>

<div class="scn"><h4>Payroll ACL jo ek address par bharosa karti thi</h4><p>Ek payroll server sirf HR workstation 10.0.10.5 se connections accept karta tha, jo server VLAN ke SVI par ACL se enforce hota tha. Internal audit ne raat 2 baje 10.0.10.5 se connection attempts dikhaaye jabki HR PC band tha. Gateway ne meeting-room port ke ek MAC ke saath duplicate-address warning log ki thi. Kisi ne HR PC ka address doosri machine par configure kiya tha. User ports par port-security option ke saath IPSG deploy hone ke baad, 10.0.10.5 source wale packets sirf HR port se HR PC ke MAC ke saath accept hote the; ACL phir se meaningful ban gayi.</p><p><b>Seekh:</b> source IP par bharosa karne wali ACL utni hi strong hai jitni edge par anti-spoofing.</p></div>

<div class="iv"><p class="q">"DAI aur IP Source Guard mein kya fark hai?"</p><p>Strong answer: dono DHCP snooping binding table par depend karte hain, par alag traffic inspect karte hain. DAI per VLAN enable hota hai aur untrusted ports par ARP packets validate karta hai, jisse ARP poisoning aur man-in-the-middle rukta hai. IP Source Guard per interface enable hota hai aur har IP packet ko source IP, optionally source MAC, se filter karta hai, jisse IP spoofing rukta hai. Static hosts ko dono ke liye static bindings chahiye. Main routed edge par equivalent ki tarah uRPF bhi jodunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IP spoofing trusted hosts ki nakal karne ya origin chhupaane ke liye source IP nakli banata hai.</li>
<li><code>ip verify source</code> snooping bindings se per-port filter banata hai; <code>ip verify source port-security</code> IP aur MAC check karta hai.</li>
<li>Binding banne se pehle sirf DHCP allowed hai; bina binding wale ports deny-all dikhate hain.</li>
<li>Static hosts ko <code>ip source binding</code> chahiye; wahi entry DAI ko bhi santusht karti hai.</li>
<li>uRPF routed edge par Layer 3 anti-spoofing equivalent hai.</li>
</ul></div>
`}};export{e as default};