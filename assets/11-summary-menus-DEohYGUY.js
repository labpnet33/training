var e={id:`summary-menus`,h:{en:`Summary, menu paths and exam checklist`,hi:`Summary, menu paths aur exam checklist`},body:{en:`
<p>This chapter ties the module together. It gives you a side-by-side map of the SCM and Panorama menu paths, a checklist of what you must be able to do, a mini glossary and the most tested facts. It supports the exam objective "mobile users" in Domain 1, and troubleshooting connectivity in Domain 5.</p>

<h3>The whole flow in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Mobile user setup summary">
<rect x="10" y="40" width="100" height="60" rx="8" fill="#bae6fd"/><text x="60" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Portal name</text><text x="60" y="84" text-anchor="middle" class="svg-muted" font-size="11">default or company</text>
<rect x="120" y="40" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="170" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 Authentication</text><text x="170" y="84" text-anchor="middle" class="svg-muted" font-size="11">local, SAML, cert</text>
<rect x="230" y="40" width="100" height="60" rx="8" fill="#bbf7d0"/><text x="280" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 Pool</text><text x="280" y="84" text-anchor="middle" class="svg-muted" font-size="11">min /23</text>
<rect x="340" y="40" width="100" height="60" rx="8" fill="#fde68a"/><text x="390" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 Locations</text><text x="390" y="84" text-anchor="middle" class="svg-muted" font-size="11">enabled</text>
<rect x="450" y="40" width="85" height="60" rx="8" fill="#fed7aa"/><text x="492" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 DNS</text><text x="492" y="84" text-anchor="middle" class="svg-muted" font-size="11">rules</text>
<rect x="545" y="40" width="85" height="60" rx="8" fill="#e2e8f0"/><text x="587" y="66" text-anchor="middle" class="svg-ink" font-size="12">6 App</text><text x="587" y="84" text-anchor="middle" class="svg-muted" font-size="11">and tunnel</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Then push, verify, and test from an outside network</text>
</svg><p class="cap">Six configuration areas, followed by a push and a real test.</p></div>

<h3>Menu paths side by side</h3>
<table class="cmp"><tr><th>Task</th><th>SCM</th><th>Panorama</th></tr>
<tr><td>Open mobile users</td><td>Configuration &gt; NGFW and Prisma Access &gt; Configuration Scope &gt; Prisma Access &gt; Mobile Users</td><td>Panorama &gt; Cloud Services &gt; Configuration &gt; Mobile Users - GlobalProtect</td></tr>
<tr><td>Portal, DNS, pool</td><td>GlobalProtect &gt; Infrastructure</td><td>Onboarding &gt; Configure &gt; General, IP Pools, Network Services</td></tr>
<tr><td>Locations</td><td>Infrastructure &gt; Prisma Access Locations</td><td>Locations tab</td></tr>
<tr><td>Authentication</td><td>Infrastructure &gt; User Authentication</td><td>General tab, Authentication Profile</td></tr>
<tr><td>App settings</td><td>GlobalProtect &gt; GlobalProtect App</td><td>Mobile_User_Template &gt; Network &gt; GlobalProtect &gt; Portals &gt; GlobalProtect_Portal &gt; Agent &gt; Default App</td></tr>
<tr><td>Split tunnel</td><td>GlobalProtect App &gt; Tunnel Settings</td><td>Agent configuration in Mobile_User_Template</td></tr>
<tr><td>Explicit Proxy</td><td>Same Mobile Users entry</td><td>Cloud Services &gt; Configuration &gt; Mobile Users - Explicit Proxy</td></tr>
<tr><td>Apply</td><td>Operations &gt; Push Config</td><td>Commit &gt; Commit and Push (Prisma Access tab)</td></tr>
<tr><td>Status</td><td>Activity Insights: Users</td><td>Cloud Services &gt; Status &gt; Status; Monitor &gt; Mobile Users</td></tr>
</table>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain portal versus gateway and draw the flow.</li>
<li>I can choose between default and company domain, and list what a company domain needs.</li>
<li>I can compare local, SAML and certificate authentication.</li>
<li>I can size a client IP pool (minimum /23, about 2x devices) and avoid reserved ranges.</li>
<li>I can describe how a location is selected and why to enable more than one compute location.</li>
<li>I can write an internal domain DNS rule and choose a public rule mode.</li>
<li>I can name the connect methods and key timer defaults.</li>
<li>I can explain split tunnel and its security trade-off.</li>
<li>I can describe HIP and Explicit Proxy.</li>
<li>I can diagnose authentication, pool and location failures.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Portal</dt><dd>Authenticates the user, delivers app settings and the gateway list.</dd>
<dt>Gateway</dt><dd>Builds the tunnel, assigns the client IP and enforces policy.</dd>
<dt>Client IP pool</dt><dd>Address block given to connected devices; min /23.</dd>
<dt>Company Domain</dt><dd>Your own portal name, needing a certificate, service profile and CNAME.</dd>
<dt>HIP</dt><dd>Host information profile, device posture.</dd>
<dt>PAC file</dt><dd>Browser proxy script used by Explicit Proxy.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Minimum custom pool</td><td>/23 per location</td></tr>
<tr><td>Pool sizing advice</td><td>About 2x the number of devices</td></tr>
<tr><td>Reserved ranges</td><td>169.254.0.0/16 and 100.64.0.0/10</td></tr>
<tr><td>Block handout</td><td>/24 per gateway</td></tr>
<tr><td>Default connect method</td><td>User-logon (Always On)</td></tr>
<tr><td>Defaults</td><td>Cookie 24 h, login lifetime 30 days, inactivity 180 min, notice 30 min</td></tr>
<tr><td>Internal DNS domain list</td><td>Up to 1,024 entries, format *.example.com</td></tr>
<tr><td>Public DNS modes</td><td>Cloud Default, Same as Internal, Custom</td></tr>
<tr><td>Panorama auth profile</td><td>Read-only after first commit and push</td></tr>
<tr><td>IP Optimization</td><td>First setup only; app 6.1.4+, 6.2.3+ or 6.3.0+</td></tr>
</table>
<div class="note"><p><b>Honest reminder.</b> The console is a teaching model. HIP redistribution, Explicit Proxy and real GlobalProtect client logs are concept only. Practise on the real product or a trial before the exam.</p></div>

<div class="eg"><p><b>Worked example: self-test.</b> A new tenant needs 450 roaming staff on mixed devices (about 700 devices). Pool: 700 x 2 = 1,400, so a /21 (2,048) is the next size; check overlap with 10.10.0.0/24, 10.20.0.0/24 and 10.255.0.0/24. Name: default domain for the pilot. Authentication: SAML. Locations: two compute locations. DNS: *.corp.example to 10.10.0.53. Then push and test from home 203.0.113.50.</p></div>
<div class="exam"><p><b>Exam trap.</b> Most failures are not exotic. If the answer options include "pool exhausted", "authentication profile wrong" and "location not enabled", match the symptom to the cause.</p></div>

<div class="scn"><h4>A calm Monday</h4><p>A team that followed this module's order launched GlobalProtect for 300 users: they tested the portal from an outside network, sized the pool at 2x, enabled two compute locations, set DNS for the internal domain, and recorded every split tunnel exclusion with a reason. The first week produced three tickets, all solved in minutes with the three-branch workflow.</p><p><b>Lesson:</b> a good design and a clear workflow remove most drama.</p></div>

<div class="iv"><p class="q">"Describe a complete GlobalProtect deployment on Prisma Access."</p><p>Strong answer: name the portal (default or company), choose authentication (SAML typically), define a pool of at least /23 sized to about 2x devices, enable locations in more than one compute location, set internal DNS rules, configure app connect method and timers, decide split tunnel exclusions with care, push, then test from outside and monitor authentication, users and pool usage.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Six areas: portal name, authentication, pool, locations, DNS, app and tunnel.</li>
<li>Know both menu paths and the push step.</li>
<li>Pool: min /23, 2x devices, avoid 169.254.0.0/16 and 100.64.0.0/10.</li>
<li>Three classic failures map to three screens.</li>
<li>HIP and Explicit Proxy are concepts; split tunnel needs security care.</li>
</ul></div>
`,hi:`
<p>Yeh chapter module ko jodta hai. Yeh SCM aur Panorama menu paths ka side-by-side map, aapko kya aana chahiye uski checklist, mini glossary aur sabse zyada test hone wale facts deta hai. Yeh Domain 1 ke exam objective "mobile users" aur Domain 5 ke connectivity troubleshooting ko support karta hai.</p>

<h3>Poora flow ek picture mein</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Mobile user setup summary">
<rect x="10" y="40" width="100" height="60" rx="8" fill="#bae6fd"/><text x="60" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Portal name</text><text x="60" y="84" text-anchor="middle" class="svg-muted" font-size="11">default ya company</text>
<rect x="120" y="40" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="170" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 Authentication</text><text x="170" y="84" text-anchor="middle" class="svg-muted" font-size="11">local, SAML, cert</text>
<rect x="230" y="40" width="100" height="60" rx="8" fill="#bbf7d0"/><text x="280" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 Pool</text><text x="280" y="84" text-anchor="middle" class="svg-muted" font-size="11">min /23</text>
<rect x="340" y="40" width="100" height="60" rx="8" fill="#fde68a"/><text x="390" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 Locations</text><text x="390" y="84" text-anchor="middle" class="svg-muted" font-size="11">enabled</text>
<rect x="450" y="40" width="85" height="60" rx="8" fill="#fed7aa"/><text x="492" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 DNS</text><text x="492" y="84" text-anchor="middle" class="svg-muted" font-size="11">rules</text>
<rect x="545" y="40" width="85" height="60" rx="8" fill="#e2e8f0"/><text x="587" y="66" text-anchor="middle" class="svg-ink" font-size="12">6 App</text><text x="587" y="84" text-anchor="middle" class="svg-muted" font-size="11">aur tunnel</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Phir push, verify, aur outside network se test</text>
</svg><p class="cap">Chhe configuration areas, uske baad push aur asli test.</p></div>

<h3>Menu paths side by side</h3>
<table class="cmp"><tr><th>Task</th><th>SCM</th><th>Panorama</th></tr>
<tr><td>Mobile users kholna</td><td>Configuration &gt; NGFW and Prisma Access &gt; Configuration Scope &gt; Prisma Access &gt; Mobile Users</td><td>Panorama &gt; Cloud Services &gt; Configuration &gt; Mobile Users - GlobalProtect</td></tr>
<tr><td>Portal, DNS, pool</td><td>GlobalProtect &gt; Infrastructure</td><td>Onboarding &gt; Configure &gt; General, IP Pools, Network Services</td></tr>
<tr><td>Locations</td><td>Infrastructure &gt; Prisma Access Locations</td><td>Locations tab</td></tr>
<tr><td>Authentication</td><td>Infrastructure &gt; User Authentication</td><td>General tab, Authentication Profile</td></tr>
<tr><td>App settings</td><td>GlobalProtect &gt; GlobalProtect App</td><td>Mobile_User_Template &gt; Network &gt; GlobalProtect &gt; Portals &gt; GlobalProtect_Portal &gt; Agent &gt; Default App</td></tr>
<tr><td>Split tunnel</td><td>GlobalProtect App &gt; Tunnel Settings</td><td>Mobile_User_Template mein agent configuration</td></tr>
<tr><td>Explicit Proxy</td><td>Wahi Mobile Users entry</td><td>Cloud Services &gt; Configuration &gt; Mobile Users - Explicit Proxy</td></tr>
<tr><td>Apply</td><td>Operations &gt; Push Config</td><td>Commit &gt; Commit and Push (Prisma Access tab)</td></tr>
<tr><td>Status</td><td>Activity Insights: Users</td><td>Cloud Services &gt; Status &gt; Status; Monitor &gt; Mobile Users</td></tr>
</table>

<h3>Can-do checklist</h3>
<ul>
<li>Main portal versus gateway explain kar sakta hoon aur flow draw kar sakta hoon.</li>
<li>Main default aur company domain mein se chun sakta hoon, aur company domain ko kya chahiye woh list kar sakta hoon.</li>
<li>Main local, SAML aur certificate authentication compare kar sakta hoon.</li>
<li>Main client IP pool size kar sakta hoon (minimum /23, lagbhag 2x devices) aur reserved ranges avoid kar sakta hoon.</li>
<li>Main describe kar sakta hoon ki location kaise select hota hai aur ek se zyada compute location kyun enable karni chahiye.</li>
<li>Main internal domain DNS rule likh sakta hoon aur public rule mode chun sakta hoon.</li>
<li>Main connect methods aur key timer defaults bata sakta hoon.</li>
<li>Main split tunnel aur uska security trade-off explain kar sakta hoon.</li>
<li>Main HIP aur Explicit Proxy describe kar sakta hoon.</li>
<li>Main authentication, pool aur location failures diagnose kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Portal</dt><dd>User ko authenticate karta hai, app settings aur gateway list deta hai.</dd>
<dt>Gateway</dt><dd>Tunnel banata hai, client IP assign karta hai aur policy enforce karta hai.</dd>
<dt>Client IP pool</dt><dd>Connected devices ko diya jaane wala address block; min /23.</dd>
<dt>Company Domain</dt><dd>Aapka apna portal name, jise certificate, service profile aur CNAME chahiye.</dd>
<dt>HIP</dt><dd>Host information profile, device posture.</dd>
<dt>PAC file</dt><dd>Explicit Proxy dwara use hone wali browser proxy script.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Minimum custom pool</td><td>Per location /23</td></tr>
<tr><td>Pool sizing advice</td><td>Devices ka lagbhag 2x</td></tr>
<tr><td>Reserved ranges</td><td>169.254.0.0/16 aur 100.64.0.0/10</td></tr>
<tr><td>Block handout</td><td>Per gateway /24</td></tr>
<tr><td>Default connect method</td><td>User-logon (Always On)</td></tr>
<tr><td>Defaults</td><td>Cookie 24 h, login lifetime 30 days, inactivity 180 min, notice 30 min</td></tr>
<tr><td>Internal DNS domain list</td><td>1,024 entries tak, format *.example.com</td></tr>
<tr><td>Public DNS modes</td><td>Cloud Default, Same as Internal, Custom</td></tr>
<tr><td>Panorama auth profile</td><td>Pehle commit aur push ke baad read-only</td></tr>
<tr><td>IP Optimization</td><td>Sirf first setup; app 6.1.4+, 6.2.3+ ya 6.3.0+</td></tr>
</table>
<div class="note"><p><b>Imaandaar reminder.</b> Console ek teaching model hai. HIP redistribution, Explicit Proxy aur real GlobalProtect client logs sirf concept hain. Exam se pehle asli product ya trial par practise karo.</p></div>

<div class="eg"><p><b>Worked example: self-test.</b> Naye tenant ko mixed devices par 450 roaming staff chahiye (lagbhag 700 devices). Pool: 700 x 2 = 1,400, to agla size /21 (2,048) hai; 10.10.0.0/24, 10.20.0.0/24 aur 10.255.0.0/24 se overlap check karo. Name: pilot ke liye default domain. Authentication: SAML. Locations: do compute locations. DNS: *.corp.example se 10.10.0.53. Phir push karo aur ghar 203.0.113.50 se test karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Zyadatar failures exotic nahi hoti. Options mein "pool exhausted", "authentication profile wrong" aur "location not enabled" ho to symptom ko cause se match karo.</p></div>

<div class="scn"><h4>Ek shaant Monday</h4><p>Jis team ne is module ka order follow kiya usne 300 users ke liye GlobalProtect launch kiya: outside network se portal test kiya, pool 2x size kiya, do compute locations enable kiye, internal domain ka DNS set kiya, aur har split tunnel exclusion reason ke saath record kiya. Pehle hafte mein teen tickets aaye, sab teen-branch workflow se minutes mein solve hue.</p><p><b>Seekh:</b> achha design aur clear workflow zyadatar drama hata dete hain.</p></div>

<div class="iv"><p class="q">"Prisma Access par complete GlobalProtect deployment describe karo."</p><p>Strong answer: portal ka naam do (default ya company), authentication chuno (aam taur par SAML), kam se kam /23 ka pool lagbhag 2x devices ke hisaab se define karo, ek se zyada compute location mein locations enable karo, internal DNS rules set karo, app connect method aur timers configure karo, split tunnel exclusions dhyan se decide karo, push karo, phir bahar se test karo aur authentication, users aur pool usage monitor karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chhe areas: portal name, authentication, pool, locations, DNS, app aur tunnel.</li>
<li>Dono menu paths aur push step jaano.</li>
<li>Pool: min /23, 2x devices, 169.254.0.0/16 aur 100.64.0.0/10 avoid.</li>
<li>Teen classic failures teen screens se map hoti hain.</li>
<li>HIP aur Explicit Proxy concepts hain; split tunnel mein security care chahiye.</li>
</ul></div>
`}};export{e as default};