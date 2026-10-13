var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: four red tests, code or test?`,hi:`Troubleshooting workflow: chaar red tests, code ya test?`},body:{en:`
<p><b>The idea of this chapter:</b> a red test says two things disagree. It does not say which one is wrong. This is Lab 2: a teammate pushed <code>netlib.py</code> and its tests to AUTO01 (<code>netadmin</code> / <code>Deccan@123</code>), and four tests are red. You will use one routine on all four, fix the right file each time, and end with a green suite. The rule: <b>never edit a test just to make it green when the code is wrong.</b></p>

<h3>Analogy: two thermometers</h3>
<p>One thermometer says the patient has 41 degrees, the patient looks fine. Is the patient sick or the thermometer broken? You do not guess; you take a third reading. The code and the test are two instruments measuring the same behaviour. Evidence outside both, such as the written rule, the sample file and the other tests, decides which one is off.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Workflow: run, isolate, read E lines, check evidence, then code wrong, test wrong, or shared state">
<rect x="10" y="15" width="110" height="50" rx="8" fill="#fecaca"/><text x="65" y="38" text-anchor="middle" class="svg-ink" font-size="12">1 Run, count</text><text x="65" y="54" text-anchor="middle" class="svg-muted" font-size="10">pytest -q</text>
<rect x="135" y="15" width="110" height="50" rx="8" fill="#fde68a"/><text x="190" y="38" text-anchor="middle" class="svg-ink" font-size="12">2 Isolate</text><text x="190" y="54" text-anchor="middle" class="svg-muted" font-size="10">one file, -k</text>
<rect x="260" y="15" width="110" height="50" rx="8" fill="#bae6fd"/><text x="315" y="38" text-anchor="middle" class="svg-ink" font-size="12">3 Read E lines</text><text x="315" y="54" text-anchor="middle" class="svg-muted" font-size="10">actual vs expected</text>
<rect x="385" y="15" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="440" y="38" text-anchor="middle" class="svg-ink" font-size="12">4 Evidence</text><text x="440" y="54" text-anchor="middle" class="svg-muted" font-size="10">rule, sample, docs</text>
<rect x="510" y="15" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="570" y="38" text-anchor="middle" class="svg-ink" font-size="12">5 Decide</text><text x="570" y="54" text-anchor="middle" class="svg-muted" font-size="10">one change</text>
<rect x="30" y="120" width="170" height="60" rx="10" fill="#bbf7d0"/><text x="115" y="146" text-anchor="middle" class="svg-ink" font-size="12">Code is wrong</text><text x="115" y="164" text-anchor="middle" class="svg-muted" font-size="10">test matches the rule</text>
<rect x="235" y="120" width="170" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="12">Test is wrong</text><text x="320" y="164" text-anchor="middle" class="svg-muted" font-size="10">expectation breaks the data</text>
<rect x="440" y="120" width="180" height="60" rx="10" fill="#bbf7d0"/><text x="530" y="146" text-anchor="middle" class="svg-ink" font-size="12">Shared state</text><text x="530" y="164" text-anchor="middle" class="svg-muted" font-size="10">passes alone, fails in suite</text>
<line x1="570" y1="65" x2="115" y2="120" stroke="#64748b" stroke-width="1.5"/><line x1="570" y1="65" x2="320" y2="120" stroke="#64748b" stroke-width="1.5"/><line x1="570" y1="65" x2="530" y2="120" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Five steps, three possible verdicts.</p></div>

<h3>The evidence table</h3>
<table class="cmp"><tr><th>What you see</th><th>Verdict</th><th>Fix</th></tr>
<tr><td>The test matches the written rule or docstring; the code returns something else</td><td>Code is wrong</td><td>Edit the code</td></tr>
<tr><td>The test expects something the sample data or device output contradicts</td><td>Test is wrong</td><td>Edit the test</td></tr>
<tr><td>The test passes alone but fails with others</td><td>Shared state or order dependence</td><td>Isolate the test (fixture scope)</td></tr>
<tr><td>Error at setup or collection, not an assert</td><td>Environment or typo</td><td>Fix path, import or fixture name</td></tr>
</table>

<h3>Step 1: run and count</h3>
<pre class="out">AUTO01$ ls
netlib.py  samples  test_conn.py  test_parse.py  test_state.py  test_vlan.py
AUTO01$ pytest -q --tb=no
F                                                                        [  8%]
F..                                                                      [ 33%]
.F                                                                       [ 50%]
..F...                                                                   [100%]
=========================== short test summary info ============================
FAILED test_conn.py::test_hostname - assert 'hostname' == 'PUN-CORE-R1'
FAILED test_parse.py::test_row_count - assert 3 == 4
FAILED test_state.py::test_second_starts_empty - assert ['R1'] == []
FAILED test_vlan.py::test_valid_vlan[4094-True] - assert False is True
<span class="hl">4 failed, 8 passed in 0.13s</span></pre>
<p>Answer to task 1: <b>4 failed</b>. (<code>--tb=no</code> trims the tracebacks; a plain <code>pytest -q</code> prints the same summary under them.) Four different files, four different reasons. Take them one at a time.</p>

<h3>Failure one: test_vlan.py</h3>
<pre class="out">AUTO01$ pytest -q test_vlan.py
..F...                                                                   [100%]

=================================== FAILURES ===================================
__________________________ test_valid_vlan[4094-True] __________________________

    @pytest.mark.parametrize("vid, ok", [(1, True), (100, True), (4094, True), (4095, False), (1003, False), (0, False)])
    def test_valid_vlan(vid, ok):
&gt;       assert valid_vlan(vid) is ok
E       assert False is True
E        +  where False = valid_vlan(4094)

test_vlan.py:8: AssertionError
=========================== short test summary info ============================
FAILED test_vlan.py::test_valid_vlan[4094-True] - assert False is True
1 failed, 5 passed in 0.07s</pre>
<p>Only the row <code>4094-True</code> failed, and the other five rows pass. Evidence: the docstring of <code>valid_vlan</code> says "VLAN ids run from 1 to 4094", so the test is right. Look at the code:</p>
<pre class="out">AUTO01$ grep -n "4094" netlib.py
8:    """VLAN ids run from 1 to 4094; 1002-1005 are reserved on Cisco switches."""
11:    return 1 &lt;= vid <span class="hl">&lt; 4094</span> and not 1002 &lt;= vid &lt;= 1005</pre>
<p>A strict <code>&lt;</code> at the top edge. <b>Code is wrong</b>. Fix the code, not the test (answer to task 2: 4094):</p>
<pre class="out">AUTO01$ sed -i 's/vid &lt; 4094/vid &lt;= 4094/' netlib.py
AUTO01$ pytest -q test_vlan.py
......                                                                   [100%]
<span class="hl">6 passed in 0.07s</span></pre>

<h3>Failure two: test_parse.py</h3>
<pre class="out">AUTO01$ pytest -q test_parse.py
F..                                                                      [100%]

=================================== FAILURES ===================================
________________________________ test_row_count ________________________________

    def test_row_count():
&gt;       assert len(parse_brief(load())) == 4
E       assert 3 == 4
E        +  where 3 = len([{'name': 'GigabitEthernet0/0', 'ip': '10.99.0.1', 'status': 'up', 'proto': 'up'}, {'name': 'GigabitEthernet0/1', 'ip':  ...ministratively down', 'proto': 'down'}, {'name': 'Loopback0', 'ip': '1.1.1.1', 'status': 'up', 'proto': 'up'}])
E        +    where [{'name': 'GigabitEthernet0/0', 'ip': '10.99.0.1', 'status': 'up', 'proto': 'up'}, {'name': 'GigabitEthernet0/1', 'ip':  ...ministratively down', 'proto': 'down'}, {'name': 'Loopback0', 'ip': '1.1.1.1', 'status': 'up', 'proto': 'up'}] = parse_brief('Interface              IP-Address      OK? Method Status                Protocol\\nGigabitEthernet0/0     10.99.0.1      ...set  administratively down down\\nLoopback0              1.1.1.1         YES manual up                    up\\n')
E        +      where 'Interface              IP-Address      OK? Method Status                Protocol\\nGigabitEthernet0/0     10.99.0.1      ...set  administratively down down\\nLoopback0              1.1.1.1         YES manual up                    up\\n' = load()

test_parse.py:10: AssertionError
=========================== short test summary info ============================
FAILED test_parse.py::test_row_count - assert 3 == 4
1 failed, 2 passed in 0.04s</pre>
<p>The code returned 3 rows; the test wants 4. The long <code>where</code> lines are pytest printing the data. The two neighbours, <code>test_names</code> and <code>test_down</code>, pass, which already suggests the parser works. Look at the sample the parser reads:</p>
<pre class="out">AUTO01$ cat samples/brief.txt
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/1     unassigned      YES unset  administratively down down
Loopback0              1.1.1.1         YES manual up                    up</pre>
<p>Four lines, but the first is the header, not an interface. Three interfaces exist, and <code>test_names</code> lists exactly those three. The test counted the header. <b>Test is wrong.</b> Making the parser invent a fourth row would break the other two tests. Fix the expectation (answer to task 3: the test):</p>
<pre class="out">AUTO01$ sed -i 's/== 4$/== 3/' test_parse.py
AUTO01$ pytest -q test_parse.py
...                                                                      [100%]
<span class="hl">3 passed in 0.04s</span></pre>

<h3>Failure three: test_state.py, the sneaky one</h3>
<pre class="out">AUTO01$ cat test_state.py
import pytest


@pytest.fixture(scope="module")
def seen():
    return []


def test_first_collects(seen):
    seen.append("R1")
    assert seen == ["R1"]


def test_second_starts_empty(seen):
    assert seen == []
AUTO01$ pytest -q test_state.py -k second
.                                                                        [100%]
<span class="hl">1 passed in 0.02s</span></pre>
<p>Alone, the failing test passes (answer to task 4: yes). So the assertion is not wrong in itself. The difference is what ran before it. The fixture has <code>scope="module"</code>, so both tests receive the <i>same</i> list. The first test appended "R1", and the second sees <code>['R1']</code>. This is <b>shared state</b>. It also depends on order: in the other order the failure would move to the other test. Fix the isolation by removing the scope, so every test gets a new list:</p>
<pre class="out">AUTO01$ sed -i 's/@pytest.fixture(scope="module")/@pytest.fixture/' test_state.py
AUTO01$ pytest -q test_state.py
..                                                                       [100%]
<span class="hl">2 passed in 0.03s</span></pre>

<h3>Failure four: test_conn.py</h3>
<pre class="out">AUTO01$ pytest -q test_conn.py
F                                                                        [100%]

=================================== FAILURES ===================================
________________________________ test_hostname _________________________________

    def test_hostname(monkeypatch):
        monkeypatch.setattr(netlib, "connect", lambda host: FakeConn())
&gt;       assert netlib.device_hostname("R1") == "PUN-CORE-R1"
E       AssertionError: assert 'hostname' == 'PUN-CORE-R1'
E         - PUN-CORE-R1
E         + hostname
E        +  where 'hostname' = &lt;function device_hostname at 0x7f007f3a1cb0&gt;('R1')

test_conn.py:14: AssertionError
=========================== short test summary info ============================
FAILED test_conn.py::test_hostname - assert 'hostname' == 'PUN-CORE-R1'
1 failed in 0.02s</pre>
<p>The fake returns <code>"hostname PUN-CORE-R1"</code>, and that is exactly what a router prints for this command. The test expects the last word, which is right. The code returned the first word:</p>
<pre class="out">AUTO01$ sed -n '52,55p' netlib.py

def read_hostname(conn):
    line = conn.send_command("show running-config | include hostname").strip()
    return line.split()[<span class="hl">0</span>] if line.startswith("hostname") else None</pre>
<p><b>Code is wrong</b> (answer to task 5). Index 0 is the word "hostname"; the name is the last word:</p>
<pre class="out">AUTO01$ sed -i 's/line.split()\\[0\\]/line.split()[-1]/' netlib.py
AUTO01$ pytest -q test_conn.py
.                                                                        [100%]
<span class="hl">1 passed in 0.02s</span>
AUTO01$ pytest -q
.                                                                        [  8%]
...                                                                      [ 33%]
..                                                                       [ 50%]
......                                                                   [100%]
<span class="hl">12 passed in 0.13s</span></pre>
<p>Task 6: <b>12 passed</b>. Two of the four bugs were in the code and two in the tests, which is the realistic mix.</p>

<div class="warn"><p><b>Common mistakes.</b> Editing the expected value until it is green. Fixing three things at once, so you cannot tell which fix mattered. Running only the file you changed and not the whole suite at the end. Deleting a flaky test instead of finding the shared state.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Passes alone, fails in the suite" points to shared state or ordering, not to a bad assert. A wider fixture scope is a classic cause. And "all tests green" after editing the tests proves nothing if the code is still wrong.</p></div>

<div class="scn"><h4>Green by editing the test</h4><p>After a refactor, a hostname test failed. A hurried engineer changed the expected string to what the code returned, "hostname", and the suite went green. Two days later a backup tool named every file <code>hostname.cfg</code>, and each router overwrote the last. A code review caught the test change, and the original expectation was restored along with a one-character fix in the code.</p><p><b>Lesson:</b> a test that was changed to match the code has stopped protecting you.</p></div>

<div class="iv"><p class="q">"A test fails after your change. How do you decide whether to fix the code or the test?"</p><p>I run it alone and read the E lines for actual and expected. Then I look for evidence outside both: the spec or docstring, the sample device output, the neighbouring tests. If the test agrees with the rule, I fix the code; if it contradicts the data, I fix the test; if it passes alone but fails in the suite, I look for shared state. One change, then rerun the file and the whole suite.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A red test means two things disagree; evidence outside both says which is wrong.</li>
<li>Routine: run and count, isolate, read E lines, check the rule and sample data, change one thing.</li>
<li>Lab 2 verdicts: code (4094 bound), test (header counted), shared state (module scope), code (<code>split()[0]</code>).</li>
<li>Passes alone but fails with others means shared state; reduce the fixture scope.</li>
<li>Finish with the whole suite: 12 passed.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> red test kehta hai ki do cheezein ek-doosre se asehmat hain. Woh yeh nahi kehta ki kaunsi galat hai. Yeh Lab 2 hai: ek teammate ne AUTO01 (<code>netadmin</code> / <code>Deccan@123</code>) par <code>netlib.py</code> aur uske tests push kiye, aur chaar tests red hain. Aap chaaron par ek hi routine use karoge, har baar sahi file theek karoge, aur green suite par ant karoge. Rule: <b>code galat ho to test ko sirf green karne ke liye kabhi edit mat karo.</b></p>

<h3>Analogy: do thermometer</h3>
<p>Ek thermometer kehta hai mareez ko 41 degree bukhar hai, mareez theek lagta hai. Mareez bimaar hai ya thermometer kharab? Andaza nahi lagate; teesri reading lete hain. Code aur test ek hi behaviour naapne wale do instruments hain. Dono ke bahar ka saboot, jaise likha hua rule, sample file aur doosre tests, tay karta hai ki kaunsa off hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Workflow: chalao, alag karo, E lines padho, saboot dekho, phir code galat, test galat ya shared state">
<rect x="10" y="15" width="110" height="50" rx="8" fill="#fecaca"/><text x="65" y="38" text-anchor="middle" class="svg-ink" font-size="12">1 Chalao, gino</text><text x="65" y="54" text-anchor="middle" class="svg-muted" font-size="10">pytest -q</text>
<rect x="135" y="15" width="110" height="50" rx="8" fill="#fde68a"/><text x="190" y="38" text-anchor="middle" class="svg-ink" font-size="12">2 Alag karo</text><text x="190" y="54" text-anchor="middle" class="svg-muted" font-size="10">ek file, -k</text>
<rect x="260" y="15" width="110" height="50" rx="8" fill="#bae6fd"/><text x="315" y="38" text-anchor="middle" class="svg-ink" font-size="12">3 E lines padho</text><text x="315" y="54" text-anchor="middle" class="svg-muted" font-size="10">actual vs expected</text>
<rect x="385" y="15" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="440" y="38" text-anchor="middle" class="svg-ink" font-size="12">4 Saboot</text><text x="440" y="54" text-anchor="middle" class="svg-muted" font-size="10">rule, sample, docs</text>
<rect x="510" y="15" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="570" y="38" text-anchor="middle" class="svg-ink" font-size="12">5 Tay karo</text><text x="570" y="54" text-anchor="middle" class="svg-muted" font-size="10">ek change</text>
<rect x="30" y="120" width="170" height="60" rx="10" fill="#bbf7d0"/><text x="115" y="146" text-anchor="middle" class="svg-ink" font-size="12">Code galat hai</text><text x="115" y="164" text-anchor="middle" class="svg-muted" font-size="10">test rule se match karta hai</text>
<rect x="235" y="120" width="170" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="12">Test galat hai</text><text x="320" y="164" text-anchor="middle" class="svg-muted" font-size="10">expectation data se takrati hai</text>
<rect x="440" y="120" width="180" height="60" rx="10" fill="#bbf7d0"/><text x="530" y="146" text-anchor="middle" class="svg-ink" font-size="12">Shared state</text><text x="530" y="164" text-anchor="middle" class="svg-muted" font-size="10">akela pass, suite mein fail</text>
<line x1="570" y1="65" x2="115" y2="120" stroke="#64748b" stroke-width="1.5"/><line x1="570" y1="65" x2="320" y2="120" stroke="#64748b" stroke-width="1.5"/><line x1="570" y1="65" x2="530" y2="120" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Paanch steps, teen sambhav verdicts.</p></div>

<h3>Saboot ki table</h3>
<table class="cmp"><tr><th>Aap kya dekhte ho</th><th>Verdict</th><th>Fix</th></tr>
<tr><td>Test likhe hue rule ya docstring se match karta hai; code kuch aur return karta hai</td><td>Code galat hai</td><td>Code edit karo</td></tr>
<tr><td>Test aisi cheez expect karta hai jise sample data ya device output jhuthlata hai</td><td>Test galat hai</td><td>Test edit karo</td></tr>
<tr><td>Test akela pass hota hai par doosron ke saath fail</td><td>Shared state ya order dependence</td><td>Test ko isolate karo (fixture scope)</td></tr>
<tr><td>Setup ya collection par error, assert nahi</td><td>Environment ya typo</td><td>Path, import ya fixture naam theek karo</td></tr>
</table>

<h3>Step 1: chalao aur gino</h3>
<pre class="out">AUTO01$ ls
netlib.py  samples  test_conn.py  test_parse.py  test_state.py  test_vlan.py
AUTO01$ pytest -q --tb=no
F                                                                        [  8%]
F..                                                                      [ 33%]
.F                                                                       [ 50%]
..F...                                                                   [100%]
=========================== short test summary info ============================
FAILED test_conn.py::test_hostname - assert 'hostname' == 'PUN-CORE-R1'
FAILED test_parse.py::test_row_count - assert 3 == 4
FAILED test_state.py::test_second_starts_empty - assert ['R1'] == []
FAILED test_vlan.py::test_valid_vlan[4094-True] - assert False is True
<span class="hl">4 failed, 8 passed in 0.13s</span></pre>
<p>Task 1 ka jawab: <b>4 failed</b>. (<code>--tb=no</code> tracebacks chhota karta hai; plain <code>pytest -q</code> unke neeche wahi summary print karta hai.) Chaar alag files, chaar alag wajah. Ek-ek karke lo.</p>

<h3>Failure ek: test_vlan.py</h3>
<pre class="out">AUTO01$ pytest -q test_vlan.py
..F...                                                                   [100%]

=================================== FAILURES ===================================
__________________________ test_valid_vlan[4094-True] __________________________

    @pytest.mark.parametrize("vid, ok", [(1, True), (100, True), (4094, True), (4095, False), (1003, False), (0, False)])
    def test_valid_vlan(vid, ok):
&gt;       assert valid_vlan(vid) is ok
E       assert False is True
E        +  where False = valid_vlan(4094)

test_vlan.py:8: AssertionError
=========================== short test summary info ============================
FAILED test_vlan.py::test_valid_vlan[4094-True] - assert False is True
1 failed, 5 passed in 0.07s</pre>
<p>Sirf row <code>4094-True</code> fail hui, baaki paanch rows pass hain. Saboot: <code>valid_vlan</code> ka docstring kehta hai "VLAN ids run from 1 to 4094", isliye test sahi hai. Code dekho:</p>
<pre class="out">AUTO01$ grep -n "4094" netlib.py
8:    """VLAN ids run from 1 to 4094; 1002-1005 are reserved on Cisco switches."""
11:    return 1 &lt;= vid <span class="hl">&lt; 4094</span> and not 1002 &lt;= vid &lt;= 1005</pre>
<p>Upar ke kinare par strict <code>&lt;</code>. <b>Code galat hai</b>. Code theek karo, test nahi (task 2 ka jawab: 4094):</p>
<pre class="out">AUTO01$ sed -i 's/vid &lt; 4094/vid &lt;= 4094/' netlib.py
AUTO01$ pytest -q test_vlan.py
......                                                                   [100%]
<span class="hl">6 passed in 0.07s</span></pre>

<h3>Failure do: test_parse.py</h3>
<pre class="out">AUTO01$ pytest -q test_parse.py
F..                                                                      [100%]

=================================== FAILURES ===================================
________________________________ test_row_count ________________________________

    def test_row_count():
&gt;       assert len(parse_brief(load())) == 4
E       assert 3 == 4
E        +  where 3 = len([{'name': 'GigabitEthernet0/0', 'ip': '10.99.0.1', 'status': 'up', 'proto': 'up'}, {'name': 'GigabitEthernet0/1', 'ip':  ...ministratively down', 'proto': 'down'}, {'name': 'Loopback0', 'ip': '1.1.1.1', 'status': 'up', 'proto': 'up'}])
E        +    where [{'name': 'GigabitEthernet0/0', 'ip': '10.99.0.1', 'status': 'up', 'proto': 'up'}, {'name': 'GigabitEthernet0/1', 'ip':  ...ministratively down', 'proto': 'down'}, {'name': 'Loopback0', 'ip': '1.1.1.1', 'status': 'up', 'proto': 'up'}] = parse_brief('Interface              IP-Address      OK? Method Status                Protocol\\nGigabitEthernet0/0     10.99.0.1      ...set  administratively down down\\nLoopback0              1.1.1.1         YES manual up                    up\\n')
E        +      where 'Interface              IP-Address      OK? Method Status                Protocol\\nGigabitEthernet0/0     10.99.0.1      ...set  administratively down down\\nLoopback0              1.1.1.1         YES manual up                    up\\n' = load()

test_parse.py:10: AssertionError
=========================== short test summary info ============================
FAILED test_parse.py::test_row_count - assert 3 == 4
1 failed, 2 passed in 0.04s</pre>
<p>Code ne 3 rows return ki; test 4 chahta hai. Lambi <code>where</code> lines pytest ka data print karna hai. Do padosi tests, <code>test_names</code> aur <code>test_down</code>, pass hain, jo pehle hi ishara karta hai ki parser theek chalta hai. Woh sample dekho jo parser padhta hai:</p>
<pre class="out">AUTO01$ cat samples/brief.txt
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/1     unassigned      YES unset  administratively down down
Loopback0              1.1.1.1         YES manual up                    up</pre>
<p>Chaar lines, par pehli header hai, interface nahi. Teen interfaces hain, aur <code>test_names</code> theek wahi teen list karta hai. Test ne header ko ginti mein le liya. <b>Test galat hai.</b> Parser se chautha row banwana baaki do tests tod deta. Expectation theek karo (task 3 ka jawab: test):</p>
<pre class="out">AUTO01$ sed -i 's/== 4$/== 3/' test_parse.py
AUTO01$ pytest -q test_parse.py
...                                                                      [100%]
<span class="hl">3 passed in 0.04s</span></pre>

<h3>Failure teen: test_state.py, chalaak wali</h3>
<pre class="out">AUTO01$ cat test_state.py
import pytest


@pytest.fixture(scope="module")
def seen():
    return []


def test_first_collects(seen):
    seen.append("R1")
    assert seen == ["R1"]


def test_second_starts_empty(seen):
    assert seen == []
AUTO01$ pytest -q test_state.py -k second
.                                                                        [100%]
<span class="hl">1 passed in 0.02s</span></pre>
<p>Akela, failing test pass hota hai (task 4 ka jawab: yes). To assertion khud galat nahi hai. Fark isme hai ki isse pehle kya chala. Fixture mein <code>scope="module"</code> hai, isliye dono tests ko <i>wahi ek</i> list milti hai. Pehle test ne "R1" append kiya, aur doosra test <code>['R1']</code> dekhta hai. Yeh <b>shared state</b> hai. Yeh order par bhi depend karta hai: ulte order mein failure doosre test par chali jaati. Scope hatakar isolation theek karo, taaki har test ko nayi list mile:</p>
<pre class="out">AUTO01$ sed -i 's/@pytest.fixture(scope="module")/@pytest.fixture/' test_state.py
AUTO01$ pytest -q test_state.py
..                                                                       [100%]
<span class="hl">2 passed in 0.03s</span></pre>

<h3>Failure chaar: test_conn.py</h3>
<pre class="out">AUTO01$ pytest -q test_conn.py
F                                                                        [100%]

=================================== FAILURES ===================================
________________________________ test_hostname _________________________________

    def test_hostname(monkeypatch):
        monkeypatch.setattr(netlib, "connect", lambda host: FakeConn())
&gt;       assert netlib.device_hostname("R1") == "PUN-CORE-R1"
E       AssertionError: assert 'hostname' == 'PUN-CORE-R1'
E         - PUN-CORE-R1
E         + hostname
E        +  where 'hostname' = &lt;function device_hostname at 0x7f007f3a1cb0&gt;('R1')

test_conn.py:14: AssertionError
=========================== short test summary info ============================
FAILED test_conn.py::test_hostname - assert 'hostname' == 'PUN-CORE-R1'
1 failed in 0.02s</pre>
<p>Fake <code>"hostname PUN-CORE-R1"</code> return karta hai, aur router is command ke liye theek yahi print karta hai. Test aakhri shabd expect karta hai, jo sahi hai. Code ne pehla shabd return kiya:</p>
<pre class="out">AUTO01$ sed -n '52,55p' netlib.py

def read_hostname(conn):
    line = conn.send_command("show running-config | include hostname").strip()
    return line.split()[<span class="hl">0</span>] if line.startswith("hostname") else None</pre>
<p><b>Code galat hai</b> (task 5 ka jawab). Index 0 shabd "hostname" hai; naam aakhri shabd hai:</p>
<pre class="out">AUTO01$ sed -i 's/line.split()\\[0\\]/line.split()[-1]/' netlib.py
AUTO01$ pytest -q test_conn.py
.                                                                        [100%]
<span class="hl">1 passed in 0.02s</span>
AUTO01$ pytest -q
.                                                                        [  8%]
...                                                                      [ 33%]
..                                                                       [ 50%]
......                                                                   [100%]
<span class="hl">12 passed in 0.13s</span></pre>
<p>Task 6: <b>12 passed</b>. Chaar mein se do bugs code mein the aur do tests mein, jo asli duniya ka mix hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Expected value ko tab tak edit karna jab tak green na ho. Teen cheezein ek saath theek karna, jisse pata nahi chalta kaunsa fix kaam aaya. Sirf badli hui file chalana aur ant mein poori suite nahi. Shared state dhoondhne ki jagah flaky test delete kar dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Akela pass, suite mein fail" shared state ya ordering ki taraf ishara karta hai, buri assert ki taraf nahi. Chauda fixture scope classic wajah hai. Aur tests edit karne ke baad "sab green" kuch saabit nahi karta agar code ab bhi galat ho.</p></div>

<div class="scn"><h4>Test edit karke green</h4><p>Refactor ke baad hostname test fail hua. Jaldi mein engineer ne expected string ko wahi kar diya jo code return karta tha, "hostname", aur suite green ho gayi. Do din baad ek backup tool ne har file ka naam <code>hostname.cfg</code> rakh diya, aur har router ne pichhle ko overwrite kar diya. Code review ne test change pakad liya, aur original expectation code ke ek-character fix ke saath wapas aa gayi.</p><p><b>Lesson:</b> jis test ko code se match karne ke liye badla gaya, woh aapko bachana band kar deta hai.</p></div>

<div class="iv"><p class="q">"Aapke change ke baad test fail hota hai. Code theek karna hai ya test, yeh kaise tay karte ho?"</p><p>Use akela chalata hoon aur actual aur expected ke liye E lines padhta hoon. Phir dono ke bahar saboot dhoondhta hoon: spec ya docstring, sample device output, padosi tests. Test rule se match kare to code theek karta hoon; data se takraye to test theek karta hoon; akela pass ho par suite mein fail ho to shared state dhoondhta hoon. Ek change, phir file aur poori suite dobara chalata hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Red test ka matlab do cheezein asehmat hain; dono ke bahar ka saboot batata hai kaunsi galat hai.</li>
<li>Routine: chalao aur gino, alag karo, E lines padho, rule aur sample data dekho, ek cheez badlo.</li>
<li>Lab 2 verdicts: code (4094 bound), test (header gina), shared state (module scope), code (<code>split()[0]</code>).</li>
<li>Akela pass par doosron ke saath fail ka matlab shared state; fixture scope chhota karo.</li>
<li>Ant mein poori suite chalao: 12 passed.</li>
</ul></div>
`}};export{e as default};