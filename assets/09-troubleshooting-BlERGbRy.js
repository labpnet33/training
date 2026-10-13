var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: BLOCKED, now what?`,hi:`Troubleshooting workflow: BLOCKED, ab kya?`},body:{en:`
<p>A gate that blocks is doing its job, and the person who meets the message at 17:30 on a Friday needs a method, not luck. This chapter walks Lab 2. Change CHG-3107 is stuck: <code>precheck.py</code> prints PRECHECK BLOCKED, and each time one problem is fixed another appears. The configs of the three vendors are in <code>candidate/configs</code>, the request is <code>intent.yaml</code>, and nothing is deployed.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="From the symptom to the first thing to check"><rect x="20" y="14" width="200" height="36" rx="9" fill="#fed7aa"/><text x="120" y="36" text-anchor="middle" class="svg-ink" font-size="12">ConnectionError port 9996</text><rect x="300" y="14" width="320" height="36" rx="9" fill="#e2e8f0"/><text x="460" y="36" text-anchor="middle" class="svg-ink" font-size="12">Batfish service is down</text><line x1="220" y1="32" x2="298" y2="32" stroke="#64748b" stroke-width="2"/><polygon points="298,32 289,37 289,27" fill="#64748b"/><rect x="20" y="60" width="200" height="36" rx="9" fill="#bae6fd"/><text x="120" y="82" text-anchor="middle" class="svg-ink" font-size="12">stage 1 FAILED</text><rect x="300" y="60" width="320" height="36" rx="9" fill="#e2e8f0"/><text x="460" y="82" text-anchor="middle" class="svg-ink" font-size="12">path + message: fix the YAML</text><line x1="220" y1="78" x2="298" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="298,78 289,83 289,73" fill="#64748b"/><rect x="20" y="106" width="200" height="36" rx="9" fill="#ddd6fe"/><text x="120" y="128" text-anchor="middle" class="svg-ink" font-size="12">stage 2 FAILED</text><rect x="300" y="106" width="320" height="36" rx="9" fill="#e2e8f0"/><text x="460" y="128" text-anchor="middle" class="svg-ink" font-size="12">undefined X: compare with defined</text><line x1="220" y1="124" x2="298" y2="124" stroke="#64748b" stroke-width="2"/><polygon points="298,124 289,129 289,119" fill="#64748b"/><rect x="20" y="152" width="200" height="36" rx="9" fill="#ddd6fe"/><text x="120" y="174" text-anchor="middle" class="svg-ink" font-size="12">stage 3 FAILED</text><rect x="300" y="152" width="320" height="36" rx="9" fill="#e2e8f0"/><text x="460" y="174" text-anchor="middle" class="svg-ink" font-size="12">HALF_OPEN: AS or IP differs</text><line x1="220" y1="170" x2="298" y2="170" stroke="#64748b" stroke-width="2"/><polygon points="298,170 289,175 289,165" fill="#64748b"/><rect x="20" y="198" width="200" height="36" rx="9" fill="#fde68a"/><text x="120" y="220" text-anchor="middle" class="svg-ink" font-size="12">stage 4 FAILED</text><rect x="300" y="198" width="320" height="36" rx="9" fill="#e2e8f0"/><text x="460" y="220" text-anchor="middle" class="svg-ink" font-size="12">unexpected route change</text><line x1="220" y1="216" x2="298" y2="216" stroke="#64748b" stroke-width="2"/><polygon points="298,216 289,221 289,211" fill="#64748b"/></svg><p class="cap">Read the stage number first: it tells you which tool saw the problem.</p></div>

<h3>The method: stage, tool, first check</h3>
<ol>
<li><b>Read the stage number.</b> It names the tool that saw the problem: 1 jsonschema, 2 Batfish hygiene, 3 Batfish sessions, 4 deepdiff.</li>
<li><b>Read the first line of the reason</b> before the rest. One cause often explains several lines.</li>
<li><b>Fix one thing, run again.</b> A fix can reveal the next stage's problem, as it does here. That is progress, not failure.</li>
<li><b>Prove the end:</b> all stages ok, the last line PRECHECK PASSED, exit code 0.</li>
</ol>

<h3>Step 0: is Batfish answering?</h3>
<p>If a Python traceback ends in <code>ConnectionError</code> the problem is not your config. Run the small script that only connects:</p>
<pre class="out">AUTO01$ python3 bfup.py
batfish is up, networks: ['nk-lab']</pre>
<p>Now stop the service (the lab simulates this with an environment variable) and read the error:</p>
<pre class="out">AUTO01$ NK_BATFISH=off python3 bfup.py
Traceback (most recent call last):
  File "bfup.py", line 5, in &lt;module&gt;
    bf.set_network("nk-lab")
  File "/usr/lib/python3.11/pybatfish/client/session.py", line 47, in set_network
...
<span class="hl">requests.exceptions.ConnectionError: HTTPConnectionPool(host='localhost', port=9996): Max retries exceeded with url: /v2/networks/nk-lab (Caused by NewConnectionError('&lt;urllib3.connection.HTTPConnection object at 0x7f3a2c1b9d10&gt;: Failed to establish a new connection: [Errno 111] Connection refused'))</span></pre>
<p>The last line is the one to read: <code>HTTPConnectionPool(host='localhost', port=9996)</code> and <code>Connection refused</code>. pybatfish looks for the service on port 9996, nothing listens there, so the container is down, on another host or blocked by a firewall. The middle lines (shortened here) are library internals. On real gear: <code>docker ps</code>, then start the container. The lab has no docker, so you continue with the service on.</p>

<h3>Stage 1: the request is malformed</h3>
<pre class="out">AUTO01$ python3 precheck.py; echo "exit code: $?"
<span class="hl">[1/3] intent shape     FAILED</span>
      - sessions/0/b_asn: '65002' is not of type 'integer'
<span class="hl">PRECHECK BLOCKED</span>
exit code: 1</pre>
<p>The line names the path and the rule: <code>sessions/0/b_asn</code> is the string "65002", and the schema wants an integer. Remove the quotes in <code>intent.yaml</code> with <code>sed</code> and run again. Batfish was never contacted, which is why this stage comes first.</p>

<h3>Stage 2: three typos, three vendors</h3>
<pre class="out">AUTO01$ python3 precheck.py; echo "exit code: $?"
[1/3] intent shape     ok
Successfully initialized snapshot 'candidate' from 'candidate'
Default snapshot is now set to candidate
[2/3] config hygiene   FAILED
<span class="hl">      - undefined ipv4 prefix-list PL-XE-1 (route-map match ipv4 prefix-list) configs/e1.cfg:[16]</span>
<span class="hl">      - undefined policy-statement EXPORT-L0 (bgp export policy-statement) configs/j1.cfg:[11]</span>
<span class="hl">      - undefined route-map rm-out (bgp outbound route-map) configs/xe1.cfg:[24]</span>
PRECHECK BLOCKED
exit code: 1</pre>
<p>One run lists all three because hygiene is one Batfish question. Take the rows one at a time:</p>
<table class="cmp"><tr><th>File</th><th>Batfish says</th><th>Defined name</th><th>The typo</th></tr>
<tr><td>xe1.cfg line 24</td><td>undefined <code>route-map</code> rm-out</td><td>RM-OUT</td><td>case: IOS names are case sensitive</td></tr>
<tr><td>j1.cfg line 11</td><td>undefined <code>policy-statement</code> EXPORT-L0</td><td>EXPORT-LO</td><td>digit zero instead of letter O</td></tr>
<tr><td>e1.cfg line 16</td><td>undefined <code>ipv4 prefix-list</code> PL-XE-1</td><td>PL-XE1</td><td>an extra dash, inside a route-map</td></tr></table>
<p>How to find each defined name quickly? Search the file for the kind of object: <code>grep -n "route-map" candidate/configs/xe1.cfg</code> shows both the definition (line 18) and the reference (line 24). The context column tells you where to look: "bgp outbound route-map" means a neighbour line, "route-map match ipv4 prefix-list" means a match line inside a route-map, "bgp export policy-statement" means the export line of a Junos group. Three <code>sed</code> commands later, stage 2 is ok.</p>

<h3>Stage 3: both ends NOT_COMPATIBLE</h3>
<pre class="out">AUTO01$ python3 precheck.py; echo "exit code: $?"
[1/3] intent shape     ok
Successfully initialized snapshot 'candidate' from 'candidate'
Default snapshot is now set to candidate
[2/3] config hygiene   ok
<span class="hl">[3/3] bgp sessions     FAILED</span>
<span class="hl">      - xe1 to 10.0.13.3 is NOT_COMPATIBLE</span>
<span class="hl">      - e1 to 10.0.13.1 is NOT_COMPATIBLE</span>
PRECHECK BLOCKED
exit code: 1</pre>
<p>The configs are clean, yet the sessions between xe1 and e1 are not compatible, on both ends. The generic reasons are in <code>bgpwhy.py</code>, which asks the compatibility question and filters out the healthy rows:</p>
<pre class="code">bf = Session(host="localhost")
bf.set_network("nk-lab")
bf.init_snapshot("candidate", name="candidate", overwrite=True)
compat = bf.q.bgpSessionCompatibility().answer(snapshot="candidate").frame()
print(compat[compat["Configured_Status"] != "UNIQUE_MATCH"][["Node", "Local_AS", "Remote_AS", "Remote_IP", "Configured_Status"]])
print(bf.q.bgpPeerConfiguration(nodes="e1").answer(snapshot="candidate").frame()[["Node", "Local_AS", "Remote_AS", "Remote_IP"]])</pre>
<pre class="out">AUTO01$ python3 bgpwhy.py
Successfully initialized snapshot 'candidate' from 'candidate'
Default snapshot is now set to candidate
   Node  Local_AS  Remote_AS  Remote_IP  Configured_Status
<span class="hl">0    e1     65003      65010  10.0.13.1          HALF_OPEN</span>
<span class="hl">3   xe1     65001      65003  10.0.13.3          HALF_OPEN</span>
   Node  Local_AS  Remote_AS  Remote_IP
0    e1     65003      65010  10.0.13.1</pre>
<p>Both rows are <code>HALF_OPEN</code>: each side has a neighbour statement, but the other side's configuration does not match it. Look at the AS columns. e1 (AS 65003) was told its neighbour 10.0.13.1 lives in AS <b>65010</b>, while xe1, the owner of that address, runs AS <b>65001</b>. The wrong <code>remote-as</code> on e1 breaks the pair, and the report shows it from both directions. One <code>sed</code> fixes the number. For other mismatches, the same view helps: a wrong neighbour address shows as <code>UNKNOWN_REMOTE</code>, a missing local address as <code>NO_LOCAL_IP</code>.</p>

<h3>Prove it</h3>
<pre class="out"><span class="hl">AUTO01$ python3 precheck.py; echo "exit code: $?"</span>
[1/3] intent shape     ok
Successfully initialized snapshot 'candidate' from 'candidate'
Default snapshot is now set to candidate
[2/3] config hygiene   ok
[3/3] bgp sessions     ok
<span class="hl">PRECHECK PASSED</span>
<span class="hl">exit code: 0</span></pre>

<div class="note"><p><b>In the lab vs on real gear.</b> Real Batfish prints different log lines and the exact wording of contexts can differ a little, but the questions, the column names and the shape of the process are the same. On real gear the first suspect for a <code>ConnectionError</code> is the container; in the lab you simulate it with <code>NK_BATFISH=off</code> in front of the command.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) "Fixing" the config to silence the check when the intent was wrong: if the request says AS 65010 by mistake, fix the request. (2) Fixing the symptom row only: a Junos name typo repeated in three groups needs three fixes. (3) Reading from the bottom of the output. Stages are in order, so read the first FAILED. (4) Re-running after each edit but never reading what changed.</p></div>
<div class="exam"><p><b>Exam trap.</b> HALF_OPEN does not mean the far end is down. It means the far end's configuration does not match this end's neighbour statement. Compare the AS numbers and the addresses on both sides before you blame the network.</p></div>

<div class="scn"><h4>Friday, 17:30, BLOCKED</h4><p>The nightly pipeline blocked a change for a new BGP neighbour. The on-call engineer saw "stage 3 FAILED: j2 to 10.0.20.1 is NOT_COMPATIBLE", opened the compatibility table and saw <code>UNKNOWN_REMOTE</code>: no router in the snapshot owned 10.0.20.1. The request had a typo, 10.0.20.10. No device was touched, the fix was one character, and the pipeline passed in five minutes.</p><p><b>Lesson:</b> the stage number and the first reason usually contain the answer.</p></div>

<div class="iv"><p class="q">"Your Batfish check fails with a connection error. What do you do?"</p><p>That is infrastructure, not config. I check that the service is up and reachable on its port (9996 for the v2 API), and that the script points at the right host. I only look at the configs after the service answers a trivial call like listing networks.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read the stage number first; it names the tool that complained.</li>
<li>ConnectionError on port 9996 means the Batfish service, not your config.</li>
<li>Undefined references: compare with the defined name; case, 0 versus O and dashes are the usual suspects.</li>
<li>HALF_OPEN: compare AS numbers and addresses on both ends.</li>
<li>Finish with all stages ok, PRECHECK PASSED and exit code 0.</li>
</ul></div>
`,hi:`
<p>Jo gate block karta hai woh apna kaam kar raha hai, aur Friday 17:30 par jise yeh message milta hai use method chahiye, kismat nahi. Yeh chapter Lab 2 chalata hai. Change CHG-3107 atka hua hai: <code>precheck.py</code> PRECHECK BLOCKED print karti hai, aur har baar ek problem theek hoti hai to doosri aa jaati hai. Teeno vendors ke configs <code>candidate/configs</code> mein hain, request <code>intent.yaml</code> hai, aur kuch deploy nahi hota.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Symptom se pehli cheez tak jo check karni hai"><rect x="20" y="14" width="200" height="36" rx="9" fill="#fed7aa"/><text x="120" y="36" text-anchor="middle" class="svg-ink" font-size="12">ConnectionError port 9996</text><rect x="300" y="14" width="320" height="36" rx="9" fill="#e2e8f0"/><text x="460" y="36" text-anchor="middle" class="svg-ink" font-size="12">Batfish service band hai</text><line x1="220" y1="32" x2="298" y2="32" stroke="#64748b" stroke-width="2"/><polygon points="298,32 289,37 289,27" fill="#64748b"/><rect x="20" y="60" width="200" height="36" rx="9" fill="#bae6fd"/><text x="120" y="82" text-anchor="middle" class="svg-ink" font-size="12">stage 1 FAILED</text><rect x="300" y="60" width="320" height="36" rx="9" fill="#e2e8f0"/><text x="460" y="82" text-anchor="middle" class="svg-ink" font-size="12">path + message: YAML theek karo</text><line x1="220" y1="78" x2="298" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="298,78 289,83 289,73" fill="#64748b"/><rect x="20" y="106" width="200" height="36" rx="9" fill="#ddd6fe"/><text x="120" y="128" text-anchor="middle" class="svg-ink" font-size="12">stage 2 FAILED</text><rect x="300" y="106" width="320" height="36" rx="9" fill="#e2e8f0"/><text x="460" y="128" text-anchor="middle" class="svg-ink" font-size="12">undefined X: defined se compare karo</text><line x1="220" y1="124" x2="298" y2="124" stroke="#64748b" stroke-width="2"/><polygon points="298,124 289,129 289,119" fill="#64748b"/><rect x="20" y="152" width="200" height="36" rx="9" fill="#ddd6fe"/><text x="120" y="174" text-anchor="middle" class="svg-ink" font-size="12">stage 3 FAILED</text><rect x="300" y="152" width="320" height="36" rx="9" fill="#e2e8f0"/><text x="460" y="174" text-anchor="middle" class="svg-ink" font-size="12">HALF_OPEN: AS ya IP alag</text><line x1="220" y1="170" x2="298" y2="170" stroke="#64748b" stroke-width="2"/><polygon points="298,170 289,175 289,165" fill="#64748b"/><rect x="20" y="198" width="200" height="36" rx="9" fill="#fde68a"/><text x="120" y="220" text-anchor="middle" class="svg-ink" font-size="12">stage 4 FAILED</text><rect x="300" y="198" width="320" height="36" rx="9" fill="#e2e8f0"/><text x="460" y="220" text-anchor="middle" class="svg-ink" font-size="12">anapekshit route change</text><line x1="220" y1="216" x2="298" y2="216" stroke="#64748b" stroke-width="2"/><polygon points="298,216 289,221 289,211" fill="#64748b"/></svg><p class="cap">Pehle stage number padho: wahi batata hai ki kaunse tool ne problem dekhi.</p></div>

<h3>Method: stage, tool, pehli check</h3>
<ol>
<li><b>Stage number padho.</b> Woh us tool ka naam batata hai jisne problem dekhi: 1 jsonschema, 2 Batfish hygiene, 3 Batfish sessions, 4 deepdiff.</li>
<li><b>Baaki se pehle reason ki pehli line padho.</b> Ek wajah aksar kai lines samjha deti hai.</li>
<li><b>Ek cheez theek karo, phir chalao.</b> Ek fix agle stage ki problem khol sakta hai, jaise yahan hota hai. Yeh progress hai, failure nahi.</li>
<li><b>Ant saabit karo:</b> saare stages ok, aakhri line PRECHECK PASSED, exit code 0.</li>
</ol>

<h3>Step 0: kya Batfish jawab de raha hai?</h3>
<p>Agar Python traceback <code>ConnectionError</code> par khatam ho to problem aapka config nahi hai. Woh chhoti script chalao jo sirf connect karti hai:</p>
<pre class="out">AUTO01$ python3 bfup.py
batfish is up, networks: ['nk-lab']</pre>
<p>Ab service band karo (lab ise environment variable se simulate karta hai) aur error padho:</p>
<pre class="out">AUTO01$ NK_BATFISH=off python3 bfup.py
Traceback (most recent call last):
  File "bfup.py", line 5, in &lt;module&gt;
    bf.set_network("nk-lab")
  File "/usr/lib/python3.11/pybatfish/client/session.py", line 47, in set_network
...
<span class="hl">requests.exceptions.ConnectionError: HTTPConnectionPool(host='localhost', port=9996): Max retries exceeded with url: /v2/networks/nk-lab (Caused by NewConnectionError('&lt;urllib3.connection.HTTPConnection object at 0x7f3a2c1b9d10&gt;: Failed to establish a new connection: [Errno 111] Connection refused'))</span></pre>
<p>Aakhri line padhne layak hai: <code>HTTPConnectionPool(host='localhost', port=9996)</code> aur <code>Connection refused</code>. pybatfish service ko port 9996 par dhoondhta hai, wahan koi nahi sunta, isliye container band hai, kisi aur host par hai ya firewall se block hai. Beech ki lines (yahan chhoti ki gayi) library ke internals hain. Real gear par: <code>docker ps</code>, phir container start karo. Lab mein docker nahi hai, isliye aap service on ke saath aage badhte ho.</p>

<h3>Stage 1: request galat bani hai</h3>
<pre class="out">AUTO01$ python3 precheck.py; echo "exit code: $?"
<span class="hl">[1/3] intent shape     FAILED</span>
      - sessions/0/b_asn: '65002' is not of type 'integer'
<span class="hl">PRECHECK BLOCKED</span>
exit code: 1</pre>
<p>Line path aur rule batati hai: <code>sessions/0/b_asn</code> string "65002" hai, aur schema integer maangta hai. <code>intent.yaml</code> se quotes <code>sed</code> se hatao aur dobara chalao. Batfish se kabhi baat hi nahi hui, isiliye yeh stage pehle aata hai.</p>

<h3>Stage 2: teen typos, teen vendors</h3>
<pre class="out">AUTO01$ python3 precheck.py; echo "exit code: $?"
[1/3] intent shape     ok
Successfully initialized snapshot 'candidate' from 'candidate'
Default snapshot is now set to candidate
[2/3] config hygiene   FAILED
<span class="hl">      - undefined ipv4 prefix-list PL-XE-1 (route-map match ipv4 prefix-list) configs/e1.cfg:[16]</span>
<span class="hl">      - undefined policy-statement EXPORT-L0 (bgp export policy-statement) configs/j1.cfg:[11]</span>
<span class="hl">      - undefined route-map rm-out (bgp outbound route-map) configs/xe1.cfg:[24]</span>
PRECHECK BLOCKED
exit code: 1</pre>
<p>Ek run teeno list karta hai kyunki hygiene ek hi Batfish question hai. Rows ek ek karke lo:</p>
<table class="cmp"><tr><th>File</th><th>Batfish kehta hai</th><th>Defined naam</th><th>Typo</th></tr>
<tr><td>xe1.cfg line 24</td><td>undefined <code>route-map</code> rm-out</td><td>RM-OUT</td><td>case: IOS ke naam case sensitive hain</td></tr>
<tr><td>j1.cfg line 11</td><td>undefined <code>policy-statement</code> EXPORT-L0</td><td>EXPORT-LO</td><td>letter O ki jagah digit zero</td></tr>
<tr><td>e1.cfg line 16</td><td>undefined <code>ipv4 prefix-list</code> PL-XE-1</td><td>PL-XE1</td><td>route-map ke andar extra dash</td></tr></table>
<p>Defined naam jaldi kaise milega? File mein object ki kism search karo: <code>grep -n "route-map" candidate/configs/xe1.cfg</code> definition (line 18) aur reference (line 24) dono dikhata hai. Context column batata hai kahan dekhna hai: "bgp outbound route-map" matlab neighbour line, "route-map match ipv4 prefix-list" matlab route-map ke andar match line, "bgp export policy-statement" matlab Junos group ki export line. Teen <code>sed</code> commands ke baad stage 2 ok hai.</p>

<h3>Stage 3: dono ends NOT_COMPATIBLE</h3>
<pre class="out">AUTO01$ python3 precheck.py; echo "exit code: $?"
[1/3] intent shape     ok
Successfully initialized snapshot 'candidate' from 'candidate'
Default snapshot is now set to candidate
[2/3] config hygiene   ok
<span class="hl">[3/3] bgp sessions     FAILED</span>
<span class="hl">      - xe1 to 10.0.13.3 is NOT_COMPATIBLE</span>
<span class="hl">      - e1 to 10.0.13.1 is NOT_COMPATIBLE</span>
PRECHECK BLOCKED
exit code: 1</pre>
<p>Configs saaf hain, phir bhi xe1 aur e1 ke beech ke sessions dono ends par compatible nahi hain. Generic wajah <code>bgpwhy.py</code> mein hain, jo compatibility question poochhti hai aur healthy rows hata deti hai:</p>
<pre class="code">bf = Session(host="localhost")
bf.set_network("nk-lab")
bf.init_snapshot("candidate", name="candidate", overwrite=True)
compat = bf.q.bgpSessionCompatibility().answer(snapshot="candidate").frame()
print(compat[compat["Configured_Status"] != "UNIQUE_MATCH"][["Node", "Local_AS", "Remote_AS", "Remote_IP", "Configured_Status"]])
print(bf.q.bgpPeerConfiguration(nodes="e1").answer(snapshot="candidate").frame()[["Node", "Local_AS", "Remote_AS", "Remote_IP"]])</pre>
<pre class="out">AUTO01$ python3 bgpwhy.py
Successfully initialized snapshot 'candidate' from 'candidate'
Default snapshot is now set to candidate
   Node  Local_AS  Remote_AS  Remote_IP  Configured_Status
<span class="hl">0    e1     65003      65010  10.0.13.1          HALF_OPEN</span>
<span class="hl">3   xe1     65001      65003  10.0.13.3          HALF_OPEN</span>
   Node  Local_AS  Remote_AS  Remote_IP
0    e1     65003      65010  10.0.13.1</pre>
<p>Dono rows <code>HALF_OPEN</code> hain: har side ke paas neighbour statement hai, par doosri side ka configuration usse match nahi karta. AS columns dekho. e1 (AS 65003) ko bataya gaya hai ki uska neighbour 10.0.13.1 AS <b>65010</b> mein hai, jabki xe1, jo us address ka maalik hai, AS <b>65001</b> chalata hai. e1 ka galat <code>remote-as</code> jodi tod deta hai, aur report use dono directions se dikhati hai. Ek <code>sed</code> number theek kar deta hai. Doosre mismatches ke liye bhi yahi view madad karta hai: galat neighbour address <code>UNKNOWN_REMOTE</code> dikhta hai, local address missing ho to <code>NO_LOCAL_IP</code>.</p>

<h3>Saabit karo</h3>
<pre class="out"><span class="hl">AUTO01$ python3 precheck.py; echo "exit code: $?"</span>
[1/3] intent shape     ok
Successfully initialized snapshot 'candidate' from 'candidate'
Default snapshot is now set to candidate
[2/3] config hygiene   ok
[3/3] bgp sessions     ok
<span class="hl">PRECHECK PASSED</span>
<span class="hl">exit code: 0</span></pre>

<div class="note"><p><b>Lab mein vs real gear par.</b> Real Batfish alag log lines print karta hai aur contexts ki exact wording thodi alag ho sakti hai, par questions, column ke naam aur process ki shape wahi hain. Real gear par <code>ConnectionError</code> ka pehla shak container par hota hai; lab mein aap command ke aage <code>NK_BATFISH=off</code> lagakar ise simulate karte ho.</p></div>

<div class="warn"><p><b>Aam galtiyan.</b> (1) Check ko chup karane ke liye config "theek" karna jabki intent galat tha: agar request mein galti se AS 65010 hai, to request theek karo. (2) Sirf symptom wali row theek karna: Junos naam ka typo teen groups mein dohrata ho to teen fix chahiye. (3) Output neeche se padhna. Stages kram mein hain, isliye pehla FAILED padho. (4) Har edit ke baad dobara chalana par kabhi padhna nahi ki kya badla.</p></div>
<div class="exam"><p><b>Exam trap.</b> HALF_OPEN ka matlab yeh nahi ki door wala end down hai. Matlab hai door wale end ka configuration is end ke neighbour statement se match nahi karta. Network ko dosh dene se pehle dono taraf ke AS numbers aur addresses compare karo.</p></div>

<div class="scn"><h4>Friday, 17:30, BLOCKED</h4><p>Nightly pipeline ne naye BGP neighbour ka change block kar diya. On-call engineer ne "stage 3 FAILED: j2 to 10.0.20.1 is NOT_COMPATIBLE" dekha, compatibility table kholi aur <code>UNKNOWN_REMOTE</code> mila: snapshot ke kisi router ke paas 10.0.20.1 tha hi nahi. Request mein typo tha, 10.0.20.10. Koi device nahi chhua gaya, fix ek character tha, aur pipeline paanch minute mein pass ho gayi.</p><p><b>Lesson:</b> stage number aur pehli reason mein aksar jawab hota hai.</p></div>

<div class="iv"><p class="q">"Aapka Batfish check connection error ke saath fail hota hai. Kya karte ho?"</p><p>Yeh infrastructure hai, config nahi. Main dekhta hoon ki service up hai aur apne port par reachable hai (v2 API ke liye 9996), aur script sahi host ko point karti hai. Configs tabhi dekhta hoon jab service networks list karne jaise saral call ka jawab de.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle stage number padho; woh batata hai kis tool ne shikayat ki.</li>
<li>Port 9996 par ConnectionError ka matlab Batfish service hai, aapka config nahi.</li>
<li>Undefined references: defined naam se compare karo; case, 0 aur O, aur dashes aam shak hain.</li>
<li>HALF_OPEN: dono ends ke AS numbers aur addresses compare karo.</li>
<li>Ant mein saare stages ok, PRECHECK PASSED aur exit code 0.</li>
</ul></div>
`}};export{e as default};