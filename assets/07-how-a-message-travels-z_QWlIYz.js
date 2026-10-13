var e={id:`journey`,h:{en:`How a message travels: layers, packets and a web page load`,hi:`Message kaise safar karta hai: layers, packets aur web page load`},body:{en:`
<p>Picture a company sending an important document to a branch. The manager writes the letter. An assistant puts it in an envelope marked "Accounts department, attention Mr Rao". The mail room puts that envelope inside a bigger courier envelope with the branch's full address. The courier company sticks its own tracking label on the outside for the next van. At the other end, each person opens only their own envelope and passes the inside up to the next person. Networks send data in exactly this way. The envelopes are called <b>headers</b>, and the people are called <b>layers</b>.</p>

<h3>Why layers?</h3>
<p>Sending data involves many separate problems: which application is talking, how to make delivery reliable, how to find the way across networks, how to reach the next device on the cable, and how to turn bits into signals. Splitting the job into <b>layers</b> means each layer solves one problem and trusts the others. A Wi-Fi card can be swapped for an Ethernet card without changing your browser, because they sit at different layers. Layers also give engineers a shared vocabulary: "it's a Layer 1 problem" means "check the cable".</p>

<h3>The two models, in one table</h3>
<figure class="nk-lesson-image"><img src="/images/config/osi-model-v1-en.svg" width="880" height="740" loading="lazy" decoding="async" alt="Seven OSI layers with sending and receiving directions, TCP encapsulation and an example network path." /><figcaption>A message moves down the stack when sent and up when received. TCP uses a segment; UDP uses a datagram. <a href="/images/config/osi-model-v1-en.svg" target="_blank" rel="noopener noreferrer">View full-size diagram</a></figcaption></figure>

<table class="cmp"><tr><th>OSI layer</th><th>Name</th><th>Job in one line</th><th>Unit of data (PDU)</th><th>Example</th></tr>
<tr><td>7</td><td>Application</td><td>Gives network services to applications</td><td rowspan="3">Data</td><td>Web, DNS, email</td></tr>
<tr><td>6</td><td>Presentation</td><td>Formats, encrypts, compresses</td><td>TLS encryption, JPEG</td></tr>
<tr><td>5</td><td>Session</td><td>Opens and closes conversations</td><td>Session setup</td></tr>
<tr><td>4</td><td>Transport</td><td>Delivery between applications, using ports</td><td>Segment (TCP) / datagram (UDP)</td><td>TCP, UDP</td></tr>
<tr><td>3</td><td>Network</td><td>End-to-end delivery across networks, using IP</td><td>Packet</td><td>IPv4, IPv6, routers</td></tr>
<tr><td>2</td><td>Data link</td><td>Delivery to the next device on the link, using MAC</td><td>Frame</td><td>Ethernet, Wi-Fi, switches</td></tr>
<tr><td>1</td><td>Physical</td><td>Bits as signals on the medium</td><td>Bits</td><td>Cables, fibre, radio, hubs</td></tr>
</table>
<p>The <b>OSI model</b> has 7 layers and is the teaching reference. The <b>TCP/IP model</b>, which the internet actually uses, merges layers 5, 6 and 7 into one Application layer, giving 4 layers (Application, Transport, Internet, Link) or 5 if you split Link into Data link and Physical. A popular way to remember OSI from layer 1 up: <b>"Please Do Not Throw Sausage Pizza Away"</b>. The CCNA models module and the Network+ concepts module go through every layer in depth; here you only need the idea.</p>

<h3>Encapsulation: envelopes inside envelopes</h3>
<p>On the way <b>down</b> the layers at the sender, each layer adds its own header in front of what it received. This is <b>encapsulation</b>. On the way <b>up</b> at the receiver, each layer reads and removes its own header. This is <b>de-encapsulation</b>.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Encapsulation of data into segment, packet and frame">
<rect x="400" y="20" width="220" height="34" rx="6" fill="#fde68a"/><text x="510" y="42" text-anchor="middle" class="svg-ink" font-size="13">Data (web request)</text>
<text x="20" y="42" class="svg-muted" font-size="12">Application</text>
<rect x="300" y="68" width="96" height="34" rx="6" fill="#bbf7d0"/><text x="348" y="90" text-anchor="middle" class="svg-ink" font-size="12">TCP: ports</text>
<rect x="400" y="68" width="220" height="34" rx="6" fill="#fde68a"/><text x="510" y="90" text-anchor="middle" class="svg-ink" font-size="13">Data</text>
<text x="20" y="90" class="svg-muted" font-size="12">Transport = segment</text>
<rect x="200" y="116" width="96" height="34" rx="6" fill="#bae6fd"/><text x="248" y="138" text-anchor="middle" class="svg-ink" font-size="12">IP: addresses</text>
<rect x="300" y="116" width="96" height="34" rx="6" fill="#bbf7d0"/><text x="348" y="138" text-anchor="middle" class="svg-ink" font-size="12">TCP</text>
<rect x="400" y="116" width="220" height="34" rx="6" fill="#fde68a"/><text x="510" y="138" text-anchor="middle" class="svg-ink" font-size="13">Data</text>
<text x="20" y="138" class="svg-muted" font-size="12">Network = packet</text>
<rect x="100" y="164" width="96" height="34" rx="6" fill="#ddd6fe"/><text x="148" y="186" text-anchor="middle" class="svg-ink" font-size="12">Eth: MACs</text>
<rect x="200" y="164" width="96" height="34" rx="6" fill="#bae6fd"/><text x="248" y="186" text-anchor="middle" class="svg-ink" font-size="12">IP</text>
<rect x="300" y="164" width="96" height="34" rx="6" fill="#bbf7d0"/><text x="348" y="186" text-anchor="middle" class="svg-ink" font-size="12">TCP</text>
<rect x="400" y="164" width="170" height="34" rx="6" fill="#fde68a"/><text x="485" y="186" text-anchor="middle" class="svg-ink" font-size="13">Data</text>
<rect x="574" y="164" width="46" height="34" rx="6" fill="#ddd6fe"/><text x="597" y="186" text-anchor="middle" class="svg-ink" font-size="12">FCS</text>
<text x="20" y="186" class="svg-muted" font-size="12">Data link = frame</text>
<text x="320" y="222" text-anchor="middle" class="svg-accent" font-size="12">Physical layer turns the whole frame into bits on the wire</text>
</svg><p class="cap">Each layer wraps the one above. The Ethernet frame also adds a trailer (FCS) used to detect damaged frames.</p></div>

<h3>A web page load, step by step</h3>
<p>Let us follow Asha's laptop (192.168.1.23/24, gateway 192.168.1.1, DNS 198.51.100.53) opening the secure web page <code>www.nkshop.example</code>.</p>
<ol>
<li><b>DNS lookup.</b> The browser needs an IP address. The laptop sends a DNS query (UDP, port 53) to 198.51.100.53 and receives the answer 203.0.113.80.</li>
<li><b>Local or remote?</b> The laptop compares the destination with its own network using the mask. 203.0.113.80 is not in 192.168.1.0/24, so the packet must go to the <b>default gateway</b>.</li>
<li><b>ARP.</b> To build an Ethernet frame the laptop needs the gateway's MAC. It broadcasts an <b>ARP</b> (Address Resolution Protocol) request, "who has 192.168.1.1?", and the router replies with its MAC. The laptop stores it in its <b>ARP cache</b>. (Strictly, ARP also happened before the DNS query in step 1, because the DNS server is remote too; after the first time the answer is cached.)</li>
<li><b>TCP three-way handshake.</b> The laptop opens a reliable connection to 203.0.113.80 port 443: <b>SYN</b>, the server answers <b>SYN-ACK</b>, the laptop sends <b>ACK</b>.</li>
<li><b>Secure session.</b> The browser and server agree on encryption keys (TLS), so nobody on the path can read the page.</li>
<li><b>The request and the page.</b> The browser sends an HTTP request ("GET the home page"); the server returns the page, often followed by more requests for images and scripts.</li>
<li><b>At every router on the way</b>, the frame is removed, the router looks at the destination IP, lowers the <b>TTL</b> (time to live) by 1, and builds a <b>new frame</b> with new source and destination MACs for the next link. The IP addresses stay the same end to end (except where NAT changes them, as at Asha's home router).</li>
</ol>
<p>You can see step 3 on your own PC with <code>arp -a</code>:</p>
<pre class="out">Interface: 192.168.1.23 --- 0xc
  Internet Address      Physical Address      Type
  <span class="hl">192.168.1.1           a4-91-b1-3e-00-01     dynamic</span>
  192.168.1.255         ff-ff-ff-ff-ff-ff     static</pre>

<div class="eg"><p><b>Worked example: what changes on each hop.</b> Asha's frame to her router: source MAC 3c52.821a.2b3c, destination MAC a491.b13e.0001, source IP 192.168.1.23, destination IP 203.0.113.80. After NAT, on the ISP link: new source MAC (the router's outside port), new destination MAC (the ISP router), source IP 198.51.100.24, destination IP still 203.0.113.80. MACs change every hop; the destination IP never does.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking the PC ARPs for the remote server's MAC. It never does: a PC only ARPs for addresses on its own network. For anything remote, it ARPs for the default gateway.</p></div>

<div class="exam"><p><b>Exam trap.</b> Match PDUs to layers: segment = Layer 4, packet = Layer 3, frame = Layer 2, bits = Layer 1. Routers rewrite the Layer 2 header at every hop but keep the Layer 3 destination. TCP handshake order: SYN, SYN-ACK, ACK.</p></div>

<div class="scn"><h4>Local printer works, internet does not</h4><p>A new PC could print to the printer 192.168.1.50 and reach the file server 192.168.1.10, but no website opened and <code>ping 203.0.113.80</code> said "transmit failed". The engineer ran <code>ipconfig</code>: IP 192.168.1.40 and mask 255.255.255.0 were correct, but the <b>Default Gateway</b> line was empty. A technician had typed a static address and skipped the gateway field. The PC correctly decided in step 2 that the server was remote, but it had no router to hand the packet to. Adding gateway 192.168.1.1 fixed it instantly.</p><p><b>Lesson:</b> local traffic needs only a correct IP and mask; anything remote also needs a correct default gateway.</p></div>

<div class="iv"><p class="q">"Explain encapsulation, and tell me what changes and what stays the same as a packet crosses routers."</p><p>Strong answer: each layer adds its own header as data goes down the stack: data, then a TCP or UDP segment with ports, then an IP packet with source and destination IP, then an Ethernet frame with MACs and an FCS trailer, then bits. At each router the frame is stripped, the router routes on the destination IP, decrements TTL and builds a new frame with new MACs for the next link. IP addresses stay the same end to end unless NAT changes them. Walk through a real example with ARP for the gateway.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSI has 7 layers; TCP/IP has 4 (or 5). Remember "Please Do Not Throw Sausage Pizza Away".</li>
<li>Encapsulation adds headers going down; de-encapsulation removes them going up.</li>
<li>PDUs: data, segment (L4), packet (L3), frame (L2), bits (L1).</li>
<li>Web page load: DNS, local-or-remote check, ARP for the gateway, TCP handshake, TLS, request and response.</li>
<li>At each router hop the MACs change; the destination IP does not; TTL drops by 1.</li>
</ul></div>
`,hi:`
<p>Socho ek company branch ko ek zaroori document bhej rahi hai. Manager letter likhta hai. Assistant use ek envelope mein daalta hai jis par likha hai "Accounts department, attention Mr Rao". Mail room us envelope ko ek bade courier envelope mein daalta hai jis par branch ka poora address hai. Courier company agli van ke liye bahar apna tracking label chipka deti hai. Dusri taraf, har insaan sirf apna envelope kholta hai aur andar ka hissa agle insaan ko upar de deta hai. Networks bilkul isi tarah data bhejte hain. Envelopes ko <b>headers</b> kehte hain, aur logon ko <b>layers</b>.</p>

<h3>Layers kyun?</h3>
<p>Data bhejne mein kai alag problems hoti hain: kaunsi application baat kar rahi hai, delivery reliable kaise ho, networks ke paar raasta kaise mile, cable par agle device tak kaise pahunchein, aur bits ko signals mein kaise badlein. Kaam ko <b>layers</b> mein baantne ka matlab hai ki har layer ek problem solve karti hai aur baaki par bharosa karti hai. Wi-Fi card ko Ethernet card se badla ja sakta hai bina browser badle, kyunki woh alag layers par hain. Layers engineers ko ek common bhasha bhi deti hain: "yeh Layer 1 problem hai" ka matlab hai "cable check karo".</p>

<h3>Dono models, ek table mein</h3>
<figure class="nk-lesson-image"><img src="/images/config/osi-model-v1-hi.svg" width="880" height="740" loading="lazy" decoding="async" alt="OSI ki saat layers aur TCP encapsulation." /><figcaption>Message bhejte waqt neeche aur receive karte waqt stack mein upar jaata hai. TCP segment aur UDP datagram alag hain. <a href="/images/config/osi-model-v1-hi.svg" target="_blank" rel="noopener noreferrer">Diagram bada dekho</a></figcaption></figure>

<table class="cmp"><tr><th>OSI layer</th><th>Naam</th><th>Ek line mein kaam</th><th>Data ki unit (PDU)</th><th>Example</th></tr>
<tr><td>7</td><td>Application</td><td>Applications ko network services deti hai</td><td rowspan="3">Data</td><td>Web, DNS, email</td></tr>
<tr><td>6</td><td>Presentation</td><td>Format, encrypt, compress karti hai</td><td>TLS encryption, JPEG</td></tr>
<tr><td>5</td><td>Session</td><td>Baatcheet kholti aur band karti hai</td><td>Session setup</td></tr>
<tr><td>4</td><td>Transport</td><td>Applications ke beech delivery, ports se</td><td>Segment (TCP) / datagram (UDP)</td><td>TCP, UDP</td></tr>
<tr><td>3</td><td>Network</td><td>Networks ke paar end-to-end delivery, IP se</td><td>Packet</td><td>IPv4, IPv6, routers</td></tr>
<tr><td>2</td><td>Data link</td><td>Link par agle device tak delivery, MAC se</td><td>Frame</td><td>Ethernet, Wi-Fi, switches</td></tr>
<tr><td>1</td><td>Physical</td><td>Medium par bits signals ke roop mein</td><td>Bits</td><td>Cables, fibre, radio, hubs</td></tr>
</table>
<p><b>OSI model</b> mein 7 layers hain aur yeh padhane ka reference hai. <b>TCP/IP model</b>, jo internet asal mein use karta hai, layers 5, 6 aur 7 ko ek Application layer mein mila deta hai, jisse 4 layers bante hain (Application, Transport, Internet, Link), ya 5 agar Link ko Data link aur Physical mein baanto. Layer 1 se upar OSI yaad rakhne ka popular tareeka: <b>"Please Do Not Throw Sausage Pizza Away"</b>. CCNA models module aur Network+ concepts module har layer ko gehraai se padhate hain; yahan aapko sirf idea chahiye.</p>

<h3>Encapsulation: envelopes ke andar envelopes</h3>
<p>Sender par layers ke <b>neeche</b> jaate hue, har layer jo mila uske aage apna header jodti hai. Ise <b>encapsulation</b> kehte hain. Receiver par <b>upar</b> jaate hue, har layer apna header padhti aur hataati hai. Ise <b>de-encapsulation</b> kehte hain.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Data ka segment, packet aur frame mein encapsulation">
<rect x="400" y="20" width="220" height="34" rx="6" fill="#fde68a"/><text x="510" y="42" text-anchor="middle" class="svg-ink" font-size="13">Data (web request)</text>
<text x="20" y="42" class="svg-muted" font-size="12">Application</text>
<rect x="300" y="68" width="96" height="34" rx="6" fill="#bbf7d0"/><text x="348" y="90" text-anchor="middle" class="svg-ink" font-size="12">TCP: ports</text>
<rect x="400" y="68" width="220" height="34" rx="6" fill="#fde68a"/><text x="510" y="90" text-anchor="middle" class="svg-ink" font-size="13">Data</text>
<text x="20" y="90" class="svg-muted" font-size="12">Transport = segment</text>
<rect x="200" y="116" width="96" height="34" rx="6" fill="#bae6fd"/><text x="248" y="138" text-anchor="middle" class="svg-ink" font-size="12">IP: addresses</text>
<rect x="300" y="116" width="96" height="34" rx="6" fill="#bbf7d0"/><text x="348" y="138" text-anchor="middle" class="svg-ink" font-size="12">TCP</text>
<rect x="400" y="116" width="220" height="34" rx="6" fill="#fde68a"/><text x="510" y="138" text-anchor="middle" class="svg-ink" font-size="13">Data</text>
<text x="20" y="138" class="svg-muted" font-size="12">Network = packet</text>
<rect x="100" y="164" width="96" height="34" rx="6" fill="#ddd6fe"/><text x="148" y="186" text-anchor="middle" class="svg-ink" font-size="12">Eth: MACs</text>
<rect x="200" y="164" width="96" height="34" rx="6" fill="#bae6fd"/><text x="248" y="186" text-anchor="middle" class="svg-ink" font-size="12">IP</text>
<rect x="300" y="164" width="96" height="34" rx="6" fill="#bbf7d0"/><text x="348" y="186" text-anchor="middle" class="svg-ink" font-size="12">TCP</text>
<rect x="400" y="164" width="170" height="34" rx="6" fill="#fde68a"/><text x="485" y="186" text-anchor="middle" class="svg-ink" font-size="13">Data</text>
<rect x="574" y="164" width="46" height="34" rx="6" fill="#ddd6fe"/><text x="597" y="186" text-anchor="middle" class="svg-ink" font-size="12">FCS</text>
<text x="20" y="186" class="svg-muted" font-size="12">Data link = frame</text>
<text x="320" y="222" text-anchor="middle" class="svg-accent" font-size="12">Physical layer poore frame ko wire par bits mein badal deti hai</text>
</svg><p class="cap">Har layer apne upar wali ko lapet-ti hai. Ethernet frame ek trailer (FCS) bhi jodta hai jo kharab frames detect karta hai.</p></div>

<h3>Web page load, step by step</h3>
<p>Chalo Asha ke laptop (192.168.1.23/24, gateway 192.168.1.1, DNS 198.51.100.53) ko secure web page <code>www.nkshop.example</code> kholte hue follow karein.</p>
<ol>
<li><b>DNS lookup.</b> Browser ko IP address chahiye. Laptop 198.51.100.53 ko DNS query (UDP, port 53) bhejta hai aur answer 203.0.113.80 paata hai.</li>
<li><b>Local ya remote?</b> Laptop mask use karke destination ko apne network se compare karta hai. 203.0.113.80 192.168.1.0/24 mein nahi hai, isliye packet <b>default gateway</b> ko jaana chahiye.</li>
<li><b>ARP.</b> Ethernet frame banane ke liye laptop ko gateway ka MAC chahiye. Woh ek <b>ARP</b> (Address Resolution Protocol) request broadcast karta hai, "192.168.1.1 kiske paas hai?", aur router apne MAC ke saath reply karta hai. Laptop use apne <b>ARP cache</b> mein store karta hai. (Sach kahein to ARP step 1 ki DNS query se pehle bhi hua tha, kyunki DNS server bhi remote hai; pehli baar ke baad answer cache ho jaata hai.)</li>
<li><b>TCP three-way handshake.</b> Laptop 203.0.113.80 port 443 se reliable connection kholta hai: <b>SYN</b>, server jawab deta hai <b>SYN-ACK</b>, laptop bhejta hai <b>ACK</b>.</li>
<li><b>Secure session.</b> Browser aur server encryption keys par sehmat hote hain (TLS), taaki raaste mein koi page padh na sake.</li>
<li><b>Request aur page.</b> Browser ek HTTP request bhejta hai ("home page GET karo"); server page wapas deta hai, aksar uske baad images aur scripts ke liye aur requests aati hain.</li>
<li><b>Raaste ke har router par</b>, frame hataya jaata hai, router destination IP dekhta hai, <b>TTL</b> (time to live) 1 se kam karta hai, aur agle link ke liye naye source aur destination MACs ke saath <b>naya frame</b> banata hai. IP addresses end to end same rehte hain (siwaye jahan NAT unhe badalta hai, jaise Asha ke home router par).</li>
</ol>
<p>Step 3 aap apne PC par <code>arp -a</code> se dekh sakte ho:</p>
<pre class="out">Interface: 192.168.1.23 --- 0xc
  Internet Address      Physical Address      Type
  <span class="hl">192.168.1.1           a4-91-b1-3e-00-01     dynamic</span>
  192.168.1.255         ff-ff-ff-ff-ff-ff     static</pre>

<div class="eg"><p><b>Worked example: har hop par kya badalta hai.</b> Asha ka frame uske router tak: source MAC 3c52.821a.2b3c, destination MAC a491.b13e.0001, source IP 192.168.1.23, destination IP 203.0.113.80. NAT ke baad, ISP link par: naya source MAC (router ka outside port), naya destination MAC (ISP router), source IP 198.51.100.24, destination IP ab bhi 203.0.113.80. MACs har hop par badalte hain; destination IP kabhi nahi.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> Sochna ki PC remote server ke MAC ke liye ARP karta hai. Woh kabhi nahi karta: PC sirf apne network ke addresses ke liye ARP karta hai. Kisi bhi remote cheez ke liye woh default gateway ke liye ARP karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> PDUs ko layers se match karo: segment = Layer 4, packet = Layer 3, frame = Layer 2, bits = Layer 1. Routers har hop par Layer 2 header dobara likhte hain lekin Layer 3 destination same rakhte hain. TCP handshake order: SYN, SYN-ACK, ACK.</p></div>

<div class="scn"><h4>Local printer chalta hai, internet nahi</h4><p>Ek naya PC printer 192.168.1.50 par print kar sakta tha aur file server 192.168.1.10 tak pahunch sakta tha, lekin koi website nahi khulti thi aur <code>ping 203.0.113.80</code> "transmit failed" kehta tha. Engineer ne <code>ipconfig</code> chalaya: IP 192.168.1.40 aur mask 255.255.255.0 sahi the, lekin <b>Default Gateway</b> line khaali thi. Ek technician ne static address type kiya tha aur gateway field chhod diya tha. PC ne step 2 mein sahi decide kiya ki server remote hai, lekin uske paas packet dene ke liye koi router nahi tha. Gateway 192.168.1.1 add karte hi problem turant theek ho gayi.</p><p><b>Seekh:</b> local traffic ko sirf sahi IP aur mask chahiye; kisi bhi remote cheez ko sahi default gateway bhi chahiye.</p></div>

<div class="iv"><p class="q">"Encapsulation explain karo, aur batao ki packet routers cross karta hai to kya badalta hai aur kya same rehta hai."</p><p>Strong answer: data stack mein neeche jaate hue har layer apna header jodti hai: data, phir ports ke saath TCP ya UDP segment, phir source aur destination IP ke saath IP packet, phir MACs aur FCS trailer ke saath Ethernet frame, phir bits. Har router par frame hataya jaata hai, router destination IP par route karta hai, TTL kam karta hai aur agle link ke liye naye MACs ke saath naya frame banata hai. IP addresses end to end same rehte hain jab tak NAT unhe na badle. Gateway ke liye ARP ke saath ek real example walk through karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSI mein 7 layers; TCP/IP mein 4 (ya 5). Yaad rakho "Please Do Not Throw Sausage Pizza Away".</li>
<li>Neeche jaate hue encapsulation headers jodta hai; upar jaate hue de-encapsulation unhe hataata hai.</li>
<li>PDUs: data, segment (L4), packet (L3), frame (L2), bits (L1).</li>
<li>Web page load: DNS, local-ya-remote check, gateway ke liye ARP, TCP handshake, TLS, request aur response.</li>
<li>Har router hop par MACs badalte hain; destination IP nahi; TTL 1 se ghat-ta hai.</li>
</ul></div>
`}};export{e as default};