var e={id:`circuits-fabric`,h:{en:`Circuits, interfaces and fabric links: when the WAN or the VPN is down`,hi:`Circuits, interfaces aur fabric links: jab WAN ya VPN down ho`},body:{en:`
<p>If the ION is online, the next question is: is the road between sites open? In Prisma SD-WAN the road has two parts. The <b>circuit</b> is the physical or carrier link (a WAN interface with an address, DNS, a circuit label and a bandwidth). The <b>fabric link</b> is the encrypted VPN tunnel that the ION builds over that circuit to another site. A circuit can be fine while the tunnel is down, and a tunnel can show up while no path is usable. Layers 2 and 3 of the method separate these cases.</p>
<h3>Layer 2: the circuit and the interface</h3>
<p>Check, in this order:</p>
<ol>
<li><b>Link and speed.</b> Is the interface up? Speed and duplex should stay on Auto (the default); a hard-coded mismatch causes CRC errors and drops.</li>
<li><b>Address, gateway and DNS.</b> DHCP or static, with more than one DNS server on the interface.</li>
<li><b>Circuit label.</b> Every WAN-facing interface needs a circuit label. Without it no WAN paths are selected, even if tunnels show as up.</li>
<li><b>Category and "use this port for Internet".</b> A port without the right setting does not register as an internet circuit, so you see fewer circuits than you configured.</li>
<li><b>MTU.</b> Default 1500. An ION cellular interface defaults to 1428, and IPv6 needs at least 1280. A smaller MTU on the path than on the interface causes black-holed large packets.</li>
<li><b>Behind a NAT?</b> If the internet-facing interface sits behind a NAT device, configure the external NAT address and port (UDP 4500). Without them tunnels cannot build across the NAT.</li>
<li><b>Bandwidth.</b> Set circuit speed from the carrier's value, slightly (1 to 2 percent) lower so that QoS acts before the wire is full.</li>
</ol>
<h4>Reference configuration (not run in the simulator)</h4>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! From a remote session on the br-pune-01 ION; read-only commands</span>
dump interface status
dump waninterface summary
dump vpn summary Status=Down
dump standingalarms</pre>
<h4>Illustrative output, not captured from a device</h4>
<pre class="out">dump waninterface summary
WAN ID   Devices  PathLabel   Type       Cost  BWConfigMode  BWC enabled  Circuit-Label  LQM
1001     1        ISP-A       publicwan  128   manual        yes          ISP-A          enabled
1002     1        <span class="hl">(empty)</span>     publicwan  128   manual        yes          <span class="hl">(none)</span>       enabled</pre>
<p>The column names follow the documentation for <code>dump waninterface summary</code>; the values are made up for this story. The second line shows the classic fault: a WAN interface with no label. The best practices article describes the symptom exactly: the flow decision data shows no available WAN networks and all active and backup paths down, even though the tunnels show up. If the summary is empty or a circuit is missing, check the label and that it matches the category used by the path policy.</p>
<h3>Layer 3: the fabric link (VPN)</h3>
<p>The ION builds tunnels automatically between sites. Prisma SD-WAN detects failures with keepalives (and BFD on the MPLS underlay). In the default aggressive mode the keepalive interval is 1000 ms and the fail count is 3, which means a failure is detected in about 3 seconds. A fabric link is down for a reason in this list:</p>
<table class="cmp"><tr><th>Cause</th><th>How to recognise it</th><th>Fix</th></tr><tr><td>Circuit down or label missing</td><td>The interface is down, or no WAN path exists</td><td>Layer 2 checks</td></tr><tr><td>NAT without external address and port</td><td>The tunnel never establishes from a site behind NAT</td><td>Set external NAT address and UDP 4500</td></tr><tr><td>Private WAN network mismatch</td><td>MPLS tunnels do not form between branch and data center</td><td>The WAN network must match at both ends; separate networks for separate carriers</td></tr><tr><td>Firewall or ISP blocking the VPN</td><td>Tunnels flap or stay down on one circuit only</td><td>Test the other circuit; open the needed ports; ask the ISP</td></tr><tr><td>MTU or loss on the circuit</td><td>Tunnels flap under load; large packets fail</td><td>Check MTU and loss; compare circuits</td></tr><tr><td>Remote site offline</td><td>All tunnels to one site down</td><td>Check that site (chapter 2)</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="diagram">
<rect x="10" y="90" width="130" height="80" rx="10" fill="#bae6fd"/><text x="75" y="120" text-anchor="middle" class="svg-ink" font-size="12">br-pune-01</text><text x="75" y="138" text-anchor="middle" class="svg-muted" font-size="11">ION</text>
<rect x="500" y="90" width="130" height="80" rx="10" fill="#bbf7d0"/><text x="565" y="120" text-anchor="middle" class="svg-ink" font-size="12">dc-central</text><text x="565" y="138" text-anchor="middle" class="svg-muted" font-size="11">DC ION</text>
<rect x="200" y="30" width="240" height="40" rx="10" fill="#fde68a"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="12">ISP-A circuit (label ISP-A)</text>
<rect x="200" y="110" width="240" height="40" rx="10" fill="#fed7aa"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">ISP-B circuit (label ISP-B)</text>
<rect x="200" y="190" width="240" height="40" rx="10" fill="#ddd6fe"/><text x="320" y="215" text-anchor="middle" class="svg-ink" font-size="12">MPLS circuit (private WAN)</text>
<line x1="140" y1="110" x2="200" y2="50" stroke="#64748b" stroke-width="2"/><line x1="140" y1="130" x2="200" y2="130" stroke="#64748b" stroke-width="2"/><line x1="140" y1="150" x2="200" y2="210" stroke="#64748b" stroke-width="2"/>
<line x1="440" y1="50" x2="500" y2="110" stroke="#64748b" stroke-width="2"/><line x1="440" y1="130" x2="500" y2="130" stroke="#64748b" stroke-width="2"/><line x1="440" y1="210" x2="500" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="320" y="20" text-anchor="middle" class="svg-accent" font-size="12">Three circuits, up to three tunnels (fabric links)</text>
</svg><p class="cap">One tunnel per circuit pair. Compare circuits: if one tunnel is down and the others are up, the fault is on that circuit.</p></div>
<h4>Illustrative output, not captured from a device</h4>
<pre class="out">dump vpn summary Status=Down
VepID                Circuit-local  Circuit-Remote  Remote-Site  VpnType  Interface SrcIP        DstIP         Status  Active  FecEnabled
1691044549083002096  <span class="hl">ISP-B</span>          DC-CENTRAL-ISP  dc-central   public   2         198.51.100.20 203.0.113.9   <span class="hl">Down</span>    false   false</pre>
<p>The columns follow the documented format of <code>dump vpn summary</code>, which accepts options such as Status=Up or Down and RemoteSite. This made-up line says: the ISP-B tunnel to dc-central is down while others may be up, so compare circuits before blaming the data center. The standing alarm list can show a matching alarm (the documentation mentions a VPN peer unavailable alarm type).</p>
<div class="eg"><p><b>Worked example.</b> Ticket: br-chennai-03 lost its tunnel to dc-central over ISP-B; ISP-A still carries traffic. Scope: one circuit. Layer 2: interface is up with an address and DNS. Layer 3: dump vpn summary shows ISP-B down and ISP-A up. The audit log shows a change on Friday: the interface was moved behind a new NAT device, but the external NAT address and port were not set. The engineer adds the public address and UDP 4500 and the tunnel comes up.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Seeing "tunnel up" and stopping there; a missing circuit label is invisible at tunnel level. Hard-coding speed and duplex. Entering circuit bandwidth at the carrier headline value with no safety margin. Using one WAN network name for different MPLS carriers. Forgetting external NAT settings.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Tunnels are up but there are no WAN paths" means a missing circuit label (check dump waninterface summary). "A site behind NAT never builds tunnels" means external NAT address and port (UDP 4500). Default aggressive keepalive detects a failure in about 3 seconds (1000 ms times 3).</p></div>
<div class="scn"><h4>The unlabeled port</h4><p>A new Harbor Retail kiosk reached Claimed and Online and its tunnels showed tunnel up, yet every application was unreachable. The flow view showed no available WAN network. The installer had configured the internet port but never gave it a circuit label. Adding the label and re-saving the element made paths appear within a minute.</p><p><b>Lesson:</b> tunnel state is not path availability.</p></div>
<div class="iv"><p class="q">"A fabric link to the data center is down on one circuit only. How do you find the cause?"</p><p>I compare circuits first: if the other circuit is fine, the issue is on that circuit. Then I check the interface, label, DNS and MTU, the external NAT settings if the site is behind NAT, a matching private WAN network for MPLS, and the audit log for recent changes. dump vpn summary Status=Down shows which tunnel is down and dump standingalarms shows the alarm.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Circuit = WAN interface (label, IP, DNS, MTU, bandwidth); fabric link = tunnel over it.</li><li>Missing circuit label: tunnels may show up but no WAN paths exist.</li><li>Behind NAT: set external NAT address and UDP 4500.</li><li>Aggressive keepalive: 1000 ms, fail count 3, detection in about 3 seconds.</li><li>dump interface status, dump waninterface summary, dump vpn summary and dump standingalarms are the first four checks.</li></ul></div>
`,hi:`
<p>Agar ION online hai to agla sawal hai: kya sites ke beech ka raasta khula hai? Prisma SD-WAN mein raaste ke do hisse hain. <b>Circuit</b> physical ya carrier link hai (address, DNS, circuit label aur bandwidth wala WAN interface). <b>Fabric link</b> woh encrypted VPN tunnel hai jo ION us circuit par doosri site tak banata hai. Circuit theek ho sakta hai jabki tunnel down ho, aur tunnel up dikh sakta hai jabki koi path usable nahi. Method ki layers 2 aur 3 in cases ko alag karti hain.</p>
<h3>Layer 2: circuit aur interface</h3>
<p>Is order mein check karo:</p>
<ol>
<li><b>Link aur speed.</b> Kya interface up hai? Speed aur duplex Auto (default) par rehne chahiye; hard-coded mismatch CRC errors aur drops karta hai.</li>
<li><b>Address, gateway aur DNS.</b> DHCP ya static, interface par ek se zyada DNS server ke saath.</li>
<li><b>Circuit label.</b> Har WAN-facing interface ko circuit label chahiye. Uske bina tunnels up dikhne par bhi koi WAN paths select nahi hote.</li>
<li><b>Category aur "use this port for Internet".</b> Sahi setting ke bina port internet circuit ke roop mein register nahi hota, isliye aapko configure kiye se kam circuits dikhte hain.</li>
<li><b>MTU.</b> Default 1500. ION cellular interface ka default 1428 hai, aur IPv6 ko kam se kam 1280 chahiye. Path par interface se chhota MTU bade packets ko black-hole karta hai.</li>
<li><b>NAT ke peeche?</b> Agar internet-facing interface NAT device ke peeche hai to external NAT address aur port (UDP 4500) configure karo. Unke bina tunnels NAT paar nahi ban paate.</li>
<li><b>Bandwidth.</b> Circuit speed carrier ki value se set karo, thoda (1 se 2 percent) kam, taaki wire bharne se pehle QoS kaam kare.</li>
</ol>
<h4>Reference configuration (not run in the simulator)</h4>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! From a remote session on the br-pune-01 ION; read-only commands</span>
dump interface status
dump waninterface summary
dump vpn summary Status=Down
dump standingalarms</pre>
<h4>Illustrative output, not captured from a device</h4>
<pre class="out">dump waninterface summary
WAN ID   Devices  PathLabel   Type       Cost  BWConfigMode  BWC enabled  Circuit-Label  LQM
1001     1        ISP-A       publicwan  128   manual        yes          ISP-A          enabled
1002     1        <span class="hl">(empty)</span>     publicwan  128   manual        yes          <span class="hl">(none)</span>       enabled</pre>
<p>Column names <code>dump waninterface summary</code> ki documentation ke hisaab se hain; values is kahani ke liye banaye gaye hain. Doosri line classic fault dikhati hai: label ke bina WAN interface. Best practices article symptom ko bilkul yahi batata hai: flow decision data mein koi available WAN network nahi aur saare active aur backup paths down, jabki tunnels up dikhte hain. Agar summary khaali hai ya circuit missing hai to label check karo aur dekho ki woh path policy ki category se match karta hai.</p>
<h3>Layer 3: fabric link (VPN)</h3>
<p>ION sites ke beech tunnels apne aap banata hai. Prisma SD-WAN failures keepalives (aur MPLS underlay par BFD) se detect karta hai. Default aggressive mode mein keepalive interval 1000 ms aur fail count 3 hai, matlab failure lagbhag 3 second mein detect hota hai. Fabric link is list ki kisi wajah se down hota hai:</p>
<table class="cmp"><tr><th>Wajah</th><th>Kaise pehchanein</th><th>Fix</th></tr><tr><td>Circuit down ya label missing</td><td>Interface down hai, ya koi WAN path nahi</td><td>Layer 2 checks</td></tr><tr><td>External address aur port ke bina NAT</td><td>NAT ke peeche site se tunnel kabhi establish nahi hota</td><td>External NAT address aur UDP 4500 set karo</td></tr><tr><td>Private WAN network mismatch</td><td>MPLS tunnels branch aur data center ke beech nahi banti</td><td>WAN network dono ends par match hona chahiye; alag carriers ke liye alag networks</td></tr><tr><td>Firewall ya ISP VPN block kar raha hai</td><td>Sirf ek circuit par tunnels flap ya down</td><td>Doosra circuit test karo; zaroori ports kholo; ISP se poochho</td></tr><tr><td>Circuit par MTU ya loss</td><td>Load mein tunnels flap; bade packets fail</td><td>MTU aur loss check karo; circuits compare karo</td></tr><tr><td>Remote site offline</td><td>Ek site ke saare tunnels down</td><td>Us site ko check karo (chapter 2)</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="diagram">
<rect x="10" y="90" width="130" height="80" rx="10" fill="#bae6fd"/><text x="75" y="120" text-anchor="middle" class="svg-ink" font-size="12">br-pune-01</text><text x="75" y="138" text-anchor="middle" class="svg-muted" font-size="11">ION</text>
<rect x="500" y="90" width="130" height="80" rx="10" fill="#bbf7d0"/><text x="565" y="120" text-anchor="middle" class="svg-ink" font-size="12">dc-central</text><text x="565" y="138" text-anchor="middle" class="svg-muted" font-size="11">DC ION</text>
<rect x="200" y="30" width="240" height="40" rx="10" fill="#fde68a"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="12">ISP-A circuit (label ISP-A)</text>
<rect x="200" y="110" width="240" height="40" rx="10" fill="#fed7aa"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">ISP-B circuit (label ISP-B)</text>
<rect x="200" y="190" width="240" height="40" rx="10" fill="#ddd6fe"/><text x="320" y="215" text-anchor="middle" class="svg-ink" font-size="12">MPLS circuit (private WAN)</text>
<line x1="140" y1="110" x2="200" y2="50" stroke="#64748b" stroke-width="2"/><line x1="140" y1="130" x2="200" y2="130" stroke="#64748b" stroke-width="2"/><line x1="140" y1="150" x2="200" y2="210" stroke="#64748b" stroke-width="2"/>
<line x1="440" y1="50" x2="500" y2="110" stroke="#64748b" stroke-width="2"/><line x1="440" y1="130" x2="500" y2="130" stroke="#64748b" stroke-width="2"/><line x1="440" y1="210" x2="500" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="320" y="20" text-anchor="middle" class="svg-accent" font-size="12">Teen circuits, teen tunnels tak (fabric links)</text>
</svg><p class="cap">Har circuit pair ke liye ek tunnel. Circuits compare karo: ek tunnel down aur baaki up hon to fault us circuit par hai.</p></div>
<h4>Illustrative output, not captured from a device</h4>
<pre class="out">dump vpn summary Status=Down
VepID                Circuit-local  Circuit-Remote  Remote-Site  VpnType  Interface SrcIP        DstIP         Status  Active  FecEnabled
1691044549083002096  <span class="hl">ISP-B</span>          DC-CENTRAL-ISP  dc-central   public   2         198.51.100.20 203.0.113.9   <span class="hl">Down</span>    false   false</pre>
<p>Columns <code>dump vpn summary</code> ke documented format ko follow karte hain, jo Status=Up ya Down aur RemoteSite jaise options leta hai. Yeh banayi hui line kehti hai: dc-central ka ISP-B tunnel down hai jabki baaki up ho sakte hain, isliye data center ko blame karne se pehle circuits compare karo. Standing alarm list mein matching alarm dikh sakta hai (documentation VPN peer unavailable alarm type ka zikr karti hai).</p>
<div class="eg"><p><b>Worked example.</b> Ticket: br-chennai-03 ne ISP-B par dc-central ka tunnel kho diya; ISP-A abhi bhi traffic le jaata hai. Scope: ek circuit. Layer 2: interface up hai, address aur DNS ke saath. Layer 3: dump vpn summary ISP-B down aur ISP-A up dikhata hai. Audit log Friday ka change dikhata hai: interface ko naye NAT device ke peeche le jaaya gaya, par external NAT address aur port set nahi kiye gaye. Engineer public address aur UDP 4500 jodta hai aur tunnel up aa jaata hai.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> "Tunnel up" dekhkar ruk jaana; missing circuit label tunnel level par dikhta hi nahi. Speed aur duplex hard-code karna. Circuit bandwidth carrier ki headline value par bina safety margin ke daalna. Alag MPLS carriers ke liye ek hi WAN network name. External NAT settings bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Tunnels up hain par koi WAN paths nahi" ka matlab missing circuit label (dump waninterface summary check karo). "NAT ke peeche site kabhi tunnels nahi banati" ka matlab external NAT address aur port (UDP 4500). Default aggressive keepalive failure lagbhag 3 second mein detect karta hai (1000 ms guna 3).</p></div>
<div class="scn"><h4>Bina label wala port</h4><p>Harbor Retail ka naya kiosk Claimed and Online tak pahuncha aur uske tunnels up dikhe, phir bhi har application unreachable thi. Flow view mein koi available WAN network nahi tha. Installer ne internet port configure kiya tha par use kabhi circuit label nahi diya. Label jodne aur element dobara save karne se ek minute mein paths aa gaye.</p><p><b>Seekh:</b> tunnel state ka matlab path availability nahi.</p></div>
<div class="iv"><p class="q">"Data center ka fabric link sirf ek circuit par down hai. Wajah kaise dhoondte ho?"</p><p>Pehle circuits compare karta hoon: doosra circuit theek hai to issue us circuit par hai. Phir interface, label, DNS aur MTU, site NAT ke peeche ho to external NAT settings, MPLS ke liye matching private WAN network, aur recent changes ke liye audit log check karta hoon. dump vpn summary Status=Down dikhata hai kaun sa tunnel down hai aur dump standingalarms alarm dikhata hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Circuit = WAN interface (label, IP, DNS, MTU, bandwidth); fabric link = us par tunnel.</li><li>Circuit label missing: tunnels up dikh sakte hain par koi WAN path nahi hota.</li><li>NAT ke peeche: external NAT address aur UDP 4500 set karo.</li><li>Aggressive keepalive: 1000 ms, fail count 3, lagbhag 3 second mein detection.</li><li>dump interface status, dump waninterface summary, dump vpn summary aur dump standingalarms pehle chaar checks hain.</li></ul></div>
`}};export{e as default};