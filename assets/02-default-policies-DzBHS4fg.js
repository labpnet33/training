var e={id:`defaults`,h:{en:`Default policies: what happens when you configure nothing`,hi:`Default policies: kuch configure na karo to kya hota hai`},body:{en:`
<p>Before you write any policy, you must know what the router does on its own. Every protocol has a built-in <b>default import policy</b> and a <b>default export policy</b>. They apply whenever you have not configured a policy, and they apply again at the very end of any policy chain that made no decision.</p>

<h3>Analogy: the house rules</h3>
<p>A building has house rules even if nobody pinned a notice: "visitors may enter, residents may not carry guests out at night." A custom policy is a notice that overrides or adds to the rules. If the notice says nothing about a case, the house rule applies. In Junos the house rule is the protocol default.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Default policy table in picture form">
<rect x="20" y="20" width="180" height="40" rx="6" fill="#e2e8f0"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="13">Protocol</text>
<rect x="210" y="20" width="200" height="40" rx="6" fill="#bae6fd"/><text x="310" y="45" text-anchor="middle" class="svg-ink" font-size="13">Default import</text>
<rect x="420" y="20" width="200" height="40" rx="6" fill="#fed7aa"/><text x="520" y="45" text-anchor="middle" class="svg-ink" font-size="13">Default export</text>
<rect x="20" y="68" width="180" height="40" rx="6" fill="#e2e8f0"/><text x="110" y="93" text-anchor="middle" class="svg-ink" font-size="13">OSPF</text>
<rect x="210" y="68" width="200" height="40" rx="6" fill="#bbf7d0"/><text x="310" y="93" text-anchor="middle" class="svg-ink" font-size="13">accept</text>
<rect x="420" y="68" width="200" height="40" rx="6" fill="#fecaca"/><text x="520" y="93" text-anchor="middle" class="svg-ink" font-size="13">reject</text>
<rect x="20" y="116" width="180" height="40" rx="6" fill="#e2e8f0"/><text x="110" y="141" text-anchor="middle" class="svg-ink" font-size="13">BGP</text>
<rect x="210" y="116" width="200" height="40" rx="6" fill="#bbf7d0"/><text x="310" y="141" text-anchor="middle" class="svg-ink" font-size="13">accept</text>
<rect x="420" y="116" width="200" height="40" rx="6" fill="#bbf7d0"/><text x="520" y="141" text-anchor="middle" class="svg-ink" font-size="12">accept active BGP only</text>
<rect x="20" y="164" width="180" height="40" rx="6" fill="#e2e8f0"/><text x="110" y="189" text-anchor="middle" class="svg-ink" font-size="13">RIP</text>
<rect x="210" y="164" width="200" height="40" rx="6" fill="#bbf7d0"/><text x="310" y="189" text-anchor="middle" class="svg-ink" font-size="13">accept</text>
<rect x="420" y="164" width="200" height="40" rx="6" fill="#fecaca"/><text x="520" y="189" text-anchor="middle" class="svg-ink" font-size="13">reject</text>
</svg><p class="cap">Green is accept, red is reject. Only BGP exports anything by default.</p></div>

<h3>The defaults, protocol by protocol</h3>
<table class="cmp"><tr><th>Protocol</th><th>Default import</th><th>Default export</th></tr>
<tr><td>OSPF and IS-IS</td><td>Accept all. Link-state data inside an area cannot be filtered on import. An import policy affects only external routes.</td><td>Reject everything. Only the router's own LSAs or LSPs are flooded.</td></tr>
<tr><td>BGP</td><td>Accept all received BGP routes</td><td>Accept all <b>active BGP</b> routes, nothing else</td></tr>
<tr><td>RIP</td><td>Accept all</td><td>Reject all</td></tr>
<tr><td>Direct and static</td><td colspan="2">These are not routing protocols. They reach neighbours only when some protocol exports them.</td></tr></table>

<h3>What this means in practice</h3>
<p>The OSPF export default surprises most beginners. You configure OSPF on the interfaces, adjacencies come up, and the neighbour learns the connected networks. Yet your static routes, and routes learned from another protocol, never appear. The reason is simple: the OSPF default export is reject. Only an export policy that accepts them will make OSPF originate them as <b>external</b> routes.</p>
<p>BGP is the opposite. A BGP router will happily re-advertise every BGP route it uses, with no extra configuration. That is why a BGP export policy is mostly used to <b>restrict</b> advertising, or to add static and direct routes that are not BGP routes.</p>

<div class="eg"><p><b>Worked example.</b> R1 has static routes 172.20.1.0/24, 172.20.2.0/24, 172.20.8.0/22 and 192.168.99.0/24. OSPF runs on ge-0/0/0.0 towards R2. On R2 you run:</p>
<pre class="out">lab@R2&gt; show route protocol ospf
inet.0: 5 destinations, 5 routes (5 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

10.44.255.1/32     *[OSPF/10] 00:00:30, metric 1
                    &gt;  to 10.44.12.1 via ge-0/0/0.0
224.0.0.5/32       *[OSPF/10] 00:00:30, metric 1
                       MultiRecv</pre>
<p>Only R1's loopback appears. The four statics are missing, which is the OSPF default export (reject) at work.</p></div>

<h3>Preference values: why 150 matters</h3>
<p>Every route has a <b>preference</b> (administrative distance in other vendors). Lower is better. Remember these values because they show in the square brackets of <code>show route</code>:</p>
<table class="cmp"><tr><th>Source</th><th>Preference</th></tr>
<tr><td>Direct</td><td>0</td></tr><tr><td>Static</td><td>5</td></tr><tr><td>OSPF internal</td><td>10</td></tr><tr><td>RIP</td><td>100</td></tr><tr><td>OSPF external</td><td>150</td></tr><tr><td>BGP</td><td>170</td></tr></table>
<p>When static routes are exported into OSPF they arrive on the neighbour as <code>[OSPF/150]</code>, never <code>[OSPF/10]</code>. Spotting 150 tells you instantly "this is an external route that came from an export policy".</p>

<div class="warn"><p><b>Common mistake.</b> Assuming OSPF "redistributes connected routes" automatically. It does not. Directly connected networks appear only if the interface itself runs OSPF (possibly passive), or if an export policy accepts <code>protocol direct</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> "What does the default BGP export policy advertise?" The answer is active BGP routes only. It does not include static, direct or OSPF routes. Another favourite is the OSPF default export: reject.</p></div>

<div class="scn"><h4>The missing statics</h4><p>A new branch router had OSPF running and showed a healthy adjacency with the core. The helpdesk could not reach a partner network that was reachable through a static route on that branch router. The engineer checked the static route (active), the adjacency (Full) and the partner link (up). Everything looked correct, yet the core had no route. Finally they ran <code>show route protocol ospf</code> on the core and saw only the loopback. The static route had never been exported. They wrote one export policy accepting the partner prefix and applied it to OSPF. The route appeared as OSPF/150 within seconds.</p><p><b>Lesson:</b> a healthy adjacency does not mean all routes are advertised. Check what the default export does.</p></div>

<div class="iv"><p class="q">"I configured OSPF and the neighbour is Full, but my static routes are not visible on the neighbour. Why?"</p><p>Strong answer: the OSPF default export policy rejects everything except OSPF's own link-state data, so static routes are never originated. Write an export policy that accepts the static routes (ideally restricted by route-filter) and apply it with set protocols ospf export. They then show up as external routes with preference 150.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every protocol has a default import and export policy that applies when nothing else decides.</li>
<li>OSPF, IS-IS and RIP export nothing by default; BGP exports active BGP routes only.</li>
<li>Static and direct routes need an export policy to enter a protocol.</li>
<li>Exported statics appear on neighbours as OSPF external, preference 150.</li>
<li>Know the preference table: direct 0, static 5, OSPF 10, RIP 100, OSPF external 150, BGP 170.</li>
</ul></div>
`,hi:`
<p>Koi bhi policy likhne se pehle aapko pata hona chahiye ki router apne aap kya karta hai. Har protocol ki ek built-in <b>default import policy</b> aur <b>default export policy</b> hoti hai. Yeh tab lagti hain jab aapne koi policy configure nahi ki, aur kisi bhi policy chain ke bilkul end par bhi lagti hain jisne koi decision nahi liya.</p>

<h3>Analogy: house rules</h3>
<p>Building ke house rules hote hain chahe kisi ne notice na lagaya ho: "visitors andar aa sakte hain, residents raat ko guests ko bahar nahi le ja sakte." Custom policy ek notice hai jo rules ko override ya add karti hai. Agar notice kisi case ke baare mein kuch nahi kehta to house rule lagta hai. Junos mein house rule protocol ka default hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Default policy table in picture form">
<rect x="20" y="20" width="180" height="40" rx="6" fill="#e2e8f0"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="13">Protocol</text>
<rect x="210" y="20" width="200" height="40" rx="6" fill="#bae6fd"/><text x="310" y="45" text-anchor="middle" class="svg-ink" font-size="13">Default import</text>
<rect x="420" y="20" width="200" height="40" rx="6" fill="#fed7aa"/><text x="520" y="45" text-anchor="middle" class="svg-ink" font-size="13">Default export</text>
<rect x="20" y="68" width="180" height="40" rx="6" fill="#e2e8f0"/><text x="110" y="93" text-anchor="middle" class="svg-ink" font-size="13">OSPF</text>
<rect x="210" y="68" width="200" height="40" rx="6" fill="#bbf7d0"/><text x="310" y="93" text-anchor="middle" class="svg-ink" font-size="13">accept</text>
<rect x="420" y="68" width="200" height="40" rx="6" fill="#fecaca"/><text x="520" y="93" text-anchor="middle" class="svg-ink" font-size="13">reject</text>
<rect x="20" y="116" width="180" height="40" rx="6" fill="#e2e8f0"/><text x="110" y="141" text-anchor="middle" class="svg-ink" font-size="13">BGP</text>
<rect x="210" y="116" width="200" height="40" rx="6" fill="#bbf7d0"/><text x="310" y="141" text-anchor="middle" class="svg-ink" font-size="13">accept</text>
<rect x="420" y="116" width="200" height="40" rx="6" fill="#bbf7d0"/><text x="520" y="141" text-anchor="middle" class="svg-ink" font-size="12">sirf active BGP accept</text>
<rect x="20" y="164" width="180" height="40" rx="6" fill="#e2e8f0"/><text x="110" y="189" text-anchor="middle" class="svg-ink" font-size="13">RIP</text>
<rect x="210" y="164" width="200" height="40" rx="6" fill="#bbf7d0"/><text x="310" y="189" text-anchor="middle" class="svg-ink" font-size="13">accept</text>
<rect x="420" y="164" width="200" height="40" rx="6" fill="#fecaca"/><text x="520" y="189" text-anchor="middle" class="svg-ink" font-size="13">reject</text>
</svg><p class="cap">Green accept hai, red reject. Default mein sirf BGP kuch export karta hai.</p></div>

<h3>Protocol-by-protocol defaults</h3>
<table class="cmp"><tr><th>Protocol</th><th>Default import</th><th>Default export</th></tr>
<tr><td>OSPF aur IS-IS</td><td>Sab accept. Area ke andar link-state data import par filter nahi hota. Import policy sirf external routes par asar karti hai.</td><td>Sab reject. Sirf router ke apne LSAs ya LSPs flood hote hain.</td></tr>
<tr><td>BGP</td><td>Received saare BGP routes accept</td><td>Saare <b>active BGP</b> routes accept, aur kuch nahi</td></tr>
<tr><td>RIP</td><td>Sab accept</td><td>Sab reject</td></tr>
<tr><td>Direct aur static</td><td colspan="2">Yeh routing protocols nahi hain. Neighbours tak tabhi pahunchte hain jab koi protocol inhe export kare.</td></tr></table>

<h3>Practice mein iska matlab</h3>
<p>OSPF ka default export beginners ko surprise karta hai. Aap interfaces par OSPF configure karte ho, adjacencies up ho jaati hain, neighbour connected networks seekh leta hai. Phir bhi aapke static routes, aur doosre protocol se seekhe routes, kabhi nahi dikhte. Wajah simple hai: OSPF ka default export reject hai. Sirf woh export policy jo unhe accept kare, OSPF ko unhe <b>external</b> routes ke roop mein originate karwati hai.</p>
<p>BGP ulta hai. BGP router bina extra configuration ke har BGP route re-advertise kar deta hai jo woh use karta hai. Isliye BGP export policy zyadatar advertising ko <b>restrict</b> karne ke liye, ya static aur direct routes (jo BGP routes nahi hain) add karne ke liye use hoti hai.</p>

<div class="eg"><p><b>Worked example.</b> R1 par static routes 172.20.1.0/24, 172.20.2.0/24, 172.20.8.0/22 aur 192.168.99.0/24 hain. OSPF ge-0/0/0.0 par R2 ki taraf chal raha hai. R2 par aap chalate ho:</p>
<pre class="out">lab@R2&gt; show route protocol ospf
inet.0: 5 destinations, 5 routes (5 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

10.44.255.1/32     *[OSPF/10] 00:00:30, metric 1
                    &gt;  to 10.44.12.1 via ge-0/0/0.0
224.0.0.5/32       *[OSPF/10] 00:00:30, metric 1
                       MultiRecv</pre>
<p>Sirf R1 ka loopback dikhta hai. Chaaron statics gayab hain, yeh OSPF ke default export (reject) ka kaam hai.</p></div>

<h3>Preference values: 150 kyun important hai</h3>
<p>Har route ki ek <b>preference</b> hoti hai (doosre vendors mein administrative distance). Kam better hota hai. Yeh values yaad rakho kyunki yeh <code>show route</code> ke square brackets mein dikhti hain:</p>
<table class="cmp"><tr><th>Source</th><th>Preference</th></tr>
<tr><td>Direct</td><td>0</td></tr><tr><td>Static</td><td>5</td></tr><tr><td>OSPF internal</td><td>10</td></tr><tr><td>RIP</td><td>100</td></tr><tr><td>OSPF external</td><td>150</td></tr><tr><td>BGP</td><td>170</td></tr></table>
<p>Jab static routes OSPF mein export hote hain to neighbour par woh <code>[OSPF/150]</code> ke roop mein aate hain, kabhi <code>[OSPF/10]</code> nahi. 150 dekhte hi samajh jao: "yeh external route hai jo export policy se aaya".</p>

<div class="warn"><p><b>Common mistake.</b> Yeh maan lena ki OSPF apne aap "connected routes redistribute" karta hai. Aisa nahi hai. Directly connected networks tabhi dikhte hain jab interface khud OSPF chalaye (passive bhi chalega), ya export policy <code>protocol direct</code> accept kare.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Default BGP export policy kya advertise karti hai?" Jawab: sirf active BGP routes. Static, direct ya OSPF routes nahi. Ek aur favourite: OSPF ka default export reject hai.</p></div>

<div class="scn"><h4>Gayab statics</h4><p>Ek naye branch router par OSPF chal raha tha aur core ke saath adjacency healthy thi. Helpdesk us partner network tak nahi pahunch pa raha tha jo branch router ke static route se reachable thi. Engineer ne static route (active), adjacency (Full) aur partner link (up) check kiye. Sab theek dikha, phir bhi core ke paas route nahi tha. Aakhir mein core par <code>show route protocol ospf</code> chalaya to sirf loopback dikha. Static route kabhi export hua hi nahi tha. Ek export policy likhi jo partner prefix accept kare aur OSPF par apply ki. Route kuch seconds mein OSPF/150 ke roop mein aa gaya.</p><p><b>Lesson:</b> healthy adjacency ka matlab yeh nahi ki saare routes advertise ho rahe hain. Default export kya karta hai, yeh check karo.</p></div>

<div class="iv"><p class="q">"Maine OSPF configure kiya aur neighbour Full hai, lekin mere static routes neighbour par nahi dikhte. Kyun?"</p><p>Strong answer: OSPF ki default export policy OSPF ke apne link-state data ke alawa sab reject karti hai, isliye static routes kabhi originate nahi hote. Aisi export policy likho jo static routes accept kare (behtar hai route-filter se restrict karke) aur set protocols ospf export se apply karo. Phir woh external routes ke roop mein preference 150 ke saath dikhte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har protocol ki default import aur export policy hoti hai jo tab lagti hai jab aur kuch decide na kare.</li>
<li>OSPF, IS-IS aur RIP default mein kuch export nahi karte; BGP sirf active BGP routes export karta hai.</li>
<li>Static aur direct routes ko protocol mein jaane ke liye export policy chahiye.</li>
<li>Exported statics neighbours par OSPF external, preference 150 ke roop mein dikhte hain.</li>
<li>Preference table yaad rakho: direct 0, static 5, OSPF 10, RIP 100, OSPF external 150, BGP 170.</li>
</ul></div>
`}};export{e as default};