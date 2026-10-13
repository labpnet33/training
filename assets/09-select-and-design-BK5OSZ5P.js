var e={id:`select-and-design`,h:{en:`Choosing tests with -k and marks, and designing testable network code`,hi:`-k aur marks se tests chunna, aur testable network code design karna`},body:{en:`
<p><b>The idea of this chapter:</b> once a suite has twenty-two tests, you need to run all of them, or only the three you care about right now. You will run the whole Lab 1 suite and a slice with <code>-k</code> (tasks 7 and 8), learn marks for skipping and for known bugs, and then step back to the design rule that made every test so far easy: keep the logic pure and the input and output at the edges.</p>

<h3>Analogy: sections of a checklist</h3>
<p>After changing a tyre, the pilot does not repeat the whole pre-flight. The crew runs the "wheels and brakes" section. The full checklist still runs before every flight. <code>-k</code> and marks give you the section; plain <code>pytest</code> gives you the whole checklist.</p>

<h3>Run everything</h3>
<pre class="out">AUTO01$ pytest -q
.                                                                        [  4%]
.                                                                        [  9%]
...                                                                      [ 22%]
...                                                                      [ 36%]
..........                                                               [ 81%]
....                                                                     [100%]
<span class="hl">22 passed in 0.23s</span></pre>
<p>Answer to task 7: <b>22 passed</b> (1 backup, 1 connection, 3 parse, 3 range, 10 table, 4 vlan). In this lab the dots are grouped one test file per line, and each group ends with the percentage reached. Real pytest wraps the dots at the terminal width instead, but the last line is identical. <code>python3 -m pytest -q</code> does the same job and also adds the current folder to the import path, which helps when pytest is installed in a virtual environment.</p>

<h3>-k: select by name</h3>
<p><code>-k</code> takes an expression and runs the tests whose name, file name or parametrize id contains the words. Combine words with <code>and</code>, <code>or</code> and <code>not</code>. Task 8 asks for the backup, connection and range tests:</p>
<pre class="out">AUTO01$ pytest -q -k 'backup or conn or range'
.                                                                        [ 20%]
.                                                                        [ 40%]
...                                                                      [100%]
<span class="hl">5 passed in 0.06s</span>
AUTO01$ pytest -v -k 'backup or conn or range'
============================= test session starts ==============================
platform linux -- Python 3.12.0, pytest-7.4.4, pluggy-1.3.0 -- /usr/bin/python3
cachedir: .pytest_cache
rootdir: /home/netadmin
collected 5 items

test_backup.py::test_backup_file PASSED                                  [ 20%]
test_conn.py::test_hostname PASSED                                       [ 40%]
test_range.py::test_ok PASSED                                            [ 60%]
test_range.py::test_backwards PASSED                                     [ 80%]
test_range.py::test_not_a_range PASSED                                   [100%]

============================== 5 passed in 0.06s ===============================</pre>
<p>Answer to task 8: <b>5</b>. Quote the expression so the shell does not split it. Before running, you can ask what <code>-k</code> would select, without running anything, using <code>--collect-only</code>:</p>
<pre class="out">AUTO01$ pytest -q -k "not vlan" --collect-only
collected 8 items

test_backup.py::test_backup_file
test_conn.py::test_hostname
test_parse.py::test_rows
test_parse.py::test_status
test_parse.py::test_down
test_range.py::test_ok
test_range.py::test_backwards
test_range.py::test_not_a_range

8 tests collected in 0.01s</pre>
<p>The word <code>vlan</code> matched both the file names (<code>test_vlan.py</code>) and the function <code>test_vlan_table</code>, so "not vlan" leaves eight tests. A parametrize id is searchable too, so you can run only the reserved rows:</p>
<pre class="out">AUTO01$ pytest -q -k "1002 or 1005" -v
test_table.py::test_vlan_table[1002-False] PASSED                        [ 50%]
test_table.py::test_vlan_table[1005-False] PASSED                        [100%]
2 passed in 0.03s</pre>
<p>You can also give an exact id (<code>pytest -q test_parse.py::test_down</code>) or several files (<code>pytest -q test_vlan.py test_range.py</code>).</p>

<h3>Marks: skip, xfail and your own labels</h3>
<p>A mark is a label on a test. Built-in ones change what happens when the test runs:</p>
<pre class="code">import sys

import pytest

from netlib import valid_vlan


@pytest.mark.skip(reason="R3 is down for maintenance")
def test_r3_live():
    assert False


@pytest.mark.skipif(sys.platform != "win32", reason="windows only")
def test_windows_only():
    assert False


@pytest.mark.xfail(reason="known bug: vlan 1002 handling under review")
def test_known_bug():
    assert valid_vlan(1002) is True


@pytest.mark.xfail(reason="fixed already")
def test_fixed():
    assert valid_vlan(10) is True


@pytest.mark.slow
def test_slow_one():
    assert valid_vlan(10)


def test_fast_one():
    assert valid_vlan(11)</pre>
<pre class="out">AUTO01$ pytest -v test_marks.py
============================= test session starts ==============================
platform linux -- Python 3.12.0, pytest-7.4.4, pluggy-1.3.0 -- /usr/bin/python3
cachedir: .pytest_cache
rootdir: /home/netadmin
collected 6 items

test_marks.py::test_r3_live SKIPPED                                      [ 16%]
test_marks.py::test_windows_only SKIPPED                                 [ 33%]
test_marks.py::test_known_bug XFAIL                                      [ 50%]
test_marks.py::test_fixed XPASS                                          [ 66%]
test_marks.py::test_slow_one PASSED                                      [ 83%]
test_marks.py::test_fast_one PASSED                                      [100%]

============== 2 passed, 2 skipped, 1 xfailed, 1 xpassed in 0.07s ==============
AUTO01$ pytest -q -rsx test_marks.py
ssxX..                                                                   [100%]
=========================== short test summary info ============================
SKIPPED [1] test_marks.py:9: R3 is down for maintenance
SKIPPED [1] test_marks.py:14: windows only
XFAIL test_marks.py::test_known_bug - known bug: vlan 1002 handling under review
2 passed, 2 skipped, 1 xfailed, 1 xpassed in 0.07s</pre>
<ul>
<li><b>skip</b> never runs the test and shows the reason with <code>-rs</code>. Use it for something temporarily impossible, like a router in maintenance.</li>
<li><b>skipif</b> skips under a condition, such as the operating system.</li>
<li><b>xfail</b> means "expected to fail". A failing xfail test is <code>XFAIL</code> and does not turn the run red. It documents a known bug. If it unexpectedly passes it shows <code>XPASS</code>, your cue to remove the mark because the bug is fixed.</li>
<li>A custom mark like <code>slow</code> is just a label. Select by label with <code>-m</code>:</li>
</ul>
<pre class="out">AUTO01$ pytest -q -m slow test_marks.py
.                                                                        [100%]
1 passed in 0.02s
AUTO01$ pytest -q -m "not slow" test_marks.py
ssxX.                                                                    [100%]
1 passed, 2 skipped, 1 xfailed, 1 xpassed in 0.06s</pre>
<div class="note"><p><b>Reference (not run in the simulator).</b> On a real server, register custom marks in a file called <code>pytest.ini</code> so pytest does not warn about a mark it does not know:</p>
<pre class="code">[pytest]
markers =
    slow: takes more than a second
    live: needs a real device</pre>
<p>A common team rule is a <code>live</code> mark on tests that need a router, with <code>pytest -m "not live"</code> for the fast daily run.</p></div>

<h3>Designing code that is easy to test</h3>
<p>Every function in <code>netlib.py</code> follows one idea: <b>pure logic in the middle, input and output at the edges</b>.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Pure functions in the centre, edges for SSH, files and printing around them">
<rect x="20" y="15" width="600" height="160" rx="14" fill="#e2e8f0"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">edges: need a fake, a tmp folder or capsys</text>
<rect x="60" y="55" width="140" height="45" rx="8" fill="#fed7aa"/><text x="130" y="83" text-anchor="middle" class="svg-ink" font-size="12">connect (SSH)</text>
<rect x="250" y="55" width="140" height="45" rx="8" fill="#fed7aa"/><text x="320" y="83" text-anchor="middle" class="svg-ink" font-size="12">save_backup (file)</text>
<rect x="440" y="55" width="140" height="45" rx="8" fill="#fed7aa"/><text x="510" y="83" text-anchor="middle" class="svg-ink" font-size="12">print_report</text>
<rect x="110" y="115" width="420" height="50" rx="10" fill="#bbf7d0"/><text x="320" y="137" text-anchor="middle" class="svg-ink" font-size="12">pure core: valid_vlan, vlan_range, parse_brief, interfaces_down</text><text x="320" y="154" text-anchor="middle" class="svg-muted" font-size="11">text in, data out, no network, no files</text>
</svg><p class="cap">Test the core with plain asserts; touch the edges with tools.</p></div>
<table class="cmp"><tr><th>Function</th><th>Kind</th><th>How you test it</th></tr>
<tr><td><code>valid_vlan</code>, <code>vlan_range</code></td><td>Pure</td><td>asserts, parametrize, raises</td></tr>
<tr><td><code>parse_brief</code>, <code>interfaces_down</code></td><td>Pure (text in, data out)</td><td>fixture with sample output</td></tr>
<tr><td><code>save_backup</code></td><td>File edge</td><td><code>tmp_path</code></td></tr>
<tr><td><code>connect</code></td><td>SSH edge</td><td>replaced by a fake</td></tr>
<tr><td><code>read_hostname</code></td><td>Logic with the connection passed in</td><td>pass a fake object</td></tr>
</table>
<p>Compare a design that is hard to test: one function that connects, parses and prints in a single block. The only test is "run it against a router". Split it, as above, and the parser becomes a ten-row table. When you feel a function is painful to test, that is the code telling you it does too many things.</p>

<div class="warn"><p><b>Common mistakes.</b> Leaving <code>xfail</code> marks forever after the bug is fixed. Using <code>skip</code> to hide a flaky test instead of fixing it. A <code>-k</code> expression that is too broad and runs tests you did not want. Writing a function that fetches, parses and prints in one block, then trying to test it with a fake for everything.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>-k</code> matches names (and ids), <code>-m</code> matches marks. <code>XFAIL</code> does not fail the run but <code>XPASS</code> is a signal to clean up. <code>--collect-only</code> lists tests without running them.</p></div>

<div class="scn"><h4>The nightly run that took forty minutes</h4><p>A suite mixed fast parser tests with checks that logged in to real switches. Engineers stopped running it before commits. After the live checks got a <code>live</code> mark, the daily run was <code>pytest -m "not live"</code> and finished in under two seconds, while the live checks ran once before each change window.</p><p><b>Lesson:</b> a suite that is slow does not get run; slice it so the quick part runs on every save.</p></div>

<div class="iv"><p class="q">"How do you structure code so it is easy to unit test?"</p><p>I keep parsing and validation as pure functions, text in and data out, and push SSH, file writes and printing to thin edge functions. Pure functions are tested with asserts and parametrize; the edges with fakes, tmp_path and capsys. That also lets me run a fast subset with -k or a mark.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>pytest -q</code> runs everything; the lab suite is 22 tests, and <code>-k 'backup or conn or range'</code> selects 5.</li>
<li><code>-k</code> matches names and ids with and, or, not; <code>--collect-only</code> previews the selection.</li>
<li><code>skip</code>, <code>skipif</code> and <code>xfail</code> record why a test does not count; <code>-rsx</code> prints the reasons.</li>
<li>Custom marks plus <code>-m</code> separate fast tests from live ones.</li>
<li>Pure logic in the core and I/O at the edges makes code easy to test.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> jab suite mein baees tests ho jaayein, to ya to sab chalane hote hain ya sirf woh teen jo abhi kaam ke hain. Aap poori Lab 1 suite aur <code>-k</code> se ek hissa chalaoge (tasks 7 aur 8), skipping aur known bugs ke liye marks seekhoge, aur phir us design rule par aaoge jisne ab tak har test aasan banaya: logic ko pure rakho aur input-output kinare par.</p>

<h3>Analogy: checklist ke sections</h3>
<p>Tyre badalne ke baad pilot poori pre-flight dobara nahi karta. Crew "wheels and brakes" section chalata hai. Poori checklist har flight se pehle phir bhi chalti hai. <code>-k</code> aur marks aapko section dete hain; plain <code>pytest</code> poori checklist.</p>

<h3>Sab kuch chalao</h3>
<pre class="out">AUTO01$ pytest -q
.                                                                        [  4%]
.                                                                        [  9%]
...                                                                      [ 22%]
...                                                                      [ 36%]
..........                                                               [ 81%]
....                                                                     [100%]
<span class="hl">22 passed in 0.23s</span></pre>
<p>Task 7 ka jawab: <b>22 passed</b> (1 backup, 1 connection, 3 parse, 3 range, 10 table, 4 vlan). Is lab mein dots ek test file per line group hote hain, aur har group ke ant mein pahuncha hua percentage. Asli pytest dots ko terminal width par wrap karta hai, par aakhri line same hoti hai. <code>python3 -m pytest -q</code> wahi kaam karta hai aur current folder ko import path mein bhi jodta hai, jo virtual environment mein installed pytest ke saath madad karta hai.</p>

<h3>-k: naam se chunna</h3>
<p><code>-k</code> expression leta hai aur un tests ko chalata hai jinke naam, file naam ya parametrize id mein woh shabd hon. Shabdon ko <code>and</code>, <code>or</code> aur <code>not</code> se jodo. Task 8 backup, connection aur range tests maangta hai:</p>
<pre class="out">AUTO01$ pytest -q -k 'backup or conn or range'
.                                                                        [ 20%]
.                                                                        [ 40%]
...                                                                      [100%]
<span class="hl">5 passed in 0.06s</span>
AUTO01$ pytest -v -k 'backup or conn or range'
============================= test session starts ==============================
platform linux -- Python 3.12.0, pytest-7.4.4, pluggy-1.3.0 -- /usr/bin/python3
cachedir: .pytest_cache
rootdir: /home/netadmin
collected 5 items

test_backup.py::test_backup_file PASSED                                  [ 20%]
test_conn.py::test_hostname PASSED                                       [ 40%]
test_range.py::test_ok PASSED                                            [ 60%]
test_range.py::test_backwards PASSED                                     [ 80%]
test_range.py::test_not_a_range PASSED                                   [100%]

============================== 5 passed in 0.06s ===============================</pre>
<p>Task 8 ka jawab: <b>5</b>. Expression ko quote karo taaki shell use todhe nahi. Chalane se pehle, kuch run kiye bina, <code>--collect-only</code> se pooch sakte ho ki <code>-k</code> kya select karega:</p>
<pre class="out">AUTO01$ pytest -q -k "not vlan" --collect-only
collected 8 items

test_backup.py::test_backup_file
test_conn.py::test_hostname
test_parse.py::test_rows
test_parse.py::test_status
test_parse.py::test_down
test_range.py::test_ok
test_range.py::test_backwards
test_range.py::test_not_a_range

8 tests collected in 0.01s</pre>
<p>Shabd <code>vlan</code> file naamon (<code>test_vlan.py</code>) aur function <code>test_vlan_table</code> dono se match hua, isliye "not vlan" ke baad aath tests bachte hain. Parametrize id bhi searchable hai, to sirf reserved rows chala sakte ho:</p>
<pre class="out">AUTO01$ pytest -q -k "1002 or 1005" -v
test_table.py::test_vlan_table[1002-False] PASSED                        [ 50%]
test_table.py::test_vlan_table[1005-False] PASSED                        [100%]
2 passed in 0.03s</pre>
<p>Exact id (<code>pytest -q test_parse.py::test_down</code>) ya kai files (<code>pytest -q test_vlan.py test_range.py</code>) bhi de sakte ho.</p>

<h3>Marks: skip, xfail aur apne labels</h3>
<p>Mark test par laga label hai. Built-in marks badalte hain ki test chalne par kya hota hai:</p>
<pre class="code">import sys

import pytest

from netlib import valid_vlan


@pytest.mark.skip(reason="R3 is down for maintenance")
def test_r3_live():
    assert False


@pytest.mark.skipif(sys.platform != "win32", reason="windows only")
def test_windows_only():
    assert False


@pytest.mark.xfail(reason="known bug: vlan 1002 handling under review")
def test_known_bug():
    assert valid_vlan(1002) is True


@pytest.mark.xfail(reason="fixed already")
def test_fixed():
    assert valid_vlan(10) is True


@pytest.mark.slow
def test_slow_one():
    assert valid_vlan(10)


def test_fast_one():
    assert valid_vlan(11)</pre>
<pre class="out">AUTO01$ pytest -v test_marks.py
============================= test session starts ==============================
platform linux -- Python 3.12.0, pytest-7.4.4, pluggy-1.3.0 -- /usr/bin/python3
cachedir: .pytest_cache
rootdir: /home/netadmin
collected 6 items

test_marks.py::test_r3_live SKIPPED                                      [ 16%]
test_marks.py::test_windows_only SKIPPED                                 [ 33%]
test_marks.py::test_known_bug XFAIL                                      [ 50%]
test_marks.py::test_fixed XPASS                                          [ 66%]
test_marks.py::test_slow_one PASSED                                      [ 83%]
test_marks.py::test_fast_one PASSED                                      [100%]

============== 2 passed, 2 skipped, 1 xfailed, 1 xpassed in 0.07s ==============
AUTO01$ pytest -q -rsx test_marks.py
ssxX..                                                                   [100%]
=========================== short test summary info ============================
SKIPPED [1] test_marks.py:9: R3 is down for maintenance
SKIPPED [1] test_marks.py:14: windows only
XFAIL test_marks.py::test_known_bug - known bug: vlan 1002 handling under review
2 passed, 2 skipped, 1 xfailed, 1 xpassed in 0.07s</pre>
<ul>
<li><b>skip</b> test kabhi nahi chalata aur <code>-rs</code> ke saath reason dikhata hai. Use temporarily namumkin cheez ke liye karo, jaise maintenance mein router.</li>
<li><b>skipif</b> kisi condition par skip karta hai, jaise operating system.</li>
<li><b>xfail</b> ka matlab "fail hone ki ummeed". Failing xfail test <code>XFAIL</code> hota hai aur run ko red nahi karta. Yeh known bug ko document karta hai. Agar woh achanak pass ho jaye to <code>XPASS</code> dikhta hai, aapka signal ki mark hata do kyunki bug fix ho gaya.</li>
<li><code>slow</code> jaisa custom mark sirf label hai. Label se <code>-m</code> ke saath chuno:</li>
</ul>
<pre class="out">AUTO01$ pytest -q -m slow test_marks.py
.                                                                        [100%]
1 passed in 0.02s
AUTO01$ pytest -q -m "not slow" test_marks.py
ssxX.                                                                    [100%]
1 passed, 2 skipped, 1 xfailed, 1 xpassed in 0.06s</pre>
<div class="note"><p><b>Reference (not run in the simulator).</b> Asli server par custom marks ko <code>pytest.ini</code> naam ki file mein register karo taaki pytest anjaan mark par warning na de:</p>
<pre class="code">[pytest]
markers =
    slow: takes more than a second
    live: needs a real device</pre>
<p>Teams ka aam rule hai: router chahiye wale tests par <code>live</code> mark, aur rozana tez run ke liye <code>pytest -m "not live"</code>.</p></div>

<h3>Aisa code design karo jise test karna aasan ho</h3>
<p><code>netlib.py</code> ka har function ek idea follow karta hai: <b>beech mein pure logic, kinare par input aur output</b>.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Beech mein pure functions, charon taraf SSH, files aur printing ke edges">
<rect x="20" y="15" width="600" height="160" rx="14" fill="#e2e8f0"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">edges: fake, tmp folder ya capsys chahiye</text>
<rect x="60" y="55" width="140" height="45" rx="8" fill="#fed7aa"/><text x="130" y="83" text-anchor="middle" class="svg-ink" font-size="12">connect (SSH)</text>
<rect x="250" y="55" width="140" height="45" rx="8" fill="#fed7aa"/><text x="320" y="83" text-anchor="middle" class="svg-ink" font-size="12">save_backup (file)</text>
<rect x="440" y="55" width="140" height="45" rx="8" fill="#fed7aa"/><text x="510" y="83" text-anchor="middle" class="svg-ink" font-size="12">print_report</text>
<rect x="110" y="115" width="420" height="50" rx="10" fill="#bbf7d0"/><text x="320" y="137" text-anchor="middle" class="svg-ink" font-size="12">pure core: valid_vlan, vlan_range, parse_brief, interfaces_down</text><text x="320" y="154" text-anchor="middle" class="svg-muted" font-size="11">text andar, data bahar, network nahi, files nahi</text>
</svg><p class="cap">Core ko plain asserts se test karo; edges ko tools se.</p></div>
<table class="cmp"><tr><th>Function</th><th>Kism</th><th>Test kaise karein</th></tr>
<tr><td><code>valid_vlan</code>, <code>vlan_range</code></td><td>Pure</td><td>asserts, parametrize, raises</td></tr>
<tr><td><code>parse_brief</code>, <code>interfaces_down</code></td><td>Pure (text andar, data bahar)</td><td>sample output wala fixture</td></tr>
<tr><td><code>save_backup</code></td><td>File edge</td><td><code>tmp_path</code></td></tr>
<tr><td><code>connect</code></td><td>SSH edge</td><td>fake se badla gaya</td></tr>
<tr><td><code>read_hostname</code></td><td>Logic, connection bahar se diya hua</td><td>fake object pass karo</td></tr>
</table>
<p>Aise design se compare karo jo test karna mushkil hai: ek function jo ek hi block mein connect, parse aur print karta hai. Tab ek hi test hai, "router par chalao". Upar ki tarah baant do, to parser das-row ki table ban jaata hai. Jab lage ki function test karna takleef hai, to woh code keh raha hai ki woh bahut cheezein karta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Bug fix hone ke baad bhi <code>xfail</code> marks hamesha ke liye chhod dena. Flaky test ko theek karne ki jagah chhupane ke liye <code>skip</code> use karna. Bahut broad <code>-k</code> expression jo aise tests chalaye jo aap nahi chahte the. Aisa function likhna jo ek block mein fetch, parse aur print kare, phir har cheez ke liye fake se test karne ki koshish karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>-k</code> naam (aur ids) match karta hai, <code>-m</code> marks. <code>XFAIL</code> run ko fail nahi karta par <code>XPASS</code> safai ka signal hai. <code>--collect-only</code> bina chalaye tests list karta hai.</p></div>

<div class="scn"><h4>Nightly run jo chalis minute chala</h4><p>Ek suite mein tez parser tests aur asli switches mein login karne wale checks mile hue the. Engineers ne commit se pehle ise chalana band kar diya. Live checks par <code>live</code> mark lagne ke baad rozana run <code>pytest -m "not live"</code> ho gaya aur do second se kam mein khatam hone laga, jabki live checks har change window se pehle ek baar chalte the.</p><p><b>Lesson:</b> slow suite chalayi nahi jaati; use baanto taaki tez hissa har save par chale.</p></div>

<div class="iv"><p class="q">"Code ko unit test karne layak kaise banate ho?"</p><p>Parsing aur validation ko pure functions rakhta hoon, text andar data bahar, aur SSH, file writes aur printing ko patle edge functions mein dhakelta hoon. Pure functions asserts aur parametrize se test hote hain; edges fakes, tmp_path aur capsys se. Isse -k ya mark se tez subset chalana bhi aasan ho jaata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>pytest -q</code> sab chalata hai; lab suite 22 tests ki hai, aur <code>-k 'backup or conn or range'</code> 5 chunta hai.</li>
<li><code>-k</code> naam aur ids ko and, or, not se match karta hai; <code>--collect-only</code> selection ka preview deta hai.</li>
<li><code>skip</code>, <code>skipif</code> aur <code>xfail</code> yaad rakhte hain ki test kyon count nahi hota; <code>-rsx</code> reasons print karta hai.</li>
<li>Custom marks aur <code>-m</code> tez tests ko live tests se alag karte hain.</li>
<li>Core mein pure logic aur kinare par I/O code ko test karne layak banata hai.</li>
</ul></div>
`}};export{e as default};