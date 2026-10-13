var e={id:`default-host-summary`,h:{en:`Default, host and summary static routes`,hi:`Default, host aur summary static routes`},body:{en:`
<p>A small village post office handles letters for its own village itself. Everything else, whether it is going to Delhi or Denmark, goes into one bag marked "to the district office". That bag is a <b>default route</b>. The district office, in turn, keeps one pigeonhole for "all villages in the Jaipur block" rather than one per village: a <b>summary route</b>. And the one letter that must go by hand to the collector is a <b>host route</b>. Same tool, <code>ip route</code>, three very different jobs.</p>

<h3>The default route</h3>
<p>A default route matches every destination: <code>0.0.0.0</code> with mask <code>0.0.0.0</code>, written 0.0.0.0/0 and nicknamed "quad zero". Because it has the shortest possible prefix, it is used only when no more specific route matches. That makes it perfect for a <b>stub network</b>: a site with a single way out, such as a branch with one WAN link or an office with one ISP.</p>
<pre class="code"><span class="c">! Clinic branch router in the second lab</span>
BR(config)# ip route 0.0.0.0 0.0.0.0 100.64.1.1</pre>
<pre class="out">BR#show ip route | begin Gateway
<span class="hl">Gateway of last resort is 100.64.1.1 to network 0.0.0.0</span>

S*    0.0.0.0/0 [1/0] via 100.64.1.1
      100.0.0.0/8 is variably subnetted, 4 subnets, 2 masks
C        100.64.1.0/30 is directly connected, GigabitEthernet0/1
L        100.64.1.2/32 is directly connected, GigabitEthernet0/1
C        100.64.2.0/30 is directly connected, GigabitEthernet0/2
L        100.64.2.2/32 is directly connected, GigabitEthernet0/2
      192.168.50.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.50.0/24 is directly connected, GigabitEthernet0/0
L        192.168.50.1/32 is directly connected, GigabitEthernet0/0</pre>
<p>Three things change: the <b>gateway of last resort</b> is set, the route carries the code <code>S*</code> (static, candidate default), and every unknown destination now has somewhere to go.</p>

<div class="note"><p><b>Router or switch?</b> A router or a Layer 3 switch with <code>ip routing</code> uses a default route. A Layer 2 switch, or any switch with routing disabled, uses <code>ip default-gateway 192.168.50.1</code> instead, and only for its own management traffic. If <code>ip routing</code> is on, <code>ip default-gateway</code> is ignored.</p></div>

<h3>Host routes</h3>
<p>A host route is a static route with a /32 mask (255.255.255.255). It matches one address, so by longest match it beats everything else for that address. Uses: steering one server's traffic through a firewall or a second link, reaching a remote router's loopback, or a temporary redirect during a migration.</p>
<pre class="code"><span class="c">! send only the backup server via ISP2, everything else follows the default</span>
BR(config)# ip route 198.51.100.200 255.255.255.255 100.64.2.1 name BACKUP-SRV</pre>

<h3>Summary static routes</h3>
<p>If several contiguous subnets sit behind the same next hop, one shorter prefix can cover them all. You learned how to calculate summaries in the IPv4 addressing module; here you use them. In the NOC ticket lab, the branch reaches the whole HQ campus with one route, <code>ip route 10.10.0.0 255.255.0.0 10.99.0.2 name HQ-CAMPUS</code>, instead of one route per HQ VLAN.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Summary route and Null0 discard">
<rect x="20" y="80" width="150" height="60" rx="8" fill="#bae6fd"/><text x="95" y="105" text-anchor="middle" class="svg-ink" font-size="13">HQ</text><text x="95" y="124" text-anchor="middle" class="svg-muted" font-size="12">S 172.20.8.0/21</text>
<rect x="245" y="80" width="150" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="13">BRANCH</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">S* 0/0 to HQ</text>
<line x1="170" y1="110" x2="245" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="20" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="545" y="50" text-anchor="middle" class="svg-ink" font-size="13">172.20.8.0/24</text>
<rect x="470" y="85" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="545" y="115" text-anchor="middle" class="svg-ink" font-size="13">172.20.9.0/24</text>
<rect x="470" y="150" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="545" y="172" text-anchor="middle" class="svg-ink" font-size="12">.10 to .15 unused</text><text x="545" y="190" text-anchor="middle" class="svg-muted" font-size="12">Null0 drops them</text>
<line x1="395" y1="100" x2="470" y2="45" stroke="#64748b" stroke-width="2"/><line x1="395" y1="110" x2="470" y2="110" stroke="#64748b" stroke-width="2"/><line x1="395" y1="120" x2="470" y2="175" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<text x="320" y="215" text-anchor="middle" class="svg-accent" font-size="12">without Null0: HQ to BRANCH to HQ until TTL 0</text>
</svg><p class="cap">A summary that covers unused space plus a default route pointing back is a loop waiting to happen.</p></div>

<div class="eg"><p><b>Worked example: the summary loop.</b> The branch owns 172.20.8.0/21 (172.20.8.0 to 172.20.15.255) but uses only 172.20.8.0/24 and 172.20.9.0/24. HQ has one summary static <code>ip route 172.20.8.0 255.255.248.0 10.99.0.1</code>; the branch has a default route to HQ. A scanner at HQ probes 172.20.12.5. HQ matches the /21 and sends it to the branch. The branch has no route for 172.20.12.0, so the default sends it back to HQ, which sends it to the branch again. The packet ping-pongs until TTL hits 0, wasting WAN bandwidth. Fix it on the branch with a <b>discard route</b>:</p>
<pre class="code">BRANCH(config)# ip route 172.20.8.0 255.255.248.0 Null0</pre>
<p>Now 172.20.12.5 matches the /21 to Null0 (longer than the /0 default) and is dropped locally, while 172.20.8.x and 172.20.9.x still match their connected /24s, which are longer still.</p></div>

<p><b>Null0</b> is a virtual interface that is always up and silently discards traffic. Routing protocols install exactly this kind of route automatically when they summarise; with statics you add it yourself.</p>

<div class="warn"><p><b>Common mistake.</b> Using a default route on a router that is <b>not</b> a stub, for example on both ends of a link. Two routers each pointing their default at the other create a loop for every unknown destination. Only the edge toward "everything else" should hold the default.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>ip route 0.0.0.0 255.255.255.255 ...</code> is not a default route; it is a host route to the single address 0.0.0.0. The default route has mask 0.0.0.0. Also know that <code>S*</code> means static <b>candidate default</b>.</p></div>

<div class="scn"><h4>The WAN link that was always full</h4><p>A logistics company's MPLS link between HQ and a warehouse ran at 100 percent every night. NetFlow showed the same packets crossing the link dozens of times: a vulnerability scanner at HQ was sweeping the warehouse's whole /20, but the warehouse only used three /24s. HQ had a /20 summary toward the warehouse and the warehouse had a default back to HQ. Every probe to an unused address looped until its TTL expired. A single <code>ip route ... Null0</code> for the /20 on the warehouse router ended the storm.</p><p><b>Lesson:</b> whenever you summarise toward a site that has a default pointing back, add a Null0 discard route for the summary.</p></div>

<div class="iv"><p class="q">"When would you use a default route, a host route and a summary route?"</p><p>Strong answer: a default route (0.0.0.0/0, shown as S* and setting the gateway of last resort) at stub sites with one exit, such as branches or internet edges; a /32 host route to steer one specific destination differently, since it always wins longest match; a summary route to cover contiguous subnets behind one next hop and shrink the table, paired with a Null0 discard route to prevent loops for unused space.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Default route: <code>ip route 0.0.0.0 0.0.0.0 next-hop</code>; shows S* and sets the gateway of last resort.</li>
<li>Defaults suit stub sites; L2 switches use <code>ip default-gateway</code> instead.</li>
<li>Host routes are /32 and beat every other route for that one address.</li>
<li>Summary statics cover contiguous subnets with one shorter prefix.</li>
<li>A Null0 discard route stops loops when a summary covers unused space and a default points back.</li>
</ul></div>
`,hi:`
<p>Gaon ka chhota post office apne gaon ki chitthiyan khud sambhalta hai. Baaki sab kuch, chahe Delhi jaana ho ya Denmark, ek bag mein jaata hai jis par likha hai "district office ko". Woh bag <b>default route</b> hai. District office phir har gaon ke liye alag khaana rakhne ki jagah "Jaipur block ke saare gaon" ke liye ek khaana rakhta hai: <b>summary route</b>. Aur woh ek chitthi jo haath se collector ko jaani hai, <b>host route</b> hai. Same tool, <code>ip route</code>, teen bilkul alag kaam.</p>

<h3>Default route</h3>
<p>Default route har destination match karta hai: <code>0.0.0.0</code> mask <code>0.0.0.0</code> ke saath, 0.0.0.0/0 likha jaata hai aur nickname "quad zero" hai. Kyunki iska prefix sabse chhota possible hai, yeh tabhi use hota hai jab koi aur specific route match na kare. Isliye yeh <b>stub network</b> ke liye perfect hai: aisi site jiska bahar jaane ka ek hi raasta ho, jaise ek WAN link wali branch ya ek ISP wala office.</p>
<pre class="code"><span class="c">! Doosre lab ka clinic branch router</span>
BR(config)# ip route 0.0.0.0 0.0.0.0 100.64.1.1</pre>
<pre class="out">BR#show ip route | begin Gateway
<span class="hl">Gateway of last resort is 100.64.1.1 to network 0.0.0.0</span>

S*    0.0.0.0/0 [1/0] via 100.64.1.1
      100.0.0.0/8 is variably subnetted, 4 subnets, 2 masks
C        100.64.1.0/30 is directly connected, GigabitEthernet0/1
L        100.64.1.2/32 is directly connected, GigabitEthernet0/1
C        100.64.2.0/30 is directly connected, GigabitEthernet0/2
L        100.64.2.2/32 is directly connected, GigabitEthernet0/2
      192.168.50.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.50.0/24 is directly connected, GigabitEthernet0/0
L        192.168.50.1/32 is directly connected, GigabitEthernet0/0</pre>
<p>Teen cheezein badalti hain: <b>gateway of last resort</b> set ho jaata hai, route par code <code>S*</code> aata hai (static, candidate default), aur har unknown destination ke paas ab jaane ki jagah hai.</p>

<div class="note"><p><b>Router ya switch?</b> Router ya <code>ip routing</code> wala Layer 3 switch default route use karta hai. Layer 2 switch, ya routing disabled wala koi bhi switch, iski jagah <code>ip default-gateway 192.168.50.1</code> use karta hai, aur woh bhi sirf apne management traffic ke liye. Agar <code>ip routing</code> on hai to <code>ip default-gateway</code> ignore hota hai.</p></div>

<h3>Host routes</h3>
<p>Host route /32 mask (255.255.255.255) wala static route hai. Yeh ek address match karta hai, isliye longest match se us address ke liye baaki sab ko harata hai. Uses: ek server ka traffic firewall ya doosre link se bhejna, remote router ke loopback tak pahunchna, ya migration ke dauraan temporary redirect.</p>
<pre class="code"><span class="c">! sirf backup server ko ISP2 se bhejo, baaki sab default follow kare</span>
BR(config)# ip route 198.51.100.200 255.255.255.255 100.64.2.1 name BACKUP-SRV</pre>

<h3>Summary static routes</h3>
<p>Agar kai contiguous subnets same next hop ke peeche hain, to ek chhota prefix un sabko cover kar sakta hai. Summaries calculate karna aapne IPv4 addressing module mein seekha; yahan aap unhe use karte ho. NOC ticket lab mein branch poore HQ campus tak ek route se pahunchti hai, <code>ip route 10.10.0.0 255.255.0.0 10.99.0.2 name HQ-CAMPUS</code>, har HQ VLAN ke liye ek route ki jagah.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Summary route aur Null0 discard">
<rect x="20" y="80" width="150" height="60" rx="8" fill="#bae6fd"/><text x="95" y="105" text-anchor="middle" class="svg-ink" font-size="13">HQ</text><text x="95" y="124" text-anchor="middle" class="svg-muted" font-size="12">S 172.20.8.0/21</text>
<rect x="245" y="80" width="150" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="13">BRANCH</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">S* 0/0 HQ ki taraf</text>
<line x1="170" y1="110" x2="245" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="20" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="545" y="50" text-anchor="middle" class="svg-ink" font-size="13">172.20.8.0/24</text>
<rect x="470" y="85" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="545" y="115" text-anchor="middle" class="svg-ink" font-size="13">172.20.9.0/24</text>
<rect x="470" y="150" width="150" height="50" rx="8" fill="#e2e8f0"/><text x="545" y="172" text-anchor="middle" class="svg-ink" font-size="12">.10 se .15 unused</text><text x="545" y="190" text-anchor="middle" class="svg-muted" font-size="12">Null0 drop karta hai</text>
<line x1="395" y1="100" x2="470" y2="45" stroke="#64748b" stroke-width="2"/><line x1="395" y1="110" x2="470" y2="110" stroke="#64748b" stroke-width="2"/><line x1="395" y1="120" x2="470" y2="175" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<text x="320" y="215" text-anchor="middle" class="svg-accent" font-size="12">Null0 ke bina: HQ se BRANCH se HQ jab tak TTL 0</text>
</svg><p class="cap">Unused space cover karne wali summary plus wapas point karta default route, ek loop jo hone ka intezaar kar raha hai.</p></div>

<div class="eg"><p><b>Worked example: summary loop.</b> Branch 172.20.8.0/21 (172.20.8.0 se 172.20.15.255) own karti hai lekin sirf 172.20.8.0/24 aur 172.20.9.0/24 use karti hai. HQ par ek summary static <code>ip route 172.20.8.0 255.255.248.0 10.99.0.1</code> hai; branch par HQ ki taraf default route hai. HQ ka ek scanner 172.20.12.5 probe karta hai. HQ /21 match karke use branch bhejta hai. Branch ke paas 172.20.12.0 ka route nahi, isliye default use wapas HQ bhejta hai, jo phir branch bhejta hai. Packet TTL 0 hone tak ping-pong karta hai, WAN bandwidth barbaad karta hai. Branch par <b>discard route</b> se fix karo:</p>
<pre class="code">BRANCH(config)# ip route 172.20.8.0 255.255.248.0 Null0</pre>
<p>Ab 172.20.12.5 Null0 wale /21 se match karta hai (/0 default se lamba) aur locally drop hota hai, jabki 172.20.8.x aur 172.20.9.x ab bhi apne connected /24s match karte hain, jo aur bhi lambe hain.</p></div>

<p><b>Null0</b> ek virtual interface hai jo hamesha up rehta hai aur traffic chupchaap discard karta hai. Routing protocols summarise karte waqt exactly aisa route apne aap install karte hain; statics ke saath aapko khud add karna padta hai.</p>

<div class="warn"><p><b>Common galti.</b> Aise router par default route use karna jo stub <b>nahi</b> hai, jaise link ke dono ends par. Do routers jo apna default ek doosre ki taraf point karein, har unknown destination ke liye loop banate hain. Sirf "baaki sab kuch" ki taraf wale edge par default hona chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>ip route 0.0.0.0 255.255.255.255 ...</code> default route nahi hai; yeh single address 0.0.0.0 ka host route hai. Default route ka mask 0.0.0.0 hota hai. Yeh bhi jaano ki <code>S*</code> ka matlab static <b>candidate default</b> hai.</p></div>

<div class="scn"><h4>Woh WAN link jo hamesha full rehta tha</h4><p>Ek logistics company ka HQ aur warehouse ke beech MPLS link har raat 100 percent par chalta tha. NetFlow ne dikhaya ki same packets link ko darjanon baar cross kar rahe the: HQ ka ek vulnerability scanner warehouse ka poora /20 sweep kar raha tha, lekin warehouse sirf teen /24s use karta tha. HQ par warehouse ki taraf /20 summary thi aur warehouse par HQ ki taraf default. Har unused address ka probe TTL khatam hone tak loop karta. Warehouse router par /20 ke liye ek <code>ip route ... Null0</code> ne toofan khatam kar diya.</p><p><b>Seekh:</b> jab bhi aap aisi site ki taraf summarise karo jiska default wapas point karta hai, summary ke liye Null0 discard route add karo.</p></div>

<div class="iv"><p class="q">"Default route, host route aur summary route kab use karoge?"</p><p>Strong answer: default route (0.0.0.0/0, S* dikhta hai aur gateway of last resort set karta hai) ek exit wali stub sites par, jaise branches ya internet edges; /32 host route ek specific destination ko alag tarah steer karne ke liye, kyunki woh hamesha longest match jeetta hai; summary route ek next hop ke peeche ke contiguous subnets cover karne aur table chhoti karne ke liye, unused space ke loops rokne ke liye Null0 discard route ke saath.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Default route: <code>ip route 0.0.0.0 0.0.0.0 next-hop</code>; S* dikhta hai aur gateway of last resort set karta hai.</li>
<li>Defaults stub sites ke liye hain; L2 switches iski jagah <code>ip default-gateway</code> use karte hain.</li>
<li>Host routes /32 hote hain aur us ek address ke liye har doosre route ko harate hain.</li>
<li>Summary statics ek chhote prefix se contiguous subnets cover karte hain.</li>
<li>Jab summary unused space cover kare aur default wapas point kare, Null0 discard route loops rokta hai.</li>
</ul></div>
`}};export{e as default};