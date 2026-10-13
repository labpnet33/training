var e={id:`label-format`,h:{en:`The label header and the label stack`,hi:`Label header aur label stack`},body:{en:`
<p>Go back to the courier sticker from chapter 1. A useful sticker needs more than a route number. It might carry a priority colour ("express"), a mark saying "this is the last sticker, the real address is underneath", and a hop counter so a parcel stuck in a loop is thrown away. The MPLS label header carries exactly these four things, packed into 32 bits.</p>

<h3>Where the label sits</h3>
<p>On Ethernet, MPLS inserts one or more 4-byte <b>label stack entries</b> between the Layer 2 header and the IP header. The Ethernet frame announces it with <b>EtherType 0x8847</b> (MPLS unicast) instead of 0x0800 (IPv4). Because it sits between Layer 2 and Layer 3, people call MPLS a <b>"Layer 2.5" shim header</b>. The router never needs to touch the IP header until the label is removed.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="MPLS label format">
<rect x="20" y="30" width="130" height="40" fill="#e2e8f0"/><text x="85" y="55" text-anchor="middle" class="svg-ink" font-size="12">Ethernet 0x8847</text>
<rect x="150" y="30" width="110" height="40" fill="#bae6fd"/><text x="205" y="55" text-anchor="middle" class="svg-ink" font-size="12">Label entry</text>
<rect x="260" y="30" width="110" height="40" fill="#bbf7d0"/><text x="315" y="55" text-anchor="middle" class="svg-ink" font-size="12">IP header</text>
<rect x="370" y="30" width="250" height="40" fill="#fde68a"/><text x="495" y="55" text-anchor="middle" class="svg-ink" font-size="12">TCP/UDP + data</text>
<line x1="150" y1="70" x2="20" y2="120" stroke="#64748b"/><line x1="260" y1="70" x2="620" y2="120" stroke="#64748b"/>
<rect x="20" y="120" width="380" height="44" fill="#bae6fd"/><text x="210" y="147" text-anchor="middle" class="svg-ink" font-size="13">Label (20 bits)</text>
<rect x="400" y="120" width="60" height="44" fill="#ddd6fe"/><text x="430" y="147" text-anchor="middle" class="svg-ink" font-size="12">TC 3</text>
<rect x="460" y="120" width="30" height="44" fill="#fed7aa"/><text x="475" y="147" text-anchor="middle" class="svg-ink" font-size="12">S</text>
<rect x="490" y="120" width="130" height="44" fill="#bbf7d0"/><text x="555" y="147" text-anchor="middle" class="svg-ink" font-size="12">TTL (8 bits)</text>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">4 bytes = 32 bits per label stack entry</text>
</svg><p class="cap">One label stack entry: 20-bit label, 3-bit TC (EXP), 1-bit bottom-of-stack, 8-bit TTL.</p></div>

<h3>The four fields</h3>
<dl class="terms">
<dt>Label (20 bits)</dt><dd>The value the next router looks up. 20 bits give 2^20 = 1,048,576 values (0 to 1,048,575). Values <b>0 to 15 are reserved</b> for special meanings, so routers hand out labels from 16 upward. The label only has meaning between two neighbours; it is <b>locally significant</b>, like a Frame Relay DLCI.</dd>
<dt>TC, Traffic Class (3 bits)</dt><dd>Originally called <b>EXP</b> (experimental), renamed Traffic Class in RFC 5462. It carries QoS marking, 8 values, and IOS still displays it as "Exp" in traceroute. By default the ingress router copies the three IP Precedence bits (the top three bits of DSCP) into it.</dd>
<dt>S, Bottom of Stack (1 bit)</dt><dd>Set to 1 on the last label before the IP header, 0 on every label above it. It tells the router "after this label comes the payload".</dd>
<dt>TTL (8 bits)</dt><dd>Time to live, decremented by one at every label switching hop, exactly like the IP TTL. At zero the packet is dropped and an ICMP time exceeded is generated. This is what makes traceroute through an MPLS core work.</dd>
</dl>

<h3>Reserved labels you should know</h3>
<table class="cmp"><tr><th>Label</th><th>Name</th><th>Use</th></tr>
<tr><td>0</td><td>IPv4 explicit-null</td><td>Egress asks for a label to be kept so TC survives to the last hop</td></tr>
<tr><td>1</td><td>Router alert</td><td>Packet must be punted to the control plane</td></tr>
<tr><td>2</td><td>IPv6 explicit-null</td><td>Same as 0, for IPv6 payloads</td></tr>
<tr><td>3</td><td>Implicit-null</td><td>Advertised by the egress to ask for PHP; never seen on the wire</td></tr>
<tr><td>13, 14</td><td>GAL, OAM alert</td><td>Operations and maintenance (MPLS-TP, OAM)</td></tr></table>
<p>Chapter 6 explains labels 0 and 3 in detail; they are the two most tested.</p>

<h3>The label stack</h3>
<p>A packet can carry <b>more than one label</b>. The labels form a <b>stack</b>: routers only ever look at the <b>top</b> label, and only the bottom one has S=1. Each extra label adds 4 bytes. Common stacks:</p>
<ul>
<li><b>1 label</b>: plain LDP transport, for example the BGP-free core or the lab.</li>
<li><b>2 labels</b>: MPLS L3VPN. Outer (top) = <b>transport label</b> to reach the egress PE; inner (bottom) = <b>VPN label</b> that tells the egress PE which VRF or customer route to use.</li>
<li><b>3 or more</b>: L3VPN over a TE tunnel, fast reroute backup tunnels, or Segment Routing paths.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A customer sends a 1500-byte IP packet into an MPLS L3VPN. The ingress PE pushes a VPN label (label 28, S=1) and a transport label (label 22, S=0) on top. The labelled packet is now 1500 + 2 × 4 = <b>1508 bytes</b> of Layer 3 payload. If a core link has an MTU of 1500 bytes and cannot fragment labelled packets well, large packets are dropped while small pings succeed. The fix is to raise the core MTU (for example to 1600 or jumbo) or set <code>mpls mtu</code> appropriately on core interfaces.</p></div>

<h3>TTL handling and hiding the core</h3>
<p>By default the ingress router copies the IP TTL into the label TTL (<b>TTL propagation</b>), and the egress copies it back. That is why a traceroute shows every P router with its label. Providers often hide the core from customers with:</p>
<pre class="code"><span class="c">! global config on the PE routers</span>
no mpls ip propagate-ttl forwarded   <span class="c">! hide the core from customer traffic only</span>
<span class="c">! "no mpls ip propagate-ttl" alone hides it from locally generated traceroute too</span></pre>
<p>With propagation off, the ingress sets the label TTL to 255, the core hops never expire, and a customer traceroute shows the whole provider network as a single hop.</p>

<div class="warn"><p><b>Common mistake.</b> Forgetting the extra bytes. Every label adds 4 bytes; L3VPN adds 8. Classic symptom: ping with small packets works, but web pages hang or file transfers stall because full-size packets are dropped in the core.</p></div>

<div class="exam"><p><b>Exam trap.</b> The label field is <b>20 bits</b>, not 32. The whole entry is 32 bits (4 bytes). TC/EXP is 3 bits, S is 1 bit, TTL is 8 bits. Also remember EtherType 0x8847 for MPLS unicast.</p></div>

<div class="scn"><h4>Pings fine, SAP sessions freezing</h4><p>After a customer moved to the provider's new L3VPN service, users could ping everything, but large ERP screens froze and file copies stopped at a few kilobytes. A capture at the PE showed full-size 1500-byte packets from the customer and ICMP "fragmentation needed" messages never reaching the servers. One newly installed core link had been left at MTU 1500. The provider set the core links to MTU 9100, and the problem disappeared.</p><p><b>Lesson:</b> the label stack makes packets bigger; the MPLS core must carry at least 1500 plus 4 bytes per label.</p></div>

<div class="iv"><p class="q">"Draw the MPLS label header and explain each field."</p><p>Draw 32 bits: 20-bit label (locally significant, 0 to 15 reserved), 3-bit TC or EXP for QoS, 1-bit bottom-of-stack, 8-bit TTL. Say it sits between Layer 2 and Layer 3 with EtherType 0x8847, that multiple entries form a stack, and that L3VPN uses two labels, transport outside and VPN inside. Bonus points for mentioning MTU and TTL propagation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A label stack entry is 4 bytes: label 20 bits, TC/EXP 3, S 1, TTL 8.</li>
<li>It sits between the Ethernet and IP headers; EtherType 0x8847.</li>
<li>Labels 0 to 15 are reserved; 0 = IPv4 explicit-null, 3 = implicit-null.</li>
<li>Routers only look at the top label; S=1 marks the bottom one. L3VPN = transport + VPN label.</li>
<li>Each label adds 4 bytes, so plan core MTU; TTL propagation can be disabled to hide the core.</li>
</ul></div>
`,hi:`
<p>Chapter 1 ke courier sticker par wapas chalo. Ek kaam ke sticker par route number ke alawa bhi kuch hona chahiye. Us par priority ka rang ("express") ho sakta hai, ek nishaan jo kahe "yeh aakhri sticker hai, asli address neeche hai", aur ek hop counter taaki loop mein phansa parcel phenk diya jaaye. MPLS label header bilkul yahi chaar cheezein 32 bits mein pack karke le jaata hai.</p>

<h3>Label kahan baithta hai</h3>
<p>Ethernet par MPLS Layer 2 header aur IP header ke beech ek ya zyada 4-byte ki <b>label stack entries</b> daalta hai. Ethernet frame ise 0x0800 (IPv4) ki jagah <b>EtherType 0x8847</b> (MPLS unicast) se announce karta hai. Kyunki yeh Layer 2 aur Layer 3 ke beech baithta hai, log MPLS ko <b>"Layer 2.5" shim header</b> kehte hain. Jab tak label hata na diya jaaye, router ko IP header chhoone ki zaroorat nahi padti.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="MPLS label format">
<rect x="20" y="30" width="130" height="40" fill="#e2e8f0"/><text x="85" y="55" text-anchor="middle" class="svg-ink" font-size="12">Ethernet 0x8847</text>
<rect x="150" y="30" width="110" height="40" fill="#bae6fd"/><text x="205" y="55" text-anchor="middle" class="svg-ink" font-size="12">Label entry</text>
<rect x="260" y="30" width="110" height="40" fill="#bbf7d0"/><text x="315" y="55" text-anchor="middle" class="svg-ink" font-size="12">IP header</text>
<rect x="370" y="30" width="250" height="40" fill="#fde68a"/><text x="495" y="55" text-anchor="middle" class="svg-ink" font-size="12">TCP/UDP + data</text>
<line x1="150" y1="70" x2="20" y2="120" stroke="#64748b"/><line x1="260" y1="70" x2="620" y2="120" stroke="#64748b"/>
<rect x="20" y="120" width="380" height="44" fill="#bae6fd"/><text x="210" y="147" text-anchor="middle" class="svg-ink" font-size="13">Label (20 bits)</text>
<rect x="400" y="120" width="60" height="44" fill="#ddd6fe"/><text x="430" y="147" text-anchor="middle" class="svg-ink" font-size="12">TC 3</text>
<rect x="460" y="120" width="30" height="44" fill="#fed7aa"/><text x="475" y="147" text-anchor="middle" class="svg-ink" font-size="12">S</text>
<rect x="490" y="120" width="130" height="44" fill="#bbf7d0"/><text x="555" y="147" text-anchor="middle" class="svg-ink" font-size="12">TTL (8 bits)</text>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">Har label stack entry 4 bytes = 32 bits</text>
</svg><p class="cap">Ek label stack entry: 20-bit label, 3-bit TC (EXP), 1-bit bottom-of-stack, 8-bit TTL.</p></div>

<h3>Chaar fields</h3>
<dl class="terms">
<dt>Label (20 bits)</dt><dd>Woh value jo agla router lookup karta hai. 20 bits se 2^20 = 1,048,576 values milti hain (0 se 1,048,575). Values <b>0 se 15 reserved</b> hain special matlab ke liye, isliye routers 16 se upar ke labels dete hain. Label ka matlab sirf do neighbours ke beech hota hai; yeh <b>locally significant</b> hai, Frame Relay DLCI ki tarah.</dd>
<dt>TC, Traffic Class (3 bits)</dt><dd>Pehle iska naam <b>EXP</b> (experimental) tha, RFC 5462 mein Traffic Class rakha gaya. Yeh QoS marking le jaata hai, 8 values, aur IOS traceroute mein ab bhi ise "Exp" dikhata hai. Default mein ingress router IP Precedence ke teen bits (DSCP ke upar ke teen bits) isme copy karta hai.</dd>
<dt>S, Bottom of Stack (1 bit)</dt><dd>IP header se pehle ke aakhri label par 1, uske upar ke har label par 0. Yeh router ko batata hai "is label ke baad payload aata hai".</dd>
<dt>TTL (8 bits)</dt><dd>Time to live, har label switching hop par ek kam hota hai, bilkul IP TTL ki tarah. Zero hone par packet drop hota hai aur ICMP time exceeded banta hai. Isi wajah se MPLS core ke through traceroute kaam karta hai.</dd>
</dl>

<h3>Reserved labels jo aapko pata hone chahiye</h3>
<table class="cmp"><tr><th>Label</th><th>Naam</th><th>Use</th></tr>
<tr><td>0</td><td>IPv4 explicit-null</td><td>Egress kehta hai label rakha jaaye taaki TC aakhri hop tak bacha rahe</td></tr>
<tr><td>1</td><td>Router alert</td><td>Packet ko control plane par punt karna hai</td></tr>
<tr><td>2</td><td>IPv6 explicit-null</td><td>0 jaisa hi, IPv6 payloads ke liye</td></tr>
<tr><td>3</td><td>Implicit-null</td><td>Egress PHP maangne ke liye advertise karta hai; wire par kabhi nahi dikhta</td></tr>
<tr><td>13, 14</td><td>GAL, OAM alert</td><td>Operations aur maintenance (MPLS-TP, OAM)</td></tr></table>
<p>Chapter 6 labels 0 aur 3 ko detail mein samjhata hai; yeh do sabse zyada test hote hain.</p>

<h3>Label stack</h3>
<p>Ek packet par <b>ek se zyada labels</b> ho sakte hain. Labels ek <b>stack</b> banate hain: routers hamesha sirf <b>top</b> label dekhte hain, aur sirf sabse neeche wale par S=1 hota hai. Har extra label 4 bytes jodta hai. Common stacks:</p>
<ul>
<li><b>1 label</b>: plain LDP transport, jaise BGP-free core ya lab.</li>
<li><b>2 labels</b>: MPLS L3VPN. Outer (top) = egress PE tak pahunchne ka <b>transport label</b>; inner (bottom) = <b>VPN label</b> jo egress PE ko batata hai ki kaunsa VRF ya customer route use karna hai.</li>
<li><b>3 ya zyada</b>: TE tunnel par L3VPN, fast reroute backup tunnels, ya Segment Routing paths.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek customer MPLS L3VPN mein 1500-byte ka IP packet bhejta hai. Ingress PE ek VPN label (label 28, S=1) aur uske upar ek transport label (label 22, S=0) push karta hai. Ab labelled packet ka Layer 3 payload 1500 + 2 × 4 = <b>1508 bytes</b> hai. Agar kisi core link ka MTU 1500 bytes hai aur woh labelled packets ko theek se fragment nahi kar sakta, to bade packets drop hote hain jabki chhote pings chal jaate hain. Fix hai core MTU badhana (jaise 1600 ya jumbo) ya core interfaces par <code>mpls mtu</code> sahi set karna.</p></div>

<h3>TTL handling aur core ko chhupana</h3>
<p>Default mein ingress router IP TTL ko label TTL mein copy karta hai (<b>TTL propagation</b>), aur egress use wapas copy karta hai. Isi liye traceroute har P router ko uske label ke saath dikhata hai. Providers aksar customers se core chhupate hain:</p>
<pre class="code"><span class="c">! PE routers par global config</span>
no mpls ip propagate-ttl forwarded   <span class="c">! core sirf customer traffic se chhupao</span>
<span class="c">! sirf "no mpls ip propagate-ttl" locally generated traceroute se bhi chhupata hai</span></pre>
<p>Propagation off hone par ingress label TTL 255 set karta hai, core hops kabhi expire nahi hote, aur customer traceroute poore provider network ko ek hi hop ki tarah dikhata hai.</p>

<div class="warn"><p><b>Common galti.</b> Extra bytes bhool jaana. Har label 4 bytes jodta hai; L3VPN 8 jodta hai. Classic symptom: chhote packets ka ping chalta hai, par web pages atak jaate hain ya file transfers ruk jaate hain kyunki full-size packets core mein drop hote hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Label field <b>20 bits</b> ka hai, 32 nahi. Poori entry 32 bits (4 bytes) ki hai. TC/EXP 3 bits, S 1 bit, TTL 8 bits. MPLS unicast ke liye EtherType 0x8847 bhi yaad rakho.</p></div>

<div class="scn"><h4>Pings theek, SAP sessions freeze</h4><p>Ek customer provider ki nayi L3VPN service par gaya, uske baad users sab kuch ping kar pa rahe the, par bade ERP screens freeze ho jaate the aur file copies kuch kilobytes par ruk jaati thi. PE par capture mein customer ke full-size 1500-byte packets dikhe aur ICMP "fragmentation needed" messages servers tak kabhi nahi pahunche. Ek naye core link ko MTU 1500 par chhod diya gaya tha. Provider ne core links ko MTU 9100 par set kiya, aur problem gayab ho gayi.</p><p><b>Seekh:</b> label stack packets ko bada banata hai; MPLS core ko kam se kam 1500 plus har label ke 4 bytes le jaane chahiye.</p></div>

<div class="iv"><p class="q">"MPLS label header draw karo aur har field samjhao."</p><p>32 bits draw karo: 20-bit label (locally significant, 0 se 15 reserved), QoS ke liye 3-bit TC ya EXP, 1-bit bottom-of-stack, 8-bit TTL. Bolo ki yeh Layer 2 aur Layer 3 ke beech EtherType 0x8847 ke saath baithta hai, kai entries milkar stack banati hain, aur L3VPN do labels use karta hai, bahar transport aur andar VPN. MTU aur TTL propagation ka zikr bonus points deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Label stack entry 4 bytes ki hai: label 20 bits, TC/EXP 3, S 1, TTL 8.</li>
<li>Yeh Ethernet aur IP headers ke beech baithti hai; EtherType 0x8847.</li>
<li>Labels 0 se 15 reserved hain; 0 = IPv4 explicit-null, 3 = implicit-null.</li>
<li>Routers sirf top label dekhte hain; S=1 sabse neeche wale ko mark karta hai. L3VPN = transport + VPN label.</li>
<li>Har label 4 bytes jodta hai, isliye core MTU plan karo; core chhupane ke liye TTL propagation disable kar sakte ho.</li>
</ul></div>
`}};export{e as default};