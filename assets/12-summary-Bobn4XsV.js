var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a long drive, a good driver runs through a short checklist: fuel, tyres, mirrors, route, emergency number. This chapter is that checklist for objectives 3.1, 3.2 and 3.3. Read it the day before the exam, and come back to it whenever you design monitoring or a DR plan at work.</p>

<h3>Can you do this?</h3>
<ul>
<li>Choose the right document for a question: physical vs logical diagram, layer 1/2/3 diagram, rack diagram, cable map, asset inventory, IPAM, SLA, site survey heat map.</li>
<li>Explain EOL vs EOS, and what software management (patches, OS, firmware) and decommissioning involve.</li>
<li>Walk through a change request with risk assessment, approval, maintenance window, verification and rollback plan.</li>
<li>Distinguish production, backup and baseline/golden configurations.</li>
<li>Configure syslog to a collector at the right level, and read the severity of any message.</li>
<li>Configure an SNMP read-only community restricted by ACL, enable specific traps with a trap host and trap source, and test with snmpget.</li>
<li>Explain SNMPv1, v2c and v3, MIB and OID, traps vs informs, and which ports are used.</li>
<li>Choose between flow data, packet capture and port mirroring for a given problem.</li>
<li>Calculate link utilisation from counters and explain baselines and anomaly alerting.</li>
<li>Name the five monitoring solutions and the difference between ad hoc and scheduled discovery.</li>
<li>Define RPO, RTO, MTTR and MTBF, calculate availability, and match cold, warm and hot sites to RTO targets.</li>
<li>Compare active-active and active-passive, and tabletop exercises and validation tests.</li>
</ul>

<h3>Ports to know</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Monitoring protocol port numbers">
<rect x="10" y="20" width="145" height="56" rx="8" fill="#bae6fd"/><text x="82" y="44" text-anchor="middle" class="svg-ink" font-size="14">SNMP polls</text><text x="82" y="64" text-anchor="middle" class="svg-accent" font-size="13">UDP 161</text>
<rect x="170" y="20" width="145" height="56" rx="8" fill="#bbf7d0"/><text x="242" y="44" text-anchor="middle" class="svg-ink" font-size="14">Traps, informs</text><text x="242" y="64" text-anchor="middle" class="svg-accent" font-size="13">UDP 162</text>
<rect x="330" y="20" width="145" height="56" rx="8" fill="#fde68a"/><text x="402" y="44" text-anchor="middle" class="svg-ink" font-size="14">Syslog</text><text x="402" y="64" text-anchor="middle" class="svg-accent" font-size="13">UDP 514</text>
<rect x="490" y="20" width="140" height="56" rx="8" fill="#fed7aa"/><text x="560" y="44" text-anchor="middle" class="svg-ink" font-size="14">Syslog TLS</text><text x="560" y="64" text-anchor="middle" class="svg-accent" font-size="13">TCP 6514</text>
<rect x="10" y="96" width="145" height="56" rx="8" fill="#ddd6fe"/><text x="82" y="120" text-anchor="middle" class="svg-ink" font-size="14">IPFIX</text><text x="82" y="140" text-anchor="middle" class="svg-accent" font-size="13">UDP 4739</text>
<rect x="170" y="96" width="145" height="56" rx="8" fill="#e2e8f0"/><text x="242" y="120" text-anchor="middle" class="svg-ink" font-size="14">NTP</text><text x="242" y="140" text-anchor="middle" class="svg-accent" font-size="13">UDP 123</text>
<rect x="330" y="96" width="300" height="56" rx="8" fill="#e2e8f0"/><text x="480" y="120" text-anchor="middle" class="svg-ink" font-size="14">NetFlow export</text><text x="480" y="140" text-anchor="middle" class="svg-muted" font-size="12">configurable, often UDP 2055</text>
</svg><p class="cap">The port numbers most often tested in this objective.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Baseline</dt><dd>Recorded normal values of metrics, used to spot anomalies.</dd>
<dt>Golden configuration</dt><dd>The approved standard configuration for a device role.</dd>
<dt>IPAM</dt><dd>IP address management: tracks blocks, subnets and addresses with DHCP and DNS.</dd>
<dt>MIB / OID</dt><dd>The catalogue of SNMP objects / the numeric identifier of one object.</dd>
<dt>Trap / inform</dt><dd>Unsolicited SNMP notification; an inform is acknowledged.</dd>
<dt>SIEM</dt><dd>Collects, normalises and correlates logs from many sources and raises alerts.</dd>
<dt>Flow</dt><dd>Packets sharing the same key fields; exported as metadata (NetFlow, IPFIX, sFlow).</dd>
<dt>SPAN / TAP</dt><dd>Switch port mirroring / hardware device that copies traffic from a link.</dd>
<dt>RPO / RTO</dt><dd>Maximum data loss in time / maximum downtime.</dd>
<dt>MTTR / MTBF</dt><dd>Average repair time / average time between failures.</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li>Syslog severity 0 = emergency (most severe), 7 = debug. Setting a level includes all more severe levels.</li>
<li>Only SNMPv3 provides authentication and encryption; v1 and v2c send community strings in clear text.</li>
<li>A wrong community or ACL-blocked source produces a <b>timeout</b>.</li>
<li>Flow data = who, when, how much, no payload; packet capture = full content.</li>
<li>Scheduled discovery runs automatically; ad hoc runs on demand.</li>
<li>EOS means no more patches or support.</li>
<li>Cold site = space and power; warm = equipment with older data; hot = running with current data.</li>
<li>Availability = MTBF ÷ (MTBF + MTTR).</li>
<li>Tabletop = discussion; validation test = actually fail over or restore.</li>
</ul>

<h3>Command cheat-sheet (lab CLI)</h3>
<pre class="code"><span class="c">! syslog</span>
logging host 192.168.50.100
logging trap informational
<span class="c">! SNMP polling, restricted</span>
access-list 20 permit host 192.168.50.100
snmp-server community NP-RO RO 20
snmp-server location Rack-A3
<span class="c">! SNMP traps</span>
snmp-server enable traps snmp linkdown linkup
snmp-server enable traps config
snmp-server host 192.168.50.100 version 2c NP-TRAP
snmp-server trap-source Loopback0
<span class="c">! verify on the device and on the NMS</span>
show logging
show snmp
show snmp host
NMS&gt; show syslog
NMS&gt; show traps
NMS&gt; snmpget -c NP-RO 192.168.50.1 sysLocation.0</pre>

<div class="warn"><p><b>Last-minute mistakes.</b> Swapping RPO and RTO. Swapping UDP 161 and 162. Thinking <code>logging trap</code> is an SNMP command. Believing a SIEM and a syslog server are the same thing. Choosing a logical diagram when the question asks where a cable is plugged in.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Read every scenario for the key word: "where" (physical/rack/cable map), "how traffic flows" (logical), "how much data can we lose" (RPO), "how fast back" (RTO), "who is using the bandwidth" (flow data), "what exactly was sent" (packet capture), "normal behaviour" (baseline), "approved standard config" (golden configuration).</p></div>

<div class="scn"><h4>The first week in the NOC</h4><p>A new NOC engineer, Asha, was asked to onboard a new branch. Using this checklist she reserved subnets in IPAM, added the devices to the inventory with software versions and support dates, applied the golden configuration including syslog, SNMPv3 and NTP, confirmed traps and logs arrived at the NMS, let the monitoring platform run a week to build a baseline, and added the branch to the DR plan with its RTO. Two months later a fibre cut at the branch triggered a linkDown trap, the on-call phone rang within a minute, the backup LTE link took over, and the cable map sent the provider to the right handhole.</p><p><b>Lesson:</b> documentation, monitoring and recovery planning together turn a potential outage into a routine ticket.</p></div>

<div class="iv"><p class="q">"If you joined our team tomorrow, what would you check first about our monitoring and documentation?"</p><p>Strong answer: whether diagrams, inventory and IPAM match the live network; whether every device sends syslog to a collector or SIEM at a sensible level with NTP-synced timestamps; whether SNMP uses v3 or at least restricted read-only communities and traps reach the NMS; whether baselines and alerts exist and reach the on-call engineer; whether configurations are backed up and compared with golden configs; and whether the DR plan has agreed RPO/RTO and has been tested recently.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>3.1: document physically and logically, keep inventory and IPAM current, control changes and configurations.</li>
<li>3.2: SNMP, syslog, flow data, packet capture, mirroring, APIs and baselines feed monitoring solutions.</li>
<li>3.3: set RPO and RTO per service, measure MTBF and MTTR, choose the right DR site and HA model.</li>
<li>Test everything: failovers, restores and the people and process through tabletop exercises.</li>
<li>Memorise ports 161, 162, 514, 6514 and severity levels 0 to 7.</li>
</ul></div>
`,hi:`
<p>Lambi drive se pehle achha driver ek chhoti checklist dekhta hai: fuel, tyres, mirrors, route, emergency number. Yeh chapter objectives 3.1, 3.2 aur 3.3 ke liye wahi checklist hai. Exam se ek din pehle padho, aur jab bhi kaam par monitoring ya DR plan design karo, yahan wapas aao.</p>

<h3>Kya aap yeh kar sakte ho?</h3>
<ul>
<li>Sawaal ke liye sahi document chunna: physical vs logical diagram, layer 1/2/3 diagram, rack diagram, cable map, asset inventory, IPAM, SLA, site survey heat map.</li>
<li>EOL vs EOS samjhana, aur software management (patches, OS, firmware) aur decommissioning mein kya hota hai.</li>
<li>Risk assessment, approval, maintenance window, verification aur rollback plan ke saath change request walk karna.</li>
<li>Production, backup aur baseline/golden configurations mein farak karna.</li>
<li>Sahi level par collector ko syslog configure karna, aur kisi bhi message ki severity padhna.</li>
<li>ACL se restricted SNMP read-only community configure karna, trap host aur trap source ke saath specific traps enable karna, aur snmpget se test karna.</li>
<li>SNMPv1, v2c aur v3, MIB aur OID, traps vs informs, aur kaunse ports use hote hain, samjhana.</li>
<li>Kisi problem ke liye flow data, packet capture aur port mirroring mein se chunna.</li>
<li>Counters se link utilisation calculate karna aur baselines aur anomaly alerting samjhana.</li>
<li>Paanch monitoring solutions aur ad hoc aur scheduled discovery ka farak batana.</li>
<li>RPO, RTO, MTTR aur MTBF define karna, availability calculate karna, aur cold, warm aur hot sites ko RTO targets se match karna.</li>
<li>Active-active aur active-passive, aur tabletop exercises aur validation tests compare karna.</li>
</ul>

<h3>Ports jo yaad hone chahiye</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Monitoring protocols ke port numbers">
<rect x="10" y="20" width="145" height="56" rx="8" fill="#bae6fd"/><text x="82" y="44" text-anchor="middle" class="svg-ink" font-size="14">SNMP polls</text><text x="82" y="64" text-anchor="middle" class="svg-accent" font-size="13">UDP 161</text>
<rect x="170" y="20" width="145" height="56" rx="8" fill="#bbf7d0"/><text x="242" y="44" text-anchor="middle" class="svg-ink" font-size="14">Traps, informs</text><text x="242" y="64" text-anchor="middle" class="svg-accent" font-size="13">UDP 162</text>
<rect x="330" y="20" width="145" height="56" rx="8" fill="#fde68a"/><text x="402" y="44" text-anchor="middle" class="svg-ink" font-size="14">Syslog</text><text x="402" y="64" text-anchor="middle" class="svg-accent" font-size="13">UDP 514</text>
<rect x="490" y="20" width="140" height="56" rx="8" fill="#fed7aa"/><text x="560" y="44" text-anchor="middle" class="svg-ink" font-size="14">Syslog TLS</text><text x="560" y="64" text-anchor="middle" class="svg-accent" font-size="13">TCP 6514</text>
<rect x="10" y="96" width="145" height="56" rx="8" fill="#ddd6fe"/><text x="82" y="120" text-anchor="middle" class="svg-ink" font-size="14">IPFIX</text><text x="82" y="140" text-anchor="middle" class="svg-accent" font-size="13">UDP 4739</text>
<rect x="170" y="96" width="145" height="56" rx="8" fill="#e2e8f0"/><text x="242" y="120" text-anchor="middle" class="svg-ink" font-size="14">NTP</text><text x="242" y="140" text-anchor="middle" class="svg-accent" font-size="13">UDP 123</text>
<rect x="330" y="96" width="300" height="56" rx="8" fill="#e2e8f0"/><text x="480" y="120" text-anchor="middle" class="svg-ink" font-size="14">NetFlow export</text><text x="480" y="140" text-anchor="middle" class="svg-muted" font-size="12">configurable, aksar UDP 2055</text>
</svg><p class="cap">Is objective mein sabse zyada test hone wale port numbers.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Baseline</dt><dd>Metrics ki recorded normal values, anomalies pakadne ke liye.</dd>
<dt>Golden configuration</dt><dd>Kisi device role ke liye approved standard configuration.</dd>
<dt>IPAM</dt><dd>IP address management: DHCP aur DNS ke saath blocks, subnets aur addresses track karta hai.</dd>
<dt>MIB / OID</dt><dd>SNMP objects ka catalogue / ek object ka numeric identifier.</dd>
<dt>Trap / inform</dt><dd>Bina maange SNMP notification; inform acknowledge hota hai.</dd>
<dt>SIEM</dt><dd>Bahut saare sources ke logs collect, normalise aur correlate karta hai aur alerts raise karta hai.</dd>
<dt>Flow</dt><dd>Same key fields wale packets; metadata ke roop mein export hote hain (NetFlow, IPFIX, sFlow).</dd>
<dt>SPAN / TAP</dt><dd>Switch port mirroring / hardware device jo link se traffic copy karta hai.</dd>
<dt>RPO / RTO</dt><dd>Time mein maximum data loss / maximum downtime.</dd>
<dt>MTTR / MTBF</dt><dd>Average repair time / failures ke beech average time.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<ul>
<li>Syslog severity 0 = emergency (sabse serious), 7 = debug. Level set karne mein saare zyada serious levels shamil hote hain.</li>
<li>Sirf SNMPv3 authentication aur encryption deta hai; v1 aur v2c community strings clear text mein bhejte hain.</li>
<li>Galat community ya ACL se blocked source <b>timeout</b> deta hai.</li>
<li>Flow data = kaun, kab, kitna, bina payload; packet capture = poora content.</li>
<li>Scheduled discovery apne aap chalti hai; ad hoc zaroorat par.</li>
<li>EOS matlab aur patches ya support nahi.</li>
<li>Cold site = space aur power; warm = purane data ke saath equipment; hot = current data ke saath chalu.</li>
<li>Availability = MTBF ÷ (MTBF + MTTR).</li>
<li>Tabletop = discussion; validation test = sach mein fail over ya restore.</li>
</ul>

<h3>Command cheat-sheet (lab CLI)</h3>
<pre class="code"><span class="c">! syslog</span>
logging host 192.168.50.100
logging trap informational
<span class="c">! SNMP polling, restricted</span>
access-list 20 permit host 192.168.50.100
snmp-server community NP-RO RO 20
snmp-server location Rack-A3
<span class="c">! SNMP traps</span>
snmp-server enable traps snmp linkdown linkup
snmp-server enable traps config
snmp-server host 192.168.50.100 version 2c NP-TRAP
snmp-server trap-source Loopback0
<span class="c">! device aur NMS par verify karo</span>
show logging
show snmp
show snmp host
NMS&gt; show syslog
NMS&gt; show traps
NMS&gt; snmpget -c NP-RO 192.168.50.1 sysLocation.0</pre>

<div class="warn"><p><b>Aakhri minute ki galtiyan.</b> RPO aur RTO ulat dena. UDP 161 aur 162 ulat dena. Sochna ki <code>logging trap</code> SNMP command hai. Maanna ki SIEM aur syslog server ek hi cheez hain. Jab sawaal pooche ki cable kahan plug hai tab logical diagram chunna.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Har scenario mein key word dhoondho: "kahan" (physical/rack/cable map), "traffic kaise flow karta hai" (logical), "kitna data kho sakte hain" (RPO), "kitni jaldi wapas" (RTO), "bandwidth kaun use kar raha hai" (flow data), "exactly kya bheja gaya" (packet capture), "normal behaviour" (baseline), "approved standard config" (golden configuration).</p></div>

<div class="scn"><h4>NOC mein pehla hafta</h4><p>Ek naye NOC engineer, Asha, ko ek nayi branch onboard karne ko kaha gaya. Is checklist se usne IPAM mein subnets reserve kiye, devices ko software versions aur support dates ke saath inventory mein joda, syslog, SNMPv3 aur NTP samet golden configuration lagayi, confirm kiya ki traps aur logs NMS tak pahunch rahe hain, monitoring platform ko baseline banane ke liye ek hafta chalne diya, aur branch ko uske RTO ke saath DR plan mein joda. Do mahine baad branch par fibre cut se linkDown trap aaya, ek minute ke andar on-call phone baja, backup LTE link ne take over kiya, aur cable map ne provider ko sahi handhole par bheja.</p><p><b>Seekh:</b> documentation, monitoring aur recovery planning milkar ek sambhavit outage ko routine ticket bana dete hain.</p></div>

<div class="iv"><p class="q">"Agar aap kal hamari team join karo, to hamari monitoring aur documentation ke baare mein sabse pehle kya check karoge?"</p><p>Strong answer: kya diagrams, inventory aur IPAM live network se match karte hain; kya har device NTP-synced timestamps ke saath sensible level par collector ya SIEM ko syslog bhejta hai; kya SNMP v3 ya kam se kam restricted read-only communities use karta hai aur traps NMS tak pahunchte hain; kya baselines aur alerts hain aur on-call engineer tak pahunchte hain; kya configurations ka backup hota hai aur golden configs se compare hoti hain; aur kya DR plan mein agreed RPO/RTO hain aur haal mein test hua hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>3.1: physically aur logically document karo, inventory aur IPAM current rakho, changes aur configurations control karo.</li>
<li>3.2: SNMP, syslog, flow data, packet capture, mirroring, APIs aur baselines monitoring solutions ko feed karte hain.</li>
<li>3.3: har service ke liye RPO aur RTO set karo, MTBF aur MTTR naapo, sahi DR site aur HA model chuno.</li>
<li>Sab kuch test karo: failovers, restores, aur tabletop exercises se log aur process.</li>
<li>Ports 161, 162, 514, 6514 aur severity levels 0 se 7 yaad karo.</li>
</ul></div>
`}};export{e as default};