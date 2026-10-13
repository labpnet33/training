var e={id:`report-and-interview`,h:{en:`Incident reports, handover and interview preparation`,hi:`Incident reports, handover aur interview preparation`},body:{en:`
<p>A fire brigade does not finish its work when the fire is out. The captain writes down where the fire started, what was used, what went wrong, and what the building owner should change. Without that note the same fire happens again. An incident is not finished when the service works; it is finished when the story is written down so that others can learn from it and take over. This chapter teaches the two documents you will write most often, the <b>incident report</b> and the <b>handover note</b>, and then prepares you to talk about all of this in an interview.</p>

<h3>The incident report: six parts</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Incident report structure">
<rect x="10" y="20" width="198" height="70" rx="8" fill="#bae6fd"/><text x="109" y="44" text-anchor="middle" class="svg-ink" font-size="13">1 Summary and impact</text><text x="109" y="64" text-anchor="middle" class="svg-muted" font-size="11">who, what, how long</text>
<rect x="221" y="20" width="198" height="70" rx="8" fill="#ddd6fe"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">2 Timeline</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="11">time zone on every line</text>
<rect x="432" y="20" width="198" height="70" rx="8" fill="#fde68a"/><text x="531" y="44" text-anchor="middle" class="svg-ink" font-size="13">3 Evidence</text><text x="531" y="64" text-anchor="middle" class="svg-muted" font-size="11">commands and outputs</text>
<rect x="10" y="102" width="198" height="70" rx="8" fill="#bbf7d0"/><text x="109" y="126" text-anchor="middle" class="svg-ink" font-size="13">4 Cause and fix</text><text x="109" y="146" text-anchor="middle" class="svg-muted" font-size="11">smallest change made</text>
<rect x="221" y="102" width="198" height="70" rx="8" fill="#fed7aa"/><text x="320" y="126" text-anchor="middle" class="svg-ink" font-size="13">5 Verification</text><text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="11">positive and negative tests</text>
<rect x="432" y="102" width="198" height="70" rx="8" fill="#e2e8f0"/><text x="531" y="126" text-anchor="middle" class="svg-ink" font-size="13">6 Follow-ups</text><text x="531" y="146" text-anchor="middle" class="svg-muted" font-size="11">owner and due date</text>
</svg><p class="cap">Six parts, one page. Facts before opinions, and every follow-up has an owner.</p></div>

<h3>Example: the capstone as a report</h3>
<div class="eg"><p><b>Summary and impact.</b> On the night of the change, Bengaluru (Branch2, site-id 102) had no overlay connectivity to Delhi or the headend for about 40 minutes. Users could not reach Delhi applications; voice was load-balanced instead of using MPLS.</p>
<p><b>Timeline (IST).</b> 22:05 change committed. 22:10 first complaints. 22:14 on-call starts; overlay Idle. 22:20 underlay default route corrected (next hop 203.0.113.9). 22:26 MPLS interface vni-0/1 bound to MPLS transport. 22:31 R-VOICE match corrected to voice. 22:35 verification complete.</p>
<p><b>Evidence.</b> Tunnel table showing one row and reason unreachable; route showing next hop 203.0.113.13 outside the connected subnet; policy table showing R-VOICE matching video; ping to the Controller failing (100 percent loss).</p>
<p><b>Cause and fix.</b> A rushed change introduced three errors on three layers. Three commits, each with a compare, restored the intended state; no other statement was touched.</p>
<p><b>Verification.</b> MP-BGP Established; Internet and MPLS tunnels up; Delhi LAN 10.1.1.0/24 learned; PC2 to PC1 ping 0 percent loss; voice via MPLS; web still load-balanced (policy not widened).</p>
<p><b>Follow-ups.</b> Add a verification checklist to the change template (owner: network lead, due next Friday). Require a pilot site for template changes. Review whether peer review should be mandatory.</p></div>
<p>Notice what is missing: blame. A good report is blameless. It asks "which control would have stopped this?" not "who typed it?". Blame makes people hide information in the next incident.</p>

<h3>The handover note</h3>
<p>When your shift ends mid-incident, the next engineer must be able to continue without phoning you. A handover note answers six questions in a few lines: <b>What is broken? What is the current impact? What have I checked and ruled out? What did I change (exact commands)? What is the next step? Who is waiting for what (carrier ticket number, manager)?</b> Include the time of the last check, because state may have changed since. Example for chapter 6: "Delhi Internet tunnel down since 10:42 IST, carrier ticket opened 10:50, MPLS and LTE up, voice on MPLS, no config changes made. Next: check failback at 14:00 and record the restoration time."</p>

<h3>Interview preparation: how to talk about operations</h3>
<p>Interviewers for SD-WAN roles are rarely checking whether you memorised commands. They check whether you think like an operator. Prepare four short stories from the labs in this module, each with the same shape: situation, evidence, action, result, lesson.</p>
<ol>
<li><b>Carrier outage.</b> Interface up and tunnel down with a provider fault; carrier ticket with evidence; continuity proof; voice stayed on MPLS; failback verified.</li>
<li><b>Silent logs.</b> Exporter destination one digit wrong; both ends compared; one-line fix; alarm on missing sources.</li>
<li><b>Multi-fault incident.</b> Three layers, bottom-up, smallest change, negative check.</li>
<li><b>Change discipline.</b> Compare before commit, pilot, exit plan.</li>
</ol>
<p>Practise saying each in 90 seconds. Use the course names (Branch1 Delhi, CTL 198.51.100.20, ANA 198.51.100.30) but be honest that they come from a simplified lab; say "on real VOS I would use the equivalent show and monitor tools and the Analytics GUI". Honesty about the lab's limits impresses senior interviewers more than bluffing.</p>

<div class="warn"><p><b>Common mistakes.</b> Reports without time zones; pasting screenshots without scope; writing causes as certainties when they are hypotheses; follow-ups without owners; handover notes that say "all good" without a time.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Root cause" is not the same as "trigger". A typo is a trigger; the missing review and missing verification are root causes you can fix. Expect scenario questions that ask for the control that would have prevented it.</p></div>

<div class="scn"><h4>The note that saved the night shift</h4><p>A day engineer left this note: "Kolkata MPLS flapping since 15:20 IST, 3 flaps/hour; carrier ticket CT-1042 opened; policy moved voice to Internet automatically; no config change; next: check flap count at 21:00 and escalate if above 5." The night engineer saw the count at 21:00, found 9 flaps and escalated with the carrier's own ticket number. Without the note he would have restarted the investigation from scratch.</p><p><b>Lesson:</b> a good handover is a ticket you can continue in sixty seconds.</p></div>

<div class="iv"><p class="q">"Tell me about an incident you handled and what you learned."</p><p>Use situation, evidence, action, result, lesson. For example the capstone: three faults on three layers, bottom-up walk, smallest change per commit, positive and negative verification, and the process fix (pilot and verification checklist). Say what you would do differently.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An incident ends with a written report: summary, timeline, evidence, cause and fix, verification, follow-ups.</li>
<li>Reports are blameless and state time zones; follow-ups have owners and dates.</li>
<li>A handover note answers what is broken, impact, ruled out, changes, next step, who is waiting.</li>
<li>Root cause means the fixable control gap, not just the typo.</li>
<li>Prepare four 90-second stories from the labs and be honest about the simplified lab.</li>
</ul></div>
`,hi:`
<p>Fire brigade ka kaam aag bujhne par khatam nahi hota. Captain likhta hai aag kahan se shuru hui, kya use hua, kya galat gaya, aur building owner ko kya badalna chahiye. Us note ke bina wahi aag phir lagti hai. Incident tab khatam nahi hota jab service chal padti hai; tab khatam hota hai jab kahani likh di jaye taaki doosre seekh sakein aur sambhal sakein. Ye chapter wo do documents sikhata hai jo aap sabse zyada likhoge, <b>incident report</b> aur <b>handover note</b>, aur phir in sab ke bare mein interview mein baat karne ke liye taiyar karta hai.</p>

<h3>Incident report: chhe parts</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Incident report structure">
<rect x="10" y="20" width="198" height="70" rx="8" fill="#bae6fd"/><text x="109" y="44" text-anchor="middle" class="svg-ink" font-size="13">1 Summary aur impact</text><text x="109" y="64" text-anchor="middle" class="svg-muted" font-size="11">kaun, kya, kitni der</text>
<rect x="221" y="20" width="198" height="70" rx="8" fill="#ddd6fe"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">2 Timeline</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="11">har line par time zone</text>
<rect x="432" y="20" width="198" height="70" rx="8" fill="#fde68a"/><text x="531" y="44" text-anchor="middle" class="svg-ink" font-size="13">3 Evidence</text><text x="531" y="64" text-anchor="middle" class="svg-muted" font-size="11">commands aur outputs</text>
<rect x="10" y="102" width="198" height="70" rx="8" fill="#bbf7d0"/><text x="109" y="126" text-anchor="middle" class="svg-ink" font-size="13">4 Cause aur fix</text><text x="109" y="146" text-anchor="middle" class="svg-muted" font-size="11">kiya gaya smallest change</text>
<rect x="221" y="102" width="198" height="70" rx="8" fill="#fed7aa"/><text x="320" y="126" text-anchor="middle" class="svg-ink" font-size="13">5 Verification</text><text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="11">positive aur negative tests</text>
<rect x="432" y="102" width="198" height="70" rx="8" fill="#e2e8f0"/><text x="531" y="126" text-anchor="middle" class="svg-ink" font-size="13">6 Follow-ups</text><text x="531" y="146" text-anchor="middle" class="svg-muted" font-size="11">owner aur due date</text>
</svg><p class="cap">Chhe parts, ek page. Opinions se pehle facts, aur har follow-up ka owner.</p></div>

<h3>Example: capstone ek report ke roop mein</h3>
<div class="eg"><p><b>Summary aur impact.</b> Change wali raat Bengaluru (Branch2, site-id 102) ka Delhi ya headend se lagbhag 40 minute overlay connectivity nahi tha. Users Delhi applications tak nahi pahunch sake; voice MPLS use karne ke bajay load-balanced thi.</p>
<p><b>Timeline (IST).</b> 22:05 change commit. 22:10 pehli complaints. 22:14 on-call shuru; overlay Idle. 22:20 underlay default route sahi ki (next hop 203.0.113.9). 22:26 MPLS interface vni-0/1 MPLS transport se bind. 22:31 R-VOICE match voice kiya. 22:35 verification complete.</p>
<p><b>Evidence.</b> Ek row aur reason unreachable wali tunnel table; connected subnet ke bahar next hop 203.0.113.13 dikhata route; R-VOICE ko video match karte dikhata policy table; Controller ko fail hota ping (100 percent loss).</p>
<p><b>Cause aur fix.</b> Rushed change ne teen layers par teen errors daale. Teen commits, har ek compare ke saath, ne intended state restore kiya; koi aur statement nahi chhua.</p>
<p><b>Verification.</b> MP-BGP Established; Internet aur MPLS tunnels up; Delhi LAN 10.1.1.0/24 learned; PC2 se PC1 ping 0 percent loss; voice MPLS se; web abhi bhi load-balanced (policy widen nahi hui).</p>
<p><b>Follow-ups.</b> Change template mein verification checklist jodo (owner: network lead, agle Friday tak). Template changes ke liye pilot site zaroori karo. Dekho ki peer review mandatory honi chahiye ya nahi.</p></div>
<p>Dhyan do kya missing hai: blame. Achhi report blameless hoti hai. Wo puchti hai "kaunsa control ise rok leta?" na ki "kisne type kiya?". Blame se agle incident mein log information chhupate hain.</p>

<h3>Handover note</h3>
<p>Aapki shift incident ke beech mein khatam ho to agla engineer bina aapko phone kiye continue kar sake. Handover note chhe sawalon ka jawab kuch lines mein deta hai: <b>Kya toota hai? Abhi impact kya hai? Maine kya check aur rule out kiya? Maine kya badla (exact commands)? Agla step kya hai? Kaun kiska wait kar raha hai (carrier ticket number, manager)?</b> Last check ka time zaroor likho, kyunki state tab se badal sakti hai. Chapter 6 ka example: "Delhi Internet tunnel 10:42 IST se down, carrier ticket 10:50 par khola, MPLS aur LTE up, voice MPLS par, koi config change nahi. Agla: 14:00 par failback check karo aur restoration time record karo."</p>

<h3>Interview preparation: operations ki baat kaise karein</h3>
<p>SD-WAN roles ke interviewers aksar ye nahi dekhte ki aapne commands ratte hain ya nahi. Wo dekhte hain ki aap operator ki tarah sochte ho ya nahi. Is module ke labs se chaar chhoti kahaniyan taiyar karo, sab ka same shape: situation, evidence, action, result, lesson.</p>
<ol>
<li><b>Carrier outage.</b> Interface up aur tunnel down provider fault ke saath; evidence ke saath carrier ticket; continuity proof; voice MPLS par rahi; failback verified.</li>
<li><b>Silent logs.</b> Exporter destination ek digit galat; dono ends compare; ek-line fix; missing sources par alarm.</li>
<li><b>Multi-fault incident.</b> Teen layers, bottom-up, smallest change, negative check.</li>
<li><b>Change discipline.</b> Commit se pehle compare, pilot, exit plan.</li>
</ol>
<p>Har ek ko 90 second mein bolne ki practise karo. Course names use karo (Branch1 Delhi, CTL 198.51.100.20, ANA 198.51.100.30) lekin honestly batao ki wo simplified lab se hain; kaho "real VOS par main equivalent show aur monitor tools aur Analytics GUI use karunga". Lab ki limits ke bare mein honesty senior interviewers ko bluff se zyada impress karti hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Time zone ke bina reports; bina scope screenshots paste karna; hypotheses ko certainties ki tarah likhna; bina owner follow-ups; "all good" likhne wale handover notes bina time ke.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Root cause" aur "trigger" same nahi. Typo trigger hai; missing review aur missing verification wo root causes hain jo aap fix kar sakte ho. Scenario questions expect karo jo puchte hain ki kaunsa control ise rok leta.</p></div>

<div class="scn"><h4>Wo note jisne night shift bachayi</h4><p>Day engineer ne ye note chhodi: "Kolkata MPLS 15:20 IST se flap kar raha hai, 3 flaps/hour; carrier ticket CT-1042 khola; policy ne voice ko automatically Internet par move kiya; koi config change nahi; agla: 21:00 par flap count dekho aur 5 se upar ho to escalate karo." Night engineer ne 21:00 par count dekha, 9 flaps paaye aur carrier ke apne ticket number ke saath escalate kiya. Note ke bina wo investigation zero se shuru karta.</p><p><b>Lesson:</b> achha handover wo ticket hai jise aap sixty second mein continue kar sako.</p></div>

<div class="iv"><p class="q">"Koi incident batao jo aapne handle kiya aur kya seekha."</p><p>Situation, evidence, action, result, lesson use karo. Jaise capstone: teen layers par teen faults, bottom-up walk, har commit mein smallest change, positive aur negative verification, aur process fix (pilot aur verification checklist). Ye bhi batao ki aap kya alag karte.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Incident written report ke saath khatam hota hai: summary, timeline, evidence, cause aur fix, verification, follow-ups.</li>
<li>Reports blameless hoti hain aur time zones batati hain; follow-ups ka owner aur date hota hai.</li>
<li>Handover note batata hai kya toota, impact, rule out, changes, agla step, kaun kiska wait kar raha hai.</li>
<li>Root cause matlab fix hone layak control gap, sirf typo nahi.</li>
<li>Labs se chaar 90-second kahaniyan taiyar karo aur simplified lab ke bare mein honest raho.</li>
</ul></div>
`}};export{e as default};