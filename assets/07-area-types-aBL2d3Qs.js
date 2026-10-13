var e={id:`area-types`,h:{en:`Area types and router types with OSPFv3: stub and NSSA`,hi:`OSPFv3 ke saath area types aur router types: stub aur NSSA`},body:{en:`
<p>A gated housing society does not need a copy of every road map in the country. The guard at the gate simply says "for anywhere outside, go through the main gate". Residents only need to know their own lanes and the way to the gate. That is a <b>stub area</b>: routers inside stop receiving detailed outside routes and use a default route toward the ABR instead. OSPFv3 supports the same area types as OSPFv2. The ENARSI OSPF module teaches their design in depth; here we map them to OSPFv3 LSAs and commands.</p>

<h3>Router types (same roles, OSPFv3 bits)</h3>
<table class="cmp"><tr><th>Role</th><th>Meaning</th><th>Router LSA bit</th></tr>
<tr><td>Internal</td><td>All interfaces in one area</td><td>None</td></tr>
<tr><td>Backbone</td><td>At least one interface in area 0</td><td>None</td></tr>
<tr><td>ABR</td><td>Interfaces in area 0 and another area</td><td>B</td></tr>
<tr><td>ASBR</td><td>Redistributes external routes</td><td>E</td></tr>
<tr><td>Virtual link endpoint</td><td>Terminates a virtual link</td><td>V</td></tr>
</table>
<p>In the lab, R2 is the ABR (its router LSA shows <b>B</b>), R1 is a backbone router and R3 is an internal router of area 1. Virtual links work in OSPFv3 exactly like OSPFv2 (<code>area 1 virtual-link 3.3.3.3</code>, using router IDs) and are covered in the ENARSI OSPF module.</p>

<h3>What each area type blocks, in OSPFv3 LSA terms</h3>
<table class="cmp"><tr><th>Area type</th><th>Blocks</th><th>Default route inside</th><th>Command</th></tr>
<tr><td>Stub</td><td>AS-external (0x4005) and inter-area router (0x2004)</td><td>ABR injects <code>OI ::/0</code></td><td><code>area 1 stub</code> on all routers</td></tr>
<tr><td>Totally stubby</td><td>Also inter-area prefix (0x2003), except the default</td><td>ABR injects <code>OI ::/0</code></td><td>Add <code>no-summary</code> on the ABR only</td></tr>
<tr><td>NSSA</td><td>0x4005 from outside; allows local externals as NSSA LSAs (0x2007)</td><td>Only with <code>default-information-originate</code></td><td><code>area 1 nssa</code> on all routers</td></tr>
<tr><td>Totally NSSA</td><td>Also 0x2003, except the default</td><td>ABR injects <code>OI ::/0</code></td><td>Add <code>no-summary</code> on the ABR</td></tr>
</table>
<p>Inside an NSSA, a local ASBR originates NSSA LSAs (0x2007) that appear as <code>ON1</code> or <code>ON2</code>. The ABR translates them into AS-external LSAs (0x4005) for the rest of the domain when the <b>P bit</b> (propagate) is set in the prefix options; beyond the ABR they show as <code>OE1</code> or <code>OE2</code>.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Totally stubby area">
<rect x="20" y="30" width="260" height="170" rx="10" fill="#e2e8f0"/><text x="40" y="52" class="svg-muted" font-size="12">Area 0: full routes</text>
<rect x="300" y="30" width="320" height="170" rx="10" fill="#ddd6fe"/><text x="320" y="52" class="svg-muted" font-size="12">Area 1: totally stubby</text>
<rect x="60" y="90" width="120" height="50" rx="8" fill="#bae6fd"/><text x="120" y="120" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="230" y="90" width="120" height="50" rx="8" fill="#fde68a"/><text x="290" y="112" text-anchor="middle" class="svg-ink" font-size="14">R2 ABR</text><text x="290" y="130" text-anchor="middle" class="svg-muted" font-size="12">no-summary</text>
<rect x="470" y="90" width="120" height="50" rx="8" fill="#bae6fd"/><text x="530" y="120" text-anchor="middle" class="svg-ink" font-size="14">R3</text>
<line x1="180" y1="115" x2="230" y2="115" stroke="#64748b" stroke-width="2"/><line x1="350" y1="115" x2="470" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="410" y="165" text-anchor="middle" class="svg-accent" font-size="12">only OI ::/0 enters</text>
<text x="120" y="175" text-anchor="middle" class="svg-accent" font-size="12">OI, OE2 routes</text>
</svg><p class="cap">With area 1 totally stubby, R3 keeps its intra-area routes and one inter-area default from R2.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! Traditional: every router in area 1 (R2 and R3)</span>
ipv6 router ospf 1
 area 1 stub
<span class="c">! ABR only: make it totally stubby</span>
ipv6 router ospf 1
 area 1 stub no-summary

<span class="c">! NSSA versions</span>
 area 1 nssa
 area 1 nssa no-summary                    <span class="c">! ABR: totally NSSA</span>
 area 1 nssa default-information-originate <span class="c">! ABR: default into a plain NSSA</span>

<span class="c">! AF style: the same commands under the address family</span>
router ospfv3 1
 address-family ipv6 unicast
  area 1 stub no-summary</pre>

<h3>Verification</h3>
<pre class="out">R2# show ipv6 ospf | begin Area 1
    Area 1
        Number of interfaces in this area is 1
        <span class="hl">It is a stub area, no summary LSA in this area</span>
        <span class="hl">generates stub default route with cost 1</span>
        SPF algorithm executed 6 times

R3# show ipv6 route ospf
<span class="hl">OI  ::/0 [110/2]</span>
     via FE80::5200:FF:FE02:1, GigabitEthernet0/0</pre>

<h3>Stub flag must match</h3>
<p>The stub setting is carried in the Hello as the <b>E bit</b> (external routing capable) in the options field, and NSSA as the <b>N bit</b>. If R2 says area 1 is stub and R3 does not, the option bits differ and the adjacency never forms; <code>debug ipv6 ospf hello</code> reports a mismatched stub/transit area option bit. The <code>no-summary</code> keyword is not in the Hello, so it only needs to be on the ABR.</p>

<h3>Defaults outside stub areas</h3>
<p>To inject a default into a normal area, an edge router uses <code>default-information originate</code> under <code>ipv6 router ospf 1</code> (or the IPv6 AF). It creates an AS-external LSA for <code>::/0</code>, seen as <code>OE2 ::/0</code>, but only if the router itself has a default route. Add <code>always</code> to advertise it regardless.</p>

<div class="eg"><p><b>Worked example.</b> Suppose the network had 40 external IPv6 prefixes redistributed at R1 and 12 inter-area prefixes from other areas. In a normal area 1, R3 learns 40 OE2 plus 12 OI plus the defaults. As a stub area, R3 learns 12 OI plus <code>OI ::/0</code> = 13 routes. As totally stubby, R3 learns only <code>OI ::/0</code> plus its own intra-area routes. The LSDB shrinks the same way, and flaps outside the area no longer trigger work on R3.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring <code>area 1 stub</code> only on the ABR. The Hello option bits then differ and the neighbour in area 1 drops. Another mistake: putting an ASBR inside a stub area. Stub areas cannot carry externals; use NSSA instead.</p></div>

<div class="exam"><p><b>Exam trap.</b> A plain NSSA does <b>not</b> get a default route automatically; you need <code>default-information-originate</code> on the ABR, or <code>no-summary</code>. Stub and totally stubby areas do get one automatically. Also remember: area 0 can never be stub or NSSA.</p></div>

<div class="scn"><h4>The new router that would not join</h4><p>A retail chain added a second router to a branch area that was configured as totally stubby. The new router had been built from a generic template: OSPFv3 enabled, correct area, correct timers. It never formed an adjacency with the ABR. <code>show ipv6 ospf neighbor</code> was empty on both sides, and <code>debug ipv6 ospf hello</code> showed the mismatched stub/transit option bit. Adding <code>area 5 stub</code> to the new router brought the adjacency up; it did not need <code>no-summary</code>, because it was not the ABR.</p><p><b>Lesson:</b> every router in a stub or NSSA area must agree on the area type; <code>no-summary</code> lives only on the ABR.</p></div>

<div class="iv"><p class="q">"How does a totally stubby area look in OSPFv3 terms?"</p><p>Strong answer: the ABR blocks AS-external LSAs (0x4005), inter-area router LSAs (0x2004) and all inter-area prefix LSAs (0x2003) except a default, which it originates itself as an inter-area prefix LSA for <code>::/0</code>. Internal routers see <code>OI ::/0</code> plus their intra-area routes. <code>area X stub</code> is on every router in the area because of the E bit in the Hello; <code>no-summary</code> is only on the ABR.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stub blocks 0x4005 and 0x2004; totally stubby also blocks 0x2003 except <code>::/0</code>.</li>
<li>NSSA carries local externals as 0x2007 (ON1/ON2); the ABR translates them to 0x4005 when the P bit is set.</li>
<li>Stub and NSSA flags are Hello option bits (E and N) and must match on every router in the area.</li>
<li>A plain NSSA needs <code>default-information-originate</code> for a default route.</li>
<li>Router LSA bits: B = ABR, E = ASBR, V = virtual link endpoint.</li>
</ul></div>
`,hi:`
<p>Ek gated housing society ko desh ke har road map ki copy nahi chahiye. Gate par guard bas kehta hai "bahar kahin bhi jaana ho, main gate se jao". Residents ko sirf apni lanes aur gate tak ka raasta pata hona chahiye. Yahi <b>stub area</b> hai: andar ke routers bahar ke detailed routes lena band kar dete hain aur iski jagah ABR ki taraf default route use karte hain. OSPFv3 wahi area types support karta hai jo OSPFv2 karta hai. ENARSI OSPF module unka design gehraai se padhata hai; yahan hum unhe OSPFv3 LSAs aur commands se map karte hain.</p>

<h3>Router types (same roles, OSPFv3 bits)</h3>
<table class="cmp"><tr><th>Role</th><th>Matlab</th><th>Router LSA bit</th></tr>
<tr><td>Internal</td><td>Saare interfaces ek area mein</td><td>Koi nahi</td></tr>
<tr><td>Backbone</td><td>Kam se kam ek interface area 0 mein</td><td>Koi nahi</td></tr>
<tr><td>ABR</td><td>Interfaces area 0 aur kisi doosre area mein</td><td>B</td></tr>
<tr><td>ASBR</td><td>External routes redistribute karta hai</td><td>E</td></tr>
<tr><td>Virtual link endpoint</td><td>Virtual link terminate karta hai</td><td>V</td></tr>
</table>
<p>Lab mein R2 ABR hai (uske router LSA mein <b>B</b> dikhta hai), R1 backbone router hai aur R3 area 1 ka internal router hai. Virtual links OSPFv3 mein bilkul OSPFv2 ki tarah kaam karte hain (<code>area 1 virtual-link 3.3.3.3</code>, router IDs use karke) aur ENARSI OSPF module mein cover hote hain.</p>

<h3>Har area type kya block karta hai, OSPFv3 LSA terms mein</h3>
<table class="cmp"><tr><th>Area type</th><th>Block karta hai</th><th>Andar default route</th><th>Command</th></tr>
<tr><td>Stub</td><td>AS-external (0x4005) aur inter-area router (0x2004)</td><td>ABR <code>OI ::/0</code> inject karta hai</td><td>Saare routers par <code>area 1 stub</code></td></tr>
<tr><td>Totally stubby</td><td>Inter-area prefix (0x2003) bhi, default ke alawa</td><td>ABR <code>OI ::/0</code> inject karta hai</td><td>Sirf ABR par <code>no-summary</code> jodo</td></tr>
<tr><td>NSSA</td><td>Bahar se 0x4005; local externals ko NSSA LSAs (0x2007) ki tarah allow</td><td>Sirf <code>default-information-originate</code> ke saath</td><td>Saare routers par <code>area 1 nssa</code></td></tr>
<tr><td>Totally NSSA</td><td>0x2003 bhi, default ke alawa</td><td>ABR <code>OI ::/0</code> inject karta hai</td><td>ABR par <code>no-summary</code> jodo</td></tr>
</table>
<p>NSSA ke andar local ASBR NSSA LSAs (0x2007) originate karta hai jo <code>ON1</code> ya <code>ON2</code> dikhte hain. ABR unhe baaki domain ke liye AS-external LSAs (0x4005) mein translate karta hai jab prefix options mein <b>P bit</b> (propagate) set ho; ABR ke aage woh <code>OE1</code> ya <code>OE2</code> dikhte hain.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Totally stubby area">
<rect x="20" y="30" width="260" height="170" rx="10" fill="#e2e8f0"/><text x="40" y="52" class="svg-muted" font-size="12">Area 0: poore routes</text>
<rect x="300" y="30" width="320" height="170" rx="10" fill="#ddd6fe"/><text x="320" y="52" class="svg-muted" font-size="12">Area 1: totally stubby</text>
<rect x="60" y="90" width="120" height="50" rx="8" fill="#bae6fd"/><text x="120" y="120" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="230" y="90" width="120" height="50" rx="8" fill="#fde68a"/><text x="290" y="112" text-anchor="middle" class="svg-ink" font-size="14">R2 ABR</text><text x="290" y="130" text-anchor="middle" class="svg-muted" font-size="12">no-summary</text>
<rect x="470" y="90" width="120" height="50" rx="8" fill="#bae6fd"/><text x="530" y="120" text-anchor="middle" class="svg-ink" font-size="14">R3</text>
<line x1="180" y1="115" x2="230" y2="115" stroke="#64748b" stroke-width="2"/><line x1="350" y1="115" x2="470" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="410" y="165" text-anchor="middle" class="svg-accent" font-size="12">sirf OI ::/0 aata hai</text>
<text x="120" y="175" text-anchor="middle" class="svg-accent" font-size="12">OI, OE2 routes</text>
</svg><p class="cap">Area 1 totally stubby hone par R3 apne intra-area routes aur R2 se ek inter-area default rakhta hai.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! Traditional: area 1 ka har router (R2 aur R3)</span>
ipv6 router ospf 1
 area 1 stub
<span class="c">! Sirf ABR: totally stubby banao</span>
ipv6 router ospf 1
 area 1 stub no-summary

<span class="c">! NSSA versions</span>
 area 1 nssa
 area 1 nssa no-summary                    <span class="c">! ABR: totally NSSA</span>
 area 1 nssa default-information-originate <span class="c">! ABR: plain NSSA mein default</span>

<span class="c">! AF style: same commands address family ke neeche</span>
router ospfv3 1
 address-family ipv6 unicast
  area 1 stub no-summary</pre>

<h3>Verification</h3>
<pre class="out">R2# show ipv6 ospf | begin Area 1
    Area 1
        Number of interfaces in this area is 1
        <span class="hl">It is a stub area, no summary LSA in this area</span>
        <span class="hl">generates stub default route with cost 1</span>
        SPF algorithm executed 6 times

R3# show ipv6 route ospf
<span class="hl">OI  ::/0 [110/2]</span>
     via FE80::5200:FF:FE02:1, GigabitEthernet0/0</pre>

<h3>Stub flag match hona chahiye</h3>
<p>Stub setting Hello mein options field ke <b>E bit</b> (external routing capable) ki tarah jaati hai, aur NSSA <b>N bit</b> ki tarah. Agar R2 kehta hai area 1 stub hai aur R3 nahi, to option bits alag hote hain aur adjacency kabhi nahi banti; <code>debug ipv6 ospf hello</code> mismatched stub/transit area option bit report karta hai. <code>no-summary</code> keyword Hello mein nahi hota, isliye use sirf ABR par hona chahiye.</p>

<h3>Stub areas ke bahar defaults</h3>
<p>Normal area mein default inject karne ke liye edge router <code>ipv6 router ospf 1</code> (ya IPv6 AF) ke neeche <code>default-information originate</code> use karta hai. Yeh <code>::/0</code> ke liye AS-external LSA banata hai, jo <code>OE2 ::/0</code> dikhta hai, lekin sirf tab jab router ke paas khud default route ho. Kisi bhi haal mein advertise karne ke liye <code>always</code> jodo.</p>

<div class="eg"><p><b>Worked example.</b> Maan lo network mein R1 par 40 external IPv6 prefixes redistribute hue aur doosre areas se 12 inter-area prefixes hain. Normal area 1 mein R3 40 OE2 plus 12 OI plus defaults seekhta hai. Stub area mein R3 12 OI plus <code>OI ::/0</code> = 13 routes seekhta hai. Totally stubby mein R3 sirf <code>OI ::/0</code> plus apne intra-area routes seekhta hai. LSDB bhi isi tarah chhota hota hai, aur area ke bahar ke flaps ab R3 par kaam trigger nahi karte.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>area 1 stub</code> sirf ABR par configure karna. Tab Hello option bits alag hote hain aur area 1 ka neighbour drop ho jaata hai. Ek aur galti: stub area ke andar ASBR rakhna. Stub areas externals nahi le ja sakte; iski jagah NSSA use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Plain NSSA ko default route automatically <b>nahi</b> milta; ABR par <code>default-information-originate</code> ya <code>no-summary</code> chahiye. Stub aur totally stubby areas ko automatically milta hai. Yeh bhi yaad rakho: area 0 kabhi stub ya NSSA nahi ho sakta.</p></div>

<div class="scn"><h4>Naya router jo join nahi hua</h4><p>Ek retail chain ne totally stubby configure kiye gaye branch area mein doosra router joda. Naya router generic template se bana tha: OSPFv3 enabled, sahi area, sahi timers. ABR ke saath kabhi adjacency nahi bani. Dono sides par <code>show ipv6 ospf neighbor</code> khaali tha, aur <code>debug ipv6 ospf hello</code> ne mismatched stub/transit option bit dikhaya. Naye router par <code>area 5 stub</code> jodne se adjacency up ho gayi; use <code>no-summary</code> ki zaroorat nahi thi, kyunki woh ABR nahi tha.</p><p><b>Seekh:</b> stub ya NSSA area ke har router ko area type par agree karna chahiye; <code>no-summary</code> sirf ABR par rehta hai.</p></div>

<div class="iv"><p class="q">"OSPFv3 terms mein totally stubby area kaisa dikhta hai?"</p><p>Strong answer: ABR AS-external LSAs (0x4005), inter-area router LSAs (0x2004) aur saare inter-area prefix LSAs (0x2003) block karta hai, sirf ek default ke alawa, jise woh khud <code>::/0</code> ke inter-area prefix LSA ki tarah originate karta hai. Internal routers <code>OI ::/0</code> plus apne intra-area routes dekhte hain. Hello mein E bit ki wajah se <code>area X stub</code> area ke har router par hota hai; <code>no-summary</code> sirf ABR par.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stub 0x4005 aur 0x2004 block karta hai; totally stubby <code>::/0</code> ke alawa 0x2003 bhi block karta hai.</li>
<li>NSSA local externals ko 0x2007 (ON1/ON2) ki tarah le jaata hai; P bit set ho to ABR unhe 0x4005 mein translate karta hai.</li>
<li>Stub aur NSSA flags Hello option bits (E aur N) hain aur area ke har router par match hone chahiye.</li>
<li>Plain NSSA ko default route ke liye <code>default-information-originate</code> chahiye.</li>
<li>Router LSA bits: B = ABR, E = ASBR, V = virtual link endpoint.</li>
</ul></div>
`}};export{e as default};