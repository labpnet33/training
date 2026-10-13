var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a pilot flies, there is a checklist. It does not teach flying; it makes sure nothing you already know is forgotten. This chapter is the checklist of the module Event handlers and incidents: what you should be able to do, the words you should be able to explain, and the facts that questions like to test.</p>

<h3>The whole module in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Summary of the module">
<rect x="10" y="20" width="120" height="60" rx="8" fill="#e2e8f0"/><text x="70" y="48" text-anchor="middle" class="svg-ink" font-size="13">Stored logs</text><text x="70" y="66" text-anchor="middle" class="svg-muted" font-size="12">action=deny</text>
<rect x="165" y="20" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="235" y="48" text-anchor="middle" class="svg-ink" font-size="13">Handler</text><text x="235" y="66" text-anchor="middle" class="svg-muted" font-size="12">3 in 5 min, srcip</text>
<rect x="340" y="20" width="130" height="60" rx="8" fill="#fde68a"/><text x="405" y="48" text-anchor="middle" class="svg-ink" font-size="13">Event</text><text x="405" y="66" text-anchor="middle" class="svg-muted" font-size="12">unhandled</text>
<rect x="505" y="20" width="125" height="60" rx="8" fill="#bbf7d0"/><text x="567" y="48" text-anchor="middle" class="svg-ink" font-size="13">Incident</text><text x="567" y="66" text-anchor="middle" class="svg-muted" font-size="12">new to closed</text>
<line x1="130" y1="50" x2="165" y2="50" stroke="#64748b" stroke-width="2"/><line x1="305" y1="50" x2="340" y2="50" stroke="#64748b" stroke-width="2"/><line x1="470" y1="50" x2="505" y2="50" stroke="#64748b" stroke-width="2"/>
<text x="235" y="115" text-anchor="middle" class="svg-muted" font-size="12">sees only logs stored after creation</text>
<text x="567" y="115" text-anchor="middle" class="svg-muted" font-size="12">no step back</text>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="13">Troubleshoot in this order: logs, filter, threshold and window, enabled, scope.</text>
</svg><p class="cap">The chain and the checks you now know.</p></div>

<h3>Checklist: can you do this?</h3>
<ul>
<li>Explain in two sentences the difference between a log, an event and an incident.</li>
<li>Name the parts of a handler: ADOM, device, log type, filter, threshold, window, severity, group-by.</li>
<li>Create a handler with the simulator form and read it back with the list and the configuration table.</li>
<li>Draw the sliding window and say why logs further apart than the window never count together.</li>
<li>Find the real value of a field in Log View before writing a filter.</li>
<li>Read the events list: ID, handler, device, group, logs, last log, status.</li>
<li>Explain why a handler created after the traffic raises nothing.</li>
<li>Create an incident from an event, move it forward with notes, and show that it cannot go back.</li>
<li>Apply the five troubleshooting checks in order and change one thing at a time.</li>
<li>Say which parts are GUI in the real product and which are theory only.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Event handler</dt><dd>A rule on the FortiAnalyzer that turns enough matching logs inside a time window into an event.</dd>
<dt>Threshold and window</dt><dd>The number of logs and the number of minutes in which they must fall.</dd>
<dt>Group-by</dt><dd>A field (for example srcip) whose every value gets its own count.</dd>
<dt>Event</dt><dd>The result of a satisfied handler; starts as unhandled.</dd>
<dt>Incident</dt><dd>A tracked case opened for an event; statuses new, analysis, response, closed.</dd>
<dt>Severity</dt><dd>low, medium, high or critical, set by the handler.</dd>
<dt>Unhandled</dt><dd>The status of an event that has no incident yet.</dd>
</dl>

<h3>The most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Remember</th></tr>
<tr><td>Denied session in a traffic log</td><td>action=deny, never blocked</td></tr>
<tr><td>Threshold and window</td><td>"3 in 5" is three logs within five minutes</td></tr>
<tr><td>After an event</td><td>The window of that group is emptied</td></tr>
<tr><td>Handler sees</td><td>Only logs stored after it was created</td></tr>
<tr><td>Disabled handler</td><td>Raises nothing</td></tr>
<tr><td>Handler without device</td><td>Reads every device of the ADOM</td></tr>
<tr><td>Incident path</td><td>new, analysis, response, closed; no step back</td></tr>
<tr><td>One event</td><td>One incident only</td></tr>
</table>

<div class="warn"><p><b>What is theory only.</b> In the real product, handlers, events and incidents are GUI objects; the commands <code>execute fazui handler</code>, <code>execute fazui events</code> and <code>execute fazui incident</code> and the tables <code>config faz event-handler</code> and <code>config faz incident</code> are simulator stand-ins and do not exist on a real FortiAnalyzer. Notifications by email or syslog, handler templates and predefined handlers, assignment and attachments, automation, FortiSOAR and playbooks are not modelled. Real log volumes are far larger than the simulator produces.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions often mix steps of the chain. The handler raises events; a person or automation creates the incident; a report summarises stored logs and is not an event. If a stem says "the handler created an incident", the statement is wrong for the simulator. This independent course overlaps with vendor administrator-level skills for central logging, but it is not exam preparation.</p></div>

<div class="eg"><p><b>Worked example for revision.</b> A ticket says: "Madurai PC was blocked many times, we saw nothing." You check Log View for the PC: five deny logs within two minutes. You read the handler: filter correct, threshold 3, window 5, status disable. Cause: the handler was disabled. You enable it, generate three new denied sessions and see an event. You then open an incident with notes. Five checks, one fix.</p></div>

<div class="scn"><h4>The monthly review at Kaveri Retail</h4><p>Once a month the SOC lead at Kaveri reviews three numbers: events raised, events with an incident, and incidents closed with a note. The first month showed 120 events and 3 incidents, which meant the handlers were noisy or nobody worked the list. The team raised the threshold of one handler from 2 to 3, named a device on another, and agreed that every closed incident needs a note. The next month showed 40 events, 9 incidents and 9 notes.</p><p><b>Lesson:</b> a handler is never finished. Review events and incidents, then tune thresholds, scope and severity.</p></div>

<div class="iv"><p class="q">"Summarise how you would detect and track repeated denied access on FortiAnalyzer."</p><p>Read a real deny log in Log View, create a traffic handler on action=deny grouped by source with a threshold and window above normal, generate traffic to prove it fires, then raise an incident from the event and document each step in notes. State that it sees only logs stored after creation and that notifications and playbooks exist in the real product as theory.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Logs are evidence, events are alarms from handlers, incidents are human cases.</li>
<li>Handler filters must use the real log values; test them in Log View.</li>
<li>Threshold and window are logs and minutes; the window slides and is emptied after an event.</li>
<li>Incidents move forward only; notes are the audit trail.</li>
<li>Troubleshoot in the fixed order of five checks, one change at a time.</li>
</ul></div>
`,hi:`
<p>Pilot udaan bharne se pehle checklist dekhta hai. Wo udna nahi sikhati; wo yaqeen dilati hai ki jo aap pehle se jaante ho wo bhool na jaaye. Ye chapter module Event handlers and incidents ki checklist hai: aap kya kar sakte ho, kaun se words samjha sakte ho, aur kaun se facts sawal mein pooche jaate hain.</p>

<h3>Poora module ek picture mein</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Module ka summary">
<rect x="10" y="20" width="120" height="60" rx="8" fill="#e2e8f0"/><text x="70" y="48" text-anchor="middle" class="svg-ink" font-size="13">Stored logs</text><text x="70" y="66" text-anchor="middle" class="svg-muted" font-size="12">action=deny</text>
<rect x="165" y="20" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="235" y="48" text-anchor="middle" class="svg-ink" font-size="13">Handler</text><text x="235" y="66" text-anchor="middle" class="svg-muted" font-size="12">5 min mein 3, srcip</text>
<rect x="340" y="20" width="130" height="60" rx="8" fill="#fde68a"/><text x="405" y="48" text-anchor="middle" class="svg-ink" font-size="13">Event</text><text x="405" y="66" text-anchor="middle" class="svg-muted" font-size="12">unhandled</text>
<rect x="505" y="20" width="125" height="60" rx="8" fill="#bbf7d0"/><text x="567" y="48" text-anchor="middle" class="svg-ink" font-size="13">Incident</text><text x="567" y="66" text-anchor="middle" class="svg-muted" font-size="12">new se closed</text>
<line x1="130" y1="50" x2="165" y2="50" stroke="#64748b" stroke-width="2"/><line x1="305" y1="50" x2="340" y2="50" stroke="#64748b" stroke-width="2"/><line x1="470" y1="50" x2="505" y2="50" stroke="#64748b" stroke-width="2"/>
<text x="235" y="115" text-anchor="middle" class="svg-muted" font-size="12">banne ke baad ke logs hi dekhta hai</text>
<text x="567" y="115" text-anchor="middle" class="svg-muted" font-size="12">peeche nahi</text>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="13">Is order mein troubleshoot: logs, filter, threshold aur window, enabled, scope.</text>
</svg><p class="cap">Chain aur wo checks jo ab aap jaante ho.</p></div>

<h3>Checklist: kya aap ye kar sakte ho?</h3>
<ul>
<li>Do sentences mein log, event aur incident ka fark samjhana.</li>
<li>Handler ke parts batana: ADOM, device, log type, filter, threshold, window, severity, group-by.</li>
<li>Simulator form se handler banana aur list tatha configuration table se padhna.</li>
<li>Sliding window draw karna aur batana ki window se door ke logs saath kyun nahi gine jaate.</li>
<li>Filter likhne se pehle Log View mein field ki real value dhoondhna.</li>
<li>Events list padhna: ID, handler, device, group, logs, last log, status.</li>
<li>Samjhana ki traffic ke baad bana handler kuch raise kyun nahi karta.</li>
<li>Event se incident banana, notes ke saath aage badhana, aur dikhana ki wo peeche nahi ja sakta.</li>
<li>Paanch troubleshooting checks order mein lagana aur ek time par ek cheez badalna.</li>
<li>Batana ki kaun sa hissa real product mein GUI hai aur kaun sa sirf theory.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Event handler</dt><dd>FortiAnalyzer ka rule jo time window ke andar kaafi matching logs ko event mein badalta hai.</dd>
<dt>Threshold aur window</dt><dd>Logs ki sankhya aur minutes ki sankhya jisme wo aane chahiye.</dd>
<dt>Group-by</dt><dd>Ek field (jaise srcip) jiski har value ki apni ginti hoti hai.</dd>
<dt>Event</dt><dd>Poore hue handler ka result; unhandled se shuru hota hai.</dd>
<dt>Incident</dt><dd>Event ke liye khola gaya tracked case; statuses new, analysis, response, closed.</dd>
<dt>Severity</dt><dd>low, medium, high ya critical, handler set karta hai.</dd>
<dt>Unhandled</dt><dd>Us event ka status jiska abhi incident nahi hai.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Yaad rakho</th></tr>
<tr><td>Traffic log mein denied session</td><td>action=deny, blocked kabhi nahi</td></tr>
<tr><td>Threshold aur window</td><td>"3 in 5" matlab paanch minute mein teen logs</td></tr>
<tr><td>Event ke baad</td><td>Us group ki window khaali ho jaati hai</td></tr>
<tr><td>Handler kya dekhta hai</td><td>Sirf banne ke baad store hue logs</td></tr>
<tr><td>Disabled handler</td><td>Kuch raise nahi karta</td></tr>
<tr><td>Bina device ka handler</td><td>ADOM ke har device ko padhta hai</td></tr>
<tr><td>Incident path</td><td>new, analysis, response, closed; peeche nahi</td></tr>
<tr><td>Ek event</td><td>Sirf ek incident</td></tr>
</table>

<div class="warn"><p><b>Kya sirf theory hai.</b> Real product mein handlers, events aur incidents GUI objects hain; commands <code>execute fazui handler</code>, <code>execute fazui events</code> aur <code>execute fazui incident</code> tatha tables <code>config faz event-handler</code> aur <code>config faz incident</code> simulator stand-ins hain aur real FortiAnalyzer par nahi hote. Email ya syslog notifications, handler templates aur predefined handlers, assignment aur attachments, automation, FortiSOAR aur playbooks modelled nahi hain. Real log volumes simulator se kahin bade hote hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Sawal aksar chain ke steps mix kar dete hain. Handler events raise karta hai; incident insaan ya automation banata hai; report stored logs ka summary hai aur event nahi hai. Agar stem kahe "handler ne incident banaya", to simulator ke liye wo statement galat hai. Ye independent course central logging ke vendor administrator-level skills se overlap karta hai, par ye exam preparation nahi hai.</p></div>

<div class="eg"><p><b>Revision ka worked example.</b> Ticket kehta hai: "Madurai PC kai baar block hui, humne kuch nahi dekha." Aap PC ke liye Log View check karte ho: do minute mein paanch deny logs. Handler padhte ho: filter sahi, threshold 3, window 5, status disable. Wajah: handler disabled tha. Use enable karte ho, teen naye denied sessions generate karte ho aur event dekhte ho. Phir notes ke saath incident kholte ho. Paanch checks, ek fix.</p></div>

<div class="scn"><h4>Kaveri Retail ka monthly review</h4><p>Har mahine Kaveri ki SOC lead teen numbers review karti hai: raise hue events, incident wale events, aur note ke saath closed incidents. Pehle mahine 120 events aur 3 incidents the, yaani handlers noisy the ya list par koi kaam nahi kar raha tha. Team ne ek handler ka threshold 2 se 3 kiya, doosre par device naam diya, aur tay kiya ki har closed incident mein note zaroori hai. Agle mahine 40 events, 9 incidents aur 9 notes the.</p><p><b>Lesson:</b> handler kabhi poora nahi hota. Events aur incidents review karo, phir thresholds, scope aur severity tune karo.</p></div>

<div class="iv"><p class="q">"FortiAnalyzer par baar-baar denied access ko detect aur track kaise karoge, summary mein batao."</p><p>Log View mein real deny log padhta hoon, source se grouped action=deny par traffic handler banata hoon jiska threshold aur window normal se upar ho, traffic generate karke saabit karta hoon ki wo fire hota hai, phir event se incident raise karta hoon aur har step notes mein likhta hoon. Ye bhi bolta hoon ki handler banne ke baad ke logs hi dekhta hai aur notifications tatha playbooks real product mein theory ke taur par hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Logs evidence hain, events handlers ke alarms hain, incidents insaani cases hain.</li>
<li>Handler filters real log values se bante hain; Log View mein test karo.</li>
<li>Threshold aur window logs aur minutes hain; window slide karti hai aur event ke baad khaali hoti hai.</li>
<li>Incidents sirf aage badhte hain; notes audit trail hain.</li>
<li>Paanch checks ke fixed order mein troubleshoot karo, ek time par ek change.</li>
</ul></div>
`}};export{e as default};