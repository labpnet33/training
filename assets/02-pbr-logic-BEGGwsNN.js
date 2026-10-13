var e={id:`pbr-logic`,h:{en:`How PBR thinks: ingress, route maps, match and set`,hi:`PBR kaise sochta hai: ingress, route maps, match aur set`},body:{en:`
<p>Imagine a post office sorting room. Normally every letter goes into the bin for its destination PIN code. One day the manager puts a supervisor at the door who checks every incoming letter first: "Letters from the government office go by speed post, everything else goes to the normal bins." The supervisor only stands at the <b>entry door</b>, only looks at letters as they <b>arrive</b>, and when a letter does not fit his rule he simply lets it continue to the normal sorting. That supervisor is PBR.</p>

<h3>Where PBR sits in the forwarding path</h3>
<p>When a packet arrives on a router interface, the router normally does one thing: look up the destination in the forwarding table (CEF, built from the routing table) and send the packet out. With PBR configured on that interface, an extra step is inserted <b>before</b> the destination lookup:</p>
<ol>
<li>The packet arrives on an interface that has <code>ip policy route-map NAME</code>.</li>
<li>The router walks the route map sequences in order (10, 20, 30...).</li>
<li>If a <b>permit</b> sequence matches, its <b>set</b> action decides the forwarding (for example a new next hop).</li>
<li>If a <b>deny</b> sequence matches, or nothing matches at all, the packet goes to <b>normal destination-based routing</b>.</li>
</ol>
<p>Two consequences follow. First, PBR is an <b>ingress</b> feature: you apply it on the interface where the traffic you want to steer <b>enters</b> the router, never on the exit interface. Second, PBR does not touch traffic the router generates itself (pings, routing updates, syslog) unless you add a <b>local policy</b>, covered in chapter 5.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="PBR decision flow">
<rect x="10" y="100" width="120" height="48" rx="8" fill="#fde68a"/><text x="70" y="121" text-anchor="middle" class="svg-ink" font-size="13">Packet in</text><text x="70" y="138" text-anchor="middle" class="svg-muted" font-size="12">on Gi0/3</text>
<rect x="165" y="100" width="130" height="48" rx="8" fill="#bae6fd"/><text x="230" y="121" text-anchor="middle" class="svg-ink" font-size="13">Route map</text><text x="230" y="138" text-anchor="middle" class="svg-muted" font-size="12">seq 10, 20...</text>
<rect x="340" y="20" width="160" height="48" rx="8" fill="#bbf7d0"/><text x="420" y="41" text-anchor="middle" class="svg-ink" font-size="13">permit + match</text><text x="420" y="58" text-anchor="middle" class="svg-muted" font-size="12">apply set clause</text>
<rect x="340" y="180" width="160" height="48" rx="8" fill="#e2e8f0"/><text x="420" y="201" text-anchor="middle" class="svg-ink" font-size="13">deny or no match</text><text x="420" y="218" text-anchor="middle" class="svg-muted" font-size="12">normal routing</text>
<rect x="530" y="100" width="100" height="48" rx="8" fill="#ddd6fe"/><text x="580" y="129" text-anchor="middle" class="svg-ink" font-size="13">Egress</text>
<line x1="130" y1="124" x2="165" y2="124" stroke="#64748b" stroke-width="2"/>
<line x1="295" y1="115" x2="340" y2="50" stroke="#64748b" stroke-width="2"/>
<line x1="295" y1="135" x2="340" y2="200" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="44" x2="555" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="204" x2="555" y2="148" stroke="#64748b" stroke-width="2"/>
<text x="320" y="245" text-anchor="middle" class="svg-accent" font-size="12">Nothing is dropped by PBR logic itself</text>
</svg><p class="cap">PBR runs before the routing lookup; unmatched packets fall through to the normal routing table.</p></div>

<h3>Route maps as a PBR language</h3>
<p>You already know route maps from redistribution and BGP, where they filter and modify <b>routes</b>. In PBR the same syntax filters and steers <b>packets</b>. The words stay the same, the meaning shifts slightly:</p>
<table class="cmp"><tr><th>Element</th><th>In redistribution</th><th>In PBR</th></tr>
<tr><td><code>route-map X permit 10</code> matches</td><td>Route is redistributed</td><td>Packet is policy-routed with the set clauses</td></tr>
<tr><td><code>route-map X deny 10</code> matches</td><td>Route is blocked</td><td>Packet is routed <b>normally</b></td></tr>
<tr><td>No sequence matches (implicit deny)</td><td>Route is blocked</td><td>Packet is routed <b>normally</b></td></tr>
<tr><td>ACL <code>deny</code> line hit inside a match</td><td>That sequence does not match</td><td>That sequence does not match; try the next one</td></tr>
</table>
<p>The key sentence: <b>in PBR, "deny" never means "drop"; it means "use the routing table".</b> If you really want to drop certain traffic with PBR, you use <code>set interface Null0</code>, but an ACL on the interface is the normal tool for that.</p>

<h3>The match clauses you need</h3>
<dl class="terms">
<dt>match ip address ACL</dt><dd>Select packets with a standard or extended ACL (numbered or named). A standard ACL checks only the source address. An extended ACL can check source, destination, protocol and ports. Multiple ACLs on one line are OR-ed: a packet matching any of them matches.</dd>
<dt>match length MIN MAX</dt><dd>Select packets by their Layer 3 length in bytes. Classic use: small interactive packets (SSH keystrokes, voice signalling) over a low-latency link, large bulk transfers over the high-bandwidth link. Example: <code>match length 0 400</code>.</dd>
</dl>
<p>If a sequence has both a <code>match ip address</code> and a <code>match length</code> line, the packet must satisfy <b>both</b> (different match types are AND-ed). If a sequence has no match line at all, every packet matches it, which is useful as a catch-all last sequence.</p>

<div class="eg"><p><b>Worked example.</b> Route map <code>WAN-SPLIT</code>: sequence 10 permits with <code>match ip address VOICE</code> (UDP from 192.168.10.0/24 to ports 16384 to 32767) and sets next hop 10.0.1.1. Sequence 20 denies with <code>match ip address BACKUP</code>. Sequence 30 permits with <code>match ip address GUEST-NET</code> and sets next hop 10.0.2.1. Now trace four packets arriving on the LAN interface:</p>
<ul>
<li>Staff RTP voice packet: matches seq 10, goes to 10.0.1.1.</li>
<li>Backup traffic to the DR site: matches seq 20 (deny), routed normally.</li>
<li>Guest web packet from 192.168.20.10: misses 10 and 20, matches 30, goes to 10.0.2.1.</li>
<li>Staff web packet: matches nothing, routed normally via the default route.</li>
</ul></div>

<h3>What PBR is good at, and what it is not</h3>
<p>PBR is excellent for a few well-defined exceptions: a guest subnet, a voice class, a backup server, a specific partner network. It is poor as a general routing scheme: it does not react to topology changes unless you add tracking, it does not advertise anything to neighbours, and every exception you add is one more thing to remember during an outage at 3 a.m. If most of your traffic needs separate paths, VRF-lite (chapter 6) or proper routing policy is usually cleaner.</p>

<div class="warn"><p><b>Common mistake.</b> Writing the ACL from the wrong side. The ACL is evaluated against packets <b>as they arrive</b> on the policy interface. For guests going to the internet, the guest subnet is the <b>source</b>. <code>permit ip any 192.168.20.0 0.0.0.255</code> matches the return traffic, which never arrives on Gi0/3, so nothing is ever policy-routed.</p></div>

<div class="exam"><p><b>Exam trap.</b> A question shows a PBR route map whose ACL has no permit line for the traffic and asks what happens to it. The answer is "routed normally using the routing table", not "dropped". Remember the implicit deny at the end of a PBR route map means "normal routing".</p></div>

<div class="scn"><h4>The policy that was applied on the way out</h4><p>A new engineer at a Pune branch was told to send backup traffic from the server VLAN over the second WAN link. He built a correct route map and applied <code>ip policy route-map BACKUP-WAN2</code> on the WAN2 interface, "because that is where the traffic should go". Backups kept using WAN1. <code>show route-map</code> showed zero policy matches. The senior engineer moved the policy to the server VLAN SVI, where backup packets enter the router. The counters started climbing and the WAN2 graph lit up.</p><p><b>Lesson:</b> PBR goes where the packets arrive, not where you want them to leave.</p></div>

<div class="iv"><p class="q">"What happens to a packet that does not match any sequence in a PBR route map?"</p><p>Strong answer: it is forwarded normally using the routing table. The implicit deny at the end of a route map, and any explicit deny sequence, mean "do not policy-route this packet" in PBR, not "drop it". Contrast with redistribution, where the implicit deny blocks the route. Mention that to drop traffic with PBR you would need <code>set interface Null0</code>, though an ACL is the usual tool.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PBR is applied inbound with <code>ip policy route-map</code> and runs before the routing lookup.</li>
<li>Permit sequence plus match = policy-route; deny sequence or no match = normal routing, never a drop.</li>
<li>Match with <code>match ip address</code> (standard or extended ACL) and <code>match length</code>; different match types are AND-ed.</li>
<li>The ACL sees the packet as it arrives, so the steered subnet is normally the source.</li>
<li>Use PBR for a few clear exceptions; large-scale separation is better done with VRFs or routing policy.</li>
</ul></div>
`,hi:`
<p>Ek post office ke sorting room ki kalpana karo. Normally har letter apne destination PIN code ke bin mein jaata hai. Ek din manager darwaze par ek supervisor bitha deta hai jo har aane wala letter pehle check karta hai: "Government office se aaye letters speed post se jaayenge, baaki sab normal bins mein." Supervisor sirf <b>entry door</b> par khada hai, sirf letters ko <b>aate waqt</b> dekhta hai, aur jab koi letter uske rule mein fit nahi hota to use normal sorting mein aage jaane deta hai. Woh supervisor hi PBR hai.</p>

<h3>Forwarding path mein PBR kahan baithta hai</h3>
<p>Jab router interface par packet aata hai, router normally ek kaam karta hai: forwarding table (CEF, jo routing table se banti hai) mein destination lookup karo aur packet bahar bhejo. Us interface par PBR configure ho to destination lookup se <b>pehle</b> ek extra step jud jaata hai:</p>
<ol>
<li>Packet us interface par aata hai jis par <code>ip policy route-map NAME</code> hai.</li>
<li>Router route map ke sequences order mein check karta hai (10, 20, 30...).</li>
<li>Agar koi <b>permit</b> sequence match karta hai, uska <b>set</b> action forwarding decide karta hai (jaise naya next hop).</li>
<li>Agar koi <b>deny</b> sequence match karta hai, ya kuch bhi match nahi karta, packet <b>normal destination-based routing</b> par jaata hai.</li>
</ol>
<p>Isse do nateeje nikalte hain. Pehla, PBR ek <b>ingress</b> feature hai: aap ise us interface par lagate ho jahan se steer karne wala traffic router mein <b>aata</b> hai, exit interface par kabhi nahi. Doosra, PBR router ke khud ke banaye traffic (pings, routing updates, syslog) ko nahi chhoota jab tak aap <b>local policy</b> na jodo, jo chapter 5 mein cover hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="PBR decision flow">
<rect x="10" y="100" width="120" height="48" rx="8" fill="#fde68a"/><text x="70" y="121" text-anchor="middle" class="svg-ink" font-size="13">Packet aaya</text><text x="70" y="138" text-anchor="middle" class="svg-muted" font-size="12">Gi0/3 par</text>
<rect x="165" y="100" width="130" height="48" rx="8" fill="#bae6fd"/><text x="230" y="121" text-anchor="middle" class="svg-ink" font-size="13">Route map</text><text x="230" y="138" text-anchor="middle" class="svg-muted" font-size="12">seq 10, 20...</text>
<rect x="340" y="20" width="160" height="48" rx="8" fill="#bbf7d0"/><text x="420" y="41" text-anchor="middle" class="svg-ink" font-size="13">permit + match</text><text x="420" y="58" text-anchor="middle" class="svg-muted" font-size="12">set clause lagao</text>
<rect x="340" y="180" width="160" height="48" rx="8" fill="#e2e8f0"/><text x="420" y="201" text-anchor="middle" class="svg-ink" font-size="13">deny ya no match</text><text x="420" y="218" text-anchor="middle" class="svg-muted" font-size="12">normal routing</text>
<rect x="530" y="100" width="100" height="48" rx="8" fill="#ddd6fe"/><text x="580" y="129" text-anchor="middle" class="svg-ink" font-size="13">Egress</text>
<line x1="130" y1="124" x2="165" y2="124" stroke="#64748b" stroke-width="2"/>
<line x1="295" y1="115" x2="340" y2="50" stroke="#64748b" stroke-width="2"/>
<line x1="295" y1="135" x2="340" y2="200" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="44" x2="555" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="204" x2="555" y2="148" stroke="#64748b" stroke-width="2"/>
<text x="320" y="245" text-anchor="middle" class="svg-accent" font-size="12">PBR logic khud kuch drop nahi karta</text>
</svg><p class="cap">PBR routing lookup se pehle chalta hai; unmatched packets normal routing table par gir jaate hain.</p></div>

<h3>Route maps ek PBR language ki tarah</h3>
<p>Route maps aap redistribution aur BGP se jaante ho, jahan woh <b>routes</b> ko filter aur modify karte hain. PBR mein wahi syntax <b>packets</b> ko filter aur steer karta hai. Shabd same rehte hain, matlab thoda badal jaata hai:</p>
<table class="cmp"><tr><th>Element</th><th>Redistribution mein</th><th>PBR mein</th></tr>
<tr><td><code>route-map X permit 10</code> match hota hai</td><td>Route redistribute hota hai</td><td>Packet set clauses ke saath policy-route hota hai</td></tr>
<tr><td><code>route-map X deny 10</code> match hota hai</td><td>Route block hota hai</td><td>Packet <b>normal</b> route hota hai</td></tr>
<tr><td>Koi sequence match nahi (implicit deny)</td><td>Route block hota hai</td><td>Packet <b>normal</b> route hota hai</td></tr>
<tr><td>Match ke andar ACL ki <code>deny</code> line hit</td><td>Woh sequence match nahi karta</td><td>Woh sequence match nahi karta; agla try karo</td></tr>
</table>
<p>Sabse zaroori line: <b>PBR mein "deny" ka matlab kabhi "drop" nahi hota; iska matlab hai "routing table use karo".</b> Agar aap sach mein PBR se kuch traffic drop karna chahte ho, to <code>set interface Null0</code> use karte ho, lekin iske liye interface par ACL normal tool hai.</p>

<h3>Match clauses jo aapko chahiye</h3>
<dl class="terms">
<dt>match ip address ACL</dt><dd>Standard ya extended ACL (numbered ya named) se packets chuno. Standard ACL sirf source address check karta hai. Extended ACL source, destination, protocol aur ports check kar sakta hai. Ek line par kai ACLs OR hote hain: packet unmein se kisi se bhi match kare to match.</dd>
<dt>match length MIN MAX</dt><dd>Packets ko unki Layer 3 length (bytes) se chuno. Classic use: chhote interactive packets (SSH keystrokes, voice signalling) kam-latency link se, bade bulk transfers high-bandwidth link se. Example: <code>match length 0 400</code>.</dd>
</dl>
<p>Agar ek sequence mein <code>match ip address</code> aur <code>match length</code> dono lines hain, to packet ko <b>dono</b> satisfy karne honge (alag match types AND hote hain). Agar sequence mein koi match line hi nahi, to har packet match karta hai, jo catch-all last sequence ke liye useful hai.</p>

<div class="eg"><p><b>Worked example.</b> Route map <code>WAN-SPLIT</code>: sequence 10 <code>match ip address VOICE</code> (192.168.10.0/24 se ports 16384 se 32767 tak UDP) ke saath permit karta hai aur next hop 10.0.1.1 set karta hai. Sequence 20 <code>match ip address BACKUP</code> ke saath deny karta hai. Sequence 30 <code>match ip address GUEST-NET</code> ke saath permit karta hai aur next hop 10.0.2.1 set karta hai. Ab LAN interface par aane wale chaar packets trace karo:</p>
<ul>
<li>Staff RTP voice packet: seq 10 match, 10.0.1.1 par jaata hai.</li>
<li>DR site ka backup traffic: seq 20 (deny) match, normal route hota hai.</li>
<li>192.168.20.10 se guest web packet: 10 aur 20 miss, 30 match, 10.0.2.1 par jaata hai.</li>
<li>Staff web packet: kuch match nahi, default route se normal route hota hai.</li>
</ul></div>

<h3>PBR kis cheez mein achha hai, aur kismein nahi</h3>
<p>PBR kuch saaf defined exceptions ke liye bahut badhiya hai: ek guest subnet, ek voice class, ek backup server, ek specific partner network. General routing scheme ke roop mein yeh kamzor hai: tracking ke bina yeh topology changes par react nahi karta, neighbours ko kuch advertise nahi karta, aur har naya exception raat 3 baje ke outage mein yaad rakhne wali ek aur cheez hai. Agar aapke zyada tar traffic ko alag paths chahiye, to VRF-lite (chapter 6) ya proper routing policy aam taur par zyada saaf hai.</p>

<div class="warn"><p><b>Common galti.</b> ACL ko galat side se likhna. ACL policy interface par <b>aate hue</b> packets par evaluate hota hai. Internet ja rahe guests ke liye guest subnet <b>source</b> hai. <code>permit ip any 192.168.20.0 0.0.0.255</code> return traffic match karta hai, jo Gi0/3 par kabhi aata hi nahi, isliye kuch bhi policy-route nahi hota.</p></div>

<div class="exam"><p><b>Exam trap.</b> Sawaal ek PBR route map dikhata hai jiske ACL mein traffic ke liye koi permit line nahi, aur poochta hai uska kya hoga. Jawab hai "routing table se normal route hoga", "drop" nahi. Yaad rakho PBR route map ke end ka implicit deny ka matlab "normal routing" hai.</p></div>

<div class="scn"><h4>Woh policy jo bahar jaane wale raaste par lagi thi</h4><p>Pune branch ke ek naye engineer ko kaha gaya ki server VLAN ka backup traffic doosre WAN link se bheje. Usne sahi route map banaya aur <code>ip policy route-map BACKUP-WAN2</code> WAN2 interface par laga diya, "kyunki traffic wahin se jaana chahiye". Backups WAN1 hi use karte rahe. <code>show route-map</code> zero policy matches dikha raha tha. Senior engineer ne policy ko server VLAN SVI par shift kiya, jahan backup packets router mein aate hain. Counters badhne lage aur WAN2 ka graph chamak utha.</p><p><b>Seekh:</b> PBR wahan lagta hai jahan packets aate hain, wahan nahi jahan aap unhe bhejna chahte ho.</p></div>

<div class="iv"><p class="q">"Jo packet PBR route map ke kisi sequence se match nahi karta, uska kya hota hai?"</p><p>Strong answer: woh routing table se normal forward hota hai. Route map ke end ka implicit deny, aur koi bhi explicit deny sequence, PBR mein "is packet ko policy-route mat karo" ka matlab rakhte hain, "drop karo" nahi. Redistribution se contrast karo, jahan implicit deny route ko block karta hai. Batao ki PBR se traffic drop karne ke liye <code>set interface Null0</code> chahiye hoga, lekin aam tool ACL hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PBR <code>ip policy route-map</code> se inbound lagta hai aur routing lookup se pehle chalta hai.</li>
<li>Permit sequence plus match = policy-route; deny sequence ya no match = normal routing, kabhi drop nahi.</li>
<li><code>match ip address</code> (standard ya extended ACL) aur <code>match length</code> se match karo; alag match types AND hote hain.</li>
<li>ACL packet ko aate waqt dekhta hai, isliye steer hone wala subnet normally source hota hai.</li>
<li>PBR kuch clear exceptions ke liye use karo; bade scale ka separation VRFs ya routing policy se behtar hai.</li>
</ul></div>
`}};export{e as default};