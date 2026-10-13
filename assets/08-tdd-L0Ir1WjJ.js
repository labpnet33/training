var e={id:`tdd`,h:{en:`Testing basics and test-driven development (TDD)`,hi:`Testing ke basics aur test-driven development (TDD)`},body:{en:`
<p>Blueprint item 1.3 asks you to describe <b>test-driven development</b>. To understand it you first need to know what a test is. This chapter builds both ideas from the beginning, using plain Python <code>assert</code>. The next chapter moves to the <code>unittest</code> module the exam names.</p>

<h3>Analogy: the answer key written before the exam is taken</h3>
<p>A teacher who writes the answer key <i>first</i> knows exactly what a correct answer looks like before marking a single paper. TDD works the same way: you write the test (the answer key) before you write the code (the answer).</p>

<h3>What a test is</h3>
<p>An <b>automated test</b> is a small piece of code that runs your code and checks the result. If the result is what you expected, the test <b>passes</b>; if not, it <b>fails</b>. Python's <code>assert</code> statement is the simplest check: <code>assert expression</code> does nothing if the expression is true and raises <code>AssertionError</code> if it is false. You can add a message: <code>assert x == 3, "x should be 3"</code>.</p>
<pre class="code">def is_valid_vlan(vid):
    return isinstance(vid, int) and 1 &lt;= vid &lt;= 4094

def test_vlan_10_is_valid():
    assert is_valid_vlan(10)                    <span class="c"># expected: True</span>

def test_vlan_0_is_not_valid():
    assert not is_valid_vlan(0)                 <span class="c"># expected: False</span></pre>
<p>Each <code>test_</code> function checks <b>one behaviour</b>. A tiny <b>test runner</b> calls them all and prints the verdict. In Lab 1 you use a runner like this one:</p>
<pre class="out">PASS test_normal_vlan
PASS test_config_lines
<span class="hl">FAIL test_limits - TODO 1: assert that VLAN 1 and VLAN 4094 are both valid</span>
Ran 3 tests, 1 failed
RESULT: FAILED</pre>

<h3>Levels of testing</h3>
<table class="cmp"><tr><th>Level</th><th>What it checks</th><th>Network example</th><th>Speed</th></tr>
<tr><td><b>Unit test</b></td><td>One small piece (a function or a class) in isolation</td><td><code>is_valid_vlan(4094)</code> returns True</td><td>Milliseconds</td></tr>
<tr><td><b>Integration test</b></td><td>Several pieces working together</td><td>The config builder feeds the push function correctly</td><td>Seconds</td></tr>
<tr><td><b>System / end-to-end test</b></td><td>The whole tool against a realistic environment</td><td>Run the tool against a lab switch and read back the VLANs</td><td>Minutes</td></tr>
<tr><td><b>Acceptance test</b></td><td>Does it meet the business requirement?</td><td>The branch admin can add a VLAN with a form</td><td>Human or scripted</td></tr>
</table>
<p>Teams want <b>many fast unit tests</b>, fewer integration tests and a handful of end-to-end tests. This shape is often drawn as a pyramid. Unit tests need no network, no switch and no internet, so they run in a blink on every commit.</p>

<h3>The TDD cycle: red, green, refactor</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Red green refactor">
<rect x="20" y="60" width="170" height="80" rx="10" fill="#fecaca"/><text x="105" y="92" text-anchor="middle" class="svg-ink" font-size="14" font-weight="bold">1 RED</text><text x="105" y="114" text-anchor="middle" class="svg-ink" font-size="12">write a test that fails</text>
<rect x="235" y="60" width="170" height="80" rx="10" fill="#bbf7d0"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="14" font-weight="bold">2 GREEN</text><text x="320" y="114" text-anchor="middle" class="svg-ink" font-size="12">write just enough code</text>
<rect x="450" y="60" width="170" height="80" rx="10" fill="#bae6fd"/><text x="535" y="92" text-anchor="middle" class="svg-ink" font-size="14" font-weight="bold">3 REFACTOR</text><text x="535" y="114" text-anchor="middle" class="svg-ink" font-size="12">clean up, tests stay green</text>
<line x1="190" y1="100" x2="233" y2="100" stroke="#64748b" stroke-width="2"/><line x1="405" y1="100" x2="448" y2="100" stroke="#64748b" stroke-width="2"/>
<path d="M535 142 C535 200 105 200 105 142" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="196" text-anchor="middle" class="svg-muted" font-size="12">next small behaviour</text>
</svg><p class="cap">TDD is a loop of tiny steps. Each lap adds one behaviour.</p></div>
<ol>
<li><b>Red.</b> Write a test for a behaviour that does not exist yet, run it and <i>watch it fail</i>. A test that has never failed might not be testing anything.</li>
<li><b>Green.</b> Write the simplest code that makes the test pass. Resist adding more.</li>
<li><b>Refactor.</b> Improve names and structure while all tests stay green. The tests are your safety net.</li>
</ol>
<div class="eg"><p>Requirement: "<code>parse_vlan_list("10, 20,30")</code> returns <code>[10, 20, 30]</code>." Red: write that test; it fails because the function returns an empty list. Green: loop over <code>text.split(",")</code>, strip spaces, convert to int, append. Run again and it passes. Next lap, Red: "a bad id must raise ValueError". Green: add the validity check. Refactor: rename a variable. This is exactly Lab 2.</p></div>

<h3>Why teams use TDD</h3>
<ul>
<li><b>Clear target.</b> You must say what "correct" means before you code, which exposes vague requirements early.</li>
<li><b>Fewer bugs and early detection.</b> A bug is caught seconds after you write it, not at the Friday rollout.</li>
<li><b>Safe change.</b> Refactor boldly: if you break something, a test turns red.</li>
<li><b>Better design.</b> Code that is easy to test is small, has clear inputs and outputs, and does one job.</li>
<li><b>Living documentation.</b> Test names such as <code>test_rejects_vlan_4095</code> tell the next engineer what the code promises.</li>
<li><b>Regression protection.</b> A <b>regression</b> is an old feature that breaks after a change. A growing test suite catches them. In Lab 1 you break the upper limit on purpose and see <code>test_limits</code> catch it.</li>
</ul>
<h3>What to test: boundaries and bad input</h3>
<p>Bugs hide at the edges. For a rule "VLAN 1 to 4094" test the smallest (1), the largest (4094), just outside each end (0 and 4095) and nonsense (the text "10", <code>None</code>). Lab 2 starts with a function that uses <code>1 &lt; vid &lt; 4094</code>: the middle value passes and both edges fail, a classic off-by-one bug that only boundary tests reveal.</p>
<p>Shape of a good test: <b>arrange</b> (prepare inputs), <b>act</b> (call the code), <b>assert</b> (check the result). Keep one idea per test, name it for the behaviour, and do not let tests depend on each other's order.</p>
<div class="warn"><p><b>Common mistakes.</b> Writing the test so that it can never fail (<code>assert True</code>). Changing the test to match buggy code instead of fixing the code. Testing many behaviours in one function so a failure does not tell you which. Skipping the refactor step, so green code slowly turns messy.</p></div>
<div class="exam"><p><b>Exam trap.</b> TDD means the <b>test is written before the code</b>. "Write the code, then add tests" is not TDD. Remember the order red (failing test), green (make it pass), refactor. Unit tests check a small unit in isolation; they are not the same as testing the whole system on real devices.</p></div>

<div class="scn"><h4>The off-by-one that blocked VLAN 4094</h4><p>A provider reserved VLAN 4094 for a management network, but the helper rejected it and the change failed in the middle of a window. The helper used a strict less-than. The team's new rule: every range check gets boundary tests first. They wrote tests for 0, 1, 4094 and 4095, saw two red, fixed the operator and kept the tests so nobody could reintroduce the bug.</p><p><b>Lesson:</b> test the edges; a green test suite is cheaper than a failed window.</p></div>
<div class="iv"><p class="q">"What is test-driven development?"</p><p>A practice where you write a failing test first (red), then the minimum code to pass it (green), then clean up the code while keeping tests green (refactor), repeating in small steps. Benefits: clear requirements, early bug detection, safe refactoring, better design and living documentation. Mention that unit tests should be fast and isolated, and that boundary values are where bugs hide.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A test runs code and checks the result; assert raises AssertionError when false.</li>
<li>Unit tests check one small piece; integration and end-to-end tests check larger parts.</li>
<li>TDD loop: red (failing test), green (minimal code), refactor.</li>
<li>Benefits: clear target, early bugs, safe change, better design, regression protection.</li>
<li>Test boundaries (1, 4094, 0, 4095) and bad input, not just the happy path.</li>
</ul></div>
`,hi:`
<p>Blueprint item 1.3 aapse <b>test-driven development</b> describe karne ko kehta hai. Ise samajhne ke liye pehle pata hona chahiye test kya hota hai. Yeh chapter dono ideas ko shuru se banata hai, simple Python <code>assert</code> se. Agla chapter exam mein naam wale <code>unittest</code> module par jaata hai.</p>

<h3>Analogy: exam dene se pehle likha answer key</h3>
<p>Jo teacher answer key <i>pehle</i> likhta hai use ek bhi paper check karne se pehle pata hota hai ki sahi jawab kaisa dikhta hai. TDD bhi aise hi kaam karta hai: aap test (answer key) code (jawab) se pehle likhte ho.</p>

<h3>Test kya hai</h3>
<p><b>Automated test</b> code ka ek chhota hissa hai jo aapka code chalata hai aur result check karta hai. Agar result umeed jaisa hai to test <b>pass</b> hota hai; nahi to <b>fail</b>. Python ka <code>assert</code> statement sabse simple check hai: <code>assert expression</code> kuch nahi karta agar expression true hai aur false hone par <code>AssertionError</code> raise karta hai. Message bhi jod sakte ho: <code>assert x == 3, "x should be 3"</code>.</p>
<pre class="code">def is_valid_vlan(vid):
    return isinstance(vid, int) and 1 &lt;= vid &lt;= 4094

def test_vlan_10_is_valid():
    assert is_valid_vlan(10)                    <span class="c"># umeed: True</span>

def test_vlan_0_is_not_valid():
    assert not is_valid_vlan(0)                 <span class="c"># umeed: False</span></pre>
<p>Har <code>test_</code> function <b>ek behaviour</b> check karta hai. Ek chhota <b>test runner</b> sabko call karta hai aur verdict print karta hai. Lab 1 mein aap aisa hi runner use karte ho:</p>
<pre class="out">PASS test_normal_vlan
PASS test_config_lines
<span class="hl">FAIL test_limits - TODO 1: assert that VLAN 1 and VLAN 4094 are both valid</span>
Ran 3 tests, 1 failed
RESULT: FAILED</pre>

<h3>Testing ke levels</h3>
<table class="cmp"><tr><th>Level</th><th>Kya check karta hai</th><th>Network example</th><th>Speed</th></tr>
<tr><td><b>Unit test</b></td><td>Ek chhota piece (function ya class) akela</td><td><code>is_valid_vlan(4094)</code> True deta hai</td><td>Milliseconds</td></tr>
<tr><td><b>Integration test</b></td><td>Kai pieces saath kaam karte hue</td><td>Config builder push function ko sahi feed karta hai</td><td>Seconds</td></tr>
<tr><td><b>System / end-to-end test</b></td><td>Poora tool realistic environment ke against</td><td>Tool ko lab switch par chalao aur VLANs wapas padho</td><td>Minutes</td></tr>
<tr><td><b>Acceptance test</b></td><td>Business requirement poori hui?</td><td>Branch admin form se VLAN jod sakta hai</td><td>Insaan ya scripted</td></tr>
</table>
<p>Teams <b>bahut saare tez unit tests</b>, kam integration tests aur ginti ke end-to-end tests chahti hain. Is shape ko aksar pyramid ki tarah banate hain. Unit tests ko network, switch ya internet nahi chahiye, isliye woh har commit par palak jhapakte chalte hain.</p>

<h3>TDD cycle: red, green, refactor</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Red green refactor">
<rect x="20" y="60" width="170" height="80" rx="10" fill="#fecaca"/><text x="105" y="92" text-anchor="middle" class="svg-ink" font-size="14" font-weight="bold">1 RED</text><text x="105" y="114" text-anchor="middle" class="svg-ink" font-size="12">fail hone wala test likho</text>
<rect x="235" y="60" width="170" height="80" rx="10" fill="#bbf7d0"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="14" font-weight="bold">2 GREEN</text><text x="320" y="114" text-anchor="middle" class="svg-ink" font-size="12">bas kaafi code likho</text>
<rect x="450" y="60" width="170" height="80" rx="10" fill="#bae6fd"/><text x="535" y="92" text-anchor="middle" class="svg-ink" font-size="14" font-weight="bold">3 REFACTOR</text><text x="535" y="114" text-anchor="middle" class="svg-ink" font-size="12">saaf karo, tests green rahein</text>
<line x1="190" y1="100" x2="233" y2="100" stroke="#64748b" stroke-width="2"/><line x1="405" y1="100" x2="448" y2="100" stroke="#64748b" stroke-width="2"/>
<path d="M535 142 C535 200 105 200 105 142" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="196" text-anchor="middle" class="svg-muted" font-size="12">agla chhota behaviour</text>
</svg><p class="cap">TDD chhote steps ka loop hai. Har chakkar ek behaviour jodta hai.</p></div>
<ol>
<li><b>Red.</b> Aise behaviour ka test likho jo abhi exist nahi karta, chalao aur <i>use fail hote dekho</i>. Jo test kabhi fail nahi hua woh shayad kuch test hi nahi kar raha.</li>
<li><b>Green.</b> Sabse simple code likho jo test pass karaye. Zyada jodne se bacho.</li>
<li><b>Refactor.</b> Naam aur structure sudharo jab tak saare tests green hain. Tests aapka safety net hain.</li>
</ol>
<div class="eg"><p>Requirement: "<code>parse_vlan_list("10, 20,30")</code> <code>[10, 20, 30]</code> deta hai." Red: woh test likho; fail hota hai kyunki function khaali list deta hai. Green: <code>text.split(",")</code> par loop, spaces strip, int mein convert, append. Dobara chalao aur pass. Agle chakkar mein Red: "bad id par ValueError aana chahiye". Green: validity check jodo. Refactor: ek variable ka naam badlo. Yahi Lab 2 hai.</p></div>

<h3>Teams TDD kyun use karti hain</h3>
<ul>
<li><b>Saaf target.</b> Code se pehle batana padta hai "sahi" ka matlab kya hai, jisse dhundhli requirements jaldi pakdi jaati hain.</li>
<li><b>Kam bugs aur jaldi detection.</b> Bug likhne ke seconds baad pakda jaata hai, Friday ke rollout par nahi.</li>
<li><b>Safe change.</b> Bold refactor karo: kuch toota to test red ho jaata hai.</li>
<li><b>Behtar design.</b> Jo code test karna aasaan ho woh chhota hota hai, uske inputs aur outputs saaf hote hain, aur woh ek kaam karta hai.</li>
<li><b>Zinda documentation.</b> <code>test_rejects_vlan_4095</code> jaise test naam agle engineer ko batate hain code kya vaada karta hai.</li>
<li><b>Regression protection.</b> <b>Regression</b> woh purani feature hai jo change ke baad toot jaati hai. Badhta test suite unhe pakadta hai. Lab 1 mein aap upper limit jaan-boojh kar todte ho aur <code>test_limits</code> ko pakadte dekhte ho.</li>
</ul>
<h3>Kya test karein: boundaries aur bad input</h3>
<p>Bugs kinaaron par chhupte hain. "VLAN 1 se 4094" rule ke liye sabse chhota (1), sabse bada (4094), dono sire ke bilkul bahar (0 aur 4095) aur bakwas (text "10", <code>None</code>) test karo. Lab 2 ek aise function se shuru hota hai jo <code>1 &lt; vid &lt; 4094</code> use karta hai: beech ki value pass hoti hai aur dono edges fail, ek classic off-by-one bug jo sirf boundary tests dikhate hain.</p>
<p>Achhe test ka shape: <b>arrange</b> (inputs taiyar karo), <b>act</b> (code call karo), <b>assert</b> (result check karo). Ek test mein ek idea, naam behaviour ke hisaab se, aur tests ek doosre ke order par depend na hon.</p>
<div class="warn"><p><b>Aam galtiyan.</b> Aisa test likhna jo kabhi fail ho hi nahi sakta (<code>assert True</code>). Code fix karne ki jagah test ko buggy code se match karne ke liye badalna. Ek function mein kai behaviours test karna jisse fail hone par pata nahi chalta kaun sa. Refactor step chhodna, jisse green code dheere dheere ganda ho jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> TDD ka matlab hai <b>test code se pehle likha jaata hai</b>. "Code likho, phir tests jodo" TDD nahi hai. Order yaad rakho: red (failing test), green (pass karao), refactor. Unit tests ek chhote unit ko akela check karte hain; woh asli devices par poore system ko test karne jaise nahi hain.</p></div>

<div class="scn"><h4>Off-by-one jisne VLAN 4094 rok diya</h4><p>Ek provider ne management network ke liye VLAN 4094 reserve kiya, par helper ne use reject kar diya aur window ke beech change fail ho gaya. Helper strict less-than use karta tha. Team ka naya rule: har range check ko pehle boundary tests milte hain. Unhone 0, 1, 4094 aur 4095 ke tests likhe, do red dekhe, operator fix kiya aur tests rakhe taaki koi bug dobara na laa sake.</p><p><b>Lesson:</b> edges test karo; green test suite failed window se sasta hai.</p></div>
<div class="iv"><p class="q">"Test-driven development kya hai?"</p><p>Ek practice jisme pehle failing test likhte ho (red), phir use pass karne layak minimum code (green), phir tests green rakhte hue code saaf karte ho (refactor), chhote steps mein repeat karke. Benefits: saaf requirements, jaldi bug detection, safe refactoring, behtar design aur zinda documentation. Bolo ki unit tests tez aur isolated hone chahiye, aur boundary values wahi hain jahan bugs chhupte hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Test code chalata hai aur result check karta hai; assert false hone par AssertionError raise karta hai.</li>
<li>Unit tests ek chhota piece check karte hain; integration aur end-to-end tests bade hisse.</li>
<li>TDD loop: red (failing test), green (minimal code), refactor.</li>
<li>Benefits: saaf target, jaldi bugs, safe change, behtar design, regression protection.</li>
<li>Boundaries (1, 4094, 0, 4095) aur bad input test karo, sirf happy path nahi.</li>
</ul></div>
`}};export{e as default};