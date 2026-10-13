var e={id:`appliances`,h:{en:`Network appliances: what each box decides, and where it sits`,hi:`Network appliances: har box kya decide karta hai, aur kahan baithta hai`},body:{en:`
<p>Objective 1.2 asks you to compare network <b>appliances</b>, physical and virtual. The easiest way to remember them is to ask two questions for each box: <b>what decision does it make</b>, and <b>which layer's information does it use</b> to make it? Think of an airport. The runway controller decides where planes go (router). The gate staff check your boarding pass (switch). Security screening checks every bag (firewall). A camera room watches and raises alarms (IDS), while a guard can physically stop someone (IPS). The check-in counters share passengers between desks (load balancer). And a travel agent books on your behalf (proxy).</p>

<h3>Router and switch</h3>
<p>A <b>router</b> connects different IP networks and forwards packets using the destination IP and its routing table (Layer 3). It is the default gateway for hosts, separates broadcast domains, and at the internet edge usually also performs NAT. A <b>switch</b> connects hosts inside one network and forwards frames using the destination MAC and its MAC address table (Layer 2). It creates a separate collision domain on every port and uses VLANs to split one switch into several broadcast domains. A <b>Layer 3 (multilayer) switch</b> does both: switching within a VLAN and routing between VLANs in hardware, which is why it sits in the core or distribution of most campuses. Access switches often provide <b>PoE</b> to power phones, cameras and access points.</p>

<h3>Firewall</h3>
<p>A <b>firewall</b> enforces a security policy between zones such as inside, outside and a <b>DMZ</b> (screened subnet for public servers). Three generations matter:</p>
<ul>
<li><b>Packet filter (stateless):</b> matches each packet on IP addresses, protocol and ports, for example a router ACL. It does not remember connections, so return traffic needs its own rule.</li>
<li><b>Stateful firewall:</b> tracks each connection in a state table and automatically allows the replies. Works at Layers 3 and 4.</li>
<li><b>Next-generation firewall (NGFW):</b> stateful plus application identification (Layer 7), user identity, URL filtering, built-in IPS and optional TLS inspection. It can allow a social site but block its file uploads.</li>
</ul>
<p>Firewalls end their rule list with an implicit deny: anything not explicitly allowed is dropped.</p>

<h3>IDS and IPS</h3>
<p>An <b>IDS</b> (intrusion detection system) watches a <b>copy</b> of the traffic, from a switch SPAN port or a network TAP, and <b>alerts</b>. It sits out-of-band, so it cannot stop an attack and never slows or breaks traffic. An <b>IPS</b> (intrusion prevention system) sits <b>inline</b>; every packet passes through it, so it can <b>drop</b> malicious packets and reset connections, but if it fails or has a false positive it can block good traffic. Both detect with <b>signatures</b> (known attack patterns) or <b>anomaly/behaviour</b> baselines. They exist as network devices (NIDS/NIPS) and as host software (HIDS/HIPS).</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Where appliances sit in an enterprise">
<rect x="250" y="8" width="140" height="32" rx="6" fill="#e2e8f0"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<rect x="250" y="62" width="140" height="32" rx="6" fill="#fed7aa"/><text x="320" y="83" text-anchor="middle" class="svg-ink" font-size="13">Edge router</text>
<rect x="230" y="116" width="180" height="32" rx="6" fill="#fde68a"/><text x="320" y="137" text-anchor="middle" class="svg-ink" font-size="13">NGFW with inline IPS</text>
<rect x="450" y="116" width="180" height="32" rx="6" fill="#bbf7d0"/><text x="540" y="137" text-anchor="middle" class="svg-ink" font-size="12">DMZ: reverse proxy, LB</text>
<rect x="10" y="116" width="180" height="32" rx="6" fill="#ddd6fe"/><text x="100" y="137" text-anchor="middle" class="svg-ink" font-size="12">IDS on SPAN copy</text>
<rect x="230" y="170" width="180" height="32" rx="6" fill="#bae6fd"/><text x="320" y="191" text-anchor="middle" class="svg-ink" font-size="13">Core L3 switch</text>
<rect x="10" y="226" width="150" height="32" rx="6" fill="#bae6fd"/><text x="85" y="247" text-anchor="middle" class="svg-ink" font-size="12">Access switch, PoE</text>
<rect x="175" y="226" width="140" height="32" rx="6" fill="#bbf7d0"/><text x="245" y="247" text-anchor="middle" class="svg-ink" font-size="12">WLC and APs</text>
<rect x="330" y="226" width="140" height="32" rx="6" fill="#e2e8f0"/><text x="400" y="247" text-anchor="middle" class="svg-ink" font-size="12">Forward proxy</text>
<rect x="485" y="226" width="145" height="32" rx="6" fill="#fed7aa"/><text x="557" y="247" text-anchor="middle" class="svg-ink" font-size="12">NAS and SAN</text>
<line x1="320" y1="40" x2="320" y2="62" stroke="#64748b"/><line x1="320" y1="94" x2="320" y2="116" stroke="#64748b"/><line x1="410" y1="132" x2="450" y2="132" stroke="#64748b"/><line x1="190" y1="132" x2="230" y2="132" stroke="#64748b" stroke-dasharray="4 3"/><line x1="320" y1="148" x2="320" y2="170" stroke="#64748b"/>
<line x1="300" y1="202" x2="85" y2="226" stroke="#64748b"/><line x1="310" y1="202" x2="245" y2="226" stroke="#64748b"/><line x1="330" y1="202" x2="400" y2="226" stroke="#64748b"/><line x1="340" y1="202" x2="557" y2="226" stroke="#64748b"/>
</svg><p class="cap">The IPS is inline in the traffic path; the IDS receives a copy (dashed). Public services sit in the DMZ behind a reverse proxy or load balancer.</p></div>

<h3>Load balancer</h3>
<p>A <b>load balancer</b> presents one <b>virtual IP (VIP)</b> for a service and spreads connections across a pool of servers. It runs <b>health checks</b> and stops sending traffic to a server that fails them. Common methods: <b>round robin</b>, <b>weighted</b>, <b>least connections</b>. A <b>Layer 4</b> load balancer decides by IP and port only; a <b>Layer 7</b> load balancer reads the request (URL path, host header, cookie) and can send /images to one pool and /api to another. Extras: <b>persistence</b> (sticky sessions keep a user on the same server) and <b>TLS offload</b> (the load balancer does the encryption work).</p>

<h3>Proxy</h3>
<p>A <b>proxy</b> makes requests on behalf of someone else, so the other side sees the proxy's address. A <b>forward proxy</b> sits in front of <b>clients</b> going out to the internet: it filters URLs, caches content, logs usage and hides internal addresses. It can be <b>explicit</b> (browsers are configured to use it) or <b>transparent</b> (traffic is redirected to it without client settings). A <b>reverse proxy</b> sits in front of <b>servers</b>, receives requests from the internet and passes them to internal servers, hiding them and often adding caching, TLS termination and web application firewall checks.</p>

<h3>NAS and SAN</h3>
<p><b>NAS</b> (network-attached storage) is a storage appliance on the normal IP network that shares <b>files</b> using SMB (Windows) or NFS (Linux). Users see a shared folder. A <b>SAN</b> (storage area network) is a dedicated network that gives servers <b>block-level</b> access to disks, using Fibre Channel or iSCSI (SCSI over TCP/IP, port 3260). The server sees a local-looking disk (a LUN) and formats it itself. Memory aid: NAS = folders, SAN = disks.</p>

<h3>Wireless: access points and controllers</h3>
<p>An <b>access point (AP)</b> bridges wireless clients onto the wired LAN (Layer 2). An <b>autonomous</b> AP is configured one by one. <b>Lightweight</b> APs are managed centrally by a <b>wireless LAN controller (WLC)</b>, which pushes configuration, manages channels and power, and handles roaming; APs tunnel to it with CAPWAP (UDP 5246 control, 5247 data). Cloud-managed APs use a controller hosted by the vendor.</p>

<h3>Physical versus virtual appliances</h3>
<p>Every appliance above also exists as a <b>virtual appliance</b>: software running on a hypervisor or in the cloud (network functions virtualisation, NFV). Virtual firewalls, routers and load balancers can be deployed in minutes and scaled with the workload; physical appliances give dedicated hardware performance and are still common at the edge and in the core.</p>

<div class="eg"><p><b>Worked example: pick the appliance.</b> Spread web traffic across four servers and remove a failed one automatically: load balancer. Block staff from gambling sites and cache software updates: forward proxy. Alert the SOC about scans without any risk to traffic: IDS on a SPAN port. Give eight hypervisors shared block storage: SAN. Give users a shared department folder: NAS. Manage 120 APs from one place: WLC.</p></div>

<div class="warn"><p><b>Common mistake.</b> Putting an IDS inline "to be safe" and expecting it to block attacks. An IDS only alerts; blocking requires an inline IPS. The reverse mistake: turning on every IPS signature in blocking mode on day one, causing false positives that break business applications. Tune in detect mode first.</p></div>

<div class="exam"><p><b>Exam traps.</b> Out-of-band, alerts only = IDS. Inline, can drop = IPS. Forward proxy protects clients; reverse proxy protects servers. NAS = file-level (SMB/NFS); SAN = block-level (Fibre Channel/iSCSI). A load balancer uses health checks and a VIP. Lightweight APs need a controller.</p></div>

<div class="scn"><h4>The alert that nobody could stop</h4><p>A company's IDS on a SPAN port raised a high-severity alert for an exploit against the public web server at 02:10. The alert went to an email inbox; by the time anyone read it at 09:00, the server had been compromised. The fix had two parts: the web server moved behind a reverse proxy with WAF rules in the DMZ, and the edge firewall's IPS module was enabled inline for the DMZ with the relevant signatures in block mode, after a week of tuning in alert mode.</p><p><b>Lesson:</b> detection without prevention (or without someone watching) only tells you what already happened.</p></div>

<div class="iv"><p class="q">"What is the difference between an IDS and an IPS, and where would you place each?"</p><p>Strong answer: an IDS is passive; it receives a copy of traffic from a SPAN or TAP and generates alerts, so it cannot block but also cannot break traffic. An IPS is inline and can drop packets or reset sessions, so it must be sized for throughput and tuned to avoid false positives, and you decide whether it fails open or closed. Place an IPS inline at the internet edge or in front of the DMZ, and IDS sensors on internal segments for visibility. Mention signature versus anomaly detection.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Router = L3 between networks; switch = L2 within a network; multilayer switch does both.</li>
<li>Firewalls: stateless packet filter, stateful, and NGFW with Layer 7 awareness; DMZ for public servers.</li>
<li>IDS is out-of-band and alerts; IPS is inline and blocks.</li>
<li>Load balancer = VIP, pool, health checks, L4 or L7; forward proxy for clients, reverse proxy for servers.</li>
<li>NAS shares files, SAN shares blocks; lightweight APs are run by a WLC; all can be virtual appliances.</li>
</ul></div>
`,hi:`
<p>Objective 1.2 aapse network <b>appliances</b>, physical aur virtual, compare karwata hai. Unhe yaad rakhne ka sabse aasaan tareeka har box ke liye do sawaal poochna hai: <b>woh kya decision leta hai</b>, aur <b>kis layer ki information se</b> leta hai? Ek airport socho. Runway controller decide karta hai planes kahan jaayenge (router). Gate staff aapka boarding pass check karta hai (switch). Security screening har bag check karti hai (firewall). Camera room dekhta hai aur alarm bajata hai (IDS), jabki guard kisi ko physically rok sakta hai (IPS). Check-in counters passengers ko desks mein baantte hain (load balancer). Aur travel agent aapki taraf se booking karta hai (proxy).</p>

<h3>Router aur switch</h3>
<p><b>Router</b> alag IP networks ko jodta hai aur destination IP aur apni routing table se packets forward karta hai (Layer 3). Yeh hosts ka default gateway hai, broadcast domains alag karta hai, aur internet edge par aam taur par NAT bhi karta hai. <b>Switch</b> ek network ke andar hosts ko jodta hai aur destination MAC aur apni MAC address table se frames forward karta hai (Layer 2). Yeh har port par alag collision domain banata hai aur VLANs se ek switch ko kai broadcast domains mein baantta hai. <b>Layer 3 (multilayer) switch</b> dono karta hai: VLAN ke andar switching aur VLANs ke beech hardware mein routing, isiliye yeh zyada tar campuses ke core ya distribution mein baithta hai. Access switches aksar phones, cameras aur access points ko power dene ke liye <b>PoE</b> dete hain.</p>

<h3>Firewall</h3>
<p><b>Firewall</b> inside, outside aur <b>DMZ</b> (public servers ke liye screened subnet) jaise zones ke beech security policy lagata hai. Teen generations important hain:</p>
<ul>
<li><b>Packet filter (stateless):</b> har packet ko IP addresses, protocol aur ports par match karta hai, jaise router ACL. Yeh connections yaad nahi rakhta, isliye return traffic ko apna rule chahiye.</li>
<li><b>Stateful firewall:</b> har connection ko state table mein track karta hai aur replies ko apne aap allow karta hai. Layers 3 aur 4 par kaam karta hai.</li>
<li><b>Next-generation firewall (NGFW):</b> stateful plus application identification (Layer 7), user identity, URL filtering, built-in IPS aur optional TLS inspection. Yeh social site allow karke uske file uploads block kar sakta hai.</li>
</ul>
<p>Firewalls ki rule list implicit deny par khatam hoti hai: jo explicitly allow nahi hai woh drop hota hai.</p>

<h3>IDS aur IPS</h3>
<p><b>IDS</b> (intrusion detection system) traffic ki <b>copy</b> dekhta hai, switch SPAN port ya network TAP se, aur <b>alert</b> karta hai. Yeh out-of-band baithta hai, isliye attack rok nahi sakta aur kabhi traffic slow ya break nahi karta. <b>IPS</b> (intrusion prevention system) <b>inline</b> baithta hai; har packet usse guzarta hai, isliye woh malicious packets <b>drop</b> kar sakta hai aur connections reset kar sakta hai, lekin fail ho jaaye ya false positive ho to achha traffic bhi block kar sakta hai. Dono <b>signatures</b> (known attack patterns) ya <b>anomaly/behaviour</b> baselines se detect karte hain. Yeh network devices (NIDS/NIPS) aur host software (HIDS/HIPS) dono roop mein hote hain.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Enterprise mein appliances kahan baithte hain">
<rect x="250" y="8" width="140" height="32" rx="6" fill="#e2e8f0"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<rect x="250" y="62" width="140" height="32" rx="6" fill="#fed7aa"/><text x="320" y="83" text-anchor="middle" class="svg-ink" font-size="13">Edge router</text>
<rect x="230" y="116" width="180" height="32" rx="6" fill="#fde68a"/><text x="320" y="137" text-anchor="middle" class="svg-ink" font-size="13">NGFW inline IPS ke saath</text>
<rect x="450" y="116" width="180" height="32" rx="6" fill="#bbf7d0"/><text x="540" y="137" text-anchor="middle" class="svg-ink" font-size="12">DMZ: reverse proxy, LB</text>
<rect x="10" y="116" width="180" height="32" rx="6" fill="#ddd6fe"/><text x="100" y="137" text-anchor="middle" class="svg-ink" font-size="12">SPAN copy par IDS</text>
<rect x="230" y="170" width="180" height="32" rx="6" fill="#bae6fd"/><text x="320" y="191" text-anchor="middle" class="svg-ink" font-size="13">Core L3 switch</text>
<rect x="10" y="226" width="150" height="32" rx="6" fill="#bae6fd"/><text x="85" y="247" text-anchor="middle" class="svg-ink" font-size="12">Access switch, PoE</text>
<rect x="175" y="226" width="140" height="32" rx="6" fill="#bbf7d0"/><text x="245" y="247" text-anchor="middle" class="svg-ink" font-size="12">WLC aur APs</text>
<rect x="330" y="226" width="140" height="32" rx="6" fill="#e2e8f0"/><text x="400" y="247" text-anchor="middle" class="svg-ink" font-size="12">Forward proxy</text>
<rect x="485" y="226" width="145" height="32" rx="6" fill="#fed7aa"/><text x="557" y="247" text-anchor="middle" class="svg-ink" font-size="12">NAS aur SAN</text>
<line x1="320" y1="40" x2="320" y2="62" stroke="#64748b"/><line x1="320" y1="94" x2="320" y2="116" stroke="#64748b"/><line x1="410" y1="132" x2="450" y2="132" stroke="#64748b"/><line x1="190" y1="132" x2="230" y2="132" stroke="#64748b" stroke-dasharray="4 3"/><line x1="320" y1="148" x2="320" y2="170" stroke="#64748b"/>
<line x1="300" y1="202" x2="85" y2="226" stroke="#64748b"/><line x1="310" y1="202" x2="245" y2="226" stroke="#64748b"/><line x1="330" y1="202" x2="400" y2="226" stroke="#64748b"/><line x1="340" y1="202" x2="557" y2="226" stroke="#64748b"/>
</svg><p class="cap">IPS traffic path mein inline hai; IDS ko copy milti hai (dashed). Public services DMZ mein reverse proxy ya load balancer ke peeche baithti hain.</p></div>

<h3>Load balancer</h3>
<p><b>Load balancer</b> kisi service ke liye ek <b>virtual IP (VIP)</b> dikhata hai aur connections ko servers ke pool mein baantta hai. Yeh <b>health checks</b> chalata hai aur fail hone wale server ko traffic bhejna band kar deta hai. Common methods: <b>round robin</b>, <b>weighted</b>, <b>least connections</b>. <b>Layer 4</b> load balancer sirf IP aur port se decide karta hai; <b>Layer 7</b> load balancer request padhta hai (URL path, host header, cookie) aur /images ko ek pool aur /api ko doosre pool mein bhej sakta hai. Extras: <b>persistence</b> (sticky sessions user ko same server par rakhte hain) aur <b>TLS offload</b> (encryption ka kaam load balancer karta hai).</p>

<h3>Proxy</h3>
<p><b>Proxy</b> kisi aur ki taraf se requests karta hai, isliye doosri side proxy ka address dekhti hai. <b>Forward proxy</b> internet par jaane wale <b>clients</b> ke aage baithta hai: URLs filter karta hai, content cache karta hai, usage log karta hai aur internal addresses chhupata hai. Yeh <b>explicit</b> ho sakta hai (browsers ise use karne ke liye configure hote hain) ya <b>transparent</b> (client settings ke bina traffic ise redirect hota hai). <b>Reverse proxy</b> <b>servers</b> ke aage baithta hai, internet se requests leta hai aur internal servers ko deta hai, unhe chhupata hai aur aksar caching, TLS termination aur web application firewall checks jodta hai.</p>

<h3>NAS aur SAN</h3>
<p><b>NAS</b> (network-attached storage) normal IP network par ek storage appliance hai jo SMB (Windows) ya NFS (Linux) se <b>files</b> share karta hai. Users ko shared folder dikhta hai. <b>SAN</b> (storage area network) ek dedicated network hai jo servers ko disks ka <b>block-level</b> access deta hai, Fibre Channel ya iSCSI (TCP/IP par SCSI, port 3260) se. Server ko local jaisa disk (LUN) dikhta hai aur woh khud use format karta hai. Memory aid: NAS = folders, SAN = disks.</p>

<h3>Wireless: access points aur controllers</h3>
<p><b>Access point (AP)</b> wireless clients ko wired LAN par bridge karta hai (Layer 2). <b>Autonomous</b> AP ek ek karke configure hota hai. <b>Lightweight</b> APs ko <b>wireless LAN controller (WLC)</b> centrally manage karta hai, jo configuration push karta hai, channels aur power manage karta hai, aur roaming sambhalta hai; APs CAPWAP (UDP 5246 control, 5247 data) se usse tunnel karte hain. Cloud-managed APs vendor ke host kiye controller ko use karte hain.</p>

<h3>Physical vs virtual appliances</h3>
<p>Upar ka har appliance <b>virtual appliance</b> ki tarah bhi aata hai: hypervisor ya cloud mein chalta software (network functions virtualisation, NFV). Virtual firewalls, routers aur load balancers minutes mein deploy ho sakte hain aur workload ke saath scale ho sakte hain; physical appliances dedicated hardware performance dete hain aur edge aur core mein abhi bhi common hain.</p>

<div class="eg"><p><b>Worked example: appliance chuno.</b> Web traffic ko chaar servers mein baanto aur fail server ko apne aap hatao: load balancer. Staff ko gambling sites se roko aur software updates cache karo: forward proxy. Traffic ko bina risk ke SOC ko scans ka alert do: SPAN port par IDS. Aath hypervisors ko shared block storage do: SAN. Users ko shared department folder do: NAS. 120 APs ko ek jagah se manage karo: WLC.</p></div>

<div class="warn"><p><b>Common galti.</b> IDS ko "safe rehne ke liye" inline lagana aur ummeed karna ki woh attacks block karega. IDS sirf alert karta hai; block karne ke liye inline IPS chahiye. Ulti galti: pehle hi din har IPS signature ko blocking mode mein on karna, jisse false positives business applications tod dete hain. Pehle detect mode mein tune karo.</p></div>

<div class="exam"><p><b>Exam traps.</b> Out-of-band, sirf alerts = IDS. Inline, drop kar sakta hai = IPS. Forward proxy clients ko bachata hai; reverse proxy servers ko. NAS = file-level (SMB/NFS); SAN = block-level (Fibre Channel/iSCSI). Load balancer health checks aur VIP use karta hai. Lightweight APs ko controller chahiye.</p></div>

<div class="scn"><h4>Woh alert jise koi rok nahi saka</h4><p>Ek company ke SPAN port wale IDS ne raat 02:10 par public web server ke against exploit ka high-severity alert diya. Alert ek email inbox mein gaya; subah 09:00 baje jab kisi ne padha, tab tak server compromise ho chuka tha. Fix ke do hisse the: web server ko DMZ mein WAF rules wale reverse proxy ke peeche shift kiya gaya, aur edge firewall ka IPS module DMZ ke liye inline enable kiya gaya, relevant signatures block mode mein, ek hafte alert mode mein tuning ke baad.</p><p><b>Seekh:</b> prevention ke bina (ya dekhne wale ke bina) detection sirf batata hai ki kya ho chuka hai.</p></div>

<div class="iv"><p class="q">"IDS aur IPS mein kya farak hai, aur aap har ek ko kahan lagaoge?"</p><p>Strong answer: IDS passive hai; use SPAN ya TAP se traffic ki copy milti hai aur woh alerts banata hai, isliye block nahi kar sakta lekin traffic tod bhi nahi sakta. IPS inline hai aur packets drop ya sessions reset kar sakta hai, isliye use throughput ke hisaab se size aur false positives se bachne ke liye tune karna padta hai, aur aap decide karte ho ki woh fail open ho ya closed. IPS ko internet edge par ya DMZ ke aage inline lagao, aur visibility ke liye internal segments par IDS sensors. Signature vs anomaly detection mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Router = networks ke beech L3; switch = network ke andar L2; multilayer switch dono karta hai.</li>
<li>Firewalls: stateless packet filter, stateful, aur Layer 7 awareness wala NGFW; public servers ke liye DMZ.</li>
<li>IDS out-of-band hai aur alert karta hai; IPS inline hai aur block karta hai.</li>
<li>Load balancer = VIP, pool, health checks, L4 ya L7; clients ke liye forward proxy, servers ke liye reverse proxy.</li>
<li>NAS files share karta hai, SAN blocks; lightweight APs WLC chalata hai; sab virtual appliances ho sakte hain.</li>
</ul></div>
`}};export{e as default};