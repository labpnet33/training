var e={id:`summary`,h:{en:`Summary, cheat sheet and exam checklist`,hi:`Summary, cheat sheet aur exam checklist`},body:{en:`
<p>You started this module with a vague complaint, "the branch is down", and finish with a method that turns it into one layer, one command and one cause. This chapter gathers the method, the commands, the codes and the facts that exams and interviews like to test. Keep it open while you do the troubleshooting labs of this track: the labs give you faults to practise on, and this page tells you where to look first.</p>

<h3>The whole module in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Troubleshooting flow summary">
<rect x="6" y="20" width="96" height="60" rx="8" fill="#e9d5ff"/><text x="54" y="46" text-anchor="middle" class="svg-ink" font-size="12">1 Underlay</text><text x="54" y="62" text-anchor="middle" class="svg-muted" font-size="10">ping, route</text>
<rect x="112" y="20" width="96" height="60" rx="8" fill="#ddd6fe"/><text x="160" y="46" text-anchor="middle" class="svg-ink" font-size="12">2 Control</text><text x="160" y="62" text-anchor="middle" class="svg-muted" font-size="10">history, cert</text>
<rect x="218" y="20" width="96" height="60" rx="8" fill="#bae6fd"/><text x="266" y="46" text-anchor="middle" class="svg-ink" font-size="12">3 OMP</text><text x="266" y="62" text-anchor="middle" class="svg-muted" font-size="10">routes, TLOCs</text>
<rect x="324" y="20" width="96" height="60" rx="8" fill="#a7f3d0"/><text x="372" y="46" text-anchor="middle" class="svg-ink" font-size="12">4 BFD</text><text x="372" y="62" text-anchor="middle" class="svg-muted" font-size="10">tunnels, MTU</text>
<rect x="430" y="20" width="96" height="60" rx="8" fill="#bbf7d0"/><text x="478" y="46" text-anchor="middle" class="svg-ink" font-size="12">5 Template</text><text x="478" y="62" text-anchor="middle" class="svg-muted" font-size="10">push, sync</text>
<rect x="536" y="20" width="96" height="60" rx="8" fill="#fde68a"/><text x="584" y="46" text-anchor="middle" class="svg-ink" font-size="12">6 Policy</text><text x="584" y="62" text-anchor="middle" class="svg-muted" font-size="10">site list, match</text>
<rect x="112" y="100" width="150" height="60" rx="8" fill="#fed7aa"/><text x="187" y="126" text-anchor="middle" class="svg-ink" font-size="12">7 NAT and DIA</text><text x="187" y="142" text-anchor="middle" class="svg-muted" font-size="10">route, NAT, DNS</text>
<rect x="278" y="100" width="150" height="60" rx="8" fill="#fbcfe8"/><text x="353" y="126" text-anchor="middle" class="svg-ink" font-size="12">8 Application</text><text x="353" y="142" text-anchor="middle" class="svg-muted" font-size="10">SLA, queue, ends</text>
<rect x="444" y="100" width="150" height="60" rx="8" fill="#e5e7eb"/><text x="519" y="126" text-anchor="middle" class="svg-ink" font-size="12">Deep tools</text><text x="519" y="142" text-anchor="middle" class="svg-muted" font-size="10">trace, capture, admin-tech</text>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="13">Scope first, bottom layer first, one change at a time, prove the cause</text>
</svg><p class="cap">The eight layers and the deep tools you use when show commands are not enough.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Scope a ticket with the three questions and apply the eight layers from the bottom.</li>
<li>Read control connection states and history error codes, on both ends.</li>
<li>Diagnose certificate, serial number, organisation name, clock and NAT faults.</li>
<li>Follow an OMP route through advertised, received, forwarded and installed, and read C, I, R, Inv and U.</li>
<li>Count expected BFD sessions and tell a session that is down from one that flaps, and test MTU.</li>
<li>Tell template push failures, rollbacks and out-of-sync devices from policy application faults.</li>
<li>Check the five DIA conditions and split an application complaint into path, edge and ends.</li>
<li>Use packet trace, captures and admin-tech safely.</li>
</ul>

<h3>Symptom to layer</h3>
<table class="cmp"><tr><th>Symptom</th><th>Layer</th><th>First command</th></tr>
<tr><td>No control connection, no ping to the Validator</td><td>1</td><td><code>show ip route</code>, <code>ping 198.51.100.30</code></td></tr>
<tr><td>Control stays in connect or tear_down</td><td>1 or 2</td><td><code>show sdwan control connection-history</code></td></tr>
<tr><td>Connected but no remote routes</td><td>3 or 6</td><td><code>show sdwan omp summary</code>, Controller <code>show omp peers</code></td></tr>
<tr><td>Routes present, Inv,U</td><td>3 or 4</td><td><code>show sdwan omp tlocs</code>, <code>show sdwan bfd sessions</code></td></tr>
<tr><td>Session down or flapping</td><td>4</td><td><code>show sdwan bfd summary</code>, <code>show sdwan tunnel statistics</code></td></tr>
<tr><td>Push failed, device unreachable after push</td><td>5</td><td>Task log, Config Diff</td></tr>
<tr><td>Policy active but no effect</td><td>6</td><td><code>show sdwan policy from-vsmart</code>, counters</td></tr>
<tr><td>Internet unreachable from a branch</td><td>7</td><td><code>show ip route vrf 10 0.0.0.0</code>, <code>show ip nat translations</code></td></tr>
<tr><td>Slow application</td><td>8</td><td><code>show sdwan app-route stats</code>, <code>show policy-map interface</code></td></tr></table>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Control connection</dt><dd>The DTLS or TLS session between an edge and a Controller, Validator or Manager.</dd>
<dt>connection-history</dt><dd>Log of past attempts with local and remote error codes.</dd>
<dt>R/I/S</dt><dd>Routes received, installed, sent per OMP peer on a Controller.</dd>
<dt>Inv,U</dt><dd>Invalid and TLOC unresolved route status.</dd>
<dt>Transitions</dt><dd>Number of times a BFD session changed state; a flapping indicator.</dd>
<dt>Out of sync</dt><dd>Device configuration differs from what the Manager holds.</dd>
<dt>from-vsmart</dt><dd>Edge command listing the centralized policy it received.</dd>
<dt>Packet trace</dt><dd>Router feature that records the processing of selected packets.</dd>
<dt>Admin-tech</dt><dd>Bundle of device state and logs for the vendor's support.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Control ports</td><td>DTLS on UDP 12346 with hopping in steps of 20; TLS on TCP</td></tr>
<tr><td>States</td><td>up, connect, challenge, tear_down</td></tr>
<tr><td>CRTREJSER</td><td>Challenge response rejected by the peer; check the authorized list</td></tr>
<tr><td>DCONFAIL</td><td>DTLS connection failure; check underlay and firewall</td></tr>
<tr><td>CTORGNMMIS</td><td>Certificate organisation name mismatch</td></tr>
<tr><td>NAT type</td><td>E endpoint-independent, A address-port dependent, N not learned</td></tr>
<tr><td>OMP distance</td><td>251</td></tr>
<tr><td>BFD defaults</td><td>Hello 1000 ms, multiplier 7</td></tr>
<tr><td>Edge show prefix</td><td>show sdwan on the edge; show without sdwan on Controllers</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c"># 1 and 2: underlay and control</span>
show ip route
ping 198.51.100.30
show sdwan control connections
show sdwan control connection-history
show sdwan control local-properties
show sdwan certificate installed
show clock
<span class="c"># 3: OMP</span>
show sdwan omp summary
show sdwan omp routes vpn 10
show sdwan omp tlocs
<span class="c"># 4: data plane</span>
show sdwan bfd summary
show sdwan bfd sessions
show sdwan tunnel statistics
show sdwan app-route stats
<span class="c"># 6: policy</span>
show sdwan policy from-vsmart
show sdwan policy data-policy-filter
<span class="c"># 7: DIA</span>
show ip route vrf 10 0.0.0.0
show ip nat translations
<span class="c"># deep tools</span>
debug platform condition ipv4 10.2.10.10/32 both
show platform packet-trace summary
monitor capture CAP start
request admin-tech
<span class="c"># Controllers</span>
show control connections
show control valid-vedges
show omp peers</pre>

<div class="eg"><p><b>Worked example.</b> Combine the layers in one calculation. A branch has 2 TLOCs and 3 remote sites each with 2 TLOCs, all with matching colours. Expected BFD sessions: for each remote site, one per same-colour pair, so 2 per site and 3 x 2 = 6 sessions. <code>show sdwan bfd summary</code> shows sessions-total 6, sessions-up 5. One session is down: apply the seven questions from chapter 5 starting with the remote TLOC and the colour of that session. If it showed total 4, two sessions are missing entirely, which is layer 3 (TLOC unresolved) not layer 4.</p></div>

<div class="warn"><p><b>Common mistake.</b> Memorising commands without the order. In every ticket, say the layer out loud, name the evidence that proves the layer is healthy, and only then move up.</p></div>

<div class="exam"><p><b>Exam trap.</b> The exam gives you one output and asks the next step. Find the lowest layer that the output shows as broken. If the output shows control up and OMP up but BFD down, do not look at policy.</p></div>

<div class="scn"><h4>Handover at 6 a.m.</h4><p>The night engineer of Bharat Retail hands over three open tickets. Each note has the same format: the symptom, the scope, the layer where it stops, the evidence (the output pasted), what was changed, and what is next. The day engineer closes two in ten minutes because the notes show the layer and the proof; the third needs the provider and the note holds the times and measurements.</p><p><b>Lesson:</b> a ticket note in the method's format is half the fix.</p></div>

<div class="iv"><p class="q">"Describe your troubleshooting method for a Catalyst SD-WAN network."</p><p>I scope by sites, applications and recent changes. Then I walk the layers from the bottom: underlay, control connections with their error codes, OMP routes and TLOCs, BFD tunnels, templates, policy, NAT and DIA, and the application. I compare with a healthy site, use packet trace and captures only on one flow when show commands are not enough, change one thing at a time and document the cause and the evidence.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Scope first; walk the eight layers from the bottom; stop at the first failure.</li>
<li>Read error codes and counters on both ends before changing anything.</li>
<li>Most faults are lists, colours, clocks, site lists and filters, not product bugs.</li>
<li>Use deep tools last, on one flow, for a short time.</li>
<li>Document the cause with evidence; it is what makes the next ticket faster.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module ek dhundhli shikayat se shuru kiya, "branch down hai", aur ab aapke paas aisa method hai jo use ek layer, ek command aur ek wajah mein badal deta hai. Yeh chapter method, commands, codes aur woh facts ikatthe karta hai jo exams aur interviews test karna pasand karte hain. Is track ke troubleshooting labs karte waqt ise khula rakho: labs aapko practice ke liye faults dete hain, aur yeh page batata hai pehle kahan dekhna hai.</p>

<h3>Poora module ek picture mein</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Troubleshooting flow summary">
<rect x="6" y="20" width="96" height="60" rx="8" fill="#e9d5ff"/><text x="54" y="46" text-anchor="middle" class="svg-ink" font-size="12">1 Underlay</text><text x="54" y="62" text-anchor="middle" class="svg-muted" font-size="10">ping, route</text>
<rect x="112" y="20" width="96" height="60" rx="8" fill="#ddd6fe"/><text x="160" y="46" text-anchor="middle" class="svg-ink" font-size="12">2 Control</text><text x="160" y="62" text-anchor="middle" class="svg-muted" font-size="10">history, cert</text>
<rect x="218" y="20" width="96" height="60" rx="8" fill="#bae6fd"/><text x="266" y="46" text-anchor="middle" class="svg-ink" font-size="12">3 OMP</text><text x="266" y="62" text-anchor="middle" class="svg-muted" font-size="10">routes, TLOCs</text>
<rect x="324" y="20" width="96" height="60" rx="8" fill="#a7f3d0"/><text x="372" y="46" text-anchor="middle" class="svg-ink" font-size="12">4 BFD</text><text x="372" y="62" text-anchor="middle" class="svg-muted" font-size="10">tunnels, MTU</text>
<rect x="430" y="20" width="96" height="60" rx="8" fill="#bbf7d0"/><text x="478" y="46" text-anchor="middle" class="svg-ink" font-size="12">5 Template</text><text x="478" y="62" text-anchor="middle" class="svg-muted" font-size="10">push, sync</text>
<rect x="536" y="20" width="96" height="60" rx="8" fill="#fde68a"/><text x="584" y="46" text-anchor="middle" class="svg-ink" font-size="12">6 Policy</text><text x="584" y="62" text-anchor="middle" class="svg-muted" font-size="10">site list, match</text>
<rect x="112" y="100" width="150" height="60" rx="8" fill="#fed7aa"/><text x="187" y="126" text-anchor="middle" class="svg-ink" font-size="12">7 NAT aur DIA</text><text x="187" y="142" text-anchor="middle" class="svg-muted" font-size="10">route, NAT, DNS</text>
<rect x="278" y="100" width="150" height="60" rx="8" fill="#fbcfe8"/><text x="353" y="126" text-anchor="middle" class="svg-ink" font-size="12">8 Application</text><text x="353" y="142" text-anchor="middle" class="svg-muted" font-size="10">SLA, queue, ends</text>
<rect x="444" y="100" width="150" height="60" rx="8" fill="#e5e7eb"/><text x="519" y="126" text-anchor="middle" class="svg-ink" font-size="12">Gehre tools</text><text x="519" y="142" text-anchor="middle" class="svg-muted" font-size="10">trace, capture, admin-tech</text>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="13">Pehle scope, neeche ki layer pehle, ek waqt mein ek change, wajah sabit karo</text>
</svg><p class="cap">Aath layers aur gehre tools jo show commands kam padne par use hote hain.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Teen sawalon se ticket scope karo aur aath layers neeche se lagao.</li>
<li>Control connection states aur history error codes dono ends se padho.</li>
<li>Certificate, serial number, organisation name, clock aur NAT faults diagnose karo.</li>
<li>OMP route ko advertised, received, forwarded aur installed mein follow karo, aur C, I, R, Inv aur U padho.</li>
<li>Expected BFD sessions ginto, down aur flapping session mein fark batao, aur MTU test karo.</li>
<li>Template push failures, rollbacks aur out-of-sync devices ko policy application faults se alag karo.</li>
<li>Paanch DIA conditions check karo aur application shikayat ko path, edge aur ends mein baanto.</li>
<li>Packet trace, captures aur admin-tech safely use karo.</li>
</ul>

<h3>Symptom se layer</h3>
<table class="cmp"><tr><th>Symptom</th><th>Layer</th><th>Pehla command</th></tr>
<tr><td>Control connection nahi, Validator ka ping nahi</td><td>1</td><td><code>show ip route</code>, <code>ping 198.51.100.30</code></td></tr>
<tr><td>Control connect ya tear_down mein atka</td><td>1 ya 2</td><td><code>show sdwan control connection-history</code></td></tr>
<tr><td>Connected lekin remote routes nahi</td><td>3 ya 6</td><td><code>show sdwan omp summary</code>, Controller <code>show omp peers</code></td></tr>
<tr><td>Routes hain, Inv,U</td><td>3 ya 4</td><td><code>show sdwan omp tlocs</code>, <code>show sdwan bfd sessions</code></td></tr>
<tr><td>Session down ya flapping</td><td>4</td><td><code>show sdwan bfd summary</code>, <code>show sdwan tunnel statistics</code></td></tr>
<tr><td>Push fail, push ke baad device unreachable</td><td>5</td><td>Task log, Config Diff</td></tr>
<tr><td>Policy active lekin asar nahi</td><td>6</td><td><code>show sdwan policy from-vsmart</code>, counters</td></tr>
<tr><td>Branch se internet unreachable</td><td>7</td><td><code>show ip route vrf 10 0.0.0.0</code>, <code>show ip nat translations</code></td></tr>
<tr><td>Application slow</td><td>8</td><td><code>show sdwan app-route stats</code>, <code>show policy-map interface</code></td></tr></table>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Control connection</dt><dd>Edge aur Controller, Validator ya Manager ke beech DTLS ya TLS session.</dd>
<dt>connection-history</dt><dd>Pichhle attempts ka log, local aur remote error codes ke saath.</dd>
<dt>R/I/S</dt><dd>Controller par har OMP peer ke routes received, installed, sent.</dd>
<dt>Inv,U</dt><dd>Invalid aur TLOC unresolved route status.</dd>
<dt>Transitions</dt><dd>BFD session ne kitni baar state badli; flapping ka sanket.</dd>
<dt>Out of sync</dt><dd>Device configuration Manager ke paas rakhi se alag hai.</dd>
<dt>from-vsmart</dt><dd>Edge command jo mili hui centralized policy list karta hai.</dd>
<dt>Packet trace</dt><dd>Router feature jo chuney packets ki processing record karta hai.</dd>
<dt>Admin-tech</dt><dd>Vendor support ke liye device state aur logs ka bundle.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Control ports</td><td>DTLS UDP 12346 par, 20 ke steps mein hopping; TLS TCP par</td></tr>
<tr><td>States</td><td>up, connect, challenge, tear_down</td></tr>
<tr><td>CRTREJSER</td><td>Challenge response peer ne reject kiya; authorized list check karo</td></tr>
<tr><td>DCONFAIL</td><td>DTLS connection failure; underlay aur firewall check karo</td></tr>
<tr><td>CTORGNMMIS</td><td>Certificate organisation name mismatch</td></tr>
<tr><td>NAT type</td><td>E endpoint-independent, A address-port dependent, N not learned</td></tr>
<tr><td>OMP distance</td><td>251</td></tr>
<tr><td>BFD defaults</td><td>Hello 1000 ms, multiplier 7</td></tr>
<tr><td>Edge show prefix</td><td>Edge par show sdwan; Controllers par sdwan ke bina show</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c"># 1 aur 2: underlay aur control</span>
show ip route
ping 198.51.100.30
show sdwan control connections
show sdwan control connection-history
show sdwan control local-properties
show sdwan certificate installed
show clock
<span class="c"># 3: OMP</span>
show sdwan omp summary
show sdwan omp routes vpn 10
show sdwan omp tlocs
<span class="c"># 4: data plane</span>
show sdwan bfd summary
show sdwan bfd sessions
show sdwan tunnel statistics
show sdwan app-route stats
<span class="c"># 6: policy</span>
show sdwan policy from-vsmart
show sdwan policy data-policy-filter
<span class="c"># 7: DIA</span>
show ip route vrf 10 0.0.0.0
show ip nat translations
<span class="c"># gehre tools</span>
debug platform condition ipv4 10.2.10.10/32 both
show platform packet-trace summary
monitor capture CAP start
request admin-tech
<span class="c"># Controllers</span>
show control connections
show control valid-vedges
show omp peers</pre>

<div class="eg"><p><b>Worked example.</b> Layers ko ek calculation mein milao. Ek branch ke 2 TLOCs hain aur 3 remote sites ke har ek ke 2 TLOCs, sab ke colours match karte hain. Expected BFD sessions: har remote site ke liye har same-colour pair ka ek, yaani har site ke 2 aur 3 x 2 = 6 sessions. <code>show sdwan bfd summary</code> sessions-total 6, sessions-up 5 dikhata hai. Ek session down hai: chapter 5 ke saat sawal lagao, us session ke remote TLOC aur colour se shuru karke. Agar total 4 dikhta, to do sessions bilkul gayab hain, jo layer 3 (TLOC unresolved) hai, layer 4 nahi.</p></div>

<div class="warn"><p><b>Common mistake.</b> Order ke bina commands ratna. Har ticket mein layer ka naam zor se bolo, woh evidence batao jo sabit karta hai ki layer healthy hai, aur tabhi upar jao.</p></div>

<div class="exam"><p><b>Exam trap.</b> Exam ek output deta hai aur agla step poochta hai. Sabse neeche ki woh layer dhoondho jo output toota dikhata hai. Agar output control up aur OMP up lekin BFD down dikhaye, to policy mat dekho.</p></div>

<div class="scn"><h4>Subah 6 baje handover</h4><p>Bharat Retail ka night engineer teen open tickets handover karta hai. Har note ka format wahi hai: symptom, scope, jis layer par ruka, evidence (output paste), kya badla gaya, aur agla kya hai. Day engineer do tickets das minute mein close karta hai kyunki notes layer aur saboot dikhate hain; teesre ko provider chahiye aur note mein times aur measurements hain.</p><p><b>Lesson:</b> method ke format mein likha ticket note aadha fix hai.</p></div>

<div class="iv"><p class="q">"Catalyst SD-WAN network ke liye apna troubleshooting method batao."</p><p>Main sites, applications aur haal ke changes se scope karta hoon. Phir neeche se layers: underlay, error codes ke saath control connections, OMP routes aur TLOCs, BFD tunnels, templates, policy, NAT aur DIA, aur application. Healthy site se compare karta hoon, show commands kam padein tabhi ek flow par packet trace aur captures use karta hoon, ek waqt mein ek cheez badalta hoon aur wajah aur evidence document karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle scope; aath layers neeche se; pehli failure par ruko.</li>
<li>Kuch badalne se pehle dono ends par error codes aur counters padho.</li>
<li>Zyadatar faults lists, colours, clocks, site lists aur filters hote hain, product bugs nahi.</li>
<li>Gehre tools aakhir mein, ek flow par, thode samay ke liye.</li>
<li>Wajah evidence ke saath document karo; agla ticket usi se tez hota hai.</li>
</ul></div>
`}};export{e as default};