var e={id:`tests`,h:{en:`Tests for the toolkit: what is worth testing`,hi:`Toolkit ke tests: kya test karna worth hai`},body:{en:`
<p><b>The idea of this chapter:</b> a tool without tests is a tool nobody dares to change. You will write a handful of small tests that protect the logic that must never silently break, and you will see one of them turn red the moment someone breaks the drift filter. You learned pytest in <code>py-pytest</code>; here the question is different: <i>which</i> parts of a network tool deserve a test, and which do not.</p>

<h3>Analogy: a smoke alarm in every room</h3>
<p>A smoke alarm does not put out fires. It makes sure that you hear about one in the first minute instead of the next morning. Tests do the same for your code: they do not make it correct, they make a wrong change <i>loud</i> and <i>early</i>, before a router sees it.</p>

<h3>What is worth testing</h3>
<table class="cmp"><tr><th>Test it</th><th>Do not unit-test it</th></tr>
<tr><td><code>changes()</code>: the drift filter</td><td>The live SSH session (needs a router; that is what the lab runs are for)</td></tr>
<tr><td><code>plan()</code>: which lines are missing</td><td>The <code>tabulate</code> library's layout (its authors test it)</td></tr>
<tr><td><code>inverse()</code>: how to undo a line</td><td>The argparse wiring in <code>nettool.py</code> (thin; run it by hand)</td></tr>
<tr><td><code>clean()</code>: what counts as noise</td><td>Every print statement</td></tr>
</table>
<p>The left column is made of <b>pure functions</b>: they take lists and return lists, with no router, no file and no clock. They hold the decisions of the tool, which is exactly where a silent mistake hurts. This is the payoff of chapter 2: because each drawer has one job, the logic can be imported and tested alone.</p>

<h3>test_drift.py</h3>
<p>Think about the cases for <code>changes()</code>: nothing changed, a line added, a line removed. (A changed line is simply one of each.) Write one small test per case:</p>
<pre class="code">from toolkit.drift import changes


def test_same():
    assert changes(["a", "b"], ["a", "b"]) == []


def test_added():
    assert changes(["a"], ["a", "b"]) == ["+b"]


def test_removed():
    assert changes(["a", "b"], ["a"]) == ["-b"]</pre>
<pre class="out">AUTO01$ pytest -q
...                                                                      [100%]
<span class="hl">3 passed in 0.04s</span></pre>
<p>pytest finds files named <code>test_*.py</code> and runs every function named <code>test_*</code>. A test passes if no <code>assert</code> fails. The dots are passes, one per test. The test names read like a sentence, so a failure explains itself.</p>

<h3>test_push.py: the other pure functions</h3>
<pre class="code">from toolkit.collect import clean
from toolkit.push import inverse, plan


def test_inverse_adds_no():
    assert inverse("ntp server 10.99.0.50") == "no ntp server 10.99.0.50"


def test_inverse_removes_no():
    assert inverse("no ntp server 10.99.0.50") == "ntp server 10.99.0.50"


def test_plan_only_missing_lines():
    running = ["hostname R2", "ntp server 10.99.0.50"]
    wanted = ["ntp server 10.99.0.50", "logging host 10.99.0.51"]
    assert plan(running, wanted) == ["logging host 10.99.0.51"]


def test_clean_drops_noise():
    raw = "Building configuration...\\n!\\nhostname R1\\n"
    assert clean(raw) == ["hostname R1"]</pre>
<pre class="out">AUTO01$ pytest -q test_push.py
....                                                                     [100%]
<span class="hl">4 passed in 0.05s</span></pre>
<p>Importing <code>toolkit.push</code> does not open any SSH session, because nothing runs until a function is called. That is another benefit of keeping side effects inside functions.</p>

<h3>A red test: the drift filter that forgot removed lines</h3>
<p>Now suppose someone "simplifies" the filter in <code>changes()</code> and keeps only lines that start with <code>+</code>. The old tests for added lines still pass. The removed-line test does not:</p>
<pre class="out">AUTO01$ pytest -q
..F                                                                      [100%]

=================================== FAILURES ===================================
_________________________________ test_removed _________________________________

    def test_removed():
<span class="hl">E       assert [] == ['-b']</span>
E         Right contains one more item: '-b'
E         Use -v to get more diff
E        +  where [] = changes(['a', 'b'], ['a'])

test_drift.py:13: AssertionError
=========================== short test summary info ============================
FAILED test_drift.py::test_removed - assert [] == ['-b']
<span class="hl">1 failed, 2 passed in 0.04s</span></pre>
<p>Read it from the bottom. One test failed, two passed. The line starting with <code>E</code> is the comparison: the function returned an empty list <code>[]</code> but the test expected <code>['-b']</code>. The last <code>E</code> line even names the call: <code>changes(['a', 'b'], ['a'])</code>. Now ask the standard question: <b>is the code wrong or the test?</b> The test says that a deleted line must show up as <code>-b</code>, which is exactly what a unified diff means. So the code is wrong, and the fix belongs in <code>drift.py</code>, not in the test. Never edit a correct test to make it green.</p>

<div class="eg"><p><b>Worked example.</b> Before a Friday release the engineer changes the filter, runs <code>pytest -q</code>, and sees <code>1 failed, 2 passed</code> in four seconds. Without the test, the first sign would have been a router losing its NTP server and nobody being told, weeks later. With the test, the mistake never leaves the laptop.</p></div>

<div class="note"><p><b>Reference code.</b> To test <code>backup_all</code> without a router, a test can replace <code>fetch</code> with a fake function that raises an error for one name, using the pytest <code>monkeypatch</code> fixture (py-pytest). That checks the promise "one failure never stops the loop". Add such a test when the tool grows, not before the simple ones work.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Testing only the happy path, so removed lines and empty inputs are never tried. Editing the test to match a wrong result. Testing library code instead of your own decisions. Writing tests that need a live router, so nobody runs them.</p></div>
<div class="exam"><p><b>Exam trap.</b> A <i>green</i> suite only proves the cases you wrote. Three passing tests did not protect the filter until the <code>removed</code> case existed. Always add a case for each direction and for the empty case.</p></div>

<div class="scn"><h4>The tidy-up that hid deletions</h4><p>A colleague shortened the drift filter to "just show what is new". Reports looked cleaner for a month. Then an audit found a router that had lost its logging server weeks earlier. Adding the three-line test file made the original mistake fail immediately, and the filter was restored in minutes.</p><p><b>Lesson:</b> every bug you fix gets a test that would have caught it.</p></div>

<div class="iv"><p class="q">"What do you test in a network automation tool?"</p><p>I test the decision logic as pure functions: what counts as drift, which lines are missing, how to undo a line, what counts as noise. I do not unit-test live device sessions or library formatting. I cover added, removed, unchanged and empty cases, and every bug I fix gets a test.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Test pure functions that hold the tool's decisions: <code>changes</code>, <code>plan</code>, <code>inverse</code>, <code>clean</code>.</li>
<li>One drawer, one job is what makes this possible.</li>
<li>Cover each direction and the empty case; a removed-line test catches the one-way filter.</li>
<li>Read a red test from the bottom and ask whether the code or the test is wrong.</li>
<li>Run <code>pytest -q</code> before every change goes live.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> jis tool ke tests nahi, use badalne ki himmat koi nahi karta. Aap kuch chhote tests likhoge jo us logic ko bachate hain jo chupchaap kabhi nahi tootna chahiye, aur dekhoge ki jaise hi koi drift filter tod de, ek test laal ho jata hai. pytest aapne <code>py-pytest</code> mein seekha; yahan sawal alag hai: network tool ke <i>kaun se</i> hisse test ke laayak hain, aur kaun se nahi.</p>

<h3>Analogy: har kamre mein smoke alarm</h3>
<p>Smoke alarm aag nahi bujhata. Woh yeh pakka karta hai ki aapko aag ka pehle minute mein pata chale, agli subah nahi. Tests aapke code ke liye wahi karte hain: woh code ko sahi nahi banate, galat change ko <i>zor se</i> aur <i>jaldi</i> bolne wala banate hain, router tak pahunchne se pehle.</p>

<h3>Kya test karna worth hai</h3>
<table class="cmp"><tr><th>Test karo</th><th>Unit-test mat karo</th></tr>
<tr><td><code>changes()</code>: drift filter</td><td>Live SSH session (router chahiye; uske liye lab runs hain)</td></tr>
<tr><td><code>plan()</code>: kaun si lines missing hain</td><td><code>tabulate</code> library ka layout (uske authors test karte hain)</td></tr>
<tr><td><code>inverse()</code>: line ko undo kaise karein</td><td><code>nettool.py</code> ka argparse wiring (patla hai; haath se chalao)</td></tr>
<tr><td><code>clean()</code>: kya noise maana jaye</td><td>Har print statement</td></tr>
</table>
<p>Baayein column mein <b>pure functions</b> hain: woh lists lete hain aur lists lautate hain, bina router, file ya clock ke. Tool ke decisions inhi mein hain, aur chupchaap galti wahin sabse zyada chubhti hai. Yeh chapter 2 ka phal hai: kyunki har drawer ka ek kaam hai, logic ko akela import karke test kar sakte hain.</p>

<h3>test_drift.py</h3>
<p><code>changes()</code> ke cases socho: kuch nahi badla, ek line jodi gayi, ek line hatayi gayi. (Badli hui line bas ek-ek ka jodi hai.) Har case ke liye ek chhota test likho:</p>
<pre class="code">from toolkit.drift import changes


def test_same():
    assert changes(["a", "b"], ["a", "b"]) == []


def test_added():
    assert changes(["a"], ["a", "b"]) == ["+b"]


def test_removed():
    assert changes(["a", "b"], ["a"]) == ["-b"]</pre>
<pre class="out">AUTO01$ pytest -q
...                                                                      [100%]
<span class="hl">3 passed in 0.04s</span></pre>
<p>pytest <code>test_*.py</code> naam wali files dhoondhta hai aur har <code>test_*</code> naam wala function chalata hai. Test tab pass hota hai jab koi <code>assert</code> fail na ho. Dots passes hain, har test ka ek. Test ke naam vaakya ki tarah padhte hain, isliye failure khud apni baat samjha deta hai.</p>

<h3>test_push.py: baaki pure functions</h3>
<pre class="code">from toolkit.collect import clean
from toolkit.push import inverse, plan


def test_inverse_adds_no():
    assert inverse("ntp server 10.99.0.50") == "no ntp server 10.99.0.50"


def test_inverse_removes_no():
    assert inverse("no ntp server 10.99.0.50") == "ntp server 10.99.0.50"


def test_plan_only_missing_lines():
    running = ["hostname R2", "ntp server 10.99.0.50"]
    wanted = ["ntp server 10.99.0.50", "logging host 10.99.0.51"]
    assert plan(running, wanted) == ["logging host 10.99.0.51"]


def test_clean_drops_noise():
    raw = "Building configuration...\\n!\\nhostname R1\\n"
    assert clean(raw) == ["hostname R1"]</pre>
<pre class="out">AUTO01$ pytest -q test_push.py
....                                                                     [100%]
<span class="hl">4 passed in 0.05s</span></pre>
<p><code>toolkit.push</code> import karne se koi SSH session nahi khulta, kyunki function call hone tak kuch chalta nahi. Side effects ko functions ke andar rakhne ka yeh doosra fayda hai.</p>

<h3>Red test: drift filter jo hatayi lines bhool gaya</h3>
<p>Maan lo koi <code>changes()</code> ke filter ko "simple" karke sirf <code>+</code> se shuru hone wali lines rakhta hai. Jodi gayi lines ke purane tests ab bhi pass hote hain. Hatayi gayi line ka test nahi:</p>
<pre class="out">AUTO01$ pytest -q
..F                                                                      [100%]

=================================== FAILURES ===================================
_________________________________ test_removed _________________________________

    def test_removed():
<span class="hl">E       assert [] == ['-b']</span>
E         Right contains one more item: '-b'
E         Use -v to get more diff
E        +  where [] = changes(['a', 'b'], ['a'])

test_drift.py:13: AssertionError
=========================== short test summary info ============================
FAILED test_drift.py::test_removed - assert [] == ['-b']
<span class="hl">1 failed, 2 passed in 0.04s</span></pre>
<p>Ise neeche se padho. Ek test fail hua, do pass. <code>E</code> se shuru hone wali line comparison hai: function ne khaali list <code>[]</code> lautayi par test ko <code>['-b']</code> chahiye tha. Aakhri <code>E</code> line call ka naam bhi batati hai: <code>changes(['a', 'b'], ['a'])</code>. Ab standard sawal poochho: <b>code galat hai ya test?</b> Test kehta hai ki hatayi gayi line <code>-b</code> ki tarah dikhni chahiye, jo unified diff ka asli matlab hai. Isliye code galat hai, aur fix <code>drift.py</code> mein jayegi, test mein nahi. Sahi test ko green banane ke liye kabhi edit mat karo.</p>

<div class="eg"><p><b>Worked example.</b> Shukravar ki release se pehle engineer filter badalta hai, <code>pytest -q</code> chalata hai, aur chaar second mein <code>1 failed, 2 passed</code> dekhta hai. Test ke bina pehla sanket hafton baad router ka NTP server ghayab hona hota, aur kisi ko batana nahi padta. Test ke saath galti laptop se bahar jati hi nahi.</p></div>

<div class="note"><p><b>Reference code.</b> <code>backup_all</code> ko router ke bina test karne ke liye, test <code>fetch</code> ko ek nakli function se replace kar sakta hai jo ek naam par error raise kare, pytest <code>monkeypatch</code> fixture se (py-pytest). Isse waada check hota hai "ek failure loop ko kabhi nahi rokti". Aisa test tab jodo jab tool bade, simple tests chalne se pehle nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sirf happy path test karna, jisse hatayi lines aur khaali inputs kabhi try nahi hote. Galat result ke hisaab se test badal dena. Apne decisions ki jagah library code test karna. Aise tests likhna jinhe live router chahiye, to koi unhe chalata nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> <i>Green</i> suite sirf unhi cases ko saabit karti hai jo aapne likhe. Teen passing tests ne filter tab tak nahi bachaya jab tak <code>removed</code> case nahi tha. Har direction aur khaali case ke liye case jodo.</p></div>

<div class="scn"><h4>Safai jisne deletions chhupa diye</h4><p>Ek colleague ne drift filter ko chhota karke "bas jo naya hai woh dikhao" kar diya. Reports ek mahine tak saaf dikhi. Phir audit ne ek aisa router dhoondha jisne hafton pehle apna logging server kho diya tha. Teen-line ki test file jodte hi original galti turant fail hui, aur filter minutes mein wapas aa gaya.</p><p><b>Lesson:</b> jo bug aap theek karte ho, uske liye ek test jodo jo use pakad leta.</p></div>

<div class="iv"><p class="q">"Network automation tool mein kya test karte ho?"</p><p>Decision logic ko pure functions ki tarah test karta hoon: drift kya hai, kaun si lines missing hain, line ko undo kaise karein, noise kya hai. Live device sessions ya library formatting ko unit-test nahi karta. Added, removed, unchanged aur empty cases cover karta hoon, aur har fix kiye bug ka ek test hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Un pure functions ko test karo jinme tool ke decisions hain: <code>changes</code>, <code>plan</code>, <code>inverse</code>, <code>clean</code>.</li>
<li>Ek drawer, ek kaam isi ko possible banata hai.</li>
<li>Har direction aur khaali case cover karo; removed-line test ek-tarfa filter pakadta hai.</li>
<li>Red test neeche se padho aur poochho code galat hai ya test.</li>
<li>Har change live jaane se pehle <code>pytest -q</code> chalao.</li>
</ul></div>
`}};export{e as default};