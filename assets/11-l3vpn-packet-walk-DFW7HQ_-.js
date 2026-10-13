var e={id:`l3vpn-packet-walk`,h:{en:`L3VPN data plane: the two-label packet walk, end to end`,hi:`L3VPN data plane: do-label packet walk, end to end`},body:{en:`
<p>An international parcel often carries two labels. The <b>outer</b> one belongs to the airline: "to Mumbai hub". Airport staff only read that. The <b>inner</b> one belongs to the local courier in Mumbai: "desk 28, Andheri office". Nobody at the airports cares about the inner label, and the Mumbai office does not care which planes were used. An MPLS L3VPN packet is exactly this: an outer <b>transport label</b> for the core, and an inner <b>VPN label</b> for the egress PE.</p>

<h3>The setup</h3>
<p>Same core as the lab: PE1 (1.1.1.1) – P1 – P2 – PE2 (4.4.4.4), with LDP labels for 4.4.4.4/32 of 22 (from P1) and 17 (from P2), and implicit-null from PE2. Customer A: CE-A1 (LAN 10.10.1.0/24) on PE1 Gi0/2, CE-A2 (LAN 10.10.2.0/24) on PE2 via 172.31.22.0/30. PE2 advertised 10.10.2.0/24 in VPNv4 with VPN label <b>28</b> and next hop 4.4.4.4 (chapter 10).</p>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="L3VPN packet walk">
<rect x="5" y="40" width="80" height="40" rx="8" fill="#fde68a"/><text x="45" y="65" text-anchor="middle" class="svg-ink" font-size="12">CE-A1</text>
<rect x="115" y="40" width="90" height="40" rx="8" fill="#bae6fd"/><text x="160" y="65" text-anchor="middle" class="svg-ink" font-size="12">PE1</text>
<rect x="245" y="40" width="80" height="40" rx="8" fill="#ddd6fe"/><text x="285" y="65" text-anchor="middle" class="svg-ink" font-size="12">P1</text>
<rect x="365" y="40" width="80" height="40" rx="8" fill="#ddd6fe"/><text x="405" y="65" text-anchor="middle" class="svg-ink" font-size="12">P2</text>
<rect x="475" y="40" width="80" height="40" rx="8" fill="#bae6fd"/><text x="515" y="65" text-anchor="middle" class="svg-ink" font-size="12">PE2</text>
<rect x="575" y="40" width="60" height="40" rx="8" fill="#fde68a"/><text x="605" y="65" text-anchor="middle" class="svg-ink" font-size="12">CE-A2</text>
<line x1="85" y1="60" x2="115" y2="60" stroke="#64748b"/><line x1="205" y1="60" x2="245" y2="60" stroke="#64748b" stroke-width="2"/><line x1="325" y1="60" x2="365" y2="60" stroke="#64748b" stroke-width="2"/><line x1="445" y1="60" x2="475" y2="60" stroke="#64748b" stroke-width="2"/><line x1="555" y1="60" x2="575" y2="60" stroke="#64748b"/>
<rect x="75" y="150" width="50" height="24" fill="#bbf7d0"/><text x="100" y="167" text-anchor="middle" class="svg-ink" font-size="12">IP</text>
<rect x="200" y="102" width="50" height="24" fill="#fed7aa"/><text x="225" y="119" text-anchor="middle" class="svg-ink" font-size="12">22</text>
<rect x="200" y="126" width="50" height="24" fill="#ddd6fe"/><text x="225" y="143" text-anchor="middle" class="svg-ink" font-size="12">28</text>
<rect x="200" y="150" width="50" height="24" fill="#bbf7d0"/><text x="225" y="167" text-anchor="middle" class="svg-ink" font-size="12">IP</text>
<rect x="320" y="102" width="50" height="24" fill="#fed7aa"/><text x="345" y="119" text-anchor="middle" class="svg-ink" font-size="12">17</text>
<rect x="320" y="126" width="50" height="24" fill="#ddd6fe"/><text x="345" y="143" text-anchor="middle" class="svg-ink" font-size="12">28</text>
<rect x="320" y="150" width="50" height="24" fill="#bbf7d0"/><text x="345" y="167" text-anchor="middle" class="svg-ink" font-size="12">IP</text>
<rect x="435" y="126" width="50" height="24" fill="#ddd6fe"/><text x="460" y="143" text-anchor="middle" class="svg-ink" font-size="12">28</text>
<rect x="435" y="150" width="50" height="24" fill="#bbf7d0"/><text x="460" y="167" text-anchor="middle" class="svg-ink" font-size="12">IP</text>
<rect x="545" y="150" width="50" height="24" fill="#bbf7d0"/><text x="570" y="167" text-anchor="middle" class="svg-ink" font-size="12">IP</text>
<text x="160" y="215" text-anchor="middle" class="svg-accent" font-size="12">push 28, push 22</text>
<text x="285" y="215" text-anchor="middle" class="svg-accent" font-size="12">swap 22→17</text>
<text x="405" y="215" text-anchor="middle" class="svg-accent" font-size="12">pop top</text>
<text x="515" y="215" text-anchor="middle" class="svg-accent" font-size="12">28 → VRF A</text>
<text x="320" y="260" text-anchor="middle" class="svg-muted" font-size="12">orange = transport label (LDP), purple = VPN label (MP-BGP)</text>
</svg><p class="cap">The label stack on every link for a packet from 10.10.1.10 to 10.10.2.10.</p></div>

<h3>Hop by hop</h3>
<ol>
<li><b>CE-A1</b> sends a normal IP packet, 10.10.1.10 → 10.10.2.10, to PE1. It knows nothing about labels.</li>
<li><b>PE1 (ingress)</b> receives it on Gi0/2, which is in VRF CUST-A, so it looks in the <b>CUST-A FIB</b>. The route 10.10.2.0/24 is a BGP route with next hop 4.4.4.4 and VPN label 28. CEF then resolves 4.4.4.4 in the <b>global</b> table: next hop P1, LDP label 22. PE1 pushes <b>two labels</b>: 28 first (bottom, S=1), then 22 on top (S=0).</li>
<li><b>P1</b> sees top label 22 only. LFIB: swap 22 → 17 toward P2. It never looks at label 28 or the customer IP header; it has no idea VRFs exist.</li>
<li><b>P2</b> sees top label 17. LFIB: <b>Pop Label</b> (PE2 advertised implicit-null for 4.4.4.4). P2 removes only the transport label. Label 28 is now on top.</li>
<li><b>PE2 (egress)</b> receives a packet with one label, 28. Its LFIB maps 28 to "VRF CUST-A, next hop 172.31.22.2 on Gi0/2". It pops 28 and forwards the IP packet to CE-A2.</li>
</ol>

<pre class="out">PE2# show mpls forwarding-table vrf CUST-A
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
Label      Label      or Tunnel Id     Switched      interface
<span class="hl">28         No Label   10.10.2.0/24[V]  15840         Gi0/2      172.31.22.2</span>
29         No Label   172.31.22.0/30[V] 0            aggregate/CUST-A</pre>
<p>Here "No Label" is correct: toward the CE the packet must leave as plain IP. The <code>[V]</code> marks a VPN prefix. This is the one place where No Label is healthy.</p>

<h3>The traceroute view</h3>
<pre class="out">PE1# traceroute vrf CUST-A 10.10.2.10
Type escape sequence to abort.
Tracing the route to 10.10.2.10
VRF info: (vrf in name/id, vrf out name/id)
<span class="hl">  1 10.0.12.2 [MPLS: Labels 22/28 Exp 0] 4 msec 4 msec 4 msec</span>
<span class="hl">  2 10.0.23.3 [MPLS: Labels 17/28 Exp 0] 4 msec 4 msec 4 msec</span>
<span class="hl">  3 172.31.22.1 [MPLS: Label 28 Exp 0] 3 msec 3 msec 3 msec</span>
  4 172.31.22.2 4 msec 4 msec 4 msec
  5 10.10.2.10 5 msec 4 msec 4 msec</pre>
<p>Notice two clever details. First, the P routers report both labels (22/28, then 17/28) because the TTL expired in the top label while the full stack was present. Second, P1 has no route back to 10.10.1.10: it is a customer address. So P1 builds the ICMP time-exceeded message, puts the <b>same label stack</b> on it, and sends it forward to PE2, which routes it back through the VRF. That is why P hop times in VPN traceroutes all look similar to the full path delay.</p>

<h3>Why the transport LSP must reach all the way to the PE</h3>
<p>The whole design relies on the VPN label staying hidden until the packet reaches the PE that allocated it. If the transport label is popped too early, a P router ends up with label 28 on top, which it never allocated, and drops the packet. The classic cause is <b>summarising PE loopbacks</b> in the IGP: if an ABR advertises 4.4.4.0/24 instead of 4.4.4.4/32, it owns that summary and advertises implicit-null for it, so the router before it pops the transport label in the middle of the core. Keep PE loopbacks as /32 host routes.</p>

<div class="eg"><p><b>Worked example: MTU.</b> CE-A1 sends a 1500-byte IP packet. Across the core it carries two labels, 8 bytes: 1508 bytes of MPLS payload plus the 14-byte Ethernet header (18 with a VLAN tag). Every core link needs an MPLS MTU of at least 1508. Between P2 and PE2 only one label remains (1504), and between PE2 and CE-A2 the packet is 1500 again.</p></div>

<div class="warn"><p><b>Common mistake.</b> Testing an L3VPN with a plain <code>ping 10.10.2.10</code> on the PE. That uses the global table, which has no customer routes, and fails. Always use <code>ping vrf CUST-A</code> and <code>traceroute vrf CUST-A</code>, ideally sourced from the VRF interface.</p></div>

<div class="exam"><p><b>Exam trap.</b> Outer label = transport (LDP, toward the egress PE loopback). Inner label = VPN (MP-BGP, allocated by the egress PE). P routers only see and swap the outer label. With PHP the egress PE receives only the VPN label.</p></div>

<div class="scn"><h4>VPN broke after "tidying" the IGP</h4><p>A provider summarised the loopback range 10.255.0.0/16 on its area border routers to shrink the backbone routing table. Internet traffic kept working, but every L3VPN customer across the ABRs lost connectivity. <code>show mpls forwarding-table</code> on the ABR showed Pop Label for the summary, and the next P router was dropping packets whose top label was a VPN label it did not know. Removing the summarisation for loopbacks (or advertising them as /32) restored the end-to-end LSPs.</p><p><b>Lesson:</b> the transport LSP must end at the exact PE loopback; never summarise PE loopbacks in an MPLS VPN core.</p></div>

<div class="iv"><p class="q">"Why does MPLS L3VPN need two labels? Could it work with one?"</p><p>The outer transport label gets the packet across the core to the right egress PE; P routers only need that. The inner VPN label tells the egress PE which VRF and customer next hop to use, because the customer IP address alone is ambiguous when customers overlap. With one label, either the P routers would need per-customer state, or the egress PE could not tell which VRF the packet belongs to. Mention PHP removing only the transport label.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ingress PE: VRF FIB gives the VPN label and BGP next hop; global FIB gives the transport label. Push both.</li>
<li>P routers swap only the top label; the penultimate P pops the transport label.</li>
<li>Egress PE looks up the VPN label, selects the VRF and next hop, and sends plain IP to the CE.</li>
<li>Use ping vrf and traceroute vrf; traceroute shows Labels 22/28 style stacks in the core.</li>
<li>PE loopbacks must be /32 with an unbroken LSP; summarising them breaks every VPN.</li>
</ul></div>
`,hi:`
<p>Ek international parcel par aksar do labels hote hain. <b>Bahar</b> wala airline ka hai: "Mumbai hub ko". Airport staff sirf use padhta hai. <b>Andar</b> wala Mumbai ke local courier ka hai: "desk 28, Andheri office". Airports par kisi ko andar ke label se matlab nahi, aur Mumbai office ko farak nahi padta ki kaunse planes use hue. MPLS L3VPN packet bilkul yahi hai: core ke liye bahar ek <b>transport label</b>, aur egress PE ke liye andar ek <b>VPN label</b>.</p>

<h3>Setup</h3>
<p>Lab jaisa hi core: PE1 (1.1.1.1) – P1 – P2 – PE2 (4.4.4.4), 4.4.4.4/32 ke LDP labels 22 (P1 se) aur 17 (P2 se), aur PE2 se implicit-null. Customer A: CE-A1 (LAN 10.10.1.0/24) PE1 Gi0/2 par, CE-A2 (LAN 10.10.2.0/24) PE2 par 172.31.22.0/30 ke through. PE2 ne 10.10.2.0/24 ko VPNv4 mein VPN label <b>28</b> aur next hop 4.4.4.4 ke saath advertise kiya (chapter 10).</p>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="L3VPN packet walk">
<rect x="5" y="40" width="80" height="40" rx="8" fill="#fde68a"/><text x="45" y="65" text-anchor="middle" class="svg-ink" font-size="12">CE-A1</text>
<rect x="115" y="40" width="90" height="40" rx="8" fill="#bae6fd"/><text x="160" y="65" text-anchor="middle" class="svg-ink" font-size="12">PE1</text>
<rect x="245" y="40" width="80" height="40" rx="8" fill="#ddd6fe"/><text x="285" y="65" text-anchor="middle" class="svg-ink" font-size="12">P1</text>
<rect x="365" y="40" width="80" height="40" rx="8" fill="#ddd6fe"/><text x="405" y="65" text-anchor="middle" class="svg-ink" font-size="12">P2</text>
<rect x="475" y="40" width="80" height="40" rx="8" fill="#bae6fd"/><text x="515" y="65" text-anchor="middle" class="svg-ink" font-size="12">PE2</text>
<rect x="575" y="40" width="60" height="40" rx="8" fill="#fde68a"/><text x="605" y="65" text-anchor="middle" class="svg-ink" font-size="12">CE-A2</text>
<line x1="85" y1="60" x2="115" y2="60" stroke="#64748b"/><line x1="205" y1="60" x2="245" y2="60" stroke="#64748b" stroke-width="2"/><line x1="325" y1="60" x2="365" y2="60" stroke="#64748b" stroke-width="2"/><line x1="445" y1="60" x2="475" y2="60" stroke="#64748b" stroke-width="2"/><line x1="555" y1="60" x2="575" y2="60" stroke="#64748b"/>
<rect x="75" y="150" width="50" height="24" fill="#bbf7d0"/><text x="100" y="167" text-anchor="middle" class="svg-ink" font-size="12">IP</text>
<rect x="200" y="102" width="50" height="24" fill="#fed7aa"/><text x="225" y="119" text-anchor="middle" class="svg-ink" font-size="12">22</text>
<rect x="200" y="126" width="50" height="24" fill="#ddd6fe"/><text x="225" y="143" text-anchor="middle" class="svg-ink" font-size="12">28</text>
<rect x="200" y="150" width="50" height="24" fill="#bbf7d0"/><text x="225" y="167" text-anchor="middle" class="svg-ink" font-size="12">IP</text>
<rect x="320" y="102" width="50" height="24" fill="#fed7aa"/><text x="345" y="119" text-anchor="middle" class="svg-ink" font-size="12">17</text>
<rect x="320" y="126" width="50" height="24" fill="#ddd6fe"/><text x="345" y="143" text-anchor="middle" class="svg-ink" font-size="12">28</text>
<rect x="320" y="150" width="50" height="24" fill="#bbf7d0"/><text x="345" y="167" text-anchor="middle" class="svg-ink" font-size="12">IP</text>
<rect x="435" y="126" width="50" height="24" fill="#ddd6fe"/><text x="460" y="143" text-anchor="middle" class="svg-ink" font-size="12">28</text>
<rect x="435" y="150" width="50" height="24" fill="#bbf7d0"/><text x="460" y="167" text-anchor="middle" class="svg-ink" font-size="12">IP</text>
<rect x="545" y="150" width="50" height="24" fill="#bbf7d0"/><text x="570" y="167" text-anchor="middle" class="svg-ink" font-size="12">IP</text>
<text x="160" y="215" text-anchor="middle" class="svg-accent" font-size="12">push 28, push 22</text>
<text x="285" y="215" text-anchor="middle" class="svg-accent" font-size="12">swap 22→17</text>
<text x="405" y="215" text-anchor="middle" class="svg-accent" font-size="12">top pop</text>
<text x="515" y="215" text-anchor="middle" class="svg-accent" font-size="12">28 → VRF A</text>
<text x="320" y="260" text-anchor="middle" class="svg-muted" font-size="12">orange = transport label (LDP), purple = VPN label (MP-BGP)</text>
</svg><p class="cap">10.10.1.10 se 10.10.2.10 jaane wale packet ka har link par label stack.</p></div>

<h3>Hop by hop</h3>
<ol>
<li><b>CE-A1</b> PE1 ko normal IP packet bhejta hai, 10.10.1.10 → 10.10.2.10. Use labels ke baare mein kuch nahi pata.</li>
<li><b>PE1 (ingress)</b> use Gi0/2 par leta hai, jo VRF CUST-A mein hai, isliye woh <b>CUST-A FIB</b> mein dekhta hai. Route 10.10.2.0/24 ek BGP route hai jiska next hop 4.4.4.4 aur VPN label 28 hai. Phir CEF 4.4.4.4 ko <b>global</b> table mein resolve karta hai: next hop P1, LDP label 22. PE1 <b>do labels</b> push karta hai: pehle 28 (neeche, S=1), phir upar 22 (S=0).</li>
<li><b>P1</b> sirf top label 22 dekhta hai. LFIB: P2 ki taraf 22 → 17 swap. Woh label 28 ya customer IP header kabhi nahi dekhta; use pata hi nahi ki VRFs exist karte hain.</li>
<li><b>P2</b> top label 17 dekhta hai. LFIB: <b>Pop Label</b> (PE2 ne 4.4.4.4 ke liye implicit-null advertise kiya). P2 sirf transport label hataata hai. Ab label 28 upar hai.</li>
<li><b>PE2 (egress)</b> ko ek label, 28, wala packet milta hai. Uski LFIB 28 ko "VRF CUST-A, next hop 172.31.22.2 Gi0/2 par" se map karti hai. Woh 28 pop karke IP packet CE-A2 ko bhejta hai.</li>
</ol>

<pre class="out">PE2# show mpls forwarding-table vrf CUST-A
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
Label      Label      or Tunnel Id     Switched      interface
<span class="hl">28         No Label   10.10.2.0/24[V]  15840         Gi0/2      172.31.22.2</span>
29         No Label   172.31.22.0/30[V] 0            aggregate/CUST-A</pre>
<p>Yahan "No Label" sahi hai: CE ki taraf packet ko plain IP ki tarah nikalna chahiye. <code>[V]</code> VPN prefix ko mark karta hai. Yahi ek jagah hai jahan No Label healthy hai.</p>

<h3>Traceroute view</h3>
<pre class="out">PE1# traceroute vrf CUST-A 10.10.2.10
Type escape sequence to abort.
Tracing the route to 10.10.2.10
VRF info: (vrf in name/id, vrf out name/id)
<span class="hl">  1 10.0.12.2 [MPLS: Labels 22/28 Exp 0] 4 msec 4 msec 4 msec</span>
<span class="hl">  2 10.0.23.3 [MPLS: Labels 17/28 Exp 0] 4 msec 4 msec 4 msec</span>
<span class="hl">  3 172.31.22.1 [MPLS: Label 28 Exp 0] 3 msec 3 msec 3 msec</span>
  4 172.31.22.2 4 msec 4 msec 4 msec
  5 10.10.2.10 5 msec 4 msec 4 msec</pre>
<p>Do smart details dekho. Pehla, P routers dono labels report karte hain (22/28, phir 17/28) kyunki TTL top label mein expire hua jab poora stack maujood tha. Doosra, P1 ke paas 10.10.1.10 tak wapas ka route nahi hai: yeh customer address hai. Isliye P1 ICMP time-exceeded message banata hai, us par <b>same label stack</b> lagata hai, aur use aage PE2 ko bhejta hai, jo use VRF ke through wapas route karta hai. Isi wajah se VPN traceroutes mein P hops ke times poore path ke delay jaise dikhte hain.</p>

<h3>Transport LSP ko PE tak poora kyun pahunchna chahiye</h3>
<p>Poora design is par tika hai ki VPN label tab tak chhupa rahe jab tak packet us PE tak na pahunche jisne use allocate kiya. Agar transport label bahut jaldi pop ho jaaye, to ek P router ke paas label 28 upar aa jaata hai, jo usne kabhi allocate nahi kiya, aur woh packet drop kar deta hai. Classic wajah hai IGP mein <b>PE loopbacks ko summarise karna</b>: agar ek ABR 4.4.4.4/32 ki jagah 4.4.4.0/24 advertise kare, to woh us summary ka maalik hai aur uske liye implicit-null advertise karta hai, isliye usse pehle wala router core ke beech mein hi transport label pop kar deta hai. PE loopbacks ko /32 host routes rakho.</p>

<div class="eg"><p><b>Worked example: MTU.</b> CE-A1 1500-byte IP packet bhejta hai. Core ke paar us par do labels hain, 8 bytes: 1508 bytes MPLS payload plus 14-byte Ethernet header (VLAN tag ke saath 18). Har core link ko kam se kam 1508 ka MPLS MTU chahiye. P2 aur PE2 ke beech sirf ek label bachta hai (1504), aur PE2 aur CE-A2 ke beech packet phir 1500 ka hai.</p></div>

<div class="warn"><p><b>Common galti.</b> PE par plain <code>ping 10.10.2.10</code> se L3VPN test karna. Yeh global table use karta hai, jismein customer routes nahi hain, aur fail hota hai. Hamesha <code>ping vrf CUST-A</code> aur <code>traceroute vrf CUST-A</code> use karo, behtar hai VRF interface se source karke.</p></div>

<div class="exam"><p><b>Exam trap.</b> Outer label = transport (LDP, egress PE loopback ki taraf). Inner label = VPN (MP-BGP, egress PE allocate karta hai). P routers sirf outer label dekhte aur swap karte hain. PHP ke saath egress PE ko sirf VPN label milta hai.</p></div>

<div class="scn"><h4>IGP "saaf" karne ke baad VPN toot gaya</h4><p>Ek provider ne backbone routing table chhoti karne ke liye apne area border routers par loopback range 10.255.0.0/16 summarise kar di. Internet traffic chalta raha, par ABRs ke paar har L3VPN customer ki connectivity chali gayi. ABR par <code>show mpls forwarding-table</code> ne summary ke liye Pop Label dikhaya, aur agla P router woh packets drop kar raha tha jinka top label ek VPN label tha jise woh jaanta hi nahi tha. Loopbacks ke liye summarisation hatane (ya unhe /32 advertise karne) se end-to-end LSPs wapas aa gaye.</p><p><b>Seekh:</b> transport LSP bilkul PE loopback par khatam hona chahiye; MPLS VPN core mein PE loopbacks kabhi summarise mat karo.</p></div>

<div class="iv"><p class="q">"MPLS L3VPN ko do labels kyun chahiye? Kya ek se kaam chal sakta hai?"</p><p>Outer transport label packet ko core ke paar sahi egress PE tak le jaata hai; P routers ko sirf wahi chahiye. Inner VPN label egress PE ko batata hai ki kaunsa VRF aur customer next hop use karna hai, kyunki customers overlap karein to sirf customer IP address ambiguous hai. Ek label ke saath, ya to P routers ko har customer ki state chahiye hoti, ya egress PE bata nahi paata ki packet kis VRF ka hai. PHP sirf transport label hataata hai, iska zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ingress PE: VRF FIB VPN label aur BGP next hop deti hai; global FIB transport label deti hai. Dono push karo.</li>
<li>P routers sirf top label swap karte hain; penultimate P transport label pop karta hai.</li>
<li>Egress PE VPN label lookup karta hai, VRF aur next hop chunta hai, aur CE ko plain IP bhejta hai.</li>
<li>ping vrf aur traceroute vrf use karo; traceroute core mein Labels 22/28 jaise stacks dikhata hai.</li>
<li>PE loopbacks /32 hone chahiye aur unka LSP toota nahi hona chahiye; unhe summarise karna har VPN tod deta hai.</li>
</ul></div>
`}};export{e as default};