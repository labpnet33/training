var e={id:`trunks-dtp-vtp`,h:{en:`Troubleshooting 802.1Q trunks: static, DTP and VTP`,hi:`802.1Q trunks troubleshoot karna: static, DTP aur VTP`},body:{en:`
<p>Two neighbouring shops want to share one delivery van. They can sign a fixed contract ("the van is shared, full stop"), or the two managers can talk every morning and decide whether to share today. The fixed contract is a <b>static trunk</b>. The morning chat is <b>DTP</b> (Dynamic Trunking Protocol). The chat is convenient, but if one manager is on leave or they speak different languages, no van gets shared, and nobody notices until the parcels pile up.</p>

<h3>Static trunks: the 802.1Q tag in one paragraph</h3>
<p>A trunk carries frames of many VLANs on one link. 802.1Q inserts a 4-byte tag after the source MAC: <b>TPID 0x8100</b>, 3 bits <b>PCP</b> (CoS priority), 1 bit <b>DEI</b> and a 12-bit <b>VLAN ID</b> (1-4094 usable). Frames of the <b>native VLAN</b> are sent untagged (chapter 4). The old Cisco ISL encapsulation is gone from current Catalyst platforms, but on switches that still support both you must choose the encapsulation before forcing trunk mode:</p>
<pre class="code">SW1(config)# interface range GigabitEthernet0/1 - 2
SW1(config-if-range)# switchport trunk encapsulation dot1q   <span class="c">! only on ISL-capable models</span>
SW1(config-if-range)# switchport mode trunk
SW1(config-if-range)# switchport nonegotiate                 <span class="c">! stop sending DTP</span></pre>
<p>This is exactly the startup configuration of every inter-switch link in the MST labs. If you skip the encapsulation line on an ISL-capable switch, IOS refuses with <code>Command rejected: An interface whose trunk encapsulation is "Auto" can not be configured to "trunk" mode.</code></p>

<h3>DTP: dynamic trunks</h3>
<p>DTP is Cisco-proprietary. A port in a dynamic mode sends DTP frames (every 30 seconds, to multicast 0100.0ccc.cccc) and the two ends agree on trunk or access. The default on most current Catalyst access switches, including the Catalyst 9000 family, is <b>dynamic auto</b>.</p>
<table class="cmp"><tr><th>Local \\ Remote</th><th>dynamic auto</th><th>dynamic desirable</th><th>trunk</th><th>access</th></tr>
<tr><td><b>dynamic auto</b></td><td>access</td><td>trunk</td><td>trunk</td><td>access</td></tr>
<tr><td><b>dynamic desirable</b></td><td>trunk</td><td>trunk</td><td>trunk</td><td>access</td></tr>
<tr><td><b>trunk</b></td><td>trunk</td><td>trunk</td><td>trunk</td><td>mismatch</td></tr>
<tr><td><b>access</b></td><td>access</td><td>access</td><td>mismatch</td><td>access</td></tr></table>
<p>Two rules explain the whole table: <b>auto never starts</b> a negotiation, it only answers; and <b>nonegotiate</b> means "do not send DTP", so a <code>trunk</code> + <code>nonegotiate</code> port facing a dynamic port leaves the dynamic side as access: a mismatch.</p>

<h3>DTP carries the VTP domain</h3>
<p>This is the classic CCNP trap. DTP frames include the <b>VTP domain name</b>. If the two switches have different, non-empty VTP domain names, dynamic negotiation fails even though the modes are compatible:</p>
<pre class="out">%DTP-5-DOMAINMISMATCH: Unable to perform trunk negotiation on port Gi0/2 because of VTP domain mismatch.</pre>
<p>A hard-coded <code>switchport mode trunk</code> still trunks; only the dynamic modes care.</p>

<h3>Verifying a trunk</h3>
<pre class="out">SW3# show interfaces GigabitEthernet0/2 switchport
Name: Gi0/2
Switchport: Enabled
<span class="hl">Administrative Mode: dynamic auto</span>
<span class="hl">Operational Mode: static access</span>
Administrative Trunking Encapsulation: dot1q
Operational Trunking Encapsulation: native
Negotiation of Trunking: On
Access Mode VLAN: 1 (default)
Trunking Native Mode VLAN: 1 (default)</pre>
<p>Administrative mode is what you configured; operational mode is what happened. "dynamic auto" that became "static access" means the neighbour never asked. <code>show dtp interface Gi0/2</code> shows the DTP state and counters, and <code>show interfaces trunk</code> lists only ports that are actually trunking.</p>

<h3>VTP: the protocol that can delete your VLANs</h3>
<p><b>VTP</b> (VLAN Trunking Protocol) shares the VLAN database over trunks inside a <b>VTP domain</b>. Modes: <b>server</b> (create and advertise), <b>client</b> (learn only), <b>transparent</b> (keeps its own VLANs, relays advertisements) and <b>off</b> (keeps its own VLANs, relays nothing). Every change increments the <b>configuration revision</b>; a switch with a <b>higher revision</b> in the same domain wins, even if its VLAN list is empty.</p>
<table class="cmp"><tr><th>Version</th><th>What it adds</th></tr>
<tr><td>VTPv1/v2</td><td>VLANs 1-1005 only; v2 adds Token Ring support and transparent switches relay regardless of version</td></tr>
<tr><td>VTPv3</td><td>Only the <b>primary server</b> (<code>vtp primary</code>) may change the database; extended VLANs 1006-4094, private VLANs, and it can also distribute the MST region configuration</td></tr></table>
<p><b>VTP pruning</b> stops flooding a VLAN over a trunk toward switches that have no ports in it. VLAN 1 and the extended range are never pruned.</p>

<div class="eg"><p><b>Worked example: the VTP bomb.</b> A lab switch was once server in domain "NK" and reached revision 42 while engineers created and deleted VLANs. Production switches in domain "NK" sit at revision 14. Someone connects the lab switch with a dynamic desirable port to an access switch. DTP forms a trunk (same domain), VTP sees revision 42 &gt; 14, and every switch in the domain replaces its VLAN database with the lab switch's list, which contains only VLAN 1. All access ports in VLANs 10-40 go inactive. Prevention: set new switches to transparent or VTPv3 before connecting them (changing the domain name or moving to transparent resets the revision to 0), use VTPv3 with a primary server, or run <code>vtp mode off</code>.</p></div>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="DTP and VTP decision flow">
<rect x="20" y="70" width="150" height="56" rx="8" fill="#e2e8f0"/><text x="95" y="94" text-anchor="middle" class="svg-ink" font-size="13">Modes compatible?</text><text x="95" y="112" text-anchor="middle" class="svg-muted" font-size="12">matrix above</text>
<rect x="235" y="70" width="170" height="56" rx="8" fill="#fde68a"/><text x="320" y="94" text-anchor="middle" class="svg-ink" font-size="13">VTP domain match?</text><text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="12">only for dynamic modes</text>
<rect x="470" y="70" width="150" height="56" rx="8" fill="#bbf7d0"/><text x="545" y="94" text-anchor="middle" class="svg-ink" font-size="13">Trunk formed</text><text x="545" y="112" text-anchor="middle" class="svg-muted" font-size="12">then check VLANs</text>
<line x1="170" y1="98" x2="235" y2="98" stroke="#64748b" stroke-width="2"/><line x1="405" y1="98" x2="470" y2="98" stroke="#64748b" stroke-width="2"/>
<text x="202" y="90" text-anchor="middle" class="svg-accent" font-size="12">yes</text><text x="437" y="90" text-anchor="middle" class="svg-accent" font-size="12">yes</text>
<text x="95" y="150" text-anchor="middle" class="svg-muted" font-size="12">no: access or mismatch</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">no: DOMAINMISMATCH</text>
</svg><p class="cap">A dynamic trunk needs compatible modes and matching VTP domains; a static trunk skips both checks.</p></div>

<div class="warn"><p><b>Common mistake.</b> Leaving ports in the default dynamic auto and assuming "the other side is trunk, so it works". It does, until someone adds <code>switchport nonegotiate</code> on the other side during hardening. Best practice: hard-code both ends (<code>switchport mode trunk</code> + <code>nonegotiate</code>) and set every user port to <code>switchport mode access</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> auto + auto = access, not trunk. <code>nonegotiate</code> is only accepted on ports in access or trunk mode, never in a dynamic mode. And a VTP client with a higher revision can overwrite a server; the mode does not protect you, the revision decides.</p></div>

<div class="scn"><h4>The new switch that would not trunk</h4><p>An engineer replaced a failed access switch. The uplink came up but stayed in access mode, and every user VLAN was dead. <code>show interfaces switchport</code> on both ends showed dynamic auto (the new switch) and dynamic desirable (the distribution), which should trunk. The log held <code>%DTP-5-DOMAINMISMATCH</code>: the new switch arrived with VTP domain "LAB" from staging. The fix was <code>vtp domain NK</code> plus <code>vtp mode transparent</code>, and in the next window both ends were hard-coded as trunks with <code>nonegotiate</code>.</p><p><b>Lesson:</b> when compatible DTP modes do not trunk, compare VTP domain names.</p></div>

<div class="iv"><p class="q">"Two switches are connected; both ports are dynamic auto. What happens and how would you fix it?"</p><p>Strong answer: both ends only respond to DTP, nobody initiates, so the link stays an access link in VLAN 1. Fix by configuring <code>switchport mode trunk</code> on both ends and disabling DTP with <code>switchport nonegotiate</code>. Add that DTP also checks the VTP domain name, and that disabling DTP removes the switch-spoofing attack vector.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static trunk = <code>switchport mode trunk</code>; add <code>nonegotiate</code> to stop DTP.</li>
<li>DTP: desirable initiates, auto only answers; auto + auto stays access.</li>
<li>Dynamic trunking fails if VTP domain names differ (%DTP-5-DOMAINMISMATCH).</li>
<li>VTP: the highest configuration revision in the domain wins; v3 adds a primary server to prevent accidents.</li>
<li>Compare Administrative Mode and Operational Mode in <code>show interfaces switchport</code>.</li>
</ul></div>
`,hi:`
<p>Do padosi dukaanein ek delivery van share karna chahti hain. Woh ek fixed contract sign kar sakti hain ("van share hai, bas"), ya dono managers roz subah baat karke decide kar sakte hain ki aaj share karna hai ya nahi. Fixed contract <b>static trunk</b> hai. Subah ki baatcheet <b>DTP</b> (Dynamic Trunking Protocol) hai. Baatcheet convenient hai, lekin agar ek manager chhutti par ho ya dono alag bhasha bolte hon, to van share nahi hoti, aur jab tak parcels ka dher na lag jaaye kisi ko pata nahi chalta.</p>

<h3>Static trunks: ek paragraph mein 802.1Q tag</h3>
<p>Trunk ek link par kai VLANs ke frames le jaata hai. 802.1Q source MAC ke baad 4-byte tag daalta hai: <b>TPID 0x8100</b>, 3 bits <b>PCP</b> (CoS priority), 1 bit <b>DEI</b> aur 12-bit <b>VLAN ID</b> (1-4094 usable). <b>Native VLAN</b> ke frames untagged jaate hain (chapter 4). Purana Cisco ISL encapsulation current Catalyst platforms se hat chuka hai, lekin jo switches abhi bhi dono support karte hain unpar trunk mode force karne se pehle encapsulation choose karna padta hai:</p>
<pre class="code">SW1(config)# interface range GigabitEthernet0/1 - 2
SW1(config-if-range)# switchport trunk encapsulation dot1q   <span class="c">! sirf ISL-capable models par</span>
SW1(config-if-range)# switchport mode trunk
SW1(config-if-range)# switchport nonegotiate                 <span class="c">! DTP bhejna band</span></pre>
<p>MST labs mein har inter-switch link ki startup configuration bilkul yahi hai. Agar ISL-capable switch par encapsulation line chhod doge, to IOS mana kar deta hai: <code>Command rejected: An interface whose trunk encapsulation is "Auto" can not be configured to "trunk" mode.</code></p>

<h3>DTP: dynamic trunks</h3>
<p>DTP Cisco-proprietary hai. Dynamic mode wala port DTP frames bhejta hai (har 30 second, multicast 0100.0ccc.cccc par) aur dono ends trunk ya access par agree karte hain. Zyada tar current Catalyst access switches par, Catalyst 9000 family samet, default <b>dynamic auto</b> hai.</p>
<table class="cmp"><tr><th>Local \\ Remote</th><th>dynamic auto</th><th>dynamic desirable</th><th>trunk</th><th>access</th></tr>
<tr><td><b>dynamic auto</b></td><td>access</td><td>trunk</td><td>trunk</td><td>access</td></tr>
<tr><td><b>dynamic desirable</b></td><td>trunk</td><td>trunk</td><td>trunk</td><td>access</td></tr>
<tr><td><b>trunk</b></td><td>trunk</td><td>trunk</td><td>trunk</td><td>mismatch</td></tr>
<tr><td><b>access</b></td><td>access</td><td>access</td><td>mismatch</td><td>access</td></tr></table>
<p>Do rules poori table samjha dete hain: <b>auto kabhi negotiation shuru nahi karta</b>, sirf jawab deta hai; aur <b>nonegotiate</b> ka matlab hai "DTP mat bhejo", isliye dynamic port ke saamne <code>trunk</code> + <code>nonegotiate</code> port dynamic side ko access hi chhod deta hai: mismatch.</p>

<h3>DTP VTP domain le jaata hai</h3>
<p>Yeh classic CCNP trap hai. DTP frames mein <b>VTP domain name</b> hota hai. Agar do switches ke VTP domain names alag aur non-empty hain, to dynamic negotiation fail hoti hai, chahe modes compatible hon:</p>
<pre class="out">%DTP-5-DOMAINMISMATCH: Unable to perform trunk negotiation on port Gi0/2 because of VTP domain mismatch.</pre>
<p>Hard-coded <code>switchport mode trunk</code> phir bhi trunk banata hai; sirf dynamic modes ko farak padta hai.</p>

<h3>Trunk verify karna</h3>
<pre class="out">SW3# show interfaces GigabitEthernet0/2 switchport
Name: Gi0/2
Switchport: Enabled
<span class="hl">Administrative Mode: dynamic auto</span>
<span class="hl">Operational Mode: static access</span>
Administrative Trunking Encapsulation: dot1q
Operational Trunking Encapsulation: native
Negotiation of Trunking: On
Access Mode VLAN: 1 (default)
Trunking Native Mode VLAN: 1 (default)</pre>
<p>Administrative mode woh hai jo aapne configure kiya; operational mode woh hai jo hua. "dynamic auto" jo "static access" ban gaya, matlab neighbour ne kabhi poocha hi nahi. <code>show dtp interface Gi0/2</code> DTP state aur counters dikhata hai, aur <code>show interfaces trunk</code> sirf woh ports list karta hai jo sach mein trunk kar rahe hain.</p>

<h3>VTP: woh protocol jo aapke VLANs delete kar sakta hai</h3>
<p><b>VTP</b> (VLAN Trunking Protocol) ek <b>VTP domain</b> ke andar trunks par VLAN database share karta hai. Modes: <b>server</b> (banao aur advertise karo), <b>client</b> (sirf seekho), <b>transparent</b> (apne VLANs rakhta hai, advertisements relay karta hai) aur <b>off</b> (apne VLANs rakhta hai, kuch relay nahi karta). Har change <b>configuration revision</b> badhata hai; same domain mein <b>zyada revision</b> wala switch jeetta hai, chahe uski VLAN list khaali ho.</p>
<table class="cmp"><tr><th>Version</th><th>Kya jodta hai</th></tr>
<tr><td>VTPv1/v2</td><td>Sirf VLANs 1-1005; v2 Token Ring support jodta hai aur transparent switches version dekhe bina relay karte hain</td></tr>
<tr><td>VTPv3</td><td>Sirf <b>primary server</b> (<code>vtp primary</code>) database badal sakta hai; extended VLANs 1006-4094, private VLANs, aur yeh MST region configuration bhi distribute kar sakta hai</td></tr></table>
<p><b>VTP pruning</b> kisi VLAN ko un switches ki taraf trunk par flood karna rokta hai jinke paas us VLAN mein koi port nahi. VLAN 1 aur extended range kabhi prune nahi hote.</p>

<div class="eg"><p><b>Worked example: VTP bomb.</b> Ek lab switch kabhi domain "NK" mein server tha aur engineers ke VLANs banane aur delete karne se revision 42 tak pahunch gaya. Domain "NK" ke production switches revision 14 par hain. Koi lab switch ko dynamic desirable port se ek access switch se jod deta hai. DTP trunk banata hai (same domain), VTP dekhta hai revision 42 &gt; 14, aur domain ka har switch apna VLAN database lab switch ki list se replace kar deta hai, jisme sirf VLAN 1 hai. VLANs 10-40 ke saare access ports inactive ho jaate hain. Bachav: naye switches ko jodne se pehle transparent ya VTPv3 par set karo (domain name badalne ya transparent par jaane se revision 0 ho jaata hai), primary server ke saath VTPv3 use karo, ya <code>vtp mode off</code> chalao.</p></div>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="DTP and VTP decision flow">
<rect x="20" y="70" width="150" height="56" rx="8" fill="#e2e8f0"/><text x="95" y="94" text-anchor="middle" class="svg-ink" font-size="13">Modes compatible?</text><text x="95" y="112" text-anchor="middle" class="svg-muted" font-size="12">upar ka matrix</text>
<rect x="235" y="70" width="170" height="56" rx="8" fill="#fde68a"/><text x="320" y="94" text-anchor="middle" class="svg-ink" font-size="13">VTP domain match?</text><text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="12">sirf dynamic modes ke liye</text>
<rect x="470" y="70" width="150" height="56" rx="8" fill="#bbf7d0"/><text x="545" y="94" text-anchor="middle" class="svg-ink" font-size="13">Trunk ban gaya</text><text x="545" y="112" text-anchor="middle" class="svg-muted" font-size="12">phir VLANs check karo</text>
<line x1="170" y1="98" x2="235" y2="98" stroke="#64748b" stroke-width="2"/><line x1="405" y1="98" x2="470" y2="98" stroke="#64748b" stroke-width="2"/>
<text x="202" y="90" text-anchor="middle" class="svg-accent" font-size="12">haan</text><text x="437" y="90" text-anchor="middle" class="svg-accent" font-size="12">haan</text>
<text x="95" y="150" text-anchor="middle" class="svg-muted" font-size="12">nahi: access ya mismatch</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">nahi: DOMAINMISMATCH</text>
</svg><p class="cap">Dynamic trunk ko compatible modes aur matching VTP domains chahiye; static trunk dono checks skip karta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Ports ko default dynamic auto par chhod dena aur maan lena ki "doosri side trunk hai, to chalega". Chalta hai, jab tak hardening ke dauraan koi doosri side par <code>switchport nonegotiate</code> na laga de. Best practice: dono ends hard-code karo (<code>switchport mode trunk</code> + <code>nonegotiate</code>) aur har user port ko <code>switchport mode access</code> par set karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> auto + auto = access, trunk nahi. <code>nonegotiate</code> sirf access ya trunk mode wale ports par accept hota hai, dynamic mode mein kabhi nahi. Aur zyada revision wala VTP client bhi server ko overwrite kar sakta hai; mode aapko nahi bachata, revision decide karta hai.</p></div>

<div class="scn"><h4>Naya switch jo trunk nahi ban raha tha</h4><p>Ek engineer ne kharab access switch replace kiya. Uplink up hua lekin access mode mein hi raha, aur har user VLAN dead tha. Dono ends par <code>show interfaces switchport</code> ne dynamic auto (naya switch) aur dynamic desirable (distribution) dikhaya, jo trunk banna chahiye tha. Log mein <code>%DTP-5-DOMAINMISMATCH</code> tha: naya switch staging se VTP domain "LAB" ke saath aaya tha. Fix tha <code>vtp domain NK</code> plus <code>vtp mode transparent</code>, aur agli window mein dono ends ko <code>nonegotiate</code> ke saath trunk hard-code kiya gaya.</p><p><b>Seekh:</b> jab compatible DTP modes trunk na banayein, to VTP domain names compare karo.</p></div>

<div class="iv"><p class="q">"Do switches jude hain; dono ports dynamic auto hain. Kya hoga aur aap kaise fix karoge?"</p><p>Strong answer: dono ends sirf DTP ka jawab dete hain, koi shuru nahi karta, isliye link VLAN 1 mein access link hi rehta hai. Fix: dono ends par <code>switchport mode trunk</code> configure karo aur <code>switchport nonegotiate</code> se DTP band karo. Yeh bhi jodo ki DTP VTP domain name bhi check karta hai, aur DTP band karne se switch-spoofing attack ka raasta band hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static trunk = <code>switchport mode trunk</code>; DTP rokne ke liye <code>nonegotiate</code> jodo.</li>
<li>DTP: desirable shuru karta hai, auto sirf jawab deta hai; auto + auto access hi rehta hai.</li>
<li>VTP domain names alag hon to dynamic trunking fail hoti hai (%DTP-5-DOMAINMISMATCH).</li>
<li>VTP: domain mein sabse zyada configuration revision jeetta hai; v3 galtiyon se bachne ke liye primary server jodta hai.</li>
<li><code>show interfaces switchport</code> mein Administrative Mode aur Operational Mode compare karo.</li>
</ul></div>
`}};export{e as default};