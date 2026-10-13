var e={id:`big-picture`,h:{en:`The services every network depends on`,hi:`Woh services jin par har network tika hai`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to build and explain the invisible services that make a network usable: <b>DHCP</b> hands out addresses, <b>SLAAC</b> lets IPv6 hosts address themselves, <b>DNS</b> turns names into addresses, <b>NTP, PTP and NTS</b> keep every clock in step, and <b>NAT/PAT</b> lets a whole office share one public IPv4 address. You will configure a DHCP server, a DNS server and PAT on a router in three hands-on labs, read the verification output like an engineer, and troubleshoot the classic faults. This covers CompTIA Network+ N10-009 objective 3.4 (IPv4 and IPv6 network services) plus the NAT and PAT parts of objective 2.1.</p>
<p><b>Prerequisites.</b> You should already be comfortable with IPv4 addressing and subnet masks (module <i>IPv4 addressing and subnetting</i>), the basics of IPv6 addresses (module <i>IPv6 addressing and coexistence</i>), and how a router uses a default route (module <i>Routing</i>). You should know that TCP and UDP use port numbers. Nothing else is assumed.</p>

<h3>An analogy: checking in at a big hotel</h3>
<p>Imagine arriving at a large hotel. At the <b>reception desk</b> you are given a room number, a map showing where the lift is, and the Wi-Fi password. You did not choose the room; the desk picked a free one and wrote down that it is yours until checkout. That is <b>DHCP</b>: a new device arrives, and a server hands it an IP address, the default gateway (the "lift" out of the local network) and the DNS server, for a limited time called the <b>lease</b>.</p>
<p>Next you want to call your colleague. You do not know her room number, so you ring the <b>operator</b> and ask for "Priya Sharma". The operator looks her up and connects you. That is <b>DNS</b>: people and applications use names like <code>web.nwk.lab</code>, and DNS looks up the number (IP address) behind the name.</p>
<p>Every clock in the hotel shows the same time because they all follow one <b>master clock</b>. That is <b>NTP</b> (and its precise cousin <b>PTP</b>). Without it, wake-up calls, bills and security camera footage would disagree.</p>
<p>Finally, when you call someone outside, the hotel's switchboard sends your call out on the hotel's one public phone number and remembers which room to put the reply through to. That is <b>NAT with PAT</b>: hundreds of private inside addresses share one public address, and the router remembers which inside host each conversation belongs to.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Where the network services sit">
<rect x="10" y="80" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="105" text-anchor="middle" class="svg-ink" font-size="14">New laptop</text><text x="65" y="124" text-anchor="middle" class="svg-muted" font-size="12">no address yet</text>
<rect x="250" y="80" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="14">Router R1</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">gateway + NAT</text>
<rect x="510" y="80" width="120" height="60" rx="8" fill="#fed7aa"/><text x="570" y="105" text-anchor="middle" class="svg-ink" font-size="14">Internet</text><text x="570" y="124" text-anchor="middle" class="svg-muted" font-size="12">public IPv4</text>
<line x1="120" y1="110" x2="250" y2="110" stroke="#64748b" stroke-width="2"/><line x1="390" y1="110" x2="510" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="130" y="10" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="185" y="35" text-anchor="middle" class="svg-ink" font-size="13">1. DHCP: address</text>
<rect x="130" y="175" width="110" height="40" rx="8" fill="#fde68a"/><text x="185" y="200" text-anchor="middle" class="svg-ink" font-size="13">2. DNS: name</text>
<rect x="400" y="10" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="455" y="35" text-anchor="middle" class="svg-ink" font-size="13">3. PAT: share IP</text>
<rect x="400" y="175" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="455" y="200" text-anchor="middle" class="svg-ink" font-size="13">NTP: same time</text>
</svg><p class="cap">A new laptop needs an address (DHCP), a way to find names (DNS) and a way out to the internet (PAT). NTP quietly keeps every clock in step.</p></div>

<h3>Why these services matter</h3>
<p>Without DHCP, every laptop, phone and printer would need a technician to type an address, mask, gateway and DNS server by hand, and one typing mistake causes an address conflict. Without DNS, users would have to remember numbers, and every server move would break every bookmark. Without NAT, the world would have run out of public IPv4 addresses long ago. Without synchronised time, log files cannot be correlated during an incident, certificates look expired, and authentication systems such as Kerberos refuse logins.</p>
<p>These services are also the most common cause of "the network is down" tickets that are not really network faults at all: a full DHCP pool, a wrong DNS record, a missing NAT statement. Learning them well makes you fast at troubleshooting.</p>

<h3>The ports and protocols you must know</h3>
<table class="cmp"><tr><th>Service</th><th>Transport and port</th><th>One-line job</th></tr>
<tr><td>DHCP (IPv4)</td><td>UDP 67 server, UDP 68 client</td><td>Lease addresses and options</td></tr>
<tr><td>DHCPv6</td><td>UDP 547 server, UDP 546 client</td><td>Addresses or options for IPv6</td></tr>
<tr><td>DNS</td><td>UDP 53, TCP 53 (zone transfers, big answers)</td><td>Names to addresses and back</td></tr>
<tr><td>DoT / DoH (DNS over HTTPS)</td><td>TCP 853 / TCP 443</td><td>Encrypted DNS</td></tr>
<tr><td>NTP</td><td>UDP 123</td><td>Clock synchronisation</td></tr>
<tr><td>PTP</td><td>UDP 319 and 320 (or directly over Ethernet)</td><td>Sub-microsecond timing</td></tr>
<tr><td>NTS key exchange</td><td>TCP 4460 (then NTP on UDP 123)</td><td>Authenticated NTP</td></tr>
</table>

<div class="eg"><p><b>Worked example: the three labs in this module.</b> All three use the same small office. PC1 and PC2 sit on LAN <code>192.168.10.0/24</code> behind switch SW1. Router R1 is the gateway at <code>192.168.10.1</code> (Gi0/0). On the other side, Gi0/1 connects to server SRV at <code>10.0.20.10</code> (lab 1 and 2) or to the ISP with the public address <code>203.0.113.2/30</code> (lab 3). In lab 1 you make R1 a DHCP server that excludes .1 to .20. In lab 2 you make R1 a DNS server for <code>web.nwk.lab</code> and <code>files.nwk.lab</code>. In lab 3 you configure PAT so both PCs reach the internet server 8.8.8.8 using the single address 203.0.113.2.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Treating these services as "server stuff" that network engineers can ignore. In real life the router or firewall is very often the DHCP server, the DHCP relay, the DNS forwarder, the NTP source and the NAT device all at once. When they break, the ticket comes to the network team.</p></div>

<div class="exam"><p><b>Exam trap.</b> Know which services use UDP and which use TCP. DHCP and NTP are UDP only. DNS queries are normally UDP 53, but zone transfers and responses too big for UDP use TCP 53. DoT is TCP 853, DoH (DNS over HTTPS) is TCP 443.</p></div>

<div class="scn"><h4>The Monday-morning "internet is down" call</h4><p>An office of 60 people called the help desk: "Nobody can get on the internet." The engineer asked one user to run <code>ipconfig</code>. The laptop showed <code>169.254.23.7</code>, an automatic private (APIPA) address, which means no DHCP server answered. Over the weekend a contractor had replaced the router and not restored its DHCP pool. People who had not rebooted still had valid leases and were fine; everybody who powered on fresh on Monday got nothing. The engineer restored the pool and exclusions, and every laptop picked up an address within a minute.</p><p><b>Lesson:</b> "the internet is down" is often a DHCP, DNS or NAT problem. The first question is always: does the client have a valid address, gateway and DNS server?</p></div>

<div class="iv"><p class="q">"A user says the internet is down. What basic services would you check first, and in what order?"</p><p>Strong answer: first the client's IP configuration (DHCP): a 169.254 address means DHCP failed. Next the gateway: can I ping it? Then name resolution (DNS): does ping by IP work while ping by name fails? Finally the edge (NAT): do translations appear on the router for that host? Mention that each step rules out a layer, and that you check the client before touching the core.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DHCP leases addresses and options; SLAAC lets IPv6 hosts build their own addresses.</li>
<li>DNS resolves names to addresses (and addresses back to names).</li>
<li>NTP, PTP and NTS keep clocks synchronised and trustworthy.</li>
<li>NAT/PAT lets many private hosts share one public IPv4 address.</li>
<li>Memorise the ports: DHCP 67/68, DHCPv6 546/547, DNS 53, DoT 853, DoH 443, NTP 123.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap woh invisible services bana aur samjha paoge jo network ko use karne laayak banati hain: <b>DHCP</b> addresses baantta hai, <b>SLAAC</b> IPv6 hosts ko khud apna address banane deta hai, <b>DNS</b> names ko addresses mein badalta hai, <b>NTP, PTP aur NTS</b> har clock ko ek saath rakhte hain, aur <b>NAT/PAT</b> poore office ko ek public IPv4 address share karne deta hai. Aap teen hands-on labs mein router par DHCP server, DNS server aur PAT configure karoge, verification output engineer ki tarah padhoge, aur classic faults troubleshoot karoge. Yeh CompTIA Network+ N10-009 objective 3.4 (IPv4 aur IPv6 network services) aur objective 2.1 ke NAT aur PAT wale parts cover karta hai.</p>
<p><b>Prerequisites.</b> Aapko IPv4 addressing aur subnet masks (module <i>IPv4 addressing and subnetting</i>), IPv6 addresses ki basics (module <i>IPv6 addressing and coexistence</i>), aur router default route kaise use karta hai (module <i>Routing</i>) mein comfortable hona chahiye. Aapko pata hona chahiye ki TCP aur UDP port numbers use karte hain. Iske alawa kuch assume nahi kiya gaya.</p>

<h3>Ek analogy: bade hotel mein check-in</h3>
<p>Socho aap ek bade hotel pahunche. <b>Reception desk</b> par aapko room number, lift kahan hai uska map, aur Wi-Fi password milta hai. Room aapne nahi chuna; desk ne ek khaali room chuna aur likh liya ki checkout tak woh aapka hai. Yahi <b>DHCP</b> hai: naya device aata hai, aur server use IP address, default gateway (local network se bahar jaane ki "lift") aur DNS server deta hai, ek limited time ke liye jise <b>lease</b> kehte hain.</p>
<p>Ab aap apni colleague ko call karna chahte ho. Aapko uska room number nahi pata, to aap <b>operator</b> ko phone karke "Priya Sharma" maangte ho. Operator use dhoondh kar connect kar deta hai. Yahi <b>DNS</b> hai: log aur applications <code>web.nwk.lab</code> jaise names use karte hain, aur DNS naam ke peeche ka number (IP address) dhoondhta hai.</p>
<p>Hotel ki har ghadi same time dikhati hai kyunki sab ek <b>master clock</b> ko follow karti hain. Yahi <b>NTP</b> hai (aur uska precise cousin <b>PTP</b>). Iske bina wake-up calls, bills aur security camera footage aapas mein match nahi karenge.</p>
<p>Aakhir mein, jab aap bahar kisi ko call karte ho, hotel ka switchboard aapki call hotel ke ek public phone number se bahar bhejta hai aur yaad rakhta hai ki reply kis room mein bhejna hai. Yahi <b>NAT with PAT</b> hai: sainkdon private inside addresses ek public address share karte hain, aur router yaad rakhta hai ki har conversation kis inside host ki hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Network services kahan baithti hain">
<rect x="10" y="80" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="105" text-anchor="middle" class="svg-ink" font-size="14">Naya laptop</text><text x="65" y="124" text-anchor="middle" class="svg-muted" font-size="12">abhi address nahi</text>
<rect x="250" y="80" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="14">Router R1</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">gateway + NAT</text>
<rect x="510" y="80" width="120" height="60" rx="8" fill="#fed7aa"/><text x="570" y="105" text-anchor="middle" class="svg-ink" font-size="14">Internet</text><text x="570" y="124" text-anchor="middle" class="svg-muted" font-size="12">public IPv4</text>
<line x1="120" y1="110" x2="250" y2="110" stroke="#64748b" stroke-width="2"/><line x1="390" y1="110" x2="510" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="130" y="10" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="185" y="35" text-anchor="middle" class="svg-ink" font-size="13">1. DHCP: address</text>
<rect x="130" y="175" width="110" height="40" rx="8" fill="#fde68a"/><text x="185" y="200" text-anchor="middle" class="svg-ink" font-size="13">2. DNS: naam</text>
<rect x="400" y="10" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="455" y="35" text-anchor="middle" class="svg-ink" font-size="13">3. PAT: IP share</text>
<rect x="400" y="175" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="455" y="200" text-anchor="middle" class="svg-ink" font-size="13">NTP: same time</text>
</svg><p class="cap">Naye laptop ko address (DHCP), names dhoondhne ka tareeka (DNS) aur internet tak bahar jaane ka raasta (PAT) chahiye. NTP chupchaap har clock ko ek saath rakhta hai.</p></div>

<h3>Yeh services kyun zaroori hain</h3>
<p>DHCP ke bina har laptop, phone aur printer ke liye technician ko haath se address, mask, gateway aur DNS server type karna padta, aur ek typing mistake se address conflict ho jaata. DNS ke bina users ko numbers yaad rakhne padte, aur har server move har bookmark tod deta. NAT ke bina duniya ke public IPv4 addresses kab ke khatam ho chuke hote. Synchronised time ke bina incident ke dauraan log files correlate nahi ho paati, certificates expired dikhte hain, aur Kerberos jaise authentication systems login mana kar dete hain.</p>
<p>Yahi services "network down hai" wale tickets ki sabse common wajah bhi hain jo asal mein network fault hote hi nahi: full DHCP pool, galat DNS record, missing NAT statement. Inhe achhe se seekhne se aap troubleshooting mein tez ho jaate ho.</p>

<h3>Ports aur protocols jo yaad hone chahiye</h3>
<table class="cmp"><tr><th>Service</th><th>Transport aur port</th><th>Ek line ka kaam</th></tr>
<tr><td>DHCP (IPv4)</td><td>UDP 67 server, UDP 68 client</td><td>Addresses aur options lease karna</td></tr>
<tr><td>DHCPv6</td><td>UDP 547 server, UDP 546 client</td><td>IPv6 ke liye addresses ya options</td></tr>
<tr><td>DNS</td><td>UDP 53, TCP 53 (zone transfers, bade answers)</td><td>Names se addresses aur wapas</td></tr>
<tr><td>DoT / DoH (DNS over HTTPS)</td><td>TCP 853 / TCP 443</td><td>Encrypted DNS</td></tr>
<tr><td>NTP</td><td>UDP 123</td><td>Clock synchronisation</td></tr>
<tr><td>PTP</td><td>UDP 319 aur 320 (ya seedha Ethernet par)</td><td>Sub-microsecond timing</td></tr>
<tr><td>NTS key exchange</td><td>TCP 4460 (phir NTP UDP 123 par)</td><td>Authenticated NTP</td></tr>
</table>

<div class="eg"><p><b>Worked example: is module ke teen labs.</b> Teeno same chhota office use karte hain. PC1 aur PC2 switch SW1 ke peeche LAN <code>192.168.10.0/24</code> par hain. Router R1 <code>192.168.10.1</code> (Gi0/0) par gateway hai. Doosri taraf Gi0/1 server SRV <code>10.0.20.10</code> se (lab 1 aur 2) ya ISP se public address <code>203.0.113.2/30</code> ke saath (lab 3) juda hai. Lab 1 mein aap R1 ko DHCP server banaoge jo .1 se .20 exclude karta hai. Lab 2 mein aap R1 ko <code>web.nwk.lab</code> aur <code>files.nwk.lab</code> ke liye DNS server banaoge. Lab 3 mein aap PAT configure karoge taaki dono PCs single address 203.0.113.2 use karke internet server 8.8.8.8 tak pahunchein.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> In services ko "server wala kaam" samajhna jise network engineers ignore kar sakte hain. Real life mein router ya firewall bahut baar ek saath DHCP server, DHCP relay, DNS forwarder, NTP source aur NAT device hota hai. Jab yeh tootte hain, ticket network team ke paas aata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Pata hona chahiye kaunsi services UDP use karti hain aur kaunsi TCP. DHCP aur NTP sirf UDP hain. DNS queries normally UDP 53 hoti hain, lekin zone transfers aur UDP ke liye bahut bade responses TCP 53 use karte hain. DoT TCP 853 hai, DoH (DNS over HTTPS) TCP 443 hai.</p></div>

<div class="scn"><h4>Monday subah ki "internet down hai" call</h4><p>60 logon ke ek office ne help desk ko call kiya: "Koi bhi internet par nahi ja pa raha." Engineer ne ek user se <code>ipconfig</code> chalwaya. Laptop <code>169.254.23.7</code> dikha raha tha, ek automatic private (APIPA) address, matlab kisi DHCP server ne jawab nahi diya. Weekend mein ek contractor ne router badla tha aur uska DHCP pool restore nahi kiya tha. Jinhone reboot nahi kiya tha unke paas abhi bhi valid leases the aur woh theek the; jisne bhi Monday ko fresh power on kiya use kuch nahi mila. Engineer ne pool aur exclusions restore kiye, aur har laptop ko ek minute mein address mil gaya.</p><p><b>Seekh:</b> "internet down hai" aksar DHCP, DNS ya NAT problem hota hai. Pehla sawaal hamesha yahi hai: kya client ke paas valid address, gateway aur DNS server hai?</p></div>

<div class="iv"><p class="q">"User kehta hai internet down hai. Aap pehle kaunsi basic services check karoge, aur kis order mein?"</p><p>Strong answer: pehle client ki IP configuration (DHCP): 169.254 address matlab DHCP fail hua. Phir gateway: kya main use ping kar sakta hoon? Phir name resolution (DNS): kya IP se ping chalta hai aur naam se fail hota hai? Aakhir mein edge (NAT): kya router par us host ke translations dikh rahe hain? Batao ki har step ek layer ko rule out karta hai, aur aap core ko chhoone se pehle client check karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DHCP addresses aur options lease karta hai; SLAAC IPv6 hosts ko apne addresses khud banane deta hai.</li>
<li>DNS names ko addresses mein resolve karta hai (aur addresses ko wapas names mein).</li>
<li>NTP, PTP aur NTS clocks ko synchronised aur trustworthy rakhte hain.</li>
<li>NAT/PAT bahut saare private hosts ko ek public IPv4 address share karne deta hai.</li>
<li>Ports yaad karo: DHCP 67/68, DHCPv6 546/547, DNS 53, DoT 853, DoH 443, NTP 123.</li>
</ul></div>
`}};export{e as default};