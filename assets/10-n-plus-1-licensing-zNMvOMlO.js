var e={id:`n-plus-1-licensing`,h:{en:`N+1, SSO versus N+1, capacity and licensing models (concept only)`,hi:`N+1, SSO versus N+1, capacity aur licensing models (concept only)`},body:{en:`
<div class="note"><p><b>Concept only.</b> The simulator models the AP controller list (chapter 8) but not N+1 as a design, capacity limits or licensing. Platform limits and licence names change with releases, so this chapter teaches the <b>design logic</b> and tells you where to confirm the numbers (the data sheet and the licensing guide for your release).</p></div>

<h3>N+1: one spare for many</h3>
<p>HA SSO gives each controller a dedicated twin: N controllers need 2N boxes. Often that is too expensive. <b>N+1</b> keeps <b>one</b> backup controller for <b>N</b> primary controllers. Each AP carries a controller list (primary and secondary) as in chapter 8; the secondary is always the shared backup. If any primary dies, all of its APs join the backup. It is a pool of insurance, like having one spare tyre for four cars that never break down on the same day.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="N+1 design">
<rect x="20" y="30" width="140" height="50" rx="8" fill="#bae6fd"/><text x="90" y="60" text-anchor="middle" class="svg-ink" font-size="13">WLC A (primary)</text>
<rect x="190" y="30" width="140" height="50" rx="8" fill="#bae6fd"/><text x="260" y="60" text-anchor="middle" class="svg-ink" font-size="13">WLC B (primary)</text>
<rect x="360" y="30" width="140" height="50" rx="8" fill="#bae6fd"/><text x="430" y="60" text-anchor="middle" class="svg-ink" font-size="13">WLC C (primary)</text>
<rect x="190" y="160" width="140" height="60" rx="8" fill="#fde68a"/><text x="260" y="186" text-anchor="middle" class="svg-ink" font-size="13">WLC S (shared backup)</text><text x="260" y="206" text-anchor="middle" class="svg-ink" font-size="11">capacity at least the largest primary</text>
<line x1="90" y1="80" x2="230" y2="160" stroke="#7c3aed" stroke-dasharray="5 4"/><line x1="260" y1="80" x2="260" y2="160" stroke="#7c3aed" stroke-dasharray="5 4"/><line x1="430" y1="80" x2="290" y2="160" stroke="#7c3aed" stroke-dasharray="5 4"/>
<text x="560" y="60" text-anchor="middle" class="svg-muted" font-size="12">APs: primary = own WLC</text><text x="560" y="78" text-anchor="middle" class="svg-muted" font-size="12">secondary = WLC S</text>
</svg><p class="cap">N+1: three primaries share one backup. The backup needs the configuration, WLANs, tags and licences of every primary it may take over.</p></div>

<h3>SSO versus N+1 versus AP lists alone</h3>
<table class="cmp"><tr><th></th><th>HA SSO</th><th>N+1</th><th>Controller list only (no spare)</th></tr>
<tr><td>Hardware</td><td>2 per site (1+1)</td><td>1 spare for N</td><td>Other primaries absorb the load</td></tr>
<tr><td>State sync</td><td>Yes, APs and clients</td><td>No</td><td>No</td></tr>
<tr><td>Failover time</td><td>Seconds, sessions kept</td><td>AP join time (tens of seconds or more), clients re-associate</td><td>Same as N+1</td></tr>
<tr><td>Config sync</td><td>Automatic</td><td>Manual or tooling (Catalyst Center, templates, scripts)</td><td>Manual or tooling</td></tr>
<tr><td>Site failure</td><td>Not covered by a co-located pair</td><td>Covered if the spare is at another site</td><td>Covered if another site has capacity</td></tr>
<tr><td>Cost</td><td>Highest</td><td>Lower</td><td>Lowest</td></tr>
</table>
<p>The designs combine. A common high-end answer is an <b>SSO pair at each main site</b> (no session loss for a box failure) plus <b>N+1 between sites</b> (the second site's pair is the secondary for the first), covering both box and site loss.</p>

<h3>Capacity is the heart of the design</h3>
<p>Whatever form you use, the surviving controller must be able to carry the load of the failed one. The usual rule: the backup's <b>AP and client capacity</b> must be at least that of the <b>largest primary</b> it protects (for a single failure), and the combined throughput after failover must still fit its interfaces. Controller sizes differ by platform; as a rough orientation, the 9800-L handles a few hundred APs, the 9800-40 about two thousand and the 9800-80 about six thousand. Always confirm with the current data sheet, because limits change with releases and with modes such as FlexConnect.</p>

<div class="eg"><p><b>Worked example.</b> Three campuses run 9800-40 controllers carrying 900, 1100 and 700 APs. A 9800-40 can hold 2000 APs. A single shared backup 9800-40 covers any one failure (the largest is 1100 APs, under 2000). If two campuses failed together (1100 plus 900 = 2000) it would just be at its limit, so the company decides that is acceptable. It also pre-stages tags, WLANs and policy profiles for all three campuses on the backup, and plans licences for 2000 APs on that unit.</p></div>

<h3>Licensing models</h3>
<p>Wireless licensing has changed a lot, and you must know both generations for exams and for upgrades.</p>
<dl class="terms">
<dt>AireOS (legacy)</dt><dd>Perpetual <b>AP count licences</b> installed on each controller. A <b>HA-SKU</b> standby unit carried no AP licences of its own and borrowed the primary's, which made HA cheap but tied the pair together. Failover to another controller needed enough licences on that unit.</dd>
<dt>Catalyst 9800 smart licensing</dt><dd>Licences belong to a <b>Smart Account</b> rather than to a serial number. Modern IOS XE uses <b>Smart Licensing Using Policy</b> (introduced in release 17.3.2): the controller reports usage according to a policy instead of staying permanently connected to the licence server. Each AP needs a licence at the level you chose (network and subscription tiers named Essentials and Advantage, with terms of three, five or seven years). Product names change over time; read the licensing guide for your release.</dd>
<dt>HA SSO pair</dt><dd>Licensed as <b>one</b> logical controller.</dd>
<dt>N+1 backup</dt><dd>An AP is counted where it is joined. If a backup suddenly takes 1100 APs after a failure, it reports 1100. Plan the Smart Account pool and any controller-side limits for the <b>failure case</b>, not just normal operation, and check how your release enforces it.</dd>
</dl>
<p>Also worth knowing for the exam: AP licence tier decides features (for example, location services and some automation features need the higher tier), a controller never "removes" a feature by failover alone, and a lab or evaluation licence is not for production.</p>

<h3>Putting a failover design on paper</h3>
<ol>
<li>List AP counts per controller and per site, and the growth plan.</li>
<li>Decide which failures you must survive: box, site, WAN link.</li>
<li>Choose the pattern: SSO for no session loss, N+1 for lower cost, combine for site cover.</li>
<li>Size the backup for the worst accepted failure; stage configuration and tags there.</li>
<li>Set AP controller lists or priming profiles, and join priority for critical APs.</li>
<li>Plan licences for the failure case; test by failing a controller on purpose.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Buying an N+1 spare smaller than the largest primary. Forgetting to keep the backup's configuration in sync after changes on the primaries. Counting licences only for normal operation. Assuming N+1 keeps client sessions. Putting both SSO units in one rack and calling it site redundancy.</p></div>

<div class="exam"><p><b>Exam trap.</b> N+1 has <b>no</b> state synchronisation, so clients re-associate and can change address (as in the lab). SSO <b>does</b> synchronise state but protects only against box failure when co-located. If the question says "no client interruption", the answer is SSO; if it says "lowest cost for many controllers", the answer is N+1.</p></div>

<div class="scn"><h4>The spare that was too small</h4><p>A retailer bought one 9800-L as a backup for four regional 9800-40 controllers. When a regional controller failed with 1400 APs, the 9800-L accepted a few hundred and rejected the rest. Stores went dark one by one in join-priority order, because someone had at least set priorities; stores with priority 1 stayed offline for four hours until the primary was repaired. The next budget bought a 9800-40 backup, and the design document gained a line: backup capacity at least the largest primary.</p><p><b>Lesson:</b> the arithmetic of redundancy matters more than the box count.</p></div>

<div class="iv"><p class="q">"You have four sites with 9800 controllers and a limited budget. How do you provide redundancy?"</p><p>Ask what failures matter and whether sessions must survive. For lowest cost use N+1: one backup sized for the largest primary, APs with primary and secondary controllers, staged configuration and licences for the failure case. For critical sites add an SSO pair. Mention AP join priority, fallback, config sync tooling, and testing failover.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>N+1 = one backup for N primaries, using AP controller lists; no state sync, clients re-associate.</li>
<li>SSO = stateful and fast, 2 boxes per pair; N+1 = cheaper and covers site loss if the spare is elsewhere.</li>
<li>Backup capacity must cover the largest primary, with configuration and tags staged.</li>
<li>9800 uses smart licensing (Smart Licensing Using Policy); an SSO pair is licensed as one; plan licences for the failure case.</li>
<li>AireOS used AP count licences and HA-SKU; know the difference.</li>
<li>All of this is concept only in the simulator.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Concept only.</b> Simulator AP controller list (chapter 8) model karta hai lekin N+1 ko design ke taur par, capacity limits ya licensing ko nahi. Platform limits aur licence names releases ke saath badalte hain, isliye yeh chapter <b>design logic</b> sikhata hai aur batata hai ki numbers kahan confirm karne hain (aapki release ka data sheet aur licensing guide).</p></div>

<h3>N+1: bahut ke liye ek spare</h3>
<p>HA SSO har controller ko dedicated twin deta hai: N controllers ke liye 2N boxes. Aksar yeh bahut mehnga hota hai. <b>N+1</b> <b>N</b> primary controllers ke liye <b>ek</b> backup controller rakhta hai. Har AP ke paas controller list (primary aur secondary) hoti hai jaisa chapter 8 mein; secondary hamesha shared backup hota hai. Koi bhi primary mar jaaye to uske saare APs backup join karte hain. Yeh insurance ka pool hai, jaise chaar gaadiyon ke liye ek spare tyre jo kabhi ek hi din kharab nahi hoti.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="N+1 design">
<rect x="20" y="30" width="140" height="50" rx="8" fill="#bae6fd"/><text x="90" y="60" text-anchor="middle" class="svg-ink" font-size="13">WLC A (primary)</text>
<rect x="190" y="30" width="140" height="50" rx="8" fill="#bae6fd"/><text x="260" y="60" text-anchor="middle" class="svg-ink" font-size="13">WLC B (primary)</text>
<rect x="360" y="30" width="140" height="50" rx="8" fill="#bae6fd"/><text x="430" y="60" text-anchor="middle" class="svg-ink" font-size="13">WLC C (primary)</text>
<rect x="190" y="160" width="140" height="60" rx="8" fill="#fde68a"/><text x="260" y="186" text-anchor="middle" class="svg-ink" font-size="13">WLC S (shared backup)</text><text x="260" y="206" text-anchor="middle" class="svg-ink" font-size="11">capacity kam se kam sabse bade primary jitni</text>
<line x1="90" y1="80" x2="230" y2="160" stroke="#7c3aed" stroke-dasharray="5 4"/><line x1="260" y1="80" x2="260" y2="160" stroke="#7c3aed" stroke-dasharray="5 4"/><line x1="430" y1="80" x2="290" y2="160" stroke="#7c3aed" stroke-dasharray="5 4"/>
<text x="560" y="60" text-anchor="middle" class="svg-muted" font-size="12">APs: primary = apna WLC</text><text x="560" y="78" text-anchor="middle" class="svg-muted" font-size="12">secondary = WLC S</text>
</svg><p class="cap">N+1: teen primaries ek backup share karte hain. Backup ko un sab primaries ka configuration, WLANs, tags aur licences chahiye jinhe woh take over kar sakta hai.</p></div>

<h3>SSO versus N+1 versus sirf AP lists</h3>
<table class="cmp"><tr><th></th><th>HA SSO</th><th>N+1</th><th>Sirf controller list (spare nahi)</th></tr>
<tr><td>Hardware</td><td>Har site par 2 (1+1)</td><td>N ke liye 1 spare</td><td>Doosre primaries load absorb karte hain</td></tr>
<tr><td>State sync</td><td>Haan, APs aur clients</td><td>Nahi</td><td>Nahi</td></tr>
<tr><td>Failover time</td><td>Seconds, sessions kept</td><td>AP join time (tens of seconds ya zyada), clients re-associate</td><td>N+1 jaisa</td></tr>
<tr><td>Config sync</td><td>Automatic</td><td>Manual ya tooling (Catalyst Center, templates, scripts)</td><td>Manual ya tooling</td></tr>
<tr><td>Site failure</td><td>Co-located pair se cover nahi</td><td>Cover agar spare doosre site par</td><td>Cover agar doosre site mein capacity ho</td></tr>
<tr><td>Cost</td><td>Sabse zyada</td><td>Kam</td><td>Sabse kam</td></tr>
</table>
<p>Designs mil bhi jaate hain. Ek aam high-end jawab hai <b>har main site par SSO pair</b> (box failure par session loss nahi) plus <b>sites ke beech N+1</b> (doosre site ki pair pehle site ki secondary), jo box aur site dono loss cover karta hai.</p>

<h3>Capacity design ka dil hai</h3>
<p>Jo bhi form use karo, bacha hua controller failed controller ka load uthane layak hona chahiye. Usual rule: backup ki <b>AP aur client capacity</b> us <b>sabse bade primary</b> jitni ho jise woh protect karta hai (single failure ke liye), aur failover ke baad combined throughput abhi bhi uske interfaces mein fit ho. Controller sizes platform ke hisaab se alag hain; rough orientation ke liye 9800-L kuch sau APs handle karta hai, 9800-40 lagbhag do hazaar aur 9800-80 lagbhag chhe hazaar. Hamesha current data sheet se confirm karo, kyunki limits releases aur FlexConnect jaise modes ke saath badalti hain.</p>

<div class="eg"><p><b>Worked example.</b> Teen campuses 9800-40 controllers chalate hain jo 900, 1100 aur 700 APs carry karte hain. 9800-40 2000 APs rakh sakta hai. Ek shared backup 9800-40 koi bhi ek failure cover karta hai (sabse bada 1100 APs hai, 2000 se kam). Agar do campuses saath fail hon (1100 plus 900 = 2000) to woh bas apni limit par hoga, isliye company decide karti hai ki yeh acceptable hai. Woh backup par teeno campuses ke tags, WLANs aur policy profiles pre-stage bhi karti hai, aur us unit par 2000 APs ke licences plan karti hai.</p></div>

<h3>Licensing models</h3>
<p>Wireless licensing bahut badla hai, aur exams aur upgrades ke liye dono generations aani chahiye.</p>
<dl class="terms">
<dt>AireOS (legacy)</dt><dd>Har controller par install hone wale perpetual <b>AP count licences</b>. <b>HA-SKU</b> standby unit ke paas apne AP licences nahi hote the aur woh primary ke licences udhaar leta tha, jisse HA sasta hota par pair ek doosre se bandh jaati. Doosre controller par failover ke liye us unit par kaafi licences chahiye the.</dd>
<dt>Catalyst 9800 smart licensing</dt><dd>Licences serial number ki jagah ek <b>Smart Account</b> ke hote hain. Modern IOS XE <b>Smart Licensing Using Policy</b> use karta hai (release 17.3.2 mein aaya): controller licence server se permanently connected rehne ki jagah policy ke hisaab se usage report karta hai. Har AP ko aapke chune level ka licence chahiye (network aur subscription tiers jinke naam Essentials aur Advantage hain, teen, paanch ya saat saal ke terms ke saath). Product names waqt ke saath badalte hain; apni release ka licensing guide padho.</dd>
<dt>HA SSO pair</dt><dd><b>Ek</b> logical controller ki tarah licensed.</dd>
<dt>N+1 backup</dt><dd>AP wahan gina jaata hai jahan woh joined hai. Agar backup failure ke baad achanak 1100 APs le le to woh 1100 report karta hai. Smart Account pool aur controller-side limits ko <b>failure case</b> ke liye plan karo, sirf normal operation ke liye nahi, aur check karo ki aapki release ise kaise enforce karti hai.</dd>
</dl>
<p>Exam ke liye yeh bhi jaano: AP licence tier features decide karta hai (jaise location services aur kuch automation features ko higher tier chahiye), controller sirf failover se koi feature "remove" nahi karta, aur lab ya evaluation licence production ke liye nahi hota.</p>

<h3>Failover design ko kaagaz par utarna</h3>
<ol>
<li>Har controller aur har site ke AP counts aur growth plan list karo.</li>
<li>Decide karo kaun se failures survive karne hain: box, site, WAN link.</li>
<li>Pattern chuno: session loss na ho to SSO, kam cost ke liye N+1, site cover ke liye combine.</li>
<li>Backup ko sabse bure accepted failure ke liye size karo; wahan configuration aur tags stage karo.</li>
<li>AP controller lists ya priming profiles set karo, aur critical APs ke liye join priority.</li>
<li>Failure case ke liye licences plan karo; jaan boojh kar controller fail karke test karo.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Sabse bade primary se chhota N+1 spare khareedna. Primaries par changes ke baad backup ka configuration sync rakhna bhool jaana. Licences sirf normal operation ke liye gina. Maan lena ki N+1 client sessions rakhta hai. Dono SSO units ek rack mein rakh kar ise site redundancy kehna.</p></div>

<div class="exam"><p><b>Exam trap.</b> N+1 mein state synchronisation <b>nahi</b> hai, isliye clients re-associate karte hain aur address badal sakta hai (jaise lab mein). SSO state synchronise <b>karta</b> hai lekin co-located hone par sirf box failure se bachata hai. Agar sawal kahe "no client interruption" to jawab SSO; agar kahe "bahut controllers ke liye sabse kam cost" to jawab N+1.</p></div>

<div class="scn"><h4>Bahut chhota spare</h4><p>Ek retailer ne chaar regional 9800-40 controllers ke backup ke liye ek 9800-L khareeda. Jab ek regional controller 1400 APs ke saath fail hua, 9800-L ne kuch sau accept kiye aur baaki reject kiye. Stores ek ek karke join-priority order mein andhere ho gaye, kyunki kisi ne kam se kam priorities set ki thi; priority 1 wale stores primary repair hone tak chaar ghante offline rahe. Agle budget ne 9800-40 backup khareeda, aur design document mein ek line judi: backup capacity kam se kam sabse bade primary jitni.</p><p><b>Lesson:</b> redundancy ka arithmetic box count se zyada matter karta hai.</p></div>

<div class="iv"><p class="q">"Aapke paas chaar sites par 9800 controllers hain aur limited budget hai. Redundancy kaise doge?"</p><p>Pehle poocho kaun se failures matter karte hain aur sessions bachne chahiye ya nahi. Sabse kam cost ke liye N+1 use karo: sabse bade primary ke size ka ek backup, primary aur secondary controllers wale APs, staged configuration aur failure case ke licences. Critical sites ke liye SSO pair jodo. AP join priority, fallback, config sync tooling aur failover testing mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>N+1 = N primaries ke liye ek backup, AP controller lists se; state sync nahi, clients re-associate.</li>
<li>SSO = stateful aur fast, pair mein 2 boxes; N+1 = sasta aur spare doosre site par ho to site loss cover karta hai.</li>
<li>Backup capacity sabse bade primary ko cover kare, configuration aur tags staged ho.</li>
<li>9800 smart licensing (Smart Licensing Using Policy) use karta hai; SSO pair ek ki tarah licensed; failure case ke liye licences plan karo.</li>
<li>AireOS AP count licences aur HA-SKU use karta tha; farak jaano.</li>
<li>Yeh sab simulator mein concept only hai.</li>
</ul></div>
`}};export{e as default};