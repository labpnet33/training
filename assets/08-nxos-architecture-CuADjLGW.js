var e={id:`nxos-architecture`,h:{en:`How NX-OS is built: features, processes and high availability`,hi:`NX-OS kaise bana hai: features, processes aur high availability`},body:{en:`
<p>Picture a modern apartment building. Each flat has its own door, its own meter and its own sprinkler. If the kitchen in flat 7B catches fire, the sprinkler in 7B puts it out and the rest of the building carries on. Nobody evacuates the tower. NX-OS, the operating system on Cisco Nexus switches, is built like that building: every protocol lives in its own protected "flat", and a problem in one does not bring down the others. In this chapter you will learn how NX-OS is organised and why that matters in operations.</p>

<h3>A modular, Linux-based system</h3>
<p>NX-OS grew out of the operating system of Cisco's MDS storage switches and runs on a <b>Linux kernel</b>. On top of the kernel runs a small infrastructure layer, and on top of that each protocol or function runs as a separate <b>process</b> (also called a service) with its own protected memory.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="NX-OS software layers">
<rect x="10" y="10" width="620" height="36" rx="8" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">CLI, NX-API, Python, SNMP, telemetry</text>
<rect x="10" y="56" width="115" height="46" rx="6" fill="#bae6fd"/><text x="67" y="84" text-anchor="middle" class="svg-ink" font-size="13">OSPF</text>
<rect x="135" y="56" width="115" height="46" rx="6" fill="#bae6fd"/><text x="192" y="84" text-anchor="middle" class="svg-ink" font-size="13">BGP</text>
<rect x="260" y="56" width="115" height="46" rx="6" fill="#bae6fd"/><text x="317" y="84" text-anchor="middle" class="svg-ink" font-size="13">LACP</text>
<rect x="385" y="56" width="115" height="46" rx="6" fill="#bae6fd"/><text x="442" y="84" text-anchor="middle" class="svg-ink" font-size="13">vPC</text>
<rect x="510" y="56" width="120" height="46" rx="6" fill="#bae6fd"/><text x="570" y="84" text-anchor="middle" class="svg-ink" font-size="13">STP, ...</text>
<rect x="10" y="112" width="620" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="13">Infrastructure: System Manager, MTS messaging, PSS state storage</text>
<rect x="10" y="158" width="620" height="30" rx="8" fill="#e2e8f0"/><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="13">Linux kernel</text>
<rect x="10" y="196" width="620" height="28" rx="8" fill="#bbf7d0"/><text x="320" y="215" text-anchor="middle" class="svg-ink" font-size="13">Hardware: supervisor CPU, forwarding ASICs</text>
</svg><p class="cap">Each feature is its own process. The infrastructure layer watches, restarts and stores state for them.</p></div>
<dl class="terms">
<dt>System Manager (sysmgr)</dt><dd>Starts, monitors and restarts every service according to its high-availability policy.</dd>
<dt>MTS</dt><dd>Messaging and Transaction Service: how processes talk to each other.</dd>
<dt>PSS</dt><dd>Persistent Storage Service: processes checkpoint their state here, so a restarted process can recover where it left off.</dd>
</dl>

<h3>Feature-based: turn on only what you use</h3>
<p>On IOS, OSPF code is always present. On NX-OS, a protocol does not even load until you enable its <b>feature</b>. Until then, its configuration commands are rejected.</p>
<pre class="code"><span class="c">! Enable only what this leaf needs</span>
feature ospf
feature interface-vlan
feature lacp
feature bfd</pre>
<pre class="out">LEAF1# show feature | include enabled
bfd                    1          enabled
interface-vlan         1          enabled
lacp                   1          enabled
<span class="hl">ospf                   1          enabled</span></pre>
<p>Benefits: less memory and CPU used, a smaller attack surface, and a clear list of what the switch is doing. Typical data center features: <code>ospf</code>, <code>bgp</code>, <code>isis</code>, <code>interface-vlan</code> (SVIs), <code>lacp</code>, <code>vpc</code>, <code>hsrp</code>, <code>bfd</code>, <code>nv overlay</code> (VXLAN), <code>nxapi</code>.</p>

<h3>Process restartability</h3>
<p>Because each feature is a separate process, a software fault in one does not crash the switch. The System Manager restarts the failed process, and the process reloads its state from PSS. The forwarding ASICs keep forwarding with the last programmed tables in the meantime, and with <b>graceful restart</b> neighbors keep using the routes while the adjacency recovers. You can even restart a protocol yourself:</p>
<pre class="code">LEAF1# restart ospf UNDERLAY</pre>
<p>This separation of the <b>control plane</b> (processes on the supervisor CPU) from the <b>data plane</b> (ASICs) is the foundation of NX-OS high availability.</p>

<h3>High availability: supervisors and ISSU</h3>
<ul>
<li><b>Dual supervisors</b> (modular chassis): one active, one hot standby with synchronised state. If the active fails, the standby takes over with a <b>stateful switchover</b> and forwarding continues. You can trigger it manually with <code>system switchover</code> and check with <code>show system redundancy status</code>.</li>
<li><b>ISSU</b> (In-Service Software Upgrade): upgrade NX-OS with little or no traffic impact. On dual-supervisor systems the standby is upgraded first, then roles swap. Many single-supervisor Nexus 9000 models support a non-disruptive (enhanced) ISSU with conditions. Always check first:</li>
</ul>
<pre class="code">show install all impact nxos bootflash:nxos64-cs.10.4.3.F.bin
install all nxos bootflash:nxos64-cs.10.4.3.F.bin</pre>
<p>On fixed switches, which have a single supervisor, the fabric itself provides redundancy: dual-homed servers and multiple spines keep traffic flowing while one switch reloads.</p>

<h3>VDCs: one chassis, several switches</h3>
<p><b>Virtual Device Contexts</b> on the Nexus 7000/7700 split one physical chassis into several logical switches. Each VDC has its own configuration, processes, administrators and allocated physical ports, so a fault in one VDC cannot affect another. They were used to separate, for example, a production core and a test network inside one chassis. You move between them with <code>switchto vdc NAME</code> and list them with <code>show vdc</code>. Nexus 9000 switches do <b>not</b> support multiple VDCs; separation there comes from VRFs, separate switches, or tenants in ACI.</p>

<h3>VRFs and the management interface</h3>
<p>Every Nexus starts with two VRFs: <b>default</b>, which holds your data-plane routing, and <b>management</b>, which holds only the out-of-band <b>mgmt0</b> port. Their routing tables are completely separate. This protects management access from mistakes in the production routing table, but it means you must name the VRF for management traffic.</p>
<pre class="code"><span class="c">! Out-of-band management</span>
interface mgmt0
  vrf member management
  ip address 192.0.2.21/24
vrf context management
  ip route 0.0.0.0/0 192.0.2.1</pre>
<pre class="out">LEAF1# ping 192.0.2.1
<span class="hl">connect: Network is unreachable</span>
LEAF1# ping 192.0.2.1 vrf management
64 bytes from 192.0.2.1: icmp_seq=0 ttl=254 time=0.8 ms</pre>
<p>The same applies to <code>copy</code>, <code>ssh</code>, NTP and syslog configured through mgmt0: add <code>vrf management</code> or configure the service to use that VRF.</p>

<h3>Licensing basics</h3>
<p>Current Nexus 9000 releases use tiered licences (<b>Essentials</b> for standard switching and routing, <b>Advantage</b> for advanced features, and higher bundles that add software such as Nexus Dashboard) with <b>Smart Licensing Using Policy</b>, which reports usage rather than blocking features. Older platforms such as the Nexus 7000 and 3000 used package licences, for example <code>LAN_ENTERPRISE_SERVICES_PKG</code> for OSPF and BGP, with a temporary grace period. <code>show license usage</code> shows what is in use. For the exam, know that licensing is feature-tier based and must be planned per switch.</p>

<div class="warn"><p><b>Common mistakes.</b> Typing <code>no feature ospf</code> to "reset" OSPF: it removes every line of OSPF configuration from the switch. Pinging or copying through mgmt0 without <code>vrf management</code>. Assuming a Nexus 9000 supports VDCs. Starting an upgrade without running <code>show install all impact</code>.</p></div>
<div class="exam"><p><b>Exam tip.</b> NX-OS is modular: features must be enabled, each runs as a restartable process with state in PSS. HA: dual supervisors with stateful switchover, ISSU. VDCs exist on Nexus 7000/7700, not Nexus 9000. mgmt0 is in the management VRF.</p></div>

<div class="scn"><h4>The upgrade image that would not copy</h4><p>During a maintenance window an engineer tried to copy a new NX-OS image to LEAF4 from the SCP server 192.0.2.50 on the out-of-band network. The copy failed immediately with a "No route to host" style error, and a plain <code>ping 192.0.2.50</code> failed too. <code>show ip interface brief</code> showed no mgmt0 at all, because that command lists only the default VRF. <code>show ip interface brief vrf management</code> showed mgmt0 up with 192.0.2.24/24. The engineer re-ran the copy as <code>copy scp: bootflash: vrf management</code>, which succeeded, then used <code>show install all impact</code> before upgrading.</p><p><b>Lesson:</b> on NX-OS, management traffic lives in its own VRF; always add <code>vrf management</code> when working through mgmt0.</p></div>

<div class="iv"><p class="q">"What happens on a Nexus switch if the OSPF process crashes?"</p><p>Strong answer: NX-OS runs each feature as a separate process with protected memory. The System Manager detects the crash and restarts OSPF according to its HA policy; OSPF recovers its state from the Persistent Storage Service, and graceful restart lets neighbors keep forwarding. The ASICs keep forwarding with the existing hardware tables, so traffic is usually unaffected, and other processes (BGP, LACP, vPC) never notice. Mention that you can also run <code>restart ospf</code> manually and that dual supervisors add stateful switchover on modular chassis.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NX-OS is Linux-based and modular; each feature runs as a separate, restartable process.</li>
<li>Protocols must be enabled with <code>feature</code>; <code>no feature</code> deletes their configuration.</li>
<li>High availability: process restart with PSS, graceful restart, dual supervisors, ISSU.</li>
<li>VDCs split a Nexus 7000/7700 into logical switches; Nexus 9000 does not support them.</li>
<li>mgmt0 lives in the management VRF, separate from the default VRF; licences are feature tiers.</li>
</ul></div>
`,hi:`
<p>Ek modern apartment building socho. Har flat ka apna darwaza, apna meter aur apna sprinkler hai. Agar flat 7B ki kitchen mein aag lagti hai, to 7B ka sprinkler use bujha deta hai aur baaki building chalti rehti hai. Koi tower khaali nahi karta. NX-OS, Cisco Nexus switches ka operating system, usi building ki tarah bana hai: har protocol apne protected "flat" mein rehta hai, aur ek ki problem baaki ko nahi girati. Is chapter mein aap seekhoge ki NX-OS kaise organise hai aur operations mein yeh kyun matter karta hai.</p>

<h3>Ek modular, Linux-based system</h3>
<p>NX-OS Cisco ke MDS storage switches ke operating system se nikla hai aur ek <b>Linux kernel</b> par chalta hai. Kernel ke upar ek chhoti infrastructure layer chalti hai, aur uske upar har protocol ya function apni protected memory ke saath ek alag <b>process</b> (jise service bhi kehte hain) ki tarah chalta hai.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="NX-OS software layers">
<rect x="10" y="10" width="620" height="36" rx="8" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">CLI, NX-API, Python, SNMP, telemetry</text>
<rect x="10" y="56" width="115" height="46" rx="6" fill="#bae6fd"/><text x="67" y="84" text-anchor="middle" class="svg-ink" font-size="13">OSPF</text>
<rect x="135" y="56" width="115" height="46" rx="6" fill="#bae6fd"/><text x="192" y="84" text-anchor="middle" class="svg-ink" font-size="13">BGP</text>
<rect x="260" y="56" width="115" height="46" rx="6" fill="#bae6fd"/><text x="317" y="84" text-anchor="middle" class="svg-ink" font-size="13">LACP</text>
<rect x="385" y="56" width="115" height="46" rx="6" fill="#bae6fd"/><text x="442" y="84" text-anchor="middle" class="svg-ink" font-size="13">vPC</text>
<rect x="510" y="56" width="120" height="46" rx="6" fill="#bae6fd"/><text x="570" y="84" text-anchor="middle" class="svg-ink" font-size="13">STP, ...</text>
<rect x="10" y="112" width="620" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="13">Infrastructure: System Manager, MTS messaging, PSS state storage</text>
<rect x="10" y="158" width="620" height="30" rx="8" fill="#e2e8f0"/><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="13">Linux kernel</text>
<rect x="10" y="196" width="620" height="28" rx="8" fill="#bbf7d0"/><text x="320" y="215" text-anchor="middle" class="svg-ink" font-size="13">Hardware: supervisor CPU, forwarding ASICs</text>
</svg><p class="cap">Har feature apna alag process hai. Infrastructure layer unhe watch karti hai, restart karti hai aur unka state store karti hai.</p></div>
<dl class="terms">
<dt>System Manager (sysmgr)</dt><dd>Har service ko uski high-availability policy ke hisaab se start, monitor aur restart karta hai.</dd>
<dt>MTS</dt><dd>Messaging and Transaction Service: processes aapas mein isi se baat karte hain.</dd>
<dt>PSS</dt><dd>Persistent Storage Service: processes apna state yahan checkpoint karte hain, taaki restart hua process wahin se recover kar sake jahan chhoda tha.</dd>
</dl>

<h3>Feature-based: sirf wahi on karo jo use karte ho</h3>
<p>IOS par OSPF code hamesha present rehta hai. NX-OS par koi protocol tab tak load hi nahi hota jab tak aap uska <b>feature</b> enable na karo. Tab tak uske configuration commands reject hote hain.</p>
<pre class="code"><span class="c">! Sirf wahi enable karo jo is leaf ko chahiye</span>
feature ospf
feature interface-vlan
feature lacp
feature bfd</pre>
<pre class="out">LEAF1# show feature | include enabled
bfd                    1          enabled
interface-vlan         1          enabled
lacp                   1          enabled
<span class="hl">ospf                   1          enabled</span></pre>
<p>Fayde: kam memory aur CPU use, chhota attack surface, aur saaf list ki switch kya kar raha hai. Typical data center features: <code>ospf</code>, <code>bgp</code>, <code>isis</code>, <code>interface-vlan</code> (SVIs), <code>lacp</code>, <code>vpc</code>, <code>hsrp</code>, <code>bfd</code>, <code>nv overlay</code> (VXLAN), <code>nxapi</code>.</p>

<h3>Process restartability</h3>
<p>Kyunki har feature ek alag process hai, ek mein software fault poore switch ko crash nahi karta. System Manager failed process ko restart karta hai, aur process PSS se apna state reload karta hai. Is beech forwarding ASICs aakhri programmed tables ke saath forward karte rehte hain, aur <b>graceful restart</b> ke saath neighbors adjacency recover hone tak routes use karte rehte hain. Aap khud bhi ek protocol restart kar sakte ho:</p>
<pre class="code">LEAF1# restart ospf UNDERLAY</pre>
<p><b>Control plane</b> (supervisor CPU par processes) aur <b>data plane</b> (ASICs) ka yeh separation NX-OS high availability ki neev hai.</p>

<h3>High availability: supervisors aur ISSU</h3>
<ul>
<li><b>Dual supervisors</b> (modular chassis): ek active, ek hot standby synchronised state ke saath. Agar active fail ho, to standby <b>stateful switchover</b> se le leta hai aur forwarding chalti rehti hai. Aap ise manually <code>system switchover</code> se trigger kar sakte ho aur <code>show system redundancy status</code> se check kar sakte ho.</li>
<li><b>ISSU</b> (In-Service Software Upgrade): NX-OS ko bahut kam ya bina traffic impact ke upgrade karna. Dual-supervisor systems par pehle standby upgrade hota hai, phir roles swap hote hain. Bahut saare single-supervisor Nexus 9000 models conditions ke saath non-disruptive (enhanced) ISSU support karte hain. Hamesha pehle check karo:</li>
</ul>
<pre class="code">show install all impact nxos bootflash:nxos64-cs.10.4.3.F.bin
install all nxos bootflash:nxos64-cs.10.4.3.F.bin</pre>
<p>Fixed switches par, jinke paas ek hi supervisor hota hai, fabric khud redundancy deta hai: dual-homed servers aur kai spines ek switch ke reload hone ke dauraan traffic chalu rakhte hain.</p>

<h3>VDCs: ek chassis, kai switches</h3>
<p>Nexus 7000/7700 par <b>Virtual Device Contexts</b> ek physical chassis ko kai logical switches mein baant dete hain. Har VDC ki apni configuration, processes, administrators aur allocated physical ports hote hain, isliye ek VDC ka fault dusre ko affect nahi kar sakta. Inka use hota tha, jaise, ek chassis ke andar production core aur test network ko alag karne ke liye. Aap <code>switchto vdc NAME</code> se unke beech jaate ho aur <code>show vdc</code> se list karte ho. Nexus 9000 switches multiple VDCs <b>support nahi</b> karte; wahan separation VRFs, alag switches, ya ACI mein tenants se aata hai.</p>

<h3>VRFs aur management interface</h3>
<p>Har Nexus do VRFs ke saath start hota hai: <b>default</b>, jismein aapki data-plane routing hoti hai, aur <b>management</b>, jismein sirf out-of-band <b>mgmt0</b> port hota hai. Unki routing tables poori tarah alag hain. Yeh management access ko production routing table ki galtiyon se bachata hai, lekin iska matlab hai ki management traffic ke liye aapko VRF ka naam dena padta hai.</p>
<pre class="code"><span class="c">! Out-of-band management</span>
interface mgmt0
  vrf member management
  ip address 192.0.2.21/24
vrf context management
  ip route 0.0.0.0/0 192.0.2.1</pre>
<pre class="out">LEAF1# ping 192.0.2.1
<span class="hl">connect: Network is unreachable</span>
LEAF1# ping 192.0.2.1 vrf management
64 bytes from 192.0.2.1: icmp_seq=0 ttl=254 time=0.8 ms</pre>
<p>Yahi baat mgmt0 ke through configure kiye gaye <code>copy</code>, <code>ssh</code>, NTP aur syslog par bhi lagti hai: <code>vrf management</code> jodo ya service ko us VRF ko use karne ke liye configure karo.</p>

<h3>Licensing basics</h3>
<p>Current Nexus 9000 releases tiered licences use karte hain (standard switching aur routing ke liye <b>Essentials</b>, advanced features ke liye <b>Advantage</b>, aur upar ke bundles jo Nexus Dashboard jaisa software jodte hain) <b>Smart Licensing Using Policy</b> ke saath, jo features block karne ki jagah usage report karta hai. Nexus 7000 aur 3000 jaise purane platforms package licences use karte the, jaise OSPF aur BGP ke liye <code>LAN_ENTERPRISE_SERVICES_PKG</code>, ek temporary grace period ke saath. <code>show license usage</code> dikhata hai ki kya use ho raha hai. Exam ke liye yaad rakho ki licensing feature-tier based hai aur har switch ke liye plan karni padti hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> OSPF ko "reset" karne ke liye <code>no feature ospf</code> type karna: yeh switch se OSPF configuration ki har line hata deta hai. <code>vrf management</code> ke bina mgmt0 se ping ya copy karna. Yeh maanna ki Nexus 9000 VDCs support karta hai. <code>show install all impact</code> chalaye bina upgrade shuru karna.</p></div>
<div class="exam"><p><b>Exam tip.</b> NX-OS modular hai: features enable karne padte hain, har ek PSS mein state ke saath restartable process ki tarah chalta hai. HA: stateful switchover ke saath dual supervisors, ISSU. VDCs Nexus 7000/7700 par hain, Nexus 9000 par nahi. mgmt0 management VRF mein hai.</p></div>

<div class="scn"><h4>Upgrade image jo copy nahi ho rahi thi</h4><p>Maintenance window ke dauraan ek engineer ne out-of-band network par SCP server 192.0.2.50 se LEAF4 par nayi NX-OS image copy karne ki koshish ki. Copy turant "No route to host" jaise error ke saath fail ho gayi, aur simple <code>ping 192.0.2.50</code> bhi fail hua. <code>show ip interface brief</code> mein mgmt0 dikha hi nahi, kyunki woh command sirf default VRF list karta hai. <code>show ip interface brief vrf management</code> ne mgmt0 ko 192.0.2.24/24 ke saath up dikhaya. Engineer ne copy ko <code>copy scp: bootflash: vrf management</code> ki tarah dobara chalaya, jo succeed hua, phir upgrade se pehle <code>show install all impact</code> use kiya.</p><p><b>Seekh:</b> NX-OS par management traffic apne alag VRF mein rehta hai; mgmt0 se kaam karte hue hamesha <code>vrf management</code> jodo.</p></div>

<div class="iv"><p class="q">"Nexus switch par OSPF process crash ho jaaye to kya hota hai?"</p><p>Strong answer: NX-OS har feature ko protected memory ke saath alag process ki tarah chalata hai. System Manager crash detect karta hai aur OSPF ko uski HA policy ke hisaab se restart karta hai; OSPF apna state Persistent Storage Service se recover karta hai, aur graceful restart neighbors ko forward karte rehne deta hai. ASICs existing hardware tables ke saath forward karte rehte hain, isliye traffic aam taur par affect nahi hota, aur dusre processes (BGP, LACP, vPC) ko pata bhi nahi chalta. Yeh bhi batao ki aap manually <code>restart ospf</code> chala sakte ho aur modular chassis par dual supervisors stateful switchover jodte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NX-OS Linux-based aur modular hai; har feature ek alag, restartable process ki tarah chalta hai.</li>
<li>Protocols ko <code>feature</code> se enable karna padta hai; <code>no feature</code> unki configuration delete kar deta hai.</li>
<li>High availability: PSS ke saath process restart, graceful restart, dual supervisors, ISSU.</li>
<li>VDCs Nexus 7000/7700 ko logical switches mein baant-te hain; Nexus 9000 unhe support nahi karta.</li>
<li>mgmt0 management VRF mein rehta hai, default VRF se alag; licences feature tiers hain.</li>
</ul></div>
`}};export{e as default};