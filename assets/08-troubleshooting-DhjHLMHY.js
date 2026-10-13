var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: a data file that will not load`,hi:`Troubleshooting workflow: data file jo load nahi hoti`},body:{en:`
<p>When automation fails, a surprising share of the time the cause is not the network and not the script logic. It is a <b>data file</b> with a small syntax mistake, or a data file that is valid but does not match what the code expects. This chapter gives you one workflow that works for JSON, YAML and XML, and uses the two labs as worked examples.</p>
<h3>The five-step workflow</h3>
<ol>
<li><b>Read the last line</b> of the traceback. Is it a *parse* error (<code>JSONDecodeError</code>, <code>YAMLError</code>, <code>ParseError</code>) or a *use* error (<code>KeyError</code>, <code>TypeError</code>)?</li>
<li><b>Parse errors:</b> run a validator and read the line and column. Fix one thing, validate again.</li>
<li><b>Use errors:</b> the file loaded. Print what you loaded and compare the real keys with the keys your code asks for.</li>
<li><b>Check the types:</b> a number that became text, a version that lost a zero, a <code>no</code> that became <code>False</code>.</li>
<li><b>Re-run the whole script</b> and check the output, not only the validator.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Two kinds of failure"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Parse error</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">file is not valid</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Use error</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">valid, wrong shape</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">Types</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">loaded as another type</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">Verify</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">run the script again</text></svg><p class="cap">Two kinds of failure</p></div>
<h3>Step 1: parse error or use error?</h3>
<p>The difference decides where to look. A parse error means the <b>file</b> is broken. A use error means the file is fine and the <b>code</b> is wrong. In lab 1 you met both in one ticket:</p>
<table class="cmp"><tr><th>Where it fails</th><th>Last line of the traceback</th><th>Meaning</th></tr><tr><td><code>json.load(f)</code></td><td><code>JSONDecodeError: Expecting value: line 15 column 18</code></td><td>The file is not valid JSON</td></tr><tr><td><code>dev['mgmt']</code></td><td><code>KeyError: 'mgmt'</code></td><td>The file is valid; the key is spelled differently</td></tr><tr><td><code>yaml.safe_load(f)</code></td><td><code>YAMLError: bad indentation of a sequence entry</code></td><td>The file is not valid YAML</td></tr></table>
<h3>Step 2: build a small checker</h3>
<p>You can wrap the loaders so that every error becomes a readable line with a position. This is a handy script to keep. Parse errors in the JSON module carry the position as <code>lineno</code> and <code>colno</code>; YAML errors carry a <code>problem_mark</code> that counts lines from zero.</p>
<pre class="code">import json
import yaml

def check_json(text):
    try:
        json.loads(text)
        return "JSON OK"
    except json.JSONDecodeError as e:
        return f"JSON error at line {e.lineno}, column {e.colno}: {e.msg}"

def check_yaml(text):
    try:
        yaml.safe_load(text)
        return "YAML OK"
    except yaml.YAMLError as e:
        mark = getattr(e, "problem_mark", None)
        where = f"line {mark.line + 1}, column {mark.column + 1}" if mark else "unknown position"
        return f"YAML error at {where}"

print(check_json('{"name": "R1", "vlans": [10, 20]}'))
print(check_json('{"name": "R1" "vlans": [10, 20]}'))
print(check_json("{'name': 'R1'}"))
print(check_yaml("vlans:\\n  - 10\\n  - 20\\n"))
print(check_yaml("vlans:\\n  - id: 10\\n    name: OFFICE\\n   - id: 20\\n"))</pre><p><i>Reference code (not run in the simulator). Output below is from standard Python 3.</i></p><pre class="out">JSON OK
JSON error at line 1, column 15: Expecting ',' delimiter
JSON error at line 1, column 2: Expecting property name enclosed in double quotes
YAML OK
YAML error at line 4, column 4</pre>
<p>The checker names the line and the column for each broken input. Notice that the missing comma between the two keys and the single-quoted keys are reported with a position, exactly like the lab validator.</p>
<h3>Step 3: valid, but wrong shape</h3>
<p>When the file loads and the code still fails, print the real structure. A pretty dump is the fastest way to see it:</p>
<pre class="code">import json

data = json.loads('{"devices": [{"name": "HYD-CORE1", "mgmt_ip": "10.99.0.1"}]}')
print(json.dumps(data, indent=2))
dev = data["devices"][0]
print(list(dev.keys()))
print(dev.get("mgmt"))
print(dev.get("mgmt_ip"))</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">{
  "devices": [
    {
      "name": "HYD-CORE1",
      "mgmt_ip": "10.99.0.1"
    }
  ]
}
['name', 'mgmt_ip']
None
10.99.0.1</pre>
<p><code>list(dev.keys())</code> shows the real key names, and <code>dev.get("mgmt")</code> returns <code>None</code> instead of crashing. Compare the names with the ones your code uses. This is exactly how the lab's <code>mgmt</code> versus <code>mgmt_ip</code> mismatch is found.</p>
<h3>Step 4: check the types after loading</h3>
<p>If a value looks right in the file but behaves wrongly in the script, print its type.</p>
<pre class="code">import json
import yaml

j = json.loads('{"vlan": "10", "enabled": "true"}')
y = yaml.safe_load('vlan: 10\\nenabled: true\\n')
print(j["vlan"] + j["vlan"])
print(y["vlan"] + y["vlan"])
print(type(j["enabled"]).__name__, type(y["enabled"]).__name__)</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">1010
20
str bool</pre>
<p>In JSON the quoted <code>"10"</code> is text, so adding it to itself glues the text together (<code>1010</code>). In YAML the unquoted <code>10</code> is a number, so the sum is <code>20</code>. And <code>"true"</code> in quotes is a string, while the unquoted <code>true</code> is a real boolean. When the numbers are off, look for quotes.</p>
<h3>Lab 1 and lab 2 as one checklist</h3>
<p><b>Lab 1 (JSON):</b> <code>json validate</code> showed a single-quote error on line 15, then a trailing comma before <code>}</code> on line 25 (the comma on line 24). After both were fixed the script still failed with <code>KeyError: 'mgmt'</code> because the key in the file is <code>mgmt_ip</code>. The second VLAN of the first device, <code>jq '.devices[0].vlans[1]' inventory.json</code>, is 20.</p>
<p><b>Lab 2 (YAML):</b> <code>yamllint vlans.yml</code> reported line 11, column 4: bad indentation of a sequence entry. After aligning the dash with the other items, <code>build.py</code> printed VLANs 10, 20 and 30 for both switches. Adding <code>- id: 40</code> / <code>name: GUEST</code> and a third switch changed only the data. <code>to_json.py</code> then wrote <code>vlans.json</code>, and <code>jq '.vlans[1].name' vlans.json</code> returned <code>"SCANNERS"</code>.</p>
<h3>Converting safely</h3>
<p>Conversion between formats is load in one module, dump in another. A good check is a <b>round trip</b>: dump to JSON, load it again, and compare with the original.</p>
<pre class="code">import json
import yaml

plan = yaml.safe_load("site: Nagpur-WH\\nvlans:\\n  - id: 10\\n    name: OFFICE\\n")
text = json.dumps(plan)
again = json.loads(text)
print(text)
print("Round trip identical:", plan == again)</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">{"site": "Nagpur-WH", "vlans": [{"id": 10, "name": "OFFICE"}]}
Round trip identical: True</pre>
<p>Differences you may notice: JSON has no comments, so YAML comments are lost; and a YAML value that was converted (<code>no</code> to <code>False</code>) is already converted before it reaches JSON.</p>
<h3>Tools to keep in your pocket</h3>
<table class="cmp"><tr><th>Tool</th><th>Use</th></tr><tr><td><code>python3 -m json.tool file.json</code></td><td>Validate and pretty-print JSON</td></tr><tr><td><code>jq '.path' file.json</code></td><td>Pull a value out of JSON</td></tr><tr><td><code>yamllint file.yml</code></td><td>Check YAML syntax and style</td></tr><tr><td><code>print(json.dumps(data, indent=2))</code></td><td>See the real structure inside Python</td></tr><tr><td><code>type(x)</code></td><td>See what type a value really has</td></tr></table>
<div class="warn"><p><b>Common mistakes.</b> (1) Fixing the validator's complaint and assuming the job is done, without re-running the script. (2) Editing the data to match the code when the code should change (or the other way around) without agreeing on which side is correct. (3) Ignoring the line <b>above</b> the reported line. (4) Trusting a value's appearance in the file rather than checking its type after loading.</p></div>
<div class="exam"><p><b>Exam trap.</b> A parse error and a <code>KeyError</code> are different problems. Parse errors point to the file; <code>KeyError</code> points to a mismatch between data and code. The exam may also ask which format forbids comments (JSON) and which forbids tabs (YAML).</p></div>
<div class="scn"><h4>Two errors, one ticket</h4><p>A monitoring team reported that the device table script "broke after a file edit". The first error was a JSON decode error caused by a trailing comma. The engineer fixed it and closed the ticket. An hour later the script failed again with a <code>KeyError</code>, because the same edit also renamed a key. Only a full re-run after the first fix would have caught it. The team added a step: validate, run, and compare the output to a known-good sample.</p>
<p><b>Lesson:</b> after every fix, run the whole script again; the first error often hides the second.</p></div>
<div class="iv"><p class="q">"A data file that worked yesterday now breaks your script. What do you do?"</p><p>I read the last line of the traceback to decide whether it is a parse error or a use error. For parse errors I run a validator to get the line and column and check the line above as well. For use errors I print the loaded structure and compare key names and types. Then I re-run the script end to end, because fixing one error can reveal another, and I add a validation step to the pipeline.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Decide first: parse error (the file) or use error (the code or the key names).</li>
<li>Validators report one mistake at a time; fix and repeat, and check the line above.</li>
<li>Print the structure with <code>json.dumps(data, indent=2)</code> and check <code>type(x)</code> when values misbehave.</li>
<li>Quotes change types in JSON and YAML; unquoted <code>no</code> and <code>1.10</code> surprise in YAML.</li>
<li>Re-run the full script after each fix.</li>
</ul></div>
`,hi:`
<p>Jab automation fail hoti hai, kaafi baar wajah na network hota hai na script ka logic. Wajah ek <b>data file</b> hoti hai jisme chhoti syntax galti hai, ya aisi data file jo valid hai lekin code ki umeed se match nahi karti. Yeh chapter JSON, YAML aur XML ke liye ek workflow deta hai, aur do labs ko worked examples ki tarah use karta hai.</p>
<h3>Paanch steps ka workflow</h3>
<ol>
<li>Traceback ki <b>aakhri line padho</b>. Yeh *parse* error hai (<code>JSONDecodeError</code>, <code>YAMLError</code>, <code>ParseError</code>) ya *use* error (<code>KeyError</code>, <code>TypeError</code>)?</li>
<li><b>Parse errors:</b> validator chalao aur line aur column padho. Ek cheez fix karo, dobara validate karo.</li>
<li><b>Use errors:</b> file load ho gayi. Jo load kiya use print karo aur asli keys ko code ki maangi hui keys se compare karo.</li>
<li><b>Types check karo:</b> number jo text ban gaya, version jisne zero kho diya, <code>no</code> jo <code>False</code> ban gaya.</li>
<li><b>Poori script dobara chalao</b> aur output check karo, sirf validator nahi.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Do tarah ki failure"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Parse error</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">file valid nahi</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Use error</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">valid, galat shape</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">Types</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">doosre type mein load hui</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">Verify</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">script dobara chalao</text></svg><p class="cap">Do tarah ki failure</p></div>
<h3>Step 1: parse error ya use error?</h3>
<p>Fark tay karta hai ki kahan dekhna hai. Parse error ka matlab <b>file</b> toot gayi hai. Use error ka matlab file theek hai aur <b>code</b> galat hai. Lab 1 mein ek hi ticket mein dono mile:</p>
<table class="cmp"><tr><th>Kahan fail hota hai</th><th>Traceback ki aakhri line</th><th>Matlab</th></tr><tr><td><code>json.load(f)</code></td><td><code>JSONDecodeError: Expecting value: line 15 column 18</code></td><td>File valid JSON nahi hai</td></tr><tr><td><code>dev['mgmt']</code></td><td><code>KeyError: 'mgmt'</code></td><td>File valid hai; key ki spelling alag hai</td></tr><tr><td><code>yaml.safe_load(f)</code></td><td><code>YAMLError: bad indentation of a sequence entry</code></td><td>File valid YAML nahi hai</td></tr></table>
<h3>Step 2: chhota checker banao</h3>
<p>Aap loaders ko lapet sakte ho taaki har error position ke saath padhne layak line ban jaaye. Yeh rakhne layak script hai. JSON module ki parse errors position <code>lineno</code> aur <code>colno</code> ke roop mein deti hain; YAML errors <code>problem_mark</code> deti hain jo lines ko zero se ginta hai.</p>
<pre class="code">import json
import yaml

def check_json(text):
    try:
        json.loads(text)
        return "JSON OK"
    except json.JSONDecodeError as e:
        return f"JSON error at line {e.lineno}, column {e.colno}: {e.msg}"

def check_yaml(text):
    try:
        yaml.safe_load(text)
        return "YAML OK"
    except yaml.YAMLError as e:
        mark = getattr(e, "problem_mark", None)
        where = f"line {mark.line + 1}, column {mark.column + 1}" if mark else "unknown position"
        return f"YAML error at {where}"

print(check_json('{"name": "R1", "vlans": [10, 20]}'))
print(check_json('{"name": "R1" "vlans": [10, 20]}'))
print(check_json("{'name': 'R1'}"))
print(check_yaml("vlans:\\n  - 10\\n  - 20\\n"))
print(check_yaml("vlans:\\n  - id: 10\\n    name: OFFICE\\n   - id: 20\\n"))</pre><p><i>Reference code (simulator mein nahi chalta). Neeche ka output standard Python 3 ka hai.</i></p><pre class="out">JSON OK
JSON error at line 1, column 15: Expecting ',' delimiter
JSON error at line 1, column 2: Expecting property name enclosed in double quotes
YAML OK
YAML error at line 4, column 4</pre>
<p>Checker har toote input ke liye line aur column batata hai. Dhyaan do ki do keys ke beech ka missing comma aur single-quoted keys position ke saath report hoti hain, bilkul lab validator ki tarah.</p>
<h3>Step 3: valid, lekin galat shape</h3>
<p>File load ho jaaye aur code phir bhi fail ho, to asli structure print karo. Pretty dump dekhne ka sabse tez tareeka hai:</p>
<pre class="code">import json

data = json.loads('{"devices": [{"name": "HYD-CORE1", "mgmt_ip": "10.99.0.1"}]}')
print(json.dumps(data, indent=2))
dev = data["devices"][0]
print(list(dev.keys()))
print(dev.get("mgmt"))
print(dev.get("mgmt_ip"))</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">{
  "devices": [
    {
      "name": "HYD-CORE1",
      "mgmt_ip": "10.99.0.1"
    }
  ]
}
['name', 'mgmt_ip']
None
10.99.0.1</pre>
<p><code>list(dev.keys())</code> asli key names dikhata hai, aur <code>dev.get("mgmt")</code> crash ki jagah <code>None</code> deta hai. Naamon ko apne code ke naamon se compare karo. Lab ka <code>mgmt</code> vs <code>mgmt_ip</code> mismatch isi tarah pakda jaata hai.</p>
<h3>Step 4: load ke baad types check karo</h3>
<p>Value file mein sahi dikhe aur script mein galat chale, to uska type print karo.</p>
<pre class="code">import json
import yaml

j = json.loads('{"vlan": "10", "enabled": "true"}')
y = yaml.safe_load('vlan: 10\\nenabled: true\\n')
print(j["vlan"] + j["vlan"])
print(y["vlan"] + y["vlan"])
print(type(j["enabled"]).__name__, type(y["enabled"]).__name__)</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">1010
20
str bool</pre>
<p>JSON mein quoted <code>"10"</code> text hai, isliye use khud se jodne par text chipak jaata hai (<code>1010</code>). YAML mein unquoted <code>10</code> number hai, isliye jod <code>20</code> hai. Aur quotes wala <code>"true"</code> string hai, jabki unquoted <code>true</code> asli boolean hai. Numbers galat ho to quotes dhoondho.</p>
<h3>Lab 1 aur lab 2 ek checklist ki tarah</h3>
<p><b>Lab 1 (JSON):</b> <code>json validate</code> ne line 15 par single-quote error dikhayi, phir line 25 par <code>}</code> se pehle trailing comma (comma line 24 par). Dono fix hone ke baad bhi script <code>KeyError: 'mgmt'</code> se fail hui kyunki file mein key <code>mgmt_ip</code> hai. Pehle device ka doosra VLAN, <code>jq '.devices[0].vlans[1]' inventory.json</code>, 20 hai.</p>
<p><b>Lab 2 (YAML):</b> <code>yamllint vlans.yml</code> ne line 11, column 4 report kiya: bad indentation of a sequence entry. Dash ko baaki items ke saath align karne ke baad <code>build.py</code> ne dono switches ke liye VLANs 10, 20 aur 30 print kiye. <code>- id: 40</code> / <code>name: GUEST</code> aur teesra switch jodne se sirf data badla. Phir <code>to_json.py</code> ne <code>vlans.json</code> likhi, aur <code>jq '.vlans[1].name' vlans.json</code> ne <code>"SCANNERS"</code> diya.</p>
<h3>Safely convert karna</h3>
<p>Formats ke beech conversion ek module mein load aur doosre mein dump hai. Achha check <b>round trip</b> hai: JSON mein dump karo, wapas load karo, aur original se compare karo.</p>
<pre class="code">import json
import yaml

plan = yaml.safe_load("site: Nagpur-WH\\nvlans:\\n  - id: 10\\n    name: OFFICE\\n")
text = json.dumps(plan)
again = json.loads(text)
print(text)
print("Round trip identical:", plan == again)</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">{"site": "Nagpur-WH", "vlans": [{"id": 10, "name": "OFFICE"}]}
Round trip identical: True</pre>
<p>Jo farak dikh sakte hain: JSON mein comments nahi hote, isliye YAML comments kho jaate hain; aur jo YAML value convert ho gayi (<code>no</code> se <code>False</code>) woh JSON tak pahunchne se pehle hi convert ho chuki hoti hai.</p>
<h3>Jeb mein rakhne ke tools</h3>
<table class="cmp"><tr><th>Tool</th><th>Kaam</th></tr><tr><td><code>python3 -m json.tool file.json</code></td><td>JSON validate aur pretty-print</td></tr><tr><td><code>jq '.path' file.json</code></td><td>JSON se value nikalna</td></tr><tr><td><code>yamllint file.yml</code></td><td>YAML syntax aur style check</td></tr><tr><td><code>print(json.dumps(data, indent=2))</code></td><td>Python ke andar asli structure dekho</td></tr><tr><td><code>type(x)</code></td><td>Dekho value ka asli type kya hai</td></tr></table>
<div class="warn"><p><b>Common mistakes.</b> (1) Validator ki shikayat fix karke maan lena ki kaam ho gaya, bina script dobara chalaye. (2) Jab code badalna chahiye tab data ko code se match karne ke liye edit karna (ya ulta) bina yeh tay kiye ki kaun sa side sahi hai. (3) Reported line ke <b>upar</b> ki line ignore karna. (4) Load ke baad type check karne ki jagah file mein value ki shakal par bharosa karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Parse error aur <code>KeyError</code> alag problems hain. Parse errors file ki taraf ishara karte hain; <code>KeyError</code> data aur code ke mismatch ki taraf. Exam yeh bhi pooch sakta hai ki kaun sa format comments forbid karta hai (JSON) aur kaun tabs (YAML).</p></div>
<div class="scn"><h4>Do errors, ek ticket</h4><p>Monitoring team ne report kiya ki device table script "file edit ke baad toot gayi". Pehli error trailing comma se bani JSON decode error thi. Engineer ne fix karke ticket band kar diya. Ek ghante baad script <code>KeyError</code> se phir fail hui, kyunki usi edit ne ek key ka naam bhi badal diya tha. Pehle fix ke baad poori run se hi yeh pakda jaata. Team ne ek step jodi: validate karo, chalao, aur output ko known-good sample se compare karo.</p>
<p><b>Lesson:</b> har fix ke baad poori script dobara chalao; pehli error aksar doosri ko chhupa leti hai.</p></div>
<div class="iv"><p class="q">"Data file jo kal chalti thi aaj aapki script tod rahi hai. Aap kya karoge?"</p><p>Main traceback ki aakhri line padhkar tay karta hoon ki parse error hai ya use error. Parse errors ke liye validator se line aur column nikalta hoon aur upar ki line bhi dekhta hoon. Use errors ke liye load kiya structure print karke key names aur types compare karta hoon. Phir script ko end to end dobara chalata hoon, kyunki ek error fix karne se doosri dikh sakti hai, aur pipeline mein validation step jodta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle tay karo: parse error (file) ya use error (code ya key names).</li>
<li>Validators ek baar mein ek galti report karte hain; fix aur dohrao, aur upar ki line bhi dekho.</li>
<li>Value ajeeb chale to <code>json.dumps(data, indent=2)</code> se structure print karo aur <code>type(x)</code> check karo.</li>
<li>JSON aur YAML mein quotes type badalte hain; YAML mein unquoted <code>no</code> aur <code>1.10</code> hairaan karte hain.</li>
<li>Har fix ke baad poori script dobara chalao.</li>
</ul></div>
`}};export{e as default};