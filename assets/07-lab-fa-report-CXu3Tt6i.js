var e={id:`lab-fa-report`,h:{en:`Lab fa-report: run the Traffic Report for Trichy and read it`,hi:`Lab fa-report: Trichy ka Traffic Report chalao aur padho`},body:{en:`
<p>A lab is like a driving test in an empty car park: the road is quiet, the rules are the same, and the examiner only watches whether you do the steps in a sensible order. In this lab you create a morning of traffic at the Trichy store, then ask FAZ-1 what the network was used for. The skill being tested is reading a report, not typing a long command.</p>

<h3>The goal</h3>
<p>The Trichy store manager wants to know what the branch network is used for. TRY-FGT (192.0.2.13) is already registered on FAZ-1 and runs an application control list that blocks file sharing. You must produce the traffic, run the Traffic Report and the Threat Report for TRY-FGT, and answer three questions from the printed reports: which application is first, how many sessions are blocked, and which threat is first. The devices in the lab are FAZ-1, SW-NET, SRV-WEB, TRY-FGT, SW-TRY and PC-TRY.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Lab topology fa-report">
<rect x="14" y="50" width="100" height="54" rx="8" fill="#bae6fd"/><text x="64" y="74" text-anchor="middle" class="svg-ink" font-size="13">PC-TRY</text><text x="64" y="92" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.10</text>
<rect x="164" y="50" width="110" height="54" rx="8" fill="#bae6fd"/><text x="219" y="74" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text><text x="219" y="92" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.13</text>
<rect x="324" y="50" width="100" height="54" rx="8" fill="#e2e8f0"/><text x="374" y="82" text-anchor="middle" class="svg-ink" font-size="13">SW-NET</text>
<rect x="474" y="14" width="150" height="54" rx="8" fill="#ddd6fe"/><text x="549" y="38" text-anchor="middle" class="svg-ink" font-size="13">FAZ-1</text><text x="549" y="56" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.6 logs</text>
<rect x="474" y="86" width="150" height="54" rx="8" fill="#bbf7d0"/><text x="549" y="110" text-anchor="middle" class="svg-ink" font-size="13">SRV-WEB</text><text x="549" y="128" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.80</text>
<line x1="114" y1="77" x2="164" y2="77" stroke="#64748b" stroke-width="2"/><line x1="274" y1="77" x2="324" y2="77" stroke="#64748b" stroke-width="2"/><line x1="424" y1="70" x2="474" y2="42" stroke="#64748b" stroke-width="2"/><line x1="424" y1="84" x2="474" y2="112" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">PC-TRY talks to SRV-WEB through TRY-FGT; TRY-FGT sends the logs to FAZ-1.</p></div>

<h3>Approach, step by step</h3>
<ol>
<li><b>Generate the traffic first.</b> Reports count stored logs, and the logs come from real sessions. On PC-TRY open five web sessions to SRV-WEB with the <code>curl</code> command, and start the file-sharing client twice with <code>nk-app BitTorrent 192.0.2.80</code>. Wait a few seconds so that the realtime upload reaches FAZ-1.</li>
<li><b>Run the Traffic Report</b> for TRY-FGT in the ADOM <code>root</code>. The lab has ADOM mode off, so everything is in root.</li>
<li><b>Run the Threat Report</b> for the same device.</li>
<li><b>Answer from the output</b>, not from what you remember doing.</li>
</ol>
<pre class="code"><span class="c">! on FAZ-1, simulator stand-ins</span>
FAZ-1 # execute fazui report run root TRY-FGT "Traffic Report"
FAZ-1 # execute fazui report run root TRY-FGT "Threat Report"</pre>

<h3>What output to look for</h3>
<p>In the Traffic Report the application list is a ranking. Read the first line of it, and read the Blocked number in the totals line.</p>
<pre class="out">Report: Traffic Report   ADOM: root   Device: TRY-FGT
Based on 9 stored analytics logs (7 traffic, 2 utm, 0 event).
Sessions: 7   Bytes: 588   <span class="hl">Blocked: 2</span>
Per action: accept=7
Top applications:
  1. <span class="hl">H&#84;TP.BROWSER</span>  (5)
  2. BitTorrent  (2)</pre>
<p>In the Threat Report the first entry under Top threats is the answer to the third question:</p>
<pre class="out">Report: Threat Report   ADOM: root   Device: TRY-FGT
Threat events: 2   Blocked: 2   Denied sessions (traffic logs): 0
By security feature: app-ctrl=2
Top threats:
  1. <span class="hl">BitTorrent</span>  (2)</pre>

<div class="eg"><p><b>Worked example of the reasoning.</b> Seven traffic logs: five from the browser tests and two from the file-sharing client. The two file-sharing sessions were accepted by policy 1 and stopped by the application control list, so they are accept in Per action but blocked in the totals. The two UTM logs are the threat events. That is why the basis line says 9 logs although there are only 7 sessions.</p></div>

<h3>Common wrong turns</h3>
<ul>
<li><b>Running the report before the traffic.</b> The output shows zero logs. Generate the sessions, wait, run again.</li>
<li><b>Answering Blocked with the deny count.</b> Per action shows no deny at all, yet the answer is 2.</li>
<li><b>Forgetting the quotes</b> around the layout name, or inventing a name. An unknown layout is refused and the valid names are listed.</li>
<li><b>Choosing the wrong ADOM.</b> A name that does not exist gives "ADOM does not exist"; an ADOM that exists but does not hold the device gives an empty report.</li>
<li><b>Answering from the top of the Threat Report's source list</b> instead of the threats list.</li>
</ul>

<div class="warn"><p><b>Honest limit.</b> The 588 bytes are 7 times 84, a simulator stand-in. Do not give the manager a bandwidth figure from this lab.</p></div>

<div class="exam"><p><b>Exam traps.</b> A session blocked by a profile still shows as accept in the per-action line. The Threat Report counts UTM logs, so its count can differ from the traffic session count.</p></div>

<div class="scn"><h4>The manager asks for numbers by lunchtime</h4><p>At Trichy the manager asked what the staff do online. The engineer generated no new traffic and ran the report on a quiet minute: the page was almost empty. After a short browsing test and one blocked file-sharing attempt, the report had enough sessions to show the split. The engineer explained that a test run proves the tool works, but real answers need real days of logs.</p><p><b>Lesson:</b> state clearly whether a report comes from a test or from production traffic.</p></div>

<div class="iv"><p class="q">"Walk me through producing a threat summary for a branch."</p><p>Confirm logging and registration, pick the ADOM and device, run the threat layout, read the basis line, then name the top threat and the number blocked. Add that you confirm one example in Log View.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Create the traffic first; reports only count stored logs.</li>
<li>Traffic Report answers application and Blocked; Threat Report answers top threat.</li>
<li>Blocked can be 2 while deny is 0.</li>
<li>Use quotes around the layout and the right ADOM, here root.</li>
<li>Answer from the printed report, not from memory.</li>
</ul></div>
`,hi:`
<p>Lab khaali car park mein driving test jaisa hai: sadak shaant hai, rules wahi hain, aur examiner sirf dekhta hai ki aap steps samajhdaar order mein karte ho. Is lab mein aap Trichy store par ek subah ka traffic banate ho, phir FAZ-1 se poochte ho ki network kis kaam aaya. Jo skill test hoti hai wo report padhna hai, lamba command type karna nahi.</p>

<h3>Goal</h3>
<p>Trichy ka store manager jaanna chahta hai ki branch network kis kaam aata hai. TRY-FGT (192.0.2.13) FAZ-1 par pehle se registered hai aur ek application control list chalata hai jo file sharing block karti hai. Aapko traffic banana hai, TRY-FGT ke liye Traffic Report aur Threat Report chalani hain, aur printed reports se teen sawalon ke jawab dene hain: pehli application kaun si hai, kitne sessions blocked hain, aur pehla threat kaun sa hai. Lab ke devices: FAZ-1, SW-NET, SRV-WEB, TRY-FGT, SW-TRY aur PC-TRY.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Lab topology fa-report">
<rect x="14" y="50" width="100" height="54" rx="8" fill="#bae6fd"/><text x="64" y="74" text-anchor="middle" class="svg-ink" font-size="13">PC-TRY</text><text x="64" y="92" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.10</text>
<rect x="164" y="50" width="110" height="54" rx="8" fill="#bae6fd"/><text x="219" y="74" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text><text x="219" y="92" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.13</text>
<rect x="324" y="50" width="100" height="54" rx="8" fill="#e2e8f0"/><text x="374" y="82" text-anchor="middle" class="svg-ink" font-size="13">SW-NET</text>
<rect x="474" y="14" width="150" height="54" rx="8" fill="#ddd6fe"/><text x="549" y="38" text-anchor="middle" class="svg-ink" font-size="13">FAZ-1</text><text x="549" y="56" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.6 logs</text>
<rect x="474" y="86" width="150" height="54" rx="8" fill="#bbf7d0"/><text x="549" y="110" text-anchor="middle" class="svg-ink" font-size="13">SRV-WEB</text><text x="549" y="128" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.80</text>
<line x1="114" y1="77" x2="164" y2="77" stroke="#64748b" stroke-width="2"/><line x1="274" y1="77" x2="324" y2="77" stroke="#64748b" stroke-width="2"/><line x1="424" y1="70" x2="474" y2="42" stroke="#64748b" stroke-width="2"/><line x1="424" y1="84" x2="474" y2="112" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">PC-TRY, TRY-FGT ke through SRV-WEB se baat karta hai; TRY-FGT logs FAZ-1 ko bhejta hai.</p></div>

<h3>Approach, step by step</h3>
<ol>
<li><b>Pehle traffic generate karo.</b> Reports stored logs ginti hain, aur logs real sessions se aate hain. PC-TRY par <code>curl</code> command se SRV-WEB ke paanch web sessions kholo, aur <code>nk-app BitTorrent 192.0.2.80</code> se file-sharing client do baar start karo. Kuch second ruko taaki realtime upload FAZ-1 tak pahunch jaye.</li>
<li><b>Traffic Report chalao</b> TRY-FGT ke liye ADOM <code>root</code> mein. Lab mein ADOM mode off hai, isliye sab root mein hai.</li>
<li><b>Threat Report chalao</b> usi device ke liye.</li>
<li><b>Output se jawab do</b>, yaad se nahi ki aapne kya kiya tha.</li>
</ol>
<pre class="code"><span class="c">! FAZ-1 par, simulator stand-ins</span>
FAZ-1 # execute fazui report run root TRY-FGT "Traffic Report"
FAZ-1 # execute fazui report run root TRY-FGT "Threat Report"</pre>

<h3>Kaunsa output dekhna hai</h3>
<p>Traffic Report mein application list ek ranking hai. Uski pehli line padho, aur totals line mein Blocked number padho.</p>
<pre class="out">Report: Traffic Report   ADOM: root   Device: TRY-FGT
Based on 9 stored analytics logs (7 traffic, 2 utm, 0 event).
Sessions: 7   Bytes: 588   <span class="hl">Blocked: 2</span>
Per action: accept=7
Top applications:
  1. <span class="hl">H&#84;TP.BROWSER</span>  (5)
  2. BitTorrent  (2)</pre>
<p>Threat Report mein Top threats ki pehli entry teesre sawal ka jawab hai:</p>
<pre class="out">Report: Threat Report   ADOM: root   Device: TRY-FGT
Threat events: 2   Blocked: 2   Denied sessions (traffic logs): 0
By security feature: app-ctrl=2
Top threats:
  1. <span class="hl">BitTorrent</span>  (2)</pre>

<div class="eg"><p><b>Reasoning ka worked example.</b> Saat traffic logs: paanch browser tests ke aur do file-sharing client ke. Do file-sharing sessions policy 1 ne accept kiye aur application control list ne roke, isliye wo Per action mein accept hain par totals mein blocked. Do UTM logs threat events hain. Isliye basis line 9 logs kehti hai jabki sessions sirf 7 hain.</p></div>

<h3>Common wrong turns</h3>
<ul>
<li><b>Traffic se pehle report chalana.</b> Output zero logs dikhata hai. Sessions generate karo, ruko, phir chalao.</li>
<li><b>Blocked ka jawab deny count se dena.</b> Per action mein deny hai hi nahi, phir bhi jawab 2 hai.</li>
<li><b>Layout naam ke aas-paas quotes bhoolna</b>, ya naam invent karna. Unknown layout refuse hota hai aur valid names list hote hain.</li>
<li><b>Galat ADOM chunna.</b> Jo naam exist nahi karta wo "ADOM does not exist" deta hai; jo ADOM exist karta hai par device nahi rakhta wo khaali report deta hai.</li>
<li><b>Threats list ki jagah Threat Report ki source list se jawab dena.</b></li>
</ul>

<div class="warn"><p><b>Honest limit.</b> 588 bytes matlab 7 x 84, simulator stand-in. Is lab se manager ko bandwidth figure mat do.</p></div>

<div class="exam"><p><b>Exam traps.</b> Profile se blocked session per-action line mein accept hi dikhta hai. Threat Report UTM logs ginti hai, isliye uska count traffic session count se alag ho sakta hai.</p></div>

<div class="scn"><h4>Manager lunch tak numbers maangti hai</h4><p>Trichy mein manager ne poocha ki staff online kya karta hai. Engineer ne naya traffic generate kiye bina ek shaant minute par report chalayi: page lagbhag khaali tha. Chhote browsing test aur ek blocked file-sharing attempt ke baad report mein split dikhane layak sessions the. Engineer ne samjhaya ki test run tool ko prove karta hai, par asli jawab ke liye real dinon ke logs chahiye.</p><p><b>Lesson:</b> saaf batao ki report test se hai ya production traffic se.</p></div>

<div class="iv"><p class="q">"Branch ke liye threat summary banane ka process batao."</p><p>Logging aur registration confirm karo, ADOM aur device chuno, threat layout chalao, basis line padho, phir top threat aur blocked ki sankhya batao. Jodo ki ek example Log View mein confirm karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle traffic banao; reports sirf stored logs ginti hain.</li>
<li>Traffic Report application aur Blocked batati hai; Threat Report top threat.</li>
<li>Blocked 2 ho sakta hai jabki deny 0 hai.</li>
<li>Layout ke aas-paas quotes aur sahi ADOM, yahan root.</li>
<li>Printed report se jawab do, yaad se nahi.</li>
</ul></div>
`}};export{e as default};