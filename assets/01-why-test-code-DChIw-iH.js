var e={id:`why-test-code`,h:{en:`Why test network code: a pre-flight checklist for your scripts`,hi:`Network code ko test kyon karein: scripts ke liye pre-flight checklist`},body:{en:`
<p><b>The idea of this chapter:</b> a script that touches routers deserves the same care as a change that touches routers. A test checks your script in one second, on AUTO01, before the script ever logs in to a device. This chapter explains why that matters, what you will be able to do at the end, and what you should know first.</p>

<h3>What you will learn</h3>
<ul>
<li>Write a test as a plain function with <code>assert</code> and run it with <code>pytest -q</code>.</li>
<li>Read a failure: which line, which values, which side is wrong.</li>
<li>Turn a table of cases into one <code>parametrize</code> test, share sample <code>show</code> output with a fixture, test files with <code>tmp_path</code>, and test printed text with <code>capsys</code>.</li>
<li>Replace the SSH connection with a fake using <code>monkeypatch</code>, and check bad input with <code>pytest.raises</code>.</li>
<li>Run a slice of the suite with <code>-k</code> and decide, for a red test, whether the code or the test is wrong.</li>
</ul>

<h3>Prerequisites</h3>
<ul>
<li><code>auto-py-basics</code>, <code>auto-py-data</code> and <code>auto-py-func</code>: variables, dictionaries, loops, functions, files and <code>try/except</code>.</li>
<li><code>auto-parse</code>: turning <code>show ip interface brief</code> text into data. The parser you test here is that idea in a small function.</li>
<li><code>auto-ssh</code> and <code>py-tools</code>: the SSH library <code>nkmiko</code>, exit codes and the habit of running tools safely.</li>
<li><code>auto-testing</code>: the pyATS-style module that tests the <i>network</i>. Do not repeat it here; we only contrast it with pytest below.</li>
</ul>

<h3>Analogy: the pre-flight checklist</h3>
<p>A pilot never discovers on the runway that the flaps are stuck. The crew reads a checklist on the ground, where a problem costs minutes and not lives. A test suite is that checklist for your code. Each line says "this input must give that answer". If one line is red, the plane does not leave the gate, and the router never sees the script.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="netlib.py goes through pytest and ends green or red before any router">
<rect x="20" y="45" width="150" height="60" rx="10" fill="#bae6fd"/><text x="95" y="72" text-anchor="middle" class="svg-ink" font-size="13">netlib.py</text><text x="95" y="92" text-anchor="middle" class="svg-muted" font-size="11">your helpers</text>
<rect x="240" y="45" width="160" height="60" rx="10" fill="#fde68a"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="13">pytest -q</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="11">one second, no router</text>
<rect x="470" y="15" width="150" height="45" rx="10" fill="#bbf7d0"/><text x="545" y="43" text-anchor="middle" class="svg-ink" font-size="12">green: safe to run</text>
<rect x="470" y="90" width="150" height="45" rx="10" fill="#fecaca"/><text x="545" y="118" text-anchor="middle" class="svg-ink" font-size="12">red: fix it first</text>
<line x1="170" y1="75" x2="240" y2="75" stroke="#64748b" stroke-width="2"/><line x1="400" y1="65" x2="470" y2="38" stroke="#64748b" stroke-width="2"/><line x1="400" y1="85" x2="470" y2="112" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The router only meets code that has already passed.</p></div>

<h3>pytest and the auto-testing module are different jobs</h3>
<table class="cmp"><tr><th></th><th>auto-testing (pyATS-style)</th><th>pytest on your code</th></tr>
<tr><td>Question</td><td>Is the network healthy?</td><td>Is my code correct?</td></tr>
<tr><td>Needs a device</td><td>Yes, it logs in and reads state</td><td>No, it uses sample text and fakes</td></tr>
<tr><td>Typical failure</td><td>An OSPF neighbour is missing</td><td>The parser drops a row</td></tr>
<tr><td>When</td><td>Before and after a change window</td><td>Every time you edit the script</td></tr>
</table>
<p>They work together. pytest proves the checking code is right, and the network test then uses that code on real routers.</p>

<h3>The code under test: netlib.py</h3>
<p>Kaveri Foods keeps its helpers in one file on AUTO01. Both labs use it. Log in as <code>netadmin</code> (password <code>Deccan@123</code>) and look around:</p>
<pre class="out">AUTO01$ ls
netlib.py  samples
AUTO01$ cat samples/brief.txt
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/1     unassigned      YES unset  administratively down down
Loopback0              1.1.1.1         YES manual up                    up</pre>
<p><code>samples/brief.txt</code> is a saved copy of <code>show ip interface brief</code>. It is the raw material for the parser tests: no router is needed to read it. The functions in <code>netlib.py</code> are:</p>
<table class="cmp"><tr><th>Function</th><th>Job</th></tr>
<tr><td><code>valid_vlan(vid)</code></td><td>True for 1 to 4094, except the reserved 1002 to 1005</td></tr>
<tr><td><code>vlan_range(text)</code></td><td>"10-12" becomes [10, 11, 12]; bad text raises <code>ValueError</code></td></tr>
<tr><td><code>parse_brief(text)</code></td><td>show output becomes a list of dictionaries</td></tr>
<tr><td><code>interfaces_down(rows)</code></td><td>names whose protocol is not up</td></tr>
<tr><td><code>save_backup(folder, host, text)</code></td><td>writes <code>host.cfg</code> and returns its path</td></tr>
<tr><td><code>device_hostname(host)</code></td><td>connects over SSH and reads the hostname</td></tr>
</table>
<p>The first five need no network at all. The last one does, and Chapter 7 shows how to test it without a router.</p>

<div class="eg"><p><b>Worked example.</b> Suppose someone writes <code>1 &lt;= vid &lt; 4094</code> by mistake. VLAN 4094 is now rejected. You might find that during a change window, when the management VLAN refuses to be created. A one-line test, <code>assert valid_vlan(4094) is True</code>, finds it the moment the file is saved. The test costs one minute to write and saves the window.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Believing "the script worked once, so it is tested". Writing tests that need a live router, so nobody runs them. Treating a green suite as proof that the network is fine: it only proves the code does what the tests say.</p></div>
<div class="exam"><p><b>Exam trap.</b> pytest is a general Python test tool. pyATS-style network testing is a different layer. Interview answers that mix them up sound like you never ran either.</p></div>

<div class="scn"><h4>The VLAN that would not be created</h4><p>A team scripted VLAN creation for a new branch. The helper that validated ids used a strict less-than at the top of the range, so the management VLAN 4094 was refused. It surfaced at 11 pm in the window, with the branch half configured. Afterwards the team wrote a ten-row test table, ran it on every edit, and the same class of bug never reached a router again.</p><p><b>Lesson:</b> boundaries are where network scripts break, and a test checks every boundary in a second.</p></div>

<div class="iv"><p class="q">"Why do you write tests for automation scripts?"</p><p>A script changes many devices at once, so one bug is multiplied. Unit tests check my parsing, validation and file code without touching a router, run in a second, and run again on every edit. I use pytest for the code and a pyATS-style test for the network.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A test is a small function that says "this input must give that answer".</li>
<li>pytest tests your code and needs no router; network testing checks the live network.</li>
<li>netlib.py has five offline helpers and one that needs SSH.</li>
<li>Boundaries (4094, 4095, 1002 to 1005) are where bugs hide, so test them first.</li>
<li>Green means "the code matches the tests", not "the network is healthy".</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> jo script routers ko chhoo rahi hai, use utni hi care chahiye jitni router par change ko. Test aapki script ko AUTO01 par ek second mein check kar deta hai, script ke kisi device mein login karne se pehle. Yeh chapter batata hai ki yeh kyon zaroori hai, ant mein aap kya kar paoge, aur pehle kya aana chahiye.</p>

<h3>Aap kya seekhoge</h3>
<ul>
<li>Test ko plain function ki tarah <code>assert</code> ke saath likhna aur <code>pytest -q</code> se chalana.</li>
<li>Failure padhna: kaunsi line, kaunsi values, kaunsi side galat.</li>
<li>Cases ki table ko ek <code>parametrize</code> test banana, sample <code>show</code> output fixture se share karna, files ko <code>tmp_path</code> se test karna, aur printed text ko <code>capsys</code> se test karna.</li>
<li>SSH connection ko <code>monkeypatch</code> se fake se badalna, aur galat input ko <code>pytest.raises</code> se check karna.</li>
<li>Suite ka ek hissa <code>-k</code> se chalana aur red test ke liye tay karna ki code galat hai ya test.</li>
</ul>

<h3>Prerequisites</h3>
<ul>
<li><code>auto-py-basics</code>, <code>auto-py-data</code> aur <code>auto-py-func</code>: variables, dictionaries, loops, functions, files aur <code>try/except</code>.</li>
<li><code>auto-parse</code>: <code>show ip interface brief</code> ke text ko data banana. Yahan jo parser test hoga woh isi idea ka chhota function hai.</li>
<li><code>auto-ssh</code> aur <code>py-tools</code>: SSH library <code>nkmiko</code>, exit codes aur tools ko safely chalane ki aadat.</li>
<li><code>auto-testing</code>: pyATS-style module jo <i>network</i> ko test karta hai. Use yahan dobara mat padho; neeche sirf pytest se contrast karenge.</li>
</ul>

<h3>Analogy: pre-flight checklist</h3>
<p>Pilot ko runway par pata nahi chalna chahiye ki flaps atke hain. Crew ground par checklist padhta hai, jahan problem ki keemat minutes hoti hai, jaan nahi. Test suite aapke code ki wahi checklist hai. Har line kehti hai "yeh input, yeh answer dena chahiye". Ek line red ho to plane gate se nahi hilta, aur router script ko kabhi dekhta hi nahi.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="netlib.py pytest se guzarta hai aur router se pehle green ya red aata hai">
<rect x="20" y="45" width="150" height="60" rx="10" fill="#bae6fd"/><text x="95" y="72" text-anchor="middle" class="svg-ink" font-size="13">netlib.py</text><text x="95" y="92" text-anchor="middle" class="svg-muted" font-size="11">aapke helpers</text>
<rect x="240" y="45" width="160" height="60" rx="10" fill="#fde68a"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="13">pytest -q</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="11">ek second, router nahi</text>
<rect x="470" y="15" width="150" height="45" rx="10" fill="#bbf7d0"/><text x="545" y="43" text-anchor="middle" class="svg-ink" font-size="12">green: chalana safe</text>
<rect x="470" y="90" width="150" height="45" rx="10" fill="#fecaca"/><text x="545" y="118" text-anchor="middle" class="svg-ink" font-size="12">red: pehle fix karo</text>
<line x1="170" y1="75" x2="240" y2="75" stroke="#64748b" stroke-width="2"/><line x1="400" y1="65" x2="470" y2="38" stroke="#64748b" stroke-width="2"/><line x1="400" y1="85" x2="470" y2="112" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Router sirf woh code dekhta hai jo pehle pass ho chuka ho.</p></div>

<h3>pytest aur auto-testing module alag kaam hain</h3>
<table class="cmp"><tr><th></th><th>auto-testing (pyATS-style)</th><th>Aapke code par pytest</th></tr>
<tr><td>Sawaal</td><td>Kya network healthy hai?</td><td>Kya mera code sahi hai?</td></tr>
<tr><td>Device chahiye</td><td>Haan, login karke state padhta hai</td><td>Nahi, sample text aur fakes use karta hai</td></tr>
<tr><td>Aam failure</td><td>OSPF neighbour gayab hai</td><td>Parser ek row gira deta hai</td></tr>
<tr><td>Kab</td><td>Change window se pehle aur baad</td><td>Script edit karne par har baar</td></tr>
</table>
<p>Dono saath kaam karte hain. pytest saabit karta hai ki checking code sahi hai, aur network test phir wahi code asli routers par chalata hai.</p>

<h3>Test hone wala code: netlib.py</h3>
<p>Kaveri Foods apne helpers AUTO01 par ek file mein rakhta hai. Dono labs use use karte hain. <code>netadmin</code> (password <code>Deccan@123</code>) se login karo aur dekho:</p>
<pre class="out">AUTO01$ ls
netlib.py  samples
AUTO01$ cat samples/brief.txt
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.99.0.1       YES manual up                    up
GigabitEthernet0/1     unassigned      YES unset  administratively down down
Loopback0              1.1.1.1         YES manual up                    up</pre>
<p><code>samples/brief.txt</code> <code>show ip interface brief</code> ki saved copy hai. Yeh parser tests ka kachcha maal hai: ise padhne ke liye router nahi chahiye. <code>netlib.py</code> ke functions:</p>
<table class="cmp"><tr><th>Function</th><th>Kaam</th></tr>
<tr><td><code>valid_vlan(vid)</code></td><td>1 se 4094 ke liye True, reserved 1002 se 1005 ko chhodkar</td></tr>
<tr><td><code>vlan_range(text)</code></td><td>"10-12" se [10, 11, 12] banta hai; galat text <code>ValueError</code> deta hai</td></tr>
<tr><td><code>parse_brief(text)</code></td><td>show output dictionaries ki list banta hai</td></tr>
<tr><td><code>interfaces_down(rows)</code></td><td>un interfaces ke naam jinka protocol up nahi</td></tr>
<tr><td><code>save_backup(folder, host, text)</code></td><td><code>host.cfg</code> likhta hai aur uska path return karta hai</td></tr>
<tr><td><code>device_hostname(host)</code></td><td>SSH se connect karke hostname padhta hai</td></tr>
</table>
<p>Pehle paanch ko network bilkul nahi chahiye. Aakhri ko chahiye, aur Chapter 7 dikhata hai ki use router ke bina kaise test karein.</p>

<div class="eg"><p><b>Worked example.</b> Maan lo kisi ne galti se <code>1 &lt;= vid &lt; 4094</code> likh diya. Ab VLAN 4094 reject hota hai. Yeh aapko change window mein pata chal sakta hai, jab management VLAN banne se mana kare. Ek line ka test, <code>assert valid_vlan(4094) is True</code>, file save hote hi ise pakad leta hai. Test likhne mein ek minute lagta hai aur window bach jaati hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Yeh maan lena ki "script ek baar chali, to tested hai". Aise tests likhna jinhe live router chahiye, to koi unhe chalata nahi. Green suite ko network theek hone ka saboot samajhna: yeh sirf itna saabit karti hai ki code tests ke kehne ke mutabik hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> pytest general Python test tool hai. pyATS-style network testing alag layer hai. Interview mein dono ko mila dene wale jawab lagte hain ki aapne dono kabhi chalaye nahi.</p></div>

<div class="scn"><h4>Woh VLAN jo bana hi nahi</h4><p>Ek team ne naye branch ke liye VLAN creation script kiya. Ids validate karne wale helper ne range ke top par strict less-than use kiya, isliye management VLAN 4094 refuse ho gaya. Yeh raat 11 baje window mein saamne aaya, branch aadha configure hua tha. Uske baad team ne das-row ki test table likhi, har edit par chalayi, aur is tarah ka bug dobara router tak nahi pahuncha.</p><p><b>Lesson:</b> network scripts boundaries par tootti hain, aur test har boundary ek second mein check kar leta hai.</p></div>

<div class="iv"><p class="q">"Automation scripts ke liye tests kyon likhte ho?"</p><p>Script ek saath kai devices badalti hai, isliye ek bug kai guna ho jaata hai. Unit tests mere parsing, validation aur file code ko router chhue bina check karte hain, ek second mein chalte hain, aur har edit par dobara chalte hain. Code ke liye pytest use karta hoon aur network ke liye pyATS-style test.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Test ek chhota function hai jo kehta hai "yeh input, yeh answer".</li>
<li>pytest aapke code ko test karta hai aur router nahi chahiye; network testing live network check karti hai.</li>
<li>netlib.py mein paanch offline helpers hain aur ek jise SSH chahiye.</li>
<li>Boundaries (4094, 4095, 1002 se 1005) mein bugs chhupte hain, isliye unhe pehle test karo.</li>
<li>Green ka matlab "code tests se match karta hai", "network healthy hai" nahi.</li>
</ul></div>
`}};export{e as default};