var e={id:`guardrails`,h:{en:`Guardrails and human-in-the-loop: approval gates, scope, change windows, audit, rollback`,hi:`Guardrails aur human-in-the-loop: approval gates, scope, change windows, audit, rollback`},body:{en:`
<p>A new pilot does not fly passengers alone on day one. They fly with a captain who can take the controls, inside rules about weather, routes and checklists, with a flight recorder capturing everything. Over time the rules relax for routine tasks, never for the dangerous ones. Guardrails for AI agents follow the same logic: decide in advance what the agent may do, where, when, how many times, with whose approval, and how you will undo it.</p>

<h3>The guardrail toolkit</h3>
<dl class="terms">
<dt>Read-only first</dt><dd>Start every AI deployment with read tools only. Let it prove its diagnoses for weeks before it gets any write ability.</dd>
<dt>Least privilege</dt><dd>Give the agent its own account with only the commands it needs, enforced on the device side (for example TACACS+ command authorisation), not a shared admin login.</dd>
<dt>Approval gate (human-in-the-loop)</dt><dd>Every change the agent proposes waits for a named human to approve it. The human sees the exact commands and the evidence.</dd>
<dt>Scope</dt><dd>Which devices or sites the agent may touch. Devices in change freeze, or critical data-centre cores, are out of scope.</dd>
<dt>Deny-list and allow-list</dt><dd>A deny-list blocks dangerous commands (reload, erase, clearing routing processes). An allow-list, which permits only known-safe commands, is stronger.</dd>
<dt>Change budget</dt><dd>A maximum number of changes per run, so a runaway loop stops early.</dd>
<dt>Change window</dt><dd>Changes only during approved maintenance windows, except pre-approved emergency actions.</dd>
<dt>Pre-checks, post-checks and rollback</dt><dd>Capture state before, verify after, and undo automatically if the post-check fails.</dd>
<dt>Audit log</dt><dd>Who proposed, who approved, what ran, what was blocked, and the result. Essential for incident reviews and compliance.</dd>
<dt>Kill switch</dt><dd>One action that stops the agent immediately.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Layers of guardrails around an agent action">
<rect x="10" y="10" width="620" height="180" rx="12" fill="#e2e8f0"/>
<rect x="40" y="35" width="560" height="140" rx="12" fill="#bae6fd"/>
<rect x="75" y="60" width="490" height="100" rx="12" fill="#bbf7d0"/>
<rect x="115" y="85" width="410" height="60" rx="12" fill="#fde68a"/>
<text x="320" y="28" text-anchor="middle" class="svg-ink" font-size="13">audit log and kill switch around everything</text>
<text x="320" y="53" text-anchor="middle" class="svg-ink" font-size="13">scope, change window, least-privilege account</text>
<text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="13">deny/allow-list and change budget</text>
<text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="13">human approval of the exact commands</text>
<text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">then post-check, rollback if it fails</text>
</svg><p class="cap">Defence in depth: one proposed change must pass every layer before it reaches a device.</p></div>

<h3>Rollback on real Cisco devices</h3>
<p>Guardrails are not only in the AI tool. IOS itself can help undo a bad change. With a configuration archive, <code>configure terminal revert timer</code> starts a change that is rolled back automatically unless someone confirms it, which protects you when a change cuts off your own access.</p>
<pre class="code"><span class="c">! keep archived copies of the config</span>
archive
 path flash:archive/cfg
 write-memory
<span class="c">! start a change that rolls back in 5 minutes unless confirmed</span>
configure terminal revert timer 5
<span class="c">! ... apply the change, verify ...</span>
configure confirm
<span class="c">! manual rollback to a saved copy if needed</span>
configure replace flash:archive/cfg-1 list</pre>

<h3>Walkthrough: the guardrails lab</h3>
<p>Management wants NK Copilot in agent mode on the Nashik network: EDGE (R1), CORE (R2) and DC (R3). DC is in change freeze. First you set the policy on the NOC host.</p>
<pre class="code">NOC&gt; copilot policy approval required
NOC&gt; copilot policy scope R1,R2
NOC&gt; copilot policy deny "clear ip ospf"
NOC&gt; copilot policy max-changes 3</pre>
<pre class="out">Copilot policy
  approval    : required (every change needs a human "yes")
  <span class="hl">scope       : R1, R2</span>
  deny        : "reload", "write erase", "erase", "delete", "format", "clear ip ospf"
  max-changes : 3 (used 0)</pre>
<p>Then <code>copilot analyze all</code>, <code>copilot plan</code> and a <b>dry run</b>, which shows what the agent would do without changing anything.</p>
<pre class="out">NOC&gt; copilot agent --dry-run
NK Copilot agent (dry run - nothing will change)

Step 1 [R1] Gi0/2 on EDGE is administratively down (confidence 93%)
    interface GigabitEthernet0/2
    no shutdown
  → would ask for approval, then apply

Step 2 [R3] Gi0/2 on DC is administratively down (confidence 93%)
    interface GigabitEthernet0/2
    no shutdown
  <span class="hl">✗ BLOCKED by guardrail: device R3 is outside the approved scope (R1,R2)</span>

Step 3 [R2] Duplex mismatch on EDGE Gi0/1 &lt;-&gt; CORE Gi0/1 (confidence 86%)
    interface GigabitEthernet0/1
    speed auto
    duplex auto
  → would ask for approval, then apply

Step 4 [R2] OSPF neighbour 10.40.40.1 (DC) stuck in EXSTART on Gi0/2 (confidence 81%)
    clear ip ospf process
  <span class="hl">✗ BLOCKED by guardrail: command "clear ip ospf process" matches deny rule "clear ip ospf"</span></pre>
<p>Read step 2 carefully. DC Gi0/2 has the description <code>RESERVED-DO-NOT-ENABLE</code>. The copilot did not read descriptions, so it proposed enabling a reserved port with 93% confidence. The <b>scope</b> guardrail saved you. Step 4 is the symptom-matching mistake again, stopped by the <b>deny-list</b>. You then run <code>copilot agent --approve-each</code>, approve steps 1 and 3 after checking them, and review the audit log.</p>
<pre class="out">NOC&gt; copilot audit
...
<span class="hl">Summary: 2 applied, 2 verified, 2 blocked by guardrails, 0 rejected, 0 declined</span></pre>
<p>The guardrails did their job, but notice they only <i>blocked</i> the wrong OSPF step; they did not find the real cause. The CORE–DC adjacency is still down because of an MTU mismatch that you fix by hand (chapter 11).</p>

<div class="eg"><p><b>Worked example: sizing the change budget.</b> A nightly agent handles err-disabled access ports at 40 branches. Historically, at most 6 ports per night need attention. Set max-changes to 10: enough for a bad night, small enough that a bug cannot touch hundreds of ports. If the budget is hit, the agent stops and pages a human, because hitting the limit is itself a signal that something unusual is happening.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Relying on a deny-list alone (someone will find the command you forgot; prefer allow-lists for writes). Auto-approving because the confidence is high. Approving without reading the exact commands. No post-check, so a "successful" change that did nothing is recorded as a fix. Shared admin credentials, so the audit log cannot tell the agent from a human.</p></div>
<div class="exam"><p><b>Exam trap.</b> Human-in-the-loop means a person reviews and approves each action before it runs. Scope limits which devices; deny-lists limit which commands; change budgets limit how many; change windows limit when. An audit log records actions, it does not prevent them. A dry run shows intended actions without executing.</p></div>

<div class="scn"><h4>The rollback that saved the WAN</h4><p>An approved agent step changed the MTU on 30 branch tunnel interfaces during a change window. The post-check on the first five branches showed OSPF adjacencies dropping to EXSTART. Because the agent processed branches in small batches with automatic rollback on a failed post-check, it reverted those five and stopped, instead of pushing to all 30. The engineer found that the hub's tunnel MTU had not been updated first, fixed the order in the plan, and reran it the next night.</p><p><b>Lesson:</b> batches, post-checks and automatic rollback turn a potential 30-site outage into a 5-site blip.</p></div>

<div class="iv"><p class="q">"Your manager wants an AI agent to auto-remediate network issues. What guardrails would you insist on?"</p><p>Strong answer: start read-only; separate least-privilege account with device-side command authorisation; human approval for every write at first; device scope that excludes frozen or critical devices; allow-list of permitted commands plus a deny-list for dangerous ones; change budget and batching; change windows; dry runs; pre-checks, post-checks and automatic rollback; complete audit logs and a kill switch. Then describe how you would expand autonomy gradually for proven low-risk actions only.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Start read-only; give agents least-privilege accounts enforced on the devices.</li>
<li>Human-in-the-loop: a person approves the exact commands with the evidence in front of them.</li>
<li>Scope, deny/allow-lists, change budgets and change windows limit where, what, how many and when.</li>
<li>Pre-checks, post-checks, batching and rollback (archive, revert timer, configure replace) limit damage.</li>
<li>Audit logs and a kill switch make every agent action reviewable and stoppable.</li>
</ul></div>
`,hi:`
<p>Naya pilot pehle hi din passengers ke saath akela nahi udta. Woh ek captain ke saath udta hai jo controls le sakta hai, weather, routes aur checklists ke rules ke andar, aur ek flight recorder sab kuch record karta hai. Samay ke saath routine tasks ke rules dheele hote hain, khatarnaak waalon ke kabhi nahi. AI agents ke guardrails bhi isi logic par chalte hain: pehle se decide karo ki agent kya kar sakta hai, kahan, kab, kitni baar, kiske approval se, aur aap use undo kaise karoge.</p>

<h3>Guardrail toolkit</h3>
<dl class="terms">
<dt>Read-only first</dt><dd>Har AI deployment sirf read tools se shuru karo. Kisi bhi write ability se pehle use hafton tak apne diagnoses prove karne do.</dd>
<dt>Least privilege</dt><dd>Agent ko uska apna account do jismein sirf zaroori commands hon, device side par enforce (jaise TACACS+ command authorisation), shared admin login nahi.</dd>
<dt>Approval gate (human-in-the-loop)</dt><dd>Agent ka propose kiya har change ek named insaan ke approval ka wait karta hai. Insaan exact commands aur evidence dekhta hai.</dd>
<dt>Scope</dt><dd>Agent kaunse devices ya sites chhoo sakta hai. Change freeze wale devices, ya critical data-centre cores, scope se bahar hain.</dd>
<dt>Deny-list aur allow-list</dt><dd>Deny-list khatarnaak commands block karti hai (reload, erase, routing processes clear karna). Allow-list, jo sirf known-safe commands permit karti hai, zyada mazboot hai.</dd>
<dt>Change budget</dt><dd>Ek run mein changes ki maximum sankhya, taaki bekaabu loop jaldi ruk jaaye.</dd>
<dt>Change window</dt><dd>Changes sirf approved maintenance windows mein, pehle se approved emergency actions ko chhod kar.</dd>
<dt>Pre-checks, post-checks aur rollback</dt><dd>Pehle state capture karo, baad mein verify karo, aur post-check fail ho to automatically undo karo.</dd>
<dt>Audit log</dt><dd>Kisne propose kiya, kisne approve kiya, kya chala, kya block hua, aur result. Incident reviews aur compliance ke liye zaroori.</dd>
<dt>Kill switch</dt><dd>Ek action jo agent ko turant rok de.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Agent action ke chaaron taraf guardrails ki layers">
<rect x="10" y="10" width="620" height="180" rx="12" fill="#e2e8f0"/>
<rect x="40" y="35" width="560" height="140" rx="12" fill="#bae6fd"/>
<rect x="75" y="60" width="490" height="100" rx="12" fill="#bbf7d0"/>
<rect x="115" y="85" width="410" height="60" rx="12" fill="#fde68a"/>
<text x="320" y="28" text-anchor="middle" class="svg-ink" font-size="13">sab ke chaaron taraf audit log aur kill switch</text>
<text x="320" y="53" text-anchor="middle" class="svg-ink" font-size="13">scope, change window, least-privilege account</text>
<text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="13">deny/allow-list aur change budget</text>
<text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="13">exact commands ka human approval</text>
<text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">phir post-check, fail ho to rollback</text>
</svg><p class="cap">Defence in depth: device tak pahunchne se pehle ek proposed change ko har layer paar karni hoti hai.</p></div>

<h3>Real Cisco devices par rollback</h3>
<p>Guardrails sirf AI tool mein nahi hote. IOS khud bura change undo karne mein madad kar sakta hai. Configuration archive ke saath, <code>configure terminal revert timer</code> aisa change shuru karta hai jo automatically roll back ho jaata hai jab tak koi confirm na kare, jo tab bachata hai jab change aapka apna access kaat de.</p>
<pre class="code"><span class="c">! config ki archived copies rakho</span>
archive
 path flash:archive/cfg
 write-memory
<span class="c">! aisa change shuru karo jo confirm na hone par 5 minute mein roll back ho</span>
configure terminal revert timer 5
<span class="c">! ... change apply karo, verify karo ...</span>
configure confirm
<span class="c">! zaroorat ho to saved copy par manual rollback</span>
configure replace flash:archive/cfg-1 list</pre>

<h3>Walkthrough: guardrails lab</h3>
<p>Management Nashik network par NK Copilot ko agent mode mein chahta hai: EDGE (R1), CORE (R2) aur DC (R3). DC change freeze mein hai. Pehle aap NOC host par policy set karte ho.</p>
<pre class="code">NOC&gt; copilot policy approval required
NOC&gt; copilot policy scope R1,R2
NOC&gt; copilot policy deny "clear ip ospf"
NOC&gt; copilot policy max-changes 3</pre>
<pre class="out">Copilot policy
  approval    : required (every change needs a human "yes")
  <span class="hl">scope       : R1, R2</span>
  deny        : "reload", "write erase", "erase", "delete", "format", "clear ip ospf"
  max-changes : 3 (used 0)</pre>
<p>Phir <code>copilot analyze all</code>, <code>copilot plan</code> aur ek <b>dry run</b>, jo dikhata hai ki agent kya karta, bina kuch badle.</p>
<pre class="out">NOC&gt; copilot agent --dry-run
NK Copilot agent (dry run - nothing will change)

Step 1 [R1] Gi0/2 on EDGE is administratively down (confidence 93%)
    interface GigabitEthernet0/2
    no shutdown
  → would ask for approval, then apply

Step 2 [R3] Gi0/2 on DC is administratively down (confidence 93%)
    interface GigabitEthernet0/2
    no shutdown
  <span class="hl">✗ BLOCKED by guardrail: device R3 is outside the approved scope (R1,R2)</span>

Step 3 [R2] Duplex mismatch on EDGE Gi0/1 &lt;-&gt; CORE Gi0/1 (confidence 86%)
    interface GigabitEthernet0/1
    speed auto
    duplex auto
  → would ask for approval, then apply

Step 4 [R2] OSPF neighbour 10.40.40.1 (DC) stuck in EXSTART on Gi0/2 (confidence 81%)
    clear ip ospf process
  <span class="hl">✗ BLOCKED by guardrail: command "clear ip ospf process" matches deny rule "clear ip ospf"</span></pre>
<p>Step 2 dhyan se padho. DC Gi0/2 ka description <code>RESERVED-DO-NOT-ENABLE</code> hai. Copilot ne descriptions nahi padhe, isliye usne 93% confidence ke saath reserved port enable karna propose kiya. <b>Scope</b> guardrail ne aapko bacha liya. Step 4 phir wahi symptom-matching galti hai, jise <b>deny-list</b> ne roka. Phir aap <code>copilot agent --approve-each</code> chalate ho, check karke steps 1 aur 3 approve karte ho, aur audit log review karte ho.</p>
<pre class="out">NOC&gt; copilot audit
...
<span class="hl">Summary: 2 applied, 2 verified, 2 blocked by guardrails, 0 rejected, 0 declined</span></pre>
<p>Guardrails ne apna kaam kiya, lekin dhyan do ki unhone galat OSPF step ko sirf <i>block</i> kiya; asli cause nahi dhoondha. CORE–DC adjacency abhi bhi MTU mismatch ki wajah se down hai, jise aap haath se fix karte ho (chapter 11).</p>

<div class="eg"><p><b>Worked example: change budget ka size.</b> Ek nightly agent 40 branches par err-disabled access ports handle karta hai. History mein ek raat mein zyada se zyada 6 ports ko dhyan chahiye hota hai. Max-changes 10 set karo: buri raat ke liye kaafi, itna chhota ki koi bug sainkdon ports na chhoo sake. Agar budget hit ho jaaye, agent ruk kar insaan ko page karta hai, kyunki limit hit hona khud ek signal hai ki kuch unusual ho raha hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Sirf deny-list par bharosa (koi na koi woh command dhoondh lega jo aap bhool gaye; writes ke liye allow-lists prefer karo). Confidence zyada hai isliye auto-approve karna. Exact commands padhe bina approve karna. Post-check nahi, isliye kuch na karne wala "successful" change fix ki tarah record hota hai. Shared admin credentials, jisse audit log agent aur insaan mein farak nahi kar pata.</p></div>
<div class="exam"><p><b>Exam trap.</b> Human-in-the-loop ka matlab hai har action chalne se pehle ek insaan review aur approve karta hai. Scope limit karta hai kaunse devices; deny-lists kaunsi commands; change budgets kitne; change windows kab. Audit log actions record karta hai, unhe rokta nahi. Dry run intended actions dikhata hai bina execute kiye.</p></div>

<div class="scn"><h4>Woh rollback jisne WAN bachaya</h4><p>Ek approved agent step ne change window mein 30 branch tunnel interfaces par MTU badla. Pehli paanch branches par post-check ne OSPF adjacencies ko EXSTART par girta dikhaya. Kyunki agent branches ko chhote batches mein, failed post-check par automatic rollback ke saath process karta tha, usne un paanch ko revert kiya aur ruk gaya, sab 30 par push karne ki jagah. Engineer ne dekha ki hub ka tunnel MTU pehle update nahi hua tha, plan mein order theek kiya, aur agli raat dobara chalaya.</p><p><b>Seekh:</b> batches, post-checks aur automatic rollback potential 30-site outage ko 5-site blip bana dete hain.</p></div>

<div class="iv"><p class="q">"Aapka manager chahta hai ki AI agent network issues auto-remediate kare. Aap kaunse guardrails par zor doge?"</p><p>Strong answer: read-only se shuru; device-side command authorisation ke saath alag least-privilege account; shuru mein har write ke liye human approval; device scope jo frozen ya critical devices ko bahar rakhe; permitted commands ki allow-list aur khatarnaak commands ke liye deny-list; change budget aur batching; change windows; dry runs; pre-checks, post-checks aur automatic rollback; poore audit logs aur kill switch. Phir batao ki aap autonomy sirf proven low-risk actions ke liye dheere-dheere kaise badhaoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read-only se shuru karo; agents ko devices par enforce hone wale least-privilege accounts do.</li>
<li>Human-in-the-loop: insaan evidence saamne rakh kar exact commands approve karta hai.</li>
<li>Scope, deny/allow-lists, change budgets aur change windows kahan, kya, kitna aur kab limit karte hain.</li>
<li>Pre-checks, post-checks, batching aur rollback (archive, revert timer, configure replace) damage limit karte hain.</li>
<li>Audit logs aur kill switch har agent action ko reviewable aur rokne layak banate hain.</li>
</ul></div>
`}};export{e as default};