var e={id:`incidents`,h:{en:`Incidents: turning an event into a tracked case`,hi:`Incidents: event ko tracked case banana`},body:{en:`
<p>A hospital reception desk gets many visitors, but only a patient who is admitted gets a file. The file has a number, a reason, a status and notes from each doctor, and it only moves forward: admitted, under treatment, discharged. You cannot un-discharge a patient on paper. An incident is the file. The event is the person at the desk who says "this one needs a doctor".</p>

<h3>From event to incident</h3>
<p>An <b>incident</b> is a record that a person opens for one event. It keeps the title the analyst chose, the severity and the handler copied from the event, the device and the log count, a status, and notes. In the real product you click the event in the GUI and create an incident; the simulator gives the stand-in <code>execute fazui incident create &lt;adom&gt; &lt;event id&gt; &lt;title&gt;</code>.</p>
<pre class="code"><span class="c">! on FAZ-1 (stand-in for the GUI action)</span>
execute fazui incident create root 1 Repeated denied web access from PC-HQ
execute fazui events root list</pre>
<pre class="out">Incident 1 created from event 1 (status new).

ID   SEVERITY  HANDLER             DEVICE            GROUP         LOGS  LAST LOG             STATUS
1    high      deny-burst          HQ-FGT            10.10.0.10    3     2026-10-12 20:47:49  <span class="hl">incident (incident 1)</span>
2    high      deny-burst          HQ-FGT            10.10.0.10    3     2026-10-12 20:48:17  unhandled</pre>
<p>Look at the two STATUS values. Event 1 now points to incident 1. Event 2 is still unhandled and is a separate item. The count of events and the count of incidents are different numbers.</p>

<h3>The status path</h3>
<table class="cmp"><tr><th>Status</th><th>Meaning in practice</th></tr>
<tr><td>new</td><td>Opened, nobody has looked at the evidence yet.</td></tr>
<tr><td>analysis</td><td>An analyst reads the logs behind the event and decides what it is.</td></tr>
<tr><td>response</td><td>Action is being taken: a user is contacted, a policy changed, a PC isolated.</td></tr>
<tr><td>closed</td><td>The work is finished. The record stays as evidence.</td></tr>
</table>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Incident status path">
<rect x="20" y="40" width="110" height="52" rx="8" fill="#e2e8f0"/><text x="75" y="70" text-anchor="middle" class="svg-ink" font-size="13">new</text>
<rect x="180" y="40" width="110" height="52" rx="8" fill="#bae6fd"/><text x="235" y="70" text-anchor="middle" class="svg-ink" font-size="13">analysis</text>
<rect x="340" y="40" width="110" height="52" rx="8" fill="#fde68a"/><text x="395" y="70" text-anchor="middle" class="svg-ink" font-size="13">response</text>
<rect x="500" y="40" width="110" height="52" rx="8" fill="#bbf7d0"/><text x="555" y="70" text-anchor="middle" class="svg-ink" font-size="13">closed</text>
<line x1="130" y1="66" x2="180" y2="66" stroke="#64748b" stroke-width="2"/><line x1="290" y1="66" x2="340" y2="66" stroke="#64748b" stroke-width="2"/><line x1="450" y1="66" x2="500" y2="66" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="13">Only forward. No step back.</text>
</svg><p class="cap">The status path of an incident.</p></div>

<h3>Working the incident</h3>
<p>You move the incident with <code>incident update</code>. Everything after the new status word is a note, and notes are appended, so earlier notes are not lost.</p>
<pre class="code">execute fazui incident update root 1 analysis source checked
execute fazui incident update root 1 new
execute fazui incident update root 1 closed false alarm, user told
execute fazui incident update root 1 new
execute fazui incident list root</pre>
<pre class="out">Incident 1: new -&gt; analysis.
<span class="hl">Incident 1 is in status analysis; it cannot go back to new.</span>
Incident 1: analysis -&gt; closed.
<span class="hl">Incident 1 is closed and cannot be changed.</span>
ID   STATUS    SEVERITY  EVENT  CREATED              TITLE
1    closed    high      1      2026-10-12 20:48:05  Repeated denied web access from PC-HQ   notes: source checked; false alarm, user told</pre>
<p>In the simulator an incident moved from analysis straight to closed, so the response step can be skipped when no action is needed. The one rule that never bends is that you cannot go backwards, and a closed incident is frozen. The stored table shows the same facts and can be read at any time:</p>
<pre class="out">FAZ-1 # show faz incident
config faz incident
    edit 1
        set event-id 1
        set title "Repeated denied web access from PC-HQ"
        set severity high
        set status closed
        set handler "deny-burst"
        set device "HQ-FGT"
        set count 3
        set notes "source checked; false alarm, user told"
    next
end</pre>
<p>Two more refusals are useful to know. An event can have only one incident: <code>Event 1 already belongs to incident 1.</code> And an unknown number is refused: <code>Event 99 does not exist in ADOM root.</code></p>

<div class="eg"><p><b>Worked example.</b> Event 1 says three denied sessions from 10.10.0.10 in five minutes. The analyst opens the incident, moves it to analysis and writes "source checked": the PC belongs to a trainee who was told that the intranet is frozen. No action is needed on the network, so the incident is closed with the note "false alarm, user told". A month later an auditor can read exactly what was decided and why.</p></div>

<h3>What the real product adds (theory)</h3>
<p>The real FortiAnalyzer lets you assign an incident to an analyst, attach files and screenshots, link several events to one incident, and send events to automation. Playbooks, which run steps such as blocking an address, belong to FortiSOAR or to the automation engine of the real product. The simulator does not model assignment, attachments or playbooks; it keeps the title, status and notes.</p>

<div class="warn"><p><b>Common mistakes.</b> Closing an incident without a note, so the reason is lost; trying to reopen a closed incident instead of opening a new one for the next event; opening an incident for every event, which moves the noise one step down the funnel instead of removing it.</p></div>

<div class="exam"><p><b>Exam trap.</b> Status words are new, analysis, response and closed, in that order. There is no step back and a closed incident cannot change. The event status changes to incident when the case is opened; the handler never does that.</p></div>

<div class="scn"><h4>Three weeks later, who decided what?</h4><p>An auditor at Kaveri asked why a burst of denied sessions from the head office had no follow-up. The analyst opened incident 4. It showed the event, the three notes ("source checked", "trainee PC, user told", "no policy change needed") and the closing time. The audit question took two minutes. Without the incident, the answer would have been a vague memory.</p><p><b>Lesson:</b> the value of an incident is the written trail, not the status word.</p></div>

<div class="iv"><p class="q">"What happens when you create an incident from an event?"</p><p>The event status changes to incident and points to the new case. The case starts as new and moves forward through analysis and response to closed; it never goes back, and notes record each decision. Add that assignment, attachments and playbooks exist in the real product.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A person creates an incident for one event; an event can have only one incident.</li>
<li>Status path: new, analysis, response, closed; no step back; closed is frozen.</li>
<li>Notes are appended and form the audit trail.</li>
<li>The event status becomes incident when the case is opened.</li>
<li>Assignment, attachments and playbooks are theory in this course.</li>
</ul></div>
`,hi:`
<p>Hospital ke reception desk par bahut visitors aate hain, par file sirf us patient ki banti hai jo admit hota hai. File mein number, wajah, status aur har doctor ke notes hote hain, aur wo sirf aage badhti hai: admitted, treatment, discharged. Kaagaz par discharge hue patient ko un-discharge nahi kar sakte. Incident wahi file hai. Event wo insaan hai jo desk par bolta hai "isko doctor chahiye".</p>

<h3>Event se incident tak</h3>
<p><b>Incident</b> ek record hai jo insaan ek event ke liye kholta hai. Ismein analyst ka chuna hua title, event se copy hui severity aur handler, device aur log count, ek status aur notes hote hain. Real product mein aap GUI mein event par click karke incident banate ho; simulator stand-in deta hai <code>execute fazui incident create &lt;adom&gt; &lt;event id&gt; &lt;title&gt;</code>.</p>
<pre class="code"><span class="c">! on FAZ-1 (GUI action ka stand-in)</span>
execute fazui incident create root 1 Repeated denied web access from PC-HQ
execute fazui events root list</pre>
<pre class="out">Incident 1 created from event 1 (status new).

ID   SEVERITY  HANDLER             DEVICE            GROUP         LOGS  LAST LOG             STATUS
1    high      deny-burst          HQ-FGT            10.10.0.10    3     2026-10-12 20:47:49  <span class="hl">incident (incident 1)</span>
2    high      deny-burst          HQ-FGT            10.10.0.10    3     2026-10-12 20:48:17  unhandled</pre>
<p>Dono STATUS values dekho. Event 1 ab incident 1 ki taraf point karta hai. Event 2 abhi unhandled hai aur alag item hai. Events ki ginti aur incidents ki ginti alag numbers hain.</p>

<h3>Status path</h3>
<table class="cmp"><tr><th>Status</th><th>Practice mein matlab</th></tr>
<tr><td>new</td><td>Khola gaya, abhi kisi ne evidence nahi dekha.</td></tr>
<tr><td>analysis</td><td>Analyst event ke peeche ke logs padhta hai aur decide karta hai ki ye kya hai.</td></tr>
<tr><td>response</td><td>Action ho raha hai: user se baat, policy change, PC isolate.</td></tr>
<tr><td>closed</td><td>Kaam khatam. Record evidence ki tarah rehta hai.</td></tr>
</table>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Incident status path">
<rect x="20" y="40" width="110" height="52" rx="8" fill="#e2e8f0"/><text x="75" y="70" text-anchor="middle" class="svg-ink" font-size="13">new</text>
<rect x="180" y="40" width="110" height="52" rx="8" fill="#bae6fd"/><text x="235" y="70" text-anchor="middle" class="svg-ink" font-size="13">analysis</text>
<rect x="340" y="40" width="110" height="52" rx="8" fill="#fde68a"/><text x="395" y="70" text-anchor="middle" class="svg-ink" font-size="13">response</text>
<rect x="500" y="40" width="110" height="52" rx="8" fill="#bbf7d0"/><text x="555" y="70" text-anchor="middle" class="svg-ink" font-size="13">closed</text>
<line x1="130" y1="66" x2="180" y2="66" stroke="#64748b" stroke-width="2"/><line x1="290" y1="66" x2="340" y2="66" stroke="#64748b" stroke-width="2"/><line x1="450" y1="66" x2="500" y2="66" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="13">Sirf aage. Peeche nahi.</text>
</svg><p class="cap">Incident ka status path.</p></div>

<h3>Incident par kaam karna</h3>
<p>Incident ko <code>incident update</code> se aage badhate hain. Naye status word ke baad jo bhi likha ho wo note hai, aur notes jodte jaate hain, isliye purane notes nahi jaate.</p>
<pre class="code">execute fazui incident update root 1 analysis source checked
execute fazui incident update root 1 new
execute fazui incident update root 1 closed false alarm, user told
execute fazui incident update root 1 new
execute fazui incident list root</pre>
<pre class="out">Incident 1: new -&gt; analysis.
<span class="hl">Incident 1 is in status analysis; it cannot go back to new.</span>
Incident 1: analysis -&gt; closed.
<span class="hl">Incident 1 is closed and cannot be changed.</span>
ID   STATUS    SEVERITY  EVENT  CREATED              TITLE
1    closed    high      1      2026-10-12 20:48:05  Repeated denied web access from PC-HQ   notes: source checked; false alarm, user told</pre>
<p>Simulator mein incident analysis se seedha closed hua, yaani jab action ki zaroorat nahi to response step skip ho sakta hai. Jo rule kabhi nahi jhukta wo ye hai ki peeche nahi ja sakte, aur closed incident frozen hai. Stored table wahi facts dikhati hai aur kabhi bhi padhi ja sakti hai:</p>
<pre class="out">FAZ-1 # show faz incident
config faz incident
    edit 1
        set event-id 1
        set title "Repeated denied web access from PC-HQ"
        set severity high
        set status closed
        set handler "deny-burst"
        set device "HQ-FGT"
        set count 3
        set notes "source checked; false alarm, user told"
    next
end</pre>
<p>Do refusals aur jaanne laayak hain. Ek event ka sirf ek incident ho sakta hai: <code>Event 1 already belongs to incident 1.</code> Aur unknown number refuse hota hai: <code>Event 99 does not exist in ADOM root.</code></p>

<div class="eg"><p><b>Worked example.</b> Event 1 kehta hai ki 10.10.0.10 se paanch minute mein teen denied sessions aaye. Analyst incident kholta hai, use analysis mein le jaata hai aur "source checked" likhta hai: wo PC ek trainee ki hai jise bataya gaya tha ki intranet frozen hai. Network par koi action nahi chahiye, isliye incident "false alarm, user told" note ke saath close hota hai. Ek mahine baad auditor padh sakta hai ki kya decide hua aur kyun.</p></div>

<h3>Real product aur kya deta hai (theory)</h3>
<p>Real FortiAnalyzer mein incident analyst ko assign kar sakte ho, files aur screenshots attach kar sakte ho, kai events ek incident se link kar sakte ho, aur events automation ko bhej sakte ho. Playbooks, jo address block karne jaise steps chalate hain, real product ke FortiSOAR ya automation engine ke hain. Simulator assignment, attachments ya playbooks model nahi karta; wo title, status aur notes rakhta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Bina note ke incident close karna, jisse wajah kho jaati hai; closed incident ko dobara kholne ki koshish karna jabki agle event ke liye naya incident kholna chahiye; har event ke liye incident kholna, jo noise ko funnel mein ek step neeche le jaata hai, hatata nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Status words hain new, analysis, response aur closed, isi order mein. Peeche jaana nahi hai aur closed incident badal nahi sakta. Case khulne par event status incident ho jaata hai; ye kaam handler kabhi nahi karta.</p></div>

<div class="scn"><h4>Teen hafte baad, kisne kya decide kiya?</h4><p>Kaveri ke auditor ne poocha ki head office ke denied sessions ke burst ka koi follow-up kyun nahi tha. Analyst ne incident 4 kholi. Usmein event, teen notes ("source checked", "trainee PC, user told", "no policy change needed") aur closing time tha. Audit ka sawal do minute mein nipat gaya. Incident ke bina jawab sirf dhundhli yaad hota.</p><p><b>Lesson:</b> incident ki value likhi hui trail mein hai, status word mein nahi.</p></div>

<div class="iv"><p class="q">"Event se incident banate hi kya hota hai?"</p><p>Event ka status incident ho jaata hai aur naye case ki taraf point karta hai. Case new se shuru hota hai aur analysis, response se hote hue closed tak aage badhta hai; peeche nahi jaata, aur notes har decision record karte hain. Ye bhi bolo ki assignment, attachments aur playbooks real product mein hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Insaan ek event ke liye incident banata hai; ek event ka sirf ek incident ho sakta hai.</li>
<li>Status path: new, analysis, response, closed; peeche nahi; closed frozen hai.</li>
<li>Notes jodte jaate hain aur audit trail banate hain.</li>
<li>Case khulne par event status incident ho jaata hai.</li>
<li>Assignment, attachments aur playbooks is course mein theory hain.</li>
</ul></div>
`}};export{e as default};