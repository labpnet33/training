var e={id:`addresses`,h:{en:`Addresses: MAC, IP and port`,hi:`Addresses: MAC, IP aur port`},body:{en:`
<p>Suppose you send a parcel to "Flat 12, Building 45, MG Road, Pune". Three different pieces of information get it there. The <b>street and building</b> (MG Road, Building 45) let sorting centres across India route it to the right place. The <b>local delivery label</b> the last-mile courier sticks on it tells him which door to knock on today. The <b>flat number</b> (12) says which family inside the building receives it. A network uses exactly three kinds of address for the same three jobs: the <b>IP address</b>, the <b>MAC address</b> and the <b>port number</b>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="MAC, IP and port compared with a postal address">
<rect x="10" y="20" width="200" height="120" rx="10" fill="#fde68a"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="14">MAC address</text><text x="110" y="68" text-anchor="middle" class="svg-muted" font-size="12">local delivery label</text><text x="110" y="92" text-anchor="middle" class="svg-ink" font-size="12">3c52.821a.2b3c</text><text x="110" y="116" text-anchor="middle" class="svg-muted" font-size="12">which NIC on this LAN</text>
<rect x="220" y="20" width="200" height="120" rx="10" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">IP address</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">street + building</text><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.80</text><text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="12">which device, end to end</text>
<rect x="430" y="20" width="200" height="120" rx="10" fill="#bbf7d0"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="14">Port number</text><text x="530" y="68" text-anchor="middle" class="svg-muted" font-size="12">flat number</text><text x="530" y="92" text-anchor="middle" class="svg-ink" font-size="12">443</text><text x="530" y="116" text-anchor="middle" class="svg-muted" font-size="12">which application</text>
<text x="110" y="170" text-anchor="middle" class="svg-accent" font-size="12">Layer 2, 48 bits</text><text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">Layer 3, 32 bits (IPv4)</text><text x="530" y="170" text-anchor="middle" class="svg-accent" font-size="12">Layer 4, 16 bits</text>
</svg><p class="cap">Three addresses, three jobs. You need all three for a web page to load.</p></div>

<h3>MAC address: the hardware address, used on the local link</h3>
<p>Every NIC is given a 48-bit <b>MAC address</b> (media access control) at the factory, written in hex as you practised in chapter 5. Switches use MAC addresses to deliver frames <b>inside one LAN</b>. A MAC address is "flat": it says nothing about where the device is, just as a person's name does not tell you their city. That is why MACs cannot be used to find devices across the internet. When a packet crosses a router, the MAC addresses on it are replaced for the next link, like a new courier label at each depot. You will see this happen in chapter 7.</p>

<h3>IP address: the logical address, used end to end</h3>
<p>An <b>IPv4 address</b> is 32 bits written as four decimal octets, such as <code>192.168.1.23</code>. It is <b>logical</b>: an administrator or a server assigns it, and it changes if the device moves to another network. Every IP address has two parts, like a street and a house number:</p>
<ul>
<li>The <b>network part</b> (the street) identifies which network the device is on. Routers route on this part.</li>
<li>The <b>host part</b> (the house number) identifies the device on that network.</li>
</ul>
<p>The <b>subnet mask</b> tells you where the split is. With <code>192.168.1.23</code> and mask <code>255.255.255.0</code> (/24), the first three octets are the network (192.168.1.0) and the last octet is the host (.23). On this network, .0 is the <b>network address</b>, .255 is the <b>broadcast address</b>, and .1 to .254 can be given to devices. The device also needs a <b>default gateway</b>, the IP address of the router on its own network, for example 192.168.1.1. The subnetting modules later in both tracks go much deeper.</p>

<h3>Public and private addresses</h3>
<p><b>Public</b> addresses are unique on the whole internet and are handed out by regional registries to ISPs and companies. There are only about 4.3 billion IPv4 addresses, which ran out long ago, so three ranges were reserved as <b>private</b> (RFC 1918). Anyone may use them inside their own network, and they are never routed on the internet:</p>
<table class="cmp"><tr><th>Private range</th><th>Short form</th><th>Typical use</th></tr>
<tr><td>10.0.0.0 to 10.255.255.255</td><td>10.0.0.0/8</td><td>Large companies, data centers</td></tr>
<tr><td>172.16.0.0 to 172.31.255.255</td><td>172.16.0.0/12</td><td>Medium networks, some cloud defaults</td></tr>
<tr><td>192.168.0.0 to 192.168.255.255</td><td>192.168.0.0/16</td><td>Homes and small offices</td></tr>
</table>
<p>Devices with private addresses reach the internet through <b>NAT</b> (network address translation) on the router or firewall, which swaps the private source address for a public one. Three special addresses to recognise now: <code>127.0.0.1</code> is <b>loopback</b> (the device itself), <code>169.254.x.x</code> is <b>APIPA/link-local</b> (the device gave itself an address because nobody answered its request) and <code>0.0.0.0</code> means "no address yet" or "any".</p>

<h3>Port numbers: which application</h3>
<p>One server can run a web service, an email service and a remote-login service at the same time. The <b>port number</b> (16 bits, 0 to 65535) in the TCP or UDP header says which application a message belongs to. Ports 0 to 1023 are <b>well-known</b> (reserved for standard services), 1024 to 49151 are <b>registered</b>, and 49152 to 65535 are <b>dynamic/ephemeral</b>, picked at random by clients for their side of a conversation.</p>
<table class="cmp"><tr><th>Service</th><th>Port</th><th>Service</th><th>Port</th></tr>
<tr><td>HTTP (web)</td><td>TCP 80</td><td>HTTPS (secure web)</td><td>TCP 443</td></tr>
<tr><td>DNS</td><td>UDP/TCP 53</td><td>DHCP</td><td>UDP 67 (server), 68 (client)</td></tr>
<tr><td>SSH</td><td>TCP 22</td><td>Telnet</td><td>TCP 23</td></tr>
<tr><td>SMTP (sending mail)</td><td>TCP 25</td><td>RDP (remote desktop)</td><td>TCP 3389</td></tr>
</table>
<p>The combination of IP address, protocol and port is called a <b>socket</b>, for example 203.0.113.80 TCP 443.</p>

<h3>How a device gets its IP address: DHCP</h3>
<p>You can type an address by hand (<b>static</b>), which suits servers, printers and routers. Most PCs and phones instead ask a <b>DHCP</b> server (Dynamic Host Configuration Protocol), usually running on the router. It happens in four messages, remembered as <b>DORA</b>: <b>Discover</b> (client broadcasts "is there a DHCP server?"), <b>Offer</b> (server offers an address), <b>Request</b> (client asks for that address), <b>Acknowledge</b> (server confirms). The client receives an IP address, subnet mask, default gateway, DNS server and a <b>lease</b> time, after which it must renew.</p>
<pre class="out">Ethernet adapter Ethernet:

   Physical Address. . . . . . . . . : <span class="hl">3C-52-82-1A-2B-3C</span>
   DHCP Enabled. . . . . . . . . . . : Yes
   IPv4 Address. . . . . . . . . . . : <span class="hl">192.168.1.23(Preferred)</span>
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Lease Obtained. . . . . . . . . . : Tuesday, 29 September 2026 09:12:44
   Default Gateway . . . . . . . . . : <span class="hl">192.168.1.1</span>
   DHCP Server . . . . . . . . . . . : 192.168.1.1
   DNS Servers . . . . . . . . . . . : 192.168.1.1</pre>
<p>This is part of <code>ipconfig /all</code> on Windows. In one screen you can see all the addresses from this chapter: the MAC (Physical Address), the IP, the mask, the gateway and the DHCP and DNS servers.</p>

<div class="eg"><p><b>Worked example: one conversation, every address.</b> Asha's laptop (MAC 3c52.821a.2b3c, IP 192.168.1.23) opens a secure web page on 203.0.113.80. Her browser picks source port 51514 and destination port 443. Inside her home, the frame goes to the router's MAC. The IP packet says 192.168.1.23 to 203.0.113.80. The segment says port 51514 to port 443. After NAT, the server sees the router's public address 198.51.100.24 as the source instead.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Setting a default gateway that is not in the same network as the PC (for example PC 192.168.1.23/24 with gateway 192.168.2.1). The PC cannot reach its gateway directly, so nothing outside the LAN works.</p></div>

<div class="exam"><p><b>Exam trap.</b> 169.254.x.x means DHCP failed, not "the internet is down". 172.32.0.1 is <b>not</b> private (the private block stops at 172.31.255.255). MAC = Layer 2 and local; IP = Layer 3 and end to end; port = Layer 4 and per application.</p></div>

<div class="scn"><h4>The printer that "moved" every Monday</h4><p>An office printer was on DHCP. Every Monday after the weekend it sometimes got a different address, and staff PCs, configured with the old address, could not print. The engineer created a DHCP <b>reservation</b> tying the printer's MAC address to 192.168.10.50, so it always received the same IP. The Monday complaints stopped.</p><p><b>Lesson:</b> devices that others must find (printers, servers, cameras) need a fixed address: static, or a DHCP reservation based on the MAC.</p></div>

<div class="iv"><p class="q">"What is the difference between a MAC address and an IP address? Why do we need both?"</p><p>Strong answer: the MAC is a 48-bit hardware address used by switches to deliver frames on the local link; it is flat and does not say where the device is. The IP address is a 32-bit (IPv4) logical address with a network and a host part, used by routers to deliver packets end to end across networks. We need both because the IP stays the same from source to destination while the MAC changes at every router hop; ARP links the two on each LAN. Bonus: mention ports as the third address that picks the application.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MAC (48 bits, Layer 2): hardware address, local LAN only, changes at each router hop.</li>
<li>IPv4 (32 bits, Layer 3): logical, end to end; network part + host part split by the subnet mask.</li>
<li>Private ranges: 10/8, 172.16/12, 192.168/16; NAT connects them to the internet. 127.0.0.1 loopback; 169.254.x.x = DHCP failed.</li>
<li>Port (16 bits, Layer 4): picks the application; 80, 443, 53, 22, 67/68 are must-knows.</li>
<li>DHCP DORA gives IP, mask, gateway, DNS and a lease; use static or reservations for printers and servers.</li>
</ul></div>
`,hi:`
<p>Maan lo aap ek parcel bhejte ho "Flat 12, Building 45, MG Road, Pune" par. Teen alag information use wahan pahunchati hain. <b>Street aur building</b> (MG Road, Building 45) poore India ke sorting centres ko use sahi jagah route karne dete hain. Last-mile courier jo <b>local delivery label</b> us par chipkata hai, woh use batata hai ki aaj kaunsa darwaza khatkhatana hai. <b>Flat number</b> (12) batata hai ki building ke andar kaunsi family use legi. Network bhi inhi teen kaamon ke liye exactly teen tarah ke address use karta hai: <b>IP address</b>, <b>MAC address</b> aur <b>port number</b>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="MAC, IP aur port ki postal address se tulna">
<rect x="10" y="20" width="200" height="120" rx="10" fill="#fde68a"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="14">MAC address</text><text x="110" y="68" text-anchor="middle" class="svg-muted" font-size="12">local delivery label</text><text x="110" y="92" text-anchor="middle" class="svg-ink" font-size="12">3c52.821a.2b3c</text><text x="110" y="116" text-anchor="middle" class="svg-muted" font-size="12">is LAN par kaunsa NIC</text>
<rect x="220" y="20" width="200" height="120" rx="10" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">IP address</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">street + building</text><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.80</text><text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="12">kaunsa device, end to end</text>
<rect x="430" y="20" width="200" height="120" rx="10" fill="#bbf7d0"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="14">Port number</text><text x="530" y="68" text-anchor="middle" class="svg-muted" font-size="12">flat number</text><text x="530" y="92" text-anchor="middle" class="svg-ink" font-size="12">443</text><text x="530" y="116" text-anchor="middle" class="svg-muted" font-size="12">kaunsi application</text>
<text x="110" y="170" text-anchor="middle" class="svg-accent" font-size="12">Layer 2, 48 bits</text><text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">Layer 3, 32 bits (IPv4)</text><text x="530" y="170" text-anchor="middle" class="svg-accent" font-size="12">Layer 4, 16 bits</text>
</svg><p class="cap">Teen addresses, teen kaam. Web page load hone ke liye teeno chahiye.</p></div>

<h3>MAC address: hardware address, local link par use hota hai</h3>
<p>Har NIC ko factory mein 48-bit ka <b>MAC address</b> (media access control) milta hai, jo hex mein likha jaata hai jaise aapne chapter 5 mein practice kiya. Switches MAC addresses se <b>ek LAN ke andar</b> frames deliver karte hain. MAC address "flat" hota hai: yeh nahi batata ki device kahan hai, jaise kisi insaan ka naam uska shehar nahi batata. Isiliye MACs se internet ke paar devices nahi dhoondhe ja sakte. Jab packet router cross karta hai, us par ke MAC addresses agle link ke liye badal diye jaate hain, jaise har depot par naya courier label. Yeh aap chapter 7 mein hota dekhoge.</p>

<h3>IP address: logical address, end to end use hota hai</h3>
<p><b>IPv4 address</b> 32 bits ka hota hai jo chaar decimal octets mein likha jaata hai, jaise <code>192.168.1.23</code>. Yeh <b>logical</b> hai: administrator ya server ise assign karta hai, aur device dusre network mein jaaye to yeh badal jaata hai. Har IP address ke do hisse hote hain, jaise street aur house number:</p>
<ul>
<li><b>Network part</b> (street) batata hai ki device kaunse network par hai. Routers isi part par route karte hain.</li>
<li><b>Host part</b> (house number) us network par device ko identify karta hai.</li>
</ul>
<p><b>Subnet mask</b> batata hai ki split kahan hai. <code>192.168.1.23</code> aur mask <code>255.255.255.0</code> (/24) ke saath, pehle teen octets network hain (192.168.1.0) aur aakhri octet host hai (.23). Is network par .0 <b>network address</b> hai, .255 <b>broadcast address</b> hai, aur .1 se .254 devices ko diye ja sakte hain. Device ko ek <b>default gateway</b> bhi chahiye, uske apne network par router ka IP address, jaise 192.168.1.1. Dono tracks mein baad ke subnetting modules isme kahin gehraai tak jaate hain.</p>

<h3>Public aur private addresses</h3>
<p><b>Public</b> addresses poore internet par unique hote hain aur regional registries unhe ISPs aur companies ko dete hain. IPv4 addresses sirf lagbhag 4.3 billion hain, jo bahut pehle khatam ho gaye, isliye teen ranges <b>private</b> ke liye reserve ki gayi (RFC 1918). Koi bhi inhe apne network ke andar use kar sakta hai, aur yeh internet par kabhi route nahi hote:</p>
<table class="cmp"><tr><th>Private range</th><th>Short form</th><th>Typical use</th></tr>
<tr><td>10.0.0.0 se 10.255.255.255</td><td>10.0.0.0/8</td><td>Badi companies, data centers</td></tr>
<tr><td>172.16.0.0 se 172.31.255.255</td><td>172.16.0.0/12</td><td>Medium networks, kuch cloud defaults</td></tr>
<tr><td>192.168.0.0 se 192.168.255.255</td><td>192.168.0.0/16</td><td>Ghar aur chhote offices</td></tr>
</table>
<p>Private addresses wale devices router ya firewall par <b>NAT</b> (network address translation) ke through internet tak pahunchte hain, jo private source address ko public se swap karta hai. Abhi teen special addresses pehchaano: <code>127.0.0.1</code> <b>loopback</b> hai (device khud), <code>169.254.x.x</code> <b>APIPA/link-local</b> hai (device ne khud ko address de diya kyunki uski request ka kisi ne jawab nahi diya) aur <code>0.0.0.0</code> ka matlab "abhi koi address nahi" ya "any" hai.</p>

<h3>Port numbers: kaunsi application</h3>
<p>Ek server ek saath web service, email service aur remote-login service chala sakta hai. TCP ya UDP header mein <b>port number</b> (16 bits, 0 se 65535) batata hai ki message kaunsi application ka hai. Ports 0 se 1023 <b>well-known</b> hain (standard services ke liye reserved), 1024 se 49151 <b>registered</b> hain, aur 49152 se 65535 <b>dynamic/ephemeral</b> hain, jinhe clients baatcheet ki apni side ke liye random chunte hain.</p>
<table class="cmp"><tr><th>Service</th><th>Port</th><th>Service</th><th>Port</th></tr>
<tr><td>HTTP (web)</td><td>TCP 80</td><td>HTTPS (secure web)</td><td>TCP 443</td></tr>
<tr><td>DNS</td><td>UDP/TCP 53</td><td>DHCP</td><td>UDP 67 (server), 68 (client)</td></tr>
<tr><td>SSH</td><td>TCP 22</td><td>Telnet</td><td>TCP 23</td></tr>
<tr><td>SMTP (mail bhejna)</td><td>TCP 25</td><td>RDP (remote desktop)</td><td>TCP 3389</td></tr>
</table>
<p>IP address, protocol aur port ke combination ko <b>socket</b> kehte hain, jaise 203.0.113.80 TCP 443.</p>

<h3>Device ko IP address kaise milta hai: DHCP</h3>
<p>Aap address haath se type kar sakte ho (<b>static</b>), jo servers, printers aur routers ke liye theek hai. Zyada tar PCs aur phones iske bajaye ek <b>DHCP</b> server (Dynamic Host Configuration Protocol) se maangte hain, jo aam taur par router par chalta hai. Yeh chaar messages mein hota hai, jinhe <b>DORA</b> ke naam se yaad rakhte hain: <b>Discover</b> (client broadcast karta hai "koi DHCP server hai?"), <b>Offer</b> (server address offer karta hai), <b>Request</b> (client woh address maangta hai), <b>Acknowledge</b> (server confirm karta hai). Client ko IP address, subnet mask, default gateway, DNS server aur ek <b>lease</b> time milta hai, jiske baad use renew karna padta hai.</p>
<pre class="out">Ethernet adapter Ethernet:

   Physical Address. . . . . . . . . : <span class="hl">3C-52-82-1A-2B-3C</span>
   DHCP Enabled. . . . . . . . . . . : Yes
   IPv4 Address. . . . . . . . . . . : <span class="hl">192.168.1.23(Preferred)</span>
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Lease Obtained. . . . . . . . . . : Tuesday, 29 September 2026 09:12:44
   Default Gateway . . . . . . . . . : <span class="hl">192.168.1.1</span>
   DHCP Server . . . . . . . . . . . : 192.168.1.1
   DNS Servers . . . . . . . . . . . : 192.168.1.1</pre>
<p>Yeh Windows par <code>ipconfig /all</code> ka ek hissa hai. Ek hi screen mein aap is chapter ke saare addresses dekh sakte ho: MAC (Physical Address), IP, mask, gateway aur DHCP aur DNS servers.</p>

<div class="eg"><p><b>Worked example: ek baatcheet, har address.</b> Asha ka laptop (MAC 3c52.821a.2b3c, IP 192.168.1.23) 203.0.113.80 par ek secure web page kholta hai. Uska browser source port 51514 aur destination port 443 chunta hai. Ghar ke andar frame router ke MAC par jaata hai. IP packet kehta hai 192.168.1.23 se 203.0.113.80. Segment kehta hai port 51514 se port 443. NAT ke baad server ko source ke roop mein router ka public address 198.51.100.24 dikhta hai.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> Aisa default gateway set karna jo PC ke same network mein nahi hai (jaise PC 192.168.1.23/24 aur gateway 192.168.2.1). PC apne gateway tak seedhe nahi pahunch sakta, isliye LAN ke bahar kuch kaam nahi karta.</p></div>

<div class="exam"><p><b>Exam trap.</b> 169.254.x.x ka matlab hai DHCP fail hua, "internet down hai" nahi. 172.32.0.1 private <b>nahi</b> hai (private block 172.31.255.255 par khatam hota hai). MAC = Layer 2 aur local; IP = Layer 3 aur end to end; port = Layer 4 aur per application.</p></div>

<div class="scn"><h4>Woh printer jo har Monday "shift" ho jaata tha</h4><p>Ek office printer DHCP par tha. Weekend ke baad har Monday kabhi kabhi use alag address milta, aur staff PCs, jo purane address se configured the, print nahi kar paate. Engineer ne ek DHCP <b>reservation</b> banaya jo printer ke MAC address ko 192.168.10.50 se jodta tha, taaki use hamesha same IP mile. Monday ki complaints band ho gayi.</p><p><b>Seekh:</b> jin devices ko dusron ko dhoondhna hota hai (printers, servers, cameras) unhe fixed address chahiye: static, ya MAC par based DHCP reservation.</p></div>

<div class="iv"><p class="q">"MAC address aur IP address mein kya farak hai? Hamein dono kyun chahiye?"</p><p>Strong answer: MAC 48-bit hardware address hai jise switches local link par frames deliver karne ke liye use karte hain; yeh flat hai aur nahi batata ki device kahan hai. IP address 32-bit (IPv4) logical address hai jismein network aur host part hota hai, jise routers networks ke paar end to end packets deliver karne ke liye use karte hain. Dono chahiye kyunki IP source se destination tak same rehta hai jabki MAC har router hop par badalta hai; har LAN par ARP dono ko jodta hai. Bonus: ports ko teesre address ke roop mein mention karo jo application chunta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MAC (48 bits, Layer 2): hardware address, sirf local LAN, har router hop par badalta hai.</li>
<li>IPv4 (32 bits, Layer 3): logical, end to end; subnet mask se network part + host part mein bata hua.</li>
<li>Private ranges: 10/8, 172.16/12, 192.168/16; NAT unhe internet se jodta hai. 127.0.0.1 loopback; 169.254.x.x = DHCP fail hua.</li>
<li>Port (16 bits, Layer 4): application chunta hai; 80, 443, 53, 22, 67/68 zaroor yaad rakho.</li>
<li>DHCP DORA IP, mask, gateway, DNS aur lease deta hai; printers aur servers ke liye static ya reservations use karo.</li>
</ul></div>
`}};export{e as default};