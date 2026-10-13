var e={id:`what-is-a-network`,h:{en:`What a network is, and how this academy works`,hi:`Network kya hai, aur yeh academy kaise kaam karti hai`},body:{en:`
<p><b>What you will learn in this module.</b> This is the very first module of both the CCNA track and the CompTIA Network+ track. By the end of it you will be able to explain what a network is, name the devices and cables you see in any office, convert numbers between binary, decimal and hex, tell a MAC address from an IP address and a port, describe step by step what happens when you open a web page, run the basic network commands on your own PC, and find your way around this academy's lab simulator.</p>
<p><b>Prerequisites.</b> None. You do not need to know programming, you do not need to have opened a terminal before, and you do not need any maths beyond adding numbers. If you can use a phone and a browser, you are ready. Every new word is defined the first time it appears.</p>

<h3>Start with an analogy: a network is a postal system for computers</h3>
<p>Think about how a letter gets from your home to a friend in another city. You write the message, put it in an envelope, write your friend's address and your own address on it, and drop it in a post box. The postman does not read your letter. He only reads the address, takes the envelope to the local post office, the post office sends it to a sorting centre, a truck or train carries it to the other city, and a local postman delivers it to the right house.</p>
<p>A <b>computer network</b> works the same way. A <b>network</b> is two or more devices connected together so they can exchange data. The data is cut into small pieces, each piece is wrapped in an "envelope" carrying a source address and a destination address, and devices along the way (switches and routers, which you will meet in chapter 3) read only the address and pass the piece along until it reaches the right device.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Postal system compared with a network">
<text x="320" y="20" text-anchor="middle" class="svg-accent" font-size="13">Postal system</text>
<rect x="10" y="30" width="110" height="40" rx="8" fill="#fde68a"/><text x="65" y="55" text-anchor="middle" class="svg-ink" font-size="13">Your house</text>
<rect x="150" y="30" width="120" height="40" rx="8" fill="#fed7aa"/><text x="210" y="55" text-anchor="middle" class="svg-ink" font-size="13">Local post office</text>
<rect x="300" y="30" width="140" height="40" rx="8" fill="#e2e8f0"/><text x="370" y="55" text-anchor="middle" class="svg-ink" font-size="13">Sorting centres</text>
<rect x="470" y="30" width="160" height="40" rx="8" fill="#fde68a"/><text x="550" y="55" text-anchor="middle" class="svg-ink" font-size="13">Friend's house</text>
<line x1="120" y1="50" x2="150" y2="50" stroke="#64748b" stroke-width="2"/><line x1="270" y1="50" x2="300" y2="50" stroke="#64748b" stroke-width="2"/><line x1="440" y1="50" x2="470" y2="50" stroke="#64748b" stroke-width="2"/>
<text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="13">Computer network</text>
<rect x="10" y="130" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="65" y="155" text-anchor="middle" class="svg-ink" font-size="13">Your laptop</text>
<rect x="150" y="130" width="120" height="40" rx="8" fill="#bae6fd"/><text x="210" y="155" text-anchor="middle" class="svg-ink" font-size="13">Switch / router</text>
<rect x="300" y="130" width="140" height="40" rx="8" fill="#ddd6fe"/><text x="370" y="155" text-anchor="middle" class="svg-ink" font-size="13">ISP routers</text>
<rect x="470" y="130" width="160" height="40" rx="8" fill="#bbf7d0"/><text x="550" y="155" text-anchor="middle" class="svg-ink" font-size="13">Web server</text>
<line x1="120" y1="150" x2="150" y2="150" stroke="#64748b" stroke-width="2"/><line x1="270" y1="150" x2="300" y2="150" stroke="#64748b" stroke-width="2"/><line x1="440" y1="150" x2="470" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="320" y="198" text-anchor="middle" class="svg-muted" font-size="12">Each hop reads only the address and passes the envelope on</text>
</svg><p class="cap">The same idea twice: an envelope with addresses, handed from one sorting point to the next.</p></div>

<h3>Why networks exist</h3>
<p>Before networks, if you wanted to give a file to a colleague you copied it to a disk and walked it over. Networks exist so that devices can <b>share</b>:</p>
<ul>
<li><b>Information</b>: email, chat, web pages, video calls, files.</li>
<li><b>Resources</b>: one printer, one internet connection or one storage server used by fifty people.</li>
<li><b>Applications</b>: a bank's app on your phone talks to the bank's servers hundreds of kilometres away.</li>
</ul>
<p>Every UPI payment, every video you stream, every online exam and every hospital record travels across a network. That is why network engineers are needed in every industry.</p>

<h3>LAN, WAN and the internet</h3>
<dl class="terms">
<dt>LAN (Local Area Network)</dt><dd>A network inside one building or site, such as your home, a college lab or one office floor. It is fast, owned by you, and usually built with switches, cables and Wi-Fi.</dd>
<dt>WAN (Wide Area Network)</dt><dd>A network that joins LANs over long distances, for example a company head office in Mumbai connected to branches in Pune and Delhi. The long-distance links are usually rented from a service provider.</dd>
<dt>Internet</dt><dd>The biggest WAN of all: a "network of networks" in which millions of independent networks (homes, companies, universities, cloud providers, ISPs) agree to exchange traffic using the same rules.</dd>
</dl>
<p>You will also hear <b>WLAN</b> (wireless LAN, i.e. Wi-Fi), <b>MAN</b> (metropolitan area network, one city) and <b>PAN</b> (personal area network, such as Bluetooth earbuds and your phone). The idea is the same; only the size changes.</p>

<div class="eg"><p><b>Worked example.</b> Priya works in the Pune branch of a company. Her laptop joins the office LAN by Wi-Fi. When she opens the payroll app, her request crosses the office LAN, then the company WAN link to the Mumbai data center, where the payroll server lives. When she opens a news site at lunch, her request leaves the office through the internet connection instead. One laptop, three kinds of network in ten minutes.</p></div>

<h3>How this academy works</h3>
<p>Every module in this academy follows the same five-step rhythm. Use it in this order and you will learn faster than by reading alone:</p>
<ol>
<li><b>Lesson</b>: the chapters you are reading now. Read one chapter at a time; each ends with key takeaways.</li>
<li><b>Labs</b>: hands-on practice in the browser-based simulator. You type real commands on simulated PCs, switches and routers, and each task is checked live. (This first module is about concepts, so its practice happens on your own PC in chapter 10; the simulator is introduced in chapter 11 and you start using it in the next module.)</li>
<li><b>Quiz</b>: short questions that check you really understood, with an explanation for every answer.</li>
<li><b>Scenarios</b>: realistic support tickets with real device output. You read the output and pick the cause, just as you would on the job.</li>
<li><b>Interview</b>: questions interviewers actually ask on this topic, with model answers and tips.</li>
</ol>

<div class="tip"><p><b>Study tip.</b> Keep a notebook (paper or digital). After each chapter, write the key takeaways in your own words and draw the diagram from memory. Drawing a network from memory is the single best test of understanding, and it is exactly what interviewers ask you to do on a whiteboard.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking "the internet" and "the web" are the same thing. The internet is the global network of networks (the roads). The web is one service that runs on top of it (like one type of delivery). Email, video calls, online games and UPI all use the internet without being "the web".</p></div>

<div class="exam"><p><b>Exam trap.</b> Size decides the name, not the technology. A Wi-Fi network in one office is still a LAN (a WLAN). A private link between two cities is a WAN even if it uses Ethernet. Questions often describe a network and ask you to classify it: look at the geography.</p></div>

<div class="scn"><h4>The printer nobody could use</h4><p>A small accounts office had five PCs and one printer connected by a USB cable to the manager's PC. Whenever the manager went home and shut down his PC, nobody could print, and staff carried files on pen drives to his desk. A technician added a small switch, connected every PC and a network-capable printer to it with cables, and gave each device an address. Now everyone printed directly over the LAN, and shared folders replaced the pen drives.</p><p><b>Lesson:</b> the whole point of a network is sharing. When you find people moving data by hand, you have found a network problem waiting to be solved.</p></div>

<div class="iv"><p class="q">"In simple words, what is a computer network, and what is the difference between a LAN and a WAN?"</p><p>Strong answer: a network is two or more devices connected so they can share data and resources. A LAN covers a small area such as one building, is owned by the organisation and is fast. A WAN connects LANs across cities or countries, usually over links rented from a service provider. The internet is the largest WAN, a network of networks. Add a real example, such as a branch office LAN connected to head office over a WAN link.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A network is two or more devices connected so they can share data and resources.</li>
<li>Data travels like letters: small pieces in envelopes with source and destination addresses.</li>
<li>LAN = one site; WAN = joins sites over distance; the internet = network of networks.</li>
<li>The internet is the roads; the web is just one service that uses them.</li>
<li>Study each module in order: lesson, labs, quiz, scenarios, interview.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Yeh CCNA track aur CompTIA Network+ track dono ka sabse pehla module hai. Iske end tak aap samjha paoge ki network kya hota hai, kisi bhi office mein dikhne wale devices aur cables ke naam le paoge, numbers ko binary, decimal aur hex mein convert kar paoge, MAC address, IP address aur port ka farak bata paoge, step by step bata paoge ki web page kholne par kya hota hai, apne PC par basic network commands chala paoge, aur is academy ke lab simulator mein aaram se kaam kar paoge.</p>
<p><b>Prerequisites.</b> Kuch nahi. Programming aani zaroori nahi, pehle kabhi terminal khola ho yeh zaroori nahi, aur numbers jodne se zyada maths nahi chahiye. Agar aap phone aur browser use kar sakte ho, to aap ready ho. Har naya word pehli baar aate hi explain kiya gaya hai.</p>

<h3>Ek analogy se shuru karo: network computers ka postal system hai</h3>
<p>Socho ek letter aapke ghar se dusre shehar mein dost tak kaise pahunchta hai. Aap message likhte ho, envelope mein daalte ho, us par dost ka address aur apna address likhte ho, aur post box mein daal dete ho. Postman aapka letter nahi padhta. Woh sirf address padhta hai, envelope ko local post office le jaata hai, post office use sorting centre bhejta hai, truck ya train use dusre shehar le jaati hai, aur wahan ka postman use sahi ghar tak deliver karta hai.</p>
<p><b>Computer network</b> bilkul isi tarah kaam karta hai. <b>Network</b> do ya zyada devices hain jo aapas mein jude hain taaki data exchange kar sakein. Data chhote tukdon mein kata jaata hai, har tukda ek "envelope" mein lipta hota hai jis par source address aur destination address hota hai, aur raaste ke devices (switches aur routers, jinse aap chapter 3 mein miloge) sirf address padh kar tukde ko aage badhate hain jab tak woh sahi device tak na pahunch jaaye.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Postal system aur network ki tulna">
<text x="320" y="20" text-anchor="middle" class="svg-accent" font-size="13">Postal system</text>
<rect x="10" y="30" width="110" height="40" rx="8" fill="#fde68a"/><text x="65" y="55" text-anchor="middle" class="svg-ink" font-size="13">Aapka ghar</text>
<rect x="150" y="30" width="120" height="40" rx="8" fill="#fed7aa"/><text x="210" y="55" text-anchor="middle" class="svg-ink" font-size="13">Local post office</text>
<rect x="300" y="30" width="140" height="40" rx="8" fill="#e2e8f0"/><text x="370" y="55" text-anchor="middle" class="svg-ink" font-size="13">Sorting centres</text>
<rect x="470" y="30" width="160" height="40" rx="8" fill="#fde68a"/><text x="550" y="55" text-anchor="middle" class="svg-ink" font-size="13">Dost ka ghar</text>
<line x1="120" y1="50" x2="150" y2="50" stroke="#64748b" stroke-width="2"/><line x1="270" y1="50" x2="300" y2="50" stroke="#64748b" stroke-width="2"/><line x1="440" y1="50" x2="470" y2="50" stroke="#64748b" stroke-width="2"/>
<text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="13">Computer network</text>
<rect x="10" y="130" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="65" y="155" text-anchor="middle" class="svg-ink" font-size="13">Aapka laptop</text>
<rect x="150" y="130" width="120" height="40" rx="8" fill="#bae6fd"/><text x="210" y="155" text-anchor="middle" class="svg-ink" font-size="13">Switch / router</text>
<rect x="300" y="130" width="140" height="40" rx="8" fill="#ddd6fe"/><text x="370" y="155" text-anchor="middle" class="svg-ink" font-size="13">ISP routers</text>
<rect x="470" y="130" width="160" height="40" rx="8" fill="#bbf7d0"/><text x="550" y="155" text-anchor="middle" class="svg-ink" font-size="13">Web server</text>
<line x1="120" y1="150" x2="150" y2="150" stroke="#64748b" stroke-width="2"/><line x1="270" y1="150" x2="300" y2="150" stroke="#64748b" stroke-width="2"/><line x1="440" y1="150" x2="470" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="320" y="198" text-anchor="middle" class="svg-muted" font-size="12">Har hop sirf address padhta hai aur envelope aage bhej deta hai</text>
</svg><p class="cap">Ek hi idea do baar: addresses wala envelope, ek sorting point se agle sorting point tak.</p></div>

<h3>Networks kyun bante hain</h3>
<p>Networks se pehle, agar colleague ko file deni hoti to aap use disk mein copy karke khud le jaate the. Networks isliye hain taaki devices cheezein <b>share</b> kar sakein:</p>
<ul>
<li><b>Information</b>: email, chat, web pages, video calls, files.</li>
<li><b>Resources</b>: ek printer, ek internet connection ya ek storage server jise pachaas log use karein.</li>
<li><b>Applications</b>: aapke phone par bank ka app sainkdon kilometre door bank ke servers se baat karta hai.</li>
</ul>
<p>Har UPI payment, har stream kiya video, har online exam aur har hospital record network par hi chalta hai. Isiliye har industry mein network engineers ki zaroorat hai.</p>

<h3>LAN, WAN aur internet</h3>
<dl class="terms">
<dt>LAN (Local Area Network)</dt><dd>Ek building ya site ke andar ka network, jaise aapka ghar, college lab ya office ka ek floor. Yeh fast hota hai, aapka apna hota hai, aur aam taur par switches, cables aur Wi-Fi se banta hai.</dd>
<dt>WAN (Wide Area Network)</dt><dd>Aisa network jo lambi doori par LANs ko jodta hai, jaise Mumbai ka head office Pune aur Delhi ki branches se juda ho. Lambi doori wale links aam taur par service provider se kiraye par liye jaate hain.</dd>
<dt>Internet</dt><dd>Sabse bada WAN: ek "network of networks" jismein laakhon independent networks (ghar, companies, universities, cloud providers, ISPs) same rules use karke traffic exchange karne par sehmat hain.</dd>
</dl>
<p>Aap <b>WLAN</b> (wireless LAN, yaani Wi-Fi), <b>MAN</b> (metropolitan area network, ek shehar) aur <b>PAN</b> (personal area network, jaise Bluetooth earbuds aur aapka phone) bhi sunoge. Idea same hai; sirf size badalta hai.</p>

<div class="eg"><p><b>Worked example.</b> Priya ek company ki Pune branch mein kaam karti hai. Uska laptop Wi-Fi se office LAN join karta hai. Jab woh payroll app kholti hai, uski request office LAN cross karti hai, phir company ke WAN link se Mumbai data center jaati hai, jahan payroll server hai. Lunch mein jab woh news site kholti hai, to uski request internet connection se office ke bahar jaati hai. Ek laptop, dus minute mein teen tarah ke network.</p></div>

<h3>Yeh academy kaise kaam karti hai</h3>
<p>Is academy ka har module same paanch-step rhythm follow karta hai. Isi order mein use karo, sirf padhne se kahin tez seekhoge:</p>
<ol>
<li><b>Lesson</b>: yeh chapters jo aap abhi padh rahe ho. Ek baar mein ek chapter padho; har chapter key takeaways ke saath khatam hota hai.</li>
<li><b>Labs</b>: browser-based simulator mein hands-on practice. Aap simulated PCs, switches aur routers par real commands type karte ho, aur har task live check hota hai. (Yeh pehla module concepts ke baare mein hai, isliye iski practice chapter 10 mein aapke apne PC par hoti hai; simulator chapter 11 mein introduce hota hai aur aap use agle module se use karna shuru karte ho.)</li>
<li><b>Quiz</b>: chhote questions jo check karte hain ki aapne sach mein samjha, har answer ke explanation ke saath.</li>
<li><b>Scenarios</b>: real device output wale realistic support tickets. Aap output padh kar cause chunte ho, bilkul job ki tarah.</li>
<li><b>Interview</b>: is topic par interviewers jo questions sach mein poochte hain, model answers aur tips ke saath.</li>
</ol>

<div class="tip"><p><b>Study tip.</b> Ek notebook rakho (paper ya digital). Har chapter ke baad key takeaways apne shabdon mein likho aur diagram yaad se draw karo. Network ko yaad se draw karna samajh ka sabse accha test hai, aur interviewers whiteboard par exactly yahi karwate hain.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> "Internet" aur "web" ko ek hi cheez samajhna. Internet networks ka global network hai (sadkein). Web uske upar chalne wali ek service hai (jaise ek tarah ki delivery). Email, video calls, online games aur UPI sab internet use karte hain bina "web" hue.</p></div>

<div class="exam"><p><b>Exam trap.</b> Naam size se tay hota hai, technology se nahi. Ek office mein Wi-Fi network bhi LAN hi hai (WLAN). Do shehron ke beech private link WAN hai, chahe woh Ethernet use kare. Questions aksar network describe karke use classify karne ko kehte hain: geography dekho.</p></div>

<div class="scn"><h4>Woh printer jise koi use nahi kar paata tha</h4><p>Ek chhote accounts office mein paanch PCs the aur ek printer USB cable se manager ke PC se juda tha. Jab bhi manager ghar jaata aur apna PC band karta, koi print nahi kar paata, aur staff pen drives mein files le kar uski desk tak jaata. Ek technician ne ek chhota switch lagaya, har PC aur ek network-capable printer ko cables se usse joda, aur har device ko ek address diya. Ab sab log seedhe LAN par print karte the, aur shared folders ne pen drives ki jagah le li.</p><p><b>Seekh:</b> network ka poora point hi sharing hai. Jab log data haath se idhar-udhar le jaate dikhen, samjho ek network problem solve hone ka intezaar kar rahi hai.</p></div>

<div class="iv"><p class="q">"Simple shabdon mein, computer network kya hai, aur LAN aur WAN mein kya farak hai?"</p><p>Strong answer: network do ya zyada devices hain jo jude hain taaki data aur resources share kar sakein. LAN chhota area cover karta hai jaise ek building, organisation ka apna hota hai aur fast hota hai. WAN shehron ya deshon ke paar LANs ko jodta hai, aam taur par service provider se kiraye par liye links par. Internet sabse bada WAN hai, network of networks. Ek real example do, jaise branch office ka LAN WAN link se head office se juda hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Network do ya zyada devices hain jo data aur resources share karne ke liye jude hain.</li>
<li>Data letters ki tarah chalta hai: source aur destination address wale envelopes mein chhote tukde.</li>
<li>LAN = ek site; WAN = doori par sites ko jodta hai; internet = network of networks.</li>
<li>Internet sadkein hai; web unhe use karne wali sirf ek service hai.</li>
<li>Har module order mein padho: lesson, labs, quiz, scenarios, interview.</li>
</ul></div>
`}};export{e as default};