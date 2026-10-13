var e={id:`exceptions`,h:{en:`The PyEZ exception family`,hi:`PyEZ ki exception family`},body:{en:`
<p>When PyEZ fails, it fails with a specific exception class, and the class tells you which layer broke. That is far better than the generic <code>Exception</code> you get from many libraries. Learn the two families and you can read most tracebacks in seconds.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img"><defs><marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs><rect x="250" y="8" width="140" height="30" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="320" y="27" text-anchor="middle" font-size="13" class="svg-ink">Exception</text><rect x="60" y="70" width="150" height="32" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="135" y="90" text-anchor="middle" font-size="13" class="svg-ink">ConnectError</text><rect x="430" y="70" width="150" height="32" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="505" y="90" text-anchor="middle" font-size="13" class="svg-ink">RpcError</text><line x1="320" y1="38" x2="135" y2="70" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="320" y1="38" x2="505" y2="70" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><rect x="10" y="140" width="120" height="26" rx="8" fill="#fde68a" stroke="#64748b"/><text x="70" y="156" text-anchor="middle" font-size="11" class="svg-ink">ConnectAuthError</text><rect x="10" y="172" width="120" height="26" rx="8" fill="#fde68a" stroke="#64748b"/><text x="70" y="188" text-anchor="middle" font-size="11" class="svg-ink">ConnectTimeoutError</text><rect x="10" y="204" width="120" height="26" rx="8" fill="#fde68a" stroke="#64748b"/><text x="70" y="220" text-anchor="middle" font-size="11" class="svg-ink">ConnectRefusedError</text><rect x="140" y="140" width="120" height="26" rx="8" fill="#fde68a" stroke="#64748b"/><text x="200" y="156" text-anchor="middle" font-size="11" class="svg-ink">ConnectClosedError</text><rect x="140" y="172" width="120" height="26" rx="8" fill="#fde68a" stroke="#64748b"/><text x="200" y="188" text-anchor="middle" font-size="11" class="svg-ink">ConnectUnknownHost...</text><rect x="140" y="204" width="120" height="26" rx="8" fill="#fde68a" stroke="#64748b"/><text x="200" y="220" text-anchor="middle" font-size="11" class="svg-ink">ProbeError</text><rect x="380" y="140" width="120" height="26" rx="8" fill="#fde68a" stroke="#64748b"/><text x="440" y="156" text-anchor="middle" font-size="11" class="svg-ink">RpcTimeoutError</text><rect x="510" y="140" width="120" height="26" rx="8" fill="#fde68a" stroke="#64748b"/><text x="570" y="156" text-anchor="middle" font-size="11" class="svg-ink">PermissionError</text><rect x="380" y="172" width="120" height="26" rx="8" fill="#fde68a" stroke="#64748b"/><text x="440" y="188" text-anchor="middle" font-size="11" class="svg-ink">ConfigLoadError</text><rect x="510" y="172" width="120" height="26" rx="8" fill="#fde68a" stroke="#64748b"/><text x="570" y="188" text-anchor="middle" font-size="11" class="svg-ink">CommitError</text><rect x="380" y="204" width="120" height="26" rx="8" fill="#fde68a" stroke="#64748b"/><text x="440" y="220" text-anchor="middle" font-size="11" class="svg-ink">LockError</text><rect x="510" y="204" width="120" height="26" rx="8" fill="#fde68a" stroke="#64748b"/><text x="570" y="220" text-anchor="middle" font-size="11" class="svg-ink">UnlockError</text><line x1="135" y1="102" x2="135" y2="135" stroke="#64748b" stroke-width="2"/><line x1="505" y1="102" x2="505" y2="135" stroke="#64748b" stroke-width="2"/><text x="135" y="124" text-anchor="middle" font-size="11" class="svg-muted">no session yet</text><text x="505" y="124" text-anchor="middle" font-size="11" class="svg-muted">session open, RPC failed</text></svg><p class="cap">Two families. ConnectError: you never got a session. RpcError: you had one and the router (or the clock) said no.</p></div>
<pre class="code">import jnpr.junos.exception as ex

for n in ["ConnectAuthError", "ConnectTimeoutError", "ConnectRefusedError", "ConnectUnknownHostError", "ConnectClosedError", "ConnectNotMasterError", "ProbeError"]:
    print("%-24s ConnectError: %s" % (n, issubclass(getattr(ex, n), ex.ConnectError)))
for n in ["RpcTimeoutError", "PermissionError", "ConfigLoadError", "CommitError", "LockError", "UnlockError", "RollbackError"]:
    print("%-24s RpcError: %s" % (n, issubclass(getattr(ex, n), ex.RpcError)))</pre>
<pre class="out">AUTO01$ python3 subs.py
ConnectAuthError         ConnectError: True
ConnectTimeoutError      ConnectError: True
ConnectRefusedError      ConnectError: True
ConnectUnknownHostError  ConnectError: True
ConnectClosedError       ConnectError: True
ConnectNotMasterError    ConnectError: True
ProbeError               ConnectError: True
<span class="hl">RpcTimeoutError          RpcError: True</span>
<span class="hl">PermissionError          RpcError: True</span>
<span class="hl">ConfigLoadError          RpcError: True</span>
<span class="hl">CommitError              RpcError: True</span>
<span class="hl">LockError                RpcError: True</span>
<span class="hl">UnlockError              RpcError: True</span>
<span class="hl">RollbackError            RpcError: True</span></pre>
<p>The lab confirms the tree: every class in the left group is a subclass of <code>ConnectError</code>, and <code>RpcTimeoutError</code>, <code>PermissionError</code> and the configuration errors you meet in <code>adv-pyez-config</code> are all subclasses of <code>RpcError</code>. The two families do not overlap, so <code>except ConnectError</code> never hides an <code>RpcError</code>.</p>
<h3>Connection errors: what each one means</h3>
<table class="cmp"><tr><th>Class</th><th>Typical cause</th><th>Check first</th></tr><tr><td><code>ConnectAuthError</code></td><td>Wrong user or password</td><td>The login by hand, the script's credentials</td></tr><tr><td><code>ConnectTimeoutError</code></td><td>Host does not answer: wrong address, down, filtered</td><td>ping, the address in your inventory</td></tr><tr><td><code>ConnectRefusedError</code></td><td>Host answers but nothing listens on that port</td><td>The port number (830)</td></tr><tr><td><code>ConnectClosedError</code></td><td>SSH is up but the NETCONF subsystem is not, or you used the session after close()</td><td><code>netconf ssh</code>, your with-block</td></tr><tr><td><code>ConnectUnknownHostError</code></td><td>The name does not resolve</td><td>DNS, spelling</td></tr><tr><td><code>ProbeError</code></td><td><code>auto_probe</code> found nothing listening</td><td>Reachability</td></tr></table>
<p>The next script triggers each case and prints the repr, then triggers RPC errors on an open session. Remember that the repr <b>contains the host</b>: when 40 routers fail, the host in the brackets tells you which ones.</p>
<pre class="code">from jnpr.junos import Device
from jnpr.junos.exception import (ConnectAuthError, ConnectClosedError, ConnectError, ConnectRefusedError,
                                  ConnectTimeoutError, ConnectUnknownHostError, RpcError, RpcTimeoutError)
from pyezutil import FLEET, USER, PASSWORD


def attempt(label, **kw):
    kw.setdefault("user", USER)
    kw.setdefault("passwd", PASSWORD)
    try:
        Device(**kw).open()
        print("%-22s connected" % label)
    except ConnectError as err:
        print("%-22s %r  (%s)" % (label, err, type(err).__name__))


print([c.__name__ for c in ConnectAuthError.__mro__])
print(issubclass(RpcError, ConnectError), issubclass(RpcTimeoutError, RpcError))
attempt("wrong password", host=FLEET["J2"], passwd="bad")
attempt("wrong user", host=FLEET["J2"], user="nobody")
attempt("wrong port", host=FLEET["J2"], port=831)
attempt("ssh port, no netconf", host=FLEET["J2"], port=22)
attempt("unreachable host", host="10.99.0.77")
attempt("linux host", host="10.99.0.60")
attempt("unknown name", host="nohost.invalid")
try:
    Device(host=FLEET["J2"], user=USER, passwd="bad").open()
except ConnectError as err:
    print(err.host, err.port, err.user)
dev = Device(host=FLEET["J1"], user=USER, passwd=PASSWORD, gather_facts=False)
dev.open()
try:
    dev.rpc.get_foo_bar()
except RpcError as err:
    print("RpcError:", err.message, "|", err.rpc_error["bad_element"], "|", err.rpc_error["severity"])
try:
    dev.rpc.get_interface_information(terse=True, interface_name="ge-9/9/9")
except RpcError as err:
    print("RpcError:", repr(err))
dev.timeout = 0.0001
try:
    dev.rpc.get_software_information()
except RpcTimeoutError as err:
    print("RpcTimeoutError:", repr(err))
dev.timeout = 30
dev.close()
try:
    dev.rpc.get_software_information()
except ConnectClosedError as err:
    print("ConnectClosedError:", repr(err))</pre>
<pre class="out">AUTO01$ python3 errs.py
['ConnectAuthError', 'ConnectError', 'Exception', 'BaseException', 'object']
False True
wrong password         ConnectAuthError(10.99.0.12)  (ConnectAuthError)
wrong user             ConnectAuthError(10.99.0.12)  (ConnectAuthError)
wrong port             ConnectRefusedError(10.99.0.12)  (ConnectRefusedError)
<span class="hl">ssh port, no netconf   ConnectClosedError(10.99.0.12)  (ConnectClosedError)</span>
unreachable host       ConnectTimeoutError(10.99.0.77)  (ConnectTimeoutError)
linux host             ConnectRefusedError(10.99.0.60)  (ConnectRefusedError)
unknown name           ConnectUnknownHostError(nohost.invalid)  (ConnectUnknownHostError)
10.99.0.12 830 netops
<span class="hl">RpcError: syntax error | get-foo-bar | error</span>
RpcError: RpcError(severity: error, bad_element: get-interface-information, message: device ge-9/9/9 not found)
<span class="hl">RpcTimeoutError: RpcTimeoutError(host: 10.99.0.11, cmd: get-software-information, timeout: 0.0001)</span>
<span class="hl">ConnectClosedError: ConnectClosedError(10.99.0.11)</span></pre>
<h3>Reading RpcError</h3><p>An <code>RpcError</code> carries the router's own words. <code>err.message</code> is the human sentence (<code>syntax error</code>), and <code>err.rpc_error</code> is a dict with <code>bad_element</code>, <code>severity</code> and more. <code>bad_element</code> names the element the router did not accept, which is the fastest clue. The second RpcError in the output shows a real device-side message: the interface does not exist.</p>
<p><code>RpcTimeoutError</code> is different from <code>ConnectTimeoutError</code>: the first means the session worked but the reply came too late (<code>dev.timeout</code>, here set absurdly low), the second means you never connected. Raise <code>dev.timeout</code> for slow commands, never for connection problems.</p>
<h3>PermissionError: the router says no</h3><p>The lab routers have a read-only user, <code>auditor</code>. It may read, but a request that changes state is refused. Never try this on production with a super-user; the script below is safe only because the login class blocks it.</p>
<pre class="code">from jnpr.junos import Device
from jnpr.junos.exception import PermissionError as JunosPermissionError, RpcError
from pyezutil import FLEET

with Device(host=FLEET["J1"], user="auditor", passwd="Audit@2026", gather_facts=False) as dev:
    print(dev.rpc.get_system_uptime_information().findtext(".//time-length"))
    try:
        dev.rpc.request_reboot()
    except (JunosPermissionError, RpcError) as err:
        print(type(err).__name__, repr(err))</pre>
<pre class="out">AUTO01$ python3 auditor.py
00:01:53
<span class="hl">PermissionError PermissionError(severity: error, bad_element: request-reboot, message: permission denied)</span></pre>
<p>PyEZ's <code>PermissionError</code> is a different class from Python's built-in one, so the script imports it with an alias. Forgetting that is a classic bug: <code>except PermissionError</code> would not catch it.</p>
<h3>Patterns that survive production</h3><ul><li>Catch <code>ConnectError</code> <b>per host</b> inside the loop, record it as a row, and continue.</li><li>Catch <code>RpcError</code> around the calls that talk to a connected device, and log <code>repr(err)</code>.</li><li>Retry only timeouts, and only a few times; retrying a <code>ConnectAuthError</code> can lock the account.</li><li>Never write a bare <code>except:</code>. It also hides typos and Ctrl-C.</li><li>Count the problems and exit non-zero, as the fleet report did.</li></ul>
<div class="warn"><p><b>Common mistakes.</b> Catching <code>Exception</code> and printing "failed" without the repr. Treating <code>ConnectClosedError</code> as a network fault when your code used the session after <code>close()</code>. Importing <code>PermissionError</code> without an alias.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ConnectAuthError</code> is raised for a wrong password, <code>ConnectTimeoutError</code> for no answer, <code>ConnectRefusedError</code> for a closed port. Port 22 gives <code>ConnectClosedError</code>, not a refusal.</p></div>
<div class="scn"><h4>Forty timeouts, one typo</h4><p>After a change window a script reported <code>ConnectTimeoutError</code> for forty routers. The team suspected the management network. The first repr said <code>ConnectTimeoutError(10.99.0.31)</code>: not an address in the inventory at all. A generated host list had swapped two digits in a loop. Fixing the generator ended the incident.</p><p><b>Lesson:</b> read the host in the repr before you suspect the network.</p></div>
<div class="iv"><p class="q">"How do you handle errors in a PyEZ script that touches hundreds of routers?"</p><p>I catch <code>ConnectError</code> per host so one failure becomes a row, catch <code>RpcError</code> around the RPCs, log the repr, retry only timeouts, and exit non-zero when anything failed. I never use a bare except, because the exception class is the diagnosis.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Two families: <code>ConnectError</code> (no session) and <code>RpcError</code> (session, but refused or late).</li><li>The repr contains the host; <code>rpc_error["bad_element"]</code> points at the problem.</li><li><code>ConnectClosedError</code> means a missing NETCONF subsystem or a closed session.</li><li>Alias PyEZ's <code>PermissionError</code> on import.</li><li>Catch per host, retry timeouts only, exit non-zero.</li></ul></div>
`,hi:`
<p>Jab PyEZ fail hota hai to ek khaas exception class ke saath fail hota hai, aur class batati hai ki kaunsi layer tooti. Yeh un libraries ke generic <code>Exception</code> se bahut behtar hai. Do families seekh lo to zyadatar tracebacks seconds mein padh sakte ho.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img"><defs><marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs><rect x="250" y="8" width="140" height="30" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="320" y="27" text-anchor="middle" font-size="13" class="svg-ink">Exception</text><rect x="60" y="70" width="150" height="32" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="135" y="90" text-anchor="middle" font-size="13" class="svg-ink">ConnectError</text><rect x="430" y="70" width="150" height="32" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="505" y="90" text-anchor="middle" font-size="13" class="svg-ink">RpcError</text><line x1="320" y1="38" x2="135" y2="70" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="320" y1="38" x2="505" y2="70" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><rect x="10" y="140" width="120" height="26" rx="8" fill="#fde68a" stroke="#64748b"/><text x="70" y="156" text-anchor="middle" font-size="11" class="svg-ink">ConnectAuthError</text><rect x="10" y="172" width="120" height="26" rx="8" fill="#fde68a" stroke="#64748b"/><text x="70" y="188" text-anchor="middle" font-size="11" class="svg-ink">ConnectTimeoutError</text><rect x="10" y="204" width="120" height="26" rx="8" fill="#fde68a" stroke="#64748b"/><text x="70" y="220" text-anchor="middle" font-size="11" class="svg-ink">ConnectRefusedError</text><rect x="140" y="140" width="120" height="26" rx="8" fill="#fde68a" stroke="#64748b"/><text x="200" y="156" text-anchor="middle" font-size="11" class="svg-ink">ConnectClosedError</text><rect x="140" y="172" width="120" height="26" rx="8" fill="#fde68a" stroke="#64748b"/><text x="200" y="188" text-anchor="middle" font-size="11" class="svg-ink">ConnectUnknownHost...</text><rect x="140" y="204" width="120" height="26" rx="8" fill="#fde68a" stroke="#64748b"/><text x="200" y="220" text-anchor="middle" font-size="11" class="svg-ink">ProbeError</text><rect x="380" y="140" width="120" height="26" rx="8" fill="#fde68a" stroke="#64748b"/><text x="440" y="156" text-anchor="middle" font-size="11" class="svg-ink">RpcTimeoutError</text><rect x="510" y="140" width="120" height="26" rx="8" fill="#fde68a" stroke="#64748b"/><text x="570" y="156" text-anchor="middle" font-size="11" class="svg-ink">PermissionError</text><rect x="380" y="172" width="120" height="26" rx="8" fill="#fde68a" stroke="#64748b"/><text x="440" y="188" text-anchor="middle" font-size="11" class="svg-ink">ConfigLoadError</text><rect x="510" y="172" width="120" height="26" rx="8" fill="#fde68a" stroke="#64748b"/><text x="570" y="188" text-anchor="middle" font-size="11" class="svg-ink">CommitError</text><rect x="380" y="204" width="120" height="26" rx="8" fill="#fde68a" stroke="#64748b"/><text x="440" y="220" text-anchor="middle" font-size="11" class="svg-ink">LockError</text><rect x="510" y="204" width="120" height="26" rx="8" fill="#fde68a" stroke="#64748b"/><text x="570" y="220" text-anchor="middle" font-size="11" class="svg-ink">UnlockError</text><line x1="135" y1="102" x2="135" y2="135" stroke="#64748b" stroke-width="2"/><line x1="505" y1="102" x2="505" y2="135" stroke="#64748b" stroke-width="2"/><text x="135" y="124" text-anchor="middle" font-size="11" class="svg-muted">abhi session nahi</text><text x="505" y="124" text-anchor="middle" font-size="11" class="svg-muted">session khula, RPC fail</text></svg><p class="cap">Do families. ConnectError: session mila hi nahi. RpcError: session tha aur router (ya clock) ne mana kar diya.</p></div>
<pre class="code">import jnpr.junos.exception as ex

for n in ["ConnectAuthError", "ConnectTimeoutError", "ConnectRefusedError", "ConnectUnknownHostError", "ConnectClosedError", "ConnectNotMasterError", "ProbeError"]:
    print("%-24s ConnectError: %s" % (n, issubclass(getattr(ex, n), ex.ConnectError)))
for n in ["RpcTimeoutError", "PermissionError", "ConfigLoadError", "CommitError", "LockError", "UnlockError", "RollbackError"]:
    print("%-24s RpcError: %s" % (n, issubclass(getattr(ex, n), ex.RpcError)))</pre>
<pre class="out">AUTO01$ python3 subs.py
ConnectAuthError         ConnectError: True
ConnectTimeoutError      ConnectError: True
ConnectRefusedError      ConnectError: True
ConnectUnknownHostError  ConnectError: True
ConnectClosedError       ConnectError: True
ConnectNotMasterError    ConnectError: True
ProbeError               ConnectError: True
<span class="hl">RpcTimeoutError          RpcError: True</span>
<span class="hl">PermissionError          RpcError: True</span>
<span class="hl">ConfigLoadError          RpcError: True</span>
<span class="hl">CommitError              RpcError: True</span>
<span class="hl">LockError                RpcError: True</span>
<span class="hl">UnlockError              RpcError: True</span>
<span class="hl">RollbackError            RpcError: True</span></pre>
<p>Lab tree ki pushti karta hai: left group ki har class <code>ConnectError</code> ki subclass hai, aur <code>RpcTimeoutError</code>, <code>PermissionError</code> aur <code>adv-pyez-config</code> mein milne wale configuration errors sab <code>RpcError</code> ki subclasses hain. Dono families overlap nahi karti, isliye <code>except ConnectError</code> kabhi <code>RpcError</code> nahi chhupata.</p>
<h3>Connection errors: har ek ka matlab</h3>
<table class="cmp"><tr><th>Class</th><th>Aam wajah</th><th>Pehle check karo</th></tr><tr><td><code>ConnectAuthError</code></td><td>Galat user ya password</td><td>Haath se login, script ke credentials</td></tr><tr><td><code>ConnectTimeoutError</code></td><td>Host jawab nahi deta: galat address, down, filtered</td><td>ping, inventory ka address</td></tr><tr><td><code>ConnectRefusedError</code></td><td>Host jawab deta hai par us port par kuch nahi sunta</td><td>Port number (830)</td></tr><tr><td><code>ConnectClosedError</code></td><td>SSH up hai par NETCONF subsystem nahi, ya close() ke baad session use kiya</td><td><code>netconf ssh</code>, tumhara with-block</td></tr><tr><td><code>ConnectUnknownHostError</code></td><td>Naam resolve nahi hota</td><td>DNS, spelling</td></tr><tr><td><code>ProbeError</code></td><td><code>auto_probe</code> ko kuch sunta nahi mila</td><td>Reachability</td></tr></table>
<p>Agli script har case ko trigger karti hai aur repr print karti hai, phir khule session par RPC errors trigger karti hai. Yaad rakho ki repr mein <b>host hota hai</b>: jab 40 routers fail hon to brackets ka host batata hai kaunse.</p>
<pre class="code">from jnpr.junos import Device
from jnpr.junos.exception import (ConnectAuthError, ConnectClosedError, ConnectError, ConnectRefusedError,
                                  ConnectTimeoutError, ConnectUnknownHostError, RpcError, RpcTimeoutError)
from pyezutil import FLEET, USER, PASSWORD


def attempt(label, **kw):
    kw.setdefault("user", USER)
    kw.setdefault("passwd", PASSWORD)
    try:
        Device(**kw).open()
        print("%-22s connected" % label)
    except ConnectError as err:
        print("%-22s %r  (%s)" % (label, err, type(err).__name__))


print([c.__name__ for c in ConnectAuthError.__mro__])
print(issubclass(RpcError, ConnectError), issubclass(RpcTimeoutError, RpcError))
attempt("wrong password", host=FLEET["J2"], passwd="bad")
attempt("wrong user", host=FLEET["J2"], user="nobody")
attempt("wrong port", host=FLEET["J2"], port=831)
attempt("ssh port, no netconf", host=FLEET["J2"], port=22)
attempt("unreachable host", host="10.99.0.77")
attempt("linux host", host="10.99.0.60")
attempt("unknown name", host="nohost.invalid")
try:
    Device(host=FLEET["J2"], user=USER, passwd="bad").open()
except ConnectError as err:
    print(err.host, err.port, err.user)
dev = Device(host=FLEET["J1"], user=USER, passwd=PASSWORD, gather_facts=False)
dev.open()
try:
    dev.rpc.get_foo_bar()
except RpcError as err:
    print("RpcError:", err.message, "|", err.rpc_error["bad_element"], "|", err.rpc_error["severity"])
try:
    dev.rpc.get_interface_information(terse=True, interface_name="ge-9/9/9")
except RpcError as err:
    print("RpcError:", repr(err))
dev.timeout = 0.0001
try:
    dev.rpc.get_software_information()
except RpcTimeoutError as err:
    print("RpcTimeoutError:", repr(err))
dev.timeout = 30
dev.close()
try:
    dev.rpc.get_software_information()
except ConnectClosedError as err:
    print("ConnectClosedError:", repr(err))</pre>
<pre class="out">AUTO01$ python3 errs.py
['ConnectAuthError', 'ConnectError', 'Exception', 'BaseException', 'object']
False True
wrong password         ConnectAuthError(10.99.0.12)  (ConnectAuthError)
wrong user             ConnectAuthError(10.99.0.12)  (ConnectAuthError)
wrong port             ConnectRefusedError(10.99.0.12)  (ConnectRefusedError)
<span class="hl">ssh port, no netconf   ConnectClosedError(10.99.0.12)  (ConnectClosedError)</span>
unreachable host       ConnectTimeoutError(10.99.0.77)  (ConnectTimeoutError)
linux host             ConnectRefusedError(10.99.0.60)  (ConnectRefusedError)
unknown name           ConnectUnknownHostError(nohost.invalid)  (ConnectUnknownHostError)
10.99.0.12 830 netops
<span class="hl">RpcError: syntax error | get-foo-bar | error</span>
RpcError: RpcError(severity: error, bad_element: get-interface-information, message: device ge-9/9/9 not found)
<span class="hl">RpcTimeoutError: RpcTimeoutError(host: 10.99.0.11, cmd: get-software-information, timeout: 0.0001)</span>
<span class="hl">ConnectClosedError: ConnectClosedError(10.99.0.11)</span></pre>
<h3>RpcError padhna</h3><p><code>RpcError</code> router ke apne shabd rakhta hai. <code>err.message</code> insaani vaakya hai (<code>syntax error</code>), aur <code>err.rpc_error</code> dict hai jisme <code>bad_element</code>, <code>severity</code> aur aur hai. <code>bad_element</code> us element ka naam hai jo router ne accept nahi kiya, jo sabse tez clue hai. Output ka doosra RpcError asli device-side message dikhata hai: interface maujood nahi.</p>
<p><code>RpcTimeoutError</code> <code>ConnectTimeoutError</code> se alag hai: pehle ka matlab session chala par reply der se aayi (<code>dev.timeout</code>, yahan bahut kam set kiya), doosre ka matlab connect hua hi nahi. Dheemi commands ke liye <code>dev.timeout</code> badhao, connection problems ke liye kabhi nahi.</p>
<h3>PermissionError: router mana karta hai</h3><p>Lab routers mein read-only user <code>auditor</code> hai. Woh padh sakta hai, par state badalne wali request mana ho jaati hai. Production par super-user ke saath yeh kabhi mat try karo; neeche ki script sirf isliye surakshit hai kyunki login class use rokti hai.</p>
<pre class="code">from jnpr.junos import Device
from jnpr.junos.exception import PermissionError as JunosPermissionError, RpcError
from pyezutil import FLEET

with Device(host=FLEET["J1"], user="auditor", passwd="Audit@2026", gather_facts=False) as dev:
    print(dev.rpc.get_system_uptime_information().findtext(".//time-length"))
    try:
        dev.rpc.request_reboot()
    except (JunosPermissionError, RpcError) as err:
        print(type(err).__name__, repr(err))</pre>
<pre class="out">AUTO01$ python3 auditor.py
00:01:53
<span class="hl">PermissionError PermissionError(severity: error, bad_element: request-reboot, message: permission denied)</span></pre>
<p>PyEZ ka <code>PermissionError</code> Python ke built-in se alag class hai, isliye script use alias ke saath import karti hai. Yeh bhoolna classic bug hai: <code>except PermissionError</code> use nahi pakdega.</p>
<h3>Woh patterns jo production mein tikte hain</h3><ul><li><code>ConnectError</code> loop ke andar <b>har host ke liye</b> pakdo, row ki tarah record karo aur aage badho.</li><li>Connected device se baat karne wali calls ke aas-paas <code>RpcError</code> pakdo aur <code>repr(err)</code> log karo.</li><li>Sirf timeouts retry karo, aur kuch hi baar; <code>ConnectAuthError</code> retry karne se account lock ho sakta hai.</li><li>Bare <code>except:</code> kabhi mat likho. Yeh typos aur Ctrl-C bhi chhupa deta hai.</li><li>Problems gino aur non-zero exit karo, jaise fleet report ne kiya.</li></ul>
<div class="warn"><p><b>Aam galtiyan.</b> <code>Exception</code> pakadkar repr ke bina "failed" print karna. <code>ConnectClosedError</code> ko network fault samajhna jabki tumhare code ne <code>close()</code> ke baad session use kiya. <code>PermissionError</code> ko alias ke bina import karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Galat password par <code>ConnectAuthError</code>, jawab na aane par <code>ConnectTimeoutError</code>, band port par <code>ConnectRefusedError</code>. Port 22 <code>ConnectClosedError</code> deta hai, refusal nahi.</p></div>
<div class="scn"><h4>Chalis timeouts, ek typo</h4><p>Change window ke baad ek script ne chalis routers ke liye <code>ConnectTimeoutError</code> report kiya. Team ko management network par shak hua. Pehli repr ne kaha <code>ConnectTimeoutError(10.99.0.31)</code>: inventory ka address hi nahi. Generated host list ne loop mein do digits badal diye the. Generator theek karne se incident khatam.</p><p><b>Lesson:</b> network par shak karne se pehle repr ka host padho.</p></div>
<div class="iv"><p class="q">"Sau routers ko chhune wali PyEZ script mein errors kaise handle karte ho?"</p><p>Main <code>ConnectError</code> har host ke liye pakadta hoon taaki ek failure ek row bane, RPCs ke aas-paas <code>RpcError</code> pakadta hoon, repr log karta hoon, sirf timeouts retry karta hoon, aur kuch bhi fail ho to non-zero exit karta hoon. Bare except kabhi nahi, kyunki exception class hi diagnosis hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Do families: <code>ConnectError</code> (session nahi) aur <code>RpcError</code> (session hai, par mana ya der).</li><li>Repr mein host hota hai; <code>rpc_error["bad_element"]</code> problem ki taraf ishara karta hai.</li><li><code>ConnectClosedError</code> ka matlab NETCONF subsystem missing ya session band.</li><li>PyEZ ka <code>PermissionError</code> import par alias karo.</li><li>Per host pakdo, sirf timeouts retry karo, non-zero exit karo.</li></ul></div>
`}};export{e as default};