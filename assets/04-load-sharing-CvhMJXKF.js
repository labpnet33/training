var e={id:`load-sharing`,h:{en:`Designing MSTP load sharing: roots, costs and failover`,hi:`MSTP load sharing design: roots, costs aur failover`},body:{en:`
<p>Knowing the commands is half the job. A professional-level engineer must <b>design</b> which VLANs go to which instance, where the roots sit, and what happens when a link or a switch fails. This chapter is the design chapter.</p>

<h3>Rule 1: the root of each instance sits next to its gateway</h3>
<p>Layer 3 gateways (irb interfaces) should sit on the root of the instance that carries their VLAN. Then traffic from any access switch goes up the shortest tree path to the gateway, never "up, across, then up again". At Surat, AGG1 holds the gateway for VLAN 10 and AGG2 for VLAN 20, so AGG1 is root of MSTI 1 and AGG2 root of MSTI 2.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Load sharing design">
<rect x="70" y="30" width="150" height="46" rx="10" fill="#bae6fd"/><text x="145" y="50" text-anchor="middle" class="svg-ink" font-size="13">AGG1</text><text x="145" y="67" text-anchor="middle" class="svg-muted" font-size="11">root MSTI 1 (4k), gw VLAN 10</text>
<rect x="420" y="30" width="150" height="46" rx="10" fill="#bae6fd"/><text x="495" y="50" text-anchor="middle" class="svg-ink" font-size="13">AGG2</text><text x="495" y="67" text-anchor="middle" class="svg-muted" font-size="11">root MSTI 2 (4k), gw VLAN 20</text>
<line x1="220" y1="53" x2="420" y2="53" stroke="#64748b" stroke-width="2"/><text x="320" y="46" text-anchor="middle" class="svg-muted" font-size="11">inter-switch link</text>
<rect x="245" y="170" width="150" height="46" rx="10" fill="#bbf7d0"/><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">ACC7</text><text x="320" y="207" text-anchor="middle" class="svg-muted" font-size="11">root port differs per MSTI</text>
<line x1="170" y1="76" x2="290" y2="170" stroke="#16a34a" stroke-width="3"/><text x="195" y="130" class="svg-accent" font-size="12">MSTI 1 forwards</text>
<line x1="470" y1="76" x2="350" y2="170" stroke="#2563eb" stroke-width="3"/><text x="400" y="130" class="svg-accent" font-size="12">MSTI 2 forwards</text>
</svg><p class="cap">Each instance forwards on a different uplink; each uplink is the blocked one for the other instance.</p></div>

<h3>Rule 2: back each root up with the next-best priority</h3>
<p>If AGG1 dies, instance 1 must move to AGG2 predictably. Give AGG2 priority 8k in MSTI 1 and AGG1 8k in MSTI 2. The lowest value wins, so 4k beats 8k; if both 4k switches die, a default 32k access switch would become root, which you never want. Consider also configuring an access switch with <code>bridge-priority 60k</code> so it can never win a root election by accident.</p>

<h3>Rule 3: steer with cost only when roots are not enough</h3>
<p>Root placement already makes ACC7's root ports differ. Costs help when two links go to the <i>same</i> neighbour or when a path via another switch looks cheaper. Cost can be set per interface for the CIST (<code>protocols mstp interface ge-0/0/1 cost 40000</code>) or per instance (<code>protocols mstp msti 2 interface ge-0/0/1 cost 40000</code>). The root path cost is the sum of port costs towards the root, so raising a port cost on one link raises the total along that route only.</p>
<table class="cmp"><tr><th>Link speed</th><th>Default cost</th></tr>
<tr><td>10 Mbps</td><td>2000000</td></tr><tr><td>100 Mbps</td><td>200000</td></tr><tr><td>1 Gbps</td><td>20000</td></tr><tr><td>10 Gbps</td><td>2000</td></tr></table>

<h3>Verifying the design with real output</h3>
<p>ACC7 after the Surat fix. Instance 1 forwards on ge-0/0/0 and instance 2 on ge-0/0/1.</p>
<pre class="out">lab@ACC7&gt; show spanning-tree interface msti 1
Interface     Port ID  Designated  Designated         Port   State  Role
                       port ID     bridge ID          Cost
ge-0/0/0      128:1    128:2       4097.525426341d00  20000  FWD    <span class="hl">ROOT</span>
ge-0/0/1      128:2    128:2       8193.525423341900  20000  BLK    ALT

lab@ACC7&gt; show spanning-tree bridge msti 2
STP bridge parameters for MSTI 2
  MSTI regional root                : <span class="hl">4098.52:54:23:34:19:00</span>
  Root cost                         : 20000
  Root port                         : ge-0/0/1</pre>
<p>The root port differs per instance, the regional root of each instance is the 4k switch of that instance, and the root cost of 20000 equals one 1G hop. That is a healthy load-sharing design.</p>

<div class="eg"><p><b>Worked example: failure.</b> AGG1 fails. ACC7's root port for MSTI 1 (ge-0/0/0) goes down. ACC7 already holds ge-0/0/1 as <b>alternate</b> in MSTI 1, so RSTP-style rapid transition moves it to forwarding within about a second; AGG2 (8k) becomes the MSTI 1 root. MSTI 2 never moved. When AGG1 returns, it wins the 4k election again and instance 1 moves back. You can force the failover in the lab by shutting AGG1's downlink.</p></div>

<h3>Design checklist</h3>
<ol>
<li>Group VLANs by <b>traffic volume</b>, so each instance carries about half of the load.</li>
<li>Keep the group small: 2 to 4 instances serve most campuses.</li>
<li>Leave the management VLAN on the IST and make the IST root the same switch as your busiest instance, or a dedicated one.</li>
<li>Document the VLAN-to-instance table in one place; it must be identical on every switch.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Putting both roots on the same switch, which gives you MSTP in name only. Making the inter-switch link a trunk that does not carry all VLANs, so one instance has no path. Using cost to fix a problem that is really a wrong root.</p></div>
<div class="exam"><p><b>Exam trap.</b> Per-instance cost needs the <code>msti N interface</code> hierarchy. A cost under <code>protocols mstp interface</code> applies to the CIST, and MSTIs only follow it where they are not overridden. Also remember: <b>lower</b> priority and <b>lower</b> cost win.</p></div>

<div class="scn"><h4>The root that moved to the cafeteria</h4><p>After a power cut, the whole campus slowed down. Show commands revealed that the MSTI 1 root was an unmanaged-looking access switch in the cafeteria. Its priority was the default 32k, and AGG1, which had been 4k, had come back with a factory-default configuration after a bad restore. Spanning tree did exactly what it should: the lowest ID won. Restoring AGG1's priority and setting 60k on all access switches fixed it.</p><p><b>Lesson:</b> back up priority configuration, and give access switches the worst priority so they cannot become root.</p></div>

<div class="iv"><p class="q">"How do you decide which VLANs go in which MSTI?"</p><p>By traffic and by gateway location. Split the heavy VLANs into two or three groups so each instance carries a similar load, put the root of each instance on the switch that holds those VLANs' gateways, give the other distribution switch the second-best priority as backup, and keep the mapping documented and identical everywhere.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Put each instance's root on the switch hosting that VLAN group's gateway.</li>
<li>Always configure backup roots (next best priority) and worst priority on access switches.</li>
<li>Root placement load shares; cost fine-tunes paths, per instance with <code>msti N interface x cost</code>.</li>
<li>Healthy output: different root port per MSTI on the access switch, regional root = the 4k switch.</li>
<li>A failed root moves only the instances it rooted.</li>
</ul></div>
`,hi:`
<p>Commands jaanna aadha kaam hai. Professional level engineer ko <b>design</b> karna aana chahiye: kaunse VLANs kis instance mein, roots kahan, aur link ya switch fail ho to kya hoga. Yeh chapter design ka hai.</p>

<h3>Rule 1: har instance ka root apne gateway ke paas</h3>
<p>Layer 3 gateways (irb interfaces) us instance ke root par hone chahiye jo unka VLAN carry karta hai. Tab kisi bhi access switch ka traffic tree ke sabse chhote raaste se gateway tak jaata hai, "upar, side mein, phir upar" nahi. Surat mein VLAN 10 ka gateway AGG1 par aur VLAN 20 ka AGG2 par hai, isliye AGG1 MSTI 1 ka root aur AGG2 MSTI 2 ka root.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Load sharing design">
<rect x="70" y="30" width="150" height="46" rx="10" fill="#bae6fd"/><text x="145" y="50" text-anchor="middle" class="svg-ink" font-size="13">AGG1</text><text x="145" y="67" text-anchor="middle" class="svg-muted" font-size="11">MSTI 1 root (4k), gw VLAN 10</text>
<rect x="420" y="30" width="150" height="46" rx="10" fill="#bae6fd"/><text x="495" y="50" text-anchor="middle" class="svg-ink" font-size="13">AGG2</text><text x="495" y="67" text-anchor="middle" class="svg-muted" font-size="11">MSTI 2 root (4k), gw VLAN 20</text>
<line x1="220" y1="53" x2="420" y2="53" stroke="#64748b" stroke-width="2"/><text x="320" y="46" text-anchor="middle" class="svg-muted" font-size="11">inter-switch link</text>
<rect x="245" y="170" width="150" height="46" rx="10" fill="#bbf7d0"/><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">ACC7</text><text x="320" y="207" text-anchor="middle" class="svg-muted" font-size="11">har MSTI ka root port alag</text>
<line x1="170" y1="76" x2="290" y2="170" stroke="#16a34a" stroke-width="3"/><text x="195" y="130" class="svg-accent" font-size="12">MSTI 1 forward</text>
<line x1="470" y1="76" x2="350" y2="170" stroke="#2563eb" stroke-width="3"/><text x="400" y="130" class="svg-accent" font-size="12">MSTI 2 forward</text>
</svg><p class="cap">Har instance alag uplink par forward karta hai; har uplink doosre instance ke liye blocked hai.</p></div>

<h3>Rule 2: har root ko next-best priority se backup do</h3>
<p>AGG1 mar jaaye to instance 1 ko predictably AGG2 par jaana chahiye. AGG2 ko MSTI 1 mein 8k aur AGG1 ko MSTI 2 mein 8k do. Sabse chhoti value jeetti hai, isliye 4k 8k ko harata hai; agar dono 4k switches mar jaayein to default 32k wala access switch root ban jayega, jo aap kabhi nahi chahte. Access switch par <code>bridge-priority 60k</code> bhi laga do taaki woh galti se root election na jeete.</p>

<h3>Rule 3: cost se tabhi steer karo jab roots kaafi na hon</h3>
<p>Root placement se hi ACC7 ke root ports alag ho jaate hain. Cost tab kaam aata hai jab do links <i>same</i> neighbour ke paas jaate hain ya doosre switch ke raaste ka path sasta dikhta hai. Cost CIST ke liye per interface (<code>protocols mstp interface ge-0/0/1 cost 40000</code>) ya per instance (<code>protocols mstp msti 2 interface ge-0/0/1 cost 40000</code>) set hota hai. Root path cost root ki taraf ke port costs ka jod hai, isliye ek link ka cost badhane se sirf usi raaste ka total badhta hai.</p>
<table class="cmp"><tr><th>Link speed</th><th>Default cost</th></tr>
<tr><td>10 Mbps</td><td>2000000</td></tr><tr><td>100 Mbps</td><td>200000</td></tr><tr><td>1 Gbps</td><td>20000</td></tr><tr><td>10 Gbps</td><td>2000</td></tr></table>

<h3>Asli output se design verify karo</h3>
<p>Surat fix ke baad ACC7. Instance 1 ge-0/0/0 par aur instance 2 ge-0/0/1 par forward karta hai.</p>
<pre class="out">lab@ACC7&gt; show spanning-tree interface msti 1
Interface     Port ID  Designated  Designated         Port   State  Role
                       port ID     bridge ID          Cost
ge-0/0/0      128:1    128:2       4097.525426341d00  20000  FWD    <span class="hl">ROOT</span>
ge-0/0/1      128:2    128:2       8193.525423341900  20000  BLK    ALT

lab@ACC7&gt; show spanning-tree bridge msti 2
STP bridge parameters for MSTI 2
  MSTI regional root                : <span class="hl">4098.52:54:23:34:19:00</span>
  Root cost                         : 20000
  Root port                         : ge-0/0/1</pre>
<p>Root port har instance mein alag hai, har instance ka regional root us instance ka 4k switch hai, aur 20000 ka root cost ek 1G hop ke barabar hai. Yeh healthy load-sharing design hai.</p>

<div class="eg"><p><b>Worked example: failure.</b> AGG1 fail ho gaya. ACC7 ka MSTI 1 ka root port (ge-0/0/0) down. ACC7 ke paas ge-0/0/1 MSTI 1 mein pehle se <b>alternate</b> hai, isliye RSTP-style rapid transition use lagbhag ek second mein forwarding mein le aata hai; AGG2 (8k) MSTI 1 ka root ban jaata hai. MSTI 2 kabhi hila nahi. AGG1 wapas aaye to woh 4k election dobara jeet leta hai aur instance 1 wapas chala jaata hai. Lab mein AGG1 ka downlink shut karke failover force kar sakte ho.</p></div>

<h3>Design checklist</h3>
<ol>
<li>VLANs ko <b>traffic volume</b> se group karo, taaki har instance lagbhag aadha load le.</li>
<li>Group chhota rakho: zyadatar campus ke liye 2 se 4 instances kaafi.</li>
<li>Management VLAN IST par rakho aur IST root wahi switch banao jo sabse busy instance ka hai, ya ek dedicated switch.</li>
<li>VLAN-to-instance table ek jagah document karo; har switch par identical honi chahiye.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Dono roots ek hi switch par rakhna, jisse naam ka MSTP milta hai. Inter-switch link aisa trunk jo saare VLANs carry nahi karta, to ek instance ka koi path nahi. Cost se woh problem theek karna jo asal mein galat root hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Per-instance cost ke liye <code>msti N interface</code> hierarchy chahiye. <code>protocols mstp interface</code> ke neeche cost CIST par lagta hai. Aur yaad rakho: <b>chhoti</b> priority aur <b>chhota</b> cost jeette hain.</p></div>

<div class="scn"><h4>Jo root cafeteria mein chala gaya</h4><p>Power cut ke baad poora campus slow ho gaya. Show commands se pata chala ki MSTI 1 ka root cafeteria ka ek access switch tha. Uski priority default 32k thi, aur AGG1, jo 4k tha, bad restore ke baad factory-default configuration ke saath wapas aaya tha. Spanning tree ne wahi kiya jo karna chahiye: lowest ID jeeta. AGG1 ki priority restore karke aur saare access switches par 60k laga kar theek hua.</p><p><b>Lesson:</b> priority configuration ka backup rakho, aur access switches ko sabse kharab priority do taaki root na ban sakein.</p></div>

<div class="iv"><p class="q">"Kaunsa VLAN kaunse MSTI mein jaayega, yeh kaise tay karte ho?"</p><p>Traffic aur gateway location se. Heavy VLANs ko do-teen groups mein baanto taaki har instance ka load lagbhag barabar ho, har instance ka root us switch par rakho jahan un VLANs ke gateways hain, doosre distribution switch ko second-best priority do, aur mapping document aur har jagah identical rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har instance ka root us VLAN group ke gateway wale switch par.</li>
<li>Backup roots (next best priority) aur access switches par worst priority hamesha configure karo.</li>
<li>Root placement load share karta hai; cost fine-tune karta hai, per instance <code>msti N interface x cost</code> se.</li>
<li>Healthy output: access switch par har MSTI mein alag root port, regional root = us instance ka 4k switch.</li>
<li>Fail hue root se sirf wahi instances hilte hain jinka woh root tha.</li>
</ul></div>
`}};export{e as default};