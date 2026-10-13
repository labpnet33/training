var e={id:`big-picture`,h:{en:`Catalyst Center: the big picture`,hi:`Catalyst Center: badi picture`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to explain what Cisco Catalyst Center is and where it sits in an enterprise network, walk through its five workflows (<b>Design, Policy, Provision, Assurance, Platform</b>), discover and onboard devices, push golden configuration with templates and check compliance, read health scores and issues like a NOC engineer, run Path Trace to find exactly where a packet dies, and read REST API responses and status codes. These map to ENCOR 350-401 v1.2 objective <b>4.5</b> (Catalyst Center workflows for configuration, monitoring and management), <b>6.4/6.5</b> (Catalyst Center APIs, response codes and payloads) and the controller-based architecture ideas in domain <b>1.0</b>.</p>
<p><b>Prerequisites.</b> You should be comfortable with VLANs, trunks, SVIs, OSPF basics, ACLs, SNMP and SSH from CCNA. If port-security or OSPF areas feel rusty, revisit those modules first, because both lab faults use them. You do not need any Python; the API chapter reads JSON, it does not write code.</p>

<h3>An analogy: the air traffic control tower</h3>
<p>Think of a busy airport. Each aircraft (a switch or router) has its own pilot and flies itself: it runs OSPF, spanning tree and its own forwarding table. But nobody would run an airport by phoning every pilot one at a time. The <b>control tower</b> sees every aircraft on one radar, knows the airport layout (sites and buildings), issues standard procedures to all of them (templates), spots trouble early (a plane circling = an issue), and can replay exactly which path a plane took (Path Trace).</p>
<p><b>Catalyst Center</b> is that tower for the campus and branch network. It does not carry passenger traffic. User packets still go switch to switch. The tower manages, measures and advises.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Where Catalyst Center sits">
<rect x="150" y="10" width="340" height="44" rx="8" fill="#fde68a"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">Apps, scripts, ITSM, ISE (northbound REST)</text>
<rect x="150" y="96" width="340" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="14">Catalyst Center (appliance / cluster)</text><text x="320" y="142" text-anchor="middle" class="svg-muted" font-size="12">Design · Policy · Provision · Assurance · Platform</text>
<line x1="320" y1="54" x2="320" y2="96" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="156" x2="320" y2="196" stroke="#64748b" stroke-width="2"/>
<text x="330" y="80" class="svg-accent" font-size="12">Intent API</text>
<text x="330" y="182" class="svg-accent" font-size="12">SSH, SNMP, NETCONF, telemetry</text>
<rect x="20" y="200" width="130" height="40" rx="8" fill="#bae6fd"/><text x="85" y="225" text-anchor="middle" class="svg-ink" font-size="13">R1 router</text>
<rect x="175" y="200" width="130" height="40" rx="8" fill="#bae6fd"/><text x="240" y="225" text-anchor="middle" class="svg-ink" font-size="13">DSW1 distribution</text>
<rect x="330" y="200" width="130" height="40" rx="8" fill="#bae6fd"/><text x="395" y="225" text-anchor="middle" class="svg-ink" font-size="13">ASW1 / ASW2</text>
<rect x="485" y="200" width="135" height="40" rx="8" fill="#ddd6fe"/><text x="552" y="225" text-anchor="middle" class="svg-ink" font-size="13">WLC and APs</text>
<line x1="20" y1="196" x2="620" y2="196" stroke="#64748b" stroke-dasharray="4 3"/>
<text x="320" y="262" text-anchor="middle" class="svg-muted" font-size="12">User traffic stays in the devices; the controller manages and measures</text>
</svg><p class="cap">Catalyst Center sits between the people and tools above it and the network devices below it.</p></div>

<h3>What Catalyst Center is, in one paragraph</h3>
<p>Cisco <b>Catalyst Center</b> (called <b>DNA Center</b> until 2023, so you will still see "DNAC" in old docs, API paths and interview questions) is Cisco's controller and management platform for enterprise campus, branch and wireless networks. It runs on a dedicated appliance (or a supported virtual appliance) and gives you one place to design the network, author policy, provision devices, assure that everything works, and expose all of it through APIs. It is the <b>management plane</b> for Cisco SD-Access fabrics, but it is equally useful for a classic three-tier campus like the one in our labs.</p>

<h3>The five workflows you must know by name</h3>
<table class="cmp"><tr><th>Workflow</th><th>Question it answers</th><th>Examples</th></tr>
<tr><td><b>Design</b></td><td>What does my network look like and what are its standards?</td><td>Site hierarchy, DNS/NTP/AAA settings, IP pools, golden images, network profiles</td></tr>
<tr><td><b>Policy</b></td><td>Who may talk to whom, and how is traffic treated?</td><td>Group-based access control, virtual networks, application QoS</td></tr>
<tr><td><b>Provision</b></td><td>How do devices get their configuration?</td><td>Discovery, inventory, Plug and Play, templates, SWIM upgrades</td></tr>
<tr><td><b>Assurance</b></td><td>Is the network doing what I intended? If not, why?</td><td>Health scores, issues, Path Trace, sensor tests, AI analytics</td></tr>
<tr><td><b>Platform</b></td><td>How do other systems use all of this?</td><td>Intent REST API, events and webhooks, ITSM integration</td></tr></table>
<p>A handy memory hook: <b>D-P-P-A-P</b>, "Design, Policy, Provision, Assure, Platform". The first four are the intent-based networking loop; Platform opens it to the outside world.</p>

<h3>Our lab controller</h3>
<p>The labs use a simulated <b>Network Controller</b> called <code>CTRL</code> (10.99.0.10) that behaves like Catalyst Center. Its web GUI has the pages <b>Dashboard, Inventory, Assurance, Issues, Path Trace</b> and <b>Templates</b>, and a <b>controller shell</b> at the bottom where every GUI action also exists as a <code>center …</code> command. The Pune campus has R1 (WAN/DC router, loopback 10.255.0.1), distribution switch DSW1, access switches ASW1 and ASW2, clients PC1 (VLAN 10) and PC2 (VLAN 20), and the intranet server SRV at 172.16.50.10.</p>
<pre class="code"><span class="c">! First command to try in the controller shell</span>
CTRL&gt; center help</pre>
<pre class="out">Network Controller shell commands:
  center discover RANGE cli USER PASS snmp COMM       Discover devices ...
  center inventory                                    Managed devices, reachability, software, uptime
  <span class="hl">center health [DEVICE]                              Overall / per-device / client health</span>
  center issues [ID|all]                              Open issues, or details + suggested actions
  center pathtrace SRC DST [tcp|udp PORT]             Trace the forwarding path hop by hop
  center template apply NAME DEVICES [var=val ...]    Deploy (DEVICES: ASW1,ASW2 | all | switches | routers)
  center compliance [TEMPLATE]                        Running-config vs deployed templates
  center api get PATH                                 Northbound REST API explorer</pre>

<div class="eg"><p><b>Worked example: why a controller pays off.</b> A campus has 400 switches. Changing the NTP server by hand at 3 minutes per switch is 20 hours of typing, with a real chance that 5–10 switches get a typo. With a template the same change is one form, one preview and one deploy, finished in minutes, and a compliance check then proves all 400 match. The time saved is nice; the <b>proof</b> is what auditors and outage reviews care about.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking the controller is in the data path, so "if Catalyst Center goes down, the network goes down". It does not. Devices keep forwarding with their own control planes. You lose visibility, automation and new provisioning until the controller returns, which is why production deployments use a three-node cluster.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions may say "DNA Center" or "Catalyst Center"; treat them as the same product. Also know that Catalyst Center manages campus/branch/wireless, while <b>SD-WAN Manager</b> (vManage) manages the SD-WAN fabric; they are different controllers.</p></div>

<div class="scn"><h4>The 2 a.m. phone tree</h4><p>A hospital network team used to learn about outages from angry calls. A floor of nurses lost network access one night; the on-call engineer SSHed into eleven switches before finding an err-disabled uplink. After deploying Catalyst Center, the same fault the next quarter raised a P2 issue "Interface err-disabled" naming the switch, port and cause within a minute, with suggested commands. The engineer fixed it from home in five minutes.</p><p><b>Lesson:</b> the value of a controller is turning "log in everywhere and guess" into "open the issue, read the cause, prove the fix".</p></div>

<div class="iv"><p class="q">"What is Cisco Catalyst Center and what are its main functions?"</p><p>Say it is Cisco's controller for enterprise campus, branch and wireless (formerly DNA Center), the management plane for SD-Access. Then name the five workflows: Design (hierarchy, settings, images), Policy (group-based access, virtual networks), Provision (discovery, PnP, templates, SWIM), Assurance (health, issues, Path Trace) and Platform (Intent API, events). Close with one real benefit, such as compliance proving every switch matches the golden config.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Catalyst Center = the renamed DNA Center: controller and management platform for campus, branch and wireless.</li>
<li>Five workflows: Design, Policy, Provision, Assurance, Platform.</li>
<li>It manages and measures; user traffic never flows through it.</li>
<li>It is the management plane for SD-Access but also manages classic campuses.</li>
<li>In the labs, CTRL mirrors it: GUI pages plus <code>center …</code> shell commands.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap samjha paoge ki Cisco Catalyst Center kya hai aur enterprise network mein kahan baithta hai, uske paanch workflows (<b>Design, Policy, Provision, Assurance, Platform</b>) walk through kar paoge, devices discover aur onboard kar paoge, templates se golden configuration push karke compliance check kar paoge, NOC engineer ki tarah health scores aur issues padh paoge, Path Trace chala kar exactly dekh paoge ki packet kahan marta hai, aur REST API responses aur status codes padh paoge. Yeh ENCOR 350-401 v1.2 ke objective <b>4.5</b> (configuration, monitoring aur management ke liye Catalyst Center workflows), <b>6.4/6.5</b> (Catalyst Center APIs, response codes aur payloads) aur domain <b>1.0</b> ke controller-based architecture ideas se map hote hain.</p>
<p><b>Prerequisites.</b> CCNA se VLANs, trunks, SVIs, OSPF basics, ACLs, SNMP aur SSH aane chahiye. Agar port-security ya OSPF areas thode bhool gaye ho to pehle woh modules dobara dekh lo, kyunki dono lab faults unhi ko use karte hain. Python ki zaroorat nahi; API chapter JSON padhta hai, code nahi likhta.</p>

<h3>Ek analogy: air traffic control tower</h3>
<p>Ek busy airport socho. Har aircraft (switch ya router) ka apna pilot hai aur woh khud udta hai: OSPF, spanning tree aur apni forwarding table khud chalata hai. Par koi bhi airport har pilot ko ek-ek karke phone karke nahi chalata. <b>Control tower</b> ek hi radar par har aircraft dekhta hai, airport ka layout jaanta hai (sites aur buildings), sabko standard procedures deta hai (templates), trouble jaldi pakadta hai (chakkar kaat-ta plane = issue), aur exactly replay kar sakta hai ki plane ne kaunsa path liya (Path Trace).</p>
<p><b>Catalyst Center</b> campus aur branch network ke liye wahi tower hai. Yeh passenger traffic nahi le jaata. User packets ab bhi switch se switch jaate hain. Tower manage karta hai, measure karta hai aur advice deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Catalyst Center kahan baithta hai">
<rect x="150" y="10" width="340" height="44" rx="8" fill="#fde68a"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">Apps, scripts, ITSM, ISE (northbound REST)</text>
<rect x="150" y="96" width="340" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="14">Catalyst Center (appliance / cluster)</text><text x="320" y="142" text-anchor="middle" class="svg-muted" font-size="12">Design · Policy · Provision · Assurance · Platform</text>
<line x1="320" y1="54" x2="320" y2="96" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="156" x2="320" y2="196" stroke="#64748b" stroke-width="2"/>
<text x="330" y="80" class="svg-accent" font-size="12">Intent API</text>
<text x="330" y="182" class="svg-accent" font-size="12">SSH, SNMP, NETCONF, telemetry</text>
<rect x="20" y="200" width="130" height="40" rx="8" fill="#bae6fd"/><text x="85" y="225" text-anchor="middle" class="svg-ink" font-size="13">R1 router</text>
<rect x="175" y="200" width="130" height="40" rx="8" fill="#bae6fd"/><text x="240" y="225" text-anchor="middle" class="svg-ink" font-size="13">DSW1 distribution</text>
<rect x="330" y="200" width="130" height="40" rx="8" fill="#bae6fd"/><text x="395" y="225" text-anchor="middle" class="svg-ink" font-size="13">ASW1 / ASW2</text>
<rect x="485" y="200" width="135" height="40" rx="8" fill="#ddd6fe"/><text x="552" y="225" text-anchor="middle" class="svg-ink" font-size="13">WLC aur APs</text>
<line x1="20" y1="196" x2="620" y2="196" stroke="#64748b" stroke-dasharray="4 3"/>
<text x="320" y="262" text-anchor="middle" class="svg-muted" font-size="12">User traffic devices mein rehta hai; controller manage aur measure karta hai</text>
</svg><p class="cap">Catalyst Center upar ke logon aur tools aur neeche ke network devices ke beech baithta hai.</p></div>

<h3>Catalyst Center kya hai, ek paragraph mein</h3>
<p>Cisco <b>Catalyst Center</b> (2023 tak iska naam <b>DNA Center</b> tha, isliye purane docs, API paths aur interview questions mein aapko "DNAC" dikhega) enterprise campus, branch aur wireless networks ke liye Cisco ka controller aur management platform hai. Yeh ek dedicated appliance (ya supported virtual appliance) par chalta hai aur aapko ek hi jagah deta hai jahan aap network design karo, policy likho, devices provision karo, assure karo ki sab chal raha hai, aur yeh sab APIs se expose karo. Yeh Cisco SD-Access fabrics ka <b>management plane</b> hai, lekin hamare labs jaise classic three-tier campus ke liye bhi utna hi useful hai.</p>

<h3>Paanch workflows jo naam se yaad hone chahiye</h3>
<table class="cmp"><tr><th>Workflow</th><th>Kaunsa sawaal answer karta hai</th><th>Examples</th></tr>
<tr><td><b>Design</b></td><td>Mera network kaisa dikhta hai aur uske standards kya hain?</td><td>Site hierarchy, DNS/NTP/AAA settings, IP pools, golden images, network profiles</td></tr>
<tr><td><b>Policy</b></td><td>Kaun kisse baat kar sakta hai, aur traffic ke saath kaisa treatment hoga?</td><td>Group-based access control, virtual networks, application QoS</td></tr>
<tr><td><b>Provision</b></td><td>Devices ko configuration kaise milti hai?</td><td>Discovery, inventory, Plug and Play, templates, SWIM upgrades</td></tr>
<tr><td><b>Assurance</b></td><td>Kya network wahi kar raha hai jo maine chaha? Agar nahi, to kyun?</td><td>Health scores, issues, Path Trace, sensor tests, AI analytics</td></tr>
<tr><td><b>Platform</b></td><td>Dusre systems yeh sab kaise use karein?</td><td>Intent REST API, events aur webhooks, ITSM integration</td></tr></table>
<p>Yaad rakhne ka hook: <b>D-P-P-A-P</b>, "Design, Policy, Provision, Assure, Platform". Pehle chaar intent-based networking ka loop hain; Platform use bahar ki duniya ke liye kholta hai.</p>

<h3>Hamara lab controller</h3>
<p>Labs mein ek simulated <b>Network Controller</b> hai jiska naam <code>CTRL</code> (10.99.0.10) hai aur jo Catalyst Center jaisa behave karta hai. Iske web GUI mein <b>Dashboard, Inventory, Assurance, Issues, Path Trace</b> aur <b>Templates</b> pages hain, aur neeche ek <b>controller shell</b> hai jahan har GUI action <code>center …</code> command ke roop mein bhi maujood hai. Pune campus mein R1 (WAN/DC router, loopback 10.255.0.1), distribution switch DSW1, access switches ASW1 aur ASW2, clients PC1 (VLAN 10) aur PC2 (VLAN 20), aur intranet server SRV 172.16.50.10 par hain.</p>
<pre class="code"><span class="c">! Controller shell mein try karne ki pehli command</span>
CTRL&gt; center help</pre>
<pre class="out">Network Controller shell commands:
  center discover RANGE cli USER PASS snmp COMM       Discover devices ...
  center inventory                                    Managed devices, reachability, software, uptime
  <span class="hl">center health [DEVICE]                              Overall / per-device / client health</span>
  center issues [ID|all]                              Open issues, or details + suggested actions
  center pathtrace SRC DST [tcp|udp PORT]             Trace the forwarding path hop by hop
  center template apply NAME DEVICES [var=val ...]    Deploy (DEVICES: ASW1,ASW2 | all | switches | routers)
  center compliance [TEMPLATE]                        Running-config vs deployed templates
  center api get PATH                                 Northbound REST API explorer</pre>

<div class="eg"><p><b>Worked example: controller ka fayda kyun hota hai.</b> Ek campus mein 400 switches hain. Haath se NTP server badalna, 3 minute per switch, matlab 20 ghante typing, aur 5–10 switches mein typo ka asli chance. Template se wahi change ek form, ek preview aur ek deploy hai, minutes mein khatam, aur phir compliance check prove karta hai ki saare 400 match karte hain. Time bachana accha hai; auditors aur outage reviews ko <b>proof</b> chahiye hota hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki controller data path mein hai, to "Catalyst Center down hua to network down". Aisa nahi hota. Devices apne control planes se forward karte rehte hain. Controller wapas aane tak aapki visibility, automation aur naya provisioning chala jaata hai, isiliye production deployments three-node cluster use karte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions "DNA Center" ya "Catalyst Center" dono bol sakte hain; dono ko same product maano. Yeh bhi jaano ki Catalyst Center campus/branch/wireless manage karta hai, jabki <b>SD-WAN Manager</b> (vManage) SD-WAN fabric manage karta hai; yeh alag controllers hain.</p></div>

<div class="scn"><h4>Raat 2 baje ka phone tree</h4><p>Ek hospital network team ko outages ka pata gusse wali calls se chalta tha. Ek raat nurses ke ek floor ka network chala gaya; on-call engineer ne gyarah switches mein SSH kiya tab jaake ek err-disabled uplink mila. Catalyst Center deploy karne ke baad, agle quarter wahi fault aaya to ek minute ke andar P2 issue "Interface err-disabled" raise hua jismein switch, port aur cause likha tha, suggested commands ke saath. Engineer ne ghar se paanch minute mein fix kar diya.</p><p><b>Lesson:</b> controller ki value yeh hai ki "har jagah login karo aur guess karo" ko "issue kholo, cause padho, fix prove karo" mein badal deta hai.</p></div>

<div class="iv"><p class="q">"Cisco Catalyst Center kya hai aur iske main functions kya hain?"</p><p>Bolo ki yeh enterprise campus, branch aur wireless ke liye Cisco ka controller hai (pehle DNA Center), SD-Access ka management plane. Phir paanch workflows ke naam lo: Design (hierarchy, settings, images), Policy (group-based access, virtual networks), Provision (discovery, PnP, templates, SWIM), Assurance (health, issues, Path Trace) aur Platform (Intent API, events). Ek real benefit se close karo, jaise compliance prove karta hai ki har switch golden config se match karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Catalyst Center = renamed DNA Center: campus, branch aur wireless ke liye controller aur management platform.</li>
<li>Paanch workflows: Design, Policy, Provision, Assurance, Platform.</li>
<li>Yeh manage aur measure karta hai; user traffic kabhi isse hokar nahi jaata.</li>
<li>Yeh SD-Access ka management plane hai lekin classic campuses bhi manage karta hai.</li>
<li>Labs mein CTRL isi ko mirror karta hai: GUI pages plus <code>center …</code> shell commands.</li>
</ul></div>
`}};export{e as default};