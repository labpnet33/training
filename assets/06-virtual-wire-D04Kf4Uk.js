var e={id:`virtual-wire`,h:{en:`Virtual wire: the firewall as a bump in the wire`,hi:`Virtual wire: wire ke beech firewall`},body:{en:`
<p><b>Analogy: a security guard in a corridor.</b> The guard stands between two doors. People walk straight through, and the guard checks each one, but the guard never gives directions or changes the corridor. That is a virtual wire: the firewall inspects traffic between two interfaces without routing or switching it.</p>

<div class="warn"><p><b>Simulator note.</b> The NK-OS simulator supports Layer 3 interfaces and subinterfaces only. Virtual wire is not simulated, so every command block in this chapter is a <b>Reference configuration (not run in the simulator)</b>. There is no lab for it. Practise the zone and policy side in pan-setup and pan-policy, and the VLAN side in ccna-vlans.</p></div>

<h3>What a virtual wire does</h3>
<p>A virtual wire binds two physical interfaces together. A frame entering ethernet1/3 is inspected and, if allowed, leaves ethernet1/4, and the reverse. The interfaces have <b>no IP address and no MAC learning</b>, and the firewall does not appear as a hop (no TTL decrement). Neighbouring devices on each side believe they are directly connected.</p>
<p>It is the easiest way to insert a firewall into an existing network with no readdressing, for example between a core switch and an edge router.</p>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code">set network interface ethernet ethernet1/3 virtual-wire
set network interface ethernet ethernet1/4 virtual-wire
set network virtual-wire VW1 interface1 ethernet1/3 interface2 ethernet1/4
set zone vw-inside network virtual-wire ethernet1/3
set zone vw-outside network virtual-wire ethernet1/4
set rulebase security rules Inside-to-Outside from vw-inside to vw-outside source any destination any application [ web-browsing ssl ] service application-default action allow
commit</pre>
<p>Zones are still required: policy always works between zones, and virtual-wire zones have type virtual-wire. A virtual-wire zone cannot be mixed with Layer 3 interfaces in the same zone.</p>

<h3>VLAN tags on a virtual wire</h3>
<p>By default a virtual wire allows <b>untagged traffic only</b> (tag 0). To pass tagged traffic you list the allowed tags:</p>
<pre class="code">set network virtual-wire VW1 tag-allowed 10,20</pre>
<p>Without this, frames tagged 10 or 20 are not carried. To apply different policy to different VLANs, you create <b>virtual wire subinterfaces</b> that match a tag (or a range) and put each in its own zone. This is how one wire can enforce a different policy for VLAN 10 and VLAN 20 without a firewall IP at all.</p>

<h3>What you gain and lose</h3>
<table>
<tr><th>Feature</th><th>Virtual wire</th></tr>
<tr><td>IP address on the firewall</td><td>None</td></tr>
<tr><td>Routing between networks</td><td>No, the firewall does not route</td></tr>
<tr><td>NAT</td><td>Supported, but you need to plan carefully; no routing means no gateway role</td></tr>
<tr><td>App-ID, threat prevention</td><td>Fully supported</td></tr>
<tr><td>DHCP, VPN termination</td><td>Not on the wire interfaces</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> A bank must add inspection between an existing router and a core switch over a weekend, with no IP changes. Two interfaces, one virtual wire, two zones, one allow rule. Nothing else on the network is touched. If the firewall fails and the optional bypass is not present, the wire is down, so plan high availability.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Expecting a ping to a firewall address (there is none). Forgetting tag-allowed and wondering why VLAN traffic vanishes. Using virtual wire where routing between VLANs is required. Forgetting that the firewall now sits in the path and needs HA.</p></div>
<div class="exam"><p><b>Exam trap.</b> A virtual wire has two interfaces, no IP, no routing and no MAC table; the allowed tag default is 0 (untagged). Zones are still mandatory.</p></div>

<div class="scn"><h4>The silent VLANs</h4><p>After a firewall was inserted as a virtual wire, the guest VLAN stopped working while the untagged management VLAN was fine. The wire carried only tag 0. Adding the guest tag to tag-allowed restored it.</p><p><b>Lesson:</b> a virtual wire is selective about tags.</p></div>

<div class="iv"><p class="q">"When would you choose virtual wire over Layer 3?"</p><p>When the firewall must be inserted without readdressing or routing changes and no firewall IP is needed, for example between two existing devices. For inter-VLAN routing, VPN or DHCP I would use Layer 3.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A virtual wire joins two interfaces; no IP, no routing, no MAC learning.</li>
<li>Zones and rules are still required.</li>
<li>Default allowed tag is untagged only; list tags with tag-allowed.</li>
<li>Virtual wire subinterfaces apply per-VLAN policy.</li>
<li>Not simulated in NK-OS; the commands here are reference only.</li>
</ul></div>
`,hi:`
<p><b>Analogy: corridor mein security guard.</b> Guard do darwaazon ke beech khada hai. Log seedhe guzarte hain aur guard har ek ko check karta hai, lekin raasta nahi batata aur corridor nahi badalta. Yahi virtual wire hai: firewall do interfaces ke beech traffic inspect karta hai bina route ya switch kiye.</p>

<div class="warn"><p><b>Simulator note.</b> NK-OS simulator sirf Layer 3 interfaces aur subinterfaces support karta hai. Virtual wire simulate nahi hota, isliye is chapter ka har command block <b>Reference configuration (not run in the simulator)</b> hai. Iska koi lab nahi hai. Zone aur policy ki practice pan-setup aur pan-policy mein, aur VLAN ki practice ccna-vlans mein karo.</p></div>

<h3>Virtual wire kya karta hai</h3>
<p>Virtual wire do physical interfaces ko jodta hai. ethernet1/3 mein aane wala frame inspect hota hai aur allow ho to ethernet1/4 se nikalta hai, aur ulta bhi. Interfaces par <b>koi IP address aur MAC learning nahi</b> hoti, aur firewall hop ke roop mein nahi dikhta (TTL kam nahi hota). Dono taraf ke devices samajhte hain ki woh seedhe jude hain.</p>
<p>Bina readdressing ke maujooda network mein firewall daalne ka sabse aasaan tareeka, jaise core switch aur edge router ke beech.</p>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code">set network interface ethernet ethernet1/3 virtual-wire
set network interface ethernet ethernet1/4 virtual-wire
set network virtual-wire VW1 interface1 ethernet1/3 interface2 ethernet1/4
set zone vw-inside network virtual-wire ethernet1/3
set zone vw-outside network virtual-wire ethernet1/4
set rulebase security rules Inside-to-Outside from vw-inside to vw-outside source any destination any application [ web-browsing ssl ] service application-default action allow
commit</pre>
<p>Zones abhi bhi zaroori hain: policy hamesha zones ke beech chalti hai, aur virtual-wire zones ka type virtual-wire hota hai. Virtual-wire zone ko Layer 3 interfaces ke saath ek zone mein nahi mila sakte.</p>

<h3>Virtual wire par VLAN tags</h3>
<p>Default mein virtual wire <b>sirf untagged traffic</b> allow karta hai (tag 0). Tagged traffic nikalne ke liye allowed tags likho:</p>
<pre class="code">set network virtual-wire VW1 tag-allowed 10,20</pre>
<p>Iske bina tag 10 ya 20 ke frames carry nahi hote. Alag VLANs par alag policy ke liye <b>virtual wire subinterfaces</b> banao jo tag (ya range) match karein aur har ek ko apne zone mein daalo. Isi tarah ek wire par bina firewall IP ke VLAN 10 aur VLAN 20 ki alag policy lagti hai.</p>

<h3>Kya milta hai aur kya jaata hai</h3>
<table>
<tr><th>Feature</th><th>Virtual wire</th></tr>
<tr><td>Firewall par IP address</td><td>Nahi</td></tr>
<tr><td>Networks ke beech routing</td><td>Nahi, firewall route nahi karta</td></tr>
<tr><td>NAT</td><td>Supported, par dhyan se plan karo; routing nahi to gateway role nahi</td></tr>
<tr><td>App-ID, threat prevention</td><td>Poora supported</td></tr>
<tr><td>DHCP, VPN termination</td><td>Wire interfaces par nahi</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Ek bank ko weekend mein maujooda router aur core switch ke beech inspection jodna hai, bina IP badle. Do interfaces, ek virtual wire, do zones, ek allow rule. Network mein aur kuch nahi chhua jaata. Agar firewall fail ho aur bypass nahi hai, to wire down ho jaati hai, isliye high availability plan karo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Firewall address ko ping karne ki ummeed (koi hai hi nahi). tag-allowed bhool jaana aur sochna VLAN traffic kahan gayab. Jahan VLANs ke beech routing chahiye wahan virtual wire lagana. Yeh bhoolna ki firewall ab path mein hai aur HA chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Virtual wire mein do interfaces, na IP, na routing, na MAC table; allowed tag ka default 0 (untagged) hai. Zones abhi bhi mandatory hain.</p></div>

<div class="scn"><h4>Khamosh VLANs</h4><p>Firewall ko virtual wire ki tarah daalne ke baad guest VLAN band ho gayi jabki untagged management VLAN theek thi. Wire sirf tag 0 carry kar rahi thi. Guest tag ko tag-allowed mein jodne se chal padi.</p><p><b>Lesson:</b> virtual wire tags ke baare mein chunindaa hai.</p></div>

<div class="iv"><p class="q">"Layer 3 ki jagah virtual wire kab chunoge?"</p><p>Jab firewall ko bina readdressing ya routing change ke daalna ho aur firewall IP na chahiye, jaise do maujooda devices ke beech. Inter-VLAN routing, VPN ya DHCP ke liye Layer 3.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Virtual wire do interfaces jodta hai; na IP, na routing, na MAC learning.</li>
<li>Zones aur rules abhi bhi zaroori hain.</li>
<li>Default allowed tag sirf untagged; tag-allowed se tags likho.</li>
<li>Virtual wire subinterfaces har-VLAN policy lagate hain.</li>
<li>NK-OS mein simulate nahi; yahan ke commands sirf reference hain.</li>
</ul></div>
`}};export{e as default};