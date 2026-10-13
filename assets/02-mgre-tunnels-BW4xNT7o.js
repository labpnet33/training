var e={id:`mgre-tunnels`,h:{en:`From GRE to multipoint GRE`,hi:`GRE se multipoint GRE tak`},body:{en:`
<p>Think of a normal GRE tunnel as a <b>private phone line</b> between two offices: it rings only one number, fixed at installation. A multipoint GRE tunnel is more like a <b>mobile phone</b>: one handset that can call any number, as long as you can look the number up in a directory. The handset is mGRE; the directory is NHRP, which you meet in the next chapter.</p>

<h3>Quick recap: point-to-point GRE</h3>
<p>Generic Routing Encapsulation (IP protocol 47) wraps an inner packet in a new outer IP header plus a 4-byte GRE header. A point-to-point tunnel has a <code>tunnel source</code> and a <code>tunnel destination</code>. Everything routed into that interface goes to that one destination. The router needs no lookup; the destination is part of the interface.</p>

<h3>Multipoint GRE: one interface, many destinations</h3>
<p>With <code>tunnel mode gre multipoint</code> the interface keeps a tunnel source but has <b>no tunnel destination</b>. The interface is a <b>non-broadcast multi-access (NBMA)</b> network, like Frame Relay was: many routers share one subnet (172.16.100.0/24 in our lab), but there is no broadcast medium underneath. When a packet is routed out of Tunnel0, the router looks at the <b>next-hop tunnel address</b> of the route (for example 172.16.100.3) and asks: "which public address owns 172.16.100.3?" That answer comes from the NHRP table. If there is no entry, the packet cannot be encapsulated and is dropped (or, in DMVPN, sent to the hub while NHRP resolves the address).</p>

<dl class="terms">
<dt>Tunnel (overlay) address</dt><dd>The IP on the tunnel interface, such as 172.16.100.2. Routing protocols use it as next hop. NHRP calls it the <b>protocol address</b>.</dd>
<dt>NBMA (underlay) address</dt><dd>The real, routable address the tunnel is sourced from, such as 100.64.20.2 on Gi0/0. It goes into the outer IP header.</dd>
<dt>Tunnel key</dt><dd>An optional 32-bit value in the GRE header (<code>tunnel key 100</code>). Both ends must use the same key. It lets a router tell apart two mGRE interfaces that share the same tunnel source.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="mGRE encapsulation of a PC1 to PC2 packet">
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">PC1 to PC2 packet leaving SPOKE1 Tunnel0</text>
<rect x="20" y="40" width="190" height="56" rx="6" fill="#bae6fd"/><text x="115" y="62" text-anchor="middle" class="svg-ink" font-size="13">Outer IP (20 B)</text><text x="115" y="82" text-anchor="middle" class="svg-muted" font-size="12">100.64.20.2 to 100.64.30.2</text>
<rect x="215" y="40" width="120" height="56" rx="6" fill="#fde68a"/><text x="275" y="62" text-anchor="middle" class="svg-ink" font-size="13">GRE (4 B)</text><text x="275" y="82" text-anchor="middle" class="svg-muted" font-size="12">+4 B with key</text>
<rect x="340" y="40" width="190" height="56" rx="6" fill="#bbf7d0"/><text x="435" y="62" text-anchor="middle" class="svg-ink" font-size="13">Inner IP</text><text x="435" y="82" text-anchor="middle" class="svg-muted" font-size="12">10.2.2.10 to 10.3.3.10</text>
<rect x="535" y="40" width="85" height="56" rx="6" fill="#e2e8f0"/><text x="577" y="72" text-anchor="middle" class="svg-ink" font-size="13">Data</text>
<text x="115" y="125" text-anchor="middle" class="svg-accent" font-size="12">from NHRP table</text>
<line x1="115" y1="98" x2="115" y2="112" stroke="#64748b" stroke-width="1.5"/>
<text x="435" y="125" text-anchor="middle" class="svg-accent" font-size="12">routed via next hop 172.16.100.3</text>
<line x1="435" y1="98" x2="435" y2="112" stroke="#64748b" stroke-width="1.5"/>
<rect x="120" y="148" width="400" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="168" text-anchor="middle" class="svg-ink" font-size="12">NHRP: 172.16.100.3 is at NBMA 100.64.30.2</text><text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">next hop (overlay) mapped to outer destination (underlay)</text>
</svg><p class="cap">The route gives the overlay next hop; NHRP turns it into the outer destination address.</p></div>

<h3>Configuration walkthrough</h3>
<p>The minimum mGRE interface on the hub looks like this. NHRP lines are added in chapter 4; on their own these lines only build the empty "handset".</p>
<pre class="code"><span class="c">! HUB: multipoint GRE, no destination</span>
interface Tunnel0
 description DMVPN hub
 ip address 172.16.100.1 255.255.255.0
 no ip redirects
 tunnel source GigabitEthernet0/0
 tunnel mode gre multipoint
<span class="c">! optional: only if both ends are configured with it</span>
<span class="c">! tunnel key 100</span></pre>
<p><code>no ip redirects</code> disables ICMP redirects on the tunnel; routers in the same subnet would otherwise tell each other to use a "better" next hop they cannot actually reach directly. It is part of every Cisco DMVPN template. Do not confuse it with <code>ip nhrp redirect</code>, the phase 3 feature.</p>

<pre class="out">HUB# show interfaces Tunnel0
<span class="hl">Tunnel0 is up, line protocol is up</span>
  Hardware is Tunnel
  Description: DMVPN hub
  Internet address is 172.16.100.1/24
  MTU 17912 bytes, BW 100 Kbit/sec, DLY 50000 usec,
  Encapsulation TUNNEL, loopback not set
  Keepalive not set
  Tunnel linestate evaluation up
  Tunnel source 100.64.10.2 (GigabitEthernet0/0)
<span class="hl">  Tunnel protocol/transport multi-GRE/IP</span>
    Key disabled, sequencing disabled
    Checksumming of packets disabled
  Tunnel TTL 255, Fast tunneling enabled
  Tunnel transport MTU 1476 bytes</pre>
<p>Notice three things. The line protocol is up as soon as the source interface is up, because there is no destination to check. The transport is <b>multi-GRE/IP</b>. And the default bandwidth is 100 kbit/s, which makes the OSPF cost of a tunnel 1000 and the EIGRP metric very high; many designs set <code>bandwidth</code> on the tunnel to match the real circuit.</p>

<div class="eg"><p><b>Worked example.</b> Why does the transport MTU say 1476? The Gi0/0 MTU is 1500; the outer IP header takes 20 bytes and the GRE header 4, leaving 1476 bytes for the inner packet. Add <code>tunnel key 100</code> and GRE grows to 8 bytes, so 1472 is left. Add IPsec and it drops further, which is why chapter 11 sets <code>ip mtu 1400</code>.</p></div>

<h3>Which routers use mGRE?</h3>
<ul>
<li><b>Hub:</b> always mGRE, because it must talk to every spoke on one interface.</li>
<li><b>Spokes in phase 1:</b> may use point-to-point GRE with <code>tunnel destination</code> set to the hub NBMA address. They can never build spoke-to-spoke tunnels.</li>
<li><b>Spokes in phase 2 and 3:</b> must use mGRE, so they can send to any other spoke's NBMA address on demand.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Configuring <code>tunnel destination</code> on an mGRE interface, or leaving a spoke in point-to-point mode and wondering why phase 2 never builds a spoke-to-spoke tunnel. Also, GRE keepalives (<code>keepalive 10 3</code>) are not supported on mGRE; DMVPN relies on NHRP registration and routing protocol hellos to detect a dead peer.</p></div>

<div class="exam"><p><b>Exam trap.</b> "The tunnel is up/up, so the spoke must be connected" is false for mGRE. Up/up only means the source interface is up. Registration (<code>show ip nhrp nhs</code>) and routing adjacency are the real health checks. Also: the tunnel key must match on all routers of the cloud; a mismatch silently drops GRE packets.</p></div>

<div class="scn"><h4>Two clouds, one source, no key</h4><p>A bank added a second DMVPN cloud (Tunnel1) on the same hub, sourced from the same Gi0/0 as Tunnel0. Spokes of the new cloud registered sometimes, and sometimes their NHRP packets were processed by Tunnel0 and dropped. With two mGRE tunnels on one source, the hub could not tell which interface an incoming GRE packet belonged to. Adding <code>tunnel key 100</code> to cloud 1 and <code>tunnel key 200</code> to cloud 2 on every router (and later <code>tunnel protection ... shared</code> for IPsec) fixed it.</p><p><b>Lesson:</b> one mGRE tunnel per source needs no key; several on the same source need unique keys.</p></div>

<div class="iv"><p class="q">"What is the difference between a GRE and an mGRE tunnel interface?"</p><p>Strong answer: a point-to-point GRE tunnel has a fixed destination and connects exactly two routers. An mGRE tunnel has only a source; it is an NBMA interface where the outer destination is chosen per packet from the NHRP mapping of the next-hop tunnel address. Mention that the hub is always mGRE, spokes need mGRE for spoke-to-spoke (phase 2/3), and that mGRE does not support GRE keepalives.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>tunnel mode gre multipoint</code> = tunnel source, no destination, NBMA behaviour.</li>
<li>The route's next hop is a tunnel address; NHRP maps it to the NBMA address used in the outer header.</li>
<li>Tunnel keys must match and are needed when several mGRE tunnels share one source.</li>
<li>GRE overhead is 24 bytes (28 with a key); the tunnel default bandwidth is 100 kbit/s.</li>
<li>Hub always mGRE; phase 2/3 spokes must be mGRE; phase 1 spokes may be point-to-point.</li>
</ul></div>
`,hi:`
<p>Normal GRE tunnel ko do offices ke beech ek <b>private phone line</b> samjho: yeh sirf ek number par ring karti hai, jo installation ke waqt fix hota hai. Multipoint GRE tunnel ek <b>mobile phone</b> jaisa hai: ek handset jo koi bhi number call kar sakta hai, bas number directory mein dhoondna aana chahiye. Handset mGRE hai; directory NHRP hai, jisse aap agle chapter mein miloge.</p>

<h3>Quick recap: point-to-point GRE</h3>
<p>Generic Routing Encapsulation (IP protocol 47) andar ke packet ko ek naye outer IP header aur 4-byte GRE header mein wrap karta hai. Point-to-point tunnel ka ek <code>tunnel source</code> aur ek <code>tunnel destination</code> hota hai. Us interface mein route hua sab kuch usi ek destination par jaata hai. Router ko koi lookup nahi karna padta; destination interface ka hi hissa hai.</p>

<h3>Multipoint GRE: ek interface, kai destinations</h3>
<p><code>tunnel mode gre multipoint</code> ke saath interface tunnel source rakhta hai lekin uska <b>koi tunnel destination nahi</b> hota. Interface ek <b>non-broadcast multi-access (NBMA)</b> network hai, jaise Frame Relay tha: kai routers ek subnet share karte hain (hamari lab mein 172.16.100.0/24), lekin neeche koi broadcast medium nahi hai. Jab packet Tunnel0 se route hota hai, router route ka <b>next-hop tunnel address</b> dekhta hai (jaise 172.16.100.3) aur poochta hai: "172.16.100.3 kis public address ka hai?" Yeh jawab NHRP table se aata hai. Agar entry nahi hai, to packet encapsulate nahi ho sakta aur drop ho jaata hai (ya DMVPN mein, jab tak NHRP address resolve kare, hub ko bhej diya jaata hai).</p>

<dl class="terms">
<dt>Tunnel (overlay) address</dt><dd>Tunnel interface ka IP, jaise 172.16.100.2. Routing protocols ise next hop ki tarah use karte hain. NHRP ise <b>protocol address</b> kehta hai.</dd>
<dt>NBMA (underlay) address</dt><dd>Asli, routable address jisse tunnel source hota hai, jaise Gi0/0 par 100.64.20.2. Yeh outer IP header mein jaata hai.</dd>
<dt>Tunnel key</dt><dd>GRE header mein ek optional 32-bit value (<code>tunnel key 100</code>). Dono ends par same key honi chahiye. Isse router same tunnel source share karne wale do mGRE interfaces mein fark kar paata hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="PC1 se PC2 packet ka mGRE encapsulation">
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">SPOKE1 Tunnel0 se nikalta PC1 se PC2 packet</text>
<rect x="20" y="40" width="190" height="56" rx="6" fill="#bae6fd"/><text x="115" y="62" text-anchor="middle" class="svg-ink" font-size="13">Outer IP (20 B)</text><text x="115" y="82" text-anchor="middle" class="svg-muted" font-size="12">100.64.20.2 se 100.64.30.2</text>
<rect x="215" y="40" width="120" height="56" rx="6" fill="#fde68a"/><text x="275" y="62" text-anchor="middle" class="svg-ink" font-size="13">GRE (4 B)</text><text x="275" y="82" text-anchor="middle" class="svg-muted" font-size="12">key ke saath +4 B</text>
<rect x="340" y="40" width="190" height="56" rx="6" fill="#bbf7d0"/><text x="435" y="62" text-anchor="middle" class="svg-ink" font-size="13">Inner IP</text><text x="435" y="82" text-anchor="middle" class="svg-muted" font-size="12">10.2.2.10 se 10.3.3.10</text>
<rect x="535" y="40" width="85" height="56" rx="6" fill="#e2e8f0"/><text x="577" y="72" text-anchor="middle" class="svg-ink" font-size="13">Data</text>
<text x="115" y="125" text-anchor="middle" class="svg-accent" font-size="12">NHRP table se</text>
<line x1="115" y1="98" x2="115" y2="112" stroke="#64748b" stroke-width="1.5"/>
<text x="435" y="125" text-anchor="middle" class="svg-accent" font-size="12">next hop 172.16.100.3 se route</text>
<line x1="435" y1="98" x2="435" y2="112" stroke="#64748b" stroke-width="1.5"/>
<rect x="120" y="148" width="400" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="168" text-anchor="middle" class="svg-ink" font-size="12">NHRP: 172.16.100.3 NBMA 100.64.30.2 par hai</text><text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">next hop (overlay) outer destination (underlay) se map</text>
</svg><p class="cap">Route overlay next hop deta hai; NHRP use outer destination address mein badal deta hai.</p></div>

<h3>Configuration walkthrough</h3>
<p>Hub par minimum mGRE interface aisa dikhta hai. NHRP lines chapter 4 mein judti hain; akele yeh lines sirf khaali "handset" banati hain.</p>
<pre class="code"><span class="c">! HUB: multipoint GRE, koi destination nahi</span>
interface Tunnel0
 description DMVPN hub
 ip address 172.16.100.1 255.255.255.0
 no ip redirects
 tunnel source GigabitEthernet0/0
 tunnel mode gre multipoint
<span class="c">! optional: sirf tab jab dono ends par configured ho</span>
<span class="c">! tunnel key 100</span></pre>
<p><code>no ip redirects</code> tunnel par ICMP redirects band karta hai; warna same subnet ke routers ek doosre ko ek "behtar" next hop use karne ko kahenge jahan woh asal mein seedhe pahunch hi nahi sakte. Yeh har Cisco DMVPN template ka hissa hai. Ise <code>ip nhrp redirect</code> se confuse mat karo, jo phase 3 feature hai.</p>

<pre class="out">HUB# show interfaces Tunnel0
<span class="hl">Tunnel0 is up, line protocol is up</span>
  Hardware is Tunnel
  Description: DMVPN hub
  Internet address is 172.16.100.1/24
  MTU 17912 bytes, BW 100 Kbit/sec, DLY 50000 usec,
  Encapsulation TUNNEL, loopback not set
  Keepalive not set
  Tunnel linestate evaluation up
  Tunnel source 100.64.10.2 (GigabitEthernet0/0)
<span class="hl">  Tunnel protocol/transport multi-GRE/IP</span>
    Key disabled, sequencing disabled
    Checksumming of packets disabled
  Tunnel TTL 255, Fast tunneling enabled
  Tunnel transport MTU 1476 bytes</pre>
<p>Teen cheezein notice karo. Source interface up hote hi line protocol up ho jaata hai, kyunki check karne ke liye koi destination nahi hai. Transport <b>multi-GRE/IP</b> hai. Aur default bandwidth 100 kbit/s hai, jisse tunnel ka OSPF cost 1000 aur EIGRP metric bahut zyada ho jaata hai; kai designs tunnel par asli circuit ke hisaab se <code>bandwidth</code> set karte hain.</p>

<div class="eg"><p><b>Worked example.</b> Transport MTU 1476 kyun dikhata hai? Gi0/0 ka MTU 1500 hai; outer IP header 20 bytes aur GRE header 4 bytes leta hai, andar ke packet ke liye 1476 bytes bachte hain. <code>tunnel key 100</code> jodo to GRE 8 bytes ka ho jaata hai, 1472 bachte hain. IPsec jodo to aur kam hota hai, isiliye chapter 11 <code>ip mtu 1400</code> set karta hai.</p></div>

<h3>Kaunse routers mGRE use karte hain?</h3>
<ul>
<li><b>Hub:</b> hamesha mGRE, kyunki use ek interface par har spoke se baat karni hai.</li>
<li><b>Phase 1 mein spokes:</b> point-to-point GRE use kar sakte hain jisme <code>tunnel destination</code> hub ka NBMA address ho. Yeh kabhi spoke-to-spoke tunnels nahi bana sakte.</li>
<li><b>Phase 2 aur 3 mein spokes:</b> mGRE zaroori hai, taaki zaroorat par kisi bhi doosre spoke ke NBMA address par bhej sakein.</li>
</ul>

<div class="warn"><p><b>Common galti.</b> mGRE interface par <code>tunnel destination</code> configure karna, ya spoke ko point-to-point mode mein chhod dena aur phir sochna ki phase 2 kabhi spoke-to-spoke tunnel kyun nahi banata. Aur, GRE keepalives (<code>keepalive 10 3</code>) mGRE par supported nahi hain; dead peer detect karne ke liye DMVPN NHRP registration aur routing protocol hellos par nirbhar karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Tunnel up/up hai, to spoke connected hoga" mGRE ke liye galat hai. Up/up ka matlab sirf itna hai ki source interface up hai. Asli health checks registration (<code>show ip nhrp nhs</code>) aur routing adjacency hain. Aur: cloud ke saare routers par tunnel key match honi chahiye; mismatch GRE packets ko chupchaap drop kar deta hai.</p></div>

<div class="scn"><h4>Do clouds, ek source, koi key nahi</h4><p>Ek bank ne same hub par doosra DMVPN cloud (Tunnel1) joda, Tunnel0 wale same Gi0/0 se source karke. Naye cloud ke spokes kabhi register hote, aur kabhi unke NHRP packets Tunnel0 process karke drop kar deta. Ek source par do mGRE tunnels hone se hub bata nahi paata tha ki aane wala GRE packet kis interface ka hai. Har router par cloud 1 mein <code>tunnel key 100</code> aur cloud 2 mein <code>tunnel key 200</code> jodne se (aur baad mein IPsec ke liye <code>tunnel protection ... shared</code>) problem theek hui.</p><p><b>Seekh:</b> ek source par ek mGRE tunnel ko key nahi chahiye; same source par kai tunnels ko unique keys chahiye.</p></div>

<div class="iv"><p class="q">"GRE aur mGRE tunnel interface mein kya fark hai?"</p><p>Strong answer: point-to-point GRE tunnel ka destination fixed hota hai aur woh exactly do routers jodta hai. mGRE tunnel ka sirf source hota hai; yeh NBMA interface hai jahan outer destination har packet ke liye next-hop tunnel address ki NHRP mapping se chuna jaata hai. Batao ki hub hamesha mGRE hota hai, spokes ko spoke-to-spoke (phase 2/3) ke liye mGRE chahiye, aur mGRE GRE keepalives support nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>tunnel mode gre multipoint</code> = tunnel source, destination nahi, NBMA behaviour.</li>
<li>Route ka next hop tunnel address hai; NHRP use outer header mein use hone wale NBMA address se map karta hai.</li>
<li>Tunnel keys match honi chahiye aur tab zaroori hain jab kai mGRE tunnels ek source share karein.</li>
<li>GRE overhead 24 bytes hai (key ke saath 28); tunnel ki default bandwidth 100 kbit/s hai.</li>
<li>Hub hamesha mGRE; phase 2/3 spokes mGRE hone chahiye; phase 1 spokes point-to-point ho sakte hain.</li>
</ul></div>
`}};export{e as default};