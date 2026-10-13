var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>This is the revision sheet for controller deployment. It pulls together what you built across the module: where the controllers live, how they get an identity and a certificate, in which order they join, how a control connection lives and dies, how to protect the system, and how to find a fault. Read it the night before an exam or an interview, and go back to a chapter wherever a line does not feel automatic.</p>

<h3>The module on one page</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Module summary">
<rect x="10" y="15" width="150" height="85" rx="10" fill="#fde68a"/><text x="85" y="38" text-anchor="middle" class="svg-ink" font-size="13">Deploy</text><text x="85" y="58" text-anchor="middle" class="svg-muted" font-size="10">cloud, on-premises, MSP</text><text x="85" y="74" text-anchor="middle" class="svg-muted" font-size="10">size for failure</text><text x="85" y="90" text-anchor="middle" class="svg-muted" font-size="10">two or more sites</text>
<rect x="170" y="15" width="150" height="85" rx="10" fill="#bae6fd"/><text x="245" y="38" text-anchor="middle" class="svg-ink" font-size="13">Bootstrap</text><text x="245" y="58" text-anchor="middle" class="svg-muted" font-size="10">system block, VPN 0,</text><text x="245" y="74" text-anchor="middle" class="svg-muted" font-size="10">org name, vbond,</text><text x="245" y="90" text-anchor="middle" class="svg-muted" font-size="10">system IP, site ID</text>
<rect x="330" y="15" width="150" height="85" rx="10" fill="#ddd6fe"/><text x="405" y="38" text-anchor="middle" class="svg-ink" font-size="13">Trust</text><text x="405" y="58" text-anchor="middle" class="svg-muted" font-size="10">certificate, root CA,</text><text x="405" y="74" text-anchor="middle" class="svg-muted" font-size="10">authorised list,</text><text x="405" y="90" text-anchor="middle" class="svg-muted" font-size="10">DTLS or TLS</text>
<rect x="490" y="15" width="140" height="85" rx="10" fill="#bbf7d0"/><text x="560" y="38" text-anchor="middle" class="svg-ink" font-size="13">Order</text><text x="560" y="58" text-anchor="middle" class="svg-muted" font-size="10">Manager, Validator,</text><text x="560" y="74" text-anchor="middle" class="svg-muted" font-size="10">Controller, edges</text>
<rect x="10" y="115" width="310" height="70" rx="10" fill="#fed7aa"/><text x="165" y="138" text-anchor="middle" class="svg-ink" font-size="13">Protect</text><text x="165" y="158" text-anchor="middle" class="svg-muted" font-size="10">redundant Validators and Controllers,</text><text x="165" y="174" text-anchor="middle" class="svg-muted" font-size="10">Manager cluster, DR, database backup</text>
<rect x="330" y="115" width="300" height="70" rx="10" fill="#e2e8f0"/><text x="480" y="138" text-anchor="middle" class="svg-ink" font-size="13">Troubleshoot</text><text x="480" y="158" text-anchor="middle" class="svg-muted" font-size="10">state, history, identity, network;</text><text x="480" y="174" text-anchor="middle" class="svg-muted" font-size="10">read the error code</text>
<rect x="10" y="200" width="620" height="48" rx="10" fill="#f1f5f9"/><text x="320" y="222" text-anchor="middle" class="svg-ink" font-size="12">Joining a fabric needs three things: a trusted certificate, the same organization name, an authorised serial.</text><text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="11">Plus reachability to the Validator and the right clock.</text>
</svg><p class="cap">Six verbs: deploy, bootstrap, trust, order, protect, troubleshoot.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can compare Cisco-hosted cloud, on-premises and MSP deployment and say when each fits.</li>
<li>I can explain what drives load on each controller and why I size for the failure case.</li>
<li>I can write the bootstrap block of a controller, including <code>vbond ... local vbond-only</code> on the Validator.</li>
<li>I can explain Cisco PKI and the enterprise root CA, and the CSR, sign and install flow.</li>
<li>I can explain the WAN edge list, its states and why the list must be sent to the controllers.</li>
<li>I can compare DTLS and TLS, name the base port and explain port hopping.</li>
<li>I can state the onboarding order and the reason for it.</li>
<li>I can read control-connection states and the history with its error codes.</li>
<li>I can describe Validator, Controller and Manager high availability, and disaster recovery.</li>
<li>I can back up and restore the Manager database, and say what else to protect.</li>
</ul>

<h3>Mini glossary</h3>
<table class="cmp"><tr><th>Term</th><th>Meaning</th></tr>
<tr><td>Organization name</td><td>Text identifying the fabric; must match on every device, exactly</td></tr>
<tr><td>CSR</td><td>Request to a CA to sign a device's public key and identity</td></tr>
<tr><td>Root chain</td><td>The CA certificates a device uses to trust other certificates</td></tr>
<tr><td>WAN edge list</td><td>The authorised devices by chassis and serial number</td></tr>
<tr><td>Staging</td><td>A limited state for bootstrapping devices outside production</td></tr>
<tr><td>Controller group</td><td>A label used to assign edges to specific Controllers</td></tr>
<tr><td>Persona</td><td>The set of services a Manager cluster node runs</td></tr>
<tr><td>Port hopping</td><td>Using a different base port per tunnel interface, in steps of 20</td></tr>
<tr><td>Graceful restart</td><td>The period during which edges keep old OMP state if Controllers are lost</td></tr></table>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Deployment order</td><td>Manager, Validator, Controller, then edges</td></tr>
<tr><td>Default control protocol</td><td>DTLS over UDP</td></tr>
<tr><td>DTLS base port</td><td>12346, hopping by 20</td></tr>
<tr><td>Default max-control-connections</td><td>2</td></tr>
<tr><td>Edge states in the list</td><td>Valid, Staging, Invalid</td></tr>
<tr><td>Validator connection on a healthy edge</td><td>Transient: no vbond row</td></tr>
<tr><td>Default hello and tolerance</td><td>1 second and 12 seconds</td></tr>
<tr><td>CTORGNMMIS</td><td>Organization name mismatch</td></tr>
<tr><td>DCONFAIL</td><td>DTLS connection failed: reachability or ports</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"># Validator
show orchestrator connections
show orchestrator valid-vedges
# Controller and Manager
show control connections
show control connections-history
show control local-properties
show certificate installed
# WAN edge
show sdwan control connections
show sdwan control connection-history
show sdwan control local-properties
show sdwan certificate serial
# Manager database
request nms configuration-db backup path /home/admin/db_backup
request nms configuration-db restore path /home/admin/db_backup.tar.gz</pre>

<div class="warn"><p><b>Common mistakes.</b> Treating bring-up as a click-through; different organization names; forgetting to send the list; opening only port 12346; all controllers in one site; backups that were never restored; fixing the wrong layer because the history was not read.</p></div>

<div class="exam"><p><b>Exam traps.</b> A certificate alone does not let a device join: the serial must be on the list and the organization name must match. A cluster is not disaster recovery. A snapshot is not a backup. A stuck-in-connect state is a network issue, a challenge state is an identity issue. The Validator connection of a healthy edge is transient.</p></div>

<div class="scn"><h4>The ten-minute review</h4><p>An engineer joining a new team was asked to explain, at a whiteboard, how the company's fabric works. He drew the three controllers in two data centres, wrote NK-LAB on all of them, showed the certificate from the enterprise CA, the list with serial numbers, and the order in which a new edge talks to the Validator, the Controller and the Manager. Then he wrote the four commands he uses when a branch is red. The team lead said that this was the whole of the on-call runbook.</p><p><b>Lesson:</b> if you can draw it and name the commands, you understand it.</p></div>

<div class="iv"><p class="q">"Summarise how a branch router securely joins the SD-WAN fabric."</p><p>Strong answer: it gets an address and a default route in VPN 0, connects with DTLS to the Validator, and is authenticated by its certificate, the same organization name and its serial number on the authorised list. It learns the Controller and Manager addresses, connects to them, and OMP and the data-plane tunnels follow. Mention the error codes you would check when it does not work.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Trust has three parts: certificate, organization name, authorised list.</li>
<li>Order: Manager, Validator, Controller, then edges.</li>
<li>DTLS on 12346 by default; TLS over TCP is the alternative.</li>
<li>Protect with redundancy, a Manager cluster, DR and tested backups.</li>
<li>Troubleshoot with state, history, identity and network, and read both ends.</li>
</ul></div>
`,hi:`
<p>Yeh controller deployment ki revision sheet hai. Isme woh sab jama hai jo aapne module mein banaya: controllers kahan rehte hain, unhe identity aur certificate kaise milta hai, woh kis order mein join hote hain, control connection kaise jeeta aur marta hai, system ko kaise surakshit rakhna hai, aur fault kaise dhoondhna hai. Ise exam ya interview se pehle raat ko padho, aur jis chapter ki koi line automatic na lage wahan wapas jao.</p>

<h3>Module ek page par</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Module summary">
<rect x="10" y="15" width="150" height="85" rx="10" fill="#fde68a"/><text x="85" y="38" text-anchor="middle" class="svg-ink" font-size="13">Deploy</text><text x="85" y="58" text-anchor="middle" class="svg-muted" font-size="10">cloud, on-premises, MSP</text><text x="85" y="74" text-anchor="middle" class="svg-muted" font-size="10">failure ke liye size</text><text x="85" y="90" text-anchor="middle" class="svg-muted" font-size="10">do ya zyada sites</text>
<rect x="170" y="15" width="150" height="85" rx="10" fill="#bae6fd"/><text x="245" y="38" text-anchor="middle" class="svg-ink" font-size="13">Bootstrap</text><text x="245" y="58" text-anchor="middle" class="svg-muted" font-size="10">system block, VPN 0,</text><text x="245" y="74" text-anchor="middle" class="svg-muted" font-size="10">org name, vbond,</text><text x="245" y="90" text-anchor="middle" class="svg-muted" font-size="10">system IP, site ID</text>
<rect x="330" y="15" width="150" height="85" rx="10" fill="#ddd6fe"/><text x="405" y="38" text-anchor="middle" class="svg-ink" font-size="13">Trust</text><text x="405" y="58" text-anchor="middle" class="svg-muted" font-size="10">certificate, root CA,</text><text x="405" y="74" text-anchor="middle" class="svg-muted" font-size="10">authorised list,</text><text x="405" y="90" text-anchor="middle" class="svg-muted" font-size="10">DTLS ya TLS</text>
<rect x="490" y="15" width="140" height="85" rx="10" fill="#bbf7d0"/><text x="560" y="38" text-anchor="middle" class="svg-ink" font-size="13">Order</text><text x="560" y="58" text-anchor="middle" class="svg-muted" font-size="10">Manager, Validator,</text><text x="560" y="74" text-anchor="middle" class="svg-muted" font-size="10">Controller, edges</text>
<rect x="10" y="115" width="310" height="70" rx="10" fill="#fed7aa"/><text x="165" y="138" text-anchor="middle" class="svg-ink" font-size="13">Protect</text><text x="165" y="158" text-anchor="middle" class="svg-muted" font-size="10">redundant Validators aur Controllers,</text><text x="165" y="174" text-anchor="middle" class="svg-muted" font-size="10">Manager cluster, DR, database backup</text>
<rect x="330" y="115" width="300" height="70" rx="10" fill="#e2e8f0"/><text x="480" y="138" text-anchor="middle" class="svg-ink" font-size="13">Troubleshoot</text><text x="480" y="158" text-anchor="middle" class="svg-muted" font-size="10">state, history, identity, network;</text><text x="480" y="174" text-anchor="middle" class="svg-muted" font-size="10">error code padho</text>
<rect x="10" y="200" width="620" height="48" rx="10" fill="#f1f5f9"/><text x="320" y="222" text-anchor="middle" class="svg-ink" font-size="12">Fabric mein join hone ke liye teen cheezein: trusted certificate, same organization name, authorised serial.</text><text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="11">Saath mein Validator tak reachability aur sahi clock.</text>
</svg><p class="cap">Chhe kriyaayein: deploy, bootstrap, trust, order, protect, troubleshoot.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main Cisco-hosted cloud, on-premises aur MSP deployment compare kar sakta hoon aur bata sakta hoon ki har ek kab fit baithta hai.</li>
<li>Main samjha sakta hoon ki har controller par load kya daalta hai aur main failure case ke liye size kyun karta hoon.</li>
<li>Main controller ka bootstrap block likh sakta hoon, Validator par <code>vbond ... local vbond-only</code> samet.</li>
<li>Main Cisco PKI aur enterprise root CA, aur CSR, sign aur install flow samjha sakta hoon.</li>
<li>Main WAN edge list, uski states aur yeh ki list controllers ko kyun bhejni hoti hai, samjha sakta hoon.</li>
<li>Main DTLS aur TLS compare kar sakta hoon, base port bata sakta hoon aur port hopping samjha sakta hoon.</li>
<li>Main onboarding order aur uski wajah bata sakta hoon.</li>
<li>Main control-connection states aur error codes ke saath history padh sakta hoon.</li>
<li>Main Validator, Controller aur Manager ki high availability, aur disaster recovery bata sakta hoon.</li>
<li>Main Manager database ka backup aur restore kar sakta hoon, aur bata sakta hoon ki aur kya protect karna hai.</li>
</ul>

<h3>Mini glossary</h3>
<table class="cmp"><tr><th>Term</th><th>Matlab</th></tr>
<tr><td>Organization name</td><td>Fabric ko pehchanne wala text; har device par exactly match hona chahiye</td></tr>
<tr><td>CSR</td><td>CA ko bheji request ki woh device ki public key aur identity ko sign kare</td></tr>
<tr><td>Root chain</td><td>CA certificates jinse device doosre certificates par trust karta hai</td></tr>
<tr><td>WAN edge list</td><td>Chassis aur serial number se authorised devices</td></tr>
<tr><td>Staging</td><td>Production ke bahar devices bootstrap karne ki limited state</td></tr>
<tr><td>Controller group</td><td>Edges ko khaas Controllers se assign karne ka label</td></tr>
<tr><td>Persona</td><td>Manager cluster node jo services chalata hai unka set</td></tr>
<tr><td>Port hopping</td><td>Har tunnel interface ke liye alag base port, 20 ke steps mein</td></tr>
<tr><td>Graceful restart</td><td>Woh period jisme edges Controllers khone par purani OMP state rakhte hain</td></tr></table>

<h3>Sabse zyada puche jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Deployment order</td><td>Manager, Validator, Controller, phir edges</td></tr>
<tr><td>Default control protocol</td><td>UDP par DTLS</td></tr>
<tr><td>DTLS base port</td><td>12346, 20 ke steps mein hopping</td></tr>
<tr><td>Default max-control-connections</td><td>2</td></tr>
<tr><td>List mein edge states</td><td>Valid, Staging, Invalid</td></tr>
<tr><td>Healthy edge par Validator connection</td><td>Transient: vbond row nahi</td></tr>
<tr><td>Default hello aur tolerance</td><td>1 second aur 12 second</td></tr>
<tr><td>CTORGNMMIS</td><td>Organization name mismatch</td></tr>
<tr><td>DCONFAIL</td><td>DTLS connection fail: reachability ya ports</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"># Validator
show orchestrator connections
show orchestrator valid-vedges
# Controller and Manager
show control connections
show control connections-history
show control local-properties
show certificate installed
# WAN edge
show sdwan control connections
show sdwan control connection-history
show sdwan control local-properties
show sdwan certificate serial
# Manager database
request nms configuration-db backup path /home/admin/db_backup
request nms configuration-db restore path /home/admin/db_backup.tar.gz</pre>

<div class="warn"><p><b>Common mistakes.</b> Bring-up ko click-through samajhna; alag organization names; list bhejna bhoolna; sirf port 12346 kholna; saare controllers ek site mein; aise backups jo kabhi restore nahi hue; history na padhne se galat layer theek karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Sirf certificate se device join nahi karta: serial list mein hona chahiye aur organization name match hona chahiye. Cluster disaster recovery nahi hai. Snapshot backup nahi hai. Connect mein atkna network issue hai, challenge state identity issue. Healthy edge ka Validator connection transient hota hai.</p></div>

<div class="scn"><h4>Das minute ka review</h4><p>Ek nayi team join karne wale engineer se whiteboard par samjhane ko kaha gaya ki company ka fabric kaise kaam karta hai. Usne do data centres mein teen controllers banaye, sab par NK-LAB likha, enterprise CA ka certificate dikhaya, serial numbers wali list, aur woh order jisme naya edge Validator, Controller aur Manager se baat karta hai. Phir usne woh chaar commands likhe jo woh branch laal hone par use karta hai. Team lead ne kaha ki yahi poora on-call runbook hai.</p><p><b>Seekh:</b> agar aap ise draw kar sakte ho aur commands ke naam bata sakte ho, to aap ise samajhte ho.</p></div>

<div class="iv"><p class="q">"Branch router SD-WAN fabric mein surakshit tareeke se kaise join karta hai, summary mein batao."</p><p>Strong answer: use VPN 0 mein address aur default route milta hai, woh Validator se DTLS se connect hota hai, aur uske certificate, same organization name aur authorised list mein uske serial number se authenticate hota hai. Woh Controller aur Manager ke addresses seekhta hai, unse connect hota hai, aur OMP aur data-plane tunnels follow karte hain. Jab kaam na kare to jo error codes check karoge unka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Trust ke teen hisse: certificate, organization name, authorised list.</li>
<li>Order: Manager, Validator, Controller, phir edges.</li>
<li>Default roop se 12346 par DTLS; TCP par TLS vikalp hai.</li>
<li>Redundancy, Manager cluster, DR aur tested backups se protect karo.</li>
<li>State, history, identity aur network se troubleshoot karo, aur dono ends padho.</li>
</ul></div>
`}};export{e as default};