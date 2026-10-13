var e={id:`why-subinterfaces`,h:{en:`Why subinterfaces: trunks, tags and router-on-a-stick`,hi:`Subinterfaces kyun: trunks, tags aur router-on-a-stick`},body:{en:`
<p><b>Analogy: one road, many lanes with different colours.</b> A single physical road (the cable) carries traffic for several neighbourhoods. Each car has a coloured sticker (the VLAN tag) that says which neighbourhood it belongs to. At the junction a traffic officer (the firewall) reads the sticker, treats each colour as a separate road with its own rules, and sends cars on. One cable, many logical roads: that is a trunk, and each logical road on the firewall side is a <b>subinterface</b>.</p>

<h3>Recap from CCNA: VLANs and 802.1Q</h3>
<p>A VLAN is a separate Layer 2 broadcast domain. Hosts in different VLANs cannot talk without a Layer 3 device. A <b>trunk</b> link carries several VLANs between switches or between a switch and a router or firewall, by inserting a 4-byte <b>802.1Q tag</b> carrying the VLAN ID (1 to 4094) into each frame. One VLAN may be the <b>native VLAN</b>, sent without a tag. If you remember router-on-a-stick from CCNA, a firewall subinterface is the same idea with extra security.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Router on a stick with firewall subinterfaces">
<rect x="10" y="30" width="90" height="45" rx="8" fill="#bbf7d0"/><text x="55" y="50" text-anchor="middle" class="svg-ink" font-size="13">PC10</text><text x="55" y="66" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10</text>
<rect x="10" y="120" width="90" height="45" rx="8" fill="#fed7aa"/><text x="55" y="140" text-anchor="middle" class="svg-ink" font-size="13">SRV20</text><text x="55" y="156" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20</text>
<rect x="190" y="65" width="110" height="70" rx="10" fill="#bae6fd"/><text x="245" y="95" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="245" y="115" text-anchor="middle" class="svg-muted" font-size="12">g0/1 trunk</text>
<rect x="400" y="30" width="230" height="140" rx="10" fill="#ddd6fe"/><text x="515" y="52" text-anchor="middle" class="svg-ink" font-size="14">Firewall</text>
<text x="515" y="80" text-anchor="middle" class="svg-muted" font-size="12">ethernet1/2 (parent, no IP)</text>
<text x="515" y="105" text-anchor="middle" class="svg-accent" font-size="12">e1/2.10 tag 10  10.10.10.1/24  zone users</text>
<text x="515" y="130" text-anchor="middle" class="svg-accent" font-size="12">e1/2.20 tag 20  10.10.20.1/24  zone servers</text>
<line x1="100" y1="52" x2="190" y2="90" stroke="#64748b" stroke-width="2"/><line x1="100" y1="142" x2="190" y2="110" stroke="#64748b" stroke-width="2"/><line x1="300" y1="100" x2="400" y2="100" stroke="#64748b" stroke-width="3"/>
<text x="350" y="92" text-anchor="middle" class="svg-muted" font-size="12">802.1Q trunk</text>
</svg><p class="cap">One physical link, two tagged subinterfaces, two zones.</p></div>

<h3>What a Layer 3 subinterface is</h3>
<p>On PAN-OS, a physical interface such as ethernet1/2 can be configured as Layer 3 and then have <b>subinterfaces</b> named <code>ethernet1/2.10</code>, <code>ethernet1/2.20</code>. The number after the dot is only a label (it is customary to match the VLAN tag, but the tag is a separate setting). Each subinterface has:</p>
<ul>
<li>an <b>802.1Q tag</b> (1 to 4094) that selects which VLAN's frames belong to it,</li>
<li>its <b>own IP address</b> (the gateway for that VLAN),</li>
<li>its <b>own zone</b> and virtual router membership, and optionally its own management profile.</li>
</ul>
<p>The parent physical interface is the cable; the subinterfaces are the logical roads. The parent itself can have an IP address for untagged (native) traffic, or none.</p>

<h3>Why this design is powerful for security</h3>
<p>Because every VLAN becomes its own interface with its own zone, <b>all inter-VLAN traffic must go through the firewall's policy</b>. A switch with SVIs routes silently inside the switch. With the firewall as the gateway, "users to servers" is a rule with applications, users and threat profiles. This is the zero-trust-style segmentation that is the main reason to use subinterfaces rather than routing on the switch.</p>

<h3>Design questions to ask</h3>
<table class="cmp"><tr><th>Question</th><th>Typical answer</th></tr>
<tr><td>One zone per VLAN or shared?</td><td>One zone per trust level; separate zones whenever policy must differ.</td></tr>
<tr><td>Parent interface IP?</td><td>None, unless you need the native VLAN routed on the parent.</td></tr>
<tr><td>Which tag values?</td><td>Match the switch VLAN IDs; avoid reusing 1 for production data.</td></tr>
<tr><td>Throughput?</td><td>All VLANs share one physical port; size the link or use aggregate ethernet.</td></tr>
<tr><td>Routing between VLANs?</td><td>Always through the firewall virtual router and rulebase.</td></tr></table>

<h3>Checking the trunk from the switch</h3>
<p>The other end of the link must be a trunk that allows the same VLANs. This is the switch view in the simulator (a Cisco-style access switch):</p>
<pre class="out">SW1&gt; show interfaces trunk
Port        Mode             Encapsulation Status        Native vlan
Gi0/1       on               802.1q        trunking      1

Port        Vlans allowed on trunk
Gi0/1       1-4094

Port        Vlans allowed and active in management domain
<span class="hl">Gi0/1       1,10,20</span></pre>
<p>VLANs 10 and 20 are allowed and active on the trunk. If a VLAN is missing from "allowed and active", the firewall will never see its frames, whatever you configure on the firewall.</p>

<div class="eg"><p><b>Worked example.</b> Two VLANs share ethernet1/2: users (10.10.10.0/24, VLAN 10) and servers (10.10.20.0/24, VLAN 20). A user connects to the server's web page. The frame arrives tagged 10, the firewall maps it to subinterface ethernet1/2.10 (zone users), routes to 10.10.20.0/24 out ethernet1/2.20 (zone servers), checks the rule from users to servers, and sends the frame out tagged 20. Same cable, two virtual interfaces, one policy decision.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting the trunk on the switch (access port instead of trunk). Using different tag values on the switch and the firewall. Putting both VLANs in one zone (then the intrazone default allows them to talk with no rule). Expecting the parent to carry tagged traffic without any subinterface.</p></div>
<div class="exam"><p><b>Exam trap.</b> A subinterface requires a tag. The tag is locally significant to that physical interface: the same tag may be used on two different parents. The subinterface name's suffix is just a label, not the tag.</p></div>

<div class="scn"><h4>Servers and users on the same switch gateway</h4><p>A company kept SVIs for the user and server VLANs on the distribution switch. A compromised laptop scanned the server VLAN and nothing in the firewall logs saw it, because the traffic never left the switch. After moving the VLAN gateways onto firewall subinterfaces with separate zones, the same scan hit an explicit rule and was logged and blocked.</p><p><b>Lesson:</b> whoever routes between VLANs controls the visibility of inter-VLAN traffic.</p></div>

<div class="iv"><p class="q">"Why use Layer 3 subinterfaces on a firewall?"</p><p>To terminate several VLANs on one physical port, give each its own gateway IP and zone, and force all inter-VLAN traffic through the firewall's policy and inspection. It saves ports and enables segmentation with rules by application and user. Mention the throughput trade-off of sharing one link and the option of aggregate ethernet.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A subinterface is a tagged logical interface on a Layer 3 physical port.</li>
<li>Each has its own tag, IP, zone and virtual router membership.</li>
<li>The switch side must trunk the same VLANs.</li>
<li>Inter-VLAN traffic now crosses the firewall policy.</li>
<li>The tag is locally significant; the name suffix is a label.</li>
</ul></div>
`,hi:`
<p><b>Analogy: ek sadak, alag-alag rang ki kai lanes.</b> Ek physical sadak (cable) kai mohallon ka traffic le jaati hai. Har gaadi par rang ka sticker hai (VLAN tag) jo batata hai woh kis mohalle ki hai. Chauraahe par traffic officer (firewall) sticker padhta hai, har rang ko apne rules wali alag sadak maanta hai, aur gaadiyon ko aage bhejta hai. Ek cable, kai logical sadkein: yahi trunk hai, aur firewall side par har logical sadak <b>subinterface</b> hai.</p>

<h3>CCNA se recap: VLANs aur 802.1Q</h3>
<p>VLAN ek alag Layer 2 broadcast domain hai. Alag VLANs ke hosts Layer 3 device ke bina baat nahi kar sakte. <b>Trunk</b> link har frame mein VLAN ID (1 se 4094) wala 4-byte <b>802.1Q tag</b> daalkar switches ke beech ya switch aur router ya firewall ke beech kai VLANs le jaata hai. Ek VLAN <b>native VLAN</b> ho sakti hai, jo bina tag ke bheji jaati hai. CCNA ka router-on-a-stick yaad ho to firewall subinterface wahi idea hai, extra security ke saath.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Firewall subinterfaces ke saath router on a stick">
<rect x="10" y="30" width="90" height="45" rx="8" fill="#bbf7d0"/><text x="55" y="50" text-anchor="middle" class="svg-ink" font-size="13">PC10</text><text x="55" y="66" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10</text>
<rect x="10" y="120" width="90" height="45" rx="8" fill="#fed7aa"/><text x="55" y="140" text-anchor="middle" class="svg-ink" font-size="13">SRV20</text><text x="55" y="156" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20</text>
<rect x="190" y="65" width="110" height="70" rx="10" fill="#bae6fd"/><text x="245" y="95" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="245" y="115" text-anchor="middle" class="svg-muted" font-size="12">g0/1 trunk</text>
<rect x="400" y="30" width="230" height="140" rx="10" fill="#ddd6fe"/><text x="515" y="52" text-anchor="middle" class="svg-ink" font-size="14">Firewall</text>
<text x="515" y="80" text-anchor="middle" class="svg-muted" font-size="12">ethernet1/2 (parent, IP nahi)</text>
<text x="515" y="105" text-anchor="middle" class="svg-accent" font-size="12">e1/2.10 tag 10  10.10.10.1/24  zone users</text>
<text x="515" y="130" text-anchor="middle" class="svg-accent" font-size="12">e1/2.20 tag 20  10.10.20.1/24  zone servers</text>
<line x1="100" y1="52" x2="190" y2="90" stroke="#64748b" stroke-width="2"/><line x1="100" y1="142" x2="190" y2="110" stroke="#64748b" stroke-width="2"/><line x1="300" y1="100" x2="400" y2="100" stroke="#64748b" stroke-width="3"/>
<text x="350" y="92" text-anchor="middle" class="svg-muted" font-size="12">802.1Q trunk</text>
</svg><p class="cap">Ek physical link, do tagged subinterfaces, do zones.</p></div>

<h3>Layer 3 subinterface kya hai</h3>
<p>PAN-OS par ethernet1/2 jaise physical interface ko Layer 3 configure karke uske neeche <b>subinterfaces</b> bana sakte ho, jaise <code>ethernet1/2.10</code>, <code>ethernet1/2.20</code>. Dot ke baad ka number sirf label hai (VLAN tag se match karna riwaaj hai, lekin tag alag setting hai). Har subinterface mein hota hai:</p>
<ul>
<li>ek <b>802.1Q tag</b> (1 se 4094) jo tay karta hai kis VLAN ke frames uske hain,</li>
<li>uska <b>apna IP address</b> (us VLAN ka gateway),</li>
<li>uska <b>apna zone</b> aur virtual router membership, aur optionally apna management profile.</li>
</ul>
<p>Parent physical interface cable hai; subinterfaces logical sadkein hain. Parent par khud untagged (native) traffic ke liye IP ho sakta hai, ya nahi.</p>

<h3>Yeh design security ke liye taakatwar kyun hai</h3>
<p>Kyunki har VLAN apna interface aur apna zone ban jaata hai, <b>saara inter-VLAN traffic firewall ki policy se guzarta hai</b>. SVIs wala switch switch ke andar chupchaap route karta hai. Firewall gateway ho to "users se servers" ek rule hai jisme applications, users aur threat profiles hote hain. Yahi zero-trust-style segmentation subinterfaces use karne ki mukhya wajah hai, switch par routing ke bajaye.</p>

<h3>Design ke sawal</h3>
<table class="cmp"><tr><th>Sawal</th><th>Aam jawab</th></tr>
<tr><td>Har VLAN ka ek zone ya shared?</td><td>Har trust level ka ek zone; jab policy alag honi ho tab alag zones.</td></tr>
<tr><td>Parent interface par IP?</td><td>Nahi, jab tak parent par native VLAN route karni na ho.</td></tr>
<tr><td>Kaunse tag values?</td><td>Switch ke VLAN IDs se match karo; production data ke liye 1 dobara use mat karo.</td></tr>
<tr><td>Throughput?</td><td>Saare VLANs ek physical port share karte hain; link size karo ya aggregate ethernet use karo.</td></tr>
<tr><td>VLANs ke beech routing?</td><td>Hamesha firewall virtual router aur rulebase se.</td></tr></table>

<h3>Switch se trunk check karna</h3>
<p>Link ka doosra chhor trunk hona chahiye jo wahi VLANs allow kare. Yeh simulator mein switch ka view hai (Cisco-style access switch):</p>
<pre class="out">SW1&gt; show interfaces trunk
Port        Mode             Encapsulation Status        Native vlan
Gi0/1       on               802.1q        trunking      1

Port        Vlans allowed on trunk
Gi0/1       1-4094

Port        Vlans allowed and active in management domain
<span class="hl">Gi0/1       1,10,20</span></pre>
<p>VLANs 10 aur 20 trunk par allowed aur active hain. Agar koi VLAN "allowed and active" mein nahi hai to firewall par kuch bhi configure karo, uske frames firewall kabhi nahi dekhega.</p>

<div class="eg"><p><b>Worked example.</b> Do VLANs ethernet1/2 share karte hain: users (10.10.10.0/24, VLAN 10) aur servers (10.10.20.0/24, VLAN 20). Ek user server ka web page kholta hai. Frame tag 10 ke saath aata hai, firewall use subinterface ethernet1/2.10 (zone users) se map karta hai, 10.10.20.0/24 ke liye ethernet1/2.20 (zone servers) se route karta hai, users se servers ka rule check karta hai, aur frame ko tag 20 ke saath bahar bhejta hai. Wahi cable, do virtual interfaces, ek policy decision.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Switch par trunk bhool jaana (trunk ki jagah access port). Switch aur firewall par alag tag values. Dono VLANs ko ek zone mein daalna (tab intrazone default bina rule ke unhe baat karne deta hai). Bina kisi subinterface ke parent se tagged traffic ki ummeed.</p></div>
<div class="exam"><p><b>Exam trap.</b> Subinterface ko tag chahiye. Tag us physical interface ke liye locally significant hai: do alag parents par same tag ho sakta hai. Subinterface naam ka suffix sirf label hai, tag nahi.</p></div>

<div class="scn"><h4>Servers aur users ek hi switch gateway par</h4><p>Ek company ne user aur server VLANs ke SVIs distribution switch par rakhe the. Ek compromised laptop ne server VLAN scan kiya aur firewall logs mein kuch nahi dikha, kyunki traffic switch se bahar gaya hi nahi. VLAN gateways ko alag zones wale firewall subinterfaces par le jaane ke baad wahi scan explicit rule se takraaya aur log tatha block hua.</p><p><b>Lesson:</b> VLANs ke beech route kaun karta hai, wahi inter-VLAN traffic ki visibility control karta hai.</p></div>

<div class="iv"><p class="q">"Firewall par Layer 3 subinterfaces kyun use karte hain?"</p><p>Ek physical port par kai VLANs terminate karne, har ko apna gateway IP aur zone dene, aur saara inter-VLAN traffic firewall ki policy aur inspection se guzaarne ke liye. Isse ports bachte hain aur application tatha user ke rules se segmentation milti hai. Ek link share karne ka throughput trade-off aur aggregate ethernet ka option batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Subinterface Layer 3 physical port par tagged logical interface hai.</li>
<li>Har ka apna tag, IP, zone aur virtual router membership hota hai.</li>
<li>Switch side par wahi VLANs trunk karne honge.</li>
<li>Inter-VLAN traffic ab firewall policy se guzarta hai.</li>
<li>Tag locally significant hai; naam ka suffix label hai.</li>
</ul></div>
`}};export{e as default};