var e={id:`st0-and-routes`,h:{en:`The st0 tunnel interface and routes into the tunnel`,hi:`st0 tunnel interface aur tunnel ke andar ke routes`},body:{en:`<p><b>Analogy.</b> A tunnel entrance is a door in the wall of your building. Having the door built (the VPN) is not enough; the signs inside the building (routes) must point people to it, and the guard (a policy) must let them through.</p>
<h3>The st0 interface</h3>
<p><code>st0</code> is the secure tunnel interface. Each unit is a separate tunnel: <code>st0.0</code>, <code>st0.1</code> and so on. Give it an address (a /30 is typical) so that routing protocols and troubleshooting can use it, and bind the VPN to it.</p>
<pre class="code">set interfaces st0 unit 0 family inet address 10.255.0.1/30
set security ipsec vpn VPN1 bind-interface st0.0</pre>
<p>The interface comes up only when the VPN is established. If the VPN is down, <code>st0.0</code> is down and routes pointing at it are inactive.</p>
<h3>Routes into the tunnel</h3>
<p>Traffic enters the tunnel only if the routing table says so. Two ways:</p>
<ul><li><b>Static route</b> with next hop <code>st0.0</code>:
<pre class="code">set routing-options static route 192.168.20.0/23 next-hop st0.0</pre></li><li><b>Dynamic routing</b> (OSPF or BGP) enabled on st0.0, so the remote networks are learned automatically:
<pre class="code">set protocols ospf area 0.0.0.0 interface st0.0
set protocols ospf area 0.0.0.0 interface ge-0/0/1.0 passive</pre></li></ul>
<pre class="out">user@DELHI-SRX&gt; show route 192.168.20.0/24
192.168.20.0/24    *[Static/5] 00:00:20
                    <span class="hl">&gt;  via st0.0</span></pre>
<p>If <code>show route</code> shows the default route towards the ISP, the traffic goes out <i>unencrypted</i> (and private addresses are dropped by the ISP).</p>
<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="More specific route points into the tunnel"><rect x="10" y="20" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="12">0.0.0.0/0 to the ISP</text><rect x="10" y="80" width="200" height="40" rx="8" fill="#bbf7d0"/><text x="110" y="105" text-anchor="middle" class="svg-ink" font-size="12">192.168.20.0/23 via st0.0</text><rect x="320" y="45" width="140" height="50" rx="8" fill="#fed7aa"/><text x="390" y="75" text-anchor="middle" class="svg-ink" font-size="13">longest match</text><rect x="520" y="45" width="110" height="50" rx="8" fill="#bae6fd"/><text x="575" y="75" text-anchor="middle" class="svg-ink" font-size="13">tunnel</text><path d="M210 100L320 78M460 70H520" stroke="#64748b" stroke-width="2"/></svg><p class="cap">The more specific route wins and sends traffic into the tunnel.</p></div>
<div class="eg"><p><b>Worked example.</b> Delhi must reach Pune's 192.168.20.0/24 and 192.168.21.0/24. One summary route 192.168.20.0/23 via st0.0 covers both. Pune uses 192.168.10.0/23 via st0.0 for the way back.</p></div>
<div class="warn"><p><b>Common mistake.</b> The classic "tunnel up, no traffic": SAs are up but the route into st0.0 is missing, so the default route carries the traffic. Always run <code>show route DEST</code> and read the interface.</p></div>
<div class="exam"><p><b>Exam trap.</b> The VPN being up does not create routes. For route-based VPNs you must add them (statically or with a routing protocol). Both ends need a route back.</p></div>
<div class="scn"><h4>Ping dies at the ISP</h4><p>Traces showed Delhi packets to Pune disappearing at the ISP's first router, which has no route to private addresses. The static route to the tunnel had been deleted during cleanup. Re-adding it moved traffic into the tunnel at once.</p><p><b>Lesson:</b> when private traffic reaches the ISP, your route into the tunnel is missing.</p></div>
<div class="iv"><p class="q">"The tunnel is up but nothing passes. First check?"</p><p>show route for the destination: does it point at st0.0? If not, add a route (or enable dynamic routing). Then check the zone and policies in both directions and the return route on the peer.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>st0.N is the tunnel interface; it is up only when the VPN is up.</li><li>Traffic enters via a static or dynamic route to st0.N.</li><li>Both ends need routes.</li></ul></div>`,hi:`<p><b>Analogy.</b> Tunnel ka entrance aapki building ki deewar mein ek darwaza hai. Darwaza bana hona (VPN) kaafi nahi; building ke andar ke sign (routes) logon ko usi taraf ishara karein, aur guard (policy) unhe jaane de.</p>
<h3>st0 interface</h3>
<p><code>st0</code> secure tunnel interface hai. Har unit alag tunnel hai: <code>st0.0</code>, <code>st0.1</code> aadi. Use address do (aam taur par /30) taaki routing protocols aur troubleshooting use kar sakein, aur VPN ko use bind karo.</p>
<pre class="code">set interfaces st0 unit 0 family inet address 10.255.0.1/30
set security ipsec vpn VPN1 bind-interface st0.0</pre>
<p>Interface tabhi up hota hai jab VPN establish ho. VPN down ho to <code>st0.0</code> down hai aur uski taraf point karne wale routes inactive hain.</p>
<h3>Tunnel ke andar ke routes</h3>
<p>Traffic tunnel mein tabhi jata hai jab routing table aisa kahe. Do tareeke:</p>
<ul><li>Next hop <code>st0.0</code> ke saath <b>static route</b>:
<pre class="code">set routing-options static route 192.168.20.0/23 next-hop st0.0</pre></li><li>st0.0 par <b>dynamic routing</b> (OSPF ya BGP), taaki remote networks apne aap seekhe jayein:
<pre class="code">set protocols ospf area 0.0.0.0 interface st0.0
set protocols ospf area 0.0.0.0 interface ge-0/0/1.0 passive</pre></li></ul>
<pre class="out">user@DELHI-SRX&gt; show route 192.168.20.0/24
192.168.20.0/24    *[Static/5] 00:00:20
                    <span class="hl">&gt;  via st0.0</span></pre>
<p>Agar <code>show route</code> ISP ki taraf default route dikhata hai, to traffic <i>bina encrypt hue</i> bahar jata hai (aur ISP private addresses drop kar deta hai).</p>
<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Zyada specific route tunnel ki taraf point karta hai"><rect x="10" y="20" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="12">0.0.0.0/0 ISP ki taraf</text><rect x="10" y="80" width="200" height="40" rx="8" fill="#bbf7d0"/><text x="110" y="105" text-anchor="middle" class="svg-ink" font-size="12">192.168.20.0/23 via st0.0</text><rect x="320" y="45" width="140" height="50" rx="8" fill="#fed7aa"/><text x="390" y="75" text-anchor="middle" class="svg-ink" font-size="13">longest match</text><rect x="520" y="45" width="110" height="50" rx="8" fill="#bae6fd"/><text x="575" y="75" text-anchor="middle" class="svg-ink" font-size="13">tunnel</text><path d="M210 100L320 78M460 70H520" stroke="#64748b" stroke-width="2"/></svg><p class="cap">Zyada specific route jeet-ta hai aur traffic ko tunnel mein bhejta hai.</p></div>
<div class="eg"><p><b>Worked example.</b> Delhi ko Pune ka 192.168.20.0/24 aur 192.168.21.0/24 dono reach karne hain. Ek summary route 192.168.20.0/23 via st0.0 dono cover karta hai. Pune wapas ke raaste ke liye 192.168.10.0/23 via st0.0 use karta hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Classic "tunnel up, traffic nahi": SAs up hain lekin st0.0 ke andar ka route missing hai, isliye default route traffic le jata hai. Hamesha <code>show route DEST</code> chalao aur interface padho.</p></div>
<div class="exam"><p><b>Exam trap.</b> VPN up hone se routes nahi bante. Route-based VPNs ke liye aapko unhe jodna padta hai (static ya routing protocol se). Dono ends ko wapas ka route chahiye.</p></div>
<div class="scn"><h4>Ping ISP par mar jata hai</h4><p>Traces ne dikhaya ki Delhi ke Pune wale packets ISP ke pehle router par gayab ho rahe the, jiske paas private addresses ka route nahi. Cleanup ke dauran tunnel ka static route delete ho gaya tha. Wapas jodte hi traffic turant tunnel mein chala gaya.</p><p><b>Lesson:</b> private traffic ISP tak pahunche to aapka tunnel ke andar ka route missing hai.</p></div>
<div class="iv"><p class="q">"Tunnel up hai lekin kuch nahi chalta. Pehle kya check karoge?"</p><p>Destination ke liye show route: kya woh st0.0 ki taraf point karta hai? Nahi to route jodo (ya dynamic routing enable karo). Phir dono directions mein zone aur policies aur peer par return route check karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>st0.N tunnel interface hai; woh tabhi up hota hai jab VPN up ho.</li><li>Traffic st0.N ke static ya dynamic route se andar jata hai.</li><li>Dono ends ko routes chahiye.</li></ul></div>`}};export{e as default};