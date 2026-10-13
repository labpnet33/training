var e={id:`lab-capstone`,h:{en:`Capstone: three defects after a weekend change (wl-capstone-incident)`,hi:`Capstone: weekend change ke baad teen defects (wl-capstone-incident)`},body:{en:`
<p>Real incidents rarely have one cause. After a weekend change several things may be wrong at the same time, and fixing one can hide another. The capstone lab trains exactly this: separate the defects, fix each on the object that owns it and prove every user group.</p>
<div class="eg"><p><b>Ticket.</b> Monday morning. After a weekend change, staff near AP2 cannot find NK-STAFF and corporate users cannot authenticate. Three separate defects exist across tags, policy profiles and RADIUS. Triage with evidence, fix each defect on the object that owns it and prove both user groups (the staff laptop uses AP2 in VLAN 20; the corporate laptop is in VLAN 40).</p></div>
<h3>Step 1: build a defect list from evidence</h3>
<p>Two symptoms, two scopes. "Staff near AP2" is one AP, so the AP layer (tags, radios). "Corporate users" is one SSID, so WLC policy or AAA. Do not fix anything until the read-only outputs are in the ticket.</p>
<pre class="code">WLC1# show ap tag summary
WLC1# show wireless profile policy summary
WLC1# show logging
WLC1# show aaa servers</pre>
<pre class="out">WLC1# show ap tag summary
AP Name             AP Mac          Site Tag Name         Policy Tag Name       RF Tag Name         Misconfigured  Tag Source
AP1                 0050.42a6.9801  default-site-tag      PT-CAMPUS             default-rf-tag      No             Static
AP2                 0050.43a6.9a01  default-site-tag      <span class="hl">default-policy-tag</span>    default-rf-tag      No             <span class="hl">Default</span>

WLC1# show wireless profile policy summary
Profile Name                       Description
------------------------------------------------------------
PP-CORP
PP-STAFF
default-policy-profile             default policy profile

WLC1# show wireless profile policy detailed PP-CORP
Status                           : <span class="hl">DISABLED</span>
VLAN                             : 40

WLC1# show logging
Syslog logging: enabled
<span class="hl">(no RADIUS entries yet: nobody can see NK-CORP)</span>

WLC1# show aaa servers
RADIUS: id RAD1, host 10.10.60.20, auth-port 1812, requests <span class="hl">0</span>, timeouts <span class="hl">0</span>

After defect 2 is fixed and LAPTOP2 retries:
WLC1# show logging
%DOT1X-3-SERVER_TIMEOUT: Client 00:50:32:e9:9f:01 on WLAN 2 (NK-CORP): <span class="hl">RADIUS server not responding</span> (check address, port and shared secret)
WLC1# show aaa servers
RADIUS: id RAD1, host 10.10.60.20, auth-port 1812, requests 0, timeouts <span class="hl">2</span></pre>
<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Defect map">
<rect x="10" y="20" width="190" height="80" rx="8" fill="#bae6fd"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="13">Defect 1: AP layer</text><text x="105" y="65" text-anchor="middle" class="svg-muted" font-size="11">AP2 has no policy tag</text><text x="105" y="82" text-anchor="middle" class="svg-muted" font-size="11">fix: ap name AP2 policy-tag</text>
<rect x="225" y="20" width="190" height="80" rx="8" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Defect 2: WLC layer</text><text x="320" y="65" text-anchor="middle" class="svg-muted" font-size="11">PP-CORP is DISABLED</text><text x="320" y="82" text-anchor="middle" class="svg-muted" font-size="11">fix: no shutdown</text>
<rect x="440" y="20" width="190" height="80" rx="8" fill="#fed7aa"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="13">Defect 3: AAA layer</text><text x="535" y="65" text-anchor="middle" class="svg-muted" font-size="11">RAD1 secret mismatch</text><text x="535" y="82" text-anchor="middle" class="svg-muted" font-size="11">fix: key 0 NkRadius1</text>
<text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Each defect has its own owner object. Fix each once, verify each once.</text>
</svg><p class="cap">Three defects, three layers, three owners.</p></div>
<h3>Step 2: read each finding carefully</h3>
<ul>
<li><b>AP2 Tag Source Default</b> explains why staff near AP2 find nothing: AP2 uses <code>default-policy-tag</code>, which maps no WLANs.</li>
<li><b>PP-CORP DISABLED</b> means NK-CORP is not broadcast even by APs that have PT-CAMPUS, so corporate users cannot even attempt authentication. The policy profile for staff is fine.</li>
<li><b>Requests 0, timeouts 0</b> now means nobody has tried yet (NK-CORP is not visible). After you enable PP-CORP and LAPTOP2 retries, the log shows SERVER_TIMEOUT and the timeouts counter rises while requests stay 0: the controller sends packets but never gets a valid reply. The address and ports are right, so the shared secret mismatch after the RADIUS rebuild is the likely cause.</li>
</ul>
<p>Notice the dependency between defects 2 and 3. Until PP-CORP is enabled, no corporate client reaches RADIUS, so the timeout counters might not appear at all. Once defect 2 is fixed, defect 3 becomes visible. This "hidden second fault" is why you verify after every fix instead of declaring victory.</p>
<h3>Step 3: fix each on its owner</h3>
<pre class="code">WLC1# ap name AP2 policy-tag PT-CAMPUS
WLC1# configure terminal
WLC1(config)# wireless profile policy PP-CORP
WLC1(config-wireless-policy)# no shutdown
WLC1(config-wireless-policy)# exit
WLC1(config)# radius server RAD1
WLC1(config-radius-server)# key 0 NkRadius1
WLC1(config-radius-server)# end
WLC1# write memory</pre>
<p>We do not touch the WLAN NK-CORP, the method list NK-DOT1X, the server group RG-NK or the VLANs: they were not on the evidence list. The RADIUS key is edited on the controller side only here; in real life the secret must match on the RAD1 server too, and the server owner should confirm.</p>
<h3>Step 4: prove both groups</h3>
<pre class="code">LAPTOP1&gt; wifi status
LAPTOP2&gt; wifi connect NK-CORP user alice password NkWifi@2024
LAPTOP2&gt; wifi status
WLC1# show aaa servers</pre>
<pre class="out">LAPTOP1&gt; wifi status
SSID        : NK-STAFF
AP          : <span class="hl">AP2</span>
Security    : WPA2-Personal (PSK)
IP address  : <span class="hl">10.10.20.11/24</span> (DHCP)

LAPTOP2&gt; wifi status
SSID        : NK-CORP
AP          : AP1
Security    : WPA2-Enterprise (user alice)
IP address  : <span class="hl">10.10.40.11/24</span> (DHCP)

WLC1# show aaa servers
RADIUS: id RAD1, host 10.10.60.20, auth-port 1812, requests 1, timeouts 2</pre>
<p>The staff laptop uses AP2 in VLAN 20 and alice is in VLAN 40. The requests counter moved by one while timeouts did not: a successful exchange. Negative test: a wrong password must still be rejected (<code>%DOT1X-4-AUTH_REJECT</code>), which proves the server is really authenticating and not accepting everything.</p>
<h3>Reporting the incident</h3>
<table class="cmp"><tr><th>Field</th><th>Example entry</th></tr>
<tr><td>Impact</td><td>Staff near AP2 and all NK-CORP users, Monday 08:00 to 08:40</td></tr>
<tr><td>Root causes</td><td>AP2 policy tag assignment lost; PP-CORP left shut; RADIUS shared secret mismatch</td></tr>
<tr><td>Fixes</td><td>One command per cause; saved with write memory</td></tr>
<tr><td>Prevention</td><td>Change checklist: read back tags, Status and server counters after every window</td></tr>
</table>
<div class="warn"><p><b>Common mistakes.</b> (1) Stopping after the first fix because one group works. (2) Re-creating NK-CORP and its AAA objects "to be safe", which can break working parts. (3) Changing the secret on the wrong side only and not telling the RADIUS owner. (4) Skipping the wrong-password test.</p></div>
<div class="exam"><p><b>Exam trap.</b> Timeouts in <code>show aaa servers</code> with correct server address point to the shared secret or reachability, whereas a reject in the log means the server answered and refused the user.</p></div>
<div class="scn"><h4>Monday after the migration</h4><p>A university moved RADIUS to a new server over the weekend and also re-tagged several APs. By 08:00 the helpdesk had sixty tickets from two very different groups. A senior engineer split them into "one corner" and "corporate SSID", collected the four outputs above, and opened three tasks for three owners within ten minutes. All three fixes were single commands; the incident review focused on a missing checklist, not on a missing skill.</p><p><b>Lesson:</b> separate symptoms, assign each defect an owner and verify after each fix.</p></div>
<div class="iv"><p class="q">"You have several simultaneous failures after a change. How do you proceed?"</p><p>Group symptoms by scope, collect read-only evidence per layer, list distinct defects, fix the one that unblocks the others first or in parallel with owners, verify after each, run negative and regression tests, save, and write the incident record.</p></div>
<div class="tip"><p><b>Doing it in the web UI.</b> Evidence: <b>Monitoring &gt; Wireless &gt; Access Points</b>, <b>Configuration &gt; Tags &amp; Profiles &gt; Policy</b> and <b>Troubleshooting &gt; Logs</b>. Fixes: AP tag in <b>Configuration &gt; Wireless &gt; Access Points</b>, tab <b>Tags</b>; policy profile <b>Status</b> in <b>Configuration &gt; Tags &amp; Profiles &gt; Policy</b>; the RADIUS server and key in <b>Configuration &gt; Security &gt; AAA &gt; Servers</b> (the secret on RAD1 itself is server CLI). Proof: <b>Monitoring &gt; Wireless &gt; Clients</b>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Capstone defects: AP2 untagged, PP-CORP disabled, RADIUS secret wrong.</li>
<li>Scope separates one corner from one SSID.</li>
<li>One defect can hide another; verify after every fix.</li>
<li>Fix each defect on its own owner object only.</li>
<li>Prove both groups, run a wrong-password test and save.</li>
</ul></div>
`,hi:`
<p>Real incidents mein shayad hi kabhi ek cause hota hai. Weekend change ke baad kai cheezein ek saath galat ho sakti hain, aur ek fix doosre ko chhupa sakta hai. Capstone lab yahi sikhata hai: defects ko alag karo, har ek ko uske owner object par fix karo aur har user group prove karo.</p>
<div class="eg"><p><b>Ticket.</b> Monday subah. Weekend change ke baad AP2 ke paas staff ko NK-STAFF nahi dikhta aur corporate users authenticate nahi kar paate. Tags, policy profiles aur RADIUS mein teen alag defects hain. Evidence ke saath triage karo, har defect uske owner object par fix karo aur dono user groups prove karo (staff laptop AP2 par VLAN 20 mein; corporate laptop VLAN 40 mein).</p></div>
<h3>Step 1: evidence se defect list banao</h3>
<p>Do symptoms, do scopes. "AP2 ke paas staff" ek AP hai, isliye AP layer (tags, radios). "Corporate users" ek SSID hai, isliye WLC policy ya AAA. Jab tak read-only outputs ticket mein na aa jayein, kuch fix mat karo.</p>
<pre class="code">WLC1# show ap tag summary
WLC1# show wireless profile policy summary
WLC1# show logging
WLC1# show aaa servers</pre>
<pre class="out">WLC1# show ap tag summary
AP Name             AP Mac          Site Tag Name         Policy Tag Name       RF Tag Name         Misconfigured  Tag Source
AP1                 0050.42a6.9801  default-site-tag      PT-CAMPUS             default-rf-tag      No             Static
AP2                 0050.43a6.9a01  default-site-tag      <span class="hl">default-policy-tag</span>    default-rf-tag      No             <span class="hl">Default</span>

WLC1# show wireless profile policy summary
Profile Name                       Description
------------------------------------------------------------
PP-CORP
PP-STAFF
default-policy-profile             default policy profile

WLC1# show wireless profile policy detailed PP-CORP
Status                           : <span class="hl">DISABLED</span>
VLAN                             : 40

WLC1# show logging
Syslog logging: enabled
<span class="hl">(no RADIUS entries yet: nobody can see NK-CORP)</span>

WLC1# show aaa servers
RADIUS: id RAD1, host 10.10.60.20, auth-port 1812, requests <span class="hl">0</span>, timeouts <span class="hl">0</span>

After defect 2 is fixed and LAPTOP2 retries:
WLC1# show logging
%DOT1X-3-SERVER_TIMEOUT: Client 00:50:32:e9:9f:01 on WLAN 2 (NK-CORP): <span class="hl">RADIUS server not responding</span> (check address, port and shared secret)
WLC1# show aaa servers
RADIUS: id RAD1, host 10.10.60.20, auth-port 1812, requests 0, timeouts <span class="hl">2</span></pre>
<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Defect map">
<rect x="10" y="20" width="190" height="80" rx="8" fill="#bae6fd"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="13">Defect 1: AP layer</text><text x="105" y="65" text-anchor="middle" class="svg-muted" font-size="11">AP2 ka policy tag nahi</text><text x="105" y="82" text-anchor="middle" class="svg-muted" font-size="11">fix: ap name AP2 policy-tag</text>
<rect x="225" y="20" width="190" height="80" rx="8" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Defect 2: WLC layer</text><text x="320" y="65" text-anchor="middle" class="svg-muted" font-size="11">PP-CORP DISABLED</text><text x="320" y="82" text-anchor="middle" class="svg-muted" font-size="11">fix: no shutdown</text>
<rect x="440" y="20" width="190" height="80" rx="8" fill="#fed7aa"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="13">Defect 3: AAA layer</text><text x="535" y="65" text-anchor="middle" class="svg-muted" font-size="11">RAD1 secret mismatch</text><text x="535" y="82" text-anchor="middle" class="svg-muted" font-size="11">fix: key 0 NkRadius1</text>
<text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Har defect ka apna owner object hai. Har ek ko ek baar fix, ek baar verify.</text>
</svg><p class="cap">Teen defects, teen layers, teen owners.</p></div>
<h3>Step 2: har finding ko dhyan se padho</h3>
<ul>
<li><b>AP2 Tag Source Default</b> samjhata hai ki AP2 ke paas staff ko kuch kyun nahi milta: AP2 <code>default-policy-tag</code> use karta hai jo koi WLAN map nahi karta.</li>
<li><b>PP-CORP DISABLED</b> ka matlab NK-CORP un APs se bhi broadcast nahi hota jinke paas PT-CAMPUS hai, isliye corporate users authentication try bhi nahi kar sakte. Staff ka policy profile theek hai.</li>
<li><b>Requests 0, timeouts 0</b> abhi ka matlab hai ki kisi ne try hi nahi kiya (NK-CORP dikhta nahi). PP-CORP enable karke LAPTOP2 retry karne par log mein SERVER_TIMEOUT aata hai aur timeouts badhte hain jabki requests 0 rehte hain: controller packets bhejta hai lekin valid reply nahi aata. Address aur ports sahi hain, isliye RADIUS rebuild ke baad shared secret mismatch sabse likely cause hai.</li>
</ul>
<p>Defects 2 aur 3 ke beech dependency dekho. Jab tak PP-CORP enabled nahi, koi corporate client RADIUS tak nahi pahunchta, isliye timeout counters shayad dikhein hi nahi. Defect 2 fix hone ke baad defect 3 dikhta hai. Yeh "chhupa doosra fault" isliye hai ki har fix ke baad verify karte ho, jeet declare nahi karte.</p>
<h3>Step 3: har ek ko uske owner par fix karo</h3>
<pre class="code">WLC1# ap name AP2 policy-tag PT-CAMPUS
WLC1# configure terminal
WLC1(config)# wireless profile policy PP-CORP
WLC1(config-wireless-policy)# no shutdown
WLC1(config-wireless-policy)# exit
WLC1(config)# radius server RAD1
WLC1(config-radius-server)# key 0 NkRadius1
WLC1(config-radius-server)# end
WLC1# write memory</pre>
<p>Hum WLAN NK-CORP, method list NK-DOT1X, server group RG-NK ya VLANs ko nahi chhute: woh evidence list mein nahi the. Yahan RADIUS key sirf controller side par edit hui; real life mein secret RAD1 server par bhi match karna chahiye, aur server owner ko confirm karna chahiye.</p>
<h3>Step 4: dono groups prove karo</h3>
<pre class="code">LAPTOP1&gt; wifi status
LAPTOP2&gt; wifi connect NK-CORP user alice password NkWifi@2024
LAPTOP2&gt; wifi status
WLC1# show aaa servers</pre>
<pre class="out">LAPTOP1&gt; wifi status
SSID        : NK-STAFF
AP          : <span class="hl">AP2</span>
Security    : WPA2-Personal (PSK)
IP address  : <span class="hl">10.10.20.11/24</span> (DHCP)

LAPTOP2&gt; wifi status
SSID        : NK-CORP
AP          : AP1
Security    : WPA2-Enterprise (user alice)
IP address  : <span class="hl">10.10.40.11/24</span> (DHCP)

WLC1# show aaa servers
RADIUS: id RAD1, host 10.10.60.20, auth-port 1812, requests 1, timeouts 2</pre>
<p>Staff laptop AP2 par VLAN 20 mein hai aur alice VLAN 40 mein. Requests counter ek se badha lekin timeouts nahi: successful exchange. Negative test: galat password ab bhi reject hona chahiye (<code>%DOT1X-4-AUTH_REJECT</code>), jo prove karta hai ki server sach mein authenticate kar raha hai, sab kuch accept nahi kar raha.</p>
<h3>Incident report</h3>
<table class="cmp"><tr><th>Field</th><th>Example entry</th></tr>
<tr><td>Impact</td><td>AP2 ke paas staff aur saare NK-CORP users, Monday 08:00 se 08:40</td></tr>
<tr><td>Root causes</td><td>AP2 policy tag assignment gaya; PP-CORP shut chhoda; RADIUS shared secret mismatch</td></tr>
<tr><td>Fixes</td><td>Har cause ke liye ek command; write memory se saved</td></tr>
<tr><td>Prevention</td><td>Change checklist: har window ke baad tags, Status aur server counters wapas padho</td></tr>
</table>
<div class="warn"><p><b>Common mistakes.</b> (1) Pehle fix ke baad ruk jaana kyunki ek group chalta hai. (2) "Safe rehne ke liye" NK-CORP aur uske AAA objects recreate karna, jo working parts tod sakta hai. (3) Secret sirf ek side badalna aur RADIUS owner ko na batana. (4) Wrong-password test chhod dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>show aaa servers</code> mein sahi server address ke saath timeouts shared secret ya reachability ki taraf point karte hain, jabki log mein reject ka matlab server ne jawab diya aur user ko mana kiya.</p></div>
<div class="scn"><h4>Migration ke baad Monday</h4><p>Ek university ne weekend mein RADIUS naye server par move kiya aur kai APs ko re-tag bhi kiya. 08:00 tak helpdesk ke paas do bahut alag groups ke saath saath tickets the. Senior engineer ne unhe "ek corner" aur "corporate SSID" mein baanta, upar ke chaar outputs collect kiye aur das minute mein teen owners ke liye teen tasks khole. Teeno fixes single commands the; incident review checklist ki kami par tha, skill ki kami par nahi.</p><p><b>Seekh:</b> symptoms alag karo, har defect ko owner do aur har fix ke baad verify karo.</p></div>
<div class="iv"><p class="q">"Change ke baad kai failures ek saath hain. Kaise aage badhte ho?"</p><p>Symptoms ko scope se group karo, har layer ka read-only evidence lo, alag defects list karo, jo baaki ko unblock kare use pehle ya owners ke saath parallel fix karo, har fix ke baad verify karo, negative aur regression tests chalao, save karo, aur incident record likho.</p></div>
<div class="tip"><p><b>Web UI mein kaise karein.</b> Evidence: <b>Monitoring &gt; Wireless &gt; Access Points</b>, <b>Configuration &gt; Tags &amp; Profiles &gt; Policy</b> aur <b>Troubleshooting &gt; Logs</b>. Fixes: AP tag <b>Configuration &gt; Wireless &gt; Access Points</b> mein, tab <b>Tags</b>; policy profile <b>Status</b> <b>Configuration &gt; Tags &amp; Profiles &gt; Policy</b> mein; RADIUS server aur key <b>Configuration &gt; Security &gt; AAA &gt; Servers</b> mein (RAD1 par secret server CLI hai). Proof: <b>Monitoring &gt; Wireless &gt; Clients</b>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Capstone defects: AP2 untagged, PP-CORP disabled, RADIUS secret galat.</li>
<li>Scope ek corner ko ek SSID se alag karta hai.</li>
<li>Ek defect doosre ko chhupa sakta hai; har fix ke baad verify karo.</li>
<li>Har defect sirf apne owner object par fix karo.</li>
<li>Dono groups prove karo, wrong-password test chalao aur save karo.</li>
</ul></div>
`}};export{e as default};