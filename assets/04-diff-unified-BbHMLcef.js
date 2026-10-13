var e=(e,t,n)=>`<rect x="10" y="`+e+`" width="330" height="20" rx="3" fill="`+t+`"/><text x="18" y="`+(e+14)+`" class="svg-ink" font-size="12">`+n+`</text>`,t=(e,t)=>`<text x="360" y="`+(e+14)+`" class="svg-muted" font-size="12">`+t+`</text>`,n=(n,r)=>`<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Anatomy of a unified diff">`+e(6,`#e2e8f0`,`--- samples/before.cfg`)+e(28,`#e2e8f0`,`+++ samples/after.cfg`)+e(50,`#ddd6fe`,`@@ -1,6 +1,7 @@`)+e(72,`#ffffff`,` hostname EDGE-SW1`)+e(94,`#fecaca`,`-ntp server 10.1.1.1`)+e(116,`#fecaca`,`-logging host 10.1.1.9`)+e(138,`#bbf7d0`,`+ntp server 10.99.0.50`)+e(160,`#bbf7d0`,`+logging host 10.99.0.51`)+e(182,`#bbf7d0`,`+snmp-server community NKRO RO`)+t(6,n[0])+t(28,n[1])+t(50,n[2])+t(72,n[3])+t(94,n[4])+t(138,n[5])+`</svg><p class="cap">`+r+`</p></div>`,r=`<pre class="code">import sys
import difflib

old = open(sys.argv[1]).read().splitlines()
new = open(sys.argv[2]).read().splitlines()
for line in difflib.unified_diff(old, new, sys.argv[1], sys.argv[2], lineterm=""):
    print(line)</pre>`,i=`<pre class="out"><span class="hl">AUTO01$ python3 diffcfg.py samples/before.cfg samples/after.cfg</span>
--- samples/before.cfg
+++ samples/after.cfg
<span class="hl">@@ -1,6 +1,7 @@</span>
 hostname EDGE-SW1
<span class="hl">-ntp server 10.1.1.1
-logging host 10.1.1.9
+ntp server 10.99.0.50
+logging host 10.99.0.51
+snmp-server community NKRO RO</span>
 interface GigabitEthernet0/1
  description uplink
  switchport mode trunk</pre>`,a=`<pre class="out"><span class="hl">AUTO01$ python3 diffcfg.py samples/after.cfg samples/before.cfg</span>
--- samples/after.cfg
+++ samples/before.cfg
@@ -1,7 +1,6 @@
 hostname EDGE-SW1
-ntp server 10.99.0.50
-logging host 10.99.0.51
-snmp-server community NKRO RO
+ntp server 10.1.1.1
+logging host 10.1.1.9
 interface GigabitEthernet0/1
  description uplink
  switchport mode trunk
<span class="hl">AUTO01$ python3 diffcfg.py samples/before.cfg samples/before.cfg; echo "rc=$?"</span>
rc=0</pre>`,o=`<pre class="code">import difflib

old = ["hostname EDGE-SW1", "ntp server 10.1.1.1", "logging host 10.1.1.9"]
new = ["hostname EDGE-SW1", "ntp server 10.99.0.50", "logging host 10.1.1.9"]
d = difflib.unified_diff(old, new, "before", "after")
print(repr(next(d)))
print(bool(d), "&lt;- a generator is always true")
diff = list(difflib.unified_diff(old, old, "before", "after", lineterm=""))
print(diff, bool(diff))</pre>`,s=`<pre class="out"><span class="hl">AUTO01$ python3 listy.py</span>
'--- before\\n'
True &lt;- a generator is always true
[] False</pre>`,c={id:`diff-unified`,h:{en:`Diff with difflib.unified_diff and how to read it`,hi:`difflib.unified_diff se diff aur use kaise padhein`},body:{en:`
<p><b>The idea of this chapter:</b> a diff is the shortest honest answer to "what changed?". It is how a script proves to a human that only the intended lines moved. Python ships the tool in the standard library: <code>difflib.unified_diff</code>.</p>

<h3>Analogy: track changes</h3>
<p>When a colleague edits your report with "track changes" switched on, deleted words are struck through in red and new words are underlined in green. You do not reread the whole report; you read the marks. A unified diff is track changes for plain text, with <code>-</code> for deleted lines and <code>+</code> for added lines. If you used <code>git diff</code> in <b>auto-git</b>, you have already seen the format.</p>

<h3>The function</h3>
<p><code>difflib.unified_diff(a, b, fromfile, tofile, lineterm="")</code> takes two <b>lists of lines</b>. It yields the diff one line at a time. The two names are printed in the header. <code>lineterm=""</code> matters: the function expects lines that still end with a newline, but <code>splitlines()</code> has already removed them, so you tell it not to add its own newline to the header lines (without it, the header lines come back ending in a newline, for example <code>'--- before\\n'</code>, and <code>print</code> adds a blank line after each of them).</p>

<h3>Lab 1, task 1: your own diff helper</h3>
<p>The folder <code>samples</code> has two versions of one switch config. Write <code>diffcfg.py</code>, which reads the two files named on the command line and prints their diff:</p>
`+r+`
<ul>
<li><code>sys.argv[1]</code> and <code>sys.argv[2]</code> are the first and second words after the script name.</li>
<li><code>open(...).read().splitlines()</code> turns a file into a list of lines without newlines.</li>
<li>The loop prints each diff line. Nothing is printed when the files are identical.</li>
</ul>
`+i+`
`+n([`file names (from, to)`,`file names (from, to)`,`hunk: old 1,6 / new 1,7`,`space = unchanged context line`,`- = in the old file only (removed)`,`+ = in the new file only (added)`],`Anatomy of the diff: header, hunk marker, context, removals and additions.`)+`

<h3>Reading it</h3>
<ul>
<li><code>---</code> and <code>+++</code> name the old and the new text. Here the old text is <code>before.cfg</code>.</li>
<li><code>@@ -1,6 +1,7 @@</code> is a <b>hunk header</b>: in the old text, start at line 1 and show 6 lines; in the new text, start at line 1 and show 7 lines. 7 minus 6 is the net number of lines added.</li>
<li>A line that starts with a space is <b>context</b>, unchanged, shown to help you find the place.</li>
<li>A line that starts with <code>-</code> exists only in the old text. A line that starts with <code>+</code> exists only in the new text.</li>
<li>A <b>changed</b> line shows up as a <code>-</code> line followed by a <code>+</code> line. Here <code>ntp server 10.1.1.1</code> became <code>ntp server 10.99.0.50</code>.</li>
</ul>
<p>So the answer to the task is <b>3 added lines</b>: the new NTP server, the new logging host and the SNMP community. Two old lines were removed (the old NTP and logging servers).</p>

<h3>Direction matters</h3>
<p>The first argument is "before", the second is "after". Swap them and every plus becomes a minus. The last command below also shows the "no change" case: no output, and exit code 0.</p>
`+a+`

<h3>An empty diff, and a generator trap</h3>
<p><code>unified_diff</code> returns a <b>generator</b>, an object that produces lines when you loop over it. An empty diff is still a generator object, and a generator is always "true", so <code>if diff:</code> would be true even when nothing differs. Turn the result into a list first. A list is false when it is empty.</p>
`+o+`
`+s+`
<p>That is why <code>safepush.py</code> writes <code>diff = list(difflib.unified_diff(...))</code>. Chapter 7 uses it to save <code>changes/R1.diff</code>, a record you attach to the change ticket. In the lab interpreter a generator does its work eagerly, but the results are the same as in standard Python.</p>

<div class="eg"><p><b>Worked example.</b> You change the NTP server on a switch and a colleague asks, "did you touch anything else?". You run the diff on the saved before and after files. It shows one <code>-</code> line and one <code>+</code> line. You paste those two lines into the ticket. The question is answered in five seconds, with evidence.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Passing strings instead of lists of lines (a string is a sequence of characters, so you get a diff of single letters). Forgetting <code>lineterm=""</code>. Testing <code>if diff:</code> on the generator. Reading the diff backwards because the arguments are swapped.</p></div>
<div class="exam"><p><b>Exam trap.</b> The lines <code>---</code> and <code>+++</code> are headers, not a removed and an added line. When you count changes, skip them.</p></div>

<div class="scn"><h4>"We only changed the NTP server"</h4><p>After a change window a network engineer reported "only NTP was touched". The diff saved by the tool showed one extra <code>+</code> line, <code>no ip domain lookup</code>, that a colleague's baseline file carried by mistake. It was harmless, but it would have been invisible without the diff.</p><p><b>Lesson:</b> the diff is the proof. Trust it above anyone's memory.</p></div>

<div class="iv"><p class="q">"How do you show exactly what an automated change did?"</p><p>I read the configuration before and after, clean out the noise lines, and run <code>difflib.unified_diff</code> on the two lists. I save the output next to the change record. Only <code>+</code> and <code>-</code> lines matter; context lines are there to locate the change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>difflib.unified_diff(old, new, name_old, name_new, lineterm="")</code> compares two lists of lines.</li>
<li><code>-</code> means only in the old text, <code>+</code> only in the new text, a leading space means unchanged.</li>
<li>The hunk header <code>@@ -1,6 +1,7 @@</code> gives the line range in the old and new text.</li>
<li>Wrap the result in <code>list(...)</code> before testing whether it is empty.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> diff "kya badla?" ka sabse chhota imaandar jawab hai. Script isi se insaan ko saabit karti hai ki sirf iraade wali lines hi hili. Python yeh tool standard library mein deta hai: <code>difflib.unified_diff</code>.</p>

<h3>Analogy: track changes</h3>
<p>Jab colleague aapki report "track changes" on karke edit karta hai, hataye gaye shabdon par laal lakeer aur naye shabdon par hari underline hoti hai. Aap poori report dobara nahi padhte; sirf nishaan padhte ho. Unified diff plain text ke liye track changes hai: hataayi lines ke liye <code>-</code> aur jodi lines ke liye <code>+</code>. <b>auto-git</b> mein <code>git diff</code> use kiya hai to yeh format aap dekh chuke ho.</p>

<h3>Function</h3>
<p><code>difflib.unified_diff(a, b, fromfile, tofile, lineterm="")</code> do <b>lines ki lists</b> leta hai. Woh diff ek-ek line karke yield karta hai. Do naam header mein print hote hain. <code>lineterm=""</code> zaroori hai: function maanta hai ki lines abhi bhi newline par khatam hoti hain, par <code>splitlines()</code> unhe pehle hi hata chuka hai, isliye aap use kehte ho ki header lines mein apna newline na jode (iske bina header lines newline par khatam hoke aati hain, jaise <code>'--- before\\n'</code>, aur <code>print</code> har ek ke baad blank line jodta hai).</p>

<h3>Lab 1, task 1: apna diff helper</h3>
<p>Folder <code>samples</code> mein ek switch config ke do versions hain. <code>diffcfg.py</code> likho, jo command line par diye do files padhti hai aur unka diff print karti hai:</p>
`+r+`
<ul>
<li><code>sys.argv[1]</code> aur <code>sys.argv[2]</code> script ke naam ke baad ke pehle aur doosre shabd hain.</li>
<li><code>open(...).read().splitlines()</code> file ko newline ke bina lines ki list banata hai.</li>
<li>Loop har diff line print karta hai. Files identical hon to kuch print nahi hota.</li>
</ul>
`+i+`
`+n([`file ke naam (from, to)`,`file ke naam (from, to)`,`hunk: old 1,6 / new 1,7`,`space = unchanged context line`,`- = sirf purani file mein (removed)`,`+ = sirf nayi file mein (added)`],`Diff ki banaavat: header, hunk marker, context, removals aur additions.`)+`

<h3>Ise padhna</h3>
<ul>
<li><code>---</code> aur <code>+++</code> purane aur naye text ka naam batate hain. Yahan purana text <code>before.cfg</code> hai.</li>
<li><code>@@ -1,6 +1,7 @@</code> <b>hunk header</b> hai: purane text mein line 1 se shuru karo aur 6 lines dikhao; naye text mein line 1 se shuru karo aur 7 lines dikhao. 7 minus 6 jodi gayi lines ka net number hai.</li>
<li>Jo line space se shuru hoti hai woh <b>context</b> hai, badli nahi, jagah dhoondhne mein madad ke liye dikhayi gayi.</li>
<li><code>-</code> se shuru line sirf purane text mein hai. <code>+</code> se shuru line sirf naye text mein hai.</li>
<li><b>Badli hui</b> line ek <code>-</code> line ke baad ek <code>+</code> line ki tarah dikhti hai. Yahan <code>ntp server 10.1.1.1</code> badalkar <code>ntp server 10.99.0.50</code> ho gayi.</li>
</ul>
<p>To task ka jawab hai <b>3 added lines</b>: naya NTP server, naya logging host aur SNMP community. Do purani lines hati (purane NTP aur logging servers).</p>

<h3>Direction matter karti hai</h3>
<p>Pehla argument "before" hai, doosra "after". Unhe badal do to har plus minus ban jaata hai. Neeche ka aakhri command "koi change nahi" case bhi dikhata hai: koi output nahi, aur exit code 0.</p>
`+a+`

<h3>Khaali diff, aur generator ka jaal</h3>
<p><code>unified_diff</code> ek <b>generator</b> return karta hai, ek object jo loop karne par lines banata hai. Khaali diff bhi generator object hai, aur generator hamesha "true" hota hai, isliye <code>if diff:</code> tab bhi true hota jab kuch alag nahi hota. Pehle result ko list banao. List khaali ho to false hoti hai.</p>
`+o+`
`+s+`
<p>Isi liye <code>safepush.py</code> <code>diff = list(difflib.unified_diff(...))</code> likhti hai. Chapter 7 isse <code>changes/R1.diff</code> save karta hai, jo record aap change ticket ke saath lagate ho. Lab interpreter mein generator apna kaam jaldi (eagerly) kar leta hai, par results standard Python jaise hi hote hain.</p>

<div class="eg"><p><b>Worked example.</b> Aap switch ka NTP server badalte ho aur colleague puchta hai, "kuch aur toh nahi chhua?". Aap saved before aur after files par diff chalate ho. Ek <code>-</code> line aur ek <code>+</code> line dikhti hai. Woh do lines ticket mein paste kar dete ho. Sawaal paanch second mein, saboot ke saath, khatam.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Lines ki list ki jagah strings dena (string characters ka sequence hai, to aapko ek-ek akshar ka diff milta hai). <code>lineterm=""</code> bhoolna. Generator par <code>if diff:</code> test karna. Arguments badal jaane se diff ulta padhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>---</code> aur <code>+++</code> lines header hain, hati aur jodi line nahi. Changes ginte waqt unhe chhodo.</p></div>

<div class="scn"><h4>"Humne sirf NTP server badla"</h4><p>Change window ke baad ek network engineer ne bataya "sirf NTP chhua gaya". Tool ke save kiye diff mein ek extra <code>+</code> line thi, <code>no ip domain lookup</code>, jo colleague ki baseline file mein galti se thi. Woh harmless thi, par diff ke bina dikhti hi nahi.</p><p><b>Lesson:</b> diff saboot hai. Use kisi ki yaaddasht se zyada bharosa do.</p></div>

<div class="iv"><p class="q">"Automated change ne exactly kya kiya, yeh kaise dikhate ho?"</p><p>Main configuration before aur after padhta hoon, noise lines hata deta hoon, aur do lists par <code>difflib.unified_diff</code> chalata hoon. Output change record ke paas save karta hoon. Sirf <code>+</code> aur <code>-</code> lines matter karti hain; context lines jagah dhoondhne ke liye hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>difflib.unified_diff(old, new, name_old, name_new, lineterm="")</code> lines ki do lists compare karta hai.</li>
<li><code>-</code> matlab sirf purane text mein, <code>+</code> sirf naye text mein, shuru ka space matlab unchanged.</li>
<li>Hunk header <code>@@ -1,6 +1,7 @@</code> purane aur naye text ki line range deta hai.</li>
<li>Khaali hai ya nahi test karne se pehle result ko <code>list(...)</code> mein lapeto.</li>
</ul></div>
`}};export{c as default};