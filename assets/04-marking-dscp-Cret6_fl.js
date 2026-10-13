var e={id:`marking-dscp`,h:{en:`Marking: CoS, IP Precedence, DSCP, EXP and Wi-Fi UP`,hi:`Marking: CoS, IP Precedence, DSCP, EXP aur Wi-Fi UP`},body:{en:`
<p>Back to the hospital: the wristband only works if every doctor reads the same colour code. A red band must mean "critical" on every floor. <b>Marking</b> is writing that code into the packet, and there are several places to write it depending on which "floor" the packet is on: an Ethernet trunk, an IP network, an MPLS provider core or a Wi-Fi cell.</p>

<h3>Layer 2: CoS in the 802.1Q tag</h3>
<p>The 802.1Q VLAN tag contains a 3-bit field called <b>PCP</b> (Priority Code Point), usually called <b>CoS</b> (Class of Service), values 0 to 7. Voice is CoS 5, video CoS 4, signalling CoS 3. CoS only exists while the frame carries a tag, so it is <b>lost at the first routed hop</b> or on an untagged access port. It is useful inside a switched campus, never end to end.</p>

<h3>Layer 3: the ToS byte, IP Precedence and DSCP</h3>
<p>The IPv4 header has an 8-bit <b>ToS</b> byte (IPv6 calls it Traffic Class). It has been interpreted two ways:</p>
<ul>
<li><b>IP Precedence (IPP)</b>, the legacy view: the top 3 bits, values 0 to 7. Voice was IPP 5; 6 and 7 are reserved for network control.</li>
<li><b>DSCP</b> (Differentiated Services Code Point), the DiffServ view: the top <b>6 bits</b>, values 0 to 63. The bottom 2 bits are <b>ECN</b> (Explicit Congestion Notification).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="ToS byte layout">
<text x="320" y="20" text-anchor="middle" class="svg-muted" font-size="12">IPv4 ToS / IPv6 Traffic Class byte (bit 7 on the left)</text>
<rect x="80" y="40" width="60" height="40" fill="#bae6fd" stroke="#64748b"/><rect x="140" y="40" width="60" height="40" fill="#bae6fd" stroke="#64748b"/><rect x="200" y="40" width="60" height="40" fill="#bae6fd" stroke="#64748b"/>
<rect x="260" y="40" width="60" height="40" fill="#bbf7d0" stroke="#64748b"/><rect x="320" y="40" width="60" height="40" fill="#bbf7d0" stroke="#64748b"/><rect x="380" y="40" width="60" height="40" fill="#bbf7d0" stroke="#64748b"/>
<rect x="440" y="40" width="60" height="40" fill="#e2e8f0" stroke="#64748b"/><rect x="500" y="40" width="60" height="40" fill="#e2e8f0" stroke="#64748b"/>
<text x="110" y="65" text-anchor="middle" class="svg-ink" font-size="13">1</text><text x="170" y="65" text-anchor="middle" class="svg-ink" font-size="13">0</text><text x="230" y="65" text-anchor="middle" class="svg-ink" font-size="13">1</text><text x="290" y="65" text-anchor="middle" class="svg-ink" font-size="13">1</text><text x="350" y="65" text-anchor="middle" class="svg-ink" font-size="13">1</text><text x="410" y="65" text-anchor="middle" class="svg-ink" font-size="13">0</text><text x="470" y="65" text-anchor="middle" class="svg-ink" font-size="13">0</text><text x="530" y="65" text-anchor="middle" class="svg-ink" font-size="13">0</text>
<line x1="80" y1="95" x2="260" y2="95" stroke="#64748b" stroke-width="2"/><text x="170" y="112" text-anchor="middle" class="svg-accent" font-size="12">IP Precedence = 5</text>
<line x1="80" y1="130" x2="440" y2="130" stroke="#64748b" stroke-width="2"/><text x="260" y="148" text-anchor="middle" class="svg-accent" font-size="12">DSCP 101110 = 46 (EF)</text>
<line x1="440" y1="95" x2="560" y2="95" stroke="#64748b" stroke-width="2"/><text x="500" y="112" text-anchor="middle" class="svg-muted" font-size="12">ECN</text>
</svg><p class="cap">EF is binary 101110 = 46. Its top three bits, 101, are IP Precedence 5, so legacy devices still see voice as priority.</p></div>

<h3>DSCP per-hop behaviours</h3>
<dl class="terms">
<dt>DF (Default Forwarding), DSCP 0</dt><dd>Best effort.</dd>
<dt>EF (Expedited Forwarding), DSCP 46</dt><dd>Low delay, low jitter, low loss. Used for voice bearer traffic and served by a priority queue.</dd>
<dt>AF (Assured Forwarding), AFxy</dt><dd>Four classes x = 1 to 4, each with three <b>drop precedences</b> y = 1 (low) to 3 (high). Within one class, packets with higher y are dropped first when congestion begins. Value = 8x + 2y.</dd>
<dt>CS (Class Selector), CSx</dt><dd>Value = 8x, so CS0 to CS7 keep backward compatibility with IP Precedence 0 to 7.</dd>
</dl>

<table class="cmp"><tr><th>Class</th><th>Low drop (y=1)</th><th>Medium drop (y=2)</th><th>High drop (y=3)</th></tr>
<tr><td>AF1</td><td>AF11 = 10</td><td>AF12 = 12</td><td>AF13 = 14</td></tr>
<tr><td>AF2</td><td>AF21 = 18</td><td>AF22 = 20</td><td>AF23 = 22</td></tr>
<tr><td>AF3</td><td>AF31 = 26</td><td>AF32 = 28</td><td>AF33 = 30</td></tr>
<tr><td>AF4</td><td>AF41 = 34</td><td>AF42 = 36</td><td>AF43 = 38</td></tr></table>

<div class="eg"><p><b>Worked example.</b> AF32: 8 × 3 + 2 × 2 = 28, binary 011100. Its top three bits 011 equal IP Precedence 3. CS3 is 8 × 3 = 24. EF 46 in binary is 101110. Remember: a higher AF <b>class</b> number gets better treatment, but a higher <b>drop precedence</b> inside a class is worse. AF13 is dropped before AF11.</p></div>

<p>A widely used enterprise plan, based on RFC 4594 and Cisco's QoS baseline:</p>
<table class="cmp"><tr><th>Traffic</th><th>DSCP</th><th>CoS</th></tr>
<tr><td>Voice bearer</td><td>EF (46)</td><td>5</td></tr>
<tr><td>Interactive video</td><td>AF41 (34)</td><td>4</td></tr>
<tr><td>Call signalling</td><td>CS3 (24)</td><td>3</td></tr>
<tr><td>Transactional data</td><td>AF21 (18)</td><td>2</td></tr>
<tr><td>Bulk data, backups</td><td>AF11 (10)</td><td>1</td></tr>
<tr><td>Scavenger</td><td>CS1 (8)</td><td>1</td></tr>
<tr><td>Routing protocols</td><td>CS6 (48)</td><td>6</td></tr>
<tr><td>Best effort</td><td>DF (0)</td><td>0</td></tr></table>

<h3>MPLS EXP and Wi-Fi user priority</h3>
<p>An MPLS provider core switches on labels, not IP headers, so it uses the 3-bit <b>EXP</b> field (renamed <b>Traffic Class</b>, TC) in the MPLS label. By default the ingress PE copies the top three DSCP bits into EXP, so EF becomes EXP 5. With only 8 values, a provider typically offers 4 to 8 classes, and your 12 enterprise markings must be mapped onto them.</p>
<p>On Wi-Fi, <b>802.11e</b> (certified as <b>WMM</b>) carries a 3-bit <b>User Priority (UP)</b> in the QoS Control field of the 802.11 header. Voice is UP 6, video UP 4 or 5, best effort UP 0, background UP 1. Chapter 10 covers how the controller maps DSCP to UP.</p>

<h3>Configuring marking in MQC</h3>
<pre class="code">policy-map MARK-IN
 class VOICE
  set dscp ef
 class BULK
  set dscp af11
<span class="c">! other marking actions you will meet</span>
<span class="c">!  set cos 5                          (on a tagged egress)</span>
<span class="c">!  set precedence 5</span>
<span class="c">!  set mpls experimental imposition 5  (on a PE)</span>
interface GigabitEthernet0/1
 service-policy input MARK-IN</pre>
<pre class="out">R1# show policy-map interface GigabitEthernet0/1 input
 GigabitEthernet0/1

  Service-policy input: MARK-IN

    Class-map: VOICE (match-any)
      7500 packets, 1500000 bytes
      30 second offered rate 400000 bps, drop rate 0000 bps
      Match: access-group name VOICE-RTP
        7500 packets, 1500000 bytes
        30 second rate 400000 bps
      QoS Set
        dscp ef
<span class="hl">          Packets marked 7500</span></pre>

<div class="warn"><p><b>Common mistake.</b> Trusting or matching CoS after a routed hop. A router's routed port sends untagged frames, so a switch that "trusts CoS" on that link sees CoS 0 for everything. Use DSCP wherever traffic is routed.</p></div>

<div class="exam"><p><b>Exam trap.</b> Know the formulas and a few values by heart: EF 46, AF41 34, AF31 26, AF21 18, AF11 10, CS3 24, CS6 48. AF13 has a <b>higher</b> drop probability than AF11. DSCP is 6 bits; CoS, IPP, EXP and UP are 3 bits each.</p></div>

<div class="scn"><h4>Voice lost its priority at the distribution layer</h4><p>After a campus refresh, calls between buildings had jitter under load. The new distribution switch ports toward the WAN router were set to trust CoS, copied from an old template. The router's links were routed ports with no 802.1Q tag, so every frame arrived with CoS 0 and voice was mapped to the best-effort queue. Changing the uplinks to trust DSCP (the default on Catalyst 9000) restored EF treatment.</p><p><b>Lesson:</b> CoS disappears when there is no tag. DSCP travels with the IP packet end to end.</p></div>

<div class="iv"><p class="q">"What is the difference between CoS and DSCP, and what value is voice?"</p><p>Strong answer: CoS is a 3-bit field in the 802.1Q tag, values 0 to 7, only present on tagged links and lost when routed. DSCP is the top 6 bits of the IP ToS or Traffic Class byte, values 0 to 63, and survives routing end to end. Voice is CoS 5 and DSCP EF 46; EF's top 3 bits give IP Precedence 5. Mention AF drop precedence (AFxy = 8x + 2y) as a bonus.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CoS (802.1Q PCP) is 3 bits and is lost at a routed hop; DSCP is 6 bits and travels end to end.</li>
<li>PHBs: DF 0, EF 46, AFxy = 8x + 2y, CSx = 8x.</li>
<li>Within an AF class, higher drop precedence (y) is dropped first.</li>
<li>MPLS uses 3-bit EXP (TC); Wi-Fi uses 3-bit 802.11e UP (voice UP 6).</li>
<li>Mark with <code>set dscp</code> inside a policy-map, normally inbound at the trust boundary.</li>
</ul></div>
`,hi:`
<p>Wapas hospital par: wristband tabhi kaam karta hai jab har doctor same colour code padhe. Laal band har floor par "critical" hi hona chahiye. <b>Marking</b> us code ko packet mein likhna hai, aur use likhne ki kai jagah hain, is par depend karke ki packet kis "floor" par hai: Ethernet trunk, IP network, MPLS provider core ya Wi-Fi cell.</p>

<h3>Layer 2: 802.1Q tag mein CoS</h3>
<p>802.1Q VLAN tag mein 3-bit field hota hai jise <b>PCP</b> (Priority Code Point) kehte hain, aam taur par <b>CoS</b> (Class of Service), values 0 se 7. Voice CoS 5, video CoS 4, signalling CoS 3. CoS tabhi tak rehta hai jab tak frame par tag hai, isliye yeh <b>pehle routed hop par kho jaata hai</b> ya untagged access port par. Yeh switched campus ke andar kaam ka hai, end to end kabhi nahi.</p>

<h3>Layer 3: ToS byte, IP Precedence aur DSCP</h3>
<p>IPv4 header mein 8-bit <b>ToS</b> byte hota hai (IPv6 ise Traffic Class kehta hai). Ise do tarah se samjha gaya hai:</p>
<ul>
<li><b>IP Precedence (IPP)</b>, purana nazariya: upar ke 3 bits, values 0 se 7. Voice IPP 5 thi; 6 aur 7 network control ke liye reserved hain.</li>
<li><b>DSCP</b> (Differentiated Services Code Point), DiffServ nazariya: upar ke <b>6 bits</b>, values 0 se 63. Neeche ke 2 bits <b>ECN</b> (Explicit Congestion Notification) hain.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="ToS byte layout">
<text x="320" y="20" text-anchor="middle" class="svg-muted" font-size="12">IPv4 ToS / IPv6 Traffic Class byte (bit 7 baayein)</text>
<rect x="80" y="40" width="60" height="40" fill="#bae6fd" stroke="#64748b"/><rect x="140" y="40" width="60" height="40" fill="#bae6fd" stroke="#64748b"/><rect x="200" y="40" width="60" height="40" fill="#bae6fd" stroke="#64748b"/>
<rect x="260" y="40" width="60" height="40" fill="#bbf7d0" stroke="#64748b"/><rect x="320" y="40" width="60" height="40" fill="#bbf7d0" stroke="#64748b"/><rect x="380" y="40" width="60" height="40" fill="#bbf7d0" stroke="#64748b"/>
<rect x="440" y="40" width="60" height="40" fill="#e2e8f0" stroke="#64748b"/><rect x="500" y="40" width="60" height="40" fill="#e2e8f0" stroke="#64748b"/>
<text x="110" y="65" text-anchor="middle" class="svg-ink" font-size="13">1</text><text x="170" y="65" text-anchor="middle" class="svg-ink" font-size="13">0</text><text x="230" y="65" text-anchor="middle" class="svg-ink" font-size="13">1</text><text x="290" y="65" text-anchor="middle" class="svg-ink" font-size="13">1</text><text x="350" y="65" text-anchor="middle" class="svg-ink" font-size="13">1</text><text x="410" y="65" text-anchor="middle" class="svg-ink" font-size="13">0</text><text x="470" y="65" text-anchor="middle" class="svg-ink" font-size="13">0</text><text x="530" y="65" text-anchor="middle" class="svg-ink" font-size="13">0</text>
<line x1="80" y1="95" x2="260" y2="95" stroke="#64748b" stroke-width="2"/><text x="170" y="112" text-anchor="middle" class="svg-accent" font-size="12">IP Precedence = 5</text>
<line x1="80" y1="130" x2="440" y2="130" stroke="#64748b" stroke-width="2"/><text x="260" y="148" text-anchor="middle" class="svg-accent" font-size="12">DSCP 101110 = 46 (EF)</text>
<line x1="440" y1="95" x2="560" y2="95" stroke="#64748b" stroke-width="2"/><text x="500" y="112" text-anchor="middle" class="svg-muted" font-size="12">ECN</text>
</svg><p class="cap">EF binary mein 101110 = 46 hai. Iske upar ke teen bits, 101, IP Precedence 5 hain, isliye purane devices ko bhi voice priority dikhti hai.</p></div>

<h3>DSCP per-hop behaviours</h3>
<dl class="terms">
<dt>DF (Default Forwarding), DSCP 0</dt><dd>Best effort.</dd>
<dt>EF (Expedited Forwarding), DSCP 46</dt><dd>Kam delay, kam jitter, kam loss. Voice bearer traffic ke liye, priority queue se serve hota hai.</dd>
<dt>AF (Assured Forwarding), AFxy</dt><dd>Chaar classes x = 1 se 4, har ek mein teen <b>drop precedences</b> y = 1 (kam) se 3 (zyada). Ek class ke andar, congestion shuru hone par zyada y wale packets pehle drop hote hain. Value = 8x + 2y.</dd>
<dt>CS (Class Selector), CSx</dt><dd>Value = 8x, isliye CS0 se CS7 IP Precedence 0 se 7 ke saath backward compatible rehte hain.</dd>
</dl>

<table class="cmp"><tr><th>Class</th><th>Kam drop (y=1)</th><th>Medium drop (y=2)</th><th>Zyada drop (y=3)</th></tr>
<tr><td>AF1</td><td>AF11 = 10</td><td>AF12 = 12</td><td>AF13 = 14</td></tr>
<tr><td>AF2</td><td>AF21 = 18</td><td>AF22 = 20</td><td>AF23 = 22</td></tr>
<tr><td>AF3</td><td>AF31 = 26</td><td>AF32 = 28</td><td>AF33 = 30</td></tr>
<tr><td>AF4</td><td>AF41 = 34</td><td>AF42 = 36</td><td>AF43 = 38</td></tr></table>

<div class="eg"><p><b>Worked example.</b> AF32: 8 × 3 + 2 × 2 = 28, binary 011100. Iske upar ke teen bits 011 IP Precedence 3 ke barabar hain. CS3 8 × 3 = 24 hai. EF 46 binary mein 101110 hai. Yaad rakho: zyada AF <b>class</b> number ko behtar treatment milta hai, par class ke andar zyada <b>drop precedence</b> bura hai. AF13, AF11 se pehle drop hota hai.</p></div>

<p>RFC 4594 aur Cisco ke QoS baseline par bana ek bahut use hone wala enterprise plan:</p>
<table class="cmp"><tr><th>Traffic</th><th>DSCP</th><th>CoS</th></tr>
<tr><td>Voice bearer</td><td>EF (46)</td><td>5</td></tr>
<tr><td>Interactive video</td><td>AF41 (34)</td><td>4</td></tr>
<tr><td>Call signalling</td><td>CS3 (24)</td><td>3</td></tr>
<tr><td>Transactional data</td><td>AF21 (18)</td><td>2</td></tr>
<tr><td>Bulk data, backups</td><td>AF11 (10)</td><td>1</td></tr>
<tr><td>Scavenger</td><td>CS1 (8)</td><td>1</td></tr>
<tr><td>Routing protocols</td><td>CS6 (48)</td><td>6</td></tr>
<tr><td>Best effort</td><td>DF (0)</td><td>0</td></tr></table>

<h3>MPLS EXP aur Wi-Fi user priority</h3>
<p>MPLS provider core labels par switch karta hai, IP headers par nahi, isliye woh MPLS label ka 3-bit <b>EXP</b> field (naya naam <b>Traffic Class</b>, TC) use karta hai. Default mein ingress PE DSCP ke upar ke teen bits EXP mein copy karta hai, isliye EF EXP 5 ban jaata hai. Sirf 8 values ke saath provider aam taur par 4 se 8 classes deta hai, aur aapki 12 enterprise markings ko unpar map karna padta hai.</p>
<p>Wi-Fi par <b>802.11e</b> (<b>WMM</b> naam se certified) 802.11 header ke QoS Control field mein 3-bit <b>User Priority (UP)</b> le jaata hai. Voice UP 6, video UP 4 ya 5, best effort UP 0, background UP 1. Chapter 10 batata hai ki controller DSCP ko UP par kaise map karta hai.</p>

<h3>MQC mein marking configure karna</h3>
<pre class="code">policy-map MARK-IN
 class VOICE
  set dscp ef
 class BULK
  set dscp af11
<span class="c">! aur marking actions jo aapko milenge</span>
<span class="c">!  set cos 5                          (tagged egress par)</span>
<span class="c">!  set precedence 5</span>
<span class="c">!  set mpls experimental imposition 5  (PE par)</span>
interface GigabitEthernet0/1
 service-policy input MARK-IN</pre>
<pre class="out">R1# show policy-map interface GigabitEthernet0/1 input
 GigabitEthernet0/1

  Service-policy input: MARK-IN

    Class-map: VOICE (match-any)
      7500 packets, 1500000 bytes
      30 second offered rate 400000 bps, drop rate 0000 bps
      Match: access-group name VOICE-RTP
        7500 packets, 1500000 bytes
        30 second rate 400000 bps
      QoS Set
        dscp ef
<span class="hl">          Packets marked 7500</span></pre>

<div class="warn"><p><b>Common galti.</b> Routed hop ke baad CoS par trust ya match karna. Router ka routed port untagged frames bhejta hai, isliye us link par "trust CoS" wala switch har cheez ko CoS 0 dekhta hai. Jahan traffic route hota hai wahan DSCP use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Formulas aur kuch values zabaani yaad rakho: EF 46, AF41 34, AF31 26, AF21 18, AF11 10, CS3 24, CS6 48. AF13 ki drop probability AF11 se <b>zyada</b> hai. DSCP 6 bits hai; CoS, IPP, EXP aur UP har ek 3 bits.</p></div>

<div class="scn"><h4>Distribution layer par voice ki priority kho gayi</h4><p>Campus refresh ke baad load mein buildings ke beech calls mein jitter tha. WAN router ki taraf naye distribution switch ke ports purane template se copy hokar trust CoS par set the. Router ke links routed ports the jinme 802.1Q tag nahi tha, isliye har frame CoS 0 ke saath aata tha aur voice best-effort queue mein map hoti thi. Uplinks ko trust DSCP (Catalyst 9000 ka default) par badalne se EF treatment wapas aaya.</p><p><b>Seekh:</b> tag na ho to CoS gayab ho jaata hai. DSCP IP packet ke saath end to end chalta hai.</p></div>

<div class="iv"><p class="q">"CoS aur DSCP mein kya fark hai, aur voice ki value kya hai?"</p><p>Strong answer: CoS 802.1Q tag mein 3-bit field hai, values 0 se 7, sirf tagged links par hota hai aur route hone par kho jaata hai. DSCP IP ToS ya Traffic Class byte ke upar ke 6 bits hain, values 0 se 63, aur routing ke baad bhi end to end rehta hai. Voice CoS 5 aur DSCP EF 46 hai; EF ke upar ke 3 bits IP Precedence 5 dete hain. Bonus mein AF drop precedence (AFxy = 8x + 2y) batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CoS (802.1Q PCP) 3 bits hai aur routed hop par kho jaata hai; DSCP 6 bits hai aur end to end chalta hai.</li>
<li>PHBs: DF 0, EF 46, AFxy = 8x + 2y, CSx = 8x.</li>
<li>AF class ke andar zyada drop precedence (y) pehle drop hota hai.</li>
<li>MPLS 3-bit EXP (TC) use karta hai; Wi-Fi 3-bit 802.11e UP (voice UP 6).</li>
<li>Policy-map ke andar <code>set dscp</code> se mark karo, normally trust boundary par inbound.</li>
</ul></div>
`}};export{e as default};