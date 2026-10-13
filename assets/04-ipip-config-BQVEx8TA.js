var e={id:`ipip-config`,h:{en:`Configuring an IP-IP tunnel (ip-0/0/0) and when to choose it`,hi:`IP-IP tunnel (ip-0/0/0) configure karna aur kab chunna`},body:{en:`
<p>IP-IP is the simplest tunnel there is: take an IPv4 packet and put another IPv4 header on top. No extra tunnel header, no options. On Junos it uses the interface <code>ip-0/0/0</code>. If GRE is a courier envelope with a small label, IP-IP is the same envelope with no label at all.</p>

<h3>When to choose IP-IP</h3>
<ul>
<li>Both ends are Junos (or otherwise IP-IP capable) and you only need to carry <b>IPv4</b>.</li>
<li>You want the smallest overhead: 20 bytes instead of 24.</li>
<li>You do not need keepalives, keys, IPv6 or MPLS inside the tunnel.</li>
</ul>
<p>Choose GRE instead when you need to carry IPv6 or other protocols, want keepalives, or must interoperate with another vendor's default tunnel type (GRE is the most widely supported).</p>

<table class="cmp"><tr><th>Question</th><th>Pick</th></tr>
<tr><td>IPv6 or MPLS inside the tunnel?</td><td>GRE</td></tr>
<tr><td>Need failure detection with keepalives?</td><td>GRE (OAM)</td></tr>
<tr><td>Pure IPv4, lowest overhead?</td><td>IP-IP</td></tr>
<tr><td>Third-party equipment at the far end?</td><td>GRE, usually</td></tr></table>

<h3>Configuration: the Bhopal-to-Indore design</h3>
<p>In the second lab R1 (Bhopal, WAN 203.0.113.17/30) and R3 (Indore, WAN 203.0.113.25/30) are separated by ISP. The overlay is 172.31.7.0/30. The correct configuration on R1 is:</p>
<pre class="code"><span class="c">! R1 (Bhopal)</span>
set interfaces ip-0/0/0 unit 0 tunnel source 203.0.113.17
set interfaces ip-0/0/0 unit 0 tunnel destination 203.0.113.25
set interfaces ip-0/0/0 unit 0 family inet address 172.31.7.1/30

<span class="c">! R3 (Indore): mirrored</span>
set interfaces ip-0/0/0 unit 0 tunnel source 203.0.113.25
set interfaces ip-0/0/0 unit 0 tunnel destination 203.0.113.17
set interfaces ip-0/0/0 unit 0 family inet address 172.31.7.2/30</pre>
<p>Note that the syntax is identical to GRE: only the interface name changes. That is deliberate in Junos and makes both easy to learn.</p>

<h3>Verification: what a good IP-IP unit looks like</h3>
<pre class="out">lab@R1&gt; show interfaces ip-0/0/0.0 detail
  Logical interface ip-0/0/0.0 (Index 340) (SNMP ifIndex 530)
    <span class="hl">Flags: Up Point-To-Point SNMP-Traps 0x4000 IP-Header 203.0.113.25:203.0.113.17:4:df:64:0000000000000000 Encapsulation: IPIP-NULL</span>
    <span class="hl">Tunnel source 203.0.113.17, destination 203.0.113.25, IP protocol 4 (IP-IP), TTL 64</span>
    Tunnel state: Up (destination reachable via ge-0/0/0.0)
    Protocol inet, MTU: 1480
      Addresses, Flags: Is-Preferred Is-Primary
        Destination: 172.31.7.0/30, Local: 172.31.7.1, Broadcast: 172.31.7.3</pre>
<p>Compare with the GRE unit from chapter 3: protocol 4 instead of 47, encapsulation IPIP-NULL instead of GRE-NULL, and the protocol MTU is 1480 instead of 1476 because there is no 4-byte GRE header.</p>

<h3>The wrong destination: a tunnel that is up but useless</h3>
<p>In the troubleshooting lab, R1 starts with a destination of 203.0.113.26, which is the <i>ISP's</i> interface, not R3. Look at what the router says:</p>
<pre class="out">lab@R1&gt; show interfaces ip-0/0/0.0 detail
    Flags: Up Point-To-Point SNMP-Traps 0x4000 IP-Header <span class="hl">203.0.113.26</span>:203.0.113.17:4:df:64:0000000000000000 Encapsulation: IPIP-NULL
    Tunnel source 203.0.113.17, destination <span class="hl">203.0.113.26</span>, IP protocol 4 (IP-IP), TTL 64
    Tunnel state: Up (destination reachable via ge-0/0/0.0)

lab@R1&gt; show ospf neighbor
<span class="c">(no output: no neighbour)</span></pre>
<p>The unit is Up because 203.0.113.26 is perfectly routable. But the ISP receives IP protocol 4 addressed to itself and has no tunnel to hand it to, so the packets vanish. No OSPF hello ever reaches R3. The fix is one line:</p>
<pre class="code">set interfaces ip-0/0/0 unit 0 tunnel destination 203.0.113.25
commit</pre>
<p>Setting an existing leaf replaces the old value, so you do not need to delete first.</p>

<h3>Tunnel services and platforms</h3>
<p>Whether <code>gr-0/0/0</code> and <code>ip-0/0/0</code> appear by themselves depends on the platform. On MX-series routers, tunnel interfaces need tunnel services enabled on a PIC (<code>set chassis fpc 0 pic 0 tunnel-services bandwidth 1g</code>), and the interface numbering follows that FPC and PIC. On SRX and many virtual platforms the interfaces are already present. In the simulator they exist as soon as you configure a unit. If a unit never appears on real hardware, check tunnel services first.</p>

<div class="eg"><p><b>Worked example.</b> You must carry only IPv4 between two data-centre routers and every byte counts. IP-IP gives a 1480-byte inner MTU, GRE gives 1476. For a stream of full-size packets that is 4 more usable bytes in every packet, but you lose keepalives. Many teams still choose GRE for that reason alone.</p></div>

<div class="warn"><p><b>Common mistake.</b> Trying to run IPv6 over an IP-IP unit. IP-IP is an IPv4-only passenger tunnel, so IPv6 needs GRE (or another IPv6-in-IPv4 mechanism). Mixing the two interface types at the two ends, such as gr on one side and ip on the other, also fails because the protocol numbers differ.</p></div>
<div class="exam"><p><b>Exam trap.</b> The question "Which tunnel has the lowest overhead?" has the answer IP-IP, 20 bytes. "Which one supports keepalives?" is GRE. Do not mix them.</p></div>

<div class="scn"><h4>The tunnel that pointed at the provider</h4><p>After a rushed migration, the Bhopal router carried the provider's address as tunnel destination. Everything looked healthy: Up/up, correct source, correct overlay address. Yet no OSPF neighbour ever formed. The engineer compared the destination in <code>show interfaces ip-0/0/0.0 detail</code> with the far router's WAN address and saw the one-digit difference at once.</p><p><b>Lesson:</b> always compare the tunnel destination with the far router's real address before blaming OSPF.</p></div>

<div class="iv"><p class="q">"When would you use IP-IP instead of GRE?"</p><p>When I only carry IPv4 between two capable routers and want the lowest overhead, 20 bytes. If I need IPv6, multicast-aware extras, keepalives or vendor interoperability, I use GRE. I would also mention that neither encrypts, so IPsec is needed for privacy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IP-IP uses <code>ip-0/0/0</code>, IP protocol 4 and adds only 20 bytes.</li>
<li>It carries IPv4 only and has no keepalives.</li>
<li>The syntax mirrors GRE: tunnel source, tunnel destination, family inet address.</li>
<li>Protocol MTU on an IP-IP unit is 1480 over a 1500-byte underlay.</li>
<li>A destination that is routable but wrong still shows the unit Up.</li>
</ul></div>
`,hi:`
<p>IP-IP sabse simple tunnel hai: ek IPv4 packet lo aur uske upar doosra IPv4 header laga do. Koi extra tunnel header nahi, koi options nahi. Junos par yeh <code>ip-0/0/0</code> interface use karta hai. Agar GRE chhote label wala courier envelope hai, to IP-IP wahi envelope bina label ke.</p>

<h3>IP-IP kab chunein</h3>
<ul>
<li>Dono ends Junos (ya IP-IP capable) hain aur sirf <b>IPv4</b> le jaana hai.</li>
<li>Sabse kam overhead chahiye: 24 ki jagah 20 bytes.</li>
<li>Tunnel ke andar keepalives, key, IPv6 ya MPLS ki zaroorat nahi.</li>
</ul>
<p>GRE tab chunein jab IPv6 ya doosre protocols le jaane hon, keepalives chahiye hon, ya kisi aur vendor ke default tunnel type ke saath interoperate karna ho (GRE sabse zyada supported hai).</p>

<table class="cmp"><tr><th>Sawal</th><th>Chunav</th></tr>
<tr><td>Tunnel ke andar IPv6 ya MPLS?</td><td>GRE</td></tr>
<tr><td>Keepalives se failure detection chahiye?</td><td>GRE (OAM)</td></tr>
<tr><td>Sirf IPv4, sabse kam overhead?</td><td>IP-IP</td></tr>
<tr><td>Far end par third-party equipment?</td><td>GRE, aam taur par</td></tr></table>

<h3>Configuration: Bhopal-se-Indore design</h3>
<p>Doosre lab mein R1 (Bhopal, WAN 203.0.113.17/30) aur R3 (Indore, WAN 203.0.113.25/30) ke beech ISP hai. Overlay 172.31.7.0/30 hai. R1 par sahi configuration:</p>
<pre class="code"><span class="c">! R1 (Bhopal)</span>
set interfaces ip-0/0/0 unit 0 tunnel source 203.0.113.17
set interfaces ip-0/0/0 unit 0 tunnel destination 203.0.113.25
set interfaces ip-0/0/0 unit 0 family inet address 172.31.7.1/30

<span class="c">! R3 (Indore): mirror</span>
set interfaces ip-0/0/0 unit 0 tunnel source 203.0.113.25
set interfaces ip-0/0/0 unit 0 tunnel destination 203.0.113.17
set interfaces ip-0/0/0 unit 0 family inet address 172.31.7.2/30</pre>
<p>Dhyan do ki syntax GRE jaisa hi hai: sirf interface ka naam badalta hai. Junos mein yeh jaanbujhkar hai aur dono seekhna aasaan ho jaata hai.</p>

<h3>Verification: achha IP-IP unit kaisa dikhta hai</h3>
<pre class="out">lab@R1&gt; show interfaces ip-0/0/0.0 detail
  Logical interface ip-0/0/0.0 (Index 340) (SNMP ifIndex 530)
    <span class="hl">Flags: Up Point-To-Point SNMP-Traps 0x4000 IP-Header 203.0.113.25:203.0.113.17:4:df:64:0000000000000000 Encapsulation: IPIP-NULL</span>
    <span class="hl">Tunnel source 203.0.113.17, destination 203.0.113.25, IP protocol 4 (IP-IP), TTL 64</span>
    Tunnel state: Up (destination reachable via ge-0/0/0.0)
    Protocol inet, MTU: 1480
      Addresses, Flags: Is-Preferred Is-Primary
        Destination: 172.31.7.0/30, Local: 172.31.7.1, Broadcast: 172.31.7.3</pre>
<p>Chapter 3 ke GRE unit se compare karo: 47 ki jagah protocol 4, GRE-NULL ki jagah IPIP-NULL, aur protocol MTU 1476 ki jagah 1480 kyunki 4-byte GRE header nahi hai.</p>

<h3>Galat destination: tunnel jo up hai lekin bekaar</h3>
<p>Troubleshooting lab mein R1 destination 203.0.113.26 ke saath shuru hota hai, jo <i>ISP</i> ka interface hai, R3 nahi. Dekho router kya kehta hai:</p>
<pre class="out">lab@R1&gt; show interfaces ip-0/0/0.0 detail
    Flags: Up Point-To-Point SNMP-Traps 0x4000 IP-Header <span class="hl">203.0.113.26</span>:203.0.113.17:4:df:64:0000000000000000 Encapsulation: IPIP-NULL
    Tunnel source 203.0.113.17, destination <span class="hl">203.0.113.26</span>, IP protocol 4 (IP-IP), TTL 64
    Tunnel state: Up (destination reachable via ge-0/0/0.0)

lab@R1&gt; show ospf neighbor
<span class="c">(koi output nahi: koi neighbour nahi)</span></pre>
<p>Unit Up hai kyunki 203.0.113.26 bilkul routable hai. Lekin ISP ko apne hi address par protocol 4 mila aur uske paas dene ko koi tunnel nahi, isliye packets gayab ho jaate hain. R3 tak koi OSPF hello nahi pahunchta. Fix ek line ka hai:</p>
<pre class="code">set interfaces ip-0/0/0 unit 0 tunnel destination 203.0.113.25
commit</pre>
<p>Maujooda leaf set karne se purani value badal jaati hai, pehle delete karne ki zaroorat nahi.</p>

<h3>Tunnel services aur platforms</h3>
<p><code>gr-0/0/0</code> aur <code>ip-0/0/0</code> khud dikhte hain ya nahi, yeh platform par depend karta hai. MX-series routers par tunnel interfaces ke liye PIC par tunnel services enable karni padti hai (<code>set chassis fpc 0 pic 0 tunnel-services bandwidth 1g</code>), aur interface numbering usi FPC aur PIC ko follow karti hai. SRX aur kai virtual platforms par interfaces pehle se maujood hote hain. Simulator mein unit configure karte hi woh ban jaate hain. Real hardware par unit kabhi na dikhe to pehle tunnel services check karo.</p>

<div class="eg"><p><b>Worked example.</b> Do data-centre routers ke beech sirf IPv4 le jaana hai aur har byte matter karta hai. IP-IP 1480-byte inner MTU deta hai, GRE 1476. Full-size packets ki stream mein har packet mein 4 byte zyada usable hain, lekin keepalives chali jaati hain. Kai teams sirf isi wajah se GRE chunti hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> IP-IP unit par IPv6 chalane ki koshish. IP-IP sirf IPv4 passenger tunnel hai, isliye IPv6 ke liye GRE (ya koi aur IPv6-in-IPv4 mechanism) chahiye. Dono ends par alag interface types (ek taraf gr aur doosri taraf ip) mix karna bhi fail hota hai kyunki protocol numbers alag hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Sabse kam overhead kis tunnel ka?" ka jawab IP-IP, 20 bytes. "Keepalives kaun support karta hai?" GRE. Inhe mix mat karo.</p></div>

<div class="scn"><h4>Tunnel jo provider ko point karta tha</h4><p>Jaldbaazi ke migration ke baad Bhopal router mein tunnel destination ki jagah provider ka address tha. Sab theek dikh raha tha: Up/up, sahi source, sahi overlay address. Phir bhi koi OSPF neighbour nahi bana. Engineer ne <code>show interfaces ip-0/0/0.0 detail</code> ka destination far router ke WAN address se milaya aur ek digit ka farak turant dikh gaya.</p><p><b>Lesson:</b> OSPF ko dosh dene se pehle tunnel destination ko far router ke asli address se zaroor compare karo.</p></div>

<div class="iv"><p class="q">"IP-IP ki jagah GRE kab use karoge, aur ulta?"</p><p>Jab main sirf IPv4 do capable routers ke beech le jaata hoon aur sabse kam overhead chahiye, 20 bytes, tab IP-IP. IPv6, keepalives ya vendor interoperability chahiye to GRE. Yeh bhi kahunga ki dono encrypt nahi karte, privacy ke liye IPsec chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IP-IP <code>ip-0/0/0</code>, IP protocol 4 use karta hai aur sirf 20 bytes jodta hai.</li>
<li>Sirf IPv4 le jaata hai aur keepalives nahi hain.</li>
<li>Syntax GRE jaisa: tunnel source, tunnel destination, family inet address.</li>
<li>1500-byte underlay par IP-IP unit ka protocol MTU 1480 hai.</li>
<li>Routable lekin galat destination bhi unit ko Up dikhata hai.</li>
</ul></div>
`}};export{e as default};