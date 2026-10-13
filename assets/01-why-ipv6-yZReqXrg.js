var e={id:`why-ipv6`,h:{en:`Why IPv6 exists: running out of IPv4`,hi:`IPv6 kyun bana: IPv4 khatam hona`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to read, write and shorten any IPv6 address, recognise every address type on sight, explain how a host builds its own address with SLAAC or gets one from DHCPv6, describe how Neighbor Discovery replaces ARP, configure a dual-stack network with IPv6 routes, and explain the three ways IPv4 and IPv6 live together: <b>dual stack</b>, <b>tunnelling</b> and <b>NAT64</b>. This covers CompTIA Network+ N10-009 objective 1.8 (IPv6 addressing, mitigating address exhaustion, compatibility requirements) and the SLAAC and DHCPv6 parts of objective 3.4.</p>
<p><b>Prerequisites.</b> You should be comfortable with IPv4 addressing and subnetting from the previous module: prefix lengths, network and host parts, default gateways and private ranges. You will build on that, not start again. Hexadecimal is taught from zero in the next chapter.</p>

<h3>An analogy: a city that ran out of phone numbers</h3>
<p>Imagine a city where every phone number has eight digits. When the system was designed there were a few thousand phones, so a hundred million numbers felt infinite. Then came mobile phones, office extensions, card machines and smart meters. The numbers ran out. The city tried tricks: one number shared by a whole office behind a switchboard, numbers taken back from people who did not use them. The tricks worked for a while, but every call now had to pass through an operator who translated extensions. The real fix was to <b>move to longer numbers</b>, so that every device could have its own again.</p>
<p>That is the story of IPv4 and IPv6. IPv4 has 32-bit addresses. IPv6 has <b>128-bit</b> addresses. The switchboard trick is <b>NAT</b>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="IPv4 versus IPv6 address size">
<rect x="20" y="20" width="150" height="44" rx="8" fill="#fed7aa"/><text x="95" y="47" text-anchor="middle" class="svg-ink" font-size="14">IPv4: 32 bits</text>
<text x="190" y="47" class="svg-muted" font-size="13">about 4.3 billion addresses (2 to the 32)</text>
<rect x="20" y="90" width="600" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="117" text-anchor="middle" class="svg-ink" font-size="14">IPv6: 128 bits</text>
<text x="20" y="160" class="svg-muted" font-size="13">about 3.4 x 10 to the 38 addresses (2 to the 128)</text>
<text x="20" y="185" class="svg-accent" font-size="13">Four times the bits, but 2 to the 96 times the addresses</text>
</svg><p class="cap">Every extra bit doubles the address space. Adding 96 bits multiplies it by an almost unimaginable number.</p></div>

<h3>How IPv4 ran out</h3>
<p>IPv4 gives about 4.3 billion addresses, and a big part of that is not usable for hosts: private ranges, multicast, loopback, reserved blocks. The world now has more people than IPv4 addresses, and each person carries several connected devices. The global pool held by IANA handed out its last blocks in 2011, and the regional registries that serve each continent ran out over the following years. A new company today cannot simply ask for a large block of public IPv4; it has to buy or lease addresses from someone else, often at a high price per address.</p>

<h3>The stopgaps: NAT and CGNAT</h3>
<p><b>Mitigating address exhaustion</b> is an exam phrase, and it has two answers. The short-term answer was to <b>share</b> addresses:</p>
<ul>
<li><b>Private addressing plus NAT/PAT.</b> A whole office uses 10.x or 192.168.x inside and hides behind one public address. You studied this in the IPv4 module.</li>
<li><b>Carrier-grade NAT (CGNAT).</b> The provider adds a second layer of NAT. Customers get addresses from the shared range <code>100.64.0.0/10</code>, and thousands of homes share a small pool of public addresses.</li>
</ul>
<p>These tricks keep the lights on, but they cost something. Devices behind NAT cannot easily accept incoming connections, so hosting a camera, a game server or a VoIP call needs port forwarding or relay servers. Logs become hard to trace: one public address may be a thousand users. The NAT boxes themselves hold state for every flow and become bottlenecks and single points of failure.</p>
<p>The long-term answer is <b>IPv6</b>: enough addresses that every device can have a globally unique one again, and end-to-end reachability returns (still protected by a firewall, which is a different job from NAT).</p>

<h3>What else IPv6 changes</h3>
<table class="cmp"><tr><th>Area</th><th>IPv4</th><th>IPv6</th></tr>
<tr><td>Address size</td><td>32 bits, dotted decimal</td><td>128 bits, hexadecimal with colons</td></tr>
<tr><td>Header</td><td>Variable length, has a checksum</td><td>Fixed 40 bytes, no header checksum, extension headers chained by Next Header</td></tr>
<tr><td>Time to live</td><td>TTL</td><td>Hop Limit (same job)</td></tr>
<tr><td>Fragmentation</td><td>Routers may fragment</td><td>Only the source fragments; routers send ICMPv6 Packet Too Big. Minimum link MTU 1280 bytes</td></tr>
<tr><td>Broadcast</td><td>Yes</td><td>None: multicast is used instead</td></tr>
<tr><td>Finding MAC addresses</td><td>ARP</td><td>Neighbor Discovery (ICMPv6)</td></tr>
<tr><td>Automatic addressing</td><td>DHCP</td><td>SLAAC, DHCPv6, or both</td></tr>
</table>

<div class="eg"><p><b>Worked example: how big is big?</b> A typical site receives a <code>/48</code> from its provider. That leaves 16 bits for subnets, so the site can build 2 to the 16 = <b>65,536</b> separate LANs, and each LAN (<code>/64</code>) holds 2 to the 64, about <b>18 quintillion</b> addresses. One site now has more addresses than the entire IPv4 Internet, many billions of times over. Nobody subnets to save addresses in IPv6; you subnet for clean design.</p></div>

<h3>Where this module fits</h3>
<p>The IPv4 module taught you addressing and subnetting. This module adds the second protocol and shows how the two live side by side. Routing protocols are covered in depth in the routing module, and DHCP and DNS servers in the services module; here you learn only the IPv6-specific parts you need, and the labs let you dual-stack an office and carry IPv6 across an IPv4-only provider.</p>

<div class="warn"><p><b>Common mistake.</b> Thinking NAT is a security feature and that IPv6 is less safe because it has no NAT. NAT hides addresses as a side effect; a <b>stateful firewall</b> is what blocks unsolicited inbound traffic. An IPv6 network needs the same firewall policy as IPv4, applied to IPv6 as well. Forgetting the IPv6 rules is a real and common hole.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which technology mitigates IPv4 address exhaustion?" can have several right-sounding answers. NAT/PAT and CGNAT <i>slow</i> exhaustion by sharing; IPv6 <i>solves</i> it. Read whether the question asks for a short-term or long-term fix. Also remember that IPv6 has no broadcast address at all.</p></div>

<div class="scn"><h4>The camera that nobody could reach</h4><p>A retail chain moved its branches to a new provider that used CGNAT. Overnight, the head-office team could no longer reach the security cameras in the branches: every branch was now behind a shared public address, and port forwarding on the branch router did nothing because the provider's NAT sat in front of it. The engineer checked the router's WAN address and saw 100.64.23.9, a CGNAT address, which explained it. The short-term fix was a site-to-site VPN. The permanent fix was enabling the provider's IPv6 service: each branch got a /56, the cameras got global IPv6 addresses, and the firewall allowed only head office to reach them.</p><p><b>Lesson:</b> address sharing breaks inbound reachability. IPv6 restores it, and the firewall, not NAT, decides who is allowed in.</p></div>

<div class="iv"><p class="q">"Why do we need IPv6 when NAT works fine?"</p><p>Strong answer: NAT and CGNAT only stretch IPv4; public IPv4 is exhausted and expensive. NAT breaks end-to-end reachability, complicates peer-to-peer, VoIP and logging, and adds stateful devices that can fail. IPv6 gives every device a global address, has a simpler fixed header and no broadcasts. Then add that security still comes from firewalls, and that most networks run both protocols today (dual stack) during the long transition.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv4 has 32-bit addresses (about 4.3 billion); IPv6 has 128-bit addresses (about 3.4 x 10 to the 38).</li>
<li>NAT/PAT and CGNAT (100.64.0.0/10) mitigate exhaustion by sharing addresses; IPv6 solves it.</li>
<li>IPv6 has a fixed 40-byte header, Hop Limit instead of TTL, no router fragmentation and no broadcast.</li>
<li>A single /48 site gets 65,536 /64 subnets; you subnet IPv6 for design, not to save addresses.</li>
<li>Security comes from firewalls, not NAT: IPv6 needs its own firewall rules.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap koi bhi IPv6 address padh, likh aur chhota kar paoge, har address type ko dekhte hi pehchan loge, samjha paoge ki host SLAAC se apna address khud kaise banata hai ya DHCPv6 se kaise leta hai, Neighbor Discovery ARP ki jagah kaise leta hai, IPv6 routes ke saath dual-stack network configure kar paoge, aur woh teen tareeke samjha paoge jinse IPv4 aur IPv6 saath rehte hain: <b>dual stack</b>, <b>tunnelling</b> aur <b>NAT64</b>. Yeh CompTIA Network+ N10-009 ka objective 1.8 (IPv6 addressing, address exhaustion kam karna, compatibility requirements) aur objective 3.4 ke SLAAC aur DHCPv6 wale hisse cover karta hai.</p>
<p><b>Prerequisites.</b> Pichhle module ka IPv4 addressing aur subnetting aapko aana chahiye: prefix lengths, network aur host part, default gateways aur private ranges. Hum usi par build karenge, zero se shuru nahi karenge. Hexadecimal agle chapter mein bilkul shuru se sikhaya jayega.</p>

<h3>Ek analogy: ek shehar jiske phone numbers khatam ho gaye</h3>
<p>Socho ek shehar hai jahan har phone number aath digit ka hai. Jab system bana tha tab kuch hazaar phones the, isliye das crore numbers anant lagte the. Phir mobile phones aaye, office extensions, card machines aur smart meters aaye. Numbers khatam ho gaye. Shehar ne jugaad kiye: ek number poore office ke liye switchboard ke peeche share karo, jo log use nahi karte unse numbers wapas lo. Jugaad kuch time chale, lekin ab har call ko ek operator se guzarna padta tha jo extensions translate karta tha. Asli fix tha <b>lambe numbers par shift hona</b>, taaki har device ka phir se apna number ho.</p>
<p>Yahi kahani IPv4 aur IPv6 ki hai. IPv4 ke addresses 32-bit ke hain. IPv6 ke addresses <b>128-bit</b> ke hain. Switchboard wala jugaad hai <b>NAT</b>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="IPv4 aur IPv6 address size">
<rect x="20" y="20" width="150" height="44" rx="8" fill="#fed7aa"/><text x="95" y="47" text-anchor="middle" class="svg-ink" font-size="14">IPv4: 32 bits</text>
<text x="190" y="47" class="svg-muted" font-size="13">lagbhag 4.3 billion addresses (2 ki power 32)</text>
<rect x="20" y="90" width="600" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="117" text-anchor="middle" class="svg-ink" font-size="14">IPv6: 128 bits</text>
<text x="20" y="160" class="svg-muted" font-size="13">lagbhag 3.4 x 10 ki power 38 addresses (2 ki power 128)</text>
<text x="20" y="185" class="svg-accent" font-size="13">Bits chaar guna, lekin addresses 2 ki power 96 guna</text>
</svg><p class="cap">Har extra bit address space ko double karta hai. 96 bits jodne se woh lagbhag na sochne layak number se multiply ho jata hai.</p></div>

<h3>IPv4 khatam kaise hua</h3>
<p>IPv4 lagbhag 4.3 billion addresses deta hai, aur uska bada hissa hosts ke kaam ka nahi: private ranges, multicast, loopback, reserved blocks. Duniya mein ab IPv4 addresses se zyada log hain, aur har insaan ke paas kai connected devices hain. IANA ke global pool ne 2011 mein apne aakhri blocks de diye, aur har continent ko serve karne wali regional registries agle kuch saalon mein khatam ho gayi. Aaj nayi company seedha public IPv4 ka bada block nahi maang sakti; use kisi aur se addresses khareedne ya lease karne padte hain, aksar har address ki oonchi keemat par.</p>

<h3>Jugaad: NAT aur CGNAT</h3>
<p><b>Mitigating address exhaustion</b> exam ka phrase hai, aur iske do jawab hain. Short-term jawab tha addresses ko <b>share</b> karna:</p>
<ul>
<li><b>Private addressing plus NAT/PAT.</b> Poora office andar 10.x ya 192.168.x use karta hai aur ek public address ke peeche chhup jata hai. Yeh aapne IPv4 module mein padha.</li>
<li><b>Carrier-grade NAT (CGNAT).</b> Provider NAT ki doosri layer jod deta hai. Customers ko shared range <code>100.64.0.0/10</code> se addresses milte hain, aur hazaaron ghar public addresses ka ek chhota pool share karte hain.</li>
</ul>
<p>Yeh jugaad kaam chala dete hain, lekin inki keemat hai. NAT ke peeche ke devices aasani se incoming connections accept nahi kar sakte, isliye camera, game server ya VoIP call host karne ke liye port forwarding ya relay servers chahiye. Logs trace karna mushkil ho jata hai: ek public address hazaar users ho sakta hai. NAT boxes har flow ki state rakhte hain aur bottleneck aur single point of failure ban jaate hain.</p>
<p>Long-term jawab hai <b>IPv6</b>: itne addresses ki har device ko phir se globally unique address mile, aur end-to-end reachability wapas aaye (phir bhi firewall se protected, jo NAT se alag kaam hai).</p>

<h3>IPv6 aur kya badalta hai</h3>
<table class="cmp"><tr><th>Area</th><th>IPv4</th><th>IPv6</th></tr>
<tr><td>Address size</td><td>32 bits, dotted decimal</td><td>128 bits, colons ke saath hexadecimal</td></tr>
<tr><td>Header</td><td>Variable length, checksum hota hai</td><td>Fixed 40 bytes, header checksum nahi, extension headers Next Header se jude hote hain</td></tr>
<tr><td>Time to live</td><td>TTL</td><td>Hop Limit (wahi kaam)</td></tr>
<tr><td>Fragmentation</td><td>Routers fragment kar sakte hain</td><td>Sirf source fragment karta hai; routers ICMPv6 Packet Too Big bhejte hain. Minimum link MTU 1280 bytes</td></tr>
<tr><td>Broadcast</td><td>Haan</td><td>Nahi: iski jagah multicast use hota hai</td></tr>
<tr><td>MAC address dhoondhna</td><td>ARP</td><td>Neighbor Discovery (ICMPv6)</td></tr>
<tr><td>Automatic addressing</td><td>DHCP</td><td>SLAAC, DHCPv6, ya dono</td></tr>
</table>

<div class="eg"><p><b>Worked example: kitna bada hai bada?</b> Ek typical site ko provider se <code>/48</code> milta hai. Isse subnets ke liye 16 bits bachte hain, to site 2 ki power 16 = <b>65,536</b> alag LANs bana sakti hai, aur har LAN (<code>/64</code>) mein 2 ki power 64, lagbhag <b>18 quintillion</b> addresses hote hain. Ek site ke paas ab poore IPv4 Internet se arbon guna zyada addresses hain. IPv6 mein koi addresses bachane ke liye subnet nahi karta; aap clean design ke liye subnet karte ho.</p></div>

<h3>Yeh module kahan fit hota hai</h3>
<p>IPv4 module ne aapko addressing aur subnetting sikhaya. Yeh module doosra protocol jodta hai aur dikhata hai ki dono saath kaise rehte hain. Routing protocols routing module mein detail mein aate hain, aur DHCP aur DNS servers services module mein; yahan aap sirf IPv6 ke woh specific hisse seekhte ho jo zaroori hain, aur labs mein aap ek office ko dual-stack karte ho aur IPv4-only provider ke paar IPv6 le jaate ho.</p>

<div class="warn"><p><b>Common galti.</b> NAT ko security feature samajhna aur sochna ki IPv6 kam safe hai kyunki usme NAT nahi. NAT side effect ke roop mein addresses chhupata hai; bina maange inbound traffic ko <b>stateful firewall</b> block karta hai. IPv6 network ko bhi IPv4 jaisi firewall policy chahiye, IPv6 par bhi lagi hui. IPv6 rules bhool jaana ek asli aur common hole hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsi technology IPv4 address exhaustion kam karti hai?" ke kai sahi lagne wale jawab ho sakte hain. NAT/PAT aur CGNAT sharing se exhaustion ko <i>dheema</i> karte hain; IPv6 use <i>solve</i> karta hai. Padho ki sawaal short-term fix pooch raha hai ya long-term. Yeh bhi yaad rakho ki IPv6 mein broadcast address hota hi nahi.</p></div>

<div class="scn"><h4>Woh camera jis tak koi nahi pahunch saka</h4><p>Ek retail chain ne apni branches ek naye provider par shift ki jo CGNAT use karta tha. Raaton raat head-office team branches ke security cameras tak nahi pahunch pa rahi thi: har branch ab ek shared public address ke peeche thi, aur branch router par port forwarding bekaar thi kyunki provider ka NAT uske aage baitha tha. Engineer ne router ka WAN address check kiya aur 100.64.23.9 dekha, ek CGNAT address, jisse sab samajh aa gaya. Short-term fix site-to-site VPN tha. Permanent fix tha provider ki IPv6 service on karna: har branch ko /56 mila, cameras ko global IPv6 addresses mile, aur firewall ne sirf head office ko unhe access karne diya.</p><p><b>Seekh:</b> address sharing inbound reachability tod deta hai. IPv6 use wapas laata hai, aur andar kaun aa sakta hai yeh firewall decide karta hai, NAT nahi.</p></div>

<div class="iv"><p class="q">"Jab NAT theek chal raha hai to IPv6 ki zaroorat kyun hai?"</p><p>Strong answer: NAT aur CGNAT sirf IPv4 ko kheench rahe hain; public IPv4 khatam aur mehnga hai. NAT end-to-end reachability todta hai, peer-to-peer, VoIP aur logging ko complicated banata hai, aur stateful devices jodta hai jo fail ho sakte hain. IPv6 har device ko global address deta hai, uska header simple aur fixed hai aur broadcasts nahi hote. Phir jodo ki security ab bhi firewalls se aati hai, aur aaj zyada tar networks lambe transition ke dauraan dono protocols chalate hain (dual stack).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv4 ke addresses 32-bit hain (lagbhag 4.3 billion); IPv6 ke 128-bit (lagbhag 3.4 x 10 ki power 38).</li>
<li>NAT/PAT aur CGNAT (100.64.0.0/10) addresses share karke exhaustion kam karte hain; IPv6 use solve karta hai.</li>
<li>IPv6 mein fixed 40-byte header, TTL ki jagah Hop Limit, router fragmentation nahi aur broadcast nahi.</li>
<li>Ek /48 site ko 65,536 /64 subnets milte hain; IPv6 mein subnetting design ke liye hoti hai, addresses bachane ke liye nahi.</li>
<li>Security firewalls se aati hai, NAT se nahi: IPv6 ko apne firewall rules chahiye.</li>
</ul></div>
`}};export{e as default};