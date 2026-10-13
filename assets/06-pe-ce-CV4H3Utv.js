var e={id:`pe-ce`,h:{en:`PE-CE routing and end-to-end tests`,hi:`PE-CE routing aur end-to-end tests`},body:{en:`
<p>A VPN is only useful when the customer's own routers and computers can use it. The last mile between the PE and the customer edge is where the provider's service meets the customer's network, and it is also where many faults first become visible.</p>

<h3>eBGP between PE and CE</h3>
<p>Our customer uses a different AS at each site: CE1 is AS 65101 and CE2 is AS 65102. The PEs are in AS 65000. The PE side lives in the VRF address family; the CE side is ordinary BGP.</p>
<pre class="code"><span class="c">! CE1</span>
router bgp 65101
 neighbor 192.168.1.1 remote-as 65000
 network 172.16.1.0 mask 255.255.255.0
<span class="c">! PE1</span>
router bgp 65000
 address-family ipv4 vrf CUST_A
  neighbor 192.168.1.2 remote-as 65101
  neighbor 192.168.1.2 activate
 exit-address-family</pre>
<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="AS numbers across the VPN">
<rect x="20" y="40" width="130" height="50" rx="8" fill="#fde68a"/><text x="85" y="70" text-anchor="middle" class="svg-ink" font-size="12">CE1 AS 65101</text>
<rect x="210" y="40" width="220" height="50" rx="8" fill="#bae6fd"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="12">Provider AS 65000</text>
<rect x="490" y="40" width="130" height="50" rx="8" fill="#fde68a"/><text x="555" y="70" text-anchor="middle" class="svg-ink" font-size="12">CE2 AS 65102</text>
<g stroke="#64748b" stroke-width="2"><line x1="150" y1="65" x2="210" y2="65"/><line x1="430" y1="65" x2="490" y2="65"/></g>
<text x="180" y="110" text-anchor="middle" class="svg-accent" font-size="11">eBGP</text><text x="460" y="110" text-anchor="middle" class="svg-accent" font-size="11">eBGP</text>
</svg><p class="cap">Two eBGP edges and one iBGP VPNv4 session inside the provider.</p></div>

<h3>End-to-end test checklist</h3>
<ol>
<li>On PE1: <code>show bgp vpnv4 unicast vrf CUST_A summary</code> must show CE1 as Established with at least one prefix.</li>
<li>On CE1: the route to 172.16.2.0/24 must be learned by BGP, with AS path 65000 65102.</li>
<li>On PC1: ping 172.16.2.10 must succeed, and a traceroute must show the PE hops.</li>
</ol>
<pre class="out">CE1# show ip route bgp
<span class="hl">B  172.16.2.0/24 [20/0] via 192.168.1.1</span>
CE1# show ip bgp 172.16.2.0
  Path: <span class="hl">65000 65102</span>, valid, external, best
PC1> ping 172.16.2.10
84 bytes from 172.16.2.10 icmp_seq=1 ttl=60 time=9 ms</pre>

<h3>Ping tips on a PE</h3>
<p>From the PE, use <code>ping vrf CUST_A 172.16.2.10 source 192.168.1.1</code>. Some simulators return an unreachable code from a VRF ping on a PE even when the VPN works. When in doubt, trust the ping that starts at the customer PC.</p>

<div class="eg"><b>Worked example.</b> CE1 announces 172.16.1.0/24 to PE1. PE1 puts it into the VRF, exports it as VPNv4 with RT 65000:1, and PE2 imports it. PE2 announces it to CE2, with the path 65000 65101. When PC2 pings PC1, the reply goes the same way in reverse.</div>

<div class="warn"><b>Common mistake.</b> Forgetting <code>no shutdown</code> or the address on the CE-facing interface after putting it into the VRF. The session never comes up and the cause hides because the global table looks fine.</div>

<div class="exam"><b>Exam trap.</b> If both CEs used the same AS, eBGP loop prevention would reject the routes (the AS appears in the AS path). Solutions are different ASes per site, or <code>allowas-in</code> on the receiving CE or <code>as-override</code> on the PE.</div>

<div class="scn"><h4>Pings from the PE lie</h4><p>An engineer saw a failed ping from PE1 inside the VRF and started rebuilding VPN routes. A colleague pinged from PC1 and it worked. The failed ping had used the wrong source. They stopped making changes, which saved the afternoon.</p><p><b>Lesson:</b> test from where the customer tests.</p></div>

<div class="iv"><p class="q">"What happens if two sites use the same AS number?"</p><p>The receiving CE rejects the route because it sees its own AS in the path. Use different ASes, as-override on the PE, or allowas-in on the CE.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PE-CE is eBGP inside the VRF address family.</li>
<li>Test from the customer PC, not only from the PE.</li>
<li>CE routes show AS path 65000 plus the remote CE AS.</li>
<li>Same-AS sites need as-override or allowas-in.</li>
</ul></div>
`,hi:`
<p>VPN tabhi kaam ka hai jab customer ke apne routers aur computers use use kar sakein. PE aur customer edge ke beech ka aakhri hissa woh jagah hai jahan provider ki service customer ke network se milti hai, aur wahi jagah hai jahan kai faults pehli baar dikhte hain.</p>

<h3>PE aur CE ke beech eBGP</h3>
<p>Hamara customer har site par alag AS use karta hai: CE1 AS 65101 hai aur CE2 AS 65102. PEs AS 65000 mein hain. PE side VRF address family mein rehti hai; CE side normal BGP hai.</p>
<pre class="code"><span class="c">! CE1</span>
router bgp 65101
 neighbor 192.168.1.1 remote-as 65000
 network 172.16.1.0 mask 255.255.255.0
<span class="c">! PE1</span>
router bgp 65000
 address-family ipv4 vrf CUST_A
  neighbor 192.168.1.2 remote-as 65101
  neighbor 192.168.1.2 activate
 exit-address-family</pre>
<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="AS numbers across the VPN">
<rect x="20" y="40" width="130" height="50" rx="8" fill="#fde68a"/><text x="85" y="70" text-anchor="middle" class="svg-ink" font-size="12">CE1 AS 65101</text>
<rect x="210" y="40" width="220" height="50" rx="8" fill="#bae6fd"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="12">Provider AS 65000</text>
<rect x="490" y="40" width="130" height="50" rx="8" fill="#fde68a"/><text x="555" y="70" text-anchor="middle" class="svg-ink" font-size="12">CE2 AS 65102</text>
<g stroke="#64748b" stroke-width="2"><line x1="150" y1="65" x2="210" y2="65"/><line x1="430" y1="65" x2="490" y2="65"/></g>
<text x="180" y="110" text-anchor="middle" class="svg-accent" font-size="11">eBGP</text><text x="460" y="110" text-anchor="middle" class="svg-accent" font-size="11">eBGP</text>
</svg><p class="cap">Do eBGP edges aur provider ke andar ek iBGP VPNv4 session.</p></div>

<h3>End-to-end test checklist</h3>
<ol>
<li>PE1 par: <code>show bgp vpnv4 unicast vrf CUST_A summary</code> mein CE1 Established aur kam se kam ek prefix ke saath dikhna chahiye.</li>
<li>CE1 par: 172.16.2.0/24 ka route BGP se seekha hona chahiye, AS path 65000 65102 ke saath.</li>
<li>PC1 par: ping 172.16.2.10 succeed hona chahiye, aur traceroute PE hops dikhaye.</li>
</ol>
<pre class="out">CE1# show ip route bgp
<span class="hl">B  172.16.2.0/24 [20/0] via 192.168.1.1</span>
CE1# show ip bgp 172.16.2.0
  Path: <span class="hl">65000 65102</span>, valid, external, best
PC1> ping 172.16.2.10
84 bytes from 172.16.2.10 icmp_seq=1 ttl=60 time=9 ms</pre>

<h3>PE par ping ke tips</h3>
<p>PE se <code>ping vrf CUST_A 172.16.2.10 source 192.168.1.1</code> use karo. Kuch simulators VPN chalte hue bhi PE ke VRF ping par unreachable code lautaate hain. Shak ho to customer PC se shuru hone wale ping par bharosa karo.</p>

<div class="eg"><b>Worked example.</b> CE1 172.16.1.0/24 PE1 ko announce karta hai. PE1 use VRF mein daalta hai, RT 65000:1 ke saath VPNv4 ke roop mein export karta hai, aur PE2 import karta hai. PE2 use path 65000 65101 ke saath CE2 ko announce karta hai. Jab PC2 PC1 ko ping karta hai, reply wahi raaste ulta jaata hai.</div>

<div class="warn"><b>Common mistake.</b> Interface ko VRF mein daalne ke baad CE-facing interface par <code>no shutdown</code> ya address bhool jaana. Session kabhi up nahi hota aur wajah chhupi rehti hai kyunki global table theek lagta hai.</div>

<div class="exam"><b>Exam trap.</b> Agar dono CEs same AS use karte, to eBGP loop prevention routes reject kar deta (AS path mein AS dikhta hai). Solutions: har site par alag AS, ya receiving CE par <code>allowas-in</code>, ya PE par <code>as-override</code>.</div>

<div class="scn"><h4>PE ke ping jhooth bolte hain</h4><p>Ek engineer ne VRF ke andar PE1 se fail hota ping dekha aur VPN routes dobara banane lagi. Ek saathi ne PC1 se ping kiya aur chala. Fail hue ping ne galat source use kiya tha. Unhone change karna band kiya, jisse dopahar bach gayi.</p><p><b>Lesson:</b> wahin se test karo jahan se customer test karta hai.</p></div>

<div class="iv"><p class="q">"Agar do sites same AS number use karein to kya hoga?"</p><p>Receiving CE route reject kar deta hai kyunki woh path mein apna hi AS dekhta hai. Alag AS use karo, PE par as-override, ya CE par allowas-in.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PE-CE VRF address family ke andar eBGP hai.</li>
<li>Sirf PE se nahi, customer PC se test karo.</li>
<li>CE routes mein AS path 65000 plus remote CE AS dikhta hai.</li>
<li>Same-AS sites ko as-override ya allowas-in chahiye.</li>
</ul></div>
`}};export{e as default};