var e={id:`handler-troubleshooting`,h:{en:`Troubleshooting a handler that never fires`,hi:`Aise handler ko troubleshoot karna jo kabhi fire nahi hota`},body:{en:`
<p>When a torch does not light, you do not throw it away. You check in a fixed order: is there a battery, is it the right way round, is the bulb good, is the switch on. A handler that never fires deserves the same calm routine. Guessing and editing three things at once leaves you not knowing which change helped. This chapter gives a fixed order of five checks.</p>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Five checks in order">
<rect x="10" y="30" width="114" height="64" rx="8" fill="#bae6fd"/><text x="67" y="56" text-anchor="middle" class="svg-ink" font-size="13">1 Generate</text><text x="67" y="76" text-anchor="middle" class="svg-muted" font-size="12">the pattern</text>
<rect x="136" y="30" width="114" height="64" rx="8" fill="#bae6fd"/><text x="193" y="56" text-anchor="middle" class="svg-ink" font-size="13">2 Read</text><text x="193" y="76" text-anchor="middle" class="svg-muted" font-size="12">the logs</text>
<rect x="262" y="30" width="114" height="64" rx="8" fill="#ddd6fe"/><text x="319" y="56" text-anchor="middle" class="svg-ink" font-size="13">3 Compare</text><text x="319" y="76" text-anchor="middle" class="svg-muted" font-size="12">the filter</text>
<rect x="388" y="30" width="114" height="64" rx="8" fill="#fde68a"/><text x="445" y="56" text-anchor="middle" class="svg-ink" font-size="13">4 Check</text><text x="445" y="76" text-anchor="middle" class="svg-muted" font-size="12">threshold, window</text>
<rect x="514" y="30" width="116" height="64" rx="8" fill="#bbf7d0"/><text x="572" y="56" text-anchor="middle" class="svg-ink" font-size="13">5 Check</text><text x="572" y="76" text-anchor="middle" class="svg-muted" font-size="12">enabled, scope</text>
<line x1="124" y1="62" x2="136" y2="62" stroke="#64748b" stroke-width="2"/><line x1="250" y1="62" x2="262" y2="62" stroke="#64748b" stroke-width="2"/><line x1="376" y1="62" x2="388" y2="62" stroke="#64748b" stroke-width="2"/><line x1="502" y1="62" x2="514" y2="62" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="13">Change one thing, test again, then go on.</text>
</svg><p class="cap">The five checks of this module.</p></div>

<p><b>1. Generate the pattern.</b> The handler only sees logs stored after it exists (chapter 3). Create fresh traffic that should trigger it, for example three denied sessions from PC-HQ, and wait a few seconds for the upload. An old test does not count.</p>
<p><b>2. Read the logs.</b> Open Log View for the device and the type. Do logs exist at all? If not, the problem is not the handler but the logging chain (registration, <code>logtraffic</code>, filters of the FortiGate), which earlier modules covered. If logs exist, look at one and read the real values.</p>
<p><b>3. Compare the filter.</b> Put the handler filter into Log View. If it returns nothing, the filter is wrong. If it returns logs, the filter is fine and you go on.</p>
<p><b>4. Check threshold and window.</b> Count how many matching logs your test produced and how far apart they are. Did you reach the threshold inside the window? A handler asking for 20 logs in 1 minute cannot fire from a branch that makes three.</p>
<p><b>5. Check enabled and scope.</b> Is the status enable? Is the ADOM the one you are listing? Does the handler name a device that is not the one you tested?</p>

<h3>A real case: both handlers silent</h3>
<p>Both FortiGates deny web access to the intranet and FAZ-1 holds a handler for each site, yet no event appears after three denied sessions from each PC. First look at the handlers, then at the logs.</p>
<pre class="out">FAZ-1 # execute fazui handler list root
NAME                TYPE     THRESHOLD             SEVERITY  STATUS   FILTER
hq-deny             traffic  3 in 5 min            high      enable   <span class="hl">action=blocked</span> group-by=srcip
mdu-deny            traffic  <span class="hl">20 in 1 min</span>           high      enable   action=deny device=MDU-FGT group-by=srcip

FAZ-1 # execute fazui events root list
No events in ADOM root.

FAZ-1 # execute fazui logview root - traffic action=blocked
0 logs match, 0 shown (newest first).</pre>
<p>Two different faults hide in one list. The first handler fails check 3: no log holds the word blocked. The second passes check 3 (its filter is the correct deny) but fails check 4: three denied sessions can never reach 20 in a minute. The same symptom, "no events", has two different causes, so you must run the checks on each handler separately.</p>
<p>After the two repairs, the table shows what a sound pair looks like:</p>
<pre class="out">NAME                TYPE     THRESHOLD             SEVERITY  STATUS   FILTER
hq-deny             traffic  3 in 5 min            high      enable   <span class="hl">action=deny</span> group-by=srcip
mdu-deny            traffic  <span class="hl">3 in 5 min</span>            high      enable   action=deny device=MDU-FGT group-by=srcip</pre>

<div class="eg"><p><b>Worked example.</b> After the repair, three denied sessions from each PC produce events for both sites. Look closely at the device column: one event of the handler hq-deny names MDU-FGT and the source 10.20.0.10. The reason is that hq-deny has no device in its definition, so it reads every device of the ADOM and counts MDU-FGT too. Both hq-deny and mdu-deny now fire for the same Madurai traffic, which means two events for one burst. The fix, if you do not want that, is to name HQ-FGT in the head office handler.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing filter, threshold and severity together, then not knowing what fixed it; testing with traffic generated before the repair and concluding that the repair failed (the handler does not look back); checking only the handler and never reading a real log; forgetting that a handler without a device also covers the other sites.</p></div>

<div class="exam"><p><b>Exam trap.</b> "No event" has more than one possible cause. The expected order is logs exist, filter matches, threshold and window reachable, handler enabled, correct ADOM and device. A question that shows a threshold of 20 in 1 minute and three logs wants the threshold, not the filter.</p></div>

<div class="scn"><h4>Ticket KR-2711: a week of silence</h4><p>The SOC at Kaveri Retail saw no events for a week while both branches were denying web access. The engineer on duty did not touch any setting at first. She generated three denied sessions from each PC, opened Log View and saw action="deny" in every log. She then pasted the handler filter into Log View and got zero logs for the head office handler. For the Madurai handler the filter matched, so she compared the threshold: 20 logs in 1 minute. She repaired one handler, tested, repaired the other, tested again.</p><p><b>Lesson:</b> one handler at a time, one change at a time, one test after each change.</p></div>

<div class="iv"><p class="q">"A handler shows no events. How do you troubleshoot it?"</p><p>I generate the pattern after the handler exists, read the real logs in Log View, run the handler filter in Log View, compare the threshold and window with what the test produced, and finally check that the handler is enabled and scoped to the right ADOM and device. I change one thing at a time.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Follow the order: generate, read logs, compare filter, threshold and window, enabled and scope.</li>
<li>If Log View shows no logs, the fault is in the logging chain, not in the handler.</li>
<li>Paste the handler filter into Log View: zero matches means a wrong filter.</li>
<li>One symptom can hide several faults, so check each handler on its own.</li>
<li>A handler without a device also reads the other sites of the ADOM.</li>
</ul></div>
`,hi:`
<p>Torch na jale to aap use phenk nahi dete. Aap ek fixed order mein check karte ho: battery hai, sahi taraf lagi hai, bulb theek hai, switch on hai. Jo handler kabhi fire nahi hota use bhi wahi shaant routine chahiye. Andaze se ek saath teen cheezein badalne par pata nahi chalta ki kis change ne kaam kiya. Ye chapter paanch checks ka fixed order deta hai.</p>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Paanch checks order mein">
<rect x="10" y="30" width="114" height="64" rx="8" fill="#bae6fd"/><text x="67" y="56" text-anchor="middle" class="svg-ink" font-size="13">1 Generate</text><text x="67" y="76" text-anchor="middle" class="svg-muted" font-size="12">pattern</text>
<rect x="136" y="30" width="114" height="64" rx="8" fill="#bae6fd"/><text x="193" y="56" text-anchor="middle" class="svg-ink" font-size="13">2 Read</text><text x="193" y="76" text-anchor="middle" class="svg-muted" font-size="12">logs</text>
<rect x="262" y="30" width="114" height="64" rx="8" fill="#ddd6fe"/><text x="319" y="56" text-anchor="middle" class="svg-ink" font-size="13">3 Compare</text><text x="319" y="76" text-anchor="middle" class="svg-muted" font-size="12">filter</text>
<rect x="388" y="30" width="114" height="64" rx="8" fill="#fde68a"/><text x="445" y="56" text-anchor="middle" class="svg-ink" font-size="13">4 Check</text><text x="445" y="76" text-anchor="middle" class="svg-muted" font-size="12">threshold, window</text>
<rect x="514" y="30" width="116" height="64" rx="8" fill="#bbf7d0"/><text x="572" y="56" text-anchor="middle" class="svg-ink" font-size="13">5 Check</text><text x="572" y="76" text-anchor="middle" class="svg-muted" font-size="12">enabled, scope</text>
<line x1="124" y1="62" x2="136" y2="62" stroke="#64748b" stroke-width="2"/><line x1="250" y1="62" x2="262" y2="62" stroke="#64748b" stroke-width="2"/><line x1="376" y1="62" x2="388" y2="62" stroke="#64748b" stroke-width="2"/><line x1="502" y1="62" x2="514" y2="62" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="13">Ek cheez badlo, phir test, phir aage.</text>
</svg><p class="cap">Is module ke paanch checks.</p></div>

<p><b>1. Pattern generate karo.</b> Handler sirf wo logs dekhta hai jo uske banne ke baad store hue (chapter 3). Naya traffic banao jo trigger kare, jaise PC-HQ se teen denied sessions, aur upload ke liye kuch second ruko. Purana test count nahi hota.</p>
<p><b>2. Logs padho.</b> Device aur type ke liye Log View kholo. Kya logs hain bhi? Agar nahi, to problem handler nahi, logging chain hai (registration, <code>logtraffic</code>, FortiGate ke filters), jo pichhle modules mein aaya. Agar logs hain, ek log kholo aur real values padho.</p>
<p><b>3. Filter compare karo.</b> Handler filter Log View mein daalo. Kuch na aaye to filter galat hai. Logs aayein to filter theek hai aur aap aage badho.</p>
<p><b>4. Threshold aur window check karo.</b> Gino ki aapke test ne kitne matching logs banaye aur wo kitne door-door hain. Kya window ke andar threshold tak pahunche? 1 minute mein 20 logs maangne wala handler us branch se fire nahi ho sakta jo teen banati hai.</p>
<p><b>5. Enabled aur scope check karo.</b> Status enable hai? Jis ADOM ko list kar rahe ho wahi hai? Handler aisa device naam to nahi karta jo aapne test hi nahi kiya?</p>

<h3>Real case: dono handlers chup</h3>
<p>Dono FortiGates intranet par web access deny karte hain aur FAZ-1 par har site ka ek handler hai, phir bhi har PC se teen denied sessions ke baad koi event nahi aata. Pehle handlers dekho, phir logs.</p>
<pre class="out">FAZ-1 # execute fazui handler list root
NAME                TYPE     THRESHOLD             SEVERITY  STATUS   FILTER
hq-deny             traffic  3 in 5 min            high      enable   <span class="hl">action=blocked</span> group-by=srcip
mdu-deny            traffic  <span class="hl">20 in 1 min</span>           high      enable   action=deny device=MDU-FGT group-by=srcip

FAZ-1 # execute fazui events root list
No events in ADOM root.

FAZ-1 # execute fazui logview root - traffic action=blocked
0 logs match, 0 shown (newest first).</pre>
<p>Ek list mein do alag faults chhupe hain. Pehla handler check 3 mein fail hota hai: kisi log mein word blocked hai hi nahi. Doosra check 3 pass karta hai (uska filter sahi deny hai) par check 4 mein fail hota hai: teen denied sessions ek minute mein kabhi 20 nahi ban sakte. Ek hi symptom, "no events", ke do alag kaaran hain, isliye har handler par checks alag chalane padte hain.</p>
<p>Dono repairs ke baad table dikhati hai ki sahi pair kaisa dikhta hai:</p>
<pre class="out">NAME                TYPE     THRESHOLD             SEVERITY  STATUS   FILTER
hq-deny             traffic  3 in 5 min            high      enable   <span class="hl">action=deny</span> group-by=srcip
mdu-deny            traffic  <span class="hl">3 in 5 min</span>            high      enable   action=deny device=MDU-FGT group-by=srcip</pre>

<div class="eg"><p><b>Worked example.</b> Repair ke baad har PC ke teen denied sessions dono sites ke events banate hain. Device column dhyaan se dekho: hq-deny handler ka ek event MDU-FGT aur source 10.20.0.10 ka naam leta hai. Wajah ye hai ki hq-deny ki definition mein device nahi hai, isliye wo ADOM ke har device ko padhta hai aur MDU-FGT ko bhi ginta hai. Hq-deny aur mdu-deny dono ab Madurai ke same traffic par fire hote hain, yaani ek burst ke do events. Agar ye nahi chahiye to head office handler mein HQ-FGT naam do.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Filter, threshold aur severity ek saath badalna, phir pata na hona ki kisne fix kiya; repair se pehle generate kiye traffic se test karke maan lena ki repair fail hui (handler peeche nahi dekhta); sirf handler dekhna aur kabhi real log na padhna; bhoolna ki bina device wala handler doosre sites ko bhi cover karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "No event" ke ek se zyada kaaran ho sakte hain. Expected order hai: logs hain, filter match karta hai, threshold aur window reach ho sakte hain, handler enabled hai, sahi ADOM aur device. Jis sawal mein 1 minute mein 20 ka threshold aur teen logs dikhaye jaayein wo threshold chahta hai, filter nahi.</p></div>

<div class="scn"><h4>Ticket KR-2711: ek hafte ki khamoshi</h4><p>Kaveri Retail ke SOC ko ek hafte tak koi event nahi dikha jabki dono branches web access deny kar rahi thin. Duty engineer ne shuru mein koi setting nahi chhui. Usne har PC se teen denied sessions generate kiye, Log View kholi aur har log mein action="deny" dekha. Phir head office handler ka filter Log View mein paste kiya to zero logs mile. Madurai handler ka filter match hua, to usne threshold compare kiya: 1 minute mein 20 logs. Usne ek handler repair kiya, test kiya, doosra repair kiya, phir test kiya.</p><p><b>Lesson:</b> ek time par ek handler, ek time par ek change, har change ke baad ek test.</p></div>

<div class="iv"><p class="q">"Handler koi event nahi dikhata. Aap troubleshoot kaise karte ho?"</p><p>Handler ke bante hi pattern generate karta hoon, Log View mein real logs padhta hoon, handler filter Log View mein chalata hoon, threshold aur window ko test ke output se compare karta hoon, aur aakhir mein check karta hoon ki handler enabled hai aur sahi ADOM aur device par scoped hai. Ek time par ek hi cheez badalta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order follow karo: generate, logs padho, filter compare, threshold aur window, enabled aur scope.</li>
<li>Log View mein logs na hon to fault logging chain mein hai, handler mein nahi.</li>
<li>Handler filter Log View mein paste karo: zero matches matlab galat filter.</li>
<li>Ek symptom mein kai faults chhup sakte hain, isliye har handler alag check karo.</li>
<li>Bina device wala handler ADOM ke doosre sites bhi padhta hai.</li>
</ul></div>
`}};export{e as default};