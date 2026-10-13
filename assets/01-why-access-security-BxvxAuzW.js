var e={id:`why`,h:{en:`Why the access layer needs security, and the threat map`,hi:`Access layer ko security kyun chahiye, aur threat map`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to lock an access port to known devices with port security, read and recover err-disabled ports, stop rogue DHCP servers with DHCP snooping, block ARP spoofing with Dynamic ARP Inspection (DAI), explain IP Source Guard, close the VLAN hopping and spanning tree gaps, and describe how 802.1X and MAB authenticate a device before it gets any network access. You will also follow a repeatable troubleshooting workflow for the classic tickets: "my port is dead", "users get the wrong IP address" and "a static-IP host lost its gateway". This maps to CCNA 200-301 exam topic 5.7 (configure and verify Layer 2 security features) and supports 5.8 (AAA concepts) and 5.1 (security concepts).</p>
<p><b>Prerequisites.</b> You should already be comfortable with VLANs, access and trunk ports, DTP and the native VLAN (ccna-vlans module), and with spanning tree, PortFast and BPDU Guard (ccna-stp module). You should know what DHCP's four messages are (Discover, Offer, Request, Ack) and what ARP does. We refer back to those modules instead of teaching them again.</p>

<h3>Start with an analogy: the office building with an open lobby</h3>
<p>Imagine an office building with a strong gate outside, guards, cameras and locked server rooms. That is your firewall and your ACLs. Now imagine that inside, every floor has network sockets in the walls, meeting rooms and reception. Anyone who gets past the lobby, a visitor, a contractor, an unhappy employee, can plug a laptop into any socket. If that socket simply says "welcome, what would you like?", all the outside security means very little.</p>
<p>By default a Cisco switch behaves exactly like that friendly socket. It trusts everything it hears:</p>
<ul>
<li>Any <b>MAC address</b> may appear on any port, and as many as the device likes.</li>
<li>Any device may answer a <b>DHCP</b> request and hand out addresses and gateways.</li>
<li>Any host may send an <b>ARP</b> reply claiming any IP address.</li>
<li>Any port left at its default may <b>negotiate a trunk</b> with DTP.</li>
<li>Any port may send <b>spanning tree BPDUs</b> and try to become the root bridge.</li>
</ul>
<p>Layer 2 security is the set of switch features that removes this blind trust at the <b>access layer</b>, the switches where users, printers and phones plug in.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Access layer threat map">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">Distribution / router</text>
<line x1="320" y1="50" x2="320" y2="90" stroke="#64748b" stroke-width="2"/>
<rect x="230" y="90" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="14">Access switch</text>
<line x1="250" y1="130" x2="80" y2="180" stroke="#64748b"/><line x1="290" y1="130" x2="240" y2="180" stroke="#64748b"/><line x1="350" y1="130" x2="400" y2="180" stroke="#64748b"/><line x1="390" y1="130" x2="560" y2="180" stroke="#64748b"/>
<rect x="10" y="180" width="140" height="60" rx="8" fill="#fed7aa"/><text x="80" y="205" text-anchor="middle" class="svg-ink" font-size="12">MAC flooding</text><text x="80" y="225" text-anchor="middle" class="svg-accent" font-size="12">port security</text>
<rect x="170" y="180" width="140" height="60" rx="8" fill="#fed7aa"/><text x="240" y="205" text-anchor="middle" class="svg-ink" font-size="12">Rogue DHCP</text><text x="240" y="225" text-anchor="middle" class="svg-accent" font-size="12">DHCP snooping</text>
<rect x="330" y="180" width="140" height="60" rx="8" fill="#fed7aa"/><text x="400" y="205" text-anchor="middle" class="svg-ink" font-size="12">ARP spoofing</text><text x="400" y="225" text-anchor="middle" class="svg-accent" font-size="12">DAI</text>
<rect x="490" y="180" width="140" height="60" rx="8" fill="#fed7aa"/><text x="560" y="205" text-anchor="middle" class="svg-ink" font-size="12">VLAN hop / STP</text><text x="560" y="225" text-anchor="middle" class="svg-accent" font-size="12">DTP off, guards</text>
</svg><p class="cap">Every user-facing port is an entry point. Each threat has a matching switch feature.</p></div>

<h3>The five access-layer threats at concept level</h3>
<p>We study attacks only to recognise and defend against them. Here is what each one does and why it hurts.</p>
<dl class="terms">
<dt>MAC flooding (CAM table overflow)</dt><dd>A tool sends thousands of frames per second, each from a new fake source MAC. The switch's MAC address table (the CAM table) fills up. Once it is full, the switch cannot learn real hosts, so it <b>floods</b> their unicast frames out of every port in the VLAN, like an old hub. The attacker now sees traffic that was never meant for them. Defence: <b>port security</b> limits how many MACs a port may use.</dd>
<dt>Rogue DHCP and DHCP starvation</dt><dd>A rogue DHCP server (often an innocent home router plugged in "for more ports") answers clients first and hands out a wrong gateway or DNS server, becoming a man in the middle or simply breaking connectivity. Starvation is the partner attack: fake clients request every address in the real pool until it is empty. Defence: <b>DHCP snooping</b> with trusted ports and rate limits, plus port security.</dd>
<dt>ARP spoofing (ARP poisoning)</dt><dd>ARP has no authentication. An attacker sends unsolicited ARP replies saying "the gateway 10.30.0.1 is at my MAC". Victims update their ARP caches and send all off-subnet traffic to the attacker. Defence: <b>Dynamic ARP Inspection</b>, which checks every ARP packet against a trusted table of IP-to-MAC bindings.</dd>
<dt>VLAN hopping</dt><dd>Two methods. <b>Switch spoofing</b>: the attacker's NIC speaks DTP, the port becomes a trunk, and the attacker sees all VLANs. <b>Double tagging</b>: the attacker sends a frame with two 802.1Q tags; the first switch strips the outer tag because it matches the native VLAN, and the next switch forwards the frame into the inner VLAN. Defence: static access ports, DTP disabled, an unused native VLAN, unused ports shut down.</dd>
<dt>STP manipulation</dt><dd>A device sends superior BPDUs with a low bridge priority and becomes the root bridge. Traffic now flows through it, or the topology keeps changing and the network flaps. Defence: <b>BPDU Guard</b> on edge ports and <b>Root Guard</b> where a root must never appear.</dd>
</dl>

<h3>Why this matters in a real network</h3>
<p>Most security incidents inside companies do not start by breaking the firewall. They start with someone already inside: a visitor in a meeting room, a compromised laptop, a device a user brought from home. Layer 2 attacks are also cheap: free tools can run MAC flooding or ARP poisoning in seconds. And many Layer 2 "attacks" are accidents. The rogue DHCP server is usually a well-meaning employee, and the STP root change is usually a small switch placed under a desk. The same features stop both.</p>

<h3>How the features build on each other</h3>
<table class="cmp"><tr><th>Feature</th><th>What it trusts</th><th>Depends on</th></tr>
<tr><td><b>Port security</b></td><td>A list or count of MACs per port</td><td>A static access (or trunk) port</td></tr>
<tr><td><b>DHCP snooping</b></td><td>DHCP server messages only on trusted ports</td><td>Nothing; builds the binding table</td></tr>
<tr><td><b>DAI</b></td><td>ARP only if MAC and IP match a binding or ARP ACL</td><td>DHCP snooping bindings or static entries</td></tr>
<tr><td><b>IP Source Guard</b></td><td>IP (and optionally MAC) source per port</td><td>DHCP snooping bindings or static entries</td></tr>
<tr><td><b>802.1X / MAB</b></td><td>An identity approved by a RADIUS server</td><td>AAA and a RADIUS server</td></tr>
</table>
<p>This gives you the configuration order: port security, then DHCP snooping, then DAI and IP Source Guard. Build them the other way round and DAI will drop legitimate traffic because the binding table is still empty.</p>

<div class="eg"><p><b>Worked example.</b> A branch access switch has 48 ports: 40 user PCs, 4 printers, 2 uplinks and 2 unused. The hardening plan is: every user and printer port is a static access port with port security (maximum 2 for PC plus IP phone, 1 for printers); DHCP snooping and DAI on the user VLAN with only the 2 uplinks trusted; BPDU Guard on all 44 edge ports; DTP off everywhere; the 2 unused ports shut down in parking VLAN 999. That is 46 untrusted edge ports and 2 trusted ports, and it takes about 20 lines of configuration using interface ranges.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking that Layer 2 security replaces firewalls or ACLs. It does not. It protects the local segment, the VLAN where hosts talk to each other and to their gateway. You still need ACLs and firewalls between networks, and AAA for device management. Each layer covers a different gap.</p></div>

<div class="exam"><p><b>Exam trap.</b> Match each attack to its mitigation: MAC flooding to port security, rogue DHCP and starvation to DHCP snooping, ARP spoofing to DAI, switch spoofing to disabling DTP, double tagging to an unused native VLAN, STP root takeover to BPDU Guard or Root Guard. Questions often list the right feature for the wrong attack.</p></div>

<div class="scn"><h4>The meeting-room router</h4><p>At a branch office, users on the third floor suddenly received 192.168.0.x addresses and lost access to every internal application. The helpdesk rebooted PCs, which only made more of them fail. The network engineer ran <code>ipconfig /all</code> on one PC and saw a DHCP server address that did not belong to the company. Tracing that MAC in the switch's MAC table led to a meeting-room port where a visitor had plugged in a small wireless router to share the connection. The engineer shut the port, then enabled DHCP snooping on the access switches with only the uplinks trusted.</p><p><b>Lesson:</b> most Layer 2 incidents are accidents, and the same features that stop an attacker also stop an innocent mistake.</p></div>

<div class="iv"><p class="q">"Why do we need security features on access switches if we already have a firewall?"</p><p>Strong answer: the firewall only sees traffic that crosses it. Hosts in the same VLAN talk directly through the switch, so MAC flooding, rogue DHCP, ARP spoofing, VLAN hopping and STP attacks never reach the firewall. Name the matching features (port security, DHCP snooping, DAI, DTP off with an unused native VLAN, BPDU Guard) and mention that they also stop accidents such as a home router plugged into a wall port.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A switch trusts everything by default; Layer 2 security removes that trust on user-facing ports.</li>
<li>Five threats: MAC flooding, rogue DHCP/starvation, ARP spoofing, VLAN hopping and STP manipulation.</li>
<li>Each threat has a matching feature: port security, DHCP snooping, DAI, DTP off plus unused native VLAN, BPDU/Root Guard.</li>
<li>DAI and IP Source Guard depend on the DHCP snooping binding table, so configure snooping first.</li>
<li>Many incidents are accidents; the defences work the same either way.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap port security se access port ko known devices tak lock kar paoge, err-disabled ports padh aur recover kar paoge, DHCP snooping se rogue DHCP servers rok paoge, Dynamic ARP Inspection (DAI) se ARP spoofing block kar paoge, IP Source Guard samjha paoge, VLAN hopping aur spanning tree ke gaps band kar paoge, aur bata paoge ki 802.1X aur MAB kisi device ko network access dene se pehle kaise authenticate karte hain. Aap classic tickets ke liye ek repeatable troubleshooting workflow bhi follow karoge: "mera port dead hai", "users ko galat IP address mil raha hai" aur "static-IP host ka gateway chala gaya". Yeh CCNA 200-301 exam topic 5.7 (Layer 2 security features configure aur verify karna) se map hota hai aur 5.8 (AAA concepts) aur 5.1 (security concepts) ko support karta hai.</p>
<p><b>Prerequisites.</b> Aapko VLANs, access aur trunk ports, DTP aur native VLAN (ccna-vlans module), aur spanning tree, PortFast aur BPDU Guard (ccna-stp module) ke saath comfortable hona chahiye. Aapko DHCP ke chaar messages (Discover, Offer, Request, Ack) aur ARP kya karta hai, yeh pata hona chahiye. Hum un modules ko dobara padhane ki jagah unka reference denge.</p>

<h3>Ek analogy se shuru karo: khuli lobby wali office building</h3>
<p>Ek office building socho jiske bahar mazboot gate hai, guards hain, cameras hain aur server rooms locked hain. Yeh aapka firewall aur ACLs hain. Ab socho ki andar har floor par deewaron mein network sockets hain, meeting rooms mein aur reception par bhi. Jo bhi lobby ke aage aa gaya, visitor, contractor, naraaz employee, woh kisi bhi socket mein laptop laga sakta hai. Agar woh socket bas "welcome, aapko kya chahiye?" kehta hai, to bahar ki saari security ka matlab bahut kam reh jaata hai.</p>
<p>Default mein Cisco switch bilkul usi friendly socket jaisa behave karta hai. Woh jo bhi sunta hai us par bharosa karta hai:</p>
<ul>
<li>Koi bhi <b>MAC address</b> kisi bhi port par aa sakta hai, aur jitne device chahe utne.</li>
<li>Koi bhi device <b>DHCP</b> request ka jawab de sakta hai aur addresses aur gateways baant sakta hai.</li>
<li>Koi bhi host koi bhi IP address claim karte hue <b>ARP</b> reply bhej sakta hai.</li>
<li>Default par chhoda gaya koi bhi port DTP se <b>trunk negotiate</b> kar sakta hai.</li>
<li>Koi bhi port <b>spanning tree BPDUs</b> bhej kar root bridge banne ki koshish kar sakta hai.</li>
</ul>
<p>Layer 2 security switch features ka woh set hai jo <b>access layer</b> par, yaani un switches par jahan users, printers aur phones lagte hain, is andhe bharose ko hata deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Access layer threat map">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">Distribution / router</text>
<line x1="320" y1="50" x2="320" y2="90" stroke="#64748b" stroke-width="2"/>
<rect x="230" y="90" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="14">Access switch</text>
<line x1="250" y1="130" x2="80" y2="180" stroke="#64748b"/><line x1="290" y1="130" x2="240" y2="180" stroke="#64748b"/><line x1="350" y1="130" x2="400" y2="180" stroke="#64748b"/><line x1="390" y1="130" x2="560" y2="180" stroke="#64748b"/>
<rect x="10" y="180" width="140" height="60" rx="8" fill="#fed7aa"/><text x="80" y="205" text-anchor="middle" class="svg-ink" font-size="12">MAC flooding</text><text x="80" y="225" text-anchor="middle" class="svg-accent" font-size="12">port security</text>
<rect x="170" y="180" width="140" height="60" rx="8" fill="#fed7aa"/><text x="240" y="205" text-anchor="middle" class="svg-ink" font-size="12">Rogue DHCP</text><text x="240" y="225" text-anchor="middle" class="svg-accent" font-size="12">DHCP snooping</text>
<rect x="330" y="180" width="140" height="60" rx="8" fill="#fed7aa"/><text x="400" y="205" text-anchor="middle" class="svg-ink" font-size="12">ARP spoofing</text><text x="400" y="225" text-anchor="middle" class="svg-accent" font-size="12">DAI</text>
<rect x="490" y="180" width="140" height="60" rx="8" fill="#fed7aa"/><text x="560" y="205" text-anchor="middle" class="svg-ink" font-size="12">VLAN hop / STP</text><text x="560" y="225" text-anchor="middle" class="svg-accent" font-size="12">DTP off, guards</text>
</svg><p class="cap">Har user-facing port ek entry point hai. Har threat ka ek matching switch feature hai.</p></div>

<h3>Paanch access-layer threats, concept level par</h3>
<p>Hum attacks sirf unhe pehchanne aur unse bachne ke liye padhte hain. Yeh raha har ek kya karta hai aur kyun nuksaan karta hai.</p>
<dl class="terms">
<dt>MAC flooding (CAM table overflow)</dt><dd>Ek tool har second hazaaron frames bhejta hai, har ek naye fake source MAC se. Switch ki MAC address table (CAM table) bhar jaati hai. Bharne ke baad switch real hosts ko seekh nahi paata, isliye unke unicast frames ko VLAN ke har port par <b>flood</b> karta hai, purane hub ki tarah. Attacker ab woh traffic dekh leta hai jo uske liye tha hi nahi. Bachav: <b>port security</b> limit karta hai ki ek port kitne MACs use kar sakta hai.</dd>
<dt>Rogue DHCP aur DHCP starvation</dt><dd>Rogue DHCP server (aksar ek masoom ghar ka router jo "zyada ports ke liye" laga diya gaya) clients ko pehle jawab deta hai aur galat gateway ya DNS server deta hai, man in the middle ban jaata hai ya bas connectivity tod deta hai. Starvation iska saathi attack hai: fake clients asli pool ka har address maang lete hain jab tak woh khaali na ho jaaye. Bachav: trusted ports aur rate limits ke saath <b>DHCP snooping</b>, plus port security.</dd>
<dt>ARP spoofing (ARP poisoning)</dt><dd>ARP mein koi authentication nahi hota. Attacker bina maange ARP replies bhejta hai ki "gateway 10.30.0.1 mere MAC par hai". Victims apni ARP cache update kar lete hain aur subnet ke bahar ka saara traffic attacker ko bhejte hain. Bachav: <b>Dynamic ARP Inspection</b>, jo har ARP packet ko IP-to-MAC bindings ki ek trusted table se check karta hai.</dd>
<dt>VLAN hopping</dt><dd>Do tareeke. <b>Switch spoofing</b>: attacker ka NIC DTP bolta hai, port trunk ban jaata hai, aur attacker saare VLANs dekh leta hai. <b>Double tagging</b>: attacker do 802.1Q tags wala frame bhejta hai; pehla switch outer tag hata deta hai kyunki woh native VLAN se match karta hai, aur agla switch frame ko inner VLAN mein forward kar deta hai. Bachav: static access ports, DTP disabled, unused native VLAN, unused ports shut down.</dd>
<dt>STP manipulation</dt><dd>Ek device kam bridge priority wale superior BPDUs bhejta hai aur root bridge ban jaata hai. Ab traffic usi se ho kar jaata hai, ya topology baar baar badalti hai aur network flap karta hai. Bachav: edge ports par <b>BPDU Guard</b> aur jahan root kabhi nahi aana chahiye wahan <b>Root Guard</b>.</dd>
</dl>

<h3>Real network mein yeh kyun matter karta hai</h3>
<p>Companies ke andar zyada tar security incidents firewall tod kar shuru nahi hote. Woh kisi aise se shuru hote hain jo pehle se andar hai: meeting room mein visitor, compromised laptop, ya koi device jo user ghar se laaya. Layer 2 attacks saste bhi hain: free tools seconds mein MAC flooding ya ARP poisoning chala dete hain. Aur bahut saare Layer 2 "attacks" accidents hote hain. Rogue DHCP server aam taur par ek bhala employee hota hai, aur STP root change aam taur par desk ke neeche rakha chhota switch. Wahi features dono ko rokte hain.</p>

<h3>Features ek dusre par kaise build hote hain</h3>
<table class="cmp"><tr><th>Feature</th><th>Kis par trust karta hai</th><th>Kis par depend karta hai</th></tr>
<tr><td><b>Port security</b></td><td>Har port par MACs ki list ya count</td><td>Static access (ya trunk) port</td></tr>
<tr><td><b>DHCP snooping</b></td><td>DHCP server messages sirf trusted ports par</td><td>Kisi par nahi; binding table banata hai</td></tr>
<tr><td><b>DAI</b></td><td>ARP tabhi jab MAC aur IP binding ya ARP ACL se match karein</td><td>DHCP snooping bindings ya static entries</td></tr>
<tr><td><b>IP Source Guard</b></td><td>Har port par IP (aur optionally MAC) source</td><td>DHCP snooping bindings ya static entries</td></tr>
<tr><td><b>802.1X / MAB</b></td><td>RADIUS server dwara approved identity</td><td>AAA aur RADIUS server</td></tr>
</table>
<p>Isse configuration order milta hai: port security, phir DHCP snooping, phir DAI aur IP Source Guard. Ulta banaoge to DAI legitimate traffic drop karega kyunki binding table abhi khaali hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek branch access switch mein 48 ports hain: 40 user PCs, 4 printers, 2 uplinks aur 2 unused. Hardening plan yeh hai: har user aur printer port static access port hai port security ke saath (PC plus IP phone ke liye maximum 2, printers ke liye 1); user VLAN par DHCP snooping aur DAI, sirf 2 uplinks trusted; saare 44 edge ports par BPDU Guard; har jagah DTP off; 2 unused ports parking VLAN 999 mein shut down. Yaani 46 untrusted edge ports aur 2 trusted ports, aur interface ranges use karke yeh lagbhag 20 lines ka configuration hai.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh sochna ki Layer 2 security firewalls ya ACLs ki jagah le leti hai. Aisa nahi hai. Yeh local segment ko protect karti hai, woh VLAN jahan hosts ek dusre se aur apne gateway se baat karte hain. Networks ke beech aapko abhi bhi ACLs aur firewalls chahiye, aur device management ke liye AAA. Har layer alag gap cover karti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Har attack ko uske mitigation se match karo: MAC flooding se port security, rogue DHCP aur starvation se DHCP snooping, ARP spoofing se DAI, switch spoofing se DTP disable karna, double tagging se unused native VLAN, STP root takeover se BPDU Guard ya Root Guard. Questions aksar galat attack ke liye sahi feature list karte hain.</p></div>

<div class="scn"><h4>Meeting-room wala router</h4><p>Ek branch office mein teesre floor ke users ko achanak 192.168.0.x addresses milne lage aur har internal application ka access chala gaya. Helpdesk ne PCs reboot kiye, jisse aur zyada fail ho gaye. Network engineer ne ek PC par <code>ipconfig /all</code> chalaya aur ek DHCP server address dekha jo company ka nahi tha. Us MAC ko switch ki MAC table mein trace karne par ek meeting-room port mila jahan ek visitor ne connection share karne ke liye chhota wireless router laga diya tha. Engineer ne port shut kiya, phir access switches par DHCP snooping enable kiya, sirf uplinks trusted rakhe.</p><p><b>Seekh:</b> zyada tar Layer 2 incidents accidents hote hain, aur jo features attacker ko rokte hain wahi masoom galti ko bhi rokte hain.</p></div>

<div class="iv"><p class="q">"Jab humare paas firewall already hai to access switches par security features kyun chahiye?"</p><p>Strong answer: firewall sirf woh traffic dekhta hai jo usse ho kar jaata hai. Ek hi VLAN ke hosts switch ke through seedhe baat karte hain, isliye MAC flooding, rogue DHCP, ARP spoofing, VLAN hopping aur STP attacks kabhi firewall tak pahunchte hi nahi. Matching features ke naam lo (port security, DHCP snooping, DAI, DTP off ke saath unused native VLAN, BPDU Guard) aur batao ki yeh accidents bhi rokte hain, jaise wall port mein laga ghar ka router.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Switch default mein sab par bharosa karta hai; Layer 2 security user-facing ports par yeh bharosa hata deti hai.</li>
<li>Paanch threats: MAC flooding, rogue DHCP/starvation, ARP spoofing, VLAN hopping aur STP manipulation.</li>
<li>Har threat ka matching feature hai: port security, DHCP snooping, DAI, DTP off plus unused native VLAN, BPDU/Root Guard.</li>
<li>DAI aur IP Source Guard DHCP snooping binding table par depend karte hain, isliye snooping pehle configure karo.</li>
<li>Bahut saare incidents accidents hote hain; defences dono cases mein ek jaise kaam karte hain.</li>
</ul></div>
`}};export{e as default};