var e={id:`regex-basics`,h:{en:`Regular expressions 1: search for a pattern with re`,hi:`Regular expressions 1: re se pattern dhoondho`},body:{en:`
<p>A <b>regular expression</b> (regex) is a small language for describing text patterns, such as "the word Version, a space, then some non-space characters". Instead of counting words or positions, you describe <b>what the value looks like</b>, and the <code>re</code> module finds it. This is the tool for values hidden inside sentences, and it is what lab 2 uses.</p>
<h3>The idea: describe the shape</h3>
<p>Think of a shape-sorting toy. Each hole accepts only one shape. A regex is a set of holes; text passes through only where its shape fits. A pattern such as <code>\\d+</code> means "one or more digits", so it fits <code>2026</code> and <code>10</code> but not <code>abc</code>.</p>
<h3>Your first search</h3>
<p><code>re.search(pattern, text)</code> looks <b>anywhere</b> in the text for the first place where the pattern fits. It returns a <b>match object</b> if found, or <code>None</code> if not.</p>
<pre class="code">import re

line = "MyPnetLab Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE"
m = re.search(r"Version", line)
print(m)
print(m.group())
print(re.search(r"Cisco", line))</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">&lt;re.Match object; span=(51, 58), match='Version'&gt;
Version
None</pre>
<p>The first search found the word and printed a match object, which says where the match sits (<code>span</code>) and what it matched. <code>m.group()</code> returns the matched text. The last search found nothing and returned <code>None</code>. Always remember: <b>no match means None</b>, and calling a method on <code>None</code> is an error you will meet in the lab.</p>
<h3>The raw string prefix</h3>
<p>Notice <code>r"Version"</code>: a string with an <code>r</code> in front is a <b>raw string</b>. Python leaves backslashes alone inside it. Regex uses backslashes a lot (<code>\\d</code>, <code>\\s</code>), so write patterns as raw strings every time.</p>
<h3>The building blocks</h3>
<table class="cmp"><tr><th>Piece</th><th>Meaning</th><th>Example</th></tr><tr><td><code>abc</code></td><td>the literal text</td><td><code>Version</code> finds Version</td></tr><tr><td><code>\\d</code></td><td>one digit</td><td><code>\\d\\d</code> finds 20</td></tr><tr><td><code>\\s</code></td><td>one whitespace (space, tab)</td><td></td></tr><tr><td><code>\\S</code></td><td>one non-whitespace</td><td></td></tr><tr><td><code>\\w</code></td><td>letter, digit or underscore</td><td></td></tr><tr><td><code>.</code></td><td>any one character</td><td><code>a.c</code> finds abc</td></tr><tr><td><code>\\.</code></td><td>a real dot</td><td><code>10\\.99</code></td></tr><tr><td><code>+</code></td><td>one or more of the previous</td><td><code>\\d+</code> finds 2026</td></tr><tr><td><code>*</code></td><td>zero or more</td><td></td></tr><tr><td><code>?</code></td><td>zero or one</td><td></td></tr><tr><td><code>^</code> and <code>$</code></td><td>start and end of the line</td><td></td></tr></table>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="A pattern is a row of holes"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Literal text</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">Version</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Space</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">\\s</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">Group of characters</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">\\S+</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">Comma</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">,</text></svg><p class="cap">A pattern is a row of holes</p></div>
<p>Combine them: <code>Version \\S+,</code> means "the word Version, a space, one or more non-space characters, and a comma". Try it on the line above.</p>
<pre class="code">import re

line = "MyPnetLab Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE"
m = re.search(r"Version \\S+,", line)
print(m.group())
print(re.search(r"\\d+\\.\\d+", line).group())
print(re.findall(r"[A-Z]{2,}", line))</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">Version 2.0,
2.0
['OS', 'NK', 'OS', 'RELEASE', 'SOFTWARE']</pre>
<p>The first pattern matched <code>Version 2.0,</code>, including the comma, which is usually not what we want. The second, <code>\\d+\\.\\d+</code>, matched the number <code>2.0</code> (digits, a real dot, digits). The third uses <code>[A-Z]{2,}</code>: a <b>character class</b> <code>[A-Z]</code> (any capital letter) repeated <b>2 or more</b> times; it found the runs of capital letters in the line. In the next chapter, <b>groups</b> let you keep only the part you need.</p>
<h3>search, match and findall</h3>
<ul>
<li><code>re.search(p, text)</code>: the pattern may be <b>anywhere</b>.</li>
<li><code>re.match(p, text)</code>: the pattern must fit at the <b>start</b> of the text.</li>
<li><code>re.findall(p, text)</code>: returns a list of <b>all</b> non-overlapping matches.</li>
</ul>
<pre class="code">import re

text = "R1 10.99.0.1 up\\nR2 10.99.0.2 down"
print(bool(re.match(r"R1", text)))
print(bool(re.match(r"10", text)))
print(bool(re.search(r"10", text)))
print(re.findall(r"\\d+\\.\\d+\\.\\d+\\.\\d+", text))</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">True
False
True
['10.99.0.1', '10.99.0.2']</pre>
<p><code>match</code> fails for <code>10</code> because the text <b>starts</b> with <code>R1</code>; <code>search</code> finds it anywhere. <code>findall</code> collected both IP addresses. Remember the escaped dots <code>\\.</code> in the IP pattern: an unescaped dot would match any character.</p>
<h3>Case matters</h3>
<p>A regex is <b>case-sensitive</b> by default. <code>Version</code> does not match <code>version</code>. You can switch case-insensitive on with <code>re.IGNORECASE</code> (or <code>re.I</code>). This small fact is behind a lab bug.</p>
<pre class="code">import re

line = "System Version 2.0"
print(re.search(r"version", line))
print(re.search(r"version", line, re.I).group())</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">None
Version</pre>
<h3>Test a pattern before you trust it</h3>
<p>Write the pattern, run it on a <b>sample</b> of real output, and print the result. If the result is <code>None</code>, adjust. Most regex work is this loop of small experiments.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) Forgetting the <code>r</code> before the quotes. (2) An unescaped dot, so <code>10.99</code> also matches <code>10x99</code>. (3) Using <code>match</code> when you meant <code>search</code>. (4) Using the result without checking for <code>None</code>. (5) Writing one giant pattern at once instead of building it piece by piece.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>re.match</code> anchors at the start; <code>re.search</code> does not. <code>\\d</code> is a digit, <code>\\s</code> whitespace, <code>\\S</code> non-whitespace, <code>.</code> any character, <code>\\.</code> a real dot. A failed <code>search</code> returns <code>None</code>.</p></div>
<div class="scn"><h4>The dot that matched too much</h4><p>A script validated management IPs with the pattern <code>10.99.0.1</code>. A typo address <code>10x99y0z1</code> passed the check, because each dot matched any character. The fix was escaping the dots (<code>10\\.99\\.0\\.1</code>) and anchoring the pattern with <code>^</code> and <code>$</code>.</p>
<p><b>Lesson:</b> escape dots, and anchor patterns when you need an exact match.</p></div>
<div class="iv"><p class="q">"What is the difference between re.match, re.search and re.findall?"</p><p><code>match</code> succeeds only if the pattern fits at the start of the string, <code>search</code> finds the first fit anywhere, and <code>findall</code> returns a list of all matches. <code>match</code> and <code>search</code> return a match object or <code>None</code>, so I check the result before using it. I write patterns as raw strings and escape literal dots.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A regex describes the shape of text; <code>re.search</code> returns a match object or None.</li>
<li>Write patterns as raw strings: <code>r"..."</code>.</li>
<li>Key pieces: <code>\\d</code>, <code>\\s</code>, <code>\\S</code>, <code>.</code>, <code>\\.</code>, <code>+</code>, <code>*</code>, <code>?</code>, <code>^</code>, <code>$</code>, <code>[A-Z]</code>, <code>{2,}</code>.</li>
<li><code>match</code> anchors at the start; <code>search</code> looks anywhere; <code>findall</code> returns every match.</li>
<li>Regex is case-sensitive unless you pass <code>re.I</code>.</li>
</ul></div>
`,hi:`
<p><b>Regular expression</b> (regex) text patterns describe karne ki chhoti language hai, jaise "shabd Version, ek space, phir kuch non-space characters". Shabd ya positions ginne ki jagah aap <b>value kaisi dikhti hai</b> yeh describe karte ho, aur <code>re</code> module use dhoondhta hai. Sentences ke andar chhupi values ke liye yahi tool hai, aur lab 2 yahi use karta hai.</p>
<h3>Idea: shape describe karo</h3>
<p>Shape-sorting toy socho. Har hole sirf ek shape leta hai. Regex holes ka set hai; text wahin se guzarta hai jahan uski shape fit ho. <code>\\d+</code> jaisa pattern matlab "ek ya zyada digits", isliye <code>2026</code> aur <code>10</code> fit hote hain lekin <code>abc</code> nahi.</p>
<h3>Aapki pehli search</h3>
<p><code>re.search(pattern, text)</code> text mein <b>kahin bhi</b> pehli jagah dhoondhta hai jahan pattern fit ho. Mil jaaye to <b>match object</b> deta hai, na mile to <code>None</code>.</p>
<pre class="code">import re

line = "MyPnetLab Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE"
m = re.search(r"Version", line)
print(m)
print(m.group())
print(re.search(r"Cisco", line))</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">&lt;re.Match object; span=(51, 58), match='Version'&gt;
Version
None</pre>
<p>Pehli search ne shabd dhoondha aur match object print kiya, jo batata hai match kahan hai (<code>span</code>) aur kya match hua. <code>m.group()</code> matched text deta hai. Aakhri search ko kuch nahi mila aur <code>None</code> mila. Hamesha yaad rakho: <b>match nahi to None</b>, aur <code>None</code> par method call karna error hai jo aap lab mein milenge.</p>
<h3>Raw string prefix</h3>
<p><code>r"Version"</code> dekho: aage <code>r</code> wali string <b>raw string</b> hai. Python usme backslashes ko chhodta hai. Regex backslashes bahut use karta hai (<code>\\d</code>, <code>\\s</code>), isliye patterns hamesha raw string ki tarah likho.</p>
<h3>Building blocks</h3>
<table class="cmp"><tr><th>Piece</th><th>Matlab</th><th>Example</th></tr><tr><td><code>abc</code></td><td>literal text</td><td><code>Version</code> Version dhoondhta hai</td></tr><tr><td><code>\\d</code></td><td>ek digit</td><td><code>\\d\\d</code> 20 dhoondhta hai</td></tr><tr><td><code>\\s</code></td><td>ek whitespace (space, tab)</td><td></td></tr><tr><td><code>\\S</code></td><td>ek non-whitespace</td><td></td></tr><tr><td><code>\\w</code></td><td>letter, digit ya underscore</td><td></td></tr><tr><td><code>.</code></td><td>koi bhi ek character</td><td><code>a.c</code> abc dhoondhta hai</td></tr><tr><td><code>\\.</code></td><td>asli dot</td><td><code>10\\.99</code></td></tr><tr><td><code>+</code></td><td>pichhle ka ek ya zyada</td><td><code>\\d+</code> 2026 dhoondhta hai</td></tr><tr><td><code>*</code></td><td>zero ya zyada</td><td></td></tr><tr><td><code>?</code></td><td>zero ya ek</td><td></td></tr><tr><td><code>^</code> aur <code>$</code></td><td>line ki shuruaat aur ant</td><td></td></tr></table>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Pattern holes ki qataar hai"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Literal text</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">Version</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Space</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">\\s</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">Characters ka group</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">\\S+</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">Comma</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">,</text></svg><p class="cap">Pattern holes ki qataar hai</p></div>
<p>Jodo: <code>Version \\S+,</code> matlab "shabd Version, ek space, ek ya zyada non-space characters, aur ek comma". Upar ki line par try karo.</p>
<pre class="code">import re

line = "MyPnetLab Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE"
m = re.search(r"Version \\S+,", line)
print(m.group())
print(re.search(r"\\d+\\.\\d+", line).group())
print(re.findall(r"[A-Z]{2,}", line))</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">Version 2.0,
2.0
['OS', 'NK', 'OS', 'RELEASE', 'SOFTWARE']</pre>
<p>Pehla pattern <code>Version 2.0,</code> match hua, comma samet, jo aam taur par hume nahi chahiye. Doosra, <code>\\d+\\.\\d+</code>, number <code>2.0</code> match hua (digits, asli dot, digits). Teesra <code>[A-Z]{2,}</code> use karta hai: <b>character class</b> <code>[A-Z]</code> (koi bhi capital letter) <b>2 ya zyada</b> baar dohraya hua; usne line ke capital letters ke runs dhoonde. Agle chapter mein <b>groups</b> aapko sirf kaam ka hissa rakhne dete hain.</p>
<h3>search, match aur findall</h3>
<ul>
<li><code>re.search(p, text)</code>: pattern <b>kahin bhi</b> ho sakta hai.</li>
<li><code>re.match(p, text)</code>: pattern text ki <b>shuruaat</b> mein fit hona chahiye.</li>
<li><code>re.findall(p, text)</code>: <b>saare</b> non-overlapping matches ki list deta hai.</li>
</ul>
<pre class="code">import re

text = "R1 10.99.0.1 up\\nR2 10.99.0.2 down"
print(bool(re.match(r"R1", text)))
print(bool(re.match(r"10", text)))
print(bool(re.search(r"10", text)))
print(re.findall(r"\\d+\\.\\d+\\.\\d+\\.\\d+", text))</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">True
False
True
['10.99.0.1', '10.99.0.2']</pre>
<p><code>match</code> <code>10</code> ke liye fail hota hai kyunki text <code>R1</code> se <b>shuru</b> hota hai; <code>search</code> use kahin bhi dhoondh leta hai. <code>findall</code> ne dono IP addresses ikattha kiye. IP pattern ke escaped dots <code>\\.</code> yaad rakho: bina escape ka dot koi bhi character match karta.</p>
<h3>Case matter karta hai</h3>
<p>Regex by default <b>case-sensitive</b> hai. <code>Version</code> <code>version</code> se match nahi hota. <code>re.IGNORECASE</code> (ya <code>re.I</code>) se case-insensitive kar sakte ho. Yeh chhoti baat ek lab bug ke peeche hai.</p>
<pre class="code">import re

line = "System Version 2.0"
print(re.search(r"version", line))
print(re.search(r"version", line, re.I).group())</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">None
Version</pre>
<h3>Pattern par bharosa karne se pehle test karo</h3>
<p>Pattern likho, use asli output ke <b>sample</b> par chalao, aur result print karo. Result <code>None</code> ho to adjust karo. Zyadatar regex ka kaam chhote experiments ka yahi loop hai.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) Quotes se pehle <code>r</code> bhoolna. (2) Bina escape ka dot, isliye <code>10.99</code> <code>10x99</code> bhi match karta hai. (3) <code>search</code> chahiye tha aur <code>match</code> use karna. (4) <code>None</code> check kiye bina result use karna. (5) Ek hi baar mein ek bada pattern likhna, tukde tukde banane ki jagah.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>re.match</code> shuruaat par anchor hota hai; <code>re.search</code> nahi. <code>\\d</code> digit, <code>\\s</code> whitespace, <code>\\S</code> non-whitespace, <code>.</code> koi bhi character, <code>\\.</code> asli dot. Fail hui <code>search</code> <code>None</code> return karti hai.</p></div>
<div class="scn"><h4>Dot jisne zyada match kar liya</h4><p>Ek script management IPs ko pattern <code>10.99.0.1</code> se validate karti thi. Typo wala address <code>10x99y0z1</code> check pass kar gaya, kyunki har dot kisi bhi character se match hua. Fix tha dots ko escape karna (<code>10\\.99\\.0\\.1</code>) aur pattern ko <code>^</code> aur <code>$</code> se anchor karna.</p>
<p><b>Lesson:</b> dots escape karo, aur exact match chahiye to pattern anchor karo.</p></div>
<div class="iv"><p class="q">"re.match, re.search aur re.findall mein kya difference hai?"</p><p><code>match</code> tabhi safal hota hai jab pattern string ki shuruaat mein fit ho, <code>search</code> kahin bhi pehla fit dhoondhta hai, aur <code>findall</code> saare matches ki list deta hai. <code>match</code> aur <code>search</code> match object ya <code>None</code> return karte hain, isliye main result use karne se pehle check karta hoon. Patterns raw strings mein likhta hoon aur literal dots escape karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Regex text ki shape describe karta hai; <code>re.search</code> match object ya None deta hai.</li>
<li>Patterns raw strings mein likho: <code>r"..."</code>.</li>
<li>Key pieces: <code>\\d</code>, <code>\\s</code>, <code>\\S</code>, <code>.</code>, <code>\\.</code>, <code>+</code>, <code>*</code>, <code>?</code>, <code>^</code>, <code>$</code>, <code>[A-Z]</code>, <code>{2,}</code>.</li>
<li><code>match</code> shuruaat par anchor; <code>search</code> kahin bhi; <code>findall</code> har match deta hai.</li>
<li>Regex case-sensitive hai jab tak <code>re.I</code> na do.</li>
</ul></div>
`}};export{e as default};