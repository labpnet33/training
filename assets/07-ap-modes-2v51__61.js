var e={id:`ap-modes`,h:{en:`Architectures and AP modes: local, FlexConnect, monitor, sniffer, bridge`,hi:`Architectures aur AP modes: local, FlexConnect, monitor, sniffer, bridge`},body:{en:`
<p>Think about how a restaurant chain can run its kitchens. In the first model every branch has its own head chef who decides the menu, buys supplies and trains staff; that works for one or two branches but becomes chaos at fifty. In the second model a <b>central kitchen</b> designs every recipe and policy, and each branch only cooks and serves in real time. In the third model head office manages everything from a web dashboard over the internet. These are the three Wi-Fi architectures, and an AP's <b>mode</b> is simply the job the head office gives each branch.</p>

<h3>Three architectures (preview)</h3>
<dl class="terms">
<dt>Autonomous AP</dt><dd>A self-contained AP with its own full configuration: SSIDs, security, VLAN mapping, channels. Each AP is managed individually. Fine for a small office; painful at scale because channel planning, roaming and security must be coordinated by hand.</dd>
<dt>Lightweight AP with a WLC (split-MAC)</dt><dd>The 802.11 functions are split. The <b>AP</b> keeps the real-time work: sending beacons, answering probes, ACKs, encryption and queueing. The <b>wireless LAN controller (WLC)</b> does the management work: authentication and association decisions, roaming, security policy, QoS and RF management (RRM). AP and WLC talk over <b>CAPWAP</b> tunnels: UDP 5246 for control (DTLS-encrypted) and UDP 5247 for client data.</dd>
<dt>Cloud-managed</dt><dd>APs are managed from a cloud dashboard (for example Cisco Meraki). Client traffic goes straight to the local switch; only management uses the internet. Controllers can also be embedded in switches or run on an AP, as the Embedded Wireless Controller does.</dd>
</dl>
<p>How APs discover and join a controller, and how WLANs are configured on it, is covered in module ccna-wlan. In our lab, AP1 to AP3 learn WLC1's address from <b>DHCP option 43</b> on R1 (<code>option 43 hex f104.0a0a.630a</code>: type f1, length 04, address 0a.0a.63.0a = 10.10.99.10) and build CAPWAP tunnels to it.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Split-MAC and CAPWAP">
<rect x="20" y="60" width="170" height="100" rx="10" fill="#bae6fd"/><text x="105" y="84" text-anchor="middle" class="svg-ink" font-size="14">AP (real time)</text>
<text x="105" y="106" text-anchor="middle" class="svg-muted" font-size="12">beacons, probes</text><text x="105" y="124" text-anchor="middle" class="svg-muted" font-size="12">ACKs, encryption</text><text x="105" y="142" text-anchor="middle" class="svg-muted" font-size="12">queueing</text>
<rect x="450" y="60" width="170" height="100" rx="10" fill="#ddd6fe"/><text x="535" y="84" text-anchor="middle" class="svg-ink" font-size="14">WLC (management)</text>
<text x="535" y="106" text-anchor="middle" class="svg-muted" font-size="12">auth, association</text><text x="535" y="124" text-anchor="middle" class="svg-muted" font-size="12">roaming, RRM</text><text x="535" y="142" text-anchor="middle" class="svg-muted" font-size="12">security, QoS</text>
<line x1="190" y1="95" x2="450" y2="95" stroke="#64748b" stroke-width="3"/><text x="320" y="87" text-anchor="middle" class="svg-accent" font-size="12">CAPWAP control UDP 5246 (DTLS)</text>
<line x1="190" y1="130" x2="450" y2="130" stroke="#64748b" stroke-width="3" stroke-dasharray="8 4"/><text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">CAPWAP data UDP 5247</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">In local mode, all client traffic rides the data tunnel to the WLC</text>
</svg><p class="cap">Split-MAC: the AP does real-time radio work, the WLC makes the management decisions, and CAPWAP carries control and data between them.</p></div>

<h3>Lightweight AP modes</h3>
<table class="cmp"><tr><th>Mode</th><th>Serves clients?</th><th>What it does</th><th>Typical use</th></tr>
<tr><td><b>Local</b> (default)</td><td>Yes</td><td>Serves clients on its channel and tunnels all their traffic to the WLC over CAPWAP. Briefly goes off-channel now and then to scan for RRM and rogue detection.</td><td>Campus and office floors</td></tr>
<tr><td><b>FlexConnect</b></td><td>Yes</td><td>Can switch client traffic <b>locally</b> onto a VLAN at the site instead of tunnelling it, and keeps serving clients if the link to the WLC fails (standalone).</td><td>Branch offices across a WAN</td></tr>
<tr><td><b>Monitor</b></td><td>No</td><td>Dedicates its radios to scanning every channel: rogue APs, intrusion detection (wIPS), location tracking.</td><td>Security monitoring</td></tr>
<tr><td><b>Sniffer</b></td><td>No</td><td>Captures all 802.11 frames on one channel and forwards them to a PC running a protocol analyser.</td><td>Deep troubleshooting</td></tr>
<tr><td><b>Rogue detector</b></td><td>No</td><td>Radios off; listens on the wired side to spot rogue devices connected to the LAN.</td><td>Security</td></tr>
<tr><td><b>SE-Connect</b></td><td>No</td><td>Dedicated spectrum analysis, identifying non-Wi-Fi interferers such as microwave ovens.</td><td>RF troubleshooting</td></tr>
<tr><td><b>Bridge / mesh</b></td><td>Yes (optional)</td><td>Links APs or buildings wirelessly, point-to-point, point-to-multipoint or as a mesh.</td><td>Outdoor, warehouses, campuses</td></tr></table>

<h3>Physical connections</h3>
<p>The AP mode decides how the switch port is configured:</p>
<ul>
<li><b>Local-mode AP</b>: an <b>access port</b> in the AP management VLAN. Client traffic of every VLAN is inside CAPWAP, so the switch sees only the AP's own address. In the lab, SW1 Gi0/2 to Gi0/4 are access ports in VLAN 10.</li>
<li><b>FlexConnect AP with local switching</b> or an <b>autonomous AP</b> with several SSIDs: a <b>trunk port</b>, because client frames leave the AP already tagged for their VLANs.</li>
<li><b>WLC</b>: a <b>trunk</b> carrying its management VLAN and every client VLAN (here 20, 30 and 99). Controllers often bundle ports in a <b>LAG</b>; AireOS controllers support only static EtherChannel (<code>channel-group mode on</code>), no LACP or PAgP.</li>
</ul>
<p>Engineers manage APs and WLCs through the console, SSH (never Telnet in production), the HTTPS GUI, and central AAA with TACACS+ or RADIUS.</p>
<pre class="code"><span class="c">! SW1: local-mode AP port and WLC trunk</span>
interface GigabitEthernet0/2
 description AP1
 switchport mode access
 switchport access vlan 10
interface GigabitEthernet0/1
 description trunk-to-WLC1
 switchport mode trunk</pre>

<p>On the controller, an AP can be moved to monitor mode. On a real WLC the AP reboots when its mode changes, so do it in a quiet period:</p>
<pre class="code">(WLC1) &gt;config ap mode monitor AP3
(WLC1) &gt;show ap summary</pre>
<pre class="out">Number of APs.................................... 3

AP Name          Slots  AP Model     Ethernet MAC       IP Address       Clients  Mode     Join
---------------  -----  -----------  -----------------  ---------------  -------  -------  ---------
AP1              2      NK-AP3800    52:54:00:3a:11:01  10.10.10.11      4        Local    DHCP-43
AP2              2      NK-AP3800    52:54:00:3a:12:01  10.10.10.12      7        Local    DHCP-43
<span class="hl">AP3              2      NK-AP3800    52:54:00:3a:13:01  10.10.10.13      0        Monitor  DHCP-43</span></pre>

<div class="eg"><p><b>Worked example.</b> A company has a head office with WLC1 and 40 branches connected by 20 Mbps WAN links. If branch APs were in local mode, a user printing to a printer in the same branch would send the job over the WAN to the WLC and back: 2 × the job size on a small link, and nothing works when the WAN is down. In FlexConnect mode with local switching, the print job stays on the branch switch, and clients keep working during a WAN outage. The APs' switch ports must then be trunks carrying the branch client VLANs.</p></div>

<div class="warn"><p><b>Common mistake.</b> Putting a FlexConnect AP with local switching on an access port. The AP tags client frames for VLAN 20 and 30, the access port drops them, and clients associate but never get an IP address.</p></div>

<div class="exam"><p><b>Exam trap.</b> Local mode is the default and does serve clients; monitor, sniffer, rogue detector and SE-Connect do not. FlexConnect is the mode for branches that must survive a WAN failure. CAPWAP uses UDP 5246 (control) and 5247 (data). A local-mode AP connects to an access port; a WLC connects to a trunk.</p></div>

<div class="scn"><h4>Branch Wi-Fi dies with the WAN</h4><p>Every time the MPLS link to a branch flapped, all Wi-Fi clients in the branch lost connectivity, even to the local file server. The APs were in local mode, so every frame went through the CAPWAP tunnel to the head-office WLC. The engineer converted the branch APs to FlexConnect with local switching for the staff WLAN, changed their switch ports to trunks with the AP VLAN as native, and tested by shutting the WAN: clients stayed connected locally.</p><p><b>Lesson:</b> choose the AP mode for the site; branches across a WAN need FlexConnect.</p></div>

<div class="iv"><p class="q">"What is the difference between local mode and FlexConnect?"</p><p>Strong answer: in local mode the AP tunnels all client data to the WLC over CAPWAP, so the WLC is the point where traffic enters the wired network, and the AP connects to an access port. In FlexConnect the AP can switch client traffic locally onto VLANs at the site, needs a trunk port, and can keep serving clients in standalone mode if the WLC becomes unreachable. Mention that FlexConnect is designed for branches over a WAN, and that other modes such as monitor and sniffer serve no clients.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Architectures: autonomous, lightweight split-MAC with a WLC, and cloud-managed.</li>
<li>CAPWAP: UDP 5246 control (DTLS), UDP 5247 data.</li>
<li>Local = default, tunnels traffic to the WLC; FlexConnect = local switching and WAN survival for branches.</li>
<li>Monitor, sniffer, rogue detector and SE-Connect do not serve clients; bridge/mesh links sites wirelessly.</li>
<li>Local-mode AP on an access port; FlexConnect or autonomous AP and the WLC on trunks.</li>
</ul></div>
`,hi:`
<p>Socho ek restaurant chain apne kitchens kaise chala sakti hai. Pehle model mein har branch ka apna head chef hai jo menu tay karta hai, saamaan khareedta hai aur staff train karta hai; do branches tak chalta hai par pachaas par gadbad ban jaata hai. Doosre model mein ek <b>central kitchen</b> har recipe aur policy design karta hai, aur har branch sirf real time mein khana banati aur serve karti hai. Teesre model mein head office internet par web dashboard se sab manage karta hai. Yahi teen Wi-Fi architectures hain, aur AP ka <b>mode</b> bas woh kaam hai jo head office har branch ko deta hai.</p>

<h3>Teen architectures (preview)</h3>
<dl class="terms">
<dt>Autonomous AP</dt><dd>Ek self-contained AP jiski apni poori configuration hai: SSIDs, security, VLAN mapping, channels. Har AP alag se manage hota hai. Chhote office ke liye theek; scale par takleef kyunki channel planning, roaming aur security haath se coordinate karni padti hai.</dd>
<dt>WLC ke saath lightweight AP (split-MAC)</dt><dd>802.11 functions baant diye jaate hain. <b>AP</b> real-time kaam rakhta hai: beacons bhejna, probes ka jawab, ACKs, encryption aur queueing. <b>Wireless LAN controller (WLC)</b> management kaam karta hai: authentication aur association decisions, roaming, security policy, QoS aur RF management (RRM). AP aur WLC <b>CAPWAP</b> tunnels par baat karte hain: control ke liye UDP 5246 (DTLS-encrypted) aur client data ke liye UDP 5247.</dd>
<dt>Cloud-managed</dt><dd>APs cloud dashboard se manage hote hain (jaise Cisco Meraki). Client traffic seedha local switch par jaata hai; sirf management internet use karta hai. Controllers switches mein embedded bhi ho sakte hain ya AP par chal sakte hain, jaise Embedded Wireless Controller.</dd>
</dl>
<p>APs controller ko kaise dhoondhte aur join karte hain, aur us par WLANs kaise configure hote hain, yeh module ccna-wlan mein hai. Hamari lab mein AP1 se AP3 WLC1 ka address R1 ke <b>DHCP option 43</b> se seekhte hain (<code>option 43 hex f104.0a0a.630a</code>: type f1, length 04, address 0a.0a.63.0a = 10.10.99.10) aur uske saath CAPWAP tunnels banate hain.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Split-MAC aur CAPWAP">
<rect x="20" y="60" width="170" height="100" rx="10" fill="#bae6fd"/><text x="105" y="84" text-anchor="middle" class="svg-ink" font-size="14">AP (real time)</text>
<text x="105" y="106" text-anchor="middle" class="svg-muted" font-size="12">beacons, probes</text><text x="105" y="124" text-anchor="middle" class="svg-muted" font-size="12">ACKs, encryption</text><text x="105" y="142" text-anchor="middle" class="svg-muted" font-size="12">queueing</text>
<rect x="450" y="60" width="170" height="100" rx="10" fill="#ddd6fe"/><text x="535" y="84" text-anchor="middle" class="svg-ink" font-size="14">WLC (management)</text>
<text x="535" y="106" text-anchor="middle" class="svg-muted" font-size="12">auth, association</text><text x="535" y="124" text-anchor="middle" class="svg-muted" font-size="12">roaming, RRM</text><text x="535" y="142" text-anchor="middle" class="svg-muted" font-size="12">security, QoS</text>
<line x1="190" y1="95" x2="450" y2="95" stroke="#64748b" stroke-width="3"/><text x="320" y="87" text-anchor="middle" class="svg-accent" font-size="12">CAPWAP control UDP 5246 (DTLS)</text>
<line x1="190" y1="130" x2="450" y2="130" stroke="#64748b" stroke-width="3" stroke-dasharray="8 4"/><text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">CAPWAP data UDP 5247</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">Local mode mein saara client traffic data tunnel se WLC tak jaata hai</text>
</svg><p class="cap">Split-MAC: AP real-time radio kaam karta hai, WLC management decisions leta hai, aur CAPWAP dono ke beech control aur data le jaata hai.</p></div>

<h3>Lightweight AP modes</h3>
<table class="cmp"><tr><th>Mode</th><th>Clients serve karta hai?</th><th>Kya karta hai</th><th>Typical use</th></tr>
<tr><td><b>Local</b> (default)</td><td>Haan</td><td>Apne channel par clients serve karta hai aur unka saara traffic CAPWAP se WLC tak tunnel karta hai. RRM aur rogue detection ke liye beech beech mein thodi der off-channel scan karta hai.</td><td>Campus aur office floors</td></tr>
<tr><td><b>FlexConnect</b></td><td>Haan</td><td>Client traffic ko tunnel karne ke bajaye site par ek VLAN mein <b>locally</b> switch kar sakta hai, aur WLC tak link fail hone par bhi clients serve karta rehta hai (standalone).</td><td>WAN ke paar branch offices</td></tr>
<tr><td><b>Monitor</b></td><td>Nahi</td><td>Apne radios ko har channel scan karne mein lagata hai: rogue APs, intrusion detection (wIPS), location tracking.</td><td>Security monitoring</td></tr>
<tr><td><b>Sniffer</b></td><td>Nahi</td><td>Ek channel ke saare 802.11 frames capture karke protocol analyser chalane wale PC ko bhejta hai.</td><td>Deep troubleshooting</td></tr>
<tr><td><b>Rogue detector</b></td><td>Nahi</td><td>Radios off; wired side par sunta hai taaki LAN se jude rogue devices pakde.</td><td>Security</td></tr>
<tr><td><b>SE-Connect</b></td><td>Nahi</td><td>Dedicated spectrum analysis, microwave ovens jaise non-Wi-Fi interferers pehchanta hai.</td><td>RF troubleshooting</td></tr>
<tr><td><b>Bridge / mesh</b></td><td>Haan (optional)</td><td>APs ya buildings ko wirelessly jodta hai, point-to-point, point-to-multipoint ya mesh.</td><td>Outdoor, warehouses, campuses</td></tr></table>

<h3>Physical connections</h3>
<p>AP mode tay karta hai ki switch port kaise configure hoga:</p>
<ul>
<li><b>Local-mode AP</b>: AP management VLAN mein <b>access port</b>. Har VLAN ka client traffic CAPWAP ke andar hai, isliye switch ko sirf AP ka apna address dikhta hai. Lab mein SW1 Gi0/2 se Gi0/4 VLAN 10 ke access ports hain.</li>
<li><b>Local switching wala FlexConnect AP</b> ya kai SSIDs wala <b>autonomous AP</b>: <b>trunk port</b>, kyunki client frames AP se pehle se apne VLANs ke liye tagged nikalte hain.</li>
<li><b>WLC</b>: ek <b>trunk</b> jo uska management VLAN aur har client VLAN le jaata hai (yahan 20, 30 aur 99). Controllers aksar ports ko <b>LAG</b> mein bundle karte hain; AireOS controllers sirf static EtherChannel (<code>channel-group mode on</code>) support karte hain, LACP ya PAgP nahi.</li>
</ul>
<p>Engineers APs aur WLCs ko console, SSH (production mein kabhi Telnet nahi), HTTPS GUI, aur TACACS+ ya RADIUS ke saath central AAA se manage karte hain.</p>
<pre class="code"><span class="c">! SW1: local-mode AP port aur WLC trunk</span>
interface GigabitEthernet0/2
 description AP1
 switchport mode access
 switchport access vlan 10
interface GigabitEthernet0/1
 description trunk-to-WLC1
 switchport mode trunk</pre>

<p>Controller par AP ko monitor mode mein le ja sakte hain. Real WLC par mode badalne par AP reboot hota hai, isliye yeh shaant time mein karo:</p>
<pre class="code">(WLC1) &gt;config ap mode monitor AP3
(WLC1) &gt;show ap summary</pre>
<pre class="out">Number of APs.................................... 3

AP Name          Slots  AP Model     Ethernet MAC       IP Address       Clients  Mode     Join
---------------  -----  -----------  -----------------  ---------------  -------  -------  ---------
AP1              2      NK-AP3800    52:54:00:3a:11:01  10.10.10.11      4        Local    DHCP-43
AP2              2      NK-AP3800    52:54:00:3a:12:01  10.10.10.12      7        Local    DHCP-43
<span class="hl">AP3              2      NK-AP3800    52:54:00:3a:13:01  10.10.10.13      0        Monitor  DHCP-43</span></pre>

<div class="eg"><p><b>Worked example.</b> Ek company ka head office WLC1 ke saath hai aur 40 branches 20 Mbps WAN links se judi hain. Agar branch APs local mode mein hote, to same branch ke printer par print karne wala user job ko WAN se WLC tak aur wapas bhejta: chhote link par job size ka 2 guna, aur WAN down hone par kuch nahi chalta. Local switching wale FlexConnect mode mein print job branch switch par hi rehta hai, aur WAN outage mein bhi clients kaam karte rehte hain. Tab APs ke switch ports trunks hone chahiye jo branch client VLANs le jaayein.</p></div>

<div class="warn"><p><b>Common galti.</b> Local switching wale FlexConnect AP ko access port par lagana. AP client frames ko VLAN 20 aur 30 ke liye tag karta hai, access port unhe drop karta hai, aur clients associate to hote hain par kabhi IP address nahi paate.</p></div>

<div class="exam"><p><b>Exam trap.</b> Local mode default hai aur clients serve karta hai; monitor, sniffer, rogue detector aur SE-Connect nahi karte. FlexConnect un branches ka mode hai jinhe WAN failure jhelna ho. CAPWAP UDP 5246 (control) aur 5247 (data) use karta hai. Local-mode AP access port se judta hai; WLC trunk se.</p></div>

<div class="scn"><h4>WAN ke saath branch Wi-Fi mar jaata hai</h4><p>Jab bhi branch ka MPLS link flap hota, branch ke saare Wi-Fi clients connectivity kho dete, local file server tak bhi. APs local mode mein the, isliye har frame CAPWAP tunnel se head-office WLC tak jaata tha. Engineer ne branch APs ko staff WLAN ke liye local switching wale FlexConnect mein badla, unke switch ports ko AP VLAN native ke saath trunks banaya, aur WAN band karke test kiya: clients locally connected rahe.</p><p><b>Seekh:</b> site ke hisaab se AP mode chuno; WAN ke paar branches ko FlexConnect chahiye.</p></div>

<div class="iv"><p class="q">"Local mode aur FlexConnect mein kya fark hai?"</p><p>Strong answer: local mode mein AP saara client data CAPWAP se WLC tak tunnel karta hai, isliye WLC woh point hai jahan traffic wired network mein aata hai, aur AP access port se judta hai. FlexConnect mein AP client traffic ko site par VLANs mein locally switch kar sakta hai, use trunk port chahiye, aur WLC unreachable hone par standalone mode mein clients serve karta reh sakta hai. Batao ki FlexConnect WAN ke paar branches ke liye design hua hai, aur monitor aur sniffer jaise doosre modes koi client serve nahi karte.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Architectures: autonomous, WLC ke saath lightweight split-MAC, aur cloud-managed.</li>
<li>CAPWAP: UDP 5246 control (DTLS), UDP 5247 data.</li>
<li>Local = default, traffic WLC tak tunnel karta hai; FlexConnect = branches ke liye local switching aur WAN survival.</li>
<li>Monitor, sniffer, rogue detector aur SE-Connect clients serve nahi karte; bridge/mesh sites ko wirelessly jodta hai.</li>
<li>Local-mode AP access port par; FlexConnect ya autonomous AP aur WLC trunks par.</li>
</ul></div>
`}};export{e as default};