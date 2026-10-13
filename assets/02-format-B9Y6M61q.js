var e={id:`format`,h:{en:`Hex, address format and shortening rules`,hi:`Hex, address format aur shortening rules`},body:{en:`
<p>Think of a long mobile number like 0091-0098-0000-0000-4521. When you save it you drop the extra leading zeros and nobody gets confused. IPv6 has two similar rules for writing its long addresses. Learn them once, practise them with the drills below, and IPv6 addresses stop looking scary.</p>

<h3>Hexadecimal in two minutes</h3>
<p>IPv6 is written in <b>hexadecimal</b> (base 16). Hex uses sixteen symbols: 0 to 9, then <b>a to f</b> for 10 to 15. Each hex digit is exactly <b>4 bits</b>, called a <b>nibble</b>, so converting between hex and binary is simple: replace each digit with its 4-bit pattern.</p>
<table class="cmp"><tr><th>Hex</th><th>Binary</th><th>Hex</th><th>Binary</th><th>Hex</th><th>Binary</th><th>Hex</th><th>Binary</th></tr>
<tr><td>0</td><td>0000</td><td>4</td><td>0100</td><td>8</td><td>1000</td><td>c (12)</td><td>1100</td></tr>
<tr><td>1</td><td>0001</td><td>5</td><td>0101</td><td>9</td><td>1001</td><td>d (13)</td><td>1101</td></tr>
<tr><td>2</td><td>0010</td><td>6</td><td>0110</td><td>a (10)</td><td>1010</td><td>e (14)</td><td>1110</td></tr>
<tr><td>3</td><td>0011</td><td>7</td><td>0111</td><td>b (11)</td><td>1011</td><td>f (15)</td><td>1111</td></tr></table>
<p>Counting in hex matters when you number subnets: after <code>9</code> comes <code>a</code>, after <code>f</code> comes <code>10</code>. So subnet <code>2001:db8:acad:f::/64</code> is followed by <code>2001:db8:acad:10::/64</code>, not by "16".</p>

<h3>The full format: eight hextets</h3>
<p>128 bits divided into 4-bit hex digits gives <b>32 hex digits</b>. They are written in <b>eight groups of four</b>, separated by colons. Each group is 16 bits and is called a <b>hextet</b> (or quartet). Letters are not case-sensitive: Cisco IOS shows uppercase, most other systems and the recommended text form use lowercase.</p>
<pre class="out">2001:0db8:acad:0012:0000:0000:0000:0001
<span class="hl">hextet 1 to 8, 16 bits each = 128 bits</span></pre>

<h3>Rule 1: drop leading zeros in each hextet</h3>
<p>Inside any hextet you may remove zeros at the <b>start</b>. <code>0db8</code> becomes <code>db8</code>, <code>0012</code> becomes <code>12</code>, <code>0000</code> becomes <code>0</code>. You may <b>never</b> remove trailing zeros: <code>a000</code> stays <code>a000</code>, because <code>a</code> would mean <code>000a</code>.</p>

<h3>Rule 2: one double colon for one run of zero hextets</h3>
<p>One continuous run of one or more all-zero hextets can be replaced by <code>::</code>. You may use it <b>only once</b> in an address. If you used it twice, the reader could not know how many zero hextets each <code>::</code> stands for. The recommended text format (RFC 5952) adds three habits: use lowercase, compress the <b>longest</b> run of zeros (if two runs tie, compress the <b>first</b>), and do not use <code>::</code> for a single zero hextet; write <code>:0:</code> instead. IOS still accepts <code>::</code> for a single hextet when you type it.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Shortening steps">
<rect x="20" y="12" width="600" height="36" rx="6" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">2001:0db8:acad:0012:0000:0000:0000:0001</text>
<text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="12">Rule 1: remove leading zeros</text>
<rect x="20" y="74" width="600" height="36" rx="6" fill="#bae6fd"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="14">2001:db8:acad:12:0:0:0:1</text>
<text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="12">Rule 2: replace the longest zero run with ::</text>
<rect x="170" y="134" width="300" height="32" rx="6" fill="#bbf7d0"/><text x="320" y="155" text-anchor="middle" class="svg-accent" font-size="14">2001:db8:acad:12::1</text>
</svg><p class="cap">Always apply rule 1 first, then look for the longest run of zero hextets.</p></div>

<h3>Expanding a short address</h3>
<p>To expand, count the hextets you can see, subtract from eight, and put that many <code>0000</code> hextets where the <code>::</code> is. Then pad every hextet back to four digits.</p>
<div class="eg"><p><b>Worked example.</b> Expand <code>2001:db8:acad:12::1</code>, R1's WAN address in lab 1. Visible hextets: 2001, db8, acad, 12 and 1, which is five. Eight minus five is <b>three</b> missing hextets. Result: <code>2001:0db8:acad:0012:0000:0000:0000:0001</code>. Now expand <code>ff02::1:ff04:4b01</code>: visible hextets ff02, 1, ff04, 4b01 are four, so four zero hextets are missing: <code>ff02:0000:0000:0000:0000:0001:ff04:4b01</code>.</p></div>

<h3>Drills: shorten these (answers on the right)</h3>
<table class="cmp"><tr><th>Full address</th><th>Shortest recommended form</th></tr>
<tr><td>2001:0db8:0000:0000:0000:0000:0000:0001</td><td>2001:db8::1</td></tr>
<tr><td>fe80:0000:0000:0000:0250:7fff:fe06:6d01</td><td>fe80::250:7fff:fe06:6d01</td></tr>
<tr><td>2001:0db8:0000:0001:0000:0000:0000:0100</td><td>2001:db8:0:1::100 (longest run wins)</td></tr>
<tr><td>2001:0db8:0000:0000:0a00:0000:0000:0001</td><td>2001:db8::a00:0:0:1 (tie: first run)</td></tr>
<tr><td>2001:0db8:00ac:0010:0000:0000:0000:0000</td><td>2001:db8:ac:10::</td></tr>
<tr><td>0000:0000:0000:0000:0000:0000:0000:0001</td><td>::1 (loopback)</td></tr>
<tr><td>2001:0db8:1111:0000:2222:0000:3333:4444</td><td>2001:db8:1111:0:2222:0:3333:4444</td></tr></table>
<p>In the last drill, <code>2001:db8:1111::2222:0:3333:4444</code> is also <b>valid</b> (only one <code>::</code>), just not the recommended form.</p>

<div class="warn"><p><b>Common mistakes.</b> Removing trailing zeros (<code>0a00</code> to <code>a</code>), using <code>::</code> twice, and miscounting hextets when expanding. When you type addresses into ACLs or routes, one wrong hextet silently points somewhere else, so read them back slowly.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions show four candidate short forms and ask which is valid or which equals a given address. Eliminate any answer with two <code>::</code>, any answer that dropped trailing zeros, and any answer with the wrong number of hextets. <code>2001:db8::a00::1</code> is always invalid.</p></div>

<div class="scn"><h4>The monitoring tool that saw two different addresses</h4><p>A NOC dashboard kept raising "interface address changed" alarms for a core router every polling cycle. The engineer compared the values: the IPAM system stored <code>2001:db8:0:1::100</code>, while the collector read <code>2001:DB8:0:1:0:0:0:100</code> from the device. The script compared the two as plain text, so they never matched, although they are the same 128-bit number. The fix was to convert every address to the canonical lowercase compressed form before comparing.</p><p><b>Lesson:</b> the same IPv6 address can be written in many ways. Tools and humans must compare the value, or a single canonical form, never raw text.</p></div>

<div class="iv"><p class="q">"Shorten 2001:0db8:0000:0000:0a00:0000:0000:0001 and explain your steps."</p><p>Strong answer: first drop leading zeros in each hextet, giving <code>2001:db8:0:0:a00:0:0:1</code>. There are two zero runs of equal length, so the double colon replaces the first: <code>2001:db8::a00:0:0:1</code>. Explain that <code>::</code> can appear only once, otherwise the address is ambiguous, and that <code>a00</code> keeps its trailing zeros.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One hex digit = 4 bits; an IPv6 address = 32 hex digits = 8 hextets of 16 bits.</li>
<li>Rule 1: remove leading zeros in a hextet, never trailing zeros.</li>
<li>Rule 2: replace one run of zero hextets with <code>::</code>, only once per address.</li>
<li>Recommended form: lowercase, compress the longest run (first on a tie), not a single zero hextet.</li>
<li>To expand, count visible hextets and fill the gap at <code>::</code> with zero hextets.</li>
</ul></div>
`,hi:`
<p>0091-0098-0000-0000-4521 jaisa lamba mobile number socho. Save karte waqt aap faltu leading zeros hata dete ho aur koi confuse nahi hota. IPv6 ke lambe addresses likhne ke liye bhi aise hi do rules hain. Inhe ek baar seekho, neeche ke drills se practice karo, aur IPv6 addresses darawne lagna band ho jayenge.</p>

<h3>Do minute mein hexadecimal</h3>
<p>IPv6 <b>hexadecimal</b> (base 16) mein likha jaata hai. Hex solah symbols use karta hai: 0 se 9, phir 10 se 15 ke liye <b>a se f</b>. Har hex digit bilkul <b>4 bits</b> ka hota hai, jise <b>nibble</b> kehte hain, isliye hex aur binary ke beech convert karna aasaan hai: har digit ko uske 4-bit pattern se badal do.</p>
<table class="cmp"><tr><th>Hex</th><th>Binary</th><th>Hex</th><th>Binary</th><th>Hex</th><th>Binary</th><th>Hex</th><th>Binary</th></tr>
<tr><td>0</td><td>0000</td><td>4</td><td>0100</td><td>8</td><td>1000</td><td>c (12)</td><td>1100</td></tr>
<tr><td>1</td><td>0001</td><td>5</td><td>0101</td><td>9</td><td>1001</td><td>d (13)</td><td>1101</td></tr>
<tr><td>2</td><td>0010</td><td>6</td><td>0110</td><td>a (10)</td><td>1010</td><td>e (14)</td><td>1110</td></tr>
<tr><td>3</td><td>0011</td><td>7</td><td>0111</td><td>b (11)</td><td>1011</td><td>f (15)</td><td>1111</td></tr></table>
<p>Subnets ko number karte waqt hex mein ginti matter karti hai: <code>9</code> ke baad <code>a</code> aata hai, <code>f</code> ke baad <code>10</code>. To subnet <code>2001:db8:acad:f::/64</code> ke baad <code>2001:db8:acad:10::/64</code> aata hai, "16" nahi.</p>

<h3>Full format: aath hextets</h3>
<p>128 bits ko 4-bit hex digits mein baanto to <b>32 hex digits</b> milte hain. Unhe colons se alag karke <b>chaar chaar ke aath groups</b> mein likhte hain. Har group 16 bits ka hota hai aur use <b>hextet</b> (ya quartet) kehte hain. Letters case-sensitive nahi hain: Cisco IOS uppercase dikhata hai, zyada tar doosre systems aur recommended text form lowercase use karte hain.</p>
<pre class="out">2001:0db8:acad:0012:0000:0000:0000:0001
<span class="hl">hextet 1 se 8, har ek 16 bits = 128 bits</span></pre>

<h3>Rule 1: har hextet mein leading zeros hatao</h3>
<p>Kisi bhi hextet ke <b>shuru</b> ke zeros hata sakte ho. <code>0db8</code> ban jaata hai <code>db8</code>, <code>0012</code> ban jaata hai <code>12</code>, <code>0000</code> ban jaata hai <code>0</code>. Trailing zeros <b>kabhi nahi</b> hata sakte: <code>a000</code> <code>a000</code> hi rehta hai, kyunki <code>a</code> ka matlab hoga <code>000a</code>.</p>

<h3>Rule 2: zero hextets ke ek run ke liye ek double colon</h3>
<p>Ek ya zyada all-zero hextets ka ek lagatar run <code>::</code> se replace ho sakta hai. Ise address mein <b>sirf ek baar</b> use kar sakte ho. Do baar use kiya to padhne wala nahi jaan paayega ki har <code>::</code> kitne zero hextets ki jagah hai. Recommended text format (RFC 5952) teen aadatein jodta hai: lowercase use karo, zeros ka <b>sabse lamba</b> run compress karo (do runs barabar hon to <b>pehla</b>), aur ek akele zero hextet ke liye <code>::</code> mat use karo; uski jagah <code>:0:</code> likho. Type karte waqt IOS ek hextet ke liye bhi <code>::</code> accept kar leta hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Shortening ke steps">
<rect x="20" y="12" width="600" height="36" rx="6" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">2001:0db8:acad:0012:0000:0000:0000:0001</text>
<text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="12">Rule 1: leading zeros hatao</text>
<rect x="20" y="74" width="600" height="36" rx="6" fill="#bae6fd"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="14">2001:db8:acad:12:0:0:0:1</text>
<text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="12">Rule 2: sabse lamba zero run :: se badlo</text>
<rect x="170" y="134" width="300" height="32" rx="6" fill="#bbf7d0"/><text x="320" y="155" text-anchor="middle" class="svg-accent" font-size="14">2001:db8:acad:12::1</text>
</svg><p class="cap">Hamesha pehle rule 1 lagao, phir zero hextets ka sabse lamba run dhoondho.</p></div>

<h3>Chhote address ko expand karna</h3>
<p>Expand karne ke liye dikhne wale hextets gino, aath mein se ghatao, aur utne <code>0000</code> hextets <code>::</code> ki jagah rakho. Phir har hextet ko wapas chaar digits tak pad karo.</p>
<div class="eg"><p><b>Worked example.</b> <code>2001:db8:acad:12::1</code> expand karo, jo lab 1 mein R1 ka WAN address hai. Dikhne wale hextets: 2001, db8, acad, 12 aur 1, yaani paanch. Aath minus paanch = <b>teen</b> missing hextets. Result: <code>2001:0db8:acad:0012:0000:0000:0000:0001</code>. Ab <code>ff02::1:ff04:4b01</code> expand karo: dikhne wale hextets ff02, 1, ff04, 4b01 chaar hain, to chaar zero hextets missing hain: <code>ff02:0000:0000:0000:0000:0001:ff04:4b01</code>.</p></div>

<h3>Drills: inhe chhota karo (answers right side mein)</h3>
<table class="cmp"><tr><th>Full address</th><th>Sabse chhota recommended form</th></tr>
<tr><td>2001:0db8:0000:0000:0000:0000:0000:0001</td><td>2001:db8::1</td></tr>
<tr><td>fe80:0000:0000:0000:0250:7fff:fe06:6d01</td><td>fe80::250:7fff:fe06:6d01</td></tr>
<tr><td>2001:0db8:0000:0001:0000:0000:0000:0100</td><td>2001:db8:0:1::100 (lamba run jeetta hai)</td></tr>
<tr><td>2001:0db8:0000:0000:0a00:0000:0000:0001</td><td>2001:db8::a00:0:0:1 (tie: pehla run)</td></tr>
<tr><td>2001:0db8:00ac:0010:0000:0000:0000:0000</td><td>2001:db8:ac:10::</td></tr>
<tr><td>0000:0000:0000:0000:0000:0000:0000:0001</td><td>::1 (loopback)</td></tr>
<tr><td>2001:0db8:1111:0000:2222:0000:3333:4444</td><td>2001:db8:1111:0:2222:0:3333:4444</td></tr></table>
<p>Aakhri drill mein <code>2001:db8:1111::2222:0:3333:4444</code> bhi <b>valid</b> hai (sirf ek <code>::</code>), bas recommended form nahi hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Trailing zeros hata dena (<code>0a00</code> se <code>a</code>), <code>::</code> do baar use karna, aur expand karte waqt hextets galat ginna. Jab aap ACLs ya routes mein addresses type karte ho, ek galat hextet chupchap kahin aur point karta hai, isliye unhe dheere se wapas padho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions chaar short forms dikhate hain aur poochte hain kaunsa valid hai ya kaunsa diye gaye address ke barabar hai. Do <code>::</code> wala answer, trailing zeros hatane wala answer, aur galat number of hextets wala answer hatao. <code>2001:db8::a00::1</code> hamesha invalid hai.</p></div>

<div class="scn"><h4>Monitoring tool jise do alag addresses dikhe</h4><p>Ek NOC dashboard har polling cycle mein core router ke liye "interface address changed" alarm raise kar raha tha. Engineer ne values compare kin: IPAM system ne <code>2001:db8:0:1::100</code> store kiya tha, jabki collector device se <code>2001:DB8:0:1:0:0:0:100</code> padh raha tha. Script dono ko plain text ki tarah compare karti thi, isliye woh kabhi match nahi hote the, jabki dono same 128-bit number hain. Fix tha compare karne se pehle har address ko canonical lowercase compressed form mein convert karna.</p><p><b>Seekh:</b> same IPv6 address kai tarike se likha ja sakta hai. Tools aur insaan value ko, ya ek canonical form ko compare karein, raw text ko kabhi nahi.</p></div>

<div class="iv"><p class="q">"2001:0db8:0000:0000:0a00:0000:0000:0001 ko chhota karo aur steps samjhao."</p><p>Strong answer: pehle har hextet mein leading zeros hatao, jisse <code>2001:db8:0:0:a00:0:0:1</code> milta hai. Barabar length ke do zero runs hain, isliye double colon pehle wale ko replace karta hai: <code>2001:db8::a00:0:0:1</code>. Samjhao ki <code>::</code> sirf ek baar aa sakta hai, warna address ambiguous ho jaata hai, aur <code>a00</code> apne trailing zeros rakhta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek hex digit = 4 bits; ek IPv6 address = 32 hex digits = 16 bits ke 8 hextets.</li>
<li>Rule 1: hextet mein leading zeros hatao, trailing zeros kabhi nahi.</li>
<li>Rule 2: zero hextets ke ek run ko <code>::</code> se badlo, har address mein sirf ek baar.</li>
<li>Recommended form: lowercase, sabse lamba run compress karo (tie par pehla), akela zero hextet nahi.</li>
<li>Expand karne ke liye dikhne wale hextets gino aur <code>::</code> wale gap ko zero hextets se bharo.</li>
</ul></div>
`}};export{e as default};