var e={id:`inbound-multilink`,h:{en:`Inbound Multi-Link (concept, reference only)`,hi:`Inbound Multi-Link (concept, sirf reference)`},body:{en:`
<p>Outbound Multi-Link decides which ISP your users leave through. <b>Inbound</b> is the opposite problem: when a customer on the internet opens your published server, which ISP address do they arrive on? If you own two internet lines, you have two public addresses, and the world must know both.</p>
<div class="note"><p><b>Reference configuration (not run in the simulator).</b> The CONFIG labs do not model inbound load balancing. This chapter explains the idea so you can read a design and talk about it in an interview. Exact features and settings depend on the release, so check the documentation for your NGFW version.</p></div>

<h3>Analogy: a shop with two front doors</h3>
<p>A shop has a door on the main road and a door on the back lane. A map app lists only the main-road door. If that road is closed for a procession, customers cannot find the shop even though the back door is open. The fix is to tell the map app about both doors, and to take down a door from the listing when it closes.</p>

<h3>The problem in network terms</h3>
<p>Your web server web.nk-example.example is published by destination NAT (you practised this in the NAT module). Each ISP provides its own public address, say 203.0.113.2 and 192.0.2.2. The DNS record that customers use can point to one address or to both. If it points only to ISP1, an ISP1 failure takes the site down although ISP2 is healthy. Inbound Multi-Link is the set of techniques to avoid this.</p>

<h3>Common approaches</h3>
<table class="cmp"><tr><th>Approach</th><th>Idea</th><th>Caution</th></tr>
<tr><td>Two DNS records</td><td>The name has an address for each ISP. Clients try them in turn.</td><td>Dead address still returned; some clients wait before trying the other</td></tr>
<tr><td>Short DNS time to live (TTL)</td><td>Records expire quickly so a change spreads fast</td><td>More DNS queries; some resolvers ignore very low values</td></tr>
<tr><td>Engine answers DNS</td><td>The firewall itself acts as the authoritative name server for the published name and answers with the address of links that are alive</td><td>Needs delegation of that name to the engine; check the documentation for your NGFW version</td></tr>
<tr><td>Provider-independent address</td><td>You own your address block and announce it through both ISPs using BGP</td><td>Needs ISP cooperation and routing skills; not for small branches</td></tr>
</table>
<p>The third approach is the classic "inbound" feature of a Multi-Link firewall: the engine answers DNS queries for the published name and only returns addresses whose link passes its health check, the same probe idea you learnt in the outbound chapter. Details such as the supported record types and selection methods differ by release.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Inbound path with two ISPs">
<rect x="10" y="75" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="65" y="102" text-anchor="middle" class="svg-ink" font-size="13">Customer</text><text x="65" y="120" text-anchor="middle" class="svg-muted" font-size="12">asks DNS</text>
<rect x="250" y="15" width="110" height="46" rx="8" fill="#bae6fd"/><text x="305" y="43" text-anchor="middle" class="svg-ink" font-size="13">ISP1 203.0.113.2</text>
<rect x="250" y="150" width="110" height="46" rx="8" fill="#fed7aa"/><text x="305" y="178" text-anchor="middle" class="svg-ink" font-size="13">ISP2 192.0.2.2</text>
<rect x="500" y="75" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="565" y="102" text-anchor="middle" class="svg-ink" font-size="13">Engine + WEB1</text><text x="565" y="120" text-anchor="middle" class="svg-muted" font-size="12">published server</text>
<line x1="120" y1="95" x2="250" y2="40" stroke="#64748b"/><line x1="120" y1="115" x2="250" y2="172" stroke="#64748b"/><line x1="360" y1="40" x2="500" y2="95" stroke="#64748b"/><line x1="360" y1="172" x2="500" y2="115" stroke="#64748b"/>
<text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="12">only alive addresses are given out</text>
</svg><p class="cap">Two public doors to one server. The answer to the DNS question should list only doors that are open.</p></div>

<h3>Rules you still need</h3>
<p>Whatever DNS approach you choose, the engine must be ready on both addresses. The destination NAT rule must publish the server on each public address, and the Access rule uses the public (original) destination, as you learnt in the NAT module. A rule that covers only the ISP1 address works until DNS sends a customer to ISP2, then fails.</p>

<div class="eg"><p><b>Worked example.</b> Shop.nk-example.example is published on 203.0.113.2 (ISP1) and 192.0.2.2 (ISP2) with a DNS TTL of 60 seconds. ISP1 fails at 10:00. A system that checks the link and removes the ISP1 address from answers makes new customers use ISP2 within about a minute. Customers who cached the old answer for 60 seconds see failures until it expires. With a TTL of 86400 seconds (one day), some customers would fail for a full day. This is why TTL is part of the design.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Publishing the server on one ISP address only. Forgetting an Access rule for the second public address. A very long DNS TTL. Assuming outbound probing also fixes inbound; it does not, because customers choose the address from DNS, not from your routing table.</p></div>
<div class="exam"><p><b>Exam trap.</b> Outbound Multi-Link selects the exit link for your users. Inbound is about how outsiders choose an entry address. They are separate problems with separate solutions.</p></div>

<div class="scn"><h4>The shop that vanished at night</h4><p>An online shop published its server on a single ISP address. When that ISP had a night outage, the second line stayed idle and the shop was gone for four hours. The team added the second public address, a matching destination NAT and Access rule, and lowered the DNS TTL from one day to five minutes, then used health-checked DNS answers. The next ISP failure was a log entry, not an incident.</p><p><b>Lesson:</b> resilience for inbound traffic starts in DNS and ends in matching NAT and rules.</p></div>

<div class="iv"><p class="q">"You have two ISPs and a public web server. How do you keep it reachable if one ISP fails?"</p><p>Strong answer: publish the server on both ISP addresses with matching NAT and Access rules, put both in DNS with a low TTL, and use health checks so a dead address is not returned. Mention the alternative of your own address block with BGP, and state that the outbound probe alone does not help inbound.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inbound Multi-Link is about which public address outsiders use to reach your server.</li>
<li>It is reference material here and not run in the simulator.</li>
<li>DNS with health checks and a low TTL is the common technique.</li>
<li>Publish and permit the server on every public address.</li>
<li>Outbound probing does not solve inbound reachability.</li>
</ul></div>
`,hi:`
<p>Outbound Multi-Link decide karta hai ki aapke users kaun se ISP se bahar jaayen. <b>Inbound</b> ulta problem hai: internet par baitha customer aapka published server kholta hai to woh kaun se ISP address par aata hai? Agar aapke paas do internet lines hain to do public addresses hain, aur duniya ko dono pata hone chahiye.</p>
<div class="note"><p><b>Reference configuration (not run in the simulator).</b> CONFIG labs inbound load balancing model nahi karte. Yeh chapter idea samjhata hai taaki aap ek design padh sako aur interview mein baat kar sako. Exact features aur settings release par depend karte hain, isliye check the documentation for your NGFW version.</p></div>

<h3>Analogy: do front doors wali dukaan</h3>
<p>Ek dukaan ka ek darwaza main road par hai aur doosra peeche ki gali mein. Map app sirf main-road wala darwaza dikhata hai. Agar juloos ki wajah se wo road band hai, to peeche ka darwaza khula hone par bhi customers dukaan dhoondh nahi paate. Fix hai map app ko dono darwaze batana, aur darwaza band ho to use listing se hata dena.</p>

<h3>Network ki bhasha mein problem</h3>
<p>Aapka web server web.nk-example.example destination NAT se published hai (yeh aapne NAT module mein practice kiya). Har ISP apna public address deta hai, maano 203.0.113.2 aur 192.0.2.2. Customers jo DNS record use karte hain woh ek address ya dono par point kar sakta hai. Agar sirf ISP1 par point kare, to ISP2 healthy hone par bhi ISP1 fail hone se site down ho jaati hai. Inbound Multi-Link isi se bachne ki techniques ka set hai.</p>

<h3>Common approaches</h3>
<table class="cmp"><tr><th>Approach</th><th>Idea</th><th>Dhyan rakhein</th></tr>
<tr><td>Do DNS records</td><td>Name ke paas har ISP ka address hota hai. Clients ek ke baad ek try karte hain.</td><td>Dead address bhi return hota hai; kuch clients doosra try karne se pehle wait karte hain</td></tr>
<tr><td>Chhota DNS time to live (TTL)</td><td>Records jaldi expire hote hain, isliye change tezi se fail jaata hai</td><td>Zyada DNS queries; kuch resolvers bahut kam values ignore karte hain</td></tr>
<tr><td>Engine DNS answer deta hai</td><td>Firewall khud published name ka authoritative name server banta hai aur sirf alive links ke addresses return karta hai</td><td>Us name ka delegation engine ko chahiye; check the documentation for your NGFW version</td></tr>
<tr><td>Provider-independent address</td><td>Aapka apna address block hai aur aap use BGP se dono ISPs ke through announce karte ho</td><td>ISP cooperation aur routing skills chahiye; chhote branches ke liye nahi</td></tr>
</table>
<p>Teesra approach Multi-Link firewall ka classic "inbound" feature hai: engine published name ke DNS queries ka jawab deta hai aur sirf wahi addresses return karta hai jinka link health check pass karta hai, wahi probe idea jo outbound chapter mein seekha. Supported record types aur selection methods jaise details release ke hisaab se alag hote hain.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Do ISPs ke saath inbound path">
<rect x="10" y="75" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="65" y="102" text-anchor="middle" class="svg-ink" font-size="13">Customer</text><text x="65" y="120" text-anchor="middle" class="svg-muted" font-size="12">DNS puchta hai</text>
<rect x="250" y="15" width="110" height="46" rx="8" fill="#bae6fd"/><text x="305" y="43" text-anchor="middle" class="svg-ink" font-size="13">ISP1 203.0.113.2</text>
<rect x="250" y="150" width="110" height="46" rx="8" fill="#fed7aa"/><text x="305" y="178" text-anchor="middle" class="svg-ink" font-size="13">ISP2 192.0.2.2</text>
<rect x="500" y="75" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="565" y="102" text-anchor="middle" class="svg-ink" font-size="13">Engine + WEB1</text><text x="565" y="120" text-anchor="middle" class="svg-muted" font-size="12">published server</text>
<line x1="120" y1="95" x2="250" y2="40" stroke="#64748b"/><line x1="120" y1="115" x2="250" y2="172" stroke="#64748b"/><line x1="360" y1="40" x2="500" y2="95" stroke="#64748b"/><line x1="360" y1="172" x2="500" y2="115" stroke="#64748b"/>
<text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="12">sirf alive addresses diye jaate hain</text>
</svg><p class="cap">Ek server ke do public darwaze. DNS ke jawab mein sirf khule darwaze hone chahiye.</p></div>

<h3>Phir bhi zaroori rules</h3>
<p>Jo bhi DNS approach chuno, engine dono addresses par ready hona chahiye. Destination NAT rule server ko har public address par publish kare, aur Access rule public (original) destination use kare, jaise NAT module mein seekha. Sirf ISP1 address cover karne wala rule tab tak chalta hai jab tak DNS kisi customer ko ISP2 par na bheje, phir fail hota hai.</p>

<div class="eg"><p><b>Worked example.</b> Shop.nk-example.example 203.0.113.2 (ISP1) aur 192.0.2.2 (ISP2) par published hai, DNS TTL 60 seconds. ISP1 10:00 par fail hota hai. Jo system link check karke ISP1 address jawabon se hata deta hai, usse naye customers lagbhag ek minute mein ISP2 use karte hain. Jinhone purana jawab 60 seconds cache kiya, unhe expire hone tak failures dikhte hain. 86400 seconds (ek din) ke TTL se kuch customers poore din fail rehte. Isliye TTL design ka hissa hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Server ko sirf ek ISP address par publish karna. Doosre public address ke liye Access rule bhool jaana. Bahut lamba DNS TTL. Yeh maan lena ki outbound probing inbound bhi theek kar deta hai; aisa nahi hai, kyunki customers address DNS se chunte hain, aapke routing table se nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Outbound Multi-Link aapke users ke liye exit link chunta hai. Inbound yeh hai ki bahar ke log entry address kaise chunte hain. Dono alag problems hain, alag solutions ke saath.</p></div>

<div class="scn"><h4>Raat ko gayab hui dukaan</h4><p>Ek online shop ne apna server sirf ek ISP address par publish kiya tha. Us ISP ki raat ko outage hui to doosri line khaali rahi aur shop chaar ghante gayab rahi. Team ne doosra public address, matching destination NAT aur Access rule add kiya, DNS TTL ek din se paanch minute kiya, aur health-checked DNS answers use kiye. Agla ISP failure incident nahi, ek log entry tha.</p><p><b>Lesson:</b> inbound traffic ki resilience DNS se shuru hoti hai aur matching NAT aur rules par khatam.</p></div>

<div class="iv"><p class="q">"Aapke paas do ISPs aur ek public web server hai. Ek ISP fail ho to use reachable kaise rakhoge?"</p><p>Strong answer: server ko dono ISP addresses par matching NAT aur Access rules ke saath publish karo, dono ko low TTL ke saath DNS mein daalo, aur health checks use karo taaki dead address return na ho. Apne address block aur BGP ka alternative batao, aur kaho ki akela outbound probe inbound mein madad nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inbound Multi-Link yeh hai ki bahar ke log aapke server tak kaun se public address se aayein.</li>
<li>Yahan yeh reference material hai aur simulator mein nahi chalta.</li>
<li>Health checks aur low TTL wala DNS common technique hai.</li>
<li>Server ko har public address par publish aur permit karo.</li>
<li>Outbound probing inbound reachability theek nahi karta.</li>
</ul></div>
`}};export{e as default};