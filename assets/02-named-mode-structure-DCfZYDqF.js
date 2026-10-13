var e={id:`named-structure`,h:{en:`Named mode structure: address-family, af-interface, topology base`,hi:`Named mode structure: address-family, af-interface, topology base`},body:{en:`
<p>Think of named-mode EIGRP as an office building. The <b>building name</b> is the process name. Each <b>floor</b> is an address family (IPv4, IPv6, or a VRF). On every floor there are two departments: <b>facilities</b>, who look after each room (af-interface: hellos, passive, authentication, summaries), and <b>policy</b>, who decide which routes are allowed and how they are shared (topology base: variance, filters, redistribution). If you look for a setting in the wrong department, you will not find it. That is the most common named-mode mistake in tickets.</p>

<h3>The four configuration levels and their prompts</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Named mode levels">
<rect x="180" y="12" width="280" height="38" rx="8" fill="#bae6fd"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">router eigrp NK-WAN (config-router)</text>
<rect x="120" y="76" width="400" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">address-family ipv4 unicast autonomous-system 10</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">(config-router-af): network, router-id, stub, metric weights, neighbor</text>
<line x1="320" y1="50" x2="320" y2="76" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="170" width="260" height="70" rx="8" fill="#fde68a"/><text x="160" y="194" text-anchor="middle" class="svg-ink" font-size="13">af-interface Gi0/0 | default</text><text x="160" y="214" text-anchor="middle" class="svg-muted" font-size="12">(config-router-af-interface)</text><text x="160" y="231" text-anchor="middle" class="svg-muted" font-size="12">hello, hold, passive, auth, summary</text>
<rect x="350" y="170" width="260" height="70" rx="8" fill="#fed7aa"/><text x="480" y="194" text-anchor="middle" class="svg-ink" font-size="13">topology base</text><text x="480" y="214" text-anchor="middle" class="svg-muted" font-size="12">(config-router-af-topology)</text><text x="480" y="231" text-anchor="middle" class="svg-muted" font-size="12">variance, paths, filters, redistribute</text>
<line x1="260" y1="140" x2="160" y2="170" stroke="#64748b" stroke-width="2"/><line x1="380" y1="140" x2="480" y2="170" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Every EIGRP command in named mode belongs to exactly one of these levels.</p></div>

<dl class="terms">
<dt>Process (router eigrp NAME)</dt><dd>A local label. Two routers can use different names and still be neighbours. Almost nothing is configured here directly.</dd>
<dt>Address family</dt><dd><code>address-family ipv4 unicast autonomous-system 10</code> or <code>address-family ipv6 unicast autonomous-system 10</code>, optionally with <code>vrf NAME</code>. The <b>AS number lives here</b> and must match on neighbours. Global items: <code>network</code>, <code>eigrp router-id</code>, <code>eigrp stub</code>, <code>metric weights</code>, <code>metric rib-scale</code>, static <code>neighbor</code>.</dd>
<dt>af-interface</dt><dd>Per-interface settings. <code>af-interface default</code> applies to every interface; a specific <code>af-interface GigabitEthernet0/0</code> overrides the default for that one interface. Commands: <code>hello-interval</code>, <code>hold-time</code>, <code>passive-interface</code>, <code>authentication mode</code>, <code>authentication key-chain</code>, <code>summary-address</code>, <code>split-horizon</code>, <code>next-hop-self</code>, <code>bandwidth-percent</code>, <code>shutdown</code>.</dd>
<dt>topology base</dt><dd>Route policy for the base topology: <code>variance</code>, <code>maximum-paths</code>, <code>traffic-share</code>, <code>redistribute</code>, <code>default-metric</code>, <code>distribute-list</code>, <code>offset-list</code>, <code>distance eigrp</code>, <code>auto-summary</code>, <code>summary-metric</code>, <code>timers active-time</code>.</dd>
</dl>

<h3>Lab walkthrough: SP1 in named mode</h3>
<p>This is exactly what the first lab asks for on SP1. Read the comments: each line answers one task.</p>
<pre class="code">router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 10
  af-interface default
   passive-interface                   <span class="c">! every interface passive</span>
  exit-af-interface
  af-interface GigabitEthernet0/0
   no passive-interface                <span class="c">! except the uplink to HUB</span>
   summary-address 10.1.0.0 255.255.252.0
  exit-af-interface
  network 10.0.0.0 0.255.255.255       <span class="c">! uplink + four store LANs</span>
  network 2.2.2.2 0.0.0.0              <span class="c">! Loopback0</span>
  eigrp router-id 2.2.2.2
  eigrp stub connected summary
 exit-address-family</pre>
<p>The <code>network</code> statements still decide which interfaces run EIGRP in the IPv4 family. Passive interfaces are still advertised; they just send and accept no Hellos. That is why the store LANs (loopbacks 1 to 4) appear in the hub's table while no Hello ever leaves them.</p>

<h3>Verification</h3>
<pre class="out">HUB#show eigrp address-family ipv4 neighbors
EIGRP-IPv4 VR(NK-WAN) Address-Family Neighbors for AS(10)
H   Address                 Interface              Hold Uptime   SRTT   RTO  Q  Seq
                                                   (sec)         (ms)       Cnt Num
<span class="hl">0   10.10.1.2               Gi0/0                    13 00:03:41    2   100  0  6</span>
1   10.10.2.2               Gi0/1                    12 00:02:18    3   100  0  5

SP1#show eigrp address-family ipv4 interfaces
EIGRP-IPv4 VR(NK-WAN) Address-Family Interfaces for AS(10)
                              Xmit Queue   PeerQ        Mean   Pacing Time   Multicast    Pending
Interface              Peers  Un/Reliable  Un/Reliable  SRTT   Un/Reliable   Flow Timer   Routes
<span class="hl">Gi0/0                    1        0/0       0/0           2       0/0           50           0</span></pre>
<p>Passive interfaces do <b>not</b> appear in <code>show eigrp address-family ipv4 interfaces</code>; only Gi0/0 is listed on SP1. The classic commands (<code>show ip eigrp neighbors</code>, <code>show ip eigrp topology</code>) still work on a named-mode router and print the same <code>VR(NK-WAN)</code> header.</p>

<div class="eg"><p><b>Worked example: which level?</b> You need unequal-cost load balancing with variance 2, a 5-second hello on Gi0/1 only, and a router ID of 2.2.2.2. Variance goes in <code>topology base</code>; the hello goes in <code>af-interface GigabitEthernet0/1</code>; the router ID goes at the address-family level. Typing <code>variance 2</code> at the address-family prompt gives <code>% Invalid input detected</code>, which is your clue that you are in the wrong department.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Configuring <code>af-interface default</code> passive and forgetting the <code>no passive-interface</code> on the uplink, so no neighbour ever forms. (2) Putting the summary under the wrong af-interface (a LAN instead of the uplink); the summary is advertised out of the interface where it is configured. (3) Using <code>shutdown</code> under an af-interface to "stop Hellos"; it removes the interface from EIGRP completely, so its prefix is no longer advertised either.</p></div>

<div class="exam"><p><b>Exam trap.</b> The same process can hold several address families: <code>ipv4 unicast</code>, <code>ipv6 unicast</code> and <code>ipv4 unicast vrf CUST</code>, each with its own AS number and its own neighbours. A question that asks "why is the VRF neighbour missing" may be answered by a mismatched AS number inside that VRF address family, even though the global family works.</p></div>

<div class="scn"><h4>Variance that did nothing</h4><p>An engineer migrated a WAN router to named mode by hand. Before, traffic was shared over an MPLS link and a slower internet VPN with <code>variance 3</code>. After the change all traffic took MPLS. <code>show ip protocols</code> showed "Maximum metric variance 1". The engineer had typed <code>variance 3</code>, received an error at the address-family prompt, and moved on without noticing. Entering <code>topology base</code> and configuring <code>variance 3</code> there restored the load sharing, and <code>show ip route</code> again showed two paths with different traffic share counts.</p><p><b>Lesson:</b> after a manual migration, compare <code>show ip protocols</code> before and after; it prints variance, maximum paths, stub state and K values in one place.</p></div>

<div class="iv"><p class="q">"What goes under af-interface and what goes under topology base?"</p><p>af-interface is per-link behaviour: hello and hold timers, passive, authentication, summary-address, split horizon, next-hop-self, bandwidth-percent. topology base is route policy: variance, maximum-paths, redistribution, distribute-lists, offset-lists, distance, default-metric, active timer. Mention that <code>af-interface default</code> gives a baseline that specific af-interfaces override, and that router ID, stub, network and metric weights sit at the address-family level.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Named mode has four levels: process, address family, af-interface and topology base.</li>
<li>The AS number is in the address-family line and must match; the process name is local.</li>
<li>af-interface = per-link settings; <code>af-interface default</code> is overridden by specific interfaces.</li>
<li>topology base = variance, paths, filters, redistribution, distance and the active timer.</li>
<li>Passive interfaces are advertised but not listed in the EIGRP interfaces output.</li>
</ul></div>
`,hi:`
<p>Named-mode EIGRP ko ek office building ki tarah socho. <b>Building ka naam</b> process name hai. Har <b>floor</b> ek address family hai (IPv4, IPv6, ya koi VRF). Har floor par do departments hain: <b>facilities</b>, jo har room ki dekhbhaal karte hain (af-interface: hellos, passive, authentication, summaries), aur <b>policy</b>, jo decide karte hain kaunse routes allowed hain aur kaise share honge (topology base: variance, filters, redistribution). Agar aap kisi setting ko galat department mein dhoondhoge, to woh nahi milegi. Tickets mein yahi sabse common named-mode galti hai.</p>

<h3>Chaar configuration levels aur unke prompts</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Named mode levels">
<rect x="180" y="12" width="280" height="38" rx="8" fill="#bae6fd"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">router eigrp NK-WAN (config-router)</text>
<rect x="120" y="76" width="400" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">address-family ipv4 unicast autonomous-system 10</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">(config-router-af): network, router-id, stub, metric weights, neighbor</text>
<line x1="320" y1="50" x2="320" y2="76" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="170" width="260" height="70" rx="8" fill="#fde68a"/><text x="160" y="194" text-anchor="middle" class="svg-ink" font-size="13">af-interface Gi0/0 | default</text><text x="160" y="214" text-anchor="middle" class="svg-muted" font-size="12">(config-router-af-interface)</text><text x="160" y="231" text-anchor="middle" class="svg-muted" font-size="12">hello, hold, passive, auth, summary</text>
<rect x="350" y="170" width="260" height="70" rx="8" fill="#fed7aa"/><text x="480" y="194" text-anchor="middle" class="svg-ink" font-size="13">topology base</text><text x="480" y="214" text-anchor="middle" class="svg-muted" font-size="12">(config-router-af-topology)</text><text x="480" y="231" text-anchor="middle" class="svg-muted" font-size="12">variance, paths, filters, redistribute</text>
<line x1="260" y1="140" x2="160" y2="170" stroke="#64748b" stroke-width="2"/><line x1="380" y1="140" x2="480" y2="170" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Named mode ka har EIGRP command in levels mein se theek ek level ka hota hai.</p></div>

<dl class="terms">
<dt>Process (router eigrp NAME)</dt><dd>Ek local label. Do routers alag naam use karke bhi neighbours ban sakte hain. Yahan seedha lagbhag kuch configure nahi hota.</dd>
<dt>Address family</dt><dd><code>address-family ipv4 unicast autonomous-system 10</code> ya <code>address-family ipv6 unicast autonomous-system 10</code>, chahein to <code>vrf NAME</code> ke saath. <b>AS number yahin rehta hai</b> aur neighbours par match hona chahiye. Global items: <code>network</code>, <code>eigrp router-id</code>, <code>eigrp stub</code>, <code>metric weights</code>, <code>metric rib-scale</code>, static <code>neighbor</code>.</dd>
<dt>af-interface</dt><dd>Per-interface settings. <code>af-interface default</code> har interface par apply hota hai; ek specific <code>af-interface GigabitEthernet0/0</code> us ek interface ke liye default ko override karta hai. Commands: <code>hello-interval</code>, <code>hold-time</code>, <code>passive-interface</code>, <code>authentication mode</code>, <code>authentication key-chain</code>, <code>summary-address</code>, <code>split-horizon</code>, <code>next-hop-self</code>, <code>bandwidth-percent</code>, <code>shutdown</code>.</dd>
<dt>topology base</dt><dd>Base topology ki route policy: <code>variance</code>, <code>maximum-paths</code>, <code>traffic-share</code>, <code>redistribute</code>, <code>default-metric</code>, <code>distribute-list</code>, <code>offset-list</code>, <code>distance eigrp</code>, <code>auto-summary</code>, <code>summary-metric</code>, <code>timers active-time</code>.</dd>
</dl>

<h3>Lab walkthrough: SP1 named mode mein</h3>
<p>Pehla lab SP1 par bilkul yahi maangta hai. Comments padho: har line ek task ka jawab hai.</p>
<pre class="code">router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 10
  af-interface default
   passive-interface                   <span class="c">! har interface passive</span>
  exit-af-interface
  af-interface GigabitEthernet0/0
   no passive-interface                <span class="c">! sirf HUB wala uplink nahi</span>
   summary-address 10.1.0.0 255.255.252.0
  exit-af-interface
  network 10.0.0.0 0.255.255.255       <span class="c">! uplink + chaar store LANs</span>
  network 2.2.2.2 0.0.0.0              <span class="c">! Loopback0</span>
  eigrp router-id 2.2.2.2
  eigrp stub connected summary
 exit-address-family</pre>
<p>IPv4 family mein <code>network</code> statements ab bhi decide karte hain ki kaunse interfaces EIGRP chalayenge. Passive interfaces ab bhi advertise hote hain; bas woh Hellos na bhejte hain na accept karte hain. Isiliye store LANs (loopbacks 1 se 4) hub ki table mein dikhte hain jabki unse kabhi koi Hello bahar nahi jaata.</p>

<h3>Verification</h3>
<pre class="out">HUB#show eigrp address-family ipv4 neighbors
EIGRP-IPv4 VR(NK-WAN) Address-Family Neighbors for AS(10)
H   Address                 Interface              Hold Uptime   SRTT   RTO  Q  Seq
                                                   (sec)         (ms)       Cnt Num
<span class="hl">0   10.10.1.2               Gi0/0                    13 00:03:41    2   100  0  6</span>
1   10.10.2.2               Gi0/1                    12 00:02:18    3   100  0  5

SP1#show eigrp address-family ipv4 interfaces
EIGRP-IPv4 VR(NK-WAN) Address-Family Interfaces for AS(10)
                              Xmit Queue   PeerQ        Mean   Pacing Time   Multicast    Pending
Interface              Peers  Un/Reliable  Un/Reliable  SRTT   Un/Reliable   Flow Timer   Routes
<span class="hl">Gi0/0                    1        0/0       0/0           2       0/0           50           0</span></pre>
<p>Passive interfaces <code>show eigrp address-family ipv4 interfaces</code> mein <b>nahi</b> dikhte; SP1 par sirf Gi0/0 list hota hai. Classic commands (<code>show ip eigrp neighbors</code>, <code>show ip eigrp topology</code>) named-mode router par bhi chalte hain aur wahi <code>VR(NK-WAN)</code> header print karte hain.</p>

<div class="eg"><p><b>Worked example: kaunsa level?</b> Aapko variance 2 ke saath unequal-cost load balancing, sirf Gi0/1 par 5-second hello, aur 2.2.2.2 router ID chahiye. Variance <code>topology base</code> mein jaata hai; hello <code>af-interface GigabitEthernet0/1</code> mein; router ID address-family level par. Address-family prompt par <code>variance 2</code> type karoge to <code>% Invalid input detected</code> milega, jo clue hai ki aap galat department mein ho.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) <code>af-interface default</code> ko passive karna aur uplink par <code>no passive-interface</code> bhool jaana, jisse koi neighbour kabhi nahi banta. (2) Summary ko galat af-interface ke neeche daal dena (uplink ki jagah LAN par); summary usi interface se advertise hota hai jahan configure kiya gaya. (3) "Hellos rokne" ke liye af-interface ke neeche <code>shutdown</code> use karna; yeh interface ko EIGRP se poori tarah hata deta hai, isliye uska prefix bhi advertise nahi hota.</p></div>

<div class="exam"><p><b>Exam trap.</b> Ek hi process mein kai address families ho sakti hain: <code>ipv4 unicast</code>, <code>ipv6 unicast</code> aur <code>ipv4 unicast vrf CUST</code>, har ek ka apna AS number aur apne neighbours. "VRF neighbour kyun missing hai" wale question ka jawab us VRF address family ke andar mismatched AS number ho sakta hai, chahe global family theek chal rahi ho.</p></div>

<div class="scn"><h4>Variance jisne kuch nahi kiya</h4><p>Ek engineer ne WAN router ko haath se named mode mein migrate kiya. Pehle traffic MPLS link aur ek slow internet VPN par <code>variance 3</code> ke saath share hota tha. Change ke baad saara traffic MPLS par gaya. <code>show ip protocols</code> mein "Maximum metric variance 1" dikha. Engineer ne address-family prompt par <code>variance 3</code> type kiya, error aaya, aur bina dhyan diye aage badh gaya. <code>topology base</code> mein jaa kar wahan <code>variance 3</code> configure karne se load sharing wapas aayi, aur <code>show ip route</code> mein phir se alag traffic share counts ke saath do paths dikhe.</p><p><b>Seekh:</b> manual migration ke baad pehle aur baad ka <code>show ip protocols</code> compare karo; yeh variance, maximum paths, stub state aur K values ek hi jagah print karta hai.</p></div>

<div class="iv"><p class="q">"af-interface ke neeche kya jaata hai aur topology base ke neeche kya?"</p><p>af-interface per-link behaviour hai: hello aur hold timers, passive, authentication, summary-address, split horizon, next-hop-self, bandwidth-percent. topology base route policy hai: variance, maximum-paths, redistribution, distribute-lists, offset-lists, distance, default-metric, active timer. Batao ki <code>af-interface default</code> ek baseline deta hai jise specific af-interfaces override karte hain, aur router ID, stub, network aur metric weights address-family level par hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Named mode ke chaar levels hain: process, address family, af-interface aur topology base.</li>
<li>AS number address-family line mein hai aur match hona chahiye; process name local hai.</li>
<li>af-interface = per-link settings; <code>af-interface default</code> ko specific interfaces override karte hain.</li>
<li>topology base = variance, paths, filters, redistribution, distance aur active timer.</li>
<li>Passive interfaces advertise hote hain lekin EIGRP interfaces output mein list nahi hote.</li>
</ul></div>
`}};export{e as default};