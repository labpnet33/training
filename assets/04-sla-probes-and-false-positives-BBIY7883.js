var e={id:`sla-probes-and-false-positives`,h:{en:`SLA probes and false positives`,hi:`SLA probes aur false positives`},body:{en:`
<h3>Why probe at all?</h3>
<p>Polling tells you how a router feels: its CPU, its interface counters. It does not tell you whether a user in Kochi can open the ERP page. A <b>synthetic probe</b> (also called an SLA probe or IP SLA style test) is a small robot user. A router sends a tiny test request at fixed intervals to a destination, measures the answer and records latency, loss and jitter. Think of a courier who delivers a test envelope every minute, so you know the road is open before real parcels depend on it. Probes measure the path as a user sees it, and they work even when nobody is using the service at night.</p>

<h3>The four probe types</h3>
<table class="cmp"><tr><th>Type</th><th>What it sends</th><th>Tells you</th></tr>
<tr><td>icmp</td><td>Echo request (like ping)</td><td>Is the destination reachable, round-trip time, loss</td></tr>
<tr><td>h&#116;tp</td><td>A web request to a service</td><td>Does the application answer, and how fast (5xx errors count as failure)</td></tr>
<tr><td>dns</td><td>A name lookup</td><td>Can names be resolved, resolution time</td></tr>
<tr><td>udp-jitter</td><td>A stream of small UDP packets</td><td>Latency, loss and <b>jitter</b> (variation in delay), which matters for voice</td></tr>
</table>
<p>The console seeds four probes: <code>p-erp</code> (h&#116;tp from R-KCH to SRV-HYD, latency threshold 100 ms), <code>p-link-kch</code> (icmp from R-HYD to R-KCH), <code>p-dns</code> (dns from R-LKO to SRV-HYD) and <code>p-voice</code> (udp-jitter from R-HYD to R-LKO).</p>

<h3>Choosing source and destination</h3>
<p>A probe is only as honest as where it stands. The <b>source</b> should sit where the user sits: a Kochi user reaches the ERP through R-KCH, so the probe source is R-KCH, not a router in Hyderabad. The <b>destination</b> should be the service itself (SRV-HYD), not the router in front of it, otherwise you test the road but not the shop. The probe record has an <code>expectSource</code> field that states which user-side source the probe stands for; if source and expectSource differ, the numbers describe a different path from the users'.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Probe path with primary and backup">
<rect x="10" y="70" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="95" text-anchor="middle" class="svg-ink" font-size="13">R-KCH</text><text x="65" y="115" text-anchor="middle" class="svg-muted" font-size="12">probe source</text>
<rect x="260" y="20" width="120" height="50" rx="10" fill="#bbf7d0"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Primary path</text>
<rect x="260" y="140" width="120" height="50" rx="10" fill="#fed7aa"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">Backup path</text>
<rect x="520" y="70" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="575" y="95" text-anchor="middle" class="svg-ink" font-size="13">SRV-HYD</text><text x="575" y="115" text-anchor="middle" class="svg-muted" font-size="12">the service</text>
<line x1="120" y1="90" x2="260" y2="45" stroke="#64748b" stroke-width="2"/><line x1="380" y1="45" x2="520" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="120" y1="110" x2="260" y2="165" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><line x1="380" y1="165" x2="520" y2="110" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
</svg><p class="cap">The probe can follow the active path, or be pinned to primary or backup.</p></div>

<h3>Interval, timeout, retries and thresholds</h3>
<ul>
<li><b>Interval:</b> how often a probe runs. Shorter finds problems sooner but adds load.</li>
<li><b>Timeout:</b> how long one attempt waits for an answer before it counts as lost. It must be larger than the normal latency with room to spare, because it is the line between slow and gone.</li>
<li><b>Retries:</b> extra attempts before the cycle is called failed. In the console a probe runs 12 cycles with retries plus one attempts each; a cycle fails only when every attempt is lost or slower than the timeout.</li>
<li><b>Thresholds:</b> latency, loss percent and jitter limits for degraded or failed.</li>
</ul>
<p>The verdict is <code>ok</code>, <code>degraded</code>, <code>fail</code> or <code>none</code>, with a reason such as <code>timeout</code>, <code>loss</code>, <code>latency</code>, <code>jitter</code>, <code>unreachable</code>, <code>h&#116;tp-5xx</code>, <code>dns-fail</code> or <code>disabled</code>.</p>

<h3>False positives and false negatives</h3>
<p>A <b>false positive</b> is an alarm when users are fine. A <b>false negative</b> is silence when users suffer. Both erode trust. The console can name the cause of a false positive when the probe is not ok but the real user path is healthy:</p>
<table class="cmp"><tr><th>Cause</th><th>What is wrong</th><th>Fix</th></tr>
<tr><td>timeout-too-tight</td><td>Timeout below normal latency</td><td>Raise timeout well above typical latency</td></tr>
<tr><td>single-retry</td><td>One lost packet fails the cycle</td><td>Allow retries (2 is common)</td></tr>
<tr><td>wrong-source</td><td>Probe stands where users do not</td><td>Move source to the user-side router</td></tr>
<tr><td>backup-path</td><td>Probe pinned to a degraded or idle backup</td><td>Follow the active path, or probe backup with its own rule</td></tr>
<tr><td>threshold-too-tight</td><td>Limit tighter than the SLA needs</td><td>Set the limit from the SLA, not from a guess</td></tr>
</table>

<h3>Probing the backup path</h3>
<p>If the backup circuit (BB-HYD-02 at Hyderabad, for example) is never tested, you discover that it is broken at the worst moment, during a failover. So probe it deliberately, with <b>Path: backup</b>, but give that probe its own rule at lower severity. Do not let a backup probe page anybody because the backup being slow is not a user outage; the backup being down is a risk to fix in office hours.</p>

<h3>Worked walkthrough: lab obs-alert-3</h3>
<p>Open SLA probes. Press <b>Add probe</b> or open an existing card with <b>Edit</b>. Choose the type, the source router, the destination, the path (follow the active path), interval, timeout, retries, and the three thresholds. Then check the verdict badge on the card. <i>What does this change on the wire/policy?</i> A probe adds real test packets from the source router to the destination every interval, so it also adds a little load and may show up in flow records. Alert rules can then use the probe's result, so probes feed the alerting chain from the previous chapters.</p>

<h3>Worked walkthrough: lab obs-alert-4, the false positive</h3>
<p>The ticket: the ERP probe from Kochi keeps failing but Kochi users say the ERP is fine. In the seed the <code>p-erp</code> probe has a timeout of 20 ms and no retry. The normal Kochi to Hyderabad latency is around 40 ms, so every cycle times out.</p>
<pre class="out">SLA probes
p-erp   h&#116;tp   R-KCH to SRV-HYD   path active   timeout 20 ms   retries 0   <span class="hl">fail (timeout)</span>
        user path: healthy, latency 41 ms, loss 0.0 percent
        false positive cause: timeout-too-tight, single-retry</pre>
<p>Edit the card: <b>Timeout 2000</b> ms and <b>Retries 2</b>, keep the latency threshold at 100 ms, Apply. The verdict returns to ok while a real slow-down above 100 ms still shows as degraded. Notice we fixed the probe, not the user path, and we did not raise the latency threshold just to silence it.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Timeout equal to the SLA threshold, so any slow reply counts as lost. (2) Probing from a router the users never use. (3) Pinning a probe to backup and paging on it. (4) Fixing a false positive by loosening everything, which creates false negatives.</p></div>
<div class="exam"><p><b>Exam trap.</b> Timeout and latency threshold are different things: the timeout decides lost or not, the threshold decides good or degraded. Jitter is variation of delay, not delay itself.</p></div>

<div class="scn"><h4>The 02:00 failure that was not</h4><p>Priya Nair was paged because the voice probe between Hyderabad and Lucknow failed once. Users reported nothing. The probe ran with one attempt and a 150 ms timeout, and one packet in a night was dropped. With retries set to 2 and the jitter limit taken from the SLA, the single drop no longer failed a cycle.</p><p><b>Lesson:</b> a probe should fail for the user's reasons, not its own.</p></div>

<div class="iv"><p class="q">"Your SLA probe says down but users are happy. What do you check?"</p><p>Compare with the user path, then check timeout against real latency, retries, source router, path (active or backup) and thresholds against the SLA. Fix the probe configuration and confirm with a Live tools ping or capture.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Probes are synthetic users: icmp, h&#116;tp, dns and udp-jitter.</li>
<li>Put the source where users are and the destination on the service.</li>
<li>Timeout, retries and thresholds define fail and degraded.</li>
<li>False positive causes: tight timeout, single retry, wrong source, backup path, tight threshold.</li>
<li>Probe the backup path, but with a separate, lower-severity rule.</li>
</ul></div>
`,hi:`
<h3>Probe karte hi kyun hain?</h3>
<p>Polling batata hai ki router kaisa feel kar raha hai: uska CPU, interface counters. Yeh nahi batata ki Kochi ka user ERP page khol sakta hai ya nahi. <b>Synthetic probe</b> (SLA probe ya IP SLA style test bhi kehte hain) chhota robot user hai. Router fixed intervals par destination ko chhota test request bhejta hai, jawab measure karta hai aur latency, loss aur jitter record karta hai. Aise courier socho jo har minute test envelope deliver karta hai, taaki asli parcels ke bharose se pehle aapko pata ho ki sadak khuli hai. Probes path ko waise measure karte hain jaise user dekhta hai, aur raat ko jab koi service use nahi kar raha tab bhi kaam karte hain.</p>

<h3>Chaar probe types</h3>
<table class="cmp"><tr><th>Type</th><th>Kya bhejta hai</th><th>Kya batata hai</th></tr>
<tr><td>icmp</td><td>Echo request (ping jaisa)</td><td>Destination reachable hai ya nahi, round-trip time, loss</td></tr>
<tr><td>h&#116;tp</td><td>Service ko web request</td><td>Application jawab deta hai ya nahi, aur kitni tez (5xx errors failure maane jaate hain)</td></tr>
<tr><td>dns</td><td>Name lookup</td><td>Names resolve ho sakte hain ya nahi, resolution time</td></tr>
<tr><td>udp-jitter</td><td>Chhote UDP packets ki stream</td><td>Latency, loss aur <b>jitter</b> (delay ka variation), jo voice ke liye zaroori hai</td></tr>
</table>
<p>Console chaar probes seed karta hai: <code>p-erp</code> (R-KCH se SRV-HYD tak h&#116;tp, latency threshold 100 ms), <code>p-link-kch</code> (R-HYD se R-KCH icmp), <code>p-dns</code> (R-LKO se SRV-HYD dns) aur <code>p-voice</code> (R-HYD se R-LKO udp-jitter).</p>

<h3>Source aur destination chunna</h3>
<p>Probe utna hi imaandar hai jahan woh khada hai. <b>Source</b> wahan hona chahiye jahan user baitha hai: Kochi ka user ERP tak R-KCH se jaata hai, to probe source R-KCH hai, Hyderabad ka router nahi. <b>Destination</b> service khud (SRV-HYD) honi chahiye, uske aage ka router nahi, warna aap sadak test karte ho dukaan nahi. Probe record mein <code>expectSource</code> field hai jo batata hai ki probe kis user-side source ki jagah khada hai; agar source aur expectSource alag hain to numbers users se alag path describe karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Primary aur backup ke saath probe path">
<rect x="10" y="70" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="95" text-anchor="middle" class="svg-ink" font-size="13">R-KCH</text><text x="65" y="115" text-anchor="middle" class="svg-muted" font-size="12">probe source</text>
<rect x="260" y="20" width="120" height="50" rx="10" fill="#bbf7d0"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Primary path</text>
<rect x="260" y="140" width="120" height="50" rx="10" fill="#fed7aa"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">Backup path</text>
<rect x="520" y="70" width="110" height="60" rx="10" fill="#ddd6fe"/><text x="575" y="95" text-anchor="middle" class="svg-ink" font-size="13">SRV-HYD</text><text x="575" y="115" text-anchor="middle" class="svg-muted" font-size="12">service</text>
<line x1="120" y1="90" x2="260" y2="45" stroke="#64748b" stroke-width="2"/><line x1="380" y1="45" x2="520" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="120" y1="110" x2="260" y2="165" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><line x1="380" y1="165" x2="520" y2="110" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
</svg><p class="cap">Probe active path follow kar sakta hai, ya primary ya backup par pin ho sakta hai.</p></div>

<h3>Interval, timeout, retries aur thresholds</h3>
<ul>
<li><b>Interval:</b> probe kitni baar chalta hai. Chhota problems jaldi pakadta hai lekin load badhata hai.</li>
<li><b>Timeout:</b> ek attempt jawab ke liye kitna wait karta hai phir lost maana jaata hai. Yeh normal latency se kaafi badi honi chahiye, kyunki yehi slow aur gone ke beech ki line hai.</li>
<li><b>Retries:</b> cycle ko failed kehne se pehle extra attempts. Console mein probe 12 cycles chalata hai, har ek mein retries plus ek attempts; cycle tabhi fail hota hai jab har attempt lost ya timeout se dheemi ho.</li>
<li><b>Thresholds:</b> degraded ya failed ke liye latency, loss percent aur jitter limits.</li>
</ul>
<p>Verdict <code>ok</code>, <code>degraded</code>, <code>fail</code> ya <code>none</code> hota hai, reason ke saath jaise <code>timeout</code>, <code>loss</code>, <code>latency</code>, <code>jitter</code>, <code>unreachable</code>, <code>h&#116;tp-5xx</code>, <code>dns-fail</code> ya <code>disabled</code>.</p>

<h3>False positives aur false negatives</h3>
<p><b>False positive</b> woh alarm hai jab users theek hain. <b>False negative</b> woh chuppi hai jab users takleef mein hain. Dono bharosa todte hain. Jab probe ok nahi lekin asli user path healthy hai, to console false positive ka cause bata sakta hai:</p>
<table class="cmp"><tr><th>Cause</th><th>Kya galat hai</th><th>Fix</th></tr>
<tr><td>timeout-too-tight</td><td>Timeout normal latency se kam</td><td>Timeout ko typical latency se kaafi upar karo</td></tr>
<tr><td>single-retry</td><td>Ek lost packet cycle fail kar deta hai</td><td>Retries allow karo (2 common hai)</td></tr>
<tr><td>wrong-source</td><td>Probe wahan khada hai jahan users nahi</td><td>Source ko user-side router par le jao</td></tr>
<tr><td>backup-path</td><td>Probe degraded ya idle backup par pin hai</td><td>Active path follow karo, ya backup ko apne rule se probe karo</td></tr>
<tr><td>threshold-too-tight</td><td>Limit SLA ki zaroorat se zyada tight</td><td>Limit SLA se set karo, andaze se nahi</td></tr>
</table>

<h3>Backup path ko probe karna</h3>
<p>Agar backup circuit (jaise Hyderabad ka BB-HYD-02) kabhi test nahi hota, to aapko sabse bure waqt, failover ke dauraan, pata chalta hai ki woh toota hai. To use jaanbujh kar probe karo, <b>Path: backup</b> ke saath, lekin us probe ko apna alag rule do, kam severity ke saath. Backup probe se kisi ko page mat karo, kyunki backup ka slow hona user outage nahi hai; backup ka down hona risk hai jo office hours mein fix hota hai.</p>

<h3>Worked walkthrough: lab obs-alert-3</h3>
<p>SLA probes kholo. <b>Add probe</b> dabao ya maujooda card par <b>Edit</b> kholo. Type, source router, destination, path (active path follow karo), interval, timeout, retries aur teen thresholds chuno. Phir card par verdict badge dekho. <i>Wire/policy par kya badalta hai?</i> Probe har interval par source router se destination tak asli test packets jodta hai, to thoda load bhi badhata hai aur flow records mein dikh sakta hai. Alert rules phir probe ka result use kar sakte hain, to probes pichhle chapters ki alerting chain ko feed karte hain.</p>

<h3>Worked walkthrough: lab obs-alert-4, false positive</h3>
<p>Ticket: Kochi se ERP probe fail ho raha hai lekin Kochi ke users kehte hain ERP theek hai. Seed mein <code>p-erp</code> probe ka timeout 20 ms hai aur koi retry nahi. Kochi se Hyderabad ki normal latency lagbhag 40 ms hai, to har cycle timeout ho jaata hai.</p>
<pre class="out">SLA probes
p-erp   h&#116;tp   R-KCH to SRV-HYD   path active   timeout 20 ms   retries 0   <span class="hl">fail (timeout)</span>
        user path: healthy, latency 41 ms, loss 0.0 percent
        false positive cause: timeout-too-tight, single-retry</pre>
<p>Card edit karo: <b>Timeout 2000</b> ms aur <b>Retries 2</b>, latency threshold 100 ms rakho, Apply. Verdict ok ho jaata hai jabki 100 ms se upar ki asli slow-down ab bhi degraded dikhegi. Dhyan do ki hamne probe fix kiya, user path nahi, aur sirf chup karane ke liye latency threshold nahi badhaya.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Timeout SLA threshold ke barabar rakhna, to har slow reply lost ginti hai. (2) Aise router se probe karna jo users kabhi use nahi karte. (3) Probe ko backup par pin karke us par page karna. (4) False positive ko sab loose karke fix karna, jisse false negatives bante hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Timeout aur latency threshold alag cheezein hain: timeout decide karta hai lost ya nahi, threshold decide karta hai good ya degraded. Jitter delay ka variation hai, delay khud nahi.</p></div>

<div class="scn"><h4>02:00 ka failure jo tha hi nahi</h4><p>Priya Nair ko page hua kyunki Hyderabad aur Lucknow ke beech voice probe ek baar fail hua. Users ne kuch report nahi kiya. Probe ek attempt aur 150 ms timeout par chal raha tha, aur raat mein ek packet drop hua. Retries 2 aur SLA se li hui jitter limit ke baad ek drop ab cycle fail nahi karta.</p><p><b>Seekh:</b> probe ko user ki wajah se fail hona chahiye, apni wajah se nahi.</p></div>

<div class="iv"><p class="q">"Aapka SLA probe down bol raha hai lekin users khush hain. Kya check karoge?"</p><p>User path se compare karo, phir timeout ko asli latency se, retries, source router, path (active ya backup) aur thresholds ko SLA se check karo. Probe configuration fix karo aur Live tools ping ya capture se confirm karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Probes synthetic users hain: icmp, h&#116;tp, dns aur udp-jitter.</li>
<li>Source wahan rakho jahan users hain aur destination service par.</li>
<li>Timeout, retries aur thresholds fail aur degraded define karte hain.</li>
<li>False positive causes: tight timeout, single retry, wrong source, backup path, tight threshold.</li>
<li>Backup path ko probe karo, lekin alag, kam-severity rule se.</li>
</ul></div>
`}};export{e as default};