var e={id:`diff-review`,h:{en:`Reading a unified diff and doing code review`,hi:`Unified diff padhna aur code review karna`},body:{en:`
<p>Two blueprint items belong together: <b>5.12 interpret the contents of a unified diff</b> and <b>5.13 identify the principles and benefits of code review</b>. When a colleague proposes a change, the review screen shows a <b>diff</b>: exactly which lines were removed and added. Reading it fluently is a core daily skill.</p>

<h3>Analogy: tracked changes in a document</h3>
<p>When an editor returns your essay, deleted words are struck through in red and new words are underlined in green. You do not reread the whole essay; you look only at the marked changes. A diff is the plain-text version of the same thing.</p>

<h3>What a unified diff looks like</h3>
<p>The <b>unified diff</b> format is what <code>diff -u</code> and Git print. Here is a real one: a developer fixed the VLAN range check and made <code>make_vlan_config</code> refuse bad ids.</p>
<pre class="out"><span class="hl">diff --git a/vlan_tools.py b/vlan_tools.py</span>
index 3f2a1c9..8be40d2 100644
<span class="hl">--- a/vlan_tools.py</span>
<span class="hl">+++ b/vlan_tools.py</span>
<span class="hl">@@ -2,9 +2,11 @@</span>
 
 def is_valid_vlan(vid):
     """True if vid is a whole number from 1 to 4094."""
<span class="hl">-    return isinstance(vid, int) and 1 &lt; vid &lt; 4094</span>
<span class="hl">+    return isinstance(vid, int) and 1 &lt;= vid &lt;= 4094</span>
 
 
 def make_vlan_config(vid, name):
     """Return the config lines for one VLAN."""
<span class="hl">+    if not is_valid_vlan(vid):</span>
<span class="hl">+        raise ValueError(f"bad VLAN id {vid}")</span>
     return [f"vlan {vid}", f" name {name}"]</pre>

<h3>Reading it piece by piece</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Anatomy of a diff">
<rect x="10" y="10" width="620" height="210" rx="8" fill="#f1f5f9" stroke="#cbd5e1"/>
<text x="25" y="38" class="svg-ink" font-size="12">--- a/vlan_tools.py</text><text x="330" y="38" class="svg-accent" font-size="12">OLD file (the "a" side)</text>
<text x="25" y="62" class="svg-ink" font-size="12">+++ b/vlan_tools.py</text><text x="330" y="62" class="svg-accent" font-size="12">NEW file (the "b" side)</text>
<text x="25" y="92" class="svg-ink" font-size="12">@@ -2,9 +2,11 @@</text><text x="330" y="92" class="svg-accent" font-size="12">old: from line 2, 9 lines | new: from line 2, 11 lines</text>
<text x="25" y="122" class="svg-ink" font-size="12">  (space) unchanged context line</text><text x="330" y="122" class="svg-muted" font-size="12">shown so you can find the place</text>
<text x="25" y="152" fill="#b91c1c" font-size="12">- removed line</text><text x="330" y="152" class="svg-muted" font-size="12">exists in old, not in new</text>
<text x="25" y="182" fill="#15803d" font-size="12">+ added line</text><text x="330" y="182" class="svg-muted" font-size="12">exists in new, not in old</text>
<text x="25" y="208" class="svg-muted" font-size="12">A changed line appears as a - line followed by a + line.</text>
</svg><p class="cap">Every unified diff has the same four parts: file headers, hunk header, context lines, and minus and plus lines.</p></div>
<dl class="terms">
<dt><code>--- a/file</code> and <code>+++ b/file</code></dt><dd>The two file headers. The <code>---</code> side is the <b>original</b>, the <code>+++</code> side is the <b>modified</b> version. Git writes <code>a/</code> and <code>b/</code> prefixes; <code>diff -u</code> may add timestamps. A brand new file shows <code>--- /dev/null</code>; a deleted one shows <code>+++ /dev/null</code>.</dd>
<dt><code>@@ -2,9 +2,11 @@</code> (the hunk header)</dt><dd>A <b>hunk</b> is one block of changes. Read it as: <code>-start,count</code> for the old file, <code>+start,count</code> for the new file. Here the old hunk covers 9 lines starting at line 2, the new one 11 lines starting at line 2. The new side is 2 lines longer because 2 lines were added net (3 added, 1 removed). After the closing <code>@@</code>, Git often prints the name of the function the hunk is in.</dd>
<dt>Lines starting with a space</dt><dd><b>Context</b>: unchanged lines (usually 3 above and below a change) that help you locate it.</dd>
<dt>Lines starting with <code>-</code></dt><dd>Present in the old version and <b>removed</b>.</dd>
<dt>Lines starting with <code>+</code></dt><dd><b>Added</b> in the new version.</dd>
</dl>
<p>A modified line is shown as a removal and an addition. In our diff the single changed comparison appears as one <code>-</code> line and one <code>+</code> line. The three added lines (one changed, two new) minus the one removed line explain the count going from 9 to 11.</p>
<div class="eg"><p><b>Your turn.</b> Look at the hunk above and answer: what was the bug, and what behaviour did the change add? The <code>-</code> line used strict comparisons, so VLAN 1 and VLAN 4094 were rejected: a boundary bug. The <code>+</code> lines add an <code>if not is_valid_vlan</code> check inside <code>make_vlan_config</code>, so bad ids now raise <code>ValueError</code>. Two separate changes inside one hunk range, which a careful reviewer might ask to be split into two commits.</p></div>

<h3>Network configuration diffs</h3>
<p>The same format works for device configs, which is why teams keep configs in version control and compare running config to the intended one:</p>
<pre class="out">--- sw1-before.cfg
+++ sw1-after.cfg
@@ -10,4 +10,5 @@
 interface GigabitEthernet0/5
<span class="hl">-  switchport access vlan 10</span>
<span class="hl">+  switchport access vlan 20</span>
   switchport mode access
<span class="hl">+  spanning-tree portfast</span>
 !</pre>
<p>Reading: port Gi0/5 moves from VLAN 10 to VLAN 20 and also gets PortFast. A reviewer asks: is the new VLAN trunked on the uplink, and does PortFast belong on this port (is it really an end host)?</p>
<div class="warn"><p><b>Common mistakes.</b> Reading the old and new sides the wrong way round (<code>-</code> is old, <code>+</code> is new). Ignoring the context lines. Assuming the numbers after <code>@@</code> are the number of changed lines: they are the start line and total line count of the hunk on each side. Missing a whitespace-only change, which can matter in YAML and Python.</p></div>
<div class="exam"><p><b>Exam trap.</b> Expect a diff on the screen and a question such as "which line was added?" or "what does the original file contain?". The original is built from <code>-</code> and context lines; the new file from <code>+</code> and context lines. A change to one line always shows as a <code>-</code> and a <code>+</code> pair.</p></div>

<h3>Code review: principles and benefits</h3>
<p>A <b>code review</b> is when someone other than the author reads a change and gives feedback before it is merged. In Git hosts this is a <b>pull request</b> or <b>merge request</b> showing the diff, comments and automated check results.</p>
<h4>What reviewers look at</h4>
<ul>
<li><b>Correctness.</b> Does it meet the requirement? Edge cases, error handling, boundaries.</li>
<li><b>Tests.</b> Are there tests for the new behaviour and do they pass?</li>
<li><b>Readability.</b> Clear names, small functions, comments that explain why.</li>
<li><b>Design.</b> Does it fit the structure (functions, classes, patterns) or add duplication?</li>
<li><b>Security and safety.</b> No passwords or tokens in the code, input is validated, nothing dangerous on production devices.</li>
<li><b>Standards and consistency.</b> Follows the team's style guide.</li>
</ul>
<h4>Principles of a good review</h4>
<ul>
<li><b>Small changes.</b> Keep a review to a size a person can understand in under an hour; very large diffs get a quick "looks fine".</li>
<li><b>Automate the boring part.</b> Let linters and tests check style and basics, so humans discuss design and logic.</li>
<li><b>Be kind and specific.</b> Comment on the code, not the person. Explain why, suggest an alternative, separate must-fix from nice-to-have.</li>
<li><b>The author explains.</b> A short description of what and why, and a link to the ticket.</li>
<li><b>Review promptly.</b> A change waiting for days blocks the team.</li>
<li><b>Everyone is reviewed,</b> including seniors, and everyone reviews.</li>
</ul>
<h4>Benefits</h4>
<ul>
<li><b>Fewer defects.</b> A second pair of eyes finds bugs that tests miss; fixing before merge is cheapest.</li>
<li><b>Knowledge sharing.</b> More than one person understands each part, so nobody is a single point of failure.</li>
<li><b>Consistency and quality.</b> The codebase keeps one style and good practices spread.</li>
<li><b>Mentoring.</b> Juniors learn from feedback; seniors learn new ideas too.</li>
<li><b>Shared ownership and security.</b> Risky changes and leaked secrets are caught early.</li>
</ul>
<div class="tip"><p><b>Network flavour.</b> Peer review also applies to a change plan or config diff before a maintenance window: a second engineer reads the diff, checks the rollback and approves. It is the same discipline.</p></div>

<div class="scn"><h4>The review that caught a token</h4><p>A junior engineer opened a pull request adding a script that queried the controller. The diff, five lines in, had <code>+ TOKEN = "..."</code> with a real API token pasted. The reviewer commented "This secret would stay in history forever; read it from an environment variable instead, and please revoke this one." The author rotated the token, changed the code and added a pre-commit check for secrets.</p><p><b>Lesson:</b> reading the diff line by line is how a review finds what tests cannot.</p></div>
<div class="iv"><p class="q">"How do you read a unified diff, and what makes a good code review?"</p><p>Headers show the old (<code>---</code>) and new (<code>+++</code>) files; <code>@@ -a,b +c,d @@</code> gives start line and length of the hunk in each; lines starting with a space are context, <code>-</code> removed, <code>+</code> added. A good review is small, kind and specific, backed by automated tests and linters, checks correctness, tests, readability and security, and is done promptly. Benefits: fewer bugs, shared knowledge, consistency and mentoring.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Unified diff: <code>---</code> old file, <code>+++</code> new file, <code>@@</code> hunk header, space = context, <code>-</code> removed, <code>+</code> added.</li>
<li><code>@@ -2,9 +2,11 @@</code> means old file lines from 2 (9 lines), new file from 2 (11 lines).</li>
<li>A changed line shows as a <code>-</code> and <code>+</code> pair.</li>
<li>Review principles: small changes, automation first, kind and specific, prompt, author explains.</li>
<li>Benefits: fewer defects, knowledge sharing, consistency, mentoring, early security catches.</li>
</ul></div>
`,hi:`
<p>Do blueprint items saath aate hain: <b>5.12 unified diff ke contents interpret karo</b> aur <b>5.13 code review ke principles aur benefits pehchano</b>. Jab koi colleague change propose karta hai, review screen ek <b>diff</b> dikhati hai: exactly kaun si lines hatayi gayi aur jodi gayi. Ise saaf padhna roz ki core skill hai.</p>

<h3>Analogy: document mein tracked changes</h3>
<p>Jab editor aapka essay lautata hai, delete kiye shabd laal mein kate hote hain aur naye shabd hare mein underline. Aap poora essay dobara nahi padhte; sirf marked changes dekhte ho. Diff usi ka plain-text version hai.</p>

<h3>Unified diff kaisa dikhta hai</h3>
<p><b>Unified diff</b> format woh hai jo <code>diff -u</code> aur Git print karte hain. Yeh ek asli diff hai: developer ne VLAN range check fix kiya aur <code>make_vlan_config</code> ko bad ids refuse karna sikhaya.</p>
<pre class="out"><span class="hl">diff --git a/vlan_tools.py b/vlan_tools.py</span>
index 3f2a1c9..8be40d2 100644
<span class="hl">--- a/vlan_tools.py</span>
<span class="hl">+++ b/vlan_tools.py</span>
<span class="hl">@@ -2,9 +2,11 @@</span>
 
 def is_valid_vlan(vid):
     """True if vid is a whole number from 1 to 4094."""
<span class="hl">-    return isinstance(vid, int) and 1 &lt; vid &lt; 4094</span>
<span class="hl">+    return isinstance(vid, int) and 1 &lt;= vid &lt;= 4094</span>
 
 
 def make_vlan_config(vid, name):
     """Return the config lines for one VLAN."""
<span class="hl">+    if not is_valid_vlan(vid):</span>
<span class="hl">+        raise ValueError(f"bad VLAN id {vid}")</span>
     return [f"vlan {vid}", f" name {name}"]</pre>

<h3>Tukde tukde mein padhna</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Diff ki anatomy">
<rect x="10" y="10" width="620" height="210" rx="8" fill="#f1f5f9" stroke="#cbd5e1"/>
<text x="25" y="38" class="svg-ink" font-size="12">--- a/vlan_tools.py</text><text x="330" y="38" class="svg-accent" font-size="12">OLD file ("a" side)</text>
<text x="25" y="62" class="svg-ink" font-size="12">+++ b/vlan_tools.py</text><text x="330" y="62" class="svg-accent" font-size="12">NEW file ("b" side)</text>
<text x="25" y="92" class="svg-ink" font-size="12">@@ -2,9 +2,11 @@</text><text x="330" y="92" class="svg-accent" font-size="12">old: line 2 se 9 lines | new: line 2 se 11 lines</text>
<text x="25" y="122" class="svg-ink" font-size="12">  (space) unchanged context line</text><text x="330" y="122" class="svg-muted" font-size="12">jagah dhoondhne ke liye dikhayi</text>
<text x="25" y="152" fill="#b91c1c" font-size="12">- removed line</text><text x="330" y="152" class="svg-muted" font-size="12">old mein hai, new mein nahi</text>
<text x="25" y="182" fill="#15803d" font-size="12">+ added line</text><text x="330" y="182" class="svg-muted" font-size="12">new mein hai, old mein nahi</text>
<text x="25" y="208" class="svg-muted" font-size="12">Badli hui line - line ke baad + line ke roop mein aati hai.</text>
</svg><p class="cap">Har unified diff ke wahi chaar hisse: file headers, hunk header, context lines, aur minus aur plus lines.</p></div>
<dl class="terms">
<dt><code>--- a/file</code> aur <code>+++ b/file</code></dt><dd>Do file headers. <code>---</code> side <b>original</b> hai, <code>+++</code> side <b>modified</b> version. Git <code>a/</code> aur <code>b/</code> prefixes likhta hai; <code>diff -u</code> timestamps jod sakta hai. Bilkul nayi file <code>--- /dev/null</code> dikhati hai; delete hui file <code>+++ /dev/null</code>.</dd>
<dt><code>@@ -2,9 +2,11 @@</code> (hunk header)</dt><dd><b>Hunk</b> changes ka ek block hai. Ise aise padho: <code>-start,count</code> old file ke liye, <code>+start,count</code> new file ke liye. Yahan old hunk line 2 se 9 lines cover karta hai, new line 2 se 11 lines. New side 2 lines lambi hai kyunki net 2 lines jodi gayi (3 added, 1 removed). Closing <code>@@</code> ke baad Git aksar us function ka naam print karta hai jisme hunk hai.</dd>
<dt>Space se shuru hone wali lines</dt><dd><b>Context</b>: unchanged lines (aam taur par change ke upar aur neeche 3) jo jagah dhoondhne mein madad karti hain.</dd>
<dt><code>-</code> se shuru hone wali lines</dt><dd>Old version mein thi aur <b>hata di gayi</b>.</dd>
<dt><code>+</code> se shuru hone wali lines</dt><dd>New version mein <b>jodi gayi</b>.</dd>
</dl>
<p>Badli hui line removal aur addition ke roop mein dikhti hai. Humare diff mein ek badla hua comparison ek <code>-</code> line aur ek <code>+</code> line ke roop mein aata hai. Teen added lines (ek badli, do nayi) minus ek removed line count ko 9 se 11 tak le jaati hai.</p>
<div class="eg"><p><b>Aapki baari.</b> Upar ka hunk dekho aur batao: bug kya tha, aur change ne kaun sa behaviour joda? <code>-</code> line strict comparisons use karti thi, isliye VLAN 1 aur VLAN 4094 reject hote the: boundary bug. <code>+</code> lines <code>make_vlan_config</code> ke andar <code>if not is_valid_vlan</code> check jodti hain, isliye bad ids ab <code>ValueError</code> raise karte hain. Ek hunk range ke andar do alag changes, jise careful reviewer do commits mein baantne ko keh sakta hai.</p></div>

<h3>Network configuration diffs</h3>
<p>Wahi format device configs ke liye kaam karta hai, isliye teams configs version control mein rakhti hain aur running config ko intended config se compare karti hain:</p>
<pre class="out">--- sw1-before.cfg
+++ sw1-after.cfg
@@ -10,4 +10,5 @@
 interface GigabitEthernet0/5
<span class="hl">-  switchport access vlan 10</span>
<span class="hl">+  switchport access vlan 20</span>
   switchport mode access
<span class="hl">+  spanning-tree portfast</span>
 !</pre>
<p>Padhna: port Gi0/5 VLAN 10 se VLAN 20 mein jaata hai aur use PortFast bhi milta hai. Reviewer poochta hai: kya naya VLAN uplink par trunk hai, aur kya is port par PortFast belong karta hai (kya sach mein end host hai)?</p>
<div class="warn"><p><b>Aam galtiyan.</b> Old aur new sides ulte padhna (<code>-</code> old hai, <code>+</code> new). Context lines ignore karna. Maan lena ki <code>@@</code> ke baad ke numbers badli hui lines ki ginti hain: woh har side par hunk ki start line aur total line count hain. Whitespace-only change miss karna, jo YAML aur Python mein matter kar sakta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Screen par diff aur "kaun si line add hui?" ya "original file mein kya hai?" jaisa question aayega. Original <code>-</code> aur context lines se banta hai; new file <code>+</code> aur context lines se. Ek line ka change hamesha <code>-</code> aur <code>+</code> ki jodi ke roop mein dikhta hai.</p></div>

<h3>Code review: principles aur benefits</h3>
<p><b>Code review</b> tab hota hai jab author ke alawa koi aur change padhta hai aur merge se pehle feedback deta hai. Git hosts mein yeh <b>pull request</b> ya <b>merge request</b> hai jo diff, comments aur automated check results dikhata hai.</p>
<h4>Reviewers kya dekhte hain</h4>
<ul>
<li><b>Correctness.</b> Kya requirement poori hoti hai? Edge cases, error handling, boundaries.</li>
<li><b>Tests.</b> Naye behaviour ke tests hain aur pass hote hain?</li>
<li><b>Readability.</b> Saaf naam, chhote functions, comments jo kyun batayein.</li>
<li><b>Design.</b> Kya structure (functions, classes, patterns) mein fit hota hai ya duplication jodta hai?</li>
<li><b>Security aur safety.</b> Code mein passwords ya tokens nahi, input validated, production devices par kuch khatarnaak nahi.</li>
<li><b>Standards aur consistency.</b> Team ki style guide follow karta hai.</li>
</ul>
<h4>Achhe review ke principles</h4>
<ul>
<li><b>Chhote changes.</b> Review ko itna chhota rakho ki insaan ek ghante mein samajh sake; bahut bade diffs ko jaldi "theek lag raha hai" mil jaata hai.</li>
<li><b>Boring hissa automate karo.</b> Linters aur tests style aur basics check karein, taaki insaan design aur logic par baat karein.</li>
<li><b>Kind aur specific raho.</b> Code par comment karo, insaan par nahi. Kyun batao, alternative suggest karo, must-fix ko nice-to-have se alag karo.</li>
<li><b>Author samjhata hai.</b> Kya aur kyun ka chhota description, aur ticket ka link.</li>
<li><b>Jaldi review karo.</b> Kai din intezaar karta change team ko rok deta hai.</li>
<li><b>Sabka review hota hai,</b> seniors ka bhi, aur sab review karte hain.</li>
</ul>
<h4>Benefits</h4>
<ul>
<li><b>Kam defects.</b> Doosri jodi aankhein woh bugs pakadti hain jo tests miss karte hain; merge se pehle fix karna sabse sasta hai.</li>
<li><b>Knowledge sharing.</b> Har hisse ko ek se zyada log samajhte hain, isliye koi single point of failure nahi.</li>
<li><b>Consistency aur quality.</b> Codebase ek style rakhta hai aur achhi practices phailti hain.</li>
<li><b>Mentoring.</b> Juniors feedback se seekhte hain; seniors bhi naye ideas seekhte hain.</li>
<li><b>Shared ownership aur security.</b> Risky changes aur leak hue secrets jaldi pakde jaate hain.</li>
</ul>
<div class="tip"><p><b>Network flavour.</b> Peer review maintenance window se pehle change plan ya config diff par bhi lagu hota hai: doosra engineer diff padhta hai, rollback check karta hai aur approve karta hai. Yeh wahi discipline hai.</p></div>

<div class="scn"><h4>Woh review jisne token pakda</h4><p>Ek junior engineer ne pull request kholi jisme controller query karne wali script thi. Diff mein paanchvi line par <code>+ TOKEN = "..."</code> thi aur asli API token paste tha. Reviewer ne comment kiya "Yeh secret history mein hamesha rahega; ise environment variable se padho, aur please yeh wala revoke karo." Author ne token rotate kiya, code badla aur secrets ke liye pre-commit check jod diya.</p><p><b>Lesson:</b> diff ko line by line padhna wahi hai jisse review woh pakadta hai jo tests nahi pakad paate.</p></div>
<div class="iv"><p class="q">"Unified diff kaise padhte ho, aur achha code review kya banata hai?"</p><p>Headers old (<code>---</code>) aur new (<code>+++</code>) files dikhate hain; <code>@@ -a,b +c,d @@</code> har side par hunk ki start line aur length deta hai; space se shuru lines context hain, <code>-</code> removed, <code>+</code> added. Achha review chhota, kind aur specific hota hai, automated tests aur linters se backed, correctness, tests, readability aur security check karta hai, aur jaldi hota hai. Benefits: kam bugs, shared knowledge, consistency aur mentoring.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Unified diff: <code>---</code> old file, <code>+++</code> new file, <code>@@</code> hunk header, space = context, <code>-</code> removed, <code>+</code> added.</li>
<li><code>@@ -2,9 +2,11 @@</code> matlab old file line 2 se (9 lines), new file line 2 se (11 lines).</li>
<li>Badli hui line <code>-</code> aur <code>+</code> ki jodi ke roop mein dikhti hai.</li>
<li>Review principles: chhote changes, pehle automation, kind aur specific, jaldi, author samjhaye.</li>
<li>Benefits: kam defects, knowledge sharing, consistency, mentoring, security ke early catches.</li>
</ul></div>
`}};export{e as default};