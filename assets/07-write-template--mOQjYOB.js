var e={id:`write-template`,h:{en:`Writing a template for a new command, step by step`,hi:`Nayi command ke liye template likhna, step by step`},body:{en:`
<p><b>The idea of this chapter:</b> sooner or later the command you need is not in ntc-templates. Writing a template is not magic. It is a loop of five small steps, and each step has a check. We build a template for <code>show ip arp</code> from nothing, and you will see where rows go missing and how to decide what to do about them.</p>

<h3>Analogy: drawing the boxes on a new form</h3>
<p>A designer who gets a new paper form does not draw all the boxes at once. She marks one box, scans a sample, checks the result, then marks the next. That is exactly how you grow a template: one Value at a time, with a test after every change.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Five steps: save a sample, name the columns, add one Value, run and count, handle odd lines">
<rect x="8" y="35" width="116" height="64" rx="10" fill="#bae6fd"/><text x="66" y="60" text-anchor="middle" class="svg-ink" font-size="12">1 Sample</text><text x="66" y="78" text-anchor="middle" class="svg-muted" font-size="10">save real output</text>
<rect x="134" y="35" width="116" height="64" rx="10" fill="#fde68a"/><text x="192" y="60" text-anchor="middle" class="svg-ink" font-size="12">2 Columns</text><text x="192" y="78" text-anchor="middle" class="svg-muted" font-size="10">name each field</text>
<rect x="260" y="35" width="116" height="64" rx="10" fill="#ddd6fe"/><text x="318" y="60" text-anchor="middle" class="svg-ink" font-size="12">3 One Value</text><text x="318" y="78" text-anchor="middle" class="svg-muted" font-size="10">and one rule</text>
<rect x="386" y="35" width="116" height="64" rx="10" fill="#bbf7d0"/><text x="444" y="60" text-anchor="middle" class="svg-ink" font-size="12">4 Run, count</text><text x="444" y="78" text-anchor="middle" class="svg-muted" font-size="10">rows = lines?</text>
<rect x="512" y="35" width="120" height="64" rx="10" fill="#fed7aa"/><text x="572" y="60" text-anchor="middle" class="svg-ink" font-size="12">5 Odd lines</text><text x="572" y="78" text-anchor="middle" class="svg-muted" font-size="10">decide, then add</text>
<line x1="124" y1="67" x2="134" y2="67" stroke="#64748b" stroke-width="2"/><line x1="250" y1="67" x2="260" y2="67" stroke="#64748b" stroke-width="2"/><line x1="376" y1="67" x2="386" y2="67" stroke="#64748b" stroke-width="2"/><line x1="502" y1="67" x2="512" y2="67" stroke="#64748b" stroke-width="2"/>
<path d="M 572 99 Q 572 130 318 130 Q 318 115 318 99" fill="none" stroke="#64748b" stroke-width="1.5"/><text x="445" y="146" text-anchor="middle" class="svg-muted" font-size="10">repeat for the next Value</text>
</svg><p class="cap">Grow the template one Value at a time and test after every change.</p></div>

<h3>Step 1: save a real sample</h3>
<p>Always start from real text, saved in a file. The file <code>show_arp.txt</code> holds the output of <code>show ip arp</code>. Notice the first entry is the router's own address (age <code>-</code>), and the last one is an <b>incomplete</b> entry for a host that did not answer.</p>
<pre class="out">AUTO01$ cat show_arp.txt
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  10.99.0.1               -   aabb.cc00.0100  ARPA   GigabitEthernet0/0
Internet  10.99.0.2              12   aabb.cc00.0200  ARPA   GigabitEthernet0/0
Internet  10.99.0.60              3   aabb.cc00.3c00  ARPA   GigabitEthernet0/0
Internet  10.99.0.9               0   Incomplete      ARPA</pre>

<h3>Steps 2 and 3: name the columns, start small</h3>
<p>The columns are Protocol, Address, Age, Hardware Addr, Type and Interface. We start with only the two we care most about, the IP address and the MAC address, so any problem is easy to see.</p>
<pre class="code">Value Required ADDRESS (\\d+\\.\\d+\\.\\d+\\.\\d+)
Value MAC ([0-9a-f]{4}\\.[0-9a-f]{4}\\.[0-9a-f]{4})

Start
  ^Internet\\s+&#36;{ADDRESS}\\s+\\S+\\s+&#36;{MAC} -&gt; Record</pre>
<ul>
<li>The rule starts with the word <code>Internet</code>, so the header line (which starts with "Protocol") cannot match.</li>
<li><code>\\S+</code> skips the age, whether it is a number or a dash.</li>
<li><code>[0-9a-f]{4}</code> is exactly four hex characters; a MAC address in Cisco format is three such groups separated by dots.</li>
</ul>
<pre class="out">AUTO01$ python3 parse_one.py arp1.textfsm show_arp.txt
['ADDRESS', 'MAC']
['10.99.0.1', 'aabb.cc00.0100']
['10.99.0.2', 'aabb.cc00.0200']
['10.99.0.60', 'aabb.cc00.3c00']</pre>
<p>Step 4, count: the sample has 4 entries and we got 3. Do not move on yet. The missing one is the incomplete entry, because "Incomplete" is not a MAC address. We will come back to it.</p>

<h3>Add the other columns</h3>
<p>Now add AGE, TYPE and INTERFACE, and use <code>\\s*$$</code> at the end so that the rule must reach the end of the line:</p>
<pre class="code">Value Required ADDRESS (\\d+\\.\\d+\\.\\d+\\.\\d+)
Value AGE (\\d+|-)
Value MAC ([0-9a-f]{4}\\.[0-9a-f]{4}\\.[0-9a-f]{4})
Value TYPE (\\S+)
Value INTERFACE (\\S+)

Start
  ^Internet\\s+&#36;{ADDRESS}\\s+&#36;{AGE}\\s+&#36;{MAC}\\s+&#36;{TYPE}\\s+&#36;{INTERFACE}\\s*$$ -&gt; Record</pre>
<pre class="out">AUTO01$ python3 parse_one.py arp2.textfsm show_arp.txt
['ADDRESS', 'AGE', 'MAC', 'TYPE', 'INTERFACE']
['10.99.0.1', '-', 'aabb.cc00.0100', 'ARPA', 'GigabitEthernet0/0']
['10.99.0.2', '12', 'aabb.cc00.0200', 'ARPA', 'GigabitEthernet0/0']
['10.99.0.60', '3', 'aabb.cc00.3c00', 'ARPA', 'GigabitEthernet0/0']</pre>
<p>Notice the AGE regex <code>(\\d+|-)</code>. The first entry has a dash, and a plain <code>\\d+</code> would have lost the router's own address.</p>

<h3>Step 5: decide what to do with the odd line</h3>
<p>An incomplete ARP entry is exactly what a troubleshooter wants to see: it means "I asked for this host and nobody answered". Throwing it away would hide the problem. So we add a second rule for that line shape, in the same state. Rules are tried from top to bottom and each one records a row:</p>
<pre class="code">Start
  ^Internet\\s+&#36;{ADDRESS}\\s+&#36;{AGE}\\s+&#36;{MAC}\\s+&#36;{TYPE}\\s+&#36;{INTERFACE}\\s*$$ -&gt; Record
  ^Internet\\s+&#36;{ADDRESS}\\s+&#36;{AGE}\\s+Incomplete\\s+&#36;{TYPE}\\s*$$ -&gt; Record</pre>
<pre class="out">AUTO01$ python3 parse_one.py arp.textfsm show_arp.txt
['ADDRESS', 'AGE', 'MAC', 'TYPE', 'INTERFACE']
['10.99.0.1', '-', 'aabb.cc00.0100', 'ARPA', 'GigabitEthernet0/0']
['10.99.0.2', '12', 'aabb.cc00.0200', 'ARPA', 'GigabitEthernet0/0']
['10.99.0.60', '3', 'aabb.cc00.3c00', 'ARPA', 'GigabitEthernet0/0']
<span class="hl">['10.99.0.9', '0', '', 'ARPA', '']</span></pre>
<p>Four rows for four entries. The incomplete entry has empty MAC and INTERFACE, because the second rule never captured them. The final <code>\\s*</code> also copes with the trailing spaces that the device prints after <code>ARPA</code>. Only <code>ADDRESS</code> is Required, so rows with an empty MAC survive. Now the template answers real questions:</p>
<pre class="code">missing = [r["ADDRESS"] for r in rows if r["MAC"] == ""]
print(len(rows), "entries,", len(missing), "incomplete:", missing)</pre>
<pre class="out">AUTO01$ python3 arp_report.py
4 entries, 1 incomplete: ['10.99.0.9']</pre>

<h3>Rules for good templates</h3>
<ul>
<li>Value names in capitals, short and meaningful, using the same names as the vendor column headers.</li>
<li>Anchor each rule at its start with a fixed word or a tight Value, so headers and banners cannot match.</li>
<li>Prefer several simple rules to one huge rule with many optional parts.</li>
<li>Keep sample files from real devices, including ugly ones, in a folder next to the templates.</li>
<li>Name the file after the vendor and command, for example <code>cisco_ios_show_ip_arp.textfsm</code>, so it could be shared like a library template.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A colleague says "my ARP report is missing the printer". You run the template on a fresh capture and count: 4 lines of data, 3 rows. The printer's line has a MAC in uppercase. Your regex used <code>[0-9a-f]</code> only. Adding <code>A-F</code> to the class, <code>[0-9a-fA-F]</code>, brings the fourth row back.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Writing the whole template and then testing; you cannot tell which part is wrong. Testing only on perfect output. Forgetting that the header line can match a loose rule. Making a Value Required that the odd line does not have, and so losing the odd line without noticing.</p></div>
<div class="exam"><p><b>Exam trap.</b> Several rules in one state are alternatives for different line shapes; the first that matches wins. A row is only as complete as the rule that recorded it, so unset Values come back as the empty string.</p></div>

<div class="scn"><h4>The duplicate-IP hunt</h4><p>During a campus migration two devices answered for the same address. The engineer parsed <code>show ip arp</code> from every switch with the template above and grouped rows by ADDRESS in a dictionary. Three lines of Python showed the address with two different MACs on two switches. Without a template the same search had taken half a day of reading output.</p><p><b>Lesson:</b> once output is rows, questions become short loops.</p></div>

<div class="iv"><p class="q">"How do you write a TextFSM template for a command that has none?"</p><p>I save a real sample, then add one Value and one rule at a time, running it after every change and comparing the row count with the number of data lines. I anchor rules on fixed words, handle odd lines such as incomplete entries with their own rule, and keep the sample files as test data.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work from a saved real sample and grow the template one Value at a time.</li>
<li>After every change compare the row count with the number of data lines.</li>
<li>Anchor rules with a fixed word so headers cannot match.</li>
<li>Decide on purpose what to do with odd lines; a second rule can record them.</li>
<li>Unset Values come back as empty strings; use <code>\\s*$$</code> to cope with trailing spaces.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> kabhi na kabhi aapko chahiye wali command ntc-templates mein nahi hogi. Template likhna jaadu nahi hai. Yeh paanch chhote steps ka loop hai, aur har step ka ek check hai. Hum <code>show ip arp</code> ke liye shuru se template banate hain, aur dekhoge ki rows kahan gayab hoti hain aur uske baare mein kya tay karna hai.</p>

<h3>Analogy: naye form par boxes banana</h3>
<p>Jis designer ko naya paper form milta hai woh saare boxes ek saath nahi banata. Woh ek box mark karti hai, sample scan karti hai, result check karti hai, phir agla box mark karti hai. Template bhi aise hi badhta hai: ek-ek Value, har badlav ke baad test.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Paanch steps: sample save, columns ke naam, ek Value, chalao aur gino, ajeeb lines sambhalo">
<rect x="8" y="35" width="116" height="64" rx="10" fill="#bae6fd"/><text x="66" y="60" text-anchor="middle" class="svg-ink" font-size="12">1 Sample</text><text x="66" y="78" text-anchor="middle" class="svg-muted" font-size="10">asli output save</text>
<rect x="134" y="35" width="116" height="64" rx="10" fill="#fde68a"/><text x="192" y="60" text-anchor="middle" class="svg-ink" font-size="12">2 Columns</text><text x="192" y="78" text-anchor="middle" class="svg-muted" font-size="10">har field ko naam</text>
<rect x="260" y="35" width="116" height="64" rx="10" fill="#ddd6fe"/><text x="318" y="60" text-anchor="middle" class="svg-ink" font-size="12">3 Ek Value</text><text x="318" y="78" text-anchor="middle" class="svg-muted" font-size="10">aur ek rule</text>
<rect x="386" y="35" width="116" height="64" rx="10" fill="#bbf7d0"/><text x="444" y="60" text-anchor="middle" class="svg-ink" font-size="12">4 Chalao, gino</text><text x="444" y="78" text-anchor="middle" class="svg-muted" font-size="10">rows = lines?</text>
<rect x="512" y="35" width="120" height="64" rx="10" fill="#fed7aa"/><text x="572" y="60" text-anchor="middle" class="svg-ink" font-size="12">5 Ajeeb lines</text><text x="572" y="78" text-anchor="middle" class="svg-muted" font-size="10">tay karo, phir jodo</text>
<line x1="124" y1="67" x2="134" y2="67" stroke="#64748b" stroke-width="2"/><line x1="250" y1="67" x2="260" y2="67" stroke="#64748b" stroke-width="2"/><line x1="376" y1="67" x2="386" y2="67" stroke="#64748b" stroke-width="2"/><line x1="502" y1="67" x2="512" y2="67" stroke="#64748b" stroke-width="2"/>
<path d="M 572 99 Q 572 130 318 130 Q 318 115 318 99" fill="none" stroke="#64748b" stroke-width="1.5"/><text x="445" y="146" text-anchor="middle" class="svg-muted" font-size="10">agli Value ke liye dohrao</text>
</svg><p class="cap">Template ko ek-ek Value badhao aur har badlav ke baad test karo.</p></div>

<h3>Step 1: asli sample save karo</h3>
<p>Hamesha asli text se shuru karo, file mein save kiya hua. File <code>show_arp.txt</code> mein <code>show ip arp</code> ka output hai. Dhyan do ki pehli entry router ka apna address hai (age <code>-</code>), aur aakhri ek <b>incomplete</b> entry hai us host ki jisne jawab nahi diya.</p>
<pre class="out">AUTO01$ cat show_arp.txt
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  10.99.0.1               -   aabb.cc00.0100  ARPA   GigabitEthernet0/0
Internet  10.99.0.2              12   aabb.cc00.0200  ARPA   GigabitEthernet0/0
Internet  10.99.0.60              3   aabb.cc00.3c00  ARPA   GigabitEthernet0/0
Internet  10.99.0.9               0   Incomplete      ARPA</pre>

<h3>Step 2 aur 3: columns ko naam do, chhote se shuru karo</h3>
<p>Columns hain Protocol, Address, Age, Hardware Addr, Type aur Interface. Hum sirf do se shuru karte hain jo sabse zyada kaam ke hain, IP address aur MAC address, taaki koi bhi problem aasani se dikhe.</p>
<pre class="code">Value Required ADDRESS (\\d+\\.\\d+\\.\\d+\\.\\d+)
Value MAC ([0-9a-f]{4}\\.[0-9a-f]{4}\\.[0-9a-f]{4})

Start
  ^Internet\\s+&#36;{ADDRESS}\\s+\\S+\\s+&#36;{MAC} -&gt; Record</pre>
<ul>
<li>Rule shabd <code>Internet</code> se shuru hota hai, isliye header line (jo "Protocol" se shuru hoti hai) match nahi ho sakti.</li>
<li><code>\\S+</code> age ko skip karta hai, chahe woh number ho ya dash.</li>
<li><code>[0-9a-f]{4}</code> theek chaar hex characters hai; Cisco format ka MAC address dots se alag aise teen groups ka hota hai.</li>
</ul>
<pre class="out">AUTO01$ python3 parse_one.py arp1.textfsm show_arp.txt
['ADDRESS', 'MAC']
['10.99.0.1', 'aabb.cc00.0100']
['10.99.0.2', 'aabb.cc00.0200']
['10.99.0.60', 'aabb.cc00.3c00']</pre>
<p>Step 4, ginti: sample mein 4 entries hain aur humein 3 mili. Abhi aage mat badho. Gayab entry incomplete wali hai, kyunki "Incomplete" MAC address nahi hai. Hum ispar wapas aayenge.</p>

<h3>Baaki columns jodo</h3>
<p>Ab AGE, TYPE aur INTERFACE jodo, aur ant mein <code>\\s*$$</code> use karo taaki rule ko line ke ant tak pahunchna pade:</p>
<pre class="code">Value Required ADDRESS (\\d+\\.\\d+\\.\\d+\\.\\d+)
Value AGE (\\d+|-)
Value MAC ([0-9a-f]{4}\\.[0-9a-f]{4}\\.[0-9a-f]{4})
Value TYPE (\\S+)
Value INTERFACE (\\S+)

Start
  ^Internet\\s+&#36;{ADDRESS}\\s+&#36;{AGE}\\s+&#36;{MAC}\\s+&#36;{TYPE}\\s+&#36;{INTERFACE}\\s*$$ -&gt; Record</pre>
<pre class="out">AUTO01$ python3 parse_one.py arp2.textfsm show_arp.txt
['ADDRESS', 'AGE', 'MAC', 'TYPE', 'INTERFACE']
['10.99.0.1', '-', 'aabb.cc00.0100', 'ARPA', 'GigabitEthernet0/0']
['10.99.0.2', '12', 'aabb.cc00.0200', 'ARPA', 'GigabitEthernet0/0']
['10.99.0.60', '3', 'aabb.cc00.3c00', 'ARPA', 'GigabitEthernet0/0']</pre>
<p>AGE regex <code>(\\d+|-)</code> par dhyan do. Pehli entry mein dash hai, aur sirf <code>\\d+</code> router ka apna address kho deta.</p>

<h3>Step 5: ajeeb line ka kya karna hai, tay karo</h3>
<p>Incomplete ARP entry wahi hai jo troubleshooter dekhna chahta hai: iska matlab "maine is host ke liye poocha aur kisi ne jawab nahi diya". Ise phenk dena problem chhupa dega. Isliye hum us line ke shape ke liye usi state mein doosra rule jodte hain. Rules upar se neeche try hote hain aur har ek row record karta hai:</p>
<pre class="code">Start
  ^Internet\\s+&#36;{ADDRESS}\\s+&#36;{AGE}\\s+&#36;{MAC}\\s+&#36;{TYPE}\\s+&#36;{INTERFACE}\\s*$$ -&gt; Record
  ^Internet\\s+&#36;{ADDRESS}\\s+&#36;{AGE}\\s+Incomplete\\s+&#36;{TYPE}\\s*$$ -&gt; Record</pre>
<pre class="out">AUTO01$ python3 parse_one.py arp.textfsm show_arp.txt
['ADDRESS', 'AGE', 'MAC', 'TYPE', 'INTERFACE']
['10.99.0.1', '-', 'aabb.cc00.0100', 'ARPA', 'GigabitEthernet0/0']
['10.99.0.2', '12', 'aabb.cc00.0200', 'ARPA', 'GigabitEthernet0/0']
['10.99.0.60', '3', 'aabb.cc00.3c00', 'ARPA', 'GigabitEthernet0/0']
<span class="hl">['10.99.0.9', '0', '', 'ARPA', '']</span></pre>
<p>Chaar entries ke liye chaar rows. Incomplete entry ka MAC aur INTERFACE khaali hai, kyunki doosra rule unhe kabhi capture nahi karta. Aakhri <code>\\s*</code> un trailing spaces ko bhi sambhalta hai jo device <code>ARPA</code> ke baad print karta hai. Sirf <code>ADDRESS</code> Required hai, isliye khaali MAC wali rows bach jaati hain. Ab template asli sawalon ke jawab deta hai:</p>
<pre class="code">missing = [r["ADDRESS"] for r in rows if r["MAC"] == ""]
print(len(rows), "entries,", len(missing), "incomplete:", missing)</pre>
<pre class="out">AUTO01$ python3 arp_report.py
4 entries, 1 incomplete: ['10.99.0.9']</pre>

<h3>Achhe templates ke niyam</h3>
<ul>
<li>Value names capitals mein, chhote aur matlab wale, vendor ke column headers ke wahi naam.</li>
<li>Har rule ko shuru mein fixed shabd ya tight Value se anchor karo, taaki headers aur banners match na ho sakein.</li>
<li>Ek bade rule jisme bahut optional hisse hon, uski jagah kai simple rules pasand karo.</li>
<li>Asli devices ke sample files, ugly wali bhi, templates ke paas folder mein rakho.</li>
<li>File ka naam vendor aur command par rakho, jaise <code>cisco_ios_show_ip_arp.textfsm</code>, taaki use library template ki tarah share kiya ja sake.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Colleague kehta hai "meri ARP report mein printer gayab hai". Aap template ko taaza capture par chalate ho aur ginte ho: data ki 4 lines, 3 rows. Printer ki line mein MAC uppercase mein hai. Aapke regex ne sirf <code>[0-9a-f]</code> use kiya tha. Class mein <code>A-F</code> jodne se, <code>[0-9a-fA-F]</code>, chauthi row wapas aa jaati hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Poora template likhkar phir test karna; pata nahi chalta kaunsa hissa galat hai. Sirf perfect output par test karna. Yeh bhool jaana ki header line loose rule se match ho sakti hai. Aisi Value ko Required banana jo ajeeb line mein nahi hai, aur ajeeb line bina dhyan diye kho dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ek state mein kai rules alag line shapes ke vikalp hain; jo pehla match kare woh jeetta hai. Row utni hi poori hoti hai jitna us rule ne record kiya, isliye unset Values khaali string ki tarah aati hain.</p></div>

<div class="scn"><h4>Duplicate-IP ki khoj</h4><p>Campus migration ke dauran do devices ek hi address ke liye jawab de rahe the. Engineer ne har switch ke <code>show ip arp</code> ko upar wale template se parse kiya aur rows ko ADDRESS ke hisaab se dictionary mein group kiya. Python ki teen lines ne dikha diya ki woh address do alag switches par do alag MACs ke saath hai. Template ke bina wahi khoj mein aadha din output padhne mein gaya tha.</p><p><b>Lesson:</b> output rows ban jaaye to sawal chhote loops ban jaate hain.</p></div>

<div class="iv"><p class="q">"Jis command ka template nahi hai uske liye TextFSM template kaise likhte ho?"</p><p>Asli sample save karta hoon, phir ek-ek Value aur ek-ek rule jodta hoon, har badlav ke baad chalata hoon aur row count ko data lines ki ginti se milata hoon. Rules ko fixed shabdon par anchor karta hoon, incomplete entries jaisi ajeeb lines ko unka apna rule deta hoon, aur sample files ko test data ki tarah rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Saved asli sample se kaam karo aur template ko ek-ek Value badhao.</li>
<li>Har badlav ke baad row count ko data lines ki ginti se milao.</li>
<li>Rules ko fixed shabd se anchor karo taaki headers match na ho.</li>
<li>Ajeeb lines ka kya karna hai jaan-boojhkar tay karo; doosra rule unhe record kar sakta hai.</li>
<li>Unset Values khaali strings aati hain; trailing spaces ke liye <code>\\s*$$</code> use karo.</li>
</ul></div>
`}};export{e as default};