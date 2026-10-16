var e={id:`vlans`,h:{en:`VLAN interfaces`,hi:`VLAN interfaces`},body:{en:`
<p><b>Why this chapter matters.</b> One physical cable can carry many separate networks. In a real branch you rarely get one cable per department. You get a single link to a switch and you split it into VLANs. This chapter shows how the engine joins those VLANs, so the firewall can control traffic between Staff and Servers.</p>

<h3>Analogy: one road, coloured lanes</h3>
<p>Think of a single road outside the Pune office. The road is painted with two coloured lanes: a blue lane for Staff vehicles and a green lane for Server vehicles. Same tarmac, but a vehicle in the blue lane never mixes with the green lane unless it passes through the gatehouse. A <b>VLAN</b> (virtual LAN) is such a lane on an Ethernet cable. Every frame is tagged with a <b>VLAN ID</b> (a number from 1 to 4094), and a switch keeps tagged lanes apart.</p>

<h3>Trunks and the dot1Q tag</h3>
<p>A link between the firewall and a switch that carries several VLANs is a <b>trunk</b>. The tag format is called <b>802.1Q</b>, written <b>dot1Q</b>. A switch port that carries one VLAN only, untagged, is an <b>access port</b>. In our branch the engine port eth2 connects to a switch with a trunk. The switch has Staff PCs in VLAN 10 and server machines in VLAN 20. Those two numbers are examples for this chapter; use the values given in the lab task and the address plan.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Trunk from engine to switch with two VLANs">
<rect x="20" y="90" width="150" height="70" rx="10" fill="#bae6fd" stroke="#64748b"/>
<text x="95" y="120" text-anchor="middle" class="svg-ink" font-size="14">NK-PUNE-FW</text>
<text x="95" y="140" text-anchor="middle" class="svg-muted" font-size="12">eth2 (physical)</text>
<line x1="170" y1="125" x2="300" y2="125" stroke="#64748b" stroke-width="5"/>
<text x="235" y="112" text-anchor="middle" class="svg-accent" font-size="12">trunk (dot1Q)</text>
<rect x="300" y="90" width="110" height="70" rx="10" fill="#e2e8f0" stroke="#64748b"/>
<text x="355" y="130" text-anchor="middle" class="svg-ink" font-size="14">Switch</text>
<line x1="410" y1="105" x2="520" y2="50" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="145" x2="520" y2="200" stroke="#64748b" stroke-width="2"/>
<rect x="520" y="25" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="575" y="46" text-anchor="middle" class="svg-ink" font-size="12">Staff VLAN 10</text><text x="575" y="63" text-anchor="middle" class="svg-muted" font-size="12">10.1.10.0/24</text>
<rect x="520" y="175" width="110" height="50" rx="8" fill="#fde68a"/><text x="575" y="196" text-anchor="middle" class="svg-ink" font-size="12">Servers VLAN 20</text><text x="575" y="213" text-anchor="middle" class="svg-muted" font-size="12">10.1.20.0/24</text>
<text x="95" y="190" text-anchor="middle" class="svg-muted" font-size="12">eth2.10 = 10.1.10.1</text>
<text x="95" y="208" text-anchor="middle" class="svg-muted" font-size="12">eth2.20 = 10.1.20.1</text>
</svg><p class="cap">One physical interface, two VLAN interfaces. Each VLAN is a separate network with its own gateway on the engine.</p></div>

<h3>VLAN interfaces on the engine</h3>
<p>On the engine, a VLAN is created as a <b>VLAN interface</b> (also called a sub-interface) under a physical interface. It has the physical Interface ID plus the VLAN ID, such as 2.10 and 2.20. Each VLAN interface gets its own IP address and prefix length, and its own place in the routing table. For hosts, that address is their default gateway. From the engine point of view, the Staff and Servers VLANs are two different networks, so traffic between them must pass the firewall policy. That is exactly the security benefit: <b>the switch cannot move frames between VLANs, only the firewall can route them, and the policy decides what is allowed.</b></p>

<table class="cmp"><tr><th>Item</th><th>Physical interface</th><th>VLAN interface</th></tr>
<tr><td>Name example</td><td>eth2 (Interface ID 2)</td><td>2.10 and 2.20</td></tr>
<tr><td>Tag</td><td>None on the wire (or native)</td><td>dot1Q tag with the VLAN ID</td></tr>
<tr><td>IP address</td><td>Optional when VLANs are used</td><td>Required for a routed VLAN</td></tr>
<tr><td>Typical use</td><td>Trunk to switch</td><td>One department or server zone</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Staff VLAN 10 uses 10.1.10.0/24. Engine address is 10.1.10.1/24. Servers VLAN 20 uses 10.1.20.0/24; engine address 10.1.20.1/24. A PC at 10.1.10.50 sets 10.1.10.1 as gateway. A file server at 10.1.20.5 sets 10.1.20.1. When the PC opens the file server, the packet goes PC &rarr; switch (VLAN 10) &rarr; engine on eth2.10 &rarr; policy check &rarr; engine out of eth2.20 &rarr; switch (VLAN 20) &rarr; server. The engine sees it on one VLAN interface and sends it out of another. If the rule for Staff to Servers is missing, the connection is discarded and logged.</p></div>

<h3>Steps in the console</h3>
<ol>
<li>Edit the engine element and open interface 2.</li>
<li>Add a VLAN interface with VLAN ID 10 and address 10.1.10.1, prefix 24.</li>
<li>Add the second VLAN interface with VLAN ID 20 and address 10.1.20.1, prefix 24.</li>
<li>Check that the switch trunk allows the same VLAN IDs. This is not part of the engine; it is a switch job.</li>
<li>Install policy and test with a ping from a Staff PC to its gateway.</li>
</ol>
<pre class="out">eth2      UP    (no address, trunk)
eth2.10   UP    <span class="hl">10.1.10.1/24</span>
eth2.20   UP    <span class="hl">10.1.20.1/24</span></pre>
<p>The output above is simulator style. On the lab engine, use the <code>ip</code> tool to see the addresses and the Logs page to see allowed and discarded traffic.</p>

<div class="warn"><p><b>Common mistakes.</b> VLAN ID on the engine does not match the switch trunk or access port, so the gateway never answers. The switch trunk does not allow the VLAN. Both VLANs given the same subnet. Putting the old untagged address on the physical interface and then wondering why hosts on the VLAN see two gateways.</p></div>
<div class="exam"><p><b>Exam trap.</b> The VLAN tag is only a Layer 2 label. It does not give security by itself. The security comes from the engine routing between the VLAN interfaces and the policy applied there. Also, a VLAN interface is a new network, so it needs its own route logic and its own rules.</p></div>

<div class="scn"><h4>Servers can not be reached from Staff</h4><p>After a switch refresh, Staff PCs at MyPnetLab Pune lost access to a file server. The engine config looked fine. The engineer pinged the engine gateway for Servers from the server and got no answer, then checked the switch: the trunk allowed only VLAN 10 after the new switch template. After adding VLAN 20 to the allowed list the gateway replied and the existing Staff to Servers rule worked again.</p><p><b>Lesson:</b> when a VLAN does not answer its gateway, check the tag on both ends first, before touching any firewall rule.</p></div>

<div class="iv"><p class="q">"Why would you terminate VLANs on the firewall instead of a switch?"</p><p>Because the firewall can then inspect and log all traffic between VLANs, not only traffic to the internet. The switch only forwards inside a VLAN. With VLAN interfaces on the engine, every inter-VLAN flow passes the access rules. Mention the trade-off: more load on the firewall and a bigger blast radius if the trunk fails.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A trunk carries many VLANs on one cable using dot1Q tags.</li>
<li>A VLAN interface is a sub-interface of a physical interface with its own ID, address and prefix.</li>
<li>Hosts use the VLAN interface address as their gateway.</li>
<li>Traffic between VLANs goes through the engine policy, which is the security point.</li>
<li>VLAN IDs must match on the engine and the switch. Changes apply only after Install policy.</li>
</ul></div>
`,hi:`
<p><b>Yeh chapter kyun zaroori hai.</b> Ek physical cable kai alag networks carry kar sakta hai. Real branch mein har department ke liye alag cable kam hi milta hai. Aapko switch tak ek link milta hai aur aap use VLANs mein todte ho. Yeh chapter dikhata hai ki engine in VLANs se kaise judta hai, taaki firewall Staff aur Servers ke beech ka traffic control kar sake.</p>

<h3>Analogy: ek sadak, rang-birangi lanes</h3>
<p>Pune office ke bahar ek hi sadak socho. Sadak par do coloured lanes bani hain: Staff gaadiyon ke liye blue lane aur Server gaadiyon ke liye green lane. Tarmac ek hi hai, lekin blue lane ki gaadi green lane se tab tak nahi milti jab tak gatehouse se na guzre. <b>VLAN</b> (virtual LAN) Ethernet cable par aisi hi lane hai. Har frame par ek <b>VLAN ID</b> (1 se 4094 tak ka number) ka tag lagta hai, aur switch tagged lanes ko alag rakhta hai.</p>

<h3>Trunks aur dot1Q tag</h3>
<p>Firewall aur switch ke beech ka link jo kai VLANs carry karta hai, <b>trunk</b> kehlata hai. Tag format <b>802.1Q</b> hai, jise <b>dot1Q</b> likhte hain. Switch ka port jo sirf ek VLAN untagged carry karta hai, <b>access port</b> hai. Hamare branch mein engine ka port eth2 switch se trunk se juda hai. Switch mein Staff PCs VLAN 10 mein hain aur server machines VLAN 20 mein. Yeh do numbers is chapter ke examples hain; lab task aur address plan ki values use karo.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Engine se switch tak trunk, do VLANs ke saath">
<rect x="20" y="90" width="150" height="70" rx="10" fill="#bae6fd" stroke="#64748b"/>
<text x="95" y="120" text-anchor="middle" class="svg-ink" font-size="14">NK-PUNE-FW</text>
<text x="95" y="140" text-anchor="middle" class="svg-muted" font-size="12">eth2 (physical)</text>
<line x1="170" y1="125" x2="300" y2="125" stroke="#64748b" stroke-width="5"/>
<text x="235" y="112" text-anchor="middle" class="svg-accent" font-size="12">trunk (dot1Q)</text>
<rect x="300" y="90" width="110" height="70" rx="10" fill="#e2e8f0" stroke="#64748b"/>
<text x="355" y="130" text-anchor="middle" class="svg-ink" font-size="14">Switch</text>
<line x1="410" y1="105" x2="520" y2="50" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="145" x2="520" y2="200" stroke="#64748b" stroke-width="2"/>
<rect x="520" y="25" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="575" y="46" text-anchor="middle" class="svg-ink" font-size="12">Staff VLAN 10</text><text x="575" y="63" text-anchor="middle" class="svg-muted" font-size="12">10.1.10.0/24</text>
<rect x="520" y="175" width="110" height="50" rx="8" fill="#fde68a"/><text x="575" y="196" text-anchor="middle" class="svg-ink" font-size="12">Servers VLAN 20</text><text x="575" y="213" text-anchor="middle" class="svg-muted" font-size="12">10.1.20.0/24</text>
<text x="95" y="190" text-anchor="middle" class="svg-muted" font-size="12">eth2.10 = 10.1.10.1</text>
<text x="95" y="208" text-anchor="middle" class="svg-muted" font-size="12">eth2.20 = 10.1.20.1</text>
</svg><p class="cap">Ek physical interface, do VLAN interfaces. Har VLAN alag network hai aur engine par uska apna gateway hai.</p></div>

<h3>Engine par VLAN interfaces</h3>
<p>Engine par VLAN ek <b>VLAN interface</b> (sub-interface bhi kehte hain) ke roop mein physical interface ke neeche banta hai. Uska naam physical Interface ID plus VLAN ID hota hai, jaise 2.10 aur 2.20. Har VLAN interface ko apna IP address aur prefix length milta hai, aur routing table mein apni jagah. Hosts ke liye yahi address unka default gateway hai. Engine ke nazariye se Staff aur Servers VLANs do alag networks hain, isliye unke beech ka traffic firewall policy se guzarta hai. Yahi security ka fayda hai: <b>switch VLANs ke beech frames nahi le ja sakta, sirf firewall route kar sakta hai, aur policy decide karti hai kya allowed hai.</b></p>

<table class="cmp"><tr><th>Item</th><th>Physical interface</th><th>VLAN interface</th></tr>
<tr><td>Naam ka example</td><td>eth2 (Interface ID 2)</td><td>2.10 aur 2.20</td></tr>
<tr><td>Tag</td><td>Wire par koi nahi (ya native)</td><td>VLAN ID ke saath dot1Q tag</td></tr>
<tr><td>IP address</td><td>VLANs use hon to optional</td><td>Routed VLAN ke liye zaroori</td></tr>
<tr><td>Typical use</td><td>Switch tak trunk</td><td>Ek department ya server zone</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Staff VLAN 10 ka network 10.1.10.0/24 hai. Engine address 10.1.10.1/24. Servers VLAN 20 ka network 10.1.20.0/24; engine address 10.1.20.1/24. 10.1.10.50 wala PC gateway 10.1.10.1 set karta hai. 10.1.20.5 wala file server 10.1.20.1 set karta hai. PC file server kholta hai to packet aise jata hai: PC &rarr; switch (VLAN 10) &rarr; engine eth2.10 par &rarr; policy check &rarr; engine eth2.20 se bahar &rarr; switch (VLAN 20) &rarr; server. Engine use ek VLAN interface par dekhta hai aur doosre se bhejta hai. Agar Staff se Servers ka rule nahi hai, connection discard hota hai aur log hota hai.</p></div>

<h3>Console mein steps</h3>
<ol>
<li>Engine element edit karo aur interface 2 kholo.</li>
<li>VLAN ID 10 aur address 10.1.10.1, prefix 24 ke saath VLAN interface jodo.</li>
<li>VLAN ID 20 aur address 10.1.20.1, prefix 24 ke saath doosra VLAN interface jodo.</li>
<li>Check karo ki switch trunk wahi VLAN IDs allow karta hai. Yeh engine ka nahi, switch ka kaam hai.</li>
<li>Install policy karo aur Staff PC se uske gateway ko ping karke test karo.</li>
</ol>
<pre class="out">eth2      UP    (no address, trunk)
eth2.10   UP    <span class="hl">10.1.10.1/24</span>
eth2.20   UP    <span class="hl">10.1.20.1/24</span></pre>
<p>Upar ka output simulator style hai. Lab engine par addresses dekhne ke liye <code>ip</code> tool use karo aur allowed ya discarded traffic dekhne ke liye Logs page.</p>

<div class="warn"><p><b>Common mistakes.</b> Engine ka VLAN ID switch ke trunk ya access port se match nahi karta, isliye gateway kabhi jawab nahi deta. Switch trunk VLAN allow nahi karta. Dono VLANs ko same subnet de dena. Physical interface par purana untagged address chhod dena aur phir sochna ki VLAN ke hosts ko do gateways kyun dikh rahe hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> VLAN tag sirf Layer 2 label hai. Isse akele security nahi milti. Security tab milti hai jab engine VLAN interfaces ke beech route karta hai aur wahan policy lagti hai. Aur VLAN interface ek naya network hai, isliye uska apna route logic aur apne rules chahiye.</p></div>

<div class="scn"><h4>Staff se Servers tak nahi pahunch pa rahe</h4><p>Switch refresh ke baad MyPnetLab Pune ke Staff PCs file server tak nahi pahunch paye. Engine config theek dikh raha tha. Engineer ne server se Servers ke engine gateway ko ping kiya, jawab nahi aaya, phir switch check kiya: naye switch template ke baad trunk sirf VLAN 10 allow kar raha tha. Allowed list mein VLAN 20 jodne ke baad gateway ne jawab diya aur purana Staff to Servers rule phir chal gaya.</p><p><b>Lesson:</b> jab koi VLAN apne gateway ko jawab nahi deta, firewall rule chhedne se pehle dono taraf ka tag check karo.</p></div>

<div class="iv"><p class="q">"VLANs ko switch ke bajay firewall par terminate kyun karoge?"</p><p>Kyunki tab firewall VLANs ke beech ka poora traffic inspect aur log kar sakta hai, sirf internet wala nahi. Switch sirf VLAN ke andar forward karta hai. Engine par VLAN interfaces hon to har inter-VLAN flow access rules se guzarta hai. Trade-off bhi batao: firewall par zyada load aur trunk fail hone par bada blast radius.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Trunk ek cable par dot1Q tags se kai VLANs carry karta hai.</li>
<li>VLAN interface physical interface ka sub-interface hai jiska apna ID, address aur prefix hota hai.</li>
<li>Hosts VLAN interface ka address gateway ki tarah use karte hain.</li>
<li>VLANs ke beech ka traffic engine policy se guzarta hai, yahi security point hai.</li>
<li>VLAN IDs engine aur switch par match hone chahiye. Changes sirf Install policy ke baad apply hote hain.</li>
</ul></div>
`}};export{e as default};