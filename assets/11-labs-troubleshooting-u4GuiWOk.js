var e={id:`labs-tshoot`,h:{en:`Troubleshooting workflow and walking both labs`,hi:`Troubleshooting workflow aur dono labs walk karna`},body:{en:`
<p>This chapter gives you a repeatable workflow for any "the firewall is blocking it" ticket, and then walks you through both labs of this module step by step, using the exact device names, addresses and commands the labs check.</p>

<h3>The analogy: a doctor's checklist</h3>
<p>A good doctor does not guess. They ask the symptoms, take measurements, test one hypothesis at a time and prescribe the smallest effective treatment. A firewall engineer does the same: define the flow, trace it, read the evidence, make the smallest change, and prove the result.</p>

<h3>The ACL troubleshooting workflow</h3>
<ol>
<li><b>Define the flow exactly.</b> Source IP, destination as the client sees it (public or private), protocol, port, and the ingress interface.</li>
<li><b>Is an ACL bound?</b> <code>show running-config access-group</code>: right ACL, right interface, right direction (<code>in</code>)?</li>
<li><b>Trace it.</b> <code>packet-tracer input &lt;ingress&gt; …</code>. Which phase drops, and which ACE (or Implicit Rule) decided?</li>
<li><b>Read the ACL.</b> <code>show access-list NAME</code>: is the permit present, is it above any broader deny, does it use real addresses and real ports, does its hitcnt move?</li>
<li><b>Check NAT evidence.</b> <code>show nat</code>: rising untranslate_hits with a zero-hit ACE means the ACE uses the mapped IP.</li>
<li><b>Check logs.</b> 106023 or 106100 denied lines name the ACL and the real addresses; 710003 means to-the-box traffic.</li>
<li><b>Fix minimally</b>: move, correct or add one ACE, never "permit ip any any".</li>
<li><b>Prove it</b>: re-trace, test real traffic, watch hitcnt, confirm the blocked flows are still blocked, and <code>clear conn</code> if you tightened access.</li>
</ol>

<table class="cmp"><tr><th>Symptom</th><th>Most likely cause</th><th>Evidence</th></tr>
<tr><td>ACL configured, nothing changes</td><td>No access-group, or bound <code>out</code></td><td>show running-config access-group</td></tr>
<tr><td>Permit exists, hitcnt 0, untranslate_hits rising</td><td>ACE uses the public (mapped) IP</td><td>show nat, packet-tracer UN-NAT</td></tr>
<tr><td>Specific permit hitcnt 0, a deny above has hits</td><td>Rule order; first match wins</td><td>packet-tracer shows the deny ACE</td></tr>
<tr><td>Port-forward fails, ACE uses 8080</td><td>ACE must use the real port 80</td><td>packet-tracer Untranslate line</td></tr>
<tr><td>Access removed but user still connected</td><td>Existing connection</td><td>show conn address</td></tr>
<tr><td>Inside users lost internet after new ACL</td><td>Inbound ACL on inside without final permit</td><td>106023 with INSIDE_IN</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Troubleshooting loop">
<rect x="10" y="40" width="110" height="55" rx="8" fill="#e2e8f0"/><text x="65" y="72" text-anchor="middle" class="svg-ink" font-size="13">Define flow</text>
<rect x="135" y="40" width="110" height="55" rx="8" fill="#ddd6fe"/><text x="190" y="72" text-anchor="middle" class="svg-ink" font-size="13">packet-tracer</text>
<rect x="260" y="40" width="110" height="55" rx="8" fill="#fde68a"/><text x="315" y="64" text-anchor="middle" class="svg-ink" font-size="13">ACL, NAT,</text><text x="315" y="82" text-anchor="middle" class="svg-ink" font-size="13">logs</text>
<rect x="385" y="40" width="110" height="55" rx="8" fill="#fed7aa"/><text x="440" y="72" text-anchor="middle" class="svg-ink" font-size="13">Minimal fix</text>
<rect x="510" y="40" width="120" height="55" rx="8" fill="#bbf7d0"/><text x="570" y="72" text-anchor="middle" class="svg-ink" font-size="13">Prove both ways</text>
<line x1="120" y1="67" x2="135" y2="67" stroke="#64748b" stroke-width="2"/><line x1="245" y1="67" x2="260" y2="67" stroke="#64748b" stroke-width="2"/><line x1="370" y1="67" x2="385" y2="67" stroke="#64748b" stroke-width="2"/><line x1="495" y1="67" x2="510" y2="67" stroke="#64748b" stroke-width="2"/>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">Prove both ways = the new flow passes AND the flows that must stay blocked are still blocked</text>
</svg><p class="cap">The same loop solves both labs.</p></div>

<h3>Lab 1: Open the DMZ to the internet, exactly as much as needed</h3>
<p><b>Starting point:</b> WEB (10.0.2.10, published as 203.0.113.3) and MAIL (10.0.2.25, published as 203.0.113.4) already have static NAT inside their objects. No ACL exists on outside, so security levels block everything from the internet. <b>Goal:</b> web (HTTP, HTTPS) to WEB from anywhere, SMTP to MAIL from anywhere, SSH to both only from PARTNER 198.51.100.10.</p>
<pre class="code">enable
configure terminal
<span class="c">! task 1: one group for both published servers</span>
object-group network PUBLIC-SERVERS
 network-object object WEB
 network-object object MAIL
 exit
<span class="c">! task 2: real addresses via objects; partner SSH via the group</span>
access-list OUTSIDE_IN extended permit tcp any object WEB eq www
access-list OUTSIDE_IN extended permit tcp any object WEB eq h&#116;tps
access-list OUTSIDE_IN extended permit tcp any object MAIL eq smtp
access-list OUTSIDE_IN extended permit tcp host 198.51.100.10 object-group PUBLIC-SERVERS eq ssh
access-group OUTSIDE_IN in interface outside
end</pre>
<p><b>Task 3, prove the boundary.</b> On INET run <code>ssh -l admin 203.0.113.3</code> (must fail) and <code>curl 203.0.113.4</code> (web to MAIL must fail). Both fall to the implicit deny. On PARTNER, <code>ssh -l admin 203.0.113.3</code> and to 203.0.113.4 succeed via line 4.</p>
<p><b>Task 4, the why.</b> The ACL permits 10.0.2.10 although customers connect to 203.0.113.3 because the ASA <b>untranslates the destination first and then checks the ACL</b> (8.3 and later).</p>
<pre class="out">NK-ASA# show access-list OUTSIDE_IN
access-list OUTSIDE_IN; 5 elements; name hash: 0x6892a938
access-list OUTSIDE_IN line 1 extended permit tcp any object WEB eq www (hitcnt=3) 0x1c2a31fe
access-list OUTSIDE_IN line 2 extended permit tcp any object WEB eq h&#116;tps (hitcnt=1) 0x7a04c8e1
access-list OUTSIDE_IN line 3 extended permit tcp any object MAIL eq smtp (hitcnt=1) 0x4f7e2b90
<span class="hl">access-list OUTSIDE_IN line 4 extended permit tcp host 198.51.100.10 object-group PUBLIC-SERVERS eq ssh (hitcnt=2) 0x2e4f1c07</span></pre>

<h3>Lab 2: Ticket INC-7719, the partner exception never matches</h3>
<p><b>Starting point:</b> OUTSIDE_IN already exists, in this order: line 1 <code>deny tcp any any eq ssh</code>, line 2 <code>permit tcp any object WEB eq www</code>, line 3 <code>permit tcp host 198.51.100.10 object WEB eq ssh</code>. The partner still cannot SSH.</p>
<pre class="code"><span class="c">! task 1: trace and read the ACL</span>
enable
packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 22
show access-list OUTSIDE_IN</pre>
<pre class="out">access-list OUTSIDE_IN line 1 extended deny tcp any any eq ssh (hitcnt=31) 0x3b7d91c2
access-list OUTSIDE_IN line 2 extended permit tcp any object WEB eq www (hitcnt=58) 0x1c2a31fe
<span class="hl">access-list OUTSIDE_IN line 3 extended permit tcp host 198.51.100.10 object WEB eq ssh (hitcnt=0) 0x9e02d41b</span></pre>
<p>The trace shows ACCESS-LIST DROP with the ACE <code>deny tcp any any eq ssh</code>, which is <b>line 1</b>. The partner permit on line 3 is shadowed: hitcnt 0.</p>
<pre class="code"><span class="c">! task 2: move the partner permit above the deny</span>
configure terminal
no access-list OUTSIDE_IN extended permit tcp host 198.51.100.10 object WEB eq ssh
access-list OUTSIDE_IN line 1 extended permit tcp host 198.51.100.10 object WEB eq ssh
end</pre>
<p><b>Task 3, verify both ways.</b> From PARTNER <code>ssh -l admin 203.0.113.3</code> now connects; from INET SSH is still denied by the deny (now line 2); INET web to 203.0.113.3 still works. <code>show access-list OUTSIDE_IN</code> shows the partner line's hitcnt rising.</p>

<div class="eg"><p><b>Worked example.</b> Why not simply delete the deny? Because the ticket says everyone else must stay blocked. Without the deny, SSH from INET would still be blocked by the implicit deny today, but the explicit deny with <code>log</code> gives security visibility, and it protects the policy if someone later adds a broad permit lower down.</p></div>

<div class="warn"><p><b>Common mistakes in the labs.</b> Writing the ACEs for 203.0.113.3 and 203.0.113.4; binding with <code>out</code>; forgetting the HTTPS line; answering the line number from memory instead of from the trace; adding the partner permit again at the bottom (it stays shadowed).</p></div>

<div class="exam"><p><b>Exam trap.</b> "A specific permit is below a broad deny. What is the least disruptive fix?" Insert or move the specific permit above the deny with <code>line N</code>; do not remove the deny or rewrite the whole ACL.</p></div>

<div class="scn"><h4>The Monday morning partner escalation</h4><p>A SaaS company's partner escalated that their support engineers could not SSH into a shared staging server, a week after a change that "added their rule". The on-call engineer followed the workflow: the access-group was correct, packet-tracer showed a drop by a broad SSH deny at line 1, and the partner's permit at line 7 had zero hits. She moved the permit to line 1 with a remark carrying the incident number, re-traced (ALLOW), confirmed an internet SSH trace still dropped, and attached both traces to the incident.</p><p><b>Lesson:</b> a fixed workflow finds order problems in minutes, and proving both directions stops a fix from opening something else.</p></div>

<div class="iv"><p class="q">"A partner says your firewall blocks them even though a rule was added for them. How do you troubleshoot?"</p><p>Strong answer: get the exact source, destination as they use it, and port; confirm the ACL is bound inbound on outside; run packet-tracer and see which ACE decided; check show access-list for order (a broader deny above), real versus mapped addresses and hit counts; check syslog; make the minimal fix, such as moving the permit to line 1; then prove the partner works and others are still blocked.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: define flow, check binding, trace, read ACL and NAT, check logs, minimal fix, prove both ways.</li>
<li>Lab 1: PUBLIC-SERVERS group, four ACEs on real objects, access-group in on outside.</li>
<li>Lab 2: packet-tracer shows the deny at line 1; move the partner permit to line 1.</li>
<li>Zero hits under a broader rule = shadowing; zero hits plus untranslate_hits = mapped-IP ACE.</li>
<li>Always verify that the flows that must stay blocked are still blocked.</li>
</ul></div>
`,hi:`
<p>Yeh chapter aapko kisi bhi "firewall ise block kar raha hai" ticket ke liye ek repeatable workflow deta hai, aur phir is module ki dono labs step by step walk karata hai, unhi exact device names, addresses aur commands ke saath jo labs check karti hain.</p>

<h3>Analogy: doctor ki checklist</h3>
<p>Achha doctor andaaza nahi lagata. Woh symptoms poochta hai, measurements leta hai, ek waqt mein ek hypothesis test karta hai aur sabse chhota effective ilaaj deta hai. Firewall engineer bhi yahi karta hai: flow define karo, trace karo, saboot padho, sabse chhota change karo, aur result saabit karo.</p>

<h3>ACL troubleshooting workflow</h3>
<ol>
<li><b>Flow ko exactly define karo.</b> Source IP, destination jaisa client dekhta hai (public ya private), protocol, port, aur ingress interface.</li>
<li><b>Kya ACL bound hai?</b> <code>show running-config access-group</code>: sahi ACL, sahi interface, sahi direction (<code>in</code>)?</li>
<li><b>Trace karo.</b> <code>packet-tracer input &lt;ingress&gt; …</code>. Kaunsa phase drop karta hai, aur kis ACE (ya Implicit Rule) ne decide kiya?</li>
<li><b>ACL padho.</b> <code>show access-list NAME</code>: kya permit maujood hai, kya woh kisi broader deny ke upar hai, kya woh real addresses aur real ports use karta hai, kya uska hitcnt badhta hai?</li>
<li><b>NAT ka saboot check karo.</b> <code>show nat</code>: zero-hit ACE ke saath badhte untranslate_hits ka matlab ACE mapped IP use karti hai.</li>
<li><b>Logs check karo.</b> 106023 ya 106100 denied lines ACL aur real addresses ka naam leti hain; 710003 ka matlab to-the-box traffic.</li>
<li><b>Minimal fix karo</b>: ek ACE move, correct ya add karo, kabhi "permit ip any any" nahi.</li>
<li><b>Saabit karo</b>: dobara trace karo, asli traffic test karo, hitcnt dekho, confirm karo ki blocked flows abhi bhi blocked hain, aur access tight kiya ho to <code>clear conn</code> karo.</li>
</ol>

<table class="cmp"><tr><th>Symptom</th><th>Sabse likely cause</th><th>Saboot</th></tr>
<tr><td>ACL configured, kuch nahi badalta</td><td>access-group nahi, ya <code>out</code> bound</td><td>show running-config access-group</td></tr>
<tr><td>Permit hai, hitcnt 0, untranslate_hits badh rahe</td><td>ACE public (mapped) IP use karti hai</td><td>show nat, packet-tracer UN-NAT</td></tr>
<tr><td>Specific permit hitcnt 0, upar ki deny par hits</td><td>Rule order; pehla match jeetta hai</td><td>packet-tracer deny ACE dikhata hai</td></tr>
<tr><td>Port-forward fail, ACE 8080 use karti hai</td><td>ACE ko real port 80 use karna chahiye</td><td>packet-tracer Untranslate line</td></tr>
<tr><td>Access hataya lekin user abhi bhi connected</td><td>Existing connection</td><td>show conn address</td></tr>
<tr><td>Nayi ACL ke baad inside users ka internet gaya</td><td>Final permit ke bina inside par inbound ACL</td><td>INSIDE_IN ke saath 106023</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Troubleshooting loop">
<rect x="10" y="40" width="110" height="55" rx="8" fill="#e2e8f0"/><text x="65" y="72" text-anchor="middle" class="svg-ink" font-size="13">Flow define</text>
<rect x="135" y="40" width="110" height="55" rx="8" fill="#ddd6fe"/><text x="190" y="72" text-anchor="middle" class="svg-ink" font-size="13">packet-tracer</text>
<rect x="260" y="40" width="110" height="55" rx="8" fill="#fde68a"/><text x="315" y="64" text-anchor="middle" class="svg-ink" font-size="13">ACL, NAT,</text><text x="315" y="82" text-anchor="middle" class="svg-ink" font-size="13">logs</text>
<rect x="385" y="40" width="110" height="55" rx="8" fill="#fed7aa"/><text x="440" y="72" text-anchor="middle" class="svg-ink" font-size="13">Minimal fix</text>
<rect x="510" y="40" width="120" height="55" rx="8" fill="#bbf7d0"/><text x="570" y="72" text-anchor="middle" class="svg-ink" font-size="13">Dono taraf proof</text>
<line x1="120" y1="67" x2="135" y2="67" stroke="#64748b" stroke-width="2"/><line x1="245" y1="67" x2="260" y2="67" stroke="#64748b" stroke-width="2"/><line x1="370" y1="67" x2="385" y2="67" stroke="#64748b" stroke-width="2"/><line x1="495" y1="67" x2="510" y2="67" stroke="#64748b" stroke-width="2"/>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">Dono taraf proof = nayi flow pass ho AUR jo flows blocked rehni chahiye woh abhi bhi blocked hon</text>
</svg><p class="cap">Yahi loop dono labs solve karta hai.</p></div>

<h3>Lab 1: DMZ ko internet ke liye kholo, bilkul zaroorat bhar</h3>
<p><b>Starting point:</b> WEB (10.0.2.10, 203.0.113.3 ke roop mein published) aur MAIL (10.0.2.25, 203.0.113.4 ke roop mein published) ke objects mein pehle se static NAT hai. Outside par koi ACL nahi hai, isliye security levels internet se sab block karte hain. <b>Goal:</b> kahin se bhi WEB tak web (HTTP, HTTPS), kahin se bhi MAIL tak SMTP, dono tak SSH sirf PARTNER 198.51.100.10 se.</p>
<pre class="code">enable
configure terminal
<span class="c">! task 1: dono published servers ke liye ek group</span>
object-group network PUBLIC-SERVERS
 network-object object WEB
 network-object object MAIL
 exit
<span class="c">! task 2: objects ke through real addresses; group ke through partner SSH</span>
access-list OUTSIDE_IN extended permit tcp any object WEB eq www
access-list OUTSIDE_IN extended permit tcp any object WEB eq h&#116;tps
access-list OUTSIDE_IN extended permit tcp any object MAIL eq smtp
access-list OUTSIDE_IN extended permit tcp host 198.51.100.10 object-group PUBLIC-SERVERS eq ssh
access-group OUTSIDE_IN in interface outside
end</pre>
<p><b>Task 3, boundary saabit karo.</b> INET par <code>ssh -l admin 203.0.113.3</code> (fail hona chahiye) aur <code>curl 203.0.113.4</code> (MAIL tak web fail hona chahiye) chalao. Dono implicit deny par girte hain. PARTNER par, <code>ssh -l admin 203.0.113.3</code> aur 203.0.113.4 tak line 4 se succeed karte hain.</p>
<p><b>Task 4, kyun.</b> ACL 10.0.2.10 permit karti hai jabki customers 203.0.113.3 se connect karte hain, kyunki ASA <b>pehle destination untranslate karta hai aur phir ACL check karta hai</b> (8.3 aur baad).</p>
<pre class="out">NK-ASA# show access-list OUTSIDE_IN
access-list OUTSIDE_IN; 5 elements; name hash: 0x6892a938
access-list OUTSIDE_IN line 1 extended permit tcp any object WEB eq www (hitcnt=3) 0x1c2a31fe
access-list OUTSIDE_IN line 2 extended permit tcp any object WEB eq h&#116;tps (hitcnt=1) 0x7a04c8e1
access-list OUTSIDE_IN line 3 extended permit tcp any object MAIL eq smtp (hitcnt=1) 0x4f7e2b90
<span class="hl">access-list OUTSIDE_IN line 4 extended permit tcp host 198.51.100.10 object-group PUBLIC-SERVERS eq ssh (hitcnt=2) 0x2e4f1c07</span></pre>

<h3>Lab 2: Ticket INC-7719, partner exception kabhi match nahi hota</h3>
<p><b>Starting point:</b> OUTSIDE_IN pehle se hai, is order mein: line 1 <code>deny tcp any any eq ssh</code>, line 2 <code>permit tcp any object WEB eq www</code>, line 3 <code>permit tcp host 198.51.100.10 object WEB eq ssh</code>. Partner ab bhi SSH nahi kar pa raha.</p>
<pre class="code"><span class="c">! task 1: trace karo aur ACL padho</span>
enable
packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 22
show access-list OUTSIDE_IN</pre>
<pre class="out">access-list OUTSIDE_IN line 1 extended deny tcp any any eq ssh (hitcnt=31) 0x3b7d91c2
access-list OUTSIDE_IN line 2 extended permit tcp any object WEB eq www (hitcnt=58) 0x1c2a31fe
<span class="hl">access-list OUTSIDE_IN line 3 extended permit tcp host 198.51.100.10 object WEB eq ssh (hitcnt=0) 0x9e02d41b</span></pre>
<p>Trace ACE <code>deny tcp any any eq ssh</code> ke saath ACCESS-LIST DROP dikhata hai, jo <b>line 1</b> hai. Line 3 ka partner permit shadowed hai: hitcnt 0.</p>
<pre class="code"><span class="c">! task 2: partner permit ko deny ke upar le jao</span>
configure terminal
no access-list OUTSIDE_IN extended permit tcp host 198.51.100.10 object WEB eq ssh
access-list OUTSIDE_IN line 1 extended permit tcp host 198.51.100.10 object WEB eq ssh
end</pre>
<p><b>Task 3, dono taraf verify karo.</b> PARTNER se <code>ssh -l admin 203.0.113.3</code> ab connect hota hai; INET se SSH abhi bhi deny (ab line 2) se denied hai; INET ka 203.0.113.3 tak web abhi bhi chalta hai. <code>show access-list OUTSIDE_IN</code> partner line ka hitcnt badhta dikhata hai.</p>

<div class="eg"><p><b>Worked example.</b> Deny ko seedha delete kyun nahi karte? Kyunki ticket kehta hai ki baaki sab blocked rehne chahiye. Deny ke bina, INET se SSH aaj bhi implicit deny se blocked rehta, lekin <code>log</code> wali explicit deny security ko visibility deti hai, aur policy ko bachati hai agar koi baad mein neeche broad permit jod de.</p></div>

<div class="warn"><p><b>Labs ki common galtiyan.</b> ACEs 203.0.113.3 aur 203.0.113.4 ke liye likhna; <code>out</code> ke saath bind karna; HTTPS line bhool jaana; line number trace se nahi, yaaddasht se batana; partner permit ko dobara neeche jodna (woh shadowed hi rehta hai).</p></div>

<div class="exam"><p><b>Exam trap.</b> "Ek specific permit broad deny ke neeche hai. Sabse kam disruptive fix kya hai?" <code>line N</code> se specific permit ko deny ke upar insert ya move karo; deny mat hatao aur poori ACL dobara mat likho.</p></div>

<div class="scn"><h4>Monday subah ka partner escalation</h4><p>Ek SaaS company ke partner ne escalate kiya ki unke support engineers ek shared staging server par SSH nahi kar pa rahe, "unki rule jodne" wale change ke ek hafte baad. On-call engineer ne workflow follow kiya: access-group sahi tha, packet-tracer ne line 1 par broad SSH deny se drop dikhaya, aur line 7 par partner ke permit par zero hits the. Usne incident number wale remark ke saath permit ko line 1 par move kiya, dobara trace kiya (ALLOW), confirm kiya ki internet SSH trace abhi bhi drop hota hai, aur dono traces incident mein attach kiye.</p><p><b>Seekh:</b> fixed workflow order problems minutes mein dhoondhta hai, aur dono directions saabit karne se fix kuch aur nahi kholta.</p></div>

<div class="iv"><p class="q">"Partner kehta hai aapka firewall unhe block karta hai jabki unke liye rule jodi gayi thi. Aap kaise troubleshoot karoge?"</p><p>Strong answer: exact source, destination jaisa woh use karte hain, aur port lo; confirm karo ki ACL outside par inbound bound hai; packet-tracer chalao aur dekho kis ACE ne decide kiya; show access-list mein order (upar broader deny), real banaam mapped addresses aur hit counts check karo; syslog check karo; minimal fix karo, jaise permit ko line 1 par move karna; phir saabit karo ki partner chalta hai aur baaki abhi bhi blocked hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: flow define, binding check, trace, ACL aur NAT padho, logs check, minimal fix, dono taraf proof.</li>
<li>Lab 1: PUBLIC-SERVERS group, real objects par chaar ACEs, outside par access-group in.</li>
<li>Lab 2: packet-tracer line 1 par deny dikhata hai; partner permit ko line 1 par move karo.</li>
<li>Broader rule ke neeche zero hits = shadowing; zero hits plus untranslate_hits = mapped-IP ACE.</li>
<li>Hamesha verify karo ki jo flows blocked rehni chahiye woh abhi bhi blocked hain.</li>
</ul></div>
`}};export{e as default};