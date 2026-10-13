var e={id:`bgp-overview`,h:{en:`Welcome to BGP: what you will learn and the big picture`,hi:`BGP mein swagat: kya seekhoge aur badi tasveer`},body:{en:`
<p>Think of the Internet as a country with thousands of postal companies. Each company runs its own sorting rules inside its buildings, but they must also agree on which company carries a parcel to which city. Inside a company the rules are the <b>IGP</b> (OSPF or IS-IS). Between companies the agreement is <b>BGP</b>, the Border Gateway Protocol. Each company is an <b>autonomous system</b> (AS) with its own number.</p>

<h3>What you will learn</h3>
<ul>
<li>How a BGP session comes up and what each message does.</li>
<li>EBGP, IBGP, peering over loopbacks and the full-mesh rule.</li>
<li>The path attributes: AS path, next hop, origin, local preference, MED and community.</li>
<li>Why routes become hidden and how next-hop self fixes them.</li>
<li>How Junos picks the best path, and how to steer traffic with policy.</li>
<li>A troubleshooting workflow you can use in the lab and the exam (JN0-351 and JN0-352 level).</li>
</ul>

<h3>Prerequisites</h3>
<p>You should be comfortable with the Junos CLI (configure, commit, show), IP addressing and static routes, and one IGP, either OSPF or IS-IS, because BGP sessions between loopbacks depend on it. Chapters of the OSPF and IS-IS modules are enough.</p>

<h3>The big picture</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Two autonomous systems">
<rect x="20" y="20" width="200" height="160" rx="12" fill="#fed7aa" stroke="#64748b"/><text x="120" y="42" text-anchor="middle" class="svg-ink" font-size="13">ISP, AS 64500</text>
<rect x="420" y="20" width="200" height="160" rx="12" fill="#bae6fd" stroke="#64748b"/><text x="520" y="42" text-anchor="middle" class="svg-ink" font-size="13">Our company, AS 65010</text>
<circle cx="170" cy="110" r="26" fill="#fff" stroke="#64748b"/><text x="170" y="114" text-anchor="middle" class="svg-ink" font-size="12">ISP</text>
<circle cx="470" cy="80" r="26" fill="#fff" stroke="#64748b"/><text x="470" y="84" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<circle cx="570" cy="140" r="26" fill="#fff" stroke="#64748b"/><text x="570" y="144" text-anchor="middle" class="svg-ink" font-size="12">R2</text>
<line x1="196" y1="100" x2="444" y2="82" stroke="#64748b" stroke-width="2"/><text x="320" y="80" text-anchor="middle" class="svg-accent" font-size="12">EBGP over TCP 179</text>
<line x1="490" y1="100" x2="554" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="505" y="170" text-anchor="middle" class="svg-muted" font-size="11">IBGP, IGP below</text>
</svg><p class="cap">EBGP crosses the AS border, IBGP carries the routes inside.</p></div>
<table class="cmp"><tr><th>Question</th><th>IGP (OSPF, IS-IS)</th><th>BGP</th></tr>
<tr><td>Where does it run?</td><td>Inside one AS</td><td>Between ASes, and inside for distribution</td></tr>
<tr><td>What does it decide on?</td><td>Lowest cost</td><td>Attributes and policy</td></tr>
<tr><td>Neighbours</td><td>Found automatically</td><td>Configured by hand</td></tr>
<tr><td>Transport</td><td>Own packets</td><td>TCP port 179</td></tr>
<tr><td>Scale</td><td>Thousands of routes</td><td>Hundreds of thousands</td></tr></table>
<p>BGP is called a <b>path-vector</b> protocol: instead of a cost it carries the list of ASes a route has crossed. That list lets a router detect loops (if its own AS is already in the path, it drops the route) and lets the operator write rules such as "prefer anything that does not cross AS 64999". Because BGP is about policy, nothing is automatic: you decide whom to peer with and what to send.</p>

<h3>Lab map for this module</h3>
<p>The module has three labs. In the first one you build EBGP and IBGP for a warehouse company (AS 65010). In the second you find routes that are hidden after a security change. In the third you steer traffic with local preference and AS-path prepending. Every output in the chapters comes from the simulator, so you can reproduce it.</p>
<pre class="code">set routing-options autonomous-system 65010
set protocols bgp group ISP type external
set protocols bgp group ISP peer-as 64500
set protocols bgp group ISP neighbor 100.65.1.1</pre>
<pre class="out">lab@NGP-R1&gt; show bgp summary
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
100.65.1.1            64500          3          2       0       0        0:25 <span class="hl">Establ</span>
  inet.0: 2/2/2/0</pre>
<p>Read the last line as active, received, accepted and damped prefixes. Two prefixes arrived from the ISP and both are active.</p>

<div class="eg"><p><b>Worked example.</b> Your company has the private AS number 65010 and the ISP is AS 64500. A prefix the ISP sends reaches you with the AS path 64500. If you advertise your own LAN back, the ISP sees the path 65010. If the same prefix came back to you from another peer with 65010 in its path, your router would reject it as a loop. That is the whole idea of a path vector in three lines.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating BGP like an IGP. It does not discover neighbours, it does not use the lowest cost first, and it does not advertise everything it knows by default. A session that is Established with no routes is a policy or next-hop question, not a link question.</p></div>
<div class="exam"><p><b>Exam trap.</b> Private AS numbers are 64512 to 65534 (and a larger 32-bit private range). BGP runs over TCP 179 and needs IP reachability first. Junos BGP routes have preference 170 for both internal and external routes.</p></div>

<div class="scn"><h4>The silent branch</h4><p>A small company bought a second ISP link. The engineer configured the neighbour, committed and saw nothing. The session was Established, so the link was fine. The route was missing because the policy sent only the LAN prefix to the old ISP. The new neighbour had no export rule for it.</p><p><b>Lesson:</b> an Established session only proves the TCP connection. Routes are a separate question.</p></div>

<div class="iv"><p class="q">"Why do we need BGP when we already have OSPF?"</p><p>An IGP finds the shortest path inside one organisation and trusts all its routers. BGP connects separate organisations: it carries the AS path for loop prevention, lets each side apply policy about what it accepts and announces, and scales to the size of the Internet routing table. The two work together: the IGP reaches the loopbacks and BGP carries the external prefixes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BGP is a path-vector protocol between autonomous systems, run over TCP 179.</li>
<li>Neighbours are configured by hand, and policy decides what is sent and accepted.</li>
<li>EBGP crosses the AS border; IBGP distributes routes inside, relying on the IGP.</li>
<li>Established means TCP and OPEN are fine, nothing more.</li>
</ul></div>
`,hi:`
<p>Internet ko ek aise desh ki tarah socho jismein hazaron dak companies hain. Har company apni imaaraton ke andar apne sorting rules chalati hai, par unhe ye bhi tay karna padta hai ki kaun si company parcel kis sheher tak le jaayegi. Company ke andar rules <b>IGP</b> (OSPF ya IS-IS) hain. Companies ke beech samjhauta <b>BGP</b>, yani Border Gateway Protocol, hai. Har company ek <b>autonomous system</b> (AS) hai jiska apna number hota hai.</p>

<h3>Aap kya seekhoge</h3>
<ul>
<li>BGP session kaise up hota hai aur har message kya karta hai.</li>
<li>EBGP, IBGP, loopbacks par peering aur full-mesh rule.</li>
<li>Path attributes: AS path, next hop, origin, local preference, MED aur community.</li>
<li>Routes hidden kyun hote hain aur next-hop self unhe kaise theek karta hai.</li>
<li>Junos best path kaise chunta hai, aur policy se traffic kaise steer karte hain.</li>
<li>Lab aur exam (JN0-351 aur JN0-352 level) mein kaam aane wala troubleshooting workflow.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapko Junos CLI (configure, commit, show), IP addressing aur static routes, aur ek IGP, OSPF ya IS-IS, ka aaraam hona chahiye, kyunki loopbacks ke beech BGP sessions usi par nirbhar hain. OSPF aur IS-IS modules ke chapters kaafi hain.</p>

<h3>Badi tasveer</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Do autonomous systems">
<rect x="20" y="20" width="200" height="160" rx="12" fill="#fed7aa" stroke="#64748b"/><text x="120" y="42" text-anchor="middle" class="svg-ink" font-size="13">ISP, AS 64500</text>
<rect x="420" y="20" width="200" height="160" rx="12" fill="#bae6fd" stroke="#64748b"/><text x="520" y="42" text-anchor="middle" class="svg-ink" font-size="13">Hamari company, AS 65010</text>
<circle cx="170" cy="110" r="26" fill="#fff" stroke="#64748b"/><text x="170" y="114" text-anchor="middle" class="svg-ink" font-size="12">ISP</text>
<circle cx="470" cy="80" r="26" fill="#fff" stroke="#64748b"/><text x="470" y="84" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<circle cx="570" cy="140" r="26" fill="#fff" stroke="#64748b"/><text x="570" y="144" text-anchor="middle" class="svg-ink" font-size="12">R2</text>
<line x1="196" y1="100" x2="444" y2="82" stroke="#64748b" stroke-width="2"/><text x="320" y="80" text-anchor="middle" class="svg-accent" font-size="12">EBGP, TCP 179</text>
<line x1="490" y1="100" x2="554" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="505" y="170" text-anchor="middle" class="svg-muted" font-size="11">IBGP, neeche IGP</text>
</svg><p class="cap">EBGP AS ki seema paar karta hai, IBGP routes andar baantta hai.</p></div>
<table class="cmp"><tr><th>Sawal</th><th>IGP (OSPF, IS-IS)</th><th>BGP</th></tr>
<tr><td>Kahan chalta hai?</td><td>Ek AS ke andar</td><td>AS ke beech, aur andar distribution ke liye</td></tr>
<tr><td>Kis par decide karta hai?</td><td>Sabse kam cost</td><td>Attributes aur policy</td></tr>
<tr><td>Neighbours</td><td>Apne aap milte hain</td><td>Haath se configure</td></tr>
<tr><td>Transport</td><td>Apne packets</td><td>TCP port 179</td></tr>
<tr><td>Scale</td><td>Hazaron routes</td><td>Lakhon routes</td></tr></table>
<p>BGP ko <b>path-vector</b> protocol kehte hain: cost ki jagah wo un ASes ki list carry karta hai jinse route guzra hai. Ye list router ko loop pakadne deti hai (agar uska apna AS path mein pehle se hai to wo route drop karta hai) aur operator ko "AS 64999 se guzarne wale ko prefer mat karo" jaise rules likhne deti hai. BGP policy ke baare mein hai, isliye kuch bhi automatic nahi: aap tay karte ho ki kis se peering karni hai aur kya bhejna hai.</p>

<h3>Is module ka lab map</h3>
<p>Module mein teen labs hain. Pehle mein aap warehouse company (AS 65010) ke liye EBGP aur IBGP banate ho. Doosre mein security change ke baad hidden routes dhoondhte ho. Teesre mein local preference aur AS-path prepending se traffic steer karte ho. Chapters ka har output simulator se aaya hai, isliye aap use dohra sakte ho.</p>
<pre class="code">set routing-options autonomous-system 65010
set protocols bgp group ISP type external
set protocols bgp group ISP peer-as 64500
set protocols bgp group ISP neighbor 100.65.1.1</pre>
<pre class="out">lab@NGP-R1&gt; show bgp summary
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
100.65.1.1            64500          3          2       0       0        0:25 <span class="hl">Establ</span>
  inet.0: 2/2/2/0</pre>
<p>Aakhri line ko active, received, accepted aur damped prefixes ki tarah padho. ISP se do prefixes aaye aur dono active hain.</p>

<div class="eg"><p><b>Worked example.</b> Aapki company ka private AS number 65010 hai aur ISP AS 64500 hai. ISP jo prefix bhejta hai wo AS path 64500 ke saath aata hai. Aap apna LAN wapas advertise karo to ISP ko path 65010 dikhta hai. Wahi prefix kisi aur peer se 65010 wale path ke saath aapke paas laut aaye to aapka router use loop maan kar reject kar deta hai. Path vector ka poora idea teen lines mein yahi hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> BGP ko IGP ki tarah samajhna. Wo neighbours discover nahi karta, sabse kam cost pehle nahi dekhta, aur default mein sab kuch advertise nahi karta. Routes ke bina Established session policy ya next-hop ka sawal hai, link ka nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Private AS numbers 64512 se 65534 hain (aur bada 32-bit private range). BGP TCP 179 par chalta hai aur pehle IP reachability chahiye. Junos BGP routes ki preference internal aur external dono ke liye 170 hai.</p></div>

<div class="scn"><h4>Khamosh branch</h4><p>Ek chhoti company ne doosra ISP link liya. Engineer ne neighbour configure kiya, commit kiya aur kuch nahi dikha. Session Established tha, yani link theek tha. Route isliye missing tha ki policy purane ISP ko hi LAN prefix bhejti thi. Naye neighbour ke liye export rule nahi tha.</p><p><b>Lesson:</b> Established session sirf TCP connection saabit karta hai. Routes alag sawal hain.</p></div>

<div class="iv"><p class="q">"OSPF hone par BGP ki zaroorat kyun hai?"</p><p>IGP ek organisation ke andar shortest path nikalta hai aur apne saare routers par bharosa karta hai. BGP alag organisations ko jodta hai: wo loop prevention ke liye AS path carry karta hai, har side ko policy lagane deta hai ki kya accept aur announce karna hai, aur Internet routing table ke size tak scale karta hai. Dono saath kaam karte hain: IGP loopbacks tak pahunchata hai aur BGP external prefixes carry karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BGP autonomous systems ke beech path-vector protocol hai, TCP 179 par.</li>
<li>Neighbours haath se configure hote hain, aur policy tay karti hai ki kya bheja aur accept kiya jaaye.</li>
<li>EBGP AS ki seema paar karta hai; IBGP IGP par nirbhar rehkar andar routes baantta hai.</li>
<li>Established ka matlab TCP aur OPEN theek hain, bas.</li>
</ul></div>
`}};export{e as default};