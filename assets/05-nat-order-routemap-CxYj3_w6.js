var e={id:`nat-order-routemap`,h:{en:`NAT at CCNP depth: order of operations, PAT, route-map NAT and NVI`,hi:`CCNP depth par NAT: order of operations, PAT, route-map NAT aur NVI`},body:{en:`
<p>Picture the reception desk of a large office. A courier leaving the building first decides which exit gate to use (routing), and only at the gate is the internal extension number on the parcel replaced by the office's public address (translation). A courier coming in has the public address replaced by the internal extension first, and only then is it sent to the right floor. The order matters: the guard at the outer gate only ever sees the public address. That is the heart of NAT at CCNP level: <b>when</b> the router translates relative to routing and ACLs.</p>

<h3>Quick recap of the terms and types</h3>
<p>From CCNA NAT you know the four addresses: <b>inside local</b> (the private host, 192.168.20.10), <b>inside global</b> (what the world sees for it, 203.0.113.10), <b>outside global</b> (the remote host's real address) and <b>outside local</b> (how the remote host appears inside; usually the same as outside global unless you translate outside addresses too). The three flavours:</p>
<pre class="code"><span class="c">! Static NAT and static PAT (port forwarding)</span>
ip nat inside source static 192.168.20.50 203.0.113.10
ip nat inside source static tcp 192.168.20.60 443 203.0.113.11 443
<span class="c">! Dynamic NAT from a pool</span>
ip nat pool NK-POOL 203.0.113.16 203.0.113.30 prefix-length 28
ip nat inside source list 10 pool NK-POOL
<span class="c">! PAT on the outside interface</span>
access-list 10 permit 192.168.20.0 0.0.0.255
ip nat inside source list 10 interface GigabitEthernet0/1 overload
interface GigabitEthernet0/0
 ip nat inside
interface GigabitEthernet0/1
 ip nat outside</pre>
<p>PAT keeps each flow unique by source port: about 64,000 usable ports per global address per protocol. When a port is already used, IOS picks another from the same range. Dynamic entries time out after 24 hours by default; PAT entries time out much faster (for example 5 minutes for UDP, 1 minute after a TCP close).</p>

<h3>Order of operations</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="NAT order of operations">
<text x="20" y="30" class="svg-ink" font-size="13">Inside to outside</text>
<rect x="20" y="42" width="110" height="36" rx="6" fill="#e2e8f0"/><text x="75" y="65" text-anchor="middle" class="svg-ink" font-size="12">inbound ACL</text>
<rect x="150" y="42" width="110" height="36" rx="6" fill="#e2e8f0"/><text x="205" y="65" text-anchor="middle" class="svg-ink" font-size="12">PBR, routing</text>
<rect x="280" y="42" width="110" height="36" rx="6" fill="#fde68a"/><text x="335" y="65" text-anchor="middle" class="svg-ink" font-size="12">NAT in to out</text>
<rect x="410" y="42" width="110" height="36" rx="6" fill="#e2e8f0"/><text x="465" y="65" text-anchor="middle" class="svg-ink" font-size="12">crypto, out ACL</text>
<line x1="130" y1="60" x2="150" y2="60" stroke="#64748b" stroke-width="2"/><line x1="260" y1="60" x2="280" y2="60" stroke="#64748b" stroke-width="2"/><line x1="390" y1="60" x2="410" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="20" y="130" class="svg-ink" font-size="13">Outside to inside</text>
<rect x="20" y="142" width="110" height="36" rx="6" fill="#e2e8f0"/><text x="75" y="165" text-anchor="middle" class="svg-ink" font-size="12">decrypt, in ACL</text>
<rect x="150" y="142" width="110" height="36" rx="6" fill="#fde68a"/><text x="205" y="165" text-anchor="middle" class="svg-ink" font-size="12">NAT out to in</text>
<rect x="280" y="142" width="110" height="36" rx="6" fill="#e2e8f0"/><text x="335" y="165" text-anchor="middle" class="svg-ink" font-size="12">PBR, routing</text>
<rect x="410" y="142" width="110" height="36" rx="6" fill="#e2e8f0"/><text x="465" y="165" text-anchor="middle" class="svg-ink" font-size="12">out ACL</text>
<line x1="130" y1="160" x2="150" y2="160" stroke="#64748b" stroke-width="2"/><line x1="260" y1="160" x2="280" y2="160" stroke="#64748b" stroke-width="2"/><line x1="390" y1="160" x2="410" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="580" y="65" text-anchor="middle" class="svg-accent" font-size="12">route first</text><text x="580" y="165" text-anchor="middle" class="svg-accent" font-size="12">NAT first</text>
</svg><p class="cap">Inside to outside: route, then translate. Outside to inside: translate, then route.</p></div>
<p>The consequences are what exam questions test:</p>
<ul>
<li>An ACL <b>inbound on the inside interface</b> sees inside local addresses (192.168.20.10).</li>
<li>An ACL on the <b>outside interface</b>, in either direction, sees inside global addresses (203.0.113.x), because translation already happened outbound and has not yet happened inbound.</li>
<li>The router needs a route for the <b>destination before translation</b> on the way out, and for the <b>inside local</b> address on the way in (the reply is translated first, then routed).</li>
<li>IPsec crypto maps match traffic <b>after</b> NAT outbound, so traffic you want in a VPN must be excluded from NAT (a deny line in the NAT ACL or a route-map), or it will be translated and miss the crypto ACL.</li>
</ul>

<h3>Route-map NAT</h3>
<p>An ACL can only say "these sources". A <b>route-map</b> can say "these sources <i>when leaving through this interface</i>" or "these sources going to these destinations". This is essential for dual-ISP edges:</p>
<pre class="code">route-map NAT-ISPA permit 10
 match ip address 10
 match interface GigabitEthernet0/1
route-map NAT-ISPB permit 10
 match ip address 10
 match interface GigabitEthernet0/2
!
ip nat inside source route-map NAT-ISPA interface GigabitEthernet0/1 overload
ip nat inside source route-map NAT-ISPB interface GigabitEthernet0/2 overload</pre>
<p>Each flow is translated to the address of the ISP it actually leaves through. Translations created by a route-map are <b>fully extended</b> (they include the outside address), so the same host can have one translation per ISP at the same time. Route-maps are also the clean way to exempt VPN traffic: <code>deny</code> the VPN destinations in the ACL the route-map matches.</p>

<h3>NAT Virtual Interface (NVI)</h3>
<p>Classic NAT depends on the inside/outside roles. <b>NVI</b> removes them: you configure <code>ip nat enable</code> on every interface that takes part, and write rules without the inside/outside keyword, for example <code>ip nat source static 10.1.1.10 172.16.1.10</code>. Traffic that needs translation is routed to an internal interface called NVI0, translated, and routed again. This makes <b>hairpin NAT</b> (inside host reaching another inside host by its public address) and NAT between VRFs straightforward. The cost is an extra routing lookup, and NVI is not supported on many IOS XE platforms such as ASR 1000 or Catalyst 8000, so know the concept and check the platform before designing with it. Verify with <code>show ip nat nvi translations</code>.</p>

<div class="eg"><p><b>Worked example.</b> PC1 192.168.20.10 browses to 198.51.100.10 through R1 with PAT on Gi0/1 (address 203.0.113.2). An outbound ACL on Gi0/1 permits only <code>host 192.168.20.10</code>. Result: the traffic is dropped, because by the time the outbound ACL runs, the source is 203.0.113.2. Rewriting the ACL to match 203.0.113.2, or moving it inbound on Gi0/0, fixes it.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using one ACL-based overload rule on a dual-ISP router. Flows that leave through ISP-B keep ISP-A's address and are dropped by ISP-B's anti-spoofing filters. Use route-map NAT with <code>match interface</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which address does an ACL applied inbound on the outside interface need to permit for return traffic to a statically NATed server?" The inside global (public) address, because outside-to-inside translation happens after the inbound ACL.</p></div>

<div class="scn"><h4>The VPN that only worked one way</h4><p>A branch built a site-to-site IPsec tunnel to HQ. HQ could reach branch servers, but branch users could not reach HQ. The branch router had <code>ip nat inside source list 10 interface Gi0/1 overload</code> with ACL 10 permitting all of 192.168.20.0/24. Outbound branch traffic was translated to the public address first and no longer matched the crypto ACL (192.168.20.0/24 to 10.0.0.0/8), so it went to the internet in clear and died. Adding <code>deny ip 192.168.20.0 0.0.0.255 10.0.0.0 0.255.255.255</code> before the permit in the NAT ACL fixed it.</p><p><b>Lesson:</b> outbound, NAT happens before crypto; exempt VPN traffic from NAT.</p></div>

<div class="iv"><p class="q">"Explain the NAT order of operations and why it matters."</p><p>Inside to outside: the router routes first, then translates, then applies crypto and outbound ACLs. Outside to inside: inbound ACL, then translation, then routing. So outside-interface ACLs and crypto ACLs see global addresses, inside inbound ACLs see local addresses, and return traffic is routed using the inside local address. Give a VPN NAT-exemption example; that is what a strong candidate mentions.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inside to outside: route then translate; outside to inside: translate then route.</li>
<li>ACLs on the outside interface and crypto ACLs see inside global addresses.</li>
<li>Route-map NAT with match interface is the standard for dual-ISP edges and creates fully extended entries.</li>
<li>Exempt VPN traffic from NAT with deny lines or a route-map.</li>
<li>NVI (ip nat enable) removes inside/outside roles; useful for hairpin and inter-VRF NAT, but not supported on many IOS XE platforms.</li>
</ul></div>
`,hi:`
<p>Ek bade office ka reception desk socho. Building se bahar jaata courier pehle tay karta hai ki kaunse exit gate se jaana hai (routing), aur sirf gate par parcel ka internal extension number office ke public address se badla jaata hai (translation). Andar aate courier ka public address pehle internal extension se badla jaata hai, aur tabhi use sahi floor par bheja jaata hai. Order matter karta hai: bahari gate ka guard hamesha sirf public address dekhta hai. Yahi CCNP level par NAT ka dil hai: router routing aur ACLs ke comparison mein <b>kab</b> translate karta hai.</p>

<h3>Terms aur types ka quick recap</h3>
<p>CCNA NAT se aapko chaar addresses pata hain: <b>inside local</b> (private host, 192.168.20.10), <b>inside global</b> (duniya use kya dekhti hai, 203.0.113.10), <b>outside global</b> (remote host ka asli address) aur <b>outside local</b> (remote host andar kaisa dikhta hai; aam taur par outside global jaisa hi, jab tak aap outside addresses bhi translate na karo). Teen flavours:</p>
<pre class="code"><span class="c">! Static NAT aur static PAT (port forwarding)</span>
ip nat inside source static 192.168.20.50 203.0.113.10
ip nat inside source static tcp 192.168.20.60 443 203.0.113.11 443
<span class="c">! Pool se dynamic NAT</span>
ip nat pool NK-POOL 203.0.113.16 203.0.113.30 prefix-length 28
ip nat inside source list 10 pool NK-POOL
<span class="c">! Outside interface par PAT</span>
access-list 10 permit 192.168.20.0 0.0.0.255
ip nat inside source list 10 interface GigabitEthernet0/1 overload
interface GigabitEthernet0/0
 ip nat inside
interface GigabitEthernet0/1
 ip nat outside</pre>
<p>PAT har flow ko source port se unique rakhta hai: har global address par har protocol ke liye lagbhag 64,000 usable ports. Port pehle se use mein ho to IOS same range se doosra chunta hai. Dynamic entries default mein 24 ghante baad time out hoti hain; PAT entries bahut jaldi (jaise UDP ke liye 5 minute, TCP close ke 1 minute baad).</p>

<h3>Order of operations</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="NAT order of operations">
<text x="20" y="30" class="svg-ink" font-size="13">Inside se outside</text>
<rect x="20" y="42" width="110" height="36" rx="6" fill="#e2e8f0"/><text x="75" y="65" text-anchor="middle" class="svg-ink" font-size="12">inbound ACL</text>
<rect x="150" y="42" width="110" height="36" rx="6" fill="#e2e8f0"/><text x="205" y="65" text-anchor="middle" class="svg-ink" font-size="12">PBR, routing</text>
<rect x="280" y="42" width="110" height="36" rx="6" fill="#fde68a"/><text x="335" y="65" text-anchor="middle" class="svg-ink" font-size="12">NAT in se out</text>
<rect x="410" y="42" width="110" height="36" rx="6" fill="#e2e8f0"/><text x="465" y="65" text-anchor="middle" class="svg-ink" font-size="12">crypto, out ACL</text>
<line x1="130" y1="60" x2="150" y2="60" stroke="#64748b" stroke-width="2"/><line x1="260" y1="60" x2="280" y2="60" stroke="#64748b" stroke-width="2"/><line x1="390" y1="60" x2="410" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="20" y="130" class="svg-ink" font-size="13">Outside se inside</text>
<rect x="20" y="142" width="110" height="36" rx="6" fill="#e2e8f0"/><text x="75" y="165" text-anchor="middle" class="svg-ink" font-size="12">decrypt, in ACL</text>
<rect x="150" y="142" width="110" height="36" rx="6" fill="#fde68a"/><text x="205" y="165" text-anchor="middle" class="svg-ink" font-size="12">NAT out se in</text>
<rect x="280" y="142" width="110" height="36" rx="6" fill="#e2e8f0"/><text x="335" y="165" text-anchor="middle" class="svg-ink" font-size="12">PBR, routing</text>
<rect x="410" y="142" width="110" height="36" rx="6" fill="#e2e8f0"/><text x="465" y="165" text-anchor="middle" class="svg-ink" font-size="12">out ACL</text>
<line x1="130" y1="160" x2="150" y2="160" stroke="#64748b" stroke-width="2"/><line x1="260" y1="160" x2="280" y2="160" stroke="#64748b" stroke-width="2"/><line x1="390" y1="160" x2="410" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="580" y="65" text-anchor="middle" class="svg-accent" font-size="12">pehle route</text><text x="580" y="165" text-anchor="middle" class="svg-accent" font-size="12">pehle NAT</text>
</svg><p class="cap">Inside se outside: route, phir translate. Outside se inside: translate, phir route.</p></div>
<p>Exam questions inke nateeje test karte hain:</p>
<ul>
<li><b>Inside interface par inbound</b> ACL inside local addresses (192.168.20.10) dekhta hai.</li>
<li><b>Outside interface</b> ka ACL, kisi bhi direction mein, inside global addresses (203.0.113.x) dekhta hai, kyunki outbound mein translation ho chuka hai aur inbound mein abhi hua nahi.</li>
<li>Router ko bahar jaate waqt <b>translation se pehle ke destination</b> ka route chahiye, aur andar aate waqt <b>inside local</b> address ka (reply pehle translate hota hai, phir route).</li>
<li>IPsec crypto maps outbound mein NAT ke <b>baad</b> traffic match karte hain, to jo traffic VPN mein chahiye use NAT se exclude karna padega (NAT ACL mein deny line ya route-map), warna woh translate hokar crypto ACL miss kar dega.</li>
</ul>

<h3>Route-map NAT</h3>
<p>ACL sirf keh sakta hai "yeh sources". <b>Route-map</b> keh sakta hai "yeh sources <i>jab is interface se nikal rahe hon</i>" ya "yeh sources in destinations ki taraf". Dual-ISP edges ke liye yeh zaroori hai:</p>
<pre class="code">route-map NAT-ISPA permit 10
 match ip address 10
 match interface GigabitEthernet0/1
route-map NAT-ISPB permit 10
 match ip address 10
 match interface GigabitEthernet0/2
!
ip nat inside source route-map NAT-ISPA interface GigabitEthernet0/1 overload
ip nat inside source route-map NAT-ISPB interface GigabitEthernet0/2 overload</pre>
<p>Har flow us ISP ke address mein translate hota hai jisse woh asal mein nikalta hai. Route-map se bani translations <b>fully extended</b> hoti hain (unmein outside address bhi hota hai), to same host ki ek hi samay mein har ISP ke liye ek translation ho sakti hai. VPN traffic ko exempt karne ka saaf tareeka bhi route-maps hain: jo ACL route-map match karta hai usmein VPN destinations ko <code>deny</code> karo.</p>

<h3>NAT Virtual Interface (NVI)</h3>
<p>Classic NAT inside/outside roles par depend karta hai. <b>NVI</b> unhe hata deta hai: aap har participating interface par <code>ip nat enable</code> configure karte ho, aur rules inside/outside keyword ke bina likhte ho, jaise <code>ip nat source static 10.1.1.10 172.16.1.10</code>. Jis traffic ko translation chahiye woh NVI0 naam ke internal interface par route hota hai, translate hota hai, aur dobara route hota hai. Isse <b>hairpin NAT</b> (inside host ka doosre inside host tak uske public address se pahunchna) aur VRFs ke beech NAT aasaan ho jaata hai. Keemat hai ek extra routing lookup, aur NVI kai IOS XE platforms jaise ASR 1000 ya Catalyst 8000 par supported nahi hai, to concept jaano aur design karne se pehle platform check karo. <code>show ip nat nvi translations</code> se verify karo.</p>

<div class="eg"><p><b>Worked example.</b> PC1 192.168.20.10 R1 ke through 198.51.100.10 browse karta hai, Gi0/1 (address 203.0.113.2) par PAT ke saath. Gi0/1 par outbound ACL sirf <code>host 192.168.20.10</code> permit karta hai. Nateeja: traffic drop hota hai, kyunki outbound ACL chalne tak source 203.0.113.2 ho chuka hai. ACL ko 203.0.113.2 match karne ke liye dobara likhna, ya use Gi0/0 par inbound le jaana, ise theek karta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Dual-ISP router par ek ACL-based overload rule use karna. Jo flows ISP-B se nikalte hain woh ISP-A ka address rakhte hain aur ISP-B ke anti-spoofing filters unhe drop kar dete hain. <code>match interface</code> ke saath route-map NAT use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Statically NATed server ke return traffic ke liye outside interface par inbound lage ACL ko kaunsa address permit karna hoga?" Inside global (public) address, kyunki outside-to-inside translation inbound ACL ke baad hota hai.</p></div>

<div class="scn"><h4>VPN jo sirf ek taraf chalta tha</h4><p>Ek branch ne HQ tak site-to-site IPsec tunnel banaya. HQ branch servers tak pahunch sakta tha, lekin branch users HQ tak nahi. Branch router par <code>ip nat inside source list 10 interface Gi0/1 overload</code> tha aur ACL 10 poora 192.168.20.0/24 permit karta tha. Outbound branch traffic pehle public address mein translate hota aur crypto ACL (192.168.20.0/24 se 10.0.0.0/8) match nahi karta, to woh clear mein internet par jaakar mar jaata. NAT ACL mein permit se pehle <code>deny ip 192.168.20.0 0.0.0.255 10.0.0.0 0.255.255.255</code> jodne se theek hua.</p><p><b>Seekh:</b> outbound mein NAT crypto se pehle hota hai; VPN traffic ko NAT se exempt karo.</p></div>

<div class="iv"><p class="q">"NAT order of operations samjhao aur yeh kyun matter karta hai."</p><p>Inside se outside: router pehle route karta hai, phir translate, phir crypto aur outbound ACLs lagaata hai. Outside se inside: inbound ACL, phir translation, phir routing. To outside-interface ACLs aur crypto ACLs global addresses dekhte hain, inside inbound ACLs local addresses dekhte hain, aur return traffic inside local address se route hota hai. VPN NAT-exemption ka example do; strong candidate yahi batata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inside se outside: route phir translate; outside se inside: translate phir route.</li>
<li>Outside interface ke ACLs aur crypto ACLs inside global addresses dekhte hain.</li>
<li>match interface ke saath route-map NAT dual-ISP edges ka standard hai aur fully extended entries banata hai.</li>
<li>VPN traffic ko deny lines ya route-map se NAT se exempt karo.</li>
<li>NVI (ip nat enable) inside/outside roles hata deta hai; hairpin aur inter-VRF NAT ke liye useful, lekin kai IOS XE platforms par supported nahi.</li>
</ul></div>
`}};export{e as default};