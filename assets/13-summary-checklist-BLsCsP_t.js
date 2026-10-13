var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before an exam, a good student does not reread the whole book. She keeps a one-page sheet: what I must be able to do, what words I must be able to explain, and which facts get tested again and again. This chapter is that sheet for the module on Panorama architecture, onboarding and connection troubleshooting.</p>

<h3>You should now be able to</h3>
<ul>
<li>Explain why central management beats managing firewalls one by one (consistency, speed, visibility, audit).</li>
<li>Describe the two jobs of Panorama and the difference between Panorama mode, management only and Log Collector.</li>
<li>Separate the management plane from the data plane and say what happens to traffic when Panorama is down.</li>
<li>Say what device groups hold (policy and objects) and what templates hold (network and device settings), and what stays local.</li>
<li>Onboard a firewall: panorama-server on the firewall, serial in managed devices on Panorama, commits on both, management path in place.</li>
<li>Read show devices all, show devices connected, show devicegroups and show jobs all.</li>
<li>Troubleshoot a firewall that will not connect using show panorama-status and ms.log, and fix it on the correct device.</li>
<li>Discuss administrators, roles and access domains, and the main sizing and design questions.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Managed device</dt><dd>A firewall whose serial number is registered on Panorama.</dd>
<dt>Serial number</dt><dd>The unique identity Panorama uses for a firewall.</dd>
<dt>Management plane</dt><dd>The part of a firewall that holds configuration and talks to Panorama.</dd>
<dt>Data plane</dt><dd>The part that inspects and forwards user traffic.</dd>
<dt>Device group</dt><dd>A set of firewalls sharing policy and objects.</dd>
<dt>Template stack</dt><dd>Templates layered in priority order, assigned to firewalls.</dd>
<dt>In Sync / Out of Sync</dt><dd>Whether the last committed configuration has been pushed to the firewall.</dd>
<dt>ms.log</dt><dd>The management log, read with less mp-log ms.log.</dd>
<dt>Job</dt><dd>A recorded commit, push (CommitAll) or Validate action.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="tbl"><tr><th>Fact</th><th>Remember</th></tr>
<tr><td>Management connection</td><td>Real firewalls connect to Panorama on TCP 3978 for management and log forwarding.</td></tr>
<tr><td>Connection needs</td><td>Right panorama-server, a reachable management network, and the serial on Panorama's list.</td></tr>
<tr><td>Fix location</td><td>Address and management IP on the firewall; unknown serial on Panorama.</td></tr>
<tr><td>Connected vs sync</td><td>Connected is the link; Out of Sync is undelivered configuration.</td></tr>
<tr><td>Commit vs push</td><td>Commit changes Panorama only; a push delivers to firewalls.</td></tr>
<tr><td>Panorama down</td><td>Traffic continues; central changes and visibility pause.</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Module flow">
<rect x="10" y="40" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="65" y="70" text-anchor="middle" class="svg-ink" font-size="12">Point</text>
<rect x="140" y="40" width="110" height="50" rx="8" fill="#fde68a"/><text x="195" y="70" text-anchor="middle" class="svg-ink" font-size="12">Register</text>
<rect x="270" y="40" width="110" height="50" rx="8" fill="#bae6fd"/><text x="325" y="70" text-anchor="middle" class="svg-ink" font-size="12">Assign</text>
<rect x="400" y="40" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="455" y="70" text-anchor="middle" class="svg-ink" font-size="12">Verify</text>
<rect x="530" y="40" width="100" height="50" rx="8" fill="#fed7aa"/><text x="580" y="70" text-anchor="middle" class="svg-ink" font-size="12">Push</text>
<line x1="120" y1="65" x2="140" y2="65" stroke="#64748b" stroke-width="2"/><line x1="250" y1="65" x2="270" y2="65" stroke="#64748b" stroke-width="2"/><line x1="380" y1="65" x2="400" y2="65" stroke="#64748b" stroke-width="2"/><line x1="510" y1="65" x2="530" y2="65" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The onboarding flow of this module. The next module adds templates; push comes later in the track.</p></div>

<div class="exam"><p><b>Exam trap.</b> If a question describes a firewall with Connected: no and a correct server address, do not stop at the firewall. Ask whether the serial is registered and whether the management network can reach Panorama.</p></div>
<div class="warn"><p><b>Honest boundaries.</b> The simulator has no web GUI, no licences, certificates or authentication keys, no real traffic on TCP 3978 and no administrator roles. In real deployments follow the documentation for your PAN-OS version for those parts and for any limits.</p></div>

<div class="scn"><h4>Handover note</h4><p>An engineer going on leave wrote a half-page note for the cover engineer: the registration method, the three connection failure families, where to read ms.log, how to read the inventory, and a reminder that commit does not deliver. The cover engineer fixed a new branch the same afternoon without calling anyone.</p><p><b>Lesson:</b> if you can write the handover note, you know the module.</p></div>

<div class="iv"><p class="q">"Give me a two-minute overview of Panorama onboarding and troubleshooting."</p><p>Panorama is the central manager for configuration and logs, not in the traffic path. To onboard: panorama-server on the firewall, serial in managed devices on Panorama, commit on both, working management network, then assign to a device group and template stack. To troubleshoot: show panorama-status and ms.log, classify as address, registration or network, fix on the right device, verify.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Panorama is central management, not a traffic device; firewalls continue if it is down.</li>
<li>Onboarding needs three things to line up: server address, registered serial, reachable management network.</li>
<li>Device groups carry policy and objects; templates carry network and device settings.</li>
<li>Read the inventory: Connected is the link, sync columns are delivery.</li>
<li>Troubleshoot with evidence from both devices, then fix one cause at a time.</li>
</ul></div>
`,hi:`
<p>Exam se pehle achha student poori kitaab dobara nahi padhta. Wo ek page ki sheet rakhta hai: mujhe kya karna aana chahiye, kaun se words explain karne aane chahiye, aur kaun se facts baar-baar test hote hain. Ye chapter Panorama architecture, onboarding aur connection troubleshooting module ki wahi sheet hai.</p>

<h3>Ab aap kar sakte ho</h3>
<ul>
<li>Samjhao ki central management firewalls ko ek-ek karke manage karne se kyun behtar hai (consistency, speed, visibility, audit).</li>
<li>Panorama ki do jobs aur Panorama mode, management only aur Log Collector ka difference batao.</li>
<li>Management plane ko data plane se alag karo aur batao Panorama down hone par traffic ka kya hota hai.</li>
<li>Batao device groups kya rakhte hain (policy aur objects) aur templates kya rakhte hain (network aur device settings), aur kya local rehta hai.</li>
<li>Firewall onboard karo: firewall par panorama-server, Panorama par managed devices mein serial, dono par commit, management path maujood.</li>
<li>show devices all, show devices connected, show devicegroups aur show jobs all padho.</li>
<li>Na jurne wale firewall ko show panorama-status aur ms.log se troubleshoot karo aur sahi device par fix karo.</li>
<li>Administrators, roles aur access domains, aur mukhya sizing aur design sawalon par baat karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Managed device</dt><dd>Aisa firewall jiska serial number Panorama par registered hai.</dd>
<dt>Serial number</dt><dd>Wo unique identity jo Panorama firewall ke liye use karta hai.</dd>
<dt>Management plane</dt><dd>Firewall ka wo hissa jo configuration rakhta hai aur Panorama se baat karta hai.</dd>
<dt>Data plane</dt><dd>Wo hissa jo user traffic inspect aur forward karta hai.</dd>
<dt>Device group</dt><dd>Firewalls ka set jo policy aur objects share karta hai.</dd>
<dt>Template stack</dt><dd>Priority order mein layered templates, firewalls ko assigned.</dd>
<dt>In Sync / Out of Sync</dt><dd>Last committed configuration firewall ko push hui ya nahi.</dd>
<dt>ms.log</dt><dd>Management log, less mp-log ms.log se padhte hain.</dd>
<dt>Job</dt><dd>Recorded commit, push (CommitAll) ya Validate action.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<table class="tbl"><tr><th>Fact</th><th>Yaad rakho</th></tr>
<tr><td>Management connection</td><td>Real firewalls management aur log forwarding ke liye TCP 3978 par Panorama se connect hote hain.</td></tr>
<tr><td>Connection ko chahiye</td><td>Sahi panorama-server, reachable management network, aur Panorama ki list mein serial.</td></tr>
<tr><td>Fix kahan</td><td>Address aur management IP firewall par; unknown serial Panorama par.</td></tr>
<tr><td>Connected vs sync</td><td>Connected link hai; Out of Sync matlab configuration deliver nahi hui.</td></tr>
<tr><td>Commit vs push</td><td>Commit sirf Panorama badalta hai; push firewalls tak deliver karta hai.</td></tr>
<tr><td>Panorama down</td><td>Traffic chalta rehta hai; central changes aur visibility ruk jati hai.</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Module flow">
<rect x="10" y="40" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="65" y="70" text-anchor="middle" class="svg-ink" font-size="12">Point</text>
<rect x="140" y="40" width="110" height="50" rx="8" fill="#fde68a"/><text x="195" y="70" text-anchor="middle" class="svg-ink" font-size="12">Register</text>
<rect x="270" y="40" width="110" height="50" rx="8" fill="#bae6fd"/><text x="325" y="70" text-anchor="middle" class="svg-ink" font-size="12">Assign</text>
<rect x="400" y="40" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="455" y="70" text-anchor="middle" class="svg-ink" font-size="12">Verify</text>
<rect x="530" y="40" width="100" height="50" rx="8" fill="#fed7aa"/><text x="580" y="70" text-anchor="middle" class="svg-ink" font-size="12">Push</text>
<line x1="120" y1="65" x2="140" y2="65" stroke="#64748b" stroke-width="2"/><line x1="250" y1="65" x2="270" y2="65" stroke="#64748b" stroke-width="2"/><line x1="380" y1="65" x2="400" y2="65" stroke="#64748b" stroke-width="2"/><line x1="510" y1="65" x2="530" y2="65" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Is module ka onboarding flow. Agla module templates jodta hai; push track mein baad mein aata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Sawal mein firewall Connected: no aur server address sahi ho, to firewall par mat ruko. Poochho serial registered hai ya nahi aur management network Panorama tak pahunch sakta hai ya nahi.</p></div>
<div class="warn"><p><b>Honest boundaries.</b> Simulator mein web GUI, licences, certificates ya authentication keys, TCP 3978 par real traffic aur administrator roles nahi hain. Real deployments mein un hisson aur kisi bhi limits ke liye apne PAN-OS version ki documentation follow karo.</p></div>

<div class="scn"><h4>Handover note</h4><p>Chhutti par jaane wale engineer ne cover engineer ke liye aadha page ka note likha: registration method, connection failure ki teen families, ms.log kahan padhna hai, inventory kaise padhni hai, aur yaad dilaya ki commit deliver nahi karta. Cover engineer ne usi dopahar naya branch bina kisi ko call kiye fix kar diya.</p><p><b>Lesson:</b> aap handover note likh sako to aapko module aata hai.</p></div>

<div class="iv"><p class="q">"Panorama onboarding aur troubleshooting ka do minute ka overview do."</p><p>Panorama configuration aur logs ka central manager hai, traffic path mein nahi. Onboard: firewall par panorama-server, Panorama par managed devices mein serial, dono par commit, working management network, phir device group aur template stack mein assign. Troubleshoot: show panorama-status aur ms.log, address, registration ya network mein classify, sahi device par fix, verify.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Panorama central management hai, traffic device nahi; wo down ho to firewalls chalte rehte hain.</li>
<li>Onboarding mein teen cheezein line up honi chahiye: server address, registered serial, reachable management network.</li>
<li>Device groups policy aur objects rakhte hain; templates network aur device settings.</li>
<li>Inventory padho: Connected link hai, sync columns delivery.</li>
<li>Dono devices ki evidence se troubleshoot karo, phir ek-ek cause fix karo.</li>
</ul></div>
`}};export{e as default};