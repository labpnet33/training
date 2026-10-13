var e={id:`monkeypatch-fakes`,h:{en:`monkeypatch and fakes: test the SSH code without a router`,hi:`monkeypatch aur fakes: SSH code ko router ke bina test karna`},body:{en:`
<p><b>The idea of this chapter:</b> some functions need a device: <code>device_hostname</code> opens an SSH session to a router. A unit test should not need that. You will replace the connection with a small fake object for the length of one test, using <code>monkeypatch</code>, and learn the one rule that trips almost everyone: patch the name where it is <i>used</i>. This is Lab 1, task 5 and task 9.</p>

<h3>Analogy: the flight simulator</h3>
<p>Pilots practise engine failure in a simulator, not in a passenger aircraft. The simulator answers like the real plane, but nothing can crash. A fake connection answers like the router: "hostname PUN-CORE-R1". You can even make it fail on purpose, which a real router rarely does when you want it to.</p>

<h3>Why not just use the real router?</h3>
<ul>
<li>It is slow, and it fails when the lab or the VPN is down, so the suite becomes unreliable.</li>
<li>It needs a password in the test, and it changes real state.</li>
<li>You cannot make a real router time out on demand to test the error path.</li>
</ul>

<h3>The code under test</h3>
<pre class="code">def connect(host):
    return ConnectHandler(device_type="nk_ios", host=host, username="netops", password="NK@2026")


def read_hostname(conn):
    line = conn.send_command("show running-config | include hostname").strip()
    return line.split()[-1] if line.startswith("hostname") else None


def device_hostname(host):
    conn = connect(host)
    try:
        return read_hostname(conn)
    finally:
        conn.disconnect()</pre>
<p>Look at the design. <code>connect</code> is the only function that touches the network. <code>read_hostname</code> takes a connection as an argument and only parses text. <code>device_hostname</code> glues them together and always disconnects. That separation is what makes testing easy.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="In the test, connect is replaced by a lambda returning FakeConn; no SSH happens">
<rect x="20" y="20" width="170" height="55" rx="10" fill="#bae6fd"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="12">device_hostname("R1")</text><text x="105" y="63" text-anchor="middle" class="svg-muted" font-size="11">code under test</text>
<rect x="250" y="20" width="150" height="55" rx="10" fill="#fde68a"/><text x="325" y="45" text-anchor="middle" class="svg-ink" font-size="12">netlib.connect</text><text x="325" y="63" text-anchor="middle" class="svg-muted" font-size="11">patched by the test</text>
<rect x="460" y="20" width="160" height="55" rx="10" fill="#bbf7d0"/><text x="540" y="45" text-anchor="middle" class="svg-ink" font-size="12">FakeConn</text><text x="540" y="63" text-anchor="middle" class="svg-muted" font-size="11">canned reply</text>
<rect x="250" y="100" width="150" height="45" rx="10" fill="#e2e8f0"/><text x="325" y="127" text-anchor="middle" class="svg-muted" font-size="12">real SSH: not used</text>
<line x1="190" y1="47" x2="250" y2="47" stroke="#64748b" stroke-width="2"/><line x1="400" y1="47" x2="460" y2="47" stroke="#64748b" stroke-width="2"/><line x1="325" y1="75" x2="325" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
</svg><p class="cap">The test swaps one name; the rest of the code runs for real.</p></div>

<h3>The fake and the test</h3>
<p>Write <code>test_conn.py</code>:</p>
<pre class="code">import netlib


class FakeConn:
    def send_command(self, cmd):
        return "hostname PUN-CORE-R1"

    def disconnect(self):
        pass


def test_hostname(monkeypatch):
    monkeypatch.setattr(netlib, "connect", lambda host: FakeConn())
    assert netlib.device_hostname("R1") == "PUN-CORE-R1"</pre>
<ul>
<li><code>FakeConn</code> has only the two methods the code calls. It is a stand-in, not a copy of the real library.</li>
<li><code>monkeypatch</code> is a built-in fixture. <code>setattr(netlib, "connect", ...)</code> replaces the name <code>connect</code> inside the module <code>netlib</code>.</li>
<li>The lambda ignores its argument and returns a new fake. So when <code>device_hostname</code> calls <code>connect(host)</code>, it gets <code>FakeConn()</code>.</li>
<li>When the test ends, pytest <b>puts the original back</b>. No other test sees the fake.</li>
</ul>
<pre class="out">AUTO01$ pytest -q test_conn.py
.                                                                        [100%]
1 passed in 0.02s</pre>

<h3>The rule: patch where the name is used</h3>
<p>Python looks a name up in the module that uses it. <code>netlib</code> has its own name <code>connect</code> and its own name <code>ConnectHandler</code> (copied by <code>from nkmiko import ConnectHandler</code>). Patch the wrong one and the real code still runs. Here is the classic mistake, next to the right way:</p>
<pre class="code">import netlib
import nkmiko


class FakeConn:
    def send_command(self, cmd):
        return "hostname PUN-CORE-R1"

    def disconnect(self):
        pass


def test_wrong_place(monkeypatch):
    used = []
    monkeypatch.setattr(nkmiko, "ConnectHandler", lambda **kw: used.append(1) or FakeConn())
    netlib.device_hostname("10.99.0.1")
    assert used == [1]


def test_right_place(monkeypatch):
    used = []
    monkeypatch.setattr(netlib, "ConnectHandler", lambda **kw: used.append(1) or FakeConn())
    netlib.device_hostname("10.99.0.1")
    assert used == [1]</pre>
<pre class="out">AUTO01$ pytest -q test_place.py
F.                                                                       [100%]

=================================== FAILURES ===================================
_______________________________ test_wrong_place _______________________________

    def test_wrong_place(monkeypatch):
        used = []
        monkeypatch.setattr(nkmiko, "ConnectHandler", lambda **kw: used.append(1) or FakeConn())
        netlib.device_hostname("10.99.0.1")
&gt;       assert used == [1]
E       assert [] == [1]
E         Right contains one more item: 1
E         Use -v to get more diff

test_place.py:17: AssertionError
=========================== short test summary info ============================
FAILED test_place.py::test_wrong_place - assert [] == [1]
<span class="hl">1 failed, 1 passed in 0.88s</span></pre>
<p>The fake was never used (<code>used</code> stayed empty). Worse, the test <i>did</i> reach the real router at 10.99.0.1, which is why the run took 0.88 seconds while a pure unit test takes hundredths. A test that is suddenly slow, or that passes only when the lab is up, probably patched the wrong place. The rule of thumb: <b>patch the name in the module whose code does the lookup</b>.</p>

<h3>Fakes that record and fakes that fail</h3>
<p>A fake can remember what it was asked and whether it was closed, and a fake function can raise. This lets you test the paths a healthy router never shows you:</p>
<pre class="code">import netlib
import pytest
from nkmiko.exceptions import NetmikoTimeoutException


class FakeConn:
    def __init__(self, reply="hostname PUN-CORE-R1"):
        self.reply = reply
        self.sent = []
        self.closed = False

    def send_command(self, cmd):
        self.sent.append(cmd)
        return self.reply

    def disconnect(self):
        self.closed = True


def test_read_hostname_needs_no_patch():
    conn = FakeConn()
    assert netlib.read_hostname(conn) == "PUN-CORE-R1"
    assert conn.sent == ["show running-config | include hostname"]


def test_garbage_reply_gives_none():
    assert netlib.read_hostname(FakeConn("% Invalid input")) is None


def test_session_is_closed(monkeypatch):
    conn = FakeConn()
    monkeypatch.setattr(netlib, "connect", lambda host: conn)
    netlib.device_hostname("R1")
    assert conn.closed is True


def test_timeout_propagates(monkeypatch):
    def dead(host):
        raise NetmikoTimeoutException("TCP connection to device failed.")

    monkeypatch.setattr(netlib, "connect", dead)
    with pytest.raises(NetmikoTimeoutException):
        netlib.device_hostname("R3")


def test_patch_is_undone():
    assert netlib.connect.__name__ == "connect"</pre>
<pre class="out">AUTO01$ pytest -v test_fakes.py
============================= test session starts ==============================
platform linux -- Python 3.12.0, pytest-7.4.4, pluggy-1.3.0 -- /usr/bin/python3
cachedir: .pytest_cache
rootdir: /home/netadmin
collected 5 items

test_fakes.py::test_read_hostname_needs_no_patch PASSED                  [ 20%]
test_fakes.py::test_garbage_reply_gives_none PASSED                      [ 40%]
test_fakes.py::test_session_is_closed PASSED                             [ 60%]
test_fakes.py::test_timeout_propagates PASSED                            [ 80%]
test_fakes.py::test_patch_is_undone PASSED                               [100%]

============================== 5 passed in 0.06s ===============================</pre>
<p>The first two tests need no patching at all: <code>read_hostname</code> takes the connection as a parameter, so you simply pass the fake in. Passing dependencies as arguments is the cleanest way to be testable. Use <code>monkeypatch</code> when the code reaches for the dependency itself. The last test shows the restore: after every patched test, <code>netlib.connect</code> is the real function again.</p>

<h3>monkeypatch for environment variables</h3>
<p>Tools read secrets from the environment (module <code>py-secrets</code>). <code>monkeypatch.setenv</code> sets one for a single test and removes it afterwards:</p>
<pre class="code">import os


def test_setenv(monkeypatch):
    monkeypatch.setenv("NET_PASS", "NK@2026")
    assert os.environ["NET_PASS"] == "NK@2026"


def test_env_gone():
    assert "NET_PASS" not in os.environ</pre>
<pre class="out">AUTO01$ pytest -q test_env.py
..                                                                       [100%]
2 passed in 0.03s</pre>

<h3>Fake proves logic, one live check proves the wire</h3>
<p>Fakes tell you the code handles replies correctly. They cannot tell you that R1 really answers. So after the suite is green, run the real function once (task 9):</p>
<pre class="out">AUTO01$ python3 -c "import netlib; print(netlib.device_hostname('10.99.0.1'))"
<span class="hl">PUN-CORE-R1</span></pre>
<p>R1 returns <b>PUN-CORE-R1</b>. Fast unit tests with fakes run on every edit. A live check or the network tests from <code>auto-testing</code> run rarely, before a change window.</p>

<div class="warn"><p><b>Common mistakes.</b> Patching the library module when your module copied the name with <code>from ... import</code>. Faking so much that the test only checks the fake. Forgetting that a fake must have every method the code calls (otherwise an <code>AttributeError</code> appears). Using a real password in a test file.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Patch where it is used, not where it is defined." <code>monkeypatch</code> changes are undone automatically at the end of each test.</p></div>

<div class="scn"><h4>The suite that needed the VPN</h4><p>A team's tests logged in to a real switch to check a helper. On the day the lab VPN dropped, forty tests failed and nobody could tell a code bug from an outage. They replaced the connection with a fake in the unit tests and kept two live checks outside the suite. The unit suite then ran offline in a second.</p><p><b>Lesson:</b> keep the network at the edge and fake it in unit tests.</p></div>

<div class="iv"><p class="q">"How do you unit test code that uses SSH?"</p><p>I isolate the connection in one function and replace it with a fake using monkeypatch, patching the name in the module that uses it. The fake returns canned show output or raises a timeout, so I can test the success path and the error path. The fake is removed after each test. I keep a separate live check for the real device.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A fake object stands in for the SSH connection and returns canned replies.</li>
<li><code>monkeypatch.setattr(module, "name", replacement)</code> lasts for one test only.</li>
<li>Patch where the name is used (<code>netlib.connect</code>), not where it comes from.</li>
<li>Passing the connection as an argument often needs no patching at all.</li>
<li>Fakes prove logic; one live run proves the real wire.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> kuch functions ko device chahiye: <code>device_hostname</code> router se SSH session kholta hai. Unit test ko iski zaroorat nahi honi chahiye. Aap connection ko ek test ki duration ke liye <code>monkeypatch</code> se chhote fake object se badloge, aur woh ek rule seekhoge jo lagbhag sabko atkata hai: naam ko wahan patch karo jahan woh <i>use</i> hota hai. Yeh Lab 1, task 5 aur task 9 hai.</p>

<h3>Analogy: flight simulator</h3>
<p>Pilot engine failure ka abhyas simulator mein karte hain, passenger aircraft mein nahi. Simulator asli plane ki tarah jawab deta hai, par kuch crash nahi ho sakta. Fake connection router ki tarah jawab deta hai: "hostname PUN-CORE-R1". Use jaan-boojhkar fail bhi karwa sakte ho, jo asli router tab nahi karta jab aap chahte ho.</p>

<h3>Asli router kyon nahi use karte?</h3>
<ul>
<li>Yeh slow hai, aur lab ya VPN down ho to fail hota hai, isliye suite bharosemand nahi rehti.</li>
<li>Test mein password chahiye, aur yeh asli state badalta hai.</li>
<li>Error path test karne ke liye asli router ko demand par timeout nahi karwa sakte.</li>
</ul>

<h3>Test hone wala code</h3>
<pre class="code">def connect(host):
    return ConnectHandler(device_type="nk_ios", host=host, username="netops", password="NK@2026")


def read_hostname(conn):
    line = conn.send_command("show running-config | include hostname").strip()
    return line.split()[-1] if line.startswith("hostname") else None


def device_hostname(host):
    conn = connect(host)
    try:
        return read_hostname(conn)
    finally:
        conn.disconnect()</pre>
<p>Design dekho. <code>connect</code> akela function hai jo network chhuta hai. <code>read_hostname</code> connection ko argument ki tarah leta hai aur sirf text parse karta hai. <code>device_hostname</code> dono ko jodta hai aur hamesha disconnect karta hai. Yahi separation testing aasan banata hai.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Test mein connect ki jagah lambda aata hai jo FakeConn return karta hai; SSH nahi hota">
<rect x="20" y="20" width="170" height="55" rx="10" fill="#bae6fd"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="12">device_hostname("R1")</text><text x="105" y="63" text-anchor="middle" class="svg-muted" font-size="11">test hone wala code</text>
<rect x="250" y="20" width="150" height="55" rx="10" fill="#fde68a"/><text x="325" y="45" text-anchor="middle" class="svg-ink" font-size="12">netlib.connect</text><text x="325" y="63" text-anchor="middle" class="svg-muted" font-size="11">test ne patch kiya</text>
<rect x="460" y="20" width="160" height="55" rx="10" fill="#bbf7d0"/><text x="540" y="45" text-anchor="middle" class="svg-ink" font-size="12">FakeConn</text><text x="540" y="63" text-anchor="middle" class="svg-muted" font-size="11">tayyar jawab</text>
<rect x="250" y="100" width="150" height="45" rx="10" fill="#e2e8f0"/><text x="325" y="127" text-anchor="middle" class="svg-muted" font-size="12">asli SSH: use nahi</text>
<line x1="190" y1="47" x2="250" y2="47" stroke="#64748b" stroke-width="2"/><line x1="400" y1="47" x2="460" y2="47" stroke="#64748b" stroke-width="2"/><line x1="325" y1="75" x2="325" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
</svg><p class="cap">Test ek naam badalta hai; baaki code asli chalta hai.</p></div>

<h3>Fake aur test</h3>
<p><code>test_conn.py</code> likho:</p>
<pre class="code">import netlib


class FakeConn:
    def send_command(self, cmd):
        return "hostname PUN-CORE-R1"

    def disconnect(self):
        pass


def test_hostname(monkeypatch):
    monkeypatch.setattr(netlib, "connect", lambda host: FakeConn())
    assert netlib.device_hostname("R1") == "PUN-CORE-R1"</pre>
<ul>
<li><code>FakeConn</code> mein sirf do methods hain jo code call karta hai. Yeh stand-in hai, asli library ki copy nahi.</li>
<li><code>monkeypatch</code> built-in fixture hai. <code>setattr(netlib, "connect", ...)</code> module <code>netlib</code> ke andar naam <code>connect</code> ko badal deta hai.</li>
<li>Lambda apna argument ignore karta hai aur naya fake return karta hai. To jab <code>device_hostname</code> <code>connect(host)</code> call karta hai, use <code>FakeConn()</code> milta hai.</li>
<li>Test khatam hone par pytest <b>original wapas rakh deta hai</b>. Koi aur test fake nahi dekhta.</li>
</ul>
<pre class="out">AUTO01$ pytest -q test_conn.py
.                                                                        [100%]
1 passed in 0.02s</pre>

<h3>Rule: naam wahan patch karo jahan woh use hota hai</h3>
<p>Python naam ko us module mein dhoondhta hai jo use use karta hai. <code>netlib</code> ka apna naam <code>connect</code> hai aur apna naam <code>ConnectHandler</code> (jo <code>from nkmiko import ConnectHandler</code> se copy hua). Galat wala patch karo to asli code phir bhi chalta hai. Yeh classic galti hai, sahi tareeke ke saath:</p>
<pre class="code">import netlib
import nkmiko


class FakeConn:
    def send_command(self, cmd):
        return "hostname PUN-CORE-R1"

    def disconnect(self):
        pass


def test_wrong_place(monkeypatch):
    used = []
    monkeypatch.setattr(nkmiko, "ConnectHandler", lambda **kw: used.append(1) or FakeConn())
    netlib.device_hostname("10.99.0.1")
    assert used == [1]


def test_right_place(monkeypatch):
    used = []
    monkeypatch.setattr(netlib, "ConnectHandler", lambda **kw: used.append(1) or FakeConn())
    netlib.device_hostname("10.99.0.1")
    assert used == [1]</pre>
<pre class="out">AUTO01$ pytest -q test_place.py
F.                                                                       [100%]

=================================== FAILURES ===================================
_______________________________ test_wrong_place _______________________________

    def test_wrong_place(monkeypatch):
        used = []
        monkeypatch.setattr(nkmiko, "ConnectHandler", lambda **kw: used.append(1) or FakeConn())
        netlib.device_hostname("10.99.0.1")
&gt;       assert used == [1]
E       assert [] == [1]
E         Right contains one more item: 1
E         Use -v to get more diff

test_place.py:17: AssertionError
=========================== short test summary info ============================
FAILED test_place.py::test_wrong_place - assert [] == [1]
<span class="hl">1 failed, 1 passed in 0.88s</span></pre>
<p>Fake kabhi use hi nahi hua (<code>used</code> khali raha). Aur bura yeh ki test asli router 10.99.0.1 tak <i>pahunch gaya</i>, isliye run mein 0.88 second lage jabki pure unit test second ke sau-ve hisson mein khatam ho jaata hai. Jo test achanak slow ho jaye, ya sirf tab pass ho jab lab up ho, usne shayad galat jagah patch kiya hai. Rule of thumb: <b>naam ko us module mein patch karo jiska code lookup karta hai</b>.</p>

<h3>Fakes jo record karte hain aur fakes jo fail hote hain</h3>
<p>Fake yaad rakh sakta hai ki usse kya poocha gaya aur woh close hua ya nahi, aur fake function raise bhi kar sakta hai. Isse woh paths test hote hain jo healthy router kabhi nahi dikhata:</p>
<pre class="code">import netlib
import pytest
from nkmiko.exceptions import NetmikoTimeoutException


class FakeConn:
    def __init__(self, reply="hostname PUN-CORE-R1"):
        self.reply = reply
        self.sent = []
        self.closed = False

    def send_command(self, cmd):
        self.sent.append(cmd)
        return self.reply

    def disconnect(self):
        self.closed = True


def test_read_hostname_needs_no_patch():
    conn = FakeConn()
    assert netlib.read_hostname(conn) == "PUN-CORE-R1"
    assert conn.sent == ["show running-config | include hostname"]


def test_garbage_reply_gives_none():
    assert netlib.read_hostname(FakeConn("% Invalid input")) is None


def test_session_is_closed(monkeypatch):
    conn = FakeConn()
    monkeypatch.setattr(netlib, "connect", lambda host: conn)
    netlib.device_hostname("R1")
    assert conn.closed is True


def test_timeout_propagates(monkeypatch):
    def dead(host):
        raise NetmikoTimeoutException("TCP connection to device failed.")

    monkeypatch.setattr(netlib, "connect", dead)
    with pytest.raises(NetmikoTimeoutException):
        netlib.device_hostname("R3")


def test_patch_is_undone():
    assert netlib.connect.__name__ == "connect"</pre>
<pre class="out">AUTO01$ pytest -v test_fakes.py
============================= test session starts ==============================
platform linux -- Python 3.12.0, pytest-7.4.4, pluggy-1.3.0 -- /usr/bin/python3
cachedir: .pytest_cache
rootdir: /home/netadmin
collected 5 items

test_fakes.py::test_read_hostname_needs_no_patch PASSED                  [ 20%]
test_fakes.py::test_garbage_reply_gives_none PASSED                      [ 40%]
test_fakes.py::test_session_is_closed PASSED                             [ 60%]
test_fakes.py::test_timeout_propagates PASSED                            [ 80%]
test_fakes.py::test_patch_is_undone PASSED                               [100%]

============================== 5 passed in 0.06s ===============================</pre>
<p>Pehle do tests ko patch ki zaroorat hi nahi: <code>read_hostname</code> connection ko parameter ki tarah leta hai, isliye bas fake pass kar do. Dependencies ko arguments ki tarah dena testable banane ka sabse saaf tareeka hai. <code>monkeypatch</code> tab use karo jab code dependency khud uthata ho. Aakhri test restore dikhata hai: har patched test ke baad <code>netlib.connect</code> phir asli function hai.</p>

<h3>Environment variables ke liye monkeypatch</h3>
<p>Tools secrets environment se padhte hain (module <code>py-secrets</code>). <code>monkeypatch.setenv</code> ek test ke liye variable set karta hai aur baad mein hata deta hai:</p>
<pre class="code">import os


def test_setenv(monkeypatch):
    monkeypatch.setenv("NET_PASS", "NK@2026")
    assert os.environ["NET_PASS"] == "NK@2026"


def test_env_gone():
    assert "NET_PASS" not in os.environ</pre>
<pre class="out">AUTO01$ pytest -q test_env.py
..                                                                       [100%]
2 passed in 0.03s</pre>

<h3>Fake logic saabit karta hai, ek live check wire</h3>
<p>Fakes batate hain ki code replies sahi handle karta hai. Woh yeh nahi bata sakte ki R1 sach mein jawab deta hai. Isliye suite green hone ke baad asli function ek baar chalao (task 9):</p>
<pre class="out">AUTO01$ python3 -c "import netlib; print(netlib.device_hostname('10.99.0.1'))"
<span class="hl">PUN-CORE-R1</span></pre>
<p>R1 <b>PUN-CORE-R1</b> return karta hai. Fakes wale tez unit tests har edit par chalte hain. Live check ya <code>auto-testing</code> ke network tests kam chalte hain, change window se pehle.</p>

<div class="warn"><p><b>Common mistakes.</b> Library module patch karna jab aapke module ne <code>from ... import</code> se naam copy kar liya ho. Itna fake karna ki test sirf fake ko check kare. Yeh bhoolna ki fake mein woh har method hona chahiye jo code call karta hai (warna <code>AttributeError</code> aata hai). Test file mein asli password rakhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Patch where it is used, not where it is defined." <code>monkeypatch</code> ke badlav har test ke ant mein apne aap undo ho jaate hain.</p></div>

<div class="scn"><h4>Woh suite jise VPN chahiye tha</h4><p>Ek team ke tests helper check karne ke liye asli switch mein login karte the. Jis din lab VPN gira, chalis tests fail hue aur koi code bug aur outage mein fark nahi kar paya. Unit tests mein connection ko fake se badla aur do live checks suite ke bahar rakhe. Phir unit suite offline ek second mein chali.</p><p><b>Lesson:</b> network ko kinare par rakho aur unit tests mein use fake karo.</p></div>

<div class="iv"><p class="q">"SSH use karne wale code ko unit test kaise karte ho?"</p><p>Connection ko ek function mein alag karta hoon aur monkeypatch se fake se badalta hoon, naam ko us module mein patch karke jo use use karta hai. Fake tayyar show output deta hai ya timeout raise karta hai, to success path aur error path dono test hote hain. Har test ke baad fake hat jaata hai. Asli device ke liye alag live check rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Fake object SSH connection ki jagah leta hai aur tayyar replies deta hai.</li>
<li><code>monkeypatch.setattr(module, "name", replacement)</code> sirf ek test tak rehta hai.</li>
<li>Naam wahan patch karo jahan use hota hai (<code>netlib.connect</code>), jahan se aata hai wahan nahi.</li>
<li>Connection ko argument ki tarah dene se aksar patch ki zaroorat hi nahi padti.</li>
<li>Fakes logic saabit karte hain; ek live run asli wire saabit karta hai.</li>
</ul></div>
`}};export{e as default};