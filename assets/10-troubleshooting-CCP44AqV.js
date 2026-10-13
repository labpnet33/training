var e={id:`troubleshooting`,h:{en:`Troubleshooting NetBox automation in four layers`,hi:`NetBox automation ka troubleshooting chaar layers mein`},body:{en:`
<p>When a script fails, the error message points at the last thing that went wrong, not at the first. A plumber with a leaking tap does not start with the tap; they check the street valve, the main, the pipe and only then the tap. A NetBox script has the same shape, and it is faster to work from the bottom up than to guess.</p>

<h3>The four layers</h3>
<table class="cmp"><tr><th>Layer</th><th>Question</th><th>What fails</th><th>First check</th></tr>
<tr><td>1. Reach</td><td>Can I open a connection to the right address and port?</td><td><code>ConnectionError</code>, <code>Timeout</code></td><td>the URL in your env file; <code>curl</code> from the same host</td></tr>
<tr><td>2. Service</td><td>Is NetBox itself running behind the web server?</td><td>502 Bad Gateway, HTML instead of JSON</td><td><code>show netbox</code> or <code>systemctl status netbox</code> on the server</td></tr>
<tr><td>3. Identity</td><td>Does the server accept my token for this action?</td><td>403 Forbidden</td><td>the token, its write flag, which file it came from</td></tr>
<tr><td>4. Question</td><td>Did I ask for what I meant?</td><td>0 results, wrong count, IndexError</td><td>print the filter, check the count, try it in curl</td></tr></table>
<p>The order matters because a lower layer hides the ones above it: a stopped service makes every token look wrong to a careless reader, and a bad URL makes the service look stopped. Work up, fix one layer at a time and re-run after each.</p>

<h3>Lab 2 walk-through</h3>
<p>In Lab 2 an onboarding script, <code>onboard.py</code>, has four faults, one per layer plus the idempotence check. Here is each, in the order you meet it.</p>

<h3>Layer 1: reached the wrong port</h3>
<pre class="out">AUTO01$ python3 onboard.py
Traceback (most recent call last):
  File "onboard.py", line 6, in &lt;module&gt;
    print("NetBox", nb.version, nb.status()["netbox-version"])
  File "/usr/lib/python3.11/pynetbox/core/api.py", line 43, in version
    return Request(base=self.base_url, token=self.token, h&#116;tp_session=self.h&#116;tp_session).get_version()
  File "/usr/lib/python3.11/pynetbox/core/query.py", line 159, in get_version
    req = self.h&#116;tp_session.options(self.url, headers=headers)
  File "/usr/lib/python3.11/requests/sessions.py", line 54, in options
    return self.request('OPTIONS', url, **kwargs)
  File "/usr/lib/python3.11/requests/sessions.py", line 48, in request
    return requests.request(method, url, **kwargs)
requests.exceptions.ConnectionError: HTTPSConnectionPool(host='10.99.0.80', port=8443): Max retries exceeded with url: /api/ (Caused by NewConnectionError: [Errno 111] Co ...</pre>
<p>Read from the bottom. <code>ConnectionError</code> with "Connection refused" and <code>port=8443</code>: the machine answered, and nothing listens there. The URL in <code>~/.netbox.env</code> has <code>:8443</code>. Compare with the working lab URL, which uses the plain TLS port. Edit the file, run again. The traceback is long because pynetbox's own frames are shown; the useful line is the last.</p>

<h3>Layer 2: the server behind the server</h3>
<pre class="out">AUTO01$ python3 onboard.py
Traceback (most recent call last):
  File "onboard.py", line 6, in &lt;module&gt;
    print("NetBox", nb.version, nb.status()["netbox-version"])
  File "/usr/lib/python3.11/pynetbox/core/api.py", line 43, in version
    return Request(base=self.base_url, token=self.token, h&#116;tp_session=self.h&#116;tp_session).get_version()
  File "/usr/lib/python3.11/pynetbox/core/query.py", line 162, in get_version
    raise RequestError(req)
pynetbox.core.query.RequestError: The request failed with code 502 Bad Gateway but more specific details were not returned in json. Check the NetBox Logs or investigate t ...</pre>
<p>Now the connection works and the answer is 502. Compare what a 502 means with the earlier 400 and 403: those came from NetBox, which is up. A 502 comes from the web server (nginx), which is up, and says "I forwarded your request to NetBox and nobody answered". Use curl to see only the status line, then go to the server:</p>
<pre class="out">AUTO01$ curl -sk -i h&#116;tps://10.99.0.80/api/status/ | head -n 1
HT&#84;P/1.1 502 Bad Gateway</pre>
<pre class="out">NB# systemctl status netbox
○ netbox.service - NetBox WSGI Service
     Loaded: loaded (/etc/systemd/system/netbox.service; enabled; preset: enabled)
     Active: inactive (dead)
   Main PID: -</pre>
<p>The unit is "inactive (dead)". Start it, and check again.</p>
<pre class="out">NB# systemctl status netbox
● netbox.service - NetBox WSGI Service
     Loaded: loaded (/etc/systemd/system/netbox.service; enabled; preset: enabled)
     Active: active (running)
   Main PID: 1669 (gunicorn)</pre>

<h3>Layer 4: a question that matches nothing</h3>
<pre class="out">AUTO01$ python3 onboard.py
NetBox 4.1 4.1.11
core routers at pune: 0
Traceback (most recent call last):
  File "onboard.py", line 10, in &lt;module&gt;
    uplink = cores[0]
IndexError: list index out of range</pre>
<p>The script reached NetBox and printed "core routers at pune: 0", then crashed with IndexError. Two lessons in one: the crash is two lines <i>after</i> the real problem, and the real problem was a filter. The script asks for <code>status="staged"</code> but the routers are <code>active</code>. A filter value that is valid but matches nothing is not an error in NetBox; it is an empty answer, and your code must treat it as one. Print the count (this script does), then fix the argument.</p>

<h3>Layer 3: a token that may only read</h3>
<pre class="out">AUTO01$ python3 onboard.py
NetBox 4.1 4.1.11
core routers at pune: 2
uplink router: PUN-CORE-R1 10.99.0.1/24
Traceback (most recent call last):
  File "onboard.py", line 17, in &lt;module&gt;
    sw = nb.dcim.devices.create(name=NAME, status="planned",
  File "/usr/lib/python3.11/pynetbox/core/endpoint.py", line 84, in create
    req = Request(base=self.url, token=self.token, h&#116;tp_session=self.api.h&#116;tp_session).post(args[0] if args else kwargs)
  File "/usr/lib/python3.11/pynetbox/core/query.py", line 177, in post
    return self._make_call(verb='post', data=data)
  File "/usr/lib/python3.11/pynetbox/core/query.py", line 148, in _make_call
    raise RequestError(req, sent)
pynetbox.core.query.RequestError: The request failed with code 403 Forbidden: {'detail': 'You do not have permission to perform this action.'}</pre>
<p>Reading now works (two routers, an uplink chosen), and the first write is refused with 403 and "You do not have permission to perform this action". Compare this text with the one from chapter 7: "Invalid token" or "credentials were not provided" means NetBox does not know who you are; "do not have permission" means it knows exactly who you are and says no. Here the viewer token is read-only. The handover note in the home directory names the automation token, and the fix is to put it in the env file.</p>
<div class="warn"><p><b>Gotcha.</b> <code>load_dotenv()</code> does not overwrite a variable that is already set in the shell. If you edited <code>~/.netbox.env</code> but an old <code>NETBOX_URL</code> or token was exported earlier by <code>source</code>, the script keeps using the old one. Open a fresh shell, <code>unset</code> the variable, or use <code>load_dotenv(..., override=True)</code> when you want the file to win.</p></div>
<pre class="code">import os

from dotenv import load_dotenv

load_dotenv(os.path.expanduser("~/.netbox.env"))
print("URL after load_dotenv:", os.environ["NETBOX_URL"])
load_dotenv(os.path.expanduser("~/.netbox.env"), override=True)
print("URL after override=True:", os.environ["NETBOX_URL"])</pre>
<pre class="out">AUTO01$ python3 envdemo.py
URL after load_dotenv: h&#116;tps://example.invalid
URL after override=True: h&#116;tps://10.99.0.80</pre>

<h3>The finish line: run it twice</h3>
<pre class="out">AUTO01$ python3 onboard.py
NetBox 4.1 4.1.11
core routers at pune: 2
uplink router: PUN-CORE-R1 10.99.0.1/24
registered PUN-ACC-SW2 with 10.99.0.2/24 on Vlan99, uplink PUN-CORE-R1</pre>
<pre class="out">AUTO01$ python3 onboard.py; echo "exit code: $?"
NetBox 4.1 4.1.11
core routers at pune: 2
uplink router: PUN-CORE-R1 10.99.0.1/24
PUN-ACC-SW2 is already registered, nothing to do
<span class="hl">exit code: 0</span></pre>
<p>The first run registers the switch. The second run finds it, says so, and ends with exit code 0, as it should: "nothing to do" is success. A script you can run twice without damage is a script you can put in a scheduler.</p>

<h3>Reading the server's side</h3>
<p>The web server keeps a log of every request. When the script's own output is unclear, look there:</p>
<pre class="out">NB# tail -n 6 /var/log/nginx/access.log
10.99.0.60 - - [11/Oct/2026:15:36:55 +0000] "PATCH /api/dcim/devices/ HT&#84;P/1.1" 200 1981 "-" "python-requests/2.32.3"
10.99.0.60 - - [11/Oct/2026:15:36:56 +0000] "OPTIONS /api/ HT&#84;P/1.1" 200 153 "-" "python-requests/2.32.3"
10.99.0.60 - - [11/Oct/2026:15:36:56 +0000] "GET /api/status/ HT&#84;P/1.1" 200 414 "-" "python-requests/2.32.3"
10.99.0.60 - - [11/Oct/2026:15:36:56 +0000] "GET /api/dcim/devices/?site=pune&amp;role=core-router&amp;status=active HT&#84;P/1.1" 200 5103 "-" "python-requests/2.32.3"
10.99.0.60 - - [11/Oct/2026:15:36:56 +0000] "GET /api/ipam/ip-addresses/1/ HT&#84;P/1.1" 200 858 "-" "python-requests/2.32.3"
10.99.0.60 - - [11/Oct/2026:15:36:56 +0000] "GET /api/dcim/devices/?name=PUN-ACC-SW2 HT&#84;P/1.1" 200 2031 "-" "python-requests/2.32.3"</pre>
<p>Each line is a client address, a time, the verb and the path with its query string, the status and the size. In the real session above you can see the <code>OPTIONS /api/</code> that pynetbox uses to learn the version, the <code>GET /api/status/</code>, and the device filter the script sent. An unexpected 403 or 502 is visible here even when the script hid it.</p>
<pre class="out">NB# show netbox
NetBox 4.1.11 (REST API 4.1)
  services : nginx=up netbox=up postgresql=up redis=up rq=up
  listening: 443, 8000
  objects  : sites=2 devices=6 interfaces=27 prefixes=11 ip-addresses=12 vlans=6
  api calls: 171 (auth failures 4)</pre>

<div class="exam"><p><b>Exam trap.</b> 403 has two meanings in NetBox. "Authentication credentials were not provided" and "Invalid token" are about identity. "You do not have permission" is about authorisation. Different fix, same status code.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab has one NetBox host with nginx in front and a systemd-like service called <code>netbox</code>, plus <code>show netbox</code> as a shortcut. A real deployment adds gunicorn workers, PostgreSQL, Redis, perhaps a load balancer and a TLS-terminating proxy, so a 502 or 504 can come from any of those. Real logs are under <code>/var/log/nginx/</code> and in the journal for the <code>netbox</code> and <code>netbox-rq</code> units; commands and paths vary by installation method.</p></div>

<div class="scn"><h4>The token that worked on Monday</h4><p>A scheduled job started failing with 403 on every write. Reads still worked. Nobody had changed the script. The cause: a clean-up of API tokens had replaced a read-write token with a read-only one under the same description. The job log said only "403 Forbidden", but the same message split into two meanings, "no credentials" versus "no permission", pointed straight at authorisation.</p><p><b>Lesson:</b> read the whole message. The sentence after the status code tells you which layer to look at.</p></div>
<div class="iv"><p class="q">"Your NetBox script returns 502. What do you do?"</p><p>A 502 means the web server is reachable but NetBox behind it is not answering, so no token or filter change will help. I confirm with curl, then go to the server: is the netbox service running, are the logs showing a crash, is the database up. After the platform side is fixed I re-run the script unchanged.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work bottom up: reach, service, identity, question.</li>
<li>Connection refused or timeout: the URL, port or network. 502: the service behind the web server. 403: token or permission. 0 results: the question.</li>
<li>"Invalid token" and "permission" are different 403 messages with different fixes.</li>
<li>An environment variable already set beats <code>load_dotenv()</code> unless you pass <code>override=True</code>.</li>
<li>The server's access log shows what the script really sent.</li></ul></div>`,hi:`
<p>Script fail ho to error message aakhri galat cheez ko point karta hai, pehli ko nahi. Tap leak ho rahi ho to plumber tap se shuru nahi karta; woh street valve, main, pipe check karta hai aur tab tap. NetBox script ka bhi wahi swaroop hai, aur andaza lagane se neeche se upar kaam karna tez hai.</p>

<h3>Chaar layers</h3>
<table class="cmp"><tr><th>Layer</th><th>Sawal</th><th>Kya fail hota hai</th><th>Pehli jaanch</th></tr>
<tr><td>1. Reach</td><td>Kya sahi address aur port par connection khul sakta hai?</td><td><code>ConnectionError</code>, <code>Timeout</code></td><td>env file ka URL; usi host se <code>curl</code></td></tr>
<tr><td>2. Service</td><td>Kya NetBox khud web server ke peeche chal raha hai?</td><td>502 Bad Gateway, JSON ki jagah HTML</td><td>server par <code>show netbox</code> ya <code>systemctl status netbox</code></td></tr>
<tr><td>3. Identity</td><td>Kya server mera token is action ke liye maanta hai?</td><td>403 Forbidden</td><td>token, uska write flag, woh kis file se aaya</td></tr>
<tr><td>4. Question</td><td>Kya maine wahi maanga jo chahta tha?</td><td>0 results, galat count, IndexError</td><td>filter print karo, count dekho, curl mein try karo</td></tr></table>
<p>Kram isliye matter karta hai ki neeche ki layer upar wali ko chhupa leti hai: band service har token ko lapparwah padhne wale ke liye galat dikhati hai, aur galat URL service ko band dikhata hai. Upar chalo, ek baar mein ek layer theek karo aur har baar ke baad dobara chalao.</p>

<h3>Lab 2 ka walk-through</h3>
<p>Lab 2 mein onboarding script, <code>onboard.py</code>, mein chaar kharabiyan hain, har layer ke liye ek aur idempotence check. Yeh rahi har ek, us kram mein jismein aap milte ho.</p>

<h3>Layer 1: galat port par pahunche</h3>
<pre class="out">AUTO01$ python3 onboard.py
Traceback (most recent call last):
  File "onboard.py", line 6, in &lt;module&gt;
    print("NetBox", nb.version, nb.status()["netbox-version"])
  File "/usr/lib/python3.11/pynetbox/core/api.py", line 43, in version
    return Request(base=self.base_url, token=self.token, h&#116;tp_session=self.h&#116;tp_session).get_version()
  File "/usr/lib/python3.11/pynetbox/core/query.py", line 159, in get_version
    req = self.h&#116;tp_session.options(self.url, headers=headers)
  File "/usr/lib/python3.11/requests/sessions.py", line 54, in options
    return self.request('OPTIONS', url, **kwargs)
  File "/usr/lib/python3.11/requests/sessions.py", line 48, in request
    return requests.request(method, url, **kwargs)
requests.exceptions.ConnectionError: HTTPSConnectionPool(host='10.99.0.80', port=8443): Max retries exceeded with url: /api/ (Caused by NewConnectionError: [Errno 111] Co ...</pre>
<p>Neeche se padho. <code>ConnectionError</code> aur "Connection refused" aur <code>port=8443</code>: machine ne jawab diya, aur wahan koi sun nahi raha. <code>~/.netbox.env</code> ke URL mein <code>:8443</code> hai. Chalte hue lab URL se compare karo, jo plain TLS port use karta hai. File edit karo, dobara chalao. Traceback lamba isliye hai ki pynetbox ke apne frames dikhte hain; kaam ki line aakhri hai.</p>

<h3>Layer 2: server ke peeche ka server</h3>
<pre class="out">AUTO01$ python3 onboard.py
Traceback (most recent call last):
  File "onboard.py", line 6, in &lt;module&gt;
    print("NetBox", nb.version, nb.status()["netbox-version"])
  File "/usr/lib/python3.11/pynetbox/core/api.py", line 43, in version
    return Request(base=self.base_url, token=self.token, h&#116;tp_session=self.h&#116;tp_session).get_version()
  File "/usr/lib/python3.11/pynetbox/core/query.py", line 162, in get_version
    raise RequestError(req)
pynetbox.core.query.RequestError: The request failed with code 502 Bad Gateway but more specific details were not returned in json. Check the NetBox Logs or investigate t ...</pre>
<p>Ab connection chalta hai aur jawab 502 hai. Sochiye 502 ka matlab pehle ke 400 aur 403 se kaise alag hai: woh NetBox se aaye the, jo up hai. 502 web server (nginx) se aata hai, jo up hai, aur kehta hai "maine tumhari request NetBox ko bheji aur kisi ne jawab nahi diya". Curl se sirf status line dekho, phir server par jao:</p>
<pre class="out">AUTO01$ curl -sk -i h&#116;tps://10.99.0.80/api/status/ | head -n 1
HT&#84;P/1.1 502 Bad Gateway</pre>
<pre class="out">NB# systemctl status netbox
○ netbox.service - NetBox WSGI Service
     Loaded: loaded (/etc/systemd/system/netbox.service; enabled; preset: enabled)
     Active: inactive (dead)
   Main PID: -</pre>
<p>Unit "inactive (dead)" hai. Use start karo, aur dobara check karo.</p>
<pre class="out">NB# systemctl status netbox
● netbox.service - NetBox WSGI Service
     Loaded: loaded (/etc/systemd/system/netbox.service; enabled; preset: enabled)
     Active: active (running)
   Main PID: 1669 (gunicorn)</pre>

<h3>Layer 4: aisa sawal jo kuch match nahi karta</h3>
<pre class="out">AUTO01$ python3 onboard.py
NetBox 4.1 4.1.11
core routers at pune: 0
Traceback (most recent call last):
  File "onboard.py", line 10, in &lt;module&gt;
    uplink = cores[0]
IndexError: list index out of range</pre>
<p>Script NetBox tak pahunchi aur "core routers at pune: 0" print kiya, phir IndexError se crash hui. Ek mein do seekh: crash asli samasya ke do lines <i>baad</i> hai, aur asli samasya filter thi. Script <code>status="staged"</code> maangti hai par routers <code>active</code> hain. Valid par kuch match na karne wali filter value NetBox mein error nahi hai; woh khali jawab hai, aur aapke code ko use waise hi lena chahiye. Count print karo (yeh script karti hai), phir argument theek karo.</p>

<h3>Layer 3: token jo sirf padh sakta hai</h3>
<pre class="out">AUTO01$ python3 onboard.py
NetBox 4.1 4.1.11
core routers at pune: 2
uplink router: PUN-CORE-R1 10.99.0.1/24
Traceback (most recent call last):
  File "onboard.py", line 17, in &lt;module&gt;
    sw = nb.dcim.devices.create(name=NAME, status="planned",
  File "/usr/lib/python3.11/pynetbox/core/endpoint.py", line 84, in create
    req = Request(base=self.url, token=self.token, h&#116;tp_session=self.api.h&#116;tp_session).post(args[0] if args else kwargs)
  File "/usr/lib/python3.11/pynetbox/core/query.py", line 177, in post
    return self._make_call(verb='post', data=data)
  File "/usr/lib/python3.11/pynetbox/core/query.py", line 148, in _make_call
    raise RequestError(req, sent)
pynetbox.core.query.RequestError: The request failed with code 403 Forbidden: {'detail': 'You do not have permission to perform this action.'}</pre>
<p>Padhna ab chalta hai (do routers, uplink chuna gaya), aur pehla write 403 aur "You do not have permission to perform this action" se mana ho gaya. Is text ko chapter 7 wale se compare karo: "Invalid token" ya "credentials were not provided" matlab NetBox aapko nahi jaanta; "do not have permission" matlab woh aapko theek se jaanta hai aur mana karta hai. Yahan viewer token read-only hai. Home directory ka handover note automation token ka naam batata hai, aur hal hai use env file mein daalna.</p>
<div class="warn"><p><b>Gotcha.</b> <code>load_dotenv()</code> shell mein pehle se set variable ko overwrite nahi karta. Agar aapne <code>~/.netbox.env</code> edit kiya par purana <code>NETBOX_URL</code> ya token pehle <code>source</code> se export ho chuka tha, to script purana hi use karti rehti hai. Naya shell kholo, variable <code>unset</code> karo, ya jab file ko jeetna ho to <code>load_dotenv(..., override=True)</code> use karo.</p></div>
<pre class="code">import os

from dotenv import load_dotenv

load_dotenv(os.path.expanduser("~/.netbox.env"))
print("URL after load_dotenv:", os.environ["NETBOX_URL"])
load_dotenv(os.path.expanduser("~/.netbox.env"), override=True)
print("URL after override=True:", os.environ["NETBOX_URL"])</pre>
<pre class="out">AUTO01$ python3 envdemo.py
URL after load_dotenv: h&#116;tps://example.invalid
URL after override=True: h&#116;tps://10.99.0.80</pre>

<h3>Finish line: do baar chalao</h3>
<pre class="out">AUTO01$ python3 onboard.py
NetBox 4.1 4.1.11
core routers at pune: 2
uplink router: PUN-CORE-R1 10.99.0.1/24
registered PUN-ACC-SW2 with 10.99.0.2/24 on Vlan99, uplink PUN-CORE-R1</pre>
<pre class="out">AUTO01$ python3 onboard.py; echo "exit code: $?"
NetBox 4.1 4.1.11
core routers at pune: 2
uplink router: PUN-CORE-R1 10.99.0.1/24
PUN-ACC-SW2 is already registered, nothing to do
<span class="hl">exit code: 0</span></pre>
<p>Pehli run switch register karti hai. Doosri run use dhoondhti hai, bata deti hai, aur exit code 0 par khatam hoti hai, jaisa honi chahiye: "kuch karna nahi" safalta hai. Jis script ko aap bina nuksan ke do baar chala sakte ho use scheduler mein daal sakte ho.</p>

<h3>Server ki taraf padhna</h3>
<p>Web server har request ka log rakhta hai. Script ka apna output saaf na ho to wahan dekho:</p>
<pre class="out">NB# tail -n 6 /var/log/nginx/access.log
10.99.0.60 - - [11/Oct/2026:15:36:55 +0000] "PATCH /api/dcim/devices/ HT&#84;P/1.1" 200 1981 "-" "python-requests/2.32.3"
10.99.0.60 - - [11/Oct/2026:15:36:56 +0000] "OPTIONS /api/ HT&#84;P/1.1" 200 153 "-" "python-requests/2.32.3"
10.99.0.60 - - [11/Oct/2026:15:36:56 +0000] "GET /api/status/ HT&#84;P/1.1" 200 414 "-" "python-requests/2.32.3"
10.99.0.60 - - [11/Oct/2026:15:36:56 +0000] "GET /api/dcim/devices/?site=pune&amp;role=core-router&amp;status=active HT&#84;P/1.1" 200 5103 "-" "python-requests/2.32.3"
10.99.0.60 - - [11/Oct/2026:15:36:56 +0000] "GET /api/ipam/ip-addresses/1/ HT&#84;P/1.1" 200 858 "-" "python-requests/2.32.3"
10.99.0.60 - - [11/Oct/2026:15:36:56 +0000] "GET /api/dcim/devices/?name=PUN-ACC-SW2 HT&#84;P/1.1" 200 2031 "-" "python-requests/2.32.3"</pre>
<p>Har line mein client address, waqt, verb aur query string ke saath path, status aur size hota hai. Upar ke asli session mein aap <code>OPTIONS /api/</code> dekh sakte ho jo pynetbox version jaanne ke liye use karta hai, <code>GET /api/status/</code>, aur woh device filter jo script ne bheja. Anokha 403 ya 502 yahan dikh jata hai chahe script ne use chhupa diya ho.</p>
<pre class="out">NB# show netbox
NetBox 4.1.11 (REST API 4.1)
  services : nginx=up netbox=up postgresql=up redis=up rq=up
  listening: 443, 8000
  objects  : sites=2 devices=6 interfaces=27 prefixes=11 ip-addresses=12 vlans=6
  api calls: 171 (auth failures 4)</pre>

<div class="exam"><p><b>Exam trap.</b> NetBox mein 403 ke do matlab hain. "Authentication credentials were not provided" aur "Invalid token" identity ke baare mein hain. "You do not have permission" authorisation ke baare mein hai. Alag hal, wahi status code.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> Lab mein ek NetBox host hai jiske aage nginx hai aur <code>netbox</code> naam ki systemd jaisi service, aur shortcut ke taur par <code>show netbox</code>. Asli deployment mein gunicorn workers, PostgreSQL, Redis, shayad load balancer aur TLS-terminating proxy bhi hote hain, isliye 502 ya 504 inme se kisi se bhi aa sakta hai. Asli logs <code>/var/log/nginx/</code> mein aur <code>netbox</code> aur <code>netbox-rq</code> units ke journal mein hote hain; commands aur paths installation ke tareeke par nirbhar hain.</p></div>

<div class="scn"><h4>Token jo Monday ko chalta tha</h4><p>Ek scheduled job har write par 403 ke saath fail hone lagi. Reads phir bhi chalte the. Script kisi ne nahi badli. Wajah: API tokens ki safai mein ek read-write token ki jagah usi description ka read-only token aa gaya. Job log mein sirf "403 Forbidden" tha, par wahi message do matlab mein bantta hai, "no credentials" ya "no permission", aur wo seedha authorisation ki taraf le gaya.</p><p><b>Lesson:</b> poora message padho. Status code ke baad ka vaakya batata hai ki kaun si layer dekhni hai.</p></div>
<div class="iv"><p class="q">"Aapki NetBox script 502 lautati hai. Kya karte ho?"</p><p>502 matlab web server pahunch mein hai par uske peeche NetBox jawab nahi de raha, isliye token ya filter badalne se kuch nahi hoga. Main curl se confirm karta hoon, phir server par jata hoon: netbox service chal rahi hai kya, logs mein crash dikh raha hai kya, database up hai kya. Platform side theek hone ke baad script ko bina badle dobara chalata hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Neeche se upar kaam karo: reach, service, identity, question.</li>
<li>Connection refused ya timeout: URL, port ya network. 502: web server ke peeche ki service. 403: token ya permission. 0 results: sawal.</li>
<li>"Invalid token" aur "permission" alag 403 messages hain, alag hal ke saath.</li>
<li>Pehle se set environment variable <code>load_dotenv()</code> ko haraata hai jab tak <code>override=True</code> na do.</li>
<li>Server ka access log dikhata hai ki script ne asal mein kya bheja.</li></ul></div>`}};export{e as default};