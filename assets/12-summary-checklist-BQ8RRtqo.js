var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with the idea that automation is software and finished with the habits of a professional team: plan it, design it, test it first, keep it in version control and have someone review it. This last chapter is your revision sheet for the Cisco 200-901 items covered in this module.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Module map">
<rect x="10" y="10" width="190" height="55" rx="8" fill="#bae6fd"/><text x="105" y="34" text-anchor="middle" class="svg-ink" font-size="12" font-weight="bold">SDLC and models</text><text x="105" y="52" text-anchor="middle" class="svg-ink" font-size="11">1.4 Agile, Lean, Waterfall</text>
<rect x="225" y="10" width="190" height="55" rx="8" fill="#ddd6fe"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="12" font-weight="bold">Organising code</text><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="11">1.5 functions, classes, modules</text>
<rect x="440" y="10" width="190" height="55" rx="8" fill="#bbf7d0"/><text x="535" y="34" text-anchor="middle" class="svg-ink" font-size="12" font-weight="bold">Design patterns</text><text x="535" y="52" text-anchor="middle" class="svg-ink" font-size="11">1.6 MVC, Observer</text>
<rect x="10" y="80" width="190" height="55" rx="8" fill="#fde68a"/><text x="105" y="104" text-anchor="middle" class="svg-ink" font-size="12" font-weight="bold">Version control</text><text x="105" y="122" text-anchor="middle" class="svg-ink" font-size="11">1.7 advantages</text>
<rect x="225" y="80" width="190" height="55" rx="8" fill="#fed7aa"/><text x="320" y="104" text-anchor="middle" class="svg-ink" font-size="12" font-weight="bold">Testing</text><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="11">1.3 TDD, 4.5 unittest</text>
<rect x="440" y="80" width="190" height="55" rx="8" fill="#e2e8f0"/><text x="535" y="104" text-anchor="middle" class="svg-ink" font-size="12" font-weight="bold">Diff and review</text><text x="535" y="122" text-anchor="middle" class="svg-ink" font-size="11">5.12 diff, 5.13 review</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Plan, design, build, test, review, ship, maintain: the loop of a software team.</text>
</svg><p class="cap">The six topic groups of this module and the blueprint items they cover.</p></div>

<h3>Can-do checklist</h3>
<p>Tick each one only if you could explain it aloud to a colleague.</p>
<ul>
<li>I can list the SDLC phases (requirements, design, implementation, testing, deployment, maintenance) and say which one an activity belongs to.</li>
<li>I can compare Waterfall, Agile and Lean in shape, handling of change, delivery and documentation, and pick the right one for a scenario.</li>
<li>I can explain the benefits of functions, modules and classes, and write a small <code>Device</code> class with <code>__init__</code>, attributes, a method and an inheriting subclass.</li>
<li>I can state the advantages of design patterns, describe MVC (model, view, controller) and Observer (subject, observers, notify) with a network example.</li>
<li>I can list at least six advantages of version control and what must never be committed.</li>
<li>I can explain TDD: red, green, refactor, and why boundaries and bad input are tested.</li>
<li>I can write a <code>unittest.TestCase</code> with <code>setUp</code>, <code>assertEqual</code>, <code>assertTrue</code> and <code>assertRaises</code>, run it, and read dots, F, E and the final line.</li>
<li>I can read a unified diff: file headers, hunk header, context, minus and plus lines.</li>
<li>I can list the principles and benefits of code review.</li>
<li>Lab 1: I wrote three missing tests, broke the code on purpose and saw <code>test_limits</code> catch it. Lab 2: I took the suite from 4 failed to 0 failed without editing tests.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>SDLC</dt><dd>Software development life cycle: the phases software passes through.</dd>
<dt>Sprint</dt><dd>A short, fixed time box (often 1 to 4 weeks) in Agile that ends with working software.</dd>
<dt>Backlog</dt><dd>The ordered list of work waiting to be done.</dd>
<dt>Class / object</dt><dd>Blueprint / a thing built from it. Attributes hold data, methods are functions inside the class.</dd>
<dt>Module / package</dt><dd>A .py file / a folder of modules.</dd>
<dt>Design pattern</dt><dd>A named, proven, reusable solution to a recurring design problem.</dd>
<dt>MVC</dt><dd>Model (data and rules), View (display), Controller (input and coordination).</dd>
<dt>Observer</dt><dd>A subject notifies all subscribed observers when its state changes.</dd>
<dt>Commit / branch / merge</dt><dd>A saved snapshot / a separate line of work / combining lines of work.</dd>
<dt>Unit test</dt><dd>An automated check of one small piece of code.</dd>
<dt>TDD</dt><dd>Write a failing test first, make it pass, then refactor.</dd>
<dt>Regression</dt><dd>An old feature that breaks after a change.</dd>
<dt>Hunk</dt><dd>One block of changes in a diff, introduced by an @@ header.</dd>
<dt>Pull / merge request</dt><dd>A proposal to merge a branch, with diff, comments and checks.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Waterfall</td><td>Sequential, sign-off per phase, delivery at the end, change is costly.</td></tr>
<tr><td>Agile</td><td>Iterations, working software each sprint, welcomes change, customer collaboration.</td></tr>
<tr><td>Lean</td><td>Eliminate waste, build quality in, limit work in progress, deliver fast.</td></tr>
<tr><td>MVC</td><td>Model = data and rules, View = what the user sees, Controller = handles input.</td></tr>
<tr><td>Observer</td><td>One-to-many notification; loose coupling; webhooks are a real example.</td></tr>
<tr><td>TDD order</td><td>Test first (red), code (green), clean up (refactor).</td></tr>
<tr><td>unittest</td><td>Class inherits <code>unittest.TestCase</code>; method names start with <code>test</code>; <code>setUp</code> runs before each test.</td></tr>
<tr><td>Result symbols</td><td><code>.</code> pass, <code>F</code> failure, <code>E</code> error; last line OK or FAILED.</td></tr>
<tr><td>Diff</td><td><code>---</code> old, <code>+++</code> new, <code>@@ -a,b +c,d @@</code>, minus removed, plus added, space context.</td></tr>
<tr><td>Review</td><td>Small, kind, specific, automated checks first; benefits are fewer bugs and shared knowledge.</td></tr>
</table>

<h3>Cheat sheet: unittest</h3>
<pre class="code">import unittest

class TestThing(unittest.TestCase):
    def setUp(self):                          <span class="c"># before each test</span>
        self.data = [1, 2, 3]
    def test_something(self):                 <span class="c"># must start with test</span>
        self.assertEqual(len(self.data), 3)
        self.assertTrue(2 in self.data)
        self.assertIn(3, self.data)
        with self.assertRaises(ValueError):
            int("abc")

if __name__ == "__main__":
    unittest.main()</pre>
<pre class="out">.
----------------------------------------------------------------------
Ran 1 test in 0.000s

<span class="hl">OK</span></pre>
<h3>Cheat sheet: lab shell commands (host AUTO)</h3>
<pre class="code">python3 vlan_tools.py                       <span class="c"># run the code and its tests</span>
nl vlan_tools.py                            <span class="c"># show line numbers</span>
edit vlan_tools.py 27     assert ...        <span class="c"># replace line 27 (spaces after 27 = indentation)</span>
insert vlan_tools.py 14   ids.append(vid)   <span class="c"># insert a line BEFORE line 14</span>
sed -i 's/old/new/' vlan_tools.py           <span class="c"># replace text in the file</span></pre>

<div class="exam"><p><b>Last exam traps.</b> (1) Test-driven means the test comes <i>before</i> the code. (2) Agile does not mean no planning. (3) A module is a file; a class is a blueprint. (4) <code>setUp</code> runs before <i>every</i> test. (5) In a diff, <code>-</code> is the old file and <code>+</code> the new file. (6) MVC separates roles; Observer notifies dependents. (7) Version control is more than backup: history, collaboration, branching, review and automation.</p></div>

<div class="scn"><h4>One change, end to end</h4><p>A branch manager asks the NOC for a self-service VLAN request form. The team writes the requirement and agrees an Agile two-week sprint. They design a model that validates VLANs, a view that renders the form and a controller that handles submissions. A developer writes failing tests for 0, 1, 4094 and 4095, then the code, keeping everything on a feature branch. A pull request shows the diff; the reviewer spots a missing check, the author adds a test and fixes it. Merging triggers the pipeline, which runs the tests and deploys to a lab. Production release follows, and next month's requests start the loop again.</p><p><b>Lesson:</b> every idea in this module is a link in that chain.</p></div>
<div class="iv"><p class="q">"Walk me through how you would build and ship a small automation tool the professional way."</p><p>Gather requirements, design with functions or classes and a pattern if it fits, work in short Agile iterations, write unit tests first (red, green, refactor), keep everything in Git on a branch, open a pull request for review, let a pipeline run the tests and deploy to a lab, then release and maintain. Naming each step and its benefit shows you understand the whole software life cycle.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SDLC phases repeat; Waterfall, Agile and Lean are ways to run them.</li>
<li>Functions, classes and modules organise code; MVC and Observer organise design.</li>
<li>Version control gives history, collaboration, branching and a base for automation.</li>
<li>Write tests first, run them often, read the result from the last line upwards.</li>
<li>Read diffs carefully and review changes before they merge.</li>
</ul></div>
`,hi:`
<p>Aapne yeh idea se shuru kiya ki automation software hai aur ek professional team ki aadaton par khatam kiya: plan karo, design karo, pehle test likho, version control mein rakho aur kisi se review karwao. Yeh aakhri chapter is module mein cover hue Cisco 200-901 items ke liye aapki revision sheet hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Module map">
<rect x="10" y="10" width="190" height="55" rx="8" fill="#bae6fd"/><text x="105" y="34" text-anchor="middle" class="svg-ink" font-size="12" font-weight="bold">SDLC aur models</text><text x="105" y="52" text-anchor="middle" class="svg-ink" font-size="11">1.4 Agile, Lean, Waterfall</text>
<rect x="225" y="10" width="190" height="55" rx="8" fill="#ddd6fe"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="12" font-weight="bold">Code organise karna</text><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="11">1.5 functions, classes, modules</text>
<rect x="440" y="10" width="190" height="55" rx="8" fill="#bbf7d0"/><text x="535" y="34" text-anchor="middle" class="svg-ink" font-size="12" font-weight="bold">Design patterns</text><text x="535" y="52" text-anchor="middle" class="svg-ink" font-size="11">1.6 MVC, Observer</text>
<rect x="10" y="80" width="190" height="55" rx="8" fill="#fde68a"/><text x="105" y="104" text-anchor="middle" class="svg-ink" font-size="12" font-weight="bold">Version control</text><text x="105" y="122" text-anchor="middle" class="svg-ink" font-size="11">1.7 advantages</text>
<rect x="225" y="80" width="190" height="55" rx="8" fill="#fed7aa"/><text x="320" y="104" text-anchor="middle" class="svg-ink" font-size="12" font-weight="bold">Testing</text><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="11">1.3 TDD, 4.5 unittest</text>
<rect x="440" y="80" width="190" height="55" rx="8" fill="#e2e8f0"/><text x="535" y="104" text-anchor="middle" class="svg-ink" font-size="12" font-weight="bold">Diff aur review</text><text x="535" y="122" text-anchor="middle" class="svg-ink" font-size="11">5.12 diff, 5.13 review</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Plan, design, build, test, review, ship, maintain: software team ka loop.</text>
</svg><p class="cap">Is module ke chhe topic groups aur woh blueprint items jo woh cover karte hain.</p></div>

<h3>Can-do checklist</h3>
<p>Har ek tabhi tick karo jab aap use colleague ko zor se samjha sako.</p>
<ul>
<li>Main SDLC phases (requirements, design, implementation, testing, deployment, maintenance) ginwa sakta hoon aur bata sakta hoon ki koi activity kis phase ki hai.</li>
<li>Main Waterfall, Agile aur Lean ki tulna shape, change handle karne, delivery aur documentation mein kar sakta hoon, aur scenario ke liye sahi chun sakta hoon.</li>
<li>Main functions, modules aur classes ke benefits samjha sakta hoon, aur <code>__init__</code>, attributes, ek method aur inherit karne wali subclass ke saath chhoti <code>Device</code> class likh sakta hoon.</li>
<li>Main design patterns ke advantages bata sakta hoon, MVC (model, view, controller) aur Observer (subject, observers, notify) network example ke saath describe kar sakta hoon.</li>
<li>Main version control ke kam se kam chhe advantages aur kya kabhi commit nahi karna chahiye woh bata sakta hoon.</li>
<li>Main TDD samjha sakta hoon: red, green, refactor, aur boundaries aur bad input kyun test hote hain.</li>
<li>Main <code>setUp</code>, <code>assertEqual</code>, <code>assertTrue</code> aur <code>assertRaises</code> ke saath <code>unittest.TestCase</code> likh, chala aur dots, F, E aur aakhri line padh sakta hoon.</li>
<li>Main unified diff padh sakta hoon: file headers, hunk header, context, minus aur plus lines.</li>
<li>Main code review ke principles aur benefits ginwa sakta hoon.</li>
<li>Lab 1: maine teen missing tests likhe, code jaan-boojh kar toda aur <code>test_limits</code> ko pakadte dekha. Lab 2: maine tests edit kiye bina suite ko 4 failed se 0 failed tak pahunchaya.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>SDLC</dt><dd>Software development life cycle: woh phases jinse software guzarta hai.</dd>
<dt>Sprint</dt><dd>Agile mein chhota, fixed time box (aksar 1 se 4 hafte) jo working software par khatam hota hai.</dd>
<dt>Backlog</dt><dd>Karne wale kaam ki order mein lagi list.</dd>
<dt>Class / object</dt><dd>Blueprint / usse bani cheez. Attributes data rakhte hain, methods class ke andar functions hain.</dd>
<dt>Module / package</dt><dd>Ek .py file / modules ka folder.</dd>
<dt>Design pattern</dt><dd>Baar baar aane wali design problem ka naam wala, aazmaya hua, reusable solution.</dd>
<dt>MVC</dt><dd>Model (data aur rules), View (display), Controller (input aur coordination).</dd>
<dt>Observer</dt><dd>Subject apni state badalne par sabhi subscribed observers ko notify karta hai.</dd>
<dt>Commit / branch / merge</dt><dd>Saved snapshot / kaam ki alag line / kaam ki lines ko milana.</dd>
<dt>Unit test</dt><dd>Code ke ek chhote piece ka automated check.</dd>
<dt>TDD</dt><dd>Pehle failing test likho, use pass karao, phir refactor karo.</dd>
<dt>Regression</dt><dd>Purani feature jo change ke baad toot jaati hai.</dd>
<dt>Hunk</dt><dd>Diff mein changes ka ek block, jo @@ header se shuru hota hai.</dd>
<dt>Pull / merge request</dt><dd>Branch merge karne ka proposal, diff, comments aur checks ke saath.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>Waterfall</td><td>Sequential, har phase ka sign-off, end mein delivery, change mehnga.</td></tr>
<tr><td>Agile</td><td>Iterations, har sprint working software, change ka swagat, customer collaboration.</td></tr>
<tr><td>Lean</td><td>Waste hatao, quality andar se banao, work in progress limit karo, tez deliver karo.</td></tr>
<tr><td>MVC</td><td>Model = data aur rules, View = jo user dekhta hai, Controller = input handle karta hai.</td></tr>
<tr><td>Observer</td><td>One-to-many notification; loose coupling; webhooks asli example hain.</td></tr>
<tr><td>TDD order</td><td>Pehle test (red), code (green), saaf karo (refactor).</td></tr>
<tr><td>unittest</td><td>Class <code>unittest.TestCase</code> inherit karti hai; method naam <code>test</code> se shuru; <code>setUp</code> har test se pehle chalta hai.</td></tr>
<tr><td>Result symbols</td><td><code>.</code> pass, <code>F</code> failure, <code>E</code> error; aakhri line OK ya FAILED.</td></tr>
<tr><td>Diff</td><td><code>---</code> old, <code>+++</code> new, <code>@@ -a,b +c,d @@</code>, minus removed, plus added, space context.</td></tr>
<tr><td>Review</td><td>Chhota, kind, specific, pehle automated checks; benefits kam bugs aur shared knowledge.</td></tr>
</table>

<h3>Cheat sheet: unittest</h3>
<pre class="code">import unittest

class TestThing(unittest.TestCase):
    def setUp(self):                          <span class="c"># har test se pehle</span>
        self.data = [1, 2, 3]
    def test_something(self):                 <span class="c"># test se shuru hona chahiye</span>
        self.assertEqual(len(self.data), 3)
        self.assertTrue(2 in self.data)
        self.assertIn(3, self.data)
        with self.assertRaises(ValueError):
            int("abc")

if __name__ == "__main__":
    unittest.main()</pre>
<pre class="out">.
----------------------------------------------------------------------
Ran 1 test in 0.000s

<span class="hl">OK</span></pre>
<h3>Cheat sheet: lab shell commands (host AUTO)</h3>
<pre class="code">python3 vlan_tools.py                       <span class="c"># code aur uske tests chalao</span>
nl vlan_tools.py                            <span class="c"># line numbers dikhao</span>
edit vlan_tools.py 27     assert ...        <span class="c"># line 27 badlo (27 ke baad ke spaces = indentation)</span>
insert vlan_tools.py 14   ids.append(vid)   <span class="c"># line 14 se PEHLE ek line daalo</span>
sed -i 's/old/new/' vlan_tools.py           <span class="c"># file mein text badlo</span></pre>

<div class="exam"><p><b>Aakhri exam traps.</b> (1) Test-driven ka matlab test code se <i>pehle</i> aata hai. (2) Agile ka matlab no planning nahi. (3) Module file hai; class blueprint hai. (4) <code>setUp</code> <i>har</i> test se pehle chalta hai. (5) Diff mein <code>-</code> old file hai aur <code>+</code> new file. (6) MVC roles alag karta hai; Observer dependents ko notify karta hai. (7) Version control sirf backup nahi: history, collaboration, branching, review aur automation.</p></div>

<div class="scn"><h4>Ek change, shuru se end tak</h4><p>Branch manager NOC se self-service VLAN request form maangta hai. Team requirement likhti hai aur do hafte ke Agile sprint par sahmat hoti hai. Woh ek model design karte hain jo VLANs validate kare, ek view jo form render kare aur ek controller jo submissions handle kare. Developer 0, 1, 4094 aur 4095 ke liye failing tests likhta hai, phir code, sab kuch feature branch par rakhte hue. Pull request diff dikhati hai; reviewer ek missing check pakadta hai, author test jodta hai aur fix karta hai. Merge pipeline trigger karta hai jo tests chalati hai aur lab mein deploy karti hai. Production release aata hai, aur agle mahine ki requests loop dobara shuru karti hain.</p><p><b>Lesson:</b> is module ka har idea us chain ki ek kadi hai.</p></div>
<div class="iv"><p class="q">"Mujhe batao ek chhota automation tool professional tareeke se kaise banaoge aur ship karoge."</p><p>Requirements jama karo, functions ya classes se design karo aur jahan fit ho wahan pattern, chhote Agile iterations mein kaam karo, pehle unit tests likho (red, green, refactor), sab kuch Git mein branch par rakho, review ke liye pull request kholo, pipeline ko tests chalane aur lab mein deploy karne do, phir release aur maintain karo. Har step aur uska benefit batana dikhata hai ki aap poora software life cycle samajhte ho.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SDLC phases repeat hote hain; Waterfall, Agile aur Lean unhe chalane ke tareeke hain.</li>
<li>Functions, classes aur modules code organise karte hain; MVC aur Observer design organise karte hain.</li>
<li>Version control history, collaboration, branching aur automation ki neev deta hai.</li>
<li>Pehle tests likho, aksar chalao, result aakhri line se upar ki taraf padho.</li>
<li>Diffs dhyan se padho aur merge se pehle changes review karo.</li>
</ul></div>
`}};export{e as default};