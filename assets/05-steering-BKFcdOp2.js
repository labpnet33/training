var e={id:`steering`,h:{en:`Steering traffic into tunnels: autoroute, forwarding adjacency, static routes and CBTS`,hi:`Traffic ko tunnels mein steer karna: autoroute, forwarding adjacency, static routes aur CBTS`},body:{en:`
<p>Building a bus lane is useless if cars do not know to use it. A TE tunnel that is up carries no traffic until you tell the routing table to point at it. This is called <b>steering</b>. Several methods exist, and the exam expects you to know when to choose which.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="Steering decides which prefixes use the tunnel interface as their next hop."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Traffic</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">to PE2 loopback</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Method</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">autoroute, static, PBR, CBTS</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Tunnel1</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">TE LSP</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">PE2</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">exit</text></svg><p class="cap">Steering decides which prefixes use the tunnel interface as their next hop.</p></div>
<h3>Method 1: autoroute announce</h3>
<p><b>Autoroute announce</b> makes the head end treat the tunnel as a directly connected link in its own SPF. Routes whose shortest path passes through the tunnel tail end are installed with the tunnel as the outgoing interface. It is local to the head end, which means other routers are not told about it, so they do not route through your tunnel. This is simple, scales well, and is the most common method.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XE</span>
interface Tunnel1
 tunnel mpls traffic-eng autoroute announce
 tunnel mpls traffic-eng autoroute metric absolute 10
<span class="c">! IOS XR</span>
interface tunnel-te1
 autoroute announce
  metric absolute 10
<span class="c"> !</span></pre>
<p>Metric options matter. By default the tunnel metric equals the IGP shortest path cost to the tail. <b>Relative</b> adds or subtracts a value, <b>absolute</b> sets a fixed cost. A lower tunnel metric than the IGP path makes the tunnel preferred over a plain IGP route. Without careful metrics, traffic may keep using the IGP path, or all prefixes behind the tail may use the tunnel when you only wanted a few.</p>
<h3>Method 2: forwarding adjacency</h3>
<p><b>Forwarding adjacency</b> goes further: the tunnel is <i>advertised into the IGP</i> as a link, so other routers also see it and may route over it. It needs a tunnel in both directions (bidirectional, because the IGP checks two-way connectivity) and the IGP metric of the tunnel should be sensible. It is useful for layer-3 VPN and TE between regions, but it can cause loops and unexpected path selection if misused, and not all IGPs treat it the same way, so use it with a clear reason.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
interface Tunnel1
 tunnel mpls traffic-eng forwarding-adjacency
 isis metric 15
<span class="c">! IOS XR</span>
interface tunnel-te1
 forwarding-adjacency
<span class="c"> !</span></pre>
<h3>Method 3: static route to the tunnel</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XE</span>
ip route 203.0.113.0 255.255.255.0 Tunnel1
<span class="c">! IOS XR</span>
router static
 address-family ipv4 unicast
  203.0.113.0/24 tunnel-te1</pre>
<p>A static route points chosen prefixes at the tunnel, giving fine control per prefix. It is easy to understand and good for a few destinations, but it is manual and does not follow topology changes.</p>
<h3>Method 4: policy based routing and CBTS</h3>
<ul>
<li><b>PBR</b> matches traffic by ACL (source, protocol, port) and sets the output to a tunnel with <code>set interface Tunnel1</code>. Good for steering a customer or application, with extra CPU or hardware cost on some platforms.</li>
<li><b>Class-Based Tunnel Selection (CBTS)</b> selects among several tunnels to the same destination by traffic class (EXP or DSCP). For example voice goes into a low-latency tunnel and bulk goes into a high-capacity tunnel, using a single route. It is configured with a <b>tunnel bundle</b> and a <b>master tunnel</b> on IOS XE.</li>
<li><b>Automated steering with BGP</b> (for example per-VRF or color-based) appears with segment routing policies in <code>spcor-sr</code>.</li>
</ul>
<table class="cmp"><tr><th>Method</th><th>Scope</th><th>Granularity</th><th>Use when</th></tr><tr><td>Autoroute announce</td><td>Local to head end</td><td>All prefixes behind the tail</td><td>Simple tunnel mesh between PEs</td></tr><tr><td>Forwarding adjacency</td><td>Advertised in IGP</td><td>All routers use it</td><td>Regional TE where others must see the tunnel</td></tr><tr><td>Static route</td><td>Local</td><td>Per prefix</td><td>A few critical destinations</td></tr><tr><td>PBR</td><td>Local</td><td>Per flow or ACL</td><td>One customer or application</td></tr><tr><td>CBTS</td><td>Local</td><td>Per traffic class</td><td>Different service classes to the same tail</td></tr></table>
<div class="eg"><p><b>Worked example.</b> PE1 has Tunnel1 (6 Gbps, upper path) to PE2 with autoroute announce and absolute metric 10, while the IGP cost to PE2 is 30. The loopback of PE2 and every BGP next hop beyond it now has next hop Tunnel1 on PE1. If you only wanted the video prefix 203.0.113.0/24 to use the tunnel, you would instead remove autoroute and add one static route to Tunnel1, and everything else continues on the IGP path.</p></div>
<div class="warn"><p><b>Common mistake.</b> Enabling autoroute announce and forgetting that all traffic to the tail, and to everything behind it, moves into the tunnel. If the tunnel has less bandwidth than the traffic, it overloads one path, and since RSVP does not police, you will not see an error.</p></div>
<div class="exam"><p><b>Exam trap.</b> Autoroute is local to the head end and one-way; forwarding adjacency advertises the tunnel in the IGP and needs a tunnel in both directions. Tunnels are unidirectional, so return traffic needs its own tunnel or follows the IGP. CBTS selects tunnels by class on a single destination.</p></div>
<div class="scn"><h4>Return path surprise</h4><p>A provider built TE tunnels from PE1 to PE2 for a financial customer and saw low latency one way but not the other. The tunnel was unidirectional, and the reverse direction followed the normal IGP path with a congested link. Creating a matching tunnel from PE2 to PE1, with the same constraints, fixed the asymmetric performance.</p><p><b>Lesson:</b> TE tunnels are one-way; plan both directions when the service needs symmetric behaviour.</p></div>
<div class="iv"><p class="q">"Name the ways to send traffic into an MPLS-TE tunnel and compare them."</p><p>Autoroute announce adds the tunnel to the head end SPF for all prefixes behind the tail. Forwarding adjacency also advertises the tunnel into the IGP so other routers can use it, and needs a tunnel in both directions. Static routes and PBR give per-prefix or per-flow control. CBTS chooses between several tunnels to one destination by traffic class. Mention that tunnels are unidirectional.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A tunnel carries nothing until you steer traffic into it.</li>
<li>Autoroute announce: local, all prefixes behind the tail; metric relative or absolute.</li>
<li>Forwarding adjacency: advertised into the IGP, needs bidirectional tunnels.</li>
<li>Static routes and PBR give per-prefix or per-flow steering; CBTS selects by class.</li>
<li>Tunnels are unidirectional, so return traffic follows the IGP unless it has its own tunnel.</li>
</ul></div>
`,hi:`
<p>Bus lane banana bekaar hai agar cars ko pata hi na ho ki use karna hai. Up TE tunnel koi traffic carry nahi karta jab tak aap routing table ko usse point karne ko na kahein. Ise <b>steering</b> kehte hain. Kai methods hain, aur exam umeed karta hai ki aap jaano kab kaunsa chunna hai.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="Steering tay karta hai ki kaunse prefixes tunnel interface ko next hop ki tarah use karein."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Traffic</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">PE2 loopback ki taraf</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Method</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">autoroute, static, PBR, CBTS</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Tunnel1</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">TE LSP</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">PE2</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">exit</text></svg><p class="cap">Steering tay karta hai ki kaunse prefixes tunnel interface ko next hop ki tarah use karein.</p></div>
<h3>Method 1: autoroute announce</h3>
<p><b>Autoroute announce</b> head end ko tunnel ko apne SPF mein directly connected link ki tarah treat karwata hai. Jin routes ka shortest path tunnel tail end se guzarta hai woh tunnel ko outgoing interface bana kar install hote hain. Yeh head end ke liye local hai, yaani doosre routers ko iske baare mein nahi bataya jaata, isliye woh aapke tunnel se route nahi karte. Simple hai, achha scale karta hai, aur sabse common method hai.</p>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
<span class="c">! IOS XE</span>
interface Tunnel1
 tunnel mpls traffic-eng autoroute announce
 tunnel mpls traffic-eng autoroute metric absolute 10
<span class="c">! IOS XR</span>
interface tunnel-te1
 autoroute announce
  metric absolute 10
<span class="c"> !</span></pre>
<p>Metric options matter karte hain. Default mein tunnel metric tail tak ki IGP shortest path cost ke barabar hota hai. <b>Relative</b> ek value jodta ya ghatata hai, <b>absolute</b> fixed cost set karta hai. IGP path se kam tunnel metric tunnel ko plain IGP route par prefer karwata hai. Dhyan se metrics na rakhe to traffic IGP path hi use karta rahega, ya tail ke peeche ke saare prefixes tunnel use karenge jabki aap sirf kuch chahte the.</p>
<h3>Method 2: forwarding adjacency</h3>
<p><b>Forwarding adjacency</b> aur aage jaata hai: tunnel <i>IGP mein link ki tarah advertise</i> hota hai, isliye doosre routers bhi use dekhte hain aur uske upar se route kar sakte hain. Iske liye dono directions mein tunnel chahiye (bidirectional, kyunki IGP two-way connectivity check karta hai) aur tunnel ka IGP metric samajhdaar hona chahiye. Layer-3 VPN aur regions ke beech TE mein kaam aata hai, lekin galat use par loops aur unexpected path selection ho sakta hai, aur har IGP ise same tarah treat nahi karta, isliye clear wajah se hi use karo.</p>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
interface Tunnel1
 tunnel mpls traffic-eng forwarding-adjacency
 isis metric 15
<span class="c">! IOS XR</span>
interface tunnel-te1
 forwarding-adjacency
<span class="c"> !</span></pre>
<h3>Method 3: tunnel ki taraf static route</h3>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
<span class="c">! IOS XE</span>
ip route 203.0.113.0 255.255.255.0 Tunnel1
<span class="c">! IOS XR</span>
router static
 address-family ipv4 unicast
  203.0.113.0/24 tunnel-te1</pre>
<p>Static route chune hue prefixes ko tunnel par point karta hai, jisse per-prefix fine control milta hai. Samajhna aasaan hai aur kuch destinations ke liye achha hai, lekin manual hai aur topology changes follow nahi karta.</p>
<h3>Method 4: policy based routing aur CBTS</h3>
<ul>
<li><b>PBR</b> traffic ko ACL (source, protocol, port) se match karke <code>set interface Tunnel1</code> se output tunnel par set karta hai. Customer ya application steer karne ke liye achha hai, kuch platforms par extra CPU ya hardware cost ke saath.</li>
<li><b>Class-Based Tunnel Selection (CBTS)</b> ek hi destination ke kai tunnels mein se traffic class (EXP ya DSCP) se tunnel chunta hai. Jaise voice low-latency tunnel mein aur bulk high-capacity tunnel mein jaata hai, ek hi route se. IOS XE par yeh <b>tunnel bundle</b> aur <b>master tunnel</b> se configure hota hai.</li>
<li><b>BGP ke saath automated steering</b> (jaise per-VRF ya color-based) segment routing policies ke saath <code>spcor-sr</code> mein aata hai.</li>
</ul>
<table class="cmp"><tr><th>Method</th><th>Scope</th><th>Granularity</th><th>Kab use karein</th></tr><tr><td>Autoroute announce</td><td>Head end ke liye local</td><td>Tail ke peeche ke saare prefixes</td><td>PEs ke beech simple tunnel mesh</td></tr><tr><td>Forwarding adjacency</td><td>IGP mein advertised</td><td>Saare routers use karte hain</td><td>Regional TE jahan doosre routers ko tunnel dikhna chahiye</td></tr><tr><td>Static route</td><td>Local</td><td>Per prefix</td><td>Kuch critical destinations</td></tr><tr><td>PBR</td><td>Local</td><td>Per flow ya ACL</td><td>Ek customer ya application</td></tr><tr><td>CBTS</td><td>Local</td><td>Per traffic class</td><td>Same tail ko alag service classes</td></tr></table>
<div class="eg"><p><b>Worked example.</b> PE1 ke paas PE2 tak Tunnel1 (6 Gbps, upar wala path) autoroute announce aur absolute metric 10 ke saath hai, jabki PE2 tak IGP cost 30 hai. PE2 ka loopback aur uske peeche ka har BGP next hop ab PE1 par Tunnel1 next hop rakhta hai. Agar aap sirf video prefix 203.0.113.0/24 tunnel use karwana chahte the, to aap autoroute hata kar ek static route Tunnel1 ki taraf jodte, aur baaki sab IGP path par chalta rehta.</p></div>
<div class="warn"><p><b>Common mistake.</b> Autoroute announce enable karke bhool jaana ki tail aur uske peeche ka saara traffic tunnel mein chala jaata hai. Tunnel ki bandwidth traffic se kam ho to ek path overload hota hai, aur RSVP police nahi karta, isliye koi error nahi dikhta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Autoroute head end ke liye local aur one-way hai; forwarding adjacency tunnel ko IGP mein advertise karta hai aur dono directions mein tunnel chahta hai. Tunnels unidirectional hain, isliye return traffic ko apna tunnel chahiye ya woh IGP follow karta hai. CBTS ek destination par class se tunnels chunta hai.</p></div>
<div class="scn"><h4>Return path ka surprise</h4><p>Ek provider ne financial customer ke liye PE1 se PE2 TE tunnels banaye aur ek taraf low latency dekhi lekin doosri taraf nahi. Tunnel unidirectional tha, aur reverse direction congested link wale normal IGP path par chal rahi thi. Wahi constraints ke saath PE2 se PE1 ka matching tunnel banane se asymmetric performance theek ho gayi.</p><p><b>Lesson:</b> TE tunnels one-way hain; service ko symmetric behaviour chahiye to dono directions plan karo.</p></div>
<div class="iv"><p class="q">"MPLS-TE tunnel mein traffic bhejne ke tareeke batao aur compare karo."</p><p>Autoroute announce tunnel ko head end SPF mein tail ke peeche ke saare prefixes ke liye jodta hai. Forwarding adjacency tunnel ko IGP mein bhi advertise karta hai taaki doosre routers use kar sakein, aur dono directions mein tunnel chahta hai. Static routes aur PBR per-prefix ya per-flow control dete hain. CBTS ek destination ke kai tunnels mein traffic class se chunta hai. Batao ki tunnels unidirectional hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnel jab tak aap traffic steer na karo kuch carry nahi karta.</li>
<li>Autoroute announce: local, tail ke peeche ke saare prefixes; metric relative ya absolute.</li>
<li>Forwarding adjacency: IGP mein advertised, bidirectional tunnels chahiye.</li>
<li>Static routes aur PBR per-prefix ya per-flow steering dete hain; CBTS class se chunta hai.</li>
<li>Tunnels unidirectional hain, isliye return traffic IGP follow karta hai jab tak uska apna tunnel na ho.</li>
</ul></div>
`}};export{e as default};