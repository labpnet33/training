var e={id:`failback-upgrade`,h:{en:`Failback behaviour and zero-downtime upgrades`,hi:`Failback behaviour aur zero-downtime upgrades`},body:{en:`
<p>When the captain returns from a short rest, the co-pilot does not jump out of the seat mid-manoeuvre. They finish the approach, and the crew swaps seats at a calm moment that they choose together. ASA active/standby failover follows the same etiquette: when a failed unit comes back, it does <b>not</b> grab the active role. It waits as the standby until an engineer decides to move the role. This non-preemptive behaviour is also what makes zero-downtime upgrades possible.</p>

<h3>No preemption in active/standby</h3>
<p>After a failover the recovered unit rejoins as <b>Standby Ready</b>, even if it is the primary. The secondary stays active indefinitely. There is no <code>preempt</code> command for active/standby failover; preemption exists only per failover group in active/active (chapter 2). The reasons are good ones:</p>
<ul>
<li>Every switchover is a small risk (a gratuitous ARP that a device ignores, a session that was not replicated). Moving back automatically doubles that risk.</li>
<li>A unit that just failed might fail again. Flapping between units is worse than staying on the healthy one.</li>
<li>Both units are identical, so there is no performance reason for the primary to be active.</li>
</ul>
<p>Many teams still prefer the primary to be active in normal operation, so that documentation, monitoring and the "pri/act" prompt match. That is a <b>planned</b> failback, done in a quiet window.</p>

<h3>Failing back by hand (lab 4, task 4)</h3>
<p>In lab 4 ASA1 lost its inside link and ASA2 took over. After you repair the cable (<code>no shutdown</code> on SW-IN Gi0/0), ASA1 logs <code>104004 (Primary) Switching to OK.</code> and becomes Standby Ready, while ASA2 stays active. Two equivalent commands move the role back:</p>
<pre class="code"><span class="c">! on the standby you want to make active (ASA1)</span>
NK-ASA/pri/stby# failover active
<span class="c">! or on the current active unit (ASA2), hand the role over</span>
NK-ASA/sec/act# no failover active</pre>
<p>The logs tell you which command was used:</p>
<pre class="out">%ASA-1-104002: (Secondary) Switching to STANDBY - Other unit wants me Standby
<span class="hl">%ASA-1-104001: (Primary) Switching to ACTIVE - Set by the config command.</span></pre>
<p>With stateful failover, sessions survive a manual switchover exactly as they survive a failure. Verify with <code>show failover</code> on ASA1: <code>This host: Primary - Active</code>, <code>Other host: Secondary - Standby Ready</code>.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Failure and failback timeline">
<line x1="30" y1="110" x2="610" y2="110" stroke="#64748b" stroke-width="2"/>
<circle cx="70" cy="110" r="7" fill="#bae6fd"/><text x="70" y="90" text-anchor="middle" class="svg-ink" font-size="12">normal</text><text x="70" y="135" text-anchor="middle" class="svg-muted" font-size="12">ASA1 act</text>
<circle cx="200" cy="110" r="7" fill="#fed7aa"/><text x="200" y="90" text-anchor="middle" class="svg-ink" font-size="12">02:10 inside down</text><text x="200" y="135" text-anchor="middle" class="svg-muted" font-size="12">ASA2 act, ASA1 Failed</text>
<circle cx="360" cy="110" r="7" fill="#ddd6fe"/><text x="360" y="90" text-anchor="middle" class="svg-ink" font-size="12">08:00 cable fixed</text><text x="360" y="135" text-anchor="middle" class="svg-muted" font-size="12">ASA1 Standby Ready</text>
<circle cx="530" cy="110" r="7" fill="#bbf7d0"/><text x="530" y="90" text-anchor="middle" class="svg-ink" font-size="12">failover active</text><text x="530" y="135" text-anchor="middle" class="svg-muted" font-size="12">ASA1 act again</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">Between 08:00 and the manual command, ASA2 simply stays active</text>
</svg><p class="cap">Recovery does not move the active role; an engineer does.</p></div>

<h3>Zero-downtime (hitless) upgrade of a pair</h3>
<p>Because the two units can run different software versions <b>temporarily</b> during an upgrade, and because the standby can be reloaded without touching traffic, you can upgrade a pair while users keep working. The ASA CLI procedure:</p>
<ol>
<li><b>Stage the image on both units.</b> Copy the new image to <code>disk0:</code> on each unit (for example <code>copy tftp: disk0:</code> on each one) and check free space and the MD5 hash with <code>verify /md5</code>.</li>
<li><b>Point the boot variable to the new image</b> on the active unit; the command is replicated.
<pre class="code">clear configure boot system
boot system disk0:/asa9-22-1-smp-k8.bin
write memory</pre></li>
<li><b>Reload the standby</b> from the active unit: <code>failover reload-standby</code>. It boots the new version and rejoins as Standby Ready. <code>show failover</code> now shows <code>Version: Ours 9.20(2), Mate 9.22(1)</code>, which is allowed during an upgrade.</li>
<li><b>Swap roles</b>: <code>no failover active</code> on the active unit. The upgraded unit becomes active; stateful sessions continue.</li>
<li><b>Reload the other unit</b> from the new active: <code>failover reload-standby</code>. It boots the new version and rejoins.</li>
<li><b>Optionally fail back</b> so the primary is active again, and confirm both versions match.</li>
</ol>

<div class="eg"><p><b>Worked example: how much downtime?</b> Each unit takes 8 minutes to reload, but only the standby is ever reloaded, so traffic never waits for a boot. The only interruptions are the two role swaps in steps 4 and 6. With a state link, a role swap costs well under a second of forwarding and no sessions. Total user-visible impact: close to zero, compared with 8 minutes or more for a single firewall.</p></div>

<p>Management tools wrap the same idea: ASDM and Cisco Security Manager have upgrade wizards, and for Threat Defense the Management Center upgrades an HA pair one unit at a time automatically (chapter 11). Always check the release notes for the supported upgrade path, because not every version jump is supported as a hitless upgrade.</p>

<div class="warn"><p><b>Common mistake.</b> Upgrading the active unit first. Reloading the active unit forces an unplanned failover under load and, if the new image has a problem, you have just lost the unit that was carrying traffic. Always upgrade the standby first, then swap roles.</p></div>
<div class="exam"><p><b>Exam trap.</b> Active/standby failover has no preemption: a recovered primary becomes Standby Ready. To make it active use <code>failover active</code> on it or <code>no failover active</code> on the current active unit. Preemption (<code>preempt</code>) exists only for failover groups in active/active.</p></div>

<div class="scn"><h4>The morning shift and the "wrong" active unit</h4><p>At 02:10 a technician moving racks knocked the primary's inside cable loose and the secondary took over. At 08:00 the cable was reseated. The morning shift saw the monitoring dashboard showing the secondary active, assumed the repair had failed and opened a ticket. The on-call engineer ran <code>show failover</code>: <code>This host: Primary - Standby Ready</code>, <code>Other host: Secondary - Active</code>, and <code>show failover state</code> showed Interface check at 02:10. Everything was healthy; there is simply no preemption. At lunchtime she ran <code>failover active</code> on the primary and updated the runbook.</p><p><b>Lesson:</b> Standby Ready means repaired; the role returns only when you move it.</p></div>

<div class="iv"><p class="q">"How do you upgrade an ASA failover pair without downtime?"</p><p>Strong answer: copy the new image to both units, set <code>boot system</code> on the active (replicated) and save, reload the standby with <code>failover reload-standby</code> and wait for Standby Ready on the new version (a temporary version mismatch is allowed), then <code>no failover active</code> to make the upgraded unit active, reload the other unit, and fail back if you want the primary active. Stateful failover keeps sessions through the swaps. Mention checking the supported upgrade path and never upgrading the active unit first.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Active/standby is non-preemptive: a recovered unit becomes Standby Ready and stays there.</li>
<li>Fail back manually with <code>failover active</code> on the standby or <code>no failover active</code> on the active.</li>
<li>Log reasons: "Set by the config command" and "Other unit wants me Standby / Active".</li>
<li>Hitless upgrade: stage images, set boot system, reload standby, swap, reload the other, fail back.</li>
<li>Preemption exists only for active/active failover groups.</li>
</ul></div>
`,hi:`
<p>Jab captain chhote aaram ke baad lautta hai, co-pilot manoeuvre ke beech seat se nahi koodta. Woh approach poora karta hai, aur crew ek shaant pal mein seats badalti hai jo woh saath mein chunte hain. ASA active/standby failover bhi yahi tareeka follow karta hai: jab failed unit wapas aata hai, woh active role <b>nahi</b> cheenta. Woh standby ki tarah intezaar karta hai jab tak engineer role move karne ka faisla na kare. Yahi non-preemptive behaviour zero-downtime upgrades ko possible banata hai.</p>

<h3>Active/standby mein preemption nahi</h3>
<p>Failover ke baad recover hua unit <b>Standby Ready</b> ban kar judta hai, chahe woh primary ho. Secondary hamesha ke liye active rehta hai. Active/standby failover ke liye koi <code>preempt</code> command nahi hai; preemption sirf active/active mein har failover group ke liye hai (chapter 2). Wajah achhi hai:</p>
<ul>
<li>Har switchover ek chhota risk hai (ek gratuitous ARP jise koi device ignore kare, ek session jo replicate nahi hua). Apne aap wapas jaana woh risk double kar deta hai.</li>
<li>Jo unit abhi fail hua woh phir fail ho sakta hai. Units ke beech flap karna healthy wale par rukne se bura hai.</li>
<li>Dono units identical hain, isliye primary ke active hone ka koi performance reason nahi.</li>
</ul>
<p>Phir bhi kai teams chahti hain ki normal operation mein primary active ho, taaki documentation, monitoring aur "pri/act" prompt match karein. Yeh ek <b>planned</b> failback hai, jo shaant window mein hota hai.</p>

<h3>Haath se failback (lab 4, task 4)</h3>
<p>Lab 4 mein ASA1 ne apna inside link khoya aur ASA2 ne take over kiya. Cable repair karne ke baad (SW-IN Gi0/0 par <code>no shutdown</code>), ASA1 <code>104004 (Primary) Switching to OK.</code> log karta hai aur Standby Ready banta hai, jabki ASA2 active rehta hai. Do barabar commands role wapas laati hain:</p>
<pre class="code"><span class="c">! jis standby ko active banana hai us par (ASA1)</span>
NK-ASA/pri/stby# failover active
<span class="c">! ya current active unit (ASA2) par, role saump do</span>
NK-ASA/sec/act# no failover active</pre>
<p>Logs batate hain ki kaunsi command use hui:</p>
<pre class="out">%ASA-1-104002: (Secondary) Switching to STANDBY - Other unit wants me Standby
<span class="hl">%ASA-1-104001: (Primary) Switching to ACTIVE - Set by the config command.</span></pre>
<p>Stateful failover ke saath sessions manual switchover mein bilkul waise hi bachte hain jaise failure mein. ASA1 par <code>show failover</code> se verify karo: <code>This host: Primary - Active</code>, <code>Other host: Secondary - Standby Ready</code>.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Failure and failback timeline">
<line x1="30" y1="110" x2="610" y2="110" stroke="#64748b" stroke-width="2"/>
<circle cx="70" cy="110" r="7" fill="#bae6fd"/><text x="70" y="90" text-anchor="middle" class="svg-ink" font-size="12">normal</text><text x="70" y="135" text-anchor="middle" class="svg-muted" font-size="12">ASA1 act</text>
<circle cx="200" cy="110" r="7" fill="#fed7aa"/><text x="200" y="90" text-anchor="middle" class="svg-ink" font-size="12">02:10 inside down</text><text x="200" y="135" text-anchor="middle" class="svg-muted" font-size="12">ASA2 act, ASA1 Failed</text>
<circle cx="360" cy="110" r="7" fill="#ddd6fe"/><text x="360" y="90" text-anchor="middle" class="svg-ink" font-size="12">08:00 cable theek</text><text x="360" y="135" text-anchor="middle" class="svg-muted" font-size="12">ASA1 Standby Ready</text>
<circle cx="530" cy="110" r="7" fill="#bbf7d0"/><text x="530" y="90" text-anchor="middle" class="svg-ink" font-size="12">failover active</text><text x="530" y="135" text-anchor="middle" class="svg-muted" font-size="12">ASA1 phir act</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">08:00 aur manual command ke beech ASA2 bas active rehta hai</text>
</svg><p class="cap">Recovery active role move nahi karti; engineer karta hai.</p></div>

<h3>Pair ka zero-downtime (hitless) upgrade</h3>
<p>Kyunki upgrade ke dauraan dono units <b>temporarily</b> alag software versions chala sakte hain, aur kyunki standby ko traffic chhue bina reload kiya ja sakta hai, aap pair ko upgrade kar sakte ho jabki users kaam karte rahein. ASA CLI procedure:</p>
<ol>
<li><b>Image dono units par rakho.</b> Naya image har unit ke <code>disk0:</code> par copy karo (jaise har ek par <code>copy tftp: disk0:</code>) aur free space aur <code>verify /md5</code> se MD5 hash check karo.</li>
<li><b>Boot variable ko naye image par point karo</b> active unit par; command replicate hoti hai.
<pre class="code">clear configure boot system
boot system disk0:/asa9-22-1-smp-k8.bin
write memory</pre></li>
<li><b>Standby reload karo</b> active unit se: <code>failover reload-standby</code>. Woh naya version boot karta hai aur Standby Ready ban kar judta hai. <code>show failover</code> ab <code>Version: Ours 9.20(2), Mate 9.22(1)</code> dikhata hai, jo upgrade ke dauraan allowed hai.</li>
<li><b>Roles swap karo</b>: active unit par <code>no failover active</code>. Upgrade hua unit active banta hai; stateful sessions chalte rehte hain.</li>
<li><b>Doosra unit reload karo</b> naye active se: <code>failover reload-standby</code>. Woh naya version boot karke judta hai.</li>
<li><b>Chaaho to fail back karo</b> taaki primary phir active ho, aur confirm karo ki dono versions match karte hain.</li>
</ol>

<div class="eg"><p><b>Worked example: kitna downtime?</b> Har unit ko reload hone mein 8 minute lagte hain, lekin hamesha sirf standby reload hota hai, isliye traffic kabhi boot ka intezaar nahi karta. Sirf interruptions steps 4 aur 6 ke do role swaps hain. State link ke saath role swap mein forwarding ka ek second se bhi kam jaata hai aur koi session nahi. Users ko dikhne wala total impact: lagbhag zero, single firewall ke 8 ya zyada minute ke mukable.</p></div>

<p>Management tools yahi idea wrap karte hain: ASDM aur Cisco Security Manager mein upgrade wizards hain, aur Threat Defense ke liye Management Center HA pair ko apne aap ek-ek unit karke upgrade karta hai (chapter 11). Hamesha supported upgrade path ke liye release notes check karo, kyunki har version jump hitless upgrade ki tarah supported nahi hota.</p>

<div class="warn"><p><b>Common galti.</b> Pehle active unit upgrade karna. Active unit reload karne se load ke neeche unplanned failover hota hai aur, agar naye image mein problem hai, to aapne wahi unit kho diya jo traffic le ja raha tha. Hamesha pehle standby upgrade karo, phir roles swap karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Active/standby failover mein preemption nahi hai: recover hua primary Standby Ready banta hai. Use active banane ke liye us par <code>failover active</code> ya current active unit par <code>no failover active</code> use karo. Preemption (<code>preempt</code>) sirf active/active ke failover groups ke liye hai.</p></div>

<div class="scn"><h4>Morning shift aur "galat" active unit</h4><p>02:10 par racks shift karte ek technician se primary ki inside cable dheeli ho gayi aur secondary ne take over kiya. 08:00 par cable wapas lagayi gayi. Morning shift ne monitoring dashboard par secondary ko active dekha, socha repair fail hua aur ticket khol diya. On-call engineer ne <code>show failover</code> chalaya: <code>This host: Primary - Standby Ready</code>, <code>Other host: Secondary - Active</code>, aur <code>show failover state</code> ne 02:10 par Interface check dikhaya. Sab healthy tha; bas preemption nahi hai. Lunch time par usne primary par <code>failover active</code> chalaya aur runbook update ki.</p><p><b>Seekh:</b> Standby Ready matlab repair ho gaya; role tabhi lautta hai jab aap move karo.</p></div>

<div class="iv"><p class="q">"ASA failover pair ko bina downtime ke kaise upgrade karoge?"</p><p>Strong answer: naya image dono units par copy karo, active par <code>boot system</code> set karo (replicate hota hai) aur save karo, <code>failover reload-standby</code> se standby reload karo aur naye version par Standby Ready ka intezaar karo (temporary version mismatch allowed hai), phir <code>no failover active</code> se upgrade hua unit active banao, doosra unit reload karo, aur primary active chahiye to fail back karo. Stateful failover swaps ke dauraan sessions rakhta hai. Supported upgrade path check karne aur kabhi pehle active unit upgrade na karne ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Active/standby non-preemptive hai: recover hua unit Standby Ready banta hai aur wahi rehta hai.</li>
<li>Standby par <code>failover active</code> ya active par <code>no failover active</code> se haath se fail back karo.</li>
<li>Log reasons: "Set by the config command" aur "Other unit wants me Standby / Active".</li>
<li>Hitless upgrade: images rakho, boot system set karo, standby reload, swap, doosra reload, fail back.</li>
<li>Preemption sirf active/active failover groups ke liye hai.</li>
</ul></div>
`}};export{e as default};