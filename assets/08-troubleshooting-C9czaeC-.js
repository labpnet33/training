var e={id:`troubleshooting`,h:{en:`Troubleshooting NAT: a workflow and the three lab tickets`,hi:`NAT troubleshooting: workflow aur teen lab tickets`},body:{en:`
<p>NAT problems feel mysterious because the packet changes on its way. The trick is to follow the packet through the same stages the FortiGate does and to check one question at each stage. A courier analogy helps: first check the address on the parcel, then whether the sorting office has a route, then whether the gate lets the parcel in, and finally how the label was changed.</p>

<h3>The NAT workflow</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="NAT troubleshooting stages">
<rect x="8" y="40" width="96" height="70" rx="8" fill="#bae6fd"/><text x="56" y="68" text-anchor="middle" class="svg-ink" font-size="12">1 Flow</text><text x="56" y="88" text-anchor="middle" class="svg-muted" font-size="11">src, dst, port, in-if</text>
<rect x="112" y="40" width="96" height="70" rx="8" fill="#bae6fd"/><text x="160" y="68" text-anchor="middle" class="svg-ink" font-size="12">2 VIP / pool</text><text x="160" y="88" text-anchor="middle" class="svg-muted" font-size="11">object exists?</text>
<rect x="216" y="40" width="96" height="70" rx="8" fill="#ddd6fe"/><text x="264" y="68" text-anchor="middle" class="svg-ink" font-size="12">3 Lookup</text><text x="264" y="88" text-anchor="middle" class="svg-muted" font-size="11">policy id</text>
<rect x="320" y="40" width="96" height="70" rx="8" fill="#ddd6fe"/><text x="368" y="68" text-anchor="middle" class="svg-ink" font-size="12">4 Session</text><text x="368" y="88" text-anchor="middle" class="svg-muted" font-size="11">NAT columns</text>
<rect x="424" y="40" width="96" height="70" rx="8" fill="#fde68a"/><text x="472" y="68" text-anchor="middle" class="svg-ink" font-size="12">5 ARP / route</text><text x="472" y="88" text-anchor="middle" class="svg-muted" font-size="11">reach + return</text>
<rect x="528" y="40" width="96" height="70" rx="8" fill="#bbf7d0"/><text x="576" y="68" text-anchor="middle" class="svg-ink" font-size="12">6 Fix + test</text><text x="576" y="88" text-anchor="middle" class="svg-muted" font-size="11">positive and negative</text>
</svg><p class="cap">Follow the packet: object, policy, session, network.</p></div>
<ol>
<li><b>Define the flow.</b> Who connects to what address and port, arriving on which interface.</li>
<li><b>Check the object.</b> Does the VIP or pool exist with the right <code>extip</code>, <code>extintf</code>, <code>mappedip</code>, ports? (<code>show firewall vip</code>, <code>show firewall ippool</code>).</li>
<li><b>Run the policy lookup</b> for the <i>public</i> destination and the ingress interface. Policy 0 means nothing matches.</li>
<li><b>Read the session table.</b> Check SOURCE-NAT and DESTINATION-NAT. A missing translation tells you which object or policy setting is wrong.</li>
<li><b>Check the network around it.</b> Does the ISP know how to reach the pool or VIP address (ARP or route)? Does the server answer, and does its reply return through the FortiGate?</li>
<li><b>Fix and test both ways.</b> Positive tests should work and negative tests (other ports, ping) should stay blocked.</li>
</ol>

<h3>Ticket 1: the VIP that looks complete but times out</h3>
<p>A junior admin published the DMZ web server on 203.0.113.4, port 80, no port change. The GUI looks complete, but customers get timeouts. Step 1 and 3: reproduce and look up.</p>
<pre class="out">INET-SRV&gt; curl 203.0.113.4
curl: (28) Failed to connect to 203.0.113.4 port 80 after 2001 ms: Timeout was reached

FGT1 # diagnose firewall iprope lookup 8.8.8.8 50000 203.0.113.4 80 tcp port1
&lt;src [8.8.8.8-50000] dst [203.0.113.4-80] proto tcp dev port1&gt; <span class="hl">matches policy id: 0</span></pre>
<p>Policy 0: no policy accepts this packet. Step 2: the VIP and the policy.</p>
<pre class="out">FGT1 # show firewall vip
config firewall vip
    edit "WEB-VIP"
        set extip 203.0.113.4
        set mappedip "10.0.2.10"
        set extintf "port1"
    next
end

FGT1 # show firewall policy 2
config firewall policy
    edit 2
        set name "WAN-to-WEB"
        set srcintf "port1"
        set dstintf "port3"
        set action accept
        set srcaddr "all"
        <span class="hl">set dstaddr "WEB-SERVER"</span>
        set schedule "always"
        set service "HTTP"
    next
end</pre>
<p>The VIP object is correct. The policy uses the address object <code>WEB-SERVER</code> (10.0.2.10) as destination, but the packet arrives addressed to the public IP, so the policy needs the VIP as destination. Fix and verify, positive and negative:</p>
<pre class="code">config firewall policy
    edit 2
        set dstaddr WEB-VIP
    end</pre>
<pre class="out">FGT1 # diagnose firewall iprope lookup 8.8.8.8 50000 203.0.113.4 80 tcp port1
&lt;src [8.8.8.8-50000] dst [203.0.113.4-80] proto tcp dev port1&gt; <span class="hl">matches policy id: 2</span>

INET-SRV&gt; curl 203.0.113.4
&lt;html&gt;&lt;body&gt;&lt;h1&gt;WEB&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;
INET-SRV&gt; curl 203.0.113.4:443
curl: (28) Failed to connect to 203.0.113.4 port 443 after 2001 ms: Timeout was reached

FGT1 # get system session list
PROTO   EXPIRE SOURCE                SOURCE-NAT            DESTINATION           DESTINATION-NAT
tcp     3600   8.8.8.8:57160         -                     203.0.113.4:80        <span class="hl">10.0.2.10:80</span></pre>
<p>The positive test passes, HTTPS to the same address still fails (the policy lists only HTTP), and the session shows the DNAT. Done, and nothing else was opened.</p>

<h3>Ticket 2 and 3: the two build labs, as checklists</h3>
<p><b>Publish with a VIP (port forwarding).</b> The proof points are: VIP shows <code>portforward enable</code>, <code>extport 8080</code>, <code>mappedport 80</code>; the lookup returns the WAN-to-WEB policy for 8080 and policy 0 for port 22; the session shows <code>203.0.113.3:8080</code> with DESTINATION-NAT <code>10.0.2.10:80</code>; ping and port 22 fail. Chapter 5 has the full outputs. The question the lab asks is "Which destination port does the web server really receive?" and the answer is <b>80</b>, read from DESTINATION-NAT.</p>
<p><b>Source NAT with an IP pool.</b> The proof points are: <code>get system session list</code> before shows 203.0.113.2; after the pool, a new session shows 203.0.113.5; the ISP ARP table resolves 203.0.113.5 to the same MAC as 203.0.113.2. The lab asks which address the ISP must ARP for, and the answer is the pool address you see, such as <b>203.0.113.5</b>. Chapter 3 has the full outputs.</p>

<h3>Symptom to cause</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Lookup on public IP returns 0</td><td>policy dstaddr is not the VIP; wrong srcintf; service not mapped port</td><td><code>show firewall policy</code></td></tr>
<tr><td>Lookup OK, still timeout</td><td>server not listening, server default gateway, wrong mappedip</td><td>session table, server side</td></tr>
<tr><td>Session shows no DESTINATION-NAT</td><td>VIP not used by the policy or <code>extintf</code> mismatch</td><td><code>show firewall vip</code></td></tr>
<tr><td>Users have private source on WAN</td><td><code>nat enable</code> missing, or central NAT without entry</td><td>session SOURCE-NAT column</td></tr>
<tr><td>Pool address never answers</td><td>ISP does not route or ARP the pool, wrong range</td><td>ISP ARP table, <code>get firewall ippool</code></td></tr>
<tr><td>LAN cannot open public name</td><td>VIP <code>extintf</code> is port1 only</td><td>chapter 6</td></tr>
<tr><td>Old translation after change</td><td>existing session keeps old rule</td><td>wait for expiry or clear session</td></tr></table>

<div class="warn"><p><b>Common beginner mistakes.</b> Fixing a VIP problem by setting the policy destination to "all" (it works, but opens every address); testing only from inside the LAN; changing NAT settings and reading an old session; forgetting the negative tests.</p></div>
<div class="exam"><p><b>Exam trap.</b> If the lookup for the public address returns 0, look at the policy destination first. If the policy matches but traffic still fails, look at the session table to see whether DNAT happened, then at the server and its return route.</p></div>

<div class="scn"><h4>Everything correct, nothing works</h4><p>A VIP, a policy and a lookup all looked right, yet customers timed out. The session table showed the DNAT to the DMZ server, with replies never arriving. The engineer checked the server: its default gateway pointed to an old router, not the FortiGate. The server received the request and tried to reply through the wrong path. Fixing the gateway on the server solved it with no firewall change.</p><p><b>Lesson:</b> when the session shows the translation but no reply, the problem is outside the FortiGate: server, gateway or ARP.</p></div>

<div class="iv"><p class="q">"A published server is not reachable from the internet. How do you troubleshoot?"</p><p>Reproduce from outside, check the VIP object, run the policy lookup for the public address on the WAN ingress interface, read the session for DNAT, then check the ISP side (ARP or route for the public address) and the server (listening port, gateway). Fix the smallest thing and verify that other ports stay blocked.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Follow the packet: flow, object, lookup, session NAT columns, network, fix and test.</li>
<li>A policy that names the server IP instead of the VIP never matches public traffic.</li>
<li>The session table proves whether translation happened and which port the server receives.</li>
<li>If translation happens but no reply returns, check the server gateway and the path back.</li>
<li>Always test the negative cases after you publish.</li>
</ul></div>
`,hi:`
<p>NAT problems rahasyamayi lagti hain kyunki packet raaste mein badalta hai. Trick yeh hai ki packet ko un hi stages se follow karo jinse FortiGate guzarta hai aur har stage par ek sawal check karo. Courier analogy madad karti hai: pehle parcel ka address dekho, phir sorting office ke paas route hai ya nahi, phir gate parcel ko andar jaane deta hai ya nahi, aur aakhir mein label kaise badla.</p>

<h3>NAT workflow</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="NAT troubleshooting stages">
<rect x="8" y="40" width="96" height="70" rx="8" fill="#bae6fd"/><text x="56" y="68" text-anchor="middle" class="svg-ink" font-size="12">1 Flow</text><text x="56" y="88" text-anchor="middle" class="svg-muted" font-size="11">src, dst, port, in-if</text>
<rect x="112" y="40" width="96" height="70" rx="8" fill="#bae6fd"/><text x="160" y="68" text-anchor="middle" class="svg-ink" font-size="12">2 VIP / pool</text><text x="160" y="88" text-anchor="middle" class="svg-muted" font-size="11">object hai?</text>
<rect x="216" y="40" width="96" height="70" rx="8" fill="#ddd6fe"/><text x="264" y="68" text-anchor="middle" class="svg-ink" font-size="12">3 Lookup</text><text x="264" y="88" text-anchor="middle" class="svg-muted" font-size="11">policy id</text>
<rect x="320" y="40" width="96" height="70" rx="8" fill="#ddd6fe"/><text x="368" y="68" text-anchor="middle" class="svg-ink" font-size="12">4 Session</text><text x="368" y="88" text-anchor="middle" class="svg-muted" font-size="11">NAT columns</text>
<rect x="424" y="40" width="96" height="70" rx="8" fill="#fde68a"/><text x="472" y="68" text-anchor="middle" class="svg-ink" font-size="12">5 ARP / route</text><text x="472" y="88" text-anchor="middle" class="svg-muted" font-size="11">jaana + wapas aana</text>
<rect x="528" y="40" width="96" height="70" rx="8" fill="#bbf7d0"/><text x="576" y="68" text-anchor="middle" class="svg-ink" font-size="12">6 Fix + test</text><text x="576" y="88" text-anchor="middle" class="svg-muted" font-size="11">positive aur negative</text>
</svg><p class="cap">Packet ko follow karo: object, policy, session, network.</p></div>
<ol>
<li><b>Flow define karo.</b> Kaun kis address aur port se connect karta hai, kaunse interface par aakar.</li>
<li><b>Object check karo.</b> Kya VIP ya pool sahi <code>extip</code>, <code>extintf</code>, <code>mappedip</code>, ports ke saath maujood hai? (<code>show firewall vip</code>, <code>show firewall ippool</code>).</li>
<li><b>Policy lookup chalao</b> <i>public</i> destination aur ingress interface ke liye. Policy 0 ka matlab kuch match nahi karta.</li>
<li><b>Session table padho.</b> SOURCE-NAT aur DESTINATION-NAT dekho. Missing translation batata hai kaunsa object ya policy setting galat hai.</li>
<li><b>Aas-paas ka network check karo.</b> Kya ISP ko pool ya VIP address tak pahunchna aata hai (ARP ya route)? Kya server jawab deta hai, aur uska reply FortiGate se hokar wapas aata hai?</li>
<li><b>Fix karo aur dono taraf test karo.</b> Positive tests kaam karein aur negative tests (doosre ports, ping) blocked rahein.</li>
</ol>

<h3>Ticket 1: VIP jo complete dikhta hai lekin timeout deta hai</h3>
<p>Ek junior admin ne DMZ web server ko 203.0.113.4, port 80 par publish kiya, port change nahi. GUI complete dikhta hai, lekin customers ko timeout milta hai. Step 1 aur 3: reproduce karo aur lookup chalao.</p>
<pre class="out">INET-SRV&gt; curl 203.0.113.4
curl: (28) Failed to connect to 203.0.113.4 port 80 after 2001 ms: Timeout was reached

FGT1 # diagnose firewall iprope lookup 8.8.8.8 50000 203.0.113.4 80 tcp port1
&lt;src [8.8.8.8-50000] dst [203.0.113.4-80] proto tcp dev port1&gt; <span class="hl">matches policy id: 0</span></pre>
<p>Policy 0: koi policy is packet ko accept nahi karti. Step 2: VIP aur policy.</p>
<pre class="out">FGT1 # show firewall vip
config firewall vip
    edit "WEB-VIP"
        set extip 203.0.113.4
        set mappedip "10.0.2.10"
        set extintf "port1"
    next
end

FGT1 # show firewall policy 2
config firewall policy
    edit 2
        set name "WAN-to-WEB"
        set srcintf "port1"
        set dstintf "port3"
        set action accept
        set srcaddr "all"
        <span class="hl">set dstaddr "WEB-SERVER"</span>
        set schedule "always"
        set service "HTTP"
    next
end</pre>
<p>VIP object sahi hai. Policy destination ke roop mein address object <code>WEB-SERVER</code> (10.0.2.10) use karti hai, lekin packet public IP ke address ke saath aata hai, isliye policy ko destination mein VIP chahiye. Fix karo aur positive aur negative dono verify karo:</p>
<pre class="code">config firewall policy
    edit 2
        set dstaddr WEB-VIP
    end</pre>
<pre class="out">FGT1 # diagnose firewall iprope lookup 8.8.8.8 50000 203.0.113.4 80 tcp port1
&lt;src [8.8.8.8-50000] dst [203.0.113.4-80] proto tcp dev port1&gt; <span class="hl">matches policy id: 2</span>

INET-SRV&gt; curl 203.0.113.4
&lt;html&gt;&lt;body&gt;&lt;h1&gt;WEB&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;
INET-SRV&gt; curl 203.0.113.4:443
curl: (28) Failed to connect to 203.0.113.4 port 443 after 2001 ms: Timeout was reached

FGT1 # get system session list
PROTO   EXPIRE SOURCE                SOURCE-NAT            DESTINATION           DESTINATION-NAT
tcp     3600   8.8.8.8:57160         -                     203.0.113.4:80        <span class="hl">10.0.2.10:80</span></pre>
<p>Positive test pass hota hai, usi address par HTTPS ab bhi fail hota hai (policy sirf HTTP list karti hai), aur session DNAT dikhata hai. Ho gaya, aur aur kuch nahi khula.</p>

<h3>Ticket 2 aur 3: do build labs, checklists ke roop mein</h3>
<p><b>VIP se publish (port forwarding).</b> Proof points: VIP mein <code>portforward enable</code>, <code>extport 8080</code>, <code>mappedport 80</code> dikhta hai; lookup 8080 ke liye WAN-to-WEB policy aur port 22 ke liye policy 0 deta hai; session <code>203.0.113.3:8080</code> aur DESTINATION-NAT <code>10.0.2.10:80</code> dikhata hai; ping aur port 22 fail hote hain. Chapter 5 mein poore outputs hain. Lab ka sawal "Web server ko asal mein kaunsa destination port milta hai?" hai aur jawab <b>80</b> hai, jo DESTINATION-NAT se padha jaata hai.</p>
<p><b>IP pool ke saath source NAT.</b> Proof points: pehle <code>get system session list</code> 203.0.113.2 dikhata hai; pool ke baad naya session 203.0.113.5 dikhata hai; ISP ARP table 203.0.113.5 ko 203.0.113.2 wale hi MAC par resolve karti hai. Lab poochta hai ki ISP ko kis address ke liye ARP karna hai, aur jawab woh pool address hai jo aap dekhte ho, jaise <b>203.0.113.5</b>. Chapter 3 mein poore outputs hain.</p>

<h3>Symptom se cause</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Public IP ka lookup 0 deta hai</td><td>policy dstaddr VIP nahi; galat srcintf; service mapped port nahi</td><td><code>show firewall policy</code></td></tr>
<tr><td>Lookup OK, phir bhi timeout</td><td>server sun nahi raha, server ka default gateway, galat mappedip</td><td>session table, server side</td></tr>
<tr><td>Session mein DESTINATION-NAT nahi</td><td>policy VIP use nahi karti ya <code>extintf</code> mismatch</td><td><code>show firewall vip</code></td></tr>
<tr><td>Users ka private source WAN par</td><td><code>nat enable</code> missing, ya entry ke bina central NAT</td><td>session SOURCE-NAT column</td></tr>
<tr><td>Pool address kabhi jawab nahi deta</td><td>ISP pool ko route ya ARP nahi karta, galat range</td><td>ISP ARP table, <code>get firewall ippool</code></td></tr>
<tr><td>LAN public naam nahi khol paata</td><td>VIP <code>extintf</code> sirf port1 hai</td><td>chapter 6</td></tr>
<tr><td>Change ke baad purani translation</td><td>existing session purana rule rakhta hai</td><td>expire hone ka intezaar ya session clear</td></tr></table>

<div class="warn"><p><b>Common beginner mistakes.</b> VIP problem ko policy destination "all" karke fix karna (kaam karta hai, lekin har address khol deta hai); sirf LAN ke andar se test karna; NAT settings badalkar purana session padhna; negative tests bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Public address ka lookup 0 de to pehle policy destination dekho. Policy match kare lekin traffic phir bhi fail ho to session table dekho ki DNAT hua ya nahi, phir server aur uska return route.</p></div>

<div class="scn"><h4>Sab sahi, kuch kaam nahi karta</h4><p>VIP, policy aur lookup sab sahi dikhte the, phir bhi customers ko timeout mila. Session table ne DMZ server tak DNAT dikhaya, replies kabhi nahi aaye. Engineer ne server check kiya: uska default gateway purane router par tha, FortiGate par nahi. Server ne request receive ki aur galat raaste se reply karne ki koshish ki. Server par gateway theek karne se firewall change ke bina solve ho gaya.</p><p><b>Lesson:</b> session translation dikhaye lekin reply na aaye to problem FortiGate ke bahar hai: server, gateway ya ARP.</p></div>

<div class="iv"><p class="q">"Published server internet se reachable nahi hai. Kaise troubleshoot karte ho?"</p><p>Bahar se reproduce karo, VIP object check karo, WAN ingress interface par public address ke liye policy lookup chalao, DNAT ke liye session padho, phir ISP side (public address ka ARP ya route) aur server (listening port, gateway) check karo. Sabse chhoti cheez fix karo aur verify karo ki doosre ports blocked rahein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Packet follow karo: flow, object, lookup, session NAT columns, network, fix aur test.</li>
<li>Jo policy VIP ki jagah server IP likhti hai woh public traffic ko kabhi match nahi karti.</li>
<li>Session table saabit karta hai ki translation hua ya nahi aur server ko kaunsa port mila.</li>
<li>Translation ho jaye lekin reply na aaye to server gateway aur wapsi ka raasta check karo.</li>
<li>Publish karne ke baad hamesha negative cases test karo.</li>
</ul></div>
`}};export{e as default};