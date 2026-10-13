var e={id:`how-traffic-reaches`,h:{en:`How traffic reaches the cloud`,hi:`Traffic cloud tak kaise pahunchta hai`},body:{en:`
<h3>What you will learn</h3>
<p>The best policy in the world protects nothing if traffic never reaches it. This module is about <b>forwarding</b>: the job of steering a user's packets to the cloud security service. You will learn the three methods, the order in which the simulator chooses between them, what happens when a tunnel fails, and how to tell from a client which path a request took.</p>
<p><b>Prerequisites:</b> module zs-start (policy order, Policy tester, Activate changes), plus basic IP, NAT and DNS.</p>

<h3>An analogy: three ways to reach the airport security hall</h3>
<p>Imagine a security hall that every traveller must pass. A <b>proxy setting</b> is a signboard in the browser that says "queue here for web trips". A <b>tunnel</b> is a dedicated road from your whole office car park to the hall. An <b>agent</b> is a guide who walks with one traveller wherever they go. They all lead to the same hall, but they differ in what they carry and who they cover.</p>

<h3>The three methods</h3>
<table class="cmp"><tr><th>Method</th><th>Who sets it up</th><th>Carries</th><th>Covers</th><th>Sahyadri site</th></tr>
<tr><td>Explicit proxy (PAC file)</td><td>Browser setting</td><td>Browser web traffic only</td><td>Whoever has the setting</td><td>Jaipur</td></tr>
<tr><td>Site tunnel (IPsec or GRE)</td><td>Edge firewall</td><td>All internet traffic from the LAN</td><td>Every device behind the edge</td><td>Pune (IPsec), Chennai (GRE)</td></tr>
<tr><td>Agent (client connector)</td><td>Program on the device</td><td>Traffic from that device</td><td>That device, anywhere</td><td>vikram's laptop</td></tr>
</table>
<p>Remember the vocabulary from module zs-start: a <b>proxy</b> is a middleman for one protocol and a <b>tunnel</b> is a carrier for any packets. A <b>location</b> in the portal records which method a site uses.</p>

<h3>How the simulator decides, per request</h3>
<ol>
<li>If the <b>client connector</b> is installed, signed in and running, its profile decides first. The action for the network the laptop is on is either <code>tunnel</code> (send all internet traffic through the client tunnel) or <code>none</code> (leave it to the site). Domains and IPs on the profile's bypass lists go direct.</li>
<li>Otherwise the <b>site's location method</b> decides: IPsec or GRE tunnel, PAC, or none.</li>
<li>If a tunnel is down, <b>failover</b> applies: <code>block</code> (fail closed, nothing works) or <code>direct</code> (fail open, only works if the edge firewall allows direct internet).</li>
<li>A <b>direct</b> path is unprotected: no policy, no inspection, no logs.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Forwarding decision flow">
<rect x="10" y="10" width="170" height="50" rx="8" fill="#fde68a"/><text x="95" y="40" text-anchor="middle" class="svg-ink" font-size="13">Request from a device</text>
<rect x="230" y="10" width="190" height="50" rx="8" fill="#bae6fd"/><text x="325" y="32" text-anchor="middle" class="svg-ink" font-size="12">Client connector installed,</text><text x="325" y="48" text-anchor="middle" class="svg-ink" font-size="12">signed in, running?</text>
<rect x="470" y="10" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="550" y="32" text-anchor="middle" class="svg-ink" font-size="12">Yes: profile action</text><text x="550" y="48" text-anchor="middle" class="svg-ink" font-size="12">tunnel, none or bypass</text>
<line x1="180" y1="35" x2="230" y2="35" stroke="#64748b" stroke-width="2"/><line x1="420" y1="35" x2="470" y2="35" stroke="#64748b" stroke-width="2"/>
<line x1="325" y1="60" x2="325" y2="100" stroke="#64748b" stroke-width="2"/><text x="335" y="85" class="svg-muted" font-size="12">no</text>
<rect x="230" y="100" width="190" height="50" rx="8" fill="#ddd6fe"/><text x="325" y="122" text-anchor="middle" class="svg-ink" font-size="12">Site location method:</text><text x="325" y="138" text-anchor="middle" class="svg-ink" font-size="12">IPsec, GRE, PAC or none</text>
<line x1="325" y1="150" x2="325" y2="185" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="185" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="115" y="210" text-anchor="middle" class="svg-ink" font-size="12">Up: reaches cloud</text><text x="115" y="228" text-anchor="middle" class="svg-muted" font-size="12">policy and logs</text>
<rect x="235" y="185" width="170" height="60" rx="8" fill="#fed7aa"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="12">Down + failover block</text><text x="320" y="228" text-anchor="middle" class="svg-muted" font-size="12">nothing works</text>
<rect x="440" y="185" width="190" height="60" rx="8" fill="#e2e8f0"/><text x="535" y="210" text-anchor="middle" class="svg-ink" font-size="12">Direct (fail open, none)</text><text x="535" y="228" text-anchor="middle" class="svg-muted" font-size="12">unprotected, no logs</text>
</svg><p class="cap">The client connector is asked first; otherwise the site method decides.</p></div>

<h3>Fail-open or fail-closed</h3>
<p><b>Fail closed</b> (failover block) means: if the tunnel is down, block internet. Secure, but staff are stopped. <b>Fail open</b> (failover direct) keeps people working but sends traffic unprotected, and only works if the site's <b>edge firewall</b> allows direct internet. A site whose edge has direct internet set to block cannot go direct at all. Jaipur is like that: its edge firewall blocks direct internet, so a PAC saying DIRECT fails.</p>
<div class="eg"><p><b>Worked example.</b> Chennai GRE goes down at 11:00. With failover block, meena gets 0 (connection failed) for every site. With failover direct and a firewall that allows direct internet, pages open but there is no log line, so Finance rules and DLP are silently skipped. Which is better depends on the business risk; write the decision down.</p></div>

<h3>Seeing the path from a client</h3>
<pre class="out">C:\\&gt; zapp status
Client connector: not installed
C:\\&gt; pac show
PAC URL: h&#116;tp://pac.sahyadri.example/proxy.pac
C:\\&gt; curl news.example
<span class="hl">200 OK   path: proxy</span>   (served after policy: allowed)</pre>
<p>The path word tells you the story: <code>tunnel</code>, <code>proxy</code>, <code>client</code>, <code>direct</code> or <code>none</code>. <code>direct</code> means unprotected. Labs and tickets in this module are all about getting <code>direct</code> or a failed connection turned into the correct path.</p>

<div class="note"><p><b>What does this change on the wire/policy?</b> The Locations and edge devices page and the Forwarding page do not change what a rule says; they change <b>which traffic ever meets a rule</b>. Switching a site's method moves its packets from one path to another, and only traffic that reaches the cloud gets policy, inspection and logs.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Fixing a rule when the real fault is that traffic goes direct. (2) Choosing fail open without asking whether the edge firewall allows direct. (3) Forgetting that client connector settings override the site method for that laptop.</p></div>
<div class="exam"><p><b>Exam trap.</b> A tunnel-down site with failover direct and an edge that blocks direct internet still fails: fail open is not magic.</p></div>

<div class="scn"><h4>Pune web went quiet, but nobody noticed</h4><p>Pune's tunnel dropped overnight. Failover was direct and the edge allowed it, so users saw nothing wrong. Next morning the SIEM team asked why Pune had zero web logs for six hours. The alert page had shown "tunnel down". The engineer restored the tunnel and changed the process: tunnel-down alerts now page the on-call.</p><p><b>Lesson:</b> fail open hides outages and creates unprotected gaps.</p></div>

<div class="iv"><p class="q">"Explain the ways traffic can be forwarded to a cloud security service."</p><p>Strong answer: explicit proxy via PAC for browsers, site tunnels (IPsec or GRE) for whole offices, and an agent for roaming devices. Compare coverage and what each carries, explain that the agent is asked first, and finish with fail-open versus fail-closed and the risk of direct traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three methods: PAC (browser only), tunnel (whole site), client connector (one device anywhere).</li>
<li>The client connector decides first; otherwise the site method.</li>
<li>Failover block is fail closed; failover direct is fail open.</li>
<li>Direct means no policy, no inspection, no logs.</li>
<li>An edge firewall that blocks direct internet makes DIRECT fail.</li>
</ul></div>
`,hi:`
<h3>Is chapter mein aap kya seekhoge</h3>
<p>Duniya ki best policy bhi kuch protect nahi karti agar traffic us tak pahunche hi nahi. Yeh module <b>forwarding</b> ke baare mein hai: user ke packets ko cloud security service tak steer karne ka kaam. Aap teen methods seekhoge, simulator unke beech kaise chunta hai, tunnel fail ho to kya hota hai, aur client se kaise pata lagayein ki request ne kaun sa path liya.</p>
<p><b>Prerequisites:</b> module zs-start (policy order, Policy tester, Activate changes), saath mein basic IP, NAT aur DNS.</p>

<h3>Ek analogy: airport security hall tak pahunchne ke teen tareeke</h3>
<p>Socho ek security hall hai jisse har traveller ko guzarna hai. <b>Proxy setting</b> browser mein lagi signboard hai jo kehta hai "web trips ke liye yahan queue lagao". <b>Tunnel</b> aapke poore office car park se hall tak ek dedicated road hai. <b>Agent</b> ek guide hai jo ek traveller ke saath jahan woh jaye wahan chalta hai. Teeno same hall tak le jaate hain, lekin kya carry karte hain aur kise cover karte hain isme alag hain.</p>

<h3>Teen methods</h3>
<table class="cmp"><tr><th>Method</th><th>Kaun setup karta hai</th><th>Kya carry karta hai</th><th>Kise cover karta hai</th><th>Sahyadri site</th></tr>
<tr><td>Explicit proxy (PAC file)</td><td>Browser setting</td><td>Sirf browser web traffic</td><td>Jiske paas setting hai</td><td>Jaipur</td></tr>
<tr><td>Site tunnel (IPsec ya GRE)</td><td>Edge firewall</td><td>LAN se saara internet traffic</td><td>Edge ke peeche har device</td><td>Pune (IPsec), Chennai (GRE)</td></tr>
<tr><td>Agent (client connector)</td><td>Device par program</td><td>Us device ka traffic</td><td>Wahi device, kahin bhi</td><td>vikram ka laptop</td></tr>
</table>
<p>Module zs-start ki vocabulary yaad rakho: <b>proxy</b> ek protocol ke liye beech ka aadmi hai aur <b>tunnel</b> kisi bhi packets ka carrier. Portal mein <b>location</b> record karti hai ki site kaun sa method use karti hai.</p>

<h3>Simulator har request ke liye kaise decide karta hai</h3>
<ol>
<li>Agar <b>client connector</b> installed, signed in aur running hai, to pehle uska profile decide karta hai. Laptop jis network par hai uska action ya to <code>tunnel</code> hai (saara internet traffic client tunnel se bhejo) ya <code>none</code> (site par chhod do). Profile ki bypass lists ke domains aur IPs direct jaate hain.</li>
<li>Warna <b>site ka location method</b> decide karta hai: IPsec ya GRE tunnel, PAC, ya none.</li>
<li>Agar tunnel down hai to <b>failover</b> lagta hai: <code>block</code> (fail closed, kuch kaam nahi karta) ya <code>direct</code> (fail open, tabhi chalta hai jab edge firewall direct internet allow kare).</li>
<li><b>Direct</b> path unprotected hai: koi policy nahi, koi inspection nahi, koi logs nahi.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Forwarding decision flow">
<rect x="10" y="10" width="170" height="50" rx="8" fill="#fde68a"/><text x="95" y="40" text-anchor="middle" class="svg-ink" font-size="13">Device se request</text>
<rect x="230" y="10" width="190" height="50" rx="8" fill="#bae6fd"/><text x="325" y="32" text-anchor="middle" class="svg-ink" font-size="12">Client connector installed,</text><text x="325" y="48" text-anchor="middle" class="svg-ink" font-size="12">signed in, running?</text>
<rect x="470" y="10" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="550" y="32" text-anchor="middle" class="svg-ink" font-size="12">Haan: profile action</text><text x="550" y="48" text-anchor="middle" class="svg-ink" font-size="12">tunnel, none ya bypass</text>
<line x1="180" y1="35" x2="230" y2="35" stroke="#64748b" stroke-width="2"/><line x1="420" y1="35" x2="470" y2="35" stroke="#64748b" stroke-width="2"/>
<line x1="325" y1="60" x2="325" y2="100" stroke="#64748b" stroke-width="2"/><text x="335" y="85" class="svg-muted" font-size="12">nahi</text>
<rect x="230" y="100" width="190" height="50" rx="8" fill="#ddd6fe"/><text x="325" y="122" text-anchor="middle" class="svg-ink" font-size="12">Site location method:</text><text x="325" y="138" text-anchor="middle" class="svg-ink" font-size="12">IPsec, GRE, PAC ya none</text>
<line x1="325" y1="150" x2="325" y2="185" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="185" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="115" y="210" text-anchor="middle" class="svg-ink" font-size="12">Up: cloud tak pahunchta</text><text x="115" y="228" text-anchor="middle" class="svg-muted" font-size="12">policy aur logs</text>
<rect x="235" y="185" width="170" height="60" rx="8" fill="#fed7aa"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="12">Down + failover block</text><text x="320" y="228" text-anchor="middle" class="svg-muted" font-size="12">kuch kaam nahi karta</text>
<rect x="440" y="185" width="190" height="60" rx="8" fill="#e2e8f0"/><text x="535" y="210" text-anchor="middle" class="svg-ink" font-size="12">Direct (fail open, none)</text><text x="535" y="228" text-anchor="middle" class="svg-muted" font-size="12">unprotected, no logs</text>
</svg><p class="cap">Client connector se pehle poochha jaata hai; warna site method decide karta hai.</p></div>

<h3>Fail-open ya fail-closed</h3>
<p><b>Fail closed</b> (failover block) ka matlab: tunnel down ho to internet block. Secure, lekin staff ruk jaata hai. <b>Fail open</b> (failover direct) logon ko kaam karne deta hai lekin traffic unprotected bhejta hai, aur tabhi chalta hai jab site ka <b>edge firewall</b> direct internet allow kare. Jis site ke edge par direct internet block set hai woh direct ja hi nahi sakti. Jaipur aisi hi hai: uska edge firewall direct internet block karta hai, to PAC mein DIRECT likhne se fail hota hai.</p>
<div class="eg"><p><b>Worked example.</b> Chennai GRE 11:00 par down ho jaata hai. Failover block ke saath meena ko har site ke liye 0 (connection failed) milta hai. Failover direct aur direct allow karne wale firewall ke saath pages khulte hain lekin koi log line nahi hoti, to Finance rules aur DLP chupchaap skip ho jaate hain. Kaun sa behtar hai woh business risk par depend karta hai; decision likh kar rakho.</p></div>

<h3>Client se path dekhna</h3>
<pre class="out">C:\\&gt; zapp status
Client connector: not installed
C:\\&gt; pac show
PAC URL: h&#116;tp://pac.sahyadri.example/proxy.pac
C:\\&gt; curl news.example
<span class="hl">200 OK   path: proxy</span>   (served after policy: allowed)</pre>
<p>Path word poori kahani batata hai: <code>tunnel</code>, <code>proxy</code>, <code>client</code>, <code>direct</code> ya <code>none</code>. <code>direct</code> ka matlab unprotected. Is module ke labs aur tickets ka maqsad <code>direct</code> ya failed connection ko sahi path mein badalna hai.</p>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Locations and edge devices aur Forwarding pages yeh nahi badalte ki rule kya kehta hai; woh badalte hain ki <b>kaun sa traffic kabhi rule se milta hai</b>. Site ka method badalne se uske packets ek path se doosre par jaate hain, aur sirf cloud tak pahunchne wale traffic ko policy, inspection aur logs milte hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Rule fix karna jab asli fault yeh hai ki traffic direct ja raha hai. (2) Fail open chunna bina poochhe ki edge firewall direct allow karta hai ya nahi. (3) Bhool jaana ki client connector settings us laptop ke liye site method ko override karti hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Tunnel-down site, failover direct aur direct block karne wala edge: phir bhi fail. Fail open jaadu nahi hai.</p></div>

<div class="scn"><h4>Pune web shaant ho gaya, par kisi ne notice nahi kiya</h4><p>Pune ka tunnel raat ko gir gaya. Failover direct tha aur edge allow karta tha, to users ko kuch galat nahi dikha. Agli subah SIEM team ne poochha ki Pune ke chhe ghante ke web logs zero kyun hain. Alert page ne "tunnel down" dikhaya tha. Engineer ne tunnel restore kiya aur process badla: tunnel-down alerts ab on-call ko page karte hain.</p><p><b>Seekh:</b> fail open outages chhupata hai aur unprotected gaps banata hai.</p></div>

<div class="iv"><p class="q">"Cloud security service tak traffic forward karne ke tareeke samjhao."</p><p>Strong answer: browsers ke liye PAC se explicit proxy, poore offices ke liye site tunnels (IPsec ya GRE), aur roaming devices ke liye agent. Coverage aur kya carry karte hain compare karo, batao ki agent se pehle poochha jaata hai, aur fail-open versus fail-closed aur direct traffic ke risk par khatam karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen methods: PAC (sirf browser), tunnel (poori site), client connector (ek device kahin bhi).</li>
<li>Client connector pehle decide karta hai; warna site method.</li>
<li>Failover block fail closed hai; failover direct fail open hai.</li>
<li>Direct matlab koi policy, inspection ya logs nahi.</li>
<li>Jo edge firewall direct internet block karta hai uske saath DIRECT fail hota hai.</li>
</ul></div>
`}};export{e as default};