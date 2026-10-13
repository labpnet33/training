var e={id:`ecmp-secondary-monitoring`,h:{en:`ECMP, secondary WAN and tunnel monitoring`,hi:`ECMP, secondary WAN aur tunnel monitoring`},body:{en:`
<p>One road to the sorting centre is risky. If a tree falls, the branch is cut off. Businesses therefore build more than one path. Prisma Access offers two ways: <b>ECMP</b> (use several tunnels at the same time) and <b>Secondary WAN</b> (keep a second tunnel ready for failure). A third tool, <b>tunnel monitoring</b>, helps to detect when a path is dead.</p>

<h3>ECMP load balancing</h3>
<p>ECMP means equal-cost multi-path. With ECMP the branch has up to <b>four tunnels</b> to the same remote network, and traffic is shared across them. This can add bandwidth because each tunnel carries part of the flows.</p>
<ul>
<li>ECMP requires <b>BGP</b>. All tunnels announce the same prefixes with the same cost.</li>
<li>Static routes and QoS are <b>not supported</b> with ECMP.</li>
<li>In SCM you turn on ECMP Load Balancing when you add the remote network. Panorama has an ECMP setting on the remote network too.</li>
<li>The branch CPE must also support equal-cost multipath for its side of the return traffic.</li>
</ul>

<h3>Secondary WAN</h3>
<p>Secondary WAN is a second IPsec tunnel over another ISP link. It is used for resilience, not for sharing load.</p>
<ul>
<li>It is <b>not supported for active/active ECMP</b>. Choose ECMP or secondary WAN for a site, not both together.</li>
<li>With static routes the docs state a failover time under 15 seconds.</li>
<li>With BGP the default hold time is 90 seconds (RFC 4271), so a silent failure takes longer to notice unless other detection helps.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="ECMP versus secondary WAN">
<rect x="20" y="20" width="290" height="190" rx="10" fill="#e2e8f0"/><text x="165" y="44" text-anchor="middle" class="svg-ink" font-size="14">ECMP (BGP, up to 4)</text>
<rect x="40" y="90" width="70" height="60" rx="8" fill="#bbf7d0"/><text x="75" y="125" text-anchor="middle" class="svg-ink" font-size="12">Branch</text>
<rect x="230" y="90" width="60" height="60" rx="8" fill="#bae6fd"/><text x="260" y="125" text-anchor="middle" class="svg-ink" font-size="12">Cloud</text>
<line x1="110" y1="100" x2="230" y2="100" stroke="#64748b" stroke-width="2"/><line x1="110" y1="115" x2="230" y2="115" stroke="#64748b" stroke-width="2"/><line x1="110" y1="130" x2="230" y2="130" stroke="#64748b" stroke-width="2"/><line x1="110" y1="145" x2="230" y2="145" stroke="#64748b" stroke-width="2"/>
<text x="165" y="185" text-anchor="middle" class="svg-muted" font-size="12">all active, flows shared</text>
<rect x="330" y="20" width="290" height="190" rx="10" fill="#e2e8f0"/><text x="475" y="44" text-anchor="middle" class="svg-ink" font-size="14">Secondary WAN</text>
<rect x="350" y="90" width="70" height="60" rx="8" fill="#bbf7d0"/><text x="385" y="125" text-anchor="middle" class="svg-ink" font-size="12">Branch</text>
<rect x="540" y="90" width="60" height="60" rx="8" fill="#bae6fd"/><text x="570" y="125" text-anchor="middle" class="svg-ink" font-size="12">Cloud</text>
<line x1="420" y1="105" x2="540" y2="105" stroke="#64748b" stroke-width="3"/><line x1="420" y1="135" x2="540" y2="135" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="475" y="185" text-anchor="middle" class="svg-muted" font-size="12">primary active, secondary standby</text>
</svg><p class="cap">ECMP shares load across tunnels. Secondary WAN waits as a backup.</p></div>

<h3>Tunnel monitoring</h3>
<p>An IPsec tunnel can look up while the far side cannot actually forward traffic. Tunnel monitoring sends probes through the tunnel to a destination IP and tracks the answer.</p>
<ul>
<li><b>On the branch PAN-OS firewall:</b> on the IPsec tunnel, enable Tunnel Monitor with a destination IP and a monitor profile. It <b>requires an IP address on the tunnel interface</b>. The profile can wait for recovery or fail over to another route.</li>
<li><b>On the Prisma Access side:</b> a Tunnel Monitor IP is used for the tunnel. The CPE needs a <b>static route to the Tunnel Monitor IP</b> through the tunnel, or the probe will not return.</li>
<li>In SCM the service connection form has a Tunnel Monitoring destination on the corporate network. For remote networks, Prisma Access supports tunnel monitoring through its own monitor address, and the branch answers it.</li>
</ul>
<p>The exact monitor address Prisma Access uses depends on your tenant. Read it from the status pages, as with the endpoint address.</p>

<div class="eg"><p><b>Worked example.</b> Branch Delhi has two ISP links. The admin wants more speed, so she uses ECMP with two BGP tunnels. Both announce 10.20.0.0/24 with the same attributes. Flows are hashed over the two tunnels. A second branch only needs a hot backup, so it uses a secondary WAN with static routes and expects a switch in under 15 seconds. She never sets both options on one site.</p></div>

<h3>Design checks before you enable them</h3>
<ol>
<li>Is BGP already stable on the primary tunnel? Add ECMP only after that.</li>
<li>Do the two ISP links have different endpoints and different failure domains?</li>
<li>Can the CPE do equal-cost hashing and does it keep sessions consistent?</li>
<li>Is QoS needed? If yes, you cannot use ECMP.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Enabling ECMP on a static-route site; expecting QoS to work with ECMP; turning on secondary WAN and ECMP together; forgetting the CPE route to the Tunnel Monitor IP so that monitoring shows the tunnel as dead.</p></div>
<div class="exam"><p><b>Exam trap.</b> ECMP: BGP only, up to 4 tunnels, no QoS, no static routes. Secondary WAN: not active/active ECMP. Static failover under 15 s; BGP hold time 90 s.</p></div>

<div class="scn"><h4>Flapping monitor after a new ISP link</h4><p>A branch added a second link and its tunnel monitor started to flap, causing needless failovers. The monitor probe was returning over the other link, because the CPE had no specific route to the Tunnel Monitor IP through the tunnel. A host route fixed the path and the flapping stopped.</p><p><b>Lesson:</b> probes must travel both ways through the same tunnel.</p></div>

<div class="iv"><p class="q">"ECMP or secondary WAN for a branch with two ISPs?"</p><p>ECMP when I want to use both links and the site runs BGP, accepting no QoS. Secondary WAN when I only need a standby and simplicity matters. They cannot be combined on a site. I also add tunnel monitoring so a silent failure is detected quickly.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ECMP: BGP, up to 4 tunnels, no QoS, no static routes.</li>
<li>Secondary WAN is standby, not active/active ECMP.</li>
<li>Static failover under 15 s; BGP hold default 90 s.</li>
<li>Tunnel monitor needs an IP on the tunnel interface and a CPE route to the monitor IP.</li>
<li>Do not enable ECMP and secondary WAN together.</li>
</ul></div>
`,hi:`
<p>Sorting centre tak ek hi road risky hai. Ek ped gir jaye to branch kat jaata hai. Isliye businesses ek se zyada path banate hain. Prisma Access do tareeke deta hai: <b>ECMP</b> (kai tunnels ek saath use karna) aur <b>Secondary WAN</b> (failure ke liye doosra tunnel ready rakhna). Teesra tool <b>tunnel monitoring</b> hai jo dead path detect karne mein madad karta hai.</p>

<h3>ECMP load balancing</h3>
<p>ECMP matlab equal-cost multi-path. ECMP mein branch ke same remote network tak up to <b>chaar tunnels</b> hote hain, aur traffic unke beech share hota hai. Isse bandwidth badh sakti hai kyunki har tunnel kuch flows carry karta hai.</p>
<ul>
<li>ECMP ko <b>BGP</b> chahiye. Saare tunnels same prefixes same cost ke saath announce karte hain.</li>
<li>Static routes aur QoS ECMP ke saath <b>supported nahi</b> hain.</li>
<li>SCM mein remote network add karte waqt ECMP Load Balancing on karte ho. Panorama mein bhi remote network par ECMP setting hai.</li>
<li>Branch CPE ko apni side ke return traffic ke liye bhi equal-cost multipath support karna chahiye.</li>
</ul>

<h3>Secondary WAN</h3>
<p>Secondary WAN doosre ISP link par doosra IPsec tunnel hai. Yeh resilience ke liye hai, load share karne ke liye nahi.</p>
<ul>
<li>Yeh <b>active/active ECMP ke liye supported nahi</b> hai. Ek site ke liye ECMP ya secondary WAN chuno, dono saath nahi.</li>
<li>Static routes ke saath docs failover time 15 seconds se kam batate hain.</li>
<li>BGP ke saath default hold time 90 seconds hai (RFC 4271), to silent failure notice hone mein zyada time lagta hai jab tak aur detection na ho.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="ECMP versus secondary WAN">
<rect x="20" y="20" width="290" height="190" rx="10" fill="#e2e8f0"/><text x="165" y="44" text-anchor="middle" class="svg-ink" font-size="14">ECMP (BGP, up to 4)</text>
<rect x="40" y="90" width="70" height="60" rx="8" fill="#bbf7d0"/><text x="75" y="125" text-anchor="middle" class="svg-ink" font-size="12">Branch</text>
<rect x="230" y="90" width="60" height="60" rx="8" fill="#bae6fd"/><text x="260" y="125" text-anchor="middle" class="svg-ink" font-size="12">Cloud</text>
<line x1="110" y1="100" x2="230" y2="100" stroke="#64748b" stroke-width="2"/><line x1="110" y1="115" x2="230" y2="115" stroke="#64748b" stroke-width="2"/><line x1="110" y1="130" x2="230" y2="130" stroke="#64748b" stroke-width="2"/><line x1="110" y1="145" x2="230" y2="145" stroke="#64748b" stroke-width="2"/>
<text x="165" y="185" text-anchor="middle" class="svg-muted" font-size="12">sab active, flows share</text>
<rect x="330" y="20" width="290" height="190" rx="10" fill="#e2e8f0"/><text x="475" y="44" text-anchor="middle" class="svg-ink" font-size="14">Secondary WAN</text>
<rect x="350" y="90" width="70" height="60" rx="8" fill="#bbf7d0"/><text x="385" y="125" text-anchor="middle" class="svg-ink" font-size="12">Branch</text>
<rect x="540" y="90" width="60" height="60" rx="8" fill="#bae6fd"/><text x="570" y="125" text-anchor="middle" class="svg-ink" font-size="12">Cloud</text>
<line x1="420" y1="105" x2="540" y2="105" stroke="#64748b" stroke-width="3"/><line x1="420" y1="135" x2="540" y2="135" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="475" y="185" text-anchor="middle" class="svg-muted" font-size="12">primary active, secondary standby</text>
</svg><p class="cap">ECMP tunnels ke beech load share karta hai. Secondary WAN backup ki tarah wait karta hai.</p></div>

<h3>Tunnel monitoring</h3>
<p>IPsec tunnel up dikh sakta hai jabki doosri side asal mein traffic forward nahi kar rahi. Tunnel monitoring tunnel ke through ek destination IP ko probes bhejta hai aur jawab track karta hai.</p>
<ul>
<li><b>Branch PAN-OS firewall par:</b> IPsec tunnel par Tunnel Monitor enable karo destination IP aur monitor profile ke saath. Ismein <b>tunnel interface par IP address zaroori</b> hai. Profile recovery ka wait kar sakta hai ya doosre route par fail over kar sakta hai.</li>
<li><b>Prisma Access side par:</b> tunnel ke liye Tunnel Monitor IP use hota hai. CPE ko tunnel ke through <b>Tunnel Monitor IP ka static route</b> chahiye, warna probe wapas nahi aayega.</li>
<li>SCM mein service connection form mein corporate network par Tunnel Monitoring destination hota hai. Remote networks ke liye Prisma Access apne monitor address se tunnel monitoring support karta hai, aur branch use jawab deta hai.</li>
</ul>
<p>Prisma Access jo exact monitor address use karta hai woh aapke tenant par depend karta hai. Endpoint address ki tarah ise bhi status pages se padho.</p>

<div class="eg"><p><b>Worked example.</b> Branch Delhi ke paas do ISP links hain. Admin ko speed chahiye, to woh do BGP tunnels ke saath ECMP use karti hai. Dono 10.20.0.0/24 same attributes ke saath announce karte hain. Flows do tunnels par hash hote hain. Doosre branch ko sirf hot backup chahiye, to woh static routes ke saath secondary WAN use karta hai aur 15 seconds se kam mein switch expect karta hai. Woh ek site par dono options kabhi nahi lagati.</p></div>

<h3>Enable karne se pehle design checks</h3>
<ol>
<li>Kya primary tunnel par BGP stable hai? ECMP uske baad hi add karo.</li>
<li>Kya do ISP links ke endpoints aur failure domains alag hain?</li>
<li>Kya CPE equal-cost hashing kar sakta hai aur sessions consistent rakhta hai?</li>
<li>QoS chahiye? To ECMP use nahi kar sakte.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Static-route site par ECMP enable karna; ECMP ke saath QoS ki ummeed; secondary WAN aur ECMP saath on karna; Tunnel Monitor IP ka CPE route bhoolna jisse monitoring tunnel ko dead dikhati hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> ECMP: sirf BGP, up to 4 tunnels, no QoS, no static routes. Secondary WAN: active/active ECMP nahi. Static failover 15 s se kam; BGP hold time 90 s.</p></div>

<div class="scn"><h4>Naye ISP link ke baad monitor flap</h4><p>Branch ne doosra link joda aur uska tunnel monitor flap karne laga, jisse faltu failovers hue. Monitor probe doosre link se wapas aa raha tha kyunki CPE ke paas Tunnel Monitor IP ka tunnel ke through specific route nahi tha. Host route lagane se path theek hua aur flapping ruk gayi.</p><p><b>Lesson:</b> probes ko dono taraf same tunnel se guzarna chahiye.</p></div>

<div class="iv"><p class="q">"Do ISPs wale branch ke liye ECMP ya secondary WAN?"</p><p>ECMP jab dono links use karne hon aur site BGP chalaye, QoS na milne ko accept karte hue. Secondary WAN jab sirf standby chahiye aur simplicity zaroori ho. Dono ek site par combine nahi hote. Main tunnel monitoring bhi lagata hoon taaki silent failure jaldi detect ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ECMP: BGP, up to 4 tunnels, no QoS, no static routes.</li>
<li>Secondary WAN standby hai, active/active ECMP nahi.</li>
<li>Static failover 15 s se kam; BGP hold default 90 s.</li>
<li>Tunnel monitor ko tunnel interface par IP aur monitor IP ka CPE route chahiye.</li>
<li>ECMP aur secondary WAN saath enable mat karo.</li>
</ul></div>
`}};export{e as default};