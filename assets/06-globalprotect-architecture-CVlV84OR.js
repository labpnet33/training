var e={id:`globalprotect-architecture`,h:{en:`GlobalProtect: portals, gateways and the agent`,hi:`GlobalProtect: portals, gateways aur agent`},body:{en:`

<p><b>Remote users are users too.</b> When people work from home, they are outside your network and outside your zones. GlobalProtect gives each remote device a secure tunnel to a firewall and, at the same time, tells the firewall exactly who they are. That is why GlobalProtect belongs in a User-ID module.</p>

<h3>Analogy: the company shuttle bus</h3>
<p>Staff who live far away use a company shuttle. To board, they first visit the <b>transport desk</b> (the portal) which checks their name and tells them which pick-up points exist and the rules. Then they board at a <b>bus stop</b> (the gateway) where the driver checks the ticket again and drives them into the office compound. Inside the compound everything they do is known to security.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="GlobalProtect portal and gateway">
<rect x="20" y="85" width="120" height="60" rx="10" fill="#e2e8f0"/><text x="80" y="112" text-anchor="middle" class="svg-ink" font-size="13">Laptop</text><text x="80" y="130" text-anchor="middle" class="svg-muted" font-size="11">GlobalProtect agent</text>
<rect x="250" y="15" width="140" height="60" rx="10" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Portal</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="11">config and gateway list</text>
<rect x="250" y="155" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="182" text-anchor="middle" class="svg-ink" font-size="13">Gateway</text><text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="11">tunnel and policy</text>
<rect x="500" y="85" width="120" height="60" rx="10" fill="#fde68a"/><text x="560" y="112" text-anchor="middle" class="svg-ink" font-size="13">Corporate</text><text x="560" y="130" text-anchor="middle" class="svg-muted" font-size="11">apps and servers</text>
<line x1="140" y1="100" x2="250" y2="55" stroke="#64748b" stroke-width="2"/><text x="170" y="64" class="svg-accent" font-size="11">1</text>
<line x1="140" y1="130" x2="250" y2="175" stroke="#64748b" stroke-width="2"/><text x="170" y="170" class="svg-accent" font-size="11">2</text>
<line x1="390" y1="185" x2="500" y2="130" stroke="#64748b" stroke-width="2"/><text x="460" y="170" class="svg-accent" font-size="11">3</text>
</svg><p class="cap">1 agent asks the portal for its configuration, 2 agent builds a tunnel to a gateway, 3 traffic enters the zone and is checked by policy.</p></div>

<h3>The three components</h3>
<dl class="terms">
<dt>GlobalProtect agent (app)</dt><dd>Software on the laptop or phone. It connects, authenticates, builds the tunnel and reports the device state.</dd>
<dt>Portal</dt><dd>The management point. It authenticates the user, then sends the <b>agent configuration</b>: which gateways exist, their priorities, connect method, and which root certificates to trust.</dd>
<dt>Gateway</dt><dd>The tunnel endpoint. It authenticates the user, assigns a tunnel IP address from a pool, enforces policy and creates the user mapping.</dd>
</dl>
<p>Both the portal and a gateway are configured on a firewall (they can be the same firewall, or separate ones). Each listens on a Layer 3 interface address, typically on the untrust side, on TCP 443 for the HTTPS part of the exchange.</p>

<h3>Connection steps in order</h3>
<ol>
<li>The agent connects to the portal address (an FQDN such as <code>gp.acme.example</code>) over HTTPS and the user authenticates.</li>
<li>The portal returns the agent configuration and the gateway list.</li>
<li>The agent picks a gateway (by priority and measured response time) and authenticates again to it, often silently with a cookie from the portal.</li>
<li>A tunnel is created. The preferred transport is <b>IPsec</b> (ESP, or UDP port 4501 encapsulation) with <b>SSL/TLS</b> on TCP 443 as fallback when UDP is blocked.</li>
<li>The gateway assigns an IP from the configured pool to the <b>tunnel interface</b>, creates the IP-to-user mapping, and traffic is evaluated by policy from the VPN zone.</li>
</ol>

<h3>External and internal gateways</h3>
<table class="cmp"><tr><th>Type</th><th>Where</th><th>Used for</th></tr>
<tr><td>External gateway</td><td>Facing the internet</td><td>Tunnelled access for remote users</td></tr>
<tr><td>Internal gateway</td><td>Inside the office network</td><td>Identity (User-ID) and device checks for office users, with or without a tunnel</td></tr>
</table>
<p>The agent decides whether it is inside or outside with <b>internal host detection</b>: it asks DNS for the name of a known internal host address; if the expected answer comes back, it is inside and uses internal behaviour, otherwise it uses external gateways.</p>

<h3>Connect methods</h3>
<table class="cmp"><tr><th>Method</th><th>Behaviour</th></tr>
<tr><td>User-logon (always on)</td><td>Connects automatically when the user logs in to the device</td></tr>
<tr><td>Pre-logon (always on)</td><td>Connects before login with a machine identity, then switches to the user; the mapping first appears as pre-logon</td></tr>
<tr><td>On-demand</td><td>The user starts the connection by hand</td></tr>
</table>

<h3>Why this matters for User-ID</h3>
<p>The user authenticates directly to the gateway, so the firewall knows the identity with no guesswork. This mapping is held as long as the tunnel is connected and ends when the user disconnects. Policy for the VPN zone can then use <code>source-user</code> groups just like office rules, which closes the gap that server monitoring cannot cover.</p>

<div class="eg"><p><b>Worked example.</b> A company has 300 engineers who work from home. They connect to <code>gp.acme.example</code>, which resolves to the portal and a gateway on the same firewall. The portal gives them two gateways: Pune and Mumbai. The agent picks the faster one. The tunnel receives an address from 10.250.0.0/24 and the VPN zone has a rule: source-user engineers, application ssh, to the build servers, allow.</p></div>

<div class="note"><p><b>Reference only.</b> Practice. GlobalProtect is not available in the simulator, so there are no commands to run here. Use pan-policy to practise zone and rule logic for the VPN zone, and the certificate material in sec-crypto to understand the trust chain the agent uses.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using a self-signed or private-CA certificate on the portal without distributing the root. The agent refuses to connect, or users click through warnings. Use a certificate from a CA the clients already trust, or push your enterprise root to devices.</p></div>
<div class="exam"><p><b>Exam trap.</b> Portal = authentication, configuration and gateway list. Gateway = tunnel endpoint, tunnel IP assignment, policy enforcement, user mapping. Preferred tunnel is IPsec with SSL fallback. Internal host detection decides internal or external.</p></div>

<div class="scn"><h4>Everyone on the wrong gateway</h4><p>After a second gateway was added in another city, users in the north still connected to the first one and complained about latency. The portal configuration listed both gateways with the same priority, and the agent measured response time only among equal priorities. The team set regional priorities, and users were served by the nearer gateway.</p><p><b>Lesson:</b> The portal controls gateway choice. Set priority and regions deliberately.</p></div>

<div class="iv"><p class="q">"Explain the GlobalProtect portal and gateway and how a connection is built."</p><p>The portal authenticates the user and delivers the agent configuration with the list of gateways, priorities, connect method and trusted root CAs. The agent selects a gateway, authenticates, and builds an IPsec tunnel, with SSL fallback, to the tunnel interface. The gateway assigns an IP from a pool, creates the user mapping, and traffic is evaluated from the VPN zone. I also mention external and internal gateways and internal host detection.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The agent talks to the portal for configuration and to a gateway for the tunnel.</li>
<li>The gateway assigns the tunnel IP, enforces policy and creates the user mapping.</li>
<li>IPsec is preferred; SSL/TLS on TCP 443 is the fallback.</li>
<li>External gateways serve remote users; internal gateways give identity inside the office.</li>
<li>Connect methods: user-logon, pre-logon, on-demand.</li>
</ul></div>

`,hi:`

<p><b>Remote users bhi users hain.</b> Log ghar se kaam karein to woh aapke network aur zones ke bahar hote hain. GlobalProtect har remote device ko firewall tak secure tunnel deta hai aur saath hi firewall ko bata deta hai ki woh kaun hain. Isi liye GlobalProtect User-ID module mein aata hai.</p>

<h3>Analogy: company ki shuttle bus</h3>
<p>Door rehne waale staff company shuttle use karte hain. Bus mein chadhne ke liye woh pehle <b>transport desk</b> (portal) par jaate hain jo naam check karta hai aur batata hai kaunse pick-up points hain aur rules kya hain. Phir woh <b>bus stop</b> (gateway) par chadhte hain jahan driver ticket dobara dekhta hai aur office compound mein le jaata hai. Compound ke andar woh jo bhi karte hain security ko pata hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="GlobalProtect portal aur gateway">
<rect x="20" y="85" width="120" height="60" rx="10" fill="#e2e8f0"/><text x="80" y="112" text-anchor="middle" class="svg-ink" font-size="13">Laptop</text><text x="80" y="130" text-anchor="middle" class="svg-muted" font-size="11">GlobalProtect agent</text>
<rect x="250" y="15" width="140" height="60" rx="10" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Portal</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="11">config aur gateway list</text>
<rect x="250" y="155" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="182" text-anchor="middle" class="svg-ink" font-size="13">Gateway</text><text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="11">tunnel aur policy</text>
<rect x="500" y="85" width="120" height="60" rx="10" fill="#fde68a"/><text x="560" y="112" text-anchor="middle" class="svg-ink" font-size="13">Corporate</text><text x="560" y="130" text-anchor="middle" class="svg-muted" font-size="11">apps aur servers</text>
<line x1="140" y1="100" x2="250" y2="55" stroke="#64748b" stroke-width="2"/><text x="170" y="64" class="svg-accent" font-size="11">1</text>
<line x1="140" y1="130" x2="250" y2="175" stroke="#64748b" stroke-width="2"/><text x="170" y="170" class="svg-accent" font-size="11">2</text>
<line x1="390" y1="185" x2="500" y2="130" stroke="#64748b" stroke-width="2"/><text x="460" y="170" class="svg-accent" font-size="11">3</text>
</svg><p class="cap">1 agent portal se configuration maangta hai, 2 agent gateway tak tunnel banata hai, 3 traffic zone mein aata hai aur policy se check hota hai.</p></div>

<h3>Teen components</h3>
<dl class="terms">
<dt>GlobalProtect agent (app)</dt><dd>Laptop ya phone par software. Yeh connect karta hai, authenticate karta hai, tunnel banata hai aur device state report karta hai.</dd>
<dt>Portal</dt><dd>Management point. Yeh user ko authenticate karta hai, phir <b>agent configuration</b> bhejta hai: kaunse gateways hain, unki priorities, connect method, aur kaunse root certificates par bharosa karna hai.</dd>
<dt>Gateway</dt><dd>Tunnel endpoint. Yeh user ko authenticate karta hai, pool se tunnel IP address assign karta hai, policy enforce karta hai aur user mapping banata hai.</dd>
</dl>
<p>Portal aur gateway dono firewall par configure hote hain (ek hi firewall par ho sakte hain, ya alag). Har ek Layer 3 interface address par sunta hai, aam taur par untrust side par, HTTPS hisse ke liye TCP 443 par.</p>

<h3>Connection ke steps order mein</h3>
<ol>
<li>Agent portal address (FQDN jaise <code>gp.acme.example</code>) se HTTPS par connect karta hai aur user authenticate karta hai.</li>
<li>Portal agent configuration aur gateway list wapas bhejta hai.</li>
<li>Agent gateway chunta hai (priority aur measured response time se) aur uske saath dobara authenticate karta hai, aksar portal ke cookie se chupchaap.</li>
<li>Tunnel banta hai. Preferred transport <b>IPsec</b> hai (ESP, ya UDP port 4501 encapsulation) aur UDP block ho to <b>SSL/TLS</b> TCP 443 par fallback.</li>
<li>Gateway configured pool se <b>tunnel interface</b> ko IP assign karta hai, IP-to-user mapping banata hai, aur traffic VPN zone se policy dwara evaluate hota hai.</li>
</ol>

<h3>External aur internal gateways</h3>
<table class="cmp"><tr><th>Type</th><th>Kahan</th><th>Kis liye</th></tr>
<tr><td>External gateway</td><td>Internet ke saamne</td><td>Remote users ke liye tunnelled access</td></tr>
<tr><td>Internal gateway</td><td>Office network ke andar</td><td>Office users ke liye identity (User-ID) aur device checks, tunnel ke saath ya bina</td></tr>
</table>
<p>Agent <b>internal host detection</b> se decide karta hai ki woh andar hai ya bahar: woh DNS se kisi known internal host address ka naam poochta hai; expected jawab aaye to andar hai aur internal behaviour use karta hai, warna external gateways.</p>

<h3>Connect methods</h3>
<table class="cmp"><tr><th>Method</th><th>Behaviour</th></tr>
<tr><td>User-logon (always on)</td><td>User device mein login kare to apne aap connect hota hai</td></tr>
<tr><td>Pre-logon (always on)</td><td>Login se pehle machine identity se connect hota hai, phir user par switch; mapping pehle pre-logon dikhta hai</td></tr>
<tr><td>On-demand</td><td>User haath se connection shuru karta hai</td></tr>
</table>

<h3>User-ID ke liye yeh kyun zaroori hai</h3>
<p>User seedha gateway par authenticate karta hai, isliye firewall ko identity bina andaze ke pata hoti hai. Yeh mapping tunnel connected rehne tak rehta hai aur user disconnect karte hi khatam. VPN zone ki policy ab office rules ki tarah <code>source-user</code> groups use kar sakti hai, jisse woh gap bharta hai jo server monitoring cover nahi kar sakta.</p>

<div class="eg"><p><b>Worked example.</b> Ek company ke 300 engineers ghar se kaam karte hain. Woh <code>gp.acme.example</code> se connect karte hain, jo ek hi firewall par portal aur gateway tak resolve hota hai. Portal unhe do gateways deta hai: Pune aur Mumbai. Agent tez wala chunta hai. Tunnel ko 10.250.0.0/24 se address milta hai aur VPN zone mein rule hai: source-user engineers, application ssh, build servers tak, allow.</p></div>

<div class="note"><p><b>Sirf reference.</b> Practice. GlobalProtect simulator mein nahi hai, isliye yahan chalane ke liye commands nahi hain. VPN zone ki zone aur rule logic ke liye pan-policy practise karo, aur agent jo trust chain use karta hai use samajhne ke liye sec-crypto ka certificate material.</p></div>

<div class="warn"><p><b>Common mistake.</b> Portal par self-signed ya private-CA certificate lagana bina root distribute kiye. Agent connect hona refuse karta hai, ya users warnings par click karke nikal jaate hain. Aisi CA ka certificate use karo jise clients pehle se trust karte hain, ya enterprise root devices par push karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Portal = authentication, configuration aur gateway list. Gateway = tunnel endpoint, tunnel IP assignment, policy enforcement, user mapping. Preferred tunnel IPsec hai SSL fallback ke saath. Internal host detection internal ya external decide karta hai.</p></div>

<div class="scn"><h4>Sab galat gateway par</h4><p>Doosre shehar mein doosra gateway jodne ke baad bhi north ke users pehle wale se connect karte rahe aur latency ki shikayat ki. Portal configuration mein dono gateways ki priority barabar thi, aur agent response time sirf barabar priority mein naapta hai. Team ne regional priorities set ki, aur users ko paas ka gateway milne laga.</p><p><b>Lesson:</b> Gateway ka choice portal control karta hai. Priority aur regions soch-samajhkar set karo.</p></div>

<div class="iv"><p class="q">"GlobalProtect portal aur gateway samjhao aur connection kaise banta hai."</p><p>Portal user ko authenticate karta hai aur agent configuration deta hai jisme gateways ki list, priorities, connect method aur trusted root CAs hote hain. Agent gateway chunta hai, authenticate karta hai, aur tunnel interface tak IPsec tunnel banata hai, SSL fallback ke saath. Gateway pool se IP assign karta hai, user mapping banata hai, aur traffic VPN zone se evaluate hota hai. External aur internal gateways aur internal host detection ka bhi zikr karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Agent configuration ke liye portal se aur tunnel ke liye gateway se baat karta hai.</li>
<li>Gateway tunnel IP assign karta hai, policy enforce karta hai aur user mapping banata hai.</li>
<li>IPsec preferred hai; TCP 443 par SSL/TLS fallback hai.</li>
<li>External gateways remote users ke liye; internal gateways office ke andar identity ke liye.</li>
<li>Connect methods: user-logon, pre-logon, on-demand.</li>
</ul></div>

`}};export{e as default};