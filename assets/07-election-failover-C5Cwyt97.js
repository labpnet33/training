var e={id:`election-failover`,h:{en:`Priority, preemption, HA states and how failover happens`,hi:`Priority, preemption, HA states aur failover kaise hota hai`},body:{en:`
<p>Two firewalls need a fair way to decide who is in charge, like two drivers agreeing who takes the wheel after a break. This chapter covers the <b>election</b>, the <b>HA states</b> a unit moves through, <b>preemption</b>, the timers that control it, and how a failover actually happens, step by step.</p>

<h3>The states</h3>
<table class="cmp"><tr><th>State</th><th>Meaning</th></tr>
<tr><td>Initial</td><td>HA is starting and the firewall is looking for its peer. Short-lived.</td></tr>
<tr><td>Tentative</td><td>The firewall is still deciding or negotiating, for example after a monitor failure or while waiting to join.</td></tr>
<tr><td>Active</td><td>Forwards traffic. In active/passive only one unit is active.</td></tr>
<tr><td>Passive</td><td>Healthy, synchronised and waiting. Does not forward.</td></tr>
<tr><td>Non-functional</td><td>A fault, such as a version mismatch or failed health check. Cannot take the active role.</td></tr>
<tr><td>Suspended</td><td>An administrator has deliberately taken the unit out of the election.</td></tr>
</table>

<h3>How the election chooses</h3>
<ol>
<li>If only one unit is healthy and present, it becomes active.</li>
<li>If both are healthy, the lower <b>device priority</b> value wins (default 100).</li>
<li>If priorities are equal, a tie-break uses a fixed identifier, such as the management interface MAC, so the choice is still deterministic.</li>
</ol>
<p>Without preemption, the election matters only when a unit joins an empty pair or when the active one fails. A recovering higher-priority unit does <b>not</b> take back the role. With <b>preemption</b> on both units, it does.</p>

<h3>Preemption and its timers</h3>
<dl class="terms">
<dt>Preemptive</dt><dd>When enabled on both firewalls, the unit with the better priority takes over as soon as it is healthy again. When off, the current active unit stays active.</dd>
<dt>Preemption hold time</dt><dd>How long the recovered unit waits before preempting (default 1 minute). It prevents taking the role back before everything has settled.</dd>
<dt>Promotion hold time</dt><dd>How long the passive unit waits after it detects the peer is lost before promoting itself (default 2000 ms).</dd>
<dt>Hello and heartbeat intervals</dt><dd>Defaults of 8000 ms and 1000 ms; failure declared after several misses.</dd>
<dt>Additional master hold up time</dt><dd>A small delay (default 500 ms) that lets the new active unit prepare after being promoted.</dd>
<dt>Monitor fail hold up time</dt><dd>Delay before reacting to a link failure, to ride out brief flaps (default 0).</dd>
</dl>
<p>These are tuning knobs. The defaults suit most sites; lower them only after testing, because aggressive timers risk false failovers.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Failover sequence">
<rect x="10" y="20" width="120" height="50" rx="10" fill="#bbf7d0"/><text x="70" y="50" text-anchor="middle" class="svg-ink" font-size="13">Active fails</text>
<rect x="150" y="20" width="120" height="50" rx="10" fill="#fed7aa"/><text x="210" y="50" text-anchor="middle" class="svg-ink" font-size="13">Peer detects</text>
<rect x="290" y="20" width="120" height="50" rx="10" fill="#ddd6fe"/><text x="350" y="50" text-anchor="middle" class="svg-ink" font-size="13">Hold timers</text>
<rect x="430" y="20" width="200" height="50" rx="10" fill="#bae6fd"/><text x="530" y="50" text-anchor="middle" class="svg-ink" font-size="13">Passive becomes active</text>
<line x1="130" y1="45" x2="150" y2="45" stroke="#64748b" stroke-width="2"/><line x1="270" y1="45" x2="290" y2="45" stroke="#64748b" stroke-width="2"/><line x1="410" y1="45" x2="430" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="150" y="120" width="480" height="60" rx="10" fill="#fde68a"/><text x="390" y="145" text-anchor="middle" class="svg-ink" font-size="13">New active: brings links up, sends gratuitous ARP,</text><text x="390" y="165" text-anchor="middle" class="svg-ink" font-size="13">takes over synced sessions, renegotiates IKE if needed</text>
<line x1="530" y1="70" x2="530" y2="120" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Detection, hold timers, promotion, then the new active unit makes the network follow.</p></div>

<h3>Manual control</h3>
<p>Operational commands on PAN-OS let you move the role on purpose, for maintenance and tests. These run on the unit you want to take out of service:</p>
<pre class="code">request high-availability state suspend
request high-availability state functional
show high-availability state</pre>
<p><code>suspend</code> puts the local unit into the suspended state, so the peer becomes active (and the suspended unit does not preempt). <code>functional</code> returns it to normal operation. This is the standard way to do a clean failover test or an upgrade.</p>

<h3>Upgrade order (concept)</h3>
<ol>
<li>Back up the configuration and read the release notes.</li>
<li>Suspend the passive unit, upgrade it, reboot it, and make it functional again.</li>
<li>Check that HA is healthy. A short version mismatch between peers is tolerated during this stage.</li>
<li>Suspend the active unit to fail over to the upgraded one, upgrade the original, and make it functional.</li>
<li>Decide whether to move the role back, and check preemption settings first.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> FW-A has priority 90 and FW-B has 110, with preemption on both. FW-A loses power and FW-B becomes active after the promotion hold time. Power returns. FW-A boots, syncs and waits the 1-minute preemption hold time. It then takes the role back, causing a second brief disruption. Many sites therefore leave preemption off and move the role in a maintenance window, accepting one failover instead of two.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Turning on preemption without thinking about the second failover it causes. Each role change risks a small outage. Use it when you want a fixed primary; skip it when you prefer stability.</p></div>
<div class="exam"><p><b>Exam trap.</b> Lower priority number wins. Preemption must be set on both firewalls. A suspended unit does not take part in the election. The default preemption hold time is 1 minute.</p></div>

<div class="scn"><h4>The upgrade that kept bouncing</h4><p>During a maintenance window the engineer upgraded FW-A, the preferred primary with preemption on. When FW-A came back it preempted and took the role while the config sync was still catching up. Users had two short outages. For the next upgrade the engineer suspended the unit first, upgraded, confirmed synchronisation and only then made it functional.</p><p><b>Lesson:</b> control the role yourself during maintenance.</p></div>

<div class="iv"><p class="q">"What does preemption do and when would you disable it?"</p><p>Preemption lets the higher-priority firewall (lower number) regain the active role once it recovers, after a hold time. It gives a predictable primary but causes a second failover. I disable it where stability matters more, and move the role manually in a maintenance window. It must be configured the same on both units.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>States: initial, tentative, active, passive, non-functional, suspended.</li>
<li>Lower device priority wins; ties use a fixed identifier.</li>
<li>Preemption (default off) needs matching settings; the hold time is 1 minute by default.</li>
<li>Use suspend and functional for tests and upgrades.</li>
<li>New active unit: links up, gratuitous ARP, synced sessions, IKE renegotiated.</li>
</ul></div>
`,hi:`
<p>Do firewalls ko decide karne ka ek fair tareeka chahiye ki kaun in-charge hai, jaise do drivers break ke baad tay karte hain ki steering kaun sambhalega. Yeh chapter <b>election</b>, ek unit jin <b>HA states</b> se guzarta hai, <b>preemption</b>, use control karne wale timers, aur failover asal mein step by step kaise hota hai, yeh cover karta hai.</p>

<h3>States</h3>
<table class="cmp"><tr><th>State</th><th>Matlab</th></tr>
<tr><td>Initial</td><td>HA start ho raha hai aur firewall apne peer ko dhoondh raha hai. Chhota-umr.</td></tr>
<tr><td>Tentative</td><td>Firewall abhi decide ya negotiate kar raha hai, jaise monitor failure ke baad ya join hone ka intezaar karte waqt.</td></tr>
<tr><td>Active</td><td>Traffic forward karta hai. Active/passive mein sirf ek unit active hota hai.</td></tr>
<tr><td>Passive</td><td>Healthy, synchronised aur intezaar karta hua. Forward nahi karta.</td></tr>
<tr><td>Non-functional</td><td>Koi fault, jaise version mismatch ya failed health check. Active role nahi le sakta.</td></tr>
<tr><td>Suspended</td><td>Administrator ne unit ko jaanbujhkar election se bahar kar diya hai.</td></tr>
</table>

<h3>Election kaise chunta hai</h3>
<ol>
<li>Agar sirf ek unit healthy aur maujood hai, to woh active ban jaata hai.</li>
<li>Agar dono healthy hain, to chhoti <b>device priority</b> value jeetti hai (default 100).</li>
<li>Priorities barabar hon to tie-break ek fixed identifier se hota hai, jaise management interface MAC, taaki choice phir bhi deterministic rahe.</li>
</ol>
<p>Preemption ke bina election sirf tab matter karta hai jab koi unit khaali pair join kare ya active fail ho. Recover hone wala higher-priority unit role wapas <b>nahi</b> leta. Dono units par <b>preemption</b> on ho to leta hai.</p>

<h3>Preemption aur uske timers</h3>
<dl class="terms">
<dt>Preemptive</dt><dd>Dono firewalls par enabled ho to behtar priority wala unit healthy hote hi active role le leta hai. Off ho to maujooda active unit active hi rehta hai.</dd>
<dt>Preemption hold time</dt><dd>Recover hua unit preempt karne se pehle kitna ruke (default 1 minute). Yeh sab kuch settle hone se pehle role wapas lene se rokta hai.</dd>
<dt>Promotion hold time</dt><dd>Peer lost detect karne ke baad passive unit khud ko promote karne se pehle kitna ruke (default 2000 ms).</dd>
<dt>Hello aur heartbeat intervals</dt><dd>Defaults 8000 ms aur 1000 ms; kai misses ke baad failure declare hota hai.</dd>
<dt>Additional master hold up time</dt><dd>Chhoti delay (default 500 ms) jo promote hone ke baad naye active unit ko taiyaar hone deti hai.</dd>
<dt>Monitor fail hold up time</dt><dd>Chhote flaps ko jhelne ke liye link failure par react karne se pehle delay (default 0).</dd>
</dl>
<p>Yeh tuning knobs hain. Defaults zyadatar sites ke liye theek hain; inhe test karne ke baad hi kam karo, kyunki aggressive timers false failovers ka risk badhate hain.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Failover sequence">
<rect x="10" y="20" width="120" height="50" rx="10" fill="#bbf7d0"/><text x="70" y="50" text-anchor="middle" class="svg-ink" font-size="13">Active fail</text>
<rect x="150" y="20" width="120" height="50" rx="10" fill="#fed7aa"/><text x="210" y="50" text-anchor="middle" class="svg-ink" font-size="13">Peer detect</text>
<rect x="290" y="20" width="120" height="50" rx="10" fill="#ddd6fe"/><text x="350" y="50" text-anchor="middle" class="svg-ink" font-size="13">Hold timers</text>
<rect x="430" y="20" width="200" height="50" rx="10" fill="#bae6fd"/><text x="530" y="50" text-anchor="middle" class="svg-ink" font-size="13">Passive banta hai active</text>
<line x1="130" y1="45" x2="150" y2="45" stroke="#64748b" stroke-width="2"/><line x1="270" y1="45" x2="290" y2="45" stroke="#64748b" stroke-width="2"/><line x1="410" y1="45" x2="430" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="150" y="120" width="480" height="60" rx="10" fill="#fde68a"/><text x="390" y="145" text-anchor="middle" class="svg-ink" font-size="13">Naya active: links up, gratuitous ARP bhejta hai,</text><text x="390" y="165" text-anchor="middle" class="svg-ink" font-size="13">synced sessions sambhalta hai, zaroorat par IKE renegotiate</text>
<line x1="530" y1="70" x2="530" y2="120" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Detection, hold timers, promotion, phir naya active unit network ko apne peeche laata hai.</p></div>

<h3>Manual control</h3>
<p>PAN-OS ke operational commands role ko jaanbujhkar move karne dete hain, maintenance aur tests ke liye. Yeh us unit par chalte hain jise service se hatana hai:</p>
<pre class="code">request high-availability state suspend
request high-availability state functional
show high-availability state</pre>
<p><code>suspend</code> local unit ko suspended state mein daalta hai, isliye peer active ban jaata hai (aur suspended unit preempt nahi karta). <code>functional</code> use normal operation mein wapas laata hai. Clean failover test ya upgrade ka yahi standard tareeka hai.</p>

<h3>Upgrade order (concept)</h3>
<ol>
<li>Configuration ka backup lo aur release notes padho.</li>
<li>Passive unit ko suspend karo, upgrade karo, reboot karo, aur use phir functional banao.</li>
<li>Check karo ki HA healthy hai. Is stage mein peers ke beech chhota version mismatch tolerate hota hai.</li>
<li>Active unit ko suspend karke upgraded unit par failover karo, original ko upgrade karo, aur use functional banao.</li>
<li>Tay karo ki role wapas move karna hai ya nahi, aur pehle preemption settings check karo.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> FW-A ki priority 90 hai aur FW-B ki 110, dono par preemption on. FW-A ki power chali jaati hai aur promotion hold time ke baad FW-B active ban jaata hai. Power wapas aati hai. FW-A boot hota hai, sync karta hai aur 1-minute preemption hold time ruka rehta hai. Phir woh role wapas leta hai, jisse doosra chhota disruption hota hai. Isliye kai sites preemption off rakhte hain aur maintenance window mein role move karte hain, do failovers ki jagah ek ko accept karke.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Preemption on karna bina us doosre failover ke baare mein socha jo woh karata hai. Har role change se chhote outage ka risk hota hai. Fixed primary chahiye to use karo; stability pasand ho to skip karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Chhota priority number jeetta hai. Preemption dono firewalls par set hona chahiye. Suspended unit election mein hissa nahi leta. Default preemption hold time 1 minute hai.</p></div>

<div class="scn"><h4>Woh upgrade jo baar-baar bounce karta raha</h4><p>Maintenance window mein engineer ne FW-A upgrade kiya, jo preferred primary hai aur jis par preemption on thi. FW-A wapas aaya to usne preempt karke role le liya jabki config sync abhi catch up kar raha tha. Users ko do chhote outages mile. Agle upgrade mein engineer ne pehle unit ko suspend kiya, upgrade kiya, synchronisation confirm ki aur tabhi use functional banaya.</p><p><b>Lesson:</b> maintenance ke dauraan role ko khud control karo.</p></div>

<div class="iv"><p class="q">"Preemption kya karta hai aur kab disable karoge?"</p><p>Preemption higher-priority firewall (chhota number) ko recover hone ke baad, hold time ke baad, active role wapas lene deta hai. Yeh predictable primary deta hai lekin doosra failover karata hai. Jahan stability zyada important ho wahan main ise disable karta hoon aur maintenance window mein role manually move karta hoon. Ise dono units par same configure karna padta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>States: initial, tentative, active, passive, non-functional, suspended.</li>
<li>Chhota device priority jeetta hai; ties fixed identifier se tay hoti hain.</li>
<li>Preemption (default off) ko matching settings chahiye; hold time default 1 minute.</li>
<li>Tests aur upgrades ke liye suspend aur functional use karo.</li>
<li>Naya active unit: links up, gratuitous ARP, synced sessions, IKE renegotiate.</li>
</ul></div>
`}};export{e as default};