var e={id:`route-preferences`,h:{en:`Reading the Junos routing table: preferences and metrics`,hi:`Junos routing table padhna: preferences aur metrics`},body:{en:`
<p><b>Preference is not metric.</b> When several protocols offer a route to the same destination, a router must choose which protocol to believe. On Cisco this value is the <b>administrative distance</b>; on Junos it is the <b>route preference</b> (lower wins). Metric is used only to compare routes <i>within</i> a protocol. Mixing these two is the single most common beginner error and a favourite exam question.</p>
<table class="cmp"><tr><th>Route type on Junos</th><th>Preference</th><th>IOS equivalent</th></tr><tr><td>Direct (connected)</td><td>0</td><td>Connected: 0</td></tr><tr><td>Static</td><td>5</td><td>Static: 1</td></tr><tr><td>IS-IS level 1 internal</td><td>15</td><td>IS-IS: 115</td></tr><tr><td>IS-IS level 2 internal</td><td>18</td><td>IS-IS: 115</td></tr><tr><td>OSPF internal</td><td>10</td><td>OSPF: 110</td></tr><tr><td>IS-IS level 1 external</td><td>160</td><td>IS-IS: 115</td></tr><tr><td>IS-IS level 2 external</td><td>165</td><td>IS-IS: 115</td></tr><tr><td>BGP</td><td>170</td><td>eBGP 20, iBGP 200</td></tr></table>
<p>Notice the extra detail: Junos distinguishes level 1 from level 2 and internal from external routes, while IOS gives IS-IS one distance (115). In a carrier core all IS-IS routes learned from the level-2 database have preference <b>18</b>. That is why an IOS-versus-Junos comparison question has different numbers for the same protocol.</p>
<h3>Reading a real Junos route</h3>
<p>The lab asks exactly this: on JR2, which preference does Junos give R1's loopback 10.30.255.1/32? Real output from JR2:</p>
<pre class="out">JR2&gt; show route 10.30.255.1
inet.0: 6 destinations, 6 routes (6 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

10.30.255.1/32     *[IS-IS/<span class="hl">18</span>] 00:00:04, <span class="hl">metric 20</span>
                    &gt;  to 10.30.2.11 via ge-0/0/1.0</pre>
<ul><li><b>10.30.255.1/32</b> is the destination prefix.</li>
<li><b>*</b> marks the active route that is used for forwarding.</li>
<li><b>[IS-IS/18]</b> is the protocol and the <b>preference</b>: answer to the lab question is 18.</li>
<li><b>00:00:04</b> is the age of the route; <b>metric 20</b> is the IS-IS cost: JR2 to JR1 (10) plus JR1 to R1 (10).</li>
<li><b>&gt; to 10.30.2.11 via ge-0/0/1.0</b> is the next hop and the exit interface; the leading &gt; marks the selected next hop.</li></ul>
<p>On JR1 the same loopback is one hop away with metric 10, which is what the output looked like in the simulator:</p>
<pre class="out">JR1&gt; show route 10.30.255.1
10.30.255.1/32     *[IS-IS/18] 00:00:24, metric 10
                    &gt;  to 10.30.1.1 via ge-0/0/0.0</pre>
<p>Finally prove it works end to end. JR2 pings R1's loopback through JR1; the TTL of 254 shows one router hop (JR1) was crossed:</p>
<pre class="out">JR2&gt; ping 10.30.255.1 count 2
PING 10.30.255.1 (10.30.255.1): 56 data bytes
64 bytes from 10.30.255.1: icmp_seq=0 ttl=<span class="hl">254</span> time=1.700 ms
64 bytes from 10.30.255.1: icmp_seq=1 ttl=254 time=2.000 ms
--- 10.30.255.1 ping statistics ---
2 packets transmitted, 2 packets received, 0% packet loss</pre>
<div class="eg"><p><b>Worked example.</b> Imagine JR2 also learned 10.30.255.1/32 from a static route (preference 5) and from IS-IS (18). The static route wins because 5 is lower than 18, even if the IS-IS metric is better. Preference decides between protocols; metric decides inside a protocol.</p></div>
<div class="warn"><p><b>Common mistake.</b> Comparing the metric of an IS-IS route with the metric of an OSPF route to see which wins. Different protocols are compared by preference first. Also, a floating static route needs a preference above 18 to back up an IS-IS route.</p></div>
<div class="exam"><p><b>Exam trap.</b> Memorise: IS-IS level 1 internal 15, level 2 internal 18, level 1 external 160, level 2 external 165. IOS uses 115 for all IS-IS. Lower preference wins.</p></div>
<div class="scn"><h4>The backup static route that took over</h4><p>An engineer added a "backup" static route for a remote loopback with the default preference of 5. Because 5 is lower than IS-IS level 2 at 18, the static route became the active route and traffic stopped following IS-IS when the topology changed. Setting the static preference to 200 made it a true floating backup.</p><p><b>Lesson:</b> A backup route must have a higher preference than the primary.</p></div>
<div class="iv"><p class="q">"What preference does Junos give IS-IS routes, and how is it different from Cisco?"</p><p>Junos uses 15 for level 1 internal, 18 for level 2 internal, 160 for level 1 external and 165 for level 2 external; lower is better. Cisco uses one administrative distance, 115, for all IS-IS routes. In a level-2 carrier core the Junos value is 18. I read it in show route in the square brackets after IS-IS.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Preference chooses between protocols; metric chooses inside one protocol.</li>
<li>IS-IS on Junos: L1 internal 15, L2 internal 18, L1 external 160, L2 external 165.</li>
<li>IOS uses 115 for all IS-IS routes.</li>
<li>In show route, [IS-IS/18] is protocol and preference; * marks the active route.</li>
<li>A floating static needs a preference above the IGP.</li></ul></div>
`,hi:`
<p><b>Preference metric nahi hai.</b> Jab kai protocols same destination ka route dete hain to router ko tay karna padta hai ki kis protocol par bharosa kare. Cisco par is value ko <b>administrative distance</b> kehte hain; Junos par <b>route preference</b> (kam jeetta hai). Metric sirf ek protocol <i>ke andar</i> routes compare karne ke liye hota hai. In dono ko milana sabse common beginner galti aur exam ka favourite sawaal hai.</p>
<table class="cmp"><tr><th>Junos par route type</th><th>Preference</th><th>IOS equivalent</th></tr><tr><td>Direct (connected)</td><td>0</td><td>Connected: 0</td></tr><tr><td>Static</td><td>5</td><td>Static: 1</td></tr><tr><td>IS-IS level 1 internal</td><td>15</td><td>IS-IS: 115</td></tr><tr><td>IS-IS level 2 internal</td><td>18</td><td>IS-IS: 115</td></tr><tr><td>OSPF internal</td><td>10</td><td>OSPF: 110</td></tr><tr><td>IS-IS level 1 external</td><td>160</td><td>IS-IS: 115</td></tr><tr><td>IS-IS level 2 external</td><td>165</td><td>IS-IS: 115</td></tr><tr><td>BGP</td><td>170</td><td>eBGP 20, iBGP 200</td></tr></table>
<p>Extra detail dekho: Junos level 1 aur level 2 aur internal aur external routes alag karta hai, jabki IOS IS-IS ko ek distance (115) deta hai. Carrier core mein level-2 database se seekhe saare IS-IS routes ki preference <b>18</b> hoti hai. Isliye IOS-versus-Junos comparison question mein same protocol ke liye numbers alag hote hain.</p>
<h3>Real Junos route padhna</h3>
<p>Lab yahi poochta hai: JR2 par Junos R1 ke loopback 10.30.255.1/32 ko kaunsi preference deta hai? JR2 ka real output:</p>
<pre class="out">JR2&gt; show route 10.30.255.1
inet.0: 6 destinations, 6 routes (6 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

10.30.255.1/32     *[IS-IS/<span class="hl">18</span>] 00:00:04, <span class="hl">metric 20</span>
                    &gt;  to 10.30.2.11 via ge-0/0/1.0</pre>
<ul><li><b>10.30.255.1/32</b> destination prefix hai.</li>
<li><b>*</b> active route mark karta hai jo forwarding ke liye use hota hai.</li>
<li><b>[IS-IS/18]</b> protocol aur <b>preference</b> hai: lab ke sawaal ka jawab 18 hai.</li>
<li><b>00:00:04</b> route ki age hai; <b>metric 20</b> IS-IS cost hai: JR2 se JR1 (10) plus JR1 se R1 (10).</li>
<li><b>&gt; to 10.30.2.11 via ge-0/0/1.0</b> next hop aur exit interface hai; shuru ka &gt; selected next hop mark karta hai.</li></ul>
<p>JR1 par wahi loopback ek hop door hai metric 10 ke saath, jaisa simulator mein output tha:</p>
<pre class="out">JR1&gt; show route 10.30.255.1
10.30.255.1/32     *[IS-IS/18] 00:00:24, metric 10
                    &gt;  to 10.30.1.1 via ge-0/0/0.0</pre>
<p>Aakhir mein end to end prove karo. JR2 R1 ke loopback ko JR1 ke through ping karta hai; TTL 254 dikhata hai ki ek router hop (JR1) cross hua:</p>
<pre class="out">JR2&gt; ping 10.30.255.1 count 2
PING 10.30.255.1 (10.30.255.1): 56 data bytes
64 bytes from 10.30.255.1: icmp_seq=0 ttl=<span class="hl">254</span> time=1.700 ms
64 bytes from 10.30.255.1: icmp_seq=1 ttl=254 time=2.000 ms
--- 10.30.255.1 ping statistics ---
2 packets transmitted, 2 packets received, 0% packet loss</pre>
<div class="eg"><p><b>Worked example.</b> Maan lo JR2 ne 10.30.255.1/32 static route (preference 5) aur IS-IS (18) se bhi seekha. Static route jeetta hai kyunki 5, 18 se kam hai, chahe IS-IS ka metric behtar ho. Preference protocols ke beech decide karti hai; metric protocol ke andar.</p></div>
<div class="warn"><p><b>Common mistake.</b> IS-IS route ke metric ko OSPF route ke metric se compare karke dekhna ki kaun jeeta. Alag protocols pehle preference se compare hote hain. Saath hi floating static route ko IS-IS route ka backup banne ke liye 18 se upar preference chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Yaad karo: IS-IS level 1 internal 15, level 2 internal 18, level 1 external 160, level 2 external 165. IOS saare IS-IS ke liye 115 use karta hai. Kam preference jeetti hai.</p></div>
<div class="scn"><h4>Backup static route jo primary ban gaya</h4><p>Engineer ne remote loopback ke liye default preference 5 ke saath "backup" static route joda. 5, IS-IS level 2 ke 18 se kam hai, isliye static route active ban gaya aur topology badalne par traffic IS-IS follow nahi karta tha. Static preference 200 karne se woh sach mein floating backup ban gaya.</p><p><b>Lesson:</b> Backup route ki preference primary se zyada honi chahiye.</p></div>
<div class="iv"><p class="q">"Junos IS-IS routes ko kaunsi preference deta hai, aur Cisco se kaise alag hai?"</p><p>Junos level 1 internal ke liye 15, level 2 internal ke liye 18, level 1 external ke liye 160 aur level 2 external ke liye 165 use karta hai; kam behtar hai. Cisco saare IS-IS routes ke liye ek administrative distance, 115, use karta hai. Level-2 carrier core mein Junos value 18 hai. Main use show route mein IS-IS ke baad square brackets mein padhta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Preference protocols ke beech chunti hai; metric ek protocol ke andar.</li>
<li>Junos par IS-IS: L1 internal 15, L2 internal 18, L1 external 160, L2 external 165.</li>
<li>IOS saare IS-IS routes ke liye 115 use karta hai.</li>
<li>show route mein [IS-IS/18] protocol aur preference hai; * active route mark karta hai.</li>
<li>Floating static ko IGP se upar preference chahiye.</li></ul></div>
`}};export{e as default};