var e={id:`posture-coa`,h:{en:`Posture and Change of Authorization: quarantine, remediate, restore`,hi:`Posture aur Change of Authorization: quarantine, remediate, restore`},body:{en:`
<p>A hospital lets a visiting doctor in with a valid badge, but a nurse at the ward door also checks: hands washed, gown on, mask on. If not, the doctor waits in the prep room until fixed, then the nurse calls the ward door to let them through. <b>Posture</b> is that health check for endpoints, the prep room is the <b>quarantine</b> result, and the phone call to the door is <b>CoA</b>.</p>

<h3>Posture: is the endpoint compliant?</h3>
<p>After authentication, ISE can assess the endpoint against your security baseline. The building blocks:</p>
<dl class="terms">
<dt>Agent</dt><dd>The <b>Cisco Secure Client ISE Posture module</b> (persistent), a <b>temporal agent</b> (runs once, then removes itself), or <b>agentless posture</b> (ISE checks over a remote session) for managed Windows and macOS.</dd>
<dt>Conditions</dt><dd>What to check: anti-malware installed and definitions current, patch management, disk encryption, firewall enabled, a file, registry key, application or service, USB storage.</dd>
<dt>Remediation</dt><dd>How to fix it: update anti-malware definitions, launch a patch update, a link to instructions, file distribution, or a script.</dd>
<dt>Requirements and posture policy</dt><dd>A requirement ties conditions to remediation for an operating system; the posture policy says which requirements apply to which users or groups, as mandatory, optional or audit.</dd>
<dt>Posture status</dt><dd><b>Unknown</b> (not yet assessed), <b>Compliant</b>, or <b>NonCompliant</b>. Authorization rules use Session:PostureStatus.</dd>
</dl>

<h3>The posture flow</h3>
<ol>
<li>The laptop authenticates with 802.1X. Posture is <b>Unknown</b>, so the rule "Unknown" returns a <b>redirect</b> to client provisioning plus a limited dACL.</li>
<li>The agent discovers the PSN and runs the assessment. Result: Compliant or NonCompliant.</li>
<li>ISE updates the session and sends <b>CoA</b> to the switch.</li>
<li>The switch re-authenticates; now "Compliant" returns full access, or "NonCompliant" returns <b>quarantine</b> (VLAN 90 or a remediation dACL).</li>
<li>When the user remediates, the agent reports Compliant, ISE sends another CoA and the endpoint gets full access again.</li>
</ol>
<p>A <b>posture lease</b> can skip reassessment for a number of days, and <b>periodic reassessment</b> re-checks connected endpoints.</p>

<h3>Change of Authorization (RFC 5176)</h3>
<p>Normally RADIUS is client-initiated: the switch asks, ISE answers. To change a session that already exists, ISE needs to talk first. RFC 5176 (Dynamic Authorization Extensions to RADIUS) defines that: ISE acts as a <b>dynamic authorization client</b>, the switch as a <b>dynamic authorization server</b>.</p>
<table class="cmp"><tr><th>Message</th><th>Answer</th><th>Purpose</th></tr>
<tr><td>CoA-Request</td><td>CoA-ACK or CoA-NAK</td><td>Change a live session (Cisco commands inside: reauthenticate, bounce-host-port, disable-host-port)</td></tr>
<tr><td>Disconnect-Request</td><td>Disconnect-ACK or Disconnect-NAK</td><td>Terminate the session</td></tr>
</table>
<table class="cmp"><tr><th>CoA action in ISE</th><th>What the switch does</th><th>When to use</th></tr>
<tr><td>Reauth</td><td>Re-runs authentication on the same session, port stays up</td><td>Posture or profile change when the VLAN stays the same, or dACL/SGT change</td></tr>
<tr><td>Port bounce</td><td>Shuts the port briefly, then re-enables it (link flap)</td><td>VLAN change: the endpoint must request a new DHCP address</td></tr>
<tr><td>Port shutdown / disable</td><td>Disables the port</td><td>Threat response (ANC "shut down")</td></tr>
<tr><td>Session terminate</td><td>Disconnect-Request, session removed</td><td>Generic disconnect</td></tr>
</table>
<p><b>Ports:</b> the RFC uses UDP <b>3799</b>; Cisco IOS and the ISE Cisco network device profile default to UDP <b>1700</b>. The two ends must agree. The switch accepts CoA only from clients it lists, with the matching key.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="CoA lab topology">
<rect x="230" y="40" width="160" height="56" rx="8" fill="#bae6fd"/><text x="310" y="64" text-anchor="middle" class="svg-ink" font-size="13">NAS-SW</text><text x="310" y="82" text-anchor="middle" class="svg-muted" font-size="12">10.99.99.1</text>
<rect x="470" y="40" width="150" height="56" rx="8" fill="#ddd6fe"/><text x="545" y="64" text-anchor="middle" class="svg-ink" font-size="13">ISE</text><text x="545" y="82" text-anchor="middle" class="svg-muted" font-size="12">10.99.99.10</text>
<rect x="30" y="140" width="150" height="56" rx="8" fill="#bbf7d0"/><text x="105" y="164" text-anchor="middle" class="svg-ink" font-size="13">PC1 priya</text><text x="105" y="182" text-anchor="middle" class="svg-muted" font-size="12">0050.7966.0201</text>
<line x1="390" y1="60" x2="470" y2="60" stroke="#64748b" stroke-width="2"/><text x="430" y="54" text-anchor="middle" class="svg-muted" font-size="12">Gi0/7</text>
<line x1="470" y1="85" x2="390" y2="85" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="430" y="110" text-anchor="middle" class="svg-accent" font-size="12">CoA key NKcoa</text>
<line x1="180" y1="160" x2="250" y2="96" stroke="#64748b" stroke-width="2"/><text x="190" y="120" class="svg-muted" font-size="12">Gi0/1</text>
<text x="420" y="160" text-anchor="middle" class="svg-ink" font-size="12">VLAN 20 staff</text><text x="420" y="180" text-anchor="middle" class="svg-accent" font-size="12">VLAN 90 quarantine</text>
</svg><p class="cap">The CoA lab: one NAS, one ISE, one staff PC. The CoA travels from ISE to the switch, the opposite direction of normal RADIUS.</p></div>

<h3>Lab walk: posture failure quarantines, remediation restores</h3>
<p><b>Task 1, trust ISE for CoA on NAS-SW:</b></p>
<pre class="code">NAS-SW(config)# aaa server radius dynamic-author
NAS-SW(config-locsvr-da-radius)# client 10.99.99.10 server-key NKcoa
NAS-SW(config-locsvr-da-radius)# exit</pre>
<p>NAS-SW already has <code>aaa new-model</code>, the RADIUS server and 802.1X on Gi0/1. The new block makes it listen for CoA (default UDP 1700) from 10.99.99.10 with key NKcoa. Note: this key is separate from the RADIUS key NKise26.</p>
<p><b>Task 2, authenticate priya:</b> on PC1 run <code>dot1x user priya password Pr!ya2026</code>. The session on Gi0/1 becomes Authorized, method dot1x, VLAN 20.</p>
<p><b>Task 3, posture fails:</b> in real ISE the agent would report NonCompliant. The lab's simulated ISE lets you do the two steps by hand:</p>
<pre class="code">ISE&gt; aaa-server authz priya vlan 90
ISE&gt; aaa-server coa 10.99.99.1 0050.7966.0201 reauth key NKcoa</pre>
<pre class="out"><span class="hl">CoA-ACK: reauth sent to NAS-SW (10.99.99.1) for 0050.7966.0201</span>

NAS-SW# show logging | include COA
%RADIUS-6-COA: reauthenticate for 0050.7966.0201 on Gi0/1 (CoA)

NAS-SW# show authentication sessions interface g0/1 details
            User-Name:  priya
               Status:  Authorized
Server Policies:
<span class="hl">           Vlan Group:  Vlan: 90</span></pre>
<p>The quarantine VLAN is <b>90</b> (the lab question). The first command changes what the authorization would return; the CoA makes the switch ask again.</p>
<p><b>Task 4, remediation:</b> set priya back to <code>vlan 20</code> and send the same CoA again. The session returns to VLAN 20, and the NAS has logged two CoAs.</p>

<div class="eg"><p><b>Worked example.</b> Why reauth and not port bounce here? On a real network PC1 would keep its old 10.20.20.x address after moving to VLAN 90, because nothing tells it to renew. Production designs therefore use <b>port bounce</b> for VLAN changes, or keep the VLAN and change only a dACL (reauth is enough). In the lab the simulated PC follows the VLAN automatically, so reauth demonstrates the mechanism.</p></div>

<h3>Adaptive Network Control</h3>
<p><b>ANC</b> applies a named policy (Quarantine, Shut_Down, Port_Bounce) to an endpoint, manually or from a security product through pxGrid (for example Secure Firewall or Secure Endpoint detecting malware). ANC enforces through CoA, and an authorization rule matching Session:ANCPolicy returns the quarantine result. This is Rapid Threat Containment, covered in sec-ftd-integration.</p>

<div class="warn"><p><b>Common mistake.</b> Using the RADIUS key in the CoA client, or the CoA port 3799 on one side and 1700 on the other. The switch silently drops it and ISE reports that no response was received.</p></div>

<div class="exam"><p><b>Exam trap.</b> CoA is RFC 5176, server-initiated, UDP 3799 standard and 1700 Cisco default. Port bounce is for VLAN changes that need new DHCP; reauth keeps the link up. Posture statuses are Unknown, Compliant and NonCompliant.</p></div>

<div class="scn"><h4>Laptops stuck in quarantine after remediation</h4><p>Users fixed their anti-malware definitions, the agent reported Compliant, but they stayed in the quarantine VLAN. ISE Live Logs showed Dynamic Authorization failed for every attempt. The access switches had <code>aaa server radius dynamic-author</code> with the old ISE PSN IP; the PSNs had been re-addressed during a migration. Adding the new PSN IPs as clients fixed all CoAs.</p><p><b>Lesson:</b> every PSN that can send CoA must be a dynamic-author client on every NAS.</p></div>

<div class="iv"><p class="q">"What is CoA and what types do you know?"</p><p>Strong answer: Change of Authorization, RFC 5176, lets ISE change an existing session by sending a request to the NAS on UDP 1700 (Cisco) or 3799 (RFC). Types: reauthenticate, port bounce, port disable or shutdown, and disconnect. Used after posture assessment, profile change, guest login and ANC quarantine. The NAS must have aaa server radius dynamic-author with ISE as a client and the matching key.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Posture: agent, conditions, remediation, requirements; status Unknown, Compliant, NonCompliant.</li>
<li>Typical flow: Unknown gets redirect, NonCompliant gets quarantine, Compliant gets full access; CoA moves between them.</li>
<li>CoA (RFC 5176): CoA-Request and Disconnect-Request, ACK or NAK; UDP 3799 standard, 1700 Cisco.</li>
<li>Reauth keeps the port up; port bounce forces new DHCP for VLAN changes; disable shuts the port.</li>
<li>NAS needs aaa server radius dynamic-author with every PSN as client and the matching server-key.</li>
</ul></div>
`,hi:`
<p>Ek hospital visiting doctor ko valid badge ke saath andar aane deta hai, par ward ke darwaze par ek nurse bhi check karti hai: haath dhule, gown pehna, mask pehna. Agar nahi, to doctor prep room mein theek hone tak wait karta hai, phir nurse ward door ko call karke use andar jaane deti hai. <b>Posture</b> endpoints ke liye wahi health check hai, prep room <b>quarantine</b> result hai, aur darwaze ko phone call <b>CoA</b> hai.</p>

<h3>Posture: kya endpoint compliant hai?</h3>
<p>Authentication ke baad ISE endpoint ko aapke security baseline ke against assess kar sakta hai. Building blocks:</p>
<dl class="terms">
<dt>Agent</dt><dd><b>Cisco Secure Client ISE Posture module</b> (persistent), <b>temporal agent</b> (ek baar chalta hai, phir khud ko hata deta hai), ya managed Windows aur macOS ke liye <b>agentless posture</b> (ISE remote session par check karta hai).</dd>
<dt>Conditions</dt><dd>Kya check karna hai: anti-malware installed aur definitions current, patch management, disk encryption, firewall enabled, ek file, registry key, application ya service, USB storage.</dd>
<dt>Remediation</dt><dd>Kaise theek karna hai: anti-malware definitions update, patch update launch, instructions ka link, file distribution, ya script.</dd>
<dt>Requirements aur posture policy</dt><dd>Requirement ek operating system ke liye conditions ko remediation se joddta hai; posture policy batati hai kaunsi requirements kis user ya group par lagu hongi, mandatory, optional ya audit ki tarah.</dd>
<dt>Posture status</dt><dd><b>Unknown</b> (abhi assess nahi hua), <b>Compliant</b>, ya <b>NonCompliant</b>. Authorization rules Session:PostureStatus use karte hain.</dd>
</dl>

<h3>Posture flow</h3>
<ol>
<li>Laptop 802.1X se authenticate karta hai. Posture <b>Unknown</b> hai, isliye rule "Unknown" client provisioning tak <b>redirect</b> plus ek limited dACL lautata hai.</li>
<li>Agent PSN dhoondhta hai aur assessment chalata hai. Result: Compliant ya NonCompliant.</li>
<li>ISE session update karta hai aur switch ko <b>CoA</b> bhejta hai.</li>
<li>Switch re-authenticate karta hai; ab "Compliant" full access lautata hai, ya "NonCompliant" <b>quarantine</b> (VLAN 90 ya remediation dACL).</li>
<li>Jab user remediate karta hai, agent Compliant report karta hai, ISE ek aur CoA bhejta hai aur endpoint ko phir full access milta hai.</li>
</ol>
<p><b>Posture lease</b> kuch dinon tak reassessment skip kar sakti hai, aur <b>periodic reassessment</b> connected endpoints ko dobara check karta hai.</p>

<h3>Change of Authorization (RFC 5176)</h3>
<p>Normally RADIUS client-initiated hai: switch poochta hai, ISE jawab deta hai. Pehle se maujood session badalne ke liye ISE ko pehle bolna padta hai. RFC 5176 (Dynamic Authorization Extensions to RADIUS) yahi define karta hai: ISE <b>dynamic authorization client</b> ki tarah kaam karta hai, switch <b>dynamic authorization server</b> ki tarah.</p>
<table class="cmp"><tr><th>Message</th><th>Jawab</th><th>Purpose</th></tr>
<tr><td>CoA-Request</td><td>CoA-ACK ya CoA-NAK</td><td>Live session badalna (andar Cisco commands: reauthenticate, bounce-host-port, disable-host-port)</td></tr>
<tr><td>Disconnect-Request</td><td>Disconnect-ACK ya Disconnect-NAK</td><td>Session khatam karna</td></tr>
</table>
<table class="cmp"><tr><th>ISE mein CoA action</th><th>Switch kya karta hai</th><th>Kab use karein</th></tr>
<tr><td>Reauth</td><td>Same session par authentication dobara chalata hai, port up rehta hai</td><td>Posture ya profile change jab VLAN same rahe, ya dACL/SGT change</td></tr>
<tr><td>Port bounce</td><td>Port ko thodi der band karke phir enable karta hai (link flap)</td><td>VLAN change: endpoint ko naya DHCP address maangna padta hai</td></tr>
<tr><td>Port shutdown / disable</td><td>Port disable karta hai</td><td>Threat response (ANC "shut down")</td></tr>
<tr><td>Session terminate</td><td>Disconnect-Request, session hat jaata hai</td><td>Generic disconnect</td></tr>
</table>
<p><b>Ports:</b> RFC UDP <b>3799</b> use karta hai; Cisco IOS aur ISE ka Cisco network device profile default mein UDP <b>1700</b> use karte hain. Dono ends ko sehmat hona chahiye. Switch CoA sirf un clients se accept karta hai jo uski list mein hain, matching key ke saath.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="CoA lab topology">
<rect x="230" y="40" width="160" height="56" rx="8" fill="#bae6fd"/><text x="310" y="64" text-anchor="middle" class="svg-ink" font-size="13">NAS-SW</text><text x="310" y="82" text-anchor="middle" class="svg-muted" font-size="12">10.99.99.1</text>
<rect x="470" y="40" width="150" height="56" rx="8" fill="#ddd6fe"/><text x="545" y="64" text-anchor="middle" class="svg-ink" font-size="13">ISE</text><text x="545" y="82" text-anchor="middle" class="svg-muted" font-size="12">10.99.99.10</text>
<rect x="30" y="140" width="150" height="56" rx="8" fill="#bbf7d0"/><text x="105" y="164" text-anchor="middle" class="svg-ink" font-size="13">PC1 priya</text><text x="105" y="182" text-anchor="middle" class="svg-muted" font-size="12">0050.7966.0201</text>
<line x1="390" y1="60" x2="470" y2="60" stroke="#64748b" stroke-width="2"/><text x="430" y="54" text-anchor="middle" class="svg-muted" font-size="12">Gi0/7</text>
<line x1="470" y1="85" x2="390" y2="85" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="430" y="110" text-anchor="middle" class="svg-accent" font-size="12">CoA key NKcoa</text>
<line x1="180" y1="160" x2="250" y2="96" stroke="#64748b" stroke-width="2"/><text x="190" y="120" class="svg-muted" font-size="12">Gi0/1</text>
<text x="420" y="160" text-anchor="middle" class="svg-ink" font-size="12">VLAN 20 staff</text><text x="420" y="180" text-anchor="middle" class="svg-accent" font-size="12">VLAN 90 quarantine</text>
</svg><p class="cap">CoA lab: ek NAS, ek ISE, ek staff PC. CoA ISE se switch ki taraf jaata hai, normal RADIUS ki ulti disha mein.</p></div>

<h3>Lab walk: posture failure quarantine karta hai, remediation restore karta hai</h3>
<p><b>Task 1, NAS-SW par CoA ke liye ISE ko trust karo:</b></p>
<pre class="code">NAS-SW(config)# aaa server radius dynamic-author
NAS-SW(config-locsvr-da-radius)# client 10.99.99.10 server-key NKcoa
NAS-SW(config-locsvr-da-radius)# exit</pre>
<p>NAS-SW par pehle se <code>aaa new-model</code>, RADIUS server aur Gi0/1 par 802.1X hai. Naya block use 10.99.99.10 se key NKcoa ke saath CoA (default UDP 1700) sunne deta hai. Dhyan do: yeh key RADIUS key NKise26 se alag hai.</p>
<p><b>Task 2, priya ko authenticate karo:</b> PC1 par <code>dot1x user priya password Pr!ya2026</code> chalao. Gi0/1 par session Authorized, method dot1x, VLAN 20 ho jaata hai.</p>
<p><b>Task 3, posture fail hota hai:</b> real ISE mein agent NonCompliant report karta. Lab ka simulated ISE aapko do steps haath se karne deta hai:</p>
<pre class="code">ISE&gt; aaa-server authz priya vlan 90
ISE&gt; aaa-server coa 10.99.99.1 0050.7966.0201 reauth key NKcoa</pre>
<pre class="out"><span class="hl">CoA-ACK: reauth sent to NAS-SW (10.99.99.1) for 0050.7966.0201</span>

NAS-SW# show logging | include COA
%RADIUS-6-COA: reauthenticate for 0050.7966.0201 on Gi0/1 (CoA)

NAS-SW# show authentication sessions interface g0/1 details
            User-Name:  priya
               Status:  Authorized
Server Policies:
<span class="hl">           Vlan Group:  Vlan: 90</span></pre>
<p>Quarantine VLAN <b>90</b> hai (lab question). Pehla command badalta hai ki authorization kya lautayega; CoA switch se dobara puchhwata hai.</p>
<p><b>Task 4, remediation:</b> priya ko wapas <code>vlan 20</code> par set karo aur wahi CoA dobara bhejo. Session VLAN 20 mein laut aata hai, aur NAS ne do CoAs log kiye hain.</p>

<div class="eg"><p><b>Worked example.</b> Yahan port bounce ki jagah reauth kyun? Real network par PC1 VLAN 90 mein jaane ke baad apna purana 10.20.20.x address rakhega, kyunki use renew karne ko koi nahi kehta. Isliye production designs VLAN changes ke liye <b>port bounce</b> use karte hain, ya VLAN rakhkar sirf dACL badalte hain (reauth kaafi hai). Lab mein simulated PC VLAN ko automatically follow karta hai, isliye reauth mechanism dikhata hai.</p></div>

<h3>Adaptive Network Control</h3>
<p><b>ANC</b> ek named policy (Quarantine, Shut_Down, Port_Bounce) ko endpoint par apply karta hai, manually ya pxGrid ke through kisi security product se (jaise Secure Firewall ya Secure Endpoint malware detect kare). ANC CoA ke through enforce karta hai, aur Session:ANCPolicy match karne wala authorization rule quarantine result lautata hai. Yeh Rapid Threat Containment hai, jo sec-ftd-integration mein cover hota hai.</p>

<div class="warn"><p><b>Common galti.</b> CoA client mein RADIUS key use karna, ya ek side par CoA port 3799 aur doosri par 1700. Switch use chup-chaap drop karta hai aur ISE report karta hai ki koi response nahi mila.</p></div>

<div class="exam"><p><b>Exam trap.</b> CoA RFC 5176 hai, server-initiated, UDP 3799 standard aur 1700 Cisco default. Port bounce un VLAN changes ke liye hai jinhe naya DHCP chahiye; reauth link up rakhta hai. Posture statuses Unknown, Compliant aur NonCompliant hain.</p></div>

<div class="scn"><h4>Remediation ke baad quarantine mein atke laptops</h4><p>Users ne apni anti-malware definitions theek kar li, agent ne Compliant report kiya, par woh quarantine VLAN mein hi rahe. ISE Live Logs mein har attempt ke liye Dynamic Authorization failed tha. Access switches par <code>aaa server radius dynamic-author</code> purane ISE PSN IP ke saath tha; migration mein PSNs re-address hue the. Naye PSN IPs ko clients ki tarah add karne se saare CoAs theek ho gaye.</p><p><b>Seekh:</b> har PSN jo CoA bhej sakta hai, har NAS par dynamic-author client hona chahiye.</p></div>

<div class="iv"><p class="q">"CoA kya hai aur aap kaunse types jaante ho?"</p><p>Strong answer: Change of Authorization, RFC 5176, ISE ko NAS ko UDP 1700 (Cisco) ya 3799 (RFC) par request bhejkar existing session badalne deta hai. Types: reauthenticate, port bounce, port disable ya shutdown, aur disconnect. Posture assessment, profile change, guest login aur ANC quarantine ke baad use hota hai. NAS par ISE ko client aur matching key ke saath aaa server radius dynamic-author hona chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Posture: agent, conditions, remediation, requirements; status Unknown, Compliant, NonCompliant.</li>
<li>Typical flow: Unknown ko redirect, NonCompliant ko quarantine, Compliant ko full access; CoA inke beech le jaata hai.</li>
<li>CoA (RFC 5176): CoA-Request aur Disconnect-Request, ACK ya NAK; UDP 3799 standard, 1700 Cisco.</li>
<li>Reauth port up rakhta hai; port bounce VLAN changes ke liye naya DHCP karwata hai; disable port band karta hai.</li>
<li>NAS ko har PSN client ke saath aur matching server-key ke saath aaa server radius dynamic-author chahiye.</li>
</ul></div>
`}};export{e as default};