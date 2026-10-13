var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow and the 9002 lab (cp-service-miss)`,hi:`Troubleshooting workflow aur 9002 lab (cp-service-miss)`},body:{en:`
<p>Every ClearPass problem becomes small once you walk the stations in order and read the evidence at each one. This chapter gives you a repeatable workflow, then applies it to the lab <b>cp-service-miss</b>: "Failed to classify request to service".</p>

<h3>Analogy: a doctor's checklist</h3>
<p>A good doctor does not start with surgery. She checks pulse, temperature and blood pressure in a fixed order, and each result narrows the cause. A ClearPass engineer does the same: the order is fixed, each reading rules out a station, and you treat only the station that is really sick.</p>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Troubleshooting flow">
<rect x="20" y="10" width="600" height="38" rx="8" fill="#bae6fd"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">1  Switch: show radius-server, show port-access clients. Is the server alive?</text>
<rect x="20" y="56" width="600" height="38" rx="8" fill="#fde68a"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">2  Access Tracker: is there a record? No record: Event Viewer (NAD, secret)</text>
<rect x="20" y="102" width="600" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="126" text-anchor="middle" class="svg-ink" font-size="13">3  Record exists: Summary (which service?) Alerts (9002, 215, 216, 217)</text>
<rect x="20" y="148" width="600" height="38" rx="8" fill="#ddd6fe"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">4  Accepted: Output (which role or VLAN attributes?)</text>
<rect x="20" y="194" width="600" height="38" rx="8" fill="#fed7aa"/><text x="320" y="218" text-anchor="middle" class="svg-ink" font-size="13">5  Switch: does the role exist, VLAN exist, trunk allow it, DHCP work?</text>
<text x="320" y="252" text-anchor="middle" class="svg-accent" font-size="12">Fix one thing, force re-authentication, check again</text>
</svg><p class="cap">Work downward; the first station that fails is the one to fix.</p></div>

<table class="cmp"><tr><th>Symptom</th><th>Station</th><th>Typical cause</th></tr>
<tr><td>Switch shows RADIUS server dead, tracker empty</td><td>1 NAD</td><td>Unknown IP or wrong secret, no route</td></tr>
<tr><td>Tracker shows 9002</td><td>2 Service</td><td>Rule mismatch, service disabled or missing</td></tr>
<tr><td>Wrong service in Summary</td><td>2 Service</td><td>A broad service higher in the list</td></tr>
<tr><td>215, 216, 217</td><td>3 Authentication</td><td>Password, missing object, disabled account</td></tr>
<tr><td>Rejected with correct credentials</td><td>5 Enforcement</td><td>No matching rule; default deny</td></tr>
<tr><td>Accepted but port not opened</td><td>6 Response or switch</td><td>Role name not defined on switch, VLAN missing</td></tr></table>

<h3>Lab walk-through: cp-service-miss</h3>
<p><b>The ticket.</b> Every user is configured correctly and the switch is healthy, yet nobody gets in. The Access Tracker shows 9002. Someone cloned the wired service from a wireless one and left its classification rule on NAS-Port-Type 19.</p>
<p><b>Step 1: read the alert.</b></p>
<pre class="code">monitoring access-tracker detail latest alerts
configuration service "Wired 802.1X" show</pre>
<pre class="out">Alerts for latest:
  <span class="hl">9002  Failed to classify request to service</span>

Service: Wired 802.1X   enabled   order 1
  Rules (match ALL):
    Radius:IETF:NAS-Port-Type   EQUALS      <span class="hl">19</span>
    Radius:IETF:Service-Type    BELONGS_TO  1,2,8</pre>
<p>Everything before the service was fine: the record exists, so the NAD is trusted. The rule says wireless (19), but a switch port reports Ethernet (15). The Input tab of the record would show <code>Radius:IETF:NAS-Port-Type = 15</code>.</p>
<p><b>Step 2: correct the rule.</b> Clear the rules and add the wired values again. Keep Service-Type BELONGS_TO 1,2,8.</p>
<pre class="code">configuration service "Wired 802.1X" rule clear
configuration service "Wired 802.1X" rule add Radius:IETF:NAS-Port-Type EQUALS 15
configuration service "Wired 802.1X" rule add Radius:IETF:Service-Type BELONGS_TO 1,2,8</pre>
<p>In the real GUI you open Configuration, Services, edit the service, go to the Service tab and change the rule value, then Save. Note that the rule edit is the only change; the users, roles and policy were right all along.</p>
<p><b>Step 3: prove it.</b> Clients retry on their own after the quiet period, or you can renew on each laptop.</p>
<pre class="code">LAPTOP1: ip dhcp
LAPTOP1: ping 10.20.70.20
LAPTOP2: ip dhcp
LAPTOP2: ping 10.20.70.20
ACCESS#  show port-access clients</pre>
<pre class="out">Port    Client  Role         VLAN  Method
1/1/3   alice   <span class="hl">EMPLOYEE</span>     <span class="hl">10</span>    dot1x
1/1/4   bob     <span class="hl">CONTRACTOR</span>   <span class="hl">20</span>    dot1x</pre>
<p>Two laptops, two roles, two VLANs, one rule corrected. If the ports are still unauthorized, wait for the quiet period or bounce them with <code>shutdown</code> and <code>no shutdown</code> in the interface range.</p>

<div class="eg"><p><b>Worked example.</b> Compare two tickets with the same complaint "nobody can log in". Ticket A: the tracker is empty and the Event Viewer shows a secret mismatch (station 1). Ticket B: the tracker is full of 9002 (station 2). Same words from the user, completely different fixes. The workflow tells them apart in under a minute.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing three things at once, so you never learn which one fixed it. Forgetting to force re-authentication after a fix. Resetting passwords when the alert says 9002. Blaming the switch when the tracker shows the request arrived.</p></div>

<div class="exam"><p><b>Exam trap.</b> 9002 is not an authentication failure. Authentication has not started. The built-in services that exist on a fresh install do not match wired 802.1X requests and will not save you.</p></div>

<div class="scn"><h4>The cloned service</h4><p>A team needed a second service for a new building. They cloned the wireless service because it looked closest, changed the name, and forgot the NAS-Port-Type rule. The pilot worked on wireless but wired users got nothing. The tracker showed 9002 on every wired attempt. A single rule correction, followed by a test with one laptop, fixed the whole building.</p><p><b>Lesson:</b> after cloning, review every rule, method, source and policy binding.</p></div>

<div class="iv"><p class="q">"You see error 9002 in ClearPass. What is your next move?"</p><p>Strong answer: confirm it is a classification failure, open the failed record's Input tab, note NAS-Port-Type, Service-Type and any other attributes, and compare with the rules of each enabled service in order. Correct the rule or order, re-test one client, and keep the change minimal. Mention that credentials are not the issue here.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work the stations in order and read evidence before changing anything.</li>
<li>No tracker record: NAD or secret; 9002: service rules; 215 to 217: identity; Accept but no access: switch role.</li>
<li>Wired requests carry NAS-Port-Type 15; cloned wireless services keep 19.</li>
<li>Change one thing, force re-authentication, verify on the switch.</li>
<li>Always prove the fix for each affected user.</li>
</ul></div>
`,hi:`
<p>Jab aap stations ko order mein chalte ho aur har ek par evidence padhte ho, to har ClearPass problem chhoti ho jaati hai. Yeh chapter aapko repeatable workflow deta hai, phir use lab <b>cp-service-miss</b> par lagata hai: "Failed to classify request to service".</p>

<h3>Analogy: doctor ki checklist</h3>
<p>Achha doctor surgery se shuru nahi karta. Woh pulse, temperature aur blood pressure fixed order mein check karti hai, aur har result wajah ko narrow karta hai. ClearPass engineer bhi yahi karta hai: order fixed hai, har reading ek station ko rule out karti hai, aur aap sirf us station ka ilaaj karte ho jo sach mein bimar hai.</p>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Troubleshooting flow">
<rect x="20" y="10" width="600" height="38" rx="8" fill="#bae6fd"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">1  Switch: show radius-server, show port-access clients. Server alive hai?</text>
<rect x="20" y="56" width="600" height="38" rx="8" fill="#fde68a"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">2  Access Tracker: record hai? Nahi: Event Viewer (NAD, secret)</text>
<rect x="20" y="102" width="600" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="126" text-anchor="middle" class="svg-ink" font-size="13">3  Record hai: Summary (kaunsi service?) Alerts (9002, 215, 216, 217)</text>
<rect x="20" y="148" width="600" height="38" rx="8" fill="#ddd6fe"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">4  Accepted: Output (kaunsa role ya VLAN attributes?)</text>
<rect x="20" y="194" width="600" height="38" rx="8" fill="#fed7aa"/><text x="320" y="218" text-anchor="middle" class="svg-ink" font-size="13">5  Switch: role hai, VLAN hai, trunk allow karta hai, DHCP chalta hai?</text>
<text x="320" y="252" text-anchor="middle" class="svg-accent" font-size="12">Ek cheez fix karo, re-authentication force karo, dobara check karo</text>
</svg><p class="cap">Neeche ki taraf chalo; jo station pehle fail ho wahi fix karna hai.</p></div>

<table class="cmp"><tr><th>Symptom</th><th>Station</th><th>Typical cause</th></tr>
<tr><td>Switch RADIUS server dead dikhata hai, tracker khaali</td><td>1 NAD</td><td>Unknown IP ya wrong secret, route nahi</td></tr>
<tr><td>Tracker mein 9002</td><td>2 Service</td><td>Rule mismatch, service disabled ya missing</td></tr>
<tr><td>Summary mein galat service</td><td>2 Service</td><td>List mein upar ek broad service</td></tr>
<tr><td>215, 216, 217</td><td>3 Authentication</td><td>Password, missing object, disabled account</td></tr>
<tr><td>Sahi credentials par bhi reject</td><td>5 Enforcement</td><td>Koi matching rule nahi; default deny</td></tr>
<tr><td>Accepted par port nahi khula</td><td>6 Response ya switch</td><td>Role naam switch par defined nahi, VLAN missing</td></tr></table>

<h3>Lab walk-through: cp-service-miss</h3>
<p><b>Ticket.</b> Har user sahi configured hai aur switch healthy hai, phir bhi koi andar nahi aa raha. Access Tracker 9002 dikhata hai. Kisi ne wired service ko wireless service se clone kiya aur uska classification rule NAS-Port-Type 19 par chhod diya.</p>
<p><b>Step 1: alert padho.</b></p>
<pre class="code">monitoring access-tracker detail latest alerts
configuration service "Wired 802.1X" show</pre>
<pre class="out">Alerts for latest:
  <span class="hl">9002  Failed to classify request to service</span>

Service: Wired 802.1X   enabled   order 1
  Rules (match ALL):
    Radius:IETF:NAS-Port-Type   EQUALS      <span class="hl">19</span>
    Radius:IETF:Service-Type    BELONGS_TO  1,2,8</pre>
<p>Service se pehle sab theek tha: record maujood hai, to NAD trusted hai. Rule wireless (19) kehta hai, par switch port Ethernet (15) report karta hai. Record ka Input tab <code>Radius:IETF:NAS-Port-Type = 15</code> dikhata.</p>
<p><b>Step 2: rule correct karo.</b> Rules clear karo aur wired values dobara add karo. Service-Type BELONGS_TO 1,2,8 rakho.</p>
<pre class="code">configuration service "Wired 802.1X" rule clear
configuration service "Wired 802.1X" rule add Radius:IETF:NAS-Port-Type EQUALS 15
configuration service "Wired 802.1X" rule add Radius:IETF:Service-Type BELONGS_TO 1,2,8</pre>
<p>Real GUI mein aap Configuration, Services kholte ho, service edit karte ho, Service tab par rule value badalte ho, phir Save. Dhyan do ki rule edit hi ek change hai; users, roles aur policy shuru se theek the.</p>
<p><b>Step 3: prove karo.</b> Clients quiet period ke baad khud retry karte hain, ya aap har laptop par renew kar sakte ho.</p>
<pre class="code">LAPTOP1: ip dhcp
LAPTOP1: ping 10.20.70.20
LAPTOP2: ip dhcp
LAPTOP2: ping 10.20.70.20
ACCESS#  show port-access clients</pre>
<pre class="out">Port    Client  Role         VLAN  Method
1/1/3   alice   <span class="hl">EMPLOYEE</span>     <span class="hl">10</span>    dot1x
1/1/4   bob     <span class="hl">CONTRACTOR</span>   <span class="hl">20</span>    dot1x</pre>
<p>Do laptops, do roles, do VLANs, ek rule correct. Agar ports abhi bhi unauthorized hain, quiet period ka intezaar karo ya interface range mein <code>shutdown</code> aur <code>no shutdown</code> se bounce karo.</p>

<div class="eg"><p><b>Worked example.</b> Ek hi shikayat "koi login nahi kar pa raha" wale do tickets compare karo. Ticket A: tracker khaali hai aur Event Viewer secret mismatch dikhata hai (station 1). Ticket B: tracker 9002 se bhara hai (station 2). User ke shabd same, fix bilkul alag. Workflow ek minute se kam mein dono ko alag kar deta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Ek saath teen cheezein badalna, to pata hi nahi chalta kisne fix kiya. Fix ke baad re-authentication force karna bhool jana. Alert 9002 kehta hai aur passwords reset karna. Tracker request aana dikhata hai tab switch ko blame karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> 9002 authentication failure nahi hai. Authentication shuru hi nahi hua. Fresh install par maujood built-in services wired 802.1X requests ko match nahi karti aur aapko bacha nahi sakti.</p></div>

<div class="scn"><h4>Clone ki hui service</h4><p>Ek team ko naye building ke liye doosri service chahiye thi. Unhone wireless service ko clone kiya kyunki woh sabse close lagi, naam badla, aur NAS-Port-Type rule bhool gaye. Pilot wireless par chala par wired users ko kuch nahi mila. Tracker ne har wired attempt par 9002 dikhaya. Ek rule correction aur ek laptop ke test ne poori building fix kar di.</p><p><b>Seekh:</b> clone ke baad har rule, method, source aur policy binding review karo.</p></div>

<div class="iv"><p class="q">"ClearPass mein aapko error 9002 dikhta hai. Aapka agla kadam kya hoga?"</p><p>Strong answer: confirm karo ki yeh classification failure hai, failed record ka Input tab kholo, NAS-Port-Type, Service-Type aur dusre attributes note karo, aur har enabled service ke rules se order mein compare karo. Rule ya order correct karo, ek client re-test karo, aur change minimal rakho. Mention karo ki yahan credentials issue nahi hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stations ko order mein chalo aur kuch badalne se pehle evidence padho.</li>
<li>Tracker record nahi: NAD ya secret; 9002: service rules; 215 se 217: identity; Accept par bhi access nahi: switch role.</li>
<li>Wired requests NAS-Port-Type 15 carry karti hain; clone ki hui wireless services 19 rakhti hain.</li>
<li>Ek cheez badlo, re-authentication force karo, switch par verify karo.</li>
<li>Har affected user ke liye fix prove karo.</li>
</ul></div>
`}};export{e as default};