var e={id:`noc-incident`,h:{en:`Troubleshooting workflow: a NOC shift security incident`,hi:`Troubleshooting workflow: NOC shift ka security incident`},body:{en:`
<p>A doctor in an emergency room does not start with the rarest disease. She stabilises the patient, takes the history, runs a few quick tests, forms a diagnosis, treats, and writes notes so the next doctor knows what happened. Security incidents in a NOC work the same way. This chapter gives you the workflow, then walks through the lab ticket step by step, and finishes with a quick guide for VPN tickets.</p>

<h3>The incident-handling lifecycle</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Incident handling lifecycle">
<rect x="10" y="50" width="140" height="60" rx="10" fill="#e2e8f0"/><text x="80" y="76" text-anchor="middle" class="svg-ink" font-size="13">1 Preparation</text><text x="80" y="96" text-anchor="middle" class="svg-muted" font-size="12">tools, baselines</text>
<rect x="170" y="50" width="140" height="60" rx="10" fill="#bae6fd"/><text x="240" y="76" text-anchor="middle" class="svg-ink" font-size="13">2 Detect, analyse</text><text x="240" y="96" text-anchor="middle" class="svg-muted" font-size="12">what, where, since</text>
<rect x="330" y="50" width="140" height="60" rx="10" fill="#fed7aa"/><text x="400" y="72" text-anchor="middle" class="svg-ink" font-size="13">3 Contain,</text><text x="400" y="90" text-anchor="middle" class="svg-ink" font-size="13">eradicate, recover</text>
<rect x="490" y="50" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="560" y="76" text-anchor="middle" class="svg-ink" font-size="13">4 Post-incident</text><text x="560" y="96" text-anchor="middle" class="svg-muted" font-size="12">lessons learned</text>
<line x1="150" y1="80" x2="170" y2="80" stroke="#64748b" stroke-width="2"/><line x1="310" y1="80" x2="330" y2="80" stroke="#64748b" stroke-width="2"/><line x1="470" y1="80" x2="490" y2="80" stroke="#64748b" stroke-width="2"/>
<path d="M560 110 Q 560 150 320 150 Q 80 150 80 110" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="320" y="142" text-anchor="middle" class="svg-accent" font-size="12">lessons feed back into preparation</text>
</svg><p class="cap">The classic incident response cycle (as in the NIST guide): each incident improves the preparation for the next.</p></div>
<ol>
<li><b>Preparation</b>: documentation, baselines (which DHCP server is legitimate, which subnets exist), central logging, access to devices, a playbook.</li>
<li><b>Detection and analysis</b>: reproduce the symptom, collect evidence, classify the attack and its CIA impact, find the source.</li>
<li><b>Containment, eradication and recovery</b>: stop the damage now (block the port, drop the traffic), remove the cause, restore normal service and verify.</li>
<li><b>Post-incident activity</b>: write it up, fix the gap that allowed it, update the standard and the training.</li>
</ol>
<p>Keep a timeline as you work: every command, every finding, with the time. It is evidence, and it helps the next shift.</p>

<h3>Lab walkthrough: Ticket #4711</h3>
<p>"Since this morning my PC gets a strange address and web pages look odd." PC1 is a staff PC on SW1 Gi0/1 in VLAN 10. The only legitimate DHCP server is R1 (10.10.10.1), reached through SW1's uplink Gi0/0 to SW2. Preparation tells you: staff addresses are 10.10.10.100 and above, gateway 10.10.10.1.</p>

<h4>Step 1: reproduce and collect evidence</h4>
<pre class="out">PC1&gt; ip dhcp
DORA IP 172.31.66.2/24 GW 172.31.66.1

PC1&gt; show ip
NAME        : PC1[1]
IP/MASK     : 172.31.66.2/24
<span class="hl">GATEWAY     : 172.31.66.1</span>
<span class="hl">DHCP SERVER : 172.31.66.1</span>
MAC         : 00:50:79:66:68:00</pre>
<p>The gateway and DHCP server are outside 10.10.10.0/24. Someone other than R1 answered DHCP.</p>

<h4>Step 2: classify</h4>
<p>A device answering DHCP and naming itself as default gateway is a <b>rogue DHCP server</b> (DHCP spoofing). Every packet PC1 sends off-subnet now goes to that device: it can read and change traffic, a <b>man-in-the-middle</b> setup that breaks confidentiality and integrity, and it breaks availability of normal services. Intentional or not, it is a security incident.</p>

<h4>Step 3: find the source</h4>
<pre class="out">SW1# show cdp neighbors
Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID
SW2              Gig 0/0           151             S I    IOSv      Gig 0/0
<span class="hl">ROGUE            Gig 0/5           137              R B   IOSv      Gig 0/0</span>

SW1# show mac address-table dynamic vlan 10
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
  10    0050.7966.6800    DYNAMIC     Gi0/1
  10    5000.0001.0000    DYNAMIC     Gi0/0
<span class="hl">  10    5000.0004.0000    DYNAMIC     Gi0/5</span></pre>
<p>A router is plugged into Gi0/5, the meeting-room port. A real attacker's device might not speak CDP, which is why the MAC table (and the port description) matter too.</p>

<h4>Step 4: contain with DHCP snooping</h4>
<pre class="code">SW1(config)# ip dhcp snooping
SW1(config)# ip dhcp snooping vlan 10
SW1(config)# no ip dhcp snooping information option   <span class="c">! R1 is not a relay agent; do not insert option 82</span>
SW1(config)# interface g0/0
SW1(config-if)# ip dhcp snooping trust                 <span class="c">! only the uplink towards R1 may send DHCP server messages</span>
SW1(config-if)# end</pre>
<p>Untrusted ports (Gi0/1, Gi0/5) may send client messages (DISCOVER, REQUEST) but not server messages (OFFER, ACK). The rogue's offers are now dropped. Why disable option 82 insertion? By default the switch adds option 82 with a zero giaddr, and many DHCP servers, including an IOS server that is not configured to trust it, drop such requests; clients would then get no address at all.</p>

<h4>Step 5: recover and verify</h4>
<pre class="out">PC1&gt; ip dhcp
DDORA IP 10.10.10.100/24 GW 10.10.10.1
PC1&gt; ping 10.10.10.1
84 bytes from 10.10.10.1 icmp_seq=1 ttl=255 time=1.412 ms

SW1# show ip dhcp snooping binding
MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface
------------------  ---------------  ----------  -------------  ----  --------------------
<span class="hl">00:50:79:66:68:00   10.10.10.100     86397       dhcp-snooping   10    GigabitEthernet0/1</span>
Total number of bindings: 1

%DHCP_SNOOPING-5-DHCP_SNOOPING_UNTRUSTED_PORT: DHCP_SNOOPING drop message on untrusted port, message type: DHCPOFFER, MAC sa: 5000.0004.0000</pre>
<p>PC1 has a legitimate lease; the binding table recorded it; the log proves the rogue offer was dropped on an untrusted port.</p>

<h4>Step 6: eradicate and learn</h4>
<p>Send someone to the meeting room to remove the device and identify its owner. Then fix the gap: DHCP snooping on every access switch as a standard, DAI to stop ARP-based MITM, 802.1X or at least port security on meeting-room ports, and a note in the user-awareness campaign about not plugging in personal routers.</p>

<h3>Quick guide: VPN tickets</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>No ISAKMP SA at all</td><td>No interesting traffic, crypto map not applied, peer unreachable, UDP 500 blocked</td><td><code>show crypto map</code>, ping peer, ACL in path</td></tr>
<tr><td>State stuck at MM_NO_STATE</td><td>Phase 1 proposal mismatch or wrong pre-shared key</td><td>Compare <code>crypto isakmp policy</code> and key on both peers</td></tr>
<tr><td>QM_IDLE but no IPsec SA</td><td>Phase 2 mismatch: transform set or crypto ACLs not mirrored</td><td><code>show crypto ipsec sa</code>, compare ACLs</td></tr>
<tr><td>Encaps rise, decaps stay 0</td><td>Far side not sending back into the tunnel: its ACL, route or NAT</td><td>Remote peer's counters, routing, NAT exemption</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Timeline entry for the shift log: "09:12 reproduced on PC1, gateway 172.31.66.1. 09:15 classified: rogue DHCP (MITM risk). 09:18 source SW1 Gi0/5 via CDP and MAC table. 09:22 DHCP snooping VLAN 10, Gi0/0 trusted, option 82 insertion off. 09:24 PC1 leased 10.10.10.100, rogue OFFER dropped (log). 09:40 device removed from meeting room B."</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Trusting the wrong port, or forgetting to trust the uplink, so nobody gets an address. (2) Leaving option 82 insertion on with a server that rejects it. (3) Shutting the port but never finding the device, so it reappears on another port. (4) Fixing without recording evidence.</p></div>

<div class="exam"><p><b>Exam trap.</b> Symptom "clients get an unexpected gateway or subnet" points to a rogue DHCP server; mitigation is DHCP snooping with only the uplink trusted. Order of the lifecycle: preparation, detection and analysis, containment/eradication/recovery, post-incident activity.</p></div>

<div class="scn"><h4>Night shift at a hospital</h4><p>At 02:00 the IPS at a hospital raised alerts for SMB exploit attempts from 10.30.4.57 against many hosts. The NOC engineer checked the ARP table on the distribution switch to map the IP to a MAC, traced the MAC to access switch port Gi1/0/22 in the radiology wing, and, following the playbook, moved the port to a quarantine VLAN instead of shutting it, so the security team could still analyse the device remotely. The workstation had missed patches for months. It was rebuilt and patched, and the hospital added the radiology VLAN to monthly patch reporting.</p><p><b>Lesson:</b> follow the lifecycle: detect, find, contain in a way that keeps evidence, recover, and fix the process gap.</p></div>

<div class="iv"><p class="q">"Users report odd default gateways after DHCP. Walk me through what you do."</p><p>Strong answer: reproduce on an affected client and record the gateway and DHCP server it received; compare with the documented legitimate server; classify it as rogue DHCP with MITM risk; find the port with CDP/LLDP, the MAC address table and port descriptions; contain with DHCP snooping, trusting only uplinks towards the real server, and handle option 82; renew clients and verify with the binding table and the snooping drop log; physically remove the device; then roll out snooping, DAI and 802.1X as standards and document the timeline.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Lifecycle: preparation, detection and analysis, containment/eradication/recovery, post-incident activity.</li>
<li>Rogue DHCP: unexpected gateway and server on clients; a MITM enabler.</li>
<li>Find the source with CDP/LLDP, MAC tables and port descriptions.</li>
<li>DHCP snooping: trust only the uplink toward the real server; watch option 82; verify bindings and drop logs.</li>
<li>VPN tickets: no SA, MM_NO_STATE, QM_IDLE without IPsec SA, encaps without decaps each point to a specific layer.</li>
</ul></div>
`,hi:`
<p>Emergency room ki doctor sabse rare bimari se shuru nahi karti. Woh patient ko stable karti hai, history leti hai, kuch jaldi tests chalati hai, diagnosis banati hai, ilaaj karti hai, aur notes likhti hai taaki agla doctor jaane kya hua. NOC mein security incidents bhi aise hi chalte hain. Yeh chapter aapko workflow deta hai, phir lab ticket ko step by step chalata hai, aur VPN tickets ki quick guide ke saath khatam hota hai.</p>

<h3>Incident-handling lifecycle</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Incident handling lifecycle">
<rect x="10" y="50" width="140" height="60" rx="10" fill="#e2e8f0"/><text x="80" y="76" text-anchor="middle" class="svg-ink" font-size="13">1 Preparation</text><text x="80" y="96" text-anchor="middle" class="svg-muted" font-size="12">tools, baselines</text>
<rect x="170" y="50" width="140" height="60" rx="10" fill="#bae6fd"/><text x="240" y="76" text-anchor="middle" class="svg-ink" font-size="13">2 Detect, analyse</text><text x="240" y="96" text-anchor="middle" class="svg-muted" font-size="12">kya, kahan, kab se</text>
<rect x="330" y="50" width="140" height="60" rx="10" fill="#fed7aa"/><text x="400" y="72" text-anchor="middle" class="svg-ink" font-size="13">3 Contain,</text><text x="400" y="90" text-anchor="middle" class="svg-ink" font-size="13">eradicate, recover</text>
<rect x="490" y="50" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="560" y="76" text-anchor="middle" class="svg-ink" font-size="13">4 Post-incident</text><text x="560" y="96" text-anchor="middle" class="svg-muted" font-size="12">lessons learned</text>
<line x1="150" y1="80" x2="170" y2="80" stroke="#64748b" stroke-width="2"/><line x1="310" y1="80" x2="330" y2="80" stroke="#64748b" stroke-width="2"/><line x1="470" y1="80" x2="490" y2="80" stroke="#64748b" stroke-width="2"/>
<path d="M560 110 Q 560 150 320 150 Q 80 150 80 110" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="320" y="142" text-anchor="middle" class="svg-accent" font-size="12">seekh wapas preparation mein jaati hai</text>
</svg><p class="cap">Classic incident response cycle (NIST guide jaisa): har incident agle ke liye preparation behtar karta hai.</p></div>
<ol>
<li><b>Preparation</b>: documentation, baselines (kaunsa DHCP server legitimate hai, kaunse subnets hain), central logging, devices ka access, ek playbook.</li>
<li><b>Detection aur analysis</b>: symptom reproduce karo, evidence ikattha karo, attack aur uska CIA impact classify karo, source dhoondho.</li>
<li><b>Containment, eradication aur recovery</b>: nuksaan abhi roko (port block karo, traffic drop karo), wajah hatao, normal service wapas lao aur verify karo.</li>
<li><b>Post-incident activity</b>: likh kar rakho, woh gap theek karo jisne ise hone diya, standard aur training update karo.</li>
</ol>
<p>Kaam karte waqt timeline rakho: har command, har finding, time ke saath. Yeh evidence hai, aur agli shift ki madad karta hai.</p>

<h3>Lab walkthrough: Ticket #4711</h3>
<p>"Aaj subah se mere PC ko ajeeb address milta hai aur web pages ajeeb dikhte hain." PC1 SW1 Gi0/1 par VLAN 10 ka staff PC hai. Sirf R1 (10.10.10.1) legitimate DHCP server hai, jo SW1 ke uplink Gi0/0 se SW2 ke through milta hai. Preparation batati hai: staff addresses 10.10.10.100 aur upar hain, gateway 10.10.10.1.</p>

<h4>Step 1: reproduce karo aur evidence ikattha karo</h4>
<pre class="out">PC1&gt; ip dhcp
DORA IP 172.31.66.2/24 GW 172.31.66.1

PC1&gt; show ip
NAME        : PC1[1]
IP/MASK     : 172.31.66.2/24
<span class="hl">GATEWAY     : 172.31.66.1</span>
<span class="hl">DHCP SERVER : 172.31.66.1</span>
MAC         : 00:50:79:66:68:00</pre>
<p>Gateway aur DHCP server 10.10.10.0/24 ke bahar hain. R1 ke alawa kisi aur ne DHCP ka jawab diya.</p>

<h4>Step 2: classify karo</h4>
<p>Jo device DHCP ka jawab deta hai aur khud ko default gateway batata hai woh <b>rogue DHCP server</b> (DHCP spoofing) hai. PC1 jo bhi packet subnet ke bahar bhejta hai ab us device par jaata hai: woh traffic padh aur badal sakta hai, yeh <b>man-in-the-middle</b> setup hai jo confidentiality aur integrity todta hai, aur normal services ki availability bhi todta hai. Jaan-boojh kar ho ya nahi, yeh security incident hai.</p>

<h4>Step 3: source dhoondho</h4>
<pre class="out">SW1# show cdp neighbors
Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID
SW2              Gig 0/0           151             S I    IOSv      Gig 0/0
<span class="hl">ROGUE            Gig 0/5           137              R B   IOSv      Gig 0/0</span>

SW1# show mac address-table dynamic vlan 10
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
  10    0050.7966.6800    DYNAMIC     Gi0/1
  10    5000.0001.0000    DYNAMIC     Gi0/0
<span class="hl">  10    5000.0004.0000    DYNAMIC     Gi0/5</span></pre>
<p>Gi0/5, meeting-room port, par ek router plug hai. Asli attacker ka device CDP shayad na bole, isliye MAC table (aur port description) bhi zaroori hain.</p>

<h4>Step 4: DHCP snooping se contain karo</h4>
<pre class="code">SW1(config)# ip dhcp snooping
SW1(config)# ip dhcp snooping vlan 10
SW1(config)# no ip dhcp snooping information option   <span class="c">! R1 relay agent nahi hai; option 82 mat daalo</span>
SW1(config)# interface g0/0
SW1(config-if)# ip dhcp snooping trust                 <span class="c">! sirf R1 ki taraf ka uplink DHCP server messages bhej sakta hai</span>
SW1(config-if)# end</pre>
<p>Untrusted ports (Gi0/1, Gi0/5) client messages (DISCOVER, REQUEST) bhej sakte hain lekin server messages (OFFER, ACK) nahi. Rogue ke offers ab drop hote hain. Option 82 insertion kyun band karo? Default mein switch zero giaddr ke saath option 82 jodta hai, aur kai DHCP servers, jismein woh IOS server bhi hai jo ise trust karne ke liye configured nahi, aisi requests drop kar dete hain; tab clients ko koi address hi nahi milta.</p>

<h4>Step 5: recover aur verify karo</h4>
<pre class="out">PC1&gt; ip dhcp
DDORA IP 10.10.10.100/24 GW 10.10.10.1
PC1&gt; ping 10.10.10.1
84 bytes from 10.10.10.1 icmp_seq=1 ttl=255 time=1.412 ms

SW1# show ip dhcp snooping binding
MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface
------------------  ---------------  ----------  -------------  ----  --------------------
<span class="hl">00:50:79:66:68:00   10.10.10.100     86397       dhcp-snooping   10    GigabitEthernet0/1</span>
Total number of bindings: 1

%DHCP_SNOOPING-5-DHCP_SNOOPING_UNTRUSTED_PORT: DHCP_SNOOPING drop message on untrusted port, message type: DHCPOFFER, MAC sa: 5000.0004.0000</pre>
<p>PC1 ke paas legitimate lease hai; binding table ne use record kiya; log prove karta hai ki rogue offer untrusted port par drop hua.</p>

<h4>Step 6: eradicate karo aur seekho</h4>
<p>Kisi ko meeting room bhejo taaki device hataye aur uska maalik pehchaane. Phir gap theek karo: har access switch par standard ke roop mein DHCP snooping, ARP-based MITM rokne ke liye DAI, meeting-room ports par 802.1X ya kam se kam port security, aur user-awareness campaign mein personal routers plug na karne ka note.</p>

<h3>Quick guide: VPN tickets</h3>
<table class="cmp"><tr><th>Symptom</th><th>Sambhavit wajah</th><th>Check</th></tr>
<tr><td>ISAKMP SA bilkul nahi</td><td>Interesting traffic nahi, crypto map apply nahi, peer unreachable, UDP 500 blocked</td><td><code>show crypto map</code>, peer ko ping, raaste ki ACL</td></tr>
<tr><td>State MM_NO_STATE par atka</td><td>Phase 1 proposal mismatch ya galat pre-shared key</td><td>Dono peers par <code>crypto isakmp policy</code> aur key compare karo</td></tr>
<tr><td>QM_IDLE lekin IPsec SA nahi</td><td>Phase 2 mismatch: transform set ya crypto ACLs mirror nahi</td><td><code>show crypto ipsec sa</code>, ACLs compare karo</td></tr>
<tr><td>Encaps badhe, decaps 0 rahe</td><td>Doosri side tunnel mein wapas nahi bhej rahi: uski ACL, route ya NAT</td><td>Remote peer ke counters, routing, NAT exemption</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Shift log ke liye timeline entry: "09:12 PC1 par reproduce kiya, gateway 172.31.66.1. 09:15 classify kiya: rogue DHCP (MITM risk). 09:18 source CDP aur MAC table se SW1 Gi0/5. 09:22 DHCP snooping VLAN 10, Gi0/0 trusted, option 82 insertion off. 09:24 PC1 ko 10.10.10.100 lease mila, rogue OFFER drop hua (log). 09:40 device meeting room B se hataya."</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Galat port ko trust karna, ya uplink trust karna bhoolna, jisse kisi ko address nahi milta. (2) Aise server ke saath option 82 insertion on chhodna jo use reject karta hai. (3) Port band karna lekin device kabhi na dhoondhna, jisse woh doosre port par wapas aa jaata hai. (4) Bina evidence record kiye fix karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Symptom "clients ko unexpected gateway ya subnet milta hai" rogue DHCP server ki taraf ishara karta hai; mitigation hai DHCP snooping jismein sirf uplink trusted ho. Lifecycle ka order: preparation, detection aur analysis, containment/eradication/recovery, post-incident activity.</p></div>

<div class="scn"><h4>Hospital ki night shift</h4><p>Raat 02:00 baje ek hospital ke IPS ne 10.30.4.57 se kai hosts par SMB exploit attempts ke alerts diye. NOC engineer ne IP ko MAC se map karne ke liye distribution switch ki ARP table check ki, MAC ko radiology wing ke access switch port Gi1/0/22 tak trace kiya, aur playbook ke hisaab se port ko band karne ki jagah quarantine VLAN mein daala, taaki security team device ko remotely analyse kar sake. Workstation par mahino se patches nahi lage the. Use rebuild aur patch kiya gaya, aur hospital ne radiology VLAN ko monthly patch reporting mein joda.</p><p><b>Seekh:</b> lifecycle follow karo: detect karo, dhoondho, aise contain karo ki evidence bacha rahe, recover karo, aur process gap theek karo.</p></div>

<div class="iv"><p class="q">"Users DHCP ke baad ajeeb default gateways report kar rahe hain. Batao aap kya karoge."</p><p>Strong answer: affected client par reproduce karo aur use mila gateway aur DHCP server record karo; documented legitimate server se compare karo; ise MITM risk wala rogue DHCP classify karo; CDP/LLDP, MAC address table aur port descriptions se port dhoondho; DHCP snooping se contain karo, sirf asli server ki taraf ke uplinks trust karo, aur option 82 sambhalo; clients renew karo aur binding table aur snooping drop log se verify karo; device physically hatao; phir snooping, DAI aur 802.1X ko standards ki tarah roll out karo aur timeline document karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Lifecycle: preparation, detection aur analysis, containment/eradication/recovery, post-incident activity.</li>
<li>Rogue DHCP: clients par unexpected gateway aur server; MITM ko possible banata hai.</li>
<li>CDP/LLDP, MAC tables aur port descriptions se source dhoondho.</li>
<li>DHCP snooping: sirf asli server ki taraf ka uplink trust karo; option 82 dekho; bindings aur drop logs verify karo.</li>
<li>VPN tickets: no SA, MM_NO_STATE, bina IPsec SA ke QM_IDLE, bina decaps ke encaps har ek specific layer ki taraf ishara karta hai.</li>
</ul></div>
`}};export{e as default};