var e={id:`parametrize`,h:{en:`parametrize: one test, a whole table of cases`,hi:`parametrize: ek test, cases ki poori table`},body:{en:`
<p><b>The idea of this chapter:</b> in Chapter 2 you wrote four tests that all do the same thing with different numbers. That is a table in disguise. <code>@pytest.mark.parametrize</code> lets you write the logic once and list the cases as rows. You will build the ten-row VLAN table for Lab 1, task 2, and see why boundary values are the rows that matter.</p>

<h3>Analogy: a routing table</h3>
<p>A router has one lookup engine and many routes. You do not write a new engine per route; you add a row. A parametrized test is the same: one engine (the assert) and a table of rows (input and expected answer). A new case is one more row.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="One test function fed by ten rows becomes ten test results">
<rect x="20" y="20" width="200" height="130" rx="10" fill="#bae6fd"/><text x="120" y="42" text-anchor="middle" class="svg-ink" font-size="13">the table</text>
<text x="120" y="66" text-anchor="middle" class="svg-muted" font-size="11">(1, True)</text><text x="120" y="82" text-anchor="middle" class="svg-muted" font-size="11">(1002, False)</text><text x="120" y="98" text-anchor="middle" class="svg-muted" font-size="11">(4094, True)</text><text x="120" y="114" text-anchor="middle" class="svg-muted" font-size="11">(4095, False)</text><text x="120" y="134" text-anchor="middle" class="svg-muted" font-size="11">... ten rows</text>
<rect x="260" y="50" width="140" height="70" rx="10" fill="#fde68a"/><text x="330" y="80" text-anchor="middle" class="svg-ink" font-size="12">test_vlan_table</text><text x="330" y="100" text-anchor="middle" class="svg-muted" font-size="11">written once</text>
<rect x="440" y="20" width="180" height="130" rx="10" fill="#bbf7d0"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="13">ten results</text><text x="530" y="70" text-anchor="middle" class="svg-muted" font-size="11">test_vlan_table[1-True]</text><text x="530" y="90" text-anchor="middle" class="svg-muted" font-size="11">test_vlan_table[1002-False]</text><text x="530" y="110" text-anchor="middle" class="svg-muted" font-size="11">each passes or fails alone</text>
<line x1="220" y1="85" x2="260" y2="85" stroke="#64748b" stroke-width="2"/><line x1="400" y1="85" x2="440" y2="85" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">One function, ten rows, ten separate results.</p></div>

<h3>The table for valid_vlan</h3>
<p>Write <code>test_table.py</code>:</p>
<pre class="code">import pytest

from netlib import valid_vlan


@pytest.mark.parametrize("vid, ok", [(1, True), (10, True), (1001, True), (1002, False), (1005, False), (1006, True), (4094, True), (4095, False), (0, False), (-5, False)])
def test_vlan_table(vid, ok):
    assert valid_vlan(vid) is ok</pre>
<ul>
<li><code>"vid, ok"</code> is a string of argument names, separated by commas.</li>
<li>The list holds one tuple per case: the first item goes to <code>vid</code>, the second to <code>ok</code>.</li>
<li>The test function must take arguments with exactly those names. pytest calls it once per tuple.</li>
<li>The assert stays one line. To add a case you add a tuple, not a function.</li>
</ul>
<pre class="out">AUTO01$ pytest -q test_table.py
..........                                                               [100%]
<span class="hl">10 passed in 0.11s</span>
AUTO01$ pytest -v test_table.py
============================= test session starts ==============================
platform linux -- Python 3.12.0, pytest-7.4.4, pluggy-1.3.0 -- /usr/bin/python3
cachedir: .pytest_cache
rootdir: /home/netadmin
collected 10 items

test_table.py::test_vlan_table[1-True] PASSED                            [ 10%]
test_table.py::test_vlan_table[10-True] PASSED                           [ 20%]
test_table.py::test_vlan_table[1001-True] PASSED                         [ 30%]
test_table.py::test_vlan_table[1002-False] PASSED                        [ 40%]
test_table.py::test_vlan_table[1005-False] PASSED                        [ 50%]
test_table.py::test_vlan_table[1006-True] PASSED                         [ 60%]
test_table.py::test_vlan_table[4094-True] PASSED                         [ 70%]
test_table.py::test_vlan_table[4095-False] PASSED                        [ 80%]
test_table.py::test_vlan_table[0-False] PASSED                           [ 90%]
test_table.py::test_vlan_table[-5-False] PASSED                          [100%]

============================== 10 passed in 0.11s ==============================</pre>
<p>Ten rows, ten results. The id in brackets is built from the values, so <code>[1002-False]</code> tells you which row it was. Answer to task 2: <b>10 passed</b>.</p>

<h3>Choosing the rows: boundaries first</h3>
<p>A good table is not ten random numbers. Network rules have edges, and bugs live on the edges:</p>
<table class="cmp"><tr><th>Rule</th><th>Rows to include</th></tr>
<tr><td>Range 1 to 4094</td><td>0, 1, 4094, 4095</td></tr>
<tr><td>Reserved 1002 to 1005</td><td>1001, 1002, 1005, 1006</td></tr>
<tr><td>Nonsense</td><td>-5 (negative); a string or a float would be a row too</td></tr>
<tr><td>Normal value</td><td>10, so one ordinary VLAN proves the happy path</td></tr>
</table>
<p>For every edge test the last good value and the first bad one. That single habit catches the classic mistake of <code>&lt;</code> where <code>&lt;=</code> was meant.</p>

<h3>One bad row does not hide the others</h3>
<p>Suppose the table says <code>(1005, True)</code> by mistake. Only that row fails, and its id names it:</p>
<pre class="out">AUTO01$ pytest -q test_wrongrow.py
.F..                                                                     [100%]

=================================== FAILURES ===================================
_____________________________ test_row[1005-True] ______________________________

    @pytest.mark.parametrize("vid, ok", [(1, True), (1005, True), (4094, True), (4095, False)])
    def test_row(vid, ok):
&gt;       assert valid_vlan(vid) is ok
E       assert False is True
E        +  where False = valid_vlan(1005)

test_wrongrow.py:8: AssertionError
=========================== short test summary info ============================
FAILED test_wrongrow.py::test_row[1005-True] - assert False is True
<span class="hl">1 failed, 3 passed in 0.05s</span></pre>
<p>Compare this with a loop inside one test: a loop stops at the first bad value and hides the rest. Parametrize runs every row and reports each separately.</p>

<h3>Readable ids and stacked tables</h3>
<p>When the values are not self-explanatory, name the rows with <code>pytest.param(..., id="...")</code>:</p>
<pre class="code">@pytest.mark.parametrize("vid, ok", [
    pytest.param(1, True, id="first"),
    pytest.param(1002, False, id="reserved-low"),
    pytest.param(1005, False, id="reserved-high"),
    pytest.param(4095, False, id="too-big"),
])
def test_ids(vid, ok):
    assert valid_vlan(vid) is ok</pre>
<pre class="out">AUTO01$ pytest -v test_ids.py
test_ids.py::test_ids[first] PASSED                                      [ 25%]
test_ids.py::test_ids[reserved-low] PASSED                               [ 50%]
test_ids.py::test_ids[reserved-high] PASSED                              [ 75%]
test_ids.py::test_ids[too-big] PASSED                                    [100%]</pre>
<p>(These are the test lines of the verbose run; the header above them is the one you saw in Chapter 2.) You can also stack two decorators. Two values for one argument and three for another multiply to six tests.</p>

<div class="warn"><p><b>Common mistakes.</b> Argument names in the string that do not match the function arguments. Putting expected values and inputs in different orders in different rows. Copying a wrong expected value from the code instead of from the rule (then the test only repeats the bug). Using a loop inside one test and losing the per-row result.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>parametrize</code> creates <i>separate tests</i>, so the summary counts them separately: ten rows are "10 passed". The decorator belongs directly above the <code>def</code> and its first argument is a string of names, not a list of values.</p></div>

<div class="scn"><h4>The reserved range nobody tested</h4><p>A branch rollout script accepted VLAN 1003 and the switch refused it with a long error. The unit test had only five happy-path ids. After the team added a table with the four reserved ids and the two range edges, three more bugs surfaced in the helper before the next rollout.</p><p><b>Lesson:</b> a table of edge cases is cheap, and each row is a promise about the rule.</p></div>

<div class="iv"><p class="q">"How do you test a function with many input cases?"</p><p>With parametrize: one test function and a table of input and expected pairs, so each row is its own test with its own id. I pick boundary values, like the last valid and first invalid VLAN, and a few nonsense inputs. A failure names the row.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Write the logic once; put the cases in a <code>parametrize</code> table.</li>
<li>Each row is a separate test with an id such as <code>[1002-False]</code>.</li>
<li>Test the last good and first bad value of every boundary.</li>
<li>One failing row does not hide the others, unlike a loop in one test.</li>
<li>Use <code>pytest.param(..., id="name")</code> when values alone are unclear.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> Chapter 2 mein aapne chaar tests likhe the jo alag numbers ke saath ek hi kaam karte hain. Yeh table hai jo bhes badal kar aayi hai. <code>@pytest.mark.parametrize</code> se logic ek baar likhte ho aur cases ko rows ki tarah list karte ho. Lab 1, task 2 ke liye das-row ki VLAN table banaoge aur dekhoge ki boundary values hi woh rows hain jo matter karti hain.</p>

<h3>Analogy: routing table</h3>
<p>Router mein ek lookup engine hota hai aur kai routes. Har route ke liye naya engine nahi likhte; row jodte ho. Parametrized test bhi waisa hi hai: ek engine (assert) aur rows ki table (input aur expected answer). Naya case matlab ek aur row.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Das rows se ek test function das test results banata hai">
<rect x="20" y="20" width="200" height="130" rx="10" fill="#bae6fd"/><text x="120" y="42" text-anchor="middle" class="svg-ink" font-size="13">table</text>
<text x="120" y="66" text-anchor="middle" class="svg-muted" font-size="11">(1, True)</text><text x="120" y="82" text-anchor="middle" class="svg-muted" font-size="11">(1002, False)</text><text x="120" y="98" text-anchor="middle" class="svg-muted" font-size="11">(4094, True)</text><text x="120" y="114" text-anchor="middle" class="svg-muted" font-size="11">(4095, False)</text><text x="120" y="134" text-anchor="middle" class="svg-muted" font-size="11">... das rows</text>
<rect x="260" y="50" width="140" height="70" rx="10" fill="#fde68a"/><text x="330" y="80" text-anchor="middle" class="svg-ink" font-size="12">test_vlan_table</text><text x="330" y="100" text-anchor="middle" class="svg-muted" font-size="11">ek baar likha</text>
<rect x="440" y="20" width="180" height="130" rx="10" fill="#bbf7d0"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="13">das results</text><text x="530" y="70" text-anchor="middle" class="svg-muted" font-size="11">test_vlan_table[1-True]</text><text x="530" y="90" text-anchor="middle" class="svg-muted" font-size="11">test_vlan_table[1002-False]</text><text x="530" y="110" text-anchor="middle" class="svg-muted" font-size="11">har ek akela pass ya fail</text>
<line x1="220" y1="85" x2="260" y2="85" stroke="#64748b" stroke-width="2"/><line x1="400" y1="85" x2="440" y2="85" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek function, das rows, das alag results.</p></div>

<h3>valid_vlan ki table</h3>
<p><code>test_table.py</code> likho:</p>
<pre class="code">import pytest

from netlib import valid_vlan


@pytest.mark.parametrize("vid, ok", [(1, True), (10, True), (1001, True), (1002, False), (1005, False), (1006, True), (4094, True), (4095, False), (0, False), (-5, False)])
def test_vlan_table(vid, ok):
    assert valid_vlan(vid) is ok</pre>
<ul>
<li><code>"vid, ok"</code> argument names ki string hai, commas se alag.</li>
<li>List mein har case ke liye ek tuple hai: pehla item <code>vid</code> ko jaata hai, doosra <code>ok</code> ko.</li>
<li>Test function ke arguments ke naam bilkul wahi hone chahiye. pytest use har tuple ke liye ek baar call karta hai.</li>
<li>Assert ek line ka rehta hai. Case jodne ke liye function nahi, tuple jodte ho.</li>
</ul>
<pre class="out">AUTO01$ pytest -q test_table.py
..........                                                               [100%]
<span class="hl">10 passed in 0.11s</span>
AUTO01$ pytest -v test_table.py
============================= test session starts ==============================
platform linux -- Python 3.12.0, pytest-7.4.4, pluggy-1.3.0 -- /usr/bin/python3
cachedir: .pytest_cache
rootdir: /home/netadmin
collected 10 items

test_table.py::test_vlan_table[1-True] PASSED                            [ 10%]
test_table.py::test_vlan_table[10-True] PASSED                           [ 20%]
test_table.py::test_vlan_table[1001-True] PASSED                         [ 30%]
test_table.py::test_vlan_table[1002-False] PASSED                        [ 40%]
test_table.py::test_vlan_table[1005-False] PASSED                        [ 50%]
test_table.py::test_vlan_table[1006-True] PASSED                         [ 60%]
test_table.py::test_vlan_table[4094-True] PASSED                         [ 70%]
test_table.py::test_vlan_table[4095-False] PASSED                        [ 80%]
test_table.py::test_vlan_table[0-False] PASSED                           [ 90%]
test_table.py::test_vlan_table[-5-False] PASSED                          [100%]

============================== 10 passed in 0.11s ==============================</pre>
<p>Das rows, das results. Bracket mein id values se banti hai, isliye <code>[1002-False]</code> batata hai ki kaunsi row thi. Task 2 ka jawab: <b>10 passed</b>.</p>

<h3>Rows chunna: pehle boundaries</h3>
<p>Achhi table das random numbers nahi hoti. Network rules ke kinare hote hain, aur bugs kinaron par rehte hain:</p>
<table class="cmp"><tr><th>Rule</th><th>Kaunsi rows shamil karein</th></tr>
<tr><td>Range 1 se 4094</td><td>0, 1, 4094, 4095</td></tr>
<tr><td>Reserved 1002 se 1005</td><td>1001, 1002, 1005, 1006</td></tr>
<tr><td>Bekaar input</td><td>-5 (negative); string ya float bhi ek row hoti</td></tr>
<tr><td>Normal value</td><td>10, taaki ek aam VLAN happy path saabit kare</td></tr>
</table>
<p>Har kinare ke liye aakhri sahi value aur pehli galat value test karo. Yahi ek aadat <code>&lt;=</code> ki jagah <code>&lt;</code> likhne ki classic galti pakad leti hai.</p>

<h3>Ek buri row baaki ko nahi chhupati</h3>
<p>Maan lo table mein galti se <code>(1005, True)</code> hai. Sirf wahi row fail hoti hai, aur uska id use naam se batata hai:</p>
<pre class="out">AUTO01$ pytest -q test_wrongrow.py
.F..                                                                     [100%]

=================================== FAILURES ===================================
_____________________________ test_row[1005-True] ______________________________

    @pytest.mark.parametrize("vid, ok", [(1, True), (1005, True), (4094, True), (4095, False)])
    def test_row(vid, ok):
&gt;       assert valid_vlan(vid) is ok
E       assert False is True
E        +  where False = valid_vlan(1005)

test_wrongrow.py:8: AssertionError
=========================== short test summary info ============================
FAILED test_wrongrow.py::test_row[1005-True] - assert False is True
<span class="hl">1 failed, 3 passed in 0.05s</span></pre>
<p>Ise ek test ke andar loop se compare karo: loop pehli buri value par ruk jaata hai aur baaki chhupa deta hai. Parametrize har row chalata hai aur har ek ko alag report karta hai.</p>

<h3>Padhne layak ids aur stacked tables</h3>
<p>Jab sirf values se samajh na aaye to rows ko <code>pytest.param(..., id="...")</code> se naam do:</p>
<pre class="code">@pytest.mark.parametrize("vid, ok", [
    pytest.param(1, True, id="first"),
    pytest.param(1002, False, id="reserved-low"),
    pytest.param(1005, False, id="reserved-high"),
    pytest.param(4095, False, id="too-big"),
])
def test_ids(vid, ok):
    assert valid_vlan(vid) is ok</pre>
<pre class="out">AUTO01$ pytest -v test_ids.py
test_ids.py::test_ids[first] PASSED                                      [ 25%]
test_ids.py::test_ids[reserved-low] PASSED                               [ 50%]
test_ids.py::test_ids[reserved-high] PASSED                              [ 75%]
test_ids.py::test_ids[too-big] PASSED                                    [100%]</pre>
<p>(Yeh verbose run ki test lines hain; unke upar ka header wahi hai jo Chapter 2 mein dekha.) Do decorators ko stack bhi kar sakte ho. Ek argument ki do values aur doosre ki teen values milkar chhe tests banati hain.</p>

<div class="warn"><p><b>Common mistakes.</b> String ke argument names ka function ke arguments se match na karna. Alag rows mein input aur expected value alag order mein likhna. Expected value rule se lene ki jagah code se copy karna (tab test sirf bug ko dohrata hai). Ek test mein loop use karke per-row result kho dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>parametrize</code> <i>alag tests</i> banata hai, isliye summary unhe alag ginti hai: das rows matlab "10 passed". Decorator seedha <code>def</code> ke upar aata hai aur uska pehla argument names ki string hai, values ki list nahi.</p></div>

<div class="scn"><h4>Reserved range jo kisi ne test nahi ki</h4><p>Ek branch rollout script ne VLAN 1003 accept kar liya aur switch ne lambe error ke saath refuse kiya. Unit test mein sirf paanch happy-path ids the. Team ne chaar reserved ids aur do range edges ki table jodi, to agle rollout se pehle helper ke teen aur bug nikal aaye.</p><p><b>Lesson:</b> edge cases ki table sasti hai, aur har row rule ka ek vaada hai.</p></div>

<div class="iv"><p class="q">"Bahut saare input cases wale function ko kaise test karte ho?"</p><p>Parametrize se: ek test function aur input-expected pairs ki table, to har row apne id ke saath alag test hai. Main boundary values chunta hoon, jaise aakhri valid aur pehla invalid VLAN, aur kuch bekaar inputs. Failure row ka naam batati hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Logic ek baar likho; cases <code>parametrize</code> table mein rakho.</li>
<li>Har row ek alag test hai, id jaise <code>[1002-False]</code>.</li>
<li>Har boundary ki aakhri sahi aur pehli galat value test karo.</li>
<li>Ek failing row baaki ko nahi chhupati, ek test ke loop ke ulat.</li>
<li>Jab sirf values saaf na hon to <code>pytest.param(..., id="name")</code> use karo.</li>
</ul></div>
`}};export{e as default};