var e={id:`event-and-change-log`,h:{en:`Event log and change log: who changed what, and when`,hi:`Event log aur change log: kisne kya badla, aur kab`},body:{en:`
<h3>Two kinds of lines in one log</h3>
<p>The <b>Alerts and events</b> page holds an <b>event log</b>: a time-ordered list of things that happened. Two kinds of lines mix in it. <b>Derived events</b> are worked out by the dashboard from the network state, such as "uplink wan1 down" or "DHCP pool exhausted on VLAN 30". The <b>change log</b> (also called the <b>audit</b> trail) records <b>human actions</b>: which admin changed which setting, on which network, at what time, with the old and new values. Together they answer the two questions every outage review asks: <i>what broke</i> and <i>who or what changed just before</i>?</p>

<h3>Why the change log matters</h3>
<p>Most network outages are caused by a change, not by hardware. A rule moved, a VLAN removed from a trunk, an SSID hidden, a subnet disabled for VPN. If you can see that something changed 12 minutes before the first complaint, your search is short. The change log also gives accountability (it names the admin), supports rollback (you know the old value), and is evidence for audits.</p>
<p>Each audit line normally contains: <b>time</b>, <b>admin</b> (name or email), <b>network</b>, <b>page</b> or setting, and a <b>before and after</b> value. In this simulator the log lines come from the changes you save with <b>Save changes</b> (or from API calls, which apply immediately).</p>

<pre class="out">Alerts and events  (network: Bengaluru Branch)
Time   Type    Who          Page               Detail
10:41  change  priya@br.example   Switch ports     port 1 native VLAN 99 -> <span class="hl">1</span>
10:42  event   -            Switch ports       native VLAN mismatch on SW-BLR uplink
10:43  event   -            Devices            SW-BLR offline
10:43  event   -            Devices            AP-BLR offline
10:44  alert   -            Overview           3 devices offline</pre>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Timeline of a change and its outage">
<line x1="30" y1="90" x2="610" y2="90" stroke="#64748b" stroke-width="3"/>
<circle cx="100" cy="90" r="9" fill="#fde68a"/><circle cx="260" cy="90" r="9" fill="#fed7aa"/><circle cx="400" cy="90" r="9" fill="#fecaca"/><circle cx="540" cy="90" r="9" fill="#bbf7d0"/>
<text x="100" y="60" text-anchor="middle" class="svg-ink" font-size="13">10:41 change</text><text x="100" y="125" text-anchor="middle" class="svg-muted" font-size="12">native VLAN edited</text>
<text x="260" y="60" text-anchor="middle" class="svg-ink" font-size="13">10:42 event</text><text x="260" y="125" text-anchor="middle" class="svg-muted" font-size="12">mismatch derived</text>
<text x="400" y="60" text-anchor="middle" class="svg-ink" font-size="13">10:43 outage</text><text x="400" y="125" text-anchor="middle" class="svg-muted" font-size="12">switch, AP offline</text>
<text x="540" y="60" text-anchor="middle" class="svg-ink" font-size="13">11:05 fixed</text><text x="540" y="125" text-anchor="middle" class="svg-muted" font-size="12">value restored</text>
<rect x="30" y="160" width="580" height="45" rx="6" fill="#bae6fd"/><text x="320" y="188" text-anchor="middle" class="svg-ink" font-size="13">Correlate: the change comes just BEFORE the first symptom</text>
</svg><p class="cap">A change line followed within minutes by events and an outage is the best lead.</p></div>

<h3>A repeatable way to find what changed</h3>
<ol>
<li><b>Fix the time window.</b> When did the first user complain, and when did the first alert fire? Start 30 to 60 minutes before.</li>
<li><b>Filter by network.</b> Select the network that is affected, not the whole organization.</li>
<li><b>Look for human changes first.</b> Scan the change lines in the window. Note admin, page and old and new values.</li>
<li><b>Match change to symptom.</b> Does the page make sense for the symptom? A change on Switch ports fits "switch offline". A change on Firewall fits "cannot reach the server". A change on SSIDs fits "SSID missing".</li>
<li><b>Look at derived events.</b> They show the effect and prove the link: "native VLAN mismatch" right after a native VLAN edit.</li>
<li><b>Decide: roll back or fix forward.</b> Restoring the old value is the fastest safe fix if the change was wrong. Then tell the admin and record why.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Delhi staff cannot open intranet.example (10.1.20.10) from 14:10. The Delhi log shows at 14:07 an edit on Firewall by an admin: rule 1 changed from "Allow Staff to 10.1.20.0/24" to Deny. At 14:08 a derived event is not needed because this is policy. The engineer opens the Firewall page: rule 1 now has rising hit counts. He restores the allow rule, saves and confirms with a new connection. Cause found in two minutes because the change line was just before the symptom.</p></div>

<h3>Correlation is not proof</h3>
<p>A change near the symptom is a strong clue, not a verdict. Check that the change really explains the effect: read the old and new value, look at the page, and test. Sometimes two things happened (a change and an ISP fault). In that case the derived events help: an uplink-down event with no matching change points to the circuit.</p>

<table class="cmp"><tr><th>Evidence</th><th>Source</th><th>Question it answers</th></tr>
<tr><td>Change log line</td><td>Audit (human)</td><td>Who changed what, when</td></tr>
<tr><td>Derived event</td><td>Network state</td><td>What the network is doing now</td></tr>
<tr><td>Alert</td><td>Derived</td><td>What needs attention</td></tr>
<tr><td>Hit counter</td><td>Firewall</td><td>Which rule decided the traffic</td></tr></table>

<div class="note"><p><b>What does this change on the wire/policy?</b> Reading logs changes nothing. Rolling back a change restores the old value: a native VLAN, a rule order, an SSID flag. Every rollback is itself a new line in the change log, so the history stays complete.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Reading the whole day instead of a time window; ignoring who made the change; fixing forward without noting the old value; blaming hardware before checking the log; forgetting that API calls are also changes.</p></div>
<div class="exam"><p><b>Exam trap.</b> The change log is not the same as the derived events. If the question asks "who", the answer comes from the change log; if it asks "what is the network doing", it comes from events and alerts.</p></div>

<div class="scn"><h4>The Friday hidden SSID</h4><p>On Friday evening the Mumbai store lost the staff Wi-Fi. The log showed a change at 17:52 by an admin on SSIDs: broadcast changed from yes to no, during a "hide the network" experiment. The admin had gone home. The on-call engineer switched Broadcast back on, saved, and noted the reason in the ticket.</p><p><b>Lesson:</b> the change log gives you the answer without calling anyone, and shows exactly how to roll back.</p></div>

<div class="iv"><p class="q">"Users report an outage. How do you find out if a change caused it?"</p><p>Strong answer: define the time window, open the change log for the affected network, list changes just before the first symptom, match page and symptom, confirm with derived events and the page itself, then roll back or fix and record it. Mention that API changes appear too.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The event log mixes human changes (audit) and derived events.</li>
<li>Most outages follow a change; the change log names who, what, when, before and after.</li>
<li>Use a time window, filter the network, find changes, match to the symptom.</li>
<li>Derived events confirm the effect; correlation is a clue, not proof.</li>
<li>Rollbacks are logged too, and API calls are changes as well.</li>
</ul></div>
`,hi:`
<h3>Ek log mein do tarah ki lines</h3>
<p><b>Alerts and events</b> page par ek <b>event log</b> hota hai: jo hua uski time-ordered list. Isme do tarah ki lines milti hain. <b>Derived events</b> dashboard network state se nikalta hai, jaise "uplink wan1 down" ya "VLAN 30 par DHCP pool exhausted". <b>Change log</b> (jise <b>audit</b> trail bhi kehte hain) <b>insaani actions</b> record karta hai: kis admin ne kaun si setting, kis network par, kis time badli, purani aur nayi value ke saath. Dono milkar un do sawalon ka jawab dete hain jo har outage review poochta hai: <i>kya toota</i> aur <i>theek pehle kisne ya kisne kya badla</i>?</p>

<h3>Change log kyun zaroori hai</h3>
<p>Zyadatar network outages change se hote hain, hardware se nahi. Ek rule move hua, trunk se VLAN hata, SSID hide hua, VPN ke liye subnet disable hua. Agar aap dekh sakte ho ki pehli complaint se 12 minute pehle kuch badla, to aapki khoj chhoti ho jaati hai. Change log accountability bhi deta hai (admin ka naam), rollback support karta hai (purani value pata hoti hai), aur audits ke liye saboot hai.</p>
<p>Har audit line mein aam taur par hota hai: <b>time</b>, <b>admin</b> (naam ya email), <b>network</b>, <b>page</b> ya setting, aur <b>before aur after</b> value. Is simulator mein log lines un changes se aati hain jo aap <b>Save changes</b> se save karte ho (ya API calls se, jo turant apply hoti hain).</p>

<pre class="out">Alerts and events  (network: Bengaluru Branch)
Time   Type    Who          Page               Detail
10:41  change  priya@br.example   Switch ports     port 1 native VLAN 99 -> <span class="hl">1</span>
10:42  event   -            Switch ports       native VLAN mismatch on SW-BLR uplink
10:43  event   -            Devices            SW-BLR offline
10:43  event   -            Devices            AP-BLR offline
10:44  alert   -            Overview           3 devices offline</pre>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Change aur uske outage ki timeline">
<line x1="30" y1="90" x2="610" y2="90" stroke="#64748b" stroke-width="3"/>
<circle cx="100" cy="90" r="9" fill="#fde68a"/><circle cx="260" cy="90" r="9" fill="#fed7aa"/><circle cx="400" cy="90" r="9" fill="#fecaca"/><circle cx="540" cy="90" r="9" fill="#bbf7d0"/>
<text x="100" y="60" text-anchor="middle" class="svg-ink" font-size="13">10:41 change</text><text x="100" y="125" text-anchor="middle" class="svg-muted" font-size="12">native VLAN edit hua</text>
<text x="260" y="60" text-anchor="middle" class="svg-ink" font-size="13">10:42 event</text><text x="260" y="125" text-anchor="middle" class="svg-muted" font-size="12">mismatch derived</text>
<text x="400" y="60" text-anchor="middle" class="svg-ink" font-size="13">10:43 outage</text><text x="400" y="125" text-anchor="middle" class="svg-muted" font-size="12">switch, AP offline</text>
<text x="540" y="60" text-anchor="middle" class="svg-ink" font-size="13">11:05 fixed</text><text x="540" y="125" text-anchor="middle" class="svg-muted" font-size="12">value restore hui</text>
<rect x="30" y="160" width="580" height="45" rx="6" fill="#bae6fd"/><text x="320" y="188" text-anchor="middle" class="svg-ink" font-size="13">Correlate: change pehli symptom se THEEK PEHLE aata hai</text>
</svg><p class="cap">Change line ke kuch minute baad events aur outage aaye to yeh sabse achhi lead hai.</p></div>

<h3>Kya badla yeh dhoondhne ka repeatable tareeka</h3>
<ol>
<li><b>Time window tay karo.</b> Pehle user ne kab complaint ki, aur pehla alert kab fire hua? 30 se 60 minute pehle se shuru karo.</li>
<li><b>Network filter karo.</b> Affected network chuno, poora organization nahi.</li>
<li><b>Pehle insaani changes dekho.</b> Window mein change lines scan karo. Admin, page aur purani-nayi values note karo.</li>
<li><b>Change ko symptom se match karo.</b> Kya page symptom se mel khata hai? Switch ports par change "switch offline" se fit hota hai. Firewall par change "server tak nahi pahunch pa raha" se. SSIDs par change "SSID missing" se.</li>
<li><b>Derived events dekho.</b> Yeh asar dikhate hain aur link prove karte hain: native VLAN edit ke theek baad "native VLAN mismatch".</li>
<li><b>Decide karo: rollback ya fix forward.</b> Agar change galat tha to purani value restore karna sabse tez safe fix hai. Phir admin ko batao aur wajah record karo.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Delhi staff 14:10 se intranet.example (10.1.20.10) nahi khol pa raha. Delhi log mein 14:07 par Firewall par ek admin ka edit dikhta hai: rule 1 "Allow Staff to 10.1.20.0/24" se Deny ho gaya. Yahan derived event ki zaroorat nahi kyunki yeh policy hai. Engineer Firewall page kholta hai: rule 1 ke hit counts badh rahe hain. Woh allow rule restore karta hai, save karta hai aur nayi connection se confirm karta hai. Cause do minute mein mila kyunki change line symptom se theek pehle thi.</p></div>

<h3>Correlation saboot nahi hai</h3>
<p>Symptom ke paas ka change ek strong clue hai, faisla nahi. Check karo ki change sach mein asar explain karta hai: purani aur nayi value padho, page dekho, aur test karo. Kabhi kabhi do cheezein hui hoti hain (ek change aur ek ISP fault). Aise mein derived events madad karte hain: bina matching change ke uplink-down event circuit ki taraf ishara karta hai.</p>

<table class="cmp"><tr><th>Evidence</th><th>Source</th><th>Kaun sa sawal answer karta hai</th></tr>
<tr><td>Change log line</td><td>Audit (insaani)</td><td>Kisne kya badla, kab</td></tr>
<tr><td>Derived event</td><td>Network state</td><td>Network abhi kya kar raha hai</td></tr>
<tr><td>Alert</td><td>Derived</td><td>Kis par dhyan chahiye</td></tr>
<tr><td>Hit counter</td><td>Firewall</td><td>Traffic ka faisla kis rule ne kiya</td></tr></table>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Logs padhne se kuch nahi badalta. Change rollback karne se purani value restore hoti hai: native VLAN, rule order, SSID flag. Har rollback khud change log mein nayi line hai, isliye history poori rehti hai.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Time window ki jagah poora din padhna; change kisne kiya yeh ignore karna; purani value note kiye bina fix forward karna; log dekhe bina hardware ko blame karna; yeh bhool jaana ki API calls bhi changes hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Change log aur derived events ek nahi hain. Agar sawal "kisne" poochta hai to jawab change log se aata hai; agar "network kya kar raha hai" poochta hai to events aur alerts se.</p></div>

<div class="scn"><h4>Friday ka hidden SSID</h4><p>Friday shaam Mumbai store ka staff Wi-Fi chala gaya. Log mein 17:52 par SSIDs par ek admin ka change dikha: broadcast yes se no, "network hide karo" experiment ke dauraan. Admin ghar ja chuka tha. On-call engineer ne Broadcast wapas on kiya, save kiya aur ticket mein wajah likhi.</p><p><b>Seekh:</b> change log bina kisi ko phone kiye jawab deta hai, aur rollback ka tareeka bhi dikhata hai.</p></div>

<div class="iv"><p class="q">"Users outage report karte hain. Kaise pata karoge ki change ne cause kiya?"</p><p>Strong answer: time window tay karo, affected network ka change log kholo, pehli symptom se pehle ke changes list karo, page aur symptom match karo, derived events aur page se confirm karo, phir rollback ya fix karo aur record karo. Batao ki API changes bhi dikhte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Event log insaani changes (audit) aur derived events ko mila deta hai.</li>
<li>Zyadatar outages change ke baad aate hain; change log kisne, kya, kab, before aur after batata hai.</li>
<li>Time window use karo, network filter karo, changes dhoondho, symptom se match karo.</li>
<li>Derived events asar confirm karte hain; correlation clue hai, saboot nahi.</li>
<li>Rollbacks bhi log hote hain, aur API calls bhi changes hain.</li>
</ul></div>
`}};export{e as default};