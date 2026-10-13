var e={id:`endpoint-learning`,h:{en:`Forwarding: endpoint learning, spine proxy, BD settings and the pervasive gateway`,hi:`Forwarding: endpoint learning, spine proxy, BD settings aur pervasive gateway`},body:{en:`
<p>Imagine a large apartment complex with a central <b>directory desk</b>. Each building guard (a leaf) notes who lives in his building and phones the directory desk (the spine) whenever someone moves in. When a courier arrives with a parcel for a name the guard does not know, he does not shout it in every building (flooding); he asks the directory desk, which knows exactly where that person lives. That directory desk is the ACI <b>spine proxy</b>, and the phone calls are <b>COOP</b>.</p>

<h3>What an endpoint is</h3>
<p>An <b>endpoint</b> is anything with a MAC address, and usually one or more IP addresses, attached to the fabric: a server NIC, a VM vNIC, a firewall interface. ACI keeps track of every endpoint: its MAC, its IPs, its EPG, its leaf, its port and its VLAN. The object is <code>fvCEp</code> on the APIC.</p>

<h3>Local and remote learning</h3>
<ul>
<li><b>Local endpoint:</b> learned by the leaf the endpoint is plugged into, from the traffic it sends (data-plane learning). The leaf always learns the source MAC; it learns the source IP too when the BD has <b>unicast routing</b> enabled. The leaf then reports the endpoint to the spines through <b>COOP</b>.</li>
<li><b>Remote endpoint:</b> learned by other leaves from packets arriving over iVXLAN (inner source address plus the sender's TEP). Remote entries are a cache that lets the leaf send the next packet straight to the right leaf. They are <b>not</b> reported to COOP.</li>
</ul>
<p>Endpoints age out when they go quiet. The default endpoint retention policy uses 900 seconds for local endpoints and 300 seconds for remote endpoints.</p>

<h3>The spine proxy</h3>
<p>When an ingress leaf does not know the destination, it can send the packet to the <b>spine proxy</b>, an anycast TEP address shared by all spines. The spine looks up the COOP database and forwards the packet to the leaf that owns the destination. If the destination is not in COOP:</p>
<ul>
<li>for a routed (IP) destination inside a BD subnet, the spine drops the packet and triggers an <b>ARP glean</b>: the leaves that have the BD send an ARP request for the target from the gateway address, so a silent host answers and gets learned; the next packet succeeds;</li>
<li>for a bridged (MAC) destination, the packet is dropped.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="First packet through the spine proxy">
<rect x="230" y="15" width="180" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">SPINE201 (proxy)</text><text x="320" y="51" text-anchor="middle" class="svg-muted" font-size="12">COOP database</text>
<rect x="60" y="140" width="140" height="40" rx="8" fill="#bae6fd"/><text x="130" y="165" text-anchor="middle" class="svg-ink" font-size="13">LEAF101</text>
<rect x="440" y="140" width="140" height="40" rx="8" fill="#bae6fd"/><text x="510" y="165" text-anchor="middle" class="svg-ink" font-size="13">LEAF102</text>
<rect x="70" y="205" width="120" height="32" rx="6" fill="#fde68a"/><text x="130" y="226" text-anchor="middle" class="svg-ink" font-size="12">WEB1 10.1.1.11</text>
<rect x="450" y="205" width="120" height="32" rx="6" fill="#fde68a"/><text x="510" y="226" text-anchor="middle" class="svg-ink" font-size="12">WEB2 10.1.1.12</text>
<line x1="150" y1="140" x2="260" y2="59" stroke="#64748b" stroke-width="2"/><line x1="380" y1="59" x2="490" y2="140" stroke="#64748b" stroke-width="2"/>
<line x1="200" y1="170" x2="440" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="175" y="98" class="svg-accent" font-size="12">1 unknown: to proxy</text>
<text x="420" y="98" class="svg-accent" font-size="12">2 COOP hit</text>
<text x="320" y="192" text-anchor="middle" class="svg-accent" font-size="12">3 reply goes leaf to leaf directly</text>
</svg><p class="cap">After the first exchange both leaves hold a remote entry, so later packets skip the proxy.</p></div>

<h3>Bridge domain forwarding settings</h3>
<table class="cmp"><tr><th>Setting</th><th>Default</th><th>What it does</th></tr>
<tr><td>Unicast Routing</td><td>Enabled</td><td>The BD acts as a gateway and the fabric learns endpoint IPs. Disable it for a pure Layer 2 BD whose gateway is outside (for example a firewall).</td></tr>
<tr><td>L2 Unknown Unicast</td><td>Hardware Proxy</td><td>Unknown destination MAC is sent to the spine proxy. <b>Flood</b> sends it to all leaves in the BD, as classic Ethernet would; needed for silent hosts in Layer 2 BDs and for some clustering and migration cases.</td></tr>
<tr><td>ARP Flooding</td><td>Disabled</td><td>Disabled: the leaf reads the ARP target IP and unicasts the ARP towards the known endpoint (or the proxy). Enabled: ARP is flooded in the BD like a normal broadcast. Enable it when unicast routing is off.</td></tr>
<tr><td>Limit IP Learning To Subnet</td><td>Enabled</td><td>An IP is learned only if it belongs to one of the BD subnets, so a misconfigured server cannot pollute the endpoint table.</td></tr>
</table>

<h3>The pervasive gateway</h3>
<p>Every leaf where a BD is deployed hosts its subnet gateway (10.1.1.1) with the same virtual MAC (<code>00:22:BD:F8:19:FF</code> by default). This is an <b>anycast gateway</b>: a server's first hop is always its own leaf, and a VM that moves to another leaf finds the same gateway IP and MAC there. There is no HSRP and no active/standby. In the leaf routing table the BD subnet appears as a <b>pervasive</b> route:</p>
<pre class="out">LEAF102# show ip route vrf NK-PROD:PROD
10.1.1.0/24, ubest/mbest: 1/0, attached, direct, <span class="hl">pervasive</span>
    *via 10.0.0.1%overlay-1, [1/0], 02:11:05, static, tag 4294967294
10.1.1.1/32, ubest/mbest: 1/0, attached, pervasive
    *via 10.1.1.1, vlan13, [0/0], 02:11:05, local, local</pre>

<h3>Seeing endpoints</h3>
<p>In the GUI: EPG → Operational → Client End-Points, or <b>Operations → EP Tracker</b> (search by IP or MAC; it also shows move history). On the leaf:</p>
<pre class="out">LEAF102# show endpoint ip 10.1.1.12
+-----------------------------------+---------------+-----------------+--------------+-------------+
      VLAN/                           Encap           MAC Address       MAC Info/       Interface
      Domain                          VLAN            IP Address        IP Info
+-----------------------------------+---------------+-----------------+--------------+-------------+
14                                         vlan-110    0050.5601.0012  L                    eth1/1
<span class="hl">NK-PROD:PROD                               vlan-110       10.1.1.12  L                    eth1/1</span></pre>
<p>The <b>L</b> flag means local. On the spine you can check what COOP knows:</p>
<pre class="out">SPINE201# show coop internal info ip-db
------------------------------
IP address : 10.1.1.12
Vrf : 2555904
EP bd vnid : 15826915
EP mac :  00:50:56:01:00:12
<span class="hl">Publisher Id : 10.0.72.65</span>
        Tunnel address : 10.0.72.65</pre>
<p>The publisher is the TEP of LEAF102, which reported the endpoint.</p>

<div class="eg"><p><b>Worked example.</b> WEB1 (10.1.1.11, LEAF101) pings WEB2 (10.1.1.12, LEAF102) for the first time, both in WEB-BD with default settings. WEB1 sends ARP for 10.1.1.12. ARP flooding is off, LEAF101 does not know 10.1.1.12, so it sends the ARP to the spine proxy. WEB2 already sent a gratuitous ARP when it booted, so LEAF102 has reported it and COOP knows 10.1.1.12 is behind TEP 10.0.72.65, so the spine delivers the ARP to LEAF102, which sends it to WEB2. WEB2 replies; LEAF102 learns WEB1 as a remote endpoint (behind 10.0.72.64) and sends the reply straight to LEAF101. From the second packet on, both leaves forward directly without the proxy.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Disabling unicast routing on a BD but leaving ARP flooding off and L2 unknown unicast on hardware proxy: silent hosts become unreachable. Configuring a server with an IP outside the BD subnet: with Limit IP Learning To Subnet on, its IP is never learned and routing to it fails without any fault (this is part of the Lab 5 ticket).</p></div>

<div class="exam"><p><b>Exam trap.</b> Remember the defaults: unicast routing enabled, L2 unknown unicast hardware proxy, ARP flooding disabled, limit IP learning to subnet enabled. Local endpoints are reported to COOP; remote endpoints are not. COOP runs between leaves and spines, not between leaves.</p></div>

<div class="scn"><h4>The cluster node nobody could reach</h4><p>A bank ran an old database cluster in a Layer 2-only BD (unicast routing off, gateway on a firewall). After a maintenance window, the passive node of the cluster was unreachable from the firewall for 20 minutes at a time. The passive node was silent: it never sent traffic unless asked. Its MAC aged out of the fabric, and with L2 unknown unicast set to hardware proxy, the spine had no COOP entry and dropped the frames. The engineer found no entry for the MAC in EP Tracker, then changed the BD to L2 Unknown Unicast = Flood and ARP Flooding = enabled. The node answered immediately.</p><p><b>Lesson:</b> hardware proxy is efficient for well-behaved hosts; Layer 2 BDs with silent hosts need flooding.</p></div>

<div class="iv"><p class="q">"How does ACI forward a packet to a destination the ingress leaf has never seen?"</p><p>Strong answer: the leaf sends it in iVXLAN to the spine proxy anycast TEP. The spine looks up the COOP database, which holds every local endpoint reported by the leaves, and forwards it to the owning leaf. If the IP is unknown, the spine drops it and triggers an ARP glean from the leaves that have the BD, so the silent host gets learned. The egress leaf learns the source as a remote endpoint, so the return traffic goes leaf to leaf directly. Mention the BD settings that change this: L2 unknown unicast flood and ARP flooding.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Leaves learn local endpoints from data-plane traffic and report them to spines with COOP.</li>
<li>Remote endpoints are a cache learned from iVXLAN traffic; they are not in COOP.</li>
<li>Unknown destinations go to the spine proxy; unknown IPs trigger an ARP glean.</li>
<li>BD defaults: unicast routing on, hardware proxy, ARP flooding off, limit IP learning to subnet on.</li>
<li>The pervasive gateway is the same IP and MAC on every leaf; verify with show endpoint, show ip route vrf and EP Tracker.</li>
</ul></div>
`,hi:`
<p>Ek bade apartment complex ki kalpana karo jismein ek central <b>directory desk</b> hai. Har building ka guard (ek leaf) note karta hai ki uski building mein kaun rehta hai aur jab bhi koi naya aata hai to directory desk (spine) ko phone karta hai. Jab courier kisi aise naam ka parcel laata hai jise guard nahi jaanta, to woh har building mein chilla kar nahi poochta (flooding); woh directory desk se poochta hai, jise bilkul pata hai woh insaan kahan rehta hai. Woh directory desk ACI ka <b>spine proxy</b> hai, aur phone calls <b>COOP</b> hain.</p>

<h3>Endpoint kya hai</h3>
<p><b>Endpoint</b> fabric se judi koi bhi cheez hai jiska MAC address ho, aur aam taur par ek ya zyada IP addresses: server NIC, VM vNIC, firewall interface. ACI har endpoint ko track karta hai: uska MAC, uske IPs, uska EPG, uska leaf, uska port aur uska VLAN. APIC par object <code>fvCEp</code> hai.</p>

<h3>Local aur remote learning</h3>
<ul>
<li><b>Local endpoint:</b> us leaf dwara seekha jaata hai jismein endpoint plugged hai, uske bheje traffic se (data-plane learning). Leaf hamesha source MAC seekhta hai; source IP bhi seekhta hai jab BD mein <b>unicast routing</b> enabled ho. Phir leaf endpoint ko <b>COOP</b> ke through spines ko report karta hai.</li>
<li><b>Remote endpoint:</b> doosre leaves iVXLAN par aane wale packets se seekhte hain (inner source address plus bhejne wale ka TEP). Remote entries ek cache hain jisse leaf agla packet seedha sahi leaf ko bhej sake. Yeh COOP ko report <b>nahi</b> hoti.</li>
</ul>
<p>Endpoints shaant hone par age out ho jaate hain. Default endpoint retention policy local endpoints ke liye 900 seconds aur remote endpoints ke liye 300 seconds use karti hai.</p>

<h3>Spine proxy</h3>
<p>Jab ingress leaf destination nahi jaanta, to woh packet <b>spine proxy</b> ko bhej sakta hai, ek anycast TEP address jo saare spines share karte hain. Spine COOP database dekhta hai aur packet us leaf ko forward karta hai jiske paas destination hai. Agar destination COOP mein nahi hai:</p>
<ul>
<li>BD subnet ke andar routed (IP) destination ke liye, spine packet drop karta hai aur <b>ARP glean</b> trigger karta hai: jin leaves par BD hai woh gateway address se target ke liye ARP request bhejte hain, taaki silent host jawab de aur seekha jaaye; agla packet successful hota hai;</li>
<li>bridged (MAC) destination ke liye, packet drop hota hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Spine proxy se pehla packet">
<rect x="230" y="15" width="180" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">SPINE201 (proxy)</text><text x="320" y="51" text-anchor="middle" class="svg-muted" font-size="12">COOP database</text>
<rect x="60" y="140" width="140" height="40" rx="8" fill="#bae6fd"/><text x="130" y="165" text-anchor="middle" class="svg-ink" font-size="13">LEAF101</text>
<rect x="440" y="140" width="140" height="40" rx="8" fill="#bae6fd"/><text x="510" y="165" text-anchor="middle" class="svg-ink" font-size="13">LEAF102</text>
<rect x="70" y="205" width="120" height="32" rx="6" fill="#fde68a"/><text x="130" y="226" text-anchor="middle" class="svg-ink" font-size="12">WEB1 10.1.1.11</text>
<rect x="450" y="205" width="120" height="32" rx="6" fill="#fde68a"/><text x="510" y="226" text-anchor="middle" class="svg-ink" font-size="12">WEB2 10.1.1.12</text>
<line x1="150" y1="140" x2="260" y2="59" stroke="#64748b" stroke-width="2"/><line x1="380" y1="59" x2="490" y2="140" stroke="#64748b" stroke-width="2"/>
<line x1="200" y1="170" x2="440" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="175" y="98" class="svg-accent" font-size="12">1 unknown: proxy ko</text>
<text x="420" y="98" class="svg-accent" font-size="12">2 COOP hit</text>
<text x="320" y="192" text-anchor="middle" class="svg-accent" font-size="12">3 reply seedha leaf se leaf</text>
</svg><p class="cap">Pehle exchange ke baad dono leaves ke paas remote entry hoti hai, isliye baad ke packets proxy skip karte hain.</p></div>

<h3>Bridge domain forwarding settings</h3>
<table class="cmp"><tr><th>Setting</th><th>Default</th><th>Kya karta hai</th></tr>
<tr><td>Unicast Routing</td><td>Enabled</td><td>BD gateway ka kaam karta hai aur fabric endpoint IPs seekhta hai. Pure Layer 2 BD ke liye disable karo jiska gateway bahar hai (jaise firewall).</td></tr>
<tr><td>L2 Unknown Unicast</td><td>Hardware Proxy</td><td>Unknown destination MAC spine proxy ko jaata hai. <b>Flood</b> use BD ke saare leaves ko bhejta hai, jaise classic Ethernet; Layer 2 BDs mein silent hosts aur kuch clustering aur migration cases ke liye zaroori.</td></tr>
<tr><td>ARP Flooding</td><td>Disabled</td><td>Disabled: leaf ARP target IP padhta hai aur ARP ko known endpoint (ya proxy) ki taraf unicast karta hai. Enabled: ARP BD mein normal broadcast ki tarah flood hota hai. Unicast routing off ho to ise enable karo.</td></tr>
<tr><td>Limit IP Learning To Subnet</td><td>Enabled</td><td>IP tabhi seekha jaata hai jab woh BD subnets mein se kisi ka ho, taaki galat configure hua server endpoint table ko ganda na kare.</td></tr>
</table>

<h3>Pervasive gateway</h3>
<p>Har leaf jahan BD deployed hai uska subnet gateway (10.1.1.1) same virtual MAC (<code>00:22:BD:F8:19:FF</code> default) ke saath host karta hai. Yeh <b>anycast gateway</b> hai: server ka first hop hamesha uska apna leaf hota hai, aur jo VM doosre leaf par move karta hai use wahan same gateway IP aur MAC milta hai. Na HSRP hai na active/standby. Leaf routing table mein BD subnet <b>pervasive</b> route ki tarah dikhta hai:</p>
<pre class="out">LEAF102# show ip route vrf NK-PROD:PROD
10.1.1.0/24, ubest/mbest: 1/0, attached, direct, <span class="hl">pervasive</span>
    *via 10.0.0.1%overlay-1, [1/0], 02:11:05, static, tag 4294967294
10.1.1.1/32, ubest/mbest: 1/0, attached, pervasive
    *via 10.1.1.1, vlan13, [0/0], 02:11:05, local, local</pre>

<h3>Endpoints dekhna</h3>
<p>GUI mein: EPG → Operational → Client End-Points, ya <b>Operations → EP Tracker</b> (IP ya MAC se search karo; yeh move history bhi dikhata hai). Leaf par:</p>
<pre class="out">LEAF102# show endpoint ip 10.1.1.12
+-----------------------------------+---------------+-----------------+--------------+-------------+
      VLAN/                           Encap           MAC Address       MAC Info/       Interface
      Domain                          VLAN            IP Address        IP Info
+-----------------------------------+---------------+-----------------+--------------+-------------+
14                                         vlan-110    0050.5601.0012  L                    eth1/1
<span class="hl">NK-PROD:PROD                               vlan-110       10.1.1.12  L                    eth1/1</span></pre>
<p><b>L</b> flag ka matlab local. Spine par aap check kar sakte ho ki COOP kya jaanta hai:</p>
<pre class="out">SPINE201# show coop internal info ip-db
------------------------------
IP address : 10.1.1.12
Vrf : 2555904
EP bd vnid : 15826915
EP mac :  00:50:56:01:00:12
<span class="hl">Publisher Id : 10.0.72.65</span>
        Tunnel address : 10.0.72.65</pre>
<p>Publisher LEAF102 ka TEP hai, jisne endpoint report kiya.</p>

<div class="eg"><p><b>Worked example.</b> WEB1 (10.1.1.11, LEAF101) pehli baar WEB2 (10.1.1.12, LEAF102) ko ping karta hai, dono default settings wale WEB-BD mein. WEB1 10.1.1.12 ke liye ARP bhejta hai. ARP flooding off hai, LEAF101 10.1.1.12 nahi jaanta, isliye woh ARP spine proxy ko bhejta hai. WEB2 ne boot hote waqt gratuitous ARP bheja tha, isliye LEAF102 use report kar chuka hai aur COOP jaanta hai ki 10.1.1.12 TEP 10.0.72.65 ke peeche hai, isliye spine ARP LEAF102 ko deliver karta hai, jo use WEB2 ko bhejta hai. WEB2 reply karta hai; LEAF102 WEB1 ko remote endpoint (10.0.72.64 ke peeche) ki tarah seekhta hai aur reply seedha LEAF101 ko bhejta hai. Doosre packet se dono leaves proxy ke bina direct forward karte hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> BD par unicast routing disable karna lekin ARP flooding off aur L2 unknown unicast hardware proxy par chhod dena: silent hosts unreachable ho jaate hain. Server ko BD subnet ke bahar ka IP dena: Limit IP Learning To Subnet on hone par uska IP kabhi seekha nahi jaata aur us tak routing bina kisi fault ke fail hoti hai (yeh Lab 5 ticket ka hissa hai).</p></div>

<div class="exam"><p><b>Exam trap.</b> Defaults yaad rakho: unicast routing enabled, L2 unknown unicast hardware proxy, ARP flooding disabled, limit IP learning to subnet enabled. Local endpoints COOP ko report hote hain; remote endpoints nahi. COOP leaves aur spines ke beech chalta hai, leaves ke beech nahi.</p></div>

<div class="scn"><h4>Cluster node jis tak koi nahi pahunch saka</h4><p>Ek bank ek purana database cluster Layer 2-only BD mein chalata tha (unicast routing off, gateway firewall par). Ek maintenance window ke baad, cluster ka passive node firewall se ek baar mein 20 minute tak unreachable rehta tha. Passive node silent tha: poochhe bina kabhi traffic nahi bhejta tha. Uska MAC fabric se age out ho gaya, aur L2 unknown unicast hardware proxy par hone se spine ke paas COOP entry nahi thi aur usne frames drop kar diye. Engineer ko EP Tracker mein us MAC ki koi entry nahi mili, phir usne BD ko L2 Unknown Unicast = Flood aur ARP Flooding = enabled kiya. Node ne turant jawab diya.</p><p><b>Seekh:</b> hardware proxy well-behaved hosts ke liye efficient hai; silent hosts wale Layer 2 BDs ko flooding chahiye.</p></div>

<div class="iv"><p class="q">"ACI us destination ko packet kaise forward karta hai jise ingress leaf ne kabhi dekha hi nahi?"</p><p>Strong answer: leaf use iVXLAN mein spine proxy anycast TEP ko bhejta hai. Spine COOP database dekhta hai, jismein leaves ke report kiye saare local endpoints hain, aur use owning leaf ko forward karta hai. Agar IP unknown hai, spine use drop karta hai aur BD wale leaves se ARP glean trigger karta hai, taaki silent host seekha jaaye. Egress leaf source ko remote endpoint ki tarah seekhta hai, isliye return traffic seedha leaf se leaf jaata hai. Woh BD settings batao jo ise badalti hain: L2 unknown unicast flood aur ARP flooding.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Leaves local endpoints data-plane traffic se seekhte hain aur COOP se spines ko report karte hain.</li>
<li>Remote endpoints iVXLAN traffic se seekha gaya cache hain; woh COOP mein nahi hote.</li>
<li>Unknown destinations spine proxy ko jaate hain; unknown IPs ARP glean trigger karte hain.</li>
<li>BD defaults: unicast routing on, hardware proxy, ARP flooding off, limit IP learning to subnet on.</li>
<li>Pervasive gateway har leaf par same IP aur MAC hai; show endpoint, show ip route vrf aur EP Tracker se verify karo.</li>
</ul></div>
`}};export{e as default};