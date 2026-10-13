var e={id:`vlans`,h:{en:`VLANs and 802.1Q trunks`,hi:`VLANs aur 802.1Q trunks`},body:{en:`
<p>Picture one large office floor shared by three companies. Instead of building walls, the landlord gives each company a different colour of lanyard, and the rule is simple: people only hear announcements made to their own colour. Everyone uses the same corridors and lifts, yet the companies are separated. A <b>VLAN</b> (virtual LAN) is that coloured lanyard for Ethernet: one physical switch, many separate broadcast domains.</p>

<h3>What a VLAN is and why the DC uses them</h3>
<p>A VLAN is a Layer-2 broadcast domain identified by a number, the <b>VLAN ID</b>. Hosts in VLAN 10 can talk to each other directly; to reach VLAN 20 they must go through a router or an SVI (chapter 5 and lab 2). Data centers use VLANs to separate tiers (web, app, database), environments (production and test), traffic types (vMotion, storage, backup, management) and, historically, tenants.</p>

<h3>Access ports and trunk ports</h3>
<ul>
<li>An <b>access port</b> belongs to exactly one VLAN and sends and receives <b>untagged</b> frames. Use it for a bare-metal server with one network, or a management port.</li>
<li>A <b>trunk port</b> carries many VLANs over one link. Each frame carries an <b>802.1Q tag</b> saying which VLAN it belongs to. Use it between switches, and towards hypervisors, because one ESXi or KVM host carries dozens of VM VLANs on the same NICs.</li>
</ul>

<h3>The 802.1Q tag, byte by byte</h3>
<p>802.1Q inserts <b>4 bytes</b> between the source MAC and the original EtherType:</p>
<table class="cmp"><tr><th>Field</th><th>Bits</th><th>Meaning</th></tr>
<tr><td>TPID</td><td>16</td><td>Always 0x8100: "a VLAN tag follows"</td></tr>
<tr><td>PCP</td><td>3</td><td>Priority Code Point, class of service 0 to 7 (used by QoS and lossless storage traffic)</td></tr>
<tr><td>DEI</td><td>1</td><td>Drop Eligible Indicator (formerly CFI)</td></tr>
<tr><td>VID</td><td>12</td><td>VLAN ID, 0 to 4095</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="802.1Q tagged frame">
<rect x="10" y="30" width="90" height="40" rx="4" fill="#bae6fd"/><text x="55" y="55" text-anchor="middle" class="svg-ink" font-size="12">Dest MAC</text>
<rect x="100" y="30" width="90" height="40" rx="4" fill="#bae6fd"/><text x="145" y="55" text-anchor="middle" class="svg-ink" font-size="12">Src MAC</text>
<rect x="190" y="30" width="110" height="40" rx="4" fill="#fde68a"/><text x="245" y="55" text-anchor="middle" class="svg-ink" font-size="12">802.1Q 4B</text>
<rect x="300" y="30" width="80" height="40" rx="4" fill="#bae6fd"/><text x="340" y="55" text-anchor="middle" class="svg-ink" font-size="12">Type</text>
<rect x="380" y="30" width="190" height="40" rx="4" fill="#e2e8f0"/><text x="475" y="55" text-anchor="middle" class="svg-ink" font-size="12">Payload</text>
<rect x="570" y="30" width="60" height="40" rx="4" fill="#bae6fd"/><text x="600" y="55" text-anchor="middle" class="svg-ink" font-size="12">FCS</text>
<line x1="190" y1="70" x2="60" y2="110" stroke="#64748b"/><line x1="300" y1="70" x2="600" y2="110" stroke="#64748b"/>
<rect x="60" y="110" width="220" height="36" rx="4" fill="#fed7aa"/><text x="170" y="133" text-anchor="middle" class="svg-ink" font-size="12">TPID 0x8100 (16)</text>
<rect x="280" y="110" width="90" height="36" rx="4" fill="#ddd6fe"/><text x="325" y="133" text-anchor="middle" class="svg-ink" font-size="12">PCP (3)</text>
<rect x="370" y="110" width="70" height="36" rx="4" fill="#ddd6fe"/><text x="405" y="133" text-anchor="middle" class="svg-ink" font-size="12">DEI (1)</text>
<rect x="440" y="110" width="160" height="36" rx="4" fill="#bbf7d0"/><text x="520" y="133" text-anchor="middle" class="svg-ink" font-size="12">VLAN ID (12)</text>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">The switch recalculates the FCS when it adds or removes the tag</text>
</svg><p class="cap">The 4-byte tag sits between the source MAC and the EtherType.</p></div>

<div class="eg"><p><b>Worked example: why only 4094 VLANs?</b> The VID has 12 bits, so 2^12 = 4096 values (0 to 4095). VLAN 0 means "priority tag only" and 4095 is reserved, leaving <b>1 to 4094</b>. On Nexus switches a block of VLANs (by default <b>3968 to 4095</b>) is reserved for internal use, so you actually get fewer. A cloud provider with 5,000 customers, each needing several segments, runs out immediately. That limit is exactly why <b>VXLAN</b> uses a 24-bit VNI: 2^24 = 16,777,216 segments.</p></div>

<h3>The native VLAN</h3>
<p>On an 802.1Q trunk, one VLAN is sent <b>untagged</b>: the <b>native VLAN</b> (VLAN 1 by default). Both ends must agree, or frames leak between VLANs and spanning tree complains of a native VLAN mismatch. Good practice: set the native VLAN to an unused VLAN (for example 999) on both sides, never put hosts in VLAN 1, and optionally tag the native VLAN globally with <code>vlan dot1q tag native</code>.</p>

<h3>Configuring VLANs and trunks on NX-OS</h3>
<pre class="code"><span class="c">! create and name VLANs (NX-OS accepts ranges and lists)</span>
LEAF1(config)# vlan 10
LEAF1(config-vlan)# name WEB
LEAF1(config-vlan)# vlan 20
LEAF1(config-vlan)# name APP
<span class="c">! access port to a bare-metal server</span>
LEAF1(config)# interface Ethernet1/5
LEAF1(config-if)# switchport
LEAF1(config-if)# switchport mode access
LEAF1(config-if)# switchport access vlan 10
LEAF1(config-if)# no shutdown
<span class="c">! trunk towards a hypervisor or another switch</span>
LEAF1(config)# interface Ethernet1/1
LEAF1(config-if)# switchport
LEAF1(config-if)# switchport mode trunk
LEAF1(config-if)# switchport trunk native vlan 999
LEAF1(config-if)# switchport trunk allowed vlan 10,20
<span class="c">! later: ADD vlan 30 without removing 10 and 20</span>
LEAF1(config-if)# switchport trunk allowed vlan add 30</pre>
<p>Note that NX-OS does not run DTP; trunks are always configured statically with <code>switchport mode trunk</code>. The command <code>switchport</code> turns a routed port into a Layer-2 port (on many Nexus models ports default to routed).</p>

<pre class="out">LEAF1# show interface trunk
--------------------------------------------------------------------------------
Port          Native  Status        Port
              Vlan                  Channel
--------------------------------------------------------------------------------
Eth1/1        999     trunking      --
--------------------------------------------------------------------------------
Port          Vlans Allowed on Trunk
--------------------------------------------------------------------------------
<span class="hl">Eth1/1        10,20,30</span></pre>
<pre class="out">LEAF1# show vlan brief
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Eth1/7, Eth1/8
10   WEB                              active    Eth1/1, Eth1/5
20   APP                              active    Eth1/1, Eth1/6</pre>

<div class="warn"><p><b>Common mistakes.</b> Typing <code>switchport trunk allowed vlan 30</code> when you meant <code>add 30</code>: this <b>replaces</b> the whole list and cuts off VLANs 10 and 20 on a live hypervisor. Creating the VLAN on one leaf but not the other (a trunk cannot carry a VLAN that does not exist locally). Native VLAN mismatch between two switches.</p></div>
<div class="exam"><p><b>Exam tip.</b> 802.1Q tag = 4 bytes: TPID 0x8100 (16 bits), PCP (3), DEI (1), VID (12). Usable VLANs 1 to 4094. Native VLAN is untagged. VXLAN VNI = 24 bits.</p></div>

<div class="scn"><h4>The "add" that was forgotten</h4><p>A change request asked to add VLAN 350 to the trunks of eight ESXi hosts. The engineer pasted <code>switchport trunk allowed vlan 350</code> on the first host port. Within seconds, 90 VMs on that host lost connectivity, because the trunk now carried only VLAN 350. The monitoring alarm pointed at the host, <code>show interface trunk</code> showed a single VLAN allowed, and the engineer restored the previous list from the running configuration backup. The team then added a pre-check to every trunk change script.</p><p><b>Lesson:</b> always use <code>add</code> or <code>remove</code> on production trunks, and read the result with <code>show interface trunk</code>.</p></div>

<div class="iv"><p class="q">"What is the difference between an access port and a trunk, and what is the native VLAN?"</p><p>Strong answer: an access port carries one VLAN untagged; a trunk carries many VLANs with 802.1Q tags (4 bytes, 12-bit VID). The native VLAN is the one untagged VLAN on a trunk and must match on both ends. Mention the <code>add</code> keyword, the 4094 limit, and that the DC moved to VXLAN (24-bit VNI) for scale.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VLAN is one broadcast domain; hosts in different VLANs need routing.</li>
<li>Access port = one untagged VLAN; trunk = many tagged VLANs (servers with hypervisors use trunks).</li>
<li>802.1Q adds 4 bytes; the 12-bit VID limits you to 4094 VLANs, minus Nexus reserved VLANs.</li>
<li>Match native VLANs; use an unused native VLAN; never put hosts in VLAN 1.</li>
<li>Use <code>switchport trunk allowed vlan add</code> on live trunks.</li>
</ul></div>
`,hi:`
<p>Ek bada office floor socho jo teen companies share karti hain. Deewaarein banane ki jagah landlord har company ko alag rang ka lanyard deta hai, aur rule simple hai: log sirf apne rang wale announcements sunte hain. Sab same corridors aur lifts use karte hain, phir bhi companies alag hain. <b>VLAN</b> (virtual LAN) Ethernet ke liye wahi rangeen lanyard hai: ek physical switch, kai alag broadcast domains.</p>

<h3>VLAN kya hai aur DC inhe kyun use karta hai</h3>
<p>VLAN ek Layer-2 broadcast domain hai jise ek number se pehchaana jaata hai, <b>VLAN ID</b>. VLAN 10 ke hosts ek dusre se seedha baat kar sakte hain; VLAN 20 tak pahunchne ke liye unhe router ya SVI se hokar jaana padta hai (chapter 5 aur lab 2). Data centers VLANs use karte hain tiers (web, app, database), environments (production aur test), traffic types (vMotion, storage, backup, management) aur, pehle ke zamaane mein, tenants ko alag karne ke liye.</p>

<h3>Access ports aur trunk ports</h3>
<ul>
<li><b>Access port</b> exactly ek VLAN ka hota hai aur <b>untagged</b> frames bhejta aur leta hai. Ise ek network wale bare-metal server, ya management port ke liye use karo.</li>
<li><b>Trunk port</b> ek link par kai VLANs le jaata hai. Har frame ek <b>802.1Q tag</b> rakhta hai jo batata hai ki woh kis VLAN ka hai. Ise switches ke beech, aur hypervisors ki taraf use karo, kyunki ek ESXi ya KVM host same NICs par darjanon VM VLANs le jaata hai.</li>
</ul>

<h3>802.1Q tag, byte by byte</h3>
<p>802.1Q source MAC aur original EtherType ke beech <b>4 bytes</b> daalta hai:</p>
<table class="cmp"><tr><th>Field</th><th>Bits</th><th>Matlab</th></tr>
<tr><td>TPID</td><td>16</td><td>Hamesha 0x8100: "aage VLAN tag hai"</td></tr>
<tr><td>PCP</td><td>3</td><td>Priority Code Point, class of service 0 se 7 (QoS aur lossless storage traffic use karte hain)</td></tr>
<tr><td>DEI</td><td>1</td><td>Drop Eligible Indicator (pehle CFI)</td></tr>
<tr><td>VID</td><td>12</td><td>VLAN ID, 0 se 4095</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="802.1Q tagged frame">
<rect x="10" y="30" width="90" height="40" rx="4" fill="#bae6fd"/><text x="55" y="55" text-anchor="middle" class="svg-ink" font-size="12">Dest MAC</text>
<rect x="100" y="30" width="90" height="40" rx="4" fill="#bae6fd"/><text x="145" y="55" text-anchor="middle" class="svg-ink" font-size="12">Src MAC</text>
<rect x="190" y="30" width="110" height="40" rx="4" fill="#fde68a"/><text x="245" y="55" text-anchor="middle" class="svg-ink" font-size="12">802.1Q 4B</text>
<rect x="300" y="30" width="80" height="40" rx="4" fill="#bae6fd"/><text x="340" y="55" text-anchor="middle" class="svg-ink" font-size="12">Type</text>
<rect x="380" y="30" width="190" height="40" rx="4" fill="#e2e8f0"/><text x="475" y="55" text-anchor="middle" class="svg-ink" font-size="12">Payload</text>
<rect x="570" y="30" width="60" height="40" rx="4" fill="#bae6fd"/><text x="600" y="55" text-anchor="middle" class="svg-ink" font-size="12">FCS</text>
<line x1="190" y1="70" x2="60" y2="110" stroke="#64748b"/><line x1="300" y1="70" x2="600" y2="110" stroke="#64748b"/>
<rect x="60" y="110" width="220" height="36" rx="4" fill="#fed7aa"/><text x="170" y="133" text-anchor="middle" class="svg-ink" font-size="12">TPID 0x8100 (16)</text>
<rect x="280" y="110" width="90" height="36" rx="4" fill="#ddd6fe"/><text x="325" y="133" text-anchor="middle" class="svg-ink" font-size="12">PCP (3)</text>
<rect x="370" y="110" width="70" height="36" rx="4" fill="#ddd6fe"/><text x="405" y="133" text-anchor="middle" class="svg-ink" font-size="12">DEI (1)</text>
<rect x="440" y="110" width="160" height="36" rx="4" fill="#bbf7d0"/><text x="520" y="133" text-anchor="middle" class="svg-ink" font-size="12">VLAN ID (12)</text>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">Tag jodne ya hatane par switch FCS dobara calculate karta hai</text>
</svg><p class="cap">4-byte tag source MAC aur EtherType ke beech baithta hai.</p></div>

<div class="eg"><p><b>Worked example: sirf 4094 VLANs kyun?</b> VID mein 12 bits hain, to 2^12 = 4096 values (0 se 4095). VLAN 0 ka matlab "sirf priority tag" hai aur 4095 reserved hai, bachte hain <b>1 se 4094</b>. Nexus switches par VLANs ka ek block (default mein <b>3968 se 4095</b>) internal use ke liye reserved hota hai, isliye asal mein aur kam milte hain. 5,000 customers wala cloud provider, jisme har ek ko kai segments chahiye, turant khatam ho jaata hai. Yahi limit wajah hai ki <b>VXLAN</b> 24-bit VNI use karta hai: 2^24 = 16,777,216 segments.</p></div>

<h3>Native VLAN</h3>
<p>802.1Q trunk par ek VLAN <b>untagged</b> bheja jaata hai: <b>native VLAN</b> (default mein VLAN 1). Dono ends ko agree karna chahiye, warna frames VLANs ke beech leak hote hain aur spanning tree native VLAN mismatch ki shikayat karta hai. Good practice: dono sides par native VLAN ko ek unused VLAN (jaise 999) par set karo, hosts ko kabhi VLAN 1 mein mat daalo, aur optionally <code>vlan dot1q tag native</code> se native VLAN ko globally tag karo.</p>

<h3>NX-OS par VLANs aur trunks configure karna</h3>
<pre class="code"><span class="c">! VLANs banao aur naam do (NX-OS ranges aur lists accept karta hai)</span>
LEAF1(config)# vlan 10
LEAF1(config-vlan)# name WEB
LEAF1(config-vlan)# vlan 20
LEAF1(config-vlan)# name APP
<span class="c">! bare-metal server ke liye access port</span>
LEAF1(config)# interface Ethernet1/5
LEAF1(config-if)# switchport
LEAF1(config-if)# switchport mode access
LEAF1(config-if)# switchport access vlan 10
LEAF1(config-if)# no shutdown
<span class="c">! hypervisor ya dusre switch ki taraf trunk</span>
LEAF1(config)# interface Ethernet1/1
LEAF1(config-if)# switchport
LEAF1(config-if)# switchport mode trunk
LEAF1(config-if)# switchport trunk native vlan 999
LEAF1(config-if)# switchport trunk allowed vlan 10,20
<span class="c">! baad mein: 10 aur 20 hataaye bina vlan 30 ADD karo</span>
LEAF1(config-if)# switchport trunk allowed vlan add 30</pre>
<p>Dhyaan do ki NX-OS DTP nahi chalata; trunks hamesha <code>switchport mode trunk</code> se statically configure hote hain. <code>switchport</code> command routed port ko Layer-2 port bana deta hai (kai Nexus models par ports default mein routed hote hain).</p>

<pre class="out">LEAF1# show interface trunk
--------------------------------------------------------------------------------
Port          Native  Status        Port
              Vlan                  Channel
--------------------------------------------------------------------------------
Eth1/1        999     trunking      --
--------------------------------------------------------------------------------
Port          Vlans Allowed on Trunk
--------------------------------------------------------------------------------
<span class="hl">Eth1/1        10,20,30</span></pre>
<pre class="out">LEAF1# show vlan brief
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Eth1/7, Eth1/8
10   WEB                              active    Eth1/1, Eth1/5
20   APP                              active    Eth1/1, Eth1/6</pre>

<div class="warn"><p><b>Common galtiyan.</b> <code>add 30</code> ki jagah <code>switchport trunk allowed vlan 30</code> type karna: yeh poori list ko <b>replace</b> kar deta hai aur live hypervisor par VLANs 10 aur 20 kaat deta hai. Ek leaf par VLAN banana lekin dusre par nahi (trunk woh VLAN nahi le ja sakta jo locally exist nahi karta). Do switches ke beech native VLAN mismatch.</p></div>
<div class="exam"><p><b>Exam tip.</b> 802.1Q tag = 4 bytes: TPID 0x8100 (16 bits), PCP (3), DEI (1), VID (12). Usable VLANs 1 se 4094. Native VLAN untagged hota hai. VXLAN VNI = 24 bits.</p></div>

<div class="scn"><h4>Bhoola hua "add"</h4><p>Ek change request mein aath ESXi hosts ke trunks par VLAN 350 add karna tha. Engineer ne pehle host port par <code>switchport trunk allowed vlan 350</code> paste kar diya. Kuch seconds mein us host ke 90 VMs ki connectivity chali gayi, kyunki trunk ab sirf VLAN 350 le ja raha tha. Monitoring alarm ne host ki taraf point kiya, <code>show interface trunk</code> ne ek hi VLAN allowed dikhaya, aur engineer ne running configuration backup se pichhli list restore ki. Team ne phir har trunk change script mein ek pre-check joda.</p><p><b>Seekh:</b> production trunks par hamesha <code>add</code> ya <code>remove</code> use karo, aur result <code>show interface trunk</code> se padho.</p></div>

<div class="iv"><p class="q">"Access port aur trunk mein kya farak hai, aur native VLAN kya hai?"</p><p>Strong answer: access port ek VLAN untagged le jaata hai; trunk kai VLANs 802.1Q tags ke saath le jaata hai (4 bytes, 12-bit VID). Native VLAN trunk par woh ek untagged VLAN hai aur dono ends par match hona chahiye. <code>add</code> keyword, 4094 limit ka zikr karo, aur bolo ki scale ke liye DC VXLAN (24-bit VNI) par gaya.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VLAN ek broadcast domain hai; alag VLANs ke hosts ko routing chahiye.</li>
<li>Access port = ek untagged VLAN; trunk = kai tagged VLANs (hypervisor wale servers trunks use karte hain).</li>
<li>802.1Q 4 bytes jodta hai; 12-bit VID aapko 4094 VLANs tak limit karta hai, Nexus reserved VLANs minus.</li>
<li>Native VLANs match karo; unused native VLAN use karo; hosts ko kabhi VLAN 1 mein mat daalo.</li>
<li>Live trunks par <code>switchport trunk allowed vlan add</code> use karo.</li>
</ul></div>
`}};export{e as default};