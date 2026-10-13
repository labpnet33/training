var e={id:`summary-exam-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Back at the airport from chapter 1: the scanner never got faster. What changed is that the airport now puts a band on each passenger at the entrance (classification and marking at the trust boundary), opens a priority lane with a fixed capacity (LLQ), guarantees other lanes a share (CBWFQ), asks low-priority travellers to come back later before the hall overflows (WRED), and meters arrivals to match the gates (shaping and policing). That is the whole of ENCOR objective 1.6 in one picture.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="End-to-end QoS path">
<rect x="5" y="50" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="65" y="75" text-anchor="middle" class="svg-ink" font-size="12">classify + mark</text><text x="65" y="93" text-anchor="middle" class="svg-muted" font-size="12">ingress, trust edge</text>
<rect x="135" y="50" width="120" height="60" rx="8" fill="#fed7aa"/><text x="195" y="75" text-anchor="middle" class="svg-ink" font-size="12">police</text><text x="195" y="93" text-anchor="middle" class="svg-muted" font-size="12">ingress or egress</text>
<rect x="265" y="50" width="120" height="60" rx="8" fill="#bae6fd"/><text x="325" y="75" text-anchor="middle" class="svg-ink" font-size="12">LLQ / CBWFQ</text><text x="325" y="93" text-anchor="middle" class="svg-muted" font-size="12">egress only</text>
<rect x="395" y="50" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="450" y="75" text-anchor="middle" class="svg-ink" font-size="12">WRED</text><text x="450" y="93" text-anchor="middle" class="svg-muted" font-size="12">egress, TCP</text>
<rect x="515" y="50" width="120" height="60" rx="8" fill="#fde68a"/><text x="575" y="75" text-anchor="middle" class="svg-ink" font-size="12">shape (HQoS)</text><text x="575" y="93" text-anchor="middle" class="svg-muted" font-size="12">egress only</text>
<line x1="125" y1="80" x2="135" y2="80" stroke="#64748b" stroke-width="2"/><line x1="255" y1="80" x2="265" y2="80" stroke="#64748b" stroke-width="2"/><line x1="385" y1="80" x2="395" y2="80" stroke="#64748b" stroke-width="2"/><line x1="505" y1="80" x2="515" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="30" text-anchor="middle" class="svg-accent" font-size="12">DiffServ toolkit along a packet's path</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">all configured with MQC: class-map, policy-map, service-policy</text>
</svg><p class="cap">The whole module in one line: mark at the edge, then act on the mark wherever congestion can happen.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>State the voice targets (150 ms one-way, 30 ms jitter, 1% loss) and calculate a G.711 call (80 kbps at L3, 87.2 kbps on Ethernet).</li>
<li>Compare best effort, IntServ (RSVP, per flow) and DiffServ (DSCP, PHB, per class).</li>
<li>Build ACL-based class-maps, explain NBAR <code>match protocol</code>, and place a trust boundary with conditional trust.</li>
<li>Convert DSCP names and numbers: EF 46, AFxy = 8x + 2y, CSx = 8x; explain AF drop precedence.</li>
<li>Explain CoS, IP Precedence, EXP and 802.11 UP, and which survive routing.</li>
<li>Write MQC from memory; explain match-any vs match-all, top-down evaluation and class-default.</li>
<li>Configure LLQ and CBWFQ outbound and explain the implicit priority policer.</li>
<li>Explain tail drop problems and configure DSCP-based WRED.</li>
<li>Calculate Tc = Bc / CIR, compare policing and shaping, and build a parent shaper with a child queuing policy.</li>
<li>Map WMM access categories and choose the right WLC profile (Platinum, Gold, Silver, Bronze).</li>
<li>Read <code>show policy-map interface</code> and fix a policy attached in the wrong direction.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>DSCP</dt><dd>6-bit marking in the IP header, 0 to 63, used by DiffServ.</dd>
<dt>PHB</dt><dd>Per-hop behaviour: the treatment a router gives a DSCP (EF, AF, CS, DF).</dd>
<dt>Trust boundary</dt><dd>The point from which existing markings are believed.</dd>
<dt>MQC</dt><dd>Modular QoS CLI: class-map, policy-map, service-policy.</dd>
<dt>CBWFQ</dt><dd>Per-class minimum bandwidth guarantee during congestion.</dd>
<dt>LLQ</dt><dd>CBWFQ plus a strict-priority queue, policed during congestion.</dd>
<dt>WRED</dt><dd>Early random drops with separate thresholds per marking.</dd>
<dt>CIR, Bc, Be, Tc</dt><dd>Token bucket rate, committed burst, excess burst, interval (Tc = Bc / CIR).</dd>
<dt>HQoS</dt><dd>A parent shaper with a nested child queuing policy.</dd>
<dt>EDCA / WMM</dt><dd>Wi-Fi contention-based QoS with four access categories.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Voice</td><td>EF 46, CoS 5, UP 6, IPP 5; 150 ms / 30 ms / 1%</td></tr>
<tr><td>Video</td><td>AF41 34, CoS 4, UP 4 to 5</td></tr>
<tr><td>Signalling</td><td>CS3 24</td></tr>
<tr><td>AF table</td><td>AF11 10, AF21 18, AF31 26, AF41 34; AFx3 dropped first</td></tr>
<tr><td>Field sizes</td><td>DSCP 6 bits; CoS, IPP, EXP, UP 3 bits</td></tr>
<tr><td>Direction</td><td>queuing and shaping output only; marking and policing both</td></tr>
<tr><td>Default class-map</td><td>match-all</td></tr>
<tr><td>Policer default Bc</td><td>CIR/32 bytes (250 ms); police Bc in bytes, shape Bc in bits</td></tr>
<tr><td>WLC profiles</td><td>Platinum voice, Gold video, Silver best effort (default), Bronze background</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! classify and mark at the trust boundary</span>
class-map match-any VOICE
 match access-group name VOICE-RTP
policy-map MARK-IN
 class VOICE
  set dscp ef
 class BULK
  set dscp af11
  police 3000000 conform-action transmit exceed-action drop
interface GigabitEthernet0/1
 service-policy input MARK-IN
<span class="c">! queue at the WAN egress</span>
policy-map WAN-OUT
 class EF-Q
  priority 1000
 class AF11-Q
  bandwidth 2000
  random-detect dscp-based
 class class-default
  fair-queue
interface GigabitEthernet0/0
 service-policy output WAN-OUT
<span class="c">! verify</span>
show class-map
show policy-map WAN-OUT
show policy-map interface GigabitEthernet0/0 output
show interfaces GigabitEthernet0/0</pre>

<div class="eg"><p><b>Worked example: a two-minute exam drill.</b> A 20 Mbps WAN carries 40 G.711 calls. Voice needs 40 × 87.2 kbps = 3.49 Mbps on Ethernet, so <code>priority 4000</code> covers it with a little headroom, under one third of the link. A shaper at 20 Mbps with Tc 10 ms has Bc = 200,000 bits. A packet marked AF23 is DSCP 8 × 2 + 2 × 3 = 22, class 2 with high drop precedence, the first AF2 packet WRED drops.</p></div>

<div class="warn"><p><b>Common mistakes, one last time.</b> Marking without a matching queuing policy downstream; policies attached in the wrong direction; video in the priority queue; WRED on voice; LLQ on a sub-rate interface without a parent shaper; a voice WLAN left on Silver.</p></div>

<div class="exam"><p><b>Exam trap.</b> ENCOR asks you to <b>interpret</b> configurations. Practise reading a policy and predicting: which class a packet lands in, whether the policy can be attached in that direction, and what the counters will show under congestion.</p></div>

<div class="scn"><h4>The ten-minute QoS audit</h4><p>A new network lead audited 40 branches using only what this module teaches. On each WAN router she checked: MARK-IN attached input on the LAN, WAN-OUT or an HQoS parent attached output on the WAN, EF counters increasing with zero b/w exceed drops, and drops only in class-default. Six branches failed: four had policies in the wrong direction, one had LLQ on a 1 Gbps port feeding a 50 Mbps service, and one marked guest Wi-Fi as Platinum. All were fixed in one change window.</p><p><b>Lesson:</b> a short checklist, applied to counters rather than configurations, finds most QoS faults quickly.</p></div>

<div class="iv"><p class="q">"Design QoS for a branch with IP phones, video meetings and backups over a 50 Mbps WAN on a 1 Gbps port."</p><p>Strong answer: trust the phones conditionally at the access port and re-mark everything else at the edge: voice EF, video AF41, signalling CS3, backups AF11, the rest DF. On the WAN router build HQoS: a parent shaper at 50 Mbps with a child policy giving EF a priority queue sized for peak calls, video and signalling bandwidth guarantees, backups a smaller guarantee with WRED, and fair-queue in class-default. Apply a matching policy at HQ for the reverse direction, confirm the provider honours DSCP, use Platinum for the voice WLAN, and verify with show policy-map interface under load.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>QoS decides who waits and who is dropped during congestion; DiffServ is the enterprise model.</li>
<li>Classify and mark once at the trust boundary; every later hop acts on DSCP.</li>
<li>LLQ for voice, CBWFQ for data, WRED for TCP classes, shaping and HQoS for sub-rate links.</li>
<li>Wireless: WMM access categories, DSCP to UP mapping, WLC metal profiles as a ceiling.</li>
<li>Verify with <code>show policy-map interface</code> under load; zero counters mean classification or direction.</li>
</ul></div>
`,hi:`
<p>Chapter 1 ke airport par wapas: scanner kabhi tez nahi hua. Badla yeh ki airport ab entrance par har passenger ko band lagata hai (trust boundary par classification aur marking), fixed capacity wali priority lane kholta hai (LLQ), baaki lanes ko hissa guarantee karta hai (CBWFQ), hall overflow hone se pehle low-priority musafiron ko baad mein aane ko kehta hai (WRED), aur gates ke hisaab se aane walon ko meter karta hai (shaping aur policing). Yahi ENCOR objective 1.6 ek tasveer mein hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="End-to-end QoS path">
<rect x="5" y="50" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="65" y="75" text-anchor="middle" class="svg-ink" font-size="12">classify + mark</text><text x="65" y="93" text-anchor="middle" class="svg-muted" font-size="12">ingress, trust edge</text>
<rect x="135" y="50" width="120" height="60" rx="8" fill="#fed7aa"/><text x="195" y="75" text-anchor="middle" class="svg-ink" font-size="12">police</text><text x="195" y="93" text-anchor="middle" class="svg-muted" font-size="12">ingress ya egress</text>
<rect x="265" y="50" width="120" height="60" rx="8" fill="#bae6fd"/><text x="325" y="75" text-anchor="middle" class="svg-ink" font-size="12">LLQ / CBWFQ</text><text x="325" y="93" text-anchor="middle" class="svg-muted" font-size="12">sirf egress</text>
<rect x="395" y="50" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="450" y="75" text-anchor="middle" class="svg-ink" font-size="12">WRED</text><text x="450" y="93" text-anchor="middle" class="svg-muted" font-size="12">egress, TCP</text>
<rect x="515" y="50" width="120" height="60" rx="8" fill="#fde68a"/><text x="575" y="75" text-anchor="middle" class="svg-ink" font-size="12">shape (HQoS)</text><text x="575" y="93" text-anchor="middle" class="svg-muted" font-size="12">sirf egress</text>
<line x1="125" y1="80" x2="135" y2="80" stroke="#64748b" stroke-width="2"/><line x1="255" y1="80" x2="265" y2="80" stroke="#64748b" stroke-width="2"/><line x1="385" y1="80" x2="395" y2="80" stroke="#64748b" stroke-width="2"/><line x1="505" y1="80" x2="515" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="30" text-anchor="middle" class="svg-accent" font-size="12">packet ke raaste par DiffServ toolkit</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">sab MQC se configure: class-map, policy-map, service-policy</text>
</svg><p class="cap">Poora module ek line mein: edge par mark karo, phir jahan bhi congestion ho sakta hai wahan mark par action lo.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Voice targets batao (150 ms one-way, 30 ms jitter, 1% loss) aur G.711 call calculate karo (L3 par 80 kbps, Ethernet par 87.2 kbps).</li>
<li>Best effort, IntServ (RSVP, per flow) aur DiffServ (DSCP, PHB, per class) compare karo.</li>
<li>ACL-based class-maps banao, NBAR <code>match protocol</code> samjhao, aur conditional trust ke saath trust boundary rakho.</li>
<li>DSCP names aur numbers convert karo: EF 46, AFxy = 8x + 2y, CSx = 8x; AF drop precedence samjhao.</li>
<li>CoS, IP Precedence, EXP aur 802.11 UP samjhao, aur kaunse routing ke baad bachte hain.</li>
<li>MQC zabaani likho; match-any vs match-all, upar se neeche evaluation aur class-default samjhao.</li>
<li>LLQ aur CBWFQ outbound configure karo aur implicit priority policer samjhao.</li>
<li>Tail drop ki problems samjhao aur DSCP-based WRED configure karo.</li>
<li>Tc = Bc / CIR calculate karo, policing aur shaping compare karo, aur child queuing policy wala parent shaper banao.</li>
<li>WMM access categories map karo aur sahi WLC profile chuno (Platinum, Gold, Silver, Bronze).</li>
<li><code>show policy-map interface</code> padho aur galat direction mein attached policy theek karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>DSCP</dt><dd>IP header mein 6-bit marking, 0 se 63, DiffServ use karta hai.</dd>
<dt>PHB</dt><dd>Per-hop behaviour: router DSCP ko jo treatment deta hai (EF, AF, CS, DF).</dd>
<dt>Trust boundary</dt><dd>Woh point jahan se existing markings par bharosa kiya jaata hai.</dd>
<dt>MQC</dt><dd>Modular QoS CLI: class-map, policy-map, service-policy.</dd>
<dt>CBWFQ</dt><dd>Congestion ke dauran per-class minimum bandwidth guarantee.</dd>
<dt>LLQ</dt><dd>CBWFQ plus strict-priority queue, congestion mein policed.</dd>
<dt>WRED</dt><dd>Har marking ke alag thresholds ke saath early random drops.</dd>
<dt>CIR, Bc, Be, Tc</dt><dd>Token bucket rate, committed burst, excess burst, interval (Tc = Bc / CIR).</dd>
<dt>HQoS</dt><dd>Nested child queuing policy wala parent shaper.</dd>
<dt>EDCA / WMM</dt><dd>Chaar access categories wala Wi-Fi contention-based QoS.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Voice</td><td>EF 46, CoS 5, UP 6, IPP 5; 150 ms / 30 ms / 1%</td></tr>
<tr><td>Video</td><td>AF41 34, CoS 4, UP 4 se 5</td></tr>
<tr><td>Signalling</td><td>CS3 24</td></tr>
<tr><td>AF table</td><td>AF11 10, AF21 18, AF31 26, AF41 34; AFx3 pehle drop</td></tr>
<tr><td>Field sizes</td><td>DSCP 6 bits; CoS, IPP, EXP, UP 3 bits</td></tr>
<tr><td>Direction</td><td>queuing aur shaping sirf output; marking aur policing dono</td></tr>
<tr><td>Default class-map</td><td>match-all</td></tr>
<tr><td>Policer default Bc</td><td>CIR/32 bytes (250 ms); police Bc bytes mein, shape Bc bits mein</td></tr>
<tr><td>WLC profiles</td><td>Platinum voice, Gold video, Silver best effort (default), Bronze background</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! trust boundary par classify aur mark</span>
class-map match-any VOICE
 match access-group name VOICE-RTP
policy-map MARK-IN
 class VOICE
  set dscp ef
 class BULK
  set dscp af11
  police 3000000 conform-action transmit exceed-action drop
interface GigabitEthernet0/1
 service-policy input MARK-IN
<span class="c">! WAN egress par queue</span>
policy-map WAN-OUT
 class EF-Q
  priority 1000
 class AF11-Q
  bandwidth 2000
  random-detect dscp-based
 class class-default
  fair-queue
interface GigabitEthernet0/0
 service-policy output WAN-OUT
<span class="c">! verify</span>
show class-map
show policy-map WAN-OUT
show policy-map interface GigabitEthernet0/0 output
show interfaces GigabitEthernet0/0</pre>

<div class="eg"><p><b>Worked example: do minute ka exam drill.</b> 20 Mbps WAN 40 G.711 calls le jaata hai. Voice ko Ethernet par 40 × 87.2 kbps = 3.49 Mbps chahiye, isliye <code>priority 4000</code> thode headroom ke saath cover karta hai, link ke ek tihaai se kam. Tc 10 ms wale 20 Mbps shaper ka Bc = 200,000 bits hai. AF23 marked packet DSCP 8 × 2 + 2 × 3 = 22 hai, class 2 high drop precedence ke saath, AF2 ka pehla packet jo WRED drop karta hai.</p></div>

<div class="warn"><p><b>Common galtiyan, aakhri baar.</b> Downstream matching queuing policy ke bina marking; galat direction mein attached policies; priority queue mein video; voice par WRED; parent shaper ke bina sub-rate interface par LLQ; Silver par chhoda gaya voice WLAN.</p></div>

<div class="exam"><p><b>Exam trap.</b> ENCOR aapse configurations <b>interpret</b> karwata hai. Policy padhkar predict karne ki practice karo: packet kis class mein girega, kya policy us direction mein attach ho sakti hai, aur congestion mein counters kya dikhayenge.</p></div>

<div class="scn"><h4>Das minute ka QoS audit</h4><p>Ek nayi network lead ne sirf is module ki seekh se 40 branches audit ki. Har WAN router par usne check kiya: LAN par MARK-IN input attached, WAN par WAN-OUT ya HQoS parent output attached, EF counters badh rahe aur zero b/w exceed drops, aur drops sirf class-default mein. Chhe branches fail hui: chaar mein policies galat direction mein thi, ek mein 50 Mbps service ko feed karne wale 1 Gbps port par LLQ thi, aur ek guest Wi-Fi ko Platinum mark karti thi. Sab ek change window mein theek ho gaye.</p><p><b>Seekh:</b> ek chhoti checklist, configurations ki jagah counters par lagayi gayi, zyada tar QoS faults jaldi pakad leti hai.</p></div>

<div class="iv"><p class="q">"1 Gbps port par 50 Mbps WAN ke upar IP phones, video meetings aur backups wali branch ke liye QoS design karo."</p><p>Strong answer: access port par phones ko conditionally trust karo aur edge par baaki sab re-mark karo: voice EF, video AF41, signalling CS3, backups AF11, baaki DF. WAN router par HQoS banao: 50 Mbps par parent shaper aur child policy jo EF ko peak calls ke liye size ki gayi priority queue de, video aur signalling ko bandwidth guarantees, backups ko WRED ke saath chhoti guarantee, aur class-default mein fair-queue. Ulti direction ke liye HQ par matching policy lagao, confirm karo ki provider DSCP maanta hai, voice WLAN ke liye Platinum use karo, aur load mein show policy-map interface se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>QoS congestion ke dauran decide karta hai kaun intezaar kare aur kaun drop ho; DiffServ enterprise model hai.</li>
<li>Trust boundary par ek baar classify aur mark karo; baad ka har hop DSCP par action leta hai.</li>
<li>Voice ke liye LLQ, data ke liye CBWFQ, TCP classes ke liye WRED, sub-rate links ke liye shaping aur HQoS.</li>
<li>Wireless: WMM access categories, DSCP se UP mapping, ceiling ke roop mein WLC metal profiles.</li>
<li>Load mein <code>show policy-map interface</code> se verify karo; zero counters matlab classification ya direction.</li>
</ul></div>
`}};export{e as default};