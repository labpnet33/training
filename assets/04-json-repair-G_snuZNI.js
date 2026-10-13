var e={id:`json-repair`,h:{en:`Repairing broken JSON: validate, fix, query with jq`,hi:`Toota hua JSON repair karna: validate, fix, jq se query`},body:{en:`
<p>This chapter follows lab 1 step by step. The story: Deccan Net keeps its Hyderabad device list in <code>inventory.json</code>, and <code>show_inv.py</code> prints it as a table for the NOC. Someone edited the file by hand and now nothing can read it. You will find the mistakes with a validator, fix them, repair a wrong key name in the script, and then ask the file questions with <code>jq</code>.</p>
<h3>The file and the symptom</h3>
<p>The file describes three devices. These are the lines that matter in the broken version (line numbers on the left come from the lab command <code>nl</code>):</p>
<pre class="out">    13        "name": "HYD-EDGE1",
    14        "role": "edge",
    15        "mgmt_ip": <span class="hl">'10.99.0.2'</span>,
    16        "vlans": [99],
    ...
    23        "vlans": [10, 20],
    24        "managed": false<span class="hl">,</span>
    25      }</pre>
<p>Running the script gives the Python view of the problem:</p>
<pre class="out">AUTO&gt; python3 show_inv.py
Traceback (most recent call last):
  File "show_inv.py", line 6, in &lt;module&gt;
    inv = json.load(f)
json.decoder.JSONDecodeError: Expecting value: line 15 column 18 (char 282)</pre>
<p>The last line is exactly what you learned to read: the class is <code>JSONDecodeError</code>, and Python points to line 15, column 18.</p>
<h3>Use a validator</h3>
<p>A <b>validator</b> checks a file against the rules and reports the first problem. The lab has a command <code>json validate</code>. On a real computer you can use <code>python3 -m json.tool inventory.json</code> (it prints the file if valid, otherwise an error with the line) or an editor with JSON support.</p>
<pre class="out">AUTO&gt; json validate inventory.json
inventory.json: INVALID JSON
  line 15, column 18: strings must use double quotes ("), not single quotes (')
   15 |       "mgmt_ip": '10.99.0.2',
      |                  ^</pre>
<p>The caret points at the single quote. Fix line 15 so the value uses double quotes, keeping the same indentation (6 spaces). In the lab you use <code>edit inventory.json 15 ...</code> to replace a line. Then validate again.</p>
<pre class="out">AUTO&gt; json validate inventory.json
inventory.json: INVALID JSON
  line 25, column 5: trailing comma is not allowed before '}'
   25 |     }
      |     ^</pre>
<p>The first error is gone; the validator now finds the next one. A tool reports <b>one mistake at a time</b>, so you repeat until the file is clean. The message says the comma is "before }", meaning the comma is on the line <b>above</b>, line 24 (<code>"managed": false,</code>). Remove it.</p>
<pre class="out">AUTO&gt; json validate inventory.json
inventory.json: valid JSON (object with 3 top-level key(s): company, site, devices)</pre>
<p>Valid JSON now. Always keep all three devices: the lab check expects the third one (<code>HYD-ACC1</code>, with <code>"managed": false</code>) to still be present.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="The repair loop"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Validate</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">run the checker</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Read</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">line and message</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">Fix</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">one mistake</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">Repeat</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">until valid</text></svg><p class="cap">The repair loop</p></div>
<h3>Valid JSON is not the same as working code</h3>
<p>Run the script again. JSON now loads, but a different error appears, this time in the script:</p>
<pre class="out">AUTO&gt; python3 show_inv.py
Company: Deccan Net | Site: Hyderabad
NAME        ROLE    MGMT IP       VLANS
Traceback (most recent call last):
  File "show_inv.py", line 12, in &lt;module&gt;
    print(f"{dev['name']:&lt;12}{dev['role']:&lt;8}{dev['mgmt']:&lt;14}{dev['vlans']}")
KeyError: <span class="hl">'mgmt'</span></pre>
<p>The data is correct. The script asks for a key <code>mgmt</code> but the file calls it <code>mgmt_ip</code>. <code>KeyError: 'mgmt'</code> is the dictionary telling you it has no such key. The cure is to make the script use the real key name. In the lab: <code>sed -i "s/'mgmt'/'mgmt_ip'/" show_inv.py</code>, a command that replaces text in a file.</p>
<pre class="out">AUTO&gt; python3 show_inv.py
Company: Deccan Net | Site: Hyderabad
NAME        ROLE    MGMT IP       VLANS
HYD-CORE1   core    10.99.0.1     [10, 20, 30]
HYD-EDGE1   edge    10.99.0.2     [99]
HYD-ACC1    access  10.99.0.11    [10, 20]</pre>
<h3>Ask the file questions with jq</h3>
<p><code>jq</code> is a command-line tool for reading JSON. You give it a path and it prints the value. The dot <code>.</code> means "the whole document", and you follow it with keys and indexes, just like Python.</p>
<pre class="out">AUTO&gt; jq '.devices[0].vlans[1]' inventory.json
20</pre>
<p>Read the path: <code>.devices</code> is the array, <code>[0]</code> is the first device (HYD-CORE1), <code>.vlans</code> is its list <code>[10, 20, 30]</code>, and <code>[1]</code> is the <b>second</b> item because counting starts at 0. The answer is 20.</p>
<p>Common patterns you can use on the same file: <code>jq '.site' inventory.json</code> prints <code>"Hyderabad"</code>, <code>jq '.devices[].name' inventory.json</code> prints the name of every device, and <code>jq '.devices | length' inventory.json</code> prints 3.</p>
<p>The same job in Python needs one more line, and gives you the same answer:</p>
<pre class="code">import json

inv = json.loads('{"devices": [{"name": "HYD-CORE1", "vlans": [10, 20, 30]}, {"name": "HYD-EDGE1", "vlans": [99]}]}')
print(inv["devices"][0]["vlans"][1])
print([d["name"] for d in inv["devices"]])
print(len(inv["devices"]))</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">20
['HYD-CORE1', 'HYD-EDGE1']
2</pre>
<h3>A checklist for a file that will not load</h3>
<ol>
<li>Run the validator and read the line and column.</li>
<li>Look at the reported line <b>and the line above</b>.</li>
<li>Check quotes, then commas (missing between items, extra after the last), then brackets.</li>
<li>Fix one thing, validate again.</li>
<li>When the file loads, check names: does the key in the code match the key in the data?</li>
</ol>
<div class="warn"><p><b>Common mistakes.</b> (1) Fixing the wrong line because the error is reported <b>after</b> the real mistake, for example a missing comma at the end of the previous line. (2) Deleting a whole device to make the file valid, which silently loses data. (3) Assuming valid JSON means correct data. (4) Editing the file in a word processor that turns straight quotes into curly quotes, which JSON rejects.</p></div>
<div class="exam"><p><b>Exam trap.</b> A JSON file with a trailing comma is <b>invalid</b>, even though Python lists allow it. The same is true for single quotes and comments.</p></div>
<div class="scn"><h4>The curly quotes</h4><p>An engineer pasted a snippet from a chat window into a JSON file. The chat app had changed <code>"</code> into curly quotes. The validator reported an error at the first quote of the first key, which looked perfectly fine on screen. Retyping the quotes in a code editor fixed it, and the team added a validation step before every commit.</p>
<p><b>Lesson:</b> look at the exact character the validator points to, not only at what looks right.</p></div>
<div class="iv"><p class="q">"A teammate's JSON file fails to load. How do you debug it?"</p><p>I run a validator or <code>python3 -m json.tool</code> to get the line and column, check the line and the one above it for single quotes, missing or trailing commas and unclosed brackets, fix one error at a time, and re-run. Once it loads I verify that the keys my code uses match the keys in the data, using <code>jq</code> to inspect the structure.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A validator reports the first mistake; repeat until the file is valid.</li>
<li>The reported line may be just after the real mistake; also check the line above.</li>
<li>Valid JSON can still be wrong data or mismatch the code's key names.</li>
<li><code>KeyError</code> means the code asked for a key that the data does not have.</li>
<li><code>jq '.devices[0].vlans[1]'</code> follows keys and indexes; index counting starts at 0.</li>
</ul></div>
`,hi:`
<p>Yeh chapter lab 1 ko step by step follow karta hai. Kahani: Deccan Net apni Hyderabad device list <code>inventory.json</code> mein rakhta hai, aur <code>show_inv.py</code> NOC ke liye use table ki tarah print karti hai. Kisi ne file haath se edit ki aur ab koi use padh nahi pa raha. Aap validator se galtiyan dhoondhoge, fix karoge, script ki galat key naam sudharoge, aur phir <code>jq</code> se file se sawaal poochhoge.</p>
<h3>File aur lakshan</h3>
<p>File teen devices describe karti hai. Toote hue version ki kaam ki lines yeh hain (baayein taraf ke line numbers lab command <code>nl</code> se aate hain):</p>
<pre class="out">    13        "name": "HYD-EDGE1",
    14        "role": "edge",
    15        "mgmt_ip": <span class="hl">'10.99.0.2'</span>,
    16        "vlans": [99],
    ...
    23        "vlans": [10, 20],
    24        "managed": false<span class="hl">,</span>
    25      }</pre>
<p>Script chalane par problem ka Python wala nazariya milta hai:</p>
<pre class="out">AUTO&gt; python3 show_inv.py
Traceback (most recent call last):
  File "show_inv.py", line 6, in &lt;module&gt;
    inv = json.load(f)
json.decoder.JSONDecodeError: Expecting value: line 15 column 18 (char 282)</pre>
<p>Aakhri line bilkul wahi hai jo aapne padhna seekha: class <code>JSONDecodeError</code> hai, aur Python line 15, column 18 batata hai.</p>
<h3>Validator use karo</h3>
<p><b>Validator</b> file ko rules se check karke pehli problem report karta hai. Lab mein command <code>json validate</code> hai. Asli computer par aap <code>python3 -m json.tool inventory.json</code> use kar sakte ho (valid ho to file print karta hai, warna line ke saath error) ya JSON support wala editor.</p>
<pre class="out">AUTO&gt; json validate inventory.json
inventory.json: INVALID JSON
  line 15, column 18: strings must use double quotes ("), not single quotes (')
   15 |       "mgmt_ip": '10.99.0.2',
      |                  ^</pre>
<p>Caret single quote par ishara karta hai. Line 15 fix karo taaki value double quotes use kare, wahi indentation (6 spaces) rakhte hue. Lab mein line badalne ke liye <code>edit inventory.json 15 ...</code> use karte ho. Phir dobara validate karo.</p>
<pre class="out">AUTO&gt; json validate inventory.json
inventory.json: INVALID JSON
  line 25, column 5: trailing comma is not allowed before '}'
   25 |     }
      |     ^</pre>
<p>Pehli error chali gayi; validator ab agli dhoondhta hai. Tool <b>ek baar mein ek galti</b> report karta hai, isliye file saaf hone tak dohrao. Message kehta hai comma "before }" hai, matlab comma <b>upar ki line</b> par hai, line 24 (<code>"managed": false,</code>). Use hatao.</p>
<pre class="out">AUTO&gt; json validate inventory.json
inventory.json: valid JSON (object with 3 top-level key(s): company, site, devices)</pre>
<p>Ab valid JSON. Teeno devices hamesha rakho: lab check chahta hai ki teesra (<code>HYD-ACC1</code>, <code>"managed": false</code> ke saath) abhi bhi maujood ho.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Repair loop"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Validate</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">checker chalao</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Padho</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">line aur message</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">Fix</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">ek galti</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">Dohrao</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">valid hone tak</text></svg><p class="cap">Repair loop</p></div>
<h3>Valid JSON ka matlab working code nahi</h3>
<p>Script dobara chalao. JSON ab load hota hai, lekin ek alag error aati hai, is baar script mein:</p>
<pre class="out">AUTO&gt; python3 show_inv.py
Company: Deccan Net | Site: Hyderabad
NAME        ROLE    MGMT IP       VLANS
Traceback (most recent call last):
  File "show_inv.py", line 12, in &lt;module&gt;
    print(f"{dev['name']:&lt;12}{dev['role']:&lt;8}{dev['mgmt']:&lt;14}{dev['vlans']}")
KeyError: <span class="hl">'mgmt'</span></pre>
<p>Data sahi hai. Script key <code>mgmt</code> maangti hai lekin file usse <code>mgmt_ip</code> kehti hai. <code>KeyError: 'mgmt'</code> dictionary ka kehna hai ki uske paas aisi key nahi. Ilaaj hai script ko asli key naam use karwana. Lab mein: <code>sed -i "s/'mgmt'/'mgmt_ip'/" show_inv.py</code>, jo file mein text badalne wala command hai.</p>
<pre class="out">AUTO&gt; python3 show_inv.py
Company: Deccan Net | Site: Hyderabad
NAME        ROLE    MGMT IP       VLANS
HYD-CORE1   core    10.99.0.1     [10, 20, 30]
HYD-EDGE1   edge    10.99.0.2     [99]
HYD-ACC1    access  10.99.0.11    [10, 20]</pre>
<h3>jq se file se sawaal poochho</h3>
<p><code>jq</code> JSON padhne ka command-line tool hai. Aap use path dete ho aur woh value print karta hai. Dot <code>.</code> ka matlab "poora document", aur uske baad keys aur indexes Python ki tarah follow karte ho.</p>
<pre class="out">AUTO&gt; jq '.devices[0].vlans[1]' inventory.json
20</pre>
<p>Path padho: <code>.devices</code> array hai, <code>[0]</code> pehla device (HYD-CORE1), <code>.vlans</code> uski list <code>[10, 20, 30]</code>, aur <code>[1]</code> <b>doosra</b> item hai kyunki ginti 0 se shuru hoti hai. Jawab 20.</p>
<p>Isi file par common patterns: <code>jq '.site' inventory.json</code> <code>"Hyderabad"</code> print karta hai, <code>jq '.devices[].name' inventory.json</code> har device ka naam, aur <code>jq '.devices | length' inventory.json</code> 3 print karta hai.</p>
<p>Wahi kaam Python mein ek line zyada leta hai, aur wahi jawab deta hai:</p>
<pre class="code">import json

inv = json.loads('{"devices": [{"name": "HYD-CORE1", "vlans": [10, 20, 30]}, {"name": "HYD-EDGE1", "vlans": [99]}]}')
print(inv["devices"][0]["vlans"][1])
print([d["name"] for d in inv["devices"]])
print(len(inv["devices"]))</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">20
['HYD-CORE1', 'HYD-EDGE1']
2</pre>
<h3>Jo file load na ho uski checklist</h3>
<ol>
<li>Validator chalao aur line aur column padho.</li>
<li>Reported line <b>aur uske upar ki line</b> dekho.</li>
<li>Pehle quotes, phir commas (items ke beech missing, aakhri ke baad extra), phir brackets check karo.</li>
<li>Ek cheez fix karo, dobara validate karo.</li>
<li>File load ho jaaye to naam check karo: code ki key data ki key se match karti hai?</li>
</ol>
<div class="warn"><p><b>Common mistakes.</b> (1) Galat line fix karna kyunki error asli galti ke <b>baad</b> report hoti hai, jaise pichhli line ke end ka missing comma. (2) File valid banane ke liye poora device delete karna, jo chupchaap data kho deta hai. (3) Maan lena ki valid JSON ka matlab sahi data hai. (4) File ko aise word processor mein edit karna jo straight quotes ko curly quotes bana deta hai, jo JSON reject karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Trailing comma wali JSON file <b>invalid</b> hai, bhale hi Python lists use allow karti hain. Single quotes aur comments ke liye bhi yahi sach hai.</p></div>
<div class="scn"><h4>Curly quotes</h4><p>Ek engineer ne chat window se snippet JSON file mein paste kiya. Chat app ne <code>"</code> ko curly quotes mein badal diya tha. Validator ne pehli key ke pehle quote par error di, jo screen par bilkul theek dikhta tha. Code editor mein quotes dobara type karne se fix hua, aur team ne har commit se pehle validation step jod diya.</p>
<p><b>Lesson:</b> validator jis exact character par ishara kare use dekho, sirf woh nahi jo sahi dikhta hai.</p></div>
<div class="iv"><p class="q">"Teammate ki JSON file load nahi hoti. Debug kaise karoge?"</p><p>Main validator ya <code>python3 -m json.tool</code> chalakar line aur column nikalta hoon, us line aur uske upar ki line mein single quotes, missing ya trailing commas aur unclosed brackets check karta hoon, ek ek error fix karta hoon, aur dobara chalata hoon. File load hone par verify karta hoon ki mere code ki keys data ki keys se match karti hain, structure dekhne ke liye <code>jq</code> use karke.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Validator pehli galti report karta hai; file valid hone tak dohrao.</li>
<li>Reported line asli galti ke thik baad ho sakti hai; upar ki line bhi dekho.</li>
<li>Valid JSON phir bhi galat data ya code ki key naamon se mismatch ho sakta hai.</li>
<li><code>KeyError</code> ka matlab code ne aisi key maangi jo data mein nahi.</li>
<li><code>jq '.devices[0].vlans[1]'</code> keys aur indexes follow karta hai; index ginti 0 se shuru.</li>
</ul></div>
`}};export{e as default};