var e={id:`advpn2-and-sdwan`,h:{en:`ADVPN 2.0 and SD-WAN with shortcuts: members, health checks and edge discovery`,hi:`ADVPN 2.0 aur shortcuts ke saath SD-WAN: members, health checks aur edge discovery`},body:{en:`
<p>Classic ADVPN builds a shortcut over whichever parent tunnel carried the first packets, and routing (chapter 4) does the rest. The spoke has no idea whether the other spoke's link is fast, slow, or an expensive satellite. <b>ADVPN 2.0</b>, also called edge discovery and available from FortiOS 7.4.2 (improved in 7.6), closes that gap: the spokes exchange SD-WAN information and the spoke chooses the best pair of links. This chapter explains how and how SD-WAN members and health checks relate to shortcuts.</p>
<h3>What changes with ADVPN 2.0</h3>
<table class="cmp"><tr><th></th><th>ADVPN 1.0</th><th>ADVPN 2.0 (edge discovery)</th></tr><tr><td>Who decides the path?</td><td>The hub offers; routing (BGP design) and the first packet's overlay decide.</td><td>The spoke decides, using SD-WAN information from both ends.</td></tr><tr><td>Routing needed</td><td>Careful next-hop design, additional paths, recursive next hop.</td><td>Simple: BGP only distributes reachability (LAN prefixes); the spoke does path selection.</td></tr><tr><td>Shortcut query</td><td>Spoke to hub to spoke.</td><td>In 7.6 the local spoke sends it straight to the remote spoke after its path decision.</td></tr><tr><td>Several shortcuts</td><td>One per spoke pair and overlay.</td><td>Several at once, for load balancing over WAN links (7.6).</td></tr><tr><td>IKE version</td><td>IKEv1 or IKEv2.</td><td>IKEv2 on every spoke. One IKEv1 spoke can block negotiation.</td></tr><tr><td>IP version</td><td>IPv4 (IPv6 in some designs).</td><td>IPv4 only.</td></tr></table>
<h3>The three SD-WAN settings that drive it</h3>
<ol><li><b>transport-group</b> on every SD-WAN member. A number that labels the kind of underlay: for example 1 for internet overlays and 2 for MPLS overlays. A shortcut is only built between members of the <b>same</b> transport group on both sides.</li><li><b>embed-measured-health</b> on the health check. The spoke embeds the measured link quality (latency, jitter, loss) in its probes, so the remote spoke learns it.</li><li><b>advpn-select</b> and <b>advpn-health-check</b> on the SD-WAN zone. They switch ADVPN 2.0 selection on and name the health check that provides the local overlay link quality to the peer.</li></ol>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: ADVPN 2.0 edge discovery settings (spoke, same pattern on BR2-FGT)</span>
config system sdwan
    config zone
        edit "overlay"
            set advpn-select enable
            set advpn-health-check "HUB1_HC"
        next
    end
    config members
        edit 3
            set interface "HUB1-VPN1"
            set zone "overlay"
            set transport-group 1
        next
        edit 4
            set interface "HUB1-VPN2"
            set zone "overlay"
            set transport-group 1
        next
    end
    config health-check
        edit "HUB1_HC"
            set embed-measured-health enable
        next
    end
end
config vpn ipsec phase1-interface
    edit "HUB1-VPN1"
        set auto-discovery-receiver enable
        set auto-discovery-shortcuts independent
        set idle-timeout enable
        set idle-timeoutinterval 10
    next
end</pre>
<p>Only the ADVPN lines are shown. Members, server, protocol and SLA come from nse4-sdwan and fsd-sla. The hub keeps <code>auto-discovery-sender enable</code> exactly as before.</p>
<h3>How the spoke picks the path (SLA-mode services)</h3>
<p>When traffic for a remote spoke arrives, the spoke compares candidate pairs of local and remote links in this order:</p>
<ol><li>Local and remote members in the <b>same transport group</b>.</li><li>Pairs that meet the <b>SLA</b> (using the measured health that the remote spoke embedded).</li><li>The lowest <b>link cost</b> (the member or health-check link-cost-factor from fsd-sla).</li><li>The <b>configuration order</b> as the final tie-break.</li></ol>
<div class="eg"><p>BR1 has two internet overlays (members 3 and 4, group 1) and one MPLS overlay (member 5, group 2). BR2 has the same layout. The SLA is latency below 100 ms. Measured: BR1 member 3 is 25 ms, member 4 is 35 ms, member 5 is 20 ms. BR2 side similar. The spoke considers only groups that match: group 1 with group 1 and group 2 with group 2. If the rule asks for the lowest cost, internet members (cost 0) beat MPLS (cost 10), and between members 3 and 4 the configuration order decides if both meet the SLA with equal cost. If BR2's internet link fails its SLA, the shortcut is built over MPLS instead.</p></div>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="diagram"><rect x="20" y="30" width="140" height="170" rx="10" fill="#bbf7d0"/><text x="90" y="52" text-anchor="middle" class="svg-ink" font-size="13">BR1-FGT</text><rect x="35" y="65" width="110" height="34" rx="8" fill="#bae6fd"/><text x="90" y="87" text-anchor="middle" class="svg-ink" font-size="12">VPN1 group 1</text><rect x="35" y="108" width="110" height="34" rx="8" fill="#bae6fd"/><text x="90" y="130" text-anchor="middle" class="svg-ink" font-size="12">VPN2 group 1</text><rect x="35" y="151" width="110" height="34" rx="8" fill="#fde68a"/><text x="90" y="173" text-anchor="middle" class="svg-ink" font-size="12">MPLS group 2</text><rect x="480" y="30" width="140" height="170" rx="10" fill="#bbf7d0"/><text x="550" y="52" text-anchor="middle" class="svg-ink" font-size="13">BR2-FGT</text><rect x="495" y="65" width="110" height="34" rx="8" fill="#bae6fd"/><text x="550" y="87" text-anchor="middle" class="svg-ink" font-size="12">VPN1 group 1</text><rect x="495" y="108" width="110" height="34" rx="8" fill="#bae6fd"/><text x="550" y="130" text-anchor="middle" class="svg-ink" font-size="12">VPN2 group 1</text><rect x="495" y="151" width="110" height="34" rx="8" fill="#fde68a"/><text x="550" y="173" text-anchor="middle" class="svg-ink" font-size="12">MPLS group 2</text><line x1="145" y1="82" x2="495" y2="82" stroke="#16a34a" stroke-width="3"/><line x1="145" y1="168" x2="495" y2="168" stroke="#d97706" stroke-width="2" stroke-dasharray="6 4"/><text x="320" y="75" text-anchor="middle" class="svg-accent" font-size="12">group 1 pair, in SLA, lowest cost</text><text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="11">group 2 pair: only if group 1 fails SLA</text><text x="320" y="228" text-anchor="middle" class="svg-muted" font-size="11">no shortcut between group 1 and group 2</text></svg><p class="cap">Transport groups decide which links may be paired. The spoke then picks the best pair that meets the SLA.</p></div>
<h3>SD-WAN members and health checks with classic shortcuts</h3>
<ul><li>The <b>members</b> are the parent tunnels (HUB1-VPN1 and HUB1-VPN2). Shortcut interfaces are dynamic children. FortiOS shows shortcut tunnels in its SD-WAN monitoring pages, but the SD-WAN member list stays the parents. Note that on FortiOS 7.0.8 and 7.2.1 and later a tunnel that is an SD-WAN member cannot be changed to net-device enable.</li><li>The health check from fsd-ipsec chapter 6 probes the <b>hub</b> through the parent tunnels. It measures spoke to hub, not spoke to spoke. A healthy parent is no promise that the direct path is good. That is exactly the gap that ADVPN 2.0 closes with the embedded measurements.</li><li>An SD-WAN rule for branch traffic (destination 10.0.0.0/8, members HUB1-VPN1 and HUB1-VPN2) keeps choosing between the overlays; the shortcut on the chosen overlay then takes over the traffic by routing.</li></ul>
<h3>Verification in words</h3>
<p>On a spoke, the SD-WAN diagnose commands for services and health checks show the measured values, and a diagnose for ADVPN shows the path decision. The documentation shows a line such as "Selected path: local(H1_T11, port1) gw: 172.31.3.1 remote IP: 172.31.3.105(172.31.81.2)": the local tunnel and underlay interface chosen, its gateway, and the remote underlay and overlay addresses. Check the exact command name and output for your build in the 7.6 guide before you rely on a field.</p>
<div class="warn"><p><b>Common mistake.</b> A different <b>transport-group</b> on the two spokes for the same kind of link (1 on BR1, 3 on BR2 for the internet overlay). The spokes then see no matching path and build no shortcut, while all the other settings look right. The same group number must mean the same type of underlay everywhere.</p></div>
<div class="exam"><p><b>Exam trap.</b> ADVPN 2.0 does not replace the hub: it still introduces the spokes, and BGP still carries the prefixes. It changes <b>who chooses the path</b>. It also requires IKEv2 everywhere and is IPv4 only.</p></div>
<div class="scn"><h4>The shortcut over the slow satellite</h4><p>BR3 had internet and a satellite backup, BR4 internet only. With classic ADVPN a failover to the satellite parent while the hub was busy led to a shortcut over satellite with 600 ms delay, even after the internet recovered. After moving to 7.6 with ADVPN 2.0, giving internet overlays transport-group 1 and the satellite group 2, BR3 built shortcuts only over group 1 to BR4, and satellite shortcuts only to other satellite sites.</p><p><b>Lesson:</b> Transport groups keep slow links from being paired with fast ones.</p></div>
<div class="iv"><p class="q">"What does ADVPN 2.0 add compared with classic ADVPN?"</p><p>Edge discovery: the spokes exchange SD-WAN link information (embed-measured-health, transport-group), and the spoke chooses which links to use for the shortcut (advpn-select) by matching transport groups, SLA status, link cost and configuration order. Routing becomes simpler, because BGP only needs reachability. It needs IKEv2 and supports IPv4 only.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>ADVPN 2.0 (7.4.2 and later) moves path choice to the spoke, using SD-WAN information from both ends.</li><li>Key settings: transport-group on members, embed-measured-health on the health check, advpn-select and advpn-health-check on the zone.</li><li>Selection order: transport group, in SLA, lowest cost, configuration order.</li><li>Classic health checks measure spoke to hub only; they say nothing about the direct path.</li><li>IKEv2 everywhere, IPv4 only.</li></ul></div>
`,hi:`
<p>Classic ADVPN shortcut usi parent tunnel par banata hai jisne pehle packets carry kiye, aur baaki kaam routing (chapter 4) karti hai. Spoke ko pata nahi hota ki doosre spoke ki link tez hai, slow hai, ya mehnga satellite. <b>ADVPN 2.0</b>, jise edge discovery bhi kehte hain aur jo FortiOS 7.4.2 se available hai (7.6 mein improved), is gap ko bharta hai: spokes SD-WAN information exchange karte hain aur spoke links ki best jodi chunta hai. Yeh chapter batata hai kaise, aur SD-WAN members aur health checks shortcuts se kaise jude hain.</p>
<h3>ADVPN 2.0 se kya badalta hai</h3>
<table class="cmp"><tr><th></th><th>ADVPN 1.0</th><th>ADVPN 2.0 (edge discovery)</th></tr><tr><td>Path kaun tay karta hai?</td><td>Hub offer karta hai; routing (BGP design) aur pehle packet ka overlay tay karte hain.</td><td>Spoke tay karta hai, dono sire ki SD-WAN information se.</td></tr><tr><td>Routing kya chahiye</td><td>Careful next-hop design, additional paths, recursive next hop.</td><td>Simple: BGP sirf reachability (LAN prefixes) baantta hai; spoke path selection karta hai.</td></tr><tr><td>Shortcut query</td><td>Spoke se hub se spoke.</td><td>7.6 mein local spoke apne path decision ke baad use seedha remote spoke ko bhejta hai.</td></tr><tr><td>Kai shortcuts</td><td>Har spoke pair aur overlay par ek.</td><td>Ek saath kai, WAN links par load balancing ke liye (7.6).</td></tr><tr><td>IKE version</td><td>IKEv1 ya IKEv2.</td><td>Har spoke par IKEv2. Ek IKEv1 spoke negotiation rok sakta hai.</td></tr><tr><td>IP version</td><td>IPv4 (kuch designs mein IPv6).</td><td>Sirf IPv4.</td></tr></table>
<h3>Teen SD-WAN settings jo ise chalati hain</h3>
<ol><li>Har SD-WAN member par <b>transport-group</b>. Ek number jo underlay ki kism label karta hai: jaise internet overlays ke liye 1 aur MPLS overlays ke liye 2. Shortcut sirf dono taraf ke <b>same</b> transport group ke members ke beech banta hai.</li><li>Health check par <b>embed-measured-health</b>. Spoke measured link quality (latency, jitter, loss) ko apne probes mein embed karta hai, taaki remote spoke use seekh le.</li><li>SD-WAN zone par <b>advpn-select</b> aur <b>advpn-health-check</b>. Yeh ADVPN 2.0 selection on karte hain aur us health check ka naam dete hain jo peer ko local overlay link quality deta hai.</li></ol>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: ADVPN 2.0 edge discovery settings (spoke, same pattern on BR2-FGT)</span>
config system sdwan
    config zone
        edit "overlay"
            set advpn-select enable
            set advpn-health-check "HUB1_HC"
        next
    end
    config members
        edit 3
            set interface "HUB1-VPN1"
            set zone "overlay"
            set transport-group 1
        next
        edit 4
            set interface "HUB1-VPN2"
            set zone "overlay"
            set transport-group 1
        next
    end
    config health-check
        edit "HUB1_HC"
            set embed-measured-health enable
        next
    end
end
config vpn ipsec phase1-interface
    edit "HUB1-VPN1"
        set auto-discovery-receiver enable
        set auto-discovery-shortcuts independent
        set idle-timeout enable
        set idle-timeoutinterval 10
    next
end</pre>
<p>Sirf ADVPN lines dikhayi gayi hain. Members, server, protocol aur SLA nse4-sdwan aur fsd-sla se aate hain. Hub <code>auto-discovery-sender enable</code> pehle jaisa hi rakhta hai.</p>
<h3>Spoke path kaise chunta hai (SLA-mode services)</h3>
<p>Remote spoke ke liye traffic aane par spoke local aur remote links ki candidate jodiyon ko is order mein compare karta hai:</p>
<ol><li>Local aur remote members <b>same transport group</b> mein.</li><li>Woh jodiyan jo <b>SLA</b> meet karti hain (remote spoke ne jo measured health embed kiya use karke).</li><li>Sabse kam <b>link cost</b> (fsd-sla ka member ya health-check link-cost-factor).</li><li>Aakhri tie-break ke roop mein <b>configuration order</b>.</li></ol>
<div class="eg"><p>BR1 ke paas do internet overlays hain (members 3 aur 4, group 1) aur ek MPLS overlay (member 5, group 2). BR2 ka layout wahi hai. SLA hai latency 100 ms se kam. Measured: BR1 member 3 25 ms, member 4 35 ms, member 5 20 ms. BR2 side similar. Spoke sirf matching groups dekhta hai: group 1 ke saath group 1 aur group 2 ke saath group 2. Rule lowest cost maange to internet members (cost 0) MPLS (cost 10) ko hara dete hain, aur members 3 aur 4 ke beech agar dono SLA meet karte hain aur cost barabar hai to configuration order tay karta hai. Agar BR2 ki internet link SLA fail kare, to shortcut MPLS par banega.</p></div>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="diagram"><rect x="20" y="30" width="140" height="170" rx="10" fill="#bbf7d0"/><text x="90" y="52" text-anchor="middle" class="svg-ink" font-size="13">BR1-FGT</text><rect x="35" y="65" width="110" height="34" rx="8" fill="#bae6fd"/><text x="90" y="87" text-anchor="middle" class="svg-ink" font-size="12">VPN1 group 1</text><rect x="35" y="108" width="110" height="34" rx="8" fill="#bae6fd"/><text x="90" y="130" text-anchor="middle" class="svg-ink" font-size="12">VPN2 group 1</text><rect x="35" y="151" width="110" height="34" rx="8" fill="#fde68a"/><text x="90" y="173" text-anchor="middle" class="svg-ink" font-size="12">MPLS group 2</text><rect x="480" y="30" width="140" height="170" rx="10" fill="#bbf7d0"/><text x="550" y="52" text-anchor="middle" class="svg-ink" font-size="13">BR2-FGT</text><rect x="495" y="65" width="110" height="34" rx="8" fill="#bae6fd"/><text x="550" y="87" text-anchor="middle" class="svg-ink" font-size="12">VPN1 group 1</text><rect x="495" y="108" width="110" height="34" rx="8" fill="#bae6fd"/><text x="550" y="130" text-anchor="middle" class="svg-ink" font-size="12">VPN2 group 1</text><rect x="495" y="151" width="110" height="34" rx="8" fill="#fde68a"/><text x="550" y="173" text-anchor="middle" class="svg-ink" font-size="12">MPLS group 2</text><line x1="145" y1="82" x2="495" y2="82" stroke="#16a34a" stroke-width="3"/><line x1="145" y1="168" x2="495" y2="168" stroke="#d97706" stroke-width="2" stroke-dasharray="6 4"/><text x="320" y="75" text-anchor="middle" class="svg-accent" font-size="12">group 1 pair, in SLA, lowest cost</text><text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="11">group 2 pair: sirf jab group 1 SLA fail ho</text><text x="320" y="228" text-anchor="middle" class="svg-muted" font-size="11">group 1 aur group 2 ke beech shortcut nahi</text></svg><p class="cap">Transport groups tay karte hain ki kaun si links jodi ja sakti hain. Phir spoke SLA meet karne wali best jodi chunta hai.</p></div>
<h3>Classic shortcuts ke saath SD-WAN members aur health checks</h3>
<ul><li><b>Members</b> parent tunnels hain (HUB1-VPN1 aur HUB1-VPN2). Shortcut interfaces dynamic children hain. FortiOS shortcut tunnels ko apne SD-WAN monitoring pages mein dikhata hai, par SD-WAN member list parents hi rehti hai. Dhyan rakho ki FortiOS 7.0.8 aur 7.2.1 aur baad mein jo tunnel SD-WAN member hai use net-device enable nahi kiya ja sakta.</li><li>fsd-ipsec chapter 6 ka health check parent tunnels ke through <b>hub</b> ko probe karta hai. Woh spoke se hub naapta hai, spoke se spoke nahi. Healthy parent ka matlab yeh nahi ki direct path achha hai. Yahi gap ADVPN 2.0 embedded measurements se bharta hai.</li><li>Branch traffic ka SD-WAN rule (destination 10.0.0.0/8, members HUB1-VPN1 aur HUB1-VPN2) overlays ke beech chunta rehta hai; chuni hui overlay par shortcut phir routing se traffic le leta hai.</li></ul>
<h3>Verification shabdon mein</h3>
<p>Spoke par services aur health checks ke SD-WAN diagnose commands measured values dikhate hain, aur ADVPN ka ek diagnose path decision dikhata hai. Documentation mein aisi line dikhti hai: "Selected path: local(H1_T11, port1) gw: 172.31.3.1 remote IP: 172.31.3.105(172.31.81.2)": chuna hua local tunnel aur underlay interface, uska gateway, aur remote underlay aur overlay addresses. Kisi field par bharosa karne se pehle apne build ke liye exact command name aur output 7.6 guide mein check karo.</p>
<div class="warn"><p><b>Common galti.</b> Ek hi kism ki link ke liye do spokes par alag <b>transport-group</b> (internet overlay ke liye BR1 par 1, BR2 par 3). Tab spokes ko koi matching path nahi dikhta aur shortcut nahi banta, jabki baaki saari settings sahi lagti hain. Same group number ka matlab har jagah same type ka underlay hona chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> ADVPN 2.0 hub ko replace nahi karta: woh abhi bhi spokes ka parichay karwata hai, aur BGP abhi bhi prefixes carry karta hai. Yeh badalta hai ki <b>path kaun chunta hai</b>. Isko har jagah IKEv2 chahiye aur yeh sirf IPv4 hai.</p></div>
<div class="scn"><h4>Slow satellite par shortcut</h4><p>BR3 ke paas internet aur satellite backup tha, BR4 ke paas sirf internet. Classic ADVPN mein hub busy hone par satellite parent par failover hua aur 600 ms delay wala satellite shortcut bana, internet recover hone ke baad bhi. 7.6 par ADVPN 2.0 par jaane ke baad, internet overlays ko transport-group 1 aur satellite ko group 2 dene par, BR3 ne BR4 tak sirf group 1 par shortcuts banaye, aur satellite shortcuts sirf doosri satellite sites tak.</p><p><b>Seekh:</b> Transport groups slow links ko fast links ke saath jodne se rokte hain.</p></div>
<div class="iv"><p class="q">"Classic ADVPN ke mukable ADVPN 2.0 kya jodta hai?"</p><p>Edge discovery: spokes SD-WAN link information exchange karte hain (embed-measured-health, transport-group), aur spoke tay karta hai ki shortcut ke liye kaun si links use hon (advpn-select) transport groups, SLA status, link cost aur configuration order match karke. Routing simple ho jaati hai, kyunki BGP ko sirf reachability chahiye. Isko IKEv2 chahiye aur sirf IPv4 support karta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>ADVPN 2.0 (7.4.2 aur baad) path choice spoke ko deta hai, dono sire ki SD-WAN information se.</li><li>Key settings: members par transport-group, health check par embed-measured-health, zone par advpn-select aur advpn-health-check.</li><li>Selection order: transport group, in SLA, lowest cost, configuration order.</li><li>Classic health checks sirf spoke se hub naapte hain; direct path ke baare mein kuch nahi batate.</li><li>Har jagah IKEv2, sirf IPv4.</li></ul></div>
`}};export{e as default};