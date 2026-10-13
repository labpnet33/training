var e={id:`pre-post-check`,h:{en:`Pre and post: snapshot, change, snapshot, compare`,hi:`Pre aur post: snapshot, change, snapshot, compare`},body:{en:`
<p>Everything so far judged one moment. A change window needs two: the network <b>before</b> and the network <b>after</b>. This chapter turns the snapcheck script into a pre/post tool, runs it around a real change and reads what it says. The change is CHG-3105, a request to shut one interface on J2, and it will go wrong in a way a simple health check misses.</p>

<h3>Step 1: grow the script to three modes</h3>
<p>Add two modes to <code>jsnap.py</code>: <code>snap TAG</code> saves the snapshots under a tag and <code>check PRE POST</code> compares two tags. The optional wait before <code>snap</code> is explained below; keep it in mind.</p>
<pre class="code">"""jsnap.py - JSNAPy snapshots and checks for the core routers J1, J2 and J3.
Usage: python3 jsnap.py snapcheck | snap TAG [WAIT] | check PRE POST
"""
import os
import sys
import time

from jnpr.jsnapy import SnapAdmin

HOSTS = ["10.99.0.11", "10.99.0.12", "10.99.0.13"]
USER = "netops"
PASSWORD = os.environ.get("JUNOS_PASSWORD", "NK@2026")      # lab default; real scripts export JUNOS_PASSWORD
TESTS = "test_health.yml"


def config():
    """The JSNAPy config as YAML text: the inventory lives here, the password comes from the environment."""
    lines = ["hosts:"]
    for host in HOSTS:
        lines += ["  - device: %s" % host, "    username: %s" % USER, "    passwd: %s" % PASSWORD]
    lines += ["tests:", "  - %s" % TESTS]
    return "\\n".join(lines) + "\\n"


def summary(results):
    """Print one line per router and return how many routers failed."""
    failed = 0
    for r in results:
        print("%-12s %-7s passed=%d failed=%d" % (r.device, r.result, r.no_passed, r.no_failed))
        if r.result != "Passed":
            failed += 1
    return failed


def main(argv):
    js = SnapAdmin()
    mode = argv[0] if argv else "snapcheck"
    if mode == "snapcheck":
        return 1 if summary(js.snapcheck(config(), "snap")) else 0
    if mode == "snap":
        if len(argv) &gt; 2:
            time.sleep(int(argv[2]))            # let the network settle before we look
        js.snap(config(), argv[1])
        return 0
    if mode == "check":
        return 1 if summary(js.check(config(), argv[1], argv[2])) else 0
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))</pre>
<p>The test file now has the cross-snapshot operators from chapter 4: Full state, plus <code>list-not-less</code> on the neighbour address, and BGP state plus <code>no-diff</code> on the peer AS.</p>
<pre class="code">tests_include:
  - test_ospf_nbr
  - test_bgp_peers
test_ospf_nbr:
  - command: show ospf neighbor
  - iterate:
      xpath: ospf-neighbor
      id: neighbor-address
      tests:
        - is-equal: ospf-neighbor-state, Full
          err: "OSPF neighbor {{post['neighbor-address']}} on {{post['interface-name']}} is {{post['ospf-neighbor-state']}}, expected Full"
          info: "OSPF neighbor {{post['neighbor-address']}} is Full"
        - list-not-less: neighbor-address
test_bgp_peers:
  - command: show bgp summary
  - iterate:
      xpath: bgp-peer
      id: peer-address
      tests:
        - is-equal: peer-state, Established
          err: "BGP peer {{post['peer-address']}} is {{post['peer-state']}}, expected Established"
          info: "BGP peer {{post['peer-address']}} is Established"
        - no-diff: peer-as</pre>

<h3>Step 2: take the pre snapshot</h3>
<pre class="out">AUTO01$ python3 jsnap.py snap pre
Connecting to device 10.99.0.11 ................
Connected to device 10.99.0.11
Taking snapshot for show ospf neighbor ................
Taking snapshot for show bgp summary ................
Connecting to device 10.99.0.12 ................
Connected to device 10.99.0.12</pre>
<pre class="out">AUTO01$ ls snapshots
10.99.0.11_pre_show_bgp_summary.xml  10.99.0.11_pre_show_ospf_neighbor.xml  10.99.0.11_snap_show_bgp_summary.xml  10.99.0.11_snap_show_ospf_neighbor.xml  10.99.0.12_pre_show_bgp_summary.xml  10.99.0.12_pre_show_ospf_neighbor.xml  10.99.0.12_snap_show_bgp_summary.xml  10.99.0.12_snap_show_ospf_neighbor.xml  10.99.0.13_pre_show_bgp_summary.xml  10.99.0.13_pre_show_ospf_neighbor.xml  10.99.0.13_snap_show_bgp_summary.xml  10.99.0.13_snap_show_ospf_neighbor.xml</pre>
<p>Three routers times two commands is six files per tag. The name is <code>host_tag_command.xml</code>. You can open them, copy them into the change ticket and keep them for a year.</p>

<h3>Step 3: change, wait, take the post snapshot</h3>
<p>The change script pushes a configuration to J2 and returns. Convergence is not instant, so the post snapshot waits 20 seconds first.</p>
<pre class="out">AUTO01$ python3 change.py CHG-3105
CHG-3105 applied on J2</pre>
<pre class="out">AUTO01$ python3 jsnap.py snap post 20
Connecting to device 10.99.0.11 ................
Connected to device 10.99.0.11
Taking snapshot for show ospf neighbor ................</pre>

<h3>Step 4: compare</h3>
<p>The whole report is long. Here is J2's part, with the two lines that matter highlighted.</p>
<pre class="out">AUTO01$ python3 jsnap.py check pre post; echo "exit code: $?"
**************************** Device: 10.99.0.12 ****************************
Tests Included: test_ospf_nbr, test_bgp_peers
*************************** Command: show ospf neighbor ***************************
PASS | All "ospf-neighbor-state" is equal to "Full" [ 3 matched ]
INFO : OSPF neighbor 10.99.0.11 is Full
INFO : OSPF neighbor 10.99.0.13 is Full
INFO : OSPF neighbor 10.12.0.1 is Full
<span class="hl">FAIL | All "neighbor-address" list does not lose entries [ 3 matched / 1 failed ]</span>
<span class="hl">ERROR : "neighbor-address" value "10.23.0.2" was in the pre snapshot but is missing from the post snapshot</span>
*************************** Command: show bgp summary ***************************
PASS | All "peer-state" is equal to "Established" [ 2 matched ]
INFO : BGP peer 10.255.0.1 is Established
INFO : BGP peer 10.255.0.3 is Established
PASS | All "peer-as" is unchanged [ 2 matched ]
------------------------------ Final Result!! ------------------------------
test_ospf_nbr : Failed
test_bgp_peers : Passed
Total No of tests passed: 3
Total No of tests failed: 1
Overall Tests failed!!!</pre>
<pre class="out">AUTO01$ python3 jsnap.py check pre post; echo "exit code: $?"
10.99.0.11   Passed  passed=4 failed=0
10.99.0.12   Failed  passed=3 failed=1
10.99.0.13   Failed  passed=3 failed=1
exit code: 1</pre>
<p>Read it slowly. The state test <b>passed</b>: every neighbour that is left is Full. The cross-snapshot test <b>failed</b>: neighbour 10.23.0.2 was in the pre snapshot and is gone. A plain health check would have shown only the passing line. J3 fails the same way from its side (10.23.0.1 is gone), and J1 is fine. Three routers, one broken link, found in under a minute.</p>

<h3>Why the wait matters: OSPF is not instant</h3>
<p>Now the opposite change, taking CHG-3105 away. Look at J2 and J3 right after the undo, thirty seconds later and again after two minutes. The prompt shows the router that was asked.</p>
<pre class="out">J2&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.99.0.11       ge-0/0/0.0             Full            10.255.0.1       128    33
10.99.0.13       ge-0/0/0.0             Full            10.255.0.3       128    35
10.12.0.1        ge-0/0/1.0             Full            10.255.0.1       128    32
<span class="hl">10.23.0.2        ge-0/0/2.0             2Way            10.255.0.3       128    34</span></pre>
<pre class="out">J2&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.99.0.11       ge-0/0/0.0             Full            10.255.0.1       128    31
10.99.0.13       ge-0/0/0.0             Full            10.255.0.3       128    33
10.12.0.1        ge-0/0/1.0             Full            10.255.0.1       128    40
<span class="hl">10.23.0.2        ge-0/0/2.0             Full            10.255.0.3       128    32</span></pre>
<p>First the neighbour is <code>2Way</code>, then it is <code>Full</code>. Between the two the routers are electing a designated router and exchanging databases. A post snapshot taken in the 2Way window would call a healthy network broken. A fixed <code>sleep 20</code> is a guess. A loop that polls the neighbour count until it is right is not; the undo in <code>change.py</code> uses one.</p>

<div class="eg"><p><b>Worked example.</b> After <code>change.py CHG-3105 undo</code> you run <code>snap post2 0</code> too fast. The check says J2 <code>list-not-less</code> passes (the neighbour is back, in 2Way) but the Full test fails. Nothing is wrong with the network, only with your timing. Wait until the neighbour count is 4 and every state is Full, then snap again.</p></div>

<h3>When JSNAPy cannot do its job</h3>
<pre class="out">AUTO01$ python3 errs2.py
--- wrong password
Connecting to device 10.99.0.11 ................
ERROR!! Unable to connect to device: ConnectAuthError(10.99.0.11)
Connecting to device 10.99.0.12 ................
ERROR!! Unable to connect to device: ConnectAuthError(10.99.0.12)
Connecting to device 10.99.0.13 ................
ERROR!! Unable to connect to device: ConnectAuthError(10.99.0.13)
[]</pre>
<p>A wrong password does not raise an exception. JSNAPy prints an ERROR for each router and returns an <b>empty list</b>. In Python <code>all()</code> of an empty list is True, so <code>assert all(r.result == "Passed" for r in results)</code> passes when nothing was checked. Always compare the number of results with the number of routers. A <code>check</code> with a tag you never took prints "Snapshot file not found" and marks every test Failed, which is the safe direction.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Taking the post snapshot straight after the change. (2) Reusing the tag <code>post</code> and overwriting the evidence of an earlier attempt: put the change number in the tag. (3) Running <code>snapcheck</code> when you meant <code>check</code>; snapcheck compares a snapshot with itself, so <code>list-not-less</code> can never fail. (4) Leaving old snapshots lying around and comparing against the wrong pre.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>snap</code> only saves, <code>snapcheck</code> saves and tests in one go, <code>check</code> tests two saved tags. Only <code>check</code> gives the cross-snapshot operators a second snapshot to look at.</p></div>

<div class="scn"><h4>The change that passed at 02:05</h4><p>A night engineer shut an interface, ran the check once the change was in and wrote "all good". The post snapshot had been taken two seconds after the commit, before OSPF even noticed. The morning team found the neighbour gone. A 20 second wait and a neighbour-count poll would have shown it in the log.</p><p><b>Lesson:</b> a check is only as honest as the moment it looks.</p></div>

<div class="iv"><p class="q">"Why do you wait before the post snapshot?"</p><p>Protocols converge over seconds or minutes. I wait or poll until the state is stable, then snapshot, so the result reflects the network and not the transition.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pre/post is three commands: <code>snap pre</code>, change, <code>snap post</code>, then <code>check pre post</code>.</li>
<li>Snapshots are files named host, tag and command; one per router per command.</li>
<li>A passing state test with a failing <code>list-not-less</code> means something disappeared quietly.</li>
<li>Wait for convergence before the post snapshot; poll, do not guess.</li>
<li>A wrong password returns an empty list: check how many results came back.</li>
</ul></div>
`,hi:`
<p>Ab tak sab kuch ek pal ko judge karta tha. Change window ko do pal chahiye: network <b>pehle</b> aur network <b>baad mein</b>. Yeh chapter snapcheck script ko pre/post tool banata hai, asli change ke aas-paas chalata hai aur padhta hai ki woh kya kehta hai. Change CHG-3105 hai, J2 par ek interface band karne ki request, aur yeh aise galat jayega jo simple health check miss kar deta hai.</p>

<h3>Step 1: script ko teen modes tak badhao</h3>
<p><code>jsnap.py</code> mein do modes jodo: <code>snap TAG</code> tag ke naam se snapshots save karta hai aur <code>check PRE POST</code> do tags compare karta hai. <code>snap</code> se pehle optional wait neeche samjhaya hai; dhyan rakhna.</p>
<pre class="code">"""jsnap.py - JSNAPy snapshots and checks for the core routers J1, J2 and J3.
Usage: python3 jsnap.py snapcheck | snap TAG [WAIT] | check PRE POST
"""
import os
import sys
import time

from jnpr.jsnapy import SnapAdmin

HOSTS = ["10.99.0.11", "10.99.0.12", "10.99.0.13"]
USER = "netops"
PASSWORD = os.environ.get("JUNOS_PASSWORD", "NK@2026")      # lab default; real scripts export JUNOS_PASSWORD
TESTS = "test_health.yml"


def config():
    """The JSNAPy config as YAML text: the inventory lives here, the password comes from the environment."""
    lines = ["hosts:"]
    for host in HOSTS:
        lines += ["  - device: %s" % host, "    username: %s" % USER, "    passwd: %s" % PASSWORD]
    lines += ["tests:", "  - %s" % TESTS]
    return "\\n".join(lines) + "\\n"


def summary(results):
    """Print one line per router and return how many routers failed."""
    failed = 0
    for r in results:
        print("%-12s %-7s passed=%d failed=%d" % (r.device, r.result, r.no_passed, r.no_failed))
        if r.result != "Passed":
            failed += 1
    return failed


def main(argv):
    js = SnapAdmin()
    mode = argv[0] if argv else "snapcheck"
    if mode == "snapcheck":
        return 1 if summary(js.snapcheck(config(), "snap")) else 0
    if mode == "snap":
        if len(argv) &gt; 2:
            time.sleep(int(argv[2]))            # let the network settle before we look
        js.snap(config(), argv[1])
        return 0
    if mode == "check":
        return 1 if summary(js.check(config(), argv[1], argv[2])) else 0
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))</pre>
<p>Test file mein ab chapter 4 ke cross-snapshot operators hain: Full state, saath mein neighbour address par <code>list-not-less</code>, aur BGP state ke saath peer AS par <code>no-diff</code>.</p>
<pre class="code">tests_include:
  - test_ospf_nbr
  - test_bgp_peers
test_ospf_nbr:
  - command: show ospf neighbor
  - iterate:
      xpath: ospf-neighbor
      id: neighbor-address
      tests:
        - is-equal: ospf-neighbor-state, Full
          err: "OSPF neighbor {{post['neighbor-address']}} on {{post['interface-name']}} is {{post['ospf-neighbor-state']}}, expected Full"
          info: "OSPF neighbor {{post['neighbor-address']}} is Full"
        - list-not-less: neighbor-address
test_bgp_peers:
  - command: show bgp summary
  - iterate:
      xpath: bgp-peer
      id: peer-address
      tests:
        - is-equal: peer-state, Established
          err: "BGP peer {{post['peer-address']}} is {{post['peer-state']}}, expected Established"
          info: "BGP peer {{post['peer-address']}} is Established"
        - no-diff: peer-as</pre>

<h3>Step 2: pre snapshot lo</h3>
<pre class="out">AUTO01$ python3 jsnap.py snap pre
Connecting to device 10.99.0.11 ................
Connected to device 10.99.0.11
Taking snapshot for show ospf neighbor ................
Taking snapshot for show bgp summary ................
Connecting to device 10.99.0.12 ................
Connected to device 10.99.0.12</pre>
<pre class="out">AUTO01$ ls snapshots
10.99.0.11_pre_show_bgp_summary.xml  10.99.0.11_pre_show_ospf_neighbor.xml  10.99.0.11_snap_show_bgp_summary.xml  10.99.0.11_snap_show_ospf_neighbor.xml  10.99.0.12_pre_show_bgp_summary.xml  10.99.0.12_pre_show_ospf_neighbor.xml  10.99.0.12_snap_show_bgp_summary.xml  10.99.0.12_snap_show_ospf_neighbor.xml  10.99.0.13_pre_show_bgp_summary.xml  10.99.0.13_pre_show_ospf_neighbor.xml  10.99.0.13_snap_show_bgp_summary.xml  10.99.0.13_snap_show_ospf_neighbor.xml</pre>
<p>Teen routers guna do commands, har tag ke chhe files. Naam <code>host_tag_command.xml</code> hai. Aap unhe khol sakte ho, change ticket mein laga sakte ho aur saal bhar rakh sakte ho.</p>

<h3>Step 3: change, wait, post snapshot</h3>
<p>Change script J2 par configuration push karti hai aur lautti hai. Convergence turant nahi hota, isliye post snapshot pehle 20 second rukta hai.</p>
<pre class="out">AUTO01$ python3 change.py CHG-3105
CHG-3105 applied on J2</pre>
<pre class="out">AUTO01$ python3 jsnap.py snap post 20
Connecting to device 10.99.0.11 ................
Connected to device 10.99.0.11
Taking snapshot for show ospf neighbor ................</pre>

<h3>Step 4: compare karo</h3>
<p>Poori report lambi hai. Yeh J2 ka hissa hai, jismein do zaroori lines highlight hain.</p>
<pre class="out">AUTO01$ python3 jsnap.py check pre post; echo "exit code: $?"
**************************** Device: 10.99.0.12 ****************************
Tests Included: test_ospf_nbr, test_bgp_peers
*************************** Command: show ospf neighbor ***************************
PASS | All "ospf-neighbor-state" is equal to "Full" [ 3 matched ]
INFO : OSPF neighbor 10.99.0.11 is Full
INFO : OSPF neighbor 10.99.0.13 is Full
INFO : OSPF neighbor 10.12.0.1 is Full
<span class="hl">FAIL | All "neighbor-address" list does not lose entries [ 3 matched / 1 failed ]</span>
<span class="hl">ERROR : "neighbor-address" value "10.23.0.2" was in the pre snapshot but is missing from the post snapshot</span>
*************************** Command: show bgp summary ***************************
PASS | All "peer-state" is equal to "Established" [ 2 matched ]
INFO : BGP peer 10.255.0.1 is Established
INFO : BGP peer 10.255.0.3 is Established
PASS | All "peer-as" is unchanged [ 2 matched ]
------------------------------ Final Result!! ------------------------------
test_ospf_nbr : Failed
test_bgp_peers : Passed
Total No of tests passed: 3
Total No of tests failed: 1
Overall Tests failed!!!</pre>
<pre class="out">AUTO01$ python3 jsnap.py check pre post; echo "exit code: $?"
10.99.0.11   Passed  passed=4 failed=0
10.99.0.12   Failed  passed=3 failed=1
10.99.0.13   Failed  passed=3 failed=1
exit code: 1</pre>
<p>Dheere padho. State test <b>pass</b> hua: jo neighbours bache hain woh sab Full hain. Cross-snapshot test <b>fail</b> hua: neighbour 10.23.0.2 pre snapshot mein tha aur ab nahi hai. Simple health check sirf passing line dikhata. J3 apni taraf se isi tarah fail hota hai (10.23.0.1 gayab), aur J1 theek hai. Teen routers, ek toota link, ek minute se kam mein mil gaya.</p>

<h3>Wait kyun zaroori hai: OSPF turant nahi hota</h3>
<p>Ab ulta change, CHG-3105 hataana. Undo ke turant baad, tees second baad aur do minute baad J2 dekho. Prompt batata hai kis router se poochha gaya.</p>
<pre class="out">J2&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.99.0.11       ge-0/0/0.0             Full            10.255.0.1       128    33
10.99.0.13       ge-0/0/0.0             Full            10.255.0.3       128    35
10.12.0.1        ge-0/0/1.0             Full            10.255.0.1       128    32
<span class="hl">10.23.0.2        ge-0/0/2.0             2Way            10.255.0.3       128    34</span></pre>
<pre class="out">J2&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.99.0.11       ge-0/0/0.0             Full            10.255.0.1       128    31
10.99.0.13       ge-0/0/0.0             Full            10.255.0.3       128    33
10.12.0.1        ge-0/0/1.0             Full            10.255.0.1       128    40
<span class="hl">10.23.0.2        ge-0/0/2.0             Full            10.255.0.3       128    32</span></pre>
<p>Pehle neighbour <code>2Way</code> hai, phir <code>Full</code>. Dono ke beech routers designated router chun rahe hain aur databases exchange kar rahe hain. 2Way ke window mein liya post snapshot healthy network ko kharaab keh dega. Fixed <code>sleep 20</code> andaaza hai. Aisa loop jo neighbour count tab tak poll kare jab tak sahi na ho, andaaza nahi hai; <code>change.py</code> ka undo aisa hi loop use karta hai.</p>

<div class="eg"><p><b>Worked example.</b> <code>change.py CHG-3105 undo</code> ke baad aap <code>snap post2 0</code> bahut jaldi chalate ho. Check kehta hai J2 ka <code>list-not-less</code> pass hai (neighbour wapas aa gaya, 2Way mein) lekin Full test fail hai. Network mein kuch galat nahi, sirf aapki timing galat hai. Jab tak neighbour count 4 aur har state Full na ho, ruko, phir snap karo.</p></div>

<h3>Jab JSNAPy apna kaam nahi kar paata</h3>
<pre class="out">AUTO01$ python3 errs2.py
--- wrong password
Connecting to device 10.99.0.11 ................
ERROR!! Unable to connect to device: ConnectAuthError(10.99.0.11)
Connecting to device 10.99.0.12 ................
ERROR!! Unable to connect to device: ConnectAuthError(10.99.0.12)
Connecting to device 10.99.0.13 ................
ERROR!! Unable to connect to device: ConnectAuthError(10.99.0.13)
[]</pre>
<p>Galat password exception nahi uthata. JSNAPy har router ke liye ERROR print karta hai aur <b>khaali list</b> lautata hai. Python mein khaali list ka <code>all()</code> True hota hai, isliye <code>assert all(r.result == "Passed" for r in results)</code> tab bhi pass hota hai jab kuch check hi nahi hua. Hamesha results ki ginti routers ki ginti se milao. Jo tag aapne kabhi liya hi nahi uske saath <code>check</code> "Snapshot file not found" print karta hai aur har test ko Failed karta hai, jo surakshit disha hai.</p>

<div class="warn"><p><b>Aam galtiyan.</b> (1) Change ke turant baad post snapshot lena. (2) Tag <code>post</code> dobara use karke pichhle attempt ka saboot overwrite karna: tag mein change number daalo. (3) <code>check</code> ki jagah <code>snapcheck</code> chalana; snapcheck snapshot ko khud se compare karta hai, isliye <code>list-not-less</code> kabhi fail nahi ho sakta. (4) Purane snapshots padhe rehne dena aur galat pre se compare karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>snap</code> sirf save karta hai, <code>snapcheck</code> save aur test ek saath karta hai, <code>check</code> do saved tags test karta hai. Sirf <code>check</code> cross-snapshot operators ko dekhne ke liye doosra snapshot deta hai.</p></div>

<div class="scn"><h4>02:05 par pass hua change</h4><p>Raat ke engineer ne interface band kiya, change lagne ke turant baad check chalaya aur "all good" likh diya. Post snapshot commit ke do second baad liya gaya tha, OSPF ko pata chalne se pehle. Subah ki team ko neighbour gayab mila. 20 second ka wait aur neighbour-count poll log mein yeh dikha deta.</p><p><b>Lesson:</b> check utna hi imaandaar hai jitne waqt woh dekhta hai.</p></div>

<div class="iv"><p class="q">"Post snapshot se pehle wait kyun karte ho?"</p><p>Protocols seconds ya minutes mein converge hote hain. Main rukta hoon ya poll karta hoon jab tak state stable na ho, phir snapshot leta hoon, taki result network dikhaye, transition nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pre/post teen kadam hai: <code>snap pre</code>, change, <code>snap post</code>, phir <code>check pre post</code>.</li>
<li>Snapshots host, tag aur command ke naam ki files hain; har router har command ke liye ek.</li>
<li>State test pass aur <code>list-not-less</code> fail ka matlab kuch chupchaap gayab hua.</li>
<li>Post snapshot se pehle convergence ka wait karo; poll karo, andaaza mat lagao.</li>
<li>Galat password khaali list lautata hai: ginti check karo ki kitne results aaye.</li>
</ul></div>
`}};export{e as default};