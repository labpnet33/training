var e={id:`summarisation`,h:{en:`Manual and auto-summarisation: EIGRP and every other protocol`,hi:`Manual aur auto-summarisation: EIGRP aur har doosra protocol`},body:{en:`
<p>Instead of giving a taxi driver the exact house number of every shop in a market, you can say "take me to Sector 10 market". The driver needs one instruction instead of forty, and if one shop closes, nothing changes for the driver. That is route <b>summarisation</b>. It shrinks routing tables, hides flaps, and, in EIGRP, stops Queries at the summary boundary. But a summary that is too wide sends people to the wrong market, and one configured on the wrong exit sends them nowhere. Blueprint item 1.5 asks you to troubleshoot manual and auto-summarisation with <b>any</b> routing protocol, so this chapter covers EIGRP in depth and then the others.</p>

<h3>EIGRP manual summarisation, precisely</h3>
<pre class="code"><span class="c">! named mode (lab 1, SP1)</span>
router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 10
  af-interface GigabitEthernet0/0
   summary-address 10.1.0.0 255.255.252.0
<span class="c">! classic mode</span>
interface GigabitEthernet0/0
 ip summary-address eigrp 10 10.1.0.0 255.255.252.0</pre>
<ul>
<li>Configured <b>per interface</b>; the summary is sent out of that interface only, and the component routes are suppressed there.</li>
<li>It is advertised only while at least <b>one component</b> exists in the topology table.</li>
<li>Its metric is the <b>lowest</b> component metric. If that component flaps, the summary metric changes and an Update ripples out. In named mode, <code>summary-metric 10.1.0.0/22 ...</code> under <code>topology base</code> fixes the metric.</li>
<li>The router installs a discard route <b>to Null0 with AD 5</b>, so packets for non-existent components are dropped instead of looping.</li>
<li>Adding or removing a summary makes the neighbour on that interface <b>resync</b> (graceful, not a reset): <code>is resync: summary configured</code>.</li>
<li>A <code>leak-map</code> on the summary lets chosen components go out alongside it (for example, one data-centre /24 for traffic engineering).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Summary on SP1">
<rect x="20" y="20" width="150" height="160" rx="10" fill="#bbf7d0"/><text x="95" y="45" text-anchor="middle" class="svg-ink" font-size="14">SP1 LANs</text>
<text x="95" y="75" text-anchor="middle" class="svg-ink" font-size="12">10.1.0.0/24</text><text x="95" y="98" text-anchor="middle" class="svg-ink" font-size="12">10.1.1.0/24</text><text x="95" y="121" text-anchor="middle" class="svg-ink" font-size="12">10.1.2.0/24</text><text x="95" y="144" text-anchor="middle" class="svg-ink" font-size="12">10.1.3.0/24</text>
<rect x="240" y="70" width="130" height="60" rx="8" fill="#bae6fd"/><text x="305" y="96" text-anchor="middle" class="svg-ink" font-size="14">SP1</text><text x="305" y="114" text-anchor="middle" class="svg-muted" font-size="12">Null0 /22, AD 5</text>
<rect x="480" y="70" width="140" height="60" rx="8" fill="#fde68a"/><text x="550" y="96" text-anchor="middle" class="svg-ink" font-size="14">HUB</text><text x="550" y="114" text-anchor="middle" class="svg-muted" font-size="12">D 10.1.0.0/22</text>
<line x1="170" y1="100" x2="240" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="370" y1="100" x2="480" y2="100" stroke="#64748b" stroke-width="2"/><text x="425" y="92" text-anchor="middle" class="svg-accent" font-size="12">only /22</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Summary configured on SP1's Gi0/0 (uplink), not on the LANs</text>
</svg><p class="cap">Four /24s leave SP1 as one /22; SP1 keeps a Null0 route for the whole block.</p></div>

<h3>Lab walkthrough: prove it</h3>
<pre class="out">HUB#show ip route eigrp | include /22
<span class="hl">D        10.1.0.0/22 [90/10880] via 10.10.1.2, 00:04:12, GigabitEthernet0/0</span>
D        10.2.0.0/22 [90/10880] via 10.10.2.2, 00:03:55, GigabitEthernet0/1
SP1#show ip route 10.1.0.0 255.255.252.0
Routing entry for 10.1.0.0/22
  <span class="hl">Known via "eigrp 10", distance 5</span>, metric 1280, type internal
  Redistributing via eigrp 10
  Routing Descriptor Blocks:
  * directly connected, via Null0
      Route metric is 1280, traffic share count is 1</pre>
<p>This answers the lab question: the local summary has <b>AD 5</b>. Note the mask in the command. <code>show ip route 10.1.0.0</code> alone returns the longest match for that address, the connected 10.1.0.0/24, not the summary.</p>

<div class="eg"><p><b>Worked example: is the summary exact?</b> Components 10.1.0.0 to 10.1.3.0. In binary the third octet runs 000000<b>00</b> to 000000<b>11</b>: the first 6 bits of the third octet are common, so the prefix is 8 + 8 + 6 = <b>/22</b>, mask 255.255.252.0. If you typed 255.255.248.0 (/21), SP1 would also claim 10.1.4.0 to 10.1.7.0. If another branch owns 10.1.4.0/24, the hub still prefers that longer /24, but the moment it disappears the hub sends the traffic to SP1, which drops it into Null0.</p></div>

<h3>Auto-summarisation</h3>
<p><code>auto-summary</code> summarises at <b>classful boundaries</b> when a route crosses into a different major network. It is <b>off by default</b> on current IOS, and in named mode it lives under <code>topology base</code>. The classic failure is a <b>discontiguous network</b>: two sites each own subnets of 172.16.0.0/16, separated by 10.0.0.0/8 links. With auto-summary, both sites advertise 172.16.0.0/16 into the core; the core load-balances or picks one, and half the traffic goes to the wrong site. Each site also has a local 172.16.0.0/16 to Null0. <code>show ip protocols</code> shows "Automatic Summarization: enabled" as the clue; <code>no auto-summary</code> fixes it.</p>

<h3>Summarisation in other protocols</h3>
<table class="cmp"><tr><th>Protocol</th><th>Where and how</th><th>Troubleshooting hint</th></tr>
<tr><td>EIGRP</td><td>Any interface: <code>summary-address</code> / <code>ip summary-address eigrp</code></td><td>Stub needs <code>summary</code>; Null0 AD 5</td></tr>
<tr><td>OSPF</td><td>Only on an ABR (<code>area X range</code>) or ASBR (<code>summary-address</code> for externals)</td><td>An <code>area range</code> on a non-ABR does nothing; wrong area number</td></tr>
<tr><td>BGP</td><td><code>aggregate-address ... summary-only</code></td><td>Needs a component in the BGP table; <code>as-set</code> keeps AS path info</td></tr>
<tr><td>RIPv2</td><td><code>ip summary-address rip</code> on an interface; auto-summary on by default in older IOS</td><td>Discontiguous networks need <code>no auto-summary</code></td></tr>
</table>
<p>All of them create a local discard route to Null0 for the summary (OSPF and BGP as well), and all of them fail when no component exists.</p>

<div class="warn"><p><b>Common mistakes.</b> Summary on the LAN interface instead of the uplink; mask too wide, which claims someone else's space; a stub configured without <code>summary</code>; forgetting that the summary disappears when its last component goes down; using <code>show ip route</code> without the mask and concluding the summary is missing.</p></div>

<div class="exam"><p><b>Exam trap.</b> EIGRP summaries can be configured on any router and any interface, unlike OSPF (ABR and ASBR only). The summary's Null0 route has AD 5; its metric is the lowest component metric. Auto-summary is off by default today but still appears in questions about discontiguous networks.</p></div>

<div class="scn"><h4>The summary that ate a data centre</h4><p>A branch engineer summarised the branch LANs as 10.0.0.0/8 "to keep it simple". The hub learned 10.0.0.0/8 from the branch, but it had more specific routes for everything else, so nothing broke for weeks. Then the data-centre routes briefly flapped during maintenance. For 40 seconds the only match on the hub for 10.100.0.0 was the branch's /8, so data-centre traffic was sent to a small branch router, which dropped it into its Null0 route. The fix was the correct /22 summary. <code>show ip route 10.100.0.10</code> during the incident would have shown the /8 via the branch.</p><p><b>Lesson:</b> summarise exactly what you own, nothing more.</p></div>

<div class="iv"><p class="q">"Why does a router install a Null0 route when it summarises, and what is its AD in EIGRP?"</p><p>To prevent loops: if a packet arrives for a subnet inside the summary that does not exist, the summarising router drops it instead of sending it back along a default route toward the router that sent it. In EIGRP the summary route has AD 5. Mention that the metric is the lowest component, that the summary disappears without components, and that OSPF and BGP do the same with their own discard routes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EIGRP summarises per interface, anywhere; components are suppressed out of that interface.</li>
<li>Local Null0 summary route, AD 5; metric = lowest component; exists only with a component.</li>
<li>Use the mask when checking: <code>show ip route 10.1.0.0 255.255.252.0</code>.</li>
<li>Auto-summary (off by default) breaks discontiguous networks.</li>
<li>OSPF summarises only on ABR/ASBR; BGP uses aggregate-address; all create discard routes.</li>
</ul></div>
`,hi:`
<p>Taxi driver ko market ki har dukaan ka exact house number dene ki jagah aap bol sakte ho "Sector 10 market le chalo". Driver ko chaalis ki jagah ek instruction chahiye, aur agar ek dukaan band ho jaaye to driver ke liye kuch nahi badalta. Yahi route <b>summarisation</b> hai. Yeh routing tables chhoti karta hai, flaps chhupata hai, aur EIGRP mein Queries ko summary boundary par rok deta hai. Lekin bahut chauda summary logon ko galat market bhejta hai, aur galat exit par configured summary unhe kahin nahi bhejta. Blueprint item 1.5 aapse <b>kisi bhi</b> routing protocol ke saath manual aur auto-summarisation troubleshoot karwata hai, isliye yeh chapter EIGRP ko gehraai se aur phir baaki protocols ko cover karta hai.</p>

<h3>EIGRP manual summarisation, precisely</h3>
<pre class="code"><span class="c">! named mode (lab 1, SP1)</span>
router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 10
  af-interface GigabitEthernet0/0
   summary-address 10.1.0.0 255.255.252.0
<span class="c">! classic mode</span>
interface GigabitEthernet0/0
 ip summary-address eigrp 10 10.1.0.0 255.255.252.0</pre>
<ul>
<li><b>Per interface</b> configure hota hai; summary sirf usi interface se jaata hai, aur component routes wahan suppress hote hain.</li>
<li>Yeh tabhi advertise hota hai jab topology table mein kam se kam <b>ek component</b> ho.</li>
<li>Iska metric <b>sabse kam</b> component metric hota hai. Agar woh component flap kare, summary metric badalta hai aur ek Update aage failta hai. Named mode mein <code>topology base</code> ke neeche <code>summary-metric 10.1.0.0/22 ...</code> metric fix kar deta hai.</li>
<li>Router <b>AD 5 ke saath Null0</b> ka discard route install karta hai, taaki non-existent components ke packets loop hone ki jagah drop hon.</li>
<li>Summary add ya remove karne se us interface ka neighbour <b>resync</b> hota hai (graceful, reset nahi): <code>is resync: summary configured</code>.</li>
<li>Summary par <code>leak-map</code> chune hue components ko uske saath bahar jaane deta hai (jaise traffic engineering ke liye ek data-centre /24).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="SP1 par summary">
<rect x="20" y="20" width="150" height="160" rx="10" fill="#bbf7d0"/><text x="95" y="45" text-anchor="middle" class="svg-ink" font-size="14">SP1 LANs</text>
<text x="95" y="75" text-anchor="middle" class="svg-ink" font-size="12">10.1.0.0/24</text><text x="95" y="98" text-anchor="middle" class="svg-ink" font-size="12">10.1.1.0/24</text><text x="95" y="121" text-anchor="middle" class="svg-ink" font-size="12">10.1.2.0/24</text><text x="95" y="144" text-anchor="middle" class="svg-ink" font-size="12">10.1.3.0/24</text>
<rect x="240" y="70" width="130" height="60" rx="8" fill="#bae6fd"/><text x="305" y="96" text-anchor="middle" class="svg-ink" font-size="14">SP1</text><text x="305" y="114" text-anchor="middle" class="svg-muted" font-size="12">Null0 /22, AD 5</text>
<rect x="480" y="70" width="140" height="60" rx="8" fill="#fde68a"/><text x="550" y="96" text-anchor="middle" class="svg-ink" font-size="14">HUB</text><text x="550" y="114" text-anchor="middle" class="svg-muted" font-size="12">D 10.1.0.0/22</text>
<line x1="170" y1="100" x2="240" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="370" y1="100" x2="480" y2="100" stroke="#64748b" stroke-width="2"/><text x="425" y="92" text-anchor="middle" class="svg-accent" font-size="12">sirf /22</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Summary SP1 ke Gi0/0 (uplink) par configured, LANs par nahi</text>
</svg><p class="cap">Chaar /24s SP1 se ek /22 ban kar nikalte hain; SP1 poore block ke liye Null0 route rakhta hai.</p></div>

<h3>Lab walkthrough: prove karo</h3>
<pre class="out">HUB#show ip route eigrp | include /22
<span class="hl">D        10.1.0.0/22 [90/10880] via 10.10.1.2, 00:04:12, GigabitEthernet0/0</span>
D        10.2.0.0/22 [90/10880] via 10.10.2.2, 00:03:55, GigabitEthernet0/1
SP1#show ip route 10.1.0.0 255.255.252.0
Routing entry for 10.1.0.0/22
  <span class="hl">Known via "eigrp 10", distance 5</span>, metric 1280, type internal
  Redistributing via eigrp 10
  Routing Descriptor Blocks:
  * directly connected, via Null0
      Route metric is 1280, traffic share count is 1</pre>
<p>Yeh lab question ka jawab hai: local summary ka <b>AD 5</b> hai. Command mein mask par dhyan do. Sirf <code>show ip route 10.1.0.0</code> us address ka longest match deta hai, yaani connected 10.1.0.0/24, summary nahi.</p>

<div class="eg"><p><b>Worked example: kya summary exact hai?</b> Components 10.1.0.0 se 10.1.3.0. Binary mein teesra octet 000000<b>00</b> se 000000<b>11</b> tak chalta hai: teesre octet ke pehle 6 bits common hain, isliye prefix 8 + 8 + 6 = <b>/22</b>, mask 255.255.252.0. Agar aap 255.255.248.0 (/21) type karte, to SP1 10.1.4.0 se 10.1.7.0 par bhi claim karta. Agar kisi aur branch ke paas 10.1.4.0/24 hai, hub ab bhi us lambe /24 ko prefer karta, lekin jaise hi woh gayab hota, hub traffic SP1 ko bhejta, jo use Null0 mein drop kar deta.</p></div>

<h3>Auto-summarisation</h3>
<p><code>auto-summary</code> <b>classful boundaries</b> par summarise karta hai jab route kisi alag major network mein jaata hai. Current IOS par yeh <b>default off</b> hai, aur named mode mein <code>topology base</code> ke neeche rehta hai. Classic failure <b>discontiguous network</b> hai: do sites ke paas 172.16.0.0/16 ke subnets hain, beech mein 10.0.0.0/8 links hain. Auto-summary ke saath dono sites core mein 172.16.0.0/16 advertise karti hain; core load-balance karta hai ya ek chunta hai, aur aadha traffic galat site par jaata hai. Har site par local 172.16.0.0/16 to Null0 bhi hota hai. <code>show ip protocols</code> clue ke roop mein "Automatic Summarization: enabled" dikhata hai; <code>no auto-summary</code> ise theek karta hai.</p>

<h3>Doosre protocols mein summarisation</h3>
<table class="cmp"><tr><th>Protocol</th><th>Kahan aur kaise</th><th>Troubleshooting hint</th></tr>
<tr><td>EIGRP</td><td>Kisi bhi interface par: <code>summary-address</code> / <code>ip summary-address eigrp</code></td><td>Stub ko <code>summary</code> chahiye; Null0 AD 5</td></tr>
<tr><td>OSPF</td><td>Sirf ABR par (<code>area X range</code>) ya ASBR par (externals ke liye <code>summary-address</code>)</td><td>Non-ABR par <code>area range</code> kuch nahi karta; galat area number</td></tr>
<tr><td>BGP</td><td><code>aggregate-address ... summary-only</code></td><td>BGP table mein component chahiye; <code>as-set</code> AS path info rakhta hai</td></tr>
<tr><td>RIPv2</td><td>Interface par <code>ip summary-address rip</code>; purane IOS mein auto-summary default on</td><td>Discontiguous networks ko <code>no auto-summary</code> chahiye</td></tr>
</table>
<p>Sab summary ke liye Null0 ka local discard route banate hain (OSPF aur BGP bhi), aur sab fail hote hain jab koi component nahi hota.</p>

<div class="warn"><p><b>Common galtiyan.</b> Uplink ki jagah LAN interface par summary; bahut chauda mask, jo kisi aur ki space claim karta hai; bina <code>summary</code> ke configured stub; bhool jaana ki aakhri component down hone par summary gayab ho jaata hai; bina mask ke <code>show ip route</code> use karke conclude karna ki summary missing hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> EIGRP summaries kisi bhi router aur kisi bhi interface par configure ho sakte hain, OSPF ke ulat (sirf ABR aur ASBR). Summary ke Null0 route ka AD 5 hai; iska metric sabse kam component metric hai. Auto-summary aaj default off hai lekin discontiguous networks wale questions mein ab bhi aata hai.</p></div>

<div class="scn"><h4>Summary jo data centre kha gaya</h4><p>Ek branch engineer ne "simple rakhne ke liye" branch LANs ko 10.0.0.0/8 ke roop mein summarise kar diya. Hub ne branch se 10.0.0.0/8 seekha, lekin baaki sab ke liye uske paas more specific routes the, isliye hafton tak kuch nahi toota. Phir maintenance ke dauraan data-centre routes thodi der flap hue. 40 second tak hub par 10.100.0.0 ka ek hi match branch ka /8 tha, isliye data-centre traffic ek chhote branch router ko bheja gaya, jisne use apne Null0 route mein drop kar diya. Fix sahi /22 summary tha. Incident ke dauraan <code>show ip route 10.100.0.10</code> branch ke through /8 dikha deta.</p><p><b>Seekh:</b> sirf utna hi summarise karo jitna aapka hai, usse zyada nahi.</p></div>

<div class="iv"><p class="q">"Summarise karte waqt router Null0 route kyun install karta hai, aur EIGRP mein iska AD kya hai?"</p><p>Loops rokne ke liye: agar summary ke andar kisi aise subnet ka packet aaye jo exist nahi karta, to summarising router use default route se bhejne wale router ki taraf wapas bhejne ki jagah drop kar deta hai. EIGRP mein summary route ka AD 5 hai. Batao ki metric sabse kam component ka hota hai, bina components ke summary gayab ho jaata hai, aur OSPF aur BGP bhi apne discard routes ke saath yahi karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EIGRP per interface, kahin bhi summarise karta hai; us interface se components suppress hote hain.</li>
<li>Local Null0 summary route, AD 5; metric = sabse kam component; sirf component ke saath exist karta hai.</li>
<li>Check karte waqt mask use karo: <code>show ip route 10.1.0.0 255.255.252.0</code>.</li>
<li>Auto-summary (default off) discontiguous networks tod deta hai.</li>
<li>OSPF sirf ABR/ASBR par summarise karta hai; BGP aggregate-address use karta hai; sab discard routes banate hain.</li>
</ul></div>
`}};export{e as default};