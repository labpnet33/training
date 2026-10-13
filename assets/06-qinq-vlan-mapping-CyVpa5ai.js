var e={id:`qinq-vlan-mapping`,h:{en:`Q-in-Q: carrying customer VLANs inside provider VLANs`,hi:`Q-in-Q: customer VLANs ko provider VLANs ke andar le jaana`},body:{en:`
<p>A company with two offices wants them to look like one switched network, with its own VLANs 10 and 20 at both ends. A second company wants the same, and it also uses VLAN 10. The provider cannot give both of them VLAN 10 on one network, and it does not want to know the customers' VLAN plans. <b>Q-in-Q (IEEE 802.1ad, provider bridging)</b> solves this: the provider adds an <b>outer tag</b> (the service tag, S-tag) in front of the customer's own tag (the customer tag, C-tag). The core forwards on the S-tag only; the C-tag is carried untouched.</p>

<h3>The frame</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Q-in-Q frame">
<rect x="10" y="20" width="620" height="44" rx="6" fill="#e2e8f0"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">Customer frame: dst MAC | src MAC | C-tag (VLAN 10) | payload</text>
<line x1="320" y1="64" x2="320" y2="86" stroke="#64748b" stroke-width="2"/><text x="345" y="80" class="svg-accent" font-size="12">push S-tag on ingress</text>
<rect x="10" y="90" width="620" height="44" rx="6" fill="#bae6fd"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="13">Provider frame: dst | src | S-tag (VLAN 100) | C-tag (VLAN 10) | payload</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">Egress removes the S-tag (pop) and the customer frame is delivered unchanged</text>
</svg><p class="cap">The provider core sees only the S-tag; each customer keeps its own VLAN numbering.</p></div>
<ul>
<li><b>S-tag</b> identifies the customer service across the provider network.</li>
<li><b>C-tag</b> belongs to the customer; the provider does not read or change it.</li>
<li>A frame gets one more tag, so it is 4 bytes bigger. Make sure the provider links allow the larger frame size (a jumbo or enlarged MTU).</li>
<li>MAC addresses of the customers are learned in the provider's S-VLAN, so a big customer can fill the provider MAC table.</li>
</ul>

<h3>The lab: two customers over one pair of PEs</h3>
<p>PE1 and PE2 serve two customers. ACME uses ge-0/0/1 (customer VLANs 10 and 20) and gets S-VLAN 100. BETA uses ge-0/0/2 (customer VLAN 10, the same number as ACME's) and gets S-VLAN 200. ge-0/0/10 is the network-to-network link between the PEs. The configuration on PE1 for ACME (PE2 is identical):</p>
<pre class="code">set interfaces ge-0/0/1 flexible-vlan-tagging
set interfaces ge-0/0/1 encapsulation extended-vlan-bridge
set interfaces ge-0/0/1 unit 100 vlan-id-list [ 10 20 ]
set interfaces ge-0/0/1 unit 100 input-vlan-map push
set interfaces ge-0/0/1 unit 100 output-vlan-map pop
set interfaces ge-0/0/10 flexible-vlan-tagging
set interfaces ge-0/0/10 encapsulation extended-vlan-bridge
set interfaces ge-0/0/10 unit 100 vlan-id 100
set vlans SVLAN-ACME interface ge-0/0/1.100
set vlans SVLAN-ACME interface ge-0/0/10.100</pre>
<p>Read the lines in groups. The customer-facing unit accepts the customer VLANs in <code>vlan-id-list</code>, <code>input-vlan-map push</code> adds the S-tag on the way in and <code>output-vlan-map pop</code> removes it on the way out. The NNI unit carries S-tag 100. The VLAN SVLAN-ACME joins both logical interfaces. BETA is the same with unit 200 and S-VLAN 200. The resulting interface configuration:</p>
<pre class="out">lab@PE1&gt; show configuration interfaces ge-0/0/1
flexible-vlan-tagging;
encapsulation extended-vlan-bridge;
unit 100 {
    vlan-id-list [ 10 20 ];
    input-vlan-map {
        push;
    }
    output-vlan-map {
        pop;
    }
}
lab@PE1&gt; show configuration interfaces ge-0/0/10
description "NNI to the other PE";
flexible-vlan-tagging;
encapsulation extended-vlan-bridge;
unit 100 {
    vlan-id 100;
}
unit 200 {
    vlan-id 200;
}</pre>
<p>The simulator recognises the arrangement as a service VLAN and prints it:</p>
<pre class="out">lab@PE1&gt; show vlans extensive
VLAN Name: SVLAN-ACME                    State: Active
Tag: 100
Q-in-Q service VLAN: customer tags are kept and an S-tag is pushed on the provider side
Number of interfaces: 2 (Active = 2)
  Tagged interfaces: ge-0/0/10.100* (provider (S-tag 100)), ge-0/0/1.100* (customer (C-VLANs 10,20))

VLAN Name: SVLAN-BETA                    State: Active
Tag: 200
Q-in-Q service VLAN: customer tags are kept and an S-tag is pushed on the provider side
Number of interfaces: 2 (Active = 2)
  Tagged interfaces: ge-0/0/10.200* (provider (S-tag 200)), ge-0/0/2.200* (customer (C-VLANs 10))</pre>
<p>The customer side lists C-VLANs 10,20 for ACME and only 10 for BETA, while the provider side shows the S-tag. Customer traffic works end to end. The first ping is between ACME sites, the second between BETA sites, both from customer devices:</p>
<pre class="out">lab@CE1&gt; ping 10.20.0.2 count 3
PING 10.20.0.2 (10.20.0.2): 56 data bytes
64 bytes from 10.20.0.2: icmp_seq=0 ttl=64 time=2.300 ms
64 bytes from 10.20.0.2: icmp_seq=1 ttl=64 time=2.600 ms
64 bytes from 10.20.0.2: icmp_seq=2 ttl=64 time=1.200 ms
--- 10.20.0.2 ping statistics ---
3 packets transmitted, 3 packets received, 0% packet loss
round-trip min/avg/max/stddev = 1.200/2.033/2.600/0.467 ms

lab@RB1&gt; ping 10.10.0.2 count 3
PING 10.10.0.2 (10.10.0.2): 56 data bytes
64 bytes from 10.10.0.2: icmp_seq=0 ttl=64 time=1.200 ms
64 bytes from 10.10.0.2: icmp_seq=1 ttl=64 time=1.500 ms
64 bytes from 10.10.0.2: icmp_seq=2 ttl=64 time=1.800 ms
--- 10.10.0.2 ping statistics ---
3 packets transmitted, 3 packets received, 0% packet loss
round-trip min/avg/max/stddev = 1.200/1.500/1.800/0.200 ms</pre>
<p>The MAC table on PE2 shows that the provider learns customers' MACs inside the S-VLANs, so the two customers cannot see each other even though both use C-VLAN 10:</p>
<pre class="out">lab@PE2&gt; show ethernet-switching table
   Vlan                MAC                 MAC         Age    Logical
   name                address             flags              interface
   SVLAN-ACME          00:50:7f:06:6d:01   D           -      ge-0/0/10.100
   SVLAN-ACME          00:50:80:06:6e:01   D           -      ge-0/0/1.100
   SVLAN-ACME          52:54:1c:58:b9:00   D           -      ge-0/0/10.100
   SVLAN-ACME          52:54:1f:58:be:00   D           -      ge-0/0/1.100
   SVLAN-BETA          52:54:d8:e0:66:01   D           -      ge-0/0/10.200
   SVLAN-BETA          52:54:db:e0:6b:01   D           -      ge-0/0/2.200</pre>

<h3>Related tools (config only, not simulated in this lab)</h3>
<ul>
<li><b>Port-level tunnelling.</b> On Enhanced Layer 2 Software a service VLAN can use <code>dot1q-tunneling</code>, where all frames entering an access port, tagged or not, are given the S-tag.</li>
<li><b>VLAN mapping (translation).</b> A switch can replace one tag with another, for example to join two sites that use different numbers for the same VLAN (<code>vlan-rewrite translate</code> in the ELS style). The service sees one VLAN while the sites keep their numbers.</li>
<li><b>Ethertype.</b> The S-tag can use 0x88a8 (802.1ad) while the C-tag uses 0x8100. Both ends of a provider link must agree on it.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Customer ACME sends a frame in C-VLAN 20 into ge-0/0/1 of PE1. PE1 pushes S-tag 100, so the frame carries 100 then 20. The core forwards it on S-VLAN 100 only. PE2 pops the S-tag and delivers the original C-VLAN 20 frame to ACME's second site. BETA's own VLAN 20 would use S-tag 200 and cannot mix with ACME's.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting the larger frame. A full 1500-byte payload with two tags is 1526 bytes, and the NNI link or a transit switch with a small MTU drops it, while small pings still work. The other common error is a missing <code>input-vlan-map push</code>/<code>output-vlan-map pop</code> pair, which leaves frames unmodified or one-way.</p></div>
<div class="exam"><p><b>Exam trap.</b> Customer VLANs can overlap between customers because the S-tag keeps them apart. Which VLAN a provider switch forwards on is the outer S-tag, not the C-tag. If a question lists identical customer VLAN IDs on two customers, the answer is separate service VLANs.</p></div>

<div class="scn"><h4>Same VLAN, two customers</h4><p>An ISP onboarded a second customer who also used VLAN 10. Rather than asking either to renumber, the ISP gave each its own S-VLAN. Both customers kept their numbering and neither could see the other's broadcasts.</p><p><b>Lesson:</b> the S-tag turns a customer VLAN plan from a global problem into a local one.</p></div>

<div class="iv"><p class="q">"What is Q-in-Q and why would a provider use it?"</p><p>Q-in-Q pushes an outer service tag over the customer's tag, so the provider forwards on the S-tag and carries the customer's VLANs untouched. It isolates customers with overlapping VLAN IDs and hides their VLAN plan. The cost is 4 more bytes per frame, so the MTU must allow it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Q-in-Q pushes an S-tag over the C-tag; the core uses only the S-tag.</li>
<li>Customer interface: vlan-id-list, input-vlan-map push, output-vlan-map pop.</li>
<li>NNI interface carries the S-tag and joins the S-VLAN together with the customer interface.</li>
<li>Check the MTU for the extra tag and verify with show vlans extensive.</li>
</ul></div>
`,hi:`
<p>Do offices wali company chahti hai ki woh ek switched network jaise dikhein, dono ends par apne VLANs 10 aur 20 ke saath. Doosri company bhi yahi chahti hai, aur woh bhi VLAN 10 use karti hai. Provider dono ko ek network par VLAN 10 nahi de sakta, aur woh customers ka VLAN plan jaanna bhi nahi chahta. <b>Q-in-Q (IEEE 802.1ad, provider bridging)</b> yeh solve karta hai: provider customer ke apne tag (customer tag, C-tag) ke aage ek <b>bahari tag</b> (service tag, S-tag) jodta hai. Core sirf S-tag par forward karta hai; C-tag bina chhue le jaaya jaata hai.</p>

<h3>Frame</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Q-in-Q frame">
<rect x="10" y="20" width="620" height="44" rx="6" fill="#e2e8f0"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">Customer frame: dst MAC | src MAC | C-tag (VLAN 10) | payload</text>
<line x1="320" y1="64" x2="320" y2="86" stroke="#64748b" stroke-width="2"/><text x="345" y="80" class="svg-accent" font-size="12">ingress par S-tag push</text>
<rect x="10" y="90" width="620" height="44" rx="6" fill="#bae6fd"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="13">Provider frame: dst | src | S-tag (VLAN 100) | C-tag (VLAN 10) | payload</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">Egress S-tag hata deta hai (pop) aur customer frame waisa hi deliver hota hai</text>
</svg><p class="cap">Provider core sirf S-tag dekhta hai; har customer apni VLAN numbering rakhta hai.</p></div>
<ul>
<li><b>S-tag</b> provider network mein customer service ko pehchanta hai.</li>
<li><b>C-tag</b> customer ka hai; provider ise padhta ya badalta nahi.</li>
<li>Frame mein ek tag aur jud jaata hai, isliye woh 4 bytes bada hota hai. Dekho ki provider links bade frame size (jumbo ya badha hua MTU) allow karte hain.</li>
<li>Customers ke MAC addresses provider ke S-VLAN mein seekhe jaate hain, isliye bada customer provider MAC table bhar sakta hai.</li>
</ul>

<h3>Lab: ek PE pair par do customers</h3>
<p>PE1 aur PE2 do customers ko serve karte hain. ACME ge-0/0/1 use karta hai (customer VLANs 10 aur 20) aur S-VLAN 100 paata hai. BETA ge-0/0/2 use karta hai (customer VLAN 10, ACME jaisa hi number) aur S-VLAN 200 paata hai. ge-0/0/10 PEs ke beech network-to-network link hai. PE1 par ACME ki configuration (PE2 par bilkul same):</p>
<pre class="code">set interfaces ge-0/0/1 flexible-vlan-tagging
set interfaces ge-0/0/1 encapsulation extended-vlan-bridge
set interfaces ge-0/0/1 unit 100 vlan-id-list [ 10 20 ]
set interfaces ge-0/0/1 unit 100 input-vlan-map push
set interfaces ge-0/0/1 unit 100 output-vlan-map pop
set interfaces ge-0/0/10 flexible-vlan-tagging
set interfaces ge-0/0/10 encapsulation extended-vlan-bridge
set interfaces ge-0/0/10 unit 100 vlan-id 100
set vlans SVLAN-ACME interface ge-0/0/1.100
set vlans SVLAN-ACME interface ge-0/0/10.100</pre>
<p>Lines ko groups mein padho. Customer-facing unit <code>vlan-id-list</code> mein customer VLANs accept karta hai, <code>input-vlan-map push</code> andar aate waqt S-tag jodta hai aur <code>output-vlan-map pop</code> bahar jaate waqt hatata hai. NNI unit S-tag 100 carry karta hai. SVLAN-ACME dono logical interfaces ko jodta hai. BETA wahi hai, unit 200 aur S-VLAN 200 ke saath. Nateeja interface configuration:</p>
<pre class="out">lab@PE1&gt; show configuration interfaces ge-0/0/1
flexible-vlan-tagging;
encapsulation extended-vlan-bridge;
unit 100 {
    vlan-id-list [ 10 20 ];
    input-vlan-map {
        push;
    }
    output-vlan-map {
        pop;
    }
}
lab@PE1&gt; show configuration interfaces ge-0/0/10
description "NNI to the other PE";
flexible-vlan-tagging;
encapsulation extended-vlan-bridge;
unit 100 {
    vlan-id 100;
}
unit 200 {
    vlan-id 200;
}</pre>
<p>Simulator is arrangement ko service VLAN pehchanta hai aur print karta hai:</p>
<pre class="out">lab@PE1&gt; show vlans extensive
VLAN Name: SVLAN-ACME                    State: Active
Tag: 100
Q-in-Q service VLAN: customer tags are kept and an S-tag is pushed on the provider side
Number of interfaces: 2 (Active = 2)
  Tagged interfaces: ge-0/0/10.100* (provider (S-tag 100)), ge-0/0/1.100* (customer (C-VLANs 10,20))

VLAN Name: SVLAN-BETA                    State: Active
Tag: 200
Q-in-Q service VLAN: customer tags are kept and an S-tag is pushed on the provider side
Number of interfaces: 2 (Active = 2)
  Tagged interfaces: ge-0/0/10.200* (provider (S-tag 200)), ge-0/0/2.200* (customer (C-VLANs 10))</pre>
<p>Customer side ACME ke liye C-VLANs 10,20 aur BETA ke liye sirf 10 dikhata hai, jabki provider side S-tag dikhata hai. Customer traffic end to end chalta hai. Pehla ping ACME sites ke beech, doosra BETA sites ke beech, dono customer devices se:</p>
<pre class="out">lab@CE1&gt; ping 10.20.0.2 count 3
PING 10.20.0.2 (10.20.0.2): 56 data bytes
64 bytes from 10.20.0.2: icmp_seq=0 ttl=64 time=2.300 ms
64 bytes from 10.20.0.2: icmp_seq=1 ttl=64 time=2.600 ms
64 bytes from 10.20.0.2: icmp_seq=2 ttl=64 time=1.200 ms
--- 10.20.0.2 ping statistics ---
3 packets transmitted, 3 packets received, 0% packet loss
round-trip min/avg/max/stddev = 1.200/2.033/2.600/0.467 ms

lab@RB1&gt; ping 10.10.0.2 count 3
PING 10.10.0.2 (10.10.0.2): 56 data bytes
64 bytes from 10.10.0.2: icmp_seq=0 ttl=64 time=1.200 ms
64 bytes from 10.10.0.2: icmp_seq=1 ttl=64 time=1.500 ms
64 bytes from 10.10.0.2: icmp_seq=2 ttl=64 time=1.800 ms
--- 10.10.0.2 ping statistics ---
3 packets transmitted, 3 packets received, 0% packet loss
round-trip min/avg/max/stddev = 1.200/1.500/1.800/0.200 ms</pre>
<p>PE2 ka MAC table dikhata hai ki provider customers ke MACs S-VLANs ke andar seekhta hai, isliye dono customers ek doosre ko nahi dekh sakte chahe dono C-VLAN 10 use karte hon:</p>
<pre class="out">lab@PE2&gt; show ethernet-switching table
   Vlan                MAC                 MAC         Age    Logical
   name                address             flags              interface
   SVLAN-ACME          00:50:7f:06:6d:01   D           -      ge-0/0/10.100
   SVLAN-ACME          00:50:80:06:6e:01   D           -      ge-0/0/1.100
   SVLAN-ACME          52:54:1c:58:b9:00   D           -      ge-0/0/10.100
   SVLAN-ACME          52:54:1f:58:be:00   D           -      ge-0/0/1.100
   SVLAN-BETA          52:54:d8:e0:66:01   D           -      ge-0/0/10.200
   SVLAN-BETA          52:54:db:e0:6b:01   D           -      ge-0/0/2.200</pre>

<h3>Related tools (sirf config, is lab mein simulate nahi)</h3>
<ul>
<li><b>Port-level tunnelling.</b> Enhanced Layer 2 Software par service VLAN <code>dot1q-tunneling</code> use kar sakta hai, jahan access port mein aane wale saare frames, tagged ya untagged, S-tag paate hain.</li>
<li><b>VLAN mapping (translation).</b> Switch ek tag ko doosre se badal sakta hai, jaise do sites jodne ke liye jo ek hi VLAN ke liye alag number use karte hain (ELS style mein <code>vlan-rewrite translate</code>). Service ek VLAN dekhti hai jabki sites apne numbers rakhte hain.</li>
<li><b>Ethertype.</b> S-tag 0x88a8 (802.1ad) use kar sakta hai jabki C-tag 0x8100. Provider link ke dono ends ko ispar sahmat hona chahiye.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Customer ACME PE1 ke ge-0/0/1 mein C-VLAN 20 ka frame bhejta hai. PE1 S-tag 100 push karta hai, isliye frame 100 phir 20 carry karta hai. Core use sirf S-VLAN 100 par forward karta hai. PE2 S-tag pop karta hai aur original C-VLAN 20 frame ACME ki doosri site ko deliver karta hai. BETA ka apna VLAN 20 S-tag 200 use karega aur ACME ke saath mil nahi sakta.</p></div>

<div class="warn"><p><b>Common mistake.</b> Bade frame ko bhool jaana. Poore 1500-byte payload ke saath do tags 1526 bytes hote hain, aur chhote MTU wala NNI link ya transit switch use drop kar deta hai, jabki chhote pings phir bhi chalte hain. Doosri aam galti: <code>input-vlan-map push</code>/<code>output-vlan-map pop</code> ka jodi missing, jo frames ko unmodified ya sirf ek disha mein chhod deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Customers ke VLANs overlap kar sakte hain kyunki S-tag unhe alag rakhta hai. Provider switch jis VLAN par forward karta hai woh bahari S-tag hai, C-tag nahi. Agar sawaal mein do customers ke identical VLAN IDs hon to jawab alag service VLANs hai.</p></div>

<div class="scn"><h4>Same VLAN, do customers</h4><p>Ek ISP ne doosra customer onboard kiya jo bhi VLAN 10 use karta tha. Kisi se renumber karne ko kehne ke bajaye ISP ne har ek ko apna S-VLAN diya. Dono customers ne apni numbering rakhi aur koi doosre ka broadcast nahi dekh paaya.</p><p><b>Lesson:</b> S-tag customer VLAN plan ko global problem se local problem bana deta hai.</p></div>

<div class="iv"><p class="q">"Q-in-Q kya hai aur provider ise kyun use karega?"</p><p>Q-in-Q customer ke tag ke upar bahari service tag push karta hai, isliye provider S-tag par forward karta hai aur customer ke VLANs bina chhue le jaata hai. Yeh overlapping VLAN IDs wale customers ko alag rakhta hai aur unka VLAN plan chhupata hai. Keemat: har frame mein 4 bytes zyaada, isliye MTU allow kare.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Q-in-Q C-tag ke upar S-tag push karta hai; core sirf S-tag use karta hai.</li>
<li>Customer interface: vlan-id-list, input-vlan-map push, output-vlan-map pop.</li>
<li>NNI interface S-tag carry karta hai aur customer interface ke saath S-VLAN mein judta hai.</li>
<li>Extra tag ke liye MTU check karo aur show vlans extensive se verify karo.</li>
</ul></div>
`}};export{e as default};