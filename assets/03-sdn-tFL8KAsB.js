var e={id:`sdn`,h:{en:`Traditional vs controller-based networking and SDN architecture`,hi:`Traditional vs controller-based networking aur SDN architecture`},body:{en:`
<p>Picture a city with a thousand independent taxi drivers. Each driver carries a paper map, listens to the radio and chooses a route alone. It works, but nobody sees the whole city, and when the rules change (a road closes, a new airport lane opens) every driver must hear about it separately. Now picture a ride-hailing company: a central dispatch system sees every car and every road, and sends each driver the route. The drivers still drive; the thinking has moved to the centre. That is the difference between a <b>traditional</b> network and a <b>controller-based</b> one.</p>

<h3>Traditional networking</h3>
<p>In a traditional network every router and switch has its <b>own control plane</b> and its own management plane. Routing protocols run on each box and each box computes its own tables: the control plane is <b>distributed</b>. Engineers configure each device separately, usually over SSH with the CLI, sometimes with SNMP. Policy (which VLAN a user belongs to, which ACL protects which server) is spread across hundreds of configuration files. Troubleshooting means logging in to one box after another and comparing outputs by eye.</p>
<p>This model is robust and well understood, and it is still everywhere. Its weaknesses show at scale: slow changes, inconsistent configurations, no single view of the network, and a lot of manual work.</p>

<h3>Controller-based networking and SDN</h3>
<p><b>Software-defined networking (SDN)</b> centralises the thinking. A <b>controller</b> (software running on a server or appliance) keeps a view of the whole network, holds the policy and programs the devices through APIs. The purest form, as originally defined with <b>OpenFlow</b>, moves the control plane completely off the switches: the controller computes every forwarding entry and pushes it down. Most Cisco products use a <b>hybrid</b> approach: devices still run protocols such as IS-IS, OSPF or BGP locally, while the controller automates the configuration, the policy and the monitoring. The exam calls both "controller-based".</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="SDN architecture layers and APIs">
<rect x="120" y="15" width="400" height="55" rx="8" fill="#fde68a"/>
<text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">Application layer</text>
<text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">scripts, dashboards, ticketing, Ansible</text>
<rect x="120" y="110" width="400" height="55" rx="8" fill="#bbf7d0"/>
<text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="14">Control layer: the controller</text>
<text x="320" y="153" text-anchor="middle" class="svg-muted" font-size="12">network view, policy, intent</text>
<rect x="120" y="205" width="400" height="55" rx="8" fill="#bae6fd"/>
<text x="320" y="228" text-anchor="middle" class="svg-ink" font-size="14">Infrastructure layer</text>
<text x="320" y="248" text-anchor="middle" class="svg-muted" font-size="12">routers, switches, APs: data plane</text>
<line x1="320" y1="70" x2="320" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="165" x2="320" y2="205" stroke="#64748b" stroke-width="2"/>
<text x="335" y="94" class="svg-accent" font-size="12">northbound API: REST + JSON</text>
<text x="335" y="189" class="svg-accent" font-size="12">southbound: NETCONF, RESTCONF, OpenFlow, OpFlex, SSH</text>
</svg><p class="cap">The three SDN layers. Applications sit above the controller (north); devices sit below it (south).</p></div>

<h3>The three SDN layers</h3>
<ul>
<li><b>Application layer.</b> Programs that want something from the network: a monitoring dashboard, a ticketing system, a security tool that asks to quarantine a host, your own Python or Ansible automation.</li>
<li><b>Control layer.</b> The controller. It holds the network-wide view and the policy, and translates what the applications ask for into device configuration.</li>
<li><b>Infrastructure layer.</b> The physical and virtual devices that forward traffic: the data plane.</li>
</ul>

<h3>Northbound and southbound APIs</h3>
<p>An <b>API</b> (application programming interface) is an agreed way for one program to ask another for data or actions, with structured requests and replies instead of a human reading screen text. Draw the network with applications at the top, and the direction names make sense:</p>
<ul>
<li><b>Northbound API (NBI)</b>: between the controller and the applications above it. Almost always a <b>REST API</b> over HTTPS, carrying <b>JSON</b>. Example: a script asks Catalyst Center for "all devices with software version older than 17.9".</li>
<li><b>Southbound API (SBI)</b>: between the controller and the devices below it. Examples: <b>OpenFlow</b> (controller programs flow tables in switches), <b>OpFlex</b> (Cisco ACI, sends policy and lets the device render it), <b>NETCONF</b> (XML over SSH, TCP port 830), <b>RESTCONF</b> (REST-style over HTTPS, JSON or XML), and for older boxes plain <b>SSH/CLI</b> and <b>SNMP</b>.</li>
</ul>
<p>NETCONF and RESTCONF carry data described by <b>YANG</b> models, which define the names and data types of every configurable item (for example, that an interface's <code>enabled</code> leaf is a boolean). You will see this in Lab 1, where your NMS workstation talks straight to router R1's RESTCONF API. In that lab <b>you</b> play the controller.</p>

<table class="cmp"><tr><th></th><th>Traditional</th><th>Controller-based</th></tr>
<tr><td>Control plane</td><td>Distributed, every box decides alone</td><td>Centralised or assisted by the controller</td></tr>
<tr><td>Configuration</td><td>Per device, CLI over SSH</td><td>Once, at the controller; pushed through APIs</td></tr>
<tr><td>Policy</td><td>Scattered across many configs</td><td>Defined centrally, applied consistently</td></tr>
<tr><td>Visibility</td><td>Box by box</td><td>Whole-network view, health scores</td></tr>
<tr><td>Automation</td><td>Screen scraping, expect scripts</td><td>Northbound REST API built in</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A company adds a new guest VLAN with an ACL to 150 switches in 12 buildings. Traditional: 150 SSH sessions, about 6 minutes each, roughly 15 hours, plus checking. Controller-based: the engineer defines the guest segment and policy once in the controller (or sends one northbound REST call), and the controller pushes the configuration to all 150 switches through its southbound APIs, then shows which ones succeeded.</p></div>

<div class="warn"><p><b>Common mistake.</b> Mixing up the directions. Remember the picture: applications on top talk <b>north</b>bound to the controller; the controller talks <b>south</b>bound to devices. RESTCONF uses REST ideas, but because it runs on the <b>device</b> and a controller uses it to configure that device, it is a <b>southbound</b> interface.</p></div>

<div class="exam"><p><b>Exam trap.</b> OpenFlow, OpFlex, NETCONF and RESTCONF are southbound. The northbound interface is typically REST with JSON. A controller-based network does not mean devices stop forwarding: the data plane always stays on the devices. The SDN layers are application, control and infrastructure.</p></div>

<div class="scn"><h4>Quarantine in seconds</h4><p>A hospital's security tool detected a laptop scanning the network. In the old design, a security analyst raised a ticket, the network team found the switch port with <code>show mac address-table</code> and shut it, which took 40 minutes. After moving to a controller-based campus, the security tool called the controller's northbound REST API with the host's MAC address. The controller used its southbound connection to move that host into a quarantine group within seconds, on whichever switch it was connected to.</p><p><b>Lesson:</b> the northbound API lets other systems use the network as a service; the southbound API makes the change happen on the right device.</p></div>

<div class="iv"><p class="q">"Compare traditional networking with controller-based networking, and explain northbound and southbound APIs."</p><p>Strong answer: in traditional networks each device has its own control plane and is configured one by one; policy is scattered. Controller-based networks centralise policy, configuration and visibility in a controller that programs devices. Name the layers: application, control, infrastructure. Northbound is between apps and controller, usually REST with JSON; southbound is between controller and devices, such as NETCONF, RESTCONF, OpenFlow or OpFlex. Add that Cisco solutions are usually hybrid: devices still run routing protocols.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Traditional: distributed control plane, per-device CLI configuration, policy spread everywhere.</li>
<li>Controller-based/SDN: central view, policy and automation; devices keep the data plane.</li>
<li>SDN layers: application, control (controller), infrastructure.</li>
<li>Northbound API = apps to controller, usually REST + JSON over HTTPS.</li>
<li>Southbound API = controller to devices: NETCONF, RESTCONF, OpenFlow, OpFlex, SSH, SNMP.</li>
</ul></div>
`,hi:`
<p>Ek shehar socho jismein hazaar independent taxi drivers hain. Har driver ke paas ek kaagaz ka map hai, woh radio sunta hai aur akele route chunta hai. Kaam chalta hai, par poora shehar koi nahi dekhta, aur jab rules badalte hain (koi sadak band, naya airport lane khula) to har driver ko alag se batana padta hai. Ab ek ride-hailing company socho: ek central dispatch system har gaadi aur har sadak dekhta hai, aur har driver ko route bhejta hai. Drivers abhi bhi gaadi chalate hain; sochne ka kaam centre mein chala gaya. <b>Traditional</b> aur <b>controller-based</b> network mein yahi farak hai.</p>

<h3>Traditional networking</h3>
<p>Traditional network mein har router aur switch ka <b>apna control plane</b> aur apna management plane hota hai. Routing protocols har box par chalte hain aur har box apne tables khud compute karta hai: control plane <b>distributed</b> hai. Engineers har device alag se configure karte hain, aam taur par SSH par CLI se, kabhi SNMP se. Policy (user kis VLAN mein hai, kaunsa ACL kis server ko protect karta hai) sainkdon configuration files mein faili hoti hai. Troubleshooting ka matlab hai ek ke baad ek box mein login karna aur outputs ko aankhon se compare karna.</p>
<p>Yeh model mazboot aur achhi tarah samjha hua hai, aur aaj bhi har jagah hai. Iski kamzoriyaan scale par dikhti hain: slow changes, inconsistent configurations, network ka koi single view nahi, aur bahut manual kaam.</p>

<h3>Controller-based networking aur SDN</h3>
<p><b>Software-defined networking (SDN)</b> sochne ke kaam ko centralise karta hai. Ek <b>controller</b> (server ya appliance par chalne wala software) poore network ka view rakhta hai, policy rakhta hai aur APIs ke through devices ko program karta hai. Sabse pure form, jaisa originally <b>OpenFlow</b> ke saath define hua tha, control plane ko switches se poori tarah hata deta hai: controller har forwarding entry compute karke neeche push karta hai. Zyada tar Cisco products <b>hybrid</b> approach use karte hain: devices abhi bhi IS-IS, OSPF ya BGP jaise protocols locally chalate hain, jabki controller configuration, policy aur monitoring ko automate karta hai. Exam dono ko "controller-based" kehta hai.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="SDN architecture layers aur APIs">
<rect x="120" y="15" width="400" height="55" rx="8" fill="#fde68a"/>
<text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">Application layer</text>
<text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">scripts, dashboards, ticketing, Ansible</text>
<rect x="120" y="110" width="400" height="55" rx="8" fill="#bbf7d0"/>
<text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="14">Control layer: controller</text>
<text x="320" y="153" text-anchor="middle" class="svg-muted" font-size="12">network view, policy, intent</text>
<rect x="120" y="205" width="400" height="55" rx="8" fill="#bae6fd"/>
<text x="320" y="228" text-anchor="middle" class="svg-ink" font-size="14">Infrastructure layer</text>
<text x="320" y="248" text-anchor="middle" class="svg-muted" font-size="12">routers, switches, APs: data plane</text>
<line x1="320" y1="70" x2="320" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="165" x2="320" y2="205" stroke="#64748b" stroke-width="2"/>
<text x="335" y="94" class="svg-accent" font-size="12">northbound API: REST + JSON</text>
<text x="335" y="189" class="svg-accent" font-size="12">southbound: NETCONF, RESTCONF, OpenFlow, OpFlex, SSH</text>
</svg><p class="cap">SDN ki teen layers. Applications controller ke upar (north) hain; devices uske neeche (south) hain.</p></div>

<h3>SDN ki teen layers</h3>
<ul>
<li><b>Application layer.</b> Woh programs jo network se kuch chahte hain: monitoring dashboard, ticketing system, security tool jo kisi host ko quarantine karna chahta hai, aapka apna Python ya Ansible automation.</li>
<li><b>Control layer.</b> Controller. Iske paas network-wide view aur policy hoti hai, aur yeh applications ki maang ko device configuration mein translate karta hai.</li>
<li><b>Infrastructure layer.</b> Physical aur virtual devices jo traffic forward karte hain: data plane.</li>
</ul>

<h3>Northbound aur southbound APIs</h3>
<p><b>API</b> (application programming interface) ek tay kiya hua tareeka hai jisse ek program doosre se data ya action maangta hai, structured requests aur replies ke saath, bajaye iske ki koi insaan screen text padhe. Network ko draw karo aur applications ko upar rakho, to directions ke naam samajh aa jaate hain:</p>
<ul>
<li><b>Northbound API (NBI)</b>: controller aur uske upar ke applications ke beech. Lagbhag hamesha HTTPS par <b>REST API</b>, jo <b>JSON</b> le jaati hai. Example: ek script Catalyst Center se poochti hai "woh saare devices do jinka software version 17.9 se purana hai".</li>
<li><b>Southbound API (SBI)</b>: controller aur uske neeche ke devices ke beech. Examples: <b>OpenFlow</b> (controller switches mein flow tables program karta hai), <b>OpFlex</b> (Cisco ACI, policy bhejta hai aur device ko use render karne deta hai), <b>NETCONF</b> (SSH par XML, TCP port 830), <b>RESTCONF</b> (HTTPS par REST-style, JSON ya XML), aur purane boxes ke liye simple <b>SSH/CLI</b> aur <b>SNMP</b>.</li>
</ul>
<p>NETCONF aur RESTCONF woh data le jaate hain jo <b>YANG</b> models se describe hota hai, jo har configurable item ke naam aur data types define karte hain (jaise ki interface ka <code>enabled</code> leaf ek boolean hai). Yeh aap Lab 1 mein dekhoge, jahan aapka NMS workstation seedha router R1 ki RESTCONF API se baat karta hai. Us lab mein controller <b>aap</b> ho.</p>

<table class="cmp"><tr><th></th><th>Traditional</th><th>Controller-based</th></tr>
<tr><td>Control plane</td><td>Distributed, har box akele decide karta hai</td><td>Centralised ya controller ki madad se</td></tr>
<tr><td>Configuration</td><td>Har device par, SSH par CLI</td><td>Ek baar, controller par; APIs se push</td></tr>
<tr><td>Policy</td><td>Bahut saari configs mein bikhri</td><td>Centrally define, consistently apply</td></tr>
<tr><td>Visibility</td><td>Box by box</td><td>Poore network ka view, health scores</td></tr>
<tr><td>Automation</td><td>Screen scraping, expect scripts</td><td>Built-in northbound REST API</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ek company 12 buildings ke 150 switches par ACL ke saath ek naya guest VLAN jodti hai. Traditional: 150 SSH sessions, har ek lagbhag 6 minute, yaani qareeb 15 ghante, plus checking. Controller-based: engineer guest segment aur policy controller mein ek baar define karta hai (ya ek northbound REST call bhejta hai), aur controller apni southbound APIs se saare 150 switches par configuration push karta hai, phir dikhata hai kaunse successful hue.</p></div>

<div class="warn"><p><b>Common galti.</b> Directions ko mix karna. Picture yaad rakho: upar ke applications controller se <b>north</b>bound baat karte hain; controller devices se <b>south</b>bound baat karta hai. RESTCONF REST ke ideas use karta hai, par kyunki yeh <b>device</b> par chalta hai aur controller ise us device ko configure karne ke liye use karta hai, yeh ek <b>southbound</b> interface hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> OpenFlow, OpFlex, NETCONF aur RESTCONF southbound hain. Northbound interface aam taur par JSON wala REST hota hai. Controller-based network ka matlab yeh nahi ki devices forward karna band kar dete hain: data plane hamesha devices par hi rehta hai. SDN layers hain application, control aur infrastructure.</p></div>

<div class="scn"><h4>Seconds mein quarantine</h4><p>Ek hospital ke security tool ne ek laptop ko network scan karte pakda. Purane design mein security analyst ticket banata, network team <code>show mac address-table</code> se switch port dhoondti aur use shut karti, jismein 40 minute lagte. Controller-based campus par jaane ke baad, security tool ne host ke MAC address ke saath controller ki northbound REST API call ki. Controller ne apne southbound connection se us host ko seconds mein quarantine group mein daal diya, chahe woh kisi bhi switch par connected ho.</p><p><b>Seekh:</b> northbound API doosre systems ko network ko ek service ki tarah use karne deti hai; southbound API sahi device par change karwati hai.</p></div>

<div class="iv"><p class="q">"Traditional networking ko controller-based networking se compare karo, aur northbound aur southbound APIs samjhao."</p><p>Strong answer: traditional networks mein har device ka apna control plane hota hai aur har ek alag configure hota hai; policy bikhri rehti hai. Controller-based networks policy, configuration aur visibility ko ek controller mein centralise karte hain jo devices ko program karta hai. Layers ke naam lo: application, control, infrastructure. Northbound apps aur controller ke beech hai, aam taur par JSON wala REST; southbound controller aur devices ke beech, jaise NETCONF, RESTCONF, OpenFlow ya OpFlex. Yeh bhi jodo ki Cisco solutions aam taur par hybrid hain: devices abhi bhi routing protocols chalate hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Traditional: distributed control plane, har device par CLI configuration, policy har jagah bikhri.</li>
<li>Controller-based/SDN: central view, policy aur automation; devices data plane rakhte hain.</li>
<li>SDN layers: application, control (controller), infrastructure.</li>
<li>Northbound API = apps se controller, aam taur par HTTPS par REST + JSON.</li>
<li>Southbound API = controller se devices: NETCONF, RESTCONF, OpenFlow, OpFlex, SSH, SNMP.</li>
</ul></div>
`}};export{e as default};