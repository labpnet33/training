var e={id:`forwarding-longest-match`,h:{en:`How a router forwards a packet: longest prefix match`,hi:`Router packet ko kaise forward karta hai: longest prefix match`},body:{en:`
<p>Every routing question on the exam goes back to one idea: <b>longest prefix match</b>. If you understand it fully, preference, static routes and OSPF all become easier.</p>

<h3>The four steps</h3>
<ol>
<li><b>Find candidates.</b> The router collects every route whose prefix contains the destination address.</li>
<li><b>Pick the longest.</b> The route with the longest prefix length (the most specific) wins. A /24 beats a /16, which beats a /8, which beats the default route 0.0.0.0/0 (length 0).</li>
<li><b>Forward.</b> The packet leaves through that route's interface towards its next hop. The router decrements the TTL by one.</li>
<li><b>No match.</b> If nothing matches and there is no default route, the packet is dropped and the router may send an ICMP destination unreachable to the sender.</li>
</ol>
<p>The router does not look at the source address, the application or the size of the prefix's "importance". Only the destination, and only the longest match.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Longest prefix match nesting">
<rect x="20" y="10" width="600" height="190" rx="12" fill="#e2e8f0"/><text x="40" y="32" class="svg-ink" font-size="13">0.0.0.0/0 default: matches everything</text>
<rect x="60" y="45" width="520" height="145" rx="12" fill="#bae6fd"/><text x="80" y="67" class="svg-ink" font-size="13">172.16.0.0/16</text>
<rect x="100" y="80" width="440" height="100" rx="12" fill="#bbf7d0"/><text x="120" y="102" class="svg-ink" font-size="13">172.16.30.0/24 (most specific, wins)</text>
<circle cx="320" cy="145" r="12" fill="#fde68a" stroke="#64748b"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="10">dst</text>
<text x="350" y="150" class="svg-muted" font-size="12">172.16.30.10</text>
</svg><p class="cap">Routes nest like boxes inside boxes. The packet is in all three; the smallest box wins.</p></div>

<h3>Worked example</h3>
<p>R2 in the Nagpur lab has these routes and receives a packet for 172.16.30.10.</p>
<table class="cmp"><tr><th>Route</th><th>Contains 172.16.30.10?</th><th>Length</th></tr>
<tr><td>0.0.0.0/0</td><td>yes</td><td>0</td></tr>
<tr><td>172.16.0.0/16</td><td>yes</td><td>16</td></tr>
<tr><td>172.16.30.0/24</td><td>yes</td><td><b>24 (wins)</b></td></tr>
<tr><td>172.16.31.0/24</td><td>no</td><td>n/a</td></tr>
<tr><td>192.168.0.0/16 (discard)</td><td>no</td><td>n/a</td></tr></table>
<p>This is also why the safety black hole in lab 1 is safe. R2 has <code>192.168.0.0/16 discard</code> and also <code>192.168.10.0/24 next-hop 10.1.12.1</code>. A packet for 192.168.10.10 matches both, but the /24 is longer so it is forwarded to R1. A packet for 192.168.77.5 matches only the /16 and is silently dropped, which is exactly what you want for branches that do not exist yet.</p>

<h3>Why both directions matter</h3>
<p>Routing is hop by hop and each router decides alone. A packet may find its way to the server perfectly, and then the reply can be lost because a router on the way back has no route to the source network. Typical symptoms: a ping times out although the outbound path looks fine, or a traceroute reaches the destination but the ping still fails. When debugging, check the route to the destination on the way out and the route to the source on the way back.</p>
<pre class="out">lab@R1-NAGPUR&gt; show route 172.16.30.10

inet.0: 5 destinations, 5 routes (5 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

<span class="hl">0.0.0.0/0          *[Static/5] 00:03:21</span>
                    &gt;  to 10.1.12.2 via ge-0/0/0.0
</pre>
<p><code>show route 172.16.30.10</code> asks the router to apply the longest-match rule to that address and show the winner. Use <code>show route 172.16.30.0/24 exact</code> to look only for that exact prefix, and <code>show route 192.168.0.0/16 longer</code> to see that prefix and everything more specific inside it.</p>

<h3>Which address is used: the next hop</h3>
<p>The next hop of a route is the IP address of the neighbouring router (or the exit interface for directly connected networks). For an Ethernet link the router also needs the neighbour's MAC address, which it learns with ARP. If ARP fails, the route is installed but packets still cannot be delivered. That is a common confusion: a route can be present and still not work.</p>

<div class="warn"><p><b>Common mistake.</b> Thinking the router prefers "the best protocol" first. It does not. Longest match comes first. Preference (next chapters) is used only to choose between routes to the same prefix.</p></div>
<div class="exam"><p><b>Exam trap.</b> A question gives a /8 from OSPF, a /24 static, and a /16 direct, and asks which forwards a packet. The answer is always the longest prefix that contains the destination, regardless of protocol or preference.</p></div>

<div class="scn"><h4>The default that swallowed a LAN</h4><p>A company added a default route to the internet on its edge router. Soon afterwards, a small lab network 10.77.0.0/24 stopped working. Another engineer had earlier added 10.0.0.0/8 as a discard route "to be safe". Packets to 10.77.0.5 matched the /8 discard (longer than the default) and were thrown away. Adding a specific route for 10.77.0.0/24 towards the lab router restored service, because the /24 is more specific than the /8.</p><p><b>Lesson:</b> longest match explains almost every surprising forwarding result.</p></div>

<div class="iv"><p class="q">"A router has 10.0.0.0/8, 10.20.0.0/16 and 10.20.30.0/24. Where does it send a packet for 10.20.30.7, and for 10.20.99.1?"</p><p>10.20.30.7 matches all three; the /24 is longest, so it uses the /24 route. 10.20.99.1 matches the /8 and the /16 only, so it uses the /16. Say that preference never overrides prefix length; it only chooses between routes to the same prefix.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Forwarding uses the destination IP and the longest matching prefix.</li>
<li>The default route 0.0.0.0/0 has length 0, so it matches only when nothing else does.</li>
<li>No match and no default: drop, possibly with ICMP unreachable.</li>
<li>Replies need routes too; check forward and return paths.</li>
<li>show route address applies longest match; exact and longer refine the search.</li>
</ul></div>
`,hi:`
<p>Exam ka har routing sawaal ek idea par wapas aata hai: <b>longest prefix match</b>. Ise poori tarah samajh lo to preference, static routes aur OSPF sab aasaan ho jaate hain.</p>

<h3>Chaar steps</h3>
<ol>
<li><b>Candidates dhoondo.</b> Router woh saare routes jodta hai jinke prefix mein destination address aata hai.</li>
<li><b>Sabse lamba chuno.</b> Sabse lambi prefix length (sabse specific) wala route jeetta hai. /24 jeetta hai /16 se, jo jeetta hai /8 se, jo jeetta hai default route 0.0.0.0/0 (length 0) se.</li>
<li><b>Forward karo.</b> Packet us route ke interface se next hop ki taraf jaata hai. Router TTL ek ghatata hai.</li>
<li><b>Match nahi.</b> Kuch match na ho aur default route na ho to packet drop hota hai aur router sender ko ICMP destination unreachable bhej sakta hai.</li>
</ol>
<p>Router source address, application ya prefix ki "ahmiyat" nahi dekhta. Sirf destination, aur sirf longest match.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Longest prefix match nesting">
<rect x="20" y="10" width="600" height="190" rx="12" fill="#e2e8f0"/><text x="40" y="32" class="svg-ink" font-size="13">0.0.0.0/0 default: sab kuch match karta hai</text>
<rect x="60" y="45" width="520" height="145" rx="12" fill="#bae6fd"/><text x="80" y="67" class="svg-ink" font-size="13">172.16.0.0/16</text>
<rect x="100" y="80" width="440" height="100" rx="12" fill="#bbf7d0"/><text x="120" y="102" class="svg-ink" font-size="13">172.16.30.0/24 (sabse specific, jeetta hai)</text>
<circle cx="320" cy="145" r="12" fill="#fde68a" stroke="#64748b"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="10">dst</text>
<text x="350" y="150" class="svg-muted" font-size="12">172.16.30.10</text>
</svg><p class="cap">Routes dibbon ke andar dibbon ki tarah nest hote hain. Packet teeno mein hai; sabse chhota dibba jeetta hai.</p></div>

<h3>Worked example</h3>
<p>Nagpur lab mein R2 ke paas yeh routes hain aur use 172.16.30.10 ka packet milta hai.</p>
<table class="cmp"><tr><th>Route</th><th>172.16.30.10 shamil hai?</th><th>Length</th></tr>
<tr><td>0.0.0.0/0</td><td>haan</td><td>0</td></tr>
<tr><td>172.16.0.0/16</td><td>haan</td><td>16</td></tr>
<tr><td>172.16.30.0/24</td><td>haan</td><td><b>24 (jeetta hai)</b></td></tr>
<tr><td>172.16.31.0/24</td><td>nahi</td><td>n/a</td></tr>
<tr><td>192.168.0.0/16 (discard)</td><td>nahi</td><td>n/a</td></tr></table>
<p>Lab 1 ka safety black hole isi wajah se safe hai. R2 ke paas <code>192.168.0.0/16 discard</code> bhi hai aur <code>192.168.10.0/24 next-hop 10.1.12.1</code> bhi. 192.168.10.10 ka packet dono se match karta hai, lekin /24 lamba hai isliye R1 ko forward hota hai. 192.168.77.5 ka packet sirf /16 se match karta hai aur chupchaap drop hota hai, jo un branches ke liye bilkul sahi hai jo abhi bani nahi.</p>

<h3>Dono directions kyun zaroori hain</h3>
<p>Routing hop by hop hoti hai aur har router akela decide karta hai. Packet server tak perfectly pahunch sakta hai, aur phir reply kho sakta hai kyunki wapas ke raaste ke kisi router ke paas source network ka route nahi. Typical symptoms: ping time out hoti hai jabki outbound path theek lagta hai, ya traceroute destination tak pahunchta hai lekin ping phir bhi fail hoti hai. Debug karte waqt jaate hue destination ka route aur wapas aate hue source ka route dono check karo.</p>
<pre class="out">lab@R1-NAGPUR&gt; show route 172.16.30.10

inet.0: 5 destinations, 5 routes (5 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

<span class="hl">0.0.0.0/0          *[Static/5] 00:03:21</span>
                    &gt;  to 10.1.12.2 via ge-0/0/0.0
</pre>
<p><code>show route 172.16.30.10</code> router se kehta hai ki us address par longest-match rule lagao aur winner dikhao. <code>show route 172.16.30.0/24 exact</code> sirf usi exact prefix ko dhoondhta hai, aur <code>show route 192.168.0.0/16 longer</code> us prefix aur uske andar ke saare zyada specific routes dikhata hai.</p>

<h3>Kaunsa address use hota hai: next hop</h3>
<p>Route ka next hop padosi router ka IP address hai (ya directly connected networks ke liye exit interface). Ethernet link par router ko padosi ka MAC address bhi chahiye, jo woh ARP se seekhta hai. ARP fail ho to route installed hota hai lekin packets phir bhi deliver nahi hote. Yeh common confusion hai: route maujood ho sakta hai aur phir bhi kaam nahi karta.</p>

<div class="warn"><p><b>Common mistake.</b> Yeh sochna ki router pehle "best protocol" dekhta hai. Aisa nahi hai. Longest match pehle aata hai. Preference (agle chapters) sirf same prefix ke routes mein se chunne ke liye hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawaal mein OSPF ka /8, static /24 aur direct /16 diya hai aur poochta hai kaunsa packet forward karega. Jawab hamesha woh sabse lamba prefix hai jisme destination aata ho, protocol ya preference se koi matlab nahi.</p></div>

<div class="scn"><h4>Default jo ek LAN nigal gaya</h4><p>Ek company ne edge router par internet ka default route daala. Kuch hi der baad ek chhota lab network 10.77.0.0/24 band ho gaya. Kisi aur engineer ne pehle "safe rehne ke liye" 10.0.0.0/8 discard route daala tha. 10.77.0.5 ke packets /8 discard se match hue (default se lamba) aur phek diye gaye. 10.77.0.0/24 ka lab router ki taraf specific route lagane se service wapas aayi, kyunki /24 /8 se zyada specific hai.</p><p><b>Lesson:</b> longest match lagbhag har hairaan karne wale forwarding result ko samjhata hai.</p></div>

<div class="iv"><p class="q">"Router ke paas 10.0.0.0/8, 10.20.0.0/16 aur 10.20.30.0/24 hain. 10.20.30.7 aur 10.20.99.1 ka packet kahan bhejega?"</p><p>10.20.30.7 teeno se match karta hai; /24 sabse lamba hai, isliye /24 route use hota hai. 10.20.99.1 sirf /8 aur /16 se match karta hai, isliye /16 use hota hai. Kaho ki preference prefix length ko override nahi karti; woh sirf same prefix ke routes mein chunti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Forwarding destination IP aur longest matching prefix use karti hai.</li>
<li>Default route 0.0.0.0/0 ki length 0 hai, isliye woh tabhi match karta hai jab aur kuch nahi karta.</li>
<li>Match nahi aur default nahi: drop, shayad ICMP unreachable ke saath.</li>
<li>Replies ko bhi routes chahiye; forward aur return paths check karo.</li>
<li>show route address longest match lagata hai; exact aur longer search ko refine karte hain.</li>
</ul></div>
`}};export{e as default};