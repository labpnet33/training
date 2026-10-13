var e={id:`verify`,h:{en:`Troubleshooting workflow: verify AI output like an engineer`,hi:`Troubleshooting workflow: AI output ko engineer ki tarah verify karo`},body:{en:`
<p>A good editor does not rewrite every sentence a junior journalist submits, and does not publish it blindly either. They check the facts that matter: names, numbers, quotes, sources. Verifying AI output is the same skill. You do not redo all the AI's work; you check each claim that would change the network, against evidence you gathered yourself. This chapter turns that into a repeatable workflow and walks through ticket NOC-2291 from the lab, where the assistant is right once and confidently wrong once.</p>

<h3>The five questions for any AI recommendation</h3>
<ol>
<li><b>Where is the evidence?</b> Which show output, log line or counter supports this claim?</li>
<li><b>Can I reproduce it?</b> Run the command yourself; do not trust a quoted output.</li>
<li><b>What was not checked?</b> Ask the tool, and think of the standard checklist for that protocol.</li>
<li><b>Does the action fix the cause or only the symptom?</b> A restart cannot fix a configuration mismatch.</li>
<li><b>What is the blast radius and the rollback?</b> What else does this command touch, and how do I undo it?</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Verification workflow">
<rect x="5" y="40" width="95" height="60" rx="8" fill="#e2e8f0"/><text x="52" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Scope the</text><text x="52" y="84" text-anchor="middle" class="svg-ink" font-size="12">ticket</text>
<rect x="110" y="40" width="95" height="60" rx="8" fill="#fde68a"/><text x="157" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 AI analyse</text><text x="157" y="84" text-anchor="middle" class="svg-ink" font-size="12">and plan</text>
<rect x="215" y="40" width="95" height="60" rx="8" fill="#ddd6fe"/><text x="262" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 Explain:</text><text x="262" y="84" text-anchor="middle" class="svg-ink" font-size="12">gaps, impact</text>
<rect x="320" y="40" width="95" height="60" rx="8" fill="#bae6fd"/><text x="367" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 Verify with</text><text x="367" y="84" text-anchor="middle" class="svg-ink" font-size="12">show cmds</text>
<rect x="425" y="40" width="95" height="60" rx="8" fill="#bbf7d0"/><text x="472" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 Approve or</text><text x="472" y="84" text-anchor="middle" class="svg-ink" font-size="12">reject</text>
<rect x="530" y="40" width="105" height="60" rx="8" fill="#fed7aa"/><text x="582" y="66" text-anchor="middle" class="svg-ink" font-size="12">6 Fix cause,</text><text x="582" y="84" text-anchor="middle" class="svg-ink" font-size="12">test end to end</text>
<line x1="100" y1="70" x2="110" y2="70" stroke="#64748b" stroke-width="2"/>
<line x1="205" y1="70" x2="215" y2="70" stroke="#64748b" stroke-width="2"/>
<line x1="310" y1="70" x2="320" y2="70" stroke="#64748b" stroke-width="2"/>
<line x1="415" y1="70" x2="425" y2="70" stroke="#64748b" stroke-width="2"/>
<line x1="520" y1="70" x2="530" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The AI speeds up steps 2 and 3. Steps 4 to 6 are the engineer's.</p></div>

<h3>Step 1: scope the ticket</h3>
<p>NOC-2291 (P1): Pune users on 192.168.50.0/24 cannot open the ERP server 10.30.30.50, and monitoring shows an OSPF alarm on CORE. Path: PCU → PUNE-EDGE (R1) → CORE (R2) → DC (R3) → ERP. You work from the NOC host (10.0.0.10).</p>

<h3>Step 2: let the assistant analyse and plan</h3>
<pre class="out">NOC&gt; copilot plan
NK Copilot remediation plan (ordered by confidence; nothing is applied without approval)
 1. [R1] Gi0/2 on PUNE-EDGE is administratively down  (confidence 93%)
      interface GigabitEthernet0/2
      no shutdown
<span class="hl"> 2. [R2] OSPF neighbour 10.30.30.1 (DC) stuck in EXSTART on Gi0/2  (confidence 81%)
      R2# clear ip ospf process</span>
Commands: copilot explain N | copilot apply N | copilot reject N &lt;reason&gt; | copilot agent --approve-each</pre>

<h3>Step 3: make it explain itself</h3>
<pre class="out">NOC&gt; copilot explain 2
Step 2: OSPF neighbour 10.30.30.1 (DC) stuck in EXSTART on Gi0/2
  reasoning  : The adjacency is not reaching FULL. This pattern usually clears after a soft reset of the OSPF process on CORE.
  confidence : 81%
  evidence   :
    - show ip ospf neighbor: 10.30.30.1 in EXSTART
    - syslog: no recent adjacency messages (the problem is older than the log buffer)
  not checked:
<span class="hl">    - did not compare interface MTU on both ends</span>
    - did not compare the OSPF area / network statements
    - did not check passive-interface or authentication settings
  impact     : restarts the protocol on R2 - ALL its adjacencies drop for a few seconds
  Verify it yourself before approving.</pre>
<p>Three red flags: the reasoning is "this pattern usually clears" (symptom matching, no cause), the "not checked" list contains exactly the classic causes of EXSTART, and the impact drops <i>every</i> adjacency on CORE, including the healthy one to PUNE-EDGE. If you push back with <code>copilot ask "could it be MTU?"</code>, it even answers "Unlikely ... (confidence 72%)" while admitting it did not read the MTU values. Fluent, confident, ungrounded.</p>

<h3>Step 4: verify with your own show commands</h3>
<p>Step 1 checks out: <code>show ip interface brief</code> on PUNE-EDGE shows Gi0/2 administratively down, and its description is PUNE-USERS, not reserved. Apply it with <code>copilot apply 1</code> and answer yes; the copilot logs in, runs the two lines and the post-check passes. Now step 2:</p>
<pre class="out">CORE# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
10.12.0.1         1   FULL/BDR        00:00:37    10.12.0.1       GigabitEthernet0/1
<span class="hl">10.30.30.1        1   EXSTART/DR      00:00:33    10.23.0.1       GigabitEthernet0/2</span>

CORE# show ip interface GigabitEthernet0/2 | include MTU
  <span class="hl">MTU is 1500 bytes</span>
DC# show ip interface GigabitEthernet0/0 | include MTU
  <span class="hl">MTU is 1400 bytes</span>
DC# show running-config interface GigabitEthernet0/0 | include mtu
 ip mtu 1400</pre>
<p>EXSTART/EXCHANGE is where routers swap Database Description (DBD) packets, which carry the interface MTU. When the MTUs differ, the DBD from the side with the larger MTU is rejected, so the adjacency never reaches FULL. That is a configuration mismatch; restarting OSPF would bring the adjacency straight back to the same state. (In the lab, <code>show interfaces</code> also prints an IP MTU line you can compare.)</p>

<h3>Step 5: approve or reject, with a reason</h3>
<pre class="out">NOC&gt; copilot reject 2 MTU mismatch between CORE (1500) and DC (1400)
Step 2 rejected. Reason recorded: MTU mismatch between CORE (1500) and DC (1400)
Copilot: thanks - feedback noted. (Good catch: that suggestion only matched the symptom.)</pre>
<p>The reason goes into the audit log, so the next engineer, and the team tuning the tool, can learn from it.</p>

<h3>Step 6: fix the real cause and test end to end</h3>
<pre class="code"><span class="c">! DC: remove the odd MTU so both ends use 1500</span>
DC# configure terminal
DC(config)# interface GigabitEthernet0/0
DC(config-if)# no ip mtu
DC(config-if)# end</pre>
<pre class="out">CORE# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
10.12.0.1         1   FULL/BDR        00:00:35    10.12.0.1       GigabitEthernet0/1
<span class="hl">10.30.30.1        1   FULL/DR         00:00:39    10.23.0.1       GigabitEthernet0/2</span>

PCU&gt; ping 10.30.30.50
<span class="hl">84 bytes from 10.30.30.50 icmp_seq=1 ttl=61 time=3.912 ms</span>
84 bytes from 10.30.30.50 icmp_seq=2 ttl=61 time=2.407 ms</pre>
<p>Only now is the ticket closed: root cause "MTU mismatch", fixed on DC, verified with the neighbour state and an end-to-end test from a Pune user. The guardrails lab has the same cause on CORE instead (<code>ip mtu 1400</code> on CORE Gi0/2), fixed with <code>no ip mtu</code> there.</p>

<div class="eg"><p><b>Worked example: the time maths.</b> The assistant produced its analysis in 10 seconds. Verification took you about 4 minutes: two neighbour checks, two MTU checks, one config line. Blindly approving step 2 would have dropped the CORE–PUNE adjacency for a few seconds, fixed nothing, and wasted another 20 minutes of a P1 outage while people wondered why the "fix" failed. Four minutes of verification is cheap insurance.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Verifying only the claims you already believe. Trusting the output the AI quotes instead of running the command yourself. Approving a bundle of steps together because the first one was right. Declaring victory at "OSPF is FULL" without the end-to-end user test.</p></div>
<div class="exam"><p><b>Exam trap.</b> OSPF neighbours stuck in EXSTART or EXCHANGE point to an MTU mismatch; a process restart does not fix it. A high confidence score is not evidence. The correct action when an AI suggestion conflicts with device output is to trust the verified device output and reject the suggestion.</p></div>

<div class="scn"><h4>The copilot that was 93% sure</h4><p>In a pilot, an assistant proposed "no shutdown" on a data-centre switch port with 93% confidence, because the port was down and a cable was connected. The on-call engineer checked the port description: RESERVED-DO-NOT-ENABLE, a quarantined server under forensic investigation. Enabling it would have reconnected a compromised host. The engineer rejected the step with the reason, and the tool owners added "read the interface description and change records" to the assistant's checks.</p><p><b>Lesson:</b> ask what the AI did not check; the missing context is often the part that matters most.</p></div>

<div class="iv"><p class="q">"An AI assistant tells you to restart OSPF to fix a stuck neighbour. What do you do?"</p><p>Strong answer: I do not approve it yet. I check the neighbour state; if it is EXSTART or EXCHANGE, I compare the MTU on both ends; if it is INIT or not listed, I check hello/dead timers, area, authentication, passive-interface and subnet/mask. I ask the tool what it did not check and what the impact is (a restart drops all adjacencies on that router). If the evidence shows a mismatch, I reject the suggestion with the reason, fix the configuration, and verify with the neighbour table and an end-to-end test.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ask five questions: evidence, reproducible, not checked, cause or symptom, blast radius and rollback.</li>
<li>Use the AI to gather and explain; use your own show commands to decide.</li>
<li>Approve steps one at a time; reject wrong ones with a recorded reason.</li>
<li>EXSTART/EXCHANGE with different MTUs is a configuration mismatch; restarting OSPF cannot fix it.</li>
<li>Close only after the root cause is fixed and an end-to-end user test passes.</li>
</ul></div>
`,hi:`
<p>Achha editor junior journalist ka har sentence dobara nahi likhta, aur bina dekhe publish bhi nahi karta. Woh woh facts check karta hai jo matter karte hain: names, numbers, quotes, sources. AI output verify karna bhi yahi skill hai. Aap AI ka saara kaam dobara nahi karte; aap har us claim ko jo network badlega, apne jama kiye evidence ke against check karte ho. Yeh chapter ise repeatable workflow banata hai aur lab ke ticket NOC-2291 ko walk through karta hai, jahan assistant ek baar sahi hai aur ek baar confidently galat.</p>

<h3>Kisi bhi AI recommendation ke liye paanch sawaal</h3>
<ol>
<li><b>Evidence kahan hai?</b> Kaunsa show output, log line ya counter is claim ko support karta hai?</li>
<li><b>Kya main ise reproduce kar sakta hoon?</b> Command khud chalao; quote kiye output par trust mat karo.</li>
<li><b>Kya check nahi hua?</b> Tool se poocho, aur us protocol ki standard checklist socho.</li>
<li><b>Action cause fix karta hai ya sirf symptom?</b> Restart configuration mismatch theek nahi kar sakta.</li>
<li><b>Blast radius aur rollback kya hai?</b> Yeh command aur kya chhooti hai, aur main ise undo kaise karunga?</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Verification workflow">
<rect x="5" y="40" width="95" height="60" rx="8" fill="#e2e8f0"/><text x="52" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Ticket ka</text><text x="52" y="84" text-anchor="middle" class="svg-ink" font-size="12">scope</text>
<rect x="110" y="40" width="95" height="60" rx="8" fill="#fde68a"/><text x="157" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 AI analyse</text><text x="157" y="84" text-anchor="middle" class="svg-ink" font-size="12">aur plan</text>
<rect x="215" y="40" width="95" height="60" rx="8" fill="#ddd6fe"/><text x="262" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 Explain:</text><text x="262" y="84" text-anchor="middle" class="svg-ink" font-size="12">gaps, impact</text>
<rect x="320" y="40" width="95" height="60" rx="8" fill="#bae6fd"/><text x="367" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 Show cmds se</text><text x="367" y="84" text-anchor="middle" class="svg-ink" font-size="12">verify</text>
<rect x="425" y="40" width="95" height="60" rx="8" fill="#bbf7d0"/><text x="472" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 Approve ya</text><text x="472" y="84" text-anchor="middle" class="svg-ink" font-size="12">reject</text>
<rect x="530" y="40" width="105" height="60" rx="8" fill="#fed7aa"/><text x="582" y="66" text-anchor="middle" class="svg-ink" font-size="12">6 Cause fix,</text><text x="582" y="84" text-anchor="middle" class="svg-ink" font-size="12">end to end test</text>
<line x1="100" y1="70" x2="110" y2="70" stroke="#64748b" stroke-width="2"/>
<line x1="205" y1="70" x2="215" y2="70" stroke="#64748b" stroke-width="2"/>
<line x1="310" y1="70" x2="320" y2="70" stroke="#64748b" stroke-width="2"/>
<line x1="415" y1="70" x2="425" y2="70" stroke="#64748b" stroke-width="2"/>
<line x1="520" y1="70" x2="530" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">AI steps 2 aur 3 tez karta hai. Steps 4 se 6 engineer ke hain.</p></div>

<h3>Step 1: ticket ka scope</h3>
<p>NOC-2291 (P1): 192.168.50.0/24 ke Pune users ERP server 10.30.30.50 nahi khol pa rahe, aur monitoring CORE par OSPF alarm dikha rahi hai. Path: PCU → PUNE-EDGE (R1) → CORE (R2) → DC (R3) → ERP. Aap NOC host (10.0.0.10) se kaam karte ho.</p>

<h3>Step 2: assistant ko analyse aur plan karne do</h3>
<pre class="out">NOC&gt; copilot plan
NK Copilot remediation plan (ordered by confidence; nothing is applied without approval)
 1. [R1] Gi0/2 on PUNE-EDGE is administratively down  (confidence 93%)
      interface GigabitEthernet0/2
      no shutdown
<span class="hl"> 2. [R2] OSPF neighbour 10.30.30.1 (DC) stuck in EXSTART on Gi0/2  (confidence 81%)
      R2# clear ip ospf process</span>
Commands: copilot explain N | copilot apply N | copilot reject N &lt;reason&gt; | copilot agent --approve-each</pre>

<h3>Step 3: use khud ko explain karne do</h3>
<pre class="out">NOC&gt; copilot explain 2
Step 2: OSPF neighbour 10.30.30.1 (DC) stuck in EXSTART on Gi0/2
  reasoning  : The adjacency is not reaching FULL. This pattern usually clears after a soft reset of the OSPF process on CORE.
  confidence : 81%
  evidence   :
    - show ip ospf neighbor: 10.30.30.1 in EXSTART
    - syslog: no recent adjacency messages (the problem is older than the log buffer)
  not checked:
<span class="hl">    - did not compare interface MTU on both ends</span>
    - did not compare the OSPF area / network statements
    - did not check passive-interface or authentication settings
  impact     : restarts the protocol on R2 - ALL its adjacencies drop for a few seconds
  Verify it yourself before approving.</pre>
<p>Teen red flags: reasoning hai "yeh pattern usually clear ho jaata hai" (symptom matching, cause nahi), "not checked" list mein bilkul EXSTART ke classic causes hain, aur impact CORE ki <i>har</i> adjacency girata hai, PUNE-EDGE wali healthy adjacency samet. Agar aap <code>copilot ask "could it be MTU?"</code> se push back karo, to woh "Unlikely ... (confidence 72%)" tak bol deta hai, jabki maanta hai ki usne MTU values padhi hi nahi. Fluent, confident, ungrounded.</p>

<h3>Step 4: apni show commands se verify karo</h3>
<p>Step 1 sahi nikalta hai: PUNE-EDGE par <code>show ip interface brief</code> Gi0/2 ko administratively down dikhata hai, aur uska description PUNE-USERS hai, reserved nahi. Ise <code>copilot apply 1</code> se apply karo aur yes bolo; copilot login karta hai, do lines chalata hai aur post-check pass hota hai. Ab step 2:</p>
<pre class="out">CORE# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
10.12.0.1         1   FULL/BDR        00:00:37    10.12.0.1       GigabitEthernet0/1
<span class="hl">10.30.30.1        1   EXSTART/DR      00:00:33    10.23.0.1       GigabitEthernet0/2</span>

CORE# show ip interface GigabitEthernet0/2 | include MTU
  <span class="hl">MTU is 1500 bytes</span>
DC# show ip interface GigabitEthernet0/0 | include MTU
  <span class="hl">MTU is 1400 bytes</span>
DC# show running-config interface GigabitEthernet0/0 | include mtu
 ip mtu 1400</pre>
<p>EXSTART/EXCHANGE woh jagah hai jahan routers Database Description (DBD) packets exchange karte hain, jinmein interface MTU hota hai. Jab MTUs alag hote hain, bade MTU wali side ka DBD reject hota hai, isliye adjacency kabhi FULL nahi hoti. Yeh configuration mismatch hai; OSPF restart karne se adjacency seedhe usi state mein wapas aa jaayegi. (Lab mein <code>show interfaces</code> bhi ek IP MTU line print karta hai jise aap compare kar sakte ho.)</p>

<h3>Step 5: wajah ke saath approve ya reject</h3>
<pre class="out">NOC&gt; copilot reject 2 MTU mismatch between CORE (1500) and DC (1400)
Step 2 rejected. Reason recorded: MTU mismatch between CORE (1500) and DC (1400)
Copilot: thanks - feedback noted. (Good catch: that suggestion only matched the symptom.)</pre>
<p>Wajah audit log mein jaati hai, taaki agla engineer, aur tool tune karne wali team, usse seekh sake.</p>

<h3>Step 6: asli cause fix karo aur end to end test karo</h3>
<pre class="code"><span class="c">! DC: alag MTU hatao taaki dono ends 1500 use karein</span>
DC# configure terminal
DC(config)# interface GigabitEthernet0/0
DC(config-if)# no ip mtu
DC(config-if)# end</pre>
<pre class="out">CORE# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
10.12.0.1         1   FULL/BDR        00:00:35    10.12.0.1       GigabitEthernet0/1
<span class="hl">10.30.30.1        1   FULL/DR         00:00:39    10.23.0.1       GigabitEthernet0/2</span>

PCU&gt; ping 10.30.30.50
<span class="hl">84 bytes from 10.30.30.50 icmp_seq=1 ttl=61 time=3.912 ms</span>
84 bytes from 10.30.30.50 icmp_seq=2 ttl=61 time=2.407 ms</pre>
<p>Ab jaakar ticket close hota hai: root cause "MTU mismatch", DC par fix, neighbour state aur Pune user se end-to-end test se verified. Guardrails lab mein same cause CORE par hai (CORE Gi0/2 par <code>ip mtu 1400</code>), jo wahan <code>no ip mtu</code> se fix hota hai.</p>

<div class="eg"><p><b>Worked example: time ka hisaab.</b> Assistant ne apna analysis 10 second mein diya. Verification mein aapko lagbhag 4 minute lage: do neighbour checks, do MTU checks, ek config line. Step 2 ko bina dekhe approve karne se CORE–PUNE adjacency kuch seconds ke liye girti, kuch theek nahi hota, aur P1 outage ke aur 20 minute waste hote jab log sochte ki "fix" fail kyun hua. Chaar minute ka verification sasta insurance hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Sirf woh claims verify karna jin par aap pehle se yakeen karte ho. Command khud chalane ki jagah AI ke quote kiye output par trust karna. Pehla sahi tha isliye steps ka bundle ek saath approve kar dena. End-to-end user test ke bina "OSPF FULL hai" par jeet declare karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> EXSTART ya EXCHANGE mein atke OSPF neighbours MTU mismatch ki taraf ishaara karte hain; process restart se yeh theek nahi hota. High confidence score evidence nahi hai. Jab AI suggestion device output se takraaye, sahi action hai verified device output par trust karna aur suggestion reject karna.</p></div>

<div class="scn"><h4>Woh copilot jo 93% sure tha</h4><p>Ek pilot mein assistant ne data-centre switch port par 93% confidence ke saath "no shutdown" propose kiya, kyunki port down tha aur cable juda tha. On-call engineer ne port description check kiya: RESERVED-DO-NOT-ENABLE, forensic investigation wala quarantined server. Ise enable karne se compromised host dobara jud jaata. Engineer ne wajah ke saath step reject kiya, aur tool owners ne assistant ke checks mein "interface description aur change records padho" joda.</p><p><b>Seekh:</b> poocho ki AI ne kya check nahi kiya; missing context aksar wahi hissa hota hai jo sabse zyada matter karta hai.</p></div>

<div class="iv"><p class="q">"AI assistant aapko atke neighbour ko theek karne ke liye OSPF restart karne ko kehta hai. Aap kya karoge?"</p><p>Strong answer: main abhi approve nahi karunga. Neighbour state check karunga; agar EXSTART ya EXCHANGE hai, dono ends ka MTU compare karunga; agar INIT hai ya list mein nahi hai, hello/dead timers, area, authentication, passive-interface aur subnet/mask check karunga. Tool se poochunga usne kya check nahi kiya aur impact kya hai (restart us router ki saari adjacencies girata hai). Agar evidence mismatch dikhata hai, wajah ke saath suggestion reject karunga, configuration fix karunga, aur neighbour table aur end-to-end test se verify karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch sawaal poocho: evidence, reproducible, kya check nahi hua, cause ya symptom, blast radius aur rollback.</li>
<li>AI ko gather aur explain karne ke liye use karo; decide apni show commands se karo.</li>
<li>Steps ek-ek karke approve karo; galat waale recorded wajah ke saath reject karo.</li>
<li>Alag MTUs ke saath EXSTART/EXCHANGE configuration mismatch hai; OSPF restart ise theek nahi kar sakta.</li>
<li>Root cause fix hone aur end-to-end user test pass hone ke baad hi close karo.</li>
</ul></div>
`}};export{e as default};