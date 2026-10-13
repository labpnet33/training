var e={id:`ion-online`,h:{en:`The ION that will not come online: claim, ZTP and controller connectivity`,hi:`Woh ION jo online nahi aata: claim, ZTP aur controller connectivity`},body:{en:`
<p>A new phone that cannot reach the mobile network cannot download anything, however well you set it up. An ION that cannot reach the controller is the same: the portal cannot configure it, and it cannot learn its site, circuits or policy. So this is layer 1 of the method, and the first rule is: <b>if the device is not online, do not touch the portal configuration</b>. The portal cannot reach a device that cannot reach the portal.</p>
<h3>How an ION comes online (zero touch)</h3>
<ol>
<li>The ION powers on. Its controller port (or port 1 or 2, or Internet 1, on models without a controller port) gets an address by DHCP by default.</li>
<li>It resolves the controller name with DNS and opens a secure connection on TCP port 443.</li>
<li>It appears in the portal: <b>Unclaimed and Offline</b> (physical device not yet talking), <b>Unclaimed and Online-Restricted</b> (virtual device talking but not claimed) or <b>Online</b> after authentication.</li>
<li>You <b>claim</b> it by serial number, assign it to a site, and the controller pushes the site configuration. During claiming the device briefly goes offline while customer-specific certificates download, and then shows <b>Claimed and Online</b>.</li>
</ol>
<p>This is called <b>zero-touch provisioning (ZTP)</b>. The knowledge base article on best practices says a device that does not show in the unclaimed list within roughly 15 to 60 minutes of being connected suggests a connectivity problem.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="diagram">
<rect x="10" y="90" width="120" height="70" rx="10" fill="#bae6fd"/><text x="70" y="120" text-anchor="middle" class="svg-ink" font-size="12">ION</text><text x="70" y="138" text-anchor="middle" class="svg-muted" font-size="11">controller port</text>
<rect x="170" y="90" width="110" height="70" rx="10" fill="#fde68a"/><text x="225" y="120" text-anchor="middle" class="svg-ink" font-size="12">DHCP, DNS</text><text x="225" y="138" text-anchor="middle" class="svg-muted" font-size="11">address, name</text>
<rect x="320" y="90" width="110" height="70" rx="10" fill="#fed7aa"/><text x="375" y="120" text-anchor="middle" class="svg-ink" font-size="12">Site firewall</text><text x="375" y="138" text-anchor="middle" class="svg-muted" font-size="11">TCP 443 out</text>
<rect x="470" y="90" width="160" height="70" rx="10" fill="#ddd6fe"/><text x="550" y="120" text-anchor="middle" class="svg-ink" font-size="12">Controller</text><text x="550" y="138" text-anchor="middle" class="svg-muted" font-size="11">claim, config</text>
<line x1="130" y1="125" x2="170" y2="125" stroke="#64748b" stroke-width="2"/><line x1="280" y1="125" x2="320" y2="125" stroke="#64748b" stroke-width="2"/><line x1="430" y1="125" x2="470" y2="125" stroke="#64748b" stroke-width="2"/>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="13">Any break on this path keeps the ION Unclaimed and Offline</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">Check in order: link and power, DHCP or static IP, DNS, port 443, proxy or captive portal</text>
</svg><p class="cap">The ION needs an address, a DNS answer and an open outbound TCP 443 path to the controller.</p></div>
<h3>Symptoms and likely causes</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr><tr><td>Never appears in the portal</td><td>Cable in the wrong port, no DHCP, no internet, DNS failure, firewall or proxy, captive portal</td><td>Console CLI: interface status, address, ping, DNS, port 443</td></tr><tr><td>Appears Online but cannot take configuration</td><td>Not claimed or not assigned to a site</td><td>Claim by serial number, assign to site</td></tr><tr><td>Claimed but site stays in Analytics or Disabled behaviour</td><td>Site not in Control mode</td><td>Check the site and element mode</td></tr><tr><td>Online, then offline after config</td><td>A configuration change broke the controller path (wrong IP, DNS or gateway on the WAN interface)</td><td>Audit log, interface settings</td></tr></table>
<h3>The CLI sequence from the console</h3>
<p>Palo Alto Networks gives a knowledge base procedure for controller connectivity. The device must be reached on its console (or AUX port), because remote portal access does not work when it is offline. If DHCP is not available, the documentation shows how to set a static address, gateway and DNS from the console on the controller or internet port; once the device is claimed the controller overrides further local changes.</p>
<h4>Reference configuration (not run in the simulator)</h4>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! Run on the ION console at br-pune-01; command names from the Palo Alto Networks knowledge base</span>
dump overview
dump controller status
debug controller reachability &lt;interface&gt;
ping &lt;src_interface&gt; &lt;internet_ip&gt;
nslookup locator.cgnx.net
tcpping &lt;src_interface&gt; locator.cgnx.net:443
tcpdump &lt;interface&gt; args="host &lt;locator_ip&gt; and port 443" show
file view log mrl_agent</pre>
<p>Read it as a story: <code>dump overview</code> and <code>dump controller status</code> say what the device thinks; <code>ping</code> from the right interface proves basic internet reachability; <code>nslookup</code> proves DNS; <code>tcpping</code> to port 443 proves the firewall allows the controller connection; <code>tcpdump</code> shows the packets; and the <code>mrl_agent</code> log shows what the controller agent itself reports. Use the CLI help for exact options in your release.</p>
<h4>Illustrative output, not captured from a device</h4>
<pre class="out">dump controller status
Controller Connection            : <span class="hl">Connected</span>
Number of Active Connections     :  4
Logs_live   tcp  0  0 198.51.100.10:40785  203.0.113.5:443  ESTABLISHED
flows_live  tcp  0  0 198.51.100.10:34105  203.0.113.5:443  ESTABLISHED
mrl         tcp  0  0 198.51.100.10:52609  203.0.113.5:443  ESTABLISHED
stats_live  tcp  0  0 198.51.100.10:52777  203.0.113.5:443  ESTABLISHED</pre>
<p>The format follows the documentation example. The command reports the state as Connected, partially connected or not connected. Connected with four established connections is healthy; partially connected means some of the controller connections are missing, often a firewall or proxy interfering with some flows; not connected means none.</p>
<h3>Firewall, NAT and other site gotchas</h3>
<ul>
<li>Upstream firewalls must allow outbound TCP 443 to the controller. The best practices article also mentions UDP 4500 for VPN tunnels through NAT.</li>
<li>DNS: configure more than one DNS server on the interface. DNS is UDP-based, and missing DNS on a WAN interface blocks controller communication.</li>
<li>Public WAN interfaces are protected by default and block inbound connections; only outbound connections are needed for the controller.</li>
<li>Captive portals, SSL inspection and proxies at the site can break the controller connection; ask the site network team.</li>
<li>Hardware: if the device does not power on, check the power LED, cables and supply; if that fails, the next step is an RMA request.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Ticket: br-delhi-02's new ION is not in the portal after two hours. Scope: one site. LEDs are normal. From the console, <code>dump controller status</code> shows not connected, <code>ping</code> to a public address works, <code>nslookup locator.cgnx.net</code> fails. The site's DHCP gave a DNS server that is internal and unreachable from this VLAN. The site engineer adds a public DNS server on the interface as a second server, DNS works, <code>tcpping</code> to port 443 succeeds, and the ION appears as Unclaimed and Offline then Online within minutes. The engineer claims it and assigns it to br-delhi-02.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Troubleshooting the portal configuration of an offline device. Using the wrong source interface for ping and tcpping, which tests a different path. Forgetting that the site must be in Control mode to forward traffic and apply policy. Leaving a console static IP in place and then wondering why the controller overrides it after claiming.</p></div>
<div class="exam"><p><b>Exam trap.</b> Unclaimed and Offline means the device never reached the controller: check power, cable, DHCP, DNS and TCP 443. Online but not claimed means it cannot get your configuration: claim it and assign it to a site. A single DNS server or a firewall blocking port 443 are classic causes.</p></div>
<div class="scn"><h4>The captive portal in the shop</h4><p>A Harbor Retail kiosk site plugged the ION into the same guest network as the shop Wi-Fi. The network gave an address, but a captive portal intercepted the controller connection and the device stayed Unclaimed and Offline for two days. Moving the controller port to the business VLAN with direct internet access brought it online in ten minutes.</p><p><b>Lesson:</b> an address is not the same as a path to the controller.</p></div>
<div class="iv"><p class="q">"A new ION does not appear in the portal. What do you check?"</p><p>Power and cabling first, that the cable is in the controller port, then DHCP or a static address, DNS resolution of the controller name, and outbound TCP 443 through firewalls, proxies and captive portals. From the console I use dump controller status, ping and tcpping from the right interface, and nslookup. After it appears I claim it by serial number and assign it to a site in Control mode.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>An offline ION cannot be configured from the portal; fix the site network first.</li><li>States: Unclaimed and Offline, Unclaimed and Online-Restricted (virtual), Online, then Claimed and Online.</li><li>ION needs an address, DNS and outbound TCP 443; UDP 4500 matters for VPN through NAT.</li><li>Console CLI: dump overview, dump controller status, debug controller reachability, ping, nslookup, tcpping, tcpdump.</li><li>After claiming, assign to a site in Control mode; the controller overrides local console config.</li></ul></div>
`,hi:`
<p>Naya phone jo mobile network tak nahi pahunch sakta, kuch download nahi kar sakta, chahe aap use kitni achhi tarah set up karo. Controller tak na pahunchne wala ION bhi aisa hi hai: portal use configure nahi kar sakta, aur woh apni site, circuits ya policy seekh nahi sakta. Isliye yeh method ki layer 1 hai, aur pehla rule: <b>agar device online nahi hai to portal configuration ko mat chhuo</b>. Portal us device tak nahi pahunch sakta jo portal tak nahi pahunch sakta.</p>
<h3>ION kaise online aata hai (zero touch)</h3>
<ol>
<li>ION power on hota hai. Uska controller port (ya jin models mein controller port nahi, wahan port 1 ya 2, ya Internet 1) default se DHCP se address leta hai.</li>
<li>Woh DNS se controller name resolve karta hai aur TCP port 443 par secure connection kholta hai.</li>
<li>Woh portal mein dikhta hai: <b>Unclaimed and Offline</b> (physical device abhi baat nahi kar raha), <b>Unclaimed and Online-Restricted</b> (virtual device baat kar raha hai par claim nahi hua) ya authentication ke baad <b>Online</b>.</li>
<li>Aap use serial number se <b>claim</b> karte ho, site assign karte ho, aur controller site configuration push karta hai. Claiming ke dauran device kuch der ke liye offline jaata hai jab customer-specific certificates download hote hain, phir <b>Claimed and Online</b> dikhata hai.</li>
</ol>
<p>Isse <b>zero-touch provisioning (ZTP)</b> kehte hain. Best practices knowledge base article kehta hai ki connect karne ke lagbhag 15 se 60 minute mein device unclaimed list mein na dikhe to connectivity problem ka sanket hai.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="diagram">
<rect x="10" y="90" width="120" height="70" rx="10" fill="#bae6fd"/><text x="70" y="120" text-anchor="middle" class="svg-ink" font-size="12">ION</text><text x="70" y="138" text-anchor="middle" class="svg-muted" font-size="11">controller port</text>
<rect x="170" y="90" width="110" height="70" rx="10" fill="#fde68a"/><text x="225" y="120" text-anchor="middle" class="svg-ink" font-size="12">DHCP, DNS</text><text x="225" y="138" text-anchor="middle" class="svg-muted" font-size="11">address, name</text>
<rect x="320" y="90" width="110" height="70" rx="10" fill="#fed7aa"/><text x="375" y="120" text-anchor="middle" class="svg-ink" font-size="12">Site firewall</text><text x="375" y="138" text-anchor="middle" class="svg-muted" font-size="11">TCP 443 out</text>
<rect x="470" y="90" width="160" height="70" rx="10" fill="#ddd6fe"/><text x="550" y="120" text-anchor="middle" class="svg-ink" font-size="12">Controller</text><text x="550" y="138" text-anchor="middle" class="svg-muted" font-size="11">claim, config</text>
<line x1="130" y1="125" x2="170" y2="125" stroke="#64748b" stroke-width="2"/><line x1="280" y1="125" x2="320" y2="125" stroke="#64748b" stroke-width="2"/><line x1="430" y1="125" x2="470" y2="125" stroke="#64748b" stroke-width="2"/>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="13">Is path mein koi bhi toot ION ko Unclaimed and Offline rakhta hai</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">Order mein check: link aur power, DHCP ya static IP, DNS, port 443, proxy ya captive portal</text>
</svg><p class="cap">ION ko address, DNS jawab aur controller tak khula outbound TCP 443 path chahiye.</p></div>
<h3>Symptoms aur sambhavit causes</h3>
<table class="cmp"><tr><th>Symptom</th><th>Sambhavit wajah</th><th>Check</th></tr><tr><td>Portal mein kabhi nahi dikhta</td><td>Cable galat port mein, DHCP nahi, internet nahi, DNS failure, firewall ya proxy, captive portal</td><td>Console CLI: interface status, address, ping, DNS, port 443</td></tr><tr><td>Online dikhta hai par configuration nahi leta</td><td>Claim nahi hua ya site assign nahi hui</td><td>Serial number se claim, site assign</td></tr><tr><td>Claimed par site Analytics ya Disabled behaviour mein</td><td>Site Control mode mein nahi</td><td>Site aur element mode check karo</td></tr><tr><td>Online, phir config ke baad offline</td><td>Configuration change ne controller path tod diya (WAN interface par galat IP, DNS ya gateway)</td><td>Audit log, interface settings</td></tr></table>
<h3>Console se CLI sequence</h3>
<p>Palo Alto Networks controller connectivity ke liye knowledge base procedure deta hai. Device ko console (ya AUX port) par reach karna hoga, kyunki offline hone par remote portal access kaam nahi karta. Agar DHCP available nahi hai to documentation console se controller ya internet port par static address, gateway aur DNS set karna dikhati hai; device claim hone ke baad controller aage ke local changes override kar deta hai.</p>
<h4>Reference configuration (not run in the simulator)</h4>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! Run on the ION console at br-pune-01; command names from the Palo Alto Networks knowledge base</span>
dump overview
dump controller status
debug controller reachability &lt;interface&gt;
ping &lt;src_interface&gt; &lt;internet_ip&gt;
nslookup locator.cgnx.net
tcpping &lt;src_interface&gt; locator.cgnx.net:443
tcpdump &lt;interface&gt; args="host &lt;locator_ip&gt; and port 443" show
file view log mrl_agent</pre>
<p>Ise kahani ki tarah padho: <code>dump overview</code> aur <code>dump controller status</code> batate hain device kya sochta hai; sahi interface se <code>ping</code> basic internet reachability prove karta hai; <code>nslookup</code> DNS prove karta hai; port 443 par <code>tcpping</code> prove karta hai ki firewall controller connection allow karta hai; <code>tcpdump</code> packets dikhata hai; aur <code>mrl_agent</code> log dikhata hai ki controller agent khud kya report karta hai. Apni release ke exact options ke liye CLI help use karo.</p>
<h4>Illustrative output, not captured from a device</h4>
<pre class="out">dump controller status
Controller Connection            : <span class="hl">Connected</span>
Number of Active Connections     :  4
Logs_live   tcp  0  0 198.51.100.10:40785  203.0.113.5:443  ESTABLISHED
flows_live  tcp  0  0 198.51.100.10:34105  203.0.113.5:443  ESTABLISHED
mrl         tcp  0  0 198.51.100.10:52609  203.0.113.5:443  ESTABLISHED
stats_live  tcp  0  0 198.51.100.10:52777  203.0.113.5:443  ESTABLISHED</pre>
<p>Format documentation example ko follow karta hai. Command state ko Connected, partially connected ya not connected report karta hai. Chaar established connections ke saath Connected healthy hai; partially connected ka matlab kuch controller connections missing hain, aksar firewall ya proxy kuch flows mein dakhal de raha hota hai; not connected ka matlab ek bhi nahi.</p>
<h3>Firewall, NAT aur site ki doosri baatein</h3>
<ul>
<li>Upstream firewalls ko controller tak outbound TCP 443 allow karna chahiye. Best practices article NAT ke peeche VPN tunnels ke liye UDP 4500 ka bhi zikr karta hai.</li>
<li>DNS: interface par ek se zyada DNS server configure karo. DNS UDP-based hai, aur WAN interface par DNS na ho to controller communication block hota hai.</li>
<li>Public WAN interfaces default se protected hain aur inbound connections block karte hain; controller ke liye sirf outbound connections chahiye.</li>
<li>Site par captive portals, SSL inspection aur proxies controller connection tod sakte hain; site network team se poochho.</li>
<li>Hardware: agar device power on nahi hota to power LED, cables aur supply check karo; woh fail ho to agla step RMA request hai.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Ticket: br-delhi-02 ka naya ION do ghante baad bhi portal mein nahi hai. Scope: ek site. LEDs normal hain. Console se <code>dump controller status</code> not connected dikhata hai, public address par <code>ping</code> chalta hai, <code>nslookup locator.cgnx.net</code> fail hota hai. Site ke DHCP ne ek internal DNS server diya hai jo is VLAN se reachable nahi. Site engineer interface par doosre server ke roop mein public DNS server jodta hai, DNS chalta hai, port 443 par <code>tcpping</code> succeed hota hai, aur ION kuch minutes mein Unclaimed and Offline phir Online dikhta hai. Engineer use claim karke br-delhi-02 par assign karta hai.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Offline device ki portal configuration troubleshoot karna. ping aur tcpping ke liye galat source interface use karna, jo alag path test karta hai. Bhoolna ki traffic forward karne aur policy lagane ke liye site Control mode mein honi chahiye. Console static IP chhod dena aur phir sochna ki claim ke baad controller use kyun override karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Unclaimed and Offline ka matlab device controller tak kabhi nahi pahuncha: power, cable, DHCP, DNS aur TCP 443 check karo. Online par claim nahi hua ka matlab use aapki configuration nahi mil sakti: claim karo aur site assign karo. Ek hi DNS server ya port 443 block karne wala firewall classic causes hain.</p></div>
<div class="scn"><h4>Dukaan ka captive portal</h4><p>Harbor Retail ke ek kiosk site ne ION ko dukaan ke Wi-Fi wale guest network mein lagaya. Network ne address diya, par captive portal ne controller connection intercept kiya aur device do din tak Unclaimed and Offline raha. Controller port ko direct internet wale business VLAN mein le jaane se woh das minute mein online aa gaya.</p><p><b>Seekh:</b> address ka matlab controller tak path nahi hota.</p></div>
<div class="iv"><p class="q">"Naya ION portal mein nahi dikh raha. Kya check karoge?"</p><p>Pehle power aur cabling, ki cable controller port mein hai, phir DHCP ya static address, controller name ka DNS resolution, aur firewalls, proxies aur captive portals se outbound TCP 443. Console se main dump controller status, sahi interface se ping aur tcpping, aur nslookup use karta hoon. Dikhne ke baad use serial number se claim karke Control mode wali site par assign karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Offline ION portal se configure nahi ho sakta; pehle site network theek karo.</li><li>States: Unclaimed and Offline, Unclaimed and Online-Restricted (virtual), Online, phir Claimed and Online.</li><li>ION ko address, DNS aur outbound TCP 443 chahiye; NAT ke peeche VPN ke liye UDP 4500 matter karta hai.</li><li>Console CLI: dump overview, dump controller status, debug controller reachability, ping, nslookup, tcpping, tcpdump.</li><li>Claim ke baad Control mode wali site par assign karo; controller local console config override karta hai.</li></ul></div>
`}};export{e as default};