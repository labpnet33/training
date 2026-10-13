var e={id:`bfd-convergence`,h:{en:`Convergence: timers, BFD, link debounce and graceful restart`,hi:`Convergence: timers, BFD, link debounce aur graceful restart`},body:{en:`
<p>Imagine you call a colleague every ten seconds to check they are alright, and you only raise the alarm after four missed calls. If they faint, you find out 40 seconds later. A heart-rate monitor, by contrast, beeps many times a second and alarms within a fraction of a second. OSPF hellos are the phone calls. <b>BFD</b> (Bidirectional Forwarding Detection) is the heart-rate monitor. In a data center where a single stalled path can freeze thousands of transactions, the difference between 40 seconds and 150 milliseconds is the difference between an incident report and nobody noticing.</p>

<h3>The four phases of convergence</h3>
<ol>
<li><b>Detect</b> that a link or neighbour has failed.</li>
<li><b>Propagate</b> the news: OSPF floods a new LSA, BGP sends a withdrawal.</li>
<li><b>Compute</b> new best paths (SPF run or BGP best-path).</li>
<li><b>Install</b> the result in the hardware forwarding table (FIB).</li>
</ol>
<p>In a small spine-leaf underlay, phases 2 to 4 take tens of milliseconds, and ECMP makes phase 4 trivial because the surviving next hop is already installed. <b>Detection dominates.</b> That is where you spend your effort.</p>

<h3>Default protocol timers</h3>
<table class="cmp"><tr><th>Protocol</th><th>Hello / keepalive</th><th>Dead / hold</th></tr>
<tr><td>OSPF (point-to-point)</td><td>10 s</td><td>40 s</td></tr>
<tr><td>IS-IS</td><td>10 s</td><td>30 s (3 × hello)</td></tr>
<tr><td>BGP</td><td>60 s</td><td>180 s</td></tr>
</table>
<p>You could shrink the hellos, but protocol hellos are handled by the supervisor CPU. Hundreds of neighbours with sub-second hellos load the CPU and can cause false flaps during a busy moment. BFD solves this more cleanly.</p>

<h3>When the link simply goes down</h3>
<p>Good news first: when a fibre between leaf and spine is cut, both optics lose light, the interface goes down, and OSPF or BGP tears the neighbour down <b>immediately</b>, without waiting for the dead timer. On Nexus the only delay is <b>link debounce</b>, a short timer (100 ms by default) that filters very brief glitches before declaring the port down. You can change it per interface with <code>link debounce time</code> (in milliseconds). IOS calls a similar idea carrier delay; on NX-OS the <code>carrier-delay</code> command applies to VLAN interfaces.</p>

<h3>When the link stays up: why BFD exists</h3>
<p>Many real failures do not drop the light:</p>
<ul>
<li>An optical transport or media converter in the middle keeps the local link up while the far side is dead.</li>
<li>One fibre strand of a pair breaks: traffic fails in one direction only.</li>
<li>The remote switch's forwarding hardware hangs while its ports stay up.</li>
</ul>
<p>In all these cases only the protocol dead timer would notice, 40 seconds later for OSPF, 180 for BGP. <b>BFD</b> sends tiny UDP packets between the two interfaces every few tens of milliseconds, handled by the line card rather than the supervisor. If a configured number of packets is missed, BFD tells its clients (OSPF, BGP, IS-IS) and they drop the neighbour at once.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Detection time with and without BFD">
<text x="20" y="40" class="svg-ink" font-size="13">OSPF dead timer</text>
<rect x="170" y="25" width="440" height="24" rx="4" fill="#fed7aa"/><text x="390" y="42" text-anchor="middle" class="svg-ink" font-size="12">up to 40 s</text>
<text x="20" y="95" class="svg-ink" font-size="13">BGP hold timer</text>
<rect x="170" y="80" width="440" height="24" rx="4" fill="#fde68a"/><text x="390" y="97" text-anchor="middle" class="svg-ink" font-size="12">up to 180 s (bar not to scale)</text>
<text x="20" y="150" class="svg-ink" font-size="13">BFD 50 ms × 3</text>
<rect x="170" y="135" width="12" height="24" rx="3" fill="#bbf7d0"/><text x="195" y="152" class="svg-accent" font-size="12">about 150 ms</text>
</svg><p class="cap">BFD turns silent failures from tens of seconds into a fraction of a second.</p></div>

<h3>Configuring BFD on NX-OS</h3>
<pre class="code"><span class="c">! Enable the feature once per switch</span>
feature bfd
<span class="c">! On each fabric interface</span>
interface Ethernet1/1
  no ip redirects
  bfd interval 50 min_rx 50 multiplier 3
  ip ospf bfd
<span class="c">! Or enable BFD for every OSPF interface at once</span>
router ospf UNDERLAY
  bfd
<span class="c">! eBGP underlay: per neighbour</span>
router bgp 65001
  neighbor 10.1.1.0
    bfd</pre>
<ul>
<li><b>interval 50 min_rx 50 multiplier 3</b>: send every 50 ms, accept packets every 50 ms, declare down after 3 misses = <b>150 ms</b>. These are also the NX-OS defaults.</li>
<li><b>no ip redirects</b>: NX-OS requires ICMP redirects to be disabled on interfaces that run BFD (the BFD echo function relies on it). Forgetting it is the most common BFD configuration error on Nexus.</li>
<li>Both ends must run BFD. The negotiated rate is the slower of the two sides.</li>
</ul>
<pre class="out">LEAF1# show bfd neighbors
OurAddr         NeighAddr       LD/RD                 RH/RS           Holdown(mult)     State       Int
<span class="hl">10.1.1.1        10.1.1.0        1090519041/1090519042 Up              142(3)            Up          Eth1/1
10.1.2.1        10.1.2.0        1090519043/1090519044 Up              139(3)            Up          Eth1/2</span>

LEAF1# show ip ospf interface Ethernet1/1 | include BFD
    BFD is enabled</pre>

<h3>SPF and LSA throttling</h3>
<p>After detection, OSPF waits a short, adaptive delay before running SPF, so a burst of changes is processed in one calculation. NX-OS controls this with <code>timers throttle spf</code> (start, hold, maximum, in milliseconds) and <code>timers throttle lsa</code>. A small start value (for example 50 ms) gives quick reaction to a single failure; the hold and maximum values back off if the network keeps flapping. Change these only with a clear reason and consistently across the fabric.</p>

<h3>Graceful restart versus BFD</h3>
<p>They answer different questions:</p>
<table class="cmp"><tr><th></th><th>BFD</th><th>Graceful restart (GR / NSF)</th></tr>
<tr><td>Goal</td><td>Detect a real forwarding failure fast and reroute</td><td>Keep forwarding through a switch whose control plane restarts</td></tr>
<tr><td>When useful</td><td>Link, optic, line card or remote box failure</td><td>Supervisor switchover, process restart, some upgrades</td></tr>
<tr><td>Neighbour behaviour</td><td>Drop the adjacency immediately</td><td>Act as "helper": keep using the old routes for a grace period</td></tr>
<tr><td>NX-OS default</td><td>Off until configured</td><td>Enabled for OSPF and BGP</td></tr>
</table>
<p>They coexist: if the data plane really stops, BFD fails and traffic reroutes; if only the control plane restarts on a dual-supervisor spine while hardware keeps forwarding, GR avoids an unnecessary reroute. On single-supervisor leaves a reload is a genuine failure, and fast rerouting around it through ECMP is what you want.</p>

<div class="eg"><p><b>Worked example: failover timing.</b> SPINE2 is connected to LEAF1 through a patch panel with an optical transport link. SPINE2's line card hangs; LEAF1's Ethernet1/2 stays up. <b>Without BFD:</b> OSPF dead timer 40 s, plus SPF and FIB about 0.1 s: flows hashed to SPINE2 (about half) are black-holed for about 40 seconds. <b>With BFD 50 × 3:</b> detection 150 ms, OSPF adjacency down immediately, SPF start 50 ms, FIB update tens of ms: total roughly <b>0.25 seconds</b>. ECMP helps too: the path through SPINE1 is already installed, so LEAF1 just removes one next hop.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Configuring BFD on one side only. Forgetting <code>no ip redirects</code>. Setting very aggressive BFD timers (for example 10 ms) on platforms or links that cannot sustain them, causing false flaps. Tuning hello timers to 1 second on hundreds of neighbours instead of using BFD.</p></div>
<div class="exam"><p><b>Exam tip.</b> BFD detection time = interval × multiplier (50 ms × 3 = 150 ms). NX-OS: <code>feature bfd</code>, <code>ip ospf bfd</code> or <code>bfd</code> under router ospf, <code>bfd</code> under a BGP neighbour, and <code>no ip redirects</code> on the interface. GR keeps forwarding during control-plane restarts; BFD detects data-plane failures.</p></div>

<div class="scn"><h4>Forty seconds of timeouts every time</h4><p>An application team complained that twice a month their service timed out for about 40 seconds. Each event matched a log entry on a leaf: "OSPF neighbour 10.255.0.12 down, dead timer expired". The uplink to SPINE2 ran through a structured-cabling media converter that kept the leaf's port up even when the far side flapped. The team enabled <code>feature bfd</code> with 50 ms × 3 on all fabric links (and <code>no ip redirects</code>), and <code>bfd</code> under router ospf. The next event lasted about 200 ms and nobody noticed.</p><p><b>Lesson:</b> if a failure can happen without loss of light, only BFD will find it fast.</p></div>

<div class="iv"><p class="q">"How do you get sub-second convergence in the underlay?"</p><p>Strong answer: most time is detection. Direct fibre failures are caught by link-down (tune link debounce if needed). For failures without loss of signal, run BFD on every fabric link (for example 50 ms × 3 = 150 ms) registered with OSPF, IS-IS or BGP. Keep ECMP so the alternate path is pre-installed, use sensible SPF throttle timers, and keep graceful restart for control-plane restarts on dual-supervisor spines. On NX-OS remember <code>feature bfd</code> and <code>no ip redirects</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Convergence = detect, propagate, compute, install; detection dominates.</li>
<li>Link-down events are fast by themselves; BFD catches failures that keep the light on.</li>
<li>BFD 50 ms × 3 = 150 ms detection, offloaded to the line card; needs no ip redirects on NX-OS.</li>
<li>Enable BFD per interface (ip ospf bfd), per process (bfd under router ospf) or per BGP neighbour.</li>
<li>GR/NSF and BFD solve different problems and can run together.</li>
</ul></div>
`,hi:`
<p>Socho aap har das seconds mein ek colleague ko call karke check karte ho ki woh theek hai, aur chaar missed calls ke baad hi alarm bajaate ho. Agar woh behosh ho jaaye, to aapko 40 seconds baad pata chalta hai. Iske ulat, heart-rate monitor ek second mein kai baar beep karta hai aur second ke ek hisse mein alarm deta hai. OSPF hellos phone calls hain. <b>BFD</b> (Bidirectional Forwarding Detection) heart-rate monitor hai. Data center mein jahan ek atka hua path hazaron transactions freeze kar sakta hai, 40 seconds aur 150 milliseconds ka farak ek incident report aur kisi ke notice na karne ka farak hai.</p>

<h3>Convergence ke chaar phases</h3>
<ol>
<li><b>Detect</b> karna ki link ya neighbour fail hua hai.</li>
<li>Khabar <b>propagate</b> karna: OSPF naya LSA flood karta hai, BGP withdrawal bhejta hai.</li>
<li>Naye best paths <b>compute</b> karna (SPF run ya BGP best-path).</li>
<li>Result ko hardware forwarding table (FIB) mein <b>install</b> karna.</li>
</ol>
<p>Chhote spine-leaf underlay mein phases 2 se 4 das-das milliseconds lete hain, aur ECMP phase 4 ko trivial bana deta hai kyunki bacha hua next hop pehle se installed hai. <b>Detection dominate karta hai.</b> Wahi jagah hai jahan aap mehnat lagate ho.</p>

<h3>Default protocol timers</h3>
<table class="cmp"><tr><th>Protocol</th><th>Hello / keepalive</th><th>Dead / hold</th></tr>
<tr><td>OSPF (point-to-point)</td><td>10 s</td><td>40 s</td></tr>
<tr><td>IS-IS</td><td>10 s</td><td>30 s (3 × hello)</td></tr>
<tr><td>BGP</td><td>60 s</td><td>180 s</td></tr>
</table>
<p>Aap hellos chhote kar sakte ho, lekin protocol hellos supervisor CPU handle karta hai. Sub-second hellos wale sainkdon neighbours CPU par load daalte hain aur busy moment mein false flaps kar sakte hain. BFD ise zyada saaf tarike se solve karta hai.</p>

<h3>Jab link seedha down ho jaaye</h3>
<p>Pehle achhi khabar: jab leaf aur spine ke beech fibre kat-ta hai, dono optics light kho dete hain, interface down hota hai, aur OSPF ya BGP neighbour ko <b>turant</b> gira deta hai, dead timer ka wait kiye bina. Nexus par sirf ek delay hai <b>link debounce</b>, ek chhota timer (default 100 ms) jo port down declare karne se pehle bahut chhote glitches ko filter karta hai. Aap ise har interface par <code>link debounce time</code> (milliseconds mein) se badal sakte ho. IOS mein aise hi idea ko carrier delay kehte hain; NX-OS par <code>carrier-delay</code> command VLAN interfaces par apply hota hai.</p>

<h3>Jab link up rahe: BFD kyun exist karta hai</h3>
<p>Kai real failures light nahi girate:</p>
<ul>
<li>Beech mein optical transport ya media converter local link ko up rakhta hai jabki far side mar chuki hai.</li>
<li>Pair ka ek fibre strand toot-ta hai: traffic sirf ek direction mein fail hota hai.</li>
<li>Remote switch ka forwarding hardware hang ho jaata hai jabki uske ports up rehte hain.</li>
</ul>
<p>In sab cases mein sirf protocol dead timer notice karega, OSPF ke liye 40 seconds baad, BGP ke liye 180. <b>BFD</b> do interfaces ke beech har kuch das milliseconds mein chhote UDP packets bhejta hai, jo supervisor ki jagah line card handle karta hai. Agar configured number ke packets miss hote hain, BFD apne clients (OSPF, BGP, IS-IS) ko batata hai aur woh turant neighbour gira dete hain.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="BFD ke saath aur bina detection time">
<text x="20" y="40" class="svg-ink" font-size="13">OSPF dead timer</text>
<rect x="170" y="25" width="440" height="24" rx="4" fill="#fed7aa"/><text x="390" y="42" text-anchor="middle" class="svg-ink" font-size="12">40 s tak</text>
<text x="20" y="95" class="svg-ink" font-size="13">BGP hold timer</text>
<rect x="170" y="80" width="440" height="24" rx="4" fill="#fde68a"/><text x="390" y="97" text-anchor="middle" class="svg-ink" font-size="12">180 s tak (bar scale par nahi)</text>
<text x="20" y="150" class="svg-ink" font-size="13">BFD 50 ms × 3</text>
<rect x="170" y="135" width="12" height="24" rx="3" fill="#bbf7d0"/><text x="195" y="152" class="svg-accent" font-size="12">lagbhag 150 ms</text>
</svg><p class="cap">BFD silent failures ko das-das seconds se second ke ek hisse mein badal deta hai.</p></div>

<h3>NX-OS par BFD configure karna</h3>
<pre class="code"><span class="c">! Har switch par feature ek baar enable karo</span>
feature bfd
<span class="c">! Har fabric interface par</span>
interface Ethernet1/1
  no ip redirects
  bfd interval 50 min_rx 50 multiplier 3
  ip ospf bfd
<span class="c">! Ya har OSPF interface ke liye ek saath BFD enable karo</span>
router ospf UNDERLAY
  bfd
<span class="c">! eBGP underlay: har neighbour par</span>
router bgp 65001
  neighbor 10.1.1.0
    bfd</pre>
<ul>
<li><b>interval 50 min_rx 50 multiplier 3</b>: har 50 ms bhejo, har 50 ms packets accept karo, 3 miss ke baad down declare karo = <b>150 ms</b>. Yahi NX-OS defaults bhi hain.</li>
<li><b>no ip redirects</b>: NX-OS chahta hai ki BFD chalane wale interfaces par ICMP redirects disabled hon (BFD echo function is par depend karta hai). Ise bhoolna Nexus par sabse common BFD configuration error hai.</li>
<li>Dono ends par BFD chalna chahiye. Negotiated rate dono sides mein se slower wala hota hai.</li>
</ul>
<pre class="out">LEAF1# show bfd neighbors
OurAddr         NeighAddr       LD/RD                 RH/RS           Holdown(mult)     State       Int
<span class="hl">10.1.1.1        10.1.1.0        1090519041/1090519042 Up              142(3)            Up          Eth1/1
10.1.2.1        10.1.2.0        1090519043/1090519044 Up              139(3)            Up          Eth1/2</span>

LEAF1# show ip ospf interface Ethernet1/1 | include BFD
    BFD is enabled</pre>

<h3>SPF aur LSA throttling</h3>
<p>Detection ke baad OSPF SPF chalane se pehle ek chhota, adaptive delay wait karta hai, taaki changes ka burst ek hi calculation mein process ho. NX-OS ise <code>timers throttle spf</code> (start, hold, maximum, milliseconds mein) aur <code>timers throttle lsa</code> se control karta hai. Chhoti start value (jaise 50 ms) single failure par jaldi reaction deti hai; hold aur maximum values network flap karta rahe to back off karti hain. Inhe sirf clear reason ke saath aur poore fabric mein consistently badlo.</p>

<h3>Graceful restart versus BFD</h3>
<p>Yeh alag sawaalon ka jawab dete hain:</p>
<table class="cmp"><tr><th></th><th>BFD</th><th>Graceful restart (GR / NSF)</th></tr>
<tr><td>Goal</td><td>Real forwarding failure ko tezi se detect karke reroute karna</td><td>Jis switch ka control plane restart ho raha hai uske through forwarding jaari rakhna</td></tr>
<tr><td>Kab useful</td><td>Link, optic, line card ya remote box failure</td><td>Supervisor switchover, process restart, kuch upgrades</td></tr>
<tr><td>Neighbour behaviour</td><td>Adjacency turant gira do</td><td>"Helper" bano: grace period tak purane routes use karte raho</td></tr>
<tr><td>NX-OS default</td><td>Configure karne tak off</td><td>OSPF aur BGP ke liye enabled</td></tr>
</table>
<p>Yeh saath chal sakte hain: agar data plane sach mein ruk jaaye, BFD fail hota hai aur traffic reroute hota hai; agar dual-supervisor spine par sirf control plane restart ho aur hardware forwarding jaari rakhe, GR bekaar reroute se bachata hai. Single-supervisor leaves par reload ek genuine failure hai, aur uske around ECMP se fast rerouting hi aap chahte ho.</p>

<div class="eg"><p><b>Worked example: failover timing.</b> SPINE2, LEAF1 se ek patch panel aur optical transport link ke through juda hai. SPINE2 ka line card hang hota hai; LEAF1 ka Ethernet1/2 up rehta hai. <b>BFD ke bina:</b> OSPF dead timer 40 s, plus SPF aur FIB lagbhag 0.1 s: SPINE2 par hash hue flows (lagbhag aadhe) lagbhag 40 seconds ke liye black-hole hote hain. <b>BFD 50 × 3 ke saath:</b> detection 150 ms, OSPF adjacency turant down, SPF start 50 ms, FIB update das-das ms: total lagbhag <b>0.25 seconds</b>. ECMP bhi madad karta hai: SPINE1 wala path pehle se installed hai, isliye LEAF1 bas ek next hop hataata hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Sirf ek side par BFD configure karna. <code>no ip redirects</code> bhool jaana. Aise platforms ya links par bahut aggressive BFD timers (jaise 10 ms) set karna jo unhe sambhaal nahi sakte, jisse false flaps hote hain. BFD use karne ki jagah sainkdon neighbours par hello timers 1 second karna.</p></div>
<div class="exam"><p><b>Exam tip.</b> BFD detection time = interval × multiplier (50 ms × 3 = 150 ms). NX-OS: <code>feature bfd</code>, <code>ip ospf bfd</code> ya router ospf ke neeche <code>bfd</code>, BGP neighbour ke neeche <code>bfd</code>, aur interface par <code>no ip redirects</code>. GR control-plane restarts ke dauraan forwarding jaari rakhta hai; BFD data-plane failures detect karta hai.</p></div>

<div class="scn"><h4>Har baar chaalees seconds ke timeouts</h4><p>Ek application team ne shikayat ki ki mahine mein do baar unki service lagbhag 40 seconds ke liye time out hoti thi. Har event ek leaf ke log entry se match karta tha: "OSPF neighbour 10.255.0.12 down, dead timer expired". SPINE2 ka uplink ek structured-cabling media converter se guzarta tha jo far side flap hone par bhi leaf ka port up rakhta tha. Team ne saare fabric links par 50 ms × 3 ke saath <code>feature bfd</code> enable kiya (aur <code>no ip redirects</code>), aur router ospf ke neeche <code>bfd</code>. Agla event lagbhag 200 ms chala aur kisi ne notice nahi kiya.</p><p><b>Seekh:</b> agar failure light jaaye bina ho sakta hai, to sirf BFD use tezi se pakdega.</p></div>

<div class="iv"><p class="q">"Underlay mein sub-second convergence kaise paoge?"</p><p>Strong answer: zyada time detection mein jaata hai. Direct fibre failures link-down se pakde jaate hain (zaroorat ho to link debounce tune karo). Signal loss ke bina failures ke liye har fabric link par BFD chalao (jaise 50 ms × 3 = 150 ms) jo OSPF, IS-IS ya BGP ke saath registered ho. ECMP rakho taaki alternate path pre-installed ho, sensible SPF throttle timers use karo, aur dual-supervisor spines par control-plane restarts ke liye graceful restart rakho. NX-OS par <code>feature bfd</code> aur <code>no ip redirects</code> yaad rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Convergence = detect, propagate, compute, install; detection dominate karta hai.</li>
<li>Link-down events apne aap tez hote hain; BFD un failures ko pakadta hai jo light on rakhte hain.</li>
<li>BFD 50 ms × 3 = 150 ms detection, line card par offloaded; NX-OS par no ip redirects chahiye.</li>
<li>BFD per interface (ip ospf bfd), per process (router ospf ke neeche bfd) ya per BGP neighbour enable karo.</li>
<li>GR/NSF aur BFD alag problems solve karte hain aur saath chal sakte hain.</li>
</ul></div>
`}};export{e as default};