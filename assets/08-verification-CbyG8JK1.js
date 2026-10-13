var e={id:`verification`,h:{en:`Verification: firewall CLI and Prisma Access status pages`,hi:`Verification: firewall CLI aur Prisma Access status pages`},body:{en:`
<p>A doctor checks a patient from two sides: the pulse at the wrist and the report in the file. You do the same with a tunnel. From the branch you read the IKE and IPsec state on the firewall. From the cloud you read the status pages. When both agree, the site is healthy. This chapter lists the commands and pages you will use daily.</p>

<h3>Branch firewall commands</h3>
<table class="cmp"><tr><th>Command</th><th>What it tells you</th></tr>
<tr><td><code>show vpn ike-sa</code></td><td>Phase 1 (IKE SA) state per gateway. Add <code>gateway PA-GW</code> to filter.</td></tr>
<tr><td><code>show vpn ipsec-sa</code></td><td>Phase 2 (IPsec SA) state, SPIs, lifetime.</td></tr>
<tr><td><code>show vpn tunnel</code></td><td>Tunnel list with gateway, interface and state.</td></tr>
<tr><td><code>show vpn gateway</code></td><td>IKE gateway settings.</td></tr>
<tr><td><code>show vpn flow</code></td><td>Per-tunnel packet counters, encap and decap, errors.</td></tr>
<tr><td><code>show running tunnel flow info</code></td><td>Internal flow details for tunnels.</td></tr>
<tr><td><code>test vpn ike-sa gateway PA-GW</code></td><td>Starts phase 1 now.</td></tr>
<tr><td><code>test vpn ipsec-sa tunnel PA-TUN</code></td><td>Starts phase 2 now.</td></tr>
<tr><td><code>clear vpn ike-sa gateway PA-GW</code></td><td>Deletes the IKE SA.</td></tr>
<tr><td><code>clear vpn ipsec-sa tunnel PA-TUN</code></td><td>Deletes the IPsec SA.</td></tr>
<tr><td><code>debug ike global on</code>, <code>debug less mp-log ikemgr.log</code></td><td>Turns on IKE debug and reads the IKE manager log.</td></tr>
<tr><td><code>debug ike pcap on</code> / <code>off</code>, <code>debug ike stat</code></td><td>Captures IKE packets; shows IKE statistics.</td></tr>
</table>
<p>Run <code>debug ike global on</code> only for a short test, then turn it off. Debug adds load.</p>

<h3>Reading healthy output</h3>
<p>The outputs below are trimmed and illustrative. Column wording can differ by PAN-OS release.</p>
<pre class="out">admin@BR-FW&gt; show vpn ike-sa gateway PA-GW

IKEv2 SAs
Gateway ID  Peer-Address    Gateway Name  Role  Algorithm
1           203.0.113.101   PA-GW         Init  PSK/DH14/A256/SHA256
<span class="hl">Established: Oct.04 10:15:01   Expires: Oct.04 18:15:01   State: established</span>

admin@BR-FW&gt; show vpn ipsec-sa tunnel PA-TUN

GwID/client IP  Peer-Address    Tunnel          Proto  Algo
1               203.0.113.101   PA-TUN          ESP    A256GCM16
<span class="hl">Tunnel interface: tunnel.1   Lifetime remain: 3412 sec   State: active</span>

admin@BR-FW&gt; show vpn flow name PA-TUN
tunnel PA-TUN:
  state: active
  <span class="hl">encap packets: 1842    decap packets: 1760</span>
  encap errors: 0  decap errors: 0</pre>
<p>Both counters must rise when you generate traffic. If encap rises and decap stays flat, packets leave but nothing returns. That points to the cloud side, a routing issue or a policy problem.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Verification ladder">
<rect x="10" y="40" width="110" height="70" rx="8" fill="#fde68a"/><text x="65" y="70" text-anchor="middle" class="svg-ink" font-size="12">1 ike-sa</text><text x="65" y="90" text-anchor="middle" class="svg-muted" font-size="11">phase 1 up?</text>
<rect x="140" y="40" width="110" height="70" rx="8" fill="#fde68a"/><text x="195" y="70" text-anchor="middle" class="svg-ink" font-size="12">2 ipsec-sa</text><text x="195" y="90" text-anchor="middle" class="svg-muted" font-size="11">phase 2 up?</text>
<rect x="270" y="40" width="110" height="70" rx="8" fill="#bbf7d0"/><text x="325" y="70" text-anchor="middle" class="svg-ink" font-size="12">3 flow</text><text x="325" y="90" text-anchor="middle" class="svg-muted" font-size="11">encap + decap</text>
<rect x="400" y="40" width="110" height="70" rx="8" fill="#bae6fd"/><text x="455" y="70" text-anchor="middle" class="svg-ink" font-size="12">4 routes</text><text x="455" y="90" text-anchor="middle" class="svg-muted" font-size="11">BGP / static</text>
<rect x="530" y="40" width="100" height="70" rx="8" fill="#ddd6fe"/><text x="580" y="70" text-anchor="middle" class="svg-ink" font-size="12">5 cloud</text><text x="580" y="90" text-anchor="middle" class="svg-muted" font-size="11">status page</text>
</svg><p class="cap">Climb the ladder in order. Stop at the first step that fails.</p></div>

<h3>Prisma Access status pages</h3>
<dl class="terms">
<dt>Panorama: Status</dt><dd>Panorama &gt; Cloud Services &gt; Status &gt; Status shows deployment and Config Status (In sync or Out of sync).</dd>
<dt>Panorama: Monitor</dt><dd>Status &gt; Monitor &gt; Remote Networks has a map and columns: Location, Remote Peer, IPSec Termination Node, ECMP, Config Status, BGP Status (Connect, Established, Warning when no update for more than 8 minutes, Error), Tunnel Status and bandwidth.</dd>
<dt>Panorama: Network Details</dt><dd>Status &gt; Network Details &gt; Remote Networks gives the Service Endpoint Address and Local IP. The BGP Status dialog shows Peer, Local RIB and RIB Out.</dd>
<dt>SCM: Sync Status</dt><dd>Configuration &gt; NGFW and Prisma Access &gt; Prisma Access &gt; Sync Status &gt; Remote Networks.</dd>
<dt>SCM: Branch Sites</dt><dd>Activity Insights: Branch Sites shows tunnel health and bandwidth.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> After the push, the admin sees Tunnel Status "Up" and BGP Status "Established" in Monitor. On BR-FW, <code>show vpn ike-sa</code> shows 203.0.113.101 established and <code>show vpn flow</code> shows rising counters. PC-BR (10.20.0.100) opens a web page. All five rungs of the ladder agree, so the branch is done.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reading the cloud page only; trusting an old SA after a profile change (clear it and renegotiate); leaving debug on; checking the tunnel but never testing from PC-BR.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know which command shows which phase: ike-sa is phase 1, ipsec-sa is phase 2, flow shows counters. BGP Warning means no update for more than 8 minutes. Out of sync means a push is needed.</p></div>

<div class="scn"><h4>Cloud says Up, user says down</h4><p>The Monitor page showed Tunnel Status Up, yet PC-BR had no internet. On BR-FW, show vpn flow had encap rising and decap at zero. The security rule from the tunnel zone back to the LAN zone was missing for return traffic in a stateful policy design that used separate zone rules. Adding the rule fixed it.</p><p><b>Lesson:</b> a tunnel can be up while policy or routing still blocks traffic. Test end to end.</p></div>

<div class="iv"><p class="q">"How do you verify a branch tunnel to Prisma Access?"</p><p>On the firewall I check show vpn ike-sa, then ipsec-sa, then flow counters. Then I check Panorama Monitor or SCM Branch Sites for tunnel and BGP status, confirm Config Status is In sync, and finally test from a host. If needed, I use test vpn, clear vpn and debug ike.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ike-sa is phase 1, ipsec-sa is phase 2, flow gives packet counters.</li>
<li>test vpn starts negotiation; clear vpn resets it; debug ike explains failures.</li>
<li>Panorama: Status, Monitor, Network Details. SCM: Sync Status, Branch Sites.</li>
<li>BGP Warning means no update for more than 8 minutes.</li>
<li>Always finish with an end-to-end test from a host.</li>
</ul></div>
`,hi:`
<p>Doctor mareez ko do taraf se check karta hai: wrist par pulse aur file mein report. Tunnel ke saath bhi aap yahi karte ho. Branch se firewall par IKE aur IPsec state padhte ho. Cloud se status pages padhte ho. Dono agree karein to site healthy hai. Yeh chapter woh commands aur pages batata hai jo aap roz use karoge.</p>

<h3>Branch firewall commands</h3>
<table class="cmp"><tr><th>Command</th><th>Kya batata hai</th></tr>
<tr><td><code>show vpn ike-sa</code></td><td>Har gateway ka phase 1 (IKE SA) state. Filter ke liye <code>gateway PA-GW</code> jodo.</td></tr>
<tr><td><code>show vpn ipsec-sa</code></td><td>Phase 2 (IPsec SA) state, SPIs, lifetime.</td></tr>
<tr><td><code>show vpn tunnel</code></td><td>Gateway, interface aur state ke saath tunnel list.</td></tr>
<tr><td><code>show vpn gateway</code></td><td>IKE gateway settings.</td></tr>
<tr><td><code>show vpn flow</code></td><td>Per-tunnel packet counters, encap aur decap, errors.</td></tr>
<tr><td><code>show running tunnel flow info</code></td><td>Tunnels ki internal flow details.</td></tr>
<tr><td><code>test vpn ike-sa gateway PA-GW</code></td><td>Phase 1 abhi start karta hai.</td></tr>
<tr><td><code>test vpn ipsec-sa tunnel PA-TUN</code></td><td>Phase 2 abhi start karta hai.</td></tr>
<tr><td><code>clear vpn ike-sa gateway PA-GW</code></td><td>IKE SA delete karta hai.</td></tr>
<tr><td><code>clear vpn ipsec-sa tunnel PA-TUN</code></td><td>IPsec SA delete karta hai.</td></tr>
<tr><td><code>debug ike global on</code>, <code>debug less mp-log ikemgr.log</code></td><td>IKE debug on karta hai aur IKE manager log padhta hai.</td></tr>
<tr><td><code>debug ike pcap on</code> / <code>off</code>, <code>debug ike stat</code></td><td>IKE packets capture karta hai; IKE statistics dikhata hai.</td></tr>
</table>
<p><code>debug ike global on</code> sirf chhote test ke liye chalao, phir off karo. Debug load badhata hai.</p>

<h3>Healthy output padhna</h3>
<p>Neeche ke outputs trimmed aur illustrative hain. Column wording PAN-OS release ke hisaab se alag ho sakti hai.</p>
<pre class="out">admin@BR-FW&gt; show vpn ike-sa gateway PA-GW

IKEv2 SAs
Gateway ID  Peer-Address    Gateway Name  Role  Algorithm
1           203.0.113.101   PA-GW         Init  PSK/DH14/A256/SHA256
<span class="hl">Established: Oct.04 10:15:01   Expires: Oct.04 18:15:01   State: established</span>

admin@BR-FW&gt; show vpn ipsec-sa tunnel PA-TUN

GwID/client IP  Peer-Address    Tunnel          Proto  Algo
1               203.0.113.101   PA-TUN          ESP    A256GCM16
<span class="hl">Tunnel interface: tunnel.1   Lifetime remain: 3412 sec   State: active</span>

admin@BR-FW&gt; show vpn flow name PA-TUN
tunnel PA-TUN:
  state: active
  <span class="hl">encap packets: 1842    decap packets: 1760</span>
  encap errors: 0  decap errors: 0</pre>
<p>Traffic generate karne par dono counters badhne chahiye. Encap badhe aur decap flat rahe to packets nikalte hain par kuch wapas nahi aata. Yeh cloud side, routing issue ya policy problem ki taraf ishara hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Verification ladder">
<rect x="10" y="40" width="110" height="70" rx="8" fill="#fde68a"/><text x="65" y="70" text-anchor="middle" class="svg-ink" font-size="12">1 ike-sa</text><text x="65" y="90" text-anchor="middle" class="svg-muted" font-size="11">phase 1 up?</text>
<rect x="140" y="40" width="110" height="70" rx="8" fill="#fde68a"/><text x="195" y="70" text-anchor="middle" class="svg-ink" font-size="12">2 ipsec-sa</text><text x="195" y="90" text-anchor="middle" class="svg-muted" font-size="11">phase 2 up?</text>
<rect x="270" y="40" width="110" height="70" rx="8" fill="#bbf7d0"/><text x="325" y="70" text-anchor="middle" class="svg-ink" font-size="12">3 flow</text><text x="325" y="90" text-anchor="middle" class="svg-muted" font-size="11">encap + decap</text>
<rect x="400" y="40" width="110" height="70" rx="8" fill="#bae6fd"/><text x="455" y="70" text-anchor="middle" class="svg-ink" font-size="12">4 routes</text><text x="455" y="90" text-anchor="middle" class="svg-muted" font-size="11">BGP / static</text>
<rect x="530" y="40" width="100" height="70" rx="8" fill="#ddd6fe"/><text x="580" y="70" text-anchor="middle" class="svg-ink" font-size="12">5 cloud</text><text x="580" y="90" text-anchor="middle" class="svg-muted" font-size="11">status page</text>
</svg><p class="cap">Seedhi order mein chadho. Pehle fail hone wale step par ruk jao.</p></div>

<h3>Prisma Access status pages</h3>
<dl class="terms">
<dt>Panorama: Status</dt><dd>Panorama &gt; Cloud Services &gt; Status &gt; Status deployment aur Config Status (In sync ya Out of sync) dikhata hai.</dd>
<dt>Panorama: Monitor</dt><dd>Status &gt; Monitor &gt; Remote Networks mein map aur columns hain: Location, Remote Peer, IPSec Termination Node, ECMP, Config Status, BGP Status (Connect, Established, 8 minutes se zyada update na aaye to Warning, Error), Tunnel Status aur bandwidth.</dd>
<dt>Panorama: Network Details</dt><dd>Status &gt; Network Details &gt; Remote Networks Service Endpoint Address aur Local IP deta hai. BGP Status dialog Peer, Local RIB aur RIB Out dikhata hai.</dd>
<dt>SCM: Sync Status</dt><dd>Configuration &gt; NGFW and Prisma Access &gt; Prisma Access &gt; Sync Status &gt; Remote Networks.</dd>
<dt>SCM: Branch Sites</dt><dd>Activity Insights: Branch Sites tunnel health aur bandwidth dikhata hai.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> Push ke baad admin Monitor mein Tunnel Status "Up" aur BGP Status "Established" dekhta hai. BR-FW par <code>show vpn ike-sa</code> 203.0.113.101 established dikhata hai aur <code>show vpn flow</code> badhte counters. PC-BR (10.20.0.100) web page kholta hai. Ladder ke paanchon rungs agree karte hain, to branch ho gaya.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sirf cloud page padhna; profile change ke baad purane SA par bharosa (clear karke renegotiate karo); debug on chhod dena; tunnel check karna par PC-BR se test kabhi nahi karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Kaun sa command kaun sa phase dikhata hai yaad rakho: ike-sa phase 1, ipsec-sa phase 2, flow counters. BGP Warning matlab 8 minutes se zyada update nahi. Out of sync matlab push chahiye.</p></div>

<div class="scn"><h4>Cloud Up kehta hai, user down kehta hai</h4><p>Monitor page par Tunnel Status Up tha, phir bhi PC-BR par internet nahi tha. BR-FW par show vpn flow mein encap badh raha tha aur decap zero tha. Separate zone rules wale design mein tunnel zone se LAN zone ke return traffic ka security rule missing tha. Rule add karne se theek hua.</p><p><b>Lesson:</b> tunnel up ho sakta hai jabki policy ya routing traffic rok rahi ho. End to end test karo.</p></div>

<div class="iv"><p class="q">"Prisma Access ke branch tunnel ko verify kaise karte ho?"</p><p>Firewall par show vpn ike-sa, phir ipsec-sa, phir flow counters check karta hoon. Phir Panorama Monitor ya SCM Branch Sites mein tunnel aur BGP status dekhta hoon, Config Status In sync confirm karta hoon, aur end mein host se test karta hoon. Zaroorat ho to test vpn, clear vpn aur debug ike use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ike-sa phase 1, ipsec-sa phase 2, flow packet counters deta hai.</li>
<li>test vpn negotiation start karta hai; clear vpn reset karta hai; debug ike failure samjhata hai.</li>
<li>Panorama: Status, Monitor, Network Details. SCM: Sync Status, Branch Sites.</li>
<li>BGP Warning matlab 8 minutes se zyada update nahi.</li>
<li>Hamesha host se end-to-end test se khatam karo.</li>
</ul></div>
`}};export{e as default};