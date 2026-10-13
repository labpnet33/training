var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: from the port to ClearPass and back`,hi:`Troubleshooting workflow: port se ClearPass tak aur wapas`},body:{en:`
<p>A doctor does not start with surgery. She asks where it hurts, takes the temperature and reads the chart. Wired access problems need the same calm order. The most useful habit in this module is to <b>read evidence on both sides before changing anything</b>.</p>

<h3>The two-sided method</h3>
<ol>
<li><b>Switch first.</b> What does the port say? Authorized or not, which role, which VLAN, which method, and why (the reason line).</li>
<li><b>Then ClearPass.</b> Is there an Access Tracker record? If yes, read Summary (which service), Alerts (what failed) and Output (what was returned).</li>
<li><b>If there is no record,</b> read the Event Viewer: dropped requests mean network device address or secret problems.</li>
<li><b>Find the first stage that is wrong,</b> using the six stages from chapter 4, and fix <em>only that object</em>.</li>
<li><b>Reauthenticate and prove</b> with switch evidence, VLAN and address, not with a hunch.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Troubleshooting decision flow">
<rect x="200" y="10" width="240" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">show port-access clients detail</text>
<line x1="320" y1="50" x2="320" y2="75" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="75" width="240" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">Access Tracker record?</text>
<line x1="200" y1="95" x2="110" y2="140" stroke="#64748b" stroke-width="2"/><text x="130" y="112" text-anchor="middle" class="svg-muted" font-size="12">none</text>
<rect x="20" y="140" width="180" height="50" rx="8" fill="#fed7aa"/><text x="110" y="162" text-anchor="middle" class="svg-ink" font-size="12">Event Viewer: IP, secret,</text><text x="110" y="178" text-anchor="middle" class="svg-ink" font-size="12">reachability</text>
<line x1="320" y1="115" x2="320" y2="140" stroke="#64748b" stroke-width="2"/><text x="352" y="132" class="svg-muted" font-size="12">alert</text>
<rect x="230" y="140" width="180" height="50" rx="8" fill="#fde68a"/><text x="320" y="162" text-anchor="middle" class="svg-ink" font-size="12">215 216 217 9002:</text><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="12">service or identity</text>
<line x1="440" y1="95" x2="530" y2="140" stroke="#64748b" stroke-width="2"/><text x="510" y="112" text-anchor="middle" class="svg-muted" font-size="12">ACCEPT</text>
<rect x="440" y="140" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="530" y="162" text-anchor="middle" class="svg-ink" font-size="12">Compare Output with</text><text x="530" y="178" text-anchor="middle" class="svg-ink" font-size="12">switch role and VLAN</text>
<text x="320" y="232" text-anchor="middle" class="svg-ink" font-size="13">Fix one object, bounce the port, prove it</text>
<text x="320" y="254" text-anchor="middle" class="svg-muted" font-size="12">Never change two things at once</text>
</svg><p class="cap">Switch first, tracker second, change third.</p></div>

<h3>Symptom table</h3>
<table class="cmp"><tr><th>What you see</th><th>Likely cause</th><th>Fix</th></tr>
<tr><td>No Access Tracker record; Event Viewer shows dropped packets</td><td>NAD source IP not registered, or secret differs</td><td>Register 10.20.99.2; make secrets equal</td></tr>
<tr><td>Error 9002</td><td>No service matched</td><td>Correct classification rules or service order</td></tr>
<tr><td>Alert 215, 216, 217</td><td>Wrong password, unknown, disabled</td><td>Fix the credential or status</td></tr>
<tr><td>ACCEPT but unauthorized, "role not defined"</td><td>Role name mismatch</td><td>Make the profile value equal the switch role</td></tr>
<tr><td>Authorized in VLAN 1, no address</td><td>Tunnel attributes incomplete</td><td>Use the VLAN template</td></tr>
<tr><td>Authorized in role but no address</td><td>VLAN missing or not on trunk</td><td>Create the VLAN, allow it on 1/1/1</td></tr>
<tr><td>Everyone lands in GUEST</td><td>Test service first, or catch-all policy rule first</td><td>Reorder; remove catch-all</td></tr></table>

<h3>Worked cases</h3>
<p><b>Case 1: cp-role-case.</b> Switch says "role Employee is not defined", tracker says ACCEPT and Output shows Employee. Fix the profile (Lab shell: <code>configuration enforcement profile EP-EMPLOYEE attribute add Radius:Aruba:Aruba-User-Role EMPLOYEE</code>), bounce, prove VLAN 10 and an address.</p>
<p><b>Case 2: cp-vlan-attrs.</b> Switch shows both clients authorized in VLAN 1. The record carries the lab alert about incomplete VLAN attributes. Run the VLAN template on both profiles, bounce 1/1/3-1/1/4, prove VLAN 10 and 20.</p>
<p><b>Case 3: cp-mac-auth.</b> PRN1 gets nothing. The tracker says 9002 (no service) or 216 (unknown endpoint). Add the endpoint as known with Category Printer, create the Wired MAC Auth service from the template, bind RM-MAC and EPOL-MAC.</p>
<p><b>Case 4: layers.</b> Contractors have no network since a clean-up. ClearPass returns CONTRACTOR correctly. On the switch the role CONTRACTOR points at VLAN 20, which was deleted, so the role cannot be applied. Recreate <code>vlan 20</code> with the name CONTRACTOR. The client is now authorized but still has no address: VLAN 20 is not allowed on the uplink. Fix <code>vlan trunk allowed 10,20,30,40,50,99</code> on 1/1/1. Two faults, found one layer at a time.</p>
<pre class="out">ACCESS# show port-access role CONTRACTOR
Role CONTRACTOR   VLAN access: 20   <span class="hl">VLAN status: not present</span>

ACCESS# show interface brief
1/1/1  trunk  native 99  <span class="hl">allowed 10,30,40,50,99</span></pre>

<div class="eg"><p><b>Worked example.</b> Monday: three tickets, one morning. Alice: Access Tracker alert 215 means her password differs from ClearPass; reset it. Bob: alert 217 means the account is disabled; enable it. Printer: alert 216 means the MAC was never added; add the endpoint. Same symptom (no network), three different stages of the chain, each fixed on ClearPass only. Reading the alert code first saved an hour of cable swapping.</p></div>

<div class="warn"><p><b>Common mistake.</b> Restarting the supplicant or swapping cables first. If the Access Tracker shows ACCEPT, the cable is fine. Also: changing the policy and testing without reauthenticating. The old session is still there; bounce the port or disconnect the client.</p></div>

<div class="exam"><p><b>Exam trap.</b> Order matters when two faults exist. Fixing the first one reveals the second. "Authorized but no address" is a VLAN, trunk or DHCP symptom, not a ClearPass symptom.</p></div>

<div class="note"><p><b>Lab shell versus real GUI.</b> The lab's shell equivalents are <code>monitoring access-tracker detail latest alerts</code>, <code>monitoring event-viewer</code>, <code>show port-access clients detail</code>. In the real GUI the same views are under Monitoring (Access Tracker, Event Viewer). Policy Manager log-level changes and packet captures on the server are <b>not simulated in the lab</b>.</p></div>

<div class="scn"><h4>Two faults after a clean-up</h4><p>After a weekend VLAN clean-up all contractors were offline. The first engineer rebuilt the ClearPass profile, which was already correct. The second read the role status on the switch, found VLAN 20 missing, recreated it, and the clients authorized. A short wait later users still had no IP. A glance at the trunk showed the allowed list lacked 20. Ten minutes, two commands.</p><p><b>Lesson:</b> do not stop at the first fix; prove an address and reachability before closing the ticket.</p></div>

<div class="iv"><p class="q">"Walk me through your troubleshooting method for a 802.1X user who cannot get on the network."</p><p>Strong answer: switch client status first; then the Access Tracker record (or Event Viewer if none); identify the failing stage; compare returned attributes with switch roles and VLANs; fix one object; reauthenticate and verify role, VLAN, address and reachability. Mention not changing two things at once.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read both sides: switch status and ClearPass record.</li>
<li>No record means look at the Event Viewer; ACCEPT means compare attributes with the switch.</li>
<li>Alert codes 215, 216, 217 and 9002 point to specific stages.</li>
<li>Fix one object at a time and reauthenticate before judging.</li>
<li>Close the ticket only after proving VLAN, address and reachability.</li>
</ul></div>
`,hi:`
<p>Doctor surgery se shuru nahi karti. Woh poochti hai kahan dard hai, temperature leti hai aur chart padhti hai. Wired access problems ko bhi yehi shant order chahiye. Is module ki sabse kaam ki aadat hai: <b>kuch badalne se pehle dono sides ka evidence padho</b>.</p>

<h3>Do-side wali method</h3>
<ol>
<li><b>Pehle switch.</b> Port kya keh raha hai? Authorized ya nahi, kaunsa role, kaunsa VLAN, kaunsa method, aur kyun (reason line).</li>
<li><b>Phir ClearPass.</b> Kya Access Tracker record hai? Agar haan, to Summary (kaunsi service), Alerts (kya fail hua) aur Output (kya return hua) padho.</li>
<li><b>Record na ho to</b> Event Viewer padho: dropped requests matlab network device address ya secret ki problem.</li>
<li><b>Pehla galat stage dhoondho,</b> chapter 4 ke chhe stages se, aur <em>sirf wahi object</em> fix karo.</li>
<li><b>Reauthenticate karo aur prove karo</b> switch evidence, VLAN aur address se, andaze se nahi.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Troubleshooting decision flow">
<rect x="200" y="10" width="240" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">show port-access clients detail</text>
<line x1="320" y1="50" x2="320" y2="75" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="75" width="240" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">Access Tracker record?</text>
<line x1="200" y1="95" x2="110" y2="140" stroke="#64748b" stroke-width="2"/><text x="130" y="112" text-anchor="middle" class="svg-muted" font-size="12">nahi</text>
<rect x="20" y="140" width="180" height="50" rx="8" fill="#fed7aa"/><text x="110" y="162" text-anchor="middle" class="svg-ink" font-size="12">Event Viewer: IP, secret,</text><text x="110" y="178" text-anchor="middle" class="svg-ink" font-size="12">reachability</text>
<line x1="320" y1="115" x2="320" y2="140" stroke="#64748b" stroke-width="2"/><text x="352" y="132" class="svg-muted" font-size="12">alert</text>
<rect x="230" y="140" width="180" height="50" rx="8" fill="#fde68a"/><text x="320" y="162" text-anchor="middle" class="svg-ink" font-size="12">215 216 217 9002:</text><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="12">service ya identity</text>
<line x1="440" y1="95" x2="530" y2="140" stroke="#64748b" stroke-width="2"/><text x="510" y="112" text-anchor="middle" class="svg-muted" font-size="12">ACCEPT</text>
<rect x="440" y="140" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="530" y="162" text-anchor="middle" class="svg-ink" font-size="12">Output ko switch role</text><text x="530" y="178" text-anchor="middle" class="svg-ink" font-size="12">aur VLAN se compare</text>
<text x="320" y="232" text-anchor="middle" class="svg-ink" font-size="13">Ek object fix karo, port bounce karo, prove karo</text>
<text x="320" y="254" text-anchor="middle" class="svg-muted" font-size="12">Do cheezein ek saath kabhi nahi</text>
</svg><p class="cap">Pehle switch, phir tracker, phir change.</p></div>

<h3>Symptom table</h3>
<table class="cmp"><tr><th>Kya dikhta hai</th><th>Likely cause</th><th>Fix</th></tr>
<tr><td>Access Tracker record nahi; Event Viewer dropped packets dikhata hai</td><td>NAD source IP registered nahi, ya secret alag</td><td>10.20.99.2 register karo; secrets barabar karo</td></tr>
<tr><td>Error 9002</td><td>Koi service match nahi hui</td><td>Classification rules ya service order theek karo</td></tr>
<tr><td>Alert 215, 216, 217</td><td>Galat password, unknown, disabled</td><td>Credential ya status theek karo</td></tr>
<tr><td>ACCEPT par unauthorized, "role not defined"</td><td>Role name mismatch</td><td>Profile value ko switch role ke barabar karo</td></tr>
<tr><td>VLAN 1 mein authorized, address nahi</td><td>Tunnel attributes incomplete</td><td>VLAN template use karo</td></tr>
<tr><td>Role mein authorized par address nahi</td><td>VLAN missing ya trunk par nahi</td><td>VLAN banao, 1/1/1 par allow karo</td></tr>
<tr><td>Sab GUEST mein</td><td>Test service pehle, ya catch-all policy rule pehle</td><td>Reorder karo; catch-all hatao</td></tr></table>

<h3>Worked cases</h3>
<p><b>Case 1: cp-role-case.</b> Switch kehta hai "role Employee is not defined", tracker ACCEPT kehta hai aur Output Employee dikhata hai. Profile fix karo (Lab shell: <code>configuration enforcement profile EP-EMPLOYEE attribute add Radius:Aruba:Aruba-User-Role EMPLOYEE</code>), bounce karo, VLAN 10 aur address prove karo.</p>
<p><b>Case 2: cp-vlan-attrs.</b> Switch dono clients ko VLAN 1 mein authorized dikhata hai. Record mein incomplete VLAN attributes ka lab alert hai. Dono profiles par VLAN template chalao, 1/1/3-1/1/4 bounce karo, VLAN 10 aur 20 prove karo.</p>
<p><b>Case 3: cp-mac-auth.</b> PRN1 ko kuch nahi milta. Tracker 9002 (koi service nahi) ya 216 (unknown endpoint) kehta hai. Endpoint ko Category Printer ke saath known add karo, template se Wired MAC Auth service banao, RM-MAC aur EPOL-MAC bind karo.</p>
<p><b>Case 4: layers.</b> Clean-up ke baad se contractors ko network nahi. ClearPass CONTRACTOR sahi return karta hai. Switch par role CONTRACTOR VLAN 20 ko point karta hai, jo delete ho gaya tha, isliye role apply nahi ho sakta. Name CONTRACTOR ke saath <code>vlan 20</code> dobara banao. Ab client authorized hai par phir bhi address nahi: VLAN 20 uplink par allowed nahi. 1/1/1 par <code>vlan trunk allowed 10,20,30,40,50,99</code> fix karo. Do faults, ek ek layer mein mile.</p>
<pre class="out">ACCESS# show port-access role CONTRACTOR
Role CONTRACTOR   VLAN access: 20   <span class="hl">VLAN status: not present</span>

ACCESS# show interface brief
1/1/1  trunk  native 99  <span class="hl">allowed 10,30,40,50,99</span></pre>

<div class="eg"><p><b>Worked example.</b> Somvaar: teen tickets, ek subah. Alice: Access Tracker alert 215 matlab uska password ClearPass se alag hai; reset karo. Bob: alert 217 matlab account disabled hai; enable karo. Printer: alert 216 matlab MAC kabhi add nahi hua; endpoint add karo. Symptom same (network nahi), chain ke teen alag stages, har ek sirf ClearPass par fix hua. Alert code pehle padhne se ghanta bhar cable badalne se bach gaye.</p></div>

<div class="warn"><p><b>Common galti.</b> Pehle supplicant restart karna ya cables badalna. Agar Access Tracker ACCEPT dikhata hai to cable theek hai. Aur: policy badal kar reauthenticate kiye bina test karna. Purana session abhi bhi hai; port bounce karo ya client disconnect karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Jab do faults hon to order matter karta hai. Pehla fix karne se doosra dikhta hai. "Authorized but no address" VLAN, trunk ya DHCP ka symptom hai, ClearPass ka nahi.</p></div>

<div class="note"><p><b>Lab shell versus real GUI.</b> Lab ke shell equivalents hain <code>monitoring access-tracker detail latest alerts</code>, <code>monitoring event-viewer</code>, <code>show port-access clients detail</code>. Real GUI mein yehi views Monitoring ke neeche hain (Access Tracker, Event Viewer). Policy Manager log-level changes aur server par packet captures lab mein <b>not simulated in the lab</b> hain.</p></div>

<div class="scn"><h4>Clean-up ke baad do faults</h4><p>Weekend VLAN clean-up ke baad saare contractors offline the. Pehle engineer ne ClearPass profile rebuild kiya, jo pehle se sahi tha. Doosre ne switch par role status padha, VLAN 20 missing paya, dobara banaya, aur clients authorize ho gaye. Thodi der baad bhi users ko IP nahi mila. Trunk dekhne par allowed list mein 20 nahi tha. Das minute, do commands.</p><p><b>Seekh:</b> pehle fix par mat ruko; ticket band karne se pehle address aur reachability prove karo.</p></div>

<div class="iv"><p class="q">"802.1X user jo network par nahi aa pa raha uske liye apni troubleshooting method walk through karo."</p><p>Strong answer: pehle switch client status; phir Access Tracker record (ya record na ho to Event Viewer); failing stage pehchano; returned attributes ko switch roles aur VLANs se compare karo; ek object fix karo; reauthenticate karke role, VLAN, address aur reachability verify karo. Bolo ki do cheezein ek saath nahi badalte.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dono sides padho: switch status aur ClearPass record.</li>
<li>Record nahi to Event Viewer; ACCEPT ho to attributes ko switch se compare karo.</li>
<li>Alert codes 215, 216, 217 aur 9002 specific stages ko point karte hain.</li>
<li>Ek ek object fix karo aur judge karne se pehle reauthenticate karo.</li>
<li>Ticket tabhi band karo jab VLAN, address aur reachability prove ho.</li>
</ul></div>
`}};export{e as default};