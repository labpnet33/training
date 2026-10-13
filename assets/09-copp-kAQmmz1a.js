var e={id:`copp`,h:{en:`Control Plane Policing (CoPP)`,hi:`Control Plane Policing (CoPP)`},body:{en:`
<p>A busy hospital has one senior doctor who makes all the critical decisions. If every visitor with a question walks straight into her room, she cannot treat anyone. So the hospital puts a triage desk in front: ambulances (routing protocols) always go through, doctors from other wards (management) get a few minutes each, curious visitors (pings) get a tiny slot, and known troublemakers (telnet to the router) are turned away. <b>CoPP</b> is that triage desk for the router CPU.</p>

<h3>Why the control plane needs protection</h3>
<p>Packets addressed to the router, packets with IP options, packets with TTL expiring (traceroute), ARP and routing protocol packets are <b>punted</b> to the route processor. The CPU handles perhaps thousands of packets per second, while the forwarding hardware handles millions. A flood of ICMP, SSH or malformed packets aimed at the router can push the CPU to 100 %, and then OSPF hellos and BGP keepalives are delayed, adjacencies drop, and admins cannot log in. That is exactly the incident in the CoPP lab brief.</p>

<h3>How CoPP works</h3>
<p>CoPP is ordinary <b>MQC</b> (from the QoS module) applied to a special target: the <code>control-plane</code>. Every punted packet is classified by class-maps and then policed, transmitted or dropped before the CPU sees it.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="CoPP in the punt path">
<rect x="20" y="90" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="113" text-anchor="middle" class="svg-ink" font-size="13">Ingress port</text><text x="80" y="130" text-anchor="middle" class="svg-muted" font-size="12">all packets</text>
<rect x="180" y="90" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="240" y="113" text-anchor="middle" class="svg-ink" font-size="13">Forwarding</text><text x="240" y="130" text-anchor="middle" class="svg-muted" font-size="12">transit: out</text>
<rect x="340" y="90" width="130" height="50" rx="8" fill="#fed7aa"/><text x="405" y="113" text-anchor="middle" class="svg-ink" font-size="13">CoPP policy</text><text x="405" y="130" text-anchor="middle" class="svg-muted" font-size="12">classify + police</text>
<rect x="510" y="90" width="110" height="50" rx="8" fill="#fde68a"/><text x="565" y="113" text-anchor="middle" class="svg-ink" font-size="13">CPU</text><text x="565" y="130" text-anchor="middle" class="svg-muted" font-size="12">route processor</text>
<line x1="140" y1="115" x2="180" y2="115" stroke="#64748b" stroke-width="2"/><line x1="300" y1="115" x2="340" y2="115" stroke="#64748b" stroke-width="2"/><line x1="470" y1="115" x2="510" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="320" y="80" text-anchor="middle" class="svg-accent" font-size="12">punted</text>
<text x="405" y="170" text-anchor="middle" class="svg-muted" font-size="12">exceed: drop</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">Only traffic TO the router passes through CoPP; transit traffic never does.</text>
</svg><p class="cap">CoPP sits between the punt path and the CPU.</p></div>

<h3>Designing the classes</h3>
<p>A common model has four to six classes, from most to least important:</p>
<table class="cmp"><tr><th>Class</th><th>Examples</th><th>Treatment</th></tr>
<tr><td>Routing</td><td>OSPF, BGP (TCP 179), EIGRP, HSRP</td><td>Generous rate; exceed often transmit</td></tr>
<tr><td>Management</td><td>SSH from the management subnet, SNMP, NTP, TACACS+ replies</td><td>Moderate rate, exceed drop</td></tr>
<tr><td>Monitoring / ICMP</td><td>Ping, traceroute replies</td><td>Small rate, exceed drop</td></tr>
<tr><td>Undesirable</td><td>Telnet to the router, known attack ports, fragments</td><td>Drop</td></tr>
<tr><td>class-default</td><td>Everything else punted</td><td>Small rate, exceed drop</td></tr></table>
<p>Class-maps reference ACLs as <b>selectors</b> (chapter 8): permit means "belongs to this class". Classes are evaluated top-down, first match wins.</p>

<h3>The lab configuration</h3>
<pre class="code">ip access-list extended ACL-ROUTING
 permit ospf any any
ip access-list extended ACL-MGMT
 permit tcp 10.99.0.0 0.0.0.255 any eq 22
ip access-list extended ACL-ICMP
 permit icmp any any
ip access-list extended ACL-TELNET
 permit tcp any any eq telnet
class-map match-all CP-ROUTING
 match access-group name ACL-ROUTING
class-map match-all CP-MGMT
 match access-group name ACL-MGMT
class-map match-all CP-ICMP
 match access-group name ACL-ICMP
class-map match-all CP-UNDESIRED
 match access-group name ACL-TELNET
policy-map COPP
 class CP-UNDESIRED
  drop
 class CP-ROUTING
  police 128000 conform-action transmit exceed-action transmit   <span class="c">! measured, never dropped</span>
 class CP-MGMT
  police 64000 conform-action transmit exceed-action drop
 class CP-ICMP
  police 16000 conform-action transmit exceed-action drop
 class class-default
  police 32000 conform-action transmit exceed-action drop
control-plane
 service-policy input COPP</pre>
<p>Note that SSH from the user LAN (10.1.1.0/24) does not match ACL-MGMT, so it falls into class-default with a small budget, and the VTY access-class from chapter 8 then refuses it.</p>

<h3>Verification</h3>
<pre class="out">R1# show policy-map control-plane
 Control Plane

  Service-policy input: COPP

    Class-map: CP-UNDESIRED (match-all)
      <span class="hl">37 packets, 2220 bytes</span>
      5 minute offered rate 0000 bps, drop rate 0000 bps
      Match: access-group name ACL-TELNET
      drop

    Class-map: CP-ICMP (match-all)
      3124 packets, 799744 bytes
      5 minute offered rate 21000 bps, drop rate 17000 bps
      Match: access-group name ACL-ICMP
      police:
          cir 16000 bps, bc 1500 bytes
        conformed 412 packets, 105472 bytes; actions:
          transmit
        <span class="hl">exceeded 2712 packets, 694272 bytes; actions:</span>
          drop
        conformed 4000 bps, exceeded 17000 bps</pre>
<p>In task 4 of the lab, PC-USER sends a 256 kbps ICMP flood at 10.1.1.1. Against a 16 kbps policer most packets are exceeded and dropped, while OSPF with R2 stays up because routing has its own class. Verify OSPF with <code>show ip route 2.2.2.2</code> or <code>show ip ospf neighbor</code>.</p>

<h3>Safe rollout: monitor first</h3>
<ol>
<li>Build the classes and set <b>every</b> class, including class-default, to <code>exceed-action transmit</code>. Nothing is dropped; you only measure.</li>
<li>Run for days, read <code>show policy-map control-plane</code>, and find what lands in class-default. Add missing protocols (BGP, HSRP, NTP, SNMP, TACACS+ replies, DHCP relay) to the right classes.</li>
<li>Set realistic rates from the baseline with headroom, then change exceed actions to drop, class by class, least important first.</li>
<li>Keep routing on transmit or a very generous rate; monitor after every change.</li>
</ol>

<div class="note"><p>On Catalyst 9000 switches CoPP is on by default as the system-defined <code>system-cpp-policy</code>, with fixed classes per traffic type. You cannot remove it; you verify it with <code>show policy-map control-plane</code> and tune per-class rates in packets per second. The MQC method above is the router (and exam) model.</p></div>

<div class="eg"><p><b>Worked example.</b> Sizing the ICMP class. You expect at most 20 monitoring pings per second of 100 bytes: 20 x 100 x 8 = 16,000 bps, so a 16 kbps policer fits normal monitoring exactly. The lab flood of 256 kbps is 16 times that; about 15/16 of it is dropped before the CPU.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting a protocol in the ACLs, so it lands in a tight class-default with exceed drop. The moment CoPP is attached, BGP or OSPF sessions die. That is why you start in monitor mode.</p></div>

<div class="warn"><p><b>Common mistake.</b> Dropping all ICMP. Path MTU discovery, traceroute and your own troubleshooting need some ICMP. Police it, do not block it.</p></div>

<div class="exam"><p><b>Exam trap.</b> CoPP is attached under <code>control-plane</code> with <code>service-policy input</code>. It is not applied to interfaces, and it affects only traffic destined to the router, not transit traffic. Verification is <code>show policy-map control-plane</code>.</p></div>

<div class="scn"><h4>CoPP that broke BGP</h4><p>A provider pushed a new CoPP template to its edge routers. Within a minute, eBGP sessions on several routers dropped. <code>show policy-map control-plane</code> showed BGP packets counted in class-default, exceeded and dropped: the routing ACL matched <code>eq bgp</code> only as a destination port, but on some sessions the router was the client and replies arrived from source port 179. Adding <code>permit tcp any eq bgp any</code> to the routing ACL fixed it.</p><p><b>Lesson:</b> match both directions of TCP routing sessions, and roll out CoPP in monitor mode first.</p></div>

<div class="iv"><p class="q">"What is CoPP and how would you deploy it safely?"</p><p>CoPP is an MQC policy applied inbound to the control-plane that classifies and polices traffic punted to the route processor, protecting routing and management from floods. Describe the classes (routing, management, ICMP, undesirable, default), ACLs as selectors, policers with conform and exceed actions, <code>show policy-map control-plane</code>, and the rollout: all transmit first, baseline, then drop gradually. Mention the Catalyst 9000 system-cpp-policy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CoPP protects the CPU from punted traffic; transit traffic is not affected.</li>
<li>It is MQC: ACL selectors, class-maps, a policy-map with police/drop, then <code>control-plane</code> and <code>service-policy input</code>.</li>
<li>Typical classes: routing, management, ICMP, undesirable, class-default; first match wins.</li>
<li>Verify with <code>show policy-map control-plane</code>: conformed and exceeded counters per class.</li>
<li>Roll out in monitor mode (exceed transmit), baseline, then drop class by class.</li>
</ul></div>
`,hi:`
<p>Ek busy hospital mein ek senior doctor hai jo saare critical faisle leti hai. Agar sawaal wala har visitor seedha uske kamre mein chala jaaye, to woh kisi ka ilaaj nahi kar paayegi. Isliye hospital aage ek triage desk rakhta hai: ambulances (routing protocols) hamesha jaati hain, doosre wards ke doctors (management) ko har ek ko kuch minute milte hain, curious visitors (pings) ko chhota slot milta hai, aur jaane maane troublemakers (router par telnet) lauta diye jaate hain. <b>CoPP</b> router CPU ke liye wahi triage desk hai.</p>

<h3>Control plane ko suraksha kyun chahiye</h3>
<p>Router ko address kiye packets, IP options wale packets, TTL expire hone wale packets (traceroute), ARP aur routing protocol packets route processor ko <b>punt</b> hote hain. CPU shayad hazaaron packets per second sambhalta hai, jabki forwarding hardware lakhon. Router par ICMP, SSH ya kharab packets ki baadh CPU ko 100 % tak le jaa sakti hai, aur tab OSPF hellos aur BGP keepalives late hote hain, adjacencies girti hain, aur admins login nahi kar paate. CoPP lab brief ka incident bilkul yahi hai.</p>

<h3>CoPP kaise kaam karta hai</h3>
<p>CoPP saadharan <b>MQC</b> (QoS module se) hai jo ek khaas target par lagta hai: <code>control-plane</code>. Har punted packet CPU tak pahunchne se pehle class-maps se classify hota hai aur phir police, transmit ya drop hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Punt path mein CoPP">
<rect x="20" y="90" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="113" text-anchor="middle" class="svg-ink" font-size="13">Ingress port</text><text x="80" y="130" text-anchor="middle" class="svg-muted" font-size="12">saare packets</text>
<rect x="180" y="90" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="240" y="113" text-anchor="middle" class="svg-ink" font-size="13">Forwarding</text><text x="240" y="130" text-anchor="middle" class="svg-muted" font-size="12">transit: bahar</text>
<rect x="340" y="90" width="130" height="50" rx="8" fill="#fed7aa"/><text x="405" y="113" text-anchor="middle" class="svg-ink" font-size="13">CoPP policy</text><text x="405" y="130" text-anchor="middle" class="svg-muted" font-size="12">classify + police</text>
<rect x="510" y="90" width="110" height="50" rx="8" fill="#fde68a"/><text x="565" y="113" text-anchor="middle" class="svg-ink" font-size="13">CPU</text><text x="565" y="130" text-anchor="middle" class="svg-muted" font-size="12">route processor</text>
<line x1="140" y1="115" x2="180" y2="115" stroke="#64748b" stroke-width="2"/><line x1="300" y1="115" x2="340" y2="115" stroke="#64748b" stroke-width="2"/><line x1="470" y1="115" x2="510" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="320" y="80" text-anchor="middle" class="svg-accent" font-size="12">punted</text>
<text x="405" y="170" text-anchor="middle" class="svg-muted" font-size="12">exceed: drop</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">Sirf router KO aane wala traffic CoPP se guzarta hai; transit kabhi nahi.</text>
</svg><p class="cap">CoPP punt path aur CPU ke beech baithta hai.</p></div>

<h3>Classes design karna</h3>
<p>Ek aam model mein chaar se chhe classes hoti hain, sabse zaroori se kam zaroori tak:</p>
<table class="cmp"><tr><th>Class</th><th>Examples</th><th>Treatment</th></tr>
<tr><td>Routing</td><td>OSPF, BGP (TCP 179), EIGRP, HSRP</td><td>Udaar rate; exceed aksar transmit</td></tr>
<tr><td>Management</td><td>Management subnet se SSH, SNMP, NTP, TACACS+ replies</td><td>Madhyam rate, exceed drop</td></tr>
<tr><td>Monitoring / ICMP</td><td>Ping, traceroute replies</td><td>Chhota rate, exceed drop</td></tr>
<tr><td>Undesirable</td><td>Router par telnet, jaane maane attack ports, fragments</td><td>Drop</td></tr>
<tr><td>class-default</td><td>Baaki sab punted</td><td>Chhota rate, exceed drop</td></tr></table>
<p>Class-maps ACLs ko <b>selectors</b> ki tarah refer karte hain (chapter 8): permit ka matlab "is class ka hai". Classes upar se neeche evaluate hoti hain, pehla match jeet-ta hai.</p>

<h3>Lab configuration</h3>
<pre class="code">ip access-list extended ACL-ROUTING
 permit ospf any any
ip access-list extended ACL-MGMT
 permit tcp 10.99.0.0 0.0.0.255 any eq 22
ip access-list extended ACL-ICMP
 permit icmp any any
ip access-list extended ACL-TELNET
 permit tcp any any eq telnet
class-map match-all CP-ROUTING
 match access-group name ACL-ROUTING
class-map match-all CP-MGMT
 match access-group name ACL-MGMT
class-map match-all CP-ICMP
 match access-group name ACL-ICMP
class-map match-all CP-UNDESIRED
 match access-group name ACL-TELNET
policy-map COPP
 class CP-UNDESIRED
  drop
 class CP-ROUTING
  police 128000 conform-action transmit exceed-action transmit   <span class="c">! naapa jaata hai, kabhi drop nahi</span>
 class CP-MGMT
  police 64000 conform-action transmit exceed-action drop
 class CP-ICMP
  police 16000 conform-action transmit exceed-action drop
 class class-default
  police 32000 conform-action transmit exceed-action drop
control-plane
 service-policy input COPP</pre>
<p>Dhyaan do ki user LAN (10.1.1.0/24) se SSH ACL-MGMT se match nahi karta, isliye woh chhote budget wali class-default mein jaata hai, aur phir chapter 8 ka VTY access-class use mana kar deta hai.</p>

<h3>Verification</h3>
<pre class="out">R1# show policy-map control-plane
 Control Plane

  Service-policy input: COPP

    Class-map: CP-UNDESIRED (match-all)
      <span class="hl">37 packets, 2220 bytes</span>
      5 minute offered rate 0000 bps, drop rate 0000 bps
      Match: access-group name ACL-TELNET
      drop

    Class-map: CP-ICMP (match-all)
      3124 packets, 799744 bytes
      5 minute offered rate 21000 bps, drop rate 17000 bps
      Match: access-group name ACL-ICMP
      police:
          cir 16000 bps, bc 1500 bytes
        conformed 412 packets, 105472 bytes; actions:
          transmit
        <span class="hl">exceeded 2712 packets, 694272 bytes; actions:</span>
          drop
        conformed 4000 bps, exceeded 17000 bps</pre>
<p>Lab ke task 4 mein PC-USER 10.1.1.1 par 256 kbps ICMP flood bhejta hai. 16 kbps policer ke saamne zyada tar packets exceeded aur drop hote hain, jabki R2 ke saath OSPF up rehta hai kyunki routing ki apni class hai. OSPF ko <code>show ip route 2.2.2.2</code> ya <code>show ip ospf neighbor</code> se verify karo.</p>

<h3>Safe rollout: pehle monitor</h3>
<ol>
<li>Classes banao aur class-default samet <b>har</b> class ko <code>exceed-action transmit</code> par set karo. Kuch drop nahi hota; aap sirf naapte ho.</li>
<li>Dinon tak chalao, <code>show policy-map control-plane</code> padho, aur dekho class-default mein kya aata hai. Missing protocols (BGP, HSRP, NTP, SNMP, TACACS+ replies, DHCP relay) sahi classes mein jodo.</li>
<li>Baseline se headroom ke saath realistic rates set karo, phir exceed actions ko class by class drop mein badlo, sabse kam zaroori pehle.</li>
<li>Routing ko transmit ya bahut udaar rate par rakho; har change ke baad monitor karo.</li>
</ol>

<div class="note"><p>Catalyst 9000 switches par CoPP default mein system-defined <code>system-cpp-policy</code> ki tarah on hota hai, har traffic type ke liye fixed classes ke saath. Aap ise hata nahi sakte; <code>show policy-map control-plane</code> se verify karte ho aur per-class rates packets per second mein tune karte ho. Upar wala MQC tareeka router (aur exam) model hai.</p></div>

<div class="eg"><p><b>Worked example.</b> ICMP class ka size. Aap zyada se zyada 20 monitoring pings per second, 100 bytes ke, expect karte ho: 20 x 100 x 8 = 16,000 bps, isliye 16 kbps policer normal monitoring mein bilkul fit hai. Lab ka 256 kbps flood usse 16 guna hai; iska lagbhag 15/16 CPU se pehle drop hota hai.</p></div>

<div class="warn"><p><b>Common galti.</b> ACLs mein koi protocol bhool jaana, jisse woh exceed drop wali tight class-default mein chala jaata hai. CoPP lagte hi BGP ya OSPF sessions mar jaate hain. Isiliye aap monitor mode mein shuru karte ho.</p></div>

<div class="warn"><p><b>Common galti.</b> Saara ICMP drop karna. Path MTU discovery, traceroute aur aapki apni troubleshooting ko kuch ICMP chahiye. Ise police karo, block mat karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> CoPP <code>control-plane</code> ke neeche <code>service-policy input</code> se lagta hai. Yeh interfaces par nahi lagta, aur sirf router ko destined traffic par asar karta hai, transit traffic par nahi. Verification <code>show policy-map control-plane</code> hai.</p></div>

<div class="scn"><h4>CoPP jisne BGP tod diya</h4><p>Ek provider ne apne edge routers par naya CoPP template push kiya. Ek minute mein kai routers par eBGP sessions gir gaye. <code>show policy-map control-plane</code> ne BGP packets ko class-default mein counted, exceeded aur dropped dikhaya: routing ACL <code>eq bgp</code> sirf destination port ki tarah match karti thi, lekin kuch sessions par router client tha aur replies source port 179 se aati thi. Routing ACL mein <code>permit tcp any eq bgp any</code> jodne se fix hua.</p><p><b>Seekh:</b> TCP routing sessions ki dono directions match karo, aur CoPP pehle monitor mode mein roll out karo.</p></div>

<div class="iv"><p class="q">"CoPP kya hai aur ise safely kaise deploy karoge?"</p><p>CoPP control-plane par inbound lagi MQC policy hai jo route processor ko punt hone wale traffic ko classify aur police karti hai, routing aur management ko floods se bachati hai. Classes (routing, management, ICMP, undesirable, default), selectors ke roop mein ACLs, conform aur exceed actions wale policers, <code>show policy-map control-plane</code>, aur rollout batao: pehle sab transmit, baseline, phir dheere dheere drop. Catalyst 9000 ki system-cpp-policy ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CoPP CPU ko punted traffic se bachata hai; transit traffic par asar nahi.</li>
<li>Yeh MQC hai: ACL selectors, class-maps, police/drop wala policy-map, phir <code>control-plane</code> aur <code>service-policy input</code>.</li>
<li>Aam classes: routing, management, ICMP, undesirable, class-default; pehla match jeet-ta hai.</li>
<li><code>show policy-map control-plane</code> se verify karo: har class ke conformed aur exceeded counters.</li>
<li>Monitor mode (exceed transmit) mein roll out karo, baseline lo, phir class by class drop.</li>
</ul></div>
`}};export{e as default};