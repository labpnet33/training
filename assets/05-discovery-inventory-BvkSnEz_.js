var e={id:`discovery-inventory`,h:{en:`Provision part 1: discovery and inventory`,hi:`Provision part 1: discovery aur inventory`},body:{en:`
<p>A new manager joining a team first learns who is on the team, what each person does and how to reach them. A controller is the same: before it can measure or configure anything, it needs an <b>inventory</b>. <b>Discovery</b> is how existing devices get into that inventory.</p>

<h3>How discovery works</h3>
<p>You start a discovery job (real product: <b>Tools → Discovery</b>; lab: <b>Inventory → Discovery</b> card) and choose how to find devices:</p>
<ul><li><b>IP address / range</b> — scan a subnet or a list of addresses. Predictable, and what the labs use.</li>
<li><b>CDP</b> or <b>LLDP</b> — start from a seed device and follow neighbours hop by hop, up to a chosen depth.</li>
<li><b>CIDR / prefix</b> — like a range, for bigger blocks.</li></ul>
<p>For every address that answers, the controller then proves it can manage the device with the <b>credentials</b> you supplied:</p>
<ol><li><b>ICMP</b> — is something alive at this IP?</li>
<li><b>SNMP</b> — can it read the device with the SNMPv2c community (or SNMPv3 user)? This gives facts like hostname, platform and interfaces.</li>
<li><b>CLI over SSH</b> — can it log in with the username and password? This is needed to read and push configuration. NETCONF (port 830) can also be enabled for newer IOS XE workflows.</li></ol>
<p>Only when the required checks pass does the device become <b>Managed</b>. The lab's Discovery card shows the same chain in its header: <code>ICMP → SNMP → SSH</code>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Discovery chain">
<rect x="10" y="60" width="120" height="50" rx="10" fill="#e2e8f0"/><text x="70" y="82" text-anchor="middle" class="svg-ink" font-size="13">IP range</text><text x="70" y="99" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.0/24</text>
<rect x="160" y="60" width="110" height="50" rx="10" fill="#bae6fd"/><text x="215" y="90" text-anchor="middle" class="svg-ink" font-size="13">ICMP alive?</text>
<rect x="300" y="60" width="120" height="50" rx="10" fill="#bae6fd"/><text x="360" y="82" text-anchor="middle" class="svg-ink" font-size="13">SNMP read?</text><text x="360" y="99" text-anchor="middle" class="svg-muted" font-size="12">community nkro</text>
<rect x="450" y="60" width="110" height="50" rx="10" fill="#bae6fd"/><text x="505" y="82" text-anchor="middle" class="svg-ink" font-size="13">SSH login?</text><text x="505" y="99" text-anchor="middle" class="svg-muted" font-size="12">netadmin</text>
<rect x="580" y="60" width="54" height="50" rx="10" fill="#bbf7d0"/><text x="607" y="90" text-anchor="middle" class="svg-ink" font-size="12">Managed</text>
<line x1="130" y1="85" x2="160" y2="85" stroke="#64748b" stroke-width="2"/><line x1="270" y1="85" x2="300" y2="85" stroke="#64748b" stroke-width="2"/><line x1="420" y1="85" x2="450" y2="85" stroke="#64748b" stroke-width="2"/><line x1="560" y1="85" x2="580" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="360" y="140" text-anchor="middle" class="svg-accent" font-size="12">fail here = "SNMP timeout / wrong community"</text>
<text x="505" y="40" text-anchor="middle" class="svg-accent" font-size="12">fail here = "CLI (SSH) authentication failed"</text>
</svg><p class="cap">Each stage has its own failure message, which tells you exactly which credential or setting to fix.</p></div>

<h3>What the devices need first</h3>
<p>Discovery cannot invent access. Every lab device already carries this baseline, and a real network needs the equivalent:</p>
<pre class="code"><span class="c">! Management reachability plus the credentials the controller will use</span>
ip domain name campus.nk
crypto key generate rsa modulus 2048
username netadmin privilege 15 secret NK@dmin1
line vty 0 4
 login local
 transport input ssh
snmp-server community nkro RO
<span class="c">! Access switches also need a management SVI and a default gateway</span>
interface Vlan99
 ip address 10.99.0.11 255.255.255.0
ip default-gateway 10.99.0.1</pre>

<h3>Running discovery in the lab</h3>
<p>In the GUI fill in <b>IP range(s)</b> <code>10.99.0.0/24</code>, <b>CLI username</b> <code>netadmin</code>, <b>CLI password</b> <code>NK@dmin1</code>, <b>SNMP RO community</b> <code>nkro</code> and click <b>Discover</b>. Or use the shell:</p>
<pre class="code">CTRL&gt; center discover 10.99.0.0/24 cli netadmin NK@dmin1 snmp nkro</pre>
<pre class="out">Discovery job 1: 10.99.0.0/24 (254 addresses)  CLI user netadmin  SNMP community nkro
IP address  Device  ICMP  SNMP  SSH  Result
----------  ------  ----  ----  ---  -------
10.99.0.1   DSW1    ok    ok    ok   Managed
10.99.0.11  ASW1    ok    ok    ok   Managed
10.99.0.12  ASW2    ok    ok    ok   Managed
<span class="hl">Scan complete: 3 managed, 0 failed, 251 addresses did not respond.</span></pre>
<p>Notice R1 is missing. Its management address is loopback 10.255.0.1, outside the range, and in Lab 1 it is not even reachable yet because of an OSPF fault. After the routing fix you discover it on its own: <code>center discover 10.255.0.1 cli netadmin NK@dmin1 snmp nkro</code>. Ranges can also be lists: <code>10.99.0.0/24,10.255.0.1</code> or <code>10.99.0.1-20</code>.</p>

<h3>Reading the inventory</h3>
<pre class="code">CTRL&gt; center inventory</pre>
<pre class="out">Device  Mgmt IP     Family             Role           Platform   Software   Reachability  Status   Uptime    Health
------  ----------  -----------------  -------------  ---------  ---------  ------------  -------  --------  ------
DSW1    10.99.0.1   Switches and Hubs  DISTRIBUTION   C9300-24T  NK-OS 2.0  Reachable     Managed  00:01:41  8/10
ASW1    10.99.0.11  Switches and Hubs  ACCESS         C9200-24P  NK-OS 2.0  Reachable     Managed  00:01:41  8/10
<span class="hl">R1      10.255.0.1  Router             BORDER ROUTER  ISR4331    NK-OS 2.0  Reachable     Managed  00:01:41  8/10</span></pre>
<p>The columns match what the real inventory shows: management IP, device family, <b>role</b> (access, distribution, core, border router: used by topology views and profiles), platform, software version, reachability and <b>collection status</b>. The controller keeps polling; if a device stops answering SNMP it moves to <b>Partial Collection Failure</b>, and if it stops answering at all it becomes <b>Unreachable</b>.</p>
<p>After discovery, real Catalyst Center expects one more step: <b>assign each device to a site</b> (and then provision it) so that site settings, profiles and site health apply.</p>

<div class="eg"><p><b>Worked example: reading failure rows.</b> Two bad jobs from the lab controller:</p>
<pre class="out">10.99.0.1   DSW1    ok    ok    fail  CLI (SSH) authentication failed
10.99.0.1   DSW1    ok    fail  ok    SNMP timeout / wrong community</pre>
<p>Row 1: ping and SNMP work, SSH fails, so the password (or <code>login local</code> / <code>transport input ssh</code>) is wrong. Row 2: SSH works but SNMP does not, so the community (here someone typed <code>public</code>) or an SNMP ACL is wrong. Routing is fine in both cases because ICMP succeeded.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Discovering an SVI or physical interface IP that may go down instead of a stable loopback. Using a CDP seed with too large a hop count and pulling in the ISP router. Rotating the switch password without updating the controller's credentials, which silently breaks template pushes later.</p></div>
<div class="exam"><p><b>Exam traps.</b> Discovery methods: IP range/CIDR, CDP, LLDP. Minimum credentials: CLI (SSH or Telnet) and SNMP; NETCONF is optional but used by some features. "Reachable but not managed" almost always means a credential problem, not routing.</p></div>

<div class="scn"><h4>Half the campus missing</h4><p>An engineer ran a CDP discovery seeded on the core with a hop count of 2. Only 60 of 140 switches appeared. The rest sat three and four hops away behind distribution stacks. Re-running with an IP range for the management subnet found everything in one pass, and 4 switches failed with "SNMP timeout" because an SNMP ACL on them only allowed the old monitoring server. Adding the controller's address to that ACL fixed them.</p><p><b>Lesson:</b> for completeness use IP ranges of management subnets, and read the per-device failure reason instead of re-running blindly.</p></div>

<div class="iv"><p class="q">"A switch answers ping but Catalyst Center cannot manage it. How do you troubleshoot?"</p><p>Walk the chain: ICMP works, so routing is fine. Check the discovery result: SNMP failure means wrong community/v3 user or an SNMP ACL; SSH failure means username/secret, <code>login local</code>, <code>transport input ssh</code>, RSA keys or a vty ACL. Fix on the device or update the credentials in the controller, then re-discover just that IP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Discovery finds devices by IP range, CDP or LLDP and validates ICMP, SNMP and CLI.</li>
<li>Only devices that pass the credential checks become Managed.</li>
<li>The failure reason per row points straight at the broken credential.</li>
<li>Inventory tracks role, platform, software, reachability and collection status.</li>
<li>Prefer stable loopbacks as management addresses; assign devices to sites after discovery.</li>
</ul></div>
`,hi:`
<p>Team mein naya manager aata hai to pehle seekhta hai ki team mein kaun hai, har insaan kya karta hai aur unse kaise sampark karein. Controller bhi aisa hi hai: kuch bhi measure ya configure karne se pehle use <b>inventory</b> chahiye. <b>Discovery</b> woh tareeka hai jisse existing devices us inventory mein aate hain.</p>

<h3>Discovery kaise kaam karta hai</h3>
<p>Aap ek discovery job shuru karte ho (real product: <b>Tools → Discovery</b>; lab: <b>Inventory → Discovery</b> card) aur chunte ho ki devices kaise dhoondhein:</p>
<ul><li><b>IP address / range</b> — ek subnet ya addresses ki list scan karo. Predictable, aur labs yahi use karti hain.</li>
<li><b>CDP</b> ya <b>LLDP</b> — ek seed device se shuru karo aur neighbours ko hop by hop follow karo, chuni hui depth tak.</li>
<li><b>CIDR / prefix</b> — range jaisa, bade blocks ke liye.</li></ul>
<p>Jo bhi address jawab deta hai, controller phir aapke diye <b>credentials</b> se prove karta hai ki woh device manage kar sakta hai:</p>
<ol><li><b>ICMP</b> — kya is IP par kuch zinda hai?</li>
<li><b>SNMP</b> — kya woh SNMPv2c community (ya SNMPv3 user) se device padh sakta hai? Isse hostname, platform aur interfaces jaise facts milte hain.</li>
<li><b>SSH par CLI</b> — kya woh username aur password se login kar sakta hai? Configuration padhne aur push karne ke liye yeh zaroori hai. Naye IOS XE workflows ke liye NETCONF (port 830) bhi enable ho sakta hai.</li></ol>
<p>Jab required checks pass hote hain tabhi device <b>Managed</b> banta hai. Lab ka Discovery card apne header mein yahi chain dikhata hai: <code>ICMP → SNMP → SSH</code>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Discovery chain">
<rect x="10" y="60" width="120" height="50" rx="10" fill="#e2e8f0"/><text x="70" y="82" text-anchor="middle" class="svg-ink" font-size="13">IP range</text><text x="70" y="99" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.0/24</text>
<rect x="160" y="60" width="110" height="50" rx="10" fill="#bae6fd"/><text x="215" y="90" text-anchor="middle" class="svg-ink" font-size="13">ICMP zinda?</text>
<rect x="300" y="60" width="120" height="50" rx="10" fill="#bae6fd"/><text x="360" y="82" text-anchor="middle" class="svg-ink" font-size="13">SNMP read?</text><text x="360" y="99" text-anchor="middle" class="svg-muted" font-size="12">community nkro</text>
<rect x="450" y="60" width="110" height="50" rx="10" fill="#bae6fd"/><text x="505" y="82" text-anchor="middle" class="svg-ink" font-size="13">SSH login?</text><text x="505" y="99" text-anchor="middle" class="svg-muted" font-size="12">netadmin</text>
<rect x="580" y="60" width="54" height="50" rx="10" fill="#bbf7d0"/><text x="607" y="90" text-anchor="middle" class="svg-ink" font-size="12">Managed</text>
<line x1="130" y1="85" x2="160" y2="85" stroke="#64748b" stroke-width="2"/><line x1="270" y1="85" x2="300" y2="85" stroke="#64748b" stroke-width="2"/><line x1="420" y1="85" x2="450" y2="85" stroke="#64748b" stroke-width="2"/><line x1="560" y1="85" x2="580" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="360" y="140" text-anchor="middle" class="svg-accent" font-size="12">yahan fail = "SNMP timeout / wrong community"</text>
<text x="505" y="40" text-anchor="middle" class="svg-accent" font-size="12">yahan fail = "CLI (SSH) authentication failed"</text>
</svg><p class="cap">Har stage ka apna failure message hai, jo exactly batata hai ki kaunsa credential ya setting theek karni hai.</p></div>

<h3>Devices ko pehle kya chahiye</h3>
<p>Discovery access paida nahi kar sakta. Har lab device mein yeh baseline pehle se hai, aur real network ko bhi iske barabar chahiye:</p>
<pre class="code"><span class="c">! Management reachability plus woh credentials jo controller use karega</span>
ip domain name campus.nk
crypto key generate rsa modulus 2048
username netadmin privilege 15 secret NK@dmin1
line vty 0 4
 login local
 transport input ssh
snmp-server community nkro RO
<span class="c">! Access switches ko management SVI aur default gateway bhi chahiye</span>
interface Vlan99
 ip address 10.99.0.11 255.255.255.0
ip default-gateway 10.99.0.1</pre>

<h3>Lab mein discovery chalana</h3>
<p>GUI mein <b>IP range(s)</b> <code>10.99.0.0/24</code>, <b>CLI username</b> <code>netadmin</code>, <b>CLI password</b> <code>NK@dmin1</code>, <b>SNMP RO community</b> <code>nkro</code> bharo aur <b>Discover</b> click karo. Ya shell use karo:</p>
<pre class="code">CTRL&gt; center discover 10.99.0.0/24 cli netadmin NK@dmin1 snmp nkro</pre>
<pre class="out">Discovery job 1: 10.99.0.0/24 (254 addresses)  CLI user netadmin  SNMP community nkro
IP address  Device  ICMP  SNMP  SSH  Result
----------  ------  ----  ----  ---  -------
10.99.0.1   DSW1    ok    ok    ok   Managed
10.99.0.11  ASW1    ok    ok    ok   Managed
10.99.0.12  ASW2    ok    ok    ok   Managed
<span class="hl">Scan complete: 3 managed, 0 failed, 251 addresses did not respond.</span></pre>
<p>Dhyan do R1 missing hai. Uska management address loopback 10.255.0.1 hai, range ke bahar, aur Lab 1 mein OSPF fault ki wajah se woh abhi reachable bhi nahi hai. Routing fix ke baad aap use alag se discover karte ho: <code>center discover 10.255.0.1 cli netadmin NK@dmin1 snmp nkro</code>. Ranges lists bhi ho sakti hain: <code>10.99.0.0/24,10.255.0.1</code> ya <code>10.99.0.1-20</code>.</p>

<h3>Inventory padhna</h3>
<pre class="code">CTRL&gt; center inventory</pre>
<pre class="out">Device  Mgmt IP     Family             Role           Platform   Software   Reachability  Status   Uptime    Health
------  ----------  -----------------  -------------  ---------  ---------  ------------  -------  --------  ------
DSW1    10.99.0.1   Switches and Hubs  DISTRIBUTION   C9300-24T  NK-OS 2.0  Reachable     Managed  00:01:41  8/10
ASW1    10.99.0.11  Switches and Hubs  ACCESS         C9200-24P  NK-OS 2.0  Reachable     Managed  00:01:41  8/10
<span class="hl">R1      10.255.0.1  Router             BORDER ROUTER  ISR4331    NK-OS 2.0  Reachable     Managed  00:01:41  8/10</span></pre>
<p>Columns wahi hain jo real inventory dikhati hai: management IP, device family, <b>role</b> (access, distribution, core, border router: topology views aur profiles use karte hain), platform, software version, reachability aur <b>collection status</b>. Controller polling karta rehta hai; agar device SNMP ka jawab dena band kare to woh <b>Partial Collection Failure</b> mein jaata hai, aur bilkul jawab na de to <b>Unreachable</b> ho jaata hai.</p>
<p>Discovery ke baad real Catalyst Center ek aur step expect karta hai: <b>har device ko site assign karo</b> (aur phir provision karo) taaki site settings, profiles aur site health apply hon.</p>

<div class="eg"><p><b>Worked example: failure rows padhna.</b> Lab controller ke do kharab jobs:</p>
<pre class="out">10.99.0.1   DSW1    ok    ok    fail  CLI (SSH) authentication failed
10.99.0.1   DSW1    ok    fail  ok    SNMP timeout / wrong community</pre>
<p>Row 1: ping aur SNMP chalte hain, SSH fail hota hai, to password (ya <code>login local</code> / <code>transport input ssh</code>) galat hai. Row 2: SSH chalta hai par SNMP nahi, to community (yahan kisi ne <code>public</code> type kiya) ya SNMP ACL galat hai. Dono cases mein routing theek hai kyunki ICMP succeed hua.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Stable loopback ki jagah SVI ya physical interface IP discover karna jo down ho sakta hai. CDP seed ko bahut bade hop count ke saath chalana aur ISP router ko bhi kheench lena. Switch ka password rotate karna aur controller ke credentials update na karna, jisse baad mein template pushes chupchaap toot jaate hain.</p></div>
<div class="exam"><p><b>Exam traps.</b> Discovery methods: IP range/CIDR, CDP, LLDP. Minimum credentials: CLI (SSH ya Telnet) aur SNMP; NETCONF optional hai lekin kuch features use karte hain. "Reachable but not managed" ka matlab lagbhag hamesha credential problem hai, routing nahi.</p></div>

<div class="scn"><h4>Aadha campus gayab</h4><p>Ek engineer ne core par seed karke hop count 2 ke saath CDP discovery chalaya. 140 mein se sirf 60 switches aaye. Baaki distribution stacks ke peeche teen aur chaar hop door the. Management subnet ki IP range ke saath dobara chalane par ek hi pass mein sab mil gaye, aur 4 switches "SNMP timeout" ke saath fail hue kyunki unke SNMP ACL sirf purane monitoring server ko allow karte the. Us ACL mein controller ka address jodne se woh theek ho gaye.</p><p><b>Lesson:</b> completeness ke liye management subnets ki IP ranges use karo, aur blindly dobara chalane ki jagah har device ka failure reason padho.</p></div>

<div class="iv"><p class="q">"Ek switch ping ka jawab deta hai par Catalyst Center use manage nahi kar pata. Kaise troubleshoot karoge?"</p><p>Chain walk karo: ICMP chalta hai, to routing theek hai. Discovery result dekho: SNMP failure ka matlab galat community/v3 user ya SNMP ACL; SSH failure ka matlab username/secret, <code>login local</code>, <code>transport input ssh</code>, RSA keys ya vty ACL. Device par fix karo ya controller mein credentials update karo, phir sirf us IP ko dobara discover karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Discovery devices ko IP range, CDP ya LLDP se dhoondhta hai aur ICMP, SNMP aur CLI validate karta hai.</li>
<li>Sirf credential checks pass karne wale devices Managed bante hain.</li>
<li>Har row ka failure reason seedha toote hue credential ki taraf ishaara karta hai.</li>
<li>Inventory role, platform, software, reachability aur collection status track karti hai.</li>
<li>Management address ke liye stable loopbacks prefer karo; discovery ke baad devices ko sites assign karo.</li>
</ul></div>
`}};export{e as default};