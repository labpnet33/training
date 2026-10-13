var e={id:`internet-structure`,h:{en:`Autonomous systems, AS numbers, registries, transit and peering`,hi:`Autonomous systems, AS numbers, registries, transit aur peering`},body:{en:`
<p>Every house in a city has a postal address, and every city has a PIN code, so that a letter posted anywhere can be sorted towards the right place. On the internet, IP prefixes are the house addresses and the <b>AS number</b> is the PIN code of the organisation that announces them. Before we configure anything, you need to understand who hands out these numbers and how ASes connect to each other commercially, because that commerce is exactly what BGP policy expresses.</p>

<h3>What exactly is an autonomous system?</h3>
<p>An <b>autonomous system (AS)</b> is a set of IP prefixes and routers under one technical administration that presents <b>one consistent routing policy</b> to the outside world. An ISP is an AS. A large enterprise with its own provider-independent address space is an AS. A cloud provider is an AS. Inside an AS you may run OSPF, IS-IS or EIGRP, several of them even, but outside you look like one entity.</p>

<h3>AS numbers: 2-byte and 4-byte</h3>
<p>The original BGP-4 carried the AS number in a <b>16-bit (2-byte)</b> field, giving 0 to 65535. That pool ran out, so <b>4-byte (32-bit) ASNs</b> were added, giving 0 to 4,294,967,295. Modern IOS XE supports them by default.</p>
<table class="cmp"><tr><th>Range</th><th>Use</th></tr>
<tr><td>0</td><td>Reserved, never used</td></tr>
<tr><td>1 to 64495</td><td>Public 2-byte ASNs, assigned by registries</td></tr>
<tr><td>23456</td><td><b>AS_TRANS</b>: placeholder a 4-byte speaker shows to an old 2-byte-only peer</td></tr>
<tr><td>64496 to 64511</td><td>Documentation and examples (like 192.0.2.0/24 for IPs)</td></tr>
<tr><td>64512 to 65534</td><td><b>Private 2-byte</b> ASNs, like RFC 1918 addresses</td></tr>
<tr><td>65535</td><td>Reserved</td></tr>
<tr><td>65536 to 4199999999</td><td>Public 4-byte ASNs (65536 to 65551 are for documentation)</td></tr>
<tr><td>4200000000 to 4294967294</td><td><b>Private 4-byte</b> ASNs</td></tr>
</table>
<p>A 4-byte ASN can be written in two notations. <b>asplain</b> is a plain decimal number, for example <code>65546</code>. <b>asdot</b> splits it into high and low 16-bit halves, so 65546 becomes <code>1.10</code> (1 x 65536 + 10). IOS shows asplain by default; <code>bgp asnotation dot</code> switches the display.</p>
<p>Look at our labs: the ISP Skyline Net uses <b>AS 64500</b>, which sits in the documentation range, and every other AS (65010, 65101 to 65104) is <b>private</b>. That is exactly how labs and training material should be built. In the real world, a private ASN used towards an ISP is removed by the ISP before the route reaches the internet (with a command such as <code>neighbor ... remove-private-as</code>), and the customer prefix appears to originate from the ISP's public AS.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Number registry hierarchy">
<rect x="250" y="10" width="140" height="40" rx="8" fill="#fde68a"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">IANA</text>
<rect x="10" y="90" width="110" height="40" rx="8" fill="#bae6fd"/><text x="65" y="115" text-anchor="middle" class="svg-ink" font-size="13">AFRINIC</text>
<rect x="135" y="90" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="190" y="115" text-anchor="middle" class="svg-ink" font-size="13">APNIC</text>
<rect x="260" y="90" width="110" height="40" rx="8" fill="#bae6fd"/><text x="315" y="115" text-anchor="middle" class="svg-ink" font-size="13">ARIN</text>
<rect x="385" y="90" width="110" height="40" rx="8" fill="#bae6fd"/><text x="440" y="115" text-anchor="middle" class="svg-ink" font-size="13">LACNIC</text>
<rect x="510" y="90" width="120" height="40" rx="8" fill="#bae6fd"/><text x="570" y="115" text-anchor="middle" class="svg-ink" font-size="13">RIPE NCC</text>
<line x1="320" y1="50" x2="65" y2="90" stroke="#64748b"/><line x1="320" y1="50" x2="190" y2="90" stroke="#64748b"/><line x1="320" y1="50" x2="315" y2="90" stroke="#64748b"/><line x1="320" y1="50" x2="440" y2="90" stroke="#64748b"/><line x1="320" y1="50" x2="570" y2="90" stroke="#64748b"/>
<rect x="100" y="160" width="180" height="40" rx="8" fill="#ddd6fe"/><text x="190" y="185" text-anchor="middle" class="svg-ink" font-size="12">NIRs, e.g. IRINN (India)</text>
<line x1="190" y1="130" x2="190" y2="160" stroke="#64748b"/>
<rect x="340" y="160" width="220" height="40" rx="8" fill="#e2e8f0"/><text x="450" y="185" text-anchor="middle" class="svg-ink" font-size="12">ISPs and organisations (LIRs)</text>
<line x1="280" y1="180" x2="340" y2="180" stroke="#64748b"/>
</svg><p class="cap">IANA hands blocks of ASNs and IP addresses to five regional registries, which assign them onwards.</p></div>

<h3>Who hands out the numbers: IANA and the RIRs</h3>
<p><b>IANA</b> manages the global pools and delegates blocks to five <b>Regional Internet Registries (RIRs)</b>: <b>AFRINIC</b> (Africa), <b>APNIC</b> (Asia-Pacific, including India), <b>ARIN</b> (North America), <b>LACNIC</b> (Latin America and the Caribbean) and <b>RIPE NCC</b> (Europe, the Middle East and Central Asia). Some countries also have a <b>National Internet Registry (NIR)</b> under their RIR; in India that is IRINN under APNIC. An organisation normally needs a public ASN only when it connects to <b>two or more</b> providers with its own policy (multihoming). A company with one ISP usually uses a private ASN or just a static default route.</p>

<h3>How ASes connect: transit and peering</h3>
<p>Two business relationships explain most of the internet:</p>
<dl class="terms">
<dt>Transit</dt><dd>A customer pays a provider to reach <b>the whole internet</b>. The provider announces the customer's prefixes to everyone and sends the customer either a full table or a default route. Kaveri Textiles buys transit from Skyline Net.</dd>
<dt>Peering</dt><dd>Two networks of similar size exchange traffic <b>only for their own customers</b>, usually free of charge (settlement-free). Peering often happens at an <b>Internet Exchange Point (IXP)</b>, a shared switch fabric where many ASes meet.</dd>
<dt>Transit AS</dt><dd>Any AS that carries traffic between two other ASes. In lab 2, AS 65102 and AS 65103 are transit ASes for the campus and data centre.</dd>
<dt>Stub AS</dt><dd>An AS that only originates or receives traffic for itself, like the campus AS 65101 or Kaveri Textiles.</dd>
</dl>
<p>Connectivity designs also have names you will hear: <b>single-homed</b> (one link to one ISP), <b>dual-homed</b> (two links to the same ISP) and <b>multihomed</b> (links to two or more ISPs). Only multihoming really needs your own public ASN and full BGP policy.</p>

<div class="eg"><p><b>Worked example.</b> A 4-byte ASN is shown in asdot as <code>3.100</code>. In asplain it is 3 x 65536 + 100 = <b>196708</b>. Another customer uses ASN <b>4200000010</b>: that is in 4200000000 to 4294967294, so it is private and must never appear on the public internet. An old router that only understands 2-byte ASNs would see a 4-byte peer as <b>AS 23456</b> in its AS_PATH.</p></div>

<div class="warn"><p><b>Common mistake.</b> Leaking private ASNs to the internet. If your enterprise uses AS 65010 towards a provider that forgets to strip it, other networks may drop your route or show a confusing path. Also, do not pick 64500 for a production network just because a lab uses it: it is a documentation number.</p></div>

<div class="exam"><p><b>Exam trap.</b> The private 2-byte range is <b>64512 to 65534</b>, not 64512 to 65535 (65535 is reserved). And AD for eBGP is <b>20</b>, for iBGP <b>200</b>; ASN type (public or private) does not change AD.</p></div>

<div class="scn"><h4>The ISP that would not accept a 4-byte ASN</h4><p>A growing company received a new 4-byte ASN from its registry. The session to its secondary ISP came up, but the ISP's old core routers showed the path as <code>23456</code> and a strict filter on the ISP side, written for the company's expected ASN, rejected the routes. The ISP updated its filter to use the 4-byte ASN and confirmed that its newer border routers supported 4-byte ASNs natively.</p><p><b>Lesson:</b> AS 23456 in a path means a 2-byte-only speaker somewhere in the chain; check 4-byte support on every router and filter.</p></div>

<div class="iv"><p class="q">"What is the difference between transit and peering?"</p><p>Strong answer: transit is a paid service where the provider carries your traffic to and from the entire internet; peering is usually a settlement-free exchange where two ASes reach only each other's customers, often at an IXP. Add that a stub AS only originates its own prefixes, while a transit AS carries third-party traffic, and that you must filter outbound so that an enterprise never becomes accidental transit between its two ISPs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An AS is one administration with one routing policy; its identity is the ASN.</li>
<li>Private ASNs: 64512 to 65534 (2-byte) and 4200000000 to 4294967294 (4-byte). 64496 to 64511 are for documentation.</li>
<li>4-byte ASNs appear as asplain (196708) or asdot (3.100); AS 23456 (AS_TRANS) stands in for them towards old peers.</li>
<li>IANA delegates to five RIRs: AFRINIC, APNIC, ARIN, LACNIC, RIPE NCC.</li>
<li>Transit = paid access to everything; peering = mutual exchange of customer routes.</li>
</ul></div>
`,hi:`
<p>Shehar ke har ghar ka postal address hota hai, aur har shehar ka PIN code, taaki kahin se bhi post kiya gaya letter sahi jagah ki taraf sort ho sake. Internet par IP prefixes ghar ke address hain aur <b>AS number</b> us organisation ka PIN code hai jo unhe announce karti hai. Kuch bhi configure karne se pehle aapko samajhna hoga ki yeh numbers kaun deta hai aur ASes commercially ek doosre se kaise judte hain, kyunki wahi commerce BGP policy express karti hai.</p>

<h3>Autonomous system aakhir hai kya?</h3>
<p><b>Autonomous system (AS)</b> ek technical administration ke neeche IP prefixes aur routers ka set hai jo bahar ki duniya ko <b>ek consistent routing policy</b> dikhata hai. ISP ek AS hai. Apne provider-independent address space wali badi enterprise ek AS hai. Cloud provider ek AS hai. AS ke andar aap OSPF, IS-IS ya EIGRP chala sakte ho, kai ek saath bhi, par bahar aap ek entity dikhte ho.</p>

<h3>AS numbers: 2-byte aur 4-byte</h3>
<p>Original BGP-4 AS number ko <b>16-bit (2-byte)</b> field mein le jaata tha, yaani 0 se 65535. Woh pool khatam ho gaya, isliye <b>4-byte (32-bit) ASNs</b> jode gaye, yaani 0 se 4,294,967,295. Modern IOS XE inhe default mein support karta hai.</p>
<table class="cmp"><tr><th>Range</th><th>Use</th></tr>
<tr><td>0</td><td>Reserved, kabhi use nahi hota</td></tr>
<tr><td>1 se 64495</td><td>Public 2-byte ASNs, registries assign karti hain</td></tr>
<tr><td>23456</td><td><b>AS_TRANS</b>: placeholder jo 4-byte speaker purane 2-byte-only peer ko dikhata hai</td></tr>
<tr><td>64496 se 64511</td><td>Documentation aur examples (IPs ke liye 192.0.2.0/24 jaisa)</td></tr>
<tr><td>64512 se 65534</td><td><b>Private 2-byte</b> ASNs, RFC 1918 addresses jaise</td></tr>
<tr><td>65535</td><td>Reserved</td></tr>
<tr><td>65536 se 4199999999</td><td>Public 4-byte ASNs (65536 se 65551 documentation ke liye)</td></tr>
<tr><td>4200000000 se 4294967294</td><td><b>Private 4-byte</b> ASNs</td></tr>
</table>
<p>4-byte ASN do notations mein likha ja sakta hai. <b>asplain</b> ek simple decimal number hai, jaise <code>65546</code>. <b>asdot</b> ise high aur low 16-bit hisson mein todta hai, to 65546 ban jaata hai <code>1.10</code> (1 x 65536 + 10). IOS default mein asplain dikhata hai; <code>bgp asnotation dot</code> display badal deta hai.</p>
<p>Hamari labs dekho: ISP Skyline Net <b>AS 64500</b> use karta hai, jo documentation range mein hai, aur baaki har AS (65010, 65101 se 65104) <b>private</b> hai. Labs aur training material bilkul aise hi banne chahiye. Real world mein, ISP ki taraf use kiya gaya private ASN route ke internet tak pahunchne se pehle ISP hata deta hai (<code>neighbor ... remove-private-as</code> jaise command se), aur customer prefix ISP ke public AS se originate hota dikhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Number registry hierarchy">
<rect x="250" y="10" width="140" height="40" rx="8" fill="#fde68a"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">IANA</text>
<rect x="10" y="90" width="110" height="40" rx="8" fill="#bae6fd"/><text x="65" y="115" text-anchor="middle" class="svg-ink" font-size="13">AFRINIC</text>
<rect x="135" y="90" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="190" y="115" text-anchor="middle" class="svg-ink" font-size="13">APNIC</text>
<rect x="260" y="90" width="110" height="40" rx="8" fill="#bae6fd"/><text x="315" y="115" text-anchor="middle" class="svg-ink" font-size="13">ARIN</text>
<rect x="385" y="90" width="110" height="40" rx="8" fill="#bae6fd"/><text x="440" y="115" text-anchor="middle" class="svg-ink" font-size="13">LACNIC</text>
<rect x="510" y="90" width="120" height="40" rx="8" fill="#bae6fd"/><text x="570" y="115" text-anchor="middle" class="svg-ink" font-size="13">RIPE NCC</text>
<line x1="320" y1="50" x2="65" y2="90" stroke="#64748b"/><line x1="320" y1="50" x2="190" y2="90" stroke="#64748b"/><line x1="320" y1="50" x2="315" y2="90" stroke="#64748b"/><line x1="320" y1="50" x2="440" y2="90" stroke="#64748b"/><line x1="320" y1="50" x2="570" y2="90" stroke="#64748b"/>
<rect x="100" y="160" width="180" height="40" rx="8" fill="#ddd6fe"/><text x="190" y="185" text-anchor="middle" class="svg-ink" font-size="12">NIRs, jaise IRINN (India)</text>
<line x1="190" y1="130" x2="190" y2="160" stroke="#64748b"/>
<rect x="340" y="160" width="220" height="40" rx="8" fill="#e2e8f0"/><text x="450" y="185" text-anchor="middle" class="svg-ink" font-size="12">ISPs aur organisations (LIRs)</text>
<line x1="280" y1="180" x2="340" y2="180" stroke="#64748b"/>
</svg><p class="cap">IANA ASNs aur IP addresses ke blocks paanch regional registries ko deta hai, jo unhe aage assign karti hain.</p></div>

<h3>Numbers kaun deta hai: IANA aur RIRs</h3>
<p><b>IANA</b> global pools manage karta hai aur blocks paanch <b>Regional Internet Registries (RIRs)</b> ko delegate karta hai: <b>AFRINIC</b> (Africa), <b>APNIC</b> (Asia-Pacific, India samet), <b>ARIN</b> (North America), <b>LACNIC</b> (Latin America aur Caribbean) aur <b>RIPE NCC</b> (Europe, Middle East aur Central Asia). Kuch deshon mein RIR ke neeche <b>National Internet Registry (NIR)</b> bhi hoti hai; India mein woh APNIC ke neeche IRINN hai. Organisation ko public ASN normally tabhi chahiye jab woh apni policy ke saath <b>do ya zyada</b> providers se jude (multihoming). Ek ISP wali company aam taur par private ASN ya sirf static default route use karti hai.</p>

<h3>ASes kaise judte hain: transit aur peering</h3>
<p>Do business relationships internet ka zyada tar hissa samjha deti hain:</p>
<dl class="terms">
<dt>Transit</dt><dd>Customer provider ko <b>poore internet</b> tak pahunchne ke paise deta hai. Provider customer ke prefixes sabko announce karta hai aur customer ko full table ya default route bhejta hai. Kaveri Textiles Skyline Net se transit khareedti hai.</dd>
<dt>Peering</dt><dd>Milte julte size ke do networks traffic <b>sirf apne customers ke liye</b> exchange karte hain, aam taur par muft (settlement-free). Peering aksar <b>Internet Exchange Point (IXP)</b> par hoti hai, ek shared switch fabric jahan kai ASes milte hain.</dd>
<dt>Transit AS</dt><dd>Koi bhi AS jo do doosre ASes ke beech traffic dhota hai. Lab 2 mein AS 65102 aur AS 65103 campus aur data centre ke liye transit ASes hain.</dd>
<dt>Stub AS</dt><dd>Woh AS jo sirf apne liye traffic originate ya receive karta hai, jaise campus AS 65101 ya Kaveri Textiles.</dd>
</dl>
<p>Connectivity designs ke naam bhi sunoge: <b>single-homed</b> (ek ISP se ek link), <b>dual-homed</b> (same ISP se do links) aur <b>multihomed</b> (do ya zyada ISPs se links). Sirf multihoming ko sach mein apna public ASN aur poori BGP policy chahiye.</p>

<div class="eg"><p><b>Worked example.</b> Ek 4-byte ASN asdot mein <code>3.100</code> dikhta hai. asplain mein yeh 3 x 65536 + 100 = <b>196708</b> hai. Ek doosra customer ASN <b>4200000010</b> use karta hai: yeh 4200000000 se 4294967294 ke beech hai, isliye private hai aur public internet par kabhi nahi dikhna chahiye. Jo purana router sirf 2-byte ASNs samajhta hai, use 4-byte peer apne AS_PATH mein <b>AS 23456</b> dikhega.</p></div>

<div class="warn"><p><b>Common galti.</b> Private ASNs internet par leak karna. Agar aapki enterprise provider ki taraf AS 65010 use karti hai aur provider use hatana bhool jaaye, to doosre networks aapka route drop kar sakte hain ya confusing path dikha sakte hain. Aur production network ke liye 64500 sirf isliye mat chuno ki lab use karti hai: yeh documentation number hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Private 2-byte range <b>64512 se 65534</b> hai, 64512 se 65535 nahi (65535 reserved hai). Aur eBGP ki AD <b>20</b>, iBGP ki <b>200</b>; ASN type (public ya private) AD nahi badalta.</p></div>

<div class="scn"><h4>Woh ISP jo 4-byte ASN accept nahi kar raha tha</h4><p>Ek badhti company ko uski registry se naya 4-byte ASN mila. Secondary ISP ke saath session up ho gaya, par ISP ke purane core routers path ko <code>23456</code> dikha rahe the aur ISP side ka ek strict filter, jo company ke expected ASN ke liye likha gaya tha, routes reject kar raha tha. ISP ne filter ko 4-byte ASN use karne ke liye update kiya aur confirm kiya ki uske naye border routers 4-byte ASNs natively support karte hain.</p><p><b>Seekh:</b> path mein AS 23456 matlab chain mein kahin 2-byte-only speaker hai; har router aur filter par 4-byte support check karo.</p></div>

<div class="iv"><p class="q">"Transit aur peering mein kya fark hai?"</p><p>Strong answer: transit paid service hai jahan provider aapka traffic poore internet tak aur wahan se laata hai; peering aam taur par settlement-free exchange hai jahan do ASes sirf ek doosre ke customers tak pahunchte hain, aksar IXP par. Jodo ki stub AS sirf apne prefixes originate karta hai, jabki transit AS third-party traffic dhota hai, aur outbound filter karna zaroori hai taaki enterprise kabhi apne do ISPs ke beech galti se transit na ban jaaye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AS ek administration aur ek routing policy hai; uski pehchaan ASN hai.</li>
<li>Private ASNs: 64512 se 65534 (2-byte) aur 4200000000 se 4294967294 (4-byte). 64496 se 64511 documentation ke liye.</li>
<li>4-byte ASNs asplain (196708) ya asdot (3.100) mein dikhte hain; purane peers ki taraf AS 23456 (AS_TRANS) unki jagah aata hai.</li>
<li>IANA paanch RIRs ko delegate karta hai: AFRINIC, APNIC, ARIN, LACNIC, RIPE NCC.</li>
<li>Transit = sab kuch tak paid access; peering = customer routes ka aapsi exchange.</li>
</ul></div>
`}};export{e as default};