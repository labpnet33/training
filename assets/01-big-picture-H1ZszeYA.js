var e={id:`big-picture`,h:{en:`The big picture: what an IPv4 address really is`,hi:`Big picture: IPv4 address asal mein kya hai`},body:{en:`
<p><b>What you will learn in this module.</b> Subnetting is the topic beginners fear most, and it is also the topic that pays back the most. By the end of these chapters you will be able to take any IPv4 address and mask and, in under a minute and without a calculator, write down its network address, first and last usable host, broadcast address and host count. You will split a network into equal subnets, build a VLSM plan with no overlaps, summarise routes, configure and verify addresses on routers and on Windows, macOS and Linux clients, and troubleshoot the classic faults: wrong mask, wrong gateway and overlapping subnets. You will learn two methods side by side, the <b>binary method</b> (always correct, great for understanding) and the <b>magic number / block size method</b> (fast, great for the exam), and practise both with drills that include the answers.</p>

<p><b>Prerequisites.</b> From the earlier modules you should know that IP lives at Layer 3 and MAC addresses at Layer 2 (network models), how to enter configuration mode and use <code>show</code> commands (IOS basics), and how to bring an interface up (interfaces and cabling). No maths beyond adding and doubling is needed. If you can count 1, 2, 4, 8, 16, 32, 64, 128, you are ready.</p>

<h3>Start with an analogy: a postal address</h3>
<p>Think of an address like <i>House 130, MG Road, Pune</i>. The postal system does not care about house 130 until the letter reaches MG Road. Sorting offices only read the <b>city and street</b> part; the local postman reads the <b>house number</b>. An IPv4 address works the same way. It has a <b>network part</b> (the street) that routers use to move a packet across the world, and a <b>host part</b> (the house number) that identifies one device on that street.</p>
<p>There is one twist. In a postal address the street name and house number are obviously separate words. In an IPv4 address they are glued together into one number, and a second number, the <b>subnet mask</b>, tells you where the street ends and the house number begins. Without the mask the address is ambiguous. That single idea is the heart of this whole module.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Network and host parts of an address">
<text x="320" y="24" text-anchor="middle" class="svg-ink" font-size="14">192.168.50.130 /26</text>
<rect x="20" y="40" width="150" height="40" rx="6" fill="#bae6fd"/><text x="95" y="65" text-anchor="middle" class="svg-ink" font-size="13">11000000</text>
<rect x="170" y="40" width="150" height="40" rx="6" fill="#bae6fd"/><text x="245" y="65" text-anchor="middle" class="svg-ink" font-size="13">10101000</text>
<rect x="320" y="40" width="150" height="40" rx="6" fill="#bae6fd"/><text x="395" y="65" text-anchor="middle" class="svg-ink" font-size="13">00110010</text>
<rect x="470" y="40" width="38" height="40" rx="6" fill="#bae6fd"/><text x="489" y="65" text-anchor="middle" class="svg-ink" font-size="13">10</text>
<rect x="508" y="40" width="112" height="40" rx="6" fill="#bbf7d0"/><text x="564" y="65" text-anchor="middle" class="svg-ink" font-size="13">000010</text>
<line x1="20" y1="100" x2="508" y2="100" stroke="#64748b" stroke-width="2"/><text x="264" y="120" text-anchor="middle" class="svg-accent" font-size="13">network part: 26 bits (the street)</text>
<line x1="508" y1="100" x2="620" y2="100" stroke="#64748b" stroke-width="2"/><text x="564" y="120" text-anchor="middle" class="svg-accent" font-size="12">host: 6 bits</text>
<text x="95" y="150" text-anchor="middle" class="svg-muted" font-size="12">192</text><text x="245" y="150" text-anchor="middle" class="svg-muted" font-size="12">168</text><text x="395" y="150" text-anchor="middle" class="svg-muted" font-size="12">50</text><text x="545" y="150" text-anchor="middle" class="svg-muted" font-size="12">130</text>
<text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="13">mask 255.255.255.192 = 26 ones, then 6 zeros</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">the mask draws the line; the address alone cannot</text>
</svg><p class="cap">One 32-bit address, split by a /26 mask into a 26-bit network part and a 6-bit host part.</p></div>

<h3>32 bits, four octets, dotted decimal</h3>
<p>An IPv4 address is a <b>32-bit</b> binary number. Humans cannot read 32 ones and zeros comfortably, so we cut it into four groups of 8 bits called <b>octets</b> and write each octet as a decimal number from 0 to 255, separated by dots. This is <b>dotted decimal</b> notation: <code>192.168.50.130</code>. Because there are 32 bits, there are 2<sup>32</sup> = 4,294,967,296 possible addresses, about 4.3 billion. That sounds like a lot until you remember there are more phones than people. The shortage of IPv4 addresses is why private addressing, NAT and IPv6 exist, and you will meet all three in this track.</p>

<h3>Why we split networks into subnets</h3>
<p>A <b>subnet</b> is a range of addresses that share the same network part. All hosts in a subnet are on the same Layer 2 segment (usually one VLAN) and talk to each other directly; to reach any other subnet they send the packet to their <b>default gateway</b>, a router interface in their own subnet. We subnet for four reasons:</p>
<ul>
<li><b>Smaller broadcast domains.</b> ARP and DHCP broadcasts reach every host in a subnet. A /16 with 60,000 hosts would drown in broadcasts; many /24s stay calm.</li>
<li><b>Security and policy.</b> Finance, guests and servers sit in different subnets, and a router or firewall between them can filter traffic.</li>
<li><b>No waste.</b> A point-to-point link needs 2 addresses, not 254.</li>
<li><b>Clean routing.</b> Well-planned subnets can be summarised into a single route, keeping routing tables small.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Take the address 192.168.50.130. With mask 255.255.255.0 (/24) its network is 192.168.50.0 and its neighbours are .1 to .254. With mask 255.255.255.192 (/26) its network is 192.168.50.128 and its neighbours are only .129 to .190. Same address, different mask, different street. A host at .20 is a local neighbour in the first case and a remote host (reached through the gateway) in the second. By chapter 6 you will do this in your head.</p></div>

<h3>How this module is built</h3>
<p>Chapters 2 to 4 give you the tools: binary, the address classes and special ranges, and masks. Chapters 5 to 8 are the core calculation skills with many drills. Chapters 9 and 10 are design: VLSM and summarisation. Chapters 11 and 12 bring it to real devices: configuring and verifying routers and client PCs, then a troubleshooting workflow. In <b>Lab 1</b> you will carve 192.168.50.0/24 for a branch with routers R1 and R2 and PCs PCA, PCB and PCC. In the <b>troubleshooting lab</b> half an office cannot reach a server because of one wrong mask on R1.</p>

<div class="warn"><p><b>Common mistake.</b> Writing or copying an IP address without its mask, for example in a ticket or a firewall rule request. "Please allow 10.20.30.50" can mean one host or a whole network. Always write addresses as <code>10.20.30.50/26</code> or with the dotted mask.</p></div>

<div class="exam"><p><b>Exam trap.</b> The CCNA 200-301 exam gives you no calculator. Blueprint items 1.6 (configure and verify IPv4 addressing and subnetting), 1.7 (describe the need for private IPv4 addressing) and 1.10 (verify IP parameters for client operating systems) are tested with fast calculation questions and simulations. Speed comes from practice, not from memorising tables you do not understand.</p></div>

<div class="scn"><h4>The address without a mask</h4><p>A junior engineer at an office in Pune was asked to set a static address on a new printer: "use 10.20.30.50, gateway 10.20.30.1". He typed the address and left the mask at the printer's default of 255.0.0.0. The printer could print from PCs in the same office, but scanned documents to the file server in another subnet never arrived. The printer thought every 10.x.x.x address was local, so it ARPed for the server directly instead of sending traffic to the gateway. The fix was setting the correct mask, 255.255.255.192.</p><p><b>Lesson:</b> an address is only half the information. Wrong masks create faults that look random, because some destinations work and others do not.</p></div>

<div class="iv"><p class="q">"What is a subnet mask, and why does a host need it?"</p><p>Strong answer: the mask is a 32-bit value of contiguous ones followed by zeros; the ones mark the network part of the address and the zeros the host part. A host ANDs its own address and the destination with the mask: if the network parts match, the destination is local and the host ARPs for it directly; if not, it sends the frame to its default gateway's MAC. Mention that a wrong mask breaks exactly this decision.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An IPv4 address is 32 bits, written as four decimal octets of 0 to 255.</li>
<li>The mask (or prefix length) splits the address into a network part and a host part.</li>
<li>Hosts in the same subnet talk directly; everything else goes through the default gateway.</li>
<li>Subnetting shrinks broadcast domains, enables security policy, avoids waste and allows summarisation.</li>
<li>You will learn the binary method for understanding and the block size method for speed.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Subnetting woh topic hai jisse beginners sabse zyada darte hain, aur yahi woh topic hai jo sabse zyada faayda deta hai. In chapters ke end tak aap kisi bhi IPv4 address aur mask ko lekar, ek minute se kam mein aur bina calculator ke, uska network address, pehla aur aakhri usable host, broadcast address aur host count likh paoge. Aap ek network ko barabar subnets mein baantoge, bina overlap ke VLSM plan banaoge, routes summarise karoge, routers aur Windows, macOS aur Linux clients par addresses configure aur verify karoge, aur classic faults troubleshoot karoge: galat mask, galat gateway aur overlapping subnets. Aap do methods saath saath seekhoge, <b>binary method</b> (hamesha sahi, samajhne ke liye best) aur <b>magic number / block size method</b> (tez, exam ke liye best), aur dono ko drills se practise karoge jinke answers bhi diye gaye hain.</p>

<p><b>Prerequisites.</b> Pichhle modules se aapko pata hona chahiye ki IP Layer 3 par aur MAC addresses Layer 2 par rehte hain (network models), configuration mode mein kaise jaate hain aur <code>show</code> commands kaise use karte hain (IOS basics), aur interface ko up kaise karte hain (interfaces aur cabling). Jodne aur double karne se zyada koi maths nahi chahiye. Agar aap 1, 2, 4, 8, 16, 32, 64, 128 gin sakte ho, to aap ready ho.</p>

<h3>Ek analogy se shuru karo: postal address</h3>
<p>Ek address socho jaise <i>House 130, MG Road, Pune</i>. Postal system ko house 130 se tab tak matlab nahi jab tak letter MG Road tak na pahunche. Sorting offices sirf <b>city aur street</b> wala hissa padhte hain; local postman <b>house number</b> padhta hai. IPv4 address bhi aise hi kaam karta hai. Isme ek <b>network part</b> (street) hota hai jise routers packet ko duniya bhar mein le jaane ke liye use karte hain, aur ek <b>host part</b> (house number) jo us street par ek device ko identify karta hai.</p>
<p>Ek twist hai. Postal address mein street ka naam aur house number saaf alag words hote hain. IPv4 address mein dono ek hi number mein jude hote hain, aur ek doosra number, <b>subnet mask</b>, batata hai ki street kahan khatam hoti hai aur house number kahan shuru hota hai. Mask ke bina address ambiguous hai. Yahi ek idea is poore module ka dil hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Address ke network aur host parts">
<text x="320" y="24" text-anchor="middle" class="svg-ink" font-size="14">192.168.50.130 /26</text>
<rect x="20" y="40" width="150" height="40" rx="6" fill="#bae6fd"/><text x="95" y="65" text-anchor="middle" class="svg-ink" font-size="13">11000000</text>
<rect x="170" y="40" width="150" height="40" rx="6" fill="#bae6fd"/><text x="245" y="65" text-anchor="middle" class="svg-ink" font-size="13">10101000</text>
<rect x="320" y="40" width="150" height="40" rx="6" fill="#bae6fd"/><text x="395" y="65" text-anchor="middle" class="svg-ink" font-size="13">00110010</text>
<rect x="470" y="40" width="38" height="40" rx="6" fill="#bae6fd"/><text x="489" y="65" text-anchor="middle" class="svg-ink" font-size="13">10</text>
<rect x="508" y="40" width="112" height="40" rx="6" fill="#bbf7d0"/><text x="564" y="65" text-anchor="middle" class="svg-ink" font-size="13">000010</text>
<line x1="20" y1="100" x2="508" y2="100" stroke="#64748b" stroke-width="2"/><text x="264" y="120" text-anchor="middle" class="svg-accent" font-size="13">network part: 26 bits (street)</text>
<line x1="508" y1="100" x2="620" y2="100" stroke="#64748b" stroke-width="2"/><text x="564" y="120" text-anchor="middle" class="svg-accent" font-size="12">host: 6 bits</text>
<text x="95" y="150" text-anchor="middle" class="svg-muted" font-size="12">192</text><text x="245" y="150" text-anchor="middle" class="svg-muted" font-size="12">168</text><text x="395" y="150" text-anchor="middle" class="svg-muted" font-size="12">50</text><text x="545" y="150" text-anchor="middle" class="svg-muted" font-size="12">130</text>
<text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="13">mask 255.255.255.192 = 26 ones, phir 6 zeros</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">line mask kheenchta hai; akela address nahi</text>
</svg><p class="cap">Ek 32-bit address, jise /26 mask 26-bit network part aur 6-bit host part mein baantta hai.</p></div>

<h3>32 bits, chaar octets, dotted decimal</h3>
<p>IPv4 address ek <b>32-bit</b> binary number hai. Insaan 32 ones aur zeros aaram se nahi padh sakte, isliye hum ise 8 bits ke chaar groups mein kaatte hain jinhe <b>octets</b> kehte hain, aur har octet ko 0 se 255 tak ke decimal number ki tarah likhte hain, dots se alag karke. Yeh <b>dotted decimal</b> notation hai: <code>192.168.50.130</code>. Kyunki 32 bits hain, 2<sup>32</sup> = 4,294,967,296 possible addresses hain, lagbhag 4.3 billion. Yeh bahut lagta hai jab tak aap yaad na karo ki duniya mein logon se zyada phones hain. IPv4 addresses ki kami hi wajah hai ki private addressing, NAT aur IPv6 exist karte hain, aur aap is track mein teeno se miloge.</p>

<h3>Hum networks ko subnets mein kyun baant te hain</h3>
<p><b>Subnet</b> addresses ki woh range hai jinka network part same hota hai. Ek subnet ke saare hosts same Layer 2 segment (aam taur par ek VLAN) par hote hain aur seedhe ek doosre se baat karte hain; kisi aur subnet tak pahunchne ke liye woh packet apne <b>default gateway</b> ko bhejte hain, jo unke apne subnet mein ek router interface hai. Hum chaar wajahon se subnet karte hain:</p>
<ul>
<li><b>Chhote broadcast domains.</b> ARP aur DHCP broadcasts subnet ke har host tak pahunchte hain. 60,000 hosts wala /16 broadcasts mein doob jaayega; kai /24s shaant rehte hain.</li>
<li><b>Security aur policy.</b> Finance, guests aur servers alag subnets mein baithte hain, aur unke beech ka router ya firewall traffic filter kar sakta hai.</li>
<li><b>Koi waste nahi.</b> Point-to-point link ko 2 addresses chahiye, 254 nahi.</li>
<li><b>Saaf routing.</b> Achhe se plan kiye subnets ko ek single route mein summarise kiya ja sakta hai, jisse routing tables chhoti rehti hain.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Address 192.168.50.130 lo. Mask 255.255.255.0 (/24) ke saath uska network 192.168.50.0 hai aur uske padosi .1 se .254 hain. Mask 255.255.255.192 (/26) ke saath uska network 192.168.50.128 hai aur uske padosi sirf .129 se .190 hain. Same address, alag mask, alag street. .20 wala host pehle case mein local padosi hai aur doosre case mein remote host (gateway ke through pahuncha jaata hai). Chapter 6 tak aap yeh dimaag mein kar loge.</p></div>

<h3>Yeh module kaise bana hai</h3>
<p>Chapters 2 se 4 aapko tools dete hain: binary, address classes aur special ranges, aur masks. Chapters 5 se 8 core calculation skills hain, bahut saari drills ke saath. Chapters 9 aur 10 design hain: VLSM aur summarisation. Chapters 11 aur 12 ise real devices par laate hain: routers aur client PCs configure aur verify karna, phir ek troubleshooting workflow. <b>Lab 1</b> mein aap ek branch ke liye 192.168.50.0/24 ko kaatoge, routers R1 aur R2 aur PCs PCA, PCB aur PCC ke saath. <b>Troubleshooting lab</b> mein aadha office ek server tak nahi pahunch pata kyunki R1 par ek galat mask hai.</p>

<div class="warn"><p><b>Common galti.</b> IP address ko bina mask ke likhna ya copy karna, jaise ticket ya firewall rule request mein. "Please 10.20.30.50 allow karo" ka matlab ek host bhi ho sakta hai aur poora network bhi. Addresses hamesha <code>10.20.30.50/26</code> ki tarah ya dotted mask ke saath likho.</p></div>

<div class="exam"><p><b>Exam trap.</b> CCNA 200-301 exam mein calculator nahi milta. Blueprint items 1.6 (IPv4 addressing aur subnetting configure aur verify karna), 1.7 (private IPv4 addressing ki zaroorat describe karna) aur 1.10 (client operating systems ke IP parameters verify karna) tez calculation questions aur simulations se test hote hain. Speed practice se aati hai, un tables ko ratne se nahi jo aap samajhte nahi.</p></div>

<div class="scn"><h4>Bina mask ka address</h4><p>Pune ke ek office mein ek junior engineer ko naye printer par static address set karne ko kaha gaya: "10.20.30.50 use karo, gateway 10.20.30.1". Usne address type kiya aur mask ko printer ke default 255.0.0.0 par chhod diya. Printer same office ke PCs se print kar pata tha, lekin doosre subnet ke file server par scan kiye documents kabhi nahi pahunche. Printer har 10.x.x.x address ko local samajhta tha, isliye woh traffic gateway ko bhejne ki jagah seedhe server ke liye ARP karta tha. Fix tha sahi mask set karna, 255.255.255.192.</p><p><b>Seekh:</b> address sirf aadhi information hai. Galat masks aise faults banate hain jo random lagte hain, kyunki kuch destinations kaam karte hain aur kuch nahi.</p></div>

<div class="iv"><p class="q">"Subnet mask kya hai, aur host ko iski zaroorat kyun hai?"</p><p>Strong answer: mask ek 32-bit value hai jismein lagataar ones ke baad zeros hote hain; ones address ka network part mark karte hain aur zeros host part. Host apne address aur destination dono ko mask se AND karta hai: agar network parts match karein, destination local hai aur host uske liye seedha ARP karta hai; agar nahi, to woh frame default gateway ke MAC par bhejta hai. Batao ki galat mask bilkul isi decision ko tod deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv4 address 32 bits ka hai, 0 se 255 ke chaar decimal octets mein likha jaata hai.</li>
<li>Mask (ya prefix length) address ko network part aur host part mein baantta hai.</li>
<li>Same subnet ke hosts seedhe baat karte hain; baaki sab default gateway se hokar jaata hai.</li>
<li>Subnetting broadcast domains chhote karta hai, security policy possible banata hai, waste bachata hai aur summarisation allow karta hai.</li>
<li>Aap samajhne ke liye binary method aur speed ke liye block size method seekhoge.</li>
</ul></div>
`}};export{e as default};