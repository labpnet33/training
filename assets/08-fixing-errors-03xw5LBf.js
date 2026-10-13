var e={id:`fixing-errors`,h:{en:`Fixing errors: the broken report`,hi:`Errors fix karna: toota hua report`},body:{en:`
<p>Professionals do not write error-free code. They read errors well. Python reads the whole file first; if the text is not valid Python at all, it stops with a <b>SyntaxError</b> before anything runs. If the file is valid, Python runs line by line and stops at the first line that fails, printing a <b>traceback</b>. In both cases, read the <b>last line</b> first and then the <b>line number</b>. The loop is: run, read, fix one thing, run again.</p>
<table class="cmp"><thead><tr><th>Error</th><th>Means</th><th>Typical fix</th></tr></thead><tbody>
<tr><td><code>SyntaxError</code></td><td>Text is not valid Python</td><td>Close the quote or bracket, add the colon</td></tr>
<tr><td><code>NameError</code></td><td>Unknown name</td><td>Fix the spelling or create the variable first</td></tr>
<tr><td><code>TypeError</code></td><td>Wrong type for the operation</td><td>Convert, or use an f-string</td></tr>
</tbody></table>
<h3>Lab 2: the report that never ran</h3>
<p>A fresher wrote <code>report.py</code> to print a daily health report. It has three classic beginner bugs. Here is the file with line numbers:</p>
<pre class="out">AUTO&gt; nl report.py
     1  # report.py - print a short health report for one router
     2  hostname = "BLR-EDGE-01"
     3  uptime_days = 42          # int (a number)
     4  interfaces_up = 3         # int (a number)
     5  
     6  print("=== Daily router report ===)
     7  print("Router: " + hostnme)
     8  print("Uptime in days: " + uptime_days)
     9  print(f"Interfaces up: {interfaces_up}")
    10  print("=== End of report ===")</pre>
<h3>Bug 1: SyntaxError</h3>
<pre class="out">AUTO&gt; python3 report.py
  File "report.py", line 6
    print("=== Daily router report ===)
          ^
<span class="hl">SyntaxError: unterminated string literal (detected at line 6)</span></pre>
<p>Python names the line (6) and the problem: a string with no closing quote. Notice that nothing printed at all, even though lines 1 to 5 look fine: the whole file is checked first. Fix line 6:</p>
<pre class="out">AUTO&gt; edit report.py 6 print("=== Daily router report ===")</pre>
<h3>Bug 2: NameError</h3>
<pre class="out">AUTO&gt; python3 report.py
=== Daily router report ===
Traceback (most recent call last):
  File "report.py", line 7, in &lt;module&gt;
    print("Router: " + hostnme)
<span class="hl">NameError: name 'hostnme' is not defined. Did you mean: 'hostname'?</span></pre>
<p>Now the file is valid Python, so it starts running and prints the first line. It stops at line 7 because <code>hostnme</code> is a misspelling of <code>hostname</code>, and Python suggests the fix. Correct the spelling:</p>
<pre class="out">AUTO&gt; sed -i 's/hostnme/hostname/' report.py</pre>
<h3>Bug 3: TypeError</h3>
<pre class="out">AUTO&gt; python3 report.py
=== Daily router report ===
Router: BLR-EDGE-01
Traceback (most recent call last):
  File "report.py", line 8, in &lt;module&gt;
    print("Uptime in days: " + uptime_days)
<span class="hl">TypeError: can only concatenate str (not "int") to str</span></pre>
<p>Line 8 tries to join the text <code>"Uptime in days: "</code> with the integer <code>uptime_days</code>. Use an f-string, as in chapter 6:</p>
<pre class="out">AUTO&gt; edit report.py 8 print(f"Uptime in days: {uptime_days}")</pre>
<pre class="out">AUTO&gt; python3 report.py
=== Daily router report ===
<span class="hl">Router: BLR-EDGE-01</span>
<span class="hl">Uptime in days: 42</span>
<span class="hl">Interfaces up: 3</span>
=== End of report ===</pre>
<p>The report is complete: the router name, 42 days of uptime and 3 interfaces up. Three errors, three small fixes, each found by reading one message.</p>
<div class="warn"><p><b>Common mistake.</b> Fixing several things at once, then not knowing which change helped. Fix one error, run again, read the next message. Also do not ignore the line number: it is usually where Python noticed the problem, and the real cause is on that line or just above it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Match the message to the cause: "unterminated string literal" is a missing quote, "is not defined" is a NameError (spelling or order), "can only concatenate str (not int)" is a TypeError from joining text with a number.</p></div>
<div class="scn"><h4>The Friday-afternoon report</h4><p>A junior engineer had to send a report in an hour. The script failed three times in a row. Instead of panicking he read each last line, fixed the one thing it named, and ran again. Three minutes later the report printed correctly. His senior later said he made the same three errors in his first week.</p><p><b>Lesson:</b> errors are information; read the last line and fix one thing at a time.</p></div>
<div class="iv"><p class="q">"How do you debug a Python script that fails?"</p><p>Read the last line of the message for the error type and text, go to the line number it gives, check the usual causes for that error type (quote or bracket for SyntaxError, spelling for NameError, converting types for TypeError), fix one thing, and re-run. If needed, add temporary <code>print()</code> calls to see variable values.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SyntaxError appears before anything runs; NameError and TypeError appear when the failing line runs.</li>
<li>Read the last line, then the line number.</li>
<li>Fix one error at a time and re-run.</li>
<li>Python often suggests the right name with Did you mean.</li>
</ul></div>
`,hi:`
<p>Professionals error-free code nahi likhte. Woh errors achhi tarah padhte hain. Python pehle poori file padhta hai; agar text valid Python hi nahi hai to kuch chalne se pehle <b>SyntaxError</b> se ruk jaata hai. Agar file valid hai to Python line by line chalta hai aur pehli fail hone wali line par ruk jaata hai, aur <b>traceback</b> print karta hai. Dono mein pehle <b>aakhri line</b> padho, phir <b>line number</b>. Loop yeh hai: chalao, padho, ek cheez fix karo, phir chalao.</p>
<table class="cmp"><thead><tr><th>Error</th><th>Matlab</th><th>Aam fix</th></tr></thead><tbody>
<tr><td><code>SyntaxError</code></td><td>Text valid Python nahi</td><td>Quote ya bracket band karo, colon lagao</td></tr>
<tr><td><code>NameError</code></td><td>Anjaana naam</td><td>Spelling theek karo ya pehle variable banao</td></tr>
<tr><td><code>TypeError</code></td><td>Operation ke liye galat type</td><td>Convert karo, ya f-string use karo</td></tr>
</tbody></table>
<h3>Lab 2: report jo kabhi chala hi nahi</h3>
<p>Ek fresher ne daily health report print karne ke liye <code>report.py</code> likha. Isme teen classic beginner bugs hain. Yeh file line numbers ke saath hai:</p>
<pre class="out">AUTO&gt; nl report.py
     1  # report.py - print a short health report for one router
     2  hostname = "BLR-EDGE-01"
     3  uptime_days = 42          # int (a number)
     4  interfaces_up = 3         # int (a number)
     5  
     6  print("=== Daily router report ===)
     7  print("Router: " + hostnme)
     8  print("Uptime in days: " + uptime_days)
     9  print(f"Interfaces up: {interfaces_up}")
    10  print("=== End of report ===")</pre>
<h3>Bug 1: SyntaxError</h3>
<pre class="out">AUTO&gt; python3 report.py
  File "report.py", line 6
    print("=== Daily router report ===)
          ^
<span class="hl">SyntaxError: unterminated string literal (detected at line 6)</span></pre>
<p>Python line (6) aur problem batata hai: closing quote ke bina string. Dhyan do ki kuch bhi print nahi hua, jabki line 1 se 5 theek dikhti hain: poori file pehle check hoti hai. Line 6 fix karo:</p>
<pre class="out">AUTO&gt; edit report.py 6 print("=== Daily router report ===")</pre>
<h3>Bug 2: NameError</h3>
<pre class="out">AUTO&gt; python3 report.py
=== Daily router report ===
Traceback (most recent call last):
  File "report.py", line 7, in &lt;module&gt;
    print("Router: " + hostnme)
<span class="hl">NameError: name 'hostnme' is not defined. Did you mean: 'hostname'?</span></pre>
<p>Ab file valid Python hai, isliye chalna shuru hota hai aur pehli line print karta hai. Line 7 par ruk jaata hai kyunki <code>hostnme</code>, <code>hostname</code> ki galat spelling hai, aur Python fix suggest karta hai. Spelling theek karo:</p>
<pre class="out">AUTO&gt; sed -i 's/hostnme/hostname/' report.py</pre>
<h3>Bug 3: TypeError</h3>
<pre class="out">AUTO&gt; python3 report.py
=== Daily router report ===
Router: BLR-EDGE-01
Traceback (most recent call last):
  File "report.py", line 8, in &lt;module&gt;
    print("Uptime in days: " + uptime_days)
<span class="hl">TypeError: can only concatenate str (not "int") to str</span></pre>
<p>Line 8 text <code>"Uptime in days: "</code> ko integer <code>uptime_days</code> se jodne ki koshish karti hai. Chapter 6 ki tarah f-string use karo:</p>
<pre class="out">AUTO&gt; edit report.py 8 print(f"Uptime in days: {uptime_days}")</pre>
<pre class="out">AUTO&gt; python3 report.py
=== Daily router report ===
<span class="hl">Router: BLR-EDGE-01</span>
<span class="hl">Uptime in days: 42</span>
<span class="hl">Interfaces up: 3</span>
=== End of report ===</pre>
<p>Report poori hai: router name, 42 din uptime aur 3 interfaces up. Teen errors, teen chhote fixes, har ek ek message padhkar mila.</p>
<div class="warn"><p><b>Common galti.</b> Ek saath kai cheezein fix karna, phir pata na chalna kaunse change se fayda hua. Ek error fix karo, dobara chalao, agla message padho. Line number ko ignore mat karo: yeh aksar wahi jagah hai jahan Python ko problem dikhi, aur asli wajah usi line par ya uske thik upar hoti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Message ko wajah se match karo: "unterminated string literal" matlab quote missing, "is not defined" NameError (spelling ya order), "can only concatenate str (not int)" text ko number se jodne ka TypeError.</p></div>
<div class="scn"><h4>Friday dopahar ka report</h4><p>Ek junior engineer ko ek ghante mein report bhejni thi. Script lagatar teen baar fail hua. Ghabrane ki jagah usne har aakhri line padhi, jo ek cheez usme thi woh fix ki, aur dobara chalaya. Teen minute baad report sahi print hua. Uske senior ne baad mein kaha ki unhone pehle hafte mein yahi teen errors kiye the.</p><p><b>Lesson:</b> errors information hain; aakhri line padho aur ek ek cheez fix karo.</p></div>
<div class="iv"><p class="q">"Fail hone wali Python script ko debug kaise karte ho?"</p><p>Message ki aakhri line se error type aur text padho, jo line number deta hai wahan jao, us error type ke aam kaaran check karo (SyntaxError ke liye quote ya bracket, NameError ke liye spelling, TypeError ke liye types convert karna), ek cheez fix karo, aur dobara chalao. Zaroorat ho to variable values dekhne ke liye temporary <code>print()</code> lagao.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SyntaxError kuch chalne se pehle aata hai; NameError aur TypeError tab aate hain jab failing line chalti hai.</li>
<li>Pehle aakhri line, phir line number padho.</li>
<li>Ek time par ek error fix karo aur dobara chalao.</li>
<li>Python aksar Did you mean se sahi naam suggest karta hai.</li>
</ul></div>
`}};export{e as default};