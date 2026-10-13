var e={id:`ise-nac`,h:{en:`Network access control and ISE as the policy engine`,hi:`Network access control aur policy engine ki tarah ISE`},body:{en:`
<p>Picture the reception desk of a large office. Visitors, employees, contractors and delivery staff all arrive at the same door. The receptionist checks who each person is, looks them up in a list, and hands out a badge: green for employees (all floors), yellow for contractors (two floors), red for visitors (lobby and meeting rooms only). The doors themselves do not decide anything; they just read the badge. In network access control, <b>ISE is the receptionist</b> and the <b>switches and wireless controllers are the doors</b>.</p>

<h3>What network access control decides</h3>
<p><b>Network access control (NAC)</b> answers five questions every time a device connects: <b>who</b> is the user, <b>what</b> is the device (a corporate laptop, a printer, a phone), <b>where</b> is it connecting (which switch, wired or wireless), <b>when</b> (office hours?) and <b>how</b> (802.1X, MAB, WebAuth). The answer is an <b>authorization result</b>: permit or deny, plus a VLAN, an ACL, a Security Group Tag, or a redirect to a portal.</p>

<h3>Cisco ISE: one policy engine, many services</h3>
<p>The <b>Cisco Identity Services Engine (ISE)</b> is Cisco's NAC policy server. Its main services are:</p>
<ul>
<li><b>RADIUS authentication and authorization</b> for 802.1X, MAB and WebAuth on switches, WLCs and VPN head ends.</li>
<li><b>Profiling</b>: identifying device types from clues sent by probes (RADIUS attributes, DHCP options, HTTP user agent, CDP/LLDP via SNMP, NetFlow, NMAP scans). "MAC 0050.7a00.0030 sends DHCP option 60 from a printer vendor, so it is a printer."</li>
<li><b>Posture</b>: checking endpoint compliance through the Secure Client posture module.</li>
<li><b>Guest and BYOD</b>: hotspot, self-registration and sponsored guest portals; certificate onboarding for personal devices.</li>
<li><b>TrustSec</b>: the SGT definitions and the SGACL egress policy matrix.</li>
<li><b>Device administration</b> with TACACS+ (covered in encor-device-security).</li>
<li><b>pxGrid</b>: sharing session context (user, IP, SGT, posture) with firewalls and other tools, and receiving ANC quarantine requests.</li>
</ul>

<h3>ISE personas and deployment</h3>
<p>An ISE node can run one or more <b>personas</b>. A small site runs everything on one or two nodes; a large enterprise spreads them out.</p>
<table class="cmp"><tr><th>Persona</th><th>Job</th></tr>
<tr><td><b>PAN</b> (Policy Administration Node)</td><td>The GUI and configuration database; primary and secondary for redundancy</td></tr>
<tr><td><b>MnT</b> (Monitoring and Troubleshooting)</td><td>Collects logs and reports; the Live Logs page you use when troubleshooting</td></tr>
<tr><td><b>PSN</b> (Policy Service Node)</td><td>Does the real work: answers RADIUS, runs portals, profiling and posture. Switches point to PSNs</td></tr>
<tr><td><b>pxGrid</b></td><td>Publishes context to subscribers such as the firewall management center</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="ISE personas and network access devices">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">PAN: policy and GUI</text>
<rect x="20" y="10" width="170" height="40" rx="8" fill="#fde68a"/><text x="105" y="35" text-anchor="middle" class="svg-ink" font-size="13">MnT: logs</text>
<rect x="450" y="10" width="170" height="40" rx="8" fill="#fed7aa"/><text x="535" y="35" text-anchor="middle" class="svg-ink" font-size="13">pxGrid: context</text>
<rect x="120" y="95" width="160" height="40" rx="8" fill="#bae6fd"/><text x="200" y="120" text-anchor="middle" class="svg-ink" font-size="13">PSN 1</text>
<rect x="360" y="95" width="160" height="40" rx="8" fill="#bae6fd"/><text x="440" y="120" text-anchor="middle" class="svg-ink" font-size="13">PSN 2</text>
<line x1="320" y1="50" x2="200" y2="95" stroke="#64748b" stroke-dasharray="4 3"/><line x1="320" y1="50" x2="440" y2="95" stroke="#64748b" stroke-dasharray="4 3"/>
<rect x="40" y="180" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="110" y="205" text-anchor="middle" class="svg-ink" font-size="13">Access switch</text>
<rect x="250" y="180" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="13">WLC</text>
<rect x="460" y="180" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="530" y="205" text-anchor="middle" class="svg-ink" font-size="13">VPN head end</text>
<line x1="110" y1="180" x2="200" y2="135" stroke="#64748b"/><line x1="320" y1="180" x2="200" y2="135" stroke="#64748b"/><line x1="320" y1="180" x2="440" y2="135" stroke="#64748b"/><line x1="530" y1="180" x2="440" y2="135" stroke="#64748b"/>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">RADIUS 1812/1813, CoA 1700</text>
</svg><p class="cap">Network access devices (NADs) send RADIUS to the PSNs; the PAN pushes policy to the PSNs; MnT stores the logs.</p></div>

<h3>How an ISE policy is built</h3>
<p>ISE policy is organised in <b>policy sets</b>, for example "Wired access". Each has two parts:</p>
<ol>
<li><b>Authentication policy</b>: which identity store checks the credentials (Active Directory, internal users, certificate authentication profile, internal endpoints for MAB).</li>
<li><b>Authorization policy</b>: ordered rules such as "if AD group = Employees and posture = compliant, then profile EMPLOYEE-ACCESS". The <b>authorization profile</b> holds the result: Access-Accept with VLAN 20, SGT Employees, perhaps a dACL.</li>
</ol>
<p>Every switch must be added to ISE as a <b>network device</b> with its IP address and the same RADIUS <b>shared secret</b> configured on the switch. A request from an unknown IP, or with the wrong secret, is dropped silently. Remember that detail; it is the first fault in the troubleshooting lab.</p>

<h3>RADIUS in one minute</h3>
<p>RADIUS uses <b>UDP 1812</b> for authentication and authorization and <b>UDP 1813</b> for accounting (older devices use 1645 and 1646). Message types: Access-Request, Access-Challenge, Access-Accept, Access-Reject, and Accounting-Request (Start, Interim-Update, Stop). Authentication and authorization come together in one Access-Accept, which is why ISE can hand the switch a VLAN in the same packet that says "yes". Only the password attribute is obfuscated with the shared secret; EAP methods protect credentials inside their own TLS tunnels. <b>Change of Authorization (CoA)</b> is a server-initiated RADIUS message, on UDP 1700 in Cisco devices (3799 in the RFC).</p>

<h3>ISE in the lab</h3>
<p>The lab's ISE is a simplified RADIUS server driven by commands. The equivalents of the ISE GUI are:</p>
<pre class="code">ISE&gt; aaa-server client 10.99.99.1 key NKsecret          <span class="c">! network device SW1 and its secret</span>
ISE&gt; aaa-server user alice password Nk@2026              <span class="c">! identity store</span>
ISE&gt; aaa-server authz alice vlan 20 sgt 10               <span class="c">! authorization profile for alice</span>
ISE&gt; aaa-server mab 0050.7a00.0030 vlan 30 sgt 30        <span class="c">! endpoint allowed by MAB</span></pre>
<p>Its log is your Live Logs page:</p>
<pre class="out">ISE&gt; aaa-server show log
Sep 30 09:14:02.118  802.1X (EAP-MD5) PASS for alice (NAS 10.99.99.1, GigabitEthernet0/1)
Sep 30 09:14:18.402  MAB PASS for 0050.7a00.0030 (NAS 10.99.99.1, GigabitEthernet0/2)
<span class="hl">Sep 30 09:14:19.011  MAB FAIL for 0050.7966.0c33 (NAS 10.99.99.1, GigabitEthernet0/3): unknown endpoint</span></pre>

<div class="eg"><p><b>Worked example.</b> A 20,000-user campus has 900 access switches. The team deploys two PAN/MnT nodes in the data center and four PSNs, two per data center. Each switch lists two PSNs as RADIUS servers so one PSN failure is invisible to users. With four PSNs, each carries about 5,000 active sessions, well within capacity, and profiling probes run on the PSNs closest to the users.</p></div>

<div class="warn"><p><b>Common mistake.</b> Pointing switches at the PAN instead of the PSNs, or adding only one RADIUS server. If that node reboots during an upgrade, every new login fails. Always configure at least two PSNs and a critical VLAN for the case where all servers are dead.</p></div>

<div class="exam"><p><b>Exam trap.</b> The switch or WLC is the <b>authenticator</b> and the RADIUS client (the NAD); ISE is the <b>authentication server</b>. The switch never checks passwords. RADIUS combines authentication and authorization; TACACS+ separates them and is used for device administration.</p></div>

<div class="scn"><h4>The new switch that rejected everyone</h4><p>After a floor refurbishment, users on a new switch could not log in, while the rest of the building worked. ISE Live Logs showed nothing from that switch at all. The engineer checked the network device list in ISE: the new switch sourced RADIUS from its VLAN 99 SVI, but ISE had been given the loopback address. Adding the correct IP (and later forcing <code>ip radius source-interface Loopback0</code> on every switch for consistency) fixed it.</p><p><b>Lesson:</b> silence in the RADIUS server log means the request was dropped before policy: unknown NAD IP or wrong shared secret.</p></div>

<div class="iv"><p class="q">"Explain the ISE personas and how you would size a deployment."</p><p>Strong answer: PAN holds configuration and GUI, MnT stores logs and reports, PSN handles RADIUS, portals, profiling and posture, pxGrid shares context. Small deployments combine personas on two nodes; large ones use redundant PAN and MnT pairs and many PSNs close to users, often behind a load balancer. Switches point to at least two PSNs. Mention the authentication versus authorization policy split and authorization profiles carrying VLAN, dACL and SGT.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAC decides who, what, where, when and how, and returns an authorization result.</li>
<li>ISE services: RADIUS, profiling, posture, guest/BYOD, TrustSec, TACACS+, pxGrid.</li>
<li>Personas: PAN (config), MnT (logs), PSN (does the work), pxGrid (context sharing).</li>
<li>Each switch is a network device in ISE with matching IP and shared secret; mismatches are dropped silently.</li>
<li>RADIUS: UDP 1812/1813; CoA UDP 1700 on Cisco (3799 in the RFC).</li>
</ul></div>
`,hi:`
<p>Ek bade office ki reception desk ki kalpana karo. Visitors, employees, contractors aur delivery staff sab ek hi darwaze par aate hain. Receptionist check karti hai ki har insaan kaun hai, list mein dekhti hai, aur badge deti hai: employees ke liye green (saare floors), contractors ke liye yellow (do floors), visitors ke liye red (sirf lobby aur meeting rooms). Darwaze khud kuch decide nahi karte; woh bas badge padhte hain. Network access control mein <b>ISE receptionist hai</b> aur <b>switches aur wireless controllers darwaze hain</b>.</p>

<h3>Network access control kya decide karta hai</h3>
<p><b>Network access control (NAC)</b> har baar device connect hone par paanch sawaalon ka jawab deta hai: user <b>kaun</b> hai, device <b>kya</b> hai (corporate laptop, printer, phone), <b>kahan</b> connect ho raha hai (kaunsa switch, wired ya wireless), <b>kab</b> (office hours?) aur <b>kaise</b> (802.1X, MAB, WebAuth). Jawab ek <b>authorization result</b> hai: permit ya deny, saath mein VLAN, ACL, Security Group Tag, ya portal par redirect.</p>

<h3>Cisco ISE: ek policy engine, kai services</h3>
<p><b>Cisco Identity Services Engine (ISE)</b> Cisco ka NAC policy server hai. Iski main services hain:</p>
<ul>
<li>Switches, WLCs aur VPN head ends par 802.1X, MAB aur WebAuth ke liye <b>RADIUS authentication aur authorization</b>.</li>
<li><b>Profiling</b>: probes ke bheje clues se device types pehchanna (RADIUS attributes, DHCP options, HTTP user agent, SNMP se CDP/LLDP, NetFlow, NMAP scans). "MAC 0050.7a00.0030 printer vendor ka DHCP option 60 bhejta hai, to yeh printer hai."</li>
<li><b>Posture</b>: Secure Client posture module ke through endpoint compliance check karna.</li>
<li><b>Guest aur BYOD</b>: hotspot, self-registration aur sponsored guest portals; personal devices ke liye certificate onboarding.</li>
<li><b>TrustSec</b>: SGT definitions aur SGACL egress policy matrix.</li>
<li>TACACS+ ke saath <b>device administration</b> (encor-device-security mein cover hua).</li>
<li><b>pxGrid</b>: session context (user, IP, SGT, posture) firewalls aur doosre tools ke saath share karna, aur ANC quarantine requests lena.</li>
</ul>

<h3>ISE personas aur deployment</h3>
<p>Ek ISE node ek ya zyada <b>personas</b> chala sakta hai. Chhoti site sab kuch ek ya do nodes par chalati hai; badi enterprise unhe fail deti hai.</p>
<table class="cmp"><tr><th>Persona</th><th>Kaam</th></tr>
<tr><td><b>PAN</b> (Policy Administration Node)</td><td>GUI aur configuration database; redundancy ke liye primary aur secondary</td></tr>
<tr><td><b>MnT</b> (Monitoring and Troubleshooting)</td><td>Logs aur reports collect karta hai; Live Logs page jo aap troubleshooting mein use karte ho</td></tr>
<tr><td><b>PSN</b> (Policy Service Node)</td><td>Asli kaam karta hai: RADIUS ka jawab, portals, profiling aur posture chalata hai. Switches PSNs ko point karte hain</td></tr>
<tr><td><b>pxGrid</b></td><td>Firewall management center jaise subscribers ko context publish karta hai</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="ISE personas aur network access devices">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">PAN: policy aur GUI</text>
<rect x="20" y="10" width="170" height="40" rx="8" fill="#fde68a"/><text x="105" y="35" text-anchor="middle" class="svg-ink" font-size="13">MnT: logs</text>
<rect x="450" y="10" width="170" height="40" rx="8" fill="#fed7aa"/><text x="535" y="35" text-anchor="middle" class="svg-ink" font-size="13">pxGrid: context</text>
<rect x="120" y="95" width="160" height="40" rx="8" fill="#bae6fd"/><text x="200" y="120" text-anchor="middle" class="svg-ink" font-size="13">PSN 1</text>
<rect x="360" y="95" width="160" height="40" rx="8" fill="#bae6fd"/><text x="440" y="120" text-anchor="middle" class="svg-ink" font-size="13">PSN 2</text>
<line x1="320" y1="50" x2="200" y2="95" stroke="#64748b" stroke-dasharray="4 3"/><line x1="320" y1="50" x2="440" y2="95" stroke="#64748b" stroke-dasharray="4 3"/>
<rect x="40" y="180" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="110" y="205" text-anchor="middle" class="svg-ink" font-size="13">Access switch</text>
<rect x="250" y="180" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="13">WLC</text>
<rect x="460" y="180" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="530" y="205" text-anchor="middle" class="svg-ink" font-size="13">VPN head end</text>
<line x1="110" y1="180" x2="200" y2="135" stroke="#64748b"/><line x1="320" y1="180" x2="200" y2="135" stroke="#64748b"/><line x1="320" y1="180" x2="440" y2="135" stroke="#64748b"/><line x1="530" y1="180" x2="440" y2="135" stroke="#64748b"/>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">RADIUS 1812/1813, CoA 1700</text>
</svg><p class="cap">Network access devices (NADs) PSNs ko RADIUS bhejte hain; PAN PSNs ko policy push karta hai; MnT logs store karta hai.</p></div>

<h3>ISE policy kaise banti hai</h3>
<p>ISE policy <b>policy sets</b> mein organise hoti hai, jaise "Wired access". Har ek ke do hisse hote hain:</p>
<ol>
<li><b>Authentication policy</b>: kaunsa identity store credentials check karta hai (Active Directory, internal users, certificate authentication profile, MAB ke liye internal endpoints).</li>
<li><b>Authorization policy</b>: ordered rules jaise "agar AD group = Employees aur posture = compliant, to profile EMPLOYEE-ACCESS". <b>Authorization profile</b> mein result hota hai: VLAN 20, SGT Employees, shayad dACL ke saath Access-Accept.</li>
</ol>
<p>Har switch ko ISE mein uske IP address aur switch par configured same RADIUS <b>shared secret</b> ke saath <b>network device</b> ki tarah add karna padta hai. Unknown IP se ya galat secret wali request chupchaap drop hoti hai. Yeh detail yaad rakho; yahi troubleshooting lab ka pehla fault hai.</p>

<h3>Ek minute mein RADIUS</h3>
<p>RADIUS authentication aur authorization ke liye <b>UDP 1812</b> aur accounting ke liye <b>UDP 1813</b> use karta hai (purane devices 1645 aur 1646 use karte hain). Message types: Access-Request, Access-Challenge, Access-Accept, Access-Reject, aur Accounting-Request (Start, Interim-Update, Stop). Authentication aur authorization ek hi Access-Accept mein saath aate hain, isiliye ISE switch ko usi packet mein VLAN de sakta hai jo "haan" kehta hai. Sirf password attribute shared secret se obfuscate hota hai; EAP methods credentials ko apne TLS tunnels ke andar protect karte hain. <b>Change of Authorization (CoA)</b> server-initiated RADIUS message hai, Cisco devices mein UDP 1700 par (RFC mein 3799).</p>

<h3>Lab mein ISE</h3>
<p>Lab ka ISE commands se chalne wala simplified RADIUS server hai. ISE GUI ke equivalents hain:</p>
<pre class="code">ISE&gt; aaa-server client 10.99.99.1 key NKsecret          <span class="c">! network device SW1 aur uska secret</span>
ISE&gt; aaa-server user alice password Nk@2026              <span class="c">! identity store</span>
ISE&gt; aaa-server authz alice vlan 20 sgt 10               <span class="c">! alice ka authorization profile</span>
ISE&gt; aaa-server mab 0050.7a00.0030 vlan 30 sgt 30        <span class="c">! MAB se allowed endpoint</span></pre>
<p>Iska log aapka Live Logs page hai:</p>
<pre class="out">ISE&gt; aaa-server show log
Sep 30 09:14:02.118  802.1X (EAP-MD5) PASS for alice (NAS 10.99.99.1, GigabitEthernet0/1)
Sep 30 09:14:18.402  MAB PASS for 0050.7a00.0030 (NAS 10.99.99.1, GigabitEthernet0/2)
<span class="hl">Sep 30 09:14:19.011  MAB FAIL for 0050.7966.0c33 (NAS 10.99.99.1, GigabitEthernet0/3): unknown endpoint</span></pre>

<div class="eg"><p><b>Worked example.</b> 20,000 users wale campus mein 900 access switches hain. Team data center mein do PAN/MnT nodes aur chaar PSNs deploy karti hai, har data center mein do. Har switch do PSNs ko RADIUS servers ki tarah list karta hai taaki ek PSN ka failure users ko dikhe hi nahi. Chaar PSNs ke saath har ek lagbhag 5,000 active sessions uthata hai, capacity ke andar, aur profiling probes users ke sabse paas wale PSNs par chalte hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Switches ko PSNs ki jagah PAN par point karna, ya sirf ek RADIUS server add karna. Agar woh node upgrade ke dauraan reboot ho, to har naya login fail hota hai. Hamesha kam se kam do PSNs aur un case ke liye critical VLAN configure karo jab saare servers dead hon.</p></div>

<div class="exam"><p><b>Exam trap.</b> Switch ya WLC <b>authenticator</b> aur RADIUS client (NAD) hai; ISE <b>authentication server</b> hai. Switch kabhi passwords check nahi karta. RADIUS authentication aur authorization ko combine karta hai; TACACS+ unhe alag karta hai aur device administration ke liye use hota hai.</p></div>

<div class="scn"><h4>Naya switch jisne sabko reject kiya</h4><p>Floor refurbishment ke baad naye switch par users login nahi kar paa rahe the, jabki baaki building chal rahi thi. ISE Live Logs mein us switch se kuch bhi nahi tha. Engineer ne ISE mein network device list check ki: naya switch RADIUS apne VLAN 99 SVI se source karta tha, lekin ISE ko loopback address diya gaya tha. Sahi IP add karne se (aur baad mein consistency ke liye har switch par <code>ip radius source-interface Loopback0</code> force karne se) problem theek ho gayi.</p><p><b>Seekh:</b> RADIUS server log mein khamoshi ka matlab hai request policy se pehle drop hui: unknown NAD IP ya galat shared secret.</p></div>

<div class="iv"><p class="q">"ISE personas explain karo aur aap deployment ka size kaise tay karoge."</p><p>Strong answer: PAN configuration aur GUI rakhta hai, MnT logs aur reports store karta hai, PSN RADIUS, portals, profiling aur posture handle karta hai, pxGrid context share karta hai. Chhote deployments do nodes par personas combine karte hain; bade deployments redundant PAN aur MnT pairs aur users ke paas kai PSNs use karte hain, aksar load balancer ke peeche. Switches kam se kam do PSNs ko point karte hain. Authentication versus authorization policy split aur VLAN, dACL aur SGT carry karne wale authorization profiles mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAC kaun, kya, kahan, kab aur kaise decide karta hai, aur authorization result return karta hai.</li>
<li>ISE services: RADIUS, profiling, posture, guest/BYOD, TrustSec, TACACS+, pxGrid.</li>
<li>Personas: PAN (config), MnT (logs), PSN (kaam karta hai), pxGrid (context sharing).</li>
<li>Har switch ISE mein matching IP aur shared secret wala network device hai; mismatch chupchaap drop hota hai.</li>
<li>RADIUS: UDP 1812/1813; CoA Cisco par UDP 1700 (RFC mein 3799).</li>
</ul></div>
`}};export{e as default};