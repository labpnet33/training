var e={id:`mpls-labels-ldp`,h:{en:`MPLS in plain words: labels, LDP and the label stack`,hi:`MPLS saaf shabdon mein: labels, LDP aur label stack`},body:{en:`
<p>An ordinary router reads the destination IP address of every packet and looks it up in a routing table. That works, but in a provider core it means every router needs a table for every destination. <b>MPLS</b> (Multiprotocol Label Switching) changes the idea: the router at the edge sticks a short <b>label</b> on the packet, and the routers in the middle forward by looking only at the label, like a railway coach whose ticket says "platform 4" instead of the full address.</p>

<h3>The words you need</h3>
<dl class="terms">
<dt>Label</dt><dd>A 20-bit number in a 32-bit header placed between the layer 2 and layer 3 headers. The header also has 3 bits for traffic class, 1 bit for bottom-of-stack and 8 bits of TTL.</dd>
<dt>LSR</dt><dd>Label Switching Router: any router that forwards labelled packets (P routers and PEs).</dd>
<dt>LSP</dt><dd>Label Switched Path: the one-way path a labelled packet follows from ingress PE to egress PE.</dd>
<dt>LDP</dt><dd>Label Distribution Protocol: the protocol that tells neighbours "for this prefix, send me packets with label X". It runs on TCP port 646 between neighbours.</dd>
<dt>Push, swap, pop</dt><dd>The three label operations: the ingress PE <b>pushes</b> a label, each P router <b>swaps</b> it, the last or second-last router <b>pops</b> it.</dd>
<dt>PHP</dt><dd>Penultimate Hop Popping: the router before the egress removes the label so the egress does only one lookup.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Push swap pop">
<rect x="15" y="60" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="60" y="90" text-anchor="middle" class="svg-ink" font-size="13">PE1</text>
<rect x="175" y="60" width="90" height="50" rx="8" fill="#fde68a"/><text x="220" y="90" text-anchor="middle" class="svg-ink" font-size="13">P1</text>
<rect x="335" y="60" width="90" height="50" rx="8" fill="#fde68a"/><text x="380" y="90" text-anchor="middle" class="svg-ink" font-size="13">P2</text>
<rect x="495" y="60" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="540" y="90" text-anchor="middle" class="svg-ink" font-size="13">PE2</text>
<g stroke="#64748b" stroke-width="2"><line x1="105" y1="85" x2="175" y2="85"/><line x1="265" y1="85" x2="335" y2="85"/><line x1="425" y1="85" x2="495" y2="85"/></g>
<text x="140" y="75" text-anchor="middle" class="svg-accent" font-size="12">label 21</text><text x="300" y="75" text-anchor="middle" class="svg-accent" font-size="12">label 19</text><text x="460" y="75" text-anchor="middle" class="svg-muted" font-size="12">no label</text>
<text x="60" y="135" text-anchor="middle" class="svg-ink" font-size="12">PUSH</text><text x="220" y="135" text-anchor="middle" class="svg-ink" font-size="12">SWAP 21 to 19</text><text x="380" y="135" text-anchor="middle" class="svg-ink" font-size="12">POP (PHP)</text><text x="540" y="135" text-anchor="middle" class="svg-ink" font-size="12">IP lookup</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">Label values are local to each link and chosen by the receiving router</text>
</svg><p class="cap">One packet, one label pushed, swapped once and popped one hop before the egress.</p></div>

<h3>How labels are created</h3>
<p>Every LSR assigns a local label to each prefix in its IGP table, and LDP tells its neighbours. LDP neighbours are found by multicast hellos on each MPLS-enabled interface (UDP 646), then a TCP session starts between the <b>LDP router IDs</b>, normally the loopbacks. Because the LDP session runs between loopback addresses, the IGP must carry them, which is why chapter 3 mattered. In the lab, LDP is enabled with just a few commands, for example <code>mpls ldp router-id Loopback0 force</code> and, under <code>router isis</code>, <code>mpls ldp autoconfig</code>.</p>

<h3>The lab, in real output</h3>
<p>From the spcor-mpls-ldp lab (PE1 - P1 - P2 - PE2), on P1:</p>
<pre class="out">P1# show mpls ldp neighbor
    Peer LDP Ident: 10.0.255.1:0; Local LDP Ident 10.0.255.2:0
        State: <span class="hl">Oper</span>; Msgs sent/rcvd: 8/7; Downstream
        LDP discovery sources:
          GigabitEthernet0/1, Src IP addr: 10.0.12.1
...
P1# show mpls forwarding-table
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
Label      Label      or Tunnel Id     Switched      interface
17         Pop Label  10.0.255.3/32    0             Gi0/2      10.0.23.3
18         17         10.0.255.4/32    0             Gi0/2      10.0.23.3
20         Pop Label  10.0.255.1/32    0             Gi0/1      10.0.12.1
21         <span class="hl">19</span>         192.168.2.0/24   720           Gi0/2      10.0.23.3</pre>
<p>Read a line: "Local label 21 on P1 means traffic for 192.168.2.0/24; swap it to outgoing label 19 and send it out Gi0/2 to 10.0.23.3." <code>Pop Label</code> lines are the PHP cases. Now the traceroute from PE1 shows the labels the probe carried at each hop:</p>
<pre class="out">PE1# traceroute 192.168.2.10
  1 10.0.12.2 [MPLS: Label <span class="hl">21</span> Exp 0] 1 msec 2 msec 1 msec
  2 10.0.23.3 [MPLS: Label <span class="hl">19</span> Exp 0] 2 msec 3 msec 2 msec
  3 10.0.34.4 3 msec 4 msec 3 msec
  4 192.168.2.10 4 msec 5 msec 4 msec</pre>
<p>PE1 pushed 21, P1 swapped to 19, P2 popped it (the packet reached PE2 with no label). Push, swap, pop, exactly as in the picture.</p>

<h3>The label stack and why it matters for VPNs</h3>
<p>Labels can be stacked. In an MPLS VPN the ingress PE pushes <b>two</b> labels: the outer <b>transport label</b> (LDP) gets the packet to the egress PE, the inner <b>VPN label</b> tells the egress PE which customer VRF the packet belongs to. P routers only ever look at the outer label, so they never learn customer routes. The next chapter builds on this.</p>

<div class="eg"><p><b>Worked example.</b> PE1 sends traffic to a destination behind PE2. It looks up the BGP next hop 10.0.255.4 and finds LDP label 18 for that loopback. It pushes 18. P1 swaps 18 for 17. P2 is the penultimate hop and pops, so PE2 receives the packet without a transport label (the VPN label, if there is one, is still inside).</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling LDP but not advertising the loopbacks in the IGP, or using the wrong LDP router ID. The TCP session needs reachability between router IDs. If the ID is a link address that is not reachable from the neighbour, the neighbour stays "discovered" but never reaches Oper.</p></div>
<div class="exam"><p><b>Exam trap.</b> Labels have local significance: label 21 on one link has no relation to label 21 elsewhere. And PHP means the penultimate router pops, so the egress PE receives an unlabelled packet (or only the VPN label).</p></div>

<div class="scn"><h4>Customer traffic black-holed after an IGP change</h4><p>After a maintenance window, VPN customers lost connectivity although BGP looked healthy. An engineer ran a traceroute to the remote PE loopback and saw plain IP with no labels from the second hop: LDP had not re-formed on a new link, so the core dropped labelled traffic. Enabling LDP on that interface (via autoconfig) restored the LSP.</p><p><b>Lesson:</b> a VPN needs a labelled path in the core. Check LDP when routes exist but traffic does not.</p></div>

<div class="iv"><p class="q">"Explain how a packet is forwarded across an MPLS core."</p><p>The ingress PE looks up the destination, pushes a label for the next hop LSP, each P router swaps the label using its label forwarding table without looking at the IP header, and the penultimate router pops the label so the egress PE does an IP (or VRF) lookup. LDP distributes the labels, based on the IGP routes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MPLS forwards on a short label; the core does not look up customer IP addresses.</li>
<li>LDP creates labels for IGP prefixes and runs between loopbacks.</li>
<li>Push at the ingress, swap in the core, pop at the penultimate hop (PHP).</li>
<li>VPN packets carry two labels: transport (outer) and VPN (inner).</li>
<li>show mpls forwarding-table and traceroute show the label path.</li>
</ul></div>
`,hi:`
<p>Aam router har packet ka destination IP address padhta hai aur use routing table mein dhoondhta hai. Yeh kaam karta hai, par provider core mein iska matlab hai har router ko har destination ki table chahiye. <b>MPLS</b> (Multiprotocol Label Switching) idea badal deta hai: edge ka router packet par ek chhota <b>label</b> chipka deta hai, aur beech ke routers sirf label dekhkar forward karte hain, jaise train coach ka ticket poora address ki jagah "platform 4" kehta hai.</p>

<h3>Zaroori shabd</h3>
<dl class="terms">
<dt>Label</dt><dd>32-bit header mein 20-bit number jo layer 2 aur layer 3 headers ke beech lagta hai. Header mein traffic class ke 3 bits, bottom-of-stack ka 1 bit aur TTL ke 8 bits bhi hote hain.</dd>
<dt>LSR</dt><dd>Label Switching Router: koi bhi router jo labelled packets forward karta hai (P routers aur PEs).</dd>
<dt>LSP</dt><dd>Label Switched Path: ingress PE se egress PE tak labelled packet ka one-way path.</dd>
<dt>LDP</dt><dd>Label Distribution Protocol: woh protocol jo neighbours ko batata hai "is prefix ke liye label X ke saath packets bhejo". Yeh neighbours ke beech TCP port 646 par chalta hai.</dd>
<dt>Push, swap, pop</dt><dd>Teen label operations: ingress PE label <b>push</b> karta hai, har P router use <b>swap</b> karta hai, aakhri ya aakhri se pehla router use <b>pop</b> karta hai.</dd>
<dt>PHP</dt><dd>Penultimate Hop Popping: egress se pehla router label hata deta hai taaki egress sirf ek lookup kare.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Push swap pop">
<rect x="15" y="60" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="60" y="90" text-anchor="middle" class="svg-ink" font-size="13">PE1</text>
<rect x="175" y="60" width="90" height="50" rx="8" fill="#fde68a"/><text x="220" y="90" text-anchor="middle" class="svg-ink" font-size="13">P1</text>
<rect x="335" y="60" width="90" height="50" rx="8" fill="#fde68a"/><text x="380" y="90" text-anchor="middle" class="svg-ink" font-size="13">P2</text>
<rect x="495" y="60" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="540" y="90" text-anchor="middle" class="svg-ink" font-size="13">PE2</text>
<g stroke="#64748b" stroke-width="2"><line x1="105" y1="85" x2="175" y2="85"/><line x1="265" y1="85" x2="335" y2="85"/><line x1="425" y1="85" x2="495" y2="85"/></g>
<text x="140" y="75" text-anchor="middle" class="svg-accent" font-size="12">label 21</text><text x="300" y="75" text-anchor="middle" class="svg-accent" font-size="12">label 19</text><text x="460" y="75" text-anchor="middle" class="svg-muted" font-size="12">label nahi</text>
<text x="60" y="135" text-anchor="middle" class="svg-ink" font-size="12">PUSH</text><text x="220" y="135" text-anchor="middle" class="svg-ink" font-size="12">SWAP 21 se 19</text><text x="380" y="135" text-anchor="middle" class="svg-ink" font-size="12">POP (PHP)</text><text x="540" y="135" text-anchor="middle" class="svg-ink" font-size="12">IP lookup</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">Label values har link par local hote hain aur receiving router chunta hai</text>
</svg><p class="cap">Ek packet, ek label push hua, ek baar swap hua aur egress se ek hop pehle pop hua.</p></div>

<h3>Labels kaise bante hain</h3>
<p>Har LSR apni IGP table ke har prefix ko local label assign karta hai, aur LDP neighbours ko batata hai. LDP neighbours har MPLS-enabled interface par multicast hellos (UDP 646) se milte hain, phir <b>LDP router IDs</b> ke beech, aam taur par loopbacks, TCP session shuru hota hai. Kyunki LDP session loopback addresses ke beech chalta hai, IGP ko unhe le jaana padta hai, isiliye chapter 3 important tha. Lab mein LDP kuch hi commands se on hota hai, jaise <code>mpls ldp router-id Loopback0 force</code> aur <code>router isis</code> ke neeche <code>mpls ldp autoconfig</code>.</p>

<h3>Lab real output mein</h3>
<p>spcor-mpls-ldp lab (PE1 - P1 - P2 - PE2) se, P1 par:</p>
<pre class="out">P1# show mpls ldp neighbor
    Peer LDP Ident: 10.0.255.1:0; Local LDP Ident 10.0.255.2:0
        State: <span class="hl">Oper</span>; Msgs sent/rcvd: 8/7; Downstream
        LDP discovery sources:
          GigabitEthernet0/1, Src IP addr: 10.0.12.1
...
P1# show mpls forwarding-table
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
Label      Label      or Tunnel Id     Switched      interface
17         Pop Label  10.0.255.3/32    0             Gi0/2      10.0.23.3
18         17         10.0.255.4/32    0             Gi0/2      10.0.23.3
20         Pop Label  10.0.255.1/32    0             Gi0/1      10.0.12.1
21         <span class="hl">19</span>         192.168.2.0/24   720           Gi0/2      10.0.23.3</pre>
<p>Ek line padho: "P1 par local label 21 ka matlab 192.168.2.0/24 ka traffic; use outgoing label 19 mein swap karo aur Gi0/2 se 10.0.23.3 ko bhejo." <code>Pop Label</code> wali lines PHP ke cases hain. Ab PE1 ka traceroute dikhata hai ki probe ne har hop par kaunse labels le rakhe the:</p>
<pre class="out">PE1# traceroute 192.168.2.10
  1 10.0.12.2 [MPLS: Label <span class="hl">21</span> Exp 0] 1 msec 2 msec 1 msec
  2 10.0.23.3 [MPLS: Label <span class="hl">19</span> Exp 0] 2 msec 3 msec 2 msec
  3 10.0.34.4 3 msec 4 msec 3 msec
  4 192.168.2.10 4 msec 5 msec 4 msec</pre>
<p>PE1 ne 21 push kiya, P1 ne 19 mein swap kiya, P2 ne pop kar diya (packet PE2 tak bina label pahuncha). Push, swap, pop, bilkul picture jaisa.</p>

<h3>Label stack aur VPNs ke liye iska matlab</h3>
<p>Labels stack ho sakte hain. MPLS VPN mein ingress PE <b>do</b> labels push karta hai: bahar ka <b>transport label</b> (LDP) packet ko egress PE tak pahunchata hai, andar ka <b>VPN label</b> egress PE ko batata hai ki packet kaunse customer VRF ka hai. P routers sirf bahar ka label dekhte hain, isliye woh customer routes kabhi nahi seekhte. Agla chapter isi par bana hai.</p>

<div class="eg"><p><b>Worked example.</b> PE1 PE2 ke peeche ki destination ko traffic bhejta hai. Woh BGP next hop 10.0.255.4 lookup karta hai aur us loopback ke liye LDP label 18 paata hai. Woh 18 push karta hai. P1 18 ko 17 se swap karta hai. P2 penultimate hop hai aur pop karta hai, isliye PE2 ko packet bina transport label ke milta hai (VPN label, agar hai, ab bhi andar hai).</p></div>

<div class="warn"><p><b>Common mistake.</b> LDP enable karna par loopbacks IGP mein advertise na karna, ya galat LDP router ID. TCP session ko router IDs ke beech reachability chahiye. Agar ID koi link address hai jo neighbour se reachable nahi, to neighbour "discovered" rehta hai par Oper tak nahi pahunchta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Labels ka local significance hota hai: ek link par label 21 ka doosri jagah ke label 21 se koi rishta nahi. Aur PHP ka matlab penultimate router pop karta hai, isliye egress PE ko unlabelled packet (ya sirf VPN label) milta hai.</p></div>

<div class="scn"><h4>IGP change ke baad customer traffic black-hole</h4><p>Maintenance window ke baad VPN customers ka connectivity chala gaya jabki BGP theek dikh raha tha. Engineer ne remote PE loopback ka traceroute chalaya aur doosre hop se plain IP dekha, label nahi: naye link par LDP dobara nahi bana tha, isliye core labelled traffic drop kar raha tha. Us interface par LDP enable karne (autoconfig se) se LSP wapas aa gaya.</p><p><b>Lesson:</b> VPN ko core mein labelled path chahiye. Routes hain par traffic nahi, to LDP check karo.</p></div>

<div class="iv"><p class="q">"MPLS core mein packet forward hone ka process samjhao."</p><p>Ingress PE destination lookup karta hai, next hop LSP ka label push karta hai, har P router IP header dekhe bina apni label forwarding table se label swap karta hai, aur penultimate router label pop karta hai taaki egress PE IP (ya VRF) lookup kare. LDP IGP routes ke base par labels distribute karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MPLS chhote label par forward karta hai; core customer IP addresses lookup nahi karta.</li>
<li>LDP IGP prefixes ke liye labels banata hai aur loopbacks ke beech chalta hai.</li>
<li>Ingress par push, core mein swap, penultimate hop par pop (PHP).</li>
<li>VPN packets do labels le jaate hain: transport (bahar) aur VPN (andar).</li>
<li>show mpls forwarding-table aur traceroute label path dikhate hain.</li>
</ul></div>
`}};export{e as default};