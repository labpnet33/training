var e={id:`overview`,h:{en:`Tunnels on Junos: what you will learn and the big picture`,hi:`Junos par tunnels: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn why networks use tunnels, how a Junos router wraps one packet inside another with GRE (<code>gr-0/0/0</code>) or IP-IP (<code>ip-0/0/0</code>), what that extra wrapper does to the packet size, how GRE keepalives detect a dead far end, how to run OSPF over a tunnel, and how to spot and fix the recursive-routing trap. These topics belong to the tunnels part of the JNCIS-ENT (JN0-351 / JN0-352) blueprint, and they are also the daily bread of anyone who joins branch offices over the Internet.</p>
<p><b>Prerequisites.</b> You should be comfortable with the Junos CLI (candidate and active configuration, <code>commit</code>, <code>show | compare</code>), with IPv4 addressing and subnets, with static routes and with a basic OSPF adjacency. If any of these feels shaky, revisit the JNCIA modules first. We do not re-teach them here.</p>

<h3>Analogy: a letter inside a courier envelope</h3>
<p>Imagine your Lucknow office wants to send a private memo, addressed with internal room numbers, to the Kanpur office. The postal service only understands street addresses, not your internal room numbers. So you put the memo (the <b>passenger</b>) inside a courier envelope (the <b>delivery header</b>) that carries a street address. The courier moves the envelope. At Kanpur, someone opens the envelope and hands over the memo. The courier never reads the memo, and the memo never needs to know the streets between the cities.</p>
<p>A tunnel is exactly this. The passenger is an IP packet with private addresses such as 192.168.61.10. The envelope is a new outer IP header with public addresses such as 203.0.113.1 and 203.0.113.9. The provider routes only on the outer header.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Passenger packet inside a tunnel">
<rect x="20" y="40" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="75" y="66" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="75" y="86" text-anchor="middle" class="svg-muted" font-size="12">Lucknow</text>
<rect x="510" y="40" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="565" y="66" text-anchor="middle" class="svg-ink" font-size="14">R3</text><text x="565" y="86" text-anchor="middle" class="svg-muted" font-size="12">Kanpur</text>
<rect x="250" y="40" width="140" height="60" rx="10" fill="#e2e8f0"/><text x="320" y="66" text-anchor="middle" class="svg-ink" font-size="14">ISP</text><text x="320" y="86" text-anchor="middle" class="svg-muted" font-size="12">routes public only</text>
<line x1="130" y1="70" x2="250" y2="70" stroke="#64748b" stroke-width="2"/><line x1="390" y1="70" x2="510" y2="70" stroke="#64748b" stroke-width="2"/>
<path d="M75 40 Q320 -5 565 40" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="320" y="20" text-anchor="middle" class="svg-accent" font-size="12">logical tunnel (overlay)</text>
<rect x="60" y="130" width="130" height="40" rx="6" fill="#fde68a"/><text x="125" y="155" text-anchor="middle" class="svg-ink" font-size="12">outer IP 203.0.113.1 to .9</text>
<rect x="190" y="130" width="70" height="40" rx="6" fill="#fed7aa"/><text x="225" y="155" text-anchor="middle" class="svg-ink" font-size="12">GRE</text>
<rect x="260" y="130" width="200" height="40" rx="6" fill="#bae6fd"/><text x="360" y="155" text-anchor="middle" class="svg-ink" font-size="12">inner IP 192.168.61.10 to 192.168.63.10</text>
<text x="320" y="196" text-anchor="middle" class="svg-muted" font-size="12">what the ISP sees on the wire</text>
</svg><p class="cap">The ISP routes the outer header only. The inner packet rides along untouched.</p></div>

<h3>Why tunnel at all?</h3>
<ul>
<li><b>Private sites over a public network.</b> The Internet will not route 192.168.0.0/16, but a tunnel hides those addresses.</li>
<li><b>Carrying something the underlay does not understand.</b> GRE can carry IPv6, multicast and routing-protocol hellos across an IPv4-only path.</li>
<li><b>Overlay design.</b> The tunnel is a logical point-to-point link. You run routing on it exactly as on a cable.</li>
</ul>
<p>Two terms you will use constantly: the <b>underlay</b> is the real network that carries the outer packets; the <b>overlay</b> is the logical network formed by the tunnels. Most tunnel problems are an underlay problem or a clash between the two.</p>

<h3>The modules plan</h3>
<table class="cmp"><tr><th>Chapter</th><th>Topic</th></tr>
<tr><td>2</td><td>Encapsulation: how the wrapper is built, GRE versus IP-IP</td></tr>
<tr><td>3</td><td>Configuring GRE</td></tr>
<tr><td>4</td><td>Configuring IP-IP</td></tr>
<tr><td>5</td><td>MTU and fragmentation</td></tr>
<tr><td>6</td><td>GRE keepalives</td></tr>
<tr><td>7</td><td>Routing over a tunnel</td></tr>
<tr><td>8</td><td>Troubleshooting and the recursive-routing trap</td></tr>
<tr><td>9</td><td>Summary and exam checklist</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> In the first lab R1 (Lucknow, WAN 203.0.113.1/30) and R3 (Kanpur, WAN 203.0.113.9/30) are separated by a provider router ISP. The LANs are 192.168.61.0/24 and 192.168.63.0/24. By the end of chapter 7 PC1 at 192.168.61.10 pings PC3 at 192.168.63.10 even though the ISP has no route to either LAN.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking a tunnel is secure. GRE and IP-IP only wrap; they do not encrypt or authenticate. Anyone on the path can read the passenger. Confidentiality needs IPsec on top, which is a separate topic.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Tunnel" does not mean "VPN with encryption". If the question mentions GRE or IP-IP alone, assume no encryption.</p></div>

<div class="scn"><h4>Two branches, one provider, no private routes</h4><p>A company opened a Kanpur branch. The provider sells only Internet access and will not carry private subnets. Engineers built a GRE tunnel between the two public WAN addresses, ran OSPF over it and both LANs appeared in each other's routing tables within a minute. The provider needed no change at all.</p><p><b>Lesson:</b> the tunnel turns a path you do not control into a link you do control.</p></div>

<div class="iv"><p class="q">"What is a tunnel and why would you use one?"</p><p>A tunnel encapsulates one packet inside another so it can cross a network that cannot route the inner addresses. Typical uses are joining private sites over the Internet and carrying multicast, IPv6 or routing protocols over an IPv4 underlay. Mention underlay versus overlay, and that GRE and IP-IP give no encryption.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A tunnel wraps a passenger packet in a new outer IP header.</li>
<li>The underlay carries the outer packets; the overlay is the logical link on top.</li>
<li>Junos has gr-0/0/0 for GRE and ip-0/0/0 for IP-IP.</li>
<li>Neither GRE nor IP-IP encrypts anything.</li>
<li>This module's labs: a GRE tunnel with OSPF, and an IP-IP tunnel that keeps flapping.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki networks tunnels kyun use karte hain, Junos router ek packet ko doosre ke andar GRE (<code>gr-0/0/0</code>) ya IP-IP (<code>ip-0/0/0</code>) se kaise lapetta hai, is extra wrapper ka packet size par kya asar padta hai, GRE keepalives mara hua far end kaise pakadte hain, tunnel par OSPF kaise chalate hain, aur recursive-routing ke jaal ko kaise pehchanke theek karte hain. Yeh topics JNCIS-ENT (JN0-351 / JN0-352) blueprint ke tunnels hisse mein aate hain, aur jo bhi branch offices ko Internet par jodta hai, uska roz ka kaam hain.</p>
<p><b>Prerequisites.</b> Aapko Junos CLI (candidate aur active configuration, <code>commit</code>, <code>show | compare</code>), IPv4 addressing aur subnets, static routes aur basic OSPF adjacency aani chahiye. Inme se kuch kamzor lage to pehle JNCIA modules dekh lo. Yahan hum unhe dobara nahi padhate.</p>

<h3>Analogy: courier envelope ke andar ek chitthi</h3>
<p>Socho Lucknow office Kanpur office ko ek private memo bhejna chahta hai, jis par internal room numbers likhe hain. Postal service sirf street address samajhti hai, internal room numbers nahi. To aap memo (<b>passenger</b>) ko ek courier envelope (<b>delivery header</b>) mein daalte ho jis par street address hai. Courier envelope le jaata hai. Kanpur mein koi envelope kholkar memo de deta hai. Courier memo kabhi nahi padhta, aur memo ko beech ki streets jaanne ki zaroorat nahi.</p>
<p>Tunnel bilkul aisa hi hai. Passenger ek IP packet hai jisme private addresses hain jaise 192.168.61.10. Envelope ek naya outer IP header hai jisme public addresses hain jaise 203.0.113.1 aur 203.0.113.9. Provider sirf outer header par route karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Tunnel ke andar passenger packet">
<rect x="20" y="40" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="75" y="66" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="75" y="86" text-anchor="middle" class="svg-muted" font-size="12">Lucknow</text>
<rect x="510" y="40" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="565" y="66" text-anchor="middle" class="svg-ink" font-size="14">R3</text><text x="565" y="86" text-anchor="middle" class="svg-muted" font-size="12">Kanpur</text>
<rect x="250" y="40" width="140" height="60" rx="10" fill="#e2e8f0"/><text x="320" y="66" text-anchor="middle" class="svg-ink" font-size="14">ISP</text><text x="320" y="86" text-anchor="middle" class="svg-muted" font-size="12">sirf public route</text>
<line x1="130" y1="70" x2="250" y2="70" stroke="#64748b" stroke-width="2"/><line x1="390" y1="70" x2="510" y2="70" stroke="#64748b" stroke-width="2"/>
<path d="M75 40 Q320 -5 565 40" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="320" y="20" text-anchor="middle" class="svg-accent" font-size="12">logical tunnel (overlay)</text>
<rect x="60" y="130" width="130" height="40" rx="6" fill="#fde68a"/><text x="125" y="155" text-anchor="middle" class="svg-ink" font-size="12">outer IP 203.0.113.1 to .9</text>
<rect x="190" y="130" width="70" height="40" rx="6" fill="#fed7aa"/><text x="225" y="155" text-anchor="middle" class="svg-ink" font-size="12">GRE</text>
<rect x="260" y="130" width="200" height="40" rx="6" fill="#bae6fd"/><text x="360" y="155" text-anchor="middle" class="svg-ink" font-size="12">inner IP 192.168.61.10 to 192.168.63.10</text>
<text x="320" y="196" text-anchor="middle" class="svg-muted" font-size="12">wire par ISP yeh dekhta hai</text>
</svg><p class="cap">ISP sirf outer header par route karta hai. Inner packet bina chhede saath chalta hai.</p></div>

<h3>Tunnel banate hi kyun hain?</h3>
<ul>
<li><b>Public network par private sites.</b> Internet 192.168.0.0/16 route nahi karta, lekin tunnel un addresses ko chhupa deta hai.</li>
<li><b>Aisi cheez le jaana jo underlay samajhta nahi.</b> GRE IPv4-only path par IPv6, multicast aur routing-protocol hellos le ja sakta hai.</li>
<li><b>Overlay design.</b> Tunnel ek logical point-to-point link hai. Us par routing waise hi chalate ho jaise cable par.</li>
</ul>
<p>Do terms jo baar-baar aayenge: <b>underlay</b> woh asli network hai jo outer packets le jaata hai; <b>overlay</b> tunnels se bana logical network hai. Zyadatar tunnel problems underlay ki problem ya dono ke takraav se hoti hain.</p>

<h3>Module ka plan</h3>
<table class="cmp"><tr><th>Chapter</th><th>Topic</th></tr>
<tr><td>2</td><td>Encapsulation: wrapper kaise banta hai, GRE banaam IP-IP</td></tr>
<tr><td>3</td><td>GRE configure karna</td></tr>
<tr><td>4</td><td>IP-IP configure karna</td></tr>
<tr><td>5</td><td>MTU aur fragmentation</td></tr>
<tr><td>6</td><td>GRE keepalives</td></tr>
<tr><td>7</td><td>Tunnel par routing</td></tr>
<tr><td>8</td><td>Troubleshooting aur recursive-routing ka jaal</td></tr>
<tr><td>9</td><td>Summary aur exam checklist</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Pehle lab mein R1 (Lucknow, WAN 203.0.113.1/30) aur R3 (Kanpur, WAN 203.0.113.9/30) ke beech provider router ISP hai. LANs 192.168.61.0/24 aur 192.168.63.0/24 hain. Chapter 7 tak PC1 (192.168.61.10) PC3 (192.168.63.10) ko ping karega, jabki ISP ke paas dono LANs ka koi route nahi.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Tunnel ko secure maan lena. GRE aur IP-IP sirf lapette hain; encrypt ya authenticate nahi karte. Raste mein koi bhi passenger padh sakta hai. Confidentiality ke liye upar se IPsec chahiye, jo alag topic hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Tunnel" ka matlab "encryption wala VPN" nahi hai. Sawal mein sirf GRE ya IP-IP ho to maan lo encryption nahi hai.</p></div>

<div class="scn"><h4>Do branches, ek provider, koi private route nahi</h4><p>Company ne Kanpur branch kholi. Provider sirf Internet access bechta hai aur private subnets nahi le jaata. Engineers ne dono public WAN addresses ke beech GRE tunnel banaya, uspar OSPF chalaya aur ek minute mein dono LANs ek dusre ki routing table mein aa gaye. Provider ko kuch badalna hi nahi pada.</p><p><b>Lesson:</b> tunnel us path ko, jo aapke control mein nahi, ek aise link mein badal deta hai jo aapke control mein hai.</p></div>

<div class="iv"><p class="q">"Tunnel kya hai aur use kyun karte hain?"</p><p>Tunnel ek packet ko doosre ke andar encapsulate karta hai taaki woh aise network ko paar kar sake jo inner addresses route nahi kar sakta. Aam use: Internet par private sites jodna, aur IPv4 underlay par multicast, IPv6 ya routing protocols le jaana. Underlay versus overlay ka zikr karo, aur batao ki GRE aur IP-IP encryption nahi dete.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnel passenger packet ko naye outer IP header mein lapetta hai.</li>
<li>Underlay outer packets le jaata hai; overlay uske upar ka logical link hai.</li>
<li>Junos mein GRE ke liye gr-0/0/0 aur IP-IP ke liye ip-0/0/0 hai.</li>
<li>GRE aur IP-IP dono encrypt nahi karte.</li>
<li>Is module ke labs: OSPF wala GRE tunnel, aur IP-IP tunnel jo flap karta rehta hai.</li>
</ul></div>
`}};export{e as default};