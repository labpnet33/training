var e={id:`capture-basics`,h:{en:`Captures: the CCTV camera on every interface`,hi:`Captures: har interface par CCTV camera`},body:{en:`
<p>A shop owner who suspects that deliveries never arrive does not argue with the courier company. She points a CCTV camera at the loading door and sets a motion filter so it records only vans, not every passer-by. The ASA has the same camera built in. The <code>capture</code> command records real packets on one interface into memory, filtered to exactly the flow you care about. Whatever the ASA's policy later decides, the camera on the ingress interface has already seen the packet arrive.</p>

<h3>What a capture sees</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Capture points">
<rect x="230" y="60" width="180" height="90" rx="10" fill="#fed7aa"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="14">NK-ASA</text><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">ACL, NAT, inspection</text><text x="320" y="133" text-anchor="middle" class="svg-muted" font-size="12">happen in between</text>
<rect x="20" y="80" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="85" y="102" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="85" y="119" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.10</text>
<rect x="490" y="80" width="130" height="50" rx="8" fill="#bae6fd"/><text x="555" y="102" text-anchor="middle" class="svg-ink" font-size="13">INET</text><text x="555" y="119" text-anchor="middle" class="svg-muted" font-size="12">8.8.8.8</text>
<line x1="150" y1="105" x2="230" y2="105" stroke="#64748b" stroke-width="2"/><line x1="410" y1="105" x2="490" y2="105" stroke="#64748b" stroke-width="2"/>
<circle cx="190" cy="105" r="10" fill="#fde68a"/><circle cx="450" cy="105" r="10" fill="#fde68a"/>
<text x="190" y="50" text-anchor="middle" class="svg-accent" font-size="12">capture CIN (inside)</text>
<text x="450" y="50" text-anchor="middle" class="svg-accent" font-size="12">capture COUT (outside)</text>
<text x="190" y="175" text-anchor="middle" class="svg-ink" font-size="12">src 10.0.1.10 (real)</text>
<text x="450" y="175" text-anchor="middle" class="svg-ink" font-size="12">src 203.0.113.2 (mapped)</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">A match filter captures both directions of the flow</text>
</svg><p class="cap">Each capture is tied to one interface and shows the addresses that exist on that wire.</p></div>
<ul>
<li>A capture is bound to <b>one interface</b> (the <code>nameif</code>).</li>
<li>On the <b>ingress</b> interface it records packets <b>before</b> the ACL, so it sees packets that are later dropped.</li>
<li>On the <b>egress</b> interface it records packets <b>after</b> NAT, with translated addresses.</li>
<li>A <code>match</code> filter is <b>bidirectional</b>: <code>match tcp any host 203.0.113.3</code> records both the partner's SYN and the reply from 203.0.113.3.</li>
<li>Packets go into a RAM buffer (512 KB by default). When it is full, the capture stops recording unless you make it circular.</li>
</ul>

<h3>Creating, reading and removing captures</h3>
<pre class="code"><span class="c">! capture HTTPS to the portal on the outside interface</span>
capture CAP interface outside match tcp any host 203.0.113.3 eq 443
<span class="c">! same idea with a named ACL as the filter (handy for several conditions)</span>
access-list CAPACL extended permit tcp host 198.51.100.10 host 203.0.113.3
access-list CAPACL extended permit tcp host 203.0.113.3 host 198.51.100.10
capture CAP2 interface outside access-list CAPACL
<span class="c">! useful options</span>
capture CAP3 interface outside buffer 1048576 circular-buffer match tcp any host 203.0.113.3
capture CAP4 interface outside headers-only match tcp any host 203.0.113.3
<span class="c">! reading</span>
show capture
show capture CAP
show capture CAP detail
show capture CAP dump
<span class="c">! empty the buffer but keep the capture, or remove it</span>
clear capture CAP
no capture CAP</pre>
<p><code>show capture</code> with no name lists every capture, its interface, its filter and how many bytes it holds. It is your checklist of forgotten captures. <code>detail</code> adds MAC addresses, TTL and IP ID; <code>dump</code> adds a hex dump.</p>

<pre class="out">NK-ASA# show capture
<span class="hl">capture CAP type raw-data interface outside [Capturing - 370 bytes]</span>
  match tcp any host 203.0.113.3

NK-ASA# show capture CAP

5 packets captured

   1: 20:59:46.501000       198.51.100.10.55191 &gt; 203.0.113.3.443: <span class="hl">S</span> 0:0(0) win 64240
   2: 20:59:46.502000       203.0.113.3.443 &gt; 198.51.100.10.55191: <span class="hl">S</span> 0:0(0) <span class="hl">ack</span> 1 win 64240
   3: 20:59:46.503000       198.51.100.10.55191 &gt; 203.0.113.3.443: . 1:1(0) ack 1 win 64240
   4: 20:59:46.504000       198.51.100.10.55191 &gt; 203.0.113.3.443: P 1:1(0) ack 1 win 64240
   5: 20:59:46.505000       203.0.113.3.443 &gt; 198.51.100.10.55191: P 1:1(0) ack 60 win 64240
5 packets shown</pre>
<p>That is a healthy flow, taken from the lab after the fix: SYN, SYN-ACK, ACK, then data (P = push). On real hardware the sequence numbers are large random values and TCP options appear after the window, but the flag letters are the same.</p>

<h3>Reading TCP patterns</h3>
<table class="cmp"><tr><th>What you see</th><th>What it means</th></tr>
<tr><td><code>S</code> then <code>S ack</code> then <code>.</code></td><td>Three-way handshake completed.</td></tr>
<tr><td>The same <code>S</code> repeated after about 1, 2 and 4 seconds</td><td>Retransmissions: nobody answered, or the answer was dropped.</td></tr>
<tr><td><code>S</code> then <code>R</code> from the server</td><td>The server is reachable but refuses the port (not listening).</td></tr>
<tr><td>Nothing at all</td><td>Packets never reached this interface, or your filter is wrong.</td></tr>
<tr><td><code>F</code> and <code>R</code> in the middle of data</td><td>A normal close (FIN) or an abort (RST); check who sent it.</td></tr></table>

<h3>Real-time captures</h3>
<p><code>capture CAP interface outside real-time match tcp any host 203.0.113.3</code> prints each packet to your terminal as it is captured. It is convenient for a quick look while someone retries, but it stops after a limited number of packets and printing costs CPU, so keep the filter tight and never use it for bulk traffic over a slow console.</p>

<div class="eg"><p><b>Worked example.</b> A capture on dmz for WEB shows three lines: <code>198.51.100.10.40000 &gt; 10.0.2.10.443: S</code> at 10:00:00.1, again at 10:00:01.1, and again at 10:00:03.1. The gaps of 1 s and 2 s are the client's TCP retransmission timer doubling. The SYN reached the DMZ, so the ASA's ACL and NAT are fine; WEB never replied. Your next checks are on the server: is it listening on 443, does its host firewall allow the source, and is its default gateway 10.0.2.1?</p></div>

<div class="warn"><p><b>Common mistake.</b> Leaving captures running after the ticket is closed. They hold memory, a circular one keeps working forever, and the next engineer inherits a mystery. Finish every capture session with <code>show capture</code> and <code>no capture</code> for each name.</p></div>

<div class="exam"><p><b>Exam trap.</b> A capture on the ingress interface records the packet even if the ACL then drops it. "Seen in the ingress capture" therefore proves arrival, not permission. Also remember that the match filter is bidirectional; you do not need a second line for replies.</p></div>

<div class="scn"><h4>The filter that looked the wrong way</h4><p>A junior engineer was asked whether HTTPS for the public server 203.0.113.3 reached the firewall. He wrote <code>capture C1 interface outside match tcp any host 10.0.2.10</code>, saw 0 packets and reported "traffic is not arriving". A senior colleague pointed out that on the outside wire the server only exists as 203.0.113.3; the private address never appears there. With the filter corrected, the capture filled with SYNs within seconds, and the investigation moved to the ACL.</p><p><b>Lesson:</b> write every capture filter with the addresses that exist on that interface: mapped on the outside, real on the inside and DMZ.</p></div>

<div class="iv"><p class="q">"What does an ASA capture tell you that packet-tracer cannot?"</p><p>A capture shows real packets: that the client actually sent them, with which addresses and ports, whether they were retransmitted, and whether the other side replied. packet-tracer only simulates one packet through the configuration. Mention that the ingress capture sees packets before the ACL, that match filters are bidirectional, and that you remove captures when done.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>capture NAME interface IFC match PROTO SRC DST</code>; filters are bidirectional.</li>
<li>Ingress capture = before ACL; egress capture = after NAT.</li>
<li>Filter with the addresses that exist on that wire.</li>
<li>Repeated SYNs = no answer; SYN then RST = port closed; nothing = never arrived or wrong filter.</li>
<li><code>show capture</code> lists all captures; <code>no capture NAME</code> removes one.</li>
</ul></div>
`,hi:`
<p>Jis dukaan maalik ko shak hai ki deliveries kabhi pahunchti hi nahi, woh courier company se bahas nahi karti. Woh loading door par ek CCTV camera lagati hai aur motion filter set karti hai taaki woh sirf vans record kare, har raahgeer nahi. ASA mein yahi camera built-in hai. <code>capture</code> command ek interface par real packets ko memory mein record karti hai, bilkul usi flow tak filter karke jiski aapko parwaah hai. ASA ki policy baad mein jo bhi decide kare, ingress interface ka camera packet ko aate hue pehle hi dekh chuka hota hai.</p>

<h3>Capture kya dekhta hai</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Capture points">
<rect x="230" y="60" width="180" height="90" rx="10" fill="#fed7aa"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="14">NK-ASA</text><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">ACL, NAT, inspection</text><text x="320" y="133" text-anchor="middle" class="svg-muted" font-size="12">beech mein hote hain</text>
<rect x="20" y="80" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="85" y="102" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="85" y="119" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.10</text>
<rect x="490" y="80" width="130" height="50" rx="8" fill="#bae6fd"/><text x="555" y="102" text-anchor="middle" class="svg-ink" font-size="13">INET</text><text x="555" y="119" text-anchor="middle" class="svg-muted" font-size="12">8.8.8.8</text>
<line x1="150" y1="105" x2="230" y2="105" stroke="#64748b" stroke-width="2"/><line x1="410" y1="105" x2="490" y2="105" stroke="#64748b" stroke-width="2"/>
<circle cx="190" cy="105" r="10" fill="#fde68a"/><circle cx="450" cy="105" r="10" fill="#fde68a"/>
<text x="190" y="50" text-anchor="middle" class="svg-accent" font-size="12">capture CIN (inside)</text>
<text x="450" y="50" text-anchor="middle" class="svg-accent" font-size="12">capture COUT (outside)</text>
<text x="190" y="175" text-anchor="middle" class="svg-ink" font-size="12">src 10.0.1.10 (real)</text>
<text x="450" y="175" text-anchor="middle" class="svg-ink" font-size="12">src 203.0.113.2 (mapped)</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Match filter flow ki dono directions capture karta hai</text>
</svg><p class="cap">Har capture ek interface se juda hota hai aur wahi addresses dikhata hai jo us wire par exist karte hain.</p></div>
<ul>
<li>Capture <b>ek interface</b> (<code>nameif</code>) se bandha hota hai.</li>
<li><b>Ingress</b> interface par yeh packets ko ACL se <b>pehle</b> record karta hai, isliye woh packets bhi dikhte hain jo baad mein drop hote hain.</li>
<li><b>Egress</b> interface par yeh packets ko NAT ke <b>baad</b> record karta hai, translated addresses ke saath.</li>
<li><code>match</code> filter <b>bidirectional</b> hai: <code>match tcp any host 203.0.113.3</code> partner ka SYN aur 203.0.113.3 ka reply dono record karta hai.</li>
<li>Packets RAM buffer mein jaate hain (default 512 KB). Bhar jaane par capture record karna band kar deta hai, jab tak aap use circular na banao.</li>
</ul>

<h3>Captures banana, padhna aur hatana</h3>
<pre class="code"><span class="c">! outside interface par portal ka HTTPS capture karo</span>
capture CAP interface outside match tcp any host 203.0.113.3 eq 443
<span class="c">! wahi idea, filter ke roop mein named ACL ke saath (kai conditions ke liye kaam ka)</span>
access-list CAPACL extended permit tcp host 198.51.100.10 host 203.0.113.3
access-list CAPACL extended permit tcp host 203.0.113.3 host 198.51.100.10
capture CAP2 interface outside access-list CAPACL
<span class="c">! useful options</span>
capture CAP3 interface outside buffer 1048576 circular-buffer match tcp any host 203.0.113.3
capture CAP4 interface outside headers-only match tcp any host 203.0.113.3
<span class="c">! padhna</span>
show capture
show capture CAP
show capture CAP detail
show capture CAP dump
<span class="c">! buffer khaali karo par capture rakho, ya use hatao</span>
clear capture CAP
no capture CAP</pre>
<p>Bina naam ke <code>show capture</code> har capture, uska interface, uska filter aur usmein kitne bytes hain, list karta hai. Yeh bhoole hue captures ki aapki checklist hai. <code>detail</code> MAC addresses, TTL aur IP ID jodta hai; <code>dump</code> hex dump jodta hai.</p>

<pre class="out">NK-ASA# show capture
<span class="hl">capture CAP type raw-data interface outside [Capturing - 370 bytes]</span>
  match tcp any host 203.0.113.3

NK-ASA# show capture CAP

5 packets captured

   1: 20:59:46.501000       198.51.100.10.55191 &gt; 203.0.113.3.443: <span class="hl">S</span> 0:0(0) win 64240
   2: 20:59:46.502000       203.0.113.3.443 &gt; 198.51.100.10.55191: <span class="hl">S</span> 0:0(0) <span class="hl">ack</span> 1 win 64240
   3: 20:59:46.503000       198.51.100.10.55191 &gt; 203.0.113.3.443: . 1:1(0) ack 1 win 64240
   4: 20:59:46.504000       198.51.100.10.55191 &gt; 203.0.113.3.443: P 1:1(0) ack 1 win 64240
   5: 20:59:46.505000       203.0.113.3.443 &gt; 198.51.100.10.55191: P 1:1(0) ack 60 win 64240
5 packets shown</pre>
<p>Yeh ek healthy flow hai, fix ke baad lab se liya gaya: SYN, SYN-ACK, ACK, phir data (P = push). Real hardware par sequence numbers bade random values hote hain aur window ke baad TCP options dikhte hain, par flag letters wahi rehte hain.</p>

<h3>TCP patterns padhna</h3>
<table class="cmp"><tr><th>Jo dikhta hai</th><th>Matlab</th></tr>
<tr><td><code>S</code> phir <code>S ack</code> phir <code>.</code></td><td>Three-way handshake poora hua.</td></tr>
<tr><td>Wahi <code>S</code> lagbhag 1, 2 aur 4 second baad dohraya gaya</td><td>Retransmissions: kisi ne jawab nahi diya, ya jawab drop hua.</td></tr>
<tr><td><code>S</code> phir server se <code>R</code></td><td>Server reachable hai par port refuse karta hai (listen nahi kar raha).</td></tr>
<tr><td>Kuch bhi nahi</td><td>Packets is interface tak kabhi pahunche hi nahi, ya aapka filter galat hai.</td></tr>
<tr><td>Data ke beech mein <code>F</code> aur <code>R</code></td><td>Normal close (FIN) ya abort (RST); check karo kisne bheja.</td></tr></table>

<h3>Real-time captures</h3>
<p><code>capture CAP interface outside real-time match tcp any host 203.0.113.3</code> har packet ko capture hote hi aapke terminal par print karta hai. Jab koi retry kar raha ho tab jaldi dekhne ke liye yeh convenient hai, par yeh limited packets ke baad ruk jaata hai aur printing mein CPU lagta hai, isliye filter tight rakho aur dheeme console par bulk traffic ke liye kabhi use mat karo.</p>

<div class="eg"><p><b>Worked example.</b> WEB ke liye dmz par capture teen lines dikhata hai: <code>198.51.100.10.40000 &gt; 10.0.2.10.443: S</code> 10:00:00.1 par, phir 10:00:01.1 par, aur phir 10:00:03.1 par. 1 s aur 2 s ke gaps client ke TCP retransmission timer ke double hone ki wajah se hain. SYN DMZ tak pahuncha, isliye ASA ki ACL aur NAT theek hain; WEB ne kabhi reply nahi kiya. Aapke agle checks server par hain: kya woh 443 par listen kar raha hai, kya uska host firewall source ko allow karta hai, aur kya uska default gateway 10.0.2.1 hai?</p></div>

<div class="warn"><p><b>Common galti.</b> Ticket band hone ke baad bhi captures chalte chhod dena. Woh memory pakde rehte hain, circular capture hamesha chalta rehta hai, aur agla engineer ek rahasya viraasat mein paata hai. Har capture session <code>show capture</code> aur har naam ke liye <code>no capture</code> se khatam karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Ingress interface ka capture packet record karta hai chahe ACL use baad mein drop kar de. Isliye "ingress capture mein dikha" arrival saabit karta hai, permission nahi. Yeh bhi yaad rakho ki match filter bidirectional hai; replies ke liye doosri line nahi chahiye.</p></div>

<div class="scn"><h4>Woh filter jo galat taraf dekh raha tha</h4><p>Ek junior engineer se poocha gaya ki public server 203.0.113.3 ka HTTPS firewall tak pahunch raha hai ya nahi. Usne <code>capture C1 interface outside match tcp any host 10.0.2.10</code> likha, 0 packets dekhe aur report kiya "traffic nahi aa raha". Ek senior colleague ne bataya ki outside wire par server sirf 203.0.113.3 ke roop mein exist karta hai; private address wahan kabhi dikhta hi nahi. Filter theek karne par capture seconds mein SYNs se bhar gaya, aur investigation ACL ki taraf badhi.</p><p><b>Seekh:</b> har capture filter un addresses se likho jo us interface par exist karte hain: outside par mapped, inside aur DMZ par real.</p></div>

<div class="iv"><p class="q">"ASA capture aapko kya batata hai jo packet-tracer nahi bata sakta?"</p><p>Capture real packets dikhata hai: ki client ne sach mein unhe bheja, kin addresses aur ports ke saath, kya woh retransmit hue, aur kya doosri side ne reply kiya. packet-tracer configuration ke through sirf ek packet simulate karta hai. Mention karo ki ingress capture packets ko ACL se pehle dekhta hai, match filters bidirectional hain, aur kaam ke baad aap captures hata dete ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>capture NAME interface IFC match PROTO SRC DST</code>; filters bidirectional hain.</li>
<li>Ingress capture = ACL se pehle; egress capture = NAT ke baad.</li>
<li>Filter un addresses se likho jo us wire par exist karte hain.</li>
<li>Baar baar SYN = koi jawab nahi; SYN phir RST = port band; kuch nahi = kabhi pahuncha nahi ya filter galat.</li>
<li><code>show capture</code> saare captures list karta hai; <code>no capture NAME</code> ek ko hatata hai.</li>
</ul></div>
`}};export{e as default};