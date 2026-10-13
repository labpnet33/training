var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: five errors, one script`,hi:`Troubleshooting workflow: paanch errors, ek script`},body:{en:`
<p>This chapter walks Lab 2, <b>Five PyEZ errors, one script</b>. A colleague handed over <code>health.py</code> on AUTO01. It should print one line per router and exit 0 when all BGP peers are Established. It does not. The method matters more than the five fixes, so we use the same loop every time: <b>run, read the last line, classify, change one thing, run again</b>.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img"><defs><marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs><rect x="230" y="8" width="180" height="34" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="320" y="29" text-anchor="middle" font-size="13" class="svg-ink">Run the script</text><rect x="230" y="62" width="180" height="34" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="320" y="83" text-anchor="middle" font-size="13" class="svg-ink">Read the LAST line</text><rect x="20" y="130" width="170" height="44" rx="8" fill="#fde68a" stroke="#64748b"/><text x="105" y="148" text-anchor="middle" font-size="13" class="svg-ink">Connect*Error(host)</text><text x="105" y="164" text-anchor="middle" font-size="13" class="svg-ink">fix login, address, port</text><rect x="235" y="130" width="170" height="44" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="320" y="148" text-anchor="middle" font-size="13" class="svg-ink">RpcError(bad_element)</text><text x="320" y="164" text-anchor="middle" font-size="13" class="svg-ink">fix the RPC name or call</text><rect x="450" y="130" width="170" height="44" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="535" y="148" text-anchor="middle" font-size="13" class="svg-ink">No error, wrong answer</text><text x="535" y="164" text-anchor="middle" font-size="13" class="svg-ink">compare with the CLI</text><line x1="320" y1="42" x2="320" y2="62" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="320" y1="96" x2="105" y2="130" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="320" y1="96" x2="320" y2="130" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="320" y1="96" x2="535" y2="130" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><rect x="230" y="190" width="180" height="34" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="320" y="211" text-anchor="middle" font-size="13" class="svg-ink">Fix ONE thing, run again</text><line x1="105" y1="174" x2="270" y2="190" stroke="#64748b" stroke-width="2"/><line x1="320" y1="174" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><line x1="535" y1="174" x2="370" y2="190" stroke="#64748b" stroke-width="2"/></svg><p class="cap">The workflow for Lab 2: the last line of the output sends you to one of three branches.</p></div>
<h3>The two files</h3><p><code>pyezutil.py</code> holds the credentials and addresses, <code>health.py</code> the logic. Both contain faults. Read them once, then let the errors lead you; do not fix by guessing.</p>
<pre class="code">"""pyezutil.py - the Junos inventory and one device() helper for the PyEZ scripts"""
from jnpr.junos import Device

USER = "netops"
PASSWORD = "NK@2025"          <span class="c"># lab value only; real scripts read it from the environment</span>

FLEET = {
    "J1": "10.99.0.11",
    "J2": "10.99.0.12",
    "J3": "10.99.0.31",
}


def device(host, **extra):
    """Return a Device that is NOT opened yet; use it in a with-block."""
    return Device(host=host, user=USER, passwd=PASSWORD, **extra)</pre>
<pre class="code">"""health.py - one line per Junos router: version and BGP peers Established"""
import sys

from jnpr.junos.exception import ConnectError
from pyezutil import FLEET, device


def bgp_counts(dev):
    """Return (peers configured, peers Established) from the BGP summary."""
    xml = dev.rpc.get_bgp_summary_informaton()
    total = int(xml.findtext("peer-count"))
    peers = xml.findall("bgp-peers")
    up = [p for p in peers if p.findtext("peer-state").strip() == "Established"]
    return total, len(up)


def read_router(host):
    with device(host) as dev:
        facts = dev.facts
    total, up = bgp_counts(dev)
    return facts["hostname"], facts["version"], total, up


problems = 0
print("%-4s %-8s %-10s %s" % ("NAME", "HOSTNAME", "VERSION", "BGP"))
for name, host in FLEET.items():
    try:
        hostname, version, total, up = read_router(host)
    except ConnectError as err:
        print("%-4s PROBLEM  %r" % (name, err))
        problems += 1
        continue
    state = "ok" if up == total else "PROBLEM"
    if state != "ok":
        problems += 1
    print("%-4s %-8s %-10s %d/%d established  %s" % (name, hostname, version, up, total, state))
print("problems: %d" % problems)
sys.exit(1 if problems else 0)</pre>
<h3>Fault 1: authentication</h3><p>The first run prints a row per router. Two rows have the same class, so the cause is shared and sits in the one place both routers use: the login.</p>
<pre class="out">AUTO01$ python3 health.py; echo "exit code: $?"
NAME HOSTNAME VERSION    BGP
<span class="hl">J1   PROBLEM  ConnectAuthError(10.99.0.11)</span>
<span class="hl">J2   PROBLEM  ConnectAuthError(10.99.0.12)</span>
J3   PROBLEM  ConnectTimeoutError(10.99.0.31)
problems: 3
exit code: 1</pre>
<p>The password in <code>pyezutil.py</code> is <code>NK@2025</code>, a year out of date. The fix is one line:</p>
<pre class="code">sed -i 's/NK@2025/NK@2026/' pyezutil.py</pre>
<h3>Fault 2: a timeout on one host</h3><p>J3 shows a different class. The brackets name <code>10.99.0.31</code>, and HYD-J3 is <code>10.99.0.13</code>: two digits swapped. A <code>ConnectTimeoutError</code> says "nobody answered at that address", which here means the address is wrong, not that the router is down. In the same run J1 and J2 have moved on to <code>ConnectClosedError</code>: that is the next fault, already visible.</p>
<pre class="out">AUTO01$ python3 health.py; echo "exit code: $?"
NAME HOSTNAME VERSION    BGP
J1   PROBLEM  ConnectClosedError(10.99.0.11)
J2   PROBLEM  ConnectClosedError(10.99.0.12)
<span class="hl">J3   PROBLEM  ConnectTimeoutError(10.99.0.31)</span>
problems: 3
exit code: 1</pre>
<pre class="code">sed -i 's/10.99.0.31/10.99.0.13/' pyezutil.py</pre>
<h3>Fault 3: the session closed too early</h3><p>Now all three routers say <code>ConnectClosedError</code>, yet the routers are healthy. The session was open when the facts were read. Look at <code>read_router()</code>: the <code>with</code> block ends after <code>facts = dev.facts</code>, and the BGP RPC runs on the next line, after the block has closed the session. The router did nothing wrong.</p>
<pre class="out">AUTO01$ python3 health.py; echo "exit code: $?"
NAME HOSTNAME VERSION    BGP
<span class="hl">J1   PROBLEM  ConnectClosedError(10.99.0.11)</span>
<span class="hl">J2   PROBLEM  ConnectClosedError(10.99.0.12)</span>
<span class="hl">J3   PROBLEM  ConnectClosedError(10.99.0.13)</span>
problems: 3
exit code: 1</pre>
<p>The fix is to indent the RPC call into the block:</p>
<pre class="code">sed -i 's/^    total, up = bgp_counts(dev)/        total, up = bgp_counts(dev)/' health.py</pre>
<h3>Fault 4: the RPC name</h3><p>This time there is no row, only a traceback, because <code>RpcError</code> is not a <code>ConnectError</code> and the loop does not catch it. Read the <b>last line</b>. The router says <code>syntax error</code> and names the element it did not understand: <code>get-bgp-summary-informaton</code>. A letter is missing. A <code>syntax error</code> in an RpcError almost always means "I do not know this RPC".</p>
<pre class="out">AUTO01$ python3 health.py; echo "exit code: $?"
NAME HOSTNAME VERSION    BGP
Traceback (most recent call last):
  File "health.py", line 28, in &lt;module&gt;
    hostname, version, total, up = read_router(host)
  File "health.py", line 20, in read_router
    total, up = bgp_counts(dev)
  File "health.py", line 10, in bgp_counts
    xml = dev.rpc.get_bgp_summary_informaton()
  File "/usr/lib/python3.11/jnpr/nk_rpcmeta.py", line 100, in _exec_rpc
    return junos.execute(rpc, ignore_warning=ignore_warning, dev_timeout=dev_timeout, normalize=normalize)
  File "/usr/lib/python3.11/jnpr/nk_device.py", line 410, in execute
    raise EzErrors.RpcError(cmd=rpc_cmd_e, rsp=rsp, errs=ex)
<span class="hl">jnpr.junos.exception.RpcError: RpcError(severity: error, bad_element: get-bgp-summary-informaton, message: syntax error)</span>
exit code: 1</pre>
<pre class="code">sed -i 's/informaton/information/' health.py</pre>
<h3>Fault 5: no error, wrong answer</h3><p>The script now runs to the end and prints <code>0/2 established</code> for every router, with exit code 1. Nothing raised an exception, so the traceback gives no clue. The tool for this case is a second opinion: ask the router itself.</p>
<pre class="out">AUTO01$ python3 health.py; echo "exit code: $?"
NAME HOSTNAME VERSION    BGP
<span class="hl">J1   PUN-J1   23.4R1.10  0/2 established  PROBLEM</span>
<span class="hl">J2   BLR-J2   23.4R1.10  0/2 established  PROBLEM</span>
<span class="hl">J3   HYD-J3   23.4R1.10  0/2 established  PROBLEM</span>
problems: 3
exit code: 1</pre>
<pre class="out">J1> show bgp summary
Threading mode: BGP I/O
Default eBGP mode: advertise - accept, receive - accept
Groups: 1 Peers: 2 Down peers: 0
Table          Tot Paths  Act Paths Suppressed    History Damp State    Pending
inet.0               
                       0          0          0          0          0          0
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
<span class="hl">10.255.0.2            65000          4          4       0       0        1:11 Establ</span>
  inet.0: 0/0/0/0
<span class="hl">10.255.0.3            65000          4          4       0       0        1:11 Establ</span>
  inet.0: 0/0/0/0</pre>
<p>The CLI says both peers are Established, so the script is wrong, not the network. The total (2) came from <code>peer-count</code> and is right; the Established count (0) came from <code>findall("bgp-peers")</code>. The real tag is <code>bgp-peer</code>, singular, exactly as chapter 5 warned. Fix the name and the last run is clean.</p>
<pre class="code">sed -i 's/"bgp-peers"/"bgp-peer"/' health.py</pre>
<pre class="out">AUTO01$ python3 health.py; echo "exit code: $?"
NAME HOSTNAME VERSION    BGP
J1   PUN-J1   23.4R1.10  2/2 established  ok
J2   BLR-J2   23.4R1.10  2/2 established  ok
J3   HYD-J3   23.4R1.10  2/2 established  ok
<span class="hl">problems: 0</span>
<span class="hl">exit code: 0</span></pre>
<h3>The five faults at a glance</h3>
<table class="cmp"><tr><th>#</th><th>What you saw</th><th>Meaning</th><th>Fix</th></tr><tr><td>1</td><td><code>ConnectAuthError(host)</code></td><td>Wrong credentials</td><td>Password in pyezutil.py</td></tr><tr><td>2</td><td><code>ConnectTimeoutError(10.99.0.31)</code></td><td>Wrong address</td><td>Typo in the fleet</td></tr><tr><td>3</td><td><code>ConnectClosedError(host)</code></td><td>RPC after the session closed</td><td>Indent into the with-block</td></tr><tr><td>4</td><td><code>RpcError ... syntax error</code></td><td>Unknown RPC name</td><td>Spell the RPC correctly</td></tr><tr><td>5</td><td><code>0/2 established</code>, no error</td><td>Wrong tag in findall</td><td>Use bgp-peer</td></tr></table>
<div class="warn"><p><b>Common mistakes.</b> Fixing two things at once, so you cannot tell which one worked. Reading the first line of a traceback instead of the last. Believing a clean run without checking the exit code and a second source.</p></div>
<div class="exam"><p><b>Exam trap.</b> A <code>ConnectClosedError</code> does not always mean the router is at fault. Ask first whether your own code already closed the session.</p></div>
<div class="scn"><h4>The handover that took ten minutes</h4><p>A night-shift engineer inherited a broken health script at 2 a.m. Instead of rewriting it, she ran it, read the last line, fixed one thing and ran it again. Five cycles later the script was clean. The morning team asked how she knew where to look; she showed them the exception class on every line.</p><p><b>Lesson:</b> a disciplined loop beats a rewrite.</p></div>
<div class="iv"><p class="q">"A colleague's PyEZ script fails. What do you do first?"</p><p>I run it and read the last line of the output, because the exception class names the layer: ConnectError family for login, address, port or subsystem; RpcError for the call itself. I read the host in the repr, change one thing and run it again. If there is no error but the answer is wrong, I compare with the CLI.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Loop: run, read the last line, classify, change one thing, run again.</li><li>Same class on several routers: look at the shared place (credentials, helper).</li><li>A different host in the brackets points to the address list.</li><li><code>RpcError</code> is not caught by <code>except ConnectError</code>; a syntax error means an unknown RPC.</li><li>No error but a wrong answer: ask the router with the CLI.</li></ul></div>
`,hi:`
<p>Yeh chapter Lab 2, <b>Paanch PyEZ errors, ek script</b>, chalata hai. Ek colleague ne AUTO01 par <code>health.py</code> di hai. Isse har router ki ek line print karni chahiye aur saare BGP peers Established ho to exit 0. Aisa nahi hota. Paanch fixes se zyada tareeka zaroori hai, isliye har baar wahi loop: <b>chalao, aakhri line padho, classify karo, ek cheez badlo, dobara chalao</b>.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img"><defs><marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs><rect x="230" y="8" width="180" height="34" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="320" y="29" text-anchor="middle" font-size="13" class="svg-ink">Script chalao</text><rect x="230" y="62" width="180" height="34" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="320" y="83" text-anchor="middle" font-size="13" class="svg-ink">AAKHRI line padho</text><rect x="20" y="130" width="170" height="44" rx="8" fill="#fde68a" stroke="#64748b"/><text x="105" y="148" text-anchor="middle" font-size="13" class="svg-ink">Connect*Error(host)</text><text x="105" y="164" text-anchor="middle" font-size="13" class="svg-ink">login, address, port theek karo</text><rect x="235" y="130" width="170" height="44" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="320" y="148" text-anchor="middle" font-size="13" class="svg-ink">RpcError(bad_element)</text><text x="320" y="164" text-anchor="middle" font-size="13" class="svg-ink">RPC naam ya call theek karo</text><rect x="450" y="130" width="170" height="44" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="535" y="148" text-anchor="middle" font-size="13" class="svg-ink">Error nahi, galat jawab</text><text x="535" y="164" text-anchor="middle" font-size="13" class="svg-ink">CLI se compare karo</text><line x1="320" y1="42" x2="320" y2="62" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="320" y1="96" x2="105" y2="130" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="320" y1="96" x2="320" y2="130" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="320" y1="96" x2="535" y2="130" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><rect x="230" y="190" width="180" height="34" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="320" y="211" text-anchor="middle" font-size="13" class="svg-ink">EK cheez theek karo, phir chalao</text><line x1="105" y1="174" x2="270" y2="190" stroke="#64748b" stroke-width="2"/><line x1="320" y1="174" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><line x1="535" y1="174" x2="370" y2="190" stroke="#64748b" stroke-width="2"/></svg><p class="cap">Lab 2 ka workflow: output ki aakhri line tumhe teen branches mein se ek par bhejti hai.</p></div>
<h3>Do files</h3><p><code>pyezutil.py</code> mein credentials aur addresses hain, <code>health.py</code> mein logic. Dono mein faults hain. Ek baar padho, phir errors ko rasta dikhane do; andaze se fix mat karo.</p>
<pre class="code">"""pyezutil.py - the Junos inventory and one device() helper for the PyEZ scripts"""
from jnpr.junos import Device

USER = "netops"
PASSWORD = "NK@2025"          <span class="c"># lab value only; real scripts read it from the environment</span>

FLEET = {
    "J1": "10.99.0.11",
    "J2": "10.99.0.12",
    "J3": "10.99.0.31",
}


def device(host, **extra):
    """Return a Device that is NOT opened yet; use it in a with-block."""
    return Device(host=host, user=USER, passwd=PASSWORD, **extra)</pre>
<pre class="code">"""health.py - one line per Junos router: version and BGP peers Established"""
import sys

from jnpr.junos.exception import ConnectError
from pyezutil import FLEET, device


def bgp_counts(dev):
    """Return (peers configured, peers Established) from the BGP summary."""
    xml = dev.rpc.get_bgp_summary_informaton()
    total = int(xml.findtext("peer-count"))
    peers = xml.findall("bgp-peers")
    up = [p for p in peers if p.findtext("peer-state").strip() == "Established"]
    return total, len(up)


def read_router(host):
    with device(host) as dev:
        facts = dev.facts
    total, up = bgp_counts(dev)
    return facts["hostname"], facts["version"], total, up


problems = 0
print("%-4s %-8s %-10s %s" % ("NAME", "HOSTNAME", "VERSION", "BGP"))
for name, host in FLEET.items():
    try:
        hostname, version, total, up = read_router(host)
    except ConnectError as err:
        print("%-4s PROBLEM  %r" % (name, err))
        problems += 1
        continue
    state = "ok" if up == total else "PROBLEM"
    if state != "ok":
        problems += 1
    print("%-4s %-8s %-10s %d/%d established  %s" % (name, hostname, version, up, total, state))
print("problems: %d" % problems)
sys.exit(1 if problems else 0)</pre>
<h3>Fault 1: authentication</h3><p>Pehli run har router ki ek row print karti hai. Do rows ki class ek hi hai, isliye wajah shared hai aur us ek jagah mein hai jise dono routers use karte hain: login.</p>
<pre class="out">AUTO01$ python3 health.py; echo "exit code: $?"
NAME HOSTNAME VERSION    BGP
<span class="hl">J1   PROBLEM  ConnectAuthError(10.99.0.11)</span>
<span class="hl">J2   PROBLEM  ConnectAuthError(10.99.0.12)</span>
J3   PROBLEM  ConnectTimeoutError(10.99.0.31)
problems: 3
exit code: 1</pre>
<p><code>pyezutil.py</code> ka password <code>NK@2025</code> hai, ek saal purana. Fix ek line ka hai:</p>
<pre class="code">sed -i 's/NK@2025/NK@2026/' pyezutil.py</pre>
<h3>Fault 2: ek host par timeout</h3><p>J3 alag class dikhata hai. Brackets mein <code>10.99.0.31</code> hai, aur HYD-J3 <code>10.99.0.13</code> hai: do digits badle hue. <code>ConnectTimeoutError</code> kehta hai "us address par kisi ne jawab nahi diya", jiska yahan matlab address galat hai, router down nahi. Usi run mein J1 aur J2 <code>ConnectClosedError</code> par aa gaye: yeh agla fault hai, jo pehle se dikh raha hai.</p>
<pre class="out">AUTO01$ python3 health.py; echo "exit code: $?"
NAME HOSTNAME VERSION    BGP
J1   PROBLEM  ConnectClosedError(10.99.0.11)
J2   PROBLEM  ConnectClosedError(10.99.0.12)
<span class="hl">J3   PROBLEM  ConnectTimeoutError(10.99.0.31)</span>
problems: 3
exit code: 1</pre>
<pre class="code">sed -i 's/10.99.0.31/10.99.0.13/' pyezutil.py</pre>
<h3>Fault 3: session bahut jaldi band hua</h3><p>Ab teeno routers <code>ConnectClosedError</code> kehte hain, jabki routers theek hain. Facts padhte waqt session khula tha. <code>read_router()</code> dekho: <code>with</code> block <code>facts = dev.facts</code> ke baad khatam hota hai, aur BGP RPC agli line par chalta hai, block ke session band karne ke baad. Router ne kuch galat nahi kiya.</p>
<pre class="out">AUTO01$ python3 health.py; echo "exit code: $?"
NAME HOSTNAME VERSION    BGP
<span class="hl">J1   PROBLEM  ConnectClosedError(10.99.0.11)</span>
<span class="hl">J2   PROBLEM  ConnectClosedError(10.99.0.12)</span>
<span class="hl">J3   PROBLEM  ConnectClosedError(10.99.0.13)</span>
problems: 3
exit code: 1</pre>
<p>Fix hai RPC call ko block ke andar indent karna:</p>
<pre class="code">sed -i 's/^    total, up = bgp_counts(dev)/        total, up = bgp_counts(dev)/' health.py</pre>
<h3>Fault 4: RPC ka naam</h3><p>Is baar koi row nahi, sirf traceback, kyunki <code>RpcError</code> <code>ConnectError</code> nahi hai aur loop use nahi pakadta. <b>Aakhri line</b> padho. Router <code>syntax error</code> kehta hai aur us element ka naam batata hai jo samajh nahi aaya: <code>get-bgp-summary-informaton</code>. Ek akshar kam hai. RpcError mein <code>syntax error</code> ka matlab lagbhag hamesha "yeh RPC mujhe nahi pata" hota hai.</p>
<pre class="out">AUTO01$ python3 health.py; echo "exit code: $?"
NAME HOSTNAME VERSION    BGP
Traceback (most recent call last):
  File "health.py", line 28, in &lt;module&gt;
    hostname, version, total, up = read_router(host)
  File "health.py", line 20, in read_router
    total, up = bgp_counts(dev)
  File "health.py", line 10, in bgp_counts
    xml = dev.rpc.get_bgp_summary_informaton()
  File "/usr/lib/python3.11/jnpr/nk_rpcmeta.py", line 100, in _exec_rpc
    return junos.execute(rpc, ignore_warning=ignore_warning, dev_timeout=dev_timeout, normalize=normalize)
  File "/usr/lib/python3.11/jnpr/nk_device.py", line 410, in execute
    raise EzErrors.RpcError(cmd=rpc_cmd_e, rsp=rsp, errs=ex)
<span class="hl">jnpr.junos.exception.RpcError: RpcError(severity: error, bad_element: get-bgp-summary-informaton, message: syntax error)</span>
exit code: 1</pre>
<pre class="code">sed -i 's/informaton/information/' health.py</pre>
<h3>Fault 5: error nahi, galat jawab</h3><p>Script ab aakhir tak chalti hai aur har router ke liye <code>0/2 established</code> print karti hai, exit code 1 ke saath. Kisi ne exception raise nahi kiya, isliye traceback koi clue nahi deta. Is case ka tool doosri raay hai: router se hi poocho.</p>
<pre class="out">AUTO01$ python3 health.py; echo "exit code: $?"
NAME HOSTNAME VERSION    BGP
<span class="hl">J1   PUN-J1   23.4R1.10  0/2 established  PROBLEM</span>
<span class="hl">J2   BLR-J2   23.4R1.10  0/2 established  PROBLEM</span>
<span class="hl">J3   HYD-J3   23.4R1.10  0/2 established  PROBLEM</span>
problems: 3
exit code: 1</pre>
<pre class="out">J1> show bgp summary
Threading mode: BGP I/O
Default eBGP mode: advertise - accept, receive - accept
Groups: 1 Peers: 2 Down peers: 0
Table          Tot Paths  Act Paths Suppressed    History Damp State    Pending
inet.0               
                       0          0          0          0          0          0
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
<span class="hl">10.255.0.2            65000          4          4       0       0        1:11 Establ</span>
  inet.0: 0/0/0/0
<span class="hl">10.255.0.3            65000          4          4       0       0        1:11 Establ</span>
  inet.0: 0/0/0/0</pre>
<p>CLI kehta hai dono peers Established hain, yaani script galat hai, network nahi. Total (2) <code>peer-count</code> se aaya aur sahi hai; Established count (0) <code>findall("bgp-peers")</code> se aaya. Asli tag <code>bgp-peer</code> hai, ekvachan, bilkul jaisa chapter 5 ne chetaya tha. Naam theek karo aur aakhri run saaf hai.</p>
<pre class="code">sed -i 's/"bgp-peers"/"bgp-peer"/' health.py</pre>
<pre class="out">AUTO01$ python3 health.py; echo "exit code: $?"
NAME HOSTNAME VERSION    BGP
J1   PUN-J1   23.4R1.10  2/2 established  ok
J2   BLR-J2   23.4R1.10  2/2 established  ok
J3   HYD-J3   23.4R1.10  2/2 established  ok
<span class="hl">problems: 0</span>
<span class="hl">exit code: 0</span></pre>
<h3>Paanchon faults ek nazar mein</h3>
<table class="cmp"><tr><th>#</th><th>Kya dikha</th><th>Matlab</th><th>Fix</th></tr><tr><td>1</td><td><code>ConnectAuthError(host)</code></td><td>Galat credentials</td><td>pyezutil.py ka password</td></tr><tr><td>2</td><td><code>ConnectTimeoutError(10.99.0.31)</code></td><td>Galat address</td><td>Fleet mein typo</td></tr><tr><td>3</td><td><code>ConnectClosedError(host)</code></td><td>Session band hone ke baad RPC</td><td>with-block mein indent karo</td></tr><tr><td>4</td><td><code>RpcError ... syntax error</code></td><td>Anjaan RPC naam</td><td>RPC sahi likho</td></tr><tr><td>5</td><td><code>0/2 established</code>, koi error nahi</td><td>findall mein galat tag</td><td>bgp-peer use karo</td></tr></table>
<div class="warn"><p><b>Aam galtiyan.</b> Do cheezein ek saath theek karna, taaki pata na chale kaunsi kaam aayi. Traceback ki aakhri ki jagah pehli line padhna. Exit code aur doosre source ko dekhe bina clean run par bharosa karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ConnectClosedError</code> ka matlab hamesha router ki galti nahi hota. Pehle poocho ki tumhare apne code ne session band to nahi kar diya.</p></div>
<div class="scn"><h4>Handover jo das minute mein nipta</h4><p>Night-shift engineer ko raat 2 baje toot hui health script virasat mein mili. Use rewrite karne ki jagah usne chalayi, aakhri line padhi, ek cheez theek ki aur dobara chalayi. Paanch cycles baad script saaf thi. Subah ki team ne poocha ki use kaise pata tha kahan dekhna hai; usne har line par exception class dikhayi.</p><p><b>Lesson:</b> anushaasit loop rewrite se behtar hai.</p></div>
<div class="iv"><p class="q">"Colleague ki PyEZ script fail ho rahi hai. Sabse pehle kya karoge?"</p><p>Main use chalata hoon aur output ki aakhri line padhta hoon, kyunki exception class layer ka naam batati hai: login, address, port ya subsystem ke liye ConnectError family; call ke liye RpcError. Repr ka host padhta hoon, ek cheez badalta hoon aur dobara chalata hoon. Error nahi par jawab galat ho to CLI se compare karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Loop: chalao, aakhri line padho, classify karo, ek cheez badlo, dobara chalao.</li><li>Kai routers par ek hi class: shared jagah dekho (credentials, helper).</li><li>Brackets mein alag host address list ki taraf ishara karta hai.</li><li><code>RpcError</code> ko <code>except ConnectError</code> nahi pakadta; syntax error ka matlab anjaan RPC.</li><li>Error nahi par jawab galat: CLI se router se poocho.</li></ul></div>
`}};export{e as default};