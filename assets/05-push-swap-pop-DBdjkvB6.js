var e={id:`push-swap-pop`,h:{en:`Label operations: push, swap and pop, hop by hop`,hi:`Label operations: push, swap aur pop, hop by hop`},body:{en:`
<p>A relay race has only three moves: the first runner <b>takes</b> the baton from the starter, every runner in the middle <b>hands it over</b> to the next, and the last runner <b>drops</b> it at the finish line. MPLS forwarding also has just three moves on the top label: <b>push</b>, <b>swap</b> and <b>pop</b>. Every LFIB entry you will ever read is one of these, sometimes combined.</p>

<h3>The three operations</h3>
<table class="cmp"><tr><th>Operation</th><th>Who does it</th><th>What happens</th><th>How it shows in IOS</th></tr>
<tr><td><b>Push</b> (impose)</td><td>Ingress LER</td><td>Adds one or more labels on top of the packet</td><td>FIB (<code>show ip cef</code>) shows "label N"</td></tr>
<tr><td><b>Swap</b></td><td>Transit LSR</td><td>Replaces the top label with a new value, decrements TTL</td><td>LFIB outgoing label is a number</td></tr>
<tr><td><b>Pop</b> (dispose)</td><td>Penultimate LSR or egress</td><td>Removes the top label; the next label or the IP header is exposed</td><td>LFIB shows "Pop Label"</td></tr></table>
<p>There is also an "untagged" case, shown as <b>No Label</b>: the router removes all labels and sends a plain IP packet because the next hop gave no label for this prefix. That is usually a symptom of a missing LDP session and is covered in chapter 12.</p>

<h3>Packet walk: PE1 to PE2's loopback</h3>
<p>Use the lab core: PE1 (1.1.1.1) – P1 (2.2.2.2) – P2 (3.3.3.3) – PE2 (4.4.4.4), OSPF everywhere, LDP on the three core links. The label values below match the earlier chapters.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Packet walk push swap pop">
<rect x="20" y="40" width="110" height="40" rx="8" fill="#bae6fd"/><text x="75" y="65" text-anchor="middle" class="svg-ink" font-size="13">PE1</text>
<rect x="190" y="40" width="110" height="40" rx="8" fill="#ddd6fe"/><text x="245" y="65" text-anchor="middle" class="svg-ink" font-size="13">P1</text>
<rect x="360" y="40" width="110" height="40" rx="8" fill="#ddd6fe"/><text x="415" y="65" text-anchor="middle" class="svg-ink" font-size="13">P2</text>
<rect x="530" y="40" width="100" height="40" rx="8" fill="#bae6fd"/><text x="580" y="65" text-anchor="middle" class="svg-ink" font-size="13">PE2</text>
<line x1="130" y1="60" x2="190" y2="60" stroke="#64748b" stroke-width="2"/><line x1="300" y1="60" x2="360" y2="60" stroke="#64748b" stroke-width="2"/><line x1="470" y1="60" x2="530" y2="60" stroke="#64748b" stroke-width="2"/>
<rect x="135" y="110" width="50" height="26" fill="#fed7aa"/><text x="160" y="128" text-anchor="middle" class="svg-ink" font-size="12">22</text>
<rect x="135" y="136" width="50" height="26" fill="#bbf7d0"/><text x="160" y="154" text-anchor="middle" class="svg-ink" font-size="12">IP</text>
<rect x="305" y="110" width="50" height="26" fill="#fed7aa"/><text x="330" y="128" text-anchor="middle" class="svg-ink" font-size="12">17</text>
<rect x="305" y="136" width="50" height="26" fill="#bbf7d0"/><text x="330" y="154" text-anchor="middle" class="svg-ink" font-size="12">IP</text>
<rect x="475" y="136" width="50" height="26" fill="#bbf7d0"/><text x="500" y="154" text-anchor="middle" class="svg-ink" font-size="12">IP</text>
<text x="75" y="200" text-anchor="middle" class="svg-accent" font-size="12">push 22</text>
<text x="245" y="200" text-anchor="middle" class="svg-accent" font-size="12">swap 22→17</text>
<text x="415" y="200" text-anchor="middle" class="svg-accent" font-size="12">pop (PHP)</text>
<text x="580" y="200" text-anchor="middle" class="svg-accent" font-size="12">IP lookup</text>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">FEC 4.4.4.4/32, one label, left to right</text>
</svg><p class="cap">What the packet looks like on each core link, for traffic from PE1 to 4.4.4.4.</p></div>

<ol>
<li><b>PE1 (ingress, push).</b> A ping to 4.4.4.4 is an unlabelled IP packet. PE1 looks in its FIB: next hop 10.0.12.2 via Gi0/1, <b>label 22</b> (P1's label for 4.4.4.4/32). PE1 pushes 22 and copies the IP TTL into the label TTL.</li>
<li><b>P1 (transit, swap).</b> A packet with top label 22 arrives. P1 does not look at the IP header; it looks up 22 in its LFIB: out label <b>17</b>, Gi0/2, next hop 10.0.23.3. It swaps 22 for 17 and decrements the label TTL.</li>
<li><b>P2 (penultimate hop, pop).</b> Label 17 arrives. P2's LFIB says <b>Pop Label</b>, because PE2 advertised implicit-null for its own loopback. P2 removes the label and sends a plain IP packet to 10.0.34.4.</li>
<li><b>PE2 (egress).</b> A normal IP packet for its own loopback arrives, so PE2 answers the ping. A single IP lookup, no label lookup.</li>
</ol>

<pre class="out">PE1# show mpls forwarding-table 4.4.4.4 32
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
Label      Label      or Tunnel Id     Switched      interface
19         22         4.4.4.4/32       0             Gi0/1      10.0.12.2

P1# show mpls forwarding-table 4.4.4.4 32
<span class="hl">22         17         4.4.4.4/32       2860          Gi0/2      10.0.23.3</span>

P2# show mpls forwarding-table 4.4.4.4 32
<span class="hl">17         Pop Label  4.4.4.4/32       2860          Gi0/3      10.0.34.4</span></pre>
<p>Read PE1's line carefully: its <b>local</b> label 19 is only used by routers sending labelled traffic <i>to</i> PE1 for 4.4.4.4 (for example P1 if it ever routed that way). For its own traffic PE1 uses the FIB and pushes 22. The Bytes Label Switched counter on PE1 stays at 0 because no labelled packets arrive there for this prefix.</p>

<h3>Seeing it with traceroute</h3>
<pre class="out">PE1# traceroute 4.4.4.4 source loopback0
Type escape sequence to abort.
Tracing the route to 4.4.4.4
VRF info: (vrf in name/id, vrf out name/id)
<span class="hl">  1 10.0.12.2 [MPLS: Label 22 Exp 0] 2 msec 2 msec 1 msec</span>
<span class="hl">  2 10.0.23.3 [MPLS: Label 17 Exp 0] 2 msec 3 msec 2 msec</span>
  3 10.0.34.4 3 msec 3 msec 3 msec</pre>
<p>Each hop reports the label <b>it received</b>. P1 received 22, P2 received 17, and PE2 received no label at all, which proves PHP happened at P2. The pattern "push, swap, pop" is exactly what the lab checks.</p>

<div class="eg"><p><b>Worked example.</b> Customer traffic from PC1 to PC2 (192.168.2.10) follows the same idea with a different FEC. PE1's FIB for 192.168.2.0/24 says label 23 via P1. P1 swaps 23 → 18. P2 pops, since PE2 advertises implicit-null for its connected 192.168.2.0/24. PE2 does an IP lookup and delivers to PC2. In the lab, <code>show mpls forwarding-table 192.168.2.0</code> on PE1 must show a numeric outgoing label; that is how the checker knows PE1 imposes a label for customer traffic.</p></div>

<div class="warn"><p><b>Common mistake.</b> Expecting the same label value on every hop. Labels are locally significant: 22 on the PE1–P1 link and 17 on the P1–P2 link are unrelated numbers chosen by P1 and P2. Only "who allocated it" matters: the downstream router allocates the label that the upstream router sends.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which router performs a label swap?" The transit LSR. "Which router receives an unlabelled packet when PHP is used?" The egress. "Which LFIB entry shows the router is the penultimate hop?" Pop Label.</p></div>

<div class="scn"><h4>The traceroute with a surprise</h4><p>An engineer validating a new core ran a traceroute from PE1 to 4.4.4.4 and saw labels on hop 1 but not on hop 2, even though hop 2 was a P router in the middle of the path. <code>show mpls forwarding-table</code> on P1 showed "No Label" for 4.4.4.4/32. The link between P1 and P2 had <code>mpls ip</code> on one side only, so P1 had no label from P2 and sent the packet unlabelled. Adding <code>mpls ip</code> on P2's interface brought the labels back.</p><p><b>Lesson:</b> a missing label on a middle hop means the LSP is broken at the hop before it; check the LFIB there.</p></div>

<div class="iv"><p class="q">"Walk me through what each router does to a packet crossing an MPLS core."</p><p>The ingress PE classifies the IP packet into a FEC and pushes the label learned from its next hop. Each P router swaps the top label using its LFIB without looking at IP. The penultimate router pops because the egress advertised implicit-null, and the egress does one IP lookup. Quote real labels from a traceroute or LFIB, and mention that labels are locally significant.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three operations: push at the ingress, swap in the core, pop at the penultimate hop.</li>
<li>Ingress uses the FIB to push; transit and penultimate routers use the LFIB.</li>
<li>Labels are locally significant; the downstream router chooses the label the upstream sends.</li>
<li>Traceroute shows the label each hop received; no label on the last hop means PHP.</li>
<li>"No Label" in the LFIB means the next hop gave no binding, usually a broken LDP session.</li>
</ul></div>
`,hi:`
<p>Relay race mein sirf teen moves hote hain: pehla runner starter se baton <b>leta</b> hai, beech ka har runner use agle ko <b>thama deta</b> hai, aur aakhri runner finish line par use <b>chhod</b> deta hai. MPLS forwarding mein bhi top label par sirf teen moves hain: <b>push</b>, <b>swap</b> aur <b>pop</b>. Aap jo bhi LFIB entry kabhi padhoge woh inmein se ek hogi, kabhi kabhi mili-juli.</p>

<h3>Teen operations</h3>
<table class="cmp"><tr><th>Operation</th><th>Kaun karta hai</th><th>Kya hota hai</th><th>IOS mein kaise dikhta hai</th></tr>
<tr><td><b>Push</b> (impose)</td><td>Ingress LER</td><td>Packet ke upar ek ya zyada labels jodta hai</td><td>FIB (<code>show ip cef</code>) "label N" dikhati hai</td></tr>
<tr><td><b>Swap</b></td><td>Transit LSR</td><td>Top label ko nayi value se badalta hai, TTL kam karta hai</td><td>LFIB outgoing label ek number hai</td></tr>
<tr><td><b>Pop</b> (dispose)</td><td>Penultimate LSR ya egress</td><td>Top label hataata hai; agla label ya IP header khul jaata hai</td><td>LFIB "Pop Label" dikhati hai</td></tr></table>
<p>Ek "untagged" case bhi hai, jo <b>No Label</b> dikhta hai: router saare labels hata deta hai aur plain IP packet bhejta hai kyunki next hop ne is prefix ke liye koi label nahi diya. Yeh aam taur par missing LDP session ka symptom hai aur chapter 12 mein cover hota hai.</p>

<h3>Packet walk: PE1 se PE2 ke loopback tak</h3>
<p>Lab core use karo: PE1 (1.1.1.1) – P1 (2.2.2.2) – P2 (3.3.3.3) – PE2 (4.4.4.4), har jagah OSPF, teeno core links par LDP. Neeche ki label values pichhle chapters se match karti hain.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Packet walk push swap pop">
<rect x="20" y="40" width="110" height="40" rx="8" fill="#bae6fd"/><text x="75" y="65" text-anchor="middle" class="svg-ink" font-size="13">PE1</text>
<rect x="190" y="40" width="110" height="40" rx="8" fill="#ddd6fe"/><text x="245" y="65" text-anchor="middle" class="svg-ink" font-size="13">P1</text>
<rect x="360" y="40" width="110" height="40" rx="8" fill="#ddd6fe"/><text x="415" y="65" text-anchor="middle" class="svg-ink" font-size="13">P2</text>
<rect x="530" y="40" width="100" height="40" rx="8" fill="#bae6fd"/><text x="580" y="65" text-anchor="middle" class="svg-ink" font-size="13">PE2</text>
<line x1="130" y1="60" x2="190" y2="60" stroke="#64748b" stroke-width="2"/><line x1="300" y1="60" x2="360" y2="60" stroke="#64748b" stroke-width="2"/><line x1="470" y1="60" x2="530" y2="60" stroke="#64748b" stroke-width="2"/>
<rect x="135" y="110" width="50" height="26" fill="#fed7aa"/><text x="160" y="128" text-anchor="middle" class="svg-ink" font-size="12">22</text>
<rect x="135" y="136" width="50" height="26" fill="#bbf7d0"/><text x="160" y="154" text-anchor="middle" class="svg-ink" font-size="12">IP</text>
<rect x="305" y="110" width="50" height="26" fill="#fed7aa"/><text x="330" y="128" text-anchor="middle" class="svg-ink" font-size="12">17</text>
<rect x="305" y="136" width="50" height="26" fill="#bbf7d0"/><text x="330" y="154" text-anchor="middle" class="svg-ink" font-size="12">IP</text>
<rect x="475" y="136" width="50" height="26" fill="#bbf7d0"/><text x="500" y="154" text-anchor="middle" class="svg-ink" font-size="12">IP</text>
<text x="75" y="200" text-anchor="middle" class="svg-accent" font-size="12">push 22</text>
<text x="245" y="200" text-anchor="middle" class="svg-accent" font-size="12">swap 22→17</text>
<text x="415" y="200" text-anchor="middle" class="svg-accent" font-size="12">pop (PHP)</text>
<text x="580" y="200" text-anchor="middle" class="svg-accent" font-size="12">IP lookup</text>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">FEC 4.4.4.4/32, ek label, left se right</text>
</svg><p class="cap">PE1 se 4.4.4.4 jaane wale traffic ke liye har core link par packet kaisa dikhta hai.</p></div>

<ol>
<li><b>PE1 (ingress, push).</b> 4.4.4.4 ka ping ek unlabelled IP packet hai. PE1 apni FIB dekhta hai: next hop 10.0.12.2 via Gi0/1, <b>label 22</b> (4.4.4.4/32 ke liye P1 ka label). PE1 22 push karta hai aur IP TTL ko label TTL mein copy karta hai.</li>
<li><b>P1 (transit, swap).</b> Top label 22 wala packet aata hai. P1 IP header nahi dekhta; woh apni LFIB mein 22 dhoondhta hai: out label <b>17</b>, Gi0/2, next hop 10.0.23.3. Woh 22 ko 17 se swap karta hai aur label TTL kam karta hai.</li>
<li><b>P2 (penultimate hop, pop).</b> Label 17 aata hai. P2 ki LFIB kehti hai <b>Pop Label</b>, kyunki PE2 ne apne loopback ke liye implicit-null advertise kiya. P2 label hataata hai aur 10.0.34.4 ko plain IP packet bhejta hai.</li>
<li><b>PE2 (egress).</b> Apne loopback ke liye normal IP packet aata hai, to PE2 ping ka jawab deta hai. Ek IP lookup, koi label lookup nahi.</li>
</ol>

<pre class="out">PE1# show mpls forwarding-table 4.4.4.4 32
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
Label      Label      or Tunnel Id     Switched      interface
19         22         4.4.4.4/32       0             Gi0/1      10.0.12.2

P1# show mpls forwarding-table 4.4.4.4 32
<span class="hl">22         17         4.4.4.4/32       2860          Gi0/2      10.0.23.3</span>

P2# show mpls forwarding-table 4.4.4.4 32
<span class="hl">17         Pop Label  4.4.4.4/32       2860          Gi0/3      10.0.34.4</span></pre>
<p>PE1 ki line dhyan se padho: uska <b>local</b> label 19 sirf un routers ke kaam aata hai jo 4.4.4.4 ke liye labelled traffic PE1 <i>ko</i> bhejte hain (jaise P1, agar woh kabhi us raaste route kare). Apne traffic ke liye PE1 FIB use karta hai aur 22 push karta hai. PE1 par Bytes Label Switched counter 0 rehta hai kyunki is prefix ke liye wahan koi labelled packets nahi aate.</p>

<h3>Traceroute se dekhna</h3>
<pre class="out">PE1# traceroute 4.4.4.4 source loopback0
Type escape sequence to abort.
Tracing the route to 4.4.4.4
VRF info: (vrf in name/id, vrf out name/id)
<span class="hl">  1 10.0.12.2 [MPLS: Label 22 Exp 0] 2 msec 2 msec 1 msec</span>
<span class="hl">  2 10.0.23.3 [MPLS: Label 17 Exp 0] 2 msec 3 msec 2 msec</span>
  3 10.0.34.4 3 msec 3 msec 3 msec</pre>
<p>Har hop woh label report karta hai jo <b>use mila</b>. P1 ko 22 mila, P2 ko 17, aur PE2 ko koi label nahi mila, jo prove karta hai ki PHP P2 par hua. "Push, swap, pop" ka pattern bilkul wahi hai jo lab check karti hai.</p>

<div class="eg"><p><b>Worked example.</b> PC1 se PC2 (192.168.2.10) ka customer traffic alag FEC ke saath same idea follow karta hai. 192.168.2.0/24 ke liye PE1 ki FIB kehti hai label 23 via P1. P1 23 → 18 swap karta hai. P2 pop karta hai, kyunki PE2 apne connected 192.168.2.0/24 ke liye implicit-null advertise karta hai. PE2 IP lookup karke PC2 ko deliver karta hai. Lab mein PE1 par <code>show mpls forwarding-table 192.168.2.0</code> ek numeric outgoing label dikhana chahiye; isi se checker jaanta hai ki PE1 customer traffic par label impose karta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Har hop par same label value ki ummeed karna. Labels locally significant hain: PE1–P1 link par 22 aur P1–P2 link par 17 alag numbers hain jo P1 aur P2 ne chune. Sirf "kisne allocate kiya" matter karta hai: downstream router woh label allocate karta hai jo upstream router bhejta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Label swap kaunsa router karta hai?" Transit LSR. "PHP use hone par unlabelled packet kise milta hai?" Egress ko. "Kaunsi LFIB entry dikhati hai ki router penultimate hop hai?" Pop Label.</p></div>

<div class="scn"><h4>Traceroute mein ek surprise</h4><p>Naye core ko validate karte hue ek engineer ne PE1 se 4.4.4.4 tak traceroute chalaya aur hop 1 par labels dekhe par hop 2 par nahi, jabki hop 2 path ke beech ka ek P router tha. P1 par <code>show mpls forwarding-table</code> ne 4.4.4.4/32 ke liye "No Label" dikhaya. P1 aur P2 ke beech link par sirf ek side <code>mpls ip</code> tha, isliye P1 ke paas P2 ka koi label nahi tha aur usne packet bina label ke bheja. P2 ke interface par <code>mpls ip</code> jodne se labels wapas aa gaye.</p><p><b>Seekh:</b> beech ke hop par missing label ka matlab hai LSP usse pehle wale hop par toota hai; wahan LFIB check karo.</p></div>

<div class="iv"><p class="q">"MPLS core cross karte packet ke saath har router kya karta hai, samjhao."</p><p>Ingress PE IP packet ko FEC mein classify karta hai aur apne next hop se seekha label push karta hai. Har P router IP dekhe bina apni LFIB se top label swap karta hai. Penultimate router pop karta hai kyunki egress ne implicit-null advertise kiya, aur egress ek IP lookup karta hai. Traceroute ya LFIB se real labels quote karo, aur bolo ki labels locally significant hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen operations: ingress par push, core mein swap, penultimate hop par pop.</li>
<li>Ingress push ke liye FIB use karta hai; transit aur penultimate routers LFIB use karte hain.</li>
<li>Labels locally significant hain; upstream jo label bhejta hai woh downstream router chunta hai.</li>
<li>Traceroute har hop ka mila hua label dikhata hai; aakhri hop par label nahi matlab PHP.</li>
<li>LFIB mein "No Label" matlab next hop ne koi binding nahi di, aam taur par toota LDP session.</li>
</ul></div>
`}};export{e as default};