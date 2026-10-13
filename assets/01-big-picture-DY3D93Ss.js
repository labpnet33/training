var e={id:`big-picture`,h:{en:`The big picture: how the internet agrees on routes`,hi:`Big picture: internet routes par kaise sehmat hota hai`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to explain why the internet needs BGP, read an AS number and tell whether it is public or private, bring up an eBGP session between two directly connected routers and between loopbacks, advertise your own prefixes correctly, read every column of <code>show ip bgp</code>, walk the full best-path selection algorithm from memory, nudge traffic with weight, local preference, AS-path prepending and MED, build a summary with <code>aggregate-address</code>, and troubleshoot a session that refuses to come up. This covers CCNP ENCOR 350-401 v1.2 objective <b>3.2.c: configure and verify eBGP between directly connected neighbors (best path selection algorithm and neighbor relationships)</b>.</p>

<h3>Prerequisites</h3>
<ul>
<li>IPv4 addressing and subnet masks, including what <code>/24</code> and <code>255.255.255.0</code> mean.</li>
<li>The routing table: connected, static and dynamic routes, and <b>administrative distance</b> (AD) as the tie-breaker between protocols.</li>
<li>One interior routing protocol, ideally OSPF from the previous ENCOR module. We will compare BGP with it often.</li>
<li>Basic IOS navigation: <code>configure terminal</code>, <code>show running-config</code>, <code>ping</code>.</li>
</ul>
<p>You do <b>not</b> need any previous BGP knowledge. iBGP design, route reflectors and session hardening are taught in depth later in the CCNP ENARSI BGP module; here we only preview them.</p>

<h3>An analogy: countries, border posts and trade treaties</h3>
<p>Think of the internet as a world of countries. Inside each country the government runs its own roads with its own rules: speed limits, one-way streets, fastest route to the capital. That is an <b>interior</b> routing protocol such as OSPF or EIGRP. Nobody outside the country needs to know how the roads inside are built.</p>
<p>Between countries, things are different. Each country has <b>border posts</b>, and what crosses a border is decided by <b>treaties</b>, not by which road is shortest. India may send goods to Europe through the Gulf because of a trade agreement, even if another path is physically shorter. Every shipment carries a stamped passport listing every country it has passed through, and no country accepts a shipment that already carries its own stamp, because that would mean the shipment is going in circles.</p>
<p>In networking terms:</p>
<ul>
<li>A country is an <b>autonomous system (AS)</b>: a network under one administration with one routing policy, identified by an <b>AS number (ASN)</b>.</li>
<li>A border post is a <b>BGP speaker</b>, a router that runs BGP with a router in another AS.</li>
<li>The treaty is <b>routing policy</b>: which routes you accept, which you announce, and which path you prefer.</li>
<li>The stamped passport is the <b>AS_PATH</b> attribute, and refusing a shipment with your own stamp is BGP's <b>loop prevention</b>.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Autonomous systems connected by BGP">
<ellipse cx="110" cy="120" rx="95" ry="70" fill="#bae6fd"/><text x="110" y="100" text-anchor="middle" class="svg-ink" font-size="14">AS 65010</text><text x="110" y="120" text-anchor="middle" class="svg-muted" font-size="12">Kaveri Textiles</text><text x="110" y="140" text-anchor="middle" class="svg-muted" font-size="12">OSPF inside</text>
<ellipse cx="330" cy="120" rx="95" ry="70" fill="#bbf7d0"/><text x="330" y="100" text-anchor="middle" class="svg-ink" font-size="14">AS 64500</text><text x="330" y="120" text-anchor="middle" class="svg-muted" font-size="12">Skyline Net (ISP)</text><text x="330" y="140" text-anchor="middle" class="svg-muted" font-size="12">IS-IS inside</text>
<ellipse cx="540" cy="120" rx="90" ry="70" fill="#ddd6fe"/><text x="540" y="100" text-anchor="middle" class="svg-ink" font-size="14">Other ASes</text><text x="540" y="120" text-anchor="middle" class="svg-muted" font-size="12">rest of the</text><text x="540" y="140" text-anchor="middle" class="svg-muted" font-size="12">internet</text>
<line x1="205" y1="120" x2="235" y2="120" stroke="#64748b" stroke-width="3"/><line x1="425" y1="120" x2="450" y2="120" stroke="#64748b" stroke-width="3"/>
<text x="220" y="210" text-anchor="middle" class="svg-accent" font-size="12">eBGP border</text><text x="437" y="210" text-anchor="middle" class="svg-accent" font-size="12">eBGP border</text>
<line x1="220" y1="130" x2="220" y2="198" stroke="#64748b" stroke-dasharray="4 4"/><line x1="437" y1="130" x2="437" y2="198" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="320" y="240" text-anchor="middle" class="svg-ink" font-size="12">IGP inside each AS, BGP between them</text>
</svg><p class="cap">Every AS runs whatever it likes inside. BGP is the common language spoken at the borders.</p></div>

<h3>Why not just use OSPF everywhere?</h3>
<p>Three reasons. First, <b>scale</b>: the global IPv4 table holds roughly a million prefixes. OSPF floods every link change to every router and reruns SPF; doing that across the whole planet would never converge. BGP only sends <b>incremental updates</b> over reliable TCP sessions. Second, <b>privacy</b>: an ISP does not want its customers to see its internal topology, and OSPF shares the full map inside an area. BGP only shares <b>reachability plus attributes</b>. Third, <b>policy</b>: OSPF picks the lowest cost, full stop. BGP lets each AS pick paths for business reasons, such as "prefer the cheaper transit provider" or "never carry traffic between two of my providers for free".</p>

<h3>Where you meet BGP as an enterprise engineer</h3>
<ul>
<li><b>Internet edge.</b> Connecting to one or more ISPs, advertising your public prefixes, receiving a default route or a full table.</li>
<li><b>WAN and SD-WAN.</b> Many MPLS L3VPN services use eBGP between the customer edge (CE) and provider edge (PE).</li>
<li><b>Data center and cloud.</b> EVPN, cloud interconnects and large spine-leaf fabrics use BGP heavily.</li>
</ul>

<h3>The two labs in this module</h3>
<p>You will practise on two topologies, and the chapters use the same names and addresses:</p>
<ol>
<li><b>BGP configuration: customer to ISP.</b> CUST-EDGE in AS 65010 (Kaveri Textiles) peers with the ISP router in AS 64500 (Skyline Net) over 100.64.10.0/30. You advertise the office LAN 192.168.50.0/24 and reach the ISP service network 203.0.113.0/24.</li>
<li><b>eBGP across four autonomous systems.</b> R1 (AS 65101), R2 (AS 65102), R3 (AS 65103) and R4 (AS 65104) in a chain. R2 and R3 peer between loopbacks 2.2.2.2 and 3.3.3.3, and PC1 must reach PC4 across three AS hops.</li>
</ol>
<p>The troubleshooting chapter also walks a classic ticket: <b>a session stuck in Active</b>.</p>

<div class="eg"><p><b>Worked example.</b> PC1 in the campus (AS 65101) pings PC4 at 172.31.4.10 in the data centre (AS 65104). R4 advertises 172.31.4.0/24 with AS_PATH <code>65104</code>. R3 passes it on as <code>65103 65104</code>, R2 as <code>65102 65103 65104</code>. R1 installs it with next hop 10.12.0.2 and AD 20. Three AS hops, one decision per border, and nobody in the chain knew any interior detail of the others.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking BGP is "just another routing protocol that finds the fastest path". BGP has no idea about bandwidth or delay. It picks paths from attributes set by people. If you forget that, you will be confused when traffic takes an obviously slower path that policy prefers.</p></div>

<div class="exam"><p><b>Exam trap.</b> BGP is a <b>path-vector</b> protocol, not a distance-vector or link-state protocol, and it runs over <b>TCP 179</b>, not UDP and not directly over IP. The current version is BGP-4.</p></div>

<div class="scn"><h4>The branch that tried OSPF with its ISP</h4><p>A retailer's new network engineer asked the ISP to "just run OSPF with us" so the branch could learn internet routes. The ISP refused, and the engineer could not understand why. The answer: OSPF would have exposed the ISP's internal topology, flooded every change across the customer boundary, and offered no way to filter or prefer routes by business policy. The ISP offered an eBGP session instead, sending only a default route, and the retailer advertised its one public /24.</p><p><b>Lesson:</b> IGPs are for inside one administration; between organisations the answer is BGP.</p></div>

<div class="iv"><p class="q">"Why does the internet use BGP instead of OSPF?"</p><p>Strong answer: OSPF is designed for one administrative domain, floods topology and chooses by cost. The internet is tens of thousands of independent ASes that need scale, hidden internal topology and policy control. BGP exchanges only reachability plus attributes over TCP, sends incremental updates, prevents loops with AS_PATH and lets each AS apply its own policy. Mention path-vector and TCP 179.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An autonomous system is one administration with one routing policy, identified by an ASN.</li>
<li>IGPs (OSPF, EIGRP) route inside an AS; BGP routes between ASes.</li>
<li>BGP chooses paths by policy and attributes, not by bandwidth or hop count.</li>
<li>AS_PATH works like a stamped passport and prevents loops between ASes.</li>
<li>The module labs: customer to ISP (AS 65010 to AS 64500) and a four-AS chain (65101 to 65104).</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap samjha paoge ki internet ko BGP kyun chahiye, ek AS number padh kar bata paoge ki woh public hai ya private, do directly connected routers ke beech aur loopbacks ke beech eBGP session up kar paoge, apne prefixes sahi tarike se advertise kar paoge, <code>show ip bgp</code> ka har column padh paoge, poora best-path selection algorithm yaad se chal paoge, weight, local preference, AS-path prepending aur MED se traffic ko mod paoge, <code>aggregate-address</code> se summary bana paoge, aur up na hone wale session ko troubleshoot kar paoge. Yeh CCNP ENCOR 350-401 v1.2 ka objective <b>3.2.c: directly connected neighbors ke beech eBGP configure aur verify karna (best path selection algorithm aur neighbor relationships)</b> cover karta hai.</p>

<h3>Prerequisites</h3>
<ul>
<li>IPv4 addressing aur subnet masks, jaise <code>/24</code> aur <code>255.255.255.0</code> ka matlab.</li>
<li>Routing table: connected, static aur dynamic routes, aur protocols ke beech tie-breaker ke roop mein <b>administrative distance</b> (AD).</li>
<li>Ek interior routing protocol, behtar hai pichhle ENCOR module ka OSPF. Hum BGP ko baar baar usse compare karenge.</li>
<li>Basic IOS navigation: <code>configure terminal</code>, <code>show running-config</code>, <code>ping</code>.</li>
</ul>
<p>Aapko pehle se BGP aana <b>zaroori nahi</b>. iBGP design, route reflectors aur session hardening baad mein CCNP ENARSI BGP module mein detail se padhaye jaate hain; yahan hum unka sirf preview karenge.</p>

<h3>Ek analogy: desh, border posts aur trade treaties</h3>
<p>Internet ko deshon ki duniya samjho. Har desh ke andar sarkar apni sadkein apne rules se chalati hai: speed limits, one-way streets, capital tak sabse fast raasta. Yeh OSPF ya EIGRP jaisa <b>interior</b> routing protocol hai. Desh ke bahar kisi ko jaanne ki zaroorat nahi ki andar ki sadkein kaise bani hain.</p>
<p>Deshon ke beech cheezein alag hain. Har desh ke <b>border posts</b> hote hain, aur border ke paar kya jaayega yeh <b>treaties</b> tay karti hain, sabse chhoti sadak nahi. India saamaan Europe ko Gulf ke raaste bhej sakta hai kyunki trade agreement hai, bhale hi doosra raasta physically chhota ho. Har shipment ke saath ek stamped passport chalta hai jisme har us desh ki list hoti hai jisse woh guzra, aur koi desh aisi shipment accept nahi karta jis par pehle se uska apna stamp ho, kyunki iska matlab hai shipment gol gol ghoom rahi hai.</p>
<p>Networking ki bhasha mein:</p>
<ul>
<li>Desh ek <b>autonomous system (AS)</b> hai: ek administration aur ek routing policy wala network, jise <b>AS number (ASN)</b> se pehchana jaata hai.</li>
<li>Border post ek <b>BGP speaker</b> hai, yaani woh router jo doosre AS ke router ke saath BGP chalata hai.</li>
<li>Treaty <b>routing policy</b> hai: kaunse routes accept karne hain, kaunse announce karne hain, aur kaunsa path prefer karna hai.</li>
<li>Stamped passport <b>AS_PATH</b> attribute hai, aur apne stamp wali shipment ko mana karna BGP ka <b>loop prevention</b> hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="BGP se jude autonomous systems">
<ellipse cx="110" cy="120" rx="95" ry="70" fill="#bae6fd"/><text x="110" y="100" text-anchor="middle" class="svg-ink" font-size="14">AS 65010</text><text x="110" y="120" text-anchor="middle" class="svg-muted" font-size="12">Kaveri Textiles</text><text x="110" y="140" text-anchor="middle" class="svg-muted" font-size="12">andar OSPF</text>
<ellipse cx="330" cy="120" rx="95" ry="70" fill="#bbf7d0"/><text x="330" y="100" text-anchor="middle" class="svg-ink" font-size="14">AS 64500</text><text x="330" y="120" text-anchor="middle" class="svg-muted" font-size="12">Skyline Net (ISP)</text><text x="330" y="140" text-anchor="middle" class="svg-muted" font-size="12">andar IS-IS</text>
<ellipse cx="540" cy="120" rx="90" ry="70" fill="#ddd6fe"/><text x="540" y="100" text-anchor="middle" class="svg-ink" font-size="14">Baaki ASes</text><text x="540" y="120" text-anchor="middle" class="svg-muted" font-size="12">baaki</text><text x="540" y="140" text-anchor="middle" class="svg-muted" font-size="12">internet</text>
<line x1="205" y1="120" x2="235" y2="120" stroke="#64748b" stroke-width="3"/><line x1="425" y1="120" x2="450" y2="120" stroke="#64748b" stroke-width="3"/>
<text x="220" y="210" text-anchor="middle" class="svg-accent" font-size="12">eBGP border</text><text x="437" y="210" text-anchor="middle" class="svg-accent" font-size="12">eBGP border</text>
<line x1="220" y1="130" x2="220" y2="198" stroke="#64748b" stroke-dasharray="4 4"/><line x1="437" y1="130" x2="437" y2="198" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="320" y="240" text-anchor="middle" class="svg-ink" font-size="12">Har AS ke andar IGP, unke beech BGP</text>
</svg><p class="cap">Har AS andar jo chahe chalata hai. BGP woh common bhasha hai jo borders par boli jaati hai.</p></div>

<h3>Har jagah OSPF hi kyun nahi?</h3>
<p>Teen wajah. Pehli, <b>scale</b>: global IPv4 table mein lagbhag das lakh prefixes hain. OSPF har link change har router tak flood karta hai aur SPF dobara chalata hai; poori duniya mein aisa karna kabhi converge nahi hoga. BGP reliable TCP sessions par sirf <b>incremental updates</b> bhejta hai. Doosri, <b>privacy</b>: ISP nahi chahta ki customers uski internal topology dekhein, aur OSPF area ke andar poora map share karta hai. BGP sirf <b>reachability plus attributes</b> share karta hai. Teesri, <b>policy</b>: OSPF lowest cost chunta hai, bas. BGP har AS ko business reasons se path chunne deta hai, jaise "sasta transit provider prefer karo" ya "apne do providers ke beech ka traffic muft mein kabhi mat dhona".</p>

<h3>Enterprise engineer ki tarah BGP kahan milta hai</h3>
<ul>
<li><b>Internet edge.</b> Ek ya zyada ISPs se judna, apne public prefixes advertise karna, default route ya full table lena.</li>
<li><b>WAN aur SD-WAN.</b> Kai MPLS L3VPN services customer edge (CE) aur provider edge (PE) ke beech eBGP use karti hain.</li>
<li><b>Data center aur cloud.</b> EVPN, cloud interconnects aur bade spine-leaf fabrics BGP ka bahut use karte hain.</li>
</ul>

<h3>Is module ki do labs</h3>
<p>Aap do topologies par practice karoge, aur chapters wahi naam aur addresses use karte hain:</p>
<ol>
<li><b>BGP configuration: customer se ISP.</b> AS 65010 (Kaveri Textiles) mein CUST-EDGE, 100.64.10.0/30 par AS 64500 (Skyline Net) ke ISP router se peer karta hai. Aap office LAN 192.168.50.0/24 advertise karte ho aur ISP service network 203.0.113.0/24 tak pahunchte ho.</li>
<li><b>Chaar autonomous systems mein eBGP.</b> R1 (AS 65101), R2 (AS 65102), R3 (AS 65103) aur R4 (AS 65104) ek chain mein. R2 aur R3 loopbacks 2.2.2.2 aur 3.3.3.3 ke beech peer karte hain, aur PC1 ko teen AS hops paar karke PC4 tak pahunchna hai.</li>
</ol>
<p>Troubleshooting chapter ek classic ticket bhi walk karta hai: <b>Active mein atka session</b>.</p>

<div class="eg"><p><b>Worked example.</b> Campus (AS 65101) ka PC1 data centre (AS 65104) mein 172.31.4.10 par PC4 ko ping karta hai. R4 172.31.4.0/24 ko AS_PATH <code>65104</code> ke saath advertise karta hai. R3 ise <code>65103 65104</code> ki tarah aage bhejta hai, R2 <code>65102 65103 65104</code> ki tarah. R1 ise next hop 10.12.0.2 aur AD 20 ke saath install karta hai. Teen AS hops, har border par ek decision, aur chain mein kisi ko doosron ki koi interior detail nahi pata thi.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki BGP "bas ek aur routing protocol hai jo sabse fast path dhoondhta hai". BGP ko bandwidth ya delay ka koi idea nahi. Woh logon ke set kiye attributes se path chunta hai. Yeh bhool gaye to aap confuse hoge jab traffic ek saaf taur par slow path lega jo policy prefer karti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> BGP ek <b>path-vector</b> protocol hai, distance-vector ya link-state nahi, aur yeh <b>TCP 179</b> par chalta hai, UDP par nahi aur seedha IP par bhi nahi. Current version BGP-4 hai.</p></div>

<div class="scn"><h4>Woh branch jisne ISP ke saath OSPF try kiya</h4><p>Ek retailer ke naye network engineer ne ISP se kaha "bas hamare saath OSPF chala do" taaki branch internet routes seekh sake. ISP ne mana kar diya, aur engineer ko samajh nahi aaya kyun. Jawab: OSPF ISP ki internal topology expose kar deta, customer boundary ke paar har change flood karta, aur business policy ke hisaab se routes filter ya prefer karne ka koi tareeka nahi deta. ISP ne iski jagah eBGP session offer kiya, sirf default route bhejte hue, aur retailer ne apna ek public /24 advertise kiya.</p><p><b>Seekh:</b> IGPs ek administration ke andar ke liye hain; organisations ke beech jawab BGP hai.</p></div>

<div class="iv"><p class="q">"Internet OSPF ki jagah BGP kyun use karta hai?"</p><p>Strong answer: OSPF ek administrative domain ke liye bana hai, topology flood karta hai aur cost se chunta hai. Internet hazaaron independent ASes hain jinhe scale, chhupi internal topology aur policy control chahiye. BGP TCP par sirf reachability plus attributes exchange karta hai, incremental updates bhejta hai, AS_PATH se loops rokta hai aur har AS ko apni policy lagane deta hai. Path-vector aur TCP 179 zaroor bolo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Autonomous system ek administration aur ek routing policy hai, jise ASN se pehchana jaata hai.</li>
<li>IGPs (OSPF, EIGRP) AS ke andar route karte hain; BGP ASes ke beech.</li>
<li>BGP policy aur attributes se path chunta hai, bandwidth ya hop count se nahi.</li>
<li>AS_PATH stamped passport ki tarah kaam karta hai aur ASes ke beech loops rokta hai.</li>
<li>Module labs: customer se ISP (AS 65010 se AS 64500) aur chaar-AS chain (65101 se 65104).</li>
</ul></div>
`}};export{e as default};