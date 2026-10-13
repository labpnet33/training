var e={id:`l2-l3-multichassis`,h:{en:`Layer 2 vs Layer 3 port-channels, and multi-chassis bundles`,hi:`Layer 2 vs Layer 3 port-channels, aur multi-chassis bundles`},body:{en:`
<p>A multi-lane highway can do two jobs. It can be part of a city's internal road grid, where cars from every neighbourhood (VLAN) share it, or it can be a private expressway between two airports that carries only through-traffic from one terminal to the other. A <b>Layer 2 port-channel</b> is the city grid: a trunk or access link carrying VLANs. A <b>Layer 3 port-channel</b> is the airport expressway: a routed point-to-point link with an IP address and no VLANs at all.</p>

<h3>Layer 2 port-channels</h3>
<p>Everything you have configured so far (Po1 in the static lab, Po10 in the LACP lab) is Layer 2. The members are <code>switchport</code> interfaces, the port-channel is an access port or an 802.1Q trunk, STP runs on it, and the switch learns MAC addresses on <code>Po10</code> rather than on individual members. In <code>show etherchannel summary</code> the port-channel carries the flag <b>S</b> (Layer 2), and a healthy one shows <code>(SU)</code>. This is the typical access-to-distribution uplink.</p>

<h3>Layer 3 (routed) port-channels</h3>
<p>Between distribution and core, many networks use routed links instead of trunks, so no STP is needed and routing protocols such as OSPF handle redundancy. A bundle can be routed too. The rule: the members must be <b>routed ports before they join</b>, so the port-channel is created as a routed interface.</p>

<pre class="code">CORE1(config)# interface range te1/1/1 - 2
CORE1(config-if-range)# no switchport
CORE1(config-if-range)# channel-group 20 mode active
CORE1(config-if-range)# exit
CORE1(config)# interface port-channel 20
CORE1(config-if)# ip address 10.0.0.1 255.255.255.252
<span class="c">! No IP addresses on te1/1/1 or te1/1/2. The IP lives only on Po20.</span>

DSW1(config)# interface range te1/1/1 - 2
DSW1(config-if-range)# no switchport
DSW1(config-if-range)# channel-group 20 mode active
DSW1(config-if-range)# exit
DSW1(config)# interface port-channel 20
DSW1(config-if)# ip address 10.0.0.2 255.255.255.252</pre>

<pre class="out">CORE1# show etherchannel summary | begin Group
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
<span class="hl">20     Po20(RU)        LACP      Te1/1/1(P)  Te1/1/2(P)</span>

CORE1# show ip interface brief | include Port-channel
Port-channel20         10.0.0.1        YES manual up                    up</pre>
<p>The flag is now <b>R</b> (Layer 3) and <b>U</b> (in use), so <code>(RU)</code> is the healthy result. OSPF or static routes point at <code>Port-channel20</code>, and a member failure does not change the routing table because Po20 stays up. The bundle bandwidth (20 Gbps here) is used by OSPF for cost if the reference bandwidth is high enough.</p>

<table class="cmp"><tr><th></th><th>Layer 2 port-channel</th><th>Layer 3 port-channel</th></tr>
<tr><td>Member ports</td><td><code>switchport</code></td><td><code>no switchport</code> before channel-group</td></tr>
<tr><td>Carries</td><td>One VLAN (access) or many (trunk)</td><td>Routed IP traffic, no VLANs</td></tr>
<tr><td>Addressing</td><td>None on the Po (gateways are SVIs)</td><td>IP address on the Po</td></tr>
<tr><td>STP</td><td>Runs on the Po</td><td>Not involved</td></tr>
<tr><td>Summary flag</td><td><code>(SU)</code></td><td><code>(RU)</code></td></tr></table>

<h3>Routers and firewalls</h3>
<p>A router can terminate a bundle too. On a Cisco IOS XE router, the members join <code>channel-group 1 mode active</code> and you can either put an IP address on <code>Port-channel1</code>, or build router-on-a-stick subinterfaces on it, such as <code>interface Port-channel1.10</code> with <code>encapsulation dot1Q 10</code>, facing a Layer 2 trunk port-channel on the switch. Firewalls commonly connect the same way with LACP.</p>

<div class="eg"><p><b>Worked example.</b> You need a 2 Gbps routed link between CORE1 and DSW1 using Gi1/0/47 and Gi1/0/48. Addressing: 192.0.2.0/30, CORE1 .1, DSW1 .2. On each switch: <code>interface range g1/0/47 - 48</code>, <code>no switchport</code>, <code>channel-group 30 mode active</code>; then <code>interface port-channel 30</code>, <code>ip address 192.0.2.1 255.255.255.252</code> (DSW1 uses .2). Verify <code>Po30(RU)</code>, then ping 192.0.2.2 from CORE1.</p></div>

<h3>Preview: bundles that span two switches</h3>
<p>So far every bundle ends on <b>one</b> neighbour switch. LACP insists on that, because all members must see the same partner system ID. But then the neighbour switch is a single point of failure: if it dies, the whole bundle dies. The answer is <b>multi-chassis EtherChannel</b> (MEC or MC-LAG): two physical switches present <b>one LACP identity</b>, so the downstream device happily bundles links to both.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Multi-chassis EtherChannel preview">
<rect x="150" y="20" width="340" height="80" rx="10" fill="none" stroke="#64748b" stroke-dasharray="6 4"/>
<text x="320" y="16" text-anchor="middle" class="svg-muted" font-size="12">one logical LACP partner</text>
<rect x="175" y="38" width="120" height="46" rx="8" fill="#bae6fd"/><text x="235" y="60" text-anchor="middle" class="svg-ink" font-size="13">Switch A</text><text x="235" y="76" text-anchor="middle" class="svg-muted" font-size="12">stack / VSS / vPC</text>
<rect x="345" y="38" width="120" height="46" rx="8" fill="#bae6fd"/><text x="405" y="60" text-anchor="middle" class="svg-ink" font-size="13">Switch B</text><text x="405" y="76" text-anchor="middle" class="svg-muted" font-size="12">stack / VSS / vPC</text>
<line x1="295" y1="61" x2="345" y2="61" stroke="#64748b" stroke-width="4"/>
<rect x="260" y="180" width="120" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="202" text-anchor="middle" class="svg-ink" font-size="13">ASW / server</text><text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="12">one Po, LACP</text>
<line x1="235" y1="84" x2="300" y2="180" stroke="#64748b" stroke-width="3"/><line x1="405" y1="84" x2="340" y2="180" stroke="#64748b" stroke-width="3"/>
<ellipse cx="320" cy="150" rx="60" ry="14" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="400" y="150" class="svg-accent" font-size="12">MEC: survives a switch failure</text>
</svg><p class="cap">Two switches pretend to be one LACP partner, so the downstream bundle survives the loss of a whole switch and STP blocks nothing.</p></div>

<ul>
<li><b>StackWise</b> (Catalyst 9200/9300): several switches joined by stack cables act as one switch with one configuration. A <b>cross-stack EtherChannel</b> simply uses members on different stack members, for example Gi1/0/1 and Gi2/0/1.</li>
<li><b>StackWise Virtual</b> (Catalyst 9500/9600) and its predecessor <b>VSS</b> (Catalyst 4500/6500): two chassis merge into one logical switch with one control plane; bundles across them are MECs.</li>
<li><b>vPC</b> (Cisco Nexus): two switches keep <b>separate</b> control planes and configurations but share an LACP system ID for vPC port-channels. You will study it in depth in the data-centre track.</li>
</ul>
<p>For the CCNA you only need the idea: the downstream device sees one partner and runs an ordinary LACP bundle.</p>

<div class="warn"><p><b>Common mistake.</b> Putting <code>no switchport</code> on the port-channel but not on the members, or configuring IP addresses on the members. Members of a routed bundle carry no IP; the port-channel does.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>(RU)</code> = Layer 3 in use, <code>(SU)</code> = Layer 2 in use. A question showing <code>Po1(SD)</code> is Layer 2 and down, not "static". The letter S means Layer 2, not static.</p></div>

<div class="scn"><h4>The server that could only bundle half</h4><p>A server team cabled a new database server's two NICs to two separate, stand-alone Catalyst switches and configured an LACP bond. Only one NIC ever became active. <code>show lacp neighbor</code> on each switch looked fine, but the server's bond status showed two different partner system MACs, so it could aggregate only the ports facing one partner. The team moved both cables to a two-member StackWise stack (Gi1/0/10 and Gi2/0/10 in one cross-stack Po) and both NICs became active.</p><p><b>Lesson:</b> LACP across two switches only works if they present one identity: a stack, StackWise Virtual, VSS or vPC.</p></div>

<div class="iv"><p class="q">"How do you configure a Layer 3 EtherChannel, and how is it different from Layer 2?"</p><p>Strong answer: make the members routed with <code>no switchport</code>, add them with <code>channel-group N mode active</code>, then put the IP address on <code>interface port-channel N</code>. No VLANs, no STP, the summary shows RU. A Layer 2 bundle is a trunk or access Po with S flags and gateways on SVIs. Bonus: mention that multi-chassis options such as StackWise Virtual or vPC let one bundle span two switches.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layer 2 Po: switchport members, trunk or access, STP on the Po, flag (SU).</li>
<li>Layer 3 Po: <code>no switchport</code> on members first, IP only on the Po, flag (RU).</li>
<li>Routers and firewalls can terminate bundles, with IPs or dot1Q subinterfaces on the Po.</li>
<li>A normal bundle ends on one switch; MEC makes two switches look like one LACP partner.</li>
<li>Multi-chassis options: StackWise cross-stack, StackWise Virtual / VSS, and Nexus vPC.</li>
</ul></div>
`,hi:`
<p>Multi-lane highway do kaam kar sakta hai. Woh shehar ke andar ke road grid ka hissa ho sakta hai, jahan har mohalle (VLAN) ki gaadiyan use share karti hain, ya do airports ke beech private expressway ho sakta hai jo sirf ek terminal se doosre tak through-traffic le jaata hai. <b>Layer 2 port-channel</b> city grid hai: VLANs le jaane wala trunk ya access link. <b>Layer 3 port-channel</b> airport expressway hai: IP address wala routed point-to-point link, bilkul bina VLANs ke.</p>

<h3>Layer 2 port-channels</h3>
<p>Ab tak jo kuch aapne configure kiya (static lab mein Po1, LACP lab mein Po10) woh Layer 2 hai. Members <code>switchport</code> interfaces hain, port-channel access port ya 802.1Q trunk hai, STP us par chalta hai, aur switch MAC addresses individual members ki jagah <code>Po10</code> par seekhta hai. <code>show etherchannel summary</code> mein port-channel par flag <b>S</b> (Layer 2) hota hai, aur healthy wala <code>(SU)</code> dikhata hai. Yeh typical access-to-distribution uplink hai.</p>

<h3>Layer 3 (routed) port-channels</h3>
<p>Distribution aur core ke beech kai networks trunks ki jagah routed links use karte hain, taaki STP ki zaroorat na ho aur OSPF jaise routing protocols redundancy handle karein. Bundle bhi routed ho sakta hai. Rule: members <b>join karne se pehle routed ports</b> hone chahiye, taaki port-channel routed interface ke roop mein bane.</p>

<pre class="code">CORE1(config)# interface range te1/1/1 - 2
CORE1(config-if-range)# no switchport
CORE1(config-if-range)# channel-group 20 mode active
CORE1(config-if-range)# exit
CORE1(config)# interface port-channel 20
CORE1(config-if)# ip address 10.0.0.1 255.255.255.252
<span class="c">! te1/1/1 ya te1/1/2 par koi IP address nahi. IP sirf Po20 par rehta hai.</span>

DSW1(config)# interface range te1/1/1 - 2
DSW1(config-if-range)# no switchport
DSW1(config-if-range)# channel-group 20 mode active
DSW1(config-if-range)# exit
DSW1(config)# interface port-channel 20
DSW1(config-if)# ip address 10.0.0.2 255.255.255.252</pre>

<pre class="out">CORE1# show etherchannel summary | begin Group
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
<span class="hl">20     Po20(RU)        LACP      Te1/1/1(P)  Te1/1/2(P)</span>

CORE1# show ip interface brief | include Port-channel
Port-channel20         10.0.0.1        YES manual up                    up</pre>
<p>Ab flag <b>R</b> (Layer 3) aur <b>U</b> (in use) hai, isliye <code>(RU)</code> healthy result hai. OSPF ya static routes <code>Port-channel20</code> ki taraf point karte hain, aur member failure routing table nahi badalta kyunki Po20 up rehta hai. Agar reference bandwidth kaafi high ho to OSPF cost ke liye bundle bandwidth (yahan 20 Gbps) use karta hai.</p>

<table class="cmp"><tr><th></th><th>Layer 2 port-channel</th><th>Layer 3 port-channel</th></tr>
<tr><td>Member ports</td><td><code>switchport</code></td><td>channel-group se pehle <code>no switchport</code></td></tr>
<tr><td>Kya le jaata hai</td><td>Ek VLAN (access) ya kai (trunk)</td><td>Routed IP traffic, koi VLAN nahi</td></tr>
<tr><td>Addressing</td><td>Po par kuch nahi (gateways SVIs hain)</td><td>Po par IP address</td></tr>
<tr><td>STP</td><td>Po par chalta hai</td><td>Involved nahi</td></tr>
<tr><td>Summary flag</td><td><code>(SU)</code></td><td><code>(RU)</code></td></tr></table>

<h3>Routers aur firewalls</h3>
<p>Router bhi bundle terminate kar sakta hai. Cisco IOS XE router par members <code>channel-group 1 mode active</code> join karte hain aur aap ya to <code>Port-channel1</code> par IP address daal sakte ho, ya us par router-on-a-stick subinterfaces bana sakte ho, jaise <code>encapsulation dot1Q 10</code> ke saath <code>interface Port-channel1.10</code>, jo switch ke Layer 2 trunk port-channel ki taraf ho. Firewalls bhi aam taur par LACP ke saath isi tarah judte hain.</p>

<div class="eg"><p><b>Worked example.</b> Aapko Gi1/0/47 aur Gi1/0/48 use karke CORE1 aur DSW1 ke beech 2 Gbps routed link chahiye. Addressing: 192.0.2.0/30, CORE1 .1, DSW1 .2. Har switch par: <code>interface range g1/0/47 - 48</code>, <code>no switchport</code>, <code>channel-group 30 mode active</code>; phir <code>interface port-channel 30</code>, <code>ip address 192.0.2.1 255.255.255.252</code> (DSW1 .2 use karta hai). <code>Po30(RU)</code> verify karo, phir CORE1 se 192.0.2.2 ping karo.</p></div>

<h3>Preview: do switches par phaile bundles</h3>
<p>Ab tak har bundle <b>ek</b> neighbour switch par khatam hota hai. LACP is par zor deta hai, kyunki saare members ko same partner system ID dikhna chahiye. Lekin tab neighbour switch single point of failure hai: woh mara to poora bundle mara. Iska jawab hai <b>multi-chassis EtherChannel</b> (MEC ya MC-LAG): do physical switches <b>ek LACP identity</b> present karte hain, isliye downstream device khushi se dono ki taraf links bundle kar leta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Multi-chassis EtherChannel preview">
<rect x="150" y="20" width="340" height="80" rx="10" fill="none" stroke="#64748b" stroke-dasharray="6 4"/>
<text x="320" y="16" text-anchor="middle" class="svg-muted" font-size="12">ek logical LACP partner</text>
<rect x="175" y="38" width="120" height="46" rx="8" fill="#bae6fd"/><text x="235" y="60" text-anchor="middle" class="svg-ink" font-size="13">Switch A</text><text x="235" y="76" text-anchor="middle" class="svg-muted" font-size="12">stack / VSS / vPC</text>
<rect x="345" y="38" width="120" height="46" rx="8" fill="#bae6fd"/><text x="405" y="60" text-anchor="middle" class="svg-ink" font-size="13">Switch B</text><text x="405" y="76" text-anchor="middle" class="svg-muted" font-size="12">stack / VSS / vPC</text>
<line x1="295" y1="61" x2="345" y2="61" stroke="#64748b" stroke-width="4"/>
<rect x="260" y="180" width="120" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="202" text-anchor="middle" class="svg-ink" font-size="13">ASW / server</text><text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="12">ek Po, LACP</text>
<line x1="235" y1="84" x2="300" y2="180" stroke="#64748b" stroke-width="3"/><line x1="405" y1="84" x2="340" y2="180" stroke="#64748b" stroke-width="3"/>
<ellipse cx="320" cy="150" rx="60" ry="14" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="400" y="150" class="svg-accent" font-size="12">MEC: switch failure jhel leta hai</text>
</svg><p class="cap">Do switches ek LACP partner hone ka natak karte hain, isliye downstream bundle poore switch ke jaane par bhi bacha rehta hai aur STP kuch block nahi karta.</p></div>

<ul>
<li><b>StackWise</b> (Catalyst 9200/9300): stack cables se jude kai switches ek configuration ke saath ek switch ki tarah kaam karte hain. <b>Cross-stack EtherChannel</b> bas alag stack members par members use karta hai, jaise Gi1/0/1 aur Gi2/0/1.</li>
<li><b>StackWise Virtual</b> (Catalyst 9500/9600) aur uska purana roop <b>VSS</b> (Catalyst 4500/6500): do chassis ek control plane wale ek logical switch mein mil jaate hain; unke across bundles MECs hain.</li>
<li><b>vPC</b> (Cisco Nexus): do switches <b>alag</b> control planes aur configurations rakhte hain lekin vPC port-channels ke liye ek LACP system ID share karte hain. Aap ise data-centre track mein detail mein padhoge.</li>
</ul>
<p>CCNA ke liye sirf idea chahiye: downstream device ko ek partner dikhta hai aur woh ordinary LACP bundle chalata hai.</p>

<div class="warn"><p><b>Common galti.</b> Port-channel par <code>no switchport</code> lagana lekin members par nahi, ya members par IP addresses configure karna. Routed bundle ke members par koi IP nahi hota; port-channel par hota hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>(RU)</code> = Layer 3 in use, <code>(SU)</code> = Layer 2 in use. <code>Po1(SD)</code> dikhane wala question Layer 2 aur down hai, "static" nahi. Letter S ka matlab Layer 2 hai, static nahi.</p></div>

<div class="scn"><h4>Server jo sirf aadha bundle kar paaya</h4><p>Ek server team ne naye database server ke do NICs ko do alag, stand-alone Catalyst switches se cable kiya aur LACP bond configure kiya. Sirf ek NIC kabhi active hua. Har switch par <code>show lacp neighbor</code> theek dikh raha tha, lekin server ke bond status ne do alag partner system MACs dikhaye, isliye woh sirf ek partner ki taraf ke ports aggregate kar saka. Team ne dono cables ko do-member StackWise stack par shift kiya (ek cross-stack Po mein Gi1/0/10 aur Gi2/0/10) aur dono NICs active ho gaye.</p><p><b>Seekh:</b> do switches ke across LACP tabhi chalta hai jab woh ek identity present karein: stack, StackWise Virtual, VSS ya vPC.</p></div>

<div class="iv"><p class="q">"Layer 3 EtherChannel kaise configure karte ho, aur yeh Layer 2 se kaise alag hai?"</p><p>Strong answer: members ko <code>no switchport</code> se routed banao, unhe <code>channel-group N mode active</code> se add karo, phir IP address <code>interface port-channel N</code> par daalo. Koi VLAN nahi, koi STP nahi, summary RU dikhata hai. Layer 2 bundle S flags wala trunk ya access Po hai jiske gateways SVIs par hote hain. Bonus: batao ki StackWise Virtual ya vPC jaise multi-chassis options ek bundle ko do switches par phailne dete hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layer 2 Po: switchport members, trunk ya access, Po par STP, flag (SU).</li>
<li>Layer 3 Po: pehle members par <code>no switchport</code>, IP sirf Po par, flag (RU).</li>
<li>Routers aur firewalls bundles terminate kar sakte hain, Po par IPs ya dot1Q subinterfaces ke saath.</li>
<li>Normal bundle ek switch par khatam hota hai; MEC do switches ko ek LACP partner jaisa dikhata hai.</li>
<li>Multi-chassis options: StackWise cross-stack, StackWise Virtual / VSS, aur Nexus vPC.</li>
</ul></div>
`}};export{e as default};