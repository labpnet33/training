var e={id:`lisp-terms`,h:{en:`LISP vocabulary: EID, RLOC, xTR, MS/MR, PxTR`,hi:`LISP vocabulary: EID, RLOC, xTR, MS/MR, PxTR`},body:{en:`
<p>Think of a big courier company. Every parcel is addressed to a <b>person</b> (the identity). The company does not route parcels by person; it routes them between <b>depots</b> (the locations). A central <b>address book</b> says which depot serves which person. The depot where a parcel enters the network puts it in a depot-to-depot bag; the depot at the far end opens the bag and hands the parcel to the person. Every LISP term maps onto this picture.</p>

<h3>The two address types</h3>
<dl class="terms">
<dt>EID (Endpoint Identifier)</dt><dd>The IP address of a host inside a LISP site, for example PC1 at 10.1.1.10. EIDs are grouped into <b>EID prefixes</b> such as 10.1.1.0/24. EIDs are routable inside the site, but they are <b>not</b> advertised into the core. They can be IPv4, IPv6 or even MAC addresses (SD-Access uses MAC EIDs for Layer 2 services).</dd>
<dt>RLOC (Routing Locator)</dt><dd>An IP address of the LISP router that fronts a site, reachable in the underlay. XTR1 uses 100.64.1.2 and XTR2 uses 100.64.2.2. The core routes RLOCs and nothing else. A site with two ISPs simply has two RLOCs.</dd>
<dt>EID space and RLOC space</dt><dd>The two address worlds. They may even overlap numerically, because they never meet in the same routing table.</dd>
</dl>

<h3>The routers and their jobs</h3>
<dl class="terms">
<dt>ITR (Ingress Tunnel Router)</dt><dd>Receives packets from hosts in its site that are destined to a remote EID. It looks up the destination in its <b>map-cache</b>; on a miss it asks the mapping system; on a hit it encapsulates the packet toward the remote RLOC. "Ingress" means ingress into the LISP tunnel.</dd>
<dt>ETR (Egress Tunnel Router)</dt><dd>Receives LISP-encapsulated packets from the core, strips the outer header and forwards the original packet to the local EID. It also <b>registers</b> its site's EID prefixes with the map-server and answers Map-Requests for them.</dd>
<dt>xTR</dt><dd>A router that is both ITR and ETR. Almost every branch router is an xTR, like XTR1 and XTR2 in our lab.</dd>
<dt>MS (Map-Server)</dt><dd>Accepts <b>Map-Register</b> messages from ETRs, checks them against configured <b>sites</b> and an <b>authentication key</b>, and stores the EID-to-RLOC registrations. It forwards Map-Requests to the ETR that registered the EID.</dd>
<dt>MR (Map-Resolver)</dt><dd>Receives <b>Map-Requests</b> from ITRs and finds the answer in the mapping system. If no site covers the EID, it returns a <b>Negative Map-Reply</b>. MS and MR are usually the same box, written <b>MS/MR</b>; our lab uses MSMR at 100.64.3.2.</dd>
<dt>PITR (Proxy ITR)</dt><dd>Attracts traffic from non-LISP sites (for example the Internet) toward LISP EIDs by advertising EID prefixes natively, then LISP-encapsulates it toward the right ETR.</dd>
<dt>PETR (Proxy ETR)</dt><dd>Receives LISP-encapsulated traffic from ITRs that is destined to non-LISP sites, decapsulates it and forwards it natively. Useful when the ISP would drop packets with an EID source (uRPF).</dd>
<dt>PxTR</dt><dd>A router doing both PITR and PETR. In SD-Access, <b>border nodes</b> play this role between the fabric and the outside world.</dd>
<dt>Mapping system</dt><dd>The MS/MR infrastructure as a whole, the "DNS of routing".</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="LISP lab roles">
<rect x="250" y="16" width="140" height="52" rx="8" fill="#ddd6fe"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">MSMR</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">MS/MR 100.64.3.2</text>
<rect x="250" y="120" width="140" height="48" rx="8" fill="#e2e8f0"/><text x="320" y="142" text-anchor="middle" class="svg-ink" font-size="14">CORE</text><text x="320" y="158" text-anchor="middle" class="svg-muted" font-size="12">routes RLOCs only</text>
<rect x="40" y="120" width="150" height="48" rx="8" fill="#bae6fd"/><text x="115" y="142" text-anchor="middle" class="svg-ink" font-size="14">XTR1 (ITR+ETR)</text><text x="115" y="158" text-anchor="middle" class="svg-muted" font-size="12">RLOC 100.64.1.2</text>
<rect x="450" y="120" width="150" height="48" rx="8" fill="#bae6fd"/><text x="525" y="142" text-anchor="middle" class="svg-ink" font-size="14">XTR2 (ITR+ETR)</text><text x="525" y="158" text-anchor="middle" class="svg-muted" font-size="12">RLOC 100.64.2.2</text>
<rect x="40" y="230" width="150" height="48" rx="8" fill="#bbf7d0"/><text x="115" y="252" text-anchor="middle" class="svg-ink" font-size="13">PC1 10.1.1.10</text><text x="115" y="268" text-anchor="middle" class="svg-muted" font-size="12">EID 10.1.1.0/24</text>
<rect x="450" y="230" width="150" height="48" rx="8" fill="#bbf7d0"/><text x="525" y="252" text-anchor="middle" class="svg-ink" font-size="13">PC2 10.2.2.10</text><text x="525" y="268" text-anchor="middle" class="svg-muted" font-size="12">EID 10.2.2.0/24</text>
<line x1="190" y1="144" x2="250" y2="144" stroke="#64748b" stroke-width="2"/><line x1="390" y1="144" x2="450" y2="144" stroke="#64748b" stroke-width="2"/><line x1="320" y1="68" x2="320" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="115" y1="168" x2="115" y2="230" stroke="#64748b" stroke-width="2"/><line x1="525" y1="168" x2="525" y2="230" stroke="#64748b" stroke-width="2"/>
<text x="220" y="210" text-anchor="middle" class="svg-accent" font-size="12">EID space</text><text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">RLOC space 100.64.x.x</text><text x="420" y="210" text-anchor="middle" class="svg-accent" font-size="12">EID space</text>
</svg><p class="cap">The lab topology with every LISP role. CORE never learns 10.1.1.0/24 or 10.2.2.0/24.</p></div>

<h3>Other terms you will meet</h3>
<ul>
<li><b>Map-cache</b>: the ITR's table of learned EID-to-RLOC mappings, each with a TTL (24 hours by default for positive replies).</li>
<li><b>Database-mapping</b>: the ETR's configured list of local EID prefixes and their RLOCs, with <b>priority</b> and <b>weight</b>.</li>
<li><b>Priority and weight</b>: lower priority is preferred (1 is best, 255 means "do not use"); among locators with equal priority, traffic is shared by weight (for example 50/50).</li>
<li><b>Instance ID</b>: a 24-bit number in the LISP header that separates virtual networks (VRFs) using overlapping EIDs. SD-Access maps every Virtual Network to an instance ID.</li>
<li><b>LISP site</b>: on the map-server, a named object (SITE-A) that lists which EID prefixes may register and the key they must use.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A branch has two ISP links. Its xTR advertises one EID prefix 10.5.5.0/24 with RLOC 198.51.100.2 (priority 1, weight 70) and RLOC 203.0.113.2 (priority 1, weight 30). Remote ITRs send about 70 percent of traffic to the first ISP and 30 percent to the second, with no BGP tricks. If the first RLOC is set to priority 2, it becomes a pure backup used only when the priority-1 locator is down.</p></div>

<div class="warn"><p><b>Common mistake.</b> Putting an EID prefix into the underlay IGP "just to be safe". The core then routes EID traffic natively, LISP is bypassed, and you are debugging two paths at once. In the lab, CORE must stay without routes to 10.1.1.0/24 and 10.2.2.0/24.</p></div>

<div class="exam"><p><b>Exam trap.</b> The <b>ITR</b> encapsulates and sends Map-Requests; the <b>ETR</b> decapsulates and sends Map-Registers. The <b>map-server</b> takes registrations; the <b>map-resolver</b> takes requests. Many questions test exactly this split. Also: a PITR handles traffic <i>from</i> non-LISP sites, a PETR handles traffic <i>to</i> non-LISP sites.</p></div>

<div class="scn"><h4>The "unused" ISP link</h4><p>A retail chain gave every store two broadband links, but monitoring showed the second link idle. The store xTRs had database-mappings for both RLOCs, one with priority 1 and one with priority 2. The designer had intended load sharing but configured a backup. Changing the second RLOC to priority 1 with weights 50/50 split inbound traffic across both links within one map-cache refresh.</p><p><b>Lesson:</b> priority chooses <i>whether</i> a locator is used, weight chooses <i>how much</i>. Read both before blaming the ISP.</p></div>

<div class="iv"><p class="q">"What is the difference between an ITR, an ETR and a PxTR?"</p><p>Strong answer: the ITR is the LISP router on the sending side; it looks up the destination EID, queries the map-resolver on a miss and encapsulates toward the remote RLOC. The ETR is on the receiving side; it decapsulates and it registers local EIDs with the map-server. A PxTR connects LISP and non-LISP worlds: as PITR it attracts non-LISP traffic toward EIDs, as PETR it decapsulates traffic from LISP sites going to non-LISP destinations. Mention that SD-Access borders act as PxTRs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EID = host identity inside a site; RLOC = underlay address of the site's LISP router.</li>
<li>ITR encapsulates and resolves; ETR decapsulates and registers; xTR does both.</li>
<li>Map-server stores registrations; map-resolver answers requests; usually one box (MS/MR).</li>
<li>PITR/PETR (PxTR) connect LISP sites to non-LISP networks.</li>
<li>Lower priority wins; weight shares load among equal priorities; instance ID separates VNs.</li>
</ul></div>
`,hi:`
<p>Ek badi courier company socho. Har parcel ek <b>insaan</b> (identity) ke naam par hota hai. Company parcels ko insaan ke hisaab se route nahi karti; woh unhe <b>depots</b> (locations) ke beech route karti hai. Ek central <b>address book</b> batati hai kaunsa depot kis insaan ko serve karta hai. Jis depot se parcel network mein ghusta hai woh use depot-se-depot bag mein daalta hai; doosre end ka depot bag kholta hai aur parcel insaan ko de deta hai. LISP ka har term isi picture par fit hota hai.</p>

<h3>Do tarah ke address</h3>
<dl class="terms">
<dt>EID (Endpoint Identifier)</dt><dd>LISP site ke andar host ka IP address, jaise 10.1.1.10 par PC1. EIDs ko <b>EID prefixes</b> mein group kiya jaata hai jaise 10.1.1.0/24. EIDs site ke andar routable hain, lekin core mein advertise <b>nahi</b> hote. Yeh IPv4, IPv6 ya MAC addresses bhi ho sakte hain (SD-Access Layer 2 services ke liye MAC EIDs use karta hai).</dd>
<dt>RLOC (Routing Locator)</dt><dd>Site ke saamne wale LISP router ka IP address, jo underlay mein reachable hai. XTR1 100.64.1.2 use karta hai aur XTR2 100.64.2.2. Core sirf RLOCs route karta hai, aur kuch nahi. Do ISPs wali site ke bas do RLOCs hote hain.</dd>
<dt>EID space aur RLOC space</dt><dd>Do address duniyaan. Yeh numbers mein overlap bhi kar sakti hain, kyunki kabhi ek hi routing table mein nahi milti.</dd>
</dl>

<h3>Routers aur unke kaam</h3>
<dl class="terms">
<dt>ITR (Ingress Tunnel Router)</dt><dd>Apni site ke hosts se remote EID ke liye packets leta hai. Destination ko apne <b>map-cache</b> mein dhoondta hai; miss hone par mapping system se poochta hai; hit hone par packet ko remote RLOC ki taraf encapsulate karta hai. "Ingress" ka matlab LISP tunnel mein ghusna.</dd>
<dt>ETR (Egress Tunnel Router)</dt><dd>Core se LISP-encapsulated packets leta hai, outer header hatata hai aur original packet local EID ko forward karta hai. Yeh apni site ke EID prefixes ko map-server par <b>register</b> bhi karta hai aur unke Map-Requests ka jawab deta hai.</dd>
<dt>xTR</dt><dd>Jo router ITR bhi hai aur ETR bhi. Lagbhag har branch router xTR hota hai, jaise hamare lab mein XTR1 aur XTR2.</dd>
<dt>MS (Map-Server)</dt><dd>ETRs se <b>Map-Register</b> messages leta hai, unhe configured <b>sites</b> aur <b>authentication key</b> se check karta hai, aur EID-se-RLOC registrations store karta hai. Map-Requests ko us ETR tak forward karta hai jisne EID register kiya.</dd>
<dt>MR (Map-Resolver)</dt><dd>ITRs se <b>Map-Requests</b> leta hai aur mapping system mein jawab dhoondta hai. Agar koi site EID ko cover nahi karti, to <b>Negative Map-Reply</b> lautata hai. MS aur MR aksar ek hi box hote hain, likha jaata hai <b>MS/MR</b>; hamara lab 100.64.3.2 par MSMR use karta hai.</dd>
<dt>PITR (Proxy ITR)</dt><dd>Non-LISP sites (jaise Internet) se LISP EIDs ki taraf traffic kheenchta hai EID prefixes ko natively advertise karke, phir use sahi ETR ki taraf LISP-encapsulate karta hai.</dd>
<dt>PETR (Proxy ETR)</dt><dd>ITRs se aane wala woh LISP-encapsulated traffic leta hai jo non-LISP sites ke liye hai, decapsulate karke natively forward karta hai. Tab kaam aata hai jab ISP EID source wale packets drop kar deta (uRPF).</dd>
<dt>PxTR</dt><dd>Jo router PITR aur PETR dono ho. SD-Access mein <b>border nodes</b> fabric aur bahar ki duniya ke beech yahi role nibhate hain.</dd>
<dt>Mapping system</dt><dd>Poora MS/MR infrastructure, "routing ka DNS".</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="LISP lab roles">
<rect x="250" y="16" width="140" height="52" rx="8" fill="#ddd6fe"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">MSMR</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">MS/MR 100.64.3.2</text>
<rect x="250" y="120" width="140" height="48" rx="8" fill="#e2e8f0"/><text x="320" y="142" text-anchor="middle" class="svg-ink" font-size="14">CORE</text><text x="320" y="158" text-anchor="middle" class="svg-muted" font-size="12">sirf RLOCs route</text>
<rect x="40" y="120" width="150" height="48" rx="8" fill="#bae6fd"/><text x="115" y="142" text-anchor="middle" class="svg-ink" font-size="14">XTR1 (ITR+ETR)</text><text x="115" y="158" text-anchor="middle" class="svg-muted" font-size="12">RLOC 100.64.1.2</text>
<rect x="450" y="120" width="150" height="48" rx="8" fill="#bae6fd"/><text x="525" y="142" text-anchor="middle" class="svg-ink" font-size="14">XTR2 (ITR+ETR)</text><text x="525" y="158" text-anchor="middle" class="svg-muted" font-size="12">RLOC 100.64.2.2</text>
<rect x="40" y="230" width="150" height="48" rx="8" fill="#bbf7d0"/><text x="115" y="252" text-anchor="middle" class="svg-ink" font-size="13">PC1 10.1.1.10</text><text x="115" y="268" text-anchor="middle" class="svg-muted" font-size="12">EID 10.1.1.0/24</text>
<rect x="450" y="230" width="150" height="48" rx="8" fill="#bbf7d0"/><text x="525" y="252" text-anchor="middle" class="svg-ink" font-size="13">PC2 10.2.2.10</text><text x="525" y="268" text-anchor="middle" class="svg-muted" font-size="12">EID 10.2.2.0/24</text>
<line x1="190" y1="144" x2="250" y2="144" stroke="#64748b" stroke-width="2"/><line x1="390" y1="144" x2="450" y2="144" stroke="#64748b" stroke-width="2"/><line x1="320" y1="68" x2="320" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="115" y1="168" x2="115" y2="230" stroke="#64748b" stroke-width="2"/><line x1="525" y1="168" x2="525" y2="230" stroke="#64748b" stroke-width="2"/>
<text x="220" y="210" text-anchor="middle" class="svg-accent" font-size="12">EID space</text><text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">RLOC space 100.64.x.x</text><text x="420" y="210" text-anchor="middle" class="svg-accent" font-size="12">EID space</text>
</svg><p class="cap">Har LISP role ke saath lab topology. CORE kabhi 10.1.1.0/24 ya 10.2.2.0/24 nahi seekhta.</p></div>

<h3>Kuch aur terms jo milenge</h3>
<ul>
<li><b>Map-cache</b>: ITR ki seekhi hui EID-se-RLOC mappings ki table, har ek ka TTL (positive replies ke liye default 24 ghante).</li>
<li><b>Database-mapping</b>: ETR ki configured list, local EID prefixes aur unke RLOCs, <b>priority</b> aur <b>weight</b> ke saath.</li>
<li><b>Priority aur weight</b>: kam priority prefer hoti hai (1 best, 255 matlab "use mat karo"); barabar priority wale locators mein traffic weight se baant-ta hai (jaise 50/50).</li>
<li><b>Instance ID</b>: LISP header mein 24-bit number jo overlapping EIDs use karne wale virtual networks (VRFs) ko alag rakhta hai. SD-Access har Virtual Network ko ek instance ID se map karta hai.</li>
<li><b>LISP site</b>: map-server par ek named object (SITE-A) jo batata hai kaunse EID prefixes register ho sakte hain aur unhe kaunsi key use karni hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek branch ke do ISP links hain. Uska xTR ek EID prefix 10.5.5.0/24 advertise karta hai RLOC 198.51.100.2 (priority 1, weight 70) aur RLOC 203.0.113.2 (priority 1, weight 30) ke saath. Remote ITRs lagbhag 70 percent traffic pehle ISP ko aur 30 percent doosre ko bhejte hain, bina kisi BGP jugaad ke. Agar pehle RLOC ko priority 2 kar do, to woh pure backup ban jaata hai jo sirf tab use hota hai jab priority-1 locator down ho.</p></div>

<div class="warn"><p><b>Common galti.</b> "Safe rehne ke liye" EID prefix ko underlay IGP mein daal dena. Tab core EID traffic ko natively route karta hai, LISP bypass ho jaata hai, aur aap ek saath do paths debug kar rahe hote ho. Lab mein CORE ke paas 10.1.1.0/24 aur 10.2.2.0/24 ke routes nahi hone chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> <b>ITR</b> encapsulate karta hai aur Map-Requests bhejta hai; <b>ETR</b> decapsulate karta hai aur Map-Registers bhejta hai. <b>Map-server</b> registrations leta hai; <b>map-resolver</b> requests leta hai. Kai questions bilkul yahi split test karte hain. Aur: PITR non-LISP sites <i>se</i> aane wala traffic sambhalta hai, PETR non-LISP sites <i>ko</i> jaane wala.</p></div>

<div class="scn"><h4>"Bekaar" ISP link</h4><p>Ek retail chain ne har store ko do broadband links diye, lekin monitoring mein doosra link khaali dikha. Store xTRs par dono RLOCs ke database-mappings the, ek priority 1 aur ek priority 2 ke saath. Designer load sharing chahta tha lekin backup configure kar diya. Doosre RLOC ko priority 1 aur weights 50/50 karne se ek map-cache refresh ke andar inbound traffic dono links par bant gaya.</p><p><b>Seekh:</b> priority tay karti hai locator use <i>hoga ya nahi</i>, weight tay karta hai <i>kitna</i>. ISP ko dosh dene se pehle dono padho.</p></div>

<div class="iv"><p class="q">"ITR, ETR aur PxTR mein kya fark hai?"</p><p>Strong answer: ITR sending side ka LISP router hai; destination EID dhoondta hai, miss par map-resolver se poochta hai aur remote RLOC ki taraf encapsulate karta hai. ETR receiving side par hai; decapsulate karta hai aur local EIDs ko map-server par register karta hai. PxTR LISP aur non-LISP duniya ko jodta hai: PITR ki tarah non-LISP traffic ko EIDs ki taraf kheenchta hai, PETR ki tarah LISP sites se non-LISP destinations ko jaane wale traffic ko decapsulate karta hai. Batao ki SD-Access borders PxTR ka kaam karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EID = site ke andar host ki identity; RLOC = site ke LISP router ka underlay address.</li>
<li>ITR encapsulate aur resolve karta hai; ETR decapsulate aur register karta hai; xTR dono karta hai.</li>
<li>Map-server registrations store karta hai; map-resolver requests ka jawab deta hai; aksar ek box (MS/MR).</li>
<li>PITR/PETR (PxTR) LISP sites ko non-LISP networks se jodte hain.</li>
<li>Kam priority jeetti hai; weight barabar priorities mein load baant-ta hai; instance ID VNs ko alag karta hai.</li>
</ul></div>
`}};export{e as default};