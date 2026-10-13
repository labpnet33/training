var e={id:`lsa-types`,h:{en:`LSA types 1 to 5 in plain language`,hi:`LSA types 1 se 5 saral bhasha mein`},body:{en:`
<p>Imagine a company newsletter system. Each department writes a detailed report about its own floor (types 1 and 2). The department head's office compresses it into a one-line headline for the other floors (type 3). If a department deals with an outside vendor, one more notice says 'this person is the vendor contact' (type 4), and the vendor's own price list goes to everyone, floor by floor, unchanged (type 5). OSPF uses <b>Link-State Advertisements (LSAs)</b> in exactly this way. Types 1 and 2 you met in the single-area module; here you add 3, 4 and 5 and see what the ABR does to each.</p>

<h3>The five types you must know</h3>
<div class="tbl"><table>
<tr><th>Type</th><th>Name</th><th>Originated by</th><th>Flooded</th><th>Carries</th></tr>
<tr><td><b>1</b></td><td>Router LSA</td><td>Every router</td><td>Inside its own area only</td><td>The router's links in that area and their costs</td></tr>
<tr><td><b>2</b></td><td>Network LSA</td><td>The DR of a broadcast segment</td><td>Inside its own area only</td><td>The routers attached to that segment</td></tr>
<tr><td><b>3</b></td><td>Summary LSA (network)</td><td>An ABR</td><td>Into another area, regenerated at every ABR</td><td>One prefix from another area and its cost</td></tr>
<tr><td><b>4</b></td><td>ASBR summary LSA</td><td>An ABR</td><td>Into another area</td><td>How to reach an ASBR (its router ID and the cost to it)</td></tr>
<tr><td><b>5</b></td><td>AS external LSA</td><td>An ASBR</td><td>Whole OSPF domain, unchanged</td><td>One external prefix and its metric</td></tr>
</table></div>
<p>The pattern is easy to remember. Types 1 and 2 describe <b>topology</b> and never cross an area border. Types 3 and 4 are <b>made by ABRs</b> to describe what lies beyond the border. Type 5 is made by the <b>ASBR</b> and is the only one that travels everywhere. (Type 7 belongs to NSSA areas and is part of CCNP.)</p>

<div class="dia"><svg viewBox="0 0 680 230" role="img" aria-label="Where each LSA type is created and flooded across area 1, the ABR and area 0">
<rect x="20" y="30" width="250" height="150" rx="12" fill="#ddd6fe" opacity="0.6" stroke="#64748b"/><text x="145" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 1</text>
<rect x="410" y="30" width="250" height="150" rx="12" fill="#bae6fd" opacity="0.6" stroke="#64748b"/><text x="535" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 0</text>
<rect x="290" y="70" width="100" height="70" rx="10" fill="#fff" stroke="#64748b" stroke-width="2"/><text x="340" y="100" text-anchor="middle" class="svg-ink" font-size="13">ABR R2</text><text x="340" y="118" text-anchor="middle" class="svg-muted" font-size="10">types 3 and 4</text>
<text x="145" y="90" text-anchor="middle" class="svg-ink" font-size="12">Type 1 from R1, R2</text><text x="145" y="110" text-anchor="middle" class="svg-ink" font-size="12">Type 2 from the DR</text><text x="145" y="135" text-anchor="middle" class="svg-muted" font-size="11">stay in area 1</text>
<text x="535" y="90" text-anchor="middle" class="svg-ink" font-size="12">Type 1 from R2, R3</text><text x="535" y="110" text-anchor="middle" class="svg-ink" font-size="12">Type 2 from the DR</text><text x="535" y="135" text-anchor="middle" class="svg-muted" font-size="11">stay in area 0</text>
<text x="535" y="160" text-anchor="middle" class="svg-accent" font-size="12">Type 5 from ASBR R3</text>
<line x1="270" y1="105" x2="290" y2="105" stroke="#64748b" stroke-width="2"/><line x1="390" y1="105" x2="410" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="340" y="205" text-anchor="middle" class="svg-accent" font-size="12">Type 5 crosses the ABR unchanged; type 4 tells area 1 where the ASBR is</text>
</svg><p class="cap">Detail (types 1, 2) stays local, summaries (3, 4) are rebuilt at each ABR, externals (5) flood everywhere.</p></div>

<h3>What the ABR actually does</h3>
<ul>
<li><b>Type 3:</b> for every intra-area route in area 1, R2 creates a type 3 LSA in area 0 (and for every area 0 route, one in area 1). The type 3 contains only the prefix, mask and cost. The sender's identity is the ABR, so area 0 routers no longer know which router in area 1 owns the prefix.</li>
<li><b>Type 4:</b> when a type 5 LSA reaches an area, routers in that area must be able to reach the advertising ASBR. If the ASBR is in a different area, the ABR creates a type 4 LSA so that routers in the area can find the ASBR's address. No type 4 means the external route cannot be used.</li>
<li><b>Type 5:</b> the ABR floods it onward without change; the advertising router stays the ASBR.</li>
</ul>

<h3>Read it in the database</h3>
<p>This is R1 (area 1), as printed by the simulator in our reference network, with R3 originating a default route:</p>
<pre class="out">R1# show ip ospf database

            OSPF Router with ID (1.1.1.1) (Process ID 1)

		Router Link States (Area 1)

Link ID         ADV Router      Age         Seq#       Checksum Link count
1.1.1.1         1.1.1.1         60          0x80000001 0x0057B8 5
2.2.2.2         2.2.2.2         60          0x80000001 0x004E45 1

		Net Link States (Area 1)

Link ID         ADV Router      Age         Seq#       Checksum
10.0.12.2       2.2.2.2         60          0x80000001 0x00D1B4

		Summary Net Link States (Area 1)

Link ID         ADV Router      Age         Seq#       Checksum
<span class="hl">2.2.2.2         2.2.2.2         60          0x80000001 0x008D57</span>
<span class="hl">3.3.3.3         2.2.2.2         60          0x80000001 0x006F79</span>
<span class="hl">10.0.23.0       2.2.2.2         60          0x80000001 0x0019CE</span>

		Summary ASB Link States (Area 1)

Link ID         ADV Router      Age         Seq#       Checksum
<span class="hl">3.3.3.3         2.2.2.2         60          0x80000001 0x008C15</span>

		Type-5 AS External Link States

Link ID         ADV Router      Age         Seq#       Checksum Tag
<span class="hl">0.0.0.0         3.3.3.3         60          0x80000001 0x00B8BC 0</span></pre>
<p>Read it top down. Router Link States are type 1 and Net Link States are type 2: they list only routers and the segment of area 1, nothing from area 0. <b>Summary Net Link States</b> are type 3: three prefixes from area 0, all advertised by 2.2.2.2, the ABR. <b>Summary ASB Link States</b> are type 4: the ABR tells area 1 how to find ASBR 3.3.3.3. The <b>Type-5 AS External</b> section shows the default route 0.0.0.0, still advertised by 3.3.3.3 (the ASBR), not by the ABR. Note that the type 5 section has no 'Area' label: it belongs to the whole OSPF domain.</p>
<p>To see the detail of one type, add its keyword:</p>
<pre class="out">R1# show ip ospf database asbr-summary

            OSPF Router with ID (1.1.1.1) (Process ID 1)

		Summary ASB Link States (Area 1)

  LS age: 60
  Options: (No TOS-capability, DC, Upward)
  LS Type: Summary Links(AS Boundary Router)
  Link State ID: 3.3.3.3 (AS Boundary Router address)
  Advertising Router: 2.2.2.2
  LS Seq Number: 80000001
  Checksum: 0x8C15
  Length: 28
  Network Mask: /0
        MTID: 0         Metric: 1</pre>
<p>Read the lines with care: Link State ID is the <b>ASBR being described</b> (3.3.3.3), and Advertising Router is the <b>ABR</b> that wrote the LSA (2.2.2.2).</p>

<div class="eg"><p><b>Worked example.</b> Trace the default route. R3 has a static default to the ISP and <code>default-information originate</code>, so R3 creates a type 5 LSA with ID 0.0.0.0, advertised by 3.3.3.3. It floods to R2 in area 0. R2 passes the type 5 into area 1 untouched, and also creates a type 4 for 3.3.3.3 in area 1. R1 now has the two pieces it needs: the external route (type 5) and a way to reach the advertising router (type 4, then type 3 or 1 for the path to the ABR). R1 installs 0.0.0.0/0 as O*E2.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reading the Advertising Router of a type 3 LSA as the owner of the prefix. It is the ABR, and the ABR is also the next hop for routers in the area. Another mistake is expecting to see area 0 router LSAs on a router in area 1: you never will. And for type 5 LSAs, expecting an area number: externals belong to the domain, not to an area.</p></div>

<div class="exam"><p><b>Exam traps.</b> Types 1 and 2 stay inside the area. Type 3 is made by ABRs; type 4 describes an ASBR and is made by ABRs; type 5 is made by ASBRs and floods the whole domain. A type 3 hides the topology behind it: only prefix and cost are carried. Remember the sequence 1 router, 2 network, 3 summary, 4 ASBR summary, 5 external.</p></div>

<div class="scn"><h4>The default route that nobody used</h4><p>A bank branch in area 5 had a default route showing in <code>show ip ospf database external</code>, but <code>show ip route</code> had no gateway of last resort. The ASBR was in the data centre in area 0. The type 5 LSA was there, but there was no type 4 for the ASBR in the branch's database, because the ABR had been mis-configured and was no longer a working ABR. Once the ABR was fixed, the type 4 appeared and the default route entered the table.</p><p><b>Lesson:</b> a type 5 is useless unless the router can reach the ASBR: check for the type 4 (or an intra-area path).</p></div>

<div class="iv"><p class="q">'What are LSA types 3, 4 and 5, and who creates them?'</p><p>Strong answer: type 3 is the summary LSA, created by an ABR to tell another area about a prefix and its cost. Type 4 is created by an ABR to tell an area how to reach an ASBR that lives in a different area. Type 5 is created by the ASBR for each external prefix and is flooded unchanged across the whole domain. Types 1 and 2 never leave their area.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Type 1 router and type 2 network LSAs describe topology and stay in their area.</li>
<li>ABRs create type 3 (prefixes with cost) and type 4 (path to an ASBR) when crossing areas.</li>
<li>ASBRs create type 5 externals, which flood the entire domain without change.</li>
<li>In <code>show ip ospf database</code>, the Advertising Router of a type 3 is the ABR, and the Link State ID of a type 4 is the ASBR.</li>
</ul></div>
`,hi:`
<p>Ek company newsletter system socho. Har department apni floor ki detailed report likhta hai (types 1 aur 2). Department head ka office use compress karke dusre floors ke liye ek line ki headline banata hai (type 3). Agar koi department bahar ke vendor se deal karta hai, to ek aur notice kehta hai 'yeh banda vendor contact hai' (type 4), aur vendor ki apni price list sabko, floor-floor, bina badle jaati hai (type 5). OSPF <b>Link-State Advertisements (LSAs)</b> ko bilkul aise hi use karta hai. Types 1 aur 2 aap single-area module mein mil chuke ho; yahan 3, 4 aur 5 jodte hain aur dekhte hain ki ABR har ek ke saath kya karta hai.</p>

<h3>Paanch types jo aapko aane chahiye</h3>
<div class="tbl"><table>
<tr><th>Type</th><th>Naam</th><th>Kaun banata hai</th><th>Flood kahan tak</th><th>Kya le jaata hai</th></tr>
<tr><td><b>1</b></td><td>Router LSA</td><td>Har router</td><td>Sirf apne area ke andar</td><td>Us area mein router ke links aur unki cost</td></tr>
<tr><td><b>2</b></td><td>Network LSA</td><td>Broadcast segment ka DR</td><td>Sirf apne area ke andar</td><td>Us segment se jude routers</td></tr>
<tr><td><b>3</b></td><td>Summary LSA (network)</td><td>ABR</td><td>Dusre area mein, har ABR par dobara bana kar</td><td>Dusre area ka ek prefix aur uski cost</td></tr>
<tr><td><b>4</b></td><td>ASBR summary LSA</td><td>ABR</td><td>Dusre area mein</td><td>ASBR tak kaise pahunchen (router ID aur cost)</td></tr>
<tr><td><b>5</b></td><td>AS external LSA</td><td>ASBR</td><td>Poora OSPF domain, bina badle</td><td>Ek external prefix aur uska metric</td></tr>
</table></div>
<p>Pattern yaad rakhna aasaan hai. Types 1 aur 2 <b>topology</b> batate hain aur area border kabhi paar nahi karte. Types 3 aur 4 <b>ABRs banate hain</b> yeh batane ke liye ki border ke us paar kya hai. Type 5 <b>ASBR</b> banata hai aur akela hai jo har jagah jaata hai. (Type 7 NSSA areas ka hai aur CCNP ka hissa hai.)</p>

<div class="dia"><svg viewBox="0 0 680 230" role="img" aria-label="Area 1, ABR aur area 0 mein har LSA type kahan banta aur flood hota hai">
<rect x="20" y="30" width="250" height="150" rx="12" fill="#ddd6fe" opacity="0.6" stroke="#64748b"/><text x="145" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 1</text>
<rect x="410" y="30" width="250" height="150" rx="12" fill="#bae6fd" opacity="0.6" stroke="#64748b"/><text x="535" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 0</text>
<rect x="290" y="70" width="100" height="70" rx="10" fill="#fff" stroke="#64748b" stroke-width="2"/><text x="340" y="100" text-anchor="middle" class="svg-ink" font-size="13">ABR R2</text><text x="340" y="118" text-anchor="middle" class="svg-muted" font-size="10">types 3 aur 4</text>
<text x="145" y="90" text-anchor="middle" class="svg-ink" font-size="12">Type 1: R1, R2 se</text><text x="145" y="110" text-anchor="middle" class="svg-ink" font-size="12">Type 2: DR se</text><text x="145" y="135" text-anchor="middle" class="svg-muted" font-size="11">area 1 mein hi rehte hain</text>
<text x="535" y="90" text-anchor="middle" class="svg-ink" font-size="12">Type 1: R2, R3 se</text><text x="535" y="110" text-anchor="middle" class="svg-ink" font-size="12">Type 2: DR se</text><text x="535" y="135" text-anchor="middle" class="svg-muted" font-size="11">area 0 mein hi rehte hain</text>
<text x="535" y="160" text-anchor="middle" class="svg-accent" font-size="12">Type 5: ASBR R3 se</text>
<line x1="270" y1="105" x2="290" y2="105" stroke="#64748b" stroke-width="2"/><line x1="390" y1="105" x2="410" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="340" y="205" text-anchor="middle" class="svg-accent" font-size="12">Type 5 ABR se bina badle guzarta hai; type 4 area 1 ko ASBR ka pata deta hai</text>
</svg><p class="cap">Detail (types 1, 2) local rehti hai, summaries (3, 4) har ABR par dobara banti hain, externals (5) har jagah flood hote hain.</p></div>

<h3>ABR asal mein kya karta hai</h3>
<ul>
<li><b>Type 3:</b> area 1 ke har intra-area route ke liye R2 area 0 mein ek type 3 LSA banata hai (aur area 0 ke har route ke liye area 1 mein ek). Type 3 mein sirf prefix, mask aur cost hota hai. Bhejne wala ABR hota hai, isliye area 0 ke routers ko nahi pata ki area 1 mein prefix kis router ka hai.</li>
<li><b>Type 4:</b> jab type 5 LSA kisi area mein pahunchta hai, us area ke routers ko advertising ASBR tak pahunchne ka tareeka pata hona chahiye. Agar ASBR dusre area mein hai, to ABR type 4 LSA banata hai taaki area ke routers ASBR ka address dhundh sakein. Type 4 nahi to external route use nahi ho sakta.</li>
<li><b>Type 5:</b> ABR ise bina badle aage flood kar deta hai; advertising router ASBR hi rehta hai.</li>
</ul>

<h3>Database mein padho</h3>
<p>Yeh R1 (area 1) hai, hamare reference network mein simulator ke print kiye hue, jahan R3 default route originate kar raha hai:</p>
<pre class="out">R1# show ip ospf database

            OSPF Router with ID (1.1.1.1) (Process ID 1)

		Router Link States (Area 1)

Link ID         ADV Router      Age         Seq#       Checksum Link count
1.1.1.1         1.1.1.1         60          0x80000001 0x0057B8 5
2.2.2.2         2.2.2.2         60          0x80000001 0x004E45 1

		Net Link States (Area 1)

Link ID         ADV Router      Age         Seq#       Checksum
10.0.12.2       2.2.2.2         60          0x80000001 0x00D1B4

		Summary Net Link States (Area 1)

Link ID         ADV Router      Age         Seq#       Checksum
<span class="hl">2.2.2.2         2.2.2.2         60          0x80000001 0x008D57</span>
<span class="hl">3.3.3.3         2.2.2.2         60          0x80000001 0x006F79</span>
<span class="hl">10.0.23.0       2.2.2.2         60          0x80000001 0x0019CE</span>

		Summary ASB Link States (Area 1)

Link ID         ADV Router      Age         Seq#       Checksum
<span class="hl">3.3.3.3         2.2.2.2         60          0x80000001 0x008C15</span>

		Type-5 AS External Link States

Link ID         ADV Router      Age         Seq#       Checksum Tag
<span class="hl">0.0.0.0         3.3.3.3         60          0x80000001 0x00B8BC 0</span></pre>
<p>Upar se neeche padho. Router Link States type 1 hain aur Net Link States type 2: inme sirf area 1 ke routers aur segment hain, area 0 ka kuch nahi. <b>Summary Net Link States</b> type 3 hain: area 0 ke teen prefixes, sab 2.2.2.2 ne advertise kiye, jo ABR hai. <b>Summary ASB Link States</b> type 4 hain: ABR area 1 ko bata raha hai ki ASBR 3.3.3.3 kaise milega. <b>Type-5 AS External</b> section default route 0.0.0.0 dikhata hai, jo ab bhi 3.3.3.3 (ASBR) ne advertise kiya hai, ABR ne nahi. Dhyan do, type 5 section par 'Area' label nahi hai: woh poore OSPF domain ka hai.</p>
<p>Ek type ki detail dekhne ke liye uska keyword jodo:</p>
<pre class="out">R1# show ip ospf database asbr-summary

            OSPF Router with ID (1.1.1.1) (Process ID 1)

		Summary ASB Link States (Area 1)

  LS age: 60
  Options: (No TOS-capability, DC, Upward)
  LS Type: Summary Links(AS Boundary Router)
  Link State ID: 3.3.3.3 (AS Boundary Router address)
  Advertising Router: 2.2.2.2
  LS Seq Number: 80000001
  Checksum: 0x8C15
  Length: 28
  Network Mask: /0
        MTID: 0         Metric: 1</pre>
<p>Lines dhyan se padho: Link State ID <b>jis ASBR ke baare mein hai</b> woh hai (3.3.3.3), aur Advertising Router woh <b>ABR</b> hai jisne LSA likha (2.2.2.2).</p>

<div class="eg"><p><b>Worked example.</b> Default route trace karo. R3 ke paas ISP ki taraf static default hai aur <code>default-information originate</code>, isliye R3 ID 0.0.0.0 ke saath type 5 LSA banata hai, advertised by 3.3.3.3. Woh area 0 mein R2 tak flood hota hai. R2 type 5 ko area 1 mein bina chhede aage bhejta hai, aur area 1 mein 3.3.3.3 ke liye ek type 4 bhi banata hai. R1 ke paas ab dono cheezein hain: external route (type 5) aur advertising router tak pahunchne ka tareeka (type 4, phir ABR tak path ke liye type 3 ya 1). R1 0.0.0.0/0 ko O*E2 ke roop mein install karta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Type 3 LSA ke Advertising Router ko prefix ka maalik samajhna. Woh ABR hai, aur area ke routers ke liye next hop bhi ABR hi hai. Ek aur galti: area 1 ke router par area 0 ke router LSAs dekhne ki ummeed rakhna: woh kabhi nahi dikhenge. Aur type 5 LSAs ke liye area number ki ummeed: externals domain ke hote hain, kisi area ke nahi.</p></div>

<div class="exam"><p><b>Exam traps.</b> Types 1 aur 2 area ke andar rehte hain. Type 3 ABRs banate hain; type 4 ASBR ko describe karta hai aur ABRs banate hain; type 5 ASBRs banate hain aur poora domain flood karta hai. Type 3 apne peeche ki topology chhupata hai: sirf prefix aur cost jaata hai. Sequence yaad rakho: 1 router, 2 network, 3 summary, 4 ASBR summary, 5 external.</p></div>

<div class="scn"><h4>Woh default route jo kisi ne use nahi kiya</h4><p>Area 5 ke ek bank branch mein <code>show ip ospf database external</code> mein default route dikh raha tha, lekin <code>show ip route</code> mein gateway of last resort nahi tha. ASBR data centre mein area 0 mein tha. Type 5 LSA maujood tha, lekin branch ke database mein ASBR ka type 4 nahi tha, kyunki ABR galat configure tha aur ab working ABR nahi raha. ABR theek hote hi type 4 aaya aur default route table mein ghus gaya.</p><p><b>Seekh:</b> type 5 tab tak bekaar hai jab tak router ASBR tak pahunch na sake: type 4 (ya intra-area path) check karo.</p></div>

<div class="iv"><p class="q">'LSA types 3, 4 aur 5 kya hain, aur kaun banata hai?'</p><p>Strong answer: type 3 summary LSA hai, jo ABR banata hai taaki dusre area ko ek prefix aur uski cost bataye. Type 4 ABR banata hai taaki area ko us ASBR tak pahunchne ka rasta mile jo dusre area mein hai. Type 5 ASBR har external prefix ke liye banata hai aur poore domain mein bina badle flood hota hai. Types 1 aur 2 apna area kabhi nahi chhodte.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Type 1 router aur type 2 network LSAs topology batate hain aur apne area mein rehte hain.</li>
<li>ABRs areas paar karte time type 3 (prefix aur cost) aur type 4 (ASBR tak path) banate hain.</li>
<li>ASBRs type 5 externals banate hain, jo poora domain bina badle flood karte hain.</li>
<li><code>show ip ospf database</code> mein type 3 ka Advertising Router ABR hai, aur type 4 ka Link State ID ASBR hai.</li>
</ul></div>
`}};export{e as default};