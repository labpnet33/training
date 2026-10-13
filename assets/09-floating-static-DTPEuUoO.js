var e={id:`floating-static`,h:{en:`Floating static routes: a backup that waits its turn`,hi:`Floating static routes: backup jo apni baari ka intezaar karta hai`},body:{en:`
<p>A cricket team keeps a substitute fielder in the dressing room. He is fully padded and ready, but he never walks on while all eleven players are fit. The moment someone is injured, he runs out. A <b>floating static route</b> is that substitute: a route you configure in advance with a <b>worse administrative distance</b>, so it stays out of the routing table while the primary route exists and appears automatically when the primary disappears.</p>

<h3>How it works</h3>
<p>Remember from chapter 5: for the <b>same prefix and length</b>, the lowest AD is installed. If you configure two default routes, one with AD 1 and one with AD 5, only the AD 1 route enters the table. The AD 5 route "floats" above it, invisible in <code>show ip route</code>, but still stored in the router's static configuration. When the AD 1 route is withdrawn, because its exit interface went down or its next hop became unreachable, the router installs the AD 5 route within a second or two. When the primary returns, the primary wins again and the backup floats away.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Clinic branch with two ISPs">
<rect x="10" y="100" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="60" y="122" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="60" y="140" text-anchor="middle" class="svg-muted" font-size="12">192.168.50.10</text>
<rect x="150" y="100" width="100" height="50" rx="8" fill="#bae6fd"/><text x="200" y="130" text-anchor="middle" class="svg-ink" font-size="13">BR</text>
<rect x="310" y="30" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="365" y="52" text-anchor="middle" class="svg-ink" font-size="13">ISP1 fibre</text><text x="365" y="70" text-anchor="middle" class="svg-muted" font-size="12">100.64.1.1</text>
<rect x="310" y="170" width="110" height="50" rx="8" fill="#fde68a"/><text x="365" y="192" text-anchor="middle" class="svg-ink" font-size="13">ISP2 backup</text><text x="365" y="210" text-anchor="middle" class="svg-muted" font-size="12">100.64.2.1</text>
<rect x="480" y="100" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="555" y="122" text-anchor="middle" class="svg-ink" font-size="13">WEB</text><text x="555" y="140" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.80</text>
<line x1="110" y1="125" x2="150" y2="125" stroke="#64748b" stroke-width="2"/>
<line x1="250" y1="115" x2="310" y2="55" stroke="#64748b" stroke-width="3"/><text x="250" y="72" class="svg-accent" font-size="12">AD 1</text>
<line x1="250" y1="135" x2="310" y2="195" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="250" y="190" class="svg-accent" font-size="12">AD 5</text>
<line x1="420" y1="55" x2="480" y2="115" stroke="#64748b" stroke-width="2"/><line x1="420" y1="195" x2="480" y2="135" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The second lab: primary default via the fibre (AD 1), floating default via the backup link (AD 5).</p></div>

<h3>Configure it</h3>
<pre class="code"><span class="c">! primary default via the paid fibre</span>
BR(config)# ip route 0.0.0.0 0.0.0.0 100.64.1.1
<span class="c">! floating default via the backup link, AD 5</span>
BR(config)# ip route 0.0.0.0 0.0.0.0 100.64.2.1 5</pre>
<p>Both lines are in the running configuration, but only one is in the routing table:</p>
<pre class="out">BR#show ip route static
Gateway of last resort is 100.64.1.1 to network 0.0.0.0

<span class="hl">S*    0.0.0.0/0 [1/0] via 100.64.1.1</span>

BR#show ip static route
Codes: M - Manual static, A - AAA download, N - IP NAT, D - DHCP,
       (legend trimmed)
Codes in []: A - active, N - non-active, B - BFD-tracked, D - Not Tracked, P - permanent, -T Default Track

Static local RIB for default

M  0.0.0.0/0 [1/0] via 100.64.1.1 [A]
<span class="hl">M          [5/0] via 100.64.2.1 [N]</span></pre>
<p><code>show ip static route</code> lists every configured static with a flag: <b>[A]</b> active, installed in the table; <b>[N]</b> non-active, configured but not installed. It is the best command for proving a floating route is ready.</p>

<h3>Test the failover</h3>
<pre class="code">BR(config)# interface GigabitEthernet0/1
BR(config-if)# shutdown</pre>
<pre class="out">%LINK-5-CHANGED: Interface GigabitEthernet0/1, changed state to administratively down
%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to down

BR#show ip route | include 0.0.0.0|Gateway
<span class="hl">Gateway of last resort is 100.64.2.1 to network 0.0.0.0
S*    0.0.0.0/0 [5/0] via 100.64.2.1</span>

BR#traceroute 198.51.100.80
Type escape sequence to abort.
Tracing the route to 198.51.100.80
VRF info: (vrf in name/id, vrf out name/id)
<span class="hl">  1 100.64.2.1 1 msec 0 msec 1 msec</span>
  2 198.51.100.80 1 msec 1 msec 0 msec</pre>
<p>The chain of events: Gi0/1 goes down, the connected route 100.64.1.0/30 disappears, the next hop 100.64.1.1 can no longer be resolved, the AD 1 default is withdrawn, and the AD 5 default is installed. Hop 1 of the trace is now ISP2.</p>

<div class="eg"><p><b>Worked example: the return path during failover.</b> WEB's gateway is ISP1 (198.51.100.1). During the fibre cut, WEB still replies to ISP1. ISP1's own primary route to the clinic, <code>ip route 192.168.50.0 255.255.255.0 100.64.1.2</code>, has just lost its next hop, so ISP1's floating route <code>ip route 192.168.50.0 255.255.255.0 198.51.100.2 5</code> takes over and hands the reply to ISP2, which delivers it to BR. The lab's ISPs are pre-built this way on purpose: a failover only works if <b>both</b> directions fail over.</p></div>

<h3>Choosing the AD</h3>
<ul>
<li>Backing up another static (AD 1): any value from 2 to 254 works; 5 or 10 are common.</li>
<li>Backing up OSPF: the static must be higher than 110, for example <code>ip route 10.0.0.0 255.0.0.0 10.9.9.1 115</code>.</li>
<li>Backing up EIGRP internal routes: higher than 90; for EIGRP external routes higher than 170.</li>
<li>AD 255 means "never install"; such a route is useless.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Trusting a floating static to detect every failure. It only activates when the primary route is <b>removed</b>, which needs the local interface to go down or the next hop to become unresolvable. If the fibre stays up to a media converter but the ISP's router behind it dies, the primary stays in the table and traffic is blackholed. Production designs add IP SLA tracking, <code>ip route 0.0.0.0 0.0.0.0 100.64.1.1 track 1</code>, which removes the route when a probe fails. That is beyond CCNA depth, but know it exists.</p></div>

<div class="exam"><p><b>Exam trap.</b> A backup static with AD 1 is <b>not</b> floating; it is an equal-cost path and both routes load-share. And a floating static configured with AD 100 behind OSPF (110) is not a backup at all: it wins, and OSPF's route disappears from the table.</p></div>

<div class="scn"><h4>The backup that took over on day one</h4><p>A retail chain rolled out 4G backup routers to 200 stores. Within a week the 4G bill was enormous. On the store routers, the template had <code>ip route 0.0.0.0 0.0.0.0 Cellular0/0 100</code>, but the MPLS default came from OSPF as <code>O*E2</code> with AD 110. AD 100 beat 110, so the 4G route won permanently and all traffic used cellular. Changing the floating AD to 250 put the MPLS default back in charge.</p><p><b>Lesson:</b> a floating route must have a higher AD than whatever it backs up, including dynamic routes.</p></div>

<div class="iv"><p class="q">"What is a floating static route and how do you verify it?"</p><p>Strong answer: a static route with a higher administrative distance than the primary route for the same prefix, so it is not installed until the primary is withdrawn. Configure it by adding the AD at the end of <code>ip route</code>. Verify with <code>show ip static route</code> (primary [A], backup [N]), then shut the primary interface and check <code>show ip route</code> shows [5/0] and traceroute uses the backup next hop. Mention that it does not detect upstream failures without IP SLA tracking, and that the return path must fail over too.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A floating static has a higher AD than the primary route for the same prefix.</li>
<li>It stays out of the table ([N]) until the primary is withdrawn, then installs automatically.</li>
<li>To back up OSPF use AD above 110; EIGRP above 90 (above 170 for external).</li>
<li>It only reacts to local interface down or unresolvable next hop; IP SLA tracking covers upstream failures.</li>
<li>Test failover with shutdown, <code>show ip route</code> and traceroute, and check the return path too.</li>
</ul></div>
`,hi:`
<p>Cricket team dressing room mein ek substitute fielder rakhti hai. Woh pads pehne poori tarah ready hai, lekin jab tak gyarah khiladi fit hain, kabhi field par nahi aata. Jaise hi koi injured hota hai, woh daud kar bahar aata hai. <b>Floating static route</b> wahi substitute hai: ek route jo aap pehle se <b>kharab administrative distance</b> ke saath configure karte ho, taaki jab tak primary route hai woh routing table se bahar rahe aur primary gayab hote hi apne aap aa jaaye.</p>

<h3>Yeh kaise kaam karta hai</h3>
<p>Chapter 5 yaad karo: <b>same prefix aur length</b> ke liye sabse kam AD install hoti hai. Agar aap do default routes configure karo, ek AD 1 aur ek AD 5 ke saath, to sirf AD 1 wala table mein jaata hai. AD 5 wala uske upar "float" karta hai, <code>show ip route</code> mein invisible, lekin router ki static configuration mein stored. Jab AD 1 wala route withdraw hota hai, kyunki uska exit interface down hua ya next hop unreachable ho gaya, router ek do second mein AD 5 wala route install kar deta hai. Primary wapas aane par primary phir jeetta hai aur backup float ho jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Do ISPs wali clinic branch">
<rect x="10" y="100" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="60" y="122" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="60" y="140" text-anchor="middle" class="svg-muted" font-size="12">192.168.50.10</text>
<rect x="150" y="100" width="100" height="50" rx="8" fill="#bae6fd"/><text x="200" y="130" text-anchor="middle" class="svg-ink" font-size="13">BR</text>
<rect x="310" y="30" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="365" y="52" text-anchor="middle" class="svg-ink" font-size="13">ISP1 fibre</text><text x="365" y="70" text-anchor="middle" class="svg-muted" font-size="12">100.64.1.1</text>
<rect x="310" y="170" width="110" height="50" rx="8" fill="#fde68a"/><text x="365" y="192" text-anchor="middle" class="svg-ink" font-size="13">ISP2 backup</text><text x="365" y="210" text-anchor="middle" class="svg-muted" font-size="12">100.64.2.1</text>
<rect x="480" y="100" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="555" y="122" text-anchor="middle" class="svg-ink" font-size="13">WEB</text><text x="555" y="140" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.80</text>
<line x1="110" y1="125" x2="150" y2="125" stroke="#64748b" stroke-width="2"/>
<line x1="250" y1="115" x2="310" y2="55" stroke="#64748b" stroke-width="3"/><text x="250" y="72" class="svg-accent" font-size="12">AD 1</text>
<line x1="250" y1="135" x2="310" y2="195" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="250" y="190" class="svg-accent" font-size="12">AD 5</text>
<line x1="420" y1="55" x2="480" y2="115" stroke="#64748b" stroke-width="2"/><line x1="420" y1="195" x2="480" y2="135" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Doosra lab: fibre se primary default (AD 1), backup link se floating default (AD 5).</p></div>

<h3>Configure karo</h3>
<pre class="code"><span class="c">! paid fibre se primary default</span>
BR(config)# ip route 0.0.0.0 0.0.0.0 100.64.1.1
<span class="c">! backup link se floating default, AD 5</span>
BR(config)# ip route 0.0.0.0 0.0.0.0 100.64.2.1 5</pre>
<p>Dono lines running configuration mein hain, lekin routing table mein sirf ek:</p>
<pre class="out">BR#show ip route static
Gateway of last resort is 100.64.1.1 to network 0.0.0.0

<span class="hl">S*    0.0.0.0/0 [1/0] via 100.64.1.1</span>

BR#show ip static route
Codes: M - Manual static, A - AAA download, N - IP NAT, D - DHCP,
       (legend trimmed)
Codes in []: A - active, N - non-active, B - BFD-tracked, D - Not Tracked, P - permanent, -T Default Track

Static local RIB for default

M  0.0.0.0/0 [1/0] via 100.64.1.1 [A]
<span class="hl">M          [5/0] via 100.64.2.1 [N]</span></pre>
<p><code>show ip static route</code> har configured static ko ek flag ke saath list karta hai: <b>[A]</b> active, table mein installed; <b>[N]</b> non-active, configured par installed nahi. Floating route ready hai yeh prove karne ke liye yeh sabse achhi command hai.</p>

<h3>Failover test karo</h3>
<pre class="code">BR(config)# interface GigabitEthernet0/1
BR(config-if)# shutdown</pre>
<pre class="out">%LINK-5-CHANGED: Interface GigabitEthernet0/1, changed state to administratively down
%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to down

BR#show ip route | include 0.0.0.0|Gateway
<span class="hl">Gateway of last resort is 100.64.2.1 to network 0.0.0.0
S*    0.0.0.0/0 [5/0] via 100.64.2.1</span>

BR#traceroute 198.51.100.80
Type escape sequence to abort.
Tracing the route to 198.51.100.80
VRF info: (vrf in name/id, vrf out name/id)
<span class="hl">  1 100.64.2.1 1 msec 0 msec 1 msec</span>
  2 198.51.100.80 1 msec 1 msec 0 msec</pre>
<p>Events ki chain: Gi0/1 down hota hai, connected route 100.64.1.0/30 gayab hota hai, next hop 100.64.1.1 ab resolve nahi hota, AD 1 default withdraw hota hai, aur AD 5 default install hota hai. Trace ka hop 1 ab ISP2 hai.</p>

<div class="eg"><p><b>Worked example: failover ke dauraan return path.</b> WEB ka gateway ISP1 (198.51.100.1) hai. Fibre cut ke dauraan bhi WEB ISP1 ko reply karta hai. ISP1 ka clinic ki taraf apna primary route, <code>ip route 192.168.50.0 255.255.255.0 100.64.1.2</code>, abhi apna next hop kho chuka hai, isliye ISP1 ka floating route <code>ip route 192.168.50.0 255.255.255.0 198.51.100.2 5</code> take over karta hai aur reply ISP2 ko deta hai, jo use BR tak deliver karta hai. Lab ke ISPs jaan-boojh kar aise bane hain: failover tabhi kaam karta hai jab <b>dono</b> directions fail over karein.</p></div>

<h3>AD kaise chunein</h3>
<ul>
<li>Doosre static (AD 1) ka backup: 2 se 254 tak koi bhi value chalegi; 5 ya 10 common hain.</li>
<li>OSPF ka backup: static 110 se zyada hona chahiye, jaise <code>ip route 10.0.0.0 255.0.0.0 10.9.9.1 115</code>.</li>
<li>EIGRP internal routes ka backup: 90 se zyada; EIGRP external routes ke liye 170 se zyada.</li>
<li>AD 255 ka matlab "kabhi install mat karo"; aisa route bekaar hai.</li>
</ul>

<div class="warn"><p><b>Common galti.</b> Floating static par har failure detect karne ka bharosa karna. Yeh tabhi activate hota hai jab primary route <b>remove</b> ho, jiske liye local interface down hona ya next hop unresolvable hona chahiye. Agar fibre media converter tak up rahe lekin uske peeche ISP ka router mar jaaye, primary table mein rehta hai aur traffic blackhole hota hai. Production designs IP SLA tracking jodte hain, <code>ip route 0.0.0.0 0.0.0.0 100.64.1.1 track 1</code>, jo probe fail hone par route hata deta hai. Yeh CCNA depth se aage hai, lekin jaano ki yeh exist karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> AD 1 wala backup static floating <b>nahi</b> hai; woh equal-cost path hai aur dono routes load-share karte hain. Aur OSPF (110) ke peeche AD 100 ke saath configure kiya floating static backup hai hi nahi: woh jeetta hai, aur OSPF ka route table se gayab ho jaata hai.</p></div>

<div class="scn"><h4>Woh backup jo pehle hi din chha gaya</h4><p>Ek retail chain ne 200 stores par 4G backup routers lagaye. Ek hafte mein 4G ka bill bahut bada aaya. Store routers ke template mein <code>ip route 0.0.0.0 0.0.0.0 Cellular0/0 100</code> tha, lekin MPLS default OSPF se <code>O*E2</code> ke roop mein AD 110 ke saath aata tha. AD 100 ne 110 ko haraya, isliye 4G route hamesha ke liye jeet gaya aur saara traffic cellular se gaya. Floating AD 250 karne se MPLS default wapas charge mein aa gaya.</p><p><b>Seekh:</b> floating route ki AD us cheez se zyada honi chahiye jiska woh backup hai, dynamic routes samet.</p></div>

<div class="iv"><p class="q">"Floating static route kya hai aur use kaise verify karoge?"</p><p>Strong answer: same prefix ke primary route se zyada administrative distance wala static route, jo primary withdraw hone tak install nahi hota. <code>ip route</code> ke end mein AD jodkar configure karo. <code>show ip static route</code> se verify karo (primary [A], backup [N]), phir primary interface shut karo aur check karo ki <code>show ip route</code> [5/0] dikhaye aur traceroute backup next hop use kare. Batao ki bina IP SLA tracking ke yeh upstream failures detect nahi karta, aur return path ko bhi fail over karna chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Floating static ki AD same prefix ke primary route se zyada hoti hai.</li>
<li>Primary withdraw hone tak yeh table se bahar ([N]) rehta hai, phir apne aap install hota hai.</li>
<li>OSPF ka backup banane ke liye AD 110 se upar; EIGRP ke liye 90 se upar (external ke liye 170 se upar).</li>
<li>Yeh sirf local interface down ya unresolvable next hop par react karta hai; upstream failures IP SLA tracking cover karti hai.</li>
<li>Shutdown, <code>show ip route</code> aur traceroute se failover test karo, aur return path bhi check karo.</li>
</ul></div>
`}};export{e as default};