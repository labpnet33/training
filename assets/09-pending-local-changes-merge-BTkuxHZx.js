var e={id:`pending-local-merge`,h:{en:`Pending local changes and merge-with-candidate-cfg`,hi:`Pending local changes aur merge-with-candidate-cfg`},body:{en:`
<p>A firewall managed by Panorama still has its own candidate configuration. Someone can log in locally, type a change, and leave it uncommitted. When Panorama pushes, what should happen to that half-finished edit? The option <code>merge-with-candidate-cfg</code> answers that question, and a wrong answer can put a colleague's unfinished experiment into production.</p>

<h3>Analogy: the unsaved draft on a shared desk</h3>
<p>A colleague leaves a half-written letter on a shared desk. The courier arrives with an official letter that must be filed in the same folder. Option no: the courier files only the official letter and leaves the draft on the desk. Option yes: the courier staples the draft to the official letter and files both, whether it was ready or not.</p>

<h3>The two values</h3>
<table class="tbl">
<tr><th>merge-with-candidate-cfg</th><th>Firewall's own pending change</th><th>Risk</th></tr>
<tr><td>no (lab default)</td><td>Stays pending in the candidate; not committed, not enforced</td><td>Low. A later local commit by that admin will still commit it</td></tr>
<tr><td>yes</td><td>Committed together with the pushed configuration and becomes running</td><td>High. Unreviewed, possibly unfinished config goes live</td></tr>
</table>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Merge option">
<rect x="20" y="20" width="200" height="50" rx="8" fill="#ddd6fe"/><text x="120" y="50" text-anchor="middle" class="svg-ink" font-size="12">Firewall candidate: Temp-Test</text>
<rect x="20" y="85" width="200" height="50" rx="8" fill="#fed7aa"/><text x="120" y="115" text-anchor="middle" class="svg-ink" font-size="12">Pushed policy arrives</text>
<rect x="330" y="20" width="290" height="50" rx="8" fill="#bbf7d0"/><text x="475" y="50" text-anchor="middle" class="svg-ink" font-size="12">merge no: running has pushed rules only</text>
<rect x="330" y="85" width="290" height="50" rx="8" fill="#fde68a"/><text x="475" y="115" text-anchor="middle" class="svg-ink" font-size="12">merge yes: running has pushed + Temp-Test</text>
</svg><p class="cap">The firewall's pending edit is either left alone or carried into production.</p></div>

<h3>What it looks like in the lab</h3>
<p>Lab <b>pn-merge-candidate</b> stages a temporary local rule on Pune and has you push twice. Predict the result before you run it: after the first push, is the rule in the running configuration? After the second?</p>
<pre class="code"><span class="c">! on PA1 (leave it uncommitted)</span>
PA1&gt; configure
PA1# set rulebase security rules Temp-Test from trust to untrust source any destination any application ssh service application-default action allow
PA1# exit
<span class="c">! on PANO</span>
PANO&gt; commit-all shared-policy device-group NK-BRANCHES include-template no merge-with-candidate-cfg no
PA1&gt; show config running</pre>
<p>Then repeat the push with <code>merge-with-candidate-cfg yes</code> and read <code>show config running</code> again. Notice that the pushed policy itself blocks SSH out, while Temp-Test allows SSH: committing the stray rule would change real behaviour on that site.</p>

<h3>Rules of thumb</h3>
<ul>
<li>Default to no, and state it explicitly in every push command.</li>
<li>Before any push, look at the firewall's pending changes (a local admin can tell you, or you can check the candidate on the firewall).</li>
<li>Use yes only when you have read the pending change and want it live, and record it in the ticket.</li>
<li>Pending local changes are a process problem: agree that local admins either commit or discard within the day.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Assuming a push will "clean up" the firewall's pending edits (it does not); using yes to make a failing push go through; not telling the local admin that a push is coming.</p></div>
<div class="exam"><p><b>Exam trap.</b> The option concerns the <b>firewall's</b> pending changes, not Panorama's candidate. Panorama's own uncommitted edits are never sent.</p></div>

<div class="scn"><h4>The test rule that went live</h4><p>An admin at a branch added a temporary allow rule to test an application and went to lunch. The central team pushed with the merge option on. The temporary rule was committed together with the policy and quietly opened a path that the central policy denies. It was found in the next audit.</p><p><b>Lesson:</b> merge yes commits other people's drafts.</p></div>

<div class="iv"><p class="q">"What does merge-with-candidate-cfg do?"</p><p>It decides whether pending, uncommitted local changes on the firewall are committed together with the pushed configuration. With no they stay pending; with yes they go live. I keep it no unless I have reviewed the pending change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Firewalls have their own candidate configuration.</li>
<li>merge no leaves pending edits pending; yes commits them with the push.</li>
<li>Review pending changes before you push; state the option explicitly.</li>
<li>Panorama's own uncommitted edits are never pushed.</li>
</ul></div>
`,hi:`
<p>Panorama se managed firewall ki bhi apni candidate configuration hoti hai. Koi local login karke change type karke uncommitted chhod sakta hai. Panorama push kare to us adhoore edit ka kya ho? Option <code>merge-with-candidate-cfg</code> isi ka jawab deta hai, aur galat jawab colleague ka adhoora experiment production mein daal sakta hai.</p>

<h3>Analogy: shared desk par unsaved draft</h3>
<p>Colleague shared desk par aadha likha letter chhod gaya. Courier ek official letter lekar aata hai jo usi folder mein file hona hai. Option no: courier sirf official letter file karta hai aur draft desk par chhod deta hai. Option yes: courier draft ko official letter ke saath staple karke dono file kar deta hai, ready ho ya na ho.</p>

<h3>Do values</h3>
<table class="tbl">
<tr><th>merge-with-candidate-cfg</th><th>Firewall ka apna pending change</th><th>Risk</th></tr>
<tr><td>no (lab default)</td><td>Candidate mein pending rehta hai; commit nahi, enforce nahi</td><td>Low. Wo admin baad mein local commit kare to ye bhi commit hoga</td></tr>
<tr><td>yes</td><td>Pushed configuration ke saath commit hota hai aur running ban jaata hai</td><td>High. Unreviewed, shayad adhoori config live ho jaati hai</td></tr>
</table>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Merge option">
<rect x="20" y="20" width="200" height="50" rx="8" fill="#ddd6fe"/><text x="120" y="50" text-anchor="middle" class="svg-ink" font-size="12">Firewall candidate: Temp-Test</text>
<rect x="20" y="85" width="200" height="50" rx="8" fill="#fed7aa"/><text x="120" y="115" text-anchor="middle" class="svg-ink" font-size="12">Pushed policy aati hai</text>
<rect x="330" y="20" width="290" height="50" rx="8" fill="#bbf7d0"/><text x="475" y="50" text-anchor="middle" class="svg-ink" font-size="12">merge no: running mein sirf pushed rules</text>
<rect x="330" y="85" width="290" height="50" rx="8" fill="#fde68a"/><text x="475" y="115" text-anchor="middle" class="svg-ink" font-size="12">merge yes: running mein pushed + Temp-Test</text>
</svg><p class="cap">Firewall ka pending edit ya to chhoda jaata hai ya production mein le jaaya jaata hai.</p></div>

<h3>Lab mein kaisa dikhta hai</h3>
<p>Lab <b>pn-merge-candidate</b> Pune par temporary local rule stage karta hai aur aapse do baar push karwata hai. Chalane se pehle result predict karo: pehle push ke baad kya rule running configuration mein hai? Doosre ke baad?</p>
<pre class="code"><span class="c">! PA1 par (uncommitted chhod do)</span>
PA1&gt; configure
PA1# set rulebase security rules Temp-Test from trust to untrust source any destination any application ssh service application-default action allow
PA1# exit
<span class="c">! PANO par</span>
PANO&gt; commit-all shared-policy device-group NK-BRANCHES include-template no merge-with-candidate-cfg no
PA1&gt; show config running</pre>
<p>Phir push <code>merge-with-candidate-cfg yes</code> ke saath repeat karo aur <code>show config running</code> dobara padho. Dhyan do ki pushed policy khud SSH out block karti hai, jabki Temp-Test SSH allow karti hai: stray rule commit karne se us site ka real behaviour badal jaata hai.</p>

<h3>Rules of thumb</h3>
<ul>
<li>Default no rakho, aur har push command mein explicitly likho.</li>
<li>Kisi bhi push se pehle firewall ke pending changes dekho (local admin bata sakta hai, ya firewall par candidate check karo).</li>
<li>Yes tabhi use karo jab pending change padh liya ho aur live chahiye, aur ticket mein record karo.</li>
<li>Pending local changes process problem hain: agree karo ki local admins din ke andar commit ya discard karein.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Ye maanna ki push firewall ke pending edits "saaf" kar dega (nahi karta); failing push ko nikalne ke liye yes use karna; local admin ko batana ki push aa raha hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Option <b>firewall</b> ke pending changes ke baare mein hai, Panorama ki candidate ke nahi. Panorama ke apne uncommitted edits kabhi nahi bheje jaate.</p></div>

<div class="scn"><h4>Test rule jo live ho gayi</h4><p>Ek branch ke admin ne application test karne ke liye temporary allow rule add ki aur lunch par chala gaya. Central team ne merge option on rakhkar push kiya. Temporary rule policy ke saath commit ho gayi aur chupchaap wo raasta khol diya jo central policy deny karti hai. Agle audit mein pakda gaya.</p><p><b>Lesson:</b> merge yes doosron ke drafts commit kar deta hai.</p></div>

<div class="iv"><p class="q">"merge-with-candidate-cfg kya karta hai?"</p><p>Ye decide karta hai ki firewall ke pending, uncommitted local changes pushed configuration ke saath commit hon ya nahi. No mein pending rehte hain; yes mein live ho jaate hain. Pending change review kiye bina main no hi rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Firewalls ki apni candidate configuration hoti hai.</li>
<li>merge no pending edits ko pending rakhta hai; yes unhe push ke saath commit karta hai.</li>
<li>Push se pehle pending changes review karo; option explicitly likho.</li>
<li>Panorama ke apne uncommitted edits kabhi push nahi hote.</li>
</ul></div>
`}};export{e as default};