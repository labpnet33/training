var e={id:`correlation`,h:{en:`Correlation policies, responses and remediation modules`,hi:`Correlation policies, responses aur remediation modules`},body:{en:`
<p>Every event the firewalls send — intrusion, malware, connection, discovery, user activity — lands in the Management Center. <b>Correlation</b> is the Management Center's "if this happens, then do that" engine. It is how a single intrusion event becomes an automatic e-mail, a syslog to the SOC, or a quarantine request to ISE.</p>

<h3>An analogy: the smoke detector wired to the sprinklers</h3>
<p>A smoke detector alone makes a noise. Wire it to the control panel and the panel can sound the alarm in every corridor, call the fire brigade and turn on the sprinklers in that one room. The detector is the event; the panel's wiring is the correlation rule; the alarm, the phone call and the sprinklers are the responses.</p>

<h3>The pieces</h3>
<dl class="terms">
<dt>Correlation rule</dt><dd>A condition on an event type. Examples: "an intrusion event occurs" and priority is 1; "a malware event occurs" with disposition Malware; "a discovery event occurs" — new host seen; "a connection event occurs" to a given country; "a traffic profile changes" (bandwidth spike above the learned baseline). Rules can also require host or user conditions, and have snooze and inactive periods.</dd>
<dt>Correlation policy</dt><dd>A set of rules, each with one or more <b>responses</b> attached, plus a priority. Only an <b>active</b> policy evaluates events.</dd>
<dt>Alert response</dt><dd>E-mail, SNMP trap or syslog. Configured under Policies → Actions → Alerts.</dd>
<dt>Remediation</dt><dd>An action against another system, provided by a <b>remediation module</b>. You create an <b>instance</b> of a module (with its connection details) and then one or more <b>remediations</b> inside it.</dd>
</dl>

<table class="cmp"><tr><th>Built-in remediation module</th><th>What it does</th></tr>
<tr><td><b>pxGrid Mitigation</b> (Cisco ISE)</td><td>Asks ISE, over pxGrid, to apply an ANC policy (such as quarantine) to the source or destination of the event</td></tr>
<tr><td>Cisco IOS Null Route</td><td>Logs into a router and adds a null route for the offending address</td></tr>
<tr><td>Nmap Remediation</td><td>Runs an active Nmap scan of the host to refresh the host profile</td></tr>
<tr><td>Set Attribute Value</td><td>Sets a host attribute in the network map (for example "Compromised = yes")</td></tr></table>
<p>Custom modules can also be uploaded, but the exam focus is pxGrid mitigation for Rapid Threat Containment.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Correlation flow">
<rect x="10" y="80" width="120" height="55" rx="8" fill="#fed7aa"/><text x="70" y="103" text-anchor="middle" class="svg-ink" font-size="13">Event</text><text x="70" y="121" text-anchor="middle" class="svg-muted" font-size="12">IPS pri 1</text>
<rect x="170" y="80" width="140" height="55" rx="8" fill="#ddd6fe"/><text x="240" y="103" text-anchor="middle" class="svg-ink" font-size="13">Correlation rule</text><text x="240" y="121" text-anchor="middle" class="svg-muted" font-size="12">priority is 1</text>
<rect x="350" y="80" width="130" height="55" rx="8" fill="#ddd6fe"/><text x="415" y="103" text-anchor="middle" class="svg-ink" font-size="13">Active policy</text><text x="415" y="121" text-anchor="middle" class="svg-muted" font-size="12">rule + responses</text>
<rect x="520" y="20" width="110" height="45" rx="8" fill="#fde68a"/><text x="575" y="47" text-anchor="middle" class="svg-ink" font-size="12">Alert: syslog</text>
<rect x="520" y="85" width="110" height="45" rx="8" fill="#bbf7d0"/><text x="575" y="112" text-anchor="middle" class="svg-ink" font-size="12">pxGrid ANC</text>
<rect x="520" y="150" width="110" height="45" rx="8" fill="#e2e8f0"/><text x="575" y="177" text-anchor="middle" class="svg-ink" font-size="12">Set attribute</text>
<line x1="130" y1="107" x2="170" y2="107" stroke="#64748b" stroke-width="2"/><line x1="310" y1="107" x2="350" y2="107" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="100" x2="520" y2="45" stroke="#64748b" stroke-width="2"/><line x1="480" y1="107" x2="520" y2="107" stroke="#64748b" stroke-width="2"/><line x1="480" y1="115" x2="520" y2="170" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">One event, one rule match, several responses at once.</p></div>

<h3>Building it</h3>
<pre class="code"><span class="c">! 1. Policies → Actions → Instances: add an instance of "pxGrid Mitigation"</span>
Instance     : ISE-ANC
<span class="c">! inside the instance, add a remediation</span>
Remediation  : Quarantine-Source
Type         : Mitigate Source
ANC policy   : Quarantine        <span class="c">! must exist in ISE with the same name</span>

<span class="c">! 2. Policies → Correlation → Rule Management → Create Rule</span>
Rule         : Contain-CnC
Event        : an intrusion event occurs
Condition    : Priority is 1

<span class="c">! 3. Policies → Correlation → Policy Management → Create Policy</span>
Policy       : NK-Containment
Rules        : Contain-CnC   →  responses: ISE-ANC/Quarantine-Source, SOC-Syslog
State        : Active       <span class="c">! no Deploy: correlation runs on the Management Center</span></pre>

<h3>What happens at run time</h3>
<p>Correlation runs <b>on the Management Center</b>, after the event has been received. That has two consequences. First, no Deploy is needed to activate or change a correlation policy. Second, the event must actually reach the Management Center: if the access rule does not log connections, a connection-based correlation rule can never fire; if the intrusion rule is disabled in the intrusion policy, there is no event to correlate. Results are visible under <b>Analysis → Correlation → Correlation Events</b> and the remediation outcome under <b>Analysis → Correlation → Status</b>.</p>
<pre class="out">Analysis &gt; Correlation &gt; Status
Time       Remediation                Policy          Rule         Result Message
11:20:14   ISE-ANC/Quarantine-Source  NK-Containment  Contain-CnC  <span class="hl">Successful completion of remediation</span></pre>

<div class="eg"><p><b>Worked example.</b> Rule "priority is 1" fires for the beacon event 1:58003 from 10.0.1.10. Responses attached: a syslog alert to siem.nwk.example (10.0.9.30) and the pxGrid remediation Quarantine-Source. Result: the SOC sees a correlation syslog within a second, and ISE receives "apply ANC Quarantine to the endpoint with IP 10.0.1.10". The same beacon a minute later fires the rule again, but the host is already quarantined — a snooze period on the rule avoids alert floods.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Building the rule and the policy but never ticking the policy Active. Choosing "Mitigate Destination" for an outbound beacon — that would try to quarantine the external server, not your laptop. An ANC policy name that does not exist in ISE. A rule so broad (all intrusion events) that a noisy false positive quarantines half the office.</p></div>

<div class="exam"><p><b>Exam trap.</b> Correlation responses are configured and evaluated on the Management Center, not on Threat Defense. Alerts (e-mail, SNMP, syslog) are not remediations; quarantine through ISE is a remediation via the pxGrid Mitigation module.</p></div>

<div class="scn"><h4>Quarantined the wrong side</h4><p>A university built a correlation rule for malware events with a pxGrid remediation. The first time it fired, nothing happened to the student laptop that downloaded the file; instead Analysis → Correlation → Status showed a failure for an external IP. The remediation type was Mitigate Destination, so the Management Center asked ISE to quarantine the download server — an address ISE had no session for. Changing it to Mitigate Source fixed it, and they limited the rule to disposition Malware to avoid false alarms on Unknown files.</p><p><b>Lesson:</b> think about direction. For a host that downloads or beacons out, the bad endpoint inside your network is the <b>source</b> (initiator).</p></div>

<div class="iv"><p class="q">"What is the difference between an alert and a remediation in a correlation policy?"</p><p>Strong answer: both are responses the Management Center runs when a correlation rule matches. Alerts notify — e-mail, SNMP trap or syslog. Remediations act on another system through a remediation module instance, for example pxGrid Mitigation asking ISE to apply an ANC policy, or a null route on an IOS router. Mention that correlation needs no Deploy, the policy must be active, and the event must be logged to the Management Center.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Correlation = rules on events + responses, grouped in an active policy on the Management Center.</li>
<li>Responses are alerts (e-mail, SNMP, syslog) or remediations (module instances).</li>
<li>pxGrid Mitigation asks ISE to apply an ANC policy to the source or destination.</li>
<li>No Deploy is needed, but the event must reach the Management Center.</li>
<li>Check results in Analysis → Correlation → Correlation Events and Status.</li>
</ul></div>
`,hi:`
<p>Firewalls jo bhi event bhejte hain — intrusion, malware, connection, discovery, user activity — woh Management Center mein pahunchta hai. <b>Correlation</b> Management Center ka "agar yeh ho, to woh karo" engine hai. Isi se ek single intrusion event automatic e-mail, SOC ko syslog, ya ISE ko quarantine request ban jaata hai.</p>

<h3>Ek analogy: sprinklers se juda smoke detector</h3>
<p>Akela smoke detector sirf awaaz karta hai. Use control panel se jodo aur panel har corridor mein alarm baja sakta hai, fire brigade ko call kar sakta hai aur sirf us ek room ke sprinklers chalu kar sakta hai. Detector event hai; panel ki wiring correlation rule hai; alarm, phone call aur sprinklers responses hain.</p>

<h3>Hisse</h3>
<dl class="terms">
<dt>Correlation rule</dt><dd>Ek event type par condition. Examples: "an intrusion event occurs" aur priority 1 hai; "a malware event occurs" disposition Malware ke saath; "a discovery event occurs" — naya host dikha; "a connection event occurs" kisi diye gaye country tak; "a traffic profile changes" (learned baseline se upar bandwidth spike). Rules host ya user conditions bhi maang sakti hain, aur unke snooze aur inactive periods hote hain.</dd>
<dt>Correlation policy</dt><dd>Rules ka set, har rule ke saath ek ya zyada <b>responses</b> jude, plus ek priority. Sirf <b>active</b> policy events evaluate karti hai.</dd>
<dt>Alert response</dt><dd>E-mail, SNMP trap ya syslog. Policies → Actions → Alerts ke neeche configure hota hai.</dd>
<dt>Remediation</dt><dd>Kisi doosre system ke against action, jo ek <b>remediation module</b> deta hai. Aap module ka ek <b>instance</b> banate ho (uski connection details ke saath) aur phir uske andar ek ya zyada <b>remediations</b>.</dd>
</dl>

<table class="cmp"><tr><th>Built-in remediation module</th><th>Kya karta hai</th></tr>
<tr><td><b>pxGrid Mitigation</b> (Cisco ISE)</td><td>pxGrid par ISE se event ke source ya destination par ANC policy (jaise quarantine) lagane ko kehta hai</td></tr>
<tr><td>Cisco IOS Null Route</td><td>Router mein login karke offending address ke liye null route jodta hai</td></tr>
<tr><td>Nmap Remediation</td><td>Host profile refresh karne ke liye host ka active Nmap scan chalata hai</td></tr>
<tr><td>Set Attribute Value</td><td>Network map mein host attribute set karta hai (jaise "Compromised = yes")</td></tr></table>
<p>Custom modules bhi upload kiye ja sakte hain, lekin exam ka focus Rapid Threat Containment ke liye pxGrid mitigation hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Correlation flow">
<rect x="10" y="80" width="120" height="55" rx="8" fill="#fed7aa"/><text x="70" y="103" text-anchor="middle" class="svg-ink" font-size="13">Event</text><text x="70" y="121" text-anchor="middle" class="svg-muted" font-size="12">IPS pri 1</text>
<rect x="170" y="80" width="140" height="55" rx="8" fill="#ddd6fe"/><text x="240" y="103" text-anchor="middle" class="svg-ink" font-size="13">Correlation rule</text><text x="240" y="121" text-anchor="middle" class="svg-muted" font-size="12">priority 1 hai</text>
<rect x="350" y="80" width="130" height="55" rx="8" fill="#ddd6fe"/><text x="415" y="103" text-anchor="middle" class="svg-ink" font-size="13">Active policy</text><text x="415" y="121" text-anchor="middle" class="svg-muted" font-size="12">rule + responses</text>
<rect x="520" y="20" width="110" height="45" rx="8" fill="#fde68a"/><text x="575" y="47" text-anchor="middle" class="svg-ink" font-size="12">Alert: syslog</text>
<rect x="520" y="85" width="110" height="45" rx="8" fill="#bbf7d0"/><text x="575" y="112" text-anchor="middle" class="svg-ink" font-size="12">pxGrid ANC</text>
<rect x="520" y="150" width="110" height="45" rx="8" fill="#e2e8f0"/><text x="575" y="177" text-anchor="middle" class="svg-ink" font-size="12">Set attribute</text>
<line x1="130" y1="107" x2="170" y2="107" stroke="#64748b" stroke-width="2"/><line x1="310" y1="107" x2="350" y2="107" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="100" x2="520" y2="45" stroke="#64748b" stroke-width="2"/><line x1="480" y1="107" x2="520" y2="107" stroke="#64748b" stroke-width="2"/><line x1="480" y1="115" x2="520" y2="170" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek event, ek rule match, ek saath kai responses.</p></div>

<h3>Ise banana</h3>
<pre class="code"><span class="c">! 1. Policies → Actions → Instances: "pxGrid Mitigation" ka instance jodo</span>
Instance     : ISE-ANC
<span class="c">! instance ke andar ek remediation jodo</span>
Remediation  : Quarantine-Source
Type         : Mitigate Source
ANC policy   : Quarantine        <span class="c">! ISE mein isi naam se exist karni chahiye</span>

<span class="c">! 2. Policies → Correlation → Rule Management → Create Rule</span>
Rule         : Contain-CnC
Event        : an intrusion event occurs
Condition    : Priority is 1

<span class="c">! 3. Policies → Correlation → Policy Management → Create Policy</span>
Policy       : NK-Containment
Rules        : Contain-CnC   →  responses: ISE-ANC/Quarantine-Source, SOC-Syslog
State        : Active       <span class="c">! Deploy nahi: correlation Management Center par chalta hai</span></pre>

<h3>Run time par kya hota hai</h3>
<p>Correlation <b>Management Center par</b> chalta hai, event receive hone ke baad. Iske do nateeje hain. Pehla, correlation policy activate ya change karne ke liye Deploy nahi chahiye. Doosra, event ka Management Center tak sach mein pahunchna zaroori hai: agar access rule connections log nahi karti, to connection-based correlation rule kabhi fire nahi ho sakti; agar intrusion policy mein intrusion rule disabled hai, to correlate karne ke liye koi event hi nahi. Results <b>Analysis → Correlation → Correlation Events</b> mein aur remediation ka nateeja <b>Analysis → Correlation → Status</b> mein dikhta hai.</p>
<pre class="out">Analysis &gt; Correlation &gt; Status
Time       Remediation                Policy          Rule         Result Message
11:20:14   ISE-ANC/Quarantine-Source  NK-Containment  Contain-CnC  <span class="hl">Successful completion of remediation</span></pre>

<div class="eg"><p><b>Worked example.</b> Rule "priority is 1" 10.0.1.10 ke beacon event 1:58003 ke liye fire hoti hai. Jude responses: siem.nwk.example (10.0.9.30) ko syslog alert aur pxGrid remediation Quarantine-Source. Nateeja: SOC ko ek second mein correlation syslog dikhta hai, aur ISE ko milta hai "IP 10.0.1.10 wale endpoint par ANC Quarantine lagao". Ek minute baad wahi beacon rule ko phir fire karta hai, lekin host pehle se quarantine hai — rule par snooze period alert floods se bachata hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Rule aur policy bana dena lekin policy ko kabhi Active tick na karna. Outbound beacon ke liye "Mitigate Destination" chunna — woh aapke laptop ki jagah external server ko quarantine karne ki koshish karega. Aisa ANC policy naam jo ISE mein exist nahi karta. Itni broad rule (saare intrusion events) ki ek noisy false positive aadha office quarantine kar de.</p></div>

<div class="exam"><p><b>Exam trap.</b> Correlation responses Management Center par configure aur evaluate hote hain, Threat Defense par nahi. Alerts (e-mail, SNMP, syslog) remediations nahi hain; ISE ke through quarantine pxGrid Mitigation module se ek remediation hai.</p></div>

<div class="scn"><h4>Galat side quarantine ho gayi</h4><p>Ek university ne malware events ke liye pxGrid remediation wali correlation rule banayi. Pehli baar fire hone par file download karne wale student laptop ko kuch nahi hua; balki Analysis → Correlation → Status ne ek external IP ke liye failure dikhaya. Remediation type Mitigate Destination tha, isliye Management Center ne ISE se download server ko quarantine karne ko kaha — ek aisa address jiska ISE ke paas koi session nahi tha. Ise Mitigate Source karne se theek ho gaya, aur unhone Unknown files par false alarms se bachne ke liye rule ko disposition Malware tak limit kiya.</p><p><b>Seekh:</b> direction ke baare mein socho. Jo host bahar download ya beacon karta hai, aapke network ke andar ka woh bura endpoint <b>source</b> (initiator) hai.</p></div>

<div class="iv"><p class="q">"Correlation policy mein alert aur remediation mein kya farak hai?"</p><p>Strong answer: dono responses hain jo Management Center tab chalata hai jab correlation rule match hoti hai. Alerts notify karte hain — e-mail, SNMP trap ya syslog. Remediations ek remediation module instance ke through doosre system par action lete hain, jaise pxGrid Mitigation ISE se ANC policy lagane ko kehta hai, ya IOS router par null route. Batao ki correlation ko Deploy nahi chahiye, policy active honi chahiye, aur event Management Center tak log hona chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Correlation = events par rules + responses, Management Center par ek active policy mein grouped.</li>
<li>Responses alerts (e-mail, SNMP, syslog) ya remediations (module instances) hote hain.</li>
<li>pxGrid Mitigation ISE se source ya destination par ANC policy lagane ko kehta hai.</li>
<li>Deploy nahi chahiye, lekin event Management Center tak pahunchna chahiye.</li>
<li>Results Analysis → Correlation → Correlation Events aur Status mein check karo.</li>
</ul></div>
`}};export{e as default};