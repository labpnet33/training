var e=(e,t,n,r,i)=>`<text x="`+e+`" y="`+t+`" class="`+(r||`svg-ink`)+`" font-size="`+(i||12)+`">`+n+`</text>`,t=(t,n,r,i)=>`<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="clean() removes noise lines from show running-config"><rect x="10" y="10" width="270" height="170" rx="10" fill="#e2e8f0"/>`+e(24,32,t[0]+` (`+t[1]+` lines)`,`svg-muted`,11)+`<rect x="20" y="42" width="250" height="22" rx="4" fill="#fecaca"/>`+e(28,58,`Building configuration...`)+`<rect x="20" y="68" width="250" height="22" rx="4" fill="#fecaca"/>`+e(28,84,`Current configuration : 872 bytes`)+`<rect x="20" y="94" width="250" height="22" rx="4" fill="#fecaca"/>`+e(28,110,`!`)+`<rect x="20" y="120" width="250" height="22" rx="4" fill="#bbf7d0"/>`+e(28,136,`hostname PUN-CORE-R1`)+`<rect x="20" y="146" width="250" height="22" rx="4" fill="#bbf7d0"/>`+e(28,162,`ntp server 10.99.0.50`)+`<rect x="360" y="10" width="270" height="170" rx="10" fill="#e2e8f0"/>`+e(374,32,n[0]+` (`+n[1]+` lines)`,`svg-muted`,11)+`<rect x="370" y="120" width="250" height="22" rx="4" fill="#bbf7d0"/>`+e(378,136,`hostname PUN-CORE-R1`)+`<rect x="370" y="146" width="250" height="22" rx="4" fill="#bbf7d0"/>`+e(378,162,`ntp server 10.99.0.50`)+e(374,84,r[0],`svg-muted`,11)+e(374,102,r[1],`svg-muted`,11)+`<rect x="288" y="78" width="64" height="30" rx="8" fill="#fde68a"/>`+e(298,98,`clean()`,`svg-ink`,12)+`<line x1="280" y1="93" x2="288" y2="93" stroke="#64748b" stroke-width="2"/><line x1="352" y1="93" x2="360" y2="93" stroke="#64748b" stroke-width="2"/></svg><p class="cap">`+i+`</p></div>`,n=`<pre class="code">NOISE = ("Building configuration", "Current configuration")


def clean(text):
    """Running config without the lines that change by themselves."""
    return [ln.rstrip() for ln in text.splitlines()
            if ln.strip() and not ln.startswith("!") and not ln.startswith(NOISE)]</pre>`,r=`<pre class="code">import difflib
from nkmiko import ConnectHandler

NOISE = ("Building configuration", "Current configuration")


def clean(text):
    return [ln.rstrip() for ln in text.splitlines()
            if ln.strip() and not ln.startswith("!") and not ln.startswith(NOISE)]


def grab(ip):
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    text = conn.send_command("show running-config")
    conn.disconnect()
    return text


r1 = grab("10.99.0.1")
r2 = grab("10.99.0.2")
print(len(r1.splitlines()), "raw lines on R1,", len(clean(r1)), "after clean()")
print("--- raw diff")
for ln in difflib.unified_diff(r1.splitlines(), r2.splitlines(), "R1", "R2", lineterm="", n=0):
    print(ln)
print("--- clean diff")
for ln in difflib.unified_diff(clean(r1), clean(r2), "R1", "R2", lineterm="", n=0):
    print(ln)</pre>`,i=`<pre class="out"><span class="hl">AUTO01$ python3 compare.py</span>
55 raw lines on R1, 36 after clean()
--- raw diff
--- R1
+++ R2
@@ -3 +3 @@
<span class="hl">-Current configuration : 872 bytes
+Current configuration : 848 bytes</span>
@@ -10 +10 @@
-hostname PUN-CORE-R1
+hostname BLR-EDGE-R2
@@ -22 +22 @@
- ip address 10.99.0.1 255.255.255.0
+ ip address 10.99.0.2 255.255.255.0
@@ -45,2 +44,0 @@
-ntp server 10.99.0.50
<span class="hl">-!</span>
--- clean diff
--- R1
+++ R2
@@ -5 +5 @@
-hostname PUN-CORE-R1
+hostname BLR-EDGE-R2
@@ -12 +12 @@
- ip address 10.99.0.1 255.255.255.0
+ ip address 10.99.0.2 255.255.255.0
@@ -29 +28,0 @@
-ntp server 10.99.0.50</pre>`,a=`<pre class="out"><span class="hl">AUTO01$ python3 trap.py</span>
False
True
True
False</pre>`,o=`<pre class="code">have = ["logging host 10.99.0.51", "ntp server 10.99.0.50"]
wanted = "logging host 10.99.0.5"
print(wanted in have)                 <span class="c"># whole-line test on a list</span>
print(wanted in " ".join(have))       <span class="c"># substring test on one long string</span>
print(wanted in "\\n".join(have))      <span class="c"># still substrings</span>
print(any(wanted == ln for ln in have))</pre>`,s={id:`clean-and-compare`,h:{en:`Clean the config, then compare lines (not substrings)`,hi:`Config saaf karo, phir lines compare karo (substrings nahi)`},body:{en:`
<p><b>The idea of this chapter:</b> before a script can say "this line is missing" or "nothing changed", it must compare two pieces of text fairly. Two traps spoil the comparison: lines that change by themselves, and comparing pieces of a line instead of whole lines.</p>

<h3>Analogy: two photocopies with a date stamp</h3>
<p>You photocopy a contract today and again tomorrow and ask "did anything change?". The machine prints the date and a page counter on each copy, so a naive check says "everything differs". You would first cover the stamp, then compare. A router prints a stamp on every <code>show running-config</code> too.</p>

<h3>What changes by itself</h3>
<p>The top of the output looks like this, and the lines below it are decoration, not configuration:</p>
<ul>
<li><code>Building configuration...</code> and <code>Current configuration : 872 bytes</code>. The byte count changes with every change, so it can never match a saved copy.</li>
<li>Lines that contain only <code>!</code>, the separator between sections.</li>
<li>Blank lines and trailing spaces.</li>
</ul>
<p>The lab tool throws these away with one small function. It keeps the leading spaces of lines such as <code> ip address ...</code>, because indentation is part of the configuration (it shows the line belongs to an interface).</p>
`+n+`
<ul>
<li><code>text.splitlines()</code> turns the router's text into a list of lines.</li>
<li><code>ln.strip()</code> is empty for blank lines, so <code>if ln.strip()</code> drops them.</li>
<li><code>ln.startswith("!")</code> drops the separators.</li>
<li><code>ln.startswith(NOISE)</code> accepts a tuple, so one test covers both header lines.</li>
<li><code>ln.rstrip()</code> removes trailing spaces but keeps the indentation on the left.</li>
</ul>
`+t([`show running-config`,55],[`clean() result`,36],[`only real`,`configuration`],`The red lines are noise; the green lines are the configuration that the tool compares.`)+`

<h3>See the difference</h3>
<p>Type <code>compare.py</code> on AUTO01. It reads the running configuration of R1 and R2, which genuinely differ in three places, and diffs them twice: raw and cleaned.</p>
`+r+`
`+i+`
<p>Both diffs show the true differences (hostname, address, the NTP line that only R1 has). The raw diff also reports a <b>fake difference</b>, the byte count, and a stray <code>!</code>. If you used the raw text for "did anything change?", a no-op would look like a change. Chapter 4 explains how to read the <code>@@</code> lines.</p>

<h3>Compare whole lines, not substrings</h3>
<p>The plan step asks, for every baseline line, "does the router already have this?". The way you ask matters. Write a small test, <code>trap.py</code>. The router has <code>logging host 10.99.0.51</code>; the baseline wants <code>logging host 10.99.0.5</code>, a different server whose address is a prefix of the first.</p>
`+o+`
`+a+`
<p>The first and last tests compare whole lines and answer <code>False</code>, which is correct: the router does not have that line. Joining the lines into one string and using <code>in</code> asks a different question, "does this text appear anywhere inside?", and answers <code>True</code>. The tool would conclude that the line is present, skip it, and the router would never get its second syslog server. The safe form is <code>ln not in before</code> where <code>before</code> is the <b>list</b> of cleaned lines. Lab 2 hides exactly this bug.</p>

<h3>Position does not matter, membership does</h3>
<p>The router stores configuration in its own order. If you push <code>ip ssh time-out 60</code> last, it may come back near the top. So the plan and the verification test "is this line somewhere in the list?", never "is it at position 17?". The one place where order matters is the final check "is the config identical to the backup?", and that works because both lists come from the same router in the same order.</p>

<div class="warn"><p><b>Common mistakes.</b> Diffing raw output, so every run looks like a change. Using <code>in</code> on one long string. Stripping <b>all</b> spaces, which removes the indentation and makes <code> shutdown</code> under an interface look like a global line.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>"abc" in ["abcd"]</code> is <code>False</code> (list: whole-item equality) but <code>"abc" in "abcd"</code> is <code>True</code> (string: substring). The same word <code>in</code> means two different tests.</p></div>

<div class="scn"><h4>The monitoring server nobody added</h4><p>A baseline asked for <code>logging host 10.20.0.5</code>. Routers already had <code>logging host 10.20.0.50</code>. A substring check reported "already present" and the new collector received nothing for three weeks. The audit found it only when the security team asked why the new collector was empty.</p><p><b>Lesson:</b> compare whole lines. A prefix of an address is not the address.</p></div>

<div class="iv"><p class="q">"Why do you clean the running config before comparing it?"</p><p>The output has lines that are not configuration: the byte count in the header, the banner text and the <code>!</code> separators. They change by themselves and would show as differences. I remove them, keep the indentation, and then compare lists of whole lines.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Header lines, <code>!</code> separators and blank lines are noise; <code>clean()</code> removes them.</li>
<li>Keep leading spaces: indentation shows which mode a line belongs to.</li>
<li>Test membership in a <b>list of lines</b>; never use <code>in</code> on one joined string.</li>
<li>Router order is its own, so compare by membership, and compare whole lists only for "identical to backup".</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> script "yeh line missing hai" ya "kuch nahi badla" kah sake, usse pehle use do text ko insaaf se compare karna hoga. Do jaal comparison bigaadte hain: woh lines jo apne aap badalti hain, aur poori line ki jagah line ke tukde compare karna.</p>

<h3>Analogy: date stamp wali do photocopy</h3>
<p>Aap aaj ek contract ki photocopy karte ho aur kal phir, aur puchte ho "kuch badla?". Machine har copy par date aur page counter chhapti hai, isliye naive check kehta hai "sab alag hai". Aap pehle stamp dhakoge, phir compare karoge. Router bhi har <code>show running-config</code> par stamp chhapta hai.</p>

<h3>Apne aap kya badalta hai</h3>
<p>Output ka upar ka hissa aisa dikhta hai, aur neeche ki yeh lines sajaavat hain, configuration nahi:</p>
<ul>
<li><code>Building configuration...</code> aur <code>Current configuration : 872 bytes</code>. Byte count har change ke saath badalta hai, isliye woh saved copy se kabhi match nahi karega.</li>
<li>Sirf <code>!</code> wali lines, jo sections ke beech separator hain.</li>
<li>Blank lines aur trailing spaces.</li>
</ul>
<p>Lab tool inhe ek chhote function se hata deta hai. Woh <code> ip address ...</code> jaisi lines ke left ke spaces rakhta hai, kyunki indentation configuration ka hissa hai (woh dikhata hai ki line kisi interface ki hai).</p>
`+n+`
<ul>
<li><code>text.splitlines()</code> router ke text ko lines ki list banata hai.</li>
<li>Blank lines ke liye <code>ln.strip()</code> khaali hota hai, isliye <code>if ln.strip()</code> unhe hata deta hai.</li>
<li><code>ln.startswith("!")</code> separators hata deta hai.</li>
<li><code>ln.startswith(NOISE)</code> tuple leta hai, isliye ek test dono header lines ko cover karta hai.</li>
<li><code>ln.rstrip()</code> trailing spaces hatata hai par left ki indentation rakhta hai.</li>
</ul>
`+t([`show running-config`,55],[`clean() result`,36],[`sirf asli`,`configuration`],`Laal lines noise hain; hari lines woh configuration hain jo tool compare karta hai.`)+`

<h3>Antar dekho</h3>
<p>AUTO01 par <code>compare.py</code> type karo. Yeh R1 aur R2 ki running configuration padhta hai, jo teen jagah sach mein alag hain, aur unka diff do baar nikalta hai: raw aur cleaned.</p>
`+r+`
`+i+`
<p>Dono diffs sachche antar dikhate hain (hostname, address, NTP line jo sirf R1 par hai). Raw diff ek <b>nakli antar</b> bhi dikhata hai, byte count, aur ek bhatki hui <code>!</code>. "Kuch badla?" ke liye raw text use karte to no-op bhi change jaisa dikhta. Chapter 4 batata hai <code>@@</code> lines kaise padhte hain.</p>

<h3>Poori lines compare karo, substrings nahi</h3>
<p>Plan step har baseline line ke liye puchta hai "kya router ke paas yeh pehle se hai?". Aap kaise puchte ho, yeh matter karta hai. Ek chhota test <code>trap.py</code> likho. Router ke paas <code>logging host 10.99.0.51</code> hai; baseline <code>logging host 10.99.0.5</code> maangti hai, jo alag server hai aur jiska address pehle wale ka prefix hai.</p>
`+o+`
`+a+`
<p>Pehla aur aakhri test poori lines compare karte hain aur <code>False</code> dete hain, jo sahi hai: router ke paas woh line nahi hai. Lines ko ek string mein joda aur <code>in</code> use kiya to alag sawaal pucha jata hai, "kya yeh text kahin bhi andar aata hai?", aur jawab <code>True</code> aata hai. Tool maan lega ki line maujood hai, use skip karega, aur router ko doosra syslog server kabhi nahi milega. Safe form <code>ln not in before</code> hai jahan <code>before</code> cleaned lines ki <b>list</b> hai. Lab 2 mein yahi bug chhupa hai.</p>

<h3>Position nahi, membership matter karta hai</h3>
<p>Router configuration ko apne order mein rakhta hai. Aap <code>ip ssh time-out 60</code> sabse aakhir mein push karo, to wapas padhne par woh upar ke paas mil sakti hai. Isliye plan aur verification puchte hain "kya yeh line list mein kahin hai?", kabhi "kya yeh position 17 par hai?" nahi. Order sirf ek jagah matter karta hai, aakhri check "kya config backup jaisi hi hai?", aur woh isliye chalta hai ki dono lists ek hi router se ek hi order mein aati hain.</p>

<div class="warn"><p><b>Common mistakes.</b> Raw output diff karna, jisse har run change jaisa dikhta hai. Ek lambi string par <code>in</code> use karna. <b>Saare</b> spaces hata dena, jisse indentation chali jaati hai aur interface ke neeche ki <code> shutdown</code> global line jaisi dikhti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>"abc" in ["abcd"]</code> <code>False</code> hai (list: poore item ki barabari) par <code>"abc" in "abcd"</code> <code>True</code> hai (string: substring). Ek hi shabd <code>in</code> do alag test karta hai.</p></div>

<div class="scn"><h4>Monitoring server jo kisi ne add nahi kiya</h4><p>Baseline ne <code>logging host 10.20.0.5</code> maanga. Routers ke paas pehle se <code>logging host 10.20.0.50</code> tha. Substring check ne "already present" bataya aur naya collector teen hafte tak khaali raha. Audit mein tab pata chala jab security team ne puchha ki naya collector khaali kyon hai.</p><p><b>Lesson:</b> poori lines compare karo. Address ka prefix address nahi hota.</p></div>

<div class="iv"><p class="q">"Compare karne se pehle running config ko clean kyon karte ho?"</p><p>Output mein aisi lines hain jo configuration nahi hain: header mein byte count, banner text aur <code>!</code> separators. Woh apne aap badalti hain aur antar ki tarah dikhengi. Main unhe hata deta hoon, indentation rakhta hoon, aur phir poori lines ki lists compare karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Header lines, <code>!</code> separators aur blank lines noise hain; <code>clean()</code> unhe hatata hai.</li>
<li>Leading spaces rakho: indentation batati hai ki line kis mode ki hai.</li>
<li><b>Lines ki list</b> mein membership test karo; ek joined string par kabhi <code>in</code> nahi.</li>
<li>Router ka order uska apna hai, isliye membership se compare karo, aur poori list sirf "backup jaisi identical" ke liye.</li>
</ul></div>
`}};export{s as default};