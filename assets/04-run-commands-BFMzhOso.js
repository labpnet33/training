var e=String.raw`<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="run_commands builds one request">
<rect x="10" y="30" width="170" height="110" rx="8" fill="#ddd6fe"/><text x="95" y="52" text-anchor="middle" class="svg-ink" font-size="13">Your call</text><text x="22" y="76" class="svg-ink" font-size="12">run_commands(</text><text x="34" y="94" class="svg-ink" font-size="12">["show hostname",</text><text x="34" y="112" class="svg-ink" font-size="12">"show clock"])</text>
<rect x="235" y="30" width="170" height="110" rx="8" fill="#fde68a"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="13">One request</text><text x="247" y="76" class="svg-ink" font-size="12">1 enable</text><text x="247" y="94" class="svg-ink" font-size="12">2 show hostname</text><text x="247" y="112" class="svg-ink" font-size="12">3 show clock</text>
<rect x="460" y="30" width="170" height="110" rx="8" fill="#bbf7d0"/><text x="545" y="52" text-anchor="middle" class="svg-ink" font-size="13">Your answer</text><text x="472" y="76" class="svg-ink" font-size="12">[ {hostname...},</text><text x="472" y="94" class="svg-ink" font-size="12">  {clock...} ]</text><text x="472" y="118" class="svg-muted" font-size="11">enable's result is cut off</text>
<line x1="180" y1="85" x2="235" y2="85" stroke="#64748b" stroke-width="2"/><line x1="405" y1="85" x2="460" y2="85" stroke="#64748b" stroke-width="2"/>
</svg></div>
<p class="cap">The Node adds <code>enable</code> in front, sends everything as one request, and hands back only your results.</p>`,t=String.raw`<pre class="code"><span class="c"># d_run.py - lists, encodings and enable()</span>
import pyeapi

node = pyeapi.connect_to("leaf1")
print(node.run_commands(["show hostname", "show clock"]))
print(node.run_commands("show clock", encoding="text"))
for r in node.enable(["show hostname", "show running-config section Loopback"]):
    print(r["command"], "->", r["encoding"])
print(node.enable("show clock")[0])</pre>
<pre class="out">AUTO01$ python3 d_run.py
[{'fqdn': 'LEAF1', 'hostname': 'LEAF1'}, {'utcTime': 1791720190, 'timezone': 'UTC', 'localTime': {'year': 2026, 'month': 10, 'dayOfMonth': 11, 'dayOfWeek': 6, 'hour': 12, 'min': 3, 'sec': 10, 'daylightSavingsAdjust': 0}, 'clockSource': {'local': True}}]
[{'output': 'Sun Oct 11 12:03:10 2026\nTimezone: UTC\nClock source: local\n'}]
show hostname -> json
show running-config section Loopback -> <span class="hl">text</span>
{'command': 'show clock', 'result': {'utcTime': 1791720190, 'timezone': 'UTC', 'localTime': {'year': 2026, 'month': 10, 'dayOfMonth': 11, 'dayOfWeek': 6, 'hour': 12, 'min': 3, 'sec': 10, 'daylightSavingsAdjust': 0}, 'clockSource': {'local': True}}, 'encoding': 'json'}</pre>`,n=String.raw`<pre class="code"><span class="c"># d_json.py - walk the structured answer instead of cutting up text</span>
import pyeapi

node = pyeapi.connect_to("leaf1")
data = node.run_commands("show vlan")[0]
print(sorted(data))
for vid, vlan in sorted(data["vlans"].items(), key=lambda kv: int(kv[0])):
    print(vid, vlan["name"], vlan["status"])
status = node.run_commands("show interfaces status")[0]["interfaceStatuses"]
for name in sorted(status)[:3]:
    print(name, status[name]["linkStatus"], status[name]["description"])</pre>
<pre class="out">AUTO01$ python3 d_json.py
['sourceDetail', 'vlans']
1 default active
Ethernet1 connected 
Ethernet2 connected to-LEAF2
Ethernet3 notconnect </pre>`,r=String.raw`<pre class="code"><span class="c"># d_strict.py - a command with no JSON model</span>
import pyeapi
from pyeapi.eapilib import CommandError

node = pyeapi.connect_to("leaf1")
try:
    node.run_commands("show running-config")
except CommandError as err:
    print("CommandError:", err.error_code, err.error_text)
print(node.run_commands("show running-config", encoding="text")[0]["output"].splitlines()[0])
result = node.enable("show running-config")[0]
print(result["encoding"], len(result["result"]["output"].splitlines()) > 5)
try:
    node.enable("show running-config", strict=True)
except CommandError as err:
    print("strict ->", err)</pre>
<pre class="out">AUTO01$ python3 d_strict.py
CommandError: <span class="hl">1003</span> CLI command 2 of 2 'show running-config' failed: unconverted command
! Command: show running-config
text True
strict -> Error [1003]: CLI command 2 of 2 'show running-config' failed: unconverted command [This is an unconverted command]</pre>`,i={id:`run-commands`,h:{en:`run_commands: lists, encodings and enable()`,hi:`run_commands: lists, encodings aur enable()`},body:{en:`
<p><code>run_commands</code> is the one method everything else in pyeapi is built on. If you understand its input and output, <code>config</code>, <code>get_config</code> and the api modules stop being magic. The demos here come from the Lab 1 topology after step 2.</p>

<h3>What it sends and what it returns</h3>
`+e+`
<p>The argument is a command string or a list of strings. The return value is always a <b>list</b>, one item per command you passed, in the same order. For <code>encoding="json"</code> (the default) each item is a dictionary. For <code>encoding="text"</code> each item is <code>{"output": "..."}</code>, the same text you would see at the CLI.</p>
`+t+`
<ul>
<li>One string still returns a list. Use <code>[0]</code> to get the dictionary, as in <code>run_commands("show hostname")[0]</code>.</li>
<li>The <code>enable</code> that pyeapi puts first is not in your result list. It still counts in error messages, so "command 2 of 2" can mean your first command.</li>
<li><code>node.enable()</code> is the richer cousin. It returns dictionaries with <code>command</code>, <code>result</code> and <code>encoding</code>, so you can see what format each command really used.</li>
</ul>

<h3>Work with the structure, not with text</h3>
<p>JSON output means no <code>split()</code>, no regular expressions and no breakage when a column gets wider. Navigate by key. In <code>show vlan</code> the VLAN ids are the <i>string</i> keys of <code>vlans</code>, which is why the code sorts with <code>key=int</code>.</p>
`+n+`
<div class="note"><p><b>Tip.</b> Not sure what keys a command has? Run it once at the CLI with <code>| json</code> (for example <code>show vlan | json</code>) and read the keys. The eAPI answer is exactly that JSON.</p></div>

<h3>Commands without a JSON model</h3>
<p>Many <code>show</code> commands, <code>show running-config</code> among them, have no structured form. Asked in <code>json</code>, EOS answers error <b>1003</b>, "unconverted command". You have three choices.</p>
<table class="cmp"><tr><th>Choice</th><th>How</th><th>You get</th></tr>
<tr><td>Ask for text</td><td><code>run_commands(cmd, encoding="text")</code></td><td><code>[{"output": "..."}]</code> every time</td></tr>
<tr><td>Let enable() fall back</td><td><code>node.enable(cmd)</code></td><td>JSON when possible, otherwise text; <code>encoding</code> tells which</td></tr>
<tr><td>Fail loudly</td><td><code>node.enable(cmd, strict=True)</code></td><td><code>CommandError</code> 1003, no fallback</td></tr></table>
`+r+`
<p>Use <code>strict=True</code> in a monitoring script that must not quietly change shape: a command that stops returning JSON should be an alert, not a silently different dictionary.</p>

<div class="warn"><p><b>Common mistake.</b> Treating <code>run_commands("show vlan")</code> as the dictionary. It is a list holding the dictionary. The error <code>TypeError: list indices must be integers or slices, not str</code> is the sign.</p></div>
<div class="exam"><p><b>Exam trap.</b> The commands in one call run in one request, in order, and the whole call fails at the first bad command. You get a <code>CommandError</code>, not a partial result list. The partial results are inside the exception (next chapter).</p></div>

<div class="scn"><h4>The VLAN that sorted wrongly</h4><p>A report sorted VLAN ids as text: 10, 100, 20, 200. The rows looked random to the NOC. The ids are strings in the JSON, so a plain <code>sorted()</code> compares text. <code>sorted(data["vlans"], key=int)</code> fixed it.</p><p><b>Lesson:</b> eAPI keys are strings. Convert before you compare or sort.</p></div>

<div class="iv"><p class="q">"Why use eAPI with JSON instead of SSH and screen scraping?"</p><p>The switch returns structured data, so the script reads keys instead of parsing columns. It does not break when a column widens or a version adds a field, there is no prompt or pager handling, and errors are explicit codes rather than text to search for.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>run_commands(cmds, encoding="json")</code> returns a list with one item per command.</li>
<li>pyeapi adds <code>enable</code> first; it is hidden from results but counted in errors.</li>
<li>Use <code>encoding="text"</code> or <code>node.enable()</code> for commands with no JSON model; <code>strict=True</code> turns the fallback into an error.</li>
<li>JSON keys such as VLAN ids are strings.</li>
<li>One bad command fails the whole call with <code>CommandError</code>.</li>
</ul></div>
`,hi:`
<p><code>run_commands</code> woh ek method hai jis par pyeapi ki baaki sab cheezein bani hain. Iska input aur output samajh lo to <code>config</code>, <code>get_config</code> aur api modules jaadu nahi lagte. Yahan ke demos Lab 1 topology ke step 2 ke baad ke hain.</p>

<h3>Kya bhejta hai aur kya lautata hai</h3>
`+e+`
<p>Argument ek command string ya strings ki list hai. Return value hamesha ek <b>list</b> hai, aapke diye har command ke liye ek item, usi order mein. <code>encoding="json"</code> (default) mein har item dictionary hai. <code>encoding="text"</code> mein har item <code>{"output": "..."}</code> hai, wahi text jo CLI par dikhta.</p>
`+t+`
<ul>
<li>Ek hi string dene par bhi list milti hai. Dictionary ke liye <code>[0]</code> lagao, jaise <code>run_commands("show hostname")[0]</code>.</li>
<li>pyeapi jo <code>enable</code> sabse pehle lagata hai woh aapki result list mein nahi hota. Error messages mein woh gina jaata hai, isliye "command 2 of 2" ka matlab aapka pehla command ho sakta hai.</li>
<li><code>node.enable()</code> iska samriddh bhai hai. Yeh <code>command</code>, <code>result</code> aur <code>encoding</code> wali dictionaries deta hai, taaki dikhe har command ne asal mein kaunsa format use kiya.</li>
</ul>

<h3>Text nahi, structure se kaam karo</h3>
<p>JSON output matlab na <code>split()</code>, na regular expressions, aur column chaudi hone par kuch nahi tootta. Key se navigate karo. <code>show vlan</code> mein VLAN ids <code>vlans</code> ki <i>string</i> keys hain, isliye code <code>key=int</code> se sort karta hai.</p>
`+n+`
<div class="note"><p><b>Tip.</b> Kisi command ki keys pata nahi? CLI par ek baar <code>| json</code> ke saath chalao (jaise <code>show vlan | json</code>) aur keys padh lo. eAPI ka answer bilkul wahi JSON hai.</p></div>

<h3>Bina JSON model wale commands</h3>
<p>Bahut se <code>show</code> commands, jinme <code>show running-config</code> bhi hai, ka structured form nahi hota. <code>json</code> mein maango to EOS error <b>1003</b>, "unconverted command", deta hai. Teen raaste hain.</p>
<table class="cmp"><tr><th>Raasta</th><th>Kaise</th><th>Kya milta hai</th></tr>
<tr><td>Text maango</td><td><code>run_commands(cmd, encoding="text")</code></td><td>Har baar <code>[{"output": "..."}]</code></td></tr>
<tr><td>enable() ko fall back karne do</td><td><code>node.enable(cmd)</code></td><td>Ho sake to JSON, warna text; <code>encoding</code> batata hai kaunsa</td></tr>
<tr><td>Zor se fail karo</td><td><code>node.enable(cmd, strict=True)</code></td><td><code>CommandError</code> 1003, fallback nahi</td></tr></table>
`+r+`
<p>Monitoring script mein <code>strict=True</code> lagao jo chupke se shape nahi badal sakti: jo command JSON dena band kare woh alert hona chahiye, chupke se alag dictionary nahi.</p>

<div class="warn"><p><b>Common mistake.</b> <code>run_commands("show vlan")</code> ko hi dictionary samajhna. Yeh dictionary wali list hai. <code>TypeError: list indices must be integers or slices, not str</code> iska nishaan hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ek call ke commands ek request mein, order se chalte hain, aur poori call pehle bure command par fail hoti hai. Aapko partial result list nahi, <code>CommandError</code> milta hai. Partial results exception ke andar hote hain (agla chapter).</p></div>

<div class="scn"><h4>Jo VLAN galat sort hua</h4><p>Ek report ne VLAN ids ko text ki tarah sort kiya: 10, 100, 20, 200. NOC ko rows random lage. JSON mein ids strings hain, isliye seedha <code>sorted()</code> text compare karta hai. <code>sorted(data["vlans"], key=int)</code> ne theek kiya.</p><p><b>Lesson:</b> eAPI ki keys strings hain. Compare ya sort se pehle convert karo.</p></div>

<div class="iv"><p class="q">"SSH aur screen scraping ki jagah JSON wala eAPI kyun?"</p><p>Switch structured data deta hai, isliye script columns parse karne ki jagah keys padhti hai. Column chaudi hone ya version mein field judne se kuch nahi tootta, prompt ya pager handle nahi karna padta, aur errors text dhoondhne ki jagah explicit codes hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>run_commands(cmds, encoding="json")</code> har command ke liye ek item wali list lautata hai.</li>
<li>pyeapi <code>enable</code> pehle lagata hai; result se chhupa hai par errors mein gina jaata hai.</li>
<li>JSON model na ho to <code>encoding="text"</code> ya <code>node.enable()</code>; <code>strict=True</code> fallback ko error bana deta hai.</li>
<li>VLAN ids jaisi JSON keys strings hoti hain.</li>
<li>Ek bura command poori call ko <code>CommandError</code> se fail kar deta hai.</li>
</ul></div>
`}};export{i as default};