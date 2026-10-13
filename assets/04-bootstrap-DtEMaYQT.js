var e={id:`bootstrap`,h:{en:`Bootstrapping the three controllers`,hi:`Teeno controllers ko bootstrap karna`},body:{en:`
<p>A newly installed controller is like a new employee on the first morning: it has a laptop but no name tag, no department and no idea where the other offices are. Bootstrapping gives it the minimum identity it needs to be reachable and to join the others. It is not the full configuration. It is the small block that lets the controller say who it is (host name, system IP, site ID, organization name), where the Validator is, and how to be reached (an address in VPN 0 with a tunnel interface, and a management address in VPN 512).</p>

<h3>The pieces of the bootstrap</h3>
<table class="cmp"><tr><th>Item</th><th>Where</th><th>Meaning</th></tr>
<tr><td>host-name</td><td>system</td><td>Name shown in prompts and in the Manager</td></tr>
<tr><td>system-ip</td><td>system</td><td>Permanent device identity, written like an IPv4 address; it does not have to be routable</td></tr>
<tr><td>site-id</td><td>system</td><td>Location number; controllers often share one site ID, edges use others</td></tr>
<tr><td>organization-name</td><td>system</td><td>Must be identical on every device of the fabric, including case</td></tr>
<tr><td>vbond</td><td>system</td><td>Address or DNS name of the Validator</td></tr>
<tr><td>VPN 0 interface</td><td>vpn 0</td><td>The transport address, default route and tunnel-interface</td></tr>
<tr><td>VPN 512</td><td>vpn 512</td><td>Optional out-of-band management interface</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Bootstrap blocks of a controller">
<rect x="20" y="15" width="290" height="150" rx="12" fill="#fde68a"/><text x="165" y="38" text-anchor="middle" class="svg-ink" font-size="14">system block (who am I)</text><text x="165" y="64" text-anchor="middle" class="svg-muted" font-size="11">host-name VMANAGE</text><text x="165" y="82" text-anchor="middle" class="svg-muted" font-size="11">system-ip 10.255.255.1</text><text x="165" y="100" text-anchor="middle" class="svg-muted" font-size="11">site-id 1</text><text x="165" y="118" text-anchor="middle" class="svg-muted" font-size="11">organization-name NK-LAB</text><text x="165" y="136" text-anchor="middle" class="svg-muted" font-size="11">vbond 198.51.100.30</text>
<rect x="330" y="15" width="290" height="70" rx="12" fill="#bae6fd"/><text x="475" y="38" text-anchor="middle" class="svg-ink" font-size="14">vpn 0 (how to reach me)</text><text x="475" y="60" text-anchor="middle" class="svg-muted" font-size="11">eth0 198.51.100.10/24, tunnel-interface</text><text x="475" y="76" text-anchor="middle" class="svg-muted" font-size="11">default route 198.51.100.1</text>
<rect x="330" y="95" width="290" height="70" rx="12" fill="#bbf7d0"/><text x="475" y="118" text-anchor="middle" class="svg-ink" font-size="14">vpn 512 (admin access)</text><text x="475" y="140" text-anchor="middle" class="svg-muted" font-size="11">out-of-band management address</text>
<rect x="20" y="180" width="600" height="40" rx="10" fill="#f1f5f9"/><text x="320" y="204" text-anchor="middle" class="svg-ink" font-size="12">Add: correct time (NTP) and name resolution, otherwise certificates and the vbond name fail.</text>
</svg><p class="cap">Three small blocks make a controller reachable and identified.</p></div>

<h3>Controller configuration</h3>
<p>On the controllers the CLI uses the original Viptela-style syntax. The three controllers share the same pattern. Only the host name, system IP, address and one extra keyword on the Validator differ.</p>
<pre class="code"><span class="c">! Reference configuration: Manager bootstrap (interface names depend on the VM)</span>
system
 host-name VMANAGE
 system-ip 10.255.255.1
 site-id 1
 organization-name NK-LAB
 vbond 198.51.100.30
 exit
vpn 0
 interface eth0
  ip address 198.51.100.10/24
  tunnel-interface
   allow-service all
   exit
  no shutdown
  exit
 ip route 0.0.0.0/0 198.51.100.1
 exit</pre>
<pre class="code"><span class="c">! Controller (VSMART): same pattern, new name, system IP and address</span>
system
 host-name VSMART
 system-ip 10.255.255.2
 site-id 1
 organization-name NK-LAB
 vbond 198.51.100.30
 exit
vpn 0
 interface eth0
  ip address 198.51.100.20/24
  tunnel-interface
   allow-service all
   exit
  no shutdown
  exit
 ip route 0.0.0.0/0 198.51.100.1
 exit</pre>
<pre class="code"><span class="c">! Validator (VBOND): the vbond line has local vbond-only</span>
system
 host-name VBOND
 system-ip 10.255.255.3
 site-id 1
 organization-name NK-LAB
 vbond 198.51.100.30 local vbond-only
 exit
vpn 0
 interface eth0
  ip address 198.51.100.30/24
  tunnel-interface
   encapsulation ipsec
   allow-service all
   exit
  no shutdown
  exit
 ip route 0.0.0.0/0 198.51.100.1
 exit</pre>
<p>Read the Validator carefully. The words <code>local</code> tell the device that the address belongs to itself, so it acts as the Validator. The words <code>vbond-only</code> make it run the Validator function and nothing else. On the Manager and the Controller the same <code>vbond</code> line simply points to the Validator's address, which can also be a DNS name that resolves to several Validator addresses.</p>

<h3>What each line does</h3>
<ul>
<li><b>system-ip</b> is the controller's identity inside OMP and the control connections. It is not an interface address and does not need a route, but you must keep it unique.</li>
<li><b>site-id</b> separates locations. Controllers usually share one site ID. Edges must never share a site ID with a different site unless they are in the same site on purpose.</li>
<li><b>organization-name</b> is checked during authentication. A single difference in spelling, case or space breaks the control connection.</li>
<li><b>tunnel-interface</b> in VPN 0 marks the interface that carries control connections. <code>allow-service all</code> is convenient in a lab; in production, allow only the services that are needed on the interface.</li>
<li>The default route in VPN 0 gives the controller a path to the edges and to the other controllers.</li>
</ul>

<h3>Checks after the bootstrap</h3>
<p>Before you move on to certificates, prove the basics: the interface is up, the default route exists, the gateway answers, the clock is right and the names resolve.</p>
<pre class="out">VBOND# show interface vpn 0
VPN  INTERFACE  IP ADDRESS         <span class="hl">ADMIN</span>  <span class="hl">OPER</span>  ENCAP
0    eth0       198.51.100.30/24   <span class="hl">Up</span>     <span class="hl">Up</span>    null
VBOND# show ip route vpn 0
VPN  PREFIX         NEXTHOP          PROTOCOL
0    0.0.0.0/0      198.51.100.1     static
VBOND# ping vpn 0 198.51.100.1
VBOND# show clock</pre>

<div class="eg"><p><b>Why the system IP does not need to be reachable.</b> The system IP 10.255.255.2 on VSMART is not on any interface. The Controller's real reachable address is 198.51.100.20. Other devices learn the system IP in the control connection and use it as the name of the device, never as a destination for packets. That is why you can pick a simple plan such as 10.255.255.x for controllers and 10.255.0.x for edges.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing the organization name differently on one device; forgetting <code>local vbond-only</code> on the Validator; duplicating a system IP; forgetting the default route in VPN 0; leaving the clock wrong, so that certificates look not yet valid or already expired; leaving <code>allow-service all</code> in production.</p></div>

<div class="exam"><p><b>Exam traps.</b> The organization name must match on all devices and is case-sensitive. The system IP is an identity and need not be routable. The Validator is the device configured with <code>vbond ... local</code>. Control connections form in VPN 0 on a tunnel interface.</p></div>

<div class="scn"><h4>The invisible space</h4><p>A new Controller was bootstrapped and its control connection to the Validator stayed in connect state. The network was fine, the ports were open, and the certificate was valid. The engineer compared the system blocks of the two devices side by side and noticed that one organization name was "NK-LAB " with a trailing space. Retyping it fixed the connection.</p><p><b>Lesson:</b> compare the system blocks of devices with a tool, not by eye.</p></div>

<div class="iv"><p class="q">"What is the minimum configuration to bring up a Validator?"</p><p>Strong answer: a system block with host name, system IP, site ID, organization name and the vbond line with <code>local vbond-only</code>; a VPN 0 interface with an IP address, tunnel interface and default route; a correct clock; and a certificate signed by the CA the fabric trusts. Mention that edges must be able to reach it on every transport.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bootstrap gives each controller identity and reachability, not the full config.</li>
<li>The same system block pattern is used on all three controllers.</li>
<li>The Validator uses vbond with local vbond-only; others point to its address or name.</li>
<li>Organization name must be exactly the same everywhere.</li>
<li>Prove interface, route, clock and name resolution before certificates.</li>
</ul></div>
`,hi:`
<p>Naya install hua controller naye employee ke pehle din jaisa hai: uske paas laptop hai par naam ka tag nahi, department nahi aur pata nahi ki doosre offices kahan hain. Bootstrapping use woh minimum identity deti hai jo reachable hone aur doosron se judne ke liye chahiye. Yeh poori configuration nahi hai. Yeh chhota block hai jisse controller bata sakta hai ki woh kaun hai (host name, system IP, site ID, organization name), Validator kahan hai, aur use kaise reach kiya jaye (VPN 0 mein tunnel interface wala address, aur VPN 512 mein management address).</p>

<h3>Bootstrap ke hisse</h3>
<table class="cmp"><tr><th>Item</th><th>Kahan</th><th>Matlab</th></tr>
<tr><td>host-name</td><td>system</td><td>Prompts aur Manager mein dikhne wala naam</td></tr>
<tr><td>system-ip</td><td>system</td><td>Device ki permanent identity, IPv4 address ki tarah likhi jaati hai; routable hona zaroori nahi</td></tr>
<tr><td>site-id</td><td>system</td><td>Location number; controllers aksar ek site ID share karte hain, edges doosre use karte hain</td></tr>
<tr><td>organization-name</td><td>system</td><td>Fabric ke har device par bilkul same hona chahiye, case samet</td></tr>
<tr><td>vbond</td><td>system</td><td>Validator ka address ya DNS name</td></tr>
<tr><td>VPN 0 interface</td><td>vpn 0</td><td>Transport address, default route aur tunnel-interface</td></tr>
<tr><td>VPN 512</td><td>vpn 512</td><td>Optional out-of-band management interface</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Controller ke bootstrap blocks">
<rect x="20" y="15" width="290" height="150" rx="12" fill="#fde68a"/><text x="165" y="38" text-anchor="middle" class="svg-ink" font-size="14">system block (main kaun hoon)</text><text x="165" y="64" text-anchor="middle" class="svg-muted" font-size="11">host-name VMANAGE</text><text x="165" y="82" text-anchor="middle" class="svg-muted" font-size="11">system-ip 10.255.255.1</text><text x="165" y="100" text-anchor="middle" class="svg-muted" font-size="11">site-id 1</text><text x="165" y="118" text-anchor="middle" class="svg-muted" font-size="11">organization-name NK-LAB</text><text x="165" y="136" text-anchor="middle" class="svg-muted" font-size="11">vbond 198.51.100.30</text>
<rect x="330" y="15" width="290" height="70" rx="12" fill="#bae6fd"/><text x="475" y="38" text-anchor="middle" class="svg-ink" font-size="14">vpn 0 (mujhe kaise reach karein)</text><text x="475" y="60" text-anchor="middle" class="svg-muted" font-size="11">eth0 198.51.100.10/24, tunnel-interface</text><text x="475" y="76" text-anchor="middle" class="svg-muted" font-size="11">default route 198.51.100.1</text>
<rect x="330" y="95" width="290" height="70" rx="12" fill="#bbf7d0"/><text x="475" y="118" text-anchor="middle" class="svg-ink" font-size="14">vpn 512 (admin access)</text><text x="475" y="140" text-anchor="middle" class="svg-muted" font-size="11">out-of-band management address</text>
<rect x="20" y="180" width="600" height="40" rx="10" fill="#f1f5f9"/><text x="320" y="204" text-anchor="middle" class="svg-ink" font-size="12">Jodo: sahi time (NTP) aur name resolution, warna certificates aur vbond name fail hote hain.</text>
</svg><p class="cap">Teen chhote blocks controller ko reachable aur identified banate hain.</p></div>

<h3>Controller configuration</h3>
<p>Controllers par CLI original Viptela-style syntax use karti hai. Teeno controllers ka pattern same hai. Sirf host name, system IP, address aur Validator par ek extra keyword alag hota hai.</p>
<pre class="code"><span class="c">! Reference configuration: Manager bootstrap (interface names depend on the VM)</span>
system
 host-name VMANAGE
 system-ip 10.255.255.1
 site-id 1
 organization-name NK-LAB
 vbond 198.51.100.30
 exit
vpn 0
 interface eth0
  ip address 198.51.100.10/24
  tunnel-interface
   allow-service all
   exit
  no shutdown
  exit
 ip route 0.0.0.0/0 198.51.100.1
 exit</pre>
<pre class="code"><span class="c">! Controller (VSMART): same pattern, new name, system IP and address</span>
system
 host-name VSMART
 system-ip 10.255.255.2
 site-id 1
 organization-name NK-LAB
 vbond 198.51.100.30
 exit
vpn 0
 interface eth0
  ip address 198.51.100.20/24
  tunnel-interface
   allow-service all
   exit
  no shutdown
  exit
 ip route 0.0.0.0/0 198.51.100.1
 exit</pre>
<pre class="code"><span class="c">! Validator (VBOND): the vbond line has local vbond-only</span>
system
 host-name VBOND
 system-ip 10.255.255.3
 site-id 1
 organization-name NK-LAB
 vbond 198.51.100.30 local vbond-only
 exit
vpn 0
 interface eth0
  ip address 198.51.100.30/24
  tunnel-interface
   encapsulation ipsec
   allow-service all
   exit
  no shutdown
  exit
 ip route 0.0.0.0/0 198.51.100.1
 exit</pre>
<p>Validator ko dhyan se padho. <code>local</code> shabd device ko batata hai ki address uska apna hai, isliye woh Validator ki tarah kaam karta hai. <code>vbond-only</code> use sirf Validator function chalane deta hai, aur kuch nahi. Manager aur Controller par wahi <code>vbond</code> line sirf Validator ke address ko point karti hai, jo ek DNS name bhi ho sakta hai jo kai Validator addresses par resolve ho.</p>

<h3>Har line kya karti hai</h3>
<ul>
<li><b>system-ip</b> OMP aur control connections ke andar controller ki identity hai. Yeh interface address nahi hai aur use route nahi chahiye, par unique rakhna zaroori hai.</li>
<li><b>site-id</b> locations ko alag karta hai. Controllers aam taur par ek site ID share karte hain. Edges ko kisi alag site ke saath site ID share nahi karna chahiye, jab tak woh jaanbujh kar ek hi site mein na hon.</li>
<li><b>organization-name</b> authentication ke dauran check hota hai. Spelling, case ya space mein ek fark control connection tod deta hai.</li>
<li>VPN 0 mein <b>tunnel-interface</b> us interface ko mark karta hai jo control connections carry karta hai. Lab mein <code>allow-service all</code> suvidhajanak hai; production mein interface par sirf zaroori services allow karo.</li>
<li>VPN 0 ka default route controller ko edges aur doosre controllers tak path deta hai.</li>
</ul>

<h3>Bootstrap ke baad checks</h3>
<p>Certificates par jaane se pehle basics saabit karo: interface up hai, default route hai, gateway jawab deta hai, clock sahi hai aur names resolve hote hain.</p>
<pre class="out">VBOND# show interface vpn 0
VPN  INTERFACE  IP ADDRESS         <span class="hl">ADMIN</span>  <span class="hl">OPER</span>  ENCAP
0    eth0       198.51.100.30/24   <span class="hl">Up</span>     <span class="hl">Up</span>    null
VBOND# show ip route vpn 0
VPN  PREFIX         NEXTHOP          PROTOCOL
0    0.0.0.0/0      198.51.100.1     static
VBOND# ping vpn 0 198.51.100.1
VBOND# show clock</pre>

<div class="eg"><p><b>System IP ko reachable kyun nahi hona padta.</b> VSMART par system IP 10.255.255.2 kisi interface par nahi hai. Controller ka asli reachable address 198.51.100.20 hai. Doosre devices system IP ko control connection mein seekhte hain aur use device ke naam ki tarah use karte hain, packets ke destination ki tarah kabhi nahi. Isiliye aap controllers ke liye 10.255.255.x aur edges ke liye 10.255.0.x jaisa simple plan chun sakte ho.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Ek device par organization name alag type karna; Validator par <code>local vbond-only</code> bhoolna; system IP duplicate karna; VPN 0 mein default route bhoolna; clock galat chhodna jisse certificates abhi valid nahi ya expire dikhte hain; production mein <code>allow-service all</code> chhodna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Organization name sab devices par match hona chahiye aur case-sensitive hai. System IP identity hai aur routable hona zaroori nahi. Validator woh device hai jo <code>vbond ... local</code> ke saath configured hai. Control connections VPN 0 mein tunnel interface par bante hain.</p></div>

<div class="scn"><h4>Anjaana space</h4><p>Naya Controller bootstrap hua aur Validator tak uska control connection connect state mein atka raha. Network theek tha, ports khule the aur certificate valid tha. Engineer ne dono devices ke system blocks side by side compare kiye aur dekha ki ek organization name "NK-LAB " tha, ant mein space ke saath. Dobara type karne se connection theek ho gaya.</p><p><b>Seekh:</b> devices ke system blocks ko aankh se nahi, tool se compare karo.</p></div>

<div class="iv"><p class="q">"Validator ko up karne ke liye minimum configuration kya hai?"</p><p>Strong answer: host name, system IP, site ID, organization name aur <code>local vbond-only</code> wali vbond line ke saath system block; IP address, tunnel interface aur default route ke saath VPN 0 interface; sahi clock; aur us CA se signed certificate jise fabric trust karta hai. Kaho ki edges ko use har transport par reach karna aana chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bootstrap har controller ko identity aur reachability deta hai, poori config nahi.</li>
<li>Teeno controllers par system block ka pattern same hai.</li>
<li>Validator vbond ke saath local vbond-only use karta hai; baaki uske address ya naam ko point karte hain.</li>
<li>Organization name har jagah bilkul same hona chahiye.</li>
<li>Certificates se pehle interface, route, clock aur name resolution saabit karo.</li>
</ul></div>
`}};export{e as default};