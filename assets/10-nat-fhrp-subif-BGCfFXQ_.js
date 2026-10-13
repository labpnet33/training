var e={id:`nat-fhrp-subif`,h:{en:`Around the router: NAT/PAT, FHRP, virtual IPs and subinterfaces`,hi:`Router ke aas-paas: NAT/PAT, FHRP, virtual IPs aur subinterfaces`},body:{en:`
<p>Objective 2.1 also lists four technologies that live on or around routers: <b>address translation (NAT and PAT)</b>, <b>first hop redundancy protocols (FHRP)</b>, <b>virtual IPs (VIP)</b> and <b>subinterfaces</b>. None of them chooses paths, but each changes how packets enter, leave or are addressed on a router. This chapter gives you the concepts; the services module configures PAT hands-on.</p>

<h3>Address translation: NAT and PAT</h3>
<p>Analogy: a company reception desk. Outsiders only know the company's main phone number. When an employee calls out, the caller ID shows the main number; when the reply comes back, the receptionist remembers who made the call and forwards it to the right extension. <b>Network address translation (NAT)</b> does this with IP addresses: it rewrites private inside addresses (RFC 1918: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) into public addresses at the edge and reverses the change on replies.</p>
<dl class="terms">
<dt>Static NAT</dt><dd>One inside address always maps to one public address (1:1). Used to publish an internal server.</dd>
<dt>Dynamic NAT</dt><dd>Inside addresses borrow public addresses from a pool, one at a time, first come first served.</dd>
<dt>PAT (NAT overload)</dt><dd>Many inside hosts share <b>one</b> public address; the router tells conversations apart by <b>source port</b>. This is what every home router and most offices use.</dd>
<dt>Inside local / inside global</dt><dd>The host's private address, and the public address that represents it outside.</dd>
<dt>Outside global / outside local</dt><dd>The remote host's real address, and how it appears from inside (usually the same).</dd>
</dl>
<pre class="out">HQ#show ip nat translations
Pro  Inside global         Inside local        Outside local       Outside global
tcp  203.0.113.2:51514     10.1.1.10:51514     8.8.8.8:443         8.8.8.8:443
<span class="hl">tcp  203.0.113.2:1024      10.2.2.10:51514     8.8.8.8:443         8.8.8.8:443</span></pre>
<p>Two hosts used the same source port, so PAT changed the second one to 1024. Both share the single public address 203.0.113.2. In Lab 1 the ISP routed private 10.x space back to HQ; a real ISP would not, and this PAT on HQ Gi0/2 is what you would add.</p>

<div class="warn"><p><b>Common mistake.</b> Treating NAT as a routing protocol or a firewall. NAT only rewrites addresses; the router still needs a route (usually a default route) to send the translated packet, and a route back for the reply. It hides internal addressing, but it is not a security control on its own.</p></div>

<h3>First hop redundancy protocols (FHRP) and virtual IPs</h3>
<p>Every host has exactly one default gateway. If that router fails, the hosts are stranded even when a second router is standing right next to it, because nobody changes the gateway on hundreds of PCs. An <b>FHRP</b> lets two or more routers share a <b>virtual IP address (VIP)</b> and a <b>virtual MAC address</b>. Hosts use the VIP as their gateway; one router actively answers for it, and if it fails another takes over within seconds, with no change on the hosts.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="FHRP with a virtual IP">
<rect x="120" y="20" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="200" y="42" text-anchor="middle" class="svg-ink" font-size="13">R-A active</text><text x="200" y="60" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.2</text>
<rect x="360" y="20" width="160" height="50" rx="8" fill="#e2e8f0"/><text x="440" y="42" text-anchor="middle" class="svg-ink" font-size="13">R-B standby</text><text x="440" y="60" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.3</text>
<rect x="220" y="100" width="200" height="40" rx="8" fill="#fde68a"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="13">VIP 10.1.1.1</text>
<line x1="200" y1="70" x2="280" y2="100" stroke="#64748b" stroke-width="2"/><line x1="440" y1="70" x2="360" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<rect x="120" y="170" width="120" height="36" rx="6" fill="#bae6fd"/><text x="180" y="193" text-anchor="middle" class="svg-ink" font-size="12">PC gw 10.1.1.1</text>
<rect x="400" y="170" width="120" height="36" rx="6" fill="#bae6fd"/><text x="460" y="193" text-anchor="middle" class="svg-ink" font-size="12">PC gw 10.1.1.1</text>
<line x1="180" y1="170" x2="300" y2="140" stroke="#64748b"/><line x1="460" y1="170" x2="340" y2="140" stroke="#64748b"/>
</svg><p class="cap">Hosts point at the VIP. The active router owns it; the standby takes over if the active fails.</p></div>

<table class="cmp"><tr><th>Protocol</th><th>Standard</th><th>Roles</th><th>Notes</th></tr>
<tr><td><b>HSRP</b></td><td>Cisco</td><td>Active / standby</td><td>Default priority 100, higher wins; pre-emption off by default; virtual MAC 0000.0c07.acXX (v1)</td></tr>
<tr><td><b>VRRP</b></td><td>Open (RFC 5798)</td><td>Master / backup</td><td>Pre-emption on by default; VIP may be a real interface address; virtual MAC 0000.5e00.01XX</td></tr>
<tr><td><b>GLBP</b></td><td>Cisco</td><td>AVG / AVFs</td><td>Load-balances hosts across several routers using several virtual MACs</td></tr>
</table>
<p>The same <b>VIP</b> idea appears beyond routers: a load balancer publishes one VIP for a pool of web servers, and a firewall or server cluster moves a VIP between members during failover. Whenever you see "virtual IP", think "an address that is not tied to one physical box".</p>

<div class="eg"><p><b>Worked example.</b> HQ adds a second router. R-A has 10.1.1.2 with HSRP priority 110; R-B has 10.1.1.3 with priority 100; the VIP is 10.1.1.1. PC-HQ keeps gateway 10.1.1.1. R-A (higher priority) becomes active. If R-A loses power, R-B stops hearing its hellos (3 s by default) and after the hold time (10 s) becomes active, answering for 10.1.1.1 with the same virtual MAC, so PCs do not even need to re-ARP.</p></div>

<h3>Subinterfaces</h3>
<p>A <b>subinterface</b> is a logical interface carved out of one physical interface, each with its own IP address. The classic use is <b>router-on-a-stick</b>, which you met in the switching module: one router port connects to a switch trunk, and each VLAN gets a subinterface tagged with 802.1Q.</p>
<pre class="code">interface GigabitEthernet0/0
 no shutdown
interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 ip address 10.1.10.1 255.255.255.0
interface GigabitEthernet0/0.20
 encapsulation dot1Q 20
 ip address 10.1.20.1 255.255.255.0</pre>
<p>Each subinterface creates its own connected route, so the router routes between VLANs 10 and 20 over a single cable. Subinterfaces are also used on WAN hand-offs where a provider delivers several VLANs on one port, and on firewalls that protect several segments through one trunk.</p>

<div class="exam"><p><b>Exam trap.</b> The FHRP VIP is configured as the hosts' default gateway, not the routers' real addresses. For subinterfaces, the physical interface must be up (<code>no shutdown</code>) and the VLAN in <code>encapsulation dot1Q</code> must match the switch's VLAN; the subinterface number itself is only a label.</p></div>

<div class="scn"><h4>The gateway that failed over but nobody could browse</h4><p>A hospital wing had two routers running HSRP. During maintenance the active router was reloaded, the standby took over the VIP perfectly, and users could reach internal servers, but internet access died. The engineer found that PAT was configured only on the original active router; the standby had no NAT and no default route to the second ISP link. Adding the matching NAT and default route to the standby made the next failover invisible to users.</p><p><b>Lesson:</b> redundancy covers the whole path. A standby router must have the same routes and NAT as the active one.</p></div>

<div class="iv"><p class="q">"Why do we need an FHRP if we already have two routers?"</p><p>Strong answer: hosts have a single static default gateway and do not run routing protocols, so a second router is useless to them unless it can answer for the same address. FHRPs give the routers a shared virtual IP and MAC; one is active, the other takes over on failure. Name HSRP (Cisco), VRRP (open standard) and GLBP (Cisco, load balancing), and mention priority and pre-emption.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT rewrites addresses at the edge; PAT lets many private hosts share one public IP using ports.</li>
<li>Static NAT is 1:1, dynamic NAT uses a pool, PAT (overload) is many to one.</li>
<li>FHRPs (HSRP, VRRP, GLBP) give hosts a virtual gateway IP that survives a router failure.</li>
<li>A VIP is an address not tied to one device: FHRP gateways, load balancers, clusters.</li>
<li>Subinterfaces split one physical port into logical interfaces, one per VLAN with dot1Q tagging.</li>
</ul></div>
`,hi:`
<p>Objective 2.1 chaar aisi technologies bhi list karta hai jo routers par ya unke aas-paas rehti hain: <b>address translation (NAT aur PAT)</b>, <b>first hop redundancy protocols (FHRP)</b>, <b>virtual IPs (VIP)</b> aur <b>subinterfaces</b>. Inmein se koi paths nahi chunta, lekin har ek badalta hai ki packets router mein kaise aate hain, kaise nikalte hain ya kaise address hote hain. Yeh chapter aapko concepts deta hai; services module PAT ko hands-on configure karta hai.</p>

<h3>Address translation: NAT aur PAT</h3>
<p>Analogy: company ka reception desk. Baahar walon ko sirf company ka main phone number pata hai. Jab koi employee bahar call karta hai, caller ID mein main number dikhta hai; jab reply aata hai, receptionist yaad rakhti hai ki call kisne ki thi aur sahi extension par forward karti hai. <b>Network address translation (NAT)</b> yahi IP addresses ke saath karta hai: edge par private inside addresses (RFC 1918: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) ko public addresses mein rewrite karta hai aur replies par change ulta kar deta hai.</p>
<dl class="terms">
<dt>Static NAT</dt><dd>Ek inside address hamesha ek public address par map hota hai (1:1). Internal server publish karne ke liye use hota hai.</dd>
<dt>Dynamic NAT</dt><dd>Inside addresses ek pool se public addresses udhaar lete hain, ek baar mein ek, pehle aao pehle paao.</dd>
<dt>PAT (NAT overload)</dt><dd>Bahut saare inside hosts <b>ek</b> public address share karte hain; router conversations ko <b>source port</b> se alag pehchanta hai. Har home router aur zyada tar offices yahi use karte hain.</dd>
<dt>Inside local / inside global</dt><dd>Host ka private address, aur woh public address jo bahar use represent karta hai.</dd>
<dt>Outside global / outside local</dt><dd>Remote host ka asli address, aur woh andar se kaisa dikhta hai (aam taur par same).</dd>
</dl>
<pre class="out">HQ#show ip nat translations
Pro  Inside global         Inside local        Outside local       Outside global
tcp  203.0.113.2:51514     10.1.1.10:51514     8.8.8.8:443         8.8.8.8:443
<span class="hl">tcp  203.0.113.2:1024      10.2.2.10:51514     8.8.8.8:443         8.8.8.8:443</span></pre>
<p>Do hosts ne same source port use kiya, isliye PAT ne doosre ko 1024 kar diya. Dono single public address 203.0.113.2 share karte hain. Lab 1 mein ISP ne private 10.x space ko HQ ki taraf wapas route kiya; real ISP aisa nahi karega, aur HQ Gi0/2 par yahi PAT aap add karoge.</p>

<div class="warn"><p><b>Common galti.</b> NAT ko routing protocol ya firewall samajhna. NAT sirf addresses rewrite karta hai; translated packet bhejne ke liye router ko abhi bhi route chahiye (aam taur par default route), aur reply ke liye wapas route. Yeh internal addressing chhupata hai, lekin akele security control nahi hai.</p></div>

<h3>First hop redundancy protocols (FHRP) aur virtual IPs</h3>
<p>Har host ka exactly ek default gateway hota hai. Agar woh router fail ho jaaye, to hosts phans jaate hain chahe doosra router bilkul bagal mein khada ho, kyunki sainkdon PCs par koi gateway nahi badalta. <b>FHRP</b> do ya zyada routers ko ek <b>virtual IP address (VIP)</b> aur ek <b>virtual MAC address</b> share karne deta hai. Hosts VIP ko gateway ki tarah use karte hain; ek router actively uska jawab deta hai, aur agar woh fail ho to doosra seconds mein le leta hai, hosts par koi change nahi.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Virtual IP ke saath FHRP">
<rect x="120" y="20" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="200" y="42" text-anchor="middle" class="svg-ink" font-size="13">R-A active</text><text x="200" y="60" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.2</text>
<rect x="360" y="20" width="160" height="50" rx="8" fill="#e2e8f0"/><text x="440" y="42" text-anchor="middle" class="svg-ink" font-size="13">R-B standby</text><text x="440" y="60" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.3</text>
<rect x="220" y="100" width="200" height="40" rx="8" fill="#fde68a"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="13">VIP 10.1.1.1</text>
<line x1="200" y1="70" x2="280" y2="100" stroke="#64748b" stroke-width="2"/><line x1="440" y1="70" x2="360" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<rect x="120" y="170" width="120" height="36" rx="6" fill="#bae6fd"/><text x="180" y="193" text-anchor="middle" class="svg-ink" font-size="12">PC gw 10.1.1.1</text>
<rect x="400" y="170" width="120" height="36" rx="6" fill="#bae6fd"/><text x="460" y="193" text-anchor="middle" class="svg-ink" font-size="12">PC gw 10.1.1.1</text>
<line x1="180" y1="170" x2="300" y2="140" stroke="#64748b"/><line x1="460" y1="170" x2="340" y2="140" stroke="#64748b"/>
</svg><p class="cap">Hosts VIP ki taraf point karte hain. Active router uska maalik hai; active fail hone par standby le leta hai.</p></div>

<table class="cmp"><tr><th>Protocol</th><th>Standard</th><th>Roles</th><th>Notes</th></tr>
<tr><td><b>HSRP</b></td><td>Cisco</td><td>Active / standby</td><td>Default priority 100, zyada jeetta hai; pre-emption default mein off; virtual MAC 0000.0c07.acXX (v1)</td></tr>
<tr><td><b>VRRP</b></td><td>Open (RFC 5798)</td><td>Master / backup</td><td>Pre-emption default mein on; VIP real interface address ho sakta hai; virtual MAC 0000.5e00.01XX</td></tr>
<tr><td><b>GLBP</b></td><td>Cisco</td><td>AVG / AVFs</td><td>Kai virtual MACs use karke hosts ko kai routers par load-balance karta hai</td></tr>
</table>
<p>Yahi <b>VIP</b> idea routers ke aage bhi dikhta hai: load balancer web servers ke pool ke liye ek VIP publish karta hai, aur firewall ya server cluster failover ke dauraan VIP ko members ke beech move karta hai. Jab bhi "virtual IP" dekho, socho "aisa address jo ek physical box se bandha nahi hai".</p>

<div class="eg"><p><b>Worked example.</b> HQ ek doosra router add karta hai. R-A par 10.1.1.2 hai HSRP priority 110 ke saath; R-B par 10.1.1.3 hai priority 100 ke saath; VIP 10.1.1.1 hai. PC-HQ gateway 10.1.1.1 hi rakhta hai. R-A (zyada priority) active banta hai. Agar R-A ki power chali jaaye, R-B uske hellos sunna band kar deta hai (default 3 s) aur hold time (10 s) ke baad active ban jaata hai, same virtual MAC ke saath 10.1.1.1 ka jawab deta hai, isliye PCs ko dobara ARP bhi nahi karna padta.</p></div>

<h3>Subinterfaces</h3>
<p><b>Subinterface</b> ek physical interface se kaata gaya logical interface hai, har ek ka apna IP address. Classic use <b>router-on-a-stick</b> hai, jisse aap switching module mein mil chuke ho: ek router port switch trunk se judta hai, aur har VLAN ko 802.1Q tag wala ek subinterface milta hai.</p>
<pre class="code">interface GigabitEthernet0/0
 no shutdown
interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 ip address 10.1.10.1 255.255.255.0
interface GigabitEthernet0/0.20
 encapsulation dot1Q 20
 ip address 10.1.20.1 255.255.255.0</pre>
<p>Har subinterface apna connected route banata hai, isliye router ek hi cable par VLAN 10 aur 20 ke beech route karta hai. Subinterfaces WAN hand-offs par bhi use hote hain jahan provider ek port par kai VLANs deta hai, aur un firewalls par jo ek trunk ke through kai segments protect karte hain.</p>

<div class="exam"><p><b>Exam trap.</b> FHRP VIP hosts ke default gateway ki tarah configure hota hai, routers ke real addresses nahi. Subinterfaces ke liye physical interface up hona chahiye (<code>no shutdown</code>) aur <code>encapsulation dot1Q</code> ka VLAN switch ke VLAN se match hona chahiye; subinterface number khud sirf ek label hai.</p></div>

<div class="scn"><h4>Gateway fail over hua lekin koi browse nahi kar paaya</h4><p>Ek hospital wing mein do routers HSRP chala rahe the. Maintenance ke dauraan active router reload hua, standby ne VIP perfectly le liya, aur users internal servers tak pahunch paa rahe the, lekin internet access band ho gaya. Engineer ne dekha ki PAT sirf original active router par configure tha; standby par na NAT tha na doosre ISP link ki taraf default route. Standby par matching NAT aur default route add karne se agla failover users ke liye invisible ho gaya.</p><p><b>Seekh:</b> redundancy poore path ko cover karti hai. Standby router par active jaise hi routes aur NAT hone chahiye.</p></div>

<div class="iv"><p class="q">"Jab do routers pehle se hain to FHRP ki zaroorat kyun hai?"</p><p>Strong answer: hosts ka ek single static default gateway hota hai aur woh routing protocols nahi chalate, isliye doosra router unke kisi kaam ka nahi jab tak woh same address ka jawab na de sake. FHRPs routers ko shared virtual IP aur MAC dete hain; ek active hota hai, doosra failure par le leta hai. HSRP (Cisco), VRRP (open standard) aur GLBP (Cisco, load balancing) ka naam lo, aur priority aur pre-emption ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT edge par addresses rewrite karta hai; PAT ports use karke bahut saare private hosts ko ek public IP share karne deta hai.</li>
<li>Static NAT 1:1 hai, dynamic NAT pool use karta hai, PAT (overload) many to one hai.</li>
<li>FHRPs (HSRP, VRRP, GLBP) hosts ko virtual gateway IP dete hain jo router failure jhel leta hai.</li>
<li>VIP aisa address hai jo ek device se bandha nahi: FHRP gateways, load balancers, clusters.</li>
<li>Subinterfaces ek physical port ko logical interfaces mein baantte hain, har VLAN ke liye ek, dot1Q tagging ke saath.</li>
</ul></div>
`}};export{e as default};