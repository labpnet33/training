var e={id:`commit-push`,h:{en:`Commit to Panorama, push to devices, commit and push`,hi:`Commit to Panorama, push to devices, commit and push`},body:{en:`
<p>Panorama has three actions that beginners mix up. Each one changes a different place, and knowing which place it changes answers most "why did nothing happen" tickets.</p>

<h3>Analogy: the head office memo</h3>
<p>The head office writes a new rule in its own policy book (commit to Panorama). Later it couriers a copy to every branch (push). Branch staff follow it only after it arrives and they file it (the firewall commits the pushed configuration). A manager can also do both in one go ("commit and push"), but they are still two steps inside.</p>

<h3>The three actions</h3>
<table class="tbl">
<tr><th>Action</th><th>What it changes</th><th>Firewalls affected?</th></tr>
<tr><td>Commit to Panorama</td><td>Panorama's own running configuration</td><td>No</td></tr>
<tr><td>Push to devices</td><td>The firewalls: they receive Panorama's <b>running</b> configuration and commit it</td><td>Yes</td></tr>
<tr><td>Commit and push</td><td>Both in sequence, from the GUI as one operation</td><td>Yes, after the Panorama commit succeeds</td></tr>
</table>
<p>In the lab, the commit is <code>commit</code> in configuration mode, and the push is an operational-mode command starting with <code>commit-all</code>, run on the active Panorama.</p>

<h3>The rule that explains everything</h3>
<p><b>A push sends the last committed (running) configuration, never the candidate.</b> If you stage a rule and push without committing it, the rule does not travel. This is exactly the second half of lab <b>pn-commit-vs-push</b>: one rule is committed, one is only staged, and you must prove which one arrived.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Commit then push">
<rect x="10" y="30" width="130" height="56" rx="8" fill="#bae6fd"/><text x="75" y="62" text-anchor="middle" class="svg-ink" font-size="12">Panorama candidate</text>
<rect x="190" y="30" width="130" height="56" rx="8" fill="#bbf7d0"/><text x="255" y="62" text-anchor="middle" class="svg-ink" font-size="12">Panorama running</text>
<rect x="370" y="30" width="110" height="56" rx="8" fill="#ddd6fe"/><text x="425" y="62" text-anchor="middle" class="svg-ink" font-size="12">Firewall running</text>
<line x1="140" y1="58" x2="190" y2="58" stroke="#64748b" stroke-width="2"/><text x="165" y="48" text-anchor="middle" class="svg-accent" font-size="11">commit</text>
<line x1="320" y1="58" x2="370" y2="58" stroke="#64748b" stroke-width="2"/><text x="345" y="48" text-anchor="middle" class="svg-accent" font-size="11">push</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">The push arrow starts at Panorama running, not at the candidate</text>
</svg><p class="cap">Anything still in the candidate is invisible to the firewalls.</p></div>

<h3>Lab example</h3>
<pre class="code">PANO&gt; commit-all shared-policy device-group NK-BRANCHES include-template no
PANO&gt; show devices all</pre>
<pre class="out">0079185321121     NK-PUNE-PA        yes   NK-BRANCHES    <span class="hl">In Sync</span>
0079134988264     NK-DELHI-PA       yes   NK-BRANCHES    <span class="hl">In Sync</span></pre>

<div class="warn"><p><b>Common mistakes.</b> Pushing before committing; committing and assuming the push is automatic; running <code>commit-all</code> on a passive Panorama; pushing a whole device group to test one firewall (use the device filter, chapter 4).</p></div>
<div class="exam"><p><b>Exam trap.</b> "Commit and push" in the GUI is convenient, but a failed Panorama commit means no push happens. Also, the push never includes staged-but-uncommitted edits.</p></div>

<div class="scn"><h4>Half the change arrived</h4><p>Two engineers worked in one change window. One committed the SSH deny rule; the other staged a Telnet deny rule but did not commit. After the push, SSH was blocked and Telnet was not. They first suspected the firewalls. The fix was to commit on Panorama and push again.</p><p><b>Lesson:</b> compare candidate and running on Panorama before blaming the push.</p></div>

<div class="iv"><p class="q">"What does push send: the candidate or the running configuration?"</p><p>The running (last committed) configuration of Panorama. That is why you commit to Panorama first. I confirm afterwards with show devices all and, on the firewall, with show config pushed-shared-policy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Commit to Panorama touches only Panorama.</li>
<li>Push sends Panorama's running configuration to firewalls.</li>
<li>Staged but uncommitted edits never reach a firewall.</li>
<li>commit-all runs on the active Panorama in operational mode.</li>
</ul></div>
`,hi:`
<p>Panorama mein teen actions hain jo beginners mix kar dete hain. Har ek alag jagah change karta hai, aur ye jaanna ki kaunsi jagah badalti hai, zyadatar "kuch hua kyun nahi" tickets ka jawab de deta hai.</p>

<h3>Analogy: head office ka memo</h3>
<p>Head office apni policy book mein nayi rule likhta hai (commit to Panorama). Baad mein har branch ko uski copy courier karta hai (push). Branch staff tabhi follow karta hai jab wo pahunch jaye aur file ho jaye (firewall pushed configuration ko commit karta hai). Manager dono ek saath bhi kar sakta hai ("commit and push"), par andar se wo do steps hi hain.</p>

<h3>Teen actions</h3>
<table class="tbl">
<tr><th>Action</th><th>Kya badalta hai</th><th>Firewalls affected?</th></tr>
<tr><td>Commit to Panorama</td><td>Panorama ki apni running configuration</td><td>Nahi</td></tr>
<tr><td>Push to devices</td><td>Firewalls: unhe Panorama ki <b>running</b> configuration milti hai aur wo commit karte hain</td><td>Haan</td></tr>
<tr><td>Commit and push</td><td>Dono sequence mein, GUI se ek operation ki tarah</td><td>Haan, Panorama commit succeed hone ke baad</td></tr>
</table>
<p>Lab mein commit hai configuration mode ka <code>commit</code>, aur push hai operational-mode command jo <code>commit-all</code> se shuru hota hai, active Panorama par chalta hai.</p>

<h3>Wo rule jo sab explain karta hai</h3>
<p><b>Push aakhri committed (running) configuration bhejta hai, candidate kabhi nahi.</b> Agar aap rule stage karke bina commit ke push karte ho, rule travel nahi karti. Lab <b>pn-commit-vs-push</b> ka doosra half yahi hai: ek rule committed hai, ek sirf staged, aur aapko prove karna hai kaunsi pahunchi.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Commit then push">
<rect x="10" y="30" width="130" height="56" rx="8" fill="#bae6fd"/><text x="75" y="62" text-anchor="middle" class="svg-ink" font-size="12">Panorama candidate</text>
<rect x="190" y="30" width="130" height="56" rx="8" fill="#bbf7d0"/><text x="255" y="62" text-anchor="middle" class="svg-ink" font-size="12">Panorama running</text>
<rect x="370" y="30" width="110" height="56" rx="8" fill="#ddd6fe"/><text x="425" y="62" text-anchor="middle" class="svg-ink" font-size="12">Firewall running</text>
<line x1="140" y1="58" x2="190" y2="58" stroke="#64748b" stroke-width="2"/><text x="165" y="48" text-anchor="middle" class="svg-accent" font-size="11">commit</text>
<line x1="320" y1="58" x2="370" y2="58" stroke="#64748b" stroke-width="2"/><text x="345" y="48" text-anchor="middle" class="svg-accent" font-size="11">push</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Push arrow Panorama running se shuru hota hai, candidate se nahi</text>
</svg><p class="cap">Jo kuch candidate mein pada hai wo firewalls ko dikhta nahi.</p></div>

<h3>Lab example</h3>
<pre class="code">PANO&gt; commit-all shared-policy device-group NK-BRANCHES include-template no
PANO&gt; show devices all</pre>
<pre class="out">0079185321121     NK-PUNE-PA        yes   NK-BRANCHES    <span class="hl">In Sync</span>
0079134988264     NK-DELHI-PA       yes   NK-BRANCHES    <span class="hl">In Sync</span></pre>

<div class="warn"><p><b>Common mistakes.</b> Commit se pehle push karna; commit karke maan lena ki push automatic hai; passive Panorama par <code>commit-all</code> chalana; ek firewall test karne ke liye poora device group push karna (device filter use karo, chapter 4).</p></div>
<div class="exam"><p><b>Exam trap.</b> GUI ka "Commit and push" convenient hai, par Panorama commit fail ho to push hota hi nahi. Aur push mein staged-but-uncommitted edits kabhi nahi jaate.</p></div>

<div class="scn"><h4>Aadha change pahuncha</h4><p>Ek change window mein do engineers kaam kar rahe the. Ek ne SSH deny rule commit ki; doosre ne Telnet deny rule stage ki par commit nahi ki. Push ke baad SSH block tha aur Telnet nahi. Pehle unhone firewalls par shak kiya. Fix tha Panorama par commit karke dobara push.</p><p><b>Lesson:</b> push ko blame karne se pehle Panorama par candidate aur running compare karo.</p></div>

<div class="iv"><p class="q">"Push candidate bhejta hai ya running configuration?"</p><p>Panorama ki running (last committed) configuration. Isliye pehle commit to Panorama karte hain. Baad mein show devices all se aur firewall par show config pushed-shared-policy se confirm karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Commit to Panorama sirf Panorama ko touch karta hai.</li>
<li>Push Panorama ki running configuration firewalls ko bhejta hai.</li>
<li>Staged par uncommitted edits firewall tak nahi pahunchte.</li>
<li>commit-all active Panorama par operational mode mein chalta hai.</li>
</ul></div>
`}};export{e as default};