var e={id:`troubleshooting`,h:{en:`Troubleshooting two broken scripts`,hi:`Do kharab scripts ka troubleshooting`},body:{en:`

<p>Two scripts in the labs are broken on purpose. Fix them in the order below. Each bug teaches a habit.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Debugging loop for any failing script."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="40" width="125" height="70" rx="10" fill="#fecaca"/><text x="72.5" y="72" text-anchor="middle" class="svg-ink" font-size="14">Read error</text><text x="72.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">last line first</text><rect x="165" y="40" width="125" height="70" rx="10" fill="#fde68a"/><text x="227.5" y="72" text-anchor="middle" class="svg-ink" font-size="14">Print r.status_code</text><text x="227.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">print(r.text)</text><rect x="320" y="40" width="125" height="70" rx="10" fill="#bae6fd"/><text x="382.5" y="80" text-anchor="middle" class="svg-ink" font-size="14">Fix ONE thing</text><rect x="475" y="40" width="155" height="70" rx="10" fill="#bbf7d0"/><text x="552.5" y="72" text-anchor="middle" class="svg-ink" font-size="14">Re-run, then verify</text><text x="552.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">on the router</text><line x1="135" y1="75" x2="165" y2="75" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="290" y1="75" x2="320" y2="75" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="445" y1="75" x2="475" y2="75" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="13">A traceback tells you where; the status and body tell you why</text></svg><p class="cap">Debugging loop for any failing script.</p></div>

<h3>Script 1: intf.py gets 401, then crashes</h3>
<pre class="out">AUTO&gt; python3 intf.py
<span class="hl">Status: 401</span>
Traceback (most recent call last):
  File "intf.py", line 13, in &lt;module&gt;
    interfaces = data["ietf-interfaces:interfaces"]["interface"]   # a list of dictionaries
<span class="hl">KeyError: 'ietf-interfaces:interfaces'</span></pre>
<p>Read it from the bottom. The last line is <code>KeyError: 'ietf-interfaces:interfaces'</code>, which means the data does not have the key we wanted. But the first line, <code>Status: 401</code>, is the <b>real cause</b>. The router never sent the interface list, because the login failed. The KeyError is only a symptom. The password in the file is <code>nk@2026</code>, lower case. Fix it with <code>sed</code>, then run again:</p>
<pre class="out">AUTO&gt; sed -i 's/nk@2026/NK@2026/' intf.py</pre>
<pre class="out">AUTO&gt; python3 intf.py
<span class="hl">Status: 200</span></pre>
<p>200 and no crash. But nothing is printed yet, because the file ends with a TODO. Add the loop that prints each interface name and its enabled value, using the lab's <code>edit</code> and <code>insert</code> commands (lines 14 and 15):</p>
<pre class="out">AUTO&gt; edit intf.py 14 for i in interfaces:
    14  for i in interfaces:</pre>
<pre class="out">AUTO&gt; insert intf.py 15     print(i["name"], i["enabled"])
    15      print(i["name"], i["enabled"])</pre>
<pre class="out">AUTO&gt; python3 intf.py
Status: 200
GigabitEthernet0/0 True
GigabitEthernet0/1 True
GigabitEthernet0/2 False
GigabitEthernet0/3 True
<span class="hl">Loopback0 True</span></pre>
<p>Note the four spaces in front of <code>print</code>: they place it inside the loop.</p>

<h3>Script 2: loopbacks.py, the PUT that was refused</h3>
<p>Here is the file (line numbers added by <code>nl</code>). Two TODO items are marked:</p>
<pre class="code">     1  # loopbacks.py - create Loopback100 on two routers with PUT, then check it with GET
     2  import requests
     3  requests.packages.urllib3.disable_warnings()
     4  
     5  AUTH = ("netops", "NK@2026")
     6  HEADERS = {"Content-Type": "application/yang-data+json", "Accept": "application/yang-data+json"}
     7  ROUTERS = {"10.99.0.1": "100.1.1.1", "10.99.0.2": "100.2.2.2"}   # router IP -&gt; loopback IP
     8  
     9  for host, lo_ip in ROUTERS.items():
    10      url = f"h&#116;tps://{host}/restconf/data/ietf-interfaces:interfaces/interface=Loopback100"
    11      body = {
    12          "ietf-interfaces:interface": {
    13              "name": "Loopback100",
    14              "type": "TODO",
    15              "ietf-ip:ipv4": {"address": [{"ip": lo_ip, "netmask": "255.255.255.255"}]},
    16          }
    17      }
    18      r = requests.put(url, auth=AUTH, headers=HEADERS, json=body, verify=False)   # create / replace
    19      print(host, "PUT -&gt;", r.status_code)
    20      # TODO: stop the script with an error if the PUT failed
    21      check = requests.get(url, auth=AUTH, headers=HEADERS, verify=False)          # verify
    22      ip = check.json()["ietf-interfaces:interface"]["ietf-ip:ipv4"]["address"][0]["ip"]
    23      print(host, "Loopback100 now has", ip)</pre>
<pre class="out">AUTO&gt; python3 loopbacks.py
<span class="hl">10.99.0.1 PUT -&gt; 400</span>
Traceback (most recent call last):
  File "loopbacks.py", line 22, in &lt;module&gt;
    ip = check.json()["ietf-interfaces:interface"]["ietf-ip:ipv4"]["address"][0]["ip"]
<span class="hl">KeyError: 'ietf-interfaces:interface'</span></pre>
<p>Again the status comes first: <code>PUT -> 400</code>. The KeyError at the bottom is a later symptom (the GET found nothing, because nothing was created). To see <i>why</i> the router said 400, print the body. This test script sends the same data and prints <code>r.text</code>:</p>
<pre class="code">import requests
requests.packages.urllib3.disable_warnings()
url = "h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback100"
body = {"ietf-interfaces:interface": {"name": "Loopback100", "type": "TODO"}}
r = requests.put(url, auth=("netops", "NK@2026"), headers={"Content-Type": "application/yang-data+json"}, json=body, verify=False)
print(r.status_code)
print(r.text)</pre><pre class="out">AUTO&gt; python3 s.py
<span class="hl">400</span>
{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
        "error-tag": "invalid-value",
<span class="hl">        "error-message": "type TODO is not valid for Loopback100 (expected iana-if-type:softwareLoopback)"</span>
      }
    ]
  }
}</pre>
<p>The router names the problem: the value <code>TODO</code> is not a valid <code>type</code>. A loopback needs <code>iana-if-type:softwareLoopback</code>. This is why a good script prints <code>r.text</code> when a call fails.</p>
<p>Now fix the first TODO on line 20: stop the script when a PUT fails. Insert <code>r.raise_for_status()</code> at line 20, indented four spaces:</p>
<pre class="out">AUTO&gt; edit loopbacks.py 20     r.raise_for_status()
    20      r.raise_for_status()</pre>
<pre class="out">AUTO&gt; python3 loopbacks.py
10.99.0.1 PUT -&gt; 400
Traceback (most recent call last):
  File "loopbacks.py", line 20, in &lt;module&gt;
    r.raise_for_status()
<span class="hl">requests.exceptions.HTTPError: 400 Client Error: Bad Request for url: ...</span></pre>
<p>The script now stops <i>at the failing PUT</i> instead of crashing later. (The long address after <code>for url:</code> is shortened.) Then fix the value on line 14 with <code>sed</code>, and run:</p>
<pre class="out">AUTO&gt; sed -i 's/"TODO"/"iana-if-type:softwareLoopback"/' loopbacks.py</pre>
<pre class="out">AUTO&gt; python3 loopbacks.py
<span class="hl">10.99.0.1 PUT -&gt; 201</span>
10.99.0.1 Loopback100 now has 100.1.1.1
<span class="hl">10.99.0.2 PUT -&gt; 201</span>
10.99.0.2 Loopback100 now has 100.2.2.2</pre>
<pre class="out">AUTO&gt; python3 loopbacks.py
<span class="hl">10.99.0.1 PUT -&gt; 204</span>
10.99.0.1 Loopback100 now has 100.1.1.1
<span class="hl">10.99.0.2 PUT -&gt; 204</span>
10.99.0.2 Loopback100 now has 100.2.2.2</pre>
<p>201 on the first run (created), 204 on the second (replaced with the same data). The script's own GET prints the address back. As a last check, <code>show ip interface brief</code> on R2 (see the previous chapter) shows <code>Loopback100</code> with 100.2.2.2.</p>

<div class="eg"><p><b>Worked example.</b> A colleague sends you a script that "just prints KeyError". You run it, look at the very first line of output and see the status code is 401. You never open the data structure code at all. The fix is one character of case in a password. Starting from the status, not from the traceback, saves the most time.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Debugging the last error instead of the first. (2) Changing three things between runs. (3) Not printing <code>r.text</code> when a call fails. (4) Fixing the script but not checking the router. (5) Editing a file but forgetting to save it, or running an old copy.</p></div>
<div class="exam"><p><b>Exam trap.</b> A KeyError on response data usually means the response was an error body, not the data you expected: check <code>status_code</code> first. Tracebacks show the line that failed; the status and body show why. RESTCONF errors are in a JSON body with <code>error-message</code>.</p></div>

<div class="scn"><h4>Two bugs, one script</h4><p>You are handed loopbacks.py on a Friday. The first run prints "PUT -> 400" and a KeyError. You print the body: "type TODO is not valid". You replace the value and add <code>raise_for_status()</code> so the next bug (if any) stops the script at the right line. Second run: 201 and 201. Third run: 204 and 204. You check R2 and finish.</p><p><b>Lesson:</b> status first, body second, one fix per run, router last.</p></div>

<div class="iv"><p class="q">"A script crashes with a KeyError on the response data. How do you debug it?"</p><p>I check the status code first. If it is not 2xx, the body is an error message, not the data, so the KeyError is only a symptom. I print the response text to read the router's error-message, fix one thing, and re-run. I also add raise_for_status() so the failure appears at the right line next time, and I verify on the device after a successful run.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Check the status code before the data structure.</li>
<li>Print r.text on failure: the router says why.</li>
<li>Add raise_for_status() so errors stop at the right place.</li>
<li>Fix one thing per run.</li>
<li>Finish with a read-back and a show command on the router.</li>
</ul></div>

`,hi:`

<p>Labs mein do scripts jaanbujhkar kharab hain. Neeche ke kram mein theek karo. Har bug ek aadat sikhata hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Kisi bhi fail hoti script ka debugging loop."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="40" width="125" height="70" rx="10" fill="#fecaca"/><text x="72.5" y="72" text-anchor="middle" class="svg-ink" font-size="14">Error padho</text><text x="72.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">aakhri line pehle</text><rect x="165" y="40" width="125" height="70" rx="10" fill="#fde68a"/><text x="227.5" y="72" text-anchor="middle" class="svg-ink" font-size="14">r.status_code print</text><text x="227.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">print(r.text)</text><rect x="320" y="40" width="125" height="70" rx="10" fill="#bae6fd"/><text x="382.5" y="80" text-anchor="middle" class="svg-ink" font-size="14">Ek cheez fix</text><rect x="475" y="40" width="155" height="70" rx="10" fill="#bbf7d0"/><text x="552.5" y="72" text-anchor="middle" class="svg-ink" font-size="14">Dobara chalao, verify</text><text x="552.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">router par</text><line x1="135" y1="75" x2="165" y2="75" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="290" y1="75" x2="320" y2="75" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="445" y1="75" x2="475" y2="75" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="13">Traceback batata hai kahan; status aur body batati hain kyun</text></svg><p class="cap">Kisi bhi fail hoti script ka debugging loop.</p></div>

<h3>Script 1: intf.py 401 deti hai, phir crash</h3>
<pre class="out">AUTO&gt; python3 intf.py
<span class="hl">Status: 401</span>
Traceback (most recent call last):
  File "intf.py", line 13, in &lt;module&gt;
    interfaces = data["ietf-interfaces:interfaces"]["interface"]   # a list of dictionaries
<span class="hl">KeyError: 'ietf-interfaces:interfaces'</span></pre>
<p>Neeche se padho. Aakhri line <code>KeyError: 'ietf-interfaces:interfaces'</code> hai, matlab data mein woh key nahi jo chahiye thi. Par pehli line, <code>Status: 401</code>, <b>asli wajah</b> hai. Router ne interface list kabhi bheji hi nahi, kyunki login fail hua. KeyError sirf symptom hai. File mein password <code>nk@2026</code> hai, lower case. Ise <code>sed</code> se theek karo, phir dobara chalao:</p>
<pre class="out">AUTO&gt; sed -i 's/nk@2026/NK@2026/' intf.py</pre>
<pre class="out">AUTO&gt; python3 intf.py
<span class="hl">Status: 200</span></pre>
<p>200 aur crash nahi. Par abhi kuch print nahi hota, kyunki file TODO par khatam hoti hai. Har interface ka name aur enabled value print karne wala loop jodo, lab ke <code>edit</code> aur <code>insert</code> commands se (lines 14 aur 15):</p>
<pre class="out">AUTO&gt; edit intf.py 14 for i in interfaces:
    14  for i in interfaces:</pre>
<pre class="out">AUTO&gt; insert intf.py 15     print(i["name"], i["enabled"])
    15      print(i["name"], i["enabled"])</pre>
<pre class="out">AUTO&gt; python3 intf.py
Status: 200
GigabitEthernet0/0 True
GigabitEthernet0/1 True
GigabitEthernet0/2 False
GigabitEthernet0/3 True
<span class="hl">Loopback0 True</span></pre>
<p><code>print</code> ke aage chaar spaces dekho: yeh use loop ke andar rakhte hain.</p>

<h3>Script 2: loopbacks.py, PUT jo refuse hua</h3>
<p>Yeh file hai (<code>nl</code> se line numbers jode gaye). Do TODO items marked hain:</p>
<pre class="code">     1  # loopbacks.py - create Loopback100 on two routers with PUT, then check it with GET
     2  import requests
     3  requests.packages.urllib3.disable_warnings()
     4  
     5  AUTH = ("netops", "NK@2026")
     6  HEADERS = {"Content-Type": "application/yang-data+json", "Accept": "application/yang-data+json"}
     7  ROUTERS = {"10.99.0.1": "100.1.1.1", "10.99.0.2": "100.2.2.2"}   # router IP -&gt; loopback IP
     8  
     9  for host, lo_ip in ROUTERS.items():
    10      url = f"h&#116;tps://{host}/restconf/data/ietf-interfaces:interfaces/interface=Loopback100"
    11      body = {
    12          "ietf-interfaces:interface": {
    13              "name": "Loopback100",
    14              "type": "TODO",
    15              "ietf-ip:ipv4": {"address": [{"ip": lo_ip, "netmask": "255.255.255.255"}]},
    16          }
    17      }
    18      r = requests.put(url, auth=AUTH, headers=HEADERS, json=body, verify=False)   # create / replace
    19      print(host, "PUT -&gt;", r.status_code)
    20      # TODO: stop the script with an error if the PUT failed
    21      check = requests.get(url, auth=AUTH, headers=HEADERS, verify=False)          # verify
    22      ip = check.json()["ietf-interfaces:interface"]["ietf-ip:ipv4"]["address"][0]["ip"]
    23      print(host, "Loopback100 now has", ip)</pre>
<pre class="out">AUTO&gt; python3 loopbacks.py
<span class="hl">10.99.0.1 PUT -&gt; 400</span>
Traceback (most recent call last):
  File "loopbacks.py", line 22, in &lt;module&gt;
    ip = check.json()["ietf-interfaces:interface"]["ietf-ip:ipv4"]["address"][0]["ip"]
<span class="hl">KeyError: 'ietf-interfaces:interface'</span></pre>
<p>Phir status pehle: <code>PUT -> 400</code>. Neeche ka KeyError baad ka symptom hai (GET ko kuch mila nahi, kyunki kuch bana hi nahi). Router ne 400 <i>kyun</i> kaha yeh dekhne ke liye body print karo. Yeh test script wahi data bhejti hai aur <code>r.text</code> print karti hai:</p>
<pre class="code">import requests
requests.packages.urllib3.disable_warnings()
url = "h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback100"
body = {"ietf-interfaces:interface": {"name": "Loopback100", "type": "TODO"}}
r = requests.put(url, auth=("netops", "NK@2026"), headers={"Content-Type": "application/yang-data+json"}, json=body, verify=False)
print(r.status_code)
print(r.text)</pre><pre class="out">AUTO&gt; python3 s.py
<span class="hl">400</span>
{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
        "error-tag": "invalid-value",
<span class="hl">        "error-message": "type TODO is not valid for Loopback100 (expected iana-if-type:softwareLoopback)"</span>
      }
    ]
  }
}</pre>
<p>Router samasya ka naam batata hai: value <code>TODO</code> valid <code>type</code> nahi hai. Loopback ko <code>iana-if-type:softwareLoopback</code> chahiye. Isiliye achhi script call fail hone par <code>r.text</code> print karti hai.</p>
<p>Ab line 20 ka pehla TODO theek karo: PUT fail ho to script roko. Line 20 par <code>r.raise_for_status()</code> daalo, chaar spaces indent ke saath:</p>
<pre class="out">AUTO&gt; edit loopbacks.py 20     r.raise_for_status()
    20      r.raise_for_status()</pre>
<pre class="out">AUTO&gt; python3 loopbacks.py
10.99.0.1 PUT -&gt; 400
Traceback (most recent call last):
  File "loopbacks.py", line 20, in &lt;module&gt;
    r.raise_for_status()
<span class="hl">requests.exceptions.HTTPError: 400 Client Error: Bad Request for url: ...</span></pre>
<p>Script ab <i>fail hote PUT par hi</i> ruk jaati hai, baad mein crash hone ki jagah. (<code>for url:</code> ke baad ka lamba address chhota kiya gaya hai.) Phir line 14 ki value <code>sed</code> se theek karo, aur chalao:</p>
<pre class="out">AUTO&gt; sed -i 's/"TODO"/"iana-if-type:softwareLoopback"/' loopbacks.py</pre>
<pre class="out">AUTO&gt; python3 loopbacks.py
<span class="hl">10.99.0.1 PUT -&gt; 201</span>
10.99.0.1 Loopback100 now has 100.1.1.1
<span class="hl">10.99.0.2 PUT -&gt; 201</span>
10.99.0.2 Loopback100 now has 100.2.2.2</pre>
<pre class="out">AUTO&gt; python3 loopbacks.py
<span class="hl">10.99.0.1 PUT -&gt; 204</span>
10.99.0.1 Loopback100 now has 100.1.1.1
<span class="hl">10.99.0.2 PUT -&gt; 204</span>
10.99.0.2 Loopback100 now has 100.2.2.2</pre>
<p>Pehli run mein 201 (bana), doosri mein 204 (ek jaisa data se replace). Script ki apni GET address wapas print karti hai. Aakhri check ke taur par R2 par <code>show ip interface brief</code> (pichhla chapter dekho) <code>Loopback100</code> ko 100.2.2.2 ke saath dikhata hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek colleague script bhejta hai jo "bas KeyError print karti hai". Aap chalate ho, output ki bilkul pehli line dekhte ho aur status code 401 hai. Aap data structure ka code kholte hi nahi. Fix password mein ek akshar ka case hai. Traceback ki jagah status se shuru karne se sabse zyada samay bachta hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Pehli error ki jagah aakhri error debug karna. (2) Runs ke beech teen cheezein badalna. (3) Call fail hone par <code>r.text</code> print na karna. (4) Script theek karna par router check na karna. (5) File edit karke save karna bhool jaana, ya purani copy chalana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Response data par KeyError ka matlab aam taur par response error body thi, aapka expected data nahi: pehle <code>status_code</code> check karo. Traceback fail hui line dikhata hai; status aur body kyun batate hain. RESTCONF errors JSON body mein <code>error-message</code> ke saath hote hain.</p></div>

<div class="scn"><h4>Do bugs, ek script</h4><p>Aapko Friday ko loopbacks.py milti hai. Pehli run "PUT -> 400" aur KeyError print karti hai. Aap body print karte ho: "type TODO is not valid". Aap value badalte ho aur <code>raise_for_status()</code> jodte ho taaki agla bug (agar ho) script ko sahi line par roke. Doosri run: 201 aur 201. Teesri run: 204 aur 204. Aap R2 check karke khatam karte ho.</p><p><b>Lesson:</b> pehle status, phir body, har run mein ek fix, aakhir mein router.</p></div>

<div class="iv"><p class="q">"Script response data par KeyError ke saath crash hoti hai. Kaise debug karoge?"</p><p>Pehle status code dekhta hoon. 2xx nahi hai to body error message hai, data nahi, isliye KeyError sirf symptom hai. Router ka error-message padhne ke liye response text print karta hoon, ek cheez fix karta hoon aur dobara chalata hoon. Agli baar failure sahi line par dikhe isliye raise_for_status() bhi jodta hoon, aur safal run ke baad device par verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Data structure se pehle status code dekho.</li>
<li>Failure par r.text print karo: router wajah batata hai.</li>
<li>raise_for_status() jodo taaki errors sahi jagah rukein.</li>
<li>Har run mein ek cheez fix karo.</li>
<li>Read-back aur router par show command se khatam karo.</li>
</ul></div>

`}};export{e as default};