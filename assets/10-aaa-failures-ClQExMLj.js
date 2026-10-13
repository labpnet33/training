var e={id:`aaa-failures`,h:{en:`AAA failure codes: reject, timeout, wrong secret and missing server`,hi:`AAA failure codes: reject, timeout, galat secret aur missing server`},body:{en:`
<p>Picture a security guard calling the HR desk to ask "is this person allowed in?". Four things can go wrong. HR says no (reject). HR does not pick up (timeout). The guard dials the wrong number (wrong address). Or HR picks up but does not trust the guard's code word and hangs up without a word (wrong shared secret). From the guard's side, the last three look the same: silence. A good wireless engineer tells them apart. Authentication basics belong to wl-security; here we diagnose failures.</p>

<h3>How a 802.1X login travels</h3>
<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="802.1X path">
<rect x="10" y="40" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="60" y="70" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="170" y="40" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="225" y="62" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text><text x="225" y="78" text-anchor="middle" class="svg-muted" font-size="11">authenticator</text>
<rect x="350" y="40" width="110" height="50" rx="8" fill="#fde68a"/><text x="405" y="62" text-anchor="middle" class="svg-ink" font-size="13">RAD1</text><text x="405" y="78" text-anchor="middle" class="svg-muted" font-size="11">10.10.60.20</text>
<line x1="110" y1="65" x2="170" y2="65" stroke="#64748b" stroke-width="2"/><text x="140" y="55" text-anchor="middle" class="svg-muted" font-size="11">EAPOL</text>
<line x1="280" y1="65" x2="350" y2="65" stroke="#64748b" stroke-width="2"/><text x="315" y="55" text-anchor="middle" class="svg-muted" font-size="11">RADIUS</text>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">The controller relays EAP inside RADIUS, protected by the shared secret.</text>
</svg><p class="cap">Client talks EAPOL to the controller; the controller talks RADIUS (UDP 1812 for authentication, 1813 for accounting) to the server.</p></div>

<h3>Four outcomes and what each means</h3>
<table class="cmp"><tr><th>Outcome</th><th>Trace shows</th><th>Meaning</th><th>Owner</th></tr>
<tr><td><b>Access-Reject</b></td><td>Access-Request, Access-Reject, EAP-Failure, reason 23</td><td>The server answered no: wrong user or password, disabled account, policy deny</td><td>AAA admin, user</td></tr>
<tr><td><b>Timeout</b></td><td>Access-Request, three retransmits, no response, RADIUS_DEAD, reason 1</td><td>No answer: wrong shared secret, wrong address or port, route or ACL, server down</td><td>Network, AAA admin</td></tr>
<tr><td><b>No server</b></td><td>No RADIUS server available for the WLAN</td><td>Method list, server group or server name missing on the controller</td><td>Wireless admin</td></tr>
<tr><td><b>Access-Accept</b> then failure later</td><td>Accept, key management, then a placement or DHCP error</td><td>AAA is fine; look at later stages</td><td>Depends</td></tr></table>

<h3>Why a wrong secret looks like a timeout</h3>
<p>RADIUS signs packets with the <b>shared secret</b>. If the controller's secret differs from the server's, the server cannot verify the packet and, by design, drops it silently (the server log may say "invalid Message-Authenticator" or "unknown client"). The controller never receives an answer, retransmits three times, then marks the server dead. That is why <code>key 0 NkRadius0</code> instead of <code>NkRadius1</code> produces a <b>timeout</b>, not a reject. The comparison point is the server log: if RAD1 shows no request at all or shows a signature error, suspect secret or reachability; if it shows the user and a reason, the path works.</p>

<h3>The commands</h3>
<pre class="code">WLC1# show aaa servers
WLC1# show radius server-group all
WLC1# show running-config | section radius
WLC1# show running-config | include aaa
<span class="c">! the objects behind a working 802.1X WLAN</span>
aaa new-model
radius server RAD1
 address ipv4 10.10.60.20 auth-port 1812 acct-port 1813
 key 0 NkRadius1
aaa group server radius RG-NK
 server name RAD1
aaa authentication dot1x NK-DOT1X group RG-NK
wlan NK-CORP 2 NK-CORP
 security dot1x authentication-list NK-DOT1X</pre>
<p>Check the chain in order: <code>aaa new-model</code>, server (address, ports, key), server group, method list, and the WLAN that references the list. A break anywhere gives <b>no server</b> or <b>timeout</b>. Web UI: <b>Configuration &gt; Security &gt; AAA</b> with the tabs <b>Servers</b>, <b>Server Groups</b> and <b>AAA Method List</b>.</p>
<pre class="out">... [radius] (info): RADIUS: Send Access-Request to 10.10.60.20:1812 id 1812/87, len 322
... [radius] (info): RADIUS: Retransmit to (10.10.60.20:1812,1813) for id 1812/87
... [radius] (info): RADIUS: Retransmit to (10.10.60.20:1812,1813) for id 1812/87
... [radius] (warn): RADIUS: No response from (10.10.60.20:1812,1813) for id 1812/87
... [radius] (warn): %RADIUS-4-RADIUS_DEAD: RADIUS server 10.10.60.20:1812,1813 is not responding.
... [dot1x] (<span class="hl">ERR</span>): MAC: 0050.32e9.9f01 AAA server did not answer: 802.1X authentication timed out</pre>
<p>Real-platform concept (not in the lab): <code>test aaa group RG-NK alice NkWifi@2024 new-code</code> sends a test login from the controller and prints accept, reject or timeout without needing a client; <code>radius-server dead-criteria</code> and <code>deadtime</code> tune when a server is marked dead and retried.</p>

<div class="eg"><p><b>Worked example.</b> LAPTOP2 (user alice, NK-CORP) fails. Trace: Access-Request, three retransmits, no response, RADIUS_DEAD. Decision tree: a reject would have shown Access-Reject, so the server did not answer. Check order: (1) address and port of RAD1 in the controller config, (2) can the controller ping 10.10.60.20, (3) the key. In the capstone the key was NkRadius0 on WLC1 while RAD1 uses NkRadius1: <code>radius server RAD1</code>, <code>key 0 NkRadius1</code> fixed that layer. Then the next failure appeared (VLAN 40 missing), the proof that layers hide each other.</p></div>

<h3>EAP failures that RADIUS reports as Reject</h3>
<ul>
<li><b>Wrong password or unknown user</b>: reject; the server log names the cause the controller never sees.</li>
<li><b>Certificate not trusted by the client</b> (PEAP): the client aborts, often shown as a reject or EAP timeout; fix on the client or the server certificate.</li>
<li><b>Account expired or policy deny</b>: reject.</li>
<li><b>Clock skew</b>: certificates look expired.</li>
</ul>
<p>The lab simulates reject (wrong user or password) and timeout (wrong secret, address, port or unreachable server) and the missing-server case. Certificate exchange and EAP-TLS are concept only.</p>

<div class="warn"><p><b>Common mistake.</b> Resetting the user's password when the trace says timeout. A timeout never reached a password check.</p></div>
<div class="exam"><p><b>Exam trap.</b> Authentication uses UDP 1812 and accounting 1813 (older systems used 1645 and 1646). A shared-secret mismatch gives <b>no response</b>, not an Access-Reject. And an Access-Reject while the server is reachable proves the network path works.</p></div>

<div class="scn"><h4>Friday key rotation</h4><p>The security team rotated the RADIUS secret on the servers on Friday evening. On Monday all corporate users failed with timeouts while guests worked. The controller log showed RADIUS_DEAD. Updating the key on the controller restored service within a minute.</p><p><b>Lesson:</b> timeouts for every 802.1X user and none for PSK users point at the AAA path, and a rotated secret is the first suspect.</p></div>

<div class="iv"><p class="q">"What is the difference between Access-Reject and a RADIUS timeout in a wireless ticket?"</p><p>A reject is the server saying no, so the path and secret work; look at credentials and server policy. A timeout means no answer: check the shared secret, server address and ports, routing and ACLs, and server health. I read the server log and run a test login from the controller.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Reject = server said no; timeout = no answer; no server = controller misconfiguration.</li>
<li>A wrong shared secret produces a timeout because the server silently drops the packet.</li>
<li>Check the chain: aaa new-model, server, group, method list, WLAN reference.</li>
<li>Web UI: Configuration &gt; Security &gt; AAA (Servers, Server Groups, AAA Method List).</li>
<li>Fixing AAA often reveals the next layer, such as a missing VLAN.</li>
</ul></div>
`,hi:`
<p>Security guard HR desk ko call karke poochta hai "yeh banda andar ja sakta hai?". Chaar cheezein galat ho sakti hain. HR kehta hai na (reject). HR phone nahi uthata (timeout). Guard galat number dial karta hai (galat address). Ya HR phone uthata hai lekin guard ke code word par bharosa nahi karta aur bina bole kaat deta hai (galat shared secret). Guard ki taraf se aakhri teen ek jaise dikhte hain: khamoshi. Achha wireless engineer inhe alag karta hai. Authentication ki basics wl-security mein hain; yahan hum failures diagnose karte hain.</p>

<h3>802.1X login ka safar</h3>
<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="802.1X path">
<rect x="10" y="40" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="60" y="70" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="170" y="40" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="225" y="62" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text><text x="225" y="78" text-anchor="middle" class="svg-muted" font-size="11">authenticator</text>
<rect x="350" y="40" width="110" height="50" rx="8" fill="#fde68a"/><text x="405" y="62" text-anchor="middle" class="svg-ink" font-size="13">RAD1</text><text x="405" y="78" text-anchor="middle" class="svg-muted" font-size="11">10.10.60.20</text>
<line x1="110" y1="65" x2="170" y2="65" stroke="#64748b" stroke-width="2"/><text x="140" y="55" text-anchor="middle" class="svg-muted" font-size="11">EAPOL</text>
<line x1="280" y1="65" x2="350" y2="65" stroke="#64748b" stroke-width="2"/><text x="315" y="55" text-anchor="middle" class="svg-muted" font-size="11">RADIUS</text>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">Controller EAP ko RADIUS ke andar relay karta hai, shared secret se protected.</text>
</svg><p class="cap">Client controller se EAPOL bolta hai; controller server se RADIUS bolta hai (authentication ke liye UDP 1812, accounting ke liye 1813).</p></div>

<h3>Chaar outcomes aur har ka matlab</h3>
<table class="cmp"><tr><th>Outcome</th><th>Trace dikhata hai</th><th>Matlab</th><th>Owner</th></tr>
<tr><td><b>Access-Reject</b></td><td>Access-Request, Access-Reject, EAP-Failure, reason 23</td><td>Server ne na kaha: galat user ya password, disabled account, policy deny</td><td>AAA admin, user</td></tr>
<tr><td><b>Timeout</b></td><td>Access-Request, teen retransmits, no response, RADIUS_DEAD, reason 1</td><td>Jawab nahi: galat shared secret, galat address ya port, route ya ACL, server down</td><td>Network, AAA admin</td></tr>
<tr><td><b>No server</b></td><td>WLAN ke liye koi RADIUS server available nahi</td><td>Controller par method list, server group ya server name missing</td><td>Wireless admin</td></tr>
<tr><td><b>Access-Accept</b> phir baad mein failure</td><td>Accept, key management, phir placement ya DHCP error</td><td>AAA theek hai; baad ke stages dekho</td><td>Depend karta hai</td></tr></table>

<h3>Galat secret timeout jaisa kyun dikhta hai</h3>
<p>RADIUS packets ko <b>shared secret</b> se sign karta hai. Agar controller ka secret server se alag hai to server packet verify nahi kar sakta aur design se use chupchap drop kar deta hai (server log mein "invalid Message-Authenticator" ya "unknown client" aa sakta hai). Controller ko kabhi jawab nahi milta, teen baar retransmit karta hai, phir server ko dead mark karta hai. Isi wajah se <code>NkRadius1</code> ki jagah <code>key 0 NkRadius0</code> <b>timeout</b> deta hai, reject nahi. Comparison point server log hai: agar RAD1 par request dikhti hi nahi ya signature error dikhta hai to secret ya reachability par shak karo; agar user aur reason dikhte hain to path kaam kar raha hai.</p>

<h3>Commands</h3>
<pre class="code">WLC1# show aaa servers
WLC1# show radius server-group all
WLC1# show running-config | section radius
WLC1# show running-config | include aaa
<span class="c">! working 802.1X WLAN ke peeche ke objects</span>
aaa new-model
radius server RAD1
 address ipv4 10.10.60.20 auth-port 1812 acct-port 1813
 key 0 NkRadius1
aaa group server radius RG-NK
 server name RAD1
aaa authentication dot1x NK-DOT1X group RG-NK
wlan NK-CORP 2 NK-CORP
 security dot1x authentication-list NK-DOT1X</pre>
<p>Chain order mein check karo: <code>aaa new-model</code>, server (address, ports, key), server group, method list, aur woh WLAN jo list ko reference karta hai. Kahin bhi toot'ne par <b>no server</b> ya <b>timeout</b> milta hai. Web UI: <b>Configuration &gt; Security &gt; AAA</b>, tabs <b>Servers</b>, <b>Server Groups</b> aur <b>AAA Method List</b>.</p>
<pre class="out">... [radius] (info): RADIUS: Send Access-Request to 10.10.60.20:1812 id 1812/87, len 322
... [radius] (info): RADIUS: Retransmit to (10.10.60.20:1812,1813) for id 1812/87
... [radius] (info): RADIUS: Retransmit to (10.10.60.20:1812,1813) for id 1812/87
... [radius] (warn): RADIUS: No response from (10.10.60.20:1812,1813) for id 1812/87
... [radius] (warn): %RADIUS-4-RADIUS_DEAD: RADIUS server 10.10.60.20:1812,1813 is not responding.
... [dot1x] (<span class="hl">ERR</span>): MAC: 0050.32e9.9f01 AAA server did not answer: 802.1X authentication timed out</pre>
<p>Real-platform concept (lab mein nahi): <code>test aaa group RG-NK alice NkWifi@2024 new-code</code> controller se test login bhejta hai aur client ke bina accept, reject ya timeout print karta hai; <code>radius-server dead-criteria</code> aur <code>deadtime</code> tune karte hain ki server kab dead mark ho aur kab dubara try ho.</p>

<div class="eg"><p><b>Worked example.</b> LAPTOP2 (user alice, NK-CORP) fail hota hai. Trace: Access-Request, teen retransmits, no response, RADIUS_DEAD. Decision tree: reject hota to Access-Reject dikhta, to server ne jawab nahi diya. Check order: (1) controller config mein RAD1 ka address aur port, (2) controller 10.10.60.20 ko ping kar sakta hai, (3) key. Capstone mein WLC1 par key NkRadius0 thi jabki RAD1 NkRadius1 use karta hai: <code>radius server RAD1</code>, <code>key 0 NkRadius1</code> ne woh layer fix ki. Phir agla failure aaya (VLAN 40 missing), jo prove karta hai ki layers ek doosre ko chhupati hain.</p></div>

<h3>EAP failures jo RADIUS Reject ki tarah report karta hai</h3>
<ul>
<li><b>Galat password ya unknown user</b>: reject; server log woh cause batata hai jo controller kabhi nahi dekhta.</li>
<li><b>Client ne certificate trust nahi kiya</b> (PEAP): client abort karta hai, aksar reject ya EAP timeout dikhta hai; client ya server certificate par fix.</li>
<li><b>Account expired ya policy deny</b>: reject.</li>
<li><b>Clock skew</b>: certificates expired dikhte hain.</li>
</ul>
<p>Lab reject (galat user ya password), timeout (galat secret, address, port ya unreachable server) aur missing-server case simulate karta hai. Certificate exchange aur EAP-TLS concept only hain.</p>

<div class="warn"><p><b>Common mistake.</b> Trace timeout kehta hai tab user ka password reset karna. Timeout kabhi password check tak pahuncha hi nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Authentication UDP 1812 aur accounting 1813 use karta hai (purane systems 1645 aur 1646). Shared-secret mismatch <b>no response</b> deta hai, Access-Reject nahi. Aur server reachable ho tab Access-Reject prove karta hai ki network path kaam karta hai.</p></div>

<div class="scn"><h4>Friday key rotation</h4><p>Security team ne Friday shaam servers par RADIUS secret rotate kiya. Monday ko saare corporate users timeouts ke saath fail hue jabki guests chale. Controller log ne RADIUS_DEAD dikhaya. Controller par key update karne se ek minute mein service wapas aa gayi.</p><p><b>Lesson:</b> har 802.1X user ke liye timeouts aur PSK users ke liye koi nahi, AAA path ki taraf point karte hain, aur rotate hua secret pehla shak hai.</p></div>

<div class="iv"><p class="q">"Wireless ticket mein Access-Reject aur RADIUS timeout mein kya fark hai?"</p><p>Reject server ka na kehna hai, to path aur secret kaam karte hain; credentials aur server policy dekho. Timeout ka matlab jawab nahi: shared secret, server address aur ports, routing aur ACLs, aur server health check karo. Server log padhta hoon aur controller se test login chalata hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Reject = server ne na kaha; timeout = jawab nahi; no server = controller misconfiguration.</li>
<li>Galat shared secret timeout deta hai kyunki server packet chupchap drop karta hai.</li>
<li>Chain check karo: aaa new-model, server, group, method list, WLAN reference.</li>
<li>Web UI: Configuration &gt; Security &gt; AAA (Servers, Server Groups, AAA Method List).</li>
<li>AAA fix karne se aksar agli layer dikhti hai, jaise missing VLAN.</li>
</ul></div>
`}};export{e as default};