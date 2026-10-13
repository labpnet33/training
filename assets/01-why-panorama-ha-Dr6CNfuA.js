var e={id:`why-panorama-ha`,h:{en:`Why Panorama needs high availability`,hi:`Panorama ko high availability kyun chahiye`},body:{en:`
<p><b>What you will learn:</b> what you lose when Panorama is down, what keeps working, and why a second Panorama is a sensible investment. <b>Prerequisites:</b> the earlier Panorama modules (device groups, templates, commit and push). Labs for this module: <code>pn-ha-build</code>, <code>pn-ha-failover</code> and <code>pn-ha-ts</code>.</p>

<p>Think of a railway control room. Trains keep running on the tracks even if the control room loses power, because every driver already has the timetable and the signals work locally. But nobody can change the timetable, reroute a train or see where all the trains are. Panorama is that control room and the firewalls are the trains. High availability (HA) means building a second control room that can take over.</p>

<h3>What is lost when Panorama is down</h3>
<table class="tbl">
<tr><th>Capability</th><th>Panorama up</th><th>Panorama down</th></tr>
<tr><td>Change (edit device groups, templates)</td><td>Yes, then commit to Panorama</td><td>No central change at all</td></tr>
<tr><td>Push to firewalls</td><td>commit-all from Panorama</td><td>No push possible</td></tr>
<tr><td>Visibility (central logs, device list, jobs)</td><td>One place</td><td>Gone until it returns; logs wait on the firewalls</td></tr>
<tr><td>Traffic enforcement on firewalls</td><td>Works</td><td>Still works with the last pushed configuration</td></tr>
</table>
<p>The important sentence: <b>the data plane is independent of the management plane</b>. A firewall enforces the policy it already holds. So a Panorama outage is not a traffic outage, but it is a change outage and a visibility outage. If a security incident happens at the same moment, you cannot push an emergency block rule centrally and you cannot search central logs.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Panorama pair managing firewalls">
<rect x="40" y="14" width="210" height="44" rx="8" fill="#ddd6fe"/><text x="145" y="41" text-anchor="middle" class="svg-ink" font-size="13">NK-PANORAMA 192.0.2.50</text>
<rect x="390" y="14" width="210" height="44" rx="8" fill="#e2e8f0"/><text x="495" y="41" text-anchor="middle" class="svg-ink" font-size="13">NK-PANORAMA-2 192.0.2.51</text>
<line x1="250" y1="36" x2="390" y2="36" stroke="#64748b" stroke-width="2"/><text x="320" y="30" text-anchor="middle" class="svg-muted" font-size="11">HA pair</text>
<rect x="60" y="130" width="140" height="40" rx="8" fill="#bae6fd"/><text x="130" y="155" text-anchor="middle" class="svg-ink" font-size="12">PA1 Pune</text>
<rect x="250" y="130" width="140" height="40" rx="8" fill="#bae6fd"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="12">PA2 Delhi</text>
<rect x="440" y="130" width="140" height="40" rx="8" fill="#bae6fd"/><text x="510" y="155" text-anchor="middle" class="svg-ink" font-size="12">PA3 Chennai</text>
<line x1="145" y1="58" x2="130" y2="130" stroke="#64748b"/><line x1="145" y1="58" x2="320" y2="130" stroke="#64748b"/><line x1="145" y1="58" x2="510" y2="130" stroke="#64748b"/>
<line x1="495" y1="58" x2="130" y2="130" stroke="#64748b" stroke-dasharray="4 4"/><line x1="495" y1="58" x2="320" y2="130" stroke="#64748b" stroke-dasharray="4 4"/><line x1="495" y1="58" x2="510" y2="130" stroke="#64748b" stroke-dasharray="4 4"/>
</svg><p class="cap">Solid lines: the active Panorama manages. Dashed lines: the second Panorama is known to every firewall and ready.</p></div>

<h3>What HA gives you, and what it does not</h3>
<ul>
<li>It removes the single point of failure for <b>change and visibility</b>.</li>
<li>It does not make firewalls faster or stop traffic loss. Firewall HA is a different topic.</li>
<li>It does not replace backups: a bad commit is copied to the peer too.</li>
</ul>

<p>In the course lab, <code>NK-PANORAMA</code> (192.0.2.50) is the original and <code>NK-PANORAMA-2</code> (192.0.2.51) is the new peer. The management network 192.0.2.0/24 is out of band and not drawn. The simulator teaches a tested subset: no HA link detail, encryption or heartbeat timers. For those, check the documentation for your PAN-OS version.</p>

<pre class="out">&gt; show high-availability state          (before any HA is configured, lab output)
<span class="hl">HA is not enabled.</span></pre>

<div class="scn"><h4>The Friday night block</h4><p>A single Panorama in a data centre lost its disk during a power event on a Friday night. Branch traffic was fine, but a new malware domain needed blocking and the team could not push the rule or search logs for infected hosts until Monday. Management asked for a second Panorama the next week.</p><p><b>Lesson:</b> the cost of a Panorama outage is measured in lost change and lost visibility, not in dropped packets.</p></div>

<div class="iv"><p class="q">"If Panorama goes down, does your branch traffic stop?"</p><p>No. Firewalls keep enforcing the last pushed configuration. What stops is central change, push and central visibility, and logs queue on the firewalls. That is why we build an HA pair, and why we still keep backups.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Management plane down does not mean data plane down.</li>
<li>You lose change, push and central visibility without Panorama.</li>
<li>HA pairs two Panoramas; firewalls know both.</li>
<li>HA is not a backup.</li>
</ul></div>
`,hi:`
<p><b>Is chapter mein aap seekhoge:</b> Panorama down ho to kya jaata hai, kya chalta rehta hai, aur doosra Panorama kyun samajhdaari ka investment hai. <b>Prerequisites:</b> pehle ke Panorama modules (device groups, templates, commit aur push). Is module ke labs: <code>pn-ha-build</code>, <code>pn-ha-failover</code> aur <code>pn-ha-ts</code>.</p>

<p>Railway control room socho. Control room ki light chali jaaye tab bhi trains tracks par chalti rehti hain, kyunki har driver ke paas timetable pehle se hai aur signals local kaam karte hain. Par koi timetable change nahi kar sakta, train reroute nahi kar sakta aur sab trains ek jagah nahi dekh sakta. Panorama woh control room hai aur firewalls trains. High availability (HA) matlab ek doosra control room banana jo take over kar sake.</p>

<h3>Panorama down ho to kya jaata hai</h3>
<table class="tbl">
<tr><th>Capability</th><th>Panorama up</th><th>Panorama down</th></tr>
<tr><td>Change (device groups, templates edit)</td><td>Haan, phir commit to Panorama</td><td>Central change bilkul nahi</td></tr>
<tr><td>Firewalls par push</td><td>Panorama se commit-all</td><td>Push possible nahi</td></tr>
<tr><td>Visibility (central logs, device list, jobs)</td><td>Ek jagah</td><td>Wapas aane tak gayab; logs firewalls par wait karte hain</td></tr>
<tr><td>Firewalls par traffic enforcement</td><td>Chalta hai</td><td>Last pushed configuration ke saath chalta rehta hai</td></tr>
</table>
<p>Sabse zaroori line: <b>data plane management plane se independent hai</b>. Firewall woh policy enforce karta hai jo uske paas pehle se hai. To Panorama outage traffic outage nahi hai, par change outage aur visibility outage hai. Agar usi waqt security incident ho jaaye, to emergency block rule central push nahi kar sakte aur central logs search nahi kar sakte.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Panorama pair managing firewalls">
<rect x="40" y="14" width="210" height="44" rx="8" fill="#ddd6fe"/><text x="145" y="41" text-anchor="middle" class="svg-ink" font-size="13">NK-PANORAMA 192.0.2.50</text>
<rect x="390" y="14" width="210" height="44" rx="8" fill="#e2e8f0"/><text x="495" y="41" text-anchor="middle" class="svg-ink" font-size="13">NK-PANORAMA-2 192.0.2.51</text>
<line x1="250" y1="36" x2="390" y2="36" stroke="#64748b" stroke-width="2"/><text x="320" y="30" text-anchor="middle" class="svg-muted" font-size="11">HA pair</text>
<rect x="60" y="130" width="140" height="40" rx="8" fill="#bae6fd"/><text x="130" y="155" text-anchor="middle" class="svg-ink" font-size="12">PA1 Pune</text>
<rect x="250" y="130" width="140" height="40" rx="8" fill="#bae6fd"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="12">PA2 Delhi</text>
<rect x="440" y="130" width="140" height="40" rx="8" fill="#bae6fd"/><text x="510" y="155" text-anchor="middle" class="svg-ink" font-size="12">PA3 Chennai</text>
<line x1="145" y1="58" x2="130" y2="130" stroke="#64748b"/><line x1="145" y1="58" x2="320" y2="130" stroke="#64748b"/><line x1="145" y1="58" x2="510" y2="130" stroke="#64748b"/>
<line x1="495" y1="58" x2="130" y2="130" stroke="#64748b" stroke-dasharray="4 4"/><line x1="495" y1="58" x2="320" y2="130" stroke="#64748b" stroke-dasharray="4 4"/><line x1="495" y1="58" x2="510" y2="130" stroke="#64748b" stroke-dasharray="4 4"/>
</svg><p class="cap">Solid lines: active Panorama manage karta hai. Dashed lines: doosra Panorama har firewall ko pata hai aur ready hai.</p></div>

<h3>HA kya deta hai, aur kya nahi</h3>
<ul>
<li><b>Change aur visibility</b> ka single point of failure hata deta hai.</li>
<li>Firewalls ko fast nahi banata aur traffic loss nahi rokta. Firewall HA alag topic hai.</li>
<li>Backup ka replacement nahi hai: bad commit peer par bhi copy ho jaata hai.</li>
</ul>

<p>Course lab mein <code>NK-PANORAMA</code> (192.0.2.50) original hai aur <code>NK-PANORAMA-2</code> (192.0.2.51) naya peer. Management network 192.0.2.0/24 out of band hai aur drawn nahi hai. Simulator tested subset sikhata hai: HA link detail, encryption ya heartbeat timers nahi. Unke liye apne PAN-OS version ki documentation check karo.</p>

<pre class="out">&gt; show high-availability state          (HA configure hone se pehle, lab output)
<span class="hl">HA is not enabled.</span></pre>

<div class="scn"><h4>Friday night ka block</h4><p>Ek data centre ke single Panorama ki disk Friday raat power event mein kharab ho gayi. Branch traffic theek tha, par ek naye malware domain ko block karna tha aur team Monday tak rule push nahi kar payi aur infected hosts ke liye logs search nahi kar payi. Management ne agle hafte doosra Panorama maanga.</p><p><b>Lesson:</b> Panorama outage ki keemat lost change aur lost visibility mein naapi jaati hai, dropped packets mein nahi.</p></div>

<div class="iv"><p class="q">"Panorama down ho jaaye to kya aapka branch traffic ruk jaata hai?"</p><p>Nahi. Firewalls last pushed configuration enforce karte rehte hain. Jo rukta hai woh central change, push aur central visibility hai, aur logs firewalls par queue hote hain. Isliye HA pair banate hain, aur phir bhi backups rakhte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Management plane down ka matlab data plane down nahi.</li>
<li>Panorama ke bina change, push aur central visibility jaate hain.</li>
<li>HA do Panorama ko pair karta hai; firewalls dono ko jaante hain.</li>
<li>HA backup nahi hai.</li>
</ul></div>
`}};export{e as default};