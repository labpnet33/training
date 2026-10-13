var e={id:`lab-handler-ts`,h:{en:`Lab fa-handler-ts: ticket KR-2711, the handlers never fire`,hi:`Lab fa-handler-ts: ticket KR-2711, handlers kabhi fire nahi hote`},body:{en:`
<p>A good mechanic does not start by replacing parts. He listens to the engine, reads the dashboard lights and asks when the noise began. This troubleshooting lab trains the same habit: the ticket tells you the symptom, the logs tell you the truth, and only then do you touch a setting.</p>

<h3>The ticket</h3>
<p><b>KR-2711.</b> Both HQ-FGT and MDU-FGT deny web access to the intranet server during the project freeze, and FAZ-1 has an event handler for each site: hq-deny and mdu-deny. The SOC has not seen a single event all week. The ticket adds a hint: one handler filters on a value that the logs never contain, and the other needs far more logs than a site can produce in its window. Your job is to generate the denied traffic, look at the real logs, repair both handlers and see events appear.</p>
<p>Devices: FAZ-1, SW-NET, SRV-WEB, HQ-FGT, SW-HQ, PC-HQ, MDU-FGT, SW-MDU, PC-MDU.</p>

<h3>Plan your attack with the five checks</h3>
<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Plan for the lab">
<rect x="20" y="25" width="180" height="70" rx="8" fill="#bae6fd"/><text x="110" y="52" text-anchor="middle" class="svg-ink" font-size="13">Task 1</text><text x="110" y="74" text-anchor="middle" class="svg-muted" font-size="12">generate, read the logs</text>
<rect x="230" y="25" width="180" height="70" rx="8" fill="#ddd6fe"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="13">Task 2</text><text x="320" y="74" text-anchor="middle" class="svg-muted" font-size="12">fix hq-deny: filter</text>
<rect x="440" y="25" width="180" height="70" rx="8" fill="#fde68a"/><text x="530" y="52" text-anchor="middle" class="svg-ink" font-size="13">Task 3</text><text x="530" y="74" text-anchor="middle" class="svg-muted" font-size="12">fix mdu-deny: threshold</text>
<line x1="200" y1="60" x2="230" y2="60" stroke="#64748b" stroke-width="2"/><line x1="410" y1="60" x2="440" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="13">After each repair: three NEW denied sessions, then list events.</text>
</svg><p class="cap">Three tasks, one repair each, one new test each.</p></div>

<h3>Task 1: generate the traffic and read the real value</h3>
<p>Send three web requests to SRV-WEB from PC-HQ and three from PC-MDU, as the task text shows. All of them are denied by the policy DENY-WEB. Do not open the handlers yet. First check that the events list is empty and then open Log View for traffic logs of all devices. The task asks which value the field <code>action</code> holds in a denied traffic log.</p>
<pre class="out">FAZ-1 # execute fazui events root list
<span class="hl">No events in ADOM root.</span>
FAZ-1 # execute fazui logview root - traffic action=deny limit 1
6 logs match, 1 shown (newest first).
1: ... devname="MDU-FGT" ... srcip=10.20.0.10 ... dstip=192.0.2.80 dstport=80 ... <span class="hl">action="deny"</span> policyid=5 policyname="DENY-WEB" ...</pre>
<p>Six logs match, three per site. That already proves two things: the logging chain works, and the word is <code>deny</code>.</p>

<h3>Task 2: repair hq-deny</h3>
<p>Now read the handler list. The filter of hq-deny says <code>action=blocked</code>, a value no log contains. Check 3 of the workflow fails. The repair is a change of one attribute of the handler in its configuration table, with the form you met in chapter 3 when you disabled a handler: enter <code>config faz event-handler</code>, <code>edit</code> the handler name, <code>set filter</code> with the correct condition, <code>next</code> and <code>end</code>. The filter text goes in quotes.</p>
<p>The old logs do not count, because the handler only sees logs stored after the change. Send three more denied sessions from PC-HQ and list the events.</p>
<pre class="out">ID   SEVERITY  HANDLER             DEVICE            GROUP         LOGS  LAST LOG             STATUS
1    high      hq-deny             HQ-FGT            10.10.0.10    3     2026-10-12 20:48:40  <span class="hl">unhandled</span></pre>

<h3>Task 3: repair mdu-deny</h3>
<p>The filter of mdu-deny is correct. Compare its threshold with your test: 20 logs within 1 minute, while a branch PC produced three. Check 4 fails. The ticket tells you the target of 3 logs in 5 minutes, which fits the way the branch behaves. Change two attributes of the handler, the threshold and the window (the attribute is called <code>minutes</code>), using the same table form. Then send three more denied sessions from PC-MDU and list the events.</p>
<pre class="out">NAME                TYPE     THRESHOLD             SEVERITY  STATUS   FILTER
hq-deny             traffic  3 in 5 min            high      enable   action=deny group-by=srcip
mdu-deny            traffic  <span class="hl">3 in 5 min</span>            high      enable   action=deny device=MDU-FGT group-by=srcip</pre>
<div class="eg"><p><b>Worked example of reading the result.</b> After the last test the list can hold more events than you expect. A second event for 10.20.0.10 can come from hq-deny, because that handler has no device and reads MDU-FGT as well. That is not an error of your repair. Decide whether it is acceptable. If the SOC wants one event per burst, put HQ-FGT into the definition of hq-deny.</p></div>

<h3>Where learners get stuck</h3>
<div class="warn"><p><b>Wrong turns.</b> Repairing both handlers in one go and testing once, so you cannot tell which repair worked; changing the severity because "high is too loud" (it is not the cause); testing with the old logs and concluding that the repair failed; setting the threshold to 1 to "make it fire", which would turn every denied session into an event; typing the window attribute as <code>minute</code> instead of <code>minutes</code>; forgetting <code>next</code> and <code>end</code>, so the change is never saved.</p></div>

<div class="exam"><p><b>Exam trap.</b> The lab has two faults of different kinds in one symptom. A question about "the handler never fires" with a correct filter and a very high threshold is about the threshold. With a wrong word in the filter, it is about the filter. Always check the filter in Log View first.</p></div>

<div class="scn"><h4>The week nobody looked</h4><p>At Kaveri the freeze started on Monday and the SOC wall stayed empty until Friday. The team lead was pleased. On Friday a new engineer ran the ticket KR-2711 steps. Within ten minutes she had shown that the head office handler could never match and the Madurai handler could never reach its threshold. A week of denied sessions had passed with no alarm. Because the logs were stored, she could still list the history in Log View, but no event or incident could be created for it.</p><p><b>Lesson:</b> test every new handler with real traffic on the day you create it, and test it again after every change.</p></div>

<div class="iv"><p class="q">"You inherit two handlers that never produced an event. What do you do first?"</p><p>Nothing in the handlers. I generate the pattern, read the real logs and check the logging chain. Then I run each handler filter in Log View, compare thresholds with what the traffic can produce, and repair one fault at a time with a new test after each repair.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Generate the traffic and read the real logs before changing any handler.</li>
<li>hq-deny failed on the filter value; mdu-deny failed on the threshold and window.</li>
<li>Handlers are repaired in the configuration table with set filter, set threshold and set minutes.</li>
<li>After each repair, send three new denied sessions; old logs do not count.</li>
<li>A handler without a device also reports the other sites of the ADOM.</li>
</ul></div>
`,hi:`
<p>Achha mechanic parts badalne se shuru nahi karta. Wo engine ki awaaz sunta hai, dashboard ki lights padhta hai aur poochta hai ki awaaz kab shuru hui. Ye troubleshooting lab wahi aadat sikhata hai: ticket symptom batata hai, logs sach batate hain, aur tab hi aap koi setting chhuoge.</p>

<h3>Ticket</h3>
<p><b>KR-2711.</b> HQ-FGT aur MDU-FGT dono project freeze ke dauran intranet server ka web access deny karte hain, aur FAZ-1 par har site ka event handler hai: hq-deny aur mdu-deny. SOC ko poore hafte ek bhi event nahi dikha. Ticket ek hint jodta hai: ek handler aisi value par filter karta hai jo logs mein kabhi hoti hi nahi, aur doosre ko itne zyada logs chahiye jitne ek site apni window mein bana hi nahi sakti. Aapka kaam hai denied traffic generate karna, real logs dekhna, dono handlers repair karna aur events aate dekhna.</p>
<p>Devices: FAZ-1, SW-NET, SRV-WEB, HQ-FGT, SW-HQ, PC-HQ, MDU-FGT, SW-MDU, PC-MDU.</p>

<h3>Paanch checks se plan banao</h3>
<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Lab ka plan">
<rect x="20" y="25" width="180" height="70" rx="8" fill="#bae6fd"/><text x="110" y="52" text-anchor="middle" class="svg-ink" font-size="13">Task 1</text><text x="110" y="74" text-anchor="middle" class="svg-muted" font-size="12">generate, logs padho</text>
<rect x="230" y="25" width="180" height="70" rx="8" fill="#ddd6fe"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="13">Task 2</text><text x="320" y="74" text-anchor="middle" class="svg-muted" font-size="12">hq-deny fix: filter</text>
<rect x="440" y="25" width="180" height="70" rx="8" fill="#fde68a"/><text x="530" y="52" text-anchor="middle" class="svg-ink" font-size="13">Task 3</text><text x="530" y="74" text-anchor="middle" class="svg-muted" font-size="12">mdu-deny fix: threshold</text>
<line x1="200" y1="60" x2="230" y2="60" stroke="#64748b" stroke-width="2"/><line x1="410" y1="60" x2="440" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="13">Har repair ke baad: teen NAYE denied sessions, phir events list.</text>
</svg><p class="cap">Teen tasks, har ek ka ek repair, har repair ke baad ek naya test.</p></div>

<h3>Task 1: traffic generate karo aur real value padho</h3>
<p>PC-HQ se SRV-WEB ko teen aur PC-MDU se teen web requests bhejo, jaise task text dikhata hai. Sab DENY-WEB policy se denied hote hain. Abhi handlers mat kholo. Pehle check karo ki events list khaali hai, phir saare devices ke traffic logs ke liye Log View kholo. Task poochta hai ki denied traffic log mein field <code>action</code> kya value rakhta hai.</p>
<pre class="out">FAZ-1 # execute fazui events root list
<span class="hl">No events in ADOM root.</span>
FAZ-1 # execute fazui logview root - traffic action=deny limit 1
6 logs match, 1 shown (newest first).
1: ... devname="MDU-FGT" ... srcip=10.20.0.10 ... dstip=192.0.2.80 dstport=80 ... <span class="hl">action="deny"</span> policyid=5 policyname="DENY-WEB" ...</pre>
<p>Chhe logs match karte hain, har site ke teen. Isse do baatein saabit hoti hain: logging chain kaam karti hai, aur word <code>deny</code> hai.</p>

<h3>Task 2: hq-deny repair karo</h3>
<p>Ab handler list padho. hq-deny ka filter <code>action=blocked</code> kehta hai, jo value kisi log mein nahi hai. Workflow ka check 3 fail hota hai. Repair handler ke configuration table mein ek attribute badalna hai, usi form se jo chapter 3 mein handler disable karte waqt dekha: <code>config faz event-handler</code> mein jao, handler name par <code>edit</code> karo, sahi condition ke saath <code>set filter</code> karo, phir <code>next</code> aur <code>end</code>. Filter text quotes mein jaata hai.</p>
<p>Purane logs count nahi hote, kyunki handler sirf change ke baad store hue logs dekhta hai. PC-HQ se teen aur denied sessions bhejo aur events list karo.</p>
<pre class="out">ID   SEVERITY  HANDLER             DEVICE            GROUP         LOGS  LAST LOG             STATUS
1    high      hq-deny             HQ-FGT            10.10.0.10    3     2026-10-12 20:48:40  <span class="hl">unhandled</span></pre>

<h3>Task 3: mdu-deny repair karo</h3>
<p>mdu-deny ka filter sahi hai. Uske threshold ko apne test se compare karo: 1 minute mein 20 logs, jabki branch PC ne teen banaye. Check 4 fail hota hai. Ticket target batata hai: 5 minute mein 3 logs, jo branch ke behaviour se match karta hai. Usi table form se handler ke do attributes badlo, threshold aur window (attribute ka naam <code>minutes</code> hai). Phir PC-MDU se teen aur denied sessions bhejo aur events list karo.</p>
<pre class="out">NAME                TYPE     THRESHOLD             SEVERITY  STATUS   FILTER
hq-deny             traffic  3 in 5 min            high      enable   action=deny group-by=srcip
mdu-deny            traffic  <span class="hl">3 in 5 min</span>            high      enable   action=deny device=MDU-FGT group-by=srcip</pre>
<div class="eg"><p><b>Result padhne ka worked example.</b> Aakhri test ke baad list mein aapki umeed se zyada events ho sakte hain. 10.20.0.10 ka doosra event hq-deny se aa sakta hai, kyunki us handler mein device nahi hai aur wo MDU-FGT ko bhi padhta hai. Ye aapke repair ki galti nahi hai. Decide karo ki ye theek hai ya nahi. Agar SOC ko ek burst ka ek event chahiye, to hq-deny ki definition mein HQ-FGT daalo.</p></div>

<h3>Learners kahan atakte hain</h3>
<div class="warn"><p><b>Galat mod.</b> Dono handlers ek saath repair karke ek hi baar test karna, jisse pata nahi chalta kaun sa repair chala; severity badalna kyunki "high bahut loud hai" (ye wajah nahi hai); purane logs se test karke maan lena ki repair fail hua; threshold 1 kar dena "fire karwane ke liye", jo har denied session ko event bana dega; window attribute <code>minutes</code> ki jagah <code>minute</code> likhna; <code>next</code> aur <code>end</code> bhool jaana, jisse change save hi nahi hota.</p></div>

<div class="exam"><p><b>Exam trap.</b> Lab mein ek symptom ke andar do alag tarah ke faults hain. "Handler kabhi fire nahi hota" wala sawal jisme filter sahi aur threshold bahut ooncha ho, threshold ke baare mein hai. Filter mein galat word ho to filter ke baare mein. Hamesha pehle filter Log View mein check karo.</p></div>

<div class="scn"><h4>Wo hafta jab kisi ne nahi dekha</h4><p>Kaveri mein freeze Monday ko shuru hua aur SOC wall Friday tak khaali raha. Team lead khush tha. Friday ko ek naye engineer ne ticket KR-2711 ke steps chalaye. Das minute mein usne dikha diya ki head office handler kabhi match nahi kar sakta tha aur Madurai handler kabhi apne threshold tak nahi pahunch sakta tha. Poore hafte ke denied sessions bina alarm ke guzar gaye. Logs stored the, isliye history Log View mein abhi bhi list ho sakti thi, par uske liye koi event ya incident nahi ban sakta tha.</p><p><b>Lesson:</b> har naye handler ko banane ke din real traffic se test karo, aur har change ke baad phir test karo.</p></div>

<div class="iv"><p class="q">"Aapko do handlers mile jinhone kabhi event nahi diya. Pehle kya karoge?"</p><p>Handlers mein kuch nahi. Main pattern generate karta hoon, real logs padhta hoon aur logging chain check karta hoon. Phir har handler filter Log View mein chalata hoon, thresholds ko traffic ke output se compare karta hoon, aur ek time par ek fault repair karta hoon, har repair ke baad naya test.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Koi handler badalne se pehle traffic generate karo aur real logs padho.</li>
<li>hq-deny filter value par fail hua; mdu-deny threshold aur window par.</li>
<li>Handlers configuration table mein set filter, set threshold aur set minutes se repair hote hain.</li>
<li>Har repair ke baad teen naye denied sessions bhejo; purane logs count nahi hote.</li>
<li>Bina device wala handler ADOM ke doosre sites bhi report karta hai.</li>
</ul></div>
`}};export{e as default};