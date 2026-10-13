var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: walking both labs`,hi:`Troubleshooting workflow: dono labs ko step by step`},body:{en:`
<p>A doctor does not guess; she follows the same checklist every time: pulse, breathing, blood pressure, then tests. Network access control is the same. Most failures fall into five buckets: <b>no session</b>, <b>no supplicant</b>, <b>no RADIUS</b>, <b>rejected</b>, or <b>accepted but wrongly authorized</b>. Walk the same questions in the same order and you will find the bucket in minutes.</p>

<h3>The five questions</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="802.1X troubleshooting flow">
<rect x="10" y="10" width="300" height="40" rx="8" fill="#bae6fd"/><text x="160" y="35" text-anchor="middle" class="svg-ink" font-size="12">1 Is there a session on the port?</text>
<rect x="330" y="10" width="300" height="40" rx="8" fill="#e2e8f0"/><text x="480" y="35" text-anchor="middle" class="svg-muted" font-size="12">no: port-control, link, config</text>
<rect x="10" y="68" width="300" height="40" rx="8" fill="#bae6fd"/><text x="160" y="93" text-anchor="middle" class="svg-ink" font-size="12">2 Which method, which state?</text>
<rect x="330" y="68" width="300" height="40" rx="8" fill="#e2e8f0"/><text x="480" y="93" text-anchor="middle" class="svg-muted" font-size="12">Not run: sysauth; No response: supplicant</text>
<rect x="10" y="126" width="300" height="40" rx="8" fill="#bae6fd"/><text x="160" y="151" text-anchor="middle" class="svg-ink" font-size="12">3 Is the RADIUS server UP?</text>
<rect x="330" y="126" width="300" height="40" rx="8" fill="#e2e8f0"/><text x="480" y="151" text-anchor="middle" class="svg-muted" font-size="12">DEAD: routing, UDP 1812, key, NAD IP</text>
<rect x="10" y="184" width="300" height="40" rx="8" fill="#bae6fd"/><text x="160" y="209" text-anchor="middle" class="svg-ink" font-size="12">4 What does the server log say?</text>
<rect x="330" y="184" width="300" height="40" rx="8" fill="#e2e8f0"/><text x="480" y="209" text-anchor="middle" class="svg-muted" font-size="12">FAIL: password, unknown MAC, policy</text>
<rect x="10" y="242" width="300" height="40" rx="8" fill="#bae6fd"/><text x="160" y="267" text-anchor="middle" class="svg-ink" font-size="12">5 Was the result applied?</text>
<rect x="330" y="242" width="300" height="40" rx="8" fill="#e2e8f0"/><text x="480" y="267" text-anchor="middle" class="svg-muted" font-size="12">wrong VLAN: authz list, VLAN exists</text>
<line x1="310" y1="30" x2="330" y2="30" stroke="#64748b"/><line x1="310" y1="88" x2="330" y2="88" stroke="#64748b"/><line x1="310" y1="146" x2="330" y2="146" stroke="#64748b"/><line x1="310" y1="204" x2="330" y2="204" stroke="#64748b"/><line x1="310" y1="262" x2="330" y2="262" stroke="#64748b"/>
<line x1="160" y1="50" x2="160" y2="68" stroke="#64748b"/><line x1="160" y1="108" x2="160" y2="126" stroke="#64748b"/><line x1="160" y1="166" x2="160" y2="184" stroke="#64748b"/><line x1="160" y1="224" x2="160" y2="242" stroke="#64748b"/>
</svg><p class="cap">Work top to bottom. The right-hand box is where the usual cause lives.</p></div>

<table class="cmp"><tr><th>Question</th><th>Command</th><th>What to look for</th></tr>
<tr><td>1 Session?</td><td><code>show authentication sessions</code></td><td>A row for the port; "No sessions" means authentication is not running there</td></tr>
<tr><td>2 Method state?</td><td><code>show authentication sessions interface g0/1 details</code>, <code>show dot1x all</code></td><td>dot1x Not run / No response / Authc Failed / Server dead; Sysauthcontrol</td></tr>
<tr><td>3 Server UP?</td><td><code>show aaa servers</code>, <code>test aaa group radius alice Nk@2026 new-code</code></td><td>State UP or DEAD; timeouts equal to requests</td></tr>
<tr><td>4 Server view?</td><td>ISE Live Logs (lab: <code>aaa-server show log</code>)</td><td>Nothing logged, "ignored", PASS or FAIL with a reason</td></tr>
<tr><td>5 Applied?</td><td>session details "Server Policies", <code>show vlan brief</code>, <code>show ip access-lists</code></td><td>VLAN, SGT, dACL as expected; then DHCP and gateway</td></tr>
</table>
<p>Useful syslog messages: <code>%DOT1X-5-FAIL</code>, <code>%MAB-5-FAIL</code>, <code>%AUTHMGR-7-FAILOVER</code> (moving to the next method), <code>%AUTHMGR-5-VLANASSIGN</code>, <code>%RADIUS-4-RADIUS_DEAD</code>. For deeper work use <code>debug dot1x all</code>, <code>debug mab all</code> and <code>debug radius authentication</code> with <code>terminal monitor</code>, on one port at a time.</p>

<h3>Walking the lab "Nobody gets on the network"</h3>
<p>Monday morning, after a weekend change on SW1, nobody gets access. ISE is up and its policies are correct. Three faults hide on SW1.</p>

<h4>Fault 1: the server ignores the switch</h4>
<p>Start where the decision is made. The ISE log is not empty, which already proves reachability, but every request is dropped before policy:</p>
<pre class="out">ISE&gt; aaa-server show log
<span class="hl">Sep 30 08:02:11.482  RADIUS request from 10.99.99.1 ignored: shared key mismatch</span>
Sep 30 08:02:26.517  RADIUS request from 10.99.99.1 ignored: shared key mismatch</pre>
<p>On the switch the server looks dead, because a dropped request is indistinguishable from a timeout:</p>
<pre class="out">SW1# show aaa servers
RADIUS: id 1, priority 1, host 10.99.99.10, auth-port 1812, acct-port 1813, hostname ISE
<span class="hl">     State: current DEAD, duration 94s, previous duration 0s</span>
     Dead: total time 0s, count 1
     Authen: request 4, timeouts 4, failover 0, retransmission 0</pre>
<p>Compare <code>aaa-server show clients</code> on ISE with <code>show running-config | section radius</code> on SW1: the switch has <code>key NKsecert</code>, a typo. Fix it inside <code>radius server ISE</code> with <code>key NKsecret</code>. <code>show aaa servers</code> then shows UP and the log shows <code>MAB PASS for 0050.7a00.0030</code>.</p>

<h4>Fault 2: 802.1X never runs</h4>
<p>The printer now works, but PC1, which has a correct supplicant, is not authenticated by 802.1X:</p>
<pre class="out">SW1# show authentication sessions interface g0/1 details
...
Method status list:
       Method           State
<span class="hl">       dot1x            Not run</span>
       mab              Authc Failed
SW1# show dot1x all
<span class="hl">Sysauthcontrol              Disabled</span></pre>
<p>"Not run" is different from "No response": the switch never even sent EAP-Request/Identity. It skipped straight to MAB, and MAB failed because PC1's MAC is not an allowed endpoint. Fix: <code>dot1x system-auth-control</code>.</p>

<h4>Fault 3: authenticated into the wrong VLAN</h4>
<p>Now the ISE log shows <code>802.1X (EAP-MD5) PASS for alice</code>, yet alice gets a 10.10.10.x address:</p>
<pre class="out">SW1# show authentication sessions interface g0/1 details
            User-Name:  alice
               Status:  Authorized
Local Policies:
<span class="hl">           Vlan Group:  Vlan: 10  (port access VLAN)</span>
Method status list:
       dot1x            Authc Success</pre>
<p>No "Server Policies" section at all: ISE sent VLAN 20 and SGT 10, and the switch ignored them. Fix: <code>aaa authorization network default group radius</code>.</p>

<h4>Verify</h4>
<p>Sessions restart after the change. Wait about 15 s for MAB (tx-period 5 x 3), run <code>ip dhcp</code> on PC1 and PRN1, and check that PC1 is dot1x/VLAN 20 and PRN1 mab/VLAN 30, each pinging its gateway (10.20.20.1 and 10.30.30.1).</p>

<h3>Checking the build lab the same way</h3>
<p>In "802.1X with MAB fallback and dynamic VLANs" the end state is three sessions: Gi0/1 dot1x Auth in VLAN 20 with SGT 10, Gi0/2 mab Auth in VLAN 30, Gi0/3 in guest VLAN 50 with method none. If GUEST1 shows Unauth instead, check that <code>authentication event no-response action authorize vlan 50</code> is on the port and VLAN 50 exists. If PRN1 stays in "Running" for a long time, check tx-period.</p>

<div class="eg"><p><b>Worked example: reading timeouts.</b> <code>show aaa servers</code> shows <i>request 120, timeouts 120, accept 0, reject 0</i>. Every request timed out, so no response of any kind came back: think routing, an ACL or firewall blocking UDP 1812, the wrong server IP, an unregistered NAD IP, or a key mismatch (which ISE drops silently). If instead you saw <i>reject 120</i>, the path and key are fine and the problem is credentials or policy.</p></div>

<div class="warn"><p><b>Common mistake.</b> Running <code>debug dot1x all</code> on a busy production switch with 400 active ports. The console floods and the CPU spikes. Use conditional debugging on one interface or one MAC, and prefer the ISE Live Logs, which already show the step where authentication stopped.</p></div>

<div class="exam"><p><b>Exam trap.</b> A wrong shared secret does not produce Access-Reject; the server silently drops the request, so the switch sees timeouts and marks the server dead. A wrong password produces Access-Reject. Know which symptom goes with which cause.</p></div>

<div class="scn"><h4>Only phones worked</h4><p>After a switch refresh, IP phones registered but PCs behind them got no network. Sessions showed the voice domain Authorized and the data domain "Unauth" with a security violation logged. The new template used the default <b>single-host</b> mode, so the PC's MAC was a second MAC and a violation. Changing phone ports to <code>authentication host-mode multi-domain</code> fixed it.</p><p><b>Lesson:</b> when some devices on a port work and others do not, check the host mode before touching ISE.</p></div>

<div class="iv"><p class="q">"Users authenticate successfully but get no IP address. How do you troubleshoot?"</p><p>Strong answer: confirm the session is Authorized and read the details: which VLAN was applied and from where (Server Policies or Local). If ISE sent a VLAN but the port uses its static VLAN, the authorization network list is missing. If the VLAN was applied, check it exists, is allowed on the uplink trunk, has an SVI or DHCP relay, and that a dACL is not blocking DHCP. Then check the endpoint renewed DHCP after a VLAN change (port bounce CoA).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ask in order: session? method state? server UP? server log? result applied?</li>
<li>Not run = dot1x system-auth-control off; No response = no supplicant; Authc Failed = rejected.</li>
<li>Timeouts only = path, NAD IP or shared key; rejects = credentials or policy.</li>
<li>PASS on ISE but static VLAN on the switch = missing aaa authorization network.</li>
<li>The lab's three faults: key typo, sysauthcontrol disabled, no network authorization.</li>
</ul></div>
`,hi:`
<p>Doctor andaaza nahi lagati; woh har baar same checklist follow karti hai: pulse, saans, blood pressure, phir tests. Network access control bhi aisa hi hai. Zyada tar failures paanch buckets mein aate hain: <b>no session</b>, <b>no supplicant</b>, <b>no RADIUS</b>, <b>rejected</b>, ya <b>accepted lekin galat authorize</b>. Same sawaal same order mein poochho aur aap minutes mein bucket dhoondh loge.</p>

<h3>Paanch sawaal</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="802.1X troubleshooting flow">
<rect x="10" y="10" width="300" height="40" rx="8" fill="#bae6fd"/><text x="160" y="35" text-anchor="middle" class="svg-ink" font-size="12">1 Port par session hai?</text>
<rect x="330" y="10" width="300" height="40" rx="8" fill="#e2e8f0"/><text x="480" y="35" text-anchor="middle" class="svg-muted" font-size="12">nahi: port-control, link, config</text>
<rect x="10" y="68" width="300" height="40" rx="8" fill="#bae6fd"/><text x="160" y="93" text-anchor="middle" class="svg-ink" font-size="12">2 Kaunsa method, kaunsi state?</text>
<rect x="330" y="68" width="300" height="40" rx="8" fill="#e2e8f0"/><text x="480" y="93" text-anchor="middle" class="svg-muted" font-size="12">Not run: sysauth; No response: supplicant</text>
<rect x="10" y="126" width="300" height="40" rx="8" fill="#bae6fd"/><text x="160" y="151" text-anchor="middle" class="svg-ink" font-size="12">3 RADIUS server UP hai?</text>
<rect x="330" y="126" width="300" height="40" rx="8" fill="#e2e8f0"/><text x="480" y="151" text-anchor="middle" class="svg-muted" font-size="12">DEAD: routing, UDP 1812, key, NAD IP</text>
<rect x="10" y="184" width="300" height="40" rx="8" fill="#bae6fd"/><text x="160" y="209" text-anchor="middle" class="svg-ink" font-size="12">4 Server log kya kehta hai?</text>
<rect x="330" y="184" width="300" height="40" rx="8" fill="#e2e8f0"/><text x="480" y="209" text-anchor="middle" class="svg-muted" font-size="12">FAIL: password, unknown MAC, policy</text>
<rect x="10" y="242" width="300" height="40" rx="8" fill="#bae6fd"/><text x="160" y="267" text-anchor="middle" class="svg-ink" font-size="12">5 Result apply hua?</text>
<rect x="330" y="242" width="300" height="40" rx="8" fill="#e2e8f0"/><text x="480" y="267" text-anchor="middle" class="svg-muted" font-size="12">galat VLAN: authz list, VLAN exist karta hai</text>
<line x1="310" y1="30" x2="330" y2="30" stroke="#64748b"/><line x1="310" y1="88" x2="330" y2="88" stroke="#64748b"/><line x1="310" y1="146" x2="330" y2="146" stroke="#64748b"/><line x1="310" y1="204" x2="330" y2="204" stroke="#64748b"/><line x1="310" y1="262" x2="330" y2="262" stroke="#64748b"/>
<line x1="160" y1="50" x2="160" y2="68" stroke="#64748b"/><line x1="160" y1="108" x2="160" y2="126" stroke="#64748b"/><line x1="160" y1="166" x2="160" y2="184" stroke="#64748b"/><line x1="160" y1="224" x2="160" y2="242" stroke="#64748b"/>
</svg><p class="cap">Upar se neeche kaam karo. Right-hand box mein usual cause rehta hai.</p></div>

<table class="cmp"><tr><th>Sawaal</th><th>Command</th><th>Kya dekhna hai</th></tr>
<tr><td>1 Session?</td><td><code>show authentication sessions</code></td><td>Port ki row; "No sessions" ka matlab wahan authentication chal hi nahi raha</td></tr>
<tr><td>2 Method state?</td><td><code>show authentication sessions interface g0/1 details</code>, <code>show dot1x all</code></td><td>dot1x Not run / No response / Authc Failed / Server dead; Sysauthcontrol</td></tr>
<tr><td>3 Server UP?</td><td><code>show aaa servers</code>, <code>test aaa group radius alice Nk@2026 new-code</code></td><td>State UP ya DEAD; timeouts requests ke barabar</td></tr>
<tr><td>4 Server ka view?</td><td>ISE Live Logs (lab: <code>aaa-server show log</code>)</td><td>Kuch log nahi, "ignored", PASS ya reason ke saath FAIL</td></tr>
<tr><td>5 Apply hua?</td><td>session details "Server Policies", <code>show vlan brief</code>, <code>show ip access-lists</code></td><td>VLAN, SGT, dACL expected ke mutabik; phir DHCP aur gateway</td></tr>
</table>
<p>Kaam ke syslog messages: <code>%DOT1X-5-FAIL</code>, <code>%MAB-5-FAIL</code>, <code>%AUTHMGR-7-FAILOVER</code> (agle method par jaana), <code>%AUTHMGR-5-VLANASSIGN</code>, <code>%RADIUS-4-RADIUS_DEAD</code>. Gehre kaam ke liye <code>terminal monitor</code> ke saath <code>debug dot1x all</code>, <code>debug mab all</code> aur <code>debug radius authentication</code> use karo, ek time par ek port par.</p>

<h3>Lab "Nobody gets on the network" ko walk karna</h3>
<p>Somvaar subah, SW1 par weekend change ke baad kisi ko access nahi mil raha. ISE up hai aur uski policies sahi hain. SW1 par teen faults chhupe hain.</p>

<h4>Fault 1: server switch ko ignore karta hai</h4>
<p>Wahan se shuru karo jahan decision hota hai. ISE log khaali nahi hai, jo pehle hi reachability prove karta hai, lekin har request policy se pehle drop ho rahi hai:</p>
<pre class="out">ISE&gt; aaa-server show log
<span class="hl">Sep 30 08:02:11.482  RADIUS request from 10.99.99.1 ignored: shared key mismatch</span>
Sep 30 08:02:26.517  RADIUS request from 10.99.99.1 ignored: shared key mismatch</pre>
<p>Switch par server dead dikhta hai, kyunki drop hui request timeout se alag pehchani nahi ja sakti:</p>
<pre class="out">SW1# show aaa servers
RADIUS: id 1, priority 1, host 10.99.99.10, auth-port 1812, acct-port 1813, hostname ISE
<span class="hl">     State: current DEAD, duration 94s, previous duration 0s</span>
     Dead: total time 0s, count 1
     Authen: request 4, timeouts 4, failover 0, retransmission 0</pre>
<p>ISE par <code>aaa-server show clients</code> ko SW1 par <code>show running-config | section radius</code> se compare karo: switch par <code>key NKsecert</code> hai, ek typo. <code>radius server ISE</code> ke andar <code>key NKsecret</code> se theek karo. Phir <code>show aaa servers</code> UP dikhata hai aur log <code>MAB PASS for 0050.7a00.0030</code> dikhata hai.</p>

<h4>Fault 2: 802.1X kabhi chalta hi nahi</h4>
<p>Printer ab chal raha hai, lekin PC1, jiska supplicant sahi hai, 802.1X se authenticate nahi hota:</p>
<pre class="out">SW1# show authentication sessions interface g0/1 details
...
Method status list:
       Method           State
<span class="hl">       dot1x            Not run</span>
       mab              Authc Failed
SW1# show dot1x all
<span class="hl">Sysauthcontrol              Disabled</span></pre>
<p>"Not run" "No response" se alag hai: switch ne EAP-Request/Identity bheja hi nahi. Woh seedha MAB par gaya, aur MAB fail hua kyunki PC1 ka MAC allowed endpoint nahi hai. Fix: <code>dot1x system-auth-control</code>.</p>

<h4>Fault 3: galat VLAN mein authenticated</h4>
<p>Ab ISE log <code>802.1X (EAP-MD5) PASS for alice</code> dikhata hai, phir bhi alice ko 10.10.10.x address milta hai:</p>
<pre class="out">SW1# show authentication sessions interface g0/1 details
            User-Name:  alice
               Status:  Authorized
Local Policies:
<span class="hl">           Vlan Group:  Vlan: 10  (port access VLAN)</span>
Method status list:
       dot1x            Authc Success</pre>
<p>"Server Policies" section hi nahi hai: ISE ne VLAN 20 aur SGT 10 bheje, aur switch ne unhe ignore kiya. Fix: <code>aaa authorization network default group radius</code>.</p>

<h4>Verify</h4>
<p>Change ke baad sessions restart hote hain. MAB ke liye lagbhag 15 s ruko (tx-period 5 x 3), PC1 aur PRN1 par <code>ip dhcp</code> chalao, aur check karo ki PC1 dot1x/VLAN 20 aur PRN1 mab/VLAN 30 mein hai, dono apna gateway ping karte hue (10.20.20.1 aur 10.30.30.1).</p>

<h3>Build lab ko bhi aise hi check karna</h3>
<p>"802.1X with MAB fallback and dynamic VLANs" mein end state teen sessions hain: Gi0/1 dot1x Auth VLAN 20 mein SGT 10 ke saath, Gi0/2 mab Auth VLAN 30 mein, Gi0/3 guest VLAN 50 mein method none ke saath. Agar GUEST1 iski jagah Unauth dikhe, to check karo ki port par <code>authentication event no-response action authorize vlan 50</code> hai aur VLAN 50 exist karta hai. Agar PRN1 lambe time tak "Running" mein rahe, to tx-period check karo.</p>

<div class="eg"><p><b>Worked example: timeouts padhna.</b> <code>show aaa servers</code> dikhata hai <i>request 120, timeouts 120, accept 0, reject 0</i>. Har request timeout hui, to koi bhi response wapas nahi aaya: routing, UDP 1812 block karne wala ACL ya firewall, galat server IP, unregistered NAD IP, ya key mismatch (jise ISE chupchaap drop karta hai) socho. Agar iski jagah <i>reject 120</i> dikhe, to path aur key theek hain aur problem credentials ya policy hai.</p></div>

<div class="warn"><p><b>Common galti.</b> 400 active ports wale busy production switch par <code>debug dot1x all</code> chalana. Console bhar jaata hai aur CPU spike hota hai. Ek interface ya ek MAC par conditional debugging use karo, aur ISE Live Logs prefer karo, jo pehle se dikhate hain ki authentication kis step par ruka.</p></div>

<div class="exam"><p><b>Exam trap.</b> Galat shared secret Access-Reject nahi deta; server request chupchaap drop karta hai, isliye switch timeouts dekhta hai aur server ko dead mark karta hai. Galat password Access-Reject deta hai. Jaano kaunsa symptom kis cause ke saath jaata hai.</p></div>

<div class="scn"><h4>Sirf phones chal rahe the</h4><p>Switch refresh ke baad IP phones register ho gaye lekin unke peeche ke PCs ko network nahi mila. Sessions mein voice domain Authorized aur data domain "Unauth" tha, security violation log ke saath. Naya template default <b>single-host</b> mode use karta tha, isliye PC ka MAC doosra MAC aur violation tha. Phone ports ko <code>authentication host-mode multi-domain</code> par badalne se theek ho gaya.</p><p><b>Seekh:</b> jab ek port par kuch devices chalein aur kuch nahi, to ISE chhune se pehle host mode check karo.</p></div>

<div class="iv"><p class="q">"Users successfully authenticate karte hain lekin IP address nahi milta. Kaise troubleshoot karoge?"</p><p>Strong answer: confirm karo ki session Authorized hai aur details padho: kaunsa VLAN apply hua aur kahan se (Server Policies ya Local). Agar ISE ne VLAN bheja lekin port apna static VLAN use kar raha hai, to authorization network list missing hai. Agar VLAN apply hua, to check karo ki woh exist karta hai, uplink trunk par allowed hai, uska SVI ya DHCP relay hai, aur koi dACL DHCP block nahi kar raha. Phir check karo ki VLAN change ke baad endpoint ne DHCP renew kiya (port bounce CoA).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein poochho: session? method state? server UP? server log? result apply hua?</li>
<li>Not run = dot1x system-auth-control off; No response = supplicant nahi; Authc Failed = rejected.</li>
<li>Sirf timeouts = path, NAD IP ya shared key; rejects = credentials ya policy.</li>
<li>ISE par PASS lekin switch par static VLAN = aaa authorization network missing.</li>
<li>Lab ke teen faults: key typo, sysauthcontrol disabled, network authorization nahi.</li>
</ul></div>
`}};export{e as default};