var e={id:`ha-platforms`,h:{en:`High availability, contexts, multi-instance, form factors and managers`,hi:`High availability, contexts, multi-instance, form factors aur managers`},body:{en:`
<p>A hospital does not have one surgeon on call; it has a duty surgeon and a backup who knows every patient's chart, and in a big hospital a whole team shares the load. It also decides whether the operating theatre is in the main building or a mobile unit. Firewalls face the same questions: <b>who takes over</b> if this box dies, <b>how much</b> it must carry, and <b>where</b> it runs (appliance, hypervisor, public cloud). This chapter gives you the pointers for deployment design; the detailed builds are in sec-asa-ha.</p>

<h3>Failover pairs</h3>
<ul>
<li><b>Active/standby</b>: one unit forwards, the other waits with the same configuration. A <b>failover link</b> carries hellos and configuration sync; a <b>stateful failover link</b> copies the connection and translation tables so sessions survive a switchover. The standby takes over the active unit's IP and MAC addresses.</li>
<li><b>Active/active</b>: only with multiple contexts; each unit is active for some contexts and standby for others. It spreads load, but each unit must still be able to carry everything if its partner fails.</li>
<li>Both units must be the same model, same software, same interfaces and same firewall mode.</li>
</ul>
<pre class="out">NK-ASA# show failover | include host|Failover On
<span class="hl">Failover On</span>
        This host: Primary - Active
        Other host: Secondary - Standby Ready</pre>

<h3>Clustering</h3>
<p>A <b>cluster</b> groups several units (up to 16 on the larger platforms) into one logical firewall that shares the load. There are two interface models:</p>
<ul>
<li><b>Spanned EtherChannel</b>: one port-channel on the switch spans every unit; the switch hashes flows to units. Works in routed and <b>transparent</b> mode, and is the recommended model.</li>
<li><b>Individual interfaces</b>: each unit has its own IP, and routing (ECMP or PBR) spreads load. Supported in <b>routed</b> mode only.</li>
</ul>
<p>The <b>cluster control link</b> carries control messages and forwards packets of flows that arrived at the "wrong" unit.</p>

<h3>HA and deployment mode interact</h3>
<ul>
<li><b>Transparent failover</b>: both units connect to the same VLANs, so a brief dual-active moment can create a loop. Allow <b>BPDUs</b> with an EtherType ACL so switches can run spanning tree through the firewall, and never put the failover link in a bridge group.</li>
<li><b>Route tracking</b> (chapter 9) runs on the active unit; after a failover the new active unit starts its own SLA probes.</li>
<li><b>Inline sets</b> on Threat Defense HA pairs: hardware bypass and fail-open still decide what happens if Snort restarts.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="HA options">
<rect x="20" y="30" width="190" height="150" rx="10" fill="#bae6fd"/><text x="115" y="55" text-anchor="middle" class="svg-ink" font-size="14">Failover pair</text>
<rect x="45" y="75" width="60" height="36" rx="6" fill="#bbf7d0"/><text x="75" y="98" text-anchor="middle" class="svg-ink" font-size="12">Active</text>
<rect x="125" y="75" width="60" height="36" rx="6" fill="#e2e8f0"/><text x="155" y="98" text-anchor="middle" class="svg-ink" font-size="12">Standby</text>
<line x1="105" y1="93" x2="125" y2="93" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<text x="115" y="140" text-anchor="middle" class="svg-muted" font-size="12">failover + state link</text><text x="115" y="160" text-anchor="middle" class="svg-muted" font-size="12">1 unit forwards</text>
<rect x="225" y="30" width="190" height="150" rx="10" fill="#ddd6fe"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="14">Cluster</text>
<rect x="240" y="75" width="45" height="36" rx="6" fill="#bbf7d0"/><text x="262" y="98" text-anchor="middle" class="svg-ink" font-size="12">U1</text>
<rect x="297" y="75" width="45" height="36" rx="6" fill="#bbf7d0"/><text x="320" y="98" text-anchor="middle" class="svg-ink" font-size="12">U2</text>
<rect x="355" y="75" width="45" height="36" rx="6" fill="#bbf7d0"/><text x="377" y="98" text-anchor="middle" class="svg-ink" font-size="12">U3</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">spanned EtherChannel</text><text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">all units forward</text>
<rect x="430" y="30" width="190" height="150" rx="10" fill="#fde68a"/><text x="525" y="55" text-anchor="middle" class="svg-ink" font-size="14">Public cloud</text>
<rect x="455" y="75" width="140" height="30" rx="6" fill="#fed7aa"/><text x="525" y="95" text-anchor="middle" class="svg-ink" font-size="12">load balancer</text>
<rect x="465" y="115" width="50" height="28" rx="6" fill="#bbf7d0"/><text x="490" y="134" text-anchor="middle" class="svg-ink" font-size="12">FTDv</text>
<rect x="535" y="115" width="50" height="28" rx="6" fill="#bbf7d0"/><text x="560" y="134" text-anchor="middle" class="svg-ink" font-size="12">FTDv</text>
<text x="525" y="165" text-anchor="middle" class="svg-muted" font-size="12">no shared layer 2</text>
<text x="320" y="225" text-anchor="middle" class="svg-accent" font-size="13">Choose by: capacity, state sync, and whether layer 2 adjacency exists</text>
</svg><p class="cap">Three ways to survive a firewall failure.</p></div>

<h3>One box, several firewalls: contexts and multi-instance</h3>
<p>Sometimes one physical firewall must behave like several independent ones: one per customer, per department or per environment. The two platforms solve this differently, and the exam expects you to know the concept, not every command.</p>
<table class="cmp"><tr><th></th><th>ASA multiple context mode</th><th>Threat Defense multi-instance</th></tr>
<tr><td>How it is enabled</td><td><code>mode multiple</code> (reboots; the old configuration becomes the admin context)</td><td>container instances created on the chassis (Firepower 4100/9300; Secure Firewall 3100 and 4200 on recent releases)</td></tr>
<tr><td>What each one gets</td><td>its own configuration file, interfaces (<code>allocate-interface</code>), policy and routing; limits through resource classes</td><td>dedicated CPU cores, memory and disk; its own software image and its own Management Center registration</td></tr>
<tr><td>Firewall mode</td><td>each context can be routed or transparent</td><td>each instance chooses routed or transparent</td></tr>
<tr><td>Isolation</td><td>logical: one shared software image and CPU</td><td>stronger: one instance crashing or upgrading does not touch the others</td></tr></table>
<p>In ASA multiple context mode the <b>system execution space</b> defines the contexts and allocates interfaces; the <b>admin context</b> is a normal context with management rights. When contexts share an interface, the ASA classifies incoming packets by the unique MAC address each context gets on that interface (<code>mac-address auto</code>), so do not disable it. Not every feature is available in multiple context mode (multicast routing is the classic example), so check the feature list first. Threat Defense has no context mode at all; inside a single instance, <b>virtual routers</b> separate routing tables (like VRFs), but they share one policy.</p>

<h3>Form factors</h3>
<table class="cmp"><tr><th>Form factor</th><th>Examples</th><th>Deployment notes</th></tr>
<tr><td>Hardware appliance</td><td>Secure Firewall 1200, 3100, 4200 series; older Firepower 1000, 2100, 4100, 9300</td><td>highest throughput, FTW modules for hardware bypass, clustering; larger models can run several Threat Defense <b>instances</b></td></tr>
<tr><td>Virtual, private cloud</td><td>ASAv, Threat Defense Virtual on VMware, KVM, Hyper-V, Nutanix</td><td>licensed by performance tier; failover and clustering available on private hypervisors</td></tr>
<tr><td>Virtual, public cloud</td><td>ASAv and Threat Defense Virtual in AWS, Azure, GCP, OCI</td><td>no shared layer 2 for classic failover; use cloud load balancers (the "load-balancer sandwich"), auto scale groups, clustering behind a gateway load balancer using GENEVE, or cloud-API based HA</td></tr></table>

<h3>Managers</h3>
<table class="cmp"><tr><th>Manager</th><th>Manages</th><th>Good for</th></tr>
<tr><td>CLI and ASDM</td><td>one ASA (or one pair)</td><td>classic ASA sites</td></tr>
<tr><td>Device Manager (FDM)</td><td>one Threat Defense, on the box</td><td>a single small firewall; routed mode only</td></tr>
<tr><td>Management Center (FMC), hardware or virtual</td><td>many Threat Defense devices</td><td>full features: HA, clustering, inline sets, events, correlation</td></tr>
<tr><td>Cloud-delivered Management Center in Security Cloud Control</td><td>Threat Defense (and ASA inventory) from the cloud</td><td>no manager to host or upgrade</td></tr></table>

<div class="eg"><p><b>Worked example.</b> An internet edge must carry 12 Gbps of inspected traffic and survive one unit failure. A single appliance model rated at 15 Gbps in an active/standby pair meets it: one unit carries all 12 Gbps. An active/active design with two 8 Gbps units would <i>look</i> like 16 Gbps, but when one unit fails the survivor must carry 12 Gbps on an 8 Gbps box, so it fails the requirement. A three-unit cluster of 8 Gbps units gives about 16 Gbps with one unit down.</p></div>

<div class="warn"><p><b>Common mistake.</b> Sizing an active/active pair or a cluster at full combined capacity. Always size for <b>N-1</b>: what is left when one unit is gone.</p></div>

<div class="exam"><p><b>Exam trap.</b> Individual interface clustering is routed mode only; transparent clustering uses spanned EtherChannel. Device Manager (FDM) cannot manage transparent mode or inline sets; those need the Management Center. "Multiple contexts" is an ASA feature; the Threat Defense answer for hard separation on one chassis is <b>multi-instance</b>.</p></div>

<div class="scn"><h4>The loop after a failover test</h4><p>A campus team ran a failover test on a transparent pair. For about two seconds both units forwarded, and because BPDUs were not allowed through the firewalls, the switches did not see the second path; a broadcast storm took the building offline. After adding <code>access-list NONIP ethertype permit bpdu</code> on both bridge interfaces, spanning tree blocked one path during the next test and nothing happened.</p><p><b>Lesson:</b> transparent HA designs must let spanning tree see through the firewall.</p></div>

<div class="iv"><p class="q">"How would you make a firewall highly available in AWS?"</p><p>Explain that classic failover relies on a shared layer 2 segment and gratuitous ARP, which public clouds do not provide. Options are a load-balancer sandwich with independent firewalls and source NAT for symmetry, auto scale groups, or Threat Defense clustering behind the AWS Gateway Load Balancer with GENEVE, which keeps flows symmetric. Mention that state is not synchronised in the sandwich design, so a failure resets sessions on the lost instance.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Failover pair: active/standby (or active/active with contexts), failover link plus stateful link.</li>
<li>Cluster: spanned EtherChannel (routed or transparent) or individual interfaces (routed only).</li>
<li>Transparent HA must pass BPDUs to avoid loops.</li>
<li>ASA splits one box with multiple contexts (each routed or transparent); Threat Defense uses multi-instance containers with dedicated resources.</li>
<li>Public cloud HA uses load balancers, auto scale, GWLB clustering or cloud APIs, not layer 2 failover.</li>
<li>Size HA designs for N-1; choose the manager (ASDM, FDM, FMC, cloud-delivered FMC) by scale and features.</li>
</ul></div>
`,hi:`
<p>Hospital mein ek hi surgeon on call nahi hota; ek duty surgeon hota hai aur ek backup jo har patient ka chart jaanta hai, aur bade hospital mein poori team load share karti hai. Hospital yeh bhi decide karta hai ki operating theatre main building mein hai ya mobile unit mein. Firewalls ke saamne bhi yahi sawaal hain: yeh box mare to <b>kaun take over</b> kare, use <b>kitna</b> load uthana hai, aur yeh <b>kahan</b> chalta hai (appliance, hypervisor, public cloud). Yeh chapter deployment design ke pointers deta hai; detailed builds sec-asa-ha mein hain.</p>

<h3>Failover pairs</h3>
<ul>
<li><b>Active/standby</b>: ek unit forward karta hai, doosra same configuration ke saath intezaar karta hai. <b>Failover link</b> hellos aur configuration sync le jaata hai; <b>stateful failover link</b> connection aur translation tables copy karta hai taaki sessions switchover ke baad bhi bache rahein. Standby active unit ke IP aur MAC addresses le leta hai.</li>
<li><b>Active/active</b>: sirf multiple contexts ke saath; har unit kuch contexts ke liye active aur baaki ke liye standby hota hai. Load baantta hai, lekin har unit ko partner fail hone par sab kuch uthane layak hona chahiye.</li>
<li>Dono units same model, same software, same interfaces aur same firewall mode ke hone chahiye.</li>
</ul>
<pre class="out">NK-ASA# show failover | include host|Failover On
<span class="hl">Failover On</span>
        This host: Primary - Active
        Other host: Secondary - Standby Ready</pre>

<h3>Clustering</h3>
<p><b>Cluster</b> kai units (bade platforms par 16 tak) ko ek logical firewall mein group karta hai jo load share karta hai. Do interface models hain:</p>
<ul>
<li><b>Spanned EtherChannel</b>: switch ka ek port-channel har unit tak failta hai; switch flows ko units par hash karta hai. Routed aur <b>transparent</b> mode dono mein chalta hai, aur recommended model hai.</li>
<li><b>Individual interfaces</b>: har unit ka apna IP hota hai, aur routing (ECMP ya PBR) load baantti hai. Sirf <b>routed</b> mode mein supported.</li>
</ul>
<p><b>Cluster control link</b> control messages le jaata hai aur un flows ke packets forward karta hai jo "galat" unit par aaye.</p>

<h3>HA aur deployment mode aapas mein judte hain</h3>
<ul>
<li><b>Transparent failover</b>: dono units same VLANs se jude hote hain, isliye chhota sa dual-active pal loop bana sakta hai. EtherType ACL se <b>BPDUs</b> allow karo taaki switches firewall ke through spanning tree chala sakein, aur failover link ko kabhi bridge group mein mat daalo.</li>
<li><b>Route tracking</b> (chapter 9) active unit par chalti hai; failover ke baad naya active unit apne SLA probes shuru karta hai.</li>
<li>Threat Defense HA pairs par <b>inline sets</b>: hardware bypass aur fail-open phir bhi decide karte hain ki Snort restart hone par kya hoga.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="HA options">
<rect x="20" y="30" width="190" height="150" rx="10" fill="#bae6fd"/><text x="115" y="55" text-anchor="middle" class="svg-ink" font-size="14">Failover pair</text>
<rect x="45" y="75" width="60" height="36" rx="6" fill="#bbf7d0"/><text x="75" y="98" text-anchor="middle" class="svg-ink" font-size="12">Active</text>
<rect x="125" y="75" width="60" height="36" rx="6" fill="#e2e8f0"/><text x="155" y="98" text-anchor="middle" class="svg-ink" font-size="12">Standby</text>
<line x1="105" y1="93" x2="125" y2="93" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<text x="115" y="140" text-anchor="middle" class="svg-muted" font-size="12">failover + state link</text><text x="115" y="160" text-anchor="middle" class="svg-muted" font-size="12">1 unit forward karta</text>
<rect x="225" y="30" width="190" height="150" rx="10" fill="#ddd6fe"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="14">Cluster</text>
<rect x="240" y="75" width="45" height="36" rx="6" fill="#bbf7d0"/><text x="262" y="98" text-anchor="middle" class="svg-ink" font-size="12">U1</text>
<rect x="297" y="75" width="45" height="36" rx="6" fill="#bbf7d0"/><text x="320" y="98" text-anchor="middle" class="svg-ink" font-size="12">U2</text>
<rect x="355" y="75" width="45" height="36" rx="6" fill="#bbf7d0"/><text x="377" y="98" text-anchor="middle" class="svg-ink" font-size="12">U3</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">spanned EtherChannel</text><text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">saare units forward</text>
<rect x="430" y="30" width="190" height="150" rx="10" fill="#fde68a"/><text x="525" y="55" text-anchor="middle" class="svg-ink" font-size="14">Public cloud</text>
<rect x="455" y="75" width="140" height="30" rx="6" fill="#fed7aa"/><text x="525" y="95" text-anchor="middle" class="svg-ink" font-size="12">load balancer</text>
<rect x="465" y="115" width="50" height="28" rx="6" fill="#bbf7d0"/><text x="490" y="134" text-anchor="middle" class="svg-ink" font-size="12">FTDv</text>
<rect x="535" y="115" width="50" height="28" rx="6" fill="#bbf7d0"/><text x="560" y="134" text-anchor="middle" class="svg-ink" font-size="12">FTDv</text>
<text x="525" y="165" text-anchor="middle" class="svg-muted" font-size="12">shared layer 2 nahi</text>
<text x="320" y="225" text-anchor="middle" class="svg-accent" font-size="13">Chuno: capacity, state sync, aur layer 2 adjacency hai ya nahi</text>
</svg><p class="cap">Firewall failure jhelne ke teen tareeke.</p></div>

<h3>Ek box, kai firewalls: contexts aur multi-instance</h3>
<p>Kabhi kabhi ek physical firewall ko kai independent firewalls ki tarah behave karna padta hai: har customer, har department ya har environment ke liye ek. Dono platforms ise alag tareeke se solve karte hain, aur exam aapse concept expect karta hai, har command nahi.</p>
<table class="cmp"><tr><th></th><th>ASA multiple context mode</th><th>Threat Defense multi-instance</th></tr>
<tr><td>Kaise enable hota hai</td><td><code>mode multiple</code> (reboot hota hai; purani configuration admin context ban jaati hai)</td><td>chassis par container instances banaye jaate hain (Firepower 4100/9300; recent releases par Secure Firewall 3100 aur 4200)</td></tr>
<tr><td>Har ek ko kya milta hai</td><td>apni configuration file, interfaces (<code>allocate-interface</code>), policy aur routing; resource classes se limits</td><td>dedicated CPU cores, memory aur disk; apni software image aur apna Management Center registration</td></tr>
<tr><td>Firewall mode</td><td>har context routed ya transparent ho sakta hai</td><td>har instance routed ya transparent chunta hai</td></tr>
<tr><td>Isolation</td><td>logical: ek shared software image aur CPU</td><td>zyada strong: ek instance crash ya upgrade ho to baaki ko kuch nahi hota</td></tr></table>
<p>ASA multiple context mode mein <b>system execution space</b> contexts define karta hai aur interfaces allocate karta hai; <b>admin context</b> management rights wala ek normal context hai. Jab contexts ek interface share karte hain, ASA incoming packets ko us unique MAC address se classify karta hai jo har context ko us interface par milta hai (<code>mac-address auto</code>), isliye ise disable mat karo. Multiple context mode mein har feature available nahi hota (multicast routing classic example hai), isliye pehle feature list check karo. Threat Defense mein context mode hota hi nahi; ek single instance ke andar <b>virtual routers</b> routing tables alag karte hain (VRFs jaise), lekin ek hi policy share karte hain.</p>

<h3>Form factors</h3>
<table class="cmp"><tr><th>Form factor</th><th>Examples</th><th>Deployment notes</th></tr>
<tr><td>Hardware appliance</td><td>Secure Firewall 1200, 3100, 4200 series; purane Firepower 1000, 2100, 4100, 9300</td><td>sabse zyada throughput, hardware bypass ke liye FTW modules, clustering; bade models kai Threat Defense <b>instances</b> chala sakte hain</td></tr>
<tr><td>Virtual, private cloud</td><td>VMware, KVM, Hyper-V, Nutanix par ASAv, Threat Defense Virtual</td><td>performance tier se licensed; private hypervisors par failover aur clustering available</td></tr>
<tr><td>Virtual, public cloud</td><td>AWS, Azure, GCP, OCI mein ASAv aur Threat Defense Virtual</td><td>classic failover ke liye shared layer 2 nahi; cloud load balancers ("load-balancer sandwich"), auto scale groups, GENEVE use karne wale gateway load balancer ke peeche clustering, ya cloud-API based HA use karo</td></tr></table>

<h3>Managers</h3>
<table class="cmp"><tr><th>Manager</th><th>Kya manage karta hai</th><th>Kiske liye accha</th></tr>
<tr><td>CLI aur ASDM</td><td>ek ASA (ya ek pair)</td><td>classic ASA sites</td></tr>
<tr><td>Device Manager (FDM)</td><td>ek Threat Defense, box par hi</td><td>ek chhota firewall; sirf routed mode</td></tr>
<tr><td>Management Center (FMC), hardware ya virtual</td><td>kai Threat Defense devices</td><td>poore features: HA, clustering, inline sets, events, correlation</td></tr>
<tr><td>Security Cloud Control mein cloud-delivered Management Center</td><td>cloud se Threat Defense (aur ASA inventory)</td><td>host ya upgrade karne ko koi manager nahi</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ek internet edge ko 12 Gbps inspected traffic uthana hai aur ek unit failure jhelna hai. Active/standby pair mein 15 Gbps rated ek appliance model yeh poora karta hai: ek unit saara 12 Gbps uthata hai. Do 8 Gbps units wala active/active design 16 Gbps jaisa <i>dikhta</i> hai, lekin ek unit fail hone par bache hue ko 8 Gbps box par 12 Gbps uthana padta hai, isliye requirement fail hoti hai. 8 Gbps units ka teen-unit cluster ek unit down hone par lagbhag 16 Gbps deta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Active/active pair ya cluster ko poori combined capacity par size karna. Hamesha <b>N-1</b> ke liye size karo: ek unit jaane ke baad kya bachta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Individual interface clustering sirf routed mode hai; transparent clustering spanned EtherChannel use karta hai. Device Manager (FDM) transparent mode ya inline sets manage nahi kar sakta; unke liye Management Center chahiye. "Multiple contexts" ASA ka feature hai; ek chassis par hard separation ke liye Threat Defense ka jawab <b>multi-instance</b> hai.</p></div>

<div class="scn"><h4>Failover test ke baad loop</h4><p>Ek campus team ne transparent pair par failover test chalaya. Lagbhag do second dono units ne forward kiya, aur kyunki BPDUs firewalls ke through allowed nahi the, switches ko doosra path nahi dikha; ek broadcast storm ne building offline kar di. Dono bridge interfaces par <code>access-list NONIP ethertype permit bpdu</code> jodne ke baad agle test mein spanning tree ne ek path block kiya aur kuch nahi hua.</p><p><b>Seekh:</b> transparent HA designs ko spanning tree ko firewall ke paar dekhne dena chahiye.</p></div>

<div class="iv"><p class="q">"AWS mein firewall ko highly available kaise banaoge?"</p><p>Samjhao ki classic failover shared layer 2 segment aur gratuitous ARP par tika hai, jo public clouds nahi dete. Options hain independent firewalls aur symmetry ke liye source NAT ke saath load-balancer sandwich, auto scale groups, ya AWS Gateway Load Balancer ke peeche GENEVE ke saath Threat Defense clustering, jo flows ko symmetric rakhta hai. Batao ki sandwich design mein state sync nahi hota, isliye failure khoye instance ke sessions reset karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Failover pair: active/standby (ya contexts ke saath active/active), failover link plus stateful link.</li>
<li>Cluster: spanned EtherChannel (routed ya transparent) ya individual interfaces (sirf routed).</li>
<li>Transparent HA ko loops se bachne ke liye BPDUs pass karne chahiye.</li>
<li>ASA ek box ko multiple contexts se baantta hai (har ek routed ya transparent); Threat Defense dedicated resources wale multi-instance containers use karta hai.</li>
<li>Public cloud HA load balancers, auto scale, GWLB clustering ya cloud APIs use karta hai, layer 2 failover nahi.</li>
<li>HA designs N-1 ke liye size karo; manager (ASDM, FDM, FMC, cloud-delivered FMC) scale aur features se chuno.</li>
</ul></div>
`}};export{e as default};