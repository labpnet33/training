var e={id:`vendors-security`,h:{en:`Vendors, TLS and accounts: EOS, IOS XE and Junos`,hi:`Vendors, TLS aur accounts: EOS, IOS XE aur Junos`},body:{en:`
<p>All three vendors speak the same language, gNMI, but with different accents: other ports, other encodings, other enable commands, other limits. A script that works on Arista and fails on Cisco is almost always an accent problem, not a bug. This chapter shows the accents, then the security basics that every real deployment needs.</p>

<h3>One script, three vendors</h3>
<table class="cmp"><tr><th></th><th>Arista EOS</th><th>Cisco IOS XE</th><th>Junos</th></tr>
<tr><td>Enable</td><td><code>management api gnmi</code></td><td><code>gnxi</code></td><td><code>set system services extension-service request-response grpc clear-text port 32767</code>, <code>commit</code></td></tr>
<tr><td>Plaintext / TLS port</td><td>6030 / 6030 with SSL profile</td><td>50052 / 9339</td><td>32767 / 50051</td></tr>
<tr><td>gNMI version (lab)</td><td>0.7.0</td><td>0.5.0</td><td>0.7.0</td></tr>
<tr><td>Encodings</td><td>json, json_ietf, ascii</td><td>json_ietf, proto</td><td>json, json_ietf, proto</td></tr>
<tr><td>Min / default sample</td><td>1 s / 10 s</td><td>5 s / 30 s</td><td>2 s / 10 s</td></tr>
<tr><td>Who may connect</td><td>local users; Set needs privilege 15</td><td>privilege 15 users only</td><td>login users; read-only class cannot Set</td></tr></table>
<p>The script below asks each device for capabilities and uses the <i>first</i> encoding the device lists, so it never sends one that is refused:</p>
<pre class="code">from pygnmi.client import gNMIclient, gNMIException

TARGETS = [
    ("LEAF1 EOS", "10.99.0.11", 6030, "netops", "NK@2026"),
    ("XE1 IOS XE", "10.99.0.1", 50052, "netops", "NK@2026"),
    ("J1 Junos", "10.99.0.21", 32767, "netops", "NK@2026"),
]
for name, host, port, user, pw in TARGETS:
    try:
        with gNMIclient(target=(host, port), username=user, password=pw, insecure=True) as gc:
            cap = gc.capabilities()
            hn = gc.get(path=["/system/state/hostname"], encoding=cap["supported_encodings"][0])
            print(f"{name:&lt;11} gNMI {cap['gnmi_version']}  {len(cap['supported_models'])} models  {cap['supported_encodings']}  hostname={hn['notification'][0]['update'][0]['val']}")
    except gNMIException as err:
        print(name, "ERR", err)</pre>
<pre class="out">AUTO01$ python3 d_multi.py
<span class="hl">LEAF1 EOS   gNMI 0.7.0  12 models  ['json', 'json_ietf', 'ascii']  hostname=LEAF1</span>
<span class="hl">XE1 IOS XE  gNMI 0.5.0  10 models  ['json_ietf', 'proto']  hostname=XE1</span>
<span class="hl">J1 Junos    gNMI 0.7.0  10 models  ['json', 'json_ietf', 'proto']  hostname=J1</span></pre>
<p>Notice the model counts and versions differ, yet the same call worked three times. The enable steps on the other two vendors:</p>
<pre class="code"><span class="c">! IOS XE: plaintext on 50052; add TLS on 9339</span>
gnxi
gnxi secure-init
gnxi secure-server

<span class="c"># Junos, configuration mode</span>
set system services extension-service request-response grpc clear-text port 32767
commit</pre>
<pre class="out">R1# show gnxi state
State         Status
-------------------------------------------
Admin         Enabled
Oper          Up
<span class="hl">Insecure      port 50052 (running, plaintext)</span>
Secure        disabled</pre>
<pre class="out">J1&gt; show configuration system services extension-service | display set
set system services extension-service request-response grpc clear-text port 32767</pre>

<h3>TLS in three flavours</h3>
<p>Plaintext (<code>insecure=True</code>) is for labs. A real server uses TLS, and the client must trust its certificate: give <code>path_root</code> (the CA certificate), and if the certificate's name does not match the address you used, <code>override</code> with the name inside it. <code>skip_verify=True</code> turns validation off; use it to test, never in production. Against a TLS server on LEAF2 (SSL profile GNMI-TLS):</p>
<pre class="code">from pygnmi.client import gNMIclient, gNMIException

CASES = [
    ("LEAF2 TLS, plaintext client", "10.99.0.12", dict(insecure=True)),
    ("LEAF2 TLS, CA file only", "10.99.0.12", dict(path_root="/home/netadmin/gnmi-ca.pem")),
    ("LEAF2 TLS, CA + override", "10.99.0.12", dict(path_root="/home/netadmin/gnmi-ca.pem", override="LEAF2")),
    ("LEAF2 TLS, skip_verify", "10.99.0.12", dict(skip_verify=True)),
    ("LEAF1 plain, TLS client", "10.99.0.11", dict(skip_verify=True)),
]
for label, host, opts in CASES:
    try:
        with gNMIclient(target=(host, 6030), username="netops", password="NK@2026", **opts) as gc:
            print(f"{label:&lt;28} OK {gc.capabilities()['gnmi_version']}")
    except gNMIException as err:
        print(f"{label:&lt;28} ERR", str(err).split("last error: ")[-1])</pre>
<pre class="out">AUTO01$ python3 d_tls.py
<span class="hl">LEAF2 TLS, plaintext client  ERR UNKNOWN: ipv4:10.99.0.12:6030: Socket closed</span>
<span class="hl">LEAF2 TLS, CA file only      ERR UNKNOWN: ipv4:10.99.0.12:6030: Ssl handshake failed: SSL_ERROR_SSL: error:1000007d:SSL routines:OPENSSL_internal:CERTIFICATE_VERIFY_FAILED: Peer name 10.99.0.12 is not in peer certificate</span>
<span class="hl">LEAF2 TLS, CA + override     OK 0.7.0</span>
<span class="hl">LEAF2 TLS, skip_verify       OK 0.7.0</span>
<span class="hl">LEAF1 plain, TLS client      ERR UNKNOWN: ipv4:10.99.0.11:6030: Ssl handshake failed: SSL_ERROR_SSL: error:100000f7:SSL routines:OPENSSL_internal:WRONG_VERSION_NUMBER</span></pre>
<p>Read the failures. A plaintext client against a TLS port gets "Socket closed". A TLS client without a name match gets CERTIFICATE_VERIFY_FAILED. A TLS client against a plaintext port gets WRONG_VERSION_NUMBER. Each is a mismatch between what the client speaks and what the port expects.</p>

<h3>Accounts and secrets</h3>
<p>The username and password travel as metadata on every call, so TLS matters, because plaintext shows them to anyone on the path. Give a monitoring script a read-only account: it can Get and Subscribe, but a Set is refused.</p>
<pre class="out">AUTO01$ python3 d_auth.py
<span class="hl">wrong password get     ERR gNMI Error: &lt;StatusCode.UNAUTHENTICATED: (16, 'unauthenticated')&gt; Authentication failed</span>
<span class="hl">no username get        ERR gNMI Error: &lt;StatusCode.UNAUTHENTICATED: (16, 'unauthenticated')&gt; Authentication failed</span>
viewer get             OK LEAF1
<span class="hl">viewer set             ERR gNMI Error: &lt;StatusCode.PERMISSION_DENIED: (7, 'permission denied')&gt; User is not authorized to modify the configuration (privilege level 15 required)</span>
netops set             OK UPDATE</pre>
<p>UNAUTHENTICATED means the device does not know who you are. PERMISSION_DENIED means it knows, and the answer is no. Keep passwords out of the script, as you learned in <code>py-secrets</code>:</p>
<pre class="code">import os
from pygnmi.client import gNMIclient

user = os.environ["GNMI_USER"]
password = os.environ["GNMI_PASS"]
with gNMIclient(target=("10.99.0.11", 6030), username=user, password=password, insecure=True) as gc:
    print("connected as", user, "- gNMI", gc.capabilities()["gnmi_version"])</pre>
<pre class="out">AUTO01$ GNMI_USER=netops GNMI_PASS=NK@2026 python3 d_env.py
connected as netops - gNMI 0.7.0</pre>

<div class="warn"><p><b>Common mistake.</b> Using <code>skip_verify=True</code> "just for now" and leaving it. Anyone who can intercept the connection can read the credentials. Another: giving the monitoring account privilege 15.</p></div>
<div class="exam"><p><b>Exam trap.</b> IOS XE listens on two ports: 50052 plaintext and 9339 secure. Which one works depends on which <code>gnxi</code> commands were typed. Junos and EOS also separate plaintext from TLS by configuration, not by guesswork.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab version numbers, minimum and default sample intervals are plausible lab values, not read from real images. TLS in the lab is a rule: <code>skip_verify=True</code>, or an <code>override</code> equal to the device name, succeeds; certificate files are not opened. Real handshakes check the certificate chain.</p></div>

<div class="scn"><h4>The monitoring account that could reload</h4><p>A review found that the telemetry collector logged in with the full admin account. It only ever read counters. The team created a read-only user, moved the password to the collector's secret store, and the next Set attempt from the collector, a typo in a test, was refused.</p><p><b>Lesson:</b> least privilege turns a mistake into an error message.</p></div>
<div class="iv"><p class="q">"A script works on EOS and fails on IOS XE. Where do you look first?"</p><p>Port (6030 versus 50052 or 9339), encoding (XE has no plain json), whether TLS is on, and the privilege of the account. Call capabilities on the failing box and read the answer instead of guessing.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EOS 6030, IOS XE 50052 and 9339, Junos 32767; each has its own enable commands.</li>
<li>Pick the encoding from capabilities, not from habit.</li>
<li>TLS: path_root and override for real use, skip_verify only to test.</li>
<li>UNAUTHENTICATED is identity, PERMISSION_DENIED is rights.</li>
<li>Read-only accounts for monitoring; secrets from the environment.</li></ul></div>
`,hi:`
<p>Teeno vendors ek hi zubaan, gNMI, bolte hain, par alag lehje ke saath: alag ports, alag encodings, alag enable commands, alag limits. Jo script Arista par chalti hai aur Cisco par fail hoti hai woh lagbhag hamesha lehje ki problem hoti hai, bug nahi. Yeh chapter lehje dikhata hai, phir woh security basics jo har asli deployment ko chahiye.</p>

<h3>Ek script, teen vendors</h3>
<table class="cmp"><tr><th></th><th>Arista EOS</th><th>Cisco IOS XE</th><th>Junos</th></tr>
<tr><td>Enable</td><td><code>management api gnmi</code></td><td><code>gnxi</code></td><td><code>set system services extension-service request-response grpc clear-text port 32767</code>, <code>commit</code></td></tr>
<tr><td>Plaintext / TLS port</td><td>6030 / SSL profile ke saath 6030</td><td>50052 / 9339</td><td>32767 / 50051</td></tr>
<tr><td>gNMI version (lab)</td><td>0.7.0</td><td>0.5.0</td><td>0.7.0</td></tr>
<tr><td>Encodings</td><td>json, json_ietf, ascii</td><td>json_ietf, proto</td><td>json, json_ietf, proto</td></tr>
<tr><td>Min / default sample</td><td>1 s / 10 s</td><td>5 s / 30 s</td><td>2 s / 10 s</td></tr>
<tr><td>Kaun connect kar sakta hai</td><td>local users; Set ko privilege 15</td><td>sirf privilege 15 users</td><td>login users; read-only class Set nahi kar sakti</td></tr></table>
<p>Neeche ki script har device se capabilities maangti hai aur device ki list ki <i>pehli</i> encoding use karti hai, isliye woh kabhi refuse hone wali encoding nahi bhejti:</p>
<pre class="code">from pygnmi.client import gNMIclient, gNMIException

TARGETS = [
    ("LEAF1 EOS", "10.99.0.11", 6030, "netops", "NK@2026"),
    ("XE1 IOS XE", "10.99.0.1", 50052, "netops", "NK@2026"),
    ("J1 Junos", "10.99.0.21", 32767, "netops", "NK@2026"),
]
for name, host, port, user, pw in TARGETS:
    try:
        with gNMIclient(target=(host, port), username=user, password=pw, insecure=True) as gc:
            cap = gc.capabilities()
            hn = gc.get(path=["/system/state/hostname"], encoding=cap["supported_encodings"][0])
            print(f"{name:&lt;11} gNMI {cap['gnmi_version']}  {len(cap['supported_models'])} models  {cap['supported_encodings']}  hostname={hn['notification'][0]['update'][0]['val']}")
    except gNMIException as err:
        print(name, "ERR", err)</pre>
<pre class="out">AUTO01$ python3 d_multi.py
<span class="hl">LEAF1 EOS   gNMI 0.7.0  12 models  ['json', 'json_ietf', 'ascii']  hostname=LEAF1</span>
<span class="hl">XE1 IOS XE  gNMI 0.5.0  10 models  ['json_ietf', 'proto']  hostname=XE1</span>
<span class="hl">J1 Junos    gNMI 0.7.0  10 models  ['json', 'json_ietf', 'proto']  hostname=J1</span></pre>
<p>Dhyan do, model counts aur versions alag hain, phir bhi wahi call teen baar chala. Baaki do vendors ke enable steps:</p>
<pre class="code"><span class="c">! IOS XE: 50052 par plaintext; TLS ke liye 9339 jodo</span>
gnxi
gnxi secure-init
gnxi secure-server

<span class="c"># Junos, configuration mode</span>
set system services extension-service request-response grpc clear-text port 32767
commit</pre>
<pre class="out">R1# show gnxi state
State         Status
-------------------------------------------
Admin         Enabled
Oper          Up
<span class="hl">Insecure      port 50052 (running, plaintext)</span>
Secure        disabled</pre>
<pre class="out">J1&gt; show configuration system services extension-service | display set
set system services extension-service request-response grpc clear-text port 32767</pre>

<h3>TLS teen roop mein</h3>
<p>Plaintext (<code>insecure=True</code>) labs ke liye hai. Asli server TLS use karta hai, aur client ko uska certificate trust karna padta hai: <code>path_root</code> (CA certificate) do, aur agar certificate ka naam aapke use kiye address se match nahi karta to <code>override</code> mein uske andar ka naam do. <code>skip_verify=True</code> validation band kar deta hai; test ke liye use karo, production mein kabhi nahi. LEAF2 par TLS server ke khilaf (SSL profile GNMI-TLS):</p>
<pre class="code">from pygnmi.client import gNMIclient, gNMIException

CASES = [
    ("LEAF2 TLS, plaintext client", "10.99.0.12", dict(insecure=True)),
    ("LEAF2 TLS, CA file only", "10.99.0.12", dict(path_root="/home/netadmin/gnmi-ca.pem")),
    ("LEAF2 TLS, CA + override", "10.99.0.12", dict(path_root="/home/netadmin/gnmi-ca.pem", override="LEAF2")),
    ("LEAF2 TLS, skip_verify", "10.99.0.12", dict(skip_verify=True)),
    ("LEAF1 plain, TLS client", "10.99.0.11", dict(skip_verify=True)),
]
for label, host, opts in CASES:
    try:
        with gNMIclient(target=(host, 6030), username="netops", password="NK@2026", **opts) as gc:
            print(f"{label:&lt;28} OK {gc.capabilities()['gnmi_version']}")
    except gNMIException as err:
        print(f"{label:&lt;28} ERR", str(err).split("last error: ")[-1])</pre>
<pre class="out">AUTO01$ python3 d_tls.py
<span class="hl">LEAF2 TLS, plaintext client  ERR UNKNOWN: ipv4:10.99.0.12:6030: Socket closed</span>
<span class="hl">LEAF2 TLS, CA file only      ERR UNKNOWN: ipv4:10.99.0.12:6030: Ssl handshake failed: SSL_ERROR_SSL: error:1000007d:SSL routines:OPENSSL_internal:CERTIFICATE_VERIFY_FAILED: Peer name 10.99.0.12 is not in peer certificate</span>
<span class="hl">LEAF2 TLS, CA + override     OK 0.7.0</span>
<span class="hl">LEAF2 TLS, skip_verify       OK 0.7.0</span>
<span class="hl">LEAF1 plain, TLS client      ERR UNKNOWN: ipv4:10.99.0.11:6030: Ssl handshake failed: SSL_ERROR_SSL: error:100000f7:SSL routines:OPENSSL_internal:WRONG_VERSION_NUMBER</span></pre>
<p>Failures padho. TLS port par plaintext client "Socket closed" paata hai. Naam match ke bina TLS client CERTIFICATE_VERIFY_FAILED paata hai. Plaintext port par TLS client WRONG_VERSION_NUMBER paata hai. Har ek client ki zubaan aur port ki apekshit zubaan ka mismatch hai.</p>

<h3>Accounts aur secrets</h3>
<p>Username aur password har call par metadata ki tarah jaate hain, isliye TLS zaroori hai, kyunki plaintext raaste ke kisi bhi insaan ko inhe dikha deta hai. Monitoring script ko read-only account do: woh Get aur Subscribe kar sakta hai, par Set refuse hota hai.</p>
<pre class="out">AUTO01$ python3 d_auth.py
<span class="hl">wrong password get     ERR gNMI Error: &lt;StatusCode.UNAUTHENTICATED: (16, 'unauthenticated')&gt; Authentication failed</span>
<span class="hl">no username get        ERR gNMI Error: &lt;StatusCode.UNAUTHENTICATED: (16, 'unauthenticated')&gt; Authentication failed</span>
viewer get             OK LEAF1
<span class="hl">viewer set             ERR gNMI Error: &lt;StatusCode.PERMISSION_DENIED: (7, 'permission denied')&gt; User is not authorized to modify the configuration (privilege level 15 required)</span>
netops set             OK UPDATE</pre>
<p>UNAUTHENTICATED ka matlab device aapko pehchanta nahi. PERMISSION_DENIED ka matlab woh pehchanta hai, aur jawab na hai. Passwords script se bahar rakho, jaisa <code>py-secrets</code> mein seekha:</p>
<pre class="code">import os
from pygnmi.client import gNMIclient

user = os.environ["GNMI_USER"]
password = os.environ["GNMI_PASS"]
with gNMIclient(target=("10.99.0.11", 6030), username=user, password=password, insecure=True) as gc:
    print("connected as", user, "- gNMI", gc.capabilities()["gnmi_version"])</pre>
<pre class="out">AUTO01$ GNMI_USER=netops GNMI_PASS=NK@2026 python3 d_env.py
connected as netops - gNMI 0.7.0</pre>

<div class="warn"><p><b>Aam galti.</b> <code>skip_verify=True</code> "abhi ke liye" lagana aur chhod dena. Jo bhi connection beech mein rok sake woh credentials padh sakta hai. Doosri: monitoring account ko privilege 15 dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> IOS XE do ports par sunta hai: 50052 plaintext aur 9339 secure. Kaunsa chalega yeh is par nirbhar hai ki kaunse <code>gnxi</code> commands type hue. Junos aur EOS bhi plaintext aur TLS ko configuration se alag karte hain, andaaze se nahi.</p></div>
<div class="note"><p><b>Lab vs asli gear.</b> Lab ke version numbers, minimum aur default sample intervals lab ke sambhavit values hain, asli images se padhe nahi gaye. Lab mein TLS ek rule hai: <code>skip_verify=True</code>, ya device ke naam ke barabar <code>override</code>, safal hota hai; certificate files khuli nahi jaati. Asli handshake certificate chain check karta hai.</p></div>

<div class="scn"><h4>Monitoring account jo reload kar sakta tha</h4><p>Review mein pata chala ki telemetry collector poore admin account se login karta tha. Woh sirf counters padhta tha. Team ne read-only user banaya, password collector ke secret store mein rakha, aur collector se agla Set attempt, ek test ki typo, refuse ho gaya.</p><p><b>Lesson:</b> least privilege galti ko error message bana deta hai.</p></div>
<div class="iv"><p class="q">"Script EOS par chalti hai aur IOS XE par fail hoti hai. Pehle kahan dekhoge?"</p><p>Port (6030 versus 50052 ya 9339), encoding (XE mein seedha json nahi), TLS on hai ya nahi, aur account ka privilege. Fail hone wale box par capabilities chalao aur jawab padho, andaaza mat lagao.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EOS 6030, IOS XE 50052 aur 9339, Junos 32767; har ek ke apne enable commands.</li>
<li>Encoding capabilities se chuno, aadat se nahi.</li>
<li>TLS: asli use ke liye path_root aur override, skip_verify sirf test ke liye.</li>
<li>UNAUTHENTICATED pehchan hai, PERMISSION_DENIED adhikaar hai.</li>
<li>Monitoring ke liye read-only accounts; secrets environment se.</li></ul></div>
`}};export{e as default};