var e={id:`named-mode`,h:{en:`Named mode and wide metrics`,hi:`Named mode aur wide metrics`},body:{en:`
<p>Classic EIGRP configuration is like keeping your household papers in three places: some in a drawer (the <code>router eigrp</code> section), some in each room (commands under every interface), and the key numbers on sticky notes. It works, but finding everything takes time. <b>Named mode</b> puts every EIGRP setting into one organised binder with clear sections. It also brings a modern 64-bit metric and stronger authentication. Everything you learned about neighbours and DUAL stays the same; only the configuration layout and the metric scale change.</p>

<h3>The structure of named mode</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Named mode hierarchy">
<rect x="200" y="14" width="240" height="40" rx="8" fill="#bae6fd"/><text x="320" y="39" text-anchor="middle" class="svg-ink" font-size="13">router eigrp NK-WAN</text>
<rect x="160" y="84" width="320" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="109" text-anchor="middle" class="svg-ink" font-size="13">address-family ipv4 unicast autonomous-system 100</text>
<line x1="320" y1="54" x2="320" y2="84" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="170" width="170" height="70" rx="8" fill="#fde68a"/><text x="115" y="195" text-anchor="middle" class="svg-ink" font-size="13">af-interface</text><text x="115" y="214" text-anchor="middle" class="svg-muted" font-size="12">hello, hold, passive,</text><text x="115" y="230" text-anchor="middle" class="svg-muted" font-size="12">auth, summary</text>
<rect x="235" y="170" width="170" height="70" rx="8" fill="#ddd6fe"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">address-family level</text><text x="320" y="214" text-anchor="middle" class="svg-muted" font-size="12">network, router-id,</text><text x="320" y="230" text-anchor="middle" class="svg-muted" font-size="12">stub, metric weights</text>
<rect x="440" y="170" width="170" height="70" rx="8" fill="#fed7aa"/><text x="525" y="195" text-anchor="middle" class="svg-ink" font-size="13">topology base</text><text x="525" y="214" text-anchor="middle" class="svg-muted" font-size="12">variance, max-paths,</text><text x="525" y="230" text-anchor="middle" class="svg-muted" font-size="12">redistribute, distance</text>
<line x1="280" y1="124" x2="115" y2="170" stroke="#64748b" stroke-width="2"/><line x1="320" y1="124" x2="320" y2="170" stroke="#64748b" stroke-width="2"/><line x1="360" y1="124" x2="525" y2="170" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">One process name, one address family per protocol, and three places where settings live.</p></div>

<p>The name (here <code>NK-WAN</code>) is local and only labels the process. The <b>autonomous-system</b> number inside the address family is what must match on neighbours. The same process can hold an <code>address-family ipv6 unicast autonomous-system 100</code> as well; in the IPv6 family, every IPv6-enabled interface joins automatically, with no network statements.</p>

<h3>Lab 1 in named mode</h3>
<pre class="code">router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 100
  eigrp router-id 1.1.1.1
  network 10.0.12.0 0.0.0.255
  network 10.0.13.0 0.0.0.255
  network 192.168.10.0 0.0.0.255
  network 1.1.1.1 0.0.0.0
  af-interface GigabitEthernet0/2
   passive-interface                     <span class="c">! LAN: no Hellos</span>
  exit-af-interface
  af-interface GigabitEthernet0/0
   authentication mode hmac-sha-256 N3tK1ngs
  exit-af-interface
  topology base
   variance 1                            <span class="c">! default, shown for clarity</span>
  exit-af-topology
 exit-address-family</pre>

<h3>Where each classic command moves</h3>
<table class="cmp"><tr><th>Classic</th><th>Named mode</th></tr>
<tr><td><code>router eigrp 100</code></td><td><code>router eigrp NAME</code> + <code>address-family ipv4 unicast autonomous-system 100</code></td></tr>
<tr><td><code>ip hello-interval eigrp 100 5</code> (interface)</td><td><code>af-interface Gi0/0</code> then <code>hello-interval 5</code></td></tr>
<tr><td><code>ip authentication mode eigrp 100 md5</code></td><td><code>authentication mode md5</code> or <code>hmac-sha-256</code> under af-interface</td></tr>
<tr><td><code>ip summary-address eigrp 100 ...</code></td><td><code>summary-address ...</code> under af-interface</td></tr>
<tr><td><code>passive-interface Gi0/2</code></td><td><code>passive-interface</code> under <code>af-interface Gi0/2</code> (or under <code>af-interface default</code>)</td></tr>
<tr><td><code>variance</code>, <code>maximum-paths</code>, <code>redistribute</code></td><td>under <code>topology base</code></td></tr>
<tr><td><code>metric weights 0 1 0 1 0 0</code></td><td><code>metric weights 0 1 0 1 0 0 0</code> (adds K6) at address-family level</td></tr>
</table>
<p>You do not have to retype everything to migrate. Under a classic process, <code>eigrp upgrade-cli NK-WAN</code> converts the whole configuration, interface commands included, into named mode without resetting neighbours.</p>

<h3>Wide metrics</h3>
<p>Chapter 4 showed that the classic metric cannot tell 10G from 100G. Named mode uses <b>wide metrics</b>: 64-bit values, delay measured in <b>picoseconds</b>, and a scaling constant of 65536 instead of 256.</p>
<pre class="code">metric = [ K1 x Throughput + (K2 x Throughput)/(256 - load) + K3 x Latency + K6 x ExtAttr ] x [ K5/(K4 + reliability) ]

<span class="c">! Throughput = 65536 x 10^7 / min-bandwidth-Kbps</span>
<span class="c">! Latency    = total delay in picoseconds x 65536 / 10^6</span>
<span class="c">! K6 = extended attributes (jitter, energy), default 0</span></pre>
<p>For interfaces faster than 1 Gbps, named mode derives a smaller delay from the interface speed, so fast links finally look different. The routing table cannot hold a 64-bit number, so the value is divided by the <b>RIB scale</b>, 128 by default (<code>metric rib-scale</code>).</p>

<div class="eg"><p><b>Worked example: lab 1 in wide metrics.</b> R1 to 192.168.30.0/24 via R2:</p>
<ul>
<li>Throughput = 65536 x 10^7 / 1,000,000 = <b>655,360</b>.</li>
<li>Delay 30 microseconds = 30,000,000 picoseconds; Latency = 30,000,000 x 65536 / 10^6 = <b>1,966,080</b>.</li>
<li>Composite = 655,360 + 1,966,080 = <b>2,621,440</b>. RIB metric = 2,621,440 / 128 = <b>20480</b>.</li>
<li>R2's reported distance: 655,360 + (20 microseconds = 1,310,720) = <b>1,966,080</b>.</li>
</ul>
<p>Feasibility works the same way on the bigger numbers. R3's own distance over the backup link is 1,310,720, still less than the FD of 2,621,440, so R3 is still a feasible successor.</p></div>

<pre class="out">R1# show eigrp address-family ipv4 topology 192.168.30.0/24
EIGRP-IPv4 VR(NK-WAN) Topology Entry for AS(100)/ID(1.1.1.1) for 192.168.30.0/24
  <span class="hl">State is Passive, Query origin flag is 1, 1 Successor(s), FD is 2621440, RIB is 20480</span>
  Descriptor Blocks:
  10.0.12.2 (GigabitEthernet0/0), from 10.0.12.2, Send flag is 0x0
      <span class="hl">Composite metric is (2621440/1966080), route is Internal</span>
      Vector metric:
        Minimum bandwidth is 1000000 Kbit
        Total delay is 30000000 picoseconds

R1# show ip route 192.168.30.0
Routing entry for 192.168.30.0/24
  <span class="hl">Known via "eigrp 100", distance 90, metric 20480, type internal</span></pre>

<div class="warn"><p><b>Common mistake.</b> Comparing a named-mode metric with a classic one and concluding a path "got worse". 20480 in named mode and 3328 in classic describe the same path; they are simply on different scales. Compare metrics only within one mode.</p></div>

<div class="exam"><p><b>Exam trap.</b> In named mode, <code>variance</code> and <code>maximum-paths</code> live under <b>topology base</b>, while hello, hold, passive, authentication and summary live under <b>af-interface</b>. The process name is local; the AS number must match. Named-mode metric weights have seven values (TOS plus K1 to K6).</p></div>

<div class="scn"><h4>Upgrading a campus without an outage</h4><p>A bank's campus core ran classic EIGRP with dozens of interface-level commands for authentication and summarisation. The team wanted HMAC-SHA-256 and wide metrics because new 40G links were indistinguishable from 10G ones. In a change window they ran <code>eigrp upgrade-cli CORE</code> on each router. Neighbours stayed up, every interface command moved under <code>af-interface</code>, and the 40G paths started to win over the 10G ones as expected.</p><p><b>Lesson:</b> named mode is the modern way to run EIGRP; migrate with upgrade-cli, then enable features such as SHA-256 authentication.</p></div>

<div class="iv"><p class="q">"Why would you use EIGRP named mode instead of classic mode?"</p><p>Strong answer: named mode keeps all EIGRP configuration in one hierarchical place (address family, af-interface, topology base), supports IPv4 and IPv6 in one process, adds HMAC-SHA-256 authentication, and uses 64-bit wide metrics with picosecond delay, so links faster than 1 Gbps are distinguished; the RIB sees the value divided by the RIB scale of 128. Mention eigrp upgrade-cli for a non-disruptive migration.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Named mode: <code>router eigrp NAME</code>, <code>address-family ... autonomous-system N</code>, then af-interface and topology base.</li>
<li>Interface settings go under af-interface; variance, maximum-paths and redistribution under topology base.</li>
<li>Wide metrics use 64-bit values, picosecond delay and a 65536 scale; the RIB shows value / 128.</li>
<li>Lab 1 path via R2: composite 2,621,440, RIB metric 20480; FD and FS logic is unchanged.</li>
<li><code>eigrp upgrade-cli</code> migrates classic to named mode without resetting neighbours.</li>
</ul></div>
`,hi:`
<p>Classic EIGRP configuration aisa hai jaise ghar ke kaagaz teen jagah rakhna: kuch ek drawer mein (<code>router eigrp</code> section), kuch har kamre mein (har interface ke neeche commands), aur zaroori numbers sticky notes par. Kaam chalta hai, lekin sab dhoondhne mein time lagta hai. <b>Named mode</b> EIGRP ki har setting ko ek organised binder mein saaf sections ke saath rakhta hai. Yeh ek modern 64-bit metric aur mazboot authentication bhi laata hai. Neighbours aur DUAL ke baare mein aapne jo seekha woh sab same rehta hai; sirf configuration layout aur metric ka scale badalta hai.</p>

<h3>Named mode ka structure</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Named mode hierarchy">
<rect x="200" y="14" width="240" height="40" rx="8" fill="#bae6fd"/><text x="320" y="39" text-anchor="middle" class="svg-ink" font-size="13">router eigrp NK-WAN</text>
<rect x="160" y="84" width="320" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="109" text-anchor="middle" class="svg-ink" font-size="13">address-family ipv4 unicast autonomous-system 100</text>
<line x1="320" y1="54" x2="320" y2="84" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="170" width="170" height="70" rx="8" fill="#fde68a"/><text x="115" y="195" text-anchor="middle" class="svg-ink" font-size="13">af-interface</text><text x="115" y="214" text-anchor="middle" class="svg-muted" font-size="12">hello, hold, passive,</text><text x="115" y="230" text-anchor="middle" class="svg-muted" font-size="12">auth, summary</text>
<rect x="235" y="170" width="170" height="70" rx="8" fill="#ddd6fe"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">address-family level</text><text x="320" y="214" text-anchor="middle" class="svg-muted" font-size="12">network, router-id,</text><text x="320" y="230" text-anchor="middle" class="svg-muted" font-size="12">stub, metric weights</text>
<rect x="440" y="170" width="170" height="70" rx="8" fill="#fed7aa"/><text x="525" y="195" text-anchor="middle" class="svg-ink" font-size="13">topology base</text><text x="525" y="214" text-anchor="middle" class="svg-muted" font-size="12">variance, max-paths,</text><text x="525" y="230" text-anchor="middle" class="svg-muted" font-size="12">redistribute, distance</text>
<line x1="280" y1="124" x2="115" y2="170" stroke="#64748b" stroke-width="2"/><line x1="320" y1="124" x2="320" y2="170" stroke="#64748b" stroke-width="2"/><line x1="360" y1="124" x2="525" y2="170" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek process name, har protocol ke liye ek address family, aur teen jagah jahan settings rehti hain.</p></div>

<p>Naam (yahan <code>NK-WAN</code>) local hai aur sirf process ko label karta hai. Address family ke andar ka <b>autonomous-system</b> number woh hai jo neighbours par match hona chahiye. Usi process mein <code>address-family ipv6 unicast autonomous-system 100</code> bhi ho sakti hai; IPv6 family mein har IPv6-enabled interface apne aap join ho jaata hai, bina network statements ke.</p>

<h3>Named mode mein lab 1</h3>
<pre class="code">router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 100
  eigrp router-id 1.1.1.1
  network 10.0.12.0 0.0.0.255
  network 10.0.13.0 0.0.0.255
  network 192.168.10.0 0.0.0.255
  network 1.1.1.1 0.0.0.0
  af-interface GigabitEthernet0/2
   passive-interface                     <span class="c">! LAN: Hellos nahi</span>
  exit-af-interface
  af-interface GigabitEthernet0/0
   authentication mode hmac-sha-256 N3tK1ngs
  exit-af-interface
  topology base
   variance 1                            <span class="c">! default, clarity ke liye dikhaya</span>
  exit-af-topology
 exit-address-family</pre>

<h3>Har classic command kahan jaata hai</h3>
<table class="cmp"><tr><th>Classic</th><th>Named mode</th></tr>
<tr><td><code>router eigrp 100</code></td><td><code>router eigrp NAME</code> + <code>address-family ipv4 unicast autonomous-system 100</code></td></tr>
<tr><td><code>ip hello-interval eigrp 100 5</code> (interface)</td><td><code>af-interface Gi0/0</code> phir <code>hello-interval 5</code></td></tr>
<tr><td><code>ip authentication mode eigrp 100 md5</code></td><td>af-interface ke neeche <code>authentication mode md5</code> ya <code>hmac-sha-256</code></td></tr>
<tr><td><code>ip summary-address eigrp 100 ...</code></td><td>af-interface ke neeche <code>summary-address ...</code></td></tr>
<tr><td><code>passive-interface Gi0/2</code></td><td><code>af-interface Gi0/2</code> ke neeche <code>passive-interface</code> (ya <code>af-interface default</code> ke neeche)</td></tr>
<tr><td><code>variance</code>, <code>maximum-paths</code>, <code>redistribute</code></td><td><code>topology base</code> ke neeche</td></tr>
<tr><td><code>metric weights 0 1 0 1 0 0</code></td><td>address-family level par <code>metric weights 0 1 0 1 0 0 0</code> (K6 judta hai)</td></tr>
</table>
<p>Migrate karne ke liye sab dobara type karne ki zaroorat nahi. Classic process ke neeche <code>eigrp upgrade-cli NK-WAN</code> poori configuration, interface commands samet, bina neighbours reset kiye named mode mein convert kar deta hai.</p>

<h3>Wide metrics</h3>
<p>Chapter 4 ne dikhaya ki classic metric 10G aur 100G mein fark nahi kar sakta. Named mode <b>wide metrics</b> use karta hai: 64-bit values, <b>picoseconds</b> mein naapa gaya delay, aur 256 ki jagah 65536 ka scaling constant.</p>
<pre class="code">metric = [ K1 x Throughput + (K2 x Throughput)/(256 - load) + K3 x Latency + K6 x ExtAttr ] x [ K5/(K4 + reliability) ]

<span class="c">! Throughput = 65536 x 10^7 / min-bandwidth-Kbps</span>
<span class="c">! Latency    = total delay picoseconds mein x 65536 / 10^6</span>
<span class="c">! K6 = extended attributes (jitter, energy), default 0</span></pre>
<p>1 Gbps se tez interfaces ke liye named mode interface speed se chhota delay nikalta hai, isliye fast links aakhirkaar alag dikhte hain. Routing table 64-bit number nahi rakh sakti, isliye value ko <b>RIB scale</b> se divide kiya jaata hai, default 128 (<code>metric rib-scale</code>).</p>

<div class="eg"><p><b>Worked example: wide metrics mein lab 1.</b> R1 se 192.168.30.0/24 R2 ke through:</p>
<ul>
<li>Throughput = 65536 x 10^7 / 1,000,000 = <b>655,360</b>.</li>
<li>Delay 30 microseconds = 30,000,000 picoseconds; Latency = 30,000,000 x 65536 / 10^6 = <b>1,966,080</b>.</li>
<li>Composite = 655,360 + 1,966,080 = <b>2,621,440</b>. RIB metric = 2,621,440 / 128 = <b>20480</b>.</li>
<li>R2 ka reported distance: 655,360 + (20 microseconds = 1,310,720) = <b>1,966,080</b>.</li>
</ul>
<p>Bade numbers par bhi feasibility waise hi kaam karti hai. Backup link par R3 ka apna distance 1,310,720 hai, jo ab bhi 2,621,440 ke FD se kam hai, isliye R3 ab bhi feasible successor hai.</p></div>

<pre class="out">R1# show eigrp address-family ipv4 topology 192.168.30.0/24
EIGRP-IPv4 VR(NK-WAN) Topology Entry for AS(100)/ID(1.1.1.1) for 192.168.30.0/24
  <span class="hl">State is Passive, Query origin flag is 1, 1 Successor(s), FD is 2621440, RIB is 20480</span>
  Descriptor Blocks:
  10.0.12.2 (GigabitEthernet0/0), from 10.0.12.2, Send flag is 0x0
      <span class="hl">Composite metric is (2621440/1966080), route is Internal</span>
      Vector metric:
        Minimum bandwidth is 1000000 Kbit
        Total delay is 30000000 picoseconds

R1# show ip route 192.168.30.0
Routing entry for 192.168.30.0/24
  <span class="hl">Known via "eigrp 100", distance 90, metric 20480, type internal</span></pre>

<div class="warn"><p><b>Common galti.</b> Named-mode metric ko classic metric se compare karke yeh nateeja nikaalna ki path "kharab ho gaya". Named mode ka 20480 aur classic ka 3328 same path describe karte hain; bas alag scales par hain. Metrics sirf ek hi mode ke andar compare karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Named mode mein <code>variance</code> aur <code>maximum-paths</code> <b>topology base</b> ke neeche rehte hain, jabki hello, hold, passive, authentication aur summary <b>af-interface</b> ke neeche. Process name local hai; AS number match hona chahiye. Named-mode metric weights mein saat values hoti hain (TOS plus K1 se K6).</p></div>

<div class="scn"><h4>Bina outage ke campus upgrade</h4><p>Ek bank ka campus core classic EIGRP par chal raha tha, authentication aur summarisation ke liye dozens interface-level commands ke saath. Team ko HMAC-SHA-256 aur wide metrics chahiye the kyunki naye 40G links 10G links se alag nahi dikh rahe the. Change window mein unhone har router par <code>eigrp upgrade-cli CORE</code> chalaya. Neighbours up rahe, har interface command <code>af-interface</code> ke neeche chala gaya, aur 40G paths umeed ke mutabik 10G paths se jeetne lage.</p><p><b>Seekh:</b> named mode EIGRP chalane ka modern tarika hai; upgrade-cli se migrate karo, phir SHA-256 authentication jaise features enable karo.</p></div>

<div class="iv"><p class="q">"Aap classic mode ki jagah EIGRP named mode kyun use karoge?"</p><p>Strong answer: named mode saari EIGRP configuration ek hierarchical jagah rakhta hai (address family, af-interface, topology base), ek process mein IPv4 aur IPv6 dono support karta hai, HMAC-SHA-256 authentication jodta hai, aur picosecond delay ke saath 64-bit wide metrics use karta hai, isliye 1 Gbps se tez links alag pehchane jaate hain; RIB ko value 128 ke RIB scale se divide karke dikhti hai. Non-disruptive migration ke liye eigrp upgrade-cli zaroor bolo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Named mode: <code>router eigrp NAME</code>, <code>address-family ... autonomous-system N</code>, phir af-interface aur topology base.</li>
<li>Interface settings af-interface ke neeche; variance, maximum-paths aur redistribution topology base ke neeche.</li>
<li>Wide metrics 64-bit values, picosecond delay aur 65536 scale use karte hain; RIB value / 128 dikhata hai.</li>
<li>Lab 1 ka R2 wala path: composite 2,621,440, RIB metric 20480; FD aur FS ka logic same hai.</li>
<li><code>eigrp upgrade-cli</code> bina neighbours reset kiye classic ko named mode mein migrate karta hai.</li>
</ul></div>
`}};export{e as default};