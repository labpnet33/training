var e={id:`reject-role-lab`,h:{en:`Reject-role: a failed login must not strand the user`,hi:`Reject-role: failed login user ko phansa nahi sakta`},body:{en:`
<h3>Start with the problem</h3>
<p>Bob is a contractor. He mistyped his password in the 802.1X supplicant on LAPTOP2, and the supplicant keeps retrying with the same wrong value. ClearPass answers Access-Reject every time. With nothing configured, port 1/1/4 simply stays unauthorized: no DHCP, no network, no way to even reach the helpdesk portal. The site policy says a failed login must not strand the user. He should land in the GUEST role: VLAN 40, internet only, and still blocked from internal networks by R1's GUEST-IN list. This is lab <b>cp-reject-role</b>.</p>

<h3>The plan in three steps</h3>
<ol>
<li>Create the role GUEST on ACCESS with VLAN 40 and set it as the reject-role on port 1/1/4.</li>
<li>Find the reject reason for LAPTOP2 in the ClearPass Access Tracker (alert 215, password mismatch).</li>
<li>Prove LAPTOP2 is in the GUEST reject-role (VLAN 40, no route to APP1) and LAPTOP1 is still EMPLOYEE.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Reject-role flow">
<rect x="10" y="30" width="120" height="60" rx="8" fill="#e2e8f0"/><text x="70" y="56" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP2 (bob)</text><text x="70" y="74" text-anchor="middle" class="svg-muted" font-size="12">wrong password</text>
<rect x="190" y="30" width="120" height="60" rx="8" fill="#bae6fd"/><text x="250" y="56" text-anchor="middle" class="svg-ink" font-size="13">ACCESS 1/1/4</text><text x="250" y="74" text-anchor="middle" class="svg-muted" font-size="12">reject-role GUEST</text>
<rect x="370" y="30" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="430" y="56" text-anchor="middle" class="svg-ink" font-size="13">CPPM</text><text x="430" y="74" text-anchor="middle" class="svg-muted" font-size="12">Access-Reject, 215</text>
<rect x="540" y="30" width="90" height="60" rx="8" fill="#fed7aa"/><text x="585" y="56" text-anchor="middle" class="svg-ink" font-size="13">VLAN 40</text><text x="585" y="74" text-anchor="middle" class="svg-muted" font-size="12">GUEST</text>
<line x1="130" y1="60" x2="190" y2="60" stroke="#64748b"/><line x1="310" y1="60" x2="370" y2="60" stroke="#64748b"/><line x1="250" y1="90" x2="250" y2="120" stroke="#64748b"/><line x1="250" y1="120" x2="585" y2="120" stroke="#64748b"/><line x1="585" y1="120" x2="585" y2="90" stroke="#64748b"/>
<text x="400" y="140" text-anchor="middle" class="svg-muted" font-size="12">switch applies the role after the reject</text>
</svg><p class="cap">The reject comes from ClearPass; the placement into GUEST is decided by the switch.</p></div>

<h3>Step 1: the switch configuration</h3>
<pre class="code">ACCESS(config)# port-access role GUEST
ACCESS(config-pa-role)# vlan access 40
ACCESS(config-pa-role)# exit
ACCESS(config)# interface 1/1/4
ACCESS(config-if)# aaa authentication port-access reject-role GUEST
ACCESS(config-if)# exit</pre>
<p>These two blocks are all that is needed on the switch. The VLAN 40 must exist on ACCESS and be allowed on the 1/1/1 trunk to R1 (this lab already has it), or the guest will have a role but no address.</p>

<h3>Step 2: read the reject reason on ClearPass</h3>
<p>In the real product you open <b>Monitoring &gt; Live Monitoring &gt; Access Tracker</b>, click the failed request and read the <b>Alerts</b> tab. In the lab shell the equivalent is the command below, labelled "Lab shell".</p>
<pre class="code"><span class="c">! Lab shell: CPPM</span>
CPPM&gt; monitoring access-tracker detail bob alerts</pre>
<pre class="out">Monitoring &gt; Live Monitoring &gt; Access Tracker &gt; R00000105-01-3fa2c91b

Alerts
------
  Error Code                : <span class="hl">215</span>
  Error Category            : Authentication failure
  Error Message             : <span class="hl">Authentication failed: password mismatch (MSCHAPv2)</span></pre>
<p>This is why you always read the Access Tracker even when the fix is on the switch. The alert tells you whether the user typed a wrong password (215), the user does not exist (216) or the account is disabled (217). All three give a reject, and all three would land in the reject-role. The reject-role does not repair the cause; it only decides where the user waits.</p>

<h3>Step 3: prove it</h3>
<p>After the quiet period (20 seconds in the model) the client tries again, is rejected again, and the switch applies the reject-role. Then LAPTOP2 asks for an address and tests APP1.</p>
<pre class="code">LAPTOP2&gt; ip dhcp
LAPTOP2&gt; ping 10.20.70.20
ACCESS# show port-access clients detail</pre>
<pre class="out">Port Access Client Status Details

Client 00:50:2f:e9:9a:02, bob
============================================
   Session Details
   ---------------
   Port           : 1/1/4

   Authentication Details
   ----------------------
   Status         : dot1x Rejected (reject-role applied)

   Authorization Details
   ---------------------
   <span class="hl">Role           : GUEST</span>
   Status         : Applied
   <span class="hl">VLAN           : 40 (reject-role GUEST)</span></pre>
<p>The ping to 10.20.70.20 must <b>fail</b>. That is the success condition: the user is connected but isolated. In the same output LAPTOP1 on 1/1/3 should still show role EMPLOYEE in VLAN 10, because the reject-role is a per-port setting and 1/1/3 has none.</p>

<h3>Design question: should the switch or ClearPass do this?</h3>
<p>There are two designs. In the one you built, ClearPass rejects and the switch's reject-role catches the client. In the other, ClearPass itself accepts failed users and returns Aruba-User-Role GUEST through an enforcement profile such as EP-GUEST. The second design records the outcome as an <b>Accept</b> with a named role, lets you decide per failure reason, and works even if a switch has no reject-role. The first design is simple and is a good safety net on the port. Many production sites use both: policy-based guest placement where it is intended, and the reject-role as a backstop.</p>

<div class="warn"><p><b>Common mistake.</b> Forgetting that the reject-role is open to anyone who fails. Someone who types random passwords still gets guest network access. That is acceptable when the guest network is truly internet-only, but never acceptable if GUEST were mapped to an internal VLAN.</p></div>

<div class="exam"><p><b>Exam trap.</b> A reject-role is applied on the authenticator after an Access-Reject. It is not a ClearPass enforcement profile, and ClearPass does not return it. A typo in a role returned by ClearPass (role not found on the switch) is a different problem, even if it may also end in the reject-role.</p></div>

<div class="scn"><h4>Forty contractors, one wrong shared password</h4><p>After a password rotation, a contractor team's supplicants kept the old value. All forty laptops were rejected. Without a reject-role they would have been dead ports, and the helpdesk would have had to visit each desk. With the reject-role on contractor ports they landed in the guest VLAN, opened the self-service portal, and the Access Tracker listed forty 215 alerts that made the cause obvious in a minute.</p><p><b>Lesson:</b> the reject-role keeps users reachable; the Access Tracker explains why.</p></div>

<div class="iv"><p class="q">"A user cannot log in on a wired port. How would you make sure they are not completely cut off?"</p><p>Strong answer: configure a reject-role on the access ports, pointing to a role in a restricted guest or remediation VLAN with an ACL that blocks internal networks. Then read the Access Tracker alert code to find the actual cause. Mention that the reject-role is a switch setting, and that you would verify both the role status and that the VLAN is allowed on the uplink.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The reject-role catches clients that ClearPass rejected; it is set per port on the switch.</li>
<li>Steps: create the role with VLAN, attach it with reject-role, read the Access Tracker alert, prove isolation.</li>
<li>Alert 215 = password mismatch, 216 = unknown user or endpoint, 217 = disabled account.</li>
<li>Success means VLAN 40, an address, and a failing ping to APP1.</li>
<li>Policy-based guest placement from ClearPass and a switch reject-role can be combined.</li>
</ul></div>
`,hi:`
<h3>Problem se shuru karo</h3>
<p>Bob contractor hai. Usne LAPTOP2 ke 802.1X supplicant mein password galat type kar diya, aur supplicant wahi galat value baar-baar try karta rehta hai. ClearPass har baar Access-Reject deta hai. Kuch configure na ho to port 1/1/4 bas unauthorized rehta hai: DHCP nahi, network nahi, helpdesk portal tak bhi pahunchne ka raasta nahi. Site policy kehti hai ki failed login user ko phansa nahi sakta. Use GUEST role mein land karna chahiye: VLAN 40, sirf internet, aur R1 ki GUEST-IN list se internal networks se phir bhi blocked. Yeh lab <b>cp-reject-role</b> hai.</p>

<h3>Teen steps ka plan</h3>
<ol>
<li>ACCESS par VLAN 40 ke saath role GUEST banao aur use port 1/1/4 par reject-role set karo.</li>
<li>ClearPass Access Tracker mein LAPTOP2 ka reject reason dhundo (alert 215, password mismatch).</li>
<li>Prove karo LAPTOP2 GUEST reject-role mein hai (VLAN 40, APP1 tak route nahi) aur LAPTOP1 abhi bhi EMPLOYEE hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Reject-role flow">
<rect x="10" y="30" width="120" height="60" rx="8" fill="#e2e8f0"/><text x="70" y="56" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP2 (bob)</text><text x="70" y="74" text-anchor="middle" class="svg-muted" font-size="12">galat password</text>
<rect x="190" y="30" width="120" height="60" rx="8" fill="#bae6fd"/><text x="250" y="56" text-anchor="middle" class="svg-ink" font-size="13">ACCESS 1/1/4</text><text x="250" y="74" text-anchor="middle" class="svg-muted" font-size="12">reject-role GUEST</text>
<rect x="370" y="30" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="430" y="56" text-anchor="middle" class="svg-ink" font-size="13">CPPM</text><text x="430" y="74" text-anchor="middle" class="svg-muted" font-size="12">Access-Reject, 215</text>
<rect x="540" y="30" width="90" height="60" rx="8" fill="#fed7aa"/><text x="585" y="56" text-anchor="middle" class="svg-ink" font-size="13">VLAN 40</text><text x="585" y="74" text-anchor="middle" class="svg-muted" font-size="12">GUEST</text>
<line x1="130" y1="60" x2="190" y2="60" stroke="#64748b"/><line x1="310" y1="60" x2="370" y2="60" stroke="#64748b"/><line x1="250" y1="90" x2="250" y2="120" stroke="#64748b"/><line x1="250" y1="120" x2="585" y2="120" stroke="#64748b"/><line x1="585" y1="120" x2="585" y2="90" stroke="#64748b"/>
<text x="400" y="140" text-anchor="middle" class="svg-muted" font-size="12">reject ke baad switch role apply karta hai</text>
</svg><p class="cap">Reject ClearPass se aata hai; GUEST mein placement ka decision switch ka hai.</p></div>

<h3>Step 1: switch configuration</h3>
<pre class="code">ACCESS(config)# port-access role GUEST
ACCESS(config-pa-role)# vlan access 40
ACCESS(config-pa-role)# exit
ACCESS(config)# interface 1/1/4
ACCESS(config-if)# aaa authentication port-access reject-role GUEST
ACCESS(config-if)# exit</pre>
<p>Switch par bas yeh do blocks chahiye. VLAN 40 ACCESS par exist karni chahiye aur R1 ki taraf 1/1/1 trunk par allowed honi chahiye (is lab mein pehle se hai), warna guest ke paas role hoga lekin address nahi.</p>

<h3>Step 2: ClearPass par reject reason padho</h3>
<p>Real product mein aap <b>Monitoring &gt; Live Monitoring &gt; Access Tracker</b> kholte ho, failed request par click karte ho aur <b>Alerts</b> tab padhte ho. Lab shell mein iska equivalent neeche wali command hai, jise "Lab shell" label karte hain.</p>
<pre class="code"><span class="c">! Lab shell: CPPM</span>
CPPM&gt; monitoring access-tracker detail bob alerts</pre>
<pre class="out">Monitoring &gt; Live Monitoring &gt; Access Tracker &gt; R00000105-01-3fa2c91b

Alerts
------
  Error Code                : <span class="hl">215</span>
  Error Category            : Authentication failure
  Error Message             : <span class="hl">Authentication failed: password mismatch (MSCHAPv2)</span></pre>
<p>Isliye Access Tracker hamesha padhte hain, chahe fix switch par ho. Alert batata hai ki user ne galat password type kiya (215), user exist nahi karta (216) ya account disabled hai (217). Teeno reject dete hain, aur teeno reject-role mein land honge. Reject-role cause theek nahi karta; woh sirf decide karta hai ki user kahan wait kare.</p>

<h3>Step 3: prove karo</h3>
<p>Quiet period (model mein 20 second) ke baad client phir try karta hai, phir reject hota hai, aur switch reject-role apply karta hai. Phir LAPTOP2 address maangta hai aur APP1 test karta hai.</p>
<pre class="code">LAPTOP2&gt; ip dhcp
LAPTOP2&gt; ping 10.20.70.20
ACCESS# show port-access clients detail</pre>
<pre class="out">Port Access Client Status Details

Client 00:50:2f:e9:9a:02, bob
============================================
   Session Details
   ---------------
   Port           : 1/1/4

   Authentication Details
   ----------------------
   Status         : dot1x Rejected (reject-role applied)

   Authorization Details
   ---------------------
   <span class="hl">Role           : GUEST</span>
   Status         : Applied
   <span class="hl">VLAN           : 40 (reject-role GUEST)</span></pre>
<p>10.20.70.20 ko ping <b>fail</b> hona chahiye. Yahi success condition hai: user connected hai lekin isolated. Isi output mein 1/1/3 par LAPTOP1 abhi bhi role EMPLOYEE VLAN 10 mein dikhna chahiye, kyunki reject-role per-port setting hai aur 1/1/3 par woh nahi hai.</p>

<h3>Design question: yeh kaam switch kare ya ClearPass?</h3>
<p>Do designs hain. Aapne jo banaya usme ClearPass reject karta hai aur switch ka reject-role client ko pakadta hai. Doosre mein ClearPass khud failed users ko accept karta hai aur EP-GUEST jaise enforcement profile se Aruba-User-Role GUEST return karta hai. Doosra design outcome ko named role ke saath <b>Accept</b> ki tarah record karta hai, failure reason ke hisaab se decide karne deta hai, aur tab bhi chalta hai jab switch par reject-role na ho. Pehla design simple hai aur port par achha safety net hai. Kai production sites dono use karte hain: jahan intended ho wahan policy-based guest placement, aur backstop ke roop mein reject-role.</p>

<div class="warn"><p><b>Common mistake.</b> Yeh bhool jaana ki reject-role har us insaan ke liye khula hai jo fail ho. Jo random passwords type karta hai use bhi guest network access milta hai. Yeh tab theek hai jab guest network sach mein internet-only ho, lekin GUEST ko internal VLAN se map karna kabhi theek nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Reject-role Access-Reject ke baad authenticator par apply hota hai. Yeh ClearPass enforcement profile nahi hai, aur ClearPass use return nahi karta. ClearPass ke returned role mein typo (role switch par nahi mila) alag problem hai, chahe woh bhi reject-role par khatam ho.</p></div>

<div class="scn"><h4>Chalis contractors, ek galat shared password</h4><p>Password rotation ke baad ek contractor team ke supplicants ne purani value rakhi. Chalis ke chalis laptops reject hue. Reject-role ke bina yeh dead ports hote, aur helpdesk ko har desk par jaana padta. Contractor ports par reject-role hone se woh guest VLAN mein land hue, self-service portal khola, aur Access Tracker ne chalis 215 alerts dikhaye jinse cause ek minute mein clear ho gaya.</p><p><b>Seekh:</b> reject-role users ko reachable rakhta hai; Access Tracker batata hai kyun.</p></div>

<div class="iv"><p class="q">"Wired port par user login nahi kar pa raha. Kaise pakka karoge ki woh poori tarah cut off na ho?"</p><p>Strong answer: access ports par reject-role configure karo, jo restricted guest ya remediation VLAN ke role ko point kare jisme ACL internal networks block kare. Phir asli cause dhundhne ke liye Access Tracker ka alert code padho. Bolo ki reject-role switch setting hai, aur aap role status aur uplink par VLAN allowed hone dono verify karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Reject-role un clients ko pakadta hai jinhe ClearPass ne reject kiya; yeh switch par per port set hota hai.</li>
<li>Steps: VLAN ke saath role banao, reject-role se attach karo, Access Tracker alert padho, isolation prove karo.</li>
<li>Alert 215 = password mismatch, 216 = unknown user ya endpoint, 217 = disabled account.</li>
<li>Success ka matlab: VLAN 40, address, aur APP1 ko ping fail.</li>
<li>ClearPass ki policy-based guest placement aur switch reject-role saath use ho sakte hain.</li>
</ul></div>
`}};export{e as default};