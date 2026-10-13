var e={id:`regex-warmup`,h:{en:`Regex warm-up: three patterns on one show line`,hi:`Regex warm-up: ek show line par teen patterns`},body:{en:`
<p>A <b>regular expression</b> (regex) is a pattern that describes text, so a script can pull the useful part out of CLI output. It looks scary because it is written in symbols. This chapter takes one line of <code>show ip interface brief</code> and builds the pattern in three small steps.</p>

<h3>Analogy: a stencil</h3>
<p>You put a stencil over a page and only the shapes you cut out show through. A pattern is a stencil for text: "a word, some spaces, then four numbers separated by dots".</p>

<h3>The line we will use</h3>
<pre class="out">GigabitEthernet0/1   10.1.1.1   YES manual up   up</pre>
<p>We want the interface name and its IP address.</p>

<h3>The five symbols you need today</h3>
<table class="cmp">
<tr><th>Symbol</th><th>Meaning</th><th>Matches in our line</th></tr>
<tr><td><code>\\S+</code></td><td>one or more characters that are <b>not</b> a space</td><td><code>GigabitEthernet0/1</code></td></tr>
<tr><td><code>\\s+</code></td><td>one or more spaces</td><td>the gap between columns</td></tr>
<tr><td><code>\\d+</code></td><td>one or more digits</td><td><code>10</code>, <code>1</code></td></tr>
<tr><td><code>\\.</code></td><td>a real dot (a bare <code>.</code> means "any character")</td><td><code>.</code></td></tr>
<tr><td><code>( )</code></td><td>a <b>group</b>: remember this part</td><td>the part you want back</td></tr>
</table>
<p>Letters with a backslash are shorthand: <code>\\s</code> space, <code>\\S</code> not a space, <code>\\d</code> digit. A <code>+</code> after them means "one or more".</p>

<h3>Step 1: find the name</h3>
<pre class="code">import re

line = "GigabitEthernet0/1   10.1.1.1   YES manual up   up"
m = re.search(r"(\\S+)", line)
print(m.group(1))</pre>
<pre class="out">GigabitEthernet0/1</pre>
<p><code>re.search</code> looks for the pattern anywhere in the text. The <code>r</code> before the quotes makes it a <b>raw string</b>, so Python leaves the backslashes alone. <code>m.group(1)</code> returns what the first set of brackets matched.</p>

<h3>Step 2: add the address</h3>
<pre class="code">m = re.search(r"(\\S+)\\s+(\\d+\\.\\d+\\.\\d+\\.\\d+)", line)
print(m.group(1))
print(m.group(2))</pre>
<pre class="out">GigabitEthernet0/1
10.1.1.1</pre>
<p>Read it left to right: a word (remember it), spaces, then digits, dot, digits, dot, digits, dot, digits (remember that). Group 1 is the name, group 2 is the address.</p>

<h3>Step 3: handle lines that do not match</h3>
<pre class="code">for line in lines:
    m = re.search(r"(\\S+)\\s+(\\d+\\.\\d+\\.\\d+\\.\\d+)", line)
    if m:
        print(m.group(1), m.group(2))</pre>
<p>If nothing matches, <code>re.search</code> gives <code>None</code>, and <code>None.group(1)</code> crashes with an <i>AttributeError</i>. The header line <code>Interface   IP-Address ...</code> has no IP, so always test <code>if m:</code> first.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Pattern pieces matching a line">
<rect x="15" y="20" width="610" height="36" rx="8" fill="#e2e8f0"/><text x="30" y="43" class="svg-ink" font-size="13">GigabitEthernet0/1   10.1.1.1   YES manual up   up</text>
<rect x="15" y="75" width="170" height="36" rx="8" fill="#bae6fd"/><text x="100" y="98" text-anchor="middle" class="svg-ink" font-size="12">(\\S+)  group 1</text>
<rect x="195" y="75" width="90" height="36" rx="8" fill="#e2e8f0"/><text x="240" y="98" text-anchor="middle" class="svg-ink" font-size="12">\\s+</text>
<rect x="295" y="75" width="260" height="36" rx="8" fill="#bbf7d0"/><text x="425" y="98" text-anchor="middle" class="svg-ink" font-size="12">(\\d+\\.\\d+\\.\\d+\\.\\d+)  group 2</text>
</svg><p class="cap">Each piece of the pattern covers one piece of the line.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) A bare dot instead of <code>\\.</code>: it matches any character, so <code>10x1x1x1</code> would match. (2) Forgetting the raw-string <code>r</code> before the quotes. (3) Using <code>.group()</code> on <code>None</code>. (4) Writing one giant pattern at once. Build it in small steps and print after each.</p></div>
<div class="exam"><p><b>Interview trap.</b> "Why not just use <code>split()</code>?" For a clean, fixed-column line it is fine and simpler. Use regex when the line varies or you need to match a shape, such as an IP address inside a longer sentence.</p></div>

<div class="scn"><h4>The header line that crashed the report</h4><p>A script parsed <code>show ip interface brief</code> for 200 switches and stopped on the first one with <i>AttributeError: NoneType has no attribute group</i>. The header line has no IP address, so the pattern returned nothing and the script still tried to read a group. Adding <code>if m:</code> fixed it.</p><p><b>Lesson:</b> every pattern can fail to match. Plan for it.</p></div>

<div class="iv"><p class="q">"How would you extract IP addresses from CLI output?"</p><p>Use <code>re.search</code> or <code>re.findall</code> with a pattern such as <code>\\d+\\.\\d+\\.\\d+\\.\\d+</code> and mention that real code checks the result is not <code>None</code>. Add that for large jobs you would use a ready-made parser, because it already handles every command's layout.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A regex is a stencil for text.</li>
<li>\\S+ is a word, \\s+ is spaces, \\d+ is digits, \\. is a real dot.</li>
<li>Brackets make a group; group(1), group(2) return the parts.</li>
<li>Use a raw string r"..." for patterns.</li>
<li>Always test if m: before reading a group.</li>
</ul></div>
`,hi:`
<p><b>Regular expression</b> (regex) ek pattern hai jo text ko describe karta hai, taaki script CLI output se kaam ka hissa nikaal sake. Yeh daravna lagta hai kyunki symbols mein likha jaata hai. Yeh chapter <code>show ip interface brief</code> ki ek line leta hai aur pattern teen chhote steps mein banata hai.</p>

<h3>Analogy: stencil</h3>
<p>Aap page par stencil rakhte ho aur sirf kate hue shapes dikhte hain. Pattern text ka stencil hai: "ek word, kuch spaces, phir dots se alag chaar numbers".</p>

<h3>Jo line hum use karenge</h3>
<pre class="out">GigabitEthernet0/1   10.1.1.1   YES manual up   up</pre>
<p>Hume interface ka naam aur uska IP address chahiye.</p>

<h3>Aaj ke paanch symbols</h3>
<table class="cmp">
<tr><th>Symbol</th><th>Matlab</th><th>Hamari line mein match</th></tr>
<tr><td><code>\\S+</code></td><td>ek ya zyada characters jo space <b>nahi</b> hain</td><td><code>GigabitEthernet0/1</code></td></tr>
<tr><td><code>\\s+</code></td><td>ek ya zyada spaces</td><td>columns ke beech ka gap</td></tr>
<tr><td><code>\\d+</code></td><td>ek ya zyada digits</td><td><code>10</code>, <code>1</code></td></tr>
<tr><td><code>\\.</code></td><td>asli dot (akela <code>.</code> ka matlab "koi bhi character")</td><td><code>.</code></td></tr>
<tr><td><code>( )</code></td><td>ek <b>group</b>: yeh hissa yaad rakho</td><td>jo hissa aapko wapas chahiye</td></tr>
</table>
<p>Backslash wale letters shorthand hain: <code>\\s</code> space, <code>\\S</code> space nahi, <code>\\d</code> digit. Unke baad <code>+</code> ka matlab "ek ya zyada".</p>

<h3>Step 1: naam dhoondho</h3>
<pre class="code">import re

line = "GigabitEthernet0/1   10.1.1.1   YES manual up   up"
m = re.search(r"(\\S+)", line)
print(m.group(1))</pre>
<pre class="out">GigabitEthernet0/1</pre>
<p><code>re.search</code> text mein kahin bhi pattern dhoondhta hai. Quotes se pehle ka <code>r</code> use <b>raw string</b> banata hai, taaki Python backslashes ko na chhede. <code>m.group(1)</code> woh deta hai jo pehle brackets ne match kiya.</p>

<h3>Step 2: address jodo</h3>
<pre class="code">m = re.search(r"(\\S+)\\s+(\\d+\\.\\d+\\.\\d+\\.\\d+)", line)
print(m.group(1))
print(m.group(2))</pre>
<pre class="out">GigabitEthernet0/1
10.1.1.1</pre>
<p>Left se right padho: ek word (yaad rakho), spaces, phir digits, dot, digits, dot, digits, dot, digits (yeh yaad rakho). Group 1 naam hai, group 2 address.</p>

<h3>Step 3: jo lines match na karein unhe sambhalo</h3>
<pre class="code">for line in lines:
    m = re.search(r"(\\S+)\\s+(\\d+\\.\\d+\\.\\d+\\.\\d+)", line)
    if m:
        print(m.group(1), m.group(2))</pre>
<p>Kuch match na ho to <code>re.search</code> <code>None</code> deta hai, aur <code>None.group(1)</code> <i>AttributeError</i> se crash hota hai. Header line <code>Interface   IP-Address ...</code> mein IP nahi hota, isliye hamesha pehle <code>if m:</code> check karo.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Pattern ke pieces line par match">
<rect x="15" y="20" width="610" height="36" rx="8" fill="#e2e8f0"/><text x="30" y="43" class="svg-ink" font-size="13">GigabitEthernet0/1   10.1.1.1   YES manual up   up</text>
<rect x="15" y="75" width="170" height="36" rx="8" fill="#bae6fd"/><text x="100" y="98" text-anchor="middle" class="svg-ink" font-size="12">(\\S+)  group 1</text>
<rect x="195" y="75" width="90" height="36" rx="8" fill="#e2e8f0"/><text x="240" y="98" text-anchor="middle" class="svg-ink" font-size="12">\\s+</text>
<rect x="295" y="75" width="260" height="36" rx="8" fill="#bbf7d0"/><text x="425" y="98" text-anchor="middle" class="svg-ink" font-size="12">(\\d+\\.\\d+\\.\\d+\\.\\d+)  group 2</text>
</svg><p class="cap">Pattern ka har piece line ke ek piece ko cover karta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) <code>\\.</code> ki jagah akela dot: yeh koi bhi character match karta hai, to <code>10x1x1x1</code> bhi match ho jaata. (2) Quotes se pehle raw-string <code>r</code> bhoolna. (3) <code>None</code> par <code>.group()</code> use karna. (4) Ek hi baar mein bada pattern likhna. Chhote steps mein banao aur har step ke baad print karo.</p></div>
<div class="exam"><p><b>Interview trap.</b> "Sirf <code>split()</code> kyun nahi?" Saaf, fixed-column line ke liye woh theek aur aasaan hai. Regex tab use karo jab line badalti ho ya aapko ek shape match karna ho, jaise lambe sentence ke andar IP address.</p></div>

<div class="scn"><h4>Header line jisne report crash kar di</h4><p>Ek script ne 200 switches ka <code>show ip interface brief</code> parse kiya aur pehle switch par hi <i>AttributeError: NoneType has no attribute group</i> se ruk gayi. Header line mein IP address nahi hota, isliye pattern ne kuch nahi diya aur script phir bhi group padhne ki koshish karti rahi. <code>if m:</code> jodne se theek ho gaya.</p><p><b>Lesson:</b> har pattern match karne mein fail ho sakta hai. Uski planning karo.</p></div>

<div class="iv"><p class="q">"CLI output se IP addresses kaise nikaloge?"</p><p><code>re.search</code> ya <code>re.findall</code> use karo, <code>\\d+\\.\\d+\\.\\d+\\.\\d+</code> jaise pattern ke saath, aur batao ki real code check karta hai ki result <code>None</code> nahi hai. Yeh bhi jodo ki bade kaam ke liye taiyaar parser use karoge, kyunki woh har command ka layout pehle se sambhalta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Regex text ka stencil hai.</li>
<li>\\S+ word hai, \\s+ spaces, \\d+ digits, \\. asli dot.</li>
<li>Brackets group banate hain; group(1), group(2) hisse wapas dete hain.</li>
<li>Patterns ke liye raw string r"..." use karo.</li>
<li>Group padhne se pehle hamesha if m: check karo.</li>
</ul></div>
`}};export{e as default};