var e={id:`troubleshooting`,h:{en:`Troubleshooting: read the traceback, fix, render again`,hi:`Troubleshooting: traceback padho, fix karo, phir render karo`},body:{en:`
<p><b>The idea of this chapter:</b> a template project fails in only a few ways. Each failure leaves a clue, and the clue is nearly always in the <b>last line</b> of the error message. You will break the lab project on purpose, in the order a real beginner meets the errors, and fix each one.</p>

<h3>Analogy: a courier's "delivery failed" slip</h3>
<p>The slip says <i>why</i>: wrong address, house locked, parcel damaged. You do not read the whole route history; you read the reason and act on it. A Python traceback is the same. The top lines show the path the program took; the last line says what went wrong.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Four common failures and where to look">
<rect x="10" y="20" width="145" height="78" rx="10" fill="#fecaca"/><text x="82" y="46" text-anchor="middle" class="svg-ink" font-size="12">TemplateNotFound</text><text x="82" y="68" text-anchor="middle" class="svg-muted" font-size="11">wrong folder name</text>
<rect x="170" y="20" width="145" height="78" rx="10" fill="#fde68a"/><text x="242" y="46" text-anchor="middle" class="svg-ink" font-size="12">TemplateSyntaxError</text><text x="242" y="68" text-anchor="middle" class="svg-muted" font-size="11">tag not closed</text>
<rect x="330" y="20" width="145" height="78" rx="10" fill="#ddd6fe"/><text x="402" y="46" text-anchor="middle" class="svg-ink" font-size="12">ValueError</text><text x="402" y="68" text-anchor="middle" class="svg-muted" font-size="11">bad address data</text>
<rect x="490" y="20" width="140" height="78" rx="10" fill="#bae6fd"/><text x="560" y="46" text-anchor="middle" class="svg-ink" font-size="12">Silent blank</text><text x="560" y="68" text-anchor="middle" class="svg-muted" font-size="11">typo in a name</text>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">three stop the script and tell you; the fourth stays quiet unless you ask</text>
</svg><p class="cap">The quiet failure is the dangerous one.</p></div>

<h3>Failure 1: TemplateNotFound</h3>
<pre class="out">AUTO01$ python3 render.py
Traceback (most recent call last):
  File "render.py", line 9, in &lt;module&gt;
    template = env.get_template("branch.j2")
<span class="hl">TemplateNotFound: 'branch.j2' not found in search path: 'template'</span></pre>
<p>Read it: line 9 asked for <code>branch.j2</code>, and Jinja looked only in a folder called <code>template</code>. The real folder is <code>templates</code>, with an s. Find the line and fix it with a one-line edit:</p>
<pre class="code">grep -n FileSystemLoader render.py
sed -i 's/FileSystemLoader("template")/FileSystemLoader("templates")/' render.py</pre>
<p><code>grep -n</code> shows line 8 of <code>render.py</code>; <code>sed -i</code> replaces the text inside the file. Run <code>python3 render.py</code> again.</p>

<h3>Failure 2: TemplateSyntaxError</h3>
<pre class="out">AUTO01$ python3 render.py
Traceback (most recent call last):
  File "render.py", line 9, in &lt;module&gt;
    template = env.get_template("branch.j2")
<span class="hl">TemplateSyntaxError: Unexpected end of template. Jinja was looking for the following tags: 'endfor' or 'else'. The innermost block that needs to be closed is 'for'.</span>
  File "branch.j2", line 8</pre>
<p>The template opened a <code>{% for %}</code> on line 8 and never wrote <code>{% endfor %}</code>. The last line of the file shows where it should go: after the VLAN interface block, before the static route. The lab gives a helper that inserts text after a given line number:</p>
<pre class="code">insert templates/branch.j2 14 {% endfor %}</pre>
<p>The error names the tag you forgot, <code>endfor</code>. Every <code>for</code> needs an <code>endfor</code>, every <code>if</code> an <code>endif</code>.</p>

<h3>Failure 3: ValueError from ipaddress</h3>
<pre class="out">AUTO01$ python3 render.py
Traceback (most recent call last):
  File "render.py", line 16, in &lt;module&gt;
    wan = ipaddress.ip_network(site["wan"])
<span class="hl">ValueError: 100.64.10.2/30 has host bits set</span></pre>
<p>This is the error from chapter 5. <code>ip_network</code> wants a network address such as <code>100.64.10.0/30</code>; the data holds the router's own address, <code>100.64.10.2/30</code>. Use <code>ip_interface</code> for "an address and its prefix":</p>
<pre class="code">sed -i 's/ip_network(site\\["wan"\\])/ip_interface(site["wan"])/' render.py</pre>
<pre class="out">AUTO01$ python3 render.py
rendered configs/BLR-BR-R1.cfg
rendered configs/HYD-BR-R1.cfg</pre>

<h3>Failure 4: the quiet one</h3>
<p>The script now says "rendered" for both files, but is the output right? Compare with a reviewed copy:</p>
<pre class="out">AUTO01$ diff configs/BLR-BR-R1.cfg golden/BLR-BR-R1.cfg
1c1
<span class="hl">&lt; hostname </span>
---
&gt; hostname BLR-BR-R1</pre>
<p>Reading <code>diff</code>: <code>1c1</code> means line 1 changed. The <code>&lt;</code> line is <i>your</i> file (empty hostname) and the <code>&gt;</code> line is the reviewed one. Look at the template: line 1 says <code>site.hostnme</code>, a typo. By default Jinja prints nothing for a missing name. That is why this error is quiet: no crash, just a wrong config.</p>
<p>Turn the quiet failure into a loud one with <code>StrictUndefined</code>. The lab shows it as two edits to <code>render.py</code>: import it, then pass <code>undefined=StrictUndefined</code> to <code>Environment</code>.</p>
<pre class="out">AUTO01$ python3 render.py
Traceback (most recent call last):
  File "render.py", line 24, in &lt;module&gt;
    config = template.render(site=site)
<span class="hl">UndefinedError: 'dict object' has no attribute 'hostnme'</span></pre>
<p>Now the typo is named exactly. Fix the template (<code>sed -i 's/hostnme/hostname/' templates/branch.j2</code>), render again, and prove it:</p>
<pre class="out">AUTO01$ diff configs/BLR-BR-R1.cfg golden/BLR-BR-R1.cfg &amp;&amp; diff configs/HYD-BR-R1.cfg golden/HYD-BR-R1.cfg &amp;&amp; echo MATCH
<span class="hl">MATCH</span></pre>
<p><code>&amp;&amp;</code> runs the next command only if the previous one succeeded, and <code>diff</code> succeeds only when the files are identical, so <code>MATCH</code> prints only when both files match.</p>

<div class="eg"><p><b>Worked example: the five-step routine.</b> 1) Run the script and read only the <b>last line</b>. 2) Note the file and line number just above it. 3) Open that line (<code>nl -ba file</code> shows line numbers). 4) Fix one thing. 5) Run again. Never fix three things at once; you will not know which change helped.</p></div>

<div class="note"><p><b>Reference code (not run in the simulator).</b> Keep <code>StrictUndefined</code> on for every production render. Many teams add a test that renders sample data and compares it with a golden file on every change; the diff above is that test, done by hand.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Fixing a symptom instead of the cause (adding a blank hostname to the golden file). Editing the rendered file by hand; the next render overwrites it, so always edit the template or the data. Ignoring the line number in the message. Pushing a config that "rendered without errors" but was never read.</p></div>
<div class="exam"><p><b>Exam trap.</b> A missing variable is <i>not</i> an error unless <code>StrictUndefined</code> is on; the output is silently empty. And <code>has host bits set</code> means you used a host address where a network address was expected, so the fix is usually <code>ip_interface</code>.</p></div>

<div class="scn"><h4>The branch router with no hostname</h4><p>A new branch router came up as "Router" because the rendered config started with an empty <code>hostname</code> line. The script printed "rendered" and nothing failed. The cause was a typo in a template variable. The fix added <code>StrictUndefined</code> and a diff against a golden file to the pipeline, so the same typo now stops the render with its name in the message.</p><p><b>Lesson:</b> make mistakes loud, and compare output with something known to be good.</p></div>

<div class="iv"><p class="q">"Your template rendered a blank value. How do you debug and prevent it?"</p><p>First diff the output against a reviewed copy to see the exact line. Then check the template for a misspelled variable or a key missing from the data. To prevent it, enable <code>StrictUndefined</code> so that a missing name raises an error, and keep golden-file comparisons in the pipeline.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read the last line of a traceback first, then the line number above it.</li>
<li>TemplateNotFound: folder name. TemplateSyntaxError: unclosed tag. ValueError: bad address data.</li>
<li>Missing variables render blank unless <code>StrictUndefined</code> is on.</li>
<li><code>diff</code> prints nothing when files match; <code>&lt;</code> is yours, <code>&gt;</code> is the reference.</li>
<li>Fix one thing at a time and edit the template or data, never the output.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> template project sirf kuch hi tareeko se fail hota hai. Har failure clue chhodta hai, aur clue lagbhag hamesha error message ki <b>aakhri line</b> mein hota hai. Aap lab project ko jaan-boojhkar todoge, usi order mein jaise asli beginner ko errors milte hain, aur har ek ko fix karoge.</p>

<h3>Analogy: courier ki "delivery failed" parchi</h3>
<p>Parchi <i>kyon</i> batati hai: galat address, ghar band, parcel kharab. Aap poora route history nahi padhte; wajah padhkar action lete ho. Python traceback bhi aisa hi hai. Upar ki lines program ka raasta dikhati hain; aakhri line batati hai ki kya galat hua.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Chaar common failures aur kahan dekhna hai">
<rect x="10" y="20" width="145" height="78" rx="10" fill="#fecaca"/><text x="82" y="46" text-anchor="middle" class="svg-ink" font-size="12">TemplateNotFound</text><text x="82" y="68" text-anchor="middle" class="svg-muted" font-size="11">galat folder naam</text>
<rect x="170" y="20" width="145" height="78" rx="10" fill="#fde68a"/><text x="242" y="46" text-anchor="middle" class="svg-ink" font-size="12">TemplateSyntaxError</text><text x="242" y="68" text-anchor="middle" class="svg-muted" font-size="11">tag band nahi kiya</text>
<rect x="330" y="20" width="145" height="78" rx="10" fill="#ddd6fe"/><text x="402" y="46" text-anchor="middle" class="svg-ink" font-size="12">ValueError</text><text x="402" y="68" text-anchor="middle" class="svg-muted" font-size="11">galat address data</text>
<rect x="490" y="20" width="140" height="78" rx="10" fill="#bae6fd"/><text x="560" y="46" text-anchor="middle" class="svg-ink" font-size="12">Silent blank</text><text x="560" y="68" text-anchor="middle" class="svg-muted" font-size="11">naam mein typo</text>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">teen script rokte hain aur batate hain; chautha chup rehta hai jab tak aap na poochho</text>
</svg><p class="cap">Chup rehne wala failure sabse khatarnak hai.</p></div>

<h3>Failure 1: TemplateNotFound</h3>
<pre class="out">AUTO01$ python3 render.py
Traceback (most recent call last):
  File "render.py", line 9, in &lt;module&gt;
    template = env.get_template("branch.j2")
<span class="hl">TemplateNotFound: 'branch.j2' not found in search path: 'template'</span></pre>
<p>Padho: line 9 ne <code>branch.j2</code> maanga, aur Jinja ne sirf <code>template</code> naam ke folder mein dekha. Asli folder <code>templates</code> hai, s ke saath. Line dhoondho aur ek line ke edit se theek karo:</p>
<pre class="code">grep -n FileSystemLoader render.py
sed -i 's/FileSystemLoader("template")/FileSystemLoader("templates")/' render.py</pre>
<p><code>grep -n</code> <code>render.py</code> ki line 8 dikhata hai; <code>sed -i</code> file ke andar text badalta hai. <code>python3 render.py</code> dobara chalao.</p>

<h3>Failure 2: TemplateSyntaxError</h3>
<pre class="out">AUTO01$ python3 render.py
Traceback (most recent call last):
  File "render.py", line 9, in &lt;module&gt;
    template = env.get_template("branch.j2")
<span class="hl">TemplateSyntaxError: Unexpected end of template. Jinja was looking for the following tags: 'endfor' or 'else'. The innermost block that needs to be closed is 'for'.</span>
  File "branch.j2", line 8</pre>
<p>Template ne line 8 par <code>{% for %}</code> kholi aur <code>{% endfor %}</code> kabhi nahi likha. File ki aakhri line dikhati hai ki woh kahan jaana chahiye: VLAN interface block ke baad, static route se pehle. Lab ek helper deta hai jo diye gaye line number ke baad text daalta hai:</p>
<pre class="code">insert templates/branch.j2 14 {% endfor %}</pre>
<p>Error us tag ka naam batata hai jo aap bhool gaye, <code>endfor</code>. Har <code>for</code> ko <code>endfor</code> chahiye, har <code>if</code> ko <code>endif</code>.</p>

<h3>Failure 3: ipaddress se ValueError</h3>
<pre class="out">AUTO01$ python3 render.py
Traceback (most recent call last):
  File "render.py", line 16, in &lt;module&gt;
    wan = ipaddress.ip_network(site["wan"])
<span class="hl">ValueError: 100.64.10.2/30 has host bits set</span></pre>
<p>Yeh chapter 5 wala error hai. <code>ip_network</code> ko <code>100.64.10.0/30</code> jaisa network address chahiye; data mein router ka apna address <code>100.64.10.2/30</code> hai. "Address aur uska prefix" ke liye <code>ip_interface</code> use karo:</p>
<pre class="code">sed -i 's/ip_network(site\\["wan"\\])/ip_interface(site["wan"])/' render.py</pre>
<pre class="out">AUTO01$ python3 render.py
rendered configs/BLR-BR-R1.cfg
rendered configs/HYD-BR-R1.cfg</pre>

<h3>Failure 4: chup rehne wala</h3>
<p>Script ab dono files ke liye "rendered" kehti hai, lekin kya output sahi hai? Reviewed copy se compare karo:</p>
<pre class="out">AUTO01$ diff configs/BLR-BR-R1.cfg golden/BLR-BR-R1.cfg
1c1
<span class="hl">&lt; hostname </span>
---
&gt; hostname BLR-BR-R1</pre>
<p><code>diff</code> padhna: <code>1c1</code> ka matlab line 1 badli. <code>&lt;</code> line <i>aapki</i> file hai (khaali hostname) aur <code>&gt;</code> line reviewed wali hai. Template dekho: line 1 mein <code>site.hostnme</code> hai, typo. Default mein Jinja missing naam ke liye kuch print nahi karta. Isiliye yeh error chup hai: crash nahi, bas galat config.</p>
<p>Chup failure ko <code>StrictUndefined</code> se zor-daar bana do. Lab ise <code>render.py</code> mein do edits ki tarah dikhata hai: use import karo, phir <code>Environment</code> ko <code>undefined=StrictUndefined</code> do.</p>
<pre class="out">AUTO01$ python3 render.py
Traceback (most recent call last):
  File "render.py", line 24, in &lt;module&gt;
    config = template.render(site=site)
<span class="hl">UndefinedError: 'dict object' has no attribute 'hostnme'</span></pre>
<p>Ab typo ka naam bilkul saaf hai. Template theek karo (<code>sed -i 's/hostnme/hostname/' templates/branch.j2</code>), dobara render karo, aur saabit karo:</p>
<pre class="out">AUTO01$ diff configs/BLR-BR-R1.cfg golden/BLR-BR-R1.cfg &amp;&amp; diff configs/HYD-BR-R1.cfg golden/HYD-BR-R1.cfg &amp;&amp; echo MATCH
<span class="hl">MATCH</span></pre>
<p><code>&amp;&amp;</code> agla command tabhi chalata hai jab pichhla safal hua ho, aur <code>diff</code> tabhi safal hota hai jab files identical hon, isliye <code>MATCH</code> tabhi print hota hai jab dono files match karein.</p>

<div class="eg"><p><b>Worked example: paanch-step routine.</b> 1) Script chalao aur sirf <b>aakhri line</b> padho. 2) Uske upar file aur line number note karo. 3) Woh line kholo (<code>nl -ba file</code> line numbers dikhata hai). 4) Ek cheez fix karo. 5) Dobara chalao. Teen cheezein ek saath fix mat karo; pata nahi chalega kis change se madad mili.</p></div>

<div class="note"><p><b>Reference code (not run in the simulator).</b> Har production render mein <code>StrictUndefined</code> on rakho. Kai teams har change par sample data render karke golden file se compare karne ka test jodti hain; upar ka diff wahi test hai, haath se kiya hua.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Cause ki jagah symptom fix karna (golden file mein khaali hostname daal dena). Rendered file ko haath se edit karna; agla render use overwrite kar deta hai, isliye hamesha template ya data edit karo. Message mein line number ko ignore karna. Aisi config push karna jo "bina error ke render hui" lekin kabhi padhi nahi gayi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Missing variable error <i>nahi</i> hai jab tak <code>StrictUndefined</code> on na ho; output chupchaap khaali hota hai. Aur <code>has host bits set</code> ka matlab hai ki jahan network address chahiye tha wahan host address diya, isliye fix aksar <code>ip_interface</code> hota hai.</p></div>

<div class="scn"><h4>Bina hostname wala branch router</h4><p>Ek naya branch router "Router" naam se aaya kyunki rendered config khaali <code>hostname</code> line se shuru hui. Script ne "rendered" print kiya aur kuch fail nahi hua. Wajah template variable mein typo thi. Fix ne pipeline mein <code>StrictUndefined</code> aur golden file se diff joda, taaki wahi typo ab render rok de aur message mein uska naam aaye.</p><p><b>Lesson:</b> galtiyon ko zor-daar banao, aur output ko kisi jaani-manii sahi cheez se compare karo.</p></div>

<div class="iv"><p class="q">"Aapka template blank value render kar gaya. Debug aur prevent kaise karoge?"</p><p>Pehle output ko reviewed copy se diff karo taaki exact line dikhe. Phir template mein misspelled variable ya data se gayab key dekho. Prevent karne ke liye <code>StrictUndefined</code> on karo taaki missing naam error de, aur pipeline mein golden-file comparison rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Traceback ki aakhri line pehle padho, phir uske upar ka line number.</li>
<li>TemplateNotFound: folder naam. TemplateSyntaxError: band na kiya tag. ValueError: galat address data.</li>
<li>Missing variables blank render hote hain jab tak <code>StrictUndefined</code> on na ho.</li>
<li><code>diff</code> files match hon to kuch print nahi karta; <code>&lt;</code> aapki, <code>&gt;</code> reference.</li>
<li>Ek-ek cheez fix karo aur template ya data edit karo, output kabhi nahi.</li>
</ul></div>
`}};export{e as default};