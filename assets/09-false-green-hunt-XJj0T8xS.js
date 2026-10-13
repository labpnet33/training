var e={id:`false-green-hunt`,h:{en:`Troubleshooting: why did the check pass?`,hi:`Troubleshooting: check pass kyun hua?`},body:{en:`
<p>The most expensive failure in network automation is a green check on a broken network. Nobody investigates a pass. The nightly pipeline reports "1 passed", the engineer goes home and the outage is found by a customer. This chapter is a method for the opposite problem: you are handed a pipeline that says <b>passed</b> and you are told the network is not fine. Lab 2 gives you exactly that, and this chapter walks the method on it.</p>

<h3>The method in five moves</h3>
<table class="cmp"><tr><th>Move</th><th>Question</th></tr>
<tr><td>1. Look at the network yourself</td><td>Is the network actually broken? (one <code>show</code> command)</td></tr>
<tr><td>2. Read the full report, not the summary</td><td>What did each test say it matched?</td></tr>
<tr><td>3. Ask "can this test fail?"</td><td>What change would turn it red?</td></tr>
<tr><td>4. Fix one weakness, rerun</td><td>Did the report change?</td></tr>
<tr><td>5. Repeat until it fails for the right reason</td><td>Then undo the change and see it pass honestly</td></tr></table>

<h3>The situation</h3>
<p>The nightly job takes a pre snapshot, applies CHG-3110 to J2 and takes a post snapshot. Then the gate runs: <code>pytest -q test_gate.py</code>.</p>
<pre class="out">AUTO01$ pytest -q test_gate.py
.                                                                        [100%]
1 passed in 0.96s</pre>
<p>One test, passed. But the change disabled the J2 to J3 link, so J2 should have lost 10.23.0.2. Move 1 confirms it by looking: <code>show ospf neighbor</code> on J2 lists only three neighbours. The network is broken and the gate is green. Move 2: pytest swallows the report, so call the check function by hand and look at what JSNAPy actually said.</p>
<pre class="out">AUTO01$ python3 -c "from test_gate import run_check; run_check()"
**************************** Device: 10.99.0.12 ****************************
Tests Included: test_ospf_nbr, test_bgp_peers
*************************** Command: show ospf neighbor ***************************
<span class="hl">PASS | Nodes are not present for xpath "ospf-neighbour" (ignore-null)</span>
*************************** Command: show bgp summary ***************************
PASS | All "peer-state" is equal to "Established" [ 2 matched ]
------------------------------ Final Result!! ------------------------------
test_ospf_nbr : Passed
test_bgp_peers : Passed
Total No of tests passed: 2
Total No of tests failed: 0
Overall Tests passed!!!</pre>
<p>The first line is the whole story: <code>Nodes are not present for xpath "ospf-neighbour" (ignore-null)</code>. The test looked for a tag called <code>ospf-neighbour</code> (British spelling); the device calls it <code>ospf-neighbor</code>. Nothing matched, and <code>ignore-null: True</code> turned "nothing matched" into a PASS. The OSPF test has never checked anything.</p>

<h3>Weakness 1: the typo hidden by ignore-null</h3>
<p>Remove <code>ignore-null</code> and correct the spelling. Now the test really looks at the neighbours.</p>
<pre class="out">AUTO01$ python3 -c "from test_gate import run_check; run_check()"
**************************** Device: 10.99.0.12 ****************************
Tests Included: test_ospf_nbr, test_bgp_peers
*************************** Command: show ospf neighbor ***************************
<span class="hl">PASS | All "ospf-neighbor-state" is equal to "Full" [ 3 matched ]</span>
*************************** Command: show bgp summary ***************************
PASS | All "peer-state" is equal to "Established" [ 2 matched ]
------------------------------ Final Result!! ------------------------------
test_ospf_nbr : Passed
test_bgp_peers : Passed
Total No of tests passed: 2
Total No of tests failed: 0
Overall Tests passed!!!</pre>
<p>Better: <code>[ 3 matched ]</code> means three real neighbours were tested. But it still passes. Every neighbour that remains is Full; the test cannot see the one that is missing.</p>

<h3>Weakness 2: nothing asks about disappearance</h3>
<p>Add the operator from chapter 4, <code>list-not-less: neighbor-address</code>. And rerun.</p>
<pre class="out">AUTO01$ python3 -c "from test_gate import run_check; run_check()"
**************************** Device: 10.99.0.12 ****************************
Tests Included: test_ospf_nbr, test_bgp_peers
*************************** Command: show ospf neighbor ***************************
PASS | All "ospf-neighbor-state" is equal to "Full" [ 3 matched ]
<span class="hl">PASS | All "neighbor-address" list does not lose entries [ 3 matched ]</span>
*************************** Command: show bgp summary ***************************
PASS | All "peer-state" is equal to "Established" [ 2 matched ]
------------------------------ Final Result!! ------------------------------
test_ospf_nbr : Passed
test_bgp_peers : Passed
Total No of tests passed: 3
Total No of tests failed: 0
Overall Tests passed!!!</pre>
<p>Still green. The test file is now correct, so the fault is somewhere else. Look at <code>test_gate.py</code>: it calls <code>js.snapcheck(config(), "post")</code>. <code>snapcheck</code> compares a snapshot with <b>itself</b>. A list cannot lose entries relative to itself, so <code>list-not-less</code> can never fail there.</p>

<h3>Weakness 3: the wrong function</h3>
<p>Change the call to <code>js.check(config(), "pre", "post")</code> so the two snapshots are compared.</p>
<pre class="out">AUTO01$ python3 -c "from test_gate import run_check; run_check()"
**************************** Device: 10.99.0.12 ****************************
Tests Included: test_ospf_nbr, test_bgp_peers
*************************** Command: show ospf neighbor ***************************
PASS | All "ospf-neighbor-state" is equal to "Full" [ 3 matched ]
<span class="hl">FAIL | All "neighbor-address" list does not lose entries [ 3 matched / 1 failed ]</span>
<span class="hl">ERROR : "neighbor-address" value "10.23.0.2" was in the pre snapshot but is missing from the post snapshot</span>
*************************** Command: show bgp summary ***************************
PASS | All "peer-state" is equal to "Established" [ 2 matched ]
------------------------------ Final Result!! ------------------------------
test_ospf_nbr : Failed
test_bgp_peers : Passed
Total No of tests passed: 2
Total No of tests failed: 1
Overall Tests failed!!!</pre>
<p>Now JSNAPy fails on J2 and names the missing neighbour. This is the right report. And the gate?</p>
<pre class="out">AUTO01$ pytest -q test_gate.py
.                                                                        [100%]
1 passed in 0.02s</pre>
<p>Still <code>1 passed</code>, with a red report in the middle of it.</p>

<h3>Weakness 4: assert on something that is always true</h3>
<p>The test says <code>assert results</code>. <code>results</code> is a list of three objects. A non-empty list is True, whatever those objects say. The assertion only proves that JSNAPy returned something. The fix looks at the verdict of each router.</p>
<pre class="out">AUTO01$ pytest -q test_gate.py
Overall Tests failed!!!
=========================== short test summary info ============================
FAILED test_gate.py::test_post_change_health - AssertionError: health check f...
1 failed in 0.02s</pre>
<p>Now the gate fails and the failure message names the routers. The red test is correct; the network is broken.</p>

<h3>Close the loop</h3>
<p>Undo the change, wait for OSPF to finish converging, take a new post snapshot and run the gate again.</p>
<pre class="out">AUTO01$ python3 nightly.py undo
nightly: CHG-3110 undone, OSPF Full after 50 s</pre>
<pre class="out">AUTO01$ pytest -q test_gate.py
.                                                                        [100%]
1 passed in 0.02s</pre>
<p>Green again, and this time for a reason: you saw it red first.</p>

<div class="eg"><p><b>Worked example.</b> A review checklist for any check you did not write. (1) Where does the number of matched items show up? Zero is a warning. (2) Is <code>ignore-null</code> used, and why? (3) Is the cross-snapshot operator run through <code>check</code> or <code>snapcheck</code>? (4) What does the assertion test: the verdict, or just that a result exists? (5) Have I seen this check fail?</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Trusting the summary line. (2) Fixing the test file and not the code that runs it. (3) Declaring victory after one fix; the four weaknesses were hiding each other. (4) Testing the fix on the healthy network, where every version is green.</p></div>
<div class="exam"><p><b>Exam trap.</b> Weaknesses 3 and 4 are about the Python around JSNAPy, not about JSNAPy. The report can be perfect and the pipeline still green, if the assertion never reads it.</p></div>

<div class="scn"><h4>Mutation testing for checks</h4><p>A team made it a rule: before a new check goes live, deliberately break the thing it protects in the lab and confirm it fails. The nightly job for CHG-3110 was never put through that test; three of its four weaknesses would have shown up on the first try.</p><p><b>Lesson:</b> a check earns trust by failing once, on purpose.</p></div>

<div class="iv"><p class="q">"A test passed but the network is broken. Where do you start?"</p><p>I confirm the breakage with a show command, read the full report to see what the test actually matched, then ask whether the test can fail at all: the xpath, <code>ignore-null</code>, the operator, <code>snapcheck</code> against <code>check</code>, and what the assertion tests. I fix one thing at a time and rerun.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Start from the network, not from the test result.</li>
<li>Read the matched counts; zero matched with a PASS means the test saw nothing.</li>
<li><code>ignore-null</code> turns a mistyped xpath into a pass.</li>
<li><code>snapcheck</code> cannot fail a cross-snapshot operator; use <code>check</code>.</li>
<li><code>assert results</code> proves nothing; assert on each router's verdict.</li>
<li>Trust a check only after you have seen it fail for the right reason.</li>
</ul></div>
`,hi:`
<p>Network automation ki sabse mehngi failure toota hua network par hara check hai. Pass ki koi jaanch nahi karta. Nightly pipeline "1 passed" batati hai, engineer ghar chala jaata hai aur outage customer pakadta hai. Yeh chapter ulti samasya ke liye tareeka hai: aapko ek pipeline di gayi hai jo <b>passed</b> kehti hai aur aapko bataya gaya hai ki network theek nahi. Lab 2 aapko theek wahi deta hai, aur yeh chapter us par tareeka chalata hai.</p>

<h3>Paanch kadam ka tareeka</h3>
<table class="cmp"><tr><th>Kadam</th><th>Sawaal</th></tr>
<tr><td>1. Network khud dekho</td><td>Kya network sach mein kharaab hai? (ek <code>show</code> command)</td></tr>
<tr><td>2. Poori report padho, summary nahi</td><td>Har test ne kya match kiya batata hai?</td></tr>
<tr><td>3. Poochho "kya yeh test fail ho sakta hai?"</td><td>Kaunsa change ise laal karega?</td></tr>
<tr><td>4. Ek kamzori theek karo, dobara chalao</td><td>Kya report badli?</td></tr>
<tr><td>5. Tab tak dohrao jab tak sahi wajah se fail na ho</td><td>Phir change undo karo aur imaandari se pass hote dekho</td></tr></table>

<h3>Sthiti</h3>
<p>Nightly job pre snapshot leta hai, J2 par CHG-3110 lagata hai aur post snapshot leta hai. Phir gate chalta hai: <code>pytest -q test_gate.py</code>.</p>
<pre class="out">AUTO01$ pytest -q test_gate.py
.                                                                        [100%]
1 passed in 0.96s</pre>
<p>Ek test, passed. Lekin change ne J2 se J3 ka link band kiya, to J2 ko 10.23.0.2 khona chahiye tha. Kadam 1 dekhkar pushti karta hai: J2 par <code>show ospf neighbor</code> sirf teen neighbours dikhata hai. Network kharaab hai aur gate hara. Kadam 2: pytest report ko nigal jaata hai, isliye check function haath se bulao aur dekho JSNAPy ne asal mein kya kaha.</p>
<pre class="out">AUTO01$ python3 -c "from test_gate import run_check; run_check()"
**************************** Device: 10.99.0.12 ****************************
Tests Included: test_ospf_nbr, test_bgp_peers
*************************** Command: show ospf neighbor ***************************
<span class="hl">PASS | Nodes are not present for xpath "ospf-neighbour" (ignore-null)</span>
*************************** Command: show bgp summary ***************************
PASS | All "peer-state" is equal to "Established" [ 2 matched ]
------------------------------ Final Result!! ------------------------------
test_ospf_nbr : Passed
test_bgp_peers : Passed
Total No of tests passed: 2
Total No of tests failed: 0
Overall Tests passed!!!</pre>
<p>Pehli line poori kahani hai: <code>Nodes are not present for xpath "ospf-neighbour" (ignore-null)</code>. Test ne <code>ospf-neighbour</code> (British spelling) naam ka tag dhoondha; device use <code>ospf-neighbor</code> kehta hai. Kuch match nahi hua, aur <code>ignore-null: True</code> ne "kuch match nahi hua" ko PASS bana diya. OSPF test ne kabhi kuch check hi nahi kiya.</p>

<h3>Kamzori 1: ignore-null ke peeche chhupa typo</h3>
<p><code>ignore-null</code> hatao aur spelling theek karo. Ab test sach mein neighbours dekhta hai.</p>
<pre class="out">AUTO01$ python3 -c "from test_gate import run_check; run_check()"
**************************** Device: 10.99.0.12 ****************************
Tests Included: test_ospf_nbr, test_bgp_peers
*************************** Command: show ospf neighbor ***************************
<span class="hl">PASS | All "ospf-neighbor-state" is equal to "Full" [ 3 matched ]</span>
*************************** Command: show bgp summary ***************************
PASS | All "peer-state" is equal to "Established" [ 2 matched ]
------------------------------ Final Result!! ------------------------------
test_ospf_nbr : Passed
test_bgp_peers : Passed
Total No of tests passed: 2
Total No of tests failed: 0
Overall Tests passed!!!</pre>
<p>Behtar: <code>[ 3 matched ]</code> ka matlab teen asli neighbours test hue. Lekin phir bhi pass hai. Jo neighbour bacha hai woh sab Full hai; test us ek ko nahi dekh sakta jo gayab hai.</p>

<h3>Kamzori 2: gayab hone ke baare mein koi nahi poochhta</h3>
<p>Chapter 4 ka operator jodo, <code>list-not-less: neighbor-address</code>. Aur dobara chalao.</p>
<pre class="out">AUTO01$ python3 -c "from test_gate import run_check; run_check()"
**************************** Device: 10.99.0.12 ****************************
Tests Included: test_ospf_nbr, test_bgp_peers
*************************** Command: show ospf neighbor ***************************
PASS | All "ospf-neighbor-state" is equal to "Full" [ 3 matched ]
<span class="hl">PASS | All "neighbor-address" list does not lose entries [ 3 matched ]</span>
*************************** Command: show bgp summary ***************************
PASS | All "peer-state" is equal to "Established" [ 2 matched ]
------------------------------ Final Result!! ------------------------------
test_ospf_nbr : Passed
test_bgp_peers : Passed
Total No of tests passed: 3
Total No of tests failed: 0
Overall Tests passed!!!</pre>
<p>Abhi bhi hara. Test file ab sahi hai, to galti kahin aur hai. <code>test_gate.py</code> dekho: woh <code>js.snapcheck(config(), "post")</code> bulati hai. <code>snapcheck</code> snapshot ko <b>khud se</b> compare karta hai. Koi list apne aap se entries nahi kho sakti, isliye wahan <code>list-not-less</code> kabhi fail nahi ho sakta.</p>

<h3>Kamzori 3: galat function</h3>
<p>Call ko <code>js.check(config(), "pre", "post")</code> kar do taaki dono snapshots compare hon.</p>
<pre class="out">AUTO01$ python3 -c "from test_gate import run_check; run_check()"
**************************** Device: 10.99.0.12 ****************************
Tests Included: test_ospf_nbr, test_bgp_peers
*************************** Command: show ospf neighbor ***************************
PASS | All "ospf-neighbor-state" is equal to "Full" [ 3 matched ]
<span class="hl">FAIL | All "neighbor-address" list does not lose entries [ 3 matched / 1 failed ]</span>
<span class="hl">ERROR : "neighbor-address" value "10.23.0.2" was in the pre snapshot but is missing from the post snapshot</span>
*************************** Command: show bgp summary ***************************
PASS | All "peer-state" is equal to "Established" [ 2 matched ]
------------------------------ Final Result!! ------------------------------
test_ospf_nbr : Failed
test_bgp_peers : Passed
Total No of tests passed: 2
Total No of tests failed: 1
Overall Tests failed!!!</pre>
<p>Ab JSNAPy J2 par fail karta hai aur gayab neighbour ka naam batata hai. Yeh sahi report hai. Aur gate?</p>
<pre class="out">AUTO01$ pytest -q test_gate.py
.                                                                        [100%]
1 passed in 0.02s</pre>
<p>Abhi bhi <code>1 passed</code>, jabki beech mein laal report hai.</p>

<h3>Kamzori 4: aisi cheez par assert jo hamesha sach hai</h3>
<p>Test kehta hai <code>assert results</code>. <code>results</code> teen objects ki list hai. Khaali na hone wali list True hoti hai, un objects ne kuch bhi kaha ho. Assertion sirf yeh saabit karta hai ki JSNAPy ne kuch lautaya. Sudhaar har router ka verdict dekhta hai.</p>
<pre class="out">AUTO01$ pytest -q test_gate.py
Overall Tests failed!!!
=========================== short test summary info ============================
FAILED test_gate.py::test_post_change_health - AssertionError: health check f...
1 failed in 0.02s</pre>
<p>Ab gate fail hota hai aur failure message routers ke naam batata hai. Laal test sahi hai; network kharaab hai.</p>

<h3>Chakra poora karo</h3>
<p>Change undo karo, OSPF ke converge hone ka wait karo, naya post snapshot lo aur gate dobara chalao.</p>
<pre class="out">AUTO01$ python3 nightly.py undo
nightly: CHG-3110 undone, OSPF Full after 50 s</pre>
<pre class="out">AUTO01$ pytest -q test_gate.py
.                                                                        [100%]
1 passed in 0.02s</pre>
<p>Phir hara, aur is baar wajah ke saath: aapne use pehle laal dekha tha.</p>

<div class="eg"><p><b>Worked example.</b> Kisi bhi aise check ke liye review checklist jo aapne nahi likha. (1) Matched items ka number kahan dikhta hai? Zero ek chetavani hai. (2) <code>ignore-null</code> use hua hai, aur kyun? (3) Cross-snapshot operator <code>check</code> se chalta hai ya <code>snapcheck</code> se? (4) Assertion kya test karti hai: verdict, ya sirf yeh ki result maujood hai? (5) Kya maine yeh check fail hote dekha hai?</p></div>

<div class="warn"><p><b>Aam galtiyan.</b> (1) Summary line par bharosa. (2) Test file theek karna aur use chalane wala code nahi. (3) Ek fix ke baad jeet ghoshit karna; chaaron kamzoriyan ek-doosre ko chhupa rahi thin. (4) Fix ko healthy network par test karna, jahan har version hara hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Kamzori 3 aur 4 JSNAPy ke baare mein nahi, JSNAPy ke aas-paas ke Python ke baare mein hain. Report bilkul sahi ho sakti hai aur pipeline phir bhi hari, agar assertion use kabhi padhti hi nahi.</p></div>

<div class="scn"><h4>Checks ke liye mutation testing</h4><p>Ek team ne niyam banaya: naya check live jaane se pehle, jo cheez woh bachata hai use lab mein jaanboojhkar todo aur pakka karo ki woh fail hota hai. CHG-3110 ka nightly job is test se kabhi nahi guzra; uski chaar mein se teen kamzoriyan pehli koshish mein dikh jaati.</p><p><b>Lesson:</b> check bharosa tab kamata hai jab woh ek baar jaanboojhkar fail ho.</p></div>

<div class="iv"><p class="q">"Test pass hua par network kharaab hai. Kahan se shuru karte ho?"</p><p>Main show command se kharabi pakki karta hoon, poori report padhta hoon ki test ne asal mein kya match kiya, phir poochhta hoon ki test fail bhi ho sakta hai ya nahi: xpath, <code>ignore-null</code>, operator, <code>snapcheck</code> ya <code>check</code>, aur assertion kya test karti hai. Ek-ek cheez theek karke dobara chalata hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Test result se nahi, network se shuru karo.</li>
<li>Matched counts padho; PASS ke saath zero matched ka matlab test ne kuch nahi dekha.</li>
<li><code>ignore-null</code> galat likhe xpath ko pass bana deta hai.</li>
<li><code>snapcheck</code> cross-snapshot operator ko fail nahi kar sakta; <code>check</code> use karo.</li>
<li><code>assert results</code> kuch saabit nahi karta; har router ke verdict par assert karo.</li>
<li>Check par tab bharosa karo jab use sahi wajah se fail hote dekh lo.</li>
</ul></div>
`}};export{e as default};