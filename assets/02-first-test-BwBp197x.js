var e={id:`first-test`,h:{en:`Your first test: test_ files, assert, pytest -q and exit codes`,hi:`Aapka pehla test: test_ files, assert, pytest -q aur exit codes`},body:{en:`
<p><b>The idea of this chapter:</b> a test is just a function with an <code>assert</code> in it. pytest finds those functions by their names, runs them, and tells you how many passed. You will write four tests for <code>valid_vlan</code> (Lab 1, task 1) and learn to read the result and the exit code.</p>

<h3>Analogy: a checklist with ticks</h3>
<p>Each line of a pre-flight checklist is one question with a yes or no. A test function is one such line. The test runner is the co-pilot who reads every line aloud and counts the ticks.</p>

<h3>The smallest useful test file</h3>
<p>Create <code>test_vlan.py</code> in the same folder as <code>netlib.py</code>. Use <code>nano test_vlan.py</code>, or paste with a here-document: <code>cat &gt; test_vlan.py &lt;&lt;'EOF'</code>, then the lines, then <code>EOF</code>.</p>
<pre class="code">from netlib import valid_vlan


def test_normal():
    assert valid_vlan(10) is True


def test_zero():
    assert valid_vlan(0) is False


def test_top():
    assert valid_vlan(4094) is True


def test_over():
    assert valid_vlan(4095) is False</pre>
<ul>
<li><code>from netlib import valid_vlan</code> loads the function under test. It works because <code>netlib.py</code> sits next to the test file.</li>
<li><code>def test_normal():</code> is a test. The name starts with <code>test_</code>; that is how pytest finds it.</li>
<li><code>assert</code> checks a condition. If it is true, nothing happens. If it is false, Python raises <code>AssertionError</code> and pytest marks the test failed.</li>
<li><code>is True</code> is stricter than a bare <code>assert valid_vlan(10)</code>: it insists on the real value <code>True</code>, not just something truthy.</li>
<li>Each test checks one idea and has a name that says which: normal, zero, the top edge, one over the edge.</li>
</ul>

<h3>Run it</h3>
<pre class="out">AUTO01$ pytest -q; echo "exit code: $?"
....                                                                     [100%]
<span class="hl">4 passed in 0.05s</span>
exit code: 0</pre>
<p>Each dot is one passed test. The last line is the summary. <code>-q</code> means quiet. <code>echo "exit code: $?"</code> prints the exit code of the previous command, which is what cron, a CI pipeline or a shell <code>&amp;&amp;</code> reads. Answer to task 1: <b>4 passed</b>.</p>

<h3>The plain run and the verbose run</h3>
<p>Without <code>-q</code> you get a header. The lab prints the layout of pytest 7.4, so the lines are the same ones you see on a real server (the Python version on the platform line can differ on your own machine).</p>
<pre class="out">AUTO01$ pytest
============================= test session starts ==============================
platform linux -- Python 3.12.0, pytest-7.4.4, pluggy-1.3.0
rootdir: /home/netadmin
<span class="hl">collected 4 items</span>

test_vlan.py ....                                                        [100%]

============================== 4 passed in 0.05s ===============================
AUTO01$ pytest -v
============================= test session starts ==============================
platform linux -- Python 3.12.0, pytest-7.4.4, pluggy-1.3.0 -- /usr/bin/python3
cachedir: .pytest_cache
rootdir: /home/netadmin
collected 4 items

test_vlan.py::test_normal PASSED                                         [ 25%]
test_vlan.py::test_zero PASSED                                           [ 50%]
test_vlan.py::test_top PASSED                                            [ 75%]
test_vlan.py::test_over PASSED                                           [100%]

============================== 4 passed in 0.05s ===============================</pre>
<p><code>rootdir</code> is where pytest anchors itself. <code>collected 4 items</code> says discovery found four tests. In verbose mode every test is listed by its full id, <code>file::function</code>. You can run one test by that id: <code>pytest -q test_vlan.py::test_top</code>.</p>

<h3>Exit codes you will meet</h3>
<table class="cmp"><tr><th>Code</th><th>Meaning</th><th>Example</th></tr>
<tr><td>0</td><td>All collected tests passed</td><td>the run above</td></tr>
<tr><td>1</td><td>At least one test failed</td><td>Chapter 3</td></tr>
<tr><td>2</td><td>Interrupted, for example an import error while collecting</td><td>a typo in an import line</td></tr>
<tr><td>4</td><td>pytest was used wrongly</td><td><code>pytest nofile.py</code></td></tr>
<tr><td>5</td><td>No tests were collected</td><td>an empty folder</td></tr>
</table>
<pre class="out">AUTO01$ pytest -q nofile.py; echo "exit code: $?"
ERROR: file or directory not found: nofile.py

============================ no tests ran in 0.00s =============================
exit code: 4</pre>
<p>Code 5 is the quiet one: a folder with no tests is "green" to the eye but not to the shell, so a pipeline stops. Treat it as a warning that discovery found nothing.</p>

<h3>How pytest finds tests</h3>
<ul>
<li>Files named <code>test_*.py</code> (or <code>*_test.py</code>) are searched when you run plain <code>pytest</code>.</li>
<li>Inside them, functions whose names start with <code>test_</code> are collected.</li>
<li>A function with any other name is ignored without a warning:</li>
</ul>
<pre class="out">AUTO01$ cat test_names.py
from netlib import valid_vlan


def vlan_ok():
    assert valid_vlan(10)


def test_collected():
    assert valid_vlan(10)
AUTO01$ pytest -q test_names.py
.                                                                        [100%]
<span class="hl">1 passed in 0.02s</span></pre>
<p>Two functions, one test. <code>vlan_ok</code> never ran, so a bug in it would never show. Always compare the passed count with the number of tests you wrote.</p>

<div class="warn"><p><b>Common mistakes.</b> A function called <code>check_vlan</code> instead of <code>test_vlan</code>. A test with no <code>assert</code>, which passes whatever the code does. Running <code>pytest</code> from another folder so the import of <code>netlib</code> fails or nothing is collected. Writing four tests that all check the same value.</p></div>
<div class="exam"><p><b>Exam trap.</b> "4 passed" with an exit code of 0 is success. "no tests ran" with exit code 5 is not. And a test that never asserts proves nothing.</p></div>

<div class="scn"><h4>The silent file</h4><p>An engineer saved the new tests as <code>vlan_tests.py</code>, with functions called <code>check_...</code>. The pipeline showed "no tests ran" and exit code 5, but the chat message said "pipeline finished". Two weeks later a boundary bug reached a switch. After renaming the file to <code>test_vlan.py</code> and the functions to <code>test_...</code>, the suite found the bug on the first run.</p><p><b>Lesson:</b> read the summary line and the exit code, not just the colour.</p></div>

<div class="iv"><p class="q">"How does pytest know which functions are tests?"</p><p>By naming convention. It searches files called test_*.py and collects functions starting with test_. Each uses plain assert, and a failed assert marks the test red. I check the "collected N items" line so a misnamed test does not go unnoticed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A test is a function named <code>test_...</code> in a file named <code>test_....py</code>.</li>
<li>A true <code>assert</code> is silent; a false one fails the test.</li>
<li><code>pytest -q</code> prints dots and a summary; <code>-v</code> lists every test id.</li>
<li>Exit codes: 0 passed, 1 failed, 2 interrupted, 4 usage error, 5 nothing collected.</li>
<li>Misnamed tests are ignored silently, so compare the count with what you wrote.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> test bas ek function hai jisme <code>assert</code> hota hai. pytest un functions ko unke naam se dhoondhta hai, chalata hai, aur batata hai kitne pass hue. Aap <code>valid_vlan</code> ke chaar tests likhoge (Lab 1, task 1) aur result tatha exit code padhna seekhoge.</p>

<h3>Analogy: tick wali checklist</h3>
<p>Pre-flight checklist ki har line ek sawaal hai jiska jawab haan ya na. Test function aisi hi ek line hai. Test runner co-pilot hai jo har line zor se padhta hai aur ticks ginta hai.</p>

<h3>Sabse chhoti kaam ki test file</h3>
<p><code>netlib.py</code> wale folder mein hi <code>test_vlan.py</code> banao. <code>nano test_vlan.py</code> use karo, ya here-document se paste karo: <code>cat &gt; test_vlan.py &lt;&lt;'EOF'</code>, phir lines, phir <code>EOF</code>.</p>
<pre class="code">from netlib import valid_vlan


def test_normal():
    assert valid_vlan(10) is True


def test_zero():
    assert valid_vlan(0) is False


def test_top():
    assert valid_vlan(4094) is True


def test_over():
    assert valid_vlan(4095) is False</pre>
<ul>
<li><code>from netlib import valid_vlan</code> test hone wala function load karta hai. Yeh isliye chalta hai kyunki <code>netlib.py</code> test file ke bagal mein hai.</li>
<li><code>def test_normal():</code> ek test hai. Naam <code>test_</code> se shuru hota hai; pytest ise isi se dhoondhta hai.</li>
<li><code>assert</code> condition check karta hai. True ho to kuch nahi hota. False ho to Python <code>AssertionError</code> uthata hai aur pytest test ko failed mark karta hai.</li>
<li><code>is True</code> sirf <code>assert valid_vlan(10)</code> se zyada sakht hai: yeh asli value <code>True</code> maangta hai, sirf truthy cheez nahi.</li>
<li>Har test ek idea check karta hai aur uska naam batata hai kaunsa: normal, zero, upar ka kinara, kinare se ek upar.</li>
</ul>

<h3>Chalao</h3>
<pre class="out">AUTO01$ pytest -q; echo "exit code: $?"
....                                                                     [100%]
<span class="hl">4 passed in 0.05s</span>
exit code: 0</pre>
<p>Har dot ek passed test hai. Aakhri line summary hai. <code>-q</code> ka matlab quiet. <code>echo "exit code: $?"</code> pichhle command ka exit code print karta hai, jo cron, CI pipeline ya shell ka <code>&amp;&amp;</code> padhta hai. Task 1 ka jawab: <b>4 passed</b>.</p>

<h3>Plain run aur verbose run</h3>
<p><code>-q</code> ke bina header milta hai. Lab pytest 7.4 ka layout print karta hai, isliye lines wahi hain jo asli server par dikhti hain (platform line mein Python version aapki apni machine par alag ho sakta hai).</p>
<pre class="out">AUTO01$ pytest
============================= test session starts ==============================
platform linux -- Python 3.12.0, pytest-7.4.4, pluggy-1.3.0
rootdir: /home/netadmin
<span class="hl">collected 4 items</span>

test_vlan.py ....                                                        [100%]

============================== 4 passed in 0.05s ===============================
AUTO01$ pytest -v
============================= test session starts ==============================
platform linux -- Python 3.12.0, pytest-7.4.4, pluggy-1.3.0 -- /usr/bin/python3
cachedir: .pytest_cache
rootdir: /home/netadmin
collected 4 items

test_vlan.py::test_normal PASSED                                         [ 25%]
test_vlan.py::test_zero PASSED                                           [ 50%]
test_vlan.py::test_top PASSED                                            [ 75%]
test_vlan.py::test_over PASSED                                           [100%]

============================== 4 passed in 0.05s ===============================</pre>
<p><code>rootdir</code> woh jagah hai jahan pytest khud ko anchor karta hai. <code>collected 4 items</code> batata hai ki discovery ko chaar tests mile. Verbose mode mein har test apne poore id, <code>file::function</code>, se listed hota hai. Ek test us id se chala sakte ho: <code>pytest -q test_vlan.py::test_top</code>.</p>

<h3>Exit codes jo aapko milenge</h3>
<table class="cmp"><tr><th>Code</th><th>Matlab</th><th>Example</th></tr>
<tr><td>0</td><td>Saare collected tests pass</td><td>upar ka run</td></tr>
<tr><td>1</td><td>Kam se kam ek test fail</td><td>Chapter 3</td></tr>
<tr><td>2</td><td>Interrupted, jaise collect karte waqt import error</td><td>import line mein typo</td></tr>
<tr><td>4</td><td>pytest galat tareeqe se use hua</td><td><code>pytest nofile.py</code></td></tr>
<tr><td>5</td><td>Koi test collect nahi hua</td><td>khali folder</td></tr>
</table>
<pre class="out">AUTO01$ pytest -q nofile.py; echo "exit code: $?"
ERROR: file or directory not found: nofile.py

============================ no tests ran in 0.00s =============================
exit code: 4</pre>
<p>Code 5 chupchaap wala hai: bina tests ka folder aankh ko "green" lagta hai par shell ko nahi, isliye pipeline ruk jaati hai. Ise warning samjho ki discovery ko kuch mila hi nahi.</p>

<h3>pytest tests kaise dhoondhta hai</h3>
<ul>
<li>Plain <code>pytest</code> chalane par <code>test_*.py</code> (ya <code>*_test.py</code>) naam ki files search hoti hain.</li>
<li>Unke andar jin functions ke naam <code>test_</code> se shuru hote hain woh collect hote hain.</li>
<li>Kisi aur naam ka function bina warning ke ignore ho jaata hai:</li>
</ul>
<pre class="out">AUTO01$ cat test_names.py
from netlib import valid_vlan


def vlan_ok():
    assert valid_vlan(10)


def test_collected():
    assert valid_vlan(10)
AUTO01$ pytest -q test_names.py
.                                                                        [100%]
<span class="hl">1 passed in 0.02s</span></pre>
<p>Do functions, ek test. <code>vlan_ok</code> kabhi chala hi nahi, isliye usme bug kabhi dikhega nahi. Hamesha passed count ko apne likhe tests ki ginti se milao.</p>

<div class="warn"><p><b>Common mistakes.</b> <code>test_vlan</code> ki jagah <code>check_vlan</code> naam. <code>assert</code> ke bina test, jo code kuch bhi kare pass ho jaata hai. Doosre folder se <code>pytest</code> chalana, jisse <code>netlib</code> ka import fail ho ya kuch collect na ho. Chaar tests likhna jo sab ek hi value check karte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exit code 0 ke saath "4 passed" success hai. Exit code 5 ke saath "no tests ran" success nahi. Aur jo test kabhi assert nahi karta woh kuch saabit nahi karta.</p></div>

<div class="scn"><h4>Khamosh file</h4><p>Ek engineer ne naye tests <code>vlan_tests.py</code> mein save kiye, functions ke naam <code>check_...</code> the. Pipeline ne "no tests ran" aur exit code 5 dikhaya, par chat message mein likha tha "pipeline finished". Do hafte baad ek boundary bug switch tak pahunch gaya. File ko <code>test_vlan.py</code> aur functions ko <code>test_...</code> rename karne ke baad suite ne pehle run mein bug pakad liya.</p><p><b>Lesson:</b> summary line aur exit code padho, sirf rang nahi.</p></div>

<div class="iv"><p class="q">"pytest ko kaise pata chalta hai ki kaunse functions tests hain?"</p><p>Naming convention se. Woh test_*.py files search karta hai aur test_ se shuru hone wale functions collect karta hai. Har ek plain assert use karta hai, aur false assert test ko red karta hai. Main "collected N items" line check karta hoon taaki galat naam wala test dhyan se na nikal jaye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Test <code>test_....py</code> file ke andar <code>test_...</code> naam ka function hai.</li>
<li>True <code>assert</code> khamosh hai; false assert test fail karta hai.</li>
<li><code>pytest -q</code> dots aur summary print karta hai; <code>-v</code> har test id list karta hai.</li>
<li>Exit codes: 0 passed, 1 failed, 2 interrupted, 4 usage error, 5 kuch collect nahi hua.</li>
<li>Galat naam ke tests chupchaap ignore hote hain, isliye ginti apne likhe tests se milao.</li>
</ul></div>
`}};export{e as default};