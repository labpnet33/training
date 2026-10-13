var e={id:`placement`,h:{en:`Firewall placement designs: perimeter, DMZ, internal and data center`,hi:`Firewall placement designs: perimeter, DMZ, internal aur data center`},body:{en:`
<p>Think of an airport. There is a fence and a check-in gate at the edge (the <b>perimeter</b>). There is a public arrivals hall that anyone may enter but that leads nowhere important (the <b>DMZ</b>). Inside, security gates separate the terminals, the staff areas and the baggage hall (<b>internal segmentation</b>). And the cargo vault has its own guards, built for heavy traffic (the <b>data center</b>). A firewall is only as useful as where you put it. This chapter is about placement: which design fits which problem.</p>

<h3>Two directions of traffic</h3>
<p><b>North-south</b> traffic crosses the boundary of your network: users to the internet, customers to your website. <b>East-west</b> traffic stays inside: a laptop to a file server, a web server to a database. The classic perimeter firewall sees only north-south traffic. Attackers who get in (chapter 2: phishing, a vulnerable web server) move <b>east-west</b>, host to host. This is <b>lateral movement</b>, and the internal and data center designs below exist to stop it.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Firewall placement designs">
<rect x="250" y="10" width="140" height="36" rx="8" fill="#fed7aa"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="320" y1="46" x2="320" y2="70" stroke="#64748b"/>
<rect x="240" y="70" width="160" height="40" rx="8" fill="#bae6fd"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">Edge firewall</text>
<line x1="400" y1="90" x2="470" y2="90" stroke="#64748b"/>
<rect x="470" y="70" width="150" height="40" rx="8" fill="#fde68a"/><text x="545" y="95" text-anchor="middle" class="svg-ink" font-size="13">DMZ: web, mail</text>
<line x1="320" y1="110" x2="320" y2="135" stroke="#64748b"/>
<rect x="210" y="135" width="220" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="158" text-anchor="middle" class="svg-ink" font-size="13">Campus core</text>
<line x1="250" y1="171" x2="120" y2="200" stroke="#64748b"/>
<line x1="390" y1="171" x2="500" y2="200" stroke="#64748b"/>
<rect x="30" y="200" width="180" height="40" rx="8" fill="#e2e8f0"/><text x="120" y="225" text-anchor="middle" class="svg-ink" font-size="13">Users, cameras</text>
<rect x="420" y="200" width="100" height="40" rx="8" fill="#ddd6fe"/><text x="470" y="225" text-anchor="middle" class="svg-ink" font-size="12">Internal FW</text>
<line x1="520" y1="220" x2="540" y2="220" stroke="#64748b"/>
<rect x="540" y="200" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="585" y="225" text-anchor="middle" class="svg-ink" font-size="12">Data center</text>
<text x="40" y="90" class="svg-accent" font-size="12">north-south</text>
<text x="230" y="255" class="svg-accent" font-size="12">east-west</text>
</svg><p class="cap">One edge firewall with a DMZ leg handles north-south traffic; an internal firewall guards the data center from east-west traffic.</p></div>

<h3>Design 1: the perimeter (internet edge)</h3>
<p>The simplest design: one firewall between <code>inside</code> and <code>outside</code>. Users browse out, nothing comes in unless it is a reply (chapter 5). This is what every small office has, and it is where most people start. In production you deploy the edge as a <b>high-availability pair</b> (active/standby with stateful failover, covered in sec-asa-ha), because the edge firewall is a single point of failure for the whole company.</p>

<h3>Design 2: the DMZ, or screened subnet</h3>
<p>A <b>DMZ</b> (demilitarised zone), also called a <b>screened subnet</b>, holds the servers the internet must reach: the public website, the mail gateway, a reverse proxy, the VPN portal. Two ways to build it:</p>
<table class="cmp"><tr><th>Design</th><th>How</th><th>Trade-off</th></tr>
<tr><td><b>Three-legged</b></td><td>One firewall with three interfaces: outside, inside, dmz</td><td>Cheap and simple; one device (or one HA pair) to manage, but one policy mistake exposes both zones</td></tr>
<tr><td><b>Back-to-back</b></td><td>An outer firewall in front of the DMZ, an inner firewall between the DMZ and the inside</td><td>True defence in depth, often two different vendors; more cost and two policies to keep aligned</td></tr>
</table>
<p>Our lab ASA, NK-ASA, is a three-legged design: <code>outside</code> 203.0.113.2 (level 0), <code>inside</code> 10.0.1.0/24 (level 100) and <code>dmz</code> 10.0.2.0/24 (level 50) with the web server WEB at 10.0.2.10. The golden rules: the internet may reach only the published DMZ service; the DMZ may <b>not</b> start connections to the inside; the inside may manage the DMZ.</p>

<pre class="out">NK-ASA# show nameif
Interface                Name                     Security
GigabitEthernet0/0       outside                    0
GigabitEthernet0/1       inside                   100
<span class="hl">GigabitEthernet0/2       dmz                       50</span></pre>

<h3>Design 3: internal segmentation</h3>
<p>An <b>internal segmentation firewall</b> sits between groups of internal systems: users and servers, the payment (PCI) network and everything else, the camera and building-control (OT) network and the office. <b>Macro-segmentation</b> uses VLANs, firewall zones and VRFs so every path between groups crosses a policy point. A single ASA trunk can carry many segments:</p>
<pre class="code"><span class="c">! Servers and cameras as separate firewall interfaces on one trunk</span>
interface GigabitEthernet0/3.20
 vlan 20
 nameif servers
 security-level 70
 ip address 10.0.20.1 255.255.255.0
interface GigabitEthernet0/3.30
 vlan 30
 nameif cameras
 security-level 20
 ip address 10.0.30.1 255.255.255.0</pre>
<p><b>Micro-segmentation</b> goes further: policy per workload or application tier, by tag or group instead of IP address. Cisco examples: <b>TrustSec</b> Security Group Tags (assigned by ISE, enforced with SGACLs), <b>ACI</b> endpoint groups with contracts, <b>Secure Workload</b> host-based policy, and in the cloud, security groups per instance. It is a building block of zero trust, which sec-concepts covers.</p>

<h3>Design 4: the data center and cloud</h3>
<p>Data center firewalls see huge east-west volumes: server to server, app to database, backup streams. Design priorities change: throughput, low latency and scale. Common patterns:</p>
<ul>
<li><b>Clustering</b> several firewalls into one logical device for throughput (preview of sec-asa-ha).</li>
<li><b>Transparent mode</b> (chapter 7) to insert a firewall between the server VLAN and its gateway without re-addressing.</li>
<li><b>Service insertion</b> in a fabric (for example an ACI service graph) so only selected flows are redirected through the firewall.</li>
<li><b>Virtual firewalls</b> (ASA Virtual, Threat Defense Virtual) in private and public clouds, plus the cloud's native security groups, for <b>hybrid</b> designs where the same policy follows the workload.</li>
</ul>

<div class="eg"><p><b>Worked example: choosing a placement.</b> A 300-person company has: a public website, 250 users, a PCI payment server, 40 IP cameras, and a small server room. Design: an edge HA pair with a three-legged DMZ for the website; users, cameras and servers as separate firewall interfaces (cameras at a low level, no access to users); the PCI server in its own segment reachable only from the checkout application on TCP 8443; logging from every boundary. Result: the website breach, the camera breach or the phished laptop each stays in its own compartment, and the PCI audit covers one small segment instead of the whole network.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Putting a public server on the inside network and "protecting" it with NAT. Creating twenty VLANs but routing them all on the core switch with no ACLs, which is addressing, not segmentation. Allowing "dmz to inside any" for convenience, which makes the DMZ pointless.</p></div>

<div class="exam"><p><b>Exam traps.</b> A perimeter firewall controls <b>north-south</b>; containing ransomware spread or reducing PCI scope expects <b>segmentation</b> (east-west). "Screened subnet" means DMZ. Back-to-back DMZ with different vendors is the defence-in-depth answer; three-legged is the cost-effective answer.</p></div>

<div class="scn"><h4>Ransomware that stopped at the door</h4><p>A logistics firm suffered a ransomware infection through a phished laptop in the sales VLAN. The malware scanned for SMB (TCP 445) on every reachable subnet. Two years earlier the firm had moved its servers behind an internal firewall that allowed only application ports from user VLANs, and used TrustSec tags so user devices could not reach each other's file shares. The infection encrypted one laptop and one sales share; the warehouse systems and ERP database were untouched. The internal firewall's deny logs for TCP 445 told the SOC exactly which host was patient zero.</p><p><b>Lesson:</b> placement turns a company-wide incident into a local one, and the logs at each boundary tell the story.</p></div>

<div class="iv"><p class="q">"Where would you place firewalls in a new office with a public website and a server room?"</p><p>Walk the traffic directions. North-south: an HA edge firewall with a DMZ (three-legged, or back-to-back for higher assurance) holding only the public services. East-west: internal segmentation between users, servers, cameras and any PCI systems, with micro-segmentation for critical tiers. Mention logging at every boundary and that the DMZ may never initiate to the inside.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>North-south crosses the perimeter; east-west stays inside and carries lateral movement.</li>
<li>Perimeter: inside/outside edge, deployed as an HA pair.</li>
<li>DMZ (screened subnet): three-legged or back-to-back; the DMZ never initiates to the inside.</li>
<li>Internal segmentation: macro with VLANs, zones and VRFs; micro by tag or group (TrustSec, ACI, Secure Workload).</li>
<li>Data center and cloud: clustering, transparent insertion, service insertion and virtual firewalls for hybrid designs.</li>
</ul></div>
`,hi:`
<p>Ek airport ke baare mein socho. Edge par fence aur check-in gate hai (<b>perimeter</b>). Ek public arrivals hall hai jismein koi bhi aa sakta hai lekin woh kisi important jagah nahi le jaata (<b>DMZ</b>). Andar, security gates terminals, staff areas aur baggage hall ko alag karte hain (<b>internal segmentation</b>). Aur cargo vault ke apne guards hain, heavy traffic ke liye bane (<b>data center</b>). Firewall utna hi kaam ka hai jitna sahi jagah par woh rakha gaya hai. Yeh chapter placement ke baare mein hai: kaunsa design kis problem ke liye fit hai.</p>

<h3>Traffic ki do directions</h3>
<p><b>North-south</b> traffic aapke network ki boundary cross karta hai: users se internet, customers se aapki website. <b>East-west</b> traffic andar hi rehta hai: laptop se file server, web server se database. Classic perimeter firewall sirf north-south traffic dekhta hai. Jo attackers andar aa jaate hain (chapter 2: phishing, vulnerable web server) woh <b>east-west</b>, host se host move karte hain. Yeh <b>lateral movement</b> hai, aur neeche ke internal aur data center designs ise rokne ke liye hi hain.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Firewall placement designs">
<rect x="250" y="10" width="140" height="36" rx="8" fill="#fed7aa"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="320" y1="46" x2="320" y2="70" stroke="#64748b"/>
<rect x="240" y="70" width="160" height="40" rx="8" fill="#bae6fd"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">Edge firewall</text>
<line x1="400" y1="90" x2="470" y2="90" stroke="#64748b"/>
<rect x="470" y="70" width="150" height="40" rx="8" fill="#fde68a"/><text x="545" y="95" text-anchor="middle" class="svg-ink" font-size="13">DMZ: web, mail</text>
<line x1="320" y1="110" x2="320" y2="135" stroke="#64748b"/>
<rect x="210" y="135" width="220" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="158" text-anchor="middle" class="svg-ink" font-size="13">Campus core</text>
<line x1="250" y1="171" x2="120" y2="200" stroke="#64748b"/>
<line x1="390" y1="171" x2="500" y2="200" stroke="#64748b"/>
<rect x="30" y="200" width="180" height="40" rx="8" fill="#e2e8f0"/><text x="120" y="225" text-anchor="middle" class="svg-ink" font-size="13">Users, cameras</text>
<rect x="420" y="200" width="100" height="40" rx="8" fill="#ddd6fe"/><text x="470" y="225" text-anchor="middle" class="svg-ink" font-size="12">Internal FW</text>
<line x1="520" y1="220" x2="540" y2="220" stroke="#64748b"/>
<rect x="540" y="200" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="585" y="225" text-anchor="middle" class="svg-ink" font-size="12">Data center</text>
<text x="40" y="90" class="svg-accent" font-size="12">north-south</text>
<text x="230" y="255" class="svg-accent" font-size="12">east-west</text>
</svg><p class="cap">DMZ leg wala ek edge firewall north-south traffic handle karta hai; ek internal firewall data center ko east-west traffic se bachata hai.</p></div>

<h3>Design 1: perimeter (internet edge)</h3>
<p>Sabse simple design: <code>inside</code> aur <code>outside</code> ke beech ek firewall. Users bahar browse karte hain, andar kuch nahi aata jab tak woh reply na ho (chapter 5). Har chhote office mein yahi hota hai, aur zyadatar log yahin se shuru karte hain. Production mein edge ko <b>high-availability pair</b> ki tarah deploy karte ho (stateful failover ke saath active/standby, sec-asa-ha mein cover hai), kyunki edge firewall poori company ke liye single point of failure hai.</p>

<h3>Design 2: DMZ, yaani screened subnet</h3>
<p><b>DMZ</b> (demilitarised zone), jise <b>screened subnet</b> bhi kehte hain, un servers ko rakhta hai jin tak internet ko pahunchna hai: public website, mail gateway, reverse proxy, VPN portal. Ise banane ke do tareeke:</p>
<table class="cmp"><tr><th>Design</th><th>Kaise</th><th>Trade-off</th></tr>
<tr><td><b>Three-legged</b></td><td>Teen interfaces wala ek firewall: outside, inside, dmz</td><td>Sasta aur simple; manage karne ke liye ek device (ya ek HA pair), lekin ek policy galti dono zones expose kar deti hai</td></tr>
<tr><td><b>Back-to-back</b></td><td>DMZ ke aage ek outer firewall, DMZ aur inside ke beech ek inner firewall</td><td>Asli defence in depth, aksar do alag vendors; zyada cost aur do policies align rakhni padti hain</td></tr>
</table>
<p>Hamara lab ASA, NK-ASA, three-legged design hai: <code>outside</code> 203.0.113.2 (level 0), <code>inside</code> 10.0.1.0/24 (level 100) aur <code>dmz</code> 10.0.2.0/24 (level 50), jismein web server WEB 10.0.2.10 par hai. Golden rules: internet sirf published DMZ service tak pahunch sakta hai; DMZ inside ki taraf connections shuru <b>nahi</b> kar sakta; inside DMZ ko manage kar sakta hai.</p>

<pre class="out">NK-ASA# show nameif
Interface                Name                     Security
GigabitEthernet0/0       outside                    0
GigabitEthernet0/1       inside                   100
<span class="hl">GigabitEthernet0/2       dmz                       50</span></pre>

<h3>Design 3: internal segmentation</h3>
<p><b>Internal segmentation firewall</b> internal systems ke groups ke beech baithta hai: users aur servers, payment (PCI) network aur baaki sab, camera aur building-control (OT) network aur office. <b>Macro-segmentation</b> VLANs, firewall zones aur VRFs use karta hai taaki groups ke beech har raasta ek policy point se guzre. Ek ASA trunk kai segments le ja sakta hai:</p>
<pre class="code"><span class="c">! Ek trunk par servers aur cameras alag firewall interfaces ki tarah</span>
interface GigabitEthernet0/3.20
 vlan 20
 nameif servers
 security-level 70
 ip address 10.0.20.1 255.255.255.0
interface GigabitEthernet0/3.30
 vlan 30
 nameif cameras
 security-level 20
 ip address 10.0.30.1 255.255.255.0</pre>
<p><b>Micro-segmentation</b> aur aage jaata hai: har workload ya application tier ki policy, IP address ki jagah tag ya group se. Cisco examples: <b>TrustSec</b> Security Group Tags (ISE assign karta hai, SGACLs se enforce), contracts ke saath <b>ACI</b> endpoint groups, <b>Secure Workload</b> host-based policy, aur cloud mein har instance ke security groups. Yeh zero trust ka building block hai, jo sec-concepts cover karta hai.</p>

<h3>Design 4: data center aur cloud</h3>
<p>Data center firewalls bahut bada east-west volume dekhte hain: server se server, app se database, backup streams. Design priorities badal jaati hain: throughput, kam latency aur scale. Common patterns:</p>
<ul>
<li>Throughput ke liye kai firewalls ko ek logical device mein <b>clustering</b> (sec-asa-ha ka preview).</li>
<li><b>Transparent mode</b> (chapter 7) taaki server VLAN aur uske gateway ke beech firewall bina re-addressing ke daala ja sake.</li>
<li>Fabric mein <b>service insertion</b> (jaise ACI service graph) taaki sirf chune hue flows firewall se redirect hon.</li>
<li>Private aur public clouds mein <b>virtual firewalls</b> (ASA Virtual, Threat Defense Virtual), plus cloud ke native security groups, <b>hybrid</b> designs ke liye jahan same policy workload ke saath chalti hai.</li>
</ul>

<div class="eg"><p><b>Worked example: placement chunna.</b> Ek 300 logon ki company ke paas hai: public website, 250 users, ek PCI payment server, 40 IP cameras, aur ek chhota server room. Design: website ke liye three-legged DMZ ke saath edge HA pair; users, cameras aur servers alag firewall interfaces ki tarah (cameras low level par, users tak access nahi); PCI server apne segment mein jo sirf checkout application se TCP 8443 par reachable hai; har boundary se logging. Result: website breach, camera breach ya phish hua laptop, har ek apne compartment mein reh jaata hai, aur PCI audit poore network ki jagah ek chhote segment ko cover karta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Public server ko inside network par rakhna aur NAT se "protect" karna. Bees VLANs banana lekin sabko core switch par bina ACLs ke route karna, jo addressing hai, segmentation nahi. Suvidha ke liye "dmz to inside any" allow karna, jo DMZ ko bekaar bana deta hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Perimeter firewall <b>north-south</b> control karta hai; ransomware ka failaav rokna ya PCI scope kam karna <b>segmentation</b> (east-west) expect karta hai. "Screened subnet" ka matlab DMZ. Alag vendors ke saath back-to-back DMZ defence-in-depth wala jawab hai; three-legged cost-effective wala jawab hai.</p></div>

<div class="scn"><h4>Ransomware jo darwaze par ruk gaya</h4><p>Ek logistics firm par sales VLAN ke ek phish hue laptop ke through ransomware infection hua. Malware ne har pahunch wale subnet par SMB (TCP 445) scan kiya. Do saal pehle firm ne apne servers ko ek internal firewall ke peeche rakha tha jo user VLANs se sirf application ports allow karta tha, aur TrustSec tags use kiye the taaki user devices ek doosre ke file shares tak na pahunch sakein. Infection ne ek laptop aur ek sales share encrypt kiya; warehouse systems aur ERP database achhoote rahe. TCP 445 ke liye internal firewall ke deny logs ne SOC ko exactly bataya ki patient zero kaunsa host tha.</p><p><b>Seekh:</b> placement company-wide incident ko local bana deta hai, aur har boundary ke logs kahani batate hain.</p></div>

<div class="iv"><p class="q">"Public website aur server room wale naye office mein aap firewalls kahan rakhoge?"</p><p>Traffic directions se chalo. North-south: DMZ ke saath HA edge firewall (three-legged, ya zyada assurance ke liye back-to-back) jismein sirf public services hon. East-west: users, servers, cameras aur kisi bhi PCI systems ke beech internal segmentation, critical tiers ke liye micro-segmentation ke saath. Har boundary par logging mention karo aur yeh ki DMZ kabhi inside ki taraf initiate nahi kar sakta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>North-south perimeter cross karta hai; east-west andar rehta hai aur lateral movement le jaata hai.</li>
<li>Perimeter: inside/outside edge, HA pair ki tarah deploy.</li>
<li>DMZ (screened subnet): three-legged ya back-to-back; DMZ kabhi inside ki taraf initiate nahi karta.</li>
<li>Internal segmentation: VLANs, zones aur VRFs se macro; tag ya group se micro (TrustSec, ACI, Secure Workload).</li>
<li>Data center aur cloud: clustering, transparent insertion, service insertion aur hybrid designs ke liye virtual firewalls.</li>
</ul></div>
`}};export{e as default};