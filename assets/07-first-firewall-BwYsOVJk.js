var e={id:`first-firewall`,h:{en:`Your first firewall: interface, zone, router and route`,hi:`Aapka pehla firewall: interface, zone, router aur route`},body:{en:`
<p><b>Analogy: opening a shop.</b> A shop needs a street address (IP address), a licence to trade in a district (zone), a postal service (virtual router), and a signboard that directs customers (route). Miss one and the shop exists but has no business. A PAN-OS Layer 3 interface works the same way.</p>

<h3>The four things every routed interface needs</h3>
<ol>
<li><b>An IP address</b> on the interface (<code>layer3 ip</code>).</li>
<li><b>Membership in a virtual router</b>, the routing table that the interface belongs to.</li>
<li><b>Membership in a zone</b>, so policy can refer to it.</li>
<li><b>A route</b> to anywhere that is not directly connected, usually a default route to the ISP.</li>
</ol>
<p>Then, optionally, an <b>interface management profile</b> if the firewall itself should answer ping, SSH or HTTPS on that interface. The full treatment is the <b>pan-setup</b> module and its labs. Here is the shape of it, using the lab topology: PC1 in the Pune LAN (10.0.1.0/24) on ethernet1/2, an ISP on ethernet1/1 (203.0.113.0/30), and the firewall at 10.0.1.1 and 203.0.113.2.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="First firewall topology">
<rect x="10" y="50" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="55" y="72" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="55" y="90" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.10</text>
<rect x="200" y="40" width="150" height="70" rx="10" fill="#ddd6fe"/><text x="275" y="68" text-anchor="middle" class="svg-ink" font-size="14">Firewall</text><text x="275" y="90" text-anchor="middle" class="svg-muted" font-size="12">virtual router default</text>
<rect x="450" y="50" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="495" y="72" text-anchor="middle" class="svg-ink" font-size="13">ISP</text><text x="495" y="90" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.1</text>
<line x1="100" y1="75" x2="200" y2="75" stroke="#64748b" stroke-width="2"/><text x="150" y="65" text-anchor="middle" class="svg-accent" font-size="12">1/2 trust</text><text x="150" y="95" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.1/24</text>
<line x1="350" y1="75" x2="450" y2="75" stroke="#64748b" stroke-width="2"/><text x="400" y="65" text-anchor="middle" class="svg-accent" font-size="12">1/1 untrust</text><text x="400" y="95" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.2/30</text>
</svg><p class="cap">Two interfaces, two zones, one virtual router, one default route.</p></div>

<h3>Configuration (reference build, as in the pan-setup lab)</h3>
<pre class="code"><span class="c"># interface IPs</span>
set network interface ethernet ethernet1/2 layer3 ip 10.0.1.1/24
set network interface ethernet ethernet1/1 layer3 ip 203.0.113.2/30
<span class="c"># management profiles: what the firewall itself answers</span>
set network profiles interface-management-profile allow-ping ping yes
set network profiles interface-management-profile mgmt-lan ping yes h&#116;tps yes ssh yes
set network interface ethernet ethernet1/2 layer3 interface-management-profile mgmt-lan
set network interface ethernet ethernet1/1 layer3 interface-management-profile allow-ping
<span class="c"># router membership and zones</span>
set network virtual-router default interface [ ethernet1/1 ethernet1/2 ]
set zone trust network layer3 ethernet1/2
set zone untrust network layer3 ethernet1/1
<span class="c"># default route to the ISP</span>
set network virtual-router default routing-table ip static-route default destination 0.0.0.0/0 nexthop ip-address 203.0.113.1 interface ethernet1/1
commit</pre>

<h3>Watch the symptoms change as you add each piece</h3>
<p>This is one of the best ways to learn. PC1 pings the firewall's LAN address at each stage. Captured from the simulator:</p>
<pre class="out"><span class="c">Stage 0: factory default, no IP on ethernet1/2</span>
PC1&gt; ping 10.0.1.1
<span class="hl">host (10.0.1.1) not reachable</span>

<span class="c">Stage 1: IP, virtual router and zone configured and committed, but no management profile</span>
PC1&gt; ping 10.0.1.1
<span class="hl">10.0.1.1 icmp_seq=1 timeout</span>

<span class="c">Stage 2: profile mgmt-lan (ping yes) attached to ethernet1/2</span>
PC1&gt; ping 10.0.1.1
<span class="hl">84 bytes from 10.0.1.1 icmp_seq=1 ttl=64 time=0.500 ms</span></pre>
<p>"Not reachable" means PC1 could not even resolve the gateway (nothing owns 10.0.1.1 yet). "Timeout" means the packet reached the firewall and was ignored: the interface exists but the firewall's own services are not allowed there. Replies appear only after the profile. Different symptoms point to different missing pieces.</p>
<p>Verify the final logical interface table:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show interface all
name                id    vsys zone             forwarding               tag    address
------------------- ----- ---- ---------------- ------------------------ ------ ------------------
ethernet1/2         16    1    trust            vr:default               0      10.0.1.1/24
ethernet1/1         17    1    untrust          vr:default               0      203.0.113.2/30</pre>
<p>Each row shows the zone and the virtual router (<code>vr:default</code>). The same IP table with both columns filled is your "interface is complete" check.</p>

<div class="eg"><p><b>Worked example.</b> PC1 can reach 10.0.1.1 but not 8.8.8.8. The interface table is fine. The next suspect is the route and then the policy and NAT. You move from "can the firewall be reached" to "can traffic pass through": two different questions with different tools. The next chapter walks through them.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Adding the IP and zone but forgetting the virtual router. Adding the interface to the virtual router but forgetting the zone. Allowing HTTPS management on the untrust interface. Using a netmask in the wrong notation: PAN-OS takes CIDR, for example 10.0.1.1/24.</p></div>
<div class="exam"><p><b>Exam trap.</b> A route to the Internet is configured in the <b>virtual router</b>, and an interface that is in no virtual router cannot route at all. A security zone is not the same thing as a virtual router.</p></div>

<div class="scn"><h4>The DMZ server that could not ping its own gateway</h4><p>After a change, the DMZ web server 10.0.2.10 could not even ping its gateway 10.0.2.1, although the admin insisted "the IP is configured and committed". The interface table showed zone N/A and forwarding N/A on ethernet1/3: no zone, no virtual router, no management profile. One more commit with those three items fixed it. This is the second pan-setup lab.</p><p><b>Lesson:</b> an IP address alone does not make an interface work.</p></div>

<div class="iv"><p class="q">"You configured an IP on a new interface and cannot ping it. What do you check?"</p><p>That the interface is up, that it is in a virtual router and a zone (show interface all), and that an interface management profile with ping is attached, because a data interface does not answer ping by default. Then confirm the commit actually succeeded.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A routed interface needs IP, virtual router, zone and a route to be useful.</li>
<li>Management profiles decide what the firewall itself answers on that interface.</li>
<li>show interface all shows zone and virtual router side by side; N/A means missing.</li>
<li>"Not reachable" and "timeout" point to different missing pieces.</li>
<li>Build in order and verify after each commit.</li>
</ul></div>
`,hi:`
<p><b>Analogy: dukaan kholna.</b> Dukaan ko street address (IP address), ilaake mein vyapar ka licence (zone), dak seva (virtual router) aur customers ko raasta dikhane wala signboard (route) chahiye. Ek bhi chhoot gaya to dukaan hai lekin dhandha nahi. PAN-OS Layer 3 interface bhi aise hi chalta hai.</p>

<h3>Har routed interface ko chaar cheezein chahiye</h3>
<ol>
<li>Interface par <b>IP address</b> (<code>layer3 ip</code>).</li>
<li><b>Virtual router ki membership</b>, woh routing table jisse interface judta hai.</li>
<li><b>Zone ki membership</b>, taaki policy use refer kar sake.</li>
<li><b>Route</b> har us jagah ke liye jo directly connected nahi hai, aam taur par ISP ki taraf default route.</li>
</ol>
<p>Phir optionally ek <b>interface management profile</b> agar firewall khud us interface par ping, SSH ya HTTPS ka jawab de. Poora treatment <b>pan-setup</b> module aur uske labs mein hai. Lab topology ke saath iska shape yeh hai: Pune LAN mein PC1 (10.0.1.0/24) ethernet1/2 par, ISP ethernet1/1 (203.0.113.0/30) par, aur firewall 10.0.1.1 aur 203.0.113.2 par.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Pehle firewall ki topology">
<rect x="10" y="50" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="55" y="72" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="55" y="90" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.10</text>
<rect x="200" y="40" width="150" height="70" rx="10" fill="#ddd6fe"/><text x="275" y="68" text-anchor="middle" class="svg-ink" font-size="14">Firewall</text><text x="275" y="90" text-anchor="middle" class="svg-muted" font-size="12">virtual router default</text>
<rect x="450" y="50" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="495" y="72" text-anchor="middle" class="svg-ink" font-size="13">ISP</text><text x="495" y="90" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.1</text>
<line x1="100" y1="75" x2="200" y2="75" stroke="#64748b" stroke-width="2"/><text x="150" y="65" text-anchor="middle" class="svg-accent" font-size="12">1/2 trust</text><text x="150" y="95" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.1/24</text>
<line x1="350" y1="75" x2="450" y2="75" stroke="#64748b" stroke-width="2"/><text x="400" y="65" text-anchor="middle" class="svg-accent" font-size="12">1/1 untrust</text><text x="400" y="95" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.2/30</text>
</svg><p class="cap">Do interfaces, do zones, ek virtual router, ek default route.</p></div>

<h3>Configuration (reference build, jaise pan-setup lab mein)</h3>
<pre class="code"><span class="c"># interface IPs</span>
set network interface ethernet ethernet1/2 layer3 ip 10.0.1.1/24
set network interface ethernet ethernet1/1 layer3 ip 203.0.113.2/30
<span class="c"># management profiles: firewall khud kya jawab deta hai</span>
set network profiles interface-management-profile allow-ping ping yes
set network profiles interface-management-profile mgmt-lan ping yes h&#116;tps yes ssh yes
set network interface ethernet ethernet1/2 layer3 interface-management-profile mgmt-lan
set network interface ethernet ethernet1/1 layer3 interface-management-profile allow-ping
<span class="c"># router membership aur zones</span>
set network virtual-router default interface [ ethernet1/1 ethernet1/2 ]
set zone trust network layer3 ethernet1/2
set zone untrust network layer3 ethernet1/1
<span class="c"># ISP ki taraf default route</span>
set network virtual-router default routing-table ip static-route default destination 0.0.0.0/0 nexthop ip-address 203.0.113.1 interface ethernet1/1
commit</pre>

<h3>Har piece jodne par symptoms badalte dekho</h3>
<p>Seekhne ka yeh sabse achha tareeka hai. Har stage par PC1 firewall ke LAN address ko ping karta hai. Simulator se capture kiya:</p>
<pre class="out"><span class="c">Stage 0: factory default, ethernet1/2 par IP nahi</span>
PC1&gt; ping 10.0.1.1
<span class="hl">host (10.0.1.1) not reachable</span>

<span class="c">Stage 1: IP, virtual router aur zone configured aur committed, lekin management profile nahi</span>
PC1&gt; ping 10.0.1.1
<span class="hl">10.0.1.1 icmp_seq=1 timeout</span>

<span class="c">Stage 2: profile mgmt-lan (ping yes) ethernet1/2 se attached</span>
PC1&gt; ping 10.0.1.1
<span class="hl">84 bytes from 10.0.1.1 icmp_seq=1 ttl=64 time=0.500 ms</span></pre>
<p>"Not reachable" ka matlab PC1 gateway ko resolve hi nahi kar paya (10.0.1.1 ka abhi koi malik nahi). "Timeout" ka matlab packet firewall tak pahunch kar ignore hua: interface exist karta hai lekin firewall ki apni services wahan allowed nahi. Replies profile ke baad hi aate hain. Alag symptoms alag missing pieces ki taraf ishara karte hain.</p>
<p>Final logical interface table verify karo:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show interface all
name                id    vsys zone             forwarding               tag    address
------------------- ----- ---- ---------------- ------------------------ ------ ------------------
ethernet1/2         16    1    trust            vr:default               0      10.0.1.1/24
ethernet1/1         17    1    untrust          vr:default               0      203.0.113.2/30</pre>
<p>Har row zone aur virtual router (<code>vr:default</code>) dikhati hai. Dono columns bhare hon to "interface complete hai" ka check poora.</p>

<div class="eg"><p><b>Worked example.</b> PC1 10.0.1.1 tak pahunchta hai lekin 8.8.8.8 tak nahi. Interface table theek hai. Agla suspect route hai, phir policy aur NAT. Aap "firewall tak pahunch sakte hain kya" se "traffic through ja sakta hai kya" par aate ho: do alag sawal, alag tools. Agla chapter inhe chalata hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> IP aur zone jodna lekin virtual router bhool jaana. Interface ko virtual router mein jodna lekin zone bhool jaana. Untrust interface par HTTPS management allow karna. Netmask galat notation mein dena: PAN-OS CIDR leta hai, jaise 10.0.1.1/24.</p></div>
<div class="exam"><p><b>Exam trap.</b> Internet ka route <b>virtual router</b> mein configure hota hai, aur jo interface kisi virtual router mein nahi woh route hi nahi kar sakta. Security zone aur virtual router ek cheez nahi hain.</p></div>

<div class="scn"><h4>DMZ server jo apne gateway ko ping nahi kar paya</h4><p>Ek change ke baad DMZ web server 10.0.2.10 apne gateway 10.0.2.1 ko bhi ping nahi kar pa raha tha, jabki admin ka kehna tha "IP configured aur committed hai". Interface table ne ethernet1/3 par zone N/A aur forwarding N/A dikhaya: na zone, na virtual router, na management profile. Un teen cheezon ke saath ek aur commit ne fix kar diya. Yeh doosra pan-setup lab hai.</p><p><b>Lesson:</b> sirf IP address interface ko kaam karne layak nahi banata.</p></div>

<div class="iv"><p class="q">"Naye interface par IP configure kiya aur ping nahi ho raha. Aap kya check karoge?"</p><p>Ki interface up hai, ki woh virtual router aur zone mein hai (show interface all), aur ki ping wala interface management profile attached hai, kyunki data interface by default ping ka jawab nahi deta. Phir confirm karo ki commit sach mein succeed hua.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routed interface ko kaam ke liye IP, virtual router, zone aur route chahiye.</li>
<li>Management profiles tay karte hain ki firewall us interface par khud kya jawab deta hai.</li>
<li>show interface all zone aur virtual router saath dikhata hai; N/A matlab missing.</li>
<li>"Not reachable" aur "timeout" alag missing pieces dikhate hain.</li>
<li>Order mein build karo aur har commit ke baad verify karo.</li>
</ul></div>
`}};export{e as default};