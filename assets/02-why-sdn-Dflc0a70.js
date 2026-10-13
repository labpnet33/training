var e={id:`why-sdn`,h:{en:`Why ACI: from box-by-box to intent-based policy`,hi:`ACI kyun: box-by-box se intent-based policy tak`},body:{en:`
<p>Think about ordering food in a restaurant. You say "one vegetarian thali, no onion". You do not walk into the kitchen and tell each cook which pan to heat and how many seconds to stir. You state your <b>intent</b>, and the kitchen works out the steps. Traditional networking is like cooking every dish yourself, switch by switch. ACI lets you place the order.</p>

<h3>The pain of box-by-box configuration</h3>
<p>In a classic data center, a new application means a long list of small changes on many devices: create VLANs on every leaf and trunk, create SVIs and HSRP on the gateway pair, extend the VLAN to the firewall, write ACLs, update the documentation, and repeat the same thing in the disaster-recovery site. Every step is typed by a human. The result:</p>
<ul>
<li><b>Configuration drift.</b> Two switches that should be identical slowly become different.</li>
<li><b>Slow delivery.</b> A change request that touches 40 switches needs a long maintenance window.</li>
<li><b>Security by exception.</b> The network allows everything by default; ACLs are added later, grow to thousands of lines and nobody dares to delete an old line.</li>
<li><b>No application view.</b> The network knows VLAN 210 and 10.1.2.0/24, but nobody can quickly answer "which switches and rules belong to the payments application?"</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A three-tier application (web, app, database) must be deployed on 20 leaves in a traditional design. Per leaf: 3 VLANs and 3 trunk changes (6 commands). On the gateway pair: 3 SVIs with HSRP (about 24 lines) and two ACLs with 10 entries each. That is about 120 leaf commands plus 60 gateway lines, typed by hand and repeated for the DR site: roughly 360 lines, with 360 chances for a typo. In ACI the same intent is one tenant with 3 EPGs, 3 bridge domains and 2 contracts: about 10 objects, created once, and the APIC deploys them only on the leaves that actually host those servers.</p></div>

<h3>Imperative versus declarative</h3>
<p><b>Imperative</b> configuration tells the device <i>how</i> to do something, step by step ("create VLAN 210, add it to Eth1/1, create interface Vlan210 with this IP"). <b>Declarative</b> configuration states <i>what</i> you want ("servers in EPG WEB may reach EPG APP on TCP port 80"). ACI uses a declarative <b>policy model</b>: you describe the desired state, and the system turns it into device configuration. Cisco calls this <b>intent-based networking</b>.</p>

<h3>The ACI policy model in one paragraph</h3>
<p>Endpoints (servers, VMs, containers) are grouped into <b>EPGs</b> (endpoint groups) according to the policy they need, not according to their subnet. EPGs live inside <b>application profiles</b>, which live inside <b>tenants</b>. Communication between EPGs is described by <b>contracts</b>. Forwarding is described by <b>VRFs</b> and <b>bridge domains</b>. None of these objects mentions a switch or a port; the physical attachment is handled separately by <b>access policies</b>. Because policy is separated from the physical network, the same policy can be applied wherever the endpoint appears.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Management plane and data plane in ACI">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">APIC cluster</text>
<text x="470" y="28" class="svg-muted" font-size="12">policy + management plane</text>
<text x="470" y="44" class="svg-muted" font-size="12">(not in the data path)</text>
<line x1="320" y1="50" x2="320" y2="95" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="330" y="80" class="svg-accent" font-size="12">policy pushed down</text>
<rect x="120" y="95" width="400" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="13">Spines</text>
<rect x="120" y="155" width="120" height="36" rx="8" fill="#bae6fd"/><text x="180" y="178" text-anchor="middle" class="svg-ink" font-size="13">Leaf 101</text>
<rect x="400" y="155" width="120" height="36" rx="8" fill="#bae6fd"/><text x="460" y="178" text-anchor="middle" class="svg-ink" font-size="13">Leaf 102</text>
<line x1="180" y1="155" x2="260" y2="131" stroke="#64748b" stroke-width="2"/><line x1="460" y1="155" x2="380" y2="131" stroke="#64748b" stroke-width="2"/>
<text x="320" y="215" text-anchor="middle" class="svg-accent" font-size="12">data plane: server to leaf to spine to leaf to server</text>
</svg><p class="cap">The APIC defines policy; the switches forward packets on their own.</p></div>

<h3>The APIC: single point of management, not a single point of failure</h3>
<p>The <b>APIC</b> is the single place where you configure and monitor the whole fabric: GUI, REST API and CLI. But it is <b>not in the data path</b>. Packets never pass through the APIC. Each switch keeps the policy it received in its own memory and hardware, and forwards on its own. If every APIC in the cluster fails, traffic keeps flowing exactly as before; you only lose the ability to change policy and to see monitoring data until an APIC returns.</p>
<p>The switches also run their own control protocols (IS-IS, COOP, MP-BGP) without the APIC, so endpoint learning and route exchange continue too.</p>

<h3>What the controller gives you</h3>
<ul>
<li><b>Consistency:</b> policy is rendered by software, so every leaf gets exactly what it needs.</li>
<li><b>Automation:</b> everything in the GUI is available in the REST API, so scripts, Ansible and Terraform can drive the fabric.</li>
<li><b>Visibility:</b> faults, health scores and endpoint tracking for the whole fabric in one place.</li>
<li><b>Security by default:</b> the whitelist model means new EPGs are isolated until you allow flows.</li>
<li><b>Efficiency:</b> VRFs, bridge domains and EPGs are deployed only on leaves that need them, saving hardware resources.</li>
</ul>

<p>You can see that the controller cluster is healthy from the APIC CLI:</p>
<pre class="out">APIC1# show controller
Fabric Name            : ACI-Fabric1
Operational Size       : 3
Cluster Size           : 3

 ID   Pod   Address          OOB IPv4           Flags  Health
 ---- ----- ---------------- ------------------ ------ --------------
 1*   1     10.0.0.1         192.168.100.11     crva-  <span class="hl">fully-fit</span>
 2    1     10.0.0.2         192.168.100.12     crva-  fully-fit
 3    1     10.0.0.3         192.168.100.13     crva-  fully-fit</pre>

<div class="warn"><p><b>Common mistake.</b> Believing that an APIC outage is a network outage and rushing to reboot switches. Rebooting a leaf while the APIC cluster is unavailable is the one thing that can hurt: a freshly booted switch needs the APIC to download its policy again. Fix the controllers first; leave the healthy data plane alone.</p></div>

<div class="exam"><p><b>Exam trap.</b> "What happens to traffic if all APICs fail?" The answer is always: existing traffic continues; only configuration changes and monitoring stop. The APIC is the management and policy plane, not the control or data plane of the switches.</p></div>

<div class="scn"><h4>The night the controllers went dark</h4><p>During a storage migration, a technician unplugged the wrong power strip and all three APICs of a retail fabric shut down at 23:10. The NOC saw every APIC red in monitoring and escalated it as a "fabric down" P1. The on-call engineer checked the application dashboards first: card payments, the website and the warehouse system were all still working. He confirmed on a leaf with <code>show endpoint</code> and <code>show zoning-rule</code> that endpoints and contract rules were still present. Power was restored at 23:40, the cluster re-formed and reported fully-fit, and no packet was lost.</p><p><b>Lesson:</b> the APIC is the brain for policy, not the heart of forwarding. Check the data plane before declaring an outage.</p></div>

<div class="iv"><p class="q">"What problem does ACI solve compared with a traditional network, and is the APIC a single point of failure?"</p><p>Strong answer: ACI replaces box-by-box imperative configuration with a declarative, application-centric policy model (tenants, EPGs, contracts) defined once on the APIC and rendered consistently to every leaf. That removes drift, speeds up changes, adds a default-deny whitelist and gives an application view. The APIC is not a single point of failure for traffic because it is not in the data path; it runs as a cluster of at least three for redundancy of the policy database, and if all fail the fabric keeps forwarding.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Box-by-box configuration causes drift, slow changes and ACL sprawl.</li>
<li>ACI uses a declarative policy model: you state intent, the APIC renders the configuration.</li>
<li>Policy (tenants, EPGs, contracts) is separated from the physical attachment (access policies).</li>
<li>The APIC is the single point of management but is not in the data path; traffic survives an APIC outage.</li>
<li>Everything in the GUI is also in the REST API, which enables automation.</li>
</ul></div>
`,hi:`
<p>Restaurant mein khana order karne ke baare mein socho. Aap kehte ho "ek veg thali, bina pyaaz". Aap kitchen mein jaa kar har cook ko nahi batate ki kaunsa pan garam karna hai aur kitne second chalana hai. Aap apna <b>intent</b> batate ho, aur kitchen steps khud nikaal leta hai. Traditional networking har dish khud banane jaisi hai, switch by switch. ACI aapko order dene deta hai.</p>

<h3>Box-by-box configuration ka dard</h3>
<p>Classic data center mein naye application ka matlab hai bahut saare devices par chhote-chhote changes ki lambi list: har leaf aur trunk par VLANs banao, gateway pair par SVIs aur HSRP banao, VLAN ko firewall tak extend karo, ACLs likho, documentation update karo, aur disaster-recovery site mein yahi sab dobara karo. Har step insaan type karta hai. Result:</p>
<ul>
<li><b>Configuration drift.</b> Do switches jo identical hone chahiye, dheere-dheere alag ho jaate hain.</li>
<li><b>Slow delivery.</b> Jo change request 40 switches ko touch karti hai use lamba maintenance window chahiye.</li>
<li><b>Security by exception.</b> Network default mein sab allow karta hai; ACLs baad mein jodte hain, hazaaron lines tak badh jaate hain aur koi purani line delete karne ki himmat nahi karta.</li>
<li><b>Application view nahi.</b> Network VLAN 210 aur 10.1.2.0/24 jaanta hai, lekin koi jaldi se jawab nahi de sakta ki "payments application ke kaunse switches aur rules hain?"</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek three-tier application (web, app, database) traditional design mein 20 leaves par deploy karni hai. Har leaf par: 3 VLANs aur 3 trunk changes (6 commands). Gateway pair par: HSRP ke saath 3 SVIs (lagbhag 24 lines) aur 10-10 entries ke do ACLs. Yeh lagbhag 120 leaf commands plus 60 gateway lines hain, haath se type kiye, aur DR site ke liye dobara: lagbhag 360 lines, yaani typo ke 360 mauke. ACI mein yahi intent ek tenant hai jismein 3 EPGs, 3 bridge domains aur 2 contracts hain: lagbhag 10 objects, ek baar banaye, aur APIC unhe sirf un leaves par deploy karta hai jahan woh servers sach mein hain.</p></div>

<h3>Imperative vs declarative</h3>
<p><b>Imperative</b> configuration device ko batati hai ki kuch <i>kaise</i> karna hai, step by step ("VLAN 210 banao, Eth1/1 mein jodo, is IP ke saath interface Vlan210 banao"). <b>Declarative</b> configuration batati hai ki aapko <i>kya</i> chahiye ("EPG WEB ke servers EPG APP tak TCP port 80 par pahunch sakte hain"). ACI ek declarative <b>policy model</b> use karta hai: aap desired state describe karte ho, aur system use device configuration mein badal deta hai. Cisco ise <b>intent-based networking</b> kehta hai.</p>

<h3>Ek paragraph mein ACI policy model</h3>
<p>Endpoints (servers, VMs, containers) <b>EPGs</b> (endpoint groups) mein group hote hain is hisaab se ki unhe kaunsi policy chahiye, unke subnet ke hisaab se nahi. EPGs <b>application profiles</b> ke andar rehte hain, jo <b>tenants</b> ke andar rehte hain. EPGs ke beech communication <b>contracts</b> se describe hota hai. Forwarding <b>VRFs</b> aur <b>bridge domains</b> se describe hoti hai. Inmein se koi bhi object kisi switch ya port ka zikr nahi karta; physical attachment alag se <b>access policies</b> handle karti hain. Kyunki policy physical network se alag hai, same policy wahan apply ho sakti hai jahan bhi endpoint dikhe.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="ACI mein management plane aur data plane">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">APIC cluster</text>
<text x="470" y="28" class="svg-muted" font-size="12">policy + management plane</text>
<text x="470" y="44" class="svg-muted" font-size="12">(data path mein nahi)</text>
<line x1="320" y1="50" x2="320" y2="95" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="330" y="80" class="svg-accent" font-size="12">policy neeche push</text>
<rect x="120" y="95" width="400" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="13">Spines</text>
<rect x="120" y="155" width="120" height="36" rx="8" fill="#bae6fd"/><text x="180" y="178" text-anchor="middle" class="svg-ink" font-size="13">Leaf 101</text>
<rect x="400" y="155" width="120" height="36" rx="8" fill="#bae6fd"/><text x="460" y="178" text-anchor="middle" class="svg-ink" font-size="13">Leaf 102</text>
<line x1="180" y1="155" x2="260" y2="131" stroke="#64748b" stroke-width="2"/><line x1="460" y1="155" x2="380" y2="131" stroke="#64748b" stroke-width="2"/>
<text x="320" y="215" text-anchor="middle" class="svg-accent" font-size="12">data plane: server se leaf se spine se leaf se server</text>
</svg><p class="cap">APIC policy define karta hai; switches packets khud forward karte hain.</p></div>

<h3>APIC: single point of management, single point of failure nahi</h3>
<p><b>APIC</b> woh ek jagah hai jahan se aap poore fabric ko configure aur monitor karte ho: GUI, REST API aur CLI. Lekin yeh <b>data path mein nahi hai</b>. Packets kabhi APIC se hokar nahi jaate. Har switch jo policy mili hai use apni memory aur hardware mein rakhta hai, aur khud forward karta hai. Agar cluster ke saare APIC fail ho jaayein, traffic bilkul pehle jaisa chalta rehta hai; aap bas tab tak policy change karne aur monitoring data dekhne ki ability kho dete ho jab tak koi APIC wapas na aaye.</p>
<p>Switches apne control protocols (IS-IS, COOP, MP-BGP) bhi APIC ke bina chalate hain, isliye endpoint learning aur route exchange bhi chalte rehte hain.</p>

<h3>Controller aapko kya deta hai</h3>
<ul>
<li><b>Consistency:</b> policy software render karta hai, isliye har leaf ko bilkul wahi milta hai jo use chahiye.</li>
<li><b>Automation:</b> GUI ki har cheez REST API mein bhi hai, isliye scripts, Ansible aur Terraform fabric chala sakte hain.</li>
<li><b>Visibility:</b> poore fabric ke faults, health scores aur endpoint tracking ek jagah.</li>
<li><b>Security by default:</b> whitelist model ka matlab hai ki naye EPGs tab tak isolated rehte hain jab tak aap flows allow na karo.</li>
<li><b>Efficiency:</b> VRFs, bridge domains aur EPGs sirf un leaves par deploy hote hain jinhe zaroorat hai, jisse hardware resources bachte hain.</li>
</ul>

<p>Controller cluster healthy hai ya nahi, yeh APIC CLI se dekh sakte ho:</p>
<pre class="out">APIC1# show controller
Fabric Name            : ACI-Fabric1
Operational Size       : 3
Cluster Size           : 3

 ID   Pod   Address          OOB IPv4           Flags  Health
 ---- ----- ---------------- ------------------ ------ --------------
 1*   1     10.0.0.1         192.168.100.11     crva-  <span class="hl">fully-fit</span>
 2    1     10.0.0.2         192.168.100.12     crva-  fully-fit
 3    1     10.0.0.3         192.168.100.13     crva-  fully-fit</pre>

<div class="warn"><p><b>Common galti.</b> Yeh maan lena ki APIC outage matlab network outage, aur jaldi mein switches reboot karna. APIC cluster unavailable hote hue leaf reboot karna hi woh ek cheez hai jo nuksaan kar sakti hai: fresh boot hua switch apni policy dobara download karne ke liye APIC par depend karta hai. Pehle controllers theek karo; healthy data plane ko chhedo mat.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Saare APIC fail ho jaayein to traffic ka kya hoga?" Jawab hamesha: existing traffic chalta rehta hai; sirf configuration changes aur monitoring rukti hai. APIC management aur policy plane hai, switches ka control ya data plane nahi.</p></div>

<div class="scn"><h4>Woh raat jab controllers band ho gaye</h4><p>Ek storage migration ke dauraan, technician ne galat power strip unplug kar di aur ek retail fabric ke teeno APIC raat 23:10 par band ho gaye. NOC ne monitoring mein har APIC laal dekha aur ise "fabric down" P1 bana kar escalate kiya. On-call engineer ne pehle application dashboards check kiye: card payments, website aur warehouse system sab chal rahe the. Usne ek leaf par <code>show endpoint</code> aur <code>show zoning-rule</code> se confirm kiya ki endpoints aur contract rules abhi bhi maujood the. 23:40 par power wapas aayi, cluster dobara bana aur fully-fit report kiya, aur ek bhi packet lost nahi hua.</p><p><b>Seekh:</b> APIC policy ka dimaag hai, forwarding ka dil nahi. Outage declare karne se pehle data plane check karo.</p></div>

<div class="iv"><p class="q">"Traditional network ke comparison mein ACI kaunsi problem solve karta hai, aur kya APIC single point of failure hai?"</p><p>Strong answer: ACI box-by-box imperative configuration ko ek declarative, application-centric policy model (tenants, EPGs, contracts) se replace karta hai jo APIC par ek baar define hota hai aur har leaf par consistently render hota hai. Isse drift khatam hota hai, changes tez hote hain, default-deny whitelist milti hai aur application view milta hai. APIC traffic ke liye single point of failure nahi hai kyunki woh data path mein nahi hai; policy database ki redundancy ke liye kam se kam teen ke cluster mein chalta hai, aur agar sab fail ho jaayein to bhi fabric forward karta rehta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Box-by-box configuration se drift, slow changes aur ACL sprawl hota hai.</li>
<li>ACI declarative policy model use karta hai: aap intent batate ho, APIC configuration render karta hai.</li>
<li>Policy (tenants, EPGs, contracts) physical attachment (access policies) se alag hai.</li>
<li>APIC single point of management hai lekin data path mein nahi; APIC outage mein traffic bachta hai.</li>
<li>GUI ki har cheez REST API mein bhi hai, jisse automation possible hota hai.</li>
</ul></div>
`}};export{e as default};