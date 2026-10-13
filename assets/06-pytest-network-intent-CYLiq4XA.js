var e={id:`pytest-network-intent`,h:{en:`pytest: write the network intent as tests`,hi:`pytest: network intent ko tests ki tarah likho`},body:{en:`
<p>JSNAPy asks "is it the same as before?". Sometimes you want a different question: "is it what we <b>intend</b>?" The intent is written down once, as data: J2 should have these four OSPF neighbours and these two BGP peers. pytest is the right tool to hold a list like that, because it already knows how to run many small checks, name each one and report exactly which failed. You met pytest in the Program 1 module; here it joins the pre/post toolkit.</p>

<h3>Intent as data, checks as functions</h3>
<pre class="code">"""test_net.py - the OSPF and BGP intent for J1, J2 and J3 as pytest tests (live devices)"""
import pytest
from jnpr.junos import Device
from jnpr.junos.op.bgp import BGPNeighborTable
from jnpr.junos.op.ospf import OspfNeighborTable

HOSTS = {"J1": "10.99.0.11", "J2": "10.99.0.12", "J3": "10.99.0.13"}
OSPF_INTENT = {
    "J1": {"10.99.0.12", "10.99.0.13", "10.12.0.2"},
    "J2": {"10.99.0.11", "10.99.0.13", "10.12.0.1", "10.23.0.2"},
    "J3": {"10.99.0.11", "10.99.0.12", "10.23.0.1"},
}
BGP_INTENT = {
    "J1": {"10.255.0.2", "10.255.0.3"},
    "J2": {"10.255.0.1", "10.255.0.3"},
    "J3": {"10.255.0.1", "10.255.0.2"},
}


@pytest.fixture(scope="module")
def devs():
    opened = {name: Device(host=ip, user="netops", passwd="NK@2026", gather_facts=False).open() for name, ip in HOSTS.items()}
    yield opened
    for dev in opened.values():
        dev.close()


@pytest.mark.parametrize("name", sorted(HOSTS))
def test_ospf_neighbors(devs, name):
    table = OspfNeighborTable(devs[name]).get()
    state = {n.neighbor_address: n.neighbor_state for n in table}
    missing = OSPF_INTENT[name] - set(state)
    assert not missing, "%s lost OSPF neighbors %s" % (name, sorted(missing))
    assert set(state.values()) == {"Full"}, state


@pytest.mark.parametrize("name", sorted(HOSTS))
def test_bgp_peers(devs, name):
    table = BGPNeighborTable(devs[name]).get()
    state = {n.peer_id: n.peer_state for n in table}
    assert set(state) == BGP_INTENT[name], state
    assert set(state.values()) == {"Established"}, state</pre>
<p>Four things to notice:</p>
<ul>
<li><b>Intent is a plain dictionary.</b> When a design changes you edit a set of addresses, not a function.</li>
<li><b>The fixture opens the devices once.</b> <code>scope="module"</code> with <code>yield</code> connects each router a single time for the whole file and closes them at the end. Opening a NETCONF session per test would be slow and noisy.</li>
<li><b>parametrize makes one test per router.</b> One function becomes <code>test_ospf_neighbors[J1]</code>, <code>[J2]</code>, <code>[J3]</code>. A failure names the router in the test id.</li>
<li><b>Assertions carry a message.</b> <code>assert not missing, "J2 lost OSPF neighbors ..."</code> makes the failure readable without opening the code.</li>
</ul>

<h3>Run it: healthy, then broken</h3>
<pre class="out">AUTO01$ pytest -q
......                                                                   [100%]
6 passed in 0.22s</pre>
<p>Six tests, six dots. Now the same file after CHG-3105 removed the J2 to J3 link:</p>
<pre class="out">AUTO01$ pytest -q
___________________________ test_ospf_neighbors[J2] ____________________________

    @pytest.mark.parametrize("name", sorted(HOSTS))
    def test_ospf_neighbors(devs, name):
        table = OspfNeighborTable(devs[name]).get()
        state = {n.neighbor_address: n.neighbor_state for n in table}
        missing = OSPF_INTENT[name] - set(state)
<span class="hl">&gt;       assert not missing, "%s lost OSPF neighbors %s" % (name, sorted(missing))</span>
<span class="hl">E       AssertionError: J2 lost OSPF neighbors ['10.23.0.2']</span>
E       assert not {'10.23.0.2'}

test_net.py:33: AssertionError</pre>
<pre class="out">AUTO01$ pytest -q
=========================== short test summary info ============================
FAILED test_net.py::test_ospf_neighbors[J2] - AssertionError: J2 lost OSPF ne...
FAILED test_net.py::test_ospf_neighbors[J3] - AssertionError: J3 lost OSPF ne...
2 failed, 4 passed in 0.22s</pre>
<p>The dot line already says <code>.FF...</code>: the second and third tests failed. The short summary names them and says why. Your colleague does not have to read a log to learn that J2 and J3 are the affected routers. Compare that with the JSNAPy report from chapter 5: the same discovery, a different shape. JSNAPy compares to the past; pytest compares to the design.</p>

<h3>Selecting what to run</h3>
<table class="cmp"><tr><th>Command</th><th>Runs</th></tr>
<tr><td><code>pytest -q</code></td><td>Everything, one character per test</td></tr>
<tr><td><code>pytest -q -k J2</code></td><td>Tests whose id contains J2</td></tr>
<tr><td><code>pytest -q test_net.py::test_ospf_neighbors</code></td><td>One function, every parameter</td></tr>
<tr><td><code>pytest -v -x</code></td><td>Verbose names, stop at the first failure</td></tr>
<tr><td><code>pytest -q --tb=short</code></td><td>Shorter traceback for failures</td></tr></table>
<pre class="out">AUTO01$ pytest -q -k J2
..                                                                       [100%]
2 passed in 0.08s</pre>
<pre class="out">AUTO01$ pytest -v -x
============================= test session starts ==============================
platform linux -- Python 3.12.0, pytest-7.4.4, pluggy-1.3.0 -- /usr/bin/python3
cachedir: .pytest_cache
rootdir: /home/netadmin
collected 6 items

test_net.py::test_ospf_neighbors[J1] PASSED                              [ 16%]
test_net.py::test_ospf_neighbors[J2] PASSED                              [ 33%]
test_net.py::test_ospf_neighbors[J3] PASSED                              [ 50%]
test_net.py::test_bgp_peers[J1] PASSED                                   [ 66%]
test_net.py::test_bgp_peers[J2] PASSED                                   [ 83%]
test_net.py::test_bgp_peers[J3] PASSED                                   [100%]</pre>

<div class="eg"><p><b>Worked example.</b> A change touches only J2. Run <code>pytest -q -k J2</code> before and after: two tests, a fraction of a second. Run the full file in the nightly job: six tests. Same code, different scope, chosen on the command line. In a 200 router estate this is the difference between a one minute and a one hour check.</p></div>

<h3>Which tool when</h3>
<table class="cmp"><tr><th>Question</th><th>Best tool</th></tr>
<tr><td>Did anything change between two moments?</td><td>JSNAPy <code>check</code> or deepdiff</td></tr>
<tr><td>Does the network match the design?</td><td>pytest with intent data</td></tr>
<tr><td>Which exact field moved?</td><td>deepdiff on the saved state</td></tr>
<tr><td>Block the change automatically</td><td>A gate script that calls the above</td></tr></table>
<p>The strongest pipelines use two: pytest for intent (it still works when there is no pre snapshot, for example in a brand new site) and JSNAPy for drift (it works without a design document).</p>

<div class="warn"><p><b>Lab vs real.</b> The lab runs pytest 7.4 and everything here works as shown. One difference from a real machine: with <code>-s</code> the lab does not show <code>print</code> output of tests that pass. If you need the text, return it from a function or write it to a file instead of relying on captured output.</p></div>
<div class="exam"><p><b>Exam trap.</b> A fixture without <code>scope="module"</code> runs again for every test. The test still passes, the run just opens eighteen sessions instead of three, and the router may rate-limit you.</p></div>

<div class="scn"><h4>The intent nobody updated</h4><p>A team added a new link and kept the old intent dictionary. The next nightly pytest failed for a neighbour that was supposed to be there, and people disabled the test. The fix is a rule: the change ticket for a design change includes the intent file diff, reviewed like any other change.</p><p><b>Lesson:</b> intent is part of the network. Treat the file as production.</p></div>

<div class="iv"><p class="q">"When do you use pytest and when JSNAPy?"</p><p>pytest when I know what the network should look like and I want a named pass/fail for each router. JSNAPy when I want to know whether this change altered anything. I often run both around a change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Put intent in data (sets, dictionaries); keep the test functions small.</li>
<li>A module-scoped fixture with <code>yield</code> opens each router once and closes it at the end.</li>
<li><code>parametrize</code> turns one function into one test per router, with the router in the id.</li>
<li>Use <code>-k</code> and node ids to run only what the change touches.</li>
<li>pytest compares with the design; JSNAPy compares with the past.</li>
</ul></div>
`,hi:`
<p>JSNAPy poochhta hai "kya pehle jaisa hi hai?". Kabhi aap alag sawaal chahte ho: "kya yeh woh hai jo hum <b>chahte</b> the?" Intent ek baar data ki tarah likha jaata hai: J2 ke yeh chaar OSPF neighbours aur yeh do BGP peers hone chahiye. Aisi list ko sambhalne ke liye pytest sahi tool hai, kyunki woh pehle se jaanta hai ki bahut saare chhote checks kaise chalane hain, har ek ko naam kaise dena hai aur theek-theek batana hai ki kaun fail hua. Aap pytest ko Program 1 module mein mile the; yahan woh pre/post toolkit mein judta hai.</p>

<h3>Intent data ki tarah, checks functions ki tarah</h3>
<pre class="code">"""test_net.py - the OSPF and BGP intent for J1, J2 and J3 as pytest tests (live devices)"""
import pytest
from jnpr.junos import Device
from jnpr.junos.op.bgp import BGPNeighborTable
from jnpr.junos.op.ospf import OspfNeighborTable

HOSTS = {"J1": "10.99.0.11", "J2": "10.99.0.12", "J3": "10.99.0.13"}
OSPF_INTENT = {
    "J1": {"10.99.0.12", "10.99.0.13", "10.12.0.2"},
    "J2": {"10.99.0.11", "10.99.0.13", "10.12.0.1", "10.23.0.2"},
    "J3": {"10.99.0.11", "10.99.0.12", "10.23.0.1"},
}
BGP_INTENT = {
    "J1": {"10.255.0.2", "10.255.0.3"},
    "J2": {"10.255.0.1", "10.255.0.3"},
    "J3": {"10.255.0.1", "10.255.0.2"},
}


@pytest.fixture(scope="module")
def devs():
    opened = {name: Device(host=ip, user="netops", passwd="NK@2026", gather_facts=False).open() for name, ip in HOSTS.items()}
    yield opened
    for dev in opened.values():
        dev.close()


@pytest.mark.parametrize("name", sorted(HOSTS))
def test_ospf_neighbors(devs, name):
    table = OspfNeighborTable(devs[name]).get()
    state = {n.neighbor_address: n.neighbor_state for n in table}
    missing = OSPF_INTENT[name] - set(state)
    assert not missing, "%s lost OSPF neighbors %s" % (name, sorted(missing))
    assert set(state.values()) == {"Full"}, state


@pytest.mark.parametrize("name", sorted(HOSTS))
def test_bgp_peers(devs, name):
    table = BGPNeighborTable(devs[name]).get()
    state = {n.peer_id: n.peer_state for n in table}
    assert set(state) == BGP_INTENT[name], state
    assert set(state.values()) == {"Established"}, state</pre>
<p>Chaar baatein dhyan do:</p>
<ul>
<li><b>Intent saada dictionary hai.</b> Design badalne par aap addresses ka set badalte ho, function nahi.</li>
<li><b>Fixture devices ek baar kholta hai.</b> <code>yield</code> ke saath <code>scope="module"</code> poori file ke liye har router se sirf ek baar connect karta hai aur end mein band karta hai. Har test ke liye NETCONF session kholna dheema aur shorgul wala hota.</li>
<li><b>parametrize har router ke liye ek test banata hai.</b> Ek function <code>test_ospf_neighbors[J1]</code>, <code>[J2]</code>, <code>[J3]</code> ban jaata hai. Failure test id mein router ka naam batata hai.</li>
<li><b>Assertions ke saath message hota hai.</b> <code>assert not missing, "J2 lost OSPF neighbors ..."</code> code kholne ke bina failure padhne layak banata hai.</li>
</ul>

<h3>Chalao: pehle healthy, phir kharaab</h3>
<pre class="out">AUTO01$ pytest -q
......                                                                   [100%]
6 passed in 0.22s</pre>
<p>Chhe tests, chhe dots. Ab wahi file jab CHG-3105 ne J2 se J3 ka link hata diya:</p>
<pre class="out">AUTO01$ pytest -q
___________________________ test_ospf_neighbors[J2] ____________________________

    @pytest.mark.parametrize("name", sorted(HOSTS))
    def test_ospf_neighbors(devs, name):
        table = OspfNeighborTable(devs[name]).get()
        state = {n.neighbor_address: n.neighbor_state for n in table}
        missing = OSPF_INTENT[name] - set(state)
<span class="hl">&gt;       assert not missing, "%s lost OSPF neighbors %s" % (name, sorted(missing))</span>
<span class="hl">E       AssertionError: J2 lost OSPF neighbors ['10.23.0.2']</span>
E       assert not {'10.23.0.2'}

test_net.py:33: AssertionError</pre>
<pre class="out">AUTO01$ pytest -q
=========================== short test summary info ============================
FAILED test_net.py::test_ospf_neighbors[J2] - AssertionError: J2 lost OSPF ne...
FAILED test_net.py::test_ospf_neighbors[J3] - AssertionError: J3 lost OSPF ne...
2 failed, 4 passed in 0.22s</pre>
<p>Dot wali line pehle hi kehti hai <code>.FF...</code>: doosra aur teesra test fail hue. Short summary unke naam aur wajah batati hai. Aapke saathi ko log padhne ki zaroorat nahi ki J2 aur J3 affected routers hain. Ise chapter 5 ki JSNAPy report se milao: wahi khoj, alag roop. JSNAPy beete hue kal se compare karta hai; pytest design se.</p>

<h3>Kya chalana hai chunna</h3>
<table class="cmp"><tr><th>Command</th><th>Chalata hai</th></tr>
<tr><td><code>pytest -q</code></td><td>Sab kuch, har test ke liye ek akshar</td></tr>
<tr><td><code>pytest -q -k J2</code></td><td>Woh tests jinke id mein J2 hai</td></tr>
<tr><td><code>pytest -q test_net.py::test_ospf_neighbors</code></td><td>Ek function, har parameter</td></tr>
<tr><td><code>pytest -v -x</code></td><td>Poore naam, pehli failure par ruk jao</td></tr>
<tr><td><code>pytest -q --tb=short</code></td><td>Failures ke liye chhota traceback</td></tr></table>
<pre class="out">AUTO01$ pytest -q -k J2
..                                                                       [100%]
2 passed in 0.08s</pre>
<pre class="out">AUTO01$ pytest -v -x
============================= test session starts ==============================
platform linux -- Python 3.12.0, pytest-7.4.4, pluggy-1.3.0 -- /usr/bin/python3
cachedir: .pytest_cache
rootdir: /home/netadmin
collected 6 items

test_net.py::test_ospf_neighbors[J1] PASSED                              [ 16%]
test_net.py::test_ospf_neighbors[J2] PASSED                              [ 33%]
test_net.py::test_ospf_neighbors[J3] PASSED                              [ 50%]
test_net.py::test_bgp_peers[J1] PASSED                                   [ 66%]
test_net.py::test_bgp_peers[J2] PASSED                                   [ 83%]
test_net.py::test_bgp_peers[J3] PASSED                                   [100%]</pre>

<div class="eg"><p><b>Worked example.</b> Change sirf J2 ko chhoota hai. Change se pehle aur baad <code>pytest -q -k J2</code> chalao: do tests, ek second se bhi kam waqt. Nightly job mein poori file: chhe tests. Wahi code, alag scope, command line se chuna. 200 routers ke estate mein yeh ek minute aur ek ghante ke check ka farak hai.</p></div>

<h3>Kab kaunsa tool</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Sabse achha tool</th></tr>
<tr><td>Do pal ke beech kuch badla?</td><td>JSNAPy <code>check</code> ya deepdiff</td></tr>
<tr><td>Kya network design se milta hai?</td><td>Intent data ke saath pytest</td></tr>
<tr><td>Kaunsi exact field hili?</td><td>Saved state par deepdiff</td></tr>
<tr><td>Change ko apne aap rokna</td><td>Gate script jo upar ke tools bulaye</td></tr></table>
<p>Sabse mazboot pipelines do use karte hain: intent ke liye pytest (yeh tab bhi chalta hai jab pre snapshot nahi hota, jaise bilkul naye site mein) aur drift ke liye JSNAPy (yeh design document ke bina chalta hai).</p>

<div class="warn"><p><b>Lab vs real.</b> Lab pytest 7.4 chalata hai aur yahan sab kuch dikhaye anusaar kaam karta hai. Asli machine se ek farak: <code>-s</code> ke saath lab pass hue tests ka <code>print</code> output nahi dikhata. Agar text chahiye to captured output par bharosa karne ki jagah use function se return karo ya file mein likho.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>scope="module"</code> ke bina fixture har test ke liye dobara chalta hai. Test phir bhi pass hota hai, bas run teen ki jagah atharah sessions kholta hai, aur router rate-limit kar sakta hai.</p></div>

<div class="scn"><h4>Intent jo kisi ne update nahi kiya</h4><p>Ek team ne naya link joda aur purana intent dictionary rakha. Agli nightly pytest us neighbour ke liye fail hui jo hona chahiye tha, aur logon ne test band kar diya. Sudhaar ek rule hai: design change ke change ticket mein intent file ka diff shamil ho, kisi bhi aur change ki tarah review hua.</p><p><b>Lesson:</b> intent network ka hissa hai. File ko production ki tarah maano.</p></div>

<div class="iv"><p class="q">"pytest kab aur JSNAPy kab use karte ho?"</p><p>pytest tab jab mujhe pata hai network kaisa dikhna chahiye aur main har router ke liye naam wala pass/fail chahta hoon. JSNAPy tab jab jaanna hai ki is change ne kuch badla ya nahi. Main aksar change ke aas-paas dono chalata hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Intent ko data (sets, dictionaries) mein rakho; test functions chhote rakho.</li>
<li><code>yield</code> wala module-scoped fixture har router ek baar kholta hai aur end mein band karta hai.</li>
<li><code>parametrize</code> ek function ko har router ke liye ek test banata hai, id mein router ke saath.</li>
<li><code>-k</code> aur node ids se sirf wahi chalao jo change chhoota hai.</li>
<li>pytest design se compare karta hai; JSNAPy beete hue kal se.</li>
</ul></div>
`}};export{e as default};