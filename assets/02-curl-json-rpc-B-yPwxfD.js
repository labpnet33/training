var e=String.raw`<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Anatomy of an eAPI request">
<rect x="10" y="20" width="300" height="150" rx="8" fill="#ddd6fe"/><text x="160" y="42" text-anchor="middle" class="svg-ink" font-size="13">Request body (JSON)</text>
<text x="24" y="68" class="svg-ink" font-size="12">"jsonrpc": "2.0"</text><text x="24" y="88" class="svg-ink" font-size="12">"method": "runCmds"</text><text x="24" y="108" class="svg-ink" font-size="12">"params": { "version": 1,</text><text x="44" y="126" class="svg-ink" font-size="12">"cmds": ["show version"],</text><text x="44" y="144" class="svg-ink" font-size="12">"format": "json" }</text><text x="24" y="162" class="svg-ink" font-size="12">"id": "1"</text>
<rect x="340" y="20" width="290" height="62" rx="8" fill="#bbf7d0"/><text x="485" y="42" text-anchor="middle" class="svg-ink" font-size="13">Success: "result": [ one per command ]</text><text x="485" y="64" text-anchor="middle" class="svg-muted" font-size="11">same order as "cmds"</text>
<rect x="340" y="108" width="290" height="62" rx="8" fill="#fecaca"/><text x="485" y="130" text-anchor="middle" class="svg-ink" font-size="13">Failure: "error": code, message, data</text><text x="485" y="152" text-anchor="middle" class="svg-muted" font-size="11">still HT&#84;P 200 (a login failure is 401)</text>
<line x1="310" y1="60" x2="340" y2="50" stroke="#64748b" stroke-width="2"/><line x1="310" y1="120" x2="340" y2="135" stroke="#64748b" stroke-width="2"/>
</svg></div>
<p class="cap">One request in, one answer out. The answer is either a result list or an error object, never both.</p>`,t=String.raw`<pre class="code"><span class="c"># Lab 1, step 1: one raw request from AUTO01 to LEAF1</span>
curl -k -s -u netops:NK@2026 -X POST -H 'Content-Type: application/json' \
  -d '{"jsonrpc": "2.0", "method": "runCmds", "params": {"version": 1, "cmds": ["show version"], "format": "json"}, "id": "1"}' \
  h&#116;tps://10.99.0.11/command-api</pre>
<pre class="out">HT&#84;P/1.1 200 OK
Server: nginx
Date: Sun, 11 Oct 2026 11:57:45 GMT
Content-Type: application/json
Transfer-Encoding: chunked
Connection: keep-alive
Cache-Control: private, no-cache, must-revalidate, proxy-revalidate
Pragma: no-cache

{"jsonrpc":"2.0","id":"1","result":[{"mfgName":"Arista","modelName":"vEOS-lab","hardwareRevision":"","serialNumber":"NK1SRWVCCX0","systemMacAddress":"52:54:e9:74:61:00","hwMacAddress":"52:54:e9:74:61:00","configMacAddress":"00:00:00:00:00:00","version":"<span class="hl">4.31.4M</span>","architecture":"x86_64","internalVersion":"4.31.4M-37640124.4314M","internalBuildId":"9ccf0b0c-5e2b-41b2-b5c6-003916718508","imageFormatVersion":"1.0","imageOptimization":"None","uptime":612,"bootupTimestamp":1791719253,"memTotal":4002052,"memFree":2713460,"isIntlVersion":false}]}</pre>`,n=String.raw`<pre class="code">curl -k -s -u netops:NK@2026 -X POST -H 'Content-Type: application/json' \
  -d '{"jsonrpc": "2.0", "method": "runCmds", "params": {"version": 1, "cmds": ["show hostname", "foo", "show clock"], "format": "json"}, "id": "1"}' \
  h&#116;tps://10.99.0.11/command-api</pre>
<pre class="out">HT&#84;P/1.1 <span class="hl">200 OK</span>
Content-Type: application/json
...
{"jsonrpc":"2.0","id":"1","error":{"code":<span class="hl">1002</span>,"message":"CLI command 2 of 3 'foo' failed: invalid command","data":[{"fqdn":"LEAF1","hostname":"LEAF1"},{"errors":["Invalid input (at token 0: 'foo')"]}]}}</pre>`,r=String.raw`<pre class="code">curl -k -s -u netops:NK@2026 -X POST -H 'Content-Type: application/json' \
  -d '{"jsonrpc": "2.0", "method": "runCmds", "params": {"version": 1, "cmds": ["show hostname", "show clock"], "format": "text"}, "id": "1"}' \
  h&#116;tps://10.99.0.11/command-api</pre>
<pre class="out">...
{"jsonrpc":"2.0","id":"1","result":[{"output":"Hostname: LEAF1\nFQDN:     LEAF1\n"},{"output":"Sun Oct 11 12:03:10 2026\nTimezone: UTC\nClock source: local\n"}]}</pre>`,i=String.raw`<pre class="code">curl -k -s -u netops:wrong -X POST -H 'Content-Type: application/json' \
  -d '{"jsonrpc": "2.0", "method": "runCmds", "params": {"version": 1, "cmds": ["show hostname"], "format": "json"}, "id": "1"}' \
  h&#116;tps://10.99.0.11/command-api</pre>
<pre class="out">HT&#84;P/1.1 <span class="hl">401 Unauthorized</span>
Server: nginx
Content-Type: text/plain
WWW-Authenticate: Basic realm="COMMAND_API"

Unauthorized</pre>`,a=String.raw`<pre class="code"><span class="c"># d_req.py - the same two requests with the requests library from auto-requests</span>
import requests

URL = "h&#116;tps://10.99.0.11/command-api"
body = {"jsonrpc": "2.0", "method": "runCmds", "id": "1",
        "params": {"version": 1, "cmds": ["show version"], "format": "json"}}
reply = requests.post(URL, json=body, auth=("netops", "NK@2026"), verify=False)
print(reply.status_code, reply.json()["result"][0]["version"])
bad = dict(body, params={"version": 1, "cmds": ["show vrsion"], "format": "json"})
reply = requests.post(URL, json=bad, auth=("netops", "NK@2026"), verify=False)
print(reply.status_code, reply.json()["error"]["code"], reply.json()["error"]["message"])</pre>
<pre class="out">AUTO01$ python3 d_req.py
200 4.31.4M
200 <span class="hl">1002</span> CLI command 1 of 1 'show vrsion' failed: invalid command</pre>`,o={id:`curl-json-rpc`,h:{en:`eAPI on the wire: JSON-RPC with curl`,hi:`Wire par eAPI: curl ke saath JSON-RPC`},body:{en:`
<p>Before any library, look at what actually travels. If you can read a raw eAPI request and answer, every pyeapi error message makes sense, because pyeapi is only a polite wrapper around it. This chapter is Lab 1, step 1.</p>

<h3>The request</h3>
<p>eAPI is a <b>JSON-RPC 2.0</b> service. You <code>POST</code> a JSON document to the path <code>/command-api</code> on the switch, over TLS, with HT&#84;P basic authentication. The document names the method <code>runCmds</code> and carries the commands in <code>params</code>.</p>
`+e+`
<table class="cmp"><tr><th>Field</th><th>Meaning</th></tr>
<tr><td><code>version</code></td><td><code>1</code> (or <code>"latest"</code>): the shape of the answer. pyeapi uses 1.</td></tr>
<tr><td><code>cmds</code></td><td>A list of CLI commands, run in order. Items are strings, or <code>{"cmd": ..., "input": ...}</code> when a command needs an answer such as an enable password.</td></tr>
<tr><td><code>format</code></td><td><code>json</code> (structured) or <code>text</code> (the CLI output as one string).</td></tr>
<tr><td><code>id</code></td><td>Any string; the answer repeats it so you can match replies.</td></tr></table>

<h3>A first request</h3>
<p>The flags: <code>-k</code> accepts the switch's self-signed certificate, <code>-s</code> hides the progress meter, <code>-u</code> sends basic authentication, <code>-d</code> is the body. Quote the JSON with single quotes so the shell leaves the double quotes alone.</p>
`+t+`
<p>The result is a <b>list with one entry per command</b>. We sent one command, so one dictionary. Look at <code>version</code>: this is the value that <code>show version | json</code> shows at the CLI. The user <code>netops</code> has privilege 15, so no <code>enable</code> command was needed.</p>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab's curl prints the response headers every time. With real curl you add <code>-i</code> to see them; without it you get only the body. Nothing else changes.</p></div>

<h3>When a command fails</h3>
<p>EOS runs the commands in order and stops at the first one that fails. The error object says which command it was, and <code>data</code> carries the results so far plus the failure details.</p>
`+n+`
<ul>
<li><b>HT&#84;P 200</b> even though the request failed. The transport worked; the <i>command</i> did not.</li>
<li><code>1002</code> is "invalid command". The text says <code>command 2 of 3</code> and <code>at token 0</code>: the first word, <code>foo</code>, was not understood.</li>
<li><code>data</code> holds the good result of <code>show hostname</code> and then <code>{"errors": [...]}</code> for the bad one. The third command never ran.</li>
</ul>
<p>The common codes are in this table. You will meet 1002 and 1003 most.</p>
<table class="cmp"><tr><th>Code</th><th>Meaning</th><th>Typical cause</th></tr>
<tr><td>1002</td><td>invalid command</td><td>Typo, wrong mode, incomplete command, bad enable password</td></tr>
<tr><td>1003</td><td>unconverted command</td><td>A <code>show</code> command with no JSON model asked in <code>json</code> format</td></tr>
<tr><td>1001</td><td>bad parameters</td><td>Unsupported version, unknown format, empty <code>cmds</code></td></tr>
<tr><td>1000</td><td>could not run</td><td>Internal failure on the switch</td></tr>
<tr><td>-32700 / -32600 / -32601 / -32602</td><td>JSON-RPC protocol errors</td><td>Malformed JSON, wrong method name, bad params</td></tr></table>

<h3>Text format, bad password, and configuring</h3>
<p>Ask for <code>text</code> when a command has no JSON model, or when you want to store the output as a file.</p>
`+r+`
<p>A wrong password never reaches JSON-RPC: the web server refuses it at HT&#84;P level with <b>401</b> and a <code>WWW-Authenticate</code> header. That is why a login failure is an HT&#84;P status and a bad command is a JSON error.</p>
`+i+`
<p>Configuration works too. Send <code>configure</code> first, then the config lines; the whole list runs as one request, and the answer is a list of empty dictionaries (<code>[{},{},{}]</code>), one per command.</p>

<h3>Same thing with requests</h3>
<p>You already know the <code>requests</code> library from <code>auto-requests</code>. This is the same call in Python. Nothing here is special to pyeapi.</p>
`+a+`
<div class="warn"><p><b>Common mistake.</b> Checking only <code>reply.status_code == 200</code>. A rejected command also returns 200. Always look for the <code>"error"</code> key in the JSON. pyeapi does this for you and raises <code>CommandError</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> A failure in the middle of a list does not undo the commands before it. Commands 1 to N-1 have run. For changes that must be all-or-nothing, use a config session (chapter 7).</p></div>

<div class="scn"><h4>"It returned 200, so it worked"</h4><p>A script posted twenty config lines to a leaf and logged the status code. It logged 200 every night. One night line 7 had a typo, so lines 8 to 20 never ran, and a new VLAN was missing on one rack. The 200 was real; the <code>error</code> object that sat in the body was ignored.</p><p><b>Lesson:</b> read the body, not the status code. Use the library that raises on <code>error</code>.</p></div>

<div class="iv"><p class="q">"A curl to eAPI returns HT&#84;P 200. Does that mean the command worked?"</p><p>No. HT&#84;P 200 only says the JSON-RPC call was processed. If a command failed, the body contains an <code>error</code> object with a code (1002 invalid command, 1003 unconverted command) and a <code>data</code> list with the results so far. Authentication failures are different: they are an HT&#84;P 401 before JSON-RPC starts.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>POST JSON to <code>/command-api</code>: method <code>runCmds</code>, params <code>version</code>, <code>cmds</code>, <code>format</code>.</li>
<li>The answer has one result per command, or an <code>error</code> with code, message and data.</li>
<li>Command errors are HT&#84;P 200; login errors are HT&#84;P 401.</li>
<li>1002 invalid command, 1003 unconverted command (use <code>text</code>).</li>
<li>Commands before a failure have already run; the request is not atomic.</li>
</ul></div>
`,hi:`
<p>Kisi library se pehle dekho ki wire par asal mein kya jaata hai. Agar aap raw eAPI request aur answer padh sakte ho to har pyeapi error message samajh aata hai, kyunki pyeapi us par sirf ek vinamra wrapper hai. Yeh chapter Lab 1 ka step 1 hai.</p>

<h3>Request</h3>
<p>eAPI ek <b>JSON-RPC 2.0</b> service hai. Aap switch par <code>/command-api</code> path par TLS ke upar HT&#84;P basic authentication ke saath JSON document <code>POST</code> karte ho. Document method <code>runCmds</code> batata hai aur commands <code>params</code> mein hote hain.</p>
`+e+`
<table class="cmp"><tr><th>Field</th><th>Matlab</th></tr>
<tr><td><code>version</code></td><td><code>1</code> (ya <code>"latest"</code>): answer ka shape. pyeapi 1 use karta hai.</td></tr>
<tr><td><code>cmds</code></td><td>CLI commands ki list, order mein chalti hai. Items strings hote hain, ya <code>{"cmd": ..., "input": ...}</code> jab command ko enable password jaise jawab ki zaroorat ho.</td></tr>
<tr><td><code>format</code></td><td><code>json</code> (structured) ya <code>text</code> (CLI output ek string mein).</td></tr>
<tr><td><code>id</code></td><td>Koi bhi string; answer use repeat karta hai taaki aap replies match kar sako.</td></tr></table>

<h3>Pehli request</h3>
<p>Flags: <code>-k</code> switch ka self-signed certificate accept karta hai, <code>-s</code> progress meter chhupata hai, <code>-u</code> basic authentication bhejta hai, <code>-d</code> body hai. JSON ko single quotes mein rakho taaki shell double quotes ko na chhede.</p>
`+t+`
<p>Result <b>har command ke liye ek entry wali list</b> hai. Humne ek command bheja, isliye ek dictionary. <code>version</code> dekho: yahi value CLI par <code>show version | json</code> dikhata hai. User <code>netops</code> privilege 15 hai, isliye <code>enable</code> command ki zaroorat nahi padi.</p>
<div class="note"><p><b>Lab vs real gear.</b> Lab ka curl har baar response headers print karta hai. Asli curl mein headers dekhne ke liye <code>-i</code> lagate ho; uske bina sirf body milti hai. Baaki kuch nahi badalta.</p></div>

<h3>Jab command fail ho</h3>
<p>EOS commands order mein chalata hai aur pehli fail hone wali par ruk jaata hai. Error object batata hai kaunsa command tha, aur <code>data</code> mein ab tak ke results aur failure ki details hoti hain.</p>
`+n+`
<ul>
<li><b>HT&#84;P 200</b> jabki request fail hui. Transport chala; <i>command</i> nahi chala.</li>
<li><code>1002</code> matlab "invalid command". Text kehta hai <code>command 2 of 3</code> aur <code>at token 0</code>: pehla shabd <code>foo</code> samajh nahi aaya.</li>
<li><code>data</code> mein <code>show hostname</code> ka theek result hai, phir bure command ke liye <code>{"errors": [...]}</code>. Teesra command kabhi chala hi nahi.</li>
</ul>
<p>Common codes is table mein hain. 1002 aur 1003 sabse zyada milenge.</p>
<table class="cmp"><tr><th>Code</th><th>Matlab</th><th>Aam wajah</th></tr>
<tr><td>1002</td><td>invalid command</td><td>Typo, galat mode, adhoora command, galat enable password</td></tr>
<tr><td>1003</td><td>unconverted command</td><td>Aisa <code>show</code> command jiska JSON model nahi, <code>json</code> format mein maanga</td></tr>
<tr><td>1001</td><td>bad parameters</td><td>Unsupported version, anjaan format, khaali <code>cmds</code></td></tr>
<tr><td>1000</td><td>could not run</td><td>Switch par internal failure</td></tr>
<tr><td>-32700 / -32600 / -32601 / -32602</td><td>JSON-RPC protocol errors</td><td>Kharab JSON, galat method naam, bad params</td></tr></table>

<h3>Text format, galat password aur configure</h3>
<p>Jab command ka JSON model na ho, ya output file mein rakhna ho, tab <code>text</code> maango.</p>
`+r+`
<p>Galat password kabhi JSON-RPC tak nahi pahunchta: web server use HT&#84;P level par <b>401</b> aur <code>WWW-Authenticate</code> header ke saath mana kar deta hai. Isliye login failure HT&#84;P status hai aur bura command JSON error.</p>
`+i+`
<p>Configuration bhi chalti hai. Pehle <code>configure</code> bhejo, phir config lines; poori list ek request ki tarah chalti hai, aur answer khaali dictionaries ki list (<code>[{},{},{}]</code>) hai, har command ke liye ek.</p>

<h3>Wahi cheez requests ke saath</h3>
<p><code>requests</code> library aap <code>auto-requests</code> se jaante ho. Yeh wahi call Python mein hai. Isme pyeapi ke liye kuch khaas nahi.</p>
`+a+`
<div class="warn"><p><b>Common mistake.</b> Sirf <code>reply.status_code == 200</code> check karna. Rejected command bhi 200 deta hai. Hamesha JSON mein <code>"error"</code> key dekho. pyeapi yeh aapke liye karta hai aur <code>CommandError</code> raise karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> List ke beech mein fail hone se pehle ke commands undo nahi hote. Commands 1 se N-1 chal chuke hote hain. All-or-nothing changes ke liye config session use karo (chapter 7).</p></div>

<div class="scn"><h4>"200 aaya, matlab chal gaya"</h4><p>Ek script ne leaf par bees config lines post kin aur status code log kiya. Har raat 200 log hota raha. Ek raat line 7 mein typo thi, isliye lines 8 se 20 chali hi nahi, aur ek rack par naya VLAN missing tha. 200 sach tha; body mein baitha <code>error</code> object ignore ho gaya.</p><p><b>Lesson:</b> body padho, status code nahi. Aisi library use karo jo <code>error</code> par raise kare.</p></div>

<div class="iv"><p class="q">"eAPI par curl HT&#84;P 200 deta hai. Kya iska matlab command chal gaya?"</p><p>Nahi. HT&#84;P 200 sirf itna batata hai ki JSON-RPC call process hui. Command fail ho to body mein <code>error</code> object hota hai jisme code (1002 invalid command, 1003 unconverted command) aur ab tak ke results ki <code>data</code> list hoti hai. Authentication failure alag hai: woh JSON-RPC shuru hone se pehle HT&#84;P 401 hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>/command-api</code> par JSON POST karo: method <code>runCmds</code>, params <code>version</code>, <code>cmds</code>, <code>format</code>.</li>
<li>Answer mein har command ka ek result hota hai, ya code, message aur data ke saath <code>error</code>.</li>
<li>Command errors HT&#84;P 200 hote hain; login errors HT&#84;P 401.</li>
<li>1002 invalid command, 1003 unconverted command (<code>text</code> use karo).</li>
<li>Failure se pehle ke commands chal chuke hote hain; request atomic nahi hai.</li>
</ul></div>
`}};export{o as default};