var e={id:`convert-ipv6`,h:{en:`Converting classic to named mode, and the IPv6 address family`,hi:`Classic se named mode mein convert karna, aur IPv6 address family`},body:{en:`
<p>Moving a live network from classic to named mode is like moving house without stopping daily life. You can carry every box yourself (retype the configuration by hand), or you can hire movers who pack each room into the right box automatically (<code>eigrp upgrade-cli</code>). Either way, the family (your neighbours and routes) should not notice. This chapter shows both methods and then adds IPv6, the second floor of the named-mode building.</p>

<h3>The automatic way: eigrp upgrade-cli</h3>
<p>Take HUB from the troubleshooting lab. Its classic configuration is split between the process and the interfaces:</p>
<pre class="code">interface GigabitEthernet0/0
 ip authentication mode eigrp 10 md5
 ip authentication key-chain eigrp 10 NK-KEYS
!
router eigrp 10
 eigrp router-id 1.1.1.1
 network 10.20.0.0 0.0.255.255
 network 1.1.1.1 0.0.0.0</pre>
<p>Inside the classic process, one command converts it:</p>
<pre class="code">HUB(config)#router eigrp 10
HUB(config-router)#eigrp upgrade-cli NK-WAN
Configuration will be converted from router eigrp 10 to router eigrp NK-WAN.
Are you sure you want to proceed? ? [yes/no]: yes
<span class="c">! the result</span>
router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 10
  af-interface GigabitEthernet0/0
   authentication mode md5
   authentication key-chain NK-KEYS
  exit-af-interface
  topology base
  exit-af-topology
  network 10.20.0.0 0.0.255.255
  network 1.1.1.1 0.0.0.0
  eigrp router-id 1.1.1.1
 exit-address-family</pre>
<p>What you should know about it:</p>
<ul>
<li>It converts the process <b>and</b> the EIGRP interface commands (hello, hold, authentication, summary, split horizon, bandwidth-percent) and removes the old interface lines.</li>
<li>It is designed to run <b>without resetting neighbours</b>, so it can be done in production, but always in a change window with a saved configuration.</li>
<li>There is no "downgrade-cli". Going back means rebuilding classic mode by hand.</li>
<li>After the conversion the router uses wide metrics. Metrics in <code>show ip route</code> change scale (divided by the RIB scale of 128), so do not panic when you see new numbers.</li>
</ul>

<h3>The manual way, and the classic-to-named map</h3>
<table class="cmp"><tr><th>Classic</th><th>Named mode location</th></tr>
<tr><td><code>ip hello-interval eigrp 10 5</code> / <code>ip hold-time eigrp 10 15</code></td><td>af-interface: <code>hello-interval 5</code> / <code>hold-time 15</code></td></tr>
<tr><td><code>ip authentication mode eigrp 10 md5</code> + <code>key-chain</code></td><td>af-interface: <code>authentication mode md5</code> + <code>authentication key-chain</code></td></tr>
<tr><td><code>ip summary-address eigrp 10 ...</code></td><td>af-interface: <code>summary-address ...</code></td></tr>
<tr><td><code>no ip split-horizon eigrp 10</code></td><td>af-interface: <code>no split-horizon</code></td></tr>
<tr><td><code>passive-interface Gi0/2</code></td><td>af-interface Gi0/2: <code>passive-interface</code></td></tr>
<tr><td><code>variance</code>, <code>maximum-paths</code>, <code>redistribute</code>, <code>distribute-list</code>, <code>offset-list</code>, <code>auto-summary</code></td><td>topology base</td></tr>
<tr><td><code>eigrp stub</code>, <code>eigrp router-id</code>, <code>network</code>, <code>metric weights</code></td><td>address-family level</td></tr>
</table>
<p>When migrating by hand, you cannot run classic <code>router eigrp 10</code> and a named address family with AS 10 at the same time on one router; remove one before adding the other, and expect the neighbours on that router to reset.</p>

<h3>The IPv6 address family</h3>
<p>EIGRP for IPv6 uses the same DUAL, metrics and packet types. Differences you must troubleshoot:</p>
<ul>
<li>Hellos go to <b>FF02::A</b> and are sourced from the <b>link-local</b> address. Neighbours and next hops are link-local, so two routers can peer even if their global prefixes on the link differ.</li>
<li>In named mode, <b>every IPv6-enabled interface joins automatically</b>; there are no network statements. To exclude one, use <code>af-interface X</code> then <code>shutdown</code>.</li>
<li>EIGRP needs a 32-bit <b>router ID</b>. On an IPv6-only router with no IPv4 address, set <code>eigrp router-id</code> or the process does not start.</li>
<li><code>ipv6 unicast-routing</code> must be enabled globally.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="IPv6 EIGRP adjacency">
<rect x="30" y="50" width="170" height="60" rx="8" fill="#bae6fd"/><text x="115" y="75" text-anchor="middle" class="svg-ink" font-size="14">SP1</text><text x="115" y="95" text-anchor="middle" class="svg-muted" font-size="12">FE80::2 on Gi0/0</text>
<rect x="440" y="50" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="525" y="75" text-anchor="middle" class="svg-ink" font-size="14">HUB</text><text x="525" y="95" text-anchor="middle" class="svg-muted" font-size="12">FE80::1 on Gi0/0</text>
<line x1="200" y1="80" x2="440" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="70" text-anchor="middle" class="svg-accent" font-size="12">Hellos to FF02::A</text>
<text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">link 2001:DB8:10:1::/64</text>
<text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="12">Next hop learned by HUB = FE80::2 (link-local)</text>
</svg><p class="cap">IPv6 EIGRP neighbours are identified by link-local addresses.</p></div>
<pre class="code">ipv6 unicast-routing
router eigrp NK-WAN
 address-family ipv6 unicast autonomous-system 10
  eigrp router-id 2.2.2.2
  af-interface default
   passive-interface
  exit-af-interface
  af-interface GigabitEthernet0/0
   no passive-interface
   summary-address 2001:DB8:1::/62     <span class="c">! four store /64s</span>
  exit-af-interface
  eigrp stub connected summary
 exit-address-family
<span class="c">! classic equivalent: ipv6 router eigrp 10 + "ipv6 eigrp 10" on each interface</span></pre>
<pre class="out">HUB#show eigrp address-family ipv6 neighbors
EIGRP-IPv6 VR(NK-WAN) Address-Family Neighbors for AS(10)
H   Address                 Interface              Hold Uptime   SRTT   RTO  Q  Seq
                                                   (sec)         (ms)       Cnt Num
<span class="hl">0   Link-local address:     Gi0/0                    12 00:01:10    4   100  0  3</span>
    FE80::2
HUB#show ipv6 route eigrp
D   2001:DB8:1::/62 [90/10880]
     via FE80::2, GigabitEthernet0/0</pre>

<div class="eg"><p><b>Worked example.</b> SP1 has store LANs 2001:DB8:1:0::/64, 2001:DB8:1:1::/64, 2001:DB8:1:2::/64 and 2001:DB8:1:3::/64. The first 62 bits are common (the fourth hextet runs 0 to 3, which differ only in the last two bits), so <code>summary-address 2001:DB8:1::/62</code> covers exactly those four, the same idea as 10.1.0.0/22 in IPv4.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>ipv6 unicast-routing</code>; no router ID on an IPv6-only router; expecting a network statement in the IPv6 family; in classic mode, forgetting <code>ipv6 eigrp 10</code> on an interface, so it never joins.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Two IPv6 EIGRP routers have different global prefixes on the shared link; will they become neighbours?" Yes. Unlike IPv4, IPv6 EIGRP does not require a common global subnet, because Hellos are sourced from link-local addresses. AS number and K values must still match.</p></div>

<div class="scn"><h4>The IPv6 rollout that skipped one router</h4><p>An enterprise enabled IPv6 on its campus and added <code>address-family ipv6 unicast autonomous-system 10</code> everywhere. One distribution router never formed IPv6 neighbours, while IPv4 EIGRP on the same links was perfect. <code>show eigrp address-family ipv6 interfaces</code> was empty. The engineer checked <code>show running-config | include unicast-routing</code>: the global <code>ipv6 unicast-routing</code> was missing on that router, so it behaved as an IPv6 host. After adding it, the interfaces joined and the neighbours came up within seconds.</p><p><b>Lesson:</b> for IPv6 EIGRP, check global IPv6 routing and the router ID before anything else.</p></div>

<div class="iv"><p class="q">"How would you migrate a production EIGRP network from classic to named mode?"</p><p>Say you would use <code>eigrp upgrade-cli NAME</code> router by router in a change window, after saving the configuration, because it converts interface commands and keeps neighbours up. Verify with <code>show ip protocols</code>, neighbours and route counts before and after. Mention that wide metrics change the metric scale in the RIB, that there is no automatic way back, and that a named router still peers with classic routers during the migration.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>eigrp upgrade-cli NAME</code> converts classic to named mode, including interface commands, without resetting neighbours.</li>
<li>Wide metrics change the numbers in the routing table after conversion.</li>
<li>IPv6 EIGRP uses FF02::A and link-local neighbours; a common global subnet is not required.</li>
<li>In the named IPv6 family, all IPv6 interfaces join automatically; exclude with af-interface <code>shutdown</code>.</li>
<li>IPv6-only routers need an explicit <code>eigrp router-id</code> and <code>ipv6 unicast-routing</code>.</li>
</ul></div>
`,hi:`
<p>Live network ko classic se named mode mein le jaana roz ki zindagi roke bina ghar shift karne jaisa hai. Aap har box khud utha sakte ho (configuration haath se dobara type karna), ya movers hire kar sakte ho jo har room ko apne aap sahi box mein pack kar dein (<code>eigrp upgrade-cli</code>). Dono tarah se, family (aapke neighbours aur routes) ko pata nahi chalna chahiye. Yeh chapter dono tareeke dikhata hai aur phir IPv6 jodta hai, named-mode building ka doosra floor.</p>

<h3>Automatic tareeka: eigrp upgrade-cli</h3>
<p>Troubleshooting lab ka HUB lo. Iski classic configuration process aur interfaces ke beech bati hui hai:</p>
<pre class="code">interface GigabitEthernet0/0
 ip authentication mode eigrp 10 md5
 ip authentication key-chain eigrp 10 NK-KEYS
!
router eigrp 10
 eigrp router-id 1.1.1.1
 network 10.20.0.0 0.0.255.255
 network 1.1.1.1 0.0.0.0</pre>
<p>Classic process ke andar ek command ise convert kar deta hai:</p>
<pre class="code">HUB(config)#router eigrp 10
HUB(config-router)#eigrp upgrade-cli NK-WAN
Configuration will be converted from router eigrp 10 to router eigrp NK-WAN.
Are you sure you want to proceed? ? [yes/no]: yes
<span class="c">! result</span>
router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 10
  af-interface GigabitEthernet0/0
   authentication mode md5
   authentication key-chain NK-KEYS
  exit-af-interface
  topology base
  exit-af-topology
  network 10.20.0.0 0.0.255.255
  network 1.1.1.1 0.0.0.0
  eigrp router-id 1.1.1.1
 exit-address-family</pre>
<p>Iske baare mein aapko kya pata hona chahiye:</p>
<ul>
<li>Yeh process <b>aur</b> EIGRP interface commands (hello, hold, authentication, summary, split horizon, bandwidth-percent) dono convert karta hai aur purani interface lines hata deta hai.</li>
<li>Yeh <b>neighbours reset kiye bina</b> chalne ke liye design kiya gaya hai, isliye production mein kiya ja sakta hai, lekin hamesha change window mein aur saved configuration ke saath.</li>
<li>Koi "downgrade-cli" nahi hai. Wapas jaane ka matlab hai classic mode haath se dobara banana.</li>
<li>Conversion ke baad router wide metrics use karta hai. <code>show ip route</code> mein metrics ka scale badal jaata hai (128 ke RIB scale se divide), isliye naye numbers dekh kar ghabraao mat.</li>
</ul>

<h3>Manual tareeka, aur classic-to-named map</h3>
<table class="cmp"><tr><th>Classic</th><th>Named mode mein jagah</th></tr>
<tr><td><code>ip hello-interval eigrp 10 5</code> / <code>ip hold-time eigrp 10 15</code></td><td>af-interface: <code>hello-interval 5</code> / <code>hold-time 15</code></td></tr>
<tr><td><code>ip authentication mode eigrp 10 md5</code> + <code>key-chain</code></td><td>af-interface: <code>authentication mode md5</code> + <code>authentication key-chain</code></td></tr>
<tr><td><code>ip summary-address eigrp 10 ...</code></td><td>af-interface: <code>summary-address ...</code></td></tr>
<tr><td><code>no ip split-horizon eigrp 10</code></td><td>af-interface: <code>no split-horizon</code></td></tr>
<tr><td><code>passive-interface Gi0/2</code></td><td>af-interface Gi0/2: <code>passive-interface</code></td></tr>
<tr><td><code>variance</code>, <code>maximum-paths</code>, <code>redistribute</code>, <code>distribute-list</code>, <code>offset-list</code>, <code>auto-summary</code></td><td>topology base</td></tr>
<tr><td><code>eigrp stub</code>, <code>eigrp router-id</code>, <code>network</code>, <code>metric weights</code></td><td>address-family level</td></tr>
</table>
<p>Haath se migrate karte waqt, ek router par classic <code>router eigrp 10</code> aur AS 10 wali named address family ek saath nahi chala sakte; doosra add karne se pehle ek hatao, aur us router ke neighbours reset hone ki umeed rakho.</p>

<h3>IPv6 address family</h3>
<p>IPv6 ke liye EIGRP wahi DUAL, metrics aur packet types use karta hai. Farak jo aapko troubleshoot karne honge:</p>
<ul>
<li>Hellos <b>FF02::A</b> par jaate hain aur <b>link-local</b> address se source hote hain. Neighbours aur next hops link-local hote hain, isliye do routers peer kar sakte hain chahe link par unke global prefixes alag hon.</li>
<li>Named mode mein <b>har IPv6-enabled interface apne aap join karta hai</b>; koi network statements nahi. Kisi ko bahar rakhne ke liye <code>af-interface X</code> phir <code>shutdown</code> use karo.</li>
<li>EIGRP ko 32-bit <b>router ID</b> chahiye. Bina IPv4 address wale IPv6-only router par <code>eigrp router-id</code> set karo, warna process start nahi hota.</li>
<li><code>ipv6 unicast-routing</code> globally enable hona chahiye.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="IPv6 EIGRP adjacency">
<rect x="30" y="50" width="170" height="60" rx="8" fill="#bae6fd"/><text x="115" y="75" text-anchor="middle" class="svg-ink" font-size="14">SP1</text><text x="115" y="95" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 par FE80::2</text>
<rect x="440" y="50" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="525" y="75" text-anchor="middle" class="svg-ink" font-size="14">HUB</text><text x="525" y="95" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 par FE80::1</text>
<line x1="200" y1="80" x2="440" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="70" text-anchor="middle" class="svg-accent" font-size="12">Hellos FF02::A par</text>
<text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">link 2001:DB8:10:1::/64</text>
<text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="12">HUB ka seekha next hop = FE80::2 (link-local)</text>
</svg><p class="cap">IPv6 EIGRP neighbours link-local addresses se pehchaane jaate hain.</p></div>
<pre class="code">ipv6 unicast-routing
router eigrp NK-WAN
 address-family ipv6 unicast autonomous-system 10
  eigrp router-id 2.2.2.2
  af-interface default
   passive-interface
  exit-af-interface
  af-interface GigabitEthernet0/0
   no passive-interface
   summary-address 2001:DB8:1::/62     <span class="c">! chaar store /64s</span>
  exit-af-interface
  eigrp stub connected summary
 exit-address-family
<span class="c">! classic equivalent: ipv6 router eigrp 10 + har interface par "ipv6 eigrp 10"</span></pre>
<pre class="out">HUB#show eigrp address-family ipv6 neighbors
EIGRP-IPv6 VR(NK-WAN) Address-Family Neighbors for AS(10)
H   Address                 Interface              Hold Uptime   SRTT   RTO  Q  Seq
                                                   (sec)         (ms)       Cnt Num
<span class="hl">0   Link-local address:     Gi0/0                    12 00:01:10    4   100  0  3</span>
    FE80::2
HUB#show ipv6 route eigrp
D   2001:DB8:1::/62 [90/10880]
     via FE80::2, GigabitEthernet0/0</pre>

<div class="eg"><p><b>Worked example.</b> SP1 ke store LANs 2001:DB8:1:0::/64, 2001:DB8:1:1::/64, 2001:DB8:1:2::/64 aur 2001:DB8:1:3::/64 hain. Pehle 62 bits common hain (chautha hextet 0 se 3 tak chalta hai, jo sirf aakhri do bits mein alag hain), isliye <code>summary-address 2001:DB8:1::/62</code> theek inhi chaar ko cover karta hai, IPv4 ke 10.1.0.0/22 jaisa hi idea.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>ipv6 unicast-routing</code> bhool jaana; IPv6-only router par router ID na hona; IPv6 family mein network statement ki umeed karna; classic mode mein kisi interface par <code>ipv6 eigrp 10</code> bhool jaana, jisse woh kabhi join nahi karta.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Do IPv6 EIGRP routers ke shared link par alag global prefixes hain; kya woh neighbours banenge?" Haan. IPv4 ke ulat, IPv6 EIGRP ko common global subnet nahi chahiye, kyunki Hellos link-local addresses se source hote hain. AS number aur K values phir bhi match hone chahiye.</p></div>

<div class="scn"><h4>IPv6 rollout jo ek router bhool gaya</h4><p>Ek enterprise ne apne campus par IPv6 enable kiya aur har jagah <code>address-family ipv6 unicast autonomous-system 10</code> add kiya. Ek distribution router ne kabhi IPv6 neighbours nahi banaye, jabki unhi links par IPv4 EIGRP perfect tha. <code>show eigrp address-family ipv6 interfaces</code> khaali tha. Engineer ne <code>show running-config | include unicast-routing</code> check kiya: us router par global <code>ipv6 unicast-routing</code> missing tha, isliye woh IPv6 host ki tarah behave kar raha tha. Ise add karne ke baad interfaces join hue aur kuch seconds mein neighbours up ho gaye.</p><p><b>Seekh:</b> IPv6 EIGRP ke liye sabse pehle global IPv6 routing aur router ID check karo.</p></div>

<div class="iv"><p class="q">"Production EIGRP network ko classic se named mode mein kaise migrate karoge?"</p><p>Batao ki aap change window mein, configuration save karne ke baad, router by router <code>eigrp upgrade-cli NAME</code> use karoge, kyunki yeh interface commands convert karta hai aur neighbours up rakhta hai. Pehle aur baad <code>show ip protocols</code>, neighbours aur route counts se verify karo. Batao ki wide metrics RIB mein metric scale badal dete hain, wapas jaane ka koi automatic tareeka nahi hai, aur migration ke dauraan named router classic routers ke saath peer karta rehta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>eigrp upgrade-cli NAME</code> classic ko named mode mein convert karta hai, interface commands samet, neighbours reset kiye bina.</li>
<li>Conversion ke baad wide metrics routing table ke numbers badal dete hain.</li>
<li>IPv6 EIGRP FF02::A aur link-local neighbours use karta hai; common global subnet zaroori nahi.</li>
<li>Named IPv6 family mein saare IPv6 interfaces apne aap join karte hain; af-interface <code>shutdown</code> se bahar rakho.</li>
<li>IPv6-only routers ko explicit <code>eigrp router-id</code> aur <code>ipv6 unicast-routing</code> chahiye.</li>
</ul></div>
`}};export{e as default};