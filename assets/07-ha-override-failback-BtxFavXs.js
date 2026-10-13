var e={id:`ha-override-failback`,h:{en:`Override and controlled failback`,hi:`Override aur controlled failback`},body:{en:`
<p>Think of a relay race. When the runner with the baton stumbles and a teammate grabs it, the teammate keeps running. When the first runner gets up again, nobody stops the race to hand the baton back, because that would cost a second stumble. FortiGate clusters behave the same way by default. This chapter shows when that is good, when it is not, and how to give the baton back <b>on purpose</b>. It finishes lab <b>n7-ha-election</b>, task 4.</p>

<h3>The default: no preempt</h3>
<p>In chapter 5 you learned the election order: fewer failures, then HA age (when the difference is larger than <code>ha-uptime-diff-margin</code>, default 300 s), then priority, then serial number. A failure resets the age of the unit that had it. So after FGT-A recovers, FGT-B is the older unit, wins on age, and stays primary. FGT-A becomes the healthy secondary. That is <b>no preempt</b>: one interruption (the failover) and no second one (the failback).</p>
<p>That is what you want in most data centers. It is also why many engineers are surprised that "the unit with priority 200 is not primary". Priority is only the third criterion.</p>

<h3>What override changes</h3>
<p><code>set override enable</code> moves <b>priority before age</b>. The order becomes: fewer failures, then <b>priority</b>, then age, then serial. A healthy unit with the higher priority takes the primary role back as soon as it is ready. The history line changes too: <code>its override priority is larger than peer member</code>.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Election order with and without override">
<rect x="20" y="20" width="280" height="190" rx="10" fill="#e2e8f0"/><text x="160" y="44" text-anchor="middle" class="svg-ink" font-size="14">override disable (default)</text>
<rect x="45" y="60" width="230" height="30" rx="6" fill="#bae6fd"/><text x="160" y="80" text-anchor="middle" class="svg-ink" font-size="13">1 fewer failures</text>
<rect x="45" y="98" width="230" height="30" rx="6" fill="#bbf7d0"/><text x="160" y="118" text-anchor="middle" class="svg-ink" font-size="13">2 HA age (margin 300 s)</text>
<rect x="45" y="136" width="230" height="30" rx="6" fill="#ddd6fe"/><text x="160" y="156" text-anchor="middle" class="svg-ink" font-size="13">3 priority</text>
<rect x="45" y="174" width="230" height="30" rx="6" fill="#fde68a"/><text x="160" y="194" text-anchor="middle" class="svg-ink" font-size="13">4 serial (higher wins)</text>
<rect x="340" y="20" width="280" height="190" rx="10" fill="#e2e8f0"/><text x="480" y="44" text-anchor="middle" class="svg-ink" font-size="14">override enable</text>
<rect x="365" y="60" width="230" height="30" rx="6" fill="#bae6fd"/><text x="480" y="80" text-anchor="middle" class="svg-ink" font-size="13">1 fewer failures</text>
<rect x="365" y="98" width="230" height="30" rx="6" fill="#ddd6fe"/><text x="480" y="118" text-anchor="middle" class="svg-ink" font-size="13">2 priority (moved up)</text>
<rect x="365" y="136" width="230" height="30" rx="6" fill="#bbf7d0"/><text x="480" y="156" text-anchor="middle" class="svg-ink" font-size="13">3 HA age</text>
<rect x="365" y="174" width="230" height="30" rx="6" fill="#fde68a"/><text x="480" y="194" text-anchor="middle" class="svg-ink" font-size="13">4 serial (higher wins)</text>
</svg><p class="cap">Override swaps two rows: priority jumps ahead of age. Failures always stay first.</p></div>

<div class="eg"><p><b>Worked example.</b> At 10:00 the uplink behind FGT-A fails; FGT-B (age 3 days) becomes primary and FGT-A's age is reset to 0. At 10:20 the uplink is repaired. FGT-A's age is 20 minutes (1200 s), FGT-B's is 3 days. The difference is far above 300 s, so FGT-B wins on age and stays primary. Now enable override on both units: failures are equal (0 and 0), priority 200 beats 100, FGT-A becomes primary at once. If FGT-A had been repaired 4 minutes after the failure, the age difference would still be inside the margin and the election would have fallen through to priority anyway.</p></div>

<h3>Configuring it, and the wait time</h3>
<p><code>override</code> and <code>override-wait-time</code> are <b>not synchronised</b>; you set them on every unit. <code>override-wait-time</code> (0 to 3600 s) makes a unit that has just booted or joined wait before it may take over. Without it, a unit that boots can reach the election before its routing, interfaces and sessions are ready and then pull the role away from a healthy peer.</p>
<pre class="code"><span class="c">! on FGT-A and again on FGT-B</span>
config system ha
    set override enable
    set override-wait-time 120
end</pre>
<pre class="out">FGT-A # diagnose sys ha history read
&lt;2026/10/04 22:05:12&gt; vcluster-1: FGVMEV1NU41WS000 is selected as the primary because <span class="hl">its override priority is larger than peer member</span> FGVMEV1OO2UZP000.
&lt;2026/10/04 21:13:31&gt; vcluster-1: FGVMEV1OO2UZP000 is selected as the primary because the value of link-failure + pingsvr-failure is less than peer member FGVMEV1NU41WS000.</pre>
<p>In the lab the simulator accepts <code>override-wait-time</code> and an override on either unit puts priority first; real FortiOS has more internal detail, so always set the same value on both units.</p>

<h3>Controlled failback without override</h3>
<p>Many sites keep override off and move the role by hand, at a time they choose:</p>
<table class="cmp"><tr><th>Method</th><th>Where</th><th>Effect</th></tr>
<tr><td><code>execute ha failover set 1</code></td><td>current primary</td><td>Sets the failover flag, unit steps down, age reset, peer elected. <code>unset 1</code> clears the flag.</td></tr>
<tr><td><code>diagnose sys ha reset-uptime</code></td><td>current primary</td><td>Resets its age so the older peer wins (needs a difference above the margin).</td></tr>
<tr><td><code>set override enable</code></td><td>both units</td><td>Priority decides. Permanent, so the role always returns to the higher priority.</td></tr></table>

<h3>Maintenance and upgrades</h3>
<p>For planned work the idea is always: <b>work on the secondary first, then move the role, then work on the former primary</b>. With <code>uninterruptible-upgrade</code> (default enabled) a firmware upgrade is installed on the secondary first, the cluster then fails over to it, and the old primary is upgraded last, so users see one short failover. Confirm session pickup first (chapter 9). Exact timing depends on model and version.</p>

<div class="warn"><p><b>Common mistake.</b> Enabling override on <b>one</b> unit only. Then a reboot of that unit, or a priority edit, can move the role unexpectedly, and the two configurations disagree about the rules. Set override and override-wait-time identically on both units, and remember they are never copied by config sync.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Changing priority on a running cluster moves the primary." Not with override disabled: priority is only the third criterion and the cluster renegotiates when something happens. With override enabled, a priority change acts at once.</p></div>

<div class="scn"><h4>The Sunday reboot that became an outage</h4><p>A team enabled override on FGT-A only, years earlier, and forgot. During a Sunday power test FGT-A rebooted and rejoined. Its priority 200 won immediately, before routing had converged, and the cluster flipped back while BGP was still re-learning routes. Users lost connectivity for two minutes. The team set override on both units and added <code>override-wait-time 120</code>, so a rejoining unit waits until it is ready.</p><p><b>Lesson:</b> override gives automatic failback, but a second failover must be planned, not accidental.</p></div>

<div class="iv"><p class="q">"Why is the unit with the higher priority not primary after it recovers?"</p><p>A strong answer: override is off, so HA age comes before priority; the failure reset the age of the recovered unit, so the peer is older and stays primary. Then offer the options (manual <code>execute ha failover set 1</code>, <code>reset-uptime</code>, or override on both units with an override-wait-time) and say that no-preempt avoids a second outage.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Default is no preempt: age beats priority, so a repaired unit stays secondary.</li>
<li>Override moves priority ahead of age; failures stay first, serial stays last.</li>
<li>override and override-wait-time are per unit and not synchronised: set them the same on both.</li>
<li>Manual failback: execute ha failover set 1, or reset-uptime on the current primary.</li>
<li>Upgrade and maintain the secondary first, then switch roles.</li>
</ul></div>
`,hi:`
<p>Ek relay race socho. Jab baton wala runner gir jaata hai aur teammate baton utha leta hai, to teammate hi daudta rehta hai. Pehla runner uthta hai to koi race rok ke baton wapas nahi deta, kyunki isse doosri baar giraava hoga. FortiGate cluster default mein aise hi behave karta hai. Is chapter mein dekhenge ki yeh kab achha hai, kab nahi, aur baton ko <b>jaan-boojh ke</b> wapas kaise dena hai. Yeh lab <b>n7-ha-election</b> ka task 4 poora karta hai.</p>

<h3>Default: no preempt</h3>
<p>Chapter 5 mein aapne election order seekha: kam failures, phir HA age (jab difference <code>ha-uptime-diff-margin</code> se bada ho, default 300 s), phir priority, phir serial number. Failure us unit ki age reset kar deta hai jisko failure hua. Isliye FGT-A recover hone ke baad FGT-B purana unit hota hai, age par jeet jaata hai aur primary rehta hai. FGT-A healthy secondary ban jaata hai. Yehi hai <b>no preempt</b>: ek interruption (failover) aur doosri nahi (failback).</p>
<p>Zyadatar data centers mein yahi chahiye hota hai. Isiliye kai engineers hairan hote hain ki "priority 200 wala unit primary kyun nahi hai". Priority sirf teesra criterion hai.</p>

<h3>Override kya badalta hai</h3>
<p><code>set override enable</code> <b>priority ko age se pehle</b> le aata hai. Order ban jaata hai: kam failures, phir <b>priority</b>, phir age, phir serial. Higher priority wala healthy unit ready hote hi primary role wapas le leta hai. History line bhi badalti hai: <code>its override priority is larger than peer member</code>.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Override ke saath aur bina election order">
<rect x="20" y="20" width="280" height="190" rx="10" fill="#e2e8f0"/><text x="160" y="44" text-anchor="middle" class="svg-ink" font-size="14">override disable (default)</text>
<rect x="45" y="60" width="230" height="30" rx="6" fill="#bae6fd"/><text x="160" y="80" text-anchor="middle" class="svg-ink" font-size="13">1 kam failures</text>
<rect x="45" y="98" width="230" height="30" rx="6" fill="#bbf7d0"/><text x="160" y="118" text-anchor="middle" class="svg-ink" font-size="13">2 HA age (margin 300 s)</text>
<rect x="45" y="136" width="230" height="30" rx="6" fill="#ddd6fe"/><text x="160" y="156" text-anchor="middle" class="svg-ink" font-size="13">3 priority</text>
<rect x="45" y="174" width="230" height="30" rx="6" fill="#fde68a"/><text x="160" y="194" text-anchor="middle" class="svg-ink" font-size="13">4 serial (bada jeetta hai)</text>
<rect x="340" y="20" width="280" height="190" rx="10" fill="#e2e8f0"/><text x="480" y="44" text-anchor="middle" class="svg-ink" font-size="14">override enable</text>
<rect x="365" y="60" width="230" height="30" rx="6" fill="#bae6fd"/><text x="480" y="80" text-anchor="middle" class="svg-ink" font-size="13">1 kam failures</text>
<rect x="365" y="98" width="230" height="30" rx="6" fill="#ddd6fe"/><text x="480" y="118" text-anchor="middle" class="svg-ink" font-size="13">2 priority (upar aayi)</text>
<rect x="365" y="136" width="230" height="30" rx="6" fill="#bbf7d0"/><text x="480" y="156" text-anchor="middle" class="svg-ink" font-size="13">3 HA age</text>
<rect x="365" y="174" width="230" height="30" rx="6" fill="#fde68a"/><text x="480" y="194" text-anchor="middle" class="svg-ink" font-size="13">4 serial (bada jeetta hai)</text>
</svg><p class="cap">Override do rows swap karta hai: priority age se aage nikal jaati hai. Failures hamesha pehle rehte hain.</p></div>

<div class="eg"><p><b>Worked example.</b> 10:00 baje FGT-A ke peeche uplink fail hota hai; FGT-B (age 3 din) primary banta hai aur FGT-A ki age 0 ho jaati hai. 10:20 par uplink repair hota hai. FGT-A ki age 20 minute (1200 s) hai, FGT-B ki 3 din. Difference 300 s se bahut bada hai, isliye FGT-B age par jeetta hai aur primary rehta hai. Ab dono units par override enable karo: failures barabar (0 aur 0), priority 200 beats 100, FGT-A turant primary ban jaata hai. Agar FGT-A failure ke 4 minute baad repair hota, to age difference margin ke andar hota aur election waise bhi priority tak pahunch jaata.</p></div>

<h3>Configure karna, aur wait time</h3>
<p><code>override</code> aur <code>override-wait-time</code> <b>synchronise nahi hote</b>; har unit par alag se set karte hain. <code>override-wait-time</code> (0 se 3600 s) us unit ko rokta hai jo abhi boot ya join hua hai, ki woh take over karne se pehle wait kare. Iske bina boot hota unit routing, interfaces aur sessions ready hone se pehle election mein pahunch jaata hai aur healthy peer se role kheench leta hai.</p>
<pre class="code"><span class="c">! FGT-A par aur phir FGT-B par</span>
config system ha
    set override enable
    set override-wait-time 120
end</pre>
<pre class="out">FGT-A # diagnose sys ha history read
&lt;2026/10/04 22:05:12&gt; vcluster-1: FGVMEV1NU41WS000 is selected as the primary because <span class="hl">its override priority is larger than peer member</span> FGVMEV1OO2UZP000.
&lt;2026/10/04 21:13:31&gt; vcluster-1: FGVMEV1OO2UZP000 is selected as the primary because the value of link-failure + pingsvr-failure is less than peer member FGVMEV1NU41WS000.</pre>
<p>Lab mein simulator <code>override-wait-time</code> accept karta hai aur kisi bhi ek unit par override priority ko pehle rakh deta hai; real FortiOS mein internal detail zyada hai, isliye hamesha dono units par same value set karo.</p>

<h3>Override ke bina controlled failback</h3>
<p>Kai sites override off rakhte hain aur role ko apne chune hue time par haath se move karte hain:</p>
<table class="cmp"><tr><th>Method</th><th>Kahan</th><th>Effect</th></tr>
<tr><td><code>execute ha failover set 1</code></td><td>current primary</td><td>Failover flag set hota hai, unit step down karta hai, age reset, peer elect hota hai. <code>unset 1</code> flag hata deta hai.</td></tr>
<tr><td><code>diagnose sys ha reset-uptime</code></td><td>current primary</td><td>Uski age reset hoti hai taaki purana peer jeete (margin se bada difference chahiye).</td></tr>
<tr><td><code>set override enable</code></td><td>dono units</td><td>Priority decide karti hai. Permanent, isliye role hamesha higher priority ko lautta hai.</td></tr></table>

<h3>Maintenance aur upgrades</h3>
<p>Planned kaam ka idea hamesha yeh hai: <b>pehle secondary par kaam, phir role move, phir former primary par kaam</b>. <code>uninterruptible-upgrade</code> (default enabled) ke saath firmware upgrade pehle secondary par install hota hai, cluster phir uspar fail over hota hai, aur purana primary aakhir mein upgrade hota hai, to users ko ek chhota failover dikhta hai. Pehle session pickup confirm karo (chapter 9). Exact timing model aur version par depend karti hai.</p>

<div class="warn"><p><b>Common mistake.</b> Override sirf <b>ek</b> unit par enable karna. Phir us unit ka reboot ya priority edit role ko achanak move kar sakta hai, aur dono configurations rules par ek-doosre se disagree karti hain. override aur override-wait-time dono units par same set karo, aur yaad rakho ki config sync inhe kabhi copy nahi karta.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Running cluster mein priority badalne se primary move hota hai." Override disabled ho to nahi: priority sirf teesra criterion hai aur cluster tabhi renegotiate karta hai jab kuch hota hai. Override enabled ho to priority change turant kaam karta hai.</p></div>

<div class="scn"><h4>Sunday reboot jo outage ban gaya</h4><p>Ek team ne saalon pehle sirf FGT-A par override enable kiya tha aur bhool gayi. Sunday power test mein FGT-A reboot hua aur wapas join hua. Uski priority 200 turant jeet gayi, routing converge hone se pehle, aur cluster flip ho gaya jabki BGP abhi routes re-learn kar raha tha. Users ka connectivity do minute gaya. Team ne dono units par override set kiya aur <code>override-wait-time 120</code> joda, taaki rejoin hota unit ready hone tak wait kare.</p><p><b>Lesson:</b> override automatic failback deta hai, par doosra failover planned hona chahiye, accidental nahi.</p></div>

<div class="iv"><p class="q">"Recover hone ke baad higher priority wala unit primary kyun nahi hai?"</p><p>Strong answer: override off hai, isliye HA age priority se pehle aati hai; failure ne recovered unit ki age reset kar di, to peer purana hai aur primary rehta hai. Phir options batao (manual <code>execute ha failover set 1</code>, <code>reset-uptime</code>, ya dono units par override with override-wait-time) aur kaho ki no-preempt doosre outage se bachata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Default no preempt hai: age priority se pehle, isliye repaired unit secondary rehta hai.</li>
<li>Override priority ko age se aage karta hai; failures pehle, serial aakhir mein.</li>
<li>override aur override-wait-time per unit hain aur synchronise nahi hote: dono par same set karo.</li>
<li>Manual failback: execute ha failover set 1, ya current primary par reset-uptime.</li>
<li>Upgrade aur maintenance pehle secondary par, phir roles switch.</li>
</ul></div>
`}};export{e as default};