var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You can now turn the text of a <code>show</code> command into data, with three different methods, and write the result to a file. This chapter collects the facts for revision and for the exam.</p>
<h3>Can-do checklist</h3>
<p>Tick an item only if you can do it <b>without looking</b>:</p>
<ul>
<li>Explain screen scraping and why it breaks when the text changes.</li>
<li>Cut a string into lines with <code>splitlines()</code> and a line into words with <code>split()</code>.</li>
<li>Read the first word with <code>parts[0]</code> and the last with <code>parts[-1]</code>, and explain why counting starts at 0.</li>
<li>Explain why <code>administratively down</code> shifts the columns and how the last word, <code>split(None, n)</code> or a label avoids it.</li>
<li>Write a regular expression with <code>\\d</code>, <code>\\S</code>, <code>.</code>, <code>\\.</code>, <code>+</code>, <code>*</code>, <code>?</code> and use <code>re.search</code>, <code>re.match</code> and <code>re.findall</code>.</li>
<li>Use groups <code>( )</code> and <code>group(1)</code>, named groups and <code>groupdict()</code>.</li>
<li>Explain why <code>search</code> can return None and what the <code>AttributeError</code> on NoneType means.</li>
<li>Call <code>parse(command, output)</code> and walk <code>data["interface"]</code> by name.</li>
<li>Write rows to a CSV file with <code>open(..., "w")</code> and say when the <code>csv</code> module is needed.</li>
<li>Troubleshoot a parsing script: exception, raw text, one line alone, fix, re-run on all devices, add a check.</li>
</ul>
<h3>Which method, when</h3>
<table class="cmp"><tr><th>Method</th><th>Strong point</th><th>Weak point</th><th>Use it when</th></tr><tr><td><code>split()</code></td><td>Very simple, no import</td><td>Breaks on two-word values and new columns</td><td>Quick job, fixed simple table</td></tr><tr><td>Regular expression</td><td>One precise value from any text</td><td>Case, spacing, hard to read</td><td>Single values such as version or serial</td></tr><tr><td>Parser</td><td>Named fields, maintained, tested</td><td>Only for commands that have a parser</td><td>Tables and anything you will rely on</td></tr><tr><td>API returning JSON</td><td>No parsing at all</td><td>Device must support it</td><td>Whenever it exists</td></tr></table>
<h3>Python quick reference</h3>
<table class="cmp"><tr><th>Task</th><th>Code</th></tr><tr><td>Lines of the output</td><td><code>output.splitlines()</code></td></tr><tr><td>Words of a line</td><td><code>line.split()</code></td></tr><tr><td>Last word</td><td><code>parts[-1]</code></td></tr><tr><td>Limited split</td><td><code>line.split(None, 1)</code></td></tr><tr><td>First match or None</td><td><code>re.search(r"Version (\\S+),", text)</code></td></tr><tr><td>Captured text</td><td><code>m.group(1)</code></td></tr><tr><td>Named groups to dictionary</td><td><code>m.groupdict()</code></td></tr><tr><td>All matches</td><td><code>re.findall(r"\\d+", text)</code></td></tr><tr><td>Parser call</td><td><code>parse("show ip interface brief", output)</code></td></tr><tr><td>Write a file</td><td><code>with open("inventory.csv", "w") as f:</code></td></tr><tr><td>Show hidden characters</td><td><code>repr(text)</code></td></tr></table>
<h3>Mini glossary</h3>
<dl class="terms">
<dt>parsing</dt><dd>Turning text for humans into data for programs.</dd>
<dt>screen scraping</dt><dd>Pulling values out of command output as plain text.</dd>
<dt>split</dt><dd>A string method that cuts text into a list of pieces.</dd>
<dt>regular expression</dt><dd>A pattern that describes the shape of text to find or extract.</dd>
<dt>raw string</dt><dd>A string written with r in front, so backslashes are kept as they are.</dd>
<dt>group</dt><dd>Round brackets in a pattern that capture part of the match.</dd>
<dt>None</dt><dd>The value meaning nothing was found.</dd>
<dt>parser</dt><dd>A library that turns the output of a known command into a dictionary or list.</dd>
<dt>CSV</dt><dd>Comma-separated values: a text file of rows that a spreadsheet opens.</dd>
<dt>repr</dt><dd>A function that shows a value with every hidden character visible.</dd>
</dl>
<h3>Most tested facts</h3>
<ul>
<li><code>splitlines()</code> gives lines; <code>split()</code> with no argument gives words and ignores repeated spaces.</li>
<li><code>administratively down</code> is two words; the last word <code>parts[-1]</code> is still safe.</li>
<li><code>re.search</code> returns a match object or None; <code>.group</code> on None raises AttributeError.</li>
<li>Regex is case-sensitive: <code>version</code> does not match <code>Version</code>.</li>
<li><code>group(1)</code> is the first bracket; <code>group(0)</code> is the whole match.</li>
<li>A parser returns a dictionary (Genie style) or a list of dictionaries (TextFSM); lab <code>parse</code> gives <code>data["interface"][name][field]</code>.</li>
<li><code>open(..., "w")</code> replaces a file; <code>"a"</code> appends.</li>
<li>A script that exits without error can still hold wrong data: check the result.</li>
</ul>
<h3>Both labs in one paragraph</h3>
<p><b>Lab 1, interfaces.</b> The raw row of an administratively-down interface has 7 words. <code>up.py</code> prints only names whose last word is <code>up</code>; <code>up2.py</code> with <code>data = parse("show ip interface brief", output)</code> prints the up/up interfaces with IPs, and on MUM-R2 there are 4 of them.</p>
<p><b>Lab 2, inventory.</b> <code>inv.py</code> crashes with <code>AttributeError</code> because the pattern says <code>version</code> while the output says <code>Version</code>. After the fix, the serial pattern <code>Processor board ID (\\S+)</code> and the file write produce <code>inventory.csv</code>; the serial of BLR-WAN is <code>NK45ZYX1X00</code>.</p>
<h3>Putting it together</h3>
<p>A complete collection script has four stages: <b>collect</b> the text over SSH, <b>parse</b> it into data, <b>store</b> the data as JSON, YAML or CSV, and <b>verify</b> that the result is complete. Each stage can fail, so each stage gets a check. You now have the Python and data-format skills for that pipeline.</p>
<div class="scn"><h4>The script that found the missing router</h4><p>A small team parsed <code>show version</code> from every branch router into a CSV each night. One morning the report had 41 rows instead of 42. The row-count check failed the job and named the router that returned no match. A firmware label on that device had a different spelling, a one-line fix to the pattern. Without the check, the missing router would have been noticed at the next audit.</p>
<p><b>Lesson:</b> collect, parse, store and verify; the check is part of the script.</p></div>
<div class="iv"><p class="q">"When do you use split, regular expressions or a parser to process command output?"</p><p>I use split for a quick job on a simple fixed table, being careful with values that contain spaces. I use a regular expression when I need one precise value from free text, such as a version or serial, anchored on a stable label. I prefer a parser for tables and for anything I will rely on, because it returns named fields and is maintained. Whichever I choose, I check that the result is complete.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Parsing turns CLI text into lists and dictionaries; three methods: split, regex, parser.</li>
<li>Split is simple but breaks on two-word values; regex needs care with case and labels; parsers give named fields.</li>
<li><code>search</code> returns None on no match, and <code>.group</code> on None is an AttributeError.</li>
<li>Write reports with <code>open(..., "w")</code> or the <code>csv</code> module and check them before sharing.</li>
<li>Collect, parse, store, verify: always check the result.</li>
</ul></div>
`,hi:`
<p>Ab aap <code>show</code> command ke text ko teen alag methods se data mein badal sakte ho, aur result ko file mein likh sakte ho. Yeh chapter revision aur exam ke liye facts ek jagah rakhta hai.</p>
<h3>Can-do checklist</h3>
<p>Kisi item par tick tabhi lagao jab aap use <b>bina dekhe</b> kar sako:</p>
<ul>
<li>Screen scraping samjhao aur batao ki text badalne par yeh kyun tootti hai.</li>
<li><code>splitlines()</code> se string ko lines mein aur <code>split()</code> se line ko words mein kaatna.</li>
<li><code>parts[0]</code> se pehla word aur <code>parts[-1]</code> se aakhri word padhna, aur batana ki ginti 0 se kyun shuru hoti hai.</li>
<li>Samjhao ki <code>administratively down</code> columns ko kyun khisakata hai aur aakhri word, <code>split(None, n)</code> ya label isse kaise bachate hain.</li>
<li><code>\\d</code>, <code>\\S</code>, <code>.</code>, <code>\\.</code>, <code>+</code>, <code>*</code>, <code>?</code> ke saath regular expression likhna aur <code>re.search</code>, <code>re.match</code>, <code>re.findall</code> use karna.</li>
<li>Groups <code>( )</code> aur <code>group(1)</code>, named groups aur <code>groupdict()</code> use karna.</li>
<li>Samjhao ki <code>search</code> None kyun de sakta hai aur NoneType par <code>AttributeError</code> ka matlab kya hai.</li>
<li><code>parse(command, output)</code> call karna aur <code>data["interface"]</code> ko naam se walk karna.</li>
<li><code>open(..., "w")</code> se CSV file mein rows likhna aur batana ki <code>csv</code> module kab chahiye.</li>
<li>Parsing script troubleshoot karna: exception, raw text, ek line akele, fix, sab devices par re-run, check jodna.</li>
</ul>
<h3>Kaun sa method, kab</h3>
<table class="cmp"><tr><th>Method</th><th>Mazboot baat</th><th>Kamzori</th><th>Kab use karein</th></tr><tr><td><code>split()</code></td><td>Bahut simple, import nahi</td><td>Do-shabd values aur naye columns par toot'ta hai</td><td>Quick kaam, fixed simple table</td></tr><tr><td>Regular expression</td><td>Kisi bhi text se ek precise value</td><td>Case, spacing, padhna mushkil</td><td>Ek value jaise version ya serial</td></tr><tr><td>Parser</td><td>Named fields, maintained, tested</td><td>Sirf un commands ke liye jinka parser hai</td><td>Tables aur jis par bharosa karna ho</td></tr><tr><td>JSON deti API</td><td>Parsing ki zaroorat nahi</td><td>Device support kare</td><td>Jab bhi ho</td></tr></table>
<h3>Python quick reference</h3>
<table class="cmp"><tr><th>Kaam</th><th>Code</th></tr><tr><td>Output ki lines</td><td><code>output.splitlines()</code></td></tr><tr><td>Line ke words</td><td><code>line.split()</code></td></tr><tr><td>Aakhri word</td><td><code>parts[-1]</code></td></tr><tr><td>Limited split</td><td><code>line.split(None, 1)</code></td></tr><tr><td>Pehla match ya None</td><td><code>re.search(r"Version (\\S+),", text)</code></td></tr><tr><td>Capture kiya text</td><td><code>m.group(1)</code></td></tr><tr><td>Named groups se dictionary</td><td><code>m.groupdict()</code></td></tr><tr><td>Saare matches</td><td><code>re.findall(r"\\d+", text)</code></td></tr><tr><td>Parser call</td><td><code>parse("show ip interface brief", output)</code></td></tr><tr><td>File likhna</td><td><code>with open("inventory.csv", "w") as f:</code></td></tr><tr><td>Chhupe characters dikhana</td><td><code>repr(text)</code></td></tr></table>
<h3>Mini glossary</h3>
<dl class="terms">
<dt>parsing</dt><dd>Insaanon ke text ko programs ke data mein badalna.</dd>
<dt>screen scraping</dt><dd>Command output ko plain text maan kar usse values nikalna.</dd>
<dt>split</dt><dd>String method jo text ko pieces ki list mein kaatta hai.</dd>
<dt>regular expression</dt><dd>Pattern jo dhoondhne ya nikalne ke liye text ka shape batata hai.</dd>
<dt>raw string</dt><dd>Aage r lagi string, jisme backslashes jaise hain waise rehte hain.</dd>
<dt>group</dt><dd>Pattern mein round brackets jo match ka ek hissa capture karte hain.</dd>
<dt>None</dt><dd>Woh value jo batati hai ki kuch nahi mila.</dd>
<dt>parser</dt><dd>Library jo jaane-pehchane command ke output ko dictionary ya list mein badalti hai.</dd>
<dt>CSV</dt><dd>Comma-separated values: rows ki text file jo spreadsheet kholti hai.</dd>
<dt>repr</dt><dd>Function jo value ko har chhupe character ke saath dikhata hai.</dd>
</dl>
<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li><code>splitlines()</code> lines deta hai; bina argument ka <code>split()</code> words deta hai aur repeated spaces ignore karta hai.</li>
<li><code>administratively down</code> do words hai; aakhri word <code>parts[-1]</code> phir bhi safe hai.</li>
<li><code>re.search</code> match object ya None return karta hai; None par <code>.group</code> AttributeError deta hai.</li>
<li>Regex case-sensitive hai: <code>version</code>, <code>Version</code> se match nahi karta.</li>
<li><code>group(1)</code> pehla bracket hai; <code>group(0)</code> poora match.</li>
<li>Parser dictionary (Genie style) ya dictionaries ki list (TextFSM) deta hai; lab ka <code>parse</code> <code>data["interface"][name][field]</code> deta hai.</li>
<li><code>open(..., "w")</code> file badal deta hai; <code>"a"</code> jodta hai.</li>
<li>Bina error ke khatam script mein bhi galat data ho sakta hai: result check karo.</li>
</ul>
<h3>Dono labs ek paragraph mein</h3>
<p><b>Lab 1, interfaces.</b> Administratively-down interface ki raw row mein 7 words hote hain. <code>up.py</code> sirf unke naam print karti hai jinka aakhri word <code>up</code> hai; <code>up2.py</code> <code>data = parse("show ip interface brief", output)</code> ke saath up/up interfaces IPs ke saath print karti hai, aur MUM-R2 par 4 hain.</p>
<p><b>Lab 2, inventory.</b> <code>inv.py</code> <code>AttributeError</code> se crash hoti hai kyunki pattern mein <code>version</code> hai jabki output mein <code>Version</code>. Fix ke baad serial pattern <code>Processor board ID (\\S+)</code> aur file write <code>inventory.csv</code> banate hain; BLR-WAN ka serial <code>NK45ZYX1X00</code> hai.</p>
<h3>Sab ko jodna</h3>
<p>Poori collection script ke chaar stages hote hain: SSH se text <b>collect</b> karo, use data mein <b>parse</b> karo, data ko JSON, YAML ya CSV mein <b>store</b> karo, aur <b>verify</b> karo ki result poora hai. Har stage fail ho sakta hai, isliye har stage ka check hota hai. Ab aapke paas us pipeline ke liye Python aur data-format ke skills hain.</p>
<div class="scn"><h4>Script jisne gayab router pakda</h4><p>Ek chhoti team har raat har branch router ka <code>show version</code> CSV mein parse karti thi. Ek subah report mein 42 ki jagah 41 rows thin. Row-count check ne job fail kar di aur us router ka naam bataya jisse koi match nahi mila. Us device par firmware label ki spelling alag thi, pattern mein ek line ka fix. Check ke bina gayab router agle audit mein pakda jaata.</p>
<p><b>Lesson:</b> collect, parse, store aur verify; check script ka hissa hai.</p></div>
<div class="iv"><p class="q">"Command output process karne ke liye split, regular expressions ya parser kab use karte ho?"</p><p>Simple fixed table par quick kaam ke liye split, un values se savdhaan jinme spaces hon. Jab free text se ek precise value chahiye, jaise version ya serial, tab regular expression, stable label par anchor karke. Tables aur jis par bharosa karna ho uske liye parser pasand karta hoon, kyunki woh named fields deta hai aur maintained hai. Jo bhi chunu, check karta hoon ki result poora hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Parsing CLI text ko lists aur dictionaries mein badalti hai; teen methods: split, regex, parser.</li>
<li>Split simple hai par do-shabd values par toot'ta hai; regex mein case aur labels ka dhyaan; parsers named fields dete hain.</li>
<li><code>search</code> match na milne par None deta hai, aur None par <code>.group</code> AttributeError hai.</li>
<li>Reports <code>open(..., "w")</code> ya <code>csv</code> module se likho aur share karne se pehle check karo.</li>
<li>Collect, parse, store, verify: result hamesha check karo.</li>
</ul></div>
`}};export{e as default};