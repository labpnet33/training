var e={id:`troubleshooting`,h:{en:`Troubleshooting WLAN security: workflow and the RADIUS key lab (wl-radius-key)`,hi:`WLAN security troubleshooting: workflow aur RADIUS key lab (wl-radius-key)`},body:{en:`
<p>Security faults look the same to users: "I cannot connect". Your job is to turn that into one named broken object with evidence. This chapter gives a repeatable workflow, a symptom table, and a full walkthrough of the lab <code>wl-radius-key</code>.</p>

<h3>The workflow: ask in the same order the client does</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Troubleshooting flow">
<rect x="20" y="15" width="600" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="39" text-anchor="middle" class="svg-ink" font-size="12">1. Does the client see the SSID? (WLAN up, policy tag, AP tag)  - no: not a security fault</text>
<rect x="20" y="62" width="600" height="38" rx="8" fill="#fde68a"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="12">2. Which kind of SSID? PSK: key typed right? 802.1X: go to step 3</text>
<rect x="20" y="109" width="600" height="38" rx="8" fill="#bae6fd"/><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="12">3. Did the controller get any answer? show aaa servers: requests or timeouts?</text>
<rect x="20" y="156" width="600" height="38" rx="8" fill="#fed7aa"/><text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="12">4. Read show logging: timeout? reject? no server? bad PSK?</text>
<rect x="20" y="203" width="600" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="227" text-anchor="middle" class="svg-ink" font-size="12">5. Repair ONE object, then prove with a client (and negative test)</text>
</svg><p class="cap">Evidence first: counters and log lines tell you which object owns the problem.</p></div>

<h3>Symptom to cause table</h3>
<table class="cmp"><tr><th>What you see</th><th>Meaning</th><th>Where to fix</th></tr>
<tr><td>Client: "RADIUS server did not respond"; timeouts rising, requests flat</td><td>Server silent: wrong secret, unknown NAS, unreachable, wrong port</td><td>Radius server key, address, route</td></tr>
<tr><td>Client: "RADIUS Access-Reject"; requests rising</td><td>Server answered: bad credentials or policy</td><td>User account on the server</td></tr>
<tr><td>Client: "no RADIUS server configured for the WLAN"</td><td>Chain broken: missing aaa new-model, method list or group</td><td>AAA objects on the controller</td></tr>
<tr><td>Client: "4-way handshake timeout - the passphrase does not match"</td><td>PSK wrong</td><td>Client saved key, or WLAN key</td></tr>
<tr><td>Config command refused: cannot modify while enabled</td><td>Shut-before-edit rule</td><td>shutdown the WLAN first</td></tr>
<tr><td>Everyone fails together, no failed logins in the server log</td><td>Certificate or TLS (concept only)</td><td>Server certificate</td></tr></table>

<h3>Lab walkthrough: wl-radius-key</h3>
<p>NK-CORP worked until RAD1 was rebuilt. Now alice cannot join and the helpdesk sees no Access-Accept. The AAA lists are complete (the server group and method list exist). The task says to collect evidence, repair the shared secret on RAD1 only, and prove alice reaches VLAN 40. The correct secret is NkRadius1.</p>

<p><b>Step 1: reproduce.</b></p>
<pre class="out">LAPTOP1&gt; wifi connect NK-CORP user alice password NkWifi@2024
<span class="hl">Authentication failed: RADIUS server did not respond.</span></pre>
<p>This is not "Access-Reject". If the password were wrong, the server would have said so. "Did not respond" means the request never produced a usable answer.</p>

<p><b>Step 2: read the counters.</b></p>
<pre class="out">WLC1# show aaa servers
RADIUS: id RAD1, host 10.10.60.20, auth-port 1812, requests 0, <span class="hl">timeouts 3</span></pre>
<p>Requests that were answered stay at 0. Timeouts grow with every attempt. The controller is sending and nothing valid comes back.</p>

<p><b>Step 3: read the log.</b></p>
<pre class="out">WLC1# show logging
<span class="hl">%DOT1X-3-SERVER_TIMEOUT: Client 0050.7966.6801 on WLAN 2 (NK-CORP): RADIUS server not responding (check address, port and shared secret)</span></pre>
<p>The log itself suggests three candidates: address, port, shared secret. Eliminate quickly:</p>
<ul>
<li><b>Address:</b> <code>ping 10.10.60.20</code> succeeds (and NK-STAFF clients reach RAD1), so routing is fine.</li>
<li><b>Port:</b> <code>show aaa servers</code> shows auth-port 1812, correct.</li>
<li><b>Shared secret:</b> RAD1 was rebuilt, and a rebuild is exactly when someone enters a new secret. This is the remaining suspect.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Key mismatch">
<rect x="30" y="40" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="105" y="68" text-anchor="middle" class="svg-ink" font-size="12">WLC1</text><text x="105" y="86" text-anchor="middle" class="svg-muted" font-size="11">key: wrong value</text>
<rect x="460" y="40" width="150" height="60" rx="10" fill="#ddd6fe"/><text x="535" y="68" text-anchor="middle" class="svg-ink" font-size="12">RAD1 server</text><text x="535" y="86" text-anchor="middle" class="svg-muted" font-size="11">expects NkRadius1</text>
<line x1="180" y1="70" x2="460" y2="70" stroke="#64748b"/>
<text x="320" y="62" text-anchor="middle" class="svg-accent" font-size="12">Access-Request (signed with wrong key)</text>
<text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="12">Server cannot verify it: drops it, sends nothing back</text>
<text x="320" y="147" text-anchor="middle" class="svg-muted" font-size="12">Controller waits, then counts a timeout</text>
</svg><p class="cap">No reply, no reject: that silence is the signature of a key mismatch.</p></div>

<p><b>Step 4: repair only the broken object.</b> The secret lives in the RADIUS server definition on the controller, named RAD1. Re-enter it:</p>
<pre class="code">WLC1# configure terminal
WLC1(config)# radius server RAD1
WLC1(config-radius-server)# key 0 NkRadius1
WLC1(config-radius-server)# end
WLC1# write memory</pre>
<p>Do <b>not</b> touch the WLAN, the policy profile, the method list or the group. They are fine, and unnecessary changes make the next fault harder to find. Also note that the key command on a radius server does not need a shutdown, unlike a WLAN security edit.</p>

<p><b>Step 5: prove it.</b></p>
<pre class="out">LAPTOP1&gt; wifi connect NK-CORP user alice password NkWifi@2024
LAPTOP1&gt; wifi status
SSID: NK-CORP   State: <span class="hl">Associated</span>   VLAN 40
LAPTOP1&gt; ping 10.10.60.20
!!!!!   Success rate is 100 percent (5/5)

WLC1# show aaa servers
RADIUS: id RAD1, host 10.10.60.20, auth-port 1812, <span class="hl">requests 1</span>, timeouts 3</pre>
<p>Requests now count up. The old timeouts stay as history, which is normal; what matters is that new attempts get answers.</p>

<h3>Other common faults and their fixes</h3>
<ul>
<li><b>Missing aaa new-model:</b> the controller refuses AAA objects, or the WLAN has no list. Enable <code>aaa new-model</code>, then recheck the chain.</li>
<li><b>Missing or misnamed method list:</b> the WLAN refers to a list that does not exist. Compare <code>security dot1x authentication-list</code> with <code>aaa authentication dot1x</code> names.</li>
<li><b>Server name missing from the group:</b> group RG-NK shows no servers. Add <code>server name RAD1</code>.</li>
<li><b>Editing an enabled WLAN:</b> refused. Shut, edit, enable.</li>
<li><b>Wrong PSK on a client:</b> the log shows a PSK failure with the MIC check; fix the saved key, not the WLAN.</li>
</ul>
<div class="warn"><p><b>Common mistake.</b> Changing the WLAN key or recreating the WLAN when 802.1X users fail. 802.1X has no PSK; the fault is in AAA, the server, the secret or the user.</p></div>
<div class="exam"><p><b>Exam trap.</b> Timeouts mean the server did not answer (secret, address, firewall, NAS entry). Rejects mean the server answered and said no. Do not mix them up.</p></div>

<div class="scn"><h4>The rebuilt server and the typo</h4><p>A RADIUS appliance was replaced on a Saturday. The administrator typed the shared secret with a capital I instead of lowercase l. Monday morning the controller counted hundreds of timeouts and no rejects. Because the engineer read the counters first, he did not touch the WLAN. Retyping the secret on the server and testing with one laptop restored service in ten minutes.</p><p><b>Lesson:</b> read counters and logs first, and distinguish timeouts from rejects.</p></div>
<div class="iv"><p class="q">"Users cannot authenticate on the corporate SSID. How do you troubleshoot?"</p><p>Check that the SSID is visible, then show aaa servers for timeouts versus requests, then the log. Timeouts: verify address and route, port, the shared secret on both ends and the NAS entry. Rejects: check the user account and policy. Repair one object and prove with a client including a negative test.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work from client symptom to counters to log, then fix one object.</li>
<li>Timeouts with no requests answered point to the secret, address or reachability.</li>
<li>A key mismatch produces silence, not a reject.</li>
<li>Repair the secret in <code>radius server RAD1</code>; leave AAA lists and WLAN alone.</li>
<li>Always prove the fix with a client and review the counters.</li>
</ul></div>
`,hi:`
<p>Security faults users ko ek jaise dikhte hain: "Mujhse connect nahi ho raha". Aapka kaam ise ek named broken object mein evidence ke saath badalna hai. Yeh chapter repeatable workflow, symptom table aur lab <code>wl-radius-key</code> ka poora walkthrough deta hai.</p>

<h3>Workflow: usi order mein pucho jis order mein client karta hai</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Troubleshooting flow">
<rect x="20" y="15" width="600" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="39" text-anchor="middle" class="svg-ink" font-size="12">1. Client ko SSID dikhta hai? (WLAN up, policy tag, AP tag)  - nahi: security fault nahi</text>
<rect x="20" y="62" width="600" height="38" rx="8" fill="#fde68a"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="12">2. Kaunsa SSID? PSK: key sahi type ki? 802.1X: step 3</text>
<rect x="20" y="109" width="600" height="38" rx="8" fill="#bae6fd"/><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="12">3. Controller ko koi jawab mila? show aaa servers: requests ya timeouts?</text>
<rect x="20" y="156" width="600" height="38" rx="8" fill="#fed7aa"/><text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="12">4. show logging padho: timeout? reject? no server? bad PSK?</text>
<rect x="20" y="203" width="600" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="227" text-anchor="middle" class="svg-ink" font-size="12">5. EK object repair karo, phir client se prove karo (negative test bhi)</text>
</svg><p class="cap">Pehle evidence: counters aur log lines batate hain ki problem kis object ki hai.</p></div>

<h3>Symptom se cause table</h3>
<table class="cmp"><tr><th>Aap kya dekhte ho</th><th>Matlab</th><th>Fix kahan</th></tr>
<tr><td>Client: "RADIUS server did not respond"; timeouts badh rahe, requests flat</td><td>Server chup: galat secret, unknown NAS, unreachable, galat port</td><td>Radius server key, address, route</td></tr>
<tr><td>Client: "RADIUS Access-Reject"; requests badh rahi</td><td>Server ne jawab diya: bad credentials ya policy</td><td>Server par user account</td></tr>
<tr><td>Client: "no RADIUS server configured for the WLAN"</td><td>Chain toot gayi: aaa new-model, method list ya group missing</td><td>Controller par AAA objects</td></tr>
<tr><td>Client: "4-way handshake timeout - the passphrase does not match"</td><td>PSK galat</td><td>Client ki saved key, ya WLAN key</td></tr>
<tr><td>Config command refuse: enabled hone par modify nahi</td><td>Shut-before-edit rule</td><td>Pehle WLAN shutdown</td></tr>
<tr><td>Sab ek saath fail, server log mein failed logins nahi</td><td>Certificate ya TLS (concept only)</td><td>Server certificate</td></tr></table>

<h3>Lab walkthrough: wl-radius-key</h3>
<p>NK-CORP tab tak chala jab tak RAD1 rebuild nahi hua. Ab alice join nahi kar sakti aur helpdesk ko Access-Accept nahi dikhta. AAA lists complete hain (server group aur method list exist karte hain). Task kehta hai evidence collect karo, shared secret sirf RAD1 par repair karo, aur prove karo alice VLAN 40 tak pahunchti hai. Sahi secret NkRadius1 hai.</p>

<p><b>Step 1: reproduce karo.</b></p>
<pre class="out">LAPTOP1&gt; wifi connect NK-CORP user alice password NkWifi@2024
<span class="hl">Authentication failed: RADIUS server did not respond.</span></pre>
<p>Yeh "Access-Reject" nahi hai. Password galat hota to server bata deta. "Did not respond" ka matlab request ne koi usable jawab produce hi nahi kiya.</p>

<p><b>Step 2: counters padho.</b></p>
<pre class="out">WLC1# show aaa servers
RADIUS: id RAD1, host 10.10.60.20, auth-port 1812, requests 0, <span class="hl">timeouts 3</span></pre>
<p>Jin requests ka jawab mila woh 0 par hain. Har attempt ke saath timeouts badhte hain. Controller bhej raha hai aur kuch valid wapas nahi aa raha.</p>

<p><b>Step 3: log padho.</b></p>
<pre class="out">WLC1# show logging
<span class="hl">%DOT1X-3-SERVER_TIMEOUT: Client 0050.7966.6801 on WLAN 2 (NK-CORP): RADIUS server not responding (check address, port and shared secret)</span></pre>
<p>Log khud teen candidates suggest karta hai: address, port, shared secret. Jaldi eliminate karo:</p>
<ul>
<li><b>Address:</b> <code>ping 10.10.60.20</code> succeed hota hai (aur NK-STAFF clients RAD1 tak pahunchte hain), to routing theek hai.</li>
<li><b>Port:</b> <code>show aaa servers</code> auth-port 1812 dikhata hai, sahi.</li>
<li><b>Shared secret:</b> RAD1 rebuild hua, aur rebuild wahi time hai jab koi naya secret enter karta hai. Yahi bacha hua suspect hai.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Key mismatch">
<rect x="30" y="40" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="105" y="68" text-anchor="middle" class="svg-ink" font-size="12">WLC1</text><text x="105" y="86" text-anchor="middle" class="svg-muted" font-size="11">key: galat value</text>
<rect x="460" y="40" width="150" height="60" rx="10" fill="#ddd6fe"/><text x="535" y="68" text-anchor="middle" class="svg-ink" font-size="12">RAD1 server</text><text x="535" y="86" text-anchor="middle" class="svg-muted" font-size="11">NkRadius1 expect karta hai</text>
<line x1="180" y1="70" x2="460" y2="70" stroke="#64748b"/>
<text x="320" y="62" text-anchor="middle" class="svg-accent" font-size="12">Access-Request (galat key se signed)</text>
<text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="12">Server verify nahi kar sakta: drop karta hai, kuch wapas nahi bhejta</text>
<text x="320" y="147" text-anchor="middle" class="svg-muted" font-size="12">Controller wait karta hai, phir timeout gina jaata hai</text>
</svg><p class="cap">Na reply, na reject: yeh khamoshi key mismatch ki signature hai.</p></div>

<p><b>Step 4: sirf broken object repair karo.</b> Secret controller par RADIUS server definition mein hota hai, jiska naam RAD1 hai. Use dobara enter karo:</p>
<pre class="code">WLC1# configure terminal
WLC1(config)# radius server RAD1
WLC1(config-radius-server)# key 0 NkRadius1
WLC1(config-radius-server)# end
WLC1# write memory</pre>
<p>WLAN, policy profile, method list ya group ko touch <b>mat</b> karo. Woh theek hain, aur unnecessary changes agla fault dhoondhna mushkil kar dete hain. Yeh bhi dhyan do ki radius server par key command ko shutdown nahi chahiye, WLAN security edit ke ulat.</p>

<p><b>Step 5: prove karo.</b></p>
<pre class="out">LAPTOP1&gt; wifi connect NK-CORP user alice password NkWifi@2024
LAPTOP1&gt; wifi status
SSID: NK-CORP   State: <span class="hl">Associated</span>   VLAN 40
LAPTOP1&gt; ping 10.10.60.20
!!!!!   Success rate is 100 percent (5/5)

WLC1# show aaa servers
RADIUS: id RAD1, host 10.10.60.20, auth-port 1812, <span class="hl">requests 1</span>, timeouts 3</pre>
<p>Ab requests count hoti hain. Purane timeouts history ki tarah rehte hain, jo normal hai; important yeh hai ki nayi attempts ko jawab milte hain.</p>

<h3>Doosre common faults aur unke fixes</h3>
<ul>
<li><b>aaa new-model missing:</b> controller AAA objects refuse karta hai, ya WLAN ke paas list nahi. <code>aaa new-model</code> enable karo, phir chain dobara check karo.</li>
<li><b>Method list missing ya galat naam:</b> WLAN aisi list refer karta hai jo exist nahi karti. <code>security dot1x authentication-list</code> ko <code>aaa authentication dot1x</code> ke naamon se compare karo.</li>
<li><b>Group mein server name missing:</b> group RG-NK mein koi server nahi dikhta. <code>server name RAD1</code> add karo.</li>
<li><b>Enabled WLAN edit karna:</b> refuse hota hai. Shut, edit, enable.</li>
<li><b>Client par galat PSK:</b> log MIC check ke saath PSK failure dikhata hai; WLAN nahi, client ki saved key fix karo.</li>
</ul>
<div class="warn"><p><b>Common mistake.</b> 802.1X users fail hone par WLAN key badalna ya WLAN recreate karna. 802.1X mein PSK nahi hota; fault AAA, server, secret ya user mein hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Timeouts ka matlab server ne jawab nahi diya (secret, address, firewall, NAS entry). Rejects ka matlab server ne jawab diya aur mana kiya. Inhe mix mat karo.</p></div>

<div class="scn"><h4>Rebuilt server aur typo</h4><p>Ek RADIUS appliance Saturday ko replace hua. Administrator ne shared secret mein lowercase l ki jagah capital I type kar diya. Monday subah controller ne saikdon timeouts gine aur ek bhi reject nahi. Kyunki engineer ne pehle counters padhe, usne WLAN ko touch nahi kiya. Server par secret dobara type karke ek laptop se test karne se das minute mein service wapas aayi.</p><p><b>Lesson:</b> pehle counters aur logs padho, aur timeouts ko rejects se alag pehchano.</p></div>
<div class="iv"><p class="q">"Users corporate SSID par authenticate nahi kar pa rahe. Troubleshoot kaise karoge?"</p><p>Pehle check karo SSID visible hai, phir timeouts versus requests ke liye show aaa servers, phir log. Timeouts: address aur route, port, dono ends par shared secret aur NAS entry verify karo. Rejects: user account aur policy check karo. Ek object repair karo aur negative test samet client se prove karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Client symptom se counters, phir log tak jao, phir ek object fix karo.</li>
<li>Timeouts aur answered requests na hona secret, address ya reachability ki taraf ishara karta hai.</li>
<li>Key mismatch khamoshi deta hai, reject nahi.</li>
<li>Secret <code>radius server RAD1</code> mein repair karo; AAA lists aur WLAN ko chhodo.</li>
<li>Fix hamesha client se prove karo aur counters dekho.</li>
</ul></div>
`}};export{e as default};