var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: gNMI will not connect`,hi:`Troubleshooting workflow: gNMI connect nahi hota`},body:{en:`
<p>A gNMI error is a gift if you read it in the right order. Like a doctor in triage, you do not guess: you read the <b>status code</b>, which tells you which layer is sick, then the <b>detail text</b>, which tells you why. This chapter walks Lab 2 from the first red line to a clean run.</p>

<h3>Status code, layer, first check</h3>
<div class="dia"><svg viewBox="0 0 640 215" role="img" aria-label="Triage: UNAVAILABLE means transport, UNAUTHENTICATED means identity, PERMISSION_DENIED means rights, NOT_FOUND or INVALID_ARGUMENT means the request">
<rect x="10" y="10" width="150" height="46" rx="8" fill="#fecaca"/><text x="85" y="30" text-anchor="middle" class="svg-ink" font-size="12">UNAVAILABLE</text><text x="85" y="46" text-anchor="middle" class="svg-muted" font-size="11">transport / TLS</text>
<rect x="170" y="10" width="150" height="46" rx="8" fill="#fed7aa"/><text x="245" y="30" text-anchor="middle" class="svg-ink" font-size="12">UNAUTHENTICATED</text><text x="245" y="46" text-anchor="middle" class="svg-muted" font-size="11">who are you?</text>
<rect x="330" y="10" width="150" height="46" rx="8" fill="#fde68a"/><text x="405" y="30" text-anchor="middle" class="svg-ink" font-size="12">PERMISSION_DENIED</text><text x="405" y="46" text-anchor="middle" class="svg-muted" font-size="11">not allowed</text>
<rect x="490" y="10" width="140" height="46" rx="8" fill="#bae6fd"/><text x="560" y="30" text-anchor="middle" class="svg-ink" font-size="12">NOT_FOUND / INVALID</text><text x="560" y="46" text-anchor="middle" class="svg-muted" font-size="11">the request</text>
<line x1="85" y1="56" x2="85" y2="80" stroke="#64748b" stroke-width="2"/><line x1="245" y1="56" x2="245" y2="80" stroke="#64748b" stroke-width="2"/><line x1="405" y1="56" x2="405" y2="80" stroke="#64748b" stroke-width="2"/><line x1="560" y1="56" x2="560" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="85" y="98" text-anchor="middle" class="svg-ink" font-size="11">port, address, TLS</text><text x="245" y="98" text-anchor="middle" class="svg-ink" font-size="11">user, password</text><text x="405" y="98" text-anchor="middle" class="svg-ink" font-size="11">privilege level</text><text x="560" y="98" text-anchor="middle" class="svg-ink" font-size="11">path, encoding, value</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Each layer sits on top of the one before it. Fix them in this order, left to right.</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">Change one thing, run again, read again.</text>
</svg><p class="cap">The status code names the layer.</p></div>
<table class="cmp"><tr><th>Last words of the message</th><th>Meaning</th><th>First check</th></tr>
<tr><td>Connection refused</td><td>Nothing listens on that port</td><td>Device: <code>show management api gnmi</code>, port, shutdown</td></tr>
<tr><td>Timeout occurred: FD Shutdown</td><td>No route, ACL, wrong IP</td><td>ping, route, ACL</td></tr>
<tr><td>Socket closed</td><td>Plaintext client, TLS listener</td><td>SSL profile on the device</td></tr>
<tr><td>WRONG_VERSION_NUMBER</td><td>TLS client, plaintext listener</td><td>Remove TLS options</td></tr>
<tr><td>CERTIFICATE_VERIFY_FAILED</td><td>Name or CA does not match</td><td>override, path_root</td></tr>
<tr><td>Authentication failed</td><td>Wrong user or password</td><td>Retype, check the account exists</td></tr>
<tr><td>privilege level 15 required</td><td>Account may not change config</td><td>Use the right account</td></tr>
<tr><td>Unable to find the path</td><td>Typo in path or key</td><td>Compare with the model</td></tr></table>

<h3>Lab 2: the broken audit script</h3>
<p><code>gnmi_audit.py</code> checks three switches, then tries a Set and a Get. It has five faults, one per line of output. Run it and read the whole thing before touching anything (task 1):</p>
<pre class="code">from pygnmi.client import gNMIclient, gNMIException

# name, host, port, user, password, connection options
TARGETS = [
    ("LEAF1", "10.99.0.11", 6030, "netops", "NK@2026", {"insecure": True}),
    ("LEAF2", "10.99.0.12", 6030, "netops", "NK@2026", {"insecure": True}),
    ("LEAF3", "10.99.0.13", 6030, "netops", "Nk@2026", {"insecure": True}),
]

ok = 0
for name, host, port, user, password, opts in TARGETS:
    try:
        with gNMIclient(target=(host, port), username=user, password=password, **opts) as gc:
            cap = gc.capabilities()
            res = gc.get(path=["/system/state/hostname"])
            print(name, "OK", cap["gnmi_version"], res["notification"][0]["update"][0]["val"])
            ok += 1
    except gNMIException as err:
        print(name, "ERR", err)

# change a description on LEAF3 with the read-only account
try:
    with gNMIclient(target=("10.99.0.13", 6030), username="viewer", password="View@2026", insecure=True) as gc:
        gc.set(update=[("/interfaces/interface[name=Ethernet1]/config/description", "uplink")])
        print("set OK")
except gNMIException as err:
    print("set ERR", err)

# read the input counter of LEAF3 Ethernet1
try:
    with gNMIclient(target=("10.99.0.13", 6030), username="netops", password="NK@2026", insecure=True) as gc:
        res = gc.get(path=["/interfaces/interface[name=Ethernet1]/state/counter/in-octets"])
        print("get OK", res["notification"][0]["update"][0]["path"])
except gNMIException as err:
    print("get ERR", err)

print("devices OK:", ok, "of", len(TARGETS))</pre>
<pre class="out">AUTO01$ python3 gnmi_audit.py
<span class="hl">LEAF1 ERR gNMI Error: &lt;StatusCode.UNAVAILABLE: (14, 'unavailable')&gt; failed to connect to all addresses; last error: UNKNOWN: ipv4:10.99.0.11:6030: Failed to connect to remote host: Connection refused</span>
<span class="hl">LEAF2 ERR gNMI Error: &lt;StatusCode.UNAVAILABLE: (14, 'unavailable')&gt; failed to connect to all addresses; last error: UNKNOWN: ipv4:10.99.0.12:6030: Socket closed</span>
<span class="hl">LEAF3 ERR gNMI Error: &lt;StatusCode.UNAUTHENTICATED: (16, 'unauthenticated')&gt; Authentication failed</span>
<span class="hl">set ERR gNMI Error: &lt;StatusCode.PERMISSION_DENIED: (7, 'permission denied')&gt; User is not authorized to modify the configuration (privilege level 15 required)</span>
<span class="hl">get ERR gNMI Error: &lt;StatusCode.NOT_FOUND: (5, 'not found')&gt; Unable to find the path /interfaces/interface[name=Ethernet1]/state/counter/in-octets</span>
devices OK: 0 of 3</pre>
<p>Five different problems, five different words. Start with LEAF1: UNAVAILABLE plus Connection refused is a closed port (task 1: the code is UNAVAILABLE). On the device:</p>
<pre class="out">LEAF1# show management api gnmi
Enabled: yes
<span class="hl">Server: running on port 6042, in default VRF</span></pre>
<p>The server listens on 6042, not 6030. Put the real port in the script. The lab uses <code>sed</code>; an editor does the same (task 2):</p>
<pre class="code">sed -i 's/"10.99.0.11", 6030/"10.99.0.11", 6042/' gnmi_audit.py</pre>
<p>LEAF1 now says OK. LEAF2 says Socket closed: the script speaks plaintext to a TLS port (task 3). The device shows why:</p>
<pre class="out">LEAF2# show management api gnmi
Enabled: yes
Server: running on port 6030, in default VRF
<span class="hl">SSL profile: GNMI-TLS</span></pre>
<p>The profile is GNMI-TLS. Switch the LEAF2 line from <code>{"insecure": True}</code> to <code>{"skip_verify": True}</code> (task 4). In production you would give <code>path_root</code> and, if needed, <code>override</code>; the lab has no certificate to trust, so it accepts <code>skip_verify</code>.</p>
<p>Next, LEAF3: Authentication failed, status 16 (task 5). The password in the list is <code>Nk@2026</code>, the account is <code>NK@2026</code>. One letter of case. After the fix all three switches say OK, but the lines below still fail. The Set uses the <code>viewer</code> account and the device says privilege level 15 is required (task 6); change that Set to <code>netops</code>. The last line is NOT_FOUND on <code>counter/in-octets</code>: the model name is plural, <code>counters</code> (task 7). The remaining fixes:</p>
<pre class="code">sed -i 's/Nk@2026/NK@2026/' gnmi_audit.py
sed -i 's/username="viewer", password="View@2026"/username="netops", password="NK@2026"/' gnmi_audit.py
sed -i 's|state/counter/in-octets|state/counters/in-octets|' gnmi_audit.py</pre>
<pre class="out">AUTO01$ python3 gnmi_audit.py
LEAF1 OK 0.7.0 LEAF1
LEAF2 OK 0.7.0 LEAF2
LEAF3 OK 0.7.0 LEAF3
set OK
get OK interfaces/interface[name=Ethernet1]/state/counters/in-octets
<span class="hl">devices OK: 3 of 3</span></pre>
<p>The Set really changed LEAF3. Confirm on the box, as in chapter 7:</p>
<pre class="out">LEAF3# show running-config interfaces Ethernet1
interface Ethernet1
<span class="hl">   description uplink</span>
   no switchport
   ip address 10.99.0.13/24</pre>

<div class="warn"><p><b>Common mistake.</b> Fixing two things at once. If the run still fails, you do not know which change helped. Another: retrying the same call five times; a refused port does not heal.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Unreachable" and "refused" are different. Refused is an answer from a live host. A timeout is silence. Silence points at routing or an ACL, not at gNMI configuration.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The error texts follow what the gRPC core prints, but exact wording can differ between pygnmi and grpc versions. The lab prefixes every message with <code>gNMI Error: &lt;StatusCode.X: (n, 'x')&gt;</code>. Match on the status code and the last words, not on the whole sentence.</p></div>

<div class="scn"><h4>It worked yesterday</h4><p>A nightly job started failing with "Socket closed" on one switch. Nothing in the script had changed. A security change that morning had added an SSL profile to the gNMI server on that switch only. The fix was a TLS client with a trusted CA, not a rollback.</p><p><b>Lesson:</b> when a connection fails after a change, compare the device configuration with the client options, side by side.</p></div>
<div class="iv"><p class="q">"What does UNAVAILABLE mean and how do you narrow it down?"</p><p>It is a transport-level failure. Read the detail: Connection refused is a closed port, FD Shutdown is a timeout, Socket closed is a plaintext-to-TLS mismatch, and SSL errors are certificate or version problems. Then check the device with show management api gnmi.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The status code names the layer; the detail text names the cause.</li>
<li>Fix in order: transport and TLS, identity, rights, request.</li>
<li>Look at the device (<code>show management api gnmi</code>) to see port and SSL profile.</li>
<li>Change one thing per run.</li>
<li>Confirm a Set on the device itself.</li></ul></div>
`,hi:`
<p>Agar sahi order mein padho to gNMI error ek tohfa hai. Triage mein doctor ki tarah aap andaaza nahi lagate: aap <b>status code</b> padhte ho, jo batata hai kaunsa layer bimar hai, phir <b>detail text</b>, jo batata hai kyon. Yeh chapter Lab 2 ko pehli laal line se clean run tak chalata hai.</p>

<h3>Status code, layer, pehla check</h3>
<div class="dia"><svg viewBox="0 0 640 215" role="img" aria-label="Triage: UNAVAILABLE matlab transport, UNAUTHENTICATED matlab pehchan, PERMISSION_DENIED matlab adhikaar, NOT_FOUND ya INVALID_ARGUMENT matlab request">
<rect x="10" y="10" width="150" height="46" rx="8" fill="#fecaca"/><text x="85" y="30" text-anchor="middle" class="svg-ink" font-size="12">UNAVAILABLE</text><text x="85" y="46" text-anchor="middle" class="svg-muted" font-size="11">transport / TLS</text>
<rect x="170" y="10" width="150" height="46" rx="8" fill="#fed7aa"/><text x="245" y="30" text-anchor="middle" class="svg-ink" font-size="12">UNAUTHENTICATED</text><text x="245" y="46" text-anchor="middle" class="svg-muted" font-size="11">aap kaun ho?</text>
<rect x="330" y="10" width="150" height="46" rx="8" fill="#fde68a"/><text x="405" y="30" text-anchor="middle" class="svg-ink" font-size="12">PERMISSION_DENIED</text><text x="405" y="46" text-anchor="middle" class="svg-muted" font-size="11">ijaazat nahi</text>
<rect x="490" y="10" width="140" height="46" rx="8" fill="#bae6fd"/><text x="560" y="30" text-anchor="middle" class="svg-ink" font-size="12">NOT_FOUND / INVALID</text><text x="560" y="46" text-anchor="middle" class="svg-muted" font-size="11">request</text>
<line x1="85" y1="56" x2="85" y2="80" stroke="#64748b" stroke-width="2"/><line x1="245" y1="56" x2="245" y2="80" stroke="#64748b" stroke-width="2"/><line x1="405" y1="56" x2="405" y2="80" stroke="#64748b" stroke-width="2"/><line x1="560" y1="56" x2="560" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="85" y="98" text-anchor="middle" class="svg-ink" font-size="11">port, address, TLS</text><text x="245" y="98" text-anchor="middle" class="svg-ink" font-size="11">user, password</text><text x="405" y="98" text-anchor="middle" class="svg-ink" font-size="11">privilege level</text><text x="560" y="98" text-anchor="middle" class="svg-ink" font-size="11">path, encoding, value</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Har layer pichhle layer ke upar baitha hai. Inhe isi order mein, left se right, theek karo.</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">Ek cheez badlo, dobara chalao, dobara padho.</text>
</svg><p class="cap">Status code layer ka naam batata hai.</p></div>
<table class="cmp"><tr><th>Message ke aakhri shabd</th><th>Matlab</th><th>Pehla check</th></tr>
<tr><td>Connection refused</td><td>Us port par koi nahi sunta</td><td>Device: <code>show management api gnmi</code>, port, shutdown</td></tr>
<tr><td>Timeout occurred: FD Shutdown</td><td>Route nahi, ACL, galat IP</td><td>ping, route, ACL</td></tr>
<tr><td>Socket closed</td><td>Plaintext client, TLS listener</td><td>Device par SSL profile</td></tr>
<tr><td>WRONG_VERSION_NUMBER</td><td>TLS client, plaintext listener</td><td>TLS options hatao</td></tr>
<tr><td>CERTIFICATE_VERIFY_FAILED</td><td>Naam ya CA match nahi</td><td>override, path_root</td></tr>
<tr><td>Authentication failed</td><td>Galat user ya password</td><td>Dobara type karo, account hai ya nahi dekho</td></tr>
<tr><td>privilege level 15 required</td><td>Account config nahi badal sakta</td><td>Sahi account use karo</td></tr>
<tr><td>Unable to find the path</td><td>Path ya key mein typo</td><td>Model se milao</td></tr></table>

<h3>Lab 2: toota hua audit script</h3>
<p><code>gnmi_audit.py</code> teen switches check karti hai, phir ek Set aur ek Get try karti hai. Isme paanch faults hain, output ki har line mein ek. Chalao aur kuch chhoone se pehle poora padho (task 1):</p>
<pre class="code">from pygnmi.client import gNMIclient, gNMIException

# name, host, port, user, password, connection options
TARGETS = [
    ("LEAF1", "10.99.0.11", 6030, "netops", "NK@2026", {"insecure": True}),
    ("LEAF2", "10.99.0.12", 6030, "netops", "NK@2026", {"insecure": True}),
    ("LEAF3", "10.99.0.13", 6030, "netops", "Nk@2026", {"insecure": True}),
]

ok = 0
for name, host, port, user, password, opts in TARGETS:
    try:
        with gNMIclient(target=(host, port), username=user, password=password, **opts) as gc:
            cap = gc.capabilities()
            res = gc.get(path=["/system/state/hostname"])
            print(name, "OK", cap["gnmi_version"], res["notification"][0]["update"][0]["val"])
            ok += 1
    except gNMIException as err:
        print(name, "ERR", err)

# change a description on LEAF3 with the read-only account
try:
    with gNMIclient(target=("10.99.0.13", 6030), username="viewer", password="View@2026", insecure=True) as gc:
        gc.set(update=[("/interfaces/interface[name=Ethernet1]/config/description", "uplink")])
        print("set OK")
except gNMIException as err:
    print("set ERR", err)

# read the input counter of LEAF3 Ethernet1
try:
    with gNMIclient(target=("10.99.0.13", 6030), username="netops", password="NK@2026", insecure=True) as gc:
        res = gc.get(path=["/interfaces/interface[name=Ethernet1]/state/counter/in-octets"])
        print("get OK", res["notification"][0]["update"][0]["path"])
except gNMIException as err:
    print("get ERR", err)

print("devices OK:", ok, "of", len(TARGETS))</pre>
<pre class="out">AUTO01$ python3 gnmi_audit.py
<span class="hl">LEAF1 ERR gNMI Error: &lt;StatusCode.UNAVAILABLE: (14, 'unavailable')&gt; failed to connect to all addresses; last error: UNKNOWN: ipv4:10.99.0.11:6030: Failed to connect to remote host: Connection refused</span>
<span class="hl">LEAF2 ERR gNMI Error: &lt;StatusCode.UNAVAILABLE: (14, 'unavailable')&gt; failed to connect to all addresses; last error: UNKNOWN: ipv4:10.99.0.12:6030: Socket closed</span>
<span class="hl">LEAF3 ERR gNMI Error: &lt;StatusCode.UNAUTHENTICATED: (16, 'unauthenticated')&gt; Authentication failed</span>
<span class="hl">set ERR gNMI Error: &lt;StatusCode.PERMISSION_DENIED: (7, 'permission denied')&gt; User is not authorized to modify the configuration (privilege level 15 required)</span>
<span class="hl">get ERR gNMI Error: &lt;StatusCode.NOT_FOUND: (5, 'not found')&gt; Unable to find the path /interfaces/interface[name=Ethernet1]/state/counter/in-octets</span>
devices OK: 0 of 3</pre>
<p>Paanch alag problems, paanch alag shabd. LEAF1 se shuru karo: UNAVAILABLE aur Connection refused matlab band port (task 1: code UNAVAILABLE hai). Device par:</p>
<pre class="out">LEAF1# show management api gnmi
Enabled: yes
<span class="hl">Server: running on port 6042, in default VRF</span></pre>
<p>Server 6042 par sunta hai, 6030 par nahi. Script mein asli port daalo. Lab <code>sed</code> use karta hai; editor bhi wahi karta hai (task 2):</p>
<pre class="code">sed -i 's/"10.99.0.11", 6030/"10.99.0.11", 6042/' gnmi_audit.py</pre>
<p>LEAF1 ab OK kehta hai. LEAF2 Socket closed kehta hai: script TLS port se plaintext bolti hai (task 3). Device wajah dikhata hai:</p>
<pre class="out">LEAF2# show management api gnmi
Enabled: yes
Server: running on port 6030, in default VRF
<span class="hl">SSL profile: GNMI-TLS</span></pre>
<p>Profile GNMI-TLS hai. LEAF2 ki line <code>{"insecure": True}</code> se <code>{"skip_verify": True}</code> par badlo (task 4). Production mein aap <code>path_root</code> aur zaroorat ho to <code>override</code> doge; lab mein bharosa karne layak certificate nahi hai, isliye woh <code>skip_verify</code> accept karta hai.</p>
<p>Agla, LEAF3: Authentication failed, status 16 (task 5). List mein password <code>Nk@2026</code> hai, account <code>NK@2026</code> hai. Ek akshar ka case. Fix ke baad teeno switches OK kehte hain, par neeche ki lines abhi bhi fail hoti hain. Set <code>viewer</code> account use karta hai aur device kehta hai privilege level 15 chahiye (task 6); us Set ko <code>netops</code> par badlo. Aakhri line <code>counter/in-octets</code> par NOT_FOUND hai: model ka naam plural hai, <code>counters</code> (task 7). Baaki fixes:</p>
<pre class="code">sed -i 's/Nk@2026/NK@2026/' gnmi_audit.py
sed -i 's/username="viewer", password="View@2026"/username="netops", password="NK@2026"/' gnmi_audit.py
sed -i 's|state/counter/in-octets|state/counters/in-octets|' gnmi_audit.py</pre>
<pre class="out">AUTO01$ python3 gnmi_audit.py
LEAF1 OK 0.7.0 LEAF1
LEAF2 OK 0.7.0 LEAF2
LEAF3 OK 0.7.0 LEAF3
set OK
get OK interfaces/interface[name=Ethernet1]/state/counters/in-octets
<span class="hl">devices OK: 3 of 3</span></pre>
<p>Set ne sach mein LEAF3 badla. Box par confirm karo, jaisa chapter 7 mein:</p>
<pre class="out">LEAF3# show running-config interfaces Ethernet1
interface Ethernet1
<span class="hl">   description uplink</span>
   no switchport
   ip address 10.99.0.13/24</pre>

<div class="warn"><p><b>Aam galti.</b> Do cheezein ek saath theek karna. Run phir bhi fail ho to pata nahi kaunsa change kaam aaya. Doosri: wahi call paanch baar retry karna; band port theek nahi hota.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Unreachable" aur "refused" alag hain. Refused zinda host ka jawab hai. Timeout khamoshi hai. Khamoshi routing ya ACL ki taraf ishara karti hai, gNMI configuration ki taraf nahi.</p></div>
<div class="note"><p><b>Lab vs asli gear.</b> Error texts gRPC core ke print ke hisaab se hain, par exact shabd pygnmi aur grpc versions ke beech alag ho sakte hain. Lab har message ke aage <code>gNMI Error: &lt;StatusCode.X: (n, 'x')&gt;</code> lagata hai. Poore vakya par nahi, status code aur aakhri shabdon par match karo.</p></div>

<div class="scn"><h4>Kal toh chal raha tha</h4><p>Ek raatri job ek switch par "Socket closed" ke saath fail hone lagi. Script mein kuch nahi badla tha. Us subah ek security change ne sirf us switch ke gNMI server par SSL profile jod diya tha. Fix TLS client tha jisme trusted CA ho, rollback nahi.</p><p><b>Lesson:</b> change ke baad connection fail ho to device configuration aur client options ko saath-saath milao.</p></div>
<div class="iv"><p class="q">"UNAVAILABLE ka matlab kya hai aur use kaise chhota karte ho?"</p><p>Yeh transport-level failure hai. Detail padho: Connection refused band port hai, FD Shutdown timeout hai, Socket closed plaintext-TLS mismatch hai, aur SSL errors certificate ya version problems hain. Phir device par show management api gnmi se check karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Status code layer ka naam batata hai; detail text karan.</li>
<li>Order mein theek karo: transport aur TLS, pehchan, adhikaar, request.</li>
<li>Port aur SSL profile ke liye device dekho (<code>show management api gnmi</code>).</li>
<li>Har run mein ek cheez badlo.</li>
<li>Set ko device par hi confirm karo.</li></ul></div>
`}};export{e as default};