var e={id:`limitations-cgnat-ipv6`,h:{en:`What NAT breaks, carrier-grade NAT and the IPv6 view`,hi:`NAT kya todta hai, carrier-grade NAT aur IPv6 ka nazariya`},body:{en:`
<p>A shared office address is convenient, but it has costs. A courier cannot deliver to you unless the reception already expects the parcel. A letter that mentions your desk extension inside the text confuses the outside world. And if someone complains about "a person at Sunrise Towers", finding who it was needs the visitor register. NAT has exactly these costs. It saved IPv4, but it is a workaround, and a good engineer knows where it hurts and what replaces it.</p>

<h3>1. It breaks end-to-end connectivity</h3>
<p>The original internet design assumed every host had a unique address that any other host could reach. Behind PAT, an inside host can start connections outward, but nobody outside can start a connection inward unless you add a static mapping or port forward. That hurts:</p>
<ul>
<li><b>Servers</b> hosted inside: each needs static NAT or a port forward (chapter 4).</li>
<li><b>Peer-to-peer</b> applications, gaming and some video calling, which need clever workarounds (hole punching, relay servers, keepalives to hold a UDP mapping open before the 300-second timer expires).</li>
</ul>

<h3>2. Some protocols carry addresses inside the payload</h3>
<p>NAT rewrites the IP and TCP/UDP headers. If an application also writes an IP address or port <b>inside its data</b>, the header and payload no longer agree.</p>
<ul>
<li><b>Active FTP</b> sends a PORT command containing the client's private address. <b>SIP</b> and <b>H.323</b> voice signalling carry addresses and media ports in the message body. Cisco IOS includes <b>ALGs</b> (application layer gateways) that inspect and fix these payloads for common protocols, but ALGs can also cause trouble; disabling SIP ALG is a well-known voice troubleshooting step.</li>
<li><b>IPsec AH</b> authenticates the IP header, so any NAT change makes the check fail: AH and NAT do not mix. <b>IPsec ESP</b> encrypts the TCP/UDP header, so PAT has no port to translate. The standard fix is <b>NAT Traversal (NAT-T)</b>: peers detect NAT and wrap ESP in <b>UDP port 4500</b>, which PAT can handle.</li>
</ul>

<h3>3. Logging and traceability</h3>
<p>With PAT, thousands of users share one address. An external log line "203.0.113.18 attacked us" is useless on its own. To identify the user you need the <b>inside global address, port and exact time</b>, matched against NAT logs, then DHCP logs. On IOS you can send a syslog message for every translation created and deleted with <code>ip nat log translations syslog</code>. Many regulators require service providers to keep such records. Accurate time on the router, from NTP (the next module), is essential or the logs cannot be correlated.</p>

<h3>4. State and performance</h3>
<p>NAT is <b>stateful</b>: the router must store every flow, look it up for every packet and rewrite checksums. Large tables need memory, and if the NAT router fails, its table is lost and every session breaks unless the design uses stateful NAT redundancy.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="NAT444 with carrier-grade NAT">
<rect x="10" y="80" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="70" y="102" text-anchor="middle" class="svg-ink" font-size="13">Laptop</text><text x="70" y="120" text-anchor="middle" class="svg-muted" font-size="12">192.168.1.23</text>
<rect x="170" y="80" width="130" height="50" rx="8" fill="#bae6fd"/><text x="235" y="102" text-anchor="middle" class="svg-ink" font-size="13">Home router</text><text x="235" y="120" text-anchor="middle" class="svg-muted" font-size="12">NAT #1</text>
<rect x="340" y="80" width="130" height="50" rx="8" fill="#fde68a"/><text x="405" y="102" text-anchor="middle" class="svg-ink" font-size="13">ISP CGNAT</text><text x="405" y="120" text-anchor="middle" class="svg-muted" font-size="12">NAT #2</text>
<rect x="510" y="80" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="570" y="102" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="570" y="120" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.80</text>
<line x1="130" y1="105" x2="170" y2="105" stroke="#64748b" stroke-width="2"/><line x1="300" y1="105" x2="340" y2="105" stroke="#64748b" stroke-width="2"/><line x1="470" y1="105" x2="510" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="150" y="60" text-anchor="middle" class="svg-muted" font-size="12">private</text>
<text x="320" y="60" text-anchor="middle" class="svg-accent" font-size="12">100.64.12.7</text>
<text x="490" y="60" text-anchor="middle" class="svg-accent" font-size="12">203.0.113.40</text>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="12">NAT444: private → shared (100.64.0.0/10) → public</text>
</svg><p class="cap">With CGNAT the customer's router gets a shared-space address, and the ISP translates again.</p></div>

<h3>Carrier-grade NAT (CGNAT)</h3>
<p>Mobile operators and many broadband ISPs do not have enough IPv4 addresses for every customer. They run <b>carrier-grade NAT</b>: very large PAT devices in the ISP network. The customer's router receives an address from <b>100.64.0.0/10</b>, the <b>shared address space</b> defined in RFC 6598 for exactly this purpose. It is not RFC 1918, so it never clashes with the customer's own 192.168.x.x or 10.x.x.x, and it is not routed on the internet. Traffic is translated twice: private to shared at home, shared to public at the ISP. This is often called <b>NAT444</b>. Side effects: customers cannot port-forward (they do not control the ISP's NAT), some games and cameras struggle, and one public address may be shared by many customers. The dynamic NAT lab's 100.64.50.x addresses come from this shared space, mimicking an operator-assigned block.</p>

<h3>The IPv6 perspective</h3>
<p>IPv6 has 128-bit addresses: enough for every device to have its own <b>global unicast address</b> (ccna-ipv6 module). So IPv6 was designed <b>without NAT</b>. End-to-end reachability returns, and security comes from a <b>stateful firewall</b> that allows outbound sessions and their replies and blocks unsolicited inbound traffic, which is the protection people wrongly credit to NAT. Translation still exists in IPv6 for specific jobs:</p>
<ul>
<li><b>NAT64 with DNS64</b>: lets IPv6-only clients reach IPv4-only servers, commonly using the well-known prefix 64:ff9b::/96. Many mobile networks use it.</li>
<li><b>NPTv6</b> (network prefix translation): a stateless one-to-one swap of the prefix, used in niche multihoming designs. It is not a replacement for PAT.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A customer asks you to port-forward TCP 8443 to a CCTV recorder at home. Her home router's WAN shows 100.64.33.9. Because that is inside 100.64.0.0/10, she is behind CGNAT: forwarding on her router cannot help, since inbound traffic reaches the ISP's public address first. Options: ask the ISP for a public IPv4 address, use IPv6 with a firewall rule, or use the vendor's cloud relay.</p></div>

<div class="warn"><p><b>Common mistake.</b> Planning to "add NAT for security" in an IPv6 design. The security you want is a stateful firewall policy; IPv6 NAT adds complexity and breaks the end-to-end model that IPv6 restores.</p></div>

<div class="exam"><p><b>Exam trap.</b> 100.64.0.0/10 is shared address space for CGNAT (RFC 6598), not a private RFC 1918 range. And IPsec ESP through PAT works with NAT-T on UDP 4500; AH does not survive NAT.</p></div>

<div class="scn"><h4>VoIP phones with one-way audio</h4><p>A small office moved to a cloud phone service. Calls connected, but the caller could not hear the office staff. A packet capture showed the SIP messages from the phones advertised media on private addresses 192.168.10.x, and the router's SIP ALG was only partially rewriting them. The provider's guide recommended turning the ALG off because their system handled NAT itself; with <code>no ip nat service sip udp port 5060</code> on the edge router, two-way audio returned.</p><p><b>Lesson:</b> protocols that embed addresses in their payload are where NAT problems hide; know that ALGs exist and can be tuned.</p></div>

<div class="iv"><p class="q">"What are the disadvantages of NAT, and why doesn't IPv6 need it?"</p><p>Strong answer: NAT breaks end-to-end reachability so inbound connections need static mappings; it breaks or complicates protocols that embed addresses (FTP, SIP) or protect headers (IPsec AH), needing ALGs or NAT-T; it hides users, so tracing needs address, port and time logs; and it adds state and failure impact. IPv6 has enough addresses for global unicast everywhere, so security is handled by stateful firewalls, not NAT. Mention CGNAT with 100.64.0.0/10 and NAT64 as the translation still used for IPv4 coexistence.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT breaks end-to-end reachability; inbound access needs static mappings or port forwards.</li>
<li>Protocols with addresses in the payload need ALGs; IPsec AH fails, ESP needs NAT-T (UDP 4500).</li>
<li>PAT hides users; tracing needs inside global + port + accurate time (NTP) and NAT logs.</li>
<li>CGNAT uses 100.64.0.0/10 shared space and double translation (NAT444).</li>
<li>IPv6 is designed without NAT; security comes from stateful firewalls; NAT64 handles IPv4 coexistence.</li>
</ul></div>
`,hi:`
<p>Shared office address convenient hai, par iski keemat hai. Courier aap tak tab tak deliver nahi kar sakta jab tak reception parcel ki ummeed na kar raha ho. Aisa letter jiske text ke andar aapka desk extension likha ho, bahar ki duniya ko confuse karta hai. Aur agar koi "Sunrise Towers ke kisi insaan" ki shikayat kare, to woh kaun tha yeh dhoondhne ke liye visitor register chahiye. NAT ki bilkul yahi keemat hai. Isne IPv4 bachaya, par yeh ek workaround hai, aur achha engineer jaanta hai ki yeh kahan chubhta hai aur iski jagah kya aata hai.</p>

<h3>1. Yeh end-to-end connectivity todta hai</h3>
<p>Internet ka original design maanta tha ki har host ka unique address hai jise koi bhi doosra host reach kar sakta hai. PAT ke peeche inside host bahar ki taraf connections shuru kar sakta hai, par bahar se koi andar connection shuru nahi kar sakta jab tak aap static mapping ya port forward na jodo. Isse nuksaan hota hai:</p>
<ul>
<li>Andar host kiye gaye <b>servers</b>: har ek ko static NAT ya port forward chahiye (chapter 4).</li>
<li><b>Peer-to-peer</b> applications, gaming aur kuch video calling, jinhe smart workarounds chahiye (hole punching, relay servers, 300-second timer khatam hone se pehle UDP mapping khuli rakhne ke liye keepalives).</li>
</ul>

<h3>2. Kuch protocols payload ke andar addresses le jaate hain</h3>
<p>NAT IP aur TCP/UDP headers rewrite karta hai. Agar application apne <b>data ke andar</b> bhi IP address ya port likhti hai, to header aur payload match nahi karte.</p>
<ul>
<li><b>Active FTP</b> ek PORT command bhejta hai jismein client ka private address hota hai. <b>SIP</b> aur <b>H.323</b> voice signalling message body mein addresses aur media ports le jaate hain. Cisco IOS mein common protocols ke liye <b>ALGs</b> (application layer gateways) hote hain jo yeh payloads inspect aur fix karte hain, par ALGs bhi problem kar sakte hain; SIP ALG band karna voice troubleshooting ka jaana-maana step hai.</li>
<li><b>IPsec AH</b> IP header ko authenticate karta hai, isliye koi bhi NAT badlaav check fail kar deta hai: AH aur NAT saath nahi chalte. <b>IPsec ESP</b> TCP/UDP header encrypt karta hai, isliye PAT ke paas translate karne ko port nahi hota. Standard fix hai <b>NAT Traversal (NAT-T)</b>: peers NAT detect karte hain aur ESP ko <b>UDP port 4500</b> mein wrap karte hain, jise PAT handle kar sakta hai.</li>
</ul>

<h3>3. Logging aur traceability</h3>
<p>PAT ke saath hazaron users ek address share karte hain. Bahar ki log line "203.0.113.18 ne humpar attack kiya" akele bekaar hai. User pehchanne ke liye aapko <b>inside global address, port aur exact time</b> chahiye, jise NAT logs se, phir DHCP logs se match karna hota hai. IOS par aap har bane aur hate translation ka syslog message <code>ip nat log translations syslog</code> se bhej sakte ho. Kai regulators service providers se aise records rakhne ko kehte hain. Router par NTP (agla module) se sahi time zaroori hai, warna logs correlate nahi ho sakte.</p>

<h3>4. State aur performance</h3>
<p>NAT <b>stateful</b> hai: router ko har flow store karna, har packet ke liye dhoondhna aur checksums rewrite karne padte hain. Badi tables ko memory chahiye, aur agar NAT router fail ho to uski table kho jaati hai aur har session toot jaata hai, jab tak design stateful NAT redundancy use na kare.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Carrier-grade NAT ke saath NAT444">
<rect x="10" y="80" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="70" y="102" text-anchor="middle" class="svg-ink" font-size="13">Laptop</text><text x="70" y="120" text-anchor="middle" class="svg-muted" font-size="12">192.168.1.23</text>
<rect x="170" y="80" width="130" height="50" rx="8" fill="#bae6fd"/><text x="235" y="102" text-anchor="middle" class="svg-ink" font-size="13">Home router</text><text x="235" y="120" text-anchor="middle" class="svg-muted" font-size="12">NAT #1</text>
<rect x="340" y="80" width="130" height="50" rx="8" fill="#fde68a"/><text x="405" y="102" text-anchor="middle" class="svg-ink" font-size="13">ISP CGNAT</text><text x="405" y="120" text-anchor="middle" class="svg-muted" font-size="12">NAT #2</text>
<rect x="510" y="80" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="570" y="102" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="570" y="120" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.80</text>
<line x1="130" y1="105" x2="170" y2="105" stroke="#64748b" stroke-width="2"/><line x1="300" y1="105" x2="340" y2="105" stroke="#64748b" stroke-width="2"/><line x1="470" y1="105" x2="510" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="150" y="60" text-anchor="middle" class="svg-muted" font-size="12">private</text>
<text x="320" y="60" text-anchor="middle" class="svg-accent" font-size="12">100.64.12.7</text>
<text x="490" y="60" text-anchor="middle" class="svg-accent" font-size="12">203.0.113.40</text>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="12">NAT444: private → shared (100.64.0.0/10) → public</text>
</svg><p class="cap">CGNAT mein customer ke router ko shared-space address milta hai, aur ISP dobara translate karta hai.</p></div>

<h3>Carrier-grade NAT (CGNAT)</h3>
<p>Mobile operators aur kai broadband ISPs ke paas har customer ke liye kaafi IPv4 addresses nahi hain. Woh <b>carrier-grade NAT</b> chalate hain: ISP network mein bahut bade PAT devices. Customer ke router ko <b>100.64.0.0/10</b> se address milta hai, jo RFC 6598 mein bilkul isi kaam ke liye define kiya gaya <b>shared address space</b> hai. Yeh RFC 1918 nahi hai, isliye customer ke apne 192.168.x.x ya 10.x.x.x se kabhi clash nahi karta, aur internet par route nahi hota. Traffic do baar translate hota hai: ghar par private se shared, ISP par shared se public. Ise aksar <b>NAT444</b> kehte hain. Side effects: customers port-forward nahi kar sakte (ISP ka NAT unke control mein nahi), kuch games aur cameras ko dikkat hoti hai, aur ek public address kai customers share kar sakte hain. Dynamic NAT lab ke 100.64.50.x addresses isi shared space se hain, operator-assigned block ki nakal karte hue.</p>

<h3>IPv6 ka nazariya</h3>
<p>IPv6 ke addresses 128-bit hain: itne ki har device ka apna <b>global unicast address</b> ho (ccna-ipv6 module). Isliye IPv6 <b>bina NAT ke</b> design hua. End-to-end reachability wapas aati hai, aur security ek <b>stateful firewall</b> se aati hai jo outbound sessions aur unke replies allow karta hai aur unsolicited inbound traffic block karta hai, yahi woh protection hai jiska credit log galti se NAT ko dete hain. IPv6 mein bhi specific kaamon ke liye translation hota hai:</p>
<ul>
<li><b>NAT64 with DNS64</b>: IPv6-only clients ko IPv4-only servers tak pahunchne deta hai, aam taur par well-known prefix 64:ff9b::/96 use karke. Kai mobile networks ise use karte hain.</li>
<li><b>NPTv6</b> (network prefix translation): prefix ka stateless one-to-one swap, niche multihoming designs mein use hota hai. Yeh PAT ka replacement nahi hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek customer aapse ghar ke CCTV recorder par TCP 8443 port-forward karne ko kehti hai. Uske home router ka WAN 100.64.33.9 dikhata hai. Kyunki yeh 100.64.0.0/10 ke andar hai, woh CGNAT ke peeche hai: uske router par forwarding madad nahi kar sakti, kyunki inbound traffic pehle ISP ke public address par pahunchta hai. Options: ISP se public IPv4 address maango, firewall rule ke saath IPv6 use karo, ya vendor ka cloud relay use karo.</p></div>

<div class="warn"><p><b>Common galti.</b> IPv6 design mein "security ke liye NAT jodne" ka plan. Aapko jo security chahiye woh stateful firewall policy hai; IPv6 NAT complexity badhata hai aur woh end-to-end model todta hai jo IPv6 wapas laata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> 100.64.0.0/10 CGNAT ke liye shared address space hai (RFC 6598), private RFC 1918 range nahi. Aur PAT ke through IPsec ESP UDP 4500 par NAT-T se chalta hai; AH NAT mein survive nahi karta.</p></div>

<div class="scn"><h4>One-way audio wale VoIP phones</h4><p>Ek chhota office cloud phone service par shift hua. Calls connect hoti thin, par caller office staff ko sun nahi paata tha. Packet capture ne dikhaya ki phones ke SIP messages private addresses 192.168.10.x par media advertise kar rahe the, aur router ka SIP ALG unhe sirf aadha rewrite kar raha tha. Provider ki guide ne ALG band karne ko kaha kyunki unka system NAT khud handle karta tha; edge router par <code>no ip nat service sip udp port 5060</code> ke baad two-way audio wapas aa gaya.</p><p><b>Seekh:</b> jo protocols payload mein addresses rakhte hain wahi NAT problems chhupti hain; jaano ki ALGs hote hain aur tune kiye ja sakte hain.</p></div>

<div class="iv"><p class="q">"NAT ke nuksaan kya hain, aur IPv6 ko iski zaroorat kyun nahi?"</p><p>Strong answer: NAT end-to-end reachability todta hai isliye inbound connections ko static mappings chahiye; yeh un protocols ko todta ya mushkil banata hai jo addresses embed karte hain (FTP, SIP) ya headers protect karte hain (IPsec AH), jinke liye ALGs ya NAT-T chahiye; yeh users ko chhupata hai, isliye tracing ke liye address, port aur time logs chahiye; aur yeh state aur failure impact badhata hai. IPv6 mein har jagah global unicast ke liye kaafi addresses hain, isliye security stateful firewalls handle karte hain, NAT nahi. 100.64.0.0/10 wala CGNAT aur IPv4 coexistence ke liye abhi bhi use hone wala NAT64 batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT end-to-end reachability todta hai; inbound access ko static mappings ya port forwards chahiye.</li>
<li>Payload mein addresses wale protocols ko ALGs chahiye; IPsec AH fail hota hai, ESP ko NAT-T (UDP 4500) chahiye.</li>
<li>PAT users chhupata hai; tracing ke liye inside global + port + sahi time (NTP) aur NAT logs chahiye.</li>
<li>CGNAT 100.64.0.0/10 shared space aur double translation (NAT444) use karta hai.</li>
<li>IPv6 bina NAT ke design hua; security stateful firewalls se; NAT64 IPv4 coexistence sambhalta hai.</li>
</ul></div>
`}};export{e as default};