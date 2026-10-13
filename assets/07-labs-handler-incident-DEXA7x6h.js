var e={id:`labs-handler-incident`,h:{en:`Labs fa-handler and fa-incident: build a handler, raise and work an incident`,hi:`Labs fa-handler aur fa-incident: handler banao, incident raise karo aur chalao`},body:{en:`
<p>A fire drill teaches more in ten minutes than a page of rules, because you do the steps with your own hands. These two labs are your drill. In the first you build an alarm rule and set it off with real denied traffic. In the second you take one alarm and turn it into a tracked case. The text below gives goals, approach, what to look for and the wrong turns; the exact commands are yours to find with the forms from chapters 2 and 4.</p>

<h3>Lab fa-handler: an event handler for repeated denied sessions</h3>
<p><b>Goal.</b> HQ-FGT denies web access from the head office LAN to the intranet server SRV-WEB (192.0.2.80) through the policy DENY-WEB while a project is frozen. The SOC wants an event when one source has 3 denied sessions within 5 minutes. MDU-FGT allows the same traffic, so it must stay quiet. Devices: FAZ-1, HQ-FGT, PC-HQ, MDU-FGT, PC-MDU and the switches and server around them.</p>
<table class="cmp"><tr><th>Step</th><th>Approach</th><th>What to look for</th></tr>
<tr><td>1 Create the handler</td><td>Use the stand-in form from chapter 2 in ADOM root, name deny-burst, log type traffic, filter on the action value, group by the source address, threshold 3, window 5, severity high.</td><td>The list shows <code>3 in 5 min</code> and a filter with the group-by.</td></tr>
<tr><td>2 Generate denied traffic</td><td>On PC-HQ send three web requests to SRV-WEB with curl, as the task text shows.</td><td>One event, group 10.10.0.10, LOGS 3, status unhandled.</td></tr>
<tr><td>3 Check the quiet site</td><td>Send three requests from PC-MDU and list the events again.</td><td>No new event for MDU-FGT.</td></tr>
</table>
<pre class="out">FAZ-1 # execute fazui events root list
ID   SEVERITY  HANDLER             DEVICE            GROUP         LOGS  LAST LOG             STATUS
1    high      deny-burst          HQ-FGT            <span class="hl">10.10.0.10</span>    3     2026-10-12 20:55:25  unhandled</pre>
<p>For the quiet site, prove it with the logs instead of trusting the empty events list. Log View shows why MDU-FGT never counts: its sessions are accepted by a different policy.</p>
<pre class="out">FAZ-1 # execute fazui logview root MDU-FGT traffic limit 1
1: ... srcip=10.20.0.10 ... dstip=192.0.2.80 dstport=80 ... <span class="hl">action="accept"</span> policyid=1 policyname="LAN-TO-WAN" ...
FAZ-1 # execute fazui logview root - traffic srcip=10.20.0.* action=deny
0 logs match, 0 shown (newest first).</pre>

<div class="warn"><p><b>Wrong turns in this lab.</b> Typing the severity before the numbers (the last three words are threshold, minutes, severity). Writing action=blocked. Sending only two requests and waiting for an event. Creating the handler after the traffic: then you must send three more requests.</p></div>

<h3>Lab fa-incident: raise an incident from an event and work it</h3>
<p><b>Goal.</b> The handler deny-burst already exists. A user on PC-HQ keeps hitting the blocked intranet and the SOC lead wants the case tracked. You raise an incident from the event, move it through analysis with a note, close it with a note, and prove that it cannot go back. Devices: FAZ-1, HQ-FGT, PC-HQ and the network between them.</p>
<table class="cmp"><tr><th>Step</th><th>Approach</th><th>What to look for</th></tr>
<tr><td>1 Get an event</td><td>Send three web requests from PC-HQ and list the events of root.</td><td>An event from deny-burst with the status unhandled.</td></tr>
<tr><td>2 Create the incident</td><td>Use the incident create form with the ADOM, the event number from the ID column and a clear title. Then list the events again.</td><td>The status of that event now reads incident, followed by the incident number.</td></tr>
<tr><td>3 Analysis</td><td>Update the incident to analysis and write the note "source checked" after the status word.</td><td>The message <code>new -&gt; analysis</code>.</td></tr>
<tr><td>4 Close and test the rule</td><td>Close with a note that records the decision. Then try to set the status new.</td><td>A refusal: the incident is closed and cannot be changed.</td></tr>
</table>
<pre class="out">FAZ-1 # execute fazui events root list
ID   SEVERITY  HANDLER             DEVICE            GROUP         LOGS  LAST LOG             STATUS
1    high      deny-burst          HQ-FGT            10.10.0.10    3     2026-10-12 20:47:49  <span class="hl">incident (incident 1)</span>
FAZ-1 # execute fazui incident update root 1 new
<span class="hl">Incident 1 is closed and cannot be changed.</span></pre>
<p>The lab asks whether an incident can go back to new. The answer is no. If you try new while the incident is still in analysis, you get a different sentence that says the same thing: it cannot go back.</p>

<div class="warn"><p><b>Wrong turns in this lab.</b> Using the event number of another ADOM; creating a second incident for the same event (refused: the event already belongs to an incident); putting the note before the status word, which turns it into an invalid status; closing before writing the analysis note; expecting the handler to create the incident by itself.</p></div>

<div class="exam"><p><b>Exam trap.</b> After the incident is created, the event is not deleted. Its status changes to incident and it keeps pointing at the case. Counting events and counting incidents gives different numbers on purpose.</p></div>

<div class="scn"><h4>The drill that found a gap</h4><p>A trainee at Kaveri ran both labs on a Friday. In the first she created the handler for the head office but left the device empty, and later saw that it would also count Madurai traffic. In the second she closed the incident before adding a note and could not add one afterwards. Both findings went into the team runbook: name the device when a rule belongs to one site, and write the note before you close.</p><p><b>Lesson:</b> labs are cheap places to make the mistakes you do not want in production.</p></div>

<div class="iv"><p class="q">"Walk me through how you would set up alerting for repeated denied sessions."</p><p>I read a real denied log in Log View, copy the field and value, create a traffic handler with action=deny, group-by srcip, threshold 3 in 5 minutes and severity high, then generate the traffic and confirm one event. For follow-up I raise an incident from the event and move it forward with notes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Handler form: ADOM, name, type, filter, group-by, then threshold, minutes, severity.</li>
<li>Three denied sessions from one PC within five minutes give one unhandled event.</li>
<li>An allowed site stays quiet; prove it with Log View.</li>
<li>Creating an incident turns the event status into incident.</li>
<li>Incidents move forward only and a closed one cannot change.</li>
</ul></div>
`,hi:`
<p>Fire drill das minute mein rules ke ek page se zyada sikhata hai, kyunki steps aap apne haathon se karte ho. Ye do labs aapki drill hain. Pehle lab mein aap alarm rule banate ho aur real denied traffic se use bajate ho. Doosre mein aap ek alarm ko tracked case banate ho. Neeche ka text goals, approach, kya dekhna hai aur galat modh deta hai; exact commands aapko chapters 2 aur 4 ke forms se khud dhoondhne hain.</p>

<h3>Lab fa-handler: baar-baar denied sessions ke liye event handler</h3>
<p><b>Goal.</b> HQ-FGT project freeze ke dauran DENY-WEB policy se head office LAN se intranet server SRV-WEB (192.0.2.80) ka web access deny karta hai. SOC ko event chahiye jab ek source ke 5 minute mein 3 denied sessions hon. MDU-FGT wahi traffic allow karta hai, isliye wo chup rehna chahiye. Devices: FAZ-1, HQ-FGT, PC-HQ, MDU-FGT, PC-MDU aur unke aaspaas ke switches aur server.</p>
<table class="cmp"><tr><th>Step</th><th>Approach</th><th>Kya dekhna hai</th></tr>
<tr><td>1 Handler banao</td><td>Chapter 2 ka stand-in form ADOM root mein use karo, name deny-burst, log type traffic, filter action value par, group source address se, threshold 3, window 5, severity high.</td><td>List mein <code>3 in 5 min</code> aur group-by ke saath filter dikhe.</td></tr>
<tr><td>2 Denied traffic generate karo</td><td>PC-HQ se SRV-WEB ko teen web requests curl se bhejo, jaise task text dikhata hai. Kuch second ruko, phir root ke events list karo.</td><td>Ek event, group 10.10.0.10, LOGS 3, status unhandled.</td></tr>
<tr><td>3 Quiet site check karo</td><td>PC-MDU se teen requests bhejo aur events phir list karo.</td><td>MDU-FGT ka koi naya event nahi.</td></tr>
</table>
<pre class="out">FAZ-1 # execute fazui events root list
ID   SEVERITY  HANDLER             DEVICE            GROUP         LOGS  LAST LOG             STATUS
1    high      deny-burst          HQ-FGT            <span class="hl">10.10.0.10</span>    3     2026-10-12 20:55:25  unhandled</pre>
<p>Quiet site ke liye khaali events list par bharosa karne ki jagah logs se saabit karo. Log View dikhata hai ki MDU-FGT kabhi count kyun nahi hota: uske sessions doosri policy accept karti hai.</p>
<pre class="out">FAZ-1 # execute fazui logview root MDU-FGT traffic limit 1
1: ... srcip=10.20.0.10 ... dstip=192.0.2.80 dstport=80 ... <span class="hl">action="accept"</span> policyid=1 policyname="LAN-TO-WAN" ...
FAZ-1 # execute fazui logview root - traffic srcip=10.20.0.* action=deny
0 logs match, 0 shown (newest first).</pre>

<div class="warn"><p><b>Is lab ke galat mod.</b> Severity ko numbers se pehle likhna (aakhri teen words threshold, minutes, severity hain). action=blocked likhna. Sirf do requests bhej kar event ka intezaar karna. Traffic ke baad handler banana: tab teen requests aur bhejni padengi. Galat ADOM dekhna; yahan sab root mein hai.</p></div>

<h3>Lab fa-incident: event se incident raise karo aur chalao</h3>
<p><b>Goal.</b> Handler deny-burst pehle se maujood hai. PC-HQ ka ek user baar-baar blocked intranet hit karta hai aur SOC lead case tracked chahti hai. Aap event se incident raise karte ho, use note ke saath analysis mein le jaate ho, note ke saath close karte ho, aur saabit karte ho ki wo peeche nahi ja sakta. Devices: FAZ-1, HQ-FGT, PC-HQ aur beech ka network.</p>
<table class="cmp"><tr><th>Step</th><th>Approach</th><th>Kya dekhna hai</th></tr>
<tr><td>1 Event lo</td><td>PC-HQ se teen web requests bhejo aur root ke events list karo.</td><td>deny-burst ka event, status unhandled.</td></tr>
<tr><td>2 Incident banao</td><td>Incident create form ADOM, ID column ke event number aur saaf title ke saath use karo. Phir events dobara list karo.</td><td>Us event ka status ab incident padhta hai, uske baad incident number.</td></tr>
<tr><td>3 Analysis</td><td>Incident ko analysis par update karo aur status word ke baad note "source checked" likho.</td><td>Message <code>new -&gt; analysis</code>.</td></tr>
<tr><td>4 Close karo aur rule test karo</td><td>Decision record karne wale note ke saath close karo. Phir status new set karne ki koshish karo.</td><td>Refusal: incident closed hai aur badal nahi sakta.</td></tr>
</table>
<pre class="out">FAZ-1 # execute fazui events root list
ID   SEVERITY  HANDLER             DEVICE            GROUP         LOGS  LAST LOG             STATUS
1    high      deny-burst          HQ-FGT            10.10.0.10    3     2026-10-12 20:47:49  <span class="hl">incident (incident 1)</span>
FAZ-1 # execute fazui incident update root 1 new
<span class="hl">Incident 1 is closed and cannot be changed.</span></pre>
<p>Lab poochta hai ki kya incident new par wapas ja sakta hai. Jawab no hai, aur refusal aapne khud dekhna chahiye. Agar incident abhi analysis mein ho aur aap new try karo to doosra sentence aata hai jo wahi baat kehta hai: peeche nahi ja sakta.</p>

<div class="warn"><p><b>Is lab ke galat mod.</b> Doosre ADOM ka event number use karna; ek hi event ke liye doosra incident banana (refused: event pehle se incident ka hai); note ko status word se pehle likhna, jisse wo invalid status ban jaata hai; analysis note likhne se pehle close karna; ye maanna ki handler khud incident bana dega.</p></div>

<div class="exam"><p><b>Exam trap.</b> Incident banne ke baad event delete nahi hota. Uska status incident ho jaata hai aur wo case ki taraf point karta rehta hai. Events aur incidents ki ginti alag aati hai, aur ye jaanbujhkar hai.</p></div>

<div class="scn"><h4>Drill jisne gap pakda</h4><p>Kaveri ki ek trainee ne Friday ko dono labs chalaye. Pehle mein usne head office ke liye handler banaya par device khaali chhod diya, aur baad mein dekha ki wo Madurai ka traffic bhi ginega. Doosre mein usne note jode bina incident close kar diya aur baad mein note nahi jod saki. Dono findings team runbook mein gaye: rule ek site ka ho to device naam do, aur close karne se pehle note likho.</p><p><b>Lesson:</b> labs wo sasti jagah hain jahan wo galtiyan ho jaayen jo production mein nahi chahiye.</p></div>

<div class="iv"><p class="q">"Baar-baar denied sessions ke liye alerting aap kaise set up karoge?"</p><p>Main Log View mein ek real denied log padhta hoon, field aur value copy karta hoon, action=deny, group-by srcip, 5 minute mein 3 aur severity high ke saath traffic handler banata hoon, phir traffic generate karke ek event confirm karta hoon. Follow-up ke liye event se incident raise karta hoon aur notes ke saath aage badhata hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Handler form: ADOM, name, type, filter, group-by, phir threshold, minutes, severity.</li>
<li>Ek PC ke paanch minute mein teen denied sessions ek unhandled event dete hain.</li>
<li>Allowed site chup rehta hai; Log View se saabit karo.</li>
<li>Incident banne par event status incident ho jaata hai.</li>
<li>Incidents sirf aage badhte hain aur closed badal nahi sakta.</li>
</ul></div>
`}};export{e as default};