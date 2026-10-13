var e={id:`client-capabilities`,h:{en:`pygnmi: connecting and asking for Capabilities`,hi:`pygnmi: connect karna aur Capabilities poochhna`},body:{en:`
<p>Before you read or change anything, you phone the device, say who you are, and ask what it can do. In pygnmi that is three steps: create a client, connect, call <code>capabilities()</code>. This chapter is Lab 1, task 1.</p>

<h3>Creating the client</h3>
<p>Install is one line on a real host: <code>pip install pygnmi</code>. The lab already has it. The import and the call look like this:</p>
<pre class="code">from pygnmi.client import gNMIclient, gNMIException

with gNMIclient(target=("10.99.0.11", 6030), username="netops",
                password="NK@2026", insecure=True) as gc:
    ...                    <span class="c"># gc is connected here and closed on exit</span></pre>
<table class="cmp"><tr><th>Argument</th><th>Meaning</th></tr>
<tr><td><code>target=(host, port)</code></td><td>A tuple, never a string. Host is the device address.</td></tr>
<tr><td><code>username</code>, <code>password</code></td><td>Sent as call metadata on every request. The device checks them.</td></tr>
<tr><td><code>insecure=True</code></td><td>Plaintext gRPC, no TLS at all.</td></tr>
<tr><td><code>path_root</code>, <code>path_cert</code>, <code>path_key</code></td><td>Files for TLS: CA certificate, client certificate, client key.</td></tr>
<tr><td><code>override</code></td><td>The name to check against the server certificate.</td></tr>
<tr><td><code>skip_verify=True</code></td><td>Use TLS but do not validate the certificate. Test only.</td></tr>
<tr><td><code>gnmi_timeout</code></td><td>Seconds to wait for the server.</td></tr></table>
<p>You can use <code>with</code> (recommended) or call <code>gc.connect()</code> and <code>gc.close()</code> yourself. The first guarantees the channel closes even if your code fails.</p>

<h3>Capabilities</h3>
<p>The reply is a dictionary with three keys: <code>gnmi_version</code>, <code>supported_encodings</code> and <code>supported_models</code> (a list; each model has a name, organization and version). Write it to <code>cap.py</code> on AUTO01 with a heredoc, then run it:</p>
<pre class="code">cat &gt; cap.py &lt;&lt;'EOF'
<span class="c">... paste the script below, then type EOF on its own line</span></pre>
<pre class="code">from pygnmi.client import gNMIclient

with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    cap = gc.capabilities()
    print("gNMI version:", cap["gnmi_version"])
    print("encodings:", ", ".join(cap["supported_encodings"]))
    print("models:", len(cap["supported_models"]))
    for m in cap["supported_models"][:3]:
        print(" ", m["name"], m["version"])</pre>
<pre class="out">AUTO01$ python3 cap.py
<span class="hl">gNMI version: 0.7.0</span>
encodings: json, json_ietf, ascii
models: 12
  openconfig-interfaces 2.4.3
  openconfig-if-ip 3.0.0
  openconfig-if-ethernet 2.11.0</pre>
<p>LEAF1 speaks gNMI 0.7.0, accepts json, json_ietf and ascii, and serves 12 models. Lab 1, task 1 asks for the version. Read the model list too: if <code>openconfig-interfaces</code> is missing, none of your interface paths will work.</p>
<div class="eg"><p><b>Worked example.</b> You inherit a script that fails on a new router with "Unsupported encoding JSON". You call <code>capabilities()</code> on it and see <code>['json_ietf', 'proto']</code>. The fix is <code>encoding="json_ietf"</code>, not a new library.</p></div>

<h3>Connecting is where failures start</h3>
<p>Three attempts show the difference between "closed door" and "no house". The script times each one with a 3-second limit:</p>
<pre class="code">import time
from pygnmi.client import gNMIclient, gNMIException

TRIES = [("10.99.0.11", 6030), ("10.99.0.11", 6031), ("10.99.0.99", 6030)]
for host, port in TRIES:
    t0 = time.time()
    gc = gNMIclient(target=(host, port), username="netops", password="NK@2026", insecure=True, gnmi_timeout=3)
    try:
        gc.connect()
        print(host, port, "connected")
    except gNMIException as err:
        print(host, port, "ERR", str(err).split("last error: ")[-1])
    finally:
        gc.close()
    print("  took", round(time.time() - t0, 1), "s")</pre>
<pre class="out">AUTO01$ python3 d_conn.py
10.99.0.11 6030 connected
  took 0.0 s
<span class="hl">10.99.0.11 6031 ERR UNKNOWN: ipv4:10.99.0.11:6031: Failed to connect to remote host: Connection refused</span>
  took 0.0 s
<span class="hl">10.99.0.99 6030 ERR UNKNOWN: ipv4:10.99.0.99:6030: Failed to connect to remote host: Timeout occurred: FD Shutdown</span>
  took 3.0 s</pre>
<p>A device that is up but not listening refuses at once. An address with nothing behind it costs the whole timeout. A loop over forty dead switches at 5 seconds each takes over three minutes, so keep <code>gnmi_timeout</code> small and use threads (see <code>py-concurrency</code>) for big fleets. Both failures raise <code>gNMIException</code>, the one exception class pygnmi uses for every gRPC problem, so one <code>except gNMIException as err:</code> catches them all and <code>str(err)</code> holds the text you will learn to read in chapter 9.</p>

<div class="warn"><p><b>Common mistake.</b> Writing the password in the script and committing it. Chapter 8 shows environment variables. Another: forgetting <code>insecure=True</code> against a plaintext server, which looks like a hang or a TLS error.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>insecure=True</code> means plaintext gRPC with no TLS. It does not mean "TLS but ignore the certificate". That is <code>skip_verify=True</code>.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab needs an IP address in <code>target</code> because there is no DNS. Real pygnmi accepts a name. The lab clock is virtual, so a timeout costs simulated time and not real waiting.</p></div>

<div class="scn"><h4>Forty switches, three minutes</h4><p>An audit script walked forty EOS switches one by one. Six were in a maintenance window and each cost the full default timeout. The run took longer than the change window. The fix: lower <code>gnmi_timeout</code>, run eight workers at once, and log the dead ones.</p><p><b>Lesson:</b> unreachable is expensive; refused is cheap.</p></div>
<div class="iv"><p class="q">"What does the Capabilities RPC return and why call it first?"</p><p>The gNMI version, the supported encodings and the list of YANG models with versions. Call it first so the script picks an encoding the device accepts and checks that the models it needs are present.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>gNMIclient(target=(host, port), ...)</code> with <code>with</code> is the standard pattern.</li>
<li><code>insecure=True</code> is plaintext; TLS uses path_root, override or skip_verify.</li>
<li><code>capabilities()</code> returns version, encodings and models.</li>
<li>All failures raise <code>gNMIException</code>.</li>
<li>Refused returns fast; unreachable waits for the timeout.</li></ul></div>
`,hi:`
<p>Kuch padhne ya badalne se pehle aap device ko phone karte ho, batate ho aap kaun ho, aur poochhte ho woh kya kar sakta hai. pygnmi mein yeh teen steps hain: client banao, connect karo, <code>capabilities()</code> call karo. Yeh chapter Lab 1 ka task 1 hai.</p>

<h3>Client banana</h3>
<p>Asli host par install ek line hai: <code>pip install pygnmi</code>. Lab mein pehle se hai. Import aur call aise dikhte hain:</p>
<pre class="code">from pygnmi.client import gNMIclient, gNMIException

with gNMIclient(target=("10.99.0.11", 6030), username="netops",
                password="NK@2026", insecure=True) as gc:
    ...                    <span class="c"># gc yahan connected hai aur exit par band hota hai</span></pre>
<table class="cmp"><tr><th>Argument</th><th>Matlab</th></tr>
<tr><td><code>target=(host, port)</code></td><td>Tuple, kabhi string nahi. Host device ka address hai.</td></tr>
<tr><td><code>username</code>, <code>password</code></td><td>Har request par call metadata ki tarah jaate hain. Device unhe check karta hai.</td></tr>
<tr><td><code>insecure=True</code></td><td>Plaintext gRPC, bilkul TLS nahi.</td></tr>
<tr><td><code>path_root</code>, <code>path_cert</code>, <code>path_key</code></td><td>TLS ki files: CA certificate, client certificate, client key.</td></tr>
<tr><td><code>override</code></td><td>Server certificate ke saath check hone wala naam.</td></tr>
<tr><td><code>skip_verify=True</code></td><td>TLS use karo par certificate validate mat karo. Sirf test ke liye.</td></tr>
<tr><td><code>gnmi_timeout</code></td><td>Server ka intezaar kitne seconds.</td></tr></table>
<p>Aap <code>with</code> use kar sakte ho (recommended) ya khud <code>gc.connect()</code> aur <code>gc.close()</code> call kar sakte ho. Pehla guarantee deta hai ki code fail ho tab bhi channel band ho.</p>

<h3>Capabilities</h3>
<p>Reply ek dictionary hai jisme teen keys hain: <code>gnmi_version</code>, <code>supported_encodings</code> aur <code>supported_models</code> (ek list; har model mein name, organization aur version). Ise AUTO01 par heredoc se <code>cap.py</code> mein likho, phir chalao:</p>
<pre class="code">cat &gt; cap.py &lt;&lt;'EOF'
<span class="c">... neeche ki script paste karo, phir EOF akele ek line mein type karo</span></pre>
<pre class="code">from pygnmi.client import gNMIclient

with gNMIclient(target=("10.99.0.11", 6030), username="netops", password="NK@2026", insecure=True) as gc:
    cap = gc.capabilities()
    print("gNMI version:", cap["gnmi_version"])
    print("encodings:", ", ".join(cap["supported_encodings"]))
    print("models:", len(cap["supported_models"]))
    for m in cap["supported_models"][:3]:
        print(" ", m["name"], m["version"])</pre>
<pre class="out">AUTO01$ python3 cap.py
<span class="hl">gNMI version: 0.7.0</span>
encodings: json, json_ietf, ascii
models: 12
  openconfig-interfaces 2.4.3
  openconfig-if-ip 3.0.0
  openconfig-if-ethernet 2.11.0</pre>
<p>LEAF1 gNMI 0.7.0 bolta hai, json, json_ietf aur ascii accept karta hai, aur 12 models serve karta hai. Lab 1 ka task 1 version poochhta hai. Model list bhi padho: agar <code>openconfig-interfaces</code> missing hai, to aapka koi interface path kaam nahi karega.</p>
<div class="eg"><p><b>Worked example.</b> Aapko ek purani script milti hai jo naye router par "Unsupported encoding JSON" ke saath fail hoti hai. Aap uspar <code>capabilities()</code> chalate ho aur <code>['json_ietf', 'proto']</code> dikhta hai. Fix <code>encoding="json_ietf"</code> hai, nayi library nahi.</p></div>

<h3>Failure connect se hi shuru hota hai</h3>
<p>Teen koshishein "band darwaza" aur "ghar hi nahi" ka fark dikhati hain. Script har ek ko 3 second ki limit se time karti hai:</p>
<pre class="code">import time
from pygnmi.client import gNMIclient, gNMIException

TRIES = [("10.99.0.11", 6030), ("10.99.0.11", 6031), ("10.99.0.99", 6030)]
for host, port in TRIES:
    t0 = time.time()
    gc = gNMIclient(target=(host, port), username="netops", password="NK@2026", insecure=True, gnmi_timeout=3)
    try:
        gc.connect()
        print(host, port, "connected")
    except gNMIException as err:
        print(host, port, "ERR", str(err).split("last error: ")[-1])
    finally:
        gc.close()
    print("  took", round(time.time() - t0, 1), "s")</pre>
<pre class="out">AUTO01$ python3 d_conn.py
10.99.0.11 6030 connected
  took 0.0 s
<span class="hl">10.99.0.11 6031 ERR UNKNOWN: ipv4:10.99.0.11:6031: Failed to connect to remote host: Connection refused</span>
  took 0.0 s
<span class="hl">10.99.0.99 6030 ERR UNKNOWN: ipv4:10.99.0.99:6030: Failed to connect to remote host: Timeout occurred: FD Shutdown</span>
  took 3.0 s</pre>
<p>Jo device up hai par sun nahi raha woh turant refuse karta hai. Jis address ke peeche kuch nahi, woh poora timeout kha leta hai. Chaalis dead switches par 5 second har ek ka loop teen minute se zyada leta hai, isliye <code>gnmi_timeout</code> chhota rakho aur bade fleets ke liye threads use karo (<code>py-concurrency</code> dekho). Dono failures <code>gNMIException</code> raise karte hain, jo pygnmi har gRPC problem ke liye use karta hai, isliye ek <code>except gNMIException as err:</code> sab pakadta hai aur <code>str(err)</code> mein woh text hota hai jo aap chapter 9 mein padhna seekhoge.</p>

<div class="warn"><p><b>Aam galti.</b> Password script mein likhna aur commit kar dena. Chapter 8 mein environment variables hain. Doosri: plaintext server ke saamne <code>insecure=True</code> bhool jaana, jo hang ya TLS error jaisa dikhta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>insecure=True</code> ka matlab plaintext gRPC bina TLS ke. Iska matlab "TLS par certificate ignore" nahi hai. Woh <code>skip_verify=True</code> hai.</p></div>
<div class="note"><p><b>Lab vs asli gear.</b> Lab mein <code>target</code> mein IP address chahiye kyunki DNS nahi hai. Asli pygnmi naam accept karta hai. Lab ki clock virtual hai, isliye timeout simulated time kharch karta hai, asli intezaar nahi.</p></div>

<div class="scn"><h4>Chaalis switches, teen minute</h4><p>Ek audit script chaalis EOS switches ko ek-ek karke chalti thi. Chhe maintenance window mein the aur har ek ne poora default timeout kharch kiya. Run change window se lamba chala. Fix: <code>gnmi_timeout</code> kam kiya, aath workers ek saath chalaye, aur dead switches log kiye.</p><p><b>Lesson:</b> unreachable mehenga hai; refused sasta hai.</p></div>
<div class="iv"><p class="q">"Capabilities RPC kya return karta hai aur pehle kyon call karte hain?"</p><p>gNMI version, supported encodings aur versions ke saath YANG models ki list. Pehle isliye ki script aisi encoding chune jo device accept kare aur check kare ki zaroori models maujood hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>gNMIclient(target=(host, port), ...)</code> aur <code>with</code> standard pattern hai.</li>
<li><code>insecure=True</code> plaintext hai; TLS ke liye path_root, override ya skip_verify.</li>
<li><code>capabilities()</code> version, encodings aur models deta hai.</li>
<li>Saari failures <code>gNMIException</code> raise karti hain.</li>
<li>Refused jaldi aata hai; unreachable timeout tak rukta hai.</li></ul></div>
`}};export{e as default};