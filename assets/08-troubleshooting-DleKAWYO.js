var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: from underlay to overlay`,hi:`Troubleshooting workflow: underlay se overlay tak`},body:{en:`
<p>A doctor does not start with surgery. She checks the pulse, then the temperature, then asks questions. Troubleshooting an SD-WAN edge needs the same discipline: always work in a fixed order, from the bottom to the top, and do not move up until the layer below is healthy. Most "SD-WAN problems" turn out to be a missing route, a blocked port or a wrong list entry.</p>

<h3>The six-step order</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Troubleshooting order">
<rect x="10" y="10" width="190" height="50" rx="8" fill="#e2e8f0"/><text x="105" y="32" text-anchor="middle" class="svg-ink" font-size="13">1. Underlay</text><text x="105" y="50" text-anchor="middle" class="svg-muted" font-size="12">IP, route, ping VBOND</text>
<rect x="225" y="10" width="190" height="50" rx="8" fill="#bae6fd"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">2. Control connections</text><text x="320" y="50" text-anchor="middle" class="svg-muted" font-size="12">state, history, error code</text>
<rect x="440" y="10" width="190" height="50" rx="8" fill="#ddd6fe"/><text x="535" y="32" text-anchor="middle" class="svg-ink" font-size="13">3. Identity and lists</text><text x="535" y="50" text-anchor="middle" class="svg-muted" font-size="12">cert, org, serial, valid</text>
<rect x="10" y="100" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="105" y="122" text-anchor="middle" class="svg-ink" font-size="13">4. OMP</text><text x="105" y="140" text-anchor="middle" class="svg-muted" font-size="12">peer up, routes, TLOCs</text>
<rect x="225" y="100" width="190" height="50" rx="8" fill="#fde68a"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="13">5. Data plane</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">BFD sessions, colors, NAT</text>
<rect x="440" y="100" width="190" height="50" rx="8" fill="#fed7aa"/><text x="535" y="122" text-anchor="middle" class="svg-ink" font-size="13">6. Service side</text><text x="535" y="140" text-anchor="middle" class="svg-muted" font-size="12">VRF, LAN route, ping</text>
<rect x="10" y="180" width="620" height="60" rx="8" fill="#f1f5f9"/><text x="25" y="205" class="svg-ink" font-size="13">Rule: fix the lowest broken layer first. A good step 5 means nothing if step 2 is down.</text><text x="25" y="225" class="svg-muted" font-size="12">Each step has one main command (next table).</text>
</svg><p class="cap">Six checks in a fixed order. Stop at the first one that fails.</p></div>
<table class="cmp"><tr><th>Step</th><th>Question</th><th>Command</th></tr>
<tr><td>1</td><td>Can the edge reach the Validator?</td><td><code>show ip interface brief</code>, <code>show ip route</code>, <code>ping 198.51.100.30</code></td></tr>
<tr><td>2</td><td>Are control connections up? If not, why?</td><td><code>show sdwan control connections</code>, <code>show sdwan control connection-history</code></td></tr>
<tr><td>3</td><td>Do identity and lists match?</td><td><code>show sdwan control local-properties</code>, <code>show clock</code>, the WAN Edge List in the Manager</td></tr>
<tr><td>4</td><td>Is OMP up and are routes exchanged?</td><td><code>show sdwan omp summary</code>, <code>show sdwan omp routes</code>, <code>show sdwan omp tlocs</code></td></tr>
<tr><td>5</td><td>Are tunnels up?</td><td><code>show sdwan bfd sessions</code>, <code>show sdwan bfd summary</code></td></tr>
<tr><td>6</td><td>Does the LAN work?</td><td><code>show ip route vrf 10</code>, <code>ping vrf 10 10.3.10.10</code>, <code>traceroute vrf 10 10.3.10.10</code></td></tr></table>

<h3>Reading the control connection history</h3>
<p>When a connection is not up, <code>show sdwan control connection-history</code> records the reason. The <b>LOCAL ERROR</b> column holds a short code. Here are the ones you will meet most; read the exact wording for your release in the documentation:</p>
<pre class="out">E-MUM-1# show sdwan control connection-history
PEER    PEER ... LOCAL COLOR   STATE     LOCAL ERROR  REMOTE ERROR REPEAT
TYPE    PROT
vbond   dtls ... biz-internet  connect   <span class="hl">DCONFAIL</span>     NOERR        6
vbond   dtls ... biz-internet  tear_down <span class="hl">CRTREJSER</span>    NOERR        2</pre>
<table class="cmp"><tr><th>Code</th><th>Typical meaning</th><th>First thing to check</th></tr>
<tr><td>DCONFAIL</td><td>DTLS connection could not be formed</td><td>Underlay: route, firewall, UDP 12346, NAT</td></tr>
<tr><td>CRTREJSER</td><td>Peer rejected the certificate or serial number</td><td>WAN Edge List state, Send to Controllers</td></tr>
<tr><td>SERNTPRES</td><td>Serial or chassis number not present in the peer's authorized list</td><td>Add or sync the device, then send the list</td></tr>
<tr><td>CTORGNMMIS</td><td>Organization name does not match</td><td>Compare <code>organization-name</code> on edge and Controllers</td></tr>
<tr><td>CRTVERFL</td><td>Certificate verification failed</td><td>Root certificate chain, certificate dates, clock</td></tr></table>

<h3>Three tickets, walked through</h3>
<p><b>Ticket 1: "E-MUM-1 cannot reach any Controller."</b> Step 1: <code>ping 198.51.100.30</code> fails. The route table shows a default via 203.0.113.1, the wrong gateway. Fix the route to 203.0.113.9. Control connections come up. Lesson: do not skip the underlay.</p>
<p><b>Ticket 2: "E-BLR-1 reaches the Validator but never joins."</b> Ping works, history shows <code>CRTREJSER</code>. In the Manager, the WAN Edge List has the device in <b>Invalid</b>. Set it to Valid and use Send to Controllers. Lesson: the certificate was fine; the authorization was not.</p>
<p><b>Ticket 3: "Delhi and Mumbai only talk over the internet; MPLS is dead."</b> Control connections are up, OMP is up, but BFD shows only the biz-internet sessions. <code>show sdwan omp tlocs</code> reveals that E-MUM-1 uses color <code>private1</code>, and E-DEL-1 has <code>mpls restrict</code>. Correct the color on Mumbai. Lesson: with restrict, colors must match.</p>
<p>A fourth classic: the edge shows <code>up</code> everywhere, but a host cannot ping across. Look at step 6. The LAN interface may be in the global table instead of VRF 10, or the LAN prefix is not advertised.</p>

<h3>Useful tricks</h3>
<ul>
<li><b>Count first.</b> Predict how many BFD sessions you expect (TLOC pairs with the same color or non-restricted) and compare with <code>show sdwan bfd summary</code>.</li>
<li><b>Compare both ends.</b> A tunnel needs both sides. Run the same <code>show</code> command on the peer.</li>
<li><b>Check the clock.</b> <code>show clock</code> and certificate validity. A badly wrong date is a classic cause of CRTVERFL.</li>
<li><b>Check the Manager's own view.</b> The device's page shows control status and the reason, and a ping or traceroute can be run from the GUI under the device's troubleshooting tools.</li>
<li><b>Change one thing at a time</b> and re-read the output.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Jumping to policy or templates before the control connections are up; restarting the router instead of reading the error code; changing two things at once; and forgetting the clock.</p></div>
<div class="exam"><p><b>Exam trap.</b> You usually get a symptom plus one command output and must name the layer. "No Controller connection" is steps 1 to 3. "OMP routes present but tunnel down" is step 5. "Routes missing on the LAN" is step 4 or 6.</p></div>

<div class="scn"><h4>The 3 a.m. call about Hyderabad</h4><p>E-HYD-1 showed "no control connection" after a power cut. The on-call engineer ran the six steps. The underlay ping worked, but <code>show sdwan control connection-history</code> said <code>CRTVERFL</code>. <code>show clock</code> read January 2000, because the battery-backed clock had been reset and NTP was blocked. He set the clock manually, the DTLS handshake succeeded, and NTP was permitted on the firewall the next morning.</p><p><b>Lesson:</b> read the error code, and always check the clock.</p></div>

<div class="iv"><p class="q">"A WAN edge will not come up. Walk me through your checks."</p><p>Strong answer: underlay first (interface, default route, ping the Validator), then control connection state and the history error code, then identity (organization name, WAN edge list state, certificate, clock). Only after the control plane is up do I look at OMP, BFD sessions and finally the service VRF. Mention DCONFAIL, CRTREJSER, CTORGNMMIS and the Send to Controllers step.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work bottom-up: underlay, control connections, identity, OMP, BFD, service side.</li>
<li>The connection history error code tells you why the control connection failed.</li>
<li>Most failures are routes, firewall ports, list state, organization name or clock.</li>
<li>Count expected BFD sessions and compare with the real number.</li>
<li>Change one thing at a time and verify after each change.</li>
</ul></div>
`,hi:`
<p>Doctor operation se shuru nahi karta. Woh pehle pulse dekhta hai, phir temperature, phir sawal poochta hai. SD-WAN edge ke troubleshooting mein bhi yahi discipline chahiye: hamesha fixed order mein kaam karo, neeche se upar, aur jab tak neeche wali layer healthy na ho upar mat jao. Zyada tar "SD-WAN problems" asal mein missing route, blocked port ya galat list entry nikalti hain.</p>

<h3>Chhe-step ka order</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Troubleshooting order">
<rect x="10" y="10" width="190" height="50" rx="8" fill="#e2e8f0"/><text x="105" y="32" text-anchor="middle" class="svg-ink" font-size="13">1. Underlay</text><text x="105" y="50" text-anchor="middle" class="svg-muted" font-size="12">IP, route, ping VBOND</text>
<rect x="225" y="10" width="190" height="50" rx="8" fill="#bae6fd"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">2. Control connections</text><text x="320" y="50" text-anchor="middle" class="svg-muted" font-size="12">state, history, error code</text>
<rect x="440" y="10" width="190" height="50" rx="8" fill="#ddd6fe"/><text x="535" y="32" text-anchor="middle" class="svg-ink" font-size="13">3. Identity aur lists</text><text x="535" y="50" text-anchor="middle" class="svg-muted" font-size="12">cert, org, serial, valid</text>
<rect x="10" y="100" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="105" y="122" text-anchor="middle" class="svg-ink" font-size="13">4. OMP</text><text x="105" y="140" text-anchor="middle" class="svg-muted" font-size="12">peer up, routes, TLOCs</text>
<rect x="225" y="100" width="190" height="50" rx="8" fill="#fde68a"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="13">5. Data plane</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">BFD sessions, colors, NAT</text>
<rect x="440" y="100" width="190" height="50" rx="8" fill="#fed7aa"/><text x="535" y="122" text-anchor="middle" class="svg-ink" font-size="13">6. Service side</text><text x="535" y="140" text-anchor="middle" class="svg-muted" font-size="12">VRF, LAN route, ping</text>
<rect x="10" y="180" width="620" height="60" rx="8" fill="#f1f5f9"/><text x="25" y="205" class="svg-ink" font-size="13">Rule: sabse neeche wali broken layer pehle theek karo. Step 2 down ho to step 5 ka theek hona bekaar hai.</text><text x="25" y="225" class="svg-muted" font-size="12">Har step ki ek main command hai (agli table).</text>
</svg><p class="cap">Fixed order mein chhe checks. Pehle fail hone wale par ruk jao.</p></div>
<table class="cmp"><tr><th>Step</th><th>Sawal</th><th>Command</th></tr>
<tr><td>1</td><td>Kya edge Validator tak pahunch sakta hai?</td><td><code>show ip interface brief</code>, <code>show ip route</code>, <code>ping 198.51.100.30</code></td></tr>
<tr><td>2</td><td>Kya control connections up hain? Nahi to kyun?</td><td><code>show sdwan control connections</code>, <code>show sdwan control connection-history</code></td></tr>
<tr><td>3</td><td>Kya identity aur lists match karte hain?</td><td><code>show sdwan control local-properties</code>, <code>show clock</code>, Manager mein WAN Edge List</td></tr>
<tr><td>4</td><td>Kya OMP up hai aur routes exchange ho rahe hain?</td><td><code>show sdwan omp summary</code>, <code>show sdwan omp routes</code>, <code>show sdwan omp tlocs</code></td></tr>
<tr><td>5</td><td>Kya tunnels up hain?</td><td><code>show sdwan bfd sessions</code>, <code>show sdwan bfd summary</code></td></tr>
<tr><td>6</td><td>Kya LAN chal raha hai?</td><td><code>show ip route vrf 10</code>, <code>ping vrf 10 10.3.10.10</code>, <code>traceroute vrf 10 10.3.10.10</code></td></tr></table>

<h3>Control connection history padhna</h3>
<p>Jab connection up nahi hota, <code>show sdwan control connection-history</code> wajah record karta hai. <b>LOCAL ERROR</b> column mein ek chhota code hota hai. Yeh woh codes hain jo aapko sabse zyada milenge; apni release ke liye exact wording documentation mein dekho:</p>
<pre class="out">E-MUM-1# show sdwan control connection-history
PEER    PEER ... LOCAL COLOR   STATE     LOCAL ERROR  REMOTE ERROR REPEAT
TYPE    PROT
vbond   dtls ... biz-internet  connect   <span class="hl">DCONFAIL</span>     NOERR        6
vbond   dtls ... biz-internet  tear_down <span class="hl">CRTREJSER</span>    NOERR        2</pre>
<table class="cmp"><tr><th>Code</th><th>Typical matlab</th><th>Pehle kya check karo</th></tr>
<tr><td>DCONFAIL</td><td>DTLS connection ban nahi paya</td><td>Underlay: route, firewall, UDP 12346, NAT</td></tr>
<tr><td>CRTREJSER</td><td>Peer ne certificate ya serial number reject kiya</td><td>WAN Edge List state, Send to Controllers</td></tr>
<tr><td>SERNTPRES</td><td>Serial ya chassis number peer ki authorized list mein nahi hai</td><td>Device add ya sync karo, phir list bhejo</td></tr>
<tr><td>CTORGNMMIS</td><td>Organization name match nahi karta</td><td>Edge aur Controllers par <code>organization-name</code> compare karo</td></tr>
<tr><td>CRTVERFL</td><td>Certificate verification fail hui</td><td>Root certificate chain, certificate dates, clock</td></tr></table>

<h3>Teen tickets, ek ek karke</h3>
<p><b>Ticket 1: "E-MUM-1 kisi Controller tak nahi pahunch raha."</b> Step 1: <code>ping 198.51.100.30</code> fail hota hai. Route table mein default 203.0.113.1 se hai, galat gateway. Route ko 203.0.113.9 par theek karo. Control connections up ho jaate hain. Seekh: underlay skip mat karo.</p>
<p><b>Ticket 2: "E-BLR-1 Validator tak pahunchta hai par kabhi join nahi karta."</b> Ping chalta hai, history mein <code>CRTREJSER</code> hai. Manager mein WAN Edge List mein device <b>Invalid</b> hai. Use Valid karo aur Send to Controllers use karo. Seekh: certificate theek tha; authorization theek nahi thi.</p>
<p><b>Ticket 3: "Delhi aur Mumbai sirf internet par baat karte hain; MPLS dead hai."</b> Control connections up hain, OMP up hai, lekin BFD sirf biz-internet sessions dikhata hai. <code>show sdwan omp tlocs</code> dikhata hai ki E-MUM-1 color <code>private1</code> use karta hai, aur E-DEL-1 ke paas <code>mpls restrict</code> hai. Mumbai par color theek karo. Seekh: restrict ke saath colors match hone chahiye.</p>
<p>Chautha classic: edge har jagah <code>up</code> dikhata hai, lekin host across ping nahi kar pa raha. Step 6 dekho. LAN interface VRF 10 ki jagah global table mein ho sakta hai, ya LAN prefix advertise nahi ho raha.</p>

<h3>Kaam ki tricks</h3>
<ul>
<li><b>Pehle ginti karo.</b> Pehle predict karo ki kitne BFD sessions expect hain (same color ya non-restricted TLOC pairs) aur <code>show sdwan bfd summary</code> se compare karo.</li>
<li><b>Dono ends compare karo.</b> Tunnel ko dono sides chahiye. Peer par wahi <code>show</code> command chalao.</li>
<li><b>Clock check karo.</b> <code>show clock</code> aur certificate validity. Bahut galat date CRTVERFL ki classic wajah hai.</li>
<li><b>Manager ka apna view dekho.</b> Device ke page par control status aur wajah dikhti hai, aur device ke troubleshooting tools ke neeche GUI se ping ya traceroute chalaya ja sakta hai.</li>
<li><b>Ek baar mein ek cheez badlo</b> aur output dobara padho.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Control connections up hone se pehle policy ya templates par kud jaana; error code padhne ki jagah router restart karna; ek saath do cheezein badalna; aur clock bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Aapko aam taur par ek symptom aur ek command output milta hai aur aapko layer batani hoti hai. "Controller connection nahi" matlab steps 1 se 3. "OMP routes hain par tunnel down" matlab step 5. "LAN par routes missing" matlab step 4 ya 6.</p></div>

<div class="scn"><h4>Hyderabad ke baare mein raat 3 baje ka call</h4><p>Power cut ke baad E-HYD-1 "no control connection" dikha raha tha. On-call engineer ne chhe steps chalaye. Underlay ping chal raha tha, lekin <code>show sdwan control connection-history</code> ne <code>CRTVERFL</code> bataya. <code>show clock</code> January 2000 dikha raha tha, kyunki battery-backed clock reset ho gayi thi aur NTP blocked tha. Usne clock manually set ki, DTLS handshake succeed hua, aur agli subah firewall par NTP permit kiya gaya.</p><p><b>Seekh:</b> error code padho, aur clock hamesha check karo.</p></div>

<div class="iv"><p class="q">"WAN edge up nahi aa raha. Apne checks batao."</p><p>Strong answer: pehle underlay (interface, default route, Validator ping), phir control connection state aur history error code, phir identity (organization name, WAN edge list state, certificate, clock). Control plane up hone ke baad hi OMP, BFD sessions aur aakhir mein service VRF dekhta hoon. DCONFAIL, CRTREJSER, CTORGNMMIS aur Send to Controllers step batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Neeche se upar kaam karo: underlay, control connections, identity, OMP, BFD, service side.</li>
<li>Connection history ka error code batata hai ki control connection kyun fail hua.</li>
<li>Zyada tar failures routes, firewall ports, list state, organization name ya clock hote hain.</li>
<li>Expected BFD sessions ginkar asli number se compare karo.</li>
<li>Ek baar mein ek cheez badlo aur har change ke baad verify karo.</li>
</ul></div>
`}};export{e as default};