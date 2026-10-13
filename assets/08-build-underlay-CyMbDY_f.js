var e={id:`build-underlay`,h:{en:`Building the underlay: Delhi Internet circuit (lab vs-underlay-inet)`,hi:`Underlay banana: Delhi Internet circuit (lab vs-underlay-inet)`},body:{en:`
<p>Now you put the theory to work. In lab <b>vs-underlay-inet</b>, the Delhi branch (Branch1) has just received a new Internet circuit. Your job is to bring up the underlay and <b>prove</b> that Branch1 can reach the Controller at 198.51.100.20, before any SD-WAN configuration is attempted. This is exactly what an engineer does on a real turn-up.</p>

<h3>Analogy: laying the road before the bus</h3>
<p>A bus company cannot start a route until the road exists. The underlay is the road: an address, a gateway and a route. Once you can drive from the branch to the headend, you can run the SD-WAN "bus service" on it.</p>

<h3>The facts from the carrier</h3>
<table class="cmp"><tr><th>Item</th><th>Value</th></tr>
<tr><td>Circuit subnet</td><td>203.0.113.4/30</td></tr>
<tr><td>Carrier gateway (PE side)</td><td>203.0.113.5</td></tr>
<tr><td>Branch1 WAN address</td><td>203.0.113.6</td></tr>
<tr><td>Branch1 WAN port</td><td>vni-0/0 (Internet)</td></tr>
<tr><td>Destination to prove</td><td>Controller 198.51.100.20</td></tr>
</table>
<p>Check the /30 arithmetic. 203.0.113.4/30 has four addresses: .4 network, .5 and .6 usable, .7 broadcast. The carrier takes .5, the branch takes .6. The general lab pattern is Internet 203.0.113.(4k)/30 with carrier .(4k+1) and branch .(4k+2); for Delhi k=1, so 4, 5, 6.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Delhi Internet circuit">
<rect x="20" y="60" width="130" height="80" rx="8" fill="#bbf7d0"/><text x="85" y="88" text-anchor="middle" class="svg-ink" font-size="13">Branch1</text><text x="85" y="106" text-anchor="middle" class="svg-muted" font-size="11">Internet-Transport-VR</text><text x="85" y="124" text-anchor="middle" class="svg-muted" font-size="11">vni-0/0 .6</text>
<ellipse cx="320" cy="100" rx="95" ry="38" fill="#ddd6fe"/><text x="320" y="96" text-anchor="middle" class="svg-ink" font-size="13">Carrier / Internet</text><text x="320" y="114" text-anchor="middle" class="svg-muted" font-size="11">gateway 203.0.113.5</text>
<rect x="490" y="60" width="130" height="80" rx="8" fill="#bbf7d0"/><text x="555" y="88" text-anchor="middle" class="svg-ink" font-size="13">Controller</text><text x="555" y="106" text-anchor="middle" class="svg-muted" font-size="11">198.51.100.20</text><text x="555" y="124" text-anchor="middle" class="svg-muted" font-size="11">Mumbai DC</text>
<line x1="150" y1="100" x2="225" y2="100" stroke="#64748b"/><line x1="415" y1="100" x2="490" y2="100" stroke="#64748b"/>
<text x="188" y="92" text-anchor="middle" class="svg-muted" font-size="11">203.0.113.4/30</text>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">Goal: ping 198.51.100.20 succeeds from Branch1</text>
</svg><p class="cap">The default route points at the carrier gateway; the carrier's network carries the rest.</p></div>

<h3>Transport virtual routers</h3>
<p>In Versa a <b>virtual router</b> (VR, routing instance) is a separate routing table inside VOS, like a VRF. VOS uses dedicated <b>transport VRs</b> for WAN circuits so that carrier routing stays apart from the customer's LAN routing. The lab names them <code>Internet-Transport-VR</code>, <code>MPLS-Transport-VR</code> and <code>LTE-Transport-VR</code>. The Internet one carries a <b>default route</b> (0.0.0.0/0) to the carrier gateway; the MPLS one uses a specific route 172.31.0.0/16 via the PE (not a default, because MPLS reaches only private addresses); LTE has a backup default route. Here you only need the Internet VR.</p>

<h3>Step 1: configure</h3>
<pre class="code"><span class="c">! Enter configure mode on Branch1</span>
admin@Branch1-cli&gt; configure
<span class="c">! WAN address on the Internet port, then make sure the port is enabled</span>
admin@Branch1-cli% set interfaces vni-0/0 unit 0 family inet address 203.0.113.6/30
admin@Branch1-cli% set interfaces vni-0/0 enable true
<span class="c">! Default route in the Internet transport VR, via the carrier gateway</span>
admin@Branch1-cli% set routing-instances Internet-Transport-VR routing-options static route 0.0.0.0/0 next-hop 203.0.113.5
admin@Branch1-cli% show | compare
admin@Branch1-cli% commit
admin@Branch1-cli% exit</pre>
<p>Read the statements: <code>interfaces vni-0/0 unit 0 family inet address ...</code> means "on port vni-0/0, logical unit 0, IPv4 family, this address". <code>unit 0</code> is the first logical sub-interface; real VOS also uses units for VLANs. <code>routing-instances ... routing-options static route 0.0.0.0/0 next-hop ...</code> is a static default route inside the named VR.</p>

<h3>Step 2: verify layer by layer</h3>
<pre class="code">show interfaces brief
show route
ping 198.51.100.20</pre>
<pre class="out">admin@Branch1-cli&gt; show interfaces brief
Interface   Admin   Oper    Address
<span class="hl">vni-0/0     up      up      203.0.113.6/30</span>
...
admin@Branch1-cli&gt; show route
L   203.0.113.6/32      dev vni-0/0
C   203.0.113.4/30      dev vni-0/0
<span class="hl">S*  0.0.0.0/0          via 203.0.113.5 dev vni-0/0</span>
admin@Branch1-cli&gt; ping 198.51.100.20
PING 198.51.100.20 56 data bytes
<span class="hl">64 bytes from 198.51.100.20: icmp_seq=1 ttl=63 time=1.5 ms</span>
...
4 packets transmitted, 4 received, 0% packet loss</pre>
<p>Your lab output may list more interfaces and routes. Look at the highlighted lines. The route code <code>C</code> is connected, <code>L</code> local address, <code>S*</code> a static default route (the asterisk marks the default). Exact formatting differs between the model and the real product.</p>

<h3>What a failure looks like</h3>
<table class="cmp"><tr><th>Symptom</th><th>Cause</th><th>Fix</th></tr>
<tr><td>Interface Oper down</td><td>Port administratively disabled, or no link from the carrier</td><td><code>set interfaces vni-0/0 enable true</code>; check cable and carrier</td></tr>
<tr><td>Oper up, Address <code>-</code></td><td>No address configured</td><td>Add the address with the right mask</td></tr>
<tr><td>Ping: Destination Host Unreachable</td><td>No default route, wrong next-hop, or wrong VR</td><td>Check <code>show route</code> for the S* line</td></tr>
<tr><td>Ping to .5 works, to Controller fails</td><td>Carrier-side routing or upstream filtering</td><td>Open a carrier ticket with circuit ID, source .6 and destination .20</td></tr>
</table>

<div class="eg"><p><b>Worked example: test the gateway first.</b> If the ping to 198.51.100.20 fails, ping the gateway 203.0.113.5. A reply means your interface, address and link are fine and the problem is beyond the demarcation point. No reply means check your own side first. This two-step ping is the underlay version of "divide and conquer".</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Using /24 instead of /30 on the circuit address: the router believes a whole /24 is on-link and sends ARP for hosts that do not exist. (2) Setting next-hop to the branch's own address (.6) or to the network address (.4). (3) Putting the default route in the wrong VR or the global table. (4) Forgetting <code>commit</code>. (5) Testing with the LAN address as source and forgetting that the Controller has no route back to it yet.</p></div>
<div class="exam"><p><b>Exam trap.</b> A default route in the MPLS VR is wrong in most designs: the MPLS network does not provide Internet access. MPLS needs a specific route to the headend private range (172.31.0.0/16 via the PE in the lab).</p></div>

<div class="scn"><h4>Fifteen minutes to turn-up</h4><p>A field engineer in Delhi called the NOC: "circuit installed, light is green". The NOC engineer logged in, found vni-0/0 up with the right address but ping to the Controller failed. <code>show route</code> showed connected routes only. The default route was missing because the template had been written for a different circuit. One set statement added 0.0.0.0/0 via 203.0.113.5, ping succeeded and the overlay came up on its own a minute later.</p><p><b>Lesson:</b> prove the underlay with ping before touching SD-WAN settings. It takes two minutes and saves an hour.</p></div>

<div class="iv"><p class="q">"A new branch circuit is installed. How do you verify it before bringing up SD-WAN?"</p><p>Strong answer: confirm interface admin and oper state, address and mask against the carrier sheet, then the default route to the carrier gateway in the transport VR. Ping the gateway, then the Controller's WAN address. Note the circuit ID, and only if ping works start the overlay configuration. If ping to the gateway works but beyond fails, involve the carrier.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay needs three things: interface up, correct address and mask, and a route to the destination.</li>
<li>Delhi: vni-0/0 203.0.113.6/30, default route in Internet-Transport-VR via 203.0.113.5.</li>
<li>Verify with show interfaces brief, show route and ping 198.51.100.20.</li>
<li>Ping the gateway first, then the far end, to find where the path breaks.</li>
<li>Do not start overlay work until the underlay ping succeeds.</li>
</ul></div>
`,hi:`
<p>Ab aap theory ko kaam mein lagate ho. Lab <b>vs-underlay-inet</b> mein Delhi branch (Branch1) ko abhi naya Internet circuit mila hai. Aapka kaam underlay up karna hai aur <b>prove</b> karna hai ki Branch1 Controller 198.51.100.20 tak pahunch sakti hai, kisi bhi SD-WAN configuration se pehle. Real turn-up par engineer bilkul yahi karta hai.</p>

<h3>Analogy: bus se pehle sadak banana</h3>
<p>Bus company sadak ke bina route shuru nahi kar sakti. Underlay sadak hai: ek address, ek gateway aur ek route. Jab aap branch se headend tak gaadi chala sako, tab us par SD-WAN "bus service" chala sakte ho.</p>

<h3>Carrier se mile facts</h3>
<table class="cmp"><tr><th>Item</th><th>Value</th></tr>
<tr><td>Circuit subnet</td><td>203.0.113.4/30</td></tr>
<tr><td>Carrier gateway (PE side)</td><td>203.0.113.5</td></tr>
<tr><td>Branch1 WAN address</td><td>203.0.113.6</td></tr>
<tr><td>Branch1 WAN port</td><td>vni-0/0 (Internet)</td></tr>
<tr><td>Prove karna hai</td><td>Controller 198.51.100.20</td></tr>
</table>
<p>/30 ka hisaab check karo. 203.0.113.4/30 mein chaar addresses hain: .4 network, .5 aur .6 usable, .7 broadcast. Carrier .5 leta hai, branch .6. General lab pattern hai Internet 203.0.113.(4k)/30 jismein carrier .(4k+1) aur branch .(4k+2); Delhi ke liye k=1, yani 4, 5, 6.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Delhi Internet circuit">
<rect x="20" y="60" width="130" height="80" rx="8" fill="#bbf7d0"/><text x="85" y="88" text-anchor="middle" class="svg-ink" font-size="13">Branch1</text><text x="85" y="106" text-anchor="middle" class="svg-muted" font-size="11">Internet-Transport-VR</text><text x="85" y="124" text-anchor="middle" class="svg-muted" font-size="11">vni-0/0 .6</text>
<ellipse cx="320" cy="100" rx="95" ry="38" fill="#ddd6fe"/><text x="320" y="96" text-anchor="middle" class="svg-ink" font-size="13">Carrier / Internet</text><text x="320" y="114" text-anchor="middle" class="svg-muted" font-size="11">gateway 203.0.113.5</text>
<rect x="490" y="60" width="130" height="80" rx="8" fill="#bbf7d0"/><text x="555" y="88" text-anchor="middle" class="svg-ink" font-size="13">Controller</text><text x="555" y="106" text-anchor="middle" class="svg-muted" font-size="11">198.51.100.20</text><text x="555" y="124" text-anchor="middle" class="svg-muted" font-size="11">Mumbai DC</text>
<line x1="150" y1="100" x2="225" y2="100" stroke="#64748b"/><line x1="415" y1="100" x2="490" y2="100" stroke="#64748b"/>
<text x="188" y="92" text-anchor="middle" class="svg-muted" font-size="11">203.0.113.4/30</text>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">Goal: Branch1 se ping 198.51.100.20 succeed ho</text>
</svg><p class="cap">Default route carrier gateway ki taraf point karti hai; baaki carrier ka network sambhalta hai.</p></div>

<h3>Transport virtual routers</h3>
<p>Versa mein <b>virtual router</b> (VR, routing instance) VOS ke andar alag routing table hai, VRF jaisa. VOS WAN circuits ke liye dedicated <b>transport VRs</b> use karta hai taaki carrier routing customer ki LAN routing se alag rahe. Lab mein unke naam <code>Internet-Transport-VR</code>, <code>MPLS-Transport-VR</code> aur <code>LTE-Transport-VR</code> hain. Internet wale mein carrier gateway ki taraf <b>default route</b> (0.0.0.0/0) hoti hai; MPLS wala PE ke through specific route 172.31.0.0/16 use karta hai (default nahi, kyunki MPLS sirf private addresses tak pahunchta hai); LTE mein backup default route hoti hai. Yahan aapko sirf Internet VR chahiye.</p>

<h3>Step 1: configure</h3>
<pre class="code"><span class="c">! Branch1 par configure mode mein jao</span>
admin@Branch1-cli&gt; configure
<span class="c">! Internet port par WAN address, phir port enabled hai yeh pakka karo</span>
admin@Branch1-cli% set interfaces vni-0/0 unit 0 family inet address 203.0.113.6/30
admin@Branch1-cli% set interfaces vni-0/0 enable true
<span class="c">! Internet transport VR mein default route, carrier gateway ke through</span>
admin@Branch1-cli% set routing-instances Internet-Transport-VR routing-options static route 0.0.0.0/0 next-hop 203.0.113.5
admin@Branch1-cli% show | compare
admin@Branch1-cli% commit
admin@Branch1-cli% exit</pre>
<p>Statements padho: <code>interfaces vni-0/0 unit 0 family inet address ...</code> ka matlab "port vni-0/0 par, logical unit 0, IPv4 family, yeh address". <code>unit 0</code> pehla logical sub-interface hai; real VOS units ko VLANs ke liye bhi use karta hai. <code>routing-instances ... routing-options static route 0.0.0.0/0 next-hop ...</code> named VR ke andar static default route hai.</p>

<h3>Step 2: layer by layer verify karo</h3>
<pre class="code">show interfaces brief
show route
ping 198.51.100.20</pre>
<pre class="out">admin@Branch1-cli&gt; show interfaces brief
Interface   Admin   Oper    Address
<span class="hl">vni-0/0     up      up      203.0.113.6/30</span>
...
admin@Branch1-cli&gt; show route
L   203.0.113.6/32      dev vni-0/0
C   203.0.113.4/30      dev vni-0/0
<span class="hl">S*  0.0.0.0/0          via 203.0.113.5 dev vni-0/0</span>
admin@Branch1-cli&gt; ping 198.51.100.20
PING 198.51.100.20 56 data bytes
<span class="hl">64 bytes from 198.51.100.20: icmp_seq=1 ttl=63 time=1.5 ms</span>
...
4 packets transmitted, 4 received, 0% packet loss</pre>
<p>Aapke lab output mein zyada interfaces aur routes ho sakte hain. Highlighted lines dekho. Route code <code>C</code> connected hai, <code>L</code> local address, <code>S*</code> static default route (asterisk default ko mark karta hai). Model aur real product mein exact formatting alag hoti hai.</p>

<h3>Failure kaisi dikhti hai</h3>
<table class="cmp"><tr><th>Symptom</th><th>Cause</th><th>Fix</th></tr>
<tr><td>Interface Oper down</td><td>Port administratively disabled, ya carrier se link nahi</td><td><code>set interfaces vni-0/0 enable true</code>; cable aur carrier check karo</td></tr>
<tr><td>Oper up, Address <code>-</code></td><td>Address configure nahi hua</td><td>Sahi mask ke saath address add karo</td></tr>
<tr><td>Ping: Destination Host Unreachable</td><td>Default route nahi, galat next-hop, ya galat VR</td><td><code>show route</code> mein S* line check karo</td></tr>
<tr><td>.5 ko ping chalta hai, Controller ko fail</td><td>Carrier-side routing ya upstream filtering</td><td>Circuit ID, source .6 aur destination .20 ke saath carrier ticket kholo</td></tr>
</table>

<div class="eg"><p><b>Worked example: pehle gateway test karo.</b> Agar 198.51.100.20 ka ping fail ho, to gateway 203.0.113.5 ko ping karo. Reply aaye to aapka interface, address aur link theek hain aur problem demarcation point ke aage hai. Reply na aaye to pehle apni side check karo. Yeh do-step ping "divide and conquer" ka underlay version hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Circuit address par /30 ki jagah /24 use karna: router sochta hai poora /24 on-link hai aur aise hosts ke liye ARP bhejta hai jo exist nahi karte. (2) Next-hop ko branch ka apna address (.6) ya network address (.4) set kar dena. (3) Default route ko galat VR ya global table mein daalna. (4) <code>commit</code> bhool jaana. (5) LAN address ko source banakar test karna aur bhool jaana ki Controller ke paas uska return route abhi nahi hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> MPLS VR mein default route zyada tar designs mein galat hai: MPLS network Internet access nahi deta. MPLS ko headend private range ka specific route chahiye (lab mein PE ke through 172.31.0.0/16).</p></div>

<div class="scn"><h4>Turn-up ke pandrah minute</h4><p>Delhi ke field engineer ne NOC ko call kiya: "circuit install ho gaya, light green hai". NOC engineer ne login kiya, vni-0/0 up aur sahi address ke saath mila lekin Controller ka ping fail tha. <code>show route</code> sirf connected routes dikha raha tha. Default route missing thi kyunki template kisi aur circuit ke liye likha gaya tha. Ek set statement ne 203.0.113.5 ke through 0.0.0.0/0 add kiya, ping succeed hua aur overlay ek minute baad apne aap up aa gaya.</p><p><b>Seekh:</b> SD-WAN settings chhune se pehle ping se underlay prove karo. Do minute lagte hain aur ek ghanta bachta hai.</p></div>

<div class="iv"><p class="q">"Nayi branch circuit install hui hai. SD-WAN up karne se pehle use kaise verify karoge?"</p><p>Strong answer: interface admin aur oper state, carrier sheet ke against address aur mask confirm karo, phir transport VR mein carrier gateway ki default route. Gateway ko ping karo, phir Controller ke WAN address ko. Circuit ID note karo, aur ping chale tabhi overlay configuration shuru karo. Gateway tak ping chale lekin aage fail ho to carrier ko involve karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay ko teen cheezein chahiye: interface up, sahi address aur mask, aur destination tak route.</li>
<li>Delhi: vni-0/0 203.0.113.6/30, Internet-Transport-VR mein 203.0.113.5 ke through default route.</li>
<li>show interfaces brief, show route aur ping 198.51.100.20 se verify karo.</li>
<li>Pehle gateway ko ping karo, phir far end ko, taaki pata chale path kahan tootta hai.</li>
<li>Underlay ping succeed hone tak overlay kaam shuru mat karo.</li>
</ul></div>
`}};export{e as default};