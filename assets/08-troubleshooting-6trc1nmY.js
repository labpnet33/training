var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow and the dead DMZ ticket`,hi:`Troubleshooting workflow aur dead DMZ ticket`},body:{en:`
<p><b>The ticket.</b> Change CHG-2291 added the DMZ web server 10.0.2.10 on ethernet1/3 last night. The admin says "the IP is configured and committed". The server cannot even ping its gateway 10.0.2.1, and LAN users cannot reach it. This is the second lab. Instead of guessing, follow a fixed workflow and let each check narrow the problem.</p>

<h3>The workflow</h3>
<ol>
<li><b>Define the symptom precisely.</b> Who cannot reach what, and what exactly fails (ping to the gateway, ping through, web page)?</li>
<li><b>Layer 1 and 2:</b> link state, ARP. (<code>show interface all</code>, <code>show arp all</code>)</li>
<li><b>Layer 3 and bindings:</b> IP, virtual router, zone, management profile. (<code>show interface ethernet1/3</code>)</li>
<li><b>Routing:</b> is the connected route present? (<code>show routing route</code>)</li>
<li><b>Policy:</b> would a rule allow it? (<code>test security-policy-match</code>)</li>
<li><b>NAT and sessions:</b> only if the flow leaves the network. (<code>show session all</code>)</li>
<li><b>Change one group of things, commit, retest.</b></li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="DMZ topology">
<rect x="10" y="20" width="90" height="45" rx="8" fill="#e2e8f0"/><text x="55" y="48" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="10" y="90" width="90" height="45" rx="8" fill="#fed7aa"/><text x="55" y="118" text-anchor="middle" class="svg-ink" font-size="13">WEB 10.0.2.10</text>
<rect x="200" y="45" width="160" height="60" rx="10" fill="#ddd6fe"/><text x="280" y="72" text-anchor="middle" class="svg-ink" font-size="14">NK-PUNE-PA</text><text x="280" y="92" text-anchor="middle" class="svg-muted" font-size="12">e1/3 10.0.2.1/24</text>
<rect x="460" y="45" width="80" height="50" rx="8" fill="#e2e8f0"/><text x="500" y="75" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<line x1="100" y1="42" x2="200" y2="65" stroke="#64748b" stroke-width="2"/><line x1="100" y1="112" x2="200" y2="88" stroke="#64748b" stroke-width="2"/><line x1="360" y1="75" x2="460" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The DMZ server hangs off ethernet1/3; the LAN is on ethernet1/2; the ISP on ethernet1/1.</p></div>

<h3>Step 1 (lab task 1): the zone column</h3>
<pre class="out">admin@NK-PUNE-PA&gt; show interface all
name                id    vsys zone             forwarding               tag    address
------------------- ----- ---- ---------------- ------------------------ ------ ------------------
ethernet1/1         16    1    untrust          vr:default               0      203.0.113.2/30
ethernet1/2         17    1    trust            vr:default               0      10.0.1.1/24
ethernet1/3         18    1    <span class="hl">N/A              N/A</span>                      0      10.0.2.1/24</pre>
<p>The lab asks for the zone value of ethernet1/3: <b>N/A</b>. Forwarding is N/A too. The detail view confirms three gaps in one place:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show interface ethernet1/3
Name: ethernet1/3, ID: 16, 802.1q tag: 0
Operation mode: layer3
<span class="hl">Virtual router N/A</span>
Interface MTU 1500
Interface IP address: 10.0.2.1/24
<span class="hl">Interface management profile: N/A</span>
<span class="hl">Zone: N/A</span>, virtual system: vsys1</pre>
<p>Also notice the pieces that look right: the DMZ zone object <code>dmz</code> already exists in the configuration but is empty, and the rule <code>LAN-to-DMZ</code> already allows ping and web-browsing from trust to dmz. The policy was written correctly; it just has no interface to apply to. The ARP table also has no entry for 10.0.2.10, and the connected route 10.0.2.0/24 is absent from <code>show routing route</code> (only 5 routes, none for the DMZ).</p>

<h3>Step 2 (lab task 2): fix everything in one commit</h3>
<pre class="code">set network virtual-router default interface ethernet1/3
set network interface ethernet ethernet1/3 layer3 interface-management-profile allow-ping
set zone dmz network layer3 ethernet1/3
commit</pre>
<p>You can also fix and test in stages to see how each missing piece changes the symptom. The simulator reproduced these results:</p>
<pre class="out"><span class="c">After the virtual router only</span>
WEB&gt; ping 10.0.2.1                       timeout    (still no zone, no profile)
PC1&gt; ping 10.0.2.10                      timeout    (no zone: no policy applies)

<span class="c">After the zone as well</span>
PC1&gt; ping 10.0.2.10
<span class="hl">84 bytes from 10.0.2.10 icmp_seq=1 ttl=63 time=0.500 ms</span>   (through the firewall works)
WEB&gt; ping 10.0.2.1                       timeout    (the firewall itself still ignores ping)

<span class="c">After the management profile</span>
WEB&gt; ping 10.0.2.1
<span class="hl">84 bytes from 10.0.2.1 icmp_seq=1 ttl=64 time=0.500 ms</span></pre>
<p>This staged view is the heart of the lesson. The <b>zone</b> unlocks through-traffic (PC1 to the web server). The <b>management profile</b> unlocks traffic to the firewall's own address (the server pinging its gateway). The <b>virtual router</b> provides the route that makes both possible. Three missing items, three different symptoms.</p>

<h3>Step 3 (lab task 3): verify from the user side</h3>
<p>From PC1: <code>ping 10.0.2.10</code> and then load the web page (the lab uses the simulator's fetch tool). The session proves what the firewall did:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show session all
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
Vsys                                           Dst[Dport]/Zone (translated IP[Port])
9361         ping           ACTIVE  FLOW       10.0.1.10[19499]/trust/1  (10.0.1.10[19499])
vsys1                                          10.0.2.10[8]/dmz  (10.0.2.10[8])</pre>
<p>Trust to dmz, no NAT flag, because DMZ traffic is not translated. Final interface table: ethernet1/3 shows zone <code>dmz</code> and forwarding <code>vr:default</code>.</p>

<div class="eg"><p><b>Worked example.</b> A colleague says "add a rule from trust to dmz". You answer: the rule exists, and <code>test security-policy-match from trust to dmz ...</code> already returns LAN-to-DMZ allow. The fault is not policy. The binding of the interface to a zone and a virtual router is missing. Evidence beats opinion.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing the security rule when the interface is the problem. Fixing one symptom (the zone) and calling it done while the management profile is still missing. Making the fix in several commits and leaving a half-built state in production.</p></div>
<div class="exam"><p><b>Exam trap.</b> The server cannot ping the firewall's own address but users can reach the server through the firewall: the missing item is the management profile. The reverse (the firewall answers, but through-traffic fails): a zone or policy problem. Memorise this pairing.</p></div>

<div class="scn"><h4>Change review that would have caught it</h4><p>The CHG-2291 plan listed "add IP 10.0.2.1/24 on ethernet1/3". It said nothing about virtual router, zone or profile. After the incident, the change template gained five lines: IP, virtual router, zone, profile, rule. The next DMZ addition went in with one commit and one successful ping.</p><p><b>Lesson:</b> a checklist in the change plan prevents the outage.</p></div>

<div class="iv"><p class="q">"A new interface has an IP but the server behind it cannot reach anything. Where do you look?"</p><p>show interface all for the zone and virtual router columns, then show interface on that port for the management profile, then show routing route for the connected route, then test security-policy-match for the rule. Fix all missing bindings in one commit and verify from both sides.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use a fixed workflow: symptom, link and ARP, bindings, route, policy, NAT and session.</li>
<li>N/A in the zone and forwarding columns means no zone and no virtual router.</li>
<li>Zone unlocks through-traffic; management profile unlocks traffic to the firewall.</li>
<li>Existing policy can be correct while the interface is unbound.</li>
<li>Fix in one commit, then verify from the user side and with show session all.</li>
</ul></div>
`,hi:`
<p><b>Ticket.</b> Change CHG-2291 ne kal raat ethernet1/3 par DMZ web server 10.0.2.10 jodi. Admin kehta hai "IP configured aur committed hai". Server apne gateway 10.0.2.1 ko ping bhi nahi kar pa raha, aur LAN users us tak nahi pahunch pa rahe. Yeh doosra lab hai. Andaza lagane ke bajaye fixed workflow follow karo aur har check se problem ko sankuchit karo.</p>

<h3>Workflow</h3>
<ol>
<li><b>Symptom precisely define karo.</b> Kaun kis tak nahi pahunch pa raha, aur exactly kya fail ho raha hai (gateway ko ping, through ping, web page)?</li>
<li><b>Layer 1 aur 2:</b> link state, ARP. (<code>show interface all</code>, <code>show arp all</code>)</li>
<li><b>Layer 3 aur bindings:</b> IP, virtual router, zone, management profile. (<code>show interface ethernet1/3</code>)</li>
<li><b>Routing:</b> connected route hai? (<code>show routing route</code>)</li>
<li><b>Policy:</b> kya koi rule allow karega? (<code>test security-policy-match</code>)</li>
<li><b>NAT aur sessions:</b> sirf agar flow network se bahar jaata hai. (<code>show session all</code>)</li>
<li><b>Cheezon ka ek group badlo, commit karo, dobara test karo.</b></li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="DMZ topology">
<rect x="10" y="20" width="90" height="45" rx="8" fill="#e2e8f0"/><text x="55" y="48" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="10" y="90" width="90" height="45" rx="8" fill="#fed7aa"/><text x="55" y="118" text-anchor="middle" class="svg-ink" font-size="13">WEB 10.0.2.10</text>
<rect x="200" y="45" width="160" height="60" rx="10" fill="#ddd6fe"/><text x="280" y="72" text-anchor="middle" class="svg-ink" font-size="14">NK-PUNE-PA</text><text x="280" y="92" text-anchor="middle" class="svg-muted" font-size="12">e1/3 10.0.2.1/24</text>
<rect x="460" y="45" width="80" height="50" rx="8" fill="#e2e8f0"/><text x="500" y="75" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<line x1="100" y1="42" x2="200" y2="65" stroke="#64748b" stroke-width="2"/><line x1="100" y1="112" x2="200" y2="88" stroke="#64748b" stroke-width="2"/><line x1="360" y1="75" x2="460" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">DMZ server ethernet1/3 par hai; LAN ethernet1/2 par; ISP ethernet1/1 par.</p></div>

<h3>Step 1 (lab task 1): zone column</h3>
<pre class="out">admin@NK-PUNE-PA&gt; show interface all
name                id    vsys zone             forwarding               tag    address
------------------- ----- ---- ---------------- ------------------------ ------ ------------------
ethernet1/1         16    1    untrust          vr:default               0      203.0.113.2/30
ethernet1/2         17    1    trust            vr:default               0      10.0.1.1/24
ethernet1/3         18    1    <span class="hl">N/A              N/A</span>                      0      10.0.2.1/24</pre>
<p>Lab ethernet1/3 ki zone value poochta hai: <b>N/A</b>. Forwarding bhi N/A hai. Detail view ek hi jagah teen gaps confirm karta hai:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show interface ethernet1/3
Name: ethernet1/3, ID: 16, 802.1q tag: 0
Operation mode: layer3
<span class="hl">Virtual router N/A</span>
Interface MTU 1500
Interface IP address: 10.0.2.1/24
<span class="hl">Interface management profile: N/A</span>
<span class="hl">Zone: N/A</span>, virtual system: vsys1</pre>
<p>Un cheezon par bhi dhyan do jo sahi dikhti hain: DMZ zone object <code>dmz</code> configuration mein pehle se hai lekin khali hai, aur rule <code>LAN-to-DMZ</code> trust se dmz tak ping aur web-browsing pehle se allow karta hai. Policy sahi likhi thi; bas uske liye lagne ko koi interface nahi. ARP table mein 10.0.2.10 ki entry bhi nahi, aur connected route 10.0.2.0/24 <code>show routing route</code> se gayab hai (sirf 5 routes, DMZ ka koi nahi).</p>

<h3>Step 2 (lab task 2): sab kuch ek commit mein fix karo</h3>
<pre class="code">set network virtual-router default interface ethernet1/3
set network interface ethernet ethernet1/3 layer3 interface-management-profile allow-ping
set zone dmz network layer3 ethernet1/3
commit</pre>
<p>Aap stages mein fix aur test bhi kar sakte ho taaki dekho har missing piece symptom kaise badalta hai. Simulator ne yeh results diye:</p>
<pre class="out"><span class="c">Sirf virtual router ke baad</span>
WEB&gt; ping 10.0.2.1                       timeout    (abhi bhi na zone, na profile)
PC1&gt; ping 10.0.2.10                      timeout    (zone nahi: koi policy lagu nahi)

<span class="c">Zone bhi jodne ke baad</span>
PC1&gt; ping 10.0.2.10
<span class="hl">84 bytes from 10.0.2.10 icmp_seq=1 ttl=63 time=0.500 ms</span>   (firewall ke through chalta hai)
WEB&gt; ping 10.0.2.1                       timeout    (firewall khud abhi bhi ping ignore karta hai)

<span class="c">Management profile ke baad</span>
WEB&gt; ping 10.0.2.1
<span class="hl">84 bytes from 10.0.2.1 icmp_seq=1 ttl=64 time=0.500 ms</span></pre>
<p>Yeh staged view lesson ka dil hai. <b>Zone</b> through-traffic kholta hai (PC1 se web server). <b>Management profile</b> firewall ke apne address ka traffic kholta hai (server ka gateway ko ping). <b>Virtual router</b> woh route deta hai jo dono ko possible banata hai. Teen missing cheezein, teen alag symptoms.</p>

<h3>Step 3 (lab task 3): user side se verify karo</h3>
<p>PC1 se: <code>ping 10.0.2.10</code> phir web page load karo (lab simulator ka fetch tool use karta hai). Session saabit karta hai ki firewall ne kya kiya:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show session all
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
Vsys                                           Dst[Dport]/Zone (translated IP[Port])
9361         ping           ACTIVE  FLOW       10.0.1.10[19499]/trust/1  (10.0.1.10[19499])
vsys1                                          10.0.2.10[8]/dmz  (10.0.2.10[8])</pre>
<p>Trust se dmz, koi NAT flag nahi, kyunki DMZ traffic translate nahi hota. Final interface table: ethernet1/3 zone <code>dmz</code> aur forwarding <code>vr:default</code> dikhata hai.</p>

<div class="eg"><p><b>Worked example.</b> Colleague kehta hai "trust se dmz ka rule jodo". Aap jawab dete ho: rule pehle se hai, aur <code>test security-policy-match from trust to dmz ...</code> already LAN-to-DMZ allow deta hai. Fault policy nahi hai. Interface ka zone aur virtual router se binding missing hai. Raay se zyada saboot kaam aata hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Jab interface problem ho tab security rule badalna. Ek symptom (zone) theek karke kaam khatam maan lena jabki management profile abhi bhi missing hai. Fix ko kai commits mein karke production mein aadhi bani state chhodna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Server firewall ke apne address ko ping nahi kar sakta lekin users firewall ke through server tak pahunch sakte hain: missing cheez management profile hai. Ulta (firewall jawab deta hai, lekin through-traffic fail): zone ya policy problem. Yeh jodi yaad rakho.</p></div>

<div class="scn"><h4>Change review jo ise pakad leta</h4><p>CHG-2291 plan mein likha tha "ethernet1/3 par IP 10.0.2.1/24 jodo". Virtual router, zone ya profile ke baare mein kuch nahi. Incident ke baad change template mein paanch lines judi: IP, virtual router, zone, profile, rule. Agla DMZ addition ek commit aur ek successful ping ke saath gaya.</p><p><b>Lesson:</b> change plan mein checklist outage ko rokti hai.</p></div>

<div class="iv"><p class="q">"Naye interface par IP hai lekin uske peeche ka server kuch reach nahi kar pa raha. Kahan dekhte ho?"</p><p>Zone aur virtual router columns ke liye show interface all, phir management profile ke liye us port par show interface, phir connected route ke liye show routing route, phir rule ke liye test security-policy-match. Saari missing bindings ek commit mein theek karo aur dono sides se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Fixed workflow use karo: symptom, link aur ARP, bindings, route, policy, NAT aur session.</li>
<li>Zone aur forwarding columns mein N/A matlab na zone na virtual router.</li>
<li>Zone through-traffic kholta hai; management profile firewall ka apna traffic kholta hai.</li>
<li>Existing policy sahi ho sakti hai jabki interface unbound ho.</li>
<li>Ek commit mein fix karo, phir user side se aur show session all se verify karo.</li>
</ul></div>
`}};export{e as default};