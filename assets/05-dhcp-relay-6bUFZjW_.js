var e={id:`relay`,h:{en:`DHCP relay: ip helper-address and giaddr`,hi:`DHCP relay: ip helper-address aur giaddr`},body:{en:`
<p>Back to the dark room. You shout for help, and everyone in <i>your</i> room hears you. But the reception desk is in another building. Your shout does not travel through walls. What you need is a messenger at the door of your room who hears the shout, writes it on a letter, adds "reply to room 20, please", and posts it to reception. That messenger is the <b>DHCP relay agent</b>.</p>

<h3>Why broadcasts do not cross routers</h3>
<p>A DHCP Discover goes to 255.255.255.255, the <b>limited broadcast</b>. By definition that address means "everyone on this link", and routers never forward it; each router interface is the edge of a broadcast domain. That is a feature: if routers forwarded broadcasts, one busy subnet would flood the whole enterprise.</p>
<p>In our lab, PC3 on the annex (192.168.20.0/24) sends a Discover. SW-ANNEX floods it to R2's Gi0/0. R2 is not a DHCP server, and the real server, R1, is on the other side of the 10.1.12.0/30 link. Without help, the Discover dies at R2 and PC3 ends up with a 169.254 address.</p>
<p>You met this problem in the inter-VLAN routing module, where each VLAN is its own subnet. The fix is the same: either run a DHCP server on every router, or centralise it and <b>relay</b>.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="DHCP relay path from PC3 through R2 to R1">
<rect x="10" y="100" width="90" height="40" rx="8" fill="#bae6fd"/><text x="55" y="125" text-anchor="middle" class="svg-ink" font-size="13">PC3</text>
<rect x="240" y="100" width="100" height="40" rx="8" fill="#bbf7d0"/><text x="290" y="125" text-anchor="middle" class="svg-ink" font-size="13">R2 relay</text>
<rect x="520" y="100" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="575" y="125" text-anchor="middle" class="svg-ink" font-size="13">R1 server</text>
<line x1="100" y1="120" x2="240" y2="120" stroke="#64748b" stroke-width="2"/><line x1="340" y1="120" x2="520" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="170" y="45" text-anchor="middle" class="svg-accent" font-size="12">Discover (broadcast)</text>
<text x="170" y="63" text-anchor="middle" class="svg-muted" font-size="12">0.0.0.0 to 255.255.255.255</text>
<text x="170" y="81" text-anchor="middle" class="svg-muted" font-size="12">UDP 68 to 67</text>
<text x="430" y="45" text-anchor="middle" class="svg-accent" font-size="12">Relayed (unicast)</text>
<text x="430" y="63" text-anchor="middle" class="svg-muted" font-size="12">10.1.12.2 to 10.1.12.1</text>
<text x="430" y="81" text-anchor="middle" class="svg-muted" font-size="12">UDP 67 to 67, giaddr 192.168.20.1</text>
<text x="170" y="170" text-anchor="middle" class="svg-muted" font-size="12">192.168.20.0/24</text>
<text x="430" y="170" text-anchor="middle" class="svg-muted" font-size="12">10.1.12.0/30</text>
<text x="290" y="205" text-anchor="middle" class="svg-ink" font-size="13">Gi0/0: ip helper-address 10.1.12.1</text>
<text x="430" y="235" text-anchor="middle" class="svg-accent" font-size="12">Offer back to giaddr, R2 delivers on LAN</text>
</svg><p class="cap">The relay turns one broadcast into a routed unicast and stamps the client's subnet into giaddr.</p></div>

<h3>What the relay agent does, step by step</h3>
<ol>
<li>PC3 broadcasts a Discover. R2 receives it on <b>Gi0/0</b>, the interface configured with <code>ip helper-address</code>.</li>
<li>R2 writes its receiving interface address, <b>192.168.20.1</b>, into the <b>giaddr</b> field (gateway IP address), unless a relay already filled it. It increments the hop count.</li>
<li>R2 sends the message as a normal <b>unicast</b> to the helper address, 10.1.12.1, with source UDP port 67 and destination UDP port 67. The IP source is R2's outgoing interface address (10.1.12.2).</li>
<li>R1 receives it, sees giaddr 192.168.20.1, and picks the pool whose network contains that address: <b>LAN20</b>. It offers 192.168.20.21.</li>
<li>R1 sends the Offer <b>to the giaddr</b>, 192.168.20.1. So R1 must have a route to 192.168.20.0/24. In the lab it does: <code>ip route 192.168.20.0 255.255.255.0 10.1.12.2</code>.</li>
<li>R2 receives the Offer and delivers it onto the annex LAN to PC3. Request and Ack follow the same path.</li>
</ol>

<h3>Configuration</h3>
<pre class="code"><span class="c">! on R2, on the interface that faces the clients (NOT the uplink)</span>
R2(config)# interface GigabitEthernet0/0
R2(config-if)# ip helper-address 10.1.12.1
R2(config-if)# end</pre>
<p>That is the whole relay configuration. You can add several helpers (for two DHCP servers, for redundancy); the router sends a copy to each. The helper address can be any address of the server that R2 can route to; in the lab it is R1's address on the R1–R2 link.</p>

<h3>Verification</h3>
<pre class="out">R2# show ip interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet address is 192.168.20.1/24
  Broadcast address is 255.255.255.255
  Address determined by setup command
  MTU is 1500 bytes
  <span class="hl">Helper address is 10.1.12.1</span>
  Directed broadcast forwarding is disabled</pre>
<pre class="out">R1# show ip dhcp binding
Bindings from all pools not associated with VRF:
IP address      Client-ID/              Lease expiration        Type       State      Interface
                Hardware address/
                User name
192.168.10.21   0100.5079.6668.00       Oct 01 2026 09:14 AM    Automatic  Active     GigabitEthernet0/0
<span class="hl">192.168.20.21   0100.5079.6668.02       Oct 01 2026 09:15 AM    Automatic  Active     Unknown</span></pre>
<p>A relayed binding shows the interface as <b>Unknown</b>: R1 did not receive that client's broadcast on any of its own interfaces. That is normal.</p>

<h3>Helper forwards more than DHCP</h3>
<p><code>ip helper-address</code> is a generic UDP broadcast forwarder. By default it relays broadcasts for eight UDP services: <b>TFTP (69), DNS (53), Time (37), NetBIOS name service (137), NetBIOS datagram (138), BOOTP/DHCP server (67), BOOTP/DHCP client (68) and TACACS (49)</b>. You can trim the list with <code>no ip forward-protocol udp 37</code>, or add a port with <code>ip forward-protocol udp PORT</code>.</p>

<div class="eg"><p><b>Worked example: the giaddr decision.</b> R1 has LAN10 (192.168.10.0/24) and LAN20 (192.168.20.0/24). A relayed Discover arrives with source 10.1.12.2 and giaddr 192.168.20.1. The source address is ignored for pool selection; 192.168.20.1 falls in LAN20, so the offer is 192.168.20.21 with gateway 192.168.20.1. If R2 had put the helper on Gi0/1 by mistake, it would never see PC3's broadcast at all.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Configuring <code>ip helper-address</code> on the uplink instead of the client-facing interface. (2) A typo in the helper address (10.1.21.1 instead of 10.1.12.1) — this is one of the faults in the troubleshoot lab. (3) No route on the server back to the client subnet, so Offers never return. (4) An ACL on the path blocking UDP 67. (5) <code>no service dhcp</code> on the relay router, which also disables relaying.</p></div>
<div class="exam"><p><b>Exam trap.</b> The relay goes on the interface where the <b>clients</b> are (the router or SVI that is their default gateway). giaddr = the relay's client-facing interface IP, and the server uses it to pick the pool. Relayed traffic is unicast UDP 67 to 67.</p></div>

<div class="scn"><h4>New VLAN, no addresses</h4><p>An engineer added VLAN 30 for a new lab on the core switch, created SVI 192.168.30.1/24, and asked the server team to add a 192.168.30.0/24 scope. Every PC in the lab showed 169.254. The server team saw no Discover at all. The SVI had no <code>ip helper-address</code>; the other SVIs did. After adding the helper, the server saw Discovers, but still no leases: the scope had been created as 192.168.3.0/24. With both fixed, the lab came up.</p><p><b>Lesson:</b> every new client subnet needs two things: a helper on its gateway and a matching scope on the server. Check both sides.</p></div>

<div class="iv"><p class="q">"Why do we need ip helper-address, and how does the server know which pool to use?"</p><p>DHCP Discover is a limited broadcast and routers do not forward broadcasts. The helper on the client-facing interface converts it into a unicast to the server and fills giaddr with that interface's IP. The server matches giaddr to a pool, replies to giaddr, and the relay delivers the reply on the LAN. Mention the return route, the default eight UDP ports, and that relayed bindings show Unknown for the interface.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routers do not forward the 255.255.255.255 broadcast, so remote DHCP needs a relay.</li>
<li><code>ip helper-address SERVER</code> goes on the client-facing interface.</li>
<li>The relay writes giaddr = its client-facing IP; the server picks the pool from giaddr.</li>
<li>The server replies to giaddr, so it needs a route back to the client subnet.</li>
<li>Helper forwards eight UDP services by default, including DHCP, DNS and TFTP.</li>
</ul></div>
`,hi:`
<p>Wapas andhere kamre mein. Aap madad ke liye chillate ho, aur <i>aapke</i> kamre mein sab sunte hain. Lekin reception desk doosri building mein hai. Aapki awaaz deewaron ke paar nahi jaati. Aapko chahiye kamre ke darwaze par ek messenger jo aawaz sune, use ek letter par likhe, "please room 20 ko reply karna" add kare, aur reception ko post kar de. Woh messenger <b>DHCP relay agent</b> hai.</p>

<h3>Broadcasts routers ke paar kyun nahi jaate</h3>
<p>DHCP Discover 255.255.255.255 par jaata hai, <b>limited broadcast</b>. Definition se is address ka matlab hai "is link par sab", aur routers ise kabhi forward nahi karte; har router interface broadcast domain ki boundary hai. Yeh ek feature hai: agar routers broadcasts forward karte, to ek busy subnet poore enterprise ko flood kar deta.</p>
<p>Hamare lab mein, annex (192.168.20.0/24) par PC3 ek Discover bhejta hai. SW-ANNEX use R2 ke Gi0/0 par flood karta hai. R2 DHCP server nahi hai, aur asli server, R1, 10.1.12.0/30 link ke doosri taraf hai. Madad ke bina Discover R2 par mar jaata hai aur PC3 ko 169.254 address milta hai.</p>
<p>Aapne yeh problem inter-VLAN routing module mein dekhi thi, jahan har VLAN apna subnet hai. Fix wahi hai: ya to har router par DHCP server chalao, ya use centralise karo aur <b>relay</b> karo.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="PC3 se R2 ke through R1 tak DHCP relay path">
<rect x="10" y="100" width="90" height="40" rx="8" fill="#bae6fd"/><text x="55" y="125" text-anchor="middle" class="svg-ink" font-size="13">PC3</text>
<rect x="240" y="100" width="100" height="40" rx="8" fill="#bbf7d0"/><text x="290" y="125" text-anchor="middle" class="svg-ink" font-size="13">R2 relay</text>
<rect x="520" y="100" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="575" y="125" text-anchor="middle" class="svg-ink" font-size="13">R1 server</text>
<line x1="100" y1="120" x2="240" y2="120" stroke="#64748b" stroke-width="2"/><line x1="340" y1="120" x2="520" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="170" y="45" text-anchor="middle" class="svg-accent" font-size="12">Discover (broadcast)</text>
<text x="170" y="63" text-anchor="middle" class="svg-muted" font-size="12">0.0.0.0 se 255.255.255.255</text>
<text x="170" y="81" text-anchor="middle" class="svg-muted" font-size="12">UDP 68 se 67</text>
<text x="430" y="45" text-anchor="middle" class="svg-accent" font-size="12">Relayed (unicast)</text>
<text x="430" y="63" text-anchor="middle" class="svg-muted" font-size="12">10.1.12.2 se 10.1.12.1</text>
<text x="430" y="81" text-anchor="middle" class="svg-muted" font-size="12">UDP 67 se 67, giaddr 192.168.20.1</text>
<text x="170" y="170" text-anchor="middle" class="svg-muted" font-size="12">192.168.20.0/24</text>
<text x="430" y="170" text-anchor="middle" class="svg-muted" font-size="12">10.1.12.0/30</text>
<text x="290" y="205" text-anchor="middle" class="svg-ink" font-size="13">Gi0/0: ip helper-address 10.1.12.1</text>
<text x="430" y="235" text-anchor="middle" class="svg-accent" font-size="12">Offer giaddr ko wapas, R2 LAN par deta hai</text>
</svg><p class="cap">Relay ek broadcast ko routed unicast mein badalta hai aur client ka subnet giaddr mein stamp karta hai.</p></div>

<h3>Relay agent kya karta hai, step by step</h3>
<ol>
<li>PC3 Discover broadcast karta hai. R2 use <b>Gi0/0</b> par receive karta hai, woh interface jahan <code>ip helper-address</code> configured hai.</li>
<li>R2 apne receiving interface ka address, <b>192.168.20.1</b>, <b>giaddr</b> field (gateway IP address) mein likhta hai, agar kisi relay ne pehle se na bhara ho. Woh hop count badhata hai.</li>
<li>R2 message ko normal <b>unicast</b> ke roop mein helper address 10.1.12.1 ko bhejta hai, source UDP port 67 aur destination UDP port 67 ke saath. IP source R2 ke outgoing interface ka address (10.1.12.2) hai.</li>
<li>R1 use receive karta hai, giaddr 192.168.20.1 dekhta hai, aur woh pool chunta hai jiska network us address ko contain karta hai: <b>LAN20</b>. Woh 192.168.20.21 offer karta hai.</li>
<li>R1 Offer <b>giaddr ko</b>, 192.168.20.1 ko, bhejta hai. Isliye R1 ke paas 192.168.20.0/24 ka route hona chahiye. Lab mein hai: <code>ip route 192.168.20.0 255.255.255.0 10.1.12.2</code>.</li>
<li>R2 Offer receive karta hai aur annex LAN par PC3 ko deliver karta hai. Request aur Ack same path follow karte hain.</li>
</ol>

<h3>Configuration</h3>
<pre class="code"><span class="c">! R2 par, us interface par jo clients ki taraf hai (uplink NAHI)</span>
R2(config)# interface GigabitEthernet0/0
R2(config-if)# ip helper-address 10.1.12.1
R2(config-if)# end</pre>
<p>Poori relay configuration bas itni hai. Aap kai helpers add kar sakte ho (do DHCP servers ke liye, redundancy ke liye); router har ek ko copy bhejta hai. Helper address server ka koi bhi address ho sakta hai jis tak R2 route kar sake; lab mein yeh R1–R2 link par R1 ka address hai.</p>

<h3>Verification</h3>
<pre class="out">R2# show ip interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet address is 192.168.20.1/24
  Broadcast address is 255.255.255.255
  Address determined by setup command
  MTU is 1500 bytes
  <span class="hl">Helper address is 10.1.12.1</span>
  Directed broadcast forwarding is disabled</pre>
<pre class="out">R1# show ip dhcp binding
Bindings from all pools not associated with VRF:
IP address      Client-ID/              Lease expiration        Type       State      Interface
                Hardware address/
                User name
192.168.10.21   0100.5079.6668.00       Oct 01 2026 09:14 AM    Automatic  Active     GigabitEthernet0/0
<span class="hl">192.168.20.21   0100.5079.6668.02       Oct 01 2026 09:15 AM    Automatic  Active     Unknown</span></pre>
<p>Relayed binding mein interface <b>Unknown</b> dikhta hai: R1 ne us client ka broadcast apne kisi interface par receive nahi kiya. Yeh normal hai.</p>

<h3>Helper DHCP se zyada forward karta hai</h3>
<p><code>ip helper-address</code> ek generic UDP broadcast forwarder hai. Default mein yeh aath UDP services ke broadcasts relay karta hai: <b>TFTP (69), DNS (53), Time (37), NetBIOS name service (137), NetBIOS datagram (138), BOOTP/DHCP server (67), BOOTP/DHCP client (68) aur TACACS (49)</b>. List ko <code>no ip forward-protocol udp 37</code> se chhota kar sakte ho, ya <code>ip forward-protocol udp PORT</code> se port add kar sakte ho.</p>

<div class="eg"><p><b>Worked example: giaddr ka decision.</b> R1 ke paas LAN10 (192.168.10.0/24) aur LAN20 (192.168.20.0/24) hain. Ek relayed Discover source 10.1.12.2 aur giaddr 192.168.20.1 ke saath aata hai. Pool selection ke liye source address ignore hota hai; 192.168.20.1 LAN20 mein aata hai, isliye offer 192.168.20.21 hai gateway 192.168.20.1 ke saath. Agar R2 ne galti se helper Gi0/1 par daala hota, to use PC3 ka broadcast kabhi dikhta hi nahi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) <code>ip helper-address</code> client wale interface ki jagah uplink par configure karna. (2) Helper address mein typo (10.1.12.1 ki jagah 10.1.21.1) — yeh troubleshoot lab ke faults mein se ek hai. (3) Server par client subnet ka wapas route na hona, to Offers kabhi wapas nahi aate. (4) Path par ACL jo UDP 67 block kare. (5) Relay router par <code>no service dhcp</code>, jo relaying bhi band kar deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Relay us interface par jaata hai jahan <b>clients</b> hain (woh router ya SVI jo unka default gateway hai). giaddr = relay ke client-facing interface ka IP, aur server isse pool chunta hai. Relayed traffic unicast UDP 67 se 67 hai.</p></div>

<div class="scn"><h4>Naya VLAN, koi address nahi</h4><p>Ek engineer ne core switch par naye lab ke liye VLAN 30 add kiya, SVI 192.168.30.1/24 banaya, aur server team se 192.168.30.0/24 scope add karne ko kaha. Lab ke har PC par 169.254 dikha. Server team ko ek bhi Discover nahi dikha. SVI par <code>ip helper-address</code> nahi tha; baaki SVIs par tha. Helper add karne ke baad server ko Discovers dikhe, lekin leases ab bhi nahi: scope 192.168.3.0/24 ban gaya tha. Dono theek hone par lab up aa gaya.</p><p><b>Seekh:</b> har naye client subnet ko do cheezein chahiye: uske gateway par helper aur server par matching scope. Dono sides check karo.</p></div>

<div class="iv"><p class="q">"Humein ip helper-address kyun chahiye, aur server ko kaise pata chalta hai kaunsa pool use kare?"</p><p>DHCP Discover limited broadcast hai aur routers broadcasts forward nahi karte. Client-facing interface par helper use server ko unicast mein badalta hai aur giaddr mein us interface ka IP bharta hai. Server giaddr ko pool se match karta hai, giaddr ko reply karta hai, aur relay reply LAN par deliver karta hai. Return route, default aath UDP ports, aur relayed bindings mein interface Unknown dikhne ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routers 255.255.255.255 broadcast forward nahi karte, isliye remote DHCP ko relay chahiye.</li>
<li><code>ip helper-address SERVER</code> client-facing interface par jaata hai.</li>
<li>Relay giaddr = apna client-facing IP likhta hai; server giaddr se pool chunta hai.</li>
<li>Server giaddr ko reply karta hai, isliye use client subnet ka wapas route chahiye.</li>
<li>Helper default mein aath UDP services forward karta hai, jinmein DHCP, DNS aur TFTP shamil hain.</li>
</ul></div>
`}};export{e as default};