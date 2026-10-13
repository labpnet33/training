var e={id:`routing-test`,h:{en:`Static routes and testing the data plane`,hi:`Static routes aur data plane test karna`},body:{en:`
<p><b>Analogy: the signboard at the crossroads.</b> Your interfaces give the firewall local streets. To reach a distant city (the internet) it needs a signboard that says "everything unknown, go this way". That is the <b>default route</b>: destination 0.0.0.0/0 with the ISP as next hop.</p>

<h3>Connected and static routes</h3>
<p>The virtual router gets <b>connected routes</b> automatically for every interface that has an IP and is in the router. Everything else needs a route you add or learn. A <b>static route</b> has a destination prefix, a next hop (an IP address, or discard, or another virtual router), and an egress interface:</p>
<pre class="code">set network virtual-router default routing-table ip static-route default destination 0.0.0.0/0 nexthop ip-address 203.0.113.1 interface ethernet1/1
commit</pre>
<p>The word <code>default</code> after <code>static-route</code> is just the route's name. The default metric is 10 and the administrative distance is the static default. Verify with the routing table:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show routing route type static
VIRTUAL ROUTER: default (id 1)
destination        nexthop        metric flags  interface
<span class="hl">0.0.0.0/0          203.0.113.1    10     A S    ethernet1/1</span>
total routes shown: 1</pre>
<p>(Column spacing shortened.) The flags <code>A S</code> mean active and static. The full table also lists the connected networks:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show routing route
destination        nexthop        metric flags  interface
0.0.0.0/0          203.0.113.1    10     A S    ethernet1/1
10.0.1.0/24        10.0.1.1       0      A C    ethernet1/2
10.0.1.1/32        0.0.0.0        0      A H
203.0.113.0/30     203.0.113.2    0      A C    ethernet1/1
203.0.113.2/32     0.0.0.0        0      A H
total routes shown: 5</pre>
<p><code>C</code> is connected and <code>H</code> is a host route for the firewall's own address. The routing table is also what decides the <b>destination zone</b> of a flow: the egress interface of the best route puts the packet into that interface's zone.</p>

<h3>Testing the data plane: ping with a source</h3>
<p>The simple <code>ping host 8.8.8.8</code> leaves through the <b>management</b> interface and the management route, which proves nothing about ethernet1/1. To test the path that user traffic uses, name a data-plane source address:</p>
<pre class="out">admin@NK-PUNE-PA&gt; ping source 203.0.113.2 host 8.8.8.8
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.

--- 8.8.8.8 ping statistics ---
<span class="hl">5 packets transmitted, 0 received, 100% packet loss, time 4003ms</span>

(after adding the default route and committing)
admin@NK-PUNE-PA&gt; ping source 203.0.113.2 host 8.8.8.8
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=63 time=0.80 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=63 time=0.30 ms
...
<span class="hl">5 packets transmitted, 5 received, 0% packet loss, time 4003ms</span></pre>
<p>This is lab task 4: add the default route, commit and prove it. Before the route, packets had nowhere to go. After the route, they reach INET-SRV through the ISP. Note that this ping originates from the firewall itself, so it is not subject to a through-traffic security rule. A <i>user</i> pinging 8.8.8.8 still needs a security rule and NAT, which is the next chapter.</p>

<h3>ARP: the other half of Layer 2</h3>
<pre class="out">admin@NK-PUNE-PA&gt; show arp all
total ARP entries in table :        3
interface         ip address        hw address          port              status  ttl
ethernet1/2       10.0.1.10         00:50:7f:06:6d:01   ethernet1/2       c       1800
ethernet1/1       203.0.113.1       52:54:ca:e3:d3:01   ethernet1/1       c       1800
ethernet1/3       10.0.2.10         00:50:92:14:d4:01   ethernet1/3       c       1800</pre>
<p>An ARP entry with status <code>c</code> (complete) proves the neighbour answered on that interface. If the next hop 203.0.113.1 never appears here, suspect cabling, the interface, or the ISP side, not the route.</p>

<div class="eg"><p><b>Worked example.</b> Ping to 8.8.8.8 with source 203.0.113.2 shows 100% loss. Check order: the interface is up with an IP; the route table has no 0.0.0.0/0; so add the default route. After the commit the same ping shows 0% loss. If it still fails, check <code>show arp all</code> for the ISP next hop.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Testing with a plain <code>ping host</code> and trusting the result. Forgetting that the static route needs a next hop that is on a connected network. Putting the default route in the wrong virtual router. Not committing the route.</p></div>
<div class="exam"><p><b>Exam trap.</b> The destination zone is determined by the route lookup, not by the address in the rule. A missing route can make a flow look like a policy problem. Know the ping source syntax: <code>ping source &lt;ip&gt; host &lt;ip&gt;</code>.</p></div>

<div class="scn"><h4>"The internet works from the firewall but not for users"</h4><p>An admin pinged 8.8.8.8 from the CLI and it worked, so he reported the network fine. Users still could not browse. His ping had used the management interface and its own gateway. When he repeated the test with <code>ping source</code> and a data interface IP, it showed loss: the data-plane default route pointed to the wrong next hop. Fixing the next hop restored browsing.</p><p><b>Lesson:</b> test the same path as the users.</p></div>

<div class="iv"><p class="q">"How do you test internet reachability from a Palo Alto firewall's data plane?"</p><p>Use ping with the source option set to a data interface address, so the packet follows the virtual router and the data interface, not the management interface. Then confirm the route with show routing route and the ARP entry of the next hop with show arp all.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Connected routes are automatic; add a default route to the ISP.</li>
<li>show routing route type static lists static routes; flags A S mean active static.</li>
<li>Plain ping uses the management interface; use ping source for the data plane.</li>
<li>The route lookup decides the destination zone.</li>
<li>show arp all proves Layer 2 neighbours.</li>
</ul></div>
`,hi:`
<p><b>Analogy: chauraahe ka signboard.</b> Aapke interfaces firewall ko local galiyan dete hain. Door ke sheher (internet) tak pahunchne ke liye use ek signboard chahiye jo kahe "jo kuch unknown hai, is taraf jao". Yahi <b>default route</b> hai: destination 0.0.0.0/0 aur next hop ISP.</p>

<h3>Connected aur static routes</h3>
<p>Virtual router ko har us interface ke liye apne-aap <b>connected routes</b> mil jaate hain jis par IP ho aur woh router mein ho. Baaki sab ke liye route chahiye jo aap jodo ya seekho. <b>Static route</b> mein destination prefix, next hop (IP address, ya discard, ya doosra virtual router) aur egress interface hota hai:</p>
<pre class="code">set network virtual-router default routing-table ip static-route default destination 0.0.0.0/0 nexthop ip-address 203.0.113.1 interface ethernet1/1
commit</pre>
<p><code>static-route</code> ke baad <code>default</code> shabd sirf route ka naam hai. Default metric 10 hai aur administrative distance static ka default. Routing table se verify karo:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show routing route type static
VIRTUAL ROUTER: default (id 1)
destination        nexthop        metric flags  interface
<span class="hl">0.0.0.0/0          203.0.113.1    10     A S    ethernet1/1</span>
total routes shown: 1</pre>
<p>(Column spacing chhoti ki gayi hai.) Flags <code>A S</code> ka matlab active aur static. Poori table connected networks bhi list karti hai:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show routing route
destination        nexthop        metric flags  interface
0.0.0.0/0          203.0.113.1    10     A S    ethernet1/1
10.0.1.0/24        10.0.1.1       0      A C    ethernet1/2
10.0.1.1/32        0.0.0.0        0      A H
203.0.113.0/30     203.0.113.2    0      A C    ethernet1/1
203.0.113.2/32     0.0.0.0        0      A H
total routes shown: 5</pre>
<p><code>C</code> connected hai aur <code>H</code> firewall ke apne address ka host route hai. Routing table hi flow ka <b>destination zone</b> bhi tay karti hai: best route ka egress interface packet ko us interface ke zone mein daalta hai.</p>

<h3>Data plane test: source ke saath ping</h3>
<p>Simple <code>ping host 8.8.8.8</code> <b>management</b> interface aur management route se nikalta hai, jo ethernet1/1 ke baare mein kuch saabit nahi karta. User traffic jo path use karta hai use test karne ke liye data-plane source address do:</p>
<pre class="out">admin@NK-PUNE-PA&gt; ping source 203.0.113.2 host 8.8.8.8
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.

--- 8.8.8.8 ping statistics ---
<span class="hl">5 packets transmitted, 0 received, 100% packet loss, time 4003ms</span>

(default route jodne aur commit karne ke baad)
admin@NK-PUNE-PA&gt; ping source 203.0.113.2 host 8.8.8.8
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=63 time=0.80 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=63 time=0.30 ms
...
<span class="hl">5 packets transmitted, 5 received, 0% packet loss, time 4003ms</span></pre>
<p>Yeh lab task 4 hai: default route jodo, commit karo aur saabit karo. Route se pehle packets ke paas jaane ki jagah nahi thi. Route ke baad woh ISP ke through INET-SRV tak pahunchte hain. Dhyan rahe ki yeh ping firewall khud se nikalta hai, isliye through-traffic security rule uspar lagu nahi hota. <i>User</i> ke 8.8.8.8 ping ko abhi bhi security rule aur NAT chahiye, jo agle chapter mein hai.</p>

<h3>ARP: Layer 2 ka doosra hissa</h3>
<pre class="out">admin@NK-PUNE-PA&gt; show arp all
total ARP entries in table :        3
interface         ip address        hw address          port              status  ttl
ethernet1/2       10.0.1.10         00:50:7f:06:6d:01   ethernet1/2       c       1800
ethernet1/1       203.0.113.1       52:54:ca:e3:d3:01   ethernet1/1       c       1800
ethernet1/3       10.0.2.10         00:50:92:14:d4:01   ethernet1/3       c       1800</pre>
<p>Status <code>c</code> (complete) wali ARP entry saabit karti hai ki us interface par neighbour ne jawab diya. Agar next hop 203.0.113.1 yahan kabhi nahi aata, to cabling, interface ya ISP side par shak karo, route par nahi.</p>

<div class="eg"><p><b>Worked example.</b> Source 203.0.113.2 ke saath 8.8.8.8 ping 100% loss dikhata hai. Check order: interface up hai aur IP hai; route table mein 0.0.0.0/0 nahi; isliye default route jodo. Commit ke baad wahi ping 0% loss dikhata hai. Phir bhi fail ho to ISP next hop ke liye <code>show arp all</code> dekho.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Plain <code>ping host</code> se test karke result par bharosa karna. Yeh bhool jaana ki static route ka next hop connected network par hona chahiye. Default route ko galat virtual router mein daalna. Route commit na karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Destination zone route lookup se tay hota hai, rule mein likhe address se nahi. Missing route flow ko policy problem jaisa dikha sakta hai. Ping source syntax jaano: <code>ping source &lt;ip&gt; host &lt;ip&gt;</code>.</p></div>

<div class="scn"><h4>"Firewall se internet chalta hai lekin users ke liye nahi"</h4><p>Ek admin ne CLI se 8.8.8.8 ping kiya aur chala, to usne network theek report kiya. Users phir bhi browse nahi kar pa rahe the. Uske ping ne management interface aur uska apna gateway use kiya tha. Jab usne <code>ping source</code> aur data interface IP ke saath test dohraya to loss dikha: data-plane default route galat next hop ki taraf thi. Next hop theek karne se browsing wapas aayi.</p><p><b>Lesson:</b> wahi path test karo jo users use karte hain.</p></div>

<div class="iv"><p class="q">"Palo Alto firewall ke data plane se internet reachability kaise test karte ho?"</p><p>Ping ko source option ke saath chalao jisme data interface address ho, taaki packet management interface nahi balki virtual router aur data interface follow kare. Phir show routing route se route aur show arp all se next hop ki ARP entry confirm karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Connected routes automatic hain; ISP ki taraf default route jodo.</li>
<li>show routing route type static static routes list karta hai; flags A S matlab active static.</li>
<li>Plain ping management interface use karta hai; data plane ke liye ping source use karo.</li>
<li>Route lookup destination zone tay karta hai.</li>
<li>show arp all Layer 2 neighbours saabit karta hai.</li>
</ul></div>
`}};export{e as default};