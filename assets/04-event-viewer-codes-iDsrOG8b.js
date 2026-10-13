var e={id:`event-viewer-codes`,h:{en:`Event Viewer and alert codes 215 to 9011`,hi:`Event Viewer aur alert codes 215 se 9011`},body:{en:`
<p>A car has two warning systems: the dashboard lights that tell you about a specific failed request (engine, oil, brakes), and the workshop log of the garage that tells you about events outside any single trip (the key was never recognised). ClearPass gives you the same pair. The <b>Access Tracker</b> alerts describe what went wrong inside one request. The <b>Event Viewer</b> (real GUI: <b>Monitoring &gt; Event Viewer</b>) describes system events, including requests that never became a record because they were dropped at the door.</p>

<h3>The Event Viewer</h3>
<p>Use it when the Access Tracker has no row for your test. In the lab model it logs the two stage 1 problems:</p>
<pre class="out">Monitoring > Event Viewer
Time                 Event
-------------------  ---------------------------------------------------------------
2026-10-04 09:12:41  RADIUS request from 10.20.99.2 dropped: <span class="hl">not a registered network device (NAD)</span>
2026-10-04 09:13:02  RADIUS request from 10.20.99.2 dropped: <span class="hl">RADIUS shared secret mismatch for NAD ACCESS</span></pre>
<p>Two different causes, two different fixes. "Not a registered network device" means the source IP does not match any NAD entry: fix the IP on the network device (the lab source is the Vlan99 address 10.20.99.2). "Shared secret mismatch" means the NAD exists but the secrets differ: make them identical. On the switch the symptom is the same in both cases: the RADIUS server shows as unreachable or dead, because ClearPass never answers.</p>
<p>The real Event Viewer also records system-level events such as service restarts, configuration changes and cluster messages. In the lab shell, <code>monitoring event-viewer clear</code> empties it, which is useful before a retest so you read only fresh lines.</p>

<h3>Alert codes in the Access Tracker</h3>
<p>Codes <b>215, 216, 217</b> and <b>9002</b> are the ones you will see in real ClearPass tickets daily. The lab model also uses 9003 to 9011 for other typical policy faults. Real ClearPass has its own numbering and many more messages; in practice <b>read the message text, not only the number</b>.</p>
<table class="cmp"><tr><th>Code</th><th>Meaning</th><th>Stage</th><th>Typical fix</th></tr>
<tr><td>9002</td><td>Failed to classify request to service</td><td>2</td><td>Fix service rules (NAS-Port-Type 15 for wired, Service-Type 1, 2 or 8) or the order</td></tr>
<tr><td>9003 (lab)</td><td>Service has no authentication method</td><td>3</td><td>Add [EAP PEAP] or [MAC AUTH] to the service</td></tr>
<tr><td>9004 (lab)</td><td>MAC authentication not enabled on this service</td><td>3</td><td>Add [MAC AUTH] or [Allow All MAC AUTH]</td></tr>
<tr><td>215</td><td>Password mismatch</td><td>3</td><td>Reset the password in the source; check the supplicant stored the right one</td></tr>
<tr><td>216</td><td>User or endpoint not found (or endpoint status not known)</td><td>3</td><td>Create the user, or add the endpoint to the Endpoints Repository as known</td></tr>
<tr><td>217</td><td>User account disabled</td><td>3</td><td>Enable the account (and ask why it was disabled)</td></tr>
<tr><td>9005 (lab)</td><td>Unsupported EAP method</td><td>3</td><td>Enable the method the client uses on the service</td></tr>
<tr><td>9006 (lab)</td><td>No usable authentication source</td><td>3</td><td>Add [Local User Repository] or the right source</td></tr>
<tr><td>9007 (lab)</td><td>Role mapping policy does not exist</td><td>4</td><td>Re-select or recreate the role mapping on the service</td></tr>
<tr><td>9008 (lab)</td><td>No enforcement policy, or it does not exist</td><td>5</td><td>Bind a valid enforcement policy</td></tr>
<tr><td>9009 (lab)</td><td>Enforcement profile does not exist</td><td>5</td><td>Create the profile or fix the name in the rule</td></tr>
<tr><td>9010 (lab)</td><td>Deny profile or no rule matched</td><td>5</td><td>Fix the rule, role or order; check the default profile</td></tr>
<tr><td>9011 (lab)</td><td>Tunnel-Private-Group-Id without Tunnel-Type and Tunnel-Medium-Type</td><td>6</td><td>Use the VLAN template to return all three attributes</td></tr></table>

<h3>How to read the codes in families</h3>
<ul>
<li><b>9002:</b> nothing claimed the request. Look at the service rules and their order. The built-in services never match wired requests.</li>
<li><b>215, 216, 217:</b> the identity is the problem: wrong password, unknown, disabled. These are fixed on the identity source, not in policy.</li>
<li><b>9003 to 9006:</b> the service is incomplete: missing method, source or an EAP type mismatch.</li>
<li><b>9007 to 9010:</b> a policy object is missing or the rules do not select a profile.</li>
<li><b>9011:</b> the VLAN answer is incomplete, so the switch ignores it.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Three records. Alice: REJECT 215, "password mismatch". Bob: REJECT 217, "account disabled". Printer PRN1 (MAC authentication): REJECT 216, "Endpoint not found in the Endpoints Repository". All three are stage 3, but the fixes differ: reset alice's password, enable bob, add PRN1 as a known endpoint with Category=Printer. This is the lab cp-tracker-triage.</p></div>

<pre class="code"><span class="c">! Lab shell: repair three different causes on ClearPass only</span>
CPPM# configuration identity local-user alice password Pass@2024
CPPM# configuration identity local-user bob enable
CPPM# configuration identity endpoint add 00:50:67:fb:67:01 status known attr Category=Printer</pre>

<div class="warn"><p><b>Common mistake.</b> Treating 216 as "the password is wrong". 216 means the identity was not found in the source the service uses, or, for MAC authentication, the endpoint is missing or its status is not known. Also: a user can be found in a different repository than the one the service lists, which looks identical.</p></div>

<div class="exam"><p><b>Exam trap.</b> Silent drops (wrong secret, unknown NAD) have <b>no</b> Access Tracker alert code; they are in the Event Viewer. And 9002 is not an authentication failure of the user: the user was never evaluated because no service matched.</p></div>

<div class="scn"><h4>Everyone failed at 08:00</h4><p>At the start of the shift about forty users failed with the same 215. Resetting passwords did nothing. The supplicant policy rolled out the night before stored an old password format for a group of laptops, so many users failed one after another. Comparing Input (valid username) with the alert (password mismatch) led to the cause.</p><p><b>Lesson:</b> many identical 215 rows at once point to a shared cause (a rollout, a source change), not to forty forgetful users.</p></div>

<div class="iv"><p class="q">"What do 215, 216 and 217 mean, and how do they differ?"</p><p>All are stage 3 authentication failures. 215: identity found, password does not match. 216: user or endpoint not found, or endpoint status not known. 217: identity found but the account is disabled. 9002 is different: no service matched at all.</p></div>

<div class="kt"><p><b>Key takeaways</b></p>
<ul>
<li>Access Tracker alerts explain one request; the Event Viewer explains dropped requests and system events.</li>
<li>Silent drop reasons: unknown NAD address, shared secret mismatch.</li>
<li>215 password, 216 not found or not known, 217 disabled, 9002 no service matched.</li>
<li>Lab codes 9003 to 9011 map to service, policy and VLAN-attribute faults.</li>
<li>Read the message text; the number is only a pointer.</li>
</ul></div>
`,hi:`
<p>Car mein do warning systems hote hain: dashboard lights jo ek specific failed request (engine, oil, brakes) ke baare mein batati hain, aur garage ka workshop log jo kisi ek trip se bahar ke events batata hai (chaabi pehchani hi nahi gayi). ClearPass bhi yahi jodi deta hai. <b>Access Tracker</b> alerts ek request ke andar kya galat hua woh batate hain. <b>Event Viewer</b> (real GUI: <b>Monitoring &gt; Event Viewer</b>) system events batata hai, un requests samet jo darwaze par drop ho gayi aur kabhi record nahi bani.</p>

<h3>Event Viewer</h3>
<p>Ise tab use karo jab Access Tracker mein aapke test ki koi row na ho. Lab model mein yeh do stage 1 problems log karta hai:</p>
<pre class="out">Monitoring > Event Viewer
Time                 Event
-------------------  ---------------------------------------------------------------
2026-10-04 09:12:41  RADIUS request from 10.20.99.2 dropped: <span class="hl">not a registered network device (NAD)</span>
2026-10-04 09:13:02  RADIUS request from 10.20.99.2 dropped: <span class="hl">RADIUS shared secret mismatch for NAD ACCESS</span></pre>
<p>Do alag causes, do alag fixes. "Not a registered network device" matlab source IP kisi NAD entry se match nahi karta: network device ka IP fix karo (lab ka source Vlan99 address 10.20.99.2 hai). "Shared secret mismatch" matlab NAD exist karta hai par secrets alag hain: unhe identical banao. Switch par dono cases mein symptom same hota hai: RADIUS server unreachable ya dead dikhta hai, kyunki ClearPass kabhi jawab nahi deta.</p>
<p>Real Event Viewer system-level events bhi record karta hai jaise service restarts, configuration changes aur cluster messages. Lab shell mein <code>monitoring event-viewer clear</code> ise khaali karta hai, jo retest se pehle useful hai taaki sirf fresh lines padho.</p>

<h3>Access Tracker mein alert codes</h3>
<p>Codes <b>215, 216, 217</b> aur <b>9002</b> real ClearPass tickets mein roz milte hain. Lab model 9003 se 9011 bhi use karta hai doosre typical policy faults ke liye. Real ClearPass ka apna numbering aur bahut zyada messages hain; practice mein <b>message text padho, sirf number nahi</b>.</p>
<table class="cmp"><tr><th>Code</th><th>Meaning</th><th>Stage</th><th>Typical fix</th></tr>
<tr><td>9002</td><td>Failed to classify request to service</td><td>2</td><td>Service rules fix karo (wired ke liye NAS-Port-Type 15, Service-Type 1, 2 ya 8) ya order</td></tr>
<tr><td>9003 (lab)</td><td>Service mein authentication method nahi</td><td>3</td><td>Service mein [EAP PEAP] ya [MAC AUTH] add karo</td></tr>
<tr><td>9004 (lab)</td><td>Is service par MAC authentication enabled nahi</td><td>3</td><td>[MAC AUTH] ya [Allow All MAC AUTH] add karo</td></tr>
<tr><td>215</td><td>Password mismatch</td><td>3</td><td>Source mein password reset karo; check karo supplicant ne sahi store kiya</td></tr>
<tr><td>216</td><td>User ya endpoint not found (ya endpoint status known nahi)</td><td>3</td><td>User banao, ya endpoint ko Endpoints Repository mein known ke roop mein add karo</td></tr>
<tr><td>217</td><td>User account disabled</td><td>3</td><td>Account enable karo (aur poocho ki disable kyon hua)</td></tr>
<tr><td>9005 (lab)</td><td>Unsupported EAP method</td><td>3</td><td>Jo method client use karta hai woh service par enable karo</td></tr>
<tr><td>9006 (lab)</td><td>Koi usable authentication source nahi</td><td>3</td><td>[Local User Repository] ya sahi source add karo</td></tr>
<tr><td>9007 (lab)</td><td>Role mapping policy exist nahi karti</td><td>4</td><td>Service par role mapping dobara select ya create karo</td></tr>
<tr><td>9008 (lab)</td><td>Enforcement policy nahi hai, ya exist nahi karti</td><td>5</td><td>Valid enforcement policy bind karo</td></tr>
<tr><td>9009 (lab)</td><td>Enforcement profile exist nahi karta</td><td>5</td><td>Profile banao ya rule mein naam fix karo</td></tr>
<tr><td>9010 (lab)</td><td>Deny profile ya koi rule match nahi hua</td><td>5</td><td>Rule, role ya order fix karo; default profile check karo</td></tr>
<tr><td>9011 (lab)</td><td>Tunnel-Private-Group-Id bina Tunnel-Type aur Tunnel-Medium-Type ke</td><td>6</td><td>VLAN template use karo taaki teeno attributes return hon</td></tr></table>

<h3>Codes ko families mein padhna</h3>
<ul>
<li><b>9002:</b> kisi ne request claim nahi ki. Service rules aur unka order dekho. Built-in services wired requests se kabhi match nahi hoti.</li>
<li><b>215, 216, 217:</b> identity problem hai: galat password, unknown, disabled. Yeh identity source par fix hote hain, policy mein nahi.</li>
<li><b>9003 se 9006:</b> service incomplete hai: method, source missing ya EAP type mismatch.</li>
<li><b>9007 se 9010:</b> policy object missing hai ya rules koi profile select nahi karte.</li>
<li><b>9011:</b> VLAN answer incomplete hai, isliye switch use ignore karta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Teen records. Alice: REJECT 215, "password mismatch". Bob: REJECT 217, "account disabled". Printer PRN1 (MAC authentication): REJECT 216, "Endpoint not found in the Endpoints Repository". Teeno stage 3 hain, par fixes alag: alice ka password reset karo, bob ko enable karo, PRN1 ko Category=Printer ke saath known endpoint add karo. Yahi lab cp-tracker-triage hai.</p></div>

<pre class="code"><span class="c">! Lab shell: teen alag causes sirf ClearPass par repair karo</span>
CPPM# configuration identity local-user alice password Pass@2024
CPPM# configuration identity local-user bob enable
CPPM# configuration identity endpoint add 00:50:67:fb:67:01 status known attr Category=Printer</pre>

<div class="warn"><p><b>Common mistake.</b> 216 ko "password galat hai" samajhna. 216 matlab identity us source mein nahi mili jo service use karti hai, ya MAC authentication mein endpoint missing hai ya uska status known nahi. Aur: user kisi aur repository mein mil sakta hai jo service ki list mein nahi, jo bilkul same dikhta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Silent drops (galat secret, unknown NAD) ka Access Tracker alert code <b>nahi</b> hota; woh Event Viewer mein hote hain. Aur 9002 user ki authentication failure nahi hai: user ko evaluate hi nahi kiya gaya kyunki koi service match nahi hui.</p></div>

<div class="scn"><h4>Subah 08:00 sab fail</h4><p>Shift ke start mein lagbhag chalis users same 215 se fail hue. Passwords reset karne se kuch nahi hua. Pichhli raat roll out hui supplicant policy ne laptops ke ek group ke liye purana password format store kiya tha, isliye bahut se users ek ke baad ek fail hue. Input (valid username) ko alert (password mismatch) se compare karne par cause mila.</p><p><b>Lesson:</b> ek saath bahut saari identical 215 rows shared cause (rollout, source change) batati hain, chalis bhoolne wale users nahi.</p></div>

<div class="iv"><p class="q">"215, 216 aur 217 ka kya matlab hai, aur woh kaise alag hain?"</p><p>Teeno stage 3 authentication failures hain. 215: identity mili, password match nahi. 216: user ya endpoint nahi mila, ya endpoint status known nahi. 217: identity mili par account disabled. 9002 alag hai: koi service match hi nahi hui.</p></div>

<div class="kt"><p><b>Key takeaways</b></p>
<ul>
<li>Access Tracker alerts ek request explain karte hain; Event Viewer dropped requests aur system events explain karta hai.</li>
<li>Silent drop reasons: unknown NAD address, shared secret mismatch.</li>
<li>215 password, 216 not found ya not known, 217 disabled, 9002 koi service match nahi.</li>
<li>Lab codes 9003 se 9011 service, policy aur VLAN-attribute faults se map hote hain.</li>
<li>Message text padho; number sirf ek pointer hai.</li>
</ul></div>
`}};export{e as default};