var e={id:`levels-areas-design`,h:{en:`Levels, areas and NETs: structuring an IS-IS network`,hi:`Levels, areas aur NETs: IS-IS network ka structure`},body:{en:`
<p>Before you tune anything you must know how an IS-IS network is organised. Three ideas carry the whole design: the <b>NET</b> that names a router and its area, the <b>level</b> a router and each link run at, and the rule that decides which neighbours may form an adjacency.</p>

<h3>Anatomy of a NET</h3>
<p>A NET (network entity title) is an ISO address written in hex, for example <code>49.0001.0100.0125.5001.00</code>. Read it from the right. The last byte <code>00</code> is the NSEL and is always 00 on a router. The six bytes before it, <code>0100.0125.5001</code>, are the <b>system ID</b>, which must be unique in the whole domain. Everything on the left, <code>49.0001</code>, is the <b>area ID</b>. The first byte 49 means a private address space. On Junos you configure it on the loopback under <code>family iso</code>, and a router can hold up to three area addresses (the overview shows Maximum Areas: 3) but only one system ID.</p>
<div class="dia"><svg viewBox="0 0 620 130" role="img" aria-label="NET layout">
<rect x="20" y="30" width="160" height="50" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="100" y="60" text-anchor="middle" class="svg-ink" font-size="15">49.0001</text><text x="100" y="105" text-anchor="middle" class="svg-muted" font-size="12">area ID (variable)</text>
<rect x="190" y="30" width="270" height="50" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="325" y="60" text-anchor="middle" class="svg-ink" font-size="15">0100.0125.5001</text><text x="325" y="105" text-anchor="middle" class="svg-muted" font-size="12">system ID (6 bytes, unique)</text>
<rect x="470" y="30" width="110" height="50" rx="8" fill="#fde68a" stroke="#64748b"/><text x="525" y="60" text-anchor="middle" class="svg-ink" font-size="15">00</text><text x="525" y="105" text-anchor="middle" class="svg-muted" font-size="12">NSEL</text>
</svg><p class="cap">Read a NET from the right: NSEL, system ID, then the area.</p></div>

<h3>Three router types</h3>
<table class="cmp"><tr><th>Type</th><th>Runs</th><th>Typical role</th></tr>
<tr><td>Level 1</td><td>Only L1 adjacencies, one area database</td><td>Access routers; follow the default toward an attached border</td></tr>
<tr><td>Level 2</td><td>Only L2 adjacencies, backbone database</td><td>Core routers; may sit in any area</td></tr>
<tr><td>Level 1/Level 2</td><td>Both databases, one for each level</td><td>Border; sets the Attached bit in its L1 LSP</td></tr></table>
<p>On Junos, by default every interface runs both levels. You restrict a level with <code>level 2 disable</code> under the interface, which is exactly how the Nagpur lab keeps R2's link to R1 at Level 1 and its link to R4 at Level 2.</p>

<h3>Adjacency level rules</h3>
<p>Two routers on a link form a Level 1 adjacency only if their <b>area IDs match</b>. They form a Level 2 adjacency whatever the area IDs, provided both run Level 2 on that link. A Level 1/Level 2 pair in the same area forms both. That is why a Level 2-only core can use any area numbers. It is also why a typing mistake in the area ID silently breaks Level 1 but not Level 2.</p>

<h3>Seeing it on the lab devices</h3>
<p>This is R1 in the Nagpur lab, a Level 1-only router, with two L1 neighbours:</p>
<pre class="out">lab@R1&gt; show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/0.0            R2             <span class="hl">1</span> Up                   25
ge-0/0/1.0            R3             <span class="hl">1</span> Up                   20

lab@R1&gt; show isis interface
IS-IS interface database:
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/0.0            1   0x1 Point to Point    Disabled                 10/10
ge-0/0/1.0            1   0x2 Point to Point    Disabled                 20/10
lo0.0                 0   0x7 Passive           Disabled                   0/0</pre>
<p>The L column shows the level of the adjacency. The Level 2 DR column says Disabled because R1 does not run Level 2. R2, the border, shows both kinds:</p>
<pre class="out">lab@R2&gt; show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/0.0            R1             1 Up                   23
ge-0/0/1.0            R4             2 Up                   25</pre>
<p>R2 has one Level 1 neighbour (R1) and one Level 2 neighbour (R4), which proves it is a border. Its database has two sections:</p>
<pre class="out">lab@R2&gt; show isis database
IS-IS level 1 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R1.00-00                         0x1   0x3bc9     1137 L1
R2.00-00                         0x1   0xff60     1137 L1 L2 <span class="hl">Attached</span>
R3.00-00                         0x1   0x2f8c     1137 L1 L2 Attached
  3 LSPs

IS-IS level 2 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R2.00-00                         0x1   0x8eb3     1137 L1 L2
R3.00-00                         0x1   0x47c3     1137 L1 L2
R4.00-00                         0x1   0x156d     1137 L1 L2
  3 LSPs</pre>
<p>Notice that R1, a Level 1-only router, has no Level 2 database at all. R4, the core router, has only the Level 2 section.</p>

<div class="eg"><p><b>Worked example.</b> Why does R1 hold a default route and nothing for 10.1.34.0/24? R1 has only a Level 1 database. R2 and R3 advertise the Attached bit, so R1 installs <code>0.0.0.0/0 [IS-IS/15]</code> toward the nearest attached router. Level 1 routers know their own area in detail and everything else only as a default.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using different area IDs inside what you think is one Level 1 area. The Level 2 adjacency still forms, so the interface looks healthy, but there is no Level 1 database exchange. Always compare the Areaid line of <code>show isis overview</code> on both ends.</p></div>
<div class="exam"><p><b>Exam trap.</b> The system ID must be unique across the entire domain, not only the area. Two routers with the same system ID in different Level 2-connected areas cause LSP corruption and flapping that is hard to explain.</p></div>

<div class="scn"><h4>The two Level 1 areas that merged by accident</h4><p>A Pune office was meant to be area 49.0003 and Nagpur 49.0001, but an engineer reused a NET template and left 49.0001 in Pune. The two sites became one Level 1 area across the WAN. Every office LSP was flooded across the links, and a routine flap in Pune caused SPF runs in Nagpur. Fixing the NET restored the separation.</p><p><b>Lesson:</b> area IDs are your scaling boundary; review them like addresses.</p></div>

<div class="iv"><p class="q">"Two routers have different area IDs but are directly connected. Which adjacencies form?"</p><p>Level 1 does not form because the area IDs differ. A Level 2 adjacency forms if both routers run Level 2 on the link. That is how areas are joined into the backbone.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NET: area ID, 6-byte system ID, NSEL 00; configured on lo0 under family iso.</li>
<li>L1 adjacency needs matching areas; L2 does not.</li>
<li>L1/L2 routers keep two databases and set the Attached bit.</li>
<li>Restrict levels per interface with level N disable.</li>
<li>show isis adjacency, interface, database and overview show the structure.</li>
</ul></div>
`,hi:`
<p>Kuch bhi tune karne se pehle jaanna zaroori hai ki IS-IS network kaise organise hota hai. Teen ideas poore design ko sambhalte hain: <b>NET</b> jo router aur uske area ka naam hai, woh <b>level</b> jis par router aur har link chalta hai, aur woh rule jo tay karta hai ki kaun se neighbours adjacency bana sakte hain.</p>

<h3>NET ki anatomy</h3>
<p>NET (network entity title) ek ISO address hai jo hex mein likha jata hai, jaise <code>49.0001.0100.0125.5001.00</code>. Ise right se padho. Aakhri byte <code>00</code> NSEL hai aur router par hamesha 00 hota hai. Uske pehle ke chhe bytes <code>0100.0125.5001</code> <b>system ID</b> hain, jo poore domain mein unique hona chahiye. Left ka sab kuch, <code>49.0001</code>, <b>area ID</b> hai. Pehla byte 49 private address space dikhata hai. Junos par ise loopback par <code>family iso</code> ke neeche configure karte ho, aur router ke paas teen tak area addresses ho sakte hain (overview mein Maximum Areas: 3 dikhta hai) par system ID sirf ek.</p>
<div class="dia"><svg viewBox="0 0 620 130" role="img" aria-label="NET layout">
<rect x="20" y="30" width="160" height="50" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="100" y="60" text-anchor="middle" class="svg-ink" font-size="15">49.0001</text><text x="100" y="105" text-anchor="middle" class="svg-muted" font-size="12">area ID (variable)</text>
<rect x="190" y="30" width="270" height="50" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="325" y="60" text-anchor="middle" class="svg-ink" font-size="15">0100.0125.5001</text><text x="325" y="105" text-anchor="middle" class="svg-muted" font-size="12">system ID (6 bytes, unique)</text>
<rect x="470" y="30" width="110" height="50" rx="8" fill="#fde68a" stroke="#64748b"/><text x="525" y="60" text-anchor="middle" class="svg-ink" font-size="15">00</text><text x="525" y="105" text-anchor="middle" class="svg-muted" font-size="12">NSEL</text>
</svg><p class="cap">NET ko right se padho: NSEL, system ID, phir area.</p></div>

<h3>Teen router types</h3>
<table class="cmp"><tr><th>Type</th><th>Kya chalata hai</th><th>Typical role</th></tr>
<tr><td>Level 1</td><td>Sirf L1 adjacencies, ek area database</td><td>Access routers; attached border ki taraf default follow karte hain</td></tr>
<tr><td>Level 2</td><td>Sirf L2 adjacencies, backbone database</td><td>Core routers; kisi bhi area mein ho sakte hain</td></tr>
<tr><td>Level 1/Level 2</td><td>Dono databases, har level ka ek</td><td>Border; apne L1 LSP mein Attached bit set karta hai</td></tr></table>
<p>Junos par default mein har interface dono levels chalata hai. Ek level ko interface ke neeche <code>level 2 disable</code> se rokte ho, jaise Nagpur lab mein R2 ka R1 wala link Level 1 par aur R4 wala link Level 2 par rakha gaya hai.</p>

<h3>Adjacency level rules</h3>
<p>Ek link par do routers Level 1 adjacency tabhi banate hain jab unke <b>area IDs match</b> karein. Level 2 adjacency area IDs kuch bhi ho tab banti hai, bas dono us link par Level 2 chalate hon. Same area ki Level 1/Level 2 jodi dono banati hai. Isiliye Level 2-only core koi bhi area numbers use kar sakta hai. Isiliye area ID mein typing mistake Level 1 ko chupchap tod deti hai par Level 2 ko nahi.</p>

<h3>Lab devices par dekho</h3>
<p>Yeh Nagpur lab ka R1 hai, ek Level 1-only router, do L1 neighbours ke saath:</p>
<pre class="out">lab@R1&gt; show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/0.0            R2             <span class="hl">1</span> Up                   25
ge-0/0/1.0            R3             <span class="hl">1</span> Up                   20

lab@R1&gt; show isis interface
IS-IS interface database:
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/0.0            1   0x1 Point to Point    Disabled                 10/10
ge-0/0/1.0            1   0x2 Point to Point    Disabled                 20/10
lo0.0                 0   0x7 Passive           Disabled                   0/0</pre>
<p>L column adjacency ka level dikhata hai. Level 2 DR column Disabled kehta hai kyunki R1 Level 2 nahi chalata. Border R2 dono kism dikhata hai:</p>
<pre class="out">lab@R2&gt; show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/0.0            R1             1 Up                   23
ge-0/0/1.0            R4             2 Up                   25</pre>
<p>R2 ka ek Level 1 neighbour (R1) aur ek Level 2 neighbour (R4) hai, jo saabit karta hai ki yeh border hai. Uske database ke do hisse hain:</p>
<pre class="out">lab@R2&gt; show isis database
IS-IS level 1 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R1.00-00                         0x1   0x3bc9     1137 L1
R2.00-00                         0x1   0xff60     1137 L1 L2 <span class="hl">Attached</span>
R3.00-00                         0x1   0x2f8c     1137 L1 L2 Attached
  3 LSPs

IS-IS level 2 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R2.00-00                         0x1   0x8eb3     1137 L1 L2
R3.00-00                         0x1   0x47c3     1137 L1 L2
R4.00-00                         0x1   0x156d     1137 L1 L2
  3 LSPs</pre>
<p>Dhyan do ki R1, jo Level 1-only router hai, ke paas Level 2 database hai hi nahi. Core router R4 ke paas sirf Level 2 hissa hai.</p>

<div class="eg"><p><b>Worked example.</b> R1 ke paas default route kyun hai aur 10.1.34.0/24 ke liye kuch nahi? R1 ke paas sirf Level 1 database hai. R2 aur R3 Attached bit advertise karte hain, isliye R1 sabse nazdeeki attached router ki taraf <code>0.0.0.0/0 [IS-IS/15]</code> install karta hai. Level 1 routers apne area ko detail mein aur baaki sab ko sirf default ke roop mein jaante hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Jise aap ek Level 1 area samajh rahe ho uske andar alag area IDs use karna. Level 2 adjacency phir bhi ban jati hai, isliye interface theek dikhta hai, par Level 1 database exchange hota hi nahi. Dono ends par <code>show isis overview</code> ki Areaid line compare karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> System ID poore domain mein unique hona chahiye, sirf area mein nahi. Level 2 se jude alag areas mein same system ID wale do routers LSP corruption aur flapping karate hain jo samjhana mushkil hota hai.</p></div>

<div class="scn"><h4>Do Level 1 areas jo galti se mil gaye</h4><p>Pune office ko area 49.0003 aur Nagpur ko 49.0001 hona tha, par ek engineer ne NET template reuse kiya aur Pune mein 49.0001 chhod diya. Dono sites WAN ke across ek Level 1 area ban gaye. Har office ka LSP links par flood hua, aur Pune ka ek normal flap Nagpur mein SPF runs karata tha. NET theek karne se alag hona wapas aaya.</p><p><b>Lesson:</b> area IDs aapki scaling boundary hain; unhe addresses ki tarah review karo.</p></div>

<div class="iv"><p class="q">"Do routers ke area IDs alag hain par woh seedhe jude hain. Kaunsi adjacencies banengi?"</p><p>Level 1 nahi banegi kyunki area IDs alag hain. Level 2 adjacency banegi agar dono routers us link par Level 2 chalate hain. Isi tarah areas backbone se jodte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NET: area ID, 6-byte system ID, NSEL 00; lo0 par family iso ke neeche configure.</li>
<li>L1 adjacency ke liye areas match chahiye; L2 ke liye nahi.</li>
<li>L1/L2 routers do databases rakhte hain aur Attached bit set karte hain.</li>
<li>Per interface level N disable se level restrict karo.</li>
<li>show isis adjacency, interface, database aur overview structure dikhate hain.</li>
</ul></div>
`}};export{e as default};