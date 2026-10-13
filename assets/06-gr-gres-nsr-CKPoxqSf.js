var e={id:`gr-gres-nsr`,h:{en:`Routing Engine redundancy: GR, GRES, NSR and NSB`,hi:`Routing Engine redundancy: GR, GRES, NSR aur NSB`},body:{en:`
<p>So far we protected links and gateways. Now we protect the router's own brain. Some Junos platforms (MX routers, larger EX and QFX chassis, and EX Virtual Chassis) have <b>two Routing Engines (REs)</b>: a master that runs everything and a backup that waits. If the master RE crashes or is upgraded, the backup can take over. The key question is: what do the neighbours and the traffic notice? The answer depends on four features that build on each other.</p>

<h3>Refresher: control plane and forwarding plane</h3>
<p>The <b>RE</b> is the control plane: it runs routing protocols and builds the routing table. The <b>PFE</b> (Packet Forwarding Engine) is the forwarding plane: it moves packets using a forwarding table pushed down by the RE. Because they are separate, the PFE can keep forwarding for a while even when the RE is busy or restarting. The HA features below exploit that.</p>

<h3>The four features</h3>
<table class="cmp"><tr><th>Feature</th><th>What it does</th><th>After an RE switchover</th></tr>
<tr><td>Nothing configured</td><td>-</td><td>The PFE restarts: interfaces flap and every adjacency drops.</td></tr>
<tr><td><b>GRES</b> graceful Routing Engine switchover</td><td>The backup RE keeps a copy of the kernel state (interfaces, forwarding table)</td><td>PFE and interfaces stay up; the routing protocol process restarts, so adjacencies drop unless GR or NSR is also on.</td></tr>
<tr><td><b>GR</b> graceful restart (needs GRES to be useful)</td><td>The restarting router asks neighbours to keep forwarding while it rebuilds its routes</td><td>Neighbours act as <b>helpers</b> and keep routes during the restart window; no routing churn if all neighbours are GR-capable.</td></tr>
<tr><td><b>NSR</b> nonstop routing</td><td>Protocol state (adjacencies, BGP sessions, routes) is replicated to the backup RE continuously</td><td>Neighbours notice nothing: no helper needed, protocol state is already on the new master.</td></tr>
<tr><td><b>NSB</b> nonstop bridging</td><td>The same idea for Layer 2 control protocols (STP family, LACP, and others) on switches</td><td>The Layer 2 protocols continue without reconvergence.</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Master and backup Routing Engine">
<rect x="20" y="20" width="270" height="130" rx="10" fill="#bbf7d0"/><text x="155" y="45" text-anchor="middle" class="svg-ink" font-size="14">RE0  MASTER</text>
<rect x="40" y="60" width="230" height="30" rx="6" fill="#ddd6fe"/><text x="155" y="80" text-anchor="middle" class="svg-ink" font-size="12">routing protocols, CLI, kernel</text>
<rect x="40" y="100" width="230" height="30" rx="6" fill="#fde68a"/><text x="155" y="120" text-anchor="middle" class="svg-ink" font-size="12">kernel state  (GRES)</text>
<rect x="350" y="20" width="270" height="130" rx="10" fill="#bae6fd"/><text x="485" y="45" text-anchor="middle" class="svg-ink" font-size="14">RE1  BACKUP</text>
<rect x="370" y="60" width="230" height="30" rx="6" fill="#ddd6fe"/><text x="485" y="80" text-anchor="middle" class="svg-ink" font-size="12">protocol state replica  (NSR)</text>
<rect x="370" y="100" width="230" height="30" rx="6" fill="#fde68a"/><text x="485" y="120" text-anchor="middle" class="svg-ink" font-size="12">kernel state replica</text>
<line x1="290" y1="115" x2="350" y2="115" stroke="#7c3aed" stroke-width="2"/><line x1="290" y1="75" x2="350" y2="75" stroke="#7c3aed" stroke-width="2"/>
<rect x="150" y="175" width="340" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">PFE keeps forwarding during the switchover</text>
</svg><p class="cap">GRES replicates kernel state; NSR also replicates protocol state. The PFE keeps forwarding in both cases.</p></div>

<h3>Graceful restart in more detail</h3>
<p>In GR, the restarting router tells its neighbours "I am restarting, keep my routes for a short time". The neighbours, now <b>helpers</b>, keep forwarding to it. When the restarting router has relearned its routes it signals completion. GR relies on the <i>neighbours</i> being GR-capable and cooperative. It is configured per protocol or globally:</p>
<pre class="code">set routing-options graceful-restart</pre>
<p>Limits: the neighbour must support helper mode; the restart must finish within the restart time; and if the topology changes during the restart window, the helpers may stop helping. NSR avoids all of this because nothing needs to be rebuilt.</p>

<h3>NSR and its commit rules</h3>
<pre class="code"><span class="c">! on a dual-RE platform</span>
set chassis redundancy graceful-switchover
set routing-options nonstop-routing
set system commit synchronize
commit</pre>
<p>Junos enforces the dependencies. These errors are real output from the simulator, each one shows a rule you must memorise:</p>
<pre class="out">lab@DS1# set routing-options nonstop-routing
lab@DS1# commit check
[edit routing-options]
  'nonstop-routing'
    <span class="hl">nonstop routing needs graceful Routing Engine switchover: configure chassis redundancy graceful-switchover</span>
[edit routing-options]
  'nonstop-routing'
    <span class="hl">nonstop routing needs both Routing Engines committed together: configure 'system commit synchronize'</span>
error: configuration check-out failed

lab@DS1# set chassis redundancy graceful-switchover
lab@DS1# set system commit synchronize
lab@DS1# commit check
configuration check succeeds</pre>
<p>And the two features cannot be combined:</p>
<pre class="out">lab@R1# commit check
[edit routing-options]
  'graceful-restart'
    <span class="hl">graceful restart and nonstop routing cannot be enabled at the same time</span>
error: configuration check-out failed</pre>
<p>For nonstop bridging:</p>
<pre class="out">lab@R1# set protocols layer2-control nonstop-bridging
lab@R1# commit check
[edit protocols layer2-control]
  'nonstop-bridging'
    <span class="hl">nonstop bridging needs graceful Routing Engine switchover: configure chassis redundancy graceful-switchover</span></pre>
<table class="cmp"><tr><th>Feature</th><th>Needs</th><th>Cannot combine with</th></tr>
<tr><td>NSR</td><td>GRES and <code>system commit synchronize</code></td><td>Graceful restart</td></tr>
<tr><td>NSB</td><td>GRES (and commit synchronize)</td><td>-</td></tr>
<tr><td>GR</td><td>Capable neighbours (helpers)</td><td>NSR</td></tr></table>

<h3>Checking the state</h3>
<p>On a platform with two REs you would use <code>show system switchover</code> (is GRES enabled and is the backup ready?) and <code>show task replication</code> (is each protocol synchronised to the backup?), and <code>request chassis routing-engine master switch</code> to test. The simulator's routers have a single RE, so it answers honestly:</p>
<pre class="out">lab@R1&gt; show system switchover
error: no backup Routing Engine: graceful switchover information is not available

lab@R1&gt; show task replication
        Stateful Replication: Disabled
        RE mode: Master</pre>
<p>On real dual-RE hardware, "Stateful Replication: Enabled" with each protocol "Complete" is what you expect before an upgrade or a planned switchover.</p>

<div class="eg"><p><b>Worked example.</b> A core router runs OSPF with 20 neighbours and a BGP session carrying 800,000 routes. Without NSR, an RE crash would force all of them to reconverge, and a BGP full-table refresh takes minutes. With GRES and NSR, the backup already holds the OSPF and BGP state; after the switchover the neighbours do not see a single flap and forwarding never stops.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Turning on NSR without GRES or without commit synchronize; enabling NSR and graceful restart together; enabling GRES on a single-RE platform and expecting protection; never checking <code>show task replication</code> before a planned switchover.</p></div>
<div class="exam"><p><b>Exam trap.</b> GRES alone keeps interfaces and forwarding up but the routing process restarts. GR needs helper neighbours. NSR hides everything from neighbours and needs GRES plus commit synchronize. NSR and GR are mutually exclusive.</p></div>

<div class="scn"><h4>The RE crash nobody saw</h4><p>A service provider's edge router suffered a Routing Engine kernel panic during business hours. The router had GRES and NSR enabled and the BGP and OSPF state was synchronised. The backup RE became master within seconds, no BGP session reset, and customer traffic kept flowing. The monitoring system showed only an alarm about the failed RE. Hardware replacement happened the next morning.</p><p><b>Lesson:</b> NSR turns a control-plane crash into a maintenance ticket.</p></div>

<div class="iv"><p class="q">"Explain GRES, graceful restart and NSR and how they relate."</p><p>GRES lets the backup RE take over with the kernel and PFE state intact, so interfaces and forwarding survive but the routing process restarts. Graceful restart asks neighbours to keep forwarding while the router rebuilds its routes. NSR replicates protocol state to the backup so neighbours see nothing. NSR requires GRES and commit synchronize, and cannot be combined with graceful restart.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RE = control plane, PFE = forwarding plane; they fail independently.</li>
<li>GRES preserves kernel and PFE state; routing protocols still restart without GR or NSR.</li>
<li>GR depends on helper neighbours; NSR replicates protocol state and is transparent.</li>
<li>NSR and NSB need GRES; NSR also needs commit synchronize and excludes graceful restart.</li>
<li>Verify with show system switchover and show task replication.</li>
</ul></div>
`,hi:`
<p>Ab tak humne links aur gateways ko protect kiya. Ab router ke apne dimaag ko protect karte hain. Kuch Junos platforms (MX routers, bade EX aur QFX chassis, aur EX Virtual Chassis) mein <b>do Routing Engines (REs)</b> hote hain: ek master jo sab chalata hai aur ek backup jo intezaar karta hai. Master RE crash ho ya upgrade ho to backup kaam sambhal sakta hai. Asli sawal: neighbours aur traffic ko kya dikhta hai? Jawab chaar features par depend karta hai jo ek doosre par bante hain.</p>

<h3>Refresher: control plane aur forwarding plane</h3>
<p><b>RE</b> control plane hai: routing protocols chalata hai aur routing table banata hai. <b>PFE</b> (Packet Forwarding Engine) forwarding plane hai: RE se aayi forwarding table se packets move karta hai. Alag hone ki wajah se PFE kuch der forward karta reh sakta hai chahe RE busy ho ya restart ho raha ho. Neeche ke HA features isi ka faayda uthate hain.</p>

<h3>Chaar features</h3>
<table class="cmp"><tr><th>Feature</th><th>Kya karta hai</th><th>RE switchover ke baad</th></tr>
<tr><td>Kuch configured nahi</td><td>-</td><td>PFE restart: interfaces flap aur har adjacency girti hai.</td></tr>
<tr><td><b>GRES</b> graceful Routing Engine switchover</td><td>Backup RE kernel state (interfaces, forwarding table) ki copy rakhta hai</td><td>PFE aur interfaces up rehte hain; routing protocol process restart hota hai, isliye GR ya NSR ke bina adjacencies girti hain.</td></tr>
<tr><td><b>GR</b> graceful restart (GRES ke saath kaam ka)</td><td>Restart hone wala router neighbours se kehta hai ki routes rebuild hone tak forward karte raho</td><td>Neighbours <b>helper</b> bante hain aur restart window mein routes rakhte hain; sab neighbours GR-capable hon to routing churn nahi.</td></tr>
<tr><td><b>NSR</b> nonstop routing</td><td>Protocol state (adjacencies, BGP sessions, routes) backup RE par lagatar replicate hoti hai</td><td>Neighbours ko kuch pata nahi chalta: helper ki zaroorat nahi, protocol state naye master par pehle se hai.</td></tr>
<tr><td><b>NSB</b> nonstop bridging</td><td>Switches par Layer 2 control protocols (STP family, LACP aur aur) ke liye wahi idea</td><td>Layer 2 protocols bina reconvergence ke chalte rehte hain.</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Master aur backup Routing Engine">
<rect x="20" y="20" width="270" height="130" rx="10" fill="#bbf7d0"/><text x="155" y="45" text-anchor="middle" class="svg-ink" font-size="14">RE0  MASTER</text>
<rect x="40" y="60" width="230" height="30" rx="6" fill="#ddd6fe"/><text x="155" y="80" text-anchor="middle" class="svg-ink" font-size="12">routing protocols, CLI, kernel</text>
<rect x="40" y="100" width="230" height="30" rx="6" fill="#fde68a"/><text x="155" y="120" text-anchor="middle" class="svg-ink" font-size="12">kernel state  (GRES)</text>
<rect x="350" y="20" width="270" height="130" rx="10" fill="#bae6fd"/><text x="485" y="45" text-anchor="middle" class="svg-ink" font-size="14">RE1  BACKUP</text>
<rect x="370" y="60" width="230" height="30" rx="6" fill="#ddd6fe"/><text x="485" y="80" text-anchor="middle" class="svg-ink" font-size="12">protocol state replica  (NSR)</text>
<rect x="370" y="100" width="230" height="30" rx="6" fill="#fde68a"/><text x="485" y="120" text-anchor="middle" class="svg-ink" font-size="12">kernel state replica</text>
<line x1="290" y1="115" x2="350" y2="115" stroke="#7c3aed" stroke-width="2"/><line x1="290" y1="75" x2="350" y2="75" stroke="#7c3aed" stroke-width="2"/>
<rect x="150" y="175" width="340" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">Switchover ke dauran PFE forward karta rehta hai</text>
</svg><p class="cap">GRES kernel state replicate karta hai; NSR protocol state bhi. Dono mein PFE forward karta rehta hai.</p></div>

<h3>Graceful restart detail mein</h3>
<p>GR mein restart hone wala router neighbours se kehta hai "main restart ho raha hoon, meri routes thodi der rakho". Neighbours, ab <b>helpers</b>, uski taraf forward karte rehte hain. Restart hone wala router routes dobara seekh le to completion signal karta hai. GR <i>neighbours</i> ke GR-capable aur cooperative hone par depend karta hai. Yeh per protocol ya globally configure hota hai:</p>
<pre class="code">set routing-options graceful-restart</pre>
<p>Limits: neighbour ko helper mode support karna chahiye; restart restart time ke andar poora hona chahiye; aur restart window ke dauran topology badle to helpers madad band kar sakte hain. NSR in sab se bachata hai kyunki kuch rebuild karna hi nahi padta.</p>

<h3>NSR aur uske commit rules</h3>
<pre class="code"><span class="c">! dual-RE platform par</span>
set chassis redundancy graceful-switchover
set routing-options nonstop-routing
set system commit synchronize
commit</pre>
<p>Junos dependencies enforce karta hai. Yeh errors simulator ka real output hain, har ek ek rule dikhata hai jo yaad karna hai:</p>
<pre class="out">lab@DS1# set routing-options nonstop-routing
lab@DS1# commit check
[edit routing-options]
  'nonstop-routing'
    <span class="hl">nonstop routing needs graceful Routing Engine switchover: configure chassis redundancy graceful-switchover</span>
[edit routing-options]
  'nonstop-routing'
    <span class="hl">nonstop routing needs both Routing Engines committed together: configure 'system commit synchronize'</span>
error: configuration check-out failed

lab@DS1# set chassis redundancy graceful-switchover
lab@DS1# set system commit synchronize
lab@DS1# commit check
configuration check succeeds</pre>
<p>Aur dono features saath nahi chal sakte:</p>
<pre class="out">lab@R1# commit check
[edit routing-options]
  'graceful-restart'
    <span class="hl">graceful restart and nonstop routing cannot be enabled at the same time</span>
error: configuration check-out failed</pre>
<p>Nonstop bridging ke liye:</p>
<pre class="out">lab@R1# set protocols layer2-control nonstop-bridging
lab@R1# commit check
[edit protocols layer2-control]
  'nonstop-bridging'
    <span class="hl">nonstop bridging needs graceful Routing Engine switchover: configure chassis redundancy graceful-switchover</span></pre>
<table class="cmp"><tr><th>Feature</th><th>Chahiye</th><th>Saath nahi chal sakta</th></tr>
<tr><td>NSR</td><td>GRES aur <code>system commit synchronize</code></td><td>Graceful restart</td></tr>
<tr><td>NSB</td><td>GRES (aur commit synchronize)</td><td>-</td></tr>
<tr><td>GR</td><td>Capable neighbours (helpers)</td><td>NSR</td></tr></table>

<h3>State check karna</h3>
<p>Do REs wale platform par aap <code>show system switchover</code> (GRES enabled hai aur backup ready hai?), <code>show task replication</code> (har protocol backup se synchronised hai?) aur test ke liye <code>request chassis routing-engine master switch</code> use karoge. Simulator ke routers mein ek hi RE hai, isliye woh imaandaari se jawab deta hai:</p>
<pre class="out">lab@R1&gt; show system switchover
error: no backup Routing Engine: graceful switchover information is not available

lab@R1&gt; show task replication
        Stateful Replication: Disabled
        RE mode: Master</pre>
<p>Asli dual-RE hardware par upgrade ya planned switchover se pehle "Stateful Replication: Enabled" aur har protocol "Complete" expected hai.</p>

<div class="eg"><p><b>Worked example.</b> Core router 20 neighbours ke saath OSPF aur 8,00,000 routes wala BGP session chalata hai. NSR ke bina RE crash par sab ko reconverge karna padta, aur BGP full-table refresh mein minutes lagte hain. GRES aur NSR ke saath backup ke paas OSPF aur BGP state pehle se hai; switchover ke baad neighbours ko ek bhi flap nahi dikhta aur forwarding kabhi nahi rukti.</p></div>

<div class="warn"><p><b>Common mistakes.</b> GRES ya commit synchronize ke bina NSR on karna; NSR aur graceful restart ek saath enable karna; single-RE platform par GRES enable karke protection ki ummeed karna; planned switchover se pehle <code>show task replication</code> kabhi na dekhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Akela GRES interfaces aur forwarding up rakhta hai lekin routing process restart hota hai. GR ko helper neighbours chahiye. NSR neighbours se sab chhupa leta hai aur GRES plus commit synchronize chahiye. NSR aur GR ek doosre ko exclude karte hain.</p></div>

<div class="scn"><h4>RE crash jo kisi ne nahi dekha</h4><p>Ek service provider ke edge router mein business hours mein Routing Engine kernel panic aaya. Router par GRES aur NSR enabled the aur BGP aur OSPF state synchronised thi. Backup RE kuch seconds mein master ban gaya, koi BGP session reset nahi hua, aur customer traffic chalta raha. Monitoring system ne sirf failed RE ka alarm dikhaya. Hardware replacement agli subah hua.</p><p><b>Lesson:</b> NSR control-plane crash ko maintenance ticket bana deta hai.</p></div>

<div class="iv"><p class="q">"GRES, graceful restart aur NSR samjhao aur woh kaise related hain."</p><p>GRES backup RE ko kernel aur PFE state ke saath takeover karne deta hai, isliye interfaces aur forwarding bachte hain lekin routing process restart hota hai. Graceful restart neighbours se kehta hai ki router routes rebuild kare tab tak forward karte raho. NSR protocol state backup par replicate karta hai taaki neighbours kuch na dekhein. NSR ko GRES aur commit synchronize chahiye, aur graceful restart ke saath nahi chalta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RE = control plane, PFE = forwarding plane; woh alag-alag fail hote hain.</li>
<li>GRES kernel aur PFE state bachata hai; GR ya NSR ke bina routing protocols restart hote hain.</li>
<li>GR helper neighbours par depend karta hai; NSR protocol state replicate karta hai aur transparent hai.</li>
<li>NSR aur NSB ko GRES chahiye; NSR ko commit synchronize bhi chahiye aur graceful restart exclude hota hai.</li>
<li>show system switchover aur show task replication se verify karo.</li>
</ul></div>
`}};export{e as default};