var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: commit, login and inheritance problems`,hi:`Troubleshooting workflow: commit, login aur inheritance problems`},body:{en:`
<p>A good mechanic listens to the symptom, checks the simple things first, and changes one part at a time. Initial-setup problems fall into a few families: <b>the box will not commit</b>, <b>a user cannot log in or cannot do something</b>, <b>an interface is not reachable</b>, and <b>a group does not behave as expected</b>. This chapter gives a workflow for each, using the real lab tickets.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Troubleshooting decision tree">
<rect x="230" y="10" width="180" height="36" rx="8" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Symptom</text>
<rect x="10" y="90" width="140" height="44" rx="8" fill="#bae6fd"/><text x="80" y="108" text-anchor="middle" class="svg-ink" font-size="12">Commit fails</text><text x="80" y="124" text-anchor="middle" class="svg-muted" font-size="11">read error path</text>
<rect x="170" y="90" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="240" y="108" text-anchor="middle" class="svg-ink" font-size="12">Login / command</text><text x="240" y="124" text-anchor="middle" class="svg-muted" font-size="11">class, service</text>
<rect x="330" y="90" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="400" y="108" text-anchor="middle" class="svg-ink" font-size="12">Not reachable</text><text x="400" y="124" text-anchor="middle" class="svg-muted" font-size="11">terse, ping</text>
<rect x="490" y="90" width="140" height="44" rx="8" fill="#fed7aa"/><text x="560" y="108" text-anchor="middle" class="svg-ink" font-size="12">Wrong value</text><text x="560" y="124" text-anchor="middle" class="svg-muted" font-size="11">display inheritance</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="320" y1="46" x2="80" y2="90"/><line x1="320" y1="46" x2="240" y2="90"/><line x1="320" y1="46" x2="400" y2="90"/><line x1="320" y1="46" x2="560" y2="90"/></g>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">One hypothesis, one change, one verification</text>
</svg><p class="cap">Pick the branch that matches the symptom, then follow its checks.</p></div>

<h3>Ticket 1: the router will not commit (Pune edge)</h3>
<p><b>Symptom:</b> R1 came back from repair; the engineer typed host name and addresses but <code>commit</code> fails.</p>
<pre class="code">root# commit
[edit]
  'system'
    Missing mandatory statement: 'root-authentication'
error: commit failed: (missing mandatory statements)</pre>
<p><b>Cause:</b> zeroized device, no root password. <b>Fix:</b> <code>set system root-authentication plain-text-password</code>, type the password twice, commit. <b>Verify:</b> the hostname prompt changes, <code>show system alarms</code> no longer lists the Major root-password alarm, and PC1 pings 172.16.10.1.</p>
<p><b>General method for commit errors:</b> read the bracketed path and the message; run <code>commit check</code> after each fix; use <code>show | compare</code> to see unexpected leftovers; if the error is about a statement you did not touch, look at groups and <code>load</code> operations that brought it in.</p>

<h3>Ticket 2: the NOC cannot configure, and the intern cannot traceroute (Hyderabad core)</h3>
<p><b>Symptom:</b> after the accounts were created, "noc" says <code>configure</code> does not work and "intern" says traceroute is "unknown".</p>
<pre class="code">noc@NK-HYD-CORE&gt; configure
unknown command.
intern@NK-HYD-CORE&gt; traceroute 10.40.0.2
unknown command.</pre>
<p>Both are <b>correct behaviour</b>, not faults: operator has no <code>configure</code> permission and HELPDESK denies <code>^traceroute</code>. The job is to prove it, not to fix it. Verify with <code>show configuration system login</code> to read each user's class and each class's flags.</p>
<p><b>But what if a user should be able to do something and cannot?</b></p>
<ol>
<li>Check the class assigned: <code>show configuration system login user NAME</code>.</li>
<li>Check the flags of that class and any <code>deny-commands</code> (deny wins).</li>
<li>Check that the command regex is anchored and spelled right.</li>
<li>Remember that changes to a class apply at the user's <b>next</b> login.</li>
</ol>
<p><b>If the user cannot log in at all:</b> is SSH enabled (<code>show system connections | match 22</code>)? Is the address reachable (<code>ping 10.40.0.1</code> from the jump router)? Is the password hash present (<code>show configuration system login user noc</code> shows <code>encrypted-password</code>)? With RADIUS: is the server reachable, is the secret identical, and is a local password listed in <code>authentication-order</code> as a fallback?</p>
<pre class="code">lab@NK-HYD-JUMP&gt; ssh noc@10.40.0.1
ssh: connect to host 10.40.0.1 port 22: Connection refused</pre>
<p>"Connection refused" with a working ping means the service is not enabled: <code>set system services ssh</code>. "Permission denied" means the service answered but the credentials failed.</p>

<h3>Ticket 3: interface not working</h3>
<pre class="code">lab@R1&gt; show interfaces terse ge-0/0/1
Interface               Admin Link Proto    Local                 Remote
ge-0/0/1                up    down
ge-0/0/1.0              up    down inet     10.50.1.1/24</pre>
<p>Admin up, Link down: a cable or far-end problem, not configuration. Admin down means <code>disable</code> was configured (<code>show configuration interfaces ge-0/0/1</code>). Admin up/Link up with no ping: check the address and subnet on both ends, ARP (<code>show arp</code>) and the MTU on both sides.</p>

<h3>Ticket 4: wrong MTU on the file-server port (Bengaluru)</h3>
<p><b>Symptom:</b> after applying the global group, large transfers to the file server fail; ping with a small packet works.</p>
<pre class="code">lab@NK-BLR-DIST&gt; show interfaces ge-0/0/2 | match MTU
  Link-level type: Ethernet, MTU: 9000, Speed: 1000mbps
lab@NK-BLR-DIST&gt; ping 10.50.2.20 size 8000 do-not-fragment count 2
2 packets transmitted, 0 packets received, 100% packet loss</pre>
<p><b>Cause:</b> the group gave the port MTU 9000 and no local statement overrode it. <b>Fix:</b> <code>set interfaces ge-0/0/2 mtu 1500</code> (local beats group), commit, and verify <code>MTU: 1500</code>. Confirm with <code>show interfaces | display inheritance</code>: ge-0/0/2 no longer shows an inherited mtu. The number of ports that inherit 9000 is now 2.</p>
<p><b>When a group "does nothing":</b> (1) is <code>apply-groups</code> present at the right level? (2) does the wildcard match an <i>existing</i> object? (3) does a local statement override it? (4) is a higher-priority group listed first? <code>show | display inheritance</code> answers all four.</p>

<h3>A universal workflow</h3>
<ol>
<li><b>Reproduce</b> and write down the exact error or symptom.</li>
<li><b>Check the layers</b>: interface state, address, reachability, service, account, class.</li>
<li><b>Ask what changed</b>: <code>show system commit</code> and <code>show | compare rollback 1</code>.</li>
<li><b>Fix one thing</b>; use <code>commit confirmed</code> when it may cut access.</li>
<li><b>Verify</b> with the command that exposed the symptom and with a real test.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Treating a correct denial (operator cannot configure) as a fault; changing several things at once; forgetting that login class changes need a new login; testing with <code>ping</code> from the wrong source.</p></div>
<div class="exam"><p><b>Exam trap.</b> Missing root password gives "missing mandatory statement". Connection refused means the service is not on; permission denied means bad credentials. Local statement beats group.</p></div>

<div class="scn"><h4>"It works on every router but one"</h4><p>A change that applied a banner and SSH to 40 routers worked everywhere except Branch 17. The engineer ran <code>show | display inheritance</code> on Branch 17 and found no inherited lines: someone had removed <code>apply-groups GLOBAL</code> while fixing another problem. He re-applied it, committed with a comment, and added a monthly script that checks <code>show configuration | match apply-groups</code> on every device.</p><p><b>Lesson:</b> compare against the intended standard with display inheritance and automate the check.</p></div>

<div class="iv"><p class="q">"A user can SSH to the router but cannot run configure. How do you handle it?"</p><p>First I check whether it is intended: <code>show configuration system login user NAME</code> and the class permissions. If the class lacks <code>configure</code>, that is expected; I would change the class or the user's class and ask the user to log in again. If the class has it but it still fails, I look for a deny-commands regex, a template mapping from RADIUS or a different account than expected.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read commit errors: the bracket path and the message name the problem.</li>
<li>Connection refused = service off; permission denied = credentials or class issue.</li>
<li>Admin up/Link down is physical; admin down is configured <code>disable</code>.</li>
<li>If a group does nothing, check apply-groups, wildcard match, local override and order.</li>
<li>Work one hypothesis at a time and verify with a real test.</li>
</ul></div>
`,hi:`
<p>Achha mechanic symptom sunta hai, pehle simple cheezein check karta hai, aur ek baar mein ek hi part badalta hai. Initial-setup problems kuch families mein aati hain: <b>box commit nahi hota</b>, <b>user login ya koi kaam nahi kar paata</b>, <b>interface reachable nahi</b>, aur <b>group expected jaisa behave nahi karta</b>. Yeh chapter har ek ke liye real lab tickets ke saath workflow deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Troubleshooting decision tree">
<rect x="230" y="10" width="180" height="36" rx="8" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Symptom</text>
<rect x="10" y="90" width="140" height="44" rx="8" fill="#bae6fd"/><text x="80" y="108" text-anchor="middle" class="svg-ink" font-size="12">Commit fail</text><text x="80" y="124" text-anchor="middle" class="svg-muted" font-size="11">error path padho</text>
<rect x="170" y="90" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="240" y="108" text-anchor="middle" class="svg-ink" font-size="12">Login / command</text><text x="240" y="124" text-anchor="middle" class="svg-muted" font-size="11">class, service</text>
<rect x="330" y="90" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="400" y="108" text-anchor="middle" class="svg-ink" font-size="12">Reachable nahi</text><text x="400" y="124" text-anchor="middle" class="svg-muted" font-size="11">terse, ping</text>
<rect x="490" y="90" width="140" height="44" rx="8" fill="#fed7aa"/><text x="560" y="108" text-anchor="middle" class="svg-ink" font-size="12">Galat value</text><text x="560" y="124" text-anchor="middle" class="svg-muted" font-size="11">display inheritance</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="320" y1="46" x2="80" y2="90"/><line x1="320" y1="46" x2="240" y2="90"/><line x1="320" y1="46" x2="400" y2="90"/><line x1="320" y1="46" x2="560" y2="90"/></g>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Ek hypothesis, ek change, ek verification</text>
</svg><p class="cap">Symptom se match karti branch chuno, phir uske checks follow karo.</p></div>

<h3>Ticket 1: router commit nahi hota (Pune edge)</h3>
<p><b>Symptom:</b> R1 repair se wapas aaya; engineer ne host name aur addresses type kiye lekin <code>commit</code> fail hota hai.</p>
<pre class="code">root# commit
[edit]
  'system'
    Missing mandatory statement: 'root-authentication'
error: commit failed: (missing mandatory statements)</pre>
<p><b>Cause:</b> zeroized device, root password nahi. <b>Fix:</b> <code>set system root-authentication plain-text-password</code>, password do baar type karo, commit. <b>Verify:</b> hostname prompt badal jaata hai, <code>show system alarms</code> mein Major root-password alarm nahi rehta, aur PC1 172.16.10.1 ko ping karta hai.</p>
<p><b>Commit errors ka general method:</b> bracket path aur message padho; har fix ke baad <code>commit check</code> chalao; anjaane bache hue statements dekhne ke liye <code>show | compare</code> use karo; error us statement ke baare mein ho jise aapne chhua nahi to groups aur <code>load</code> operations dekho jo use laaye.</p>

<h3>Ticket 2: NOC configure nahi kar sakta aur intern traceroute nahi kar sakta (Hyderabad core)</h3>
<p><b>Symptom:</b> accounts banne ke baad "noc" kehta hai <code>configure</code> nahi chalta aur "intern" kehta hai traceroute "unknown" hai.</p>
<pre class="code">noc@NK-HYD-CORE&gt; configure
unknown command.
intern@NK-HYD-CORE&gt; traceroute 10.40.0.2
unknown command.</pre>
<p>Dono <b>sahi behaviour</b> hain, fault nahi: operator ke paas <code>configure</code> permission nahi hai aur HELPDESK <code>^traceroute</code> deny karti hai. Kaam use saabit karna hai, theek karna nahi. Har user ki class aur har class ke flags padhne ke liye <code>show configuration system login</code> se verify karo.</p>
<p><b>Lekin agar user ko kuch karna chahiye aur woh nahi kar paata?</b></p>
<ol>
<li>Assigned class check karo: <code>show configuration system login user NAME</code>.</li>
<li>Us class ke flags aur koi <code>deny-commands</code> check karo (deny jeetta hai).</li>
<li>Check karo ki command regex anchored aur sahi spelled hai.</li>
<li>Yaad rakho class mein changes user ke <b>agle</b> login par lagte hain.</li>
</ol>
<p><b>Agar user login hi nahi kar paata:</b> kya SSH enabled hai (<code>show system connections | match 22</code>)? Kya address reachable hai (jump router se <code>ping 10.40.0.1</code>)? Kya password hash maujood hai (<code>show configuration system login user noc</code> mein <code>encrypted-password</code> dikhta hai)? RADIUS ke saath: kya server reachable hai, kya secret identical hai, aur kya <code>authentication-order</code> mein local password fallback ke roop mein listed hai?</p>
<pre class="code">lab@NK-HYD-JUMP&gt; ssh noc@10.40.0.1
ssh: connect to host 10.40.0.1 port 22: Connection refused</pre>
<p>Ping chalte hue "Connection refused" ka matlab service enabled nahi hai: <code>set system services ssh</code>. "Permission denied" ka matlab service ne jawab diya lekin credentials fail hue.</p>

<h3>Ticket 3: interface kaam nahi kar raha</h3>
<pre class="code">lab@R1&gt; show interfaces terse ge-0/0/1
Interface               Admin Link Proto    Local                 Remote
ge-0/0/1                up    down
ge-0/0/1.0              up    down inet     10.50.1.1/24</pre>
<p>Admin up, Link down: cable ya far-end problem, configuration nahi. Admin down ka matlab <code>disable</code> configured hai (<code>show configuration interfaces ge-0/0/1</code>). Admin up/Link up lekin ping nahi: dono ends par address aur subnet, ARP (<code>show arp</code>) aur dono taraf ka MTU check karo.</p>

<h3>Ticket 4: file-server port par galat MTU (Bengaluru)</h3>
<p><b>Symptom:</b> global group apply karne ke baad file server ke bade transfers fail hote hain; chhote packet ka ping chalta hai.</p>
<pre class="code">lab@NK-BLR-DIST&gt; show interfaces ge-0/0/2 | match MTU
  Link-level type: Ethernet, MTU: 9000, Speed: 1000mbps
lab@NK-BLR-DIST&gt; ping 10.50.2.20 size 8000 do-not-fragment count 2
2 packets transmitted, 0 packets received, 100% packet loss</pre>
<p><b>Cause:</b> group ne port ko MTU 9000 diya aur koi local statement override nahi karta tha. <b>Fix:</b> <code>set interfaces ge-0/0/2 mtu 1500</code> (local group se jeetta hai), commit, aur <code>MTU: 1500</code> verify karo. <code>show interfaces | display inheritance</code> se confirm karo: ge-0/0/2 ab inherited mtu nahi dikhata. 9000 inherit karne wale ports ki ginti ab 2 hai.</p>
<p><b>Jab group "kuch nahi karta":</b> (1) kya sahi level par <code>apply-groups</code> hai? (2) kya wildcard <i>maujooda</i> object ko match karta hai? (3) kya koi local statement override karta hai? (4) kya zyada priority wala group pehle listed hai? <code>show | display inheritance</code> chaaron ka jawab deta hai.</p>

<h3>Universal workflow</h3>
<ol>
<li>Exact error ya symptom <b>reproduce</b> karke likh lo.</li>
<li><b>Layers check</b> karo: interface state, address, reachability, service, account, class.</li>
<li><b>Poocho kya badla</b>: <code>show system commit</code> aur <code>show | compare rollback 1</code>.</li>
<li><b>Ek cheez theek karo</b>; access kat sakta ho to <code>commit confirmed</code> use karo.</li>
<li>Jis command ne symptom dikhaya aur real test se <b>verify</b> karo.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Sahi denial (operator configure nahi kar sakta) ko fault maan lena; ek saath kai cheezein badalna; yeh bhool jaana ki login class changes ke liye naya login chahiye; galat source se <code>ping</code> test karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Missing root password "missing mandatory statement" deta hai. Connection refused matlab service off; permission denied matlab bad credentials. Local statement group se jeetta hai.</p></div>

<div class="scn"><h4>"Har router par chalta hai sirf ek par nahi"</h4><p>40 routers par banner aur SSH lagane wala change Branch 17 ko chhodkar har jagah chala. Engineer ne Branch 17 par <code>show | display inheritance</code> chalaya aur koi inherited lines nahi mili: kisi ne doosri problem theek karte waqt <code>apply-groups GLOBAL</code> hata diya tha. Usne use wapas lagaya, comment ke saath commit kiya, aur har device par <code>show configuration | match apply-groups</code> check karne wali monthly script jodi.</p><p><b>Lesson:</b> display inheritance se intended standard ke saath compare karo aur check ko automate karo.</p></div>

<div class="iv"><p class="q">"User router par SSH kar sakta hai lekin configure nahi chala sakta. Kaise handle karoge?"</p><p>Pehle check karta hoon ki yeh intended hai ya nahi: <code>show configuration system login user NAME</code> aur class permissions. Class mein <code>configure</code> nahi hai to expected hai; main class ya user ki class badalta aur user se dobara login karwata. Class mein hai phir bhi fail ho to deny-commands regex, RADIUS se template mapping ya expected se alag account dhoondhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Commit errors padho: bracket path aur message problem batate hain.</li>
<li>Connection refused = service off; permission denied = credentials ya class issue.</li>
<li>Admin up/Link down physical hai; admin down configured <code>disable</code> hai.</li>
<li>Group kuch nahi karta to apply-groups, wildcard match, local override aur order check karo.</li>
<li>Ek baar mein ek hypothesis par kaam karo aur real test se verify karo.</li>
</ul></div>
`}};export{e as default};