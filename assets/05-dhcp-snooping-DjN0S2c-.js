var e={id:`dhcp-snooping`,h:{en:`Rogue DHCP, DHCP starvation and DHCP snooping`,hi:`Rogue DHCP, DHCP starvation aur DHCP snooping`},body:{en:`
<p>At a busy railway station, travellers ask "which way to platform 4?" and follow whoever answers first. If a stranger in a fake uniform stands closest and answers fastest, travellers follow his directions, perhaps through his friend's shop. A new laptop joining a network behaves exactly like that traveller: it broadcasts a DHCP request and believes the first server that answers. <b>DHCP snooping</b> puts a guard at the information desk who only lets the real staff hand out directions.</p>

<h3>DHCP in one paragraph</h3>
<p>A client with no address broadcasts a <b>Discover</b>. Servers reply with an <b>Offer</b> (an IP address, mask, default gateway, DNS servers and lease time). The client broadcasts a <b>Request</b> for one offer and the server confirms with an <b>Ack</b>. The client normally takes the <b>first</b> offer it receives. Nothing in basic DHCP proves that the server is genuine.</p>

<h3>The attacks at recognition level</h3>
<dl class="terms">
<dt>Rogue DHCP server</dt><dd>An unauthorised server on an access port answers Discovers. If it hands out its own address as the default gateway or DNS server, clients send their traffic through it (a man-in-the-middle position); if it hands out garbage, clients simply lose connectivity. Many rogue servers are accidents: a home router plugged in backwards or a laptop sharing its connection.</dd>
<dt>DHCP starvation</dt><dd>A device sends a flood of Discovers, each with a different client hardware address (<b>chaddr</b>), until the real server's pool is exhausted. Legitimate clients then get no address, and a rogue server has the field to itself. Starvation and rogue DHCP are often combined.</dd>
</dl>
<p><b>What the defender sees:</b> clients with the wrong gateway or subnet (<code>ipconfig</code> shows 10.0.10.66 as gateway instead of 10.0.10.1), a DHCP pool suddenly full, and a burst of Discovers from one port.</p>
<pre class="out">GW# show ip dhcp pool
Pool USERS :
 Utilization mark (high/low)    : 100 / 0
 Total addresses                : 254
<span class="hl"> Leased addresses               : 245</span>
 Pending event                  : none</pre>

<h3>How DHCP snooping works</h3>
<p>Once enabled, every port in the snooped VLANs is <b>untrusted</b> by default. You mark only the ports toward the legitimate server (or its relay path) as <b>trusted</b>. Then:</p>
<ul>
<li><b>Server messages</b> (Offer, Ack, Nak, lease-query replies) arriving on an untrusted port are <b>dropped</b>. A rogue server on an edge port can no longer answer anyone.</li>
<li><b>Client messages</b> on untrusted ports are checked: the frame's source MAC must equal the chaddr inside the DHCP packet (on by default), and a Release or Decline is dropped if it comes from a different port than the binding.</li>
<li>Every successful lease on an untrusted port is written to the <b>DHCP snooping binding table</b>: MAC, IP, lease time, VLAN and interface. DAI and IP Source Guard use this table later.</li>
<li>An optional <b>rate limit</b> (packets per second) on untrusted ports err-disables a port that floods DHCP, blunting starvation.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="DHCP snooping trusted and untrusted ports">
<rect x="240" y="15" width="160" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">GW (real server)</text><text x="320" y="52" text-anchor="middle" class="svg-muted" font-size="12">10.0.10.1</text>
<line x1="320" y1="61" x2="320" y2="105" stroke="#64748b" stroke-width="3"/><text x="330" y="88" class="svg-accent" font-size="12">Gi0/24 trusted: Offer/Ack pass</text>
<rect x="220" y="105" width="200" height="46" rx="8" fill="#bae6fd"/><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="14">ACC2 snooping VLAN 10</text>
<line x1="270" y1="151" x2="150" y2="195" stroke="#64748b" stroke-width="2"/><line x1="370" y1="151" x2="490" y2="195" stroke="#64748b" stroke-width="2"/>
<rect x="70" y="195" width="160" height="44" rx="8" fill="#e2e8f0"/><text x="150" y="215" text-anchor="middle" class="svg-ink" font-size="13">PC1 Gi0/1</text><text x="150" y="231" text-anchor="middle" class="svg-muted" font-size="12">gets real lease</text>
<rect x="410" y="195" width="160" height="44" rx="8" fill="#fed7aa"/><text x="490" y="215" text-anchor="middle" class="svg-ink" font-size="13">ATK Gi0/2</text><text x="490" y="231" text-anchor="middle" class="svg-accent" font-size="12">Offer dropped</text>
</svg><p class="cap">Only the uplink toward GW may carry server messages; offers from an edge port are dropped.</p></div>

<h3>Lab 2 walkthrough, part 1</h3>
<p>On ACC2, GW (the real DHCP server and gateway) is on Gi0/24, PC1 on Gi0/1 and ATK on Gi0/2.</p>
<pre class="code"><span class="c">! task 1: snooping for VLAN 10, trust only the GW uplink</span>
ip dhcp snooping
ip dhcp snooping vlan 10
interface g0/24
 ip dhcp snooping trust
 exit
<span class="c">! optional hardening on edge ports (not graded in the lab)</span>
interface range g0/1 - 2
 ip dhcp snooping limit rate 15
<span class="c">! optional: keep bindings across a reload</span>
ip dhcp snooping database flash:dhcp-snoop.db</pre>
<p>Task 2: on PC1 run <code>ip dhcp</code>. It receives an address from 10.0.10.10 upwards (1 to 9 are excluded on GW) and appears in the binding table. Then run <code>attack rogue-dhcp 10.0.10.66</code> on ATK: its Offers hit an untrusted port and are dropped.</p>
<pre class="out">ACC2# show ip dhcp snooping
<span class="hl">Switch DHCP snooping is enabled</span>
DHCP snooping is configured on following VLANs:
10
DHCP snooping is operational on following VLANs:
10
Insertion of option 82 is enabled
Verification of hwaddr field is enabled
DHCP snooping trust/rate is configured on the following Interfaces:

Interface                  Trusted    Allow option    Rate limit (pps)
-----------------------    -------    ------------    ----------------
<span class="hl">GigabitEthernet0/24        yes        yes             unlimited</span>

ACC2# show ip dhcp snooping binding
MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface
------------------  ---------------  ----------  -------------  ----  --------------------
<span class="hl">00:50:79:00:0A:11   10.0.10.10       86391       dhcp-snooping   10    GigabitEthernet0/1</span>
Total number of bindings: 1</pre>
<pre class="out"><span class="hl">%DHCP_SNOOPING-5-DHCP_SNOOPING_UNTRUSTED_PORT: DHCP_SNOOPING drop message on untrusted port, message type: DHCPOFFER, MAC sa: 00de.ad00.00a2</span></pre>
<p>Only trusted interfaces and interfaces with a rate limit are listed in the trust table; an edge port with no rate limit does not appear at all, which means untrusted.</p>

<h3>Option 82 in one minute</h3>
<p>By default a Catalyst switch running snooping inserts DHCP <b>option 82</b> (relay agent information: which switch and port the client is on) into client requests. That helps a central server, but a router acting as a local IOS DHCP server may drop such packets because they carry option 82 with no relay address. Chapter 12 shows the symptom and the two fixes. Also, a packet that <b>arrives</b> with option 82 on an untrusted port is dropped unless you allow it.</p>

<div class="eg"><p><b>Worked example: rate limit.</b> A normal PC sends 4 DHCP packets to get a lease and a few per day to renew. A limit of 15 packets per second leaves huge headroom for real clients. A starvation tool sending 500 Discovers per second exceeds it in the first second and the port is err-disabled with reason <code>dhcp-rate-limit</code>. Do not rate-limit trusted uplinks at 15: they carry DHCP for the whole VLAN.</p></div>

<div class="warn"><p><b>Common mistake.</b> Typing <code>ip dhcp snooping</code> and forgetting <code>ip dhcp snooping vlan 10</code>. The feature is globally on but operational on no VLAN, so nothing is protected and no bindings are built.</p></div>

<div class="exam"><p><b>Exam trap.</b> The <b>trusted</b> port is the one toward the <b>legitimate server</b>, not toward the clients. Snooping drops <b>server-to-client</b> messages on untrusted ports; client Discovers and Requests are still allowed from edge ports.</p></div>

<div class="scn"><h4>The contractor's travel router</h4><p>Users in a project room received 192.168.8.x addresses and could not reach anything. The helpdesk found gateway 192.168.8.1 on every affected PC. On the access switch, <code>show mac address-table address</code> for that gateway MAC pointed to one desk port, where a contractor had plugged a travel router in with its LAN side facing the wall socket. With DHCP snooping enabled and only the uplink trusted, the same mistake a week later simply produced one syslog line and no user impact.</p><p><b>Lesson:</b> DHCP snooping turns a floor-wide outage into a log message.</p></div>

<div class="iv"><p class="q">"How does DHCP snooping work, and what is in the binding table?"</p><p>Strong answer: snooping classifies ports as trusted or untrusted. Server messages such as Offer and Ack are only accepted on trusted ports, which point toward the real server; on untrusted ports they are dropped, stopping rogue servers. Client messages are validated and rate-limited to fight starvation. Each lease is recorded with MAC, IP, lease time, VLAN and port, and that binding table is what DAI and IP Source Guard use. Mention that you must enable it per VLAN and that option 82 insertion is on by default.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rogue DHCP gives clients a false gateway or DNS; starvation exhausts the real pool; both are recognised by wrong leases and a full pool.</li>
<li>With snooping, all ports are untrusted except the ones you trust toward the real server.</li>
<li>Server messages on untrusted ports are dropped and logged as DHCP_SNOOPING_UNTRUSTED_PORT.</li>
<li>The binding table (MAC, IP, lease, VLAN, port) feeds DAI and IP Source Guard.</li>
<li>Enable it globally and per VLAN; use rate limits on edge ports; watch option 82 with IOS DHCP servers.</li>
</ul></div>
`,hi:`
<p>Ek bheed wale railway station par travellers poochte hain "platform 4 kidhar hai?" aur jo pehle jawab de uske peeche chal dete hain. Agar nakli uniform mein ek ajnabi sabse paas khada ho aur sabse tez jawab de, to travellers uske bataye raaste par chalte hain, shayad uske dost ki dukaan se hokar. Network join karta naya laptop bilkul us traveller jaisa behave karta hai: woh DHCP request broadcast karta hai aur jo server pehle jawab de use maan leta hai. <b>DHCP snooping</b> information desk par ek guard bithata hai jo sirf asli staff ko directions dene deta hai.</p>

<h3>DHCP ek paragraph mein</h3>
<p>Bina address wala client <b>Discover</b> broadcast karta hai. Servers <b>Offer</b> se reply karte hain (IP address, mask, default gateway, DNS servers aur lease time). Client ek offer ke liye <b>Request</b> broadcast karta hai aur server <b>Ack</b> se confirm karta hai. Client normally <b>pehla</b> offer le leta hai jo use milta hai. Basic DHCP mein kuch bhi prove nahi karta ki server asli hai.</p>

<h3>Attacks recognition level par</h3>
<dl class="terms">
<dt>Rogue DHCP server</dt><dd>Access port par ek unauthorised server Discovers ka jawab deta hai. Agar woh apna address default gateway ya DNS server ki tarah deta hai, to clients apna traffic uske through bhejte hain (man-in-the-middle position); agar woh bekaar values deta hai, to clients ki connectivity bas chali jaati hai. Kai rogue servers accidents hote hain: ulta plug kiya hua home router ya apna connection share karta laptop.</dd>
<dt>DHCP starvation</dt><dd>Ek device Discovers ki baadh bhejta hai, har ek alag client hardware address (<b>chaddr</b>) ke saath, jab tak asli server ka pool khatam na ho jaaye. Phir legitimate clients ko address nahi milta, aur rogue server ke liye maidan khaali hota hai. Starvation aur rogue DHCP aksar saath mein hote hain.</dd>
</dl>
<p><b>Defender ko kya dikhta hai:</b> galat gateway ya subnet wale clients (<code>ipconfig</code> gateway 10.0.10.1 ki jagah 10.0.10.66 dikhata hai), achanak bhara hua DHCP pool, aur ek port se Discovers ka burst.</p>
<pre class="out">GW# show ip dhcp pool
Pool USERS :
 Utilization mark (high/low)    : 100 / 0
 Total addresses                : 254
<span class="hl"> Leased addresses               : 245</span>
 Pending event                  : none</pre>

<h3>DHCP snooping kaise kaam karta hai</h3>
<p>Enable hone ke baad, snooped VLANs ka har port default mein <b>untrusted</b> hota hai. Aap sirf legitimate server (ya uske relay path) ki taraf ke ports ko <b>trusted</b> mark karte ho. Phir:</p>
<ul>
<li>Untrusted port par aane wale <b>server messages</b> (Offer, Ack, Nak, lease-query replies) <b>drop</b> hote hain. Edge port par rogue server ab kisi ko jawab nahi de sakta.</li>
<li>Untrusted ports par <b>client messages</b> check hote hain: frame ka source MAC DHCP packet ke andar ke chaddr ke barabar hona chahiye (default mein on), aur Release ya Decline drop hota hai agar woh binding wale port se alag port se aaye.</li>
<li>Untrusted port par har successful lease <b>DHCP snooping binding table</b> mein likhi jaati hai: MAC, IP, lease time, VLAN aur interface. DAI aur IP Source Guard baad mein yahi table use karte hain.</li>
<li>Untrusted ports par optional <b>rate limit</b> (packets per second) DHCP flood karne wale port ko err-disable karta hai, jisse starvation kamzor hota hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="DHCP snooping trusted aur untrusted ports">
<rect x="240" y="15" width="160" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">GW (asli server)</text><text x="320" y="52" text-anchor="middle" class="svg-muted" font-size="12">10.0.10.1</text>
<line x1="320" y1="61" x2="320" y2="105" stroke="#64748b" stroke-width="3"/><text x="330" y="88" class="svg-accent" font-size="12">Gi0/24 trusted: Offer/Ack pass</text>
<rect x="220" y="105" width="200" height="46" rx="8" fill="#bae6fd"/><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="14">ACC2 snooping VLAN 10</text>
<line x1="270" y1="151" x2="150" y2="195" stroke="#64748b" stroke-width="2"/><line x1="370" y1="151" x2="490" y2="195" stroke="#64748b" stroke-width="2"/>
<rect x="70" y="195" width="160" height="44" rx="8" fill="#e2e8f0"/><text x="150" y="215" text-anchor="middle" class="svg-ink" font-size="13">PC1 Gi0/1</text><text x="150" y="231" text-anchor="middle" class="svg-muted" font-size="12">asli lease milti hai</text>
<rect x="410" y="195" width="160" height="44" rx="8" fill="#fed7aa"/><text x="490" y="215" text-anchor="middle" class="svg-ink" font-size="13">ATK Gi0/2</text><text x="490" y="231" text-anchor="middle" class="svg-accent" font-size="12">Offer drop</text>
</svg><p class="cap">Sirf GW ki taraf ka uplink server messages le ja sakta hai; edge port se aaye offers drop hote hain.</p></div>

<h3>Lab 2 walkthrough, part 1</h3>
<p>ACC2 par GW (asli DHCP server aur gateway) Gi0/24 par hai, PC1 Gi0/1 par aur ATK Gi0/2 par.</p>
<pre class="code"><span class="c">! task 1: VLAN 10 ke liye snooping, sirf GW uplink trust</span>
ip dhcp snooping
ip dhcp snooping vlan 10
interface g0/24
 ip dhcp snooping trust
 exit
<span class="c">! edge ports par optional hardening (lab mein graded nahi)</span>
interface range g0/1 - 2
 ip dhcp snooping limit rate 15
<span class="c">! optional: reload ke baad bhi bindings rakho</span>
ip dhcp snooping database flash:dhcp-snoop.db</pre>
<p>Task 2: PC1 par <code>ip dhcp</code> chalao. Use 10.0.10.10 se upar ka address milta hai (GW par 1 se 9 excluded hain) aur woh binding table mein dikhta hai. Phir ATK par <code>attack rogue-dhcp 10.0.10.66</code> chalao: uske Offers untrusted port par aate hain aur drop hote hain.</p>
<pre class="out">ACC2# show ip dhcp snooping
<span class="hl">Switch DHCP snooping is enabled</span>
DHCP snooping is configured on following VLANs:
10
DHCP snooping is operational on following VLANs:
10
Insertion of option 82 is enabled
Verification of hwaddr field is enabled
DHCP snooping trust/rate is configured on the following Interfaces:

Interface                  Trusted    Allow option    Rate limit (pps)
-----------------------    -------    ------------    ----------------
<span class="hl">GigabitEthernet0/24        yes        yes             unlimited</span>

ACC2# show ip dhcp snooping binding
MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface
------------------  ---------------  ----------  -------------  ----  --------------------
<span class="hl">00:50:79:00:0A:11   10.0.10.10       86391       dhcp-snooping   10    GigabitEthernet0/1</span>
Total number of bindings: 1</pre>
<pre class="out"><span class="hl">%DHCP_SNOOPING-5-DHCP_SNOOPING_UNTRUSTED_PORT: DHCP_SNOOPING drop message on untrusted port, message type: DHCPOFFER, MAC sa: 00de.ad00.00a2</span></pre>
<p>Trust table mein sirf trusted interfaces aur rate limit wale interfaces list hote hain; bina rate limit wala edge port dikhta hi nahi, jiska matlab hai untrusted.</p>

<h3>Option 82 ek minute mein</h3>
<p>Default mein snooping chalane wala Catalyst switch client requests mein DHCP <b>option 82</b> (relay agent information: client kis switch aur port par hai) daalta hai. Isse central server ko madad milti hai, par local IOS DHCP server ban kar kaam kar raha router aise packets drop kar sakta hai kyunki unme option 82 hai par relay address nahi. Chapter 12 symptom aur do fixes dikhata hai. Saath hi, jo packet untrusted port par option 82 ke saath <b>aata</b> hai woh drop hota hai jab tak aap allow na karo.</p>

<div class="eg"><p><b>Worked example: rate limit.</b> Normal PC lease lene ke liye 4 DHCP packets bhejta hai aur renew ke liye din mein kuch. 15 packets per second ki limit asli clients ke liye bahut jagah chhodti hai. 500 Discovers per second bhejne wala starvation tool pehle hi second mein ise paar karta hai aur port <code>dhcp-rate-limit</code> reason ke saath err-disable hota hai. Trusted uplinks ko 15 par rate-limit mat karo: woh poore VLAN ka DHCP le jaate hain.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>ip dhcp snooping</code> type karna aur <code>ip dhcp snooping vlan 10</code> bhool jaana. Feature globally on hai par kisi VLAN par operational nahi, isliye kuch protected nahi aur koi bindings nahi banti.</p></div>

<div class="exam"><p><b>Exam trap.</b> <b>Trusted</b> port woh hai jo <b>legitimate server</b> ki taraf hai, clients ki taraf nahi. Snooping untrusted ports par <b>server-to-client</b> messages drop karta hai; client Discovers aur Requests edge ports se ab bhi allowed hain.</p></div>

<div class="scn"><h4>Contractor ka travel router</h4><p>Ek project room ke users ko 192.168.8.x addresses mile aur woh kahin nahi pahunch pa rahe the. Helpdesk ko har affected PC par gateway 192.168.8.1 mila. Access switch par us gateway MAC ke liye <code>show mac address-table address</code> ne ek desk port dikhaya, jahan ek contractor ne travel router lagaya tha jiska LAN side wall socket ki taraf tha. DHCP snooping enable hone aur sirf uplink trusted hone ke baad, ek hafte baad wahi galti bas ek syslog line bani aur users par koi asar nahi hua.</p><p><b>Seekh:</b> DHCP snooping floor-wide outage ko ek log message mein badal deta hai.</p></div>

<div class="iv"><p class="q">"DHCP snooping kaise kaam karta hai, aur binding table mein kya hota hai?"</p><p>Strong answer: snooping ports ko trusted ya untrusted mein baantta hai. Offer aur Ack jaise server messages sirf trusted ports par accept hote hain, jo asli server ki taraf hain; untrusted ports par woh drop hote hain, jisse rogue servers rukte hain. Starvation se ladne ke liye client messages validate aur rate-limit hote hain. Har lease MAC, IP, lease time, VLAN aur port ke saath record hoti hai, aur wahi binding table DAI aur IP Source Guard use karte hain. Batao ki ise per VLAN enable karna padta hai aur option 82 insertion default mein on hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rogue DHCP clients ko nakli gateway ya DNS deta hai; starvation asli pool khatam karta hai; dono galat leases aur bhare pool se pehchaane jaate hain.</li>
<li>Snooping ke saath sab ports untrusted hain, sirf woh chhodkar jo aap asli server ki taraf trust karte ho.</li>
<li>Untrusted ports par server messages drop hote hain aur DHCP_SNOOPING_UNTRUSTED_PORT ki tarah log hote hain.</li>
<li>Binding table (MAC, IP, lease, VLAN, port) DAI aur IP Source Guard ko data deti hai.</li>
<li>Ise globally aur per VLAN enable karo; edge ports par rate limits use karo; IOS DHCP servers ke saath option 82 par dhyaan do.</li>
</ul></div>
`}};export{e as default};