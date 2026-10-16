var e={id:`regex-groups`,h:{en:`Regular expressions 2: groups, named groups and show version`,hi:`Regular expressions 2: groups, named groups aur show version`},body:{en:`
<p>The previous chapter found text. This one <b>extracts</b> it. The tool is the <b>group</b>: round brackets <code>( )</code> around the part of the pattern whose text you want to keep. With groups you can pull the version, hostname, uptime and serial number out of <code>show version</code>, which is what lab 2 does.</p>
<h3>Why groups?</h3>
<p><code>re.search(r"Version \\S+,", line)</code> matched <code>Version 2.0,</code>, but we only want <code>2.0</code>. Put the interesting part in brackets and ask for it with <code>.group(1)</code>:</p>
<pre class="code">import re

line = "MyPnetLab Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE"
m = re.search(r"Version (\\S+),", line)
print(m.group())
print(m.group(1))</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">Version 2.0,
2.0</pre>
<p><code>m.group()</code> (or <code>group(0)</code>) is the whole match, including the label. <code>m.group(1)</code> is only what the <b>first pair of brackets</b> captured: <code>2.0</code>. The label <code>Version </code> and the comma act as <b>anchors</b>: they tell the engine where the value begins and ends, and they are not kept. This is anchoring on text that does not change, the idea from the split chapter.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Anchors and a group"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Label</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">Version</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Group</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">(\\S+) the value</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">End anchor</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">,</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">Result</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">m.group(1)</text></svg><p class="cap">Anchors and a group</p></div>
<h3>Parsing show version with four patterns</h3>
<p>This is the output of <code>show version</code> of router BLR-CORE in lab 2 (shortened to the useful lines), and four patterns, one per fact. Each pattern anchors on a stable label.</p>
<pre class="code">import re

out = """MyPnetLab Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE
Technical Support: ns.example/support

BLR-CORE uptime is 0 minutes
System returned to ROM by power-on
Processor board ID NK3C15U4X00
4 Gigabit Ethernet interfaces"""

host = re.search(r"(\\S+) uptime is", out).group(1)
version = re.search(r"Version (\\S+),", out).group(1)
uptime = re.search(r"uptime is (.+)", out).group(1)
serial = re.search(r"Processor board ID (\\S+)", out).group(1)
print(host, version, uptime, serial, sep=" | ")</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">BLR-CORE | 2.0 | 0 minutes | NK3C15U4X00</pre>
<p>Read each pattern aloud. <code>(\\S+) uptime is</code>: a group of non-space characters, then a space and the words <code>uptime is</code>; the group is the hostname just before them. <code>uptime is (.+)</code>: after those words, <code>.+</code> means "one or more of any character", which takes the rest of the line. <code>Processor board ID (\\S+)</code>: the word after the label is the serial.</p>
<h3>The case-sensitivity bug of lab 2</h3>
<p>In the lab, the version pattern is written with a lowercase <code>v</code>: <code>r"version (\\S+),"</code>. The output spells it <code>Version</code>. Regex is case-sensitive, so <code>search</code> returns <code>None</code>, and <code>None.group(1)</code> crashes.</p>
<pre class="code">import re

out = "MyPnetLab Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE"
version = re.search(r"version (\\S+),", out).group(1)
print(version)</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">Traceback (most recent call last):
  File "casebug.py", line 4, in &lt;module&gt;
    version = re.search(r"version (\\S+),", out).group(1)
AttributeError: 'NoneType' object has no attribute 'group'</pre>
<p>The last line, <code>AttributeError: 'NoneType' object has no attribute 'group'</code>, is the classic regex failure. It does not mean <code>group</code> is broken. It means <b>the pattern found nothing</b>, so there is no match object. The fix in the lab is one letter, <code>Version</code>, or the flag <code>re.I</code>. A defensive script checks first:</p>
<pre class="code">import re

out = "MyPnetLab Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE"
m = re.search(r"version (\\S+),", out)
if m:
    print("version:", m.group(1))
else:
    print("version line not found - check the pattern")
print(re.search(r"version (\\S+),", out, re.I).group(1))</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">version line not found - check the pattern
2.0</pre>
<h3>Several groups at once and named groups</h3>
<p>A pattern may have many groups: <code>group(1)</code>, <code>group(2)</code> and so on, counted by the position of the opening bracket. For readability you can <b>name</b> a group with <code>(?P&lt;name&gt;...)</code> and read it by name.</p>
<pre class="code">import re

line = "GigabitEthernet0/3     unassigned      YES unset  administratively down down"
pat = r"^(?P&lt;name&gt;\\S+)\\s+(?P&lt;ip&gt;\\S+)\\s+YES\\s+\\S+\\s+(?P&lt;status&gt;administratively down|up|down)\\s+(?P&lt;proto&gt;up|down)$"
m = re.match(pat, line)
print(m.group("name"), "|", m.group("status"), "|", m.group("proto"))
print(m.groupdict())</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">GigabitEthernet0/3 | administratively down | down
{'name': 'GigabitEthernet0/3', 'ip': 'unassigned', 'status': 'administratively down', 'proto': 'down'}</pre>
<p>The pattern solves the two-word status problem from the previous chapter. <code>(administratively down|up|down)</code> is an <b>alternation</b>: one of three choices, tried left to right, so the two-word phrase is tried first. <code>^</code> and <code>$</code> pin the pattern to the start and end of the line. <code>groupdict()</code> returns the named groups as a dictionary, which is already half way to structured data.</p>
<h3>One pattern over a whole table</h3>
<p><code>re.finditer</code> walks through every match in a multi-line text, and the flag <code>re.M</code> (multi-line) lets <code>^</code> and <code>$</code> match at every line, not only at the ends of the whole text.</p>
<pre class="code">import re

output = """Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/2     10.50.0.1       YES manual down                  down
GigabitEthernet0/3     unassigned      YES unset  administratively down down
Loopback0              1.1.1.1         YES manual up                    up"""

pat = r"^(\\S+)\\s+(\\S+)\\s+YES\\s+\\S+\\s+(administratively down|up|down)\\s+(up|down)$"
rows = [m.groups() for m in re.finditer(pat, output, re.M)]
for row in rows:
    print(row)
print("up/up:", [r[0] for r in rows if r[2] == "up" and r[3] == "up"])</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">('GigabitEthernet0/0', '10.99.0.1', 'up', 'up')
('GigabitEthernet0/2', '10.50.0.1', 'down', 'down')
('GigabitEthernet0/3', 'unassigned', 'administratively down', 'down')
('Loopback0', '1.1.1.1', 'up', 'up')
up/up: ['GigabitEthernet0/0', 'Loopback0']</pre>
<p>The heading line was skipped automatically because it does not match the pattern (it has no <code>YES</code>). This is a strength of regex: <b>non-matching lines simply do not count</b>. The <code>groups()</code> method returns all groups as a tuple.</p>
<h3>Greedy and lazy</h3>
<p><code>.+</code> is <b>greedy</b>: it grabs as much as it can. <code>.+?</code> is <b>lazy</b>: as little as it can. For <code>&lt;b&gt;x&lt;/b&gt;&lt;b&gt;y&lt;/b&gt;</code> style text the difference matters; for line-based network output you rarely need lazy, but you must know why <code>uptime is (.+)</code> takes the rest of the line.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) Using <code>.group(1)</code> without checking for <code>None</code>. (2) Forgetting that spelling and case must match, such as <code>Version</code> versus <code>version</code>. (3) Using <code>.*</code> where <code>\\S+</code> is meant, so the match swallows a whole line. (4) Anchoring on position instead of on a stable label. (5) Forgetting <code>re.M</code>, so <code>^</code> and <code>$</code> match only at the very start and end of the whole text.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>group(0)</code> is the whole match and <code>group(1)</code> the first bracket. A failed search returns <code>None</code>, so <code>.group</code> on it raises <code>AttributeError</code>. <code>re.I</code> makes a pattern case-insensitive.</p></div>
<div class="scn"><h4>One capital letter, three routers</h4><p>Finance asked for an inventory of three routers. The engineer's script crashed on the first router with <code>'NoneType' object has no attribute 'group'</code>. He suspected SSH, then the regex engine. A colleague printed the raw output next to the pattern and noticed <code>Version</code> with a capital V against <code>version</code> in the pattern. One letter later, all three routers printed with their versions.</p>
<p><b>Lesson:</b> when a pattern returns None, compare it character by character with the real output.</p></div>
<div class="iv"><p class="q">"How do you extract the software version from show version using Python?"</p><p>I use <code>re.search(r"Version (\\S+),", output)</code> and read <code>group(1)</code>, anchoring on the stable word Version and the comma. I check the result for <code>None</code> before using it, remember that regex is case-sensitive, and test the pattern on real output from more than one device. For many devices and platforms I would use a tested parser instead.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Round brackets create a group; <code>group(1)</code> returns only the captured text.</li>
<li>Anchor patterns on stable labels such as <code>Version</code>, <code>uptime is</code> and <code>Processor board ID</code>.</li>
<li><code>None</code> from <code>search</code> means no match; <code>.group</code> on it raises AttributeError.</li>
<li>Named groups <code>(?P&lt;name&gt;...)</code> and <code>groupdict()</code> give dictionaries.</li>
<li><code>re.finditer</code> with <code>re.M</code> runs one pattern over every line of a table.</li>
</ul></div>
`,hi:`
<p>Pichhle chapter ne text dhoondha. Yeh chapter use <b>nikalta</b> hai. Tool hai <b>group</b>: pattern ke us hisse ke aaspaas round brackets <code>( )</code> jiska text aap rakhna chahte ho. Groups se aap <code>show version</code> se version, hostname, uptime aur serial number nikaal sakte ho, jo lab 2 karta hai.</p>
<h3>Groups kyun?</h3>
<p><code>re.search(r"Version \\S+,", line)</code> ne <code>Version 2.0,</code> match kiya, lekin hume sirf <code>2.0</code> chahiye. Kaam ke hisse ko brackets mein rakho aur <code>.group(1)</code> se maango:</p>
<pre class="code">import re

line = "MyPnetLab Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE"
m = re.search(r"Version (\\S+),", line)
print(m.group())
print(m.group(1))</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">Version 2.0,
2.0</pre>
<p><code>m.group()</code> (ya <code>group(0)</code>) poora match hai, label samet. <code>m.group(1)</code> sirf wahi hai jo <b>pehle bracket ke jode</b> ne pakda: <code>2.0</code>. Label <code>Version </code> aur comma <b>anchors</b> ka kaam karte hain: woh engine ko batate hain value kahan shuru aur khatam hoti hai, aur rakhe nahi jaate. Yeh split chapter wala idea hai: jo text nahi badalta uspar anchor karna.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Anchors aur ek group"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Label</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">Version</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Group</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">(\\S+) value</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">End anchor</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">,</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">Result</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">m.group(1)</text></svg><p class="cap">Anchors aur ek group</p></div>
<h3>Chaar patterns se show version parse karna</h3>
<p>Yeh lab 2 mein router BLR-CORE ka <code>show version</code> output hai (kaam ki lines tak chhota kiya hua), aur chaar patterns, har fact ke liye ek. Har pattern ek stable label par anchor hai.</p>
<pre class="code">import re

out = """MyPnetLab Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE
Technical Support: ns.example/support

BLR-CORE uptime is 0 minutes
System returned to ROM by power-on
Processor board ID NK3C15U4X00
4 Gigabit Ethernet interfaces"""

host = re.search(r"(\\S+) uptime is", out).group(1)
version = re.search(r"Version (\\S+),", out).group(1)
uptime = re.search(r"uptime is (.+)", out).group(1)
serial = re.search(r"Processor board ID (\\S+)", out).group(1)
print(host, version, uptime, serial, sep=" | ")</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">BLR-CORE | 2.0 | 0 minutes | NK3C15U4X00</pre>
<p>Har pattern zor se padho. <code>(\\S+) uptime is</code>: non-space characters ka group, phir ek space aur shabd <code>uptime is</code>; group un shabdon ke theek pehle ka hostname hai. <code>uptime is (.+)</code>: un shabdon ke baad <code>.+</code> ka matlab "kisi bhi character ka ek ya zyada", jo line ka baaki hissa le leta hai. <code>Processor board ID (\\S+)</code>: label ke baad ka shabd serial hai.</p>
<h3>Lab 2 ka case-sensitivity bug</h3>
<p>Lab mein version pattern lowercase <code>v</code> se likha hai: <code>r"version (\\S+),"</code>. Output mein spelling <code>Version</code> hai. Regex case-sensitive hai, isliye <code>search</code> <code>None</code> return karta hai, aur <code>None.group(1)</code> crash karta hai.</p>
<pre class="code">import re

out = "MyPnetLab Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE"
version = re.search(r"version (\\S+),", out).group(1)
print(version)</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">Traceback (most recent call last):
  File "casebug.py", line 4, in &lt;module&gt;
    version = re.search(r"version (\\S+),", out).group(1)
AttributeError: 'NoneType' object has no attribute 'group'</pre>
<p>Aakhri line, <code>AttributeError: 'NoneType' object has no attribute 'group'</code>, classic regex failure hai. Iska matlab yeh nahi ki <code>group</code> kharab hai. Iska matlab <b>pattern ko kuch nahi mila</b>, isliye match object nahi hai. Lab mein fix ek akshar hai, <code>Version</code>, ya flag <code>re.I</code>. Defensive script pehle check karti hai:</p>
<pre class="code">import re

out = "MyPnetLab Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE"
m = re.search(r"version (\\S+),", out)
if m:
    print("version:", m.group(1))
else:
    print("version line not found - check the pattern")
print(re.search(r"version (\\S+),", out, re.I).group(1))</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">version line not found - check the pattern
2.0</pre>
<h3>Ek saath kai groups aur named groups</h3>
<p>Pattern mein kai groups ho sakte hain: <code>group(1)</code>, <code>group(2)</code> aur aise hi, opening bracket ki position se ginte hue. Padhne mein aasani ke liye group ko <code>(?P&lt;name&gt;...)</code> se <b>naam</b> de sakte ho aur naam se padh sakte ho.</p>
<pre class="code">import re

line = "GigabitEthernet0/3     unassigned      YES unset  administratively down down"
pat = r"^(?P&lt;name&gt;\\S+)\\s+(?P&lt;ip&gt;\\S+)\\s+YES\\s+\\S+\\s+(?P&lt;status&gt;administratively down|up|down)\\s+(?P&lt;proto&gt;up|down)$"
m = re.match(pat, line)
print(m.group("name"), "|", m.group("status"), "|", m.group("proto"))
print(m.groupdict())</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">GigabitEthernet0/3 | administratively down | down
{'name': 'GigabitEthernet0/3', 'ip': 'unassigned', 'status': 'administratively down', 'proto': 'down'}</pre>
<p>Yeh pattern pichhle chapter ki do-shabd status problem solve karta hai. <code>(administratively down|up|down)</code> ek <b>alternation</b> hai: teen mein se ek choice, baayein se daayein try hoti hai, isliye do-shabd phrase pehle try hota hai. <code>^</code> aur <code>$</code> pattern ko line ki shuruaat aur ant par pin karte hain. <code>groupdict()</code> named groups ko dictionary ke roop mein deta hai, jo structured data ki taraf aadha raasta hai.</p>
<h3>Poori table par ek pattern</h3>
<p><code>re.finditer</code> multi-line text ke har match par chalta hai, aur flag <code>re.M</code> (multi-line) <code>^</code> aur <code>$</code> ko har line par match karne deta hai, sirf poore text ke dono sire par nahi.</p>
<pre class="code">import re

output = """Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/2     10.50.0.1       YES manual down                  down
GigabitEthernet0/3     unassigned      YES unset  administratively down down
Loopback0              1.1.1.1         YES manual up                    up"""

pat = r"^(\\S+)\\s+(\\S+)\\s+YES\\s+\\S+\\s+(administratively down|up|down)\\s+(up|down)$"
rows = [m.groups() for m in re.finditer(pat, output, re.M)]
for row in rows:
    print(row)
print("up/up:", [r[0] for r in rows if r[2] == "up" and r[3] == "up"])</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">('GigabitEthernet0/0', '10.99.0.1', 'up', 'up')
('GigabitEthernet0/2', '10.50.0.1', 'down', 'down')
('GigabitEthernet0/3', 'unassigned', 'administratively down', 'down')
('Loopback0', '1.1.1.1', 'up', 'up')
up/up: ['GigabitEthernet0/0', 'Loopback0']</pre>
<p>Heading line apne aap skip ho gayi kyunki woh pattern se match nahi karti (usme <code>YES</code> nahi). Yeh regex ki taakat hai: <b>na match karne wali lines gini hi nahi jaati</b>. <code>groups()</code> method saare groups ko tuple ke roop mein deta hai.</p>
<h3>Greedy aur lazy</h3>
<p><code>.+</code> <b>greedy</b> hai: jitna ho sake utna le leta hai. <code>.+?</code> <b>lazy</b> hai: jitna kam ho sake. Line-based network output mein lazy ki kam zaroorat padti hai, lekin yeh jaanna zaroori hai ki <code>uptime is (.+)</code> line ka baaki hissa kyun le leta hai.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) <code>None</code> check kiye bina <code>.group(1)</code> use karna. (2) Yeh bhoolna ki spelling aur case match hone chahiye, jaise <code>Version</code> vs <code>version</code>. (3) Jahan <code>\\S+</code> chahiye wahan <code>.*</code> use karna, jisse match poori line nigal leta hai. (4) Stable label ki jagah position par anchor karna. (5) <code>re.M</code> bhoolna, isliye <code>^</code> aur <code>$</code> sirf poore text ki shuruaat aur ant par match hote hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>group(0)</code> poora match hai aur <code>group(1)</code> pehla bracket. Fail hui search <code>None</code> return karti hai, isliye uspar <code>.group</code> <code>AttributeError</code> deta hai. <code>re.I</code> pattern ko case-insensitive banata hai.</p></div>
<div class="scn"><h4>Ek capital letter, teen routers</h4><p>Finance ne teen routers ki inventory maangi. Engineer ki script pehle router par <code>'NoneType' object has no attribute 'group'</code> se crash hui. Use pehle SSH par shak hua, phir regex engine par. Ek colleague ne raw output ko pattern ke saath print kiya aur dekha ki output mein capital V wala <code>Version</code> hai jabki pattern mein <code>version</code>. Ek akshar ke baad teeno routers apne versions ke saath print hue.</p>
<p><b>Lesson:</b> pattern <code>None</code> de to use asli output se akshar akshar milao.</p></div>
<div class="iv"><p class="q">"Python se show version ka software version kaise nikaalte ho?"</p><p>Main <code>re.search(r"Version (\\S+),", output)</code> use karta hoon aur <code>group(1)</code> padhta hoon, stable shabd Version aur comma par anchor karke. Result use karne se pehle <code>None</code> check karta hoon, yaad rakhta hoon ki regex case-sensitive hai, aur pattern ko ek se zyada device ke asli output par test karta hoon. Bahut devices aur platforms ke liye main tested parser use karta.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Round brackets group banate hain; <code>group(1)</code> sirf pakda hua text deta hai.</li>
<li><code>Version</code>, <code>uptime is</code> aur <code>Processor board ID</code> jaise stable labels par anchor karo.</li>
<li><code>search</code> se <code>None</code> ka matlab match nahi; uspar <code>.group</code> AttributeError deta hai.</li>
<li>Named groups <code>(?P&lt;name&gt;...)</code> aur <code>groupdict()</code> dictionaries dete hain.</li>
<li><code>re.finditer</code> aur <code>re.M</code> table ki har line par ek pattern chalate hain.</li>
</ul></div>
`}};export{e as default};