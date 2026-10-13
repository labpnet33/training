var e={id:`troubleshooting`,h:{en:`RF troubleshooting workflow`,hi:`RF troubleshooting workflow`},body:{en:`
<p>RF faults feel vague ("Wi-Fi is slow", "it drops near the stairs") but a fixed order of questions turns them into evidence. This chapter gives you a workflow that uses controller commands first, then client views, and applies it to the three labs of this module.</p>

<h3>Step 0: define the symptom precisely</h3>
<p>Ask: which clients, which band, which place, since when, what changed? "Only the 5 GHz-only handsets" is a different problem from "everyone near AP2". A recent change window is the single best clue. Also decide whether the problem is <b>no service</b> (client cannot find or join the SSID), <b>poor service</b> (joins but slow or drops) or <b>wrong service</b> (joins the wrong VLAN: that belongs to the policy chapters of wl-start and wl-roaming).</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="RF troubleshooting decision flow">
<rect x="200" y="10" width="240" height="36" rx="8" fill="#bae6fd"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Client cannot find or join the SSID?</text>
<rect x="20" y="80" width="260" height="60" rx="8" fill="#fed7aa"/><text x="150" y="102" text-anchor="middle" class="svg-ink" font-size="12">YES: radio or tag problem</text><text x="150" y="122" text-anchor="middle" class="svg-muted" font-size="11">band off? RF profile down? country? policy tag?</text>
<rect x="360" y="80" width="260" height="60" rx="8" fill="#bbf7d0"/><text x="490" y="102" text-anchor="middle" class="svg-ink" font-size="12">NO: joins but poor</text><text x="490" y="122" text-anchor="middle" class="svg-muted" font-size="11">channels, power, rates, SNR, retries</text>
<line x1="270" y1="46" x2="150" y2="80" stroke="#64748b"/><line x1="370" y1="46" x2="490" y2="80" stroke="#64748b"/>
<rect x="20" y="170" width="260" height="60" rx="8" fill="#ddd6fe"/><text x="150" y="196" text-anchor="middle" class="svg-ink" font-size="12">show ap dot11 5ghz|24ghz summary</text><text x="150" y="214" text-anchor="middle" class="svg-ink" font-size="12">show ap rf-profile summary</text>
<rect x="360" y="170" width="260" height="60" rx="8" fill="#ddd6fe"/><text x="490" y="196" text-anchor="middle" class="svg-ink" font-size="12">show ap dot11 ... summary</text><text x="490" y="214" text-anchor="middle" class="svg-ink" font-size="12">client detail: RSSI, band, channel</text>
<line x1="150" y1="140" x2="150" y2="170" stroke="#64748b"/><line x1="490" y1="140" x2="490" y2="170" stroke="#64748b"/>
</svg><p class="cap">Start by classifying the failure, then read the radio tables.</p></div>

<h3>The seven-step workflow</h3>
<ol>
<li><b>Confirm the AP is joined and tagged.</b> <code>show ap summary</code> and <code>show ap tag summary</code>. An AP without a policy tag serves no SSID at all (a wl-start problem), so rule it out in seconds.</li>
<li><b>Read the radio tables per band.</b> <code>show ap dot11 24ghz summary</code> and <code>show ap dot11 5ghz summary</code>: Status (Enabled or Disabled), Channel, Power Level. This single table answers co-channel overlap, dead band and wrong power.</li>
<li><b>Read the RF profiles.</b> <code>show ap rf-profile summary</code>: State Up or Down and Max TX power. Compare with the RF tag assigned to each AP.</li>
<li><b>Look at the client.</b> <code>show wireless client summary</code> and <code>show wireless client mac-address MAC detail</code>: band, channel, RSSI, AP name. A 2.4 GHz-only device on a dead 2.4 GHz band explains itself.</li>
<li><b>Compare against the plan.</b> Are neighbouring APs on different channels (1, 6, 11 in 2.4 GHz)? Is power appropriate? Is any manual pin still there? Check the running config: <code>show running-config | include dot11</code>.</li>
<li><b>Change one thing.</b> Fix the smallest object that owns the fault, and re-read the same table.</li>
<li><b>Prove it from the client.</b> <code>wifi status</code> and <code>ping 10.10.60.20</code>. Save with <code>write memory</code>.</li>
</ol>

<h3>Symptom to cause table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Evidence</th><th>Fix</th></tr>
<tr><td>Slow near the AP1/AP2 boundary</td><td>Same or overlapping 2.4 GHz channel</td><td>Both radios on channel 6</td><td>ap name AP1 dot11 24ghz channel 1</td></tr>
<tr><td>Slow everywhere in dense area</td><td>Power too high, overlapping cells</td><td>Many APs level 1</td><td>RF profile tx-power max, lower levels</td></tr>
<tr><td>5 GHz-only client sees no SSID</td><td>5 GHz band or RF profile off</td><td>Radios Disabled, profile Down</td><td>no shutdown in the RF profile</td></tr>
<tr><td>Client far away, full bars, no connection</td><td>AP power too high for client</td><td>Strong downlink, retries</td><td>Lower AP power</td></tr>
<tr><td>Both bands dead after rollout</td><td>Country or site tag issue</td><td>Radios off on both bands</td><td>See wl-control module</td></tr>
<tr><td>Joins, no IP</td><td>Not RF: policy VLAN or DHCP</td><td>Client has no address</td><td>See wl-start and wl-roaming</td></tr>
</table>

<h3>Walking the three labs with the workflow</h3>
<p><b>wl-co-channel.</b> Symptom: slow near the boundary; LAPTOP1 is 2.4 GHz-only. Step 2 shows channel 6 on both AP radios. Change one thing per radio: AP1 to channel 1 (AP2 stays on 6). Prove with the table and the client.</p>
<p><b>wl-rf-power.</b> This is a change task, not a fault. Steps: create CAMPUS-5 with a cap and no shutdown; create RF-CAMPUS pointing to it; tag AP1 and AP2; read the table: level 3 on both; prove LAPTOP1 on 5 GHz. If LAPTOP1 loses connection, you went too low for that position, and you raise the cap one step.</p>
<p><b>wl-band-shutdown.</b> Symptom: 5 GHz-only handset sees nothing. Step 2: 5 GHz radios Disabled. Step 3: CAMPUS-5 Down. Fix: <code>no shutdown</code> in the profile. Prove with the 5 GHz client.</p>

<pre class="code">WLC1# show ap rf-profile summary
WLC1# show running-config | include dot11
WLC1# show ap dot11 5ghz summary</pre>
<pre class="out">RF Profile Name                Band    State     Max TX power
-----------------------------------------------------------------
CAMPUS-5                       5 GHz   <span class="hl">Down</span>      14 dBm
ap dot11 5ghz rf-profile CAMPUS-5
AP1                  All      0011.2233.4402  <span class="hl">Disabled</span>  36       3</pre>

<div class="warn"><p><b>Common mistakes.</b> Changing three things at once and not knowing which one fixed it; testing with a client that does not support the band; stopping at "RSSI looks good"; forgetting to check that you did not break the other band; leaving a temporary pin in the configuration.</p></div>
<div class="exam"><p><b>Exam trap.</b> The order matters: classify (no service, poor service, wrong service) before touching the configuration. Questions often give a symptom and ask for the "first" command: the radio summary is usually a better first step than a reboot or a rebuild.</p></div>

<div class="scn"><h4>Friday change, Monday outage</h4><p>On Friday an engineer created a 5 GHz RF profile for a new design and bound it to a tag on all APs, intending to enable it later. Monday morning, the new phones (5 GHz only) could not connect while 2.4 GHz laptops worked. The engineer used the workflow: radios Disabled on 5 GHz, profile Down. They enabled the profile in two minutes and wrote a change-checklist item: "enable the profile before tagging APs".</p><p><b>Lesson:</b> a short checklist prevents the most common RF mistakes.</p></div>

<div class="iv"><p class="q">"Walk me through how you troubleshoot slow Wi-Fi in one area."</p><p>Define the symptom and recent changes; check AP join and tags; read the radio table for channel, power and status; read the RF profile state; look at client RSSI, band and rate; compare to the plan; change one thing and verify from the client. Close by saving and documenting.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Classify first: no service, poor service or wrong service.</li>
<li>The per-band radio summary shows channel, power and status in one table.</li>
<li>Compare RF profile state with the RF tag each AP uses.</li>
<li>Change one thing, then prove it from the client with wifi status and ping.</li>
<li>Document pins and change steps so they are not forgotten.</li>
</ul></div>
`,hi:`
<p>RF faults vague lagte hain ("Wi-Fi slow hai", "stairs ke paas drop hota hai") lekin sawaalon ka ek fixed order unhe evidence mein badal deta hai. Yeh chapter aapko workflow deta hai jo pehle controller commands, phir client views use karta hai, aur ise is module ke teeno labs par lagata hai.</p>

<h3>Step 0: symptom ko precisely define karo</h3>
<p>Poochho: kaunse clients, kaunsa band, kaunsi jagah, kab se, kya badla? "Sirf 5 GHz-only handsets" "AP2 ke paas sab" se alag problem hai. Recent change window sabse achha clue hota hai. Yeh bhi decide karo ki problem <b>no service</b> hai (client SSID dhoondh ya join nahi kar sakta), <b>poor service</b> (join hota hai lekin slow ya drops) ya <b>wrong service</b> (galat VLAN mein join: yeh wl-start aur wl-roaming ke policy chapters ka hai).</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="RF troubleshooting decision flow">
<rect x="200" y="10" width="240" height="36" rx="8" fill="#bae6fd"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Client SSID nahi dhoondh ya join nahi kar paata?</text>
<rect x="20" y="80" width="260" height="60" rx="8" fill="#fed7aa"/><text x="150" y="102" text-anchor="middle" class="svg-ink" font-size="12">HAAN: radio ya tag problem</text><text x="150" y="122" text-anchor="middle" class="svg-muted" font-size="11">band off? RF profile down? country? policy tag?</text>
<rect x="360" y="80" width="260" height="60" rx="8" fill="#bbf7d0"/><text x="490" y="102" text-anchor="middle" class="svg-ink" font-size="12">NAHI: join hota hai lekin poor</text><text x="490" y="122" text-anchor="middle" class="svg-muted" font-size="11">channels, power, rates, SNR, retries</text>
<line x1="270" y1="46" x2="150" y2="80" stroke="#64748b"/><line x1="370" y1="46" x2="490" y2="80" stroke="#64748b"/>
<rect x="20" y="170" width="260" height="60" rx="8" fill="#ddd6fe"/><text x="150" y="196" text-anchor="middle" class="svg-ink" font-size="12">show ap dot11 5ghz|24ghz summary</text><text x="150" y="214" text-anchor="middle" class="svg-ink" font-size="12">show ap rf-profile summary</text>
<rect x="360" y="170" width="260" height="60" rx="8" fill="#ddd6fe"/><text x="490" y="196" text-anchor="middle" class="svg-ink" font-size="12">show ap dot11 ... summary</text><text x="490" y="214" text-anchor="middle" class="svg-ink" font-size="12">client detail: RSSI, band, channel</text>
<line x1="150" y1="140" x2="150" y2="170" stroke="#64748b"/><line x1="490" y1="140" x2="490" y2="170" stroke="#64748b"/>
</svg><p class="cap">Pehle failure classify karo, phir radio tables padho.</p></div>

<h3>Saat-step workflow</h3>
<ol>
<li><b>Confirm karo AP joined aur tagged hai.</b> <code>show ap summary</code> aur <code>show ap tag summary</code>. Policy tag ke bina AP koi SSID serve nahi karta (wl-start problem), isliye ise seconds mein rule out karo.</li>
<li><b>Har band ki radio table padho.</b> <code>show ap dot11 24ghz summary</code> aur <code>show ap dot11 5ghz summary</code>: Status (Enabled ya Disabled), Channel, Power Level. Yeh ek table co-channel overlap, dead band aur galat power ka jawab deti hai.</li>
<li><b>RF profiles padho.</b> <code>show ap rf-profile summary</code>: State Up ya Down aur Max TX power. Har AP ke assigned RF tag se compare karo.</li>
<li><b>Client dekho.</b> <code>show wireless client summary</code> aur <code>show wireless client mac-address MAC detail</code>: band, channel, RSSI, AP name. Dead 2.4 GHz band par 2.4 GHz-only device khud samjha deta hai.</li>
<li><b>Plan se compare karo.</b> Kya neighbouring APs alag channels par hain (2.4 GHz mein 1, 6, 11)? Power sahi hai? Koi manual pin bacha hai? Running config check karo: <code>show running-config | include dot11</code>.</li>
<li><b>Ek cheez badlo.</b> Sabse chhota object fix karo jo fault ka owner hai, aur wahi table dobara padho.</li>
<li><b>Client se prove karo.</b> <code>wifi status</code> aur <code>ping 10.10.60.20</code>. <code>write memory</code> se save karo.</li>
</ol>

<h3>Symptom se cause table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Evidence</th><th>Fix</th></tr>
<tr><td>AP1/AP2 boundary ke paas slow</td><td>Same ya overlapping 2.4 GHz channel</td><td>Dono radios channel 6 par</td><td>ap name AP1 dot11 24ghz channel 1</td></tr>
<tr><td>Dense area mein sab jagah slow</td><td>Power bahut high, overlapping cells</td><td>Kai APs level 1</td><td>RF profile tx-power max, levels kam</td></tr>
<tr><td>5 GHz-only client ko SSID nahi dikhta</td><td>5 GHz band ya RF profile off</td><td>Radios Disabled, profile Down</td><td>RF profile mein no shutdown</td></tr>
<tr><td>Client door, full bars, connection nahi</td><td>Client ke liye AP power bahut high</td><td>Strong downlink, retries</td><td>AP power kam karo</td></tr>
<tr><td>Rollout ke baad dono bands dead</td><td>Country ya site tag issue</td><td>Dono bands par radios off</td><td>wl-control module dekho</td></tr>
<tr><td>Join hota hai, IP nahi</td><td>RF nahi: policy VLAN ya DHCP</td><td>Client ke paas address nahi</td><td>wl-start aur wl-roaming dekho</td></tr>
</table>

<h3>Workflow ke saath teeno labs</h3>
<p><b>wl-co-channel.</b> Symptom: boundary ke paas slow; LAPTOP1 2.4 GHz-only hai. Step 2 dono AP radios par channel 6 dikhata hai. Har radio par ek cheez badlo: AP1 ko channel 1 par (AP2 6 par rahta hai). Table aur client se prove karo.</p>
<p><b>wl-rf-power.</b> Yeh change task hai, fault nahi. Steps: cap aur no shutdown ke saath CAMPUS-5 banao; RF-CAMPUS banao jo use point kare; AP1 aur AP2 tag karo; table padho: dono par level 3; LAPTOP1 ko 5 GHz par prove karo. Agar LAPTOP1 ka connection toot jaata hai, to aap us position ke liye bahut neeche gaye, aur cap ek step badhate ho.</p>
<p><b>wl-band-shutdown.</b> Symptom: 5 GHz-only handset ko kuch nahi dikhta. Step 2: 5 GHz radios Disabled. Step 3: CAMPUS-5 Down. Fix: profile mein <code>no shutdown</code>. 5 GHz client se prove karo.</p>

<pre class="code">WLC1# show ap rf-profile summary
WLC1# show running-config | include dot11
WLC1# show ap dot11 5ghz summary</pre>
<pre class="out">RF Profile Name                Band    State     Max TX power
-----------------------------------------------------------------
CAMPUS-5                       5 GHz   <span class="hl">Down</span>      14 dBm
ap dot11 5ghz rf-profile CAMPUS-5
AP1                  All      0011.2233.4402  <span class="hl">Disabled</span>  36       3</pre>

<div class="warn"><p><b>Common galtiyan.</b> Teen cheezein ek saath badalna aur pata na hona ki kisne fix kiya; aise client se test karna jo band support nahi karta; "RSSI achha lag raha hai" par ruk jaana; yeh check karna bhool jaana ki doosra band toot to nahi gaya; temporary pin ko configuration mein chhod dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Order matter karta hai: configuration chhoone se pehle classify karo (no service, poor service, wrong service). Questions aksar symptom dete hain aur "pehla" command poochte hain: radio summary aksar reboot ya rebuild se behtar pehla step hai.</p></div>

<div class="scn"><h4>Friday change, Monday outage</h4><p>Friday ko ek engineer ne naye design ke liye 5 GHz RF profile banaya aur sab APs ke tag se bind kiya, baad mein enable karne ka irada tha. Monday subah naye phones (sirf 5 GHz) connect nahi ho paye jabki 2.4 GHz laptops theek the. Engineer ne workflow use kiya: 5 GHz par radios Disabled, profile Down. Do minute mein profile enable kiya aur change-checklist mein item likha: "APs ko tag karne se pehle profile enable karo".</p><p><b>Seekh:</b> chhoti checklist sabse common RF galtiyon ko rok deti hai.</p></div>

<div class="iv"><p class="q">"Ek area mein slow Wi-Fi ko aap ek minute mein kaise troubleshoot karte ho?"</p><p>Symptom aur recent changes define karo; AP join aur tags check karo; channel, power aur status ke liye radio table padho; RF profile state padho; client RSSI, band aur rate dekho; plan se compare karo; ek cheez badlo aur client se verify karo. Ant mein save aur document karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle classify karo: no service, poor service ya wrong service.</li>
<li>Per-band radio summary channel, power aur status ek table mein dikhati hai.</li>
<li>RF profile state ko har AP ke RF tag se compare karo.</li>
<li>Ek cheez badlo, phir wifi status aur ping se client se prove karo.</li>
<li>Pins aur change steps document karo taaki bhool na jaayein.</li>
</ul></div>
`}};export{e as default};