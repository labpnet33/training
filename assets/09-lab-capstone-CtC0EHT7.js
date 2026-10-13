var e={id:`lab-capstone`,h:{en:`Capstone lab: roll out a camera and save the work`,hi:`Capstone lab: camera rollout karo aur kaam save karo`},body:{en:`
<p>A new tenant moves into a building. Security must give the tenant a badge (identity), decide which floors the badge opens (policy), and fit a reader at the tenant's door (the switch port). Then they test the badge and write it into the register. This capstone follows that pattern for the IP camera CAM1.</p>

<h3>The request</h3>
<p>Facilities adds CAM1 on port 1/1/6, MAC <code>00:50:08:41:9f:01</code>. A camera has no supplicant, so it uses MAC authentication. It must land in VLAN 30 with the switch role IOT and the work must survive a reload. Existing objects you will reuse: the profile EP-IOT, the role mapping RM-MAC, the policy EPOL-MAC, the service Wired MAC Auth, and on the switch the role IOT (VLAN 30), plus the ClearPass role CAMERA.</p>

<h3>Pre-change record (30 seconds)</h3>
<ul>
<li><b>Goal:</b> CAM1 authorized by mac-auth, role IOT, VLAN 30, address in 10.20.30.0/24.</li>
<li><b>Snapshot:</b> <code>configuration enforcement policy show EPOL-MAC</code> and <code>configuration identity role-mapping show</code>.</li>
<li><b>Pilot:</b> CAM1 only; no other port changes.</li>
<li><b>Rollback:</b> remove the port method on 1/1/6, remove the two new rules, mark the endpoint disabled.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Camera rollout chain">
<rect x="10" y="20" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="80" y="44" text-anchor="middle" class="svg-ink" font-size="13">1 Endpoint</text><text x="80" y="64" text-anchor="middle" class="svg-muted" font-size="11">known, Category=Camera</text>
<rect x="170" y="20" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="240" y="44" text-anchor="middle" class="svg-ink" font-size="13">2 Role mapping</text><text x="240" y="64" text-anchor="middle" class="svg-muted" font-size="11">Category Camera: CAMERA</text>
<rect x="330" y="20" width="140" height="70" rx="8" fill="#fde68a"/><text x="400" y="44" text-anchor="middle" class="svg-ink" font-size="13">3 Enforcement</text><text x="400" y="64" text-anchor="middle" class="svg-muted" font-size="11">CAMERA: EP-IOT</text>
<rect x="490" y="20" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="560" y="44" text-anchor="middle" class="svg-ink" font-size="13">4 Switch port</text><text x="560" y="64" text-anchor="middle" class="svg-muted" font-size="11">1/1/6 mac-auth</text>
<line x1="150" y1="55" x2="170" y2="55" stroke="#64748b" stroke-width="2"/><line x1="310" y1="55" x2="330" y2="55" stroke="#64748b" stroke-width="2"/><line x1="470" y1="55" x2="490" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="170" y="130" width="300" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="13">5 Prove: IOT, VLAN 30, ping</text><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="11">6 Save: write memory</text>
<line x1="320" y1="90" x2="320" y2="130" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
</svg><p class="cap">Identity, policy and port, then proof and save.</p></div>

<h3>Task 1: ClearPass objects</h3>
<p>Real GUI path in brackets, then the Lab shell command.</p>
<pre class="code"><span class="c">! Configuration > Identity > Endpoints: add the camera as known with a Category attribute</span>
CPPM# configuration identity endpoint add 00:50:08:41:9f:01 status known attr Category=Camera
<span class="c">! Configuration > Identity > Role Mappings > RM-MAC: new rule</span>
CPPM# configuration identity role-mapping RM-MAC rule add if Endpoint:Category EQUALS Camera then CAMERA
<span class="c">! Configuration > Enforcement > Policies > EPOL-MAC: new rule</span>
CPPM# configuration enforcement policy EPOL-MAC rule add if Tips:Role EQUALS CAMERA then EP-IOT</pre>
<p>Check the result by reading the objects before you touch the switch:</p>
<pre class="out">CPPM# configuration enforcement policy show EPOL-MAC
Policy EPOL-MAC   default: [Deny Access Profile]   algorithm: first
  1  if Tips:Role EQUALS PRINTER then EP-IOT
  2  if Tips:Role EQUALS <span class="hl">CAMERA</span> then EP-IOT</pre>
<p>Two points. The default stays the deny profile: an unknown device must still be rejected. And the new rule is added at the end; since it tests a different role, order does not conflict. If you ever add a broad rule, remember that the policy is evaluated top to bottom and first match wins.</p>

<h3>Task 2: the switch port</h3>
<pre class="code">ACCESS# configure terminal
ACCESS(config)# interface 1/1/6
ACCESS(config-if)# aaa authentication port-access mac-auth
ACCESS(config-if)# exit
ACCESS(config)# exit</pre>
<p>The method works only when it is enabled both globally and on the port, and the global section names an existing server group. In this lab the global MAC authentication is already enabled with the group CPPM for the printer, so the per-port command is the only change. Now connect CAM1 and request an address:</p>
<pre class="out">CAM1&gt; ip dhcp
DHCP: address 10.20.30.x/24 from 10.20.30.1

ACCESS# show port-access clients
Port   MAC-Address         User   Method    Status      Role   VLAN
1/1/6  00:50:08:41:9f:01   -      mac-auth  Authorized  <span class="hl">IOT</span>    <span class="hl">30</span></pre>
<p>Cross-check on ClearPass: the Access Tracker Summary should show service Wired MAC Auth, role CAMERA, profile EP-IOT, and Output the Aruba-User-Role IOT.</p>

<h3>Task 3: save</h3>
<pre class="code">ACCESS# write memory
ACCESS# show running-config</pre>
<p>Without <code>write memory</code> the configuration of port 1/1/6 exists only in RAM. ClearPass objects need no such step: they are stored when created.</p>

<h3>If the camera is rejected: use the method</h3>
<table class="cmp"><tr><th>What you see</th><th>Most likely cause</th><th>Fix</th></tr>
<tr><td>Tracker row 216</td><td>Endpoint missing, typed MAC wrong, or status not known</td><td>Correct the endpoint</td></tr>
<tr><td>ACCEPT, role CAMERA, but profile missing</td><td>Enforcement rule not added</td><td>Add the EPOL-MAC rule</td></tr>
<tr><td>Rejected by 9010 default deny</td><td>Role not produced (no mapping rule) so no policy rule matched</td><td>Check Category value spelling (Camera)</td></tr>
<tr><td>No Tracker row at all</td><td>Port method not enabled, camera link down</td><td>Check <code>show aaa authentication port-access</code> and the port</td></tr>
<tr><td>Authorized but no address</td><td>VLAN 30 missing or not allowed on 1/1/1</td><td>Recall chapter 6</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Suppose you typed the MAC with a wrong last digit. The camera would send 00:50:08:41:9f:01 but the endpoint says ...9f:10. Result: REJECT 216 for the real MAC, and the Tracker row shows the correct MAC in Input, which you copy into a fixed endpoint. Always copy the MAC from the Tracker, not from a sticker, when in doubt.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling the port method before the ClearPass objects exist, or testing, succeeding, and walking away without saving. Another trap: adding the camera with Category=camera in lowercase when the rule expects Camera. Attribute values are compared as written in the rule, so keep one spelling.</p></div>

<div class="exam"><p><b>Exam trap.</b> Devices without a supplicant use MAC authentication against the Endpoints Repository; the usual chain is endpoint attribute, then role mapping, then enforcement, then role on the switch. A question that asks where the VLAN is defined has the answer "on the switch role", not on ClearPass, unless standard VLAN attributes are used.</p></div>

<div class="scn"><h4>Fifty cameras, one afternoon</h4><p>A site added fifty cameras. The engineer first built the ClearPass chain for one camera, proved it, saved the switch, and only then enabled the method on the other ports in groups of ten with an interface range, adding endpoints by import. Two cameras with a typed MAC error were found immediately by the 216 alerts.</p><p><b>Lesson:</b> pilot one, prove, then scale in batches, and let the Access Tracker find the exceptions.</p></div>

<div class="iv"><p class="q">"How do you onboard a new type of IoT device with ClearPass?"</p><p>Add the endpoint with a descriptive attribute, map the attribute to a role, enforce the role to an IoT profile, then enable MAC authentication on the port. I prove with the tracker and the switch client list, save the switch and document it. For many devices I use a pilot and batches.</p></div>

<div class="kt"><p><b>Key takeaways</b></p>
<ul>
<li>Order: identity, role mapping, enforcement, then the switch port.</li>
<li>Keep the default as deny; add rules for new devices only.</li>
<li>Prove with <code>show port-access clients</code> and the Access Tracker.</li>
<li><code>write memory</code> makes the switch change permanent.</li>
<li>Pilot one device, then scale.</li>
</ul></div>
`,hi:`
<p>Building mein ek naya tenant aata hai. Security ko tenant ko badge dena hota hai (identity), tay karna hota hai ki badge kaun si floors kholta hai (policy), aur tenant ke darwaze par reader lagana hota hai (switch port). Phir badge test hota hai aur register mein likha jaata hai. Yeh capstone IP camera CAM1 ke liye isi pattern ko follow karta hai.</p>

<h3>Request</h3>
<p>Facilities port 1/1/6 par CAM1 add karta hai, MAC <code>00:50:08:41:9f:01</code>. Camera ka supplicant nahi hota, isliye woh MAC authentication use karta hai. Use VLAN 30 mein switch role IOT ke saath land karna hai aur kaam reload ke baad bhi bachna chahiye. Jo existing objects aap reuse karoge: profile EP-IOT, role mapping RM-MAC, policy EPOL-MAC, service Wired MAC Auth, aur switch par role IOT (VLAN 30), saath mein ClearPass role CAMERA.</p>

<h3>Pre-change record (30 seconds)</h3>
<ul>
<li><b>Goal:</b> CAM1 mac-auth se authorized, role IOT, VLAN 30, 10.20.30.0/24 mein address.</li>
<li><b>Snapshot:</b> <code>configuration enforcement policy show EPOL-MAC</code> aur <code>configuration identity role-mapping show</code>.</li>
<li><b>Pilot:</b> sirf CAM1; koi aur port change nahi.</li>
<li><b>Rollback:</b> 1/1/6 par port method hatao, do naye rules hatao, endpoint ko disabled mark karo.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Camera rollout chain">
<rect x="10" y="20" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="80" y="44" text-anchor="middle" class="svg-ink" font-size="13">1 Endpoint</text><text x="80" y="64" text-anchor="middle" class="svg-muted" font-size="11">known, Category=Camera</text>
<rect x="170" y="20" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="240" y="44" text-anchor="middle" class="svg-ink" font-size="13">2 Role mapping</text><text x="240" y="64" text-anchor="middle" class="svg-muted" font-size="11">Category Camera: CAMERA</text>
<rect x="330" y="20" width="140" height="70" rx="8" fill="#fde68a"/><text x="400" y="44" text-anchor="middle" class="svg-ink" font-size="13">3 Enforcement</text><text x="400" y="64" text-anchor="middle" class="svg-muted" font-size="11">CAMERA: EP-IOT</text>
<rect x="490" y="20" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="560" y="44" text-anchor="middle" class="svg-ink" font-size="13">4 Switch port</text><text x="560" y="64" text-anchor="middle" class="svg-muted" font-size="11">1/1/6 mac-auth</text>
<line x1="150" y1="55" x2="170" y2="55" stroke="#64748b" stroke-width="2"/><line x1="310" y1="55" x2="330" y2="55" stroke="#64748b" stroke-width="2"/><line x1="470" y1="55" x2="490" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="170" y="130" width="300" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="13">5 Prove: IOT, VLAN 30, ping</text><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="11">6 Save: write memory</text>
<line x1="320" y1="90" x2="320" y2="130" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
</svg><p class="cap">Identity, policy aur port, phir proof aur save.</p></div>

<h3>Task 1: ClearPass objects</h3>
<p>Pehle bracket mein real GUI path, phir Lab shell command.</p>
<pre class="code"><span class="c">! Configuration > Identity > Endpoints: camera ko known add karo, Category attribute ke saath</span>
CPPM# configuration identity endpoint add 00:50:08:41:9f:01 status known attr Category=Camera
<span class="c">! Configuration > Identity > Role Mappings > RM-MAC: naya rule</span>
CPPM# configuration identity role-mapping RM-MAC rule add if Endpoint:Category EQUALS Camera then CAMERA
<span class="c">! Configuration > Enforcement > Policies > EPOL-MAC: naya rule</span>
CPPM# configuration enforcement policy EPOL-MAC rule add if Tips:Role EQUALS CAMERA then EP-IOT</pre>
<p>Switch ko chhuone se pehle objects padhkar result check karo:</p>
<pre class="out">CPPM# configuration enforcement policy show EPOL-MAC
Policy EPOL-MAC   default: [Deny Access Profile]   algorithm: first
  1  if Tips:Role EQUALS PRINTER then EP-IOT
  2  if Tips:Role EQUALS <span class="hl">CAMERA</span> then EP-IOT</pre>
<p>Do points. Default deny profile hi rehta hai: unknown device ko ab bhi reject hona chahiye. Aur naya rule end mein add hua; kyunki woh alag role test karta hai, order conflict nahi karta. Kabhi broad rule add karo to yaad rakho ki policy top se bottom evaluate hoti hai aur first match jeetta hai.</p>

<h3>Task 2: switch port</h3>
<pre class="code">ACCESS# configure terminal
ACCESS(config)# interface 1/1/6
ACCESS(config-if)# aaa authentication port-access mac-auth
ACCESS(config-if)# exit
ACCESS(config)# exit</pre>
<p>Method tabhi chalta hai jab woh globally aur port par dono jagah enabled ho, aur global section ek existing server group ka naam le. Is lab mein global MAC authentication printer ke liye group CPPM ke saath pehle se enabled hai, isliye per-port command hi ek change hai. Ab CAM1 connect karo aur address maango:</p>
<pre class="out">CAM1&gt; ip dhcp
DHCP: address 10.20.30.x/24 from 10.20.30.1

ACCESS# show port-access clients
Port   MAC-Address         User   Method    Status      Role   VLAN
1/1/6  00:50:08:41:9f:01   -      mac-auth  Authorized  <span class="hl">IOT</span>    <span class="hl">30</span></pre>
<p>ClearPass par cross-check: Access Tracker Summary mein service Wired MAC Auth, role CAMERA, profile EP-IOT dikhna chahiye, aur Output mein Aruba-User-Role IOT.</p>

<h3>Task 3: save</h3>
<pre class="code">ACCESS# write memory
ACCESS# show running-config</pre>
<p><code>write memory</code> ke bina port 1/1/6 ki configuration sirf RAM mein hai. ClearPass objects ko aisa koi step nahi chahiye: woh banate hi store ho jaate hain.</p>

<h3>Camera reject ho to: method use karo</h3>
<table class="cmp"><tr><th>Kya dikhta hai</th><th>Most likely cause</th><th>Fix</th></tr>
<tr><td>Tracker row 216</td><td>Endpoint missing, MAC galat type hua, ya status known nahi</td><td>Endpoint correct karo</td></tr>
<tr><td>ACCEPT, role CAMERA, par profile missing</td><td>Enforcement rule add nahi hua</td><td>EPOL-MAC rule add karo</td></tr>
<tr><td>9010 default deny se rejected</td><td>Role bana hi nahi (mapping rule nahi) isliye koi policy rule match nahi hua</td><td>Category value ki spelling check karo (Camera)</td></tr>
<tr><td>Tracker row bilkul nahi</td><td>Port method enabled nahi, camera link down</td><td><code>show aaa authentication port-access</code> aur port check karo</td></tr>
<tr><td>Authorized par address nahi</td><td>VLAN 30 missing ya 1/1/1 par allowed nahi</td><td>Chapter 6 yaad karo</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Maan lo MAC ka last digit galat type hua. Camera 00:50:08:41:9f:01 bhejta hai par endpoint mein ...9f:10 hai. Result: asli MAC ke liye REJECT 216, aur Tracker row Input mein sahi MAC dikhati hai, jise aap fixed endpoint mein copy karte ho. Shak ho to MAC sticker se nahi, Tracker se copy karo.</p></div>

<div class="warn"><p><b>Common mistake.</b> ClearPass objects bante se pehle port method enable kar dena, ya test karke, success dekhkar bina save kiye chale jaana. Ek aur trap: camera ko Category=camera lowercase mein add karna jabki rule Camera expect karta hai. Attribute values rule mein jaise likhe hain waise compare hote hain, isliye ek spelling rakho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Supplicant-less devices Endpoints Repository ke against MAC authentication use karte hain; usual chain hai endpoint attribute, phir role mapping, phir enforcement, phir switch par role. "VLAN kahan define hota hai" ka answer "switch role par" hai, ClearPass par nahi, jab tak standard VLAN attributes use na hon.</p></div>

<div class="scn"><h4>Pachaas cameras, ek dopahar</h4><p>Ek site ne pachaas cameras add kiye. Engineer ne pehle ek camera ke liye ClearPass chain banayi, prove ki, switch save kiya, aur tabhi baaki ports par method interface range se das-das ke batches mein enable kiya, endpoints import se add karke. Do cameras ki MAC typing error 216 alerts se turant pakdi gayi.</p><p><b>Lesson:</b> ek pilot karo, prove karo, phir batches mein scale karo, aur exceptions Access Tracker se dhoondhne do.</p></div>

<div class="iv"><p class="q">"ClearPass ke saath naye type ka IoT device kaise onboard karte ho?"</p><p>Descriptive attribute ke saath endpoint add karta hoon, attribute ko role se map karta hoon, role ko IoT profile par enforce karta hoon, phir port par MAC authentication enable karta hoon. Tracker aur switch client list se prove karta hoon, switch save karta hoon aur document karta hoon. Bahut devices ke liye pilot aur batches use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p>
<ul>
<li>Order: identity, role mapping, enforcement, phir switch port.</li>
<li>Default deny rakho; naye devices ke liye sirf rules add karo.</li>
<li><code>show port-access clients</code> aur Access Tracker se prove karo.</li>
<li><code>write memory</code> switch change ko permanent banata hai.</li>
<li>Ek device pilot karo, phir scale karo.</li>
</ul></div>
`}};export{e as default};