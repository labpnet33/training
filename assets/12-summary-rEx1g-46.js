var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module knowing only that a switch has ports. You now understand the full path of one login and can build, read and repair a first ClearPass service. This chapter gathers everything into a checklist, a glossary and a set of facts that interviewers and exams like to test. Module 2 builds on it with wired access in more depth (roles, VLAN attributes, MAC authentication).</p>

<h3>The whole module on one page</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Module summary">
<rect x="10" y="20" width="100" height="50" rx="8" fill="#bae6fd"/><text x="60" y="50" text-anchor="middle" class="svg-ink" font-size="12">Endpoint</text>
<rect x="130" y="20" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="180" y="50" text-anchor="middle" class="svg-ink" font-size="12">NAD / switch</text>
<rect x="250" y="20" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="300" y="50" text-anchor="middle" class="svg-ink" font-size="12">Service</text>
<rect x="370" y="20" width="100" height="50" rx="8" fill="#fde68a"/><text x="420" y="50" text-anchor="middle" class="svg-ink" font-size="12">Auth + roles</text>
<rect x="490" y="20" width="140" height="50" rx="8" fill="#fed7aa"/><text x="560" y="50" text-anchor="middle" class="svg-ink" font-size="12">Enforcement</text>
<line x1="110" y1="45" x2="130" y2="45" stroke="#64748b" stroke-width="2"/><line x1="230" y1="45" x2="250" y2="45" stroke="#64748b" stroke-width="2"/><line x1="350" y1="45" x2="370" y2="45" stroke="#64748b" stroke-width="2"/><line x1="470" y1="45" x2="490" y2="45" stroke="#64748b" stroke-width="2"/>
<text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">Aruba-User-Role goes back; the switch needs the same role and VLAN</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Evidence: Access Tracker, Event Viewer, show port-access clients</text>
<text x="320" y="175" text-anchor="middle" class="svg-accent" font-size="13">Trust (NAD) first, then service, then policy</text>
</svg><p class="cap">The complete chain you built in this module.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain AAA, NAC, supplicant, authenticator and authentication server in plain words.</li>
<li>Describe RADIUS (UDP 1812 and 1813, shared secret, Access-Request, Accept, Reject, Challenge).</li>
<li>Explain why 802.1X is tried first and MAC authentication is the fallback.</li>
<li>Register a switch as a network device with the right source IP and secret.</li>
<li>Configure the RADIUS host, server group and port-access method on an AOS-CX style switch.</li>
<li>Build user, profile, policy and service in the right order, and the matching switch role.</li>
<li>Read an Access Tracker record: Summary, Input, Output, Alerts.</li>
<li>Diagnose 9002 and correct a service classification rule.</li>
<li>Tell apart no record, 9002, 215, 216, 217 and Accept-but-no-access.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>NAD</dt><dd>Network access device, such as the switch. The RADIUS client.</dd>
<dt>CPPM</dt><dd>ClearPass Policy Manager.</dd>
<dt>Supplicant</dt><dd>Client software that performs 802.1X on the endpoint.</dd>
<dt>EAPOL</dt><dd>EAP over LAN, the Layer 2 frames between supplicant and switch.</dd>
<dt>Service</dt><dd>A ClearPass workflow selected by classification rules.</dd>
<dt>Enforcement profile</dt><dd>Package of attributes returned to the NAD.</dd>
<dt>Enforcement policy</dt><dd>Rules and a default that select profiles.</dd>
<dt>Role (ClearPass)</dt><dd>Label from role mapping used in decisions.</dd>
<dt>Role (switch)</dt><dd>Port behaviour bundle named by Aruba-User-Role.</dd>
<dt>Access Tracker</dt><dd>Per-request record with Summary, Input, Output, Alerts.</dd>
<dt>CoA</dt><dd>Change of Authorization (RFC 5176, UDP 3799).</dd></dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>RADIUS ports</td><td>UDP 1812 authentication, 1813 accounting</td></tr>
<tr><td>CoA port</td><td>UDP 3799</td></tr>
<tr><td>NAD identification</td><td>Source IP of the RADIUS packet; lab: 10.20.99.2</td></tr>
<tr><td>Shared secret in the lab</td><td>ArubaNK1, per device, case-sensitive</td></tr>
<tr><td>Wired NAS-Port-Type</td><td>15 (wireless is 19)</td></tr>
<tr><td>Service evaluation</td><td>Top to bottom, first match wins, none = 9002</td></tr>
<tr><td>215 / 216 / 217</td><td>Password mismatch / not found / disabled</td></tr>
<tr><td>VLAN attributes</td><td>Tunnel-Type 13, Tunnel-Medium-Type 6, Tunnel-Private-Group-Id</td></tr>
<tr><td>Role attribute</td><td>Radius:Aruba:Aruba-User-Role, name compared exactly</td></tr>
<tr><td>Safe policy default</td><td>[Deny Access Profile]</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! ACCESS (AOS-CX style)</span>
radius-server host 10.20.60.10 key plaintext ArubaNK1
aaa group server radius CPPM
    server 10.20.60.10
aaa authentication port-access dot1x authenticator
    radius server-group CPPM
    enable
port-access role EMPLOYEE
    vlan access 10
show port-access clients detail
show radius-server

<span class="c">! CPPM (Lab shell, mirrors the GUI path)</span>
configuration network device add ACCESS ip 10.20.99.2 secret ArubaNK1 vendor Aruba coa off
configuration identity local-user add alice password Pass@2024 attr Department=Engineering
configuration enforcement profile add EP-EMPLOYEE type radius
configuration enforcement profile EP-EMPLOYEE attribute add Radius:Aruba:Aruba-User-Role EMPLOYEE
configuration enforcement policy add EPOL-WIRED default "[Deny Access Profile]"
configuration service add "Wired 802.1X" template wired-802.1x
monitoring access-tracker detail latest alerts
monitoring event-viewer</pre>

<h3>Concepts mentioned but not simulated in the lab</h3>
<p>The real Policy Manager web GUI, publisher and subscriber clusters, Active Directory and LDAP sources, EAP-TLS and certificates (Onboard), guest portals, OnGuard posture, device profiling, TACACS+ administration, downloadable user roles, Insight reports, wireless controllers and dynamic segmentation. They are real and widely used; this track introduces them honestly and uses the lab for what it models.</p>

<div class="eg"><p><b>Worked example.</b> Final self-test: a new switch is installed and nobody can log in. State the first three things you check, in order. Answer: switch RADIUS server status; Access Tracker for a record; if none, the Event Viewer for an unknown NAD or secret mismatch. If a record exists with 9002, then service rules. That chain is the whole module.</p></div>

<div class="warn"><p><b>Common mistakes to avoid on the exam and on the job.</b> Treating ClearPass as inline; confusing ClearPass roles with switch roles; trusting an Accept without checking the switch; leaving a test service above production; assuming policy changes affect connected users instantly.</p></div>

<div class="exam"><p><b>Exam trap recap.</b> Unknown NAD is a silent drop, not a reject. 9002 is a service problem, not a credential problem. Authentication success is not authorization. Role names must match exactly.</p></div>

<div class="scn"><h4>The first week on the job</h4><p>A new network engineer inherited a ClearPass site. On Monday nobody could log in on floor 2. She opened the switch RADIUS status (alive), the Access Tracker (9002), the service rules (NAS-Port-Type 19 after a clone) and corrected the value, then verified two laptops. The whole incident took twelve minutes and her manager asked which course she had followed.</p><p><b>Lesson:</b> a method beats memory. Stations in order, evidence at each one.</p></div>

<div class="iv"><p class="q">"Summarise in one minute how ClearPass handles a wired 802.1X login."</p><p>Strong answer: the switch sends a RADIUS Access-Request; ClearPass checks the NAD by IP and secret, classifies it to a service, authenticates against the service's source, maps attributes to roles, enforces by policy and returns a profile such as Aruba-User-Role. The switch applies the role and VLAN. The Access Tracker records it, and I verify on the switch.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order of decision: NAD, service, authentication, role mapping, enforcement, response.</li>
<li>Trust first: address and secret must match on both sides.</li>
<li>Roles on the two devices are different objects with exact-match names.</li>
<li>Read Access Tracker, Event Viewer and the switch before changing anything.</li>
<li>Next module: wired access in depth, with role case, VLAN attributes and MAC authentication.</li>
</ul></div>
`,hi:`
<p>Is module ki shuruaat mein aap sirf itna jaante the ki switch mein ports hote hain. Ab aap ek login ka poora path samajhte ho aur pehli ClearPass service build, read aur repair kar sakte ho. Yeh chapter sab kuch ek checklist, glossary aur un facts mein samet deta hai jo interviewers aur exams test karna pasand karte hain. Module 2 isi par wired access ko zyada gehrai se banata hai (roles, VLAN attributes, MAC authentication).</p>

<h3>Poora module ek page par</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Module summary">
<rect x="10" y="20" width="100" height="50" rx="8" fill="#bae6fd"/><text x="60" y="50" text-anchor="middle" class="svg-ink" font-size="12">Endpoint</text>
<rect x="130" y="20" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="180" y="50" text-anchor="middle" class="svg-ink" font-size="12">NAD / switch</text>
<rect x="250" y="20" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="300" y="50" text-anchor="middle" class="svg-ink" font-size="12">Service</text>
<rect x="370" y="20" width="100" height="50" rx="8" fill="#fde68a"/><text x="420" y="50" text-anchor="middle" class="svg-ink" font-size="12">Auth + roles</text>
<rect x="490" y="20" width="140" height="50" rx="8" fill="#fed7aa"/><text x="560" y="50" text-anchor="middle" class="svg-ink" font-size="12">Enforcement</text>
<line x1="110" y1="45" x2="130" y2="45" stroke="#64748b" stroke-width="2"/><line x1="230" y1="45" x2="250" y2="45" stroke="#64748b" stroke-width="2"/><line x1="350" y1="45" x2="370" y2="45" stroke="#64748b" stroke-width="2"/><line x1="470" y1="45" x2="490" y2="45" stroke="#64748b" stroke-width="2"/>
<text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">Aruba-User-Role wapas jaata hai; switch par wahi role aur VLAN chahiye</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Evidence: Access Tracker, Event Viewer, show port-access clients</text>
<text x="320" y="175" text-anchor="middle" class="svg-accent" font-size="13">Pehle trust (NAD), phir service, phir policy</text>
</svg><p class="cap">Poori chain jo aapne is module mein banayi.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>AAA, NAC, supplicant, authenticator aur authentication server saral shabdon mein explain karo.</li>
<li>RADIUS describe karo (UDP 1812 aur 1813, shared secret, Access-Request, Accept, Reject, Challenge).</li>
<li>Explain karo ki 802.1X pehle kyun try hota hai aur MAC authentication fallback kyun hai.</li>
<li>Switch ko sahi source IP aur secret ke saath network device ke roop mein register karo.</li>
<li>AOS-CX style switch par RADIUS host, server group aur port-access method configure karo.</li>
<li>User, profile, policy aur service sahi order mein banao, aur matching switch role bhi.</li>
<li>Access Tracker record padho: Summary, Input, Output, Alerts.</li>
<li>9002 diagnose karo aur service classification rule correct karo.</li>
<li>No record, 9002, 215, 216, 217 aur Accept-but-no-access ko alag pehchano.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>NAD</dt><dd>Network access device, jaise switch. RADIUS client.</dd>
<dt>CPPM</dt><dd>ClearPass Policy Manager.</dd>
<dt>Supplicant</dt><dd>Endpoint par 802.1X karne wala client software.</dd>
<dt>EAPOL</dt><dd>EAP over LAN, supplicant aur switch ke beech Layer 2 frames.</dd>
<dt>Service</dt><dd>Classification rules se chuni jaane wali ClearPass workflow.</dd>
<dt>Enforcement profile</dt><dd>NAD ko return hone wale attributes ka package.</dd>
<dt>Enforcement policy</dt><dd>Rules aur ek default jo profiles chunte hain.</dd>
<dt>Role (ClearPass)</dt><dd>Role mapping se bana label jo decisions mein use hota hai.</dd>
<dt>Role (switch)</dt><dd>Aruba-User-Role se named port behaviour bundle.</dd>
<dt>Access Tracker</dt><dd>Per-request record, Summary, Input, Output, Alerts ke saath.</dd>
<dt>CoA</dt><dd>Change of Authorization (RFC 5176, UDP 3799).</dd></dl>

<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>RADIUS ports</td><td>UDP 1812 authentication, 1813 accounting</td></tr>
<tr><td>CoA port</td><td>UDP 3799</td></tr>
<tr><td>NAD identification</td><td>RADIUS packet ka source IP; lab: 10.20.99.2</td></tr>
<tr><td>Lab mein shared secret</td><td>ArubaNK1, per device, case-sensitive</td></tr>
<tr><td>Wired NAS-Port-Type</td><td>15 (wireless 19 hai)</td></tr>
<tr><td>Service evaluation</td><td>Upar se neeche, first match jeetta hai, koi nahi = 9002</td></tr>
<tr><td>215 / 216 / 217</td><td>Password mismatch / not found / disabled</td></tr>
<tr><td>VLAN attributes</td><td>Tunnel-Type 13, Tunnel-Medium-Type 6, Tunnel-Private-Group-Id</td></tr>
<tr><td>Role attribute</td><td>Radius:Aruba:Aruba-User-Role, naam exactly compare hota hai</td></tr>
<tr><td>Safe policy default</td><td>[Deny Access Profile]</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! ACCESS (AOS-CX style)</span>
radius-server host 10.20.60.10 key plaintext ArubaNK1
aaa group server radius CPPM
    server 10.20.60.10
aaa authentication port-access dot1x authenticator
    radius server-group CPPM
    enable
port-access role EMPLOYEE
    vlan access 10
show port-access clients detail
show radius-server

<span class="c">! CPPM (Lab shell, GUI path ko mirror karta hai)</span>
configuration network device add ACCESS ip 10.20.99.2 secret ArubaNK1 vendor Aruba coa off
configuration identity local-user add alice password Pass@2024 attr Department=Engineering
configuration enforcement profile add EP-EMPLOYEE type radius
configuration enforcement profile EP-EMPLOYEE attribute add Radius:Aruba:Aruba-User-Role EMPLOYEE
configuration enforcement policy add EPOL-WIRED default "[Deny Access Profile]"
configuration service add "Wired 802.1X" template wired-802.1x
monitoring access-tracker detail latest alerts
monitoring event-viewer</pre>

<h3>Jo concepts mention hue par lab mein simulate nahi hote</h3>
<p>Real Policy Manager web GUI, publisher aur subscriber clusters, Active Directory aur LDAP sources, EAP-TLS aur certificates (Onboard), guest portals, OnGuard posture, device profiling, TACACS+ administration, downloadable user roles, Insight reports, wireless controllers aur dynamic segmentation. Yeh sab real hain aur widely use hote hain; yeh track unhe imaandari se introduce karta hai aur lab ko us cheez ke liye use karta hai jo woh model karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Final self-test: naya switch install hua aur koi login nahi kar pa raha. Pehli teen cheezein order mein batao jo aap check karoge. Jawab: switch RADIUS server status; record ke liye Access Tracker; agar nahi, to unknown NAD ya secret mismatch ke liye Event Viewer. Agar record 9002 ke saath hai, to service rules. Yahi poora module hai.</p></div>

<div class="warn"><p><b>Exam aur job mein bachne wali common mistakes.</b> ClearPass ko inline samajhna; ClearPass roles aur switch roles ko confuse karna; switch check kiye bina Accept par bharosa karna; production ke upar test service chhod dena; yeh maanna ki policy changes connected users par turant lagte hain.</p></div>

<div class="exam"><p><b>Exam trap recap.</b> Unknown NAD silent drop hai, reject nahi. 9002 service problem hai, credential problem nahi. Authentication success authorization nahi hai. Role names exactly match hone chahiye.</p></div>

<div class="scn"><h4>Job ka pehla hafta</h4><p>Ek naye network engineer ko ClearPass site mili. Monday ko floor 2 par koi login nahi kar pa raha tha. Usne switch RADIUS status (alive), Access Tracker (9002), service rules (clone ke baad NAS-Port-Type 19) khole aur value correct ki, phir do laptops verify kiye. Poora incident barah minute mein khatam hua aur manager ne poocha ki usne kaunsa course kiya tha.</p><p><b>Seekh:</b> method yaad se behtar hai. Stations order mein, har ek par evidence.</p></div>

<div class="iv"><p class="q">"Ek minute mein batao ClearPass wired 802.1X login ko kaise handle karta hai."</p><p>Strong answer: switch RADIUS Access-Request bhejta hai; ClearPass IP aur secret se NAD check karta hai, use service mein classify karta hai, service ke source se authenticate karta hai, attributes ko roles mein map karta hai, policy se enforce karta hai aur Aruba-User-Role jaisa profile return karta hai. Switch role aur VLAN apply karta hai. Access Tracker record karta hai, aur main switch par verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Decision order: NAD, service, authentication, role mapping, enforcement, response.</li>
<li>Pehle trust: address aur secret dono sides par match hon.</li>
<li>Dono devices ke roles alag objects hain, exact-match names ke saath.</li>
<li>Kuch badalne se pehle Access Tracker, Event Viewer aur switch padho.</li>
<li>Agla module: wired access gehrai se, role case, VLAN attributes aur MAC authentication ke saath.</li>
</ul></div>
`}};export{e as default};