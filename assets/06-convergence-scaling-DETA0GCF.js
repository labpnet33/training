var e=(e,t,n)=>`<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="BGP PIC pointer structure"><rect x="20" y="30" width="200" height="130" rx="10" fill="#fde68a"/><text x="120" y="52" text-anchor="middle" class="svg-ink" font-size="13">`+t+`</text><text x="120" y="78" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.0/24 -> NH</text><text x="120" y="98" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.0/24 -> NH</text><text x="120" y="118" text-anchor="middle" class="svg-muted" font-size="12">... many prefixes -> NH</text><rect x="300" y="55" width="130" height="80" rx="10" fill="#bae6fd"/><text x="365" y="85" text-anchor="middle" class="svg-ink" font-size="13">Next hop entry</text><text x="365" y="105" text-anchor="middle" class="svg-muted" font-size="12">primary + backup</text><rect x="500" y="30" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="60" text-anchor="middle" class="svg-ink" font-size="13">PE-X primary</text><rect x="500" y="110" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="560" y="140" text-anchor="middle" class="svg-ink" font-size="13">PE-Y backup</text><line x1="220" y1="95" x2="300" y2="95" stroke="#64748b" stroke-width="2"/><line x1="430" y1="85" x2="500" y2="55" stroke="#64748b" stroke-width="2"/><line x1="430" y1="105" x2="500" y2="135" stroke="#64748b" stroke-dasharray="5 4" stroke-width="2"/><text x="320" y="182" text-anchor="middle" class="svg-accent" font-size="12">`+n+`</text></svg><p class="cap">`+e+`</p></div>`,t={id:`convergence-scaling`,h:{en:`Fast convergence and scaling: BFD, Add-Path, best-external, PIC`,hi:`Fast convergence aur scaling: BFD, Add-Path, best-external, PIC`},body:{en:`
<p>A carrier with a million customer routes cannot wait minutes after a link fails. SPCOR expects you to describe the tools that make BGP converge fast and scale without melting the router. The simulator does not implement these features, so everything below the headings is <b>conceptual teaching with reference configuration</b>; no counters or timers are shown because none were captured.</p>

<h3>Step 1: detect the failure quickly</h3>
<ul>
<li>BGP's own hold timer is 180 seconds by default (keepalive 60), as seen in the lab output "hold time is 180, keepalive interval is 60 seconds". Far too slow for failure detection.</li>
<li><b>fast-external-fallover</b> (on by default on IOS) resets a directly connected eBGP session the moment the interface goes down.</li>
<li><b>BFD</b> (Bidirectional Forwarding Detection) runs lightweight hellos between two neighbours and tells BGP to drop the session in a fraction of a second.</li>
</ul>
<pre class="code"><span class="c">! Reference configuration</span>
interface GigabitEthernet0/1
 bfd interval 300 min_rx 300 multiplier 3
router bgp 65000
 neighbor 192.0.2.2 fall-over bfd</pre>

<h3>Step 2: have a backup path ready</h3>
<p>The RR advertises only its <b>best</b> path per prefix. If PE-X fails, the other PEs have no second path in their table and must wait for a new update. Three tools change that:</p>
<dl class="terms">
<dt>BGP Add-Path</dt><dd>An RR can advertise more than one path for the same prefix (each with a path ID), so every PE learns the alternate exit up front.</dd>
<dt>Best-external</dt><dd>A PE whose best path is an iBGP path learned from another PE still advertises its own best <i>external</i> path, so the backup exists in the network.</dd>
<dt>Diverse path or unique RD (L3VPN)</dt><dd>In VPN designs each PE uses a different RD per VRF so that the RR treats paths to the same customer prefix as different prefixes and reflects all of them.</dd></dl>
<pre class="code"><span class="c">! Reference configuration (IOS XE style)</span>
router bgp 65000
 address-family ipv4 unicast
  bgp additional-paths select best 2
  bgp additional-paths send receive
  neighbor 10.20.255.2 advertise additional-paths best 2
  bgp advertise-best-external</pre>

<h3>Step 3: switch in a fixed time, not per prefix</h3>
<p>Without help, a PE that loses a next hop must update every prefix in its forwarding table one by one: a million prefixes, many seconds. <b>BGP PIC</b> (Prefix Independent Convergence) builds the forwarding table with a shared hierarchy: prefixes point to a <b>next-hop entry</b>, and that entry holds a primary and a pre-computed backup. When the primary next hop fails (a single IGP or BFD event), only the one entry is flipped to the backup, so all prefixes recover at once, independent of how many there are.</p>

@@D@@

<ul>
<li><b>PIC Edge</b> protects against the loss of an edge link or PE-CE session by switching to a backup path that already exists.</li>
<li><b>PIC Core</b> protects against a core failure by combining a hierarchical FIB with fast IGP re-convergence (and, in MPLS cores, fast reroute).</li>
</ul>
<p>PIC needs the backup path to <i>exist</i> in the BGP table (Add-Path, best-external or unique RD), so these features work as a team.</p>

<h3>Scaling the control plane</h3>
<ul>
<li><b>Peer groups and peer session/policy templates</b>: configure common settings once and apply to many neighbours; the router can also build a single update and send it to all members (update groups). Verify with <code>show ip bgp update-group</code>.</li>
<li><b>Route refresh</b> (default) instead of <code>soft-reconfiguration inbound</code>, which keeps an extra copy of every received route in memory.</li>
<li><b>maximum-prefix</b> limits how many prefixes a neighbour may send; essential on customer sessions.</li>
<li><b>Graceful restart / NSF</b> keeps forwarding while the BGP process restarts.</li>
<li><b>Optimal route reflection (ORR)</b> lets an RR calculate best paths from the point of view of a chosen IGP location, solving the suboptimal-exit problem of chapter 4.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A PE holds 800,000 prefixes whose best next hop is PE-X. Without PIC, losing PE-X means 800,000 individual FIB updates (seconds to tens of seconds). With PIC the router changes one next-hop entry to PE-Y and all 800,000 prefixes follow in one operation. The number of prefixes no longer affects the repair time.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Enabling Add-Path on an RR but not on the clients that must receive extra paths. Expecting PIC to work when the backup path never reached the PE. Setting aggressive BFD timers on a link that suffers short microbursts: the session flaps.</p></div>
<div class="exam"><p><b>Exam trap.</b> Add-Path <i>delivers</i> the extra path; PIC <i>programs</i> it in the FIB. They are not alternatives. Also, BFD detects failures; it does not repair them.</p></div>

<div class="scn"><h4>Four seconds became fifty milliseconds</h4><p>A carrier measured four seconds of loss when an edge router failed, because 600,000 prefixes were repaired one by one. After enabling best-external on PEs, Add-Path on the RRs and BGP PIC edge, the same test showed a brief blip. The change did not touch the IGP at all.</p><p><b>Lesson:</b> fast convergence is detect, have a backup, switch independent of table size.</p></div>

<div class="iv"><p class="q">"What is the difference between BGP Add-Path and BGP PIC?"</p><p>Add-Path advertises multiple paths for a prefix so backups exist on every router. PIC stores the primary and backup in a shared hierarchical forwarding structure and flips a single pointer when the primary next hop fails, so repair time does not depend on the number of prefixes. Together with BFD for fast detection they give sub-second recovery.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Detect failures with BFD and fast-external-fallover, not hold timers.</li>
<li>Add-Path, best-external and unique RD make backup paths exist.</li>
<li>PIC switches primary to backup in constant time.</li>
<li>Peer groups, update groups and maximum-prefix scale the control plane.</li>
<li>These features are described here as reference configuration only.</li>
</ul></div>
`.replace(`@@D@@`,e(`PIC: many prefixes share one next-hop entry that holds a primary and a backup.`,`Prefix table (FIB)`,`Primary fails: flip one entry, every prefix follows`)),hi:`
<p>Jis carrier ke paas million customer routes hain woh link fail hone ke baad minutes intezaar nahi kar sakta. SPCOR aapse un tools ko describe karne ki ummeed rakhta hai jo BGP ko fast converge karte hain aur router ko pighlaye bina scale karte hain. Simulator yeh features implement nahi karta, isliye headings ke neeche sab kuch <b>conceptual teaching aur reference configuration</b> hai; koi counters ya timers nahi dikhaye kyunki koi capture nahi hue.</p>

<h3>Step 1: failure jaldi detect karo</h3>
<ul>
<li>BGP ka apna hold timer default mein 180 seconds hai (keepalive 60), jaisa lab output "hold time is 180, keepalive interval is 60 seconds" mein dikha. Failure detection ke liye bahut dheema.</li>
<li><b>fast-external-fallover</b> (IOS par default on) directly connected eBGP session ko interface down hote hi reset kar deta hai.</li>
<li><b>BFD</b> (Bidirectional Forwarding Detection) do neighbours ke beech halke hellos chalata hai aur BGP ko second ke hisse mein session girane ko kehta hai.</li>
</ul>
<pre class="code"><span class="c">! Reference configuration</span>
interface GigabitEthernet0/1
 bfd interval 300 min_rx 300 multiplier 3
router bgp 65000
 neighbor 192.0.2.2 fall-over bfd</pre>

<h3>Step 2: backup path tayyar rakho</h3>
<p>RR har prefix ka sirf <b>best</b> path advertise karta hai. PE-X fail ho to doosre PEs ki table mein doosra path nahi hota aur naye update ka intezaar karna padta hai. Teen tools yeh badalte hain:</p>
<dl class="terms">
<dt>BGP Add-Path</dt><dd>RR ek hi prefix ke liye ek se zyada paths advertise kar sakta hai (har ek ka path ID), isliye har PE ko alternate exit pehle se pata hota hai.</dd>
<dt>Best-external</dt><dd>Jis PE ka best path doosre PE se seekha iBGP path hai woh phir bhi apna best <i>external</i> path advertise karta hai, isliye backup network mein maujood rehta hai.</dd>
<dt>Diverse path ya unique RD (L3VPN)</dt><dd>VPN designs mein har PE har VRF ke liye alag RD use karta hai taaki RR ek hi customer prefix ke paths ko alag prefixes maane aur sab reflect kare.</dd></dl>
<pre class="code"><span class="c">! Reference configuration (IOS XE style)</span>
router bgp 65000
 address-family ipv4 unicast
  bgp additional-paths select best 2
  bgp additional-paths send receive
  neighbor 10.20.255.2 advertise additional-paths best 2
  bgp advertise-best-external</pre>

<h3>Step 3: fixed time mein switch karo, per prefix nahi</h3>
<p>Madad ke bina, jis PE ka next hop kho jaata hai use forwarding table ke har prefix ko ek-ek karke update karna padta hai: million prefixes, kai seconds. <b>BGP PIC</b> (Prefix Independent Convergence) forwarding table ko shared hierarchy ke saath banata hai: prefixes ek <b>next-hop entry</b> ko point karte hain, aur us entry mein primary aur pehle se calculate kiya backup hota hai. Primary next hop fail ho (ek IGP ya BFD event) to sirf ek entry backup par flip hoti hai, isliye saare prefixes ek saath recover hote hain, chahe kitne bhi hon.</p>

@@D@@

<ul>
<li><b>PIC Edge</b> edge link ya PE-CE session ke loss se bachata hai, pehle se maujood backup path par switch karke.</li>
<li><b>PIC Core</b> core failure se bachata hai, hierarchical FIB ko fast IGP re-convergence (aur MPLS cores mein fast reroute) ke saath jodkar.</li>
</ul>
<p>PIC ko backup path BGP table mein <i>maujood</i> chahiye (Add-Path, best-external ya unique RD), isliye yeh features team ki tarah kaam karte hain.</p>

<h3>Control plane ko scale karna</h3>
<ul>
<li><b>Peer groups aur peer session/policy templates</b>: common settings ek baar configure karke bahut neighbours par lagao; router ek hi update bana kar saare members ko bhej bhi sakta hai (update groups). <code>show ip bgp update-group</code> se verify karo.</li>
<li><b>Route refresh</b> (default) <code>soft-reconfiguration inbound</code> ki jagah, jo har received route ki extra copy memory mein rakhta hai.</li>
<li><b>maximum-prefix</b> limit karta hai ki neighbour kitne prefixes bhej sakta hai; customer sessions par zaroori.</li>
<li><b>Graceful restart / NSF</b> BGP process restart hone ke dauraan forwarding chalu rakhta hai.</li>
<li><b>Optimal route reflection (ORR)</b> RR ko chune hue IGP location ke nazariye se best paths calculate karne deta hai, jisse chapter 4 ki suboptimal-exit problem solve hoti hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek PE ke paas 800,000 prefixes hain jinka best next hop PE-X hai. PIC ke bina PE-X khone ka matlab 800,000 individual FIB updates (seconds se tens of seconds). PIC ke saath router ek next-hop entry ko PE-Y par badalta hai aur saare 800,000 prefixes ek operation mein follow karte hain. Prefixes ki ginti ab repair time par asar nahi daalti.</p></div>

<div class="warn"><p><b>Common mistakes.</b> RR par Add-Path on karna lekin un clients par nahi jinhe extra paths receive karne hain. PIC se ummeed karna jabki backup path PE tak kabhi pahuncha hi nahi. Aise link par aggressive BFD timers lagana jo chhoti microbursts jhelta hai: session flap hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Add-Path extra path <i>deliver</i> karta hai; PIC use FIB mein <i>program</i> karta hai. Yeh alternatives nahi hain. Aur, BFD failures detect karta hai; repair nahi karta.</p></div>

<div class="scn"><h4>Chaar second se pachaas millisecond</h4><p>Ek carrier ne edge router fail hone par chaar second ka loss naapa, kyunki 600,000 prefixes ek-ek karke repair ho rahe the. PEs par best-external, RRs par Add-Path aur BGP PIC edge on karne ke baad wahi test mein sirf chhota blip dikha. Change ne IGP ko chhua bhi nahi.</p><p><b>Lesson:</b> fast convergence matlab detect, backup rakho, table size se independent switch karo.</p></div>

<div class="iv"><p class="q">"BGP Add-Path aur BGP PIC mein kya difference hai?"</p><p>Add-Path ek prefix ke multiple paths advertise karta hai taaki har router par backups maujood hon. PIC primary aur backup ko shared hierarchical forwarding structure mein rakhta hai aur primary next hop fail hone par ek pointer flip karta hai, isliye repair time prefixes ki ginti par depend nahi karta. Fast detection ke liye BFD ke saath milkar sub-second recovery dete hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Failures BFD aur fast-external-fallover se detect karo, hold timers se nahi.</li>
<li>Add-Path, best-external aur unique RD backup paths maujood banate hain.</li>
<li>PIC primary se backup constant time mein switch karta hai.</li>
<li>Peer groups, update groups aur maximum-prefix control plane scale karte hain.</li>
<li>Yeh features yahan sirf reference configuration ke roop mein describe hain.</li>
</ul></div>
`.replace(`@@D@@`,e(`PIC: bahut prefixes ek next-hop entry share karte hain jisme primary aur backup hai.`,`Prefix table (FIB)`,`Primary fail: ek entry flip karo, har prefix follow karta hai`))}};export{t as default};