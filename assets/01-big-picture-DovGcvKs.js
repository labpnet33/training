var e={id:`big-picture`,h:{en:`Why OSPFv3 exists, and the big picture`,hi:`OSPFv3 kyun hai, aur poori picture`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to explain why IPv6 needs its own version of OSPF, list exactly what stays the same and what changes compared with the OSPFv2 you already built, configure OSPFv3 in both the classic style (<code>ipv6 router ospf</code>) and the newer address-family style (<code>router ospfv3</code>), make interfaces passive, advertise a default route, run OSPFv2 and OSPFv3 side by side on a dual-stack network, read every important <code>show</code> command, and troubleshoot an adjacency that refuses to come up.</p>
<p><b>Prerequisites.</b> This module sits right after <b>OSPFv2 single-area</b>. We will not re-teach Hellos, neighbour states, DR/BDR election, LSAs, SPF or cost from scratch; we refer back to them and only explain what is new. You also need the <b>IPv6 addressing</b> module: global unicast versus link-local addresses, EUI-64, <code>ipv6 unicast-routing</code> and IPv6 static routes. If "FE80::/10" and "FF02::1" feel unfamiliar, revise those chapters first.</p>

<h3>An analogy: same courier company, new address format</h3>
<p>Imagine a courier company that has delivered parcels across India for years. Its drivers share road reports at every depot, each depot keeps the same map, and every depot calculates the shortest route by itself. That is OSPFv2: a link-state protocol where every router holds the same map (the LSDB) and runs SPF on it.</p>
<p>Now the government introduces a brand-new PIN code format that is four times longer. The drivers, the depots, the map-sharing habit and the shortest-route calculation all still work. What has to change is the <b>paperwork</b>: the forms that carry addresses must be redesigned for the new format, and drivers start calling each other on a local walkie-talkie channel instead of using the old phone numbers. <b>OSPFv3</b> is that redesign. The engine is the same OSPF you know; the packets and the addressing around it were rebuilt for IPv6.</p>

<h3>Why not just add IPv6 to OSPFv2?</h3>
<p>OSPFv2 (RFC 2328) was written only for IPv4. Its packets contain 32-bit address fields, its Hello carries a subnet mask, and its LSAs mix topology (who is connected to whom) with IPv4 prefixes. A 128-bit IPv6 prefix simply does not fit. Instead of patching every packet, the IETF created <b>OSPF version 3</b> (RFC 5340). Three design ideas drive it:</p>
<ul>
<li><b>Runs per link, not per subnet.</b> Neighbours talk using their <b>link-local</b> addresses, so two routers can become neighbours even if their global prefixes are different.</li>
<li><b>Topology and prefixes are separated.</b> Router and Network LSAs describe only the shape of the network. IPv6 prefixes travel in new LSA types. Changing an address no longer forces a full SPF recalculation.</li>
<li><b>Security is left to IPv6.</b> The authentication fields were removed from the OSPF header; classic OSPFv3 relies on IPsec (AH or ESP) instead.</li>
</ul>

<h3>The lab network you will build</h3>
<p>Throughout this module we use the same topology as the hands-on lab: an <b>IPv6-only</b> network (no IPv4 anywhere) joining a Delhi LAN on R1 to a Mumbai LAN on R3 through R2. All interfaces go into <b>area 0</b> with OSPFv3 <b>process 10</b>, and the router IDs are 1.1.1.1, 2.2.2.2 and 3.3.3.3.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Lab topology R1 R2 R3">
<rect x="40" y="90" width="100" height="46" rx="8" fill="#bae6fd"/><text x="90" y="110" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="90" y="127" text-anchor="middle" class="svg-muted" font-size="12">RID 1.1.1.1</text>
<rect x="270" y="90" width="100" height="46" rx="8" fill="#bae6fd"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="14">R2</text><text x="320" y="127" text-anchor="middle" class="svg-muted" font-size="12">RID 2.2.2.2</text>
<rect x="500" y="90" width="100" height="46" rx="8" fill="#bae6fd"/><text x="550" y="110" text-anchor="middle" class="svg-ink" font-size="14">R3</text><text x="550" y="127" text-anchor="middle" class="svg-muted" font-size="12">RID 3.3.3.3</text>
<line x1="140" y1="113" x2="270" y2="113" stroke="#64748b" stroke-width="2"/>
<line x1="370" y1="113" x2="500" y2="113" stroke="#64748b" stroke-width="2"/>
<text x="205" y="80" text-anchor="middle" class="svg-accent" font-size="12">2001:DB8:ACAD:12::/64</text>
<text x="435" y="80" text-anchor="middle" class="svg-accent" font-size="12">2001:DB8:ACAD:23::/64</text>
<line x1="90" y1="136" x2="90" y2="176" stroke="#64748b" stroke-width="2"/>
<line x1="550" y1="136" x2="550" y2="176" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="176" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="90" y="195" text-anchor="middle" class="svg-ink" font-size="13">Delhi LAN</text><text x="90" y="212" text-anchor="middle" class="svg-muted" font-size="12">2001:DB8:ACAD:1::/64</text>
<rect x="480" y="176" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="550" y="195" text-anchor="middle" class="svg-ink" font-size="13">Mumbai LAN</text><text x="550" y="212" text-anchor="middle" class="svg-muted" font-size="12">2001:DB8:ACAD:3::/64</text>
<text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">OSPFv3 process 10, area 0, IPv6 only</text>
</svg><p class="cap">The module lab: three routers, four IPv6 prefixes, one area, and not a single IPv4 address.</p></div>

<h3>Why this matters in real networks</h3>
<p>Banks, telecom operators, cloud providers and government networks in India are rolling out IPv6 on their cores and campuses. Mobile operators already run huge IPv6-only access networks. Most enterprises do this with <b>dual stack</b>: IPv4 and IPv6 run together on the same links. A static route per IPv6 prefix does not scale beyond a lab, so the IPv6 half needs a dynamic routing protocol, and in OSPF shops that protocol is OSPFv3. When you join a NOC, you will see <code>show ipv6 ospf neighbor</code> next to <code>show ip ospf neighbor</code> on the same router.</p>
<div class="note"><p><b>Exam scope.</b> The CCNA 200-301 blueprint names OSPFv2 single-area explicitly and tests IPv6 addressing and static routing. OSPFv3 builds directly on both and appears in interviews and in CCNP ENCOR and ENARSI, so we teach it to the level a working network engineer needs.</p></div>

<div class="eg"><p><b>Worked example.</b> An office has 4 branch routers and 12 IPv6 LAN prefixes. With static routes, each router needs roughly 12 entries, which is about 48 lines to maintain, and each new VLAN means touching every router. With OSPFv3, each router needs one process, a router ID and one <code>ipv6 ospf 10 area 0</code> line per interface. Adding a new VLAN means one line on one router; OSPFv3 tells the others within seconds.</p></div>

<h3>The road map of this module</h3>
<ol>
<li>What stays the same and what changes (per-link operation, link-local, multicast, IPsec).</li>
<li>The router ID and the new LSA types 8 and 9.</li>
<li>Classic configuration with <code>ipv6 router ospf</code>.</li>
<li>Address-family configuration with <code>router ospfv3</code>.</li>
<li>Passive interfaces and default route origination.</li>
<li>Verification commands and how to read them.</li>
<li>Dual-stack: OSPFv2 and OSPFv3 side by side.</li>
<li>Troubleshooting workflow and exam traps, then the summary.</li>
</ol>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking OSPFv3 is "OSPFv2 with IPv6 addresses typed into network statements". OSPFv3 has <b>no network command at all</b>. You enable it on each interface. Students who try <code>network 2001:db8::/32 area 0</code> get an error and assume the lab is broken.</p></div>
<div class="exam"><p><b>Exam trap.</b> "OSPFv3 only supports IPv6." In the classic form that is true. The newer address-family form of OSPFv3 can carry IPv4 prefixes too, but the packets still travel over IPv6 link-local addresses. Read the question for which configuration style it describes.</p></div>

<div class="scn"><h4>The IPv6 pilot that stayed static</h4><p>A logistics company started an IPv6 pilot with three sites and used static routes because "it is only a pilot". Eight months later there were eleven sites and 60 IPv6 static routes. A new warehouse VLAN was added in Nagpur, and nobody updated two of the routers, so half the company could not reach it over IPv6. Users complained only of "slow apps", because their devices quietly fell back to IPv4. The team replaced the statics with OSPFv3 in area 0, reusing the same router IDs they had for OSPFv2. New VLANs now appear everywhere automatically.</p><p><b>Lesson:</b> if your IPv4 network runs OSPF, your IPv6 network should run OSPFv3 from day one, not after the first outage.</p></div>

<div class="iv"><p class="q">"Why did IPv6 need a new version of OSPF instead of reusing OSPFv2?"</p><p>Strong answer: OSPFv2 packets and LSAs are built around 32-bit IPv4 addresses and masks, so 128-bit prefixes do not fit. OSPFv3 keeps the same link-state engine (Hellos, areas, DR/BDR, SPF, cost) but runs per link over link-local addresses, separates topology from prefix information into new LSA types, and removes built-in authentication in favour of IPsec. Mention that the router ID is still a 32-bit number.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPFv3 (RFC 5340) is OSPF rebuilt for IPv6; the link-state engine is unchanged.</li>
<li>It runs per link using link-local addresses and has no network statements.</li>
<li>Topology and prefixes are carried separately, in different LSA types.</li>
<li>Classic OSPFv3 relies on IPsec for authentication.</li>
<li>The module lab is IPv6-only: R1, R2, R3, process 10, area 0, RIDs 1.1.1.1 to 3.3.3.3.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap samjha paoge ki IPv6 ko OSPF ka apna alag version kyun chahiye, bata paoge ki OSPFv2 (jo aap pehle bana chuke ho) ke comparison mein kya same rehta hai aur kya badalta hai, OSPFv3 ko classic style (<code>ipv6 router ospf</code>) aur naye address-family style (<code>router ospfv3</code>) dono mein configure kar paoge, interfaces ko passive bana paoge, default route advertise kar paoge, dual-stack network par OSPFv2 aur OSPFv3 saath saath chala paoge, har important <code>show</code> command padh paoge, aur jo adjacency up hi nahi ho rahi use troubleshoot kar paoge.</p>
<p><b>Prerequisites.</b> Yeh module <b>OSPFv2 single-area</b> ke theek baad aata hai. Hum Hellos, neighbour states, DR/BDR election, LSAs, SPF ya cost ko zero se dobara nahi padhayenge; unka reference denge aur sirf naya kya hai woh samjhayenge. Aapko <b>IPv6 addressing</b> module bhi aana chahiye: global unicast vs link-local addresses, EUI-64, <code>ipv6 unicast-routing</code> aur IPv6 static routes. Agar "FE80::/10" aur "FF02::1" anjaane lagte hain, to pehle woh chapters revise karo.</p>

<h3>Ek analogy: wahi courier company, naya address format</h3>
<p>Socho ek courier company saalon se poore India mein parcel deliver kar rahi hai. Uske drivers har depot par road reports share karte hain, har depot ke paas same map hota hai, aur har depot khud shortest route calculate karta hai. Yahi OSPFv2 hai: ek link-state protocol jahan har router ke paas same map (LSDB) hota hai aur woh us par SPF chalata hai.</p>
<p>Ab sarkar ek bilkul naya PIN code format laati hai jo chaar guna lamba hai. Drivers, depots, map share karne ki aadat aur shortest route calculation sab ab bhi kaam karte hain. Jo badalna padta hai woh hai <b>paperwork</b>: addresses le jaane wale forms naye format ke liye redesign karne padte hain, aur drivers purane phone numbers ki jagah ek local walkie-talkie channel par baat karne lagte hain. <b>OSPFv3</b> wahi redesign hai. Engine wahi OSPF hai jo aap jaante ho; uske aas paas ke packets aur addressing IPv6 ke liye dobara banaye gaye.</p>

<h3>OSPFv2 mein hi IPv6 kyun nahi jod diya?</h3>
<p>OSPFv2 (RFC 2328) sirf IPv4 ke liye likha gaya tha. Uske packets mein 32-bit address fields hain, uska Hello subnet mask le jaata hai, aur uske LSAs topology (kaun kisse juda hai) ko IPv4 prefixes ke saath mix karte hain. 128-bit IPv6 prefix usmein fit hi nahi hota. Har packet ko patch karne ki jagah IETF ne <b>OSPF version 3</b> (RFC 5340) banaya. Teen design ideas iske peeche hain:</p>
<ul>
<li><b>Per link chalta hai, per subnet nahi.</b> Neighbours apne <b>link-local</b> addresses se baat karte hain, isliye do routers neighbours ban sakte hain chahe unke global prefixes alag hon.</li>
<li><b>Topology aur prefixes alag kar diye gaye.</b> Router aur Network LSAs sirf network ka shape batate hain. IPv6 prefixes naye LSA types mein jaate hain. Address badalne par ab poora SPF recalculation zaroori nahi.</li>
<li><b>Security IPv6 par chhod di gayi.</b> OSPF header se authentication fields hata diye gaye; classic OSPFv3 uski jagah IPsec (AH ya ESP) par depend karta hai.</li>
</ul>

<h3>Lab network jo aap banaoge</h3>
<p>Is poore module mein hum wahi topology use karenge jo hands-on lab mein hai: ek <b>IPv6-only</b> network (kahin bhi IPv4 nahi) jo R1 ke Delhi LAN ko R2 ke through R3 ke Mumbai LAN se jodta hai. Saare interfaces OSPFv3 <b>process 10</b> ke saath <b>area 0</b> mein jaate hain, aur router IDs 1.1.1.1, 2.2.2.2 aur 3.3.3.3 hain.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Lab topology R1 R2 R3">
<rect x="40" y="90" width="100" height="46" rx="8" fill="#bae6fd"/><text x="90" y="110" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="90" y="127" text-anchor="middle" class="svg-muted" font-size="12">RID 1.1.1.1</text>
<rect x="270" y="90" width="100" height="46" rx="8" fill="#bae6fd"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="14">R2</text><text x="320" y="127" text-anchor="middle" class="svg-muted" font-size="12">RID 2.2.2.2</text>
<rect x="500" y="90" width="100" height="46" rx="8" fill="#bae6fd"/><text x="550" y="110" text-anchor="middle" class="svg-ink" font-size="14">R3</text><text x="550" y="127" text-anchor="middle" class="svg-muted" font-size="12">RID 3.3.3.3</text>
<line x1="140" y1="113" x2="270" y2="113" stroke="#64748b" stroke-width="2"/>
<line x1="370" y1="113" x2="500" y2="113" stroke="#64748b" stroke-width="2"/>
<text x="205" y="80" text-anchor="middle" class="svg-accent" font-size="12">2001:DB8:ACAD:12::/64</text>
<text x="435" y="80" text-anchor="middle" class="svg-accent" font-size="12">2001:DB8:ACAD:23::/64</text>
<line x1="90" y1="136" x2="90" y2="176" stroke="#64748b" stroke-width="2"/>
<line x1="550" y1="136" x2="550" y2="176" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="176" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="90" y="195" text-anchor="middle" class="svg-ink" font-size="13">Delhi LAN</text><text x="90" y="212" text-anchor="middle" class="svg-muted" font-size="12">2001:DB8:ACAD:1::/64</text>
<rect x="480" y="176" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="550" y="195" text-anchor="middle" class="svg-ink" font-size="13">Mumbai LAN</text><text x="550" y="212" text-anchor="middle" class="svg-muted" font-size="12">2001:DB8:ACAD:3::/64</text>
<text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">OSPFv3 process 10, area 0, sirf IPv6</text>
</svg><p class="cap">Module lab: teen routers, chaar IPv6 prefixes, ek area, aur ek bhi IPv4 address nahi.</p></div>

<h3>Real networks mein yeh kyun matter karta hai</h3>
<p>India mein banks, telecom operators, cloud providers aur government networks apne cores aur campuses par IPv6 roll out kar rahe hain. Mobile operators pehle se bade IPv6-only access networks chala rahe hain. Zyada tar enterprises yeh <b>dual stack</b> se karte hain: IPv4 aur IPv6 same links par saath chalte hain. Har IPv6 prefix ke liye static route lab se aage scale nahi hota, isliye IPv6 wale hisse ko dynamic routing protocol chahiye, aur OSPF use karne wali companies mein woh protocol OSPFv3 hai. Jab aap NOC join karoge, to same router par <code>show ip ospf neighbor</code> ke saath <code>show ipv6 ospf neighbor</code> bhi dekhoge.</p>
<div class="note"><p><b>Exam scope.</b> CCNA 200-301 blueprint OSPFv2 single-area ka naam saaf leta hai aur IPv6 addressing aur static routing test karta hai. OSPFv3 in dono par seedha bana hai aur interviews mein aur CCNP ENCOR aur ENARSI mein aata hai, isliye hum ise us level tak padhate hain jo ek working network engineer ko chahiye.</p></div>

<div class="eg"><p><b>Worked example.</b> Ek office mein 4 branch routers aur 12 IPv6 LAN prefixes hain. Static routes ke saath har router ko lagbhag 12 entries chahiye, yaani maintain karne ke liye lagbhag 48 lines, aur har naye VLAN ka matlab har router ko chhoona. OSPFv3 ke saath har router ko ek process, ek router ID aur har interface par ek <code>ipv6 ospf 10 area 0</code> line chahiye. Naya VLAN jodne ka matlab ek router par ek line; OSPFv3 baaki sabko seconds mein bata deta hai.</p></div>

<h3>Is module ka road map</h3>
<ol>
<li>Kya same rehta hai aur kya badalta hai (per-link operation, link-local, multicast, IPsec).</li>
<li>Router ID aur naye LSA types 8 aur 9.</li>
<li><code>ipv6 router ospf</code> ke saath classic configuration.</li>
<li><code>router ospfv3</code> ke saath address-family configuration.</li>
<li>Passive interfaces aur default route origination.</li>
<li>Verification commands aur unhe kaise padhein.</li>
<li>Dual-stack: OSPFv2 aur OSPFv3 saath saath.</li>
<li>Troubleshooting workflow aur exam traps, phir summary.</li>
</ol>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh sochna ki OSPFv3 matlab "OSPFv2 jismein network statements mein IPv6 addresses type kar do". OSPFv3 mein <b>network command hai hi nahi</b>. Aap ise har interface par enable karte ho. Jo students <code>network 2001:db8::/32 area 0</code> try karte hain unhe error milta hai aur woh sochte hain ki lab kharab hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "OSPFv3 sirf IPv6 support karta hai." Classic form mein yeh sach hai. OSPFv3 ka naya address-family form IPv4 prefixes bhi le ja sakta hai, lekin packets phir bhi IPv6 link-local addresses par hi travel karte hain. Question padho ki woh kaunsa configuration style describe kar raha hai.</p></div>

<div class="scn"><h4>IPv6 pilot jo static hi reh gaya</h4><p>Ek logistics company ne teen sites ke saath IPv6 pilot shuru kiya aur static routes use kiye kyunki "yeh sirf pilot hai". Aath mahine baad gyarah sites aur 60 IPv6 static routes ho gaye. Nagpur mein ek naya warehouse VLAN joda gaya, aur kisi ne do routers update nahi kiye, isliye aadhi company use IPv6 par reach nahi kar paayi. Users ne sirf "apps slow hain" complain kiya, kyunki unke devices chupchaap IPv4 par fall back kar gaye. Team ne statics ki jagah area 0 mein OSPFv3 lagaya, aur wahi router IDs reuse kiye jo OSPFv2 ke liye the. Ab naye VLANs apne aap har jagah dikh jaate hain.</p><p><b>Seekh:</b> agar aapka IPv4 network OSPF chalata hai, to aapka IPv6 network pehle din se OSPFv3 chalaye, pehle outage ke baad nahi.</p></div>

<div class="iv"><p class="q">"IPv6 ko OSPFv2 reuse karne ki jagah OSPF ka naya version kyun chahiye tha?"</p><p>Strong answer: OSPFv2 ke packets aur LSAs 32-bit IPv4 addresses aur masks ke around bane hain, isliye 128-bit prefixes fit nahi hote. OSPFv3 same link-state engine rakhta hai (Hellos, areas, DR/BDR, SPF, cost) lekin link-local addresses par per link chalta hai, topology ko prefix information se alag karke naye LSA types mein daalta hai, aur built-in authentication hata kar IPsec par depend karta hai. Yeh zaroor bolo ki router ID ab bhi 32-bit number hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPFv3 (RFC 5340) IPv6 ke liye dobara bana OSPF hai; link-state engine same hai.</li>
<li>Yeh link-local addresses use karke per link chalta hai aur isme network statements nahi hote.</li>
<li>Topology aur prefixes alag alag LSA types mein jaate hain.</li>
<li>Classic OSPFv3 authentication ke liye IPsec par depend karta hai.</li>
<li>Module lab IPv6-only hai: R1, R2, R3, process 10, area 0, RIDs 1.1.1.1 se 3.3.3.3.</li>
</ul></div>
`}};export{e as default};