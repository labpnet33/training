var e={id:`overview`,h:{en:`Advanced OSPF: what you will learn and the big picture`,hi:`Advanced OSPF: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will take OSPF from "it forms neighbours" to "I can design, steer and repair it". Over nine chapters you will: read the link-state database the way a professional does, build multi-area designs with summaries and stub or NSSA areas, run OSPFv3 for IPv6, control what enters and leaves OSPF with export and import policy, tune preferences, drain a router with overload, repair a broken backbone with a virtual link, and follow a troubleshooting workflow. These match the OSPF objectives of the JNCIP-ENT exam (JN0-650). Check the current objective list on the Juniper certification page, as objectives can change between exam versions.</p>
<p><b>Prerequisites.</b> JNCIA-Junos and JNCIS-ENT level OSPF: neighbour states, DR and BDR election, the basic LSA types, single-area and basic multi-area configuration, and the Junos commit model. If you have finished the Start here module you are ready.</p>

<h3>Analogy: a country with districts and a ring road</h3>
<p>Imagine a country split into districts. Each district keeps a detailed street map of itself only. A national ring road connects the districts. A traveller leaving a district consults a short summary: "to reach district C, take the ring road via gateway G2". Gateways are the ABRs. A gateway to another country, with its own rules and maps, is an ASBR. OSPF areas work the same way: details stay inside the area, summaries cross the border, and the backbone, area 0, is the ring road that every district must touch.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Multi-area OSPF">
<ellipse cx="130" cy="110" rx="100" ry="70" fill="#bae6fd" stroke="#64748b"/><text x="130" y="60" text-anchor="middle" class="svg-ink" font-size="13">Area 0.0.0.0</text><text x="130" y="76" text-anchor="middle" class="svg-muted" font-size="11">backbone</text>
<ellipse cx="320" cy="110" rx="90" ry="70" fill="#bbf7d0" stroke="#64748b"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="13">Area 0.0.0.1</text><text x="320" y="76" text-anchor="middle" class="svg-muted" font-size="11">transit area</text>
<ellipse cx="510" cy="110" rx="100" ry="70" fill="#ddd6fe" stroke="#64748b"/><text x="510" y="60" text-anchor="middle" class="svg-ink" font-size="13">Area 0.0.0.2</text><text x="510" y="76" text-anchor="middle" class="svg-muted" font-size="11">no direct link to area 0</text>
<circle cx="70" cy="120" r="14" fill="#fde68a" stroke="#64748b"/><text x="70" y="124" text-anchor="middle" class="svg-ink" font-size="11">R1</text>
<circle cx="225" cy="120" r="16" fill="#fed7aa" stroke="#64748b"/><text x="225" y="124" text-anchor="middle" class="svg-ink" font-size="11">R2</text>
<circle cx="415" cy="120" r="16" fill="#fed7aa" stroke="#64748b"/><text x="415" y="124" text-anchor="middle" class="svg-ink" font-size="11">R3</text>
<circle cx="570" cy="120" r="14" fill="#fde68a" stroke="#64748b"/><text x="570" y="124" text-anchor="middle" class="svg-ink" font-size="11">R4</text>
<line x1="84" y1="120" x2="209" y2="120" stroke="#64748b" stroke-width="2"/><line x1="241" y1="120" x2="399" y2="120" stroke="#64748b" stroke-width="2"/><line x1="431" y1="120" x2="556" y2="120" stroke="#64748b" stroke-width="2"/>
<path d="M225 140 Q320 200 415 140" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="205" text-anchor="middle" class="svg-accent" font-size="12">virtual link (chapter 7)</text>
</svg><p class="cap">R2 and R3 are ABRs. Area 0.0.0.2 touches the backbone only through a virtual link.</p></div>

<h3>The module map</h3>
<table class="cmp"><tr><th>Chapter</th><th>Question it answers</th></tr>
<tr><td>2 Database and areas</td><td>What does each LSA say, and who knows what?</td></tr>
<tr><td>3 Summaries, stub, NSSA</td><td>How do I keep routing tables small?</td></tr>
<tr><td>4 OSPFv3</td><td>How does OSPF carry IPv6?</td></tr>
<tr><td>5 Export policy</td><td>How do outside routes enter OSPF?</td></tr>
<tr><td>6 Import and preference</td><td>Which routes does this router accept and prefer?</td></tr>
<tr><td>7 Overload, virtual links</td><td>How do I drain a router and repair the backbone?</td></tr>
<tr><td>8 Troubleshooting</td><td>How do I find a fault quickly?</td></tr>
<tr><td>9 Summary</td><td>Checklist, glossary, cheat sheet.</td></tr></table>

<h3>The lab devices you will meet</h3>
<p>The module labs use small Junos topologies. In the Delhi lab R1, R2 and R3 run OSPFv3 across two areas. In the Chennai lab R1 to R4 form a square with a head-office PC and a server LAN, and R4 exports partner routes. In the Hubli lab R1 to R4 sit in areas 0, 1 and 2 and a virtual link is broken. Router IDs follow a pattern such as 10.255.4.2, links use /30 networks such as 10.4.12.0/30.</p>

<div class="eg"><p><b>Worked example.</b> In the Chennai lab R1 learns the server LAN 172.16.4.0/24 with metric 3 and two equal-cost next hops, 10.4.12.2 through R2 and 10.4.13.2 through R3. After you put R2 into overload, R1 shows only the R3 next hop, but the ping to R2's loopback 10.255.4.2 still works. The whole module is about explaining and controlling results like this.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating OSPF as "turn it on and forget it". Area boundaries, summaries and policy decide what each router knows. Without a plan, routing tables grow and failures spread.</p></div>
<div class="exam"><p><b>Exam trap.</b> OSPF area IDs are written like IPv4 addresses, 0.0.0.0 for the backbone. Area 0 and area 0.0.0.0 are the same area. Router IDs and area IDs are separate things even though they look alike.</p></div>

<div class="scn"><h4>The merger that created an orphan area</h4><p>Two companies merged. The new Hubli site was connected behind an existing branch router that sat in area 1. Nobody remembered that every area must touch area 0. Hubli had its own neighbours but head office could not reach it. The quick repair was a virtual link between the two ABRs; the long-term plan was to renumber the areas.</p><p><b>Lesson:</b> a working adjacency does not mean a working design. The area rules matter.</p></div>

<div class="iv"><p class="q">"Why does OSPF need a backbone area?"</p><p>Inter-area routing uses a distance-vector-like exchange of summaries through area 0, which prevents loops between areas. Every non-backbone area must attach to area 0 directly or through a virtual link. ABRs summarise routes between areas through the backbone.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>This module covers the OSPF objectives of JN0-650: areas, policy, OSPFv3, overload, virtual links, troubleshooting.</li>
<li>Details stay inside the area; summaries cross the border; area 0 connects all areas.</li>
<li>ABRs sit between areas; ASBRs bring in outside routes.</li>
<li>Area IDs look like IPv4 addresses; 0.0.0.0 is the backbone.</li>
<li>Every chapter pairs concepts with output from the simulator labs.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap OSPF ko "neighbour ban jaate hain" se "main ise design, steer aur repair kar sakta hoon" tak le jaoge. Nau chapters mein aap: link-state database ko professional ki tarah padhoge, summaries aur stub ya NSSA areas ke saath multi-area designs banaoge, IPv6 ke liye OSPFv3 chalaoge, export aur import policy se control karoge ki OSPF mein kya aata-jaata hai, preferences tune karoge, overload se router drain karoge, virtual link se toota backbone repair karoge, aur troubleshooting workflow follow karoge. Yeh JNCIP-ENT exam (JN0-650) ke OSPF objectives se milte hain. Juniper certification page par current objective list zaroor dekho, kyunki exam versions ke beech objectives badal sakte hain.</p>
<p><b>Prerequisites.</b> JNCIA-Junos aur JNCIS-ENT level OSPF: neighbour states, DR aur BDR election, basic LSA types, single-area aur basic multi-area configuration, aur Junos commit model. Start here module khatam kiya hai to aap ready ho.</p>

<h3>Analogy: districts aur ring road wala desh</h3>
<p>Socho ek desh districts mein bata hai. Har district sirf apne aap ka detailed street map rakhta hai. Ek national ring road districts ko jodti hai. District chhodne wala musafir chhota summary dekhta hai: "district C jaane ke liye gateway G2 se ring road lo". Gateways ABRs hain. Doosre desh ka gateway, jiske apne rules aur maps hain, ASBR hai. OSPF areas isi tarah kaam karte hain: details area ke andar rehti hain, summaries border paar karti hain, aur backbone, area 0, woh ring road hai jise har district ko chhoona padta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Multi-area OSPF">
<ellipse cx="130" cy="110" rx="100" ry="70" fill="#bae6fd" stroke="#64748b"/><text x="130" y="60" text-anchor="middle" class="svg-ink" font-size="13">Area 0.0.0.0</text><text x="130" y="76" text-anchor="middle" class="svg-muted" font-size="11">backbone</text>
<ellipse cx="320" cy="110" rx="90" ry="70" fill="#bbf7d0" stroke="#64748b"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="13">Area 0.0.0.1</text><text x="320" y="76" text-anchor="middle" class="svg-muted" font-size="11">transit area</text>
<ellipse cx="510" cy="110" rx="100" ry="70" fill="#ddd6fe" stroke="#64748b"/><text x="510" y="60" text-anchor="middle" class="svg-ink" font-size="13">Area 0.0.0.2</text><text x="510" y="76" text-anchor="middle" class="svg-muted" font-size="11">area 0 se seedha link nahi</text>
<circle cx="70" cy="120" r="14" fill="#fde68a" stroke="#64748b"/><text x="70" y="124" text-anchor="middle" class="svg-ink" font-size="11">R1</text>
<circle cx="225" cy="120" r="16" fill="#fed7aa" stroke="#64748b"/><text x="225" y="124" text-anchor="middle" class="svg-ink" font-size="11">R2</text>
<circle cx="415" cy="120" r="16" fill="#fed7aa" stroke="#64748b"/><text x="415" y="124" text-anchor="middle" class="svg-ink" font-size="11">R3</text>
<circle cx="570" cy="120" r="14" fill="#fde68a" stroke="#64748b"/><text x="570" y="124" text-anchor="middle" class="svg-ink" font-size="11">R4</text>
<line x1="84" y1="120" x2="209" y2="120" stroke="#64748b" stroke-width="2"/><line x1="241" y1="120" x2="399" y2="120" stroke="#64748b" stroke-width="2"/><line x1="431" y1="120" x2="556" y2="120" stroke="#64748b" stroke-width="2"/>
<path d="M225 140 Q320 200 415 140" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="205" text-anchor="middle" class="svg-accent" font-size="12">virtual link (chapter 7)</text>
</svg><p class="cap">R2 aur R3 ABRs hain. Area 0.0.0.2 backbone ko sirf virtual link se chhoota hai.</p></div>

<h3>Module map</h3>
<table class="cmp"><tr><th>Chapter</th><th>Kaunsa sawal solve karta hai</th></tr>
<tr><td>2 Database aur areas</td><td>Har LSA kya kehta hai, aur kaun kya jaanta hai?</td></tr>
<tr><td>3 Summaries, stub, NSSA</td><td>Routing tables chhote kaise rakhun?</td></tr>
<tr><td>4 OSPFv3</td><td>OSPF IPv6 kaise carry karta hai?</td></tr>
<tr><td>5 Export policy</td><td>Bahar ke routes OSPF mein kaise aate hain?</td></tr>
<tr><td>6 Import aur preference</td><td>Yeh router kaunse routes accept aur prefer karta hai?</td></tr>
<tr><td>7 Overload, virtual links</td><td>Router drain aur backbone repair kaise karun?</td></tr>
<tr><td>8 Troubleshooting</td><td>Fault jaldi kaise dhoondhun?</td></tr>
<tr><td>9 Summary</td><td>Checklist, glossary, cheat sheet.</td></tr></table>

<h3>Lab devices jo aapko milenge</h3>
<p>Module ke labs chhoti Junos topologies use karte hain. Delhi lab mein R1, R2 aur R3 do areas mein OSPFv3 chalate hain. Chennai lab mein R1 se R4 ek square banate hain, head-office PC aur server LAN ke saath, aur R4 partner routes export karta hai. Hubli lab mein R1 se R4 areas 0, 1 aur 2 mein hain aur virtual link toota hua hai. Router IDs ka pattern 10.255.4.2 jaisa hai, links /30 networks jaise 10.4.12.0/30 hain.</p>

<div class="eg"><p><b>Worked example.</b> Chennai lab mein R1 server LAN 172.16.4.0/24 ko metric 3 aur do equal-cost next hops ke saath seekhta hai: R2 ke through 10.4.12.2 aur R3 ke through 10.4.13.2. R2 ko overload mein daalne ke baad R1 sirf R3 wala next hop dikhata hai, par R2 ke loopback 10.255.4.2 ka ping ab bhi chalta hai. Poora module aise results ko explain aur control karna sikhata hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> OSPF ko "on karo aur bhool jao" samajhna. Area boundaries, summaries aur policy tay karte hain ki har router kya jaanta hai. Plan ke bina routing tables badhte hain aur failures phailte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> OSPF area IDs IPv4 addresses jaise likhe jaate hain, backbone ke liye 0.0.0.0. Area 0 aur area 0.0.0.0 ek hi area hain. Router IDs aur area IDs alag cheezein hain, bhale dikhne mein ek jaisi hon.</p></div>

<div class="scn"><h4>Merger jisne orphan area bana diya</h4><p>Do companies ka merger hua. Naya Hubli site area 1 mein baithe ek branch router ke peeche jud gaya. Kisi ko yaad nahi tha ki har area ko area 0 chhoona chahiye. Hubli ke apne neighbours the par head office use reach nahi kar paa raha tha. Quick repair do ABRs ke beech virtual link tha; long-term plan areas ko renumber karna tha.</p><p><b>Lesson:</b> chalti adjacency ka matlab chalta design nahi. Area rules matter karte hain.</p></div>

<div class="iv"><p class="q">"OSPF ko backbone area kyun chahiye?"</p><p>Inter-area routing area 0 ke through summaries ka distance-vector-jaisa exchange use karti hai, jo areas ke beech loops rokta hai. Har non-backbone area ko area 0 se seedha ya virtual link ke through judna padta hai. ABRs backbone ke through areas ke beech routes summarise karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Yeh module JN0-650 ke OSPF objectives cover karta hai: areas, policy, OSPFv3, overload, virtual links, troubleshooting.</li>
<li>Details area ke andar rehti hain; summaries border paar karti hain; area 0 saare areas ko jodta hai.</li>
<li>ABRs areas ke beech baithte hain; ASBRs bahar ke routes laate hain.</li>
<li>Area IDs IPv4 addresses jaise dikhte hain; 0.0.0.0 backbone hai.</li>
<li>Har chapter concepts ko simulator labs ke output se jodta hai.</li>
</ul></div>
`}};export{e as default};