var e={id:`pim-sparse-mode`,h:{en:`PIM sparse mode: shared tree, register and shortest-path tree`,hi:`PIM sparse mode: shared tree, register aur shortest-path tree`},body:{en:`
<p><b>PIM</b> (Protocol Independent Multicast) is the router-to-router protocol that builds the tree a multicast stream follows. "Protocol independent" means it does not run its own routing: it asks the unicast routing table which interface leads to a source or to the RP. <b>Sparse mode</b> (PIM-SM) assumes receivers are few and scattered, so nothing flows until someone explicitly joins. That is the right default for enterprises and the mode the exam focuses on. (Dense mode floods and prunes, bidirectional PIM and SSM are variants covered elsewhere.)</p>

<h3>Neighbours and the designated router</h3>
<p>Routers on a link send <b>hellos</b> to 224.0.0.13 and become PIM neighbours. On a multi-access LAN the router with the highest <b>DR priority</b> (then the highest IP address) is the <b>designated router (DR)</b>. The DR on the receiver LAN sends joins toward the RP; the DR on the source LAN registers the source with the RP.</p>
<pre class="code">set protocols pim interface all              <span class="c"># sparse is the default mode on Junos</span>
set protocols pim interface lo0.0            <span class="c"># include the loopback if it is an RP address</span></pre>
<pre class="out">lab@R2&gt; show pim neighbors
Instance: PIM.master
Interface           IP V Mode        Option       Uptime Neighbor addr
ge-0/0/0.0           4 2             HPLGT      00:00:10 10.61.12.1
ge-0/0/1.0           4 2             HPLGT      00:00:10 10.61.23.2

lab@R2&gt; show pim interfaces
Name                Stat Mode IP V State        NbrCnt JoinCnt(sg/*g) DR address
ge-0/0/0.0          Up   S    4  2 DR,NotCap         1 0/0            10.61.12.2
ge-0/0/1.0          Up   S    4  2 NotDR,NotCap      1 1/1            10.61.23.2
lo0.0               Up   S    4  2 DR,NotCap         0 0/0            10.61.255.2</pre>
<p>Both neighbours are listed, the mode is S (sparse) and version 2. On R2 ge-0/0/1.0 carries one (S,G) and one (*,G) join, which is the active class stream.</p>

<h3>The life of a stream, step by step</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="PIM-SM steps">
<rect x="20" y="85" width="80" height="50" rx="8" fill="#fde68a"/><text x="60" y="115" text-anchor="middle" class="svg-ink" font-size="13">SRC</text>
<rect x="130" y="85" width="80" height="50" rx="8" fill="#bae6fd"/><text x="170" y="108" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="170" y="124" text-anchor="middle" class="svg-muted" font-size="11">first hop</text>
<rect x="260" y="85" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="305" y="108" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="305" y="124" text-anchor="middle" class="svg-muted" font-size="11">RP</text>
<rect x="400" y="85" width="80" height="50" rx="8" fill="#bae6fd"/><text x="440" y="108" text-anchor="middle" class="svg-ink" font-size="13">R3</text><text x="440" y="124" text-anchor="middle" class="svg-muted" font-size="11">last hop</text>
<rect x="530" y="85" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="575" y="115" text-anchor="middle" class="svg-ink" font-size="13">Receivers</text>
<line x1="100" y1="110" x2="130" y2="110" stroke="#64748b" stroke-width="2"/><line x1="210" y1="110" x2="260" y2="110" stroke="#64748b" stroke-width="2"/><line x1="350" y1="110" x2="400" y2="110" stroke="#64748b" stroke-width="2"/><line x1="480" y1="110" x2="530" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="230" y="75" text-anchor="middle" class="svg-accent" font-size="11">2 Register</text>
<text x="375" y="75" text-anchor="middle" class="svg-accent" font-size="11">1 (*,G) join</text>
<text x="230" y="150" text-anchor="middle" class="svg-accent" font-size="11">3 (S,G) join + Register-Stop</text>
<text x="375" y="150" text-anchor="middle" class="svg-accent" font-size="11">4 data, then SPT</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">receiver joins first or source starts first - order does not matter</text>
</svg><p class="cap">Shared tree to the RP, register from the source, then shortest-path tree.</p></div>
<ol>
<li><b>Receiver joins.</b> The last-hop router (DR) sends a <b>(*,G) join</b> hop by hop toward the RP. The path it creates is the <b>rendezvous-point tree (RPT)</b>, also called the shared tree.</li>
<li><b>Source starts.</b> The first-hop router encapsulates the data in unicast <b>Register</b> messages to the RP. On Junos the register tunnel interfaces <code>pime</code> (encapsulation) and <code>pimd</code> (decapsulation) appear in <code>show pim interfaces</code>.</li>
<li><b>RP joins the source.</b> The RP sends an <b>(S,G) join</b> toward the source and then a <b>Register-Stop</b>, so data now flows natively source to RP to receivers.</li>
<li><b>Switch to the SPT.</b> When the first packet reaches the last-hop router, it can join the source directly, forming the <b>shortest-path tree (SPT)</b>, and prune the source off the shared tree. <code>set protocols pim spt-threshold infinity POLICY</code> keeps chosen groups on the RPT.</li>
</ol>
<p>All of this uses the <b>RPF check</b>: a router accepts data from source S only on the interface it would itself use to reach S (the RPF interface), and sends joins only out of that interface to a PIM neighbour. If PIM is not running there, or the unicast route points somewhere else, no tree forms.</p>

<h3>Reading the join and forwarding state</h3>
<pre class="out">lab@R2&gt; show pim join extensive
Group: 239.61.1.1
    Source: *
    RP: 10.61.255.2
    Flags: sparse,rptree,wildcard
    Upstream interface: Local
    Upstream state: <span class="hl">Local RP</span>
    Downstream neighbors:
        Interface: ge-0/0/1.0
            10.61.23.2 State: Join Flags: SRW Timeout: 190
Group: 239.61.1.1
    Source: 10.61.10.50
    Flags: sparse,spt
    Upstream interface: ge-0/0/0.0
    Upstream neighbor: 10.61.12.1
    Upstream state: Local RP, Join to Source

lab@R3&gt; show multicast route extensive
Group: 239.61.1.1
    Source: 10.61.10.50/32
    Upstream interface: ge-0/0/0.0
    Downstream interface list:
        ge-0/0/1.0
    Statistics: 0 kBps, 1 pps, 10 packets
    Upstream protocol: PIM
    Route state: Active
    Forwarding state: <span class="hl">Forwarding</span></pre>
<p><code>show pim join</code> is the control plane (who asked), <code>show multicast route</code> is the forwarding cache (what is being copied now). A (*,G) with no (S,G) means receivers are waiting and no source has been seen; an (S,G) with an empty downstream list means the source is active but nobody downstream wants it.</p>

<div class="eg"><p><b>Worked example.</b> PC1 joins 239.61.1.1. R3 sends (*,G) to R2, the RP, creating state on R3 and R2. SRC sends a packet; R1 registers it to R2; R2 joins (S,G) toward R1 and sends Register-Stop. Traffic flows SRC to R1 to R2 to R3. In this three-router chain the SPT and RPT paths are the same, so R3 keeps the same upstream interface when it switches.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting PIM on one hop, especially the loopback holding the RP address or the LAN-facing interface. A neighbour that is not listed in <code>show pim neighbors</code> will never receive joins. Another mistake is running PIM on the receiver LAN of a router but forgetting <code>igmp</code> there; on Junos IGMP starts with PIM on that interface.</p></div>
<div class="exam"><p><b>Exam trap.</b> The shared tree is (*,G), rooted at the RP; the source tree is (S,G), rooted at the source. A Register is unicast to the RP; joins are multicast to 224.0.0.13 hop by hop. The RPF check applies to data and to joins.</p></div>

<div class="scn"><h4>Joins went out, nothing came back</h4><p>A new branch router had PIM on its LAN but not on the uplink. The RP was reachable by OSPF, so unicast worked; yet <code>show pim join</code> listed the group with no upstream neighbour and the stream never arrived. Enabling <code>pim interface all</code> created the neighbour and the (*,G) join went out.</p><p><b>Lesson:</b> PIM must run on every interface along the RPF path, even when unicast already works.</p></div>

<div class="iv"><p class="q">"Describe how PIM sparse mode delivers a stream from a new source to existing receivers."</p><p>Receivers' DR has already joined (*,G) toward the RP. The source's DR sends the data in Register messages to the RP. The RP joins (S,G) toward the source and sends Register-Stop, so data flows natively to the RP and down the shared tree. The last-hop router then switches to the SPT and prunes the source from the shared tree. All of it is validated by the RPF check.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PIM uses the unicast table for RPF and runs sparse mode by default on Junos.</li>
<li>(*,G) builds the shared tree to the RP; (S,G) builds the source tree.</li>
<li>The first-hop router registers the source; the RP answers with an (S,G) join and Register-Stop.</li>
<li>The last-hop router can switch to the SPT; spt-threshold infinity prevents it.</li>
<li>Use show pim neighbors, show pim join extensive and show multicast route to verify.</li>
</ul></div>
`,hi:`
<p><b>PIM</b> (Protocol Independent Multicast) router-to-router protocol hai jo woh tree banata hai jise multicast stream follow karti hai. "Protocol independent" ka matlab woh apni routing nahi chalata: woh unicast routing table se poochta hai ki source ya RP tak kaunsa interface jaata hai. <b>Sparse mode</b> (PIM-SM) maanta hai ki receivers kam aur bikhre hue hain, isliye jab tak koi explicitly join na kare kuch nahi bahta. Enterprises ke liye yahi sahi default hai aur exam isi par focus karta hai. (Dense mode flood aur prune karta hai, bidirectional PIM aur SSM variants hain jo alag cover hote hain.)</p>

<h3>Neighbours aur designated router</h3>
<p>Link par routers 224.0.0.13 ko <b>hellos</b> bhejte hain aur PIM neighbours ban jaate hain. Multi-access LAN par highest <b>DR priority</b> (phir highest IP address) wala router <b>designated router (DR)</b> hota hai. Receiver LAN ka DR RP ki taraf joins bhejta hai; source LAN ka DR source ko RP ke paas register karta hai.</p>
<pre class="code">set protocols pim interface all              <span class="c"># Junos par sparse default mode hai</span>
set protocols pim interface lo0.0            <span class="c"># loopback RP address ho to use shamil karo</span></pre>
<pre class="out">lab@R2&gt; show pim neighbors
Instance: PIM.master
Interface           IP V Mode        Option       Uptime Neighbor addr
ge-0/0/0.0           4 2             HPLGT      00:00:10 10.61.12.1
ge-0/0/1.0           4 2             HPLGT      00:00:10 10.61.23.2

lab@R2&gt; show pim interfaces
Name                Stat Mode IP V State        NbrCnt JoinCnt(sg/*g) DR address
ge-0/0/0.0          Up   S    4  2 DR,NotCap         1 0/0            10.61.12.2
ge-0/0/1.0          Up   S    4  2 NotDR,NotCap      1 1/1            10.61.23.2
lo0.0               Up   S    4  2 DR,NotCap         0 0/0            10.61.255.2</pre>
<p>Dono neighbours listed hain, mode S (sparse) aur version 2 hai. R2 par ge-0/0/1.0 ek (S,G) aur ek (*,G) join carry karta hai, jo active class stream hai.</p>

<h3>Stream ki zindagi, step by step</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="PIM-SM steps">
<rect x="20" y="85" width="80" height="50" rx="8" fill="#fde68a"/><text x="60" y="115" text-anchor="middle" class="svg-ink" font-size="13">SRC</text>
<rect x="130" y="85" width="80" height="50" rx="8" fill="#bae6fd"/><text x="170" y="108" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="170" y="124" text-anchor="middle" class="svg-muted" font-size="11">first hop</text>
<rect x="260" y="85" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="305" y="108" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="305" y="124" text-anchor="middle" class="svg-muted" font-size="11">RP</text>
<rect x="400" y="85" width="80" height="50" rx="8" fill="#bae6fd"/><text x="440" y="108" text-anchor="middle" class="svg-ink" font-size="13">R3</text><text x="440" y="124" text-anchor="middle" class="svg-muted" font-size="11">last hop</text>
<rect x="530" y="85" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="575" y="115" text-anchor="middle" class="svg-ink" font-size="13">Receivers</text>
<line x1="100" y1="110" x2="130" y2="110" stroke="#64748b" stroke-width="2"/><line x1="210" y1="110" x2="260" y2="110" stroke="#64748b" stroke-width="2"/><line x1="350" y1="110" x2="400" y2="110" stroke="#64748b" stroke-width="2"/><line x1="480" y1="110" x2="530" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="230" y="75" text-anchor="middle" class="svg-accent" font-size="11">2 Register</text>
<text x="375" y="75" text-anchor="middle" class="svg-accent" font-size="11">1 (*,G) join</text>
<text x="230" y="150" text-anchor="middle" class="svg-accent" font-size="11">3 (S,G) join + Register-Stop</text>
<text x="375" y="150" text-anchor="middle" class="svg-accent" font-size="11">4 data, phir SPT</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">receiver pehle join kare ya source pehle shuru ho - order matter nahi karta</text>
</svg><p class="cap">RP tak shared tree, source se register, phir shortest-path tree.</p></div>
<ol>
<li><b>Receiver join karta hai.</b> Last-hop router (DR) RP ki taraf hop by hop <b>(*,G) join</b> bhejta hai. Jo path banta hai woh <b>rendezvous-point tree (RPT)</b> hai, jise shared tree bhi kehte hain.</li>
<li><b>Source shuru hota hai.</b> First-hop router data ko RP ko unicast <b>Register</b> messages mein encapsulate karta hai. Junos par register tunnel interfaces <code>pime</code> (encapsulation) aur <code>pimd</code> (decapsulation) <code>show pim interfaces</code> mein dikhte hain.</li>
<li><b>RP source ko join karta hai.</b> RP source ki taraf <b>(S,G) join</b> bhejta hai aur phir <b>Register-Stop</b>, isliye data ab natively source se RP se receivers tak bahta hai.</li>
<li><b>SPT par switch.</b> Jab pehla packet last-hop router tak pahunchta hai, woh source ko seedha join kar sakta hai, jisse <b>shortest-path tree (SPT)</b> banta hai, aur source ko shared tree se prune kar deta hai. <code>set protocols pim spt-threshold infinity POLICY</code> chune hue groups ko RPT par rakhta hai.</li>
</ol>
<p>Yeh sab <b>RPF check</b> use karta hai: router source S ka data sirf us interface par accept karta hai jo woh khud S tak pahunchne ke liye use karta (RPF interface), aur joins sirf usi interface se PIM neighbour ko bhejta hai. Wahan PIM na chale, ya unicast route kahin aur point kare, to koi tree nahi banta.</p>

<h3>Join aur forwarding state padhna</h3>
<pre class="out">lab@R2&gt; show pim join extensive
Group: 239.61.1.1
    Source: *
    RP: 10.61.255.2
    Flags: sparse,rptree,wildcard
    Upstream interface: Local
    Upstream state: <span class="hl">Local RP</span>
    Downstream neighbors:
        Interface: ge-0/0/1.0
            10.61.23.2 State: Join Flags: SRW Timeout: 190
Group: 239.61.1.1
    Source: 10.61.10.50
    Flags: sparse,spt
    Upstream interface: ge-0/0/0.0
    Upstream neighbor: 10.61.12.1
    Upstream state: Local RP, Join to Source

lab@R3&gt; show multicast route extensive
Group: 239.61.1.1
    Source: 10.61.10.50/32
    Upstream interface: ge-0/0/0.0
    Downstream interface list:
        ge-0/0/1.0
    Statistics: 0 kBps, 1 pps, 10 packets
    Upstream protocol: PIM
    Route state: Active
    Forwarding state: <span class="hl">Forwarding</span></pre>
<p><code>show pim join</code> control plane hai (kisne maanga), <code>show multicast route</code> forwarding cache hai (abhi kya copy ho raha hai). Bina (S,G) ke (*,G) ka matlab receivers wait kar rahe hain aur koi source nahi dikha; khaali downstream list wala (S,G) ka matlab source active hai lekin neeche koi nahi chahta.</p>

<div class="eg"><p><b>Worked example.</b> PC1 239.61.1.1 join karta hai. R3 RP, R2, ko (*,G) bhejta hai, R3 aur R2 par state banti hai. SRC ek packet bhejta hai; R1 use R2 ko register karta hai; R2 R1 ki taraf (S,G) join bhejta hai aur Register-Stop. Traffic SRC se R1 se R2 se R3 bahta hai. Is teen-router chain mein SPT aur RPT paths same hain, isliye switch karne par R3 ka upstream interface wahi rehta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Ek hop par PIM bhool jaana, khaaskar RP address wala loopback ya LAN-facing interface. <code>show pim neighbors</code> mein jo neighbour listed nahi, use joins kabhi nahi milenge. Ek aur galti: router ke receiver LAN par PIM chalana lekin wahan <code>igmp</code> bhool jaana; Junos par us interface par PIM ke saath IGMP shuru ho jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Shared tree (*,G) hai, RP par rooted; source tree (S,G) hai, source par rooted. Register RP ko unicast jaata hai; joins 224.0.0.13 par hop by hop multicast hote hain. RPF check data aur joins dono par lagta hai.</p></div>

<div class="scn"><h4>Joins gaye, wapas kuch nahi aaya</h4><p>Ek naye branch router par LAN par PIM tha lekin uplink par nahi. RP OSPF se reachable tha, isliye unicast chalta tha; phir bhi <code>show pim join</code> ne group ko bina upstream neighbour ke list kiya aur stream kabhi nahi aayi. <code>pim interface all</code> enable karne se neighbour bana aur (*,G) join gaya.</p><p><b>Lesson:</b> RPF path ke har interface par PIM chalna chahiye, chahe unicast pehle se chal raha ho.</p></div>

<div class="iv"><p class="q">"PIM sparse mode naye source se maujooda receivers tak stream kaise deliver karta hai, batao."</p><p>Receivers ka DR pehle se RP ki taraf (*,G) join kar chuka hota hai. Source ka DR data ko Register messages mein RP ko bhejta hai. RP source ki taraf (S,G) join bhejta hai aur Register-Stop, isliye data natively RP tak aur shared tree se neeche bahta hai. Phir last-hop router SPT par switch karta hai aur source ko shared tree se prune karta hai. Sab kuch RPF check se validate hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PIM RPF ke liye unicast table use karta hai aur Junos par sparse mode default hai.</li>
<li>(*,G) RP tak shared tree banata hai; (S,G) source tree.</li>
<li>First-hop router source register karta hai; RP (S,G) join aur Register-Stop se jawab deta hai.</li>
<li>Last-hop router SPT par switch kar sakta hai; spt-threshold infinity use rokta hai.</li>
<li>Verify ke liye show pim neighbors, show pim join extensive aur show multicast route.</li>
</ul></div>
`}};export{e as default};