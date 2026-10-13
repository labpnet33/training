var e={id:`packet-flow`,h:{en:`The ASA packet flow, step by step`,hi:`ASA packet flow, step by step`},body:{en:`
<p>Think of a highway toll plaza with two kinds of lanes. Cars with a tag that the system already knows glide through the <b>fast lane</b>: the barrier opens because the car is already registered. A car without a tag must stop at the <b>cash lane</b>, where an officer checks where it is going, whether it is allowed, writes a receipt and registers it. After that, the car's return trip uses the fast lane too. An ASA works the same way. The first packet of a flow takes the slow, careful path; every later packet of that flow, in both directions, matches an existing <b>connection</b> and takes the fast path.</p>

<h3>Three paths inside the ASA</h3>
<dl class="terms">
<dt>Fast path</dt><dd>Packets that match an existing connection. The ASA skips the access list, applies the stored translation, does TCP sequence and state checks, and forwards. This is where most packets live.</dd>
<dt>Session management path (slow path)</dt><dd>The first packet of a new flow. Here the ASA does the expensive work: NAT lookup, route lookup, access list, inspection setup, and finally it builds the connection and translation entries.</dd>
<dt>Control plane path</dt><dd>Traffic to the ASA itself (SSH, ASDM, ping to an interface, routing protocols) and some application inspections that need deeper processing.</dd>
</dl>
<p>Cisco calls the data-plane engine the <b>ASP</b> (Accelerated Security Path). You will meet that name again in <code>show asp drop</code> and <code>capture type asp-drop</code>.</p>

<h3>The order for a new connection</h3>
<div class="dia"><svg viewBox="0 0 640 420" role="img" aria-label="ASA packet flow">
<rect x="30" y="20" width="210" height="40" rx="8" fill="#e2e8f0"/><text x="135" y="45" text-anchor="middle" class="svg-ink" font-size="13">1 Ingress interface</text>
<rect x="30" y="80" width="210" height="40" rx="8" fill="#bae6fd"/><text x="135" y="105" text-anchor="middle" class="svg-ink" font-size="13">2 Existing conn lookup</text>
<rect x="30" y="140" width="210" height="40" rx="8" fill="#fde68a"/><text x="135" y="165" text-anchor="middle" class="svg-ink" font-size="13">3 New TCP must be SYN</text>
<rect x="30" y="200" width="210" height="40" rx="8" fill="#ddd6fe"/><text x="135" y="225" text-anchor="middle" class="svg-ink" font-size="13">4 UN-NAT (NAT divert)</text>
<rect x="30" y="260" width="210" height="40" rx="8" fill="#e2e8f0"/><text x="135" y="285" text-anchor="middle" class="svg-ink" font-size="13">5 Route lookup</text>
<rect x="30" y="320" width="210" height="40" rx="8" fill="#fed7aa"/><text x="135" y="345" text-anchor="middle" class="svg-ink" font-size="13">6 ACL check (real IPs)</text>
<rect x="400" y="320" width="210" height="40" rx="8" fill="#ddd6fe"/><text x="505" y="345" text-anchor="middle" class="svg-ink" font-size="13">7 NAT translate, xlate</text>
<rect x="400" y="260" width="210" height="40" rx="8" fill="#bbf7d0"/><text x="505" y="285" text-anchor="middle" class="svg-ink" font-size="13">8 Inspection (MPF)</text>
<rect x="400" y="200" width="210" height="40" rx="8" fill="#bae6fd"/><text x="505" y="225" text-anchor="middle" class="svg-ink" font-size="13">9 Connection built</text>
<rect x="400" y="140" width="210" height="40" rx="8" fill="#e2e8f0"/><text x="505" y="165" text-anchor="middle" class="svg-ink" font-size="13">10 Next hop and ARP</text>
<rect x="400" y="80" width="210" height="40" rx="8" fill="#e2e8f0"/><text x="505" y="105" text-anchor="middle" class="svg-ink" font-size="13">11 Transmit on egress</text>
<line x1="135" y1="60" x2="135" y2="80" stroke="#64748b" stroke-width="2"/><line x1="135" y1="120" x2="135" y2="140" stroke="#64748b" stroke-width="2"/><line x1="135" y1="180" x2="135" y2="200" stroke="#64748b" stroke-width="2"/><line x1="135" y1="240" x2="135" y2="260" stroke="#64748b" stroke-width="2"/><line x1="135" y1="300" x2="135" y2="320" stroke="#64748b" stroke-width="2"/>
<line x1="240" y1="340" x2="400" y2="340" stroke="#64748b" stroke-width="2"/>
<line x1="505" y1="320" x2="505" y2="300" stroke="#64748b" stroke-width="2"/><line x1="505" y1="260" x2="505" y2="240" stroke="#64748b" stroke-width="2"/><line x1="505" y1="200" x2="505" y2="180" stroke="#64748b" stroke-width="2"/><line x1="505" y1="140" x2="505" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="240" y1="100" x2="400" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="12">match = fast path</text>
<text x="320" y="126" text-anchor="middle" class="svg-muted" font-size="12">(ACL skipped)</text>
<text x="320" y="330" text-anchor="middle" class="svg-muted" font-size="12">permitted</text>
<text x="320" y="390" text-anchor="middle" class="svg-ink" font-size="12">capture: ingress sees step 1, egress sees step 11 (after NAT)</text>
<text x="320" y="410" text-anchor="middle" class="svg-ink" font-size="12">packet-tracer walks steps 2 to 10; syslog 106023 at 6, 305011 at 7, 302013 at 9</text>
</svg><p class="cap">The first packet of a flow walks all eleven steps. Later packets match step 2 and jump to the egress steps.</p></div>

<ol>
<li><b>Ingress interface.</b> The frame arrives, interface counters increase, and an ingress capture records it here, before any policy.</li>
<li><b>Existing connection lookup.</b> The ASA looks up the connection table. A match sends the packet down the fast path.</li>
<li><b>TCP state check.</b> With no connection, a TCP packet must be a SYN. Anything else (a stray ACK or RST) is dropped with the reason <code>tcp-not-syn</code> and syslog 106015.</li>
<li><b>UN-NAT.</b> If a static NAT rule owns the destination address, the ASA untranslates it to the real address and the rule itself chooses the egress interface. packet-tracer calls this "NAT divert to egress interface".</li>
<li><b>Route lookup.</b> Without a NAT divert, the routing table picks the egress interface.</li>
<li><b>Access list.</b> The interface ACL on the <b>ingress</b> interface (and the global ACL, if any) is checked with the <b>real</b> destination, because untranslation already happened. With no ACL, security levels decide.</li>
<li><b>NAT translate.</b> The matching source NAT rule is applied and a translation (xlate) is built, logged as 305011 for dynamic PAT.</li>
<li><b>Inspection.</b> Modular Policy Framework policies apply: application inspection (DNS, FTP, ICMP when enabled), TCP normalisation, connection limits.</li>
<li><b>Connection built.</b> The stateful entry is created and logged (302013 TCP, 302015 UDP, 302020 ICMP).</li>
<li><b>Next hop and ARP.</b> The final next hop is resolved and its MAC address found. No ARP answer means the packet cannot leave.</li>
<li><b>Transmit.</b> The rewritten packet leaves; an egress capture shows the <b>translated</b> addresses.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> PARTNER 198.51.100.10 port 40000 opens HTTPS to 203.0.113.3 port 443. Step 2: no connection. Step 3: it is a SYN, fine. Step 4: <code>object network WEB</code> with <code>nat (dmz,outside) static 203.0.113.3</code> owns 203.0.113.3, so the destination becomes 10.0.2.10:443 and the egress interface is <code>dmz</code>. Step 6: <code>OUTSIDE_IN</code> is checked for tcp any to 10.0.2.10 eq 443, the real address. Step 9: a connection is built and syslog 302013 records both the real (10.0.2.10/443) and mapped (203.0.113.3/443) destination. The SYN-ACK from WEB then matches the connection at step 2 and flies back on the fast path, with no ACL needed on <code>dmz</code>.</p></div>

<h3>Why the order explains most tickets</h3>
<table class="cmp"><tr><th>Behaviour you see</th><th>Explained by</th></tr>
<tr><td>ACLs must name the real server address, not the public one.</td><td>UN-NAT (4) happens before the ACL (6).</td></tr>
<tr><td>You removed a permit, but the user is still connected.</td><td>Existing connections (2) skip the ACL. Clear the connection.</td></tr>
<tr><td>Return traffic needs no permit.</td><td>Replies match the connection (2).</td></tr>
<tr><td>Ping replies are dropped on outside without <code>inspect icmp</code>.</td><td>Without inspection, ICMP replies do not match a connection, so they are checked as new packets against the outside ACL.</td></tr>
<tr><td>Inside capture shows 10.0.1.10, outside capture shows 203.0.113.2.</td><td>Ingress capture (1) is before NAT; egress capture (11) is after it.</td></tr></table>

<pre class="code"><span class="c">! a permit was removed, but existing sessions keep flowing (fast path)</span>
<span class="c">! remove only the affected sessions, never "clear conn" on a busy box</span>
clear conn address 198.51.100.10</pre>

<div class="warn"><p><b>Common mistake.</b> Assuming a new ACL takes effect immediately for everyone. It does for <b>new</b> connections only. Long-lived sessions (SSH, database, VPN-like tunnels over TCP) survive until they close or time out, or until you clear them.</p></div>

<div class="exam"><p><b>Exam trap.</b> Since ASA 8.3, access lists use <b>real</b> IP addresses because untranslation happens first. An answer that permits the public (mapped) address of a statically translated server is the classic wrong option.</p></div>

<div class="scn"><h4>The contractor who would not go away</h4><p>Security asked the firewall team to block a contractor's IP after the contract ended. The engineer added a deny at the top of <code>OUTSIDE_IN</code> and saw its hit counter stay at zero, while the SSH session from that IP to a jump host was still active the next morning. <code>show conn address 198.51.100.77</code> showed one TCP connection with flags UIO, idle a few seconds. The session was established before the deny, so it lived on the fast path. <code>clear conn address 198.51.100.77</code> dropped it, the next SYN hit the deny, and syslog 106023 appeared.</p><p><b>Lesson:</b> access lists judge the first packet only. When you revoke access, also clear the existing connections.</p></div>

<div class="iv"><p class="q">"Walk me through what the ASA does with the first packet of a new TCP connection."</p><p>Give the order: ingress, connection lookup (miss), TCP must be SYN, UN-NAT for statics (which can pick the egress interface), route lookup, ingress ACL on real addresses, NAT translate and xlate, inspection, connection built, next hop and ARP, transmit. Then say the payoff: later packets and replies match the connection and take the fast path without the ACL. Mentioning that this is why ACLs use real IPs impresses interviewers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>First packet: slow path; later packets and replies: fast path via the connection table.</li>
<li>Order: ingress, conn lookup, SYN check, UN-NAT, route, ACL, NAT, inspection, conn built, next hop and ARP, transmit.</li>
<li>UN-NAT before ACL is why ACLs use real addresses.</li>
<li>Existing connections ignore ACL changes until cleared.</li>
<li>Ingress captures see pre-NAT packets; egress captures see translated packets.</li>
</ul></div>
`,hi:`
<p>Ek highway toll plaza socho jismein do tarah ki lanes hain. Jis car ka tag system pehle se jaanta hai woh <b>fast lane</b> se nikal jaati hai: barrier khulta hai kyunki car pehle se registered hai. Bina tag wali car ko <b>cash lane</b> par rukna padta hai, jahan officer check karta hai ki woh kahan jaa rahi hai, allowed hai ya nahi, receipt likhta hai aur use register karta hai. Uske baad car ka return trip bhi fast lane use karta hai. ASA bhi aise hi kaam karta hai. Flow ka pehla packet dheema, dhyaan wala path leta hai; us flow ka har agla packet, dono directions mein, ek existing <b>connection</b> se match hota hai aur fast path leta hai.</p>

<h3>ASA ke andar teen paths</h3>
<dl class="terms">
<dt>Fast path</dt><dd>Woh packets jo existing connection se match karte hain. ASA access list skip karta hai, stored translation lagata hai, TCP sequence aur state checks karta hai, aur forward kar deta hai. Zyada tar packets yahin rehte hain.</dd>
<dt>Session management path (slow path)</dt><dd>Naye flow ka pehla packet. Yahan ASA mehnga kaam karta hai: NAT lookup, route lookup, access list, inspection setup, aur aakhir mein connection aur translation entries banata hai.</dd>
<dt>Control plane path</dt><dd>Khud ASA ke liye traffic (SSH, ASDM, interface ko ping, routing protocols) aur kuch application inspections jinhe gehri processing chahiye.</dd>
</dl>
<p>Cisco data-plane engine ko <b>ASP</b> (Accelerated Security Path) kehta hai. Yeh naam aapko <code>show asp drop</code> aur <code>capture type asp-drop</code> mein phir milega.</p>

<h3>Naye connection ka order</h3>
<div class="dia"><svg viewBox="0 0 640 420" role="img" aria-label="ASA packet flow">
<rect x="30" y="20" width="210" height="40" rx="8" fill="#e2e8f0"/><text x="135" y="45" text-anchor="middle" class="svg-ink" font-size="13">1 Ingress interface</text>
<rect x="30" y="80" width="210" height="40" rx="8" fill="#bae6fd"/><text x="135" y="105" text-anchor="middle" class="svg-ink" font-size="13">2 Existing conn lookup</text>
<rect x="30" y="140" width="210" height="40" rx="8" fill="#fde68a"/><text x="135" y="165" text-anchor="middle" class="svg-ink" font-size="13">3 Naya TCP SYN hona chahiye</text>
<rect x="30" y="200" width="210" height="40" rx="8" fill="#ddd6fe"/><text x="135" y="225" text-anchor="middle" class="svg-ink" font-size="13">4 UN-NAT (NAT divert)</text>
<rect x="30" y="260" width="210" height="40" rx="8" fill="#e2e8f0"/><text x="135" y="285" text-anchor="middle" class="svg-ink" font-size="13">5 Route lookup</text>
<rect x="30" y="320" width="210" height="40" rx="8" fill="#fed7aa"/><text x="135" y="345" text-anchor="middle" class="svg-ink" font-size="13">6 ACL check (real IPs)</text>
<rect x="400" y="320" width="210" height="40" rx="8" fill="#ddd6fe"/><text x="505" y="345" text-anchor="middle" class="svg-ink" font-size="13">7 NAT translate, xlate</text>
<rect x="400" y="260" width="210" height="40" rx="8" fill="#bbf7d0"/><text x="505" y="285" text-anchor="middle" class="svg-ink" font-size="13">8 Inspection (MPF)</text>
<rect x="400" y="200" width="210" height="40" rx="8" fill="#bae6fd"/><text x="505" y="225" text-anchor="middle" class="svg-ink" font-size="13">9 Connection bana</text>
<rect x="400" y="140" width="210" height="40" rx="8" fill="#e2e8f0"/><text x="505" y="165" text-anchor="middle" class="svg-ink" font-size="13">10 Next hop aur ARP</text>
<rect x="400" y="80" width="210" height="40" rx="8" fill="#e2e8f0"/><text x="505" y="105" text-anchor="middle" class="svg-ink" font-size="13">11 Egress par transmit</text>
<line x1="135" y1="60" x2="135" y2="80" stroke="#64748b" stroke-width="2"/><line x1="135" y1="120" x2="135" y2="140" stroke="#64748b" stroke-width="2"/><line x1="135" y1="180" x2="135" y2="200" stroke="#64748b" stroke-width="2"/><line x1="135" y1="240" x2="135" y2="260" stroke="#64748b" stroke-width="2"/><line x1="135" y1="300" x2="135" y2="320" stroke="#64748b" stroke-width="2"/>
<line x1="240" y1="340" x2="400" y2="340" stroke="#64748b" stroke-width="2"/>
<line x1="505" y1="320" x2="505" y2="300" stroke="#64748b" stroke-width="2"/><line x1="505" y1="260" x2="505" y2="240" stroke="#64748b" stroke-width="2"/><line x1="505" y1="200" x2="505" y2="180" stroke="#64748b" stroke-width="2"/><line x1="505" y1="140" x2="505" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="240" y1="100" x2="400" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="12">match = fast path</text>
<text x="320" y="126" text-anchor="middle" class="svg-muted" font-size="12">(ACL skip)</text>
<text x="320" y="330" text-anchor="middle" class="svg-muted" font-size="12">permitted</text>
<text x="320" y="390" text-anchor="middle" class="svg-ink" font-size="12">capture: ingress step 1 dekhta hai, egress step 11 (NAT ke baad)</text>
<text x="320" y="410" text-anchor="middle" class="svg-ink" font-size="12">packet-tracer steps 2 se 10 chalta hai; syslog 106023 step 6, 305011 step 7, 302013 step 9</text>
</svg><p class="cap">Flow ka pehla packet saare gyarah steps chalta hai. Baad ke packets step 2 par match hote hain aur seedhe egress steps par kood jaate hain.</p></div>

<ol>
<li><b>Ingress interface.</b> Frame aata hai, interface counters badhte hain, aur ingress capture use yahin record karta hai, kisi bhi policy se pehle.</li>
<li><b>Existing connection lookup.</b> ASA connection table dekhta hai. Match mila to packet fast path par jaata hai.</li>
<li><b>TCP state check.</b> Connection na ho to TCP packet SYN hona chahiye. Kuch aur (bhatka hua ACK ya RST) reason <code>tcp-not-syn</code> aur syslog 106015 ke saath drop hota hai.</li>
<li><b>UN-NAT.</b> Agar koi static NAT rule destination address ka maalik hai, to ASA use real address mein untranslate karta hai aur wahi rule egress interface chunta hai. packet-tracer ise "NAT divert to egress interface" kehta hai.</li>
<li><b>Route lookup.</b> NAT divert na ho to routing table egress interface chunti hai.</li>
<li><b>Access list.</b> <b>Ingress</b> interface ki interface ACL (aur global ACL, agar ho) <b>real</b> destination ke saath check hoti hai, kyunki untranslation pehle ho chuka hai. ACL na ho to security levels decide karte hain.</li>
<li><b>NAT translate.</b> Matching source NAT rule lagti hai aur translation (xlate) banta hai, jo dynamic PAT ke liye 305011 ke roop mein log hota hai.</li>
<li><b>Inspection.</b> Modular Policy Framework policies lagti hain: application inspection (DNS, FTP, enable ho to ICMP), TCP normalisation, connection limits.</li>
<li><b>Connection bana.</b> Stateful entry banti hai aur log hoti hai (302013 TCP, 302015 UDP, 302020 ICMP).</li>
<li><b>Next hop aur ARP.</b> Final next hop resolve hota hai aur uska MAC address milta hai. ARP ka jawab na mile to packet bahar nahi jaa sakta.</li>
<li><b>Transmit.</b> Rewritten packet nikalta hai; egress capture <b>translated</b> addresses dikhata hai.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> PARTNER 198.51.100.10 port 40000 se 203.0.113.3 port 443 par HTTPS kholta hai. Step 2: koi connection nahi. Step 3: yeh SYN hai, theek. Step 4: <code>nat (dmz,outside) static 203.0.113.3</code> wala <code>object network WEB</code> 203.0.113.3 ka maalik hai, isliye destination 10.0.2.10:443 ban jaata hai aur egress interface <code>dmz</code> hai. Step 6: <code>OUTSIDE_IN</code> mein tcp any se 10.0.2.10 eq 443 check hota hai, yaani real address. Step 9: connection banta hai aur syslog 302013 real (10.0.2.10/443) aur mapped (203.0.113.3/443) dono destination record karta hai. Phir WEB ka SYN-ACK step 2 par connection se match hota hai aur fast path par wapas udta hai, <code>dmz</code> par kisi ACL ki zaroorat nahi.</p></div>

<h3>Order zyada tar tickets kyun samjhata hai</h3>
<table class="cmp"><tr><th>Jo behaviour dikhta hai</th><th>Wajah</th></tr>
<tr><td>ACLs mein real server address likhna padta hai, public nahi.</td><td>UN-NAT (4) ACL (6) se pehle hota hai.</td></tr>
<tr><td>Aapne permit hataya, par user ab bhi connected hai.</td><td>Existing connections (2) ACL skip karte hain. Connection clear karo.</td></tr>
<tr><td>Return traffic ko permit nahi chahiye.</td><td>Replies connection (2) se match hote hain.</td></tr>
<tr><td><code>inspect icmp</code> ke bina outside par ping replies drop hote hain.</td><td>Inspection ke bina ICMP replies kisi connection se match nahi hote, isliye outside ACL ke against naye packets ki tarah check hote hain.</td></tr>
<tr><td>Inside capture 10.0.1.10 dikhata hai, outside capture 203.0.113.2.</td><td>Ingress capture (1) NAT se pehle hai; egress capture (11) uske baad.</td></tr></table>

<pre class="code"><span class="c">! ek permit hataya gaya, par existing sessions chalte rehte hain (fast path)</span>
<span class="c">! sirf affected sessions hatao, busy box par kabhi "clear conn" nahi</span>
clear conn address 198.51.100.10</pre>

<div class="warn"><p><b>Common galti.</b> Yeh maanna ki nayi ACL sab ke liye turant lagu ho jaati hai. Yeh sirf <b>naye</b> connections par lagu hoti hai. Lambe chalne wale sessions (SSH, database, TCP par chalne wale tunnels) band hone ya timeout hone tak, ya aapke clear karne tak, bache rehte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> ASA 8.3 se access lists <b>real</b> IP addresses use karti hain kyunki untranslation pehle hota hai. Statically translated server ke public (mapped) address ko permit karne wala answer classic galat option hai.</p></div>

<div class="scn"><h4>Woh contractor jo jaata hi nahi tha</h4><p>Contract khatam hone ke baad security ne firewall team se ek contractor ka IP block karne ko kaha. Engineer ne <code>OUTSIDE_IN</code> ke top par deny joda aur dekha ki uska hit counter zero par hi raha, jabki us IP se jump host tak SSH session agli subah bhi active tha. <code>show conn address 198.51.100.77</code> ne ek TCP connection dikhaya, flags UIO, kuch seconds idle. Session deny se pehle bana tha, isliye fast path par zinda tha. <code>clear conn address 198.51.100.77</code> ne use gira diya, agla SYN deny se takraya, aur syslog 106023 dikha.</p><p><b>Seekh:</b> access lists sirf pehle packet ko judge karti hain. Access revoke karte waqt existing connections bhi clear karo.</p></div>

<div class="iv"><p class="q">"Mujhe batao ASA naye TCP connection ke pehle packet ke saath kya karta hai."</p><p>Order batao: ingress, connection lookup (miss), TCP SYN hona chahiye, statics ke liye UN-NAT (jo egress interface chun sakta hai), route lookup, real addresses par ingress ACL, NAT translate aur xlate, inspection, connection bana, next hop aur ARP, transmit. Phir fayda batao: baad ke packets aur replies connection se match hote hain aur bina ACL ke fast path lete hain. Yeh mention karna ki isi wajah se ACLs real IPs use karti hain, interviewers ko impress karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehla packet: slow path; baad ke packets aur replies: connection table ke through fast path.</li>
<li>Order: ingress, conn lookup, SYN check, UN-NAT, route, ACL, NAT, inspection, conn bana, next hop aur ARP, transmit.</li>
<li>ACL se pehle UN-NAT hi wajah hai ki ACLs real addresses use karti hain.</li>
<li>Existing connections clear hone tak ACL changes ko ignore karte hain.</li>
<li>Ingress captures pre-NAT packets dekhte hain; egress captures translated packets.</li>
</ul></div>
`}};export{e as default};