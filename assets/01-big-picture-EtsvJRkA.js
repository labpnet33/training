var e={id:`big-picture`,h:{en:`The big picture: how one click becomes data on a wire`,hi:`Big picture: ek click wire par data kaise banta hai`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to take any conversation on a network, such as a browser opening a web page, and explain exactly what happens at every layer and on every link: which headers are added, which addresses are used, what a switch and a router change, how TCP makes delivery reliable and why UDP does not bother. You will read Ethernet, IPv4, TCP and UDP headers field by field, name the role of every box in a network diagram (routers, switches, firewalls, access points, controllers, servers, PoE), recognise the standard topology designs, and read a packet capture the way a senior engineer does.</p>

<p><b>Prerequisites.</b> You should have finished <b>net-start</b> (what a network, an IP address and a MAC address are) and <b>ccna-ios</b> (how to move between user, privileged and configuration mode on a Cisco device and run <code>show</code> commands). You do not need subnetting yet; that comes two modules later in ccna-ipv4. Cabling, speed and duplex are covered in the next module, ccna-interfaces.</p>

<h3>Start with an analogy: sending a parcel across the country</h3>
<p>Imagine you are in Delhi and you send a book to a friend in Bengaluru. You write a note for your friend (the <b>data</b>). You put it in an envelope with your friend's name and flat number, so the right person in the building opens it (that is the <b>port number</b>, which picks the application). The envelope goes into a courier box with the full street address of both cities (the <b>IP address</b>, end to end). At each courier hub the box is loaded onto a different truck with a different truck number and a different driver (the <b>MAC address</b>, which only matters for one leg of the journey). The trucks drive on roads (the <b>cable, fibre or radio</b>).</p>
<p>Notice two things. First, each layer of packaging has one job and does not care about the others: the driver never opens the envelope. Second, the <b>street address stays the same</b> for the whole trip, but the <b>truck changes at every hub</b>. Keep this picture in mind, because it is exactly how packets move across routers, and it is the single most tested idea in this module.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Lab topology PC1 SW1 R1 SRV">
<rect x="20" y="80" width="110" height="56" rx="8" fill="#bbf7d0"/><text x="75" y="104" text-anchor="middle" class="svg-ink" font-size="14">PC1</text><text x="75" y="123" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.10/24</text>
<rect x="180" y="80" width="110" height="56" rx="8" fill="#bae6fd"/><text x="235" y="104" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="235" y="123" text-anchor="middle" class="svg-muted" font-size="12">Layer 2 switch</text>
<rect x="340" y="80" width="120" height="56" rx="8" fill="#ddd6fe"/><text x="400" y="104" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="400" y="123" text-anchor="middle" class="svg-muted" font-size="12">Layer 3 router</text>
<rect x="510" y="80" width="110" height="56" rx="8" fill="#fde68a"/><text x="565" y="104" text-anchor="middle" class="svg-ink" font-size="14">SRV</text><text x="565" y="123" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.80</text>
<line x1="130" y1="108" x2="180" y2="108" stroke="#64748b" stroke-width="2"/><line x1="290" y1="108" x2="340" y2="108" stroke="#64748b" stroke-width="2"/><line x1="460" y1="108" x2="510" y2="108" stroke="#64748b" stroke-width="2"/>
<text x="155" y="160" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1</text><text x="315" y="160" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 - Gi0/0</text><text x="485" y="160" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1</text>
<text x="235" y="40" text-anchor="middle" class="svg-accent" font-size="13">LAN 10.1.1.0/24, gateway 10.1.1.1</text>
<text x="500" y="40" text-anchor="middle" class="svg-accent" font-size="13">Server segment 203.0.113.0/24</text>
<text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="13">One web request: PC1 opens the page on SRV, port 80</text>
</svg><p class="cap">The lab topology used in this whole module. Two IP subnets, one switch, one router, one web server.</p></div>

<h3>Why networks are built in layers</h3>
<p>Networking is a huge problem: electrical signals, addressing millions of devices, finding paths, recovering lost data, and presenting a web page. Nobody could build or troubleshoot that as one block. So the problem is split into <b>layers</b>. Each layer offers a service to the layer above and uses the service of the layer below. A web browser does not need to know whether the PC uses Wi-Fi or copper; a switch does not need to know whether the data is a video or an email.</p>
<p>This split gives three big benefits. <b>Interoperability:</b> a Cisco router, a Juniper router and a Linux server all follow the same layer standards, so they talk to each other. <b>Independent change:</b> Ethernet went from 10 Mbps to 400 Gbps without anybody rewriting HTTP. <b>Troubleshooting:</b> an engineer can say "Layer 1 is fine, the link is up; Layer 2 is fine, I see the MAC; the problem is at Layer 3", and cut the search in half each time.</p>

<h3>The two models you must know</h3>
<p>You will learn two reference models. The <b>OSI model</b> has seven layers and is the vocabulary everyone uses ("that is a Layer 2 problem", "an L7 firewall"). The <b>TCP/IP model</b> has four (or five) layers and describes the protocols the internet actually runs. Chapters 2 and 3 cover them layer by layer, with the PDU name and typical devices for each.</p>

<div class="eg"><p><b>Worked example.</b> When PC1 opens the web page on SRV in Lab 1, the capture shows about ten frames for one click: two ARP frames (PC1 asks for the gateway's MAC), three TCP handshake segments (SYN, SYN-ACK, ACK), the request "GET /", the "200 OK" reply with the page, acknowledgements, and the close. Each of those frames carries an Ethernet header, an IPv4 header and a TCP header, and you will be able to read every field by chapter 11.</p></div>

<h3>How this module is organised</h3>
<ol>
<li>OSI model, layer by layer (chapter 2) and the TCP/IP model (chapter 3).</li>
<li>Encapsulation and decapsulation (chapter 4).</li>
<li>The headers: Ethernet frame (chapter 5) and IPv4 header (chapter 6).</li>
<li>What changes hop by hop through a switch and a router (chapter 7).</li>
<li>TCP and UDP, the handshake, windowing and well-known ports (chapter 8).</li>
<li>Network components (chapter 9) and topology architectures (chapter 10).</li>
<li>Reading a capture and a troubleshooting workflow (chapter 11), then the summary (chapter 12).</li>
</ol>
<p>The two labs follow the same path. <b>Lab 1</b> has you configure PC1 with <code>ip 10.1.1.10/24 10.1.1.1</code>, open the page with <code>h&#116;tp 203.0.113.80</code>, and read the destination MAC, the TTL and the IP Protocol field. <b>Lab 2</b> is a ticket: the web page does not load because the server has no default gateway, and after fixing it you read EtherType, TCP flags and ports.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Treating the layer model as theory to memorise and forget. Engineers use it every day as a checklist: bottom up (is the cable up, is the MAC learned, is there a route, is the port open) or top down. If you only learn the layer names you will fail the practical questions; learn what each layer adds to the packet.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions often mix the models: "At which layer of the TCP/IP model does a router operate?" The answer is the <b>Internet</b> layer (OSI Layer 3, Network). Always check which model the question names before you answer with a number.</p></div>

<div class="scn"><h4>"The internet is down" that was not</h4><p>A help-desk ticket said "internet is down" for a whole floor. A junior engineer started rebooting the core router. A senior engineer instead worked up the layers from one PC: link light on (Layer 1 fine), the PC had learned the gateway's MAC in its ARP table (Layer 2 fine), ping to the gateway and to a public address worked (Layer 3 fine), but browsing to names failed. Pinging by name failed too. The DNS server address handed out by DHCP had been changed by mistake. Fixing one line of DHCP configuration solved it in ten minutes.</p><p><b>Lesson:</b> the layer model is a troubleshooting tool. Proving each layer works narrows the fault fast and stops you from breaking things that were never broken.</p></div>

<div class="iv"><p class="q">"Why do we use layered network models at all?"</p><p>Strong answer: layering splits a complex problem into independent jobs with standard interfaces, so vendors interoperate, one layer can change without touching the others (Ethernet speeds grew without changing HTTP), and troubleshooting becomes systematic. Give a concrete example: "If ping to the gateway works but the website fails, Layers 1 to 3 are proven and I look at transport or application: port, DNS, the service itself."</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Data is wrapped in layers: application data, then a port (transport), then IP addresses (network), then MAC addresses (data link), then signals (physical).</li>
<li>The IP address is end to end and stays the same; the MAC address is per link and changes at every router.</li>
<li>Layers give interoperability, independent change and a troubleshooting checklist.</li>
<li>Two models: OSI (7 layers, the vocabulary) and TCP/IP (the protocols actually used).</li>
<li>The lab: PC1 10.1.1.10 to SRV 203.0.113.80 through SW1 and R1, one web request on port 80.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap network par kisi bhi conversation ko, jaise browser ka web page kholna, le kar exactly explain kar paoge ki har layer aur har link par kya hota hai: kaunse headers jodte hain, kaunse addresses use hote hain, switch aur router kya badalte hain, TCP delivery ko reliable kaise banata hai aur UDP iski fikar kyun nahi karta. Aap Ethernet, IPv4, TCP aur UDP headers ko field by field padhoge, network diagram ke har box ka role bata paoge (routers, switches, firewalls, access points, controllers, servers, PoE), standard topology designs pehchanoge, aur packet capture ko ek senior engineer ki tarah padhoge.</p>

<p><b>Prerequisites.</b> Aapne <b>net-start</b> (network, IP address aur MAC address kya hote hain) aur <b>ccna-ios</b> (Cisco device par user, privileged aur configuration mode ke beech kaise jaate hain aur <code>show</code> commands kaise chalate hain) complete kar liya hona chahiye. Abhi subnetting ki zaroorat nahi; woh do module baad ccna-ipv4 mein aata hai. Cabling, speed aur duplex agle module ccna-interfaces mein cover hote hain.</p>

<h3>Ek analogy se shuru karo: desh bhar mein parcel bhejna</h3>
<p>Socho aap Delhi mein ho aur Bengaluru mein ek dost ko kitaab bhejte ho. Aap dost ke liye ek note likhte ho (yeh <b>data</b> hai). Use ek envelope mein daalte ho jis par dost ka naam aur flat number hai, taaki building mein sahi insaan use khole (yeh <b>port number</b> hai, jo application chunta hai). Envelope ek courier box mein jaata hai jis par dono shehron ka poora street address hai (yeh <b>IP address</b> hai, end to end). Har courier hub par box ek alag truck mein load hota hai, jiska truck number aur driver alag hota hai (yeh <b>MAC address</b> hai, jo sirf safar ke ek hisse ke liye matter karta hai). Trucks sadkon par chalte hain (yeh <b>cable, fibre ya radio</b> hai).</p>
<p>Do cheezein notice karo. Pehli, packaging ki har layer ka ek hi kaam hai aur use baaki layers ki parwah nahi: driver kabhi envelope nahi kholta. Dusri, poore safar mein <b>street address wahi rehta hai</b>, lekin <b>har hub par truck badal jaata hai</b>. Yeh picture yaad rakho, kyunki routers ke through packets bilkul aise hi chalte hain, aur is module mein sabse zyada test hone wala idea yahi hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Lab topology PC1 SW1 R1 SRV">
<rect x="20" y="80" width="110" height="56" rx="8" fill="#bbf7d0"/><text x="75" y="104" text-anchor="middle" class="svg-ink" font-size="14">PC1</text><text x="75" y="123" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.10/24</text>
<rect x="180" y="80" width="110" height="56" rx="8" fill="#bae6fd"/><text x="235" y="104" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="235" y="123" text-anchor="middle" class="svg-muted" font-size="12">Layer 2 switch</text>
<rect x="340" y="80" width="120" height="56" rx="8" fill="#ddd6fe"/><text x="400" y="104" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="400" y="123" text-anchor="middle" class="svg-muted" font-size="12">Layer 3 router</text>
<rect x="510" y="80" width="110" height="56" rx="8" fill="#fde68a"/><text x="565" y="104" text-anchor="middle" class="svg-ink" font-size="14">SRV</text><text x="565" y="123" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.80</text>
<line x1="130" y1="108" x2="180" y2="108" stroke="#64748b" stroke-width="2"/><line x1="290" y1="108" x2="340" y2="108" stroke="#64748b" stroke-width="2"/><line x1="460" y1="108" x2="510" y2="108" stroke="#64748b" stroke-width="2"/>
<text x="155" y="160" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1</text><text x="315" y="160" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 - Gi0/0</text><text x="485" y="160" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1</text>
<text x="235" y="40" text-anchor="middle" class="svg-accent" font-size="13">LAN 10.1.1.0/24, gateway 10.1.1.1</text>
<text x="500" y="40" text-anchor="middle" class="svg-accent" font-size="13">Server segment 203.0.113.0/24</text>
<text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="13">Ek web request: PC1 SRV ka page kholta hai, port 80</text>
</svg><p class="cap">Poore module mein yahi lab topology use hoti hai. Do IP subnets, ek switch, ek router, ek web server.</p></div>

<h3>Networks layers mein kyun bante hain</h3>
<p>Networking ek bahut badi problem hai: electrical signals, laakhon devices ki addressing, paths dhoondhna, khoya data wapas laana, aur web page dikhana. Koi bhi ise ek block ki tarah build ya troubleshoot nahi kar sakta. Isliye problem ko <b>layers</b> mein baanta jaata hai. Har layer apne upar wali layer ko service deti hai aur neeche wali layer ki service use karti hai. Web browser ko jaanne ki zaroorat nahi ki PC Wi-Fi use kar raha hai ya copper; switch ko jaanne ki zaroorat nahi ki data video hai ya email.</p>
<p>Is split se teen bade fayde milte hain. <b>Interoperability:</b> Cisco router, Juniper router aur Linux server sab same layer standards follow karte hain, isliye aapas mein baat karte hain. <b>Independent change:</b> Ethernet 10 Mbps se 400 Gbps tak gaya bina kisi ke HTTP dobara likhe. <b>Troubleshooting:</b> engineer keh sakta hai "Layer 1 theek hai, link up hai; Layer 2 theek hai, MAC dikh raha hai; problem Layer 3 par hai", aur har baar search aadhi kar sakta hai.</p>

<h3>Do models jo aapko aane chahiye</h3>
<p>Aap do reference models seekhoge. <b>OSI model</b> mein saat layers hain aur yeh woh vocabulary hai jo sab use karte hain ("yeh Layer 2 problem hai", "L7 firewall"). <b>TCP/IP model</b> mein chaar (ya paanch) layers hain aur yeh un protocols ko describe karta hai jo internet sach mein chalata hai. Chapter 2 aur 3 inhe layer by layer cover karte hain, har layer ka PDU naam aur typical devices ke saath.</p>

<div class="eg"><p><b>Worked example.</b> Jab Lab 1 mein PC1 SRV ka web page kholta hai, capture ek click ke liye lagbhag das frames dikhata hai: do ARP frames (PC1 gateway ka MAC poochta hai), teen TCP handshake segments (SYN, SYN-ACK, ACK), request "GET /", page ke saath "200 OK" reply, acknowledgements, aur close. In sab frames mein ek Ethernet header, ek IPv4 header aur ek TCP header hota hai, aur chapter 11 tak aap har field padh paoge.</p></div>

<h3>Yeh module kaise organised hai</h3>
<ol>
<li>OSI model, layer by layer (chapter 2) aur TCP/IP model (chapter 3).</li>
<li>Encapsulation aur decapsulation (chapter 4).</li>
<li>Headers: Ethernet frame (chapter 5) aur IPv4 header (chapter 6).</li>
<li>Switch aur router se guzarte hue hop by hop kya badalta hai (chapter 7).</li>
<li>TCP aur UDP, handshake, windowing aur well-known ports (chapter 8).</li>
<li>Network components (chapter 9) aur topology architectures (chapter 10).</li>
<li>Capture padhna aur troubleshooting workflow (chapter 11), phir summary (chapter 12).</li>
</ol>
<p>Dono labs isi raaste par chalte hain. <b>Lab 1</b> mein aap PC1 ko <code>ip 10.1.1.10/24 10.1.1.1</code> se configure karte ho, <code>h&#116;tp 203.0.113.80</code> se page kholte ho, aur destination MAC, TTL aur IP Protocol field padhte ho. <b>Lab 2</b> ek ticket hai: web page load nahi hota kyunki server ka default gateway nahi hai, aur fix karne ke baad aap EtherType, TCP flags aur ports padhte ho.</p>

<div class="warn"><p><b>Beginners ki common galti.</b> Layer model ko ratne aur bhool jaane wali theory samajhna. Engineers ise roz checklist ki tarah use karte hain: bottom up (cable up hai, MAC learn hua, route hai, port open hai) ya top down. Agar aap sirf layer names seekhoge to practical questions mein fail hoge; yeh seekho ki har layer packet mein kya jodti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions aksar models mix karte hain: "TCP/IP model ki kis layer par router kaam karta hai?" Jawab hai <b>Internet</b> layer (OSI Layer 3, Network). Number se jawab dene se pehle hamesha check karo ki question kaunsa model bol raha hai.</p></div>

<div class="scn"><h4>"Internet down hai" jo tha hi nahi</h4><p>Help-desk ticket mein likha tha ki poore floor ka "internet down hai". Ek junior engineer ne core router reboot karna shuru kar diya. Ek senior engineer ne iske bajaye ek PC se layers upar chadhte hue kaam kiya: link light on (Layer 1 theek), PC ne apni ARP table mein gateway ka MAC seekh liya tha (Layer 2 theek), gateway aur ek public address ko ping chal raha tha (Layer 3 theek), lekin names par browsing fail thi. Name se ping bhi fail tha. DHCP se diya jaane wala DNS server address galti se badal diya gaya tha. DHCP configuration ki ek line theek karne se das minute mein problem solve ho gayi.</p><p><b>Seekh:</b> layer model ek troubleshooting tool hai. Har layer ko working prove karne se fault jaldi narrow hota hai aur aap woh cheezein nahi todte jo kabhi tooti hi nahi thi.</p></div>

<div class="iv"><p class="q">"Hum layered network models use hi kyun karte hain?"</p><p>Strong answer: layering ek complex problem ko standard interfaces wale independent kaamon mein baant deti hai, isliye vendors interoperate karte hain, ek layer baaki ko chhue bina badal sakti hai (Ethernet speeds badhi bina HTTP badle), aur troubleshooting systematic ban jaati hai. Ek concrete example do: "Agar gateway ko ping chal raha hai lekin website fail hai, to Layers 1 se 3 prove ho gayi aur main transport ya application dekhta hoon: port, DNS, khud service."</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Data layers mein wrap hota hai: application data, phir port (transport), phir IP addresses (network), phir MAC addresses (data link), phir signals (physical).</li>
<li>IP address end to end hai aur wahi rehta hai; MAC address per link hai aur har router par badalta hai.</li>
<li>Layers interoperability, independent change aur troubleshooting checklist dete hain.</li>
<li>Do models: OSI (7 layers, vocabulary) aur TCP/IP (jo protocols sach mein use hote hain).</li>
<li>Lab: PC1 10.1.1.10 se SRV 203.0.113.80 tak SW1 aur R1 ke through, port 80 par ek web request.</li>
</ul></div>
`}};export{e as default};