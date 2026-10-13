var e={id:`redistribution-rules`,h:{en:`Redistribution rules and seed metrics per protocol`,hi:`Redistribution ke rules aur har protocol ke seed metrics`},body:{en:`
<p>At an airport currency desk, every country has its own rules. Some currencies convert automatically at a fixed rate, some need you to fill a form first, and some cannot be converted at all unless you insist. Redistribution works the same way. Each routing protocol has its own rule for the <b>seed metric</b> (the starting metric given to a redistributed route) and its own quirks about what it will take. This chapter is the rulebook; chapter 9 puts it to work.</p>

<h3>Five rules that apply to every protocol</h3>
<ol>
<li><b>Redistribution reads the routing table.</b> <code>redistribute X</code> takes routes that are <b>installed in the RIB by source X</b>, plus the connected networks of interfaces on which X is enabled. A route that lost the AD contest to another source is not taken.</li>
<li><b>It is per router and per direction.</b> <code>redistribute ospf 1</code> under EIGRP on BR1 moves routes one way on one router. The other direction and the other boundary router need their own commands.</li>
<li><b>It is not transitive on one router.</b> If BR1 redistributes RIP into OSPF and OSPF into EIGRP, the RIP routes do <b>not</b> reach EIGRP, because they are not installed as OSPF routes on BR1.</li>
<li><b>The router must run both sources</b> and have routes from the source installed.</li>
<li><b>Redistributed routes are external in the target.</b> EIGRP marks them D EX (AD 170) and records the origin; OSPF creates type-5 LSAs (type-7 in an NSSA) seen as O E1 or O E2; BGP gives them origin "incomplete" (<code>?</code>).</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="What redistribute eigrp takes from the RIB">
<rect x="20" y="20" width="260" height="210" rx="10" fill="#e2e8f0"/>
<text x="150" y="44" text-anchor="middle" class="svg-ink" font-size="14">BR1 routing table</text>
<rect x="40" y="60" width="220" height="26" rx="6" fill="#bae6fd"/><text x="150" y="78" text-anchor="middle" class="svg-ink" font-size="12">D 172.16.10.0/24 (EIGRP)</text>
<rect x="40" y="94" width="220" height="26" rx="6" fill="#bae6fd"/><text x="150" y="112" text-anchor="middle" class="svg-ink" font-size="12">C 10.1.1.0/24 (EIGRP enabled)</text>
<rect x="40" y="128" width="220" height="26" rx="6" fill="#fed7aa"/><text x="150" y="146" text-anchor="middle" class="svg-ink" font-size="12">O E2 192.168.50.0/24 (won AD)</text>
<rect x="40" y="162" width="220" height="26" rx="6" fill="#bbf7d0"/><text x="150" y="180" text-anchor="middle" class="svg-ink" font-size="12">O 10.200.10.0/24 (OSPF)</text>
<line x1="280" y1="95" x2="380" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="330" y="86" text-anchor="middle" class="svg-accent" font-size="12">redistribute</text>
<rect x="380" y="60" width="240" height="80" rx="10" fill="#bbf7d0"/>
<text x="500" y="84" text-anchor="middle" class="svg-ink" font-size="13">into OSPF (type 5)</text>
<text x="500" y="104" text-anchor="middle" class="svg-muted" font-size="12">172.16.10.0/24, 10.1.1.0/24</text>
<text x="500" y="124" text-anchor="middle" class="svg-muted" font-size="12">192.168.50.0/24 NOT taken</text>
<text x="450" y="200" text-anchor="middle" class="svg-muted" font-size="12">only EIGRP-installed and EIGRP-enabled connected</text>
</svg><p class="cap"><code>redistribute eigrp 100</code> on BR1 exports routes installed by EIGRP and EIGRP-enabled connected networks, never a prefix that OSPF won.</p></div>

<h3>Seed metrics, protocol by protocol</h3>
<table class="cmp"><tr><th>Into</th><th>Default seed metric</th><th>What you must know</th></tr>
<tr><td>EIGRP</td><td>infinite (unreachable) for routes from other routing protocols</td><td>Set <code>metric BW DELAY REL LOAD MTU</code>, <code>default-metric</code>, or <code>set metric</code> in a route map. Connected and static routes use the interface metric. Another EIGRP AS keeps its metric.</td></tr>
<tr><td>OSPF</td><td>20, type E2 (BGP-learned routes get 1)</td><td>Change with <code>metric</code>, <code>metric-type 1</code> or a route map. E2 cost stays fixed across the domain; E1 adds internal cost.</td></tr>
<tr><td>BGP</td><td>MED = the route's IGP metric</td><td>Next hop is the IGP next hop, origin is incomplete, local weight 32768. From OSPF, only internal routes are taken unless you add <code>match internal external 1 external 2</code>.</td></tr>
<tr><td>RIP</td><td>infinite for other routing protocols</td><td>Give a hop count (1 to 15) with <code>metric</code> or <code>default-metric</code>.</td></tr></table>
<p>Two more defaults: <code>redistribute ospf</code> into EIGRP or RIP takes internal and external OSPF routes; <code>redistribute bgp</code> into an IGP takes only <b>eBGP</b> routes unless <code>bgp redistribute-internal</code> is configured. That second default protects IGPs from a full iBGP table.</p>

<h3>The EIGRP seed metric in numbers</h3>
<p>The five values are bandwidth in kbit/s, delay in tens of microseconds, reliability out of 255, load out of 255, and MTU. With the classic formula (K1 = K3 = 1) only bandwidth and delay count: metric = 256 x (10,000,000 / min bandwidth + total delay / 10).</p>

<div class="eg"><p><b>Worked example: the lab seed 100000 100 255 1 1500.</b> On BR1, the redistributed route has bandwidth 100,000 kbit/s and delay 1000 microseconds (100 tens). Its metric is 256 x (100 + 100) = 51,200, which E1 sees as the reported distance. E1 adds its Gigabit link (bandwidth 1,000,000 kbit/s, delay 10 microseconds): minimum bandwidth stays 100,000, delay becomes 1010, so the feasible distance is 256 x (100 + 101) = <b>51,456</b>.</p></div>

<pre class="out">E1#show ip eigrp topology 10.200.10.0/24
EIGRP-IPv4 Topology Entry for AS(100)/ID(5.5.5.5) for 10.200.10.0/24
  State is Passive, Query origin flag is 1, <span class="hl">2 Successor(s), FD is 51456</span>
  Descriptor Blocks:
  10.1.1.2 (GigabitEthernet0/0), from 10.1.1.2, Send flag is 0x0
      <span class="hl">Composite metric is (51456/51200), route is External</span>
      Vector metric:
        Minimum bandwidth is 100000 Kbit
        Total delay is 1010 microseconds
        Reliability is 255/255
        Load is 1/255
        Minimum MTU is 1500
        Hop count is 1
        <span class="hl">Originating router is 1.1.1.1</span>
      External data:
        AS number of route is 1
        <span class="hl">External protocol is OSPF, external metric is 2</span>
        Administrator tag is 110 (0x0000006E)</pre>
<p>The External data block is gold for troubleshooting: it tells you which router redistributed the route, from which protocol and process, the original metric, and the tag.</p>

<h3>The subnets keyword: a little history</h3>
<p>On older IOS releases, <code>redistribute eigrp 100</code> under OSPF without <code>subnets</code> redistributed only <b>classful</b> networks and printed "% Only classful networks will be redistributed". Networks like 172.16.10.0/24 silently stayed out. On recent IOS and IOS-XE releases subnets behaviour is the default and the keyword is added to the running configuration automatically. Always type it anyway: it documents intent and protects you on older code. OSPFv3 has no <code>subnets</code> keyword.</p>

<h3>Connected, static and default routes</h3>
<ul>
<li><code>redistribute connected [route-map]</code> injects interface networks. E1 uses this for Loopback1 (192.168.50.0/24), which is why that network is D EX everywhere else. Use <code>match interface</code> in a route map to pick interfaces.</li>
<li><code>redistribute static</code> injects static routes; into EIGRP they keep the outgoing interface metric.</li>
<li>A default route is special. OSPF will not advertise 0.0.0.0/0 through <code>redistribute</code>; use <code>default-information originate [always]</code>. BGP needs <code>default-information originate</code> or <code>neighbor ... default-originate</code>.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Typing <code>redistribute ospf 1</code> under EIGRP with no metric. IOS accepts it, prints nothing, and <code>show ip protocols</code> even shows "Redistributing: ospf 1", yet no route appears, because the seed is infinite. Always add <code>metric</code> or <code>default-metric</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Default metric of routes redistributed into OSPF?" 20, E2, except 1 for BGP. "Which OSPF routes go into BGP by default?" Internal only. "Which BGP routes go into an IGP by default?" eBGP only. "Why is 172.16.10.0/24 missing on an old router?" No <code>subnets</code>.</p></div>

<div class="scn"><h4>The data center routes that never reached the WAN</h4><p>A company redistributed OSPF into BGP at its WAN edge with <code>redistribute ospf 1</code>. Campus networks appeared in BGP, but the data center networks, which were redistributed into OSPF from static routes on a DC firewall pair, did not. <code>show ip route</code> on the edge showed them as O E2; <code>show bgp ipv4 unicast</code> did not list them. The default for OSPF into BGP is internal routes only. Changing the command to <code>redistribute ospf 1 match internal external 1 external 2</code>, with a prefix-list route map, brought them in.</p><p><b>Lesson:</b> every protocol pair has its own defaults; know them before assuming a filter is to blame.</p></div>

<div class="iv"><p class="q">"You redistribute OSPF into EIGRP and nothing shows up. What do you check first?"</p><p>Strong answer: the seed metric. EIGRP treats routes from another routing protocol as unreachable without <code>metric</code>, <code>default-metric</code> or a route-map <code>set metric</code>; connected, static and other EIGRP AS routes are the exceptions. Then confirm the routes are actually installed as OSPF on the redistributing router, check any route map or distribute-list, and verify with <code>show ip eigrp topology</code> where the External data shows protocol, originating router and tag.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Redistribution takes source-installed routes plus source-enabled connected networks, per router, per direction, not transitively.</li>
<li>Seeds: EIGRP and RIP need a metric; OSPF defaults to 20 E2 (1 from BGP); BGP sets MED from the IGP metric.</li>
<li>OSPF into BGP takes internal routes only by default; BGP into an IGP takes eBGP routes only.</li>
<li>Type <code>subnets</code> when redistributing into OSPF; older releases took only classful networks without it.</li>
<li>Default routes need <code>default-information originate</code> in OSPF and BGP.</li>
</ul></div>
`,hi:`
<p>Airport ke currency desk par har desh ke apne rules hote hain. Kuch currencies fixed rate par apne aap convert ho jaati hain, kuch ke liye pehle form bharna padta hai, aur kuch tab tak convert nahi hoti jab tak aap zid na karo. Redistribution bhi aise hi kaam karta hai. Har routing protocol ka <b>seed metric</b> (redistributed route ko diya gaya shuruaati metric) ka apna rule hai aur yeh kya lega uske apne nakhre hain. Yeh chapter rulebook hai; chapter 9 ise kaam mein laata hai.</p>

<h3>Paanch rules jo har protocol par lagte hain</h3>
<ol>
<li><b>Redistribution routing table padhta hai.</b> <code>redistribute X</code> woh routes leta hai jo <b>source X ne RIB mein install kiye</b> hain, plus un interfaces ke connected networks jin par X enabled hai. Jo route kisi doosre source se AD contest haar gaya, woh nahi liya jaata.</li>
<li><b>Yeh per router aur per direction hai.</b> BR1 par EIGRP ke neeche <code>redistribute ospf 1</code> ek router par ek taraf routes le jaata hai. Doosri direction aur doosre boundary router ko apne commands chahiye.</li>
<li><b>Ek router par yeh transitive nahi hai.</b> Agar BR1 RIP ko OSPF mein aur OSPF ko EIGRP mein redistribute karta hai, to RIP routes EIGRP tak <b>nahi</b> pahunchte, kyunki BR1 par woh OSPF routes ki tarah installed nahi hain.</li>
<li><b>Router ko dono sources chalane chahiye</b> aur source ke routes installed hone chahiye.</li>
<li><b>Redistributed routes target mein external hote hain.</b> EIGRP unhe D EX (AD 170) mark karta hai aur origin record karta hai; OSPF type-5 LSAs banata hai (NSSA mein type-7) jo O E1 ya O E2 dikhte hain; BGP unhe origin "incomplete" (<code>?</code>) deta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="What redistribute eigrp takes from the RIB">
<rect x="20" y="20" width="260" height="210" rx="10" fill="#e2e8f0"/>
<text x="150" y="44" text-anchor="middle" class="svg-ink" font-size="14">BR1 routing table</text>
<rect x="40" y="60" width="220" height="26" rx="6" fill="#bae6fd"/><text x="150" y="78" text-anchor="middle" class="svg-ink" font-size="12">D 172.16.10.0/24 (EIGRP)</text>
<rect x="40" y="94" width="220" height="26" rx="6" fill="#bae6fd"/><text x="150" y="112" text-anchor="middle" class="svg-ink" font-size="12">C 10.1.1.0/24 (EIGRP enabled)</text>
<rect x="40" y="128" width="220" height="26" rx="6" fill="#fed7aa"/><text x="150" y="146" text-anchor="middle" class="svg-ink" font-size="12">O E2 192.168.50.0/24 (AD jeeta)</text>
<rect x="40" y="162" width="220" height="26" rx="6" fill="#bbf7d0"/><text x="150" y="180" text-anchor="middle" class="svg-ink" font-size="12">O 10.200.10.0/24 (OSPF)</text>
<line x1="280" y1="95" x2="380" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="330" y="86" text-anchor="middle" class="svg-accent" font-size="12">redistribute</text>
<rect x="380" y="60" width="240" height="80" rx="10" fill="#bbf7d0"/>
<text x="500" y="84" text-anchor="middle" class="svg-ink" font-size="13">OSPF mein (type 5)</text>
<text x="500" y="104" text-anchor="middle" class="svg-muted" font-size="12">172.16.10.0/24, 10.1.1.0/24</text>
<text x="500" y="124" text-anchor="middle" class="svg-muted" font-size="12">192.168.50.0/24 NAHI liya</text>
<text x="450" y="200" text-anchor="middle" class="svg-muted" font-size="12">sirf EIGRP-installed aur EIGRP-enabled connected</text>
</svg><p class="cap">BR1 par <code>redistribute eigrp 100</code> EIGRP dwara installed routes aur EIGRP-enabled connected networks export karta hai, kabhi woh prefix nahi jo OSPF jeet gaya.</p></div>

<h3>Seed metrics, protocol dar protocol</h3>
<table class="cmp"><tr><th>Kismein</th><th>Default seed metric</th><th>Kya jaanna zaroori hai</th></tr>
<tr><td>EIGRP</td><td>doosre routing protocols ke routes ke liye infinite (unreachable)</td><td><code>metric BW DELAY REL LOAD MTU</code>, <code>default-metric</code>, ya route map mein <code>set metric</code> set karo. Connected aur static routes interface metric use karte hain. Doosra EIGRP AS apna metric rakhta hai.</td></tr>
<tr><td>OSPF</td><td>20, type E2 (BGP se seekhe routes ko 1)</td><td><code>metric</code>, <code>metric-type 1</code> ya route map se badlo. E2 cost poore domain mein fixed rehta hai; E1 internal cost jodta hai.</td></tr>
<tr><td>BGP</td><td>MED = route ka IGP metric</td><td>Next hop IGP next hop hai, origin incomplete, local weight 32768. OSPF se sirf internal routes liye jaate hain jab tak aap <code>match internal external 1 external 2</code> na jodo.</td></tr>
<tr><td>RIP</td><td>doosre routing protocols ke liye infinite</td><td><code>metric</code> ya <code>default-metric</code> se hop count (1 se 15) do.</td></tr></table>
<p>Do aur defaults: EIGRP ya RIP mein <code>redistribute ospf</code> internal aur external dono OSPF routes leta hai; IGP mein <code>redistribute bgp</code> sirf <b>eBGP</b> routes leta hai jab tak <code>bgp redistribute-internal</code> configure na ho. Doosra default IGPs ko poori iBGP table se bachata hai.</p>

<h3>Numbers mein EIGRP seed metric</h3>
<p>Paanch values hain: bandwidth kbit/s mein, delay tens of microseconds mein, reliability 255 mein se, load 255 mein se, aur MTU. Classic formula (K1 = K3 = 1) mein sirf bandwidth aur delay count hote hain: metric = 256 x (10,000,000 / min bandwidth + total delay / 10).</p>

<div class="eg"><p><b>Worked example: lab ka seed 100000 100 255 1 1500.</b> BR1 par redistributed route ki bandwidth 100,000 kbit/s aur delay 1000 microseconds (100 tens) hai. Iska metric 256 x (100 + 100) = 51,200 hai, jise E1 reported distance ki tarah dekhta hai. E1 apna Gigabit link jodta hai (bandwidth 1,000,000 kbit/s, delay 10 microseconds): minimum bandwidth 100,000 hi rehti hai, delay 1010 ho jaata hai, isliye feasible distance 256 x (100 + 101) = <b>51,456</b> hai.</p></div>

<pre class="out">E1#show ip eigrp topology 10.200.10.0/24
EIGRP-IPv4 Topology Entry for AS(100)/ID(5.5.5.5) for 10.200.10.0/24
  State is Passive, Query origin flag is 1, <span class="hl">2 Successor(s), FD is 51456</span>
  Descriptor Blocks:
  10.1.1.2 (GigabitEthernet0/0), from 10.1.1.2, Send flag is 0x0
      <span class="hl">Composite metric is (51456/51200), route is External</span>
      Vector metric:
        Minimum bandwidth is 100000 Kbit
        Total delay is 1010 microseconds
        Reliability is 255/255
        Load is 1/255
        Minimum MTU is 1500
        Hop count is 1
        <span class="hl">Originating router is 1.1.1.1</span>
      External data:
        AS number of route is 1
        <span class="hl">External protocol is OSPF, external metric is 2</span>
        Administrator tag is 110 (0x0000006E)</pre>
<p>External data block troubleshooting ke liye sona hai: yeh batata hai ki kis router ne route redistribute kiya, kis protocol aur process se, original metric kya tha, aur tag kya hai.</p>

<h3>subnets keyword: thoda itihaas</h3>
<p>Purane IOS releases par OSPF ke neeche <code>subnets</code> ke bina <code>redistribute eigrp 100</code> sirf <b>classful</b> networks redistribute karta tha aur "% Only classful networks will be redistributed" print karta tha. 172.16.10.0/24 jaise networks chupchaap bahar reh jaate the. Recent IOS aur IOS-XE releases par subnets behaviour default hai aur keyword running configuration mein apne aap jud jaata hai. Phir bhi hamesha type karo: yeh irada document karta hai aur purane code par aapko bachata hai. OSPFv3 mein <code>subnets</code> keyword nahi hai.</p>

<h3>Connected, static aur default routes</h3>
<ul>
<li><code>redistribute connected [route-map]</code> interface networks inject karta hai. E1 ise Loopback1 (192.168.50.0/24) ke liye use karta hai, isliye woh network baaki har jagah D EX hai. Interfaces chunne ke liye route map mein <code>match interface</code> use karo.</li>
<li><code>redistribute static</code> static routes inject karta hai; EIGRP mein woh outgoing interface ka metric rakhte hain.</li>
<li>Default route special hai. OSPF 0.0.0.0/0 ko <code>redistribute</code> se advertise nahi karega; <code>default-information originate [always]</code> use karo. BGP ko <code>default-information originate</code> ya <code>neighbor ... default-originate</code> chahiye.</li>
</ul>

<div class="warn"><p><b>Common galti.</b> EIGRP ke neeche bina metric ke <code>redistribute ospf 1</code> type karna. IOS ise accept karta hai, kuch print nahi karta, aur <code>show ip protocols</code> "Redistributing: ospf 1" bhi dikhata hai, phir bhi koi route nahi aata, kyunki seed infinite hai. Hamesha <code>metric</code> ya <code>default-metric</code> jodo.</p></div>

<div class="exam"><p><b>Exam trap.</b> "OSPF mein redistribute kiye routes ka default metric?" 20, E2, sivaay BGP ke jiske liye 1. "Default mein kaunse OSPF routes BGP mein jaate hain?" Sirf internal. "Default mein kaunse BGP routes IGP mein jaate hain?" Sirf eBGP. "Purane router par 172.16.10.0/24 kyun missing hai?" <code>subnets</code> nahi hai.</p></div>

<div class="scn"><h4>Data center routes jo kabhi WAN tak nahi pahunche</h4><p>Ek company ne apne WAN edge par <code>redistribute ospf 1</code> se OSPF ko BGP mein redistribute kiya. Campus networks BGP mein aa gaye, lekin data center networks, jo DC firewall pair ke static routes se OSPF mein redistribute hue the, nahi aaye. Edge par <code>show ip route</code> unhe O E2 dikha raha tha; <code>show bgp ipv4 unicast</code> mein woh nahi the. OSPF se BGP ka default sirf internal routes hai. Command ko prefix-list route map ke saath <code>redistribute ospf 1 match internal external 1 external 2</code> karne se woh aa gaye.</p><p><b>Seekh:</b> har protocol pair ke apne defaults hain; filter ko dosh dene se pehle unhe jaano.</p></div>

<div class="iv"><p class="q">"Aap OSPF ko EIGRP mein redistribute karte ho aur kuch nahi dikhta. Pehle kya check karoge?"</p><p>Strong answer: seed metric. <code>metric</code>, <code>default-metric</code> ya route-map <code>set metric</code> ke bina EIGRP doosre routing protocol ke routes ko unreachable maanta hai; connected, static aur doosre EIGRP AS ke routes exceptions hain. Phir confirm karo ki routes redistribute karne wale router par sach mein OSPF ki tarah installed hain, koi route map ya distribute-list check karo, aur <code>show ip eigrp topology</code> se verify karo jahan External data protocol, originating router aur tag dikhata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Redistribution source-installed routes plus source-enabled connected networks leta hai, per router, per direction, transitive nahi.</li>
<li>Seeds: EIGRP aur RIP ko metric chahiye; OSPF default 20 E2 (BGP se 1); BGP IGP metric se MED set karta hai.</li>
<li>OSPF se BGP default mein sirf internal routes leta hai; BGP se IGP sirf eBGP routes leta hai.</li>
<li>OSPF mein redistribute karte waqt <code>subnets</code> type karo; purane releases iske bina sirf classful networks lete the.</li>
<li>OSPF aur BGP mein default routes ko <code>default-information originate</code> chahiye.</li>
</ul></div>
`}};export{e as default};