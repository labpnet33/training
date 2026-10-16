var e={id:`capstone-scenario`,h:{en:`Capstone: a planned Panorama maintenance that goes wrong`,hi:`Capstone: planned Panorama maintenance jo galat ho jaata hai`},body:{en:`
<p>This capstone joins everything: planning, firewalls' two servers, suspend, failover, verification and troubleshooting. Read it like a case study and decide your next step before you read the engineer's.</p>

<h3>The story</h3>
<p>MyPnetLab has NK-PANORAMA (192.0.2.50, primary, preemptive) and NK-PANORAMA-2 (192.0.2.51, secondary) managing PA1 Pune, PA2 Delhi and PA3 Chennai. On Sunday the team plans to patch NK-PANORAMA. The ticket reads: "Patch primary Panorama with no loss of management. Confirm afterwards."</p>

<h3>Step 1: pre-checks</h3>
<pre class="out">&gt; show high-availability state          (NK-PANORAMA, before)
  Local Information:
    Priority         : primary (preemptive)
    State            : active-primary
  Peer Information:
    State            : passive-secondary
  <span class="hl">Configuration synchronization: synchronized</span></pre>
<p>Good: roles and synchronization are as designed. Next the engineer checks a firewall.</p>
<pre class="out">&gt; show panorama-status                  (PA3, before)
Panorama Server 1 : 192.0.2.50
    Connected     : yes
    HA state      : active
<span class="hl">(no Panorama Server 2 listed)</span></pre>

<h3>Step 2: spot the risk</h3>
<p>PA3 knows only the primary. If the primary is suspended for the patch, PA3 will have no active server it knows. The other firewalls received the second server earlier; PA3 was added to the template stack late and missed a push. The engineer does not start the patch. First the fix: check that the template carries the second server, commit to Panorama on the active peer, and push the stack to PA3. Then re-check PA3 until both servers show.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Capstone timeline">
<rect x="10" y="30" width="116" height="70" rx="8" fill="#bae6fd"/><text x="68" y="58" text-anchor="middle" class="svg-ink" font-size="12">Pre-check</text><text x="68" y="78" text-anchor="middle" class="svg-muted" font-size="11">state + firewalls</text>
<rect x="136" y="30" width="116" height="70" rx="8" fill="#fde68a"/><text x="194" y="58" text-anchor="middle" class="svg-ink" font-size="12">Fix PA3</text><text x="194" y="78" text-anchor="middle" class="svg-muted" font-size="11">server 2 push</text>
<rect x="262" y="30" width="116" height="70" rx="8" fill="#ddd6fe"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="12">Suspend</text><text x="320" y="78" text-anchor="middle" class="svg-muted" font-size="11">handover</text>
<rect x="388" y="30" width="116" height="70" rx="8" fill="#bbf7d0"/><text x="446" y="58" text-anchor="middle" class="svg-ink" font-size="12">Verify + push</text><text x="446" y="78" text-anchor="middle" class="svg-muted" font-size="11">from peer</text>
<rect x="514" y="30" width="116" height="70" rx="8" fill="#e2e8f0"/><text x="572" y="58" text-anchor="middle" class="svg-ink" font-size="12">Return</text><text x="572" y="78" text-anchor="middle" class="svg-muted" font-size="11">functional</text>
</svg><p class="cap">The order is the engineering: protect first, then change.</p></div>

<h3>Step 3: handover and checks</h3>
<p>With all three firewalls listing two servers, the engineer suspends NK-PANORAMA. NK-PANORAMA-2 reports <code>active-secondary</code>. On each firewall the status shows the second server as active. From NK-PANORAMA-2 a stack push is accepted and the job list shows it. Meanwhile the patch is applied to NK-PANORAMA.</p>

<h3>Step 4: return and close</h3>
<p>After the patch, the engineer makes NK-PANORAMA functional. Because the primary is preemptive, it becomes <code>active-primary</code> again and NK-PANORAMA-2 returns to <code>passive-secondary</code>. State, the synchronized line and one firewall status all confirm. The engineer exports a configuration copy, updates the runbook with the PA3 lesson and closes the ticket with the before and after outputs attached.</p>

<table class="tbl">
<tr><th>Decision</th><th>Reason</th></tr>
<tr><td>Check firewalls before suspending</td><td>HA state alone does not prove firewalls are covered</td></tr>
<tr><td>Fix PA3 on the active peer</td><td>Pushes run only on the active Panorama</td></tr>
<tr><td>Push from NK-PANORAMA-2 as proof</td><td>A failover is proven by being able to change and push</td></tr>
<tr><td>Export and runbook update</td><td>HA is not a backup; keep knowledge</td></tr>
</table>

<div class="scn"><h4>What if the pair had not formed?</h4><p>If the pre-check had shown the peer unknown, the engineer would have stopped the maintenance and moved to formation troubleshooting (chapter 9). Patching one half of a pair that is not really a pair removes the only management server.</p><p><b>Lesson:</b> never start maintenance on a pair you have not verified.</p></div>

<div class="iv"><p class="q">"Describe a maintenance you ran on a Panorama pair."</p><p>Pre-check state and synchronization, check each firewall lists both servers, fix gaps, suspend the one to patch, verify the firewalls moved and a push works from the other, patch, return to functional, verify roles, export a backup and update the runbook.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Verify the pair and the firewalls before any handover.</li>
<li>Fix gaps on the active peer, then suspend.</li>
<li>Prove management by pushing from the second Panorama.</li>
<li>Return, verify, back up, document.</li>
</ul></div>
`,hi:`
<p>Yeh capstone sab kuch jodta hai: planning, firewalls ke do servers, suspend, failover, verification aur troubleshooting. Ise case study ki tarah padho aur engineer ka next step padhne se pehle apna decide karo.</p>

<h3>Kahani</h3>
<p>MyPnetLab ke paas NK-PANORAMA (192.0.2.50, primary, preemptive) aur NK-PANORAMA-2 (192.0.2.51, secondary) hain jo PA1 Pune, PA2 Delhi aur PA3 Chennai ko manage karte hain. Sunday ko team NK-PANORAMA patch karna chahti hai. Ticket kehta hai: "Primary Panorama ko management loss ke bina patch karo. Baad mein confirm karo."</p>

<h3>Step 1: pre-checks</h3>
<pre class="out">&gt; show high-availability state          (NK-PANORAMA, pehle)
  Local Information:
    Priority         : primary (preemptive)
    State            : active-primary
  Peer Information:
    State            : passive-secondary
  <span class="hl">Configuration synchronization: synchronized</span></pre>
<p>Achha: roles aur synchronization design ke mutabiq hain. Ab engineer ek firewall check karta hai.</p>
<pre class="out">&gt; show panorama-status                  (PA3, pehle)
Panorama Server 1 : 192.0.2.50
    Connected     : yes
    HA state      : active
<span class="hl">(Panorama Server 2 listed nahi)</span></pre>

<h3>Step 2: risk pehchano</h3>
<p>PA3 sirf primary ko jaanta hai. Patch ke liye primary suspend hua to PA3 ke paas koi jaana-pehchana active server nahi bachega. Baaki firewalls ko doosra server pehle mil chuka tha; PA3 template stack mein late add hua aur ek push miss kar gaya. Engineer patch shuru nahi karta. Pehle fix: check karo template mein doosra server hai, active peer par commit to Panorama karo, aur stack PA3 par push karo. Phir PA3 dobara tab tak check karo jab tak dono servers dikhein.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Capstone timeline">
<rect x="10" y="30" width="116" height="70" rx="8" fill="#bae6fd"/><text x="68" y="58" text-anchor="middle" class="svg-ink" font-size="12">Pre-check</text><text x="68" y="78" text-anchor="middle" class="svg-muted" font-size="11">state + firewalls</text>
<rect x="136" y="30" width="116" height="70" rx="8" fill="#fde68a"/><text x="194" y="58" text-anchor="middle" class="svg-ink" font-size="12">Fix PA3</text><text x="194" y="78" text-anchor="middle" class="svg-muted" font-size="11">server 2 push</text>
<rect x="262" y="30" width="116" height="70" rx="8" fill="#ddd6fe"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="12">Suspend</text><text x="320" y="78" text-anchor="middle" class="svg-muted" font-size="11">handover</text>
<rect x="388" y="30" width="116" height="70" rx="8" fill="#bbf7d0"/><text x="446" y="58" text-anchor="middle" class="svg-ink" font-size="12">Verify + push</text><text x="446" y="78" text-anchor="middle" class="svg-muted" font-size="11">peer se</text>
<rect x="514" y="30" width="116" height="70" rx="8" fill="#e2e8f0"/><text x="572" y="58" text-anchor="middle" class="svg-ink" font-size="12">Return</text><text x="572" y="78" text-anchor="middle" class="svg-muted" font-size="11">functional</text>
</svg><p class="cap">Order hi engineering hai: pehle protect karo, phir change.</p></div>

<h3>Step 3: handover aur checks</h3>
<p>Teeno firewalls do servers list karne lage to engineer NK-PANORAMA ko suspend karta hai. NK-PANORAMA-2 <code>active-secondary</code> report karta hai. Har firewall par status doosre server ko active dikhata hai. NK-PANORAMA-2 se stack push accept hota hai aur job list mein dikhta hai. Is beech NK-PANORAMA par patch lagta hai.</p>

<h3>Step 4: return aur close</h3>
<p>Patch ke baad engineer NK-PANORAMA ko functional karta hai. Primary preemptive hai, isliye woh dobara <code>active-primary</code> ban jaata hai aur NK-PANORAMA-2 <code>passive-secondary</code> par lautta hai. State, synchronized line aur ek firewall status sab confirm karte hain. Engineer configuration copy export karta hai, runbook mein PA3 ka lesson jodta hai aur ticket before aur after outputs ke saath close karta hai.</p>

<table class="tbl">
<tr><th>Decision</th><th>Reason</th></tr>
<tr><td>Suspend se pehle firewalls check karo</td><td>Sirf HA state prove nahi karti ki firewalls covered hain</td></tr>
<tr><td>PA3 ko active peer par fix karo</td><td>Pushes sirf active Panorama par chalte hain</td></tr>
<tr><td>Proof ke liye NK-PANORAMA-2 se push</td><td>Failover tab prove hota hai jab change aur push kar sako</td></tr>
<tr><td>Export aur runbook update</td><td>HA backup nahi hai; knowledge rakho</td></tr>
</table>

<div class="scn"><h4>Agar pair bana hi nahi hota?</h4><p>Pre-check mein peer unknown dikhta to engineer maintenance rok deta aur formation troubleshooting (chapter 9) par jaata. Aise pair ke ek half ko patch karna jo asal mein pair nahi hai, ek hi management server hata deta hai.</p><p><b>Lesson:</b> jis pair ko verify nahi kiya us par maintenance shuru mat karo.</p></div>

<div class="iv"><p class="q">"Panorama pair par aapne jo maintenance chalaya uska description do."</p><p>State aur synchronization pre-check, har firewall dono servers list karta hai check, gaps fix, jise patch karna hai use suspend, verify ki firewalls shift hue aur doosre se push chalta hai, patch, functional par return, roles verify, backup export aur runbook update.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Handover se pehle pair aur firewalls verify karo.</li>
<li>Gaps active peer par fix karo, phir suspend.</li>
<li>Doosre Panorama se push karke management prove karo.</li>
<li>Return, verify, backup, document.</li>
</ul></div>
`}};export{e as default};