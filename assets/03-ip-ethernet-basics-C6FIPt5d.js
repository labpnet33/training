var e={id:`ip-ethernet-basics`,h:{en:`IP addresses and Ethernet in plain words`,hi:`IP address aur Ethernet simple shabdon mein`},body:{en:`
<p>Two address types appear in every network conversation: the <b>MAC address</b> (Ethernet) and the <b>IP address</b>. This chapter explains both without maths, and previews the one trick you will use all year: splitting an address into a network part and a host part.</p>

<h3>Ethernet and MAC addresses</h3>
<p><b>Ethernet</b> is the standard way devices on a local network exchange frames over copper or fibre cable. Each network card has a 48-bit <b>MAC address</b> written in hex such as <code>2c:6b:f5:3a:10:c1</code>. The first half identifies the manufacturer, the second half is unique to the card. The address <code>ff:ff:ff:ff:ff:ff</code> means "everybody on this network": a <b>broadcast</b>. MAC addresses only matter on one hop: they are used between a host and its switch or router, never across the internet.</p>

<h3>IP addresses</h3>
<p>An <b>IPv4 address</b> has four numbers from 0 to 255 separated by dots, for example <code>192.0.2.10</code>. Technically it is 32 bits, and each number is 8 bits. IP addresses are given by the engineer, can change, and describe <i>where</i> a device sits in the network. That is why they can be used to route across the world.</p>
<p>An address has two parts: the <b>network</b> part (the street) and the <b>host</b> part (the house number). The <b>prefix length</b> or <b>subnet mask</b> tells you where the split is. In <code>192.0.2.10/24</code> the first 24 bits (192.0.2) are the network and the last 8 bits (10) are the host. All devices with the same network part can talk directly without a router.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Network and host parts of 192.0.2.10/24">
<rect x="20" y="30" width="400" height="50" rx="8" fill="#bae6fd"/><text x="220" y="62" text-anchor="middle" class="svg-ink" font-size="15">192 . 0 . 2</text>
<rect x="420" y="30" width="200" height="50" rx="8" fill="#fde68a"/><text x="520" y="62" text-anchor="middle" class="svg-ink" font-size="15">10</text>
<text x="220" y="105" text-anchor="middle" class="svg-ink" font-size="13">Network part (24 bits) = the street</text>
<text x="520" y="105" text-anchor="middle" class="svg-ink" font-size="13">Host part (8 bits) = the house</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.10/24 means: same street as 192.0.2.1 to 192.0.2.254</text>
</svg><p class="cap">The /24 prefix says the first three numbers are the network. Subnetting in depth comes in the Fundamentals module.</p></div>

<h3>Gateway, subnet and the golden rule</h3>
<p>The <b>default gateway</b> is the router address on your own network that you hand packets to when the destination is somewhere else. The host makes one simple decision for every packet:</p>
<ol><li>Is the destination in <i>my</i> network (same prefix)? Send directly to its MAC address.</li>
<li>If not, send to my default gateway's MAC address and let the router handle it.</li></ol>
<p>To learn the MAC address of a neighbour whose IP it knows, a host uses <b>ARP</b> (Address Resolution Protocol): it broadcasts "who has 192.0.2.1?" and the owner answers with its MAC address.</p>

<h3>Special addresses to recognise</h3>
<table class="cmp"><tr><th>Range</th><th>Meaning</th></tr>
<tr><td>10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16</td><td>Private ranges used inside organisations (RFC 1918)</td></tr>
<tr><td>127.0.0.0/8</td><td>Loopback: the device itself</td></tr>
<tr><td>192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24</td><td>Documentation ranges used in this course</td></tr>
<tr><td>0.0.0.0/0</td><td>Default route: "everywhere else"</td></tr></table>
<p><b>IPv6</b> is the newer version with 128-bit addresses such as <code>2001:db8::1</code>. It exists because IPv4 has only about 4 billion addresses. The exam covers both; Fundamentals teaches IPv6 in detail.</p>

<div class="eg"><p><b>Worked example.</b> A PC has 192.0.2.10/24 and gateway 192.0.2.1. It wants to reach 192.0.2.77: same network (first three numbers equal), so it ARPs for 192.0.2.77 and sends directly. It wants to reach 198.51.100.9: different network, so it ARPs for 192.0.2.1 (the router) and sends the frame there, with destination IP still 198.51.100.9.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> A wrong gateway or wrong mask. If a PC has 192.0.2.10/24 but the gateway is set to 192.0.3.1, the gateway is not in its own network and the PC cannot reach it. Local pings will work, internet pings will fail.</p></div>

<div class="scn"><h4>Only the local printer works</h4><p>A user could print and open the file server in the same office but not browse the internet after a move to a new desk. The helpdesk saw IP 192.0.2.50 with mask 255.255.255.0 and gateway 192.0.2.254 (the old floor's router). The new network's gateway was 192.0.2.1. After fixing the gateway the internet worked. Local traffic had never needed the gateway, so the symptom pointed straight at it.</p><p><b>Lesson:</b> "local works, remote fails" almost always means a gateway, mask or routing problem.</p></div>

<div class="iv"><p class="q">"What is the difference between a MAC address and an IP address?"</p><p>A MAC address is a 48-bit hardware address used at layer 2 for delivery on one link; it changes at every hop. An IP address is a layer-3 logical address assigned by configuration, used for end-to-end routing; it has a network part and a host part. Mention ARP as the bridge that maps one to the other on the local segment.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MAC addresses (48 bits) work per hop; IP addresses (32 bits for IPv4) work end to end.</li>
<li>The prefix length splits an address into network and host parts.</li>
<li>Same network: send directly. Different network: send to the default gateway.</li>
<li>ARP finds the MAC address that belongs to an IPv4 address on the local segment.</li>
<li>Documentation ranges 192.0.2.0/24, 198.51.100.0/24 and 203.0.113.0/24 are used in examples.</li>
</ul></div>
`,hi:`
<p>Har network baatcheet mein do tarah ke address aate hain: <b>MAC address</b> (Ethernet) aur <b>IP address</b>. Yeh chapter dono ko bina maths ke samjhata hai, aur ek trick ki jhalak deta hai jo aap saal bhar use karoge: address ko network part aur host part mein baantna.</p>

<h3>Ethernet aur MAC address</h3>
<p><b>Ethernet</b> local network par devices ke beech copper ya fibre cable se frames badalne ka standard tareeka hai. Har network card ka 48-bit <b>MAC address</b> hota hai jo hex mein likha jaata hai, jaise <code>2c:6b:f5:3a:10:c1</code>. Pehla aadha hissa manufacturer batata hai, doosra aadha card ka unique hissa hai. Address <code>ff:ff:ff:ff:ff:ff</code> ka matlab hai "is network par sab": ek <b>broadcast</b>. MAC addresses sirf ek hop ke liye matter karte hain: host aur uske switch ya router ke beech, internet ke paar kabhi nahi.</p>

<h3>IP addresses</h3>
<p><b>IPv4 address</b> mein 0 se 255 tak ke chaar numbers dots se alag hote hain, jaise <code>192.0.2.10</code>. Technically yeh 32 bits ka hai, aur har number 8 bits ka. IP address engineer deta hai, badal sakta hai, aur batata hai ki device network mein <i>kahan</i> baitha hai. Isiliye unse poori duniya mein route kiya ja sakta hai.</p>
<p>Address ke do hisse hote hain: <b>network</b> part (gali) aur <b>host</b> part (ghar ka number). <b>Prefix length</b> ya <b>subnet mask</b> batata hai ki batwaara kahan hai. <code>192.0.2.10/24</code> mein pehle 24 bits (192.0.2) network hain aur aakhri 8 bits (10) host. Jin devices ka network part same hai woh bina router ke seedha baat kar sakte hain.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="192.0.2.10/24 ke network aur host part">
<rect x="20" y="30" width="400" height="50" rx="8" fill="#bae6fd"/><text x="220" y="62" text-anchor="middle" class="svg-ink" font-size="15">192 . 0 . 2</text>
<rect x="420" y="30" width="200" height="50" rx="8" fill="#fde68a"/><text x="520" y="62" text-anchor="middle" class="svg-ink" font-size="15">10</text>
<text x="220" y="105" text-anchor="middle" class="svg-ink" font-size="13">Network part (24 bits) = gali</text>
<text x="520" y="105" text-anchor="middle" class="svg-ink" font-size="13">Host part (8 bits) = ghar</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.10/24 ka matlab: 192.0.2.1 se 192.0.2.254 tak same gali</text>
</svg><p class="cap">/24 prefix kehta hai ki pehle teen numbers network hain. Subnetting gehrai se Fundamentals module mein aayegi.</p></div>

<h3>Gateway, subnet aur golden rule</h3>
<p><b>Default gateway</b> aapke apne network par router ka address hai jise aap packet dete ho jab destination kahin aur ho. Host har packet ke liye ek simple faisla leta hai:</p>
<ol><li>Destination <i>mere</i> network mein hai (same prefix)? To uske MAC address par seedha bhejo.</li>
<li>Nahi hai? To default gateway ke MAC address par bhejo aur router ko sambhalne do.</li></ol>
<p>Jis padosi ka IP pata hai uska MAC address jaanne ke liye host <b>ARP</b> (Address Resolution Protocol) use karta hai: woh broadcast karta hai "192.0.2.1 kiske paas hai?" aur owner apna MAC address bata deta hai.</p>

<h3>Kuch khaas addresses jo pehchanne hain</h3>
<table class="cmp"><tr><th>Range</th><th>Matlab</th></tr>
<tr><td>10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16</td><td>Organisations ke andar use hone wale private ranges (RFC 1918)</td></tr>
<tr><td>127.0.0.0/8</td><td>Loopback: device khud</td></tr>
<tr><td>192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24</td><td>Documentation ranges jo is course mein use hote hain</td></tr>
<tr><td>0.0.0.0/0</td><td>Default route: "baaki sab jagah"</td></tr></table>
<p><b>IPv6</b> naya version hai jisme 128-bit addresses hote hain, jaise <code>2001:db8::1</code>. Yeh isliye bana kyunki IPv4 mein sirf lagbhag 4 arab addresses hain. Exam dono cover karta hai; Fundamentals mein IPv6 detail mein hai.</p>

<div class="eg"><p><b>Worked example.</b> PC ka address 192.0.2.10/24 aur gateway 192.0.2.1 hai. Use 192.0.2.77 tak pahunchna hai: same network (pehle teen numbers barabar), to woh 192.0.2.77 ka ARP karta hai aur seedha bhejta hai. Use 198.51.100.9 tak pahunchna hai: alag network, to woh 192.0.2.1 (router) ka ARP karta hai aur frame wahan bhejta hai, destination IP phir bhi 198.51.100.9 hi rehta hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Galat gateway ya galat mask. PC ka address 192.0.2.10/24 ho lekin gateway 192.0.3.1 set ho, to gateway uske apne network mein hai hi nahi aur PC us tak pahunch nahi sakta. Local ping chalenge, internet ping fail honge.</p></div>

<div class="scn"><h4>Sirf local printer chal raha hai</h4><p>Naye desk par shift hone ke baad ek user print kar pa raha tha aur usi office ka file server khol pa raha tha, lekin internet browse nahi kar pa raha tha. Helpdesk ne dekha IP 192.0.2.50, mask 255.255.255.0 aur gateway 192.0.2.254 (purane floor ka router). Naye network ka gateway 192.0.2.1 tha. Gateway theek karne se internet chal gaya. Local traffic ko gateway kabhi chahiye hi nahi tha, isliye symptom seedha usi taraf ishara kar raha tha.</p><p><b>Lesson:</b> "local chal raha hai, remote fail" ka matlab aksar gateway, mask ya routing ki problem hota hai.</p></div>

<div class="iv"><p class="q">"MAC address aur IP address mein kya fark hai?"</p><p>MAC address 48-bit hardware address hai jo layer 2 par ek link par delivery ke liye use hota hai; har hop par badalta hai. IP address layer-3 logical address hai jo configuration se milta hai, end-to-end routing ke liye; ismein network part aur host part hota hai. ARP ka zikr karo jo local segment par ek ko doosre se map karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MAC addresses (48 bits) har hop par kaam karte hain; IP addresses (IPv4 mein 32 bits) end to end.</li>
<li>Prefix length address ko network aur host parts mein baantta hai.</li>
<li>Same network: seedha bhejo. Alag network: default gateway ko bhejo.</li>
<li>ARP local segment par IPv4 address ka MAC address dhoondhta hai.</li>
<li>Examples mein documentation ranges 192.0.2.0/24, 198.51.100.0/24 aur 203.0.113.0/24 use hote hain.</li>
</ul></div>
`}};export{e as default};