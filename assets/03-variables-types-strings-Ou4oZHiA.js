var e={id:`variables-types-strings`,h:{en:`Variables, data types and strings`,hi:`Variables, data types aur strings`},body:{en:`
<p>Think of a warehouse full of boxes. Each box holds something (a hostname, a VLAN number, a temperature reading) and has a <b>label</b> stuck on it so you can find it again. In Python the box is a <b>value</b> and the label is a <b>variable</b>. The <b>type</b> says what kind of thing is inside, and that decides what you can do with it: you can add two numbers, but you cannot add a number to a word.</p>

<h3>Variables: names for values</h3>
<p>You create a variable with a single equals sign, the <b>assignment operator</b>. Read <code>vlan = 10</code> as "let the name vlan refer to the value 10". You can reassign it later; the name simply points to the new value.</p>
<pre class="code">hostname = "R1"          <span class="c"># the name hostname now refers to the text R1</span>
vlan = 10
vlan = vlan + 10         <span class="c"># right side first: 10 + 10, then vlan refers to 20</span>
mgmt_ip = "10.99.0.1"</pre>
<p>Naming rules: letters, digits and underscores only; not starting with a digit; no hyphens or spaces; case-sensitive. Python style is <b>snake_case</b>: <code>mgmt_ip</code>, <code>up_count</code>. A name written in capitals such as <code>ROUTERS</code> is a convention for a <b>constant</b>, a value the script does not change.</p>

<h3>The basic data types</h3>
<table class="cmp"><tr><th>Type</th><th>Meaning</th><th>Examples</th></tr>
<tr><td><code>str</code></td><td>String: text, in single or double quotes</td><td><code>"R1"</code>, <code>'Gi0/1'</code>, <code>"10.99.0.1"</code></td></tr>
<tr><td><code>int</code></td><td>Integer: whole number</td><td><code>10</code>, <code>4094</code>, <code>-1</code></td></tr>
<tr><td><code>float</code></td><td>Number with a decimal point</td><td><code>99.95</code>, <code>1.0</code></td></tr>
<tr><td><code>bool</code></td><td>Boolean: exactly <code>True</code> or <code>False</code> (capital first letter)</td><td><code>enabled = True</code></td></tr>
<tr><td><code>NoneType</code></td><td>The single value <code>None</code>, meaning "nothing here"</td><td><code>description = None</code></td></tr>
</table>
<p>An IP address such as <code>"10.99.0.1"</code> is a <b>string</b>, not a number: it has three dots. <code>type()</code> tells you the type of anything:</p>
<pre class="out">&gt;&gt;&gt; type("10")
&lt;class 'str'&gt;
&gt;&gt;&gt; type(10)
&lt;class 'int'&gt;
&gt;&gt;&gt; "10" == 10
<span class="hl">False</span></pre>

<h3>Arithmetic and conversion</h3>
<p><code>+ - *</code> work as expected. <code>/</code> always returns a float (<code>10 / 2</code> is <code>5.0</code>). <code>//</code> is whole-number division that drops the remainder, <code>%</code> (modulo) gives the remainder, and <code>**</code> is the power. To change a type, call the type as a function: <code>int("10")</code> gives 10, <code>str(10)</code> gives "10", <code>float("2.5")</code> gives 2.5.</p>
<p>The <code>+</code> sign means different things for different types: numbers are added, strings are <b>joined</b> (concatenated). Mixing them is an error:</p>
<pre class="out">&gt;&gt;&gt; "10" + "5"
'105'
&gt;&gt;&gt; 10 + 5
15
&gt;&gt;&gt; "vlan " + 10
<span class="hl">TypeError: can only concatenate str (not "int") to str</span>
&gt;&gt;&gt; "vlan " + str(10)
'vlan 10'</pre>

<h3>Strings in depth</h3>
<p>A string is an ordered sequence of characters. Each character has a position called an <b>index</b>, starting at <b>0</b>. Negative indexes count from the end: <code>-1</code> is the last character. A <b>slice</b> <code>s[start:end]</code> takes characters from start up to, but <b>not including</b>, end.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="String indexes">
<rect x="110" y="45" width="60" height="44" fill="#bae6fd" stroke="#64748b"/><text x="140" y="73" text-anchor="middle" class="svg-ink" font-size="14">R</text>
<rect x="170" y="45" width="60" height="44" fill="#bae6fd" stroke="#64748b"/><text x="200" y="73" text-anchor="middle" class="svg-ink" font-size="14">1</text>
<rect x="230" y="45" width="60" height="44" fill="#e2e8f0" stroke="#64748b"/><text x="260" y="73" text-anchor="middle" class="svg-ink" font-size="14">-</text>
<rect x="290" y="45" width="60" height="44" fill="#bbf7d0" stroke="#64748b"/><text x="320" y="73" text-anchor="middle" class="svg-ink" font-size="14">C</text>
<rect x="350" y="45" width="60" height="44" fill="#bbf7d0" stroke="#64748b"/><text x="380" y="73" text-anchor="middle" class="svg-ink" font-size="14">O</text>
<rect x="410" y="45" width="60" height="44" fill="#bbf7d0" stroke="#64748b"/><text x="440" y="73" text-anchor="middle" class="svg-ink" font-size="14">R</text>
<rect x="470" y="45" width="60" height="44" fill="#bbf7d0" stroke="#64748b"/><text x="500" y="73" text-anchor="middle" class="svg-ink" font-size="14">E</text>
<text x="60" y="32" class="svg-muted" font-size="12">index</text>
<text x="140" y="32" text-anchor="middle" class="svg-accent" font-size="13">0</text><text x="200" y="32" text-anchor="middle" class="svg-accent" font-size="13">1</text><text x="260" y="32" text-anchor="middle" class="svg-accent" font-size="13">2</text><text x="320" y="32" text-anchor="middle" class="svg-accent" font-size="13">3</text><text x="380" y="32" text-anchor="middle" class="svg-accent" font-size="13">4</text><text x="440" y="32" text-anchor="middle" class="svg-accent" font-size="13">5</text><text x="500" y="32" text-anchor="middle" class="svg-accent" font-size="13">6</text>
<text x="40" y="112" class="svg-muted" font-size="12">negative</text>
<text x="140" y="112" text-anchor="middle" class="svg-accent" font-size="13">-7</text><text x="200" y="112" text-anchor="middle" class="svg-accent" font-size="13">-6</text><text x="260" y="112" text-anchor="middle" class="svg-accent" font-size="13">-5</text><text x="320" y="112" text-anchor="middle" class="svg-accent" font-size="13">-4</text><text x="380" y="112" text-anchor="middle" class="svg-accent" font-size="13">-3</text><text x="440" y="112" text-anchor="middle" class="svg-accent" font-size="13">-2</text><text x="500" y="112" text-anchor="middle" class="svg-accent" font-size="13">-1</text>
<text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="12">name[0:2] is "R1", name[3:] is "CORE", name[-1] is "E"</text>
</svg><p class="cap">Indexes start at 0; the end of a slice is not included.</p></div>
<p>Useful string <b>methods</b> (functions attached to a value, called with a dot):</p>
<ul>
<li><code>.strip()</code> removes spaces and newlines at both ends; <code>.lower()</code> and <code>.upper()</code> change case.</li>
<li><code>.split()</code> cuts a string into a list of words; <code>.split(".")</code> cuts at dots. <code>"-".join(items)</code> does the reverse.</li>
<li><code>.startswith("Gi")</code>, <code>.endswith("/1")</code> return True or False; <code>"up" in line</code> tests whether text appears anywhere.</li>
<li><code>.replace("GigabitEthernet", "Gi")</code> returns a new string; strings never change in place (they are <b>immutable</b>).</li>
<li><code>len(s)</code> gives the number of characters.</li>
</ul>

<h3>Building text: concatenation, format() and f-strings</h3>
<p>Scripts constantly build configuration lines from variables. Three ways give the same result. <b>Concatenation</b> joins pieces with <code>+</code> and needs <code>str()</code> for numbers. <b>str.format()</b> puts values into curly-brace placeholders. An <b>f-string</b> (Python 3.6 and later) is a string with the letter <b>f</b> before the opening quote; inside it you write the variable name directly between the curly braces, and Python replaces it with the value. So an f-string made from the word vlan, a space and the name vid in braces produces <code>vlan 10</code> when vid is 10. Most modern scripts, including the lab scripts, use f-strings. Here we use <code>.format()</code>, which accepts exactly the same format codes.</p>
<pre class="code">vid = 10
name = "SALES"
print("vlan " + str(vid))                      <span class="c"># vlan 10</span>
print("vlan {} name {}".format(vid, name))     <span class="c"># vlan 10 name SALES</span>
print("{:&lt;12}|{:&gt;5}|".format("Gi0/1", vid))    <span class="c"># left-align in 12, right-align in 5</span>
print("{:.2f} %".format(97.456))               <span class="c"># two decimals</span></pre>
<pre class="out">vlan 10
vlan 10 name SALES
<span class="hl">Gi0/1       |   10|</span>
97.46 %</pre>
<p>Format codes after the colon: <code>&lt;</code> left-align, <code>&gt;</code> right-align, <code>^</code> centre, a number for the width, <code>.2f</code> for two decimal places.</p>

<div class="eg"><p><b>Worked example.</b> <code>intf = "GigabitEthernet0/1"</code>. <code>len(intf)</code> is 18. <code>intf[:2]</code> is <code>"Gi"</code>. <code>intf[-3:]</code> is <code>"0/1"</code>. <code>intf.replace("GigabitEthernet", "Gi")</code> is <code>"Gi0/1"</code>, but <code>intf</code> itself is still the long name. <code>"10.99.0.1".split(".")</code> is <code>['10', '99', '0', '1']</code>: four <b>strings</b>, so you need <code>int()</code> before any maths.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using <code>=</code> (assign) where you meant <code>==</code> (compare); comparing a string with a number (<code>"10" == 10</code> is False, so a VLAN check silently fails); forgetting that text read from files, the CLI or <code>input()</code> is always a string.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>7 / 2</code> is 3.5, <code>7 // 2</code> is 3 and <code>7 % 2</code> is 1. A slice's end index is excluded, so <code>"R1-CORE"[0:2]</code> is "R1", not "R1-". And <code>True</code>, <code>False</code> and <code>None</code> must be capitalised; <code>true</code> is a NameError in Python (it is the JSON spelling).</p></div>

<div class="scn"><h4>Every VLAN reported missing</h4><p>An audit script read the expected VLANs from a CSV file and the actual VLANs from the switch, and reported that every single VLAN was missing on all 40 switches. Nothing was actually wrong on the network. The expected list held strings (<code>"10"</code>, <code>"20"</code>) because everything read from a file is text, while the switch data had been converted to integers. <code>"10" == 10</code> is False, so nothing matched. Converting with <code>int()</code> when reading the file fixed the report.</p><p><b>Lesson:</b> when a comparison "never matches", print <code>type()</code> of both sides before blaming the network.</p></div>

<div class="iv"><p class="q">"What data types does Python have, and why do they matter when you parse CLI output?"</p><p>Strong answer: str, int, float, bool and None, plus the collections list, tuple, dict and set. Everything a script reads from the CLI or a file arrives as a string, so numbers such as VLAN IDs, counters or MTU must be converted with <code>int()</code> before comparing or doing maths, and IP addresses stay strings (or become <code>ipaddress</code> objects). Give the <code>"10" == 10</code> example.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>=</code> assigns a name to a value; <code>==</code> compares. Names are snake_case and case-sensitive.</li>
<li>Basic types: str, int, float, bool (True/False), None. <code>type()</code> shows the type.</li>
<li>Text from files and the CLI is always str; convert with <code>int()</code>, <code>float()</code>, <code>str()</code>.</li>
<li>Index from 0, negative from the end, slice end excluded; strings are immutable.</li>
<li>Build text with <code>+</code>, <code>.format()</code> or f-strings; format codes <code>&lt;</code>, <code>&gt;</code>, width and <code>.2f</code>.</li>
</ul></div>
`,hi:`
<p>Boxes se bhara ek warehouse socho. Har box mein kuch hai (ek hostname, ek VLAN number, ek temperature reading) aur us par ek <b>label</b> chipka hai taaki aap use dobara dhoondh sako. Python mein box ek <b>value</b> hai aur label ek <b>variable</b>. <b>Type</b> batata hai andar kis tarah ki cheez hai, aur wahi decide karta hai ki aap uske saath kya kar sakte ho: do numbers jod sakte ho, par number ko ek shabd se nahi jod sakte.</p>

<h3>Variables: values ke naam</h3>
<p>Variable ek single equals sign se banta hai, jise <b>assignment operator</b> kehte hain. <code>vlan = 10</code> ko aise padho "naam vlan ko value 10 ki taraf point karne do". Baad mein aap ise reassign kar sakte ho; naam bas nayi value ki taraf point karne lagta hai.</p>
<pre class="code">hostname = "R1"          <span class="c"># naam hostname ab text R1 ko refer karta hai</span>
vlan = 10
vlan = vlan + 10         <span class="c"># pehle right side: 10 + 10, phir vlan 20 ko refer karta hai</span>
mgmt_ip = "10.99.0.1"</pre>
<p>Naming rules: sirf letters, digits aur underscores; digit se shuru nahi; hyphens ya spaces nahi; case-sensitive. Python style <b>snake_case</b> hai: <code>mgmt_ip</code>, <code>up_count</code>. Capitals mein likha naam jaise <code>ROUTERS</code> ek <b>constant</b> ka convention hai, aisi value jo script nahi badalta.</p>

<h3>Basic data types</h3>
<table class="cmp"><tr><th>Type</th><th>Matlab</th><th>Examples</th></tr>
<tr><td><code>str</code></td><td>String: text, single ya double quotes mein</td><td><code>"R1"</code>, <code>'Gi0/1'</code>, <code>"10.99.0.1"</code></td></tr>
<tr><td><code>int</code></td><td>Integer: poora number</td><td><code>10</code>, <code>4094</code>, <code>-1</code></td></tr>
<tr><td><code>float</code></td><td>Decimal point wala number</td><td><code>99.95</code>, <code>1.0</code></td></tr>
<tr><td><code>bool</code></td><td>Boolean: sirf <code>True</code> ya <code>False</code> (pehla letter capital)</td><td><code>enabled = True</code></td></tr>
<tr><td><code>NoneType</code></td><td>Akeli value <code>None</code>, matlab "yahan kuch nahi"</td><td><code>description = None</code></td></tr>
</table>
<p><code>"10.99.0.1"</code> jaisa IP address <b>string</b> hai, number nahi: usme teen dots hain. <code>type()</code> kisi bhi cheez ka type batata hai:</p>
<pre class="out">&gt;&gt;&gt; type("10")
&lt;class 'str'&gt;
&gt;&gt;&gt; type(10)
&lt;class 'int'&gt;
&gt;&gt;&gt; "10" == 10
<span class="hl">False</span></pre>

<h3>Arithmetic aur conversion</h3>
<p><code>+ - *</code> expected tarah kaam karte hain. <code>/</code> hamesha float deta hai (<code>10 / 2</code> <code>5.0</code> hai). <code>//</code> poore number ka division hai jo remainder chhod deta hai, <code>%</code> (modulo) remainder deta hai, aur <code>**</code> power hai. Type badalne ke liye type ko function ki tarah call karo: <code>int("10")</code> 10 deta hai, <code>str(10)</code> "10" deta hai, <code>float("2.5")</code> 2.5 deta hai.</p>
<p><code>+</code> sign alag types ke liye alag matlab rakhta hai: numbers jud jaate hain, strings <b>aapas mein chipak</b> jaati hain (concatenate). Dono ko mix karna error hai:</p>
<pre class="out">&gt;&gt;&gt; "10" + "5"
'105'
&gt;&gt;&gt; 10 + 5
15
&gt;&gt;&gt; "vlan " + 10
<span class="hl">TypeError: can only concatenate str (not "int") to str</span>
&gt;&gt;&gt; "vlan " + str(10)
'vlan 10'</pre>

<h3>Strings gehraai se</h3>
<p>String characters ka ordered sequence hai. Har character ki ek position hoti hai jise <b>index</b> kehte hain, jo <b>0</b> se shuru hota hai. Negative indexes end se ginte hain: <code>-1</code> aakhri character hai. <b>Slice</b> <code>s[start:end]</code> start se lekar end tak characters leta hai, par end ko <b>shaamil nahi</b> karta.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="String indexes">
<rect x="110" y="45" width="60" height="44" fill="#bae6fd" stroke="#64748b"/><text x="140" y="73" text-anchor="middle" class="svg-ink" font-size="14">R</text>
<rect x="170" y="45" width="60" height="44" fill="#bae6fd" stroke="#64748b"/><text x="200" y="73" text-anchor="middle" class="svg-ink" font-size="14">1</text>
<rect x="230" y="45" width="60" height="44" fill="#e2e8f0" stroke="#64748b"/><text x="260" y="73" text-anchor="middle" class="svg-ink" font-size="14">-</text>
<rect x="290" y="45" width="60" height="44" fill="#bbf7d0" stroke="#64748b"/><text x="320" y="73" text-anchor="middle" class="svg-ink" font-size="14">C</text>
<rect x="350" y="45" width="60" height="44" fill="#bbf7d0" stroke="#64748b"/><text x="380" y="73" text-anchor="middle" class="svg-ink" font-size="14">O</text>
<rect x="410" y="45" width="60" height="44" fill="#bbf7d0" stroke="#64748b"/><text x="440" y="73" text-anchor="middle" class="svg-ink" font-size="14">R</text>
<rect x="470" y="45" width="60" height="44" fill="#bbf7d0" stroke="#64748b"/><text x="500" y="73" text-anchor="middle" class="svg-ink" font-size="14">E</text>
<text x="60" y="32" class="svg-muted" font-size="12">index</text>
<text x="140" y="32" text-anchor="middle" class="svg-accent" font-size="13">0</text><text x="200" y="32" text-anchor="middle" class="svg-accent" font-size="13">1</text><text x="260" y="32" text-anchor="middle" class="svg-accent" font-size="13">2</text><text x="320" y="32" text-anchor="middle" class="svg-accent" font-size="13">3</text><text x="380" y="32" text-anchor="middle" class="svg-accent" font-size="13">4</text><text x="440" y="32" text-anchor="middle" class="svg-accent" font-size="13">5</text><text x="500" y="32" text-anchor="middle" class="svg-accent" font-size="13">6</text>
<text x="40" y="112" class="svg-muted" font-size="12">negative</text>
<text x="140" y="112" text-anchor="middle" class="svg-accent" font-size="13">-7</text><text x="200" y="112" text-anchor="middle" class="svg-accent" font-size="13">-6</text><text x="260" y="112" text-anchor="middle" class="svg-accent" font-size="13">-5</text><text x="320" y="112" text-anchor="middle" class="svg-accent" font-size="13">-4</text><text x="380" y="112" text-anchor="middle" class="svg-accent" font-size="13">-3</text><text x="440" y="112" text-anchor="middle" class="svg-accent" font-size="13">-2</text><text x="500" y="112" text-anchor="middle" class="svg-accent" font-size="13">-1</text>
<text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="12">name[0:2] = "R1", name[3:] = "CORE", name[-1] = "E"</text>
</svg><p class="cap">Indexes 0 se shuru hote hain; slice ka end shaamil nahi hota.</p></div>
<p>Kaam ke string <b>methods</b> (value se jude functions, dot se call hote hain):</p>
<ul>
<li><code>.strip()</code> dono ends se spaces aur newlines hataata hai; <code>.lower()</code> aur <code>.upper()</code> case badalte hain.</li>
<li><code>.split()</code> string ko shabdon ki list mein kaat-ta hai; <code>.split(".")</code> dots par kaat-ta hai. <code>"-".join(items)</code> ulta kaam karta hai.</li>
<li><code>.startswith("Gi")</code>, <code>.endswith("/1")</code> True ya False dete hain; <code>"up" in line</code> test karta hai ki text kahin bhi hai ya nahi.</li>
<li><code>.replace("GigabitEthernet", "Gi")</code> nayi string return karta hai; strings apni jagah kabhi nahi badalti (woh <b>immutable</b> hain).</li>
<li><code>len(s)</code> characters ki ginti deta hai.</li>
</ul>

<h3>Text banana: concatenation, format() aur f-strings</h3>
<p>Scripts lagatar variables se configuration lines banate hain. Teen tarike same result dete hain. <b>Concatenation</b> <code>+</code> se tukde jodta hai aur numbers ke liye <code>str()</code> chahiye. <b>str.format()</b> values ko curly-brace placeholders mein daalta hai. <b>f-string</b> (Python 3.6 aur baad) woh string hai jiske opening quote se pehle letter <b>f</b> hota hai; uske andar aap variable ka naam seedha curly braces ke beech likhte ho, aur Python use value se badal deta hai. To shabd vlan, ek space aur braces mein naam vid se bani f-string <code>vlan 10</code> banati hai jab vid 10 ho. Zyada tar modern scripts, lab scripts samet, f-strings use karte hain. Yahan hum <code>.format()</code> use karte hain, jo bilkul same format codes leta hai.</p>
<pre class="code">vid = 10
name = "SALES"
print("vlan " + str(vid))                      <span class="c"># vlan 10</span>
print("vlan {} name {}".format(vid, name))     <span class="c"># vlan 10 name SALES</span>
print("{:&lt;12}|{:&gt;5}|".format("Gi0/1", vid))    <span class="c"># 12 mein left-align, 5 mein right-align</span>
print("{:.2f} %".format(97.456))               <span class="c"># do decimal</span></pre>
<pre class="out">vlan 10
vlan 10 name SALES
<span class="hl">Gi0/1       |   10|</span>
97.46 %</pre>
<p>Colon ke baad format codes: <code>&lt;</code> left-align, <code>&gt;</code> right-align, <code>^</code> centre, width ke liye number, do decimal places ke liye <code>.2f</code>.</p>

<div class="eg"><p><b>Worked example.</b> <code>intf = "GigabitEthernet0/1"</code>. <code>len(intf)</code> 18 hai. <code>intf[:2]</code> <code>"Gi"</code> hai. <code>intf[-3:]</code> <code>"0/1"</code> hai. <code>intf.replace("GigabitEthernet", "Gi")</code> <code>"Gi0/1"</code> hai, par <code>intf</code> khud abhi bhi lamba naam hai. <code>"10.99.0.1".split(".")</code> <code>['10', '99', '0', '1']</code> hai: chaar <b>strings</b>, isliye kisi bhi maths se pehle <code>int()</code> chahiye.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Jahan <code>==</code> (compare) chahiye wahan <code>=</code> (assign) likhna; string ko number se compare karna (<code>"10" == 10</code> False hai, isliye VLAN check chupchaap fail hota hai); bhool jaana ki files, CLI ya <code>input()</code> se padha text hamesha string hota hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>7 / 2</code> 3.5 hai, <code>7 // 2</code> 3 hai aur <code>7 % 2</code> 1 hai. Slice ka end index shaamil nahi hota, isliye <code>"R1-CORE"[0:2]</code> "R1" hai, "R1-" nahi. Aur <code>True</code>, <code>False</code> aur <code>None</code> capital hone chahiye; Python mein <code>true</code> NameError hai (woh JSON ki spelling hai).</p></div>

<div class="scn"><h4>Har VLAN missing report hua</h4><p>Ek audit script expected VLANs CSV file se aur actual VLANs switch se padhta tha, aur usne report kiya ki saare 40 switches par har ek VLAN missing hai. Network par asal mein kuch galat nahi tha. Expected list mein strings thi (<code>"10"</code>, <code>"20"</code>) kyunki file se padha sab kuch text hota hai, jabki switch ka data integers mein convert ho chuka tha. <code>"10" == 10</code> False hai, isliye kuch match nahi hua. File padhte waqt <code>int()</code> se convert karne par report theek ho gayi.</p><p><b>Seekh:</b> jab comparison "kabhi match nahi karta", network ko blame karne se pehle dono sides ka <code>type()</code> print karo.</p></div>

<div class="iv"><p class="q">"Python mein kaunse data types hain, aur CLI output parse karte waqt woh kyun matter karte hain?"</p><p>Strong answer: str, int, float, bool aur None, plus collections list, tuple, dict aur set. Script CLI ya file se jo kuch padhta hai woh string ki tarah aata hai, isliye VLAN IDs, counters ya MTU jaise numbers ko compare ya maths se pehle <code>int()</code> se convert karna padta hai, aur IP addresses strings rehte hain (ya <code>ipaddress</code> objects bante hain). <code>"10" == 10</code> ka example do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>=</code> value ko naam deta hai; <code>==</code> compare karta hai. Naam snake_case aur case-sensitive hain.</li>
<li>Basic types: str, int, float, bool (True/False), None. <code>type()</code> type dikhata hai.</li>
<li>Files aur CLI ka text hamesha str hota hai; <code>int()</code>, <code>float()</code>, <code>str()</code> se convert karo.</li>
<li>Index 0 se, negative end se, slice ka end shaamil nahi; strings immutable hain.</li>
<li>Text <code>+</code>, <code>.format()</code> ya f-strings se banao; format codes <code>&lt;</code>, <code>&gt;</code>, width aur <code>.2f</code>.</li>
</ul></div>
`}};export{e as default};