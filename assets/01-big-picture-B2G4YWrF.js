var e={id:`big-picture`,h:{en:`The big picture: why discovery protocols exist`,hi:`Big picture: discovery protocols kyun hote hain`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to explain what CDP and LLDP are and why every enterprise network runs at least one of them, read every column of <code>show cdp neighbors</code> and <code>show lldp neighbors</code> without mixing up local and remote ports, enable and disable each protocol globally and per interface, explain how IP phones learn their voice VLAN and negotiate power, draw a topology you cannot see, spot duplex and native VLAN mismatches, and decide where discovery must be switched off for security. This maps to CCNA 200-301 exam topic <b>2.3: configure and verify Layer 2 discovery protocols (Cisco Discovery Protocol and LLDP)</b>.</p>
<p><b>Prerequisites.</b> You should be comfortable with the IOS CLI modes from the <i>Cisco IOS from zero</i> module, know what speed and duplex are from <i>Interfaces, cabling, speed and duplex</i>, and know access ports, trunks and the native VLAN from <i>VLANs and 802.1Q trunking</i>. We will refer back to those ideas, not re-teach them. Spanning tree and port security come in later modules; here we only preview how discovery helps them.</p>

<h3>An analogy: name badges at a conference</h3>
<p>Imagine a large conference hall. Every person wears a name badge that says their name, their company, their job title and their phone number. You can read the badge of anybody standing <b>right next to you</b>, but you cannot read the badge of someone on the other side of the hall. To find out who is over there, you would have to walk up to the person next to you, ask who stands next to <i>them</i>, and so on, one step at a time.</p>
<p>Discovery protocols are name badges for network devices. Every switch, router, IP phone or access point periodically announces a small message out of each of its interfaces: "I am SW2, I am a Catalyst switch running this software, I am talking to you from my port GigabitEthernet0/1, and you can manage me at 10.50.0.12." The device on the other end of the cable stores that badge in a <b>neighbour table</b>. Nobody forwards the badge any further, so you only ever learn about your <b>directly connected</b> neighbours.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Discovery is one hop only">
<rect x="20" y="80" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="110" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="190" y="80" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="250" y="110" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<rect x="360" y="80" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="420" y="110" text-anchor="middle" class="svg-ink" font-size="14">SW2</text>
<rect x="520" y="80" width="100" height="50" rx="8" fill="#fde68a"/><text x="570" y="110" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<line x1="140" y1="105" x2="190" y2="105" stroke="#64748b" stroke-width="2"/><line x1="310" y1="105" x2="360" y2="105" stroke="#64748b" stroke-width="2"/><line x1="480" y1="105" x2="520" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="165" y="70" text-anchor="middle" class="svg-accent" font-size="12">hello</text><text x="335" y="70" text-anchor="middle" class="svg-accent" font-size="12">hello</text><text x="500" y="70" text-anchor="middle" class="svg-accent" font-size="12">hello</text>
<text x="250" y="160" text-anchor="middle" class="svg-muted" font-size="12">SW1 knows: R1, SW2</text>
<text x="420" y="160" text-anchor="middle" class="svg-muted" font-size="12">SW2 knows: SW1, R2</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">SW1 never learns about R2 directly: frames stop at the neighbour</text>
</svg><p class="cap">Discovery frames travel exactly one hop. Each device only learns about the device at the other end of each of its own cables.</p></div>

<h3>The problem it solves</h3>
<p>Picture your first week in a new job. You are handed the password to a switch in a wiring closet with 48 cables plugged in, and the network diagram on the shared drive is three years old. Which port goes to the core switch? Which one goes to the internet router? Is the device on port 23 a phone, an access point or someone's home router? You could trace cables by hand with a torch, or you could type one command and let the neighbours tell you. That is the job of a discovery protocol.</p>
<p>Discovery protocols do four big jobs in real networks:</p>
<ul>
<li><b>Documentation.</b> Building and checking a topology map: which device, which model, which port on each end of every cable. Network management tools build their automatic maps from exactly this data.</li>
<li><b>Troubleshooting.</b> Confirming that a cable lands where you think it does, finding a neighbour's management IP when you have nothing else, and receiving automatic warnings about <b>duplex</b> and <b>native VLAN</b> mismatches.</li>
<li><b>Voice VLAN.</b> Telling an IP phone which VLAN to tag its voice traffic with, so voice and data are separated from the first second the phone boots.</li>
<li><b>PoE negotiation.</b> Letting a powered device such as a phone or access point ask the switch for exactly the amount of Power over Ethernet it needs.</li>
</ul>

<h3>Two protocols, one idea</h3>
<table class="cmp"><tr><th></th><th>CDP</th><th>LLDP</th></tr>
<tr><td>Full name</td><td>Cisco Discovery Protocol</td><td>Link Layer Discovery Protocol</td></tr>
<tr><td>Standard</td><td>Cisco proprietary</td><td>Open standard, IEEE 802.1AB</td></tr>
<tr><td>Who speaks it</td><td>Cisco devices (and some others)</td><td>Almost every vendor, servers, phones</td></tr>
<tr><td>Default on Cisco IOS</td><td>Enabled</td><td>Disabled</td></tr>
<tr><td>Timers</td><td>60 s / 180 s</td><td>30 s / 120 s</td></tr>
</table>
<p>Both work at <b>Layer 2</b>. That matters: they work before any IP address is configured, on access ports, trunks and routed ports alike, and they do not need routing. You will study CDP first because it is on by default and gives the richest Cisco-to-Cisco information, then LLDP, which you need whenever another vendor is involved.</p>

<div class="eg"><p><b>Worked example.</b> In this module's CDP lab you inherit a network of R1, SW1, SW2, R2 and two PCs. On SW1 one command shows two neighbours: R1 on local port Gi0/0 and SW2 on local port Gi0/1. On SW2 the same command shows SW1 on Gi0/1 and R2 on Gi0/5. With two commands you have drawn three of the five links. The two PC links never appear because ordinary PCs do not run CDP, which is itself useful information: ports with no neighbour are usually end hosts.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Expecting <code>show cdp neighbors</code> to list every device in the network. It lists only directly connected devices that speak the same protocol. A missing entry does not prove a device is absent: it may run only LLDP, have discovery disabled, or be an ordinary PC.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which protocol can discover devices several hops away?" Neither. CDP and LLDP are link-local and never forwarded by the receiving Cisco device. Multi-hop discovery needs a management tool that logs in to each neighbour in turn, or protocols like SNMP.</p></div>

<div class="scn"><h4>The mystery port in the branch office</h4><p>A branch reported slow Wi-Fi. The engineer logged in to the branch switch remotely and ran <code>show cdp neighbors</code>. Alongside the expected router and access point, port Gi0/14 showed a device with capability <b>H P M</b> and platform "IP Phone", but Gi0/9 showed nothing at all even though its light was on. <code>show mac address-table interface gi0/9</code> revealed dozens of MAC addresses on that single port. Somebody had plugged a cheap home router into the wall socket. The engineer shut the port and asked the branch to remove the device.</p><p><b>Lesson:</b> discovery tells you what the infrastructure is, and the silence of a port is a clue too.</p></div>

<div class="iv"><p class="q">"Why would you use CDP or LLDP in a production network?"</p><p>A strong answer lists the four jobs: documentation and topology mapping, troubleshooting (verify cabling, learn a neighbour's management IP, duplex and native VLAN mismatch warnings), voice VLAN assignment to IP phones, and PoE power negotiation. Then add balance: they also leak information, so you keep them on infrastructure links and disable them on untrusted edge ports.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Discovery protocols let each device announce who it is to the device at the other end of each cable.</li>
<li>Information travels exactly one hop; neighbours never forward it.</li>
<li>Four jobs: documentation, troubleshooting, voice VLAN, PoE negotiation.</li>
<li>CDP is Cisco proprietary and on by default; LLDP is IEEE 802.1AB and off by default on Cisco IOS.</li>
<li>Both are Layer 2 and work before IP is configured.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap samjha paoge ki CDP aur LLDP kya hain aur har enterprise network kam se kam ek kyun chalata hai, <code>show cdp neighbors</code> aur <code>show lldp neighbors</code> ka har column bina local aur remote port mix kiye padh paoge, dono protocols ko globally aur per interface enable aur disable kar paoge, samjha paoge ki IP phones apna voice VLAN kaise seekhte hain aur power kaise negotiate karte hain, ek aisi topology draw kar paoge jo aapko dikh nahi rahi, duplex aur native VLAN mismatch pakad paoge, aur decide kar paoge ki security ke liye discovery kahan band karni hai. Yeh CCNA 200-301 exam topic <b>2.3: configure and verify Layer 2 discovery protocols (Cisco Discovery Protocol and LLDP)</b> se map hota hai.</p>
<p><b>Prerequisites.</b> Aapko <i>Cisco IOS from zero</i> module ke IOS CLI modes aane chahiye, <i>Interfaces, cabling, speed and duplex</i> se speed aur duplex pata hona chahiye, aur <i>VLANs and 802.1Q trunking</i> se access ports, trunks aur native VLAN pata hone chahiye. Hum un ideas ko refer karenge, dobara nahi padhayenge. Spanning tree aur port security baad ke modules mein aate hain; yahan hum sirf preview karenge ki discovery unmein kaise help karti hai.</p>

<h3>Ek analogy: conference mein name badges</h3>
<p>Ek bade conference hall ki kalpana karo. Har insaan ek name badge pehnta hai jis par uska naam, company, job title aur phone number likha hai. Aap <b>bilkul bagal mein khade</b> kisi ka bhi badge padh sakte ho, lekin hall ke doosre kone mein khade insaan ka badge nahi padh sakte. Wahan kaun hai yeh jaanne ke liye aapko bagal wale ke paas jaana padega, poochna padega ki <i>unke</i> bagal mein kaun hai, aur aise hi ek-ek step aage badhna padega.</p>
<p>Discovery protocols network devices ke name badges hain. Har switch, router, IP phone ya access point time-time par apne har interface se ek chhota message announce karta hai: "Main SW2 hoon, main yeh software chalane wala Catalyst switch hoon, main tumse apne port GigabitEthernet0/1 se baat kar raha hoon, aur mujhe 10.50.0.12 par manage kar sakte ho." Cable ke doosre end wala device us badge ko ek <b>neighbour table</b> mein store karta hai. Koi bhi badge ko aage forward nahi karta, isliye aapko sirf apne <b>directly connected</b> neighbours ka pata chalta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Discovery sirf ek hop">
<rect x="20" y="80" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="110" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="190" y="80" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="250" y="110" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<rect x="360" y="80" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="420" y="110" text-anchor="middle" class="svg-ink" font-size="14">SW2</text>
<rect x="520" y="80" width="100" height="50" rx="8" fill="#fde68a"/><text x="570" y="110" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<line x1="140" y1="105" x2="190" y2="105" stroke="#64748b" stroke-width="2"/><line x1="310" y1="105" x2="360" y2="105" stroke="#64748b" stroke-width="2"/><line x1="480" y1="105" x2="520" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="165" y="70" text-anchor="middle" class="svg-accent" font-size="12">hello</text><text x="335" y="70" text-anchor="middle" class="svg-accent" font-size="12">hello</text><text x="500" y="70" text-anchor="middle" class="svg-accent" font-size="12">hello</text>
<text x="250" y="160" text-anchor="middle" class="svg-muted" font-size="12">SW1 jaanta hai: R1, SW2</text>
<text x="420" y="160" text-anchor="middle" class="svg-muted" font-size="12">SW2 jaanta hai: SW1, R2</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">SW1 ko R2 ka seedha pata nahi chalta: frames neighbour par ruk jaate hain</text>
</svg><p class="cap">Discovery frames exactly ek hop chalte hain. Har device sirf apni cables ke doosre end wale device ke baare mein seekhta hai.</p></div>

<h3>Yeh kaunsi problem solve karta hai</h3>
<p>Nayi job ke pehle hafte ki kalpana karo. Aapko wiring closet ke ek switch ka password diya gaya hai jismein 48 cables lagi hain, aur shared drive par network diagram teen saal purana hai. Kaunsa port core switch tak jaata hai? Kaunsa internet router tak? Port 23 par phone hai, access point hai, ya kisi ka ghar wala router? Aap torch le kar haath se cables trace kar sakte ho, ya ek command type kar ke neighbours se khud bulwa sakte ho. Yahi discovery protocol ka kaam hai.</p>
<p>Real networks mein discovery protocols chaar bade kaam karte hain:</p>
<ul>
<li><b>Documentation.</b> Topology map banana aur check karna: har cable ke dono ends par kaunsa device, kaunsa model, kaunsa port. Network management tools apne automatic maps isi data se banate hain.</li>
<li><b>Troubleshooting.</b> Confirm karna ki cable wahin lagi hai jahan aap soch rahe ho, jab kuch aur na ho to neighbour ka management IP nikalna, aur <b>duplex</b> aur <b>native VLAN</b> mismatch ki automatic warnings paana.</li>
<li><b>Voice VLAN.</b> IP phone ko batana ki voice traffic ko kis VLAN se tag kare, taaki phone boot hote hi voice aur data alag ho jaayein.</li>
<li><b>PoE negotiation.</b> Phone ya access point jaise powered device ko switch se exactly utna Power over Ethernet maangne dena jitna use chahiye.</li>
</ul>

<h3>Do protocols, ek idea</h3>
<table class="cmp"><tr><th></th><th>CDP</th><th>LLDP</th></tr>
<tr><td>Poora naam</td><td>Cisco Discovery Protocol</td><td>Link Layer Discovery Protocol</td></tr>
<tr><td>Standard</td><td>Cisco proprietary</td><td>Open standard, IEEE 802.1AB</td></tr>
<tr><td>Kaun bolta hai</td><td>Cisco devices (aur kuch doosre)</td><td>Lagbhag har vendor, servers, phones</td></tr>
<tr><td>Cisco IOS par default</td><td>Enabled</td><td>Disabled</td></tr>
<tr><td>Timers</td><td>60 s / 180 s</td><td>30 s / 120 s</td></tr>
</table>
<p>Dono <b>Layer 2</b> par kaam karte hain. Yeh important hai: yeh koi bhi IP address configure hone se pehle kaam karte hain, access ports, trunks aur routed ports sab par, aur inhe routing ki zaroorat nahi. Aap pehle CDP padhoge kyunki yeh default on hai aur Cisco-se-Cisco sabse zyada information deta hai, phir LLDP, jiski zaroorat tab padti hai jab koi doosra vendor involved ho.</p>

<div class="eg"><p><b>Worked example.</b> Is module ke CDP lab mein aapko R1, SW1, SW2, R2 aur do PCs ka network milta hai. SW1 par ek command do neighbours dikhata hai: local port Gi0/0 par R1 aur local port Gi0/1 par SW2. SW2 par wahi command Gi0/1 par SW1 aur Gi0/5 par R2 dikhata hai. Do commands se aapne paanch mein se teen links draw kar liye. Do PC links kabhi nahi dikhte kyunki normal PCs CDP nahi chalate, aur yeh bhi useful information hai: jin ports par koi neighbour nahi, woh aam taur par end hosts hote hain.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh expect karna ki <code>show cdp neighbors</code> network ke har device ko list karega. Yeh sirf directly connected devices list karta hai jo same protocol bolte hain. Entry missing hone se yeh prove nahi hota ki device nahi hai: ho sakta hai woh sirf LLDP chalata ho, uski discovery disabled ho, ya woh normal PC ho.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa protocol kai hops door ke devices discover kar sakta hai?" Koi nahi. CDP aur LLDP link-local hain aur receive karne wala Cisco device inhe kabhi forward nahi karta. Multi-hop discovery ke liye ek management tool chahiye jo ek-ek neighbour par login kare, ya SNMP jaise protocols.</p></div>

<div class="scn"><h4>Branch office ka mystery port</h4><p>Ek branch ne slow Wi-Fi report kiya. Engineer ne branch switch par remotely login kiya aur <code>show cdp neighbors</code> chalaya. Expected router aur access point ke saath, port Gi0/14 par capability <b>H P M</b> aur platform "IP Phone" wala device dikha, lekin Gi0/9 par kuch bhi nahi dikha jabki uski light jal rahi thi. <code>show mac address-table interface gi0/9</code> ne us ek port par darjanon MAC addresses dikhaye. Kisi ne wall socket mein ek sasta home router laga diya tha. Engineer ne port shut kiya aur branch se device hatwaya.</p><p><b>Seekh:</b> discovery batati hai ki infrastructure kya hai, aur kisi port ki khamoshi bhi ek clue hai.</p></div>

<div class="iv"><p class="q">"Production network mein aap CDP ya LLDP kyun use karoge?"</p><p>Strong answer chaaron kaam list karta hai: documentation aur topology mapping, troubleshooting (cabling verify karna, neighbour ka management IP seekhna, duplex aur native VLAN mismatch warnings), IP phones ko voice VLAN dena, aur PoE power negotiation. Phir balance jodo: yeh information leak bhi karte hain, isliye inhe infrastructure links par on rakhte ho aur untrusted edge ports par disable karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Discovery protocols har device ko har cable ke doosre end wale device ko batane dete hain ki woh kaun hai.</li>
<li>Information exactly ek hop chalti hai; neighbours ise kabhi forward nahi karte.</li>
<li>Chaar kaam: documentation, troubleshooting, voice VLAN, PoE negotiation.</li>
<li>CDP Cisco proprietary hai aur default on; LLDP IEEE 802.1AB hai aur Cisco IOS par default off.</li>
<li>Dono Layer 2 hain aur IP configure hone se pehle kaam karte hain.</li>
</ul></div>
`}};export{e as default};