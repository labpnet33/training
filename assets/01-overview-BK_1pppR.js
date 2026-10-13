var e={id:`overview`,h:{en:`Why test a network with code: what you will learn and the big picture`,hi:`Network ko code se test kyun karein: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn to prove that a network change worked, using small pieces of code instead of tired eyes. You will take a <b>snapshot</b> of the network before a change, take another after it, and <b>compare</b> the two. Then you will write <b>tests</b>: tiny functions that check one fact (is OSPF up? is BGP Established? does every router have a default route?) and say PASS or FAIL. This is the testing idea behind Cisco pyATS and it is part of the CCNP Automation (350-901 AUTOCOR) blueprint.</p>
<p><b>Prerequisites.</b> You should have met Python basics (variables, lists, dictionaries, loops, functions) in the auto-py modules, and you should know how a script logs in to a router over SSH (module auto-ssh). If you can read a ten-line Python script, you are ready. We explain every line again as we go, so even a slow reader can follow.</p>

<h3>Analogy: the pilot's checklist</h3>
<p>Before an aircraft takes off, the pilot does not say "it looks fine". The pilot reads a <b>checklist</b>: fuel, flaps, instruments. After landing, the crew checks again. The checklist is the same every time, so it does not depend on mood or memory. A network test suite is a checklist that a computer reads out and ticks for you. The <b>pre-check</b> is the checklist before take-off. The <b>post-check</b> is the checklist after landing.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Pre-check, change, post-check, compare">
<rect x="15" y="50" width="120" height="60" rx="10" fill="#bae6fd"/><text x="75" y="76" text-anchor="middle" class="svg-ink" font-size="14">Pre-check</text><text x="75" y="95" text-anchor="middle" class="svg-muted" font-size="12">snapshot + tests</text>
<rect x="175" y="50" width="120" height="60" rx="10" fill="#fde68a"/><text x="235" y="76" text-anchor="middle" class="svg-ink" font-size="14">Change</text><text x="235" y="95" text-anchor="middle" class="svg-muted" font-size="12">config pushed</text>
<rect x="335" y="50" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="395" y="76" text-anchor="middle" class="svg-ink" font-size="14">Post-check</text><text x="395" y="95" text-anchor="middle" class="svg-muted" font-size="12">snapshot + tests</text>
<rect x="495" y="50" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="560" y="76" text-anchor="middle" class="svg-ink" font-size="14">Compare</text><text x="560" y="95" text-anchor="middle" class="svg-muted" font-size="12">new? lost? PASS?</text>
<line x1="135" y1="80" x2="175" y2="80" stroke="#64748b" stroke-width="2"/><line x1="295" y1="80" x2="335" y2="80" stroke="#64748b" stroke-width="2"/><line x1="455" y1="80" x2="495" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">a change is finished only when the post-check passes</text>
</svg><p class="cap">The test loop around every change.</p></div>

<h3>The problem testing solves</h3>
<p>After a change most engineers type a few <code>show</code> commands and "have a look". That has three weaknesses. It is <b>slow</b> when you have fifty routers. It is <b>inconsistent</b>: on Monday you check OSPF, on Friday you forget. And it is <b>invisible</b>: nobody else can see what you checked. A script fixes all three, because it checks the same things on every device, every time, and prints the result where the whole team can read it.</p>
<ul>
<li><b>Test</b>: a small piece of code that checks one fact and reports PASS or FAIL.</li>
<li><b>Assertion</b>: the single line in a test that says "this must be true". If it is false, Python stops and raises an <b>AssertionError</b>.</li>
<li><b>Snapshot</b>: the network state saved to a file (here JSON) at one moment.</li>
<li><b>Diff</b> (difference): the list of what changed between two snapshots.</li>
</ul>

<h3>The lab network used in this module</h3>
<p>Both labs use the same small network. Three routers R1, R2 and R3 are connected in a line and run OSPF area 0. R1 also has an eBGP session to a provider called ISP (AS 65001, neighbour 203.0.113.2) and passes a default route into OSPF. A host called AUTO runs the Python scripts and logs in to the routers with an SSH account. The helper <code>nkmiko</code> logs in over SSH and <code>nkparse</code> turns show output into a Python dictionary.</p>

<div class="eg"><p><b>Worked example.</b> Deccan Net will add a new LAN 192.168.33.0/24 on R3 tonight. Without tests the engineer adds it, types <code>show ip route</code> on R3, sees the route and goes home. Did R1 learn it? Did any OSPF neighbour drop? With tests the engineer runs <code>python3 snapshot.py pre</code>, makes the change, runs <code>python3 snapshot.py post</code>, then <code>python3 compare.py</code>. The report says which routers gained the route and whether anything was lost. You will do exactly this in chapter 5.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Treating a test as a formality. A test that cannot fail (for example one that only checks that the script ran) gives false confidence. Every test must be able to fail when the network is broken. You will practise writing tests that fail on purpose.</p></div>
<div class="exam"><p><b>Exam trap.</b> The blueprint asks about <i>why</i> and <i>when</i> to test, not only how. Remember the pair: pre-checks establish a healthy baseline, post-checks prove the change. If the pre-check already fails, you should stop and not make the change.</p></div>

<div class="scn"><h4>The "it looked fine" change</h4><p>At Kaveri Foods an engineer finished a night change, checked the routing table on one router and signed off. In the morning the branch said the Internet was down. A BGP neighbour had gone Idle because of a mistyped AS number, and one OSPF adjacency had silently dropped. Nobody had looked at either. The team then adopted a test suite: five checks run before and after every change, with the result pasted into the ticket.</p><p><b>Lesson:</b> humans check what they remember; tests check everything you wrote down.</p></div>

<div class="iv"><p class="q">"Why would you automate testing after a network change?"</p><p>Because manual checks are slow, inconsistent and not recorded. A script runs the same checks on every device, gives a clear PASS or FAIL, and can be re-run as a pre-check and a post-check. Mention the baseline idea (test before you change), snapshots plus diffs to see what changed, and tools such as pyATS with its parsers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A change is finished only when the tests pass, not when the last config line is typed.</li>
<li>Pre-check gives a baseline; post-check proves the change; compare shows what moved.</li>
<li>A test checks one fact and says PASS or FAIL; the assertion is the line that decides.</li>
<li>Snapshots are saved state (JSON); a diff lists new and lost items.</li>
<li>Tests must be able to fail, or they prove nothing.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki network change kaam kiya ya nahi, yeh thaki aankhon ki jagah chhote code se kaise prove karein. Change se pehle network ka <b>snapshot</b> loge, baad mein doosra loge, aur dono ko <b>compare</b> karoge. Phir <b>tests</b> likhoge: chhote functions jo ek fact check karte hain (OSPF up hai? BGP Established hai? har router par default route hai?) aur PASS ya FAIL bolte hain. Yahi testing idea Cisco pyATS ke peeche hai aur CCNP Automation (350-901 AUTOCOR) blueprint ka hissa hai.</p>
<p><b>Prerequisites.</b> Aapne auto-py modules mein Python basics (variables, lists, dictionaries, loops, functions) dekhe hone chahiye, aur pata hona chahiye ki script SSH se router mein kaise login karti hai (module auto-ssh). Agar aap das line ki Python script padh sakte ho to ready ho. Hum har line phir se explain karenge, isliye dheere padhne wala bhi follow kar lega.</p>

<h3>Analogy: pilot ki checklist</h3>
<p>Aircraft take-off se pehle pilot "sab theek lag raha hai" nahi bolta. Pilot ek <b>checklist</b> padhta hai: fuel, flaps, instruments. Landing ke baad crew phir check karta hai. Checklist har baar same hoti hai, isliye mood ya yaadasht par depend nahi karti. Network test suite aisi checklist hai jo computer aapke liye padhta aur tick karta hai. <b>Pre-check</b> take-off se pehle ki checklist hai. <b>Post-check</b> landing ke baad ki checklist hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Pre-check, change, post-check, compare">
<rect x="15" y="50" width="120" height="60" rx="10" fill="#bae6fd"/><text x="75" y="76" text-anchor="middle" class="svg-ink" font-size="14">Pre-check</text><text x="75" y="95" text-anchor="middle" class="svg-muted" font-size="12">snapshot + tests</text>
<rect x="175" y="50" width="120" height="60" rx="10" fill="#fde68a"/><text x="235" y="76" text-anchor="middle" class="svg-ink" font-size="14">Change</text><text x="235" y="95" text-anchor="middle" class="svg-muted" font-size="12">config push</text>
<rect x="335" y="50" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="395" y="76" text-anchor="middle" class="svg-ink" font-size="14">Post-check</text><text x="395" y="95" text-anchor="middle" class="svg-muted" font-size="12">snapshot + tests</text>
<rect x="495" y="50" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="560" y="76" text-anchor="middle" class="svg-ink" font-size="14">Compare</text><text x="560" y="95" text-anchor="middle" class="svg-muted" font-size="12">naya? gaya? PASS?</text>
<line x1="135" y1="80" x2="175" y2="80" stroke="#64748b" stroke-width="2"/><line x1="295" y1="80" x2="335" y2="80" stroke="#64748b" stroke-width="2"/><line x1="455" y1="80" x2="495" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">change tabhi poora hai jab post-check pass ho</text>
</svg><p class="cap">Har change ke aas-paas ka test loop.</p></div>

<h3>Testing kaun si problem solve karti hai</h3>
<p>Change ke baad zyada tar engineers kuch <code>show</code> commands type karke "dekh" lete hain. Isme teen kamzoriyan hain. Pachas routers hon to yeh <b>slow</b> hai. Yeh <b>inconsistent</b> hai: Monday ko OSPF check kiya, Friday ko bhool gaye. Aur yeh <b>invisible</b> hai: aapne kya check kiya yeh koi aur nahi dekh sakta. Script teeno theek karti hai, kyunki har device par, har baar wahi cheezein check karti hai aur result wahan print karti hai jahan poori team padh sake.</p>
<ul>
<li><b>Test</b>: code ka chhota tukda jo ek fact check karke PASS ya FAIL batata hai.</li>
<li><b>Assertion</b>: test ki woh ek line jo kehti hai "yeh sach hona chahiye". Galat nikla to Python ruk jaata hai aur <b>AssertionError</b> deta hai.</li>
<li><b>Snapshot</b>: ek moment par network ki state file (yahan JSON) mein save.</li>
<li><b>Diff</b> (antar): do snapshots ke beech kya badla uski list.</li>
</ul>

<h3>Is module ka lab network</h3>
<p>Dono labs mein wahi chhota network hai. Teen routers R1, R2 aur R3 line mein jude hain aur OSPF area 0 chalate hain. R1 ka ISP naam ke provider (AS 65001, neighbour 203.0.113.2) se eBGP session bhi hai aur woh default route OSPF mein deta hai. AUTO naam ka host Python scripts chalata hai aur SSH account se routers mein login karta hai. Helper <code>nkmiko</code> SSH se login karta hai aur <code>nkparse</code> show output ko Python dictionary banata hai.</p>

<div class="eg"><p><b>Worked example.</b> Deccan Net aaj raat R3 par naya LAN 192.168.33.0/24 jodega. Bina tests ke engineer jodta hai, R3 par <code>show ip route</code> type karta hai, route dekhta hai aur ghar chala jaata hai. Kya R1 ne seekha? Kya koi OSPF neighbour gira? Tests ke saath engineer <code>python3 snapshot.py pre</code> chalata hai, change karta hai, <code>python3 snapshot.py post</code> chalata hai, phir <code>python3 compare.py</code>. Report batati hai kin routers ko route mila aur kuch gaya to nahi. Yahi aap chapter 5 mein karoge.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Test ko formality samajhna. Jo test fail ho hi nahi sakta (jaise sirf yeh check karna ki script chali) woh jhooti tasalli deta hai. Har test network toota hone par fail hona chahiye. Aap jaan-boojh kar fail hone wale tests likhne ki practice karoge.</p></div>
<div class="exam"><p><b>Exam trap.</b> Blueprint <i>kyun</i> aur <i>kab</i> test karna hai yeh bhi poochta hai, sirf kaise nahi. Jodi yaad rakho: pre-check healthy baseline banata hai, post-check change prove karta hai. Agar pre-check hi fail hai to ruko, change mat karo.</p></div>

<div class="scn"><h4>"Sab theek lag raha tha" wala change</h4><p>Kaveri Foods mein ek engineer ne raat ka change khatam kiya, ek router ka routing table dekha aur sign-off kar diya. Subah branch ne bataya Internet band hai. AS number galat type hone se ek BGP neighbour Idle ho gaya tha, aur ek OSPF adjacency chupke se gir gayi thi. Kisi ne dono nahi dekhe. Phir team ne test suite apnayi: har change se pehle aur baad paanch checks, result ticket mein paste.</p><p><b>Lesson:</b> insaan wahi check karta hai jo use yaad hai; tests wo sab check karte hain jo aapne likh diya.</p></div>

<div class="iv"><p class="q">"Network change ke baad testing automate kyun karoge?"</p><p>Kyunki manual checks slow, inconsistent aur record-less hote hain. Script har device par wahi checks chalati hai, saaf PASS ya FAIL deti hai, aur pre-check aur post-check dono ki tarah dobara chal sakti hai. Baseline idea (change se pehle test), snapshots plus diff (kya badla), aur pyATS jaise tools aur unke parsers ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Change tabhi poora hai jab tests pass hon, aakhri config line type hone par nahi.</li>
<li>Pre-check baseline deta hai; post-check change prove karta hai; compare dikhata hai kya hila.</li>
<li>Test ek fact check karke PASS ya FAIL bolta hai; assertion woh line hai jo decide karti hai.</li>
<li>Snapshots saved state (JSON) hain; diff naye aur gaye items ki list hai.</li>
<li>Tests fail ho sakne chahiye, warna kuch prove nahi karte.</li>
</ul></div>
`}};export{e as default};