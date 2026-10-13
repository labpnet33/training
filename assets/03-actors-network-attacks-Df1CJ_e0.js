var e={id:`network-attacks`,h:{en:`Threat actors and network attacks`,hi:`Threat actors aur network attacks`},body:{en:`
<p>A police officer learns the common crimes and the kind of people who commit them, not to commit them, but to recognise them quickly. This chapter does the same for networks. We look at who attacks, and at the network-level attacks you must be able to recognise, name and mitigate. Everything here is described from the defender's side.</p>

<h3>Threat actors: who is behind an attack</h3>
<table class="cmp"><tr><th>Actor</th><th>Motivation</th><th>Typical capability</th></tr>
<tr><td><b>Unskilled attacker</b> ("script kiddie")</td><td>Curiosity, bragging</td><td>Uses ready-made tools without understanding them</td></tr>
<tr><td><b>Hacktivist</b></td><td>Political or social cause</td><td>DDoS against a website, defacement, data leaks</td></tr>
<tr><td><b>Organised crime</b></td><td>Money</td><td>Ransomware, fraud, stolen data sold online; well funded</td></tr>
<tr><td><b>Nation-state</b></td><td>Espionage, disruption</td><td>Highly skilled, patient, may use zero-days (advanced persistent threat)</td></tr>
<tr><td><b>Insider</b></td><td>Revenge, money, or simple mistake</td><td>Already has access and knows where the valuable data is</td></tr></table>
<p>Insiders deserve special attention: many incidents start with an employee who clicks the wrong link or copies data they should not have. Least privilege and logging limit what one insider can do.</p>

<h3>Reconnaissance</h3>
<p><b>Reconnaissance</b> is information gathering before an attack. Passive recon uses public sources: DNS records, job adverts that list your firewall brand, social media. Active recon touches your network: <b>ping sweeps</b> to find live hosts and <b>port scans</b> to find open services. Recon itself does little harm, but it is the early warning sign. Mitigations: expose as few services as possible, filter ICMP and unused ports at the edge with ACLs, and let an IPS detect and alert on scans.</p>

<h3>Denial of service (DoS) and distributed DoS (DDoS)</h3>
<p>A <b>DoS</b> attack targets <b>availability</b>. It exhausts something the service needs: link bandwidth (volumetric floods), a table or protocol state (a <b>TCP SYN flood</b> fills the server's half-open connection table because the handshake is never completed), or CPU (a flood of packets punted to a router's control plane). A <b>DDoS</b> uses thousands of compromised devices, a <b>botnet</b>, often cameras and home routers with default passwords, so there is no single source to block.</p>
<p>Mitigations: rate limiting and Control Plane Policing (CoPP) on routers, SYN protection on firewalls, and for large volumetric attacks, upstream help from the ISP or a cloud <b>scrubbing</b> service, because no link can absorb a flood bigger than itself.</p>

<h3>Spoofing</h3>
<p><b>Spoofing</b> means faking an identity: a source IP address, a MAC address, or a DHCP or ARP answer. It hides the attacker and makes other attacks possible. Mitigations: <b>ingress filtering</b> at the edge (drop packets arriving from the internet with your own or private source addresses; BCP 38), <b>uRPF</b> (unicast Reverse Path Forwarding, drop packets whose source is not reachable through the receiving interface), and on access switches port security, DHCP snooping, DAI and IP Source Guard.</p>

<h3>Reflection and amplification</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Reflection and amplification attack">
<rect x="10" y="80" width="120" height="50" rx="8" fill="#fed7aa"/><text x="70" y="110" text-anchor="middle" class="svg-ink" font-size="13">Attacker bots</text>
<rect x="260" y="20" width="130" height="44" rx="8" fill="#e2e8f0"/><text x="325" y="47" text-anchor="middle" class="svg-ink" font-size="12">Open resolver 1</text>
<rect x="260" y="88" width="130" height="44" rx="8" fill="#e2e8f0"/><text x="325" y="115" text-anchor="middle" class="svg-ink" font-size="12">Open resolver 2</text>
<rect x="260" y="156" width="130" height="44" rx="8" fill="#e2e8f0"/><text x="325" y="183" text-anchor="middle" class="svg-ink" font-size="12">NTP server</text>
<rect x="500" y="80" width="130" height="50" rx="8" fill="#bae6fd"/><text x="565" y="104" text-anchor="middle" class="svg-ink" font-size="13">Victim</text><text x="565" y="122" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.10</text>
<line x1="130" y1="100" x2="260" y2="42" stroke="#64748b" stroke-width="1.5"/><line x1="130" y1="105" x2="260" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="130" y1="110" x2="260" y2="178" stroke="#64748b" stroke-width="1.5"/>
<text x="190" y="150" text-anchor="middle" class="svg-muted" font-size="12">small, src = victim</text>
<line x1="390" y1="42" x2="500" y2="95" stroke="#64748b" stroke-width="5"/><line x1="390" y1="110" x2="500" y2="105" stroke="#64748b" stroke-width="5"/><line x1="390" y1="178" x2="500" y2="115" stroke="#64748b" stroke-width="5"/>
<text x="445" y="160" text-anchor="middle" class="svg-accent" font-size="12">large replies</text>
</svg><p class="cap">Spoofed small requests make innocent servers send large replies to the victim.</p></div>
<p>In a <b>reflection</b> attack the attacker sends requests with the victim's address as the source; the servers reply to the victim, so the traffic seems to come from legitimate servers. <b>Amplification</b> adds leverage: the reply is much larger than the request. Open DNS resolvers and badly configured NTP servers are classic amplifiers, because a request of a few dozen bytes can trigger a reply many times larger. Mitigations: ingress filtering so spoofed packets never leave your network, close open resolvers, disable unneeded UDP services, and rate-limit responses.</p>

<h3>Man-in-the-middle (MITM)</h3>
<p>In a <b>MITM</b> (on-path) attack the attacker places itself between two parties to read or change traffic, breaking confidentiality and integrity. On a LAN the usual methods are <b>ARP poisoning</b> (telling hosts that the gateway's IP lives at the attacker's MAC) and a <b>rogue DHCP server</b> (handing out itself as the default gateway or DNS server). On wireless, an <b>evil twin</b> access point copies a real SSID. Mitigations: DHCP snooping, Dynamic ARP Inspection, 802.1X, WPA3 with protected management frames, and end-to-end encryption such as TLS and IPsec so a man in the middle sees only ciphertext.</p>

<h3>Layer 2 table attacks</h3>
<p><b>MAC flooding</b> fills the switch CAM table with fake MACs so the switch floods frames like a hub; port security limits MACs per port. <b>DHCP starvation</b> requests every address in the pool with fake MACs, often before a rogue server starts; DHCP snooping rate limits and port security stop it. These are configured in the Layer 2 security module.</p>

<div class="eg"><p><b>Worked example.</b> The web server 203.0.113.10 receives 9 Gbps of UDP from source port 53 on a 10 Gbps link, from thousands of different DNS servers, although it never sent a DNS query. Classify: availability attack, DDoS, reflection and amplification via open resolvers. The victim's own ACL cannot help because the link itself is full; the fix is upstream filtering by the ISP or a scrubbing service.</p></div>

<pre class="out">R-EDGE# show interfaces g0/0 | include rate
  5 minute input rate <span class="hl">9412000000 bits/sec</span>, 812344 packets/sec
  5 minute output rate 41200000 bits/sec, 9120 packets/sec</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Trying to stop a volumetric DDoS with an ACL on your own edge router: the packets have already filled the link. (2) Confusing reflection (spoofed source, third-party servers reply) with a direct flood. (3) Thinking MITM only happens on the internet; most MITM attacks you will see are on the local LAN or Wi-Fi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Match attack to CIA: DoS/DDoS = availability; eavesdropping = confidentiality; MITM changing data = integrity. Rogue DHCP handing out a fake gateway enables MITM. Reflection needs spoofing; amplification means the reply is larger than the request.</p></div>

<div class="scn"><h4>Our NTP server attacked someone else</h4><p>An ISP customer in Hyderabad complained that its internet link was saturated every evening. Monitoring showed huge outbound UDP 123 traffic from the company's own old NTP server. The server answered legacy monitoring queries from anyone on the internet, and attackers were using it as an amplifier against third parties with spoofed source addresses. The team restricted NTP with an ACL to internal clients, disabled the legacy query feature, and the ISP added ingress filtering on the customer edge.</p><p><b>Lesson:</b> a badly configured service can make you part of someone else's DDoS. Close what you do not need.</p></div>

<div class="iv"><p class="q">"What is the difference between a DoS and a DDoS attack, and how would you mitigate each?"</p><p>Strong answer: DoS comes from one or a few sources and can often be blocked with an ACL or rate limit near the edge. DDoS comes from a botnet of thousands of sources, often with spoofing or reflection, so blocking sources does not scale; you need rate limiting, CoPP to protect the control plane, SYN protection on the firewall, and for volumetric attacks the ISP or a scrubbing service upstream. Name the CIA leg: availability.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Threat actors: unskilled attackers, hacktivists, organised crime, nation-states and insiders.</li>
<li>Recon (ping sweeps, port scans) is the early warning; limit exposure and let IPS alert.</li>
<li>DoS/DDoS attack availability; big floods need upstream help.</li>
<li>Spoofing fakes addresses; reflection uses third-party servers; amplification makes replies bigger.</li>
<li>MITM (ARP poisoning, rogue DHCP, evil twin) breaks confidentiality and integrity; snooping, DAI and encryption stop it.</li>
</ul></div>
`,hi:`
<p>Police officer common crimes aur unhe karne wale logon ke types seekhta hai, unhe karne ke liye nahi, balki jaldi pehchanne ke liye. Yeh chapter networks ke liye wahi karta hai. Hum dekhenge kaun attack karta hai, aur woh network-level attacks jinhe aapko pehchanna, naam lena aur mitigate karna aana chahiye. Yahan sab kuch defender ki taraf se describe kiya gaya hai.</p>

<h3>Threat actors: attack ke peeche kaun hai</h3>
<table class="cmp"><tr><th>Actor</th><th>Motivation</th><th>Typical capability</th></tr>
<tr><td><b>Unskilled attacker</b> ("script kiddie")</td><td>Curiosity, shekhi</td><td>Ready-made tools bina samjhe use karta hai</td></tr>
<tr><td><b>Hacktivist</b></td><td>Political ya social cause</td><td>Website par DDoS, defacement, data leaks</td></tr>
<tr><td><b>Organised crime</b></td><td>Paisa</td><td>Ransomware, fraud, chori ka data online bechna; achhi funding</td></tr>
<tr><td><b>Nation-state</b></td><td>Espionage, disruption</td><td>Bahut skilled, sabr wale, zero-days use kar sakte hain (advanced persistent threat)</td></tr>
<tr><td><b>Insider</b></td><td>Badla, paisa, ya simple galti</td><td>Pehle se access hai aur pata hai keemti data kahan hai</td></tr></table>
<p>Insiders par khaas dhyan dena chahiye: kai incidents ek aise employee se shuru hote hain jo galat link click karta hai ya aisa data copy karta hai jo use nahi karna chahiye tha. Least privilege aur logging ek insider ka nuksaan seemit karte hain.</p>

<h3>Reconnaissance</h3>
<p><b>Reconnaissance</b> attack se pehle jaankari ikattha karna hai. Passive recon public sources use karta hai: DNS records, job adverts jismein aapke firewall ka brand likha ho, social media. Active recon aapke network ko chhoota hai: live hosts dhoondhne ke liye <b>ping sweeps</b> aur khuli services dhoondhne ke liye <b>port scans</b>. Recon khud zyada nuksaan nahi karta, lekin yeh early warning sign hai. Mitigations: kam se kam services expose karo, edge par ACLs se ICMP aur unused ports filter karo, aur IPS ko scans detect karke alert karne do.</p>

<h3>Denial of service (DoS) aur distributed DoS (DDoS)</h3>
<p><b>DoS</b> attack <b>availability</b> ko target karta hai. Yeh service ki zaroorat ki koi cheez khatam kar deta hai: link bandwidth (volumetric floods), koi table ya protocol state (<b>TCP SYN flood</b> server ki half-open connection table bhar deta hai kyunki handshake kabhi poora nahi hota), ya CPU (router ke control plane tak punt hone wale packets ka flood). <b>DDoS</b> hazaaron compromised devices ka <b>botnet</b> use karta hai, aksar default passwords wale cameras aur home routers, isliye block karne ke liye koi ek source nahi hota.</p>
<p>Mitigations: routers par rate limiting aur Control Plane Policing (CoPP), firewalls par SYN protection, aur bade volumetric attacks ke liye ISP ya cloud <b>scrubbing</b> service ki upstream madad, kyunki koi link apne se bade flood ko jhel nahi sakta.</p>

<h3>Spoofing</h3>
<p><b>Spoofing</b> ka matlab nakli identity: source IP address, MAC address, ya DHCP ya ARP jawab. Yeh attacker ko chhupata hai aur doosre attacks possible banata hai. Mitigations: edge par <b>ingress filtering</b> (internet se aane wale un packets ko drop karo jinka source aapka apna ya private address ho; BCP 38), <b>uRPF</b> (unicast Reverse Path Forwarding, un packets ko drop karo jinka source receiving interface ke through reachable nahi), aur access switches par port security, DHCP snooping, DAI aur IP Source Guard.</p>

<h3>Reflection aur amplification</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Reflection aur amplification attack">
<rect x="10" y="80" width="120" height="50" rx="8" fill="#fed7aa"/><text x="70" y="110" text-anchor="middle" class="svg-ink" font-size="13">Attacker bots</text>
<rect x="260" y="20" width="130" height="44" rx="8" fill="#e2e8f0"/><text x="325" y="47" text-anchor="middle" class="svg-ink" font-size="12">Open resolver 1</text>
<rect x="260" y="88" width="130" height="44" rx="8" fill="#e2e8f0"/><text x="325" y="115" text-anchor="middle" class="svg-ink" font-size="12">Open resolver 2</text>
<rect x="260" y="156" width="130" height="44" rx="8" fill="#e2e8f0"/><text x="325" y="183" text-anchor="middle" class="svg-ink" font-size="12">NTP server</text>
<rect x="500" y="80" width="130" height="50" rx="8" fill="#bae6fd"/><text x="565" y="104" text-anchor="middle" class="svg-ink" font-size="13">Victim</text><text x="565" y="122" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.10</text>
<line x1="130" y1="100" x2="260" y2="42" stroke="#64748b" stroke-width="1.5"/><line x1="130" y1="105" x2="260" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="130" y1="110" x2="260" y2="178" stroke="#64748b" stroke-width="1.5"/>
<text x="190" y="150" text-anchor="middle" class="svg-muted" font-size="12">chhoti, src = victim</text>
<line x1="390" y1="42" x2="500" y2="95" stroke="#64748b" stroke-width="5"/><line x1="390" y1="110" x2="500" y2="105" stroke="#64748b" stroke-width="5"/><line x1="390" y1="178" x2="500" y2="115" stroke="#64748b" stroke-width="5"/>
<text x="445" y="160" text-anchor="middle" class="svg-accent" font-size="12">bade replies</text>
</svg><p class="cap">Spoofed chhoti requests begunah servers se victim ko bade replies bhijwati hain.</p></div>
<p><b>Reflection</b> attack mein attacker victim ka address source rakh kar requests bhejta hai; servers victim ko reply karte hain, isliye traffic legitimate servers se aata hua lagta hai. <b>Amplification</b> leverage jodta hai: reply request se kahin bada hota hai. Open DNS resolvers aur galat configured NTP servers classic amplifiers hain, kyunki kuch darjan bytes ki request kai guna bada reply trigger kar sakti hai. Mitigations: ingress filtering taaki spoofed packets aapke network se bahar hi na jaayein, open resolvers band karo, bina zaroorat ki UDP services disable karo, aur responses rate-limit karo.</p>

<h3>Man-in-the-middle (MITM)</h3>
<p><b>MITM</b> (on-path) attack mein attacker do parties ke beech baith jaata hai taaki traffic padh ya badal sake, jisse confidentiality aur integrity tootti hain. LAN par aam tarike hain <b>ARP poisoning</b> (hosts ko batana ki gateway ka IP attacker ke MAC par hai) aur <b>rogue DHCP server</b> (khud ko default gateway ya DNS server bata dena). Wireless par <b>evil twin</b> access point asli SSID copy karta hai. Mitigations: DHCP snooping, Dynamic ARP Inspection, 802.1X, protected management frames wala WPA3, aur TLS aur IPsec jaisa end-to-end encryption taaki beech wala aadmi sirf ciphertext dekhe.</p>

<h3>Layer 2 table attacks</h3>
<p><b>MAC flooding</b> switch ki CAM table ko nakli MACs se bhar deta hai taaki switch hub ki tarah frames flood kare; port security har port par MACs limit karta hai. <b>DHCP starvation</b> nakli MACs se pool ka har address maang leta hai, aksar rogue server shuru hone se pehle; DHCP snooping rate limits aur port security ise rokte hain. Yeh Layer 2 security module mein configure hote hain.</p>

<div class="eg"><p><b>Worked example.</b> Web server 203.0.113.10 ko 10 Gbps link par source port 53 se 9 Gbps UDP mil raha hai, hazaaron alag DNS servers se, jabki usne kabhi DNS query bheji hi nahi. Classify karo: availability attack, DDoS, open resolvers ke through reflection aur amplification. Victim ki apni ACL madad nahi kar sakti kyunki link hi bhar chuka hai; fix hai ISP ya scrubbing service ki upstream filtering.</p></div>

<pre class="out">R-EDGE# show interfaces g0/0 | include rate
  5 minute input rate <span class="hl">9412000000 bits/sec</span>, 812344 packets/sec
  5 minute output rate 41200000 bits/sec, 9120 packets/sec</pre>

<div class="warn"><p><b>Common galtiyan.</b> (1) Volumetric DDoS ko apne edge router ki ACL se rokne ki koshish: packets pehle hi link bhar chuke hain. (2) Reflection (spoofed source, third-party servers reply karte hain) ko direct flood samajhna. (3) Sochna ki MITM sirf internet par hota hai; aap jo zyada tar MITM attacks dekhoge woh local LAN ya Wi-Fi par hote hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Attack ko CIA se match karo: DoS/DDoS = availability; eavesdropping = confidentiality; data badalne wala MITM = integrity. Nakli gateway dene wala rogue DHCP MITM possible banata hai. Reflection ko spoofing chahiye; amplification ka matlab reply request se bada hai.</p></div>

<div class="scn"><h4>Hamare NTP server ne kisi aur par attack kiya</h4><p>Hyderabad ke ek ISP customer ne shikayat ki ki uska internet link har shaam saturate ho jaata hai. Monitoring ne company ke apne purane NTP server se bahut bada outbound UDP 123 traffic dikhaya. Server internet par kisi ke bhi legacy monitoring queries ka jawab deta tha, aur attackers spoofed source addresses ke saath use third parties ke khilaf amplifier ki tarah use kar rahe the. Team ne ACL se NTP ko internal clients tak restrict kiya, legacy query feature disable kiya, aur ISP ne customer edge par ingress filtering jodi.</p><p><b>Seekh:</b> galat configured service aapko kisi aur ke DDoS ka hissa bana sakti hai. Jo zaroorat nahi, use band karo.</p></div>

<div class="iv"><p class="q">"DoS aur DDoS attack mein kya farak hai, aur har ek ko kaise mitigate karoge?"</p><p>Strong answer: DoS ek ya kuch sources se aata hai aur aksar edge ke paas ACL ya rate limit se block ho sakta hai. DDoS hazaaron sources ke botnet se aata hai, aksar spoofing ya reflection ke saath, isliye sources block karna scale nahi karta; aapko rate limiting, control plane bachane ke liye CoPP, firewall par SYN protection, aur volumetric attacks ke liye upstream ISP ya scrubbing service chahiye. CIA pair ka naam lo: availability.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Threat actors: unskilled attackers, hacktivists, organised crime, nation-states aur insiders.</li>
<li>Recon (ping sweeps, port scans) early warning hai; exposure kam karo aur IPS ko alert karne do.</li>
<li>DoS/DDoS availability par attack karte hain; bade floods ko upstream madad chahiye.</li>
<li>Spoofing addresses nakli banata hai; reflection third-party servers use karta hai; amplification replies bade karta hai.</li>
<li>MITM (ARP poisoning, rogue DHCP, evil twin) confidentiality aur integrity todta hai; snooping, DAI aur encryption ise rokte hain.</li>
</ul></div>
`}};export{e as default};