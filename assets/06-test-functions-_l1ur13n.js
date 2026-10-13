var e={id:`test-functions`,h:{en:`Writing test functions: expected values and a runner`,hi:`Test functions likhna: expected values aur ek runner`},body:{en:`
<p>A diff shows what changed. A <b>test</b> says what <i>should</i> be true. Together they cover both "did I break anything?" and "did I achieve what I wanted?" This chapter builds a test suite from tests.py, the file used in lab 2, piece by piece.</p>

<h3>Analogy: an exam paper with an answer key</h3>
<p>An exam has questions and an answer key. The teacher does not read each answer and "feel" whether it is right; she compares it with the key. In a network test the <b>expected value</b> is the answer key, and the value read from the router is the student's answer. The test is the marking.</p>

<h3>One test, one fact</h3>
<p>Each test is a <b>function</b> that checks <b>one</b> thing. Keep it small. When it fails, the name alone tells you what is wrong.</p>
<pre class="code"><span class="c"># Reference code: from tests.py in lab 2 (show() is the helper from chapter 3)</span>
def test_bgp_isp():
    <span class="c"># R1 must be Established with the ISP and receive at least one prefix</span>
    peer = show(ROUTERS["R1"], "show ip bgp summary")["neighbors"]["203.0.113.2"]
    assert peer["state"] == "Established", f"BGP to ISP is {peer['state']}, expected Established"
    assert peer["prefixes_received"] &gt; 0, "BGP is up but the ISP sends 0 prefixes"</pre>
<ul>
<li><code>def test_bgp_isp():</code> starts the function. The name begins with <code>test_</code> by convention, which is also how pytest finds tests.</li>
<li>The first line reads the BGP summary of R1 and picks out the entry for the ISP.</li>
<li>The first assert checks the <b>state</b>. The second checks the <b>prefix count</b>. Two asserts in one test are fine when both describe the same fact, "the ISP session is healthy".</li>
</ul>

<h3>Expected values in one place</h3>
<pre class="code">def test_ospf_neighbors():
    expected = {"R1": 1, "R2": 2, "R3": 1}      <span class="c"># the answer key</span>
    for router, ip in ROUTERS.items():
        full = 0
        for intf in show(ip, "show ip ospf neighbor")["interfaces"].values():
            for rid, n in intf["neighbors"].items():
                if n["state"].startswith("FULL"):
                    full = full + 1
        assert full == expected[router], f"{router} has {full} FULL OSPF neighbours, expected {expected[router]}"</pre>
<p>The dictionary <code>expected</code> is the design of the network written as data: R2 is in the middle and needs two neighbours, the ends need one. If the design changes, you change this one dictionary, not the logic. <code>startswith("FULL")</code> accepts FULL/DR, FULL/BDR and plain FULL.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Test runner structure">
<rect x="20" y="15" width="600" height="45" rx="10" fill="#e2e8f0"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">runner loop: for test in [ ... ]: test() then print PASS</text>
<rect x="20" y="95" width="180" height="55" rx="10" fill="#bae6fd"/><text x="110" y="120" text-anchor="middle" class="svg-ink" font-size="13">test_ospf_neighbors</text><text x="110" y="138" text-anchor="middle" class="svg-muted" font-size="12">1 fact per test</text>
<rect x="230" y="95" width="180" height="55" rx="10" fill="#fde68a"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">test_bgp_isp</text><text x="320" y="138" text-anchor="middle" class="svg-muted" font-size="12">1 fact per test</text>
<rect x="440" y="95" width="180" height="55" rx="10" fill="#bbf7d0"/><text x="530" y="120" text-anchor="middle" class="svg-ink" font-size="13">test_default_route</text><text x="530" y="138" text-anchor="middle" class="svg-muted" font-size="12">1 fact per test</text>
<line x1="110" y1="60" x2="110" y2="95" stroke="#64748b" stroke-width="2"/><line x1="320" y1="60" x2="320" y2="95" stroke="#64748b" stroke-width="2"/><line x1="530" y1="60" x2="530" y2="95" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">A runner calls each small test in turn.</p></div>

<h3>The runner</h3>
<pre class="code">for test in [test_ospf_neighbors, test_bgp_isp, test_default_route]:
    test()                        <span class="c"># run it; a failed assert stops everything here</span>
    print("PASS", test.__name__)  <span class="c"># only reached if the test did not fail</span>
print("ALL TESTS PASSED")</pre>
<p>Functions are values in Python, so they can sit in a list and be called in a loop. <code>test.__name__</code> is the function's own name. The first failed assert stops the script, which is simple but means later tests do not run; frameworks do better, see below.</p>

<h3>What a healthy run prints</h3>
<pre class="out">AUTO&gt; python3 tests.py
PASS test_ospf_neighbors
PASS test_bgp_isp
PASS test_default_route
<span class="hl">ALL TESTS PASSED</span></pre>

<h3>Frameworks do the plumbing</h3>
<p>The hand-made runner teaches the idea. Real teams use a framework. <b>pytest</b> finds every function named <code>test_...</code>, runs all of them even if one fails, and prints a summary. Cisco <b>pyATS</b> adds testbed files (a YAML list of devices), parsers for hundreds of show commands, and reports. The ideas are the same: small tests, expected values, assert.</p>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator): a pytest-style test file</span>
def test_every_router_has_default():
    for router, ip in ROUTERS.items():
        routes = show(ip, "show ip route")["routes"]
        assert "0.0.0.0/0" in routes, f"{router} has no default route"</pre>

<div class="eg"><p><b>Worked example.</b> The design says R1, R2 and R3 each need a default route. The test above loops over all three. If R3 has none, the message reads "R3 has no default route" and tells the engineer which router to inspect first, without any manual show command.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Putting many unrelated checks into one big test. When it fails you only learn "something is wrong". Also avoid hard-coding values that change legitimately, such as the total route count, which makes the test fail after every harmless change.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the difference between a stop-at-first-failure script (our simple runner) and a framework that runs everything and reports all failures. Also remember that test discovery in pytest depends on the <code>test_</code> naming rule.</p></div>

<div class="scn"><h4>The expected dictionary that documented the design</h4><p>A new engineer joined the team and asked how many OSPF neighbours each router should have. Nobody remembered. Someone pointed to the <code>expected</code> dictionary in tests.py: it was the only place the design was written down and it was always correct, because tests failed when it was not.</p><p><b>Lesson:</b> tests are executable documentation.</p></div>

<div class="iv"><p class="q">"How would you structure automated network validation tests?"</p><p>One small test per fact, named clearly, with expected values kept as data in one place and a descriptive assertion message. Run them as a pre-check and post-check, using pytest or pyATS so all failures are reported. Mention that parsed data (not raw text) is the input, and that results should be stored with the change ticket.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One test function checks one fact and is named test_something.</li>
<li>Expected values live in a dictionary that mirrors the design.</li>
<li>A simple runner calls each test and prints PASS; the first failed assert stops it.</li>
<li>pytest and pyATS run all tests and report every failure.</li>
<li>Tests double as executable documentation of the network design.</li>
</ul></div>
`,hi:`
<p>Diff batata hai kya badla. <b>Test</b> batata hai kya sach <i>hona chahiye</i>. Dono milkar "kya maine kuch toda?" aur "kya jo chahta tha woh hua?" dono ko cover karte hain. Yeh chapter lab 2 ki tests.py se test suite banata hai, tukda-tukda.</p>

<h3>Analogy: answer key ke saath exam paper</h3>
<p>Exam mein sawaal hote hain aur answer key hoti hai. Teacher har jawab padhkar "mehsoos" nahi karti ki sahi hai; woh key se compare karti hai. Network test mein <b>expected value</b> answer key hai, aur router se padhi value student ka jawab. Test marking hai.</p>

<h3>Ek test, ek fact</h3>
<p>Har test ek <b>function</b> hai jo <b>ek</b> cheez check karta hai. Chhota rakho. Fail ho to naam hi bata deta hai kya galat hai.</p>
<pre class="code"><span class="c"># Reference code: lab 2 ki tests.py se (show() chapter 3 ka helper hai)</span>
def test_bgp_isp():
    <span class="c"># R1 ko ISP ke saath Established hona chahiye aur kam se kam ek prefix milna chahiye</span>
    peer = show(ROUTERS["R1"], "show ip bgp summary")["neighbors"]["203.0.113.2"]
    assert peer["state"] == "Established", f"BGP to ISP is {peer['state']}, expected Established"
    assert peer["prefixes_received"] &gt; 0, "BGP is up but the ISP sends 0 prefixes"</pre>
<ul>
<li><code>def test_bgp_isp():</code> function shuru karta hai. Naam convention se <code>test_</code> se shuru hota hai, aur pytest bhi tests aise hi dhoondhta hai.</li>
<li>Pehli line R1 ka BGP summary padhti hai aur ISP wali entry nikalti hai.</li>
<li>Pehla assert <b>state</b> check karta hai. Doosra <b>prefix count</b>. Ek test mein do asserts theek hain jab dono ek hi fact batayein, "ISP session healthy hai".</li>
</ul>

<h3>Expected values ek jagah</h3>
<pre class="code">def test_ospf_neighbors():
    expected = {"R1": 1, "R2": 2, "R3": 1}      <span class="c"># answer key</span>
    for router, ip in ROUTERS.items():
        full = 0
        for intf in show(ip, "show ip ospf neighbor")["interfaces"].values():
            for rid, n in intf["neighbors"].items():
                if n["state"].startswith("FULL"):
                    full = full + 1
        assert full == expected[router], f"{router} has {full} FULL OSPF neighbours, expected {expected[router]}"</pre>
<p>Dictionary <code>expected</code> network ka design hai jo data ke roop mein likha gaya: R2 beech mein hai aur use do neighbours chahiye, kinaron ko ek. Design badle to aap yeh ek dictionary badalte ho, logic nahi. <code>startswith("FULL")</code> FULL/DR, FULL/BDR aur seedha FULL sab accept karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Test runner ka structure">
<rect x="20" y="15" width="600" height="45" rx="10" fill="#e2e8f0"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">runner loop: for test in [ ... ]: test() phir PASS print</text>
<rect x="20" y="95" width="180" height="55" rx="10" fill="#bae6fd"/><text x="110" y="120" text-anchor="middle" class="svg-ink" font-size="13">test_ospf_neighbors</text><text x="110" y="138" text-anchor="middle" class="svg-muted" font-size="12">ek test, ek fact</text>
<rect x="230" y="95" width="180" height="55" rx="10" fill="#fde68a"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">test_bgp_isp</text><text x="320" y="138" text-anchor="middle" class="svg-muted" font-size="12">ek test, ek fact</text>
<rect x="440" y="95" width="180" height="55" rx="10" fill="#bbf7d0"/><text x="530" y="120" text-anchor="middle" class="svg-ink" font-size="13">test_default_route</text><text x="530" y="138" text-anchor="middle" class="svg-muted" font-size="12">ek test, ek fact</text>
<line x1="110" y1="60" x2="110" y2="95" stroke="#64748b" stroke-width="2"/><line x1="320" y1="60" x2="320" y2="95" stroke="#64748b" stroke-width="2"/><line x1="530" y1="60" x2="530" y2="95" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Runner har chhote test ko baari-baari bulata hai.</p></div>

<h3>Runner</h3>
<pre class="code">for test in [test_ospf_neighbors, test_bgp_isp, test_default_route]:
    test()                        <span class="c"># chalao; assert fail hua to yahin sab ruk jaata hai</span>
    print("PASS", test.__name__)  <span class="c"># sirf tab pahunchta hai jab test fail nahi hua</span>
print("ALL TESTS PASSED")</pre>
<p>Python mein functions bhi values hain, isliye list mein rakhe aur loop mein bulaye ja sakte hain. <code>test.__name__</code> function ka apna naam hai. Pehla failed assert script rok deta hai, jo simple hai par aage ke tests nahi chalte; frameworks isse behtar karte hain, neeche dekho.</p>

<h3>Healthy run kya print karta hai</h3>
<pre class="out">AUTO&gt; python3 tests.py
PASS test_ospf_neighbors
PASS test_bgp_isp
PASS test_default_route
<span class="hl">ALL TESTS PASSED</span></pre>

<h3>Frameworks plumbing sambhalte hain</h3>
<p>Haath se bana runner idea sikhata hai. Real teams framework use karti hain. <b>pytest</b> <code>test_...</code> naam wale har function ko dhoondhta hai, ek fail ho tab bhi sab chalata hai, aur summary print karta hai. Cisco <b>pyATS</b> testbed files (devices ki YAML list), sainkdon show commands ke parsers aur reports jodta hai. Idea wahi hai: chhote tests, expected values, assert.</p>
<pre class="code"><span class="c"># Reference configuration (simulator mein run nahi hua): pytest-style test file</span>
def test_every_router_has_default():
    for router, ip in ROUTERS.items():
        routes = show(ip, "show ip route")["routes"]
        assert "0.0.0.0/0" in routes, f"{router} has no default route"</pre>

<div class="eg"><p><b>Worked example.</b> Design kehta hai R1, R2 aur R3 teeno ko default route chahiye. Upar ka test teeno par loop karta hai. R3 par na ho to message "R3 has no default route" padhta hai aur engineer ko bina manual show command ke batata hai pehle kaunsa router dekhna hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Bahut saari unrelated checks ek bade test mein daal dena. Fail hone par bas pata chalta hai "kuch galat hai". Aisi values bhi hard-code mat karo jo jayaz taur par badalti hain, jaise total route count, warna har harmless change ke baad test fail hoga.</p></div>
<div class="exam"><p><b>Exam trap.</b> Stop-at-first-failure script (hamara simple runner) aur woh framework jo sab chalata hai aur saari failures report karta hai, dono ka antar jaano. Yeh bhi yaad rakho ki pytest mein test discovery <code>test_</code> naming rule par depend karti hai.</p></div>

<div class="scn"><h4>Expected dictionary jo design ka document ban gayi</h4><p>Ek naya engineer team mein aaya aur poocha ki har router ke kitne OSPF neighbours hone chahiye. Kisi ko yaad nahi tha. Kisi ne tests.py ki <code>expected</code> dictionary dikhayi: wahi ek jagah thi jahan design likha tha aur woh hamesha sahi thi, kyunki galat hone par tests fail hote the.</p><p><b>Lesson:</b> tests executable documentation hain.</p></div>

<div class="iv"><p class="q">"Automated network validation tests ko kaise structure karoge?"</p><p>Har fact ke liye ek chhota test, saaf naam ke saath, expected values ek jagah data ki tarah, aur descriptive assertion message. Unhe pre-check aur post-check ki tarah chalao, pytest ya pyATS se taaki saari failures report hon. Bolo ki input parsed data hota hai (raw text nahi), aur results change ticket ke saath store hone chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek test function ek fact check karta hai aur uska naam test_something hota hai.</li>
<li>Expected values ek dictionary mein rehti hain jo design ko mirror karti hai.</li>
<li>Simple runner har test bulata hai aur PASS print karta hai; pehla failed assert use rok deta hai.</li>
<li>pytest aur pyATS saare tests chalate hain aur har failure report karte hain.</li>
<li>Tests network design ka executable documentation hain.</li>
</ul></div>
`}};export{e as default};