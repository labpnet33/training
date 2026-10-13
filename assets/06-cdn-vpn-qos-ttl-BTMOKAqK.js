var e={id:`functions`,h:{en:`Applications and functions: CDN, VPN, QoS and TTL`,hi:`Applications aur functions: CDN, VPN, QoS aur TTL`},body:{en:`
<p>The second half of objective 1.2 is not about boxes but about <b>services and functions</b> that run across the network: a content delivery network, virtual private networks, quality of service and time to live. Each one solves a specific business problem, and exam questions describe the problem and ask you to name the function.</p>

<h3>CDN: content delivery network</h3>
<p>Imagine a popular sweet shop in Old Delhi. If every customer in India had to travel to that one shop, queues would be endless. So the shop opens branches in every city, stocked with its most popular items. A <b>CDN</b> does the same for web content. A provider runs many <b>edge servers</b> in <b>points of presence (PoPs)</b> around the world. Static content (images, video segments, scripts, software downloads) from your <b>origin</b> server is cached on those edges. When a user requests it, DNS or <b>anycast</b> routing sends them to the nearest PoP.</p>
<p>Benefits: lower <b>latency</b> for users, much less load and bandwidth on the origin, better availability (other PoPs take over if one fails) and absorption of <b>DDoS</b> floods across a huge distributed capacity. Each cached object has a <b>cache TTL</b> that says how long the edge may serve it before checking the origin again.</p>

<h3>VPN: virtual private network</h3>
<p>A <b>VPN</b> builds a private, encrypted <b>tunnel</b> across an untrusted network such as the internet. The original packet is encapsulated inside a new, encrypted packet, which is why VPNs reduce the MTU (chapter 4).</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Site-to-site and client-to-site VPN">
<rect x="10" y="20" width="130" height="40" rx="6" fill="#bae6fd"/><text x="75" y="45" text-anchor="middle" class="svg-ink" font-size="13">Branch LAN</text>
<rect x="160" y="20" width="90" height="40" rx="6" fill="#fde68a"/><text x="205" y="45" text-anchor="middle" class="svg-ink" font-size="13">Router</text>
<rect x="270" y="20" width="100" height="40" rx="20" fill="#e2e8f0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<rect x="390" y="20" width="90" height="40" rx="6" fill="#fde68a"/><text x="435" y="45" text-anchor="middle" class="svg-ink" font-size="13">Firewall</text>
<rect x="500" y="20" width="130" height="40" rx="6" fill="#bbf7d0"/><text x="565" y="45" text-anchor="middle" class="svg-ink" font-size="13">HQ LAN</text>
<line x1="205" y1="72" x2="435" y2="72" stroke="#64748b" stroke-width="3" stroke-dasharray="8 4"/><text x="320" y="92" text-anchor="middle" class="svg-accent" font-size="12">Site-to-site IPsec tunnel, always on</text>
<rect x="10" y="130" width="130" height="40" rx="6" fill="#ddd6fe"/><text x="75" y="155" text-anchor="middle" class="svg-ink" font-size="13">Laptop + client</text>
<rect x="270" y="130" width="100" height="40" rx="20" fill="#e2e8f0"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<rect x="390" y="130" width="90" height="40" rx="6" fill="#fde68a"/><text x="435" y="155" text-anchor="middle" class="svg-ink" font-size="12">VPN gateway</text>
<rect x="500" y="130" width="130" height="40" rx="6" fill="#bbf7d0"/><text x="565" y="155" text-anchor="middle" class="svg-ink" font-size="13">HQ LAN</text>
<line x1="75" y1="182" x2="435" y2="182" stroke="#64748b" stroke-width="3" stroke-dasharray="8 4"/><text x="255" y="204" text-anchor="middle" class="svg-accent" font-size="12">Client-to-site: full tunnel or split tunnel</text>
</svg><p class="cap">Site-to-site joins networks through gateways; users do nothing. Client-to-site (remote access) connects one device with software or a browser.</p></div>

<ul>
<li><b>Site-to-site VPN:</b> two gateways (routers or firewalls) build a permanent IPsec tunnel between two networks. Hosts are unaware of it; to them it is just a route.</li>
<li><b>Client-to-site (remote access) VPN:</b> a single user's device runs a VPN client and connects to a VPN gateway, using IPsec or an SSL/TLS VPN (often over TCP or UDP 443).</li>
<li><b>Clientless VPN:</b> the user opens a TLS-protected web portal in a browser and reaches specific internal web apps without installing a client.</li>
<li><b>Full tunnel versus split tunnel:</b> in a full tunnel, <b>all</b> the user's traffic, including internet browsing, goes through the VPN to head office, where it can be inspected. In a split tunnel, only traffic for corporate networks uses the VPN and internet traffic goes directly out of the user's local connection. Full tunnel = more control and security; split tunnel = less load on the head-office link and better performance for cloud apps.</li>
</ul>

<h3>QoS: quality of service</h3>
<p>When a link is <b>congested</b>, packets wait in a queue, and some are dropped. A file download does not mind a short wait; a voice call does. <b>QoS</b> gives different traffic different treatment. Voice needs roughly less than 150 ms one-way <b>latency</b>, less than 30 ms <b>jitter</b> (variation in delay) and less than 1% <b>loss</b>. QoS works in steps:</p>
<ol>
<li><b>Classify</b> traffic (by port, application, VLAN or existing marking).</li>
<li><b>Mark</b> it: at Layer 3 with <b>DSCP</b> in the IP header (voice is usually <b>EF</b>, value 46), at Layer 2 with the 802.1Q <b>CoS</b> bits (voice usually 5).</li>
<li><b>Queue</b> it: a priority queue for voice, fair queues for the rest.</li>
<li><b>Police or shape</b>: policing drops or re-marks traffic above a rate; shaping buffers it and sends it later, smoothing bursts.</li>
</ol>
<p>The point where the network starts trusting markings (usually the access port or IP phone) is the <b>trust boundary</b>.</p>
<pre class="code"><span class="c">! Give voice a priority queue on a congested WAN link</span>
class-map match-any VOICE
 match dscp ef
policy-map WAN-OUT
 class VOICE
  priority percent 30
 class class-default
  fair-queue
interface GigabitEthernet0/1
 service-policy output WAN-OUT</pre>
<pre class="out">R1# show policy-map interface GigabitEthernet0/1
 GigabitEthernet0/1
  Service-policy output: WAN-OUT
    Class-map: VOICE (match-any)
      18230 packets, 3646000 bytes
      <span class="hl">Match: dscp ef (46)</span>
      <span class="hl">Priority: 30% (300000 kbps), burst bytes 7500000, b/w exceed drops: 0</span>
    Class-map: class-default (match-any)
      Match: any
      Queueing
      Flow Based Fair Queueing</pre>
<p>Packets are matching the VOICE class and no priority traffic was dropped. QoS never creates bandwidth; it decides who suffers during congestion.</p>

<h3>TTL: time to live</h3>
<p>TTL appears in two places, and the exam can use either.</p>
<ul>
<li><b>IP TTL</b> (IPv6 calls it <b>hop limit</b>): an 8-bit field in the IP header, set by the sender (commonly 64 or 128, up to 255) and decremented by one at each router. At 0 the packet is dropped and the router sends back <b>ICMP Time Exceeded</b>. This stops packets looping forever. <b>Traceroute</b> exploits it: it sends probes with TTL 1, 2, 3 and so on, and each router that sends back Time Exceeded reveals itself as a hop.</li>
<li><b>DNS and cache TTL</b>: the number of seconds a resolver or CDN edge may keep a record or object before asking again. A long TTL means fewer queries but slower change; a short TTL means changes spread quickly.</li>
</ul>
<pre class="out">R1# traceroute 203.0.113.80
Type escape sequence to abort.
Tracing the route to 203.0.113.80
  1 198.51.100.1 1 msec 1 msec 1 msec
  2 192.0.2.9 4 msec 3 msec 4 msec
  <span class="hl">3 203.0.113.80 5 msec 5 msec 4 msec</span></pre>

<div class="eg"><p><b>Worked example.</b> A company plans to move its website from 203.0.113.80 to 198.51.100.25 on Saturday. The A record has a TTL of 86400 seconds (24 hours). On Friday morning they lower it to 300 seconds. By Saturday every resolver has the short TTL, so after the change users move to the new server within 5 minutes instead of up to a day.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Thinking QoS makes a link faster. It only prioritises. Marking traffic but forgetting to apply a queueing policy on the congested interface, so nothing changes. Choosing split tunnel for a company that must inspect all user internet traffic.</p></div>

<div class="exam"><p><b>Exam traps.</b> Content cached close to users = CDN. All traffic through head office = full tunnel. DSCP = Layer 3 marking; CoS = Layer 2 marking. Policing drops, shaping delays. TTL expiry produces ICMP Time Exceeded, which traceroute depends on. A DNS record's TTL controls how long it is cached.</p></div>

<div class="scn"><h4>The migration that took a day</h4><p>An e-commerce team moved their storefront to a new hosting provider and updated the DNS A record at 22:00. Half of their customers kept reaching the old, now empty, server until the next evening, and orders were lost. The record had a TTL of 86400 seconds, so resolvers across the country served the cached old address for up to 24 hours. For the next migration they lowered the TTL to 300 seconds two days in advance and kept the old server redirecting until traffic stopped.</p><p><b>Lesson:</b> TTL is a function you plan with, not a number you ignore.</p></div>

<div class="iv"><p class="q">"Users complain voice calls break up when someone uploads large files over the WAN. What would you do?"</p><p>Strong answer: this is congestion, so apply QoS. Classify voice (RTP and SIP), mark it DSCP EF at the trust boundary (IP phone or access switch), and on the WAN egress interface give EF a strict priority queue with a limit, with fair queueing for everything else; shape to the provider's contracted rate if the physical port is faster. Verify with show policy-map interface and call quality metrics (latency, jitter, loss). Mention that QoS does not add bandwidth; if the link is always full, upgrade it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A CDN caches content at edge PoPs near users, reducing latency and origin load and absorbing DDoS.</li>
<li>VPN types: site-to-site, client-to-site, clientless; full tunnel sends everything to HQ, split tunnel only corporate traffic.</li>
<li>QoS = classify, mark (DSCP EF 46, CoS 5), queue, police or shape; it manages congestion, not capacity.</li>
<li>IP TTL stops loops and powers traceroute; DNS/cache TTL controls how long answers are cached.</li>
</ul></div>
`,hi:`
<p>Objective 1.2 ka doosra hissa boxes ke baare mein nahi balki network ke paar chalne wali <b>services aur functions</b> ke baare mein hai: content delivery network, virtual private networks, quality of service aur time to live. Har ek ek specific business problem solve karta hai, aur exam ke sawaal problem batate hain aur aapse function ka naam poochte hain.</p>

<h3>CDN: content delivery network</h3>
<p>Purani Delhi ki ek mashhoor mithai ki dukaan socho. Agar poore India ke har customer ko usi ek dukaan tak jaana pade, to queues kabhi khatam nahi hongi. Isliye dukaan har sheher mein branch kholti hai, apne sabse popular items ke saath. <b>CDN</b> web content ke liye yahi karta hai. Provider duniya bhar ke <b>points of presence (PoPs)</b> mein bahut saare <b>edge servers</b> chalata hai. Aapke <b>origin</b> server ka static content (images, video segments, scripts, software downloads) un edges par cache hota hai. Jab user use maangta hai, DNS ya <b>anycast</b> routing use sabse nazdeek PoP par bhejti hai.</p>
<p>Fayde: users ke liye kam <b>latency</b>, origin par bahut kam load aur bandwidth, behtar availability (ek PoP fail ho to doosre sambhal lete hain) aur bahut badi distributed capacity mein <b>DDoS</b> floods ko jhel lena. Har cached object ka ek <b>cache TTL</b> hota hai jo batata hai ki edge origin se dobara check karne se pehle use kitni der serve kar sakta hai.</p>

<h3>VPN: virtual private network</h3>
<p><b>VPN</b> internet jaise untrusted network ke paar ek private, encrypted <b>tunnel</b> banata hai. Original packet ek naye, encrypted packet ke andar encapsulate hota hai, isiliye VPNs MTU kam karte hain (chapter 4).</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Site-to-site aur client-to-site VPN">
<rect x="10" y="20" width="130" height="40" rx="6" fill="#bae6fd"/><text x="75" y="45" text-anchor="middle" class="svg-ink" font-size="13">Branch LAN</text>
<rect x="160" y="20" width="90" height="40" rx="6" fill="#fde68a"/><text x="205" y="45" text-anchor="middle" class="svg-ink" font-size="13">Router</text>
<rect x="270" y="20" width="100" height="40" rx="20" fill="#e2e8f0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<rect x="390" y="20" width="90" height="40" rx="6" fill="#fde68a"/><text x="435" y="45" text-anchor="middle" class="svg-ink" font-size="13">Firewall</text>
<rect x="500" y="20" width="130" height="40" rx="6" fill="#bbf7d0"/><text x="565" y="45" text-anchor="middle" class="svg-ink" font-size="13">HQ LAN</text>
<line x1="205" y1="72" x2="435" y2="72" stroke="#64748b" stroke-width="3" stroke-dasharray="8 4"/><text x="320" y="92" text-anchor="middle" class="svg-accent" font-size="12">Site-to-site IPsec tunnel, hamesha on</text>
<rect x="10" y="130" width="130" height="40" rx="6" fill="#ddd6fe"/><text x="75" y="155" text-anchor="middle" class="svg-ink" font-size="13">Laptop + client</text>
<rect x="270" y="130" width="100" height="40" rx="20" fill="#e2e8f0"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<rect x="390" y="130" width="90" height="40" rx="6" fill="#fde68a"/><text x="435" y="155" text-anchor="middle" class="svg-ink" font-size="12">VPN gateway</text>
<rect x="500" y="130" width="130" height="40" rx="6" fill="#bbf7d0"/><text x="565" y="155" text-anchor="middle" class="svg-ink" font-size="13">HQ LAN</text>
<line x1="75" y1="182" x2="435" y2="182" stroke="#64748b" stroke-width="3" stroke-dasharray="8 4"/><text x="255" y="204" text-anchor="middle" class="svg-accent" font-size="12">Client-to-site: full tunnel ya split tunnel</text>
</svg><p class="cap">Site-to-site gateways ke through networks jodta hai; users kuch nahi karte. Client-to-site (remote access) software ya browser se ek device jodta hai.</p></div>

<ul>
<li><b>Site-to-site VPN:</b> do gateways (routers ya firewalls) do networks ke beech permanent IPsec tunnel banate hain. Hosts ko iska pata nahi hota; unke liye yeh bas ek route hai.</li>
<li><b>Client-to-site (remote access) VPN:</b> ek user ka device VPN client chalata hai aur VPN gateway se connect karta hai, IPsec ya SSL/TLS VPN use karke (aksar TCP ya UDP 443 par).</li>
<li><b>Clientless VPN:</b> user browser mein TLS-protected web portal kholta hai aur bina client install kiye specific internal web apps tak pahunchta hai.</li>
<li><b>Full tunnel vs split tunnel:</b> full tunnel mein user ka <b>saara</b> traffic, internet browsing samet, VPN se head office jaata hai, jahan use inspect kiya ja sakta hai. Split tunnel mein sirf corporate networks ka traffic VPN use karta hai aur internet traffic user ke local connection se seedha bahar jaata hai. Full tunnel = zyada control aur security; split tunnel = head-office link par kam load aur cloud apps ke liye behtar performance.</li>
</ul>

<h3>QoS: quality of service</h3>
<p>Jab link <b>congested</b> hota hai, packets queue mein intezaar karte hain, aur kuch drop ho jaate hain. File download ko thoda intezaar farak nahi padta; voice call ko padta hai. <b>QoS</b> alag traffic ko alag treatment deta hai. Voice ko lagbhag 150 ms se kam one-way <b>latency</b>, 30 ms se kam <b>jitter</b> (delay mein variation) aur 1% se kam <b>loss</b> chahiye. QoS steps mein kaam karta hai:</p>
<ol>
<li>Traffic ko <b>classify</b> karo (port, application, VLAN ya existing marking se).</li>
<li>Use <b>mark</b> karo: Layer 3 par IP header mein <b>DSCP</b> se (voice aam taur par <b>EF</b>, value 46), Layer 2 par 802.1Q <b>CoS</b> bits se (voice aam taur par 5).</li>
<li>Use <b>queue</b> karo: voice ke liye priority queue, baaki ke liye fair queues.</li>
<li><b>Police ya shape</b> karo: policing rate se upar ke traffic ko drop ya re-mark karta hai; shaping use buffer karke baad mein bhejta hai, bursts ko smooth karta hai.</li>
</ol>
<p>Jis point se network markings par trust karna shuru karta hai (aam taur par access port ya IP phone) use <b>trust boundary</b> kehte hain.</p>
<pre class="code"><span class="c">! Congested WAN link par voice ko priority queue do</span>
class-map match-any VOICE
 match dscp ef
policy-map WAN-OUT
 class VOICE
  priority percent 30
 class class-default
  fair-queue
interface GigabitEthernet0/1
 service-policy output WAN-OUT</pre>
<pre class="out">R1# show policy-map interface GigabitEthernet0/1
 GigabitEthernet0/1
  Service-policy output: WAN-OUT
    Class-map: VOICE (match-any)
      18230 packets, 3646000 bytes
      <span class="hl">Match: dscp ef (46)</span>
      <span class="hl">Priority: 30% (300000 kbps), burst bytes 7500000, b/w exceed drops: 0</span>
    Class-map: class-default (match-any)
      Match: any
      Queueing
      Flow Based Fair Queueing</pre>
<p>Packets VOICE class se match ho rahe hain aur koi priority traffic drop nahi hua. QoS kabhi bandwidth paida nahi karta; woh decide karta hai ki congestion ke dauraan kaun takleef uthayega.</p>

<h3>TTL: time to live</h3>
<p>TTL do jagah aata hai, aur exam dono mein se koi bhi use kar sakta hai.</p>
<ul>
<li><b>IP TTL</b> (IPv6 ise <b>hop limit</b> kehta hai): IP header ka 8-bit field, sender set karta hai (aam taur par 64 ya 128, maximum 255) aur har router ise ek kam karta hai. 0 par packet drop hota hai aur router <b>ICMP Time Exceeded</b> wapas bhejta hai. Isse packets hamesha loop mein nahi ghoomte. <b>Traceroute</b> iska fayda uthata hai: woh TTL 1, 2, 3 waghera ke saath probes bhejta hai, aur har router jo Time Exceeded wapas bhejta hai woh ek hop ke roop mein dikh jaata hai.</li>
<li><b>DNS aur cache TTL</b>: seconds ki sankhya jitni der resolver ya CDN edge record ya object ko dobara poochhne se pehle rakh sakta hai. Lamba TTL matlab kam queries lekin dheema change; chhota TTL matlab changes jaldi failte hain.</li>
</ul>
<pre class="out">R1# traceroute 203.0.113.80
Type escape sequence to abort.
Tracing the route to 203.0.113.80
  1 198.51.100.1 1 msec 1 msec 1 msec
  2 192.0.2.9 4 msec 3 msec 4 msec
  <span class="hl">3 203.0.113.80 5 msec 5 msec 4 msec</span></pre>

<div class="eg"><p><b>Worked example.</b> Ek company Saturday ko apni website 203.0.113.80 se 198.51.100.25 par shift karna chahti hai. A record ka TTL 86400 seconds (24 ghante) hai. Friday subah woh ise 300 seconds kar dete hain. Saturday tak har resolver ke paas chhota TTL hai, isliye change ke baad users ek din tak nahi balki 5 minute ke andar naye server par pahunch jaate hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Sochna ki QoS link ko tez banata hai. Woh sirf priority deta hai. Traffic mark karna lekin congested interface par queueing policy lagana bhool jaana, jisse kuch nahi badalta. Aisi company ke liye split tunnel chunna jise users ka saara internet traffic inspect karna zaroori hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Users ke paas cached content = CDN. Saara traffic head office ke through = full tunnel. DSCP = Layer 3 marking; CoS = Layer 2 marking. Policing drop karta hai, shaping delay karta hai. TTL expiry ICMP Time Exceeded paida karti hai, jis par traceroute depend karta hai. DNS record ka TTL control karta hai ki woh kitni der cache rahega.</p></div>

<div class="scn"><h4>Woh migration jo ek din le gayi</h4><p>Ek e-commerce team ne apna storefront naye hosting provider par shift kiya aur raat 22:00 baje DNS A record update kiya. Unke aadhe customers agli shaam tak purane, ab khaali, server par pahunchte rahe, aur orders kho gaye. Record ka TTL 86400 seconds tha, isliye desh bhar ke resolvers 24 ghante tak cached purana address serve karte rahe. Agli migration ke liye unhone do din pehle TTL 300 seconds kiya aur traffic rukne tak purane server ko redirect karte rakha.</p><p><b>Seekh:</b> TTL ek function hai jiske saath aap plan karte ho, ignore karne wala number nahi.</p></div>

<div class="iv"><p class="q">"Users shikayat karte hain ki jab koi WAN par badi files upload karta hai to voice calls toot jaati hain. Aap kya karoge?"</p><p>Strong answer: yeh congestion hai, isliye QoS lagao. Voice (RTP aur SIP) ko classify karo, trust boundary (IP phone ya access switch) par DSCP EF mark karo, aur WAN egress interface par EF ko limit ke saath strict priority queue do, baaki sab ke liye fair queueing; agar physical port tez hai to provider ke contracted rate par shape karo. show policy-map interface aur call quality metrics (latency, jitter, loss) se verify karo. Batao ki QoS bandwidth nahi jodta; agar link hamesha full hai to upgrade karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CDN content ko users ke paas edge PoPs par cache karta hai, latency aur origin load kam karta hai aur DDoS jhelta hai.</li>
<li>VPN types: site-to-site, client-to-site, clientless; full tunnel sab kuch HQ bhejta hai, split tunnel sirf corporate traffic.</li>
<li>QoS = classify, mark (DSCP EF 46, CoS 5), queue, police ya shape; yeh congestion manage karta hai, capacity nahi.</li>
<li>IP TTL loops rokta hai aur traceroute chalata hai; DNS/cache TTL control karta hai ki answers kitni der cache rahein.</li>
</ul></div>
`}};export{e as default};