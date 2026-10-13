var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You can now read the OSPF database, design areas with summaries and stub or NSSA types, run OSPFv3, control external routes in and out, drain a router with overload, repair a broken backbone with a virtual link and troubleshoot with a method. Use this chapter as your last check before the practice labs and the exam.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="OSPF knowledge map">
<rect x="20" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="110" y="50" text-anchor="middle" class="svg-ink" font-size="13">LSDB and LSA types</text>
<rect x="230" y="20" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Areas, summaries, stub</text>
<rect x="440" y="20" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="530" y="50" text-anchor="middle" class="svg-ink" font-size="13">OSPFv3</text>
<rect x="20" y="95" width="180" height="50" rx="8" fill="#fde68a"/><text x="110" y="125" text-anchor="middle" class="svg-ink" font-size="13">Export / import policy</text>
<rect x="230" y="95" width="180" height="50" rx="8" fill="#fed7aa"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="13">Overload, virtual links</text>
<rect x="440" y="95" width="180" height="50" rx="8" fill="#bae6fd"/><text x="530" y="125" text-anchor="middle" class="svg-ink" font-size="13">Troubleshooting</text>
</svg><p class="cap">Six areas of knowledge in this module.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can name the LSA types, who creates them and where they flood.</li>
<li>I can read show ospf database, show ospf route, and tell intra, inter and external paths apart.</li>
<li>I can configure area-range, stub, totally stubby and NSSA and explain the differences.</li>
<li>I can configure OSPFv3 and read Link, Intra-Area-Prefix and Inter-Area-Prefix LSAs.</li>
<li>I can write an export policy with route filters, metric, tag and external type.</li>
<li>I can explain E1 versus E2 and compute the final metric.</li>
<li>I can write an import policy and explain why the LSDB is not changed.</li>
<li>I can drain a router with overload, with and without a timeout, and verify it.</li>
<li>I can build and repair a virtual link.</li>
<li>I can troubleshoot no adjacency, missing route and wrong path.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ABR</dt><dd>Area border router: has interfaces in two or more areas; creates type 3 and 4 LSAs.</dd>
<dt>ASBR</dt><dd>Router that originates external routes (type 5 or 7); shown with bits 0x2.</dd>
<dt>Transit area</dt><dd>Area used by a virtual link to carry backbone adjacency.</dd>
<dt>Totally stubby</dt><dd>Stub area that also blocks type 3 LSAs; only a default route enters.</dd>
<dt>NSSA</dt><dd>Stub-like area that allows a local ASBR using type 7 LSAs.</dd>
<dt>E1 / E2</dt><dd>External types: E1 adds internal cost, E2 keeps the external metric.</dd>
<dt>Overload</dt><dd>Advertising transit links with metric 65535.</dd>
<dt>Link LSA</dt><dd>OSPFv3 link-local LSA with the link-local address and the prefixes of one link.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Preference internal / external</td><td>10 / 150</td></tr>
<tr><td>Hello / dead on broadcast and p2p</td><td>10 s / 40 s</td></tr>
<tr><td>Overload metric on transit links</td><td>65535</td></tr>
<tr><td>Default external type</td><td>E2</td></tr>
<tr><td>Path type order</td><td>Intra, inter, E1, E2</td></tr>
<tr><td>Virtual link neighbor-id</td><td>Router ID of the far ABR; both ends under area 0</td></tr>
<tr><td>OSPFv3 neighbours use</td><td>Link-local addresses</td></tr>
<tr><td>OSPFv3 authentication</td><td>IPsec</td></tr>
<tr><td>Import policy applies to</td><td>External routes, local table only</td></tr>
<tr><td>Tag 666 shown as</td><td>0.0.2.154</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code">show ospf neighbor [extensive]       show ospf interface [detail]
show ospf database [router|netsummary|external|extensive] [lsa-id X detail]
show ospf route                      show ospf overview
show ospf3 neighbor / interface / database
show route protocol ospf / ospf3     show route X detail
show log messages | last 20          show ospf log
set protocols ospf overload [timeout N]
set protocols ospf area A virtual-link neighbor-id RID transit-area T
set protocols ospf export P          set protocols ospf import P
set protocols ospf3 area A interface IF</pre>

<div class="eg"><p><b>Worked example: self-test.</b> A router has an E1 route with metric 20 to an ASBR 3 hops away at cost 1 per hop. It also has the same prefix as an E2 route with metric 5 from another ASBR. Which does it install? E1 wins over E2 for the same prefix, with metric 20 plus 3, which is 23. The lower E2 metric does not matter.</p></div>

<div class="warn"><p><b>Common mistake.</b> Memorising commands without understanding the database. Exam tasks change addresses and area numbers; understanding survives that.</p></div>
<div class="exam"><p><b>Exam trap.</b> Read each task twice. Words like "must not use", "keep reachable", "only via" and "without changing other routers" decide which feature is right: import policy, overload or export policy.</p></div>

<div class="scn"><h4>Exam day, task 3</h4><p>The task said: R1 must reach the server only via R3 while R2 stays reachable by its loopback. A candidate who first wrote an import policy lost time. The candidate who recognised "stay reachable" as overload finished in two minutes, verified with show route and a ping to R2's loopback, and moved on.</p><p><b>Lesson:</b> match the wording of the requirement to the feature, then verify.</p></div>

<div class="iv"><p class="q">"Summarise how you would roll out OSPF in a new multi-site enterprise."</p><p>Plan areas by site with area 0 in the core, give every router a /32 loopback and router ID, run point-to-point links, summarise at ABRs, make remote areas stub or totally stubby unless they need local externals, use export policies with tags for any redistribution, enable authentication, and keep a maintenance process with overload and confirmed commits.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Database first: LSA types and scope explain most behaviour.</li>
<li>Area types and summaries shrink tables; all routers in an area must agree on type.</li>
<li>Export creates external LSAs; import filters only the local table.</li>
<li>Overload drains a router; virtual links repair the backbone.</li>
<li>Troubleshoot in order: interface, neighbour, database, route, policy, forwarding.</li>
</ul></div>
`,hi:`
<p>Ab aap OSPF database padh sakte ho, summaries aur stub ya NSSA types ke saath areas design kar sakte ho, OSPFv3 chala sakte ho, external routes ko andar-bahar control kar sakte ho, overload se router drain kar sakte ho, virtual link se toota backbone repair kar sakte ho aur method se troubleshoot kar sakte ho. Practice labs aur exam se pehle yeh chapter aapka aakhri check hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="OSPF knowledge map">
<rect x="20" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="110" y="50" text-anchor="middle" class="svg-ink" font-size="13">LSDB aur LSA types</text>
<rect x="230" y="20" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Areas, summaries, stub</text>
<rect x="440" y="20" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="530" y="50" text-anchor="middle" class="svg-ink" font-size="13">OSPFv3</text>
<rect x="20" y="95" width="180" height="50" rx="8" fill="#fde68a"/><text x="110" y="125" text-anchor="middle" class="svg-ink" font-size="13">Export / import policy</text>
<rect x="230" y="95" width="180" height="50" rx="8" fill="#fed7aa"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="13">Overload, virtual links</text>
<rect x="440" y="95" width="180" height="50" rx="8" fill="#bae6fd"/><text x="530" y="125" text-anchor="middle" class="svg-ink" font-size="13">Troubleshooting</text>
</svg><p class="cap">Is module ke gyaan ke chhe kshetra.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main LSA types, unhe kaun banata hai aur woh kahan flood hote hain, bata sakta hoon.</li>
<li>Main show ospf database, show ospf route padh sakta hoon, aur intra, inter aur external paths mein farq kar sakta hoon.</li>
<li>Main area-range, stub, totally stubby aur NSSA configure kar sakta hoon aur differences samjha sakta hoon.</li>
<li>Main OSPFv3 configure kar sakta hoon aur Link, Intra-Area-Prefix aur Inter-Area-Prefix LSAs padh sakta hoon.</li>
<li>Main route filters, metric, tag aur external type ke saath export policy likh sakta hoon.</li>
<li>Main E1 versus E2 samjha sakta hoon aur final metric nikal sakta hoon.</li>
<li>Main import policy likh sakta hoon aur bata sakta hoon ki LSDB kyun nahi badalta.</li>
<li>Main overload se router drain kar sakta hoon, timeout ke saath aur bina, aur verify kar sakta hoon.</li>
<li>Main virtual link bana aur repair kar sakta hoon.</li>
<li>Main no adjacency, missing route aur wrong path troubleshoot kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ABR</dt><dd>Area border router: do ya zyada areas mein interfaces rakhta hai; type 3 aur 4 LSAs banata hai.</dd>
<dt>ASBR</dt><dd>Router jo external routes (type 5 ya 7) originate karta hai; bits 0x2 se dikhta hai.</dd>
<dt>Transit area</dt><dd>Virtual link ke liye backbone adjacency carry karne wala area.</dd>
<dt>Totally stubby</dt><dd>Stub area jo type 3 LSAs bhi block karta hai; sirf default route andar aata hai.</dd>
<dt>NSSA</dt><dd>Stub jaisa area jo type 7 LSAs se local ASBR allow karta hai.</dd>
<dt>E1 / E2</dt><dd>External types: E1 internal cost jodta hai, E2 external metric rakhta hai.</dd>
<dt>Overload</dt><dd>Transit links ko metric 65535 se advertise karna.</dd>
<dt>Link LSA</dt><dd>OSPFv3 link-local LSA jisme ek link ka link-local address aur prefixes hote hain.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Preference internal / external</td><td>10 / 150</td></tr>
<tr><td>Broadcast aur p2p par hello / dead</td><td>10 s / 40 s</td></tr>
<tr><td>Transit links par overload metric</td><td>65535</td></tr>
<tr><td>Default external type</td><td>E2</td></tr>
<tr><td>Path type order</td><td>Intra, inter, E1, E2</td></tr>
<tr><td>Virtual link neighbor-id</td><td>Door wale ABR ka router ID; dono ends area 0 ke neeche</td></tr>
<tr><td>OSPFv3 neighbours kya use karte hain</td><td>Link-local addresses</td></tr>
<tr><td>OSPFv3 authentication</td><td>IPsec</td></tr>
<tr><td>Import policy kis par lagti hai</td><td>External routes, sirf local table</td></tr>
<tr><td>Tag 666 kaise dikhta hai</td><td>0.0.2.154</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code">show ospf neighbor [extensive]       show ospf interface [detail]
show ospf database [router|netsummary|external|extensive] [lsa-id X detail]
show ospf route                      show ospf overview
show ospf3 neighbor / interface / database
show route protocol ospf / ospf3     show route X detail
show log messages | last 20          show ospf log
set protocols ospf overload [timeout N]
set protocols ospf area A virtual-link neighbor-id RID transit-area T
set protocols ospf export P          set protocols ospf import P
set protocols ospf3 area A interface IF</pre>

<div class="eg"><p><b>Worked example: self-test.</b> Router ke paas ek ASBR tak 3 hop door (har hop cost 1) metric 20 wala E1 route hai. Wahi prefix doosre ASBR se metric 5 ke E2 route ke roop mein bhi hai. Kaunsa install hoga? Same prefix ke liye E1, E2 se jeetta hai, metric 20 plus 3, yaani 23. Kam E2 metric matter nahi karta.</p></div>

<div class="warn"><p><b>Common mistake.</b> Database samjhe bina commands ratna. Exam tasks addresses aur area numbers badal dete hain; samajh us badlav se bachti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Har task do baar padho. "must not use", "keep reachable", "only via" aur "without changing other routers" jaise shabd tay karte hain ki kaunsa feature sahi hai: import policy, overload ya export policy.</p></div>

<div class="scn"><h4>Exam day, task 3</h4><p>Task kehta tha: R1 server tak sirf R3 se pahunche jabki R2 apne loopback se reachable rahe. Jis candidate ne pehle import policy likhi usne samay khoya. Jis candidate ne "stay reachable" ko overload pehchana usne do minute mein kar liya, show route aur R2 ke loopback ke ping se verify kiya, aur aage badh gaya.</p><p><b>Lesson:</b> requirement ke shabdon ko feature se match karo, phir verify karo.</p></div>

<div class="iv"><p class="q">"Naye multi-site enterprise mein OSPF roll out kaise karoge, summary mein batao."</p><p>Site ke hisaab se areas plan karo, core mein area 0, har router ko /32 loopback aur router ID do, point-to-point links chalao, ABRs par summarise karo, remote areas ko stub ya totally stubby banao jab tak local externals na chahiye, redistribution ke liye tags ke saath export policies use karo, authentication enable karo, aur overload tatha confirmed commits ke saath maintenance process rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle database: LSA types aur scope zyadatar behaviour explain karte hain.</li>
<li>Area types aur summaries tables chhote karte hain; area ke saare routers type par agree hone chahiye.</li>
<li>Export external LSAs banata hai; import sirf local table filter karta hai.</li>
<li>Overload router drain karta hai; virtual links backbone repair karte hain.</li>
<li>Order mein troubleshoot karo: interface, neighbour, database, route, policy, forwarding.</li>
</ul></div>
`}};export{e as default};