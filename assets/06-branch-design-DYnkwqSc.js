var e={id:`branch-design`,h:{en:`Branch design and interconnectivity: circuits, LTE, overlay and internet breakout`,hi:`Branch design aur interconnectivity: circuits, LTE, overlay aur internet breakout`},body:{en:`
<p>A <b>branch site</b> is where users, phones, cash registers and printers live. The exam asks for <b>branch and gateway configuration</b> and <b>interconnectivity</b>: how many devices, how many circuits, how the branch reaches other branches, the data center and the internet. This chapter gives you a small set of branch patterns and shows how to choose.</p>
<h3>Analogy: how many doors does the shop need?</h3>
<p>A shop with one door has a problem when the door jams. A shop with a front door and a back door is safer. A shop with two doors and two guards (two devices) keeps trading even when one guard goes home sick. Circuits are the doors, ION devices are the guards, and the cost grows with each one you add.</p>
<h3>Five branch patterns</h3>
<table class="cmp"><tr><th>Pattern</th><th>Devices and circuits</th><th>Survives</th><th>Typical site</th></tr>
<tr><td><b>A. Single ION, one internet</b></td><td>1 ION, 1 circuit</td><td>Nothing</td><td>Lab, very small, low-risk</td></tr>
<tr><td><b>B. Single ION, two circuits</b></td><td>1 ION, internet + internet (or internet + MPLS)</td><td>One circuit failure or brownout</td><td>Most branches</td></tr>
<tr><td><b>C. Single ION with LTE or 5G</b></td><td>1 ION with a cellular variant or external modem, plus one wired circuit</td><td>Wired circuit failure</td><td>Small shops, kiosks, temporary sites</td></tr>
<tr><td><b>D. Dual ION (HA)</b></td><td>2 IONs in an HA group, circuits shared between them</td><td>Device failure and circuit failure</td><td>Stores, payment sites, regional offices</td></tr>
<tr><td><b>E. Dual ION, multiple circuits and bypass</b></td><td>2 IONs with bypass pairs, 3 or more circuits</td><td>Power loss, device, circuit</td><td>Large branches, critical sites</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Branch patterns">
<rect x="10" y="20" width="190" height="210" rx="10" fill="#bae6fd"/><text x="105" y="44" text-anchor="middle" class="svg-ink" font-size="13">B: one ION, two circuits</text>
<rect x="60" y="100" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="105" y="125" text-anchor="middle" class="svg-ink" font-size="12">ION</text>
<text x="105" y="70" text-anchor="middle" class="svg-muted" font-size="11">Internet-A   MPLS</text>
<line x1="80" y1="100" x2="80" y2="75" stroke="#64748b" stroke-width="2"/><line x1="130" y1="100" x2="130" y2="75" stroke="#64748b" stroke-width="2"/>
<line x1="105" y1="140" x2="105" y2="185" stroke="#64748b" stroke-width="2"/><text x="105" y="205" text-anchor="middle" class="svg-muted" font-size="11">LAN</text>
<rect x="225" y="20" width="190" height="210" rx="10" fill="#bbf7d0"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">C: one ION + LTE</text>
<rect x="275" y="100" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="12">ION cell</text>
<text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="11">Fibre        LTE/5G</text>
<line x1="295" y1="100" x2="295" y2="75" stroke="#64748b" stroke-width="2"/><line x1="345" y1="100" x2="345" y2="75" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="140" x2="320" y2="185" stroke="#64748b" stroke-width="2"/><text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="11">LAN</text>
<rect x="440" y="20" width="190" height="210" rx="10" fill="#fde68a"/><text x="535" y="44" text-anchor="middle" class="svg-ink" font-size="13">D: dual ION (HA)</text>
<rect x="455" y="100" width="75" height="40" rx="8" fill="#ddd6fe"/><text x="492" y="125" text-anchor="middle" class="svg-ink" font-size="12">ION 1</text>
<rect x="545" y="100" width="75" height="40" rx="8" fill="#ddd6fe"/><text x="582" y="125" text-anchor="middle" class="svg-ink" font-size="12">ION 2</text>
<line x1="530" y1="120" x2="545" y2="120" stroke="#d97706" stroke-width="2" stroke-dasharray="4 3"/>
<text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="11">Internet-A  Internet-B  MPLS</text>
<line x1="492" y1="140" x2="535" y2="185" stroke="#64748b" stroke-width="2"/><line x1="582" y1="140" x2="535" y2="185" stroke="#64748b" stroke-width="2"/><text x="535" y="205" text-anchor="middle" class="svg-muted" font-size="11">LAN (switch)</text>
</svg><p class="cap">Three of the five patterns. The dotted line between the two IONs in pattern D is the HA relationship (chapter 7).</p></div>
<h3>Choosing a pattern</h3>
<ol>
<li>Write the availability requirement in business terms (for example "the shop can lose 5 minutes of card payments per month").</li>
<li>If a single device failure is not acceptable, you need pattern D or E.</li>
<li>If only circuit failure is the risk, pattern B or C is enough and much cheaper.</li>
<li>Pick circuits from <b>different providers and different technologies</b> so that one event cannot take both down; an LTE or 5G circuit is the classic diverse backup.</li>
<li>Check licence and model: cellular variants for pattern C (the ION 1200 family has LTE and 5G variants in the datasheet I reviewed), bypass-capable models for pattern E.</li>
</ol>
<h3>Interconnectivity: how the branch reaches everything else</h3>
<p>The branch ION builds VPN tunnels over each circuit toward the data centers and the other sites. The path policy (psd-policy module) can steer traffic over three kinds of overlay, which the documentation lists when you define active, backup and Layer 3 failure paths: <b>Direct</b> (no tunnel, straight out of the circuit, used for internet breakout), <b>Prisma SD-WAN VPN</b> (the fabric tunnels between IONs) and <b>Standard VPN</b> (a standard IPsec tunnel to a third-party or cloud endpoint). Plan which of the three each traffic class will use:</p>
<table class="cmp"><tr><th>Destination</th><th>Overlay</th><th>Design note</th></tr>
<tr><td>Branch to data center</td><td>Prisma SD-WAN VPN</td><td>Over all circuits; the best path is chosen by policy</td></tr>
<tr><td>Branch to branch</td><td>Prisma SD-WAN VPN</td><td>Direct between branches or through the DC; decide by latency and by whether the DC must inspect</td></tr>
<tr><td>Branch to SaaS or internet</td><td>Direct, or a tunnel to a security service</td><td>Breakout at the branch, or backhaul, or cloud security</td></tr>
<tr><td>Branch to a partner or cloud network</td><td>Standard VPN</td><td>Third-party IPsec profile; see the Standard VPN documentation</td></tr></table>
<h3>Internet breakout options</h3>
<ul>
<li><b>Local breakout.</b> Internet traffic leaves the branch directly. Best performance for SaaS; the branch must protect itself with zone-based firewall rules and source NAT (chapter 8 and the policy module).</li>
<li><b>Backhaul to the data center.</b> Internet traffic travels through the fabric and leaves at the DC, where central security is. Adds latency and hub load (chapter 4).</li>
<li><b>Cloud security service.</b> Internet traffic goes in an IPsec tunnel to Prisma Access, as covered in the data center chapter and the SASE module.</li>
</ul>
<p>A mixed design is normal: trusted SaaS direct, everything else to the cloud security service, and sensitive internal flows through the fabric.</p>
<div class="eg"><p><b>Worked example: three Harbor Foods branches.</b></p>
<ul><li><b>SHOP-014 (small shop):</b> pattern C. Fibre 100 Mbps (198.51.100.10 as an example address) plus 5G backup. Voice and card payments prefer fibre, fall back to 5G; bulk traffic is blocked on 5G to avoid data charges.</li>
<li><b>STORE-007 (store):</b> pattern D. Two IONs, internet 500 Mbps from provider A, internet 300 Mbps from provider B, MPLS 100 Mbps. Payment traffic uses MPLS first, then internet; SaaS goes direct on internet A.</li>
<li><b>REGION-02 (regional office):</b> pattern E. Two IONs with bypass pairs, three circuits, LAN with guest, corporate and voice VLANs.</li></ul></div>
<div class="warn"><p><b>Common mistakes.</b> Counting two circuits from the same provider on the same building entry as diverse. Using LTE as a primary data path with no data-cap planning. Forgetting that an HA pair needs a LAN switch (the HA control interface must be on an external LAN switch, chapter 7). Designing breakout without NAT and zone rules.</p></div>
<div class="exam"><p><b>Exam trap.</b> The three overlay names: Direct, Prisma SD-WAN VPN and Standard VPN. "Direct" is not a tunnel. A question that says "traffic must reach an Azure virtual network gateway" points to a standard IPsec VPN, not to a fabric tunnel, because the far end is not an ION.</p></div>
<div class="scn"><h4>The shop with a single door</h4><p>A chain of 120 small shops ran pattern A on one broadband line each. When a fibre cut hit a district, 14 shops could not take card payments for six hours and the chain lost the day's sales there. The redesign moved to pattern C with a 5G variant and a path policy that sent only payments and voice over 5G during outages. The monthly cost per shop rose by the price of a data plan; the next outage cost nothing.</p><p><b>Lesson:</b> a cheap, diverse backup circuit is the best insurance for small sites.</p></div>
<div class="iv"><p class="q">"How would you design a branch that must never lose card payments?"</p><p>Two ION devices in HA so a device failure is survivable, at least two diverse circuits plus cellular, bypass pairs if power loss matters, payment traffic in its own zone with a path policy preferring the most stable circuit, and a performance policy that moves payment flows if the path degrades. I also confirm the licence covers the second device.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five branch patterns, from single ION and one circuit to dual ION with bypass and several circuits; choose by the availability requirement.</li>
<li>Diverse providers and technologies make backup real; cellular is a classic diverse backup.</li>
<li>Overlays: Direct, Prisma SD-WAN VPN, Standard VPN.</li>
<li>Breakout choices: local, backhaul, or cloud security service; each changes bandwidth and inspection.</li>
<li>An HA pair needs a LAN switch for the HA control interface.</li>
</ul></div>
`,hi:`
<p><b>Branch site</b> woh jagah hai jahan users, phones, cash registers aur printers rehte hain. Exam <b>branch and gateway configuration</b> aur <b>interconnectivity</b> poochta hai: kitne devices, kitne circuits, branch doosri branches, data center aur internet tak kaise pahunchti hai. Yeh chapter branch patterns ka chhota set deta hai aur dikhata hai ki kaise chunein.</p>
<h3>Analogy: shop ko kitne darwaze chahiye?</h3>
<p>Ek darwaze wali shop mein darwaza jam ho jaye to problem. Aage aur peeche ke darwaze wali shop zyada safe hai. Do darwaze aur do guards (do devices) wali shop tab bhi chalti rehti hai jab ek guard bimar ho kar ghar chala jaye. Circuits darwaze hain, ION devices guards hain, aur har ek ke saath cost badhti hai.</p>
<h3>Paanch branch patterns</h3>
<table class="cmp"><tr><th>Pattern</th><th>Devices aur circuits</th><th>Kya survive karta hai</th><th>Typical site</th></tr>
<tr><td><b>A. Single ION, ek internet</b></td><td>1 ION, 1 circuit</td><td>Kuch nahi</td><td>Lab, bahut chhoti, low-risk</td></tr>
<tr><td><b>B. Single ION, do circuits</b></td><td>1 ION, internet + internet (ya internet + MPLS)</td><td>Ek circuit failure ya brownout</td><td>Zyada tar branches</td></tr>
<tr><td><b>C. LTE ya 5G wala single ION</b></td><td>Cellular variant ya external modem wala 1 ION, plus ek wired circuit</td><td>Wired circuit failure</td><td>Chhoti shops, kiosks, temporary sites</td></tr>
<tr><td><b>D. Dual ION (HA)</b></td><td>HA group mein 2 IONs, circuits dono ke beech shared</td><td>Device failure aur circuit failure</td><td>Stores, payment sites, regional offices</td></tr>
<tr><td><b>E. Dual ION, multiple circuits aur bypass</b></td><td>Bypass pairs ke saath 2 IONs, 3 ya zyada circuits</td><td>Power loss, device, circuit</td><td>Bade branches, critical sites</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Branch patterns">
<rect x="10" y="20" width="190" height="210" rx="10" fill="#bae6fd"/><text x="105" y="44" text-anchor="middle" class="svg-ink" font-size="13">B: ek ION, do circuits</text>
<rect x="60" y="100" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="105" y="125" text-anchor="middle" class="svg-ink" font-size="12">ION</text>
<text x="105" y="70" text-anchor="middle" class="svg-muted" font-size="11">Internet-A   MPLS</text>
<line x1="80" y1="100" x2="80" y2="75" stroke="#64748b" stroke-width="2"/><line x1="130" y1="100" x2="130" y2="75" stroke="#64748b" stroke-width="2"/>
<line x1="105" y1="140" x2="105" y2="185" stroke="#64748b" stroke-width="2"/><text x="105" y="205" text-anchor="middle" class="svg-muted" font-size="11">LAN</text>
<rect x="225" y="20" width="190" height="210" rx="10" fill="#bbf7d0"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">C: ek ION + LTE</text>
<rect x="275" y="100" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="12">ION cell</text>
<text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="11">Fibre        LTE/5G</text>
<line x1="295" y1="100" x2="295" y2="75" stroke="#64748b" stroke-width="2"/><line x1="345" y1="100" x2="345" y2="75" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="140" x2="320" y2="185" stroke="#64748b" stroke-width="2"/><text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="11">LAN</text>
<rect x="440" y="20" width="190" height="210" rx="10" fill="#fde68a"/><text x="535" y="44" text-anchor="middle" class="svg-ink" font-size="13">D: dual ION (HA)</text>
<rect x="455" y="100" width="75" height="40" rx="8" fill="#ddd6fe"/><text x="492" y="125" text-anchor="middle" class="svg-ink" font-size="12">ION 1</text>
<rect x="545" y="100" width="75" height="40" rx="8" fill="#ddd6fe"/><text x="582" y="125" text-anchor="middle" class="svg-ink" font-size="12">ION 2</text>
<line x1="530" y1="120" x2="545" y2="120" stroke="#d97706" stroke-width="2" stroke-dasharray="4 3"/>
<text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="11">Internet-A  Internet-B  MPLS</text>
<line x1="492" y1="140" x2="535" y2="185" stroke="#64748b" stroke-width="2"/><line x1="582" y1="140" x2="535" y2="185" stroke="#64748b" stroke-width="2"/><text x="535" y="205" text-anchor="middle" class="svg-muted" font-size="11">LAN (switch)</text>
</svg><p class="cap">Paanch mein se teen patterns. Pattern D mein dono IONs ke beech dotted line HA relationship hai (chapter 7).</p></div>
<h3>Pattern kaise chunein</h3>
<ol>
<li>Availability requirement ko business terms mein likho (jaise "shop mahine mein 5 minute card payments khone ka risk utha sakti hai").</li>
<li>Agar single device failure acceptable nahi hai, to pattern D ya E chahiye.</li>
<li>Agar sirf circuit failure ka risk hai, to pattern B ya C kaafi hai aur bahut sasta hai.</li>
<li>Circuits <b>alag providers aur alag technologies</b> se chuno taaki ek event dono ko down na kar sake; LTE ya 5G circuit classic diverse backup hai.</li>
<li>Licence aur model check karo: pattern C ke liye cellular variants (jo datasheet maine dekhi usme ION 1200 family mein LTE aur 5G variants hain), pattern E ke liye bypass-capable models.</li>
</ol>
<h3>Interconnectivity: branch baaki sab tak kaise pahunchti hai</h3>
<p>Branch ION har circuit par data centers aur doosri sites ki taraf VPN tunnels banata hai. Path policy (psd-policy module) traffic ko teen tarah ke overlay par steer kar sakti hai, jo documentation tab list karti hai jab aap active, backup aur Layer 3 failure paths define karte ho: <b>Direct</b> (koi tunnel nahi, circuit se seedha bahar, internet breakout ke liye), <b>Prisma SD-WAN VPN</b> (IONs ke beech fabric tunnels) aur <b>Standard VPN</b> (third-party ya cloud endpoint tak standard IPsec tunnel). Plan karo ki har traffic class teeno mein se kaunsa use karegi:</p>
<table class="cmp"><tr><th>Destination</th><th>Overlay</th><th>Design note</th></tr>
<tr><td>Branch se data center</td><td>Prisma SD-WAN VPN</td><td>Saare circuits par; best path policy chunti hai</td></tr>
<tr><td>Branch se branch</td><td>Prisma SD-WAN VPN</td><td>Branches ke beech seedha ya DC ke through; latency se aur is baat se tay karo ki kya DC ko inspect karna hai</td></tr>
<tr><td>Branch se SaaS ya internet</td><td>Direct, ya security service tak tunnel</td><td>Branch par breakout, ya backhaul, ya cloud security</td></tr>
<tr><td>Branch se partner ya cloud network</td><td>Standard VPN</td><td>Third-party IPsec profile; Standard VPN documentation dekho</td></tr></table>
<h3>Internet breakout options</h3>
<ul>
<li><b>Local breakout.</b> Internet traffic branch se seedha nikalta hai. SaaS ke liye best performance; branch ko zone-based firewall rules aur source NAT se khud ko protect karna hota hai (chapter 8 aur policy module).</li>
<li><b>Data center tak backhaul.</b> Internet traffic fabric se guzarta hai aur DC par nikalta hai jahan central security hai. Latency aur hub load badhata hai (chapter 4).</li>
<li><b>Cloud security service.</b> Internet traffic IPsec tunnel mein Prisma Access ko jaata hai, jaisa data center chapter aur SASE module mein hai.</li>
</ul>
<p>Mixed design normal hai: trusted SaaS direct, baaki sab cloud security service ko, aur sensitive internal flows fabric se.</p>
<div class="eg"><p><b>Worked example: Harbor Foods ki teen branches.</b></p>
<ul><li><b>SHOP-014 (chhoti shop):</b> pattern C. Fibre 100 Mbps (198.51.100.10 example address) plus 5G backup. Voice aur card payments fibre prefer karte hain, 5G par fall back; data charges se bachne ke liye 5G par bulk traffic blocked.</li>
<li><b>STORE-007 (store):</b> pattern D. Do IONs, provider A se internet 500 Mbps, provider B se internet 300 Mbps, MPLS 100 Mbps. Payment traffic pehle MPLS, phir internet; SaaS internet A par direct.</li>
<li><b>REGION-02 (regional office):</b> pattern E. Bypass pairs ke saath do IONs, teen circuits, guest, corporate aur voice VLANs wala LAN.</li></ul></div>
<div class="warn"><p><b>Common galtiyan.</b> Ek hi provider ke do circuits jo ek hi building entry se aate hain unhe diverse ginna. LTE ko data-cap planning ke bina primary data path banana. Yeh bhool jaana ki HA pair ko LAN switch chahiye (HA control interface external LAN switch par honi chahiye, chapter 7). NAT aur zone rules ke bina breakout design karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Teen overlay naam: Direct, Prisma SD-WAN VPN aur Standard VPN. "Direct" tunnel nahi hai. "Traffic Azure virtual network gateway tak pahunchna chahiye" wala sawal standard IPsec VPN ki taraf ishara karta hai, fabric tunnel ki taraf nahi, kyunki doosra end ION nahi hai.</p></div>
<div class="scn"><h4>Ek darwaze wali shop</h4><p>120 chhoti shops ki chain har ek par ek broadband line ke saath pattern A chalati thi. Ek district mein fibre cut hua to 14 shops chhe ghante card payments nahi le sakin aur chain ne wahan din ki sales kho di. Redesign ne 5G variant ke saath pattern C apnaya aur path policy jo outage mein 5G par sirf payments aur voice bhejti hai. Har shop ka monthly cost data plan ki keemat se badha; agla outage free mein nikla.</p><p><b>Seekh:</b> sasta, diverse backup circuit chhoti sites ke liye sabse achha insurance hai.</p></div>
<div class="iv"><p class="q">"Aisi branch kaise design karoge jo card payments kabhi na khoye?"</p><p>HA mein do ION devices taaki device failure survivable ho, kam se kam do diverse circuits plus cellular, agar power loss matter karta hai to bypass pairs, payment traffic apne zone mein jiski path policy sabse stable circuit prefer kare, aur performance policy jo path degrade hone par payment flows ko move kare. Main yeh bhi confirm karta hoon ki licence doosre device ko cover karta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch branch patterns, single ION aur ek circuit se le kar bypass aur kai circuits wale dual ION tak; availability requirement se chuno.</li>
<li>Diverse providers aur technologies backup ko real banate hain; cellular classic diverse backup hai.</li>
<li>Overlays: Direct, Prisma SD-WAN VPN, Standard VPN.</li>
<li>Breakout choices: local, backhaul, ya cloud security service; har ek bandwidth aur inspection badalta hai.</li>
<li>HA pair ko HA control interface ke liye LAN switch chahiye.</li>
</ul></div>
`}};export{e as default};