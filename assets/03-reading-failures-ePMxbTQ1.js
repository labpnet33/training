var e={id:`reading-failures`,h:{en:`Reading a failure: the E lines, -x, -v and --tb`,hi:`Failure padhna: E lines, -x, -v aur --tb`},body:{en:`
<p><b>The idea of this chapter:</b> a red test is not bad news, it is a free diagnosis. pytest rewrites your <code>assert</code> so that it shows the values on both sides. You will learn to read that report in thirty seconds and to shrink or widen it with a few options. This is the skill that Lab 2 depends on.</p>

<h3>Analogy: the delivery slip</h3>
<p>When a parcel arrives wrong, the courier's slip says what was ordered and what was delivered. You do not argue; you compare two lines. A pytest failure is the same slip: <i>expected</i> on one side, <i>got</i> on the other, and the exact line where they met.</p>

<h3>A practice file with three planted mistakes</h3>
<p>Save this as <code>test_fail.py</code> next to <code>netlib.py</code>. It is not part of the lab tasks, but you can run it on AUTO01. Every mistake is in the test, not in the code.</p>
<pre class="code">from netlib import parse_brief, valid_vlan, vlan_range


def test_vlan_top():
    assert valid_vlan(4095)


def test_first_row():
    text = open("samples/brief.txt").read()
    rows = parse_brief(text)
    assert rows[0] == {"name": "GigabitEthernet0/0", "ip": "10.99.0.1", "status": "up", "proto": "down"}


def test_range():
    assert vlan_range("10-12") == [10, 11, 13]


def test_ok():
    assert valid_vlan(10)</pre>
<pre class="out">AUTO01$ pytest -q test_fail.py; echo "exit code: $?"
FFF.                                                                     [100%]

=================================== FAILURES ===================================
________________________________ test_vlan_top _________________________________

    def test_vlan_top():
&gt;       assert valid_vlan(4095)
E       assert False
E        +  where False = valid_vlan(4095)

test_fail.py:5: AssertionError
________________________________ test_first_row ________________________________

    def test_first_row():
        text = open("samples/brief.txt").read()
        rows = parse_brief(text)
&gt;       assert rows[0] == {"name": "GigabitEthernet0/0", "ip": "10.99.0.1", "status": "up", "proto": "down"}
E       assert {'name': 'GigabitEthernet0/0', 'ip': '10.99.0.1', 'status': 'up', 'proto': 'up'} == {'name': 'GigabitEthernet0/0', 'ip': '10.99.0.1', 'status': 'up', 'proto': 'down'}
E         Omitting 3 identical items, use -vv to show
E         Differing items:
E         {'proto': 'up'} != {'proto': 'down'}
E         Use -v to get more diff

test_fail.py:11: AssertionError
__________________________________ test_range __________________________________

    def test_range():
&gt;       assert vlan_range("10-12") == [10, 11, 13]
E       assert [10, 11, 12] == [10, 11, 13]
E         At index 2 diff: 12 != 13
E         Use -v to get more diff
E        +  where [10, 11, 12] = vlan_range('10-12')

test_fail.py:15: AssertionError
=========================== short test summary info ============================
FAILED test_fail.py::test_vlan_top - assert False
FAILED test_fail.py::test_first_row - assert {'name': 'GigabitEthernet0/0', '...
FAILED test_fail.py::test_range - assert [10, 11, 12] == [10, 11, 13]
<span class="hl">3 failed, 1 passed in 0.05s</span>
exit code: 1</pre>

<h3>How to read it, line by line</h3>
<ul>
<li>The progress line <code>FFF.</code> says tests one to three failed and the fourth passed.</li>
<li>Each block starts with a title bar and the test source. The line with <code>&gt;</code> in the margin is the statement that failed.</li>
<li>Lines starting with <code>E</code> are the explanation. This is <b>assertion introspection</b>: pytest evaluated each part of the expression and prints the values.</li>
<li><code>+  where False = valid_vlan(4095)</code> shows which call produced the value. The code returned <code>False</code>, and the test asked for a true result, so here the test is wrong (4095 is not a valid VLAN).</li>
<li>For dictionaries pytest lists only the <b>Differing items</b>: <code>{'proto': 'up'} != {'proto': 'down'}</code>. The left side is what the code returned, the right side is what the test expected.</li>
<li>For lists it names the first position that differs: <code>At index 2 diff: 12 != 13</code>.</li>
<li><code>test_fail.py:15: AssertionError</code> gives the file and line.</li>
<li>The <b>short test summary info</b> repeats one line per failure, which is the list to copy into a ticket.</li>
</ul>
<p>A habit that makes this report easy: write <code>assert actual == expected</code>, with the value from the code on the left. Then in every <code>E</code> line, the left is "what the code did".</p>

<h3>Options that change the report</h3>
<p><b>-x</b> stops after the first failure, useful when one early break causes many later ones:</p>
<pre class="out">AUTO01$ pytest -q -x test_fail.py
F                                                                        [ 25%]

=================================== FAILURES ===================================
________________________________ test_vlan_top _________________________________

    def test_vlan_top():
&gt;       assert valid_vlan(4095)
E       assert False
E        +  where False = valid_vlan(4095)

test_fail.py:5: AssertionError
=========================== short test summary info ============================
FAILED test_fail.py::test_vlan_top - assert False
!!!!!!!!!!!!!!!!!!!!!!!!!!! stopping after 1 failure !!!!!!!!!!!!!!!!!!!!!!!!!!!
1 failed in 0.02s</pre>
<p><b>--tb=short</b> prints one compact block per failure, <b>--tb=line</b> prints one line per failure, and <b>--tb=no</b> prints only the summary:</p>
<pre class="out">AUTO01$ pytest -q --tb=line test_fail.py
FFF.                                                                     [100%]

=================================== FAILURES ===================================
________________________________ test_vlan_top _________________________________
/home/netadmin/test_fail.py:5: assert False
________________________________ test_first_row ________________________________
/home/netadmin/test_fail.py:11: assert {'name': 'GigabitEthernet0/0', 'ip': '10.99.0.1', 'status': 'up', 'proto': 'up'} == {'name': 'GigabitEthernet0/0', 'ip': '10.99.0.1', 'status': 'up', 'proto': 'down'}
__________________________________ test_range __________________________________
/home/netadmin/test_fail.py:15: assert [10, 11, 12] == [10, 11, 13]
=========================== short test summary info ============================
FAILED test_fail.py::test_vlan_top - assert False
FAILED test_fail.py::test_first_row - assert {'name': 'GigabitEthernet0/0', '...
FAILED test_fail.py::test_range - assert [10, 11, 12] == [10, 11, 13]
3 failed, 1 passed in 0.05s</pre>
<p><b>-v</b> lists every test with PASSED or FAILED, so you see the one that passed as well:</p>
<pre class="out">AUTO01$ pytest -v --tb=no test_fail.py
============================= test session starts ==============================
platform linux -- Python 3.12.0, pytest-7.4.4, pluggy-1.3.0 -- /usr/bin/python3
cachedir: .pytest_cache
rootdir: /home/netadmin
collected 4 items

test_fail.py::test_vlan_top FAILED                                       [ 25%]
test_fail.py::test_first_row FAILED                                      [ 50%]
test_fail.py::test_range FAILED                                          [ 75%]
test_fail.py::test_ok PASSED                                             [100%]
=========================== short test summary info ============================
FAILED test_fail.py::test_vlan_top - assert False
FAILED test_fail.py::test_first_row - assert {'name': 'GigabitEthernet0/0', '...
FAILED test_fail.py::test_range - assert [10, 11, 12] == [10, 11, 13]
========================= 3 failed, 1 passed in 0.05s ==========================</pre>

<h3>Printed text appears only when a test fails</h3>
<p>pytest captures what a test prints. If the test passes, the text is thrown away. If it fails, the text is shown under the failure:</p>
<pre class="out">AUTO01$ pytest -q test_print.py
F                                                                        [100%]

=================================== FAILURES ===================================
__________________________________ test_noisy __________________________________

    def test_noisy():
        print("debug: parsed 3 rows")
&gt;       assert 1 + 1 == 3
E       assert (1 + 1) == 3

test_print.py:3: AssertionError
----------------------------- Captured stdout call -----------------------------
debug: parsed 3 rows
=========================== short test summary info ============================
FAILED test_print.py::test_noisy - assert (1 + 1) == 3
1 failed in 0.02s</pre>

<div class="warn"><p><b>Common mistakes.</b> Reading the top of the report instead of the <code>E</code> lines. Fixing the code before asking which side is wrong. Adding many <code>print</code> calls: they only show up on failure anyway, and a better assert makes them unnecessary. Ignoring the summary count and only looking for the first red line.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>-q</code> makes output shorter, <code>-v</code> longer. <code>-x</code> stops at the first failure, while <code>--tb=...</code> only changes how much of the traceback is printed; the tests still all run.</p></div>

<div class="scn"><h4>Twelve red tests, one cause</h4><p>A parser change made twelve tests red on Monday morning. The new engineer opened them one by one. A senior ran <code>pytest -q -x --tb=short</code>, saw that the first failure was a missing column key, fixed one line, and eleven of the twelve turned green.</p><p><b>Lesson:</b> use <code>-x</code> to find the first domino, and read the E lines before touching code.</p></div>

<div class="iv"><p class="q">"A pytest run is red. What do you do first?"</p><p>I read the short summary, then the E lines of the first failure: which values are on each side and which call produced them. I rerun just that test by its id with <code>-x</code>, and only then decide whether the code or the test expectation is wrong.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The <code>&gt;</code> line is the failing statement; the <code>E</code> lines are pytest's explanation with real values.</li>
<li>Write <code>assert actual == expected</code> so left always means "what the code returned".</li>
<li>Dict and list failures name the differing key or index; the <code>where</code> line names the call.</li>
<li><code>-x</code> stops early, <code>-v</code> lists tests, <code>--tb=short</code>, <code>line</code> or <code>no</code> trims the report.</li>
<li>Printed text is shown only for failing tests, under "Captured stdout call".</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> red test buri khabar nahi, free diagnosis hai. pytest aapke <code>assert</code> ko rewrite karta hai taaki dono taraf ki values dikhe. Aap yeh report tees second mein padhna seekhoge aur kuch options se use chhota ya bada karna. Lab 2 isi skill par tika hai.</p>

<h3>Analogy: delivery slip</h3>
<p>Parcel galat aaye to courier ki slip batati hai kya order hua aur kya pahuncha. Aap behas nahi karte; do lines compare karte ho. pytest failure wahi slip hai: ek taraf <i>expected</i>, doosri taraf <i>got</i>, aur woh exact line jahan woh mile.</p>

<h3>Teen planted galtiyon wali practice file</h3>
<p>Ise <code>netlib.py</code> ke bagal mein <code>test_fail.py</code> naam se save karo. Yeh lab tasks ka hissa nahi, par AUTO01 par chala sakte ho. Har galti test mein hai, code mein nahi.</p>
<pre class="code">from netlib import parse_brief, valid_vlan, vlan_range


def test_vlan_top():
    assert valid_vlan(4095)


def test_first_row():
    text = open("samples/brief.txt").read()
    rows = parse_brief(text)
    assert rows[0] == {"name": "GigabitEthernet0/0", "ip": "10.99.0.1", "status": "up", "proto": "down"}


def test_range():
    assert vlan_range("10-12") == [10, 11, 13]


def test_ok():
    assert valid_vlan(10)</pre>
<pre class="out">AUTO01$ pytest -q test_fail.py; echo "exit code: $?"
FFF.                                                                     [100%]

=================================== FAILURES ===================================
________________________________ test_vlan_top _________________________________

    def test_vlan_top():
&gt;       assert valid_vlan(4095)
E       assert False
E        +  where False = valid_vlan(4095)

test_fail.py:5: AssertionError
________________________________ test_first_row ________________________________

    def test_first_row():
        text = open("samples/brief.txt").read()
        rows = parse_brief(text)
&gt;       assert rows[0] == {"name": "GigabitEthernet0/0", "ip": "10.99.0.1", "status": "up", "proto": "down"}
E       assert {'name': 'GigabitEthernet0/0', 'ip': '10.99.0.1', 'status': 'up', 'proto': 'up'} == {'name': 'GigabitEthernet0/0', 'ip': '10.99.0.1', 'status': 'up', 'proto': 'down'}
E         Omitting 3 identical items, use -vv to show
E         Differing items:
E         {'proto': 'up'} != {'proto': 'down'}
E         Use -v to get more diff

test_fail.py:11: AssertionError
__________________________________ test_range __________________________________

    def test_range():
&gt;       assert vlan_range("10-12") == [10, 11, 13]
E       assert [10, 11, 12] == [10, 11, 13]
E         At index 2 diff: 12 != 13
E         Use -v to get more diff
E        +  where [10, 11, 12] = vlan_range('10-12')

test_fail.py:15: AssertionError
=========================== short test summary info ============================
FAILED test_fail.py::test_vlan_top - assert False
FAILED test_fail.py::test_first_row - assert {'name': 'GigabitEthernet0/0', '...
FAILED test_fail.py::test_range - assert [10, 11, 12] == [10, 11, 13]
<span class="hl">3 failed, 1 passed in 0.05s</span>
exit code: 1</pre>

<h3>Ise line by line kaise padhein</h3>
<ul>
<li>Progress line <code>FFF.</code> batati hai ki test ek se teen fail hue aur chautha pass.</li>
<li>Har block title bar aur test source se shuru hota hai. Margin mein <code>&gt;</code> wali line woh statement hai jo fail hua.</li>
<li><code>E</code> se shuru hone wali lines explanation hain. Yeh <b>assertion introspection</b> hai: pytest ne expression ka har hissa evaluate kiya aur values print ki.</li>
<li><code>+  where False = valid_vlan(4095)</code> batata hai kaunsi call ne value di. Code ne <code>False</code> return kiya, aur test ne true maanga, isliye yahan test galat hai (4095 valid VLAN nahi hai).</li>
<li>Dictionaries ke liye pytest sirf <b>Differing items</b> list karta hai: <code>{'proto': 'up'} != {'proto': 'down'}</code>. Left side woh hai jo code ne return kiya, right side woh jo test ne expected maana.</li>
<li>Lists ke liye woh pehli position batata hai jo alag hai: <code>At index 2 diff: 12 != 13</code>.</li>
<li><code>test_fail.py:15: AssertionError</code> file aur line deta hai.</li>
<li><b>short test summary info</b> har failure ki ek line dohrata hai, jo ticket mein copy karne ki list hai.</li>
</ul>
<p>Ek aadat jo is report ko aasan banati hai: <code>assert actual == expected</code> likho, code ki value left par. Phir har <code>E</code> line mein left ka matlab hai "code ne kya kiya".</p>

<h3>Options jo report badalte hain</h3>
<p><b>-x</b> pehli failure ke baad ruk jaata hai, tab kaam ka jab ek shuruaati toot-phoot se baad ki kai failures aati hain:</p>
<pre class="out">AUTO01$ pytest -q -x test_fail.py
F                                                                        [ 25%]

=================================== FAILURES ===================================
________________________________ test_vlan_top _________________________________

    def test_vlan_top():
&gt;       assert valid_vlan(4095)
E       assert False
E        +  where False = valid_vlan(4095)

test_fail.py:5: AssertionError
=========================== short test summary info ============================
FAILED test_fail.py::test_vlan_top - assert False
!!!!!!!!!!!!!!!!!!!!!!!!!!! stopping after 1 failure !!!!!!!!!!!!!!!!!!!!!!!!!!!
1 failed in 0.02s</pre>
<p><b>--tb=short</b> har failure ka ek compact block print karta hai, <b>--tb=line</b> har failure ki ek line, aur <b>--tb=no</b> sirf summary:</p>
<pre class="out">AUTO01$ pytest -q --tb=line test_fail.py
FFF.                                                                     [100%]

=================================== FAILURES ===================================
________________________________ test_vlan_top _________________________________
/home/netadmin/test_fail.py:5: assert False
________________________________ test_first_row ________________________________
/home/netadmin/test_fail.py:11: assert {'name': 'GigabitEthernet0/0', 'ip': '10.99.0.1', 'status': 'up', 'proto': 'up'} == {'name': 'GigabitEthernet0/0', 'ip': '10.99.0.1', 'status': 'up', 'proto': 'down'}
__________________________________ test_range __________________________________
/home/netadmin/test_fail.py:15: assert [10, 11, 12] == [10, 11, 13]
=========================== short test summary info ============================
FAILED test_fail.py::test_vlan_top - assert False
FAILED test_fail.py::test_first_row - assert {'name': 'GigabitEthernet0/0', '...
FAILED test_fail.py::test_range - assert [10, 11, 12] == [10, 11, 13]
3 failed, 1 passed in 0.05s</pre>
<p><b>-v</b> har test ko PASSED ya FAILED ke saath list karta hai, to jo pass hua woh bhi dikhta hai:</p>
<pre class="out">AUTO01$ pytest -v --tb=no test_fail.py
============================= test session starts ==============================
platform linux -- Python 3.12.0, pytest-7.4.4, pluggy-1.3.0 -- /usr/bin/python3
cachedir: .pytest_cache
rootdir: /home/netadmin
collected 4 items

test_fail.py::test_vlan_top FAILED                                       [ 25%]
test_fail.py::test_first_row FAILED                                      [ 50%]
test_fail.py::test_range FAILED                                          [ 75%]
test_fail.py::test_ok PASSED                                             [100%]
=========================== short test summary info ============================
FAILED test_fail.py::test_vlan_top - assert False
FAILED test_fail.py::test_first_row - assert {'name': 'GigabitEthernet0/0', '...
FAILED test_fail.py::test_range - assert [10, 11, 12] == [10, 11, 13]
========================= 3 failed, 1 passed in 0.05s ==========================</pre>

<h3>Printed text sirf tab dikhta hai jab test fail ho</h3>
<p>pytest test ka print kiya hua text capture kar leta hai. Test pass ho to text fenk diya jaata hai. Fail ho to text failure ke neeche dikhta hai:</p>
<pre class="out">AUTO01$ pytest -q test_print.py
F                                                                        [100%]

=================================== FAILURES ===================================
__________________________________ test_noisy __________________________________

    def test_noisy():
        print("debug: parsed 3 rows")
&gt;       assert 1 + 1 == 3
E       assert (1 + 1) == 3

test_print.py:3: AssertionError
----------------------------- Captured stdout call -----------------------------
debug: parsed 3 rows
=========================== short test summary info ============================
FAILED test_print.py::test_noisy - assert (1 + 1) == 3
1 failed in 0.02s</pre>

<div class="warn"><p><b>Common mistakes.</b> <code>E</code> lines ki jagah report ka upar ka hissa padhna. Yeh poochne se pehle code fix karna ki kaunsi side galat hai. Bahut saare <code>print</code> jodna: woh waise bhi sirf failure par dikhte hain, aur behtar assert unhe zaroori hi nahi rehne deta. Summary count ignore karke sirf pehli red line dhoondhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>-q</code> output chhota karta hai, <code>-v</code> lamba. <code>-x</code> pehli failure par rukta hai, jabki <code>--tb=...</code> sirf yeh badalta hai ki traceback kitna print ho; tests phir bhi sab chalte hain.</p></div>

<div class="scn"><h4>Barah red tests, ek wajah</h4><p>Parser change se Monday subah barah tests red ho gaye. Naye engineer ne unhe ek-ek karke kholna shuru kiya. Senior ne <code>pytest -q -x --tb=short</code> chalaya, dekha ki pehli failure ek missing column key thi, ek line theek ki, aur barah mein se gyarah green ho gaye.</p><p><b>Lesson:</b> pehla domino dhoondhne ke liye <code>-x</code> use karo, aur code chhone se pehle E lines padho.</p></div>

<div class="iv"><p class="q">"pytest run red hai. Sabse pehle kya karte ho?"</p><p>Main short summary padhta hoon, phir pehli failure ki E lines: dono taraf kaunsi values hain aur unhe kaunsi call ne diya. Sirf wahi test uske id se <code>-x</code> ke saath dobara chalata hoon, aur tabhi tay karta hoon ki code galat hai ya test ki expectation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>&gt;</code> wali line failing statement hai; <code>E</code> lines pytest ki explanation hain asli values ke saath.</li>
<li><code>assert actual == expected</code> likho taaki left hamesha "code ne kya return kiya" ho.</li>
<li>Dict aur list failures differing key ya index batati hain; <code>where</code> line call batati hai.</li>
<li><code>-x</code> jaldi rokta hai, <code>-v</code> tests list karta hai, <code>--tb=short</code>, <code>line</code> ya <code>no</code> report chhoti karta hai.</li>
<li>Printed text sirf failing tests ke liye, "Captured stdout call" ke neeche dikhta hai.</li>
</ul></div>
`}};export{e as default};