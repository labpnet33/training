var e={id:`net-services`,h:{en:`Network services design: DHCP, DNS, NTP, AAA, NAC and TrustSec`,hi:`Network services design: DHCP, DNS, NTP, AAA, NAC aur TrustSec`},body:{en:`
<h3>Customer case: Larkfield Hospital Group</h3>
<div class="eg"><p><b>Organisation:</b> Larkfield Hospital Group, 6,500 staff, 2 hospitals and 9 clinics, with a primary data center and a DR data center. <b>Endpoints:</b> 4,000 staff PCs, 1,800 medical devices (infusion pumps, imaging), 2,500 guest and patient devices. <b>Drivers:</b> an audit found medical devices on the same VLAN as staff PCs, no network access control, and drifting clocks that make incident logs useless. Last month the AAA server failed and nobody could log in to switches or Wi-Fi for 40 minutes. <b>Constraints:</b> clinical systems cannot be rebooted in business hours, clinics have 10 to 50 Mb/s WANs, and the budget allows two ISE nodes per data center but not a server in each clinic.</p></div>

<h3>Core services, and the design question for each</h3>
<p>Analogy: core services are the water, power and signage of a building. Nobody notices them until they stop. Your design job is to make each one redundant, close enough to users, and secure.</p>
<table class="cmp"><tr><th>Service</th><th>What it does</th><th>Design choices</th></tr>
<tr><td><b>DHCP</b></td><td>Gives hosts address, gateway, DNS</td><td>Relay (<code>ip helper-address</code>) to two central servers with split scope or failover; local server at large sites; DHCP snooping on access to block rogue servers</td></tr>
<tr><td><b>DNS</b></td><td>Names to addresses</td><td>Two or more resolvers per region, anycast or load-balanced; split DNS for internal/external names; resolvers at a site only when WAN loss must be survived</td></tr>
<tr><td><b>NTP</b></td><td>Common time</td><td>Internal stratum 2 servers synced from trusted external sources; devices point to two or three internal servers; authenticate NTP</td></tr>
<tr><td><b>AAA</b></td><td>Who, what allowed, what was done</td><td>RADIUS for network access, TACACS+ for device administration, with redundant servers and local fallback account</td></tr></table>
<p>NTP matters more than people think: certificates, Kerberos, logs and 802.1X all depend on correct time. A good design uses NTP version 4, a hierarchy of strata, and at least three time sources so one bad clock is outvoted. Where sub-microsecond timing is needed, PTP is used instead, but that is rare in enterprise campuses.</p>

<h3>Cisco ISE and network access control</h3>
<p><b>Cisco Identity Services Engine (ISE)</b> is the policy server for network access control (NAC). A device or user connects; the switch or controller (the authenticator) asks ISE through RADIUS; ISE decides using identity, device type, posture and context, and returns an authorisation result (VLAN, ACL, or a security group tag). Methods: <b>802.1X</b> for devices with a supplicant, <b>MAB (MAC Authentication Bypass)</b> for devices that cannot do 802.1X (printers, infusion pumps), and web authentication for guests. ISE can also profile devices, so a pump is identified by its MAC OUI and DHCP behaviour.</p>
<p>ISE personas: the <b>PAN</b> (policy administration node) manages the configuration, the <b>MnT</b> (monitoring and troubleshooting) node collects logs, the <b>PSN</b> (policy service node) answers authentication requests, and pxGrid shares context with security products. A distributed deployment puts PSNs close to users and uses a load balancer or node group. Use <b>RADIUS CoA (change of authorisation)</b> to re-apply policy to a connected endpoint when its posture changes.</p>

<h3>Segmentation with TrustSec</h3>
<p>VLAN and ACL segmentation scale badly: every new rule means editing IP-based lists on many devices. <b>Cisco TrustSec</b> classifies traffic into <b>Security Group Tags (SGT)</b> by identity, then enforces rules between groups with <b>SGACLs</b> (a matrix such as Medical-Devices to Staff-PCs: deny). Three steps: <b>classification</b> (dynamic from ISE at login, or static IP-to-SGT and VLAN-to-SGT mappings), <b>propagation</b> (inline tagging in the Ethernet frame where hardware supports it, or SXP between devices that cannot tag), and <b>enforcement</b> (SGACL on switches, or SGT-aware firewall rules).</p>

<h3>Options and the chosen design</h3>
<table class="cmp"><tr><th>Option</th><th>Pros</th><th>Cons</th></tr>
<tr><td>VLANs per device type with ACLs</td><td>Familiar</td><td>Hundreds of ACL lines, topology-bound, hard to change</td></tr>
<tr><td>802.1X everywhere immediately (closed mode)</td><td>Strong</td><td>Medical devices without supplicants lose access; outage risk</td></tr>
<tr><td>Phased 802.1X + MAB, then TrustSec SGTs</td><td>Safe; policy by identity</td><td>Needs ISE profiling and hardware support</td></tr></table>
<p><b>Chosen:</b> four ISE nodes (two PAN/MnT, plus PSNs) split between the data centers, with a load-balancer VIP for PSNs; clinics authenticate to the nearest data center PSN and use <i>critical authentication</i> on the switch to keep devices alive if all PSNs are unreachable. Rollout in <b>monitor mode</b> first (authenticate but allow everything), then <b>low-impact mode</b> (limited pre-auth ACL), finally closed mode where safe. Medical devices are profiled and get tag Medical; staff get Clinical-Staff; guests get Guest; an SGACL matrix denies Guest to Medical and Medical to everything except the imaging servers. NTP: two internal servers per hospital data center, authenticated, with devices pointing to three sources.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="ISE and TrustSec design">
<rect x="10" y="20" width="110" height="45" rx="8" fill="#fed7aa"/><text x="65" y="48" text-anchor="middle" class="svg-ink" font-size="13">Infusion pump</text>
<rect x="10" y="85" width="110" height="45" rx="8" fill="#bbf7d0"/><text x="65" y="113" text-anchor="middle" class="svg-ink" font-size="13">Staff laptop</text>
<rect x="10" y="150" width="110" height="45" rx="8" fill="#e2e8f0"/><text x="65" y="178" text-anchor="middle" class="svg-ink" font-size="13">Guest phone</text>
<rect x="190" y="70" width="120" height="70" rx="10" fill="#bae6fd"/><text x="250" y="100" text-anchor="middle" class="svg-ink" font-size="13">Access switch</text><text x="250" y="120" text-anchor="middle" class="svg-muted" font-size="12">MAB, 802.1X</text>
<rect x="390" y="10" width="110" height="55" rx="8" fill="#ddd6fe"/><text x="445" y="34" text-anchor="middle" class="svg-ink" font-size="13">ISE PSN</text><text x="445" y="52" text-anchor="middle" class="svg-muted" font-size="12">DC1 and DC2</text>
<rect x="390" y="95" width="110" height="55" rx="8" fill="#fde68a"/><text x="445" y="119" text-anchor="middle" class="svg-ink" font-size="13">SGACL matrix</text><text x="445" y="137" text-anchor="middle" class="svg-muted" font-size="12">enforcement</text>
<rect x="540" y="95" width="90" height="55" rx="8" fill="#e2e8f0"/><text x="585" y="119" text-anchor="middle" class="svg-ink" font-size="12">Imaging</text><text x="585" y="137" text-anchor="middle" class="svg-ink" font-size="12">servers</text>
<line x1="120" y1="42" x2="190" y2="90" stroke="#64748b" stroke-width="2"/><line x1="120" y1="107" x2="190" y2="105" stroke="#64748b" stroke-width="2"/><line x1="120" y1="172" x2="190" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="310" y1="90" x2="390" y2="40" stroke="#64748b" stroke-width="2"/><line x1="310" y1="115" x2="390" y2="122" stroke="#64748b" stroke-width="2"/><line x1="500" y1="122" x2="540" y2="122" stroke="#64748b" stroke-width="2"/>
<text x="350" y="62" class="svg-accent" font-size="12">RADIUS</text>
<rect x="10" y="220" width="14" height="14" fill="#fed7aa"/><text x="30" y="232" class="svg-ink" font-size="12">Medical SGT</text>
<rect x="130" y="220" width="14" height="14" fill="#bbf7d0"/><text x="150" y="232" class="svg-ink" font-size="12">Staff SGT</text>
<rect x="240" y="220" width="14" height="14" fill="#e2e8f0"/><text x="260" y="232" class="svg-ink" font-size="12">Guest SGT</text>
<rect x="350" y="220" width="14" height="14" fill="#ddd6fe"/><text x="370" y="232" class="svg-ink" font-size="12">policy server</text>
</svg><p class="cap">The switch asks ISE who the endpoint is, ISE returns an SGT, and the SGACL matrix decides what that group may reach.</p></div>

<pre class="code">aaa new-model
radius server ISE-DC1
 address ipv4 192.0.2.10 auth-port 1812 acct-port 1813
 key <span class="c">! shared secret here</span>
radius server ISE-DC2
 address ipv4 198.51.100.10 auth-port 1812 acct-port 1813
aaa group server radius ISE-GROUP
 server name ISE-DC1
 server name ISE-DC2
aaa authentication dot1x default group ISE-GROUP
aaa authorization network default group ISE-GROUP
aaa accounting dot1x default start-stop group ISE-GROUP
aaa server radius dynamic-author
 client 192.0.2.10 server-key <span class="c">! secret</span>
dot1x system-auth-control
ntp server 192.0.2.50
ntp server 198.51.100.50</pre>
<pre class="out">Switch# show authentication sessions interface GigabitEthernet1/0/12
            Method status list:
       Method           State
       mab              Authc Success
  Authorized By: Authentication Server
  <span class="hl">Security Group: 0010-00</span></pre>

<h3>High availability for services</h3>
<ul>
<li><b>No single instance:</b> two of everything, in different failure domains (building, data center).</li>
<li><b>Survive WAN loss:</b> small sites need local DHCP and DNS cache or a local survivable option, and authentication must have a critical-auth fallback.</li>
<li><b>Failure tuning:</b> shorten RADIUS dead-detection so a failed server is skipped quickly.</li>
<li><b>Test:</b> failover is a feature you must rehearse.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Going straight to closed mode; using one ISE node for everything; NTP pointing to one source; forgetting a local emergency admin account when TACACS+ is unreachable.</p></div>
<div class="exam"><p><b>Exam trap.</b> RADIUS is for network access, TACACS+ is for device administration. SGT classification, propagation and enforcement are separate steps. Monitor mode before closed mode.</p></div>

<div class="scn"><h4>Post-mortem: the 40-minute lockout</h4><p>When the single AAA server crashed, switches could not authenticate administrators and Wi-Fi clients could not join. There was no secondary server and no local fallback. After the redesign, each device lists two ISE nodes in different data centers, a critical VLAN keeps devices connected if all servers are lost, and a break-glass local admin is stored in the vault.</p><p><b>Lesson:</b> AAA is on the critical path of everything; design it for failure first.</p></div>

<div class="iv"><p class="q">"How would you roll out 802.1X in a hospital with legacy medical devices?"</p><p>Monitor mode first to learn what is on the network, profile the devices, use MAB for those without supplicants, move to low-impact mode, then segment with TrustSec SGTs. Keep critical-auth and redundant PSNs so a failure never disconnects patient care.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design DHCP, DNS, NTP and AAA as redundant, close-to-user services.</li>
<li>ISE roles: PAN, MnT, PSN; RADIUS for access, TACACS+ for admin.</li>
<li>Roll out NAC in phases: monitor, low-impact, closed.</li>
<li>TrustSec = classify with SGT, propagate (inline or SXP), enforce with SGACL.</li>
<li>Always plan for server loss with critical authentication and local fallback.</li>
</ul></div>
`,hi:`
<h3>Customer case: Larkfield Hospital Group</h3>
<div class="eg"><p><b>Organisation:</b> Larkfield Hospital Group, 6,500 staff, 2 hospitals aur 9 clinics, ek primary data center aur ek DR data center ke saath. <b>Endpoints:</b> 4,000 staff PCs, 1,800 medical devices (infusion pumps, imaging), 2,500 guest aur patient devices. <b>Drivers:</b> audit mein medical devices staff PCs wale VLAN par mile, network access control nahi tha, aur drift karti clocks ne incident logs bekaar kar diye. Pichhle mahine AAA server fail hua aur 40 minute tak koi switches ya Wi-Fi mein login nahi kar paya. <b>Constraints:</b> clinical systems business hours mein reboot nahi ho sakte, clinics ke WAN 10 se 50 Mb/s ke hain, aur budget har data center mein do ISE nodes allow karta hai lekin har clinic mein server nahi.</p></div>

<h3>Core services, aur har ek ka design question</h3>
<p>Analogy: core services building ke paani, bijli aur signage jaisi hain. Jab tak band na ho, koi dhyan nahi deta. Aapka design kaam hai har ek ko redundant, users ke paas, aur secure banana.</p>
<table class="cmp"><tr><th>Service</th><th>Kya karti hai</th><th>Design choices</th></tr>
<tr><td><b>DHCP</b></td><td>Hosts ko address, gateway, DNS deti hai</td><td>Do central servers ko relay (<code>ip helper-address</code>), split scope ya failover ke saath; bade sites par local server; rogue servers rokne ke liye access par DHCP snooping</td></tr>
<tr><td><b>DNS</b></td><td>Names se addresses</td><td>Har region mein do ya zyada resolvers, anycast ya load-balanced; internal/external names ke liye split DNS; site par resolvers tabhi jab WAN loss survive karna ho</td></tr>
<tr><td><b>NTP</b></td><td>Common time</td><td>Internal stratum 2 servers jo trusted external sources se sync hon; devices do ya teen internal servers ko point karein; NTP authenticate karo</td></tr>
<tr><td><b>AAA</b></td><td>Kaun, kya allowed, kya kiya</td><td>Network access ke liye RADIUS, device administration ke liye TACACS+, redundant servers aur local fallback account ke saath</td></tr></table>
<p>NTP logon ki soch se zyada matter karta hai: certificates, Kerberos, logs aur 802.1X sab sahi time par depend karte hain. Achha design NTP version 4, strata ki hierarchy aur kam se kam teen time sources use karta hai taaki ek kharab clock outvote ho jaaye. Jahan sub-microsecond timing chahiye wahan PTP use hota hai, lekin enterprise campuses mein yeh rare hai.</p>

<h3>Cisco ISE aur network access control</h3>
<p><b>Cisco Identity Services Engine (ISE)</b> network access control (NAC) ka policy server hai. Device ya user connect hota hai; switch ya controller (authenticator) RADIUS ke through ISE se poochta hai; ISE identity, device type, posture aur context se decide karta hai aur authorisation result (VLAN, ACL, ya security group tag) lautata hai. Methods: supplicant wale devices ke liye <b>802.1X</b>, jo 802.1X nahi kar sakte (printers, infusion pumps) unke liye <b>MAB (MAC Authentication Bypass)</b>, aur guests ke liye web authentication. ISE devices ko profile bhi kar sakta hai, isliye pump MAC OUI aur DHCP behaviour se pehchaana jaata hai.</p>
<p>ISE personas: <b>PAN</b> (policy administration node) configuration manage karta hai, <b>MnT</b> (monitoring and troubleshooting) node logs collect karta hai, <b>PSN</b> (policy service node) authentication requests ka jawab deta hai, aur pxGrid security products ke saath context share karta hai. Distributed deployment mein PSNs users ke paas rakhte hain aur load balancer ya node group use karte hain. Jab endpoint ka posture badle to connected endpoint par policy dobara lagane ke liye <b>RADIUS CoA (change of authorisation)</b> use karo.</p>

<h3>TrustSec se segmentation</h3>
<p>VLAN aur ACL segmentation kharab scale hoti hai: har nayi rule ka matlab kai devices par IP-based lists edit karna. <b>Cisco TrustSec</b> traffic ko identity se <b>Security Group Tags (SGT)</b> mein classify karta hai, phir groups ke beech rules <b>SGACLs</b> se enforce karta hai (matrix jaise Medical-Devices se Staff-PCs: deny). Teen steps: <b>classification</b> (login par ISE se dynamic, ya static IP-to-SGT aur VLAN-to-SGT mappings), <b>propagation</b> (jahan hardware support kare wahan Ethernet frame mein inline tagging, ya jo tag nahi kar sakte unke beech SXP), aur <b>enforcement</b> (switches par SGACL, ya SGT-aware firewall rules).</p>

<h3>Options aur chosen design</h3>
<table class="cmp"><tr><th>Option</th><th>Pros</th><th>Cons</th></tr>
<tr><td>Device type ke hisaab se VLANs aur ACLs</td><td>Jaana-pehchana</td><td>Sainkdon ACL lines, topology se bandha, badalna mushkil</td></tr>
<tr><td>Turant sab jagah 802.1X (closed mode)</td><td>Strong</td><td>Supplicant ke bina medical devices access kho dete hain; outage risk</td></tr>
<tr><td>Phased 802.1X + MAB, phir TrustSec SGTs</td><td>Safe; identity se policy</td><td>ISE profiling aur hardware support chahiye</td></tr></table>
<p><b>Chosen:</b> chaar ISE nodes (do PAN/MnT, plus PSNs) data centers ke beech split, PSNs ke liye load-balancer VIP ke saath; clinics nearest data center PSN se authenticate karte hain aur agar saare PSNs unreachable hon to devices ko alive rakhne ke liye switch par <i>critical authentication</i> use karte hain. Rollout pehle <b>monitor mode</b> mein (authenticate karo lekin sab allow), phir <b>low-impact mode</b> (limited pre-auth ACL), aur jahan safe ho wahan closed mode. Medical devices profile hote hain aur tag Medical paate hain; staff ko Clinical-Staff; guests ko Guest; SGACL matrix Guest se Medical deny karta hai aur Medical se imaging servers ke alawa sab kuch deny. NTP: har hospital data center mein do internal servers, authenticated, aur devices teen sources ko point karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="ISE aur TrustSec design">
<rect x="10" y="20" width="110" height="45" rx="8" fill="#fed7aa"/><text x="65" y="48" text-anchor="middle" class="svg-ink" font-size="13">Infusion pump</text>
<rect x="10" y="85" width="110" height="45" rx="8" fill="#bbf7d0"/><text x="65" y="113" text-anchor="middle" class="svg-ink" font-size="13">Staff laptop</text>
<rect x="10" y="150" width="110" height="45" rx="8" fill="#e2e8f0"/><text x="65" y="178" text-anchor="middle" class="svg-ink" font-size="13">Guest phone</text>
<rect x="190" y="70" width="120" height="70" rx="10" fill="#bae6fd"/><text x="250" y="100" text-anchor="middle" class="svg-ink" font-size="13">Access switch</text><text x="250" y="120" text-anchor="middle" class="svg-muted" font-size="12">MAB, 802.1X</text>
<rect x="390" y="10" width="110" height="55" rx="8" fill="#ddd6fe"/><text x="445" y="34" text-anchor="middle" class="svg-ink" font-size="13">ISE PSN</text><text x="445" y="52" text-anchor="middle" class="svg-muted" font-size="12">DC1 aur DC2</text>
<rect x="390" y="95" width="110" height="55" rx="8" fill="#fde68a"/><text x="445" y="119" text-anchor="middle" class="svg-ink" font-size="13">SGACL matrix</text><text x="445" y="137" text-anchor="middle" class="svg-muted" font-size="12">enforcement</text>
<rect x="540" y="95" width="90" height="55" rx="8" fill="#e2e8f0"/><text x="585" y="119" text-anchor="middle" class="svg-ink" font-size="12">Imaging</text><text x="585" y="137" text-anchor="middle" class="svg-ink" font-size="12">servers</text>
<line x1="120" y1="42" x2="190" y2="90" stroke="#64748b" stroke-width="2"/><line x1="120" y1="107" x2="190" y2="105" stroke="#64748b" stroke-width="2"/><line x1="120" y1="172" x2="190" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="310" y1="90" x2="390" y2="40" stroke="#64748b" stroke-width="2"/><line x1="310" y1="115" x2="390" y2="122" stroke="#64748b" stroke-width="2"/><line x1="500" y1="122" x2="540" y2="122" stroke="#64748b" stroke-width="2"/>
<text x="350" y="62" class="svg-accent" font-size="12">RADIUS</text>
<rect x="10" y="220" width="14" height="14" fill="#fed7aa"/><text x="30" y="232" class="svg-ink" font-size="12">Medical SGT</text>
<rect x="130" y="220" width="14" height="14" fill="#bbf7d0"/><text x="150" y="232" class="svg-ink" font-size="12">Staff SGT</text>
<rect x="240" y="220" width="14" height="14" fill="#e2e8f0"/><text x="260" y="232" class="svg-ink" font-size="12">Guest SGT</text>
<rect x="350" y="220" width="14" height="14" fill="#ddd6fe"/><text x="370" y="232" class="svg-ink" font-size="12">policy server</text>
</svg><p class="cap">Switch ISE se poochta hai ki endpoint kaun hai, ISE SGT lautata hai, aur SGACL matrix tay karta hai ki woh group kya reach kar sakta hai.</p></div>

<pre class="code">aaa new-model
radius server ISE-DC1
 address ipv4 192.0.2.10 auth-port 1812 acct-port 1813
 key <span class="c">! shared secret here</span>
radius server ISE-DC2
 address ipv4 198.51.100.10 auth-port 1812 acct-port 1813
aaa group server radius ISE-GROUP
 server name ISE-DC1
 server name ISE-DC2
aaa authentication dot1x default group ISE-GROUP
aaa authorization network default group ISE-GROUP
aaa accounting dot1x default start-stop group ISE-GROUP
aaa server radius dynamic-author
 client 192.0.2.10 server-key <span class="c">! secret</span>
dot1x system-auth-control
ntp server 192.0.2.50
ntp server 198.51.100.50</pre>
<pre class="out">Switch# show authentication sessions interface GigabitEthernet1/0/12
            Method status list:
       Method           State
       mab              Authc Success
  Authorized By: Authentication Server
  <span class="hl">Security Group: 0010-00</span></pre>

<h3>Services ke liye high availability</h3>
<ul>
<li><b>Koi single instance nahi:</b> har cheez do, alag failure domains mein (building, data center).</li>
<li><b>WAN loss survive karo:</b> chhoti sites ko local DHCP aur DNS cache ya local survivable option chahiye, aur authentication ke paas critical-auth fallback ho.</li>
<li><b>Failure tuning:</b> RADIUS dead-detection chhota rakho taaki failed server jaldi skip ho.</li>
<li><b>Test karo:</b> failover aisi feature hai jiski rehearsal karni padti hai.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Seedha closed mode par jana; sab kuch ke liye ek ISE node; NTP ka ek hi source; TACACS+ unreachable hone par local emergency admin account bhool jana.</p></div>
<div class="exam"><p><b>Exam trap.</b> RADIUS network access ke liye hai, TACACS+ device administration ke liye. SGT classification, propagation aur enforcement alag steps hain. Closed mode se pehle monitor mode.</p></div>

<div class="scn"><h4>Post-mortem: 40 minute ka lockout</h4><p>Jab akela AAA server crash hua, switches administrators ko authenticate nahi kar paye aur Wi-Fi clients join nahi kar paye. Na secondary server tha na local fallback. Redesign ke baad har device alag data centers ke do ISE nodes list karta hai, saare servers kho jaane par critical VLAN devices ko connected rakhta hai, aur break-glass local admin vault mein rakha hai.</p><p><b>Seekh:</b> AAA har cheez ke critical path par hai; use pehle failure ke liye design karo.</p></div>

<div class="iv"><p class="q">"Legacy medical devices wale hospital mein 802.1X kaise roll out karoge?"</p><p>Pehle monitor mode taaki pata chale network par kya hai, devices profile karo, jinke paas supplicant nahi unke liye MAB use karo, low-impact mode par jao, phir TrustSec SGTs se segment karo. Critical-auth aur redundant PSNs rakho taaki failure patient care ko kabhi disconnect na kare.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DHCP, DNS, NTP aur AAA ko redundant, user ke paas wali services ki tarah design karo.</li>
<li>ISE roles: PAN, MnT, PSN; access ke liye RADIUS, admin ke liye TACACS+.</li>
<li>NAC phases mein roll out karo: monitor, low-impact, closed.</li>
<li>TrustSec = SGT se classify, propagate (inline ya SXP), SGACL se enforce.</li>
<li>Server loss ke liye hamesha critical authentication aur local fallback plan karo.</li>
</ul></div>
`}};export{e as default};