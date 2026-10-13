var e={id:`three-connection-types`,h:{en:`Mobile users, remote networks and service connections`,hi:`Mobile users, remote networks aur service connections`},body:{en:`
<p>Everything you will configure in Prisma Access falls into one of three buckets. Learn these three names perfectly; the exam and every real project use them daily.</p>

<h3>Analogy: a railway hub</h3>
<p>Think of Prisma Access as a big railway hub station. <b>Mobile users</b> are individual passengers who walk in from the street. <b>Remote networks</b> are whole trains arriving from branch towns, full of passengers. <b>Service connections</b> are the dedicated platform to the company's own city, the head office or data center, where the private applications live.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Three connection types">
<rect x="20" y="20" width="130" height="44" rx="6" fill="#bae6fd"/><text x="85" y="40" text-anchor="middle" class="svg-ink" font-size="12">Mobile user</text><text x="85" y="56" text-anchor="middle" class="svg-muted" font-size="11">GlobalProtect app</text>
<rect x="20" y="100" width="130" height="44" rx="6" fill="#bae6fd"/><text x="85" y="120" text-anchor="middle" class="svg-ink" font-size="12">Remote network</text><text x="85" y="136" text-anchor="middle" class="svg-muted" font-size="11">branch, IPsec</text>
<ellipse cx="320" cy="100" rx="110" ry="70" fill="#ddd6fe"/><text x="320" y="96" text-anchor="middle" class="svg-ink" font-size="14">Prisma Access</text><text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="11">gateways and backbone</text>
<rect x="490" y="20" width="130" height="44" rx="6" fill="#bbf7d0"/><text x="555" y="40" text-anchor="middle" class="svg-ink" font-size="12">Service connection</text><text x="555" y="56" text-anchor="middle" class="svg-muted" font-size="11">to HQ, IPsec</text>
<rect x="490" y="100" width="130" height="44" rx="6" fill="#fed7aa"/><text x="555" y="120" text-anchor="middle" class="svg-ink" font-size="12">Internet and SaaS</text>
<line x1="150" y1="42" x2="235" y2="75" stroke="#64748b"/><line x1="150" y1="122" x2="215" y2="115" stroke="#64748b"/><line x1="405" y1="75" x2="490" y2="42" stroke="#64748b"/><line x1="425" y1="115" x2="490" y2="122" stroke="#64748b"/>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">Users and branches come in; HQ is reached through a service connection</text>
</svg><p class="cap">The three building blocks and the internet exit.</p></div>

<h3>Mobile users</h3>
<p>Mobile users are people who are away from the office. They are protected in one of two ways. The main way is the <b>GlobalProtect app</b> (Windows, macOS, iOS, Android, Chrome OS, Linux) which builds a tunnel to a Prisma Access gateway. Clientless VPN also exists for browser-only access. The second mobile-user type is <b>Explicit Proxy</b>, where browser traffic is sent to Prisma Access using a PAC file and no tunnel; you will meet it as a concept in the pa-mobile module. Each connected device gets an address from a <b>client IP pool</b>, in our lab 10.200.0.0/23.</p>

<h3>Remote networks</h3>
<p>A remote network is a branch or office site. A firewall or router at the site builds an <b>IPsec tunnel</b> to Prisma Access, and the two sides exchange routes either by static routes, by BGP, or by both. Users inside the branch need no client software, because the whole site is protected by the tunnel. The documentation states that all remote network locations are fully meshed, so one branch can reach another through Prisma Access. In our lab the branch firewall BR-FW at 198.51.100.10 serves the LAN 10.20.0.0/24. You build this in the pa-remote module.</p>

<h3>Service connections</h3>
<p>A service connection is an IPsec tunnel from Prisma Access to your head office or data center, sometimes called a Corporate Access Node. It exists so that cloud users can reach <b>private applications</b> and authentication servers inside your network. The documentation also explains that mobile users reach remote networks through a service connection, a hub and spoke design. In our lab HQ-FW at 192.0.2.10 terminates the service connection and the app and DNS server sits at 10.10.0.50 and 10.10.0.53. You build this in the pa-service module.</p>
<div class="warn"><p><b>Common mistake.</b> Confusing a remote network with a service connection. Both are IPsec tunnels, but a remote network brings <i>users</i> into Prisma Access from a site, while a service connection takes Prisma Access users <i>out</i> to your private resources. A data center is normally a service connection, a branch with users is normally a remote network.</p></div>

<table class="cmp"><tr><th>Item</th><th>Mobile users</th><th>Remote networks</th><th>Service connections</th></tr>
<tr><td>What connects</td><td>Individual devices</td><td>Whole branch LAN</td><td>HQ or data center</td></tr>
<tr><td>Method</td><td>GlobalProtect tunnel, or proxy</td><td>IPsec, static or BGP</td><td>IPsec, static or BGP</td></tr>
<tr><td>Addressing</td><td>Client IP pool</td><td>Branch subnets</td><td>HQ subnets</td></tr>
<tr><td>Lab example</td><td>10.200.0.0/23</td><td>10.20.0.0/24</td><td>10.10.0.0/24</td></tr>
</table>

<div class="eg"><p><b>Worked example: follow one packet.</b> The home laptop 203.0.113.50 is connected through GlobalProtect and holds the pool address 10.200.0.7. The user opens the internal app 10.10.0.50. The packet enters the tunnel to the portal and gateway at 203.0.113.100, is checked against the security policy, then Prisma Access sends it toward the HQ service connection. HQ-FW delivers it to 10.10.0.50. The reply must come back the same way, which requires HQ to know a route to 10.200.0.0/23 through the service connection. That return route is one of the most common causes of "connected but nothing works".</p></div>

<h3>Where the logs go</h3>
<p>Whichever tool you use to manage the service, Prisma Access logs are stored in the <b>Strata Logging Service</b>, a central cloud log store. In the lab this is concept only.</p>
<div class="exam"><p><b>Exam trap.</b> At least one service connection must exist before mobile user gateways can reach the corporate side. The documentation allows placeholder values for the first setup, so you can configure GlobalProtect before the real HQ tunnel is ready.</p></div>

<div class="scn"><h4>Branch users were treated like travellers</h4><p>A junior engineer onboarded a small branch by installing the GlobalProtect app on all 18 PCs, because "that is how Prisma Access works". It functioned but each PC held a pool address, the printer could not be reached, and licences were consumed per user. The senior engineer replaced it with one IPsec tunnel from the branch firewall as a remote network. The printer worked, and the 18 PCs no longer needed the client.</p><p><b>Lesson:</b> use mobile users for roaming people, and a remote network for fixed sites.</p></div>

<div class="iv"><p class="q">"Explain the difference between a remote network and a service connection."</p><p>Strong answer: both are IPsec tunnels into Prisma Access. A remote network connects a branch site so its users and devices are protected without a client. A service connection connects the corporate data center or HQ so cloud users and branches can reach private applications and authentication servers. Mention that mobile users reach remote networks through a service connection in the documented hub and spoke design.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three buckets: mobile users, remote networks, service connections.</li>
<li>Mobile users use GlobalProtect (tunnel) or Explicit Proxy (PAC file, no tunnel).</li>
<li>Remote networks are branch sites by IPsec, with static routes, BGP or both.</li>
<li>Service connections take you to HQ or data center resources; one must exist for GlobalProtect.</li>
<li>All logs go to the Strata Logging Service.</li>
</ul></div>
`,hi:`
<p>Prisma Access mein aap jo bhi configure karoge woh teen buckets mein se kisi ek mein aata hai. Yeh teen naam bilkul pakke kar lo; exam aur har real project mein roz use hote hain.</p>

<h3>Analogy: railway hub</h3>
<p>Prisma Access ko ek bade railway hub station ki tarah socho. <b>Mobile users</b> woh passengers hain jo gali se akele andar aate hain. <b>Remote networks</b> poori trains hain jo branch towns se passengers se bhar kar aati hain. <b>Service connections</b> company ke apne shehar, yaani head office ya data center, tak ka dedicated platform hain, jahan private applications rehti hain.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Teen connection types">
<rect x="20" y="20" width="130" height="44" rx="6" fill="#bae6fd"/><text x="85" y="40" text-anchor="middle" class="svg-ink" font-size="12">Mobile user</text><text x="85" y="56" text-anchor="middle" class="svg-muted" font-size="11">GlobalProtect app</text>
<rect x="20" y="100" width="130" height="44" rx="6" fill="#bae6fd"/><text x="85" y="120" text-anchor="middle" class="svg-ink" font-size="12">Remote network</text><text x="85" y="136" text-anchor="middle" class="svg-muted" font-size="11">branch, IPsec</text>
<ellipse cx="320" cy="100" rx="110" ry="70" fill="#ddd6fe"/><text x="320" y="96" text-anchor="middle" class="svg-ink" font-size="14">Prisma Access</text><text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="11">gateways aur backbone</text>
<rect x="490" y="20" width="130" height="44" rx="6" fill="#bbf7d0"/><text x="555" y="40" text-anchor="middle" class="svg-ink" font-size="12">Service connection</text><text x="555" y="56" text-anchor="middle" class="svg-muted" font-size="11">to HQ, IPsec</text>
<rect x="490" y="100" width="130" height="44" rx="6" fill="#fed7aa"/><text x="555" y="120" text-anchor="middle" class="svg-ink" font-size="12">Internet aur SaaS</text>
<line x1="150" y1="42" x2="235" y2="75" stroke="#64748b"/><line x1="150" y1="122" x2="215" y2="115" stroke="#64748b"/><line x1="405" y1="75" x2="490" y2="42" stroke="#64748b"/><line x1="425" y1="115" x2="490" y2="122" stroke="#64748b"/>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">Users aur branches andar aate hain; HQ service connection se milta hai</text>
</svg><p class="cap">Teen building blocks aur internet exit.</p></div>

<h3>Mobile users</h3>
<p>Mobile users woh log hain jo office se bahar hain. Inhe do tareeke se protect kiya jaata hai. Main tareeka <b>GlobalProtect app</b> hai (Windows, macOS, iOS, Android, Chrome OS, Linux) jo Prisma Access gateway tak tunnel banata hai. Browser-only access ke liye Clientless VPN bhi hai. Doosra mobile-user type <b>Explicit Proxy</b> hai, jismein browser traffic PAC file se Prisma Access ko bheja jaata hai aur koi tunnel nahi hota; pa-mobile module mein ise concept ke roop mein dekhoge. Har connected device ko <b>client IP pool</b> se address milta hai, hamare lab mein 10.200.0.0/23.</p>

<h3>Remote networks</h3>
<p>Remote network ek branch ya office site hai. Site par firewall ya router Prisma Access tak ek <b>IPsec tunnel</b> banata hai, aur dono taraf static routes, BGP, ya dono se routes exchange hote hain. Branch ke andar ke users ko koi client software nahi chahiye, kyunki poori site tunnel se protected hai. Documentation kehti hai ki saare remote network locations fully meshed hain, isliye ek branch Prisma Access ke through doosri branch tak pahunch sakti hai. Hamare lab mein branch firewall BR-FW 198.51.100.10 par hai aur LAN 10.20.0.0/24 serve karta hai. Ise pa-remote module mein banaoge.</p>

<h3>Service connections</h3>
<p>Service connection Prisma Access se aapke head office ya data center tak IPsec tunnel hai, jise kabhi Corporate Access Node bhi kehte hain. Yeh isliye hai ki cloud users aapke network ke andar ki <b>private applications</b> aur authentication servers tak pahunch saken. Documentation yeh bhi batati hai ki mobile users remote networks tak service connection ke through pahunchte hain, yaani hub and spoke design. Hamare lab mein HQ-FW 192.0.2.10 service connection terminate karta hai aur app aur DNS server 10.10.0.50 aur 10.10.0.53 par hai. Ise pa-service module mein banaoge.</p>
<div class="warn"><p><b>Common galti.</b> Remote network aur service connection ko confuse karna. Dono IPsec tunnels hain, lekin remote network site se <i>users</i> ko Prisma Access mein laata hai, jabki service connection Prisma Access ke users ko aapke private resources tak <i>bahar</i> le jaata hai. Data center aam taur par service connection hota hai, users wali branch remote network.</p></div>

<table class="cmp"><tr><th>Item</th><th>Mobile users</th><th>Remote networks</th><th>Service connections</th></tr>
<tr><td>Kya jud raha hai</td><td>Individual devices</td><td>Poori branch LAN</td><td>HQ ya data center</td></tr>
<tr><td>Method</td><td>GlobalProtect tunnel, ya proxy</td><td>IPsec, static ya BGP</td><td>IPsec, static ya BGP</td></tr>
<tr><td>Addressing</td><td>Client IP pool</td><td>Branch subnets</td><td>HQ subnets</td></tr>
<tr><td>Lab example</td><td>10.200.0.0/23</td><td>10.20.0.0/24</td><td>10.10.0.0/24</td></tr>
</table>

<div class="eg"><p><b>Worked example: ek packet follow karo.</b> Home laptop 203.0.113.50 GlobalProtect se connected hai aur pool address 10.200.0.7 hold karta hai. User internal app 10.10.0.50 kholta hai. Packet 203.0.113.100 par portal aur gateway tak tunnel mein jaata hai, security policy se check hota hai, phir Prisma Access use HQ service connection ki taraf bhejta hai. HQ-FW use 10.10.0.50 tak deliver karta hai. Reply ko usi raaste wapas aana hai, jiske liye HQ ko service connection ke through 10.200.0.0/23 ka route pata hona chahiye. "Connected hai lekin kuch kaam nahi karta" ka sabse common reason yahi return route hai.</p></div>

<h3>Logs kahan jaate hain</h3>
<p>Aap kisi bhi tool se manage karo, Prisma Access logs <b>Strata Logging Service</b> mein store hote hain, jo ek central cloud log store hai. Lab mein yeh sirf concept hai.</p>
<div class="exam"><p><b>Exam trap.</b> Mobile user gateways corporate side tak pahunch saken, uske liye kam se kam ek service connection hona chahiye. Documentation pehle setup ke liye placeholder values allow karti hai, isliye real HQ tunnel ready hone se pehle bhi GlobalProtect configure kar sakte ho.</p></div>

<div class="scn"><h4>Branch users ko travellers ki tarah treat kiya</h4><p>Ek junior engineer ne chhoti branch onboard karte waqt saare 18 PCs par GlobalProtect app install kar di, kyunki "Prisma Access aise hi chalta hai". Kaam chala lekin har PC ke paas pool address tha, printer reach nahi ho raha tha, aur licences per user consume ho rahe the. Senior engineer ne ise branch firewall se ek IPsec tunnel, yaani remote network, se replace kiya. Printer chalne laga, aur 18 PCs ko client ki zaroorat nahi rahi.</p><p><b>Seekh:</b> roaming logon ke liye mobile users, fixed sites ke liye remote network.</p></div>

<div class="iv"><p class="q">"Remote network aur service connection ka farak samjhao."</p><p>Strong answer: dono Prisma Access mein IPsec tunnels hain. Remote network branch site ko jodta hai taaki uske users aur devices bina client ke protected rahein. Service connection corporate data center ya HQ ko jodta hai taaki cloud users aur branches private applications aur authentication servers tak pahunch saken. Bolo ki documented hub and spoke design mein mobile users remote networks tak service connection ke through pahunchte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen buckets: mobile users, remote networks, service connections.</li>
<li>Mobile users GlobalProtect (tunnel) ya Explicit Proxy (PAC file, tunnel nahi) use karte hain.</li>
<li>Remote networks IPsec se jude branch sites hain, static routes, BGP ya dono ke saath.</li>
<li>Service connections HQ ya data center resources tak le jaate hain; GlobalProtect ke liye ek hona zaroori hai.</li>
<li>Saare logs Strata Logging Service mein jaate hain.</li>
</ul></div>
`}};export{e as default};