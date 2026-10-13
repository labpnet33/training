var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: run, read, fix, rerun until green`,hi:`Troubleshooting workflow: run, read, fix, green hone tak rerun`},body:{en:`
<p>You have all the parts. This chapter ties them into one repeatable <b>test-driven troubleshooting loop</b> and walks through the whole of lab 2, where three faults are hiding behind one complaint. Faults often hide behind each other: fixing the first reveals the second.</p>

<h3>Analogy: peeling an onion</h3>
<p>You peel one layer and cry a little; there is another layer under it. A test suite that stops at the first failure behaves like an onion: you will see the failures one at a time. That is normal, not a sign you broke something.</p>

<h3>The loop</h3>
<ol>
<li><b>Run</b> the full suite.</li>
<li><b>Read</b> the first failure with the four-question routine from chapter 7.</li>
<li><b>Verify</b> the cause with one show command.</li>
<li><b>Fix</b> exactly that, nothing else.</li>
<li><b>Rerun</b> from the top. Go back to step 2 until the last line says ALL TESTS PASSED.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Run read fix rerun loop">
<rect x="20" y="55" width="100" height="55" rx="10" fill="#bae6fd"/><text x="70" y="88" text-anchor="middle" class="svg-ink" font-size="14">Run</text>
<rect x="165" y="55" width="100" height="55" rx="10" fill="#fde68a"/><text x="215" y="88" text-anchor="middle" class="svg-ink" font-size="14">Read</text>
<rect x="310" y="55" width="100" height="55" rx="10" fill="#ddd6fe"/><text x="360" y="88" text-anchor="middle" class="svg-ink" font-size="14">Verify</text>
<rect x="455" y="55" width="80" height="55" rx="10" fill="#fed7aa"/><text x="495" y="88" text-anchor="middle" class="svg-ink" font-size="14">Fix</text>
<rect x="565" y="55" width="65" height="55" rx="10" fill="#bbf7d0"/><text x="597" y="88" text-anchor="middle" class="svg-ink" font-size="14">Rerun</text>
<line x1="120" y1="82" x2="165" y2="82" stroke="#64748b" stroke-width="2"/><line x1="265" y1="82" x2="310" y2="82" stroke="#64748b" stroke-width="2"/><line x1="410" y1="82" x2="455" y2="82" stroke="#64748b" stroke-width="2"/><line x1="535" y1="82" x2="565" y2="82" stroke="#64748b" stroke-width="2"/>
<path d="M597 110 Q597 150 320 150 Q70 150 70 110" fill="none" stroke="#64748b" stroke-width="2"/><text x="320" y="143" text-anchor="middle" class="svg-accent" font-size="12">until ALL TESTS PASSED</text>
</svg><p class="cap">One fault at a time, proven by the suite.</p></div>

<h3>Fault 1 is done; now fault 2</h3>
<p>After the OSPF timer fix of chapter 7 the suite goes one test further. Real output:</p>
<pre class="out">AUTO&gt; python3 tests.py
PASS test_ospf_neighbors
Traceback (most recent call last):
  File "tests.py", line 44, in &lt;module&gt;
    test()
  File "tests.py", line 31, in test_bgp_isp
    assert peer["state"] == "Established", f"BGP to ISP is {peer['state']}, expected Established"
<span class="hl">AssertionError: BGP to ISP is Idle, expected Established</span></pre>
<p>Read it: a different test, <code>test_bgp_isp</code>. R1's BGP session to 203.0.113.2 is Idle. Idle with a configured neighbour that never moves on usually means the peer will not accept the session or the local router has the wrong peer details. Verify with the summary:</p>
<pre class="code">R1# show ip bgp summary
<span class="c">! the AS column for neighbour 203.0.113.2 shows 65010, state Idle</span></pre>
<p>The ISP is AS 65001 (given in the ticket), but R1 expects 65010: two digits swapped. A neighbour's <code>remote-as</code> must match the real AS of the peer. Fix and wait about fifteen seconds for the session:</p>
<pre class="code">R1# configure terminal
R1(config)# router bgp 65000
R1(config-router)# neighbor 203.0.113.2 remote-as 65001
R1(config-router)# end</pre>

<h3>Fault 3 appears by itself</h3>
<p>The third test, <code>test_default_route</code>, needs every router to hold 0.0.0.0/0. It was failing only because BGP was down: R1 learns the default from the ISP and passes it into OSPF to R2 and R3. Once BGP comes up the default flows through OSPF within seconds, so there was nothing to configure. The last run:</p>
<pre class="out">AUTO&gt; python3 tests.py
PASS test_ospf_neighbors
PASS test_bgp_isp
PASS test_default_route
<span class="hl">ALL TESTS PASSED</span></pre>
<p>This is a <b>dependency</b> between tests: one root cause (BGP) produced two symptoms (no session, no default). Fixing the root cause cleared both. Learn to notice dependencies so you do not chase symptoms.</p>

<h3>Flaky results: waiting for convergence</h3>
<p>If you rerun the suite one second after a fix, a test can fail simply because the network has not settled. This is a <b>flaky</b> result. The cure is to retry for a limited time rather than test once:</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator): retry a check for up to 60 seconds</span>
import time

def wait_for(check, seconds=60):
    for attempt in range(seconds // 5):
        if check():
            return True
        time.sleep(5)          <span class="c"># wait 5 seconds, then ask again</span>
    return False</pre>
<p>Keep the limit small. A test that waits forever hides real faults.</p>

<div class="eg"><p><b>Worked example.</b> Timeline: 02:10 suite fails on OSPF; 02:14 timer fixed; 02:15 suite fails on BGP; 02:19 remote-as fixed; 02:20 suite passes. Ten minutes, three faults found, and the exact transcript pasted in the ticket as evidence. Compare with an hour of random show commands.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Changing two things at once. If the suite passes you do not know which change fixed it, and if it gets worse you do not know which broke it. One fix, one rerun. Another mistake: editing the test to make it pass. Never weaken a test to match a broken network.</p></div>
<div class="exam"><p><b>Exam trap.</b> A BGP session stuck in Idle or Active points to the TCP session or configuration (wrong remote-as, unreachable neighbour, filter). A session that drops back to Idle after Established points to hold-timer or policy problems. Know both.</p></div>

<div class="scn"><h4>Three faults, one ticket</h4><p>The Kaveri Foods ticket said only "Internet down". The suite found an OSPF timer mismatch first, then a BGP remote-as typo, and the lost default route cleared by itself. The engineer made two configuration changes in total, both single lines, and the evidence of each step sat in the terminal history.</p><p><b>Lesson:</b> find faults in order; the suite is your map.</p></div>

<div class="iv"><p class="q">"Walk me through how you would troubleshoot with an automated test suite."</p><p>Run the full suite, read the first failure for test, device and values, form a hypothesis and verify it with one show command, apply one fix, rerun from the top. Mention test dependencies (one root cause, several failures), flaky results from convergence and how retries solve them, and storing the output as evidence.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Loop: run, read, verify, fix, rerun until ALL TESTS PASSED.</li>
<li>Faults hide behind each other; first-failure runners reveal them one by one.</li>
<li>One root cause can fail several tests; fix the root cause.</li>
<li>Retry for a short time to avoid flaky results after a change.</li>
<li>One change per rerun; never weaken a test to turn it green.</li>
</ul></div>
`,hi:`
<p>Aapke paas saare parts hain. Yeh chapter unhe ek dohraye ja sakne wale <b>test-driven troubleshooting loop</b> mein jodta hai aur poore lab 2 se guzarta hai, jahan ek shikayat ke peeche teen faults chhupe hain. Faults aksar ek ke peeche ek chhupe hote hain: pehla fix karne par doosra dikhta hai.</p>

<h3>Analogy: pyaaz ki parat</h3>
<p>Ek parat utarte ho, thoda rona aata hai; uske neeche aur parat hai. Jo test suite pehle failure par ruk jaati hai woh pyaaz jaisi hai: failures ek-ek karke dikhengi. Yeh normal hai, isse yeh nahi ki aapne kuch toda.</p>

<h3>Loop</h3>
<ol>
<li>Poori suite <b>chalao</b>.</li>
<li>Pehle failure ko chapter 7 ke chaar sawaal wale routine se <b>padho</b>.</li>
<li>Ek show command se wajah <b>verify</b> karo.</li>
<li>Bas wahi <b>fix</b> karo, aur kuch nahi.</li>
<li>Upar se <b>rerun</b> karo. Step 2 par lautao jab tak aakhri line ALL TESTS PASSED na ho.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Run read fix rerun loop">
<rect x="20" y="55" width="100" height="55" rx="10" fill="#bae6fd"/><text x="70" y="88" text-anchor="middle" class="svg-ink" font-size="14">Run</text>
<rect x="165" y="55" width="100" height="55" rx="10" fill="#fde68a"/><text x="215" y="88" text-anchor="middle" class="svg-ink" font-size="14">Read</text>
<rect x="310" y="55" width="100" height="55" rx="10" fill="#ddd6fe"/><text x="360" y="88" text-anchor="middle" class="svg-ink" font-size="14">Verify</text>
<rect x="455" y="55" width="80" height="55" rx="10" fill="#fed7aa"/><text x="495" y="88" text-anchor="middle" class="svg-ink" font-size="14">Fix</text>
<rect x="565" y="55" width="65" height="55" rx="10" fill="#bbf7d0"/><text x="597" y="88" text-anchor="middle" class="svg-ink" font-size="14">Rerun</text>
<line x1="120" y1="82" x2="165" y2="82" stroke="#64748b" stroke-width="2"/><line x1="265" y1="82" x2="310" y2="82" stroke="#64748b" stroke-width="2"/><line x1="410" y1="82" x2="455" y2="82" stroke="#64748b" stroke-width="2"/><line x1="535" y1="82" x2="565" y2="82" stroke="#64748b" stroke-width="2"/>
<path d="M597 110 Q597 150 320 150 Q70 150 70 110" fill="none" stroke="#64748b" stroke-width="2"/><text x="320" y="143" text-anchor="middle" class="svg-accent" font-size="12">jab tak ALL TESTS PASSED na ho</text>
</svg><p class="cap">Ek fault ek baar, suite se prove hua.</p></div>

<h3>Fault 1 ho gaya; ab fault 2</h3>
<p>Chapter 7 ke OSPF timer fix ke baad suite ek test aage jaati hai. Real output:</p>
<pre class="out">AUTO&gt; python3 tests.py
PASS test_ospf_neighbors
Traceback (most recent call last):
  File "tests.py", line 44, in &lt;module&gt;
    test()
  File "tests.py", line 31, in test_bgp_isp
    assert peer["state"] == "Established", f"BGP to ISP is {peer['state']}, expected Established"
<span class="hl">AssertionError: BGP to ISP is Idle, expected Established</span></pre>
<p>Padho: alag test, <code>test_bgp_isp</code>. R1 ka 203.0.113.2 se BGP session Idle hai. Configured neighbour ke saath Idle jo aage na badhe, aam taur par matlab peer session accept nahi karta ya local router par peer ki details galat hain. Summary se verify karo:</p>
<pre class="code">R1# show ip bgp summary
<span class="c">! neighbour 203.0.113.2 ke liye AS column 65010 dikhata hai, state Idle</span></pre>
<p>ISP AS 65001 hai (ticket mein diya), par R1 65010 maanta hai: do digits ulte. Neighbour ka <code>remote-as</code> peer ke asli AS se match karna chahiye. Fix karo aur session ke liye lagbhag pandrah seconds ruko:</p>
<pre class="code">R1# configure terminal
R1(config)# router bgp 65000
R1(config-router)# neighbor 203.0.113.2 remote-as 65001
R1(config-router)# end</pre>

<h3>Fault 3 apne aap saaf hota hai</h3>
<p>Teesra test, <code>test_default_route</code>, chahta hai har router ke paas 0.0.0.0/0 ho. Woh sirf isliye fail tha kyunki BGP down tha: R1 default ISP se seekhta hai aur OSPF mein R2 aur R3 ko deta hai. BGP up hote hi default OSPF se kuch seconds mein pahunch jaata hai, isliye configure karne ko kuch nahi tha. Aakhri run:</p>
<pre class="out">AUTO&gt; python3 tests.py
PASS test_ospf_neighbors
PASS test_bgp_isp
PASS test_default_route
<span class="hl">ALL TESTS PASSED</span></pre>
<p>Yeh tests ke beech <b>dependency</b> hai: ek root cause (BGP) ne do symptoms (session nahi, default nahi) diye. Root cause fix karne se dono saaf hue. Dependencies pehchanna seekho taaki symptoms ka peecha na karo.</p>

<h3>Flaky results: convergence ka intezaar</h3>
<p>Fix ke ek second baad suite rerun karo to test sirf isliye fail ho sakta hai ki network abhi settle nahi hua. Yeh <b>flaky</b> result hai. Ilaaj: ek baar test karne ki jagah limited time tak retry karo:</p>
<pre class="code"><span class="c"># Reference code (simulator mein run nahi hua): check ko 60 seconds tak retry karo</span>
import time

def wait_for(check, seconds=60):
    for attempt in range(seconds // 5):
        if check():
            return True
        time.sleep(5)          <span class="c"># 5 seconds ruko, phir dobara poocho</span>
    return False</pre>
<p>Limit chhoti rakho. Jo test hamesha ke liye intezaar karta hai woh asli faults chhupa deta hai.</p>

<div class="eg"><p><b>Worked example.</b> Timeline: 02:10 suite OSPF par fail; 02:14 timer fix; 02:15 suite BGP par fail; 02:19 remote-as fix; 02:20 suite pass. Das minute, teen faults mile, aur exact transcript ticket mein saboot ke roop mein. Isse ek ghante ke random show commands se compare karo.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Do cheezein ek saath badalna. Suite pass hui to pata nahi kaunse change ne theek kiya, bigdi to pata nahi kaunse ne bigada. Ek fix, ek rerun. Ek aur galti: test ko hi edit kar dena taaki pass ho jaaye. Toote network ke hisaab se test kabhi kamzor mat karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> BGP session ka Idle ya Active mein atakna TCP session ya configuration ki taraf ishara hai (galat remote-as, unreachable neighbour, filter). Established ke baad Idle par girna hold-timer ya policy problems ki taraf. Dono jaano.</p></div>

<div class="scn"><h4>Teen faults, ek ticket</h4><p>Kaveri Foods ke ticket mein bas "Internet down" likha tha. Suite ne pehle OSPF timer mismatch paaya, phir BGP remote-as typo, aur khoya default route apne aap saaf ho gaya. Engineer ne kul do configuration changes kiye, dono ek-ek line ke, aur har step ka saboot terminal history mein tha.</p><p><b>Lesson:</b> faults order mein dhoondo; suite aapka naksha hai.</p></div>

<div class="iv"><p class="q">"Automated test suite ke saath troubleshooting kaise karoge?"</p><p>Poori suite chalao, pehle failure se test, device aur values padho, hypothesis banao aur ek show command se verify karo, ek fix lagao, upar se rerun karo. Test dependencies (ek root cause, kai failures), convergence se flaky results aur retries kaise solve karte hain, aur output ko saboot ki tarah store karna, yeh bolo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Loop: run, read, verify, fix, rerun jab tak ALL TESTS PASSED.</li>
<li>Faults ek ke peeche ek chhupe hote hain; first-failure runners unhe ek-ek karke dikhate hain.</li>
<li>Ek root cause kai tests fail kar sakta hai; root cause fix karo.</li>
<li>Change ke baad flaky results se bachne ke liye thodi der retry karo.</li>
<li>Ek rerun mein ek change; test kamzor karke use green mat karo.</li>
</ul></div>
`}};export{e as default};