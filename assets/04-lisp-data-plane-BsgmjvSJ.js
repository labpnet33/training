var e={id:`lisp-data-plane`,h:{en:`LISP encapsulation byte by byte: UDP 4341 and 36 bytes`,hi:`LISP encapsulation byte by byte: UDP 4341 aur 36 bytes`},body:{en:`
<p>Once the ITR knows where the destination lives, it behaves like a courier putting a letter inside a bigger envelope. The inner letter keeps its original From and To (the EIDs). The outer envelope has depot-to-depot addresses (the RLOCs) and a small label that says "this is a LISP parcel" (the LISP header). The core only reads the outer envelope.</p>

<h3>The encapsulated packet, layer by layer</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="LISP encapsulation">
<rect x="10" y="30" width="150" height="60" rx="6" fill="#fed7aa"/><text x="85" y="54" text-anchor="middle" class="svg-ink" font-size="13">Outer IPv4</text><text x="85" y="72" text-anchor="middle" class="svg-muted" font-size="12">20 bytes, RLOC→RLOC</text>
<rect x="165" y="30" width="95" height="60" rx="6" fill="#fde68a"/><text x="212" y="54" text-anchor="middle" class="svg-ink" font-size="13">UDP</text><text x="212" y="72" text-anchor="middle" class="svg-muted" font-size="12">8, dst 4341</text>
<rect x="265" y="30" width="105" height="60" rx="6" fill="#ddd6fe"/><text x="317" y="54" text-anchor="middle" class="svg-ink" font-size="13">LISP</text><text x="317" y="72" text-anchor="middle" class="svg-muted" font-size="12">8 bytes</text>
<rect x="375" y="30" width="120" height="60" rx="6" fill="#bae6fd"/><text x="435" y="54" text-anchor="middle" class="svg-ink" font-size="13">Inner IPv4</text><text x="435" y="72" text-anchor="middle" class="svg-muted" font-size="12">EID→EID</text>
<rect x="500" y="30" width="130" height="60" rx="6" fill="#bbf7d0"/><text x="565" y="54" text-anchor="middle" class="svg-ink" font-size="13">Payload</text><text x="565" y="72" text-anchor="middle" class="svg-muted" font-size="12">ICMP, TCP…</text>
<line x1="10" y1="110" x2="370" y2="110" stroke="#64748b" stroke-width="2"/><text x="190" y="130" text-anchor="middle" class="svg-accent" font-size="13">added by the ITR: 20 + 8 + 8 = 36 bytes</text>
<text x="85" y="170" text-anchor="middle" class="svg-muted" font-size="12">100.64.1.2 → 100.64.2.2</text><text x="435" y="170" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.10 → 10.2.2.10</text>
</svg><p class="cap">A packet from PC1 to PC2 on the CORE–XTR2 link. Core routers only route on the orange header.</p></div>

<h3>Outer IPv4 header (20 bytes)</h3>
<p>Source = the ITR's RLOC (100.64.1.2), destination = the chosen remote RLOC (100.64.2.2), protocol 17 (UDP). This is the only address the underlay must route. Because OSPF advertises 100.64.x.x, CORE forwards it like any other packet.</p>

<h3>UDP header (8 bytes)</h3>
<ul>
<li><b>Destination port 4341</b>: LISP data. Control messages use 4342.</li>
<li><b>Source port</b>: a hash of the inner packet's addresses and ports. Different inner flows get different source ports, so underlay routers with ECMP spread LISP traffic across equal paths. This "entropy" trick is reused by VXLAN.</li>
<li><b>Checksum</b>: normally zero for IPv4 outer headers, which saves CPU on the tunnel routers.</li>
</ul>

<h3>LISP header (8 bytes), byte by byte</h3>
<table class="cmp"><tr><th>Bytes</th><th>Field</th><th>Meaning</th></tr>
<tr><td>0</td><td>Flags N L E V I + 3 reserved bits</td><td>N = nonce present, L = locator-status-bits valid, E = echo-nonce request, V = map-version present, I = instance ID present.</td></tr>
<tr><td>1–3</td><td>Nonce (24 bits) or map-version</td><td>A random number used for echo-nonce reachability tests and to detect spoofed replies.</td></tr>
<tr><td>4–7</td><td>Instance ID (24 bits) + LSBs (8 bits), or Locator-Status-Bits (32 bits)</td><td>When I = 1, the first 24 bits carry the instance ID that separates VRFs; otherwise all 32 bits tell the ETR which of the sender's locators are up.</td></tr>
</table>
<p>After the LISP header comes the original inner IP header, untouched: source 10.1.1.10, destination 10.2.2.10, the original TTL. The ETR strips 36 bytes and routes the inner packet on its EID-facing interface.</p>

<div class="eg"><p><b>Worked example: overhead and MTU.</b> PC1 sends a full 1500-byte IP packet. XTR1 adds 20 + 8 + 8 = <b>36 bytes</b>, so the outer packet is <b>1536 bytes</b>. If the underlay MTU is 1500, the router must either fragment, drop and send ICMP "packet too big" back to the host, or you prevent the problem. Options: raise the underlay MTU to at least 1536 (SD-Access uses 9100), or clamp TCP with <code>ip tcp adjust-mss 1360</code> on the EID-facing interface. With an IPv6 outer header the overhead is 40 + 8 + 8 = <b>56 bytes</b>.</p></div>

<h3>Choosing the RLOC and checking it is alive</h3>
<p>If a Map-Reply lists several locators, the ITR uses the lowest priority, then shares traffic by weight, hashing per flow. It tracks locator health in three ways: the <b>locator-status-bits</b> in received packets, <b>echo-nonce</b> (set E, expect the nonce back), and <b>RLOC probing</b> (periodic Map-Requests sent directly to the RLOC). A down locator is marked "down" in <code>show ip lisp map-cache</code> and traffic moves to the next one.</p>

<h3>Where the encapsulation happens</h3>
<p>On IOS XE, LISP creates a virtual interface <b>LISP0</b>. Map-cache entries are installed in CEF pointing to LISP0, so the forwarding plane encapsulates in hardware or CEF, not in the CPU.</p>
<pre class="out">XTR1# show ip cef 10.2.2.10
10.2.2.0/24
  nexthop 100.64.2.2 <span class="hl">LISP0</span></pre>

<div class="warn"><p><b>Common mistake.</b> Testing a new LISP site with small pings only. Pings of 100 bytes pass, but a 1500-byte file transfer stalls because 1536-byte outer packets are dropped somewhere with a 1500 MTU. Always test with <code>ping 10.2.2.10 size 1500 df-bit</code> from inside the site, and check the underlay MTU end to end.</p></div>

<div class="exam"><p><b>Exam trap.</b> 4341 is data, 4342 is control. The LISP header is 8 bytes and the total IPv4 overhead is 36 bytes (no outer Ethernet counted, because LISP carries IP, not frames). VXLAN's 50 bytes <i>does</i> count an outer Ethernet header. Questions love mixing these two numbers.</p></div>

<div class="scn"><h4>The VPN that ate 36 bytes</h4><p>A company ran LISP between branches over an IPsec VPN from the service provider. Web pages loaded partially and SSH sessions froze when listing large directories. A capture on the branch xTR showed full-size TCP segments leaving the host, then ICMP "fragmentation needed" messages that a host firewall dropped. The provider's IPsec already reduced the usable MTU to about 1400, and LISP took another 36. The team set <code>ip tcp adjust-mss 1300</code> on the EID-facing interfaces and asked the provider for a larger MTU.</p><p><b>Lesson:</b> every tunnel layer eats MTU. Add them up before go-live and clamp MSS if you cannot raise MTU.</p></div>

<div class="iv"><p class="q">"What does a LISP-encapsulated packet look like on the wire, and how big is the overhead?"</p><p>Strong answer: outer IPv4 with RLOC source and destination (20 bytes), UDP with destination 4341 and a hashed source port for ECMP entropy (8 bytes), an 8-byte LISP header with flags, nonce, and instance ID or locator-status-bits, then the original IP packet with EID addresses. 36 bytes for IPv4 outer, 56 for IPv6 outer. Mention MTU planning and MSS clamping.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LISP data = outer IP (RLOCs) + UDP 4341 + 8-byte LISP header + original IP packet.</li>
<li>Overhead is 36 bytes with an IPv4 outer header, 56 with IPv6.</li>
<li>The UDP source port is a flow hash that gives the underlay ECMP entropy.</li>
<li>The LISP header carries flags, a nonce, and either a 24-bit instance ID or locator-status-bits.</li>
<li>Plan MTU: raise the underlay or clamp TCP MSS; test with DF-bit pings at full size.</li>
</ul></div>
`,hi:`
<p>Jab ITR ko pata chal jaata hai destination kahan rehta hai, woh ek courier ki tarah bartav karta hai jo chitthi ko ek bade lifafe mein daalta hai. Andar wali chitthi ka original From aur To (EIDs) wahi rehta hai. Bahar ke lifafe par depot-se-depot address (RLOCs) aur ek chhota label hota hai jo kehta hai "yeh LISP parcel hai" (LISP header). Core sirf bahar ka lifafa padhta hai.</p>

<h3>Encapsulated packet, layer by layer</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="LISP encapsulation">
<rect x="10" y="30" width="150" height="60" rx="6" fill="#fed7aa"/><text x="85" y="54" text-anchor="middle" class="svg-ink" font-size="13">Outer IPv4</text><text x="85" y="72" text-anchor="middle" class="svg-muted" font-size="12">20 bytes, RLOC→RLOC</text>
<rect x="165" y="30" width="95" height="60" rx="6" fill="#fde68a"/><text x="212" y="54" text-anchor="middle" class="svg-ink" font-size="13">UDP</text><text x="212" y="72" text-anchor="middle" class="svg-muted" font-size="12">8, dst 4341</text>
<rect x="265" y="30" width="105" height="60" rx="6" fill="#ddd6fe"/><text x="317" y="54" text-anchor="middle" class="svg-ink" font-size="13">LISP</text><text x="317" y="72" text-anchor="middle" class="svg-muted" font-size="12">8 bytes</text>
<rect x="375" y="30" width="120" height="60" rx="6" fill="#bae6fd"/><text x="435" y="54" text-anchor="middle" class="svg-ink" font-size="13">Inner IPv4</text><text x="435" y="72" text-anchor="middle" class="svg-muted" font-size="12">EID→EID</text>
<rect x="500" y="30" width="130" height="60" rx="6" fill="#bbf7d0"/><text x="565" y="54" text-anchor="middle" class="svg-ink" font-size="13">Payload</text><text x="565" y="72" text-anchor="middle" class="svg-muted" font-size="12">ICMP, TCP…</text>
<line x1="10" y1="110" x2="370" y2="110" stroke="#64748b" stroke-width="2"/><text x="190" y="130" text-anchor="middle" class="svg-accent" font-size="13">ITR jodta hai: 20 + 8 + 8 = 36 bytes</text>
<text x="85" y="170" text-anchor="middle" class="svg-muted" font-size="12">100.64.1.2 → 100.64.2.2</text><text x="435" y="170" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.10 → 10.2.2.10</text>
</svg><p class="cap">CORE–XTR2 link par PC1 se PC2 ka packet. Core routers sirf orange header par route karte hain.</p></div>

<h3>Outer IPv4 header (20 bytes)</h3>
<p>Source = ITR ka RLOC (100.64.1.2), destination = chuna gaya remote RLOC (100.64.2.2), protocol 17 (UDP). Underlay ko sirf yahi address route karna hota hai. Kyunki OSPF 100.64.x.x advertise karta hai, CORE ise kisi bhi aur packet ki tarah forward karta hai.</p>

<h3>UDP header (8 bytes)</h3>
<ul>
<li><b>Destination port 4341</b>: LISP data. Control messages 4342 use karte hain.</li>
<li><b>Source port</b>: andar wale packet ke addresses aur ports ka hash. Alag inner flows ko alag source ports milte hain, isliye ECMP wale underlay routers LISP traffic ko barabar paths par faila dete hain. Yahi "entropy" trick VXLAN bhi use karta hai.</li>
<li><b>Checksum</b>: IPv4 outer headers ke liye aam taur par zero, jisse tunnel routers ka CPU bachta hai.</li>
</ul>

<h3>LISP header (8 bytes), byte by byte</h3>
<table class="cmp"><tr><th>Bytes</th><th>Field</th><th>Matlab</th></tr>
<tr><td>0</td><td>Flags N L E V I + 3 reserved bits</td><td>N = nonce present, L = locator-status-bits valid, E = echo-nonce request, V = map-version present, I = instance ID present.</td></tr>
<tr><td>1–3</td><td>Nonce (24 bits) ya map-version</td><td>Ek random number jo echo-nonce reachability tests aur spoofed replies pakadne ke liye use hota hai.</td></tr>
<tr><td>4–7</td><td>Instance ID (24 bits) + LSBs (8 bits), ya Locator-Status-Bits (32 bits)</td><td>Jab I = 1, pehle 24 bits instance ID le jaate hain jo VRFs ko alag karta hai; warna saare 32 bits ETR ko batate hain ki sender ke kaunse locators up hain.</td></tr>
</table>
<p>LISP header ke baad original inner IP header aata hai, bina chhede: source 10.1.1.10, destination 10.2.2.10, original TTL. ETR 36 bytes hatata hai aur inner packet ko apne EID-facing interface par route karta hai.</p>

<div class="eg"><p><b>Worked example: overhead aur MTU.</b> PC1 poora 1500-byte IP packet bhejta hai. XTR1 20 + 8 + 8 = <b>36 bytes</b> jodta hai, to outer packet <b>1536 bytes</b> ka ho jaata hai. Agar underlay MTU 1500 hai, to router ko ya fragment karna padega, ya drop karke host ko ICMP "packet too big" bhejna padega, ya aap problem ko pehle hi rok do. Options: underlay MTU kam se kam 1536 karo (SD-Access 9100 use karta hai), ya EID-facing interface par <code>ip tcp adjust-mss 1360</code> se TCP clamp karo. IPv6 outer header ke saath overhead 40 + 8 + 8 = <b>56 bytes</b> hai.</p></div>

<h3>RLOC chunna aur check karna ki woh zinda hai</h3>
<p>Agar Map-Reply mein kai locators hain, ITR sabse kam priority use karta hai, phir weight ke hisaab se traffic baant-ta hai, har flow ka hash karke. Woh locator health teen tarah se track karta hai: aaye packets mein <b>locator-status-bits</b>, <b>echo-nonce</b> (E set karo, nonce wapas aane ki umeed), aur <b>RLOC probing</b> (RLOC ko seedhe periodic Map-Requests). Down locator <code>show ip lisp map-cache</code> mein "down" mark hota hai aur traffic agle par chala jaata hai.</p>

<h3>Encapsulation kahan hota hai</h3>
<p>IOS XE par LISP ek virtual interface <b>LISP0</b> banata hai. Map-cache entries CEF mein LISP0 ki taraf point karte hue install hoti hain, isliye forwarding plane hardware ya CEF mein encapsulate karta hai, CPU mein nahi.</p>
<pre class="out">XTR1# show ip cef 10.2.2.10
10.2.2.0/24
  nexthop 100.64.2.2 <span class="hl">LISP0</span></pre>

<div class="warn"><p><b>Common galti.</b> Nayi LISP site ko sirf chhote pings se test karna. 100 byte ke pings nikal jaate hain, lekin 1500-byte file transfer atak jaata hai kyunki 1536-byte outer packets kahin 1500 MTU par drop ho rahe hain. Hamesha site ke andar se <code>ping 10.2.2.10 size 1500 df-bit</code> se test karo, aur underlay MTU end to end check karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> 4341 data hai, 4342 control. LISP header 8 bytes ka hai aur total IPv4 overhead 36 bytes (outer Ethernet nahi gina jaata, kyunki LISP IP le jaata hai, frames nahi). VXLAN ke 50 bytes mein outer Ethernet header <i>gina</i> jaata hai. Questions in dono numbers ko milana pasand karte hain.</p></div>

<div class="scn"><h4>VPN jo 36 bytes kha gaya</h4><p>Ek company service provider ke IPsec VPN par branches ke beech LISP chala rahi thi. Web pages aadhe load hote the aur bade directories list karte waqt SSH sessions freeze ho jaate the. Branch xTR par capture mein host se full-size TCP segments nikalte dikhe, phir ICMP "fragmentation needed" messages jinhe host firewall ne drop kar diya. Provider ka IPsec pehle hi usable MTU lagbhag 1400 kar chuka tha, aur LISP ne 36 aur le liye. Team ne EID-facing interfaces par <code>ip tcp adjust-mss 1300</code> set kiya aur provider se bada MTU maanga.</p><p><b>Seekh:</b> har tunnel layer MTU khaati hai. Go-live se pehle unhe jodo aur agar MTU nahi badha sakte to MSS clamp karo.</p></div>

<div class="iv"><p class="q">"LISP-encapsulated packet wire par kaisa dikhta hai, aur overhead kitna hai?"</p><p>Strong answer: RLOC source aur destination ke saath outer IPv4 (20 bytes), destination 4341 aur ECMP entropy ke liye hashed source port wala UDP (8 bytes), flags, nonce, aur instance ID ya locator-status-bits wala 8-byte LISP header, phir EID addresses wala original IP packet. IPv4 outer ke liye 36 bytes, IPv6 outer ke liye 56. MTU planning aur MSS clamping ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LISP data = outer IP (RLOCs) + UDP 4341 + 8-byte LISP header + original IP packet.</li>
<li>IPv4 outer header ke saath overhead 36 bytes, IPv6 ke saath 56.</li>
<li>UDP source port ek flow hash hai jo underlay ko ECMP entropy deta hai.</li>
<li>LISP header mein flags, nonce, aur ya to 24-bit instance ID ya locator-status-bits hote hain.</li>
<li>MTU plan karo: underlay badhao ya TCP MSS clamp karo; full size DF-bit pings se test karo.</li>
</ul></div>
`}};export{e as default};