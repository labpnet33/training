var e={id:`zoning-vsans`,h:{en:`VSANs, zoning, smart zoning and device aliases`,hi:`VSANs, zoning, smart zoning aur device aliases`},body:{en:`
<p>A SAN is shared by many teams. This chapter shows how to carve one physical fabric into safe pieces with <b>VSANs</b> and how to decide <b>who may talk to whom</b> with zoning, keeping the configuration small enough to manage at scale.</p>

<h3>The case: Pinecrest Retail</h3>
<div class="eg"><p><b>Customer.</b> Pinecrest Retail, 140 stores, one data center. Workloads: point-of-sale databases (production), an e-commerce platform (production), a data warehouse, and a test and development environment owned by a separate team. Four arrays, 90 hosts, 32G MDS fabrics A and B.</p><p><b>Pain.</b> The zoning database has grown to 1,900 zones, written by hand. Last quarter a developer mapped a test LUN to a production ESXi cluster by mistake, and a rescan broke two datastores. Zone changes take two days because nobody trusts them.</p><p><b>Requirements.</b> Isolate production from test; reduce zone count; make zone names readable; allow a safe change process with rollback; keep room for 50 percent more hosts.</p></div>

<h3>VSANs: virtual fabrics inside one switch</h3>
<p>A <b>VSAN</b> (Virtual SAN) is a logically separate fabric carved out of the same switches. Each VSAN has its own name server, zoning database, FSPF instance, domain IDs and RSCN scope. A fault or change in VSAN 10 does not touch VSAN 30. VSAN IDs range from 1 to 4093 (1 is the default and should not be used for production, 4094 is isolated). A port belongs to exactly one VSAN; an ISL carrying several VSANs is a <b>trunk</b> (TE port, with trunking enabled on an E port) and carries tagged frames.</p>
<p>Design rule: use VSANs for <b>administrative and failure isolation</b> (production, test, backup, replication) and use a different VSAN number per fabric where you can (A uses 10, B uses 20), so a mis-cabled link is easy to spot.</p>

<h3>Zoning: the access list of a SAN</h3>
<p>A <b>zone</b> is a set of members (WWPNs, FCIDs or device aliases) that may communicate. Several zones form a <b>zone set</b>; one zone set per VSAN is <b>active</b>. The default policy is deny: devices not in a common zone cannot see each other. Zoning is enforced in hardware by the switch.</p>
<ul>
<li><b>Single-initiator zoning.</b> One host port per zone with its targets. Prevents hosts from disturbing each other with RSCNs and logins. Long considered best practice, but it means many zones.</li>
<li><b>Single-initiator, single-target zoning.</b> Each zone has exactly one pair. Safest and most precise, but the zone count explodes.</li>
<li><b>Smart zoning.</b> On Cisco MDS, you mark each member as <b>init</b> (initiator) or <b>target</b>; the switch programs hardware entries only for initiator-to-target pairs, so one zone can hold many initiators and targets without wasted entries and without initiator-to-initiator access.</li>
</ul>

<table class="cmp"><tr><th>Method</th><th>Zones for 40 hosts and 4 array ports</th><th>Hardware entries</th><th>Readability</th></tr>
<tr><td>Single-initiator, single-target</td><td>160</td><td>Minimal</td><td>Very detailed</td></tr>
<tr><td>Single-initiator, multi-target</td><td>40</td><td>Minimal</td><td>Good</td></tr>
<tr><td>Smart zoning, one zone per application</td><td>1 to 5</td><td>Only init-to-target pairs</td><td>Best</td></tr>
<tr><td>Large zone, no smart zoning</td><td>1</td><td>Every pair, wasteful</td><td>Risky</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="VSANs with smart zones for production and test">
<rect x="10" y="10" width="300" height="200" rx="10" fill="#f0fdf4" stroke="#64748b" stroke-dasharray="4 3"/><text x="160" y="30" text-anchor="middle" class="svg-ink" font-size="13">VSAN 10 Production (fabric A)</text>
<rect x="330" y="10" width="300" height="200" rx="10" fill="#eff6ff" stroke="#64748b" stroke-dasharray="4 3"/><text x="480" y="30" text-anchor="middle" class="svg-ink" font-size="13">VSAN 30 Test (fabric A)</text>
<rect x="30" y="50" width="90" height="34" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="75" y="72" text-anchor="middle" class="svg-ink" font-size="12">esx-prod-01</text>
<rect x="30" y="100" width="90" height="34" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="75" y="122" text-anchor="middle" class="svg-ink" font-size="12">esx-prod-02</text>
<rect x="200" y="75" width="90" height="46" rx="6" fill="#ddd6fe" stroke="#64748b"/><text x="245" y="95" text-anchor="middle" class="svg-ink" font-size="12">Array P</text><text x="245" y="111" text-anchor="middle" class="svg-ink" font-size="12">tgt port</text>
<line x1="120" y1="67" x2="200" y2="92" stroke="#64748b" stroke-width="2"/><line x1="120" y1="117" x2="200" y2="105" stroke="#64748b" stroke-width="2"/>
<rect x="350" y="50" width="90" height="34" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="395" y="72" text-anchor="middle" class="svg-ink" font-size="12">esx-test-01</text>
<rect x="350" y="100" width="90" height="34" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="395" y="122" text-anchor="middle" class="svg-ink" font-size="12">esx-test-02</text>
<rect x="520" y="75" width="90" height="46" rx="6" fill="#ddd6fe" stroke="#64748b"/><text x="565" y="95" text-anchor="middle" class="svg-ink" font-size="12">Array T</text><text x="565" y="111" text-anchor="middle" class="svg-ink" font-size="12">tgt port</text>
<line x1="440" y1="67" x2="520" y2="92" stroke="#64748b" stroke-width="2"/><line x1="440" y1="117" x2="520" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="160" y="170" text-anchor="middle" class="svg-muted" font-size="12">Zone PROD_APP: init + init + tgt</text>
<text x="480" y="170" text-anchor="middle" class="svg-muted" font-size="12">Zone TEST_APP: init + init + tgt</text>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">Blue = hosts (initiators), purple = storage (targets), no path between VSANs</text>
</svg><p class="cap">Two VSANs on the same switch; a test host cannot reach a production array port.</p></div>

<h3>Device aliases: names instead of WWPNs</h3>
<p>A <b>device alias</b> maps a friendly name to a WWPN and is stored in a fabric-wide database that every zone can reference. Unlike older FC aliases, device aliases are VSAN-independent and survive moving a device between VSANs; in enhanced mode zones keep working even if you rename an alias in the database. Always run <code>device-alias mode enhanced</code> and distribute through CFS, then commit.</p>

<pre class="code"><span class="c">! device aliases (names are examples)</span>
device-alias database
  device-alias name esx-prod-01-hba0 pwwn 10:00:00:90:fa:aa:01:01
  device-alias name arrayP-ctrlA-p1  pwwn 50:00:09:72:08:00:11:01
device-alias commit
<span class="c">! smart zoning in VSAN 10</span>
zone smart-zoning enable vsan 10
zone name PROD_POS vsan 10
  member device-alias esx-prod-01-hba0 init
  member device-alias arrayP-ctrlA-p1 target
zoneset name ZS_A vsan 10
  member PROD_POS
zoneset activate name ZS_A vsan 10</pre>
<pre class="out">switch-a# show zoneset active vsan 10
zoneset name ZS_A vsan 10
  zone name PROD_POS vsan 10
  <span class="hl">* fcid 0x610100 [pwwn 10:00:00:90:fa:aa:01:01] [esx-prod-01-hba0]</span>
  * fcid 0x610200 [pwwn 50:00:09:72:08:00:11:01] [arrayP-ctrlA-p1]</pre>

<h3>Chosen design for Pinecrest</h3>
<p>Production in VSAN 10 (fabric A) and 20 (fabric B); test in VSAN 30 and 40; backup in VSAN 50 and 60. Enhanced zoning and enhanced device-alias mode. One smart zone per application (about 12 zones, down from 1,900), named APP_ENV (for example POS_PROD). Change process: edit the zone set in a session, run <code>show zone pending-diff</code>, commit, and keep the previous zone set text in version control for rollback. Fabric A first, B a week later.</p>

<div class="warn"><p><b>Common mistake.</b> Activating a zone set and forgetting that the full zone set (not only the active one) is what you edit. Also: a host on the wrong VSAN fails FLOGI into the wrong fabric and shows no storage, which looks like a zoning problem but is a port VSAN problem.</p></div>
<div class="exam"><p><b>Exam trap.</b> VSANs separate fabric services; zones restrict access inside one VSAN. Zoning cannot span VSANs. Smart zoning needs the init and target roles to be correct; a mislabelled target silently loses access.</p></div>

<div class="scn"><h4>The test LUN that broke production</h4><p>At Pinecrest, a developer was added to a large zone that mixed test and production initiators. A storage admin mapped a test LUN to "all hosts in the zone", and two production ESXi clusters saw an unexpected LUN; a rescan hit a datastore signature conflict. The fix was splitting test into its own VSAN and its own smart zones, and adding a rule that LUN masking on the array is the second line of defence after zoning.</p><p><b>Lesson:</b> zoning plus LUN masking plus VSAN isolation is defence in depth for storage.</p></div>

<div class="iv"><p class="q">"What is smart zoning and why would you use it?"</p><p>Strong answer: a Cisco MDS feature where each zone member is labelled initiator or target, so hardware programs only initiator-to-target entries. It lets you use fewer, larger, application-based zones without wasting TCAM or letting initiators see each other. Mention verifying roles and committing device aliases.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VSAN is a virtual fabric with its own services; ports belong to one VSAN.</li>
<li>Zones restrict access inside a VSAN; zone sets activate per VSAN.</li>
<li>Smart zoning labels init and target to cut zone count and hardware entries.</li>
<li>Device aliases make names readable and survive device moves.</li>
<li>Add LUN masking as a second layer, and keep rollback copies of zone sets.</li>
</ul></div>
`,hi:`
<p>SAN ko kai teams share karti hain. Yeh chapter dikhata hai ki ek physical fabric ko <b>VSANs</b> se safe hisson mein kaise baantte hain aur zoning se kaise tay karte hain ki <b>kaun kisse baat kar sakta hai</b>, taaki configuration scale par bhi manage ho sake.</p>

<h3>Case: Pinecrest Retail</h3>
<div class="eg"><p><b>Customer.</b> Pinecrest Retail, 140 stores, ek data center. Workloads: point-of-sale databases (production), e-commerce platform (production), data warehouse, aur alag team ka test aur development environment. Chaar arrays, 90 hosts, 32G MDS fabrics A aur B.</p><p><b>Pain.</b> Zoning database 1,900 zones tak badh gaya hai, haath se likhe hue. Pichhli quarter mein ek developer ne galti se test LUN production ESXi cluster ko map kar di, aur rescan se do datastores toot gaye. Zone changes mein do din lagte hain kyunki koi un par bharosa nahi karta.</p><p><b>Requirements.</b> Production ko test se isolate karo; zone count kam karo; zone names readable banao; rollback ke saath safe change process do; 50 percent zyada hosts ki jagah rakho.</p></div>

<h3>VSANs: ek switch ke andar virtual fabrics</h3>
<p><b>VSAN</b> (Virtual SAN) wahi switches se kata hua logically alag fabric hai. Har VSAN ka apna name server, zoning database, FSPF instance, domain IDs aur RSCN scope hota hai. VSAN 10 mein fault ya change VSAN 30 ko nahi chhoota. VSAN IDs 1 se 4093 tak hote hain (1 default hai aur production ke liye use nahi karna chahiye, 4094 isolated hai). Ek port sirf ek VSAN ka hota hai; kai VSANs carry karne wali ISL <b>trunk</b> hai (E port par trunking enable, yaani TE port) aur tagged frames le jaati hai.</p>
<p>Design rule: VSANs ko <b>administrative aur failure isolation</b> ke liye use karo (production, test, backup, replication) aur jahan ho sake har fabric ka alag VSAN number rakho (A mein 10, B mein 20), taaki galat cabling aasani se pakdi jaaye.</p>

<h3>Zoning: SAN ki access list</h3>
<p><b>Zone</b> members (WWPNs, FCIDs ya device aliases) ka set hai jo aapas mein baat kar sakte hain. Kai zones milkar <b>zone set</b> banate hain; har VSAN mein ek zone set <b>active</b> hota hai. Default policy deny hai: jo devices common zone mein nahi, woh ek doosre ko nahi dekh sakte. Zoning switch hardware mein enforce hoti hai.</p>
<ul>
<li><b>Single-initiator zoning.</b> Ek zone mein ek host port aur uske targets. Hosts ko RSCNs aur logins se ek doosre ko disturb karne se rokta hai. Lambe samay se best practice hai, par zones bahut ho jaate hain.</li>
<li><b>Single-initiator, single-target zoning.</b> Har zone mein exactly ek pair. Sabse safe aur precise, par zone count phat jaata hai.</li>
<li><b>Smart zoning.</b> Cisco MDS par har member ko <b>init</b> (initiator) ya <b>target</b> mark karte ho; switch sirf initiator-to-target pairs ke hardware entries banata hai, isliye ek zone mein kai initiators aur targets rakh sakte ho, bina entries waste kiye aur bina initiator-to-initiator access ke.</li>
</ul>

<table class="cmp"><tr><th>Method</th><th>40 hosts aur 4 array ports ke liye zones</th><th>Hardware entries</th><th>Readability</th></tr>
<tr><td>Single-initiator, single-target</td><td>160</td><td>Minimal</td><td>Bahut detailed</td></tr>
<tr><td>Single-initiator, multi-target</td><td>40</td><td>Minimal</td><td>Achhi</td></tr>
<tr><td>Smart zoning, har application ke liye ek zone</td><td>1 se 5</td><td>Sirf init-to-target pairs</td><td>Sabse achhi</td></tr>
<tr><td>Bada zone, smart zoning ke bina</td><td>1</td><td>Har pair, wasteful</td><td>Risky</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Production aur test ke liye smart zones wale VSANs">
<rect x="10" y="10" width="300" height="200" rx="10" fill="#f0fdf4" stroke="#64748b" stroke-dasharray="4 3"/><text x="160" y="30" text-anchor="middle" class="svg-ink" font-size="13">VSAN 10 Production (fabric A)</text>
<rect x="330" y="10" width="300" height="200" rx="10" fill="#eff6ff" stroke="#64748b" stroke-dasharray="4 3"/><text x="480" y="30" text-anchor="middle" class="svg-ink" font-size="13">VSAN 30 Test (fabric A)</text>
<rect x="30" y="50" width="90" height="34" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="75" y="72" text-anchor="middle" class="svg-ink" font-size="12">esx-prod-01</text>
<rect x="30" y="100" width="90" height="34" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="75" y="122" text-anchor="middle" class="svg-ink" font-size="12">esx-prod-02</text>
<rect x="200" y="75" width="90" height="46" rx="6" fill="#ddd6fe" stroke="#64748b"/><text x="245" y="95" text-anchor="middle" class="svg-ink" font-size="12">Array P</text><text x="245" y="111" text-anchor="middle" class="svg-ink" font-size="12">tgt port</text>
<line x1="120" y1="67" x2="200" y2="92" stroke="#64748b" stroke-width="2"/><line x1="120" y1="117" x2="200" y2="105" stroke="#64748b" stroke-width="2"/>
<rect x="350" y="50" width="90" height="34" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="395" y="72" text-anchor="middle" class="svg-ink" font-size="12">esx-test-01</text>
<rect x="350" y="100" width="90" height="34" rx="6" fill="#bae6fd" stroke="#64748b"/><text x="395" y="122" text-anchor="middle" class="svg-ink" font-size="12">esx-test-02</text>
<rect x="520" y="75" width="90" height="46" rx="6" fill="#ddd6fe" stroke="#64748b"/><text x="565" y="95" text-anchor="middle" class="svg-ink" font-size="12">Array T</text><text x="565" y="111" text-anchor="middle" class="svg-ink" font-size="12">tgt port</text>
<line x1="440" y1="67" x2="520" y2="92" stroke="#64748b" stroke-width="2"/><line x1="440" y1="117" x2="520" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="160" y="170" text-anchor="middle" class="svg-muted" font-size="12">Zone PROD_APP: init + init + tgt</text>
<text x="480" y="170" text-anchor="middle" class="svg-muted" font-size="12">Zone TEST_APP: init + init + tgt</text>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">Neela = hosts (initiators), purple = storage (targets), VSANs ke beech path nahi</text>
</svg><p class="cap">Ek hi switch par do VSANs; test host production array port tak nahi pahunch sakta.</p></div>

<h3>Device aliases: WWPN ki jagah naam</h3>
<p><b>Device alias</b> ek friendly naam ko WWPN se map karta hai aur fabric-wide database mein store hota hai jise har zone reference kar sakta hai. Purane FC aliases ke muqable device aliases VSAN-independent hote hain aur device ko doosre VSAN mein le jaane par bhi kaam karte hain; enhanced mode mein database mein alias rename karne par bhi zones chalte rehte hain. Hamesha <code>device-alias mode enhanced</code> chalao, CFS se distribute karo, phir commit karo.</p>

<pre class="code"><span class="c">! device aliases (names examples hain)</span>
device-alias database
  device-alias name esx-prod-01-hba0 pwwn 10:00:00:90:fa:aa:01:01
  device-alias name arrayP-ctrlA-p1  pwwn 50:00:09:72:08:00:11:01
device-alias commit
<span class="c">! VSAN 10 mein smart zoning</span>
zone smart-zoning enable vsan 10
zone name PROD_POS vsan 10
  member device-alias esx-prod-01-hba0 init
  member device-alias arrayP-ctrlA-p1 target
zoneset name ZS_A vsan 10
  member PROD_POS
zoneset activate name ZS_A vsan 10</pre>
<pre class="out">switch-a# show zoneset active vsan 10
zoneset name ZS_A vsan 10
  zone name PROD_POS vsan 10
  <span class="hl">* fcid 0x610100 [pwwn 10:00:00:90:fa:aa:01:01] [esx-prod-01-hba0]</span>
  * fcid 0x610200 [pwwn 50:00:09:72:08:00:11:01] [arrayP-ctrlA-p1]</pre>

<h3>Pinecrest ke liye chosen design</h3>
<p>Production VSAN 10 (fabric A) aur 20 (fabric B) mein; test VSAN 30 aur 40 mein; backup VSAN 50 aur 60 mein. Enhanced zoning aur enhanced device-alias mode. Har application ke liye ek smart zone (lagbhag 12 zones, 1,900 se kam), naam APP_ENV format mein (jaise POS_PROD). Change process: session mein zone set edit karo, <code>show zone pending-diff</code> chalao, commit karo, aur rollback ke liye purane zone set ka text version control mein rakho. Pehle fabric A, ek hafta baad B.</p>

<div class="warn"><p><b>Common mistake.</b> Zone set activate karna aur bhool jaana ki edit full zone set hota hai, sirf active nahi. Saath hi: galat VSAN par host galat fabric mein FLOGI karta hai aur storage nahi dikhta; yeh zoning problem jaisa lagta hai par asal mein port VSAN problem hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> VSANs fabric services alag karte hain; zones ek VSAN ke andar access restrict karte hain. Zoning VSANs ke beech span nahi karti. Smart zoning mein init aur target roles sahi hone chahiye; galat label wala target chupchaap access kho deta hai.</p></div>

<div class="scn"><h4>Test LUN jisne production tod diya</h4><p>Pinecrest mein ek developer ko aise bade zone mein jodd diya gaya jisme test aur production initiators mile hue the. Storage admin ne test LUN ko "zone ke saare hosts" ko map kar diya, aur do production ESXi clusters ko ek unexpected LUN dikhi; rescan par datastore signature conflict aaya. Fix: test ko apne VSAN aur apne smart zones mein alag kiya, aur rule banaya ki array par LUN masking zoning ke baad doosri line of defence hai.</p><p><b>Lesson:</b> zoning plus LUN masking plus VSAN isolation storage ke liye defence in depth hai.</p></div>

<div class="iv"><p class="q">"Smart zoning kya hai aur use kyun karoge?"</p><p>Strong answer: Cisco MDS feature jisme har zone member initiator ya target label hota hai, isliye hardware sirf initiator-to-target entries program karta hai. Isse kam, bade, application-based zones use kar sakte ho bina TCAM waste kiye aur bina initiators ko ek doosre ko dikhaye. Roles verify karna aur device aliases commit karna zaroor bolo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VSAN apne services wala virtual fabric hai; port ek hi VSAN ka hota hai.</li>
<li>Zones ek VSAN ke andar access restrict karte hain; zone sets har VSAN mein activate hote hain.</li>
<li>Smart zoning init aur target label karke zone count aur hardware entries kam karti hai.</li>
<li>Device aliases names readable banate hain aur device move par bhi chalte hain.</li>
<li>Doosri layer ke roop mein LUN masking lagao, aur zone sets ke rollback copies rakho.</li>
</ul></div>
`}};export{e as default};