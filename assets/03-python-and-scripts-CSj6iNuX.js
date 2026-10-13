var e={id:`python-and-scripts`,h:{en:`Python and your first script file`,hi:`Python aur aapki pehli script file`},body:{en:`
<p><b>Python</b> is a programming language: a way to write instructions using words that look a little like English. Network engineers like it because it is easy to read and because other people have already written ready-made code for networking. Ready-made code that you can reuse is called a <b>library</b> (or <b>module</b>). Loading one into your script is called <b>importing</b> it.</p>
<p>A Python <b>script</b> is simply a text file whose name ends in <code>.py</code>. The computer reads it from the top, one line at a time, and does what each line says. To run it you type <code>python3</code> and the file name. Nothing is installed on your own laptop for this module: everything happens on the lab host AUTO.</p>
<h3>Your first line of Python</h3>
<p>You can run one line without making a file by using <code>python3 -c</code> followed by the code in quotes. The function <code>print()</code> shows whatever is inside the brackets on the screen:</p>
<pre class="out">AUTO&gt; python3 -c "print('Hello, network')"
Hello, network</pre>
<pre class="out">AUTO&gt; python3 -c "print(10 + 5)"
15</pre>
<pre class="out">AUTO&gt; python3 -c "print('R1', 'is up')"
R1 is up</pre>
<ul>
<li>Text goes inside <b>quotes</b> (single or double). Text in quotes is called a <b>string</b>.</li>
<li>Numbers have no quotes, and Python can do maths on them: <code>10 + 5</code> printed <code>15</code>.</li>
<li>Several things separated by commas are printed with one space between them.</li>
</ul>
<h3>The host commands you will use</h3>
<p>Because AUTO is a lab machine, it has a few small helper commands for working with files. You will use them in every chapter:</p>
<table class="cmp"><thead><tr><th>Command</th><th>What it does</th></tr></thead><tbody>
<tr><td><code>ls</code></td><td>List the files</td></tr>
<tr><td><code>cat FILE</code></td><td>Show the text of a file</td></tr>
<tr><td><code>nl FILE</code></td><td>Show the file with line numbers</td></tr>
<tr><td><code>python3 FILE</code></td><td>Run the script</td></tr>
<tr><td><code>sed -i 's/old/new/' FILE</code></td><td>Replace text inside a file</td></tr>
<tr><td><code>edit FILE N TEXT</code></td><td>Replace the whole of line N</td></tr>
<tr><td><code>insert FILE N TEXT</code></td><td>Add a new line before line N</td></tr>
</tbody></table>
<p>Here are the first eight lines of the senior engineer's file, shown with line numbers by <code>nl</code>. Lines that start with <code>#</code> are <b>comments</b>: notes for humans that Python skips.</p>
<pre class="out">AUTO&gt; nl first_script.py
     1  # first_script.py - your first automation script
     2  # Lines that start with # are COMMENTS: notes for humans, Python skips them.
     3  
     4  # Step 1: load the SSH tool. nkmiko works like the popular "netmiko" library.
     5  from nkmiko import ConnectHandler
     6  
     7  # Step 2: the LIST of routers to visit (their management IP addresses).
     8  ROUTERS = ["10.99.0.1", "10.99.0.2"]</pre>
<h3>Two rules that save you hours</h3>
<ol>
<li><b>Indentation matters.</b> Lines inside a block (for example a loop) are pushed right by 4 spaces. Python uses that gap to know which lines belong together. Mixing it up is an error.</li>
<li><b>Spelling and case matter.</b> <code>Print</code> is not <code>print</code>. A missing quote or bracket is a <b>SyntaxError</b>.</li>
</ol>
<p>If you name a file that does not exist, the host says so plainly:</p>
<pre class="out">AUTO&gt; python3 nofile.py
python3: can't open file '/home/lab/nofile.py': [Errno 2] No such file or directory</pre>
<div class="eg"><p><b>Worked example.</b> You want to check a one-line idea quickly: <code>python3 -c "print(len('PUN-CORE-01'))"</code>. You are asking Python to count the characters of the hostname. Small experiments like this are the fastest way to learn.</p></div>
<div class="warn"><p><b>Common mistake.</b> Typing Python code straight at the host prompt (for example <code>print("hi")</code> without <code>python3 -c</code>). The host prompt understands host commands, not Python. Start Python first, or use <code>python3 -c</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember: a comment starts with <code>#</code> and is ignored. A block is marked by a colon at the end of a line and by indentation, not by curly brackets as in many other languages.</p></div>
<div class="scn"><h4>The file that would not run</h4><p>A new engineer typed <code>python3 first_script</code> and got "No such file". The file was called <code>first_script.py</code>. The fix was the full name including <code>.py</code>. Running <code>ls</code> first would have shown the exact name.</p><p><b>Lesson:</b> run <code>ls</code> to see the real file names before you run a script.</p></div>
<div class="iv"><p class="q">"What is a Python script, and how do you run it?"</p><p>A script is a plain text file of Python statements, normally ending in <code>.py</code>. You run it with <code>python3 filename.py</code>, and Python reads it top to bottom. Mention comments, indentation and that libraries are loaded with <code>import</code>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Python is a readable language; a script is a text file ending in .py.</li>
<li>Run a script with python3 FILE; run one line with python3 -c.</li>
<li>print() shows output; text goes in quotes; numbers do not.</li>
<li>Comments start with #; indentation groups lines.</li>
</ul></div>
`,hi:`
<p><b>Python</b> ek programming language hai: aise words mein instructions likhne ka tareeka jo thode English jaise dikhte hain. Network engineers ise isliye pasand karte hain kyunki padhna aasaan hai aur doosre logon ne networking ke liye ready-made code pehle se likh rakha hai. Aisa ready-made code jo aap reuse kar sako <b>library</b> (ya <b>module</b>) kehlata hai. Ise apni script mein load karna <b>import</b> karna kehlata hai.</p>
<p>Python <b>script</b> bas ek text file hai jiska naam <code>.py</code> par khatam hota hai. Computer ise upar se, ek-ek line padhta hai aur har line jo kehti hai woh karta hai. Chalane ke liye aap <code>python3</code> aur file ka naam type karte ho. Is module ke liye aapke apne laptop par kuch install nahi hota: sab kuch lab host AUTO par hota hai.</p>
<h3>Python ki aapki pehli line</h3>
<p>Aap bina file banaye ek line chala sakte ho: <code>python3 -c</code> ke baad quotes mein code likho. <code>print()</code> function brackets ke andar jo bhi hai use screen par dikhata hai:</p>
<pre class="out">AUTO&gt; python3 -c "print('Hello, network')"
Hello, network</pre>
<pre class="out">AUTO&gt; python3 -c "print(10 + 5)"
15</pre>
<pre class="out">AUTO&gt; python3 -c "print('R1', 'is up')"
R1 is up</pre>
<ul>
<li>Text <b>quotes</b> ke andar jaata hai (single ya double). Quotes wale text ko <b>string</b> kehte hain.</li>
<li>Numbers par quotes nahi hote, aur Python unpar maths kar sakta hai: <code>10 + 5</code> ne <code>15</code> print kiya.</li>
<li>Commas se alag kai cheezein ek space ke saath print hoti hain.</li>
</ul>
<h3>Host ke commands jo aap use karoge</h3>
<p>AUTO lab machine hai, isliye ismein files ke saath kaam karne ke liye kuch chhote helper commands hain. Aap inhe har chapter mein use karoge:</p>
<table class="cmp"><thead><tr><th>Command</th><th>Yeh kya karta hai</th></tr></thead><tbody>
<tr><td><code>ls</code></td><td>Files ki list</td></tr>
<tr><td><code>cat FILE</code></td><td>File ka text dikhao</td></tr>
<tr><td><code>nl FILE</code></td><td>File line numbers ke saath dikhao</td></tr>
<tr><td><code>python3 FILE</code></td><td>Script chalao</td></tr>
<tr><td><code>sed -i 's/old/new/' FILE</code></td><td>File ke andar text replace karo</td></tr>
<tr><td><code>edit FILE N TEXT</code></td><td>Poori line N replace karo</td></tr>
<tr><td><code>insert FILE N TEXT</code></td><td>Line N se pehle nayi line jodo</td></tr>
</tbody></table>
<p>Yeh senior engineer ki file ki pehli aath lines hain, jo <code>nl</code> ne line numbers ke saath dikhayi. <code>#</code> se shuru hone wali lines <b>comments</b> hain: insaanon ke liye notes jinhe Python skip karta hai.</p>
<pre class="out">AUTO&gt; nl first_script.py
     1  # first_script.py - your first automation script
     2  # Lines that start with # are COMMENTS: notes for humans, Python skips them.
     3  
     4  # Step 1: load the SSH tool. nkmiko works like the popular "netmiko" library.
     5  from nkmiko import ConnectHandler
     6  
     7  # Step 2: the LIST of routers to visit (their management IP addresses).
     8  ROUTERS = ["10.99.0.1", "10.99.0.2"]</pre>
<h3>Do rules jo ghante bachate hain</h3>
<ol>
<li><b>Indentation matter karta hai.</b> Block (jaise loop) ke andar ki lines 4 spaces right khiski hoti hain. Python usi gap se samajhta hai kaunsi lines saath hain. Ise gadbad karna error hai.</li>
<li><b>Spelling aur case matter karte hain.</b> <code>Print</code> aur <code>print</code> alag hain. Quote ya bracket missing hone par <b>SyntaxError</b> aata hai.</li>
</ol>
<p>Agar aap aisi file ka naam do jo exist nahi karti, host seedha bata deta hai:</p>
<pre class="out">AUTO&gt; python3 nofile.py
python3: can't open file '/home/lab/nofile.py': [Errno 2] No such file or directory</pre>
<div class="eg"><p><b>Worked example.</b> Aap ek line ka idea jaldi check karna chahte ho: <code>python3 -c "print(len('PUN-CORE-01'))"</code>. Aap Python se hostname ke characters gin-ne ko bol rahe ho. Aise chhote experiments seekhne ka sabse tez tareeka hain.</p></div>
<div class="warn"><p><b>Common galti.</b> Python code seedha host prompt par type karna (jaise bina <code>python3 -c</code> ke <code>print("hi")</code>). Host prompt host commands samajhta hai, Python nahi. Pehle Python start karo, ya <code>python3 -c</code> use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Yaad rakho: comment <code>#</code> se shuru hota hai aur ignore hota hai. Block ek line ke end ke colon aur indentation se banta hai, kai doosri languages ki tarah curly brackets se nahi.</p></div>
<div class="scn"><h4>Woh file jo chali hi nahi</h4><p>Ek naye engineer ne <code>python3 first_script</code> type kiya aur "No such file" mila. File ka naam <code>first_script.py</code> tha. Fix poora naam <code>.py</code> ke saath likhna tha. Pehle <code>ls</code> chalate to exact naam dikh jata.</p><p><b>Lesson:</b> script chalane se pehle <code>ls</code> chalake asli file names dekho.</p></div>
<div class="iv"><p class="q">"Python script kya hai, aur ise kaise chalate hain?"</p><p>Script Python statements ki plain text file hoti hai, aam taur par <code>.py</code> par khatam. Ise <code>python3 filename.py</code> se chalate hain, aur Python ise upar se neeche padhta hai. Comments, indentation aur ye bolo ki libraries <code>import</code> se load hoti hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Python padhne mein aasaan language hai; script .py par khatam hone wali text file hai.</li>
<li>Script python3 FILE se chalao; ek line python3 -c se.</li>
<li>print() output dikhata hai; text quotes mein; numbers bina quotes.</li>
<li>Comments # se shuru; indentation lines ko group karta hai.</li>
</ul></div>
`}};export{e as default};