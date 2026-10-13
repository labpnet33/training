var e={id:`export-statics`,h:{en:`Exporting static routes into OSPF: the full walkthrough`,hi:`Static routes ko OSPF mein export karna: poora walkthrough`},body:{en:`
<p>Now we put the first six chapters to work. This chapter walks through the module's first lab step by step: R1 (Chennai edge) must tell R2 (core) about three partner networks, but keep the vendor management network private.</p>

<h3>The topology and the goal</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Lab topology R2 R1 PTR">
<rect x="40" y="80" width="110" height="60" rx="8" fill="#bae6fd"/><text x="95" y="108" text-anchor="middle" class="svg-ink" font-size="14">R2</text><text x="95" y="126" text-anchor="middle" class="svg-muted" font-size="12">core</text>
<rect x="265" y="80" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="320" y="126" text-anchor="middle" class="svg-muted" font-size="12">Chennai edge</text>
<rect x="490" y="80" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="545" y="108" text-anchor="middle" class="svg-ink" font-size="14">PTR</text><text x="545" y="126" text-anchor="middle" class="svg-muted" font-size="12">partner</text>
<line x1="150" y1="110" x2="265" y2="110" stroke="#64748b" stroke-width="2"/><text x="207" y="100" text-anchor="middle" class="svg-muted" font-size="11">10.44.12.0/30 OSPF</text>
<line x1="375" y1="110" x2="490" y2="110" stroke="#64748b" stroke-width="2"/><text x="432" y="100" text-anchor="middle" class="svg-muted" font-size="11">10.44.90.0/30 static</text>
<text x="545" y="165" text-anchor="middle" class="svg-ink" font-size="11">172.20.1.0/24 172.20.2.0/24</text><text x="545" y="181" text-anchor="middle" class="svg-ink" font-size="11">172.20.8.0/22 192.168.99.0/24</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">R1 export policy: partner statics into OSPF, vendor network stays private</text>
</svg><p class="cap">R1 reaches PTR by static routes with next hop 10.44.90.2. OSPF area 0 runs between R1 and R2.</p></div>
<p>R1's statics are: 172.20.1.0/24, 172.20.2.0/24, 172.20.8.0/22 and 192.168.99.0/24, all with next hop 10.44.90.2. The goal: R2 learns the first three as OSPF externals with metric 20, never the fourth, and can ping 172.20.8.1.</p>

<h3>Step 1: write the policy</h3>
<pre class="code">lab@R1&gt; configure
lab@R1# edit policy-options policy-statement PARTNER-OUT term PARTNERS
[edit policy-options policy-statement PARTNER-OUT term PARTNERS]
lab@R1# set from protocol static
lab@R1# set from route-filter 172.20.0.0/16 orlonger
lab@R1# set then accept
lab@R1# top
lab@R1# commit
commit complete</pre>
<p>The <code>edit</code> command moves you down the hierarchy so the following <code>set</code> lines are short. <code>top</code> returns to the root. The policy is committed but not yet used by anything, so R2 sees no change.</p>
<p>No second term is needed. The 192.168.99.0/24 static does not match <code>172.20.0.0/16 orlonger</code>, so no term decides and the OSPF default export (reject) keeps it private. If you prefer explicit style, add <code>term LAST then reject</code>.</p>

<h3>Step 2: test before applying</h3>
<pre class="out">lab@R1# run test policy PARTNER-OUT 172.20.0.0/16

inet.0: 12 destinations, 12 routes (12 active, 0 holddown, 0 hidden)
Prefix                  Next hop              Age
172.20.1.0/24      *[Static/5] 00:31:22
                    &gt; to 10.44.90.2 via ge-0/0/1.0
172.20.2.0/24      *[Static/5] 00:31:22
                    &gt; to 10.44.90.2 via ge-0/0/1.0
172.20.8.0/22      *[Static/5] 00:31:22
                    &gt; to 10.44.90.2 via ge-0/0/1.0
<span class="hl">Policy PARTNER-OUT: 3 prefix accepted, 0 prefix rejected</span></pre>
<p><code>run</code> lets you execute an operational command from configuration mode. The count is three. That matches our intent: the three partner networks. 192.168.99.0/24 is outside the tested prefix, so it is not in the count. Test it directly with <code>run test policy PARTNER-OUT 192.168.99.0/24</code>. A good habit is to confirm the forbidden prefix too.</p>

<h3>Step 3: apply it and set the metric</h3>
<p>Modifying actions belong in the same term as the accept. Add the metric and apply the policy to OSPF:</p>
<pre class="code">lab@R1# set policy-options policy-statement PARTNER-OUT term PARTNERS then metric 20
lab@R1# set protocols ospf export PARTNER-OUT
lab@R1# commit and-quit
commit complete
Exiting configuration mode</pre>
<p><code>commit and-quit</code> commits and leaves configuration mode in one step. After the commit, R1 originates the three routes as <b>Type 5 external LSAs</b>. R1 becomes an <b>ASBR</b> (autonomous system boundary router), because it injects external routes into OSPF.</p>

<h3>Step 4: verify on R2</h3>
<pre class="out">lab@R2&gt; show route protocol ospf
inet.0: 8 destinations, 8 routes (8 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

10.44.255.1/32     *[OSPF/10] 00:01:10, metric 1
                    &gt;  to 10.44.12.1 via ge-0/0/0.0
<span class="hl">172.20.1.0/24      *[OSPF/150] 00:00:40, metric 20</span>
                    &gt;  to 10.44.12.1 via ge-0/0/0.0
172.20.2.0/24      *[OSPF/150] 00:00:40, metric 20
                    &gt;  to 10.44.12.1 via ge-0/0/0.0
172.20.8.0/22      *[OSPF/150] 00:00:40, metric 20
                    &gt;  to 10.44.12.1 via ge-0/0/0.0
224.0.0.5/32       *[OSPF/10] 00:01:10, metric 1
                       MultiRecv

lab@R2&gt; ping 172.20.8.1 count 3
PING 172.20.8.1 (172.20.8.1): 56 data bytes
64 bytes from 172.20.8.1: icmp_seq=0 ttl=63 time=1.2 ms
64 bytes from 172.20.8.1: icmp_seq=1 ttl=63 time=0.9 ms
64 bytes from 172.20.8.1: icmp_seq=2 ttl=63 time=0.9 ms

--- 172.20.8.1 ping statistics ---
3 packets transmitted, 3 packets received, 0% packet loss</pre>
<p>Read the highlighted line: preference 150 (external), metric 20 (set by our policy). 192.168.99.0/24 is absent. The ping works because PTR has a default route back to R1 (10.44.90.1) and R1 forwards using its static routes.</p>

<h3>What else can then actions do?</h3>
<ul>
<li><code>metric 20</code> sets the metric of the exported OSPF external route.</li>
<li><code>external type 1</code> changes the OSPF external type from the default Type 2 to Type 1. Type 1 adds the internal cost to reach the ASBR; Type 2 (default) keeps the metric unchanged.</li>
<li><code>tag 410</code> attaches a tag.</li>
<li><code>preference 30</code> changes the local preference of a route (used on import, to change which source wins).</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Forgetting to apply the policy, or applying it as <code>import</code>. The OSPF import policy cannot make R1 advertise routes. Exporting statics always uses <code>export</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exported statics appear on neighbours with preference 150 and E2 type by default, not preference 10. The default metric of an OSPF external route is 0 unless a policy sets it, which is why we set metric 20 in a then clause.</p></div>

<div class="scn"><h4>The partner link that "worked" for one router</h4><p>A logistics company's Chennai edge router had statics towards a partner but the core still sent partner traffic to the internet. The engineer checked R1 and ping to the partner worked from R1 itself. That convinced everyone the network was fine. Only when someone pinged from the core router did they notice the partner prefixes were absent from the core table. The statics were never exported. After PARTNER-OUT was applied with metric 20, the core had the routes and the business application worked. The ticket note: "always test from the router that should learn the route, not from the router that originates it."</p><p><b>Lesson:</b> verify at the receiver.</p></div>

<div class="iv"><p class="q">"Walk me through exporting a static route into OSPF."</p><p>Strong answer: write a policy-statement with a term from protocol static and a route-filter for the allowed prefixes, then accept; test it with test policy; apply it with set protocols ospf export; commit. Verify on the neighbour: the route appears as OSPF with preference 150 and the metric you set. Mention R1 becomes an ASBR and floods Type 5 LSAs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Exporting statics needs a policy plus set protocols ospf export; defining it is not enough.</li>
<li>Use from protocol static and a route-filter so only intended prefixes leave.</li>
<li>then metric, tag and external type go in the same term as accept.</li>
<li>Exported statics appear on neighbours as OSPF/150 with the metric you set.</li>
<li>Verify at the receiving router, and confirm the forbidden prefix is absent.</li>
</ul></div>
`,hi:`
<p>Ab hum pehle chhe chapters ko kaam mein lagate hain. Yeh chapter module ki pehli lab ko step by step chalata hai: R1 (Chennai edge) ko R2 (core) ko teen partner networks batane hain, lekin vendor management network private rakhna hai.</p>

<h3>Topology aur goal</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Lab topology R2 R1 PTR">
<rect x="40" y="80" width="110" height="60" rx="8" fill="#bae6fd"/><text x="95" y="108" text-anchor="middle" class="svg-ink" font-size="14">R2</text><text x="95" y="126" text-anchor="middle" class="svg-muted" font-size="12">core</text>
<rect x="265" y="80" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="320" y="126" text-anchor="middle" class="svg-muted" font-size="12">Chennai edge</text>
<rect x="490" y="80" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="545" y="108" text-anchor="middle" class="svg-ink" font-size="14">PTR</text><text x="545" y="126" text-anchor="middle" class="svg-muted" font-size="12">partner</text>
<line x1="150" y1="110" x2="265" y2="110" stroke="#64748b" stroke-width="2"/><text x="207" y="100" text-anchor="middle" class="svg-muted" font-size="11">10.44.12.0/30 OSPF</text>
<line x1="375" y1="110" x2="490" y2="110" stroke="#64748b" stroke-width="2"/><text x="432" y="100" text-anchor="middle" class="svg-muted" font-size="11">10.44.90.0/30 static</text>
<text x="545" y="165" text-anchor="middle" class="svg-ink" font-size="11">172.20.1.0/24 172.20.2.0/24</text><text x="545" y="181" text-anchor="middle" class="svg-ink" font-size="11">172.20.8.0/22 192.168.99.0/24</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">R1 export policy: partner statics OSPF mein, vendor network private</text>
</svg><p class="cap">R1 PTR tak static routes se pahunchta hai, next hop 10.44.90.2. R1 aur R2 ke beech OSPF area 0 chalta hai.</p></div>
<p>R1 ke statics hain: 172.20.1.0/24, 172.20.2.0/24, 172.20.8.0/22 aur 192.168.99.0/24, sab ka next hop 10.44.90.2. Goal: R2 pehle teen ko metric 20 ke saath OSPF externals ke roop mein seekhe, chauthe ko kabhi nahi, aur 172.20.8.1 ping kar sake.</p>

<h3>Step 1: policy likho</h3>
<pre class="code">lab@R1&gt; configure
lab@R1# edit policy-options policy-statement PARTNER-OUT term PARTNERS
[edit policy-options policy-statement PARTNER-OUT term PARTNERS]
lab@R1# set from protocol static
lab@R1# set from route-filter 172.20.0.0/16 orlonger
lab@R1# set then accept
lab@R1# top
lab@R1# commit
commit complete</pre>
<p><code>edit</code> command aapko hierarchy mein neeche le jaata hai taaki agle <code>set</code> lines chhote hon. <code>top</code> root par wapas lata hai. Policy commit ho gayi lekin abhi koi use nahi kar raha, isliye R2 ko koi badlaav nahi dikhta.</p>
<p>Doosre term ki zaroorat nahi. 192.168.99.0/24 static <code>172.20.0.0/16 orlonger</code> se match nahi karta, isliye koi term decide nahi karta aur OSPF ka default export (reject) use private rakhta hai. Explicit style pasand ho to <code>term LAST then reject</code> jodo.</p>

<h3>Step 2: apply karne se pehle test</h3>
<pre class="out">lab@R1# run test policy PARTNER-OUT 172.20.0.0/16

inet.0: 12 destinations, 12 routes (12 active, 0 holddown, 0 hidden)
Prefix                  Next hop              Age
172.20.1.0/24      *[Static/5] 00:31:22
                    &gt; to 10.44.90.2 via ge-0/0/1.0
172.20.2.0/24      *[Static/5] 00:31:22
                    &gt; to 10.44.90.2 via ge-0/0/1.0
172.20.8.0/22      *[Static/5] 00:31:22
                    &gt; to 10.44.90.2 via ge-0/0/1.0
<span class="hl">Policy PARTNER-OUT: 3 prefix accepted, 0 prefix rejected</span></pre>
<p><code>run</code> aapko configuration mode se operational command chalane deta hai. Count teen hai. Yeh hamare intent se match karta hai: teen partner networks. 192.168.99.0/24 test kiye gaye prefix ke bahar hai, isliye count mein nahi. Use seedha test karo: <code>run test policy PARTNER-OUT 192.168.99.0/24</code>. Achhi aadat hai ki forbidden prefix bhi confirm karo.</p>

<h3>Step 3: apply karo aur metric set karo</h3>
<p>Modifying actions accept ke saath usi term mein aate hain. Metric jodo aur policy OSPF par apply karo:</p>
<pre class="code">lab@R1# set policy-options policy-statement PARTNER-OUT term PARTNERS then metric 20
lab@R1# set protocols ospf export PARTNER-OUT
lab@R1# commit and-quit
commit complete
Exiting configuration mode</pre>
<p><code>commit and-quit</code> ek step mein commit karta hai aur configuration mode se bahar aata hai. Commit ke baad R1 teen routes ko <b>Type 5 external LSAs</b> ke roop mein originate karta hai. R1 <b>ASBR</b> (autonomous system boundary router) ban jaata hai, kyunki woh external routes OSPF mein inject karta hai.</p>

<h3>Step 4: R2 par verify karo</h3>
<pre class="out">lab@R2&gt; show route protocol ospf
inet.0: 8 destinations, 8 routes (8 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

10.44.255.1/32     *[OSPF/10] 00:01:10, metric 1
                    &gt;  to 10.44.12.1 via ge-0/0/0.0
<span class="hl">172.20.1.0/24      *[OSPF/150] 00:00:40, metric 20</span>
                    &gt;  to 10.44.12.1 via ge-0/0/0.0
172.20.2.0/24      *[OSPF/150] 00:00:40, metric 20
                    &gt;  to 10.44.12.1 via ge-0/0/0.0
172.20.8.0/22      *[OSPF/150] 00:00:40, metric 20
                    &gt;  to 10.44.12.1 via ge-0/0/0.0
224.0.0.5/32       *[OSPF/10] 00:01:10, metric 1
                       MultiRecv

lab@R2&gt; ping 172.20.8.1 count 3
PING 172.20.8.1 (172.20.8.1): 56 data bytes
64 bytes from 172.20.8.1: icmp_seq=0 ttl=63 time=1.2 ms
64 bytes from 172.20.8.1: icmp_seq=1 ttl=63 time=0.9 ms
64 bytes from 172.20.8.1: icmp_seq=2 ttl=63 time=0.9 ms

--- 172.20.8.1 ping statistics ---
3 packets transmitted, 3 packets received, 0% packet loss</pre>
<p>Highlighted line padho: preference 150 (external), metric 20 (hamari policy ne set kiya). 192.168.99.0/24 absent hai. Ping isliye chalta hai kyunki PTR ke paas R1 (10.44.90.1) ki taraf default route hai aur R1 apne static routes se forward karta hai.</p>

<h3>then actions aur kya kar sakte hain?</h3>
<ul>
<li><code>metric 20</code> exported OSPF external route ka metric set karta hai.</li>
<li><code>external type 1</code> OSPF external type ko default Type 2 se Type 1 karta hai. Type 1 ASBR tak ki internal cost jodta hai; Type 2 (default) metric ko wahi rakhta hai.</li>
<li><code>tag 410</code> tag lagata hai.</li>
<li><code>preference 30</code> route ki local preference badalta hai (import par use hota hai, taaki kaunsa source jeete yeh badle).</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Policy apply karna bhool jaana, ya use <code>import</code> ke roop mein apply karna. OSPF import policy R1 ko routes advertise nahi karwa sakti. Statics export karne ke liye hamesha <code>export</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exported statics neighbours par preference 150 aur default E2 type ke saath dikhte hain, preference 10 nahi. OSPF external route ka default metric 0 hota hai jab tak policy set na kare, isliye humne then clause mein metric 20 set kiya.</p></div>

<div class="scn"><h4>Partner link jo sirf ek router ke liye "chala"</h4><p>Ek logistics company ke Chennai edge router par partner ki taraf statics the lekin core partner traffic ab bhi internet ki taraf bhej raha tha. Engineer ne R1 check kiya aur R1 se partner ka ping chala. Isse sabko laga ki network theek hai. Jab kisi ne core router se ping kiya tab dikha ki partner prefixes core table mein hain hi nahi. Statics kabhi export hue hi nahi the. PARTNER-OUT metric 20 ke saath apply hone ke baad core ko routes mil gaye aur business application chal gayi. Ticket note: "test hamesha us router se karo jo route seekhe, us router se nahi jo originate kare."</p><p><b>Lesson:</b> receiver par verify karo.</p></div>

<div class="iv"><p class="q">"Mujhe batao static route ko OSPF mein kaise export karte hain."</p><p>Strong answer: from protocol static aur allowed prefixes ke route-filter wala term likho, phir accept; test policy se test karo; set protocols ospf export se apply karo; commit karo. Neighbour par verify karo: route OSPF ke roop mein preference 150 aur aapke set kiye metric ke saath dikhta hai. Bolo ki R1 ASBR ban jaata hai aur Type 5 LSAs flood karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Statics export karne ke liye policy aur set protocols ospf export dono chahiye; sirf define karna kaafi nahi.</li>
<li>from protocol static aur route-filter use karo taaki sirf intended prefixes jaayein.</li>
<li>then metric, tag aur external type accept wale term mein hi aate hain.</li>
<li>Exported statics neighbours par OSPF/150 aur aapke set kiye metric ke saath dikhte hain.</li>
<li>Receiving router par verify karo, aur confirm karo ki forbidden prefix absent hai.</li>
</ul></div>
`}};export{e as default};