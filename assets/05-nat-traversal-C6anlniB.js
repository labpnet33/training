var e={id:`nat-traversal`,h:{en:`NAT traversal: STUN, public and private TLOC addresses`,hi:`NAT traversal: STUN, public aur private TLOC addresses`},body:{en:`
<p>Imagine a friend living in a hostel. You cannot call his room directly. You can only call the reception number, and the receptionist connects you if your friend has already called you first. The room number is his <b>private address</b>; the reception number is his <b>public address</b>. <b>NAT</b> (Network Address Translation) is that reception desk. Most internet circuits at branches sit behind NAT: a broadband router, a firewall or a carrier-grade NAT translates private addresses to a public one.</p>
<p>SD-WAN has to build tunnels between two edges that may both be behind NAT, with no central person to ask. This chapter shows how it works.</p>

<h3>The problem</h3>
<p>If E-BLR-1 is behind a broadband router, its interface address might be 192.168.50.2 (private). E-DEL-1 cannot send a packet to 192.168.50.2 over the internet. It needs the <b>public</b> address and port that the NAT device uses for E-BLR-1, and the NAT device must be willing to forward the traffic.</p>

<h3>The solution: STUN, the Validator and hole punching</h3>
<ol>
<li><b>Discover.</b> When the edge talks to the Validator, the Validator tells it what source address and port it sees. This is a <b>STUN</b>-style reflection: "you look like 203.0.113.14, port 12346 from outside". The edge now knows its <b>public IP and port</b> as well as its <b>private IP and port</b>.</li>
<li><b>Advertise.</b> The edge puts both pairs into its TLOC and sends it to the Controller. Every other edge receives the TLOC with both addresses.</li>
<li><b>Punch.</b> To build a tunnel, both edges start sending packets to each other's public address at the same time. Each outbound packet creates a mapping in its own NAT device, and the return packet from the other side then matches that mapping and is let in. This is called <b>hole punching</b>.</li>
<li><b>Choose the address.</b> Between two <b>private</b> colors (such as mpls) the private addresses are used, because no NAT is assumed. If either side has a <b>public</b> color, the public address is used.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="NAT traversal with STUN">
<rect x="10" y="90" width="130" height="80" rx="8" fill="#e2e8f0"/><text x="75" y="115" text-anchor="middle" class="svg-ink" font-size="13">E-BLR-1</text><text x="75" y="135" text-anchor="middle" class="svg-muted" font-size="12">private 192.168.50.2</text><text x="75" y="153" text-anchor="middle" class="svg-muted" font-size="12">port 12346</text>
<rect x="170" y="100" width="100" height="60" rx="8" fill="#fed7aa"/><text x="220" y="125" text-anchor="middle" class="svg-ink" font-size="13">NAT device</text><text x="220" y="145" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.14</text>
<rect x="300" y="10" width="140" height="60" rx="8" fill="#bae6fd"/><text x="370" y="35" text-anchor="middle" class="svg-ink" font-size="13">VBOND</text><text x="370" y="55" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.30</text>
<rect x="300" y="190" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="370" y="215" text-anchor="middle" class="svg-ink" font-size="13">VSMART</text><text x="370" y="235" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.20</text>
<rect x="480" y="90" width="150" height="80" rx="8" fill="#e2e8f0"/><text x="555" y="115" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1</text><text x="555" y="135" text-anchor="middle" class="svg-muted" font-size="12">public 203.0.113.6</text><text x="555" y="153" text-anchor="middle" class="svg-muted" font-size="12">port 12346</text>
<line x1="140" y1="130" x2="170" y2="130" stroke="#64748b" stroke-width="2"/><line x1="270" y1="115" x2="320" y2="70" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/><line x1="270" y1="150" x2="320" y2="190" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<line x1="270" y1="130" x2="480" y2="130" stroke="#16a34a" stroke-width="3"/>
<text x="338" y="95" class="svg-muted" font-size="11">1 STUN: you are 203.0.113.14</text><text x="330" y="180" class="svg-muted" font-size="11">2 TLOC with both addresses</text><text x="320" y="122" text-anchor="middle" class="svg-accent" font-size="12">3 IPsec + BFD hole punched</text>
</svg><p class="cap">The Validator reveals the public address, the Controller shares it, and the edges punch through NAT.</p></div>

<h3>NAT types and why symmetric NAT hurts</h3>
<p>NAT devices behave differently. What matters is whether the public port is the <b>same</b> for every destination or <b>changes</b> per destination.</p>
<table class="cmp"><tr><th>NAT type</th><th>Behaviour</th><th>SD-WAN result</th></tr>
<tr><td>Full cone</td><td>One public port for a private port; any outside host may send to it</td><td>Works</td></tr>
<tr><td>Address-restricted cone</td><td>Same public port; only hosts that were contacted may reply</td><td>Works with hole punching</td></tr>
<tr><td>Port-restricted cone</td><td>Same public port; only the exact IP and port contacted may reply</td><td>Works with hole punching</td></tr>
<tr><td>Symmetric</td><td>A <b>different</b> public port for each destination</td><td>The port the Validator saw is wrong for other peers, so direct tunnels often fail</td></tr></table>
<p>With symmetric NAT, the port learned from the Validator is valid only for that one destination. Another edge sends to that port and nothing matches. Two edges both behind symmetric NAT cannot build a direct tunnel. Cisco publishes a table of which NAT type combinations work; the safe design rules are these: avoid symmetric NAT on SD-WAN circuits, give hubs and data center edges a public address or a static one-to-one NAT, and let spokes behind difficult NAT reach each other through the hub.</p>

<h3>Ports</h3>
<p>The base DTLS and IPsec-tunnel UDP port is <b>12346</b>. When an edge has several TLOCs, each uses an offset, so the second TLOC in the lab shows 12366. If a connection to the Controller fails, the edge can <b>port-hop</b>, trying other source ports to find one that the NAT or firewall lets through. On a firewall in front of a site, permit UDP 12346 and the nearby hop range in both directions to the Controllers and other edges.</p>

<h3>Controllers and hubs behind NAT</h3>
<p>The Validator, Manager and Controller can also live behind static NAT in a data center. In that case each one is configured with its <b>private</b> address and the outside world reaches the <b>public</b> address through a static NAT rule. The edge learns the public address of each Controller from the Validator. The same approach is used for hub edges: give them a fixed public address or static NAT and the spokes can find them.</p>

<h3>Verification</h3>
<p>Compare the public and private columns. If they differ, a NAT sits in the path.</p>
<pre class="out">E-BLR-1# show sdwan omp tlocs
ADDRESS                                                     PSEUDO              PUBLIC              PRIVATE BFD
FAMILY  TLOC IP     COLOR        ENCAP FROM PEER    STATUS  KEY    PUBLIC IP    PORT   PRIVATE IP   PORT    STATUS
-------------------------------------------------------------------------------------------------------------------
ipv4    10.255.0.13 biz-internet ipsec 0.0.0.0      C,Red,R 1      <span class="hl">203.0.113.14  12346  192.168.50.2 12346</span>   -

E-BLR-1# show sdwan control local-properties
...
INTERFACE         PUBLIC IPv4    PUBLIC PORT PRIVATE IPv4   PRIVATE PORT COLOR        STATE
GigabitEthernet1  203.0.113.14   12346       192.168.50.2   12346        biz-internet up</pre>
<p><code>show sdwan control local-properties</code> also has a NAT type column. A type that says the mapping is endpoint-independent is the friendly one; the symmetric types are the ones to avoid.</p>

<div class="warn"><p><b>Common mistakes.</b> Blocking UDP 12346 and the hop range on a branch firewall; assuming MPLS also needs public addresses (private colors do not); putting a hub edge behind a symmetric or overloaded NAT; and forgetting that a name-based Validator needs DNS before STUN can even start.</p></div>
<div class="exam"><p><b>Exam trap.</b> The Validator provides the STUN function and learns each edge's public address; the Controller then distributes it inside the TLOC. Symmetric NAT is the case where hole punching fails.</p></div>

<div class="scn"><h4>Bengaluru works, but only through Delhi</h4><p>The new Bengaluru branch used a cheap broadband router. Control connections were up and E-BLR-1 reached Delhi fine, but traffic to Mumbai was slow because it went through Delhi. <code>show sdwan bfd sessions</code> had no direct BLR to MUM session. The TLOC showed a different public port for each peer: the broadband router did symmetric NAT. The fix was to replace the router with a business-grade one that does port-preserving NAT. Until then, policy kept the branch spoke-to-spoke traffic via the Delhi hub.</p><p><b>Lesson:</b> compare public and private addresses in the TLOC and know your NAT type.</p></div>

<div class="iv"><p class="q">"How does an edge behind NAT build a tunnel to another edge?"</p><p>Strong answer: the Validator tells the edge its public IP and port (STUN). The edge advertises both public and private addresses in its TLOC through the Controller. Both ends then send packets to each other's public address, creating NAT mappings (hole punching). Mention the base port 12346, port hopping, private versus public colors, and that symmetric NAT breaks direct tunnels.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The Validator reveals each edge's public address and port; the TLOC carries both public and private pairs.</li>
<li>Private colors use private IPs; anything with a public color uses the public IP.</li>
<li>Edges punch holes by sending to each other's public address at the same time.</li>
<li>Symmetric NAT changes the port per destination and breaks direct tunnels.</li>
<li>Give hubs a fixed public address or static NAT; permit UDP 12346 and the hop range.</li>
</ul></div>
`,hi:`
<p>Ek hostel mein rehne wale dost ki kalpana karo. Aap uske room mein seedha call nahi kar sakte. Aap sirf reception number laga sakte ho, aur receptionist tabhi connect karta hai jab aapke dost ne pehle aapko call kiya ho. Room number uska <b>private address</b> hai; reception number uska <b>public address</b>. <b>NAT</b> (Network Address Translation) wahi reception desk hai. Branches ke zyada tar internet circuits NAT ke peeche hote hain: broadband router, firewall ya carrier-grade NAT private addresses ko ek public address mein translate karta hai.</p>
<p>SD-WAN ko do aise edges ke beech tunnel banana hota hai jo dono NAT ke peeche ho sakte hain, aur poochne ke liye koi central insaan nahi hota. Yeh chapter dikhata hai ki yeh kaise kaam karta hai.</p>

<h3>Problem</h3>
<p>Agar E-BLR-1 broadband router ke peeche hai, to uska interface address 192.168.50.2 (private) ho sakta hai. E-DEL-1 internet par 192.168.50.2 ko packet nahi bhej sakta. Use woh <b>public</b> address aur port chahiye jo NAT device E-BLR-1 ke liye use karta hai, aur NAT device traffic forward karne ko taiyaar hona chahiye.</p>

<h3>Solution: STUN, Validator aur hole punching</h3>
<ol>
<li><b>Discover.</b> Jab edge Validator se baat karta hai, Validator use batata hai ki use kaunsa source address aur port dikh raha hai. Yeh <b>STUN</b>-style reflection hai: "bahar se tum 203.0.113.14, port 12346 jaise dikhte ho". Ab edge ko apna <b>public IP aur port</b> pata hai, saath mein <b>private IP aur port</b> bhi.</li>
<li><b>Advertise.</b> Edge dono pairs ko apne TLOC mein daal kar Controller ko bhejta hai. Har doosre edge ko TLOC dono addresses ke saath milta hai.</li>
<li><b>Punch.</b> Tunnel banane ke liye dono edges ek hi waqt par ek dusre ke public address par packets bhejna shuru karte hain. Har outbound packet apne NAT device mein mapping banata hai, aur doosri taraf se aane wala return packet us mapping se match karke andar jaane diya jaata hai. Ise <b>hole punching</b> kehte hain.</li>
<li><b>Address chuno.</b> Do <b>private</b> colors (jaise mpls) ke beech private addresses use hote hain, kyunki NAT maana nahi jaata. Agar kisi ek taraf <b>public</b> color hai to public address use hota hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="STUN ke saath NAT traversal">
<rect x="10" y="90" width="130" height="80" rx="8" fill="#e2e8f0"/><text x="75" y="115" text-anchor="middle" class="svg-ink" font-size="13">E-BLR-1</text><text x="75" y="135" text-anchor="middle" class="svg-muted" font-size="12">private 192.168.50.2</text><text x="75" y="153" text-anchor="middle" class="svg-muted" font-size="12">port 12346</text>
<rect x="170" y="100" width="100" height="60" rx="8" fill="#fed7aa"/><text x="220" y="125" text-anchor="middle" class="svg-ink" font-size="13">NAT device</text><text x="220" y="145" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.14</text>
<rect x="300" y="10" width="140" height="60" rx="8" fill="#bae6fd"/><text x="370" y="35" text-anchor="middle" class="svg-ink" font-size="13">VBOND</text><text x="370" y="55" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.30</text>
<rect x="300" y="190" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="370" y="215" text-anchor="middle" class="svg-ink" font-size="13">VSMART</text><text x="370" y="235" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.20</text>
<rect x="480" y="90" width="150" height="80" rx="8" fill="#e2e8f0"/><text x="555" y="115" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1</text><text x="555" y="135" text-anchor="middle" class="svg-muted" font-size="12">public 203.0.113.6</text><text x="555" y="153" text-anchor="middle" class="svg-muted" font-size="12">port 12346</text>
<line x1="140" y1="130" x2="170" y2="130" stroke="#64748b" stroke-width="2"/><line x1="270" y1="115" x2="320" y2="70" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/><line x1="270" y1="150" x2="320" y2="190" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<line x1="270" y1="130" x2="480" y2="130" stroke="#16a34a" stroke-width="3"/>
<text x="338" y="95" class="svg-muted" font-size="11">1 STUN: tum 203.0.113.14 ho</text><text x="330" y="180" class="svg-muted" font-size="11">2 dono addresses ke saath TLOC</text><text x="320" y="122" text-anchor="middle" class="svg-accent" font-size="12">3 IPsec + BFD hole punch</text>
</svg><p class="cap">Validator public address batata hai, Controller use share karta hai, aur edges NAT ke aar-paar punch karte hain.</p></div>

<h3>NAT types aur symmetric NAT kyun nuksaan karta hai</h3>
<p>NAT devices alag-alag tarah behave karte hain. Matter yeh karta hai ki public port har destination ke liye <b>same</b> rehta hai ya har destination par <b>badal</b> jaata hai.</p>
<table class="cmp"><tr><th>NAT type</th><th>Behaviour</th><th>SD-WAN result</th></tr>
<tr><td>Full cone</td><td>Ek private port ke liye ek public port; koi bhi outside host bhej sakta hai</td><td>Chalta hai</td></tr>
<tr><td>Address-restricted cone</td><td>Same public port; sirf jinhe contact kiya gaya woh reply kar sakte hain</td><td>Hole punching se chalta hai</td></tr>
<tr><td>Port-restricted cone</td><td>Same public port; sirf exact IP aur port jise contact kiya woh reply kar sakta hai</td><td>Hole punching se chalta hai</td></tr>
<tr><td>Symmetric</td><td>Har destination ke liye <b>alag</b> public port</td><td>Validator ne jo port dekha woh doosre peers ke liye galat hai, isliye direct tunnels aksar fail hote hain</td></tr></table>
<p>Symmetric NAT mein Validator se seekha port sirf us ek destination ke liye valid hota hai. Doosra edge us port par bhejta hai aur kuch match nahi hota. Dono edges symmetric NAT ke peeche hon to direct tunnel nahi ban sakta. Cisco ek table publish karta hai ki kaunse NAT type combinations kaam karte hain; safe design rules yeh hain: SD-WAN circuits par symmetric NAT avoid karo, hubs aur data center edges ko public address ya static one-to-one NAT do, aur mushkil NAT ke peeche wale spokes ko hub ke through ek dusre tak pahunchne do.</p>

<h3>Ports</h3>
<p>Base DTLS aur IPsec-tunnel UDP port <b>12346</b> hai. Jab edge ke kai TLOCs hote hain to har ek offset use karta hai, isliye lab mein doosra TLOC 12366 dikhata hai. Agar Controller ka connection fail ho jaye, to edge <b>port-hop</b> kar sakta hai, yaani doosre source ports try karta hai taaki koi aisa mile jo NAT ya firewall jaane de. Site ke aage firewall par UDP 12346 aur paas ki hop range ko Controllers aur doosre edges ke liye dono directions mein permit karo.</p>

<h3>NAT ke peeche Controllers aur hubs</h3>
<p>Validator, Manager aur Controller bhi data center mein static NAT ke peeche ho sakte hain. Us case mein har ek apne <b>private</b> address se configure hota hai aur bahar ki duniya static NAT rule se <b>public</b> address tak pahunchti hai. Edge har Controller ka public address Validator se seekhta hai. Yahi approach hub edges ke liye use hoti hai: unhe fixed public address ya static NAT do aur spokes unhe dhoondh lenge.</p>

<h3>Verification</h3>
<p>Public aur private columns compare karo. Agar alag hain to raste mein NAT hai.</p>
<pre class="out">E-BLR-1# show sdwan omp tlocs
ADDRESS                                                     PSEUDO              PUBLIC              PRIVATE BFD
FAMILY  TLOC IP     COLOR        ENCAP FROM PEER    STATUS  KEY    PUBLIC IP    PORT   PRIVATE IP   PORT    STATUS
-------------------------------------------------------------------------------------------------------------------
ipv4    10.255.0.13 biz-internet ipsec 0.0.0.0      C,Red,R 1      <span class="hl">203.0.113.14  12346  192.168.50.2 12346</span>   -

E-BLR-1# show sdwan control local-properties
...
INTERFACE         PUBLIC IPv4    PUBLIC PORT PRIVATE IPv4   PRIVATE PORT COLOR        STATE
GigabitEthernet1  203.0.113.14   12346       192.168.50.2   12346        biz-internet up</pre>
<p><code>show sdwan control local-properties</code> mein NAT type column bhi hota hai. Jo type batata hai ki mapping endpoint-independent hai woh friendly wala hai; symmetric types avoid karne wale hain.</p>

<div class="warn"><p><b>Common mistakes.</b> Branch firewall par UDP 12346 aur hop range block karna; yeh maan lena ki MPLS ko bhi public addresses chahiye (private colors ko nahi chahiye); hub edge ko symmetric ya overloaded NAT ke peeche rakhna; aur yeh bhool jaana ki name-based Validator ko STUN shuru hone se pehle bhi DNS chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> STUN function Validator deta hai aur har edge ka public address seekhta hai; Controller phir use TLOC ke andar distribute karta hai. Symmetric NAT woh case hai jahan hole punching fail hoti hai.</p></div>

<div class="scn"><h4>Bengaluru chalta hai, par sirf Delhi ke through</h4><p>Naye Bengaluru branch ne sasta broadband router use kiya. Control connections up the aur E-BLR-1 Delhi tak theek pahunch raha tha, lekin Mumbai ka traffic slow tha kyunki woh Delhi ke through ja raha tha. <code>show sdwan bfd sessions</code> mein BLR se MUM ka direct session nahi tha. TLOC mein har peer ke liye alag public port dikha: broadband router symmetric NAT kar raha tha. Fix yeh tha ki router ko business-grade wale se badla jo port-preserving NAT karta hai. Tab tak policy ne branch ka spoke-to-spoke traffic Delhi hub ke through rakha.</p><p><b>Seekh:</b> TLOC mein public aur private addresses compare karo aur apna NAT type jaano.</p></div>

<div class="iv"><p class="q">"NAT ke peeche wala edge doosre edge tak tunnel kaise banata hai?"</p><p>Strong answer: Validator edge ko uska public IP aur port batata hai (STUN). Edge public aur private dono addresses apne TLOC mein Controller ke zariye advertise karta hai. Phir dono ends ek dusre ke public address par packets bhejte hain, jisse NAT mappings ban jaate hain (hole punching). Base port 12346, port hopping, private versus public colors batao, aur yeh bhi ki symmetric NAT direct tunnels tod deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Validator har edge ka public address aur port batata hai; TLOC public aur private dono pairs rakhta hai.</li>
<li>Private colors private IPs use karte hain; public color wali har cheez public IP.</li>
<li>Edges ek hi waqt par ek dusre ke public address par bhejkar holes punch karte hain.</li>
<li>Symmetric NAT har destination par port badalta hai aur direct tunnels tod deta hai.</li>
<li>Hubs ko fixed public address ya static NAT do; UDP 12346 aur hop range permit karo.</li>
</ul></div>
`}};export{e as default};