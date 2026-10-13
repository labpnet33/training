var e={id:`split-limits`,h:{en:`Where split() breaks: ragged columns and a safer way`,hi:`Jahan split() toot jaata hai: ragged columns aur surakshit tareeka`},body:{en:`
<p><code>split()</code> is wonderful for tidy tables. This chapter shows exactly where it breaks, so you can recognise the danger early and choose a safer method.</p>
<h3>The trap: a column with two words</h3>
<p>Look again at the rows of <code>show ip interface brief</code>. Most rows have six words, but the row of an interface that is <b>administratively down</b> has seven, because the status is the two-word phrase <code>administratively down</code>. If your script counts positions from the left, the columns shift.</p>
<pre class="code">rows = [
    "GigabitEthernet0/1     10.12.0.1       YES manual up                    up",
    "GigabitEthernet0/3     unassigned      YES unset  administratively down down",
]
for row in rows:
    parts = row.split()
    print(len(parts), "words | status =", parts[4], "| protocol =", parts[5])</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">6 words | status = up | protocol = up
7 words | status = administratively | protocol = down</pre>
<p>For the first row everything looks right. For the second, <code>parts[4]</code> is <code>administratively</code> and <code>parts[5]</code> is <code>down</code>, so a script that reads the fixed positions 4 and 5 reports a nonsense status, and it does so <b>without any error</b>. Silent wrong data is the dangerous kind.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Why position counting breaks"><rect x="20" y="30" width="181" height="70" rx="10" fill="#bae6fd"/><text x="110" y="60" text-anchor="middle" class="svg-ink" font-size="14">Row A</text><text x="110" y="82" text-anchor="middle" class="svg-muted" font-size="12">6 words: status at index 4</text><line x1="203" y1="65" x2="223" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="223,60 229,65 223,70" fill="#64748b"/><rect x="229" y="30" width="181" height="70" rx="10" fill="#bbf7d0"/><text x="319" y="60" text-anchor="middle" class="svg-ink" font-size="14">Row B</text><text x="319" y="82" text-anchor="middle" class="svg-muted" font-size="12">7 words: status at index 4 and 5</text><line x1="412" y1="65" x2="432" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="432,60 438,65 432,70" fill="#64748b"/><rect x="438" y="30" width="181" height="70" rx="10" fill="#fde68a"/><text x="528" y="60" text-anchor="middle" class="svg-ink" font-size="14">Result</text><text x="528" y="82" text-anchor="middle" class="svg-muted" font-size="12">columns shift, no error</text></svg><p class="cap">Why position counting breaks</p></div>
<h3>Fix 1: count from the end for the last column</h3>
<p>The protocol is always the <b>last</b> word, so <code>parts[-1]</code> stays correct for both rows. That is exactly why the lab filter <code>parts[-1] == "up"</code> works. Counting from the end is safe for the last column, but not for the middle ones.</p>
<h3>Fix 2: split in a limited number of places</h3>
<p><code>line.split(None, 4)</code> cuts at the first 4 gaps only and leaves the remainder as one piece. Then <code>rsplit(None, 1)</code> cuts one word from the <b>right</b>. Together they treat the two-word status as a single field.</p>
<pre class="code">rows = [
    "GigabitEthernet0/1     10.12.0.1       YES manual up                    up",
    "GigabitEthernet0/3     unassigned      YES unset  administratively down down",
]
for row in rows:
    name, ip, ok, method, rest = row.split(None, 4)
    status, protocol = rest.rsplit(None, 1)
    print(name, "|", ip, "|", status, "|", protocol)</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">GigabitEthernet0/1 | 10.12.0.1 | up | up
GigabitEthernet0/3 | unassigned | administratively down | down</pre>
<p>Now both rows give the right status, including <code>administratively down</code>. This works, but you can see the price: the code is harder to read, and it still depends on the exact number of columns.</p>
<h3>Fix 3: cut at a label instead of a position</h3>
<p>For lines such as <code>BLR-CORE uptime is 0 minutes</code>, the better anchor is the <b>words that never change</b>. <code>split("separator")</code> accepts a multi-character separator.</p>
<pre class="code">line = "BLR-CORE uptime is 0 minutes"
host, uptime = line.split(" uptime is ")
print(host)
print(uptime)

board = "Processor board ID NK3C15U4X00"
print(board.split()[-1])

image = 'System image file is "flash:nkos-router-universal.2.0.bin"'
print(image.split('"')[1])</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">BLR-CORE
0 minutes
NK3C15U4X00
flash:nkos-router-universal.2.0.bin</pre>
<p>Three useful moves are shown: cut at a phrase, take the last word, and take the text between quotes (<code>split('"')[1]</code> is the second piece, the one inside the quotes). Anchoring on a label survives column changes better than counting positions.</p>
<h3>Choosing the right line first</h3>
<p>Most of the output is not data you want. Select the line <b>before</b> splitting it, using <code>in</code>, <code>startswith</code> or a loop with <code>if</code>.</p>
<pre class="code">show_version = """Network Kings Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE
ROM: NK-OS Bootstrap, Version 2.0, RELEASE SOFTWARE

BLR-CORE uptime is 0 minutes
System returned to ROM by power-on
Processor board ID NK3C15U4X00
4 Gigabit Ethernet interfaces"""

for line in show_version.splitlines():
    if "uptime is" in line:
        print("uptime line:", line)
    if line.startswith("Processor board ID"):
        print("serial:", line.split()[-1])</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">uptime line: BLR-CORE uptime is 0 minutes
serial: NK3C15U4X00</pre>
<h3>When to stop using split</h3>
<p>Use <code>split()</code> while all these are true: the output is a <b>regular table</b>; every row has the same number of fields; you only need the first or last column; and the format will not change soon. Switch to a stronger tool when any of these fails:</p>
<table class="cmp"><tr><th>Situation</th><th>Better tool</th></tr><tr><td>Value is inside a sentence (<code>Version 2.0,</code>)</td><td>Regular expression</td></tr><tr><td>Fields contain spaces</td><td>Regular expression or a parser</td></tr><tr><td>Many commands, many platforms</td><td>A ready-made parser</td></tr><tr><td>You must be sure of the result</td><td>A parser plus checks</td></tr></table>
<p>The next two chapters teach regular expressions, the first stronger tool.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) Reading <code>parts[4]</code> and assuming that position never moves. (2) Not checking <code>len(parts)</code> before indexing, which gives <code>IndexError</code> on short rows. (3) Splitting a line that you have not first selected, so a banner line accidentally produces data. (4) Forgetting that trailing punctuation sticks to words, such as <code>2.0,</code> with a comma.</p></div>
<div class="exam"><p><b>Exam trap.</b> Screen scraping with positions is fragile because output formats change; the exam's recommended order is structured API first, then a template-based parser, then regex or split as a last resort.</p></div>
<div class="scn"><h4>The outage that was only a column</h4><p>A dashboard counted a port healthy when <code>parts[4] == "up"</code>. After a software upgrade added one new column before the status, <code>parts[4]</code> held a different word on every row, so the dashboard showed zero healthy ports and the NOC was paged for an outage that did not exist. The network was fine; the parser was reading the wrong column. Switching the check to the last word, and adding a test that compares the count of up ports with the device's own summary, ended the false alarms.</p>
<p><b>Lesson:</b> test your parser on the ugly rows and after every upgrade, not just on the clean lab output.</p></div>
<div class="iv"><p class="q">"A split-based parser works on your lab but misreads a few production rows. Why?"</p><p>Production output has irregular rows: status phrases with two words, wrapped lines, blank lines, or extra columns after an upgrade. Position-based splitting shifts the columns. I would anchor on labels or the last column, use limited splits where the shape is known, add length checks, and move to regular expressions or a tested parser when the table is not regular.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A row with a two-word value has more words and shifts the columns.</li>
<li>The last word is safe to read with <code>parts[-1]</code>; middle positions are not.</li>
<li><code>split(None, n)</code> and <code>rsplit(None, 1)</code> limit where the cuts happen.</li>
<li>Cut at a label such as <code>" uptime is "</code> and select the right line first.</li>
<li>When values sit inside sentences or fields hold spaces, use regular expressions or a parser.</li>
</ul></div>
`,hi:`
<p><code>split()</code> saaf tables ke liye kamaal hai. Yeh chapter dikhata hai ki woh theek kahan toot-ta hai, taaki aap khatra jaldi pehchan sako aur surakshit method chun sako.</p>
<h3>Trap: do shabd wala column</h3>
<p><code>show ip interface brief</code> ki rows phir dekho. Zyadatar rows mein chhe shabd hain, lekin <b>administratively down</b> interface ki row mein saat hain, kyunki status do shabd ka phrase <code>administratively down</code> hai. Script baayein se positions gine to columns shift ho jaate hain.</p>
<pre class="code">rows = [
    "GigabitEthernet0/1     10.12.0.1       YES manual up                    up",
    "GigabitEthernet0/3     unassigned      YES unset  administratively down down",
]
for row in rows:
    parts = row.split()
    print(len(parts), "words | status =", parts[4], "| protocol =", parts[5])</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">6 words | status = up | protocol = up
7 words | status = administratively | protocol = down</pre>
<p>Pehli row mein sab sahi dikhta hai. Doosri mein <code>parts[4]</code> <code>administratively</code> hai aur <code>parts[5]</code> <code>down</code>, isliye fixed positions 4 aur 5 padhne wali script bekaar status report karti hai, aur <b>bina kisi error ke</b>. Silent galat data khatarnak kism hai.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Position ginna kyun toot-ta hai"><rect x="20" y="30" width="181" height="70" rx="10" fill="#bae6fd"/><text x="110" y="60" text-anchor="middle" class="svg-ink" font-size="14">Row A</text><text x="110" y="82" text-anchor="middle" class="svg-muted" font-size="12">6 shabd: status index 4 par</text><line x1="203" y1="65" x2="223" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="223,60 229,65 223,70" fill="#64748b"/><rect x="229" y="30" width="181" height="70" rx="10" fill="#bbf7d0"/><text x="319" y="60" text-anchor="middle" class="svg-ink" font-size="14">Row B</text><text x="319" y="82" text-anchor="middle" class="svg-muted" font-size="12">7 shabd: status index 4 aur 5 par</text><line x1="412" y1="65" x2="432" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="432,60 438,65 432,70" fill="#64748b"/><rect x="438" y="30" width="181" height="70" rx="10" fill="#fde68a"/><text x="528" y="60" text-anchor="middle" class="svg-ink" font-size="14">Result</text><text x="528" y="82" text-anchor="middle" class="svg-muted" font-size="12">columns shift, error nahi</text></svg><p class="cap">Position ginna kyun toot-ta hai</p></div>
<h3>Fix 1: aakhri column ke liye end se ginti</h3>
<p>Protocol hamesha <b>aakhri</b> shabd hai, isliye <code>parts[-1]</code> dono rows ke liye sahi rehta hai. Isi liye lab ka filter <code>parts[-1] == "up"</code> kaam karta hai. End se ginti aakhri column ke liye safe hai, beech ke columns ke liye nahi.</p>
<h3>Fix 2: limited jagahon par split</h3>
<p><code>line.split(None, 4)</code> sirf pehle 4 gaps par kaatta hai aur baaki ko ek tukde mein chhod deta hai. Phir <code>rsplit(None, 1)</code> <b>daayein</b> se ek shabd kaatta hai. Dono milkar do-shabd status ko ek field maante hain.</p>
<pre class="code">rows = [
    "GigabitEthernet0/1     10.12.0.1       YES manual up                    up",
    "GigabitEthernet0/3     unassigned      YES unset  administratively down down",
]
for row in rows:
    name, ip, ok, method, rest = row.split(None, 4)
    status, protocol = rest.rsplit(None, 1)
    print(name, "|", ip, "|", status, "|", protocol)</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">GigabitEthernet0/1 | 10.12.0.1 | up | up
GigabitEthernet0/3 | unassigned | administratively down | down</pre>
<p>Ab dono rows sahi status deti hain, <code>administratively down</code> samet. Yeh chalta hai, lekin keemat dekho: code padhna mushkil hai, aur woh abhi bhi columns ki exact ginti par nirbhar hai.</p>
<h3>Fix 3: position ki jagah label par kaato</h3>
<p><code>BLR-CORE uptime is 0 minutes</code> jaisi lines ke liye behtar anchor woh <b>shabd hain jo kabhi nahi badalte</b>. <code>split("separator")</code> multi-character separator accept karta hai.</p>
<pre class="code">line = "BLR-CORE uptime is 0 minutes"
host, uptime = line.split(" uptime is ")
print(host)
print(uptime)

board = "Processor board ID NK3C15U4X00"
print(board.split()[-1])

image = 'System image file is "flash:nkos-router-universal.2.0.bin"'
print(image.split('"')[1])</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">BLR-CORE
0 minutes
NK3C15U4X00
flash:nkos-router-universal.2.0.bin</pre>
<p>Teen kaam ke moves dikhaye: phrase par kaatna, aakhri shabd lena, aur quotes ke beech ka text lena (<code>split('"')[1]</code> doosra tukda hai, jo quotes ke andar hai). Label par anchor karna positions ginne se columns ke badlav ko behtar jhelta hai.</p>
<h3>Pehle sahi line chuno</h3>
<p>Output ka zyadatar hissa woh data nahi jo aapko chahiye. Line ko split karne se <b>pehle</b> <code>in</code>, <code>startswith</code> ya <code>if</code> wale loop se chuno.</p>
<pre class="code">show_version = """Network Kings Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE
ROM: NK-OS Bootstrap, Version 2.0, RELEASE SOFTWARE

BLR-CORE uptime is 0 minutes
System returned to ROM by power-on
Processor board ID NK3C15U4X00
4 Gigabit Ethernet interfaces"""

for line in show_version.splitlines():
    if "uptime is" in line:
        print("uptime line:", line)
    if line.startswith("Processor board ID"):
        print("serial:", line.split()[-1])</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">uptime line: BLR-CORE uptime is 0 minutes
serial: NK3C15U4X00</pre>
<h3>split kab chhodna hai</h3>
<p><code>split()</code> tab tak use karo jab tak yeh sab sach hon: output <b>regular table</b> hai; har row mein fields ki sankhya barabar; aapko sirf pehla ya aakhri column chahiye; aur format jaldi nahi badlega. In mein se kuch bhi fail ho to mazboot tool par jao:</p>
<table class="cmp"><tr><th>Sthiti</th><th>Behtar tool</th></tr><tr><td>Value sentence ke andar (<code>Version 2.0,</code>)</td><td>Regular expression</td></tr><tr><td>Fields mein spaces</td><td>Regular expression ya parser</td></tr><tr><td>Kai commands, kai platforms</td><td>Ready-made parser</td></tr><tr><td>Result ka pakka bharosa chahiye</td><td>Parser aur checks</td></tr></table>
<p>Agle do chapters regular expressions sikhate hain, pehla mazboot tool.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) <code>parts[4]</code> padhna aur maan lena ki woh position kabhi nahi hilti. (2) Index karne se pehle <code>len(parts)</code> check na karna, jisse chhoti rows par <code>IndexError</code> aata hai. (3) Aisi line split karna jo pehle chuni nahi gayi, isliye banner line galti se data bana deti hai. (4) Yeh bhoolna ki trailing punctuation shabdon se chipak jaata hai, jaise comma wala <code>2.0,</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Positions se screen scraping fragile hai kyunki output formats badalte hain; exam ka recommended order hai pehle structured API, phir template-based parser, phir regex ya split aakhri vikalp ke roop mein.</p></div>
<div class="scn"><h4>Outage jo sirf ek column tha</h4><p>Ek dashboard port ko healthy ginta tha jab <code>parts[4] == "up"</code> ho. Software upgrade ne status se pehle ek naya column jod diya, to <code>parts[4]</code> har row par alag shabd rakhne laga, isliye dashboard ne zero healthy ports dikhaye aur NOC ko aise outage ke liye page kiya gaya jo tha hi nahi. Network theek tha; parser galat column padh raha tha. Check ko aakhri shabd par badalne aur up ports ki ginti ko device ki apni summary se compare karne wali test jodne se false alarms band hue.</p>
<p><b>Lesson:</b> parser ko ugly rows par aur har upgrade ke baad test karo, sirf saaf lab output par nahi.</p></div>
<div class="iv"><p class="q">"Split-based parser aapke lab par chalta hai lekin production ki kuch rows galat padhta hai. Kyun?"</p><p>Production output mein irregular rows hoti hain: do-shabd status phrases, wrapped lines, khaali lines, ya upgrade ke baad extra columns. Position-based splitting columns ko shift kar deta hai. Main labels ya aakhri column par anchor karta, jahan shape pata ho wahan limited splits use karta, length checks jodta, aur table regular na ho to regular expressions ya tested parser par jaata.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Do-shabd value wali row mein zyada shabd hote hain aur columns shift ho jaate hain.</li>
<li>Aakhri shabd <code>parts[-1]</code> se padhna safe hai; beech ki positions nahi.</li>
<li><code>split(None, n)</code> aur <code>rsplit(None, 1)</code> batate hain kahan cuts hon.</li>
<li><code>" uptime is "</code> jaise label par kaato aur pehle sahi line chuno.</li>
<li>Values sentences ke andar hon ya fields mein spaces hon to regular expressions ya parser use karo.</li>
</ul></div>
`}};export{e as default};