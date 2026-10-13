var e={id:`lsdb-areas`,h:{en:`The database, LSA types and areas`,hi:`Database, LSA types aur areas`},body:{en:`
<p>So far everything has been in one area. Real networks use several. This chapter explains why OSPF has areas, what routers with special jobs are called, and what the main LSA types carry. It is mostly vocabulary, and the exam asks it directly.</p>

<h3>Why areas?</h3>
<p>Every router in an area holds the same link-state database and runs SPF on it whenever anything changes. In a network with hundreds of routers, one flapping link would force every router to recalculate. <b>Areas</b> split the network into smaller groups so that the detailed database and the recalculation stay inside one area. Between areas, only summarised information travels. The benefits:</p>
<ul>
<li>smaller databases and less memory;</li>
<li>faster, less frequent SPF runs;</li>
<li>a problem in one area stays local;</li>
<li>routes can be summarised at area borders.</li></ul>

<h3>The rules of the area design</h3>
<ul>
<li><b>Area 0 is the backbone.</b> Every other area must connect to area 0, directly (and traffic between areas goes through it).</li>
<li>An <b>Area Border Router (ABR)</b> has interfaces in two or more areas, one of them area 0. It keeps a separate database for each area and sends summaries between them.</li>
<li>An <b>Autonomous System Boundary Router (ASBR)</b> injects routes from outside OSPF (for example static routes or another protocol) into OSPF. Those routes are called <b>external</b> and have preference 150 in Junos.</li>
<li>An <b>internal router</b> has all its interfaces in one area.</li>
<li>A <b>backbone router</b> has at least one interface in area 0.</li></ul>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Multi-area OSPF">
<ellipse cx="320" cy="115" rx="130" ry="70" fill="#bae6fd"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="13">Area 0 (backbone)</text>
<ellipse cx="90" cy="115" rx="80" ry="60" fill="#bbf7d0"/><text x="90" y="55" text-anchor="middle" class="svg-ink" font-size="13">Area 1</text>
<ellipse cx="550" cy="115" rx="80" ry="60" fill="#ddd6fe"/><text x="550" y="55" text-anchor="middle" class="svg-ink" font-size="13">Area 2</text>
<circle cx="180" cy="115" r="16" fill="#fde68a" stroke="#64748b"/><text x="180" y="119" text-anchor="middle" class="svg-ink" font-size="11">ABR</text>
<circle cx="460" cy="115" r="16" fill="#fde68a" stroke="#64748b"/><text x="460" y="119" text-anchor="middle" class="svg-ink" font-size="11">ABR</text>
<circle cx="320" cy="120" r="14" fill="#e2e8f0" stroke="#64748b"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="10">R</text>
<circle cx="90" cy="125" r="14" fill="#e2e8f0" stroke="#64748b"/><text x="90" y="129" text-anchor="middle" class="svg-ink" font-size="10">R</text>
<circle cx="580" cy="130" r="16" fill="#fed7aa" stroke="#64748b"/><text x="580" y="134" text-anchor="middle" class="svg-ink" font-size="10">ASBR</text>
<text x="580" y="170" text-anchor="middle" class="svg-muted" font-size="11">external routes</text>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="12">Area 1 and area 2 talk to each other through area 0</text>
</svg><p class="cap">Hierarchy: the ABRs sit on area borders, the ASBR brings in outside routes.</p></div>

<h3>LSA types</h3>
<p>An <b>LSA</b> is one record in the database. The JNCIA exam expects you to know the first few types:</p>
<table class="cmp"><tr><th>Type</th><th>Name</th><th>Created by</th><th>Carries</th><th>Flooded</th></tr>
<tr><td>1</td><td>Router LSA</td><td>Every router</td><td>Its own links and their costs</td><td>Within its area</td></tr>
<tr><td>2</td><td>Network LSA</td><td>The DR</td><td>The routers attached to a LAN segment</td><td>Within its area</td></tr>
<tr><td>3</td><td>Summary LSA</td><td>ABR</td><td>Prefixes from another area</td><td>Into other areas</td></tr>
<tr><td>4</td><td>ASBR summary</td><td>ABR</td><td>How to reach an ASBR</td><td>Into other areas</td></tr>
<tr><td>5</td><td>AS external LSA</td><td>ASBR</td><td>A route from outside OSPF</td><td>Whole AS (not stub areas)</td></tr></table>
<p>In the single-area Indore lab you see only type 1 and type 2 LSAs: the four Router LSAs and a Network LSA for each LAN segment that has a DR. In <code>show ospf route</code> the Path Type shows <b>Intra</b> for routes inside your area (from type 1 and 2), <b>Inter</b> for routes from another area (type 3) and <b>Ext</b> for external routes (type 5).</p>

<h3>Area types (preview)</h3>
<p>To shrink databases further, some areas block certain LSAs. In a <b>stub area</b> the ABR blocks external routes (type 5) and injects a default route instead. A <b>totally stubby</b> area blocks inter-area summaries as well. An <b>NSSA</b> (not-so-stubby area) is a stub that is allowed to contain an ASBR; its external routes travel as type 7 LSAs and are converted to type 5 at the ABR. For JNCIA you only need to recognise these names and their purpose: reducing the size of the database for small edge sites. All routers in an area must agree on its type.</p>

<h3>A multi-area configuration in Junos</h3>
<p>Multi-area OSPF is just more <code>area</code> stanzas. An ABR has interfaces in two areas:</p>
<pre class="code">set routing-options router-id 10.255.9.1
set protocols ospf area 0.0.0.0 interface ge-0/0/0.0
set protocols ospf area 0.0.0.1 interface ge-0/0/1.0
set protocols ospf area 0.0.0.0 interface lo0.0 passive</pre>
<pre class="out">lab@ABR1&gt; show ospf database
    OSPF database, Area 0.0.0.0
 Type       ID               Adv Rtr           Seq      Age  Opt  Cksum  Len
Router  *10.255.9.1        10.255.9.1       0x80000004    33  0x22 0x1c05  60
Summary  10.4.50.0         10.255.9.1       0x80000001    28  0x22 0x6a18  28

    OSPF database, Area 0.0.0.1
 Type       ID               Adv Rtr           Seq      Age  Opt  Cksum  Len
Router  *10.255.9.1        10.255.9.1       0x80000003    31  0x22 0x7733  48
</pre>
<p>Notice the router keeps a separate database section for each area, and that the ABR originates a Summary LSA into area 0 for a prefix from area 1.</p>
<p>If a router has an interface in an area that is not connected to area 0 and has no ABR path, the area is isolated. A <b>virtual link</b> can repair that in special cases, but you only need to know the name for JNCIA.</p>

<div class="warn"><p><b>Common mistake.</b> Placing both ends of a link in different areas. A link belongs to exactly one area, so both neighbours must put that interface in the same area, as in the Vizag area mismatch where R3's link was in 0.0.0.1.</p></div>
<div class="exam"><p><b>Exam trap.</b> Area 0 is the backbone and all areas connect to it. ABR connects areas; ASBR connects OSPF to another routing source. Type 1 router, type 2 network (DR), type 3 summary, type 5 external. External OSPF routes have preference 150, internal 10.</p></div>

<div class="scn"><h4>The flapping branch that hurt everyone</h4><p>A company ran 60 routers in a single area. A branch link that flapped dozens of times a night forced all 60 routers to run SPF each time, and the core CPU spiked. The designers put branches into separate areas with an ABR at each regional hub. Now a flapping branch link only makes the routers in that branch area recalculate; the core sees at most a changed summary.</p><p><b>Lesson:</b> areas contain the blast radius of change.</p></div>

<div class="iv"><p class="q">"What is an ABR and what is an ASBR?"</p><p>An ABR has interfaces in two or more areas, one being area 0, keeps one database per area and originates summary LSAs between them. An ASBR sits at the boundary of OSPF and another routing source such as static routes or BGP and originates type 5 external LSAs. External routes get preference 150 in Junos.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Areas reduce database size and SPF load; area 0 is the backbone.</li>
<li>ABR connects areas; ASBR injects external routes; internal routers sit in one area.</li>
<li>LSA 1 router, 2 network (DR), 3 summary, 4 ASBR summary, 5 external.</li>
<li>Path types in show ospf route: Intra, Inter, Ext.</li>
<li>Stub, totally stubby and NSSA reduce database size at the edge.</li>
</ul></div>
`,hi:`
<p>Ab tak sab kuch ek area mein tha. Asli networks kai areas use karte hain. Yeh chapter samjhata hai OSPF mein areas kyun hote hain, special kaam wale routers kya kehlate hain, aur mukhya LSA types kya carry karte hain. Yeh zyadatar vocabulary hai, aur exam seedha poochta hai.</p>

<h3>Areas kyun?</h3>
<p>Area ka har router same link-state database rakhta hai aur kuch bhi badalne par us par SPF chalata hai. Sainkdon routers wale network mein ek flapping link har router ko recalculate karne par majboor karega. <b>Areas</b> network ko chhote groups mein baant dete hain taaki detailed database aur recalculation ek area ke andar hi rahe. Areas ke beech sirf summarised information jaati hai. Fayde:</p>
<ul>
<li>chhote databases aur kam memory;</li>
<li>tez, kam baar chalne wale SPF runs;</li>
<li>ek area ki problem local rehti hai;</li>
<li>area borders par routes summarise ho sakte hain.</li></ul>

<h3>Area design ke rules</h3>
<ul>
<li><b>Area 0 backbone hai.</b> Har doosra area area 0 se connect hona chahiye, directly (aur areas ke beech traffic uske through jaata hai).</li>
<li><b>Area Border Router (ABR)</b> ke interfaces do ya zyada areas mein hote hain, ek area 0. Woh har area ka alag database rakhta hai aur unke beech summaries bhejta hai.</li>
<li><b>Autonomous System Boundary Router (ASBR)</b> OSPF ke bahar ke routes (jaise static routes ya doosra protocol) OSPF mein inject karta hai. Aise routes <b>external</b> kehlate hain aur Junos mein unki preference 150 hoti hai.</li>
<li><b>Internal router</b> ke saare interfaces ek area mein hote hain.</li>
<li><b>Backbone router</b> ka kam se kam ek interface area 0 mein hota hai.</li></ul>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Multi-area OSPF">
<ellipse cx="320" cy="115" rx="130" ry="70" fill="#bae6fd"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="13">Area 0 (backbone)</text>
<ellipse cx="90" cy="115" rx="80" ry="60" fill="#bbf7d0"/><text x="90" y="55" text-anchor="middle" class="svg-ink" font-size="13">Area 1</text>
<ellipse cx="550" cy="115" rx="80" ry="60" fill="#ddd6fe"/><text x="550" y="55" text-anchor="middle" class="svg-ink" font-size="13">Area 2</text>
<circle cx="180" cy="115" r="16" fill="#fde68a" stroke="#64748b"/><text x="180" y="119" text-anchor="middle" class="svg-ink" font-size="11">ABR</text>
<circle cx="460" cy="115" r="16" fill="#fde68a" stroke="#64748b"/><text x="460" y="119" text-anchor="middle" class="svg-ink" font-size="11">ABR</text>
<circle cx="320" cy="120" r="14" fill="#e2e8f0" stroke="#64748b"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="10">R</text>
<circle cx="90" cy="125" r="14" fill="#e2e8f0" stroke="#64748b"/><text x="90" y="129" text-anchor="middle" class="svg-ink" font-size="10">R</text>
<circle cx="580" cy="130" r="16" fill="#fed7aa" stroke="#64748b"/><text x="580" y="134" text-anchor="middle" class="svg-ink" font-size="10">ASBR</text>
<text x="580" y="170" text-anchor="middle" class="svg-muted" font-size="11">external routes</text>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="12">Area 1 aur area 2 aapas mein area 0 ke through baat karte hain</text>
</svg><p class="cap">Hierarchy: ABRs area borders par baithte hain, ASBR bahar ke routes laata hai.</p></div>

<h3>LSA types</h3>
<p><b>LSA</b> database ka ek record hai. JNCIA exam mein pehle kuch types aane chahiye:</p>
<table class="cmp"><tr><th>Type</th><th>Naam</th><th>Kisne banaya</th><th>Kya carry karta hai</th><th>Flood kahan</th></tr>
<tr><td>1</td><td>Router LSA</td><td>Har router</td><td>Apne links aur unke costs</td><td>Apne area mein</td></tr>
<tr><td>2</td><td>Network LSA</td><td>DR</td><td>LAN segment se jude routers</td><td>Apne area mein</td></tr>
<tr><td>3</td><td>Summary LSA</td><td>ABR</td><td>Doosre area ke prefixes</td><td>Doosre areas mein</td></tr>
<tr><td>4</td><td>ASBR summary</td><td>ABR</td><td>ASBR tak kaise pahunchein</td><td>Doosre areas mein</td></tr>
<tr><td>5</td><td>AS external LSA</td><td>ASBR</td><td>OSPF ke bahar ka route</td><td>Poora AS (stub areas nahi)</td></tr></table>
<p>Single-area Indore lab mein sirf type 1 aur type 2 LSAs dikhte hain: chaar Router LSAs aur DR wale har LAN segment ka ek Network LSA. <code>show ospf route</code> mein Path Type apne area ke andar ke routes (type 1 aur 2) ke liye <b>Intra</b>, doosre area ke routes (type 3) ke liye <b>Inter</b>, aur external routes (type 5) ke liye <b>Ext</b> dikhata hai.</p>

<h3>Area types (preview)</h3>
<p>Databases aur chhote karne ke liye kuch areas kuch LSAs rok dete hain. <b>Stub area</b> mein ABR external routes (type 5) rokta hai aur unki jagah default route inject karta hai. <b>Totally stubby</b> area inter-area summaries bhi rokta hai. <b>NSSA</b> (not-so-stubby area) aisa stub hai jisme ASBR ho sakta hai; uske external routes type 7 LSAs ke roop mein jaate hain aur ABR par type 5 mein convert hote hain. JNCIA ke liye bas in naamon aur maqsad ko pehchanna hai: chhote edge sites ke liye database chhota karna. Area ke saare routers ko uske type par agree hona chahiye.</p>

<h3>Junos mein multi-area configuration</h3>
<p>Multi-area OSPF bas aur <code>area</code> stanzas hain. ABR ke interfaces do areas mein hote hain:</p>
<pre class="code">set routing-options router-id 10.255.9.1
set protocols ospf area 0.0.0.0 interface ge-0/0/0.0
set protocols ospf area 0.0.0.1 interface ge-0/0/1.0
set protocols ospf area 0.0.0.0 interface lo0.0 passive</pre>
<pre class="out">lab@ABR1&gt; show ospf database
    OSPF database, Area 0.0.0.0
 Type       ID               Adv Rtr           Seq      Age  Opt  Cksum  Len
Router  *10.255.9.1        10.255.9.1       0x80000004    33  0x22 0x1c05  60
Summary  10.4.50.0         10.255.9.1       0x80000001    28  0x22 0x6a18  28

    OSPF database, Area 0.0.0.1
 Type       ID               Adv Rtr           Seq      Age  Opt  Cksum  Len
Router  *10.255.9.1        10.255.9.1       0x80000003    31  0x22 0x7733  48
</pre>
<p>Dhyaan do router har area ka alag database section rakhta hai, aur ABR area 1 ke prefix ke liye area 0 mein Summary LSA originate karta hai.</p>
<p>Agar kisi router ka interface aisa area mein hai jo area 0 se connected nahi aur ABR path nahi, to area isolated hai. Khaas cases mein <b>virtual link</b> ise theek kar sakta hai, lekin JNCIA ke liye bas naam aana chahiye.</p>

<div class="warn"><p><b>Common mistake.</b> Link ke dono ends ko alag areas mein rakhna. Ek link ek hi area ka hota hai, isliye dono neighbours us interface ko same area mein rakhein, jaise Vizag area mismatch mein R3 ka link 0.0.0.1 mein tha.</p></div>
<div class="exam"><p><b>Exam trap.</b> Area 0 backbone hai aur saare areas usse connect hote hain. ABR areas jodta hai; ASBR OSPF ko doosre routing source se jodta hai. Type 1 router, type 2 network (DR), type 3 summary, type 5 external. External OSPF routes ki preference 150, internal ki 10.</p></div>

<div class="scn"><h4>Flapping branch jisne sabko takleef di</h4><p>Ek company 60 routers ek hi area mein chalati thi. Ek branch link raat mein darjanon baar flap karta tha aur har baar saare 60 routers ko SPF chalana padta tha, aur core CPU spike karta tha. Designers ne branches ko alag areas mein rakha aur har regional hub par ABR lagaya. Ab flapping branch link sirf us branch area ke routers ko recalculate karata hai; core ko zyada se zyada badla hua summary dikhta hai.</p><p><b>Lesson:</b> areas change ke blast radius ko contain karte hain.</p></div>

<div class="iv"><p class="q">"ABR kya hai aur ASBR kya hai?"</p><p>ABR ke interfaces do ya zyada areas mein hote hain, ek area 0, har area ka ek database rakhta hai aur unke beech summary LSAs originate karta hai. ASBR OSPF aur kisi doosre routing source, jaise static routes ya BGP, ke boundary par baithta hai aur type 5 external LSAs originate karta hai. External routes ki Junos mein preference 150 hoti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Areas database size aur SPF load ghatate hain; area 0 backbone hai.</li>
<li>ABR areas jodta hai; ASBR external routes inject karta hai; internal routers ek area mein.</li>
<li>LSA 1 router, 2 network (DR), 3 summary, 4 ASBR summary, 5 external.</li>
<li>show ospf route mein path types: Intra, Inter, Ext.</li>
<li>Stub, totally stubby aur NSSA edge par database size ghatate hain.</li>
</ul></div>
`}};export{e as default};