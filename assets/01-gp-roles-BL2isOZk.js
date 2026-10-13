var e={id:`gp-roles`,h:{en:`GlobalProtect on Prisma Access: portal, gateway and the big picture`,hi:`Prisma Access par GlobalProtect: portal, gateway aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how a person on a laptop outside the office is connected and protected by Prisma Access. You will study the two GlobalProtect roles (portal and gateway), the default and company portal domains, the three authentication methods (local, SAML, certificate), client IP pools and their sizing rules, how the app selects a location, DNS rules for internal and public names, app settings and connect methods, split tunnel, the HIP and Explicit Proxy concepts, and a workflow for the three classic failures: authentication, pool and location. Then you practise three labs: <b>pa-mobile-1</b> (first GlobalProtect deployment), <b>pa-mobile-2</b> (DNS and split tunnel) and <b>pa-mobile-3</b> (a ticket where a user cannot connect).</p>
<p><b>Prerequisites.</b> The pa-start module: three connection types, the infrastructure subnet 10.255.0.0/24, commit and push, and zones. You also need the idea of a VPN client and of DNS.</p>

<h3>Analogy: a hotel with a front desk and room corridors</h3>
<p>When you arrive at a hotel, the <b>front desk</b> checks who you are and gives you a key card and your room number. Then you go along a <b>corridor</b> to your room. In GlobalProtect the front desk is the <b>portal</b> and the corridor is the <b>gateway</b>. The portal authenticates you and tells the app its settings and the list of gateways. The gateway builds the tunnel, gives you an address and applies security.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Portal and gateway steps">
<rect x="20" y="70" width="130" height="60" rx="8" fill="#bae6fd"/><text x="85" y="96" text-anchor="middle" class="svg-ink" font-size="12">LAPTOP-HOME</text><text x="85" y="114" text-anchor="middle" class="svg-muted" font-size="11">203.0.113.50</text>
<rect x="260" y="20" width="150" height="60" rx="8" fill="#ddd6fe"/><text x="335" y="46" text-anchor="middle" class="svg-ink" font-size="12">Portal</text><text x="335" y="64" text-anchor="middle" class="svg-muted" font-size="11">gp.nkprisma.example</text>
<rect x="260" y="120" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="335" y="146" text-anchor="middle" class="svg-ink" font-size="12">Gateway</text><text x="335" y="164" text-anchor="middle" class="svg-muted" font-size="11">tunnel, pool address</text>
<rect x="500" y="70" width="130" height="60" rx="8" fill="#fde68a"/><text x="565" y="96" text-anchor="middle" class="svg-ink" font-size="12">HQ app</text><text x="565" y="114" text-anchor="middle" class="svg-muted" font-size="11">10.10.0.50</text>
<line x1="150" y1="90" x2="260" y2="55" stroke="#64748b"/><line x1="150" y1="110" x2="260" y2="150" stroke="#64748b"/><line x1="410" y1="150" x2="500" y2="110" stroke="#64748b"/>
<text x="195" y="60" class="svg-muted" font-size="11">1 login, config</text><text x="195" y="150" class="svg-muted" font-size="11">2 tunnel</text><text x="430" y="150" class="svg-muted" font-size="11">3 via service conn.</text>
</svg><p class="cap">The app talks to the portal first, then builds a tunnel to a gateway, then reaches HQ through the service connection.</p></div>

<h3>Who runs what</h3>
<p>In Prisma Access, the vendor <b>hosts the GlobalProtect portal and the gateways for you</b>. You do not build servers or certificates for gateways. You configure the settings: how the portal is named, how users authenticate, which client IP pool is used, which locations are enabled, what DNS the clients use, and what the app does. The app is available for Windows, macOS, iOS, Android, Chrome OS and Linux. It can be downloaded from the Prisma Access portal (macOS and Windows) or from app stores.</p>
<p>A prerequisite: gateways reach the corporate side through a service connection. At least one service connection must exist, and placeholder values are allowed for a first setup.</p>

<h3>The settings map</h3>
<table class="cmp"><tr><th>Topic</th><th>SCM path</th><th>Panorama path</th></tr>
<tr><td>Entry</td><td>Configuration &gt; NGFW and Prisma Access &gt; Configuration Scope &gt; Prisma Access &gt; Mobile Users</td><td>Panorama &gt; Cloud Services &gt; Configuration &gt; Mobile Users - GlobalProtect</td></tr>
<tr><td>Portal, DNS, pool</td><td>GlobalProtect &gt; Infrastructure</td><td>Onboarding &gt; Configure &gt; General, IP Pools, Network Services tabs</td></tr>
<tr><td>Locations</td><td>Infrastructure &gt; Prisma Access Locations</td><td>Locations tab</td></tr>
<tr><td>Authentication</td><td>Infrastructure &gt; User Authentication</td><td>General tab, Authentication Profile</td></tr>
<tr><td>App settings</td><td>GlobalProtect &gt; GlobalProtect App</td><td>Mobile_User_Template &gt; Network &gt; GlobalProtect &gt; Portals &gt; GlobalProtect_Portal &gt; Agent &gt; Default App</td></tr>
<tr><td>Status</td><td>Activity Insights: Users</td><td>Cloud Services &gt; Status &gt; Status; Monitor &gt; Mobile Users</td></tr>
</table>
<div class="note"><p>Menu names can change between releases. Treat these paths as the documented structure, and look for the same words if your screen is slightly different.</p></div>

<h3>What the lab will do</h3>
<p>In pa-mobile-1 the home laptop 203.0.113.50 will connect to the portal using the default domain, authenticate with a local account, receive an address from the pool <code>10.200.0.0/23</code> and reach the HQ app at 10.10.0.50 once the service connection is up. The tenant portal address in the lab is 203.0.113.100.</p>
<pre class="out">Mobile Users - GlobalProtect (lab console view)
Portal hostname       tenant-lab.gpcloudservice.example
Authentication        Local
Client IP pool        10.200.0.0/23
Locations enabled     1
Status                <span class="hl">Deployed</span>
</pre>

<div class="eg"><p><b>Worked example.</b> A user starts the app at home. Step 1: the app contacts the portal name and the portal asks for credentials. Step 2: after login the portal returns the app configuration and the gateway list. Step 3: the app builds a tunnel to the chosen gateway and receives 10.200.0.7. Step 4: a request to 10.10.0.50 goes through the tunnel, passes policy, and exits via the service connection to HQ-FW.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating the portal and gateway as separate servers that you must size and patch. In Prisma Access the vendor runs them; your job is the settings.</p></div>
<div class="exam"><p><b>Exam trap.</b> The app first reaches the <i>portal</i>, which gives configuration; the <i>gateway</i> builds the tunnel and assigns the address. Do not swap them.</p></div>

<div class="scn"><h4>Everything worked in the office</h4><p>A sales team tested GlobalProtect inside the head office and it worked. From home, several users could not connect. The portal name resolved only inside the office. The administrator published the portal name in public DNS using the company domain, and the users connected.</p><p><b>Lesson:</b> test from the outside, using a real home network, not from the office.</p></div>

<div class="iv"><p class="q">"Explain GlobalProtect portal versus gateway."</p><p>Strong answer: the portal authenticates the user and delivers the app configuration and gateway list; the gateway builds the tunnel, assigns the client IP and enforces security. In Prisma Access both are hosted by the vendor; you configure naming, authentication, pools, locations, DNS and app settings.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Portal = front desk (authentication and configuration); gateway = tunnel and address.</li>
<li>Prisma Access hosts both; you configure the settings.</li>
<li>At least one service connection must exist; placeholders are allowed.</li>
<li>Know both menu paths: SCM and Panorama.</li>
<li>Test from a real outside network.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki office ke bahar laptop par baitha insaan Prisma Access se kaise connect aur protect hota hai. Aap GlobalProtect ke do roles (portal aur gateway), default aur company portal domains, teen authentication methods (local, SAML, certificate), client IP pools aur unke sizing rules, app location kaise select karta hai, internal aur public names ke DNS rules, app settings aur connect methods, split tunnel, HIP aur Explicit Proxy concepts, aur teen classic failures ka workflow padhoge: authentication, pool aur location. Phir teen labs practise karoge: <b>pa-mobile-1</b> (pehla GlobalProtect deployment), <b>pa-mobile-2</b> (DNS aur split tunnel) aur <b>pa-mobile-3</b> (ek ticket jahan user connect nahi kar paata).</p>
<p><b>Prerequisites.</b> pa-start module: teen connection types, infrastructure subnet 10.255.0.0/24, commit aur push, aur zones. VPN client aur DNS ka idea bhi chahiye.</p>

<h3>Analogy: hotel ka front desk aur room corridors</h3>
<p>Hotel mein pahunchte ho to <b>front desk</b> check karta hai aap kaun ho aur key card aur room number deta hai. Phir aap <b>corridor</b> se apne room jaate ho. GlobalProtect mein front desk <b>portal</b> hai aur corridor <b>gateway</b>. Portal aapko authenticate karta hai aur app ko uski settings aur gateways ki list batata hai. Gateway tunnel banata hai, address deta hai aur security apply karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Portal aur gateway steps">
<rect x="20" y="70" width="130" height="60" rx="8" fill="#bae6fd"/><text x="85" y="96" text-anchor="middle" class="svg-ink" font-size="12">LAPTOP-HOME</text><text x="85" y="114" text-anchor="middle" class="svg-muted" font-size="11">203.0.113.50</text>
<rect x="260" y="20" width="150" height="60" rx="8" fill="#ddd6fe"/><text x="335" y="46" text-anchor="middle" class="svg-ink" font-size="12">Portal</text><text x="335" y="64" text-anchor="middle" class="svg-muted" font-size="11">gp.nkprisma.example</text>
<rect x="260" y="120" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="335" y="146" text-anchor="middle" class="svg-ink" font-size="12">Gateway</text><text x="335" y="164" text-anchor="middle" class="svg-muted" font-size="11">tunnel, pool address</text>
<rect x="500" y="70" width="130" height="60" rx="8" fill="#fde68a"/><text x="565" y="96" text-anchor="middle" class="svg-ink" font-size="12">HQ app</text><text x="565" y="114" text-anchor="middle" class="svg-muted" font-size="11">10.10.0.50</text>
<line x1="150" y1="90" x2="260" y2="55" stroke="#64748b"/><line x1="150" y1="110" x2="260" y2="150" stroke="#64748b"/><line x1="410" y1="150" x2="500" y2="110" stroke="#64748b"/>
<text x="195" y="60" class="svg-muted" font-size="11">1 login, config</text><text x="195" y="150" class="svg-muted" font-size="11">2 tunnel</text><text x="430" y="150" class="svg-muted" font-size="11">3 service conn. se</text>
</svg><p class="cap">App pehle portal se baat karta hai, phir gateway tak tunnel banata hai, phir service connection ke through HQ tak pahunchta hai.</p></div>

<h3>Kaun kya chalata hai</h3>
<p>Prisma Access mein vendor <b>GlobalProtect portal aur gateways aapke liye host karta hai</b>. Aap gateways ke liye servers ya certificates nahi banate. Aap settings configure karte ho: portal ka naam kaise rakhna hai, users kaise authenticate honge, kaunsa client IP pool use hoga, kaunse locations enabled hain, clients kaunsa DNS use karenge, aur app kya karegi. App Windows, macOS, iOS, Android, Chrome OS aur Linux ke liye available hai. Ise Prisma Access portal (macOS aur Windows) ya app stores se download kar sakte hain.</p>
<p>Ek prerequisite: gateways corporate side tak service connection ke through pahunchte hain. Kam se kam ek service connection hona chahiye, aur pehle setup ke liye placeholder values allowed hain.</p>

<h3>Settings ka map</h3>
<table class="cmp"><tr><th>Topic</th><th>SCM path</th><th>Panorama path</th></tr>
<tr><td>Entry</td><td>Configuration &gt; NGFW and Prisma Access &gt; Configuration Scope &gt; Prisma Access &gt; Mobile Users</td><td>Panorama &gt; Cloud Services &gt; Configuration &gt; Mobile Users - GlobalProtect</td></tr>
<tr><td>Portal, DNS, pool</td><td>GlobalProtect &gt; Infrastructure</td><td>Onboarding &gt; Configure &gt; General, IP Pools, Network Services tabs</td></tr>
<tr><td>Locations</td><td>Infrastructure &gt; Prisma Access Locations</td><td>Locations tab</td></tr>
<tr><td>Authentication</td><td>Infrastructure &gt; User Authentication</td><td>General tab, Authentication Profile</td></tr>
<tr><td>App settings</td><td>GlobalProtect &gt; GlobalProtect App</td><td>Mobile_User_Template &gt; Network &gt; GlobalProtect &gt; Portals &gt; GlobalProtect_Portal &gt; Agent &gt; Default App</td></tr>
<tr><td>Status</td><td>Activity Insights: Users</td><td>Cloud Services &gt; Status &gt; Status; Monitor &gt; Mobile Users</td></tr>
</table>
<div class="note"><p>Menu names releases ke beech badal sakte hain. In paths ko documented structure maano, aur screen thodi alag ho to wahi shabd dhoondho.</p></div>

<h3>Lab kya karega</h3>
<p>pa-mobile-1 mein home laptop 203.0.113.50 default domain se portal se connect hoga, local account se authenticate karega, <code>10.200.0.0/23</code> pool se address lega aur service connection up hone par HQ app 10.10.0.50 tak pahunchega. Lab mein tenant portal address 203.0.113.100 hai.</p>
<pre class="out">Mobile Users - GlobalProtect (lab console view)
Portal hostname       tenant-lab.gpcloudservice.example
Authentication        Local
Client IP pool        10.200.0.0/23
Locations enabled     1
Status                <span class="hl">Deployed</span>
</pre>

<div class="eg"><p><b>Worked example.</b> User ghar par app start karta hai. Step 1: app portal naam se contact karta hai aur portal credentials maangta hai. Step 2: login ke baad portal app configuration aur gateway list return karta hai. Step 3: app chune hue gateway tak tunnel banata hai aur 10.200.0.7 paata hai. Step 4: 10.10.0.50 ki request tunnel se jaati hai, policy pass karti hai, aur service connection ke through HQ-FW tak nikalti hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Portal aur gateway ko alag servers samajhna jinhe aapko size aur patch karna hai. Prisma Access mein vendor unhe chalata hai; aapka kaam settings hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> App pehle <i>portal</i> tak pahunchta hai, jo configuration deta hai; <i>gateway</i> tunnel banata hai aur address assign karta hai. Inhe swap mat karo.</p></div>

<div class="scn"><h4>Office mein sab chal raha tha</h4><p>Sales team ne head office ke andar GlobalProtect test kiya aur chal gaya. Ghar se kai users connect nahi kar paaye. Portal naam sirf office ke andar resolve hota tha. Administrator ne portal naam company domain se public DNS mein publish kiya, aur users connect ho gaye.</p><p><b>Seekh:</b> asli ghar ke network se bahar se test karo, office se nahi.</p></div>

<div class="iv"><p class="q">"GlobalProtect portal versus gateway samjhao."</p><p>Strong answer: portal user ko authenticate karta hai aur app configuration aur gateway list deta hai; gateway tunnel banata hai, client IP assign karta hai aur security enforce karta hai. Prisma Access mein dono vendor host karta hai; aap naming, authentication, pools, locations, DNS aur app settings configure karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Portal = front desk (authentication aur configuration); gateway = tunnel aur address.</li>
<li>Prisma Access dono host karta hai; aap settings configure karte ho.</li>
<li>Kam se kam ek service connection chahiye; placeholders allowed hain.</li>
<li>Dono menu paths jaano: SCM aur Panorama.</li>
<li>Asli outside network se test karo.</li>
</ul></div>
`}};export{e as default};