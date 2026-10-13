var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: VRFs, GRE and IPsec`,hi:`Troubleshooting workflow: VRFs, GRE aur IPsec`},body:{en:`
<p>A good mechanic does not replace the engine because the car will not start. He checks in order: is there fuel, does the battery turn the starter, is there a spark, and only then opens the engine. Tunnels deserve the same discipline. Almost every VRF, GRE or IPsec fault falls into one of six layers, and checking them in order takes minutes instead of hours. This chapter gives you that order and walks through all four labs with it.</p>

<h3>The six-step workflow</h3>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Six-step tunnel troubleshooting">
<rect x="5" y="30" width="98" height="50" rx="8" fill="#e2e8f0"/><text x="54" y="52" text-anchor="middle" class="svg-ink" font-size="12">1 Underlay</text><text x="54" y="68" text-anchor="middle" class="svg-muted" font-size="12">ping peer</text>
<rect x="111" y="30" width="98" height="50" rx="8" fill="#bae6fd"/><text x="160" y="52" text-anchor="middle" class="svg-ink" font-size="12">2 Interface</text><text x="160" y="68" text-anchor="middle" class="svg-muted" font-size="12">up/up?</text>
<rect x="217" y="30" width="98" height="50" rx="8" fill="#bbf7d0"/><text x="266" y="52" text-anchor="middle" class="svg-ink" font-size="12">3 Routing</text><text x="266" y="68" text-anchor="middle" class="svg-muted" font-size="12">in and back</text>
<rect x="323" y="30" width="98" height="50" rx="8" fill="#ddd6fe"/><text x="372" y="52" text-anchor="middle" class="svg-ink" font-size="12">4 Phase 1</text><text x="372" y="68" text-anchor="middle" class="svg-muted" font-size="12">QM_IDLE?</text>
<rect x="429" y="30" width="98" height="50" rx="8" fill="#fde68a"/><text x="478" y="52" text-anchor="middle" class="svg-ink" font-size="12">5 Phase 2</text><text x="478" y="68" text-anchor="middle" class="svg-muted" font-size="12">SAs, idents</text>
<rect x="535" y="30" width="100" height="50" rx="8" fill="#fed7aa"/><text x="585" y="52" text-anchor="middle" class="svg-ink" font-size="12">6 Data</text><text x="585" y="68" text-anchor="middle" class="svg-muted" font-size="12">counters, MTU</text>
</svg><p class="cap">Work left to right. Steps 4 and 5 only apply when IPsec is used.</p></div>

<ol>
<li><b>Underlay.</b> Can the tunnel source reach the tunnel destination? <code>ping 100.64.22.2 source GigabitEthernet0/0</code>. With a front-door VRF, use <code>ping vrf INET</code>. Check edge ACLs for GRE (47), ESP (50), UDP 500 and 4500.</li>
<li><b>Tunnel interface.</b> <code>show ip interface brief | include Tunnel</code> and <code>show interfaces tunnel 0</code>: source, destination, mode, keepalives. For a VTI, down/down usually means no IPsec SA yet.</li>
<li><b>Routing.</b> Do the LAN routes point into the tunnel on both sides, and does the route to the tunnel destination point out of the physical interface? Check <code>show ip route</code>, <code>show ip cef</code> and the log for RECURDOWN. For VRFs, always add the VRF keyword.</li>
<li><b>IKE phase 1.</b> <code>show crypto isakmp sa</code>. QM_IDLE is good. <b>MM_NO_STATE</b> stuck means no reply or no matching policy; <b>MM_KEY_EXCH</b> stuck usually means a pre-shared key mismatch. For IKEv2, <code>show crypto ikev2 sa</code> should show READY.</li>
<li><b>IPsec phase 2.</b> <code>show crypto ipsec sa</code>: are there SAs, do local and remote idents mirror each other, does the transform match? Quick mode failures point at transform sets, proxy ACLs or PFS mismatches.</li>
<li><b>Data plane.</b> Encaps and decaps on both routers. Encaps up but the far side's decaps at 0 means packets are lost in transit or dropped at the far end; encaps at 0 on one side means its traffic is not matching (NAT, routing, ACL). Then MTU: large pings with DF set, <code>ip mtu</code> and <code>ip tcp adjust-mss</code>.</li>
</ol>

<h3>Useful messages and debugs</h3>
<table class="cmp"><tr><th>You see</th><th>It means</th></tr>
<tr><td><code>%TUN-5-RECURDOWN</code></td><td>Route to the tunnel destination goes through the tunnel</td></tr>
<tr><td><code>%CRYPTO-4-IKMP_BAD_MESSAGE ... failed its sanity check or is malformed</code></td><td>Pre-shared keys differ</td></tr>
<tr><td><code>%CRYPTO-6-IKMP_MODE_FAILURE: Processing of Main mode failed</code></td><td>Phase 1 policy or authentication problem</td></tr>
<tr><td><code>Processing of Quick mode failed</code> or "atts not acceptable" in <code>debug crypto isakmp</code></td><td>Transform set, proxy identities or PFS do not match</td></tr>
<tr><td><code>%CRYPTO-4-RECVD_PKT_INV_SPI</code></td><td>The peer uses an SA this router no longer has (for example after a reboot); enable DPD with <code>crypto isakmp keepalive</code></td></tr>
</table>
<p>Use <code>debug crypto isakmp</code> and <code>debug crypto ipsec</code> carefully, ideally with <code>debug crypto condition peer ipv4 100.64.22.2</code> to limit output on a busy router.</p>

<h3>Walking the four labs with the workflow</h3>
<p><b>Lab 1, GRE between branches.</b> If PC1 cannot reach PC2: step 1, BR1 pings 100.64.22.2 through the ISP (the default routes make this work). Step 2, Tunnel0 up/up on both; a wrong destination such as 172.16.12.2 (the far tunnel IP) makes it flap, because that address sits in the tunnel's own connected subnet and the lookup becomes recursive. Step 3, BR1 has 10.2.20.0/24 via 172.16.12.2 and BR2 has the return route to 10.1.10.0/24; a missing return route gives one-way traffic. Finally prove with <code>show interfaces tunnel 0</code> and a traceroute showing the tunnel as one hop.</p>
<p><b>Lab 2, the flapping tunnel.</b> Step 2 shows the tunnel bouncing. Step 3 finds it: <code>show logging | include TUN</code> shows RECURDOWN and <code>show ip route 100.64.22.2</code> shows a /30 via Tunnel0. Remove <code>ip route 100.64.22.0 255.255.255.252 Tunnel0</code>, confirm with <code>show ip cef 100.64.22.2</code> that the exit is Gi0/0, then wait for keepalives and ping PC2.</p>
<p><b>Lab 3, IPsec with a crypto map.</b> Step 1 passes: the WAN addresses ping. There is no tunnel interface, so step 2 becomes "is the crypto map applied on Gi0/0?" (<code>show crypto map</code>). Step 4: compare <code>show crypto isakmp policy</code> on both sides, then fix the key (NKdelBlr26). Step 5: <code>show crypto ipsec transform-set</code> reveals AES-128/SHA-1 on BR versus AES-256/SHA-256 on HQ; fix it and add the crypto map with ACL 120 as the mirror of ACL 110. Step 6: ping from PC-BR (not from the router), then check QM_IDLE and rising encaps and decaps on HQ.</p>
<p><b>Lab 4, GRE over IPsec.</b> Steps 1 to 3 already pass: the GRE tunnel works. Step 4 after applying the profile on both routers: QM_IDLE to the far WAN address. Step 5: <code>show crypto ipsec sa</code> on BR1 shows idents with protocol 47 and Transport in use. Step 6: ping PC1 to PC2 and watch encaps rise. If only one router has tunnel protection, the tunnel breaks: check <code>show running-config interface Tunnel0</code> on both.</p>

<h3>VRF-specific checks</h3>
<ul>
<li>Is the interface in the right VRF, with an address? <code>show ip vrf interfaces</code>.</li>
<li>Are you testing in the right table? <code>ping vrf</code>, <code>show ip route vrf</code>.</li>
<li>Does each VRF have its own routing (static <code>ip route vrf</code>, per-VRF OSPF process) on every hop, including the subinterface on the neighbour?</li>
<li>With a front-door VRF, does <code>tunnel vrf</code> name the VRF where the destination route lives?</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Starting with debugs before checking the underlay. Pinging from the router to test a crypto map. Clearing SAs repeatedly (<code>clear crypto sa</code>, <code>clear crypto isakmp</code>) hoping it fixes a mismatch. Forgetting that plain ping and show commands use the global table.</p></div>

<div class="exam"><p><b>Exam traps.</b> MM_NO_STATE stuck points to connectivity or policy; MM_KEY_EXCH stuck points to the key. QM_IDLE is the healthy phase 1 state. One-sided encaps and decaps point to the return path, NAT or routing on the far side.</p></div>

<div class="scn"><h4>Friday night, three symptoms, one cause</h4><p>After an ISP change, a branch reported: tunnel up/up, OSPF neighbour down, and no IPsec SA. The engineer started at step 1: <code>ping 100.64.22.2 source Gi0/0</code> failed. The new ISP router needed a different default gateway, and the old one had been left in the config. Because keepalives were not configured, Tunnel0 still looked up/up with the stale default route present. Fixing the default route brought IKE, the SA and OSPF back in order within a minute.</p><p><b>Lesson:</b> always start at the underlay. Most "VPN problems" are routing problems one layer down.</p></div>

<div class="iv"><p class="q">"A site-to-site IPsec tunnel is down. How do you troubleshoot it?"</p><p>Work bottom up: confirm peer reachability from the tunnel source and that UDP 500, 4500 and ESP are allowed; check the tunnel or crypto map is applied; confirm routing and no recursion; then <code>show crypto isakmp sa</code> (QM_IDLE, or stuck in MM_NO_STATE or MM_KEY_EXCH), then <code>show crypto ipsec sa</code> for SAs, mirrored idents and counters on both sides; finally NAT exemption and MTU. Use conditional debugs only after the show commands narrow it down.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: underlay, tunnel interface, routing, phase 1, phase 2, data plane.</li>
<li>RECURDOWN = recursive routing; sanity check failure = key mismatch; Quick Mode failure = transform or ACL mismatch.</li>
<li>QM_IDLE is healthy; MM_NO_STATE and MM_KEY_EXCH point to policy/connectivity and key problems.</li>
<li>Compare encaps and decaps on both sides to find the direction that fails.</li>
<li>For VRFs, every test and show command needs the VRF keyword.</li>
</ul></div>
`,hi:`
<p>Achha mechanic gaadi start na hone par engine nahi badal deta. Woh order mein check karta hai: petrol hai kya, battery starter ghumati hai kya, spark hai kya, aur tabhi engine kholta hai. Tunnels ko bhi yahi discipline chahiye. Lagbhag har VRF, GRE ya IPsec fault chhe layers mein se ek mein aata hai, aur unhe order mein check karne se ghanton ki jagah minuton lagte hain. Yeh chapter aapko woh order deta hai aur usi se chaaron labs ko walk karta hai.</p>

<h3>Chhe-step workflow</h3>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Chhe-step tunnel troubleshooting">
<rect x="5" y="30" width="98" height="50" rx="8" fill="#e2e8f0"/><text x="54" y="52" text-anchor="middle" class="svg-ink" font-size="12">1 Underlay</text><text x="54" y="68" text-anchor="middle" class="svg-muted" font-size="12">peer ping</text>
<rect x="111" y="30" width="98" height="50" rx="8" fill="#bae6fd"/><text x="160" y="52" text-anchor="middle" class="svg-ink" font-size="12">2 Interface</text><text x="160" y="68" text-anchor="middle" class="svg-muted" font-size="12">up/up?</text>
<rect x="217" y="30" width="98" height="50" rx="8" fill="#bbf7d0"/><text x="266" y="52" text-anchor="middle" class="svg-ink" font-size="12">3 Routing</text><text x="266" y="68" text-anchor="middle" class="svg-muted" font-size="12">andar aur wapas</text>
<rect x="323" y="30" width="98" height="50" rx="8" fill="#ddd6fe"/><text x="372" y="52" text-anchor="middle" class="svg-ink" font-size="12">4 Phase 1</text><text x="372" y="68" text-anchor="middle" class="svg-muted" font-size="12">QM_IDLE?</text>
<rect x="429" y="30" width="98" height="50" rx="8" fill="#fde68a"/><text x="478" y="52" text-anchor="middle" class="svg-ink" font-size="12">5 Phase 2</text><text x="478" y="68" text-anchor="middle" class="svg-muted" font-size="12">SAs, idents</text>
<rect x="535" y="30" width="100" height="50" rx="8" fill="#fed7aa"/><text x="585" y="52" text-anchor="middle" class="svg-ink" font-size="12">6 Data</text><text x="585" y="68" text-anchor="middle" class="svg-muted" font-size="12">counters, MTU</text>
</svg><p class="cap">Left se right kaam karo. Steps 4 aur 5 sirf IPsec use hone par lagte hain.</p></div>

<ol>
<li><b>Underlay.</b> Kya tunnel source tunnel destination tak pahunch sakta hai? <code>ping 100.64.22.2 source GigabitEthernet0/0</code>. Front-door VRF ke saath <code>ping vrf INET</code> use karo. Edge ACLs mein GRE (47), ESP (50), UDP 500 aur 4500 check karo.</li>
<li><b>Tunnel interface.</b> <code>show ip interface brief | include Tunnel</code> aur <code>show interfaces tunnel 0</code>: source, destination, mode, keepalives. VTI ke liye down/down ka matlab aam taur par abhi IPsec SA nahi hai.</li>
<li><b>Routing.</b> Kya dono sides par LAN routes tunnel mein point karte hain, aur kya tunnel destination ka route physical interface se bahar point karta hai? <code>show ip route</code>, <code>show ip cef</code> aur RECURDOWN ke liye log check karo. VRFs ke liye hamesha VRF keyword jodo.</li>
<li><b>IKE phase 1.</b> <code>show crypto isakmp sa</code>. QM_IDLE achha hai. <b>MM_NO_STATE</b> par atka matlab koi reply nahi ya matching policy nahi; <b>MM_KEY_EXCH</b> par atka aam taur par pre-shared key mismatch. IKEv2 ke liye <code>show crypto ikev2 sa</code> READY dikhana chahiye.</li>
<li><b>IPsec phase 2.</b> <code>show crypto ipsec sa</code>: SAs hain kya, local aur remote idents ek doosre ka mirror hain kya, transform match karta hai kya? Quick mode failures transform sets, proxy ACLs ya PFS mismatch ki taraf ishara karte hain.</li>
<li><b>Data plane.</b> Dono routers par encaps aur decaps. Encaps badh rahe lekin far side ke decaps 0 ka matlab packets raaste mein kho rahe hain ya far end par drop ho rahe hain; ek side par encaps 0 ka matlab uska traffic match nahi kar raha (NAT, routing, ACL). Phir MTU: DF set ke saath bade pings, <code>ip mtu</code> aur <code>ip tcp adjust-mss</code>.</li>
</ol>

<h3>Kaam ke messages aur debugs</h3>
<table class="cmp"><tr><th>Aapko dikhta hai</th><th>Matlab</th></tr>
<tr><td><code>%TUN-5-RECURDOWN</code></td><td>Tunnel destination ka route tunnel se hokar jaata hai</td></tr>
<tr><td><code>%CRYPTO-4-IKMP_BAD_MESSAGE ... failed its sanity check or is malformed</code></td><td>Pre-shared keys alag hain</td></tr>
<tr><td><code>%CRYPTO-6-IKMP_MODE_FAILURE: Processing of Main mode failed</code></td><td>Phase 1 policy ya authentication problem</td></tr>
<tr><td><code>debug crypto isakmp</code> mein <code>Processing of Quick mode failed</code> ya "atts not acceptable"</td><td>Transform set, proxy identities ya PFS match nahi karte</td></tr>
<tr><td><code>%CRYPTO-4-RECVD_PKT_INV_SPI</code></td><td>Peer aisa SA use kar raha hai jo is router ke paas ab nahi hai (jaise reboot ke baad); <code>crypto isakmp keepalive</code> se DPD enable karo</td></tr>
</table>
<p><code>debug crypto isakmp</code> aur <code>debug crypto ipsec</code> dhyan se use karo, busy router par output limit karne ke liye ideally <code>debug crypto condition peer ipv4 100.64.22.2</code> ke saath.</p>

<h3>Workflow se chaaron labs walk karna</h3>
<p><b>Lab 1, branches ke beech GRE.</b> Agar PC1 PC2 tak nahi pahunchta: step 1, BR1 ISP ke through 100.64.22.2 ping karta hai (default routes isse chalate hain). Step 2, dono par Tunnel0 up/up; 172.16.12.2 (far tunnel IP) jaisi galat destination use flap karwati hai, kyunki woh address tunnel ke apne connected subnet mein hai aur lookup recursive ban jaata hai. Step 3, BR1 par 10.2.20.0/24 via 172.16.12.2 aur BR2 par 10.1.10.0/24 ka return route; missing return route one-way traffic deta hai. Aakhir mein <code>show interfaces tunnel 0</code> aur traceroute se saabit karo jo tunnel ko ek hop dikhata hai.</p>
<p><b>Lab 2, flapping tunnel.</b> Step 2 tunnel ko upar-neeche hota dikhata hai. Step 3 wajah pakadta hai: <code>show logging | include TUN</code> RECURDOWN dikhata hai aur <code>show ip route 100.64.22.2</code> Tunnel0 via /30 dikhata hai. <code>ip route 100.64.22.0 255.255.255.252 Tunnel0</code> hatao, <code>show ip cef 100.64.22.2</code> se confirm karo ki exit Gi0/0 hai, phir keepalives ka intezaar karo aur PC2 ping karo.</p>
<p><b>Lab 3, crypto map se IPsec.</b> Step 1 pass hota hai: WAN addresses ping hote hain. Tunnel interface nahi hai, isliye step 2 ban jaata hai "kya crypto map Gi0/0 par applied hai?" (<code>show crypto map</code>). Step 4: dono sides par <code>show crypto isakmp policy</code> compare karo, phir key (NKdelBlr26) theek karo. Step 5: <code>show crypto ipsec transform-set</code> BR par AES-128/SHA-1 vs HQ par AES-256/SHA-256 dikhata hai; theek karo aur ACL 110 ke mirror ACL 120 ke saath crypto map jodo. Step 6: PC-BR se ping karo (router se nahi), phir HQ par QM_IDLE aur badhte encaps aur decaps check karo.</p>
<p><b>Lab 4, GRE over IPsec.</b> Steps 1 se 3 pehle se pass hain: GRE tunnel chalta hai. Dono routers par profile lagane ke baad step 4: far WAN address ke saath QM_IDLE. Step 5: BR1 par <code>show crypto ipsec sa</code> protocol 47 wale idents aur Transport in use dikhata hai. Step 6: PC1 se PC2 ping karo aur encaps badhte dekho. Agar sirf ek router par tunnel protection hai, to tunnel toot-ta hai: dono par <code>show running-config interface Tunnel0</code> check karo.</p>

<h3>VRF-specific checks</h3>
<ul>
<li>Kya interface sahi VRF mein hai, address ke saath? <code>show ip vrf interfaces</code>.</li>
<li>Kya aap sahi table mein test kar rahe ho? <code>ping vrf</code>, <code>show ip route vrf</code>.</li>
<li>Kya har VRF ki apni routing (static <code>ip route vrf</code>, per-VRF OSPF process) har hop par hai, neighbour ke subinterface samet?</li>
<li>Front-door VRF ke saath, kya <code>tunnel vrf</code> us VRF ka naam leta hai jahan destination route hai?</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Underlay check kiye bina debugs se shuru karna. Crypto map test karne ke liye router se ping karna. Mismatch fix hone ki ummeed mein baar-baar SAs clear karna (<code>clear crypto sa</code>, <code>clear crypto isakmp</code>). Bhoolna ki plain ping aur show commands global table use karte hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> MM_NO_STATE par atka connectivity ya policy ki taraf ishara karta hai; MM_KEY_EXCH par atka key ki taraf. QM_IDLE healthy phase 1 state hai. Ek-tarfa encaps aur decaps far side par return path, NAT ya routing ki taraf ishara karte hain.</p></div>

<div class="scn"><h4>Friday raat, teen lakshan, ek wajah</h4><p>ISP change ke baad ek branch ne report kiya: tunnel up/up, OSPF neighbour down, aur koi IPsec SA nahi. Engineer ne step 1 se shuru kiya: <code>ping 100.64.22.2 source Gi0/0</code> fail hua. Naye ISP router ko alag default gateway chahiye tha, aur purana config mein reh gaya tha. Kyunki keepalives configure nahi the, stale default route ke saath Tunnel0 ab bhi up/up dikh raha tha. Default route theek karne se IKE, SA aur OSPF ek minute mein order mein wapas aa gaye.</p><p><b>Seekh:</b> hamesha underlay se shuru karo. Zyada tar "VPN problems" ek layer neeche routing problems hote hain.</p></div>

<div class="iv"><p class="q">"Site-to-site IPsec tunnel down hai. Aap kaise troubleshoot karoge?"</p><p>Neeche se upar kaam karo: tunnel source se peer reachability aur UDP 500, 4500 aur ESP allowed hain confirm karo; tunnel ya crypto map applied hai check karo; routing aur no recursion confirm karo; phir <code>show crypto isakmp sa</code> (QM_IDLE, ya MM_NO_STATE ya MM_KEY_EXCH par atka), phir dono sides par SAs, mirrored idents aur counters ke liye <code>show crypto ipsec sa</code>; aakhir mein NAT exemption aur MTU. Show commands se narrow karne ke baad hi conditional debugs use karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: underlay, tunnel interface, routing, phase 1, phase 2, data plane.</li>
<li>RECURDOWN = recursive routing; sanity check failure = key mismatch; Quick Mode failure = transform ya ACL mismatch.</li>
<li>QM_IDLE healthy hai; MM_NO_STATE aur MM_KEY_EXCH policy/connectivity aur key problems ki taraf ishara karte hain.</li>
<li>Kaunsi direction fail ho rahi hai, yeh dhoondhne ke liye dono sides par encaps aur decaps compare karo.</li>
<li>VRFs ke liye har test aur show command ko VRF keyword chahiye.</li>
</ul></div>
`}};export{e as default};