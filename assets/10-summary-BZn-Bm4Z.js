var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with a branch and a locked van. You now know how to build the van, hand over the keys, choose the road signs, add a second road, watch the traffic and repair a breakdown. This last chapter pulls everything together so you can revise quickly before the lab or the interview.</p>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain what a remote network, a CPE, a location, a compute location and a termination node are.</li>
<li>I can find the Service Endpoint Address in Network Details and use it as the branch peer IP.</li>
<li>I can list the IKE version options and the supported IKE and IPsec algorithms.</li>
<li>I can build the seven branch PAN-OS items: IKE crypto, IPsec crypto, IKE gateway, tunnel interface with zone and virtual router, IPsec tunnel, route, policy.</li>
<li>I can choose static or BGP, and fill Peer AS, Peer IP, Local IP, MRAI and the summarise options.</li>
<li>I know ECMP and secondary WAN rules, and what tunnel monitoring needs.</li>
<li>I can explain the aggregate bandwidth model and the 6.0 per-site change.</li>
<li>I can verify with show vpn commands and the status pages.</li>
<li>I can diagnose peer IP, PSK, crypto, proxy ID, route, overlap and not-pushed faults.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>CPE</dt><dd>The branch device that ends the tunnel.</dd>
<dt>Service Endpoint Address</dt><dd>Cloud-side address (FQDN or IP) of the termination node; the branch peer IP.</dd>
<dt>Infrastructure subnet</dt><dd>Customer-supplied subnet for the Prisma Access backbone. Lab: 10.255.0.0/24.</dd>
<dt>Infrastructure BGP AS</dt><dd>Private AS of the cloud side. Default 65534.</dd>
<dt>MRAI</dt><dd>Minimum route advertisement interval, 1 to 600 seconds, default 30.</dd>
<dt>ECMP</dt><dd>Equal-cost multi-path: up to 4 BGP tunnels sharing load.</dd>
<dt>Secondary WAN</dt><dd>Standby tunnel on another link.</dd>
<dt>Aggregate bandwidth</dt><dd>Bandwidth allocated per compute location, minimum 50 Mbps.</dd>
<dt>Config Status</dt><dd>In sync or Out of sync; shows whether the push reached the cloud.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>IKE versions</td><td>IKEv1 Only, IKEv2 Only, IKEv2 Preferred</td></tr>
<tr><td>Lifetimes</td><td>IKE 8 hours, IPsec 1 hour (defaults)</td></tr>
<tr><td>DH groups</td><td>1, 2, 5, 14, 19, 20</td></tr>
<tr><td>Best ESP</td><td>AES-256-GCM</td></tr>
<tr><td>Node capacity</td><td>Up to 1,000 Mbps</td></tr>
<tr><td>BGP TTL</td><td>8</td></tr>
<tr><td>Local IP count</td><td>Up to 250 per remote network</td></tr>
<tr><td>ECMP</td><td>BGP only, up to 4 tunnels, no QoS, no static</td></tr>
<tr><td>Secondary WAN</td><td>Not active/active ECMP; static failover under 15 s</td></tr>
<tr><td>BGP hold</td><td>90 s default</td></tr>
<tr><td>Bandwidth</td><td>Aggregate minimum 50 Mbps; move to aggregate permanent in Panorama</td></tr>
<tr><td>BGP Warning</td><td>No update for more than 8 minutes</td></tr>
<tr><td>Scale (5.2)</td><td>25,000 remote networks, 50,000 IKE gateways</td></tr>
</table>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c"># branch firewall</span>
show vpn ike-sa gateway PA-GW
show vpn ipsec-sa tunnel PA-TUN
show vpn tunnel
show vpn flow
test vpn ike-sa gateway PA-GW
test vpn ipsec-sa tunnel PA-TUN
clear vpn ike-sa gateway PA-GW
clear vpn ipsec-sa tunnel PA-TUN
debug ike global on
debug less mp-log ikemgr.log
debug ike pcap on
debug ike stat</pre>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module recap">
<rect x="10" y="40" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="65" y="76" text-anchor="middle" class="svg-ink" font-size="12">Plan</text>
<rect x="140" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="195" y="76" text-anchor="middle" class="svg-ink" font-size="12">Build</text>
<rect x="270" y="40" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="325" y="76" text-anchor="middle" class="svg-ink" font-size="12">Route</text>
<rect x="400" y="40" width="110" height="60" rx="8" fill="#fde68a"/><text x="455" y="76" text-anchor="middle" class="svg-ink" font-size="12">Verify</text>
<rect x="530" y="40" width="100" height="60" rx="8" fill="#fed7aa"/><text x="580" y="76" text-anchor="middle" class="svg-ink" font-size="12">Fix</text>
<line x1="120" y1="70" x2="140" y2="70" stroke="#64748b" stroke-width="2"/><line x1="250" y1="70" x2="270" y2="70" stroke="#64748b" stroke-width="2"/><line x1="380" y1="70" x2="400" y2="70" stroke="#64748b" stroke-width="2"/><line x1="510" y1="70" x2="530" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Plan, build, route, verify, fix. Every branch follows this loop.</p></div>

<div class="eg"><p><b>Worked example.</b> Your own mini-test: BR-FW 198.51.100.10, endpoint 203.0.113.101, LAN 10.20.0.0/24, BGP AS 65001, tunnel.1 10.254.1.2/32, Prisma Local IP 10.254.1.1. Say aloud what you add on each side, in which order, and which two outputs prove success.</p></div>

<div class="warn"><p><b>Last reminders.</b> The lab PSK NkPrisma2026 is for the lab only. Never reuse it. Do not teach or assume details that the product documents do not state, such as exact IPsec ports for cloud endpoints; check the current Palo Alto Networks documentation for your release.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam is the Security Service Edge Engineer. Remote networks sit in the Planning and Deployment domain, and tunnel faults in the Troubleshooting domain. Prisma Browser is on the exam but outside this track.</p></div>

<div class="scn"><h4>Handover to the night shift</h4><p>An engineer finished a branch at 6 pm and left a note: tunnel up, BGP Established, Config Status In sync, tested from PC-BR, PSK stored in the vault. At 2 am the on-call engineer used that note to rule out three causes in one minute and went straight to a failed ISP link.</p><p><b>Lesson:</b> a good verification record saves the next person time.</p></div>

<div class="iv"><p class="q">"Summarise how you onboard a branch to Prisma Access."</p><p>Plan non-overlapping addresses and a location, create the remote network with node, tunnel and routing, push, read the Service Endpoint Address, build the branch objects, choose static or BGP, verify with show vpn and the status pages, and document the result. Add ECMP or secondary WAN and bandwidth as the site needs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Remote network equals branch tunnel to a cloud termination node.</li>
<li>Seven branch objects; zone and virtual router are easy to forget.</li>
<li>BGP uses TTL 8, MRAI 30 s default, and infrastructure AS 65534.</li>
<li>ECMP and secondary WAN are different tools and not combined.</li>
<li>Verify in order: ike-sa, ipsec-sa, flow, routes, cloud page, host test.</li>
</ul></div>
`,hi:`
<p>Aapne is module ki shuruaat ek branch aur locked van se ki thi. Ab aap jaante ho van kaise banti hai, keys kaise di jaati hain, road signs kaise chunte hain, doosri road kaise jodte hain, traffic kaise dekhte hain aur breakdown kaise repair karte hain. Yeh aakhri chapter sab kuch jodta hai taaki lab ya interview se pehle jaldi revise kar sako.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Main samjha sakta hoon ki remote network, CPE, location, compute location aur termination node kya hain.</li>
<li>Main Network Details mein Service Endpoint Address dhoondh kar branch peer IP ki tarah use kar sakta hoon.</li>
<li>Main IKE version options aur supported IKE aur IPsec algorithms list kar sakta hoon.</li>
<li>Main branch PAN-OS ke saat items bana sakta hoon: IKE crypto, IPsec crypto, IKE gateway, zone aur virtual router ke saath tunnel interface, IPsec tunnel, route, policy.</li>
<li>Main static ya BGP choose kar sakta hoon, aur Peer AS, Peer IP, Local IP, MRAI aur summarise options bhar sakta hoon.</li>
<li>Main ECMP aur secondary WAN ke rules aur tunnel monitoring ki zaroorat jaanta hoon.</li>
<li>Main aggregate bandwidth model aur 6.0 per-site change samjha sakta hoon.</li>
<li>Main show vpn commands aur status pages se verify kar sakta hoon.</li>
<li>Main peer IP, PSK, crypto, proxy ID, route, overlap aur not-pushed faults diagnose kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>CPE</dt><dd>Branch device jo tunnel end karta hai.</dd>
<dt>Service Endpoint Address</dt><dd>Termination node ka cloud-side address (FQDN ya IP); branch ka peer IP.</dd>
<dt>Infrastructure subnet</dt><dd>Prisma Access backbone ke liye customer-supplied subnet. Lab: 10.255.0.0/24.</dd>
<dt>Infrastructure BGP AS</dt><dd>Cloud side ka private AS. Default 65534.</dd>
<dt>MRAI</dt><dd>Minimum route advertisement interval, 1 se 600 seconds, default 30.</dd>
<dt>ECMP</dt><dd>Equal-cost multi-path: load share karte up to 4 BGP tunnels.</dd>
<dt>Secondary WAN</dt><dd>Doosre link par standby tunnel.</dd>
<dt>Aggregate bandwidth</dt><dd>Compute location ko allocate hui bandwidth, minimum 50 Mbps.</dd>
<dt>Config Status</dt><dd>In sync ya Out of sync; batata hai push cloud tak pahuncha ya nahi.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>IKE versions</td><td>IKEv1 Only, IKEv2 Only, IKEv2 Preferred</td></tr>
<tr><td>Lifetimes</td><td>IKE 8 hours, IPsec 1 hour (defaults)</td></tr>
<tr><td>DH groups</td><td>1, 2, 5, 14, 19, 20</td></tr>
<tr><td>Best ESP</td><td>AES-256-GCM</td></tr>
<tr><td>Node capacity</td><td>Up to 1,000 Mbps</td></tr>
<tr><td>BGP TTL</td><td>8</td></tr>
<tr><td>Local IP count</td><td>Ek remote network par 250 tak</td></tr>
<tr><td>ECMP</td><td>Sirf BGP, up to 4 tunnels, no QoS, no static</td></tr>
<tr><td>Secondary WAN</td><td>Active/active ECMP nahi; static failover 15 s se kam</td></tr>
<tr><td>BGP hold</td><td>Default 90 s</td></tr>
<tr><td>Bandwidth</td><td>Aggregate minimum 50 Mbps; Panorama mein aggregate par move permanent</td></tr>
<tr><td>BGP Warning</td><td>8 minutes se zyada update nahi</td></tr>
<tr><td>Scale (5.2)</td><td>25,000 remote networks, 50,000 IKE gateways</td></tr>
</table>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c"># branch firewall</span>
show vpn ike-sa gateway PA-GW
show vpn ipsec-sa tunnel PA-TUN
show vpn tunnel
show vpn flow
test vpn ike-sa gateway PA-GW
test vpn ipsec-sa tunnel PA-TUN
clear vpn ike-sa gateway PA-GW
clear vpn ipsec-sa tunnel PA-TUN
debug ike global on
debug less mp-log ikemgr.log
debug ike pcap on
debug ike stat</pre>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module recap">
<rect x="10" y="40" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="65" y="76" text-anchor="middle" class="svg-ink" font-size="12">Plan</text>
<rect x="140" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="195" y="76" text-anchor="middle" class="svg-ink" font-size="12">Build</text>
<rect x="270" y="40" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="325" y="76" text-anchor="middle" class="svg-ink" font-size="12">Route</text>
<rect x="400" y="40" width="110" height="60" rx="8" fill="#fde68a"/><text x="455" y="76" text-anchor="middle" class="svg-ink" font-size="12">Verify</text>
<rect x="530" y="40" width="100" height="60" rx="8" fill="#fed7aa"/><text x="580" y="76" text-anchor="middle" class="svg-ink" font-size="12">Fix</text>
<line x1="120" y1="70" x2="140" y2="70" stroke="#64748b" stroke-width="2"/><line x1="250" y1="70" x2="270" y2="70" stroke="#64748b" stroke-width="2"/><line x1="380" y1="70" x2="400" y2="70" stroke="#64748b" stroke-width="2"/><line x1="510" y1="70" x2="530" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Plan, build, route, verify, fix. Har branch yahi loop follow karta hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Apna mini-test: BR-FW 198.51.100.10, endpoint 203.0.113.101, LAN 10.20.0.0/24, BGP AS 65001, tunnel.1 10.254.1.2/32, Prisma Local IP 10.254.1.1. Zor se bolo ki har side par kya add karoge, kis order mein, aur kaun se do outputs success prove karte hain.</p></div>

<div class="warn"><p><b>Aakhri reminders.</b> Lab PSK NkPrisma2026 sirf lab ke liye hai. Kabhi reuse mat karo. Aisi details mat padhao ya assume karo jo product documents state nahi karte, jaise cloud endpoints ke exact IPsec ports; apni release ke liye current Palo Alto Networks documentation check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam Security Service Edge Engineer hai. Remote networks Planning and Deployment domain mein aate hain, aur tunnel faults Troubleshooting domain mein. Prisma Browser exam mein hai par is track ke bahar.</p></div>

<div class="scn"><h4>Night shift ko handover</h4><p>Ek engineer ne shaam 6 baje branch khatam kiya aur note chhoda: tunnel up, BGP Established, Config Status In sync, PC-BR se tested, PSK vault mein. Raat 2 baje on-call engineer ne us note se ek minute mein teen causes rule out kiye aur seedha fail hue ISP link par gaya.</p><p><b>Lesson:</b> achha verification record agle insaan ka time bachata hai.</p></div>

<div class="iv"><p class="q">"Prisma Access par branch onboard karna summarise karo."</p><p>Non-overlapping addresses aur location plan karo, node, tunnel aur routing ke saath remote network banao, push karo, Service Endpoint Address padho, branch objects banao, static ya BGP chuno, show vpn aur status pages se verify karo, aur result document karo. Site ki zaroorat ke hisaab se ECMP ya secondary WAN aur bandwidth jodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Remote network matlab cloud termination node tak branch tunnel.</li>
<li>Branch ke saat objects; zone aur virtual router bhoolna aasaan hai.</li>
<li>BGP mein TTL 8, MRAI default 30 s, aur infrastructure AS 65534.</li>
<li>ECMP aur secondary WAN alag tools hain aur combine nahi hote.</li>
<li>Order mein verify karo: ike-sa, ipsec-sa, flow, routes, cloud page, host test.</li>
</ul></div>
`}};export{e as default};