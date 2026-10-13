var e={id:`welcome`,h:{en:`Welcome: what a network is and what you will learn`,hi:`Welcome: network kya hai aur aap kya seekhoge`},body:{en:`
<p><b>What you will learn in this module.</b> This is the zero-level module of the JNCIA-Junos course (exam JN0-106). You need no networking experience. By the end you will know what a router, a switch and a packet are, how IP addresses and Ethernet work in plain words, why Junos feels different from other command lines, which Juniper product does what, how the JNCIA, JNCIS-ENT and JNCIP-ENT certifications connect, and how to practise in this simulator. There are no labs here: the goal is to remove fear before the first command.</p>
<p><b>Prerequisites.</b> You should be able to use a computer, a browser and a text editor. That is all.</p>

<h3>Start with an analogy: a network is a postal system</h3>
<p>Imagine a country with houses, post offices and sorting centres. You write a letter, put the destination address on the envelope and drop it in a box. A local post office looks at the address and decides: deliver in this street, or send to the big sorting centre. The sorting centre looks at the city and sends it onward. Finally a postman delivers it to the right door.</p>
<p>A computer network works the same way. A <b>host</b> (laptop, phone, server) wants to send data. The data is cut into small pieces called <b>packets</b>, each with a destination address. <b>Switches</b> carry packets inside one building or floor, like the street postman. <b>Routers</b> carry packets between networks, like the sorting centres. Your job as a network engineer is to make sure every device knows where to hand the packet next.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Host to host through a switch and routers">
<rect x="10" y="70" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="55" y="100" text-anchor="middle" class="svg-ink" font-size="13">Laptop</text>
<rect x="150" y="70" width="90" height="50" rx="8" fill="#bae6fd"/><text x="195" y="100" text-anchor="middle" class="svg-ink" font-size="13">Switch</text>
<rect x="290" y="70" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="335" y="100" text-anchor="middle" class="svg-ink" font-size="13">Router</text>
<rect x="430" y="70" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="475" y="100" text-anchor="middle" class="svg-ink" font-size="13">Router</text>
<rect x="560" y="70" width="70" height="50" rx="8" fill="#fde68a"/><text x="595" y="100" text-anchor="middle" class="svg-ink" font-size="13">Server</text>
<line x1="100" y1="95" x2="150" y2="95" stroke="#64748b" stroke-width="2"/><line x1="240" y1="95" x2="290" y2="95" stroke="#64748b" stroke-width="2"/><line x1="380" y1="95" x2="430" y2="95" stroke="#64748b" stroke-width="2"/><line x1="520" y1="95" x2="560" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="195" y="150" text-anchor="middle" class="svg-muted" font-size="12">same street</text>
<text x="335" y="150" text-anchor="middle" class="svg-muted" font-size="12">between networks</text>
<text x="475" y="150" text-anchor="middle" class="svg-muted" font-size="12">between networks</text>
</svg><p class="cap">A packet travels from a laptop to a server. The switch moves it inside the local network, the routers move it between networks.</p></div>

<h3>Why Juniper and why JNCIA</h3>
<p>Juniper Networks makes routers, switches, firewalls and wireless gear used by internet providers, data centres, universities and large companies. All of it runs one operating system family called <b>Junos OS</b>. Learn Junos once and you can work on a small branch switch and on a huge core router with the same commands. The <b>JNCIA-Junos</b> certification (Juniper Networks Certified Associate, exam <b>JN0-106</b>) proves you understand networking basics and the Junos way of working. It is the entry point of the Enterprise Routing and Switching track.</p>

<h3>How this course is built</h3>
<table class="cmp"><tr><th>Module</th><th>What it gives you</th></tr>
<tr><td>Start here (this one)</td><td>Zero-level concepts, vocabulary, product map, exam path</td></tr>
<tr><td>Fundamentals</td><td>Addressing, subnetting, longest match, TCP and UDP</td></tr>
<tr><td>Junos OS</td><td>Routing Engine, forwarding engine, transit and exception traffic</td></tr>
<tr><td>CLI, setup, services, monitoring</td><td>Configure, commit, roll back, verify, maintain</td></tr>
<tr><td>Routing, policy, OSPF, filters</td><td>Static and dynamic routing, firewall filters</td></tr></table>

<div class="eg"><p><b>Worked example.</b> You open a website on your laptop at 192.0.2.10. Your laptop builds a packet addressed to the web server 203.0.113.50. The packet goes to your switch, then to your office router (your <i>default gateway</i>), then across two provider routers, and finally to the server. At no point does any device know the whole path. Each one only knows the <b>next hop</b>. That idea, hop-by-hop forwarding, is the heart of networking.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Trying to memorise commands before understanding what the device is doing. Commands change between vendors, but the ideas (packet, address, next hop, table lookup) never change. Understand the idea first, then the command is easy.</p></div>

<div class="scn"><h4>The new joiner who froze</h4><p>Ravi joined a support team as a fresher. On day one a senior asked him to check why a branch could not reach the head office. He opened a router CLI and froze: hundreds of commands, no map. His senior drew three boxes on paper: branch PC, branch router, head-office router, and asked, "Where does the packet stop?" Ravi then ran a ping from the PC, a ping to the router, a ping across the link, and found the break in ten minutes. The commands were new, but the question "where does it stop" needed only the postal-system picture.</p><p><b>Lesson:</b> a mental map of how packets travel beats memorised commands.</p></div>

<div class="iv"><p class="q">"Explain in simple words what a router does."</p><p>Strong answer: a router connects different networks and forwards each packet toward its destination by looking up the destination IP address in its routing table and choosing the best next hop. Compare it with a switch, which forwards frames inside one network using MAC addresses. A one-line analogy (post office sorting centre) shows you can explain to non-technical people.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A network moves small pieces of data called packets between hosts using addresses.</li>
<li>Switches connect devices inside one network; routers connect different networks.</li>
<li>Every device only decides the next hop; there is no single device that knows the full path.</li>
<li>Junos OS runs on all Juniper platforms, so one skill set covers many devices.</li>
<li>JNCIA-Junos (JN0-106) is the entry certification; this module needs no prior knowledge.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Yeh JNCIA-Junos course (exam JN0-106) ka zero-level module hai. Aapko networking ka koi experience nahi chahiye. Ant tak aap jaan jaoge ki router, switch aur packet kya hote hain, IP address aur Ethernet simple shabdon mein kaise kaam karte hain, Junos baaki command lines se alag kyun lagta hai, kaunsa Juniper product kya karta hai, JNCIA, JNCIS-ENT aur JNCIP-ENT certifications kaise jude hain, aur is simulator mein practice kaise karni hai. Yahan koi lab nahi hai: maqsad pehle command se pehle ka darr hatana hai.</p>
<p><b>Prerequisites.</b> Aapko computer, browser aur text editor chalana aana chahiye. Bas itna hi.</p>

<h3>Analogy se shuru karo: network ek postal system hai</h3>
<p>Socho ek desh hai jisme ghar, post office aur sorting centre hain. Aap letter likhte ho, envelope par destination address daalte ho aur letter box mein daal dete ho. Local post office address dekhta hai aur faisla karta hai: isi gali mein deliver karo, ya bade sorting centre bhejo. Sorting centre city dekh kar aage bhejta hai. Aakhir mein postman sahi darwaaze par deliver karta hai.</p>
<p>Computer network bilkul aise hi kaam karta hai. Ek <b>host</b> (laptop, phone, server) data bhejna chahta hai. Data chhote tukdon mein kata jaata hai jinhe <b>packets</b> kehte hain, har packet par destination address hota hai. <b>Switches</b> ek building ya floor ke andar packets le jaate hain, gali ke postman ki tarah. <b>Routers</b> alag-alag networks ke beech packets le jaate hain, sorting centre ki tarah. Network engineer ka kaam hai yeh pakka karna ki har device ko pata ho packet agle kisko dena hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Host se host, switch aur routers ke through">
<rect x="10" y="70" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="55" y="100" text-anchor="middle" class="svg-ink" font-size="13">Laptop</text>
<rect x="150" y="70" width="90" height="50" rx="8" fill="#bae6fd"/><text x="195" y="100" text-anchor="middle" class="svg-ink" font-size="13">Switch</text>
<rect x="290" y="70" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="335" y="100" text-anchor="middle" class="svg-ink" font-size="13">Router</text>
<rect x="430" y="70" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="475" y="100" text-anchor="middle" class="svg-ink" font-size="13">Router</text>
<rect x="560" y="70" width="70" height="50" rx="8" fill="#fde68a"/><text x="595" y="100" text-anchor="middle" class="svg-ink" font-size="13">Server</text>
<line x1="100" y1="95" x2="150" y2="95" stroke="#64748b" stroke-width="2"/><line x1="240" y1="95" x2="290" y2="95" stroke="#64748b" stroke-width="2"/><line x1="380" y1="95" x2="430" y2="95" stroke="#64748b" stroke-width="2"/><line x1="520" y1="95" x2="560" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="195" y="150" text-anchor="middle" class="svg-muted" font-size="12">ek hi gali</text>
<text x="335" y="150" text-anchor="middle" class="svg-muted" font-size="12">networks ke beech</text>
<text x="475" y="150" text-anchor="middle" class="svg-muted" font-size="12">networks ke beech</text>
</svg><p class="cap">Packet laptop se server tak jaata hai. Switch use local network ke andar chalata hai, routers networks ke beech.</p></div>

<h3>Juniper aur JNCIA kyun</h3>
<p>Juniper Networks routers, switches, firewalls aur wireless gear banata hai jo internet providers, data centres, universities aur bade companies mein use hote hain. Sab kuch ek operating system family par chalta hai jise <b>Junos OS</b> kehte hain. Junos ek baar seekh lo to chhote branch switch aur bade core router, dono par wahi commands chalte hain. <b>JNCIA-Junos</b> certification (Juniper Networks Certified Associate, exam <b>JN0-106</b>) saabit karti hai ki aap networking basics aur Junos ka kaam karne ka tareeka samajhte ho. Yeh Enterprise Routing and Switching track ka entry point hai.</p>

<h3>Yeh course kaise bana hai</h3>
<table class="cmp"><tr><th>Module</th><th>Aapko kya milta hai</th></tr>
<tr><td>Start here (yeh wala)</td><td>Zero-level concepts, vocabulary, product map, exam path</td></tr>
<tr><td>Fundamentals</td><td>Addressing, subnetting, longest match, TCP aur UDP</td></tr>
<tr><td>Junos OS</td><td>Routing Engine, forwarding engine, transit aur exception traffic</td></tr>
<tr><td>CLI, setup, services, monitoring</td><td>Configure, commit, roll back, verify, maintain</td></tr>
<tr><td>Routing, policy, OSPF, filters</td><td>Static aur dynamic routing, firewall filters</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Aap laptop (192.0.2.10) par ek website kholte ho. Laptop web server 203.0.113.50 ke naam ka packet banata hai. Packet switch ke paas jaata hai, phir office router (aapka <i>default gateway</i>), phir do provider routers, aur aakhir mein server. Kisi bhi jagah koi device poora rasta nahi jaanta. Har ek sirf <b>next hop</b> jaanta hai. Yeh hop-by-hop forwarding ka idea networking ka dil hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Device kya kar raha hai yeh samjhe bina commands ratna. Commands vendor ke saath badalte hain, lekin ideas (packet, address, next hop, table lookup) kabhi nahi badalte. Pehle idea samjho, phir command aasaan hai.</p></div>

<div class="scn"><h4>Jo fresher ghabra gaya</h4><p>Ravi fresher ke roop mein support team mein aaya. Pehle din senior ne use kaha ki dekho branch head office tak kyun nahi pahunch raha. Usne router CLI kholi aur ghabra gaya: saikdon commands, koi map nahi. Senior ne kaagaz par teen dibbe banaye: branch PC, branch router, head-office router, aur poocha, "Packet kahan ruk raha hai?" Ravi ne PC se ping, router tak ping, link ke paar ping chalaye aur das minute mein toot-ne ki jagah dhoondh li. Commands naye the, lekin "kahan ruka" sawal ke liye sirf postal-system ki tasveer chahiye thi.</p><p><b>Lesson:</b> packet kaise travel karta hai uska mental map ratne hue commands se behtar hai.</p></div>

<div class="iv"><p class="q">"Router kya karta hai, simple shabdon mein samjhaiye."</p><p>Strong answer: router alag-alag networks ko jodta hai aur har packet ko uski destination ki taraf forward karta hai, destination IP address ko routing table mein dekh kar aur best next hop chun kar. Switch se compare karo, jo ek network ke andar MAC addresses se frames forward karta hai. Ek line ki analogy (post office sorting centre) dikhati hai ki aap non-technical logon ko bhi samjha sakte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Network chhote data tukde (packets) addresses ke saath hosts ke beech bhejta hai.</li>
<li>Switch ek network ke andar devices jodta hai; router alag networks jodta hai.</li>
<li>Har device sirf next hop tay karta hai; poora rasta koi ek device nahi jaanta.</li>
<li>Junos OS saare Juniper platforms par chalta hai, isliye ek skill set kai devices cover karta hai.</li>
<li>JNCIA-Junos (JN0-106) entry certification hai; is module ko kisi pehle ke knowledge ki zaroorat nahi.</li>
</ul></div>
`}};export{e as default};