var e={id:`backup-and-disaster-recovery`,h:{en:`Backup, export and disaster recovery beyond HA`,hi:`HA ke aage: backup, export aur disaster recovery`},body:{en:`
<p>A second copy of your notebook that is rewritten every time you write in the first is useful if the notebook burns, but useless if you scribble the wrong answer in it. HA is that mirrored notebook. A <b>backup</b> is a photocopy from last Tuesday that you keep in a drawer. You need both, because they protect against different things.</p>

<h3>What HA protects against, and what it does not</h3>
<table class="tbl">
<tr><th>Event</th><th>HA pair helps?</th><th>Needs backup?</th></tr>
<tr><td>One Panorama loses power or disk</td><td>Yes: peer takes over</td><td>Helpful for rebuilding the failed one</td></tr>
<tr><td>A bad commit that deletes policy</td><td>No: it is synchronized to the peer</td><td>Yes: restore a previous version</td></tr>
<tr><td>Both Panoramas lost (site disaster)</td><td>No</td><td>Yes: rebuild from an off-site copy</td></tr>
<tr><td>Accidental deletion of a device group</td><td>No</td><td>Yes</td></tr>
</table>

<h3>Backup thinking, conservatively</h3>
<ul>
<li><b>Export the configuration regularly</b> and before every change window. Store copies <b>off the Panorama</b>, and ideally off the site.</li>
<li>Keep a few versions, not only the latest. A mistake that is discovered next week needs an older copy.</li>
<li>Record the device-local settings that HA does not synchronize (chapter 3), so a rebuilt peer can be set up the same.</li>
<li>Keep a short written runbook: who is primary, the peer addresses, how to suspend and resume, how to verify.</li>
<li><b>Test a restore</b> at least once, in a lab. A backup that has never been restored is a hope, not a plan.</li>
</ul>
<p>The simulator does not model exports, scheduled backups, restores or licences. Exact export and restore procedures, what an export contains and how a replacement Panorama is registered depend on the version. Check the documentation for your PAN-OS version, and handle exported files as sensitive because they can hold secrets.</p>

<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">1. Export the Panorama configuration to a safe, off-device location.</span>
<span class="c">2. Name it with date and change ticket, for example nk-pano-2026-10-04-chg1042.</span>
<span class="c">3. Record the HA peer addresses and priorities in the runbook.</span>
<span class="c">4. Review and test-restore in a lab on a schedule.</span></pre>

<h3>Disaster recovery in plain steps</h3>
<ol>
<li>Decide the target: how much change and log history can you afford to lose, and how fast must management be back? Those two answers drive the design.</li>
<li>If one peer is lost, the remaining peer stays active and firewalls keep being managed (if they know both servers). Rebuild the lost peer from the documented settings and the backup, then re-pair it.</li>
<li>If both are lost, firewalls still enforce traffic with their last configuration. Rebuild a Panorama from the off-site backup, then reconnect the firewalls. Check the documentation for your PAN-OS version for how a replacement is introduced to existing firewalls.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Layers of protection">
<rect x="20" y="20" width="190" height="110" rx="8" fill="#bbf7d0"/><text x="115" y="48" text-anchor="middle" class="svg-ink" font-size="13">HA pair</text><text x="115" y="72" text-anchor="middle" class="svg-muted" font-size="11">one box fails</text>
<rect x="225" y="20" width="190" height="110" rx="8" fill="#bae6fd"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">Versioned backups</text><text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="11">bad change, deletion</text>
<rect x="430" y="20" width="190" height="110" rx="8" fill="#ddd6fe"/><text x="525" y="48" text-anchor="middle" class="svg-ink" font-size="13">Off-site copy + runbook</text><text x="525" y="72" text-anchor="middle" class="svg-muted" font-size="11">site disaster</text>
</svg><p class="cap">Each layer answers a different failure.</p></div>

<div class="scn"><h4>Synchronized mistake</h4><p>An administrator deleted a device group that fifty rules depended on and committed. Within seconds the peer had the same deletion. The HA pair worked perfectly, and that was the problem. They recovered from last night's exported configuration and lost only that day's small changes.</p><p><b>Lesson:</b> HA copies a mistake as faithfully as it copies a fix.</p></div>

<div class="iv"><p class="q">"You have HA. Why do you still need backups?"</p><p>HA protects availability when a box fails. It also replicates bad changes and cannot help if both peers or the site are lost. Versioned, off-box, tested backups cover those cases, together with a runbook for the device-local settings.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HA is not a backup: it replicates mistakes.</li>
<li>Export before changes, keep versions, store off-site, test restores.</li>
<li>Document device-local settings and the runbook.</li>
<li>Procedures are version specific: check the documentation for your PAN-OS version.</li>
</ul></div>
`,hi:`
<p>Notebook ki doosri copy jo pehli mein likhte hi dobara likhi jaati hai, notebook jal jaaye to kaam aati hai, par agar aapne pehli mein galat answer likh diya to bekaar hai. HA woh mirrored notebook hai. <b>Backup</b> pichle Tuesday ki photocopy hai jo aap drawer mein rakhte ho. Dono chahiye, kyunki alag cheezon se bachate hain.</p>

<h3>HA kis se bachata hai, aur kis se nahi</h3>
<table class="tbl">
<tr><th>Event</th><th>HA pair madad karta hai?</th><th>Backup chahiye?</th></tr>
<tr><td>Ek Panorama ki power ya disk gayi</td><td>Haan: peer take over karta hai</td><td>Failed wale ko rebuild karne mein helpful</td></tr>
<tr><td>Bad commit jisne policy delete kar di</td><td>Nahi: woh peer ko synchronize ho gaya</td><td>Haan: purana version restore</td></tr>
<tr><td>Dono Panorama lost (site disaster)</td><td>Nahi</td><td>Haan: off-site copy se rebuild</td></tr>
<tr><td>Device group galti se delete</td><td>Nahi</td><td>Haan</td></tr>
</table>

<h3>Backup thinking, conservative tareeke se</h3>
<ul>
<li><b>Configuration regularly export karo</b> aur har change window se pehle. Copies <b>Panorama ke bahar</b> rakho, aur ho sake to site ke bahar bhi.</li>
<li>Kuch versions rakho, sirf latest nahi. Agle hafte pakdi gayi galti ke liye purani copy chahiye.</li>
<li>Woh device-local settings likh lo jo HA synchronize nahi karta (chapter 3), taaki rebuilt peer wahi set ho sake.</li>
<li>Chhota written runbook rakho: kaun primary, peer addresses, suspend aur resume kaise, verify kaise.</li>
<li>Kam se kam ek baar lab mein <b>restore test karo</b>. Jis backup ko kabhi restore nahi kiya woh umeed hai, plan nahi.</li>
</ul>
<p>Simulator exports, scheduled backups, restores ya licences model nahi karta. Exact export aur restore procedures, export mein kya hota hai aur replacement Panorama kaise register hota hai, woh version par depend karta hai. Apne PAN-OS version ki documentation check karo, aur exported files ko sensitive maano kyunki unme secrets ho sakte hain.</p>

<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">1. Panorama configuration ko safe, off-device location par export karo.</span>
<span class="c">2. Naam mein date aur change ticket rakho, jaise nk-pano-2026-10-04-chg1042.</span>
<span class="c">3. HA peer addresses aur priorities runbook mein likho.</span>
<span class="c">4. Schedule par lab mein review aur test-restore karo.</span></pre>

<h3>Disaster recovery simple steps mein</h3>
<ol>
<li>Target decide karo: kitni change aur log history kho sakte ho, aur management kitni jaldi wapas chahiye? Yeh do jawab design chalate hain.</li>
<li>Ek peer lost ho to bacha hua peer active rehta hai aur firewalls manage hote rehte hain (agar woh dono servers ko jaante hain). Lost peer ko documented settings aur backup se rebuild karo, phir dobara pair karo.</li>
<li>Dono lost ho to firewalls apni last configuration se traffic enforce karte rehte hain. Off-site backup se Panorama rebuild karo, phir firewalls reconnect karo. Replacement ko existing firewalls se kaise introduce karte hain, uske liye apne PAN-OS version ki documentation check karo.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Layers of protection">
<rect x="20" y="20" width="190" height="110" rx="8" fill="#bbf7d0"/><text x="115" y="48" text-anchor="middle" class="svg-ink" font-size="13">HA pair</text><text x="115" y="72" text-anchor="middle" class="svg-muted" font-size="11">ek box fail</text>
<rect x="225" y="20" width="190" height="110" rx="8" fill="#bae6fd"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">Versioned backups</text><text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="11">bad change, deletion</text>
<rect x="430" y="20" width="190" height="110" rx="8" fill="#ddd6fe"/><text x="525" y="48" text-anchor="middle" class="svg-ink" font-size="13">Off-site copy + runbook</text><text x="525" y="72" text-anchor="middle" class="svg-muted" font-size="11">site disaster</text>
</svg><p class="cap">Har layer alag failure ka jawab hai.</p></div>

<div class="scn"><h4>Synchronized galti</h4><p>Ek administrator ne ek device group delete kar diya jis par pachaas rules depend karte the aur commit kar diya. Kuch seconds mein peer ke paas wahi deletion thi. HA pair perfectly kaam kiya, aur wahi problem thi. Unhone kal raat ki exported configuration se recover kiya aur sirf us din ke chhote changes khoye.</p><p><b>Lesson:</b> HA galti ko utni hi imaandaari se copy karta hai jitni fix ko.</p></div>

<div class="iv"><p class="q">"Aapke paas HA hai. Phir backups kyun chahiye?"</p><p>HA box fail hone par availability bachata hai. Woh bad changes bhi replicate karta hai aur dono peers ya site lost ho to madad nahi karta. Versioned, off-box, tested backups un cases ko cover karte hain, device-local settings ke runbook ke saath.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HA backup nahi hai: woh galtiyan replicate karta hai.</li>
<li>Changes se pehle export, versions rakho, off-site store karo, restore test karo.</li>
<li>Device-local settings aur runbook document karo.</li>
<li>Procedures version specific hain: apne PAN-OS version ki documentation check karo.</li>
</ul></div>
`}};export{e as default};