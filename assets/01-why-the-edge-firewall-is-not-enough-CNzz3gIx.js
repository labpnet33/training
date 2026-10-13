var e={id:`why-edge-not-enough`,h:{en:`Why the edge firewall is not enough`,hi:`Edge firewall kaafi kyun nahi hai`},body:{en:`
<h3>What you will learn</h3>
<p>This track teaches you to protect the traffic that flows <b>between</b> servers inside a data center, using a distributed firewall and micro-segmentation. You will read policy, write rules, publish them and prove with test traffic that they work. This first module builds the vocabulary and shows you the problem. By the end of this chapter you can:</p>
<ul>
<li>explain why a firewall at the edge of a data center cannot see traffic between two servers inside it;</li>
<li>define virtual machine, hypervisor, host, virtual switch, virtual network card, firewall rule, north-south traffic and east-west traffic in plain words;</li>
<li>name the company and the six servers we use in every lab.</li>
</ul>
<p><b>Prerequisites:</b> you know what an IP address is and that a firewall allows or blocks traffic. Nothing else. This is independent training based on published product documentation; it is not made by or endorsed by any vendor, and it does not prepare you for any named certification.</p>

<h3>An analogy: a bank with one guard at the front door</h3>
<p>Imagine a bank. One guard stands at the front door and checks every visitor. Inside, however, every door is open: the lobby, the cash room, the records room and the vault. A visitor who gets past the guard, or a staff member whose pass is stolen, can walk anywhere. The guard did a good job at the door, but the door is the only place the guard stands.</p>
<p>A safer bank still keeps the front guard, and also puts a lock on every internal door. The cashier's pass opens the cash room but not the vault. If one pass is stolen, the thief reaches one room, not the whole building. A distributed firewall is the set of locks on the internal doors of a data center.</p>

<h3>Words you must know</h3>
<dl class="terms">
<dt>Virtual machine (VM)</dt><dd>A complete computer made of software. It has its own operating system, its own IP address and its own applications, but it shares a physical server with other VMs. A data center runs thousands of them.</dd>
<dt>Hypervisor and host</dt><dd>The <b>hypervisor</b> is the software layer that lets one physical server run many VMs. The physical server running it is called the <b>host</b>. Many hosts together form the data center.</dd>
<dt>Virtual switch</dt><dd>A switch built in software inside the host. It connects the VMs on that host to each other and to the physical network, the way a normal switch connects cables.</dd>
<dt>Virtual network card (vNIC)</dt><dd>The network card of a VM, also made of software. Every packet a VM sends leaves through its vNIC, and every packet it receives arrives through its vNIC. Remember this word: chapter 3 depends on it.</dd>
<dt>Firewall rule</dt><dd>One line of policy with four parts: <b>source</b> (who sends), <b>destination</b> (who receives), <b>service</b> (which protocol and port, for example sql) and <b>action</b> (allow or deny). Rules are read in order and the first match decides.</dd>
<dt>North-south traffic</dt><dd>Traffic that enters or leaves the data center, for example a customer on the internet reaching a web server. On a map it runs vertically, so it is called north-south.</dd>
<dt>East-west traffic</dt><dd>Traffic between servers inside the data center, for example a web server asking an application server for data. On a map it runs sideways.</dd>
</dl>

<h3>Where the edge firewall stands</h3>
<p>Traditional protection puts a firewall at the entrance of the data center, called the <b>edge</b> or <b>perimeter</b>. It sees every packet that crosses the entrance, so it is excellent for north-south traffic. But a packet from one VM to another VM never crosses the entrance. It travels through a virtual switch or a few switches inside, and the edge firewall never sees it. The firewall is not broken; it simply is not standing there.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Edge firewall sees only north-south traffic">
<rect x="20" y="90" width="80" height="40" rx="8" fill="#e2e8f0"/><text x="60" y="115" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="125" y="90" width="90" height="40" rx="8" fill="#fde68a"/><text x="170" y="115" text-anchor="middle" class="svg-ink" font-size="12">Edge firewall</text>
<line x1="100" y1="110" x2="125" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="215" y1="110" x2="260" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="260" y="20" width="370" height="200" rx="10" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="445" y="42" text-anchor="middle" class="svg-muted" font-size="12">Data center</text>
<rect x="280" y="60" width="80" height="40" rx="8" fill="#bae6fd"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="12">WEB-P</text>
<rect x="410" y="60" width="80" height="40" rx="8" fill="#bbf7d0"/><text x="450" y="85" text-anchor="middle" class="svg-ink" font-size="12">APP-P</text>
<rect x="540" y="60" width="80" height="40" rx="8" fill="#ddd6fe"/><text x="580" y="85" text-anchor="middle" class="svg-ink" font-size="12">DB-P</text>
<line x1="360" y1="80" x2="410" y2="80" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="490" y1="80" x2="540" y2="80" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="445" y="140" text-anchor="middle" class="svg-ink" font-size="12">East-west: no guard on these paths</text>
<text x="170" y="170" text-anchor="middle" class="svg-ink" font-size="12">North-south: checked here</text>
<text x="445" y="190" text-anchor="middle" class="svg-muted" font-size="12">VMs talk freely behind the front door</text>
</svg><p class="cap">The edge firewall checks what enters and leaves. Traffic between the three VMs never passes it.</p></div>

<h3>Meet Narmada Cloud Services</h3>
<p>Every lab in this track uses one company: <b>Narmada Cloud Services</b>. It runs a three-tier application in two environments. The <b>web</b> tier talks to customers, the <b>app</b> tier holds business logic, and the <b>database</b> tier stores records. The production (prod) environment has WEB-P (10.10.10.10), APP-P (10.10.10.20) and DB-P (10.10.10.30). The development (dev) environment has WEB-D (10.10.20.10), APP-D (10.10.20.20) and DB-D (10.10.20.30). A single management console holds the firewall policy for all six.</p>

<div class="eg"><p><b>Worked example.</b> A customer opens the Narmada site. The request enters the data center (north-south) and the edge firewall allows it to WEB-P on h&#116;tps. WEB-P then asks APP-P for the customer's order list: this is east-west. APP-P asks DB-P for the rows using sql: east-west again. Out of three hops, the edge firewall saw one. The other two, which carry the valuable data, were invisible to it.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Thinking "we have a firewall, so internal traffic is protected": the firewall only protects the paths that pass through it. (2) Mixing up the directions: north-south crosses the data center boundary, east-west stays inside. (3) Thinking a VM is a different thing from a computer: it behaves like one, only built from software.</p></div>
<div class="exam"><p><b>Exam trap.</b> If a question says "traffic between two servers in the same data center", the word you want is east-west, even if the servers are on different subnets.</p></div>

<div class="scn"><h4>The audit that found open doors</h4><p>Narmada passed its yearly review: the edge firewall had strict rules and clean logs. A new engineer then asked a simple question, "what stops the web server from talking to the database?" Nobody could point to a rule. The edge firewall could not help, because that traffic never reached it. The team decided to add protection at the VM level, which is what this track teaches.</p><p><b>Lesson:</b> a strong front door says nothing about the doors inside.</p></div>

<div class="iv"><p class="q">"What is the difference between north-south and east-west traffic?"</p><p>Strong answer: north-south enters or leaves the data center and crosses the perimeter firewall; east-west moves between workloads inside it and usually never meets the perimeter. Add that most traffic in a modern data center is east-west, so a perimeter-only design leaves the biggest share unchecked.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VM is a software computer; a hypervisor runs many VMs on a host; a vNIC is the VM's software network card.</li>
<li>A firewall rule has a source, a destination, a service and an action.</li>
<li>North-south traffic crosses the data center boundary; east-west stays inside it.</li>
<li>The edge firewall only sees what crosses the entrance, so east-west traffic is unchecked by it.</li>
<li>Narmada Cloud Services (WEB, APP, DB in prod and dev) is the example company for every lab.</li>
</ul></div>
`,hi:`
<h3>Is chapter mein aap kya seekhoge</h3>
<p>Yeh track aapko data center ke andar servers ke <b>beech</b> chalne wale traffic ko protect karna sikhata hai, distributed firewall aur micro-segmentation ke saath. Aap policy padhoge, rules likhoge, unhe publish karoge aur test traffic se saabit karoge ki woh kaam karte hain. Yeh pehla module vocabulary banata hai aur aapko problem dikhata hai. Is chapter ke end tak aap yeh kar sakoge:</p>
<ul>
<li>samjha sakoge ki data center ke edge par laga firewall do servers ke beech ka traffic kyun nahi dekh sakta;</li>
<li>virtual machine, hypervisor, host, virtual switch, virtual network card, firewall rule, north-south traffic aur east-west traffic ko simple words mein define kar sakoge;</li>
<li>us company aur un chhe servers ka naam bata sakoge jo hum har lab mein use karte hain.</li>
</ul>
<p><b>Prerequisites:</b> aapko pata ho IP address kya hota hai aur firewall traffic ko allow ya block karta hai. Bas itna. Yeh independent training hai jo published product documentation par based hai; yeh kisi vendor ne nahi banayi aur na hi kisi vendor ne endorse ki hai, aur yeh kisi named certification ki taiyari nahi karati.</p>

<h3>Ek analogy: ek bank jisme sirf front door par guard hai</h3>
<p>Ek bank socho. Ek guard front door par khada hai aur har visitor ko check karta hai. Lekin andar har darwaza khula hai: lobby, cash room, records room aur vault. Jo visitor guard ko paar kar le, ya jis staff member ka pass chori ho jaye, woh kahin bhi ghoom sakta hai. Guard ne darwaze par achha kaam kiya, lekin guard sirf darwaze par hi khada hai.</p>
<p>Ek safer bank front guard bhi rakhta hai, aur har andar ke darwaze par lock bhi lagata hai. Cashier ka pass cash room kholta hai lekin vault nahi. Agar ek pass chori ho jaye to chor ek room tak pahunchta hai, poori building tak nahi. Distributed firewall data center ke andar ke darwazon par lagi hui locks ka set hai.</p>

<h3>Words jo aapko aane chahiye</h3>
<dl class="terms">
<dt>Virtual machine (VM)</dt><dd>Software se bana ek poora computer. Uska apna operating system, apna IP address aur apni applications hoti hain, lekin woh ek physical server doosre VMs ke saath share karta hai. Ek data center hazaaron VMs chalata hai.</dd>
<dt>Hypervisor aur host</dt><dd><b>Hypervisor</b> woh software layer hai jo ek physical server par kai VMs chalne deti hai. Jo physical server use chalata hai woh <b>host</b> kehlata hai. Kai hosts milkar data center banate hain.</dd>
<dt>Virtual switch</dt><dd>Host ke andar software mein bana switch. Yeh us host ke VMs ko ek doosre se aur physical network se jodta hai, jaise normal switch cables ko jodta hai.</dd>
<dt>Virtual network card (vNIC)</dt><dd>VM ka network card, jo bhi software se bana hota hai. VM jo bhi packet bhejta hai woh uske vNIC se nikalta hai, aur jo bhi receive karta hai woh uske vNIC se aata hai. Yeh word yaad rakho: chapter 3 isi par depend karta hai.</dd>
<dt>Firewall rule</dt><dd>Policy ki ek line jisme chaar parts hote hain: <b>source</b> (kaun bhejta hai), <b>destination</b> (kaun receive karta hai), <b>service</b> (kaunsa protocol aur port, jaise sql) aur <b>action</b> (allow ya deny). Rules order mein padhe jaate hain aur pehla match decide karta hai.</dd>
<dt>North-south traffic</dt><dd>Jo traffic data center mein aata ya bahar jaata hai, jaise internet par ek customer ka web server tak pahunchna. Map par yeh seedha ooper-neeche chalta hai, isliye north-south kehte hain.</dd>
<dt>East-west traffic</dt><dd>Data center ke andar servers ke beech ka traffic, jaise web server ka application server se data maangna. Map par yeh side mein chalta hai.</dd>
</dl>

<h3>Edge firewall kahan khada hai</h3>
<p>Traditional protection firewall ko data center ke entrance par rakhti hai, jise <b>edge</b> ya <b>perimeter</b> kehte hain. Woh entrance cross karne wala har packet dekhta hai, isliye north-south traffic ke liye bahut achha hai. Lekin ek VM se doosre VM tak jaane wala packet kabhi entrance cross nahi karta. Woh andar ke virtual switch ya kuch switches se guzarta hai, aur edge firewall use kabhi nahi dekhta. Firewall kharab nahi hai; woh bas wahan khada hi nahi hai.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Edge firewall sirf north-south traffic dekhta hai">
<rect x="20" y="90" width="80" height="40" rx="8" fill="#e2e8f0"/><text x="60" y="115" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="125" y="90" width="90" height="40" rx="8" fill="#fde68a"/><text x="170" y="115" text-anchor="middle" class="svg-ink" font-size="12">Edge firewall</text>
<line x1="100" y1="110" x2="125" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="215" y1="110" x2="260" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="260" y="20" width="370" height="200" rx="10" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="445" y="42" text-anchor="middle" class="svg-muted" font-size="12">Data center</text>
<rect x="280" y="60" width="80" height="40" rx="8" fill="#bae6fd"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="12">WEB-P</text>
<rect x="410" y="60" width="80" height="40" rx="8" fill="#bbf7d0"/><text x="450" y="85" text-anchor="middle" class="svg-ink" font-size="12">APP-P</text>
<rect x="540" y="60" width="80" height="40" rx="8" fill="#ddd6fe"/><text x="580" y="85" text-anchor="middle" class="svg-ink" font-size="12">DB-P</text>
<line x1="360" y1="80" x2="410" y2="80" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="490" y1="80" x2="540" y2="80" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="445" y="140" text-anchor="middle" class="svg-ink" font-size="12">East-west: in raston par koi guard nahi</text>
<text x="170" y="170" text-anchor="middle" class="svg-ink" font-size="12">North-south: yahan check hota hai</text>
<text x="445" y="190" text-anchor="middle" class="svg-muted" font-size="12">Front door ke peeche VMs khul ke baat karte hain</text>
</svg><p class="cap">Edge firewall wahi check karta hai jo andar aata ya bahar jaata hai. Teeno VMs ke beech ka traffic uske paas se kabhi nahi guzarta.</p></div>

<h3>Narmada Cloud Services se milo</h3>
<p>Is track ka har lab ek hi company use karta hai: <b>Narmada Cloud Services</b>. Woh do environments mein three-tier application chalati hai. <b>Web</b> tier customers se baat karta hai, <b>app</b> tier business logic rakhta hai, aur <b>database</b> tier records store karta hai. Production (prod) environment mein WEB-P (10.10.10.10), APP-P (10.10.10.20) aur DB-P (10.10.10.30) hain. Development (dev) environment mein WEB-D (10.10.20.10), APP-D (10.10.20.20) aur DB-D (10.10.20.30) hain. Ek hi management console chhahon ki firewall policy rakhta hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek customer Narmada ki site kholta hai. Request data center mein aati hai (north-south) aur edge firewall use WEB-P tak h&#116;tps par allow karta hai. Phir WEB-P, APP-P se customer ki order list maangta hai: yeh east-west hai. APP-P, DB-P se sql ke zariye rows maangta hai: yeh bhi east-west. Teen hops mein se edge firewall ne sirf ek dekha. Baaki do, jinme sabse keemti data hai, uske liye invisible the.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Yeh sochna ki "firewall hai, to internal traffic protected hai": firewall sirf un paths ko protect karta hai jo uske through guzarte hain. (2) Directions mix karna: north-south data center boundary cross karta hai, east-west andar hi rehta hai. (3) VM ko computer se alag cheez samajhna: woh computer ki tarah hi behave karta hai, bas software se bana hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Agar question kehta hai "same data center ke do servers ke beech ka traffic", to sahi shabd east-west hai, chahe servers alag subnets par hon.</p></div>

<div class="scn"><h4>Audit jisne khule darwaze pakde</h4><p>Narmada saalana review mein pass ho gayi: edge firewall ke rules strict the aur logs saaf the. Phir ek naye engineer ne ek simple sawal pucha, "web server ko database se baat karne se kya rokta hai?" Koi ek rule nahi dikha paya. Edge firewall madad nahi kar sakta tha, kyunki woh traffic uske paas kabhi pahuncha hi nahi. Team ne VM level par protection jodne ka faisla kiya, jo yeh track sikhata hai.</p><p><b>Seekh:</b> mazboot front door andar ke darwazon ke baare mein kuch nahi batata.</p></div>

<div class="iv"><p class="q">"North-south aur east-west traffic mein kya fark hai?"</p><p>Strong answer: north-south data center mein aata ya bahar jaata hai aur perimeter firewall cross karta hai; east-west andar ke workloads ke beech chalta hai aur aam taur par perimeter se milta hi nahi. Yeh jodo ki modern data center ka zyada traffic east-west hota hai, to sirf perimeter wala design sabse bade hisse ko unchecked chhod deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VM software ka computer hai; hypervisor host par kai VMs chalata hai; vNIC VM ka software network card hai.</li>
<li>Firewall rule mein source, destination, service aur action hota hai.</li>
<li>North-south traffic data center boundary cross karta hai; east-west andar rehta hai.</li>
<li>Edge firewall sirf wahi dekhta hai jo entrance cross kare, isliye east-west traffic uske liye unchecked hai.</li>
<li>Narmada Cloud Services (prod aur dev mein WEB, APP, DB) har lab ki example company hai.</li>
</ul></div>
`}};export{e as default};