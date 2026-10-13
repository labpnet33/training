var e={id:`workflow`,h:{en:`Troubleshooting a red suite: the workflow and both labs`,hi:`Red suite troubleshoot karna: workflow aur dono labs`},body:{en:`
<p>Writing tests is half the skill. The other half is <b>reading a failing run and fixing the right thing</b>. This chapter gives you a repeatable workflow, then walks through the two labs on host AUTO using the exact file name (<code>vlan_tools.py</code>), the line numbers and the commands you will type.</p>

<h3>Analogy: a doctor reading a lab report</h3>
<p>A doctor does not panic at a red value; she reads which test, what the expected range was, then decides whether the patient or the measurement is wrong. A failing test is the same: it is a <i>report</i>, not a verdict on your talent. Read it in order.</p>

<h3>The red-suite workflow</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Workflow for a failing test">
<rect x="10" y="50" width="95" height="70" rx="8" fill="#bae6fd"/><text x="57" y="80" text-anchor="middle" class="svg-ink" font-size="12" font-weight="bold">1 Summary</text><text x="57" y="100" text-anchor="middle" class="svg-ink" font-size="11">Ran N, M failed</text>
<rect x="120" y="50" width="95" height="70" rx="8" fill="#ddd6fe"/><text x="167" y="80" text-anchor="middle" class="svg-ink" font-size="12" font-weight="bold">2 Which</text><text x="167" y="100" text-anchor="middle" class="svg-ink" font-size="11">FAIL test_name</text>
<rect x="230" y="50" width="95" height="70" rx="8" fill="#bbf7d0"/><text x="277" y="80" text-anchor="middle" class="svg-ink" font-size="12" font-weight="bold">3 Why</text><text x="277" y="100" text-anchor="middle" class="svg-ink" font-size="11">read the assert</text>
<rect x="340" y="50" width="95" height="70" rx="8" fill="#fde68a"/><text x="387" y="80" text-anchor="middle" class="svg-ink" font-size="12" font-weight="bold">4 Decide</text><text x="387" y="100" text-anchor="middle" class="svg-ink" font-size="11">code or test?</text>
<rect x="450" y="50" width="85" height="70" rx="8" fill="#fed7aa"/><text x="492" y="80" text-anchor="middle" class="svg-ink" font-size="12" font-weight="bold">5 Fix</text><text x="492" y="100" text-anchor="middle" class="svg-ink" font-size="11">smallest change</text>
<rect x="548" y="50" width="85" height="70" rx="8" fill="#e2e8f0"/><text x="590" y="80" text-anchor="middle" class="svg-ink" font-size="12" font-weight="bold">6 Rerun</text><text x="590" y="100" text-anchor="middle" class="svg-ink" font-size="11">whole suite</text>
</svg><p class="cap">Never skip step 6: a fix for one test can break another.</p></div>
<ol>
<li><b>Read the summary line.</b> "Ran 6 tests, 4 failed" tells you the size of the problem. Did the count of tests change?</li>
<li><b>Find which tests failed.</b> The names describe behaviours: <code>test_lowest_vlan</code> and <code>test_highest_vlan</code> failing while <code>test_middle_vlan</code> passes already points to the edges.</li>
<li><b>Read the failing assert.</b> What value was expected and what did the code give? Failure messages are clues; <code>AssertionError</code> means a wrong answer, any other exception name (<code>TypeError</code>, <code>NameError</code>, <code>IndentationError</code>) means the test or code crashed.</li>
<li><b>Decide whether the code or the test is wrong.</b> The requirement is the judge. If the test states the requirement correctly, fix the code. Change a test only when the requirement itself was misunderstood, and say why in the commit message.</li>
<li><b>Make the smallest fix</b> and nothing else. One change, then run.</li>
<li><b>Rerun the whole suite</b> and watch the counts fall: 4 failed, 2 failed, 1 failed, 0 failed.</li>
</ol>
<div class="warn"><p><b>Common mistakes.</b> Deleting or loosening a failing test to get green. Changing three things before rerunning, so you cannot tell what helped. Fixing the code but not rerunning the other tests. Treating <code>IndentationError</code> as a logic bug: it just means the spaces before a line are wrong.</p></div>

<h3>Lab 1: write and run unit tests for a VLAN validator</h3>
<p>On host AUTO the file <code>vlan_tools.py</code> already holds two working functions, two passing tests and three placeholders. The runner at the bottom prints PASS or FAIL for each and the summary. Run it:</p>
<pre class="code">AUTO&gt; python3 vlan_tools.py
AUTO&gt; nl vlan_tools.py                           <span class="c"># show line numbers</span></pre>
<pre class="out">PASS test_normal_vlan
PASS test_config_lines
FAIL test_limits - TODO 1: assert that VLAN 1 and VLAN 4094 are both valid
FAIL test_rejects_bad_ids - TODO 2: assert that 0, 4095 and the text 10 are NOT valid
FAIL test_bad_id_raises - expected ValueError for VLAN 5000
<span class="hl">Ran 5 tests, 3 failed</span>
RESULT: FAILED</pre>
<p>Replace each placeholder by editing its line. <code>edit FILE N TEXT</code> replaces line N, and the spaces after N are kept as indentation, so type four spaces for code inside a function:</p>
<pre class="code">AUTO&gt; edit vlan_tools.py 27     assert is_valid_vlan(1) and is_valid_vlan(4094)
AUTO&gt; edit vlan_tools.py 31     assert not is_valid_vlan(0) and not is_valid_vlan(4095) and not is_valid_vlan("10")
AUTO&gt; edit vlan_tools.py 36         make_vlan_config(5000, "X")     <span class="c"># 8 spaces: inside def and try</span>
AUTO&gt; python3 vlan_tools.py</pre>
<pre class="out">PASS test_normal_vlan
PASS test_config_lines
PASS test_limits
PASS test_rejects_bad_ids
PASS test_bad_id_raises
<span class="hl">Ran 5 tests, 0 failed</span>
RESULT: OK</pre>
<p>The third test is the "assertRaises" idea written by hand: the call inside <code>try</code> must raise <code>ValueError</code>; the <code>except</code> catches it and returns (pass); if nothing is raised the function falls through to <code>raise AssertionError</code> (fail).</p>
<p><b>The break-it step.</b> To prove the tests protect you, damage the code on purpose and run again:</p>
<pre class="code">AUTO&gt; sed -i 's/&lt;= 4094/&lt;= 4093/' vlan_tools.py
AUTO&gt; python3 vlan_tools.py</pre>
<pre class="out">PASS test_normal_vlan
PASS test_config_lines
<span class="hl">FAIL test_limits -</span>
PASS test_rejects_bad_ids
PASS test_bad_id_raises
Ran 5 tests, 1 failed</pre>
<p>Only <code>test_limits</code> catches it, because only that test uses VLAN 4094. This is a <b>regression</b> caught in seconds. Undo with the reverse <code>sed</code> and rerun to see green. Notice that the sed pattern includes <code>&lt;= </code> so it only changes the code, not the test that mentions 4094.</p>

<h3>Lab 2: red to green</h3>
<p>This lab is TDD in action. The six tests exist; the code is wrong or unfinished.</p>
<pre class="out">PASS test_middle_vlan
<span class="hl">FAIL test_lowest_vlan -</span>
<span class="hl">FAIL test_highest_vlan -</span>
PASS test_rejects_zero_and_4095
<span class="hl">FAIL test_parse_list -</span>
<span class="hl">FAIL test_list_rejects_bad_id - expected ValueError for 5000</span>
Ran 6 tests, 4 failed</pre>
<ol>
<li><b>Boundary bug.</b> Line 6 says <code>1 &lt; vid &lt; 4094</code>. Fix: <code>edit vlan_tools.py 6     return isinstance(vid, int) and 1 &lt;= vid &lt;= 4094</code>. Rerun: 2 failed.</li>
<li><b>Finish the parser.</b> Replace the TODO comments on lines 12 and 13 with a loop, convert each part with <code>int(part.strip())</code> into the variable <code>vid</code> and append it (<code>edit</code> lines 12 and 13, then <code>insert vlan_tools.py 14</code> the append line). Rerun: 1 failed, because a bad id such as 5000 is not refused yet.</li>
<li><b>Add the check.</b> Insert before the append: <code>if not is_valid_vlan(vid):</code> and the line <code>raise ValueError(f"bad VLAN id {vid}")</code> (<code>insert</code> at 14, then at 15). Rerun: <b>Ran 6 tests, 0 failed</b>. Green.</li>
</ol>
<p>The counts fell 4, 2, 1, 0. Each step changed one thing, and you never touched the tests. That is what makes a green suite trustworthy.</p>
<div class="tip"><p><b>Commit at green.</b> On a real project you would now commit with a message such as "Fix VLAN range edges and add parse_vlan_list" and open a pull request. The previous chapters on version control and the following ones on review show where that goes.</p></div>
<div class="exam"><p><b>Exam trap.</b> If the question shows a failing run and asks for the next step, the answer is to read what the assertion expected and fix the code to meet the requirement, not to edit the expected value so the test passes. Also note that a count mismatch ("Ran 5 tests" when you wrote 6) means a test was never collected.</p></div>

<div class="scn"><h4>Green for the wrong reason</h4><p>An engineer fixed a failing VLAN-range test by changing the expected value from 4094 to 4093. The suite went green, the change was merged and a management VLAN 4094 failed in production. In the review the team added a rule: a test edit must reference a requirement change, and a second person checks it.</p><p><b>Lesson:</b> a test encodes the requirement. Changing it silently changes the requirement.</p></div>
<div class="iv"><p class="q">"A test is failing after your change. What do you do?"</p><p>Read the summary and the failing test name, read the assertion to see expected versus actual, and decide whether the code or the test misstates the requirement. Fix the smallest thing, rerun the whole suite, and only then commit. Never weaken a test just to get green. Mention that a failing test caught before release is the test doing its job.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: summary, which test, why, code or test, smallest fix, rerun everything.</li>
<li>AssertionError means a wrong answer; other exception names mean something crashed.</li>
<li>Fix the code to meet the requirement; do not loosen the test.</li>
<li>Breaking the code on purpose proves a test really protects you.</li>
<li>Counts that fall (4, 2, 1, 0) show steady, controlled progress.</li>
</ul></div>
`,hi:`
<p>Tests likhna aadhi skill hai. Baaki aadhi hai <b>failing run ko padhna aur sahi cheez fix karna</b>. Yeh chapter aapko ek repeatable workflow deta hai, phir AUTO host ke dono labs ko exact file name (<code>vlan_tools.py</code>), line numbers aur commands ke saath walk through karta hai jo aap type karoge.</p>

<h3>Analogy: lab report padhta doctor</h3>
<p>Doctor laal value dekh kar ghabrati nahi; woh padhti hai kaun sa test, umeed ki range kya thi, phir tay karti hai ki patient galat hai ya measurement. Failing test bhi aisa hi hai: yeh ek <i>report</i> hai, aapki kabiliyat par faisla nahi. Ise order mein padho.</p>

<h3>Red-suite workflow</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Failing test ka workflow">
<rect x="10" y="50" width="95" height="70" rx="8" fill="#bae6fd"/><text x="57" y="80" text-anchor="middle" class="svg-ink" font-size="12" font-weight="bold">1 Summary</text><text x="57" y="100" text-anchor="middle" class="svg-ink" font-size="11">Ran N, M failed</text>
<rect x="120" y="50" width="95" height="70" rx="8" fill="#ddd6fe"/><text x="167" y="80" text-anchor="middle" class="svg-ink" font-size="12" font-weight="bold">2 Kaun sa</text><text x="167" y="100" text-anchor="middle" class="svg-ink" font-size="11">FAIL test_name</text>
<rect x="230" y="50" width="95" height="70" rx="8" fill="#bbf7d0"/><text x="277" y="80" text-anchor="middle" class="svg-ink" font-size="12" font-weight="bold">3 Kyun</text><text x="277" y="100" text-anchor="middle" class="svg-ink" font-size="11">assert padho</text>
<rect x="340" y="50" width="95" height="70" rx="8" fill="#fde68a"/><text x="387" y="80" text-anchor="middle" class="svg-ink" font-size="12" font-weight="bold">4 Decide</text><text x="387" y="100" text-anchor="middle" class="svg-ink" font-size="11">code ya test?</text>
<rect x="450" y="50" width="85" height="70" rx="8" fill="#fed7aa"/><text x="492" y="80" text-anchor="middle" class="svg-ink" font-size="12" font-weight="bold">5 Fix</text><text x="492" y="100" text-anchor="middle" class="svg-ink" font-size="11">sabse chhota</text>
<rect x="548" y="50" width="85" height="70" rx="8" fill="#e2e8f0"/><text x="590" y="80" text-anchor="middle" class="svg-ink" font-size="12" font-weight="bold">6 Rerun</text><text x="590" y="100" text-anchor="middle" class="svg-ink" font-size="11">poori suite</text>
</svg><p class="cap">Step 6 kabhi mat chhodo: ek test ka fix doosra tod sakta hai.</p></div>
<ol>
<li><b>Summary line padho.</b> "Ran 6 tests, 4 failed" problem ka size batata hai. Kya tests ki ginti badli?</li>
<li><b>Kaun se tests fail hue dhoondho.</b> Naam behaviours batate hain: <code>test_lowest_vlan</code> aur <code>test_highest_vlan</code> fail aur <code>test_middle_vlan</code> pass ho to edges ki taraf ishara hai.</li>
<li><b>Failing assert padho.</b> Kya value umeed thi aur code ne kya diya? Failure messages clues hain; <code>AssertionError</code> matlab galat jawab, koi aur exception naam (<code>TypeError</code>, <code>NameError</code>, <code>IndentationError</code>) matlab test ya code crash hua.</li>
<li><b>Tay karo code galat hai ya test.</b> Requirement judge hai. Agar test requirement sahi likhta hai to code fix karo. Test tabhi badlo jab requirement hi galat samjhi gayi thi, aur commit message mein wajah likho.</li>
<li><b>Sabse chhota fix karo</b> aur kuch nahi. Ek change, phir run.</li>
<li><b>Poori suite dobara chalao</b> aur counts girte dekho: 4 failed, 2 failed, 1 failed, 0 failed.</li>
</ol>
<div class="warn"><p><b>Aam galtiyan.</b> Green paane ke liye failing test delete ya dhila karna. Rerun se pehle teen cheezein badalna, jisse pata nahi chalta kya kaam aaya. Code fix karke baaki tests dobara na chalana. <code>IndentationError</code> ko logic bug samajhna: iska matlab sirf line ke pehle ke spaces galat hain.</p></div>

<h3>Lab 1: VLAN validator ke liye unit tests likho aur chalao</h3>
<p>AUTO host par <code>vlan_tools.py</code> file mein pehle se do chalte functions, do pass hone wale tests aur teen placeholders hain. Neeche ka runner har ek ke liye PASS ya FAIL aur summary print karta hai. Chalao:</p>
<pre class="code">AUTO&gt; python3 vlan_tools.py
AUTO&gt; nl vlan_tools.py                           <span class="c"># line numbers dikhao</span></pre>
<pre class="out">PASS test_normal_vlan
PASS test_config_lines
FAIL test_limits - TODO 1: assert that VLAN 1 and VLAN 4094 are both valid
FAIL test_rejects_bad_ids - TODO 2: assert that 0, 4095 and the text 10 are NOT valid
FAIL test_bad_id_raises - expected ValueError for VLAN 5000
<span class="hl">Ran 5 tests, 3 failed</span>
RESULT: FAILED</pre>
<p>Har placeholder ko uski line edit karke badlo. <code>edit FILE N TEXT</code> line N badalta hai, aur N ke baad ke spaces indentation ke roop mein rehte hain, isliye function ke andar ke code ke liye chaar spaces type karo:</p>
<pre class="code">AUTO&gt; edit vlan_tools.py 27     assert is_valid_vlan(1) and is_valid_vlan(4094)
AUTO&gt; edit vlan_tools.py 31     assert not is_valid_vlan(0) and not is_valid_vlan(4095) and not is_valid_vlan("10")
AUTO&gt; edit vlan_tools.py 36         make_vlan_config(5000, "X")     <span class="c"># 8 spaces: def aur try ke andar</span>
AUTO&gt; python3 vlan_tools.py</pre>
<pre class="out">PASS test_normal_vlan
PASS test_config_lines
PASS test_limits
PASS test_rejects_bad_ids
PASS test_bad_id_raises
<span class="hl">Ran 5 tests, 0 failed</span>
RESULT: OK</pre>
<p>Teesra test haath se likha "assertRaises" idea hai: <code>try</code> ke andar ka call <code>ValueError</code> raise kare; <code>except</code> use pakadta hai aur return karta hai (pass); kuch raise na ho to function <code>raise AssertionError</code> par pahunchta hai (fail).</p>
<p><b>Todne wala step.</b> Saabit karne ke liye ki tests aapko bachate hain, code ko jaan-boojh kar bigaado aur dobara chalao:</p>
<pre class="code">AUTO&gt; sed -i 's/&lt;= 4094/&lt;= 4093/' vlan_tools.py
AUTO&gt; python3 vlan_tools.py</pre>
<pre class="out">PASS test_normal_vlan
PASS test_config_lines
<span class="hl">FAIL test_limits -</span>
PASS test_rejects_bad_ids
PASS test_bad_id_raises
Ran 5 tests, 1 failed</pre>
<p>Sirf <code>test_limits</code> pakadta hai, kyunki sirf wahi test VLAN 4094 use karta hai. Yeh ek <b>regression</b> hai jo seconds mein pakda gaya. Ulta <code>sed</code> chala kar undo karo aur green dekhne ke liye dobara chalao. Dhyan do ki sed pattern mein <code>&lt;= </code> shamil hai, isliye woh sirf code badalta hai, us test ko nahi jo 4094 mention karta hai.</p>

<h3>Lab 2: red se green</h3>
<p>Yeh lab TDD ka kaam hai. Chhe tests maujood hain; code galat ya adhoora hai.</p>
<pre class="out">PASS test_middle_vlan
<span class="hl">FAIL test_lowest_vlan -</span>
<span class="hl">FAIL test_highest_vlan -</span>
PASS test_rejects_zero_and_4095
<span class="hl">FAIL test_parse_list -</span>
<span class="hl">FAIL test_list_rejects_bad_id - expected ValueError for 5000</span>
Ran 6 tests, 4 failed</pre>
<ol>
<li><b>Boundary bug.</b> Line 6 mein <code>1 &lt; vid &lt; 4094</code> hai. Fix: <code>edit vlan_tools.py 6     return isinstance(vid, int) and 1 &lt;= vid &lt;= 4094</code>. Rerun: 2 failed.</li>
<li><b>Parser poora karo.</b> Line 12 aur 13 ke TODO comments ko loop se badlo, har part ko <code>int(part.strip())</code> se variable <code>vid</code> mein badlo aur append karo (lines 12 aur 13 par <code>edit</code>, phir <code>insert vlan_tools.py 14</code> se append line). Rerun: 1 failed, kyunki 5000 jaisa bad id abhi refuse nahi hota.</li>
<li><b>Check jodo.</b> Append se pehle daalo: <code>if not is_valid_vlan(vid):</code> aur line <code>raise ValueError(f"bad VLAN id {vid}")</code> (<code>insert</code> 14 par, phir 15 par). Rerun: <b>Ran 6 tests, 0 failed</b>. Green.</li>
</ol>
<p>Counts 4, 2, 1, 0 gire. Har step ne ek cheez badli, aur aapne tests ko kabhi nahi chhua. Yahi green suite ko bharose ke laayak banata hai.</p>
<div class="tip"><p><b>Green par commit karo.</b> Asli project mein ab aap "Fix VLAN range edges and add parse_vlan_list" jaise message se commit karte aur pull request kholte. Version control wala pichhla chapter aur review wale agle chapters dikhate hain ki woh kahan jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Agar question failing run dikhaye aur agla step poochhe, to jawab hai dekhna ki assertion ne kya umeed ki thi aur code ko requirement poori karne ke liye fix karna, expected value badal kar test pass karana nahi. Yeh bhi note karo ki count mismatch ("Ran 5 tests" jabki aapne 6 likhe) ka matlab hai koi test collect hi nahi hua.</p></div>

<div class="scn"><h4>Galat wajah se green</h4><p>Ek engineer ne failing VLAN-range test ko expected value 4094 se 4093 karke fix kiya. Suite green ho gayi, change merge ho gaya aur production mein management VLAN 4094 fail ho gaya. Review mein team ne rule jodha: test edit ko requirement change ka reference dena hoga, aur doosra insaan use check karega.</p><p><b>Lesson:</b> test requirement ko encode karta hai. Use chupchaap badalna requirement ko badalna hai.</p></div>
<div class="iv"><p class="q">"Aapke change ke baad ek test fail ho raha hai. Kya karoge?"</p><p>Main summary aur failing test ka naam padhta hoon, assertion se expected versus actual dekhta hoon, aur tay karta hoon ki code ya test requirement galat batata hai. Sabse chhoti cheez fix karta hoon, poori suite dobara chalata hoon, aur tabhi commit karta hoon. Sirf green paane ke liye test kabhi dhila nahi karta. Bolo ki release se pehle pakda gaya failing test apna kaam kar raha hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: summary, kaun sa test, kyun, code ya test, sabse chhota fix, sab dobara chalao.</li>
<li>AssertionError matlab galat jawab; doosre exception naam matlab kuch crash hua.</li>
<li>Requirement poori karne ke liye code fix karo; test dhila mat karo.</li>
<li>Code jaan-boojh kar todna saabit karta hai ki test sach mein bachata hai.</li>
<li>Girte counts (4, 2, 1, 0) steady, controlled progress dikhate hain.</li>
</ul></div>
`}};export{e as default};