var e={id:`loops-functions`,h:{en:`Many routers: loops and functions`,hi:`Kai routers: loops aur functions`},body:{en:`

<p>One router was practice. The real value of a script is doing the same thing on many. Two Python ideas make that clean: a <b>loop</b> (repeat for each router) and a <b>function</b> (a named, reusable block of steps).</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="The pattern for many devices: data, loop, function, handler."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="60" width="140" height="70" rx="10" fill="#ddd6fe"/><text x="80" y="92" text-anchor="middle" class="svg-ink" font-size="14">ROUTERS</text><text x="80" y="110" text-anchor="middle" class="svg-muted" font-size="12">{ ip: loopback }</text><rect x="215" y="60" width="130" height="70" rx="10" fill="#fde68a"/><text x="280" y="92" text-anchor="middle" class="svg-ink" font-size="14">for host in ...</text><text x="280" y="110" text-anchor="middle" class="svg-muted" font-size="12">loop</text><rect x="410" y="10" width="220" height="50" rx="10" fill="#bae6fd"/><text x="520" y="32" text-anchor="middle" class="svg-ink" font-size="14">get_ip(host, name)</text><text x="520" y="50" text-anchor="middle" class="svg-muted" font-size="12">function: one device</text><rect x="410" y="80" width="220" height="50" rx="10" fill="#bbf7d0"/><text x="520" y="102" text-anchor="middle" class="svg-ink" font-size="14">try / except</text><text x="520" y="120" text-anchor="middle" class="svg-muted" font-size="12">one failure never stops all</text><line x1="150" y1="95" x2="215" y2="95" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="345" y1="85" x2="410" y2="35" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="345" y1="105" x2="410" y2="105" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="13">Dictionary of routers  -&gt;  loop  -&gt;  function  -&gt;  safe handling</text></svg><p class="cap">The pattern for many devices: data, loop, function, handler.</p></div>

<h3>A function: define once, use many times</h3>
<p><code>def get_ip(host, name):</code> starts a function called <code>get_ip</code> that takes two inputs. Everything indented below it is the body. <code>return</code> hands one value back to the caller. The next script uses it for three routers. The third address does not exist in the lab, so it shows how errors are handled:</p>
<pre class="code">import requests
requests.packages.urllib3.disable_warnings()
AUTH = ("netops", "NK@2026")
HEADERS = {"Accept": "application/yang-data+json"}

def get_ip(host, name):
    url = f"h&#116;tps://{host}/restconf/data/ietf-interfaces:interfaces/interface={name}"
    r = requests.get(url, auth=AUTH, headers=HEADERS, verify=False, timeout=5)
    r.raise_for_status()
    return r.json()["ietf-interfaces:interface"]["ietf-ip:ipv4"]["address"][0]["ip"]

for host in ["10.99.0.1", "10.99.0.2", "10.99.0.9"]:
    try:
        print(host, get_ip(host, "Loopback100"))
    except requests.exceptions.HTTPError as e:
        print(host, "HTTP error")
    except requests.exceptions.ConnectionError:
        print(host, "connection error")
    except requests.exceptions.Timeout:
        print(host, "timed out")</pre><pre class="out">AUTO&gt; python3 r.py
<span class="hl">10.99.0.1 100.1.1.1</span>
<span class="hl">10.99.0.2 100.2.2.2</span>
<span class="hl">10.99.0.9 timed out</span></pre>
<p>Read it from the top:</p>
<ul>
<li><code>requests.packages.urllib3.disable_warnings()</code> and <code>verify=False</code> are the lab's certificate shortcut. Real networks keep verification on.</li>
<li><code>AUTH</code> and <code>HEADERS</code> are written once, in capital letters by convention, because they never change.</li>
<li>In the function, <code>f"h&#116;tps://{host}/restconf/..."</code> is an <b>f-string</b>: the text in curly braces is replaced by the variable's value. This is how one function builds the URL for any router and any interface.</li>
<li><code>r.raise_for_status()</code> turns a 4xx or 5xx into an HTTPError. <code>return ...</code> digs the first IP out of the data and gives it back.</li>
<li>The loop <code>for host in [...]:</code> runs the <code>try</code> block three times, with <code>host</code> set to each address in turn.</li>
<li>Each router gets its own result line. The third one shows <code>timed out</code>, and the loop still finished. One bad device did not stop the rest.</li>
</ul>
<p>The structure is the one you reuse everywhere: <b>data</b> at the top, a <b>function</b> for one device, a <b>loop</b> over devices, and <b>handlers</b> for the failures.</p>

<h3>A loop over a dictionary</h3>
<p>The lab's <code>loopbacks.py</code> uses a dictionary to hold router address and the loopback each router should get:</p>
<pre class="code">ROUTERS = {"10.99.0.1": "100.1.1.1", "10.99.0.2": "100.2.2.2"}   # router IP -&gt; loopback IP

for host, lo_ip in ROUTERS.items():
    url = f"h&#116;tps://{host}/restconf/data/ietf-interfaces:interfaces/interface=Loopback100"</pre>
<p><code>.items()</code> hands the loop each key and value pair, so <code>host</code> is the router address and <code>lo_ip</code> is its loopback address. Adding a third router is one more entry in the dictionary and no new code. Here is the finished script's run. The first time it creates (201), the second time it replaces with the same data (204):</p>
<pre class="out">AUTO&gt; python3 loopbacks.py
<span class="hl">10.99.0.1 PUT -&gt; 201</span>
<span class="hl">10.99.0.1 Loopback100 now has 100.1.1.1</span>
<span class="hl">10.99.0.2 PUT -&gt; 201</span>
<span class="hl">10.99.0.2 Loopback100 now has 100.2.2.2</span></pre>
<pre class="out">AUTO&gt; python3 loopbacks.py
<span class="hl">10.99.0.1 PUT -&gt; 204</span>
10.99.0.1 Loopback100 now has 100.1.1.1
<span class="hl">10.99.0.2 PUT -&gt; 204</span>
10.99.0.2 Loopback100 now has 100.2.2.2</pre>
<p>And on the router, the loopback exists. The script output and the device agree:</p>
<pre class="out">R2# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.2       YES manual up                    up
GigabitEthernet0/1     unassigned      YES unset  administratively down down
GigabitEthernet0/2     unassigned      YES unset  administratively down down
GigabitEthernet0/3     unassigned      YES unset  administratively down down
<span class="hl">Loopback100            100.2.2.2       YES manual up                    up</span></pre>

<div class="eg"><p><b>Worked example.</b> Your site grows from two routers to twenty. In the CLI you repeat a procedure eighteen more times. In this script you add eighteen lines to the <code>ROUTERS</code> dictionary. The loop, the function and the handlers stay the same, and the output grows to forty lines you can scan for 201, 204 or an error.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Forgetting the colon at the end of <code>def</code>, <code>for</code>, <code>try</code> or <code>except</code> lines. (2) Wrong indentation: all lines in a block need the same number of spaces. (3) Forgetting the <code>f</code> before the quotes, so <code>{host}</code> is printed literally. (4) Defining a function but never calling it. (5) Putting <code>return</code> but then using the result without storing it.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>def</code> defines a function; <code>return</code> sends a value back; an f-string starts with <code>f"</code> and uses braces. <code>dict.items()</code> gives key and value pairs for a loop. A function that does not return anything gives back <code>None</code>.</p></div>

<div class="scn"><h4>Forty switches, one script</h4><p>A team needed to confirm the NTP server on forty switches before an audit. A function <code>get_ntp(host)</code> and a loop produced a list in minutes. Three hosts timed out and were fixed the same day. The same function was reused the next month for a different check, changing only the path.</p><p><b>Lesson:</b> one small function per task, called in a loop, is the basis of all network automation.</p></div>

<div class="iv"><p class="q">"How do you structure a script that talks to many devices?"</p><p>I keep the device list and credentials as data at the top, write a function for the single-device action that returns a value or raises, and loop over the devices with try/except around the call so each failure is reported but does not stop the run. Results are printed or written to a file for review.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A function (def) packages steps once; return gives back a value.</li>
<li>An f-string builds text with variables: f"...{host}...".</li>
<li>for host, ip in DICT.items() loops over key and value pairs.</li>
<li>try / except inside the loop keeps the run alive.</li>
<li>Adding a router should only mean adding data, not code.</li>
</ul></div>

`,hi:`

<p>Ek router practice tha. Script ki asli keemat wahi kaam kai par karna hai. Do Python ideas ise saaf banate hain: <b>loop</b> (har router ke liye dohrao) aur <b>function</b> (steps ka naam wala, dobara use hone wala block).</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Kai devices ka pattern: data, loop, function, handler."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="60" width="140" height="70" rx="10" fill="#ddd6fe"/><text x="80" y="92" text-anchor="middle" class="svg-ink" font-size="14">ROUTERS</text><text x="80" y="110" text-anchor="middle" class="svg-muted" font-size="12">{ ip: loopback }</text><rect x="215" y="60" width="130" height="70" rx="10" fill="#fde68a"/><text x="280" y="92" text-anchor="middle" class="svg-ink" font-size="14">for host in ...</text><text x="280" y="110" text-anchor="middle" class="svg-muted" font-size="12">loop</text><rect x="410" y="10" width="220" height="50" rx="10" fill="#bae6fd"/><text x="520" y="32" text-anchor="middle" class="svg-ink" font-size="14">get_ip(host, name)</text><text x="520" y="50" text-anchor="middle" class="svg-muted" font-size="12">function: ek device</text><rect x="410" y="80" width="220" height="50" rx="10" fill="#bbf7d0"/><text x="520" y="102" text-anchor="middle" class="svg-ink" font-size="14">try / except</text><text x="520" y="120" text-anchor="middle" class="svg-muted" font-size="12">ek failure sab nahi rokti</text><line x1="150" y1="95" x2="215" y2="95" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="345" y1="85" x2="410" y2="35" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="345" y1="105" x2="410" y2="105" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="13">Routers ki dictionary -&gt; loop -&gt; function -&gt; safe handling</text></svg><p class="cap">Kai devices ka pattern: data, loop, function, handler.</p></div>

<h3>Function: ek baar define, kai baar use</h3>
<p><code>def get_ip(host, name):</code> <code>get_ip</code> naam ka function shuru karta hai jo do inputs leta hai. Uske neeche jo indented hai woh body hai. <code>return</code> ek value wapas caller ko deta hai. Agli script ise teen routers ke liye use karti hai. Teesra address lab mein hai hi nahi, isliye woh dikhata hai ki errors kaise sambhalte hain:</p>
<pre class="code">import requests
requests.packages.urllib3.disable_warnings()
AUTH = ("netops", "NK@2026")
HEADERS = {"Accept": "application/yang-data+json"}

def get_ip(host, name):
    url = f"h&#116;tps://{host}/restconf/data/ietf-interfaces:interfaces/interface={name}"
    r = requests.get(url, auth=AUTH, headers=HEADERS, verify=False, timeout=5)
    r.raise_for_status()
    return r.json()["ietf-interfaces:interface"]["ietf-ip:ipv4"]["address"][0]["ip"]

for host in ["10.99.0.1", "10.99.0.2", "10.99.0.9"]:
    try:
        print(host, get_ip(host, "Loopback100"))
    except requests.exceptions.HTTPError as e:
        print(host, "HTTP error")
    except requests.exceptions.ConnectionError:
        print(host, "connection error")
    except requests.exceptions.Timeout:
        print(host, "timed out")</pre><pre class="out">AUTO&gt; python3 r.py
<span class="hl">10.99.0.1 100.1.1.1</span>
<span class="hl">10.99.0.2 100.2.2.2</span>
<span class="hl">10.99.0.9 timed out</span></pre>
<p>Upar se padho:</p>
<ul>
<li><code>requests.packages.urllib3.disable_warnings()</code> aur <code>verify=False</code> lab ka certificate shortcut hain. Asli networks verification on rakhte hain.</li>
<li><code>AUTH</code> aur <code>HEADERS</code> ek baar likhe gaye, convention se capital letters mein, kyunki woh badalte nahi.</li>
<li>Function mein <code>f"h&#116;tps://{host}/restconf/..."</code> ek <b>f-string</b> hai: curly braces ka text variable ki value se badal jaata hai. Isi se ek function kisi bhi router aur interface ka URL bana leta hai.</li>
<li><code>r.raise_for_status()</code> 4xx ya 5xx ko HTTPError banata hai. <code>return ...</code> data mein se pehla IP nikaalkar wapas deta hai.</li>
<li>Loop <code>for host in [...]:</code> <code>try</code> block ko teen baar chalata hai, <code>host</code> har baar ek address.</li>
<li>Har router ki apni result line hai. Teesri <code>timed out</code> dikhati hai, aur loop phir bhi poora hua. Ek kharab device ne baaki nahi roke.</li>
</ul>
<p>Yeh structure aap har jagah dobara use karte ho: upar <b>data</b>, ek device ke liye <b>function</b>, devices par <b>loop</b>, aur failures ke liye <b>handlers</b>.</p>

<h3>Dictionary par loop</h3>
<p>Lab ki <code>loopbacks.py</code> dictionary rakhti hai jisme router address aur har router ko dene wala loopback hai:</p>
<pre class="code">ROUTERS = {"10.99.0.1": "100.1.1.1", "10.99.0.2": "100.2.2.2"}   # router IP -&gt; loopback IP

for host, lo_ip in ROUTERS.items():
    url = f"h&#116;tps://{host}/restconf/data/ietf-interfaces:interfaces/interface=Loopback100"</pre>
<p><code>.items()</code> loop ko har key aur value jodi deta hai, isliye <code>host</code> router address hai aur <code>lo_ip</code> uska loopback address. Teesra router jodna dictionary mein ek aur entry hai, naya code nahi. Yeh poori script ki run hai. Pehli baar yeh banati hai (201), doosri baar ek jaisa data se replace karti hai (204):</p>
<pre class="out">AUTO&gt; python3 loopbacks.py
<span class="hl">10.99.0.1 PUT -&gt; 201</span>
<span class="hl">10.99.0.1 Loopback100 now has 100.1.1.1</span>
<span class="hl">10.99.0.2 PUT -&gt; 201</span>
<span class="hl">10.99.0.2 Loopback100 now has 100.2.2.2</span></pre>
<pre class="out">AUTO&gt; python3 loopbacks.py
<span class="hl">10.99.0.1 PUT -&gt; 204</span>
10.99.0.1 Loopback100 now has 100.1.1.1
<span class="hl">10.99.0.2 PUT -&gt; 204</span>
10.99.0.2 Loopback100 now has 100.2.2.2</pre>
<p>Aur router par loopback maujood hai. Script ka output aur device ek mat hain:</p>
<pre class="out">R2# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.2       YES manual up                    up
GigabitEthernet0/1     unassigned      YES unset  administratively down down
GigabitEthernet0/2     unassigned      YES unset  administratively down down
GigabitEthernet0/3     unassigned      YES unset  administratively down down
<span class="hl">Loopback100            100.2.2.2       YES manual up                    up</span></pre>

<div class="eg"><p><b>Worked example.</b> Aapki site do routers se bees ho jaati hai. CLI mein aap procedure athaarah baar aur dohrate ho. Is script mein <code>ROUTERS</code> dictionary mein athaarah lines jodte ho. Loop, function aur handlers wahi rehte hain, aur output chalis lines ka ho jaata hai jisme 201, 204 ya error scan kar sakte ho.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) <code>def</code>, <code>for</code>, <code>try</code> ya <code>except</code> lines ke end mein colon bhool jaana. (2) Galat indentation: block ki saari lines mein spaces ki ginti barabar honi chahiye. (3) Quotes se pehle <code>f</code> bhool jaana, to <code>{host}</code> jyon ka tyon print hota hai. (4) Function define karke kabhi call na karna. (5) <code>return</code> likhna par result ko store kiye bina use karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>def</code> function define karta hai; <code>return</code> value wapas bhejta hai; f-string <code>f"</code> se shuru hoti hai aur braces use karti hai. <code>dict.items()</code> loop ke liye key aur value jodi deta hai. Jo function kuch return nahi karta woh <code>None</code> deta hai.</p></div>

<div class="scn"><h4>Chalis switches, ek script</h4><p>Ek team ko audit se pehle chalis switches par NTP server confirm karna tha. <code>get_ntp(host)</code> function aur ek loop ne minutes mein list bana di. Teen hosts timeout hue aur usi din theek kiye gaye. Agle mahine wahi function doosre check ke liye dobara use hua, sirf path badla.</p><p><b>Lesson:</b> har kaam ke liye ek chhota function, loop mein call, sab network automation ki buniyaad hai.</p></div>

<div class="iv"><p class="q">"Kai devices se baat karne wali script ko aap kaise structure karte ho?"</p><p>Device list aur credentials upar data ki tarah rakhta hoon, ek-device ke action ke liye function likhta hoon jo value return karta hai ya raise karta hai, aur devices par loop chalata hoon jisme call ke aas-paas try/except hai, taaki har failure report ho par run na ruke. Results review ke liye print ya file mein likhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Function (def) steps ek baar package karta hai; return value wapas deta hai.</li>
<li>f-string variables ke saath text banati hai: f"...{host}...".</li>
<li>for host, ip in DICT.items() key aur value jodiyon par loop karta hai.</li>
<li>Loop ke andar try / except run ko zinda rakhta hai.</li>
<li>Router jodne ka matlab sirf data jodna ho, code nahi.</li>
</ul></div>

`}};export{e as default};