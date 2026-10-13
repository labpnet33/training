var e={id:`decisions`,h:{en:`Decisions: if / elif / else`,hi:`Decisions: if / elif / else`},body:{en:`
<p>When you read <code>show ip interface brief</code> you do not treat every line the same. An interface that is <code>up</code> is fine. One that is <code>down</code> needs a cable check. One that is <code>administratively down</code> was shut on purpose, so you leave it alone. You make a <b>decision</b> for each line. Python makes decisions with <code>if</code>, <code>elif</code> (else if) and <code>else</code>.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Decision branches">
<rect x="240" y="10" width="160" height="40" rx="10" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">status?</text>
<rect x="20" y="90" width="170" height="44" rx="10" fill="#bbf7d0"/><text x="105" y="117" text-anchor="middle" class="svg-ink" font-size="14">== "up": OK</text>
<rect x="235" y="90" width="170" height="44" rx="10" fill="#fed7aa"/><text x="320" y="117" text-anchor="middle" class="svg-ink" font-size="14">== "down": WARN</text>
<rect x="450" y="90" width="170" height="44" rx="10" fill="#e2e8f0"/><text x="535" y="117" text-anchor="middle" class="svg-ink" font-size="14">else: ignore</text>
<line x1="290" y1="50" x2="105" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="50" x2="320" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="350" y1="50" x2="535" y2="90" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Python tests the conditions from top to bottom and runs only the first branch that is true.</p></div>
<pre class="code">for status in ["up", "down", "administratively down"]:
    if status == "up":
        print(status, "-&gt; OK")
    elif status == "down":
        print(status, "-&gt; WARNING: check the cable")
    else:
        print(status, "-&gt; shut on purpose, ignore")</pre>
<pre class="out">AUTO&gt; python3 c1.py
up -&gt; OK
down -&gt; WARNING: check the cable
administratively down -&gt; shut on purpose, ignore</pre>
<ul>
<li>The <code>if</code> line ends with a <b>colon</b>; the lines under it are indented by 4 spaces.</li>
<li>Python checks <code>if</code>, then each <code>elif</code>, in order, and runs the <b>first</b> one whose condition is <code>True</code>. All others are skipped.</li>
<li><code>else</code> has no condition. It catches everything that is left. You may leave it out.</li>
</ul>
<h3>Exact match matters</h3>
<p><code>==</code> on strings must match <b>exactly</b>. "administratively down" is a different string from "down", so it falls into <code>else</code>. This is a useful property here: a port you shut on purpose is not a cable fault.</p>
<pre class="code">print("administratively down" == "down")
print("down" in "administratively down")
print("down" == "down")</pre>
<pre class="out">AUTO&gt; python3 c2.py
False
True
True</pre>
<p>The second line shows a trap: the word <code>in</code> asks "is it contained anywhere", so <code>"down" in "administratively down"</code> is <code>True</code>. Use <code>==</code> when you mean the whole value.</p>
<h3>Combining conditions</h3>
<p>Join conditions with <code>and</code> (both must be true), <code>or</code> (at least one) and <code>not</code> (flip). To act only when a list has something in it, test its length or simply the list itself: an empty list counts as <code>False</code>.</p>
<pre class="code">role = "core"
site = "Pune"
if role == "core" and site == "Pune":
    print("Pune core device")
down = []
if len(down) &gt; 0:
    print("something is down")
else:
    print("nothing is down")
down.append("Gi0/2")
if down:
    print("now a list with items counts as True:", down)
if not down == []:
    print("same idea, written with not")</pre>
<pre class="out">AUTO&gt; python3 c3.py
Pune core device
nothing is down
now a list with items counts as True: ['Gi0/2']
same idea, written with not</pre>
<p>Notice that nothing was printed for the first <code>if len(down) &gt; 0</code> branch, but the <code>else</code> branch ran. After <code>append</code> the list is no longer empty, so <code>if down:</code> is true.</p>
<h3>The missing colon</h3>
<pre class="code">status = "up"
if status == "up"
    print("OK")</pre>
<pre class="out">AUTO&gt; python3 c4.py
  File "c4.py", line 2
    if status == "up"
                   ^
<span class="hl">SyntaxError: expected ':'</span></pre>
<p>The arrow points just after the condition: Python expected a colon there.</p>
<div class="eg"><p><b>Worked example.</b> A compliance rule: "every core device must be reachable and not in Pune's maintenance list". In Python: <code>if role == "core" and name not in maintenance:</code>. The sentence and the code read almost the same.</p></div>
<div class="warn"><p><b>Common mistake.</b> Writing <code>if status = "up":</code> with one equals sign, forgetting the colon, or mis-indenting the branch. Also, a series of separate <code>if</code> lines is not the same as <code>if / elif</code>: separate ifs are all checked, elif stops at the first match.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the order of evaluation (top to bottom, first true branch wins), exact-string comparison, and that <code>and</code> binds tighter than <code>or</code>. An empty list, empty string and 0 are all falsy.</p></div>
<div class="scn"><h4>The alert storm</h4><p>A monitoring script alerted on every interface that was not <code>up</code>. On a 48-port switch with many unused shut ports it sent 30 alerts a night. Changing the logic to alert only when the status was exactly <code>down</code> (a cable fault) and ignore <code>administratively down</code> reduced it to the two real problems.</p><p><b>Lesson:</b> the exact condition you write decides whether alerts are useful or noise.</p></div>
<div class="iv"><p class="q">"What is the difference between if/elif/else and several separate if statements?"</p><p>In an if / elif / else chain, Python stops at the first true condition and skips the rest, so exactly one branch runs. With separate if statements every condition is tested independently, so several (or none) can run. Use elif when the cases are mutually exclusive.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>if runs its indented lines only when the condition is True; elif and else add alternatives.</li>
<li>The first true branch wins; the rest are skipped.</li>
<li>== on strings is an exact match; "in" tests containment.</li>
<li>An empty list counts as False; len(x) &gt; 0 or just "if x:" tests for content.</li>
</ul></div>
`,hi:`
<p>Jab aap <code>show ip interface brief</code> padhte ho to har line ko ek jaisa nahi maante. <code>up</code> interface theek hai. <code>down</code> wale ke liye cable check chahiye. <code>administratively down</code> jaan-boojh kar shut kiya gaya, isliye use chhod dete ho. Aap har line ke liye ek <b>decision</b> lete ho. Python decisions <code>if</code>, <code>elif</code> (else if) aur <code>else</code> se leta hai.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Decision branches">
<rect x="240" y="10" width="160" height="40" rx="10" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">status?</text>
<rect x="20" y="90" width="170" height="44" rx="10" fill="#bbf7d0"/><text x="105" y="117" text-anchor="middle" class="svg-ink" font-size="14">== "up": OK</text>
<rect x="235" y="90" width="170" height="44" rx="10" fill="#fed7aa"/><text x="320" y="117" text-anchor="middle" class="svg-ink" font-size="14">== "down": WARN</text>
<rect x="450" y="90" width="170" height="44" rx="10" fill="#e2e8f0"/><text x="535" y="117" text-anchor="middle" class="svg-ink" font-size="14">else: ignore</text>
<line x1="290" y1="50" x2="105" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="50" x2="320" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="350" y1="50" x2="535" y2="90" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Python conditions ko upar se neeche test karta hai aur sirf pehli true branch chalata hai.</p></div>
<pre class="code">for status in ["up", "down", "administratively down"]:
    if status == "up":
        print(status, "-&gt; OK")
    elif status == "down":
        print(status, "-&gt; WARNING: check the cable")
    else:
        print(status, "-&gt; shut on purpose, ignore")</pre>
<pre class="out">AUTO&gt; python3 c1.py
up -&gt; OK
down -&gt; WARNING: check the cable
administratively down -&gt; shut on purpose, ignore</pre>
<ul>
<li><code>if</code> line <b>colon</b> par khatam hoti hai; uske neeche ki lines 4 spaces indent hoti hain.</li>
<li>Python pehle <code>if</code>, phir har <code>elif</code> order mein check karta hai, aur <b>pehli</b> jiski condition <code>True</code> ho woh chalata hai. Baaki skip ho jaate hain.</li>
<li><code>else</code> ki koi condition nahi hoti. Yeh bacha hua sab pakadta hai. Aap ise chhod bhi sakte ho.</li>
</ul>
<h3>Exact match matter karta hai</h3>
<p>Strings par <code>==</code> ko <b>exactly</b> match karna padta hai. "administratively down" "down" se alag string hai, isliye woh <code>else</code> mein jaati hai. Yahan yeh kaam ki property hai: jo port aapne jaan-boojh kar shut kiya woh cable fault nahi hai.</p>
<pre class="code">print("administratively down" == "down")
print("down" in "administratively down")
print("down" == "down")</pre>
<pre class="out">AUTO&gt; python3 c2.py
False
True
True</pre>
<p>Doosri line ek trap dikhati hai: word <code>in</code> poochta hai "kya yeh kahin andar hai", isliye <code>"down" in "administratively down"</code> <code>True</code> hai. Poori value ka matlab ho to <code>==</code> use karo.</p>
<h3>Conditions jodna</h3>
<p>Conditions ko <code>and</code> (dono true), <code>or</code> (kam se kam ek) aur <code>not</code> (ulta) se jodo. Tabhi action lena ho jab list mein kuch ho, to uski length test karo ya seedha list ko: khaali list <code>False</code> maani jaati hai.</p>
<pre class="code">role = "core"
site = "Pune"
if role == "core" and site == "Pune":
    print("Pune core device")
down = []
if len(down) &gt; 0:
    print("something is down")
else:
    print("nothing is down")
down.append("Gi0/2")
if down:
    print("now a list with items counts as True:", down)
if not down == []:
    print("same idea, written with not")</pre>
<pre class="out">AUTO&gt; python3 c3.py
Pune core device
nothing is down
now a list with items counts as True: ['Gi0/2']
same idea, written with not</pre>
<p>Dhyan do ki pehli <code>if len(down) &gt; 0</code> branch ne kuch print nahi kiya, lekin <code>else</code> branch chali. <code>append</code> ke baad list khaali nahi rahi, isliye <code>if down:</code> true hai.</p>
<h3>Chhoota hua colon</h3>
<pre class="code">status = "up"
if status == "up"
    print("OK")</pre>
<pre class="out">AUTO&gt; python3 c4.py
  File "c4.py", line 2
    if status == "up"
                   ^
<span class="hl">SyntaxError: expected ':'</span></pre>
<p>Arrow condition ke theek baad ishara karta hai: Python wahan colon expect kar raha tha.</p>
<div class="eg"><p><b>Worked example.</b> Ek compliance rule: "har core device reachable ho aur Pune ki maintenance list mein na ho". Python mein: <code>if role == "core" and name not in maintenance:</code>. Sentence aur code lagbhag ek jaise padhe jaate hain.</p></div>
<div class="warn"><p><b>Common galti.</b> Ek equals sign ke saath <code>if status = "up":</code> likhna, colon bhool jaana, ya branch ki indentation galat karna. Aur alag-alag <code>if</code> lines <code>if / elif</code> ke barabar nahi: alag ifs sab check hote hain, elif pehle match par ruk jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Evaluation ka order (upar se neeche, pehli true branch jeetti hai), exact-string comparison yaad rakho, aur ye ki <code>and</code>, <code>or</code> se zyada tight bandhta hai. Khaali list, khaali string aur 0 sab falsy hain.</p></div>
<div class="scn"><h4>Alert ki baarish</h4><p>Ek monitoring script har us interface par alert karta tha jo <code>up</code> nahi tha. 48-port switch par kai unused shut ports ke saath woh raat mein 30 alerts bhejta tha. Logic badal kar sirf tab alert karna jab status exactly <code>down</code> ho (cable fault) aur <code>administratively down</code> ignore karna, ise do asli problems tak le aaya.</p><p><b>Lesson:</b> aap jo exact condition likhte ho woh decide karti hai ki alerts kaam ke hain ya noise.</p></div>
<div class="iv"><p class="q">"if/elif/else aur kai alag if statements mein kya fark hai?"</p><p>if / elif / else chain mein Python pehli true condition par ruk jaata hai aur baaki skip karta hai, isliye exactly ek branch chalti hai. Alag if statements mein har condition independently test hoti hai, isliye kai (ya koi nahi) chal sakti hain. Cases ek doosre ko exclude karte hon to elif use karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>if apni indented lines tabhi chalata hai jab condition True ho; elif aur else alternatives jodte hain.</li>
<li>Pehli true branch jeetti hai; baaki skip hoti hain.</li>
<li>Strings par == exact match hai; "in" containment test karta hai.</li>
<li>Khaali list False maani jaati hai; len(x) &gt; 0 ya sirf "if x:" content test karta hai.</li>
</ul></div>
`}};export{e as default};