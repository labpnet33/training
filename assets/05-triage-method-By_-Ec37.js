var e={id:`triage-method`,h:{en:`A systematic triage method: symptom, place, cause`,hi:`Systematic triage method: symptom, jagah, cause`},body:{en:`
<p>A good doctor does not order every test for every patient. She asks the same short questions in the same order, narrows the problem and tests only what the answers point to. Troubleshooting ClearPass needs the same discipline. This chapter gives you a fixed routine you can repeat at 3 a.m. without thinking.</p>

<h3>The routine in seven steps</h3>
<ol>
<li><b>Pin one attempt.</b> Which user or device, which switch port, what time. Ask the user to retry once while you watch.</li>
<li><b>Ask the switch first.</b> <code>show port-access clients</code> and <code>show radius-server</code>. Is the client there, with which role and VLAN, and is the RADIUS server alive?</li>
<li><b>Ask ClearPass.</b> Is there a row in the Access Tracker for this MAC at this time? If not, read the Event Viewer.</li>
<li><b>Find the stage.</b> Use the pipeline from chapter 2: NAD, service, authentication, role mapping, enforcement, response, switch.</li>
<li><b>Name the cause</b> in one sentence: "bob is disabled", "role CONTRACTOR points to a deleted VLAN".</li>
<li><b>Apply the smallest fix</b> on the layer that owns the cause. Never fix a symptom on the wrong layer.</li>
<li><b>Prove and record.</b> Make the client authenticate again, verify role, VLAN, address and reachability, write down what you changed.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Triage decision tree">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Tracker row for this MAC?</text>
<rect x="20" y="95" width="180" height="50" rx="8" fill="#fed7aa"/><text x="110" y="116" text-anchor="middle" class="svg-ink" font-size="13">NO: stage 1 or path</text><text x="110" y="134" text-anchor="middle" class="svg-muted" font-size="11">Event Viewer, NAD, secret</text>
<rect x="230" y="95" width="180" height="50" rx="8" fill="#fde68a"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="13">YES, REJECT</text><text x="320" y="134" text-anchor="middle" class="svg-muted" font-size="11">read Alerts code</text>
<rect x="440" y="95" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="530" y="116" text-anchor="middle" class="svg-ink" font-size="13">YES, ACCEPT</text><text x="530" y="134" text-anchor="middle" class="svg-muted" font-size="11">check Output, then switch</text>
<line x1="270" y1="50" x2="110" y2="95" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="95" stroke="#64748b" stroke-width="2"/><line x1="370" y1="50" x2="530" y2="95" stroke="#64748b" stroke-width="2"/>
<rect x="440" y="180" width="180" height="56" rx="8" fill="#e2e8f0"/><text x="530" y="203" text-anchor="middle" class="svg-ink" font-size="12">role found? VLAN exists?</text><text x="530" y="221" text-anchor="middle" class="svg-muted" font-size="11">trunk allows it? DHCP?</text>
<line x1="530" y1="145" x2="530" y2="180" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">First branch: is there a Tracker row, and what does it say?</p></div>

<h3>Symptom, where to look, likely cause</h3>
<table class="cmp"><tr><th>Symptom</th><th>Where to look</th><th>Likely cause</th><th>Fix layer</th></tr>
<tr><td>No Tracker row; switch shows server dead</td><td>Event Viewer, <code>show radius-server</code></td><td>NAD IP not registered, or secret mismatch, or no route to ClearPass</td><td>ClearPass NAD or switch</td></tr>
<tr><td>REJECT 9002</td><td>Alerts, Input, <code>service show</code></td><td>Service rule on wrong NAS-Port-Type, or service disabled</td><td>ClearPass service</td></tr>
<tr><td>Wrong service name in Summary</td><td>Summary, service order</td><td>Test service above production</td><td>ClearPass service order</td></tr>
<tr><td>REJECT 215</td><td>Alerts</td><td>Password mismatch</td><td>Identity source or supplicant</td></tr>
<tr><td>REJECT 216</td><td>Alerts, Endpoints Repository</td><td>User or endpoint missing or not known</td><td>Identity source</td></tr>
<tr><td>REJECT 217</td><td>Alerts</td><td>Account disabled</td><td>Identity source</td></tr>
<tr><td>ACCEPT, wrong role or profile</td><td>Summary Roles and Profiles, policy rules</td><td>Role mapping rule missing, catch-all rule first</td><td>ClearPass policy</td></tr>
<tr><td>ACCEPT, switch says role not found</td><td>Output tab versus <code>show port-access role</code></td><td>Role name differs (case), or role missing on switch</td><td>Profile or switch role</td></tr>
<tr><td>ACCEPT, VLAN 1 or no VLAN</td><td>Alerts 9011, Output</td><td>Only Tunnel-Private-Group-Id returned</td><td>Profile (VLAN template)</td></tr>
<tr><td>Authorized, but no address</td><td><code>show vlan</code>, <code>show port-access role</code>, trunk</td><td>VLAN missing, or not allowed on the uplink</td><td>Switch</td></tr>
<tr><td>Policy changed, user unchanged</td><td>Session, Access Tracker</td><td>Enforcement ran at login only</td><td>Reauthorize or CoA</td></tr></table>

<h3>Rules that keep you out of trouble</h3>
<ul>
<li><b>One change at a time.</b> If you change two things and it works, you do not know which fixed it, and you may have left a harmful change behind.</li>
<li><b>Fix on the layer that owns the cause.</b> If the identity is wrong, fix the identity source, not the enforcement policy. Do not widen access (adding a catch-all allow rule, putting everyone on VLAN 10) to make a ticket disappear.</li>
<li><b>Read before you write.</b> Every <code>configuration ... show</code> before an edit saves a rollback.</li>
<li><b>Force a fresh attempt.</b> After a fix, ports are bounced with <code>shutdown</code> and <code>no shutdown</code> (or reauthorize from the tracker) so the client authenticates again. An old session shows an old result.</li>
<li><b>Mind the quiet period.</b> A failed client retries after a short quiet period (20 seconds in the lab model). Waiting a little is part of testing.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> "Carlos cannot get on the network, port 1/1/7." Step 1: Carlos retries. Step 2: <code>show port-access clients</code> shows nothing on 1/1/7. Step 3: Tracker for his MAC: REJECT, 9002. Step 4: stage 2. Step 5: "the Wired 802.1X rule expects NAS-Port-Type 19". Step 6: edit the one rule. Step 7: bounce the port, role EMPLOYEE, ping works. Seven steps, one change.</p></div>

<pre class="code"><span class="c">! Typical first ninety seconds</span>
ACCESS# show port-access clients
ACCESS# show radius-server
CPPM# monitoring access-tracker detail latest summary
CPPM# monitoring access-tracker detail latest alerts</pre>

<div class="warn"><p><b>Common mistake.</b> Skipping step 7. "I changed it, it should work" is not proof. Ask the client to authenticate and verify with a ping to the application (APP1 in the lab, 10.20.70.20).</p></div>

<div class="exam"><p><b>Exam trap.</b> "ACCEPT in ClearPass but no network" is never fixed by editing the enforcement policy first. Eliminate the switch (role name, VLAN, trunk, DHCP) because ClearPass already did its job.</p></div>

<div class="scn"><h4>The catch-all that hid the cause</h4><p>After many tickets an engineer added a rule "if role [User Authenticated] then EP-EMPLOYEE" at the top of the policy to quiet complaints. Contractors now reached the employee VLAN. The audit found it a month later.</p><p><b>Lesson:</b> broadening access to silence a ticket is a security change, not a fix. Find the real cause, fix it and keep least privilege.</p></div>

<div class="iv"><p class="q">"Describe your troubleshooting approach for a ClearPass authentication problem."</p><p>Pin one attempt, check the switch client and RADIUS status, check the Access Tracker, identify the pipeline stage, name the cause, apply the smallest fix on the owning layer, force re-authentication and verify end to end. I change one thing at a time and never widen access to hide a problem.</p></div>

<div class="kt"><p><b>Key takeaways</b></p>
<ul>
<li>Seven steps: pin, switch, ClearPass, stage, cause, smallest fix, proof.</li>
<li>First branch: is there a Tracker row, and is it ACCEPT or REJECT.</li>
<li>Map each symptom to one place to look and one owning layer.</li>
<li>One change at a time; force a fresh authentication after each fix.</li>
<li>Never widen access to close a ticket.</li>
</ul></div>
`,hi:`
<p>Achha doctor har patient ke liye har test order nahi karta. Woh wahi chhote sawaal, wahi order mein poochti hai, problem ko narrow karti hai aur sirf wahi test karti hai jis taraf jawab ishara karein. ClearPass troubleshooting mein bhi yahi discipline chahiye. Yeh chapter aapko ek fixed routine deta hai jo aap raat ke 3 baje bina sochhe repeat kar sako.</p>

<h3>Seven steps ka routine</h3>
<ol>
<li><b>Ek attempt pin karo.</b> Kaun sa user ya device, kaun sa switch port, kaun sa time. User se ek baar retry karwao jab aap dekh rahe ho.</li>
<li><b>Pehle switch se poochho.</b> <code>show port-access clients</code> aur <code>show radius-server</code>. Kya client wahan hai, kaun se role aur VLAN ke saath, aur kya RADIUS server alive hai?</li>
<li><b>ClearPass se poochho.</b> Kya is MAC ke liye is time Access Tracker mein row hai? Nahi, to Event Viewer padho.</li>
<li><b>Stage dhoondho.</b> Chapter 2 ki pipeline use karo: NAD, service, authentication, role mapping, enforcement, response, switch.</li>
<li><b>Cause ko ek sentence mein naam do:</b> "bob disabled hai", "role CONTRACTOR deleted VLAN par point karta hai".</li>
<li><b>Sabse chhota fix</b> us layer par lagao jo cause ki owner hai. Symptom ko galat layer par kabhi fix mat karo.</li>
<li><b>Prove aur record karo.</b> Client ko dobara authenticate karwao, role, VLAN, address aur reachability verify karo, aur likho ki kya badla.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Triage decision tree">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Is MAC ki Tracker row?</text>
<rect x="20" y="95" width="180" height="50" rx="8" fill="#fed7aa"/><text x="110" y="116" text-anchor="middle" class="svg-ink" font-size="13">NO: stage 1 ya path</text><text x="110" y="134" text-anchor="middle" class="svg-muted" font-size="11">Event Viewer, NAD, secret</text>
<rect x="230" y="95" width="180" height="50" rx="8" fill="#fde68a"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="13">YES, REJECT</text><text x="320" y="134" text-anchor="middle" class="svg-muted" font-size="11">Alerts code padho</text>
<rect x="440" y="95" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="530" y="116" text-anchor="middle" class="svg-ink" font-size="13">YES, ACCEPT</text><text x="530" y="134" text-anchor="middle" class="svg-muted" font-size="11">Output, phir switch</text>
<line x1="270" y1="50" x2="110" y2="95" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="95" stroke="#64748b" stroke-width="2"/><line x1="370" y1="50" x2="530" y2="95" stroke="#64748b" stroke-width="2"/>
<rect x="440" y="180" width="180" height="56" rx="8" fill="#e2e8f0"/><text x="530" y="203" text-anchor="middle" class="svg-ink" font-size="12">role mila? VLAN exist?</text><text x="530" y="221" text-anchor="middle" class="svg-muted" font-size="11">trunk allow? DHCP?</text>
<line x1="530" y1="145" x2="530" y2="180" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Pehli branch: Tracker row hai ya nahi, aur woh kya kehti hai.</p></div>

<h3>Symptom, kahan dekhna, likely cause</h3>
<table class="cmp"><tr><th>Symptom</th><th>Kahan dekhna</th><th>Likely cause</th><th>Fix layer</th></tr>
<tr><td>Tracker row nahi; switch server dead dikhata hai</td><td>Event Viewer, <code>show radius-server</code></td><td>NAD IP registered nahi, ya secret mismatch, ya ClearPass tak route nahi</td><td>ClearPass NAD ya switch</td></tr>
<tr><td>REJECT 9002</td><td>Alerts, Input, <code>service show</code></td><td>Service rule galat NAS-Port-Type par, ya service disabled</td><td>ClearPass service</td></tr>
<tr><td>Summary mein galat service name</td><td>Summary, service order</td><td>Test service production ke upar</td><td>ClearPass service order</td></tr>
<tr><td>REJECT 215</td><td>Alerts</td><td>Password mismatch</td><td>Identity source ya supplicant</td></tr>
<tr><td>REJECT 216</td><td>Alerts, Endpoints Repository</td><td>User ya endpoint missing ya not known</td><td>Identity source</td></tr>
<tr><td>REJECT 217</td><td>Alerts</td><td>Account disabled</td><td>Identity source</td></tr>
<tr><td>ACCEPT, galat role ya profile</td><td>Summary Roles aur Profiles, policy rules</td><td>Role mapping rule missing, catch-all rule pehle</td><td>ClearPass policy</td></tr>
<tr><td>ACCEPT, switch kehta hai role not found</td><td>Output tab versus <code>show port-access role</code></td><td>Role name alag (case), ya switch par role missing</td><td>Profile ya switch role</td></tr>
<tr><td>ACCEPT, VLAN 1 ya koi VLAN nahi</td><td>Alerts 9011, Output</td><td>Sirf Tunnel-Private-Group-Id return hua</td><td>Profile (VLAN template)</td></tr>
<tr><td>Authorized, par address nahi</td><td><code>show vlan</code>, <code>show port-access role</code>, trunk</td><td>VLAN missing, ya uplink par allowed nahi</td><td>Switch</td></tr>
<tr><td>Policy badli, user wahi</td><td>Session, Access Tracker</td><td>Enforcement sirf login par chala</td><td>Reauthorize ya CoA</td></tr></table>

<h3>Rules jo aapko musibat se bachate hain</h3>
<ul>
<li><b>Ek time par ek change.</b> Do cheezein badlin aur chal gaya, to pata nahi kisne fix kiya, aur ho sakta hai koi harmful change chhoot gaya ho.</li>
<li><b>Us layer par fix karo jo cause ki owner hai.</b> Identity galat hai to identity source fix karo, enforcement policy nahi. Ticket gayab karne ke liye access widen mat karo (catch-all allow rule, sabko VLAN 10 par daalna).</li>
<li><b>Likhne se pehle padho.</b> Edit se pehle har <code>configuration ... show</code> ek rollback bachata hai.</li>
<li><b>Fresh attempt force karo.</b> Fix ke baad ports ko <code>shutdown</code> aur <code>no shutdown</code> se bounce karo (ya tracker se reauthorize) taaki client dobara authenticate kare. Purana session purana result dikhata hai.</li>
<li><b>Quiet period ka dhyan rakho.</b> Failed client chhote quiet period ke baad retry karta hai (lab model mein 20 seconds). Thoda intezaar testing ka hissa hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> "Carlos network par nahi aa pa raha, port 1/1/7." Step 1: Carlos retry karta hai. Step 2: <code>show port-access clients</code> 1/1/7 par kuch nahi dikhata. Step 3: uske MAC ki Tracker: REJECT, 9002. Step 4: stage 2. Step 5: "Wired 802.1X rule NAS-Port-Type 19 expect karta hai". Step 6: sirf ek rule edit karo. Step 7: port bounce, role EMPLOYEE, ping chalta hai. Saat steps, ek change.</p></div>

<pre class="code"><span class="c">! Typical pehle nabbe seconds</span>
ACCESS# show port-access clients
ACCESS# show radius-server
CPPM# monitoring access-tracker detail latest summary
CPPM# monitoring access-tracker detail latest alerts</pre>

<div class="warn"><p><b>Common mistake.</b> Step 7 skip karna. "Maine badal diya, ab chalna chahiye" proof nahi hai. Client ko authenticate karwao aur application tak ping se verify karo (lab mein APP1, 10.20.70.20).</p></div>

<div class="exam"><p><b>Exam trap.</b> "ClearPass mein ACCEPT par network nahi" kabhi enforcement policy edit karke fix nahi hota. Pehle switch eliminate karo (role name, VLAN, trunk, DHCP) kyunki ClearPass apna kaam kar chuka hai.</p></div>

<div class="scn"><h4>Catch-all jisne cause chhupa diya</h4><p>Bahut saare tickets ke baad ek engineer ne complaints dabane ke liye policy ke top par rule daal diya "if role [User Authenticated] then EP-EMPLOYEE". Contractors ab employee VLAN tak pahunchne lage. Audit ne ise ek mahine baad pakda.</p><p><b>Lesson:</b> ticket chup karane ke liye access broaden karna security change hai, fix nahi. Asli cause dhoondho, fix karo aur least privilege rakho.</p></div>

<div class="iv"><p class="q">"ClearPass authentication problem ke liye apna troubleshooting approach batao."</p><p>Ek attempt pin karta hoon, switch client aur RADIUS status check karta hoon, Access Tracker dekhta hoon, pipeline stage identify karta hoon, cause naam deta hoon, owning layer par sabse chhota fix lagata hoon, re-authentication force karta hoon aur end to end verify karta hoon. Main ek time par ek change karta hoon aur problem chhupane ke liye access kabhi widen nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p>
<ul>
<li>Saat steps: pin, switch, ClearPass, stage, cause, smallest fix, proof.</li>
<li>Pehli branch: Tracker row hai ya nahi, aur ACCEPT hai ya REJECT.</li>
<li>Har symptom ko ek dekhne ki jagah aur ek owning layer se map karo.</li>
<li>Ek time par ek change; har fix ke baad fresh authentication force karo.</li>
<li>Ticket band karne ke liye access kabhi widen mat karo.</li>
</ul></div>
`}};export{e as default};