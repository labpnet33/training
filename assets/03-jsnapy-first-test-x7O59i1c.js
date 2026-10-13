var e={id:`jsnapy-first-test`,h:{en:`JSNAPy: a config file, a test file and a first snapcheck`,hi:`JSNAPy: config file, test file aur pehla snapcheck`},body:{en:`
<p>JSNAPy (Junos Snapshot Administrator in Python) automates exactly what you did by hand: it connects to routers, takes snapshots of the commands you list, and applies tests that you write in YAML. It has three jobs, which map to three methods of the <code>SnapAdmin</code> class:</p>
<table class="cmp"><tr><th>Method</th><th>What it does</th><th>Snapshots needed</th></tr>
<tr><td><code>snap(config, tag)</code></td><td>Takes a snapshot and saves it under a tag such as <code>pre</code></td><td>None, it creates one</td></tr>
<tr><td><code>snapcheck(config, tag)</code></td><td>Takes a snapshot and tests it at once</td><td>None, it creates one</td></tr>
<tr><td><code>check(config, pre, post)</code></td><td>Tests two saved snapshots against each other</td><td>Two, already saved</td></tr></table>
<p>Real JSNAPy is mostly driven from a command line (<code>jsnapy --snap</code>, <code>--snapcheck</code>, <code>--check</code>); the lab teaches the same engine through the Python API, which is also how you embed it in pipelines. The test files and the report are the same either way.</p>

<h3>Two files: who to test, and what to test</h3>
<p>The <b>config</b> says which devices and which test files. The <b>test file</b> says what to ask each device and what a good answer is. Keeping them apart means the same tests run against one router or fifty. Our script builds the config as YAML text from a Python inventory, so the password comes from an environment variable and never sits in a file:</p>
<pre class="code">"""jsnap.py - JSNAPy snapshots and checks for the core routers J1, J2 and J3.
Usage: python3 jsnap.py snapcheck
"""
import os
import sys

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
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))</pre>
<p>It prints a config like this for three routers (we show the first host):</p>
<pre class="out">hosts:
  - device: 10.99.0.11
    username: netops
    passwd: NK@2026
  ...
tests:
  - test_health.yml</pre>
<p>Now the test file. Read it from the top; every level has a job.</p>
<pre class="code">tests_include:
  - test_ospf_nbr
test_ospf_nbr:
  - command: show ospf neighbor
  - iterate:
      xpath: ospf-neighbor
      id: neighbor-address
      tests:
        - is-equal: ospf-neighbor-state, Full
          err: "OSPF neighbor {{post['neighbor-address']}} on {{post['interface-name']}} is {{post['ospf-neighbor-state']}}, expected Full"
          info: "OSPF neighbor {{post['neighbor-address']}} is Full"</pre>
<dl class="terms">
<dt>tests_include</dt><dd>Which named tests to run. A test that is not listed is ignored, which is handy for switching tests off.</dd>
<dt>command / rpc</dt><dd>What to ask. <code>command: show ospf neighbor</code> is translated into the RPC behind it. You can also write <code>rpc: get-interface-information</code> (chapter 4).</dd>
<dt>iterate</dt><dd>Test <b>every</b> node found by <code>xpath</code>. Here, every <code>ospf-neighbor</code> element.</dd>
<dt>id</dt><dd>The field that names each node, so messages say <i>which</i> neighbour failed and so pre and post nodes can be paired.</dd>
<dt>tests</dt><dd>The operators to apply. <code>is-equal: ospf-neighbor-state, Full</code> reads: this field must equal Full.</dd>
<dt>err / info</dt><dd>Messages (Jinja2 templates) printed when a node fails or passes. <code>post['field']</code> is the value in the snapshot being tested.</dd>
</dl>

<h3>The first snapcheck</h3>
<p>Run it. We show the report for J2; J1 and J3 print the same block with their own neighbours.</p>
<pre class="out">AUTO01$ python3 jsnap.py snapcheck; echo "exit code: $?"
**************************** Device: 10.99.0.12 ****************************
Tests Included: test_ospf_nbr
*************************** Command: show ospf neighbor ***************************
<span class="hl">PASS | All "ospf-neighbor-state" is equal to "Full" [ 4 matched ]</span>
INFO : OSPF neighbor 10.99.0.11 is Full
INFO : OSPF neighbor 10.99.0.13 is Full
INFO : OSPF neighbor 10.12.0.1 is Full
INFO : OSPF neighbor 10.23.0.2 is Full
------------------------------ Final Result!! ------------------------------
test_ospf_nbr : Passed
Total No of tests passed: 1
Total No of tests failed: 0
Overall Tests passed!!!</pre>
<pre class="out">AUTO01$ python3 jsnap.py snapcheck; echo "exit code: $?"
10.99.0.11   Passed  passed=1 failed=0
10.99.0.12   Passed  passed=1 failed=0
10.99.0.13   Passed  passed=1 failed=0
exit code: 0</pre>
<p>Read the lines in order. <code>PASS | All "ospf-neighbor-state" is equal to "Full" [ 4 matched ]</code> says four nodes were tested and all four passed. The <code>INFO</code> lines come from our <code>info</code> template. <code>Final Result!!</code> lists each named test and the totals. Our own <code>summary()</code> function then prints one line per router and returns a failure count, which becomes the script's exit code: 0 means every router passed.</p>

<pre class="out">AUTO01$ python3 jsnap.py snapcheck; echo "exit code: $?"
**************************** Device: 10.99.0.12 ****************************
Tests Included: test_ospf_nbr
*************************** Command: show ospf neighbor ***************************
<span class="hl">FAIL | All "ospf-neighbor-state" is equal to "Down" [ 0 matched / 4 failed ]</span>
ERROR : OSPF neighbor 10.99.0.11 on ge-0/0/0.0 is Full, expected Full
ERROR : OSPF neighbor 10.99.0.13 on ge-0/0/0.0 is Full, expected Full
ERROR : OSPF neighbor 10.12.0.1 on ge-0/0/1.0 is Full, expected Full
ERROR : OSPF neighbor 10.23.0.2 on ge-0/0/2.0 is Full, expected Full
------------------------------ Final Result!! ------------------------------
test_ospf_nbr : Failed
Total No of tests passed: 0
Total No of tests failed: 1
Overall Tests failed!!!</pre>
<pre class="out">AUTO01$ python3 jsnap.py snapcheck; echo "exit code: $?"
10.99.0.11   Failed  passed=0 failed=1
10.99.0.12   Failed  passed=0 failed=1
10.99.0.13   Failed  passed=0 failed=1
exit code: 1</pre>
<div class="eg"><p><b>Worked example.</b> Run <code>sed</code> to change <code>Full</code> to <code>Down</code> in the test file and snapcheck again. Each router now prints one <code>FAIL</code> line, and the count reads <code>[ 0 matched / 4 failed ]</code> for J2: none of its four neighbours is Down. The <code>ERROR</code> lines come from your <code>err</code> template, and here they say "is Full, expected Full", which is silly. The template has the word Full typed into it, so when you edit the operator you must edit the message too. The exit code is 1 and the summary shows all three routers Failed. A test you have never seen fail is a test you cannot trust yet.</p></div>

<h3>In the lab and on real gear</h3>
<p>The lab's JSNAPy is a faithful lite version: it keeps the report layout of JSNAPy 1.3 (the wording of the FAIL and ERROR detail lines is close to, not always identical with, the real one). It has no <code>jsnapy</code> command, no <code>--diff</code>, no e-mail or database output and saves only XML snapshots into <code>./snapshots</code>. Test files are found in the config's folder, in the current folder or in <code>./testfiles</code>; real JSNAPy normally looks in its own testfiles folder (set in <code>jsnapy.cfg</code>) unless you give a path.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) YAML indentation: a list item that is one space off silently becomes part of the wrong block. Run the file through a YAML parser when in doubt. (2) A test name in the body that is not in <code>tests_include</code> never runs, and nothing tells you. (3) A command JSNAPy cannot map to an RPC. Check with <code>show ... | display xml rpc</code> on the device. (4) Putting passwords in a YAML file in a repository.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>snapcheck</code> takes its own snapshot and tests it; <code>check</code> needs two snapshots that already exist. Operators that compare before and after only make sense in <code>check</code>.</p></div>

<div class="scn"><h4>The test that never ran</h4><p>A colleague added <code>test_interfaces</code> to the YAML file and every run came back green for weeks. The name was missing from <code>tests_include</code>, so JSNAPy never executed it. A deliberate failure (changing the expected value) would have shown within a minute that the test was not running.</p><p><b>Lesson:</b> make every new test fail once, on purpose, before you trust it.</p></div>

<div class="iv"><p class="q">"What is the difference between snapcheck and check in JSNAPy?"</p><p>snapcheck takes a fresh snapshot and tests it against the rules straight away, so it answers "is it healthy now?". check compares two saved snapshots, normally pre and post, so it answers "what did the change do?". I use snapcheck for the pre-flight health check and check after the change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>JSNAPy has three jobs: <code>snap</code>, <code>snapcheck</code> and <code>check</code>.</li>
<li>The config says where to test, the test file says what to test.</li>
<li><code>iterate</code> with <code>xpath</code> and <code>id</code> tests every node and names the ones that fail.</li>
<li>The report shows PASS or FAIL per operator, then a Final Result; your script turns it into an exit code.</li>
<li>Make a new test fail once on purpose before trusting it.</li>
</ul></div>
`,hi:`
<p>JSNAPy (Junos Snapshot Administrator in Python) wahi automate karta hai jo aapne haath se kiya: woh routers se connect hota hai, aapki list ki commands ke snapshots leta hai, aur aapke YAML mein likhe tests lagata hai. Iske teen kaam hain, jo <code>SnapAdmin</code> class ke teen methods se milte hain:</p>
<table class="cmp"><tr><th>Method</th><th>Kya karta hai</th><th>Kitne snapshots chahiye</th></tr>
<tr><td><code>snap(config, tag)</code></td><td>Snapshot leta hai aur <code>pre</code> jaise tag se save karta hai</td><td>Koi nahi, khud banata hai</td></tr>
<tr><td><code>snapcheck(config, tag)</code></td><td>Snapshot leta hai aur turant test karta hai</td><td>Koi nahi, khud banata hai</td></tr>
<tr><td><code>check(config, pre, post)</code></td><td>Do saved snapshots ko ek doosre se test karta hai</td><td>Do, pehle se saved</td></tr></table>
<p>Asli JSNAPy zyada tar command line se chalta hai (<code>jsnapy --snap</code>, <code>--snapcheck</code>, <code>--check</code>); lab wahi engine Python API se sikhata hai, jo pipelines mein lagane ka bhi tareeka hai. Test files aur report dono tareeko mein same hain.</p>

<h3>Do files: kise test karna hai, aur kya test karna hai</h3>
<p><b>Config</b> batata hai kaunse devices aur kaunse test files. <b>Test file</b> batati hai har device se kya poochhna hai aur achha jawab kya hai. Inhe alag rakhne se wahi tests ek router par bhi chalte hain aur pachas par bhi. Hamari script config ko Python inventory se YAML text ki tarah banati hai, isliye password environment variable se aata hai aur kisi file mein nahi baithta:</p>
<pre class="code">"""jsnap.py - JSNAPy snapshots and checks for the core routers J1, J2 and J3.
Usage: python3 jsnap.py snapcheck
"""
import os
import sys

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
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))</pre>
<p>Yeh teen routers ke liye aisa config print karti hai (hum pehla host dikha rahe hain):</p>
<pre class="out">hosts:
  - device: 10.99.0.11
    username: netops
    passwd: NK@2026
  ...
tests:
  - test_health.yml</pre>
<p>Ab test file. Upar se padho; har level ka ek kaam hai.</p>
<pre class="code">tests_include:
  - test_ospf_nbr
test_ospf_nbr:
  - command: show ospf neighbor
  - iterate:
      xpath: ospf-neighbor
      id: neighbor-address
      tests:
        - is-equal: ospf-neighbor-state, Full
          err: "OSPF neighbor {{post['neighbor-address']}} on {{post['interface-name']}} is {{post['ospf-neighbor-state']}}, expected Full"
          info: "OSPF neighbor {{post['neighbor-address']}} is Full"</pre>
<dl class="terms">
<dt>tests_include</dt><dd>Kaunse named tests chalane hain. Jo test list mein nahi hai woh ignore hota hai, jo tests ko band karne ke kaam aata hai.</dd>
<dt>command / rpc</dt><dd>Kya poochhna hai. <code>command: show ospf neighbor</code> uske peeche ke RPC mein translate hota hai. Aap <code>rpc: get-interface-information</code> bhi likh sakte ho (chapter 4).</dd>
<dt>iterate</dt><dd><code>xpath</code> se mile <b>har</b> node ko test karo. Yahan har <code>ospf-neighbor</code> element.</dd>
<dt>id</dt><dd>Woh field jo har node ko naam deti hai, taaki messages bataye <i>kaun sa</i> neighbour fail hua aur pre aur post nodes ki jodi ban sake.</dd>
<dt>tests</dt><dd>Lagane wale operators. <code>is-equal: ospf-neighbor-state, Full</code> ka matlab: yeh field Full ke barabar honi chahiye.</dd>
<dt>err / info</dt><dd>Messages (Jinja2 templates) jo node fail ya pass hone par print hote hain. <code>post['field']</code> us snapshot ki value hai jo test ho raha hai.</dd>
</dl>

<h3>Pehla snapcheck</h3>
<p>Chalao. Hum J2 ki report dikha rahe hain; J1 aur J3 apne neighbours ke saath wahi block print karte hain.</p>
<pre class="out">AUTO01$ python3 jsnap.py snapcheck; echo "exit code: $?"
**************************** Device: 10.99.0.12 ****************************
Tests Included: test_ospf_nbr
*************************** Command: show ospf neighbor ***************************
<span class="hl">PASS | All "ospf-neighbor-state" is equal to "Full" [ 4 matched ]</span>
INFO : OSPF neighbor 10.99.0.11 is Full
INFO : OSPF neighbor 10.99.0.13 is Full
INFO : OSPF neighbor 10.12.0.1 is Full
INFO : OSPF neighbor 10.23.0.2 is Full
------------------------------ Final Result!! ------------------------------
test_ospf_nbr : Passed
Total No of tests passed: 1
Total No of tests failed: 0
Overall Tests passed!!!</pre>
<pre class="out">AUTO01$ python3 jsnap.py snapcheck; echo "exit code: $?"
10.99.0.11   Passed  passed=1 failed=0
10.99.0.12   Passed  passed=1 failed=0
10.99.0.13   Passed  passed=1 failed=0
exit code: 0</pre>
<p>Lines ko order se padho. <code>PASS | All "ospf-neighbor-state" is equal to "Full" [ 4 matched ]</code> kehta hai ki chaar nodes test hue aur chaaron pass hue. <code>INFO</code> lines hamare <code>info</code> template se aati hain. <code>Final Result!!</code> har named test aur totals ki list deta hai. Hamara apna <code>summary()</code> function phir har router ki ek line print karta hai aur failure count return karta hai, jo script ka exit code banta hai: 0 ka matlab har router pass hua.</p>

<pre class="out">AUTO01$ python3 jsnap.py snapcheck; echo "exit code: $?"
**************************** Device: 10.99.0.12 ****************************
Tests Included: test_ospf_nbr
*************************** Command: show ospf neighbor ***************************
<span class="hl">FAIL | All "ospf-neighbor-state" is equal to "Down" [ 0 matched / 4 failed ]</span>
ERROR : OSPF neighbor 10.99.0.11 on ge-0/0/0.0 is Full, expected Full
ERROR : OSPF neighbor 10.99.0.13 on ge-0/0/0.0 is Full, expected Full
ERROR : OSPF neighbor 10.12.0.1 on ge-0/0/1.0 is Full, expected Full
ERROR : OSPF neighbor 10.23.0.2 on ge-0/0/2.0 is Full, expected Full
------------------------------ Final Result!! ------------------------------
test_ospf_nbr : Failed
Total No of tests passed: 0
Total No of tests failed: 1
Overall Tests failed!!!</pre>
<pre class="out">AUTO01$ python3 jsnap.py snapcheck; echo "exit code: $?"
10.99.0.11   Failed  passed=0 failed=1
10.99.0.12   Failed  passed=0 failed=1
10.99.0.13   Failed  passed=0 failed=1
exit code: 1</pre>
<div class="eg"><p><b>Worked example.</b> <code>sed</code> se test file mein <code>Full</code> ko <code>Down</code> kar do aur dobara snapcheck chalao. Ab har router ek <code>FAIL</code> line print karta hai, aur J2 ke liye count <code>[ 0 matched / 4 failed ]</code> hai: uske chaaron neighbours mein se koi Down nahi hai. <code>ERROR</code> lines aapke <code>err</code> template se aati hain, aur yahan woh "is Full, expected Full" kehti hain, jo bematlab hai. Template mein Full shabd likha hua hai, isliye operator badalte waqt message bhi badalna padta hai. Exit code 1 hai aur summary mein teeno routers Failed dikhte hain. Jis test ko aapne kabhi fail hote nahi dekha, uspar abhi bharosa nahi kar sakte.</p></div>

<h3>Lab aur asli gear mein</h3>
<p>Lab ka JSNAPy ek imaandaar lite version hai: woh JSNAPy 1.3 ka report layout rakhta hai (FAIL aur ERROR detail lines ke shabd asli ke kareeb hain, hamesha bilkul same nahi). Usme <code>jsnapy</code> command, <code>--diff</code>, e-mail ya database output nahi hai aur woh sirf XML snapshots <code>./snapshots</code> mein save karta hai. Test files config ke folder mein, current folder mein ya <code>./testfiles</code> mein milti hain; asli JSNAPy aam taur par apne testfiles folder mein dhoondhta hai (<code>jsnapy.cfg</code> mein set), jab tak aap path na do.</p>

<div class="warn"><p><b>Aam galtiyan.</b> (1) YAML indentation: ek space idhar-udhar list item chupchaap galat block ka hissa ban jaata hai. Shak ho to file ko YAML parser se guzaro. (2) Body ka jo test name <code>tests_include</code> mein nahi hai woh kabhi nahi chalta, aur koi nahi batata. (3) Aisi command jise JSNAPy RPC mein map nahi kar sakta. Device par <code>show ... | display xml rpc</code> se check karo. (4) Passwords ko repository ki YAML file mein rakhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>snapcheck</code> apna snapshot leta hai aur use test karta hai; <code>check</code> ko do snapshots chahiye jo pehle se maujood hon. Before aur after compare karne wale operators sirf <code>check</code> mein matlab rakhte hain.</p></div>

<div class="scn"><h4>Woh test jo kabhi chala hi nahi</h4><p>Ek colleague ne YAML file mein <code>test_interfaces</code> joda aur hafto tak har run green aaya. Naam <code>tests_include</code> se gayab tha, isliye JSNAPy ne use kabhi execute hi nahi kiya. Jaanbujhkar failure (expected value badalna) ek minute mein dikha deta ki test chal hi nahi raha.</p><p><b>Lesson:</b> har naye test ko bharosa karne se pehle ek baar jaanbujhkar fail karao.</p></div>

<div class="iv"><p class="q">"JSNAPy mein snapcheck aur check mein kya fark hai?"</p><p>snapcheck naya snapshot leta hai aur use turant rules ke khilaaf test karta hai, to woh "abhi healthy hai?" ka jawab deta hai. check do saved snapshots ko compare karta hai, aam taur par pre aur post, to woh "change ne kya kiya?" ka jawab deta hai. Pre-flight health check ke liye snapcheck, aur change ke baad check use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>JSNAPy ke teen kaam hain: <code>snap</code>, <code>snapcheck</code> aur <code>check</code>.</li>
<li>Config batata hai kahan test karna hai, test file batati hai kya test karna hai.</li>
<li><code>xpath</code> aur <code>id</code> ke saath <code>iterate</code> har node ko test karta hai aur fail hone walon ke naam batata hai.</li>
<li>Report har operator ke liye PASS ya FAIL dikhati hai, phir Final Result; aapki script use exit code banati hai.</li>
<li>Naye test ko bharosa karne se pehle ek baar jaanbujhkar fail karao.</li>
</ul></div>
`}};export{e as default};