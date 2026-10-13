var e={id:`big-picture`,h:{en:`The big picture: what an IPv4 address really says`,hi:`Big picture: IPv4 address asal mein kya batata hai`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to look at any IPv4 address and mask and, in under a minute and without a calculator, name its network address, broadcast address, usable host range and how many hosts it holds. You will split one address block into department subnets, plan a VLSM design largest-first, write a summary route, recognise every special range the exam loves (RFC 1918 private, APIPA, loopback, classes A to E), configure a router and hosts, verify from Windows, Linux and macOS, and fix the two classic faults: the wrong mask and the wrong default gateway. This maps to CompTIA Network+ N10-009 objective 1.7.</p>
<p><b>Prerequisites.</b> You should know what a router, a switch and a host are, and roughly what happens at layer 3 (see the <i>OSI model, encapsulation, ports and protocols</i> module). Binary was introduced in <i>Networking from absolute zero</i>; we refresh it in chapter 2, so do not worry if it feels rusty. The only maths you need is doubling and subtraction.</p>

<h3>An analogy: PIN code and house number</h3>
<p>Think of how an Indian letter is addressed. The <b>PIN code</b> tells the postal system which delivery area the letter belongs to. The <b>house number</b> tells the local postman which door in that area. The postman in PIN 560001 delivers every letter for 560001 himself. A letter for 400001 is not his job: he hands it to the sorting office, which forwards it towards Mumbai.</p>
<p>An IPv4 address works exactly the same way. It has a <b>network part</b> (the PIN code) and a <b>host part</b> (the house number). A host delivers packets for its own network directly on the local link. Everything for another network is handed to the <b>default gateway</b>, the router, which is the sorting office.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Network part and host part of an address">
<text x="320" y="24" text-anchor="middle" class="svg-ink" font-size="14">192.168.50.62 /26</text>
<rect x="40" y="40" width="390" height="44" rx="8" fill="#bae6fd"/><text x="235" y="67" text-anchor="middle" class="svg-ink" font-size="13">Network part: first 26 bits (the PIN code)</text>
<rect x="440" y="40" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="520" y="67" text-anchor="middle" class="svg-ink" font-size="13">Host part: 6 bits</text>
<text x="235" y="110" text-anchor="middle" class="svg-muted" font-size="12">11000000.10101000.00110010.00</text>
<text x="520" y="110" text-anchor="middle" class="svg-muted" font-size="12">111110</text>
<text x="320" y="148" text-anchor="middle" class="svg-accent" font-size="13">The mask (/26) decides where the line is drawn</text>
</svg><p class="cap">The same 32 bits, split by the mask into "which network" and "which host on it".</p></div>

<h3>What an IPv4 address is made of</h3>
<p>An IPv4 address is a <b>32-bit number</b>. Humans write it as four <b>octets</b> (groups of 8 bits) in decimal, separated by dots: <code>192.168.50.62</code>. Each octet runs from 0 to 255, because 8 bits can hold 256 values. With 32 bits there are about 4.3 billion possible addresses, which sounded huge in 1981 and is far too few today. That shortage is why private addressing, NAT and IPv6 exist; you meet all three in this track.</p>
<p>The address alone is incomplete. It needs a <b>subnet mask</b> (for example <code>255.255.255.192</code>) or its short form, the <b>prefix length</b> (<code>/26</code>). The mask says how many of the 32 bits, counted from the left, are the network part. The rest are the host part.</p>

<h3>The three questions every host must answer</h3>
<ol>
<li><b>Who am I?</b> My IP address, for example 192.168.50.62.</li>
<li><b>Who is local?</b> My mask. With /26 the local network is 192.168.50.0 to 192.168.50.63. Anything in that range I reach directly, using ARP to find its MAC address.</li>
<li><b>Who handles everything else?</b> My default gateway, 192.168.50.1. Any destination outside my range goes to that router.</li>
</ol>
<p>A fourth setting, the DNS server, turns names into addresses; that is covered in the DHCP, DNS and NAT module. Get the first three right and IPv4 connectivity works. Get any one wrong and you have one of the most common tickets in any help desk queue.</p>

<h3>Why we split networks into subnets</h3>
<ul>
<li><b>Smaller broadcast domains.</b> ARP requests and other broadcasts reach every host in the subnet. Two hundred PCs in one flat network all hear each other's chatter.</li>
<li><b>Security and control.</b> A router or firewall sits between subnets, so you can permit HR traffic and block guests. Traffic inside one subnet never crosses that checkpoint.</li>
<li><b>Address efficiency.</b> A point-to-point link needs two addresses, not 254. Right-sizing saves space you will need later.</li>
<li><b>Cleaner routing.</b> Well-planned blocks can be summarised into one route, keeping routing tables small (chapter 9).</li>
</ul>

<div class="eg"><p><b>Worked example: the branch office used in both labs.</b> A branch receives <code>192.168.50.0/24</code>. Router <b>R1</b> has three interfaces: Gi0/0 to Sales, Gi0/1 to HR and Gi0/2 to IT. We will split the /24 into four /26 subnets: Sales 192.168.50.0/26, HR 192.168.50.64/26, IT 192.168.50.128/26, and 192.168.50.192/26 kept for growth. R1 takes the first usable address in each (.1, .65, .129); each PC takes the last usable address (.62, .126, .190). By chapter 6 you will derive every one of those numbers yourself.</p></div>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Branch office lab topology">
<rect x="260" y="16" width="120" height="40" rx="8" fill="#fde68a"/><text x="320" y="41" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<line x1="290" y1="56" x2="100" y2="150" stroke="#64748b"/><line x1="320" y1="56" x2="320" y2="150" stroke="#64748b"/><line x1="350" y1="56" x2="540" y2="150" stroke="#64748b"/>
<text x="170" y="95" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 .1</text><text x="355" y="105" class="svg-muted" font-size="12">Gi0/1 .65</text><text x="470" y="95" text-anchor="middle" class="svg-muted" font-size="12">Gi0/2 .129</text>
<rect x="30" y="150" width="140" height="40" rx="8" fill="#bae6fd"/><text x="100" y="175" text-anchor="middle" class="svg-ink" font-size="13">PC-SALES .62</text>
<rect x="250" y="150" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">PC-HR .126</text>
<rect x="470" y="150" width="140" height="40" rx="8" fill="#ddd6fe"/><text x="540" y="175" text-anchor="middle" class="svg-ink" font-size="13">PC-IT .190</text>
<text x="100" y="208" text-anchor="middle" class="svg-muted" font-size="12">192.168.50.0/26</text><text x="320" y="208" text-anchor="middle" class="svg-muted" font-size="12">192.168.50.64/26</text><text x="540" y="208" text-anchor="middle" class="svg-muted" font-size="12">192.168.50.128/26</text>
</svg><p class="cap">One /24, three department subnets, one router acting as every subnet's default gateway.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Treating the address as the whole story. "192.168.50.62" does not tell you who is local; "192.168.50.62/26" does. When you document, ticket or configure, always write the mask or prefix with the address.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions often give an address and ask which network it belongs to. The answer depends entirely on the mask. 192.168.50.100 is in 192.168.50.0/24, in 192.168.50.64/26 and in 192.168.50.96/27 at the same time. Read the prefix before you answer.</p></div>

<div class="scn"><h4>The flat office that could not be secured</h4><p>A 180-person office ran everything, including guest Wi-Fi and CCTV cameras, in one 192.168.1.0/24. An audit asked the team to stop guests reaching the HR file server. There was nothing to put a rule on: guests and HR were in the same subnet, so their traffic never passed through the router. The team re-addressed into separate subnets per function, each with its own gateway on the firewall, and wrote the rule in ten minutes.</p><p><b>Lesson:</b> subnets are the boundaries that security and routing policy attach to. Plan them first.</p></div>

<div class="iv"><p class="q">"What is a subnet mask, and why does a host need one?"</p><p>Strong answer: the mask marks which bits of the address are the network part and which are the host part. The host uses it to decide whether a destination is local, in which case it ARPs for the destination directly, or remote, in which case it sends the frame to its default gateway. A wrong mask breaks that decision. Give a quick example: with /26, 192.168.50.62 treats .10 as local and .100 as remote.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An IPv4 address is 32 bits written as four decimal octets, 0 to 255 each.</li>
<li>The mask or prefix splits it into a network part and a host part; an address without a mask is incomplete.</li>
<li>Every host needs an address, a mask and a default gateway (plus DNS for names).</li>
<li>Subnets shrink broadcast domains, create security boundaries and save addresses.</li>
<li>The labs use 192.168.50.0/24 split into /26s for Sales, HR and IT behind R1.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap kisi bhi IPv4 address aur mask ko dekh kar, ek minute se kam mein aur bina calculator ke, uska network address, broadcast address, usable host range aur usmein kitne hosts aate hain, bata paoge. Aap ek address block ko department subnets mein baantoge, largest-first VLSM design plan karoge, summary route likhoge, exam ki pasandida har special range pehchaanoge (RFC 1918 private, APIPA, loopback, classes A se E), router aur hosts configure karoge, Windows, Linux aur macOS se verify karoge, aur do classic faults theek karoge: galat mask aur galat default gateway. Yeh CompTIA Network+ N10-009 objective 1.7 se map hota hai.</p>
<p><b>Prerequisites.</b> Aapko pata hona chahiye ki router, switch aur host kya hote hain, aur layer 3 par mote taur par kya hota hai (dekho <i>OSI model, encapsulation, ports and protocols</i> module). Binary <i>Networking from absolute zero</i> mein introduce hua tha; chapter 2 mein hum use refresh karenge, isliye agar yeh bhoola hua lage to tension mat lo. Sirf double karna aur minus karna aana chahiye.</p>

<h3>Ek analogy: PIN code aur house number</h3>
<p>Socho ek Indian letter par address kaise likha jaata hai. <b>PIN code</b> postal system ko batata hai ki letter kis delivery area ka hai. <b>House number</b> local postman ko batata hai ki us area mein kaunsa darwaza. PIN 560001 ka postman 560001 ke saare letters khud deliver karta hai. 400001 ka letter uska kaam nahi hai: woh use sorting office ko de deta hai, jo use Mumbai ki taraf forward karta hai.</p>
<p>IPv4 address bilkul aise hi kaam karta hai. Usmein ek <b>network part</b> (PIN code) aur ek <b>host part</b> (house number) hota hai. Host apne network ke packets seedha local link par deliver karta hai. Doosre network ki har cheez <b>default gateway</b>, yaani router ko de di jaati hai, jo sorting office hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Address ka network part aur host part">
<text x="320" y="24" text-anchor="middle" class="svg-ink" font-size="14">192.168.50.62 /26</text>
<rect x="40" y="40" width="390" height="44" rx="8" fill="#bae6fd"/><text x="235" y="67" text-anchor="middle" class="svg-ink" font-size="13">Network part: pehle 26 bits (PIN code)</text>
<rect x="440" y="40" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="520" y="67" text-anchor="middle" class="svg-ink" font-size="13">Host part: 6 bits</text>
<text x="235" y="110" text-anchor="middle" class="svg-muted" font-size="12">11000000.10101000.00110010.00</text>
<text x="520" y="110" text-anchor="middle" class="svg-muted" font-size="12">111110</text>
<text x="320" y="148" text-anchor="middle" class="svg-accent" font-size="13">Mask (/26) tay karta hai ki line kahan khinchegi</text>
</svg><p class="cap">Wahi 32 bits, mask se "kaunsa network" aur "us par kaunsa host" mein bate hue.</p></div>

<h3>IPv4 address kis cheez se bana hai</h3>
<p>IPv4 address ek <b>32-bit number</b> hai. Insaan ise chaar <b>octets</b> (8 bits ke groups) mein decimal mein, dots se alag karke likhte hain: <code>192.168.50.62</code>. Har octet 0 se 255 tak jaata hai, kyunki 8 bits mein 256 values aa sakti hain. 32 bits se lagbhag 4.3 billion addresses bante hain, jo 1981 mein bahut lagte the aur aaj bahut kam hain. Isi kami ki wajah se private addressing, NAT aur IPv6 bane; teeno aap is track mein miloge.</p>
<p>Akela address adhoora hai. Use ek <b>subnet mask</b> (jaise <code>255.255.255.192</code>) ya uska short form, <b>prefix length</b> (<code>/26</code>) chahiye. Mask batata hai ki 32 bits mein se, left se ginte hue, kitne bits network part hain. Baaki host part hain.</p>

<h3>Teen sawaal jinka jawab har host ko dena hota hai</h3>
<ol>
<li><b>Main kaun hoon?</b> Mera IP address, jaise 192.168.50.62.</li>
<li><b>Local kaun hai?</b> Mera mask. /26 ke saath local network 192.168.50.0 se 192.168.50.63 tak hai. Us range mein jo bhi hai use main seedha pahunchta hoon, uska MAC address ARP se nikaal kar.</li>
<li><b>Baaki sab kaun sambhalega?</b> Mera default gateway, 192.168.50.1. Meri range ke bahar ki har destination us router ke paas jaati hai.</li>
</ol>
<p>Chautha setting, DNS server, names ko addresses mein badalta hai; woh DHCP, DNS aur NAT module mein cover hai. Pehle teen sahi karo to IPv4 connectivity chalti hai. Kisi ek ko galat karo to aapke paas kisi bhi help desk queue ka sabse common ticket hai.</p>

<h3>Hum networks ko subnets mein kyun baant-te hain</h3>
<ul>
<li><b>Chhote broadcast domains.</b> ARP requests aur doosre broadcasts subnet ke har host tak pahunchte hain. Ek flat network mein do sau PCs ek doosre ki saari chatter sunte hain.</li>
<li><b>Security aur control.</b> Subnets ke beech router ya firewall baithta hai, to aap HR traffic permit aur guests block kar sakte ho. Ek hi subnet ke andar ka traffic kabhi us checkpoint se nahi guzarta.</li>
<li><b>Address efficiency.</b> Point-to-point link ko do addresses chahiye, 254 nahi. Sahi size rakhne se woh jagah bachti hai jo baad mein chahiye hogi.</li>
<li><b>Saaf routing.</b> Achhe se plan kiye blocks ko ek route mein summarise kiya ja sakta hai, jisse routing tables chhoti rehti hain (chapter 9).</li>
</ul>

<div class="eg"><p><b>Worked example: dono labs mein use hone wala branch office.</b> Ek branch ko <code>192.168.50.0/24</code> milta hai. Router <b>R1</b> ke teen interfaces hain: Gi0/0 Sales ki taraf, Gi0/1 HR ki taraf aur Gi0/2 IT ki taraf. Hum /24 ko chaar /26 subnets mein baantenge: Sales 192.168.50.0/26, HR 192.168.50.64/26, IT 192.168.50.128/26, aur 192.168.50.192/26 growth ke liye rakha. R1 har ek mein pehla usable address leta hai (.1, .65, .129); har PC aakhri usable address leta hai (.62, .126, .190). Chapter 6 tak aap in saare numbers ko khud nikaaloge.</p></div>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Branch office lab topology">
<rect x="260" y="16" width="120" height="40" rx="8" fill="#fde68a"/><text x="320" y="41" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<line x1="290" y1="56" x2="100" y2="150" stroke="#64748b"/><line x1="320" y1="56" x2="320" y2="150" stroke="#64748b"/><line x1="350" y1="56" x2="540" y2="150" stroke="#64748b"/>
<text x="170" y="95" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 .1</text><text x="355" y="105" class="svg-muted" font-size="12">Gi0/1 .65</text><text x="470" y="95" text-anchor="middle" class="svg-muted" font-size="12">Gi0/2 .129</text>
<rect x="30" y="150" width="140" height="40" rx="8" fill="#bae6fd"/><text x="100" y="175" text-anchor="middle" class="svg-ink" font-size="13">PC-SALES .62</text>
<rect x="250" y="150" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">PC-HR .126</text>
<rect x="470" y="150" width="140" height="40" rx="8" fill="#ddd6fe"/><text x="540" y="175" text-anchor="middle" class="svg-ink" font-size="13">PC-IT .190</text>
<text x="100" y="208" text-anchor="middle" class="svg-muted" font-size="12">192.168.50.0/26</text><text x="320" y="208" text-anchor="middle" class="svg-muted" font-size="12">192.168.50.64/26</text><text x="540" y="208" text-anchor="middle" class="svg-muted" font-size="12">192.168.50.128/26</text>
</svg><p class="cap">Ek /24, teen department subnets, ek router jo har subnet ka default gateway hai.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> Address ko hi poori kahani samajh lena. "192.168.50.62" nahi batata ki local kaun hai; "192.168.50.62/26" batata hai. Jab bhi document, ticket ya configure karo, address ke saath mask ya prefix hamesha likho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions aksar ek address dete hain aur poochte hain ki woh kis network ka hai. Jawab poori tarah mask par depend karta hai. 192.168.50.100 ek hi waqt mein 192.168.50.0/24 mein, 192.168.50.64/26 mein aur 192.168.50.96/27 mein hai. Jawab dene se pehle prefix padho.</p></div>

<div class="scn"><h4>Flat office jise secure nahi kiya ja saka</h4><p>Ek 180 logon ka office sab kuch, guest Wi-Fi aur CCTV cameras samet, ek 192.168.1.0/24 mein chalata tha. Audit ne team ko kaha ki guests ko HR file server tak pahunchne se roko. Rule lagane ki koi jagah hi nahi thi: guests aur HR ek hi subnet mein the, to unka traffic kabhi router se guzarta hi nahi tha. Team ne har function ke liye alag subnets mein re-addressing ki, har ek ka apna gateway firewall par, aur rule das minute mein likh diya.</p><p><b>Seekh:</b> subnets woh boundaries hain jin par security aur routing policy lagti hai. Unhe pehle plan karo.</p></div>

<div class="iv"><p class="q">"Subnet mask kya hai, aur host ko iski zaroorat kyun hai?"</p><p>Strong answer: mask batata hai ki address ke kaunse bits network part hain aur kaunse host part. Host iska use yeh tay karne ke liye karta hai ki destination local hai, to woh destination ke liye seedha ARP karta hai, ya remote hai, to woh frame apne default gateway ko bhejta hai. Galat mask yeh decision tod deta hai. Ek quick example do: /26 ke saath 192.168.50.62 .10 ko local aur .100 ko remote maanta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv4 address 32 bits ka hai, chaar decimal octets mein likha jaata hai, har ek 0 se 255.</li>
<li>Mask ya prefix use network part aur host part mein baant-ta hai; bina mask ka address adhoora hai.</li>
<li>Har host ko address, mask aur default gateway chahiye (aur names ke liye DNS).</li>
<li>Subnets broadcast domains chhote karte hain, security boundaries banate hain aur addresses bachate hain.</li>
<li>Labs 192.168.50.0/24 use karti hain, R1 ke peeche Sales, HR aur IT ke liye /26s mein bata hua.</li>
</ul></div>
`}};export{e as default};