var e={id:`lab-walkthroughs`,h:{en:`Lab walkthroughs: pn-commit-vs-push, pn-push-order, pn-merge-candidate`,hi:`Lab walkthroughs: pn-commit-vs-push, pn-push-order, pn-merge-candidate`},body:{en:`
<p>This chapter prepares you for the three labs of this module. It gives you the thinking and the checks, not the typed answers: you should work out the exact commands from the earlier chapters. Read the brief, predict the outcome, then run it, and compare.</p>

<h3>Analogy: a driving test route</h3>
<p>Your instructor tells you the route landmarks, not every turn of the wheel. You still drive. Use this chapter the same way.</p>

<h3>Lab 1: pn-commit-vs-push</h3>
<p><b>Story.</b> An engineer says "I committed the SSH block, why can Pune still SSH out?". Pune and Delhi are managed in device group NK-BRANCHES.</p>
<ul>
<li><b>Predict first.</b> After a commit to Panorama and before a push, what does the Shared policy column say? Which package does the push need?</li>
<li><b>Second rule.</b> You stage Block-Telnet-Out and do not commit it. Which of the two rules will the firewalls hold after the push, and why? Ask yourself: what does push send?</li>
<li><b>Proof.</b> Use the firewall's show config pushed-shared-policy to see which rules arrived. Evidence beats reasoning in a ticket.</li>
</ul>
<p>Chapters to reread: 1, 2, 7.</p>

<h3>Lab 2: pn-push-order</h3>
<p><b>Story.</b> A device-group push fails on Chennai and Delhi, succeeds on Pune. Chennai is new; Delhi "was fine yesterday".</p>
<pre class="out">0079134988264     NK-DELHI-PA       commit failed: ... is already in use by a local rule: rename one of them
0079151765883     NK-CHENNAI-PA     commit failed: ... from 'trust' is not a valid reference</pre>
<ul>
<li><b>Classify each message</b> with the table from chapter 6. Each one has a different cause and a different fix, on a different device.</li>
<li><b>Chennai.</b> What does a rule need that the new firewall does not yet have? Which package carries it?</li>
<li><b>Delhi.</b> Which side owns the name? Where do you fix it, and what do you do afterwards on Panorama?</li>
<li><b>Dry run.</b> The task asks for validate-only before the real push. Read its result lines: what would you expect for each firewall after your two fixes?</li>
<li><b>Finish.</b> All three In Sync, and Chennai's PC can browse. That last test is the user-level proof.</li>
</ul>
<p>Chapters to reread: 5, 6, 8.</p>

<h3>Lab 3: pn-merge-candidate</h3>
<p><b>Story.</b> A colleague staged a temporary local rule Temp-Test on NK-PUNE-PA and left it uncommitted. You push twice with different values of one option.</p>
<ul>
<li><b>Predict.</b> After the push with merge no, is Temp-Test in the firewall's running configuration? After merge yes? Write your answers down before running.</li>
<li><b>Check.</b> Which firewall command shows the running (merged) configuration? Use it, not Panorama, to answer.</li>
<li><b>Name the option.</b> The last question asks which option commits the firewall's own pending changes during a push. You know it.</li>
</ul>
<p>Chapters to reread: 4, 9.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Lab map">
<rect x="20" y="25" width="180" height="60" rx="8" fill="#bae6fd"/><text x="110" y="52" text-anchor="middle" class="svg-ink" font-size="12">pn-commit-vs-push</text><text x="110" y="70" text-anchor="middle" class="svg-muted" font-size="11">commit is not push</text>
<rect x="230" y="25" width="180" height="60" rx="8" fill="#fed7aa"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="12">pn-push-order</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="11">order and clashes</text>
<rect x="440" y="25" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="530" y="52" text-anchor="middle" class="svg-ink" font-size="12">pn-merge-candidate</text><text x="530" y="70" text-anchor="middle" class="svg-muted" font-size="11">pending local changes</text>
</svg><p class="cap">Three labs, three questions: what is sent, what order, what happens to local edits.</p></div>

<h3>Lab habits that pay off</h3>
<ul>
<li>Run show devices all before and after each push; compare.</li>
<li>Always read the whole result block of commit-all, not just the last line.</li>
<li>When a step asks you a yes/no question, answer from evidence on the firewall.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Fixing the wrong device (Delhi's problem is on Delhi, not on Panorama); pushing for real without the validate-only step the task asks for; forgetting to commit a local rename on the firewall before pushing.</p></div>

<div class="scn"><h4>The same three skills at work</h4><p>On a real migration night the team met all three issues: an engineer thought a committed change was live, a new firewall rejected policy for missing zones, and a pending edit nearly went live with a push. The team that had practised these three labs recognised each symptom in under a minute.</p><p><b>Lesson:</b> labs build recognition, and recognition saves time.</p></div>

<div class="iv"><p class="q">"Tell me about a time you troubleshot a failed Panorama push."</p><p>Use the structure: which firewalls failed, how I classified each message, what I fixed and where, how I validated, how I verified with show commands and a user test. Even if your example comes from a lab, say so honestly.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Predict, run, compare: do not just follow steps.</li>
<li>Classify every failure message before fixing.</li>
<li>Prove outcomes with firewall show commands.</li>
<li>Reread chapters 1 to 9 if a prediction was wrong.</li>
</ul></div>
`,hi:`
<p>Ye chapter aapko is module ke teen labs ke liye taiyaar karta hai. Ye thinking aur checks deta hai, typed answers nahi: exact commands aapko pichhle chapters se nikaalne hain. Brief padho, outcome predict karo, phir run karo, aur compare karo.</p>

<h3>Analogy: driving test route</h3>
<p>Instructor aapko route ke landmarks batata hai, steering ka har mod nahi. Gaadi phir bhi aap chalate ho. Is chapter ko isi tarah use karo.</p>

<h3>Lab 1: pn-commit-vs-push</h3>
<p><b>Story.</b> Ek engineer kehta hai "maine SSH block commit kiya, Pune se SSH kyun nikalta hai?". Pune aur Delhi device group NK-BRANCHES mein managed hain.</p>
<ul>
<li><b>Pehle predict karo.</b> Commit to Panorama ke baad aur push se pehle Shared policy column kya kehta hai? Push ko kaunsa package chahiye?</li>
<li><b>Doosri rule.</b> Aap Block-Telnet-Out stage karte ho aur commit nahi karte. Push ke baad firewalls ke paas dono mein se kaunsi rule hogi, aur kyun? Khud se poocho: push kya bhejta hai?</li>
<li><b>Proof.</b> Firewall ka show config pushed-shared-policy use karo dekhne ke liye kaunsi rules pahunchi. Ticket mein evidence reasoning se behtar hai.</li>
</ul>
<p>Dobara padhne ke chapters: 1, 2, 7.</p>

<h3>Lab 2: pn-push-order</h3>
<p><b>Story.</b> Device-group push Chennai aur Delhi par fail hota hai, Pune par succeed. Chennai naya hai; Delhi "kal theek tha".</p>
<pre class="out">0079134988264     NK-DELHI-PA       commit failed: ... is already in use by a local rule: rename one of them
0079151765883     NK-CHENNAI-PA     commit failed: ... from 'trust' is not a valid reference</pre>
<ul>
<li><b>Har message classify karo</b> chapter 6 ki table se. Har ek ka alag cause aur alag fix hai, alag device par.</li>
<li><b>Chennai.</b> Rule ko kya chahiye jo naye firewall ke paas abhi nahi hai? Kaunsa package use le jaata hai?</li>
<li><b>Delhi.</b> Naam kiska hai? Fix kahan karoge, aur baad mein Panorama par kya karoge?</li>
<li><b>Dry run.</b> Task asli push se pehle validate-only maangta hai. Uski result lines padho: do fixes ke baad har firewall ke liye kya expect karoge?</li>
<li><b>Finish.</b> Teeno In Sync, aur Chennai ka PC browse kar sake. Wo aakhri test user-level proof hai.</li>
</ul>
<p>Dobara padhne ke chapters: 5, 6, 8.</p>

<h3>Lab 3: pn-merge-candidate</h3>
<p><b>Story.</b> Ek colleague ne NK-PUNE-PA par temporary local rule Temp-Test stage ki aur uncommitted chhod di. Aap ek option ki do alag values ke saath do baar push karte ho.</p>
<ul>
<li><b>Predict.</b> Merge no wale push ke baad kya Temp-Test firewall ki running configuration mein hai? Merge yes ke baad? Run karne se pehle jawab likh lo.</li>
<li><b>Check.</b> Kaunsa firewall command running (merged) configuration dikhata hai? Jawab dene ke liye wahi use karo, Panorama nahi.</li>
<li><b>Option ka naam.</b> Aakhri sawal poochta hai kaunsa option push ke dauraan firewall ke apne pending changes commit karta hai. Aap jaante ho.</li>
</ul>
<p>Dobara padhne ke chapters: 4, 9.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Lab map">
<rect x="20" y="25" width="180" height="60" rx="8" fill="#bae6fd"/><text x="110" y="52" text-anchor="middle" class="svg-ink" font-size="12">pn-commit-vs-push</text><text x="110" y="70" text-anchor="middle" class="svg-muted" font-size="11">commit push nahi hai</text>
<rect x="230" y="25" width="180" height="60" rx="8" fill="#fed7aa"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="12">pn-push-order</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="11">order aur clashes</text>
<rect x="440" y="25" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="530" y="52" text-anchor="middle" class="svg-ink" font-size="12">pn-merge-candidate</text><text x="530" y="70" text-anchor="middle" class="svg-muted" font-size="11">pending local changes</text>
</svg><p class="cap">Teen labs, teen sawal: kya bheja, kis order mein, local edits ka kya hota hai.</p></div>

<h3>Lab habits jo kaam aati hain</h3>
<ul>
<li>Har push se pehle aur baad show devices all chalao; compare karo.</li>
<li>commit-all ka poora result block padho, sirf aakhri line nahi.</li>
<li>Jab step yes/no sawal poochhe, firewall ke evidence se jawab do.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Galat device fix karna (Delhi ki problem Delhi par hai, Panorama par nahi); task jo validate-only step maangta hai uske bina asli push; push se pehle firewall par local rename commit karna bhool jaana.</p></div>

<div class="scn"><h4>Wahi teen skills kaam par</h4><p>Real migration night par team ko teeno issues mile: ek engineer ne committed change ko live samjha, naye firewall ne missing zones ki wajah se policy reject ki, aur ek pending edit push ke saath live hone wala tha. Jis team ne ye teen labs practise kiye the usne har symptom ek minute ke andar pehchan liya.</p><p><b>Lesson:</b> labs recognition banate hain, aur recognition time bachata hai.</p></div>

<div class="iv"><p class="q">"Kisi failed Panorama push ko troubleshoot karne ka experience batao."</p><p>Structure use karo: kaunse firewalls fail hue, har message kaise classify kiya, kya fix kiya aur kahan, validate kaise kiya, show commands aur user test se verify kaise kiya. Example lab ka ho to imaandari se batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Predict, run, compare: sirf steps follow mat karo.</li>
<li>Fix se pehle har failure message classify karo.</li>
<li>Outcomes firewall show commands se prove karo.</li>
<li>Prediction galat nikli to chapters 1 se 9 dobara padho.</li>
</ul></div>
`}};export{e as default};