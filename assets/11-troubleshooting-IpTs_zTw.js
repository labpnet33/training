var e={id:`troubleshooting`,h:{en:`Verification and the troubleshooting workflow`,hi:`Verification aur troubleshooting workflow`},body:{en:`
<p>A good doctor does not order every test at once. She checks pulse and breathing first, then narrows down, and each answer decides the next question. EIGRP troubleshooting works the same way. Almost every ticket falls into one of four layers: the interface, the EIGRP process on the interface, the neighbour, or the routes. Check them in order and the fault usually reveals itself within a few commands.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="EIGRP troubleshooting ladder">
<rect x="150" y="12" width="340" height="44" rx="8" fill="#bae6fd"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">1. Interface up, correct IP?</text><text x="320" y="48" text-anchor="middle" class="svg-muted" font-size="12">show ip interface brief</text>
<rect x="150" y="80" width="340" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">2. EIGRP enabled, not passive?</text><text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="12">show ip eigrp interfaces, show ip protocols</text>
<rect x="150" y="148" width="340" height="44" rx="8" fill="#fde68a"/><text x="320" y="168" text-anchor="middle" class="svg-ink" font-size="13">3. Neighbour up and stable?</text><text x="320" y="184" text-anchor="middle" class="svg-muted" font-size="12">show ip eigrp neighbors, logs</text>
<rect x="150" y="216" width="340" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="236" text-anchor="middle" class="svg-ink" font-size="13">4. Route in topology and RIB?</text><text x="320" y="252" text-anchor="middle" class="svg-muted" font-size="12">show ip eigrp topology, show ip route</text>
<line x1="320" y1="56" x2="320" y2="80" stroke="#64748b" stroke-width="2"/><line x1="320" y1="124" x2="320" y2="148" stroke="#64748b" stroke-width="2"/><line x1="320" y1="192" x2="320" y2="216" stroke="#64748b" stroke-width="2"/>
<text x="320" y="288" text-anchor="middle" class="svg-accent" font-size="12">then prove it end to end: ping and traceroute</text>
</svg><p class="cap">Work from the bottom layer up. Each step rules out a whole class of faults.</p></div>

<h3>The command toolkit</h3>
<table class="cmp"><tr><th>Command</th><th>What it proves</th></tr>
<tr><td><code>show ip eigrp interfaces [detail]</code></td><td>Which interfaces run EIGRP and how many peers each has; passive interfaces are missing</td></tr>
<tr><td><code>show ip protocols</code></td><td>AS, K values (Metric weight line), router ID, network statements, passive interfaces, variance, maximum paths</td></tr>
<tr><td><code>show ip eigrp neighbors [detail]</code></td><td>Neighbour list, uptime, Q Cnt, stub status</td></tr>
<tr><td><code>show ip eigrp topology [prefix | all-links | active]</code></td><td>FD, successors, feasible successors, RDs, routes still Active</td></tr>
<tr><td><code>show ip route eigrp</code> and <code>show ip route prefix</code></td><td>What was actually installed, metric, traffic share counts</td></tr>
<tr><td><code>show logging</code></td><td><code>%DUAL-5-NBRCHANGE</code> messages with the reason</td></tr>
</table>

<h3>Walking lab 1: prove the design works</h3>
<ol>
<li><code>show ip eigrp neighbors</code> on R1 lists two peers: 10.0.12.2 on Gi0/0 and 10.0.13.3 on Gi0/1. On R3, peers 10.0.23.2 and 10.0.13.1.</li>
<li><code>show ip eigrp interfaces</code> shows Gi0/0, Gi0/1 and Lo0 but not Gi0/2, confirming the LANs are passive.</li>
<li><code>show ip eigrp topology</code> on R1: <code>P 192.168.30.0/24, 1 successors, FD is 3328</code>, successor 10.0.12.2, and feasible successor <b>10.0.13.3 (256512/2816)</b>.</li>
<li>From PC1, <code>ping 192.168.30.10</code> succeeds.</li>
</ol>

<h3>Walking lab 2: prove the load sharing</h3>
<ol>
<li><code>show ip eigrp topology 172.16.4.0/24</code>: successor 10.1.12.2 (3328/3072), FS <b>10.1.13.3</b> (8192/3072).</li>
<li>After <code>variance 3</code>, <code>show ip protocols</code> shows <code>Maximum metric variance 3</code>.</li>
<li><code>show ip route 172.16.4.0</code> shows two descriptor blocks with traffic share counts <b>2</b> (via R2) and <b>1</b> (via R3).</li>
<li><code>show ip route eigrp</code> shows two next hops for 4.4.4.4/32 as well; PC1 pings 172.16.4.10.</li>
</ol>

<h3>Walking lab 3: the K-value mismatch ticket</h3>
<p><b>Ticket:</b> after a "metric tuning" change window, the Kolkata branch (R1) lost every route to the Chennai campus (R3). The console keeps printing DUAL messages.</p>
<p><b>Layer 3, the neighbour.</b> The logs tell you immediately where to look:</p>
<pre class="out">R1#
<span class="hl">%DUAL-5-NBRCHANGE: EIGRP-IPv4 200: Neighbor 10.9.12.2 (GigabitEthernet0/0) is down: K-value mismatch</span>
R3#
<span class="hl">%DUAL-5-NBRCHANGE: EIGRP-IPv4 200: Neighbor 10.9.23.2 (GigabitEthernet0/0) is down: K-value mismatch</span></pre>
<p>Both R1 and R3 complain about the same neighbour, R2, which suggests R2 is the odd one out. Prove it by comparing the Metric weight line on each router:</p>
<pre class="out">R1# show ip protocols | include weight
    Metric weight K1=1, K2=0, K3=1, K4=0, K5=0
R2# show ip protocols | include weight
    <span class="hl">Metric weight K1=1, K2=1, K3=1, K4=0, K5=0</span>
R3# show ip protocols | include weight
    Metric weight K1=1, K2=0, K3=1, K4=0, K5=0</pre>
<p>R2 has <code>metric weights 0 1 1 1 0 0</code>, which turned on K2 (load). Restore the defaults:</p>
<pre class="code">R2(config)# router eigrp 200
R2(config-router)# no metric weights        <span class="c">! or: metric weights 0 1 0 1 0 0</span></pre>
<p>Within one hello interval, R2 forms adjacencies with R1 and R3 again.</p>
<p><b>Layer 4, the routes.</b> R1 now learns 10.9.23.0/24 and R3's loopback, but still has no route to 192.168.3.0/24. Check what R3 is configured to advertise:</p>
<pre class="out">R3# show ip protocols
  <span class="hl">Routing for Networks:
    3.3.3.3/32
    10.9.23.0/24</span>
  <span class="hl">Passive Interface(s):
    GigabitEthernet0/1</span></pre>
<p>Gi0/1 (192.168.3.1) is marked passive, but no network statement covers it, so it is not in EIGRP at all. Passive does not advertise; the network statement does.</p>
<pre class="code">R3(config)# router eigrp 200
R3(config-router)# network 192.168.3.0 0.0.0.255</pre>
<pre class="out">R1# show ip route eigrp | include 192.168.3
<span class="hl">D     192.168.3.0/24 [90/3328] via 10.9.12.2, 00:00:12, GigabitEthernet0/0</span></pre>
<p>Finally, PC1 pings 192.168.3.10 successfully. Two faults, found in order, each with one command.</p>

<div class="eg"><p><b>Worked example: symptom to cause.</b> Use the symptom to jump to the likely cause:</p>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>No neighbour, no log</td><td>AS mismatch, passive interface, ACL blocking protocol 88</td><td><code>show ip protocols</code>, <code>show ip eigrp interfaces</code></td></tr>
<tr><td>"K-value mismatch"</td><td>metric weights changed on one side</td><td><code>show ip protocols | include weight</code></td></tr>
<tr><td>"not on common subnet"</td><td>wrong IP or mask</td><td><code>show ip interface brief</code></td></tr>
<tr><td>"holding time expired", flapping</td><td>hello longer than the peer's hold, packet loss</td><td>interface timers, errors</td></tr>
<tr><td>"retry limit exceeded", Q Cnt stuck</td><td>MTU, unicast filtered, one-way link</td><td><code>show ip eigrp neighbors</code></td></tr>
<tr><td>Neighbour fine, route missing</td><td>no network statement, filtering, stub receive-only</td><td><code>show ip protocols</code>, topology</td></tr>
<tr><td>Route present but not used</td><td>a better AD source, such as a static route</td><td><code>show ip route prefix</code></td></tr>
</table></div>

<div class="warn"><p><b>Common mistake.</b> Restarting the EIGRP process or reloading the router as the first step. It clears the evidence (logs, Q Cnt, active routes) and the fault returns anyway. Read the logs and the three tables first.</p></div>

<div class="exam"><p><b>Exam trap.</b> A K-value mismatch is logged on <b>both</b> routers, so the router that logs it is not necessarily the one with the wrong values. Compare the Metric weight line on every router. Also remember that an AS mismatch produces no log at all.</p></div>

<div class="scn"><h4>The load that moved every hour</h4><p>A branch saw traffic swing between its two WAN links every few minutes, with routes changing in the logs. The engineer compared <code>show ip protocols</code> across the domain and found someone had set <code>metric weights 0 1 1 1 0 0</code> on all routers "to include load", so no K mismatch appeared. As links got busy, the load value changed the metric and paths flapped. Restoring the default K values everywhere in a maintenance window stabilised routing.</p><p><b>Lesson:</b> even when K values match, non-default K values make the metric unstable. Leave them at the defaults.</p></div>

<div class="iv"><p class="q">"An EIGRP neighbour will not come up. Walk me through your troubleshooting."</p><p>Strong answer: check layer by layer. Interface up with the right IP and mask; EIGRP enabled on it and not passive (<code>show ip eigrp interfaces</code>, <code>show ip protocols</code>); same AS and K values; common primary subnet; matching authentication and key ID; nothing blocking IP protocol 88 or 224.0.0.10. Use the log reason: K-value mismatch, not on common subnet, retry limit exceeded. Mention that an AS mismatch is silent, which is why you compare configurations directly.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work in layers: interface, EIGRP on the interface, neighbour, topology and routing table, then ping.</li>
<li>The <code>%DUAL-5-NBRCHANGE</code> reason text points straight at the fault.</li>
<li>K-value mismatches are logged on both sides; compare the Metric weight line to find the odd router.</li>
<li>Passive interfaces are advertised only if a network statement covers them.</li>
<li>Collect evidence before clearing processes; the three tables tell the story.</li>
</ul></div>
`,hi:`
<p>Achhi doctor ek saath har test order nahi karti. Woh pehle pulse aur saans check karti hai, phir dhyan kendrit karti hai, aur har jawab agla sawaal decide karta hai. EIGRP troubleshooting bhi aise hi kaam karti hai. Lagbhag har ticket chaar layers mein se kisi ek mein aata hai: interface, interface par EIGRP process, neighbour, ya routes. Inhe order mein check karo aur fault aam taur par kuch commands mein saamne aa jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="EIGRP troubleshooting ladder">
<rect x="150" y="12" width="340" height="44" rx="8" fill="#bae6fd"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">1. Interface up, sahi IP?</text><text x="320" y="48" text-anchor="middle" class="svg-muted" font-size="12">show ip interface brief</text>
<rect x="150" y="80" width="340" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">2. EIGRP enabled, passive nahi?</text><text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="12">show ip eigrp interfaces, show ip protocols</text>
<rect x="150" y="148" width="340" height="44" rx="8" fill="#fde68a"/><text x="320" y="168" text-anchor="middle" class="svg-ink" font-size="13">3. Neighbour up aur stable?</text><text x="320" y="184" text-anchor="middle" class="svg-muted" font-size="12">show ip eigrp neighbors, logs</text>
<rect x="150" y="216" width="340" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="236" text-anchor="middle" class="svg-ink" font-size="13">4. Route topology aur RIB mein?</text><text x="320" y="252" text-anchor="middle" class="svg-muted" font-size="12">show ip eigrp topology, show ip route</text>
<line x1="320" y1="56" x2="320" y2="80" stroke="#64748b" stroke-width="2"/><line x1="320" y1="124" x2="320" y2="148" stroke="#64748b" stroke-width="2"/><line x1="320" y1="192" x2="320" y2="216" stroke="#64748b" stroke-width="2"/>
<text x="320" y="288" text-anchor="middle" class="svg-accent" font-size="12">phir end to end prove karo: ping aur traceroute</text>
</svg><p class="cap">Neeche wali layer se upar ki taraf kaam karo. Har step faults ki ek poori category hata deta hai.</p></div>

<h3>Command toolkit</h3>
<table class="cmp"><tr><th>Command</th><th>Kya prove karta hai</th></tr>
<tr><td><code>show ip eigrp interfaces [detail]</code></td><td>Kaunse interfaces EIGRP chalate hain aur har ek ke kitne peers; passive interfaces gaayab hote hain</td></tr>
<tr><td><code>show ip protocols</code></td><td>AS, K values (Metric weight line), router ID, network statements, passive interfaces, variance, maximum paths</td></tr>
<tr><td><code>show ip eigrp neighbors [detail]</code></td><td>Neighbour list, uptime, Q Cnt, stub status</td></tr>
<tr><td><code>show ip eigrp topology [prefix | all-links | active]</code></td><td>FD, successors, feasible successors, RDs, abhi bhi Active routes</td></tr>
<tr><td><code>show ip route eigrp</code> aur <code>show ip route prefix</code></td><td>Asal mein kya install hua, metric, traffic share counts</td></tr>
<tr><td><code>show logging</code></td><td>Reason ke saath <code>%DUAL-5-NBRCHANGE</code> messages</td></tr>
</table>

<h3>Lab 1 walk karna: prove karo ki design kaam karta hai</h3>
<ol>
<li>R1 par <code>show ip eigrp neighbors</code> do peers dikhata hai: Gi0/0 par 10.0.12.2 aur Gi0/1 par 10.0.13.3. R3 par peers 10.0.23.2 aur 10.0.13.1.</li>
<li><code>show ip eigrp interfaces</code> Gi0/0, Gi0/1 aur Lo0 dikhata hai lekin Gi0/2 nahi, jo confirm karta hai ki LANs passive hain.</li>
<li>R1 par <code>show ip eigrp topology</code>: <code>P 192.168.30.0/24, 1 successors, FD is 3328</code>, successor 10.0.12.2, aur feasible successor <b>10.0.13.3 (256512/2816)</b>.</li>
<li>PC1 se <code>ping 192.168.30.10</code> successful hota hai.</li>
</ol>

<h3>Lab 2 walk karna: load sharing prove karo</h3>
<ol>
<li><code>show ip eigrp topology 172.16.4.0/24</code>: successor 10.1.12.2 (3328/3072), FS <b>10.1.13.3</b> (8192/3072).</li>
<li><code>variance 3</code> ke baad <code>show ip protocols</code> <code>Maximum metric variance 3</code> dikhata hai.</li>
<li><code>show ip route 172.16.4.0</code> do descriptor blocks dikhata hai, traffic share counts <b>2</b> (R2 se) aur <b>1</b> (R3 se).</li>
<li><code>show ip route eigrp</code> 4.4.4.4/32 ke liye bhi do next hops dikhata hai; PC1, 172.16.4.10 ko ping karta hai.</li>
</ol>

<h3>Lab 3 walk karna: K-value mismatch ticket</h3>
<p><b>Ticket:</b> "metric tuning" change window ke baad Kolkata branch (R1) ne Chennai campus (R3) ke saare routes kho diye. Console par baar baar DUAL messages aa rahe hain.</p>
<p><b>Layer 3, neighbour.</b> Logs turant batate hain ki kahan dekhna hai:</p>
<pre class="out">R1#
<span class="hl">%DUAL-5-NBRCHANGE: EIGRP-IPv4 200: Neighbor 10.9.12.2 (GigabitEthernet0/0) is down: K-value mismatch</span>
R3#
<span class="hl">%DUAL-5-NBRCHANGE: EIGRP-IPv4 200: Neighbor 10.9.23.2 (GigabitEthernet0/0) is down: K-value mismatch</span></pre>
<p>R1 aur R3 dono same neighbour, R2, ki shikayat karte hain, jo ishara karta hai ki R2 alag hai. Har router par Metric weight line compare karke prove karo:</p>
<pre class="out">R1# show ip protocols | include weight
    Metric weight K1=1, K2=0, K3=1, K4=0, K5=0
R2# show ip protocols | include weight
    <span class="hl">Metric weight K1=1, K2=1, K3=1, K4=0, K5=0</span>
R3# show ip protocols | include weight
    Metric weight K1=1, K2=0, K3=1, K4=0, K5=0</pre>
<p>R2 par <code>metric weights 0 1 1 1 0 0</code> hai, jisne K2 (load) on kar diya. Defaults wapas laao:</p>
<pre class="code">R2(config)# router eigrp 200
R2(config-router)# no metric weights        <span class="c">! ya: metric weights 0 1 0 1 0 0</span></pre>
<p>Ek hello interval ke andar R2 phir se R1 aur R3 ke saath adjacencies bana leta hai.</p>
<p><b>Layer 4, routes.</b> R1 ab 10.9.23.0/24 aur R3 ka loopback seekhta hai, lekin 192.168.3.0/24 ka route ab bhi nahi hai. Check karo ki R3 kya advertise karne ke liye configured hai:</p>
<pre class="out">R3# show ip protocols
  <span class="hl">Routing for Networks:
    3.3.3.3/32
    10.9.23.0/24</span>
  <span class="hl">Passive Interface(s):
    GigabitEthernet0/1</span></pre>
<p>Gi0/1 (192.168.3.1) passive mark hai, lekin koi network statement use cover nahi karta, isliye woh EIGRP mein hai hi nahi. Passive advertise nahi karta; network statement karta hai.</p>
<pre class="code">R3(config)# router eigrp 200
R3(config-router)# network 192.168.3.0 0.0.0.255</pre>
<pre class="out">R1# show ip route eigrp | include 192.168.3
<span class="hl">D     192.168.3.0/24 [90/3328] via 10.9.12.2, 00:00:12, GigabitEthernet0/0</span></pre>
<p>Aakhir mein PC1, 192.168.3.10 ko successfully ping karta hai. Do faults, order mein mile, har ek ek command se.</p>

<div class="eg"><p><b>Worked example: symptom se cause.</b> Symptom se seedha likely cause par jump karo:</p>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Neighbour nahi, log nahi</td><td>AS mismatch, passive interface, protocol 88 block karta ACL</td><td><code>show ip protocols</code>, <code>show ip eigrp interfaces</code></td></tr>
<tr><td>"K-value mismatch"</td><td>ek side par metric weights badle gaye</td><td><code>show ip protocols | include weight</code></td></tr>
<tr><td>"not on common subnet"</td><td>galat IP ya mask</td><td><code>show ip interface brief</code></td></tr>
<tr><td>"holding time expired", flapping</td><td>hello peer ke hold se lamba, packet loss</td><td>interface timers, errors</td></tr>
<tr><td>"retry limit exceeded", Q Cnt atka</td><td>MTU, unicast filtered, one-way link</td><td><code>show ip eigrp neighbors</code></td></tr>
<tr><td>Neighbour theek, route gaayab</td><td>network statement nahi, filtering, stub receive-only</td><td><code>show ip protocols</code>, topology</td></tr>
<tr><td>Route hai lekin use nahi hota</td><td>behtar AD wala source, jaise static route</td><td><code>show ip route prefix</code></td></tr>
</table></div>

<div class="warn"><p><b>Common galti.</b> Pehle step mein hi EIGRP process restart karna ya router reload karna. Isse saboot (logs, Q Cnt, active routes) mit jaate hain aur fault waise bhi wapas aa jaata hai. Pehle logs aur teeno tables padho.</p></div>

<div class="exam"><p><b>Exam trap.</b> K-value mismatch <b>dono</b> routers par log hota hai, isliye jo router log kare zaroori nahi ki galat values usi par hon. Har router par Metric weight line compare karo. Yeh bhi yaad rakho ki AS mismatch bilkul koi log nahi deta.</p></div>

<div class="scn"><h4>Load jo har ghante hilta tha</h4><p>Ek branch mein traffic har kuch minute apne do WAN links ke beech jhool raha tha, logs mein routes badal rahe the. Engineer ne domain bhar mein <code>show ip protocols</code> compare kiya aur paaya ki kisi ne "load include karne ke liye" saare routers par <code>metric weights 0 1 1 1 0 0</code> set kar diya tha, isliye koi K mismatch nahi dikha. Jaise jaise links busy hote, load value metric badal deti aur paths flap karte. Maintenance window mein har jagah default K values wapas laane se routing stable ho gayi.</p><p><b>Seekh:</b> K values match karein tab bhi, non-default K values metric ko unstable banati hain. Inhe defaults par hi chhodo.</p></div>

<div class="iv"><p class="q">"Ek EIGRP neighbour up nahi ho raha. Apni troubleshooting walk karo."</p><p>Strong answer: layer by layer check karo. Interface sahi IP aur mask ke saath up; us par EIGRP enabled aur passive nahi (<code>show ip eigrp interfaces</code>, <code>show ip protocols</code>); same AS aur K values; common primary subnet; matching authentication aur key ID; IP protocol 88 ya 224.0.0.10 ko kuch block na kare. Log ka reason use karo: K-value mismatch, not on common subnet, retry limit exceeded. Batao ki AS mismatch silent hota hai, isi liye aap configurations directly compare karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layers mein kaam karo: interface, interface par EIGRP, neighbour, topology aur routing table, phir ping.</li>
<li><code>%DUAL-5-NBRCHANGE</code> ka reason text seedha fault ki taraf ishara karta hai.</li>
<li>K-value mismatch dono sides par log hota hai; alag router dhoondhne ke liye Metric weight line compare karo.</li>
<li>Passive interfaces sirf tab advertise hote hain jab koi network statement unhe cover kare.</li>
<li>Processes clear karne se pehle saboot jama karo; teeno tables poori kahani batati hain.</li>
</ul></div>
`}};export{e as default};