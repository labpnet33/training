var e={id:`summary-and-exam-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The operations story in one page</h3>
<p>Operating a cloud-managed network is a loop. <b>Watch</b> the Overview and alerts. <b>Triage</b> by impact, urgency and root cause. <b>Investigate</b> the change log in a time window to see who changed what. <b>Prove</b> the path with ping and traceroute from the device. <b>Locate</b> the failing layer: client, port or AP, switch, MX, uplink, VPN, cloud. <b>Fix</b> one thing, <b>retest</b> end to end and <b>record</b> it. Monitoring reads, tests send harmless packets, and only the fix changes the network.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Operations loop">
<rect x="10" y="30" width="95" height="50" rx="8" fill="#bae6fd"/><text x="57" y="60" text-anchor="middle" class="svg-ink" font-size="13">Watch</text>
<rect x="120" y="30" width="95" height="50" rx="8" fill="#bbf7d0"/><text x="167" y="60" text-anchor="middle" class="svg-ink" font-size="13">Triage</text>
<rect x="230" y="30" width="95" height="50" rx="8" fill="#ddd6fe"/><text x="277" y="60" text-anchor="middle" class="svg-ink" font-size="13">Change log</text>
<rect x="340" y="30" width="95" height="50" rx="8" fill="#fde68a"/><text x="387" y="60" text-anchor="middle" class="svg-ink" font-size="13">Live tools</text>
<rect x="450" y="30" width="80" height="50" rx="8" fill="#fed7aa"/><text x="490" y="60" text-anchor="middle" class="svg-ink" font-size="13">Fix</text>
<rect x="545" y="30" width="85" height="50" rx="8" fill="#fecaca"/><text x="587" y="60" text-anchor="middle" class="svg-ink" font-size="13">Retest</text>
<line x1="105" y1="55" x2="120" y2="55" stroke="#64748b" stroke-width="2"/><line x1="215" y1="55" x2="230" y2="55" stroke="#64748b" stroke-width="2"/><line x1="325" y1="55" x2="340" y2="55" stroke="#64748b" stroke-width="2"/><line x1="435" y1="55" x2="450" y2="55" stroke="#64748b" stroke-width="2"/><line x1="530" y1="55" x2="545" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="110" width="620" height="45" rx="8" fill="#e2e8f0"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="13">Record cause, fix and time in the ticket</text>
<rect x="10" y="165" width="620" height="35" rx="8" fill="#bbf7d0"/><text x="320" y="188" text-anchor="middle" class="svg-ink" font-size="13">Loop back to Watch: confirm alerts clear</text>
</svg><p class="cap">The operations loop.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Read the Overview and find which network and which devices need attention.</li>
<li>Name the seven alert types and give a first check for each.</li>
<li>Triage a wall of alerts by impact, urgency and root cause.</li>
<li>Explain the difference between derived events and the change log.</li>
<li>Find what changed in a time window and match it to a symptom.</li>
<li>Run ping and traceroute from a device and read replies, loss, hops and timeouts.</li>
<li>Tell a down tunnel, a firewall deny and an uplink fault apart using tests.</li>
<li>Apply the seven-layer method to a ticket and bisect when useful.</li>
<li>Write a ticket note with symptom, cause, fix and time.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Alert</dt><dd>A derived warning that something needs attention.</dd>
<dt>Triage</dt><dd>Deciding what to handle first by impact, urgency and cause.</dd>
<dt>Severity</dt><dd>How serious an alert is: critical, warning, info.</dd>
<dt>Event log</dt><dd>Time-ordered list of derived events and changes.</dd>
<dt>Change log / audit</dt><dd>Record of who changed which setting, when, old and new value.</dd>
<dt>Ping</dt><dd>ICMP echo test for reachability, round-trip time and loss.</dd>
<dt>Traceroute</dt><dd>Hop by hop path display using a rising TTL.</dd>
<dt>Hop</dt><dd>One router on the path.</dd>
<dt>TTL</dt><dd>Time to live; counter each router lowers by one.</dd>
<dt>Root cause</dt><dd>The one fault behind many symptoms.</dd>
<dt>Bisect</dt><dd>Test the middle of the path first, then move toward the break.</dd>
<dt>Rollback</dt><dd>Restoring the previous value of a changed setting.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Alert types</td><td>Device offline, tunnel down, uplink down or failover, DHCP pool exhausted, STP root change, native VLAN mismatch, licence</td></tr>
<tr><td>Many devices offline at one site</td><td>Look upstream: uplink, MX, management VLAN 99</td></tr>
<tr><td>Who changed it</td><td>Change log (audit); derived events show effects</td></tr>
<tr><td>Ping works to 8.8.8.8 but not to the far site</td><td>VPN or far side, not the uplink</td></tr>
<tr><td>Traceroute stops after the ISP hop</td><td>Beyond the ISP: tunnel or remote side</td></tr>
<tr><td>No ping reply</td><td>A clue only; ICMP may be blocked</td></tr>
<tr><td>Layers</td><td>Client, port or AP, switch, MX, uplink, VPN, cloud</td></tr>
<tr><td>After a fix</td><td>Retest end to end</td></tr></table>

<div class="note"><p><b>What does this change on the wire/policy?</b> Revision only. In the labs say each time whether you are reading, testing or changing, and what the change does.</p></div>
<div class="exam"><p><b>Exam trap.</b> Keep tools apart: alerts and events say what the dashboard sees, live tools prove what a device sees, and the change log says who changed what.</p></div>

<div class="scn"><h4>A calm Monday</h4><p>The new on-call engineer opened the Overview and saw Delhi with a tunnel down alert. He checked the change log: a VPN subnet had been disabled on Sunday. He pinged from MX-DEL to the hub: loss. He re-enabled the subnet, saved, pinged again: 38 ms, alerts cleared. Total time: eight minutes, with a clear ticket note.</p><p><b>Lesson:</b> watch, find the change, prove with a test, fix, retest, record.</p></div>

<div class="iv"><p class="q">"Describe your standard approach to a network incident."</p><p>Strong answer: check scope and alerts, triage by impact and root cause, review the change log in a time window, use live tools to find the failing layer, fix one thing, retest end to end, document and, if needed, suggest a preventive step such as change review.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Operations is a loop: watch, triage, investigate, prove, fix, retest, record.</li>
<li>Change log tells who changed what; events tell what the network is doing.</li>
<li>Live tools give proof from the device; no reply is only a clue.</li>
<li>Locate the failing layer before changing anything.</li>
<li>Always retest end to end and keep notes.</li>
</ul></div>
`,hi:`
<h3>Operations ki kahani ek page mein</h3>
<p>Cloud-managed network operate karna ek loop hai. Overview aur alerts <b>dekho</b>. Impact, urgency aur root cause se <b>triage</b> karo. Time window mein change log <b>investigate</b> karo ki kisne kya badla. Device se ping aur traceroute se path <b>prove</b> karo. Failing layer <b>locate</b> karo: client, port ya AP, switch, MX, uplink, VPN, cloud. Ek cheez <b>fix</b> karo, end to end <b>retest</b> karo aur <b>record</b> karo. Monitoring padhti hai, tests harmless packets bhejte hain, aur sirf fix network ko badalta hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Operations loop">
<rect x="10" y="30" width="95" height="50" rx="8" fill="#bae6fd"/><text x="57" y="60" text-anchor="middle" class="svg-ink" font-size="13">Watch</text>
<rect x="120" y="30" width="95" height="50" rx="8" fill="#bbf7d0"/><text x="167" y="60" text-anchor="middle" class="svg-ink" font-size="13">Triage</text>
<rect x="230" y="30" width="95" height="50" rx="8" fill="#ddd6fe"/><text x="277" y="60" text-anchor="middle" class="svg-ink" font-size="13">Change log</text>
<rect x="340" y="30" width="95" height="50" rx="8" fill="#fde68a"/><text x="387" y="60" text-anchor="middle" class="svg-ink" font-size="13">Live tools</text>
<rect x="450" y="30" width="80" height="50" rx="8" fill="#fed7aa"/><text x="490" y="60" text-anchor="middle" class="svg-ink" font-size="13">Fix</text>
<rect x="545" y="30" width="85" height="50" rx="8" fill="#fecaca"/><text x="587" y="60" text-anchor="middle" class="svg-ink" font-size="13">Retest</text>
<line x1="105" y1="55" x2="120" y2="55" stroke="#64748b" stroke-width="2"/><line x1="215" y1="55" x2="230" y2="55" stroke="#64748b" stroke-width="2"/><line x1="325" y1="55" x2="340" y2="55" stroke="#64748b" stroke-width="2"/><line x1="435" y1="55" x2="450" y2="55" stroke="#64748b" stroke-width="2"/><line x1="530" y1="55" x2="545" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="110" width="620" height="45" rx="8" fill="#e2e8f0"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="13">Ticket mein cause, fix aur time record karo</text>
<rect x="10" y="165" width="620" height="35" rx="8" fill="#bbf7d0"/><text x="320" y="188" text-anchor="middle" class="svg-ink" font-size="13">Watch par wapas: confirm karo alerts clear hue</text>
</svg><p class="cap">Operations loop.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Overview padhna aur dhoondhna ki kaun se network aur devices par dhyan chahiye.</li>
<li>Saat alert types ke naam batana aur har ek ka pehla check batana.</li>
<li>Alerts ki deewar ko impact, urgency aur root cause se triage karna.</li>
<li>Derived events aur change log ka fark samjhana.</li>
<li>Time window mein dhoondhna ki kya badla aur use symptom se match karna.</li>
<li>Device se ping aur traceroute chalana aur replies, loss, hops aur timeouts padhna.</li>
<li>Tests se down tunnel, firewall deny aur uplink fault ko alag karna.</li>
<li>Ticket par saat-layer method lagana aur kaam aaye to bisect karna.</li>
<li>Symptom, cause, fix aur time ke saath ticket note likhna.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Alert</dt><dd>Derived warning ki kisi cheez par dhyan chahiye.</dd>
<dt>Triage</dt><dd>Impact, urgency aur cause se decide karna ki pehle kya sambhalna hai.</dd>
<dt>Severity</dt><dd>Alert kitna serious hai: critical, warning, info.</dd>
<dt>Event log</dt><dd>Derived events aur changes ki time-ordered list.</dd>
<dt>Change log / audit</dt><dd>Record ki kisne kaun si setting kab badli, purani aur nayi value.</dd>
<dt>Ping</dt><dd>Reachability, round-trip time aur loss ke liye ICMP echo test.</dd>
<dt>Traceroute</dt><dd>Badhte TTL se hop by hop path display.</dd>
<dt>Hop</dt><dd>Path par ek router.</dd>
<dt>TTL</dt><dd>Time to live; counter jo har router ek se kam karta hai.</dd>
<dt>Root cause</dt><dd>Kai symptoms ke peeche ek fault.</dd>
<dt>Bisect</dt><dd>Path ke beech ka pehle test karo, phir toot ki taraf jao.</dd>
<dt>Rollback</dt><dd>Badli hui setting ki pichhli value restore karna.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Alert types</td><td>Device offline, tunnel down, uplink down ya failover, DHCP pool exhausted, STP root change, native VLAN mismatch, licence</td></tr>
<tr><td>Ek site par kai devices offline</td><td>Upstream dekho: uplink, MX, management VLAN 99</td></tr>
<tr><td>Kisne badla</td><td>Change log (audit); derived events asar dikhate hain</td></tr>
<tr><td>8.8.8.8 ko ping chalta hai lekin far site ko nahi</td><td>VPN ya far side, uplink nahi</td></tr>
<tr><td>Traceroute ISP hop ke baad ruk jaata hai</td><td>ISP ke aage: tunnel ya remote side</td></tr>
<tr><td>Ping reply nahi</td><td>Sirf clue; ICMP block ho sakta hai</td></tr>
<tr><td>Layers</td><td>Client, port ya AP, switch, MX, uplink, VPN, cloud</td></tr>
<tr><td>Fix ke baad</td><td>End to end retest</td></tr></table>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Sirf revision. Labs mein har baar bolo ki aap padh rahe ho, test kar rahe ho ya badal rahe ho, aur change kya karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Tools ko alag rakho: alerts aur events batate hain dashboard kya dekhta hai, live tools prove karte hain device kya dekhta hai, aur change log batata hai kisne kya badla.</p></div>

<div class="scn"><h4>Shaant Monday</h4><p>Naye on-call engineer ne Overview kholi aur Delhi mein tunnel down alert dekha. Usne change log check kiya: Sunday ko ek VPN subnet disable hua tha. Usne MX-DEL se hub tak ping kiya: loss. Usne subnet dobara enable kiya, save kiya, phir ping kiya: 38 ms, alerts clear. Kul time: aath minute, saaf ticket note ke saath.</p><p><b>Seekh:</b> dekho, change dhoondho, test se prove karo, fix karo, retest karo, record karo.</p></div>

<div class="iv"><p class="q">"Network incident ke liye apna standard approach batao."</p><p>Strong answer: scope aur alerts check karo, impact aur root cause se triage karo, time window mein change log dekho, live tools se failing layer dhoondho, ek cheez fix karo, end to end retest karo, document karo aur zaroorat ho to change review jaisa preventive step suggest karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Operations ek loop hai: watch, triage, investigate, prove, fix, retest, record.</li>
<li>Change log batata hai kisne kya badla; events batate hain network kya kar raha hai.</li>
<li>Live tools device se saboot dete hain; reply nahi aana sirf clue hai.</li>
<li>Kuch badalne se pehle failing layer locate karo.</li>
<li>Hamesha end to end retest karo aur notes rakho.</li>
</ul></div>
`}};export{e as default};