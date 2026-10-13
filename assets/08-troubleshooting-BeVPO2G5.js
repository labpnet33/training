var e={id:`troubleshooting`,h:{en:`Troubleshooting IS-IS design problems layer by layer`,hi:`IS-IS design problems ko layer-by-layer troubleshoot karna`},body:{en:`
<p>The best troubleshooters follow a fixed order, not a hunch. For IS-IS design faults the order below finds most problems in minutes. Each step answers one question and tells you whether to go deeper or stop.</p>

<h3>Analogy: a doctor's checklist</h3>
<p>A doctor checks pulse, then temperature, then asks questions, then orders tests. Skipping to the expensive test wastes time. In the same way you check <b>adjacency</b>, then <b>database</b>, then <b>route table</b>, then <b>forwarding</b>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Troubleshooting ladder">
<rect x="20" y="30" width="140" height="60" rx="10" fill="#fecaca"/><text x="90" y="56" text-anchor="middle" class="svg-ink" font-size="13">1 Adjacency</text><text x="90" y="76" text-anchor="middle" class="svg-muted" font-size="10">show isis neighbors</text>
<rect x="180" y="30" width="140" height="60" rx="10" fill="#fed7aa"/><text x="250" y="56" text-anchor="middle" class="svg-ink" font-size="13">2 Database</text><text x="250" y="76" text-anchor="middle" class="svg-muted" font-size="10">database detail</text>
<rect x="340" y="30" width="140" height="60" rx="10" fill="#bae6fd"/><text x="410" y="56" text-anchor="middle" class="svg-ink" font-size="13">3 Routes</text><text x="410" y="76" text-anchor="middle" class="svg-muted" font-size="10">show ip route isis</text>
<rect x="500" y="30" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="560" y="56" text-anchor="middle" class="svg-ink" font-size="13">4 Forwarding</text><text x="560" y="76" text-anchor="middle" class="svg-muted" font-size="10">ping, traceroute</text>
<g stroke="#64748b" stroke-width="2"><line x1="160" y1="60" x2="180" y2="60"/><line x1="320" y1="60" x2="340" y2="60"/><line x1="480" y1="60" x2="500" y2="60"/></g>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">stop at the first layer that is wrong</text>
</svg><p class="cap">Work from the bottom up: each layer depends on the one before.</p></div>

<h3>Layer 1: adjacency</h3>
<p>Questions: is it up, at which level, and with what hold time? Typical causes of failure are mismatched levels, area mismatch for level 1, duplicate system IDs, MTU differences, authentication mismatch, and an interface not enabled for IS-IS. From the Junos side in the first lab (captured after the fix; the Juniper adjacencies were Up before it too):</p>
<pre class="out">JR1&gt; show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/0.0            R1             2 Up                   27
ge-0/0/1.0            JR2            2 Up                   23</pre>
<p>Both adjacencies are level 2 and Up. So layer 1 is healthy, and a design problem in this network must be higher up.</p>

<h3>Layer 2: the database</h3>
<p>Questions: is the neighbour's LSP present, and what does it contain? This is where the narrow-versus-wide trap shows itself:</p>
<pre class="out">R1# show isis database detail
...
JR1.00-00             0x00000001   0xEF4E        1170/1200              0/0/0
  Hostname: JR1
  Metric: 10        <span class="hl">IS-Extended</span> R1
  Metric: 10        <span class="hl">IS-Extended</span> JR2</pre>
<p>(Output shortened: other LSPs and lines omitted. Captured before the fix.) The LSP exists, so flooding works. If the same LSP is missing altogether, think of an LSDB or flooding problem such as a mismatched authentication or an MTU that is too small for the LSP.</p>

<h3>Layer 3: the route table</h3>
<p>Questions: is the prefix present, via the next hop you expect, with the expected metric? Before the fix, R1's table contained no Juniper loopbacks even though layers 1 and 2 were fine (chapter 1). After the fix the metric tells you the path:</p>
<pre class="out">R1# show isis topology
System Id            Metric     Next-Hop             Interface   SNPA
JR1                  30         R2                   Gi0/1       5254.0f04.5002
JR2                  20         R2                   Gi0/1       5254.0f04.5002</pre>
<p>(Output shortened: header and other rows omitted.) A surprising next hop means an unexpected metric. A missing prefix means the originator did not advertise it (passive interface not configured, interface not enabled, redistribute filtered out), or the receiver cannot read it (metric style).</p>

<h3>Layer 4: forwarding</h3>
<p>If routes are right but traffic fails, test with ping and traceroute from loopback to loopback, and check MTU and ACLs. Remember that asymmetric metrics can make forward and return paths differ.</p>

<h3>A symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Where you see it</th></tr>
<tr><td>Adjacency up, routes missing from one vendor</td><td>Metric style mismatch</td><td>database detail: IS versus IS-Extended</td></tr>
<tr><td>Adjacency stuck or flapping</td><td>MTU, authentication, level or area mismatch</td><td>show isis neighbors, logs</td></tr>
<tr><td>Prefix absent</td><td>Not enabled, passive missing, redistribute denied</td><td>originator's config and database</td></tr>
<tr><td>Wrong path</td><td>Metric design or asymmetric metrics</td><td>show isis topology</td></tr>
<tr><td>Redistributed route missing</td><td>Prefix-list or route-map mismatch</td><td>show route-map and prefix-list</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ticket: "PE-to-PE ping to a Juniper PE fails". Layer 1: adjacency Up. Layer 2: LSP present with IS-Extended. Layer 3: loopback absent from the Cisco table. Conclusion: metric style narrow on the Cisco side. Fix: wide on Cisco, then re-check layer 3 and ping.</p></div>
<div class="warn"><p><b>Common mistake.</b> Debugging forwarding (layer 4) first. You can spend hours on traceroute when the route was never installed. Always prove layers 1 to 3 first. Also be careful with debug commands in production because they add CPU load; prefer show commands.</p></div>
<div class="exam"><p><b>Exam trap.</b> Learn which show command answers which question: neighbors for adjacency, database detail for LSP contents, topology for SPF results, and the route table for installed routes.</p></div>

<div class="scn"><h4>The missing customer prefix</h4><p>A customer prefix did not appear in the core. The adjacency and database were fine, but the PE's route-map permitted a different prefix due to a typo in the prefix-list. Fixing the prefix-list restored the route within seconds.</p><p><b>Lesson:</b> check the originator's filter before blaming the core.</p></div>

<div class="iv"><p class="q">"A route is missing on a router. How do you troubleshoot IS-IS?"</p><p>Bottom up. First the adjacency, then whether the originator's LSP is in the database and what TLVs it carries, then the SPF result and route table, then forwarding. At each step I compare both ends and both vendors, because a metric-style or filter issue only shows up in the contents, not in the neighbour list.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: adjacency, database, routes, forwarding.</li>
<li>Adjacency up and LSP present with a route missing points to metric style or filters.</li>
<li>show isis database detail reveals IS versus IS-Extended.</li>
<li>show isis topology reveals path metrics and next hops.</li>
<li>Prefer show commands over debug in production.</li>
</ul></div>
`,hi:`
<p>Sabse achhe troubleshooters ek tay order follow karte hain, andaaze se kaam nahi lete. IS-IS design faults ke liye neeche ka order zyadatar problems minutes mein dhoondh deta hai. Har step ek sawal ka jawab deta hai aur batata hai ki aur gehre jaana hai ya ruk jaana hai.</p>

<h3>Analogy: doctor ki checklist</h3>
<p>Doctor pehle pulse dekhta hai, phir temperature, phir sawal poochta hai, phir tests likhta hai. Seedhe mehnge test par kood jaana waqt barbaad karta hai. Isi tarah aap pehle <b>adjacency</b>, phir <b>database</b>, phir <b>route table</b>, phir <b>forwarding</b> check karte ho.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Troubleshooting seedhi">
<rect x="20" y="30" width="140" height="60" rx="10" fill="#fecaca"/><text x="90" y="56" text-anchor="middle" class="svg-ink" font-size="13">1 Adjacency</text><text x="90" y="76" text-anchor="middle" class="svg-muted" font-size="10">show isis neighbors</text>
<rect x="180" y="30" width="140" height="60" rx="10" fill="#fed7aa"/><text x="250" y="56" text-anchor="middle" class="svg-ink" font-size="13">2 Database</text><text x="250" y="76" text-anchor="middle" class="svg-muted" font-size="10">database detail</text>
<rect x="340" y="30" width="140" height="60" rx="10" fill="#bae6fd"/><text x="410" y="56" text-anchor="middle" class="svg-ink" font-size="13">3 Routes</text><text x="410" y="76" text-anchor="middle" class="svg-muted" font-size="10">show ip route isis</text>
<rect x="500" y="30" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="560" y="56" text-anchor="middle" class="svg-ink" font-size="13">4 Forwarding</text><text x="560" y="76" text-anchor="middle" class="svg-muted" font-size="10">ping, traceroute</text>
<g stroke="#64748b" stroke-width="2"><line x1="160" y1="60" x2="180" y2="60"/><line x1="320" y1="60" x2="340" y2="60"/><line x1="480" y1="60" x2="500" y2="60"/></g>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">pehli galat layer par ruk jao</text>
</svg><p class="cap">Neeche se upar kaam karo: har layer pichli par nirbhar hai.</p></div>

<h3>Layer 1: adjacency</h3>
<p>Sawal: kya up hai, kis level par, aur kitne hold time ke saath? Failure ke aam karan hain mismatched levels, level 1 ke liye area mismatch, duplicate system IDs, MTU differences, authentication mismatch, aur interface par IS-IS enable na hona. Pehle lab mein Junos side se (fix ke baad capture hua; Juniper adjacencies pehle bhi Up thi):</p>
<pre class="out">JR1&gt; show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/0.0            R1             2 Up                   27
ge-0/0/1.0            JR2            2 Up                   23</pre>
<p>Dono adjacencies level 2 aur Up hain. To layer 1 theek hai, aur is network ki design problem upar kahin hogi.</p>

<h3>Layer 2: database</h3>
<p>Sawal: kya neighbour ka LSP maujood hai, aur usme kya hai? Yahin narrow-versus-wide ka jaal dikhta hai:</p>
<pre class="out">R1# show isis database detail
...
JR1.00-00             0x00000001   0xEF4E        1170/1200              0/0/0
  Hostname: JR1
  Metric: 10        <span class="hl">IS-Extended</span> R1
  Metric: 10        <span class="hl">IS-Extended</span> JR2</pre>
<p>(Output chhota kiya gaya: baaki LSPs aur lines hata di gayi. Fix se pehle capture hua.) LSP maujood hai, isliye flooding chal rahi hai. Agar wahi LSP bilkul gayab ho to LSDB ya flooding ki problem socho, jaise mismatched authentication ya LSP ke liye bahut chhota MTU.</p>

<h3>Layer 3: route table</h3>
<p>Sawal: kya prefix maujood hai, expected next hop se, expected metric ke saath? Fix se pehle layers 1 aur 2 theek hone ke bawajood R1 ki table mein koi Juniper loopback nahi tha (chapter 1). Fix ke baad metric path batata hai:</p>
<pre class="out">R1# show isis topology
System Id            Metric     Next-Hop             Interface   SNPA
JR1                  30         R2                   Gi0/1       5254.0f04.5002
JR2                  20         R2                   Gi0/1       5254.0f04.5002</pre>
<p>(Output chhota kiya gaya: header aur baaki rows hata di gayi.) Chaunkane wala next hop matlab unexpected metric. Missing prefix matlab originator ne advertise nahi kiya (passive interface configure nahi, interface enable nahi, redistribute filter ho gaya), ya receiver padh nahi sakta (metric style).</p>

<h3>Layer 4: forwarding</h3>
<p>Agar routes sahi hain par traffic fail ho, to loopback se loopback ping aur traceroute se test karo, aur MTU tatha ACLs check karo. Yaad rakho asymmetric metrics forward aur return paths ko alag bana sakte hain.</p>

<h3>Symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Sambhavit karan</th><th>Kahan dikhta hai</th></tr>
<tr><td>Adjacency up, ek vendor ke routes missing</td><td>Metric style mismatch</td><td>database detail: IS versus IS-Extended</td></tr>
<tr><td>Adjacency atki ya flap</td><td>MTU, authentication, level ya area mismatch</td><td>show isis neighbors, logs</td></tr>
<tr><td>Prefix gayab</td><td>Enable nahi, passive missing, redistribute denied</td><td>originator ki config aur database</td></tr>
<tr><td>Galat path</td><td>Metric design ya asymmetric metrics</td><td>show isis topology</td></tr>
<tr><td>Redistributed route missing</td><td>Prefix-list ya route-map mismatch</td><td>show route-map aur prefix-list</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ticket: "Juniper PE tak PE-to-PE ping fail". Layer 1: adjacency Up. Layer 2: LSP maujood, IS-Extended ke saath. Layer 3: loopback Cisco table se gayab. Nishkarsh: Cisco side par metric style narrow. Fix: Cisco par wide, phir layer 3 aur ping dobara check.</p></div>
<div class="warn"><p><b>Common mistake.</b> Pehle forwarding (layer 4) debug karna. Traceroute par ghante lag sakte hain jabki route kabhi install hi nahi hua. Pehle layers 1 se 3 prove karo. Production mein debug commands se bhi savdhan raho kyunki woh CPU load badhate hain; show commands ko prefer karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Seekho kaunsa show command kaunsa sawal hal karta hai: adjacency ke liye neighbors, LSP contents ke liye database detail, SPF results ke liye topology, aur installed routes ke liye route table.</p></div>

<div class="scn"><h4>Gayab customer prefix</h4><p>Ek customer prefix core mein nahi dikha. Adjacency aur database theek the, par prefix-list mein typo ki wajah se PE ka route-map doosra prefix permit kar raha tha. Prefix-list theek karne se route kuch second mein wapas aa gaya.</p><p><b>Lesson:</b> core ko dosh dene se pehle originator ka filter check karo.</p></div>

<div class="iv"><p class="q">"Router par route missing hai. IS-IS troubleshoot kaise karoge?"</p><p>Neeche se upar. Pehle adjacency, phir kya originator ka LSP database mein hai aur usme kaunse TLVs hain, phir SPF result aur route table, phir forwarding. Har step par dono ends aur dono vendors compare karta hoon, kyunki metric-style ya filter issue sirf contents mein dikhta hai, neighbour list mein nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: adjacency, database, routes, forwarding.</li>
<li>Adjacency up aur LSP maujood par route missing matlab metric style ya filters.</li>
<li>show isis database detail IS versus IS-Extended dikhata hai.</li>
<li>show isis topology path metrics aur next hops dikhata hai.</li>
<li>Production mein debug ke bajaye show commands prefer karo.</li>
</ul></div>
`}};export{e as default};