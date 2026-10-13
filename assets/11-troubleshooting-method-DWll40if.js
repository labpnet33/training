var e={id:`troubleshooting-method`,h:{en:`A troubleshooting method for CCNP, with a worked ticket`,hi:`CCNP ke liye troubleshooting method, ek worked ticket ke saath`},body:{en:`
<p>A good doctor does not guess. She asks what the symptoms are and when they started, examines you, forms a hypothesis, orders a test that proves or disproves it, treats the cause, and writes everything in your file. A weak doctor treats the first symptom she sees. Networks are the same: random command-typing sometimes works, but it does not scale to multi-domain problems, and it is exactly what CCNP-level interviews and escalations punish. This chapter gives you a repeatable method and walks through one real-style ticket from start to finish.</p>

<h3>The structured process</h3>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Structured troubleshooting process">
<rect x="10" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="12">1 Define problem</text>
<rect x="170" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="240" y="47" text-anchor="middle" class="svg-ink" font-size="12">2 Gather facts</text>
<rect x="330" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="400" y="47" text-anchor="middle" class="svg-ink" font-size="12">3 Analyse</text>
<rect x="490" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="560" y="47" text-anchor="middle" class="svg-ink" font-size="12">4 Eliminate</text>
<rect x="490" y="110" width="140" height="44" rx="8" fill="#fde68a"/><text x="560" y="137" text-anchor="middle" class="svg-ink" font-size="12">5 Hypothesis</text>
<rect x="330" y="110" width="140" height="44" rx="8" fill="#fde68a"/><text x="400" y="137" text-anchor="middle" class="svg-ink" font-size="12">6 Test it</text>
<rect x="170" y="110" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="240" y="137" text-anchor="middle" class="svg-ink" font-size="12">7 Fix and verify</text>
<rect x="10" y="110" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="137" text-anchor="middle" class="svg-ink" font-size="12">8 Document</text>
<line x1="150" y1="42" x2="170" y2="42" stroke="#64748b" stroke-width="2"/><line x1="310" y1="42" x2="330" y2="42" stroke="#64748b" stroke-width="2"/><line x1="470" y1="42" x2="490" y2="42" stroke="#64748b" stroke-width="2"/>
<line x1="560" y1="64" x2="560" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="490" y1="132" x2="470" y2="132" stroke="#64748b" stroke-width="2"/><line x1="330" y1="132" x2="310" y2="132" stroke="#64748b" stroke-width="2"/><line x1="170" y1="132" x2="150" y2="132" stroke="#64748b" stroke-width="2"/>
<path d="M400 154 L400 180 L560 180 L560 154" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="480" y="198" text-anchor="middle" class="svg-accent" font-size="12">disproved: next hypothesis</text>
<text x="320" y="228" text-anchor="middle" class="svg-muted" font-size="12">Never skip step 1 or step 8</text>
</svg><p class="cap">The structured approach: define, gather, analyse, eliminate, hypothesise, test, fix, document.</p></div>
<ol>
<li><b>Define the problem</b> precisely: who is affected, what exactly fails, since when, is it constant or intermittent, and <b>what changed</b>.</li>
<li><b>Gather facts</b>: outputs, logs, monitoring graphs, the change record, the topology.</li>
<li><b>Analyse</b> the facts against how the network should work (your baseline).</li>
<li><b>Eliminate</b> what is proven good.</li>
<li><b>Hypothesise</b> the most likely cause from what remains.</li>
<li><b>Test</b> the hypothesis with a change you can roll back, or with a read-only check.</li>
<li><b>Fix and verify</b> from the user's point of view, not only the router's.</li>
<li><b>Document</b>: root cause, fix, and how to prevent it next time.</li>
</ol>

<h3>Choosing a method</h3>
<table class="cmp"><tr><th>Method</th><th>How</th><th>Best when</th></tr>
<tr><td>Top-down</td><td>Start at the application and move down the layers</td><td>The problem looks application-specific</td></tr>
<tr><td>Bottom-up</td><td>Start at the cable and move up</td><td>Physical symptoms: link flaps, CRC errors, a new install</td></tr>
<tr><td>Divide and conquer</td><td>Start in the middle (a Layer 3 ping), then go up or down depending on the result</td><td>You have no strong clue; usually the fastest general method</td></tr>
<tr><td>Follow the path</td><td>Trace the packet hop by hop, checking forwarding and filters on each device, <b>in both directions</b></td><td>Some sources or destinations work and others do not</td></tr>
<tr><td>Compare configurations</td><td>Diff against a working device or an earlier archive</td><td>Something worked before a change, or works on a sister device</td></tr>
<tr><td>Swap components</td><td>Replace the cable, optic, port or device</td><td>Suspected hardware fault, with spares available</td></tr>
</table>

<h3>Worked ticket: INC-4471</h3>
<div class="eg"><p><b>Ticket.</b> "Branch BR1 users (10.2.10.0/24) cannot open the ERP application at 10.10.20.10 since this morning. HQ users are fine. Branch users can still reach the file server 10.10.30.20." The change calendar shows a security change on DC-SW1 last night.</p></div>
<p><b>Step 1, define.</b> Affected: branch sources only. Destination: ERP only, other DC servers fine. Since: after last night's change. This already points to something specific to the ERP destination <b>and</b> the branch source, which smells like a filter rather than routing.</p>
<p><b>Step 2 and 3, divide and conquer, then follow the path.</b> Test Layer 3 and the application from the branch, sourced from the user subnet:</p>
<pre class="out">BR1# traceroute 10.10.20.10 source GigabitEthernet0/1/0 numeric
Type escape sequence to abort.
Tracing the route to 10.10.20.10
  1 10.0.2.1 2 msec 1 msec 1 msec
  2 10.0.0.13 2 msec 2 msec 2 msec
  <span class="hl">3 10.0.0.9 3 msec 2 msec 3 msec</span>
  4  *  *  *
BR1# telnet 10.10.20.10 443 /source-interface GigabitEthernet0/1/0
Trying 10.10.20.10, 443 ...
<span class="hl">% Connection timed out; remote host not responding</span></pre>
<p>The path WAN1 (10.0.2.1), CORE1 (10.0.0.13), DC-SW1 (10.0.0.9) is correct and every hop answers, so routing in both directions to DC-SW1 works. The packet dies after DC-SW1, the last device before the server.</p>
<p><b>Step 4 and 5, eliminate and hypothesise.</b> Routing is proven good, and the file server in another VLAN works. Hypothesis: last night's change added a filter on DC-SW1 that blocks branch sources to the ERP VLAN.</p>
<p><b>Step 6, test (read-only).</b></p>
<pre class="out">DC-SW1# show running-config interface Vlan20 | include access-group
 ip access-group ERP-PROTECT out
DC-SW1# show ip access-lists ERP-PROTECT
Extended IP access list ERP-PROTECT
    10 permit tcp 10.1.0.0 0.0.255.255 host 10.10.20.10 eq 443 (18231 matches)
    <span class="hl">20 permit tcp 10.2.0.0 0.0.0.255 host 10.10.20.10 eq 443</span>
    30 deny ip any host 10.10.20.10 (4410 matches)
    40 permit ip any any (99120 matches)</pre>
<p><b>Compare the two lines</b>: HQ uses wildcard 0.0.255.255 (all of 10.1.0.0/16); the branch line uses 0.0.0.255, which matches only 10.2.0.0/24. BR1 users are in 10.2.10.0/24, so they fall through to line 30 and are denied. Line 20 has zero matches, and line 30 is counting up. Hypothesis confirmed.</p>
<p><b>Step 7, fix and verify.</b></p>
<pre class="code">DC-SW1# configure terminal revert timer 10
DC-SW1(config)# ip access-list extended ERP-PROTECT
DC-SW1(config-ext-nacl)# no 20
DC-SW1(config-ext-nacl)# 20 permit tcp 10.2.0.0 0.0.255.255 host 10.10.20.10 eq 443
DC-SW1(config-ext-nacl)# end
<span class="c">! from BR1: telnet 10.10.20.10 443 /source-interface GigabitEthernet0/1/0 now shows "Open"</span>
DC-SW1# configure confirm</pre>
<p>Then ask a branch user to open the ERP application, because the user's experience is the real test.</p>
<p><b>Step 8, document.</b> Root cause: wrong wildcard mask in ERP-PROTECT sequence 20. Fix: corrected to 0.0.255.255. Prevention: peer review of ACL changes, and a post-change test from one HQ and one branch source.</p>

<div class="warn"><p><b>Common mistake.</b> Testing only the forward path. Many "the route is there" investigations miss that the <b>return</b> traffic has no route, is NATed differently, or is filtered on another device. When some sources work and others do not, always check both directions and every filter on the way.</p></div>

<div class="exam"><p><b>Exam trap.</b> Troubleshooting questions often show a correct route and ask why traffic still fails; look for ACLs, wildcard masks, NAT, or a missing return route. "Divide and conquer" starts in the middle of the OSI model; "follow the path" follows the packet through devices. Do not confuse them.</p></div>

<div class="scn"><h4>Three engineers, one guess each</h4><p>During a major outage, three engineers each changed something on WAN1 at the same time: one cleared BGP, one reloaded an interface, one edited a route map. Service came back, but nobody knew which action fixed it, and the same outage returned a week later. The post-incident review introduced a rule: one incident lead, one hypothesis at a time, each test announced in the bridge call and recorded in the ticket. The second occurrence was solved in 20 minutes: a route map that matched an outdated prefix list.</p><p><b>Lesson:</b> a structured method is not bureaucracy; it is how you know what actually fixed the problem.</p></div>

<div class="iv"><p class="q">"Walk me through how you troubleshoot 'users cannot reach an application'."</p><p>Strong answer: define scope first (which users, which application, since when, what changed), then start in the middle with a sourced ping or traceroute and a test on the actual application port. If some sources work, follow the path in both directions and compare the configuration for working and failing sources. Change one thing at a time with a rollback, verify from the user's side, and document root cause and prevention. Giving a real example you solved makes this answer stand out.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Structured process: define, gather, analyse, eliminate, hypothesise, test, fix and verify, document.</li>
<li>Always ask "what changed?" first; recent changes cause most incidents.</li>
<li>Pick the method: top-down, bottom-up, divide and conquer, follow the path, compare configs, swap components.</li>
<li>Test with the real application port and a sourced test, and check the return path.</li>
<li>One change at a time, with rollback; verify from the user's point of view; write it down.</li>
</ul></div>
`,hi:`
<p>Achhi doctor andaaza nahi lagati. Woh poochti hai ki symptoms kya hain aur kab shuru hue, aapko examine karti hai, ek hypothesis banati hai, ek test karwati hai jo use prove ya disprove kare, cause ka ilaaj karti hai, aur sab kuch aapki file mein likhti hai. Kamzor doctor pehla symptom dekh kar uska ilaaj kar deti hai. Networks bhi aise hi hain: random commands type karna kabhi kabhi kaam karta hai, par multi-domain problems tak scale nahi karta, aur CCNP-level interviews aur escalations bilkul isi ki saza dete hain. Yeh chapter aapko ek repeatable method deta hai aur ek real jaisa ticket shuru se aakhir tak walk karta hai.</p>

<h3>Structured process</h3>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Structured troubleshooting process">
<rect x="10" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="12">1 Problem define</text>
<rect x="170" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="240" y="47" text-anchor="middle" class="svg-ink" font-size="12">2 Facts jama karo</text>
<rect x="330" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="400" y="47" text-anchor="middle" class="svg-ink" font-size="12">3 Analyse</text>
<rect x="490" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="560" y="47" text-anchor="middle" class="svg-ink" font-size="12">4 Eliminate</text>
<rect x="490" y="110" width="140" height="44" rx="8" fill="#fde68a"/><text x="560" y="137" text-anchor="middle" class="svg-ink" font-size="12">5 Hypothesis</text>
<rect x="330" y="110" width="140" height="44" rx="8" fill="#fde68a"/><text x="400" y="137" text-anchor="middle" class="svg-ink" font-size="12">6 Test karo</text>
<rect x="170" y="110" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="240" y="137" text-anchor="middle" class="svg-ink" font-size="12">7 Fix aur verify</text>
<rect x="10" y="110" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="137" text-anchor="middle" class="svg-ink" font-size="12">8 Document</text>
<line x1="150" y1="42" x2="170" y2="42" stroke="#64748b" stroke-width="2"/><line x1="310" y1="42" x2="330" y2="42" stroke="#64748b" stroke-width="2"/><line x1="470" y1="42" x2="490" y2="42" stroke="#64748b" stroke-width="2"/>
<line x1="560" y1="64" x2="560" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="490" y1="132" x2="470" y2="132" stroke="#64748b" stroke-width="2"/><line x1="330" y1="132" x2="310" y2="132" stroke="#64748b" stroke-width="2"/><line x1="170" y1="132" x2="150" y2="132" stroke="#64748b" stroke-width="2"/>
<path d="M400 154 L400 180 L560 180 L560 154" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="480" y="198" text-anchor="middle" class="svg-accent" font-size="12">galat nikla: agla hypothesis</text>
<text x="320" y="228" text-anchor="middle" class="svg-muted" font-size="12">Step 1 ya step 8 kabhi skip mat karo</text>
</svg><p class="cap">Structured approach: define, gather, analyse, eliminate, hypothesise, test, fix, document.</p></div>
<ol>
<li><b>Problem define karo</b> bilkul sahi: kaun affected hai, exactly kya fail hota hai, kab se, lagataar hai ya intermittent, aur <b>kya badla</b>.</li>
<li><b>Facts jama karo</b>: outputs, logs, monitoring graphs, change record, topology.</li>
<li>Facts ko network ke kaam karne ke sahi tareeke (aapki baseline) ke against <b>analyse</b> karo.</li>
<li>Jo achha prove ho chuka hai use <b>eliminate</b> karo.</li>
<li>Jo bacha hai usse sabse likely cause ka <b>hypothesis</b> banao.</li>
<li>Hypothesis ko aise change se <b>test</b> karo jise rollback kar sako, ya read-only check se.</li>
<li>User ke nazariye se <b>fix aur verify</b> karo, sirf router ke nahi.</li>
<li><b>Document</b> karo: root cause, fix, aur agli baar kaise rokein.</li>
</ol>

<h3>Method chunna</h3>
<table class="cmp"><tr><th>Method</th><th>Kaise</th><th>Kab best</th></tr>
<tr><td>Top-down</td><td>Application se shuru karo aur layers mein neeche jaao</td><td>Problem application-specific lagti hai</td></tr>
<tr><td>Bottom-up</td><td>Cable se shuru karo aur upar jaao</td><td>Physical symptoms: link flaps, CRC errors, naya install</td></tr>
<tr><td>Divide and conquer</td><td>Beech se shuru karo (Layer 3 ping), phir result ke hisaab se upar ya neeche jaao</td><td>Koi strong clue nahi; aam taur par sabse fast general method</td></tr>
<tr><td>Follow the path</td><td>Packet ko hop by hop trace karo, har device par forwarding aur filters check karte hue, <b>dono directions mein</b></td><td>Kuch sources ya destinations chalte hain aur kuch nahi</td></tr>
<tr><td>Compare configurations</td><td>Working device ya pichle archive se diff karo</td><td>Change se pehle kuch chal raha tha, ya sister device par chalta hai</td></tr>
<tr><td>Swap components</td><td>Cable, optic, port ya device badlo</td><td>Hardware fault ka shak, spares available</td></tr>
</table>

<h3>Worked ticket: INC-4471</h3>
<div class="eg"><p><b>Ticket.</b> "Branch BR1 ke users (10.2.10.0/24) aaj subah se ERP application 10.10.20.10 nahi khol pa rahe. HQ users theek hain. Branch users abhi bhi file server 10.10.30.20 tak pahunch sakte hain." Change calendar kal raat DC-SW1 par ek security change dikhata hai.</p></div>
<p><b>Step 1, define.</b> Affected: sirf branch sources. Destination: sirf ERP, baaki DC servers theek. Kab se: kal raat ke change ke baad. Yeh pehle hi aisi cheez ki taraf ishara karta hai jo ERP destination <b>aur</b> branch source dono ke liye specific hai, jo routing se zyada filter jaisa lagta hai.</p>
<p><b>Step 2 aur 3, divide and conquer, phir follow the path.</b> Branch se user subnet ko source banakar Layer 3 aur application test karo:</p>
<pre class="out">BR1# traceroute 10.10.20.10 source GigabitEthernet0/1/0 numeric
Type escape sequence to abort.
Tracing the route to 10.10.20.10
  1 10.0.2.1 2 msec 1 msec 1 msec
  2 10.0.0.13 2 msec 2 msec 2 msec
  <span class="hl">3 10.0.0.9 3 msec 2 msec 3 msec</span>
  4  *  *  *
BR1# telnet 10.10.20.10 443 /source-interface GigabitEthernet0/1/0
Trying 10.10.20.10, 443 ...
<span class="hl">% Connection timed out; remote host not responding</span></pre>
<p>Path WAN1 (10.0.2.1), CORE1 (10.0.0.13), DC-SW1 (10.0.0.9) sahi hai aur har hop jawab deta hai, isliye DC-SW1 tak dono directions mein routing kaam karti hai. Packet DC-SW1 ke baad marta hai, jo server se pehle aakhri device hai.</p>
<p><b>Step 4 aur 5, eliminate aur hypothesise.</b> Routing achhi prove ho chuki hai, aur doosre VLAN ka file server chalta hai. Hypothesis: kal raat ke change ne DC-SW1 par ek filter joda jo ERP VLAN tak branch sources ko block karta hai.</p>
<p><b>Step 6, test (read-only).</b></p>
<pre class="out">DC-SW1# show running-config interface Vlan20 | include access-group
 ip access-group ERP-PROTECT out
DC-SW1# show ip access-lists ERP-PROTECT
Extended IP access list ERP-PROTECT
    10 permit tcp 10.1.0.0 0.0.255.255 host 10.10.20.10 eq 443 (18231 matches)
    <span class="hl">20 permit tcp 10.2.0.0 0.0.0.255 host 10.10.20.10 eq 443</span>
    30 deny ip any host 10.10.20.10 (4410 matches)
    40 permit ip any any (99120 matches)</pre>
<p><b>Dono lines compare karo</b>: HQ wildcard 0.0.255.255 use karta hai (poora 10.1.0.0/16); branch wali line 0.0.0.255 use karti hai, jo sirf 10.2.0.0/24 match karti hai. BR1 users 10.2.10.0/24 mein hain, isliye woh line 30 tak gir jaate hain aur deny hote hain. Line 20 par zero matches hain, aur line 30 badh rahi hai. Hypothesis confirm.</p>
<p><b>Step 7, fix aur verify.</b></p>
<pre class="code">DC-SW1# configure terminal revert timer 10
DC-SW1(config)# ip access-list extended ERP-PROTECT
DC-SW1(config-ext-nacl)# no 20
DC-SW1(config-ext-nacl)# 20 permit tcp 10.2.0.0 0.0.255.255 host 10.10.20.10 eq 443
DC-SW1(config-ext-nacl)# end
<span class="c">! BR1 se: telnet 10.10.20.10 443 /source-interface GigabitEthernet0/1/0 ab "Open" dikhata hai</span>
DC-SW1# configure confirm</pre>
<p>Phir ek branch user se ERP application kholne ko kaho, kyunki user ka experience hi asli test hai.</p>
<p><b>Step 8, document.</b> Root cause: ERP-PROTECT sequence 20 mein galat wildcard mask. Fix: 0.0.255.255 par theek kiya. Prevention: ACL changes ka peer review, aur change ke baad ek HQ aur ek branch source se test.</p>

<div class="warn"><p><b>Common galti.</b> Sirf forward path test karna. Kai "route to hai" investigations yeh miss kar dete hain ki <b>return</b> traffic ka route nahi hai, alag NAT ho raha hai, ya kisi aur device par filter ho raha hai. Jab kuch sources chalein aur kuch nahi, to hamesha dono directions aur raaste ka har filter check karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Troubleshooting questions aksar sahi route dikhate hain aur poochte hain ki traffic phir bhi kyun fail hai; ACLs, wildcard masks, NAT, ya missing return route dhoondho. "Divide and conquer" OSI model ke beech se shuru hota hai; "follow the path" packet ko devices ke through follow karta hai. Inhe confuse mat karo.</p></div>

<div class="scn"><h4>Teen engineers, har ek ka ek andaaza</h4><p>Ek bade outage ke dauraan, teen engineers ne ek hi samay par WAN1 par kuch na kuch badla: ek ne BGP clear kiya, ek ne interface reload kiya, ek ne route map edit kiya. Service wapas aayi, par kisi ko nahi pata tha ki kis action ne theek kiya, aur wahi outage ek hafte baad wapas aaya. Post-incident review ne ek rule laaya: ek incident lead, ek samay mein ek hypothesis, har test bridge call mein announce aur ticket mein record. Doosri baar 20 minute mein solve hua: ek route map jo purani prefix list match kar raha tha.</p><p><b>Seekh:</b> structured method bureaucracy nahi hai; isi se aapko pata chalta hai ki problem asal mein kisne theek ki.</p></div>

<div class="iv"><p class="q">"Mujhe batao 'users application tak nahi pahunch pa rahe' ko aap kaise troubleshoot karte ho."</p><p>Strong answer: pehle scope define karo (kaunse users, kaunsi application, kab se, kya badla), phir beech se shuru karo ek sourced ping ya traceroute aur actual application port par test ke saath. Agar kuch sources chalte hain, to dono directions mein path follow karo aur working aur failing sources ki configuration compare karo. Ek samay mein ek cheez rollback ke saath badlo, user ki side se verify karo, aur root cause aur prevention document karo. Aapka solve kiya hua ek real example dena is answer ko alag banata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Structured process: define, gather, analyse, eliminate, hypothesise, test, fix aur verify, document.</li>
<li>Hamesha pehle "kya badla?" poochho; zyada tar incidents recent changes se hote hain.</li>
<li>Method chuno: top-down, bottom-up, divide and conquer, follow the path, compare configs, swap components.</li>
<li>Real application port aur sourced test se test karo, aur return path check karo.</li>
<li>Ek samay mein ek change, rollback ke saath; user ke nazariye se verify karo; likh lo.</li>
</ul></div>
`}};export{e as default};