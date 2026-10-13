var e={id:`coa-lab`,h:{en:`Lab walkthrough: quarantine a live session with CoA`,hi:`Lab walkthrough: CoA se live session ko quarantine karo`},body:{en:`
<h3>The scenario</h3>
<p>Alice's laptop (LAPTOP1, port 1/1/3, role EMPLOYEE, VLAN 10) is already connected when security flags it as risky. Lab <b>cp-coa</b> asks you to do four things: enable dynamic authorization on the switch, enable CoA on the ClearPass network device, change the policy so that ENGINEER maps to the quarantine profile, and send a Disconnect so that LAPTOP1 lands in QUARANTINE, VLAN 50. Remember from the last chapter that the policy change alone does nothing. The Disconnect is what makes the new policy apply.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="CoA lab sequence">
<rect x="10" y="10" width="190" height="34" rx="8" fill="#bae6fd"/><text x="105" y="32" text-anchor="middle" class="svg-ink" font-size="13">1 Switch: dyn-authorization</text>
<rect x="225" y="10" width="190" height="34" rx="8" fill="#bbf7d0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">2 CPPM: device coa 3799</text>
<rect x="440" y="10" width="190" height="34" rx="8" fill="#ddd6fe"/><text x="535" y="32" text-anchor="middle" class="svg-ink" font-size="13">3 CPPM: ENGINEER to quarantine</text>
<line x1="105" y1="44" x2="105" y2="70" stroke="#64748b"/><line x1="320" y1="44" x2="320" y2="70" stroke="#64748b"/><line x1="535" y1="44" x2="535" y2="70" stroke="#64748b"/>
<rect x="10" y="70" width="620" height="34" rx="8" fill="#fed7aa"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="13">4 Access Tracker: send Disconnect for LAPTOP1 (UDP 3799)</text>
<line x1="320" y1="104" x2="320" y2="130" stroke="#64748b"/>
<rect x="170" y="130" width="300" height="34" rx="8" fill="#e2e8f0"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1 reauthenticates, new policy runs</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Result: role QUARANTINE, VLAN 50, only 10.20.60.0/24 reachable</text>
</svg><p class="cap">Prepare both sides first, change the policy, then send the Disconnect.</p></div>

<h3>Step 1: the switch (AOS-CX)</h3>
<pre class="code">ACCESS(config)# radius dyn-authorization enable
ACCESS(config)# radius dyn-authorization client 10.20.60.10 secret-key plaintext ArubaNK1
ACCESS# show radius dyn-authorization</pre>
<pre class="out">Dynamic Authorization: <span class="hl">Enabled</span>
Client       Secret
<span class="hl">10.20.60.10</span>  &lt;configured&gt;</pre>
<p>Two things are configured: the feature is switched on, and ClearPass at 10.20.60.10 is listed as an allowed client with the shared secret. The switch accepts dynamic-authorization packets only from listed clients. The address is the ClearPass server address as the switch sees it as a source.</p>

<h3>Step 2: ClearPass network device</h3>
<p>In the real product open <b>Configuration &gt; Network &gt; Devices</b>, edit the device ACCESS (10.20.99.2) and enable RADIUS CoA with port 3799. The lab shell equivalent is:</p>
<pre class="code"><span class="c">! Lab shell: CPPM</span>
CPPM&gt; configuration network device ACCESS coa 3799</pre>
<p>The device already has the same shared secret from module 1. The CoA packet is signed with that device secret, so the two sides must have identical secrets.</p>

<h3>Step 3: change the enforcement policy</h3>
<p>At the start of the lab the EPOL-WIRED policy has a rule that sends the ENGINEER role to EP-EMPLOYEE. Read the policy first and note the rule numbers, then replace that rule so that ENGINEER goes to EP-QUARANTINE. The profile EP-QUARANTINE returns Aruba-User-Role QUARANTINE, which the switch maps to VLAN 50. The real GUI path is <b>Configuration &gt; Enforcement &gt; Policies</b>.</p>
<pre class="code"><span class="c">! Lab shell: CPPM</span>
CPPM&gt; configuration enforcement policy show EPOL-WIRED
CPPM&gt; configuration enforcement policy EPOL-WIRED rule remove 1
CPPM&gt; configuration enforcement policy EPOL-WIRED rule add if Tips:Role EQUALS ENGINEER then EP-QUARANTINE</pre>
<p>Check the number before you remove: <code>rule remove 1</code> must hit the ENGINEER to EP-EMPLOYEE rule. Remove the wrong rule and Bob's contractor rule is gone instead.</p>

<h3>Step 4: send the Disconnect and verify</h3>
<pre class="code"><span class="c">! Lab shell: CPPM</span>
CPPM&gt; monitoring access-tracker disconnect 00:50:2f:e9:9a:01</pre>
<pre class="out"><span class="hl">CoA disconnect sent to ACCESS (10.20.99.2:3799): Disconnect-ACK from ACCESS for port 1/1/3</span></pre>
<p>The real product offers this through the session actions of the Access Tracker. After the ACK, LAPTOP1 starts a new authentication, ClearPass evaluates the changed policy, and the switch applies the new role.</p>
<pre class="code">ACCESS# show port-access clients</pre>
<pre class="out">Port   MAC-Address        User   Method  Status         Role        VLAN
<span class="hl">1/1/3  00:50:2f:e9:9a:01  alice  dot1x   Authenticated  QUARANTINE  50</span></pre>
<p>On ClearPass the newest Access Tracker record for alice now shows the enforcement profile EP-QUARANTINE and, on the Output tab, the response attribute <code>Radius:Aruba:Aruba-User-Role = QUARANTINE</code>. LAPTOP1 can still reach 10.20.60.0/24 because R1's QUAR-IN list allows it, and cannot reach APP1 at 10.20.70.20. That is the proof of quarantine: connected for remediation, isolated from everything else.</p>

<h3>When the Disconnect fails: reading the message</h3>
<p>The message that comes back tells you which side is wrong. These are the cases you should be able to recognise.</p>
<table class="cmp"><tr><th>Message</th><th>Meaning</th><th>Fix</th></tr>
<tr><td>CoA is not enabled for network device ACCESS</td><td>ClearPass side not enabled</td><td>Enable CoA 3799 on the network device.</td></tr>
<tr><td>no response from ACCESS (radius dyn-authorization is not enabled on the switch)</td><td>Switch feature is off</td><td><code>radius dyn-authorization enable</code></td></tr>
<tr><td>ACCESS ignored the request: 10.20.60.10 is not a configured dyn-authorization client</td><td>Client entry missing on the switch</td><td>Add the <code>radius dyn-authorization client</code> line.</td></tr>
<tr><td>ACCESS rejected the request: shared-secret mismatch</td><td>Secrets differ</td><td>Make both secrets identical.</td></tr>
<tr><td>Disconnect-NAK: session not found (Error-Cause 503)</td><td>The session is already gone, or the MAC is wrong</td><td>Check the client list and the MAC.</td></tr></table>
<p>Error-Cause 503 means Session Context Not Found. It is a good clue that the client is no longer on the port, which can also happen when the port flapped between the policy change and the Disconnect.</p>

<div class="warn"><p><b>Common mistake.</b> Sending the Disconnect before changing the policy. The client reconnects, gets the old role EMPLOYEE again and it looks as if CoA did nothing. Change the policy first, then disconnect.</p></div>

<div class="exam"><p><b>Exam trap.</b> Two sets of settings are needed for CoA, and both need the same secret. If the answer to "why did CoA fail" mentions only ClearPass or only the switch, it is probably incomplete. Also remember the Disconnect only forces a new authentication; the role comes from the policy at that time.</p></div>

<div class="scn"><h4>"We blocked her but nothing happened"</h4><p>A security analyst changed a rule and sent a Disconnect for a laptop. The Access Tracker showed "ACCESS ignored the request: 10.20.60.10 is not a configured dyn-authorization client". Dynamic authorization was enabled on the switch but nobody had added the client line. The engineer added it, repeated the Disconnect and saw Disconnect-ACK. The laptop appeared in the quarantine VLAN seconds later.</p><p><b>Lesson:</b> read the exact CoA result message. It names the missing piece.</p></div>

<div class="iv"><p class="q">"Walk me through how you would quarantine a connected endpoint with ClearPass and an Aruba CX switch."</p><p>Strong answer: confirm dynamic authorization is enabled on the switch with ClearPass as a client and the same secret; confirm CoA is enabled on the network device in ClearPass; change the policy so the role maps to the quarantine profile; send a Disconnect or CoA from the Access Tracker; verify the new role and VLAN on the switch and that only remediation resources are reachable.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Prepare both sides: radius dyn-authorization enable plus client on the switch; CoA 3799 on the network device.</li>
<li>Change the policy first, then send the Disconnect from the Access Tracker.</li>
<li>Success: Disconnect-ACK, then role QUARANTINE in VLAN 50 on the switch.</li>
<li>Failure messages name the missing piece: not enabled, not a client, secret mismatch, session not found.</li>
<li>Check rule numbers before using rule remove.</li>
</ul></div>
`,hi:`
<h3>Scenario</h3>
<p>Alice ka laptop (LAPTOP1, port 1/1/3, role EMPLOYEE, VLAN 10) pehle se connected hai jab security use risky flag karti hai. Lab <b>cp-coa</b> aapse chaar kaam karwata hai: switch par dynamic authorization enable karo, ClearPass network device par CoA enable karo, policy badlo taaki ENGINEER quarantine profile par map ho, aur Disconnect bhejo taaki LAPTOP1 QUARANTINE, VLAN 50 mein land kare. Pichhle chapter se yaad rakho ki akela policy change kuch nahi karta. Disconnect hi nayi policy ko apply karwata hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="CoA lab sequence">
<rect x="10" y="10" width="190" height="34" rx="8" fill="#bae6fd"/><text x="105" y="32" text-anchor="middle" class="svg-ink" font-size="13">1 Switch: dyn-authorization</text>
<rect x="225" y="10" width="190" height="34" rx="8" fill="#bbf7d0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">2 CPPM: device coa 3799</text>
<rect x="440" y="10" width="190" height="34" rx="8" fill="#ddd6fe"/><text x="535" y="32" text-anchor="middle" class="svg-ink" font-size="13">3 CPPM: ENGINEER quarantine par</text>
<line x1="105" y1="44" x2="105" y2="70" stroke="#64748b"/><line x1="320" y1="44" x2="320" y2="70" stroke="#64748b"/><line x1="535" y1="44" x2="535" y2="70" stroke="#64748b"/>
<rect x="10" y="70" width="620" height="34" rx="8" fill="#fed7aa"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="13">4 Access Tracker: LAPTOP1 ke liye Disconnect bhejo (UDP 3799)</text>
<line x1="320" y1="104" x2="320" y2="130" stroke="#64748b"/>
<rect x="170" y="130" width="300" height="34" rx="8" fill="#e2e8f0"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1 reauthenticate, nayi policy chalti</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Result: role QUARANTINE, VLAN 50, sirf 10.20.60.0/24 reachable</text>
</svg><p class="cap">Pehle dono sides taiyar karo, policy badlo, phir Disconnect bhejo.</p></div>

<h3>Step 1: switch (AOS-CX)</h3>
<pre class="code">ACCESS(config)# radius dyn-authorization enable
ACCESS(config)# radius dyn-authorization client 10.20.60.10 secret-key plaintext ArubaNK1
ACCESS# show radius dyn-authorization</pre>
<pre class="out">Dynamic Authorization: <span class="hl">Enabled</span>
Client       Secret
<span class="hl">10.20.60.10</span>  &lt;configured&gt;</pre>
<p>Do cheezein configure hoti hain: feature on kiya jaata hai, aur 10.20.60.10 par ClearPass ko shared secret ke saath allowed client ki tarah list kiya jaata hai. Switch dynamic-authorization packets sirf listed clients se accept karta hai. Address woh ClearPass server address hai jo switch ko source ke roop mein dikhta hai.</p>

<h3>Step 2: ClearPass network device</h3>
<p>Real product mein <b>Configuration &gt; Network &gt; Devices</b> kholo, device ACCESS (10.20.99.2) edit karo aur RADIUS CoA port 3799 ke saath enable karo. Lab shell equivalent:</p>
<pre class="code"><span class="c">! Lab shell: CPPM</span>
CPPM&gt; configuration network device ACCESS coa 3799</pre>
<p>Device ke paas module 1 se pehle hi wahi shared secret hai. CoA packet us device secret se signed hota hai, isliye dono sides ke secrets identical hone chahiye.</p>

<h3>Step 3: enforcement policy badlo</h3>
<p>Lab ke start mein EPOL-WIRED policy mein ek rule hai jo ENGINEER role ko EP-EMPLOYEE par bhejta hai. Pehle policy padho aur rule numbers note karo, phir us rule ko replace karo taaki ENGINEER EP-QUARANTINE par jaye. Profile EP-QUARANTINE Aruba-User-Role QUARANTINE return karta hai, jise switch VLAN 50 se map karta hai. Real GUI path hai <b>Configuration &gt; Enforcement &gt; Policies</b>.</p>
<pre class="code"><span class="c">! Lab shell: CPPM</span>
CPPM&gt; configuration enforcement policy show EPOL-WIRED
CPPM&gt; configuration enforcement policy EPOL-WIRED rule remove 1
CPPM&gt; configuration enforcement policy EPOL-WIRED rule add if Tips:Role EQUALS ENGINEER then EP-QUARANTINE</pre>
<p>Remove karne se pehle number check karo: <code>rule remove 1</code> ENGINEER se EP-EMPLOYEE wale rule par lagna chahiye. Galat rule hataya to Bob ka contractor rule chala jaayega.</p>

<h3>Step 4: Disconnect bhejo aur verify karo</h3>
<pre class="code"><span class="c">! Lab shell: CPPM</span>
CPPM&gt; monitoring access-tracker disconnect 00:50:2f:e9:9a:01</pre>
<pre class="out"><span class="hl">CoA disconnect sent to ACCESS (10.20.99.2:3799): Disconnect-ACK from ACCESS for port 1/1/3</span></pre>
<p>Real product yeh Access Tracker ke session actions se deta hai. ACK ke baad LAPTOP1 nayi authentication shuru karta hai, ClearPass badli hui policy evaluate karta hai, aur switch naya role apply karta hai.</p>
<pre class="code">ACCESS# show port-access clients</pre>
<pre class="out">Port   MAC-Address        User   Method  Status         Role        VLAN
<span class="hl">1/1/3  00:50:2f:e9:9a:01  alice  dot1x   Authenticated  QUARANTINE  50</span></pre>
<p>ClearPass par alice ka sabse naya Access Tracker record ab enforcement profile EP-QUARANTINE dikhata hai aur Output tab par response attribute <code>Radius:Aruba:Aruba-User-Role = QUARANTINE</code>. LAPTOP1 abhi bhi 10.20.60.0/24 tak pahunch sakta hai kyunki R1 ki QUAR-IN list allow karti hai, aur 10.20.70.20 par APP1 tak nahi pahunch sakta. Yahi quarantine ka proof hai: remediation ke liye connected, baaki sab se isolated.</p>

<h3>Jab Disconnect fail ho: message padhna</h3>
<p>Jo message wapas aata hai woh batata hai kaun si side galat hai. Yeh cases aapko pehchanne aane chahiye.</p>
<table class="cmp"><tr><th>Message</th><th>Matlab</th><th>Fix</th></tr>
<tr><td>CoA is not enabled for network device ACCESS</td><td>ClearPass side enabled nahi</td><td>Network device par CoA 3799 enable karo.</td></tr>
<tr><td>no response from ACCESS (radius dyn-authorization is not enabled on the switch)</td><td>Switch feature off hai</td><td><code>radius dyn-authorization enable</code></td></tr>
<tr><td>ACCESS ignored the request: 10.20.60.10 is not a configured dyn-authorization client</td><td>Switch par client entry missing</td><td><code>radius dyn-authorization client</code> line add karo.</td></tr>
<tr><td>ACCESS rejected the request: shared-secret mismatch</td><td>Secrets alag hain</td><td>Dono secrets identical karo.</td></tr>
<tr><td>Disconnect-NAK: session not found (Error-Cause 503)</td><td>Session pehle hi jaa chuka, ya MAC galat</td><td>Client list aur MAC check karo.</td></tr></table>
<p>Error-Cause 503 ka matlab Session Context Not Found. Yeh achha clue hai ki client ab port par nahi hai, jo tab bhi ho sakta hai jab policy change aur Disconnect ke beech port flap hua ho.</p>

<div class="warn"><p><b>Common mistake.</b> Policy badalne se pehle Disconnect bhej dena. Client reconnect hota hai, purana role EMPLOYEE phir paata hai aur lagta hai CoA ne kuch nahi kiya. Pehle policy badlo, phir disconnect karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> CoA ke liye do sides ki settings chahiye, aur dono ko same secret chahiye. Agar "CoA kyun fail hua" ka jawab sirf ClearPass ya sirf switch ka zikr kare, to woh shayad incomplete hai. Yeh bhi yaad rakho ki Disconnect sirf nayi authentication force karta hai; role us waqt ki policy se aata hai.</p></div>

<div class="scn"><h4>"Humne use block kiya lekin kuch nahi hua"</h4><p>Security analyst ne ek rule badla aur laptop ke liye Disconnect bheja. Access Tracker ne dikhaya "ACCESS ignored the request: 10.20.60.10 is not a configured dyn-authorization client". Switch par dynamic authorization enabled thi lekin kisi ne client line add nahi ki thi. Engineer ne add ki, Disconnect dobara bheja aur Disconnect-ACK dekha. Laptop kuch seconds mein quarantine VLAN mein dikha.</p><p><b>Seekh:</b> exact CoA result message padho. Woh missing piece ka naam batata hai.</p></div>

<div class="iv"><p class="q">"ClearPass aur Aruba CX switch se connected endpoint ko quarantine kaise karoge, walk me through."</p><p>Strong answer: confirm karo ki switch par dynamic authorization enabled hai, ClearPass client ke roop mein aur same secret ke saath; confirm karo ki ClearPass mein network device par CoA enabled hai; policy badlo taaki role quarantine profile se map ho; Access Tracker se Disconnect ya CoA bhejo; switch par naya role aur VLAN verify karo aur yeh ki sirf remediation resources reachable hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dono sides taiyar karo: switch par radius dyn-authorization enable plus client; network device par CoA 3799.</li>
<li>Pehle policy badlo, phir Access Tracker se Disconnect bhejo.</li>
<li>Success: Disconnect-ACK, phir switch par role QUARANTINE VLAN 50 mein.</li>
<li>Failure messages missing piece ka naam batate hain: not enabled, not a client, secret mismatch, session not found.</li>
<li>rule remove se pehle rule numbers check karo.</li>
</ul></div>
`}};export{e as default};