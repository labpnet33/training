var e={id:`private-vlan-concepts`,h:{en:`Private VLANs: one subnet, controlled conversations`,hi:`Private VLANs: ek subnet, control mein baat-cheet`},body:{en:`
<p>A DMZ with ten web servers in one VLAN has a hidden risk: if one server is compromised, the attacker can reach the other nine at Layer 2, with no firewall in the way. The usual answer, one VLAN and one subnet per server, wastes addresses and makes the router configuration huge. A <b>private VLAN</b> keeps a single subnet and a single gateway but limits which ports may talk to each other inside it.</p>

<h3>Primary and secondary VLANs</h3>
<p>A PVLAN is a primary VLAN plus secondary VLANs that share its subnet.</p>
<ul>
<li><b>Primary VLAN.</b> The parent. Frames from the gateway and from other promiscuous ports travel in it.</li>
<li><b>Isolated secondary VLAN.</b> Its ports can talk to the promiscuous port only. Two isolated ports can never talk to each other. There can be only one isolated VLAN per primary.</li>
<li><b>Community secondary VLAN.</b> Its ports can talk to each other and to the promiscuous port, but not to other communities or to isolated ports. There can be many communities.</li>
</ul>

<h3>Port types</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="PVLAN port types">
<rect x="250" y="10" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">Gateway (promiscuous)</text>
<rect x="240" y="95" width="160" height="50" rx="10" fill="#bae6fd"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="14">Switch, primary VLAN</text>
<rect x="10" y="175" width="110" height="44" rx="8" fill="#fecaca"/><text x="65" y="195" text-anchor="middle" class="svg-ink" font-size="12">GST1 isolated</text>
<rect x="135" y="175" width="110" height="44" rx="8" fill="#fecaca"/><text x="190" y="195" text-anchor="middle" class="svg-ink" font-size="12">GST2 isolated</text>
<rect x="395" y="175" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="450" y="195" text-anchor="middle" class="svg-ink" font-size="12">WEB1 community</text>
<rect x="520" y="175" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="575" y="195" text-anchor="middle" class="svg-ink" font-size="12">WEB2 community</text>
<line x1="320" y1="54" x2="320" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="270" y1="145" x2="65" y2="175" stroke="#64748b" stroke-width="2"/><line x1="290" y1="145" x2="190" y2="175" stroke="#64748b" stroke-width="2"/><line x1="350" y1="145" x2="450" y2="175" stroke="#64748b" stroke-width="2"/><line x1="370" y1="145" x2="575" y2="175" stroke="#64748b" stroke-width="2"/>
<text x="130" y="160" text-anchor="middle" class="svg-muted" font-size="11">no talk between</text>
<text x="510" y="160" text-anchor="middle" class="svg-accent" font-size="11">talk to each other</text>
</svg><p class="cap">Everyone reaches the gateway; only community members reach each other.</p></div>
<ul>
<li><b>Promiscuous port.</b> Talks to every port in the PVLAN. This is where the router, firewall or gateway connects.</li>
<li><b>Isolated port.</b> Member of the isolated VLAN.</li>
<li><b>Community port.</b> Member of a community VLAN.</li>
<li><b>Inter-switch link (PVLAN trunk).</b> Connects two PVLAN switches and carries the primary and all secondary VLANs, so isolation still works across switches.</li>
</ul>

<h3>Who can talk to whom</h3>
<table class="tbl"><thead><tr><th>From \\ To</th><th>Promiscuous</th><th>Isolated</th><th>Community A</th><th>Community B</th></tr></thead><tbody>
<tr><td>Promiscuous</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
<tr><td>Isolated</td><td>Yes</td><td>No</td><td>No</td><td>No</td></tr>
<tr><td>Community A</td><td>Yes</td><td>No</td><td>Yes</td><td>No</td></tr>
<tr><td>Community B</td><td>Yes</td><td>No</td><td>No</td><td>Yes</td></tr>
</tbody></table>
<p>Learn this table, because most exam questions are one cell of it.</p>

<h3>How the frames really travel</h3>
<p>The switch learns a MAC address under the VLAN the frame uses. A guest frame going to the gateway uses the isolated VLAN, and the answer from the gateway comes back in the primary VLAN. This is why the promiscuous port is a member of the primary VLAN while the host ports are members of secondary VLANs. The key limit to remember is that two hosts that cannot talk at Layer 2 still share a subnet, so a host will try to ARP for its neighbour and get no answer. If you want guests to reach each other, they must go via the gateway, which then needs <b>local proxy ARP</b> and a policy that allows it, and by default we do not.</p>

<div class="eg"><p><b>Worked example.</b> Primary VLAN DMZ (100), isolated GUEST (101), community WEB (102). Gateway on the promiscuous port. Guest laptops go in GUEST, so one infected guest cannot scan the others. Two web servers go in WEB, so they can synchronise with each other but cannot reach guests or other tenants.</p></div>

<div class="warn"><p><b>Common mistake.</b> Assuming an isolated port cannot reach the internet. It can, through the promiscuous port. Isolation only blocks host-to-host traffic inside the PVLAN. A second mistake is placing the gateway on an isolated or community port, which breaks reachability for everybody.</p></div>
<div class="exam"><p><b>Exam trap.</b> Isolated ports cannot talk to community ports, and community A cannot talk to community B. Only the promiscuous port reaches everything. Also, only one isolated VLAN is allowed under a primary.</p></div>

<div class="scn"><h4>The hosting customer who got scanned</h4><p>A small hoster put all customer VMs on one VLAN. One customer's compromised VM scanned and attacked neighbours. Moving customers into the isolated VLAN of a PVLAN stopped host-to-host traffic, while every VM kept its address, its gateway and its internet access. No re-addressing was needed.</p><p><b>Lesson:</b> a PVLAN adds isolation without changing the addressing plan.</p></div>

<div class="iv"><p class="q">"What is the difference between isolated and community secondary VLANs?"</p><p>Isolated ports reach only the promiscuous port, so two isolated hosts can never talk. Community ports reach their own community and the promiscuous port, but not other communities or isolated ports. There is one isolated VLAN and any number of communities per primary.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A PVLAN splits one subnet into a primary VLAN plus isolated and community secondary VLANs.</li>
<li>The promiscuous port, usually the gateway, reaches everyone.</li>
<li>Isolated hosts reach only the promiscuous port, community hosts reach their community as well.</li>
<li>The inter-switch link carries primary and secondary VLANs between switches.</li>
</ul></div>
`,hi:`
<p>Ek VLAN mein das web servers wale DMZ mein chhupa khatra hota hai: agar ek server compromise ho jaaye to attacker baaki nau tak Layer 2 par pahunch sakta hai, beech mein koi firewall nahi. Aam jawab, har server ke liye ek VLAN aur ek subnet, addresses barbaad karta hai aur router configuration bahut bada kar deta hai. <b>Private VLAN</b> ek subnet aur ek gateway rakhta hai lekin us ke andar kaunse ports aapas mein baat kar sakte hain yeh seemit karta hai.</p>

<h3>Primary aur secondary VLANs</h3>
<p>PVLAN ek primary VLAN plus uske subnet ko share karne wale secondary VLANs hota hai.</p>
<ul>
<li><b>Primary VLAN.</b> Parent. Gateway aur doosre promiscuous ports ke frames isi mein chalte hain.</li>
<li><b>Isolated secondary VLAN.</b> Iske ports sirf promiscuous port se baat kar sakte hain. Do isolated ports kabhi aapas mein baat nahi kar sakte. Ek primary ke neeche ek hi isolated VLAN ho sakta hai.</li>
<li><b>Community secondary VLAN.</b> Iske ports aapas mein aur promiscuous port se baat kar sakte hain, par doosri communities ya isolated ports se nahi. Communities kai ho sakti hain.</li>
</ul>

<h3>Port types</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="PVLAN port types">
<rect x="250" y="10" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">Gateway (promiscuous)</text>
<rect x="240" y="95" width="160" height="50" rx="10" fill="#bae6fd"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="14">Switch, primary VLAN</text>
<rect x="10" y="175" width="110" height="44" rx="8" fill="#fecaca"/><text x="65" y="195" text-anchor="middle" class="svg-ink" font-size="12">GST1 isolated</text>
<rect x="135" y="175" width="110" height="44" rx="8" fill="#fecaca"/><text x="190" y="195" text-anchor="middle" class="svg-ink" font-size="12">GST2 isolated</text>
<rect x="395" y="175" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="450" y="195" text-anchor="middle" class="svg-ink" font-size="12">WEB1 community</text>
<rect x="520" y="175" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="575" y="195" text-anchor="middle" class="svg-ink" font-size="12">WEB2 community</text>
<line x1="320" y1="54" x2="320" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="270" y1="145" x2="65" y2="175" stroke="#64748b" stroke-width="2"/><line x1="290" y1="145" x2="190" y2="175" stroke="#64748b" stroke-width="2"/><line x1="350" y1="145" x2="450" y2="175" stroke="#64748b" stroke-width="2"/><line x1="370" y1="145" x2="575" y2="175" stroke="#64748b" stroke-width="2"/>
<text x="130" y="160" text-anchor="middle" class="svg-muted" font-size="11">aapas mein baat nahi</text>
<text x="510" y="160" text-anchor="middle" class="svg-accent" font-size="11">aapas mein baat</text>
</svg><p class="cap">Sab gateway tak pahunchte hain; sirf community members aapas mein pahunchte hain.</p></div>
<ul>
<li><b>Promiscuous port.</b> PVLAN ke har port se baat karta hai. Yahan router, firewall ya gateway judta hai.</li>
<li><b>Isolated port.</b> Isolated VLAN ka member.</li>
<li><b>Community port.</b> Community VLAN ka member.</li>
<li><b>Inter-switch link (PVLAN trunk).</b> Do PVLAN switches ko jodta hai aur primary aur saare secondary VLANs le jaata hai, taaki isolation switches ke beech bhi kaam kare.</li>
</ul>

<h3>Kaun kis se baat kar sakta hai</h3>
<table class="tbl"><thead><tr><th>From \\ To</th><th>Promiscuous</th><th>Isolated</th><th>Community A</th><th>Community B</th></tr></thead><tbody>
<tr><td>Promiscuous</td><td>Haan</td><td>Haan</td><td>Haan</td><td>Haan</td></tr>
<tr><td>Isolated</td><td>Haan</td><td>Nahi</td><td>Nahi</td><td>Nahi</td></tr>
<tr><td>Community A</td><td>Haan</td><td>Nahi</td><td>Haan</td><td>Nahi</td></tr>
<tr><td>Community B</td><td>Haan</td><td>Nahi</td><td>Nahi</td><td>Haan</td></tr>
</tbody></table>
<p>Yeh table yaad kar lo, kyunki zyaadatar exam sawaal iska ek cell hote hain.</p>

<h3>Frames asal mein kaise chalte hain</h3>
<p>Switch MAC address ko us VLAN ke under seekhta hai jo frame use karta hai. Guest ka gateway ki taraf jaata frame isolated VLAN use karta hai, aur gateway ka jawab primary VLAN mein wapas aata hai. Isi liye promiscuous port primary VLAN ka member hota hai jabki host ports secondary VLANs ke members hote hain. Yaad rakhne wali limit: jo do hosts Layer 2 par baat nahi kar sakte woh phir bhi ek subnet share karte hain, isliye host apne padosi ke liye ARP karega aur jawab nahi paayega. Agar guests ko aapas mein pahunchna ho to gateway se hokar jaana padega, jis par <b>local proxy ARP</b> aur ise allow karne wali policy chahiye, aur default mein hum yeh nahi karte.</p>

<div class="eg"><p><b>Worked example.</b> Primary VLAN DMZ (100), isolated GUEST (101), community WEB (102). Gateway promiscuous port par. Guest laptops GUEST mein jaate hain, isliye ek infected guest baaki ko scan nahi kar sakta. Do web servers WEB mein jaate hain, isliye woh aapas mein sync kar sakte hain par guests ya doosre tenants tak nahi pahunch sakte.</p></div>

<div class="warn"><p><b>Common mistake.</b> Yeh maan lena ki isolated port internet tak nahi pahunch sakta. Woh promiscuous port se pahunch sakta hai. Isolation sirf PVLAN ke andar host-to-host traffic rokta hai. Doosri galti: gateway ko isolated ya community port par rakhna, jo sab ki reachability tod deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Isolated ports community ports se baat nahi kar sakte, aur community A community B se nahi. Sirf promiscuous port sab tak pahunchta hai. Aur primary ke neeche sirf ek isolated VLAN allowed hai.</p></div>

<div class="scn"><h4>Hosting customer jo scan ho gaya</h4><p>Ek chhote hoster ne saare customer VMs ek VLAN mein rakhe the. Ek customer ka compromised VM padosiyon ko scan aur attack karta tha. Customers ko PVLAN ke isolated VLAN mein le jaane se host-to-host traffic ruk gaya, jabki har VM ka address, gateway aur internet access waisa hi raha. Re-addressing nahi karni padi.</p><p><b>Lesson:</b> PVLAN addressing plan badle bina isolation jodta hai.</p></div>

<div class="iv"><p class="q">"Isolated aur community secondary VLANs mein kya fark hai?"</p><p>Isolated ports sirf promiscuous port tak pahunchte hain, isliye do isolated hosts kabhi baat nahi kar sakte. Community ports apni community aur promiscuous port tak pahunchte hain, par doosri communities ya isolated ports tak nahi. Ek primary ke liye ek isolated VLAN aur kitni bhi communities ho sakti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PVLAN ek subnet ko primary VLAN plus isolated aur community secondary VLANs mein baantta hai.</li>
<li>Promiscuous port, aam taur par gateway, sab tak pahunchta hai.</li>
<li>Isolated hosts sirf promiscuous port tak pahunchte hain, community hosts apni community tak bhi.</li>
<li>Inter-switch link switches ke beech primary aur secondary VLANs le jaata hai.</li>
</ul></div>
`}};export{e as default};