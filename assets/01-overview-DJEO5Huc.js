var e={id:`overview`,h:{en:`What you will learn: why the controllers come first`,hi:`Is module mein kya seekhoge: controllers pehle kyun aate hain`},body:{en:`
<p>Think of a large office building with a reception desk. Nobody gets past the lobby without a badge. The badge is checked by the reception, the visitor's name must be on the guest list, and the visitor must be told which floor to go to. Until all three things work, no one can do any work in the building, however good the offices are. The Catalyst SD-WAN controllers are that reception, guest list and floor map. If they are not deployed correctly, no branch can join the fabric, and nothing you learned about OMP, TLOCs and policies matters.</p>
<p>In the architecture module you learned what the Manager, Controller and Validator do. This module teaches you how to <b>put them in place and keep them healthy</b>: choose a deployment model, bootstrap each controller, build the certificate trust, bring the devices up in the right order, read the control-connection states, protect the system with clustering and backups, and troubleshoot when a device will not connect.</p>

<h3>What you will learn</h3>
<ul>
<li>The three deployment models: Cisco-hosted cloud, on-premises and managed service provider.</li>
<li>How scale and sizing affect the design, and what to keep qualitative until you read the current Cisco scale sheet.</li>
<li>The bootstrap configuration of a controller: system block, VPN 0, VPN 512, organization name, Validator address, system IP and site ID.</li>
<li>Certificates: Cisco PKI, enterprise root CA, the signing flow, and the WAN edge authorised list.</li>
<li>Control-plane security: DTLS versus TLS and the ports involved.</li>
<li>The onboarding order, and the lifecycle of a control connection.</li>
<li>High availability, clustering, disaster recovery, backup and restore.</li>
<li>A fault-finding routine using the control-connection outputs and error codes.</li>
</ul>
<p><b>Prerequisites.</b> The architecture module, or at least a clear picture of the four planes and of what a TLOC and OMP are. Basic IP routing, DNS and NTP are enough on the network side.</p>

<h3>The trust triangle</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Three things that must match for a device to join">
<rect x="230" y="10" width="180" height="50" rx="10" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Organization name</text><text x="320" y="50" text-anchor="middle" class="svg-muted" font-size="10">same text on every device</text>
<rect x="30" y="150" width="190" height="55" rx="10" fill="#bae6fd"/><text x="125" y="173" text-anchor="middle" class="svg-ink" font-size="13">Certificate</text><text x="125" y="192" text-anchor="middle" class="svg-muted" font-size="10">signed by a CA both sides trust</text>
<rect x="420" y="150" width="190" height="55" rx="10" fill="#bbf7d0"/><text x="515" y="173" text-anchor="middle" class="svg-ink" font-size="13">Authorised list</text><text x="515" y="192" text-anchor="middle" class="svg-muted" font-size="10">serial number is on the list</text>
<path d="M290 60 L180 150 M350 60 L460 150 M220 178 L420 178" stroke="#64748b" stroke-width="2" fill="none"/>
<rect x="190" y="220" width="260" height="38" rx="10" fill="#f1f5f9"/><text x="320" y="244" text-anchor="middle" class="svg-ink" font-size="12">Plus: IP reachability and the correct clock</text>
</svg><p class="cap">A device joins only when its identity is believed (certificate), allowed (list) and in the right company (organization name).</p></div>

<h3>The lab fabric used in this track</h3>
<p>All the examples use one fabric called NK-LAB. The Manager VMANAGE is at 198.51.100.10 with system IP 10.255.255.1. The Controller VSMART is at 198.51.100.20 with system IP 10.255.255.2. The Validator VBOND is at 198.51.100.30 with system IP 10.255.255.3. The edges are E-DEL-1 (10.255.0.11, site 100), E-MUM-1 (10.255.0.12, site 200) and E-BLR-1 (10.255.0.13, site 300). The addresses are from the documentation range, so they are safe to reuse in your own notes.</p>
<table class="cmp"><tr><th>Controller</th><th>Role</th><th>Address</th><th>System IP</th></tr>
<tr><td>VMANAGE</td><td>Management plane</td><td>198.51.100.10</td><td>10.255.255.1</td></tr>
<tr><td>VSMART</td><td>Control plane, runs OMP</td><td>198.51.100.20</td><td>10.255.255.2</td></tr>
<tr><td>VBOND</td><td>Orchestration</td><td>198.51.100.30</td><td>10.255.255.3</td></tr></table>

<h3>Why this module is the most practical</h3>
<p>Most real incidents in the first months of an SD-WAN project are not about policy. They are about edges that never join: a certificate that expired, an organization name with one capital letter different, a firewall that does not pass the control ports, a clock that is wrong by a day. The engineer who can read <code>show sdwan control connection-history</code> and say what is wrong in a minute is the engineer who is trusted with the production fabric. That is the skill this module builds, and it is a large part of the 300-415 blueprint.</p>

<div class="eg"><p><b>A first look at a healthy controller.</b> On the Validator, the engineer checks the devices that have joined.</p>
<pre class="out">VBOND# show orchestrator connections
PEER    PEER  PEER          SITE  DOMAIN  PEER           PUBLIC
TYPE    PROT  SYSTEM IP     ID    ID      PRIVATE IP     STATE
vsmart  dtls  10.255.255.2  1     1       198.51.100.20  <span class="hl">up</span>
vmanage dtls  10.255.255.1  1     0       198.51.100.10  <span class="hl">up</span></pre>
<p>Two rows, both up. In the chapters ahead you will learn how each of these rows came to exist.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Treating the controller bring-up as a click-through installer and never learning what it did; using different spellings of the organization name; building the fabric before time synchronisation is working; assuming the Cloud-hosted model removes the need to understand certificates.</p></div>

<div class="exam"><p><b>Exam traps.</b> The control plane trust depends on three things: certificate, organization name and the authorised serial list. Reachability alone is not enough. The Manager, Controller and Validator all need a certificate; the edges need one too.</p></div>

<div class="scn"><h4>Day one of a rollout</h4><p>A retail company ordered fifty edges and received the controllers as a cloud service. On day one, the first branch router was powered on and sat in the connect state for an hour. The engineer assumed the cloud service was broken. In fact the organization name typed on the edge had a trailing space. Once corrected, the edge joined in under a minute.</p><p><b>Lesson:</b> the controllers were healthy all along. Identity details have to match exactly.</p></div>

<div class="iv"><p class="q">"What do you need in place before the first WAN edge can join the fabric?"</p><p>Strong answer: reachable and certificate-enabled Validator, Controller and Manager; the same organization name everywhere; a trusted root CA on all devices; the edge's serial number on the authorised list and marked valid; IP reachability from the edge to the Validator in VPN 0; and the correct time. Then name the order: Manager, Validator, Controller, then edges.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The controllers are the foundation: no edge joins without them.</li>
<li>A device is trusted by certificate, organization name and the authorised list.</li>
<li>Most early failures are identity or reachability details, not policy.</li>
<li>The order is Manager, Validator, Controller, then edges.</li>
<li>This track uses the NK-LAB fabric with VMANAGE, VSMART and VBOND.</li>
</ul></div>
`,hi:`
<p>Ek badi office building socho jisme reception desk hai. Lobby se aage koi bina badge ke nahi ja sakta. Reception badge check karta hai, visitor ka naam guest list mein hona chahiye, aur visitor ko bataya jaata hai ki kis floor par jana hai. Jab tak yeh teeno cheezein kaam na karein, building mein koi kaam nahi kar sakta, chahe offices kitne bhi achhe hon. Catalyst SD-WAN controllers wahi reception, guest list aur floor map hain. Agar woh sahi deploy nahi hue, to koi branch fabric mein join nahi kar sakti, aur OMP, TLOCs aur policies ke baare mein jo bhi seekha uska koi matlab nahi.</p>
<p>Architecture module mein aapne seekha ki Manager, Controller aur Validator kya karte hain. Yeh module sikhata hai ki unhe <b>kaise lagana hai aur healthy kaise rakhna hai</b>: deployment model chunna, har controller ko bootstrap karna, certificate trust banana, devices ko sahi order mein up karna, control-connection states padhna, clustering aur backups se system ko surakshit rakhna, aur jab koi device connect na ho to troubleshoot karna.</p>

<h3>Aap kya seekhoge</h3>
<ul>
<li>Teen deployment models: Cisco-hosted cloud, on-premises aur managed service provider.</li>
<li>Scale aur sizing design ko kaise prabhavit karte hain, aur kya current Cisco scale sheet padhne tak qualitative rakhna hai.</li>
<li>Controller ki bootstrap configuration: system block, VPN 0, VPN 512, organization name, Validator address, system IP aur site ID.</li>
<li>Certificates: Cisco PKI, enterprise root CA, signing flow aur WAN edge authorised list.</li>
<li>Control-plane security: DTLS versus TLS aur ports.</li>
<li>Onboarding order aur control connection ka lifecycle.</li>
<li>High availability, clustering, disaster recovery, backup aur restore.</li>
<li>Control-connection outputs aur error codes se fault-finding routine.</li>
</ul>
<p><b>Prerequisites.</b> Architecture module, ya kam se kam chaar planes aur TLOC aur OMP kya hain iski saaf tasveer. Network side par basic IP routing, DNS aur NTP kaafi hain.</p>

<h3>Trust triangle</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Teen cheezein jo device ke join hone ke liye match honi chahiye">
<rect x="230" y="10" width="180" height="50" rx="10" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Organization name</text><text x="320" y="50" text-anchor="middle" class="svg-muted" font-size="10">har device par same text</text>
<rect x="30" y="150" width="190" height="55" rx="10" fill="#bae6fd"/><text x="125" y="173" text-anchor="middle" class="svg-ink" font-size="13">Certificate</text><text x="125" y="192" text-anchor="middle" class="svg-muted" font-size="10">dono ke trusted CA se signed</text>
<rect x="420" y="150" width="190" height="55" rx="10" fill="#bbf7d0"/><text x="515" y="173" text-anchor="middle" class="svg-ink" font-size="13">Authorised list</text><text x="515" y="192" text-anchor="middle" class="svg-muted" font-size="10">serial number list mein hai</text>
<path d="M290 60 L180 150 M350 60 L460 150 M220 178 L420 178" stroke="#64748b" stroke-width="2" fill="none"/>
<rect x="190" y="220" width="260" height="38" rx="10" fill="#f1f5f9"/><text x="320" y="244" text-anchor="middle" class="svg-ink" font-size="12">Saath mein: IP reachability aur sahi clock</text>
</svg><p class="cap">Device tabhi join hota hai jab uski identity maani jaye (certificate), allowed ho (list) aur sahi company mein ho (organization name).</p></div>

<h3>Is track mein use hone wala lab fabric</h3>
<p>Saare examples ek fabric NK-LAB use karte hain. Manager VMANAGE 198.51.100.10 par hai, system IP 10.255.255.1. Controller VSMART 198.51.100.20 par hai, system IP 10.255.255.2. Validator VBOND 198.51.100.30 par hai, system IP 10.255.255.3. Edges E-DEL-1 (10.255.0.11, site 100), E-MUM-1 (10.255.0.12, site 200) aur E-BLR-1 (10.255.0.13, site 300) hain. Addresses documentation range ke hain, isliye apne notes mein reuse karna safe hai.</p>
<table class="cmp"><tr><th>Controller</th><th>Role</th><th>Address</th><th>System IP</th></tr>
<tr><td>VMANAGE</td><td>Management plane</td><td>198.51.100.10</td><td>10.255.255.1</td></tr>
<tr><td>VSMART</td><td>Control plane, OMP chalata hai</td><td>198.51.100.20</td><td>10.255.255.2</td></tr>
<tr><td>VBOND</td><td>Orchestration</td><td>198.51.100.30</td><td>10.255.255.3</td></tr></table>

<h3>Yeh module sabse practical kyun hai</h3>
<p>SD-WAN project ke pehle mahino ke zyada tar real incidents policy ke baare mein nahi hote. Woh un edges ke baare mein hote hain jo kabhi join nahi karte: expire hua certificate, organization name mein ek capital letter ka fark, firewall jo control ports pass nahi karta, clock jo ek din galat hai. Jo engineer <code>show sdwan control connection-history</code> padhkar ek minute mein bata sake ki kya galat hai, usi par production fabric ka bharosa hota hai. Yeh module wahi skill banata hai, aur 300-415 blueprint ka bada hissa hai.</p>

<div class="eg"><p><b>Healthy controller par pehli nazar.</b> Validator par engineer check karta hai kaunse devices join ho chuke hain.</p>
<pre class="out">VBOND# show orchestrator connections
PEER    PEER  PEER          SITE  DOMAIN  PEER           PUBLIC
TYPE    PROT  SYSTEM IP     ID    ID      PRIVATE IP     STATE
vsmart  dtls  10.255.255.2  1     1       198.51.100.20  <span class="hl">up</span>
vmanage dtls  10.255.255.1  1     0       198.51.100.10  <span class="hl">up</span></pre>
<p>Do rows, dono up. Aage ke chapters mein aap seekhoge ki yeh har row kaise bani.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Controller bring-up ko click-through installer maan lena aur kabhi na seekhna ki usne kya kiya; organization name ki alag spellings use karna; time synchronisation kaam karne se pehle fabric banana; yeh maan lena ki Cloud-hosted model se certificates samajhne ki zaroorat khatam ho jaati hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Control plane trust teen cheezon par depend karta hai: certificate, organization name aur authorised serial list. Sirf reachability kaafi nahi. Manager, Controller aur Validator sabko certificate chahiye; edges ko bhi chahiye.</p></div>

<div class="scn"><h4>Rollout ka pehla din</h4><p>Ek retail company ne pachaas edges order kiye aur controllers cloud service ke roop mein mile. Pehle din pehla branch router on kiya gaya aur ek ghante tak connect state mein raha. Engineer ne maana ki cloud service kharab hai. Asal mein edge par type kiye gaye organization name ke ant mein ek space tha. Sudharne ke baad edge ek minute se kam mein join ho gaya.</p><p><b>Seekh:</b> controllers shuru se healthy the. Identity details exactly match karni padti hain.</p></div>

<div class="iv"><p class="q">"Pehle WAN edge ke fabric mein join hone se pehle kya kya taiyaar chahiye?"</p><p>Strong answer: reachable aur certificate-enabled Validator, Controller aur Manager; har jagah same organization name; sab devices par trusted root CA; edge ka serial number authorised list mein aur valid mark; VPN 0 mein edge se Validator tak IP reachability; aur sahi time. Phir order batao: Manager, Validator, Controller, phir edges.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Controllers foundation hain: unke bina koi edge join nahi karta.</li>
<li>Device ko certificate, organization name aur authorised list se trust milta hai.</li>
<li>Shuruaati failures zyada tar identity ya reachability details hoti hain, policy nahi.</li>
<li>Order hai Manager, Validator, Controller, phir edges.</li>
<li>Yeh track NK-LAB fabric use karta hai: VMANAGE, VSMART aur VBOND.</li>
</ul></div>
`}};export{e as default};