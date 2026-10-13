var e={id:`why-validate`,h:{en:`Prove the change worked: the big picture`,hi:`Saabit karo ki change chala: big picture`},body:{en:`
<p><b>What you will learn.</b> A change is not finished when the commit succeeds. It is finished when you can show that the network still works the way it did before, and that only the things you wanted to change did change. In this module you build that proof in Python on three Junos routers. You will take <b>snapshots</b> of the network state before and after a change with JSNAPy, write test files that say what "healthy" means, repeat the same expectations in <b>pytest</b>, compare state as data with <b>deepdiff</b>, and wrap everything in a <b>gate</b>: a script that pushes a change with a confirmed commit and keeps it only if the checks pass. In the last chapter of the lab you learn the hardest skill of all: distrusting a green result.</p>
<p><b>Prerequisites.</b> <code>py-pytest</code> (asserts, fixtures, parametrize), <code>auto-testing</code> (pre and post checks in a script), <code>adv-pyez</code> (<code>Device</code>, RPCs, tables) and <code>adv-pyez-config</code> (<code>Config.load</code>, <code>diff</code>, <code>commit(confirm=...)</code>). We assume you can already push a change safely; here we prove it afterwards. The module <code>adv-verify</code> checks a change <i>before</i> it reaches a device (schema and Batfish); this one checks the <i>live network after</i> it.</p>

<h3>An analogy: handing over a flat</h3>
<p>When a builder hands over a flat, a careful buyer does two things. Before the work starts, the buyer photographs every room and notes which lights and taps work. After the work, the buyer walks through again with the same list. The photographs make an argument possible: "this tap worked before, it does not now". Without the "before" photos, every complaint becomes one person's word against another's. A network change is the same. The <b>pre snapshot</b> is the photograph before, the <b>post snapshot</b> is the photograph after, and the test file is the walk-through list.</p>

<h3>The words we will use</h3>
<dl class="terms">
<dt>State</dt><dd>What the network is doing now: OSPF neighbours, BGP sessions, interface status, routes. Not the configuration, which is what you asked it to do.</dd>
<dt>Snapshot</dt><dd>A saved copy of some state, here one XML file per router and per command.</dd>
<dt>Health check</dt><dd>A rule that says what good state looks like, for example "every OSPF neighbour is Full".</dd>
<dt>Regression</dt><dd>Something that worked before the change and does not now. Pre and post comparison finds regressions; a state-only check cannot.</dd>
<dt>Gate</dt><dd>A step in a pipeline that stops the pipeline when a check fails.</dd>
</dl>

<h3>Why "it still pings" is not validation</h3>
<p>Our lab network has three routers, J1, J2 and J3, connected in a triangle and also through a management switch. They run OSPF in area 0 and an iBGP full mesh between their loopbacks. J2 has four OSPF neighbours when it is healthy.</p>
<pre class="out">J2&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.99.0.11       ge-0/0/0.0             Full            10.255.0.1       128    31
10.99.0.13       ge-0/0/0.0             Full            10.255.0.3       128    33
10.12.0.1        ge-0/0/1.0             Full            10.255.0.1       128    40
<span class="hl">10.23.0.2        ge-0/0/2.0             Full            10.255.0.3       128    32</span></pre>
<p>Now somebody switches off the wrong port on J2, the one towards J3. J2 and J3 can still reach each other through the management switch, so BGP stays up, ping works and nobody complains. But one OSPF adjacency is gone and the redundancy you designed has quietly disappeared. A check that only asked "are my BGP sessions up?" would pass. A check that remembers the neighbours from before the change would not.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Triangle of three routers with one failed link and a management switch that hides the failure">
<rect x="270" y="168" width="100" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="193" text-anchor="middle" class="svg-ink" font-size="13">SW1 (mgmt)</text>
<rect x="60" y="20" width="90" height="44" rx="10" fill="#bbf7d0"/><text x="105" y="47" text-anchor="middle" class="svg-ink" font-size="13">J1</text>
<rect x="490" y="20" width="90" height="44" rx="10" fill="#fde68a"/><text x="535" y="47" text-anchor="middle" class="svg-ink" font-size="13">J2</text>
<rect x="275" y="100" width="90" height="44" rx="10" fill="#bbf7d0"/><text x="320" y="127" text-anchor="middle" class="svg-ink" font-size="13">J3</text>
<line x1="150" y1="42" x2="490" y2="42" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="58" x2="285" y2="102" stroke="#64748b" stroke-width="2"/>
<line x1="495" y1="62" x2="365" y2="108" stroke="#dc2626" stroke-width="3" stroke-dasharray="6 5"/>
<text x="450" y="104" class="svg-accent" font-size="12">link down</text>
<line x1="105" y1="64" x2="290" y2="170" stroke="#94a3b8" stroke-width="1.5"/><line x1="535" y1="64" x2="360" y2="170" stroke="#94a3b8" stroke-width="1.5"/><line x1="320" y1="144" x2="320" y2="168" stroke="#94a3b8" stroke-width="1.5"/>
<text x="30" y="205" class="svg-muted" font-size="12">BGP between loopbacks still works through SW1, so a BGP-only check stays green.</text>
</svg><p class="cap">The failed J2 to J3 link is hidden by the management path. Only a before and after comparison of OSPF neighbours sees it.</p></div>

<h3>The six steps of a validated change</h3>
<div class="dia"><svg viewBox="0 0 640 100" role="img" aria-label="Six steps: pre-check, pre snapshot, change, settle, post check, confirm or roll back">
<rect x="8" y="20" width="94" height="56" rx="10" fill="#bae6fd"/><text x="55" y="44" text-anchor="middle" class="svg-ink" font-size="12">1 Pre-check</text><text x="55" y="62" text-anchor="middle" class="svg-muted" font-size="11">start healthy?</text>
<rect x="114" y="20" width="94" height="56" rx="10" fill="#ddd6fe"/><text x="161" y="44" text-anchor="middle" class="svg-ink" font-size="12">2 Pre snapshot</text><text x="161" y="62" text-anchor="middle" class="svg-muted" font-size="11">save state</text>
<rect x="220" y="20" width="94" height="56" rx="10" fill="#fde68a"/><text x="267" y="44" text-anchor="middle" class="svg-ink" font-size="12">3 Change</text><text x="267" y="62" text-anchor="middle" class="svg-muted" font-size="11">confirm 2 min</text>
<rect x="326" y="20" width="94" height="56" rx="10" fill="#fed7aa"/><text x="373" y="44" text-anchor="middle" class="svg-ink" font-size="12">4 Settle</text><text x="373" y="62" text-anchor="middle" class="svg-muted" font-size="11">wait, converge</text>
<rect x="432" y="20" width="94" height="56" rx="10" fill="#ddd6fe"/><text x="479" y="44" text-anchor="middle" class="svg-ink" font-size="12">5 Post check</text><text x="479" y="62" text-anchor="middle" class="svg-muted" font-size="11">pre vs post</text>
<rect x="538" y="20" width="94" height="56" rx="10" fill="#bbf7d0"/><text x="585" y="44" text-anchor="middle" class="svg-ink" font-size="12">6 Decide</text><text x="585" y="62" text-anchor="middle" class="svg-muted" font-size="11">confirm or back</text>
<line x1="102" y1="48" x2="114" y2="48" stroke="#64748b" stroke-width="2"/><line x1="208" y1="48" x2="220" y2="48" stroke="#64748b" stroke-width="2"/><line x1="314" y1="48" x2="326" y2="48" stroke="#64748b" stroke-width="2"/><line x1="420" y1="48" x2="432" y2="48" stroke="#64748b" stroke-width="2"/><line x1="526" y1="48" x2="538" y2="48" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The pipeline you build in this module. Each chapter adds one box.</p></div>

<div class="eg"><p><b>Worked example: the ticket.</b> Change CHG-3105 says "switch off the unused port ge-0/0/4 on J2". The script pushes it, the commit succeeds, the CLI prints no error. Done? Only if you can answer three questions with evidence: did anything stop working, did the port really go down, and did anything else change? By the end of Lab 1 your tools answer all three, and the third one, the one people forget, is where deepdiff earns its place.</p></div>

<h3>The tools and the lab</h3>
<table class="cmp"><tr><th>Tool</th><th>Good at</th><th>Chapter</th></tr>
<tr><td>PyEZ and lxml</td><td>Taking and reading snapshots by hand</td><td>2</td></tr>
<tr><td>JSNAPy (<code>SnapAdmin</code>)</td><td>Declarative tests, pre and post comparison, a report per router</td><td>3, 4, 5</td></tr>
<tr><td>pytest</td><td>The same checks inside a normal test suite and CI</td><td>6</td></tr>
<tr><td>deepdiff</td><td>"What exactly is different?" between two dictionaries</td><td>7</td></tr>
<tr><td>Confirmed commit</td><td>A change that undoes itself unless you confirm it</td><td>8</td></tr></table>
<p>AUTO01 (netadmin / Deccan@123) is the automation host. J1, J2 and J3 listen for NETCONF on port 830 at 10.99.0.11, .12 and .13 (user netops, password NK@2026, lab values only; real scripts read the password from the environment).</p>

<div class="warn"><p><b>Common mistake.</b> Treating validation as "run a few show commands and look". Looking is not repeatable and nobody can review it later. A snapshot and a test file are evidence you can keep, rerun and hand to the next engineer.</p></div>
<div class="exam"><p><b>Exam trap.</b> A <b>health check</b> tells you the network is fine now. A <b>pre and post comparison</b> tells you what the change did. You need both: a network can be unhealthy before you touch it, and a change can break something that no health check was written for.</p></div>

<div class="scn"><h4>The silent redundancy loss</h4><p>A team decommissioned an unused port on a core router. The post-change check listed BGP sessions: all Established. Three weeks later a fibre cut took out the one remaining path and a whole site went dark. The earlier change had removed an OSPF adjacency, but nothing had compared the neighbour list before and after, so the lost redundancy was never noticed.</p><p><b>Lesson:</b> check what disappeared, not only what is left.</p></div>

<div class="iv"><p class="q">"How do you prove a network change did not break anything?"</p><p>I define healthy as tests, not opinions. I take a snapshot of the relevant state before, make the change in a way that can undo itself, wait for convergence, take a second snapshot and compare. The comparison must detect things that vanished as well as things that failed. I keep the snapshots and the report as evidence, and the pipeline only confirms the change when the checks pass.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A commit that succeeds says nothing about the health of the network.</li>
<li>State is what the network is doing; a snapshot is a saved copy of it.</li>
<li>Compare before with after; checking only what is left behind misses what disappeared.</li>
<li>The six steps: pre-check, pre snapshot, change, settle, post check, decide.</li>
<li>A gate turns the checks into an automatic yes or no.</li>
</ul></div>
`,hi:`
<p><b>Is chapter mein aap kya seekhoge.</b> Change tab poora nahi hota jab commit succeed ho jaye. Woh tab poora hota hai jab aap dikha sako ki network ab bhi waise hi kaam kar raha hai jaise pehle karta tha, aur sirf wahi cheezein badli hain jo aap badalna chahte the. Is module mein aap Python mein teen Junos routers par yehi saboot banaoge. JSNAPy se change se pehle aur baad ke network state ke <b>snapshots</b> loge, aise test files likhoge jo batayein "healthy" ka matlab kya hai, wahi expectations <b>pytest</b> mein dohraoge, state ko data ki tarah <b>deepdiff</b> se compare karoge, aur sab kuch ek <b>gate</b> mein lapetoge: aisi script jo change ko confirmed commit se push kare aur checks pass hone par hi rakhe. Lab ke aakhri hisse mein aap sabse mushkil skill seekhoge: hare (green) result par shak karna.</p>
<p><b>Prerequisites.</b> <code>py-pytest</code> (asserts, fixtures, parametrize), <code>auto-testing</code> (script mein pre aur post checks), <code>adv-pyez</code> (<code>Device</code>, RPCs, tables) aur <code>adv-pyez-config</code> (<code>Config.load</code>, <code>diff</code>, <code>commit(confirm=...)</code>). Hum maante hain ki aap change ko safely push kar sakte ho; yahan hum baad mein use saabit karte hain. Module <code>adv-verify</code> change ko device tak pahunchne se <i>pehle</i> check karta hai (schema aur Batfish); yeh module <i>live network ko baad mein</i> check karta hai.</p>

<h3>Ek analogy: flat ki handover</h3>
<p>Jab builder flat hand over karta hai, samajhdar buyer do kaam karta hai. Kaam shuru hone se pehle woh har kamre ki photo leta hai aur likhta hai ki kaunsi lights aur taps chalte hain. Kaam ke baad woh wahi list lekar dobara ghoomta hai. Photos se bahas possible hoti hai: "yeh tap pehle chalta tha, ab nahi chalta". "Pehle" ki photos ke bina har shikayat ek aadmi ki baat doosre ke khilaaf ban jaati hai. Network change bhi waisa hi hai. <b>Pre snapshot</b> pehle ki photo hai, <b>post snapshot</b> baad ki photo hai, aur test file walk-through ki list hai.</p>

<h3>Jo shabd hum use karenge</h3>
<dl class="terms">
<dt>State</dt><dd>Network abhi kya kar raha hai: OSPF neighbours, BGP sessions, interface status, routes. Configuration nahi, woh to hai jo aapne usse karne ko kaha.</dd>
<dt>Snapshot</dt><dd>Kisi state ki saved copy, yahan har router aur har command ke liye ek XML file.</dd>
<dt>Health check</dt><dd>Ek rule jo batata hai achha state kaisa dikhta hai, jaise "har OSPF neighbour Full hai".</dd>
<dt>Regression</dt><dd>Jo change se pehle chalta tha aur ab nahi chalta. Pre aur post comparison regressions pakadta hai; sirf state check nahi pakad sakta.</dd>
<dt>Gate</dt><dd>Pipeline ka ek step jo check fail hone par pipeline rok deta hai.</dd>
</dl>

<h3>"Ping chal raha hai" validation kyun nahi hai</h3>
<p>Hamare lab network mein teen routers hain, J1, J2 aur J3, jo triangle mein jude hain aur management switch se bhi. Woh area 0 mein OSPF aur apne loopbacks ke beech iBGP full mesh chalate hain. Healthy hone par J2 ke chaar OSPF neighbours hote hain.</p>
<pre class="out">J2&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.99.0.11       ge-0/0/0.0             Full            10.255.0.1       128    31
10.99.0.13       ge-0/0/0.0             Full            10.255.0.3       128    33
10.12.0.1        ge-0/0/1.0             Full            10.255.0.1       128    40
<span class="hl">10.23.0.2        ge-0/0/2.0             Full            10.255.0.3       128    32</span></pre>
<p>Ab koi J2 ka galat port band kar deta hai, jo J3 ki taraf jaata hai. J2 aur J3 management switch ke raaste ab bhi ek doosre tak pahunch sakte hain, isliye BGP up rehta hai, ping chalta hai aur kisi ko shikayat nahi hoti. Lekin ek OSPF adjacency chali gayi hai aur aapne jo redundancy design ki thi woh chupchaap gayab ho gayi. Jo check sirf poochhe "kya mere BGP sessions up hain?" woh pass ho jayega. Jo check change se pehle ke neighbours yaad rakhe, woh pass nahi hoga.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Teen routers ka triangle, ek failed link aur management switch jo failure chhupata hai">
<rect x="270" y="168" width="100" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="193" text-anchor="middle" class="svg-ink" font-size="13">SW1 (mgmt)</text>
<rect x="60" y="20" width="90" height="44" rx="10" fill="#bbf7d0"/><text x="105" y="47" text-anchor="middle" class="svg-ink" font-size="13">J1</text>
<rect x="490" y="20" width="90" height="44" rx="10" fill="#fde68a"/><text x="535" y="47" text-anchor="middle" class="svg-ink" font-size="13">J2</text>
<rect x="275" y="100" width="90" height="44" rx="10" fill="#bbf7d0"/><text x="320" y="127" text-anchor="middle" class="svg-ink" font-size="13">J3</text>
<line x1="150" y1="42" x2="490" y2="42" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="58" x2="285" y2="102" stroke="#64748b" stroke-width="2"/>
<line x1="495" y1="62" x2="365" y2="108" stroke="#dc2626" stroke-width="3" stroke-dasharray="6 5"/>
<text x="450" y="104" class="svg-accent" font-size="12">link down</text>
<line x1="105" y1="64" x2="290" y2="170" stroke="#94a3b8" stroke-width="1.5"/><line x1="535" y1="64" x2="360" y2="170" stroke="#94a3b8" stroke-width="1.5"/><line x1="320" y1="144" x2="320" y2="168" stroke="#94a3b8" stroke-width="1.5"/>
<text x="30" y="205" class="svg-muted" font-size="12">Loopbacks ke beech BGP SW1 se chalta rehta hai, isliye sirf-BGP check green rehta hai.</text>
</svg><p class="cap">J2 se J3 ka failed link management path ke peeche chhup jaata hai. Sirf OSPF neighbours ka before aur after comparison use dekhta hai.</p></div>

<h3>Validated change ke chhe steps</h3>
<div class="dia"><svg viewBox="0 0 640 100" role="img" aria-label="Chhe steps: pre-check, pre snapshot, change, settle, post check, confirm ya roll back">
<rect x="8" y="20" width="94" height="56" rx="10" fill="#bae6fd"/><text x="55" y="44" text-anchor="middle" class="svg-ink" font-size="12">1 Pre-check</text><text x="55" y="62" text-anchor="middle" class="svg-muted" font-size="11">healthy shuru?</text>
<rect x="114" y="20" width="94" height="56" rx="10" fill="#ddd6fe"/><text x="161" y="44" text-anchor="middle" class="svg-ink" font-size="12">2 Pre snapshot</text><text x="161" y="62" text-anchor="middle" class="svg-muted" font-size="11">state save</text>
<rect x="220" y="20" width="94" height="56" rx="10" fill="#fde68a"/><text x="267" y="44" text-anchor="middle" class="svg-ink" font-size="12">3 Change</text><text x="267" y="62" text-anchor="middle" class="svg-muted" font-size="11">confirm 2 min</text>
<rect x="326" y="20" width="94" height="56" rx="10" fill="#fed7aa"/><text x="373" y="44" text-anchor="middle" class="svg-ink" font-size="12">4 Settle</text><text x="373" y="62" text-anchor="middle" class="svg-muted" font-size="11">ruko, converge</text>
<rect x="432" y="20" width="94" height="56" rx="10" fill="#ddd6fe"/><text x="479" y="44" text-anchor="middle" class="svg-ink" font-size="12">5 Post check</text><text x="479" y="62" text-anchor="middle" class="svg-muted" font-size="11">pre vs post</text>
<rect x="538" y="20" width="94" height="56" rx="10" fill="#bbf7d0"/><text x="585" y="44" text-anchor="middle" class="svg-ink" font-size="12">6 Decide</text><text x="585" y="62" text-anchor="middle" class="svg-muted" font-size="11">confirm ya back</text>
<line x1="102" y1="48" x2="114" y2="48" stroke="#64748b" stroke-width="2"/><line x1="208" y1="48" x2="220" y2="48" stroke="#64748b" stroke-width="2"/><line x1="314" y1="48" x2="326" y2="48" stroke="#64748b" stroke-width="2"/><line x1="420" y1="48" x2="432" y2="48" stroke="#64748b" stroke-width="2"/><line x1="526" y1="48" x2="538" y2="48" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Jo pipeline aap is module mein banaoge. Har chapter ek box jodta hai.</p></div>

<div class="eg"><p><b>Worked example: ticket.</b> Change CHG-3105 kehta hai "J2 ka unused port ge-0/0/4 band karo". Script push karti hai, commit succeed hota hai, CLI koi error print nahi karta. Ho gaya? Tabhi jab aap teen sawaalon ka jawab saboot ke saath de sako: kya kuch chalna band hua, kya port sach mein down hua, aur kya kuch aur bhi badla? Lab 1 ke ant tak aapke tools teeno ka jawab dete hain, aur teesra, jise log bhool jaate hain, wahi jagah hai jahan deepdiff apni jagah banata hai.</p></div>

<h3>Tools aur lab</h3>
<table class="cmp"><tr><th>Tool</th><th>Kis mein achha</th><th>Chapter</th></tr>
<tr><td>PyEZ aur lxml</td><td>Snapshots haath se lena aur padhna</td><td>2</td></tr>
<tr><td>JSNAPy (<code>SnapAdmin</code>)</td><td>Declarative tests, pre aur post comparison, har router ki report</td><td>3, 4, 5</td></tr>
<tr><td>pytest</td><td>Wahi checks normal test suite aur CI ke andar</td><td>6</td></tr>
<tr><td>deepdiff</td><td>Do dictionaries ke beech "exactly kya alag hai?"</td><td>7</td></tr>
<tr><td>Confirmed commit</td><td>Aisa change jo confirm na karo to khud wapas ho jaye</td><td>8</td></tr></table>
<p>AUTO01 (netadmin / Deccan@123) automation host hai. J1, J2 aur J3 10.99.0.11, .12 aur .13 par port 830 par NETCONF sunte hain (user netops, password NK@2026, sirf lab values; asli scripts password environment se padhti hain).</p>

<div class="warn"><p><b>Aam galti.</b> Validation ko "kuch show commands chalao aur dekh lo" samajhna. Dekhna repeatable nahi hota aur baad mein koi review nahi kar sakta. Snapshot aur test file aisa saboot hai jo aap rakh sakte ho, dobara chala sakte ho aur agle engineer ko de sakte ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> <b>Health check</b> batata hai ki network abhi theek hai. <b>Pre aur post comparison</b> batata hai ki change ne kya kiya. Dono chahiye: aapke chhune se pehle bhi network unhealthy ho sakta hai, aur change aisi cheez tod sakta hai jiske liye koi health check likha hi nahi gaya.</p></div>

<div class="scn"><h4>Chupchaap redundancy ka jaana</h4><p>Ek team ne core router ka unused port decommission kiya. Post-change check ne BGP sessions list kiye: sab Established. Teen hafte baad ek fibre cut ne bacha hua ek raasta kaat diya aur poori site dark ho gayi. Pehle wale change ne ek OSPF adjacency hata di thi, lekin kisi ne change se pehle aur baad ki neighbour list compare nahi ki, isliye khoyi hui redundancy kabhi notice nahi hui.</p><p><b>Lesson:</b> yeh check karo ki kya gayab hua, sirf yeh nahi ki kya bacha hai.</p></div>

<div class="iv"><p class="q">"Aap kaise saabit karte ho ki network change ne kuch nahi toda?"</p><p>Main healthy ko tests se define karta hoon, raay se nahi. Change se pehle relevant state ka snapshot leta hoon, change aise tareeke se karta hoon jo khud undo ho sake, convergence ka intezaar karta hoon, doosra snapshot leta hoon aur compare karta hoon. Comparison ko woh cheezein bhi pakadni chahiye jo gayab ho gayi, sirf jo fail hui nahi. Snapshots aur report saboot ke taur par rakhta hoon, aur pipeline change tabhi confirm karti hai jab checks pass hon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Commit ka succeed hona network ki health ke baare mein kuch nahi batata.</li>
<li>State woh hai jo network kar raha hai; snapshot uski saved copy hai.</li>
<li>Pehle ko baad se compare karo; sirf bacha hua check karna gayab cheezein miss karta hai.</li>
<li>Chhe steps: pre-check, pre snapshot, change, settle, post check, decide.</li>
<li>Gate checks ko automatic haan ya na mein badal deta hai.</li>
</ul></div>
`}};export{e as default};