var e={id:`ldp-operation`,h:{en:`How LDP works: discovery, session and label exchange`,hi:`LDP kaise kaam karta hai: discovery, session aur label exchange`},body:{en:`
<p>Think of two new neighbours in an apartment block. First they <b>notice</b> each other: every morning each one waves from the balcony ("I am here, my name is Ravi, you can call me at this number"). Once they have both waved, one of them actually <b>phones</b> the other and they agree how to talk. Then they <b>exchange lists</b>: "these are my addresses", "for parcels to Pune, use sticker 22". After that they call every minute just to say "still here". That is LDP: discovery, session, label exchange, keepalives.</p>

<h3>What LDP is</h3>
<p><b>LDP</b>, the Label Distribution Protocol (RFC 5036), is the standard protocol LSRs use to tell each other "for FEC X, send me label L". It has no routing intelligence of its own. It simply attaches labels to prefixes the IGP has already installed. Cisco's older proprietary predecessor was TDP (Tag Distribution Protocol); on current IOS, LDP is the only choice you need to know, and <code>mpls label protocol ldp</code> is the default.</p>

<h3>Step 1: discovery with Hellos</h3>
<ul>
<li>On every interface with <code>mpls ip</code>, the router sends <b>link Hellos</b> to <b>UDP port 646</b>, destination <b>224.0.0.2</b> (all routers on this subnet).</li>
<li>Default Hello interval <b>5 seconds</b>, hold time <b>15 seconds</b>.</li>
<li>The Hello carries the <b>LDP identifier</b> and, as an option, the <b>transport address</b>.</li>
<li>For neighbours that are not directly connected (for example LDP session protection, or pseudowires), <b>targeted Hellos</b> are sent by unicast to UDP 646.</li>
</ul>

<h3>The LDP identifier and the transport address</h3>
<p>The LDP ID is 6 bytes written as <code>router-id:label-space</code>, for example <b>1.1.1.1:0</b>. The <b>:0</b> means a platform-wide label space: the same label value means the same thing whichever interface it arrives on. That is normal for frame-mode (Ethernet) MPLS.</p>
<p>The <b>LDP router ID</b> is chosen like this:</p>
<ol>
<li>The address of the interface in <code>mpls ldp router-id &lt;interface&gt;</code>, if that interface is up.</li>
<li>Otherwise, the highest IP address on an up loopback interface.</li>
<li>Otherwise, the highest IP address on any up interface.</li>
</ol>
<p>By default the <b>transport address</b>, the IP used for the TCP session, is the LDP router ID. That creates the most important rule of LDP: <b>each router must have a route to its neighbour's LDP router ID</b>. A route to the link subnet is not enough.</p>

<h3>Step 2: the TCP session</h3>
<p>Once both routers have heard each other's Hellos, the one with the <b>higher transport address</b> takes the <b>active</b> role and opens a TCP connection to the other's transport address on <b>TCP port 646</b>. The other side listens (passive role). You can see this in the TCP connection line: the active router uses a random high source port, and the passive router's side shows port 646.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="LDP session establishment">
<rect x="60" y="20" width="160" height="40" rx="8" fill="#bae6fd"/><text x="140" y="45" text-anchor="middle" class="svg-ink" font-size="13">PE1 1.1.1.1</text>
<rect x="420" y="20" width="160" height="40" rx="8" fill="#ddd6fe"/><text x="500" y="45" text-anchor="middle" class="svg-ink" font-size="13">P1 2.2.2.2</text>
<line x1="140" y1="60" x2="140" y2="260" stroke="#64748b" stroke-dasharray="3 3"/><line x1="500" y1="60" x2="500" y2="260" stroke="#64748b" stroke-dasharray="3 3"/>
<line x1="140" y1="85" x2="500" y2="85" stroke="#64748b" marker-end="url(#a7)"/><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">Hello UDP 646 to 224.0.0.2</text>
<line x1="500" y1="110" x2="140" y2="110" stroke="#64748b" marker-end="url(#a7)"/><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="12">Hello UDP 646 to 224.0.0.2</text>
<line x1="500" y1="145" x2="140" y2="145" stroke="#64748b" stroke-width="2" marker-end="url(#a7)"/><text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">TCP to 1.1.1.1:646 (P1 is active)</text>
<line x1="140" y1="180" x2="500" y2="180" stroke="#64748b" marker-end="url(#a7)"/><line x1="500" y1="188" x2="140" y2="188" stroke="#64748b" marker-end="url(#a7)"/><text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">Initialization + Keepalive</text>
<line x1="140" y1="222" x2="500" y2="222" stroke="#64748b" marker-end="url(#a7)"/><line x1="500" y1="230" x2="140" y2="230" stroke="#64748b" marker-end="url(#a7)"/><text x="320" y="217" text-anchor="middle" class="svg-muted" font-size="12">Address + Label Mapping</text>
<text x="320" y="258" text-anchor="middle" class="svg-ink" font-size="12">State: Oper</text>
<defs><marker id="a7" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#64748b"/></marker></defs>
</svg><p class="cap">Discovery by UDP multicast, then a TCP session opened by the higher transport address, then initialization and label exchange.</p></div>

<h3>Step 3: initialization and label exchange</h3>
<p>Over TCP the routers exchange <b>Initialization</b> messages (protocol version, timers, label distribution mode, the receiver's LDP ID) and confirm them with a <b>Keepalive</b>. The session is now <b>Operational</b>. Then each router sends:</p>
<ul>
<li><b>Address</b> messages: all of its interface IP addresses. This is how P1 knows that next hop 10.0.23.3 belongs to LDP ID 3.3.3.3:0, so it can pick the right remote label from the LIB.</li>
<li><b>Label Mapping</b> messages: one binding per FEC, "prefix → label".</li>
<li>Later, <b>Label Withdraw</b>, <b>Label Release</b> and <b>Address Withdraw</b> when routes or interfaces go away, and <b>Notification</b> for errors.</li>
</ul>
<p>Keepalives keep the TCP session alive: default <b>60 seconds</b> interval, <b>180 seconds</b> session hold time.</p>

<div class="eg"><p><b>Worked example.</b> PE1 (LDP ID 1.1.1.1) and P1 (2.2.2.2) share 10.0.12.0/24. Both send Hellos from their link addresses to 224.0.0.2. 2.2.2.2 is higher than 1.1.1.1, so P1 opens TCP from 2.2.2.2 port 51233 (random) to 1.1.1.1 port 646. PE1 must have a route to 2.2.2.2/32 and P1 to 1.1.1.1/32, both learned through OSPF because the loopbacks are in the OSPF network statements. On PE1, <code>show mpls ldp neighbor</code> shows "TCP connection: 2.2.2.2.51233 - 1.1.1.1.646".</p></div>

<h3>LDP-IGP synchronization (concept)</h3>
<p>LDP depends on the IGP, but the IGP does not know about LDP. When a link comes up, OSPF may start using it seconds before the LDP session on that link has exchanged labels. For that window, traffic is sent <b>unlabelled</b> over the new link. For plain IP that may work, but in a BGP-free core or an L3VPN it means <b>blackholed traffic</b>, because P routers have no route to customer or internet prefixes.</p>
<pre class="code">router ospf 1
 mpls ldp sync            <span class="c">! OSPF advertises max metric on a link until LDP is ready</span></pre>
<p>With <b>LDP-IGP sync</b>, OSPF advertises the link with maximum metric until LDP is up and labels are exchanged, so traffic avoids the link until it can carry labels. A related feature, <b>LDP session protection</b>, keeps a targeted LDP session alive over an alternate path when a link flaps, so labels do not have to be relearned.</p>

<div class="warn"><p><b>Common mistake.</b> Using a loopback as the LDP router ID but not advertising it in the IGP. The Hellos arrive, discovery shows the neighbour, but the TCP session never forms because there is no route to the transport address. This is the fault in the troubleshooting lab.</p></div>

<div class="exam"><p><b>Exam trap.</b> Hellos: UDP 646, 224.0.0.2. Session: TCP 646. Both use port 646. The router with the higher transport address is active. LDP ID format is router-id:label-space, and :0 means per-platform label space.</p></div>

<div class="scn"><h4>Blackhole after a link came back</h4><p>An ISP with a BGP-free core saw two minutes of dropped internet traffic every time a particular core link recovered from a flap. OSPF brought the link back into use within seconds, but LDP took longer to finish exchanging labels, so PE traffic toward remote BGP next hops left the P router unlabelled and the P router, having no BGP table, dropped it. Enabling <code>mpls ldp sync</code> under OSPF on all core routers kept the link at maximum metric until LDP was ready, and the drops stopped.</p><p><b>Lesson:</b> in a BGP-free core, an unlabelled packet in the core is a dropped packet; synchronise LDP with the IGP.</p></div>

<div class="iv"><p class="q">"How does an LDP session come up? Which ports are used?"</p><p>Routers send link Hellos to UDP 646 on 224.0.0.2 every 5 seconds, carrying their LDP ID and transport address. When both have discovered each other, the router with the higher transport address opens TCP to the peer's transport address on port 646. They exchange Initialization and Keepalive messages, then Address and Label Mapping messages. Add the critical point: each router needs a route to the other's transport address, normally the loopback used as LDP router ID.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Discovery: Hellos to UDP 646, 224.0.0.2, every 5 s, hold 15 s; targeted Hellos are unicast.</li>
<li>Session: TCP 646, opened by the higher transport address; keepalive 60 s, hold 180 s.</li>
<li>LDP ID = router-id:0; the router ID is the configured interface, else highest loopback, else highest interface IP.</li>
<li>The transport address (default: router ID) must be reachable through the IGP.</li>
<li>Address messages map next-hop IPs to LDP peers; LDP-IGP sync prevents blackholes while LDP converges.</li>
</ul></div>
`,hi:`
<p>Ek apartment block ke do naye padosi socho. Pehle woh ek doosre ko <b>notice</b> karte hain: har subah dono balcony se haath hilaate hain ("main yahan hoon, mera naam Ravi hai, is number par call kar sakte ho"). Jab dono haath hila chuke hote hain, to unmein se ek sach mein doosre ko <b>phone</b> karta hai aur dono tay karte hain ki baat kaise karenge. Phir woh <b>lists exchange</b> karte hain: "yeh mere addresses hain", "Pune ke parcels ke liye sticker 22 use karo". Uske baad har minute sirf "abhi bhi yahan hoon" kehne ke liye call karte hain. Yahi LDP hai: discovery, session, label exchange, keepalives.</p>

<h3>LDP kya hai</h3>
<p><b>LDP</b>, Label Distribution Protocol (RFC 5036), woh standard protocol hai jisse LSRs ek doosre ko batate hain "FEC X ke liye mujhe label L bhejo". Iske paas apni koi routing intelligence nahi hai. Yeh bas un prefixes par labels lagata hai jo IGP pehle hi install kar chuka hai. Cisco ka purana proprietary predecessor TDP (Tag Distribution Protocol) tha; current IOS par LDP hi ek choice hai jo aapko jaanni hai, aur <code>mpls label protocol ldp</code> default hai.</p>

<h3>Step 1: Hellos se discovery</h3>
<ul>
<li><code>mpls ip</code> wale har interface par router <b>link Hellos</b> bhejta hai <b>UDP port 646</b> par, destination <b>224.0.0.2</b> (is subnet ke saare routers).</li>
<li>Default Hello interval <b>5 seconds</b>, hold time <b>15 seconds</b>.</li>
<li>Hello mein <b>LDP identifier</b> hota hai aur, option ke taur par, <b>transport address</b>.</li>
<li>Jo neighbours directly connected nahi hain (jaise LDP session protection, ya pseudowires), unke liye <b>targeted Hellos</b> unicast se UDP 646 par bheje jaate hain.</li>
</ul>

<h3>LDP identifier aur transport address</h3>
<p>LDP ID 6 bytes ka hota hai aur <code>router-id:label-space</code> ki tarah likha jaata hai, jaise <b>1.1.1.1:0</b>. <b>:0</b> ka matlab platform-wide label space hai: same label value ka matlab same hai, chahe woh kisi bhi interface par aaye. Frame-mode (Ethernet) MPLS ke liye yeh normal hai.</p>
<p><b>LDP router ID</b> aise chuna jaata hai:</p>
<ol>
<li><code>mpls ldp router-id &lt;interface&gt;</code> wale interface ka address, agar woh interface up hai.</li>
<li>Warna, kisi up loopback interface par sabse bada IP address.</li>
<li>Warna, kisi bhi up interface par sabse bada IP address.</li>
</ol>
<p>Default mein <b>transport address</b>, yaani TCP session ke liye use hone wala IP, LDP router ID hi hota hai. Isse LDP ka sabse important rule banta hai: <b>har router ke paas apne neighbour ke LDP router ID tak route hona chahiye</b>. Link subnet tak route kaafi nahi hai.</p>

<h3>Step 2: TCP session</h3>
<p>Jab dono routers ek doosre ke Hellos sun lete hain, to <b>bade transport address</b> wala <b>active</b> role leta hai aur doosre ke transport address par <b>TCP port 646</b> ka connection kholta hai. Doosri side listen karti hai (passive role). Yeh TCP connection wali line mein dikhta hai: active router random high source port use karta hai, aur passive router ki side port 646 dikhati hai.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="LDP session establishment">
<rect x="60" y="20" width="160" height="40" rx="8" fill="#bae6fd"/><text x="140" y="45" text-anchor="middle" class="svg-ink" font-size="13">PE1 1.1.1.1</text>
<rect x="420" y="20" width="160" height="40" rx="8" fill="#ddd6fe"/><text x="500" y="45" text-anchor="middle" class="svg-ink" font-size="13">P1 2.2.2.2</text>
<line x1="140" y1="60" x2="140" y2="260" stroke="#64748b" stroke-dasharray="3 3"/><line x1="500" y1="60" x2="500" y2="260" stroke="#64748b" stroke-dasharray="3 3"/>
<line x1="140" y1="85" x2="500" y2="85" stroke="#64748b" marker-end="url(#b7)"/><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">Hello UDP 646 se 224.0.0.2</text>
<line x1="500" y1="110" x2="140" y2="110" stroke="#64748b" marker-end="url(#b7)"/><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="12">Hello UDP 646 se 224.0.0.2</text>
<line x1="500" y1="145" x2="140" y2="145" stroke="#64748b" stroke-width="2" marker-end="url(#b7)"/><text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">TCP 1.1.1.1:646 par (P1 active)</text>
<line x1="140" y1="180" x2="500" y2="180" stroke="#64748b" marker-end="url(#b7)"/><line x1="500" y1="188" x2="140" y2="188" stroke="#64748b" marker-end="url(#b7)"/><text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">Initialization + Keepalive</text>
<line x1="140" y1="222" x2="500" y2="222" stroke="#64748b" marker-end="url(#b7)"/><line x1="500" y1="230" x2="140" y2="230" stroke="#64748b" marker-end="url(#b7)"/><text x="320" y="217" text-anchor="middle" class="svg-muted" font-size="12">Address + Label Mapping</text>
<text x="320" y="258" text-anchor="middle" class="svg-ink" font-size="12">State: Oper</text>
<defs><marker id="b7" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#64748b"/></marker></defs>
</svg><p class="cap">UDP multicast se discovery, phir bade transport address wala TCP session kholta hai, phir initialization aur label exchange.</p></div>

<h3>Step 3: initialization aur label exchange</h3>
<p>TCP par routers <b>Initialization</b> messages exchange karte hain (protocol version, timers, label distribution mode, receiver ka LDP ID) aur unhe ek <b>Keepalive</b> se confirm karte hain. Ab session <b>Operational</b> hai. Phir har router bhejta hai:</p>
<ul>
<li><b>Address</b> messages: apne saare interface IP addresses. Isi se P1 jaanta hai ki next hop 10.0.23.3 LDP ID 3.3.3.3:0 ka hai, taaki woh LIB se sahi remote label chun sake.</li>
<li><b>Label Mapping</b> messages: har FEC ke liye ek binding, "prefix → label".</li>
<li>Baad mein, routes ya interfaces jaane par <b>Label Withdraw</b>, <b>Label Release</b> aur <b>Address Withdraw</b>, aur errors ke liye <b>Notification</b>.</li>
</ul>
<p>Keepalives TCP session ko zinda rakhte hain: default <b>60 seconds</b> interval, <b>180 seconds</b> session hold time.</p>

<div class="eg"><p><b>Worked example.</b> PE1 (LDP ID 1.1.1.1) aur P1 (2.2.2.2) 10.0.12.0/24 share karte hain. Dono apne link addresses se 224.0.0.2 par Hellos bhejte hain. 2.2.2.2, 1.1.1.1 se bada hai, isliye P1 2.2.2.2 port 51233 (random) se 1.1.1.1 port 646 par TCP kholta hai. PE1 ke paas 2.2.2.2/32 ka route aur P1 ke paas 1.1.1.1/32 ka route hona chahiye, dono OSPF se seekhe hue kyunki loopbacks OSPF network statements mein hain. PE1 par <code>show mpls ldp neighbor</code> "TCP connection: 2.2.2.2.51233 - 1.1.1.1.646" dikhata hai.</p></div>

<h3>LDP-IGP synchronization (concept)</h3>
<p>LDP IGP par depend karta hai, par IGP ko LDP ke baare mein kuch nahi pata. Jab ek link up hota hai, OSPF use us link par LDP session ke labels exchange karne se kuch seconds pehle hi use karna shuru kar sakta hai. Us window mein traffic naye link par <b>bina label</b> ke jaata hai. Plain IP ke liye yeh chal sakta hai, par BGP-free core ya L3VPN mein iska matlab <b>blackholed traffic</b> hai, kyunki P routers ke paas customer ya internet prefixes ka route nahi hota.</p>
<pre class="code">router ospf 1
 mpls ldp sync            <span class="c">! LDP ready hone tak OSPF link par max metric advertise karta hai</span></pre>
<p><b>LDP-IGP sync</b> ke saath OSPF link ko tab tak maximum metric ke saath advertise karta hai jab tak LDP up na ho aur labels exchange na ho jaayein, isliye traffic us link se tab tak bachta hai jab tak woh labels na le ja sake. Ek related feature, <b>LDP session protection</b>, link flap hone par alternate path par targeted LDP session zinda rakhta hai, taaki labels dobara seekhne na padein.</p>

<div class="warn"><p><b>Common galti.</b> Loopback ko LDP router ID banana par use IGP mein advertise na karna. Hellos aate hain, discovery neighbour dikhata hai, par TCP session kabhi nahi banta kyunki transport address tak route nahi hai. Troubleshooting lab mein yahi fault hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Hellos: UDP 646, 224.0.0.2. Session: TCP 646. Dono port 646 use karte hain. Bade transport address wala router active hota hai. LDP ID format router-id:label-space hai, aur :0 ka matlab per-platform label space.</p></div>

<div class="scn"><h4>Link wapas aane ke baad blackhole</h4><p>BGP-free core wale ek ISP ko har baar ek khaas core link flap se recover hone par do minute ka dropped internet traffic dikhta tha. OSPF link ko seconds mein wapas use mein le aata tha, par LDP ko labels exchange poora karne mein zyada time lagta tha, isliye remote BGP next hops ki taraf PE traffic P router se bina label ke nikalta tha aur P router, jiske paas BGP table nahi thi, use drop kar deta tha. Saare core routers par OSPF ke andar <code>mpls ldp sync</code> on karne se link LDP ready hone tak maximum metric par raha, aur drops band ho gaye.</p><p><b>Seekh:</b> BGP-free core mein core ke andar unlabelled packet ek dropped packet hai; LDP ko IGP ke saath synchronise karo.</p></div>

<div class="iv"><p class="q">"LDP session kaise up hota hai? Kaunse ports use hote hain?"</p><p>Routers har 5 seconds 224.0.0.2 par UDP 646 par link Hellos bhejte hain, jismein unka LDP ID aur transport address hota hai. Jab dono ek doosre ko discover kar lete hain, bade transport address wala router peer ke transport address par port 646 ka TCP kholta hai. Woh Initialization aur Keepalive messages exchange karte hain, phir Address aur Label Mapping messages. Critical point jodo: har router ko doosre ke transport address tak route chahiye, normally woh loopback jo LDP router ID hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Discovery: UDP 646, 224.0.0.2 par Hellos, har 5 s, hold 15 s; targeted Hellos unicast hote hain.</li>
<li>Session: TCP 646, bade transport address wala kholta hai; keepalive 60 s, hold 180 s.</li>
<li>LDP ID = router-id:0; router ID configured interface, warna sabse bada loopback, warna sabse bada interface IP.</li>
<li>Transport address (default: router ID) IGP se reachable hona chahiye.</li>
<li>Address messages next-hop IPs ko LDP peers se map karte hain; LDP-IGP sync LDP converge hone tak blackholes rokta hai.</li>
</ul></div>
`}};export{e as default};