var e={id:`virtual-ip`,h:{en:`Virtual IPs: publishing a server with static destination NAT`,hi:`Virtual IPs: static destination NAT se server publish karna`},body:{en:`
<p>Source NAT helps users go out. But what about a customer on the internet who wants to open your company website, which lives on a private server in the DMZ? The customer can only reach a public address. A <b>virtual IP (VIP)</b> tells the FortiGate: "traffic that arrives for this public address belongs to that private server". It is destination NAT. In the reception analogy, it is a published number that the receptionist always forwards to one desk.</p>

<h3>The pieces of a basic VIP</h3>
<p>A VIP is an object in <code>config firewall vip</code>. The basic, static form has four settings:</p>
<table class="cmp"><tr><th>Setting</th><th>Meaning</th><th>Lab value</th></tr>
<tr><td><code>extip</code></td><td>the public (external) address that clients use</td><td>203.0.113.4</td></tr>
<tr><td><code>extintf</code></td><td>the interface where traffic for that address arrives (or <code>any</code>)</td><td>port1</td></tr>
<tr><td><code>mappedip</code></td><td>the internal (real) address of the server</td><td>10.0.2.10</td></tr>
<tr><td><code>type</code></td><td>static NAT, a one-to-one mapping (the default)</td><td>static-nat</td></tr></table>
<pre class="code">config firewall vip
    edit "WEB-VIP"
        set extip 203.0.113.4
        set mappedip "10.0.2.10"
        set extintf "port1"
    next
end</pre>
<p>With no port settings, <b>all ports</b> of 203.0.113.4 map to the same port on 10.0.2.10. That is a full one-to-one mapping, which is powerful and risky: every service on the server becomes reachable if a policy allows it. The policy is where you restrict it.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="VIP static mapping">
<rect x="10" y="70" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="75" y="96" text-anchor="middle" class="svg-ink" font-size="13">Internet client</text><text x="75" y="114" text-anchor="middle" class="svg-muted" font-size="12">8.8.8.8</text>
<rect x="250" y="30" width="150" height="140" rx="10" fill="#ddd6fe"/><text x="325" y="62" text-anchor="middle" class="svg-ink" font-size="14">FortiGate</text><text x="325" y="86" text-anchor="middle" class="svg-muted" font-size="12">VIP WEB-VIP</text><text x="325" y="106" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.4</text><text x="325" y="126" text-anchor="middle" class="svg-muted" font-size="12">maps to 10.0.2.10</text><text x="325" y="150" text-anchor="middle" class="svg-accent" font-size="12">policy accepts</text>
<rect x="510" y="70" width="120" height="60" rx="10" fill="#fde68a"/><text x="570" y="96" text-anchor="middle" class="svg-ink" font-size="13">WEB (DMZ)</text><text x="570" y="114" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.10</text>
<line x1="140" y1="100" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><text x="195" y="92" text-anchor="middle" class="svg-accent" font-size="11">dst 203.0.113.4</text>
<line x1="400" y1="100" x2="510" y2="100" stroke="#64748b" stroke-width="2"/><text x="455" y="92" text-anchor="middle" class="svg-accent" font-size="11">dst 10.0.2.10</text>
</svg><p class="cap">The destination is rewritten as the packet crosses the FortiGate.</p></div>

<h3>A VIP is not enough: you need a policy</h3>
<p>A VIP object only teaches the FortiGate a translation. To let traffic through, you write a policy where the <b>destination is the VIP object</b>, the source is the internet and the destination interface is where the server is:</p>
<pre class="code">config firewall policy
    edit 2
        set name "WAN-to-WEB"
        set srcintf "port1"
        set dstintf "port3"
        set srcaddr "all"
        set dstaddr "WEB-VIP"
        set action accept
        set schedule "always"
        set service "HTTP"
        set nat disable
    next
end</pre>
<p>Notice what is <b>not</b> here: no NAT on the policy. The VIP already does the destination translation, and this inbound policy should not rewrite the client source. Also notice <code>service HTTP</code>: even though the VIP maps all ports, the policy only lets web traffic reach the server.</p>

<h3>The order of operations</h3>
<ol>
<li>The packet for 203.0.113.4 arrives on port1.</li>
<li>The VIP matches: the destination becomes 10.0.2.10 (<b>DNAT first</b>).</li>
<li>Routing looks up 10.0.2.10 and picks port3 (the DMZ).</li>
<li>The policy lookup uses port1 as ingress, port3 as egress and the VIP as destination.</li>
<li>If accepted, a session is created. Replies are translated back automatically.</li>
</ol>
<p>This is why the policy destination interface is the <b>internal</b> side. Beginners often choose port1 because the public address "lives" there; that makes the policy never match.</p>

<h3>Proof from the lab</h3>
<p>The lab published WEB on 203.0.113.4. A complete working state gives these results from INET-SRV (8.8.8.8):</p>
<pre class="out">INET-SRV&gt; curl 203.0.113.4
&lt;html&gt;&lt;body&gt;&lt;h1&gt;WEB&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;

FGT1 # get system session list
PROTO   EXPIRE SOURCE                SOURCE-NAT            DESTINATION           DESTINATION-NAT
tcp     3600   8.8.8.8:57160         -                     203.0.113.4:80        <span class="hl">10.0.2.10:80</span>

FGT1 # diagnose firewall iprope lookup 8.8.8.8 50000 203.0.113.4 80 tcp port1
&lt;src [8.8.8.8-50000] dst [203.0.113.4-80] proto tcp dev port1&gt; <span class="hl">matches policy id: 2</span></pre>
<p>Compare with what you saw for outbound traffic. SOURCE-NAT is a dash (the client address was not changed), and DESTINATION-NAT shows the translation to 10.0.2.10:80. The session line is the proof of a VIP in action.</p>

<h3>Other VIP properties worth knowing</h3>
<ul>
<li><b>Proxy ARP.</b> The FortiGate answers ARP for <code>extip</code> on <code>extintf</code> (<code>arp-reply enable</code> by default), which is why no static route is needed when the address is on the WAN subnet.</li>
<li><code>extintf any</code> makes the VIP usable from every interface.</li>
<li><code>mappedip</code> can be a range. The VIP then maps one-to-one across the range.</li>
<li><code>nat-source-vip enable</code> makes the server's own outbound traffic use the VIP address as source, so it appears on the internet as the same public address that clients use. This is a reference setting (not run in the simulator).</li>
</ul>

<div class="eg"><p><b>Worked example.</b> The ISP gives you 203.0.113.0/29. You use .2 for the FortiGate, .3 for a mail server and .4 for the web server. Two VIPs, one for each server, each with its own policy and a restricted service list. The mail VIP policy allows only SMTP, the web VIP only HTTP and HTTPS. Both servers are published without ever having a public address configured on them.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Writing the policy with the server address object as destination instead of the VIP; choosing the wrong destination interface; leaving the service as ALL; forgetting that the VIP address must be unique and not already used by an interface; enabling NAT on the inbound policy and so hiding every client behind the FortiGate address in the server logs.</p></div>
<div class="exam"><p><b>Exam trap.</b> The VIP is applied in the <b>policy destination</b>. A VIP without a policy gives no access; a policy without the VIP matches the real address and, for a packet addressed to the public IP, does not match at all.</p></div>

<div class="scn"><h4>Published but unreachable</h4><p>A junior admin created WEB-VIP and the policy looked right in the GUI, but customers got timeouts. The lookup for the public address on port1 returned policy 0. The policy destination was the server address object WEB-SERVER (10.0.2.10), not the VIP. The packet arrives addressed to 203.0.113.4, so the policy did not match. Replacing the destination with WEB-VIP made the lookup return policy 2 and the page loaded.</p><p><b>Lesson:</b> the public side of the packet is what the policy sees, and the VIP is the name for it.</p></div>

<div class="iv"><p class="q">"How do you publish an internal web server on a FortiGate?"</p><p>Create a VIP with the external IP, external interface and mapped IP; create an inbound policy from the WAN interface to the server's interface with the VIP as destination and only the needed services; keep NAT off on that policy; test with a lookup and the session table. Mention the order: DNAT, routing, policy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VIP is a destination NAT object: <code>extip</code>, <code>extintf</code>, <code>mappedip</code>.</li>
<li>Without port forwarding, all ports map one-to-one; restrict with the policy service.</li>
<li>The inbound policy uses the VIP as <code>dstaddr</code> and the internal interface as <code>dstintf</code>.</li>
<li>DNAT happens before routing and policy; the session shows it in DESTINATION-NAT.</li>
<li>Keep NAT off on the inbound policy and never leave the service as ALL.</li>
</ul></div>
`,hi:`
<p>Source NAT users ko bahar jaane mein madad karta hai. Lekin internet par baitha customer jo aapki company website kholna chahta hai, jo DMZ ke private server par hai, uska kya? Customer sirf public address tak pahunch sakta hai. <b>Virtual IP (VIP)</b> FortiGate ko batata hai: "is public address ke liye aane wala traffic us private server ka hai". Yeh destination NAT hai. Reception analogy mein yeh ek published number hai jise receptionist hamesha ek desk par forward karti hai.</p>

<h3>Basic VIP ke hisse</h3>
<p>VIP <code>config firewall vip</code> mein ek object hai. Basic, static form mein chaar settings hoti hain:</p>
<table class="cmp"><tr><th>Setting</th><th>Matlab</th><th>Lab value</th></tr>
<tr><td><code>extip</code></td><td>public (external) address jo clients use karte hain</td><td>203.0.113.4</td></tr>
<tr><td><code>extintf</code></td><td>woh interface jahan us address ka traffic aata hai (ya <code>any</code>)</td><td>port1</td></tr>
<tr><td><code>mappedip</code></td><td>server ka internal (real) address</td><td>10.0.2.10</td></tr>
<tr><td><code>type</code></td><td>static NAT, one-to-one mapping (default)</td><td>static-nat</td></tr></table>
<pre class="code">config firewall vip
    edit "WEB-VIP"
        set extip 203.0.113.4
        set mappedip "10.0.2.10"
        set extintf "port1"
    next
end</pre>
<p>Port settings ke bina 203.0.113.4 ke <b>saare ports</b> 10.0.2.10 ke same port se map hote hain. Yeh poora one-to-one mapping hai, jo powerful aur risky hai: policy allow kare to server ki har service reachable ho jaati hai. Policy hi woh jagah hai jahan aap ise restrict karte ho.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="VIP static mapping">
<rect x="10" y="70" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="75" y="96" text-anchor="middle" class="svg-ink" font-size="13">Internet client</text><text x="75" y="114" text-anchor="middle" class="svg-muted" font-size="12">8.8.8.8</text>
<rect x="250" y="30" width="150" height="140" rx="10" fill="#ddd6fe"/><text x="325" y="62" text-anchor="middle" class="svg-ink" font-size="14">FortiGate</text><text x="325" y="86" text-anchor="middle" class="svg-muted" font-size="12">VIP WEB-VIP</text><text x="325" y="106" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.4</text><text x="325" y="126" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.10 se map</text><text x="325" y="150" text-anchor="middle" class="svg-accent" font-size="12">policy accept karti hai</text>
<rect x="510" y="70" width="120" height="60" rx="10" fill="#fde68a"/><text x="570" y="96" text-anchor="middle" class="svg-ink" font-size="13">WEB (DMZ)</text><text x="570" y="114" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.10</text>
<line x1="140" y1="100" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><text x="195" y="92" text-anchor="middle" class="svg-accent" font-size="11">dst 203.0.113.4</text>
<line x1="400" y1="100" x2="510" y2="100" stroke="#64748b" stroke-width="2"/><text x="455" y="92" text-anchor="middle" class="svg-accent" font-size="11">dst 10.0.2.10</text>
</svg><p class="cap">Packet FortiGate cross karte waqt destination rewrite hota hai.</p></div>

<h3>VIP kaafi nahi: policy chahiye</h3>
<p>VIP object sirf FortiGate ko translation sikhata hai. Traffic pass karne ke liye aisi policy likhte ho jahan <b>destination VIP object</b> ho, source internet ho aur destination interface woh ho jahan server hai:</p>
<pre class="code">config firewall policy
    edit 2
        set name "WAN-to-WEB"
        set srcintf "port1"
        set dstintf "port3"
        set srcaddr "all"
        set dstaddr "WEB-VIP"
        set action accept
        set schedule "always"
        set service "HTTP"
        set nat disable
    next
end</pre>
<p>Dhyan do ki yahan kya <b>nahi</b> hai: policy par NAT nahi. VIP destination translation pehle hi kar deta hai, aur is inbound policy ko client source rewrite nahi karna chahiye. <code>service HTTP</code> bhi dekho: VIP saare ports map karta hai, phir bhi policy sirf web traffic ko server tak pahunchne deti hai.</p>

<h3>Operations ka order</h3>
<ol>
<li>203.0.113.4 ka packet port1 par aata hai.</li>
<li>VIP match hota hai: destination 10.0.2.10 ban jaata hai (<b>pehle DNAT</b>).</li>
<li>Routing 10.0.2.10 dhoondti hai aur port3 (DMZ) chunti hai.</li>
<li>Policy lookup port1 ko ingress, port3 ko egress aur VIP ko destination maanta hai.</li>
<li>Accept hua to session banta hai. Replies apne aap wapas translate hote hain.</li>
</ol>
<p>Isi liye policy ka destination interface <b>internal</b> side hota hai. Beginners aksar port1 chunte hain kyunki public address wahan "rehta" hai; tab policy kabhi match nahi karti.</p>

<h3>Lab se saboot</h3>
<p>Lab ne WEB ko 203.0.113.4 par publish kiya. Poori working state INET-SRV (8.8.8.8) se yeh results deti hai:</p>
<pre class="out">INET-SRV&gt; curl 203.0.113.4
&lt;html&gt;&lt;body&gt;&lt;h1&gt;WEB&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;

FGT1 # get system session list
PROTO   EXPIRE SOURCE                SOURCE-NAT            DESTINATION           DESTINATION-NAT
tcp     3600   8.8.8.8:57160         -                     203.0.113.4:80        <span class="hl">10.0.2.10:80</span>

FGT1 # diagnose firewall iprope lookup 8.8.8.8 50000 203.0.113.4 80 tcp port1
&lt;src [8.8.8.8-50000] dst [203.0.113.4-80] proto tcp dev port1&gt; <span class="hl">matches policy id: 2</span></pre>
<p>Outbound traffic se compare karo jo aapne dekha. SOURCE-NAT dash hai (client address nahi badla), aur DESTINATION-NAT 10.0.2.10:80 ki translation dikhata hai. Session line VIP kaam karne ka saboot hai.</p>

<h3>VIP ki aur zaroori properties</h3>
<ul>
<li><b>Proxy ARP.</b> FortiGate <code>extintf</code> par <code>extip</code> ke liye ARP ka jawab deta hai (<code>arp-reply enable</code> default), isliye address WAN subnet mein ho to static route ki zaroorat nahi.</li>
<li><code>extintf any</code> VIP ko har interface se usable banata hai.</li>
<li><code>mappedip</code> range ho sakta hai. Tab VIP range ke across one-to-one map karta hai.</li>
<li><code>nat-source-vip enable</code> server ke apne outbound traffic ko VIP address source ke roop mein use karwata hai, taaki woh internet par usi public address se dikhe jo clients use karte hain. Yeh reference setting hai (not run in the simulator).</li>
</ul>

<div class="eg"><p><b>Worked example.</b> ISP aapko 203.0.113.0/29 deta hai. Aap .2 FortiGate ke liye, .3 mail server ke liye aur .4 web server ke liye use karte ho. Do VIPs, har server ke liye ek, har ek apni policy aur restricted service list ke saath. Mail VIP policy sirf SMTP allow karti hai, web VIP sirf HTTP aur HTTPS. Dono servers publish ho jaate hain bina un par public address configure kiye.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Policy mein VIP ki jagah server address object destination likhna; galat destination interface chunna; service ALL chhod dena; yeh bhoolna ki VIP address unique hona chahiye aur kisi interface ne use nahi kiya hona chahiye; inbound policy par NAT enable karna aur server logs mein har client ko FortiGate address ke peeche chhupa dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> VIP <b>policy destination</b> mein apply hota hai. Policy ke bina VIP koi access nahi deta; VIP ke bina policy real address match karti hai aur public IP ke address wale packet ko bilkul match nahi karti.</p></div>

<div class="scn"><h4>Published lekin unreachable</h4><p>Ek junior admin ne WEB-VIP banaya aur GUI mein policy sahi dikhti thi, lekin customers ko timeouts mile. Port1 par public address ke liye lookup ne policy 0 diya. Policy destination VIP nahi, server address object WEB-SERVER (10.0.2.10) tha. Packet 203.0.113.4 ke address ke saath aata hai, isliye policy match nahi hui. Destination ko WEB-VIP se replace karne par lookup ne policy 2 diya aur page load ho gaya.</p><p><b>Lesson:</b> policy packet ka public side dekhti hai, aur VIP uska naam hai.</p></div>

<div class="iv"><p class="q">"FortiGate par internal web server kaise publish karte ho?"</p><p>External IP, external interface aur mapped IP ke saath VIP banao; WAN interface se server ke interface tak inbound policy banao jisme VIP destination ho aur sirf zaroori services; us policy par NAT off rakho; lookup aur session table se test karo. Order ka zikr karo: DNAT, routing, policy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VIP destination NAT object hai: <code>extip</code>, <code>extintf</code>, <code>mappedip</code>.</li>
<li>Port forwarding ke bina saare ports one-to-one map hote hain; policy service se restrict karo.</li>
<li>Inbound policy VIP ko <code>dstaddr</code> aur internal interface ko <code>dstintf</code> banati hai.</li>
<li>DNAT routing aur policy se pehle hota hai; session ise DESTINATION-NAT mein dikhata hai.</li>
<li>Inbound policy par NAT off rakho aur service kabhi ALL mat chhodo.</li>
</ul></div>
`}};export{e as default};