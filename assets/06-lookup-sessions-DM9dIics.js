var e={id:`lookup-sessions`,h:{en:`The policy lookup tool and reading the session table`,hi:`Policy lookup tool aur session table padhna`},body:{en:`
<p>Waiting for a user to retry an application is slow. A better habit is to <b>ask the FortiGate what it would do</b> with a packet, without sending any traffic. That is the policy lookup. Think of a rule book you can query: "if this person walked in at this door with this ticket, which rule would apply?"</p>

<h3>diagnose firewall iprope lookup</h3>
<p>The syntax lists the 5-tuple and the interface where the packet enters:</p>
<pre class="code">diagnose firewall iprope lookup &lt;src-ip&gt; &lt;src-port&gt; &lt;dst-ip&gt; &lt;dst-port&gt; &lt;protocol&gt; &lt;ingress-interface&gt;</pre>
<p>With the lab policy LAN-to-WAN in place (HTTP, HTTPS, DNS, PING), compare three questions:</p>
<pre class="out">FGT1 # diagnose firewall iprope lookup 10.0.1.10 50000 8.8.8.8 80 tcp port2
&lt;src [10.0.1.10-50000] dst [8.8.8.8-80] proto tcp dev port2&gt; <span class="hl">matches policy id: 1</span>

FGT1 # diagnose firewall iprope lookup 10.0.1.10 50000 8.8.8.8 22 tcp port2
&lt;src [10.0.1.10-50000] dst [8.8.8.8-22] proto tcp dev port2&gt; <span class="hl">matches policy id: 0</span></pre>
<p>Web (TCP 80) is accepted by policy 1. SSH (TCP 22) is not in the service group, so it falls to the implicit deny, id 0. Use a high random source port such as 50000; the source port does not affect the match. For ICMP the port fields are the ICMP type, so the lab uses <code>1</code> and <code>0</code>.</p>
<p>The GUI offers the same tool under <b>Policy &amp; Objects &gt; Firewall Policy &gt; Policy Lookup</b>. Remember what it tells you: the <i>policy decision</i>, not whether the server answers.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Lookup versus real traffic">
<rect x="20" y="20" width="270" height="130" rx="10" fill="#bae6fd"/><text x="155" y="48" text-anchor="middle" class="svg-ink" font-size="14">Policy lookup</text><text x="155" y="74" text-anchor="middle" class="svg-muted" font-size="12">no packet is sent</text><text x="155" y="94" text-anchor="middle" class="svg-muted" font-size="12">answers: which policy id</text><text x="155" y="114" text-anchor="middle" class="svg-muted" font-size="12">does NOT test the server</text>
<rect x="350" y="20" width="270" height="130" rx="10" fill="#bbf7d0"/><text x="485" y="48" text-anchor="middle" class="svg-ink" font-size="14">Real test (curl, ping)</text><text x="485" y="74" text-anchor="middle" class="svg-muted" font-size="12">creates a session + log</text><text x="485" y="94" text-anchor="middle" class="svg-muted" font-size="12">proves end to end path</text><text x="485" y="114" text-anchor="middle" class="svg-muted" font-size="12">counts a hit</text>
</svg><p class="cap">Lookup answers "what would the firewall do". A real test answers "does it work".</p></div>

<h3>Reading a session entry</h3>
<p>For traffic that is accepted, the session table is the next proof. The short form <code>get system session list</code> gives one line per session. The verbose form shows the whole story, including NAT and the policy:</p>
<pre class="out">FGT1 # diagnose sys session list
session info: proto=6 proto_state=01 duration=0 expire=3600 timeout=3600 flags=00000000 socktype=0 sockport=0 av_idx=0 use=3
...
statistic(bytes/packets/allow_err): org=300/3/1 reply=300/2/1 tuples=2
orgin-&gt;sink: org pre-&gt;post, reply pre-&gt;post dev=4-&gt;3/3-&gt;4 gwy=203.0.113.1/10.0.1.20
hook=post dir=org act=snat 10.0.1.20:57160-&gt;198.51.100.10:443(203.0.113.2:60001)
hook=pre dir=reply act=dnat 198.51.100.10:443-&gt;203.0.113.2:60001(10.0.1.20:57160)
misc=0 <span class="hl">policy_id=3</span> pol_uuid_idx=17 auth_info=0 chk_client_info=0 vd=0
...
total session 1</pre>
<ul>
<li><code>proto=6</code> is TCP (17 is UDP, 1 is ICMP). <code>expire</code> counts down to the session timeout.</li>
<li><code>dev=4-&gt;3</code> are interface indexes for ingress and egress.</li>
<li>The two <code>hook</code> lines show the original and the reply direction. <code>act=snat</code> on the way out and <code>act=dnat</code> on the reply is source NAT, covered in <code>nse4-nat</code>.</li>
<li><code>policy_id=3</code> ties the session to the policy that accepted it. This is the cleanest proof of which policy is in use.</li>
</ul>
<p>To avoid scrolling through hundreds of sessions on a busy device, set a filter first with <code>diagnose sys session filter dst 198.51.100.10</code>. The filter stays active for later <code>session list</code> commands until you clear it, so remember to remove it when you finish.</p>

<h3>The flow debug, in theory</h3>
<p>On a real FortiGate the most detailed view is the packet flow debug. It prints one line for every step of the decision, including the line that names the policy or says the packet was denied. Because it can flood the console, you always filter first and limit the packet count. Reference configuration (not run in the simulator):</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
diagnose debug reset
diagnose debug flow filter addr 198.51.100.10
diagnose debug flow filter dport 443
diagnose debug flow show function-name enable
diagnose debug flow trace start 10
diagnose debug enable
<span class="c">! ... send the test traffic ... then stop:</span>
diagnose debug disable
diagnose debug reset</pre>
<p>In the real output you look for text such as "allowed by policy" with the policy ID, or "Denied by forward policy check (policy 0)". The mental model matches what you just did with the lookup tool: route, then policy, then NAT.</p>

<div class="eg"><p><b>Worked example.</b> A user cannot reach TCP 443 on 198.51.100.10. You run the lookup for their IP and port 443 and get policy 1, a deny. Hit counter on policy 1 climbs with every retry. Traffic log shows <code>action="deny" policyid=1</code>. Three tools, one answer. Policy 3 (the exception) is below policy 1, so it is shadowed. You fix the order, run the lookup again, see id 3, and only then ask the user to retry.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Entering the egress interface instead of the ingress one; forgetting that a lookup is only as good as the routing table; trusting the lookup for an application that also needs NAT or DNS; leaving a session or debug filter on after you finish. Always clear debug with <code>diagnose debug reset</code> and <code>diagnose debug disable</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> The lookup takes the <b>ingress</b> interface at the end. The result "matches policy id: 0" means the implicit deny, not a missing tool answer. And a lookup does not create a session, a log entry or a hit count.</p></div>

<div class="scn"><h4>Ten minutes instead of two hours</h4><p>A vendor reported that their monitoring server at 192.0.2.50 could not poll a LAN device. Calls with the vendor had burned two hours. The engineer ran the lookup for 192.0.2.50 to the device on the correct ingress interface and got policy 0 in ten seconds. The vendor's address had never been added to the allow policy. One object edit and a retest closed the ticket.</p><p><b>Lesson:</b> prove the decision with the lookup tool before debating the application.</p></div>

<div class="iv"><p class="q">"How can you tell which policy a packet will hit without generating traffic?"</p><p>Use <code>diagnose firewall iprope lookup</code> with source IP and port, destination IP and port, protocol and the ingress interface, or the Policy Lookup in the GUI. It returns the policy ID or 0 for the implicit deny. For live traffic, confirm with the session table (<code>policy_id</code>), hit counters and the logs, and mention packet flow debug for the full path.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The lookup needs src IP/port, dst IP/port, protocol and the ingress interface.</li>
<li>"matches policy id: 0" is the implicit deny.</li>
<li>The lookup is a decision test; it creates no session, log or hit.</li>
<li>Verbose session output shows SNAT/DNAT hooks and <code>policy_id</code>.</li>
<li>Flow debug is the deep tool on real devices; always filter and reset it.</li>
</ul></div>
`,hi:`
<p>User ke app dobara try karne ka intezaar karna dheema hai. Behtar aadat hai ki <b>FortiGate se poochho ki woh packet ke saath kya karega</b>, bina koi traffic bheje. Yeh policy lookup hai. Ek rule book socho jise aap query kar sakte ho: "agar yeh vyakti is darwaze par is ticket ke saath aata, to kaunsa rule lagta?"</p>

<h3>diagnose firewall iprope lookup</h3>
<p>Syntax 5-tuple aur woh interface likhta hai jahan packet enter karta hai:</p>
<pre class="code">diagnose firewall iprope lookup &lt;src-ip&gt; &lt;src-port&gt; &lt;dst-ip&gt; &lt;dst-port&gt; &lt;protocol&gt; &lt;ingress-interface&gt;</pre>
<p>Lab policy LAN-to-WAN (HTTP, HTTPS, DNS, PING) lagi ho to teen sawalon ko compare karo:</p>
<pre class="out">FGT1 # diagnose firewall iprope lookup 10.0.1.10 50000 8.8.8.8 80 tcp port2
&lt;src [10.0.1.10-50000] dst [8.8.8.8-80] proto tcp dev port2&gt; <span class="hl">matches policy id: 1</span>

FGT1 # diagnose firewall iprope lookup 10.0.1.10 50000 8.8.8.8 22 tcp port2
&lt;src [10.0.1.10-50000] dst [8.8.8.8-22] proto tcp dev port2&gt; <span class="hl">matches policy id: 0</span></pre>
<p>Web (TCP 80) ko policy 1 accept karti hai. SSH (TCP 22) service group mein nahi hai, isliye woh implicit deny, id 0, par girta hai. 50000 jaisa high random source port use karo; source port match ko affect nahi karta. ICMP ke liye port fields ICMP type hote hain, isliye lab mein <code>1</code> aur <code>0</code> use hota hai.</p>
<p>GUI mein wahi tool <b>Policy &amp; Objects &gt; Firewall Policy &gt; Policy Lookup</b> ke neeche milta hai. Yaad rakho yeh aapko kya batata hai: <i>policy decision</i>, yeh nahi ki server jawab deta hai ya nahi.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Lookup versus real traffic">
<rect x="20" y="20" width="270" height="130" rx="10" fill="#bae6fd"/><text x="155" y="48" text-anchor="middle" class="svg-ink" font-size="14">Policy lookup</text><text x="155" y="74" text-anchor="middle" class="svg-muted" font-size="12">koi packet nahi bhejta</text><text x="155" y="94" text-anchor="middle" class="svg-muted" font-size="12">jawab: kaunsi policy id</text><text x="155" y="114" text-anchor="middle" class="svg-muted" font-size="12">server test NAHI karta</text>
<rect x="350" y="20" width="270" height="130" rx="10" fill="#bbf7d0"/><text x="485" y="48" text-anchor="middle" class="svg-ink" font-size="14">Real test (curl, ping)</text><text x="485" y="74" text-anchor="middle" class="svg-muted" font-size="12">session + log banata hai</text><text x="485" y="94" text-anchor="middle" class="svg-muted" font-size="12">end to end path saabit karta hai</text><text x="485" y="114" text-anchor="middle" class="svg-muted" font-size="12">hit count badhata hai</text>
</svg><p class="cap">Lookup batata hai "firewall kya karega". Real test batata hai "kaam karta hai ya nahi".</p></div>

<h3>Session entry padhna</h3>
<p>Jo traffic accept hota hai uske liye session table agla saboot hai. Short form <code>get system session list</code> har session ki ek line deta hai. Verbose form poori kahani dikhata hai, NAT aur policy samet:</p>
<pre class="out">FGT1 # diagnose sys session list
session info: proto=6 proto_state=01 duration=0 expire=3600 timeout=3600 flags=00000000 socktype=0 sockport=0 av_idx=0 use=3
...
statistic(bytes/packets/allow_err): org=300/3/1 reply=300/2/1 tuples=2
orgin-&gt;sink: org pre-&gt;post, reply pre-&gt;post dev=4-&gt;3/3-&gt;4 gwy=203.0.113.1/10.0.1.20
hook=post dir=org act=snat 10.0.1.20:57160-&gt;198.51.100.10:443(203.0.113.2:60001)
hook=pre dir=reply act=dnat 198.51.100.10:443-&gt;203.0.113.2:60001(10.0.1.20:57160)
misc=0 <span class="hl">policy_id=3</span> pol_uuid_idx=17 auth_info=0 chk_client_info=0 vd=0
...
total session 1</pre>
<ul>
<li><code>proto=6</code> TCP hai (17 UDP, 1 ICMP). <code>expire</code> session timeout tak ghat'ta hai.</li>
<li><code>dev=4-&gt;3</code> ingress aur egress ke interface indexes hain.</li>
<li>Do <code>hook</code> lines original aur reply direction dikhati hain. Jaate waqt <code>act=snat</code> aur reply par <code>act=dnat</code> source NAT hai, jo <code>nse4-nat</code> mein cover hota hai.</li>
<li><code>policy_id=3</code> session ko us policy se jodta hai jisne accept kiya. Kaunsi policy use ho rahi hai, iska yeh sabse saaf saboot hai.</li>
</ul>
<p>Busy device par sainkdon sessions mein scroll na karna pade, isliye pehle filter lagao: <code>diagnose sys session filter dst 198.51.100.10</code>. Filter baad ke <code>session list</code> commands ke liye active rehta hai jab tak clear na karo, isliye kaam khatam hone par hata do.</p>

<h3>Flow debug, theory mein</h3>
<p>Real FortiGate par sabse detailed view packet flow debug hai. Yeh decision ke har step ki ek line print karta hai, us line samet jo policy ka naam leti hai ya kehti hai ki packet deny hua. Console flood kar sakta hai, isliye hamesha pehle filter lagate ho aur packet count limit karte ho. Reference configuration (not run in the simulator):</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
diagnose debug reset
diagnose debug flow filter addr 198.51.100.10
diagnose debug flow filter dport 443
diagnose debug flow show function-name enable
diagnose debug flow trace start 10
diagnose debug enable
<span class="c">! ... send the test traffic ... then stop:</span>
diagnose debug disable
diagnose debug reset</pre>
<p>Real output mein aap "allowed by policy" jaisa text policy ID ke saath, ya "Denied by forward policy check (policy 0)" dhoondte ho. Mental model wahi hai jo aapne abhi lookup tool ke saath kiya: route, phir policy, phir NAT.</p>

<div class="eg"><p><b>Worked example.</b> Ek user 198.51.100.10 ka TCP 443 reach nahi kar pa raha. Aap uske IP aur port 443 ke liye lookup chalate ho aur policy 1 milti hai, jo deny hai. Har retry ke saath policy 1 ka hit counter badhta hai. Traffic log <code>action="deny" policyid=1</code> dikhata hai. Teen tools, ek jawab. Policy 3 (exception) policy 1 ke neeche hai, isliye shadowed hai. Aap order theek karte ho, lookup dobara chalate ho, id 3 dekhte ho, aur tab hi user se retry karne ko kehte ho.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Ingress ki jagah egress interface daalna; yeh bhoolna ki lookup utna hi accha hai jitna routing table; us application ke liye lookup par bharosa karna jise NAT ya DNS bhi chahiye; kaam ke baad session ya debug filter on chhod dena. Debug ko hamesha <code>diagnose debug reset</code> aur <code>diagnose debug disable</code> se saaf karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Lookup mein <b>ingress</b> interface aakhir mein jaata hai. "matches policy id: 0" ka matlab implicit deny hai, tool ka jawab missing nahi. Aur lookup session, log entry ya hit count nahi banata.</p></div>

<div class="scn"><h4>Do ghante ki jagah das minute</h4><p>Ek vendor ne bataya ki unka monitoring server 192.0.2.50 LAN device ko poll nahi kar pa raha. Vendor ke saath calls mein do ghante lag chuke the. Engineer ne sahi ingress interface par 192.0.2.50 se device tak lookup chalaya aur das second mein policy 0 mila. Vendor ka address allow policy mein kabhi add hi nahi hua tha. Ek object edit aur retest se ticket band ho gaya.</p><p><b>Lesson:</b> application par behas se pehle lookup tool se decision saabit karo.</p></div>

<div class="iv"><p class="q">"Traffic generate kiye bina kaise pata karoge ki packet kaunsi policy hit karega?"</p><p><code>diagnose firewall iprope lookup</code> use karo: source IP aur port, destination IP aur port, protocol aur ingress interface ke saath, ya GUI ka Policy Lookup. Yeh policy ID ya implicit deny ke liye 0 deta hai. Live traffic ke liye session table (<code>policy_id</code>), hit counters aur logs se confirm karo, aur poore path ke liye packet flow debug ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Lookup ko src IP/port, dst IP/port, protocol aur ingress interface chahiye.</li>
<li>"matches policy id: 0" implicit deny hai.</li>
<li>Lookup decision test hai; yeh session, log ya hit nahi banata.</li>
<li>Verbose session output SNAT/DNAT hooks aur <code>policy_id</code> dikhata hai.</li>
<li>Real devices par flow debug deep tool hai; hamesha filter lagao aur reset karo.</li>
</ul></div>
`}};export{e as default};