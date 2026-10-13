var e={id:`unittest`,h:{en:`Writing Python unit tests with unittest`,hi:`unittest se Python unit tests likhna`},body:{en:`
<p>Blueprint item 4.5 says: <b>construct a Python unit test to validate data and API responses using the <code>unittest</code> class</b>. <code>unittest</code> is Python's built-in test framework, so there is nothing to install. This chapter shows every piece the exam can ask about: <code>TestCase</code>, the assert methods, <code>assertRaises</code>, <code>setUp</code>, how to run the tests and how to read the result.</p>
<div class="note"><p><b>Lab note.</b> The lab Python on host AUTO does not include the <code>unittest</code> module, and it cannot import one of your files from another. So the labs use plain <code>assert</code> test functions with a tiny runner that prints PASS, FAIL and a summary line. The ideas are identical: arrange, act, assert, read the verdict. The code in this chapter runs on a normal Python 3 laptop.</p></div>

<h3>Analogy: a quality-control line</h3>
<p>A factory has an inspection station. Every product goes through a fixed set of checks; each check has a name and either passes or is rejected with a reason. <code>unittest</code> is that station for code: you define the checks once, and run them at any time.</p>

<h3>Your first TestCase</h3>
<pre class="code">import unittest

def is_valid_vlan(vid):
    return isinstance(vid, int) and 1 &lt;= vid &lt;= 4094

def make_vlan_config(vid, name):
    if not is_valid_vlan(vid):
        raise ValueError(f"bad VLAN id {vid}")
    return [f"vlan {vid}", f" name {name}"]

class TestVlan(unittest.TestCase):              <span class="c"># 1. a class that inherits from TestCase</span>
    def setUp(self):                            <span class="c"># 2. runs BEFORE every test method</span>
        self.good_ids = [1, 10, 4094]

    def test_valid_ids(self):                   <span class="c"># 3. names must start with test</span>
        for vid in self.good_ids:
            self.assertTrue(is_valid_vlan(vid))

    def test_zero_is_invalid(self):
        self.assertFalse(is_valid_vlan(0))

    def test_config_lines(self):
        self.assertEqual(make_vlan_config(10, "USERS"), ["vlan 10", " name USERS"])

    def test_bad_id_raises(self):               <span class="c"># 4. check that an error happens</span>
        with self.assertRaises(ValueError):
            make_vlan_config(5000, "X")

if __name__ == "__main__":
    unittest.main()                             <span class="c"># 5. find and run the tests</span></pre>
<ol>
<li><b><code>unittest.TestCase</code></b> is the base class. Your test class inherits from it (chapter 4: inheritance) and gets all the assert methods.</li>
<li><b><code>setUp()</code></b> runs before <i>each</i> test method, so every test starts from a fresh, known state. <code>tearDown()</code> runs after each test for cleanup (close a file, remove a temp config). <code>setUpClass()</code> and <code>tearDownClass()</code> run once per class and are class methods.</li>
<li>Only methods whose names start with <code>test</code> are run as tests. Other methods are helpers.</li>
<li><b><code>assertRaises(ValueError)</code></b> used with <code>with</code> passes only if the code inside the block raises that exception. If nothing is raised, or a different exception is raised, the test fails.</li>
<li><code>unittest.main()</code> discovers the test methods in the file and runs them.</li>
</ol>

<h3>The assert methods you must know</h3>
<table class="cmp"><tr><th>Method</th><th>Passes when</th><th>Example</th></tr>
<tr><td><code>assertEqual(a, b)</code></td><td>a == b</td><td><code>assertEqual(len(cfg), 2)</code></td></tr>
<tr><td><code>assertNotEqual(a, b)</code></td><td>a != b</td><td><code>assertNotEqual(old, new)</code></td></tr>
<tr><td><code>assertTrue(x)</code></td><td>bool(x) is True</td><td><code>assertTrue(is_valid_vlan(10))</code></td></tr>
<tr><td><code>assertFalse(x)</code></td><td>bool(x) is False</td><td><code>assertFalse(is_valid_vlan(0))</code></td></tr>
<tr><td><code>assertIn(a, b)</code></td><td>a is in b</td><td><code>assertIn("vlan 10", cfg)</code></td></tr>
<tr><td><code>assertIsNone(x)</code></td><td>x is None</td><td><code>assertIsNone(result.get("error"))</code></td></tr>
<tr><td><code>assertRaises(Err)</code></td><td>the block raises Err</td><td><code>with self.assertRaises(ValueError): ...</code></td></tr>
</table>
<p>Prefer the most specific method. <code>assertEqual(a, b)</code> prints both values when it fails, while <code>assertTrue(a == b)</code> only says "False is not true".</p>

<h3>Running the tests</h3>
<pre class="code">python3 test_vlan_tools.py              <span class="c"># runs unittest.main() at the bottom</span>
python3 -m unittest test_vlan_tools     <span class="c"># run a module by name</span>
python3 -m unittest -v                  <span class="c"># -v = verbose: one line per test</span>
python3 -m unittest discover            <span class="c"># find files named test*.py and run them all</span></pre>
<h3>Reading the result</h3>
<p>A passing run prints one dot per test, a line with the count and OK:</p>
<pre class="out">....
----------------------------------------------------------------------
<span class="hl">Ran 4 tests in 0.001s</span>

<span class="hl">OK</span></pre>
<p>Now suppose a developer wrote <code>1 &lt;= vid &lt; 4094</code> in the function. The run shows an <b>F</b> for a failed test and a traceback that says which assert was false:</p>
<pre class="out">..F.
======================================================================
<span class="hl">FAIL: test_valid_ids (__main__.TestVlan.test_valid_ids)</span>
----------------------------------------------------------------------
Traceback (most recent call last):
  File "test_vlan_tools.py", line 17, in test_valid_ids
    self.assertTrue(is_valid_vlan(vid))
<span class="hl">AssertionError: False is not true</span>

----------------------------------------------------------------------
Ran 4 tests in 0.001s

<span class="hl">FAILED (failures=1)</span></pre>
<p>Each progress character means something: <code>.</code> passed, <code>F</code> <b>failure</b> (an assert was false, the code gave a wrong answer), <code>E</code> <b>error</b> (the test itself crashed with an unexpected exception, for example a <code>TypeError</code> from a missing argument), <code>s</code> skipped. Read the last line first (<code>OK</code> or <code>FAILED (failures=1, errors=1)</code>), then find the test name after FAIL: or ERROR:, then the line with the assert and the message under it. For <code>assertEqual</code> on lists, unittest also shows the first differing element, which makes a missing space easy to spot.</p>

<h3>Testing data and API responses</h3>
<p>The blueprint says "validate data and API responses". The trick is that a unit test should not call a live API. Parse a <i>saved sample response</i> instead, or fake the call. You test your own code on the data:</p>
<pre class="code">import json, unittest

def vlan_names(response_text):
    """Return {vlan_id: name} from a controller JSON reply."""
    data = json.loads(response_text)
    return {item["id"]: item["name"] for item in data["vlans"]}

class TestApiParser(unittest.TestCase):
    SAMPLE = '{"vlans": [{"id": 10, "name": "USERS"}, {"id": 20, "name": "VOICE"}]}'

    def test_names(self):
        self.assertEqual(vlan_names(self.SAMPLE), {10: "USERS", 20: "VOICE"})

    def test_missing_key_raises(self):
        with self.assertRaises(KeyError):
            vlan_names('{"other": []}')</pre>
<p>No network is needed, so the test is fast and repeatable. A <b>mock</b> (from <code>unittest.mock</code>) can stand in for a function that would call the real device, and lets you check how it was called.</p>

<div class="warn"><p><b>Common mistakes.</b> A test method name that does not start with <code>test</code>, so it silently never runs. Tests that depend on each other's order or on a real device being up. Forgetting <code>self.</code> before <code>assertEqual</code>. Putting <code>assertRaises</code> around too much code, so a different bug raises the exception and the test passes for the wrong reason. Naming your own file <code>unittest.py</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know that <code>setUp</code> runs before <b>each</b> test, not once. <code>assertEqual(expected, actual)</code> compares two values; <code>assertTrue</code> checks truthiness. A <b>failure</b> (F) means an assertion was false; an <b>error</b> (E) means an unexpected exception. The class you inherit from is <code>unittest.TestCase</code>, not <code>unittest.Test</code>.</p></div>

<div class="scn"><h4>The test that never ran</h4><p>A team celebrated "100% green" on a parser until a customer found a bug. A reviewer opened the test file: one method was named <code>check_empty_response</code> instead of <code>test_empty_response</code>, so unittest never collected it. After renaming it, the test went red at once and exposed a crash on empty replies. The pipeline now fails if the number of tests run drops.</p><p><b>Lesson:</b> read the "Ran N tests" line, not just the colour.</p></div>
<div class="iv"><p class="q">"How do you write and run a unit test in Python?"</p><p>Import unittest, create a class that inherits from <code>unittest.TestCase</code>, add methods starting with <code>test</code> that call asserts such as <code>assertEqual</code>, <code>assertTrue</code> and <code>assertRaises</code>, use <code>setUp</code> for fresh state, and run with <code>python3 -m unittest</code> or <code>unittest.main()</code>. Explain that dots mean pass, F a failed assert, E an unexpected error, and that unit tests should work on sample data, not live devices.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>unittest is built in; tests are methods starting with <code>test</code> in a class that inherits <code>unittest.TestCase</code>.</li>
<li>Know assertEqual, assertTrue, assertFalse, assertIn, assertIsNone and assertRaises.</li>
<li>setUp runs before every test; tearDown runs after.</li>
<li>Output: dot = pass, F = failure, E = error; the last line says OK or FAILED (failures=..., errors=...).</li>
<li>Test API handling code with saved sample responses or mocks, not live calls.</li>
</ul></div>
`,hi:`
<p>Blueprint item 4.5 kehta hai: <b><code>unittest</code> class use karke data aur API responses validate karne ke liye Python unit test construct karo</b>. <code>unittest</code> Python ka built-in test framework hai, isliye kuch install nahi karna. Yeh chapter har woh piece dikhata hai jo exam pooch sakta hai: <code>TestCase</code>, assert methods, <code>assertRaises</code>, <code>setUp</code>, tests kaise chalate hain aur result kaise padhte hain.</p>
<div class="note"><p><b>Lab note.</b> AUTO host ke lab Python mein <code>unittest</code> module nahi hai, aur woh aapki ek file ko doosri se import nahi kar sakta. Isliye labs mein simple <code>assert</code> test functions hain aur ek chhota runner jo PASS, FAIL aur summary line print karta hai. Ideas wahi hain: arrange, act, assert, verdict padhna. Is chapter ka code normal Python 3 laptop par chalta hai.</p></div>

<h3>Analogy: quality-control line</h3>
<p>Factory mein ek inspection station hota hai. Har product checks ke ek fixed set se guzarta hai; har check ka naam hota hai aur woh pass hota hai ya wajah ke saath reject. <code>unittest</code> code ke liye woh station hai: checks ek baar define karo, aur kabhi bhi chalao.</p>

<h3>Aapka pehla TestCase</h3>
<pre class="code">import unittest

def is_valid_vlan(vid):
    return isinstance(vid, int) and 1 &lt;= vid &lt;= 4094

def make_vlan_config(vid, name):
    if not is_valid_vlan(vid):
        raise ValueError(f"bad VLAN id {vid}")
    return [f"vlan {vid}", f" name {name}"]

class TestVlan(unittest.TestCase):              <span class="c"># 1. TestCase se inherit karne wali class</span>
    def setUp(self):                            <span class="c"># 2. HAR test method se PEHLE chalta hai</span>
        self.good_ids = [1, 10, 4094]

    def test_valid_ids(self):                   <span class="c"># 3. naam test se shuru hona chahiye</span>
        for vid in self.good_ids:
            self.assertTrue(is_valid_vlan(vid))

    def test_zero_is_invalid(self):
        self.assertFalse(is_valid_vlan(0))

    def test_config_lines(self):
        self.assertEqual(make_vlan_config(10, "USERS"), ["vlan 10", " name USERS"])

    def test_bad_id_raises(self):               <span class="c"># 4. check karo ki error aata hai</span>
        with self.assertRaises(ValueError):
            make_vlan_config(5000, "X")

if __name__ == "__main__":
    unittest.main()                             <span class="c"># 5. tests dhoondho aur chalao</span></pre>
<ol>
<li><b><code>unittest.TestCase</code></b> base class hai. Aapki test class usse inherit karti hai (chapter 4: inheritance) aur saare assert methods pa leti hai.</li>
<li><b><code>setUp()</code></b> <i>har</i> test method se pehle chalta hai, isliye har test ek taaza, jaani hui state se shuru hota hai. <code>tearDown()</code> har test ke baad cleanup ke liye chalta hai (file band karo, temp config hatao). <code>setUpClass()</code> aur <code>tearDownClass()</code> class mein ek baar chalte hain aur class methods hain.</li>
<li>Sirf woh methods tests ki tarah chalte hain jinka naam <code>test</code> se shuru ho. Baaki methods helpers hain.</li>
<li><b><code>assertRaises(ValueError)</code></b> <code>with</code> ke saath tabhi pass hota hai jab block ke andar ka code woh exception raise kare. Kuch raise na ho, ya alag exception ho, to test fail.</li>
<li><code>unittest.main()</code> file ke test methods dhoondhta hai aur chalata hai.</li>
</ol>

<h3>Jo assert methods aapko aane chahiye</h3>
<table class="cmp"><tr><th>Method</th><th>Kab pass hota hai</th><th>Example</th></tr>
<tr><td><code>assertEqual(a, b)</code></td><td>a == b</td><td><code>assertEqual(len(cfg), 2)</code></td></tr>
<tr><td><code>assertNotEqual(a, b)</code></td><td>a != b</td><td><code>assertNotEqual(old, new)</code></td></tr>
<tr><td><code>assertTrue(x)</code></td><td>bool(x) True ho</td><td><code>assertTrue(is_valid_vlan(10))</code></td></tr>
<tr><td><code>assertFalse(x)</code></td><td>bool(x) False ho</td><td><code>assertFalse(is_valid_vlan(0))</code></td></tr>
<tr><td><code>assertIn(a, b)</code></td><td>a, b ke andar ho</td><td><code>assertIn("vlan 10", cfg)</code></td></tr>
<tr><td><code>assertIsNone(x)</code></td><td>x None ho</td><td><code>assertIsNone(result.get("error"))</code></td></tr>
<tr><td><code>assertRaises(Err)</code></td><td>block Err raise kare</td><td><code>with self.assertRaises(ValueError): ...</code></td></tr>
</table>
<p>Sabse specific method pasand karo. <code>assertEqual(a, b)</code> fail hone par dono values print karta hai, jabki <code>assertTrue(a == b)</code> sirf "False is not true" kehta hai.</p>

<h3>Tests chalana</h3>
<pre class="code">python3 test_vlan_tools.py              <span class="c"># neeche ka unittest.main() chalata hai</span>
python3 -m unittest test_vlan_tools     <span class="c"># module ko naam se chalao</span>
python3 -m unittest -v                  <span class="c"># -v = verbose: har test ki ek line</span>
python3 -m unittest discover            <span class="c"># test*.py naam ki files dhoondho aur sab chalao</span></pre>
<h3>Result padhna</h3>
<p>Pass hone wala run har test ke liye ek dot, ginti wali line aur OK print karta hai:</p>
<pre class="out">....
----------------------------------------------------------------------
<span class="hl">Ran 4 tests in 0.001s</span>

<span class="hl">OK</span></pre>
<p>Ab maan lo developer ne function mein <code>1 &lt;= vid &lt; 4094</code> likh diya. Run failed test ke liye <b>F</b> aur traceback dikhata hai jo batata hai kaun sa assert false tha:</p>
<pre class="out">..F.
======================================================================
<span class="hl">FAIL: test_valid_ids (__main__.TestVlan.test_valid_ids)</span>
----------------------------------------------------------------------
Traceback (most recent call last):
  File "test_vlan_tools.py", line 17, in test_valid_ids
    self.assertTrue(is_valid_vlan(vid))
<span class="hl">AssertionError: False is not true</span>

----------------------------------------------------------------------
Ran 4 tests in 0.001s

<span class="hl">FAILED (failures=1)</span></pre>
<p>Har progress character ka matlab hai: <code>.</code> pass, <code>F</code> <b>failure</b> (assert false tha, code ne galat jawab diya), <code>E</code> <b>error</b> (test khud unexpected exception se crash hua, jaise missing argument ka <code>TypeError</code>), <code>s</code> skipped. Aakhri line pehle padho (<code>OK</code> ya <code>FAILED (failures=1, errors=1)</code>), phir FAIL: ya ERROR: ke baad test ka naam, phir assert wali line aur neeche ka message. Lists par <code>assertEqual</code> ke liye unittest pehla differing element bhi dikhata hai, jisse gayab space pakadna aasaan hai.</p>

<h3>Data aur API responses test karna</h3>
<p>Blueprint kehta hai "data aur API responses validate karo". Trick yeh hai ki unit test ko live API call nahi karni chahiye. Uski jagah <i>saved sample response</i> parse karo, ya call ko fake karo. Aap apna code data par test karte ho:</p>
<pre class="code">import json, unittest

def vlan_names(response_text):
    """Return {vlan_id: name} from a controller JSON reply."""
    data = json.loads(response_text)
    return {item["id"]: item["name"] for item in data["vlans"]}

class TestApiParser(unittest.TestCase):
    SAMPLE = '{"vlans": [{"id": 10, "name": "USERS"}, {"id": 20, "name": "VOICE"}]}'

    def test_names(self):
        self.assertEqual(vlan_names(self.SAMPLE), {10: "USERS", 20: "VOICE"})

    def test_missing_key_raises(self):
        with self.assertRaises(KeyError):
            vlan_names('{"other": []}')</pre>
<p>Network ki zaroorat nahi, isliye test tez aur repeatable hai. <b>Mock</b> (<code>unittest.mock</code> se) us function ki jagah le sakta hai jo asli device ko call karta, aur aapko check karne deta hai ki use kaise call kiya gaya.</p>

<div class="warn"><p><b>Aam galtiyan.</b> Test method ka naam <code>test</code> se shuru na hona, isliye woh chupchaap kabhi nahi chalta. Aise tests jo ek doosre ke order par ya asli device up hone par depend karte hain. <code>assertEqual</code> se pehle <code>self.</code> bhoolna. <code>assertRaises</code> ko bahut zyada code ke aas paas lagana, jisse koi aur bug exception raise karta hai aur test galat wajah se pass ho jaata hai. Apni file ka naam <code>unittest.py</code> rakhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jaano ki <code>setUp</code> <b>har</b> test se pehle chalta hai, ek baar nahi. <code>assertEqual(expected, actual)</code> do values compare karta hai; <code>assertTrue</code> truthiness check karta hai. <b>Failure</b> (F) ka matlab assertion false thi; <b>error</b> (E) ka matlab unexpected exception. Jis class se inherit karte ho woh <code>unittest.TestCase</code> hai, <code>unittest.Test</code> nahi.</p></div>

<div class="scn"><h4>Woh test jo kabhi chala hi nahi</h4><p>Ek team parser par "100% green" ka jashn manati rahi jab tak customer ko bug nahi mila. Reviewer ne test file kholi: ek method ka naam <code>test_empty_response</code> ki jagah <code>check_empty_response</code> tha, isliye unittest ne use kabhi collect nahi kiya. Rename karte hi test turant red hua aur khaali replies par crash dikha diya. Pipeline ab fail hoti hai agar chalne wale tests ki ginti ghat jaye.</p><p><b>Lesson:</b> sirf rang nahi, "Ran N tests" line padho.</p></div>
<div class="iv"><p class="q">"Python mein unit test kaise likhte aur chalate ho?"</p><p>unittest import karo, ek class banao jo <code>unittest.TestCase</code> se inherit kare, <code>test</code> se shuru hone wale methods jodo jo <code>assertEqual</code>, <code>assertTrue</code> aur <code>assertRaises</code> jaise asserts call karein, taaza state ke liye <code>setUp</code> use karo, aur <code>python3 -m unittest</code> ya <code>unittest.main()</code> se chalao. Samjhao ki dot pass, F failed assert, E unexpected error, aur unit tests sample data par chalne chahiye, live devices par nahi.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>unittest built in hai; tests woh methods hain jo <code>test</code> se shuru hote hain, ek class mein jo <code>unittest.TestCase</code> inherit karti hai.</li>
<li>assertEqual, assertTrue, assertFalse, assertIn, assertIsNone aur assertRaises jaano.</li>
<li>setUp har test se pehle chalta hai; tearDown baad mein.</li>
<li>Output: dot = pass, F = failure, E = error; aakhri line OK ya FAILED (failures=..., errors=...) batati hai.</li>
<li>API handling code ko saved sample responses ya mocks se test karo, live calls se nahi.</li>
</ul></div>
`}};export{e as default};