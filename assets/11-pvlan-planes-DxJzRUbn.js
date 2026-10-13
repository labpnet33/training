var e={id:`pvlan-planes`,h:{en:`Private VLANs and protecting the three planes`,hi:`Private VLANs aur teen planes ki suraksha`},body:{en:`
<p>Think of a hotel corridor. Every guest shares the same corridor, the same floor number and the same reception desk, yet no guest can walk into another guest's room. Only hotel staff with a master key can reach every room. A <b>private VLAN (PVLAN)</b> builds that corridor inside one VLAN: all hosts share one subnet and one gateway, but they cannot talk to each other at Layer 2 unless you allow it. In the second half of this chapter we step back from the access port and look at the whole device through the lens of the <b>data, control and management planes</b>, so you can place every control from this module in the bigger picture of infrastructure hardening.</p>

<h3>Why normal VLANs are not enough</h3>
<p>Chapter 2 showed that a VLAN separates groups of hosts. But inside a VLAN every host can reach every other host directly. In a DMZ, if one web server is compromised it can scan and attack the other servers next to it without ever passing the firewall. You could give every server its own VLAN and subnet, but with 40 servers that means 40 subnets, 40 gateways and a lot of wasted addresses. A private VLAN keeps <b>one subnet</b> and still blocks host-to-host traffic.</p>

<h3>Private VLAN building blocks</h3>
<dl class="terms">
<dt>Primary VLAN</dt><dd>The "parent" VLAN. It carries traffic from the promiscuous port (the gateway) down to all hosts.</dd>
<dt>Isolated VLAN</dt><dd>A secondary VLAN. Hosts in it can talk only to promiscuous ports, never to each other. One isolated VLAN per primary.</dd>
<dt>Community VLAN</dt><dd>A secondary VLAN. Hosts in the same community talk to each other and to promiscuous ports, but not to other communities or isolated hosts.</dd>
<dt>Promiscuous port</dt><dd>Talks to every port in the primary and its secondaries. Normally the router, firewall or gateway.</dd>
<dt>Host port</dt><dd>An access port placed in an isolated or community VLAN.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Private VLAN communication rules">
<rect x="250" y="16" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">GW (promiscuous)</text><text x="320" y="52" text-anchor="middle" class="svg-muted" font-size="12">primary VLAN 100</text>
<rect x="30" y="170" width="120" height="44" rx="8" fill="#fed7aa"/><text x="90" y="190" text-anchor="middle" class="svg-ink" font-size="13">WEB1</text><text x="90" y="206" text-anchor="middle" class="svg-muted" font-size="12">isolated 101</text>
<rect x="170" y="170" width="120" height="44" rx="8" fill="#fed7aa"/><text x="230" y="190" text-anchor="middle" class="svg-ink" font-size="13">WEB2</text><text x="230" y="206" text-anchor="middle" class="svg-muted" font-size="12">isolated 101</text>
<rect x="350" y="170" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="410" y="190" text-anchor="middle" class="svg-ink" font-size="13">DB1</text><text x="410" y="206" text-anchor="middle" class="svg-muted" font-size="12">community 102</text>
<rect x="490" y="170" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="550" y="190" text-anchor="middle" class="svg-ink" font-size="13">DB2</text><text x="550" y="206" text-anchor="middle" class="svg-muted" font-size="12">community 102</text>
<line x1="300" y1="60" x2="90" y2="170" stroke="#64748b" stroke-width="2"/><line x1="310" y1="60" x2="230" y2="170" stroke="#64748b" stroke-width="2"/><line x1="330" y1="60" x2="410" y2="170" stroke="#64748b" stroke-width="2"/><line x1="340" y1="60" x2="550" y2="170" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="236" x2="170" y2="236" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="160" y="252" text-anchor="middle" class="svg-accent" font-size="12">blocked</text>
<line x1="470" y1="236" x2="490" y2="236" stroke="#64748b" stroke-width="2"/><text x="480" y="252" text-anchor="middle" class="svg-muted" font-size="12">allowed</text>
</svg><p class="cap">Isolated hosts reach only the gateway. Community members reach each other and the gateway. Everyone shares 198.51.100.0/24.</p></div>

<h3>Configuration walkthrough</h3>
<p>A DMZ uses 198.51.100.0/24. Web servers must be isolated; the two database servers form a community. On many Catalyst platforms VTP must be in transparent mode (or VTP version 3) before private VLANs can be created.</p>
<pre class="code"><span class="c">! 1. define the VLANs and associate them</span>
vtp mode transparent
vlan 101
 private-vlan isolated
vlan 102
 private-vlan community
vlan 100
 private-vlan primary
 private-vlan association 101,102
<span class="c">! 2. host ports</span>
interface range g1/0/1 - 2
 switchport mode private-vlan host
 switchport private-vlan host-association 100 101
interface range g1/0/3 - 4
 switchport mode private-vlan host
 switchport private-vlan host-association 100 102
<span class="c">! 3. promiscuous port toward the firewall or router</span>
interface g1/0/24
 switchport mode private-vlan promiscuous
 switchport private-vlan mapping 100 101,102
<span class="c">! or, if this switch routes: map the secondaries to the SVI</span>
interface vlan 100
 ip address 198.51.100.1 255.255.255.0
 private-vlan mapping 101,102</pre>
<pre class="out">DMZ-SW# show vlan private-vlan
Primary Secondary Type              Ports
------- --------- ----------------- ------------------------------------------
<span class="hl">100     101       isolated          Gi1/0/1, Gi1/0/2, Gi1/0/24</span>
<span class="hl">100     102       community         Gi1/0/3, Gi1/0/4, Gi1/0/24</span></pre>
<p>The promiscuous port Gi1/0/24 appears in both rows because it talks to both secondaries. If a host port is missing from the output, the association or host-association is wrong.</p>

<div class="note"><p><b>PVLAN edge (protected ports).</b> Smaller switches offer a light version: <code>switchport protected</code> on two ports stops them exchanging traffic with each other on that switch only. It does not work across switches and has no community concept, but it is a quick fix for, say, guest kiosks on one access switch.</p></div>

<div class="eg"><p><b>Worked example.</b> 40 DMZ servers in separate /29 subnets would consume 40 × 8 = 320 addresses, of which 40 × 3 = 120 are lost to network, broadcast and gateway addresses. The same 40 servers in one /26 inside an isolated PVLAN use 64 addresses with a single gateway, and still cannot reach each other.</p></div>

<div class="warn"><p><b>Common mistake.</b> PVLANs only isolate at Layer 2. An isolated host can still send a packet to its neighbour's IP address with the gateway's MAC as destination; if the gateway routes it back into the same subnet, the isolation is bypassed. Defenders close this with an ACL on the SVI or firewall that denies traffic from the subnet to the same subnet.</p></div>

<h3>Infrastructure hardening: the three planes</h3>
<p>Every network device does three jobs. Separating them helps you decide which control protects what:</p>
<table class="cmp"><tr><th>Plane</th><th>What it is</th><th>Controls (this module)</th><th>Controls (elsewhere)</th></tr>
<tr><td>Data plane</td><td>User traffic passing through the device</td><td>Port security, DAI, IP Source Guard, storm-control, PVLANs</td><td>ACLs, uRPF, firewalls</td></tr>
<tr><td>Control plane</td><td>Protocols the device uses to build its tables: STP, DHCP, ARP, routing</td><td>BPDU guard, root guard, DHCP snooping, DTP disabled, DHCP/ARP rate limits</td><td>Routing authentication, Control Plane Policing (CoPP)</td></tr>
<tr><td>Management plane</td><td>How admins and tools reach the device: SSH, SNMP, syslog, NTP</td><td>A dedicated management VLAN, unused ports shut</td><td>AAA, SSH only, SNMPv3, NTP authentication (next module)</td></tr></table>
<p>Notice how much of this module is really about protecting the <b>control plane</b>: a rogue BPDU, a rogue DHCP offer and a forged ARP reply all attack the protocols a switch uses to decide where traffic goes. <b>Control Plane Policing (CoPP)</b> adds a last line of defence by rate-limiting any traffic punted to the CPU, so even a flood that slips past the port controls cannot starve STP or routing. The next module, <b>sec-aaa-mgmt</b>, covers CoPP and the management plane in depth.</p>
<p>A short device-hardening baseline for any access switch: shut unused ports and park them in an unused VLAN, disable DTP everywhere, disable CDP/LLDP on user-facing ports, keep VTP in transparent mode or VTP version 3 with a password, and manage the switch only through a dedicated management VLAN.</p>

<div class="exam"><p><b>Exam trap.</b> "Isolate hosts in the same subnet" means private VLANs, not more VLANs or ACLs alone. Isolated hosts talk only to promiscuous ports; community hosts talk inside their community and to promiscuous ports. A primary VLAN can have many community VLANs but only one isolated VLAN.</p></div>

<div class="scn"><h4>The compromised web server that could not spread</h4><p>A hosting provider's monitoring flagged one DMZ web server making outbound connections to unknown addresses: it had been compromised through an unpatched plugin. The incident team's first fear was lateral movement to the 30 other customer servers in 198.51.100.0/24. The switch log and the firewall showed that every attempt to reach neighbouring servers had failed: the servers sat in an isolated private VLAN, and the firewall's inside ACL denied intra-subnet traffic that tried to hairpin through the gateway. Only the one server needed to be rebuilt.</p><p><b>Lesson:</b> private VLANs plus an intra-subnet deny on the gateway turn a flat DMZ into many small blast radii.</p></div>

<div class="iv"><p class="q">"How would you stop servers in the same subnet from attacking each other?"</p><p>Strong answer: use private VLANs. Put the servers in an isolated secondary VLAN (or communities for servers that must talk, like an app and its database), make the firewall or router port promiscuous, and verify with <code>show vlan private-vlan</code>. Then mention the limitation: PVLANs isolate at Layer 2 only, so add an ACL on the gateway that blocks the subnet from reaching itself. Mention protected ports as the single-switch alternative.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A private VLAN splits one VLAN and one subnet into isolated and community secondaries under a primary.</li>
<li>Isolated hosts reach only promiscuous ports; community hosts reach their community and promiscuous ports.</li>
<li>Verify with <code>show vlan private-vlan</code>; add a gateway ACL to stop hairpin bypass.</li>
<li>Data, control and management planes help place each control; most Layer 2 attacks target the control plane.</li>
<li>CoPP and the management plane are covered in depth in the next module.</li>
</ul></div>
`,hi:`
<p>Ek hotel ka corridor socho. Har guest ek hi corridor, ek hi floor number aur ek hi reception desk share karta hai, phir bhi koi guest doosre guest ke room mein nahi ja sakta. Sirf master key wala hotel staff har room tak pahunch sakta hai. Ek <b>private VLAN (PVLAN)</b> ek VLAN ke andar wahi corridor banata hai: saare hosts ek subnet aur ek gateway share karte hain, lekin Layer 2 par ek doosre se baat nahi kar sakte jab tak aap allow na karo. Is chapter ke doosre hisse mein hum access port se peeche hat kar poore device ko <b>data, control aur management planes</b> ke nazariye se dekhte hain, taaki aap is module ke har control ko infrastructure hardening ki badi picture mein sahi jagah rakh sako.</p>

<h3>Normal VLANs kaafi kyun nahi hain</h3>
<p>Chapter 2 ne dikhaya ki VLAN hosts ke groups ko alag karta hai. Lekin ek VLAN ke andar har host har doosre host tak seedha pahunch sakta hai. DMZ mein agar ek web server compromise ho jaaye to woh firewall se guzre bina apne bagal ke servers ko scan aur attack kar sakta hai. Aap har server ko apna VLAN aur subnet de sakte ho, lekin 40 servers ka matlab 40 subnets, 40 gateways aur bahut saare waste addresses. Private VLAN <b>ek subnet</b> rakhta hai aur phir bhi host-to-host traffic block karta hai.</p>

<h3>Private VLAN ke building blocks</h3>
<dl class="terms">
<dt>Primary VLAN</dt><dd>"Parent" VLAN. Yeh promiscuous port (gateway) se saare hosts tak traffic le jaata hai.</dd>
<dt>Isolated VLAN</dt><dd>Ek secondary VLAN. Isme hosts sirf promiscuous ports se baat kar sakte hain, ek doosre se kabhi nahi. Har primary ke liye ek isolated VLAN.</dd>
<dt>Community VLAN</dt><dd>Ek secondary VLAN. Ek hi community ke hosts ek doosre se aur promiscuous ports se baat karte hain, lekin doosri communities ya isolated hosts se nahi.</dd>
<dt>Promiscuous port</dt><dd>Primary aur uske saare secondaries ke har port se baat karta hai. Aam taur par router, firewall ya gateway.</dd>
<dt>Host port</dt><dd>Ek access port jo isolated ya community VLAN mein rakha gaya ho.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Private VLAN communication ke rules">
<rect x="250" y="16" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">GW (promiscuous)</text><text x="320" y="52" text-anchor="middle" class="svg-muted" font-size="12">primary VLAN 100</text>
<rect x="30" y="170" width="120" height="44" rx="8" fill="#fed7aa"/><text x="90" y="190" text-anchor="middle" class="svg-ink" font-size="13">WEB1</text><text x="90" y="206" text-anchor="middle" class="svg-muted" font-size="12">isolated 101</text>
<rect x="170" y="170" width="120" height="44" rx="8" fill="#fed7aa"/><text x="230" y="190" text-anchor="middle" class="svg-ink" font-size="13">WEB2</text><text x="230" y="206" text-anchor="middle" class="svg-muted" font-size="12">isolated 101</text>
<rect x="350" y="170" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="410" y="190" text-anchor="middle" class="svg-ink" font-size="13">DB1</text><text x="410" y="206" text-anchor="middle" class="svg-muted" font-size="12">community 102</text>
<rect x="490" y="170" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="550" y="190" text-anchor="middle" class="svg-ink" font-size="13">DB2</text><text x="550" y="206" text-anchor="middle" class="svg-muted" font-size="12">community 102</text>
<line x1="300" y1="60" x2="90" y2="170" stroke="#64748b" stroke-width="2"/><line x1="310" y1="60" x2="230" y2="170" stroke="#64748b" stroke-width="2"/><line x1="330" y1="60" x2="410" y2="170" stroke="#64748b" stroke-width="2"/><line x1="340" y1="60" x2="550" y2="170" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="236" x2="170" y2="236" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="160" y="252" text-anchor="middle" class="svg-accent" font-size="12">blocked</text>
<line x1="470" y1="236" x2="490" y2="236" stroke="#64748b" stroke-width="2"/><text x="480" y="252" text-anchor="middle" class="svg-muted" font-size="12">allowed</text>
</svg><p class="cap">Isolated hosts sirf gateway tak pahunchte hain. Community members ek doosre tak aur gateway tak pahunchte hain. Sab 198.51.100.0/24 share karte hain.</p></div>

<h3>Configuration walkthrough</h3>
<p>Ek DMZ 198.51.100.0/24 use karta hai. Web servers isolated hone chahiye; do database servers ek community banate hain. Kai Catalyst platforms par private VLANs banane se pehle VTP ko transparent mode (ya VTP version 3) mein hona zaroori hai.</p>
<pre class="code"><span class="c">! 1. VLANs define karo aur associate karo</span>
vtp mode transparent
vlan 101
 private-vlan isolated
vlan 102
 private-vlan community
vlan 100
 private-vlan primary
 private-vlan association 101,102
<span class="c">! 2. host ports</span>
interface range g1/0/1 - 2
 switchport mode private-vlan host
 switchport private-vlan host-association 100 101
interface range g1/0/3 - 4
 switchport mode private-vlan host
 switchport private-vlan host-association 100 102
<span class="c">! 3. firewall ya router ki taraf promiscuous port</span>
interface g1/0/24
 switchport mode private-vlan promiscuous
 switchport private-vlan mapping 100 101,102
<span class="c">! ya, agar yeh switch route karta hai: secondaries ko SVI par map karo</span>
interface vlan 100
 ip address 198.51.100.1 255.255.255.0
 private-vlan mapping 101,102</pre>
<pre class="out">DMZ-SW# show vlan private-vlan
Primary Secondary Type              Ports
------- --------- ----------------- ------------------------------------------
<span class="hl">100     101       isolated          Gi1/0/1, Gi1/0/2, Gi1/0/24</span>
<span class="hl">100     102       community         Gi1/0/3, Gi1/0/4, Gi1/0/24</span></pre>
<p>Promiscuous port Gi1/0/24 dono rows mein dikhta hai kyunki woh dono secondaries se baat karta hai. Agar koi host port output mein missing hai, to association ya host-association galat hai.</p>

<div class="note"><p><b>PVLAN edge (protected ports).</b> Chhote switches ek light version dete hain: do ports par <code>switchport protected</code> unhe sirf usi switch par ek doosre se traffic exchange karne se rokta hai. Yeh switches ke across kaam nahi karta aur isme community ka concept nahi hai, lekin ek access switch par guest kiosks jaisi cheezon ke liye yeh jaldi ka fix hai.</p></div>

<div class="eg"><p><b>Worked example.</b> 40 DMZ servers alag-alag /29 subnets mein 40 × 8 = 320 addresses khaayenge, jinme se 40 × 3 = 120 network, broadcast aur gateway addresses mein chale jaate hain. Wahi 40 servers ek isolated PVLAN ke andar ek /26 mein sirf 64 addresses aur ek gateway use karte hain, aur phir bhi ek doosre tak nahi pahunch sakte.</p></div>

<div class="warn"><p><b>Common galti.</b> PVLANs sirf Layer 2 par isolate karte hain. Ek isolated host abhi bhi apne padosi ke IP par packet bhej sakta hai jisme destination MAC gateway ka ho; agar gateway use wapas usi subnet mein route kar de, to isolation bypass ho jaata hai. Defenders ise SVI ya firewall par ek ACL se band karte hain jo subnet se usi subnet ki traffic deny kare.</p></div>

<h3>Infrastructure hardening: teen planes</h3>
<p>Har network device teen kaam karta hai. Inhe alag karke sochne se aap decide kar paate ho ki kaunsa control kisko protect karta hai:</p>
<table class="cmp"><tr><th>Plane</th><th>Yeh kya hai</th><th>Controls (is module mein)</th><th>Controls (kahin aur)</th></tr>
<tr><td>Data plane</td><td>Device se guzarne wala user traffic</td><td>Port security, DAI, IP Source Guard, storm-control, PVLANs</td><td>ACLs, uRPF, firewalls</td></tr>
<tr><td>Control plane</td><td>Woh protocols jinse device apni tables banata hai: STP, DHCP, ARP, routing</td><td>BPDU guard, root guard, DHCP snooping, DTP disabled, DHCP/ARP rate limits</td><td>Routing authentication, Control Plane Policing (CoPP)</td></tr>
<tr><td>Management plane</td><td>Admins aur tools device tak kaise pahunchte hain: SSH, SNMP, syslog, NTP</td><td>Dedicated management VLAN, unused ports shut</td><td>AAA, sirf SSH, SNMPv3, NTP authentication (agla module)</td></tr></table>
<p>Dhyaan do ki is module ka kitna hissa asal mein <b>control plane</b> ko protect karne ke baare mein hai: rogue BPDU, rogue DHCP offer aur forged ARP reply, teeno un protocols par attack karte hain jinse switch decide karta hai ki traffic kahan jaaye. <b>Control Plane Policing (CoPP)</b> defence ki aakhri line jodta hai: CPU tak punt hone wale kisi bhi traffic ko rate-limit karke, taaki port controls se bach nikla flood bhi STP ya routing ko starve na kar sake. Agla module, <b>sec-aaa-mgmt</b>, CoPP aur management plane ko gehraai se cover karta hai.</p>
<p>Kisi bhi access switch ke liye ek chhota device-hardening baseline: unused ports shut karo aur unhe ek unused VLAN mein park karo, har jagah DTP band karo, user-facing ports par CDP/LLDP band karo, VTP ko transparent mode ya password ke saath VTP version 3 mein rakho, aur switch ko sirf dedicated management VLAN se manage karo.</p>

<div class="exam"><p><b>Exam trap.</b> "Ek hi subnet ke hosts ko isolate karo" ka matlab private VLANs hai, na ki aur VLANs ya sirf ACLs. Isolated hosts sirf promiscuous ports se baat karte hain; community hosts apni community ke andar aur promiscuous ports se baat karte hain. Ek primary VLAN ke kai community VLANs ho sakte hain lekin sirf ek isolated VLAN.</p></div>

<div class="scn"><h4>Compromised web server jo phail nahi paaya</h4><p>Ek hosting provider ki monitoring ne ek DMZ web server ko flag kiya jo unknown addresses par outbound connections bana raha tha: woh ek unpatched plugin ke through compromise hua tha. Incident team ka pehla darr tha lateral movement, yani 198.51.100.0/24 ke 30 doosre customer servers tak phailna. Switch log aur firewall ne dikhaya ki padosi servers tak pahunchne ki har koshish fail hui thi: servers ek isolated private VLAN mein the, aur firewall ka inside ACL gateway se hairpin karne waali intra-subnet traffic ko deny karta tha. Sirf us ek server ko rebuild karna pada.</p><p><b>Seekh:</b> private VLANs aur gateway par intra-subnet deny milkar ek flat DMZ ko kai chhote blast radii mein badal dete hain.</p></div>

<div class="iv"><p class="q">"Ek hi subnet ke servers ko ek doosre par attack karne se aap kaise rokoge?"</p><p>Strong answer: private VLANs use karo. Servers ko isolated secondary VLAN mein rakho (ya jin servers ko baat karni hai, jaise app aur uska database, unke liye communities), firewall ya router port ko promiscuous banao, aur <code>show vlan private-vlan</code> se verify karo. Phir limitation batao: PVLANs sirf Layer 2 par isolate karte hain, isliye gateway par ek ACL jodo jo subnet ko khud tak pahunchne se roke. Single-switch alternative ke roop mein protected ports bhi batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Private VLAN ek VLAN aur ek subnet ko ek primary ke neeche isolated aur community secondaries mein baant deta hai.</li>
<li>Isolated hosts sirf promiscuous ports tak pahunchte hain; community hosts apni community aur promiscuous ports tak.</li>
<li><code>show vlan private-vlan</code> se verify karo; hairpin bypass rokne ke liye gateway ACL jodo.</li>
<li>Data, control aur management planes har control ko sahi jagah rakhne mein madad karte hain; zyada tar Layer 2 attacks control plane ko target karte hain.</li>
<li>CoPP aur management plane agle module mein gehraai se cover hain.</li>
</ul></div>
`}};export{e as default};