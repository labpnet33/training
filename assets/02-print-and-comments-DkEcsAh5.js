var e={id:`print-and-comments`,h:{en:`print() and comments`,hi:`print() aur comments`},body:{en:`
<p>Every script needs a way to <b>show</b> something to you. In Python that is <code>print()</code>. It is like the <code>show</code> command: it displays information on the screen so that you can read it. This chapter teaches <code>print</code> and the comment, the two simplest tools you will use in every script.</p>
<h3>print() shows what is in the brackets</h3>
<pre class="code">print("Hello, router")
print("VLAN", 10)
print("Gi0/1", "is", "up")
print()
print("end")</pre>
<pre class="out">AUTO&gt; python3 p1.py
Hello, router
VLAN 10
Gi0/1 is up

end</pre>
<ul>
<li><b>Text</b> goes inside quotes. Single or double quotes both work. The quotes are not printed.</li>
<li>A <b>number</b> needs no quotes: <code>10</code>.</li>
<li>Several things separated by commas are printed with one space between them.</li>
<li><code>print()</code> with nothing inside prints an empty line, handy to space out a report.</li>
</ul>
<h3>Quotes inside text</h3>
<p>If your text contains a quote mark, choose the other kind around it. Python also understands special characters written with a backslash: <code>\\n</code> means "new line" and <code>\\t</code> means "tab".</p>
<pre class="code">print("It's up")
print('Description "Core link"')
print("line one\\nline two")
print("a\\tb")</pre>
<pre class="out">AUTO&gt; python3 p2.py
It's up
Description "Core link"
line one
line two
a	b</pre>
<p>Two options of <code>print</code> are worth knowing. <code>sep</code> changes the separator between items and <code>end</code> changes what is printed at the very end (normally a new line):</p>
<pre class="code">print("a", "b", "c", sep="-")
print("no newline", end="")
print(" &lt;- same line")</pre>
<pre class="out">AUTO&gt; python3 p3.py
a-b-c
no newline &lt;- same line</pre>
<h3>Comments: notes for humans</h3>
<p>A <b>comment</b> starts with <code>#</code>. Python ignores the rest of that line. Use comments to say <b>why</b> a line exists. A comment can sit on its own line or at the end of a code line. Good scripts are readable months later because of comments.</p>
<pre class="code"><span class="c"># This whole line is a comment: Python skips it.</span>
print("Report start")   <span class="c"># a comment at the end of a code line</span>
<span class="c"># print("this line is switched off")</span>
print("Report end")</pre>
<pre class="out">AUTO&gt; python3 p4.py
Report start
Report end</pre>
<p>The third line shows a useful trick: putting <code>#</code> in front of a line "switches it off" without deleting it. Programmers call this <b>commenting out</b>.</p>
<h3>The classic first error</h3>
<p>If you open a quote and forget to close it, Python cannot read the file at all. It reports a <b>SyntaxError</b> before running anything:</p>
<pre class="code">print("Hello)</pre>
<pre class="out">AUTO&gt; python3 p5.py
  File "p5.py", line 1
    print("Hello)
          ^
<span class="hl">SyntaxError: unterminated string literal (detected at line 1)</span></pre>
<p>Read it from the bottom: <code>SyntaxError: unterminated string literal</code> means a piece of text has no closing quote. The small <code>^</code> arrow points at where Python noticed the problem.</p>
<div class="eg"><p><b>Worked example.</b> A config generator prints a small banner first: <code>print("=== Config for PUNE ===")</code>, then a blank <code>print()</code>, then the lines. Banners and blank lines make long outputs easy to scan.</p></div>
<div class="warn"><p><b>Common mistake.</b> Mixing curly "smart quotes" copied from a document or chat with normal straight quotes. Python only understands straight quotes <code>"</code> and <code>'</code>. Also, <code>Print("hi")</code> with a capital P is an error: Python is case-sensitive.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>print("a", "b")</code> prints <code>a b</code> (space added). <code>print("a" "b")</code> without a comma prints <code>ab</code>. Know that <code>#</code> starts a comment and that comments never change what a script does.</p></div>
<div class="scn"><h4>The mystery line</h4><p>A script had a line <code>vlan = 40</code> that nobody could explain. The author had left. The next engineer added a comment after asking around: <code>vlan = 40   # guest Wi-Fi VLAN per site design</code>. Two years later an auditor read that comment and understood the script without asking anyone.</p><p><b>Lesson:</b> comments explain why; the code already shows what.</p></div>
<div class="iv"><p class="q">"What does print do and how do you add notes to a script?"</p><p><code>print()</code> writes values to the screen, with a space between comma-separated items and a newline at the end by default. Notes are added as comments that start with <code>#</code>; Python ignores them. Comments should explain intent, not repeat the code.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>print() displays values; commas add a space; sep and end change the layout.</li>
<li>Text needs matching quotes; numbers do not.</li>
<li>A comment starts with # and is ignored; use it for why, and to switch a line off.</li>
<li>A missing closing quote is a SyntaxError reported before anything runs.</li>
</ul></div>
`,hi:`
<p>Har script ko aapko kuch <b>dikhane</b> ka tareeka chahiye. Python mein woh <code>print()</code> hai. Yeh <code>show</code> command jaisa hai: screen par information dikhata hai taaki aap padh sako. Yeh chapter <code>print</code> aur comment sikhata hai, do sabse simple tools jo aap har script mein use karoge.</p>
<h3>print() brackets ke andar ka dikhata hai</h3>
<pre class="code">print("Hello, router")
print("VLAN", 10)
print("Gi0/1", "is", "up")
print()
print("end")</pre>
<pre class="out">AUTO&gt; python3 p1.py
Hello, router
VLAN 10
Gi0/1 is up

end</pre>
<ul>
<li><b>Text</b> quotes ke andar jaata hai. Single ya double dono chalte hain. Quotes print nahi hote.</li>
<li><b>Number</b> ko quotes nahi chahiye: <code>10</code>.</li>
<li>Commas se alag kai cheezein ek space ke saath print hoti hain.</li>
<li>Khaali <code>print()</code> ek blank line print karta hai, report mein gap ke liye kaam ka.</li>
</ul>
<h3>Text ke andar quotes</h3>
<p>Agar aapke text mein quote mark hai, to uske bahar doosre type ka quote lagao. Python backslash wale special characters bhi samajhta hai: <code>\\n</code> matlab "new line" aur <code>\\t</code> matlab "tab".</p>
<pre class="code">print("It's up")
print('Description "Core link"')
print("line one\\nline two")
print("a\\tb")</pre>
<pre class="out">AUTO&gt; python3 p2.py
It's up
Description "Core link"
line one
line two
a	b</pre>
<p><code>print</code> ke do options jaanne layak hain. <code>sep</code> items ke beech ka separator badalta hai aur <code>end</code> bilkul end mein kya print ho yeh badalta hai (aam taur par new line):</p>
<pre class="code">print("a", "b", "c", sep="-")
print("no newline", end="")
print(" &lt;- same line")</pre>
<pre class="out">AUTO&gt; python3 p3.py
a-b-c
no newline &lt;- same line</pre>
<h3>Comments: insaanon ke liye notes</h3>
<p><b>Comment</b> <code>#</code> se shuru hota hai. Python us line ka baaki hissa ignore karta hai. Comments se batao ki line <b>kyun</b> hai. Comment apni line par ho sakta hai ya code line ke end mein. Achhe scripts mahino baad bhi comments ki wajah se padhne mein aasaan rehte hain.</p>
<pre class="code"><span class="c"># This whole line is a comment: Python skips it.</span>
print("Report start")   <span class="c"># a comment at the end of a code line</span>
<span class="c"># print("this line is switched off")</span>
print("Report end")</pre>
<pre class="out">AUTO&gt; python3 p4.py
Report start
Report end</pre>
<p>Teesri line ek kaam ki trick dikhati hai: line ke aage <code>#</code> lagane se woh bina delete kiye "band" ho jaati hai. Programmers ise <b>commenting out</b> kehte hain.</p>
<h3>Pehla classic error</h3>
<p>Agar aap quote kholkar band karna bhool jao, to Python file padh hi nahi paata. Kuch chalne se pehle woh <b>SyntaxError</b> batata hai:</p>
<pre class="code">print("Hello)</pre>
<pre class="out">AUTO&gt; python3 p5.py
  File "p5.py", line 1
    print("Hello)
          ^
<span class="hl">SyntaxError: unterminated string literal (detected at line 1)</span></pre>
<p>Neeche se padho: <code>SyntaxError: unterminated string literal</code> ka matlab hai ki text ka closing quote nahi hai. Chhota <code>^</code> arrow wahan ishara karta hai jahan Python ko problem dikhi.</p>
<div class="eg"><p><b>Worked example.</b> Config generator pehle ek chhota banner print karta hai: <code>print("=== Config for PUNE ===")</code>, phir ek blank <code>print()</code>, phir lines. Banners aur blank lines lambe outputs ko scan karna aasaan banate hain.</p></div>
<div class="warn"><p><b>Common galti.</b> Document ya chat se copy kiye curly "smart quotes" ko normal straight quotes ke saath mix karna. Python sirf straight quotes <code>"</code> aur <code>'</code> samajhta hai. Aur capital P wala <code>Print("hi")</code> error hai: Python case-sensitive hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>print("a", "b")</code> <code>a b</code> print karta hai (space add hota hai). Comma ke bina <code>print("a" "b")</code> <code>ab</code> print karta hai. Yaad rakho ki <code>#</code> comment shuru karta hai aur comments script ka kaam kabhi nahi badalte.</p></div>
<div class="scn"><h4>Rahasyamayi line</h4><p>Ek script mein <code>vlan = 40</code> line thi jise koi samjha nahi paata tha. Likhne wala chala gaya tha. Agle engineer ne poochhne ke baad comment jodi: <code>vlan = 40   # guest Wi-Fi VLAN per site design</code>. Do saal baad auditor ne woh comment padhi aur script bina kisi se pooche samajh gaya.</p><p><b>Lesson:</b> comments batate hain kyun; code pehle se dikhata hai kya.</p></div>
<div class="iv"><p class="q">"print kya karta hai aur script mein notes kaise jodte hain?"</p><p><code>print()</code> values ko screen par likhta hai, comma se alag items ke beech space aur end mein default newline ke saath. Notes comments ke roop mein jodte hain jo <code>#</code> se shuru hote hain; Python unhe ignore karta hai. Comments intent samjhayein, code ko repeat na karein.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>print() values dikhata hai; commas space jodte hain; sep aur end layout badalte hain.</li>
<li>Text ko matching quotes chahiye; numbers ko nahi.</li>
<li>Comment # se shuru hota hai aur ignore hota hai; kyun batane aur line band karne ke liye use karo.</li>
<li>Closing quote missing hona SyntaxError hai jo kuch chalne se pehle batata hai.</li>
</ul></div>
`}};export{e as default};