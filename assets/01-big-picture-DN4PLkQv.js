var e={id:`big-picture`,h:{en:`The big picture: WAN edge platforms, modes and the journey of a new edge`,hi:`Big picture: WAN edge platforms, modes aur naye edge ka safar`},body:{en:`
<p><b>What you will learn in this module.</b> You will take a brand-new router from the box to a fully working member of the Catalyst SD-WAN fabric. You will learn which platforms can be a WAN edge, the difference between autonomous mode and controller mode, how an edge proves its identity (serial number, chassis number, certificate), how bootstrap, Plug and Play and ZTP bring it online, what VPN 0 and VPN 512 are, what a TLOC and a color are, how NAT traversal works, how OMP and BFD behave on the edge, how to build a two-edge site for high availability, and how to troubleshoot when the edge refuses to come up. This is the "Router Deployment" domain of the 300-415 ENSDWI exam.</p>
<p><b>Prerequisites.</b> You should have finished <i>SD-WAN from zero</i>, <i>Catalyst SD-WAN architecture</i> and <i>Controller deployment</i>. That means you already know the four planes, the roles of the Manager, Controller and Validator, and that the Controllers are up in the Bharat Retail data center (VMANAGE 198.51.100.10, VSMART 198.51.100.20, VBOND 198.51.100.30). You also need basic IPv4, static routing, VRFs and NAT. We will not re-teach those.</p>

<h3>Start with an analogy: a new employee joins Bharat Retail</h3>
<p>Imagine a new employee arriving on day one. At the front desk (the <b>Validator</b>) the guard checks the ID badge and the offer letter. If both are genuine, the guard says "HR is on the second floor, and your team lead sits on the third." HR (the <b>Manager</b>) already has the employee's name on the approved list, hands over the job description (the configuration) and keeps a file. The team lead (the <b>Controller</b>) tells the employee who sits where and how to reach each colleague (routes and TLOCs). Finally the employee shakes hands with every colleague (the <b>BFD</b> tunnels) and starts working.</p>
<p>A WAN edge does exactly this. The "badge" is its certificate, the "offer letter" is its entry in the WAN edge list, and the "approved list" is maintained by you.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Journey of a new WAN edge">
<rect x="10" y="20" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="13">1. Day-0</text><text x="65" y="65" text-anchor="middle" class="svg-muted" font-size="12">boot + underlay IP</text>
<rect x="135" y="20" width="110" height="60" rx="8" fill="#bae6fd"/><text x="190" y="45" text-anchor="middle" class="svg-ink" font-size="13">2. VBOND</text><text x="190" y="65" text-anchor="middle" class="svg-muted" font-size="12">who are you?</text>
<rect x="260" y="20" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="315" y="45" text-anchor="middle" class="svg-ink" font-size="13">3. VMANAGE</text><text x="315" y="65" text-anchor="middle" class="svg-muted" font-size="12">config + list</text>
<rect x="385" y="20" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="440" y="45" text-anchor="middle" class="svg-ink" font-size="13">4. VSMART</text><text x="440" y="65" text-anchor="middle" class="svg-muted" font-size="12">OMP routes, TLOCs</text>
<rect x="510" y="20" width="120" height="60" rx="8" fill="#fde68a"/><text x="570" y="45" text-anchor="middle" class="svg-ink" font-size="13">5. Edges</text><text x="570" y="65" text-anchor="middle" class="svg-muted" font-size="12">IPsec + BFD up</text>
<line x1="120" y1="50" x2="135" y2="50" stroke="#64748b" stroke-width="2"/><line x1="245" y1="50" x2="260" y2="50" stroke="#64748b" stroke-width="2"/><line x1="370" y1="50" x2="385" y2="50" stroke="#64748b" stroke-width="2"/><line x1="495" y1="50" x2="510" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="110" width="620" height="100" rx="8" fill="#f1f5f9"/>
<text x="25" y="135" class="svg-ink" font-size="13">E-DEL-1 (site 100, system IP 10.255.0.11)</text>
<text x="25" y="157" class="svg-muted" font-size="12">Gi1 203.0.113.6 (biz-internet)  |  Gi2 172.16.1.2 (mpls)  |  Gi3 10.1.10.1 in VRF 10</text>
<text x="25" y="179" class="svg-muted" font-size="12">Validator is contacted first. It is a short, temporary DTLS session.</text>
<text x="25" y="198" class="svg-muted" font-size="12">Manager and Controller sessions stay up permanently.</text>
</svg><p class="cap">Five steps from power-on to a working edge. Every module in this track assumes this order.</p></div>

<h3>Which devices can be a WAN edge</h3>
<p>A <b>WAN edge</b> is the router at a site that builds the overlay tunnels. Cisco sells two families, and both appear on the exam and in real networks.</p>
<table class="cmp"><tr><th></th><th>IOS XE SD-WAN edge (cEdge)</th><th>Viptela OS edge (vEdge)</th></tr>
<tr><td>Platforms</td><td>Catalyst 8200, 8300, 8500 series; Catalyst 8000V (virtual, also in public cloud); ISR 1000 and 4000; ASR 1000</td><td>vEdge 100, 1000, 2000, 5000 and vEdge Cloud (legacy, end of sale)</td></tr>
<tr><td>Operating system</td><td>IOS XE with SD-WAN code</td><td>Viptela OS</td></tr>
<tr><td>Service VPN is a...</td><td>VRF (<code>vrf definition 10</code>)</td><td><code>vpn 10</code> block</td></tr>
<tr><td>Local CLI style</td><td>IOS style, <code>config-transaction</code> and <code>commit</code></td><td>Viptela style, <code>conf t</code> and <code>commit</code></td></tr></table>
<p>New purchases are almost always Catalyst 8000 platforms. In this course the lab edges (E-DEL-1, E-MUM-1, E-BLR-1) are IOS XE edges, so every command you read will be IOS XE style.</p>

<h3>Autonomous mode versus controller mode</h3>
<p>An IOS XE router can run in two <b>modes</b>. In <b>autonomous mode</b> it behaves like a normal IOS XE router: you type configuration and it forwards traffic. In <b>controller mode</b> (also called Controller-Managed mode) it behaves as a Catalyst SD-WAN edge: it joins the fabric and takes its configuration from the Manager. The router stays in one mode until you change it.</p>
<pre class="code"><span class="c">! Switch an autonomous router to SD-WAN (controller) mode</span>
Router# controller-mode enable
<span class="c">! The router asks for confirmation, erases NVRAM and reloads into day-0</span>

<span class="c">! Back to autonomous mode</span>
Router# controller-mode disable</pre>
<p>To see which mode a router is in:</p>
<pre class="out">E-DEL-1# show version | include operating
Router operating mode: <span class="hl">Controller-Managed</span>

E-DEL-1# show platform software device-mode
Device Operating-mode: <span class="hl">Controller-Managed</span>
Device-mode bootup status:
  8/03 00:44:16 System is green</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Running <code>controller-mode enable</code> on a router that still carries a config you need. Moving from autonomous to controller mode erases the startup configuration, like a <code>write erase</code>. (2) Looking for IOS commands that no longer exist. In controller mode, local configuration goes through <code>config-transaction</code>, and once a Manager template or configuration group is attached the local CLI is locked (the device is in Manager mode). (3) Forgetting that smart licensing authorization is lost after a mode change and must be redone.</p></div>
<div class="exam"><p><b>Exam trap.</b> The same IOS XE universal image supports both modes on most platforms; the mode is a setting, not a different image. vEdge hardware cannot run IOS XE and the other way round. Know that the modes exist and which commands switch them.</p></div>

<div class="eg"><p><b>Worked example.</b> Bharat Retail buys a Catalyst 8300 for Delhi. It arrives in autonomous mode. The engineer powers it on and Plug and Play finds the Validator, so the router switches itself to controller mode, reloads and starts onboarding. Had no PnP been available, the engineer would have placed a bootstrap file called <code>ciscosdwan.cfg</code> in bootflash or on a USB stick, or typed <code>controller-mode enable</code>, then configured day-0 by hand. You will do both in the next chapters.</p></div>

<div class="scn"><h4>The router that kept forgetting its config</h4><p>A junior engineer at a Bharat Retail branch typed a complete OSPF and NAT configuration on a new Catalyst 8200, then ran <code>controller-mode enable</code> "to try SD-WAN". The router reloaded and every line was gone. He retyped it, and the same thing happened after the reload. The senior engineer explained that the mode change is a day-0 reset, and that in controller mode the interface, routing and security configuration comes from the Manager, not from hand-typed IOS.</p><p><b>Lesson:</b> decide the mode first, then configure. Back up before you switch.</p></div>

<div class="iv"><p class="q">"What is the difference between autonomous mode and controller mode on a Catalyst 8000?"</p><p>Strong answer: autonomous mode is a normal IOS XE router configured locally. Controller mode makes it a Catalyst SD-WAN edge that builds control connections to the Validator, Manager and Controller, and is configured from the Manager with templates or configuration groups. Mention that <code>controller-mode enable</code> erases the config, that PnP can switch the mode automatically, and that you verify with <code>show platform software device-mode</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A new edge talks to the Validator first, then the Manager and the Controller, then builds BFD tunnels to other edges.</li>
<li>cEdge runs IOS XE (Catalyst 8000, ISR, ASR); vEdge runs Viptela OS and is legacy.</li>
<li>IOS XE routers run in autonomous or controller mode; <code>controller-mode enable</code> switches and wipes the config.</li>
<li>Verify with <code>show platform software device-mode</code>.</li>
<li>In controller mode the local CLI is locked once the Manager owns the configuration.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap ek bilkul naye router ko box se nikaal kar Catalyst SD-WAN fabric ke poori tarah working member tak le jaoge. Aap seekhoge ki kaunse platforms WAN edge ban sakte hain, autonomous mode aur controller mode mein kya farak hai, edge apni identity kaise prove karta hai (serial number, chassis number, certificate), bootstrap, Plug and Play aur ZTP use kaise online laate hain, VPN 0 aur VPN 512 kya hain, TLOC aur color kya hote hain, NAT traversal kaise kaam karta hai, edge par OMP aur BFD kaise behave karte hain, high availability ke liye do-edge site kaise banate hain, aur jab edge up na ho to troubleshoot kaise karte hain. Yeh 300-415 ENSDWI exam ka "Router Deployment" domain hai.</p>
<p><b>Prerequisites.</b> Aapne <i>SD-WAN from zero</i>, <i>Catalyst SD-WAN architecture</i> aur <i>Controller deployment</i> khatam kiye hone chahiye. Matlab aap chaar planes, Manager, Controller aur Validator ke roles jaante ho, aur Bharat Retail data center mein Controllers up hain (VMANAGE 198.51.100.10, VSMART 198.51.100.20, VBOND 198.51.100.30). Aapko basic IPv4, static routing, VRFs aur NAT bhi aana chahiye. Yeh hum dobara nahi padhayenge.</p>

<h3>Ek analogy se shuru karo: Bharat Retail mein naya employee join karta hai</h3>
<p>Socho ek naya employee pehle din aata hai. Front desk (<b>Validator</b>) par guard ID badge aur offer letter check karta hai. Dono genuine hain to guard kehta hai "HR doosri manzil par hai, aur aapka team lead teesri par baithta hai." HR (<b>Manager</b>) ke paas employee ka naam pehle se approved list mein hai, woh job description (configuration) deta hai aur file rakhta hai. Team lead (<b>Controller</b>) batata hai kaun kahan baithta hai aur har colleague tak kaise pahunchna hai (routes aur TLOCs). Aakhir mein employee har colleague se haath milata hai (<b>BFD</b> tunnels) aur kaam shuru karta hai.</p>
<p>WAN edge bilkul yahi karta hai. "Badge" uska certificate hai, "offer letter" WAN edge list mein uski entry hai, aur "approved list" aap maintain karte ho.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Naye WAN edge ka safar">
<rect x="10" y="20" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="13">1. Day-0</text><text x="65" y="65" text-anchor="middle" class="svg-muted" font-size="12">boot + underlay IP</text>
<rect x="135" y="20" width="110" height="60" rx="8" fill="#bae6fd"/><text x="190" y="45" text-anchor="middle" class="svg-ink" font-size="13">2. VBOND</text><text x="190" y="65" text-anchor="middle" class="svg-muted" font-size="12">tum kaun ho?</text>
<rect x="260" y="20" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="315" y="45" text-anchor="middle" class="svg-ink" font-size="13">3. VMANAGE</text><text x="315" y="65" text-anchor="middle" class="svg-muted" font-size="12">config + list</text>
<rect x="385" y="20" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="440" y="45" text-anchor="middle" class="svg-ink" font-size="13">4. VSMART</text><text x="440" y="65" text-anchor="middle" class="svg-muted" font-size="12">OMP routes, TLOCs</text>
<rect x="510" y="20" width="120" height="60" rx="8" fill="#fde68a"/><text x="570" y="45" text-anchor="middle" class="svg-ink" font-size="13">5. Edges</text><text x="570" y="65" text-anchor="middle" class="svg-muted" font-size="12">IPsec + BFD up</text>
<line x1="120" y1="50" x2="135" y2="50" stroke="#64748b" stroke-width="2"/><line x1="245" y1="50" x2="260" y2="50" stroke="#64748b" stroke-width="2"/><line x1="370" y1="50" x2="385" y2="50" stroke="#64748b" stroke-width="2"/><line x1="495" y1="50" x2="510" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="110" width="620" height="100" rx="8" fill="#f1f5f9"/>
<text x="25" y="135" class="svg-ink" font-size="13">E-DEL-1 (site 100, system IP 10.255.0.11)</text>
<text x="25" y="157" class="svg-muted" font-size="12">Gi1 203.0.113.6 (biz-internet)  |  Gi2 172.16.1.2 (mpls)  |  Gi3 10.1.10.1 in VRF 10</text>
<text x="25" y="179" class="svg-muted" font-size="12">Validator se pehle baat hoti hai. Yeh chhota, temporary DTLS session hai.</text>
<text x="25" y="198" class="svg-muted" font-size="12">Manager aur Controller ke sessions permanent up rehte hain.</text>
</svg><p class="cap">Power-on se working edge tak paanch steps. Is track ka har module isi order ko maanta hai.</p></div>

<h3>Kaunse devices WAN edge ban sakte hain</h3>
<p><b>WAN edge</b> woh router hai jo site par overlay tunnels banata hai. Cisco do families bechta hai, aur dono exam mein aur real networks mein milti hain.</p>
<table class="cmp"><tr><th></th><th>IOS XE SD-WAN edge (cEdge)</th><th>Viptela OS edge (vEdge)</th></tr>
<tr><td>Platforms</td><td>Catalyst 8200, 8300, 8500 series; Catalyst 8000V (virtual, public cloud mein bhi); ISR 1000 aur 4000; ASR 1000</td><td>vEdge 100, 1000, 2000, 5000 aur vEdge Cloud (legacy, end of sale)</td></tr>
<tr><td>Operating system</td><td>SD-WAN code ke saath IOS XE</td><td>Viptela OS</td></tr>
<tr><td>Service VPN kya hota hai</td><td>VRF (<code>vrf definition 10</code>)</td><td><code>vpn 10</code> block</td></tr>
<tr><td>Local CLI style</td><td>IOS style, <code>config-transaction</code> aur <code>commit</code></td><td>Viptela style, <code>conf t</code> aur <code>commit</code></td></tr></table>
<p>Nayi khareedari lagbhag hamesha Catalyst 8000 platforms ki hoti hai. Is course mein lab edges (E-DEL-1, E-MUM-1, E-BLR-1) IOS XE edges hain, isliye jo bhi command aap padhoge woh IOS XE style mein hogi.</p>

<h3>Autonomous mode versus controller mode</h3>
<p>IOS XE router do <b>modes</b> mein chal sakta hai. <b>Autonomous mode</b> mein woh normal IOS XE router jaisa behave karta hai: aap configuration type karte ho aur woh traffic forward karta hai. <b>Controller mode</b> (Controller-Managed mode bhi kehte hain) mein woh Catalyst SD-WAN edge ki tarah behave karta hai: fabric join karta hai aur apni configuration Manager se leta hai. Router ek mode mein tab tak rehta hai jab tak aap use change nahi karte.</p>
<pre class="code"><span class="c">! Autonomous router ko SD-WAN (controller) mode mein badlo</span>
Router# controller-mode enable
<span class="c">! Router confirmation poochta hai, NVRAM erase karta hai aur day-0 mein reload hota hai</span>

<span class="c">! Wapas autonomous mode mein</span>
Router# controller-mode disable</pre>
<p>Router kaunse mode mein hai yeh dekhne ke liye:</p>
<pre class="out">E-DEL-1# show version | include operating
Router operating mode: <span class="hl">Controller-Managed</span>

E-DEL-1# show platform software device-mode
Device Operating-mode: <span class="hl">Controller-Managed</span>
Device-mode bootup status:
  8/03 00:44:16 System is green</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Aisi config wale router par <code>controller-mode enable</code> chalana jo aapko chahiye. Autonomous se controller mode mein jaane par startup configuration erase ho jaati hai, <code>write erase</code> ki tarah. (2) Un IOS commands ko dhoondhna jo ab nahi hain. Controller mode mein local configuration <code>config-transaction</code> se jaati hai, aur jab Manager ka template ya configuration group attach ho jaata hai to local CLI lock ho jaati hai (device Manager mode mein hota hai). (3) Yeh bhool jaana ki mode change ke baad smart licensing authorization chala jaata hai aur dobara karna padta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Zyada tar platforms par wahi IOS XE universal image dono modes support karti hai; mode ek setting hai, alag image nahi. vEdge hardware IOS XE nahi chala sakta aur ulta bhi. Yaad rakho ki modes hote hain aur unhe kaunsi commands badalti hain.</p></div>

<div class="eg"><p><b>Worked example.</b> Bharat Retail Delhi ke liye ek Catalyst 8300 kharidta hai. Woh autonomous mode mein aata hai. Engineer use power on karta hai aur Plug and Play Validator dhoondh leta hai, isliye router khud controller mode mein switch hota hai, reload hota hai aur onboarding shuru karta hai. Agar PnP available nahi hota, to engineer <code>ciscosdwan.cfg</code> naam ki bootstrap file bootflash ya USB stick par rakhta, ya <code>controller-mode enable</code> type karta, phir day-0 haath se configure karta. Aap agle chapters mein dono karoge.</p></div>

<div class="scn"><h4>Woh router jo apni config bhool jaata tha</h4><p>Bharat Retail ke ek branch mein junior engineer ne naye Catalyst 8200 par poori OSPF aur NAT configuration type ki, phir "SD-WAN try karne ke liye" <code>controller-mode enable</code> chalaya. Router reload hua aur har line gayab. Usne dobara type ki, aur reload ke baad phir wahi hua. Senior engineer ne samjhaya ki mode change ek day-0 reset hai, aur controller mode mein interface, routing aur security configuration Manager se aati hai, haath se type kiye IOS se nahi.</p><p><b>Seekh:</b> pehle mode decide karo, phir configure karo. Switch karne se pehle backup lo.</p></div>

<div class="iv"><p class="q">"Catalyst 8000 par autonomous mode aur controller mode mein kya farak hai?"</p><p>Strong answer: autonomous mode normal IOS XE router hai jo locally configure hota hai. Controller mode use Catalyst SD-WAN edge bana deta hai jo Validator, Manager aur Controller se control connections banata hai, aur Manager se templates ya configuration groups ke zariye configure hota hai. Batao ki <code>controller-mode enable</code> config erase karta hai, PnP mode automatically switch kar sakta hai, aur aap <code>show platform software device-mode</code> se verify karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Naya edge pehle Validator se, phir Manager aur Controller se baat karta hai, phir doosre edges ke saath BFD tunnels banata hai.</li>
<li>cEdge IOS XE chalata hai (Catalyst 8000, ISR, ASR); vEdge Viptela OS chalata hai aur legacy hai.</li>
<li>IOS XE routers autonomous ya controller mode mein chalte hain; <code>controller-mode enable</code> switch karta hai aur config wipe karta hai.</li>
<li><code>show platform software device-mode</code> se verify karo.</li>
<li>Controller mode mein Manager ke config sambhalte hi local CLI lock ho jaati hai.</li>
</ul></div>
`}};export{e as default};