var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: switch sessions, Live Logs and "CoA does nothing"`,hi:`Troubleshooting workflow: switch sessions, Live Logs aur "CoA kuch nahi karta"`},body:{en:`
<p>When a parcel does not arrive, you check in order: did the sender post it, did the courier pick it up, did the sorting office accept it, which van it went on, and did the house accept delivery. NAC tickets are solved the same way: follow the request from the endpoint to the switch, to ISE, back with a decision, onto the port, and, for CoA, back again. Most tickets are solved by two views side by side: <code>show authentication sessions</code> on the switch and <b>Live Logs</b> in ISE.</p>

<h3>The six-step workflow</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="NAC troubleshooting steps">
<rect x="5" y="50" width="98" height="56" rx="8" fill="#bbf7d0"/><text x="54" y="74" text-anchor="middle" class="svg-ink" font-size="12">1 Endpoint</text><text x="54" y="92" text-anchor="middle" class="svg-muted" font-size="12">supplicant</text>
<rect x="111" y="50" width="98" height="56" rx="8" fill="#bae6fd"/><text x="160" y="74" text-anchor="middle" class="svg-ink" font-size="12">2 Port</text><text x="160" y="92" text-anchor="middle" class="svg-muted" font-size="12">session</text>
<rect x="217" y="50" width="98" height="56" rx="8" fill="#bae6fd"/><text x="266" y="74" text-anchor="middle" class="svg-ink" font-size="12">3 RADIUS</text><text x="266" y="92" text-anchor="middle" class="svg-muted" font-size="12">path, secret</text>
<rect x="323" y="50" width="98" height="56" rx="8" fill="#ddd6fe"/><text x="372" y="74" text-anchor="middle" class="svg-ink" font-size="12">4 Live Logs</text><text x="372" y="92" text-anchor="middle" class="svg-muted" font-size="12">rules, reason</text>
<rect x="429" y="50" width="98" height="56" rx="8" fill="#fde68a"/><text x="478" y="74" text-anchor="middle" class="svg-ink" font-size="12">5 Enforce</text><text x="478" y="92" text-anchor="middle" class="svg-muted" font-size="12">VLAN, dACL</text>
<rect x="535" y="50" width="98" height="56" rx="8" fill="#fed7aa"/><text x="584" y="74" text-anchor="middle" class="svg-ink" font-size="12">6 CoA</text><text x="584" y="92" text-anchor="middle" class="svg-muted" font-size="12">dynamic-author</text>
<text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="12">find the first step that is not healthy, fix it, re-test</text>
</svg><p class="cap">Follow the request left to right; the first unhealthy step is usually the root cause.</p></div>

<ol>
<li><b>Endpoint.</b> Is the supplicant enabled and configured for the right EAP method? Does it trust the ISE EAP certificate? Does a device without supplicant actually send traffic so MAB can learn its MAC?</li>
<li><b>Port and session.</b> <code>show authentication sessions interface gX details</code>: Status, Method, which methods ran ("Failed over", "Authc Fail", "Running"), Server or Local policies. Check <code>show running-config interface</code> for port-control auto, pae, mab, order.</li>
<li><b>Switch to ISE.</b> <code>show aaa servers</code> (State UP or DEAD, request and timeout counters), <code>test aaa group radius</code>, routing to the PSN, source interface, shared secret. ISE side: is the device in Network Devices?</li>
<li><b>ISE decision.</b> Operations &gt; RADIUS &gt; Live Logs. Click the details icon: policy set, authentication rule, identity store, authorization rule, authorization profile, failure reason and the step list. <b>Live Sessions</b> shows the session lifecycle including CoA.</li>
<li><b>Enforcement.</b> Accepted but no access? Check <code>aaa authorization network</code>, that the VLAN exists, that dACL source substitution works (device tracking), that redirect ACL and web server are configured.</li>
<li><b>CoA.</b> Change does not happen? Check <code>aaa server radius dynamic-author</code>, the client IP of every PSN, server-key, port 1700 vs 3799, firewalls between ISE and the NAS.</li>
</ol>

<h3>Failure reasons worth memorising</h3>
<table class="cmp"><tr><th>Code</th><th>Meaning</th><th>Look at</th></tr>
<tr><td>11007</td><td>Could not locate Network Device or AAA Client</td><td>NAS IP not in ISE, or wrong source interface</td></tr>
<tr><td>11036</td><td>The Message-Authenticator RADIUS attribute is invalid</td><td>Shared secret mismatch</td></tr>
<tr><td>22056</td><td>Subject not found in the applicable identity store(s)</td><td>Unknown user or MAC; MAB "User not found" set to Reject</td></tr>
<tr><td>24408</td><td>User authentication against Active Directory failed since user has entered the wrong password</td><td>Credentials</td></tr>
<tr><td>12321</td><td>PEAP failed SSL/TLS handshake because the client rejected the ISE local-certificate</td><td>Client trust of the EAP certificate</td></tr>
<tr><td>5411</td><td>Supplicant stopped responding to ISE</td><td>Supplicant config, certificate trust, timeouts</td></tr>
<tr><td>15039</td><td>Rejected per authorization profile</td><td>An authorization rule returned DenyAccess</td></tr>
<tr><td>11213</td><td>No response received from Network Access Device after sending a Dynamic Authorization request</td><td>CoA not accepted: dynamic-author client, key, port, firewall</td></tr>
</table>
<p>Event 5200 is "Authentication succeeded", 5400 "Authentication failed", 5205 "Dynamic Authorization succeeded" and 5417 "Dynamic Authorization failed".</p>

<h3>Lab walk: CoA ignored, the NAS drops the disconnect</h3>
<p>PC1 (priya) is authorized in VLAN 20 on NAS-SW Gi0/1. ISE wants to quarantine it, but nothing changes.</p>
<p><b>Task 1, reproduce and identify:</b></p>
<pre class="code">ISE&gt; aaa-server coa 10.99.99.1 0050.7966.0201 reauth key NKcoa</pre>
<pre class="out"><span class="hl">CoA rejected by NAS-SW: it has no dynamic-author client for 10.99.99.10</span>

NAS-SW# show logging | include CoA
%RADIUS-3-NOSERVERS: CoA request from 10.99.99.10 dropped: no "aaa server radius dynamic-author" client configured

NAS-SW# show running-config | section dynamic-author
NAS-SW#</pre>
<p>The empty section output confirms it: routing and the RADIUS key are fine (PC1 authenticated through them), but the switch was never told to accept dynamic authorization. The answer is <b>dynamic-author</b>. On real equipment ISE would usually show 11213 (no response), because the switch silently discards CoA from unknown clients.</p>
<p><b>Task 2, fix:</b></p>
<pre class="code">NAS-SW(config)# aaa server radius dynamic-author
NAS-SW(config-locsvr-da-radius)# client 10.99.99.10 server-key NKcoa
NAS-SW(config-locsvr-da-radius)# exit</pre>
<p><b>Task 3, re-send the quarantine CoA:</b> <code>aaa-server authz priya vlan 90</code>, then the same <code>aaa-server coa</code> command. The reply is now <code>CoA-ACK: reauth sent to NAS-SW (10.99.99.1) for 0050.7966.0201</code> and the session moves to VLAN 90. If you had typed a different key, the reply would say the shared server-key does not match: same symptom, different line to fix.</p>

<h3>Applying the workflow to the access lab</h3>
<table class="cmp"><tr><th>Symptom on ACC-SW1</th><th>Likely missing piece</th></tr>
<tr><td>No sessions at all, ports pass traffic</td><td><code>authentication port-control auto</code> (ports still force-authorized)</td></tr>
<tr><td>Ports closed, dot1x never starts</td><td><code>dot1x system-auth-control</code> or <code>dot1x pae authenticator</code></td></tr>
<tr><td>PC1 Authorized but in VLAN 10</td><td><code>aaa authorization network default group radius</code></td></tr>
<tr><td>CAM1 never authorized</td><td><code>mab</code> on the port, or order without mab</td></tr>
<tr><td>GUEST1 stuck unauthorized</td><td><code>authentication event no-response action authorize vlan 50</code></td></tr>
<tr><td>Everything fails, server DEAD</td><td>Wrong key or ISE unreachable from VLAN 99</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> <code>show aaa servers</code> shows host 10.99.99.10 with 40 requests, 40 timeouts, State DEAD. Live Logs is empty for this switch. Two candidates: no route or ACL blocking UDP 1812, or ISE dropping the packets because the device is unknown or the secret is wrong. A ping from the switch to 10.99.99.10 succeeds, and the RADIUS drop report shows 11036 for 10.99.99.1: the secret is wrong. Fix the key on one side and the counters start showing accepts.</p></div>

<div class="warn"><p><b>Common mistake.</b> Running <code>debug radius</code> or <code>debug dot1x all</code> on a busy production switch with hundreds of sessions. Use conditional debugging, a single port, or Live Logs instead, and always turn debugs off with <code>undebug all</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> Live Logs is on the MnT, but the decision was made on a PSN; the details page shows which PSN. A CoA failure appears as a separate Dynamic Authorization event, not as an authentication failure.</p></div>

<div class="scn"><h4>Half the floor in the guest VLAN</h4><p>On Monday half the staff on one floor landed in guest VLAN 50. Switch sessions showed method mab with Local Policies guest VLAN, meaning 802.1X never succeeded. Live Logs showed nothing for those users. The difference: the affected laptops were new and the imaging team had left the wired AutoConfig service disabled. Enabling the service by group policy moved users to VLAN 20 at the next reauthentication.</p><p><b>Lesson:</b> no Live Logs entry plus a fallback on the switch points to the endpoint, not to ISE.</p></div>

<div class="iv"><p class="q">"A user says the network does not work on an 802.1X port. How do you troubleshoot?"</p><p>Strong answer: check the session on the switch first: status, method, methods that ran, and server policies. Then check RADIUS health with show aaa servers and test aaa. Then open ISE Live Logs for the MAC or username and read the policy set, rules, profile and failure reason. If authorized but no access, check enforcement: network authorization, VLAN existence, dACL and device tracking. If a later change does not apply, check CoA configuration. Fix the first broken step and re-test.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work left to right: endpoint, port session, RADIUS path, ISE decision, enforcement, CoA.</li>
<li>show authentication sessions details plus Live Logs details solve most tickets.</li>
<li>Know 11007, 11036, 22056, 24408, 12321, 5411, 15039 and 11213.</li>
<li>No Live Logs entry means the request never reached ISE or was dropped before policy.</li>
<li>CoA ignored = missing dynamic-author client, wrong server-key, wrong port or a firewall.</li>
</ul></div>
`,hi:`
<p>Jab parcel nahi pahunchta, aap order mein check karte ho: sender ne post kiya, courier ne pick kiya, sorting office ne accept kiya, kis van mein gaya, aur ghar ne delivery accept ki. NAC tickets bhi aise hi solve hote hain: request ko endpoint se switch tak, ISE tak, decision ke saath wapas, port par, aur CoA ke liye phir se wapas follow karo. Zyada tar tickets do views ko side by side rakhkar solve hote hain: switch par <code>show authentication sessions</code> aur ISE mein <b>Live Logs</b>.</p>

<h3>Chhe-step workflow</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="NAC troubleshooting steps">
<rect x="5" y="50" width="98" height="56" rx="8" fill="#bbf7d0"/><text x="54" y="74" text-anchor="middle" class="svg-ink" font-size="12">1 Endpoint</text><text x="54" y="92" text-anchor="middle" class="svg-muted" font-size="12">supplicant</text>
<rect x="111" y="50" width="98" height="56" rx="8" fill="#bae6fd"/><text x="160" y="74" text-anchor="middle" class="svg-ink" font-size="12">2 Port</text><text x="160" y="92" text-anchor="middle" class="svg-muted" font-size="12">session</text>
<rect x="217" y="50" width="98" height="56" rx="8" fill="#bae6fd"/><text x="266" y="74" text-anchor="middle" class="svg-ink" font-size="12">3 RADIUS</text><text x="266" y="92" text-anchor="middle" class="svg-muted" font-size="12">path, secret</text>
<rect x="323" y="50" width="98" height="56" rx="8" fill="#ddd6fe"/><text x="372" y="74" text-anchor="middle" class="svg-ink" font-size="12">4 Live Logs</text><text x="372" y="92" text-anchor="middle" class="svg-muted" font-size="12">rules, reason</text>
<rect x="429" y="50" width="98" height="56" rx="8" fill="#fde68a"/><text x="478" y="74" text-anchor="middle" class="svg-ink" font-size="12">5 Enforce</text><text x="478" y="92" text-anchor="middle" class="svg-muted" font-size="12">VLAN, dACL</text>
<rect x="535" y="50" width="98" height="56" rx="8" fill="#fed7aa"/><text x="584" y="74" text-anchor="middle" class="svg-ink" font-size="12">6 CoA</text><text x="584" y="92" text-anchor="middle" class="svg-muted" font-size="12">dynamic-author</text>
<text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="12">pehla unhealthy step dhoondo, fix karo, dobara test karo</text>
</svg><p class="cap">Request ko left se right follow karo; pehla unhealthy step aam taur par root cause hota hai.</p></div>

<ol>
<li><b>Endpoint.</b> Kya supplicant enabled hai aur sahi EAP method ke liye configured hai? Kya woh ISE EAP certificate ko trust karta hai? Kya bina supplicant wala device sach mein traffic bhejta hai taaki MAB uska MAC seekh sake?</li>
<li><b>Port aur session.</b> <code>show authentication sessions interface gX details</code>: Status, Method, kaunse methods chale ("Failed over", "Authc Fail", "Running"), Server ya Local policies. port-control auto, pae, mab, order ke liye <code>show running-config interface</code> check karo.</li>
<li><b>Switch se ISE.</b> <code>show aaa servers</code> (State UP ya DEAD, request aur timeout counters), <code>test aaa group radius</code>, PSN tak routing, source interface, shared secret. ISE side: kya device Network Devices mein hai?</li>
<li><b>ISE decision.</b> Operations &gt; RADIUS &gt; Live Logs. Details icon click karo: policy set, authentication rule, identity store, authorization rule, authorization profile, failure reason aur step list. <b>Live Sessions</b> CoA samet session lifecycle dikhata hai.</li>
<li><b>Enforcement.</b> Accept hua par access nahi? <code>aaa authorization network</code> check karo, ki VLAN exist karta hai, ki dACL source substitution chalta hai (device tracking), ki redirect ACL aur web server configured hain.</li>
<li><b>CoA.</b> Change nahi hota? <code>aaa server radius dynamic-author</code>, har PSN ka client IP, server-key, port 1700 vs 3799, ISE aur NAS ke beech firewalls check karo.</li>
</ol>

<h3>Yaad rakhne layak failure reasons</h3>
<table class="cmp"><tr><th>Code</th><th>Matlab</th><th>Kahan dekho</th></tr>
<tr><td>11007</td><td>Could not locate Network Device or AAA Client</td><td>NAS IP ISE mein nahi, ya galat source interface</td></tr>
<tr><td>11036</td><td>The Message-Authenticator RADIUS attribute is invalid</td><td>Shared secret mismatch</td></tr>
<tr><td>22056</td><td>Subject not found in the applicable identity store(s)</td><td>Anjaan user ya MAC; MAB "User not found" Reject par set</td></tr>
<tr><td>24408</td><td>User authentication against Active Directory failed since user has entered the wrong password</td><td>Credentials</td></tr>
<tr><td>12321</td><td>PEAP failed SSL/TLS handshake because the client rejected the ISE local-certificate</td><td>Client ka EAP certificate par trust</td></tr>
<tr><td>5411</td><td>Supplicant stopped responding to ISE</td><td>Supplicant config, certificate trust, timeouts</td></tr>
<tr><td>15039</td><td>Rejected per authorization profile</td><td>Ek authorization rule ne DenyAccess lautaya</td></tr>
<tr><td>11213</td><td>No response received from Network Access Device after sending a Dynamic Authorization request</td><td>CoA accept nahi hua: dynamic-author client, key, port, firewall</td></tr>
</table>
<p>Event 5200 "Authentication succeeded" hai, 5400 "Authentication failed", 5205 "Dynamic Authorization succeeded" aur 5417 "Dynamic Authorization failed".</p>

<h3>Lab walk: CoA ignore, NAS disconnect drop karta hai</h3>
<p>PC1 (priya) NAS-SW Gi0/1 par VLAN 20 mein authorized hai. ISE use quarantine karna chahta hai, par kuch nahi badalta.</p>
<p><b>Task 1, reproduce karo aur pehchano:</b></p>
<pre class="code">ISE&gt; aaa-server coa 10.99.99.1 0050.7966.0201 reauth key NKcoa</pre>
<pre class="out"><span class="hl">CoA rejected by NAS-SW: it has no dynamic-author client for 10.99.99.10</span>

NAS-SW# show logging | include CoA
%RADIUS-3-NOSERVERS: CoA request from 10.99.99.10 dropped: no "aaa server radius dynamic-author" client configured

NAS-SW# show running-config | section dynamic-author
NAS-SW#</pre>
<p>Khaali section output confirm karta hai: routing aur RADIUS key theek hain (PC1 unhi ke through authenticate hua), par switch ko kabhi dynamic authorization accept karna nahi bataya gaya. Jawab <b>dynamic-author</b> hai. Real equipment par ISE aam taur par 11213 (no response) dikhata, kyunki switch anjaan clients ka CoA chup-chaap discard karta hai.</p>
<p><b>Task 2, fix:</b></p>
<pre class="code">NAS-SW(config)# aaa server radius dynamic-author
NAS-SW(config-locsvr-da-radius)# client 10.99.99.10 server-key NKcoa
NAS-SW(config-locsvr-da-radius)# exit</pre>
<p><b>Task 3, quarantine CoA dobara bhejo:</b> <code>aaa-server authz priya vlan 90</code>, phir wahi <code>aaa-server coa</code> command. Ab reply <code>CoA-ACK: reauth sent to NAS-SW (10.99.99.1) for 0050.7966.0201</code> hai aur session VLAN 90 mein jaata hai. Agar aapne alag key type ki hoti, to reply kehta ki shared server-key match nahi karti: same symptom, fix karne ki alag line.</p>

<h3>Access lab par workflow lagana</h3>
<table class="cmp"><tr><th>ACC-SW1 par symptom</th><th>Sambhavit missing piece</th></tr>
<tr><td>Koi sessions nahi, ports traffic pass karte hain</td><td><code>authentication port-control auto</code> (ports abhi bhi force-authorized)</td></tr>
<tr><td>Ports band, dot1x kabhi shuru nahi hota</td><td><code>dot1x system-auth-control</code> ya <code>dot1x pae authenticator</code></td></tr>
<tr><td>PC1 Authorized par VLAN 10 mein</td><td><code>aaa authorization network default group radius</code></td></tr>
<tr><td>CAM1 kabhi authorized nahi</td><td>Port par <code>mab</code>, ya order mein mab nahi</td></tr>
<tr><td>GUEST1 unauthorized atka</td><td><code>authentication event no-response action authorize vlan 50</code></td></tr>
<tr><td>Sab fail, server DEAD</td><td>Galat key ya VLAN 99 se ISE unreachable</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> <code>show aaa servers</code> host 10.99.99.10 ko 40 requests, 40 timeouts, State DEAD ke saath dikhata hai. Is switch ke liye Live Logs khaali hai. Do candidates: koi route nahi ya ACL UDP 1812 block kar raha hai, ya ISE packets drop kar raha hai kyunki device anjaan hai ya secret galat. Switch se 10.99.99.10 ka ping succeed hota hai, aur RADIUS drop report 10.99.99.1 ke liye 11036 dikhati hai: secret galat hai. Ek side par key theek karo aur counters accepts dikhane lagte hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Sainkdon sessions wale busy production switch par <code>debug radius</code> ya <code>debug dot1x all</code> chalana. Conditional debugging, ek single port, ya Live Logs use karo, aur debugs hamesha <code>undebug all</code> se band karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Live Logs MnT par hai, par decision ek PSN par hua; details page dikhata hai kaunsa PSN. CoA failure ek alag Dynamic Authorization event ki tarah dikhta hai, authentication failure ki tarah nahi.</p></div>

<div class="scn"><h4>Aadha floor guest VLAN mein</h4><p>Monday ko ek floor ka aadha staff guest VLAN 50 mein pahuncha. Switch sessions mein method mab aur Local Policies guest VLAN tha, matlab 802.1X kabhi succeed hi nahi hua. Un users ke liye Live Logs mein kuch nahi tha. Fark: affected laptops naye the aur imaging team ne wired AutoConfig service disabled chhod di thi. Group policy se service enable karne par agle reauthentication par users VLAN 20 mein chale gaye.</p><p><b>Seekh:</b> koi Live Logs entry nahi plus switch par fallback endpoint ki taraf ishara karta hai, ISE ki taraf nahi.</p></div>

<div class="iv"><p class="q">"User kehta hai 802.1X port par network kaam nahi karta. Kaise troubleshoot karoge?"</p><p>Strong answer: pehle switch par session check karo: status, method, kaunse methods chale, aur server policies. Phir show aaa servers aur test aaa se RADIUS health check karo. Phir MAC ya username ke liye ISE Live Logs kholo aur policy set, rules, profile aur failure reason padho. Agar authorized hai par access nahi, to enforcement check karo: network authorization, VLAN existence, dACL aur device tracking. Agar baad ka change apply nahi hota, CoA configuration check karo. Pehla toota step fix karo aur dobara test karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Left se right kaam karo: endpoint, port session, RADIUS path, ISE decision, enforcement, CoA.</li>
<li>show authentication sessions details plus Live Logs details zyada tar tickets solve karte hain.</li>
<li>11007, 11036, 22056, 24408, 12321, 5411, 15039 aur 11213 yaad rakho.</li>
<li>Koi Live Logs entry nahi ka matlab request ISE tak pahunchi hi nahi ya policy se pehle drop hui.</li>
<li>CoA ignore = missing dynamic-author client, galat server-key, galat port ya firewall.</li>
</ul></div>
`}};export{e as default};