var e={id:`destination-nat`,h:{en:`Destination NAT: publishing a DMZ server`,hi:`Destination NAT: DMZ server ko publish karna`},body:{en:`
<p>Source NAT lets inside users go out. Destination NAT does the reverse job: it lets people on the Internet reach a server that has only a private address. This chapter is the theory behind lab fp-nat-2, publish a server with destination NAT.</p>

<h3>Analogy: the shop with a street number and a back-room store</h3>
<p>A customer knows only the shop address on the main road. The shopkeeper at the front counter takes the request and sends a helper to the back room where the goods really are. The customer never learns the back room location. Destination NAT is the counter: the Internet sees the public address, the engine quietly forwards to the private server.</p>

<h3>The Pune case</h3>
<p>MyPnetLab Pune has a web server <b>WEB1</b> in the DMZ at 172.16.20.20 (element <code>srv-web</code>). It has a private address, so the Internet cannot reach it directly. We choose a public address for it. In the lab the address is given in the task; in this text we write it as the <b>published address</b> and use 203.0.113.10 only as an example from the documentation range. The ISP must route that address to the engine WAN link.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Destination NAT flow">
<rect x="10" y="60" width="130" height="60" rx="8" fill="#e2e8f0"/><text x="75" y="86" text-anchor="middle" class="svg-ink" font-size="13">Internet client</text><text x="75" y="106" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.77</text>
<rect x="215" y="30" width="210" height="120" rx="8" fill="#bae6fd"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="13">NK-PUNE-FW</text><text x="320" y="80" text-anchor="middle" class="svg-accent" font-size="12">1. Access: dst = published</text><text x="320" y="100" text-anchor="middle" class="svg-accent" font-size="12">2. NAT: dst becomes 172.16.20.20</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">3. Route to eth3 (DMZ)</text>
<rect x="500" y="60" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="565" y="86" text-anchor="middle" class="svg-ink" font-size="13">WEB1</text><text x="565" y="106" text-anchor="middle" class="svg-muted" font-size="12">172.16.20.20</text>
<line x1="140" y1="90" x2="215" y2="90" stroke="#64748b" stroke-width="2"/><line x1="425" y1="90" x2="500" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="178" y="80" text-anchor="middle" class="svg-muted" font-size="12">to 203.0.113.10</text><text x="462" y="80" text-anchor="middle" class="svg-muted" font-size="12">to .20.20</text>
</svg><p class="cap">The client talks to the published address; WEB1 receives the packet with its private address. The client address is an example.</p></div>

<h3>Three things must be right</h3>
<ol>
<li><b>The engine must answer for the public address.</b> The ISP router asks "who has this address?" using ARP. The engine answers ARP for the published address when a destination NAT rule uses it, so the packet comes to the engine. If nobody answers, the ISP side has nowhere to send the packet.</li>
<li><b>The NAT rule.</b> Source any, destination the published address, service HTTP (and HTTPS if you serve it), NAT type destination, translated address <code>srv-web</code>. Optionally you can also change the port with a translated port, for example to move a service from port 80 to 8080 on the server.</li>
<li><b>The Access rule uses the PUBLIC address.</b> The Access rule is checked first, on the <b>original</b> addresses. So the destination of the rule is the published address, not 172.16.20.20.</li>
</ol>

<div class="eg"><p><b>Worked example (fp-nat-2).</b> Access rule: source any, destination the published address, service HTTP, action allow, log stored. NAT rule: source any, destination the published address, service HTTP, type dst, translated address srv-web. Use the Install policy bar. A test request from the Internet cloud INET to the published address now returns the page from WEB1. In Logs you see the rule hit on the public address. If you had written srv-web as the Access destination instead, the rule would never match, because at that moment the packet still carries the public address.</p></div>

<h3>Static source NAT for the return path</h3>
<p>Replies from WEB1 go back through the same tracked connection, so the engine rewrites the source of the reply from 172.16.20.20 to the published address automatically. You do not write a rule for it. What you may add is a separate source NAT rule when WEB1 itself must start connections to the Internet (for updates) and should appear from a fixed public address. That is the static source NAT from chapter 2.</p>

<h3>Security thinking</h3>
<p>Publishing a server exposes it. Defensive habits: allow only the services you serve, not any; keep logging at Stored or higher on this rule; keep the server in the DMZ, never in the Staff network; and plan inspection for it (later module). Never allow any-any to a published server.</p>

<div class="warn"><p><b>Common mistake.</b> Matching the private address in the Access rule. The server is "unreachable" even though the NAT rule is perfect, and the Logs show the connection discarded by the last rule.</p></div>

<div class="exam"><p><b>Exam trap.</b> Remembering the order wrong. Access rules use original (pre-NAT) addresses; NAT happens after the allow and before routing. For published servers this means the public destination in the Access rule.</p></div>

<div class="scn"><h4>The page that worked from inside only</h4><p>The Pune team published WEB1. From STAFF-PC the website opened, but from outside it timed out. They had written the Access rule for srv-web, and the Staff test worked only because a different rule allowed Staff to the DMZ. The fix: change the Access rule destination to the published address, Install policy, retest. Logs now showed a hit on the new rule.</p><p><b>Lesson:</b> test a published service from the same side your real users are on.</p></div>

<div class="iv"><p class="q">"You have to publish an internal web server. What do you configure?"</p><p>Strong answer: a destination NAT rule from the public address to the server, an Access rule that allows only the needed service to the public (original) destination, the public address routed to the engine so it can answer ARP, logging on the rule, and then install and test from outside. Mention the server stays in the DMZ.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Destination NAT publishes a private server on a public address.</li>
<li>The engine answers ARP for the published address.</li>
<li>The Access rule matches the original, public destination.</li>
<li>Replies are translated back automatically by connection tracking.</li>
<li>Allow only the services you intend to publish and log the rule.</li>
</ul></div>
`,hi:`
<p>Source NAT inside users ko bahar jaane deta hai. Destination NAT ulta kaam karta hai: Internet ke log aise server tak pahunch sakte hain jiske paas sirf private address hai. Yeh chapter lab fp-nat-2, publish a server with destination NAT, ki theory hai.</p>

<h3>Analogy: street number wali dukaan aur peeche ka godown</h3>
<p>Customer sirf main road par dukaan ka address jaanta hai. Front counter par dukaandaar request leta hai aur helper ko peeche godown bhejta hai jahan saaman asli mein rakha hai. Customer ko godown ki jagah kabhi pata nahi chalti. Destination NAT wahi counter hai: Internet ko public address dikhta hai, engine chupchaap private server ko forward kar deta hai.</p>

<h3>Pune ka case</h3>
<p>MyPnetLab Pune ka web server <b>WEB1</b> DMZ mein 172.16.20.20 par hai (element <code>srv-web</code>). Uska private address hai, isliye Internet seedha pahunch nahi sakta. Hum uske liye public address chunte hain. Lab mein address task mein diya hota hai; is text mein hum use <b>published address</b> likhte hain aur documentation range ka 203.0.113.10 sirf example ke roop mein use karte hain. ISP ko woh address engine ke WAN link par route karna hoga.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Destination NAT flow">
<rect x="10" y="60" width="130" height="60" rx="8" fill="#e2e8f0"/><text x="75" y="86" text-anchor="middle" class="svg-ink" font-size="13">Internet client</text><text x="75" y="106" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.77</text>
<rect x="215" y="30" width="210" height="120" rx="8" fill="#bae6fd"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="13">NK-PUNE-FW</text><text x="320" y="80" text-anchor="middle" class="svg-accent" font-size="12">1. Access: dst = published</text><text x="320" y="100" text-anchor="middle" class="svg-accent" font-size="12">2. NAT: dst 172.16.20.20 ban jaata hai</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">3. eth3 (DMZ) ki taraf route</text>
<rect x="500" y="60" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="565" y="86" text-anchor="middle" class="svg-ink" font-size="13">WEB1</text><text x="565" y="106" text-anchor="middle" class="svg-muted" font-size="12">172.16.20.20</text>
<line x1="140" y1="90" x2="215" y2="90" stroke="#64748b" stroke-width="2"/><line x1="425" y1="90" x2="500" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="178" y="80" text-anchor="middle" class="svg-muted" font-size="12">to 203.0.113.10</text><text x="462" y="80" text-anchor="middle" class="svg-muted" font-size="12">to .20.20</text>
</svg><p class="cap">Client published address se baat karta hai; WEB1 ko packet uske private address ke saath milta hai. Client address example hai.</p></div>

<h3>Teen cheezein sahi honi chahiye</h3>
<ol>
<li><b>Engine public address ke liye jawab de.</b> ISP router ARP se poochta hai "yeh address kiske paas hai?". Jab destination NAT rule us address ko use karta hai to engine published address ke liye ARP ka jawab deta hai, isliye packet engine tak aata hai. Agar koi jawab na de to ISP side ke paas packet bhejne ki jagah nahi.</li>
<li><b>NAT rule.</b> Source any, destination published address, service HTTP (aur HTTPS agar serve karte ho), NAT type destination, translated address <code>srv-web</code>. Chaho to translated port se port bhi badal sakte ho, jaise server par service ko port 80 se 8080 par le jaana.</li>
<li><b>Access rule PUBLIC address use karta hai.</b> Access rule pehle check hota hai, <b>original</b> addresses par. Isliye rule ka destination published address hota hai, 172.16.20.20 nahi.</li>
</ol>

<div class="eg"><p><b>Worked example (fp-nat-2).</b> Access rule: source any, destination published address, service HTTP, action allow, log stored. NAT rule: source any, destination published address, service HTTP, type dst, translated address srv-web. Install policy bar use karo. Internet cloud INET se published address par test request ab WEB1 ka page lauta deti hai. Logs mein public address par rule hit dikhta hai. Agar Access destination mein srv-web likha hota to rule kabhi match nahi karta, kyunki us waqt packet mein public address hi hota hai.</p></div>

<h3>Return path ke liye static source NAT</h3>
<p>WEB1 ke replies usi tracked connection se wapas jaate hain, isliye engine reply ka source 172.16.20.20 se published address mein automatically rewrite karta hai. Uske liye rule nahi likhna. Jo aap alag se add kar sakte ho woh source NAT rule hai, jab WEB1 ko khud Internet par connections shuru karne hon (updates ke liye) aur fixed public address se dikhna ho. Yeh chapter 2 ka static source NAT hai.</p>

<h3>Security ki soch</h3>
<p>Server publish karna use expose karna hai. Defensive aadatein: sirf wahi services allow karo jo serve karte ho, any nahi; is rule par logging Stored ya usse upar rakho; server DMZ mein rakho, kabhi Staff network mein nahi; aur uske liye inspection plan karo (agla module). Published server ko kabhi any-any allow mat karo.</p>

<div class="warn"><p><b>Common mistake.</b> Access rule mein private address match karna. NAT rule perfect hone par bhi server "unreachable" rehta hai, aur Logs mein connection last rule se discard dikhta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Order galat yaad rakhna. Access rules original (pre-NAT) addresses use karte hain; NAT allow ke baad aur routing se pehle hota hai. Published servers ke liye iska matlab hai Access rule mein public destination.</p></div>

<div class="scn"><h4>Page jo sirf andar se khulta tha</h4><p>Pune team ne WEB1 publish kiya. STAFF-PC se website khuli, lekin bahar se timeout aaya. Unhone Access rule srv-web ke liye likha tha, aur Staff test isliye chala kyunki ek alag rule Staff ko DMZ allow karta tha. Fix: Access rule destination ko published address karo, Install policy, dobara test. Logs mein ab naye rule par hit dikha.</p><p><b>Lesson:</b> published service ko usi side se test karo jahan se aapke real users aate hain.</p></div>

<div class="iv"><p class="q">"Aapko internal web server publish karna hai. Kya configure karoge?"</p><p>Strong answer: public address se server tak destination NAT rule, ek Access rule jo sirf zaroori service ko public (original) destination par allow kare, public address engine tak routed ho taaki woh ARP answer kar sake, rule par logging, phir install karke bahar se test. Mention karo ki server DMZ mein rehta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Destination NAT private server ko public address par publish karta hai.</li>
<li>Engine published address ke liye ARP answer karta hai.</li>
<li>Access rule original, public destination par match karta hai.</li>
<li>Replies connection tracking se automatically wapas translate hote hain.</li>
<li>Sirf wahi services allow karo jo publish karni hain aur rule log karo.</li>
</ul></div>
`}};export{e as default};