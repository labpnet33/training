var e={id:`dns-security-sig`,h:{en:`DNS security with Umbrella and SIG tunnels`,hi:`Umbrella se DNS security aur SIG tunnels`},body:{en:`
<p>Nearly every attack and every web visit starts with a DNS question: "what is the address of this name?". If you control DNS, you can stop many threats before a connection even starts. When a branch uses DIA and you do not want to run a full security stack at every site, you can also send traffic to a cloud security service. Catalyst SD-WAN supports both ideas: <b>DNS-layer security with Cisco Umbrella</b> and <b>Secure Internet Gateway (SIG) tunnels</b>.</p>

<h3>Analogy: a phone directory and a security checkpoint in the cloud</h3>
<p>DNS is the phone directory. A security-aware directory refuses to give out the number of a known scam shop, so the call never happens. That is DNS security. A SIG is different: it is a staffed checkpoint in a nearby city. Instead of inspecting every visitor in every branch, you send them all through one well-equipped checkpoint on the way out. That is a cloud security gateway.</p>

<h3>DNS security with Umbrella</h3>
<p>Cisco Umbrella is a cloud DNS resolver with threat intelligence. The WAN Edge intercepts DNS queries from the chosen VPNs and redirects them to Umbrella. Umbrella checks the name against its categories and threat data. If the name is bad, it returns a block page address instead of the real one. If the name is safe, it returns the real answer and the client connects normally.</p>
<ol>
<li><b>Register</b> the edges with Umbrella: in Manager, add your Umbrella credentials (API key or organization details) so each edge registers and receives a device identity.</li>
<li><b>Build a DNS security policy</b> in Manager's security configuration: choose the VPNs to cover, the Umbrella registration, and options.</li>
<li><b>Choose DNSCrypt</b> so the queries to Umbrella are encrypted and protected from tampering on the way.</li>
<li><b>Add a local domain bypass list</b> (up to 64 domains) for internal names such as <code>corp.bharat-retail.example</code>, so those queries go to the internal resolver and never leave the company.</li>
<li><b>Apply</b> the policy to the branch devices and test.</li>
</ol>
<p>The policy in Umbrella itself (which categories to block per VPN or per site) is managed in the Umbrella console, so security teams can tune it without touching the routers.</p>

<h3>Limitations to know</h3>
<ul>
<li>It protects <b>DNS</b>. A connection by raw IP address, or a client that uses its own encrypted DNS service, does not use the edge's resolver and avoids the check.</li>
<li>It sees the name, not the content: it does not replace the firewall or IPS.</li>
<li>Internal zones must be in the bypass list; otherwise internal names break.</li>
<li>The edge needs a working path to Umbrella, and a fallback if the cloud is unreachable.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="DNS redirection to Umbrella and SIG tunnel path">
<rect x="10" y="80" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="108" text-anchor="middle" class="svg-ink" font-size="13">GUEST-PC</text><text x="65" y="126" text-anchor="middle" class="svg-muted" font-size="11">VPN 20</text>
<rect x="170" y="70" width="120" height="80" rx="10" fill="#fde68a"/><text x="230" y="105" text-anchor="middle" class="svg-ink" font-size="14">E-BR1</text><text x="230" y="125" text-anchor="middle" class="svg-muted" font-size="11">DNS redirect, SIG</text>
<rect x="400" y="15" width="220" height="55" rx="8" fill="#ddd6fe"/><text x="510" y="40" text-anchor="middle" class="svg-ink" font-size="13">Umbrella DNS resolver</text><text x="510" y="58" text-anchor="middle" class="svg-muted" font-size="11">DNSCrypt, block bad names</text>
<rect x="400" y="140" width="220" height="60" rx="8" fill="#bbf7d0"/><text x="510" y="165" text-anchor="middle" class="svg-ink" font-size="13">SIG in the cloud</text><text x="510" y="183" text-anchor="middle" class="svg-muted" font-size="11">IPsec or GRE tunnel, inspects traffic</text>
<line x1="120" y1="110" x2="170" y2="110" stroke="#64748b" stroke-width="2"/><line x1="290" y1="90" x2="400" y2="45" stroke="#7c3aed" stroke-width="3"/><line x1="290" y1="130" x2="400" y2="170" stroke="#16a34a" stroke-width="3"/>
<text x="350" y="212" text-anchor="middle" class="svg-accent" font-size="12">DNS goes to Umbrella; web traffic can go through a SIG tunnel</text>
</svg><p class="cap">DNS security and SIG complement each other. One checks names, the other inspects the traffic itself.</p></div>

<h3>SIG tunnels</h3>
<p>A <b>Secure Internet Gateway</b> is a cloud service that inspects outbound internet traffic (firewall, URL filtering, malware, and for some providers data loss prevention). The WAN Edge builds <b>IPsec or GRE tunnels</b> to the provider. SD-WAN Manager can automate it for Cisco Umbrella SIG and for supported third-party providers such as Zscaler, creating the tunnels and handling credentials through the SIG feature in the security configuration. Key design points:</p>
<ul>
<li><b>Redundancy.</b> Build an <b>active and a backup tunnel</b> to different provider data centers, so one failure does not cut internet access. Each tunnel is monitored by keepalives or a tracker.</li>
<li><b>Steering.</b> Traffic is sent to the SIG with a <b>service route</b> (a default route for the VPN that points to the SIG tunnels) or with a <b>data policy</b> that matches selected traffic. With a policy you can send only guests and unmanaged traffic, or only risky categories, and let trusted SaaS break out locally.</li>
<li><b>Bandwidth and limits.</b> Each tunnel and each provider has throughput and tunnel-count limits; check your release notes and provider documentation before you design for 1 Gbps branches.</li>
<li><b>Source address.</b> Providers see the tunnel; use the identity options they offer so policies can still identify users and sites.</li>
</ul>
<table class="cmp"><tr><th>Need</th><th>Pick</th></tr>
<tr><td>Cheap, light protection for guests</td><td>DNS security</td></tr>
<tr><td>Full inspection without hardware at each branch</td><td>SIG tunnels</td></tr>
<tr><td>Local inspection, no cloud dependency, enough hardware</td><td>Zone firewall plus UTD on the edge</td></tr>
<tr><td>Both speed and safety for trusted SaaS</td><td>Policy: SaaS breakout locally, rest to SIG</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Pune's guest VPN 20 uses Umbrella: E-BR1 redirects DNS to Umbrella with DNSCrypt, and a bypass entry keeps <code>corp.bharat-retail.example</code> internal. The Nashik kiosk router cannot run UTD, so it builds an active and a backup IPsec tunnel to the SIG and uses a service route for VPN 10. Staff at Pune continue through the DC firewall.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Forgetting the local-domain bypass so internal names fail. (2) A single SIG tunnel with no backup. (3) Believing DNS security stops all threats. (4) Sending all traffic to the SIG, including real-time voice, without testing latency. (5) Allowing clients to use their own DNS, bypassing Umbrella.</p></div>

<div class="exam"><p><b>Exam trap.</b> Umbrella DNS security redirects DNS (supports DNSCrypt, local domain bypass up to 64 entries). SIG is a tunnel-based cloud inspection service using IPsec or GRE. They are different tools; DNS security does not inspect content.</p></div>

<div class="scn"><h4>Internal portal fails only at branches with DNS security</h4><p>After enabling Umbrella, users at Pune could not reach <code>portal.corp.bharat-retail.example</code>. Umbrella could not resolve the internal name. The fix was to add the internal domain to the local domain bypass list so the edge sends it to the internal resolver.</p><p><b>Lesson:</b> DNS security needs a list of what stays internal.</p></div>

<div class="iv"><p class="q">"Compare DNS security and SIG in Catalyst SD-WAN."</p><p>DNS security with Umbrella redirects the VPN's DNS queries to the Umbrella resolver, optionally with DNSCrypt, and blocks bad names; a local domain bypass list keeps internal names internal. SIG tunnels (IPsec or GRE, active and backup) send the actual traffic to a cloud service that inspects it, steered by a service route or a data policy. DNS security is light and name-based; SIG gives full inspection but adds a cloud dependency.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Umbrella DNS security redirects DNS, supports DNSCrypt and a local domain bypass list.</li>
<li>It checks names only; it does not replace a firewall or IPS.</li>
<li>SIG = IPsec or GRE tunnels to a cloud security gateway, with active and backup tunnels.</li>
<li>Steer with a service route or a data policy; keep trusted SaaS local if needed.</li>
<li>Combine layers: DNS security, firewall and SIG or UTD.</li>
</ul></div>
`,hi:`
<p>Lagbhag har attack aur har web visit ek DNS sawaal se shuru hota hai: "is naam ka address kya hai?". Agar DNS tumhare control mein ho to kai threats connection shuru hone se pehle hi rok sakte ho. Jab branch DIA use kare aur tum har site par poora security stack nahi chalana chahte, to traffic ko cloud security service ko bhi bhej sakte ho. Catalyst SD-WAN dono ideas support karta hai: <b>Cisco Umbrella ke saath DNS-layer security</b> aur <b>Secure Internet Gateway (SIG) tunnels</b>.</p>

<h3>Analogy: phone directory aur cloud mein security checkpoint</h3>
<p>DNS phone directory hai. Security-aware directory kisi jaane-pehchane scam shop ka number dene se mana kar deta hai, isliye call hoti hi nahi. Yeh DNS security hai. SIG alag hai: yeh ek nazdeeki sheher mein staffed checkpoint hai. Har branch mein har visitor inspect karne ke bajaye tum sabko nikalte waqt ek achchi tarah se susajjit checkpoint se guzarte ho. Yeh cloud security gateway hai.</p>

<h3>Umbrella se DNS security</h3>
<p>Cisco Umbrella threat intelligence wala cloud DNS resolver hai. WAN Edge chune hue VPNs ke DNS queries intercept karke Umbrella ko redirect karta hai. Umbrella naam ko apni categories aur threat data se check karta hai. Naam bura ho to asli address ke bajaye block page ka address lautata hai. Naam safe ho to asli jawab deta hai aur client normally connect hota hai.</p>
<ol>
<li>Edges ko Umbrella mein <b>register</b> karo: Manager mein Umbrella credentials (API key ya organization details) jodo taaki har edge register ho aur device identity paaye.</li>
<li>Manager ki security configuration mein <b>DNS security policy banao</b>: cover karne wale VPNs, Umbrella registration aur options chuno.</li>
<li><b>DNSCrypt chuno</b> taaki Umbrella ke queries encrypted rahein aur raste mein tampering se bachein.</li>
<li><code>corp.bharat-retail.example</code> jaise internal names ke liye <b>local domain bypass list</b> (zyada se zyada 64 domains) jodo, taaki yeh queries internal resolver ko jaayein aur company se bahar kabhi na jaayein.</li>
<li>Policy branch devices par <b>apply</b> karo aur test karo.</li>
</ol>
<p>Umbrella ki apni policy (kaunsi categories per VPN ya per site block hon) Umbrella console mein manage hoti hai, isliye security teams routers ko chhoone ke bina tune kar sakti hain.</p>

<h3>Jaanne layak limitations</h3>
<ul>
<li>Yeh <b>DNS</b> ko protect karta hai. Raw IP address se connection, ya woh client jo apni encrypted DNS service use kare, edge ke resolver ko use nahi karta aur check se bach jaata hai.</li>
<li>Yeh naam dekhta hai, content nahi: firewall ya IPS ki jagah nahi leta.</li>
<li>Internal zones bypass list mein honi chahiye; warna internal names tootenge.</li>
<li>Edge ko Umbrella tak kaam karta path chahiye, aur cloud unreachable hone par fallback.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Umbrella tak DNS redirection aur SIG tunnel path">
<rect x="10" y="80" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="108" text-anchor="middle" class="svg-ink" font-size="13">GUEST-PC</text><text x="65" y="126" text-anchor="middle" class="svg-muted" font-size="11">VPN 20</text>
<rect x="170" y="70" width="120" height="80" rx="10" fill="#fde68a"/><text x="230" y="105" text-anchor="middle" class="svg-ink" font-size="14">E-BR1</text><text x="230" y="125" text-anchor="middle" class="svg-muted" font-size="11">DNS redirect, SIG</text>
<rect x="400" y="15" width="220" height="55" rx="8" fill="#ddd6fe"/><text x="510" y="40" text-anchor="middle" class="svg-ink" font-size="13">Umbrella DNS resolver</text><text x="510" y="58" text-anchor="middle" class="svg-muted" font-size="11">DNSCrypt, bure naam block</text>
<rect x="400" y="140" width="220" height="60" rx="8" fill="#bbf7d0"/><text x="510" y="165" text-anchor="middle" class="svg-ink" font-size="13">Cloud mein SIG</text><text x="510" y="183" text-anchor="middle" class="svg-muted" font-size="11">IPsec ya GRE tunnel, traffic inspect</text>
<line x1="120" y1="110" x2="170" y2="110" stroke="#64748b" stroke-width="2"/><line x1="290" y1="90" x2="400" y2="45" stroke="#7c3aed" stroke-width="3"/><line x1="290" y1="130" x2="400" y2="170" stroke="#16a34a" stroke-width="3"/>
<text x="350" y="212" text-anchor="middle" class="svg-accent" font-size="12">DNS Umbrella ko jaata hai; web traffic SIG tunnel se ja sakta hai</text>
</svg><p class="cap">DNS security aur SIG ek doosre ke complement hain. Ek naam check karta hai, doosra traffic ko inspect.</p></div>

<h3>SIG tunnels</h3>
<p><b>Secure Internet Gateway</b> cloud service hai jo outbound internet traffic inspect karti hai (firewall, URL filtering, malware, aur kuch providers ke liye data loss prevention). WAN Edge provider tak <b>IPsec ya GRE tunnels</b> banata hai. SD-WAN Manager ise Cisco Umbrella SIG aur Zscaler jaise supported third-party providers ke liye automate kar sakta hai, security configuration ke SIG feature se tunnels banakar aur credentials handle karke. Design ke mukhya points:</p>
<ul>
<li><b>Redundancy.</b> Alag provider data centers tak <b>active aur backup tunnel</b> banao, taaki ek failure internet access na kaate. Har tunnel keepalives ya tracker se monitor hota hai.</li>
<li><b>Steering.</b> Traffic SIG ko <b>service route</b> (VPN ka default route jo SIG tunnels ko point kare) ya chune traffic ko match karne wali <b>data policy</b> se bheja jaata hai. Policy se sirf guests aur unmanaged traffic, ya sirf risky categories bhej sakte ho, aur trusted SaaS ko locally breakout karne de sakte ho.</li>
<li><b>Bandwidth aur limits.</b> Har tunnel aur har provider ki throughput aur tunnel-count limits hoti hain; 1 Gbps branches ke liye design karne se pehle release notes aur provider documentation check karo.</li>
<li><b>Source address.</b> Providers tunnel dekhte hain; unke diye identity options use karo taaki policies ab bhi users aur sites ko pehchaan sakein.</li>
</ul>
<table class="cmp"><tr><th>Zaroorat</th><th>Chuno</th></tr>
<tr><td>Guests ke liye saste, halke protection</td><td>DNS security</td></tr>
<tr><td>Har branch par hardware ke bina poori inspection</td><td>SIG tunnels</td></tr>
<tr><td>Local inspection, cloud dependency nahi, kaafi hardware</td><td>Edge par zone firewall plus UTD</td></tr>
<tr><td>Trusted SaaS ke liye speed aur safety dono</td><td>Policy: SaaS locally breakout, baaki SIG ko</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Pune ka guest VPN 20 Umbrella use karta hai: E-BR1 DNSCrypt ke saath DNS Umbrella ko redirect karta hai, aur ek bypass entry <code>corp.bharat-retail.example</code> ko internal rakhti hai. Nashik kiosk router UTD nahi chala sakta, isliye woh SIG tak active aur backup IPsec tunnel banata hai aur VPN 10 ke liye service route use karta hai. Pune ka staff DC firewall se jaata rehta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Local-domain bypass bhool jaana, isliye internal names fail. (2) Backup ke bina ek hi SIG tunnel. (3) Maan lena ki DNS security saare threats rokta hai. (4) Real-time voice samet saara traffic latency test kiye bina SIG ko bhejna. (5) Clients ko apna DNS use karne dena, jo Umbrella ko bypass karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Umbrella DNS security DNS redirect karta hai (DNSCrypt, 64 entries tak local domain bypass support). SIG IPsec ya GRE use karne wali tunnel-based cloud inspection service hai. Yeh alag tools hain; DNS security content inspect nahi karta.</p></div>

<div class="scn"><h4>Internal portal sirf DNS security wali branches par fail</h4><p>Umbrella enable karne ke baad Pune ke users <code>portal.corp.bharat-retail.example</code> tak nahi pahunch paaye. Umbrella internal naam resolve nahi kar saka. Fix: internal domain ko local domain bypass list mein jodna taaki edge use internal resolver ko bheje.</p><p><b>Lesson:</b> DNS security ko us list ki zaroorat hai jo internal rehta hai.</p></div>

<div class="iv"><p class="q">"Catalyst SD-WAN mein DNS security aur SIG compare karo."</p><p>Umbrella ke saath DNS security VPN ke DNS queries Umbrella resolver ko redirect karta hai, optionally DNSCrypt ke saath, aur bure naam block karta hai; local domain bypass list internal names ko internal rakhti hai. SIG tunnels (IPsec ya GRE, active aur backup) asli traffic cloud service ko bhejte hain jo use inspect karti hai, service route ya data policy se steer hokar. DNS security halka aur name-based hai; SIG poori inspection deta hai lekin cloud dependency jodta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Umbrella DNS security DNS redirect karta hai, DNSCrypt aur local domain bypass list support karta hai.</li>
<li>Yeh sirf naam check karta hai; firewall ya IPS ki jagah nahi leta.</li>
<li>SIG = cloud security gateway tak IPsec ya GRE tunnels, active aur backup ke saath.</li>
<li>Service route ya data policy se steer karo; zaroorat ho to trusted SaaS local rakho.</li>
<li>Layers jodo: DNS security, firewall aur SIG ya UTD.</li>
</ul></div>
`}};export{e as default};