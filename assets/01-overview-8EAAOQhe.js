var e={id:`overview`,h:{en:`IS-IS big picture: what you will learn and why it exists`,hi:`IS-IS ka big picture: kya seekhoge aur yeh kyun hai`},body:{en:`
<p><b>What you will learn in this module.</b> You will build IS-IS on Junos from nothing: understand the packets, give every router a NET, enable <code>family iso</code>, form level 1 and level 2 adjacencies, watch the DIS and pseudonode on a LAN, read the link-state database, control metrics and route preference, use the attached bit, authenticate hellos, leak routes between levels, and troubleshoot an adjacency that never comes up. The nine chapters walk through the three simulator labs, and the exact outputs you see here come from them.</p>
<p><b>Prerequisites.</b> You should be comfortable with the Junos CLI (<code>set</code>, <code>commit</code>, <code>show | compare</code>) and know what a link-state protocol is. If LSAs, areas and SPF are fuzzy, read the OSPF module first, because IS-IS is the same idea with different vocabulary. Next in the track is BGP, which relies on an IGP like this one to reach its loopbacks.</p>

<h3>Analogy: two postal systems</h3>
<p>OSPF is like a courier company that only delivers inside the national postal network, which is IP. IS-IS is a rival company that built its own vans and its own road signs. It does not use IP to carry its messages at all. It talks directly over Ethernet and names every router with its own address style. Both companies draw the same kind of city map (a link-state database) and both use the same shortest-path method, so a route from A to B comes out the same. The difference is the packaging, which is why the first chapters teach packets and addresses.</p>

<h3>Where IS-IS comes from and why providers like it</h3>
<p>IS-IS (Intermediate System to Intermediate System) was designed by ISO for the OSI protocol suite. "Intermediate system" is simply the OSI word for <b>router</b>; an "end system" is a host. When the Internet grew, IS-IS was extended to carry IP prefixes (integrated IS-IS) and many large service providers adopted it. Reasons you will hear in interviews:</p>
<ul>
<li><b>Independent of IP.</b> The control plane is not carried inside IP, so a broken IP address plan cannot damage the IS-IS exchange itself.</li>
<li><b>Easy to extend.</b> Everything in a packet is a TLV (type-length-value), so IPv6, wide metrics and traffic engineering only needed new TLVs. One IS-IS process can carry IPv4 and IPv6.</li>
<li><b>Flat, simple hierarchy.</b> Two levels, and area borders run along links, not through routers. Level 2 forms a contiguous backbone of any shape.</li>
<li><b>Scales well.</b> Each router floods one LSP per level, and it is common in very large provider networks.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="IS-IS two level hierarchy">
<rect x="20" y="20" width="190" height="170" rx="12" fill="#bae6fd"/><text x="115" y="42" text-anchor="middle" class="svg-ink" font-size="13">Area 49.0001 (L1)</text>
<rect x="225" y="60" width="190" height="90" rx="12" fill="#ddd6fe"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="13">Level 2 backbone</text>
<rect x="430" y="20" width="190" height="170" rx="12" fill="#bbf7d0"/><text x="525" y="42" text-anchor="middle" class="svg-ink" font-size="13">Area 49.0002 (L1)</text>
<circle cx="70" cy="110" r="18" fill="#fde68a" stroke="#64748b"/><text x="70" y="114" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<circle cx="170" cy="110" r="18" fill="#fed7aa" stroke="#64748b"/><text x="170" y="114" text-anchor="middle" class="svg-ink" font-size="12">R2</text>
<circle cx="270" cy="110" r="18" fill="#fed7aa" stroke="#64748b"/><text x="270" y="114" text-anchor="middle" class="svg-ink" font-size="12">R3</text>
<circle cx="370" cy="110" r="18" fill="#fed7aa" stroke="#64748b"/><text x="370" y="114" text-anchor="middle" class="svg-ink" font-size="12">R4</text>
<circle cx="470" cy="110" r="18" fill="#fed7aa" stroke="#64748b"/><text x="470" y="114" text-anchor="middle" class="svg-ink" font-size="12">R5</text>
<circle cx="570" cy="110" r="18" fill="#fde68a" stroke="#64748b"/><text x="570" y="114" text-anchor="middle" class="svg-ink" font-size="12">R6</text>
<line x1="88" y1="110" x2="152" y2="110" stroke="#64748b" stroke-width="2"/><line x1="188" y1="110" x2="252" y2="110" stroke="#64748b" stroke-width="2"/><line x1="288" y1="110" x2="352" y2="110" stroke="#64748b" stroke-width="2"/><line x1="388" y1="110" x2="452" y2="110" stroke="#64748b" stroke-width="2"/><line x1="488" y1="110" x2="552" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">R2 to R5 are L1/L2 or L2 routers; R1 and R6 are L1 only</text>
</svg><p class="cap">Level 1 inside areas, level 2 as the backbone.</p></div>

<h3>The module in one table</h3>
<table class="cmp"><tr><th>Chapter</th><th>Question it answers</th></tr>
<tr><td>2 PDUs and TLVs</td><td>What do IS-IS packets look like?</td></tr>
<tr><td>3 NET and family iso</td><td>How do I turn IS-IS on and name a router?</td></tr>
<tr><td>4 Levels and adjacencies</td><td>Which routers become neighbours, and at which level?</td></tr>
<tr><td>5 DIS and pseudonode</td><td>What happens on a LAN?</td></tr>
<tr><td>6 Metrics and attached bit</td><td>How are routes chosen and how does L1 leave its area?</td></tr>
<tr><td>7 Authentication, overload, leaking</td><td>How do I secure and tune it?</td></tr>
<tr><td>8 Troubleshooting</td><td>Why does the adjacency not come up?</td></tr>
<tr><td>9 Summary</td><td>What must I remember for the exam?</td></tr></table>

<div class="eg"><p><b>Worked example.</b> The first lab uses three routers: R1 10.40.255.1, R2 10.40.255.2 and R3 10.40.255.3, area 49.0040, links 10.40.12.0/30 (R1-R2) and 10.40.23.0/30 (R2-R3). By chapter 3 each loopback carries a NET such as <code>49.0040.0100.4025.5002.00</code>, and R1 pings R3 across an IS-IS level 2 backbone with <code>[IS-IS/18]</code> as the route.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Assuming IS-IS needs IP addresses on the link to form an adjacency. The addresses are needed to forward traffic, but the adjacency forms over ISO. The missing piece is almost always <code>family iso</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> IS-IS is not an IP protocol. It runs directly over the data link layer, not inside IP, UDP or TCP. If a question asks for the IP protocol number of IS-IS, the right answer is that it has none.</p></div>

<div class="scn"><h4>A provider moves from OSPF to IS-IS</h4><p>A regional ISP with 120 routers hit scaling limits with an OSPF area 0 that had grown sprawling. The team migrated to IS-IS one POP at a time, running both protocols with different preferences. After cutover the same configuration carried IPv6 without a second process. The only surprises were forgetting <code>family iso</code> on a few links and an L1-only router with the wrong area ID.</p><p><b>Lesson:</b> IS-IS is not harder than OSPF, it is different. Most early faults are addressing and family problems.</p></div>

<div class="iv"><p class="q">"Why do many service providers choose IS-IS over OSPF?"</p><p>It is a link-state IGP that does not depend on IP, so the control plane is isolated from IP misconfiguration. TLVs make it extensible, so one process carries IPv4 and IPv6 and traffic-engineering data. The area border is on the link rather than in the router, and it has a long record in large backbones. Add that both protocols give the same shortest-path result, so the choice is about operations.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IS-IS is a link-state IGP from the OSI world; "intermediate system" means router.</li>
<li>It runs over layer 2, not over IP, so Junos interfaces need <code>family iso</code>.</li>
<li>Level 1 is inside an area, level 2 is the backbone, and area borders are on links.</li>
<li>TLVs make it easy to extend for IPv6 and wide metrics.</li>
<li>The labs use R1, R2 and R3 in area 49.0040 on 10.40.x.x addresses and the other labs use their own areas.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap Junos par IS-IS ko zero se banana seekhoge: packets samajhna, har router ko NET dena, <code>family iso</code> enable karna, level 1 aur level 2 adjacencies banana, LAN par DIS aur pseudonode dekhna, link-state database padhna, metrics aur route preference control karna, attached bit use karna, hellos authenticate karna, levels ke beech routes leak karna, aur wo adjacency troubleshoot karna jo kabhi up nahi hoti. Nau chapters teeno simulator labs se guzarte hain, aur yahan dikhne wale exact outputs unhi se aaye hain.</p>
<p><b>Prerequisites.</b> Aapko Junos CLI (<code>set</code>, <code>commit</code>, <code>show | compare</code>) se comfortable hona chahiye aur pata hona chahiye ki link-state protocol kya hai. LSAs, areas aur SPF dhundhle hon to pehle OSPF module padho, kyunki IS-IS wahi idea hai bas vocabulary alag. Track mein agla BGP hai, jo apne loopbacks tak pahunchne ke liye aise hi IGP par nirbhar karta hai.</p>

<h3>Analogy: do postal systems</h3>
<p>OSPF aisi courier company jaisa hai jo sirf national postal network ke andar deliver karti hai, yaani IP. IS-IS ek rival company hai jisne apni vans aur apne road signs banaye. Wo apne messages ko carry karne ke liye IP use hi nahi karta. Wo seedha Ethernet par baat karta hai aur har router ko apne address style se naam deta hai. Dono companies ek jaisa city map (link-state database) banati hain aur dono same shortest-path method use karti hain, isliye A se B ka route same nikalta hai. Farq packaging ka hai, isliye pehle chapters packets aur addresses sikhate hain.</p>

<h3>IS-IS kahan se aaya aur providers ko kyun pasand hai</h3>
<p>IS-IS (Intermediate System to Intermediate System) ISO ne OSI protocol suite ke liye design kiya tha. "Intermediate system" OSI mein <b>router</b> ka shabd hai; "end system" host hai. Internet badha to IS-IS ko IP prefixes carry karne ke liye extend kiya gaya (integrated IS-IS) aur bahut se bade service providers ne ise apnaya. Interviews mein ye wajahein sunne ko milti hain:</p>
<ul>
<li><b>IP se independent.</b> Control plane IP ke andar carry nahi hota, isliye kharab IP address plan IS-IS exchange ko khud nuksaan nahi pahunchata.</li>
<li><b>Extend karna aasaan.</b> Packet ka sab kuch TLV (type-length-value) hai, isliye IPv6, wide metrics aur traffic engineering ke liye sirf naye TLVs chahiye the. Ek IS-IS process IPv4 aur IPv6 dono le ja sakta hai.</li>
<li><b>Flat, simple hierarchy.</b> Do levels, aur area borders links par chalte hain, routers ke andar se nahi. Level 2 kisi bhi shape ka contiguous backbone banata hai.</li>
<li><b>Achha scale karta hai.</b> Har router har level ke liye ek LSP flood karta hai, aur bahut bade provider networks mein aam hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="IS-IS do level hierarchy">
<rect x="20" y="20" width="190" height="170" rx="12" fill="#bae6fd"/><text x="115" y="42" text-anchor="middle" class="svg-ink" font-size="13">Area 49.0001 (L1)</text>
<rect x="225" y="60" width="190" height="90" rx="12" fill="#ddd6fe"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="13">Level 2 backbone</text>
<rect x="430" y="20" width="190" height="170" rx="12" fill="#bbf7d0"/><text x="525" y="42" text-anchor="middle" class="svg-ink" font-size="13">Area 49.0002 (L1)</text>
<circle cx="70" cy="110" r="18" fill="#fde68a" stroke="#64748b"/><text x="70" y="114" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<circle cx="170" cy="110" r="18" fill="#fed7aa" stroke="#64748b"/><text x="170" y="114" text-anchor="middle" class="svg-ink" font-size="12">R2</text>
<circle cx="270" cy="110" r="18" fill="#fed7aa" stroke="#64748b"/><text x="270" y="114" text-anchor="middle" class="svg-ink" font-size="12">R3</text>
<circle cx="370" cy="110" r="18" fill="#fed7aa" stroke="#64748b"/><text x="370" y="114" text-anchor="middle" class="svg-ink" font-size="12">R4</text>
<circle cx="470" cy="110" r="18" fill="#fed7aa" stroke="#64748b"/><text x="470" y="114" text-anchor="middle" class="svg-ink" font-size="12">R5</text>
<circle cx="570" cy="110" r="18" fill="#fde68a" stroke="#64748b"/><text x="570" y="114" text-anchor="middle" class="svg-ink" font-size="12">R6</text>
<line x1="88" y1="110" x2="152" y2="110" stroke="#64748b" stroke-width="2"/><line x1="188" y1="110" x2="252" y2="110" stroke="#64748b" stroke-width="2"/><line x1="288" y1="110" x2="352" y2="110" stroke="#64748b" stroke-width="2"/><line x1="388" y1="110" x2="452" y2="110" stroke="#64748b" stroke-width="2"/><line x1="488" y1="110" x2="552" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">R2 se R5 L1/L2 ya L2 routers hain; R1 aur R6 sirf L1</text>
</svg><p class="cap">Areas ke andar level 1, backbone ke roop mein level 2.</p></div>

<h3>Ek table mein module</h3>
<table class="cmp"><tr><th>Chapter</th><th>Kaun sa sawal hal karta hai</th></tr>
<tr><td>2 PDUs aur TLVs</td><td>IS-IS packets kaise dikhte hain?</td></tr>
<tr><td>3 NET aur family iso</td><td>IS-IS ko on kaise karein aur router ka naam kaise rakhein?</td></tr>
<tr><td>4 Levels aur adjacencies</td><td>Kaun se routers neighbour bante hain, aur kis level par?</td></tr>
<tr><td>5 DIS aur pseudonode</td><td>LAN par kya hota hai?</td></tr>
<tr><td>6 Metrics aur attached bit</td><td>Routes kaise chune jaate hain aur L1 apne area se bahar kaise jaata hai?</td></tr>
<tr><td>7 Authentication, overload, leaking</td><td>Ise secure aur tune kaise karein?</td></tr>
<tr><td>8 Troubleshooting</td><td>Adjacency up kyun nahi hoti?</td></tr>
<tr><td>9 Summary</td><td>Exam ke liye kya yaad rakhna hai?</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Pehle lab mein teen routers hain: R1 10.40.255.1, R2 10.40.255.2 aur R3 10.40.255.3, area 49.0040, links 10.40.12.0/30 (R1-R2) aur 10.40.23.0/30 (R2-R3). Chapter 3 tak har loopback par <code>49.0040.0100.4025.5002.00</code> jaisa NET hota hai, aur R1 IS-IS level 2 backbone ke across R3 ko ping karta hai, route <code>[IS-IS/18]</code> ke saath.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Ye maan lena ki IS-IS ko adjacency banane ke liye link par IP address chahiye. Addresses traffic forward karne ke liye chahiye, par adjacency ISO par banti hai. Jo cheez missing hoti hai wo lagbhag hamesha <code>family iso</code> hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> IS-IS IP protocol nahi hai. Ye seedha data link layer par chalta hai, IP, UDP ya TCP ke andar nahi. Sawal IS-IS ka IP protocol number poochhe to sahi jawab hai ki uska koi nahi hai.</p></div>

<div class="scn"><h4>Provider OSPF se IS-IS par jaata hai</h4><p>Ek regional ISP ke 120 routers OSPF area 0 ke scaling limits tak pahunch gaye jo bahut faila hua tha. Team ne ek-ek POP karke IS-IS par migrate kiya, dono protocols alag preferences ke saath chalate hue. Cutover ke baad wahi configuration bina doosre process ke IPv6 bhi le gayi. Sirf do surprises the: kuch links par <code>family iso</code> bhool jaana aur L1-only router par galat area ID.</p><p><b>Lesson:</b> IS-IS OSPF se mushkil nahi, alag hai. Shuruaati zyaadatar faults addressing aur family ke hote hain.</p></div>

<div class="iv"><p class="q">"Kai service providers OSPF ki jagah IS-IS kyun chunte hain?"</p><p>Ye link-state IGP hai jo IP par nirbhar nahi, isliye control plane IP misconfiguration se alag rehta hai. TLVs ise extensible banate hain, isliye ek process IPv4, IPv6 aur traffic-engineering data le jaata hai. Area border router ke andar nahi balki link par hota hai, aur bade backbones mein iska lamba track record hai. Jodo ki dono protocols same shortest-path result dete hain, isliye choice operations ki hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IS-IS OSI duniya ka link-state IGP hai; "intermediate system" ka matlab router.</li>
<li>Ye layer 2 par chalta hai, IP par nahi, isliye Junos interfaces par <code>family iso</code> chahiye.</li>
<li>Level 1 area ke andar, level 2 backbone, aur area borders links par.</li>
<li>TLVs ise IPv6 aur wide metrics ke liye extend karna aasaan banate hain.</li>
<li>Labs mein pehle R1, R2, R3 area 49.0040 par 10.40.x.x addresses ke saath hain; baaki labs ke apne areas hain.</li>
</ul></div>
`}};export{e as default};