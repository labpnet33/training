var e={id:`dora`,h:{en:`DORA: the four DHCP messages, one by one`,hi:`DORA: chaar DHCP messages, ek ek karke`},body:{en:`
<p>Imagine you walk into a dark room full of strangers and you do not even know your own name. You cannot talk to one person, because you do not know who anybody is, so you shout to the whole room. That is exactly the position of a DHCP client: no IP address, no idea where the server is. Everything in DHCP follows from this one fact.</p>

<h3>The four messages: Discover, Offer, Request, Ack</h3>
<p>The normal exchange has four messages, remembered as <b>DORA</b>. Every message is a UDP datagram. The client always listens on <b>UDP 68</b>; the server listens on <b>UDP 67</b>.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="DORA ladder diagram">
<rect x="40" y="10" width="140" height="34" rx="8" fill="#bae6fd"/><text x="110" y="32" text-anchor="middle" class="svg-ink" font-size="13">Client PC1</text>
<rect x="460" y="10" width="140" height="34" rx="8" fill="#bbf7d0"/><text x="530" y="32" text-anchor="middle" class="svg-ink" font-size="13">Server R1</text>
<line x1="110" y1="44" x2="110" y2="250" stroke="#64748b" stroke-width="2"/><line x1="530" y1="44" x2="530" y2="250" stroke="#64748b" stroke-width="2"/>
<line x1="110" y1="75" x2="530" y2="90" stroke="#64748b" stroke-width="2"/><polygon points="530,90 518,84 518,96" fill="#64748b"/>
<text x="320" y="72" text-anchor="middle" class="svg-accent" font-size="13">1 DISCOVER  0.0.0.0 to 255.255.255.255</text>
<line x1="530" y1="125" x2="110" y2="140" stroke="#64748b" stroke-width="2"/><polygon points="110,140 122,134 122,146" fill="#64748b"/>
<text x="320" y="122" text-anchor="middle" class="svg-accent" font-size="13">2 OFFER  192.168.10.21, gw, DNS, lease</text>
<line x1="110" y1="175" x2="530" y2="190" stroke="#64748b" stroke-width="2"/><polygon points="530,190 518,184 518,196" fill="#64748b"/>
<text x="320" y="172" text-anchor="middle" class="svg-accent" font-size="13">3 REQUEST  broadcast, server id R1</text>
<line x1="530" y1="225" x2="110" y2="240" stroke="#64748b" stroke-width="2"/><polygon points="110,240 122,234 122,246" fill="#64748b"/>
<text x="320" y="222" text-anchor="middle" class="svg-accent" font-size="13">4 ACK  address is yours</text>
</svg><p class="cap">DORA: the client talks before it has an address, so Discover and Request are broadcasts.</p></div>

<h4>1. DHCPDISCOVER (client to everyone)</h4>
<p>The client builds a packet with <b>source IP 0.0.0.0</b> (it has none), <b>destination IP 255.255.255.255</b> (limited broadcast), source port 68, destination port 67. At Layer 2 the destination MAC is <b>ffff.ffff.ffff</b> and the source MAC is the client's own. Inside, it puts a random <b>transaction ID (xid)</b> so it can match replies, its MAC in the <b>chaddr</b> (client hardware address) field, and often a list of options it would like (option 55, the parameter request list). A switch floods this broadcast to every port in the VLAN, so every DHCP server in that VLAN hears it.</p>

<h4>2. DHCPOFFER (server to client)</h4>
<p>Each server that has a suitable pool picks a free address and offers it. The proposed address sits in the <b>yiaddr</b> ("your IP address") field; options carry the mask, gateway, DNS, domain and lease time, and option 54 carries the <b>server identifier</b> (the server's own IP). A Cisco IOS server first <b>pings</b> the address it is about to offer; if something answers, it logs a conflict and picks another address. The Offer goes to UDP 68. Whether it is sent as a broadcast or unicast depends on the client's <b>broadcast flag</b>: if the client says "I cannot receive unicast yet", the server broadcasts; otherwise it can unicast to yiaddr and the client's MAC.</p>

<h4>3. DHCPREQUEST (client to everyone)</h4>
<p>The client normally takes the <b>first offer it receives</b>. It then broadcasts a Request that says "I would like 192.168.10.21 from server 192.168.10.1" (option 50 = requested IP, option 54 = the chosen server). Why broadcast again, when it now knows the server's address? Because it still has no usable IP, and because <b>every</b> server that sent an Offer must learn that it lost, so it can put its offered address back in its pool.</p>

<h4>4. DHCPACK (server to client)</h4>
<p>The chosen server records the <b>binding</b> (IP to MAC, with an expiry time) and confirms with an Ack that repeats the final options. The client configures the address. Many clients then send an ARP probe or gratuitous ARP for the new address; if another host answers, the client sends <b>DHCPDECLINE</b> and starts again.</p>

<h3>The other DHCP messages</h3>
<table class="cmp"><tr><th>Message</th><th>Option 53 value</th><th>Sent by</th><th>Meaning</th></tr>
<tr><td>DISCOVER</td><td>1</td><td>Client</td><td>Any server out there?</td></tr>
<tr><td>OFFER</td><td>2</td><td>Server</td><td>You can have this address</td></tr>
<tr><td>REQUEST</td><td>3</td><td>Client</td><td>I accept this offer / I want to renew</td></tr>
<tr><td>DECLINE</td><td>4</td><td>Client</td><td>That address is already in use</td></tr>
<tr><td>ACK</td><td>5</td><td>Server</td><td>Confirmed, it is yours for the lease time</td></tr>
<tr><td>NAK</td><td>6</td><td>Server</td><td>No, that address is wrong for this subnet; start over</td></tr>
<tr><td>RELEASE</td><td>7</td><td>Client</td><td>I am done, take the address back</td></tr>
<tr><td>INFORM</td><td>8</td><td>Client</td><td>I have a static IP, just give me options</td></tr>
</table>
<p>A <b>NAK</b> is common when a laptop moves: it wakes up on the annex still holding a campus lease, asks to renew 192.168.10.21, and the server replies NAK because that address does not belong to the annex subnet. The laptop then runs a fresh DORA.</p>

<div class="eg"><p><b>Worked example: fields in PC1's first two packets.</b><br>Discover: Ethernet 0050.7966.6800 to ffff.ffff.ffff; IP 0.0.0.0 to 255.255.255.255; UDP 68 to 67; xid 0x3903F326; chaddr 0050.7966.6800; ciaddr 0.0.0.0; yiaddr 0.0.0.0; giaddr 0.0.0.0.<br>Offer: IP 192.168.10.1 to 192.168.10.21 (or broadcast); UDP 67 to 68; same xid; yiaddr 192.168.10.21; option 1 = 255.255.255.0, option 3 = 192.168.10.1, option 6 = 10.1.100.53, option 15 = nwk.lab, option 51 = 86400 seconds, option 54 = 192.168.10.1.</p></div>

<p>Remember the address fields, they come back in the relay chapter: <b>ciaddr</b> is the client's current address (filled when renewing), <b>yiaddr</b> is the address being given, <b>siaddr</b> is the next server (used for booting), and <b>giaddr</b> is the relay agent address (0.0.0.0 when there is no relay).</p>

<h3>Seeing it in the lab</h3>
<pre class="code">PC1&gt; ip dhcp
DDORA IP 192.168.10.21/24 GW 192.168.10.1</pre>
<p>The lab PC prints one letter per message it saw: <b>D</b>iscover, <b>D</b>iscover repeated, <b>O</b>ffer, <b>R</b>equest, <b>A</b>ck. If only D's appear and then <code>Can't find dhcp server</code>, the Discover never got an answer.</p>
<pre class="out">R1# show ip dhcp server statistics
Message              Received
BOOTREQUEST          0
<span class="hl">DHCPDISCOVER         2
DHCPREQUEST          2</span>
DHCPDECLINE          0
DHCPRELEASE          0
DHCPINFORM           0

Message              Sent
BOOTREPLY            0
<span class="hl">DHCPOFFER            2
DHCPACK              2</span>
DHCPNAK              0</pre>

<div class="warn"><p><b>Common mistake.</b> Saying "the client picks the best offer". It takes the <b>first</b> one. That is why a rogue DHCP server (a home router plugged into a wall port) can hand out a fake gateway to half an office. The switch feature that stops it is DHCP snooping, from the Layer 2 security module.</p></div>
<div class="exam"><p><b>Exam trap.</b> Discover and Request are broadcasts; Offer and Ack can be either, depending on the broadcast flag. The client source IP in Discover is 0.0.0.0, never 169.254.x.x. Client port 68, server port 67; do not swap them.</p></div>

<div class="scn"><h4>Half the floor on the wrong gateway</h4><p>Users on one floor could open internal pages but not the internet, while their neighbours were fine. <code>ipconfig /all</code> on a broken PC showed gateway 192.168.0.1 and DHCP server 192.168.0.1, a subnet the company did not use. A trainee had plugged a small wireless router into a desk port to "boost Wi-Fi". Its DHCP server answered faster than R1, so every PC that renewed took its offer. The engineer unplugged it, enabled DHCP snooping with only the uplink trusted, and had users run <code>ipconfig /renew</code>.</p><p><b>Lesson:</b> first offer wins; protect the access layer so only the real server can answer.</p></div>

<div class="iv"><p class="q">"Walk me through DORA. Which messages are broadcast and why?"</p><p>Name the four messages with ports (client 68, server 67). Discover is broadcast from 0.0.0.0 because the client has no address and does not know the server. Offer carries yiaddr and options and may be unicast or broadcast depending on the broadcast flag. Request is broadcast so every server learns which offer was accepted. Ack confirms and creates the binding. Bonus points: mention xid, option 54, the server's ping check, NAK when a client moves subnets, and DECLINE after a conflict.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DORA = Discover, Offer, Request, Ack; client UDP 68, server UDP 67.</li>
<li>Discover goes from 0.0.0.0 to 255.255.255.255 because the client has no address yet.</li>
<li>The client takes the first offer; the Request is broadcast so losing servers withdraw.</li>
<li>yiaddr carries the offered address; giaddr stays 0.0.0.0 unless a relay is involved.</li>
<li>NAK = wrong subnet, start again; DECLINE = address already in use; RELEASE = give it back.</li>
</ul></div>
`,hi:`
<p>Socho aap ek andhere kamre mein jaate ho jo anjaan logon se bhara hai, aur aapko apna naam bhi nahi pata. Aap kisi ek insaan se baat nahi kar sakte, kyunki aap kisi ko nahi jaante, isliye aap poore kamre mein chillate ho. DHCP client ki bilkul yahi haalat hai: koi IP address nahi, koi idea nahi ki server kahan hai. DHCP ki har cheez isi ek fact se nikalti hai.</p>

<h3>Chaar messages: Discover, Offer, Request, Ack</h3>
<p>Normal exchange mein chaar messages hote hain, jinhe <b>DORA</b> ke naam se yaad rakhte hain. Har message ek UDP datagram hai. Client hamesha <b>UDP 68</b> par sunta hai; server <b>UDP 67</b> par sunta hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="DORA ladder diagram">
<rect x="40" y="10" width="140" height="34" rx="8" fill="#bae6fd"/><text x="110" y="32" text-anchor="middle" class="svg-ink" font-size="13">Client PC1</text>
<rect x="460" y="10" width="140" height="34" rx="8" fill="#bbf7d0"/><text x="530" y="32" text-anchor="middle" class="svg-ink" font-size="13">Server R1</text>
<line x1="110" y1="44" x2="110" y2="250" stroke="#64748b" stroke-width="2"/><line x1="530" y1="44" x2="530" y2="250" stroke="#64748b" stroke-width="2"/>
<line x1="110" y1="75" x2="530" y2="90" stroke="#64748b" stroke-width="2"/><polygon points="530,90 518,84 518,96" fill="#64748b"/>
<text x="320" y="72" text-anchor="middle" class="svg-accent" font-size="13">1 DISCOVER  0.0.0.0 se 255.255.255.255</text>
<line x1="530" y1="125" x2="110" y2="140" stroke="#64748b" stroke-width="2"/><polygon points="110,140 122,134 122,146" fill="#64748b"/>
<text x="320" y="122" text-anchor="middle" class="svg-accent" font-size="13">2 OFFER  192.168.10.21, gw, DNS, lease</text>
<line x1="110" y1="175" x2="530" y2="190" stroke="#64748b" stroke-width="2"/><polygon points="530,190 518,184 518,196" fill="#64748b"/>
<text x="320" y="172" text-anchor="middle" class="svg-accent" font-size="13">3 REQUEST  broadcast, server id R1</text>
<line x1="530" y1="225" x2="110" y2="240" stroke="#64748b" stroke-width="2"/><polygon points="110,240 122,234 122,246" fill="#64748b"/>
<text x="320" y="222" text-anchor="middle" class="svg-accent" font-size="13">4 ACK  address aapka hai</text>
</svg><p class="cap">DORA: client address milne se pehle baat karta hai, isliye Discover aur Request broadcasts hain.</p></div>

<h4>1. DHCPDISCOVER (client se sabko)</h4>
<p>Client ek packet banata hai jismein <b>source IP 0.0.0.0</b> (uske paas koi nahi), <b>destination IP 255.255.255.255</b> (limited broadcast), source port 68, destination port 67. Layer 2 par destination MAC <b>ffff.ffff.ffff</b> hai aur source MAC client ka apna. Andar woh ek random <b>transaction ID (xid)</b> daalta hai taaki replies match kar sake, apna MAC <b>chaddr</b> (client hardware address) field mein, aur aksar un options ki list jo use chahiye (option 55, parameter request list). Switch is broadcast ko VLAN ke har port par flood karta hai, isliye us VLAN ka har DHCP server ise sunta hai.</p>

<h4>2. DHCPOFFER (server se client ko)</h4>
<p>Har server jiske paas suitable pool hai ek free address chunta hai aur offer karta hai. Proposed address <b>yiaddr</b> ("your IP address") field mein hota hai; options mein mask, gateway, DNS, domain aur lease time aate hain, aur option 54 mein <b>server identifier</b> (server ka apna IP). Cisco IOS server jo address offer karne wala hai use pehle <b>ping</b> karta hai; agar koi jawab de, woh conflict log karta hai aur dusra address chunta hai. Offer UDP 68 par jaata hai. Woh broadcast ke roop mein jaaye ya unicast, yeh client ke <b>broadcast flag</b> par depend karta hai: agar client kehta hai "main abhi unicast receive nahi kar sakta", server broadcast karta hai; warna woh yiaddr aur client ke MAC par unicast kar sakta hai.</p>

<h4>3. DHCPREQUEST (client se sabko)</h4>
<p>Client aam taur par <b>pehla offer jo use milta hai</b> wahi le leta hai. Phir woh ek Request broadcast karta hai jo kehta hai "mujhe server 192.168.10.1 se 192.168.10.21 chahiye" (option 50 = requested IP, option 54 = chuna hua server). Ab jab use server ka address pata hai to dobara broadcast kyun? Kyunki uske paas abhi bhi usable IP nahi hai, aur kyunki <b>har</b> server jisne Offer bheja tha use pata chalna chahiye ki woh haar gaya, taaki woh apna offered address wapas pool mein daal sake.</p>

<h4>4. DHCPACK (server se client ko)</h4>
<p>Chuna hua server <b>binding</b> record karta hai (IP se MAC, expiry time ke saath) aur ek Ack se confirm karta hai jo final options dohraata hai. Client address configure karta hai. Bahut se clients phir naye address ke liye ARP probe ya gratuitous ARP bhejte hain; agar koi dusra host jawab de, client <b>DHCPDECLINE</b> bhejta hai aur dobara shuru karta hai.</p>

<h3>Baaki DHCP messages</h3>
<table class="cmp"><tr><th>Message</th><th>Option 53 value</th><th>Kaun bhejta hai</th><th>Matlab</th></tr>
<tr><td>DISCOVER</td><td>1</td><td>Client</td><td>Koi server hai?</td></tr>
<tr><td>OFFER</td><td>2</td><td>Server</td><td>Aap yeh address le sakte ho</td></tr>
<tr><td>REQUEST</td><td>3</td><td>Client</td><td>Main yeh offer accept karta hoon / renew karna hai</td></tr>
<tr><td>DECLINE</td><td>4</td><td>Client</td><td>Woh address pehle se use mein hai</td></tr>
<tr><td>ACK</td><td>5</td><td>Server</td><td>Confirmed, lease time tak aapka hai</td></tr>
<tr><td>NAK</td><td>6</td><td>Server</td><td>Nahi, yeh address is subnet ke liye galat hai; dobara shuru karo</td></tr>
<tr><td>RELEASE</td><td>7</td><td>Client</td><td>Mera kaam ho gaya, address wapas lo</td></tr>
<tr><td>INFORM</td><td>8</td><td>Client</td><td>Mere paas static IP hai, bas options do</td></tr>
</table>
<p><b>NAK</b> tab common hai jab laptop move karta hai: woh annex mein jaagta hai jabki uske paas abhi campus lease hai, 192.168.10.21 renew karne ko kehta hai, aur server NAK bhejta hai kyunki woh address annex subnet ka nahi hai. Laptop phir fresh DORA chalata hai.</p>

<div class="eg"><p><b>Worked example: PC1 ke pehle do packets ke fields.</b><br>Discover: Ethernet 0050.7966.6800 se ffff.ffff.ffff; IP 0.0.0.0 se 255.255.255.255; UDP 68 se 67; xid 0x3903F326; chaddr 0050.7966.6800; ciaddr 0.0.0.0; yiaddr 0.0.0.0; giaddr 0.0.0.0.<br>Offer: IP 192.168.10.1 se 192.168.10.21 (ya broadcast); UDP 67 se 68; same xid; yiaddr 192.168.10.21; option 1 = 255.255.255.0, option 3 = 192.168.10.1, option 6 = 10.1.100.53, option 15 = nwk.lab, option 51 = 86400 seconds, option 54 = 192.168.10.1.</p></div>

<p>Address fields yaad rakho, yeh relay chapter mein wapas aayenge: <b>ciaddr</b> client ka current address hai (renew karte waqt bhara jaata hai), <b>yiaddr</b> diya ja raha address hai, <b>siaddr</b> next server hai (booting ke liye), aur <b>giaddr</b> relay agent ka address hai (relay na ho to 0.0.0.0).</p>

<h3>Lab mein dekhna</h3>
<pre class="code">PC1&gt; ip dhcp
DDORA IP 192.168.10.21/24 GW 192.168.10.1</pre>
<p>Lab PC har dekhe gaye message ke liye ek letter print karta hai: <b>D</b>iscover, <b>D</b>iscover dobara, <b>O</b>ffer, <b>R</b>equest, <b>A</b>ck. Agar sirf D's aayein aur phir <code>Can't find dhcp server</code>, to Discover ka kabhi jawab nahi mila.</p>
<pre class="out">R1# show ip dhcp server statistics
Message              Received
BOOTREQUEST          0
<span class="hl">DHCPDISCOVER         2
DHCPREQUEST          2</span>
DHCPDECLINE          0
DHCPRELEASE          0
DHCPINFORM           0

Message              Sent
BOOTREPLY            0
<span class="hl">DHCPOFFER            2
DHCPACK              2</span>
DHCPNAK              0</pre>

<div class="warn"><p><b>Common galti.</b> Kehna ki "client best offer chunta hai". Woh <b>pehla</b> offer leta hai. Isiliye rogue DHCP server (wall port mein laga ghar ka router) aadhe office ko fake gateway de sakta hai. Ise rokne wala switch feature DHCP snooping hai, Layer 2 security module se.</p></div>
<div class="exam"><p><b>Exam trap.</b> Discover aur Request broadcasts hain; Offer aur Ack dono ho sakte hain, broadcast flag par depend karta hai. Discover mein client ka source IP 0.0.0.0 hota hai, kabhi 169.254.x.x nahi. Client port 68, server port 67; inhe ulta mat karo.</p></div>

<div class="scn"><h4>Aadha floor galat gateway par</h4><p>Ek floor ke users internal pages khol paate the lekin internet nahi, jabki unke padosi theek the. Toote hue PC par <code>ipconfig /all</code> ne gateway 192.168.0.1 aur DHCP server 192.168.0.1 dikhaya, ek aisa subnet jo company use hi nahi karti thi. Ek trainee ne "Wi-Fi boost" karne ke liye ek chhota wireless router desk port mein laga diya tha. Uska DHCP server R1 se tez jawab deta tha, isliye har PC jo renew karta uska offer le leta. Engineer ne use nikala, sirf uplink ko trusted rakh kar DHCP snooping enable kiya, aur users se <code>ipconfig /renew</code> chalwaya.</p><p><b>Seekh:</b> pehla offer jeetta hai; access layer ko protect karo taaki sirf asli server jawab de sake.</p></div>

<div class="iv"><p class="q">"Mujhe DORA samjhao. Kaunse messages broadcast hain aur kyun?"</p><p>Chaaron messages ports ke saath batao (client 68, server 67). Discover 0.0.0.0 se broadcast hota hai kyunki client ke paas address nahi aur use server nahi pata. Offer mein yiaddr aur options hote hain aur broadcast flag ke hisaab se unicast ya broadcast ho sakta hai. Request broadcast hota hai taaki har server ko pata chale kaunsa offer accept hua. Ack confirm karta hai aur binding banata hai. Bonus points: xid, option 54, server ka ping check, client ke subnet badalne par NAK, aur conflict ke baad DECLINE ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DORA = Discover, Offer, Request, Ack; client UDP 68, server UDP 67.</li>
<li>Discover 0.0.0.0 se 255.255.255.255 par jaata hai kyunki client ke paas abhi address nahi hai.</li>
<li>Client pehla offer leta hai; Request broadcast hota hai taaki haarne wale servers offer wapas lein.</li>
<li>yiaddr mein offered address hota hai; giaddr 0.0.0.0 rehta hai jab tak relay involved na ho.</li>
<li>NAK = galat subnet, dobara shuru karo; DECLINE = address pehle se use mein; RELEASE = wapas do.</li>
</ul></div>
`}};export{e as default};